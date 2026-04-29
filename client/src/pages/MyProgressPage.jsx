import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { formatLabel } from '../utils/formatLabel';

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

  return (
    <Layout>
      <div className="page-shell">
        <h2 className="page-title">My Progress</h2>
        <p className="page-intro">
          Review the curriculum topics your coaches have logged for you over time.
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

            {member ? (
              <section className="page-section">
                <div className="section-header">
                  <div>
                    <h3>{member.first_name} {member.last_name}</h3>
                    <p className="section-note">
                      These progress updates are tied to your member profile.
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
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : null}
          </>
        )}
      </div>
    </Layout>
  );
}
