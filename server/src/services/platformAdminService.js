const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { BILLING_STATUSES } = require('./billingService');

const OWNER_INVITE_EXPIRY_HOURS = 72;
const DEFAULT_PLATFORM_ADMIN_EMAIL = 'owner.progressory@gmail.com';

const getPoolOrConnection = (connection) => connection || pool;

const normalizeAdminEmail = (email) => (
  String(email || '')
    .trim()
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, '')
);

const getPlatformAdminEmails = () => {
  const configuredEmails = String(process.env.PLATFORM_ADMIN_EMAILS || '')
    .split(',')
    .map(normalizeAdminEmail)
    .filter(Boolean);
  const fallbackEmails = [
    process.env.OWNER_NOTIFICATION_EMAIL,
    DEFAULT_PLATFORM_ADMIN_EMAIL
  ]
    .map(normalizeAdminEmail)
    .filter(Boolean);

  return [...new Set([...configuredEmails, ...fallbackEmails])];
};

const isPlatformAdminEmail = (email) => {
  const normalizedEmail = normalizeAdminEmail(email);

  if (!normalizedEmail) {
    return false;
  }

  return getPlatformAdminEmails().includes(normalizedEmail);
};

const generateSlug = (name) => (
  String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
);

const buildStaffInviteUrl = (token) => {
  const configuredBaseUrl = process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:5173';
  return `${configuredBaseUrl.replace(/\/$/, '')}/?staffAccessToken=${encodeURIComponent(token)}`;
};

const generateRandomPassword = () => crypto.randomBytes(24).toString('base64url');

