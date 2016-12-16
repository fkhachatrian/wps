// set up ======================================================================						// create our app w/ express
var mongoose = require('mongoose'); 				// mongoose for mongodb				// set the port
var database = require('./config/database'); 			// load the database config
var Promise  = require("bluebird"); 

var sentiment = require("sentiment");

var Bottleneck = require("bottleneck");

var sentiscan = require('./lib/index.js');

var LanguageDetect = require('languagedetect');
var lngDetector = new LanguageDetect();

var unique = require('array-unique');

var XRegExp = require("xregexp");
var shortWordsUnicode = XRegExp('(^|\\s)(\\pL{1,2})(?=\\s|$)', "g");

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

var Trends = require('./models/trends');
var Tweet = require('./models/tweet');
var Keyword = require('./models/keyword');
var Record = require('./models/record');
var Topic = require('./models/topic');

var CronJob = require('cron').CronJob;

var mongodb = require('mongodb');
var mongoDbQueue = require('mongodb-queue');

function loadq() {
    mongodb.MongoClient.connect(database.localUrl2, function(err, db) {
        var queue = mongoDbQueue(db, 'my-queue');
        
        Tweet.find({ 
            
        }, function (err, tweets) {
            for(var i = 0; i < tweets.length; i ++) {
                var record = tweets[i];
                
                var payload = {
                  text: record.text,
                  lang: record.lang,
                  location: {
                    name: record.location.name,
                    lon: record.location.lon,
                    lat: record.location.lat
                  },
                  user: record.user,
                  topic: {
                          name: record.topic.name,
                          colorName: record.topic.colorName
                      },
                  created_at: record.created_at,
                  id_str: record.id_str
                };
                
                var totalAdded = 0;
                
                (function(payload) {
                    queue.add(payload, function(err, id) {
                        console.log('Loading ' + payload.text);
                        totalAdded ++;

                        if(tweets.length === totalAdded) {
                            console.log('All tweets loaded in the queue.');
                        }
                    });
                })(payload);

            }
        });
    });
}

var sw = require('stopword');


