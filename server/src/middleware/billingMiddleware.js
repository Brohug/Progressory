const { sendClientError, handleServerError } = require('./errorHandler');
const { getSubscriptionByGymId, buildSafeBillingPayload } = require('../services/billingService');

const ALLOWED_BILLING_PATH_PATTERNS = [
  /^\/api\/auth\/me$/i,
  /^\/api\/auth\/profile$/i,
  /^\/api\/auth\/change-password$/i,
  /^\/api\/billing\/subscription$/i,
  /^\/api\/billing\/access-status$/i,
  /^\/api\/billing\/checkout-session$/i,
  /^\/api\/billing\/customer-portal$/i
];

const normalizeBooleanEnv = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (['true', '1', 'yes', 'on'].includes(normalizedValue)) {
    return true;
  }

  if (['false', '0', 'no', 'off'].includes(normalizedValue)) {
    return false;
  }

  return null;
};

const isBillingEnforcementEnabled = () => {
  const explicitValue = normalizeBooleanEnv(process.env.BILLING_ENFORCEMENT_ENABLED);

  if (explicitValue !== null) {
    return explicitValue;
  }

  return process.env.NODE_ENV === 'production';
};

const isBillingAllowedPath = (originalUrl = '') => {
  const pathWithoutQuery = String(originalUrl || '').split('?')[0];
  return ALLOWED_BILLING_PATH_PATTERNS.some((pattern) => pattern.test(pathWithoutQuery));
};

const enforceBillingAccess = async (req, res, next) => {
  if (!req.user?.gym_id) {
    return next();
  }

  if (!isBillingEnforcementEnabled()) {
    return next();
  }

  if (isBillingAllowedPath(req.originalUrl || req.url)) {
    return next();
  }

  try {
    const subscription = await getSubscriptionByGymId(req.user.gym_id);
    const billingState = buildSafeBillingPayload(subscription);

    if (billingState.access_granted) {
      return next();
    }

    return res.status(402).json({
      message: 'Billing subscription required.',
      billing_required: true
    });
  } catch (error) {
    return handleServerError(res, 'Billing entitlement check error:', error);
  }
};

module.exports = {
  enforceBillingAccess,
  isBillingEnforcementEnabled,
  isBillingAllowedPath
};
