var guessCms = require('./index.js');

guessCms.guess('http://example.com', function(err,result){
	console.log('TEST COMPLETE !',result);
});