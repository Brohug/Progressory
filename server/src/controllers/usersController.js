const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const allowedCreateRoles = ['admin', 'coach', 'member'];
const allowedUpdateRoles = ['admin', 'coach', 'member'];

const requireOwner = (req, res) => {
  if (req.user.role !== 'owner') {
    res.status(403).json({
      message: 'Only the owner can manage staff accounts'
    });
    return false;
  }

  return true;
};

const createUser = async (req, res) => {
  try {
    if (!requireOwner(req, res)) return;

    const gymId = req.user.gym_id;
    const {
      first_name,
      last_name,
      email,
      password,
      role,
      member_id
    } = req.body;

    if (!first_name || !first_name.trim() || !last_name || !last_name.trim()) {
      return res.status(400).json({
        message: 'First name and last name are required'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: 'Email is required'
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: 'Password is required and must be at least 8 characters'
      });
    }

    if (!role || !allowedCreateRoles.includes(role)) {
      return res.status(400).json({
        message: 'Role must be admin, coach, or member'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existingRows] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (existingRows.length > 0) {
      return res.status(400).json({
        message: 'A user with that email already exists'
      });
    }

    let linkedMemberId = null;

    if (role === 'member') {
      if (!member_id) {
        return res.status(400).json({
          message: 'member_id is required when creating a member account'
        });
      }

      const [memberRows] = await pool.query(
        'SELECT id, user_id FROM members WHERE id = ? AND gym_id = ?',
        [member_id, gymId]
      );

      if (memberRows.length === 0) {
        return res.status(400).json({
          message: 'Member not found for this gym'
        });
      }

      if (memberRows[0].user_id) {
        return res.status(400).json({
          message: 'That member already has a linked login account'
        });
      }

      linkedMemberId = Number(memberRows[0].id);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users
       (gym_id, first_name, last_name, email, password_hash, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [
        gymId,
        first_name.trim(),
        last_name.trim(),
        normalizedEmail,
        passwordHash,
        role
      ]
    );

    const [rows] = await pool.query(
      `SELECT u.id, u.gym_id, u.first_name, u.last_name, u.email, u.role, u.is_active, u.created_at, u.updated_at,
              m.id AS member_id
       FROM users u
       LEFT JOIN members m ON m.user_id = u.id AND m.gym_id = u.gym_id
       WHERE id = ? AND gym_id = ?`,
      [result.insertId, gymId]
    );

    if (linkedMemberId) {
      await pool.query(
        'UPDATE members SET user_id = ? WHERE id = ? AND gym_id = ?',
        [result.insertId, linkedMemberId, gymId]
      );
      rows[0].member_id = linkedMemberId;
    }

    return res.status(201).json({
      message: 'Staff user created successfully',
      user: rows[0]
    });
  } catch (error) {
    console.error('Create user error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getUsers = async (req, res) => {
  try {
    if (!requireOwner(req, res)) return;

    const gymId = req.user.gym_id;

    const [rows] = await pool.query(
      `SELECT id, gym_id, first_name, last_name, email, role, is_active, created_at, updated_at
       FROM users
       WHERE gym_id = ?
       ORDER BY created_at DESC`,
      [gymId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Get users error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getUserById = async (req, res) => {
  try {
    if (!requireOwner(req, res)) return;

    const gymId = req.user.gym_id;
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT id, gym_id, first_name, last_name, email, role, is_active, created_at, updated_at
       FROM users
       WHERE id = ? AND gym_id = ?`,
      [id, gymId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Get user by ID error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const updateUser = async (req, res) => {
  try {
    if (!requireOwner(req, res)) return;

    const gymId = req.user.gym_id;
    const currentUserId = req.user.id;
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      role,
      is_active,
      password,
      member_id
    } = req.body;

    const [existingRows] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const currentRecord = existingRows[0];

    if (Number(id) === Number(currentUserId) && is_active === false) {
      return res.status(400).json({
        message: 'You cannot deactivate your own owner account'
      });
    }

    const updatedFirstName =
      first_name !== undefined ? first_name.trim() : currentRecord.first_name;
    const updatedLastName =
      last_name !== undefined ? last_name.trim() : currentRecord.last_name;
    const updatedEmail =
      email !== undefined ? email.trim().toLowerCase() : currentRecord.email;
    const updatedRole =
      role !== undefined ? role : currentRecord.role;
    const updatedIsActive =
      is_active !== undefined ? is_active : currentRecord.is_active;

    if (!updatedFirstName || !updatedLastName) {
      return res.status(400).json({
        message: 'First name and last name cannot be empty'
      });
    }

    if (!updatedEmail) {
      return res.status(400).json({
        message: 'Email cannot be empty'
      });
    }

    if (!allowedUpdateRoles.includes(updatedRole) && updatedRole !== 'owner') {
      return res.status(400).json({
        message: 'Invalid role'
      });
    }

    let linkedMemberId = null;

    if (updatedRole === 'member') {
      const requestedMemberId = member_id !== undefined ? member_id : null;

      if (!requestedMemberId) {
        return res.status(400).json({
          message: 'member_id is required when the role is member'
        });
      }

      const [memberRows] = await pool.query(
        'SELECT id, user_id FROM members WHERE id = ? AND gym_id = ?',
        [requestedMemberId, gymId]
      );

      if (memberRows.length === 0) {
        return res.status(400).json({
          message: 'Member not found for this gym'
        });
      }

      if (memberRows[0].user_id && Number(memberRows[0].user_id) !== Number(id)) {
        return res.status(400).json({
          message: 'That member already has a linked login account'
        });
      }

      linkedMemberId = Number(memberRows[0].id);
    }

    if (currentRecord.role !== 'owner' && updatedRole === 'owner') {
      return res.status(400).json({
        message: 'Promoting a user to owner is not allowed from the app'
      });
    }

    if (currentRecord.role === 'owner' && updatedRole !== 'owner') {
      return res.status(400).json({
        message: 'Changing the owner role is not allowed from the app'
      });
    }

    const [duplicateRows] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id <> ?',
      [updatedEmail, id]
    );

    if (duplicateRows.length > 0) {
      return res.status(400).json({
        message: 'Another user already uses that email'
      });
    }

    await pool.query(
      `UPDATE users
       SET first_name = ?, last_name = ?, email = ?, role = ?, is_active = ?
       WHERE id = ? AND gym_id = ?`,
      [
        updatedFirstName,
        updatedLastName,
        updatedEmail,
        updatedRole,
        updatedIsActive,
        id,
        gymId
      ]
    );

    if (password !== undefined && password !== null && password !== '') {
      if (password.length < 8) {
        return res.status(400).json({
          message: 'Password must be at least 8 characters'
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      await pool.query(
        'UPDATE users SET password_hash = ? WHERE id = ? AND gym_id = ?',
        [passwordHash, id, gymId]
      );
    }

    const [updatedRows] = await pool.query(
      `SELECT u.id, u.gym_id, u.first_name, u.last_name, u.email, u.role, u.is_active, u.created_at, u.updated_at,
              m.id AS member_id
       FROM users u
       LEFT JOIN members m ON m.user_id = u.id AND m.gym_id = u.gym_id
       WHERE id = ? AND gym_id = ?`,
      [id, gymId]
    );

    if (updatedRole === 'member') {
      await pool.query(
        'UPDATE members SET user_id = NULL WHERE user_id = ? AND gym_id = ? AND id <> ?',
        [id, gymId, linkedMemberId]
      );
      await pool.query(
        'UPDATE members SET user_id = ? WHERE id = ? AND gym_id = ?',
        [id, linkedMemberId, gymId]
      );
      updatedRows[0].member_id = linkedMemberId;
    } else {
      await pool.query(
        'UPDATE members SET user_id = NULL WHERE user_id = ? AND gym_id = ?',
        [id, gymId]
      );
      updatedRows[0].member_id = null;
    }

    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedRows[0]
    });
  } catch (error) {
    console.error('Update user error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const deactivateUser = async (req, res) => {
  try {
    if (!requireOwner(req, res)) return;

    const gymId = req.user.gym_id;
    const currentUserId = req.user.id;
    const { id } = req.params;

    const [existingRows] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const targetUser = existingRows[0];

    if (Number(targetUser.id) === Number(currentUserId)) {
      return res.status(400).json({
        message: 'You cannot deactivate your own owner account'
      });
    }

    if (targetUser.role === 'owner') {
      return res.status(400).json({
        message: 'The owner account cannot be deactivated here'
      });
    }

    await pool.query(
      'UPDATE users SET is_active = FALSE WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    return res.status(200).json({
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deactivateUser
};
