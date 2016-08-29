var async = require('async');
var _ = require('lodash');

module.exports = {
  name: 'joomla',
  guess: function(websiteUrl, next) {
    var system = this;
    async.parallel({
      readme: system.methods.readme.bind(null,websiteUrl),
      generatorHeader: system.methods.generatorHeader.bind(null,websiteUrl),
      generatorMeta: system.methods.generatorMeta.bind(null,websiteUrl),
      coreJs: system.methods.coreJs.bind(null,websiteUrl),
    }, function(err, results) {
        // result now equals the first file in the list that exists
        if(err){
          console.log('Error while guessing Joomla', err);
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

      // Check readme
      request({
        uri: websiteUrl + '/README.txt',
      }, function(error, response, body) {
        // Something went wrong
        if(error){
          callback({method: 'readme', err: error}, null);
          return;
        }

        if(body && body.indexOf('2- What is Joomla?') > -1) {
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
          callback({method: 'generatorHeader', err: error}, null);
          return;
        }
        if('x-generator' in response.headers && response.headers['x-generator'].indexOf('Joomla!') > -1) {
          callback(error, true);
        }else{
          callback(error, false);       
        }
      });
    },

    generatorMeta: function(websiteUrl, callback) {
      
      var request = require("request"); 
      var cheerio = require("cheerio");
      // Check generator headers
      request({
        uri: websiteUrl,
      }, function(error, response, body) {
        // Something went wrong
        if(error){
          callback({method: 'generatorMeta', err: error}, null);
          return;
        }

        var $ = cheerio.load(body);
        if( $('meta[name="generator"]').attr('content') 
          && $('meta[name="generator"]').attr('content').indexOf("Joomla") > -1){
          callback(error, true);
        }else{
          callback(error, false);
        }

      });
    },

    coreJs: function(websiteUrl, callback) {
      
      var request = require("request");
      // Check generator headers
      request({
        uri: websiteUrl+'/media/system/js/core.js',
      }, function(error, response, body) {
        // Something went wrong
        if(error){
          callback({method: 'coreJs', err: error}, null);
          return;
        }
        
        if(body && body.indexOf('var Joomla={};') > -1) {
          callback(error, true);
        }else{
          callback(error, false);       
        }
      });
    },
  },
  version: function(websiteUrl, callback){
    var request = require("request"); 

    // Check readme
    request({
      uri: websiteUrl + '/language/en-GB/en-GB.xml',
    }, function(error, response, body) {

      // Something went wrong
      if(error){
        callback(error, null);
        return;
      }

      // Check cms
      if(body.indexOf('<author>Joomla! Project</author>') === -1) {
        callback(new Error('Are your sure this is a Joomla! ?'), null);
        return;
      }

      // Check version
      var regex = /<version>(.+)<\/version>/i;
      var match = body.match(regex);
      if(match && match.length == 2){
        callback(null, match[1]);
      }else{
        callback(new Error('Unable to get version in (/language/en-GB/en-GB.xml)'), null);       
      }
    });
  }
};