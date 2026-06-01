const pool = require('../config/db');

const VALID_EVENT_TYPES = new Set(['page_view', 'page_exit']);
const EXCLUDED_PAGE_PATHS = ['/platform-admin', '/platform-analytics'];

const sanitizePagePath = (value) => {
  const normalizedValue = String(value || '').trim();

  if (!normalizedValue) {
    return '';
  }

  return normalizedValue.startsWith('/') ? normalizedValue : `/${normalizedValue}`;
};

const sanitizeRole = (value) => {
  const normalizedValue = String(value || '').trim().toLowerCase();
  return normalizedValue || 'unknown';
};

const sanitizeEventType = (value) => {
  const normalizedValue = String(value || '').trim().toLowerCase();
  return VALID_EVENT_TYPES.has(normalizedValue) ? normalizedValue : '';
};

const sanitizeDurationSeconds = (value) => {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return null;
  }

  return Math.min(parsedValue, 60 * 60 * 8);
};

const recordProductAnalyticsEvent = async ({
  userId = null,
  gymId = null,
  userRole = '',
  pagePath = '',
  eventType = '',
  durationSeconds = null,
  metadata = null
}) => {
  const safePagePath = sanitizePagePath(pagePath);
  const safeEventType = sanitizeEventType(eventType);

  if (!safePagePath || !safeEventType) {
    return false;
  }

  const safeRole = sanitizeRole(userRole);
  const safeDurationSeconds = sanitizeDurationSeconds(durationSeconds);
  const metadataJson = metadata ? JSON.stringify(metadata) : null;

  await pool.query(
    `INSERT INTO product_analytics_events
     (user_id, gym_id, user_role, page_path, event_type, duration_seconds, metadata_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId || null, gymId || null, safeRole, safePagePath, safeEventType, safeDurationSeconds, metadataJson]
  );

  return true;
};

const normalizeAnalyticsWindowDays = (value) => {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return 14;
  }

  return Math.min(parsedValue, 90);
};

const analyticsPageFilterSql = `
  page_path NOT IN ('/platform-admin', '/platform-analytics')
`;

const getPlatformAnalyticsSnapshot = async ({ days = 14 } = {}) => {
  const windowDays = normalizeAnalyticsWindowDays(days);

  const [
    overviewRows,
    topPagesRows,
    roleRows,
    gymRows,
    actionRows,
    recentViewRows
  ] = await Promise.all([
    pool.query(
      `SELECT
         SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS total_page_views,
         COUNT(DISTINCT user_id) AS unique_users,
         COUNT(DISTINCT gym_id) AS active_gyms,
         COALESCE(SUM(CASE WHEN event_type = 'page_exit' THEN duration_seconds ELSE 0 END), 0) AS total_seconds,
         ROUND(AVG(CASE WHEN event_type = 'page_exit' THEN duration_seconds END), 1) AS avg_seconds
       FROM product_analytics_events
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         AND ${analyticsPageFilterSql}`,
      [windowDays]
    ),
    pool.query(
      `SELECT
         page_path,
         SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS views,
         COUNT(DISTINCT user_id) AS unique_users,
         COALESCE(SUM(CASE WHEN event_type = 'page_exit' THEN duration_seconds ELSE 0 END), 0) AS total_seconds,
         ROUND(AVG(CASE WHEN event_type = 'page_exit' THEN duration_seconds END), 1) AS avg_seconds
       FROM product_analytics_events
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         AND ${analyticsPageFilterSql}
       GROUP BY page_path
       ORDER BY views DESC, total_seconds DESC, page_path ASC
       LIMIT 12`,
      [windowDays]
    ),
    pool.query(
      `SELECT
         user_role,
         SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS views,
         COUNT(DISTINCT user_id) AS unique_users,
         COALESCE(SUM(CASE WHEN event_type = 'page_exit' THEN duration_seconds ELSE 0 END), 0) AS total_seconds
       FROM product_analytics_events
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         AND ${analyticsPageFilterSql}
       GROUP BY user_role
       ORDER BY views DESC, total_seconds DESC`,
      [windowDays]
    ),
    pool.query(
      `SELECT
         pae.gym_id,
         COALESCE(g.name, 'Unknown gym') AS gym_name,
         SUM(CASE WHEN pae.event_type = 'page_view' THEN 1 ELSE 0 END) AS views,
         COUNT(DISTINCT pae.user_id) AS unique_users,
         COALESCE(SUM(CASE WHEN pae.event_type = 'page_exit' THEN pae.duration_seconds ELSE 0 END), 0) AS total_seconds
       FROM product_analytics_events pae
       LEFT JOIN gyms g
         ON g.id = pae.gym_id
       WHERE pae.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         AND ${analyticsPageFilterSql.replaceAll('page_path', 'pae.page_path')}
       GROUP BY pae.gym_id, g.name
       ORDER BY views DESC, total_seconds DESC, gym_name ASC
       LIMIT 10`,
      [windowDays]
    ),
    pool.query(
      `SELECT
         event_type,
         COUNT(*) AS count,
         MAX(created_at) AS latest_at
       FROM audit_logs
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY event_type
       ORDER BY count DESC, latest_at DESC
       LIMIT 12`,
      [windowDays]
    ),
    pool.query(
      `SELECT
         pae.page_path,
         pae.user_role,
         pae.event_type,
         pae.duration_seconds,
         pae.created_at,
         COALESCE(u.email, 'Unknown user') AS user_email,
         COALESCE(g.name, 'Unknown gym') AS gym_name
       FROM product_analytics_events pae
       LEFT JOIN users u
         ON u.id = pae.user_id
       LEFT JOIN gyms g
         ON g.id = pae.gym_id
       WHERE pae.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         AND ${analyticsPageFilterSql.replaceAll('page_path', 'pae.page_path')}
         AND pae.event_type = 'page_view'
       ORDER BY pae.created_at DESC
       LIMIT 20`,
      [windowDays]
    )
  ]);

  const overview = overviewRows[0]?.[0] || {};
  const topPages = topPagesRows[0] || [];
  const byRole = roleRows[0] || [];
  const topGyms = gymRows[0] || [];
  const topActions = actionRows[0] || [];
  const recentViews = recentViewRows[0] || [];

  return {
    window_days: windowDays,
    overview: {
      total_page_views: Number(overview.total_page_views || 0),
      unique_users: Number(overview.unique_users || 0),
      active_gyms: Number(overview.active_gyms || 0),
      total_seconds: Number(overview.total_seconds || 0),
      avg_seconds: Number(overview.avg_seconds || 0)
    },
    top_pages: topPages.map((row) => ({
      page_path: row.page_path,
      views: Number(row.views || 0),
      unique_users: Number(row.unique_users || 0),
      total_seconds: Number(row.total_seconds || 0),
      avg_seconds: Number(row.avg_seconds || 0)
    })),
    by_role: byRole.map((row) => ({
      user_role: row.user_role,
      views: Number(row.views || 0),
      unique_users: Number(row.unique_users || 0),
      total_seconds: Number(row.total_seconds || 0)
    })),
    top_gyms: topGyms.map((row) => ({
      gym_id: row.gym_id,
      gym_name: row.gym_name,
      views: Number(row.views || 0),
      unique_users: Number(row.unique_users || 0),
      total_seconds: Number(row.total_seconds || 0)
    })),
    top_actions: topActions.map((row) => ({
      event_type: row.event_type,
      count: Number(row.count || 0),
      latest_at: row.latest_at || null
    })),
    recent_views: recentViews.map((row) => ({
      page_path: row.page_path,
      user_role: row.user_role,
      user_email: row.user_email,
      gym_name: row.gym_name,
      created_at: row.created_at
    }))
  };
};

module.exports = {
  EXCLUDED_PAGE_PATHS,
  recordProductAnalyticsEvent,
  getPlatformAnalyticsSnapshot
};
