/*
	EpisodeController Class:
	========================
	
	episodes : array of Episode objects
	parser : EpisodeFeedParser
		
	
*/
var EpisodeController = function(){

	this.desc = "EPISODE_CONTROLLER";

	this.episodes = new Array();
	this.parser = null; //lazy

};
EpisodeController.prototype.parserDidStart = function(parser){
	console.log("parserDidStart");
};
EpisodeController.prototype.parserDidFindEpisode = function(parser, episode){ 
	console.log("parserDidFindEpisode");
	
	this.episodes.push(episode);
	
	console.log(episode.description());
};
EpisodeController.prototype.parserDidEnd = function(parser){
	console.log("parserDidEnd");
};
EpisodeController.prototype.parserDidFail = function(parser){
	console.log("parserDidFail");
};
EpisodeController.prototype.fetchEpisodes = function(urlString){
	console.log("fetchEpisodes");
	
	if(urlString !== undefined){
		if(parser === undefined){
			var parser = new EpisodeFeedParser();
			parser.setUrl(urlString);
			/*
			// This is wrong! it creates a Context problem.
			// see: http://stackoverflow.com/questions/5639451/why-this-is-not-this/5692094#5692094
			parser.didStartCallback = this.parserDidStart;
			parser.didFindEpisodeCallback = this.parserDidFindEpisode;
			parser.didEndCallback = this.parserDidEnd;
			parser.didFailCallback = this.parserDidFail;
			*/
			var that = this;
			parser.didStartCallback = function(parser){that.parserDidStart(parser);};
			parser.didFindEpisodeCallback = function(parser, episode){that.parserDidFindEpisode(parser, episode);};
			parser.didEndCallback = function(parser){that.parserDidEnd(parser);};
			parser.didFailCallback = function(parser){that.parserDidFail(parser);};
			
			this.parser = parser;
		}
		this.parser.parse();
	}
};


function test(){
	//EpisodeController is not implemented in the widget since main.js plays the same role as a Controller would be.
	var controller = new EpisodeController();
	controller.fetchEpisodes("http://en.wikipedia.org/wiki/List_of_Naruto:_Shippuden_episodes");
}