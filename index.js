var async = require('async');
var _ = require('lodash');

module.exports = {
  guess: function(websiteUrl, callback) {
    
    async.map([
      require('./systems/drupal'),
      require('./systems/joomla'),
      require('./systems/prestashop'),
      require('./systems/wordpress'),
    ],function(system, callback) {
      system.guess(websiteUrl, function(err, result){
          callback(err, _.merge(result, {name: system.name}));
      });
    }, function(err, results) {
      // result now equals the first file in the list that exists
      if(err){
        console.log('Error while guessing');
        callback(err, null);
        return;
      }
      
      var guessed = _.find(results, function(result){ return result.guessed; });       
      callback(null, guessed);
    });
    /*var joomla = require("./systems/joomla");
    
    joomla.guess(websiteUrl, function(err, results){
      console.log(err,results);
      callback(err,results);
    });
    */
    /*var drupal = require("./systems/drupal");
    
    drupal.guess(websiteUrl, function(err, results){
      console.log(err,results);
      callback(err,results);
    });*/

    /*var wordpress = require("./systems/wordpress");
    
    wordpress.guess(websiteUrl, function(err, results){
      console.log(err,results);
      callback(err,results);
    });*/

    /*var prestashop = require("./systems/prestashop");
    
    prestashop.guess(websiteUrl, function(err, results){
      console.log(err,results);
      callback(err,results);
    });*/

  },
};