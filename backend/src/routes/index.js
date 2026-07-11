const express = require('express');
const router = express.Router();

/**
 * @route   GET /
 * @desc    Root API verification endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'API Running'
  });
});

module.exports = router;
