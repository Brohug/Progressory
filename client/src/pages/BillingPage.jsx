import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import { useAuth } from '../hooks/useAuth';

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
    : parsedDate.toLocaleDateString('en-US');
};

export default function BillingPage() {
  const { user } = useAuth();
  const location = useLocation();
  const isOwner = user?.role === 'owner';
  const [billingState, setBillingState] = useState(null);
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
        const response = isOwner
          ? await api.get('/billing/subscription')
          : await api.get('/billing/access-status');

        const nextBillingState = isOwner
          ? response.data?.subscription || null
          : {
              gym_id: response.data?.gym_id ?? user?.gym_id ?? null,
              plan_code: response.data?.plan_code || 'none',
              billing_status: response.data?.billing_status || 'none',
              access_granted: Boolean(response.data?.access_granted),
              stripe_customer_id_present: false,
              stripe_subscription_id_present: false,
              current_period_end: response.data?.current_period_end || null,
              cancel_at_period_end: Boolean(response.data?.cancel_at_period_end),
              trial_ends_at: response.data?.trial_ends_at || null
            };

        setBillingState(nextBillingState);
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
  }, [checkoutMessage, isOwner, user?.gym_id]);

  const handleCheckout = async (planCode) => {
    setActionState({
      loadingAction: `checkout-${planCode}`,
      error: ''
    });

    try {
      const response = await api.post('/billing/checkout-session', {
        plan_code: planCode
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
          Review the current subscription state for this gym and use Stripe-backed billing tools when you need to start or manage a plan.
        </p>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>Billing overview</h3>
              <p className="section-note">
                This page now reads the real subscription state from the backend instead of relying on placeholder billing UI.
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
                <strong>{formatStatusLabel(billingState.plan_code)}</strong>
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
                <span className="meta-text">Trial ends</span>
                <strong>{formatDateLabel(billingState.trial_ends_at)}</strong>
              </div>
              <div className="account-billing-status-card">
                <span className="meta-text">Cancel at period end</span>
                <strong>{billingState.cancel_at_period_end ? 'Yes' : 'No'}</strong>
              </div>
            </div>
          ) : null}
        </section>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>What this page is for</h3>
              <p className="section-note">
                Owners can start Stripe checkout or open the customer portal here. Staff and members can still review the current billing state without getting owner-only payment controls.
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
                  <span>Plan code, billing status, and access rights come from backend subscription sync.</span>
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
                  <strong>{isOwner ? 'Owner billing actions' : 'Need a billing change?'}</strong>
                  <div className="meta-text">
                    {isOwner
                      ? 'Start checkout or open the customer portal without leaving the app flow.'
                      : 'Only the gym owner can start checkout or open the Stripe customer portal.'}
                  </div>
                </div>
              </div>
              <div className="account-access-list">
                <div className={`account-access-item${isOwner ? '' : ' is-muted'}`}>
                  <AppIcon name="account" />
                  <span>
                    {isOwner
                      ? 'Use founder or regular checkout when the gym needs a plan.'
                      : 'Contact the gym owner if billing needs to be started, updated, or recovered.'}
                  </span>
                </div>
                <div className={`account-access-item${isOwner ? '' : ' is-muted'}`}>
                  <AppIcon name="account" />
                  <span>
                    {isOwner
                      ? 'Open Stripe customer portal after checkout has created a customer record.'
                      : 'Your access view is read-only here so billing controls stay with the owner.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-section account-billing-section">
          <div className="section-header">
            <div>
              <h3>{isOwner ? 'Manage billing' : 'Billing status'}</h3>
              <p className="section-note">
                {isOwner
                  ? 'These actions talk directly to the backend billing routes and then hand off to Stripe.'
                  : 'You can review the current billing state here, but checkout and portal access stay owner-only.'}
              </p>
            </div>
          </div>

            <div className="account-billing-card">
            <div className="account-summary-heading">
              <span className="dashboard-card-icon"><AppIcon name="reports" /></span>
              <div>
                <strong>{isOwner ? 'Stripe billing controls' : 'Read-only billing view'}</strong>
                <div className="meta-text">
                  {isOwner
                    ? 'Choose a plan or open the customer portal once Stripe has a customer for this gym.'
                    : 'Billing management actions are hidden because this account is not the gym owner.'}
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

            {isOwner ? (
              <div className="inline-actions">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={pageState.loading || actionState.loadingAction === 'checkout-founder'}
                  onClick={() => handleCheckout('founder')}
                >
                  <AppIcon name="reports" />
                  <span>{actionState.loadingAction === 'checkout-founder' ? 'Opening founder checkout...' : 'Start founder checkout'}</span>
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={pageState.loading || actionState.loadingAction === 'checkout-regular'}
                  onClick={() => handleCheckout('regular')}
                >
                  <AppIcon name="reports" />
                  <span>{actionState.loadingAction === 'checkout-regular' ? 'Opening regular checkout...' : 'Start regular checkout'}</span>
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={pageState.loading || actionState.loadingAction === 'portal'}
                  onClick={handleCustomerPortal}
                >
                  <AppIcon name="account" />
                  <span>{actionState.loadingAction === 'portal' ? 'Opening customer portal...' : 'Open customer portal'}</span>
                </button>
              </div>
            ) : (
              <p className="meta-text">
                Billing access is managed by the gym owner. If this gym needs a new plan, payment update, or recovery step, reach out to the owner to continue in Stripe.
              </p>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
