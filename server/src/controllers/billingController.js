const pool = require('../config/db');
const { handleServerError, sendClientError } = require('../middleware/errorHandler');
const {
  PLAN_CODES,
  BILLING_STATUSES,
  getSubscriptionByGymId,
  buildSafeBillingPayload,
  getGymBillingContext,
  ensureGymSubscription,
  updateGymSubscription,
  isDemoSubscription,
  mapStripeStatusToBillingStatus,
  findSubscriptionByStripeSubscriptionId,
  findSubscriptionByStripeCustomerId,
  getBillingEventByStripeEventId,
  recordBillingEventProcessed,
  inferPlanCodeFromPriceId,
  toNullableDate
} = require('../services/billingService');
const {
  getPlanLimits,
  getCurrentUsage,
  getUsageWarnings,
  checkFounderAvailability
} = require('../services/planLimitsService');
const {
  getStripeClient,
  constructWebhookEvent,
  getStripePriceIdForPlan,
  getCheckoutUrls,
  getCustomerPortalReturnUrl,
  getBillingTrialDays
} = require('../services/stripeService');

const isMissingBillingSchemaError = (error) => (
  Boolean(error)
  && error.code === 'ER_NO_SUCH_TABLE'
  && /gym_subscriptions|billing_events/i.test(error.sqlMessage || error.message || '')
);

const isStripeConfigError = (error) => Boolean(error?.isStripeConfigError || error?.statusCode === 501);

const isStripeApiError = (error) => Boolean(error?.type && String(error.type).startsWith('Stripe'));
const isStripeSignatureError = (error) => error?.type === 'StripeSignatureVerificationError';
const isBillingEventDuplicateError = (error) => (
  error?.code === 'ER_DUP_ENTRY'
  && /billing_events|stripe_event_id|uq_billing_events_stripe_event/i.test(
    error?.sqlMessage || error?.message || ''
  )
);

const getSubscriptionPriceId = (subscriptionObject) => (
  subscriptionObject?.items?.data?.[0]?.price?.id
  || subscriptionObject?.plan?.id
  || null
);

const isBillingManager = (user) => ['owner', 'admin'].includes(String(user?.role || '').trim().toLowerCase());

const buildBillingDashboardPayload = async (subscription) => {
  const safePayload = buildSafeBillingPayload(subscription);
  const limits = await getPlanLimits(subscription.plan_code);
  const usageMeta = await getUsageWarnings(subscription.gym_id);

  return {
    subscription: {
      ...safePayload,
      founder_locked_rate: Boolean(subscription?.founder_locked_rate),
      founder_started_at: subscription?.founder_started_at || null,
      current_period_start: subscription?.current_period_start || null
    },
    plan_limits: limits,
    usage: usageMeta.usage,
    usage_warnings: usageMeta.warnings,
    founder_availability: await checkFounderAvailability()
  };
};

const resolveSubscriptionCurrentPeriodEnd = (subscriptionObject) => {
  const subscriptionCurrentPeriodEnd = subscriptionObject?.current_period_end;
  if (typeof subscriptionCurrentPeriodEnd === 'number') {
    return {
      value: subscriptionCurrentPeriodEnd,
      source: 'subscription'
    };
  }

  const itemCurrentPeriodEnd = subscriptionObject?.items?.data?.[0]?.current_period_end;
  if (typeof itemCurrentPeriodEnd === 'number') {
    return {
      value: itemCurrentPeriodEnd,
      source: 'item'
    };
  }

  return {
    value: undefined,
    source: 'none'
  };
};

const resolveSubscriptionCurrentPeriodStart = (subscriptionObject) => {
  const subscriptionCurrentPeriodStart = subscriptionObject?.current_period_start;
  if (typeof subscriptionCurrentPeriodStart === 'number') {
    return subscriptionCurrentPeriodStart;
  }

  const itemCurrentPeriodStart = subscriptionObject?.items?.data?.[0]?.current_period_start;
  if (typeof itemCurrentPeriodStart === 'number') {
    return itemCurrentPeriodStart;
  }

  return undefined;
};

