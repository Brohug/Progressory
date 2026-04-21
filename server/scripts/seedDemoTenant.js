const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

const DEMO_GYM = {
  name: 'Gem State Jiu Jitsu',
  slug: 'progressory-demo-academy'
};

const DEMO_OWNER = {
  firstName: 'Demo',
  lastName: 'Coach',
  email: 'demo@progressory.app',
  password: process.env.DEMO_PASSWORD || 'ProgressoryDemo!2026'
};

const toDateString = (date) => date.toISOString().slice(0, 10);

const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateString(date);
};

const queryOne = async (connection, sql, params = []) => {
  const [rows] = await connection.query(sql, params);
  return rows[0] || null;
};

const getOrCreateGym = async (connection) => {
  const existing = await queryOne(
    connection,
    'SELECT id, name, slug FROM gyms WHERE slug = ?',
    [DEMO_GYM.slug]
  );

  if (existing) {
    await connection.query(
      'UPDATE gyms SET name = ? WHERE id = ?',
      [DEMO_GYM.name, existing.id]
    );
    return existing.id;
  }

  const [result] = await connection.query(
    'INSERT INTO gyms (name, slug) VALUES (?, ?)',
    [DEMO_GYM.name, DEMO_GYM.slug]
  );

  return result.insertId;
};

const getOrCreateUser = async (connection, gymId) => {
  const passwordHash = await bcrypt.hash(DEMO_OWNER.password, 10);
  const existing = await queryOne(
    connection,
    'SELECT id FROM users WHERE email = ?',
    [DEMO_OWNER.email]
  );

  if (existing) {
    await connection.query(
      `UPDATE users
       SET gym_id = ?, first_name = ?, last_name = ?, password_hash = ?, role = 'owner', is_active = TRUE
       WHERE id = ?`,
      [gymId, DEMO_OWNER.firstName, DEMO_OWNER.lastName, passwordHash, existing.id]
    );
    return existing.id;
  }

  const [result] = await connection.query(
    `INSERT INTO users (gym_id, first_name, last_name, email, password_hash, role, is_active)
     VALUES (?, ?, ?, ?, ?, 'owner', TRUE)`,
    [gymId, DEMO_OWNER.firstName, DEMO_OWNER.lastName, DEMO_OWNER.email, passwordHash]
  );

  return result.insertId;
};

const getOrCreateProgram = async (connection, gymId, name, description) => {
  const existing = await queryOne(
    connection,
    'SELECT id FROM programs WHERE gym_id = ? AND name = ?',
    [gymId, name]
  );

  if (existing) {
    await connection.query(
      'UPDATE programs SET description = ?, is_active = TRUE WHERE id = ?',
      [description, existing.id]
    );
    return existing.id;
  }

  const [result] = await connection.query(
    'INSERT INTO programs (gym_id, name, description, is_active) VALUES (?, ?, ?, TRUE)',
    [gymId, name, description]
  );

  return result.insertId;
};

const getOrCreateTopic = async (connection, gymId, { programId, title, topicType, description }) => {
  const existing = await queryOne(
    connection,
    'SELECT id FROM curriculum_topics WHERE gym_id = ? AND title = ?',
    [gymId, title]
  );

  if (existing) {
    await connection.query(
      `UPDATE curriculum_topics
       SET program_id = ?, topic_type = ?, description = ?, is_active = TRUE
       WHERE id = ?`,
      [programId || null, topicType, description, existing.id]
    );
    return existing.id;
  }

  const [result] = await connection.query(
    `INSERT INTO curriculum_topics
     (gym_id, program_id, title, topic_type, description, is_active)
     VALUES (?, ?, ?, ?, ?, TRUE)`,
    [gymId, programId || null, title, topicType, description]
  );

  return result.insertId;
};

const getOrCreateTrainingMethod = async (connection, gymId, name, description) => {
  const existing = await queryOne(
    connection,
    'SELECT id FROM training_methods WHERE gym_id = ? AND name = ?',
    [gymId, name]
  );

  if (existing) {
    await connection.query(
      'UPDATE training_methods SET description = ?, is_active = TRUE WHERE id = ?',
      [description, existing.id]
    );
    return existing.id;
  }

  const [result] = await connection.query(
    'INSERT INTO training_methods (gym_id, name, description, is_active) VALUES (?, ?, ?, TRUE)',
    [gymId, name, description]
  );

  return result.insertId;
};

