const mongoose = require('mongoose');

const petSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	petName: String,
	petOwner: String,
	phone: Number,
	email: String,
	coords: {
		lat: Number,
		lng: Number,
	},
	dateLost: Number,
});

module.exports = mongoose.model('Pet', petSchema);
