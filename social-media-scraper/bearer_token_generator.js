var R = require("request");

// RFC 1738 of YEB02ADEaPmosZCLT4zgpxU9s
var key = 'YEB02ADEaPmosZCLT4zgpxU9s';

// RFC 1738 of var secret = 'QqPyJ3foruJen8HKBint2S3F9DkxXqV6v0PAHqxl0Uxlzqj1uX';
var secret = 'QqPyJ3foruJen8HKBint2S3F9DkxXqV6v0PAHqxl0Uxlzqj1uX';

var cat = key +":"+secret;

var credentials = new Buffer(cat).toString('base64');

var url = 'https://api.twitter.com/oauth2/token';

R({ url: url,
    method:'POST',
    headers: {
        "Authorization": "Basic " + credentials,
        "Content-Type":"application/x-www-form-urlencoded;charset=UTF-8",
        "Content-Length": "29"
    },
    body: "grant_type=client_credentials"

}, function(err, resp, body) {

    console.dir(body); //the bearer token...

});