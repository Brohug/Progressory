const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const STAFF_ROLES = ['owner', 'admin', 'coach'];

const isStaffRole = (role) => STAFF_ROLES.includes(role);

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Not authorized, no token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.query(
      `SELECT u.id, u.gym_id, u.email, u.role, u.is_active,
              m.id AS member_id
       FROM users u
       LEFT JOIN members m ON m.user_id = u.id AND m.gym_id = u.gym_id
       WHERE u.id = ? AND u.gym_id = ?`,
      [decoded.id, decoded.gym_id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: 'Not authorized, account no longer exists'
      });
    }

    const currentUser = rows[0];

    if (!currentUser.is_active) {
      return res.status(401).json({
        message: 'Not authorized, this account is inactive'
      });
    }

    req.user = {
      ...decoded,
      role: currentUser.role,
      email: currentUser.email,
      member_id: currentUser.member_id || null
    };

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
