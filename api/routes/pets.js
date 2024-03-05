const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Pet = require('../models/pet.js');

router.get('/on-map', async (req, res, next) => {
	// Find pets on specific are of the world
});

router.post('/', async (req, res, next) => {
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
			console.log(result);
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({ error: err });
		});
});

router
	.route('/:id')
	.get(async (req, res, next) => {
		// Get pet by id
		const id = req.params.id;
		Pet.findById(id)
			.exec()
			.then(doc => {
				console.log(doc);
				res.status(200).json(doc);
			})
			.catch(err => {
				console.log(err);
				res.status(500).json({ error: err });
			});
	})
	.patch(async (req, res, next) => {
		// Edit data of pet with specific id
		// const id = req.params.id;
		// Pet.updateOne({ _id: id })
		// 	.exec()
		// 	.then(() => {
		// 		console.log(`${id} deleted successfully`);
		// 	})
		// 	.catch(err => {
		// 		console.log(err);
		// 		res.status(500).json({ error: err });
		// 	});
	})
	.delete(async (req, res, next) => {
		// Delete pet with specific id
		const id = req.params.id;
		Pet.deleteOne({ _id: id })
			.exec()
			.then(() => {
				console.log(`${id} deleted successfully`);
			})
			.catch(err => {
				console.log(err);
				res.status(500).json({ error: err });
			});
	});

module.exports = router;
