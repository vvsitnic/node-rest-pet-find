const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.json({ message: 'pets' });
});

// Defined route in one location
router
	.route('/:id')
	.get((req, res) => {
		console.log(req.pet);
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

module.exports = router;
