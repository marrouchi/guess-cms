var async = require('async');

module.exports = {
  name: 'wordpress',
  guess: function(websiteUrl, next) {
    var system = this;
    async.parallel({
      readme: system.methods.readme.bind(null,websiteUrl),
      generatorHeader: system.methods.generatorHeader.bind(null,websiteUrl),
      generatorMetaOrScript: system.methods.generatorMetaOrScript.bind(null,websiteUrl),
      buttonCss: system.methods.buttonCss.bind(null,websiteUrl),
    }, function(err, results) {
        // result now equals the first file in the list that exists
        if(err){
          console.log('Error while guessing Wordpress', err);
          next(err,null);
          return;
        } 

        var methods  = [];
        for(method in results){
          if(results[method]){
            methods.push(method);
          }
        }
        next(null, {guessed: methods.length > 0, method: methods});
    });
  },
  methods: {
    readme: function(websiteUrl, callback) {
      var request = require("request"); 

      // Check changelog
      request({
        uri: websiteUrl + '/readme.html',
      }, function(error, response, body) {
        // Something went wrong
        if(error){
          callback(error, null);
          return;
        }

        if(body && body.indexOf('WordPress &rsaquo; ReadMe') > -1) {
          callback(error, true);
        }else{
          callback(error, false);       
        }
      });
    },

    generatorHeader: function(websiteUrl, callback) {
      var request = require("request"); 
      // Check generator headers
      request({
        method: 'HEAD',
        uri: websiteUrl,
      }, function(error, response, body) {
        // Something went wrong
        if(error){
          callback(error, null);
          return;
        }
        if('x-generator' in response.headers && response.headers['x-generator'].indexOf('WordPress') > -1){
          callback(error, true);
        }else{
          callback(error, false);       
        }
      });
    }, 

    generatorMetaOrScript: function(websiteUrl, callback) {
      
      var request = require("request"); 
      var cheerio = require("cheerio");

      request({
        uri: websiteUrl,
      }, function(error, response, body) {
        // Something went wrong
        if(error){
          callback(error, null);
          return;
        }

        var $ = cheerio.load(body);
        // Check meta tags for generator, script & api
        if( ( $('meta[name="generator"]').attr('content') 
          && $('meta[name="generator"]').attr('content').indexOf("Wordpress") > -1 )
          || $('script[src*="wp-includes"]').length > 0
          || $('script[link*="wp-json"]').length > 0){
          callback(error, true);
        }else{
          callback(error, false);
        }
      });
    },

    buttonCss: function(websiteUrl, callback) {
      
      var request = require("request");
      // Check CSS
      request({
        uri: websiteUrl+'/wp-includes/css/buttons.css',
      }, function(error, response, body) {
        // Something went wrong
        if(error){
          callback(error, null);
          return;
        }
        // Check modules/node/node.css content
        if(body && body.indexOf('WordPress-style Buttons') > -1) {
          callback(error, true);
        }else{
          callback(error, false);       
        }
      });
    },
  }
};