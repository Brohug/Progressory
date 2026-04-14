import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { formatLabel } from '../utils/formatLabel';

export default function ReportsPage() {
  const [recentClasses, setRecentClasses] = useState([]);
  const [topicCoverage, setTopicCoverage] = useState([]);
  const [trainingMethodUsage, setTrainingMethodUsage] = useState([]);
  const [neglectedTopics, setNeglectedTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        recentClassesRes,
        topicCoverageRes,
        trainingMethodUsageRes,
        neglectedTopicsRes
      ] = await Promise.all([
        api.get('/reports/recent-classes?limit=5'),
        api.get('/reports/topic-coverage'),
        api.get('/reports/training-method-usage'),
        api.get('/reports/neglected-topics?days=30')
      ]);

      setRecentClasses(recentClassesRes.data);
      setTopicCoverage(topicCoverageRes.data);
      setTrainingMethodUsage(trainingMethodUsageRes.data);
      setNeglectedTopics(neglectedTopicsRes.data);
    } catch (err) {
      console.error('Load reports error:', err);
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const summaryCards = [
    { label: 'Recent Classes', value: recentClasses.length },
    { label: 'Tracked Topics', value: topicCoverage.length },
    {
      label: 'Methods Used',
      value: trainingMethodUsage.filter(
        (method) => Number(method.total_segments) > 0
      ).length
    },
    { label: 'Neglected Topics', value: neglectedTopics.length }
  ];

  const topTopics = topicCoverage
    .slice()
    .sort((a, b) => Number(b.total_times_used) - Number(a.total_times_used))
    .slice(0, 6);

  return (
    <Layout>
      <div className="reports-page">
        <h2 className="page-title">Reports</h2>
        <p className="page-intro">
          Review trends, spot neglected curriculum areas, and understand what is being taught and how it's being taught.
        </p>

        {error && <p className="error-text">{error}</p>}

        {loading ? (
          <p className="empty-state">Loading reports...</p>
        ) : (
          <>
            <section className="stats-grid reports-stats-grid">
              {summaryCards.map((card) => (
                <div key={card.label} className="stat-card">
                  <div className="stat-label">{card.label}</div>
                  <div className="stat-value">{card.value}</div>
                </div>
              ))}
            </section>

            <section className="two-column-grid reports-insights-grid">
              <div className="page-section reports-priority-section">
                <div className="section-header">
                  <div>
                    <h3>Neglected Topics</h3>
                    <p className="section-note">Topics that have not appeared recently and may need attention.</p>
                  </div>
                </div>
                {neglectedTopics.length === 0 ? (
                  <p className="empty-state">No neglected topics found in the selected time range.</p>
                ) : (
                  <ul className="card-list">
                    {neglectedTopics.map((item) => (
                      <li key={item.topic_id} className="card-item reports-compact-card">
                        <strong>{item.topic_title}</strong>
                        <div className="detail-block">
                          <div className="meta-text">Type: {formatLabel(item.topic_type)}</div>
                          <div className="meta-text">Program: {item.program_name || 'None'}</div>
                          <div className="meta-text">
                            Last Used:{' '}
                            {item.last_used_date
                              ? new Date(item.last_used_date).toLocaleDateString()
                              : 'Never'}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="page-section">
                <div className="section-header">
                  <div>
                    <h3>Training Method Usage</h3>
                    <p className="section-note">How often each training method appears in logged class segments.</p>
                  </div>
                </div>
                {trainingMethodUsage.length === 0 ? (
                  <p className="empty-state">No training method usage data found.</p>
                ) : (
                  <ul className="card-list">
                    {trainingMethodUsage.map((item) => (
                      <li key={item.training_method_id} className="card-item reports-compact-card">
                        <strong>{item.training_method_name}</strong>
                        <div className="detail-block">
                          <div>{item.description || 'No description'}</div>
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

            <section className="page-section">
              <div className="section-header">
                <div>
                  <h3>Recent Classes</h3>
                  <p className="section-note">The latest classes included in this reporting view.</p>
                </div>
              </div>
              {recentClasses.length === 0 ? (
                <p className="empty-state">No recent classes found.</p>
              ) : (
                <ul className="card-list">
                  {recentClasses.map((item) => (
                    <li key={item.id} className="card-item reports-compact-card">
                      <strong>{item.title || 'Untitled Class'}</strong>
                      <div className="detail-block">
                        <div className="meta-text">Program: {item.program_name}</div>
                        <div className="meta-text">
                          Coach: {item.head_coach_first_name} {item.head_coach_last_name}
                        </div>
                        <div className="meta-text">
                          Date: {new Date(item.class_date).toLocaleDateString()}
                        </div>
                        <div>{item.notes || 'No notes'}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="page-section">
              <div className="section-header">
                <div>
                  <h3>Top Topic Coverage</h3>
                  <p className="section-note">The most-used topics ranked by how often they appear in classes.</p>
                </div>
              </div>
              {topTopics.length === 0 ? (
                <p className="empty-state">No topic coverage data found.</p>
              ) : (
                <ul className="card-list">
                  {topTopics.map((item) => (
                    <li key={item.topic_id} className="card-item reports-compact-card">
                      <strong>{item.topic_title}</strong>
                      <div className="detail-block">
                        <div className="meta-text">Type: {formatLabel(item.topic_type)}</div>
                        <div className="meta-text">Program: {item.program_name || 'None'}</div>
                        <div className="meta-text">Total Uses: {Number(item.total_times_used)}</div>
                        <div className="meta-text">Focus Count: {Number(item.focus_count)}</div>
                        <div className="meta-text">Taught: {Number(item.taught_count)}</div>
                        <div className="meta-text">Reviewed: {Number(item.reviewed_count)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
