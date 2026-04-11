const pool = require('../config/db');

const allowedTopicTypes = [
  'position',
  'technique',
  'concept',
  'submission',
  'escape',
  'takedown',
  'drill_theme'
];

const createTopic = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const {
      program_id,
      parent_topic_id,
      title,
      topic_type,
      description
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'Topic title is required'
      });
    }

    if (!topic_type || !allowedTopicTypes.includes(topic_type)) {
      return res.status(400).json({
        message: 'Invalid topic_type'
      });
    }

    if (program_id !== undefined && program_id !== null) {
      const [programRows] = await pool.query(
        'SELECT id FROM programs WHERE id = ? AND gym_id = ?',
        [program_id, gymId]
      );

      if (programRows.length === 0) {
        return res.status(400).json({
          message: 'Program not found for this gym'
        });
      }
    }

    if (parent_topic_id !== undefined && parent_topic_id !== null) {
      const [parentRows] = await pool.query(
        'SELECT id FROM curriculum_topics WHERE id = ? AND gym_id = ?',
        [parent_topic_id, gymId]
      );

      if (parentRows.length === 0) {
        return res.status(400).json({
          message: 'Parent topic not found for this gym'
        });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO curriculum_topics
       (gym_id, program_id, parent_topic_id, title, topic_type, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        gymId,
        program_id ?? null,
        parent_topic_id ?? null,
        title.trim(),
        topic_type,
        description || null
      ]
    );

    const [rows] = await pool.query(
      'SELECT * FROM curriculum_topics WHERE id = ? AND gym_id = ?',
      [result.insertId, gymId]
    );

    return res.status(201).json({
      message: 'Topic created successfully',
      topic: rows[0]
    });
  } catch (error) {
    console.error('Create topic error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getTopics = async (req, res) => {
  try {
    const gymId = req.user.gym_id;

    const [rows] = await pool.query(
      `SELECT ct.*,
              p.name AS program_name,
              parent.title AS parent_topic_title
       FROM curriculum_topics ct
       LEFT JOIN programs p ON ct.program_id = p.id
       LEFT JOIN curriculum_topics parent ON ct.parent_topic_id = parent.id
       WHERE ct.gym_id = ?
       ORDER BY ct.created_at DESC`,
      [gymId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Get topics error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getTopicById = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT ct.*,
              p.name AS program_name,
              parent.title AS parent_topic_title
       FROM curriculum_topics ct
       LEFT JOIN programs p ON ct.program_id = p.id
       LEFT JOIN curriculum_topics parent ON ct.parent_topic_id = parent.id
       WHERE ct.id = ? AND ct.gym_id = ?`,
      [id, gymId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Topic not found'
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Get topic by ID error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const updateTopic = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;
    const {
      program_id,
      parent_topic_id,
      title,
      topic_type,
      description,
      is_active
    } = req.body;

    const [existingRows] = await pool.query(
      'SELECT * FROM curriculum_topics WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Topic not found'
      });
    }

    const currentTopic = existingRows[0];

    const updatedTitle = title !== undefined ? title.trim() : currentTopic.title;
    const updatedTopicType = topic_type !== undefined ? topic_type : currentTopic.topic_type;
    const updatedDescription = description !== undefined ? description : currentTopic.description;
    const updatedIsActive = is_active !== undefined ? is_active : currentTopic.is_active;
    const updatedProgramId = program_id !== undefined ? program_id : currentTopic.program_id;
    const updatedParentTopicId = parent_topic_id !== undefined ? parent_topic_id : currentTopic.parent_topic_id;

    if (!updatedTitle) {
      return res.status(400).json({
        message: 'Topic title cannot be empty'
      });
    }

    if (!allowedTopicTypes.includes(updatedTopicType)) {
      return res.status(400).json({
        message: 'Invalid topic_type'
      });
    }

    if (updatedProgramId !== null) {
      const [programRows] = await pool.query(
        'SELECT id FROM programs WHERE id = ? AND gym_id = ?',
        [updatedProgramId, gymId]
      );

      if (programRows.length === 0) {
        return res.status(400).json({
          message: 'Program not found for this gym'
        });
      }
    }

    if (updatedParentTopicId !== null) {
      if (Number(updatedParentTopicId) === Number(id)) {
        return res.status(400).json({
          message: 'A topic cannot be its own parent'
        });
      }

      const [parentRows] = await pool.query(
        'SELECT id FROM curriculum_topics WHERE id = ? AND gym_id = ?',
        [updatedParentTopicId, gymId]
      );

      if (parentRows.length === 0) {
        return res.status(400).json({
          message: 'Parent topic not found for this gym'
        });
      }
    }

    await pool.query(
      `UPDATE curriculum_topics
       SET program_id = ?, parent_topic_id = ?, title = ?, topic_type = ?, description = ?, is_active = ?
       WHERE id = ? AND gym_id = ?`,
      [
        updatedProgramId,
        updatedParentTopicId,
        updatedTitle,
        updatedTopicType,
        updatedDescription,
        updatedIsActive,
        id,
        gymId
      ]
    );

    const [updatedRows] = await pool.query(
      `SELECT ct.*,
              p.name AS program_name,
              parent.title AS parent_topic_title
       FROM curriculum_topics ct
       LEFT JOIN programs p ON ct.program_id = p.id
       LEFT JOIN curriculum_topics parent ON ct.parent_topic_id = parent.id
       WHERE ct.id = ? AND ct.gym_id = ?`,
      [id, gymId]
    );

    return res.status(200).json({
      message: 'Topic updated successfully',
      topic: updatedRows[0]
    });
  } catch (error) {
    console.error('Update topic error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteTopic = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    const [existingRows] = await pool.query(
      'SELECT * FROM curriculum_topics WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Topic not found'
      });
    }

    await pool.query(
      'DELETE FROM curriculum_topics WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    return res.status(200).json({
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    console.error('Delete topic error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createTopic,
  getTopics,
  getTopicById,
  updateTopic,
  deleteTopic
};