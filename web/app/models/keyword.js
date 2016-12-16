var mongoose = require('mongoose');

var schemaKeyword = new mongoose.Schema({
    'created_at': 'date',
    'language': 'string',
    'topic': 'Mixed',
    'word': 'Mixed'
});

module.exports = mongoose.model('Keyword', schemaKeyword);