# guess-cms

This nodejs module allows you to guess what CMS is used by giving website url as input.

How to use:
-----------

	var guessCms = require('./index.js');
	guessCms.guess('http://example.com', function(err,result){
		console.log('TEST COMPLETE !',result);
	});


This project is widely inspired by https://github.com/Krisseck/Detect-CMS
Special thanks to Kristian Polso.