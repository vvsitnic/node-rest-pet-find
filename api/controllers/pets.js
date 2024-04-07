const mongoose = require('mongoose');
const Pet = require('../models/pet.js');
const fs = require('fs');

const pets_on_map = (req, res, next) => {
	// Fetch pets that are in configurable are
	// localhost:3000/pets/on-map?n=&e=&s=&w=&f=
	// TODO: change names of variables
	const { n, e, s, w } = req.query;
	const filter = req.query.f || ''; //.replace('userEmail', '')

	Pet.find(
		{
			location: {
				$geoWithin: {
					$box: [
						[+e, +n],
						[+w, +s],
					],
				},
			},
		},
		filter
	)
		.exec()
		.then(result => {
			console.log(result);
			res.status(200).json(result);
		})
		.catch(err => next(err));
};

const pets_nearby = (req, res, next) => {
	// Fetch pets that are nearby, with the radius being a configurable parameter.
	// localhost:3000/pets/nearby?lat=&lng=&d=&f=
	const { lat, lng, d: distance } = req.query;
	const filter = req.query.f || ''; //.replace('userEmail', '')

	Pet.find(
		{
			location: {
				$near: {
					$geometry: {
						type: 'Point',
						coordinates: [lng, lat],
					},
					$maxDistance: distance,
				},
			},
		},
		filter
	)
		.exec()
		.then(result => {
			console.log(result);
			res.status(200).json(result);
		})
		.catch(err => next(err));
};

const create_pet = async (req, res, next) => {
	// Create new pet doc
	try {
		const petData = JSON.parse(req.body.petData);
		const pet = new Pet({
			_id: new mongoose.Types.ObjectId(),
			userId: req.userData.id,
			petName: petData.petName,
			description: petData.description,
			details: petData.details,
			petImage: req.file.path,
			contacts: {
				phone: petData.contacts.phone,
				email: petData.contacts.email,
			},
			location: {
				type: 'Point',
				coordinates: [petData.coords.lng, petData.coords.lat],
			},
			dateLost: petData.dateLost,
			reward: petData.reward,
		});
		const result = await pet.save();

		res.status(201).json({ id: result.id });
	} catch (err) {
		next(err);
	}
};

const get_pet = (req, res, next) => {
	// Get pet by id
	// localhost:3000/pets/:id?f=
	const id = req.params.id;
	const filter = req.query.f || ''; //.replace('userEmail', '')
	Pet.findById(id, filter)
		.exec()
		.then(doc => {
			res.status(200).json(doc);
		})
		.catch(err => next(err));
};

const get_pets_of_user = async (req, res, next) => {
	// Get pet by id
	// localhost:3000/pets-of-user/:id?f=
	try {
		if (req.params.id !== req.userData.id)
			return res.status(403).json({ message: 'Err' });

		const filter = req.query.f || ''; //.replace('userEmail', '')
		const docs = await Pet.find({ userId: req.params.id }, filter).exec();
		res.status(200).json(docs);
	} catch (err) {
		next(err);
	}
};

// (req, res, next) => {
// 	Edit data of pet with specific id
// 	const id = req.params.id;
// 	Pet.updateOne({ _id: id })
// 		.exec()
// 		.then(() => {
// 			console.log(`${id} deleted successfully`);
// 		})
// 		.catch(err => {
// 			console.log(err);
// 			res.status(500).json({ error: err });
// 		});
// }

const delete_pet = (req, res, next) => {
	// Delete pet with specific id
	Pet.deleteOne({ _id: req.params.id, userId: req.userData.id })
		.exec()
		.then(doc => {
			if (doc.deletedCount === 0)
				return res.status(403).json({ message: 'Pet not found' });

			res.status(200).json({ message: 'Pet deleted' });
		})
		.catch(err => next(err));
};

module.exports = {
	pets_on_map,
	pets_nearby,
	create_pet,
	get_pet,
	delete_pet,
	get_pets_of_user,
};
