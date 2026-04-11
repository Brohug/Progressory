const pool = require('../config/db');

const createTrainingMethod = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Training method name is required'
      });
    }

    const [existingRows] = await pool.query(
      'SELECT id FROM training_methods WHERE gym_id = ? AND name = ?',
      [gymId, name.trim()]
    );

    if (existingRows.length > 0) {
      return res.status(400).json({
        message: 'A training method with that name already exists for this gym'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO training_methods (gym_id, name, description) VALUES (?, ?, ?)',
      [gymId, name.trim(), description || null]
    );

    const [rows] = await pool.query(
      'SELECT * FROM training_methods WHERE id = ? AND gym_id = ?',
      [result.insertId, gymId]
    );

    return res.status(201).json({
      message: 'Training method created successfully',
      training_method: rows[0]
    });
  } catch (error) {
    console.error('Create training method error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getTrainingMethods = async (req, res) => {
  try {
    const gymId = req.user.gym_id;

    const [rows] = await pool.query(
      'SELECT * FROM training_methods WHERE gym_id = ? ORDER BY created_at DESC',
      [gymId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Get training methods error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getTrainingMethodById = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM training_methods WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Training method not found'
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Get training method by ID error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const updateTrainingMethod = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const [existingRows] = await pool.query(
      'SELECT * FROM training_methods WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Training method not found'
      });
    }

    const currentMethod = existingRows[0];

    const updatedName = name !== undefined ? name.trim() : currentMethod.name;
    const updatedDescription = description !== undefined ? description : currentMethod.description;
    const updatedIsActive = is_active !== undefined ? is_active : currentMethod.is_active;

    if (!updatedName) {
      return res.status(400).json({
        message: 'Training method name cannot be empty'
      });
    }

    const [duplicateRows] = await pool.query(
      'SELECT id FROM training_methods WHERE gym_id = ? AND name = ? AND id <> ?',
      [gymId, updatedName, id]
    );

    if (duplicateRows.length > 0) {
      return res.status(400).json({
        message: 'Another training method with that name already exists for this gym'
      });
    }

    await pool.query(
      `UPDATE training_methods
       SET name = ?, description = ?, is_active = ?
       WHERE id = ? AND gym_id = ?`,
      [updatedName, updatedDescription, updatedIsActive, id, gymId]
    );

    const [updatedRows] = await pool.query(
      'SELECT * FROM training_methods WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    return res.status(200).json({
      message: 'Training method updated successfully',
      training_method: updatedRows[0]
    });
  } catch (error) {
    console.error('Update training method error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteTrainingMethod = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    const [existingRows] = await pool.query(
      'SELECT * FROM training_methods WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Training method not found'
      });
    }

    await pool.query(
      'DELETE FROM training_methods WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    return res.status(200).json({
      message: 'Training method deleted successfully'
    });
  } catch (error) {
    console.error('Delete training method error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createTrainingMethod,
  getTrainingMethods,
  getTrainingMethodById,
  updateTrainingMethod,
  deleteTrainingMethod
};