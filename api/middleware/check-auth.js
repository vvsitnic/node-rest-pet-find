const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	try {
		const decoded = jwt.verify(req.body.token, 'secretKey');
		req.userData = decoded;
	} catch (err) {
		return res.status(401).json({
			message: 'Auth failed',
		});
	}
	next();
};
