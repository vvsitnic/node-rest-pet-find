const mongoose = require('mongoose');

const petSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	petName: String,
	petOwner: String,
	phone: Number,
	email: String,
	location: {
		type: {
			type: String,
			enum: ['Point'],
			required: true,
		},
		coordinates: {
			type: [Number],
			required: true,
		},
	},
	dateLost: Number,
});

petSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Pet', petSchema);
