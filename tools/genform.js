$(document).ready(function() {
	
	//GLOBAL VARIABLES
	
	var $currentItem;
	
	//INTIALISATION OF QUESTIONS
	
	
	var $g_qspans = $('.question');
	
	$g_qspans.each(function() {
		$currentItem = $(this);
		processQuestion($currentItem.text());
		$currentItem.remove();
	});
	
	
	function generateForm(l_question, l_qid, l_misc) {
		
		//construct a form for the given question
		var l_form = '<form action="https://spreadsheets.google.com/formResponse?formkey=dE9RbjdpZ3Exa3FFeFZwY3VtVDdqMmc6MQ&amp;ifq" method="POST" id="ss-form">'
		+'<input type="hidden" name="entry.0.single" value="'+l_misc+'" class="ss-q-short" id="entry_0">'
		+'<input type="hidden" name="entry.1.single" value="'+l_qid+'" class="ss-q-short" id="entry_1">'
		+'<input type="hidden" name="entry.2.single" value="'+l_question+'" class="ss-q-short" id="entry_2">'
		+'<label class="ss-q-title" for="entry_3">Firstname:</label>'
		+'<input type="text" name="entry.3.single" value="" class="ss-q-short" id="entry_3"><br />' 
		+'<label class="ss-q-title" for="entry_4">Lastname:</label>'
		+'<input type="text" name="entry.4.single" value="" class="ss-q-short" id="entry_4"><br />'
		+'<label class="ss-q-title" for="entry_5">Computer Science Username:</label>'
		+'<input type="text" name="entry.5.single" value="" class="ss-q-short" id="entry_5"><br />'
		+'<label class="ss-q-title" for="entry_6">University ID:</label>'
		+'<input type="text" name="entry.6.single" value="" class="ss-q-short" id="entry_6"><br />'
		+'<label class="ss-q-title" for="entry_7">Answer:</label><br/>'
		+'<textarea name="entry.7.single" value="" class="ss-q-short" id="entry_7" cols=50 rows=4></textarea><br />'
		+'<input type="hidden" name="pageNumber" value="0">'
		+'<input type="hidden" name="backupCache" value="">'
		+'<input type="submit" name="submit" value="Submit"></form>';
	
		return l_form;
	}

	function processQuestion(l_text) {
		
		var l_qRegEx =new RegExp('(?:!Q:).*(?=#)(?!!)','m');
		var l_qMatches = l_qRegEx.exec(l_text);
		
		var i = 0;
		l_qMatches[i] = l_qMatches[i].replace("!Q:","");
		l_qMatches[i] = l_qMatches[i].replace("#","");
			
		//Begin constructing div to contain the form.
		var l_container = '<div class="qdiv">';
		var l_misc = "";
		var l_question = l_qMatches[i];
		if($currentItem.attr('data-id')) {
			var l_qid = $currentItem.attr('data-id');
		}
		else {
			l_qid='N/A';
		}
		var l_innerForm = generateForm(l_question, l_qid, l_misc);
		l_container = l_container+'Question: '+l_question+'<br /><br />'+l_innerForm+'</div>';
		$currentItem.after(l_container);
	}
});