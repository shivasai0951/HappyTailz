const express = require('express');
const UserPlan = require('../models/UserPlan');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Creating user plans is not allowed; users can only subscribe to admin-created plans via admin flow
router.post('/', requireAuth, async (req, res) => {
  return res.status(403).json({ error: 'Forbidden', message: 'Users cannot create plans. Contact admin.' });
});

// List my plans (read-only)
router.get('/', requireAuth, async (req, res) => {
  const items = await UserPlan.find({ user: req.user.id }).populate('plan');
  res.json(items);
});

// Updating user plans is not allowed
router.put('/:id', requireAuth, async (req, res) => {
  return res.status(403).json({ error: 'Forbidden', message: 'Users cannot update plans. Contact admin.' });
});

// Deleting user plans is not allowed
router.delete('/:id', requireAuth, async (req, res) => {
  return res.status(403).json({ error: 'Forbidden', message: 'Users cannot delete plans. Contact admin.' });
});

module.exports = router;
