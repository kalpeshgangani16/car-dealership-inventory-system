const vehicleService = require('../services/vehicleService');

/**
 * Handle new vehicle registration request
 */
const createVehicle = async (req, res, next) => {
  try {
    const result = await vehicleService.createVehicle(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle vehicle retrieval request
 */
const getVehicles = async (req, res, next) => {
  try {
    const result = await vehicleService.getVehicles();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVehicle,
  getVehicles
};
