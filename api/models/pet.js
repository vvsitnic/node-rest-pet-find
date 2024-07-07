const isValidPhoneNumber = require('libphonenumber-js');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const phoneValidator = phone => {
  if (!phone) return false;
  return isValidPhoneNumber(phone, 'MD'); // Set country dynamically
};

const petSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    user_id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      maxLength: 25,
    },
    long_description: {
      type: String,
      required: true,
    },
    short_description: {
      type: String,
      required: true,
      maxLength: 250,
    },
    image_key: { type: String, required: true },
    contacts: {
      phone: {
        type: String,
        validate: {
          validator: phoneValidator,
        },
      },
      email: {
        type: String,
        match:
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      },
    },
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
    date_lost: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

petSchema.index({ location: '2dsphere' });

const Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;
