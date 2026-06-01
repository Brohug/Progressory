import { useCallback, useEffect, useMemo, useState, startTransition } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

const formatSeconds = (value) => {
  const totalSeconds = Math.round(Number(value || 0));
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return '0m';
  }

  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes < 60) {
    return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const formatActionLabel = (value) => (
  String(value || 'unknown')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
);

const emptyState = {
  window_days: 14,
  overview: {
    total_page_views: 0,
    unique_users: 0,
    active_gyms: 0,
    total_seconds: 0,
    avg_seconds: 0
  },
  top_pages: [],
  by_role: [],
  top_gyms: [],
  top_actions: [],
  recent_views: []
};

export default function PlatformAnalyticsPage() {
  const [days, setDays] = useState(14);
  const [analyticsState, setAnalyticsState] = useState({
    loading: true,
    error: '',
    data: emptyState
  });

  const loadAnalytics = useCallback(async (windowDays, { showLoading = true } = {}) => {
    if (showLoading) {
      startTransition(() => {
        setAnalyticsState((prev) => ({
          ...prev,
          loading: true,
          error: ''
        }));
      });
    }

    try {
      const response = await api.get('/platform-admin/analytics', {
        params: { days: windowDays }
      });

      setAnalyticsState({
        loading: false,
        error: '',
        data: response.data || emptyState
      });
    } catch (error) {
      setAnalyticsState({
        loading: false,
        error: error.response?.data?.message || 'Could not load platform analytics right now.',
        data: emptyState
      });
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await loadAnalytics(days, { showLoading: true });
    };

    run();
  }, [days, loadAnalytics]);

  const overviewCards = useMemo(() => {
    const overview = analyticsState.data.overview || emptyState.overview;

    return [
      {
        label: 'Page views',
        value: overview.total_page_views,
        note: `Across the last ${analyticsState.data.window_days} days`
      },
      {
        label: 'Unique users',
        value: overview.unique_users,
        note: 'People who opened tracked app pages'
      },
      {
        label: 'Active gyms',
        value: overview.active_gyms,
        note: 'Gyms represented in tracked usage'
      },
      {
        label: 'Time spent',
        value: formatSeconds(overview.total_seconds),
        note: 'Estimated from page exits and route changes'
      },
      {
        label: 'Average page time',
        value: formatSeconds(overview.avg_seconds),
        note: 'Average time before moving to another page'
      }
    ];
  }, [analyticsState.data]);

  return (
    <Layout>
      <div className="account-page platform-admin-page platform-analytics-page">
        <h2 className="page-title">Platform Analytics</h2>
        <p className="page-description">
          See where people are spending time in the app, which gyms are most active, and which tracked actions are happening most often.
        </p>

        <section className="page-section">
          <div className="account-billing-card platform-admin-feature-card">
            <div className="inline-actions analytics-filter-row">
              <label className="form-field analytics-days-field">
                <span>Analytics window</span>
                <select value={days} onChange={(event) => setDays(Number(event.target.value))}>
                  <option value={7}>Last 7 days</option>
                  <option value={14}>Last 14 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={60}>Last 60 days</option>
                </select>
              </label>
              <button type="button" className="secondary-button" onClick={() => loadAnalytics(days)}>
                Refresh analytics
              </button>
            </div>

            {analyticsState.error ? (
              <p className="form-error">{analyticsState.error}</p>
            ) : null}

            {analyticsState.loading ? (
              <div className="platform-admin-empty-state platform-admin-loading-state">
                Loading platform analytics...
              </div>
            ) : (
              <>
                <div className="platform-admin-summary-grid analytics-summary-grid">
                  {overviewCards.map((card) => (
                    <article key={card.label} className="platform-admin-summary-card">
                      <div className="platform-admin-summary-copy">
                        <span className="platform-admin-summary-label">{card.label}</span>
                      </div>
                      <strong className="platform-admin-summary-value">{card.value}</strong>
                      <p className="section-note">{card.note}</p>
                    </article>
                  ))}
                </div>

                <div className="platform-admin-reporting-grid analytics-reporting-grid">
                  <article className="account-billing-card platform-admin-feature-card">
                    <h3>Most visited pages</h3>
                    <p className="section-note">Which parts of the app people are opening most often.</p>
                    {analyticsState.data.top_pages.length === 0 ? (
                      <div className="platform-admin-empty-state">No tracked page traffic yet.</div>
                    ) : (
                      <div className="analytics-list">
                        {analyticsState.data.top_pages.map((page) => (
                          <div key={page.page_path} className="analytics-list-row">
                            <div>
                              <strong>{page.page_path}</strong>
                              <div className="section-note">{page.unique_users} users</div>
                            </div>
                            <div className="analytics-list-meta">
                              <span>{page.views} views</span>
                              <span>|</span>
                              <span>{formatSeconds(page.total_seconds)}</span>
                              <span>|</span>
                              <span>{formatSeconds(page.avg_seconds)} avg</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>

                  <article className="account-billing-card platform-admin-feature-card">
                    <h3>Most active gyms</h3>
                    <p className="section-note">Which gyms are generating the most tracked app usage.</p>
                    {analyticsState.data.top_gyms.length === 0 ? (
                      <div className="platform-admin-empty-state">No gym usage has been tracked yet.</div>
                    ) : (
                      <div className="analytics-list">
                        {analyticsState.data.top_gyms.map((gym) => (
                          <div key={`${gym.gym_id}-${gym.gym_name}`} className="analytics-list-row">
                            <div>
                              <strong>{gym.gym_name}</strong>
                              <div className="section-note">{gym.unique_users} users</div>
                            </div>
                            <div className="analytics-list-meta">
                              <span>{gym.views} views</span>
                              <span>{formatSeconds(gym.total_seconds)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>

                  <article className="account-billing-card platform-admin-feature-card">
                    <h3>Role activity</h3>
                    <p className="section-note">Who is spending the most time in the app by role.</p>
                    {analyticsState.data.by_role.length === 0 ? (
                      <div className="platform-admin-empty-state">No role activity has been tracked yet.</div>
                    ) : (
                      <div className="analytics-list">
                        {analyticsState.data.by_role.map((role) => (
                          <div key={role.user_role} className="analytics-list-row">
                            <div>
                              <strong>{formatActionLabel(role.user_role)}</strong>
                              <div className="section-note">{role.unique_users} users</div>
                            </div>
                            <div className="analytics-list-meta">
                              <span>{role.views} views</span>
                              <span>{formatSeconds(role.total_seconds)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>

                  <article className="account-billing-card platform-admin-feature-card">
                    <h3>Tracked actions</h3>
                    <p className="section-note">Backend actions already captured through audit logging.</p>
                    {analyticsState.data.top_actions.length === 0 ? (
                      <div className="platform-admin-empty-state">No tracked actions yet.</div>
                    ) : (
                      <div className="analytics-list">
                        {analyticsState.data.top_actions.map((action) => (
                          <div key={action.event_type} className="analytics-list-row">
                            <div>
                              <strong>{formatActionLabel(action.event_type)}</strong>
                              <div className="section-note">
                                Latest: {action.latest_at ? new Date(action.latest_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not set'}
                              </div>
                            </div>
                            <div className="analytics-list-meta">
                              <span>{action.count} events</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                </div>

                <section className="page-section">
                  <div className="account-billing-card platform-admin-feature-card">
                    <h3>Recent tracked views</h3>
                    <p className="section-note">Most recent authenticated page visits recorded in the app.</p>
                    {analyticsState.data.recent_views.length === 0 ? (
                      <div className="platform-admin-empty-state">No recent page views yet.</div>
                    ) : (
                      <div className="analytics-list">
                        {analyticsState.data.recent_views.map((item, index) => (
                          <div key={`${item.page_path}-${item.user_email}-${item.created_at}-${index}`} className="analytics-list-row">
                            <div>
                              <strong>{item.page_path}</strong>
                              <div className="section-note">{item.user_email} | {item.gym_name}</div>
                            </div>
                            <div className="analytics-list-meta">
                              <span>{formatActionLabel(item.user_role)}</span>
                              <span>{new Date(item.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
