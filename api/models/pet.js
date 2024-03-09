const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const petSchema = new Schema({
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

const Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;
