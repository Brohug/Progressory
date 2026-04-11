const pool = require('../config/db');

const createTrainingScenario = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const {
      program_id,
      training_method_id,
      name,
      description,
      starting_position_topic_id,
      top_objective,
      bottom_objective,
      constraints_text,
      round_duration_seconds
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Scenario name is required'
      });
    }

    if (!training_method_id) {
      return res.status(400).json({
        message: 'training_method_id is required'
      });
    }

    const [methodRows] = await pool.query(
      'SELECT id FROM training_methods WHERE id = ? AND gym_id = ?',
      [training_method_id, gymId]
    );

    if (methodRows.length === 0) {
      return res.status(400).json({
        message: 'Training method not found for this gym'
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

    if (starting_position_topic_id !== undefined && starting_position_topic_id !== null) {
      const [topicRows] = await pool.query(
        'SELECT id FROM curriculum_topics WHERE id = ? AND gym_id = ?',
        [starting_position_topic_id, gymId]
      );

      if (topicRows.length === 0) {
        return res.status(400).json({
          message: 'Starting position topic not found for this gym'
        });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO training_scenarios
       (gym_id, program_id, training_method_id, name, description, starting_position_topic_id,
        top_objective, bottom_objective, constraints_text, round_duration_seconds)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        gymId,
        program_id ?? null,
        training_method_id,
        name.trim(),
        description || null,
        starting_position_topic_id ?? null,
        top_objective || null,
        bottom_objective || null,
        constraints_text || null,
        round_duration_seconds ?? null
      ]
    );

    const [rows] = await pool.query(
      `SELECT ts.*,
              p.name AS program_name,
              tm.name AS training_method_name,
              ct.title AS starting_position_title
       FROM training_scenarios ts
       LEFT JOIN programs p ON ts.program_id = p.id
       JOIN training_methods tm ON ts.training_method_id = tm.id
       LEFT JOIN curriculum_topics ct ON ts.starting_position_topic_id = ct.id
       WHERE ts.id = ? AND ts.gym_id = ?`,
      [result.insertId, gymId]
    );

    return res.status(201).json({
      message: 'Training scenario created successfully',
      training_scenario: rows[0]
    });
  } catch (error) {
    console.error('Create training scenario error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getTrainingScenarios = async (req, res) => {
  try {
    const gymId = req.user.gym_id;

    const [rows] = await pool.query(
      `SELECT ts.*,
              p.name AS program_name,
              tm.name AS training_method_name,
              ct.title AS starting_position_title
       FROM training_scenarios ts
       LEFT JOIN programs p ON ts.program_id = p.id
       JOIN training_methods tm ON ts.training_method_id = tm.id
       LEFT JOIN curriculum_topics ct ON ts.starting_position_topic_id = ct.id
       WHERE ts.gym_id = ?
       ORDER BY ts.created_at DESC`,
      [gymId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Get training scenarios error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getTrainingScenarioById = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT ts.*,
              p.name AS program_name,
              tm.name AS training_method_name,
              ct.title AS starting_position_title
       FROM training_scenarios ts
       LEFT JOIN programs p ON ts.program_id = p.id
       JOIN training_methods tm ON ts.training_method_id = tm.id
       LEFT JOIN curriculum_topics ct ON ts.starting_position_topic_id = ct.id
       WHERE ts.id = ? AND ts.gym_id = ?`,
      [id, gymId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Training scenario not found'
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Get training scenario by ID error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const updateTrainingScenario = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;
    const {
      program_id,
      training_method_id,
      name,
      description,
      starting_position_topic_id,
      top_objective,
      bottom_objective,
      constraints_text,
      round_duration_seconds,
      is_active
    } = req.body;

    const [existingRows] = await pool.query(
      'SELECT * FROM training_scenarios WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Training scenario not found'
      });
    }

    const currentScenario = existingRows[0];

    const updatedProgramId = program_id !== undefined ? program_id : currentScenario.program_id;
    const updatedTrainingMethodId = training_method_id !== undefined ? training_method_id : currentScenario.training_method_id;
    const updatedName = name !== undefined ? name.trim() : currentScenario.name;
    const updatedDescription = description !== undefined ? description : currentScenario.description;
    const updatedStartingPositionTopicId =
      starting_position_topic_id !== undefined ? starting_position_topic_id : currentScenario.starting_position_topic_id;
    const updatedTopObjective = top_objective !== undefined ? top_objective : currentScenario.top_objective;
    const updatedBottomObjective = bottom_objective !== undefined ? bottom_objective : currentScenario.bottom_objective;
    const updatedConstraintsText = constraints_text !== undefined ? constraints_text : currentScenario.constraints_text;
    const updatedRoundDurationSeconds =
      round_duration_seconds !== undefined ? round_duration_seconds : currentScenario.round_duration_seconds;
    const updatedIsActive = is_active !== undefined ? is_active : currentScenario.is_active;

    if (!updatedName) {
      return res.status(400).json({
        message: 'Scenario name cannot be empty'
      });
    }

    const [methodRows] = await pool.query(
      'SELECT id FROM training_methods WHERE id = ? AND gym_id = ?',
      [updatedTrainingMethodId, gymId]
    );

    if (methodRows.length === 0) {
      return res.status(400).json({
        message: 'Training method not found for this gym'
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

    if (updatedStartingPositionTopicId !== null) {
      const [topicRows] = await pool.query(
        'SELECT id FROM curriculum_topics WHERE id = ? AND gym_id = ?',
        [updatedStartingPositionTopicId, gymId]
      );

      if (topicRows.length === 0) {
        return res.status(400).json({
          message: 'Starting position topic not found for this gym'
        });
      }
    }

    await pool.query(
      `UPDATE training_scenarios
       SET program_id = ?, training_method_id = ?, name = ?, description = ?, starting_position_topic_id = ?,
           top_objective = ?, bottom_objective = ?, constraints_text = ?, round_duration_seconds = ?, is_active = ?
       WHERE id = ? AND gym_id = ?`,
      [
        updatedProgramId,
        updatedTrainingMethodId,
        updatedName,
        updatedDescription,
        updatedStartingPositionTopicId,
        updatedTopObjective,
        updatedBottomObjective,
        updatedConstraintsText,
        updatedRoundDurationSeconds,
        updatedIsActive,
        id,
        gymId
      ]
    );

    const [updatedRows] = await pool.query(
      `SELECT ts.*,
              p.name AS program_name,
              tm.name AS training_method_name,
              ct.title AS starting_position_title
       FROM training_scenarios ts
       LEFT JOIN programs p ON ts.program_id = p.id
       JOIN training_methods tm ON ts.training_method_id = tm.id
       LEFT JOIN curriculum_topics ct ON ts.starting_position_topic_id = ct.id
       WHERE ts.id = ? AND ts.gym_id = ?`,
      [id, gymId]
    );

    return res.status(200).json({
      message: 'Training scenario updated successfully',
      training_scenario: updatedRows[0]
    });
  } catch (error) {
    console.error('Update training scenario error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteTrainingScenario = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    const [existingRows] = await pool.query(
      'SELECT * FROM training_scenarios WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Training scenario not found'
      });
    }

    await pool.query(
      'DELETE FROM training_scenarios WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    return res.status(200).json({
      message: 'Training scenario deleted successfully'
    });
  } catch (error) {
    console.error('Delete training scenario error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createTrainingScenario,
  getTrainingScenarios,
  getTrainingScenarioById,
  updateTrainingScenario,
  deleteTrainingScenario
};