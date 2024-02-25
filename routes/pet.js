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

router.get('/on-map', async (req, res, next) => {
	// Find pets on specific are of the world
	try {
		const margins = {
			northEast: { lat: 47.03956797158309, lng: 28.859646320343018 },
			southWest: { lat: 47.030793296472865, lng: 28.844797611236576 },
		};

		const petRef = db.collection('pets');
		const snapshot = await petRef
			.where(
				'coords.lat',
				'>=',
				margins.northEast.lng,
				'&&',
				'coords.lat',
				'<=',
				margins.northEast.lat,
				'&&',
				'coords.lat',
				'<=',
				margins.northEast.lat,
				'&&',
				'coords.lng',
				'>=',
				margins.southWest.lng,
				'&&',
				'coords.lng',
				'<=',
				margins.southWest.lat
			)
			.get();
		snapshot.forEach(doc => {
			console.log(doc.id, '=>', doc.data());
		});
	} catch (err) {
		next(err);
	}
	console.log(req.body);
});

router
	.route('/')
	.get((req, res) => {
		// Get all pets in datagbse
	})
	.post(async (req, res, next) => {
		// Create new pet doc
		try {
			const pet = {
				name: req.body.name,
				description: req.body.description,
				coords: req.body.coords,
				email: req.body.email,
				phone: req.body.phone,
			};

			const docRef = db.collection('pets').doc();
			await docRef.set(pet);

			// Return id
			res.json({ id: docRef.id });
		} catch (err) {
			next(err);
		}
	});

router
	.route('/:id')
	.get(async (req, res, next) => {
		// Find pet by id
		try {
			const petRef = db.collection('pets').doc(req.params.id);
			const doc = await petRef.get();
			if (doc.exists) {
				res.json(doc.data());
			} else {
				throw new Error('No such document');
			}
		} catch (err) {
			next(err);
		}
	})
	.put((req, res) => {
		// Edit data of pet with specific id
	})
	.delete((req, res) => {
		// Delete pet with specific id
	});

module.exports = router;
