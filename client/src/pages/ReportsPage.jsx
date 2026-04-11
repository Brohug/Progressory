import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

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

  return (
    <Layout>
      <h2 className="page-title">Reports</h2>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="empty-state">Loading reports...</p>
      ) : (
        <>
          <section className="page-section">
            <h3>Recent Classes</h3>
            {recentClasses.length === 0 ? (
              <p className="empty-state">No recent classes found.</p>
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
                      <div>{item.notes || 'No notes'}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="two-column-grid">
            <div className="page-section">
              <h3>Topic Coverage</h3>
              {topicCoverage.length === 0 ? (
                <p className="empty-state">No topic coverage data found.</p>
              ) : (
                <ul className="card-list">
                  {topicCoverage.map((item) => (
                    <li key={item.topic_id} className="card-item">
                      <strong>{item.topic_title}</strong>
                      <div className="detail-block">
                        <div className="meta-text">Type: {item.topic_type}</div>
                        <div className="meta-text">Program: {item.program_name || 'None'}</div>
                        <div className="meta-text">Total Uses: {Number(item.total_times_used)}</div>
                        <div className="meta-text">Taught: {Number(item.taught_count)}</div>
                        <div className="meta-text">Reviewed: {Number(item.reviewed_count)}</div>
                        <div className="meta-text">Focus: {Number(item.focus_count)}</div>
                        <div className="meta-text">Secondary: {Number(item.secondary_count)}</div>
                        <div className="meta-text">
                          Review Focus: {Number(item.review_focus_count)}
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
                <p className="empty-state">No training method usage data found.</p>
              ) : (
                <ul className="card-list">
                  {trainingMethodUsage.map((item) => (
                    <li key={item.training_method_id} className="card-item">
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
            <h3>Neglected Topics</h3>
            {neglectedTopics.length === 0 ? (
              <p className="empty-state">No neglected topics found in the selected time range.</p>
            ) : (
              <ul className="card-list">
                {neglectedTopics.map((item) => (
                  <li key={item.topic_id} className="card-item">
                    <strong>{item.topic_title}</strong>
                    <div className="detail-block">
                      <div className="meta-text">Type: {item.topic_type}</div>
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
          </section>
        </>
      )}
    </Layout>
  );
}