const resolveScheduledCancel = (subscriptionObject) => {
  const rawCancelAtPeriodEnd = subscriptionObject?.cancel_at_period_end;
  if (rawCancelAtPeriodEnd === true) {
    return {
      value: true,
      source: 'subscription'
    };
  }

  const cancelAt = subscriptionObject?.cancel_at;
  const normalizedStatus = String(subscriptionObject?.status || '').trim().toLowerCase();
  const currentUnixTime = Math.floor(Date.now() / 1000);
  const currentPeriodEnd = resolveSubscriptionCurrentPeriodEnd(subscriptionObject);

  if (
    typeof cancelAt === 'number'
    && ['active', 'trialing'].includes(normalizedStatus)
    && cancelAt > currentUnixTime
  ) {
    return {
      value: true,
      source: 'active_future_cancel_at'
    };
  }

  if (
    typeof cancelAt === 'number'
    && ['active', 'trialing'].includes(normalizedStatus)
    && typeof currentPeriodEnd.value === 'number'
    && Math.abs(cancelAt - currentPeriodEnd.value) <= 300
  ) {
    return {
      value: true,
      source: 'active_period_end_cancel_at_match'
    };
  }

  return {
    value: false,
    source: typeof rawCancelAtPeriodEnd === 'boolean' ? 'subscription_false' : 'default_false'
  };
};

const getSubscriptionTrialEnd = (subscriptionObject) => {
  const trialEnd = subscriptionObject?.trial_end;
  return typeof trialEnd === 'number' ? trialEnd : undefined;
};

const getSubscriptionPlanCode = (subscriptionObject, fallbackPlanCode = PLAN_CODES.NONE) => {
  const metadataPlanCode = String(subscriptionObject?.metadata?.plan_code || '').trim().toLowerCase();

  if ([PLAN_CODES.FOUNDER, PLAN_CODES.REGULAR, PLAN_CODES.DEMO].includes(metadataPlanCode)) {
    return metadataPlanCode;
  }

  const inferredPlanCode = inferPlanCodeFromPriceId(getSubscriptionPriceId(subscriptionObject));
  if (inferredPlanCode !== PLAN_CODES.NONE) {
    return inferredPlanCode;
  }

  if ([PLAN_CODES.FOUNDER, PLAN_CODES.REGULAR, PLAN_CODES.DEMO].includes(fallbackPlanCode)) {
    return fallbackPlanCode;
  }

  return undefined;
};

const buildSubscriptionUpdateFields = (
  subscriptionObject,
  {
    fallbackPlanCode = PLAN_CODES.NONE,
    fallbackBillingStatus
  } = {}
) => {
  const updateFields = {};
  const stripeCustomerId = getStripeWebhookCustomerId(subscriptionObject?.customer);
  const resolvedPlanCode = getSubscriptionPlanCode(subscriptionObject, fallbackPlanCode);
  const priceId = getSubscriptionPriceId(subscriptionObject);
  const scheduledCancel = resolveScheduledCancel(subscriptionObject);
  const currentPeriodEnd = resolveSubscriptionCurrentPeriodEnd(subscriptionObject);
  const currentPeriodStart = resolveSubscriptionCurrentPeriodStart(subscriptionObject);
  const trialEnd = getSubscriptionTrialEnd(subscriptionObject);

  if (stripeCustomerId) {
    updateFields.stripe_customer_id = stripeCustomerId;
  }

  if (subscriptionObject?.id) {
    updateFields.stripe_subscription_id = String(subscriptionObject.id);
  }

  if (resolvedPlanCode) {
    updateFields.plan_code = resolvedPlanCode;
  }

  if (resolvedPlanCode === PLAN_CODES.FOUNDER) {
    updateFields.founder_locked_rate = true;
  }

  if (priceId) {
    updateFields.price_id = priceId;
  }

  if (typeof subscriptionObject?.status === 'string') {
    updateFields.billing_status = mapStripeStatusToBillingStatus(subscriptionObject?.status);
  } else if (fallbackBillingStatus) {
    updateFields.billing_status = fallbackBillingStatus;
  }

  if (typeof currentPeriodEnd.value === 'number') {
    updateFields.current_period_end = toNullableDate(currentPeriodEnd.value);
  }

  if (typeof currentPeriodStart === 'number') {
    updateFields.current_period_start = toNullableDate(currentPeriodStart);
  }

  updateFields.cancel_at_period_end = scheduledCancel.value ? 1 : 0;

  if (typeof trialEnd === 'number') {
    updateFields.trial_ends_at = toNullableDate(trialEnd);
  }

  return updateFields;
};

const getStripeWebhookCustomerId = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && value.id) {
    return String(value.id);
  }

  return null;
};

