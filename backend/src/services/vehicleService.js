const Vehicle = require('../models/Vehicle');
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
  }

  const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });

  return {
    success: true,
    count: vehicles.length,
    vehicles: vehicles.map(formatVehicleResponse)
  };
};

module.exports = {
  createVehicle,
  getVehicles,
  searchVehicles
};
