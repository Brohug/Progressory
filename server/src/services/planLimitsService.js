const pool = require('../config/db');
const { PLAN_CODES, BILLING_STATUSES } = require('./billingService');

const PLAN_DISPLAY_NAMES = Object.freeze({
  [PLAN_CODES.FOUNDER]: 'Founder Plan',
  [PLAN_CODES.REGULAR]: 'Standard Plan',
  [PLAN_CODES.NONE]: 'No plan'
});

const WARNING_THRESHOLD_RATIO = 0.8;

const getPoolOrConnection = (connection) => connection || pool;

const normalizeLimitNumber = (value) => {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isInteger(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
};

const normalizeMaxFounderGyms = () => {
  const parsedValue = Number.parseInt(process.env.MAX_FOUNDER_GYMS || '10', 10);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : 10;
};

const getDefaultPlanLimits = (planCode) => {
  if (planCode === PLAN_CODES.FOUNDER) {
    return {
      plan_code: PLAN_CODES.FOUNDER,
      display_name: 'Founder Plan',
      max_coaches: 5,
      max_active_members: 200,
      max_library_items: 100,
      max_external_video_links: 100,
      max_direct_video_uploads: 0,
      max_storage_mb: 0
    };
  }

  if (planCode === PLAN_CODES.REGULAR) {
    return {
      plan_code: PLAN_CODES.REGULAR,
      display_name: 'Standard Plan',
      max_coaches: 5,
      max_active_members: 200,
      max_library_items: 250,
      max_external_video_links: 250,
      max_direct_video_uploads: 0,
      max_storage_mb: 0
    };
  }

  return {
    plan_code: PLAN_CODES.NONE,
    display_name: 'No plan',
    max_coaches: 0,
    max_active_members: 0,
    max_library_items: 0,
    max_external_video_links: 0,
    max_direct_video_uploads: 0,
    max_storage_mb: 0
  };
};

const getOrganizationPlan = async (gymId, connection = null) => {
  const queryable = getPoolOrConnection(connection);
  const [rows] = await queryable.query(
    `SELECT gym_id, plan_code, billing_status, founder_locked_rate, founder_started_at,
            current_period_start, current_period_end, trial_ends_at
     FROM gym_subscriptions
     WHERE gym_id = ?
     LIMIT 1`,
    [gymId]
  );

  if (rows.length === 0) {
    return {
      gym_id: gymId,
      plan_code: PLAN_CODES.NONE,
      billing_status: BILLING_STATUSES.NONE,
      founder_locked_rate: false,
      founder_started_at: null,
      current_period_start: null,
      current_period_end: null,
      trial_ends_at: null
    };
  }

  const row = rows[0];
  return {
    ...row,
    founder_locked_rate: Boolean(row.founder_locked_rate)
  };
};

const getPlanLimits = async (planCode, connection = null) => {
  if (!planCode || planCode === PLAN_CODES.NONE || planCode === PLAN_CODES.DEMO) {
    return getDefaultPlanLimits(PLAN_CODES.NONE);
  }

  const queryable = getPoolOrConnection(connection);
  const [rows] = await queryable.query(
    `SELECT plan_code, display_name, max_coaches, max_active_members, max_library_items,
            max_external_video_links, max_direct_video_uploads, max_storage_mb
     FROM plan_limits
     WHERE plan_code = ?
     LIMIT 1`,
    [planCode]
  );

  if (rows.length === 0) {
    return getDefaultPlanLimits(planCode);
  }

  return rows[0];
};

const getCurrentUsage = async (gymId, connection = null) => {
  const queryable = getPoolOrConnection(connection);

  const [[coachUsage]] = await queryable.query(
    `SELECT COUNT(*) AS coaches_count
     FROM users
     WHERE gym_id = ?
       AND is_active = TRUE
       AND role IN ('admin', 'coach')`,
    [gymId]
  );

  const [[memberUsage]] = await queryable.query(
    `SELECT COUNT(*) AS active_members_count
     FROM members
     WHERE gym_id = ?
       AND is_active = TRUE`,
    [gymId]
  );

  const [[libraryUsage]] = await queryable.query(
    `SELECT
        COUNT(*) AS library_items_count,
        SUM(CASE WHEN video_url IS NOT NULL AND TRIM(video_url) <> '' THEN 1 ELSE 0 END) AS external_video_links_count,
        SUM(CASE WHEN mime_type LIKE 'video/%' AND original_filename IS NOT NULL THEN 1 ELSE 0 END) AS direct_video_uploads_count,
        ROUND(COALESCE(SUM(file_size), 0) / 1048576, 2) AS storage_mb_used
     FROM library_entries
     WHERE gym_id = ?
       AND content_status <> 'deleted'`,
    [gymId]
  );

  return {
    coaches_count: Number(coachUsage?.coaches_count || 0),
    active_members_count: Number(memberUsage?.active_members_count || 0),
    library_items_count: Number(libraryUsage?.library_items_count || 0),
    external_video_links_count: Number(libraryUsage?.external_video_links_count || 0),
    direct_video_uploads_count: Number(libraryUsage?.direct_video_uploads_count || 0),
    storage_mb_used: Number(libraryUsage?.storage_mb_used || 0)
  };
};

const limitMap = Object.freeze({
  coaches: {
    usageKey: 'coaches_count',
    limitKey: 'max_coaches',
    messageLabel: 'coaches'
  },
  active_members: {
    usageKey: 'active_members_count',
    limitKey: 'max_active_members',
    messageLabel: 'active members'
  },
  library_items: {
    usageKey: 'library_items_count',
    limitKey: 'max_library_items',
    messageLabel: 'library items'
  },
  external_video_links: {
    usageKey: 'external_video_links_count',
    limitKey: 'max_external_video_links',
    messageLabel: 'external video links'
  },
  direct_video_uploads: {
    usageKey: 'direct_video_uploads_count',
    limitKey: 'max_direct_video_uploads',
    messageLabel: 'direct video uploads'
  },
  storage_mb: {
    usageKey: 'storage_mb_used',
    limitKey: 'max_storage_mb',
    messageLabel: 'storage'
  }
});

const buildLimitError = ({ planCode, limitType, currentUsage, planLimit }) => ({
  status: 409,
  message: `${PLAN_DISPLAY_NAMES[planCode] || 'Plan'} limit reached.`,
  limitType,
  currentUsage,
  planLimit,
  upgradeRequired: true,
  upgradePlan: 'standard',
  upgradePlanLabel: 'Standard'
});

const buildLimitWarning = ({ planCode, limitType, currentUsage, planLimit }) => ({
  message: `You are nearing your ${PLAN_DISPLAY_NAMES[planCode] || 'plan'} ${limitType.replace(/_/g, ' ')} limit.`,
  limitType,
  currentUsage,
  planLimit,
  upgradeRequired: planCode === PLAN_CODES.FOUNDER,
  upgradePlan: 'standard',
  upgradePlanLabel: 'Standard'
});

const checkLimit = async (gymId, limitType, { incrementBy = 0, connection = null } = {}) => {
  const limitDefinition = limitMap[limitType];

  if (!limitDefinition) {
    throw new Error(`Unknown limit type: ${limitType}`);
  }

  const plan = await getOrganizationPlan(gymId, connection);
  const limits = await getPlanLimits(plan.plan_code, connection);
  const usage = await getCurrentUsage(gymId, connection);
  const currentUsage = Number(usage[limitDefinition.usageKey] || 0);
  const planLimit = Number(limits[limitDefinition.limitKey] || 0);
  const projectedUsage = currentUsage + incrementBy;

  if (plan.plan_code === PLAN_CODES.NONE || planLimit <= 0) {
    return {
      allowed: false,
      plan,
      limits,
      usage,
      error: buildLimitError({
        planCode: plan.plan_code || PLAN_CODES.NONE,
        limitType,
        currentUsage,
        planLimit
      }),
      warning: null
    };
  }

  const warningThreshold = Math.floor(planLimit * WARNING_THRESHOLD_RATIO);
  const warning = projectedUsage >= warningThreshold
    ? buildLimitWarning({
        planCode: plan.plan_code,
        limitType,
        currentUsage: projectedUsage,
        planLimit
      })
    : null;

  if (projectedUsage > planLimit) {
    return {
      allowed: false,
      plan,
      limits,
      usage,
      error: buildLimitError({
        planCode: plan.plan_code,
        limitType,
        currentUsage,
        planLimit
      }),
      warning
    };
  }

  return {
    allowed: true,
    plan,
    limits,
    usage,
    error: null,
    warning
  };
};

const assertLimitAllowed = async (gymId, limitType, options = {}) => {
  const result = await checkLimit(gymId, limitType, options);

  if (!result.allowed) {
    const error = new Error(result.error.message);
    Object.assign(error, result.error);
    throw error;
  }

  return result;
};

const assertCanAddCoach = async (gymId, connection = null) => (
  assertLimitAllowed(gymId, 'coaches', { incrementBy: 1, connection })
);

const assertCanAddMember = async (gymId, connection = null) => (
  assertLimitAllowed(gymId, 'active_members', { incrementBy: 1, connection })
);

const assertCanAddLibraryItem = async (gymId, connection = null) => (
  assertLimitAllowed(gymId, 'library_items', { incrementBy: 1, connection })
);

const assertCanAddExternalVideoLink = async (gymId, connection = null) => (
  assertLimitAllowed(gymId, 'external_video_links', { incrementBy: 1, connection })
);

const assertCanUploadFile = async (gymId, fileSizeMb = 0, connection = null) => {
  const uploadsResult = await assertLimitAllowed(gymId, 'direct_video_uploads', { incrementBy: 1, connection });
  const storageResult = await assertLimitAllowed(gymId, 'storage_mb', {
    incrementBy: normalizeLimitNumber(fileSizeMb),
    connection
  });

  return {
    uploadsResult,
    storageResult
  };
};

const getUsageWarnings = async (gymId, connection = null) => {
  const plan = await getOrganizationPlan(gymId, connection);
  const limits = await getPlanLimits(plan.plan_code, connection);
  const usage = await getCurrentUsage(gymId, connection);
  const warnings = [];

  Object.entries(limitMap).forEach(([limitType, definition]) => {
    const currentUsage = Number(usage[definition.usageKey] || 0);
    const planLimit = Number(limits[definition.limitKey] || 0);

    if (planLimit > 0 && currentUsage >= Math.floor(planLimit * WARNING_THRESHOLD_RATIO)) {
      warnings.push(buildLimitWarning({
        planCode: plan.plan_code,
        limitType,
        currentUsage,
        planLimit
      }));
    }
  });

  return {
    plan,
    limits,
    usage,
    warnings
  };
};

const countFounderGyms = async (connection = null) => {
  const queryable = getPoolOrConnection(connection);
  const [rows] = await queryable.query(
    `SELECT COUNT(*) AS founder_gym_count
     FROM gym_subscriptions
     WHERE plan_code = ?
       AND billing_status IN ('trialing', 'active', 'past_due')`,
    [PLAN_CODES.FOUNDER]
  );

  return Number(rows[0]?.founder_gym_count || 0);
};

const checkFounderAvailability = async (connection = null) => {
  const currentFounderGyms = await countFounderGyms(connection);
  const maxFounderGyms = normalizeMaxFounderGyms();

  return {
    currentFounderGyms,
    maxFounderGyms,
    founderPlanAvailable: currentFounderGyms < maxFounderGyms
  };
};

module.exports = {
  PLAN_DISPLAY_NAMES,
  getOrganizationPlan,
  getPlanLimits,
  getCurrentUsage,
  getUsageWarnings,
  checkLimit,
  assertCanAddCoach,
  assertCanAddMember,
  assertCanAddLibraryItem,
  assertCanAddExternalVideoLink,
  assertCanUploadFile,
  checkFounderAvailability,
  normalizeMaxFounderGyms
};
