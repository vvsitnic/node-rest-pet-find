const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	try {
		token = req.headers.authorization.split(' ')[1];
		const decoded = jwt.verify(
			token,
			'2502014df51cd292ffa8eb8b21de27a438c501ce567792088e3b115d81f752fb131ecad5628183691e380c2109d5b7222f9ac7137ec9bdd4e61875faa332a9bb'
		);
		req.userData = decoded;
	} catch (err) {
		return res.status(401).json({
			message: 'Auth failed',
		});
	}
	next();
};