const createStaffInviteTokenRecord = async (connection, {
  gymId,
  userId,
  createdByUserId,
  inviteType = 'activation'
}) => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + OWNER_INVITE_EXPIRY_HOURS * 60 * 60 * 1000);

  await connection.query(
    `UPDATE staff_access_invites
     SET used_at = COALESCE(used_at, NOW())
     WHERE user_id = ? AND gym_id = ? AND used_at IS NULL`,
    [userId, gymId]
  );

  await connection.query(
    `INSERT INTO staff_access_invites
     (gym_id, user_id, created_by_user_id, invite_type, token_hash, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [gymId, userId, createdByUserId, inviteType, tokenHash, expiresAt]
  );

  return {
    inviteUrl: buildStaffInviteUrl(rawToken),
    expiresAt
  };
};

const getFounderInquiryById = async (inquiryId, connection = null) => {
  const queryable = getPoolOrConnection(connection);
  const [rows] = await queryable.query(
    `SELECT id, request_type, first_name, last_name, email, phone, gym_name, status,
            demo_slot_start, linked_gym_id, linked_owner_user_id, owner_contacted_at,
            provisioned_at, converted_at, internal_notes, created_at, updated_at
     FROM public_inquiries
     WHERE id = ?
     LIMIT 1`,
    [inquiryId]
  );

  return rows[0] || null;
};

const getFounderInviteHistory = async (inquiry, connection = null) => {
  if (!inquiry?.linked_gym_id || !inquiry?.linked_owner_user_id) {
    return [];
  }

  const queryable = getPoolOrConnection(connection);
  const [rows] = await queryable.query(
    `SELECT sai.id, sai.invite_type, sai.expires_at, sai.used_at, sai.created_at,
            sai.created_by_user_id,
            creator.email AS created_by_email,
            creator.first_name AS created_by_first_name,
            creator.last_name AS created_by_last_name
     FROM staff_access_invites sai
     LEFT JOIN users creator
       ON creator.id = sai.created_by_user_id
     WHERE sai.gym_id = ?
       AND sai.user_id = ?
     ORDER BY sai.created_at DESC`,
    [inquiry.linked_gym_id, inquiry.linked_owner_user_id]
  );

  return rows;
};

const getFounderInquiryDetail = async (inquiryId, connection = null) => {
  const inquiry = await getFounderInquiryById(inquiryId, connection);

  if (!inquiry) {
    throw new Error('Founder inquiry not found.');
  }

  if (inquiry.request_type !== 'founder') {
    throw new Error('This inquiry is not a founder access request.');
  }

  const queryable = getPoolOrConnection(connection);
  const [[detailRow]] = await queryable.query(
    `SELECT pi.id, pi.request_type, pi.first_name, pi.last_name, pi.email, pi.phone, pi.gym_name,
            pi.status, pi.demo_slot_start, pi.linked_gym_id, pi.linked_owner_user_id,
            pi.owner_contacted_at, pi.provisioned_at, pi.converted_at, pi.internal_notes,
            pi.created_at, pi.updated_at,
            g.name AS linked_gym_name,
            g.slug AS linked_gym_slug,
            g.is_platform_suspended,
            g.platform_suspended_at,
            g.platform_suspension_reason,
            owner.email AS linked_owner_email,
            owner.is_active AS linked_owner_is_active,
            gs.plan_code,
            gs.billing_status,
            gs.trial_ends_at,
            gs.current_period_end,
            gs.cancel_at_period_end
     FROM public_inquiries pi
     LEFT JOIN gyms g
       ON g.id = pi.linked_gym_id
     LEFT JOIN users owner
       ON owner.id = pi.linked_owner_user_id
     LEFT JOIN gym_subscriptions gs
       ON gs.gym_id = pi.linked_gym_id
     WHERE pi.id = ?
     LIMIT 1`,
    [inquiryId]
  );

  return {
    ...detailRow,
    invite_history: await getFounderInviteHistory(detailRow, connection)
  };
};

const updateFounderInquiryNotes = async (inquiryId, notes = '', connection = null) => {
  const queryable = getPoolOrConnection(connection);
  const inquiry = await getFounderInquiryById(inquiryId, connection);

  if (!inquiry) {
    throw new Error('Founder inquiry not found.');
  }

  if (inquiry.request_type !== 'founder') {
    throw new Error('This inquiry is not a founder access request.');
  }

  await queryable.query(
    `UPDATE public_inquiries
     SET internal_notes = ?
     WHERE id = ?`,
    [String(notes || '').trim(), inquiryId]
  );

  return getFounderInquiryById(inquiryId, connection);
};

const listFounderInquiries = async (connection = null) => {
  const queryable = getPoolOrConnection(connection);
  const [rows] = await queryable.query(
    `SELECT pi.id, pi.request_type, pi.first_name, pi.last_name, pi.email, pi.phone, pi.gym_name,
            pi.status, pi.demo_slot_start, pi.linked_gym_id, pi.linked_owner_user_id,
            pi.owner_contacted_at, pi.provisioned_at, pi.converted_at, pi.internal_notes,
            pi.created_at, pi.updated_at,
            g.slug AS linked_gym_slug,
            u.email AS linked_owner_email,
            gs.plan_code,
            gs.billing_status
     FROM public_inquiries pi
     LEFT JOIN gyms g ON g.id = pi.linked_gym_id
     LEFT JOIN users u ON u.id = pi.linked_owner_user_id
     LEFT JOIN gym_subscriptions gs ON gs.gym_id = pi.linked_gym_id
     WHERE pi.request_type = 'founder'
     ORDER BY pi.created_at DESC`
  );

  return rows;
};

const listGymOverview = async (connection = null) => {
  const queryable = getPoolOrConnection(connection);
  const [rows] = await queryable.query(
    `SELECT g.id, g.name, g.slug, g.created_at,
            g.is_platform_suspended, g.platform_suspended_at, g.platform_suspension_reason,
            owner.id AS owner_user_id,
            owner.first_name AS owner_first_name,
            owner.last_name AS owner_last_name,
            owner.email AS owner_email,
            owner.is_active AS owner_is_active,
            gs.plan_code,
            gs.billing_status,
            gs.current_period_end,
            gs.cancel_at_period_end,
            gs.trial_ends_at
     FROM gyms g
     LEFT JOIN users owner
       ON owner.gym_id = g.id
      AND owner.role = 'owner'
     LEFT JOIN gym_subscriptions gs
       ON gs.gym_id = g.id
     ORDER BY g.created_at DESC`
  );

  return rows;
};

const getPlatformAdminSummary = async (connection = null) => {
  const queryable = getPoolOrConnection(connection);
  const [[leadCounts], [gymCounts], [subscriptionCounts]] = await Promise.all([
    queryable.query(
      `SELECT
         SUM(request_type = 'founder') AS founder_requests_total,
         SUM(request_type = 'founder' AND status = 'new') AS founder_requests_new,
         SUM(request_type = 'founder' AND provisioned_at IS NOT NULL) AS founder_requests_provisioned
       FROM public_inquiries`
    ),
    queryable.query(
      `SELECT COUNT(*) AS gyms_total,
              SUM(is_platform_suspended = TRUE) AS gyms_suspended
       FROM gyms`
    ),
    queryable.query(
      `SELECT
         SUM(billing_status = 'trialing') AS gyms_trialing,
         SUM(billing_status = 'active') AS gyms_active,
         SUM(billing_status = 'past_due') AS gyms_past_due,
         SUM(billing_status = 'canceled') AS gyms_canceled
       FROM gym_subscriptions`
    )
  ]);

  return {
    founder_requests_total: Number(leadCounts[0]?.founder_requests_total || 0),
    founder_requests_new: Number(leadCounts[0]?.founder_requests_new || 0),
    founder_requests_provisioned: Number(leadCounts[0]?.founder_requests_provisioned || 0),
    gyms_total: Number(gymCounts[0]?.gyms_total || 0),
    gyms_suspended: Number(gymCounts[0]?.gyms_suspended || 0),
    gyms_trialing: Number(subscriptionCounts[0]?.gyms_trialing || 0),
    gyms_active: Number(subscriptionCounts[0]?.gyms_active || 0),
    gyms_past_due: Number(subscriptionCounts[0]?.gyms_past_due || 0),
    gyms_canceled: Number(subscriptionCounts[0]?.gyms_canceled || 0)
  };
};

const markFounderInquiryContacted = async (inquiryId, notes = '', connection = null) => {
  const queryable = getPoolOrConnection(connection);
  const inquiry = await getFounderInquiryById(inquiryId, connection);

  if (!inquiry) {
    throw new Error('Founder inquiry not found.');
  }

  if (inquiry.request_type !== 'founder') {
    throw new Error('This inquiry is not a founder access request.');
  }

  await queryable.query(
    `UPDATE public_inquiries
     SET status = CASE
       WHEN status = 'new' THEN 'contacted'
       ELSE status
     END,
         owner_contacted_at = COALESCE(owner_contacted_at, NOW()),
         internal_notes = CASE
           WHEN ? = '' THEN internal_notes
           WHEN internal_notes IS NULL OR internal_notes = '' THEN ?
           ELSE CONCAT(internal_notes, '\n', ?)
         END
     WHERE id = ?`,
    [notes, notes, notes, inquiryId]
  );

  return getFounderInquiryById(inquiryId, connection);
};

const provisionFounderInquiry = async (inquiryId, createdByUserId, connection = null) => {
  const queryable = getPoolOrConnection(connection);
  const inquiry = await getFounderInquiryById(inquiryId, connection);

  if (!inquiry) {
    throw new Error('Founder inquiry not found.');
  }

  if (inquiry.request_type !== 'founder') {
    throw new Error('This inquiry is not a founder access request.');
  }

  if (inquiry.linked_gym_id || inquiry.linked_owner_user_id || inquiry.converted_at) {
    throw new Error('This founder inquiry has already been provisioned.');
  }

  const normalizedEmail = String(inquiry.email || '').trim().toLowerCase();
  const [existingUserRows] = await queryable.query(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [normalizedEmail]
  );

  if (existingUserRows.length > 0) {
    throw new Error('A user with this founder inquiry email already exists.');
  }

  let slug = generateSlug(inquiry.gym_name);
  if (!slug) {
    slug = `gym-${Date.now()}`;
  }

  const [existingGymRows] = await queryable.query(
    'SELECT id FROM gyms WHERE slug = ? LIMIT 1',
    [slug]
  );

  if (existingGymRows.length > 0) {
    slug = `${slug}-${Date.now()}`;
  }

  const [gymResult] = await queryable.query(
    'INSERT INTO gyms (name, slug) VALUES (?, ?)',
    [inquiry.gym_name, slug]
  );
  const gymId = gymResult.insertId;

  const passwordHash = await bcrypt.hash(generateRandomPassword(), 10);
  const [ownerResult] = await queryable.query(
    `INSERT INTO users
     (gym_id, first_name, last_name, email, password_hash, role, is_active)
     VALUES (?, ?, ?, ?, ?, 'owner', FALSE)`,
    [gymId, inquiry.first_name, inquiry.last_name, normalizedEmail, passwordHash]
  );
  const ownerUserId = ownerResult.insertId;

  const inviteRecord = await createStaffInviteTokenRecord(queryable, {
    gymId,
    userId: ownerUserId,
    createdByUserId,
    inviteType: 'activation'
  });

  await queryable.query(
    `UPDATE public_inquiries
     SET status = 'provisioned',
         linked_gym_id = ?,
         linked_owner_user_id = ?,
         owner_contacted_at = COALESCE(owner_contacted_at, NOW()),
         provisioned_at = NOW()
     WHERE id = ?`,
    [gymId, ownerUserId, inquiry.id]
  );

  return {
    inquiry: await getFounderInquiryById(inquiryId, connection),
    gym_id: gymId,
    owner_user_id: ownerUserId,
    owner_email: normalizedEmail,
    invite_url: inviteRecord.inviteUrl,
    invite_expires_at: inviteRecord.expiresAt
  };
};

const resendFounderInvite = async (inquiryId, createdByUserId, connection = null) => {
  const queryable = getPoolOrConnection(connection);
  const inquiry = await getFounderInquiryById(inquiryId, connection);

  if (!inquiry) {
    throw new Error('Founder inquiry not found.');
  }

  if (!inquiry.linked_gym_id || !inquiry.linked_owner_user_id) {
    throw new Error('Provision this founder inquiry before resending the invite.');
  }

  const inviteRecord = await createStaffInviteTokenRecord(queryable, {
    gymId: inquiry.linked_gym_id,
    userId: inquiry.linked_owner_user_id,
    createdByUserId,
    inviteType: 'activation'
  });

  await queryable.query(
    `UPDATE public_inquiries
     SET owner_contacted_at = COALESCE(owner_contacted_at, NOW())
     WHERE id = ?`,
    [inquiry.id]
  );

  return {
    inquiry: await getFounderInquiryById(inquiryId, connection),
    invite_url: inviteRecord.inviteUrl,
    invite_expires_at: inviteRecord.expiresAt
  };
};

const markFounderInquiryConverted = async (inquiryId, connection = null) => {
  const queryable = getPoolOrConnection(connection);
  const inquiry = await getFounderInquiryById(inquiryId, connection);

  if (!inquiry) {
    throw new Error('Founder inquiry not found.');
  }

  if (inquiry.request_type !== 'founder') {
    throw new Error('This inquiry is not a founder access request.');
  }

  if (!inquiry.linked_gym_id || !inquiry.linked_owner_user_id) {
    throw new Error('Provision this founder inquiry before marking it converted.');
  }

  await queryable.query(
    `UPDATE public_inquiries
     SET status = 'converted',
         converted_at = COALESCE(converted_at, NOW())
     WHERE id = ?`,
    [inquiryId]
  );

  return getFounderInquiryDetail(inquiryId, connection);
};

const deactivateGym = async (gymId, actorUserId, connection = null) => {
  const queryable = getPoolOrConnection(connection);
  const [gymRows] = await queryable.query(
    'SELECT id, name, slug FROM gyms WHERE id = ? LIMIT 1',
    [gymId]
  );

  if (gymRows.length === 0) {
    throw new Error('Gym not found.');
  }

  await queryable.query(
    `UPDATE gyms
     SET is_platform_suspended = FALSE,
         platform_suspended_at = NULL,
         platform_suspension_reason = NULL
     WHERE id = ?`,
    [gymId]
  );

  await queryable.query(
    `UPDATE users
     SET is_active = FALSE
     WHERE gym_id = ?
       AND id <> ?`,
    [gymId, actorUserId]
  );

  await queryable.query(
    `UPDATE gym_subscriptions
     SET billing_status = ?,
         cancel_at_period_end = FALSE
     WHERE gym_id = ?`,
    [BILLING_STATUSES.CANCELED, gymId]
  );

  return gymRows[0];
};

const suspendGym = async (gymId, reason = '', connection = null) => {
  const queryable = getPoolOrConnection(connection);
  const [gymRows] = await queryable.query(
    'SELECT id, name, slug, is_platform_suspended FROM gyms WHERE id = ? LIMIT 1',
    [gymId]
  );

  if (gymRows.length === 0) {
    throw new Error('Gym not found.');
  }

  await queryable.query(
    `UPDATE gyms
     SET is_platform_suspended = TRUE,
         platform_suspended_at = NOW(),
         platform_suspension_reason = ?
     WHERE id = ?`,
    [String(reason || '').trim() || null, gymId]
  );

  const [updatedRows] = await queryable.query(
    `SELECT id, name, slug, is_platform_suspended, platform_suspended_at, platform_suspension_reason
     FROM gyms
     WHERE id = ?
     LIMIT 1`,
    [gymId]
  );

  return updatedRows[0];
};

const reactivateGym = async (gymId, connection = null) => {
  const queryable = getPoolOrConnection(connection);
  const [gymRows] = await queryable.query(
    'SELECT id, name, slug FROM gyms WHERE id = ? LIMIT 1',
    [gymId]
  );

  if (gymRows.length === 0) {
    throw new Error('Gym not found.');
  }

  await queryable.query(
    `UPDATE gyms
     SET is_platform_suspended = FALSE,
         platform_suspended_at = NULL,
         platform_suspension_reason = NULL
     WHERE id = ?`,
    [gymId]
  );

  const [updatedRows] = await queryable.query(
    `SELECT id, name, slug, is_platform_suspended, platform_suspended_at, platform_suspension_reason
     FROM gyms
     WHERE id = ?
     LIMIT 1`,
    [gymId]
  );

  return updatedRows[0];
};

module.exports = {
  getPlatformAdminEmails,
  isPlatformAdminEmail,
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
};
