const pool = require('../config/db');

let ensureEntrySetupExamplesTablePromise = null;

const ensureEntrySetupExamplesTable = async () => {
  if (!ensureEntrySetupExamplesTablePromise) {
    ensureEntrySetupExamplesTablePromise = pool.query(`
      CREATE TABLE IF NOT EXISTS entry_setup_examples (
        id INT AUTO_INCREMENT PRIMARY KEY,
        gym_id INT NOT NULL,
        created_by_user_id INT NOT NULL,
        linked_family_title VARCHAR(255) NULL,
        title VARCHAR(255) NOT NULL,
        lane VARCHAR(50) NOT NULL,
        summary TEXT NULL,
        description TEXT NULL,
        setup_nodes_json LONGTEXT NULL,
        next_attacks_json LONGTEXT NULL,
        example_sequence_json LONGTEXT NULL,
        curriculum_search VARCHAR(255) NULL,
        tree_search VARCHAR(255) NULL,
        visibility ENUM('private', 'gym_shared') NOT NULL DEFAULT 'private',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_entry_setup_examples_gym_visibility (gym_id, visibility),
        INDEX idx_entry_setup_examples_creator (created_by_user_id)
      )
    `);
  }

  await ensureEntrySetupExamplesTablePromise;
};

const normalizeString = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed || null;
};

const normalizeStringList = (value) => {
  if (!value) {
    return [];
  }

  const source = Array.isArray(value) ? value : [value];

  return source
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 12);
};

const parseJsonArray = (value) => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.map((item) => String(item || '').trim()).filter(Boolean)
      : [];
  } catch {
    return [];
  }
};

const serializeExampleRow = (row) => ({
  id: row.id,
  gym_id: row.gym_id,
  created_by_user_id: row.created_by_user_id,
  created_by_name: row.created_by_name,
  linked_family_title: row.linked_family_title,
  title: row.title,
  lane: row.lane,
  summary: row.summary,
  description: row.description,
  setup_nodes: parseJsonArray(row.setup_nodes_json),
  next_attacks: parseJsonArray(row.next_attacks_json),
  example_sequence: parseJsonArray(row.example_sequence_json),
  curriculum_search: row.curriculum_search,
  tree_search: row.tree_search,
  visibility: row.visibility,
  is_active: Boolean(row.is_active),
  created_at: row.created_at,
  updated_at: row.updated_at
});

