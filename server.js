const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const petRouter = require('./api/routes/pets.js');

mongoose.connect('mongodb://0.0.0.0:27017/pet-find');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	if (req.method === 'OPTIONS') {
		res.header(
			'Access-Control-Allow-Methods',
			'PUT, POST, PATCH, DELETE, GET'
		);
		return res.status(200).json({});
	}
	next();
});

app.use('/pets', petRouter);

app.use((req, res, next) => {
	const error = new Error('Not found');
	error.status = 404;
	next(error);
});

app.use((err, req, res, next) => {
	console.log(err);
	res.status(err.status || 500).json({ error: err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`App running on port ${port}`);
});
