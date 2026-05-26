const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const pool = require('../src/config/db');

const inquiryId = Number.parseInt(process.argv[2] || '', 10);

if (!Number.isInteger(inquiryId) || inquiryId <= 0) {
  console.error('Usage: node scripts/provisionFounderInquiry.js <public_inquiry_id>');
  process.exit(1);
}

const OWNER_INVITE_EXPIRY_HOURS = 72;

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

const run = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [inquiryRows] = await connection.query(
      `SELECT id, request_type, first_name, last_name, email, phone, gym_name, status,
              linked_gym_id, linked_owner_user_id, converted_at
       FROM public_inquiries
       WHERE id = ?
       LIMIT 1`,
      [inquiryId]
    );

    if (inquiryRows.length === 0) {
      throw new Error('Founder inquiry not found.');
    }

    const inquiry = inquiryRows[0];

    if (inquiry.request_type !== 'founder') {
      throw new Error('This inquiry is not a founder access request.');
    }

    if (inquiry.linked_gym_id || inquiry.linked_owner_user_id || inquiry.converted_at) {
      throw new Error('This founder inquiry has already been provisioned.');
    }

    const normalizedEmail = String(inquiry.email || '').trim().toLowerCase();
    const [existingUserRows] = await connection.query(
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

    const [existingGymRows] = await connection.query(
      'SELECT id FROM gyms WHERE slug = ? LIMIT 1',
      [slug]
    );

    if (existingGymRows.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const [gymResult] = await connection.query(
      'INSERT INTO gyms (name, slug) VALUES (?, ?)',
      [inquiry.gym_name, slug]
    );
    const gymId = gymResult.insertId;

    const passwordHash = await bcrypt.hash(generateRandomPassword(), 10);
    const [ownerResult] = await connection.query(
      `INSERT INTO users
       (gym_id, first_name, last_name, email, password_hash, role, is_active)
       VALUES (?, ?, ?, ?, ?, 'owner', FALSE)`,
      [gymId, inquiry.first_name, inquiry.last_name, normalizedEmail, passwordHash]
    );
    const ownerUserId = ownerResult.insertId;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + OWNER_INVITE_EXPIRY_HOURS * 60 * 60 * 1000);

    await connection.query(
      `INSERT INTO staff_access_invites
       (gym_id, user_id, created_by_user_id, invite_type, token_hash, expires_at)
       VALUES (?, ?, ?, 'activation', ?, ?)`,
      [gymId, ownerUserId, ownerUserId, tokenHash, expiresAt]
    );

    await connection.query(
      `UPDATE public_inquiries
       SET status = 'provisioned',
           linked_gym_id = ?,
           linked_owner_user_id = ?,
           provisioned_at = NOW(),
           internal_notes = COALESCE(internal_notes, '')
       WHERE id = ?`,
      [gymId, ownerUserId, inquiry.id]
    );

    await connection.commit();

    console.log(JSON.stringify({
      inquiry_id: inquiry.id,
      status: 'provisioned',
      gym_id: gymId,
      owner_user_id: ownerUserId,
      owner_email: normalizedEmail,
      invite_url: buildStaffInviteUrl(rawToken),
      invite_expires_at: expiresAt.toISOString(),
      next_steps: [
        'Send the invite URL to the founder so they can set their password.',
        'Once they log in, have them go to Billing and start founder checkout.',
        'After Stripe trial checkout succeeds, help them onboard their first workflow.'
      ]
    }, null, 2));
  } finally {
    connection.release();
  }
};

run()
  .catch(async (error) => {
    console.error('Failed to provision founder inquiry:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState
    });
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
