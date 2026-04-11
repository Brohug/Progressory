import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

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
      setError(err.response?.data?.message || 'Failed to load dashboard');
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

  const topTopics = topicCoverage
    .slice()
    .sort((a, b) => Number(b.total_times_used) - Number(a.total_times_used))
    .slice(0, 5);

  return (
    <Layout>
      <h2 className="page-title">Dashboard</h2>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="empty-state">Loading dashboard...</p>
      ) : (
        <>
          <section className="stats-grid">
            {summaryCards.map((card) => (
              <div key={card.label} className="stat-card">
                <div className="stat-label">{card.label}</div>
                <div className="stat-value">{card.value}</div>
              </div>
            ))}
          </section>

          <section className="page-section">
            <h3>Recent Classes</h3>

            {recentClasses.length === 0 ? (
              <p className="empty-state">No classes logged yet.</p>
            ) : (
              <ul className="card-list">
                {recentClasses.map((item) => (
                  <li key={item.id} className="card-item">
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
                      <div>{item.notes || 'No notes'}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="two-column-grid">
            <div className="page-section">
              <h3>Top Topic Coverage</h3>

              {topTopics.length === 0 ? (
                <p className="empty-state">No topic usage data yet.</p>
              ) : (
                <ul className="card-list">
                  {topTopics.map((item) => (
                    <li key={item.topic_id} className="card-item">
                      <strong>{item.topic_title}</strong>
                      <div className="detail-block">
                        <div className="meta-text">Type: {item.topic_type}</div>
                        <div className="meta-text">
                          Total Uses: {Number(item.total_times_used)}
                        </div>
                        <div className="meta-text">
                          Focus Count: {Number(item.focus_count)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="page-section">
              <h3>Training Method Usage</h3>

              {trainingMethodUsage.length === 0 ? (
                <p className="empty-state">No training method data yet.</p>
              ) : (
                <ul className="card-list">
                  {trainingMethodUsage.map((item) => (
                    <li key={item.training_method_id} className="card-item">
                      <strong>{item.training_method_name}</strong>
                      <div className="detail-block">
                        <div className="meta-text">
                          Total Segments: {Number(item.total_segments)}
                        </div>
                        <div className="meta-text">
                          Total Duration: {Number(item.total_duration_minutes)} minutes
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}
    </Layout>
  );
}