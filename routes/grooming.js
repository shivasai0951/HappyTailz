const express = require('express');
const Grooming = require('../models/Grooming');

const router = express.Router();

// Public: list grooming services
router.get('/', async (req, res) => {
  try {
    const items = await Grooming.find({});
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
