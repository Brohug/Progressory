const pool = require('../config/db');

const createClass = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const loggedByUserId = req.user.id;

    const {
      program_id,
      title,
      class_date,
      start_time,
      end_time,
      head_coach_user_id,
      notes
    } = req.body;

    if (!program_id || !class_date || !head_coach_user_id) {
      return res.status(400).json({
        message: 'program_id, class_date, and head_coach_user_id are required'
      });
    }

    const [programRows] = await pool.query(
      'SELECT id FROM programs WHERE id = ? AND gym_id = ?',
      [program_id, gymId]
    );

    if (programRows.length === 0) {
      return res.status(400).json({
        message: 'Program not found for this gym'
      });
    }

    const [coachRows] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND gym_id = ?',
      [head_coach_user_id, gymId]
    );

    if (coachRows.length === 0) {
      return res.status(400).json({
        message: 'Head coach not found for this gym'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO classes
       (gym_id, program_id, title, class_date, start_time, end_time, head_coach_user_id, logged_by_user_id, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        gymId,
        program_id,
        title || null,
        class_date,
        start_time || null,
        end_time || null,
        head_coach_user_id,
        loggedByUserId,
        notes || null
      ]
    );

    const [rows] = await pool.query(
      `SELECT c.*,
              p.name AS program_name,
              hc.first_name AS head_coach_first_name,
              hc.last_name AS head_coach_last_name,
              lu.first_name AS logged_by_first_name,
              lu.last_name AS logged_by_last_name
       FROM classes c
       JOIN programs p ON c.program_id = p.id
       JOIN users hc ON c.head_coach_user_id = hc.id
       JOIN users lu ON c.logged_by_user_id = lu.id
       WHERE c.id = ? AND c.gym_id = ?`,
      [result.insertId, gymId]
    );

    return res.status(201).json({
      message: 'Class created successfully',
      class: rows[0]
    });
  } catch (error) {
    console.error('Create class error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getClasses = async (req, res) => {
  try {
    const gymId = req.user.gym_id;

    const [rows] = await pool.query(
      `SELECT c.*,
              p.name AS program_name,
              hc.first_name AS head_coach_first_name,
              hc.last_name AS head_coach_last_name,
              lu.first_name AS logged_by_first_name,
              lu.last_name AS logged_by_last_name
       FROM classes c
       JOIN programs p ON c.program_id = p.id
       JOIN users hc ON c.head_coach_user_id = hc.id
       JOIN users lu ON c.logged_by_user_id = lu.id
       WHERE c.gym_id = ?
       ORDER BY c.class_date DESC, c.created_at DESC`,
      [gymId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Get classes error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getClassById = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT c.*,
              p.name AS program_name,
              hc.first_name AS head_coach_first_name,
              hc.last_name AS head_coach_last_name,
              lu.first_name AS logged_by_first_name,
              lu.last_name AS logged_by_last_name
       FROM classes c
       JOIN programs p ON c.program_id = p.id
       JOIN users hc ON c.head_coach_user_id = hc.id
       JOIN users lu ON c.logged_by_user_id = lu.id
       WHERE c.id = ? AND c.gym_id = ?`,
      [id, gymId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Class not found'
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Get class by ID error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const updateClass = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    const {
      program_id,
      title,
      class_date,
      start_time,
      end_time,
      head_coach_user_id,
      notes
    } = req.body;

    const [existingRows] = await pool.query(
      'SELECT * FROM classes WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Class not found'
      });
    }

    const currentClass = existingRows[0];

    const updatedProgramId = program_id !== undefined ? program_id : currentClass.program_id;
    const updatedTitle = title !== undefined ? title : currentClass.title;
    const updatedClassDate = class_date !== undefined ? class_date : currentClass.class_date;
    const updatedStartTime = start_time !== undefined ? start_time : currentClass.start_time;
    const updatedEndTime = end_time !== undefined ? end_time : currentClass.end_time;
    const updatedHeadCoachUserId =
      head_coach_user_id !== undefined ? head_coach_user_id : currentClass.head_coach_user_id;
    const updatedNotes = notes !== undefined ? notes : currentClass.notes;

    const [programRows] = await pool.query(
      'SELECT id FROM programs WHERE id = ? AND gym_id = ?',
      [updatedProgramId, gymId]
    );

    if (programRows.length === 0) {
      return res.status(400).json({
        message: 'Program not found for this gym'
      });
    }

    const [coachRows] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND gym_id = ?',
      [updatedHeadCoachUserId, gymId]
    );

    if (coachRows.length === 0) {
      return res.status(400).json({
        message: 'Head coach not found for this gym'
      });
    }

    await pool.query(
      `UPDATE classes
       SET program_id = ?, title = ?, class_date = ?, start_time = ?, end_time = ?, head_coach_user_id = ?, notes = ?
       WHERE id = ? AND gym_id = ?`,
      [
        updatedProgramId,
        updatedTitle,
        updatedClassDate,
        updatedStartTime,
        updatedEndTime,
        updatedHeadCoachUserId,
        updatedNotes,
        id,
        gymId
      ]
    );

    const [updatedRows] = await pool.query(
      `SELECT c.*,
              p.name AS program_name,
              hc.first_name AS head_coach_first_name,
              hc.last_name AS head_coach_last_name,
              lu.first_name AS logged_by_first_name,
              lu.last_name AS logged_by_last_name
       FROM classes c
       JOIN programs p ON c.program_id = p.id
       JOIN users hc ON c.head_coach_user_id = hc.id
       JOIN users lu ON c.logged_by_user_id = lu.id
       WHERE c.id = ? AND c.gym_id = ?`,
      [id, gymId]
    );

    return res.status(200).json({
      message: 'Class updated successfully',
      class: updatedRows[0]
    });
  } catch (error) {
    console.error('Update class error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteClass = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    const [existingRows] = await pool.query(
      'SELECT * FROM classes WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Class not found'
      });
    }

    await pool.query(
      'DELETE FROM classes WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    return res.status(200).json({
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Delete class error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};
const addClassTopic = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;
    const { curriculum_topic_id, coverage_type, focus_level, notes } = req.body;

    if (!curriculum_topic_id) {
      return res.status(400).json({
        message: 'curriculum_topic_id is required'
      });
    }

    const validCoverageTypes = ['taught', 'reviewed'];
    const validFocusLevels = ['focus', 'secondary', 'review'];

    const finalCoverageType = coverage_type || 'taught';
    const finalFocusLevel = focus_level || 'focus';

    if (!validCoverageTypes.includes(finalCoverageType)) {
      return res.status(400).json({
        message: 'Invalid coverage_type'
      });
    }

    if (!validFocusLevels.includes(finalFocusLevel)) {
      return res.status(400).json({
        message: 'Invalid focus_level'
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

    const [topicRows] = await pool.query(
      'SELECT id, title FROM curriculum_topics WHERE id = ? AND gym_id = ?',
      [curriculum_topic_id, gymId]
    );

    if (topicRows.length === 0) {
      return res.status(400).json({
        message: 'Curriculum topic not found for this gym'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO class_topics
       (class_id, curriculum_topic_id, coverage_type, focus_level, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [id, curriculum_topic_id, finalCoverageType, finalFocusLevel, notes || null]
    );

    const [rows] = await pool.query(
      `SELECT ct.*,
              topic.title AS topic_title,
              topic.topic_type
       FROM class_topics ct
       JOIN curriculum_topics topic ON ct.curriculum_topic_id = topic.id
       WHERE ct.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      message: 'Class topic added successfully',
      class_topic: rows[0]
    });
  } catch (error) {
    console.error('Add class topic error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getClassTopics = async (req, res) => {
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
      `SELECT ct.*,
              topic.title AS topic_title,
              topic.topic_type,
              topic.program_id
       FROM class_topics ct
       JOIN curriculum_topics topic ON ct.curriculum_topic_id = topic.id
       WHERE ct.class_id = ?
       ORDER BY ct.created_at ASC`,
      [id]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Get class topics error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteClassTopic = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id, topicEntryId } = req.params;

    const [classRows] = await pool.query(
      'SELECT id FROM classes WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (classRows.length === 0) {
      return res.status(404).json({
        message: 'Class not found'
      });
    }

    const [entryRows] = await pool.query(
      'SELECT id FROM class_topics WHERE id = ? AND class_id = ?',
      [topicEntryId, id]
    );

    if (entryRows.length === 0) {
      return res.status(404).json({
        message: 'Class topic entry not found'
      });
    }

    await pool.query(
      'DELETE FROM class_topics WHERE id = ? AND class_id = ?',
      [topicEntryId, id]
    );

    return res.status(200).json({
      message: 'Class topic deleted successfully'
    });
  } catch (error) {
    console.error('Delete class topic error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};
const addClassTrainingEntry = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;
    const {
      training_method_id,
      training_scenario_id,
      curriculum_topic_id,
      segment_title,
      segment_order,
      duration_minutes,
      constraints_text,
      win_condition_top,
      win_condition_bottom,
      notes
    } = req.body;

    if (!training_method_id) {
      return res.status(400).json({
        message: 'training_method_id is required'
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

    const [methodRows] = await pool.query(
      'SELECT id, name FROM training_methods WHERE id = ? AND gym_id = ?',
      [training_method_id, gymId]
    );

    if (methodRows.length === 0) {
      return res.status(400).json({
        message: 'Training method not found for this gym'
      });
    }

    if (training_scenario_id !== undefined && training_scenario_id !== null) {
      const [scenarioRows] = await pool.query(
        'SELECT id FROM training_scenarios WHERE id = ? AND gym_id = ?',
        [training_scenario_id, gymId]
      );

      if (scenarioRows.length === 0) {
        return res.status(400).json({
          message: 'Training scenario not found for this gym'
        });
      }
    }

    if (curriculum_topic_id !== undefined && curriculum_topic_id !== null) {
      const [topicRows] = await pool.query(
        'SELECT id FROM curriculum_topics WHERE id = ? AND gym_id = ?',
        [curriculum_topic_id, gymId]
      );

      if (topicRows.length === 0) {
        return res.status(400).json({
          message: 'Curriculum topic not found for this gym'
        });
      }
    }

    const finalSegmentOrder = segment_order ?? 1;

    const [result] = await pool.query(
      `INSERT INTO class_training_entries
       (class_id, training_method_id, training_scenario_id, curriculum_topic_id, segment_title,
        segment_order, duration_minutes, constraints_text, win_condition_top, win_condition_bottom, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        training_method_id,
        training_scenario_id ?? null,
        curriculum_topic_id ?? null,
        segment_title || null,
        finalSegmentOrder,
        duration_minutes ?? null,
        constraints_text || null,
        win_condition_top || null,
        win_condition_bottom || null,
        notes || null
      ]
    );

    const [rows] = await pool.query(
      `SELECT cte.*,
              tm.name AS training_method_name,
              ts.name AS training_scenario_name,
              ct.title AS curriculum_topic_title
       FROM class_training_entries cte
       JOIN training_methods tm ON cte.training_method_id = tm.id
       LEFT JOIN training_scenarios ts ON cte.training_scenario_id = ts.id
       LEFT JOIN curriculum_topics ct ON cte.curriculum_topic_id = ct.id
       WHERE cte.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      message: 'Class training entry added successfully',
      training_entry: rows[0]
    });
  } catch (error) {
    console.error('Add class training entry error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getClassTrainingEntries = async (req, res) => {
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
      `SELECT cte.*,
              tm.name AS training_method_name,
              ts.name AS training_scenario_name,
              ct.title AS curriculum_topic_title
       FROM class_training_entries cte
       JOIN training_methods tm ON cte.training_method_id = tm.id
       LEFT JOIN training_scenarios ts ON cte.training_scenario_id = ts.id
       LEFT JOIN curriculum_topics ct ON cte.curriculum_topic_id = ct.id
       WHERE cte.class_id = ?
       ORDER BY cte.segment_order ASC, cte.created_at ASC`,
      [id]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Get class training entries error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteClassTrainingEntry = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id, entryId } = req.params;

    const [classRows] = await pool.query(
      'SELECT id FROM classes WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (classRows.length === 0) {
      return res.status(404).json({
        message: 'Class not found'
      });
    }

    const [entryRows] = await pool.query(
      'SELECT id FROM class_training_entries WHERE id = ? AND class_id = ?',
      [entryId, id]
    );

    if (entryRows.length === 0) {
      return res.status(404).json({
        message: 'Class training entry not found'
      });
    }

    await pool.query(
      'DELETE FROM class_training_entries WHERE id = ? AND class_id = ?',
      [entryId, id]
    );

    return res.status(200).json({
      message: 'Class training entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete class training entry error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const progressStatusRank = {
  not_started: 0,
  introduced: 1,
  developing: 2,
  competent: 3
};

const applyClassProgress = async (req, res) => {
  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    const gymId = req.user.gym_id;
    const updatedByUserId = req.user.id;
    const { id } = req.params;

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

    const [presentMemberRows] = await connection.query(
      `SELECT DISTINCT cm.member_id
       FROM class_members cm
       JOIN members m ON cm.member_id = m.id
       WHERE cm.class_id = ?
         AND m.gym_id = ?
         AND cm.attendance_status = 'present'`,
      [id, gymId]
    );

    if (presentMemberRows.length === 0) {
      connection.release();
      return res.status(400).json({
        message: 'No present members are available for this class yet.'
      });
    }

    const [topicRows] = await connection.query(
      `SELECT DISTINCT ct.curriculum_topic_id
       FROM class_topics ct
       JOIN curriculum_topics ctopic ON ct.curriculum_topic_id = ctopic.id
       WHERE ct.class_id = ?
         AND ctopic.gym_id = ?`,
      [id, gymId]
    );

    if (topicRows.length === 0) {
      connection.release();
      return res.status(400).json({
        message: 'No class topics have been logged yet.'
      });
    }

    await connection.beginTransaction();
    transactionStarted = true;

    let insertedCount = 0;
    let reviewedCount = 0;

    for (const memberRow of presentMemberRows) {
      for (const topicRow of topicRows) {
        const memberId = memberRow.member_id;
        const topicId = topicRow.curriculum_topic_id;

        const [existingRows] = await connection.query(
          `SELECT status
           FROM member_topic_progress
           WHERE member_id = ? AND curriculum_topic_id = ?`,
          [memberId, topicId]
        );

        if (existingRows.length > 0) {
          const existingStatus = existingRows[0].status;
          const nextStatus =
            progressStatusRank[existingStatus] >= progressStatusRank.introduced
              ? existingStatus
              : 'introduced';

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
             VALUES (?, ?, 'introduced', CURRENT_TIMESTAMP, NULL, ?)`,
            [memberId, topicId, updatedByUserId]
          );

          insertedCount += 1;
        }
      }
    }

    await connection.commit();
    connection.release();

    return res.status(200).json({
      message: 'Class progress applied successfully',
      presentMemberCount: presentMemberRows.length,
      topicCount: topicRows.length,
      insertedCount,
      reviewedCount
    });
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
    }
    connection.release();
    console.error('Apply class progress error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};
module.exports = {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  addClassTopic,
  getClassTopics,
  deleteClassTopic,
  addClassTrainingEntry,
  getClassTrainingEntries,
  deleteClassTrainingEntry,
  applyClassProgress
};
