const pool = require('../config/db');
const { sendClientError, handleServerError } = require('../middleware/errorHandler');
const { sendFounderInviteNotification } = require('../services/notificationService');
const { getSubscriptionByGymId } = require('../services/billingService');
const { reconcileGymSubscriptionFromStripeIfNeeded } = require('./billingController');
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

const parsePositiveId = (value) => {
  const parsedId = Number.parseInt(value, 10);
  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const enrichGymOverviewWithBilling = async (gyms = []) => Promise.all(
  gyms.map(async (gym) => {
    if (!gym?.id) {
      return gym;
    }

    try {
      const subscription = await getSubscriptionByGymId(gym.id);
      const reconciledSubscription = await reconcileGymSubscriptionFromStripeIfNeeded(subscription);

      return {
        ...gym,
        plan_code: reconciledSubscription?.plan_code ?? gym.plan_code,
        billing_status: reconciledSubscription?.billing_status ?? gym.billing_status,
        current_period_end: reconciledSubscription?.current_period_end ?? gym.current_period_end,
        cancel_at_period_end: reconciledSubscription?.cancel_at_period_end ?? gym.cancel_at_period_end,
        trial_ends_at: reconciledSubscription?.trial_ends_at ?? gym.trial_ends_at
      };
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
