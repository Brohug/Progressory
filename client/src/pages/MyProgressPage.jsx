import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ExpandableSection from '../components/ExpandableSection';
import Layout from '../components/Layout';
import { formatLabel } from '../utils/formatLabel';

const buildIndexLink = (topicTitle) => `/index?search=${encodeURIComponent(topicTitle)}`;
const buildLibraryLink = (topicTitle) => `/library?search=${encodeURIComponent(topicTitle)}`;
const buildDecisionTreeLink = (topicTitle) => `/decision-tree?search=${encodeURIComponent(topicTitle)}`;

export default function MyProgressPage() {
  const [member, setMember] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/me/progress');
        setMember(response.data.member);
        setProgress(response.data.progress || []);
      } catch (err) {
        console.error('Load my progress error:', err);
        setError(err.response?.data?.message || 'Couldn’t load your progress right now.');
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  const summaryCards = useMemo(() => {
    const statusCounts = progress.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    return [
      { label: 'Tracked topics', value: progress.length },
      { label: 'Introduced', value: statusCounts.introduced || 0 },
      { label: 'Developing', value: statusCounts.developing || 0 },
      { label: 'Competent', value: statusCounts.competent || 0 }
    ];
  }, [progress]);

  const mostRecentProgress = useMemo(() => {
    return [...progress]
      .sort((a, b) => new Date(b.updated_at || b.last_reviewed_at || 0) - new Date(a.updated_at || a.last_reviewed_at || 0))
      .slice(0, 5);
  }, [progress]);

  const studyNextTopics = useMemo(() => (
    progress
      .filter((item) => item.status !== 'competent')
      .sort((a, b) => new Date(b.updated_at || b.last_reviewed_at || 0) - new Date(a.updated_at || a.last_reviewed_at || 0))
      .slice(0, 3)
  ), [progress]);

  return (
    <Layout>
      <div className="page-shell">
        <h2 className="page-title">My Progress</h2>
        <p className="page-intro">
          See what your coaches logged, what to study next, and where to reopen the right study tool fast.
        </p>

        {error ? <p className="error-text">{error}</p> : null}

        {loading ? (
          <p className="empty-state">Loading your progress...</p>
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

            <section className="page-section dashboard-hero-section">
              <div className="section-header">
                <div>
                  <h3>What to do next</h3>
                  <p className="section-note">
                    Keep your member workflow simple: check what is coming up, review your logged topics, then reopen the study tools you actually need.
                  </p>
                </div>
              </div>
              <div className="action-grid">
                <Link to="/planned-classes" className="action-card dashboard-action-card">
                  <strong>See upcoming classes</strong>
                  <div className="detail-block">
                    <div className="meta-text">Review what your gym has planned next before class starts.</div>
                  </div>
                </Link>
                <Link to="/library" className="action-card dashboard-action-card">
                  <strong>Open Library</strong>
                  <div className="detail-block">
                    <div className="meta-text">Revisit member-visible videos and notes linked to your gym topics.</div>
                  </div>
                </Link>
                <Link to="/decision-tree" className="action-card dashboard-action-card">
                  <strong>Use Decision Trees</strong>
                  <div className="detail-block">
                    <div className="meta-text">Work through realistic branches when you want a smarter study route.</div>
                  </div>
                </Link>
              </div>
            </section>

            <section className="page-section dashboard-onboarding-section">
              <div className="section-header">
                <div>
                  <h3>Study next</h3>
                  <p className="section-note">
                    Keep this simple: reopen the topic, find the shared resource, or explore the next branch.
                  </p>
                </div>
              </div>

              {studyNextTopics.length === 0 ? (
                <div className="dashboard-setup-card dashboard-setup-current">
                  <strong>No study targets yet</strong>
                  <div className="dashboard-setup-helper">
                    Once your coaches log progress, this section will point you to the next topic worth revisiting.
                  </div>
                  <div className="inline-actions">
                    <Link to="/library" className="secondary-button">Open Library</Link>
                    <Link to="/decision-tree" className="secondary-button">Open Decision Trees</Link>
                  </div>
                </div>
              ) : (
                <div className="action-grid">
                  {studyNextTopics.map((item) => (
                    <div key={`study-next-${item.id}`} className="action-card dashboard-action-card">
                      <strong>{item.topic_title}</strong>
                      <p className="dashboard-card-copy">
                        {formatLabel(item.topic_type)} | {formatLabel(item.status)}
                      </p>
                      <div className="inline-actions">
                        <Link className="secondary-button" to={buildIndexLink(item.topic_title)}>
                          Open Curriculum
                        </Link>
                        <Link className="secondary-button" to={buildLibraryLink(item.topic_title)}>
                          Open Library
                        </Link>
                        <Link className="secondary-button" to={buildDecisionTreeLink(item.topic_title)}>
                          Study in Tree
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {member ? (
              <ExpandableSection
                title={`${member.first_name} ${member.last_name}`}
                note="Open the full list when you want every logged topic in one place."
                summary={`${progress.length} tracked topic${progress.length === 1 ? '' : 's'} on your member profile.`}
                className="page-section"
              >
                <div className="section-header">
                  <div>
                    <h3>Full progress list</h3>
                    <p className="section-note">
                      These updates are tied to your member profile.
                    </p>
                  </div>
                </div>

                {progress.length === 0 ? (
                  <p className="empty-state">
                    No topic progress has been logged yet.
                  </p>
                ) : (
                  <ul className="card-list">
                    {progress.map((item) => (
                      <li key={item.id} className="card-item compact-topic-card">
                        <div className="compact-topic-header">
                          <div>
                            <strong>{item.topic_title}</strong>
                            <div className="meta-text">
                              {formatLabel(item.topic_type)} | {formatLabel(item.status)}
                            </div>
                          </div>
                          <span className="curriculum-index-tag">
                            {formatLabel(item.status)}
                          </span>
                        </div>
                        <div className="detail-block">
                          {item.notes ? <div>{item.notes}</div> : null}
                          {item.updated_at ? (
                            <div className="meta-text">
                              Updated: {new Date(item.updated_at).toLocaleString()}
                            </div>
                          ) : null}
                        </div>
                        <div className="inline-actions">
                          <Link className="secondary-button" to={buildIndexLink(item.topic_title)}>
                            View in Index
                          </Link>
                          <Link className="secondary-button" to={buildLibraryLink(item.topic_title)}>
                            Find study resources
                          </Link>
                          <Link className="secondary-button" to={buildDecisionTreeLink(item.topic_title)}>
                            Study in Tree
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </ExpandableSection>
            ) : null}

            <section className="page-section">
              <div className="section-header">
                <div>
                  <h3>Most recent updates</h3>
                  <p className="section-note">
                    Expand your full progress list above when you want everything. Use this as the quick version.
                  </p>
                </div>
              </div>
              {mostRecentProgress.length === 0 ? (
                <p className="empty-state">No recent progress updates yet.</p>
              ) : (
                <ul className="card-list">
                  {mostRecentProgress.map((item) => (
                    <li key={`recent-${item.id}`} className="card-item compact-topic-card">
                      <div className="compact-topic-header">
                        <div>
                          <strong>{item.topic_title}</strong>
                          <div className="meta-text">
                            {formatLabel(item.topic_type)} | {formatLabel(item.status)}
                          </div>
                        </div>
                      </div>
                      <div className="detail-block">
                        {item.updated_at ? (
                          <div className="meta-text">
                            Updated: {new Date(item.updated_at).toLocaleString()}
                          </div>
                        ) : null}
                        {item.notes ? <div>{item.notes}</div> : null}
                      </div>
                      <div className="inline-actions">
                        <Link className="secondary-button" to={buildIndexLink(item.topic_title)}>
                          View in Index
                        </Link>
                        <Link className="secondary-button" to={buildLibraryLink(item.topic_title)}>
                          Find study resources
                        </Link>
                        <Link className="secondary-button" to={buildDecisionTreeLink(item.topic_title)}>
                          Study in Tree
                        </Link>
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
