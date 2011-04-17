function test() 
{

	var dates1 = new Array(
		"December 16, 2010",
		"December 23, 2010",
		"January 6, 2011",
		"January 13, 2011",
		"January 20, 2011",
		"January 27, 2011",
		"February 10, 2011",
		"February 10, 2011",
		"February 17, 2011",
		"February 24, 2011",
		"March 3, 2011",
		"March 10, 2011",
		"March 17, 2011",
		"March 24, 2011",
		"March 31, 2011",
		"April 7, 2011",
		"April 14, 2011",
		"April 21, 2011",
		"April 28, 2011",
		"May 5, 2011");
		
	var dates2 = new Array(
		//"April 14, 2011",
		//"April 15, 2011",
		//"April 16, 2011",
		"April 17, 2011",
		"April 18, 2011",
		"April 19, 2011",
		"April 20, 2011",
		"April 21, 2011",
		"April 22, 2011",
		"April 23, 2011",
		"April 24, 2011",
		"April 25, 2011",
		"April 26, 2011"
		//"April 27, 2011"
		);
		
	//var nextDate = closestToToday(dates1);
	//console.debug("Closest date: " + nextDate);
	
	for (var i = 0; i<dates2.length; i++){
		var date = new Date(dates2[i])
		var dayString = dayStringOfDate(date);
		console.debug(dates2[i] + "  " + dayString);
	}
}

function dayStringOfDate(date){
	//var today = new Date("April 15 2013 23:59:00");
	var today = new Date();
	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);
	today.setMilliseconds(0);
	
	var episodeDateMsg;
	var diff = date - today;
	var oneDaySecs = 1000*60*60*24;
	if (0 <= diff && diff < oneDaySecs*7){ 	//if date is within the next 7 days
		
		if (diff < oneDaySecs){				//if is today
			episodeDateMsg = "Today ";
		}else if (diff < oneDaySecs *2){	//if is tomorrow
			episodeDateMsg = "Tomorrow ";
		}else{								//otherwise in the week
			var weekday=new Array(7);
			weekday[0]="Sunday";
			weekday[1]="Monday";
			weekday[2]="Tuesday";
			weekday[3]="Wednesday";
			weekday[4]="Thursday";
			weekday[5]="Friday";
			weekday[6]="Saturday";
			episodeDateMsg = weekday[date.getDay()];
		}
		episodeDateMsg = episodeDateMsg + (date + "!");
		
	}else{
	
		//episodeDateMsg = episode.airedDateJa; //in the past or more than 7 days ahead
		episodeDateMsg = date;
	}
	
	return episodeDateMsg;
	
}

function closestToToday(dates){
	
	//var today = new Date();

	var today = new Date("April 15 2013 23:59:00");
	
	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);
	today.setMilliseconds(0);
		
	console.debug(today);
	
	if (dates.length > 0){
	
		var res;	
		var resi = -1;
		var temp = Number.MAX_VALUE;
	
		for(var i = 0; i<dates.length; i++){
			
			var date = new Date(dates[i]);
			//console.debug(dates[i]);
			var diff = date - today; //positive when date is later than today
			if (diff >= 0 && diff < temp){
				temp = diff;
				resi = i;
			}
			
		}
		if (resi < 0){
			resi = dates.length-1;
		}
		
		return dates[resi];
		
		
	}else{
		
		return null;
	}

} 

