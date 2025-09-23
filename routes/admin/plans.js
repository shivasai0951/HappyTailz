const express = require('express');
const Plan = require('../../models/Plan');
const { requireAuth, requireRoles } = require('../../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireRoles('admin'));

router.post('/', async (req, res) => {
  try {
    const item = await Plan.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const items = await Plan.find();
  res.json(items);
});

router.put('/:id', async (req, res) => {
  const item = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.delete('/:id', async (req, res) => {
  const item = await Plan.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

module.exports = router;
