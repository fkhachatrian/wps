var Trends = require('./models/trends');
var Topic = require('./models/topic');

var Tweet = require('./models/tweet');
var Record = require('./models/record');
var Keyword = require('./models/keyword');

var request = require('request');

var RandomColor = require('randomcolor');

function getLatestTrends(res) {
    Trends.findOne({}, {}, { sort: { 'created_at' : -1 } }, function (err, trends) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }

//        function compare(a,b) {
//                if (a.tweet_volume < b.tweet_volume)
//                  return 1;
//                else if (a.tweet_volume > b.tweet_volume)
//                  return -1;
//                else 
//                  return 0;
//        }
//
//        trends.trends.sort(compare);

        res.json(trends.trends); // return all todos in JSON format
    });
};

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

    // api ---------------------------------------------------------------------
    // get all topics
    app.get('/api/topics', function (req, res) {
        // use mongoose to get all topics in the database
        getTopics(res);
    });
	
    // get all todos
    app.get('/api/trends', function (req, res) {
        // use mongoose to get all todos in the database
        getLatestTrends(res);
    });
    
    // get all chart data
    app.get('/api/chart', function (req, res) {
        
        Topic.find({}, {}, {
            sort:{
                name: 1
            }
        }, function (err, topics) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err) {
                res.send(err);
            }

            var data = {
                series: topics
            };

            Tweet.aggregate(
                [
                    { $group: {
                        _id: {
                            topic: "$topic",
                            date: {
                                $subtract: [
                                    { $subtract: [ "$created_at", new Date("1970-01-01") ]},
                                    { $mod: [
                                        { $subtract: [ "$created_at", new Date("1970-01-01") ]},
                                        1000 * 60 * 60 * 24
                                    ]}
                                ]
                            }
                        },
                        total: { $sum: 1 }
                    }},
                    { $sort: {"_id.topic.name":1}},
                    { $group : { 
                        _id : "$_id.date", 
                        stats: { $push: {topic: "$_id.topic", total:"$total"} } } 
                    },
                    { $project: {
                        _id: 0,
                        date: "$_id",
                        stats: "$stats"
                    }},
                    { $sort: {"date":1}}
                ],
                function(err,result) {
                   data.data = result;
                   res.json(data);
                } 
            );

        });
        
 
    });
    
    // get all localized data
    app.get('/api/localized/:topic_name', function (req, res) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log(req.params.topic_name);
        // 
        if (!req.params.topic_name) {
            res.send("No topic specified for localized data");
        }
        
        var data = {
            topic: req.params.topic_name
        };

        Record.aggregate(
            [
                {"$match":{"topic.name":req.params.topic_name}},
                { $group: {
                    _id: {
                        location: "$location"
                    },
                    total_negative: { "$sum": { "$cond": [
                        { "$lt": [ "$sentiment_score", 0 ] },
                        1,
                        0
                    ]} },
                    total_positive: { "$sum": { "$cond": [
                        { "$gt": [ "$sentiment_score", 0 ] },
                        1,
                        0
                    ]} },
                    total_neutral: { "$sum": { "$cond": [
                        { "$eq": [ "$sentiment_score", 0 ] },
                        1,
                        0
                    ]} },
                }},
                { $project: {
                    _id: 0,
                    location: "$_id.location",
                    total_negative: "$total_negative",
                    total_positive: "$total_positive",
                    total_neutral: "$total_neutral"
                }}
            ],
            function(err,result) {
               data.data = result;
               res.json(data);
            } 
        );
    });
    
    // get all localized tweets
    app.get('/api/records/:topic_name/:skip', function (req, res) {
        console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<');
        console.log(req.params.topic_name);
        // 
        if (!req.params.topic_name) {
            res.send("No topic specified for localized data");
        }
        
        var data = {
            topic: {}
        };
        
        Record
        .find({"topic.name":req.params.topic_name})
        .skip(req.params.skip)
        .limit(20).exec(function (err, records) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err) {
                res.send(err);
            }
            
            data.records = records;

            Topic.find({name:req.params.topic_name}, function (err, topics) {

                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err) {
                    res.send(err);
                }
                
                data.topic = topics[0];

                res.json(data); // return all todos in JSON format
            });

            
        });
    });

    //
    app.get('/api/top-keywords/:topic_name/:limit', function (req, res) {
        console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<');
        console.log(req.params.topic_name);
        // 
        if (!req.params.topic_name) {
            res.send("No topic specified for keyword data");
        }
        
        var limit = 10;
        if(req.params.limit) {
            limit = parseInt(req.params.limit);
        }

        Keyword.aggregate(
            [
                {"$match":{"topic.name":req.params.topic_name}},
                { $group: {
                    _id: {
                        word: "$word"
                    },
                    total: { "$sum": 1 }
                }},
                { $project: {
                    _id: 0,
                    text: "$_id.word",
                    weight: "$total"
                }},
                { $sort : { weight : -1 }},
                { $limit : limit}
            ],
            function(err,result) {
               var data = {};
               data.keywords = result;
               res.json(data);
            } 
        );
    });


    // create topic and send back all todos after creation
    app.post('/api/topics', function (req, res) {

        var color = RandomColor({count: 1});
        
        var topicName = req.body.name[0];

        Topic.create({
            name: topicName,
            last_scraped: null,
            color: color[0]
        }, function (err, todo) {
            if (err) {
                res.send(err);
            }
            
            try {
                var re = request.post({
                    'url': 'http://localhost:3000/api/topics',
                    'body': {
                        'name': topicName
                    },
                    'json': true
                }, function(err){
                    console.log(err);
                });
            } catch(err) {
                console.log(err);
                re.abort();
                return;
            }

            // get and return all the topics after you create another
            getTopics(res);

        });

    });

    // delete a todo
    app.delete('/api/topics/:topic_name', function (req, res) {
        Topic.remove({
            name: req.params.topic_name
        }, function (err, topic) {
            if (err)
                res.send(err);

            getTopics(res);
        });
    });

    // application -------------------------------------------------------------
    app.get('*', function (req, res) {
        res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};