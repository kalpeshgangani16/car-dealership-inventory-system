const Vehicle = require('../models/Vehicle');
const AppError = require('../utils/AppError');

/**
 * Handles creation and validation of new vehicles in the inventory
 */
const createVehicle = async (vehicleData) => {
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

  // 2. Validate format constraints (negative numbers or invalid data types)
  if (typeof price !== 'number' || price < 0) {
    throw new AppError('Price must be greater than or equal to 0', 400);
  }
  if (typeof quantity !== 'number' || quantity < 0) {
    throw new AppError('Quantity must be greater than or equal to 0', 400);
  }

  // 3. Save vehicle document to MongoDB
  const vehicle = await Vehicle.create({
    make,
    model,
    category,
    price,
    quantity
  });

  return {
    success: true,
    vehicle: {
      _id: vehicle._id.toString(),
      make: vehicle.make,
      model: vehicle.model,
      category: vehicle.category,
      price: vehicle.price,
      quantity: vehicle.quantity
    }
  };
};

module.exports = {
  createVehicle
};
