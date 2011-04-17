// Values for feed type in the attributes panel
var DFFeedTypeHTML = 0;
var DFFeedTypeImage = 1;

// Define some namespaces commonly used in feeds
var NS_DC = "http://purl.org/dc/elements/1.1/";
var NS_CONTENT = "http://purl.org/rss/1.0/modules/content/";

// ivars
var parser = null;			// EpisodeFeedParser object. Initialized lazily.
var episodes = null;		// Array object. Initialized lazily.
var curEpisodeIndex = -1;	// current showing episode index

var lastUpdated = 0;		// Date: Track last refresh time to avoid excessive updates

// ***********************************************************************
// ********************   DOM, etc Helpers   *****************************
// ***********************************************************************

function hideElement(elementId)
{
    var element = document.getElementById(elementId);
    if (element) { element.style.display = "none"; }
}
function showElement(elementId)
{
    var element = document.getElementById(elementId);
    if (element) { element.style.display = "block"; }
}
function clearElement(elementId)
{
    var element = document.getElementById(elementId);
    if (element) {
        while (element.hasChildNodes()) {
            element.removeChild(element.firstChild);
        }
    }
}

function showLocalizedMessage(message){

	// get message and element
	var localizedMessage = dashcode.getLocalizedString(message);
	var dateText = document.getElementById("epAiredDate");
    
	// set the message into the element if ok
	if (dateText) {
        if (localizedMessage != null) {
            if (typeof(localizedMessage) == "string") {
                dateText.innerText = localizedMessage;
            }
        }
	}
	
	//hide navigation elements
    hideElement("forwardButton");
    hideElement("backButton");
}


// *************************************************************
// ********************   PARSER   *****************************
// *************************************************************

function fetchEpisodes()
{
	if(!parser){
		var url = attributes.feedURL;
		//var url = "http://en.wikipedia.org/wiki/List_of_Naruto:_Shippuden_episodes";
		parser = new EpisodeFeedParser();
		parser.setUrl(url);

		parser.didStartCallback = function(parser)
		{
			showLocalizedMessage("Loading ... ");
			if(episodes){
				episodes.length = 0;
				curEpisodeIndex = -1;
			}
		};
		
		parser.didFindEpisodeCallback = function(parser, episode)
		{
			if (!episodes){	episodes = new Array(); }
			//console.debug(episode.description()); //description is disabled see EpisodeFeedParser.js
			var length = episodes.push(episode);
		};
		
		parser.didEndCallback = function(parser)
		{
			if (episodes.length > 0){
			
				var nextEpisode = episodes[findClosestEpisodeIndex()];
				
				//show the calculated episode
				showElement("backButton");
				showElement("forwardButton");
				showEpisode(nextEpisode);
			
			}else{
				showLocalizedMessage("No episodes to show ;(");
			}
			
			lastUpdated = (new Date).getTime();
		};
		
		parser.didFailCallback = function(parser)
		{
			showLocalizedMessage("Error: No feed URL supplied or Parsing error" + "Failed to load a valid feed.");
		};
		
	}
	parser.parse();
	
}

function findClosestEpisodeIndex(){

	//var today = new Date("April 15 2013 23:59:00");
	var today = new Date();
	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);
	today.setMilliseconds(0);
	
	//find the closest next episode
	var resi = -1;
	var temp = Number.MAX_VALUE;
	for(var i = 0; i<episodes.length; i++){
		var date = new Date(episodes[i].airedDateJa);
		var diff = date - today; //positive when date is after today
		if (diff >= 0 && diff < temp){
			temp = diff;
			resi = i;
		}
	}
	
	//if all episodes where in the past get the last one
	if (resi < 0){
		resi = episodes.length-1;
	}
		
	return resi;
}



function showEpisode(episode)
{

	if (episode) {
				
		//set small box text (bottom)
		document.getElementById("epNumName").innerText = episode.number + ": " + episode.titleEn;
		document.getElementById("epAiredDate").innerText = customizedStringFromDate(episode.airedDateJa);
		
		//set detailed box text (middle)
		document.getElementById("epNumber").innerText = episode.number;
		document.getElementById("epTitleEn").innerText = episode.titleEn;
		document.getElementById("epTitleRo").innerText = episode.titleRomaji;
		document.getElementById("epTitleJp").innerText = episode.titleJa;
		document.getElementById("epAiredDateJp").innerText = episode.airedDateJa;
		document.getElementById("epAiredDateEn").innerText = episode.airedDateEn;
		
		
	}
	else{
		showLocalizedMessage("episode not valid");
	}
}

function customizedStringFromDate(dateString){
	//var today = new Date("April 15 2011 00:00:00"); //set a date for debug
	var date = new Date(dateString);
	var today = new Date();
	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);
	today.setMilliseconds(0);
	
	
	var episodeDateMsg = "";
	var diff = date - today;
	var oneDaySecs = 1000*60*60*24;
	if (0 <= diff && diff < oneDaySecs*7){ 	//if date is within the next 7 days
		
		if (diff < oneDaySecs){				//if is today
			episodeDateMsg = "Today, ";
		}else if (diff < oneDaySecs *2){	//if is tomorrow
			episodeDateMsg = "Tomorrow, ";
		}else{								//otherwise in the week
			var weekday=new Array(7);
			weekday[0]="Sunday, ";
			weekday[1]="Monday, ";
			weekday[2]="Tuesday, ";
			weekday[3]="Wednesday, ";
			weekday[4]="Thursday, ";
			weekday[5]="Friday, ";
			weekday[6]="Saturday, ";
			episodeDateMsg = weekday[date.getDay()];
		}
		episodeDateMsg = episodeDateMsg + dateString + "!";
		
	}else{
	
		//episodeDateMsg = episode.airedDateJa; //in the past or more than 7 days ahead
		episodeDateMsg = dateString;
	}
	
	return episodeDateMsg;
	
}

