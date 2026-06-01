const bcrypt = require('bcryptjs');
const os = require('os');
const pool = require('../config/db');
const { sendClientError, handleServerError } = require('../middleware/errorHandler');
const { logAuditEvent } = require('../services/auditService');
const {
  createMemberInviteTokenRecord,
  createStaffInviteTokenRecord,
  generateRandomPassword
} = require('../services/accessInviteService');

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const normalizeName = (value) => String(value || '').trim();
const normalizeNameKey = (value) => normalizeName(value).toLowerCase();

const getFirstLocalIpv4 = () => {
  const interfaces = os.networkInterfaces();

  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (entry && entry.family === 'IPv4' && !entry.internal) {
        return entry.address;
      }
    }
  }

  return '';
};

const getPreferredPublicAppBaseUrl = (req, slug = '') => {
  const configuredBaseUrl = String(process.env.CLIENT_URL || process.env.APP_URL || '').trim().replace(/\/$/, '');

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  const originHeader = String(req.get('origin') || '').trim();

  if (originHeader) {
    try {
      const originUrl = new URL(originHeader);
      const localIp = getFirstLocalIpv4();
      const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(originUrl.hostname);

      if (isLocalHost && localIp) {
        originUrl.hostname = localIp;
      }

      return originUrl.toString().replace(/\/$/, '');
    } catch {
      // Fall through to other runtime guesses.
    }
  }

  const localIp = getFirstLocalIpv4();

  if (localIp) {
    return `http://${localIp}:5173`;
  }

  return 'http://localhost:5173';
};

const getGymBySlug = async (slug) => {
  const [rows] = await pool.query(
    'SELECT id, name, slug FROM gyms WHERE slug = ? LIMIT 1',
    [String(slug || '').trim()]
  );

  return rows[0] || null;
};

const getGymInviteCreatorUserId = async (connection, gymId) => {
  const [rows] = await connection.query(
    `SELECT id
     FROM users
     WHERE gym_id = ? AND role IN ('owner', 'admin', 'coach')
     ORDER BY FIELD(role, 'owner', 'admin', 'coach'), is_active DESC, id ASC
     LIMIT 1`,
    [gymId]
  );

  return rows[0]?.id || null;
};

const toSqlDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const timeToMinutes = (value) => {
  if (!value || typeof value !== 'string') return null;
  const [hours, minutes] = value.split(':').map((part) => Number.parseInt(part, 10));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
};

const buildSessionLabel = (row) => {
  const title = String(row.title || '').trim() || 'Scheduled class';
  const start = row.start_time ? String(row.start_time).slice(0, 5) : '';
  const end = row.end_time ? String(row.end_time).slice(0, 5) : '';
  return start && end ? `${title} (${start}-${end})` : title;
};

const buildSessionChoice = (row, sessionType) => ({
  session_type: sessionType,
  session_id: Number(row.id),
  label: buildSessionLabel(row),
  start_time: row.start_time || '',
  end_time: row.end_time || ''
});

const isWithinPrimaryCheckInWindow = (row, currentMinutes) => {
  const startMinutes = timeToMinutes(row.start_time);
  const endMinutes = timeToMinutes(row.end_time);
  if (startMinutes === null || endMinutes === null) return false;
  return currentMinutes >= (startMinutes - 30) && currentMinutes <= (endMinutes + 15);
};

const isWithinNearbySessionWindow = (row, currentMinutes) => {
  const startMinutes = timeToMinutes(row.start_time);
  const endMinutes = timeToMinutes(row.end_time);
  if (startMinutes === null || endMinutes === null) return false;
  return currentMinutes >= (startMinutes - 30) && currentMinutes <= (endMinutes + 15);
};

const groupContiguousSessions = (rows) => {
  const sortedRows = [...rows].sort((left, right) => timeToMinutes(left.start_time) - timeToMinutes(right.start_time));
  const blocks = [];

  for (const row of sortedRows) {
    const startMinutes = timeToMinutes(row.start_time);
    const endMinutes = timeToMinutes(row.end_time);

    if (startMinutes === null || endMinutes === null) {
      continue;
    }

    const lastBlock = blocks[blocks.length - 1];

    if (!lastBlock || startMinutes > (lastBlock.endMinutes + 45)) {
      blocks.push({
        rows: [row],
        startMinutes,
        endMinutes
      });
      continue;
    }

    lastBlock.rows.push(row);
    lastBlock.endMinutes = Math.max(lastBlock.endMinutes, endMinutes);
  }

  return blocks;
};

