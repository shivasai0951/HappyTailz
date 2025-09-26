const express = require('express');
const Pet = require('../models/Pet');
const Breeding = require('../models/Breeding');
const { getImageBase64 } = require('../utils/imageStore');

const router = express.Router();

// Public: list pets that are visible for breeding
router.get('/', async (req, res) => {
  try {
    const { species, breed } = req.query;
    const filter = { showInBreeding: true };
    if (species) filter.species = species;
    if (breed) filter.breed = breed;

    // Combine public breeding items from admin breeding listing as well, if desired
    const pets = await Pet.find(filter).select('-ownerId');
    const adminItems = await Breeding.find({ active: true });

    const expand = async (doc) => {
      const json = doc.toJSON();
      if (json.imageRef) {
        const img = await getImageBase64(json.imageRef);
        if (img) json.image = img;
      }
      return json;
    };

    const [petsExpanded, adminExpanded] = await Promise.all([
      Promise.all(pets.map(expand)),
      Promise.all(adminItems.map(expand))
    ]);

    res.json({ pets: petsExpanded, listings: adminExpanded });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
