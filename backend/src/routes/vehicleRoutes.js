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

/**
 * @route   PUT /api/vehicles/:id
 * @desc    Update an existing vehicle
 * @access  Private
 */
router.put('/:id', protect, vehicleController.updateVehicle);

/**
 * @route   DELETE /api/vehicles/:id
 * @desc    Delete an existing vehicle
 * @access  Private
 */
router.delete('/:id', protect, vehicleController.deleteVehicle);

/**
 * @route   PATCH /api/vehicles/:id/purchase
 * @desc    Purchase an existing vehicle
 * @access  Private
 */
router.patch('/:id/purchase', protect, vehicleController.purchaseVehicle);

/**
 * @route   PATCH /api/vehicles/:id/restock
 * @desc    Restock an existing vehicle
 * @access  Private
 */
router.patch('/:id/restock', protect, vehicleController.restockVehicle);

module.exports = router;
