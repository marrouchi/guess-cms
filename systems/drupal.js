var async = require('async');

module.exports = {
  name: 'drupal',
  guess: function(websiteUrl, next) {
    var system = this;
    async.parallel({
      changelog: system.methods.changelog.bind(null,websiteUrl),
      changelogV8: system.methods.changelogV8.bind(null,websiteUrl),
      generatorHeader: system.methods.generatorHeader.bind(null,websiteUrl),
      generatorMetaOrScript: system.methods.generatorMetaOrScript.bind(null,websiteUrl),
      nodeCss: system.methods.nodeCss.bind(null,websiteUrl),
    }, function(err, results) {
        // result now equals the first file in the list that exists
        if(err){
          console.log('Error while guessing Drupal', err);
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
    changelog: function(websiteUrl, callback) {
      var request = require("request"); 

      // Check changelog
      request({
        uri: websiteUrl + '/CHANGELOG.txt',
      }, function(error, response, body) {
        // Something went wrong
        if(error){
          callback(error, null);
          return;
        }

        if(body && body.indexOf('Drupal') > -1) {
          callback(error, true);
        }else{
          callback(error, false);       
        }
      });
    },

    changelogV8: function(websiteUrl, callback) {
      var request = require("request"); 

      // Check changelog v8
      request({
        uri: websiteUrl + '/core/CHANGELOG.txt',
      }, function(error, response, body) {
        // Something went wrong
        if(error){
          callback(error, null);
          return;
        }

        if(body && body.indexOf('Drupal') > -1) {
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
        if('x-generator' in response.headers && response.headers['x-generator'].indexOf('Drupal') > -1) {
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
        // Check meta tags for generator & script
        if( ($('meta[name="generator"]').attr('content')
          && $('meta[name="generator"]').attr('content').indexOf("Drupal") > -1 )
          || $('script[data-drupal-selector]').length > 0){
          callback(error, true);
        }else{
          callback(error, false);
        }

      });
    },

    nodeCss: function(websiteUrl, callback) {
      
      var request = require("request");
      // Check CSS
      request({
        uri: websiteUrl+'/modules/node/node.css',
      }, function(error, response, body) {
        // Something went wrong
        if(error){
          callback(error, null);
          return;
        }
        // Check modules/node/node.css content
        if(body && body.indexOf('.node-') > -1) {
          callback(error, true);
        }else{
          callback(error, false);       
        }
      });
    },
  }
};