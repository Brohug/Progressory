import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import { useAuth } from '../hooks/useAuth';

const formatStatusLabel = (value) => (
  String(value || 'none')
    .replace(/^regular$/i, 'standard')
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
    : parsedDate.toLocaleDateString('en-US');
};

export default function BillingPage() {
  const { user } = useAuth();
  const location = useLocation();
  const isBillingManager = user?.role === 'owner' || user?.role === 'admin';
  const [billingState, setBillingState] = useState(null);
  const [usageState, setUsageState] = useState(null);
  const [planLimits, setPlanLimits] = useState(null);
  const [usageWarnings, setUsageWarnings] = useState([]);
  const [founderAvailability, setFounderAvailability] = useState(null);
  const [pageState, setPageState] = useState({
    loading: true,
    error: '',
    notice: ''
  });
  const [actionState, setActionState] = useState({
    loadingAction: '',
    error: ''
  });

  const checkoutMessage = useMemo(() => {
    const query = new URLSearchParams(location.search);

    if (query.get('checkout') === 'success') {
      return 'Stripe returned successfully. We are checking your subscription status now.';
    }

    if (query.get('checkout') === 'cancel') {
      return 'Checkout was canceled before any billing changes were confirmed.';
    }

    return '';
  }, [location.search]);

  useEffect(() => {
    const loadBillingState = async () => {
      setPageState({
        loading: true,
        error: '',
        notice: checkoutMessage
      });

      try {
        const response = isBillingManager
          ? await api.get('/billing/status')
          : await api.get('/billing/access-status');

        const nextBillingState = isBillingManager
          ? response.data?.subscription || null
          : {
              gym_id: response.data?.gym_id ?? user?.gym_id ?? null,
              plan_code: response.data?.plan_code || 'none',
              plan_label: response.data?.plan_label || '',
              billing_status: response.data?.billing_status || 'none',
              access_granted: Boolean(response.data?.access_granted),
              stripe_customer_id_present: false,
              stripe_subscription_id_present: false,
              current_period_end: response.data?.current_period_end || null,
              cancel_at_period_end: Boolean(response.data?.cancel_at_period_end),
              trial_ends_at: response.data?.trial_ends_at || null
            };

        setBillingState(nextBillingState);
        setUsageState(isBillingManager ? response.data?.usage || null : null);
        setPlanLimits(isBillingManager ? response.data?.plan_limits || null : null);
        setUsageWarnings(isBillingManager ? response.data?.usage_warnings || [] : []);
        setFounderAvailability(isBillingManager ? response.data?.founder_availability || null : null);
        setPageState({
          loading: false,
          error: '',
          notice: checkoutMessage
        });
      } catch (error) {
        setBillingState(null);
        setPageState({
          loading: false,
          error: error.response?.data?.message || 'Could not load billing details right now.',
          notice: checkoutMessage
        });
      }
    };

    loadBillingState();
  }, [checkoutMessage, isBillingManager, user?.gym_id]);

  const handleCheckout = async (planCode) => {
    setActionState({
      loadingAction: `checkout-${planCode}`,
      error: ''
    });

    try {
      const response = await api.post('/billing/checkout-session', {
        plan: planCode
      });

      const checkoutUrl = response.data?.url;

      if (!checkoutUrl) {
        throw new Error('Missing checkout URL');
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      setActionState({
        loadingAction: '',
        error: error.response?.data?.message || 'Could not start checkout right now.'
      });
    }
  };

  const handleCustomerPortal = async () => {
    setActionState({
      loadingAction: 'portal',
      error: ''
    });

    try {
      const response = await api.post('/billing/customer-portal');
      const portalUrl = response.data?.url;

      if (!portalUrl) {
        throw new Error('Missing portal URL');
      }

      window.location.href = portalUrl;
    } catch (error) {
      setActionState({
        loadingAction: '',
        error: error.response?.data?.message || 'Could not open the customer portal right now.'
      });
    }
  };

  return (
    <Layout>
      <div className="billing-page">
        <h2 className="page-title">Billing</h2>
        <p className="page-intro">
          Review the current plan, usage, founder availability, and Stripe-backed billing tools for this gym.
        </p>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>Billing overview</h3>
              <p className="section-note">
                This page reads the live subscription state and plan usage for the gym directly from the backend.
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
            <p className="meta-text">Loading billing details...</p>
          ) : billingState ? (
            <div className="account-billing-status-grid">
              <div className="account-billing-status-card">
                <span className="meta-text">Current plan</span>
                <strong>{billingState.plan_label || formatStatusLabel(billingState.plan_code)}</strong>
              </div>
              <div className="account-billing-status-card">
                <span className="meta-text">Billing status</span>
                <strong>{formatStatusLabel(billingState.billing_status)}</strong>
              </div>
              <div className="account-billing-status-card">
                <span className="meta-text">Access granted</span>
                <strong>{billingState.access_granted ? 'Yes' : 'No'}</strong>
              </div>
              <div className="account-billing-status-card">
                <span className="meta-text">Stripe customer</span>
                <strong>{billingState.stripe_customer_id_present ? 'Connected' : 'Not started'}</strong>
              </div>
              <div className="account-billing-status-card">
                <span className="meta-text">Stripe subscription</span>
                <strong>{billingState.stripe_subscription_id_present ? 'Connected' : 'Not linked yet'}</strong>
              </div>
              <div className="account-billing-status-card">
                <span className="meta-text">Current period end</span>
                <strong>{formatDateLabel(billingState.current_period_end)}</strong>
              </div>
              <div className="account-billing-status-card">
                <span className="meta-text">Current period start</span>
                <strong>{formatDateLabel(billingState.current_period_start)}</strong>
              </div>
              <div className="account-billing-status-card">
                <span className="meta-text">Trial ends</span>
                <strong>{formatDateLabel(billingState.trial_ends_at)}</strong>
              </div>
              <div className="account-billing-status-card">
                <span className="meta-text">Cancel at period end</span>
                <strong>{billingState.cancel_at_period_end ? 'Yes' : 'No'}</strong>
              </div>
              <div className="account-billing-status-card">
                <span className="meta-text">Founder locked rate</span>
                <strong>{billingState.founder_locked_rate ? 'Yes' : 'No'}</strong>
              </div>
            </div>
          ) : null}
        </section>

        {isBillingManager && billingState && usageState && planLimits ? (
          <section className="page-section">
            <div className="section-header">
              <div>
                <h3>Plan usage</h3>
                <p className="section-note">
                  We warn as you approach plan limits and block new usage only after a hard limit is reached. No automatic overage billing is enabled.
                </p>
              </div>
            </div>

            {usageWarnings.length > 0 ? (
              <div className="detail-block" style={{ marginBottom: '1rem' }}>
                {usageWarnings.map((warning) => (
                  <p key={warning.limitType} className="success-text account-form-feedback" style={{ marginBottom: 0 }}>
                    {warning.message}
                  </p>
                ))}
              </div>
            ) : null}

            <div className="account-billing-status-grid">
              <div className="account-billing-status-card">
                <span className="meta-text">Coaches</span>
                <strong>{usageState.coaches_count} / {planLimits.max_coaches}</strong>
              </div>
              <div className="account-billing-status-card">
                <span className="meta-text">Active members</span>
                <strong>{usageState.active_members_count} / {planLimits.max_active_members}</strong>
              </div>
              <div className="account-billing-status-card">
                <span className="meta-text">Library items</span>
                <strong>{usageState.library_items_count} / {planLimits.max_library_items}</strong>
              </div>
              <div className="account-billing-status-card">
                <span className="meta-text">External video links</span>
                <strong>{usageState.external_video_links_count} / {planLimits.max_external_video_links}</strong>
              </div>
              <div className="account-billing-status-card">
                <span className="meta-text">Direct video uploads</span>
                <strong>{planLimits.max_direct_video_uploads > 0 ? `${usageState.direct_video_uploads_count} / ${planLimits.max_direct_video_uploads}` : 'Disabled during founder beta'}</strong>
              </div>
              <div className="account-billing-status-card">
                <span className="meta-text">Storage</span>
                <strong>{planLimits.max_storage_mb > 0 ? `${usageState.storage_mb_used} MB / ${planLimits.max_storage_mb} MB` : 'Not enabled during founder beta'}</strong>
              </div>
            </div>
          </section>
        ) : null}

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>How billing works here</h3>
              <p className="section-note">
                Owners and admins can start Stripe checkout or open the customer portal here. Staff and members can still review the current billing state without getting payment controls.
              </p>
            </div>
          </div>

          <div className="account-permissions-grid">
            <div className="summary-card account-summary-card">
              <div className="account-summary-heading">
                <span className="dashboard-card-icon"><AppIcon name="reports" /></span>
                <div>
                  <strong>Subscription status</strong>
                  <div className="meta-text">Read directly from the backend billing record for this gym.</div>
                </div>
              </div>
              <div className="account-access-list">
                <div className="account-access-item">
                  <AppIcon name="progress" />
                  <span>Current plan, billing status, and access rights come from backend subscription sync.</span>
                </div>
                <div className="account-access-item">
                  <AppIcon name="progress" />
                  <span>Stripe checkout alone does not activate access until webhook sync confirms it.</span>
                </div>
              </div>
            </div>

            <div className="summary-card account-summary-card">
              <div className="account-summary-heading">
                <span className="dashboard-card-icon"><AppIcon name="account" /></span>
                <div>
                <strong>{isBillingManager ? 'Billing actions' : 'Need a billing change?'}</strong>
                <div className="meta-text">
                    {isBillingManager
                      ? 'Start checkout or open the customer portal without leaving the app flow.'
                      : 'Only the gym owner or an admin can start checkout or open the Stripe customer portal.'}
                </div>
                </div>
              </div>
              <div className="account-access-list">
                <div className={`account-access-item${isBillingManager ? '' : ' is-muted'}`}>
                  <AppIcon name="account" />
                  <span>
                    {isBillingManager
                      ? 'Use founder or Standard checkout when the gym needs a plan.'
                      : 'Contact the gym owner or an admin if billing needs to be started, updated, or recovered.'}
                  </span>
                </div>
                <div className={`account-access-item${isBillingManager ? '' : ' is-muted'}`}>
                  <AppIcon name="account" />
                  <span>
                    {isBillingManager
                      ? 'Open Stripe customer portal after checkout has created a customer record.'
                      : 'Your access view is read-only here so billing controls stay with gym management.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-section account-billing-section">
          <div className="section-header">
            <div>
              <h3>{isBillingManager ? 'Manage billing' : 'Billing status'}</h3>
              <p className="section-note">
                {isBillingManager
                  ? 'These actions talk directly to the backend billing routes and then hand off to Stripe.'
                  : 'You can review the current billing state here, but checkout and portal access stay with gym management.'}
              </p>
            </div>
          </div>

            <div className="account-billing-card">
            <div className="account-summary-heading">
              <span className="dashboard-card-icon"><AppIcon name="reports" /></span>
              <div>
                <strong>{isBillingManager ? 'Stripe billing controls' : 'Read-only billing view'}</strong>
                <div className="meta-text">
                  {isBillingManager
                    ? 'Choose a plan or open the customer portal once Stripe has a customer for this gym.'
                    : 'Billing management actions are hidden because this account is not a gym-management account.'}
                </div>
              </div>
            </div>

            {actionState.error ? (
              <p className="error-text account-form-feedback">{actionState.error}</p>
            ) : null}

            {billingState?.billing_status === 'trialing' && billingState?.trial_ends_at ? (
              <p className="success-text account-form-feedback">
                Trial ends: {formatDateLabel(billingState.trial_ends_at)}
              </p>
            ) : null}

            {founderAvailability && !founderAvailability.founderPlanAvailable ? (
              <p className="error-text account-form-feedback">
                Founder Plan spots are currently filled. Please choose the Standard Plan.
              </p>
            ) : null}

            {billingState?.plan_code === 'founder' && billingState?.billing_status !== 'canceled' ? (
              <p className="meta-text account-form-feedback">
                Founder rate stays locked while this gym remains subscribed.
              </p>
            ) : null}

            {isBillingManager ? (
              <div className="inline-actions">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={
                    pageState.loading
                    || actionState.loadingAction === 'checkout-founder'
                    || (
                      founderAvailability
                      && !founderAvailability.founderPlanAvailable
                      && billingState?.plan_code !== 'founder'
                    )
                  }
                  onClick={() => handleCheckout('founder')}
                >
                  <AppIcon name="reports" />
                  <span>{actionState.loadingAction === 'checkout-founder' ? 'Opening founder checkout...' : 'Start Founder Plan'}</span>
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={pageState.loading || actionState.loadingAction === 'checkout-standard'}
                  onClick={() => handleCheckout('standard')}
                >
                  <AppIcon name="reports" />
                  <span>{actionState.loadingAction === 'checkout-standard' ? 'Opening standard checkout...' : 'Upgrade to Standard'}</span>
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={pageState.loading || actionState.loadingAction === 'portal'}
                  onClick={handleCustomerPortal}
                >
                  <AppIcon name="account" />
                  <span>{actionState.loadingAction === 'portal' ? 'Opening customer portal...' : 'Manage Billing'}</span>
                </button>
              </div>
            ) : (
              <p className="meta-text">
                Billing access is managed by the gym owner or an admin. If this gym needs a new plan, payment update, or recovery step, reach out to gym management to continue in Stripe.
              </p>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