const findRelevantSessionBlock = (rows, currentMinutes) => {
  const blocks = groupContiguousSessions(rows);

  return blocks.find((block) => currentMinutes >= (block.startMinutes - 30) && currentMinutes <= (block.endMinutes + 15)) || null;
};

const findMatchedClassWindow = async (connection, gymId, now = new Date()) => {
  const classDate = toSqlDate(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [classRows] = await connection.query(
    `SELECT id, title, start_time, end_time
     FROM classes
     WHERE gym_id = ?
       AND class_date = ?
       AND archived_at IS NULL`,
    [gymId, classDate]
  );

  const [plannedRows] = await connection.query(
    `SELECT id, title, start_time, end_time
     FROM planned_classes
     WHERE gym_id = ?
       AND class_date = ?
       AND status = 'planned'`,
    [gymId, classDate]
  );

  const relevantClassBlock = findRelevantSessionBlock(classRows, currentMinutes);

  if (relevantClassBlock && relevantClassBlock.rows.length > 1) {
    return {
      matchType: 'ambiguous',
      classId: null,
      plannedClassId: null,
      label: '',
      sessionChoices: relevantClassBlock.rows.map((row) => buildSessionChoice(row, 'class'))
    };
  }

  if (relevantClassBlock && relevantClassBlock.rows.length === 1) {
    return {
      matchType: 'class',
      classId: Number(relevantClassBlock.rows[0].id),
      plannedClassId: null,
      label: buildSessionLabel(relevantClassBlock.rows[0])
    };
  }

  const relevantPlannedBlock = findRelevantSessionBlock(plannedRows, currentMinutes);

  if (relevantPlannedBlock && relevantPlannedBlock.rows.length > 1) {
    return {
      matchType: 'ambiguous',
      classId: null,
      plannedClassId: null,
      label: '',
      sessionChoices: relevantPlannedBlock.rows.map((row) => buildSessionChoice(row, 'planned_class'))
    };
  }

  if (relevantPlannedBlock && relevantPlannedBlock.rows.length === 1) {
    return {
      matchType: 'planned_class',
      classId: null,
      plannedClassId: Number(relevantPlannedBlock.rows[0].id),
      label: buildSessionLabel(relevantPlannedBlock.rows[0])
    };
  }

  return {
    matchType: 'none',
    classId: null,
    plannedClassId: null,
    label: '',
    sessionChoices: []
  };
};

const upsertQuickAttendance = async (connection, classId, memberId) => {
  if (!classId || !memberId) {
    return;
  }

  try {
    await connection.query(
      `INSERT INTO class_members (class_id, member_id, attendance_status)
       VALUES (?, ?, 'present')
       ON DUPLICATE KEY UPDATE
         attendance_status = VALUES(attendance_status),
         archived_at = NULL`,
      [classId, memberId]
    );
  } catch (error) {
    const isMissingArchivedAt = error?.code === 'ER_BAD_FIELD_ERROR'
      && /archived_at/i.test(error.sqlMessage || error.message || '');

    if (!isMissingArchivedAt) {
      throw error;
    }

    await connection.query(
      `INSERT INTO class_members (class_id, member_id, attendance_status)
       VALUES (?, ?, 'present')
       ON DUPLICATE KEY UPDATE
         attendance_status = VALUES(attendance_status)`,
      [classId, memberId]
    );
  }
};

const findMemberMatch = async (connection, gymId, email, lastNameKey) => {
  const [rows] = await connection.query(
    `SELECT
       m.id AS member_id,
       m.user_id,
       m.first_name AS member_first_name,
       m.last_name AS member_last_name,
       m.email AS member_email,
       m.is_active AS member_is_active,
       u.id AS matched_user_id,
       u.role AS matched_user_role,
       u.email AS matched_user_email,
       u.is_active AS matched_user_is_active
     FROM members m
     LEFT JOIN users u
       ON u.id = m.user_id AND u.gym_id = m.gym_id
     WHERE m.gym_id = ?
       AND LOWER(COALESCE(m.email, u.email, '')) = ?
       AND LOWER(m.last_name) = ?
     ORDER BY CASE WHEN m.user_id IS NULL THEN 1 ELSE 0 END, m.is_active DESC, m.id ASC
     LIMIT 1`,
    [gymId, email, lastNameKey]
  );

  return rows[0] || null;
};

const findStaffMatch = async (connection, gymId, email, lastNameKey) => {
  const [rows] = await connection.query(
    `SELECT id, role, first_name, last_name, email, is_active
     FROM users
     WHERE gym_id = ?
       AND role IN ('admin', 'coach')
       AND LOWER(email) = ?
       AND LOWER(last_name) = ?
     ORDER BY is_active DESC, id ASC
     LIMIT 1`,
    [gymId, email, lastNameKey]
  );

  return rows[0] || null;
};

const createLinkedMemberUser = async (connection, gymId, member, email) => {
  const passwordHash = await bcrypt.hash(generateRandomPassword(), 10);
  const firstName = normalizeName(member.member_first_name);
  const lastName = normalizeName(member.member_last_name);

  const [newUserResult] = await connection.query(
    `INSERT INTO users
     (gym_id, first_name, last_name, email, password_hash, role, is_active)
     VALUES (?, ?, ?, ?, ?, 'member', FALSE)`,
    [gymId, firstName, lastName, email, passwordHash]
  );

  await connection.query(
    `UPDATE members
     SET user_id = ?, email = COALESCE(NULLIF(email, ''), ?)
     WHERE id = ? AND gym_id = ?`,
    [newUserResult.insertId, email, member.member_id, gymId]
  );

  return newUserResult.insertId;
};

const createPublicAccessSetup = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { slug } = req.params;
    const gym = await getGymBySlug(slug);

    if (!gym) {
      return sendClientError(res, {
        status: 404,
        message: 'Gym check-in page not found.'
      });
    }

    const email = normalizeEmail(req.body?.email);
    const lastName = normalizeName(req.body?.last_name);
    const firstName = normalizeName(req.body?.first_name);
    const lastNameKey = normalizeNameKey(lastName);

    if (!email || !lastName) {
      return sendClientError(res, {
        status: 400,
        message: 'Email and last name are required.'
      });
    }

    await connection.beginTransaction();

    const inviteCreatorUserId = await getGymInviteCreatorUserId(connection, gym.id);

    if (!inviteCreatorUserId) {
      await connection.rollback();
      return sendClientError(res, {
        status: 409,
        message: 'This gym is not ready for access setup yet.'
      });
    }

    const memberMatch = await findMemberMatch(connection, gym.id, email, lastNameKey);

    if (memberMatch) {
      if (!memberMatch.member_is_active) {
        await connection.rollback();
        return sendClientError(res, {
          status: 403,
          message: 'This roster profile is inactive right now. Ask staff to reactivate it first.'
        });
      }

      if (!memberMatch.user_id) {
        const [duplicateUserRows] = await connection.query(
          'SELECT id FROM users WHERE email = ? LIMIT 1',
          [email]
        );

        if (duplicateUserRows.length > 0) {
          await connection.rollback();
          return sendClientError(res, {
            status: 409,
            message: 'That email is already linked to another login. Ask staff to update your roster record first.'
          });
        }
      }

      const userId = memberMatch.user_id
        ? Number(memberMatch.user_id)
        : await createLinkedMemberUser(connection, gym.id, memberMatch, email);
      const inviteType = memberMatch.user_id && memberMatch.matched_user_is_active ? 'reset_password' : 'activation';
      const inviteRecord = await createMemberInviteTokenRecord(connection, {
        gymId: gym.id,
        userId,
        memberId: Number(memberMatch.member_id),
        createdByUserId: inviteCreatorUserId,
        inviteType
      });

      await logAuditEvent({
        gymId: gym.id,
        userId,
        eventType: 'QR_ACCESS_SETUP_STARTED',
        entityType: 'member_access_invite',
        entityId: Number(memberMatch.member_id),
        metadata: {
          source: 'public_qr',
          slug: gym.slug,
          email
        },
        connection
      });

      await logAuditEvent({
        gymId: gym.id,
        userId,
        eventType: 'QR_ACCESS_SETUP_COMPLETED',
        entityType: 'member_access_invite',
        entityId: Number(memberMatch.member_id),
        metadata: {
          source: 'public_qr',
          invite_type: inviteType,
          slug: gym.slug
        },
        connection
      });

      await connection.commit();

      return res.status(200).json({
        message: 'Access setup is ready.',
        role: 'member',
        invite_type: inviteType,
        redirect_to: inviteRecord.inviteUrl
      });
    }

    const staffMatch = await findStaffMatch(connection, gym.id, email, lastNameKey);

    if (staffMatch) {
      if (!staffMatch.is_active) {
        await connection.rollback();
        return sendClientError(res, {
          status: 403,
          message: 'This staff account is inactive right now. Ask the gym owner to reactivate it first.'
        });
      }

      const inviteType = staffMatch.is_active ? 'reset_password' : 'activation';
      const inviteRecord = await createStaffInviteTokenRecord(connection, {
        gymId: gym.id,
        userId: Number(staffMatch.id),
        createdByUserId: inviteCreatorUserId,
        inviteType
      });

      await logAuditEvent({
        gymId: gym.id,
        userId: Number(staffMatch.id),
        eventType: 'QR_ACCESS_SETUP_STARTED',
        entityType: 'staff_access_invite',
        entityId: Number(staffMatch.id),
        metadata: {
          source: 'public_qr',
          slug: gym.slug,
          email
        },
        connection
      });

      await logAuditEvent({
        gymId: gym.id,
        userId: Number(staffMatch.id),
        eventType: 'QR_ACCESS_SETUP_COMPLETED',
        entityType: 'staff_access_invite',
        entityId: Number(staffMatch.id),
        metadata: {
          source: 'public_qr',
          invite_type: inviteType,
          slug: gym.slug
        },
        connection
      });

      await connection.commit();

      return res.status(200).json({
        message: 'Access setup is ready.',
        role: staffMatch.role,
        invite_type: inviteType,
        redirect_to: inviteRecord.inviteUrl
      });
    }

    await connection.rollback();

    return sendClientError(res, {
      status: 404,
      message: firstName
        ? `We could not match ${firstName} ${lastName} to this gym yet. Ask staff to add or update your roster information first.`
        : 'We could not match you to this gym yet. Ask staff to add or update your roster information first.'
    });
  } catch (error) {
    await connection.rollback();
    return handleServerError(res, 'Public access setup error:', error);
  } finally {
    connection.release();
  }
};

