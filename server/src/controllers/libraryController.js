const pool = require('../config/db');
const { logAuditEvent } = require('../services/auditService');
const {
  visibilityOptions,
  reportReasons,
  validateUploadMetadata,
  canUploadLibraryContent,
  canManageLibraryEntry
} = require('../services/librarySafetyService');
const {
  assertCanAddLibraryItem,
  assertCanAddExternalVideoLink,
  assertCanUploadFile
} = require('../services/planLimitsService');

const allowedEntryTypes = [
  'technique',
  'concept',
  'drill',
  'cla_game',
  'video_note'
];

const allowedUrlProtocols = new Set(['http:', 'https:']);

const normalizeVideoUrl = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmedValue = String(value).trim();

  if (!trimmedValue) {
    return null;
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(trimmedValue);
  } catch (error) {
    return { error: 'Video URL must be a valid http:// or https:// URL' };
  }

  if (!allowedUrlProtocols.has(parsedUrl.protocol)) {
    return { error: 'Video URL must use http:// or https://' };
  }

  return { value: parsedUrl.toString() };
};

const libraryEntrySelect = `
  SELECT le.*,
         p.name AS program_name,
         ct.title AS topic_title,
         ct.topic_type,
         u.first_name AS created_by_first_name,
         u.last_name AS created_by_last_name,
         COALESCE(report_summary.open_reports_count, 0) AS open_reports_count
  FROM library_entries le
  LEFT JOIN programs p ON le.program_id = p.id
  LEFT JOIN curriculum_topics ct ON le.curriculum_topic_id = ct.id
  JOIN users u ON le.created_by_user_id = u.id
  LEFT JOIN (
    SELECT content_id, COUNT(*) AS open_reports_count
    FROM content_reports
    WHERE status = 'open'
    GROUP BY content_id
  ) report_summary ON report_summary.content_id = le.id
`;

const getMemberVisibilitySql = () => `le.is_active = TRUE AND le.content_status = 'active' AND le.visibility IN ('members', 'members_and_parents')`;

const getLibraryEntryByIdForManagement = async (entryId, gymId) => {
  const [rows] = await pool.query(
    `${libraryEntrySelect}
     WHERE le.id = ? AND le.gym_id = ?`,
    [entryId, gymId]
  );

  return rows[0] || null;
};

const getLibraryEntryByIdForViewer = async (entryId, gymId, isMember) => {
  const [rows] = await pool.query(
    `${libraryEntrySelect}
     WHERE le.id = ? AND le.gym_id = ?
       AND (${isMember ? getMemberVisibilitySql() : "le.content_status <> 'deleted'"})`,
    [entryId, gymId]
  );

  return rows[0] || null;
};

const validateProgramAndTopic = async ({ gymId, programId, curriculumTopicId }) => {
  if (programId !== undefined && programId !== null) {
    const [programRows] = await pool.query(
      'SELECT id FROM programs WHERE id = ? AND gym_id = ?',
      [programId, gymId]
    );

    if (programRows.length === 0) {
      return 'Program not found for this gym';
    }
  }

  if (curriculumTopicId !== undefined && curriculumTopicId !== null) {
    const [topicRows] = await pool.query(
      'SELECT id FROM curriculum_topics WHERE id = ? AND gym_id = ? AND is_active = TRUE',
      [curriculumTopicId, gymId]
    );

    if (topicRows.length === 0) {
      return 'Curriculum topic not found for this gym';
    }
  }

  return '';
};

