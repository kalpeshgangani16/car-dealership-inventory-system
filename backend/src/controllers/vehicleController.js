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

/**
 * Handle vehicle search request
 */
const searchVehicles = async (req, res, next) => {
  try {
    const result = await vehicleService.searchVehicles(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle vehicle update request
 */
const updateVehicle = async (req, res, next) => {
  try {
    const result = await vehicleService.updateVehicle(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVehicle,
  getVehicles,
  searchVehicles,
  updateVehicle
};
