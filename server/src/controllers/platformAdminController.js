const pool = require('../config/db');
const { sendClientError, handleServerError } = require('../middleware/errorHandler');
const { sendFounderInviteNotification } = require('../services/notificationService');
const { getSubscriptionByGymId } = require('../services/billingService');
const { reconcileGymSubscriptionFromStripeIfNeeded } = require('./billingController');
const { getBillingTrialDays } = require('../services/stripeService');
const {
  listFounderInquiries,
  getFounderInquiryDetail,
  listGymOverview,
  getPlatformAdminSummary,
  markFounderInquiryContacted,
  updateFounderInquiryNotes,
  provisionFounderInquiry,
  resendFounderInvite,
  markFounderInquiryConverted,
  suspendGym,
  reactivateGym,
  deactivateGym
} = require('../services/platformAdminService');
const { getPlatformAnalyticsSnapshot } = require('../services/analyticsService');

const parsePositiveId = (value) => {
  const parsedId = Number.parseInt(value, 10);
  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const applyLegacyTrialFallback = (gym, subscription) => {
  const billingStatus = subscription?.billing_status ?? gym?.billing_status;
  const planCode = subscription?.plan_code ?? gym?.plan_code;
  const hasTimelineDates = Boolean(subscription?.trial_ends_at || subscription?.current_period_end || gym?.trial_ends_at || gym?.current_period_end);

  if (billingStatus !== 'active' || hasTimelineDates || !['founder', 'regular'].includes(String(planCode || '').trim().toLowerCase())) {
    return null;
  }

  const fallbackStartValue = subscription?.founder_started_at
    || subscription?.current_period_start
    || subscription?.created_at
    || gym?.created_at
    || null;

  if (!fallbackStartValue) {
    return null;
  }

  const fallbackStart = new Date(fallbackStartValue);
  if (Number.isNaN(fallbackStart.getTime())) {
    return null;
  }

  const trialDays = getBillingTrialDays();
  const fallbackEnd = new Date(fallbackStart.getTime() + (trialDays * 24 * 60 * 60 * 1000));

  if (fallbackEnd.getTime() <= Date.now()) {
    return null;
  }

  return {
    billing_status: 'trialing',
    current_period_start: fallbackStart,
    current_period_end: fallbackEnd,
    trial_ends_at: fallbackEnd,
    founder_started_at: subscription?.founder_started_at || fallbackStart,
    billing_timeline_source: 'estimated',
    billing_timeline_note: 'Trial timing is estimated from the local founder billing record because Stripe period dates are missing.'
  };
};

const mergeGymWithBillingSnapshot = (gym, subscription, legacyTrialFallback = null) => ({
  ...gym,
  plan_code: subscription?.plan_code ?? gym.plan_code,
  billing_status: legacyTrialFallback?.billing_status ?? subscription?.billing_status ?? gym.billing_status,
  current_period_start: legacyTrialFallback?.current_period_start ?? subscription?.current_period_start ?? gym.current_period_start,
  current_period_end: legacyTrialFallback?.current_period_end ?? subscription?.current_period_end ?? gym.current_period_end,
  cancel_at_period_end: subscription?.cancel_at_period_end ?? gym.cancel_at_period_end,
  trial_ends_at: legacyTrialFallback?.trial_ends_at ?? subscription?.trial_ends_at ?? gym.trial_ends_at,
  founder_started_at: legacyTrialFallback?.founder_started_at ?? subscription?.founder_started_at ?? gym.founder_started_at,
  billing_timeline_source: legacyTrialFallback?.billing_timeline_source || '',
  billing_timeline_note: legacyTrialFallback?.billing_timeline_note || ''
});

const reconcileWithTimeout = async (subscription, timeoutMs = 3500) => {
  if (!subscription) {
    return null;
  }

  return Promise.race([
    reconcileGymSubscriptionFromStripeIfNeeded(subscription),
    new Promise((_, reject) => {
      setTimeout(() => {
        const timeoutError = new Error('Stripe reconciliation timed out.');
        timeoutError.code = 'STRIPE_RECONCILE_TIMEOUT';
        reject(timeoutError);
      }, timeoutMs);
    })
  ]);
};

const enrichGymOverviewWithBilling = async (gyms = []) => Promise.all(
  gyms.map(async (gym) => {
    if (!gym?.id) {
      return gym;
    }

    try {
      const subscription = await getSubscriptionByGymId(gym.id);
      const localFallback = applyLegacyTrialFallback(gym, subscription);

      try {
        const reconciledSubscription = await reconcileWithTimeout(subscription);
        const reconciledFallback = applyLegacyTrialFallback(gym, reconciledSubscription);
        return mergeGymWithBillingSnapshot(gym, reconciledSubscription, reconciledFallback);
      } catch (error) {
        console.warn('Platform admin Stripe reconciliation fallback:', {
          gymId: gym.id,
          message: error.message
        });

        return mergeGymWithBillingSnapshot(gym, subscription, localFallback);
      }
    } catch (error) {
      console.warn('Platform admin billing enrichment warning:', {
        gymId: gym.id,
        message: error.message
      });

      return gym;
    }
  })
);

const buildInviteEmailDelivery = async (result, logLabel) => {
  try {
    const delivery = await sendFounderInviteNotification({
      firstName: result.inquiry?.first_name,
      founderEmail: result.owner_email || result.inquiry?.email,
      gymName: result.inquiry?.gym_name,
      inviteUrl: result.invite_url,
      inviteExpiresAt: result.invite_expires_at
    });

    return delivery;
  } catch (error) {
    console.warn(logLabel, {
      inquiryId: result.inquiry?.id || null,
      gymName: result.inquiry?.gym_name || null,
      message: error.message,
      statusCode: error.statusCode || null
    });

    return {
      delivered: false,
      skipped: false,
      reason: 'notification_failed'
    };
  }
};

const getPlatformAdminDashboard = async (req, res) => {
  try {
    const [summary, founderRequests, gyms] = await Promise.all([
      getPlatformAdminSummary(),
      listFounderInquiries(),
      listGymOverview()
    ]);

    const enrichedGyms = await enrichGymOverviewWithBilling(gyms);

    return res.status(200).json({
      summary,
      founder_requests: founderRequests,
      gyms: enrichedGyms
    });
  } catch (error) {
    return handleServerError(res, 'Get platform admin dashboard error:', error);
  }
};

const getPlatformAnalytics = async (req, res) => {
  try {
    const snapshot = await getPlatformAnalyticsSnapshot({
      days: req.query?.days
    });

    return res.status(200).json(snapshot);
  } catch (error) {
    return handleServerError(res, 'Get platform analytics error:', error);
  }
};

const getFounderRequestDetail = async (req, res) => {
  try {
    const inquiryId = parsePositiveId(req.params.id);

    if (!inquiryId) {
      return sendClientError(res, {
        status: 400,
        message: 'Founder inquiry id is invalid.'
      });
    }

    const inquiry = await getFounderInquiryDetail(inquiryId);

    return res.status(200).json({
      inquiry
    });
  } catch (error) {
    if (/not found|not a founder/i.test(error.message || '')) {
      return sendClientError(res, {
        status: 404,
        message: error.message
      });
    }

    return handleServerError(res, 'Get founder request detail error:', error);
  }
};

const markFounderRequestContacted = async (req, res) => {
  try {
    const inquiryId = parsePositiveId(req.params.id);

    if (!inquiryId) {
      return sendClientError(res, {
        status: 400,
        message: 'Founder inquiry id is invalid.'
      });
    }

    const inquiry = await markFounderInquiryContacted(
      inquiryId,
      String(req.body?.notes || '').trim()
    );

    return res.status(200).json({
      message: 'Founder request marked as contacted.',
      inquiry
    });
  } catch (error) {
    if (/not found|not a founder/i.test(error.message || '')) {
      return sendClientError(res, {
        status: 404,
        message: error.message
      });
    }

    return handleServerError(res, 'Mark founder request contacted error:', error);
  }
};

const saveFounderRequestNotes = async (req, res) => {
  try {
    const inquiryId = parsePositiveId(req.params.id);

    if (!inquiryId) {
      return sendClientError(res, {
        status: 400,
        message: 'Founder inquiry id is invalid.'
      });
    }

    const inquiry = await updateFounderInquiryNotes(
      inquiryId,
      String(req.body?.notes || '').trim()
    );

    return res.status(200).json({
      message: 'Founder request notes updated.',
      inquiry
    });
  } catch (error) {
    if (/not found|not a founder/i.test(error.message || '')) {
      return sendClientError(res, {
        status: 404,
        message: error.message
      });
    }

    return handleServerError(res, 'Save founder request notes error:', error);
  }
};

const provisionFounderRequest = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const inquiryId = parsePositiveId(req.params.id);

    if (!inquiryId) {
      return sendClientError(res, {
        status: 400,
        message: 'Founder inquiry id is invalid.'
      });
    }

    await connection.beginTransaction();
    const result = await provisionFounderInquiry(inquiryId, req.user.id, connection);
    await connection.commit();
    const emailDelivery = await buildInviteEmailDelivery(
      result,
      'Founder provisioning invite email warning:'
    );

    return res.status(201).json({
      message: 'Founder inquiry provisioned successfully.',
      ...result,
      email_delivery: emailDelivery
    });
  } catch (error) {
    await connection.rollback();

    if (/not found|not a founder|already been provisioned|already exists/i.test(error.message || '')) {
      return sendClientError(res, {
        status: 400,
        message: error.message
      });
    }

    return handleServerError(res, 'Provision founder request error:', error);
  } finally {
    connection.release();
  }
};