const getEntrySetupExamples = async (req, res) => {
  try {
    await ensureEntrySetupExamplesTable();

    const [rows] = await pool.query(
      `SELECT
        ese.id,
        ese.gym_id,
        ese.created_by_user_id,
        ese.linked_family_title,
        ese.title,
        ese.lane,
        ese.summary,
        ese.description,
        ese.setup_nodes_json,
        ese.next_attacks_json,
        ese.example_sequence_json,
        ese.curriculum_search,
        ese.tree_search,
        ese.visibility,
        ese.is_active,
        ese.created_at,
        ese.updated_at,
        CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS created_by_name
      FROM entry_setup_examples ese
      INNER JOIN users u ON u.id = ese.created_by_user_id AND u.gym_id = ese.gym_id
      WHERE ese.gym_id = ?
        AND ese.is_active = TRUE
        AND (
          ese.visibility = 'gym_shared'
          OR ese.created_by_user_id = ?
        )
      ORDER BY
        CASE WHEN ese.visibility = 'gym_shared' THEN 0 ELSE 1 END,
        ese.updated_at DESC`,
      [req.user.gym_id, req.user.id]
    );

    return res.status(200).json(rows.map(serializeExampleRow));
  } catch (error) {
    console.error('Get entry setup examples error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const createEntrySetupExample = async (req, res) => {
  try {
    await ensureEntrySetupExamplesTable();

    const title = normalizeString(req.body.title);
    const lane = normalizeString(req.body.lane);

    if (!title || !lane) {
      return res.status(400).json({
        message: 'title and lane are required'
      });
    }

    const linkedFamilyTitle = normalizeString(req.body.linked_family_title);
    const summary = normalizeString(req.body.summary);
    const description = normalizeString(req.body.description);
    const setupNodes = normalizeStringList(req.body.setup_nodes);
    const nextAttacks = normalizeStringList(req.body.next_attacks);
    const exampleSequence = normalizeStringList(req.body.example_sequence);
    const curriculumSearch = normalizeString(req.body.curriculum_search);
    const treeSearch = normalizeString(req.body.tree_search);
    const visibility = req.user.role === 'owner' && req.body.visibility === 'gym_shared'
      ? 'gym_shared'
      : 'private';

    const [duplicateRows] = await pool.query(
      `SELECT id
       FROM entry_setup_examples
       WHERE gym_id = ?
         AND created_by_user_id = ?
         AND LOWER(title) = LOWER(?)
         AND is_active = TRUE`,
      [req.user.gym_id, req.user.id, title]
    );

    if (duplicateRows.length > 0) {
      return res.status(400).json({
        message: 'You already have a saved setup example with this title.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO entry_setup_examples (
        gym_id,
        created_by_user_id,
        linked_family_title,
        title,
        lane,
        summary,
        description,
        setup_nodes_json,
        next_attacks_json,
        example_sequence_json,
        curriculum_search,
        tree_search,
        visibility,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        req.user.gym_id,
        req.user.id,
        linkedFamilyTitle,
        title,
        lane,
        summary,
        description,
        JSON.stringify(setupNodes),
        JSON.stringify(nextAttacks),
        JSON.stringify(exampleSequence),
        curriculumSearch,
        treeSearch,
        visibility
      ]
    );

    const [rows] = await pool.query(
      `SELECT
        ese.id,
        ese.gym_id,
        ese.created_by_user_id,
        ese.linked_family_title,
        ese.title,
        ese.lane,
        ese.summary,
        ese.description,
        ese.setup_nodes_json,
        ese.next_attacks_json,
        ese.example_sequence_json,
        ese.curriculum_search,
        ese.tree_search,
        ese.visibility,
        ese.is_active,
        ese.created_at,
        ese.updated_at,
        CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS created_by_name
      FROM entry_setup_examples ese
      INNER JOIN users u ON u.id = ese.created_by_user_id AND u.gym_id = ese.gym_id
      WHERE ese.id = ? AND ese.gym_id = ?`,
      [result.insertId, req.user.gym_id]
    );

    return res.status(201).json({
      message: 'Setup example saved successfully',
      entrySetupExample: serializeExampleRow(rows[0])
    });
  } catch (error) {
    console.error('Create entry setup example error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const updateEntrySetupExample = async (req, res) => {
  try {
    await ensureEntrySetupExamplesTable();

    const { id } = req.params;

    const [existingRows] = await pool.query(
      `SELECT *
       FROM entry_setup_examples
       WHERE id = ? AND gym_id = ?`,
      [id, req.user.gym_id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Setup example not found'
      });
    }

    const current = existingRows[0];

    if (String(current.created_by_user_id) !== String(req.user.id)) {
      return res.status(403).json({
        message: 'Only the person who created this setup example can change it.'
      });
    }

    const title = normalizeString(req.body.title) || current.title;
    const lane = normalizeString(req.body.lane) || current.lane;
    const linkedFamilyTitle = req.body.linked_family_title !== undefined
      ? normalizeString(req.body.linked_family_title)
      : current.linked_family_title;
    const summary = req.body.summary !== undefined
      ? normalizeString(req.body.summary)
      : current.summary;
    const description = req.body.description !== undefined
      ? normalizeString(req.body.description)
      : current.description;
    const setupNodes = req.body.setup_nodes !== undefined
      ? normalizeStringList(req.body.setup_nodes)
      : parseJsonArray(current.setup_nodes_json);
    const nextAttacks = req.body.next_attacks !== undefined
      ? normalizeStringList(req.body.next_attacks)
      : parseJsonArray(current.next_attacks_json);
    const exampleSequence = req.body.example_sequence !== undefined
      ? normalizeStringList(req.body.example_sequence)
      : parseJsonArray(current.example_sequence_json);
    const curriculumSearch = req.body.curriculum_search !== undefined
      ? normalizeString(req.body.curriculum_search)
      : current.curriculum_search;
    const treeSearch = req.body.tree_search !== undefined
      ? normalizeString(req.body.tree_search)
      : current.tree_search;
    const visibility = req.user.role === 'owner' && req.body.visibility === 'gym_shared'
      ? 'gym_shared'
      : 'private';

    const [duplicateRows] = await pool.query(
      `SELECT id
       FROM entry_setup_examples
       WHERE gym_id = ?
         AND created_by_user_id = ?
         AND LOWER(title) = LOWER(?)
         AND id <> ?
         AND is_active = TRUE`,
      [req.user.gym_id, req.user.id, title, id]
    );

    if (duplicateRows.length > 0) {
      return res.status(400).json({
        message: 'You already have another saved setup example with this title.'
      });
    }

    await pool.query(
      `UPDATE entry_setup_examples
       SET
         linked_family_title = ?,
         title = ?,
         lane = ?,
         summary = ?,
         description = ?,
         setup_nodes_json = ?,
         next_attacks_json = ?,
         example_sequence_json = ?,
         curriculum_search = ?,
         tree_search = ?,
         visibility = ?
       WHERE id = ? AND gym_id = ?`,
      [
        linkedFamilyTitle,
        title,
        lane,
        summary,
        description,
        JSON.stringify(setupNodes),
        JSON.stringify(nextAttacks),
        JSON.stringify(exampleSequence),
        curriculumSearch,
        treeSearch,
        visibility,
        id,
        req.user.gym_id
      ]
    );

    const [rows] = await pool.query(
      `SELECT
        ese.id,
        ese.gym_id,
        ese.created_by_user_id,
        ese.linked_family_title,
        ese.title,
        ese.lane,
        ese.summary,
        ese.description,
        ese.setup_nodes_json,
        ese.next_attacks_json,
        ese.example_sequence_json,
        ese.curriculum_search,
        ese.tree_search,
        ese.visibility,
        ese.is_active,
        ese.created_at,
        ese.updated_at,
        CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS created_by_name
      FROM entry_setup_examples ese
      INNER JOIN users u ON u.id = ese.created_by_user_id AND u.gym_id = ese.gym_id
      WHERE ese.id = ? AND ese.gym_id = ?`,
      [id, req.user.gym_id]
    );

    return res.status(200).json({
      message: 'Setup example updated successfully',
      entrySetupExample: serializeExampleRow(rows[0])
    });
  } catch (error) {
    console.error('Update entry setup example error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteEntrySetupExample = async (req, res) => {
  try {
    await ensureEntrySetupExamplesTable();

    const { id } = req.params;

    const [existingRows] = await pool.query(
      `SELECT id, created_by_user_id
       FROM entry_setup_examples
       WHERE id = ? AND gym_id = ?`,
      [id, req.user.gym_id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Setup example not found'
      });
    }

    if (String(existingRows[0].created_by_user_id) !== String(req.user.id)) {
      return res.status(403).json({
        message: 'Only the person who created this setup example can delete it.'
      });
    }

    await pool.query(
      `DELETE FROM entry_setup_examples
       WHERE id = ? AND gym_id = ?`,
      [id, req.user.gym_id]
    );

    return res.status(200).json({
      message: 'Setup example deleted successfully'
    });
  } catch (error) {
    console.error('Delete entry setup example error:', error.message);

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getEntrySetupExamples,
  createEntrySetupExample,
  updateEntrySetupExample,
  deleteEntrySetupExample
};
