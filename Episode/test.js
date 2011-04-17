var EpisodeFeedParser = function(url){
	this.url = url;
	this.didStartCallback = null;
};
EpisodeFeedParser.prototype.parse = function(doc){
    this.didStartCallback(this);
};

var EpisodeController = function(){
	this.episodes = new Array();
	this.parser = null; //lazy
};
EpisodeController.prototype.parserDidStart = function(parser){
	//this is not this
	console.log("here *this* is not of type EpisodeController but it is EpisodeFeedParser Why?");
	this.testEpisode();
	
};
EpisodeController.prototype.fetchEpisodes = function(urlString){
	if(urlString !== undefined){
		if(parser === undefined){
			var parser = new EpisodeFeedParser(urlString);
			var that = this;
			parser.didStartCallback = function(parser){that.parserDidStart(parser)};
			this.parser = parser;
		}
		this.parser.parse();
	}
};
EpisodeController.prototype.testEpisode = function(){
	console.log("it worked!");
}


function testEpisode(){

	// Sample code of the following question: 
	// http://stackoverflow.com/questions/5639451/why-this-is-not-this/5692094#5692094
	// Be aware of javascript context and function assignation/bind!!

	var controller = new EpisodeController();
	controller.fetchEpisodes("myurl");
	
	
}
