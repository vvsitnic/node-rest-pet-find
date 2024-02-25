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
		const margins = req.body;

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

		const arr = [];
		snapshot.forEach(doc => {
			const obj = {
				id: doc.id,
				petInfo: doc.data(),
			};
			arr.push(obj);
		});

		res.json(arr);
	} catch (err) {
		next(err);
	}
	console.log(req.body);
});

router.post('/', async (req, res, next) => {
	// Create new pet doc
	try {
		const pet = {
			name: req.body.name,
			description: req.body.description,
			coords: req.body.coords,
			email: req.body.email,
			phone: req.body.phone,
		};

		const docRef = await db.collection('pets').doc().set(pet);

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
				res.json({ id: doc.id, petInfo: doc.data() });
			} else {
				throw new Error('No document found');
			}
		} catch (err) {
			next(err);
		}
	})
	.put(async (req, res, next) => {
		// Edit data of pet with specific id
		try {
			const pet = {
				name: req.body.name,
				description: req.body.description,
				coords: req.body.coords,
				email: req.body.email,
				phone: req.body.phone,
			};

			const docRef = await db
				.collection('pets')
				.doc(req.params.id)
				.update(pet);

			// Return id
			res.json({ id: docRef.id });
		} catch (err) {
			next(err);
		}
	})
	.delete(async (req, res, next) => {
		// Delete pet with specific id
		try {
			const docRef = await db
				.collection('pets')
				.doc(req.params.id)
				.delete();
		} catch (err) {
			next(err);
		}
	});

module.exports = router;