const getOrCreateScenario = async (connection, gymId, {
  programId,
  trainingMethodId,
  name,
  description,
  startingPositionTopicId,
  topObjective,
  bottomObjective,
  constraintsText,
  roundDurationSeconds
}) => {
  const existing = await queryOne(
    connection,
    'SELECT id FROM training_scenarios WHERE gym_id = ? AND name = ?',
    [gymId, name]
  );

  if (existing) {
    await connection.query(
      `UPDATE training_scenarios
       SET program_id = ?, training_method_id = ?, description = ?, starting_position_topic_id = ?,
           top_objective = ?, bottom_objective = ?, constraints_text = ?, round_duration_seconds = ?, is_active = TRUE
       WHERE id = ?`,
      [
        programId || null,
        trainingMethodId,
        description,
        startingPositionTopicId || null,
        topObjective,
        bottomObjective,
        constraintsText,
        roundDurationSeconds,
        existing.id
      ]
    );
    return existing.id;
  }

  const [result] = await connection.query(
    `INSERT INTO training_scenarios
     (
       gym_id, program_id, training_method_id, name, description, starting_position_topic_id,
       top_objective, bottom_objective, constraints_text, round_duration_seconds, is_active
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
    [
      gymId,
      programId || null,
      trainingMethodId,
      name,
      description,
      startingPositionTopicId || null,
      topObjective,
      bottomObjective,
      constraintsText,
      roundDurationSeconds
    ]
  );

  return result.insertId;
};

const getOrCreateMember = async (connection, gymId, { programId, firstName, lastName, email, beltRank }) => {
  const existing = await queryOne(
    connection,
    'SELECT id FROM members WHERE gym_id = ? AND email = ?',
    [gymId, email]
  );

  if (existing) {
    await connection.query(
      `UPDATE members
       SET program_id = ?, first_name = ?, last_name = ?, belt_rank = ?, is_active = TRUE
       WHERE id = ?`,
      [programId || null, firstName, lastName, beltRank, existing.id]
    );
    return existing.id;
  }

  const [result] = await connection.query(
    `INSERT INTO members (gym_id, program_id, first_name, last_name, email, belt_rank, is_active)
     VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
    [gymId, programId || null, firstName, lastName, email, beltRank]
  );

  return result.insertId;
};

