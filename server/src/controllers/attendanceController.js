const pool = require('../config/db');
const {
  getProgressTopicSpecsForClass,
  applyProgressToMembersAndTopics
} = require('../services/classProgressService');

const isMissingClassArchiveSchemaError = (error) => (
  Boolean(error)
  && error.code === 'ER_BAD_FIELD_ERROR'
  && /archived_at/i.test(error.sqlMessage || error.message || '')
);

const addMemberToClass = async (req, res) => {
  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    const gymId = req.user.gym_id;
    const updatedByUserId = req.user.id;
    const { id } = req.params;
    const { member_id, attendance_status } = req.body;

    if (!member_id) {
      connection.release();
      return res.status(400).json({
        message: 'member_id is required'
      });
    }

    const finalAttendanceStatus = attendance_status || 'present';
    const validStatuses = ['present', 'absent', 'excused'];

    if (!validStatuses.includes(finalAttendanceStatus)) {
      connection.release();
      return res.status(400).json({
        message: 'Invalid attendance_status'
      });
    }

    const [classRows] = await connection.query(
      'SELECT id FROM classes WHERE id = ? AND gym_id = ? AND archived_at IS NULL',
      [id, gymId]
    );

    if (classRows.length === 0) {
      connection.release();
      return res.status(404).json({
        message: 'Class not found'
      });
    }

    const [memberRows] = await connection.query(
      'SELECT id FROM members WHERE id = ? AND gym_id = ?',
      [member_id, gymId]
    );

    if (memberRows.length === 0) {
      connection.release();
      return res.status(400).json({
        message: 'Member not found for this gym'
      });
    }

    const [existingRows] = await connection.query(
      'SELECT id, archived_at FROM class_members WHERE class_id = ? AND member_id = ?',
      [id, member_id]
    );

    const activeExistingRow = existingRows.find((row) => row.archived_at === null);

    if (activeExistingRow) {
      connection.release();
      return res.status(400).json({
        message: 'Member is already attached to this class'
      });
    }

    await connection.beginTransaction();
    transactionStarted = true;

    let classMemberId;

    if (existingRows.length > 0) {
      classMemberId = existingRows[0].id;

      await connection.query(
        `UPDATE class_members
         SET attendance_status = ?, archived_at = NULL
         WHERE id = ?`,
        [finalAttendanceStatus, classMemberId]
      );
    } else {
      const [result] = await connection.query(
        `INSERT INTO class_members (class_id, member_id, attendance_status)
         VALUES (?, ?, ?)`,
        [id, member_id, finalAttendanceStatus]
      );
      classMemberId = result.insertId;
    }

    const topicProgressSpecs = finalAttendanceStatus === 'present'
      ? await getProgressTopicSpecsForClass(connection, gymId, id)
      : [];
    const autoProgress = topicProgressSpecs.length > 0
      ? await applyProgressToMembersAndTopics(connection, {
        memberIds: [Number(member_id)],
        topicProgressSpecs,
        updatedByUserId
      })
      : { insertedCount: 0, reviewedCount: 0 };

    const [rows] = await connection.query(
      `SELECT cm.*, m.first_name, m.last_name, m.email, m.belt_rank
       FROM class_members cm
       JOIN members m ON cm.member_id = m.id
       WHERE cm.id = ?`,
      [classMemberId]
    );

    await connection.commit();
    connection.release();

    return res.status(201).json({
      message: 'Member attendance added successfully',
      class_member: rows[0],
      auto_progress: {
        topicCount: topicProgressSpecs.length,
        insertedCount: autoProgress.insertedCount,
        reviewedCount: autoProgress.reviewedCount
      }
    });
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
    }
    connection.release();
    if (isMissingClassArchiveSchemaError(error)) {
      return res.status(500).json({
        message: 'Class archive schema is missing. Run database migrations and try again.'
      });
    }

    console.error('Add member to class error:', error.message);

    return res.status(500).json({
      message: 'Server error'
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
      'SELECT id FROM classes WHERE id = ? AND gym_id = ? AND archived_at IS NULL',
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
         AND archived_at IS NULL
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

    const [archivedRows] = await connection.query(
      `SELECT id, member_id
       FROM class_members
       WHERE class_id = ?
         AND archived_at IS NOT NULL
         AND member_id IN (${insertableMemberIds.map(() => '?').join(', ')})`,
      [id, ...insertableMemberIds]
    );

    const archivedByMemberId = new Map(
      archivedRows.map((row) => [Number(row.member_id), row.id])
    );

    for (const memberId of insertableMemberIds) {
      const archivedId = archivedByMemberId.get(Number(memberId));

      if (archivedId) {
        await connection.query(
          `UPDATE class_members
           SET attendance_status = ?, archived_at = NULL
           WHERE id = ?`,
          [finalAttendanceStatus, archivedId]
        );
      } else {
        await connection.query(
          `INSERT INTO class_members (class_id, member_id, attendance_status)
           VALUES (?, ?, ?)`,
          [id, memberId, finalAttendanceStatus]
        );
      }
    }

    const topicProgressSpecs = finalAttendanceStatus === 'present'
      ? await getProgressTopicSpecsForClass(connection, gymId, id)
      : [];
    const autoProgress = topicProgressSpecs.length > 0
      ? await applyProgressToMembersAndTopics(connection, {
        memberIds: insertableMemberIds,
        topicProgressSpecs,
        updatedByUserId: req.user.id
      })
      : { insertedCount: 0, reviewedCount: 0 };

    await connection.commit();
    connection.release();

    return res.status(201).json({
      message: 'Bulk attendance saved successfully',
      addedCount: insertableMemberIds.length,
      skippedCount: normalizedMemberIds.length - insertableMemberIds.length,
      auto_progress: {
        topicCount: topicProgressSpecs.length,
        insertedCount: autoProgress.insertedCount,
        reviewedCount: autoProgress.reviewedCount
      }
    });
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
    }
    connection.release();
    if (isMissingClassArchiveSchemaError(error)) {
      return res.status(500).json({
        message: 'Class archive schema is missing. Run database migrations and try again.'
      });
    }

    console.error('Bulk add members to class error:', error.message);

    return res.status(500).json({
      message: 'Server error'
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
         AND cm.archived_at IS NULL
       ORDER BY m.last_name ASC, m.first_name ASC`,
      [id]
    );

    return res.status(200).json(rows);
  } catch (error) {
    if (isMissingClassArchiveSchemaError(error)) {
      return res.status(500).json({
        message: 'Class archive schema is missing. Run database migrations and try again.'
      });
    }

    console.error('Get class members error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const removeMemberFromClass = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id, classMemberId } = req.params;

    const [classRows] = await pool.query(
      'SELECT id FROM classes WHERE id = ? AND gym_id = ? AND archived_at IS NULL',
      [id, gymId]
    );

    if (classRows.length === 0) {
      return res.status(404).json({
        message: 'Class not found'
      });
    }

    const [existingRows] = await pool.query(
      'SELECT id FROM class_members WHERE id = ? AND class_id = ? AND archived_at IS NULL',
      [classMemberId, id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Class member entry not found'
      });
    }

    await pool.query(
      `UPDATE class_members
       SET archived_at = COALESCE(archived_at, CURRENT_TIMESTAMP)
       WHERE id = ? AND class_id = ?`,
      [classMemberId, id]
    );

    return res.status(200).json({
      message: 'Member removed from class successfully'
    });
  } catch (error) {
    if (isMissingClassArchiveSchemaError(error)) {
      return res.status(500).json({
        message: 'Class archive schema is missing. Run database migrations and try again.'
      });
    }

    console.error('Remove member from class error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

module.exports = {
  addMemberToClass,
  addMembersToClassBulk,
  getClassMembers,
  removeMemberFromClass
};
