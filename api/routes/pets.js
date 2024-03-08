const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Pet = require('../models/pet.js');

router.get('/on-map', (req, res, next) => {
	// Fetch pets that are in configurable are
	// localhost:3000/pets/on-map?mnlat=&mxlat=&mnlng=&mxlng=
	const {
		mnlat: minLat,
		mxlat: maxLat,
		mnlng: minLng,
		mxlng: maxLng,
	} = req.query;

	Pet.find({
		$and: [
			{
				'coords.lat': {
					$gte: minLat,
					$lte: maxLat,
				},
			},
			{
				'coords.lng': {
					$gte: minLng,
					$lte: maxLng,
				},
			},
		],
	})
		.exec()
		.then(result => {
			console.log(result);
			res.status(200).json(result);
		})
		.catch(err => next(err));
});

router.get('/nearby', (req, res, next) => {
	// Fetch pets that are nearby, with the radius being a configurable parameter.
	// localhost:3000/pets/nearby?lat=&lng=&d=
	const { lat, lng, d: distance } = req.query;

	Pet.find({
		location: {
			$near: {
				$geometry: {
					type: 'Point',
					coordinates: [lng, lat],
				},
				$maxDistance: distance,
			},
		},
	})
		.exec()
		.then(result => {
			console.log(result);
			res.status(200).json(result);
		})
		.catch(err => next(err));
});

router.post('/', (req, res, next) => {
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
			res.status(200).json({ id: result.id });
		})
		.catch(err => next(err));
});

router
	.route('/:id')
	.get((req, res, next) => {
		// Get pet by id
		// localhost:3000/pets/:id?q=
		const id = req.params.id;
		const filter = req.query.q || '';
		Pet.findById(id, `${filter}`)
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
		const id = req.params.id;
		Pet.deleteOne({ _id: id })
			.exec()
			.then(() => {
				console.log(`${id} deleted successfully`);
			})
			.catch(err => next(err));
	});

module.exports = router;
