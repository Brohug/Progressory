const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendClientError } = require('./errorHandler');
const { enforceBillingAccess } = require('./billingMiddleware');
const { isPlatformAdminEmail } = require('../services/platformAdminService');

const STAFF_ROLES = ['owner', 'admin', 'coach'];
const MANAGEMENT_ROLES = ['owner', 'admin'];

const isStaffRole = (role) => STAFF_ROLES.includes(role);
const isManagementRole = (role) => MANAGEMENT_ROLES.includes(role);

const SUSPENSION_ALLOWED_PATH_PATTERNS = [
  /^\/api\/auth\/me$/i,
  /^\/api\/auth\/profile$/i,
  /^\/api\/auth\/change-password$/i,
  /^\/api\/billing(?:\/.*)?$/i,
  /^\/api\/platform-admin(?:\/.*)?$/i
];

const isSuspensionAllowedPath = (originalUrl = '') => {
  const pathWithoutQuery = String(originalUrl || '').split('?')[0];
  return SUSPENSION_ALLOWED_PATH_PATTERNS.some((pattern) => pattern.test(pathWithoutQuery));
};

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
      `SELECT u.id, u.gym_id, u.email, u.role, u.is_active, u.can_upload_library_content,
              g.is_platform_suspended, g.platform_suspended_at, g.platform_suspension_reason,
              m.id AS member_id
       FROM users u
       JOIN gyms g ON g.id = u.gym_id
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

    const isPlatformAdmin = isPlatformAdminEmail(currentUser.email);

    req.user = {
      ...decoded,
      role: currentUser.role,
      email: currentUser.email,
      member_id: currentUser.member_id || null,
      can_upload_library_content: Boolean(currentUser.can_upload_library_content),
      is_platform_admin: isPlatformAdmin,
      gym_is_platform_suspended: Boolean(currentUser.is_platform_suspended),
      gym_platform_suspended_at: currentUser.platform_suspended_at || null,
      gym_platform_suspension_reason: currentUser.platform_suspension_reason || ''
    };

    if (
      currentUser.is_platform_suspended
      && !isPlatformAdmin
      && !isSuspensionAllowedPath(req.originalUrl || req.url)
    ) {
      return sendClientError(res, {
        status: 403,
        message: 'This gym is temporarily suspended. Contact Progressory support.',
        gym_suspended: true
      });
    }

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
  },
  requirePlatformAdmin: (req, res, next) => {
    if (!req.user) {
      return sendClientError(res, {
        status: 401,
        message: 'Not authorized'
      });
    }

    if (!req.user.is_platform_admin) {
      return sendClientError(res, {
        status: 403,
        message: 'Only platform admins can access this resource'
      });
    }

    return next();
  }
};
