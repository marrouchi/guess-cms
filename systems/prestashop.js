var async = require('async');

module.exports = {
  name: 'prestashop',
  guess: function(websiteUrl, next) {
    var system = this;
    async.parallel({
      readme: system.methods.readme.bind(null,websiteUrl),
      generatorHeader: system.methods.generatorHeader.bind(null,websiteUrl),
      generatorMeta: system.methods.generatorMeta.bind(null,websiteUrl),
      functionJs: system.methods.functionJs.bind(null,websiteUrl),
    }, function(err, results) {
        // result now equals the first file in the list that exists
        if(err){
          console.log('Error while guessing Prestashop', err);
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
        uri: websiteUrl + '/README.md',
      }, function(error, response, body) {
        // Something went wrong
        if(error){
          callback({method: 'readme', err: error}, null);
          return;
        }

        if(body && body.indexOf('About PrestaShop') > -1) {
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
        if('x-generator' in response.headers && response.headers['x-generator'].indexOf('PrestaShop') > -1){
          callback(error, true);
        }else{
          callback(error, false);       
        }
      });
    }, 

    generatorMeta: function(websiteUrl, callback) {
      
      var request = require("request"); 
      var cheerio = require("cheerio");

      request({
        uri: websiteUrl,
      }, function(error, response, body) {
        // Something went wrong
        if(error){
          callback({method: 'generatorMeta', err: error}, null);
          return;
        }

        var $ = cheerio.load(body);
        // Check meta tags for generator, script & api
        if( $('meta[name="generator"]').attr('content') 
          && $('meta[name="generator"]').attr('content').indexOf("PrestaShop") > -1){
          callback(error, true);
        }else{
          callback(error, false);
        }
      });
    },

    functionJs: function(websiteUrl, callback) {
      
      var request = require("request");
      // Check CSS
      request({
        uri: websiteUrl+'/js/tools.js',
      }, function(error, response, body) {
        // Something went wrong
        if(error){
          callback({method: 'functionJs', err: error}, null);
          return;
        }
        // Check modules/node/node.css content
        if(body && body.indexOf('function ps_round') > -1) {
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
      uri: websiteUrl + '/docs/CHANGELOG.txt',
    }, function(error, response, body) {

      // Something went wrong
      if(error){
        callback(error, null);
        return;
      }

      // Check version
      var regex = /\#   v([0-9\.]+) \- \([0-9]{4}-[0-9]{2}-[0-9]{2}\)/i;
      var match = body.match(regex);
      if(match && match.length == 2){
        callback(null, match[1]);
      }else{
        callback(new Error('Unable to get version in (/docs/CHANGELOG.txt)'), null);       
      }
    });
  }
};