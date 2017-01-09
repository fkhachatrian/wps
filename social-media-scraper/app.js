// set up ======================================================================						// create our app w/ express
var mongoose = require('mongoose'); 				// mongoose for mongodb				// set the port
var database = require('./config/database'); 			// load the database config


mongoose.connection.on('connecting', function () {  
  console.log('Mongoose default connecting');
}); 

mongoose.connection.on('connected', function () {  
  console.log('Mongoose default connection open to ' + database.localUrl);
}); 

// If the connection throws an error
mongoose.connection.on('error',function (err) {  
  console.log('Mongoose default connection error: ' + err);
}); 

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {  
  console.log('Mongoose default connection disconnected'); 
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function() {  
  mongoose.connection.close(function () { 
    console.log('Mongoose default connection disconnected through app termination'); 
    process.exit(0); 
  }); 
}); 

// configuration ===============================================================
mongoose.connect(database.localUrl); 	// Connect to local MongoDB instance.

var twitter = require('./plugins/twitter-scraper/twitter')(database);
var instagram = require('./plugins/instagram-scraper/instagram');

var CronJob = require('cron').CronJob;

new CronJob({
    cronTime: '0 */5 * * * *',
    runOnInit: true,
    start: true,
    onTick: function() {
        console.log('Checking for trending topics every 5 minutes...');
        twitter.getTrendingTopics();
    }
});

new CronJob({
    cronTime:'0 00 22 * * *',
    runOnInit: true,
    start: true,
    onTick: function() {
        console.log('Starting Scraping...');
        twitter.scrapeAllTopics();
    }
});


//instagram.getInstagramMedia("школа");