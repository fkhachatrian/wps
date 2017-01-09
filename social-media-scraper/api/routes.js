var database = require('../config/database'); 			// load the database config

var twitter = require('../plugins/twitter-scraper/twitter')(database);

module.exports = function (app) {

    // scrape topic
    app.post('/api/topics', function (req, res) {
        var topicName = req.body.name;
        console.log(topicName);
        twitter.scrapeTopicAllLocations(topicName);

    });
};