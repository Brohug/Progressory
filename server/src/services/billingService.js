const pool = require('../config/db');

const PLAN_CODES = Object.freeze({
  NONE: 'none',
  DEMO: 'demo',
  FOUNDER: 'founder',
  REGULAR: 'regular'
});

const BILLING_STATUSES = Object.freeze({
  NONE: 'none',
  TRIALING: 'trialing',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  INCOMPLETE: 'incomplete',
  UNPAID: 'unpaid',
  DEMO: 'demo'
});

const ACCESS_GRANTING_STATUSES = new Set([
  BILLING_STATUSES.ACTIVE,
  BILLING_STATUSES.TRIALING,
  BILLING_STATUSES.DEMO
]);

const VALID_PLAN_CODES = new Set(Object.values(PLAN_CODES));
const VALID_BILLING_STATUSES = new Set(Object.values(BILLING_STATUSES));
const DEMO_GYM_SLUGS = new Set(['progressory-demo-academy']);

const normalizePlanCode = (value) => {
  const normalizedValue = String(value || '').trim().toLowerCase();
  return VALID_PLAN_CODES.has(normalizedValue) ? normalizedValue : PLAN_CODES.NONE;
};

const normalizeBillingStatus = (value) => {
  const normalizedValue = String(value || '').trim().toLowerCase();
  return VALID_BILLING_STATUSES.has(normalizedValue) ? normalizedValue : BILLING_STATUSES.NONE;
};

const billingStatusGrantsAccess = (status) => ACCESS_GRANTING_STATUSES.has(normalizeBillingStatus(status));

const mapStripeStatusToBillingStatus = (stripeStatus) => {
  const normalizedValue = String(stripeStatus || '').trim().toLowerCase();

  switch (normalizedValue) {
    case 'active':
      return BILLING_STATUSES.ACTIVE;
    case 'trialing':
      return BILLING_STATUSES.TRIALING;
    case 'past_due':
      return BILLING_STATUSES.PAST_DUE;
    case 'canceled':
      return BILLING_STATUSES.CANCELED;
    case 'incomplete':
      return BILLING_STATUSES.INCOMPLETE;
    case 'incomplete_expired':
    case 'paused':
    case 'unpaid':
      return BILLING_STATUSES.UNPAID;
    default:
      return BILLING_STATUSES.NONE;
  }
};

const getPoolOrConnection = (connection) => connection || pool;

const toNullableDate = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    const fromEpoch = new Date(value * 1000);
    return Number.isNaN(fromEpoch.getTime()) ? null : fromEpoch;
  }

  const fromString = new Date(value);
  return Number.isNaN(fromString.getTime()) ? null : fromString;
};

const getGymBillingContext = async (gymId, connection = null) => {
  const queryable = getPoolOrConnection(connection);
  const [rows] = await queryable.query(
    `SELECT g.id, g.name, g.slug,
            owner.id AS owner_user_id,
            owner.email AS owner_email,
            owner.first_name AS owner_first_name,
            owner.last_name AS owner_last_name
     FROM gyms g
     LEFT JOIN users owner
       ON owner.gym_id = g.id
      AND owner.role = 'owner'
      AND owner.is_active = TRUE
     WHERE g.id = ?
     ORDER BY owner.id ASC
     LIMIT 1`,
    [gymId]
  );

  return rows[0] || null;
};

const getDefaultSubscriptionState = async (gymId, connection = null) => {
  const gymContext = await getGymBillingContext(gymId, connection);
  const gymSlug = String(gymContext?.slug || '').trim().toLowerCase();

  if (DEMO_GYM_SLUGS.has(gymSlug)) {
    return {
      plan_code: PLAN_CODES.DEMO,
      billing_status: BILLING_STATUSES.DEMO
    };
  }

  return {
    plan_code: PLAN_CODES.NONE,
    billing_status: BILLING_STATUSES.NONE
  };
};

const normalizeSubscriptionRow = (row) => {
  if (!row) {
    return null;
  }

  return {
    ...row,
    plan_code: normalizePlanCode(row.plan_code),
    billing_status: normalizeBillingStatus(row.billing_status),
    cancel_at_period_end: Boolean(row.cancel_at_period_end)
  };
};

const isDemoSubscription = (subscriptionRow) => {
  const subscription = normalizeSubscriptionRow(subscriptionRow);
  return subscription?.plan_code === PLAN_CODES.DEMO
    || subscription?.billing_status === BILLING_STATUSES.DEMO;
};

const updateGymSubscription = async (gymId, fields, connection = null) => {
  const queryable = getPoolOrConnection(connection);
  const fieldEntries = Object.entries(fields || {}).filter(([, value]) => value !== undefined);

  if (fieldEntries.length === 0) {
    return {
      subscription: await getSubscriptionByGymId(gymId, connection),
      affectedRows: 0,
      updatedKeys: []
    };
  }

  const assignments = fieldEntries.map(([key]) => `${key} = ?`).join(', ');
  const params = fieldEntries.map(([, value]) => value);

  const [result] = await queryable.query(
    `UPDATE gym_subscriptions
     SET ${assignments}
     WHERE gym_id = ?`,
    [...params, gymId]
  );

  return {
    subscription: await getSubscriptionByGymId(gymId, connection),
    affectedRows: Number(result?.affectedRows || 0),
    updatedKeys: fieldEntries.map(([key]) => key)
  };
};