const createQuickCheckIn = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { slug } = req.params;
    const gym = await getGymBySlug(slug);

    if (!gym) {
      return sendClientError(res, {
        status: 404,
        message: 'Gym check-in page not found.'
      });
    }

    const email = normalizeEmail(req.body?.email);
    const lastName = normalizeName(req.body?.last_name);
    const firstName = normalizeName(req.body?.first_name);
    const lastNameKey = normalizeNameKey(lastName);
    const selectedSessionType = String(req.body?.selected_session_type || '').trim();
    const selectedSessionId = Number(req.body?.selected_session_id || 0) || null;

    if (!email || !lastName) {
      return sendClientError(res, {
        status: 400,
        message: 'Email and last name are required.'
      });
    }

    const memberMatch = await findMemberMatch(connection, gym.id, email, lastNameKey);
    const staffMatch = memberMatch ? null : await findStaffMatch(connection, gym.id, email, lastNameKey);

    const matchedUserId = memberMatch?.user_id
      ? Number(memberMatch.user_id)
      : staffMatch?.id
        ? Number(staffMatch.id)
        : null;
    const matchedMemberId = memberMatch?.member_id ? Number(memberMatch.member_id) : null;
    const matchedRole = memberMatch
      ? 'member'
      : (staffMatch?.role || '');
    const displayName = memberMatch
      ? `${normalizeName(memberMatch.member_first_name)} ${normalizeName(memberMatch.member_last_name)}`.trim()
      : staffMatch
        ? `${normalizeName(staffMatch.first_name)} ${normalizeName(staffMatch.last_name)}`.trim()
        : '';

    if (!matchedMemberId && !matchedUserId) {
      return sendClientError(res, {
        status: 404,
        message: 'We could not match that check-in yet. Ask staff to confirm your roster email first.'
      });
    }

    if (memberMatch && !memberMatch.member_is_active) {
      return sendClientError(res, {
        status: 403,
        message: 'This roster profile is inactive right now. Ask staff to reactivate it first.'
      });
    }

    if (staffMatch && !staffMatch.is_active) {
      return sendClientError(res, {
        status: 403,
        message: 'This staff account is inactive right now. Ask the gym owner to reactivate it first.'
      });
    }

    const matchedSession = await findMatchedClassWindow(connection, gym.id);

    if (matchedSession.matchType === 'ambiguous') {
      const sessionChoices = Array.isArray(matchedSession.sessionChoices) ? matchedSession.sessionChoices : [];
      const selectedChoice = sessionChoices.find((choice) => (
        choice.session_type === selectedSessionType
        && Number(choice.session_id) === Number(selectedSessionId)
      ));

      if (!selectedChoice) {
        return res.status(200).json({
          requires_session_choice: true,
          message: 'Choose the class you are attending.',
          display_name: displayName || firstName || 'Member',
          session_choices: sessionChoices
        });
      }

      matchedSession.matchType = selectedChoice.session_type;
      matchedSession.classId = selectedChoice.session_type === 'class' ? Number(selectedChoice.session_id) : null;
      matchedSession.plannedClassId = selectedChoice.session_type === 'planned_class' ? Number(selectedChoice.session_id) : null;
      matchedSession.label = selectedChoice.label;
    }

    let recentRows = [];

    try {
      if (matchedSession.classId || matchedSession.plannedClassId) {
        const [rows] = await connection.query(
          `SELECT id, created_at
           FROM gym_check_in_events
           WHERE gym_id = ?
             AND (
               (? IS NOT NULL AND user_id = ?)
               OR (? IS NOT NULL AND member_id = ?)
             )
             AND (
               (? IS NOT NULL AND matched_class_id = ?)
               OR (? IS NOT NULL AND matched_planned_class_id = ?)
             )
           ORDER BY created_at DESC
           LIMIT 1`,
          [
            gym.id,
            matchedUserId,
            matchedUserId,
            matchedMemberId,
            matchedMemberId,
            matchedSession.classId,
            matchedSession.classId,
            matchedSession.plannedClassId,
            matchedSession.plannedClassId
          ]
        );

        recentRows = rows;
      } else {
        const [rows] = await connection.query(
          `SELECT id, created_at
           FROM gym_check_in_events
           WHERE gym_id = ?
             AND (
               (? IS NOT NULL AND user_id = ?)
               OR (? IS NOT NULL AND member_id = ?)
             )
             AND created_at >= DATE_SUB(NOW(), INTERVAL 2 MINUTE)
           ORDER BY created_at DESC
           LIMIT 1`,
          [gym.id, matchedUserId, matchedUserId, matchedMemberId, matchedMemberId]
        );

        recentRows = rows;
      }
    } catch (error) {
      const isMissingMatchedColumns = error?.code === 'ER_BAD_FIELD_ERROR'
        && /matched_class_id|matched_planned_class_id/i.test(error.sqlMessage || error.message || '');

      if (!isMissingMatchedColumns) {
        throw error;
      }

      const [rows] = await connection.query(
        `SELECT id, created_at
         FROM gym_check_in_events
         WHERE gym_id = ?
           AND (
             (? IS NOT NULL AND user_id = ?)
             OR (? IS NOT NULL AND member_id = ?)
           )
           AND created_at >= DATE_SUB(NOW(), INTERVAL 2 MINUTE)
         ORDER BY created_at DESC
         LIMIT 1`,
        [gym.id, matchedUserId, matchedUserId, matchedMemberId, matchedMemberId]
      );

      recentRows = rows;
    }

    if (recentRows.length > 0) {
      return res.status(200).json({
        message: 'You are already checked in.',
        already_checked_in: true,
        display_name: displayName || firstName || 'Member',
        checked_in_at: recentRows[0].created_at,
        matched_session: matchedSession.matchType === 'none' || matchedSession.matchType === 'ambiguous'
          ? null
          : {
              type: matchedSession.matchType,
              label: matchedSession.label
            }
      });
    }

    let insertResult;

    try {
      const [result] = await connection.query(
        `INSERT INTO gym_check_in_events
         (gym_id, user_id, member_id, matched_class_id, matched_planned_class_id, checked_in_role, source, identifier_email, first_name, last_name)
         VALUES (?, ?, ?, ?, ?, ?, 'public_qr', ?, ?, ?)`,
        [
          gym.id,
          matchedUserId,
          matchedMemberId,
          matchedSession.classId,
          matchedSession.plannedClassId,
          matchedRole || 'member',
          email,
          firstName || (memberMatch?.member_first_name || staffMatch?.first_name || ''),
          lastName || (memberMatch?.member_last_name || staffMatch?.last_name || '')
        ]
      );

      insertResult = result;
    } catch (error) {
      const isMissingMatchedColumns = error?.code === 'ER_BAD_FIELD_ERROR'
        && /matched_class_id|matched_planned_class_id/i.test(error.sqlMessage || error.message || '');

      if (!isMissingMatchedColumns) {
        throw error;
      }

      const [fallbackResult] = await connection.query(
        `INSERT INTO gym_check_in_events
         (gym_id, user_id, member_id, checked_in_role, source, identifier_email, first_name, last_name)
         VALUES (?, ?, ?, ?, 'public_qr', ?, ?, ?)`,
        [
          gym.id,
          matchedUserId,
          matchedMemberId,
          matchedRole || 'member',
          email,
          firstName || (memberMatch?.member_first_name || staffMatch?.first_name || ''),
          lastName || (memberMatch?.member_last_name || staffMatch?.last_name || '')
        ]
      );

      insertResult = fallbackResult;
    }

    if (matchedSession.matchType === 'class' && matchedMemberId) {
      await upsertQuickAttendance(connection, matchedSession.classId, matchedMemberId);
    }

    await logAuditEvent({
      gymId: gym.id,
      userId: matchedUserId,
      eventType: 'QR_CHECK_IN_COMPLETED',
      entityType: 'gym_check_in_event',
      entityId: insertResult.insertId,
      metadata: {
        source: 'public_qr',
        slug: gym.slug,
        role: matchedRole || 'member',
        member_id: matchedMemberId,
        match_type: matchedSession.matchType,
        matched_class_id: matchedSession.classId,
        matched_planned_class_id: matchedSession.plannedClassId
      },
      connection
    });

    return res.status(201).json({
      message: 'Check-in recorded.',
      already_checked_in: false,
      display_name: displayName || firstName || 'Member',
      checked_in_at: new Date().toISOString(),
      matched_session: matchedSession.matchType === 'none' || matchedSession.matchType === 'ambiguous'
        ? null
        : {
            type: matchedSession.matchType,
            label: matchedSession.label
          }
    });
  } catch (error) {
    return handleServerError(res, 'Public quick check-in error:', error);
  } finally {
    connection.release();
  }
};

