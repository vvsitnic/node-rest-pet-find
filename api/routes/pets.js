const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const PetsController = require('../controllers/pets');

router.get('/on-map', PetsController.pets_on_map);

router.get('/nearby', PetsController.pets_nearby);

router.post('/create', checkAuth, PetsController.create_pet);

router
	.route('/:id')
	.get(PetsController.get_pet)
	// .patch(checkAuth, )
	.delete(checkAuth, PetsController.delete_pet);

module.exports = router;
