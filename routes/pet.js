const express = require('express');
const router = express.Router();

const {
	initializeApp,
	applicationDefault,
	cert,
} = require('firebase-admin/app');
const {
	getFirestore,
	Timestamp,
	FieldValue,
	Filter,
} = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccountKey.json');

initializeApp({
	credential: cert(serviceAccount),
});

const db = getFirestore();

router
	.route('/')
	.get((req, res) => {
		// Get all pets in datagbse
	})
	.post(async (req, res, next) => {
		// Create new pet doc
		const petId = Date.now();
		try {
			const pet = {
				id: petId,
				name: req.body.name,
				description: req.body.description,
				coords: req.body.coords,
				email: req.body.email,
				phone: req.body.phone,
			};

			const docRef = db.collection('pets').doc('pet');
			await docRef.set(pet);

			// Return id
			res.json({ id: petId });
		} catch (err) {
			// console.error('Error adding document: ', err);
			next(err);
		}
	});

router
	.route('/:id')
	.get(async (req, res) => {
		// Find pet by id
	})
	.put((req, res) => {
		// Edit data of pet with specific id
	})
	.delete((req, res) => {
		// Delete pet with specific id
	});

router.get('/on-map', (req, res) => {
	// Find pets on specific are of the world
});

module.exports = router;
