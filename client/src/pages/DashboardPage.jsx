import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import ExpandableSection from '../components/ExpandableSection';
import { useAuth } from '../hooks/useAuth';
import { formatLabel } from '../utils/formatLabel';

const getLocalIsoDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentClasses, setRecentClasses] = useState([]);
  const [topicCoverage, setTopicCoverage] = useState([]);
  const [trainingMethodUsage, setTrainingMethodUsage] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [topics, setTopics] = useState([]);
  const [classes, setClasses] = useState([]);
  const [plannedClasses, setPlannedClasses] = useState([]);
  const [libraryEntries, setLibraryEntries] = useState([]);
  const [members, setMembers] = useState([]);
  const [trainingScenarios, setTrainingScenarios] = useState([]);
  const [attendanceSnapshot, setAttendanceSnapshot] = useState({
    classesNeedingAttendance: 0,
    classesWithAttendance: 0
  });
  const [showDashboardGuide, setShowDashboardGuide] = useState(true);
  const [hideSetupChecklist, setHideSetupChecklist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const guideStorageKey = user?.id ? `progressory-dashboard-guide-hidden-${user.id}` : '';
  const setupStorageKey = user?.id ? `progressory-dashboard-setup-hidden-${user.id}` : '';

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        recentClassesRes,
        topicCoverageRes,
        trainingMethodUsageRes,
        programsRes,
        topicsRes,
        classesRes,
        plannedClassesRes,
        libraryEntriesRes,
        membersRes,
        trainingScenariosRes
      ] = await Promise.all([
        api.get('/reports/recent-classes?limit=5'),
        api.get('/reports/topic-coverage'),
        api.get('/reports/training-method-usage'),
        api.get('/programs'),
        api.get('/topics'),
        api.get('/classes'),
        api.get('/planned-classes'),
        api.get('/library'),
        api.get('/members'),
        api.get('/training-scenarios')
      ]);

      const allClasses = classesRes.data;
      const allMembers = membersRes.data;
      const attendanceResponses = await Promise.all(
        allClasses.map(async (classItem) => {
          const response = await api.get(`/classes/${classItem.id}/members`);
          return {
            classItem,
            recordedMembers: response.data
          };
        })
      );

      const getEligibleMembersForClass = (classItem) => {
        const activeMembers = allMembers.filter((member) => member.is_active);

        if (!classItem.program_id) {
          return activeMembers;
        }

        const matchingMembers = activeMembers.filter((member) => (
          member.program_id === null ||
          String(member.program_id) === String(classItem.program_id)
        ));

        return matchingMembers.length > 0 ? matchingMembers : activeMembers;
      };

      const classesNeedingAttendance = attendanceResponses.filter(({ classItem, recordedMembers }) => {
        const eligibleMembers = getEligibleMembersForClass(classItem);

        if (eligibleMembers.length === 0) {
          return false;
        }

        return recordedMembers.length < eligibleMembers.length;
      }).length;

      const classesWithAttendance = attendanceResponses.filter(({ recordedMembers }) => recordedMembers.length > 0).length;

      setRecentClasses(recentClassesRes.data);
      setTopicCoverage(topicCoverageRes.data);
      setTrainingMethodUsage(trainingMethodUsageRes.data);
      setPrograms(programsRes.data);
      setTopics(topicsRes.data);
      setClasses(allClasses);
      setPlannedClasses(plannedClassesRes.data);
      setLibraryEntries(libraryEntriesRes.data);
      setMembers(allMembers);
      setTrainingScenarios(trainingScenariosRes.data);
      setAttendanceSnapshot({
        classesNeedingAttendance,
        classesWithAttendance
      });
    } catch (err) {
      console.error('Load dashboard error:', err);
      setError(err.response?.data?.message || 'Couldn\'t load the dashboard right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const summaryCards = [
    { label: 'Programs', value: programs.length },
    { label: 'Topics', value: topics.length },
    { label: 'Classes', value: classes.length },
    {
      label: 'Training Methods Used',
      value: trainingMethodUsage.filter(
        (method) => Number(method.total_segments) > 0
      ).length
    }
  ];

  const todayIsoDate = getLocalIsoDate();
  const todayClassCount = classes.filter((classItem) => classItem.class_date === todayIsoDate).length;
  const todayPlannedCount = plannedClasses.filter((classItem) => classItem.class_date === todayIsoDate).length;
  const unlinkedLibraryCount = libraryEntries.filter((entry) => entry.is_active && !entry.curriculum_topic_id).length;
  const activeTrainingScenarioCount = trainingScenarios.filter((scenario) => scenario.is_active).length;
  const activeMemberCount = members.filter((member) => member.is_active).length;
  const activeLibraryVideoCount = libraryEntries.filter((entry) => entry.is_active && entry.video_url).length;

  const setupTasks = useMemo(() => ([
    {
      key: 'planned',
      title: 'Plan your first class',
      description: 'Start in Planned Classes so coaches know what is supposed to happen before class starts.',
      helper: 'This gives the gym a usable day-to-day workflow right away.',
      to: '/planned-classes',
      complete: plannedClasses.length > 0
    },
    {
      key: 'topics',
      title: 'Add topics for your curriculum',
      description: 'Build the topic structure first so classes, Library, and the Decision Tree all connect cleanly.',
      helper: 'Without topics, the rest of the app feels much more disconnected.',
      to: '/index',
      complete: topics.length > 0
    },
    {
      key: 'scenarios',
      title: 'Add reusable training scenarios',
      description: 'Save common class ideas so planning gets faster after the first few sessions.',
      helper: 'This helps coaches reuse good class structures instead of rebuilding from scratch.',
      to: '/training-scenarios',
      complete: activeTrainingScenarioCount > 0
    },
    {
      key: 'members',
      title: 'Add your members',
      description: 'Get members in the system so attendance and progress can start being useful.',
      helper: 'The coach workflow becomes much better once people can actually be checked in.',
      to: '/members',
      complete: activeMemberCount > 0
    },
    {
      key: 'attendance',
      title: 'Record attendance for a class',
      description: 'Once a class and members exist, record attendance so the app starts tracking real gym activity.',
      helper: 'This is the point where the setup becomes a working coaching system instead of just structure.',
      to: '/classes?workflow=attendance-ready',
      complete: attendanceSnapshot.classesWithAttendance > 0
    }
  ]), [
    activeMemberCount,
    activeTrainingScenarioCount,
    attendanceSnapshot.classesWithAttendance,
    plannedClasses.length,
    topics.length
  ]);

  const nextSetupTask = setupTasks.find((task) => !task.complete) || null;
  const upcomingSetupTasks = nextSetupTask
    ? setupTasks.filter((task) => !task.complete && task.key !== nextSetupTask.key).slice(0, 3)
    : [];
  const setupComplete = !nextSetupTask;
  const completedSetupCount = setupTasks.filter((task) => task.complete).length;
  const setupProgressPercent = Math.round((completedSetupCount / setupTasks.length) * 100);

  useEffect(() => {
    if (!guideStorageKey || typeof window === 'undefined') {
      return;
    }

    setShowDashboardGuide(window.localStorage.getItem(guideStorageKey) !== 'true');
  }, [guideStorageKey]);

  useEffect(() => {
    if (!setupStorageKey || typeof window === 'undefined') {
      return;
    }

    const storedHidden = window.localStorage.getItem(setupStorageKey) === 'true';
    setHideSetupChecklist(storedHidden);
  }, [setupStorageKey]);

  useEffect(() => {
    if (!setupComplete) {
      setHideSetupChecklist(false);
      if (setupStorageKey && typeof window !== 'undefined') {
        window.localStorage.removeItem(setupStorageKey);
      }
    }
  }, [setupComplete, setupStorageKey]);

  const dismissDashboardGuide = () => {
    setShowDashboardGuide(false);
    if (guideStorageKey && typeof window !== 'undefined') {
      window.localStorage.setItem(guideStorageKey, 'true');
    }
  };

  const handleHideSetupChecklist = () => {
    setHideSetupChecklist(true);
    if (setupStorageKey && typeof window !== 'undefined') {
      window.localStorage.setItem(setupStorageKey, 'true');
    }
  };

  const handleShowSetupChecklist = () => {
    setHideSetupChecklist(false);
    if (setupStorageKey && typeof window !== 'undefined') {
      window.localStorage.removeItem(setupStorageKey);
    }
  };

  const helpfulExtras = [
    {
      key: 'libraryVideos',
      title: 'Add videos to your Library',
      description: 'Save coach notes, video links, and member-facing references so people can revisit what they learned.',
      helper: activeLibraryVideoCount > 0
        ? `${activeLibraryVideoCount} video resource${activeLibraryVideoCount === 1 ? '' : 's'} already linked.`
        : 'This is a strong next step once your classes, topics, scenarios, members, and attendance are already flowing.',
      to: '/library',
      complete: activeLibraryVideoCount > 0
    }
  ];

  const quickActions = [
    {
      title: 'Need to plan a class?',
      description: 'Go straight to Planned Classes to build the next session before it gets missed.',
      to: '/planned-classes'
    },
    {
      title: 'Finished a class?',
      description: todayClassCount > 0
        ? `Open only today’s ${todayClassCount} completed class${todayClassCount === 1 ? '' : 'es'} so you can finish topics, notes, and attendance fast.`
        : 'Open today’s completed-class view so you can log topics, notes, and attendance without digging through older sessions.',
      to: `/classes?workflow=today-completed&classDate=${todayIsoDate}`
    },
    {
      title: 'Need to log an unplanned class?',
      description: 'Jump into Completed Classes with the New Class form already open for anything that happened off-plan.',
      to: '/classes?workflow=create-class'
    },
    {
      title: 'Need reusable scenarios?',
      description: 'Open Training Scenarios to build class templates you can keep pulling into future sessions.',
      to: '/training-scenarios'
    },
    {
      title: 'Need to organize your topics for your curriculum?',
      description: 'Go to Curriculum Index when you need to add topics first so classes, Library, and the Tree stay connected.',
      to: '/index'
    },
    {
      title: 'Need a teaching resource?',
      description: 'Open Library to save coach notes, video links, and topic-linked references for later reuse.',
      to: '/library'
    },
    {
      title: 'Need to take attendance?',
      description: 'Open the classes that still need attendance so coaches can finish class admin fast.',
      to: '/classes?workflow=attendance-ready'
    }
  ];

  const coachingQueue = [
    {
      title: 'Plan today’s classes',
      value: todayPlannedCount,
      description: todayPlannedCount > 0
        ? `${todayPlannedCount} planned class${todayPlannedCount === 1 ? '' : 'es'} are scheduled for today.`
        : 'No planned classes are scheduled for today yet.',
      to: '/planned-classes'
    },
    {
      title: 'Finish class attendance',
      value: attendanceSnapshot.classesNeedingAttendance,
      description: attendanceSnapshot.classesNeedingAttendance > 0
        ? `${attendanceSnapshot.classesNeedingAttendance} class${attendanceSnapshot.classesNeedingAttendance === 1 ? '' : 'es'} still need attendance or final class admin attention.`
        : 'No classes currently need attendance attention.',
      to: '/classes?workflow=attendance-ready'
    },
    {
      title: 'Library items needing topics',
      value: unlinkedLibraryCount,
      description: unlinkedLibraryCount > 0
        ? `${unlinkedLibraryCount} library entr${unlinkedLibraryCount === 1 ? 'y still needs a topic link.' : 'ies still need topic links.'}`
        : 'All active library entries are linked to topics right now.',
      to: '/library?needsTopic=true'
    }
  ];

  const topTopic = topicCoverage
    .slice()
    .sort((a, b) => Number(b.total_times_used) - Number(a.total_times_used))[0];

  const topMethod = trainingMethodUsage
    .slice()
    .sort((a, b) => Number(b.total_segments) - Number(a.total_segments))[0];

  return (
    <Layout>
      <div className="dashboard-page">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-intro">
          Use this page like a coach workflow. Pick the next job you need to handle, jump there directly, and keep the day moving without hunting through the app.
        </p>

        {error && <p className="error-text">{error}</p>}

        {loading ? (
          <p className="empty-state">Loading your dashboard...</p>
        ) : (
          <>
            {showDashboardGuide ? (
              <section className="page-section dashboard-guide-section">
                <div className="section-header">
                  <div>
                    <h3>How the app flows</h3>
                    <p className="section-note">
                      Use this quick guide if you are opening Progressory for the first time or showing a coach how the system is supposed to work.
                    </p>
                  </div>
                  <div className="inline-actions">
                    {!setupComplete || !hideSetupChecklist ? (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={handleShowSetupChecklist}
                      >
                        Show setup checklist
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={dismissDashboardGuide}
                    >
                      Not now
                    </button>
                  </div>
                </div>
                <div className="dashboard-guide-grid">
                  <div className="dashboard-guide-highlight">
                    <span className="eyebrow">Core setup is in place</span>
                    <strong>
                      Build your structure first, then let the daily coaching workflow take over.
                    </strong>
                    <p className="meta-text">
                      Start with programs, curriculum topics, reusable scenarios, and members. Then plan classes, finish class admin, record attendance, and add Library resources when you are ready to support coaches and members even more.
                    </p>
                  </div>
                  <div className="dashboard-guide-steps">
                    <div className="dashboard-guide-step">
                      <strong>1. Build the structure</strong>
                      <span>Add programs, curriculum topics, scenarios, and members.</span>
                    </div>
                    <div className="dashboard-guide-step">
                      <strong>2. Run the class workflow</strong>
                      <span>Plan classes first, then finish attendance, topics, and training entries after class.</span>
                    </div>
                    <div className="dashboard-guide-step">
                      <strong>3. Add the extras later</strong>
                      <span>Library, Decision Tree, and progress become much stronger once the gym workflow is already moving.</span>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="page-section dashboard-hero-section">
              <div className="section-header">
                <div>
                  <h3>Quick Actions</h3>
                  <p className="section-note">Use these as your next-step guide instead of a second navigation menu.</p>
                </div>
              </div>
              <div className="action-grid">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    to={action.to}
                    className="action-card dashboard-action-card"
                  >
                    <strong>{action.title}</strong>
                    <div className="detail-block">
                      <div className="meta-text">{action.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {!hideSetupChecklist ? (
              <section className="page-section dashboard-onboarding-section">
                <div className="section-header">
                  <div>
                    <h3>Start Here</h3>
                    <p className="section-note">Use this if you are setting up the gym or onboarding a coach for the first time.</p>
                  </div>
                  {setupComplete ? (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleHideSetupChecklist}
                    >
                      Hide setup checklist
                    </button>
                  ) : null}
                </div>
                <div className="dashboard-setup-progress">
                  <div className="dashboard-setup-progress-header">
                    <strong>Setup progress</strong>
                    <span className="meta-text">
                      {completedSetupCount}/{setupTasks.length} core steps complete
                    </span>
                  </div>
                  <div className="dashboard-setup-progress-bar" aria-hidden="true">
                    <span style={{ width: `${setupProgressPercent}%` }} />
                  </div>
                  <div className="dashboard-setup-progress-checklist">
                    {setupTasks.map((task) => (
                      <div
                        key={task.key}
                        className={`dashboard-setup-progress-item${task.complete ? ' is-complete' : ''}`}
                      >
                        <span>{task.complete ? 'Complete' : 'Next'}</span>
                        <strong>{task.title}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                {setupComplete ? (
                  <div className="dashboard-setup-card">
                    <strong>Core setup is in place</strong>
                    <div className="detail-block">
                      <div className="meta-text">
                        You have planned classes, curriculum topics, training scenarios, members, and attendance in motion. The next best extras will help coaches and members get even more out of the app.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="dashboard-setup-grid">
                    <Link to={nextSetupTask.to} className="action-card dashboard-action-card dashboard-setup-current">
                      <strong>Next step: {nextSetupTask.title}</strong>
                      <div className="detail-block">
                        <div className="meta-text">{nextSetupTask.description}</div>
                        <div className="dashboard-setup-helper">{nextSetupTask.helper}</div>
                      </div>
                    </Link>

                    <div className="dashboard-setup-upcoming">
                      <strong>Coming up after that</strong>
                      <div className="dashboard-setup-list">
                        {upcomingSetupTasks.map((task) => (
                          <Link key={task.key} to={task.to} className="dashboard-setup-item">
                            <span>{task.title}</span>
                            <small>{task.description}</small>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            ) : (
              <section className="page-section dashboard-onboarding-section dashboard-onboarding-collapsed">
                <div className="section-header">
                  <div>
                    <h3>Setup checklist hidden</h3>
                    <p className="section-note">
                      Your core onboarding steps are complete. Bring the checklist back any time if you want the fuller setup view again.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleShowSetupChecklist}
                  >
                    Show setup checklist
                  </button>
                </div>
              </section>
            )}

            {setupComplete ? (
              <section className="page-section dashboard-extras-section">
                <div className="section-header">
                  <div>
                    <h3>Helpful Extras</h3>
                    <p className="section-note">These are the next upgrades that make the app more valuable for coaches and members after the core workflow is already working.</p>
                  </div>
                </div>
                <div className="action-grid">
                  {helpfulExtras.map((item) => (
                    <Link key={item.key} to={item.to} className="action-card dashboard-action-card dashboard-extra-card">
                      <strong>{item.title}</strong>
                      <div className="detail-block">
                        <div className="meta-text">{item.description}</div>
                        <div className="dashboard-setup-helper">{item.helper}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="stats-grid dashboard-stats-grid">
              {summaryCards.map((card) => (
                <div key={card.label} className="stat-card">
                  <div className="stat-label">{card.label}</div>
                  <div className="stat-value">{card.value}</div>
                </div>
              ))}
            </section>

            <section className="page-section dashboard-queue-section">
              <div className="section-header">
                <div>
                  <h3>Today’s Coaching Queue</h3>
                  <p className="section-note">These are the fastest next-step actions for keeping the gym day clean and current.</p>
                </div>
              </div>
              <div className="action-grid">
                {coachingQueue.map((item) => (
                  <Link key={item.title} to={item.to} className="action-card dashboard-action-card dashboard-queue-card">
                    <strong>{item.title}</strong>
                    <div className="dashboard-queue-value">{item.value}</div>
                    <div className="detail-block">
                      <div className="meta-text">{item.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <ExpandableSection
              title="Recent Classes"
              note="The most recent sessions logged by your team."
              summary="Keep this collapsed unless you want a quick look at the most recent logged sessions."
              className="dashboard-primary-section"
              actions={<Link to="/classes" className="secondary-button">Manage Classes</Link>}
            >

              {recentClasses.length === 0 ? (
                <p className="empty-state">No classes have been logged yet.</p>
              ) : (
                <ul className="card-list">
                  {recentClasses.map((item) => (
                    <li key={item.id} className="card-item dashboard-compact-card">
                      <strong>{item.title || 'Untitled Class'}</strong>
                      <div className="detail-block">
                        <div className="meta-text">Program: {item.program_name}</div>
                        <div className="meta-text">
                          Coach: {item.head_coach_first_name} {item.head_coach_last_name}
                        </div>
                        <div className="meta-text">
                          Date: {new Date(item.class_date).toLocaleDateString()}
                        </div>
                        <div className="meta-text">
                          Time: {item.start_time || 'N/A'} - {item.end_time || 'N/A'}
                        </div>
                        <div>{item.notes || 'No notes added yet.'}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ExpandableSection>

            <section className="two-column-grid dashboard-insights-grid">
              <ExpandableSection
                title="Top Topic"
                note="The most-used curriculum topic right now."
                summary="Expand when you want a quick signal on which topic is showing up the most."
              >
                <div className="section-header">
                </div>

                {!topTopic ? (
                  <p className="empty-state">No topic usage has been logged yet.</p>
                ) : (
                  <div className="card-item dashboard-compact-card">
                    <strong>{topTopic.topic_title}</strong>
                    <div className="detail-block">
                      <div className="meta-text">Type: {formatLabel(topTopic.topic_type)}</div>
                      <div className="meta-text">
                        Program: {topTopic.program_name || 'None'}
                      </div>
                      <div className="meta-text">
                        Total Uses: {Number(topTopic.total_times_used)}
                      </div>
                      <div className="meta-text">
                        Focus Count: {Number(topTopic.focus_count)}
                      </div>
                    </div>
                  </div>
                )}
              </ExpandableSection>

              <ExpandableSection
                title="Top Training Method"
                note="The method showing up most often in logged segments."
                summary="Expand when you want a quick signal on which training method is dominating the logged classes."
              >
                <div className="section-header">
                </div>

                {!topMethod ? (
                  <p className="empty-state">No training method usage has been logged yet.</p>
                ) : (
                  <div className="card-item dashboard-compact-card">
                    <strong>{topMethod.training_method_name}</strong>
                    <div className="detail-block">
                      <div>{topMethod.description || 'No description added yet.'}</div>
                      <div className="meta-text">
                        Total Segments: {Number(topMethod.total_segments)}
                      </div>
                      <div className="meta-text">
                        Total Duration: {Number(topMethod.total_duration_minutes)} minutes
                      </div>
                    </div>
                  </div>
                )}
              </ExpandableSection>
            </section>

            <ExpandableSection
              title="Want A Closer Look?"
              note="Open Reports when you want a deeper look at trends instead of quick signals."
              summary="Expand when you want to jump from quick workflow actions into deeper reporting."
              className="dashboard-cta-section"
              defaultOpen={false}
            >
              <Link to="/reports" className="action-card dashboard-report-card">
                <strong>Open Reports</strong>
                <div className="detail-block">
                  <div className="meta-text">
                    Explore underused topics, method usage, and broader curriculum trends.
                  </div>
                  <div className="dashboard-report-link-text">Go to Reports</div>
                </div>
              </Link>
            </ExpandableSection>
          </>
        )}
      </div>
    </Layout>
  );
}
