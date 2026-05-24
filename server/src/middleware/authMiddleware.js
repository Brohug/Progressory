const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendClientError } = require('./errorHandler');
const { enforceBillingAccess } = require('./billingMiddleware');

const STAFF_ROLES = ['owner', 'admin', 'coach'];
const MANAGEMENT_ROLES = ['owner', 'admin'];

const isStaffRole = (role) => STAFF_ROLES.includes(role);
const isManagementRole = (role) => MANAGEMENT_ROLES.includes(role);

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendClientError(res, {
        status: 401,
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
      return sendClientError(res, {
        status: 401,
        message: 'Not authorized, account no longer exists'
      });
    }

    const currentUser = rows[0];

    if (!currentUser.is_active) {
      return sendClientError(res, {
        status: 401,
        message: 'Not authorized, this account is inactive'
      });
    }

    req.user = {
      ...decoded,
      role: currentUser.role,
      email: currentUser.email,
      member_id: currentUser.member_id || null
    };

    return enforceBillingAccess(req, res, next);
  } catch (error) {
    return sendClientError(res, {
      status: 401,
      message: 'Not authorized, invalid token'
    });
  }
};

module.exports = {
  protect,
  isStaffRole,
  isManagementRole,
  requireRoles: (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
      return sendClientError(res, {
        status: 401,
        message: 'Not authorized'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendClientError(res, {
        status: 403,
        message: 'You do not have permission to access this resource'
      });
    }

    return next();
  },
  requireStaff: (req, res, next) => {
    if (!req.user) {
      return sendClientError(res, {
        status: 401,
        message: 'Not authorized'
      });
    }

    if (!isStaffRole(req.user.role)) {
      return sendClientError(res, {
        status: 403,
        message: 'Only staff accounts can access this resource'
      });
    }

    return next();
  },
  requireManagement: (req, res, next) => {
    if (!req.user) {
      return sendClientError(res, {
        status: 401,
        message: 'Not authorized'
      });
    }

    if (!isManagementRole(req.user.role)) {
      return sendClientError(res, {
        status: 403,
        message: 'Only owner or admin accounts can access this resource'
      });
    }

    return next();
  },
  requireOwner: (req, res, next) => {
    if (!req.user) {
      return sendClientError(res, {
        status: 401,
        message: 'Not authorized'
      });
    }

    if (req.user.role !== 'owner') {
      return sendClientError(res, {
        status: 403,
        message: 'Only the owner can access this resource'
      });
    }

    return next();
  }
};
