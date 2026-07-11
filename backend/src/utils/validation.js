const AppError = require('./AppError');

/**
 * Checks if email matches a standard format pattern
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates parameters for user registration
 */
const validateRegistrationInput = (name, email, password) => {
  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required', 400);
  }
  if (!isValidEmail(email)) {
    throw new AppError('Invalid email format', 400);
  }
};

/**
 * Validates parameters for user login
 */
const validateLoginInput = (email, password) => {
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }
  if (!isValidEmail(email)) {
    throw new AppError('Invalid email format', 400);
  }
};

module.exports = {
  isValidEmail,
  validateRegistrationInput,
  validateLoginInput
};
