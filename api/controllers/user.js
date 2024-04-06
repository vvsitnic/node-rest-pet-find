require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const user_signup = (req, res, next) => {
	User.findOne({ email: req.body.email })
		.exec()
		.then(user => {
			if (user) {
				return res.status(409).json({ message: 'Mail exists' });
			} else {
				bcrypt.hash(req.body.password, 10, (err, hash) => {
					if (err) {
						next(new Error(err)); //??????????????????
					} else {
						const user = new User({
							_id: new mongoose.Types.ObjectId(),
							email: req.body.email,
							password: hash,
							name: req.body.name,
						});
						user.save()
							.then(result => {
								console.log(result);
								res.status(201).json({
									message: 'User created',
								});
							})
							.catch(err => next(err));
					}
				});
			}
		})
		.catch(err => next(err));
};

const user_login = (req, res, next) => {
	User.findOne({ email: req.body.email })
		.exec()
		.then(user => {
			if (!user) {
				return res.status(401).json({
					message: 'Auth failed',
				});
			}
			bcrypt.compare(
				req.body.password,
				user.password,
				(err, response) => {
					if (err) {
						return res.status(401).json({
							message: 'Auth failed',
						});
					}
					if (response) {
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

					res.status(401).json({
						message: 'Auth failed',
					});
				}
			);
		})
		.catch(err => next(err));
};

const delete_user = (req, res, next) => {
	if (req.params.id !== req.userData.id)
		return res.status(403).json({ message: 'Err' });

	User.deleteOne({ _id: req.params.id })
		.exec()
		.then(() => {
			console.log(`User deleted`);
			res.status(200).json({ message: 'User deleted' });
		})
		.catch(err => next(err));
};

module.exports = {
	user_signup,
	user_login,
	delete_user,
};
