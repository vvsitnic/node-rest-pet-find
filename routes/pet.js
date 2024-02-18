const express = require('express');
const router = express.Router();

const admin = require('firebase-admin');
const serviceAccount = require('../key.json');

import {
	getFirestore,
	doc,
	setDoc,
	addDoc,
	collection,
} from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js';

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

router
	.route('/')
	.get((req, res) => {
		res.json({ message: 'pets' });
	})
	.post(async (req, res) => {
		// const pet = {
		// 	name: req.body.name,
		// 	coords: req.body.coords,
		// };

		// res.json({
		// 	message: 'Creating new pet',
		// 	pet: pet,
		// });

		try {
			const pet = {
				name: req.body.name,
				coords: req.body.coords,
			};

			const docRef = await addDoc(collection(db, 'pets'), pet);
			console.log('Document written with ID: ', docRef.id);
		} catch (e) {
			console.error('Error adding document: ', e);
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