const buildSubscriptionDebugSnapshot = (subscriptionObject, eventId, updateResult = null) => {
  const stripeSubscriptionId = subscriptionObject?.id ? String(subscriptionObject.id) : null;
  const stripeCustomerId = getStripeWebhookCustomerId(subscriptionObject?.customer);
  const currentPeriodEnd = resolveSubscriptionCurrentPeriodEnd(subscriptionObject);
  const scheduledCancel = resolveScheduledCancel(subscriptionObject);
  const updatePayload = buildSubscriptionUpdateFields(subscriptionObject);

  return {
    eventId,
    subscriptionId: stripeSubscriptionId,
    customerId: stripeCustomerId,
    subscriptionStatus: subscriptionObject?.status || null,
    subscriptionCancelAtPeriodEndValue: subscriptionObject?.cancel_at_period_end,
    subscriptionCancelAtPeriodEndType: typeof subscriptionObject?.cancel_at_period_end,
    subscriptionCancelAtValue: subscriptionObject?.cancel_at ?? null,
    subscriptionCancelAtType: typeof subscriptionObject?.cancel_at,
    subscriptionCanceledAtValue: subscriptionObject?.canceled_at ?? null,
    subscriptionCanceledAtType: typeof subscriptionObject?.canceled_at,
    subscriptionEndedAtValue: subscriptionObject?.ended_at ?? null,
    subscriptionEndedAtType: typeof subscriptionObject?.ended_at,
    subscriptionCurrentPeriodEndValue: subscriptionObject?.current_period_end ?? null,
    subscriptionCurrentPeriodEndType: typeof subscriptionObject?.current_period_end,
    itemCurrentPeriodEndValue: subscriptionObject?.items?.data?.[0]?.current_period_end ?? null,
    itemCurrentPeriodEndType: typeof subscriptionObject?.items?.data?.[0]?.current_period_end,
    itemCurrentPeriodStartValue: subscriptionObject?.items?.data?.[0]?.current_period_start ?? null,
    itemCurrentPeriodStartType: typeof subscriptionObject?.items?.data?.[0]?.current_period_start,
    hasCancellationDetails: Boolean(subscriptionObject?.cancellation_details),
    cancellationReason: subscriptionObject?.cancellation_details?.reason || null,
    cancellationCommentPresent: Boolean(subscriptionObject?.cancellation_details?.comment),
    computedScheduledCancel: scheduledCancel.value,
    scheduledCancelSource: scheduledCancel.source,
    currentPeriodEndSource: currentPeriodEnd.source,
    finalBillingStatus: updatePayload.billing_status ?? null,
    finalCurrentPeriodEnd: updatePayload.current_period_end ?? null,
    finalCancelAtPeriodEnd: updatePayload.cancel_at_period_end ?? null,
    updateKeys: updateResult?.updatedKeys || [],
    affectedRows: updateResult?.affectedRows || 0
  };
};

const shouldAttemptStripeReconciliation = (subscription) => (
  Boolean(subscription?.stripe_customer_id)
  && (
    !subscription?.stripe_subscription_id
    || [BILLING_STATUSES.NONE, BILLING_STATUSES.INCOMPLETE].includes(subscription?.billing_status)
    || (
      subscription?.billing_status === BILLING_STATUSES.TRIALING
      && !subscription?.trial_ends_at
    )
    || (
      subscription?.billing_status === BILLING_STATUSES.ACTIVE
      && !subscription?.current_period_end
    )
  )
);

const selectMostRelevantStripeSubscription = (subscriptions = []) => {
  if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
    return null;
  }

  const statusPriority = new Map([
    ['trialing', 0],
    ['active', 1],
    ['past_due', 2],
    ['incomplete', 3],
    ['unpaid', 4],
    ['canceled', 5]
  ]);

  const rankedSubscriptions = [...subscriptions].sort((left, right) => {
    const leftPriority = statusPriority.get(String(left?.status || '').toLowerCase()) ?? 99;
    const rightPriority = statusPriority.get(String(right?.status || '').toLowerCase()) ?? 99;

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return Number(right?.created || 0) - Number(left?.created || 0);
  });

  return rankedSubscriptions[0] || null;
};

