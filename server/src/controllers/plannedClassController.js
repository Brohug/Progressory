const pool = require('../config/db');

const completePlannedClassRecord = async ({
  connection,
  gymId,
  plannedClass,
  plannedClassId,
  loggedByUserId
}) => {
  const [classInsert] = await connection.query(
    `INSERT INTO classes
     (gym_id, program_id, title, class_date, start_time, end_time, head_coach_user_id, logged_by_user_id, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      gymId,
      plannedClass.program_id,
      plannedClass.title,
      plannedClass.class_date,
      plannedClass.start_time,
      plannedClass.end_time,
      plannedClass.head_coach_user_id,
      loggedByUserId,
      plannedClass.notes
    ]
  );

  const completedClassId = classInsert.insertId;

  const [plannedTopicRows] = await connection.query(
    `SELECT curriculum_topic_id, focus_level
     FROM planned_class_topics
     WHERE planned_class_id = ?`,
    [plannedClassId]
  );

  for (const plannedTopic of plannedTopicRows) {
    await connection.query(
      `INSERT INTO class_topics
       (class_id, curriculum_topic_id, coverage_type, focus_level, notes)
       VALUES (?, ?, 'taught', ?, NULL)`,
      [completedClassId, plannedTopic.curriculum_topic_id, plannedTopic.focus_level]
    );
  }

  if (plannedClass.training_scenario_id) {
    const [scenarioRows] = await connection.query(
      `SELECT *
       FROM training_scenarios
       WHERE id = ? AND gym_id = ?`,
      [plannedClass.training_scenario_id, gymId]
    );

    if (scenarioRows.length > 0) {
      const scenario = scenarioRows[0];
      const durationMinutes = scenario.round_duration_seconds
        ? Math.max(1, Math.round(scenario.round_duration_seconds / 60))
        : null;

      await connection.query(
        `INSERT INTO class_training_entries
         (
           class_id,
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
         )
         VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)`,
        [
          completedClassId,
          scenario.training_method_id,
          scenario.id,
          scenario.starting_position_topic_id || null,
          scenario.name,
          durationMinutes,
          scenario.constraints_text || null,
          scenario.top_objective || null,
          scenario.bottom_objective || null,
          scenario.description || null
        ]
      );
    }
  }

  await connection.query(
    `UPDATE planned_classes
     SET status = 'completed', completed_class_id = ?
     WHERE id = ? AND gym_id = ?`,
    [completedClassId, plannedClassId, gymId]
  );

  return completedClassId;
};

const getPlannedClasses = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const isMember = req.user.role === 'member';
    const plannedStatusClause = isMember ? "AND pc.status = 'planned'" : '';

    const [rows] = await pool.query(
      `SELECT
        pc.*,
        p.name AS program_name,
        ts.name AS training_scenario_name,
        hc.first_name AS head_coach_first_name,
        hc.last_name AS head_coach_last_name
      FROM planned_classes pc
      JOIN programs p ON pc.program_id = p.id
      JOIN users hc ON pc.head_coach_user_id = hc.id
      LEFT JOIN training_scenarios ts ON pc.training_scenario_id = ts.id
      WHERE pc.gym_id = ?
      ${plannedStatusClause}
      ORDER BY pc.class_date ASC, pc.start_time ASC, pc.created_at DESC`,
      [gymId]
    );

    const [topicRows] = await pool.query(
      `SELECT
        pct.planned_class_id,
        pct.curriculum_topic_id,
        pct.focus_level,
        ct.title,
        ct.topic_type
      FROM planned_class_topics pct
      JOIN planned_classes pc ON pct.planned_class_id = pc.id
      JOIN curriculum_topics ct ON pct.curriculum_topic_id = ct.id
      WHERE pc.gym_id = ?
      ${plannedStatusClause}
      ORDER BY pct.created_at ASC`,
      [gymId]
    );

    const topicsByPlannedClassId = topicRows.reduce((acc, row) => {
      if (!acc[row.planned_class_id]) {
        acc[row.planned_class_id] = [];
      }

      acc[row.planned_class_id].push({
        curriculum_topic_id: row.curriculum_topic_id,
        focus_level: row.focus_level,
        title: row.title,
        topic_type: row.topic_type
      });

      return acc;
    }, {});

    const plannedClasses = rows.map((row) => ({
      ...row,
      topics: topicsByPlannedClassId[row.id] || []
    }));

    return res.status(200).json(plannedClasses);
  } catch (error) {
    console.error('Get planned classes error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const createPlannedClass = async (req, res) => {
  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    const gymId = req.user.gym_id;
    const {
      program_id,
      training_scenario_id,
      title,
      class_date,
      start_time,
      end_time,
      head_coach_user_id,
      notes,
      topic_ids = []
    } = req.body;

    if (!program_id || !class_date || !head_coach_user_id) {
      connection.release();
      return res.status(400).json({
        message: 'program_id, class_date, and head_coach_user_id are required'
      });
    }

    await connection.beginTransaction();
    transactionStarted = true;

    const [programRows] = await connection.query(
      'SELECT id FROM programs WHERE id = ? AND gym_id = ?',
      [program_id, gymId]
    );

    if (programRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        message: 'Program not found for this gym'
      });
    }

    const [coachRows] = await connection.query(
      'SELECT id FROM users WHERE id = ? AND gym_id = ?',
      [head_coach_user_id, gymId]
    );

    if (coachRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        message: 'Head coach not found for this gym'
      });
    }

    if (training_scenario_id) {
      const [scenarioRows] = await connection.query(
        'SELECT id FROM training_scenarios WHERE id = ? AND gym_id = ?',
        [training_scenario_id, gymId]
      );

      if (scenarioRows.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          message: 'Training scenario not found for this gym'
        });
      }
    }

    const normalizedTopicIds = [...new Set(topic_ids.filter(Boolean).map(Number))];

    if (normalizedTopicIds.length > 0) {
      const [topicRows] = await connection.query(
        `SELECT id
         FROM curriculum_topics
         WHERE gym_id = ?
           AND id IN (${normalizedTopicIds.map(() => '?').join(', ')})`,
        [gymId, ...normalizedTopicIds]
      );

      if (topicRows.length !== normalizedTopicIds.length) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          message: 'One or more planned topics are not available for this gym'
        });
      }
    }

    const [result] = await connection.query(
      `INSERT INTO planned_classes
       (gym_id, program_id, training_scenario_id, title, class_date, start_time, end_time, head_coach_user_id, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'planned', ?)`,
      [
        gymId,
        program_id,
        training_scenario_id || null,
        title || null,
        class_date,
        start_time || null,
        end_time || null,
        head_coach_user_id,
        notes || null
      ]
    );

    for (const topicId of normalizedTopicIds) {
      await connection.query(
        `INSERT INTO planned_class_topics
         (planned_class_id, curriculum_topic_id, focus_level)
         VALUES (?, ?, 'focus')`,
        [result.insertId, topicId]
      );
    }

    await connection.commit();
    connection.release();

    return res.status(201).json({
      message: 'Planned class created successfully'
    });
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
    }
    connection.release();
    console.error('Create planned class error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const updatePlannedClass = async (req, res) => {
  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;
    const {
      program_id,
      training_scenario_id,
      title,
      class_date,
      start_time,
      end_time,
      head_coach_user_id,
      notes,
      topic_ids = []
    } = req.body;

    const [existingRows] = await connection.query(
      'SELECT * FROM planned_classes WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (existingRows.length === 0) {
      connection.release();
      return res.status(404).json({
        message: 'Planned class not found'
      });
    }

    if (existingRows[0].status === 'completed') {
      connection.release();
      return res.status(400).json({
        message: 'Completed planned classes can no longer be edited'
      });
    }

    if (!program_id || !class_date || !head_coach_user_id) {
      connection.release();
      return res.status(400).json({
        message: 'program_id, class_date, and head_coach_user_id are required'
      });
    }

    await connection.beginTransaction();
    transactionStarted = true;

    const [programRows] = await connection.query(
      'SELECT id FROM programs WHERE id = ? AND gym_id = ?',
      [program_id, gymId]
    );

    if (programRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        message: 'Program not found for this gym'
      });
    }

    const [coachRows] = await connection.query(
      'SELECT id FROM users WHERE id = ? AND gym_id = ?',
      [head_coach_user_id, gymId]
    );

    if (coachRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        message: 'Head coach not found for this gym'
      });
    }

    if (training_scenario_id) {
      const [scenarioRows] = await connection.query(
        'SELECT id FROM training_scenarios WHERE id = ? AND gym_id = ?',
        [training_scenario_id, gymId]
      );

      if (scenarioRows.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          message: 'Training scenario not found for this gym'
        });
      }
    }

    const normalizedTopicIds = [...new Set(topic_ids.filter(Boolean).map(Number))];

    if (normalizedTopicIds.length > 0) {
      const [topicRows] = await connection.query(
        `SELECT id
         FROM curriculum_topics
         WHERE gym_id = ?
           AND id IN (${normalizedTopicIds.map(() => '?').join(', ')})`,
        [gymId, ...normalizedTopicIds]
      );

      if (topicRows.length !== normalizedTopicIds.length) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          message: 'One or more planned topics are not available for this gym'
        });
      }
    }

    await connection.query(
      `UPDATE planned_classes
       SET program_id = ?, training_scenario_id = ?, title = ?, class_date = ?, start_time = ?, end_time = ?, head_coach_user_id = ?, notes = ?
       WHERE id = ? AND gym_id = ?`,
      [
        program_id,
        training_scenario_id || null,
        title || null,
        class_date,
        start_time || null,
        end_time || null,
        head_coach_user_id,
        notes || null,
        id,
        gymId
      ]
    );

    await connection.query(
      'DELETE FROM planned_class_topics WHERE planned_class_id = ?',
      [id]
    );

    for (const topicId of normalizedTopicIds) {
      await connection.query(
        `INSERT INTO planned_class_topics
         (planned_class_id, curriculum_topic_id, focus_level)
         VALUES (?, ?, 'focus')`,
        [id, topicId]
      );
    }

    await connection.commit();
    connection.release();

    return res.status(200).json({
      message: 'Planned class updated successfully'
    });
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
    }
    connection.release();
    console.error('Update planned class error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const deletePlannedClass = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    const [existingRows] = await pool.query(
      'SELECT status FROM planned_classes WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Planned class not found'
      });
    }

    if (existingRows[0].status === 'completed') {
      return res.status(400).json({
        message: 'Completed planned classes can no longer be deleted'
      });
    }

    await pool.query(
      'DELETE FROM planned_classes WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    return res.status(200).json({
      message: 'Planned class deleted successfully'
    });
  } catch (error) {
    console.error('Delete planned class error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const processDuePlannedClasses = async (req, res) => {
  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    const gymId = req.user.gym_id;
    const loggedByUserId = req.user.id;

    await connection.beginTransaction();
    transactionStarted = true;

    const [dueRows] = await connection.query(
      `SELECT *
       FROM planned_classes
       WHERE gym_id = ?
         AND status = 'planned'
         AND (
           (end_time IS NOT NULL AND TIMESTAMP(class_date, end_time) <= NOW())
           OR (end_time IS NULL AND class_date < CURDATE())
         )
       ORDER BY class_date ASC, end_time ASC, created_at ASC
       FOR UPDATE`,
      [gymId]
    );

    const processed = [];

    for (const plannedClass of dueRows) {
      const classId = await completePlannedClassRecord({
        connection,
        gymId,
        plannedClass,
        plannedClassId: plannedClass.id,
        loggedByUserId
      });

      processed.push({
        plannedClassId: plannedClass.id,
        classId
      });
    }

    await connection.commit();
    connection.release();

    return res.status(200).json({
      message: 'Due planned classes processed successfully',
      processedCount: processed.length,
      processed
    });
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
    }
    connection.release();
    console.error('Process due planned classes error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const completePlannedClass = async (req, res) => {
  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    const gymId = req.user.gym_id;
    const loggedByUserId = req.user.id;
    const { id } = req.params;

    await connection.beginTransaction();
    transactionStarted = true;

    const [plannedRows] = await connection.query(
      `SELECT *
       FROM planned_classes
       WHERE id = ? AND gym_id = ?
       FOR UPDATE`,
      [id, gymId]
    );

    if (plannedRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        message: 'Planned class not found'
      });
    }

    const plannedClass = plannedRows[0];

    if (plannedClass.status === 'completed' && plannedClass.completed_class_id) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        message: 'This planned class has already been completed'
      });
    }

    const completedClassId = await completePlannedClassRecord({
      connection,
      gymId,
      plannedClass,
      plannedClassId: id,
      loggedByUserId
    });

    await connection.commit();
    connection.release();

    return res.status(200).json({
      message: 'Planned class completed successfully',
      classId: completedClassId
    });
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
    }
    connection.release();
    console.error('Complete planned class error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getPlannedClasses,
  createPlannedClass,
  updatePlannedClass,
  deletePlannedClass,
  processDuePlannedClasses,
  completePlannedClass
};
