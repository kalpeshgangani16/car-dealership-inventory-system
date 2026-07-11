/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // If the status code is still 200, change it to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
