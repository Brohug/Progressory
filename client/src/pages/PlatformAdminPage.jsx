import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';

const formatStatusLabel = (value) => (
  String(value || 'none')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
);

const formatDateLabel = (value) => {
  if (!value) {
    return 'Not set';
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime())
    ? 'Not set'
    : parsedDate.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
};

const formatPhoneLabel = (value) => value || 'Not provided';

const emptyDashboardState = {
  summary: null,
  founder_requests: [],
  gyms: []
};

export default function PlatformAdminPage() {
  const [dashboardState, setDashboardState] = useState(emptyDashboardState);
  const [filterState, setFilterState] = useState({
    founderSearch: '',
    founderStatus: 'all',
    gymSearch: '',
    gymBillingStatus: 'all',
    gymAccessState: 'all'
  });
  const [pageState, setPageState] = useState({
    loading: true,
    error: '',
    notice: ''
  });
  const [actionState, setActionState] = useState({
    loadingAction: '',
    copiedInviteUrl: '',
    latestInviteUrl: '',
    latestInviteExpiresAt: ''
  });

  const loadDashboard = useCallback(async ({ preserveNotice = false } = {}) => {
    setPageState((prev) => ({
      loading: true,
      error: '',
      notice: preserveNotice ? prev.notice : ''
    }));

    try {
      const response = await api.get('/platform-admin/dashboard');
      setDashboardState({
        summary: response.data?.summary || null,
        founder_requests: response.data?.founder_requests || [],
        gyms: response.data?.gyms || []
      });
      setPageState((prev) => ({
        loading: false,
        error: '',
        notice: preserveNotice ? prev.notice : ''
      }));
    } catch (error) {
      setDashboardState(emptyDashboardState);
      setPageState((prev) => ({
        loading: false,
        error: error.response?.data?.message || 'Could not load platform admin data right now.',
        notice: preserveNotice ? prev.notice : ''
      }));
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const summaryCards = useMemo(() => {
    const summary = dashboardState.summary;

    if (!summary) {
      return [];
    }

    return [
      { label: 'Founder requests', value: summary.founder_requests_total },
      { label: 'New founder requests', value: summary.founder_requests_new },
      { label: 'Provisioned leads', value: summary.founder_requests_provisioned },
      { label: 'Gyms total', value: summary.gyms_total },
      { label: 'Suspended gyms', value: summary.gyms_suspended },
      { label: 'Trialing gyms', value: summary.gyms_trialing },
      { label: 'Active gyms', value: summary.gyms_active },
      { label: 'Past due gyms', value: summary.gyms_past_due },
      { label: 'Canceled gyms', value: summary.gyms_canceled }
    ];
  }, [dashboardState.summary]);

  const founderRequests = useMemo(() => {
    const searchValue = filterState.founderSearch.trim().toLowerCase();

    return (dashboardState.founder_requests || []).filter((request) => {
      const matchesStatus = filterState.founderStatus === 'all'
        || request.status === filterState.founderStatus;
      const matchesSearch = !searchValue || [
        request.gym_name,
        request.email,
        request.first_name,
        request.last_name,
        request.phone,
        request.linked_owner_email
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchValue));

      return matchesStatus && matchesSearch;
    });
  }, [dashboardState.founder_requests, filterState.founderSearch, filterState.founderStatus]);

  const gyms = useMemo(() => {
    const searchValue = filterState.gymSearch.trim().toLowerCase();

    return (dashboardState.gyms || []).filter((gym) => {
      const matchesBillingStatus = filterState.gymBillingStatus === 'all'
        || gym.billing_status === filterState.gymBillingStatus;
      const accessState = gym.is_platform_suspended ? 'suspended' : 'live';
      const matchesAccessState = filterState.gymAccessState === 'all'
        || accessState === filterState.gymAccessState;
      const matchesSearch = !searchValue || [
        gym.name,
        gym.slug,
        gym.owner_email,
        String(gym.id)
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchValue));

      return matchesBillingStatus && matchesAccessState && matchesSearch;
    });
  }, [dashboardState.gyms, filterState.gymBillingStatus, filterState.gymAccessState, filterState.gymSearch]);

  const setActionLoading = (loadingAction) => {
    setActionState((prev) => ({
      ...prev,
      loadingAction
    }));
  };

  const setNotice = (notice) => {
    setPageState((prev) => ({
      ...prev,
      notice,
      error: ''
    }));

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const setError = (errorMessage) => {
    setPageState((prev) => ({
      ...prev,
      error: errorMessage,
      notice: ''
    }));

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const storeInviteDetails = (inviteUrl, inviteExpiresAt) => {
    setActionState((prev) => ({
      ...prev,
      latestInviteUrl: inviteUrl || '',
      latestInviteExpiresAt: inviteExpiresAt || '',
      copiedInviteUrl: ''
    }));
  };

  const handleMarkContacted = async (request) => {
    const notes = window.prompt(
      `Add an optional internal note for ${request.first_name} ${request.last_name}:`,
      request.internal_notes || ''
    );

    if (notes === null) {
      return;
    }

    const actionKey = `contact-${request.id}`;
    setActionLoading(actionKey);

    try {
      await api.post(`/platform-admin/founder-requests/${request.id}/contacted`, {
        notes
      });
      setNotice(`Marked ${request.gym_name} as contacted.`);
      await loadDashboard({ preserveNotice: true });
    } catch (error) {
      setError(error.response?.data?.message || 'Could not mark this founder request as contacted.');
    } finally {
      setActionLoading('');
    }
  };

  const handleProvision = async (request) => {
    const confirmed = window.confirm(
      `Provision ${request.gym_name} and create an owner invite for ${request.email}?`
    );

    if (!confirmed) {
      return;
    }

    const actionKey = `provision-${request.id}`;
    setActionLoading(actionKey);

    try {
      const response = await api.post(`/platform-admin/founder-requests/${request.id}/provision`);
      const inviteUrl = response.data?.invite_url || '';
      const inviteExpiresAt = response.data?.invite_expires_at || '';

      storeInviteDetails(inviteUrl, inviteExpiresAt);
      setNotice(`Provisioned ${request.gym_name}. Copy the invite URL and send it to the founder.`);
      await loadDashboard({ preserveNotice: true });
    } catch (error) {
      setError(error.response?.data?.message || 'Could not provision this founder request.');
    } finally {
      setActionLoading('');
    }
  };

  const handleResendInvite = async (request) => {
    const confirmed = window.confirm(
      `Generate a fresh owner invite for ${request.gym_name}?`
    );

    if (!confirmed) {
      return;
    }

    const actionKey = `resend-${request.id}`;
    setActionLoading(actionKey);

    try {
      const response = await api.post(`/platform-admin/founder-requests/${request.id}/resend-invite`);
      const inviteUrl = response.data?.invite_url || '';
      const inviteExpiresAt = response.data?.invite_expires_at || '';

      storeInviteDetails(inviteUrl, inviteExpiresAt);
      setNotice(`Generated a fresh invite for ${request.gym_name}.`);
      await loadDashboard({ preserveNotice: true });
    } catch (error) {
      setError(error.response?.data?.message || 'Could not resend the founder invite.');
    } finally {
      setActionLoading('');
    }
  };

  const handleDeactivateGym = async (gym) => {
    const confirmed = window.confirm(
      `Deactivate ${gym.name}? This will inactivate gym users and mark billing as canceled.`
    );

    if (!confirmed) {
      return;
    }

    const actionKey = `deactivate-${gym.id}`;
    setActionLoading(actionKey);

    try {
      await api.post(`/platform-admin/gyms/${gym.id}/deactivate`);
      setNotice(`Deactivated ${gym.name}.`);
      await loadDashboard({ preserveNotice: true });
    } catch (error) {
      setError(error.response?.data?.message || 'Could not deactivate this gym.');
    } finally {
      setActionLoading('');
    }
  };

  const handleCopyInvite = async () => {
    if (!actionState.latestInviteUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(actionState.latestInviteUrl);
      setActionState((prev) => ({
        ...prev,
        copiedInviteUrl: 'Invite URL copied.'
      }));
    } catch {
      setActionState((prev) => ({
        ...prev,
        copiedInviteUrl: 'Copy failed. Select the URL below manually.'
      }));
    }
  };

  const handleSaveNotes = async (request) => {
    const notes = window.prompt(
      `Edit internal notes for ${request.gym_name}:`,
      request.internal_notes || ''
    );

    if (notes === null) {
      return;
    }

    const actionKey = `notes-${request.id}`;
    setActionLoading(actionKey);

    try {
      await api.patch(`/platform-admin/founder-requests/${request.id}/notes`, {
        notes
      });
      setNotice(`Updated notes for ${request.gym_name}.`);
      await loadDashboard({ preserveNotice: true });
    } catch (error) {
      setError(error.response?.data?.message || 'Could not update founder request notes.');
    } finally {
      setActionLoading('');
    }
  };

  const handleSuspendGym = async (gym) => {
    const reason = window.prompt(
      `Add an optional suspension reason for ${gym.name}:`,
      gym.platform_suspension_reason || ''
    );

    if (reason === null) {
      return;
    }

    const confirmed = window.confirm(
      `Suspend ${gym.name}? Users will keep their records, but the gym will be blocked from protected app routes until reactivated.`
    );

    if (!confirmed) {
      return;
    }

    const actionKey = `suspend-${gym.id}`;
    setActionLoading(actionKey);

    try {
      await api.post(`/platform-admin/gyms/${gym.id}/suspend`, {
        reason
      });
      setNotice(`Suspended ${gym.name}.`);
      await loadDashboard({ preserveNotice: true });
    } catch (error) {
      setError(error.response?.data?.message || 'Could not suspend this gym.');
    } finally {
      setActionLoading('');
    }
  };

  const handleReactivateGym = async (gym) => {
    const confirmed = window.confirm(
      `Reactivate ${gym.name} and restore normal app access?`
    );

    if (!confirmed) {
      return;
    }

    const actionKey = `reactivate-${gym.id}`;
    setActionLoading(actionKey);

    try {
      await api.post(`/platform-admin/gyms/${gym.id}/reactivate`);
      setNotice(`Reactivated ${gym.name}.`);
      await loadDashboard({ preserveNotice: true });
    } catch (error) {
      setError(error.response?.data?.message || 'Could not reactivate this gym.');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <Layout>
      <div className="account-page platform-admin-page">
        <h2 className="page-title">Platform Admin</h2>
        <p className="page-intro">
          Private operator view for founder leads, gym provisioning, invite recovery, and subscription health across every academy.
        </p>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>Eagle-eye summary</h3>
              <p className="section-note">
                This pulls together founder pipeline and current gym billing status without touching the normal gym-owner workflows.
              </p>
            </div>
          </div>

          {pageState.notice ? (
            <p className="success-text account-form-feedback">{pageState.notice}</p>
          ) : null}

          {pageState.error ? (
            <p className="error-text account-form-feedback">{pageState.error}</p>
          ) : null}

          {pageState.loading ? (
            <p className="meta-text">Loading platform admin data...</p>
          ) : (
            <div className="platform-admin-summary-grid">
              {summaryCards.map((card) => (
                <div key={card.label} className="platform-admin-summary-card">
                  <span className="platform-admin-summary-label">{card.label}</span>
                  <strong className="platform-admin-summary-value">{card.value}</strong>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>Founder requests</h3>
              <p className="section-note">
                Review incoming founder leads, mark outreach, provision gyms, and resend owner invites from one place.
              </p>
            </div>
          </div>

          <div className="platform-admin-filter-grid">
            <label>
              Search founder requests
              <input
                type="search"
                value={filterState.founderSearch}
                onChange={(event) => setFilterState((prev) => ({
                  ...prev,
                  founderSearch: event.target.value
                }))}
                placeholder="Gym, owner, email, or phone"
              />
            </label>
            <label>
              Founder status
              <select
                value={filterState.founderStatus}
                onChange={(event) => setFilterState((prev) => ({
                  ...prev,
                  founderStatus: event.target.value
                }))}
              >
                <option value="all">All statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="provisioned">Provisioned</option>
                <option value="converted">Converted</option>
              </select>
            </label>
          </div>

          {actionState.latestInviteUrl ? (
            <div className="account-billing-card">
              <div className="account-summary-heading">
                <span className="dashboard-card-icon"><AppIcon name="account" /></span>
                <div>
                  <strong>Latest owner invite</strong>
                  <div className="meta-text">
                    Send this setup link to the founder. It stays valid until {formatDateLabel(actionState.latestInviteExpiresAt)}.
                  </div>
                </div>
              </div>
              <div className="detail-block">
                <div className="account-billing-status-card">
                  <span className="meta-text">Invite URL</span>
                  <strong style={{ overflowWrap: 'anywhere' }}>{actionState.latestInviteUrl}</strong>
                </div>
                <div className="inline-actions">
                  <button type="button" className="secondary-button" onClick={handleCopyInvite}>
                    <AppIcon name="account" />
                    <span>Copy invite URL</span>
                  </button>
                </div>
                {actionState.copiedInviteUrl ? (
                  <p className="meta-text">{actionState.copiedInviteUrl}</p>
                ) : null}
              </div>
            </div>
          ) : null}

          {pageState.loading ? (
            <p className="meta-text">Loading founder requests...</p>
          ) : founderRequests.length === 0 ? (
            <p className="meta-text">No founder requests yet.</p>
          ) : (
            <div className="card-list">
              {founderRequests.map((request) => {
                const actionPrefix = request.id;
                const isProvisioned = Boolean(request.linked_gym_id && request.linked_owner_user_id);

                return (
                  <article key={request.id} className="card-item detail-block platform-admin-record-card">
                    <div className="compact-topic-header">
                      <div>
                        <strong>{request.gym_name}</strong>
                        <div className="meta-text">
                          {request.first_name} {request.last_name} - {request.email} - {formatPhoneLabel(request.phone)}
                        </div>
                      </div>
                      <span className="member-card-summary-pill">
                        {formatStatusLabel(request.status)}
                      </span>
                    </div>

                    <div className="account-billing-status-grid">
                      <div className="account-billing-status-card">
                        <span className="meta-text">Requested</span>
                        <strong>{formatDateLabel(request.created_at)}</strong>
                      </div>
                      <div className="account-billing-status-card">
                        <span className="meta-text">Linked gym</span>
                        <strong>{request.linked_gym_id ? `#${request.linked_gym_id}` : 'Not provisioned'}</strong>
                      </div>
                      <div className="account-billing-status-card">
                        <span className="meta-text">Owner user</span>
                        <strong>{request.linked_owner_user_id ? `#${request.linked_owner_user_id}` : 'Not created'}</strong>
                      </div>
                      <div className="account-billing-status-card">
                        <span className="meta-text">Billing status</span>
                        <strong>{formatStatusLabel(request.billing_status)}</strong>
                      </div>
                    </div>

                    {request.internal_notes ? (
                      <p className="section-note">Notes: {request.internal_notes}</p>
                    ) : null}

                    <div className="inline-actions platform-admin-action-row">
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={actionState.loadingAction === `contact-${actionPrefix}`}
                        onClick={() => handleMarkContacted(request)}
                      >
                        <AppIcon name="account" />
                        <span>
                          {actionState.loadingAction === `contact-${actionPrefix}`
                            ? 'Saving outreach...'
                            : 'Mark contacted'}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={actionState.loadingAction === `notes-${actionPrefix}`}
                        onClick={() => handleSaveNotes(request)}
                      >
                        <AppIcon name="reports" />
                        <span>
                          {actionState.loadingAction === `notes-${actionPrefix}`
                            ? 'Saving notes...'
                            : 'Edit notes'}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={isProvisioned || actionState.loadingAction === `provision-${actionPrefix}`}
                        onClick={() => handleProvision(request)}
                      >
                        <AppIcon name="programs" />
                        <span>
                          {actionState.loadingAction === `provision-${actionPrefix}`
                            ? 'Provisioning...'
                            : 'Provision gym'}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={!isProvisioned || actionState.loadingAction === `resend-${actionPrefix}`}
                        onClick={() => handleResendInvite(request)}
                      >
                        <AppIcon name="reports" />
                        <span>
                          {actionState.loadingAction === `resend-${actionPrefix}`
                            ? 'Generating invite...'
                            : 'Resend invite'}
                        </span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>Gym overview</h3>
              <p className="section-note">
                Quick platform-wide snapshot of owner access and billing state. Deactivation here is intentionally blunt and should be used for real shutdown cases only.
              </p>
            </div>
          </div>

          <div className="platform-admin-filter-grid">
            <label>
              Search gyms
              <input
                type="search"
                value={filterState.gymSearch}
                onChange={(event) => setFilterState((prev) => ({
                  ...prev,
                  gymSearch: event.target.value
                }))}
                placeholder="Gym name, slug, owner email, or ID"
              />
            </label>
            <label>
              Billing status
              <select
                value={filterState.gymBillingStatus}
                onChange={(event) => setFilterState((prev) => ({
                  ...prev,
                  gymBillingStatus: event.target.value
                }))}
              >
                <option value="all">All billing states</option>
                <option value="trialing">Trialing</option>
                <option value="active">Active</option>
                <option value="past_due">Past due</option>
                <option value="canceled">Canceled</option>
                <option value="none">None</option>
              </select>
            </label>
            <label>
              Access state
              <select
                value={filterState.gymAccessState}
                onChange={(event) => setFilterState((prev) => ({
                  ...prev,
                  gymAccessState: event.target.value
                }))}
              >
                <option value="all">All gyms</option>
                <option value="live">Live</option>
                <option value="suspended">Suspended</option>
              </select>
            </label>
          </div>

          {pageState.loading ? (
            <p className="meta-text">Loading gyms...</p>
          ) : gyms.length === 0 ? (
            <p className="meta-text">No gyms found yet.</p>
          ) : (
            <div className="card-list">
              {gyms.map((gym) => (
                <article key={gym.id} className="card-item detail-block platform-admin-record-card">
                  <div className="compact-topic-header">
                    <div>
                      <strong>{gym.name}</strong>
                      <div className="meta-text">
                        #{gym.id} - {gym.slug}
                      </div>
                    </div>
                    <span className="member-card-summary-pill">
                      {gym.is_platform_suspended ? 'Suspended' : formatStatusLabel(gym.billing_status)}
                    </span>
                  </div>

                  <div className="account-billing-status-grid">
                    <div className="account-billing-status-card">
                      <span className="meta-text">Owner</span>
                      <strong>{gym.owner_email || 'Not linked'}</strong>
                    </div>
                    <div className="account-billing-status-card">
                      <span className="meta-text">Owner active</span>
                      <strong>{gym.owner_is_active ? 'Yes' : 'No'}</strong>
                    </div>
                    <div className="account-billing-status-card">
                      <span className="meta-text">Access state</span>
                      <strong>{gym.is_platform_suspended ? 'Suspended' : 'Live'}</strong>
                    </div>
                    <div className="account-billing-status-card">
                      <span className="meta-text">Plan</span>
                      <strong>{formatStatusLabel(gym.plan_code)}</strong>
                    </div>
                    <div className="account-billing-status-card">
                      <span className="meta-text">Trial ends</span>
                      <strong>{formatDateLabel(gym.trial_ends_at)}</strong>
                    </div>
                    <div className="account-billing-status-card">
                      <span className="meta-text">Current period end</span>
                      <strong>{formatDateLabel(gym.current_period_end)}</strong>
                    </div>
                    <div className="account-billing-status-card">
                      <span className="meta-text">Cancel at period end</span>
                      <strong>{gym.cancel_at_period_end ? 'Yes' : 'No'}</strong>
                    </div>
                  </div>

                  {gym.platform_suspension_reason ? (
                    <p className="section-note">Suspension reason: {gym.platform_suspension_reason}</p>
                  ) : null}

                  <div className="inline-actions platform-admin-action-row">
                    {gym.is_platform_suspended ? (
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={actionState.loadingAction === `reactivate-${gym.id}`}
                        onClick={() => handleReactivateGym(gym)}
                      >
                        <AppIcon name="progress" />
                        <span>
                          {actionState.loadingAction === `reactivate-${gym.id}`
                            ? 'Reactivating...'
                            : 'Reactivate gym'}
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={actionState.loadingAction === `suspend-${gym.id}`}
                        onClick={() => handleSuspendGym(gym)}
                      >
                        <AppIcon name="reports" />
                        <span>
                          {actionState.loadingAction === `suspend-${gym.id}`
                            ? 'Suspending...'
                            : 'Suspend gym'}
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      className="danger-button"
                      disabled={actionState.loadingAction === `deactivate-${gym.id}`}
                      onClick={() => handleDeactivateGym(gym)}
                    >
                      <AppIcon name="close" />
                      <span>
                        {actionState.loadingAction === `deactivate-${gym.id}`
                          ? 'Deactivating...'
                          : 'Deactivate gym'}
                      </span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
