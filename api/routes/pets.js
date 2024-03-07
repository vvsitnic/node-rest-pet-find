const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Pet = require('../models/pet.js');

router.get('/on-map', (req, res, next) => {
	// Find pets on specific are of the world
	const { northEast, southWest } = req.body;

	Pet.find({
		$and: [
			{
				'coords.lat': {
					$lte: northEast.lat,
					$gte: southWest.lat,
				},
			},
			{
				'coords.lng': {
					$lte: northEast.lng,
					$gte: southWest.lng,
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

router.get('/radius', (req, res, next) => {
	// Find pets on specific are of the world
	/*
	{
		coords: {a, b}
		distance:
	} 
	*/
	const { lat, lng } = req.body.coords;
	const distanceInKm = req.body.distance;
	const distanceInDegres = distanceInKm / 111;

	Pet.find({
		$and: [
			{
				'coords.lat': {
					$lte: lat + distanceInDegres,
					$gte: lat - distanceInDegres,
				},
			},
			{
				'coords.lng': {
					$lte: lng + distanceInDegres,
					$gte: lng - distanceInDegres,
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

router.post('/', (req, res, next) => {
	// Create new pet doc
	const pet = new Pet({
		_id: new mongoose.Types.ObjectId(),
		petName: req.body.petName,
		petOwner: req.body.petOwner,
		phone: req.body.phone,
		email: req.body.email,
		coords: {
			lat: req.body.coords.lat,
			lng: req.body.coords.lng,
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
		const id = req.params.id;
		Pet.findById(id, `${req.query.q === 'short' ? 'petName, phone' : ''}`)
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