const getPublicCheckInPage = async (req, res) => {
  try {
    const { slug } = req.params;
    const gym = await getGymBySlug(slug);

    if (!gym) {
      return sendClientError(res, {
        status: 404,
        message: 'Gym check-in page not found.'
      });
    }

    return res.status(200).json({
      gym: {
        name: gym.name,
        slug: gym.slug
      }
    });
  } catch (error) {
    return handleServerError(res, 'Get public check-in page error:', error);
  }
};

const getCheckInTools = async (req, res) => {
  try {
    let recentRows = [];

    try {
      const [rows] = await pool.query(
        `SELECT
           gce.id,
           gce.matched_class_id,
           gce.matched_planned_class_id,
           gce.checked_in_role,
           gce.source,
           gce.identifier_email,
           gce.first_name,
           gce.last_name,
           gce.created_at,
           c.title AS class_title,
           c.start_time AS class_start_time,
           c.end_time AS class_end_time,
           pc.title AS planned_class_title,
           pc.start_time AS planned_class_start_time,
           pc.end_time AS planned_class_end_time,
           COALESCE(m.first_name, u.first_name, gce.first_name) AS matched_first_name,
           COALESCE(m.last_name, u.last_name, gce.last_name) AS matched_last_name
         FROM gym_check_in_events gce
         LEFT JOIN members m
           ON m.id = gce.member_id AND m.gym_id = gce.gym_id
         LEFT JOIN users u
           ON u.id = gce.user_id AND u.gym_id = gce.gym_id
         LEFT JOIN classes c
           ON c.id = gce.matched_class_id AND c.gym_id = gce.gym_id
         LEFT JOIN planned_classes pc
           ON pc.id = gce.matched_planned_class_id AND pc.gym_id = gce.gym_id
         WHERE gce.gym_id = ?
         ORDER BY gce.created_at DESC
         LIMIT 20`,
        [req.user.gym_id]
      );

      recentRows = rows;
    } catch (error) {
      const isMissingCheckInSchema = error?.code === 'ER_NO_SUCH_TABLE'
        || (error?.code === 'ER_BAD_FIELD_ERROR'
          && /gym_check_in_events|matched_planned_class_id|matched_class_id/i.test(error.sqlMessage || error.message || ''));

      if (isMissingCheckInSchema) {
        try {
          const [fallbackRows] = await pool.query(
            `SELECT
               gce.id,
               gce.checked_in_role,
               gce.source,
               gce.identifier_email,
               gce.first_name,
               gce.last_name,
               gce.created_at,
               COALESCE(m.first_name, u.first_name, gce.first_name) AS matched_first_name,
               COALESCE(m.last_name, u.last_name, gce.last_name) AS matched_last_name
             FROM gym_check_in_events gce
             LEFT JOIN members m
               ON m.id = gce.member_id AND m.gym_id = gce.gym_id
             LEFT JOIN users u
               ON u.id = gce.user_id AND u.gym_id = gce.gym_id
             WHERE gce.gym_id = ?
             ORDER BY gce.created_at DESC
             LIMIT 20`,
            [req.user.gym_id]
          );

          recentRows = fallbackRows;
        } catch (fallbackError) {
          const isStillMissingCheckInSchema = fallbackError?.code === 'ER_NO_SUCH_TABLE'
            || (fallbackError?.code === 'ER_BAD_FIELD_ERROR'
              && /gym_check_in_events/i.test(fallbackError.sqlMessage || fallbackError.message || ''));

          if (!isStillMissingCheckInSchema) {
            throw fallbackError;
          }
        }

      } else {
        throw error;
      }
    }

    return res.status(200).json({
      gym: {
        id: req.user.gym_id,
        name: req.user.gym_name,
        slug: req.user.slug
      },
      public_app_base_url: getPreferredPublicAppBaseUrl(req, req.user.slug),
      recent_check_ins: recentRows.map((row) => ({
        id: row.id,
        checked_in_role: row.checked_in_role,
        source: row.source,
        identifier_email: row.identifier_email,
        display_name: `${normalizeName(row.matched_first_name)} ${normalizeName(row.matched_last_name)}`.trim(),
        created_at: row.created_at,
        matched_session_label: row.class_title
          ? buildSessionLabel({
              title: row.class_title,
              start_time: row.class_start_time,
              end_time: row.class_end_time
            })
          : row.planned_class_title
            ? buildSessionLabel({
                title: row.planned_class_title,
                start_time: row.planned_class_start_time,
                end_time: row.planned_class_end_time
              })
            : ''
      }))
    });
  } catch (error) {
    return handleServerError(res, 'Get check-in tools error:', error);
  }
};

module.exports = {
  getPublicCheckInPage,
  createPublicAccessSetup,
  createQuickCheckIn,
  getCheckInTools
};