const reconcileGymSubscriptionFromStripeIfNeeded = async (subscription) => {
  if (!shouldAttemptStripeReconciliation(subscription)) {
    return subscription;
  }

  const stripe = getStripeClient();
  const stripeSubscriptions = await stripe.subscriptions.list({
    customer: subscription.stripe_customer_id,
    status: 'all',
    limit: 10,
    expand: ['data.items.data.price']
  });
  const selectedSubscription = selectMostRelevantStripeSubscription(stripeSubscriptions?.data || []);

  if (!selectedSubscription) {
    return subscription;
  }

  await syncFromStripeSubscription({
    connection: null,
    subscriptionObject: selectedSubscription,
    fallbackPlanCode: subscription.plan_code,
    fallbackGymId: subscription.gym_id,
    fallbackCustomerId: subscription.stripe_customer_id
  });

  return getSubscriptionByGymId(subscription.gym_id);
};

const getSelectedDatabaseName = async (connection) => {
  const [rows] = await connection.query('SELECT DATABASE() AS db_name');
  return rows[0]?.db_name || null;
};

const handleBillingError = (res, label, error) => {
  if (isMissingBillingSchemaError(error)) {
    return sendClientError(res, {
      status: 500,
      message: 'Billing schema is missing. Run database migrations and try again.'
    });
  }

  if (isStripeSignatureError(error)) {
    return sendClientError(res, {
      status: 400,
      message: 'Invalid Stripe webhook signature.'
    });
  }

  if (isStripeConfigError(error)) {
    return sendClientError(res, {
      status: error.statusCode || 501,
      message: error.message || 'Stripe billing is not configured yet.'
    });
  }

  if (isStripeApiError(error)) {
    return handleServerError(res, label, error, {
      status: 502,
      message: 'Billing provider request failed. Please try again later.'
    });
  }

  return handleServerError(res, label, error);
};

const rejectDemoGymBilling = (res, subscription) => {
  if (!isDemoSubscription(subscription)) {
    return false;
  }

  sendClientError(res, {
    status: 403,
    message: 'Demo gyms cannot manage billing.'
  });
  return true;
};

const resolveGymSubscriptionForWebhook = async ({
  connection,
  gymId,
  stripeSubscriptionId,
  stripeCustomerId
}) => {
  if (stripeSubscriptionId) {
    const bySubscription = await findSubscriptionByStripeSubscriptionId(stripeSubscriptionId, connection);
    if (bySubscription) {
      return bySubscription;
    }
  }

  if (stripeCustomerId) {
    const byCustomer = await findSubscriptionByStripeCustomerId(stripeCustomerId, connection);
    if (byCustomer) {
      return byCustomer;
    }
  }

  if (gymId) {
    return ensureGymSubscription(gymId, connection);
  }

  return null;
};

const syncFromStripeSubscription = async ({
  connection,
  subscriptionObject,
  fallbackPlanCode = PLAN_CODES.NONE,
  fallbackBillingStatus = undefined,
  fallbackGymId = null,
  fallbackCustomerId = null,
  logContext = null
}) => {
  const stripeSubscriptionId = subscriptionObject?.id ? String(subscriptionObject.id) : null;
  const stripeCustomerId = getStripeWebhookCustomerId(subscriptionObject?.customer) || fallbackCustomerId;
  const metadataGymId = Number(subscriptionObject?.metadata?.gym_id || 0) || null;
  const gymId = fallbackGymId || metadataGymId;
  const localSubscription = await resolveGymSubscriptionForWebhook({
    connection,
    gymId,
    stripeSubscriptionId,
    stripeCustomerId
  });

  if (!localSubscription) {
    if (logContext?.eventType === 'customer.subscription.updated') {
      console.info('Billing webhook subscription update trace:', {
        ...buildSubscriptionDebugSnapshot(subscriptionObject, logContext.eventId),
        gymSubscriptionFound: false
      });
    }

    return false;
  }

  const updatePayload = buildSubscriptionUpdateFields(subscriptionObject, {
    fallbackPlanCode,
    fallbackBillingStatus
  });
  const updateResult = await updateGymSubscription(localSubscription.gym_id, updatePayload, connection);

  if (logContext?.eventType === 'customer.subscription.updated') {
    console.info('Billing webhook subscription update trace:', {
      ...buildSubscriptionDebugSnapshot(subscriptionObject, logContext.eventId, updateResult),
      gymSubscriptionFound: true
    });
  }

  return true;
};

