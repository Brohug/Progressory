const pool = require('../config/db');

const allowedEntryTypes = [
  'technique',
  'concept',
  'drill',
  'cla_game',
  'video_note'
];

const allowedVisibility = ['coach_only', 'member_visible'];

const createLibraryEntry = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const createdByUserId = req.user.id;

    const {
      program_id,
      curriculum_topic_id,
      title,
      entry_type,
      description,
      video_url,
      visibility
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'Title is required'
      });
    }

    if (!entry_type || !allowedEntryTypes.includes(entry_type)) {
      return res.status(400).json({
        message: 'Invalid entry_type'
      });
    }

    const finalVisibility = visibility || 'coach_only';

    if (!allowedVisibility.includes(finalVisibility)) {
      return res.status(400).json({
        message: 'Invalid visibility'
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

    const [result] = await pool.query(
      `INSERT INTO library_entries
       (gym_id, program_id, curriculum_topic_id, created_by_user_id, title, entry_type, description, video_url, visibility)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        gymId,
        program_id ?? null,
        curriculum_topic_id ?? null,
        createdByUserId,
        title.trim(),
        entry_type,
        description || null,
        video_url || null,
        finalVisibility
      ]
    );

    const [rows] = await pool.query(
      `SELECT le.*,
              p.name AS program_name,
              ct.title AS topic_title,
              u.first_name AS created_by_first_name,
              u.last_name AS created_by_last_name
       FROM library_entries le
       LEFT JOIN programs p ON le.program_id = p.id
       LEFT JOIN curriculum_topics ct ON le.curriculum_topic_id = ct.id
       JOIN users u ON le.created_by_user_id = u.id
       WHERE le.id = ? AND le.gym_id = ?`,
      [result.insertId, gymId]
    );

    return res.status(201).json({
      message: 'Library entry created successfully',
      library_entry: rows[0]
    });
  } catch (error) {
    console.error('Create library entry error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getLibraryEntries = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const isMember = req.user.role === 'member';

    const [rows] = await pool.query(
      `SELECT le.*,
              p.name AS program_name,
              ct.title AS topic_title,
              u.first_name AS created_by_first_name,
              u.last_name AS created_by_last_name
       FROM library_entries le
       LEFT JOIN programs p ON le.program_id = p.id
       LEFT JOIN curriculum_topics ct ON le.curriculum_topic_id = ct.id
       JOIN users u ON le.created_by_user_id = u.id
       WHERE le.gym_id = ?
         AND (? = FALSE OR (le.is_active = TRUE AND le.visibility = 'member_visible'))
       ORDER BY le.created_at DESC`,
      [gymId, isMember]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Get library entries error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getLibraryEntryById = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;
    const isMember = req.user.role === 'member';

    const [rows] = await pool.query(
      `SELECT le.*,
              p.name AS program_name,
              ct.title AS topic_title,
              u.first_name AS created_by_first_name,
              u.last_name AS created_by_last_name
       FROM library_entries le
       LEFT JOIN programs p ON le.program_id = p.id
       LEFT JOIN curriculum_topics ct ON le.curriculum_topic_id = ct.id
       JOIN users u ON le.created_by_user_id = u.id
       WHERE le.id = ? AND le.gym_id = ?
         AND (? = FALSE OR (le.is_active = TRUE AND le.visibility = 'member_visible'))`,
      [id, gymId, isMember]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Library entry not found'
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Get library entry by ID error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const updateLibraryEntry = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    const {
      program_id,
      curriculum_topic_id,
      title,
      entry_type,
      description,
      video_url,
      visibility,
      is_active
    } = req.body;

    const [existingRows] = await pool.query(
      'SELECT * FROM library_entries WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Library entry not found'
      });
    }

    const currentEntry = existingRows[0];

    const updatedProgramId = program_id !== undefined ? program_id : currentEntry.program_id;
    const updatedTopicId =
      curriculum_topic_id !== undefined ? curriculum_topic_id : currentEntry.curriculum_topic_id;
    const updatedTitle = title !== undefined ? title.trim() : currentEntry.title;
    const updatedEntryType = entry_type !== undefined ? entry_type : currentEntry.entry_type;
    const updatedDescription =
      description !== undefined ? description : currentEntry.description;
    const updatedVideoUrl = video_url !== undefined ? video_url : currentEntry.video_url;
    const updatedVisibility =
      visibility !== undefined ? visibility : currentEntry.visibility;
    const updatedIsActive =
      is_active !== undefined ? is_active : currentEntry.is_active;

    if (!updatedTitle) {
      return res.status(400).json({
        message: 'Title cannot be empty'
      });
    }

    if (!allowedEntryTypes.includes(updatedEntryType)) {
      return res.status(400).json({
        message: 'Invalid entry_type'
      });
    }

    if (!allowedVisibility.includes(updatedVisibility)) {
      return res.status(400).json({
        message: 'Invalid visibility'
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

    if (updatedTopicId !== null) {
      const [topicRows] = await pool.query(
        'SELECT id FROM curriculum_topics WHERE id = ? AND gym_id = ?',
        [updatedTopicId, gymId]
      );

      if (topicRows.length === 0) {
        return res.status(400).json({
          message: 'Curriculum topic not found for this gym'
        });
      }
    }

    await pool.query(
      `UPDATE library_entries
       SET program_id = ?, curriculum_topic_id = ?, title = ?, entry_type = ?, description = ?, video_url = ?, visibility = ?, is_active = ?
       WHERE id = ? AND gym_id = ?`,
      [
        updatedProgramId,
        updatedTopicId,
        updatedTitle,
        updatedEntryType,
        updatedDescription,
        updatedVideoUrl,
        updatedVisibility,
        updatedIsActive,
        id,
        gymId
      ]
    );

    const [updatedRows] = await pool.query(
      `SELECT le.*,
              p.name AS program_name,
              ct.title AS topic_title,
              u.first_name AS created_by_first_name,
              u.last_name AS created_by_last_name
       FROM library_entries le
       LEFT JOIN programs p ON le.program_id = p.id
       LEFT JOIN curriculum_topics ct ON le.curriculum_topic_id = ct.id
       JOIN users u ON le.created_by_user_id = u.id
       WHERE le.id = ? AND le.gym_id = ?`,
      [id, gymId]
    );

    return res.status(200).json({
      message: 'Library entry updated successfully',
      library_entry: updatedRows[0]
    });
  } catch (error) {
    console.error('Update library entry error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteLibraryEntry = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    const [existingRows] = await pool.query(
      'SELECT id FROM library_entries WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Library entry not found'
      });
    }

    await pool.query(
      'DELETE FROM library_entries WHERE id = ? AND gym_id = ?',
      [id, gymId]
    );

    return res.status(200).json({
      message: 'Library entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete library entry error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createLibraryEntry,
  getLibraryEntries,
  getLibraryEntryById,
  updateLibraryEntry,
  deleteLibraryEntry
};
