const express = require('express');
const Breeding = require('../../models/Breeding');
const { requireAuth, requireRoles } = require('../../middleware/auth');
const upload = require('../../middleware/upload');

const router = express.Router();

router.use(requireAuth, requireRoles('admin'));

router.post('/', upload.single('image'), async (req, res) => {
  try {
    let image;
    if (req.file) {
      image = { data: req.file.buffer, contentType: req.file.mimetype };
    } else if (req.body && req.body.imageData && req.body.imageContentType) {
      image = { data: Buffer.from(req.body.imageData, 'base64'), contentType: req.body.imageContentType };
    }
    const item = await Breeding.create({ ...req.body, ...(image ? { image } : {}) });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const items = await Breeding.find();
  res.json(items);
});

router.put('/:id', upload.single('image'), async (req, res) => {
  let image;
  if (req.file) {
    image = { data: req.file.buffer, contentType: req.file.mimetype };
  } else if (req.body && req.body.imageData && req.body.imageContentType) {
    image = { data: Buffer.from(req.body.imageData, 'base64'), contentType: req.body.imageContentType };
  }
  const update = { ...req.body, ...(image ? { image } : {}) };
  const item = await Breeding.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.delete('/:id', async (req, res) => {
  const item = await Breeding.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

module.exports = router;
