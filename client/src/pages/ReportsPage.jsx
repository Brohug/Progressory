import { useEffect, useState } from 'react';
import api from '../api/axios';
import ExpandableSection from '../components/ExpandableSection';
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
      setError(err.response?.data?.message || 'Couldn\'t load reports right now.');
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

  const topMethods = trainingMethodUsage
    .slice()
    .sort((a, b) => Number(b.total_segments) - Number(a.total_segments))
    .slice(0, 6);

  return (
    <Layout>
      <div className="reports-page">
        <h2 className="page-title">Reports</h2>
        <p className="page-intro">
          Review trends, spot underused curriculum areas, and better understand what is being taught and how it is being taught.
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

            <ExpandableSection
              title="Unused / Underutilized Topics"
              note="Topics that have not shown up recently and may be worth revisiting in upcoming classes."
              summary="Expand when you want to spot topics that are falling out of the teaching rotation."
              className="reports-priority-section"
              defaultOpen
            >
              {neglectedTopics.length === 0 ? (
                <p className="empty-state">No underused topics showed up in this time range.</p>
              ) : (
                <div className="reports-featured-grid">
                  {neglectedTopics.slice(0, 6).map((item) => (
                    <article key={item.topic_id} className="reports-featured-card">
                      <strong>{item.topic_title}</strong>
                      <div className="detail-block">
                        <div className="meta-text">Type: {formatLabel(item.topic_type)}</div>
                        <div className="meta-text">Program: {item.program_name || 'None'}</div>
                        <div className="meta-text">
                          Last Used:{' '}
                          {item.last_used_date
                            ? new Date(item.last_used_date).toLocaleDateString()
                            : 'Not yet used'}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </ExpandableSection>

            <section className="two-column-grid reports-insights-grid">
              <ExpandableSection
                title="Training Method Usage"
                note="How often each training method appears in logged class segments."
                summary="Expand when you want to compare which training methods are getting the most use."
                className="reports-ranked-section"
              >
                {topMethods.length === 0 ? (
                  <p className="empty-state">No training method usage has been logged yet.</p>
                ) : (
                  <div className="reports-ranked-list">
                    {topMethods.map((item, index) => (
                      <div key={item.training_method_id} className="reports-ranked-row">
                        <div className="reports-rank">{index + 1}</div>
                        <div className="reports-ranked-main">
                          <strong>{item.training_method_name}</strong>
                          <div className="meta-text">{item.description || 'No description added yet.'}</div>
                        </div>
                        <div className="reports-ranked-stats">
                          <span>{Number(item.total_segments)} segments</span>
                          <span>{Number(item.total_duration_minutes)} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ExpandableSection>

              <ExpandableSection
                title="Top Topic Coverage"
                note="The most-used topics ranked by how often they appear in classes."
                summary="Expand when you want to see which topics dominate the current teaching mix."
                className="reports-ranked-section"
              >
                {topTopics.length === 0 ? (
                  <p className="empty-state">No topic coverage has been logged yet.</p>
                ) : (
                  <div className="reports-ranked-list">
                    {topTopics.map((item, index) => (
                      <div key={item.topic_id} className="reports-ranked-row">
                        <div className="reports-rank">{index + 1}</div>
                        <div className="reports-ranked-main">
                          <strong>{item.topic_title}</strong>
                          <div className="meta-text">
                            {formatLabel(item.topic_type)} | {item.program_name || 'None'}
                          </div>
                        </div>
                        <div className="reports-ranked-stats">
                          <span>{Number(item.total_times_used)} uses</span>
                          <span>{Number(item.focus_count)} focus</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ExpandableSection>
            </section>

            <ExpandableSection
              title="Recent Classes"
              note="The most recent classes included in this reporting view."
              summary="Expand when you want to connect the reporting signals back to actual recent sessions."
              className="reports-activity-section"
            >
              {recentClasses.length === 0 ? (
                <p className="empty-state">No recent classes to show yet.</p>
              ) : (
                <div className="reports-activity-list">
                  {recentClasses.map((item) => (
                    <article key={item.id} className="reports-activity-item">
                      <div className="reports-activity-header">
                        <strong>{item.title || 'Untitled Class'}</strong>
                        <span className="meta-text">
                          {new Date(item.class_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="reports-activity-meta">
                        <span>Program: {item.program_name}</span>
                        <span>
                          Coach: {item.head_coach_first_name} {item.head_coach_last_name}
                        </span>
                      </div>
                      <div className="meta-text">{item.notes || 'No notes added yet.'}</div>
                    </article>
                  ))}
                </div>
              )}
            </ExpandableSection>
          </>
        )}
      </div>
    </Layout>
  );
}
