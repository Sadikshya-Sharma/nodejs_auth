const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ msg: 'Authorization token missing' });
    }

    // Remove 'Bearer ' from the beginning of the token string
    const tokenWithoutBearer = token.replace('Bearer ', '');

    // Verify the token using the secret key (process.env.ACCESS_TOKEN_SECRET)
    const decodedToken = jwt.verify(tokenWithoutBearer, process.env.ACCESS_TOKEN_SECRET);

    // Attach the decoded token to the request object for future use (if needed)
    req.userData = decodedToken;

    next();
  } catch (error) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};
