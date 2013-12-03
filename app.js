
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var RSS = require('rss');
var jsdom = require('jsdom');
var request = require('request');
var fs     = require('fs');
var jquery = fs.readFileSync("./public/javascripts/jquery-2.0.3.min.js").toString();


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', function(req, res){
	res.render('index.jade');
});

app.get('/rss/:hash', function(req, res){
	var link = new Buffer(req.params.hash, 'base64').toString('ascii');
	request('http://www.avito.ru/' + link, function(err, response, body){
		jsdom.env({
			html: body,
			src: [
				jquery
			],
			done: function(errors, window) {
				var $ = window.$;
				console.log(link);


				var feed = new RSS({
					title: $('a.catalog_breadcrumbs-link').text(),
					feed_url: 'http://localhost:3000/rss/Z2F0Y2hpbmEvdmFrYW5zaWkvaXRfaW50ZXJuZXRfdGVsZWtvbQ==',
					site_url: 'http://localhost:3000',
					language: 'ru',
					pubDate: 'May 20, 2012 04:00:00 GMT',
					ttl: 60
				});
				var itemsLength = $('.item').length;
				console.log(' '+itemsLength);
				$('.item').each(function(index){
					console.log('i->'+index);
					var $this = $(this);
					feed.item({
						title: $('h3>a',$this).text()+' '+$('.about>span', $this).text(),
						description: $('.data', $this).html(),
						url: 'http://www.avito.ru'+$('h3>a',$this).attr('href'),
						guid: /(\d+)/g.exec($('h3>a',$this).attr('href'))[1],
						date: (function($, $this){
							var date = new Date();
							var dateText = $('.date', $this).text();
							console.log('dt->'+dateText);
							if(/Вчера/g.test(dateText)){
								date.setDate(date.getDate() - 1);
							}else{
								if(/Сегодня/g.test(dateText)){
								}
								else{
									var md = /(\d) ([а-я]{3})/g.exec(dateText);
									switch(md[2]){
										case 'янв':
											date.setMonth(0);
										break;
										case 'фев':
											date.setMonth(1);
										break;
										case 'мар':
											date.setMonth(2);
										break;
										case 'апр':
											date.setMonth(3);
										break;
										case 'май':
											date.setMonth(4);
										break;
										case 'июн':
											date.setMonth(5);
										break;
										case 'июл':
											date.setMonth(6);
										break;
										case 'авг':
											date.setMonth(7);
										break;
										case 'сен':
											date.setMonth(8);
										break;
										case 'окт':
											date.setMonth(9);
										break;
										case 'ноя':
											date.setMonth(10);
										break;
										case 'дек':
											date.setMonth(11);
										break;
									}
									date.setDate(md[1]);
								}
							}
							var hm = $('.date>span', $this).text().split(':');
							date.setHours(hm[0]);
							date.setMinutes(hm[1]);

							return date+'';
						})($, $this)
					});

					if(itemsLength-1 == index)
						res.send(feed.xml());
				});
			}
		});   
	});   
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
