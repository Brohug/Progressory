const { sendClientError, handleServerError } = require('../middleware/errorHandler');
const {
  recordProductAnalyticsEvent,
  getPlatformAnalyticsSnapshot
} = require('../services/analyticsService');
const { logAuditEvent } = require('../services/auditService');

const ALLOWED_ACTION_EVENTS = new Set([
  'DECISION_TREE_NEXT_STEP',
  'DECISION_TREE_RESET',
  'DECISION_TREE_SUCCESS',
  'DECISION_TREE_GUIDED_START',
  'QR_CHECK_IN_COMPLETED',
  'QR_ACCESS_SETUP_STARTED',
  'QR_ACCESS_SETUP_COMPLETED'
]);

const createPageViewEvent = async (req, res) => {
  try {
    const pagePath = String(req.body?.page_path || '').trim();

    if (!pagePath) {
      return sendClientError(res, {
        status: 400,
        message: 'Page path is required.'
      });
    }

    await recordProductAnalyticsEvent({
      userId: req.user?.id || null,
      gymId: req.user?.gym_id || null,
      userRole: req.user?.role || '',
      pagePath,
      eventType: 'page_view',
      metadata: {
        source: 'app'
      }
    });

    return res.status(204).send();
  } catch (error) {
    return handleServerError(res, 'Create page view analytics error:', error);
  }
};

const createPageExitEvent = async (req, res) => {
  try {
    const pagePath = String(req.body?.page_path || '').trim();

    if (!pagePath) {
      return sendClientError(res, {
        status: 400,
        message: 'Page path is required.'
      });
    }

    await recordProductAnalyticsEvent({
      userId: req.user?.id || null,
      gymId: req.user?.gym_id || null,
      userRole: req.user?.role || '',
      pagePath,
      eventType: 'page_exit',
      durationSeconds: req.body?.duration_seconds,
      metadata: {
        source: 'app'
      }
    });

    return res.status(204).send();
  } catch (error) {
    return handleServerError(res, 'Create page exit analytics error:', error);
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

const createActionEvent = async (req, res) => {
  try {
    const eventType = String(req.body?.event_type || '').trim().toUpperCase();

    if (!ALLOWED_ACTION_EVENTS.has(eventType)) {
      return sendClientError(res, {
        status: 400,
        message: 'Analytics action type is invalid.'
      });
    }

    await logAuditEvent({
      gymId: req.user?.gym_id || null,
      userId: req.user?.id || null,
      eventType,
      entityType: String(req.body?.entity_type || '').trim() || null,
      entityId: req.body?.entity_id ? Number(req.body.entity_id) : null,
      metadata: req.body?.metadata || null
    });

    return res.status(204).send();
  } catch (error) {
    return handleServerError(res, 'Create analytics action error:', error);
  }
};

module.exports = {
  createPageViewEvent,
  createPageExitEvent,
  createActionEvent,
  getPlatformAnalytics
};
