const Stripe = require('stripe');
const { PLAN_CODES } = require('./billingService');

const normalizeSecretKey = () => String(process.env.STRIPE_SECRET_KEY || '').trim();
const normalizeStripeMode = () => String(process.env.BILLING_STRIPE_MODE || 'test').trim().toLowerCase();

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

const isStripeConfigured = () => Boolean(normalizeSecretKey());

const getStripeConfigError = (message, statusCode = 501) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isStripeConfigError = true;
  return error;
};

const getBillingStripeMode = () => {
  const stripeMode = normalizeStripeMode();

  if (!['test', 'live'].includes(stripeMode)) {
    throw getStripeConfigError('Billing Stripe mode must be test or live.');
  }

  return stripeMode;
};

const isBillingEnforcementExplicitlyDisabled = () => normalizeBooleanEnv(process.env.BILLING_ENFORCEMENT_ENABLED) === false;

const validateStripeRuntimeMode = () => {
  const stripeMode = getBillingStripeMode();
  const secretKey = normalizeSecretKey();

  if (!secretKey) {
    throw getStripeConfigError('Stripe billing is not configured yet.');
  }

  if (stripeMode === 'test') {
    if (!secretKey.startsWith('sk_test_')) {
      throw getStripeConfigError('Stripe billing test mode requires an sk_test_ secret key.');
    }

    return {
      stripeMode,
      secretKey
    };
  }

  if (process.env.NODE_ENV !== 'production') {
    throw getStripeConfigError('Stripe live mode requires NODE_ENV=production.');
  }

  if (isBillingEnforcementExplicitlyDisabled()) {
    throw getStripeConfigError('Stripe live mode requires billing enforcement to stay enabled.');
  }

  if (!secretKey.startsWith('sk_live_')) {
    throw getStripeConfigError('Stripe billing live mode requires an sk_live_ secret key.');
  }

  return {
    stripeMode,
    secretKey
  };
};

const getStripeClient = () => {
  const { secretKey } = validateStripeRuntimeMode();

  return new Stripe(secretKey);
};

const getWebhookSecret = () => {
  const webhookSecret = String(process.env.STRIPE_WEBHOOK_SECRET || '').trim();

  if (!webhookSecret) {
    throw getStripeConfigError('Stripe webhook secret is not configured yet.');
  }

  if (!webhookSecret.startsWith('whsec_')) {
    throw getStripeConfigError('Stripe webhook secret must use a test webhook secret in this environment.');
  }

  return webhookSecret;
};

const getStripeRuntimeSummary = () => {
  try {
    const stripeMode = getBillingStripeMode();
    const secretKey = normalizeSecretKey();

    return {
      stripeMode,
      configured: Boolean(secretKey),
      keyType: secretKey.startsWith('sk_live_')
        ? 'live'
        : secretKey.startsWith('sk_test_')
          ? 'test'
          : secretKey
            ? 'unknown'
            : 'missing',
      nodeEnv: process.env.NODE_ENV || 'development',
      billingEnforcementExplicitlyDisabled: isBillingEnforcementExplicitlyDisabled()
    };
  } catch (error) {
    return {
      stripeMode: normalizeStripeMode(),
      configured: Boolean(normalizeSecretKey()),
      keyType: 'unknown',
      nodeEnv: process.env.NODE_ENV || 'development',
      billingEnforcementExplicitlyDisabled: isBillingEnforcementExplicitlyDisabled(),
      invalidMode: true
    };
  }
};

const constructWebhookEvent = (rawBody, signature) => {
  if (!signature) {
    throw getStripeConfigError('Stripe signature header is missing.', 400);
  }

  const stripe = getStripeClient();
  const webhookSecret = getWebhookSecret();

  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
};

const getStripePriceIdForPlan = (planCode) => {
  if (planCode === PLAN_CODES.FOUNDER) {
    return String(
      process.env.STRIPE_PRICE_FOUNDER_MONTHLY
      || process.env.STRIPE_FOUNDER_PRICE_ID
      || ''
    ).trim();
  }

  if (planCode === PLAN_CODES.REGULAR) {
    return String(
      process.env.STRIPE_PRICE_STANDARD_MONTHLY
      || process.env.STRIPE_REGULAR_PRICE_ID
      || ''
    ).trim();
  }

  return '';
};

const getCheckoutUrls = () => {
  const clientUrl = String(process.env.CLIENT_URL || '').trim().replace(/\/+$/, '');
  const successUrl = String(
    process.env.STRIPE_SUCCESS_URL
    || (clientUrl ? `${clientUrl}/billing?checkout=success` : '')
  ).trim();
  const cancelUrl = String(
    process.env.STRIPE_CANCEL_URL
    || (clientUrl ? `${clientUrl}/billing?checkout=cancel` : '')
  ).trim();

  if (!successUrl || !cancelUrl) {
    throw getStripeConfigError('Stripe checkout URLs are not configured yet.');
  }

  return { successUrl, cancelUrl };
};

const getCustomerPortalReturnUrl = () => {
  const clientUrl = String(process.env.CLIENT_URL || '').trim().replace(/\/+$/, '');
  const returnUrl = String(
    process.env.STRIPE_CUSTOMER_PORTAL_RETURN_URL
    || (clientUrl ? `${clientUrl}/billing` : '')
  ).trim();

  if (!returnUrl) {
    throw getStripeConfigError('Stripe customer portal return URL is not configured yet.');
  }

  return returnUrl;
};

const getBillingTrialDays = () => {
  const parsedValue = Number.parseInt(process.env.BILLING_TRIAL_DAYS || '30', 10);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    return 30;
  }

  return parsedValue;
};

module.exports = {
  isStripeConfigured,
  getStripeConfigError,
  getBillingStripeMode,
  getStripeRuntimeSummary,
  validateStripeRuntimeMode,
  getStripeClient,
  getWebhookSecret,
  constructWebhookEvent,
  getStripePriceIdForPlan,
  getCheckoutUrls,
  getCustomerPortalReturnUrl,
  getBillingTrialDays
};
