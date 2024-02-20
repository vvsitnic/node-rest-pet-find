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
		res.json({ message: 'pets' });
	})
	.post(async (req, res) => {
		try {
			const pet = {
				name: req.body.name,
				coords: req.body.coords,
			};

			const docRef = db.collection('pets').doc('pet');
			await docRef.set(pet);
		} catch (err) {
			console.error('Error adding document: ', err);
		}
	});

router
	.route('/:id')
	.get((req, res) => {
		res.json({
			message: 'Getting pet with requested ID',
			petId: req.params.petId,
		});
	})
	.put((req, res) => {
		res.json({
			message: 'Updating pet info with requested ID',
			petId: req.params.petId,
		});
	})
	.delete((req, res) => {
		res.json({
			message: 'Deleting pet with requested ID',
			petId: req.params.petId,
		});
	});

router.get('/on-map', (req, res) => {
	res.json({ message: 'list of pets' });
});

module.exports = router;
