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
    // Populate owner details with safe, public fields
    const pets = await Pet.find(filter)
      .populate({
        path: 'ownerId',
        select: 'name email phone contact address'
      });
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
      Promise.all(
        pets.map(async (p) => {
          const json = await expand(p);
          // rename ownerId to owner and include only allowed fields
          if (p.ownerId) {
            const { _id, name, email, phone, contact, address } = p.ownerId.toJSON ? p.ownerId.toJSON() : p.ownerId;
            json.owner = { id: _id?.toString?.() || _id, name, email, phone, contact, address };
          }
          delete json.ownerId; // hide raw ownerId
          return json;
        })
      ),
      Promise.all(adminItems.map(expand))
    ]);

    res.json({ pets: petsExpanded, listings: adminExpanded });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