const processCheckoutSessionCompleted = async (connection, stripe, event) => {
  const session = event.data.object || {};
  const gymId = Number(session?.metadata?.gym_id || 0);
  const planCodeFromMetadata = String(session?.metadata?.plan_code || '').trim().toLowerCase();
  const stripeCustomerId = getStripeWebhookCustomerId(session.customer);
  const stripeSubscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id || null;

  if (!gymId || !stripeCustomerId) {
    return false;
  }

  const localSubscription = await ensureGymSubscription(gymId, connection);
  const fallbackPlanCode = [PLAN_CODES.FOUNDER, PLAN_CODES.REGULAR].includes(planCodeFromMetadata)
    ? planCodeFromMetadata
    : localSubscription.plan_code;

  const updateFields = {
    stripe_customer_id: stripeCustomerId
  };

  if (stripeSubscriptionId) {
    updateFields.stripe_subscription_id = stripeSubscriptionId;
  }

  if ([PLAN_CODES.FOUNDER, PLAN_CODES.REGULAR].includes(fallbackPlanCode)) {
    updateFields.plan_code = fallbackPlanCode;
  }

  if (fallbackPlanCode === PLAN_CODES.FOUNDER) {
    updateFields.founder_locked_rate = true;
    updateFields.founder_started_at = localSubscription.founder_started_at || new Date();
  }

  await updateGymSubscription(gymId, updateFields, connection);

  if (!stripeSubscriptionId) {
    return true;
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  await updateGymSubscription(gymId, {
    ...buildSubscriptionUpdateFields(stripeSubscription, {
      fallbackPlanCode
    }),
    ...(fallbackPlanCode === PLAN_CODES.FOUNDER
      ? {
          founder_locked_rate: true,
          founder_started_at: localSubscription.founder_started_at || new Date()
        }
      : {})
  }, connection);
  return true;
};

const processSubscriptionEvent = async (connection, stripe, event) => {
  const eventSubscriptionObject = event.data.object || {};
  const stripeSubscriptionId = eventSubscriptionObject?.id ? String(eventSubscriptionObject.id) : null;
  const subscriptionObject = (
    stripeSubscriptionId
    && event.type !== 'customer.subscription.deleted'
  )
    ? await stripe.subscriptions.retrieve(stripeSubscriptionId)
    : eventSubscriptionObject;

  return syncFromStripeSubscription({
    connection,
    subscriptionObject,
    fallbackBillingStatus: event.type === 'customer.subscription.deleted'
      ? BILLING_STATUSES.CANCELED
      : undefined,
    logContext: {
      eventType: event.type,
      eventId: event.id
    }
  });
};

const processInvoicePaid = async (connection, stripe, event) => {
  const invoice = event.data.object || {};
  const stripeSubscriptionId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : invoice.subscription?.id || null;
  const stripeCustomerId = getStripeWebhookCustomerId(invoice.customer);

  if (stripeSubscriptionId) {
    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    return syncFromStripeSubscription({
      connection,
      subscriptionObject: stripeSubscription,
      fallbackCustomerId: stripeCustomerId
    });
  }

  const localSubscription = await resolveGymSubscriptionForWebhook({
    connection,
    stripeSubscriptionId: null,
    stripeCustomerId
  });

  if (!localSubscription) {
    return false;
  }

  await updateGymSubscription(localSubscription.gym_id, {
    stripe_customer_id: stripeCustomerId || localSubscription.stripe_customer_id
  }, connection);
  return true;
};

const processInvoicePaymentFailed = async (connection, stripe, event) => {
  const invoice = event.data.object || {};
  const stripeSubscriptionId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : invoice.subscription?.id || null;
  const stripeCustomerId = getStripeWebhookCustomerId(invoice.customer);

  if (stripeSubscriptionId) {
    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    return syncFromStripeSubscription({
      connection,
      subscriptionObject: stripeSubscription,
      fallbackCustomerId: stripeCustomerId
    });
  }

  const localSubscription = await resolveGymSubscriptionForWebhook({
    connection,
    stripeSubscriptionId: null,
    stripeCustomerId
  });

  if (!localSubscription) {
    return false;
  }

  await updateGymSubscription(localSubscription.gym_id, {
    stripe_customer_id: stripeCustomerId || localSubscription.stripe_customer_id,
    billing_status: BILLING_STATUSES.PAST_DUE
  }, connection);
  return true;
};

const processStripeWebhookEvent = async (connection, stripe, event) => {
  switch (event.type) {
    case 'checkout.session.completed':
      return processCheckoutSessionCompleted(connection, stripe, event);
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      return processSubscriptionEvent(connection, stripe, event);
    case 'invoice.paid':
      return processInvoicePaid(connection, stripe, event);
    case 'invoice.payment_failed':
      return processInvoicePaymentFailed(connection, stripe, event);
    default:
      return false;
  }
};

const getBillingSubscription = async (req, res) => {
  try {
    if (!isBillingManager(req.user)) {
      return sendClientError(res, {
        status: 403,
        message: 'Only owner or admin accounts can access billing details.'
      });
    }

    const subscription = await reconcileGymSubscriptionFromStripeIfNeeded(
      await getSubscriptionByGymId(req.user.gym_id)
    );

    return res.status(200).json(await buildBillingDashboardPayload(subscription));
  } catch (error) {
    return handleBillingError(res, 'Get billing subscription error:', error);
  }
};

const getBillingStatus = async (req, res) => {
  try {
    if (!isBillingManager(req.user)) {
      return sendClientError(res, {
        status: 403,
        message: 'Only owner or admin accounts can access billing details.'
      });
    }

    const subscription = await reconcileGymSubscriptionFromStripeIfNeeded(
      await getSubscriptionByGymId(req.user.gym_id)
    );

    return res.status(200).json(await buildBillingDashboardPayload(subscription));
  } catch (error) {
    return handleBillingError(res, 'Get billing status error:', error);
  }
};

const getBillingAccessStatus = async (req, res) => {
  try {
    const subscription = await reconcileGymSubscriptionFromStripeIfNeeded(
      await getSubscriptionByGymId(req.user.gym_id)
    );
    const safePayload = buildSafeBillingPayload(subscription);

    return res.status(200).json({
      gym_id: safePayload.gym_id,
      access_granted: safePayload.access_granted,
      plan_code: safePayload.plan_code,
      plan_label: safePayload.plan_label,
      billing_status: safePayload.billing_status,
      current_period_end: safePayload.current_period_end,
      cancel_at_period_end: safePayload.cancel_at_period_end,
      trial_ends_at: safePayload.trial_ends_at
    });
  } catch (error) {
    return handleBillingError(res, 'Get billing access status error:', error);
  }
};

const createCheckoutSession = async (req, res) => {
  try {
    if (!isBillingManager(req.user)) {
      return sendClientError(res, {
        status: 403,
        message: 'Only owner or admin accounts can start checkout.'
      });
    }

    const rawPlanCode = String(req.body?.plan_code || req.body?.plan || '').trim().toLowerCase();
    const requestedPlanCode = rawPlanCode === 'standard'
      ? PLAN_CODES.REGULAR
      : rawPlanCode;

    if (![PLAN_CODES.FOUNDER, PLAN_CODES.REGULAR].includes(requestedPlanCode)) {
      return sendClientError(res, {
        status: 400,
        message: 'plan must be founder or standard'
      });
    }

    const subscription = await getSubscriptionByGymId(req.user.gym_id);

    if (rejectDemoGymBilling(res, subscription)) {
      return undefined;
    }

    const priceId = getStripePriceIdForPlan(requestedPlanCode);

    if (!priceId) {
      return sendClientError(res, {
        status: 501,
        message: 'Selected billing plan is not configured yet.'
      });
    }

    if (requestedPlanCode === PLAN_CODES.FOUNDER) {
      const founderAvailability = await checkFounderAvailability();

      if (!founderAvailability.founderPlanAvailable) {
        return res.status(409).json({
          message: 'Founder Plan spots are currently filled. Please choose the Standard Plan.',
          upgradeRequired: true,
          upgradePlan: 'standard',
          upgradePlanLabel: 'Standard',
          founder_availability: founderAvailability
        });
      }
    }

    const { successUrl, cancelUrl } = getCheckoutUrls();
    const stripe = getStripeClient();
    const gymContext = await getGymBillingContext(req.user.gym_id);
    const founderTrialDays = getBillingTrialDays();

    if (!gymContext) {
      return sendClientError(res, {
        status: 404,
        message: 'Gym not found'
      });
    }

    let stripeCustomerId = subscription.stripe_customer_id || null;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        name: gymContext.name,
        email: gymContext.owner_email || undefined,
        metadata: {
          gym_id: String(req.user.gym_id),
          actor_user_id: String(req.user.id),
          owner_user_id: String(gymContext.owner_user_id || req.user.id),
          plan_code: requestedPlanCode
        }
      });

      stripeCustomerId = customer.id;
      await updateGymSubscription(req.user.gym_id, {
        stripe_customer_id: stripeCustomerId
      });
    }

    const subscriptionData = {
      metadata: {
        gym_id: String(req.user.gym_id),
        actor_user_id: String(req.user.id),
        owner_user_id: String(gymContext.owner_user_id || req.user.id),
        plan_code: requestedPlanCode
      }
    };

    if (requestedPlanCode === PLAN_CODES.FOUNDER && founderTrialDays > 0) {
      subscriptionData.trial_period_days = founderTrialDays;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      payment_method_collection: 'always',
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        gym_id: String(req.user.gym_id),
        actor_user_id: String(req.user.id),
        owner_user_id: String(gymContext.owner_user_id || req.user.id),
        plan_code: requestedPlanCode
      },
      subscription_data: subscriptionData
    });

    return res.status(200).json({
      url: session.url,
      session_id: session.id
    });
  } catch (error) {
    return handleBillingError(res, 'Create checkout session error:', error);
  }
};

