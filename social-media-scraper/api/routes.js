var Topic = require('./models/topic');
var database = require('./config/database'); 

var RandomColor = require('randomcolor');

function getTopics(res) {
    Topic.find(function (err, topics) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }

        res.json(topics); // return all todos in JSON format
    });
}

module.exports = function (app) {

    // create topic and start scraping
    app.post('/api/topics', function (req, res) {

        var color = RandomColor({count: 1});

        // create a todo, information comes from AJAX request from Angular
        Topic.create({
            name: req.body.name,
            color: color[0]
        }, function (err, todo) {
            if (err) {
                res.send(err);
            }
            
            

            // get and return all the topics after you create another
            getTopics(res);
        });

    });
};