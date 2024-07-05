require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const user_signup = async (req, res, next) => {
  try {
    // Check if user exists
    const user = await User.findOne({ email: req.body.email }).exec();

    if (user) {
      return res.status(409).json({ message: 'Mail alreay exists' });
    }

    // Hash password so it was unreadable in db
    bcrypt.hash(req.body.password, 10, async (err, hash) => {
      try {
        // Check for error
        if (err) {
          throw new Error(err);
        }

        // Create user if no error appeard
        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          email: req.body.email,
          password: hash,
          name: req.body.name,
        });
        result = await user.save();

        res.status(201).json({
          message: 'User created',
        });
      } catch (err) {
        throw err;
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'An error occured' });
  }
};

const user_login = async (req, res, next) => {
  try {
    // Check if user exists
    const user = await User.findOne({ email: req.body.email }).exec();

    if (!user) {
      return res.status(401).json({
        message: 'Wrong email or password',
      });
    }

    // Check if password is correct
    bcrypt.compare(req.body.password, user.password, (err, response) => {
      // On error
      if (err) {
        return res.status(401).json({
          message: 'Wrong email or password',
        });
      }

      // On success
      if (response) {
        // Create a jwt token
        const token = jwt.sign(
          {
            email: user.email,
            id: user.id,
          },
          process.env.ACCESSS_TOKE_SECRET,
          {
            expiresIn: '1h',
          }
        );

        return res.status(201).json({
          message: 'Auth successeful',
          token: token,
        });
      }

      // In case none of requirements above are met
      res.status(401).json({
        message: 'Auth failed',
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occured' });
  }
};

const delete_user = async (req, res, next) => {
  try {
    // Check if user is the one
    if (req.params.id !== req.userData.id)
      return res.status(403).json({ message: 'Err' });

    // Delete user
    await User.deleteOne({ _id: req.params.id }).exec();
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'An error occured' });
  }
};

module.exports = {
  user_signup,
  user_login,
  delete_user,
};
