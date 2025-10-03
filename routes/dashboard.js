const express = require('express');
const { requireAuth } = require('../middleware/auth');
const UserPlan = require('../models/UserPlan');
const Plan = require('../models/Plan');
const Pet = require('../models/Pet');
const WalkingRequest = require('../models/WalkingRequest');

const router = express.Router();

// GET /api/dashboard - User dashboard
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch active plan (most recent active, not expired)
    const now = new Date();
    // latest plan (active or not)
    const latestPlanDoc = await UserPlan.findOne({ user: userId })
      .sort({ endDate: -1 })
      .populate('plan');

    let planSummary = null;
    if (latestPlanDoc) {
      const isActive = latestPlanDoc.status === 'active' && latestPlanDoc.endDate >= now;
      const daysLeft = isActive ? Math.max(0, Math.ceil((latestPlanDoc.endDate - now) / (1000 * 60 * 60 * 24))) : 0;
      planSummary = {
        id: latestPlanDoc._id,
        name: latestPlanDoc.plan?.name,
        durationDays: latestPlanDoc.plan?.durationDays,
        price: latestPlanDoc.plan?.price,
        options: latestPlanDoc.plan?.options || [],
        startDate: latestPlanDoc.startDate,
        endDate: latestPlanDoc.endDate,
        status: latestPlanDoc.status,
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
      hasPlan: !!planSummary,
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
