// Example authentication middleware - you can modify this as needed
const jwt = require('jsonwebtoken');

const parseToken = (req) => {
  const authHeader = req.headers.authorization || '';
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') return parts[1];
  return null;
};

const requireAuth = (req, res, next) => {
  try {
    const token = parseToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // should contain at least { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized', message: err.message });
  }
};

const optionalAuth = (req, res, next) => {
  try {
    const token = parseToken(req);
    if (token) {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    }
  } catch (err) {
    // ignore invalid token for optional auth
  }
  next();
};

const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  next();
};

module.exports = { requireAuth, optionalAuth, requireRoles };
