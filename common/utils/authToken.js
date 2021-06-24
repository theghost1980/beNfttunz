const config = require('../config');
const jwt = require('jsonwebtoken');

async function authenticateToken(req, res, next) {
    const token = req.headers["token"];
    jwt.verify(token, config.jwtSecret, (err, user) => {
      // console.log(err, user);
      if (err) {
        res
          .status(403)
          .json({ message: "Unauthorized access", status: "failed" });
        return;
      }
      req.user = user;
      next();
    });
};

module.exports = authenticateToken;


