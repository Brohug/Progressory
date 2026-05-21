const pool = require('../config/db');

const validProgressStatuses = ['not_started', 'introduced', 'developing', 'competent'];

const progressStatusRank = {
  not_started: 0,
  introduced: 1,
  developing: 2,
  competent: 3
};

let ensureClassProgressColumnsPromise = null;

const ensureColumnExists = async (connection, tableName, columnName, definitionSql) => {
  const [rows] = await connection.query(`SHOW COLUMNS FROM ${tableName} LIKE ?`, [columnName]);

  if (rows.length === 0) {
    await connection.query(`ALTER TABLE ${tableName} ADD COLUMN ${definitionSql}`);
  }
};

const ensureClassProgressColumns = async (connection = null) => {
  if (connection) {
    await ensureColumnExists(
      connection,
      'class_topics',
      'progress_status',
      "progress_status VARCHAR(32) NULL AFTER focus_level"
    );
    await ensureColumnExists(
      connection,
      'planned_class_topics',
      'progress_status',
      "progress_status VARCHAR(32) NULL AFTER focus_level"
    );
    return;
  }

  if (!ensureClassProgressColumnsPromise) {
    ensureClassProgressColumnsPromise = (async () => {
      const pooledConnection = await pool.getConnection();
      try {
        await ensureClassProgressColumns(pooledConnection);
      } finally {
        pooledConnection.release();
      }
    })();
  }

  await ensureClassProgressColumnsPromise;
};

const inferDefaultProgressStatus = (coverageType = 'taught', focusLevel = 'focus') => {
  if (focusLevel === 'focus') {
    return 'developing';
  }

  if (focusLevel === 'secondary' || focusLevel === 'review') {
    return coverageType === 'reviewed' ? 'introduced' : 'introduced';
  }

  return 'introduced';
};

const normalizeProgressStatus = (progressStatus, coverageType = 'taught', focusLevel = 'focus') => {
  if (progressStatus && validProgressStatuses.includes(progressStatus)) {
    return progressStatus;
  }

  return inferDefaultProgressStatus(coverageType, focusLevel);
};

const getPresentMemberIdsForClass = async (connection, gymId, classId) => {
  const [rows] = await connection.query(
    `SELECT DISTINCT cm.member_id
     FROM class_members cm
     JOIN members m ON cm.member_id = m.id
     WHERE cm.class_id = ?
       AND m.gym_id = ?
       AND cm.attendance_status = 'present'`,
    [classId, gymId]
  );

  return rows.map((row) => row.member_id);
};

const getProgressTopicSpecsForClass = async (connection, gymId, classId) => {
  await ensureClassProgressColumns(connection);

  const [rows] = await connection.query(
    `SELECT DISTINCT
        ct.curriculum_topic_id,
        ct.coverage_type,
        ct.focus_level,
        ct.progress_status
     FROM class_topics ct
     JOIN curriculum_topics ctopic ON ct.curriculum_topic_id = ctopic.id
     WHERE ct.class_id = ?
       AND ctopic.gym_id = ?`,
    [classId, gymId]
  );

  return rows.map((row) => ({
    topicId: row.curriculum_topic_id,
    progressStatus: normalizeProgressStatus(row.progress_status, row.coverage_type, row.focus_level)
  }));
};

const applyProgressToMembersAndTopics = async (
  connection,
  {
    memberIds,
    topicProgressSpecs,
    updatedByUserId
  }
) => {
  let insertedCount = 0;
  let reviewedCount = 0;

  for (const memberId of memberIds) {
    for (const topicSpec of topicProgressSpecs) {
      const topicId = topicSpec.topicId;
      const targetStatus = normalizeProgressStatus(
        topicSpec.progressStatus,
        topicSpec.coverageType,
        topicSpec.focusLevel
      );

      const [existingRows] = await connection.query(
        `SELECT status
         FROM member_topic_progress
         WHERE member_id = ? AND curriculum_topic_id = ?`,
        [memberId, topicId]
      );

      if (existingRows.length > 0) {
        const existingStatus = existingRows[0].status;
        const nextStatus =
          progressStatusRank[existingStatus] >= progressStatusRank[targetStatus]
            ? existingStatus
            : targetStatus;

        await connection.query(
          `UPDATE member_topic_progress
           SET status = ?, last_reviewed_at = CURRENT_TIMESTAMP, updated_by_user_id = ?
           WHERE member_id = ? AND curriculum_topic_id = ?`,
          [nextStatus, updatedByUserId, memberId, topicId]
        );

        reviewedCount += 1;
      } else {
        await connection.query(
          `INSERT INTO member_topic_progress
           (member_id, curriculum_topic_id, status, last_reviewed_at, notes, updated_by_user_id)
           VALUES (?, ?, ?, CURRENT_TIMESTAMP, NULL, ?)`,
          [memberId, topicId, targetStatus, updatedByUserId]
        );

        insertedCount += 1;
      }
    }
  }

  return {
    insertedCount,
    reviewedCount
  };
};

module.exports = {
  validProgressStatuses,
  progressStatusRank,
  ensureClassProgressColumns,
  inferDefaultProgressStatus,
  normalizeProgressStatus,
  getPresentMemberIdsForClass,
  getProgressTopicSpecsForClass,
  applyProgressToMembersAndTopics
};
