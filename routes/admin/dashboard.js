const express = require('express');
const { requireAuth, requireRoles } = require('../../middleware/auth');
const UserPlan = require('../../models/UserPlan');
const User = require('../../models/User');
const Pet = require('../../models/Pet');
const WalkingRequest = require('../../models/WalkingRequest');

const router = express.Router();

router.use(requireAuth, requireRoles('admin'));

// GET /api/admin/dashboard - summary counts
router.get('/', async (req, res) => {
  try {
    const [
      totalUsers,
      admins,
      drivers,
      regularUsers,
      totalPets,
      totalPlans,
      activeSubscriptions,
      totalWalkingRequests,
      requestedWR,
      approvedWR,
      assignedWR,
      completedWR,
      recentUsers
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'driver' }),
      User.countDocuments({ role: 'user' }),
      Pet.countDocuments({}),
      // plans count via distinct in UserPlan or use Plan directly; better to count on Plan
      // But we didn't import Plan here for simplicity of counts used elsewhere
      // We'll compute active subscriptions and ignore plan catalog count here
      Promise.resolve(null),
      UserPlan.countDocuments({ status: 'active', endDate: { $gte: new Date() } }),
      WalkingRequest.countDocuments({}),
      WalkingRequest.countDocuments({ status: 'requested' }),
      WalkingRequest.countDocuments({ status: 'approved' }),
      WalkingRequest.countDocuments({ status: 'assigned' }),
      WalkingRequest.countDocuments({ status: 'completed' }),
      User.find({}).sort({ createdAt: -1 }).limit(5).select('-password')
    ]);

    res.json({
      users: {
        total: totalUsers,
        byRole: { admin: admins, driver: drivers, user: regularUsers },
        recent: recentUsers
      },
      pets: { total: totalPets },
      subscriptions: { active: activeSubscriptions },
      walkingRequests: {
        total: totalWalkingRequests,
        byStatus: {
          requested: requestedWR,
          approved: approvedWR,
          assigned: assignedWR,
          completed: completedWR
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/dashboard/plan-stats?period=day|week|month
// Counts how many users took a plan in the given period, grouped by plan name
router.get('/plan-stats', async (req, res) => {
  try {
    const period = (req.query.period || 'month').toLowerCase();
    const now = new Date();
    const start = new Date(now);
    if (period === 'day') start.setDate(now.getDate() - 1);
    else if (period === 'week') start.setDate(now.getDate() - 7);
    else start.setDate(now.getDate() - 30); // month default

    const pipeline = [
      { $match: { createdAt: { $gte: start } } },
      {
        $lookup: {
          from: 'plans',
          localField: 'plan',
          foreignField: '_id',
          as: 'plan'
        }
      },
      { $unwind: '$plan' },
      {
        $group: {
          _id: '$plan.name',
          count: { $sum: 1 },
          users: { $addToSet: '$user' }
        }
      },
      {
        $project: {
          _id: 0,
          plan: '$_id',
          count: 1,
          uniqueUsers: { $size: '$users' }
        }
      }
    ];

    const results = await UserPlan.aggregate(pipeline);
    const total = results.reduce((acc, r) => acc + r.count, 0);
    const totalUniqueUsers = results.reduce((acc, r) => acc + r.uniqueUsers, 0);

    res.json({ period, since: start, total, totalUniqueUsers, byPlan: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
