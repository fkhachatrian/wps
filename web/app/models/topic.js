var mongoose = require('mongoose');

var schema = new mongoose.Schema({ 
    name: 'string', 
    color: 'string',
    last_scraped: 'Date'
});
module.exports = mongoose.model('Topic', schema);