const express = require('express');
const router = express.Router();

router
	.route('/')
	.get((req, res) => {
		res.json({ message: 'pets' });
	})
	.post((req, res) => {
		const pet = {
			name: req.body.name,
			coords: req.body.coords,
		};

		res.json({
			message: 'Creating new pet',
			pet: pet,
		});
	});

// Defined route in one location
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
