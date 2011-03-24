//The following code was originally taken from (http://gdata-javascript-client.googlecode.com/svn/trunk/samples/calendar/simple_sample/simple_sample.html) and modified
//to fit the needs of SuperSlides.
function retrieveCalendar(calID) { //RETURNS A STRING

	google.setOnLoadCallback(init);
	
	var calendarInfo = null;
	
	function init() {
		google.gdata.client.init(handleGDError);
		loadCalendarByAddress(calID);
	}

	//THE PADNUMBER METHOD REMAINS UNCHANGED FROM THE ORIGINAL (http://gdata-javascript-client.googlecode.com/svn/trunk/samples/calendar/simple_sample/simple_sample.html)
	function padNumber(num) {
		if (num <= 9) {
			return "0" + num;
		}
		return num;
	}
	
	
	//THE LOADCALENDARBYADDRESS METHOD REMAINS UNCHANGED FROM THE ORIGINAL (http://gdata-javascript-client.googlecode.com/svn/trunk/samples/calendar/simple_sample/simple_sample.html)
	function loadCalendarByAddress(calendarAddress) {
		var calendarUrl = 'https://www.google.com/calendar/feeds/' +
							calendarAddress + 
							'/public/full';
		loadCalendar(calendarUrl);
	}
	
	
	//THE LOADCALENDAR METHOD REMAINS UNCHANGED FROM THE ORIGINAL (http://gdata-javascript-client.googlecode.com/svn/trunk/samples/calendar/simple_sample/simple_sample.html)
	function loadCalendar(calendarUrl) {
		var service = new 
			google.gdata.calendar.CalendarService('gdata-js-client-samples-simple');
		var query = new google.gdata.calendar.CalendarEventQuery(calendarUrl);
		query.setOrderBy('starttime');
		query.setSortOrder('ascending');
		query.setFutureEvents(true);
		query.setSingleEvents(true);
		query.setMaxResults(10);

		service.getEventsFeed(query, listEvents, handleGDError);
	}

	//Upon an error occurring a correctly formatted error message is returned.
	function handleGDError(e) {
		calendarInfo = '<span class="error">Failed to connect to calendar</span>';
		var $l_info = $('#info');
		$l_info.find('section').before('<h2>Information</h2>');
		$l_info.find('section').append(calendarInfo);
	}

	//Callback function (only executed once it's parent has completed)
	//Finds all entries and then creates a correctly formatted list of them.
	function listEvents(feedRoot) {
		var entries = feedRoot.feed.getEntries();
		$eventDiv = $('#events');
		var calTitle = feedRoot.feed.title.$t;
		var len = entries.length;
		var toAppend = "";
  
		for (var i = 0; i < len; i++) {
			var entry = entries[i];
			var title = entry.getTitle().getText();
	
			var startDateTime = null;
			var endDateTime = null;
			var startJSDate = null;
			var endJSDate = null;
	
			var times = entry.getTimes();
			var locations = entry.getLocations();
	
			if (times.length > 0) {
				startDateTime = times[0].getStartTime();
				startJSDate = startDateTime.getDate();
				endDateTime = times[0].getEndTime();
				endJSDate = endDateTime.getDate();
			}
	
			var dateString = startJSDate.getDate() + "/" + (startJSDate.getMonth() + 1);
			if (!startDateTime.isDateOnly()) {
				dateString += " " + startJSDate.getHours() + ":" + 
				padNumber(startJSDate.getMinutes());
			}
			if (!endDateTime.isDateOnly()) {
				dateString += " to " + endJSDate.getHours() + ":" + 
				padNumber(endJSDate.getMinutes());
			}
	
	
			toAppend += '<span class="calendarEntry">';
			toAppend += '<span class="calendarTitle">'+title+'</span> - ';
			toAppend += '<span class="calendarDate">'+dateString+'</span>';
			for(var j = 0; j < locations.length; j++) {
				toAppend = toAppend + ' - <span class="calendarLocation">'+locations[j].getValueString()+'</span> ';
			}
			toAppend += '</span><br />'
		}
		var $l_info = $('#info');
		if($l_info.find('section').size() > 0){
			$l_info.find('section').append(toAppend);
		} else {
			$l_info.append('<section>'+toAppend+'</section>');
		}
		$l_info.find('section').before('<h2>Upcoming Dates</h2>');
	}

	
}

$(document).ready(function() {

	function createInfoSlide() {
		var l_temp = retrieveCalendar('cartwrs8@cs.man.ac.uk');
	}
	
	if($('#info').size() > 0) {
		createInfoSlide();
	}
});