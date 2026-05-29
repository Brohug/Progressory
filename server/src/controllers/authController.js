const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const { isPlatformAdminEmail } = require('../services/platformAdminService');
const { validatePolicyAcceptance, getAcceptedPolicyVersion } = require('../services/policyService');
const { logAuditEvent } = require('../services/auditService');
const { assertCanAddCoach } = require('../services/planLimitsService');

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
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

    if (!gym_name || !first_name || !last_name || !email || !password) {
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
      [email]
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

    await connection.beginTransaction();

    const [gymResult] = await connection.query(
      'INSERT INTO gyms (name, slug) VALUES (?, ?)',
      [gym_name, slug]
    );

    const gymId = gymResult.insertId;

    const [userResult] = await connection.query(
      `INSERT INTO users (
         gym_id,
         first_name,
         last_name,
         email,
         password_hash,
         role,
         can_upload_library_content,
         terms_accepted_at,
         privacy_accepted_at,
         acceptable_use_accepted_at,
         child_safety_accepted_at,
         accepted_policy_version
       )
       VALUES (?, ?, ?, ?, ?, 'owner', TRUE, NOW(), NOW(), NOW(), NOW(), ?)`,
      [gymId, first_name, last_name, email, passwordHash, acceptedPolicyVersion]
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

    const [rows] = await connection.query(
      `SELECT u.id, u.gym_id, u.first_name, u.last_name, u.email, u.role, u.created_at, u.updated_at,
              u.can_upload_library_content,
              g.name AS gym_name, g.slug, g.is_platform_suspended, g.platform_suspended_at, g.platform_suspension_reason
       FROM users u
       JOIN gyms g ON u.gym_id = g.id
       WHERE u.id = ?`,
      [userId]
    );

    const user = rows[0];
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

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const [rows] = await pool.query(
      `SELECT u.id, u.gym_id, u.first_name, u.last_name, u.email, u.password_hash, u.role, u.is_active,
              u.created_at, u.updated_at, u.can_upload_library_content,
              m.id AS member_id,
              g.name AS gym_name, g.slug, g.is_platform_suspended, g.platform_suspended_at, g.platform_suspension_reason
       FROM users u
       JOIN gyms g ON u.gym_id = g.id
       LEFT JOIN members m ON m.user_id = u.id AND m.gym_id = u.gym_id
       WHERE u.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        message: 'This account is inactive. Finish the member setup link or contact your gym owner.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
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

    const [userRows] = await pool.query(
      `SELECT u.id, u.gym_id, u.first_name, u.last_name, u.email, u.role, u.is_active,
              u.created_at, u.updated_at, u.can_upload_library_content,
              m.id AS member_id,
              g.name AS gym_name, g.slug, g.is_platform_suspended, g.platform_suspended_at, g.platform_suspension_reason
       FROM users u
       JOIN gyms g ON u.gym_id = g.id
       LEFT JOIN members m ON m.user_id = u.id AND m.gym_id = u.gym_id
       WHERE u.id = ? AND u.gym_id = ?`,
      [invite.user_id, invite.gym_id]
    );

    const user = userRows[0];
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

    await connection.query(
      `UPDATE users
       SET password_hash = ?,
           is_active = TRUE,
           can_upload_library_content = CASE
             WHEN role IN ('owner', 'admin') THEN TRUE
             ELSE can_upload_library_content
           END,
           terms_accepted_at = CASE WHEN ? THEN NOW() ELSE terms_accepted_at END,
           privacy_accepted_at = CASE WHEN ? THEN NOW() ELSE privacy_accepted_at END,
           acceptable_use_accepted_at = CASE WHEN ? THEN NOW() ELSE acceptable_use_accepted_at END,
           child_safety_accepted_at = CASE WHEN ? THEN NOW() ELSE child_safety_accepted_at END,
           accepted_policy_version = CASE WHEN ? THEN ? ELSE accepted_policy_version END
       WHERE id = ? AND gym_id = ?`,
      [
        passwordHash,
        requiresPolicyAcceptance,
        requiresPolicyAcceptance,
        requiresPolicyAcceptance,
        requiresPolicyAcceptance,
        requiresPolicyAcceptance,
        acceptedPolicyVersion,
        invite.user_id,
        invite.gym_id
      ]
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

    const [userRows] = await pool.query(
      `SELECT u.id, u.gym_id, u.first_name, u.last_name, u.email, u.role, u.is_active,
              u.created_at, u.updated_at, u.can_upload_library_content,
              m.id AS member_id,
              g.name AS gym_name, g.slug, g.is_platform_suspended, g.platform_suspended_at, g.platform_suspension_reason
       FROM users u
       JOIN gyms g ON u.gym_id = g.id
       LEFT JOIN members m ON m.user_id = u.id AND m.gym_id = u.gym_id
       WHERE u.id = ? AND u.gym_id = ?`,
      [invite.user_id, invite.gym_id]
    );

    const user = userRows[0];
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
    const [rows] = await pool.query(
      `SELECT u.id, u.gym_id, u.first_name, u.last_name, u.email, u.role, u.is_active,
              u.created_at, u.updated_at, u.can_upload_library_content,
              m.id AS member_id,
              g.name AS gym_name, g.slug, g.is_platform_suspended, g.platform_suspended_at, g.platform_suspension_reason
       FROM users u
       JOIN gyms g ON u.gym_id = g.id
       LEFT JOIN members m ON m.user_id = u.id AND m.gym_id = u.gym_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    return res.status(200).json(attachUserRuntimeFlags(rows[0]));
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

    const [rows] = await pool.query(
      `SELECT u.id, u.gym_id, u.first_name, u.last_name, u.email, u.role, u.is_active,
              u.created_at, u.updated_at, u.can_upload_library_content,
              m.id AS member_id,
              g.name AS gym_name, g.slug, g.is_platform_suspended, g.platform_suspended_at, g.platform_suspension_reason
       FROM users u
       JOIN gyms g ON u.gym_id = g.id
       LEFT JOIN members m ON m.user_id = u.id AND m.gym_id = u.gym_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: attachUserRuntimeFlags(rows[0])
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
  getMe,
  updateProfile,
  changePassword,
  getMemberAccessInvite,
  setMemberAccessPassword,
  getStaffAccessInvite,
  setStaffAccessPassword
};
