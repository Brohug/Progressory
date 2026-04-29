const pool = require('../config/db');

const validStatuses = ['not_started', 'introduced', 'developing', 'competent'];

const createOrUpdateMemberProgress = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const updatedByUserId = req.user.id;
    const { id } = req.params;
    const { curriculum_topic_id, status, notes } = req.body;

    if (!curriculum_topic_id) {
      return res.status(400).json({
        message: 'curriculum_topic_id is required'
      });
    }

    const finalStatus = status || 'introduced';

    if (!validStatuses.includes(finalStatus)) {
      return res.status(400).json({
        message: 'Invalid status'
      });
    }

    const [memberRows] = await pool.query(
      'SELECT id FROM members WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (memberRows.length === 0) {
      return res.status(404).json({
        message: 'Member not found'
      });
    }

    const [topicRows] = await pool.query(
      'SELECT id FROM curriculum_topics WHERE id = ? AND gym_id = ?',
      [curriculum_topic_id, gymId]
    );

    if (topicRows.length === 0) {
      return res.status(400).json({
        message: 'Curriculum topic not found for this gym'
      });
    }

    const [existingRows] = await pool.query(
      'SELECT id FROM member_topic_progress WHERE member_id = ? AND curriculum_topic_id = ?',
      [id, curriculum_topic_id]
    );

    if (existingRows.length > 0) {
      await pool.query(
        `UPDATE member_topic_progress
         SET status = ?, notes = ?, last_reviewed_at = CURRENT_TIMESTAMP, updated_by_user_id = ?
         WHERE member_id = ? AND curriculum_topic_id = ?`,
        [finalStatus, notes || null, updatedByUserId, id, curriculum_topic_id]
      );
    } else {
      await pool.query(
        `INSERT INTO member_topic_progress
         (member_id, curriculum_topic_id, status, last_reviewed_at, notes, updated_by_user_id)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?)`,
        [id, curriculum_topic_id, finalStatus, notes || null, updatedByUserId]
      );
    }

    const [rows] = await pool.query(
      `SELECT mtp.*, ct.title AS topic_title, ct.topic_type,
              u.first_name AS updated_by_first_name, u.last_name AS updated_by_last_name
       FROM member_topic_progress mtp
       JOIN curriculum_topics ct ON mtp.curriculum_topic_id = ct.id
       JOIN users u ON mtp.updated_by_user_id = u.id
       WHERE mtp.member_id = ? AND mtp.curriculum_topic_id = ?`,
      [id, curriculum_topic_id]
    );

    return res.status(200).json({
      message: 'Member topic progress saved successfully',
      progress: rows[0]
    });
  } catch (error) {
    console.error('Create/update member progress error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getMemberProgress = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    if (req.user.role === 'member') {
      const [linkedMemberRows] = await pool.query(
        'SELECT id FROM members WHERE user_id = ? AND gym_id = ?',
        [req.user.id, gymId]
      );

      if (linkedMemberRows.length === 0) {
        return res.status(403).json({
          message: 'Member account is not linked to a roster profile yet'
        });
      }

      if (Number(linkedMemberRows[0].id) !== Number(id)) {
        return res.status(403).json({
          message: 'Members can only view their own progress'
        });
      }
    }

    const [memberRows] = await pool.query(
      'SELECT id FROM members WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (memberRows.length === 0) {
      return res.status(404).json({
        message: 'Member not found'
      });
    }

    const [rows] = await pool.query(
      `SELECT mtp.*, ct.title AS topic_title, ct.topic_type,
              u.first_name AS updated_by_first_name, u.last_name AS updated_by_last_name
       FROM member_topic_progress mtp
       JOIN curriculum_topics ct ON mtp.curriculum_topic_id = ct.id
       JOIN users u ON mtp.updated_by_user_id = u.id
       WHERE mtp.member_id = ?
       ORDER BY mtp.updated_at DESC`,
      [id]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Get member progress error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getMyProgress = async (req, res) => {
  try {
    const gymId = req.user.gym_id;

    const [memberRows] = await pool.query(
      'SELECT id, first_name, last_name FROM members WHERE user_id = ? AND gym_id = ?',
      [req.user.id, gymId]
    );

    if (memberRows.length === 0) {
      return res.status(404).json({
        message: 'This login is not linked to a member profile yet'
      });
    }

    const member = memberRows[0];

    const [rows] = await pool.query(
      `SELECT mtp.*, ct.title AS topic_title, ct.topic_type,
              u.first_name AS updated_by_first_name, u.last_name AS updated_by_last_name
       FROM member_topic_progress mtp
       JOIN curriculum_topics ct ON mtp.curriculum_topic_id = ct.id
       JOIN users u ON mtp.updated_by_user_id = u.id
       WHERE mtp.member_id = ?
       ORDER BY mtp.updated_at DESC`,
      [member.id]
    );

    return res.status(200).json({
      member: {
        id: member.id,
        first_name: member.first_name,
        last_name: member.last_name
      },
      progress: rows
    });
  } catch (error) {
    console.error('Get my progress error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createOrUpdateMemberProgress,
  getMemberProgress,
  getMyProgress
};
