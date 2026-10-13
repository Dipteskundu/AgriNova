/**
 * AgriNova Authentication & Farmer Context Middleware
 */

const jwt = require('jsonwebtoken');

const authenticateFarmer = (req, res, next) => {
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    return res.status(500).json({
      success: false,
      error: 'Authentication is not configured on the server.'
    });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authorization token is required.'
    });
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authorization token is required.'
    });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authorization token.'
    });
  }
};

module.exports = { authenticateFarmer };
