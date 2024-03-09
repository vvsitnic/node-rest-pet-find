const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Pet = require('../models/pet.js');

router.get('/on-map', (req, res, next) => {
	// Fetch pets that are in configurable are
	// localhost:3000/pets/on-map?n=&e=&s=&w=&f=
	// TODO: change names of variables
	const { n, e, s, w } = req.query;
	const filter = req.query.f || '';

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
});

router.get('/nearby', (req, res, next) => {
	// Fetch pets that are nearby, with the radius being a configurable parameter.
	// localhost:3000/pets/nearby?lat=&lng=&d=&f=
	const { lat, lng, d: distance } = req.query;
	const filter = req.query.f || '';

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
});

router.post('/create', (req, res, next) => {
	// Create new pet doc
	const pet = new Pet({
		_id: new mongoose.Types.ObjectId(),
		petName: req.body.petName,
		petOwner: req.body.petOwner,
		phone: req.body.phone,
		email: req.body.email,
		location: {
			type: 'Point',
			coordinates: [req.body.coords.lng, req.body.coords.lat],
		},
		dateLost: req.body.dateLost,
	});
	pet.save()
		.then(result => {
			console.log(result);
			res.status(201).json({ id: result.id });
		})
		.catch(err => next(err));
});

router
	.route('/:id')
	.get((req, res, next) => {
		// Get pet by id
		// localhost:3000/pets/:id?f=
		const id = req.params.id;
		const filter = req.query.f || '';
		Pet.findById(id, filter)
			.exec()
			.then(doc => {
				res.status(200).json(doc);
			})
			.catch(err => next(err));
	})
	// .patch(async (req, res, next) => {
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
	// })
	.delete((req, res, next) => {
		// Delete pet with specific id
		Pet.deleteOne({ _id: req.params.id })
			.exec()
			.then(() => {
				console.log(`Pet deleted`);
				res.status(200).json({ message: 'Pet deleted' });
			})
			.catch(err => next(err));
	});

module.exports = router;
