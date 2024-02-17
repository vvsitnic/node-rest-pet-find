const express = require('express');
const app = express();

app.get('/', (req, res) => {
	res.json({ message: 'Nothing here' });
});

const petRouter = require('./routes/pet.js');
const petsOnMapRouter = require('./routes/petsOnMap.js');

app.use('/pets', petRouter);
app.use('/on-map', petsOnMapRouter);

app.listen(process.env.PORT || 3000);
