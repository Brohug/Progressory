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
  getClassMembers,
  removeMemberFromClass
};