const jwt = require('jsonwebtoken');

const STAFF_ROLES = ['owner', 'admin', 'coach'];

const isStaffRole = (role) => STAFF_ROLES.includes(role);

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Not authorized, no token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Not authorized, invalid token'
    });
  }
};

module.exports = {
  protect,
  isStaffRole,
  requireRoles: (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Not authorized'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to access this resource'
      });
    }

    return next();
  },
  requireStaff: (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Not authorized'
      });
    }

    if (!isStaffRole(req.user.role)) {
      return res.status(403).json({
        message: 'Only staff accounts can access this resource'
      });
    }

    return next();
  },
  requireOwner: (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Not authorized'
      });
    }

    if (req.user.role !== 'owner') {
      return res.status(403).json({
        message: 'Only the owner can access this resource'
      });
    }

    return next();
  }
};
