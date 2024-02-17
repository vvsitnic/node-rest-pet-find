const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	const coords = req.query.p.split(' ');
	console.log(coords);

	res.json({ message: 'list of pets' });
});

module.exports = router;
