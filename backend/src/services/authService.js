const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { validateRegistrationInput, validateLoginInput } = require('../utils/validation');

/**
 * Generates a signed JWT session token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
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

/**
 * Handles user login verification and token generation
 */
const login = async (loginData) => {
  const { email, password } = loginData;

  // 1. Validate inputs
  validateLoginInput(email, password);

  // 2. Find user by email
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // 3. Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // 4. Generate token
  const token = generateToken(user);

  return {
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

module.exports = {
  register,
  login
};
