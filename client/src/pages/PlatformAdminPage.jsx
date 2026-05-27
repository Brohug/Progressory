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

const sortByDateDesc = (left, right) => {
  const leftTime = left ? new Date(left).getTime() : 0;
  const rightTime = right ? new Date(right).getTime() : 0;
  return rightTime - leftTime;
};

const buildFounderTimeline = (request) => {
  if (!request) {
    return [];
  }

  return [
    {
      key: 'requested',
      label: 'Lead submitted',
      timestamp: request.created_at,
      detail: `${request.first_name} ${request.last_name} requested founder access for ${request.gym_name}.`
    },
    {
      key: 'contacted',
      label: 'Owner contacted',
      timestamp: request.owner_contacted_at,
      detail: request.owner_contacted_at ? 'Initial outreach was logged from platform admin.' : ''
    },
    {
      key: 'provisioned',
      label: 'Gym provisioned',
      timestamp: request.provisioned_at,
      detail: request.linked_gym_id
        ? `Gym #${request.linked_gym_id}${request.linked_gym_slug ? ` (${request.linked_gym_slug})` : ''} and owner access were created.`
        : ''
    },
    {
      key: 'converted',
      label: 'Converted to customer',
      timestamp: request.converted_at,
      detail: request.converted_at
        ? `Lead was marked converted with ${formatStatusLabel(request.billing_status)} billing state.`
        : ''
    }
  ];
};

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
    inviteNotice: '',
    inviteEmailStatus: '',
    latestInviteInquiryId: null,
    latestInviteUrl: '',
    latestInviteExpiresAt: ''
  });
  const [detailState, setDetailState] = useState({
    selectedInquiryId: null,
    inquiry: null,
    loading: false,
    error: '',
    copyFeedback: ''
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

  const founderPipelineStats = useMemo(() => {
    const requests = dashboardState.founder_requests || [];

    return {
      total: requests.length,
      newCount: requests.filter((request) => request.status === 'new').length,
      contactedCount: requests.filter((request) => request.status === 'contacted').length,
      provisionedCount: requests.filter((request) => request.status === 'provisioned').length,
      convertedCount: requests.filter((request) => request.status === 'converted').length
    };
  }, [dashboardState.founder_requests]);

  const founderFunnelMetrics = useMemo(() => {
    const total = founderPipelineStats.total || 0;
    const contactedRate = total ? Math.round((founderPipelineStats.contactedCount / total) * 100) : 0;
    const provisionedRate = total ? Math.round((founderPipelineStats.provisionedCount / total) * 100) : 0;
    const convertedRate = total ? Math.round((founderPipelineStats.convertedCount / total) * 100) : 0;

    return {
      contactedRate,
      provisionedRate,
      convertedRate
    };
  }, [founderPipelineStats]);

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

  const recentFounderActivity = useMemo(() => {
    return [...(dashboardState.founder_requests || [])]
      .sort((left, right) => sortByDateDesc(
        left.converted_at || left.provisioned_at || left.owner_contacted_at || left.created_at,
        right.converted_at || right.provisioned_at || right.owner_contacted_at || right.created_at
      ))
      .slice(0, 5)
      .map((request) => {
        if (request.converted_at) {
          return {
            id: request.id,
            title: `${request.gym_name} converted`,
            timestamp: request.converted_at,
            detail: `${request.first_name} ${request.last_name} is now in the founder pipeline as a paying customer.`,
            stage: 'Converted'
          };
        }

        if (request.provisioned_at) {
          return {
            id: request.id,
            title: `${request.gym_name} provisioned`,
            timestamp: request.provisioned_at,
            detail: `Gym #${request.linked_gym_id || 'pending'} and owner access were created.`,
            stage: 'Provisioned'
          };
        }

        if (request.owner_contacted_at) {
          return {
            id: request.id,
            title: `${request.gym_name} contacted`,
            timestamp: request.owner_contacted_at,
            detail: `Outreach was logged for ${request.email}.`,
            stage: 'Contacted'
          };
        }

        return {
          id: request.id,
          title: `${request.gym_name} requested founder access`,
          timestamp: request.created_at,
          detail: `${request.first_name} ${request.last_name} submitted a new founder request.`,
          stage: 'New'
        };
      });
  }, [dashboardState.founder_requests]);

  const upcomingTrialEndings = useMemo(() => {
    const now = Date.now();
    const fourteenDaysFromNow = now + (14 * 24 * 60 * 60 * 1000);

    return [...(dashboardState.gyms || [])]
      .filter((gym) => gym.trial_ends_at)
      .map((gym) => ({
        ...gym,
        trialEndsAtTime: new Date(gym.trial_ends_at).getTime()
      }))
      .filter((gym) => Number.isFinite(gym.trialEndsAtTime) && gym.trialEndsAtTime >= now && gym.trialEndsAtTime <= fourteenDaysFromNow)
      .sort((left, right) => left.trialEndsAtTime - right.trialEndsAtTime)
      .slice(0, 5);
  }, [dashboardState.gyms]);

  const atRiskGyms = useMemo(() => {
    return [...(dashboardState.gyms || [])]
      .filter((gym) => (
        gym.is_platform_suspended
        || ['past_due', 'canceled', 'unpaid', 'incomplete'].includes(gym.billing_status)
        || gym.cancel_at_period_end
      ))
      .sort((left, right) => {
        const leftWeight = left.is_platform_suspended ? 4
          : left.billing_status === 'past_due' ? 3
            : left.billing_status === 'unpaid' || left.billing_status === 'incomplete' ? 2
              : left.cancel_at_period_end ? 1
                : 0;
        const rightWeight = right.is_platform_suspended ? 4
          : right.billing_status === 'past_due' ? 3
            : right.billing_status === 'unpaid' || right.billing_status === 'incomplete' ? 2
              : right.cancel_at_period_end ? 1
                : 0;
        return rightWeight - leftWeight || sortByDateDesc(left.current_period_end, right.current_period_end);
      })
      .slice(0, 6);
  }, [dashboardState.gyms]);

  const recentSuspensions = useMemo(() => {
    return [...(dashboardState.gyms || [])]
      .filter((gym) => gym.is_platform_suspended && gym.platform_suspended_at)
      .sort((left, right) => sortByDateDesc(left.platform_suspended_at, right.platform_suspended_at))
      .slice(0, 4);
  }, [dashboardState.gyms]);

  const founderDetailTimeline = useMemo(
    () => buildFounderTimeline(detailState.inquiry),
    [detailState.inquiry]
  );

  const setActionLoading = (loadingAction) => {
    setActionState((prev) => ({
      ...prev,
      loadingAction
    }));
  };

  const loadFounderRequestDetail = useCallback(async (inquiryId) => {
    setDetailState((prev) => ({
      ...prev,
      selectedInquiryId: inquiryId,
      loading: true,
      error: '',
      copyFeedback: ''
    }));

    try {
      const response = await api.get(`/platform-admin/founder-requests/${inquiryId}`);
      setDetailState((prev) => ({
        ...prev,
        selectedInquiryId: inquiryId,
        inquiry: response.data?.inquiry || null,
        loading: false,
        error: '',
        copyFeedback: ''
      }));
    } catch (error) {
      setDetailState((prev) => ({
        ...prev,
        selectedInquiryId: inquiryId,
        inquiry: null,
        loading: false,
        error: error.response?.data?.message || 'Could not load founder request details.',
        copyFeedback: ''
      }));
    }
  }, []);

  const closeFounderRequestDetail = () => {
    setDetailState({
      selectedInquiryId: null,
      inquiry: null,
      loading: false,
      error: '',
      copyFeedback: ''
    });
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

  const storeInviteDetails = (inquiryId, inviteUrl, inviteExpiresAt) => {
    setActionState((prev) => ({
      ...prev,
      inviteNotice: '',
      inviteEmailStatus: '',
      latestInviteInquiryId: inquiryId,
      latestInviteUrl: inviteUrl || '',
      latestInviteExpiresAt: inviteExpiresAt || '',
      copiedInviteUrl: ''
    }));
  };

  const getInviteEmailNotice = (request, emailDelivery, actionLabel) => {
    if (emailDelivery?.delivered) {
      return {
        inviteNotice: `${actionLabel} for ${request.gym_name}. The founder was emailed automatically and the invite URL is ready below if you want to copy it too.`,
        inviteEmailStatus: 'delivered'
      };
    }

    if (emailDelivery?.reason === 'notification_failed') {
      return {
        inviteNotice: `${actionLabel} for ${request.gym_name}, but email delivery failed. Copy the invite URL below and send it manually.`,
        inviteEmailStatus: 'failed'
      };
    }

    return {
      inviteNotice: `${actionLabel} for ${request.gym_name}. Email delivery is not configured yet, so copy the invite URL below and send it manually.`,
      inviteEmailStatus: 'manual'
    };
  };

  const refreshFounderDetailIfOpen = useCallback(async (inquiryId) => {
    if (detailState.selectedInquiryId === inquiryId) {
      await loadFounderRequestDetail(inquiryId);
    }
  }, [detailState.selectedInquiryId, loadFounderRequestDetail]);

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
      await refreshFounderDetailIfOpen(request.id);
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
      const inviteEmailNotice = getInviteEmailNotice(
        request,
        response.data?.email_delivery,
        'Provisioned owner access'
      );

      storeInviteDetails(request.id, inviteUrl, inviteExpiresAt);
      setActionState((prev) => ({
        ...prev,
        inviteNotice: inviteEmailNotice.inviteNotice,
        inviteEmailStatus: inviteEmailNotice.inviteEmailStatus
      }));
      setPageState((prev) => ({
        ...prev,
        notice: '',
        error: ''
      }));
      await loadDashboard();
      await refreshFounderDetailIfOpen(request.id);
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
      const inviteEmailNotice = getInviteEmailNotice(
        request,
        response.data?.email_delivery,
        'Generated a fresh owner invite'
      );

      storeInviteDetails(request.id, inviteUrl, inviteExpiresAt);
      setActionState((prev) => ({
        ...prev,
        inviteNotice: inviteEmailNotice.inviteNotice,
        inviteEmailStatus: inviteEmailNotice.inviteEmailStatus
      }));
      setPageState((prev) => ({
        ...prev,
        notice: '',
        error: ''
      }));
      await loadDashboard();
      await refreshFounderDetailIfOpen(request.id);
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
      await refreshFounderDetailIfOpen(request.id);
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

  const handleMarkConverted = async (request) => {
    const confirmed = window.confirm(
      `Mark ${request.gym_name} as converted? This is for your operator pipeline and does not change Stripe billing state.`
    );

    if (!confirmed) {
      return;
    }

    const actionKey = `convert-${request.id}`;
    setActionLoading(actionKey);

    try {
      await api.post(`/platform-admin/founder-requests/${request.id}/convert`);
      setNotice(`Marked ${request.gym_name} as converted.`);
      await loadDashboard({ preserveNotice: true });
      await refreshFounderDetailIfOpen(request.id);
    } catch (error) {
      setError(error.response?.data?.message || 'Could not mark this founder request as converted.');
    } finally {
      setActionLoading('');
    }
  };

  const handleCopyDetailInvite = async () => {
    if (!actionState.latestInviteUrl || actionState.latestInviteInquiryId !== detailState.selectedInquiryId) {
      return;
    }

    try {
      await navigator.clipboard.writeText(actionState.latestInviteUrl);
      setDetailState((prev) => ({
        ...prev,
        copyFeedback: 'Invite URL copied.'
      }));
    } catch {
      setDetailState((prev) => ({
        ...prev,
        copyFeedback: 'Copy failed. Select the URL below manually.'
      }));
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
            <div className="platform-admin-empty-state platform-admin-loading-state">
              <strong>Loading operator snapshot...</strong>
              <p className="meta-text">Pulling founder pipeline and live gym status now.</p>
            </div>
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
              <h3>Operator reporting</h3>
              <p className="section-note">
                Fast read on founder funnel momentum, upcoming trial risk, and gyms that may need attention before they churn or stall.
              </p>
            </div>
          </div>

          {pageState.loading ? (
            <div className="platform-admin-empty-state platform-admin-loading-state">
              <strong>Loading reporting snapshot...</strong>
              <p className="meta-text">Crunching funnel, trial, and risk signals across the platform.</p>
            </div>
          ) : (
            <div className="platform-admin-reporting-grid">
              <article className="account-billing-card platform-admin-feature-card">
                <div className="account-summary-heading">
                  <span className="dashboard-card-icon"><AppIcon name="progress" /></span>
                  <div>
                    <strong>Founder funnel</strong>
                    <div className="meta-text">
                      How far founder leads are making it from first request to actual customer.
                    </div>
                  </div>
                </div>

                <div className="platform-admin-funnel-grid">
                  <div className="platform-admin-funnel-step">
                    <span className="meta-text">Requested</span>
                    <strong>{founderPipelineStats.total}</strong>
                  </div>
                  <div className="platform-admin-funnel-step">
                    <span className="meta-text">Contacted</span>
                    <strong>{founderPipelineStats.contactedCount}</strong>
                    <span className="platform-admin-funnel-rate">{founderFunnelMetrics.contactedRate}%</span>
                  </div>
                  <div className="platform-admin-funnel-step">
                    <span className="meta-text">Provisioned</span>
                    <strong>{founderPipelineStats.provisionedCount}</strong>
                    <span className="platform-admin-funnel-rate">{founderFunnelMetrics.provisionedRate}%</span>
                  </div>
                  <div className="platform-admin-funnel-step">
                    <span className="meta-text">Converted</span>
                    <strong>{founderPipelineStats.convertedCount}</strong>
                    <span className="platform-admin-funnel-rate">{founderFunnelMetrics.convertedRate}%</span>
                  </div>
                </div>
              </article>

              <article className="account-billing-card">
                <div className="account-summary-heading">
                  <span className="dashboard-card-icon"><AppIcon name="reports" /></span>
                  <div>
                    <strong>Recent founder activity</strong>
                    <div className="meta-text">
                      The last few meaningful movements in your founder pipeline.
                    </div>
                  </div>
                </div>

                {recentFounderActivity.length === 0 ? (
                  <div className="platform-admin-empty-state">
                    <strong>No founder activity yet.</strong>
                    <p className="meta-text">New founder requests and status changes will show up here.</p>
                  </div>
                ) : (
                  <div className="platform-admin-activity-list">
                    {recentFounderActivity.map((item) => (
                      <div key={`${item.stage}-${item.id}`} className="platform-admin-activity-item">
                        <div className="platform-admin-activity-copy">
                          <strong>{item.title}</strong>
                          <span className="meta-text">{formatDateLabel(item.timestamp)}</span>
                          <p className="section-note">{item.detail}</p>
                        </div>
                        <span className="platform-admin-pill">{item.stage}</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>

              <article className="account-billing-card">
                <div className="account-summary-heading">
                  <span className="dashboard-card-icon"><AppIcon name="billing" /></span>
                  <div>
                    <strong>Trials ending soon</strong>
                    <div className="meta-text">
                      Founder or regular trials closing within the next 14 days.
                    </div>
                  </div>
                </div>

                {upcomingTrialEndings.length === 0 ? (
                  <div className="platform-admin-empty-state">
                    <strong>No trials ending in the next two weeks.</strong>
                    <p className="meta-text">This is a good buffer window right now.</p>
                  </div>
                ) : (
                  <div className="platform-admin-activity-list">
                    {upcomingTrialEndings.map((gym) => (
                      <div key={`trial-${gym.id}`} className="platform-admin-activity-item">
                        <div className="platform-admin-activity-copy">
                          <strong>{gym.name}</strong>
                          <span className="meta-text">{gym.owner_email || 'Owner not linked'}</span>
                          <p className="section-note">
                            Trial ends {formatDateLabel(gym.trial_ends_at)}. Plan: {formatStatusLabel(gym.plan_code)}.
                          </p>
                        </div>
                        <span className="platform-admin-pill">Trialing</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>

              <article className="account-billing-card">
                <div className="account-summary-heading">
                  <span className="dashboard-card-icon"><AppIcon name="account" /></span>
                  <div>
                    <strong>At-risk gyms</strong>
                    <div className="meta-text">
                      Suspended gyms, billing issues, and subscriptions set to end soon.
                    </div>
                  </div>
                </div>

                {atRiskGyms.length === 0 ? (
                  <div className="platform-admin-empty-state">
                    <strong>No immediate risk flags.</strong>
                    <p className="meta-text">Suspensions, past-due billing, and scheduled cancellations will show up here.</p>
                  </div>
                ) : (
                  <div className="platform-admin-activity-list">
                    {atRiskGyms.map((gym) => {
                      const riskLabel = gym.is_platform_suspended
                        ? 'Suspended'
                        : gym.billing_status === 'past_due'
                          ? 'Past due'
                          : gym.billing_status === 'unpaid' || gym.billing_status === 'incomplete'
                            ? 'Payment issue'
                            : gym.cancel_at_period_end
                              ? 'Scheduled cancel'
                              : 'Watch';

                      return (
                        <div key={`risk-${gym.id}`} className="platform-admin-activity-item">
                          <div className="platform-admin-activity-copy">
                            <strong>{gym.name}</strong>
                            <span className="meta-text">#{gym.id} - {gym.owner_email || 'Owner not linked'}</span>
                            <p className="section-note">
                              Status: {formatStatusLabel(gym.billing_status)}.
                              {gym.cancel_at_period_end ? ` Current period ends ${formatDateLabel(gym.current_period_end)}.` : ''}
                              {gym.platform_suspension_reason ? ` Suspension reason: ${gym.platform_suspension_reason}.` : ''}
                            </p>
                          </div>
                          <span className="platform-admin-pill">{riskLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>

              <article className="account-billing-card">
                <div className="account-summary-heading">
                  <span className="dashboard-card-icon"><AppIcon name="reports" /></span>
                  <div>
                    <strong>Recent suspensions</strong>
                    <div className="meta-text">
                      Quick visibility into who is currently platform-suspended and why.
                    </div>
                  </div>
                </div>

                {recentSuspensions.length === 0 ? (
                  <div className="platform-admin-empty-state">
                    <strong>No currently suspended gyms.</strong>
                    <p className="meta-text">That keeps the operator queue a little cleaner.</p>
                  </div>
                ) : (
                  <div className="platform-admin-activity-list">
                    {recentSuspensions.map((gym) => (
                      <div key={`suspension-${gym.id}`} className="platform-admin-activity-item">
                        <div className="platform-admin-activity-copy">
                          <strong>{gym.name}</strong>
                          <span className="meta-text">{formatDateLabel(gym.platform_suspended_at)}</span>
                          <p className="section-note">
                            {gym.platform_suspension_reason || 'No reason was recorded for this suspension.'}
                          </p>
                        </div>
                        <span className="platform-admin-pill">Suspended</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
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

          <div className="platform-admin-pipeline-row">
            <span className="platform-admin-pill">All leads {founderPipelineStats.total}</span>
            <span className="platform-admin-pill">New {founderPipelineStats.newCount}</span>
            <span className="platform-admin-pill">Contacted {founderPipelineStats.contactedCount}</span>
            <span className="platform-admin-pill">Provisioned {founderPipelineStats.provisionedCount}</span>
            <span className="platform-admin-pill">Converted {founderPipelineStats.convertedCount}</span>
          </div>

          {actionState.latestInviteUrl ? (
            <div className="account-billing-card platform-admin-feature-card">
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
                {actionState.inviteNotice ? (
                  <p className={`${actionState.inviteEmailStatus === 'failed' ? 'error-text' : 'success-text'} account-form-feedback`}>
                    {actionState.inviteNotice}
                  </p>
                ) : null}
                {actionState.copiedInviteUrl ? (
                  <p className="meta-text">{actionState.copiedInviteUrl}</p>
                ) : null}
              </div>
            </div>
          ) : null}

          {pageState.loading ? (
            <div className="platform-admin-empty-state platform-admin-loading-state">
              <strong>Loading founder requests...</strong>
              <p className="meta-text">Getting the latest founder leads and provisioning state.</p>
            </div>
          ) : founderRequests.length === 0 ? (
            <div className="platform-admin-empty-state">
              <strong>No founder requests match this view yet.</strong>
              <p className="meta-text">Try a different search or filter, or wait for the next founder application.</p>
            </div>
          ) : (
            <div className="card-list">
              {founderRequests.map((request) => {
                const actionPrefix = request.id;
                const isProvisioned = Boolean(request.linked_gym_id && request.linked_owner_user_id);

                return (
                  <article key={request.id} className="card-item detail-block platform-admin-record-card">
                    <div className="compact-topic-header">
                      <div>
                        <span className="landing-request-kicker">Founder lead #{request.id}</span>
                        <strong>{request.gym_name}</strong>
                        <div className="meta-text">
                          {request.first_name} {request.last_name} - {request.email} - {formatPhoneLabel(request.phone)}
                        </div>
                      </div>
                      <span className="member-card-summary-pill">
                        {formatStatusLabel(request.status)}
                      </span>
                    </div>

                    <div className="platform-admin-record-meta">
                      <span className="platform-admin-pill">Requested {formatDateLabel(request.created_at)}</span>
                      {request.owner_contacted_at ? (
                        <span className="platform-admin-pill">Contacted {formatDateLabel(request.owner_contacted_at)}</span>
                      ) : null}
                      {request.provisioned_at ? (
                        <span className="platform-admin-pill">Provisioned {formatDateLabel(request.provisioned_at)}</span>
                      ) : null}
                      {request.converted_at ? (
                        <span className="platform-admin-pill">Converted {formatDateLabel(request.converted_at)}</span>
                      ) : null}
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
                        onClick={() => loadFounderRequestDetail(request.id)}
                      >
                        <AppIcon name="reports" />
                        <span>View details</span>
                      </button>
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
                            : 'Email invite'}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={!isProvisioned || request.status === 'converted' || actionState.loadingAction === `convert-${actionPrefix}`}
                        onClick={() => handleMarkConverted(request)}
                      >
                        <AppIcon name="progress" />
                        <span>
                          {actionState.loadingAction === `convert-${actionPrefix}`
                            ? 'Saving conversion...'
                            : 'Mark converted'}
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
            <div className="platform-admin-empty-state platform-admin-loading-state">
              <strong>Loading gym overview...</strong>
              <p className="meta-text">Checking owner access and billing state across every gym.</p>
            </div>
          ) : gyms.length === 0 ? (
            <div className="platform-admin-empty-state">
              <strong>No gyms match this view right now.</strong>
              <p className="meta-text">Try a different search or billing filter.</p>
            </div>
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

        {detailState.selectedInquiryId ? (
          <div
            className="platform-admin-detail-overlay"
            role="presentation"
            onClick={closeFounderRequestDetail}
          >
            <section
              className="platform-admin-detail-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="platform-admin-founder-detail-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="platform-admin-detail-hero">
                <div className="platform-admin-detail-header">
                  <div>
                    <span className="landing-request-kicker">Founder lead detail</span>
                    <h3 id="platform-admin-founder-detail-title">
                      {detailState.inquiry?.gym_name || 'Founder request'}
                    </h3>
                    <p className="section-note">
                      Review the lead timeline, provisioning state, and invite history without leaving the dashboard.
                    </p>
                  </div>
                  <div className="platform-admin-detail-header-actions">
                    {detailState.inquiry ? (
                      <span className="member-card-summary-pill">
                        {formatStatusLabel(detailState.inquiry.status)}
                      </span>
                    ) : null}
                    <button type="button" className="secondary-button" onClick={closeFounderRequestDetail}>
                      <span>Close</span>
                    </button>
                  </div>
                </div>

                {detailState.inquiry ? (
                  <div className="platform-admin-record-meta">
                    <span className="platform-admin-pill">Lead #{detailState.inquiry.id}</span>
                    <span className="platform-admin-pill">Requested {formatDateLabel(detailState.inquiry.created_at)}</span>
                    {detailState.inquiry.linked_gym_id ? (
                      <span className="platform-admin-pill">Gym #{detailState.inquiry.linked_gym_id}</span>
                    ) : null}
                    {detailState.inquiry.linked_owner_email ? (
                      <span className="platform-admin-pill">Owner {detailState.inquiry.linked_owner_email}</span>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {detailState.loading ? (
                <div className="platform-admin-empty-state platform-admin-loading-state">
                  <strong>Loading founder request detail...</strong>
                  <p className="meta-text">Pulling the lead timeline, invite history, and billing snapshot.</p>
                </div>
              ) : detailState.error ? (
                <p className="error-text account-form-feedback">{detailState.error}</p>
              ) : detailState.inquiry ? (
                <div className="platform-admin-detail-stack">
                  <div className="account-billing-status-grid">
                    <div className="account-billing-status-card">
                      <span className="meta-text">Lead owner</span>
                      <strong>
                        {detailState.inquiry.first_name} {detailState.inquiry.last_name}
                      </strong>
                      <span className="meta-text">{detailState.inquiry.email}</span>
                    </div>
                    <div className="account-billing-status-card">
                      <span className="meta-text">Phone</span>
                      <strong>{formatPhoneLabel(detailState.inquiry.phone)}</strong>
                    </div>
                    <div className="account-billing-status-card">
                      <span className="meta-text">Pipeline status</span>
                      <strong>{formatStatusLabel(detailState.inquiry.status)}</strong>
                    </div>
                    <div className="account-billing-status-card">
                      <span className="meta-text">Billing state</span>
                      <strong>{formatStatusLabel(detailState.inquiry.billing_status)}</strong>
                    </div>
                    <div className="account-billing-status-card">
                      <span className="meta-text">Linked gym</span>
                      <strong>
                        {detailState.inquiry.linked_gym_id
                          ? `#${detailState.inquiry.linked_gym_id} - ${detailState.inquiry.linked_gym_slug || detailState.inquiry.linked_gym_name || 'Provisioned'}`
                          : 'Not provisioned'}
                      </strong>
                    </div>
                    <div className="account-billing-status-card">
                      <span className="meta-text">Linked owner</span>
                      <strong>{detailState.inquiry.linked_owner_email || 'Not created yet'}</strong>
                    </div>
                  </div>

                  <div className="platform-admin-detail-grid">
                    <div className="account-billing-card">
                      <div className="account-summary-heading">
                        <span className="dashboard-card-icon"><AppIcon name="reports" /></span>
                        <div>
                          <strong>Lead timeline</strong>
                          <div className="meta-text">
                            This keeps the founder pipeline visible even while onboarding is manual.
                          </div>
                        </div>
                      </div>

                      <div className="platform-admin-timeline">
                        {founderDetailTimeline.map((entry) => (
                          <div
                            key={entry.key}
                            className={`platform-admin-timeline-item${entry.timestamp ? ' is-complete' : ''}`}
                          >
                            <div className="platform-admin-timeline-marker" aria-hidden="true" />
                            <div className="platform-admin-timeline-copy">
                              <strong>{entry.label}</strong>
                              <span className="meta-text">
                                {entry.timestamp ? formatDateLabel(entry.timestamp) : 'Waiting on this step'}
                              </span>
                              {entry.detail ? (
                                <p className="section-note">{entry.detail}</p>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="account-billing-card">
                      <div className="account-summary-heading">
                        <span className="dashboard-card-icon"><AppIcon name="account" /></span>
                        <div>
                          <strong>Invite handoff</strong>
                          <div className="meta-text">
                            Fresh invite links only exist right after provisioning or sending a fresh email invite, but the history below shows each handoff event.
                          </div>
                        </div>
                      </div>

                      {actionState.latestInviteInquiryId === detailState.selectedInquiryId && actionState.latestInviteUrl ? (
                        <div className="detail-block">
                          <div className="account-billing-status-card">
                            <span className="meta-text">Fresh invite URL</span>
                            <strong style={{ overflowWrap: 'anywhere' }}>{actionState.latestInviteUrl}</strong>
                            <span className="meta-text">
                              Expires {formatDateLabel(actionState.latestInviteExpiresAt)}
                            </span>
                          </div>
                          <div className="inline-actions">
                            <button type="button" className="secondary-button" onClick={handleCopyDetailInvite}>
                              <AppIcon name="account" />
                              <span>Copy this invite</span>
                            </button>
                          </div>
                          {detailState.copyFeedback ? (
                            <p className="meta-text">{detailState.copyFeedback}</p>
                          ) : null}
                        </div>
                      ) : null}

                      {detailState.inquiry.invite_history?.length ? (
                        <div className="platform-admin-invite-history">
                          {detailState.inquiry.invite_history.map((invite) => (
                            <div key={invite.id} className="platform-admin-invite-row">
                              <div>
                                <strong>{formatStatusLabel(invite.invite_type)} invite</strong>
                                <div className="meta-text">
                                  Sent {formatDateLabel(invite.created_at)}
                                  {invite.created_by_email ? ` by ${invite.created_by_email}` : ''}
                                </div>
                              </div>
                              <div className="platform-admin-invite-meta">
                                <span className="meta-text">
                                  {invite.used_at
                                    ? `Used ${formatDateLabel(invite.used_at)}`
                                    : `Expires ${formatDateLabel(invite.expires_at)}`}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="meta-text">No invite history yet.</p>
                      )}
                    </div>
                  </div>

                  {detailState.inquiry.internal_notes ? (
                    <div className="account-billing-card">
                      <strong>Internal notes</strong>
                      <p className="section-note">{detailState.inquiry.internal_notes}</p>
                    </div>
                  ) : null}

                  <div className="inline-actions platform-admin-action-row">
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={actionState.loadingAction === `contact-${detailState.inquiry.id}`}
                      onClick={() => handleMarkContacted(detailState.inquiry)}
                    >
                      <AppIcon name="account" />
                      <span>Mark contacted</span>
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={actionState.loadingAction === `notes-${detailState.inquiry.id}`}
                      onClick={() => handleSaveNotes(detailState.inquiry)}
                    >
                      <AppIcon name="reports" />
                      <span>Edit notes</span>
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={Boolean(detailState.inquiry.linked_gym_id) || actionState.loadingAction === `provision-${detailState.inquiry.id}`}
                      onClick={() => handleProvision(detailState.inquiry)}
                    >
                      <AppIcon name="programs" />
                      <span>Provision gym</span>
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={!detailState.inquiry.linked_gym_id || actionState.loadingAction === `resend-${detailState.inquiry.id}`}
                      onClick={() => handleResendInvite(detailState.inquiry)}
                    >
                      <AppIcon name="reports" />
                      <span>Email invite</span>
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={!detailState.inquiry.linked_gym_id || detailState.inquiry.status === 'converted' || actionState.loadingAction === `convert-${detailState.inquiry.id}`}
                      onClick={() => handleMarkConverted(detailState.inquiry)}
                    >
                      <AppIcon name="progress" />
                      <span>Mark converted</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
