const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads/');
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + file.originalname);
	},
});

const fileFilter = (req, file, cb) => {
	// Reject
	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

const upload = multer({
	storage: storage,
	limits: { fileSize: 1024 * 1024 * 5 },
	fileFilter: fileFilter,
});

const checkAuth = require('../middleware/check-auth');
const PetsController = require('../controllers/pets');

router.get('/on-map', PetsController.pets_on_map);

router.get('/nearby', PetsController.pets_nearby);

router.get('/pets-of-user/:id', checkAuth, PetsController.get_pets_of_user);

router.post(
	'/create',
	checkAuth,
	upload.single('petImg'),
	PetsController.create_pet
);

router
	.route('/:id')
	.get(PetsController.get_pet)
	// .patch(checkAuth, )
	.delete(checkAuth, PetsController.delete_pet);

module.exports = router;
