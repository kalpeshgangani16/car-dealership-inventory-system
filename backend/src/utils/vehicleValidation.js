const mongoose = require('mongoose');
const AppError = require('./AppError');

/**
 * Validates MongoDB ObjectId format
 */
const validateVehicleId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid vehicle ID format', 400);
  }
};

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
 * Validates that a quantity value is a valid positive integer greater than 0
 */
const validatePositiveQuantity = (quantity, fieldName) => {
  if (quantity === undefined || quantity === null) {
    throw new AppError(`${fieldName} quantity is required`, 400);
  }
  if (typeof quantity !== 'number' || quantity < 0) {
    throw new AppError('Quantity must be greater than 0', 400);
  }
  if (quantity === 0) {
    throw new AppError('Quantity cannot be 0', 400);
  }
};

/**
 * Validates inventory stock availability for purchase
 */
const validateStockAvailability = (availableQuantity, purchaseQuantity) => {
  if (availableQuantity === 0) {
    throw new AppError('Vehicle is out of stock', 400);
  }
  if (purchaseQuantity > availableQuantity) {
    throw new AppError('Purchase quantity exceeds available stock', 400);
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
  validateVehicleId,
  validateVehicleInput,
  validatePrice,
  validateQuantity,
  validatePositiveQuantity,
  validateStockAvailability
};
