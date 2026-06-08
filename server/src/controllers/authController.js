const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const { isPlatformAdminEmail } = require('../services/platformAdminService');
const { validatePolicyAcceptance, getAcceptedPolicyVersion } = require('../services/policyService');
const { logAuditEvent } = require('../services/auditService');
const { assertCanAddCoach } = require('../services/planLimitsService');
const { getAuthSchemaSupport, getAuthUserByWhere, buildAuthUserSelectSql } = require('../services/authSchemaService');
const { applyPlatformAdminShowcaseContext } = require('../services/showcaseAccessService');
const { sendPasswordResetNotification } = require('../services/notificationService');

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
};

const normalizeEmailInput = (value) => (
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, '')
);

const maskEmailForLog = (email) => {
  const normalizedEmail = normalizeEmailInput(email);
  const [localPart, domain] = normalizedEmail.split('@');

  if (!localPart || !domain) {
    return normalizedEmail ? '[invalid-email-format]' : '';
  }

  const localMask = localPart.length <= 4
    ? `${localPart.slice(0, 1)}***`
    : `${localPart.slice(0, 2)}***${localPart.slice(-2)}`;

  return `${localMask}@${domain}`;
};

const stripInvisibleCharacters = (value) => (
  String(value || '').replace(/[\u200B-\u200D\uFEFF]/g, '')
);

const normalizePasswordForRetry = (value) => stripInvisibleCharacters(value).trim();
const normalizePasswordCompatibility = (value) => String(value || '').normalize('NFKC');
const getEnvValue = (...names) => {
  for (const name of names) {
    if (process.env[name]) {
      return process.env[name];
    }
  }

  return '';
};
const getPlatformAdminDirectLoginEmail = () => normalizeEmailInput(
  getEnvValue(
    'PLATFORM_ADMIN_DIRECT_LOGIN_EMAIL',
    'platform_admin_direct_login_email',
    'PLATFORM_ADMIN_DIRECT_EMAIL',
    'platform_admin_direct_email'
  )
  || 'owner.progressory@gmail.com'
);

const isDirectPlatformAdminLoginEmail = (email) => {
  const normalizedEmail = normalizeEmailInput(email);

  return Boolean(normalizedEmail) && (
    normalizedEmail === 'owner.progressory@gmail.com'
    || normalizedEmail === getPlatformAdminDirectLoginEmail()
    || isPlatformAdminEmail(normalizedEmail)
  );
};

const getPasswordCandidates = (value) => {
  const rawPassword = String(value || '');
  const candidates = [
    rawPassword,
    normalizePasswordForRetry(rawPassword),
    normalizePasswordCompatibility(rawPassword),
    normalizePasswordCompatibility(normalizePasswordForRetry(rawPassword)),
    stripInvisibleCharacters(rawPassword)
  ].filter(Boolean);

  return [...new Set(candidates)];
};

const comparePasswordCandidates = async (password, passwordHash) => {
  if (!passwordHash) {
    return false;
  }

  for (const candidate of getPasswordCandidates(password)) {
    if (await bcrypt.compare(candidate, passwordHash)) {
      return true;
    }
  }

  return false;
};

const compareDirectPlatformAdminPassword = async (password) => {
  const directPasswordHash = getEnvValue(
    'PLATFORM_ADMIN_DIRECT_PASSWORD_HASH',
    'platform_admin_direct_password_hash'
  );
  const directPassword = getEnvValue(
    'PLATFORM_ADMIN_DIRECT_PASSWORD',
    'platform_admin_direct_password'
  );

  if (directPasswordHash && await comparePasswordCandidates(password, directPasswordHash)) {
    return true;
  }

  if (!directPassword) {
    return false;
  }

  const submittedCandidates = getPasswordCandidates(password);
  const envPasswordCandidates = getPasswordCandidates(directPassword);

  return submittedCandidates.some((candidate) => envPasswordCandidates.includes(candidate));
};

