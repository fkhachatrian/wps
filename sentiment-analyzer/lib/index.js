/**
 * AFINN-based RU/UK/EN sentiment analysis for Node.js
 *
 * @package sentiment
 * @author Felix Romanos <felix.romanos@gmail.org>
 */

var afinnEN = require('../build/en.json');
var afinnRU = require('../build/ru.json');
var afinnUK = require('../build/uk.json');

var dictionaries = {
    'en': afinnEN,
    'ru': afinnRU,
    'uk': afinnUK
};

var natural = require('natural');
var tokenizer = new natural.WordTokenizer();


var FuzzySearch = require('fuzzysearch-js');
var levenshteinFS = require('fuzzysearch-js/js/modules/LevenshteinFS');
var indexOfFS = require('fuzzysearch-js/js/modules/IndexOfFS');
var wordCountFS = require('fuzzysearch-js/js/modules/WordCountFS');

/**
 * Performs sentiment analysis on the provided input 'phrase'.
 *
 * @param {String} Input phrase
 *
 * @return {Object}
 */
module.exports = function (tokens, lang, callback) {
    // Parse arguments
    if (typeof callback === 'undefined') callback = null;

    // Storage objects
    var score       = 0,
        words       = [],
        positive    = [],
        negative    = [];

    var dictionary = dictionaries[lang];

    var fuzzySearch = new FuzzySearch(dictionary, {
        'minimumScore': getMinimumScore(lang),  
        'caseSensitive': false, 
        'termPath': 'word',
        returnEmptyArray: true
    }); 
    
    fuzzySearch.addModule(levenshteinFS({'maxDistanceTolerance': 3, 'factor': 3}));
    fuzzySearch.addModule(indexOfFS({'minTermLength': 5, 'maxIterations': 100, 'factor': 2}));

    // Iterate over tokens
    var len = tokens.length;
    while (len--) { 
        //var obj = natural.PorterStemmer.stem(tokens[len]);
        
        var obj = tokens[len];
        
        var objIntact = tokens[len];
        
        var result = fuzzySearch.search(obj);
        if(!result.length) continue;
        
        console.log(">>>>", obj);
        
        console.log(result, result[0].details[0], result[0].details[1], result[0].details[2]);
        
        if(result[1]) {
            console.log(result[1].details[0], result[1].details[1], result[1].details[2]);
        }
        
        if(result[2]) {
            console.log(result[2].details[0], result[2].details[1], result[2].details[2]);
        }
         
//        var matchesLength = Math.min(2, result.length);
//        var valence = 0;
//        for(var i = 0; i < matchesLength; i++) {
//            valence += result[i].value.valence;
//        }
        
//        valence = valence/matchesLength;
        
        var valence = result[0].value.valence;
        
        words.push(objIntact);
        if (valence > 0) positive.push(objIntact);
        if (valence < 0) negative.push(objIntact);

        score += valence;
    }

    // Handle optional async interface
    var result = {
        score:          score,
        comparative:    score / tokens.length,
        tokens:         tokens,
        words:          words,
        positive:       positive,
        negative:       negative,
        lang:           lang
    };

    if (callback === null) return result;
    process.nextTick(function () {
        callback(null, result);
    });
};

function getMinimumScore(lang) {
    if(lang == 'en') {
        return 340;
    }
    
    return 300;
}