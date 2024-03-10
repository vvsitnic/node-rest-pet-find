const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const petsController = require('../controllers/pets');

router.get('/on-map', petsController.pets_on_map);

router.get('/nearby', petsController.pets_nearby);

router.post('/create', checkAuth, petsController.create_pet);

router
	.route('/:id')
	.get(petsController.get_pet)
	// .patch(checkAuth, )
	.delete(checkAuth, petsController.delete_pet);

module.exports = router;
