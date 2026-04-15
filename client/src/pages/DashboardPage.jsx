import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { formatLabel } from '../utils/formatLabel';

export default function DashboardPage() {
  const [recentClasses, setRecentClasses] = useState([]);
  const [topicCoverage, setTopicCoverage] = useState([]);
  const [trainingMethodUsage, setTrainingMethodUsage] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [topics, setTopics] = useState([]);
  const [classes, setClasses] = useState([]);
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
        classesRes
      ] = await Promise.all([
        api.get('/reports/recent-classes?limit=5'),
        api.get('/reports/topic-coverage'),
        api.get('/reports/training-method-usage'),
        api.get('/programs'),
        api.get('/topics'),
        api.get('/classes')
      ]);

      setRecentClasses(recentClassesRes.data);
      setTopicCoverage(topicCoverageRes.data);
      setTrainingMethodUsage(trainingMethodUsageRes.data);
      setPrograms(programsRes.data);
      setTopics(topicsRes.data);
      setClasses(classesRes.data);
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

  const quickActions = [
    {
      title: 'Classes',
      description: 'Log classes, attendance, topics, and training entries.',
      to: '/classes'
    },
    {
      title: 'Members',
      description: 'Manage member records and track progression.',
      to: '/members'
    },
    {
      title: 'Programs',
      description: 'Organize curriculum tracks and active programs.',
      to: '/programs'
    },
    {
      title: 'Topics',
      description: 'Maintain positions, techniques, and curriculum structure.',
      to: '/topics'
    },
    {
      title: 'Library',
      description: 'Open internal resources, notes, and video references.',
      to: '/library'
    },
    {
      title: 'Reports',
      description: 'Review trends, underused topics, and teaching patterns.',
      to: '/reports'
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
          Start here for quick actions, recent activity, and a helpful snapshot of what is happening in your gym.
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
                  <p className="section-note">Jump into the area you want to work in next.</p>
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

            <section className="stats-grid dashboard-stats-grid">
              {summaryCards.map((card) => (
                <div key={card.label} className="stat-card">
                  <div className="stat-label">{card.label}</div>
                  <div className="stat-value">{card.value}</div>
                </div>
              ))}
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
