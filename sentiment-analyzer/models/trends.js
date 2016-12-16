var mongoose = require('mongoose');

var schemaTrends = new mongoose.Schema({ 
	trends: 'array',
	as_of: 'date',
	created_at: 'date',
	locations: 'array'
});

module.exports = mongoose.model('Trends', schemaTrends);