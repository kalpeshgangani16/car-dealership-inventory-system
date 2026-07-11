const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const AppError = require('../utils/AppError');
const { validateVehicleInput } = require('../utils/vehicleValidation');

/**
 * Format Mongoose vehicle document properties to match standard response API contract
 */
const formatVehicleResponse = (vehicle) => ({
  _id: vehicle._id.toString(),
  make: vehicle.make,
  model: vehicle.model,
  category: vehicle.category,
  price: vehicle.price,
  quantity: vehicle.quantity
});

/**
 * Dynamically builds a MongoDB query object from search parameters
 */
const buildSearchQuery = (queryParams) => {
  const { make, model, category, minPrice, maxPrice } = queryParams;
  const query = {};

  if (make) {
    query.make = { $regex: new RegExp(make, 'i') };
  }
  if (model) {
    query.model = { $regex: new RegExp(model, 'i') };
  }
  if (category) {
    query.category = { $regex: new RegExp(category, 'i') };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined && minPrice !== '') {
      query.price.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      query.price.$lte = Number(maxPrice);
    }
    // Clean up empty price object if neither minPrice nor maxPrice was successfully added
    if (Object.keys(query.price).length === 0) {
      delete query.price;
    }
  }

  return query;
};

/**
 * Handles creation and validation of new vehicles in the inventory
 */
const createVehicle = async (vehicleData) => {
  // 1. Perform validation checks
  validateVehicleInput(vehicleData);

  // 2. Save vehicle document to MongoDB
  const vehicle = await Vehicle.create({
    make: vehicleData.make,
    model: vehicleData.model,
    category: vehicleData.category,
    price: vehicleData.price,
    quantity: vehicleData.quantity
  });

  return {
    success: true,
    vehicle: formatVehicleResponse(vehicle)
  };
};

/**
 * Retrieves all vehicles stored in the database sorted by newest first
 */
const getVehicles = async () => {
  const vehicles = await Vehicle.find({}).sort({ createdAt: -1 });
  return {
    success: true,
    count: vehicles.length,
    vehicles: vehicles.map(formatVehicleResponse)
  };
};

/**
 * Dynamically queries vehicles by make, model, category, and price range
 */
const searchVehicles = async (queryParams) => {
  // Extract MongoDB query filters using utility helper
  const query = buildSearchQuery(queryParams);

  const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });

  return {
    success: true,
    count: vehicles.length,
    vehicles: vehicles.map(formatVehicleResponse)
  };
};

/**
 * Performs dynamic field updates on a vehicle document
 */
const updateVehicle = async (id, updateData) => {
  // 1. Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid vehicle ID format', 400);
  }

  // 2. Validate empty body
  if (!updateData || Object.keys(updateData).length === 0) {
    throw new AppError('Update data cannot be empty', 400);
  }

  const { make, model, category, price, quantity } = updateData;

  // 3. Validate numerical bounds if provided
  if (price !== undefined) {
    if (typeof price !== 'number' || price < 0) {
      throw new AppError('Price must be greater than or equal to 0', 400);
    }
  }
  if (quantity !== undefined) {
    if (typeof quantity !== 'number' || quantity < 0) {
      throw new AppError('Quantity must be greater than or equal to 0', 400);
    }
  }

  // 4. Find the vehicle
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  // 5. Apply partial updates
  if (make !== undefined) vehicle.make = make;
  if (model !== undefined) vehicle.model = model;
  if (category !== undefined) vehicle.category = category;
  if (price !== undefined) vehicle.price = price;
  if (quantity !== undefined) vehicle.quantity = quantity;

  await vehicle.save();

  return {
    success: true,
    vehicle: formatVehicleResponse(vehicle)
  };
};

module.exports = {
  createVehicle,
  getVehicles,
  searchVehicles,
  updateVehicle
};
