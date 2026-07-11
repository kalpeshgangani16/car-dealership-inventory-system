const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Validates registration parameters and email structure format
 */
const validateRegistrationInput = (name, email, password) => {
  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Invalid email format', 400);
  }
};

/**
 * Generates a signed JWT session token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'supersecret',
    { expiresIn: '30d' }
  );
};

/**
 * Handles user validation, duplicate verification, database persistence, and session setup
 */
const register = async (userData) => {
  const { name, email, password } = userData;

  // 1. Perform validation checks
  validateRegistrationInput(name, email, password);

  // 2. Enforce email uniqueness check
  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError('Email is already registered', 409);
  }

  // 3. Hash secret credentials safely
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Save user document to MongoDB
  const newUser = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword
  });

  // 5. Build JWT security token
  const token = generateToken(newUser);

  return {
    success: true,
    message: 'User registered successfully',
    token,
    user: {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  };
};

module.exports = {
  register
};
