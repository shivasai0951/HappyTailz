const express = require('express');
const Grooming = require('../../models/Grooming');
const { requireAuth, requireRoles } = require('../../middleware/auth');
const upload = require('../../middleware/upload');

const router = express.Router();

router.use(requireAuth, requireRoles('admin'));

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : undefined;
    const item = await Grooming.create({ ...req.body, ...(imageUrl ? { imageUrl } : {}) });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const items = await Grooming.find();
  res.json(items);
});

router.put('/:id', upload.single('image'), async (req, res) => {
  const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : undefined;
  const update = { ...req.body, ...(imageUrl ? { imageUrl } : {}) };
  const item = await Grooming.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.delete('/:id', async (req, res) => {
  const item = await Grooming.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

module.exports = router;
