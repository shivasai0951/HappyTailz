const express = require('express');
const Hospital = require('../models/Hospital');

const router = express.Router();

// Public: list hospitals
router.get('/', async (req, res) => {
  try {
    const items = await Hospital.find({});
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
