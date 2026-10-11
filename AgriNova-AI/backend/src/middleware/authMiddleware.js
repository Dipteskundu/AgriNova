/**
 * AgriNova Authentication & Farmer Context Middleware
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'agrinova_super_secret_jwt_key_2026';

const authenticateFarmer = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired authorization token.'
      });
    }
  }

  // Permissive fallback for university project demo/testing if token is not sent
  req.user = {
    id: req.headers['x-farmer-id'] || 'farmer_demo_101',
    role: 'farmer',
    name: 'Mashiur Farmer',
    district: 'Rajshahi'
  };

  next();
};

module.exports = { authenticateFarmer };
