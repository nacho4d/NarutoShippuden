/*
	Episode Class:
	==============
	
	@public	
	number: int 
	titleJa: String
	titleRomaji: String
	titleEn: String
	airedDateJa: Date
	airedDateEn: Date
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
}
Episode.prototype.description = function(){
	return ("number: " + this.number +
				", titleJa: " + this.titleJa +
				", titleRomaji: " + this.titleRomaji + 
				", titleEn: " + this.titleEn +
				", airedDateJa: " + this.airedDateJa +
				", airedDateEn: " + this.airedDateEn);
}

/*
	EpisodeFeedParser Class:
	=================
	
	@public
	url : String
	didStartCallback : function(EpisodeFeedParser) //optional
	didEndCallback : function(EpisodeFeedParser) //optional
	didFindEpisode : function(Episode)  //optional
	didFailParsing : function(Error)
	parse()
*/
var EpisodeFeedParser = function(url){
	this._url = this.setUrl(url);
	this._lastUpdated = null;
	this.didStartCallback = null;
	this.didEndCallback = null;
	this.didFindEpisode = null;
	this.didFailParsing = null;
}
EpisodeFeedParser.prototype.setUrl = function(url){
	if (url && url.length) {
        url = url.replace(/^(feed:\/\/)/, "");
        if (url.substring(0, 7).toLowerCase() != "http://") {
            url = "http://" + url;
        }
		this._url = url;
    }
}
EpisodeFeedParser.prototype.parse = function(){

	var xmlRequest = new XMLHttpRequest();
    xmlRequest.overrideMimeType("text/xml");
    xmlRequest.open("GET", this._url, true);

	var self = this;
    xmlRequest.onreadystatechange = function () {
    	switch(xmlRequest.readyState) {
    		case 0: break;
    		case 1: console.log("1. loading");
    		case 2: console.log("2. loaded");
    		case 3: console.log("3. interactive");
    		case 4: console.log("4. complete");
    	}
        if (xmlRequest.readyState == 4) {
			
			self._parseDocument(xmlRequest.responseXML);
			//processHTMLWikiNaruto(xmlRequest.responseXML);
			
			//process responseXML here
			//process html document 
			//get Episodes from wiki html
        }
    };

    xmlRequest.send(null);
    
}
EpisodeFeedParser.prototype._parseDocument = function(doc){
	var log = document.getElementById('log');
	log.innerHTML += doc;

	try{
		if (doc && doc.documentElement) {
			this._parseHTMLWikiNarutoDocument(doc);
		}
		else {
            throw new Error(dashcode.getLocalizedString("Failed to load a valid feed."));
        }
		if (entries && entries.length) {
			//elements should be shown here
			
			//showElement("backButton");
			//showElement("forwardButton");
			//showEntry(getNextInmediateEntryIndex());
            
            this._lastUpdated = (new Date).getTime();
    
        }
        else {
            throw new Error("Feed contains no entries.");
        }
	
	
	}catch (ex) {
        showError(ex);
    }

}
EpisodeFeedParser.prototype._parseDocumentHTMLWikiNaruto = function(doc){
	
	//for some reason entries in wikipedia has "vevent" class name
	var candidates = doc.getElementsByClassName("vevent"); 
	var curIndex = 0;
	
	for (var index = 0; index < candidates.length; index++){
		var trElement = candidates[index];
		var tds = trElement.getElementsByTagName("td");
		
		var epNumber = parseInt(tds[0].innerHTML);
		
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
			
			var ep = Episode(epNumber, epTitleJp, epTitleRo, epTitleEn, epAiredDateJp, epAiredDateEn);
			
			this.didFindEpisode(ep);
			
			//entries.push(entry);
			
		}else{
			break;
		}
	}
}



function testEpisode(){

	var log = document.getElementById('log');

	var ep1 = new Episode();
	log.innerHTML += ep1.description();
	log.innerHTML += "</br>";
	
	var ep2 = new Episode(1, 'タイトル', 'Taitoru', 'Title', Date(), Date());
	log.innerHTML += ep2.description();
	
	var wikiParser = new EpisodeFeedParser();
	wikiParser.setUrl("http://en.wikipedia.org/wiki/List_of_Naruto:_Shippuden_episodes");
	wikiParser.parse();
	
}