var mongoose = require('mongoose');

var schemaTweet = new mongoose.Schema({
    'created_at': 'date',
    'id' :'Number',
    'id_str': {type: 'string', index: true},
    'text': 'string',
    'truncated' : 'boolean',
    'entities': 'array',
    'source' : 'string',
    'in_reply_to_status_id' :  'Number',
    'in_reply_to_status_id_str': 'string',
    'in_reply_to_user_id': 'Number',
    'in_reply_to_user_id_str': 'string',
    'in_reply_to_screen_name': 'string',
    'user': 'Mixed',
    'place': 'Mixed',
    'geo': 'Mixed',
    'contributors': 'array',
    'is_quote_status': 'boolean',
    'retweet_count': 'Number',
    'favorited': 'boolean',
    'retweeted': 'boolean',
    'lang': 'string',
    'topic': 'Mixed',
    'location': 'Mixed'
});

module.exports = mongoose.model('Tweet', schemaTweet);