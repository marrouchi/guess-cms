var guessCms = require('./index.js');

guessCms.guess('http://www.example.com', function(err,result){
	console.log('TEST COMPLETE !',err,result);
});

guessCms.version('http://www.example.com', 'prestashop',function(err,result){
	console.log('TEST COMPLETE !',err,result);
});