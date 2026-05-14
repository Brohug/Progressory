import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const isMember = user?.role === 'member';
  const isManagement = user?.role === 'owner' || user?.role === 'admin';
  const [recentClasses, setRecentClasses] = useState([]);
  const [topicCoverage, setTopicCoverage] = useState([]);
  const [trainingMethodUsage, setTrainingMethodUsage] = useState([]);
  const [topics, setTopics] = useState([]);
  const [classes, setClasses] = useState([]);
  const [plannedClasses, setPlannedClasses] = useState([]);
  const [libraryEntries, setLibraryEntries] = useState([]);
  const [members, setMembers] = useState([]);
  const [trainingScenarios, setTrainingScenarios] = useState([]);
  const [memberProgress, setMemberProgress] = useState([]);
  const [attendanceSnapshot, setAttendanceSnapshot] = useState({
    classesNeedingAttendance: 0,
    classesWithAttendance: 0
  });
  const [tutorialState, setTutorialState] = useState('prompt');
  const [isMinimizedTutorialExpanded, setIsMinimizedTutorialExpanded] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [hideSetupChecklist, setHideSetupChecklist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tutorialStorageKey = user?.id ? `progressory-dashboard-tutorial-state-v7-${user.id}` : '';
  const setupStorageKey = user?.id ? `progressory-dashboard-setup-hidden-v2-${user.id}` : '';

  const loadDashboardData = useCallback(async () => {
    if (isMember) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const [
        recentClassesRes,
        topicCoverageRes,
        trainingMethodUsageRes,
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
  }, [isMember]);

  useEffect(() => {
    if (!isMember) {
      loadDashboardData();
    }
  }, [isMember, loadDashboardData]);

  const todayIsoDate = getLocalIsoDate();
  const todayClassCount = classes.filter((classItem) => classItem.class_date === todayIsoDate).length;
  const todayPlannedCount = plannedClasses.filter((classItem) => classItem.class_date === todayIsoDate).length;
  const activeTrainingScenarioCount = trainingScenarios.filter((scenario) => scenario.is_active).length;
  const activeMemberCount = members.filter((member) => member.is_active).length;
  const activeLibraryVideoCount = libraryEntries.filter((entry) => entry.is_active && entry.video_url).length;

  const setupTasks = useMemo(() => ([
    {
      key: 'planned',
      title: 'Plan your first class',
      description: 'Start in Class Planner so coaches know what is supposed to happen before class starts.',
      helper: 'This gives the gym a usable day-to-day workflow right away.',
      to: '/planned-classes',
      complete: plannedClasses.length > 0
    },
    {
      key: 'topics',
      title: 'Add topics for your curriculum',
      description: 'Build the topic structure first so classes, Library, and Decision Trees all connect cleanly.',
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

  const tutorialSteps = useMemo(() => {
    const steps = [
      {
        key: 'dashboard-quick-actions',
        title: 'Quick Actions',
        description: 'Start here when you already know the coaching job you need to handle right now.'
      },
      {
        key: 'dashboard-start-here',
        title: 'Start Here',
        description: 'This checklist is the main owner setup flow: structure first, then daily coaching workflow.'
      },
      {
        key: 'dashboard-coaching-queue',
        title: 'Today',
        description: 'Use this to spot the classes or library items that still need follow-through.'
      }
    ];

    if (setupComplete) {
      steps.push({
        key: 'dashboard-helpful-extras',
        title: 'Helpful Extras',
        description: 'Once the gym is already flowing, add videos and other deeper support tools here.'
      });
    }

    return steps;
  }, [setupComplete]);

  const activeTutorialStep = tutorialSteps[currentTutorialStep] || null;
  const isTutorialActive = tutorialState === 'active';

  useEffect(() => {
    if (!tutorialStorageKey || typeof window === 'undefined') {
      return;
    }

    const storedState = window.localStorage.getItem(tutorialStorageKey);
    setTutorialState(storedState || 'prompt');
  }, [tutorialStorageKey]);

  useEffect(() => {
    if (!setupStorageKey || typeof window === 'undefined') {
      return;
    }

    const storedHidden = window.localStorage.getItem(setupStorageKey) === 'true';
    setHideSetupChecklist(storedHidden);
  }, [setupStorageKey]);

  useEffect(() => {
    if (setupComplete) {
      setHideSetupChecklist(true);
      if (setupStorageKey && typeof window !== 'undefined') {
        window.localStorage.setItem(setupStorageKey, 'true');
      }
      return;
    }

    if (!setupComplete) {
      setHideSetupChecklist(false);
      if (setupStorageKey && typeof window !== 'undefined') {
        window.localStorage.removeItem(setupStorageKey);
      }
    }
  }, [setupComplete, setupStorageKey]);

  useEffect(() => {
    if (!isTutorialActive || !activeTutorialStep || typeof window === 'undefined') {
      return;
    }

    const element = window.document.getElementById(activeTutorialStep.key);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeTutorialStep, isTutorialActive]);

  const persistTutorialState = (nextState) => {
    setTutorialState(nextState);
    if (tutorialStorageKey && typeof window !== 'undefined') {
      window.localStorage.setItem(tutorialStorageKey, nextState);
    }
  };

  const handleShowSetupChecklist = () => {
    setHideSetupChecklist(false);
    if (setupStorageKey && typeof window !== 'undefined') {
      window.localStorage.removeItem(setupStorageKey);
    }
  };

  const handleHideSetupChecklist = () => {
    setHideSetupChecklist(true);
    if (setupStorageKey && typeof window !== 'undefined') {
      window.localStorage.setItem(setupStorageKey, 'true');
    }
  };

  const startTutorial = () => {
    handleShowSetupChecklist();
    setIsMinimizedTutorialExpanded(false);
    setCurrentTutorialStep(0);
    persistTutorialState('active');
  };

  const minimizeTutorial = () => {
    setIsMinimizedTutorialExpanded(false);
    persistTutorialState(setupComplete ? 'completed' : 'minimized');
  };

  const advanceTutorial = () => {
    if (currentTutorialStep >= tutorialSteps.length - 1) {
      persistTutorialState('completed');
      return;
    }

    setCurrentTutorialStep((prev) => prev + 1);
  };

  const rewindTutorial = () => {
    setCurrentTutorialStep((prev) => Math.max(prev - 1, 0));
  };

  const expandMinimizedTutorial = () => {
    setIsMinimizedTutorialExpanded(true);
  };

  const collapseMinimizedTutorial = () => {
    setIsMinimizedTutorialExpanded(false);
  };

  const getTutorialSectionClass = (sectionKey) => {
    if (!isTutorialActive) {
      return '';
    }

    return activeTutorialStep?.key === sectionKey
      ? ' dashboard-tutorial-highlight'
      : ' dashboard-tutorial-dimmed';
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

  const memberVisibleLibraryEntries = libraryEntries.filter(
    (entry) => entry.is_active && entry.visibility === 'member_visible'
  );
  const upcomingMemberClasses = plannedClasses
    .filter((item) => item.status === 'planned')
    .sort((a, b) => {
      const left = `${a.class_date || ''} ${a.start_time || '00:00:00'}`;
      const right = `${b.class_date || ''} ${b.start_time || '00:00:00'}`;
      return left.localeCompare(right);
    });
  const nextPlannedClass = upcomingMemberClasses[0] || null;
  const recentMemberLibraryEntries = [...memberVisibleLibraryEntries]
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
    .slice(0, 3);

  const memberSummaryCards = [
    { label: 'Upcoming planned classes', value: upcomingMemberClasses.length },
    { label: 'Library resources', value: memberVisibleLibraryEntries.length },
    { label: 'Tracked topics', value: memberProgress.length },
    {
      label: 'Competent topics',
      value: memberProgress.filter((item) => item.status === 'competent').length
    }
  ];

  useEffect(() => {
    if (!isMember) {
      return;
    }

    const loadMemberDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        const [plannedClassesRes, libraryEntriesRes, myProgressRes] = await Promise.all([
          api.get('/planned-classes'),
          api.get('/library'),
          api.get('/me/progress').catch((err) => {
            if (err.response?.status === 404) {
              return { data: { progress: [] } };
            }

            throw err;
          })
        ]);

        setPlannedClasses(plannedClassesRes.data || []);
        setLibraryEntries(libraryEntriesRes.data || []);
        setMemberProgress(myProgressRes.data?.progress || []);
      } catch (err) {
        console.error('Load member dashboard error:', err);
        setError(err.response?.data?.message || 'Couldn\'t load the member dashboard right now.');
      } finally {
        setLoading(false);
      }
    };

    loadMemberDashboardData();
  }, [isMember]);

  if (isMember) {
    return (
      <Layout>
        <div className="dashboard-page">
          <h2 className="page-title">Dashboard</h2>
          <p className="page-intro">
            Use this page to see what is coming up, review your progress, and reopen the resources your coaches want members to use.
          </p>

          {error && <p className="error-text">{error}</p>}

          {loading ? (
            <p className="empty-state">Loading your dashboard...</p>
          ) : (
            <>
              <section className="stats-grid dashboard-stats-grid">
                {memberSummaryCards.map((card) => (
                  <div key={card.label} className="stat-card">
                    <div className="stat-label">{card.label}</div>
                    <div className="stat-value">{card.value}</div>
                  </div>
                ))}
              </section>

              <section className="page-section dashboard-hero-section">
                <div className="section-header">
                  <div>
                    <h3>Quick Actions</h3>
                    <p className="section-note">Jump straight into the part of the app that helps you study or prepare next.</p>
                  </div>
                </div>
                <div className="action-grid">
                  <Link to="/planned-classes" className="action-card dashboard-action-card">
                    <strong>See upcoming classes</strong>
                    <p className="dashboard-card-copy">Review the classes your gym has planned next.</p>
                    <span className="dashboard-card-cta">Open classes</span>
                  </Link>
                  <Link to="/my-progress" className="action-card dashboard-action-card">
                    <strong>Open my progress</strong>
                    <p className="dashboard-card-copy">See the topics your coaches have already logged for you.</p>
                    <span className="dashboard-card-cta">Open progress</span>
                  </Link>
                  <Link to="/library" className="action-card dashboard-action-card">
                    <strong>Open Library</strong>
                    <p className="dashboard-card-copy">Revisit videos and notes your gym marked as member visible.</p>
                    <span className="dashboard-card-cta">Open Library</span>
                  </Link>
                  <Link to="/decision-tree" className="action-card dashboard-action-card">
                    <strong>Use Decision Trees</strong>
                    <p className="dashboard-card-copy">Study routes and options around the positions and topics you are learning.</p>
                    <span className="dashboard-card-cta">Open Decision Trees</span>
                  </Link>
                </div>
              </section>

              <section className="page-section dashboard-onboarding-section">
                <div className="section-header">
                  <div>
                    <h3>Member Snapshot</h3>
                    <p className="section-note">Keep this simple: what class is next, what to study, and what resources your coaches already shared.</p>
                  </div>
                </div>
                <div className="dashboard-setup-grid">
                  <div className="dashboard-setup-current">
                    <strong>{nextPlannedClass ? 'Next planned class' : 'No planned classes yet'}</strong>
                    <div className="detail-block">
                      {nextPlannedClass ? (
                        <>
                          <div className="meta-text">
                            {nextPlannedClass.title || 'Planned class'} | {new Date(nextPlannedClass.class_date).toLocaleDateString()}
                          </div>
                          <div className="meta-text">
                            {nextPlannedClass.start_time || 'Time not added'} - {nextPlannedClass.end_time || 'Time not added'}
                          </div>
                          <div className="dashboard-setup-helper">
                            Open Classes to review the notes and linked topics before class.
                          </div>
                        </>
                      ) : (
                        <div className="dashboard-setup-helper">
                          Your gym has not shared an upcoming planned class yet. Library and Decision Trees are still ready to use.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="dashboard-setup-upcoming">
                    <strong>Study focus</strong>
                    <div className="dashboard-setup-list">
                      <Link to="/my-progress" className="dashboard-setup-item">
                        <span>Review tracked topics</span>
                        <small>{memberProgress.length} topic{memberProgress.length === 1 ? '' : 's'} already logged for you.</small>
                      </Link>
                      <Link to="/decision-tree" className="dashboard-setup-item">
                        <span>Use Decision Trees</span>
                        <small>Work through likely branches before class instead of guessing what comes next.</small>
                      </Link>
                      <Link to="/index" className="dashboard-setup-item">
                        <span>Browse Curriculum</span>
                        <small>Use the full map when you want a cleaner overview of positions, sweeps, and submissions.</small>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

              <section className="page-section dashboard-queue-section">
                <div className="section-header">
                  <div>
                    <h3>What to open next</h3>
                    <p className="section-note">Keep the member experience simple: class schedule, progress, and study tools.</p>
                  </div>
                </div>
                <div className="action-grid">
                  <Link to="/planned-classes" className="action-card dashboard-action-card dashboard-queue-card">
                    <strong>Upcoming planned classes</strong>
                    <div className="dashboard-queue-value">
                      {plannedClasses.filter((item) => item.status === 'planned').length}
                    </div>
                    <div className="detail-block">
                      <div className="meta-text">See what your gym has planned next.</div>
                    </div>
                  </Link>
                  <Link to="/my-progress" className="action-card dashboard-action-card dashboard-queue-card">
                    <strong>Tracked curriculum topics</strong>
                    <div className="dashboard-queue-value">{memberProgress.length}</div>
                    <div className="detail-block">
                      <div className="meta-text">Review what has already been logged for you.</div>
                    </div>
                  </Link>
                  <Link to="/library" className="action-card dashboard-action-card dashboard-queue-card">
                    <strong>Member-visible library entries</strong>
                    <div className="dashboard-queue-value">{memberVisibleLibraryEntries.length}</div>
                    <div className="detail-block">
                      <div className="meta-text">Open the videos and notes your coaches have shared with members.</div>
                    </div>
                  </Link>
                </div>
              </section>

              <ExpandableSection
                title="Recently Shared Library Resources"
                note="Open this when you want a quick study list instead of the full Library page."
                summary={`${recentMemberLibraryEntries.length} recent member-visible resource${recentMemberLibraryEntries.length === 1 ? '' : 's'} ready to revisit.`}
              >
                {recentMemberLibraryEntries.length === 0 ? (
                  <p className="empty-state">No member-visible resources have been shared yet.</p>
                ) : (
                  <ul className="card-list">
                    {recentMemberLibraryEntries.map((entry) => (
                      <li key={entry.id} className="card-item compact-topic-card">
                        <div className="compact-topic-header">
                          <div>
                            <strong>{entry.title}</strong>
                            <div className="meta-text">
                              {formatLabel(entry.entry_type)}
                              {entry.program_name ? ` | ${entry.program_name}` : ''}
                              {entry.topic_title ? ` | ${entry.topic_title}` : ''}
                            </div>
                          </div>
                          {entry.video_url ? (
                            <a
                              href={entry.video_url}
                              target="_blank"
                              rel="noreferrer"
                              className="secondary-button"
                            >
                              Open resource
                            </a>
                          ) : null}
                        </div>
                        {entry.description ? <div className="detail-block">{entry.description}</div> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </ExpandableSection>
            </>
          )}
        </div>
      </Layout>
    );
  }

  const quickActions = [
    {
      title: 'Review Attendance',
      description: 'Finish attendance and class admin.',
      cta: 'Open attendance queue',
      to: '/classes?workflow=attendance-ready',
      featured: true
    },
    {
      title: 'Plan a Class',
      description: 'Build the next session.',
      cta: 'Open Class Planner',
      to: '/planned-classes'
    },
    {
      title: 'Log Completed Class',
      description: todayClassCount > 0
        ? `Finish ${todayClassCount} class${todayClassCount === 1 ? '' : 'es'} from today.`
        : 'Open today\'s class-log view.',
      cta: 'Open Class Logs',
      to: `/classes?workflow=today-completed&classDate=${todayIsoDate}`
    },
    {
      title: 'Log Unplanned Class',
      description: 'Open a fresh class log.',
      cta: 'Create Class Log',
      to: '/classes?workflow=create-class'
    },
    {
      title: 'Create Scenario',
      description: 'Build reusable class templates.',
      cta: 'Open Scenarios',
      to: '/training-scenarios?action=create&source=dashboard'
    },
    {
      title: isManagement ? 'Add Curriculum Topic' : 'Open Curriculum',
      description: isManagement
        ? 'Add the next curriculum topic.'
        : 'Review the curriculum map.',
      cta: isManagement ? 'Add Topic' : 'Open Curriculum',
      to: isManagement ? '/topics?action=create' : '/index'
    },
    {
      title: 'Open Library',
      description: 'Review teaching resources.',
      cta: 'Open Library',
      to: '/library'
    },
    {
      title: 'View Members',
      description: 'Check roster and progress.',
      cta: 'Open Members',
      to: '/members'
    },
    {
      title: 'Run Reports',
      description: 'Review gaps and trends.',
      cta: 'Open Reports',
      to: '/reports'
    }
  ];

  const coachingQueue = [
    {
      title: 'Classes planned today',
      value: todayPlannedCount,
      description: todayPlannedCount > 0
        ? `${todayPlannedCount} class${todayPlannedCount === 1 ? '' : 'es'} scheduled today.`
        : 'Nothing planned yet for today.',
      to: '/planned-classes',
      cta: 'Open Class Planner'
    },
    {
      title: 'Attendance to review',
      value: attendanceSnapshot.classesNeedingAttendance,
      description: attendanceSnapshot.classesNeedingAttendance > 0
        ? `${attendanceSnapshot.classesNeedingAttendance} class${attendanceSnapshot.classesNeedingAttendance === 1 ? '' : 'es'} still need attention.`
        : 'Nothing waiting on attendance right now.',
      to: '/classes?workflow=attendance-ready',
      cta: 'Review Attendance',
      featured: true
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
            {tutorialState === 'prompt' ? (
              <section className="page-section dashboard-guide-section">
                <div className="section-header">
                  <div>
                    <h3>Want a walkthrough of the application?</h3>
                    <p className="section-note">
                      This tutorial shows the main owner flow, highlights the biggest sections, and keeps the rest of the dashboard visually quieter while you step through it.
                    </p>
                  </div>
                  <div className="inline-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={startTutorial}
                    >
                      Yes, walk me through it
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={minimizeTutorial}
                    >
                      Not now
                    </button>
                  </div>
                </div>
                <div className="dashboard-guide-grid">
                  <div className="dashboard-guide-highlight">
                    <span className="eyebrow">Core setup leads the app</span>
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
                      <span>Library, Decision Trees, and progress become much stronger once the gym workflow is already moving.</span>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {tutorialState === 'minimized' && !setupComplete ? (
              <section className="page-section dashboard-guide-mini">
                <div className="section-header">
                  <div>
                    <h3>Want a walkthrough later?</h3>
                    <p className="section-note">
                      Keep this tucked away for now, then expand it whenever you want the guided owner walkthrough again.
                    </p>
                  </div>
                  <div className="inline-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={isMinimizedTutorialExpanded ? collapseMinimizedTutorial : expandMinimizedTutorial}
                    >
                      {isMinimizedTutorialExpanded ? 'Hide tutorial prompt' : 'Expand tutorial'}
                    </button>
                  </div>
                </div>

                {isMinimizedTutorialExpanded ? (
                  <div className="dashboard-guide-mini-expanded">
                    <div className="dashboard-guide-grid">
                      <div className="dashboard-guide-highlight">
                        <span className="eyebrow">Core setup leads the app</span>
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
                          <span>Library, Decision Trees, and progress become much stronger once the gym workflow is already moving.</span>
                        </div>
                      </div>
                    </div>
                    <div className="inline-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={startTutorial}
                      >
                        Yes, walk me through it
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={collapseMinimizedTutorial}
                      >
                        Keep it minimized
                      </button>
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}

            {isTutorialActive && activeTutorialStep ? (
              <div className="dashboard-tutorial-overlay" role="dialog" aria-live="polite">
                <div className="dashboard-tutorial-card">
                  <span className="eyebrow">
                    Tutorial step {currentTutorialStep + 1} of {tutorialSteps.length}
                  </span>
                  <strong>{activeTutorialStep.title}</strong>
                  <p>{activeTutorialStep.description}</p>
                  <div className="inline-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={minimizeTutorial}
                    >
                      Exit tutorial
                    </button>
                    {currentTutorialStep > 0 ? (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={rewindTutorial}
                      >
                        Back
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={advanceTutorial}
                    >
                      {currentTutorialStep === tutorialSteps.length - 1 ? 'Finish tutorial' : 'Next'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <section id="dashboard-coaching-queue" className={`page-section dashboard-today-section${getTutorialSectionClass('dashboard-coaching-queue')}`}>
              <div className="section-header">
                <div>
                  <h3>Today</h3>
                  <p className="section-note">Start here when you need the fastest next action for today.</p>
                </div>
              </div>
              <div className="action-grid">
                {coachingQueue.map((item) => (
                  <Link
                    key={item.title}
                    to={item.to}
                    className={`action-card dashboard-action-card dashboard-queue-card${item.featured ? ' is-featured' : ''}`}
                  >
                    <strong>{item.title}</strong>
                    <div className="dashboard-queue-value">{item.value}</div>
                    <p className="dashboard-card-copy">{item.description}</p>
                    <span className="dashboard-card-cta">{item.cta}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section id="dashboard-quick-actions" className={`page-section dashboard-hero-section${getTutorialSectionClass('dashboard-quick-actions')}`}>
              <div className="section-header">
                <div>
                  <h3>Quick Actions</h3>
                  <p className="section-note">Jump straight into the job you want to handle next.</p>
                </div>
              </div>
              <div className="action-grid">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    to={action.to}
                    className={`action-card dashboard-action-card${action.featured ? ' is-featured' : ''}`}
                  >
                    <strong>{action.title}</strong>
                    <p className="dashboard-card-copy">{action.description}</p>
                    <span className="dashboard-card-cta">{action.cta}</span>
                  </Link>
                ))}
              </div>
            </section>

            {!hideSetupChecklist ? (
              <section id="dashboard-start-here" className={`page-section dashboard-onboarding-section${getTutorialSectionClass('dashboard-start-here')}`}>
                <div className="section-header">
                  <div>
                    <h3>Start Here</h3>
                    <p className="section-note">Use this if you are setting up the gym or onboarding a coach for the first time.</p>
                  </div>
                  <div className="inline-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleHideSetupChecklist}
                    >
                      Hide setup guide
                    </button>
                  </div>
                </div>

                <div className="dashboard-setup-progress">
                  <div className="dashboard-setup-progress-header">
                    <strong>Setup progress</strong>
                    <span className="meta-text">{completedSetupCount} of {setupTasks.length} complete</span>
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

                <div className="dashboard-setup-grid">
                  <div className="dashboard-setup-card dashboard-setup-current">
                    {nextSetupTask ? (
                      <>
                        <strong>{nextSetupTask.title}</strong>
                        <p className="dashboard-card-copy">{nextSetupTask.description}</p>
                        <div className="dashboard-setup-helper">{nextSetupTask.helper}</div>
                        <div className="inline-actions">
                          <Link to={nextSetupTask.to} className="secondary-button">
                            Open next step
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <strong>Setup is in a good place</strong>
                        <p className="dashboard-card-copy">Your core workflow is already active, so you can focus on class planning, attendance, and refinement.</p>
                      </>
                    )}
                  </div>

                  <div className="dashboard-setup-upcoming">
                    <strong>Coming up after this</strong>
                    <div className="dashboard-setup-list">
                      {upcomingSetupTasks.length > 0 ? (
                        upcomingSetupTasks.map((task) => (
                          <Link key={task.key} to={task.to} className="dashboard-setup-item">
                            <span>{task.title}</span>
                            <small>{task.description}</small>
                          </Link>
                        ))
                      ) : (
                        <div className="dashboard-setup-helper">
                          The core setup is done. Use Helpful Extras when you want to make the app even stronger for coaches and members.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            ) : !setupComplete ? (
              <section className="page-section dashboard-onboarding-collapsed">
                <div className="section-header">
                  <div>
                    <h3>Setup guide hidden</h3>
                    <p className="section-note">Bring it back any time if you want the onboarding checklist again.</p>
                  </div>
                  <div className="inline-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleShowSetupChecklist}
                    >
                      Show setup guide
                    </button>
                  </div>
                </div>
              </section>
            ) : null}

            {setupComplete ? (
              <section id="dashboard-helpful-extras" className={`page-section dashboard-extras-section${getTutorialSectionClass('dashboard-helpful-extras')}`}>
                <div className="section-header">
                  <div>
                    <h3>Helpful Extras</h3>
                    <p className="section-note">These upgrades make the app more valuable for coaches and members after the core workflow is already running.</p>
                  </div>
                </div>
                <div className="action-grid">
                  {helpfulExtras.map((item) => (
                    <Link key={item.key} to={item.to} className="action-card dashboard-action-card dashboard-extra-card">
                      <strong>{item.title}</strong>
                      <p className="dashboard-card-copy">{item.description}</p>
                      <div className="dashboard-setup-helper">{item.helper}</div>
                      <span className="dashboard-card-cta">Open Library</span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <ExpandableSection
              title="Recent Classes"
              note="The most recent sessions logged by your team."
              summary="Keep this collapsed unless you want a quick look at the most recent logged sessions."
              className={`dashboard-primary-section${isTutorialActive ? ' dashboard-tutorial-dimmed' : ''}`}
              actions={<Link to="/classes" className="secondary-button">Open Class Logs</Link>}
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

            <ExpandableSection
              title="Insights"
              note="Open this when you want a quick read on topic and training-method trends."
              summary="Keep this collapsed unless you want a deeper look than the main dashboard actions."
              className={`dashboard-cta-section${isTutorialActive ? ' dashboard-tutorial-dimmed' : ''}`}
              defaultOpen={false}
              actions={<Link to="/reports" className="secondary-button">Open Reports</Link>}
            >
              <div className="two-column-grid dashboard-insights-grid">
                {!topTopic ? (
                  <div className="card-item dashboard-compact-card">
                    <strong>Top Topic</strong>
                    <p className="empty-state">No topic usage has been logged yet.</p>
                  </div>
                ) : (
                  <div className="card-item dashboard-compact-card">
                    <strong>Top Topic</strong>
                    <div className="detail-block">
                      <div>{topTopic.topic_title}</div>
                      <div className="meta-text">Type: {formatLabel(topTopic.topic_type)}</div>
                      <div className="meta-text">Program: {topTopic.program_name || 'None'}</div>
                      <div className="meta-text">Total Uses: {Number(topTopic.total_times_used)}</div>
                      <div className="meta-text">Focus Count: {Number(topTopic.focus_count)}</div>
                    </div>
                  </div>
                )}

                {!topMethod ? (
                  <div className="card-item dashboard-compact-card">
                    <strong>Top Training Method</strong>
                    <p className="empty-state">No training method usage has been logged yet.</p>
                  </div>
                ) : (
                  <div className="card-item dashboard-compact-card">
                    <strong>Top Training Method</strong>
                    <div className="detail-block">
                      <div>{topMethod.training_method_name}</div>
                      <div className="meta-text">{topMethod.description || 'No description added yet.'}</div>
                      <div className="meta-text">Total Segments: {Number(topMethod.total_segments)}</div>
                      <div className="meta-text">Total Duration: {Number(topMethod.total_duration_minutes)} minutes</div>
                    </div>
                  </div>
                )}
              </div>
            </ExpandableSection>
          </>
        )}
      </div>
    </Layout>
  );
}
