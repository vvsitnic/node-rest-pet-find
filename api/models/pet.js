const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const emailValidator = email => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

const petSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    userId: {
      type: String,
      required: true,
    },
    petName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    details: String,
    petImage: { type: String, required: true },
    petImageUrl: { type: String, required: false },
    contacts: {
      phone: {
        type: Number,
        required: true,
      },
      email: {
        type: String,
        validate: {
          validator: emailValidator,
          message: 'Not a valid email!',
        },
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
    dateLost: {
      type: Number,
      required: true,
    },
    reward: Boolean,
  },
  { timestamps: true }
);

petSchema.index({ location: '2dsphere' });

const Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;