const getOrCreateClass = async (connection, gymId, {
  programId,
  title,
  classDate,
  startTime,
  endTime,
  coachUserId,
  notes
}) => {
  const existing = await queryOne(
    connection,
    'SELECT id FROM classes WHERE gym_id = ? AND title = ? AND class_date = ?',
    [gymId, title, classDate]
  );

  if (existing) {
    await connection.query(
      `UPDATE classes
       SET program_id = ?, start_time = ?, end_time = ?, head_coach_user_id = ?, logged_by_user_id = ?, notes = ?
       WHERE id = ?`,
      [programId, startTime, endTime, coachUserId, coachUserId, notes, existing.id]
    );
    return existing.id;
  }

  const [result] = await connection.query(
    `INSERT INTO classes
     (gym_id, program_id, title, class_date, start_time, end_time, head_coach_user_id, logged_by_user_id, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [gymId, programId, title, classDate, startTime, endTime, coachUserId, coachUserId, notes]
  );

  return result.insertId;
};

const getOrCreatePlannedClass = async (connection, gymId, {
  programId,
  scenarioId,
  title,
  classDate,
  startTime,
  endTime,
  coachUserId,
  notes
}) => {
  const existing = await queryOne(
    connection,
    'SELECT id FROM planned_classes WHERE gym_id = ? AND title = ? AND class_date = ?',
    [gymId, title, classDate]
  );

  if (existing) {
    await connection.query(
      `UPDATE planned_classes
       SET program_id = ?, training_scenario_id = ?, start_time = ?, end_time = ?,
           head_coach_user_id = ?, status = 'planned', notes = ?
       WHERE id = ?`,
      [programId, scenarioId || null, startTime, endTime, coachUserId, notes, existing.id]
    );
    return existing.id;
  }

  const [result] = await connection.query(
    `INSERT INTO planned_classes
     (gym_id, program_id, training_scenario_id, title, class_date, start_time, end_time, head_coach_user_id, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'planned', ?)`,
    [gymId, programId, scenarioId || null, title, classDate, startTime, endTime, coachUserId, notes]
  );

  return result.insertId;
};

const addClassTopic = async (connection, classId, topicId, focusLevel = 'focus', notes = null) => {
  const existing = await queryOne(
    connection,
    'SELECT id FROM class_topics WHERE class_id = ? AND curriculum_topic_id = ?',
    [classId, topicId]
  );

  if (existing) return existing.id;

  const [result] = await connection.query(
    `INSERT INTO class_topics (class_id, curriculum_topic_id, coverage_type, focus_level, notes)
     VALUES (?, ?, 'taught', ?, ?)`,
    [classId, topicId, focusLevel, notes]
  );

  return result.insertId;
};

const addPlannedClassTopic = async (connection, plannedClassId, topicId, focusLevel = 'focus') => {
  const existing = await queryOne(
    connection,
    'SELECT id FROM planned_class_topics WHERE planned_class_id = ? AND curriculum_topic_id = ?',
    [plannedClassId, topicId]
  );

  if (existing) return existing.id;

  const [result] = await connection.query(
    'INSERT INTO planned_class_topics (planned_class_id, curriculum_topic_id, focus_level) VALUES (?, ?, ?)',
    [plannedClassId, topicId, focusLevel]
  );

  return result.insertId;
};

const addAttendance = async (connection, classId, memberId, attendanceStatus) => {
  const existing = await queryOne(
    connection,
    'SELECT id FROM class_members WHERE class_id = ? AND member_id = ?',
    [classId, memberId]
  );

  if (existing) {
    await connection.query(
      'UPDATE class_members SET attendance_status = ? WHERE id = ?',
      [attendanceStatus, existing.id]
    );
    return existing.id;
  }

  const [result] = await connection.query(
    'INSERT INTO class_members (class_id, member_id, attendance_status) VALUES (?, ?, ?)',
    [classId, memberId, attendanceStatus]
  );

  return result.insertId;
};

const addProgress = async (connection, memberId, topicId, userId, status, notes) => {
  const existing = await queryOne(
    connection,
    'SELECT id FROM member_topic_progress WHERE member_id = ? AND curriculum_topic_id = ?',
    [memberId, topicId]
  );

  if (existing) {
    await connection.query(
      `UPDATE member_topic_progress
       SET status = ?, notes = ?, updated_by_user_id = ?, last_reviewed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, notes, userId, existing.id]
    );
    return existing.id;
  }

  const [result] = await connection.query(
    `INSERT INTO member_topic_progress
     (member_id, curriculum_topic_id, status, notes, updated_by_user_id, last_reviewed_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [memberId, topicId, status, notes, userId]
  );

  return result.insertId;
};

const getOrCreateLibraryEntry = async (connection, gymId, {
  programId,
  topicId,
  userId,
  title,
  entryType,
  description,
  videoUrl,
  visibility
}) => {
  const existing = await queryOne(
    connection,
    'SELECT id FROM library_entries WHERE gym_id = ? AND title = ?',
    [gymId, title]
  );

  if (existing) {
    await connection.query(
      `UPDATE library_entries
       SET program_id = ?, curriculum_topic_id = ?, entry_type = ?, description = ?,
           video_url = ?, visibility = ?, is_active = TRUE
       WHERE id = ?`,
      [programId || null, topicId || null, entryType, description, videoUrl, visibility, existing.id]
    );
    return existing.id;
  }

  const [result] = await connection.query(
    `INSERT INTO library_entries
     (gym_id, program_id, curriculum_topic_id, created_by_user_id, title, entry_type, description, video_url, visibility, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
    [gymId, programId || null, topicId || null, userId, title, entryType, description, videoUrl, visibility]
  );

  return result.insertId;
};

