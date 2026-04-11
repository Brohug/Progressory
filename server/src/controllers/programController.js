const pool = require('../config/db');

const createProgram = async (req, res) => {
  try {
    const { name, description } = req.body;
    const gymId = req.user.gym_id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Program name is required'
      });
    }

    const [existingPrograms] = await pool.query(
      'SELECT id FROM programs WHERE gym_id = ? AND name = ?',
      [gymId, name.trim()]
    );

    if (existingPrograms.length > 0) {
      return res.status(400).json({
        message: 'A program with that name already exists for this gym'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO programs (gym_id, name, description) VALUES (?, ?, ?)',
      [gymId, name.trim(), description || null]
    );

    const [rows] = await pool.query(
      'SELECT * FROM programs WHERE id = ? AND gym_id = ?',
      [result.insertId, gymId]
    );

    return res.status(201).json({
      message: 'Program created successfully',
      program: rows[0]
    });
  } catch (error) {
    console.error('Create program error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getPrograms = async (req, res) => {
  try {
    const gymId = req.user.gym_id;

    const [rows] = await pool.query(
      'SELECT * FROM programs WHERE gym_id = ? ORDER BY created_at DESC',
      [gymId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Get programs error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getProgramById = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM programs WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Program not found'
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Get program by ID error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const updateProgram = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const [existingRows] = await pool.query(
      'SELECT * FROM programs WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Program not found'
      });
    }

    const currentProgram = existingRows[0];

    const updatedName = name !== undefined ? name.trim() : currentProgram.name;
    const updatedDescription = description !== undefined ? description : currentProgram.description;
    const updatedIsActive = is_active !== undefined ? is_active : currentProgram.is_active;

    if (!updatedName) {
      return res.status(400).json({
        message: 'Program name cannot be empty'
      });
    }

    const [duplicateRows] = await pool.query(
      'SELECT id FROM programs WHERE gym_id = ? AND name = ? AND id <> ?',
      [gymId, updatedName, id]
    );

    if (duplicateRows.length > 0) {
      return res.status(400).json({
        message: 'Another program with that name already exists for this gym'
      });
    }

    await pool.query(
      `UPDATE programs
       SET name = ?, description = ?, is_active = ?
       WHERE id = ? AND gym_id = ?`,
      [updatedName, updatedDescription, updatedIsActive, id, gymId]
    );

    const [updatedRows] = await pool.query(
      'SELECT * FROM programs WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    return res.status(200).json({
      message: 'Program updated successfully',
      program: updatedRows[0]
    });
  } catch (error) {
    console.error('Update program error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteProgram = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    const [existingRows] = await pool.query(
      'SELECT * FROM programs WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Program not found'
      });
    }

    await pool.query(
      'DELETE FROM programs WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    return res.status(200).json({
      message: 'Program deleted successfully'
    });
  } catch (error) {
    console.error('Delete program error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createProgram,
  getPrograms,
  getProgramById,
  updateProgram,
  deleteProgram
};