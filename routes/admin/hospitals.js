const express = require('express');
const Hospital = require('../../models/Hospital');
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
    // normalize array-like fields which may arrive as comma-separated or JSON strings
    const toArray = (val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        const trimmed = val.trim();
        try {
          if (trimmed.startsWith('[')) return JSON.parse(trimmed);
        } catch (_) {}
        return trimmed
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    };
    const body = { ...req.body };
    if (body.services !== undefined) body.services = toArray(body.services);
    if (body.availability !== undefined) body.availability = toArray(body.availability);
    // description is accepted as-is if provided
    const item = await Hospital.create({ ...body, ...(image ? { image } : {}) });
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
  let image;
  if (req.file) {
    image = { data: req.file.buffer, contentType: req.file.mimetype };
  } else if (req.body && req.body.imageData && req.body.imageContentType) {
    image = { data: Buffer.from(req.body.imageData, 'base64'), contentType: req.body.imageContentType };
  }
  const toArray = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      try {
        if (trimmed.startsWith('[')) return JSON.parse(trimmed);
      } catch (_) {}
      return trimmed
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };
  const updateBody = { ...req.body };
  if (updateBody.services !== undefined) updateBody.services = toArray(updateBody.services);
  if (updateBody.availability !== undefined) updateBody.availability = toArray(updateBody.availability);
  const update = { ...updateBody, ...(image ? { image } : {}) };
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
