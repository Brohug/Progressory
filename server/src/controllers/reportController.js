const pool = require('../config/db');

const isMissingClassArchiveSchemaError = (error) => (
  Boolean(error)
  && error.code === 'ER_BAD_FIELD_ERROR'
  && /archived_at/i.test(error.sqlMessage || error.message || '')
);

const getRecentClasses = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const limit = Number(req.query.limit) || 10;

    const [rows] = await pool.query(
      `SELECT c.id,
              c.title,
              c.class_date,
              c.start_time,
              c.end_time,
              c.notes,
              p.name AS program_name,
              hc.first_name AS head_coach_first_name,
              hc.last_name AS head_coach_last_name
       FROM classes c
       JOIN programs p ON c.program_id = p.id
       JOIN users hc ON c.head_coach_user_id = hc.id
       WHERE c.gym_id = ?
         AND c.archived_at IS NULL
       ORDER BY c.class_date DESC, c.created_at DESC
       LIMIT ?`,
      [gymId, limit]
    );

    return res.status(200).json(rows);
  } catch (error) {
    if (isMissingClassArchiveSchemaError(error)) {
      return res.status(500).json({
        message: 'Class archive schema is missing. Run database migrations and try again.'
      });
    }

    console.error('Get recent classes report error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const getTopicCoverage = async (req, res) => {
  try {
    const gymId = req.user.gym_id;

    const [rows] = await pool.query(
      `SELECT ct.id AS topic_id,
              ct.title AS topic_title,
              ct.topic_type,
              p.name AS program_name,
              COUNT(class_topic.id) AS total_times_used,
              SUM(CASE WHEN class_topic.coverage_type = 'taught' THEN 1 ELSE 0 END) AS taught_count,
              SUM(CASE WHEN class_topic.coverage_type = 'reviewed' THEN 1 ELSE 0 END) AS reviewed_count,
              SUM(CASE WHEN class_topic.focus_level = 'focus' THEN 1 ELSE 0 END) AS focus_count,
              SUM(CASE WHEN class_topic.focus_level = 'secondary' THEN 1 ELSE 0 END) AS secondary_count,
              SUM(CASE WHEN class_topic.focus_level = 'review' THEN 1 ELSE 0 END) AS review_focus_count
       FROM curriculum_topics ct
       LEFT JOIN programs p ON ct.program_id = p.id
       LEFT JOIN class_topics class_topic
         ON ct.id = class_topic.curriculum_topic_id
        AND class_topic.archived_at IS NULL
       LEFT JOIN classes c ON class_topic.class_id = c.id AND c.archived_at IS NULL
       WHERE ct.gym_id = ?
       GROUP BY ct.id, ct.title, ct.topic_type, p.name
       ORDER BY total_times_used DESC, ct.title ASC`,
      [gymId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    if (isMissingClassArchiveSchemaError(error)) {
      return res.status(500).json({
        message: 'Class archive schema is missing. Run database migrations and try again.'
      });
    }

    console.error('Get topic coverage report error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const getNeglectedTopics = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const days = Number(req.query.days) || 30;

    const [rows] = await pool.query(
      `SELECT ct.id AS topic_id,
              ct.title AS topic_title,
              ct.topic_type,
              p.name AS program_name,
              MAX(c.class_date) AS last_used_date
       FROM curriculum_topics ct
       LEFT JOIN programs p ON ct.program_id = p.id
       LEFT JOIN class_topics class_topic
         ON ct.id = class_topic.curriculum_topic_id
        AND class_topic.archived_at IS NULL
       LEFT JOIN classes c ON class_topic.class_id = c.id AND c.archived_at IS NULL
       WHERE ct.gym_id = ?
       GROUP BY ct.id, ct.title, ct.topic_type, p.name
       HAVING last_used_date IS NULL
          OR last_used_date < (CURDATE() - INTERVAL ? DAY)
       ORDER BY last_used_date IS NULL DESC, last_used_date ASC, ct.title ASC`,
      [gymId, days]
    );

    return res.status(200).json(rows);
  } catch (error) {
    if (isMissingClassArchiveSchemaError(error)) {
      return res.status(500).json({
        message: 'Class archive schema is missing. Run database migrations and try again.'
      });
    }

    console.error('Get neglected topics report error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const getTrainingMethodUsage = async (req, res) => {
  try {
    const gymId = req.user.gym_id;

    const [rows] = await pool.query(
      `SELECT tm.id AS training_method_id,
              tm.name AS training_method_name,
              tm.description,
              COUNT(cte.id) AS total_segments,
              COALESCE(SUM(cte.duration_minutes), 0) AS total_duration_minutes
       FROM training_methods tm
       LEFT JOIN class_training_entries cte
         ON tm.id = cte.training_method_id
        AND cte.archived_at IS NULL
       LEFT JOIN classes c ON cte.class_id = c.id AND c.archived_at IS NULL
       WHERE tm.gym_id = ?
       GROUP BY tm.id, tm.name, tm.description
       ORDER BY total_segments DESC, tm.name ASC`,
      [gymId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    if (isMissingClassArchiveSchemaError(error)) {
      return res.status(500).json({
        message: 'Class archive schema is missing. Run database migrations and try again.'
      });
    }

    console.error('Get training method usage report error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const getRecentTopicSignals = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const limit = Number(req.query.limit) || 12;

    const [rows] = await pool.query(
      `SELECT c.id AS class_id,
              c.title AS class_title,
              c.class_date,
              ct.id AS topic_id,
              ct.title AS topic_title,
              ct.topic_type,
              ct.program_id,
              p.name AS program_name,
              class_topic.focus_level,
              class_topic.coverage_type
       FROM classes c
       JOIN class_topics class_topic
         ON c.id = class_topic.class_id
        AND class_topic.archived_at IS NULL
       JOIN curriculum_topics ct ON class_topic.curriculum_topic_id = ct.id
       LEFT JOIN programs p ON ct.program_id = p.id
       WHERE c.gym_id = ?
         AND c.archived_at IS NULL
       ORDER BY c.class_date DESC, c.created_at DESC, class_topic.id DESC
       LIMIT ?`,
      [gymId, limit]
    );

    return res.status(200).json(rows);
  } catch (error) {
    if (isMissingClassArchiveSchemaError(error)) {
      return res.status(500).json({
        message: 'Class archive schema is missing. Run database migrations and try again.'
      });
    }

    console.error('Get recent topic signals report error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

module.exports = {
  getRecentClasses,
  getTopicCoverage,
  getNeglectedTopics,
  getTrainingMethodUsage,
  getRecentTopicSignals
};
