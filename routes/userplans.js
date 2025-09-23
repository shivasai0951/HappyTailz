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

module.exports = router;
