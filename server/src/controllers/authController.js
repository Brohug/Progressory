const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');

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

const register = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { gym_name, first_name, last_name, email, password } = req.body;

    if (!gym_name || !first_name || !last_name || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required'
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
      `INSERT INTO users (gym_id, first_name, last_name, email, password_hash, role)
       VALUES (?, ?, ?, ?, ?, 'owner')`,
      [gymId, first_name, last_name, email, passwordHash]
    );

    const userId = userResult.insertId;

    await connection.commit();

    const [rows] = await connection.query(
      `SELECT u.id, u.gym_id, u.first_name, u.last_name, u.email, u.role, g.name AS gym_name, g.slug
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
      user
    });
  } catch (error) {
    await connection.rollback();
    console.error('Register error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
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
              m.id AS member_id,
              g.name AS gym_name, g.slug
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
      user: {
        id: user.id,
        gym_id: user.gym_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        member_id: user.member_id || null,
        gym_name: user.gym_name,
        slug: user.slug
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
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
      message: 'Server error',
      error: error.message
    });
  }
};

const setMemberAccessPassword = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { token } = req.params;
    const { password } = req.body;

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
              m.id AS member_id,
              g.name AS gym_name, g.slug
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
      user
    });
  } catch (error) {
    await connection.rollback();
    console.error('Set member access password error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
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
      message: 'Server error',
      error: error.message
    });
  }
};

const setStaffAccessPassword = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { token } = req.params;
    const { password } = req.body;

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

    const passwordHash = await bcrypt.hash(password, 10);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await connection.beginTransaction();

    await connection.query(
      `UPDATE users
       SET password_hash = ?, is_active = TRUE
       WHERE id = ? AND gym_id = ?`,
      [passwordHash, invite.user_id, invite.gym_id]
    );

    await connection.query(
      `UPDATE staff_access_invites
       SET used_at = NOW()
       WHERE token_hash = ? AND gym_id = ?`,
      [tokenHash, invite.gym_id]
    );

    await connection.commit();

    const [userRows] = await pool.query(
      `SELECT u.id, u.gym_id, u.first_name, u.last_name, u.email, u.role, u.is_active,
              m.id AS member_id,
              g.name AS gym_name, g.slug
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
      user: {
        id: user.id,
        gym_id: user.gym_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        member_id: user.member_id || null,
        gym_name: user.gym_name,
        slug: user.slug
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Set staff access password error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.gym_id, u.first_name, u.last_name, u.email, u.role, u.is_active,
              m.id AS member_id,
              g.name AS gym_name, g.slug
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

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Get me error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
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
      'UPDATE users SET password_hash = ? WHERE id = ? AND gym_id = ?',
      [passwordHash, user.id, user.gym_id]
    );

    return res.status(200).json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  getMemberAccessInvite,
  setMemberAccessPassword,
  getStaffAccessInvite,
  setStaffAccessPassword
};
