function generateClouds(/*int*/ l_max ,/*int*/ l_scale,/*boolean*/ l_sort) {
	if($('a.cloud').size() < 1) {
		return;
	}
	var $l_clouds = $('a.cloud');
	var l_counter = 0;
	//for each link
	$l_clouds.each(function() {
		var l_linkOut = "";
		var l_title = $(this).text();
		var $l_current = $(this);
		l_linkOut = $(this).attr('href');
		$.ajax({
			url: l_linkOut,
			type: 'GET',
			success: function(res) {
				var l_toAnalyse = $(res.responseText).text();
				var l_dynaText = '#dynacloud' + l_counter.toString();
				var l_contText = '#dContainer' + l_counter.toString();
				var l_html = '<div id="dynacloud'+l_counter.toString()+'"></div><div id="dContainer'+l_counter.toString()+'" style="display: none">'+l_toAnalyse+'</div>';	
				$l_current.after(l_html);
				l_counter++;
				$.dynaCloud.sort = false;
				$(l_contText).dynaCloud(l_dynaText);
			}
		});
		
	});
}

$(document).ready(function() {
	if($('a.cloud').size() > 0){
		generateClouds(30, 4, false);
	}
});