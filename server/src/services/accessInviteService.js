const crypto = require('crypto');

const MEMBER_INVITE_EXPIRY_HOURS = 72;
const STAFF_INVITE_EXPIRY_HOURS = 72;

const buildClientBaseUrl = () => (
  (process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '')
);

const buildMemberInviteUrl = (token) => (
  `${buildClientBaseUrl()}/?memberAccessToken=${encodeURIComponent(token)}`
);

const buildStaffInviteUrl = (token) => (
  `${buildClientBaseUrl()}/?staffAccessToken=${encodeURIComponent(token)}`
);

const generateRandomPassword = () => crypto.randomBytes(24).toString('base64url');

const createMemberInviteTokenRecord = async (connection, {
  gymId,
  userId,
  memberId,
  createdByUserId,
  inviteType
}) => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + MEMBER_INVITE_EXPIRY_HOURS * 60 * 60 * 1000);

  await connection.query(
    `UPDATE member_access_invites
     SET used_at = COALESCE(used_at, NOW())
     WHERE user_id = ? AND gym_id = ? AND used_at IS NULL`,
    [userId, gymId]
  );

  await connection.query(
    `INSERT INTO member_access_invites
     (gym_id, user_id, member_id, created_by_user_id, invite_type, token_hash, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [gymId, userId, memberId, createdByUserId, inviteType, tokenHash, expiresAt]
  );

  return {
    rawToken,
    inviteUrl: buildMemberInviteUrl(rawToken),
    expiresAt
  };
};

const createStaffInviteTokenRecord = async (connection, {
  gymId,
  userId,
  createdByUserId,
  inviteType
}) => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + STAFF_INVITE_EXPIRY_HOURS * 60 * 60 * 1000);

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
    rawToken,
    inviteUrl: buildStaffInviteUrl(rawToken),
    expiresAt
  };
};

module.exports = {
  buildMemberInviteUrl,
  buildStaffInviteUrl,
  generateRandomPassword,
  createMemberInviteTokenRecord,
  createStaffInviteTokenRecord
};
