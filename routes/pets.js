const express = require('express');
const router = express.Router();

router.get('/on-map', async (req, res, next) => {
	// Find pets on specific are of the world
});

router.post('/', async (req, res, next) => {
	// Create new pet doc
});

router
	.route('/:id')
	.get(async (req, res, next) => {
		// Find pet by id
	})
	.put(async (req, res, next) => {
		// Edit data of pet with specific id
	})
	.delete(async (req, res, next) => {
		// Delete pet with specific id
	});

module.exports = router;
