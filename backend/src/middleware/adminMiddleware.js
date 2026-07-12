const AppError = require('../utils/AppError');

/**
 * Middleware to restrict access to admin users only.
 * Must run after the protect middleware which populates req.user.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return next(new AppError('Access denied: Admins only', 403));
};

module.exports = { adminOnly };
