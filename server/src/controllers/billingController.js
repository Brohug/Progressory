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
  getStripeClient,
  constructWebhookEvent,
  getStripePriceIdForPlan,
  getCheckoutUrls,
  getCustomerPortalReturnUrl
} = require('../services/stripeService');

const isMissingBillingSchemaError = (error) => (
  Boolean(error)
  && error.code === 'ER_NO_SUCH_TABLE'
  && /gym_subscriptions|billing_events/i.test(error.sqlMessage || error.message || '')
);

const isStripeConfigError = (error) => Boolean(error?.isStripeConfigError || error?.statusCode === 501);

const isStripeApiError = (error) => Boolean(error?.type && String(error.type).startsWith('Stripe'));
const isStripeSignatureError = (error) => error?.type === 'StripeSignatureVerificationError';
const hasField = (object, propertyName) => Boolean(object) && propertyName in Object(object);

const getSubscriptionPriceId = (subscriptionObject) => (
  subscriptionObject?.items?.data?.[0]?.price?.id
  || subscriptionObject?.plan?.id
  || null
);

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

  if (hasField(subscriptionObject, 'customer') && stripeCustomerId) {
    updateFields.stripe_customer_id = stripeCustomerId;
  }

  if (hasField(subscriptionObject, 'id') && subscriptionObject?.id) {
    updateFields.stripe_subscription_id = String(subscriptionObject.id);
  }

  if (resolvedPlanCode) {
    updateFields.plan_code = resolvedPlanCode;
  }

  if (priceId) {
    updateFields.price_id = priceId;
  }

  if (hasField(subscriptionObject, 'status')) {
    updateFields.billing_status = mapStripeStatusToBillingStatus(subscriptionObject?.status);
  } else if (fallbackBillingStatus) {
    updateFields.billing_status = fallbackBillingStatus;
  }

  if (hasField(subscriptionObject, 'current_period_end')) {
    updateFields.current_period_end = toNullableDate(subscriptionObject?.current_period_end);
  }

  if (hasField(subscriptionObject, 'cancel_at_period_end')) {
    updateFields.cancel_at_period_end = Boolean(subscriptionObject?.cancel_at_period_end);
  }

  if (hasField(subscriptionObject, 'trial_end')) {
    updateFields.trial_ends_at = toNullableDate(subscriptionObject?.trial_end);
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
        eventId: logContext.eventId,
        stripeSubscriptionId,
        stripeCustomerId,
        stripeStatus: subscriptionObject?.status || null,
        stripeCancelAtPeriodEnd: hasField(subscriptionObject, 'cancel_at_period_end')
          ? Boolean(subscriptionObject?.cancel_at_period_end)
          : 'missing',
        stripeCurrentPeriodEndPresent: hasField(subscriptionObject, 'current_period_end'),
        updateKeys: [],
        gymSubscriptionFound: false,
        affectedRows: 0
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
      eventId: logContext.eventId,
      stripeSubscriptionId,
      stripeCustomerId,
      stripeStatus: subscriptionObject?.status || null,
      stripeCancelAtPeriodEnd: hasField(subscriptionObject, 'cancel_at_period_end')
        ? Boolean(subscriptionObject?.cancel_at_period_end)
        : 'missing',
      stripeCurrentPeriodEndPresent: hasField(subscriptionObject, 'current_period_end'),
      updateKeys: updateResult.updatedKeys,
      gymSubscriptionFound: true,
      affectedRows: updateResult.affectedRows
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

  await updateGymSubscription(gymId, updateFields, connection);

  if (!stripeSubscriptionId) {
    return true;
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  await updateGymSubscription(gymId, buildSubscriptionUpdateFields(stripeSubscription, {
    fallbackPlanCode
  }), connection);
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
    const subscription = await getSubscriptionByGymId(req.user.gym_id);

    return res.status(200).json({
      subscription: buildSafeBillingPayload(subscription)
    });
  } catch (error) {
    return handleBillingError(res, 'Get billing subscription error:', error);
  }
};

const getBillingAccessStatus = async (req, res) => {
  try {
    const subscription = await getSubscriptionByGymId(req.user.gym_id);
    const safePayload = buildSafeBillingPayload(subscription);

    return res.status(200).json({
      gym_id: safePayload.gym_id,
      access_granted: safePayload.access_granted,
      plan_code: safePayload.plan_code,
      billing_status: safePayload.billing_status
    });
  } catch (error) {
    return handleBillingError(res, 'Get billing access status error:', error);
  }
};

const createCheckoutSession = async (req, res) => {
  try {
    const requestedPlanCode = String(req.body?.plan_code || '').trim().toLowerCase();

    if (![PLAN_CODES.FOUNDER, PLAN_CODES.REGULAR].includes(requestedPlanCode)) {
      return sendClientError(res, {
        status: 400,
        message: 'plan_code must be founder or regular'
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

    const { successUrl, cancelUrl } = getCheckoutUrls();
    const stripe = getStripeClient();
    const gymContext = await getGymBillingContext(req.user.gym_id);

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
          owner_user_id: String(req.user.id),
          plan_code: requestedPlanCode
        }
      });

      stripeCustomerId = customer.id;
      await updateGymSubscription(req.user.gym_id, {
        stripe_customer_id: stripeCustomerId
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
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
        owner_user_id: String(req.user.id),
        plan_code: requestedPlanCode
      },
      subscription_data: {
        metadata: {
          gym_id: String(req.user.gym_id),
          owner_user_id: String(req.user.id),
          plan_code: requestedPlanCode
        }
      }
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

  try {
    const signature = req.headers['stripe-signature'];
    const event = constructWebhookEvent(req.body, signature);
    const stripe = getStripeClient();

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const existingEvent = await getBillingEventByStripeEventId(event.id, connection);

    if (existingEvent) {
      await connection.rollback();
      connection.release();
      connection = null;

      return res.status(200).json({
        received: true,
        duplicate: true
      });
    }

    await processStripeWebhookEvent(connection, stripe, event);
    await recordBillingEventProcessed({
      stripeEventId: event.id,
      eventType: event.type
    }, connection);

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

    if (error?.code === 'ER_DUP_ENTRY') {
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
  getBillingAccessStatus,
  createCheckoutSession,
  createCustomerPortalSession,
  handleBillingWebhook
};
