var mongoose = require('mongoose');

var schemaInstagramMedia = new mongoose.Schema({
    "distance": 'Number',
    "type": "string",
    "users_in_photo": 'array',
    "filter": "string",
    "tags": 'array',
    "comments": "Mixed",
    "caption": "string",
    "likes": "Mixed",
    "link": "string",
    "user": "Mixed",
    "created_time": "date",
    "images": "Mixed",
    "id": "string",
    "location": "Mixed",
    'topic': "Mixed"
});

module.exports = mongoose.model('InstagramMedia', schemaInstagramMedia);