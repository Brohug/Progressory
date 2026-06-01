const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { assertCanAddCoach } = require('../services/planLimitsService');
const {
  generateRandomPassword,
  createMemberInviteTokenRecord,
  createStaffInviteTokenRecord
} = require('../services/accessInviteService');

const allowedCreateRoles = ['admin', 'coach', 'member'];
const allowedUpdateRoles = ['admin', 'coach', 'member'];
const staffInviteRoles = ['admin', 'coach'];

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
      member_id,
      can_upload_library_content
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

    if (['admin', 'coach'].includes(role)) {
      try {
        await assertCanAddCoach(gymId);
      } catch (limitError) {
        if (limitError.limitType) {
          return sendPlanLimitError(res, limitError);
        }

        throw limitError;
      }
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
    const normalizedUploadPermission = role === 'coach'
      ? can_upload_library_content === true
      : role === 'admin';

    const [result] = await pool.query(
      `INSERT INTO users
       (gym_id, first_name, last_name, email, password_hash, role, is_active, can_upload_library_content)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, ?)`,
      [
        gymId,
        first_name.trim(),
        last_name.trim(),
        normalizedEmail,
        passwordHash,
        role,
        normalizedUploadPermission
      ]
    );

    const [rows] = await pool.query(
      `SELECT u.id, u.gym_id, u.first_name, u.last_name, u.email, u.role, u.is_active, u.can_upload_library_content, u.created_at, u.updated_at,
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
      message: role === 'member'
        ? 'Member login created successfully'
        : 'Staff user created successfully',
      user: rows[0]
    });
  } catch (error) {
    console.error('Create user error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const sendPlanLimitError = (res, error) => (
  res.status(error.status || 409).json({
    message: error.message,
    limitType: error.limitType,
    currentUsage: error.currentUsage,
    planLimit: error.planLimit,
    upgradeRequired: Boolean(error.upgradeRequired),
    upgradePlan: error.upgradePlan || 'standard',
    upgradePlanLabel: error.upgradePlanLabel || 'Standard'
  })
);

const createMemberAccessInvite = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    if (!requireOwner(req, res)) return;

    const gymId = req.user.gym_id;
    const createdByUserId = req.user.id;
    const {
      member_id,
      email,
      first_name,
      last_name
    } = req.body;

    if (!member_id) {
      return res.status(400).json({
        message: 'member_id is required'
      });
    }

    const [memberRows] = await connection.query(
      `SELECT m.*, u.id AS linked_user_id, u.email AS linked_user_email
       FROM members m
       LEFT JOIN users u ON m.user_id = u.id AND u.gym_id = m.gym_id
       WHERE m.id = ? AND m.gym_id = ?`,
      [member_id, gymId]
    );

    if (memberRows.length === 0) {
      return res.status(404).json({
        message: 'Member not found for this gym'
      });
    }

    const member = memberRows[0];
    const normalizedEmail = (email || member.email || member.linked_user_email || '').trim().toLowerCase();
    const firstName = (first_name || member.first_name || '').trim();
    const lastName = (last_name || member.last_name || '').trim();

    if (!normalizedEmail) {
      return res.status(400).json({
        message: 'An email is required before sending a member access invite'
      });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({
        message: 'Member first name and last name are required before sending an invite'
      });
    }

    await connection.beginTransaction();

    let targetUserId = member.linked_user_id || null;
    let inviteType = 'activation';

    if (!targetUserId) {
      const [existingUserRows] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [normalizedEmail]
      );

      if (existingUserRows.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          message: 'A user with that email already exists'
        });
      }

      const passwordHash = await bcrypt.hash(generateRandomPassword(), 10);

      const [newUserResult] = await connection.query(
        `INSERT INTO users
         (gym_id, first_name, last_name, email, password_hash, role, is_active)
         VALUES (?, ?, ?, ?, ?, 'member', FALSE)`,
        [gymId, firstName, lastName, normalizedEmail, passwordHash]
      );

      targetUserId = newUserResult.insertId;

      await connection.query(
        `UPDATE members
         SET user_id = ?, email = ?, first_name = ?, last_name = ?
         WHERE id = ? AND gym_id = ?`,
        [targetUserId, normalizedEmail, firstName, lastName, member_id, gymId]
      );
    } else {
      inviteType = 'reset_password';

      const [duplicateUserRows] = await connection.query(
        'SELECT id FROM users WHERE email = ? AND id <> ?',
        [normalizedEmail, targetUserId]
      );

      if (duplicateUserRows.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          message: 'Another user already uses that email'
        });
      }

      await connection.query(
        `UPDATE users
         SET first_name = ?, last_name = ?, email = ?
         WHERE id = ? AND gym_id = ?`,
        [firstName, lastName, normalizedEmail, targetUserId, gymId]
      );

      await connection.query(
        `UPDATE members
         SET email = ?, first_name = ?, last_name = ?
         WHERE id = ? AND gym_id = ?`,
        [normalizedEmail, firstName, lastName, member_id, gymId]
      );
    }

    const inviteRecord = await createMemberInviteTokenRecord(connection, {
      gymId,
      userId: targetUserId,
      memberId: Number(member_id),
      createdByUserId,
      inviteType
    });

    await connection.commit();

    const [updatedMemberRows] = await pool.query(
      `SELECT m.*, p.name AS program_name,
              u.email AS login_email,
              u.role AS login_role,
              u.is_active AS login_is_active,
              u.created_at AS login_created_at
       FROM members m
       LEFT JOIN programs p ON m.program_id = p.id
       LEFT JOIN users u ON m.user_id = u.id AND u.gym_id = m.gym_id
       WHERE m.id = ? AND m.gym_id = ?`,
      [member_id, gymId]
    );

    return res.status(201).json({
      message: inviteType === 'activation'
        ? 'Member invite created successfully'
        : 'Set-password invite created successfully',
      invite: {
        type: inviteType,
        url: inviteRecord.inviteUrl,
        expires_at: inviteRecord.expiresAt
      },
      member: updatedMemberRows[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create member access invite error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
};

const createStaffAccessInvite = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    if (!requireOwner(req, res)) return;

    const gymId = req.user.gym_id;
    const createdByUserId = req.user.id;
    const {
      user_id,
      first_name,
      last_name,
      email,
      role,
      can_upload_library_content
    } = req.body;

    const normalizedRole = (role || '').trim().toLowerCase();

    if (!staffInviteRoles.includes(normalizedRole)) {
      return res.status(400).json({
        message: 'Role must be admin or coach'
      });
    }

    await connection.beginTransaction();

    let targetUserId = user_id ? Number(user_id) : null;
    let inviteType = 'activation';
    let targetUser = null;

    if (!targetUserId) {
      try {
        await assertCanAddCoach(gymId, connection);
      } catch (limitError) {
        if (limitError.limitType) {
          await connection.rollback();
          return sendPlanLimitError(res, limitError);
        }

        throw limitError;
      }
    }

    if (targetUserId) {
      const [existingRows] = await connection.query(
        `SELECT id, gym_id, first_name, last_name, email, role, is_active
         FROM users
         WHERE id = ? AND gym_id = ?`,
        [targetUserId, gymId]
      );

      if (existingRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          message: 'Staff user not found'
        });
      }

      targetUser = existingRows[0];

      if (!targetUser.is_active && ['admin', 'coach'].includes(normalizedRole)) {
        try {
          await assertCanAddCoach(gymId, connection);
        } catch (limitError) {
          if (limitError.limitType) {
            await connection.rollback();
            return sendPlanLimitError(res, limitError);
          }

          throw limitError;
        }
      }

      if (targetUser.role === 'owner') {
        await connection.rollback();
        return res.status(400).json({
          message: 'Owner accounts do not use staff setup invites'
        });
      }

      if (targetUser.role === 'member') {
        await connection.rollback();
        return res.status(400).json({
          message: 'Member accounts use member access links, not staff setup links'
        });
      }

      const updatedFirstName = (first_name || targetUser.first_name || '').trim();
      const updatedLastName = (last_name || targetUser.last_name || '').trim();
      const updatedEmail = (email || targetUser.email || '').trim().toLowerCase();

      if (!updatedFirstName || !updatedLastName) {
        await connection.rollback();
        return res.status(400).json({
          message: 'First name and last name are required'
        });
      }

      if (!updatedEmail) {
        await connection.rollback();
        return res.status(400).json({
          message: 'Email is required'
        });
      }

      const [duplicateRows] = await connection.query(
        'SELECT id FROM users WHERE email = ? AND id <> ?',
        [updatedEmail, targetUserId]
      );

      if (duplicateRows.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          message: 'Another user already uses that email'
        });
      }

      await connection.query(
        `UPDATE users
         SET first_name = ?, last_name = ?, email = ?, role = ?, can_upload_library_content = ?
         WHERE id = ? AND gym_id = ?`,
        [
          updatedFirstName,
          updatedLastName,
          updatedEmail,
          normalizedRole,
          normalizedRole === 'coach'
            ? can_upload_library_content === true
            : normalizedRole === 'admin',
          targetUserId,
          gymId
        ]
      );

      inviteType = targetUser.is_active ? 'reset_password' : 'activation';
    } else {
      const newFirstName = (first_name || '').trim();
      const newLastName = (last_name || '').trim();
      const normalizedEmail = (email || '').trim().toLowerCase();

      if (!newFirstName || !newLastName) {
        await connection.rollback();
        return res.status(400).json({
          message: 'First name and last name are required'
        });
      }

      if (!normalizedEmail) {
        await connection.rollback();
        return res.status(400).json({
          message: 'Email is required'
        });
      }

      const [existingUserRows] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [normalizedEmail]
      );

      if (existingUserRows.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          message: 'A user with that email already exists'
        });
      }

      const passwordHash = await bcrypt.hash(generateRandomPassword(), 10);

      const [newUserResult] = await connection.query(
        `INSERT INTO users
         (gym_id, first_name, last_name, email, password_hash, role, is_active, can_upload_library_content)
         VALUES (?, ?, ?, ?, ?, ?, FALSE, ?)`,
        [
          gymId,
          newFirstName,
          newLastName,
          normalizedEmail,
          passwordHash,
          normalizedRole,
          normalizedRole === 'coach'
            ? can_upload_library_content === true
            : normalizedRole === 'admin'
        ]
      );

      targetUserId = newUserResult.insertId;
      inviteType = 'activation';
    }

    const inviteRecord = await createStaffInviteTokenRecord(connection, {
      gymId,
      userId: targetUserId,
      createdByUserId,
      inviteType
    });

    await connection.commit();

    const [userRows] = await pool.query(
      `SELECT id, gym_id, first_name, last_name, email, role, is_active, can_upload_library_content, created_at, updated_at
       FROM users
       WHERE id = ? AND gym_id = ?`,
      [targetUserId, gymId]
    );

    return res.status(201).json({
      message: inviteType === 'activation'
        ? 'Staff setup link created successfully'
        : 'Staff reset-password link created successfully',
      invite: {
        type: inviteType,
        url: inviteRecord.inviteUrl,
        expires_at: inviteRecord.expiresAt
      },
      user: userRows[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create staff access invite error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
};

const getUsers = async (req, res) => {
  try {
    if (!requireOwner(req, res)) return;

    const gymId = req.user.gym_id;

    const [rows] = await pool.query(
      `SELECT id, gym_id, first_name, last_name, email, role, is_active, can_upload_library_content, created_at, updated_at
       FROM users
       WHERE gym_id = ? AND role IN ('owner', 'admin', 'coach')
       ORDER BY created_at DESC`,
      [gymId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Get users error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const getUserById = async (req, res) => {
  try {
    if (!requireOwner(req, res)) return;

    const gymId = req.user.gym_id;
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT id, gym_id, first_name, last_name, email, role, is_active, can_upload_library_content, created_at, updated_at
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
      message: 'Server error'
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
      member_id,
      can_upload_library_content
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
    const updatedCanUploadLibraryContent =
      can_upload_library_content !== undefined
        ? can_upload_library_content === true
        : Boolean(currentRecord.can_upload_library_content);
    const activatingManagedStaff = (
      ['admin', 'coach'].includes(updatedRole)
      && Boolean(updatedIsActive)
      && (
        !Boolean(currentRecord.is_active)
        || !['admin', 'coach'].includes(currentRecord.role)
      )
    );

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

    if (activatingManagedStaff) {
      try {
        await assertCanAddCoach(gymId);
      } catch (limitError) {
        if (limitError.limitType) {
          return sendPlanLimitError(res, limitError);
        }

        throw limitError;
      }
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
       SET first_name = ?, last_name = ?, email = ?, role = ?, is_active = ?, can_upload_library_content = ?
       WHERE id = ? AND gym_id = ?`,
      [
        updatedFirstName,
        updatedLastName,
        updatedEmail,
        updatedRole,
        updatedIsActive,
        updatedRole === 'coach'
          ? updatedCanUploadLibraryContent
          : updatedRole === 'admin',
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
      `SELECT u.id, u.gym_id, u.first_name, u.last_name, u.email, u.role, u.is_active, u.can_upload_library_content, u.created_at, u.updated_at,
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
      message: 'Server error'
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
      message: 'Server error'
    });
  }
};

const activateUser = async (req, res) => {
  try {
    if (!requireOwner(req, res)) return;

    const gymId = req.user.gym_id;
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

    await pool.query(
      'UPDATE users SET is_active = TRUE WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    return res.status(200).json({
      message: 'User activated successfully'
    });
  } catch (error) {
    console.error('Activate user error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

module.exports = {
  createUser,
  createMemberAccessInvite,
  createStaffAccessInvite,
  getUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser
};
