const authService = require('../services/authService');

/**
 * Handle user registration request
 */
const registerUser = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser
};
