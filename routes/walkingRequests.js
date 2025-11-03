const express = require('express');
const WalkingRequest = require('../models/WalkingRequest');
const { requireAuth, requireRoles } = require('../middleware/auth');
const Plan = require('../models/Plan');

const router = express.Router();

// Create request (user)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { plan, scheduleAt } = req.body;
    if (!plan) return res.status(400).json({ error: 'ValidationError', message: 'plan is required' });
    if (!scheduleAt) return res.status(400).json({ error: 'ValidationError', message: 'scheduleAt is required' });
    const planDoc = await Plan.findById(plan);
    if (!planDoc || planDoc.active === false) {
      return res.status(400).json({ error: 'ValidationError', message: 'Invalid or inactive plan' });
    }

    // Allow only one active walking request at a time per user
    const existingActive = await WalkingRequest.findOne({
      user: req.user.id,
      status: { $in: ['requested', 'approved', 'assigned'] }
    });
    if (existingActive) {
      return res.status(409).json({ error: 'Conflict', message: 'You already have an active walking request' });
    }

    const start = new Date(scheduleAt);
    const days = [];
    for (let i = 0; i < (planDoc.durationDays || 0); i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push({ date: d, status: 'pending', note: '' });
    }

    const doc = await WalkingRequest.create({ ...req.body, user: req.user.id, status: 'requested', days });
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

// Update status (approve, complete, cancel, reject) using a single API
router.post('/:id/status', requireAuth, async (req, res) => {
  try {
    const { value } = req.body;
    const allowed = ['approved', 'completed', 'cancelled', 'rejected'];
    if (!allowed.includes(value)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Invalid status value' });
    }

    let doc = await WalkingRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });

    // Enforce role-based permissions and state changes
    if (value === 'approved') {
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
      doc.status = 'approved';
      doc.approvedAt = new Date();
    } else if (value === 'completed') {
      if (req.user.role === 'admin') {
        doc.status = 'completed';
        doc.completedAt = new Date();
      } else if (req.user.role === 'driver') {
        if (!doc.driver || doc.driver.toString() !== req.user.id) {
          return res.status(404).json({ error: 'Not found or not permitted' });
        }
        doc.status = 'completed';
        doc.completedAt = new Date();
      } else {
        return res.status(403).json({ error: 'Forbidden' });
      }
    } else if (value === 'cancelled') {
      // Only the owner (user) can cancel their own request
      if (req.user.role !== 'user' || doc.user.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      // Optionally, restrict cancellable states
      const cancellable = ['requested', 'approved', 'assigned'];
      if (!cancellable.includes(doc.status)) {
        return res.status(409).json({ error: 'Conflict', message: 'Request cannot be cancelled in the current status' });
      }
      doc.status = 'cancelled';
    } else if (value === 'rejected') {
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
      doc.status = 'rejected';
    }

    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
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

// Update a specific day (admin or driver)
router.patch('/:id/days/:index', requireAuth, requireRoles('driver', 'admin'), async (req, res) => {
  try {
    const { index } = req.params;
    const { status, note } = req.body;
    const allowed = ['pending', 'done', 'skipped', 'missed'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Invalid day status' });
    }

    const doc = await WalkingRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'driver' && doc.driver?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const i = parseInt(index, 10);
    if (Number.isNaN(i) || i < 0 || i >= doc.days.length) {
      return res.status(400).json({ error: 'ValidationError', message: 'Invalid day index' });
    }
    if (typeof status === 'string') doc.days[i].status = status;
    if (typeof note === 'string') doc.days[i].note = note;
    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: list all
router.get('/', requireAuth, requireRoles('admin'), async (req, res) => {
  const docs = await WalkingRequest.find().populate('user pet driver plan');
  res.json(docs);
});

// Admin: delete a walking record
router.delete('/:id', requireAuth, requireRoles('admin'), async (req, res) => {
  const doc = await WalkingRequest.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

module.exports = router;
