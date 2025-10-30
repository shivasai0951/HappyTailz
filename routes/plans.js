const express = require('express');
const Plan = require('../models/Plan');

const router = express.Router();

// Public: list active plans created by admin
router.get('/', async (req, res) => {
  try {
    const items = await Plan.find({ active: true }).sort({ price: 1, durationDays: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
