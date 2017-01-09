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

var express = require('express');
var app = express(); 						// create our app w/ express
var port = 3000; 				// set the port
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request

//// routes ======================================================================
require('./api/routes.js')(app);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);


//instagram.getInstagramMedia("школа");