const addTrainingEntry = async (connection, {
  classId,
  methodId,
  scenarioId,
  topicId,
  title,
  order,
  duration,
  constraints,
  topWin,
  bottomWin,
  notes
}) => {
  const existing = await queryOne(
    connection,
    'SELECT id FROM class_training_entries WHERE class_id = ? AND segment_title = ?',
    [classId, title]
  );

  if (existing) return existing.id;

  const [result] = await connection.query(
    `INSERT INTO class_training_entries
     (
       class_id, training_method_id, training_scenario_id, curriculum_topic_id, segment_title,
       segment_order, duration_minutes, constraints_text, win_condition_top, win_condition_bottom, notes
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [classId, methodId, scenarioId || null, topicId || null, title, order, duration, constraints, topWin, bottomWin, notes]
  );

  return result.insertId;
};

const seedDemoTenant = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const gymId = await getOrCreateGym(connection);
    const ownerId = await getOrCreateUser(connection, gymId);

    const fundamentalsProgramId = await getOrCreateProgram(
      connection,
      gymId,
      'Fundamentals',
      'Beginner-friendly core curriculum for guard, passing, escapes, and positional control.'
    );
    const nogiProgramId = await getOrCreateProgram(
      connection,
      gymId,
      'No-Gi Competition',
      'No-gi curriculum built around wrestling, leg locks, back takes, and decision making.'
    );

    const topics = {};
    const topicSeeds = [
      ['Closed Guard', 'position', fundamentalsProgramId, 'Core guard position for posture control, sweeps, and submissions.'],
      ['Scissor Sweep', 'technique', fundamentalsProgramId, 'Fundamental closed guard sweep using angle, knee shield structure, and post removal.'],
      ['Front Headlock', 'position', nogiProgramId, 'Upper-body control hub for guillotines, go-behinds, and spin-behind decisions.'],
      ['Knee Cut Pass', 'technique', fundamentalsProgramId, 'Pressure passing route through the knee line into side control or mount.'],
      ['Back Control', 'position', nogiProgramId, 'Dominant control position for seatbelt, hooks, and choke progressions.'],
      ['Straight Ankle Lock', 'submission', nogiProgramId, 'Foundational leg lock built around foot control, hip extension, and knee-line awareness.'],
      ['Side Control Escape', 'escape', fundamentalsProgramId, 'Frame, shrimp, underhook, and re-guard pathways from bottom side control.'],
      ['Guard Retention', 'concept', fundamentalsProgramId, 'Recover frames, knees, hooks, and angle before the pass settles.']
    ];

    for (const [title, topicType, programId, description] of topicSeeds) {
      topics[title] = await getOrCreateTopic(connection, gymId, {
        programId,
        title,
        topicType,
        description
      });
    }

    const methods = {};
    const methodSeeds = [
      ['Technical Instruction', 'Coach-led explanation, demonstration, and drilling.'],
      ['Constraint-Led Game', 'Task-based games that shape better reactions and decisions.'],
      ['Positional Sparring', 'Live rounds from a defined starting position.']
    ];

    for (const [name, description] of methodSeeds) {
      methods[name] = await getOrCreateTrainingMethod(connection, gymId, name, description);
    }

    const closedGuardScenarioId = await getOrCreateScenario(connection, gymId, {
      programId: fundamentalsProgramId,
      trainingMethodId: methods['Constraint-Led Game'],
      name: 'Closed Guard Posture Battle',
      description: 'Bottom player works posture breaks and angle creation. Top player wins posture and opens guard safely.',
      startingPositionTopicId: topics['Closed Guard'],
      topObjective: 'Open the guard and establish safe passing posture.',
      bottomObjective: 'Break posture and create sweep or submission entries.',
      constraintsText: 'Start in closed guard. Bottom may sweep or submit. Top scores by standing safely or opening guard.',
      roundDurationSeconds: 300
    });

    const frontHeadlockScenarioId = await getOrCreateScenario(connection, gymId, {
      programId: nogiProgramId,
      trainingMethodId: methods['Positional Sparring'],
      name: 'Front Headlock Go-Behind Game',
      description: 'Attacker chains snap-down pressure, spin-behind routes, and guillotine threats while defender builds posture.',
      startingPositionTopicId: topics['Front Headlock'],
      topObjective: 'Score the go-behind, back exposure, or front-headlock finish.',
      bottomObjective: 'Recover posture, peek out, or square back up.',
      constraintsText: 'Start from front headlock. Reset when either player clearly wins position.',
      roundDurationSeconds: 240
    });

    const members = {};
    const memberSeeds = [
      ['Avery', 'Rivera', 'avery.demo@example.com', 'White - 2 stripe', fundamentalsProgramId],
      ['Jordan', 'Kim', 'jordan.demo@example.com', 'Blue', fundamentalsProgramId],
      ['Morgan', 'Lee', 'morgan.demo@example.com', 'Purple', nogiProgramId],
      ['Taylor', 'Brooks', 'taylor.demo@example.com', 'White', fundamentalsProgramId],
      ['Riley', 'Patel', 'riley.demo@example.com', 'Blue - 1 stripe', nogiProgramId]
    ];

    for (const [firstName, lastName, email, beltRank, programId] of memberSeeds) {
      members[email] = await getOrCreateMember(connection, gymId, {
        programId,
        firstName,
        lastName,
        email,
        beltRank
      });
    }

    const closedGuardClassId = await getOrCreateClass(connection, gymId, {
      programId: fundamentalsProgramId,
      title: 'Demo Fundamentals - Closed Guard Sweeps',
      classDate: addDays(-2),
      startTime: '18:00:00',
      endTime: '19:15:00',
      coachUserId: ownerId,
      notes: 'Demo completed class showing topics, attendance, training entries, and member progress.'
    });

    await addClassTopic(connection, closedGuardClassId, topics['Closed Guard'], 'focus', 'Posture control and angle creation.');
    await addClassTopic(connection, closedGuardClassId, topics['Scissor Sweep'], 'focus', 'Scissor sweep mechanics and timing.');
    await addTrainingEntry(connection, {
      classId: closedGuardClassId,
      methodId: methods['Constraint-Led Game'],
      scenarioId: closedGuardScenarioId,
      topicId: topics['Closed Guard'],
      title: 'Closed Guard Posture Battle',
      order: 1,
      duration: 12,
      constraints: 'Top must open guard before passing. Bottom scores by sweep, submission entry, or posture break.',
      topWin: 'Open guard and establish passing posture.',
      bottomWin: 'Break posture and create a sweep or submission entry.',
      notes: 'Good demo segment for showing how scenarios become class training entries.'
    });

    await addAttendance(connection, closedGuardClassId, members['avery.demo@example.com'], 'present');
    await addAttendance(connection, closedGuardClassId, members['jordan.demo@example.com'], 'present');
    await addAttendance(connection, closedGuardClassId, members['taylor.demo@example.com'], 'absent');

    await addProgress(connection, members['avery.demo@example.com'], topics['Scissor Sweep'], ownerId, 'introduced', 'Introduced through class attendance demo.');
    await addProgress(connection, members['jordan.demo@example.com'], topics['Closed Guard'], ownerId, 'developing', 'Developing posture control and angle recognition.');

    const frontHeadlockClassId = await getOrCreateClass(connection, gymId, {
      programId: nogiProgramId,
      title: 'Demo No-Gi - Front Headlock Decisions',
      classDate: addDays(-1),
      startTime: '19:00:00',
      endTime: '20:15:00',
      coachUserId: ownerId,
      notes: 'Demo no-gi class for front-headlock, back-take, and decision-tree style content.'
    });

    await addClassTopic(connection, frontHeadlockClassId, topics['Front Headlock'], 'focus', 'Go-behind versus submission decision points.');
    await addClassTopic(connection, frontHeadlockClassId, topics['Back Control'], 'secondary', 'Back control after spin-behind.');
    await addAttendance(connection, frontHeadlockClassId, members['morgan.demo@example.com'], 'present');
    await addAttendance(connection, frontHeadlockClassId, members['riley.demo@example.com'], 'present');

    const upcomingClassId = await getOrCreatePlannedClass(connection, gymId, {
      programId: fundamentalsProgramId,
      scenarioId: closedGuardScenarioId,
      title: 'Demo Planned Class - Guard Retention',
      classDate: addDays(2),
      startTime: '18:00:00',
      endTime: '19:15:00',
      coachUserId: ownerId,
      notes: 'Upcoming demo class showing the planned-class workflow before completion.'
    });

    await addPlannedClassTopic(connection, upcomingClassId, topics['Guard Retention'], 'focus');
    await addPlannedClassTopic(connection, upcomingClassId, topics['Side Control Escape'], 'review');

    await getOrCreateLibraryEntry(connection, gymId, {
      programId: fundamentalsProgramId,
      topicId: topics['Closed Guard'],
      userId: ownerId,
      title: 'Closed Guard Teaching Notes',
      entryType: 'concept',
      description: 'Coach-facing demo notes for posture breaking, angle creation, and safe sweep progressions.',
      videoUrl: '',
      visibility: 'coach_only'
    });

    await getOrCreateLibraryEntry(connection, gymId, {
      programId: fundamentalsProgramId,
      topicId: topics['Scissor Sweep'],
      userId: ownerId,
      title: 'Scissor Sweep Demo Clip',
      entryType: 'video_note',
      description: 'Short demo resource connected to the curriculum topic for Library and Index testing.',
      videoUrl: 'https://example.com/demo-scissor-sweep',
      visibility: 'member_visible'
    });

    await getOrCreateLibraryEntry(connection, gymId, {
      programId: nogiProgramId,
      topicId: topics['Front Headlock'],
      userId: ownerId,
      title: 'Front Headlock Decision Notes',
      entryType: 'technique',
      description: 'Demo resource showing how front headlock connects to guillotine threats, spin-behinds, and back exposure.',
      videoUrl: '',
      visibility: 'coach_only'
    });

    await connection.commit();

    return {
      gymId,
      ownerId,
      email: DEMO_OWNER.email,
      password: DEMO_OWNER.password,
      gymName: DEMO_GYM.name
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

seedDemoTenant()
  .then((result) => {
    console.log('Demo tenant ready.');
    console.log(`Gym: ${result.gymName} (#${result.gymId})`);
    console.log(`Login email: ${result.email}`);
    console.log(`Login password: ${result.password}`);
  })
  .catch((error) => {
    console.error('Demo tenant seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
