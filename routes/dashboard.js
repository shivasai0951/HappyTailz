const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Plan = require('../models/Plan');
const Pet = require('../models/Pet');
const WalkingRequest = require('../models/WalkingRequest');

const router = express.Router();

// GET /api/dashboard - User dashboard
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();
    // Find most relevant walking request with plan
    const upcomingReq = await WalkingRequest.findOne({ user: userId, scheduleAt: { $gte: now } })
      .sort({ scheduleAt: 1 })
      .populate('plan');
    const latestReq = upcomingReq
      ? upcomingReq
      : await WalkingRequest.findOne({ user: userId })
          .sort({ scheduleAt: -1 })
          .populate('plan');

    let planSummary = null;
    let hasPlan = false;
    if (latestReq && latestReq.plan) {
      const startDate = new Date(latestReq.scheduleAt);
      const durationDays = latestReq.plan.durationDays || 0;
      const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
      const isActive = now >= startDate && now <= endDate;
      const daysLeft = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
      hasPlan = isActive;

      planSummary = {
        id: latestReq.plan._id,
        name: latestReq.plan.name,
        durationDays,
        price: latestReq.plan.price,
        options: latestReq.plan.options || [],
        startDate,
        endDate,
        status: isActive ? 'active' : (now > endDate ? 'expired' : 'upcoming'),
        isActive,
        daysLeft
      };
    }

    // Recent and upcoming walking requests
    const upcoming = await WalkingRequest.find({
      user: userId,
      scheduleAt: { $gte: now },
      status: { $in: ['requested', 'approved', 'assigned'] }
    })
      .sort({ scheduleAt: 1 })
      .limit(5)
      .populate('pet driver plan');

    // Completed walks count
    const completedCount = await WalkingRequest.countDocuments({ user: userId, status: 'completed' });

    // Pets summary
    const pets = await Pet.find({ ownerId: userId });

    res.json({
      hasPlan,
      plan: planSummary,
      pets: {
        count: pets.length,
        items: pets
      },
      walkingRequests: {
        upcoming,
        completedCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
