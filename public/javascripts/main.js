$(document).ready(function(){
	$('#input').on('input', function(){
		if(/www\.avito\.ru/g.test($(this).val())){
			$(this).after(' <a href="/rss/'+
				      btoa(/http:\/\/www\.avito\.ru\/(.*)/g.exec($(this).val())[1])+
				      '">RSS</a> ');
		}

	});
});
