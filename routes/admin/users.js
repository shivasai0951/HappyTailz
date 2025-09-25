const express = require('express');
const { requireAuth, requireRoles } = require('../../middleware/auth');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const upload = require('../../middleware/upload');

const router = express.Router();

router.use(requireAuth, requireRoles('admin'));

// List all users
router.get('/', async (req, res) => {
  const { role, q } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (q) filter.$or = [
    { name: new RegExp(q, 'i') },
    { email: new RegExp(q, 'i') }
  ];
  const now = new Date();
  const users = await User.aggregate([
    { $match: filter },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: 'userplans',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$user', '$$userId'] },
                  { $eq: ['$status', 'active'] },
                  { $gte: ['$endDate', now] }
                ]
              }
            }
          },
          { $sort: { endDate: -1 } },
          { $limit: 1 },
          {
            $lookup: {
              from: 'plans',
              localField: 'plan',
              foreignField: '_id',
              as: 'plan'
            }
          },
          { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              startDate: 1,
              endDate: 1,
              status: 1,
              plan: { name: '$plan.name', durationDays: '$plan.durationDays', price: '$plan.price' }
            }
          }
        ],
        as: 'activePlan'
      }
    },
    { $addFields: { activePlan: { $arrayElemAt: ['$activePlan', 0] } } },
    { $project: { password: 0 } }
  ]);
  res.json(users);
});

// Get user by id
router.get('/:id', async (req, res) => {
  const now = new Date();
  const [user] = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
    {
      $lookup: {
        from: 'userplans',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$user', '$$userId'] },
                  { $eq: ['$status', 'active'] },
                  { $gte: ['$endDate', now] }
                ]
              }
            }
          },
          { $sort: { endDate: -1 } },
          { $limit: 1 },
          {
            $lookup: {
              from: 'plans',
              localField: 'plan',
              foreignField: '_id',
              as: 'plan'
            }
          },
          { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              startDate: 1,
              endDate: 1,
              status: 1,
              plan: { name: '$plan.name', durationDays: '$plan.durationDays', price: '$plan.price' }
            }
          }
        ],
        as: 'activePlan'
      }
    },
    { $addFields: { activePlan: { $arrayElemAt: ['$activePlan', 0] } } },
    { $project: { password: 0 } }
  ]);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

// Create user
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, email, password, role = 'user', phone, address } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already exists' });
    const hashed = await bcrypt.hash(password || 'password123', 10);
    let image;
    if (req.file) {
      image = { data: req.file.buffer, contentType: req.file.mimetype };
    } else if (req.body && req.body.imageData && req.body.imageContentType) {
      image = { data: Buffer.from(req.body.imageData, 'base64'), contentType: req.body.imageContentType };
    }
    const user = await User.create({ name, email, password: hashed, role, phone, address, ...(image ? { image } : {}) });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update user
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    let image;
    if (req.file) {
      image = { data: req.file.buffer, contentType: req.file.mimetype };
    } else if (req.body && req.body.imageData && req.body.imageContentType) {
      image = { data: Buffer.from(req.body.imageData, 'base64'), contentType: req.body.imageContentType };
    }
    const update = { ...req.body, ...(image ? { image } : {}) };
    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

module.exports = router;