const createLibraryEntry = async (req, res) => {
  try {
    if (!canUploadLibraryContent(req.user)) {
      await logAuditEvent({
        gymId: req.user.gym_id,
        userId: req.user.id,
        eventType: 'LIBRARY_UPLOAD_REJECTED',
        entityType: 'library_entry',
        metadata: {
          reason: 'permission_denied'
        }
      });

      return res.status(403).json({
        message: 'You do not have permission to upload library content.'
      });
    }

    const gymId = req.user.gym_id;
    const createdByUserId = req.user.id;

    const {
      program_id,
      curriculum_topic_id,
      title,
      entry_type,
      description,
      video_url,
      visibility,
      original_filename,
      mime_type,
      file_size,
      contentSafetyConfirmed
    } = req.body;

    try {
      await assertCanAddLibraryItem(gymId);

      if (video_url && String(video_url).trim()) {
        await assertCanAddExternalVideoLink(gymId);
      }

      if (mime_type || original_filename || file_size) {
        await assertCanUploadFile(gymId, file_size ? Number(file_size) / 1048576 : 0);
      }
    } catch (limitError) {
      if (limitError.limitType) {
        return res.status(limitError.status || 409).json({
          message: limitError.message,
          limitType: limitError.limitType,
          currentUsage: limitError.currentUsage,
          planLimit: limitError.planLimit,
          upgradeRequired: Boolean(limitError.upgradeRequired),
          upgradePlan: limitError.upgradePlan || 'standard',
          upgradePlanLabel: limitError.upgradePlanLabel || 'Standard'
        });
      }

      throw limitError;
    }

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

    if (!visibilityOptions.includes(finalVisibility)) {
      return res.status(400).json({
        message: 'Invalid visibility'
      });
    }

    const uploadValidationError = validateUploadMetadata({
      originalFilename: original_filename,
      mimeType: mime_type,
      fileSize: file_size,
      contentSafetyConfirmed
    });

    if (uploadValidationError) {
      await logAuditEvent({
        gymId,
        userId: createdByUserId,
        eventType: 'LIBRARY_UPLOAD_REJECTED',
        entityType: 'library_entry',
        metadata: {
          reason: 'safety_validation_failed',
          message: uploadValidationError
        }
      });

      return res.status(400).json({
        message: uploadValidationError
      });
    }

    const normalizedVideoUrlResult = normalizeVideoUrl(video_url);

    if (normalizedVideoUrlResult?.error) {
      return res.status(400).json({
        message: normalizedVideoUrlResult.error
      });
    }

    const relationshipValidationError = await validateProgramAndTopic({
      gymId,
      programId: program_id ?? null,
      curriculumTopicId: curriculum_topic_id ?? null
    });

    if (relationshipValidationError) {
      return res.status(400).json({
        message: relationshipValidationError
      });
    }

    const [result] = await pool.query(
      `INSERT INTO library_entries
       (
         gym_id,
         program_id,
         curriculum_topic_id,
         created_by_user_id,
         title,
         entry_type,
         description,
         video_url,
         original_filename,
         mime_type,
         file_size,
         content_safety_confirmed,
         visibility,
         is_active,
         content_status
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, 'active')`,
      [
        gymId,
        program_id ?? null,
        curriculum_topic_id ?? null,
        createdByUserId,
        title.trim(),
        entry_type,
        description || null,
        normalizedVideoUrlResult?.value ?? null,
        original_filename ? String(original_filename).trim() : null,
        mime_type ? String(mime_type).trim().toLowerCase() : null,
        file_size ?? null,
        true,
        finalVisibility
      ]
    );

    await logAuditEvent({
      gymId,
      userId: createdByUserId,
      eventType: 'LIBRARY_UPLOAD_CREATED',
      entityType: 'library_entry',
      entityId: result.insertId,
      metadata: {
        visibility: finalVisibility,
        entry_type
      }
    });

    const entry = await getLibraryEntryByIdForManagement(result.insertId, gymId);

    return res.status(201).json({
      message: 'Library entry created successfully',
      library_entry: entry
    });
  } catch (error) {
    console.error('Create library entry error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const getLibraryEntries = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const isMember = req.user.role === 'member';

    const [rows] = await pool.query(
      `${libraryEntrySelect}
       WHERE le.gym_id = ?
         AND (${isMember ? getMemberVisibilitySql() : "le.content_status <> 'deleted'"})
       ORDER BY le.created_at DESC`,
      [gymId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Get library entries error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const getLibraryEntryById = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;
    const isMember = req.user.role === 'member';

    const entry = await getLibraryEntryByIdForViewer(id, gymId, isMember);

    if (!entry) {
      return res.status(404).json({
        message: 'Library entry not found'
      });
    }

    return res.status(200).json(entry);
  } catch (error) {
    console.error('Get library entry by ID error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const updateLibraryEntry = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    const currentEntry = await getLibraryEntryByIdForManagement(id, gymId);

    if (!currentEntry) {
      return res.status(404).json({
        message: 'Library entry not found'
      });
    }

    if (!canManageLibraryEntry(req.user, currentEntry)) {
      return res.status(403).json({
        message: 'You do not have permission to manage this library entry.'
      });
    }

    const {
      program_id,
      curriculum_topic_id,
      title,
      entry_type,
      description,
      video_url,
      visibility,
      is_active,
      content_status,
      original_filename,
      mime_type,
      file_size,
      contentSafetyConfirmed
    } = req.body;

    const updatedProgramId = program_id !== undefined ? program_id : currentEntry.program_id;
    const updatedTopicId = curriculum_topic_id !== undefined ? curriculum_topic_id : currentEntry.curriculum_topic_id;
    const updatedTitle = title !== undefined ? title.trim() : currentEntry.title;
    const updatedEntryType = entry_type !== undefined ? entry_type : currentEntry.entry_type;
    const updatedDescription = description !== undefined ? description : currentEntry.description;
    const updatedVideoUrl = video_url !== undefined ? video_url : currentEntry.video_url;
    const updatedVisibility = visibility !== undefined ? visibility : currentEntry.visibility;
    const updatedOriginalFilename = original_filename !== undefined ? original_filename : currentEntry.original_filename;
    const updatedMimeType = mime_type !== undefined ? mime_type : currentEntry.mime_type;
    const updatedFileSize = file_size !== undefined ? file_size : currentEntry.file_size;
    const updatedSafetyConfirmed = contentSafetyConfirmed !== undefined
      ? contentSafetyConfirmed === true
      : Boolean(currentEntry.content_safety_confirmed);
    const updatedContentStatus = content_status !== undefined
      ? content_status
      : is_active === false
        ? 'hidden'
        : is_active === true
          ? 'active'
          : currentEntry.content_status;

    try {
      if (
        (!currentEntry.video_url || !String(currentEntry.video_url).trim())
        && updatedVideoUrl
        && String(updatedVideoUrl).trim()
      ) {
        await assertCanAddExternalVideoLink(gymId);
      }

      if (
        (updatedMimeType || updatedOriginalFilename || updatedFileSize)
        && (!currentEntry.mime_type && !currentEntry.original_filename && !currentEntry.file_size)
      ) {
        await assertCanUploadFile(gymId, updatedFileSize ? Number(updatedFileSize) / 1048576 : 0);
      }
    } catch (limitError) {
      if (limitError.limitType) {
        return res.status(limitError.status || 409).json({
          message: limitError.message,
          limitType: limitError.limitType,
          currentUsage: limitError.currentUsage,
          planLimit: limitError.planLimit,
          upgradeRequired: Boolean(limitError.upgradeRequired),
          upgradePlan: limitError.upgradePlan || 'standard',
          upgradePlanLabel: limitError.upgradePlanLabel || 'Standard'
        });
      }

      throw limitError;
    }

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

    if (!visibilityOptions.includes(updatedVisibility)) {
      return res.status(400).json({
        message: 'Invalid visibility'
      });
    }

    if (!['active', 'hidden', 'deleted'].includes(updatedContentStatus)) {
      return res.status(400).json({
        message: 'Invalid content status'
      });
    }

    const uploadValidationError = validateUploadMetadata({
      originalFilename: updatedOriginalFilename,
      mimeType: updatedMimeType,
      fileSize: updatedFileSize,
      contentSafetyConfirmed: updatedSafetyConfirmed
    });

    if (uploadValidationError) {
      await logAuditEvent({
        gymId,
        userId: req.user.id,
        eventType: 'LIBRARY_UPLOAD_REJECTED',
        entityType: 'library_entry',
        entityId: Number(id),
        metadata: {
          reason: 'safety_validation_failed',
          message: uploadValidationError
        }
      });

      return res.status(400).json({
        message: uploadValidationError
      });
    }

    const normalizedVideoUrlResult = normalizeVideoUrl(updatedVideoUrl);

    if (normalizedVideoUrlResult?.error) {
      return res.status(400).json({
        message: normalizedVideoUrlResult.error
      });
    }

    const relationshipValidationError = await validateProgramAndTopic({
      gymId,
      programId: updatedProgramId,
      curriculumTopicId: updatedTopicId
    });

    if (relationshipValidationError) {
      return res.status(400).json({
        message: relationshipValidationError
      });
    }

    await pool.query(
      `UPDATE library_entries
       SET program_id = ?,
           curriculum_topic_id = ?,
           title = ?,
           entry_type = ?,
           description = ?,
           video_url = ?,
           original_filename = ?,
           mime_type = ?,
           file_size = ?,
           content_safety_confirmed = ?,
           visibility = ?,
           content_status = ?,
           is_active = ?
       WHERE id = ? AND gym_id = ?`,
      [
        updatedProgramId,
        updatedTopicId,
        updatedTitle,
        updatedEntryType,
        updatedDescription,
        normalizedVideoUrlResult?.value ?? null,
        updatedOriginalFilename ? String(updatedOriginalFilename).trim() : null,
        updatedMimeType ? String(updatedMimeType).trim().toLowerCase() : null,
        updatedFileSize ?? null,
        updatedSafetyConfirmed,
        updatedVisibility,
        updatedContentStatus,
        updatedContentStatus === 'active',
        id,
        gymId
      ]
    );

    const updatedEntry = await getLibraryEntryByIdForManagement(id, gymId);

    return res.status(200).json({
      message: 'Library entry updated successfully',
      library_entry: updatedEntry
    });
  } catch (error) {
    console.error('Update library entry error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const setLibraryEntryStatus = async (req, res, nextStatus) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;

    const currentEntry = await getLibraryEntryByIdForManagement(id, gymId);

    if (!currentEntry) {
      return res.status(404).json({
        message: 'Library entry not found'
      });
    }

    if (!canManageLibraryEntry(req.user, currentEntry)) {
      return res.status(403).json({
        message: 'You do not have permission to manage this library entry.'
      });
    }

    await pool.query(
      `UPDATE library_entries
       SET content_status = ?, is_active = ?
       WHERE id = ? AND gym_id = ?`,
      [nextStatus, nextStatus === 'active', id, gymId]
    );

    const eventType = nextStatus === 'hidden'
      ? 'LIBRARY_CONTENT_HIDDEN'
      : nextStatus === 'deleted'
        ? 'LIBRARY_CONTENT_DELETED'
        : null;

    if (eventType) {
      await logAuditEvent({
        gymId,
        userId: req.user.id,
        eventType,
        entityType: 'library_entry',
        entityId: Number(id),
        metadata: {
          content_status: nextStatus
        }
      });
    }

    const updatedEntry = await getLibraryEntryByIdForManagement(id, gymId);

    return res.status(200).json({
      message: nextStatus === 'hidden'
        ? 'Library content hidden successfully.'
        : nextStatus === 'deleted'
          ? 'Library content deleted successfully.'
          : 'Library content restored successfully.',
      library_entry: updatedEntry
    });
  } catch (error) {
    console.error('Set library entry status error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const hideLibraryEntry = async (req, res) => setLibraryEntryStatus(req, res, 'hidden');
const restoreLibraryEntry = async (req, res) => setLibraryEntryStatus(req, res, 'active');
const deleteLibraryEntry = async (req, res) => setLibraryEntryStatus(req, res, 'deleted');

const reportLibraryEntry = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const { id } = req.params;
    const { reason, description } = req.body;
    const isMember = req.user.role === 'member';

    if (!reportReasons.has(reason)) {
      return res.status(400).json({
        message: 'Choose a valid report reason.'
      });
    }

    const entry = await getLibraryEntryByIdForViewer(id, gymId, isMember);

    if (!entry) {
      return res.status(404).json({
        message: 'Library entry not found'
      });
    }

    await pool.query(
      `INSERT INTO content_reports
       (content_id, gym_id, reported_by_user_id, reason, description)
       VALUES (?, ?, ?, ?, ?)`,
      [id, gymId, req.user.id, reason, String(description || '').trim() || null]
    );

    await logAuditEvent({
      gymId,
      userId: req.user.id,
      eventType: 'CONTENT_REPORTED',
      entityType: 'library_entry',
      entityId: Number(id),
      metadata: {
        reason
      }
    });

    return res.status(201).json({
      message: 'Thank you. This content report was submitted.'
    });
  } catch (error) {
    console.error('Report library entry error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const listLibraryContentReports = async (req, res) => {
  try {
    const gymId = req.user.gym_id;

    if (!['owner', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        message: 'Only owner or admin accounts can review content reports.'
      });
    }

    const [rows] = await pool.query(
      `SELECT cr.*,
              le.title AS content_title,
              le.visibility,
              le.content_status,
              reporter.first_name AS reported_by_first_name,
              reporter.last_name AS reported_by_last_name,
              reviewer.first_name AS reviewed_by_first_name,
              reviewer.last_name AS reviewed_by_last_name
       FROM content_reports cr
       JOIN library_entries le ON le.id = cr.content_id AND le.gym_id = cr.gym_id
       JOIN users reporter ON reporter.id = cr.reported_by_user_id
       LEFT JOIN users reviewer ON reviewer.id = cr.reviewed_by_user_id
       WHERE cr.gym_id = ?
       ORDER BY (cr.status = 'open') DESC, cr.created_at DESC`,
      [gymId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('List content reports error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const reviewLibraryContentReport = async (req, res) => {
  try {
    const gymId = req.user.gym_id;
    const reportId = Number.parseInt(req.params.reportId, 10);

    if (!['owner', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        message: 'Only owner or admin accounts can review content reports.'
      });
    }

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({
        message: 'Report id is invalid.'
      });
    }

    const [existingRows] = await pool.query(
      'SELECT id, content_id, status FROM content_reports WHERE id = ? AND gym_id = ?',
      [reportId, gymId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Content report not found.'
      });
    }

    await pool.query(
      `UPDATE content_reports
       SET status = 'reviewed', reviewed_at = NOW(), reviewed_by_user_id = ?
       WHERE id = ? AND gym_id = ?`,
      [req.user.id, reportId, gymId]
    );

    await logAuditEvent({
      gymId,
      userId: req.user.id,
      eventType: 'CONTENT_REPORT_REVIEWED',
      entityType: 'content_report',
      entityId: reportId,
      metadata: {
        content_id: existingRows[0].content_id
      }
    });

    return res.status(200).json({
      message: 'Content report marked as reviewed.'
    });
  } catch (error) {
    console.error('Review content report error:', error.message);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

module.exports = {
  createLibraryEntry,
  getLibraryEntries,
  getLibraryEntryById,
  updateLibraryEntry,
  hideLibraryEntry,
  restoreLibraryEntry,
  deleteLibraryEntry,
  reportLibraryEntry,
  listLibraryContentReports,
  reviewLibraryContentReport
};
