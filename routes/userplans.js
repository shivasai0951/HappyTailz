const express = require('express');
const UserPlan = require('../models/UserPlan');
const Plan = require('../models/Plan');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { planId, startDate } = req.body;
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + plan.durationDays);

    const userPlan = await UserPlan.create({ user: req.user.id, plan: plan._id, startDate: start, endDate: end });
    res.status(201).json(userPlan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', requireAuth, async (req, res) => {
  const items = await UserPlan.find({ user: req.user.id }).populate('plan');
  res.json(items);
});

// Update a user plan (change plan or dates)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { planId, startDate, endDate } = req.body || {};

    const update = {};
    if (planId) {
      const plan = await Plan.findById(planId);
      if (!plan) return res.status(404).json({ error: 'Plan not found' });
      update.plan = plan._id;
      // If startDate provided, recompute endDate based on duration; otherwise keep provided endDate or recompute from existing startDate
      if (startDate) {
        const start = new Date(startDate);
        const newEnd = new Date(start);
        newEnd.setDate(newEnd.getDate() + plan.durationDays);
        update.startDate = start;
        update.endDate = newEnd;
      }
    }

    if (startDate && !update.startDate) {
      const start = new Date(startDate);
      update.startDate = start;
      // If no plan change and no explicit endDate, keep existing span if possible by adjusting endDate proportionally is complex; default: leave endDate unchanged unless provided
    }

    if (endDate) {
      update.endDate = new Date(endDate);
    }

    const item = await UserPlan.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, update, { new: true }).populate('plan');
    if (!item) return res.status(404).json({ error: 'User plan not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a user plan
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const item = await UserPlan.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!item) return res.status(404).json({ error: 'User plan not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