const resendFounderRequestInvite = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const inquiryId = parsePositiveId(req.params.id);

    if (!inquiryId) {
      return sendClientError(res, {
        status: 400,
        message: 'Founder inquiry id is invalid.'
      });
    }

    await connection.beginTransaction();
    const result = await resendFounderInvite(inquiryId, req.user.id, connection);
    await connection.commit();
    const emailDelivery = await buildInviteEmailDelivery(
      result,
      'Founder resend invite email warning:'
    );

    return res.status(200).json({
      message: 'Founder invite resent successfully.',
      ...result,
      email_delivery: emailDelivery
    });
  } catch (error) {
    await connection.rollback();

    if (/not found|Provision this founder inquiry/i.test(error.message || '')) {
      return sendClientError(res, {
        status: 400,
        message: error.message
      });
    }

    return handleServerError(res, 'Resend founder invite error:', error);
  } finally {
    connection.release();
  }
};

const markFounderRequestConverted = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const inquiryId = parsePositiveId(req.params.id);

    if (!inquiryId) {
      return sendClientError(res, {
        status: 400,
        message: 'Founder inquiry id is invalid.'
      });
    }

    await connection.beginTransaction();
    const inquiry = await markFounderInquiryConverted(inquiryId, connection);
    await connection.commit();

    return res.status(200).json({
      message: 'Founder request marked as converted.',
      inquiry
    });
  } catch (error) {
    await connection.rollback();

    if (/not found|not a founder|Provision this founder inquiry/i.test(error.message || '')) {
      return sendClientError(res, {
        status: 400,
        message: error.message
      });
    }

    return handleServerError(res, 'Mark founder request converted error:', error);
  } finally {
    connection.release();
  }
};

