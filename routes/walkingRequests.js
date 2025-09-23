const express = require('express');
const WalkingRequest = require('../models/WalkingRequest');
const { requireAuth, requireRoles } = require('../middleware/auth');

const router = express.Router();

// Create request (user)
router.post('/', requireAuth, async (req, res) => {
  try {
    const doc = await WalkingRequest.create({ ...req.body, user: req.user.id, status: 'requested' });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List my requests (user)
router.get('/me', requireAuth, async (req, res) => {
  const docs = await WalkingRequest.find({ user: req.user.id }).populate('pet driver plan');
  res.json(docs);
});

// Approve request (admin)
router.post('/:id/approve', requireAuth, requireRoles('admin'), async (req, res) => {
  const doc = await WalkingRequest.findByIdAndUpdate(
    req.params.id,
    { status: 'approved', approvedAt: new Date() },
    { new: true }
  );
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});

// Assign driver (admin)
router.post('/:id/assign', requireAuth, requireRoles('admin'), async (req, res) => {
  const { driver } = req.body;
  const doc = await WalkingRequest.findByIdAndUpdate(
    req.params.id,
    { status: 'assigned', driver, assignedAt: new Date() },
    { new: true }
  );
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});

// Complete (driver)
router.post('/:id/complete', requireAuth, requireRoles('driver'), async (req, res) => {
  const doc = await WalkingRequest.findOneAndUpdate(
    { _id: req.params.id, driver: req.user.id },
    { status: 'completed', completedAt: new Date() },
    { new: true }
  );
  if (!doc) return res.status(404).json({ error: 'Not found or not assigned to you' });
  res.json(doc);
});

// Admin: list all
router.get('/', requireAuth, requireRoles('admin'), async (req, res) => {
  const docs = await WalkingRequest.find().populate('user pet driver plan');
  res.json(docs);
});

module.exports = router;
