const express = require('express');
const router = express.Router();
const userController = require(`../controllers/user`);

router.post('/signup', userController.user_signup);

router.post('/login', userController.user_login);

router.delete('/:id', userController.delete_user);

module.exports = router;