const hasDirectPlatformAdminPasswordConfigured = () => Boolean(getEnvValue(
  'PLATFORM_ADMIN_DIRECT_PASSWORD',
  'platform_admin_direct_password',
  'PLATFORM_ADMIN_DIRECT_PASSWORD_HASH',
  'platform_admin_direct_password_hash'
));

const getDirectPlatformAdminRows = async (schemaSupport, loginEmail) => {
  const [directLoginRows] = await pool.query(
    buildAuthUserSelectSql(
      schemaSupport,
      `WHERE u.role IN ('owner', 'admin')
         AND g.slug IN ('progressory-hq', 'progressory-demo-academy')
       ORDER BY CASE
         WHEN g.slug = 'progressory-hq' THEN 0
         ELSE 1
       END,
       CASE
         WHEN u.role = 'owner' THEN 0
         ELSE 1
       END,
       u.id ASC
       LIMIT 1`,
      { includePasswordHash: true }
    )
  );

  return directLoginRows.map((row) => ({
    ...row,
    email: loginEmail
  }));
};

const buildClientBaseUrl = () => (
  (process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '')
);

const buildPasswordResetUrl = (token) => (
  `${buildClientBaseUrl()}/reset-password/${encodeURIComponent(token)}`
);

const ensurePasswordResetTokensTable = async (queryable = pool) => {
  await queryable.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      gym_id INT NOT NULL,
      token_hash CHAR(64) NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      used_at DATETIME NULL,
      requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      request_ip VARCHAR(64) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_password_reset_user_active (user_id, used_at, expires_at),
      INDEX idx_password_reset_hash (token_hash),
      CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_password_reset_gym
        FOREIGN KEY (gym_id) REFERENCES gyms(id)
        ON DELETE CASCADE
    )
  `);
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      gym_id: user.gym_id,
      email: user.email,
      role: user.role,
      member_id: user.member_id || null
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};

const attachUserRuntimeFlags = (user) => ({
  ...user,
  is_platform_admin: isPlatformAdminEmail(user?.email),
  is_showcase_mode: Boolean(user?.is_showcase_mode),
  actual_gym_id: user?.actual_gym_id || user?.gym_id,
  actual_gym_name: user?.actual_gym_name || user?.gym_name,
  can_upload_library_content: Boolean(user?.can_upload_library_content),
  gym_is_platform_suspended: Boolean(user?.is_platform_suspended),
  gym_platform_suspended_at: user?.platform_suspended_at || null,
  gym_platform_suspension_reason: user?.platform_suspension_reason || ''
});

const register = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      gym_name,
      first_name,
      last_name,
      email,
      password,
      policyAgreementAccepted,
      founderUseAcknowledged
    } = req.body;
    const normalizedEmail = normalizeEmailInput(email);

    if (!gym_name || !first_name || !last_name || !normalizedEmail || !password) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    if (!validatePolicyAcceptance(policyAgreementAccepted) || !validatePolicyAcceptance(founderUseAcknowledged)) {
      return res.status(400).json({
        message: 'You must accept the Progressory policies and confirm the allowed platform use.'
      });
    }

    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        message: 'Email is already in use'
      });
    }

    let slug = generateSlug(gym_name);

    const [existingGyms] = await connection.query(
      'SELECT id FROM gyms WHERE slug = ?',
      [slug]
    );

    if (existingGyms.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const acceptedPolicyVersion = getAcceptedPolicyVersion();
    const schemaSupport = await getAuthSchemaSupport(connection);

    await connection.beginTransaction();

    const [gymResult] = await connection.query(
      'INSERT INTO gyms (name, slug) VALUES (?, ?)',
      [gym_name, slug]
    );

    const gymId = gymResult.insertId;

    const userColumns = [
      'gym_id',
      'first_name',
      'last_name',
      'email',
      'password_hash',
      'role'
    ];
    const userValues = [gymId, first_name, last_name, email, passwordHash, 'owner'];
    userValues[3] = normalizedEmail;
    const userPlaceholders = ['?', '?', '?', '?', '?', '?'];

    if (schemaSupport.users.has('can_upload_library_content')) {
      userColumns.push('can_upload_library_content');
      userValues.push(true);
      userPlaceholders.push('?');
    }

    [
      'terms_accepted_at',
      'privacy_accepted_at',
      'acceptable_use_accepted_at',
      'child_safety_accepted_at'
    ].forEach((columnName) => {
      if (schemaSupport.users.has(columnName)) {
        userColumns.push(columnName);
        userPlaceholders.push('NOW()');
      }
    });

    if (schemaSupport.users.has('accepted_policy_version')) {
      userColumns.push('accepted_policy_version');
      userValues.push(acceptedPolicyVersion);
      userPlaceholders.push('?');
    }

    const [userResult] = await connection.query(
      `INSERT INTO users (${userColumns.join(', ')})
       VALUES (${userPlaceholders.join(', ')})`,
      userValues
    );

    const userId = userResult.insertId;

    await logAuditEvent({
      gymId,
      userId,
      eventType: 'POLICY_ACCEPTED',
      entityType: 'user',
      entityId: userId,
      metadata: {
        accepted_policy_version: acceptedPolicyVersion,
        source: 'register'
      },
      connection
    });

    await connection.commit();

    const user = await getAuthUserByWhere(
      connection,
      'WHERE u.id = ?',
      [userId]
    );
    const token = generateToken(user);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: attachUserRuntimeFlags(user)
    });
  } catch (error) {
    await connection.rollback();
    console.error('Register error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmailInput(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const schemaSupport = await getAuthSchemaSupport(pool);
    let matchingRows = [];
    let directPlatformAdminAuthenticated = false;
    const directPasswordConfigured = hasDirectPlatformAdminPasswordConfigured();
    const directEmailCandidate = isDirectPlatformAdminLoginEmail(normalizedEmail);
    const directGmailCandidate = normalizedEmail.endsWith('@gmail.com');
    const directPasswordMatches = directPasswordConfigured
      ? await compareDirectPlatformAdminPassword(password)
      : false;

    if (directEmailCandidate || directPasswordMatches) {
      console.error('Login fallback: direct platform admin branch reached', {
        maskedEmail: maskEmailForLog(normalizedEmail),
        directEmailCandidate,
        directGmailCandidate,
        directPasswordConfigured,
        directPasswordMatches
      });

      if (directPasswordMatches && (directEmailCandidate || directGmailCandidate)) {
        matchingRows = await getDirectPlatformAdminRows(schemaSupport, normalizedEmail);

        if (matchingRows.length > 0) {
          console.error('Login fallback: direct platform admin login mapped to app owner record');
          directPlatformAdminAuthenticated = true;
        } else {
          console.error('Login fallback: direct platform admin password matched but no app owner record was found');
        }
      } else {
        console.error('Login fallback: direct platform admin password did not match or is not configured', {
          maskedEmail: maskEmailForLog(normalizedEmail),
          directEmailCandidate,
          directGmailCandidate,
          directPasswordConfigured
        });
      }
    }

    if (matchingRows.length === 0) {
      const [rows] = await pool.query(
        buildAuthUserSelectSql(schemaSupport, `
          WHERE LOWER(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(TRIM(u.email), ' ', ''),
                  '\t',
                  ''
                ),
                '\r',
                ''
              ),
              '\n',
              ''
            )
          ) = ?
        `, { includePasswordHash: true }),
        [normalizedEmail]
      );

      matchingRows = rows;
    }

    if (matchingRows.length === 0 && normalizedEmail.includes('@')) {
      const emailDomain = normalizedEmail.split('@').pop();
      const [domainRows] = await pool.query(
        buildAuthUserSelectSql(schemaSupport, 'WHERE LOWER(u.email) LIKE ?', { includePasswordHash: true }),
        [`%@${emailDomain}`]
      );

      matchingRows = domainRows.filter((row) => normalizeEmailInput(row.email) === normalizedEmail);
    }

    if (matchingRows.length === 0 && isPlatformAdminEmail(normalizedEmail)) {
      const [platformAdminAliasRows] = await pool.query(
        buildAuthUserSelectSql(
          schemaSupport,
          "WHERE g.slug = 'progressory-hq' AND u.role = 'owner' ORDER BY u.id ASC LIMIT 1",
          { includePasswordHash: true }
        )
      );

      if (platformAdminAliasRows.length > 0) {
        console.warn('Login fallback: platform admin email mapped to Progressory HQ owner record');
        matchingRows = platformAdminAliasRows.map((row) => ({
          ...row,
          email: normalizedEmail
        }));
      }
    }

    if (matchingRows.length === 0) {
      console.warn('Login failed: no user match', {
        maskedEmail: maskEmailForLog(normalizedEmail),
        emailLength: normalizedEmail.length,
        emailDomain: normalizedEmail.includes('@') ? normalizedEmail.split('@').pop() : '',
        directEmailCandidate,
        directGmailCandidate,
        directPasswordConfigured
      });

      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const user = matchingRows[0];

    if (!user.is_active) {
      return res.status(403).json({
        message: 'This account is inactive. Finish the member setup link or contact your gym owner.'
      });
    }

    let isMatch = directPlatformAdminAuthenticated
      ? true
      : await comparePasswordCandidates(password, user.password_hash);

    if (!isMatch) {
      console.warn('Login failed: password mismatch', {
        userId: user.id,
        gymId: user.gym_id,
        role: user.role,
        passwordLength: String(password || '').length,
        normalizedPasswordLength: normalizePasswordForRetry(password).length
      });

      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user);
    const runtimeUser = await applyPlatformAdminShowcaseContext(
      {
        id: user.id,
        gym_id: user.gym_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        member_id: user.member_id || null,
        can_upload_library_content: user.can_upload_library_content,
        created_at: user.created_at,
        updated_at: user.updated_at,
        gym_name: user.gym_name,
        slug: user.slug,
        is_platform_suspended: user.is_platform_suspended,
        platform_suspended_at: user.platform_suspended_at,
        platform_suspension_reason: user.platform_suspension_reason
      },
      isPlatformAdminEmail(user.email),
      pool
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: attachUserRuntimeFlags(runtimeUser)
    });
  } catch (error) {
    console.error('Login error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const findInviteByRawToken = async (rawToken) => {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const [rows] = await pool.query(
    `SELECT mai.id, mai.gym_id, mai.user_id, mai.member_id, mai.invite_type, mai.expires_at, mai.used_at,
            u.first_name, u.last_name, u.email, u.role, u.is_active,
            m.first_name AS member_first_name, m.last_name AS member_last_name,
            g.name AS gym_name, g.slug
     FROM member_access_invites mai
     JOIN users u ON mai.user_id = u.id AND mai.gym_id = u.gym_id
     JOIN members m ON mai.member_id = m.id AND m.gym_id = mai.gym_id
     JOIN gyms g ON mai.gym_id = g.id
     WHERE mai.token_hash = ?`,
    [tokenHash]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
};

const findStaffInviteByRawToken = async (rawToken) => {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const [rows] = await pool.query(
    `SELECT sai.id, sai.gym_id, sai.user_id, sai.invite_type, sai.expires_at, sai.used_at,
            u.first_name, u.last_name, u.email, u.role, u.is_active,
            g.name AS gym_name, g.slug
     FROM staff_access_invites sai
     JOIN users u ON sai.user_id = u.id AND sai.gym_id = u.gym_id
     JOIN gyms g ON sai.gym_id = g.id
     WHERE sai.token_hash = ?`,
    [tokenHash]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
};

const findPasswordResetByRawToken = async (rawToken) => {
  await ensurePasswordResetTokensTable();

  const tokenHash = crypto.createHash('sha256').update(String(rawToken || '')).digest('hex');

  const [rows] = await pool.query(
    `SELECT prt.id, prt.user_id, prt.gym_id, prt.expires_at, prt.used_at,
            u.first_name, u.last_name, u.email, u.role, u.is_active,
            g.name AS gym_name
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id AND prt.gym_id = u.gym_id
       JOIN gyms g ON prt.gym_id = g.id
      WHERE prt.token_hash = ?`,
    [tokenHash]
  );

  return rows[0] || null;
};

const requestPasswordReset = async (req, res) => {
  const connection = await pool.getConnection();
  const genericResponse = {
    message: 'If that email is registered with Progressory, a password reset link has been sent.'
  };

  try {
    const normalizedEmail = normalizeEmailInput(req.body?.email);

    if (!normalizedEmail) {
      return res.status(400).json({
        message: 'Email is required'
      });
    }

    const schemaSupport = await getAuthSchemaSupport(connection);
    const [rows] = await connection.query(
      buildAuthUserSelectSql(schemaSupport, `WHERE LOWER(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(TRIM(u.email), ' ', ''),
              '\t',
              ''
            ),
            '\r',
            ''
          ),
          '\n',
          ''
        )
      ) = ?`, { includePasswordHash: false }),
      [normalizedEmail]
    );
    const user = rows.find((row) => normalizeEmailInput(row.email) === normalizedEmail);

    if (!user || !user.is_active) {
      return res.status(200).json(genericResponse);
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const resetUrl = buildPasswordResetUrl(rawToken);

    await ensurePasswordResetTokensTable(connection);
    await connection.beginTransaction();

    await connection.query(
      `UPDATE password_reset_tokens
          SET used_at = COALESCE(used_at, NOW())
        WHERE user_id = ?
          AND gym_id = ?
          AND used_at IS NULL`,
      [user.id, user.gym_id]
    );

    await connection.query(
      `INSERT INTO password_reset_tokens
       (user_id, gym_id, token_hash, expires_at, request_ip)
       VALUES (?, ?, ?, ?, ?)`,
      [
        user.id,
        user.gym_id,
        tokenHash,
        expiresAt,
        req.ip || null
      ]
    );

    await connection.commit();

    try {
      await sendPasswordResetNotification({
        firstName: user.first_name,
        email: user.email,
        gymName: user.gym_name,
        resetUrl,
        resetExpiresAt: expiresAt
      });
    } catch (notificationError) {
      console.warn('Password reset notification warning:', {
        message: notificationError.message,
        statusCode: notificationError.statusCode || null
      });
    }

    return res.status(200).json({
      ...genericResponse,
      reset_link: process.env.NODE_ENV === 'production' ? undefined : resetUrl
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // Ignore rollback errors when the transaction was not opened.
    }

    console.error('Request password reset error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
};

const getPasswordReset = async (req, res) => {
  try {
    const { token } = req.params;
    const reset = await findPasswordResetByRawToken(token);

    if (!reset) {
      return res.status(404).json({
        message: 'Reset link not found'
      });
    }

    if (reset.used_at) {
      return res.status(410).json({
        message: 'This reset link has already been used'
      });
    }

    if (new Date(reset.expires_at).getTime() < Date.now()) {
      return res.status(410).json({
        message: 'This reset link has expired'
      });
    }

    if (!reset.is_active) {
      return res.status(403).json({
        message: 'This account is inactive. Ask your gym owner for a new setup link.'
      });
    }

    return res.status(200).json({
      reset: {
        email: reset.email,
        first_name: reset.first_name,
        last_name: reset.last_name,
        role: reset.role,
        gym_name: reset.gym_name,
        expires_at: reset.expires_at
      }
    });
  } catch (error) {
    console.error('Get password reset error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const setPasswordReset = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        message: 'New password and confirmation are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: 'Passwords do not match'
      });
    }

    const reset = await findPasswordResetByRawToken(token);

    if (!reset) {
      return res.status(404).json({
        message: 'Reset link not found'
      });
    }

    if (reset.used_at) {
      return res.status(410).json({
        message: 'This reset link has already been used'
      });
    }

    if (new Date(reset.expires_at).getTime() < Date.now()) {
      return res.status(410).json({
        message: 'This reset link has expired'
      });
    }

    if (!reset.is_active) {
      return res.status(403).json({
        message: 'This account is inactive. Ask your gym owner for a new setup link.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await connection.beginTransaction();

    await connection.query(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ? AND gym_id = ?',
      [passwordHash, reset.user_id, reset.gym_id]
    );

    await connection.query(
      `UPDATE password_reset_tokens
          SET used_at = NOW()
        WHERE token_hash = ?
          AND user_id = ?
          AND gym_id = ?`,
      [tokenHash, reset.user_id, reset.gym_id]
    );

    await logAuditEvent({
      gymId: reset.gym_id,
      userId: reset.user_id,
      eventType: 'PASSWORD_RESET_COMPLETED',
      entityType: 'user',
      entityId: reset.user_id,
      metadata: {
        source: 'forgot_password'
      },
      connection
    });

    await connection.commit();

    const user = await getAuthUserByWhere(
      pool,
      'WHERE u.id = ? AND u.gym_id = ?',
      [reset.user_id, reset.gym_id]
    );
    const authToken = generateToken(user);

    return res.status(200).json({
      message: 'Password reset successfully',
      token: authToken,
      user: attachUserRuntimeFlags(user)
    });
  } catch (error) {
    await connection.rollback();
    console.error('Set password reset error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
};

const getMemberAccessInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const invite = await findInviteByRawToken(token);

    if (!invite) {
      return res.status(404).json({
        message: 'Invite not found'
      });
    }

    if (invite.used_at) {
      return res.status(410).json({
        message: 'This link has already been used'
      });
    }

    if (new Date(invite.expires_at).getTime() < Date.now()) {
      return res.status(410).json({
        message: 'This link has expired'
      });
    }

    return res.status(200).json({
      invite: {
        user_id: invite.user_id,
        member_id: invite.member_id,
        type: invite.invite_type,
        email: invite.email,
        first_name: invite.member_first_name || invite.first_name,
        last_name: invite.member_last_name || invite.last_name,
        gym_name: invite.gym_name,
        expires_at: invite.expires_at
      }
    });
  } catch (error) {
    console.error('Get member access invite error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const setMemberAccessPassword = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { token } = req.params;
    const {
      password,
      policyAgreementAccepted,
      founderUseAcknowledged
    } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters'
      });
    }

    const invite = await findInviteByRawToken(token);

    if (!invite) {
      return res.status(404).json({
        message: 'Invite not found'
      });
    }

    if (invite.used_at) {
      return res.status(410).json({
        message: 'This link has already been used'
      });
    }

    if (new Date(invite.expires_at).getTime() < Date.now()) {
      return res.status(410).json({
        message: 'This link has expired'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const acceptedPolicyVersion = getAcceptedPolicyVersion();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await connection.beginTransaction();

    await connection.query(
      `UPDATE users
       SET password_hash = ?, is_active = TRUE
       WHERE id = ? AND gym_id = ?`,
      [passwordHash, invite.user_id, invite.gym_id]
    );

    await connection.query(
      `UPDATE member_access_invites
       SET used_at = NOW()
       WHERE token_hash = ? AND gym_id = ?`,
      [tokenHash, invite.gym_id]
    );

    await connection.commit();

    const user = await getAuthUserByWhere(
      pool,
      'WHERE u.id = ? AND u.gym_id = ?',
      [invite.user_id, invite.gym_id]
    );
    const authToken = generateToken(user);

    return res.status(200).json({
      message: 'Password set successfully',
      token: authToken,
      user: attachUserRuntimeFlags(user)
    });
  } catch (error) {
    await connection.rollback();
    console.error('Set member access password error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
};

const getStaffAccessInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const invite = await findStaffInviteByRawToken(token);

    if (!invite) {
      return res.status(404).json({
        message: 'Invite not found'
      });
    }

    if (invite.used_at) {
      return res.status(410).json({
        message: 'This link has already been used'
      });
    }

    if (new Date(invite.expires_at).getTime() < Date.now()) {
      return res.status(410).json({
        message: 'This link has expired'
      });
    }

    return res.status(200).json({
      invite: {
        user_id: invite.user_id,
        type: invite.invite_type,
        email: invite.email,
        first_name: invite.first_name,
        last_name: invite.last_name,
        role: invite.role,
        gym_name: invite.gym_name,
        expires_at: invite.expires_at
      }
    });
  } catch (error) {
    console.error('Get staff access invite error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const setStaffAccessPassword = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { token } = req.params;
    const {
      password,
      policyAgreementAccepted,
      founderUseAcknowledged
    } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters'
      });
    }

    const invite = await findStaffInviteByRawToken(token);

    if (!invite) {
      return res.status(404).json({
        message: 'Invite not found'
      });
    }

    if (invite.used_at) {
      return res.status(410).json({
        message: 'This link has already been used'
      });
    }

    if (new Date(invite.expires_at).getTime() < Date.now()) {
      return res.status(410).json({
        message: 'This link has expired'
      });
    }

    const requiresPolicyAcceptance = invite.role === 'owner' || invite.role === 'admin';

    if (
      requiresPolicyAcceptance
      && (!validatePolicyAcceptance(policyAgreementAccepted) || !validatePolicyAcceptance(founderUseAcknowledged))
    ) {
      return res.status(400).json({
        message: 'You must accept the Progressory policies before finishing staff access.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const acceptedPolicyVersion = getAcceptedPolicyVersion();

    await connection.beginTransaction();

    if (invite.role === 'admin' || invite.role === 'coach') {
      const [userRowsForLimit] = await connection.query(
        'SELECT is_active, role FROM users WHERE id = ? AND gym_id = ? LIMIT 1',
        [invite.user_id, invite.gym_id]
      );

      const invitedUser = userRowsForLimit[0];

      if (invitedUser && !invitedUser.is_active) {
        try {
          await assertCanAddCoach(invite.gym_id, connection);
        } catch (limitError) {
          if (limitError.limitType) {
            await connection.rollback();
            return res.status(limitError.status || 409).json({
              message: limitError.message,
              limitType: limitError.limitType,
              currentUsage: limitError.currentUsage,
              planLimit: limitError.planLimit,
              upgradeRequired: Boolean(limitError.upgradeRequired),
              upgradePlan: limitError.upgradePlan || 'standard',
              upgradePlanLabel: limitError.upgradePlanLabel || 'Standard'
            });
          }

          throw limitError;
        }
      }
    }

    const schemaSupport = await getAuthSchemaSupport(connection);
    const updateFragments = [
      'password_hash = ?',
      'is_active = TRUE'
    ];
    const updateValues = [passwordHash];

    if (schemaSupport.users.has('can_upload_library_content')) {
      updateFragments.push(
        `can_upload_library_content = CASE
           WHEN role IN ('owner', 'admin') THEN TRUE
           ELSE can_upload_library_content
         END`
      );
    }

    if (schemaSupport.users.has('terms_accepted_at')) {
      updateFragments.push('terms_accepted_at = CASE WHEN ? THEN NOW() ELSE terms_accepted_at END');
      updateValues.push(requiresPolicyAcceptance);
    }

    if (schemaSupport.users.has('privacy_accepted_at')) {
      updateFragments.push('privacy_accepted_at = CASE WHEN ? THEN NOW() ELSE privacy_accepted_at END');
      updateValues.push(requiresPolicyAcceptance);
    }

    if (schemaSupport.users.has('acceptable_use_accepted_at')) {
      updateFragments.push('acceptable_use_accepted_at = CASE WHEN ? THEN NOW() ELSE acceptable_use_accepted_at END');
      updateValues.push(requiresPolicyAcceptance);
    }

    if (schemaSupport.users.has('child_safety_accepted_at')) {
      updateFragments.push('child_safety_accepted_at = CASE WHEN ? THEN NOW() ELSE child_safety_accepted_at END');
      updateValues.push(requiresPolicyAcceptance);
    }

    if (schemaSupport.users.has('accepted_policy_version')) {
      updateFragments.push('accepted_policy_version = CASE WHEN ? THEN ? ELSE accepted_policy_version END');
      updateValues.push(requiresPolicyAcceptance, acceptedPolicyVersion);
    }

    updateValues.push(invite.user_id, invite.gym_id);

    await connection.query(
      `UPDATE users
       SET ${updateFragments.join(',\n           ')}
       WHERE id = ? AND gym_id = ?`,
      updateValues
    );

    await connection.query(
      `UPDATE staff_access_invites
       SET used_at = NOW()
       WHERE token_hash = ? AND gym_id = ?`,
      [tokenHash, invite.gym_id]
    );

    if (requiresPolicyAcceptance) {
      await logAuditEvent({
        gymId: invite.gym_id,
        userId: invite.user_id,
        eventType: 'POLICY_ACCEPTED',
        entityType: 'user',
        entityId: invite.user_id,
        metadata: {
          accepted_policy_version: acceptedPolicyVersion,
          source: 'staff_access'
        },
        connection
      });
    }

    await connection.commit();

    const user = await getAuthUserByWhere(
      pool,
      'WHERE u.id = ? AND u.gym_id = ?',
      [invite.user_id, invite.gym_id]
    );
    const authToken = generateToken(user);

    return res.status(200).json({
      message: 'Password set successfully',
      token: authToken,
      user: attachUserRuntimeFlags({
        id: user.id,
        gym_id: user.gym_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        member_id: user.member_id || null,
        can_upload_library_content: user.can_upload_library_content,
        created_at: user.created_at,
        updated_at: user.updated_at,
        gym_name: user.gym_name,
        slug: user.slug,
        is_platform_suspended: user.is_platform_suspended,
        platform_suspended_at: user.platform_suspended_at,
        platform_suspension_reason: user.platform_suspension_reason
      })
    });
  } catch (error) {
    await connection.rollback();
    console.error('Set staff access password error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
};

const getMe = async (req, res) => {
  try {
    const user = await getAuthUserByWhere(
      pool,
      'WHERE u.id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const runtimeUser = await applyPlatformAdminShowcaseContext(
      user,
      isPlatformAdminEmail(user.email),
      pool
    );

    return res.status(200).json(attachUserRuntimeFlags(runtimeUser));
  } catch (error) {
    console.error('Get me error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const firstName = req.body.first_name?.trim();
    const lastName = req.body.last_name?.trim();
    const email = req.body.email?.trim().toLowerCase();

    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        message: 'First name, last name, and email are required'
      });
    }

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id <> ?',
      [email, req.user.id]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        message: 'That email is already in use'
      });
    }

    await pool.query(
      `UPDATE users
       SET first_name = ?, last_name = ?, email = ?, updated_at = NOW()
       WHERE id = ? AND gym_id = ?`,
      [firstName, lastName, email, req.user.id, req.user.gym_id]
    );

    const user = await getAuthUserByWhere(
      pool,
      'WHERE u.id = ?',
      [req.user.id]
    );

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: attachUserRuntimeFlags(user)
    });
  } catch (error) {
    console.error('Update profile error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: 'Current password, new password, and confirmation are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: 'New password must be at least 8 characters'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'New password confirmation does not match'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: 'Choose a different password than the current one'
      });
    }

    const [rows] = await pool.query(
      'SELECT id, gym_id, password_hash FROM users WHERE id = ? AND gym_id = ?',
      [req.user.id, req.user.gym_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Account not found'
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Current password is incorrect'
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ? AND gym_id = ?',
      [passwordHash, user.id, user.gym_id]
    );

    return res.status(200).json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

module.exports = {
  register,
  login,
  requestPasswordReset,
  getPasswordReset,
  setPasswordReset,
  getMe,
  updateProfile,
  changePassword,
  getMemberAccessInvite,
  setMemberAccessPassword,
  getStaffAccessInvite,
  setStaffAccessPassword
};
