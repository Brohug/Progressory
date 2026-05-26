import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import { useAuth } from '../hooks/useAuth';

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

export default function SuspendedPage() {
  const { user, refreshUser } = useAuth();
  const [pageState, setPageState] = useState({
    loading: true,
    error: '',
    notice: ''
  });

  const checkAccessAgain = async () => {
    setPageState({
      loading: true,
      error: '',
      notice: ''
    });

    try {
      const refreshedUser = await refreshUser();
      setPageState({
        loading: false,
        error: '',
        notice: refreshedUser?.gym_is_platform_suspended
          ? 'We checked again. This gym is still suspended right now.'
          : 'Access restored. Redirecting...'
      });
    } catch (error) {
      setPageState({
        loading: false,
        error: error.response?.data?.message || 'Could not refresh account access right now.',
        notice: ''
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const syncUser = async () => {
      try {
        await refreshUser();

        if (!isMounted) {
          return;
        }

        setPageState({
          loading: false,
          error: '',
          notice: ''
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setPageState({
          loading: false,
          error: error.response?.data?.message || 'Could not refresh account access right now.',
          notice: ''
        });
      }
    };

    syncUser();

    return () => {
      isMounted = false;
    };
  }, [refreshUser]);

  if (user && !user.gym_is_platform_suspended) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <div className="account-page">
        <h2 className="page-title">Gym suspended</h2>
        <p className="page-intro">
          This gym is temporarily suspended. Billing and account recovery remain available, but the main coaching workspace is blocked until Progressory reactivates the gym.
        </p>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>Access status</h3>
              <p className="section-note">
                Use this page to confirm the current suspension state and retry access after the gym is reactivated.
              </p>
            </div>
          </div>

          {pageState.error ? (
            <p className="error-text account-form-feedback">{pageState.error}</p>
          ) : null}

          {pageState.notice ? (
            <p className="success-text account-form-feedback">{pageState.notice}</p>
          ) : null}

          <div className="account-billing-status-grid">
            <div className="account-billing-status-card">
              <span className="meta-text">Gym</span>
              <strong>{user?.gym_name || 'Unknown gym'}</strong>
            </div>
            <div className="account-billing-status-card">
              <span className="meta-text">Suspended</span>
              <strong>{user?.gym_is_platform_suspended ? 'Yes' : 'No'}</strong>
            </div>
            <div className="account-billing-status-card">
              <span className="meta-text">Suspended at</span>
              <strong>{formatDateLabel(user?.gym_platform_suspended_at)}</strong>
            </div>
          </div>

          {user?.gym_platform_suspension_reason ? (
            <p className="section-note">
              Suspension reason: {user.gym_platform_suspension_reason}
            </p>
          ) : (
            <p className="section-note">
              Contact Progressory support if you need help restoring access or confirming the next billing step.
            </p>
          )}

          <div className="inline-actions">
            <button
              type="button"
              className="secondary-button"
              disabled={pageState.loading}
              onClick={checkAccessAgain}
            >
              <AppIcon name="progress" />
              <span>{pageState.loading ? 'Checking access...' : 'Check access again'}</span>
            </button>
            <Link to="/account" className="secondary-button">
              <AppIcon name="account" />
              <span>Open account</span>
            </Link>
            {user?.role === 'owner' ? (
              <Link to="/billing" className="secondary-button">
                <AppIcon name="reports" />
                <span>Open billing</span>
              </Link>
            ) : null}
          </div>
        </section>
      </div>
    </Layout>
  );
}
