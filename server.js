const express = require('express');
const app = express();

app.get('/', (req, res) => {
	res.status(500).json({ message: 'Error' });
});

app.listen(process.env.PORT || 3000);
