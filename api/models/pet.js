const mongoose = require('mongoose');

const petSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	petName: {
		type: String,
		required: true,
	},
	petOwner: {
		type: String,
		required: true,
	},
	phone: {
		type: Number,
		required: true,
	},
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
	dateLost: {
		type: Number,
		required: true,
	},
});

petSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Pet', petSchema);