function prc() {
    return new Promise(function(resolve, reject) {
        console.log('Starting analysis...');
        
        mongodb.MongoClient.connect(database.localUrl2, function(err, db) {
            if(err) {
                console.log(err);
                reject(err);
            }

            var deadQueue = mongoDbQueue(db, 'dead-queue')
            var queue = mongoDbQueue(db, 'my-queue', { deadQueue : deadQueue });

            queue.total(function(err, count) {
                console.log('This queue has seen %d messages', count);
            });

            var processNextMessage = function() {
                queue.get(function(err, msg) {

                    if(err) {
                        console.log(err);
                        return;
                    }

                    if(!msg) {
                        console.log('No more messages, quitting...');
                        resolve('No more messages, quitting...');
                        return;
                    }

                    console.log('Got message ' + msg.ack);

                    var payload = msg.payload;

                    console.log("Detecting sentiment for: " + payload.text);

                    var str = payload.text;

                    str = str.replace(/(https?:\/\/[^\s]+)/g, "");

                    str = str.replace(/['!"#$%&\\'()\*+,\.\/:;<=>?@\[\\\]\^`{|}~']/g, "");
                    
                    str = str.replace(/['\-\_]/g, " ");

                    str = str.replace(/[0-9]/g, '');

                    str = str.replace(/\n/g, " ");

                    str = str.replace(/(\b(\w{1,2})\b(\s|$))/g,'');

                    str = XRegExp.replace(str, shortWordsUnicode, ""); // L: Letter

                    str = str.replace(/\s+/g, " ").toLowerCase();

                    var lngs = detectLanguage(str);
                    var lang = lngs.length ? lngs[0] : 'en';

                    var tokens = sw.removeStopwords(str.split(" "), sw[lang]);
                    var tokens = unique(tokens);

                    sentiscan(tokens, lang, function (err, result) {
                        if(err) {
                            console.log(err);
                        }

                        console.log("Sentiment: " + result.score);

                        var rec = {
                            'topic': payload.topic,
                            'text': payload.text,
                            'language': result.lang,
                            'location': payload.location,
                            'sentiment': result,
                            'sentiment_score': result.score,
                            'created_at': payload.created_at,
                            'id_str': payload.id_str
                        };


                        Record.create(rec, function (error, data) { 

                            if (error) {
                                console.log(error);
                                return;
                            }

                            console.log("Record added");

                            var words = rec.sentiment.words;
                            for(var i = 0; i < words.length; i++) {
                                Keyword.create({
                                    'created_at': new Date(),
                                    'topic':rec.topic,
                                    'word': words[i],
                                    'language': rec.language
                                });
                            }

                            console.log("Keywords added");

                            queue.ack(msg.ack, function(err, id) {
                                console.log('Acknoledging message ', msg.ack);

                                if (error) {
                                    console.log(err);
                                    return;
                                }

                                console.log('message ' + id + ' acknowledged');

                                processNextMessage();
                            });  

                        });

                    });
                });    
            };

            queue.size(function(err, count) {
                console.log('This queue has %d current messages', count);

                if(count <= 0) {
                    console.log('Queue empty, quitting..');
                    reject('Queue empty, quitting..');
                    return;
                }

                processNextMessage();
            });


        });
    });
}

//loadq();

//prc();

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}



//function proc2() {
//    console.log('called proc');
//    return new Promise(function(resolve, reject){
//        
//        // Usage!
//        sleep(25000).then(() => {
//            console.log('OK');
//            resolve('OK');
//        });
//    });
//}

// only one process is running. all new processes are discarded if there is one running
var limiterAnalysis = new Bottleneck(1, 0, 0, Bottleneck.strategy.OVERFLOW);

//new CronJob({
//    cronTime:'0 */1 * * * *',
//    runOnInit: false,
//    start: true,
//    onTick: function() {
//        console.log('Try to start analysis if not already running every 1 minute...');
//        limiterAnalysis.schedule(prc);
//    }
//});


var isoLangs = {
    "ukrainian":{
        "code":"uk",
        "nativeName":"українська"
    },
    "russian":{
        "code":"ru",
        "nativeName":"русский"
    },
    "english":{
        "code":"en",
        "nativeName":"english"
    }
};



function detectLanguage(text, suggestedLanguages) {
    var detectedLngs = (typeof suggestedLanguages != 'undefined') ? suggestedLanguages : [];

    console.log("Suggested languages: " + suggestedLanguages );
 
    var langs = lngDetector.detect(text, 2);

    for(var i = 0; i < langs.length; i++) {
        var language = langs[i];
        if(isoLangs[language[0]]) {
            detectedLngs.push(isoLangs[language[0]].code);
        }
    }

    detectedLngs = unique(detectedLngs);
    
    console.log("Detected languages: " + detectedLngs );
    
    return detectedLngs;
}




var str = "Читеров в Pokemon GO действительно ждёт перманентный бан https://t.co/CKk37X3dqy";
//var str = "Мне понравилось видео 'СОКОЛОВСКИЙ НА ТВ — АРЕСТ ЗА POKEMON GO' (https://t.co/FePKoBenns)";
//var str = "Продажи приставок Nintendo выросли на 80% благодаря успеху Pokemon Go: https://t.co/4fiVqgRsAg";


//var str = 'RT @ZaborZP: #зп_новости / Внимание, МАМОЧКИ И ПАПОЧКИ!)) /22 В тот же день 5 в Дубовке пройдет дошкольный праздник \"День К https://t.co/gTOCjq…';

//var str = "1 Ukrainian soldier killed, another 1 wounded near Popasna village: https://t.co/Ri5hhpHAgX \n\n#Donbas https://t.co/L0nPwLXlFh";

//var str="RT @noclador: #Donbas: no amphibious unit pre-war, no amphibious tech, no harbor, but magically they got a amphibious brigade... https://t.…";

//var str = "Document on troops' division in #Donbas region is ready, - #Ukraine’s Ambassador to #Germany https://t.co/aTIJbiY9FL https://t.co/MWRmWG5tcQ";

//var str = "Путин низко ко оценил крымские дороги, а ведь к его приезду в Севастополе асфальт перестилали и, наконец, запустили кольцо-развязку на 5 км!";
//
//
//var str = "МВС пропонує регулювати в Україні роботу Pokemon GO https://t.co/Rp61nSQF5n https://t.co/lUnVYfQnBz";
//
//var str = "RT @TetyanaStadnyk: 49 ceasefire violations at #Donbas yesterday https://t.co/sMmxbnA2Gz";
//

//var str = "Intence fighting detected in #Donetsk region, - #ATO HQ #Donbas https://t.co/vJZVXNR5pc";

//var str = 'RT @TetyanaStadnyk: New #Rus "humanitarian convoy" is coming to #Donbas . As most my friends know - more of #war escalation is coming https…';

//var str = 'RT @112NewsFeed: 21 attacks in #Donbas region reported, - #ATO2016 HQ #Ukraine https://t.co/L4ojkUSMXd https://t.co/8O7NEGXruU';

//var str = 'RT @112NewsFeed: Another #Russian ‘#humanitarianconvoy’ for #Donbas heads to #Rostov region https://t.co/EmW2RIh6LY https://t.co/7ScaiV7aDz';

//var str = 'One #Ukrainian serviceman killed in #Donbas over past 24 hours https://t.co/5y0aGcuK3t https://t.co/Xfcqg9yFPs';

var str= 'Порошенко та Меркель обговорили імплементацію мінських домовленостей https://t.co/hmUj1XVj5u #Львів #Lviv #Новини #Порошенко #Меркель';

var str= 'RT @A-Trigub: Выводы по аудиту сайта Школа Йоги - amritnam.ru #АлександрТригуб #МудрыйБизнес #ИнтернетПродажи #УвеличениеПродаж... https://…';

var lang = detectLanguage(str);

console.log(lang[0]);

str = str.replace(/(https?:\/\/[^\s]+)/g, "");

str = str.replace(/['!"#$%&\\'()\*+,\.\/:;<=>?@\[\\\]\^`{|}~']/g, "");

str = str.replace(/['\-\_]/g, " ");

str = str.replace(/[0-9]/g, '');

str = str.replace(/\n/g, " ");

str = str.replace(/(\b(\w{1,2})\b(\s|$))/g,'');

str = XRegExp.replace(str, shortWordsUnicode, ""); // L: Letter

str = str.replace(/\s+/g, " ").toLowerCase();

var tokens = sw.removeStopwords(str.split(" "), sw[lang[0]]);
var tokens = unique(tokens);

console.log(tokens);

sentiscan(tokens, lang[0], function (err, result) {
    console.log(result);
});
