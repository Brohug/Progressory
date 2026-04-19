const pool = require('../config/db');

const addMemberToClass = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;
    const { member_id, attendance_status } = req.body;

    if (!member_id) {
      return res.status(400).json({
        message: 'member_id is required'
      });
    }

    const finalAttendanceStatus = attendance_status || 'present';
    const validStatuses = ['present', 'absent', 'excused'];

    if (!validStatuses.includes(finalAttendanceStatus)) {
      return res.status(400).json({
        message: 'Invalid attendance_status'
      });
    }

    const [classRows] = await pool.query(
      'SELECT id FROM classes WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (classRows.length === 0) {
      return res.status(404).json({
        message: 'Class not found'
      });
    }

    const [memberRows] = await pool.query(
      'SELECT id FROM members WHERE id = ? AND gym_id = ?',
      [member_id, gymId]
    );

    if (memberRows.length === 0) {
      return res.status(400).json({
        message: 'Member not found for this gym'
      });
    }

    const [existingRows] = await pool.query(
      'SELECT id FROM class_members WHERE class_id = ? AND member_id = ?',
      [id, member_id]
    );

    if (existingRows.length > 0) {
      return res.status(400).json({
        message: 'Member is already attached to this class'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO class_members (class_id, member_id, attendance_status)
       VALUES (?, ?, ?)`,
      [id, member_id, finalAttendanceStatus]
    );

    const [rows] = await pool.query(
      `SELECT cm.*, m.first_name, m.last_name, m.email, m.belt_rank
       FROM class_members cm
       JOIN members m ON cm.member_id = m.id
       WHERE cm.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      message: 'Member attendance added successfully',
      class_member: rows[0]
    });
  } catch (error) {
    console.error('Add member to class error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const addMembersToClassBulk = async (req, res) => {
  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;
    const { member_ids, attendance_status } = req.body;

    if (!Array.isArray(member_ids) || member_ids.length === 0) {
      connection.release();
      return res.status(400).json({
        message: 'member_ids must be a non-empty array'
      });
    }

    const normalizedMemberIds = [...new Set(member_ids.map(Number).filter(Boolean))];
    const finalAttendanceStatus = attendance_status || 'present';
    const validStatuses = ['present', 'absent', 'excused'];

    if (!validStatuses.includes(finalAttendanceStatus)) {
      connection.release();
      return res.status(400).json({
        message: 'Invalid attendance_status'
      });
    }

    const [classRows] = await connection.query(
      'SELECT id FROM classes WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (classRows.length === 0) {
      connection.release();
      return res.status(404).json({
        message: 'Class not found'
      });
    }

    const [memberRows] = await connection.query(
      `SELECT id
       FROM members
       WHERE gym_id = ?
         AND id IN (${normalizedMemberIds.map(() => '?').join(', ')})`,
      [gymId, ...normalizedMemberIds]
    );

    if (memberRows.length !== normalizedMemberIds.length) {
      connection.release();
      return res.status(400).json({
        message: 'One or more members were not found for this gym'
      });
    }

    const [existingRows] = await connection.query(
      `SELECT member_id
       FROM class_members
       WHERE class_id = ?
         AND member_id IN (${normalizedMemberIds.map(() => '?').join(', ')})`,
      [id, ...normalizedMemberIds]
    );

    const existingMemberIds = new Set(existingRows.map((row) => Number(row.member_id)));
    const insertableMemberIds = normalizedMemberIds.filter(
      (memberId) => !existingMemberIds.has(Number(memberId))
    );

    if (insertableMemberIds.length === 0) {
      connection.release();
      return res.status(200).json({
        message: 'Attendance was already recorded for those members.',
        addedCount: 0,
        skippedCount: normalizedMemberIds.length
      });
    }

    await connection.beginTransaction();
    transactionStarted = true;

    for (const memberId of insertableMemberIds) {
      await connection.query(
        `INSERT INTO class_members (class_id, member_id, attendance_status)
         VALUES (?, ?, ?)`,
        [id, memberId, finalAttendanceStatus]
      );
    }

    await connection.commit();
    connection.release();

    return res.status(201).json({
      message: 'Bulk attendance saved successfully',
      addedCount: insertableMemberIds.length,
      skippedCount: normalizedMemberIds.length - insertableMemberIds.length
    });
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
    }
    connection.release();
    console.error('Bulk add members to class error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getClassMembers = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    const [classRows] = await pool.query(
      'SELECT id FROM classes WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (classRows.length === 0) {
      return res.status(404).json({
        message: 'Class not found'
      });
    }

    const [rows] = await pool.query(
      `SELECT cm.*, m.first_name, m.last_name, m.email, m.belt_rank, m.program_id
       FROM class_members cm
       JOIN members m ON cm.member_id = m.id
       WHERE cm.class_id = ?
       ORDER BY m.last_name ASC, m.first_name ASC`,
      [id]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Get class members error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const removeMemberFromClass = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id, classMemberId } = req.params;

    const [classRows] = await pool.query(
      'SELECT id FROM classes WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (classRows.length === 0) {
      return res.status(404).json({
        message: 'Class not found'
      });
    }

    const [existingRows] = await pool.query(
      'SELECT id FROM class_members WHERE id = ? AND class_id = ?',
      [classMemberId, id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Class member entry not found'
      });
    }

    await pool.query(
      'DELETE FROM class_members WHERE id = ? AND class_id = ?',
      [classMemberId, id]
    );

    return res.status(200).json({
      message: 'Member removed from class successfully'
    });
  } catch (error) {
    console.error('Remove member from class error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  addMemberToClass,
  addMembersToClassBulk,
  getClassMembers,
  removeMemberFromClass
};
