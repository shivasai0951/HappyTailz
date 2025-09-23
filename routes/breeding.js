const express = require('express');
const Pet = require('../models/Pet');

const router = express.Router();

// Public: list pets that are visible for breeding
router.get('/', async (req, res) => {
  try {
    const { species, breed } = req.query;
    const filter = { showInBreeding: true };
    if (species) filter.species = species;
    if (breed) filter.breed = breed;

    const items = await Pet.find(filter).select('-ownerId');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
