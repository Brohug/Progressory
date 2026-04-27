import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { formatLabel } from '../utils/formatLabel';

const getLocalIsoDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DashboardPage() {
  const [recentClasses, setRecentClasses] = useState([]);
  const [topicCoverage, setTopicCoverage] = useState([]);
  const [trainingMethodUsage, setTrainingMethodUsage] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [topics, setTopics] = useState([]);
  const [classes, setClasses] = useState([]);
  const [plannedClasses, setPlannedClasses] = useState([]);
  const [libraryEntries, setLibraryEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        libraryEntriesRes
      ] = await Promise.all([
        api.get('/reports/recent-classes?limit=5'),
        api.get('/reports/topic-coverage'),
        api.get('/reports/training-method-usage'),
        api.get('/programs'),
        api.get('/topics'),
        api.get('/classes'),
        api.get('/planned-classes'),
        api.get('/library')
      ]);

      setRecentClasses(recentClassesRes.data);
      setTopicCoverage(topicCoverageRes.data);
      setTrainingMethodUsage(trainingMethodUsageRes.data);
      setPrograms(programsRes.data);
      setTopics(topicsRes.data);
      setClasses(classesRes.data);
      setPlannedClasses(plannedClassesRes.data);
      setLibraryEntries(libraryEntriesRes.data);
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
      description: 'Open only today’s classes that still need attendance so coaches can finish class admin fast.',
      to: `/classes?workflow=attendance-ready&classDate=${todayIsoDate}`
    }
  ];

  const firstTimeSteps = [
    {
      title: '1. Add curriculum topics',
      description: 'Start in Curriculum Index so your classes, Library, and Decision Tree all point to the same topic structure.',
      to: '/index'
    },
    {
      title: '2. Plan your next class',
      description: 'Build the next session in Planned Classes so coaches know what is supposed to happen before class starts.',
      to: '/planned-classes'
    },
    {
      title: '3. Finish class admin after training',
      description: 'Use Completed Classes to log what happened, add attendance, and keep progress clean.',
      to: `/classes?workflow=today-completed&classDate=${todayIsoDate}`
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
      value: todayClassCount,
      description: todayClassCount > 0
        ? `${todayClassCount} completed class${todayClassCount === 1 ? '' : 'es'} happened today and may still need attendance or notes.`
        : 'No completed classes are on today’s date yet.',
      to: `/classes?workflow=attendance-ready&classDate=${todayIsoDate}`
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

            <section className="page-section dashboard-onboarding-section">
              <div className="section-header">
                <div>
                  <h3>Start Here</h3>
                  <p className="section-note">Use this if you are setting up the gym or onboarding a coach for the first time.</p>
                </div>
              </div>
              <div className="action-grid">
                {firstTimeSteps.map((step) => (
                  <Link
                    key={step.title}
                    to={step.to}
                    className="action-card dashboard-action-card"
                  >
                    <strong>{step.title}</strong>
                    <div className="detail-block">
                      <div className="meta-text">{step.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

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

            <section className="page-section dashboard-primary-section">
              <div className="section-header">
                <div>
                  <h3>Recent Classes</h3>
                  <p className="section-note">The most recent sessions logged by your team.</p>
                </div>
                <Link to="/classes">Manage Classes</Link>
              </div>

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
            </section>

            <section className="two-column-grid dashboard-insights-grid">
              <div className="page-section">
                <div className="section-header">
                  <div>
                    <h3>Top Topic</h3>
                    <p className="section-note">The most-used curriculum topic right now.</p>
                  </div>
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
              </div>

              <div className="page-section">
                <div className="section-header">
                  <div>
                    <h3>Top Training Method</h3>
                    <p className="section-note">The method showing up most often in logged segments.</p>
                  </div>
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
              </div>
            </section>

            <section className="page-section dashboard-cta-section">
              <div className="section-header">
                <div>
                  <h3>Want A Closer Look?</h3>
                  <p className="section-note">Open Reports when you want a deeper look at trends instead of quick signals.</p>
                </div>
              </div>
              <Link to="/reports" className="action-card dashboard-report-card">
                <strong>Open Reports</strong>
                <div className="detail-block">
                  <div className="meta-text">
                    Explore underused topics, method usage, and broader curriculum trends.
                  </div>
                  <div className="dashboard-report-link-text">Go to Reports</div>
                </div>
              </Link>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
