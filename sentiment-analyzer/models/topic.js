var mongoose = require('mongoose');

var schema = new mongoose.Schema({ name: 'string', color: 'string'});
module.exports = mongoose.model('Topic', schema);