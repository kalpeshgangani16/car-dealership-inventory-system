const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/vehicles
 * @desc    Create a new vehicle
 * @access  Private
 */
router.post('/', protect, vehicleController.createVehicle);

/**
 * @route   GET /api/vehicles
 * @desc    Get all vehicles sorted by newest first
 * @access  Private
 */
router.get('/', protect, vehicleController.getVehicles);

/**
 * @route   GET /api/vehicles/search
 * @desc    Search vehicles dynamically by query parameters
 * @access  Private
 */
router.get('/search', protect, vehicleController.searchVehicles);

module.exports = router;
