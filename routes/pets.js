const express = require('express');
const Pet = require('../models/Pet');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Create pet
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : undefined;
    const pet = await Pet.create({ ...req.body, ownerId: req.user.id, ...(imageUrl ? { imageUrl } : {}) });
    res.status(201).json(pet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List my pets
router.get('/', requireAuth, async (req, res) => {
  const pets = await Pet.find({ ownerId: req.user.id });
  res.json(pets);
});

// Update pet (owner only)
router.put('/:id', requireAuth, upload.single('image'), async (req, res) => {
  const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : undefined;
  const update = { ...req.body, ...(imageUrl ? { imageUrl } : {}) };
  const pet = await Pet.findOneAndUpdate({ _id: req.params.id, ownerId: req.user.id }, update, { new: true });
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  res.json(pet);
});

// Delete pet (owner only)
router.delete('/:id', requireAuth, async (req, res) => {
  const pet = await Pet.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  res.json({ success: true });
});

module.exports = router;
