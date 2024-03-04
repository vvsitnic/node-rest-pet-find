const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const { connectToDb, getDb } = require('./db');

// db connection
let db;

connectToDb(err => {
	if (!err) {
		app.listen(process.env.PORT || 3000, () => {
			console.log('App running');
		});
		db = getDb();
	}
});

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

const petRouter = require('./routes/pets.js');
app.use('/pets', petRouter);

app.use((req, res, next) => {
	const error = new Error('Not found');
	error.status = 404;
	next(error);
});

app.use((err, req, res, next) => {
	res.status(err.status || 500).json({ error: err });
});
