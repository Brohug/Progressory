const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendClientError } = require('./errorHandler');
const { enforceBillingAccess } = require('./billingMiddleware');
const { isPlatformAdminEmail } = require('../services/platformAdminService');
const { getAuthSchemaSupport, buildAuthUserSelectSql } = require('../services/authSchemaService');
const { applyPlatformAdminShowcaseContext } = require('../services/showcaseAccessService');

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

    const schemaSupport = await getAuthSchemaSupport(pool);
    const [rows] = await pool.query(
      buildAuthUserSelectSql(schemaSupport, 'WHERE u.id = ? AND u.gym_id = ?'),
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

    const runtimeUser = await applyPlatformAdminShowcaseContext(
      currentUser,
      isPlatformAdmin,
      pool
    );

    req.user = {
      ...decoded,
      gym_id: runtimeUser.gym_id,
      role: runtimeUser.role,
      email: runtimeUser.email,
      member_id: runtimeUser.member_id || null,
      can_upload_library_content: Boolean(runtimeUser.can_upload_library_content),
      is_platform_admin: isPlatformAdmin,
      is_showcase_mode: Boolean(runtimeUser.is_showcase_mode),
      actual_gym_id: runtimeUser.actual_gym_id || runtimeUser.gym_id,
      actual_gym_name: runtimeUser.actual_gym_name || runtimeUser.gym_name,
      gym_name: runtimeUser.gym_name,
      gym_is_platform_suspended: Boolean(runtimeUser.is_platform_suspended),
      gym_platform_suspended_at: runtimeUser.platform_suspended_at || null,
      gym_platform_suspension_reason: runtimeUser.platform_suspension_reason || ''
    };

    if (
      runtimeUser.is_platform_suspended
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
