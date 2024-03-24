require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const petRouter = require('./api/routes/pets');
const userRouter = require('./api/routes/user');

// Connect to database
const uri = `mongodb+srv://${process.env.MONGO_ATLAS_PW}@petfindrestapi.z08dekv.mongodb.net/?retryWrites=true&w=majority&appName=PetFindRestAPI`;
mongoose
	.connect(uri)
	.then(() => {
		// Start listening for requests
		const port = process.env.PORT || 3000;
		app.listen(port, () => {
			console.log(`App running on port ${port}`);
		});
	})
	.catch(err => console.log(err));

app.use('/uploads/', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS
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

// Handle routes
app.use('/pets', petRouter);
app.use('/user', userRouter);

// Throw error if route wasn't found
app.use((req, res, next) => {
	const error = new Error('Not found');
	error.status = 404;
	next(error);
});

// Handle errors
app.use((err, req, res, next) => {
	console.log(err);
	res.status(err.status || 500).json({ error: err });
});
