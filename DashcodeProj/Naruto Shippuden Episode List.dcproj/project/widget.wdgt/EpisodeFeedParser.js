/*
EpisodeParser.js contains 
Episode class
EpisodeFeedParser class
*/

/*
	Episode Class:
	==============
	Model object, each episode information will be stores in objects from this class
	
	@public	
	number		: int 
	titleJa		: String
	titleRomaji	: String
	titleEn		: String
	airedDateJa	: String
	airedDateEn	: String
*/
var Episode = function(number, titleJa, titleRomaji, titleEn, airedDateJa, airedDateEn){
	this.number = number;
	var japanese = titleJa.replace("(",""); japanese = japanese.replace(")","");
		japanese = japanese.replace("（",""); japanese = japanese.replace("）","");
	this.titleJa = japanese;
	this.titleRomaji = titleRomaji;
	this.titleEn = titleEn;
	this.airedDateJa = airedDateJa;
	this.airedDateEn = airedDateEn;
};

/*Episode.prototype.description = function(){
	return ("number: " + this.number +
				", titleJa: " + this.titleJa +
				", titleRomaji: " + this.titleRomaji + 
				", titleEn: " + this.titleEn +
				", airedDateJa: " + this.airedDateJa +
				", airedDateEn: " + this.airedDateEn);
};
*/

/*
	EpisodeFeedParser Class:
	========================
	Fetches and Parses WikiHTML and call its callbacks in the correspondant time
	Its implementation model is inspired of NSXMLparser and its
	delegate NSXMLParserDelegate of Apple's Foundation framework 
	but this is for the specfic case of Episodes.
	
	@public
	url 					: String
	didStartCallback 		: function(EpisodeFeedParser) 	//optional
	didEndCallback 			: function(EpisodeFeedParser) 	//optional
	didFindEpisodeCallback 	: function(Episode)  			//optional
	didFailCallback 		: function(Error)				//optional
	parse()
*/
var EpisodeFeedParser = function(url){
	this._url = this.setUrl(url);
	this._lastUpdated = null;
	
	this.didStartCallback = null;
	this.didFindEpisodeCallback = null;
	this.didEndCallback = null;
	this.didFailCallback = null;

};
EpisodeFeedParser.prototype.setUrl = function(url){
	if (url && url.length) {
        url = url.replace(/^(feed:\/\/)/, "");
        if (url.substring(0, 7).toLowerCase() !== "http://") {
            url = "http://" + url;
        }
		this._url = url;
    }
};
EpisodeFeedParser.prototype._parseDocument = function(doc){
	try{
		if (doc && doc.documentElement) {
			this._parseDocumentHTMLWikiNaruto(doc);
		}else {
            throw new Error(dashcode.getLocalizedString("Failed to load a valid feed."));
        }
		
	}catch (ex) {
        console.log("Exception!! " + ex);
    }
};
EpisodeFeedParser.prototype._parseDocumentHTMLWikiNaruto = function(doc){
	
	//for some reason entries in wikipedia has "vevent" class name
	var candidates = doc.getElementsByClassName("vevent"); 
	var curIndex = 0;
	
	//var index = 0;
	for (var index = 0; index < candidates.length; index++){
		var trElement = candidates[index];
		var tds = trElement.getElementsByTagName("td");
		
		var epNumber = parseInt(tds[0].innerHTML, 10); //string is in decimal system
		
		if (epNumber > curIndex && tds.length > 2){
			//parse tr and add new entry
			curIndex++;
			var epTitleEn = (tds[1].getElementsByTagName("b"))[0].innerHTML;
			var epTitleRo = (tds[1].getElementsByTagName("i"))[0].innerHTML;
			var	epTitleJp = (tds[1].getElementsByTagName("span"))[0].innerHTML;
			var epAiredDateJp = tds[2].innerHTML;
			
			var subs = tds[3].getElementsByTagName("sup");
			while ( subs.length > 0 ){
				tds[3].removeChild(subs[subs.length-1]);
			}
			var epAiredDateEn = (tds[3] && tds[3].innerHTML.length > 0)? tds[3].innerHTML : "Not aired yet.";
			
			var ep = new Episode(epNumber, epTitleJp, epTitleRo, epTitleEn, epAiredDateJp, epAiredDateEn);
			this.didFindEpisodeCallback(this, ep);
			
		}else{
			break;
		}
	}
};
EpisodeFeedParser.prototype.parse = function(){

	var xmlRequest = new XMLHttpRequest();
    xmlRequest.overrideMimeType("text/xml");
    xmlRequest.open("GET", this._url, true);

	var self = this;
    xmlRequest.onreadystatechange = function () {
    
    	switch(xmlRequest.readyState) {
    		case 0: //console.log("0. uninitialized");
    				break;
    		
    		case 1: //console.log("1. loading"); 
    				break;
    				
    		case 2: //console.log("2. loaded"); 
    				self.didStartCallback(self); 
    				break;
    				
    		case 3: //console.log("3. interactive"); 
    				break;
    				
    		case 4: //console.log("4. complete"); 
    				if (xmlRequest.status == 200) {// only if "OK"
    					var doc = xmlRequest.responseXML;
    					self._parseDocument(doc);
    					self._lastUpdated = (new Date).getTime();
    					self.didEndCallback(self);
    				}else{
    					self.didFailCallback(self);
    					self.didEndCallback(self);
    				}
    				break;
    		default: break;
    				
    	}
    };
    xmlRequest.send(null);
};
