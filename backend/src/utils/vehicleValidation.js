const AppError = require('./AppError');

/**
 * Validates price format and positive bounds constraints
 */
const validatePrice = (price) => {
  if (typeof price !== 'number' || price < 0) {
    throw new AppError('Price must be greater than or equal to 0', 400);
  }
};

/**
 * Validates quantity format and positive bounds constraints
 */
const validateQuantity = (quantity) => {
  if (typeof quantity !== 'number' || quantity < 0) {
    throw new AppError('Quantity must be greater than or equal to 0', 400);
  }
};

/**
 * Validates inputs for vehicle creation
 */
const validateVehicleInput = (vehicleData) => {
  const { make, model, category, price, quantity } = vehicleData;

  // 1. Validate required presence of properties
  if (make === undefined || make === null || make === '') {
    throw new AppError('Make is required', 400);
  }
  if (model === undefined || model === null || model === '') {
    throw new AppError('Model is required', 400);
  }
  if (category === undefined || category === null || category === '') {
    throw new AppError('Category is required', 400);
  }
  if (price === undefined || price === null) {
    throw new AppError('Price is required', 400);
  }
  if (quantity === undefined || quantity === null) {
    throw new AppError('Quantity is required', 400);
  }

  // 2. Validate format constraints using extracted helpers
  validatePrice(price);
  validateQuantity(quantity);
};

module.exports = {
  validateVehicleInput,
  validatePrice,
  validateQuantity
};