const deactivatePlatformGym = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const gymId = parsePositiveId(req.params.id);

    if (!gymId) {
      return sendClientError(res, {
        status: 400,
        message: 'Gym id is invalid.'
      });
    }

    await connection.beginTransaction();
    const gym = await deactivateGym(gymId, req.user.id, connection);
    await connection.commit();

    return res.status(200).json({
      message: 'Gym deactivated successfully.',
      gym
    });
  } catch (error) {
    await connection.rollback();

    if (/Gym not found/i.test(error.message || '')) {
      return sendClientError(res, {
        status: 404,
        message: error.message
      });
    }

    return handleServerError(res, 'Deactivate gym error:', error);
  } finally {
    connection.release();
  }
};

const suspendPlatformGym = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const gymId = parsePositiveId(req.params.id);

    if (!gymId) {
      return sendClientError(res, {
        status: 400,
        message: 'Gym id is invalid.'
      });
    }

    await connection.beginTransaction();
    const gym = await suspendGym(gymId, String(req.body?.reason || '').trim(), connection);
    await connection.commit();

    return res.status(200).json({
      message: 'Gym suspended successfully.',
      gym
    });
  } catch (error) {
    await connection.rollback();

    if (/Gym not found/i.test(error.message || '')) {
      return sendClientError(res, {
        status: 404,
        message: error.message
      });
    }

    return handleServerError(res, 'Suspend gym error:', error);
  } finally {
    connection.release();
  }
};

const reactivatePlatformGym = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const gymId = parsePositiveId(req.params.id);

    if (!gymId) {
      return sendClientError(res, {
        status: 400,
        message: 'Gym id is invalid.'
      });
    }

    await connection.beginTransaction();
    const gym = await reactivateGym(gymId, connection);
    await connection.commit();

    return res.status(200).json({
      message: 'Gym reactivated successfully.',
      gym
    });
  } catch (error) {
    await connection.rollback();

    if (/Gym not found/i.test(error.message || '')) {
      return sendClientError(res, {
        status: 404,
        message: error.message
      });
    }

    return handleServerError(res, 'Reactivate gym error:', error);
  } finally {
    connection.release();
  }
};

module.exports = {
  getPlatformAdminDashboard,
  getPlatformAnalytics,
  getFounderRequestDetail,
  markFounderRequestContacted,
  saveFounderRequestNotes,
  provisionFounderRequest,
  resendFounderRequestInvite,
  markFounderRequestConverted,
  suspendPlatformGym,
  reactivatePlatformGym,
  deactivatePlatformGym
};
