const pool = require('../config/db');

const createMember = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const {
      program_id,
      first_name,
      last_name,
      email,
      belt_rank
    } = req.body;

    if (!first_name || !first_name.trim() || !last_name || !last_name.trim()) {
      return res.status(400).json({
        message: 'First name and last name are required'
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

    const [result] = await pool.query(
      `INSERT INTO members
       (gym_id, program_id, first_name, last_name, email, belt_rank)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        gymId,
        program_id ?? null,
        first_name.trim(),
        last_name.trim(),
        email || null,
        belt_rank || null
      ]
    );

    const [rows] = await pool.query(
      `SELECT m.*, p.name AS program_name
       FROM members m
       LEFT JOIN programs p ON m.program_id = p.id
       WHERE m.id = ? AND m.gym_id = ?`,
      [result.insertId, gymId]
    );

    return res.status(201).json({
      message: 'Member created successfully',
      member: rows[0]
    });
  } catch (error) {
    console.error('Create member error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getMembers = async (req, res) => {
  try {
    const gymId = req.user.gym_id;

    const [rows] = await pool.query(
      `SELECT m.*, p.name AS program_name
       FROM members m
       LEFT JOIN programs p ON m.program_id = p.id
       WHERE m.gym_id = ?
       ORDER BY m.created_at DESC`,
      [gymId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Get members error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getMemberById = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT m.*, p.name AS program_name
       FROM members m
       LEFT JOIN programs p ON m.program_id = p.id
       WHERE m.id = ? AND m.gym_id = ?`,
      [id, gymId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Member not found'
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Get member by ID error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const updateMember = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;
    const {
      program_id,
      first_name,
      last_name,
      email,
      belt_rank,
      is_active
    } = req.body;

    const [existingRows] = await pool.query(
      'SELECT * FROM members WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Member not found'
      });
    }

    const currentMember = existingRows[0];

    const updatedProgramId = program_id !== undefined ? program_id : currentMember.program_id;
    const updatedFirstName = first_name !== undefined ? first_name.trim() : currentMember.first_name;
    const updatedLastName = last_name !== undefined ? last_name.trim() : currentMember.last_name;
    const updatedEmail = email !== undefined ? email : currentMember.email;
    const updatedBeltRank = belt_rank !== undefined ? belt_rank : currentMember.belt_rank;
    const updatedIsActive = is_active !== undefined ? is_active : currentMember.is_active;

    if (!updatedFirstName || !updatedLastName) {
      return res.status(400).json({
        message: 'First name and last name cannot be empty'
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

    await pool.query(
      `UPDATE members
       SET program_id = ?, first_name = ?, last_name = ?, email = ?, belt_rank = ?, is_active = ?
       WHERE id = ? AND gym_id = ?`,
      [
        updatedProgramId,
        updatedFirstName,
        updatedLastName,
        updatedEmail,
        updatedBeltRank,
        updatedIsActive,
        id,
        gymId
      ]
    );

    const [updatedRows] = await pool.query(
      `SELECT m.*, p.name AS program_name
       FROM members m
       LEFT JOIN programs p ON m.program_id = p.id
       WHERE m.id = ? AND m.gym_id = ?`,
      [id, gymId]
    );

    return res.status(200).json({
      message: 'Member updated successfully',
      member: updatedRows[0]
    });
  } catch (error) {
    console.error('Update member error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteMember = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    const [existingRows] = await pool.query(
      'SELECT id FROM members WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Member not found'
      });
    }

    await pool.query(
      'DELETE FROM members WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    return res.status(200).json({
      message: 'Member deleted successfully'
    });
  } catch (error) {
    console.error('Delete member error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember
};