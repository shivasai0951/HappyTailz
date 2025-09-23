const express = require('express');
const Hospital = require('../../models/Hospital');
const { requireAuth, requireRoles } = require('../../middleware/auth');
const upload = require('../../middleware/upload');

const router = express.Router();

router.use(requireAuth, requireRoles('admin'));

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : undefined;
    const item = await Hospital.create({ ...req.body, ...(imageUrl ? { imageUrl } : {}) });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const items = await Hospital.find();
  res.json(items);
});

router.put('/:id', upload.single('image'), async (req, res) => {
  const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : undefined;
  const update = { ...req.body, ...(imageUrl ? { imageUrl } : {}) };
  const item = await Hospital.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.delete('/:id', async (req, res) => {
  const item = await Hospital.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

module.exports = router;