const findSubscriptionByGymId = async (gymId, connection = null) => {
  if (!gymId) {
    return null;
  }

  const queryable = getPoolOrConnection(connection);
  const [rows] = await queryable.query(
    'SELECT * FROM gym_subscriptions WHERE gym_id = ? LIMIT 1',
    [gymId]
  );

  return normalizeSubscriptionRow(rows[0] || null);
};

const findSubscriptionByStripeSubscriptionId = async (stripeSubscriptionId, connection = null) => {
  if (!stripeSubscriptionId) {
    return null;
  }

  const queryable = getPoolOrConnection(connection);
  const [rows] = await queryable.query(
    'SELECT * FROM gym_subscriptions WHERE stripe_subscription_id = ? LIMIT 1',
    [stripeSubscriptionId]
  );

  return normalizeSubscriptionRow(rows[0] || null);
};

const findSubscriptionByStripeCustomerId = async (stripeCustomerId, connection = null) => {
  if (!stripeCustomerId) {
    return null;
  }

  const queryable = getPoolOrConnection(connection);
  const [rows] = await queryable.query(
    'SELECT * FROM gym_subscriptions WHERE stripe_customer_id = ? LIMIT 1',
    [stripeCustomerId]
  );

  return normalizeSubscriptionRow(rows[0] || null);
};

const getBillingEventByStripeEventId = async (stripeEventId, connection = null) => {
  if (!stripeEventId) {
    return null;
  }

  const queryable = getPoolOrConnection(connection);
  const [rows] = await queryable.query(
    'SELECT * FROM billing_events WHERE stripe_event_id = ? LIMIT 1',
    [stripeEventId]
  );

  return rows[0] || null;
};

const recordBillingEventProcessed = async ({ stripeEventId, eventType }, connection = null) => {
  const queryable = getPoolOrConnection(connection);

  await queryable.query(
    `INSERT INTO billing_events
     (stripe_event_id, event_type, processed_at)
     VALUES (?, ?, NOW())`,
    [stripeEventId, eventType]
  );
};

const inferPlanCodeFromPriceId = (priceId) => {
  const normalizedPriceId = String(priceId || '').trim();

  if (!normalizedPriceId) {
    return PLAN_CODES.NONE;
  }

  const founderPriceId = String(process.env.STRIPE_FOUNDER_PRICE_ID || '').trim();
  const regularPriceId = String(process.env.STRIPE_REGULAR_PRICE_ID || '').trim();

  if (founderPriceId && normalizedPriceId === founderPriceId) {
    return PLAN_CODES.FOUNDER;
  }

  if (regularPriceId && normalizedPriceId === regularPriceId) {
    return PLAN_CODES.REGULAR;
  }

  return PLAN_CODES.NONE;
};

const ensureGymSubscription = async (gymId, connection = null) => {
  const queryable = getPoolOrConnection(connection);

  const [existingRows] = await queryable.query(
    'SELECT * FROM gym_subscriptions WHERE gym_id = ? LIMIT 1',
    [gymId]
  );

  if (existingRows.length > 0) {
    return normalizeSubscriptionRow(existingRows[0]);
  }

  const defaultState = await getDefaultSubscriptionState(gymId, connection);

  await queryable.query(
    `INSERT INTO gym_subscriptions
     (gym_id, plan_code, billing_status, cancel_at_period_end)
     VALUES (?, ?, ?, FALSE)`,
    [gymId, defaultState.plan_code, defaultState.billing_status]
  );

  const [createdRows] = await queryable.query(
    'SELECT * FROM gym_subscriptions WHERE gym_id = ? LIMIT 1',
    [gymId]
  );

  return normalizeSubscriptionRow(createdRows[0] || null);
};

const getSubscriptionByGymId = async (gymId, connection = null) => (
  ensureGymSubscription(gymId, connection)
);

const buildSafeBillingPayload = (subscriptionRow) => {
  const subscription = normalizeSubscriptionRow(subscriptionRow);
  const accessGranted = billingStatusGrantsAccess(subscription?.billing_status);

  return {
    gym_id: subscription.gym_id,
    plan_code: subscription.plan_code,
    billing_status: subscription.billing_status,
    stripe_customer_id_present: Boolean(subscription.stripe_customer_id),
    stripe_subscription_id_present: Boolean(subscription.stripe_subscription_id),
    price_id: subscription.price_id || null,
    current_period_end: subscription.current_period_end || null,
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    trial_ends_at: subscription.trial_ends_at || null,
    access_granted: accessGranted
  };
};

module.exports = {
  PLAN_CODES,
  BILLING_STATUSES,
  normalizePlanCode,
  normalizeBillingStatus,
  billingStatusGrantsAccess,
  mapStripeStatusToBillingStatus,
  getGymBillingContext,
  ensureGymSubscription,
  getSubscriptionByGymId,
  findSubscriptionByGymId,
  updateGymSubscription,
  findSubscriptionByStripeSubscriptionId,
  findSubscriptionByStripeCustomerId,
  getBillingEventByStripeEventId,
  recordBillingEventProcessed,
  inferPlanCodeFromPriceId,
  toNullableDate,
  buildSafeBillingPayload,
  isDemoSubscription
};