// ********************************************************************
// **************************  EVENT HANDLERS  ************************
// ********************************************************************
function showPrevEpisode(event)
{
    if (episodes && episodes.length) {
        if (--curEpisodeIndex < 0) {
            curEpisodeIndex = episodes.length-1;
        }
        showEpisode(episodes[curEpisodeIndex]);
    }
}
function showNextEpisode(event)
{
    if (episodes && curEpisodeIndex < episodes.length) {
        if (++curEpisodeIndex >= episodes.length) {
            curEpisodeIndex = 0;
        }

        showEpisode(episodes[curEpisodeIndex]);
    }
}
var showingDetailView = false;
function showHideEpisodeDetailBox(event)
{
  
	var duration = 500;						
	var interval = 13;
	var startingVal = (showingDetailView == true)?1.0:0.0;
	var finishingVal = (showingDetailView == true)?0.0:1.0;
	
	showingDetailView = !showingDetailView;
	
	var itemToFadeInOut = document.getElementById("epDetailBox");
	
	if(itemToFadeInOut.style.visibility != "visible"){
		//this will make appear the object for the first time. (If is visible from the beggining it will fail)
		itemToFadeInOut.style.opacity = 0.0;
		itemToFadeInOut.style.visibility = "visible";
		itemToFadeInOut.style.backgroundColor = "rgba(255, 255, 255, 0.589844)"; 
	
		
	}
	
	var fadeHandler = function(a, c, s, f){ itemToFadeInOut.style.opacity = c; };
	new AppleAnimator(duration, interval, startingVal, finishingVal, fadeHandler).start();
	
}

// ***********************************************************************
// ****************************   SETTINGS   *****************************
// ***********************************************************************

// Function:
// setupHandlers() -> swapImage() -> addHilightListeners();
// called from load() function
//
function swapImage(element, image)
{
    element.src = image.src;
}
function addHilightListeners(element, overImage, downImage)
{
    var offImage = new Image();
    offImage.src = element.src;

    element.addEventListener("mouseover", function () { swapImage(element, overImage) }, true);
    element.addEventListener("mousedown", function () { swapImage(element, downImage) }, true);
    element.addEventListener("mouseup", function () { swapImage(element, overImage) }, true);
    element.addEventListener("mouseout", function () { swapImage(element, offImage) }, true);
}
function setupHandlers()
{
    var backOver = new Image();
    backOver.src = "Images/backButton_over.png";
    var backDown = new Image();
    backDown.src = "Images/backButton_down.png";
    var forwardOver = new Image();
    forwardOver.src = "Images/forwardButton_over.png";
    var forwardDown = new Image();
    forwardDown.src = "Images/forwardButton_down.png";

    var backButton = document.getElementById("backButton");
    if (backButton) {
        addHilightListeners(backButton, backOver, backDown);
    }

    var forwardButton = document.getElementById("forwardButton");
    if (forwardButton) {
        addHilightListeners(forwardButton, forwardOver, forwardDown);
    }
}

function keyPressed(event)
{
    switch (event.keyIdentifier) {
        case "Left":
            showPrevEpisode();
            break;
        case "Right":
            showNextEpisode();
            break;
		//case "Up":
		//	showHideEpisodeDetailBox();
		//	break;
		//case "Down":
		//	showHideEpisodeDetailBox();
        //default:
        //    return;
		default: break;
    }

    event.stopPropagation();
    event.preventDefault();
}

//
// Function: load()
// Called by HTML body element's onload event when the widget is ready to start
//
function load()
{
    dashcode.setupParts();
	
    setupHandlers();
    hideElement("backButton");
    hideElement("forwardButton");
    
	document.addEventListener("keypress", keyPressed, true);

	clearElement("content");
    fetchEpisodes();
}

function remove()
{
}
function hide()
{
}
function show()
{
    var now = (new Date).getTime();
    if ((now - lastUpdated) > 15 * 60 * 1000) { //15 min after last update
        fetchEpisodes();
    }
}
function sync()
{
}

// Initialize the Dashboard event handlers
if (window.widget) {
    widget.onremove = remove;
    widget.onhide = hide;
    widget.onshow = show;
    widget.onsync = sync;
}





// ***********************************************************************
// ****************************   BACK   *********************************
// ***********************************************************************

function openLink(url){
    if (window.widget) {
        widget.openURL(url);
        return false;
    }
}
function openWikipedia(event)
{
    openLink("http://en.wikipedia.org/wiki/List_of_Naruto:_Shippuden_episodes");
}
function openNacho4d(event)
{
    openLink("http://web.me.com/nacho4d/");
	//openLink("https://github.com/nacho4d/NarutoShippuden/");
}
function openMailNacho4d(event)
{
    openLink("mailto:nacho4d@gmail.com?subject=Regarding 'Naruto Shippuden Episode List' Widget");
}
function showBack(event)
{
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToBack");
    }

    front.style.display="none";
    back.style.display="block";

    if (window.widget) {
        setTimeout("widget.performTransition();", 0);
    }
}

function showFront(event)
{
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToFront");
    }

    front.style.display = "block";
    back.style.display = "none";

    if (window.widget) {
        setTimeout("widget.performTransition();", 0);
    }
}
