const rateLimit = require('express-rate-limit');

const isProduction = process.env.NODE_ENV === 'production';

const parsePositiveInt = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const defaultWindowMs = parsePositiveInt(
  process.env.RATE_LIMIT_WINDOW_MS,
  15 * 60 * 1000
);

const devMultiplier = parsePositiveInt(process.env.RATE_LIMIT_DEV_MULTIPLIER, 10);

const withDevDefault = (productionDefault) => (
  isProduction ? productionDefault : productionDefault * devMultiplier
);

const buildLimiter = ({
  max,
  windowMs = defaultWindowMs,
  skipSuccessfulRequests = false
}) => rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests,
  handler: (req, res) => res.status(429).json({
    message: 'Too many requests. Please try again later.'
  })
});

const loginLimiter = buildLimiter({
  max: parsePositiveInt(process.env.RATE_LIMIT_LOGIN_MAX, withDevDefault(10)),
  skipSuccessfulRequests: true
});

const registerLimiter = buildLimiter({
  max: parsePositiveInt(process.env.RATE_LIMIT_REGISTER_MAX, withDevDefault(5))
});

const inviteAccessLimiter = buildLimiter({
  max: parsePositiveInt(process.env.RATE_LIMIT_INVITE_ACCESS_MAX, withDevDefault(15)),
  skipSuccessfulRequests: true
});

const ownerInviteLimiter = buildLimiter({
  max: parsePositiveInt(process.env.RATE_LIMIT_OWNER_INVITE_MAX, withDevDefault(20))
});

const publicInquiryLimiter = buildLimiter({
  max: parsePositiveInt(process.env.RATE_LIMIT_PUBLIC_INQUIRY_MAX, withDevDefault(12))
});

module.exports = {
  loginLimiter,
  registerLimiter,
  inviteAccessLimiter,
  ownerInviteLimiter,
  publicInquiryLimiter
};
