const pool = require('../config/db');

const getTrainingScenarios = async (req, res) => {
  try {
    const gymId = req.user.gym_id;

    const [rows] = await pool.query(
      `SELECT
        ts.id,
        ts.gym_id,
        ts.program_id,
        ts.training_method_id,
        ts.name,
        ts.description,
        ts.starting_position_topic_id,
        ts.top_objective,
        ts.bottom_objective,
        ts.constraints_text,
        ts.round_duration_seconds,
        ts.is_active,
        ts.created_at,
        ts.updated_at,
        p.name AS program_name,
        tm.name AS training_method_name,
        ct.title AS starting_position_title
      FROM training_scenarios ts
      LEFT JOIN programs p ON ts.program_id = p.id
      INNER JOIN training_methods tm ON ts.training_method_id = tm.id
      LEFT JOIN curriculum_topics ct ON ts.starting_position_topic_id = ct.id
      WHERE ts.gym_id = ?
      ORDER BY ts.is_active DESC, ts.created_at DESC`,
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

    if (!training_method_id || !name || !name.trim()) {
      return res.status(400).json({
        message: 'training_method_id and name are required'
      });
    }

    const trimmedName = name.trim();

    const [duplicateRows] = await pool.query(
      `SELECT id
       FROM training_scenarios
       WHERE gym_id = ?
         AND training_method_id = ?
         AND COALESCE(program_id, 0) = COALESCE(?, 0)
         AND LOWER(name) = LOWER(?)
         AND is_active = TRUE`,
      [gymId, training_method_id, program_id || null, trimmedName]
    );

    if (duplicateRows.length > 0) {
      return res.status(400).json({
        message:
          'A training scenario with this name already exists for this program and training method.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO training_scenarios
      (
        gym_id,
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
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        gymId,
        program_id || null,
        training_method_id,
        trimmedName,
        description || null,
        starting_position_topic_id || null,
        top_objective || null,
        bottom_objective || null,
        constraints_text || null,
        round_duration_seconds || null
      ]
    );

    const [rows] = await pool.query(
      `SELECT
        ts.id,
        ts.gym_id,
        ts.program_id,
        ts.training_method_id,
        ts.name,
        ts.description,
        ts.starting_position_topic_id,
        ts.top_objective,
        ts.bottom_objective,
        ts.constraints_text,
        ts.round_duration_seconds,
        ts.is_active,
        ts.created_at,
        ts.updated_at,
        p.name AS program_name,
        tm.name AS training_method_name,
        ct.title AS starting_position_title
      FROM training_scenarios ts
      LEFT JOIN programs p ON ts.program_id = p.id
      INNER JOIN training_methods tm ON ts.training_method_id = tm.id
      LEFT JOIN curriculum_topics ct ON ts.starting_position_topic_id = ct.id
      WHERE ts.id = ? AND ts.gym_id = ?`,
      [result.insertId, gymId]
    );

    return res.status(201).json({
      message: 'Training scenario created successfully',
      trainingScenario: rows[0]
    });
  } catch (error) {
    console.error('Create training scenario error:', error.message);

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
      `SELECT * FROM training_scenarios WHERE id = ? AND gym_id = ?`,
      [id, gymId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Training scenario not found' });
    }

    const current = existingRows[0];

    const nextProgramId =
      program_id !== undefined ? program_id || null : current.program_id;
    const nextMethodId =
      training_method_id !== undefined ? training_method_id : current.training_method_id;
    const nextName =
      name !== undefined ? name.trim() : current.name;
    const nextDescription =
      description !== undefined ? description || null : current.description;
    const nextStartingTopicId =
      starting_position_topic_id !== undefined
        ? starting_position_topic_id || null
        : current.starting_position_topic_id;
    const nextTopObjective =
      top_objective !== undefined ? top_objective || null : current.top_objective;
    const nextBottomObjective =
      bottom_objective !== undefined ? bottom_objective || null : current.bottom_objective;
    const nextConstraints =
      constraints_text !== undefined ? constraints_text || null : current.constraints_text;
    const nextDuration =
      round_duration_seconds !== undefined
        ? round_duration_seconds || null
        : current.round_duration_seconds;
    const nextIsActive =
      is_active !== undefined ? Boolean(is_active) : Boolean(current.is_active);

    if (!nextMethodId || !nextName) {
      return res.status(400).json({
        message: 'training_method_id and name are required'
      });
    }

    const identityUnchanged =
      String(current.program_id ?? '') === String(nextProgramId ?? '') &&
      String(current.training_method_id) === String(nextMethodId) &&
      String(current.name).trim().toLowerCase() === String(nextName).trim().toLowerCase();

    if (!identityUnchanged) {
      const [duplicateRows] = await pool.query(
        `SELECT id
         FROM training_scenarios
         WHERE gym_id = ?
           AND training_method_id = ?
           AND COALESCE(program_id, 0) = COALESCE(?, 0)
           AND LOWER(name) = LOWER(?)
           AND id <> ?`,
        [gymId, nextMethodId, nextProgramId, nextName, id]
      );

      if (duplicateRows.length > 0) {
        return res.status(400).json({
          message:
            'A training scenario with this name already exists for this program and training method.'
        });
      }
    }

    await pool.query(
      `UPDATE training_scenarios
       SET
         program_id = ?,
         training_method_id = ?,
         name = ?,
         description = ?,
         starting_position_topic_id = ?,
         top_objective = ?,
         bottom_objective = ?,
         constraints_text = ?,
         round_duration_seconds = ?,
         is_active = ?
       WHERE id = ? AND gym_id = ?`,
      [
        nextProgramId,
        nextMethodId,
        nextName,
        nextDescription,
        nextStartingTopicId,
        nextTopObjective,
        nextBottomObjective,
        nextConstraints,
        nextDuration,
        nextIsActive,
        id,
        gymId
      ]
    );

    const [rows] = await pool.query(
      `SELECT
        ts.id,
        ts.gym_id,
        ts.program_id,
        ts.training_method_id,
        ts.name,
        ts.description,
        ts.starting_position_topic_id,
        ts.top_objective,
        ts.bottom_objective,
        ts.constraints_text,
        ts.round_duration_seconds,
        ts.is_active,
        ts.created_at,
        ts.updated_at,
        p.name AS program_name,
        tm.name AS training_method_name,
        ct.title AS starting_position_title
      FROM training_scenarios ts
      LEFT JOIN programs p ON ts.program_id = p.id
      INNER JOIN training_methods tm ON ts.training_method_id = tm.id
      LEFT JOIN curriculum_topics ct ON ts.starting_position_topic_id = ct.id
      WHERE ts.id = ? AND ts.gym_id = ?`,
      [id, gymId]
    );

    return res.status(200).json({
      message: 'Training scenario updated successfully',
      trainingScenario: rows[0]
    });
  } catch (error) {
    console.error('Update training scenario error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const deactivateTrainingScenario = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    const [existingRows] = await pool.query(
      `SELECT id FROM training_scenarios WHERE id = ? AND gym_id = ?`,
      [id, gymId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Training scenario not found'
      });
    }

    await pool.query(
      `UPDATE training_scenarios
       SET is_active = FALSE
       WHERE id = ? AND gym_id = ?`,
      [id, gymId]
    );

    return res.status(200).json({
      message: 'Training scenario deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate training scenario error:', error.message);

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
      'SELECT id FROM training_scenarios WHERE id = ? AND gym_id = ?',
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
  getTrainingScenarios,
  createTrainingScenario,
  updateTrainingScenario,
  deactivateTrainingScenario,
  deleteTrainingScenario
};
