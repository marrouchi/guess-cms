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
  },

  version: function(websiteUrl, cms, callback) {
    
    // check if cms is supported
    if(['drupal','joomla','prestashop','wordpress'].indexOf(cms) === -1){
      callback(new Error('`'+cms+'` is not supported yet.'), null);
      return;
    }

    var system = require('./systems/'+cms);
    system.version(websiteUrl, function(err, result){

      // Something went wrong ?
      if(err){
        console.log('Error while getting cms version.');
        callback(err, null);
        return;
      }
      
      callback(err, result);
    });
  },
};