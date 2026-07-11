/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Use err.statusCode if present, otherwise default to response status or 500
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
