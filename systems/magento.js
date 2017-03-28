var async = require('async');
var _ = require('lodash');

module.exports = {
    name: 'magento',
    guess: function(websiteUrl, next) {
        var system = this;
        async.parallel({
            styles: system.methods.styles.bind(null,websiteUrl),
            copyright: system.methods.copyright.bind(null,websiteUrl),
        }, function(err, results) {
            // result now equals the first file in the list that exists
            if(err){
                console.log('Error while guessing Magento', err);
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
        styles: function(websiteUrl, callback) {
            var request = require("request");
                console.log("styles");
            // Check readme
            request({
                uri: websiteUrl + '/skin/frontend/default/default/css/styles.css',
            }, function(error, response, body) {
                // Something went wrong
                if(error){
                    callback({method: 'changelogs', err: error}, null);
                    return;
                }

                if(body && body.indexOf('Magento Inc.') > -1) {
                    callback(error, true);
                }else{
                    callback(error, false);
                }
            });
        },



        copyright: function(websiteUrl, callback) {

            var request = require("request");
            var cheerio = require("cheerio");
            console.log("generator");
            // Check downloader body
            request({
                uri: websiteUrl+'/downloader',
            }, function(error, response, body) {
                // Something went wrong
                if(error){
                    callback({method: 'copyright', err: error}, null);
                    return;
                }

                var $ = cheerio.load(body);
                if( $('p[class="copyright"]').text().indexOf("Magento") > -1){
                    callback(error, true);
                }else{
                    callback(error, false);
                }

            });
        },




    },
    version: function(websiteUrl, callback){
        var request = require("request");

        // Check downloader
        request({
            uri: websiteUrl + '/downloader',
        }, function(error, response, body) {

            // Something went wrong
            if(error){
                callback(error, null);
                return;
            }

            // Check cms
            if(body.indexOf('Magento') === -1) {
                callback(new Error('Are your sure this is a Magento! ?'), null);
                return;
            }

            // Check version
            var regex = /Magento Connect Manager ver. ([0-9\.]+)\)/i;
            var match = body.match(regex);
            if(match && match.length == 2){
                callback(null, match[1]);
            }else{
                callback(new Error('Unable to get version in (/downloader)'), null);
            }
        });
    }
};