const pool = require('../config/db');
const { sendClientError, handleServerError } = require('../middleware/errorHandler');
const {
  listFounderInquiries,
  listGymOverview,
  getPlatformAdminSummary,
  markFounderInquiryContacted,
  updateFounderInquiryNotes,
  provisionFounderInquiry,
  resendFounderInvite,
  suspendGym,
  reactivateGym,
  deactivateGym
} = require('../services/platformAdminService');

const getPlatformAdminDashboard = async (req, res) => {
  try {
    const [summary, founderRequests, gyms] = await Promise.all([
      getPlatformAdminSummary(),
      listFounderInquiries(),
      listGymOverview()
    ]);

    return res.status(200).json({
      summary,
      founder_requests: founderRequests,
      gyms
    });
  } catch (error) {
    return handleServerError(res, 'Get platform admin dashboard error:', error);
  }
};

const markFounderRequestContacted = async (req, res) => {
  try {
    const inquiryId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(inquiryId) || inquiryId <= 0) {
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
    const inquiryId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(inquiryId) || inquiryId <= 0) {
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
    const inquiryId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(inquiryId) || inquiryId <= 0) {
      return sendClientError(res, {
        status: 400,
        message: 'Founder inquiry id is invalid.'
      });
    }

    await connection.beginTransaction();
    const result = await provisionFounderInquiry(inquiryId, req.user.id, connection);
    await connection.commit();

    return res.status(201).json({
      message: 'Founder inquiry provisioned successfully.',
      ...result
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
    const inquiryId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(inquiryId) || inquiryId <= 0) {
      return sendClientError(res, {
        status: 400,
        message: 'Founder inquiry id is invalid.'
      });
    }

    await connection.beginTransaction();
    const result = await resendFounderInvite(inquiryId, req.user.id, connection);
    await connection.commit();

    return res.status(200).json({
      message: 'Founder invite resent successfully.',
      ...result
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

const deactivatePlatformGym = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const gymId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(gymId) || gymId <= 0) {
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
    const gymId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(gymId) || gymId <= 0) {
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
    const gymId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(gymId) || gymId <= 0) {
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
  markFounderRequestContacted,
  saveFounderRequestNotes,
  provisionFounderRequest,
  resendFounderRequestInvite,
  suspendPlatformGym,
  reactivatePlatformGym,
  deactivatePlatformGym
};
