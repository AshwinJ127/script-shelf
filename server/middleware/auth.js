// server/middleware/auth.js
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  // 1. Get the token from the request header
  const token = req.header('x-auth-token');

  // 2. If no token, deny access
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // 3. Verify the token using your JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the user's ID to the request object
    req.user = decoded.user;
    
    // 5. Continue to the next function (the route handler)
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}

module.exports = auth;