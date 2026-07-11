const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

/**
 * Middleware to protect routes by verifying JWT tokens
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for authorization header formatted as Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authorized, token missing', 401);
    }

    try {
      // Decode and verify signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
      req.user = decoded;
      next();
    } catch (err) {
      throw new AppError(`Not authorized, token invalid: ${err.message}`, 401);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