const createCustomerPortalSession = async (req, res) => {
  try {
    if (!isBillingManager(req.user)) {
      return sendClientError(res, {
        status: 403,
        message: 'Only owner or admin accounts can manage billing.'
      });
    }

    const subscription = await getSubscriptionByGymId(req.user.gym_id);

    if (rejectDemoGymBilling(res, subscription)) {
      return undefined;
    }

    if (!subscription.stripe_customer_id) {
      return sendClientError(res, {
        status: 400,
        message: 'Start checkout first before opening the customer portal.'
      });
    }

    const stripe = getStripeClient();
    const returnUrl = getCustomerPortalReturnUrl();
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: returnUrl
    });

    return res.status(200).json({
      url: session.url
    });
  } catch (error) {
    return handleBillingError(res, 'Create customer portal session error:', error);
  }
};

const handleBillingWebhook = async (req, res) => {
  let connection;
  let webhookEventId = null;
  let webhookEventType = null;

  try {
    const signature = req.headers['stripe-signature'];
    const event = constructWebhookEvent(req.body, signature);
    webhookEventId = event.id;
    webhookEventType = event.type;
    const stripe = getStripeClient();

    connection = await pool.getConnection();
    await connection.beginTransaction();
    const selectedDatabase = await getSelectedDatabaseName(connection);

    console.info('Billing webhook received:', {
      eventId: event.id,
      eventType: event.type,
      database: selectedDatabase
    });

    const existingEvent = await getBillingEventByStripeEventId(event.id, connection);

    console.info('Billing webhook duplicate lookup:', {
      eventId: event.id,
      eventType: event.type,
      database: selectedDatabase,
      duplicateLookupCount: existingEvent ? 1 : 0,
      duplicateRowId: existingEvent?.id || null,
      duplicateSource: existingEvent ? 'getBillingEventByStripeEventId' : null
    });

    if (existingEvent) {
      await connection.rollback();
      connection.release();
      connection = null;

      return res.status(200).json({
        received: true,
        duplicate: true
      });
    }

    const subscriptionSyncPerformed = await processStripeWebhookEvent(connection, stripe, event);
    console.info('Billing webhook processing result:', {
      eventId: event.id,
      eventType: event.type,
      database: selectedDatabase,
      subscriptionSyncSkipped: !subscriptionSyncPerformed
    });

    await recordBillingEventProcessed({
      stripeEventId: event.id,
      eventType: event.type
    }, connection);
    console.info('Billing webhook event insert:', {
      eventId: event.id,
      eventType: event.type,
      database: selectedDatabase,
      inserted: true
    });

    await connection.commit();
    connection.release();
    connection = null;

    return res.status(200).json({
      received: true
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        // Ignore rollback errors and prefer the original failure for logging.
      }
      connection.release();
    }

    if (isBillingEventDuplicateError(error)) {
      console.info('Billing webhook duplicate insert fallback:', {
        eventId: webhookEventId,
        eventType: webhookEventType,
        duplicateSource: 'recordBillingEventProcessed',
        errorCode: error.code
      });
      return res.status(200).json({
        received: true,
        duplicate: true
      });
    }

    return handleBillingError(res, 'Billing webhook error:', error);
  }
};

module.exports = {
  getBillingSubscription,
  getBillingStatus,
  getBillingAccessStatus,
  createCheckoutSession,
  createCustomerPortalSession,
  handleBillingWebhook
};
