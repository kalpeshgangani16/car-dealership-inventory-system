const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Handle validation, user creation, hashing, and JWT generation
 */
const register = async (userData) => {
  const { name, email, password } = userData;

  // 1. Validate required fields
  if (!name || !email || !password) {
    const error = new Error('Name, email, and password are required');
    error.statusCode = 400;
    throw error;
  }

  // 2. Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const error = new Error('Invalid email format');
    error.statusCode = 400;
    throw error;
  }

  // 3. Check duplicate email
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  // 4. Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // 5. Create user in MongoDB
  const newUser = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword
  });

  // 6. Generate JWT token
  const token = jwt.sign(
    { id: newUser._id, role: newUser.role },
    process.env.JWT_SECRET || 'supersecret',
    { expiresIn: '30d' }
  );

  // Return success payload structure
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
