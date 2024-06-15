require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.ACCESSS_TOKE_SECRET);
    req.userData = decoded;
  } catch (err) {
    return res.status(401).json({
      message: 'Auth failed',
    });
  }
  next();
};
