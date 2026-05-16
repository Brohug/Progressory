import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ExpandableSection from '../components/ExpandableSection';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import { useAuth } from '../hooks/useAuth';

const roleDescriptions = {
  owner: 'Owner access covers staff setup, gym controls, coaching workflows, and account-level decisions.',
  admin: 'Admin access covers day-to-day gym management without owner-only account controls.',
  coach: 'Coach access focuses on planning, logging classes, reviewing progress, and teaching tools.',
  member: 'Member access focuses on classes, progress, curriculum, library study, and decision trees.'
};

const roleLabels = {
  owner: 'Owner',
  admin: 'Admin',
  coach: 'Coach',
  member: 'Member'
};

const roleRestrictions = {
  owner: [
    'Owner-only billing controls will live here when payments launch.',
    'This is the highest access level in the app.'
  ],
  admin: [
    'Owner-only billing and account-level controls stay with the owner.',
    'Staff account ownership decisions still stay with the owner.'
  ],
  coach: [
    'Cannot manage staff accounts or billing settings.',
    'Cannot change member roster status or login access.'
  ],
  member: [
    'Cannot edit coaching data, staff settings, or billing.',
    'Study access stays read-only across the app.'
  ]
};

export default function MyAccountPage() {
  const { user, refreshUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    first_name: null,
    last_name: null,
    email: null
  });
  const [profileStatus, setProfileStatus] = useState({
    submitting: false,
    error: '',
    success: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState({
    submitting: false,
    error: '',
    success: ''
  });
  const [isProfileSectionOpen, setIsProfileSectionOpen] = useState(false);
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);

  const accessSummaryItems = useMemo(() => {
    if (user?.role === 'owner') {
      return [
        'Manage staff accounts',
        'Control member login access',
        'Edit programs and topics',
        'Plan and log classes',
        'Review reports and curriculum signals',
        'Manage library resources'
      ];
    }

    if (user?.role === 'admin') {
      return [
        'Manage member roster status',
        'Edit programs and topics',
        'Plan and log classes',
        'Review reports and curriculum signals',
        'Manage library resources'
      ];
    }

    if (user?.role === 'coach') {
      return [
        'Plan classes',
        'Log attendance and progress',
        'Use reports and scenarios',
        'View programs and curriculum',
        'Manage library teaching flow'
      ];
    }

    return [
      'View upcoming classes',
      'Review personal progress',
      'Study curriculum topics',
      'Open library resources',
      'Work through decision trees'
    ];
  }, [user?.role]);

  const rolePermissionItems = useMemo(() => {
    return roleRestrictions[user?.role] || [
      'Some account controls may depend on role setup.',
      'Ask your gym owner if you need broader access.'
    ];
  }, [user?.role]);

  const securityStatusItems = useMemo(() => {
    const lastUpdatedDate = user?.updated_at || user?.created_at;
    const formattedLastUpdated = lastUpdatedDate
      ? new Date(lastUpdatedDate).toLocaleDateString('en-US')
      : 'Not available';

    return [
      { label: 'Account status', value: 'Active' },
      { label: 'Login email', value: user?.email || 'No email on file' },
      {
        label: 'Last updated',
        value: formattedLastUpdated
      }
    ];
  }, [user?.created_at, user?.email, user?.updated_at]);

  const accountActivityItems = useMemo(() => {
    const formatDate = (value) => (
      value ? new Date(value).toLocaleDateString('en-US') : 'Not available'
    );

    return [
      { label: 'Joined', value: formatDate(user?.created_at) },
      { label: 'Last updated', value: formatDate(user?.updated_at || user?.created_at) }
    ];
  }, [user?.created_at, user?.updated_at]);

  const handlePasswordFieldChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileFieldChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    setProfileStatus({
      submitting: true,
      error: '',
      success: ''
    });

    try {
      const response = await api.patch('/auth/profile', {
        first_name: profileForm.first_name ?? user?.first_name ?? '',
        last_name: profileForm.last_name ?? user?.last_name ?? '',
        email: profileForm.email ?? user?.email ?? ''
      });
      await refreshUser();
      setProfileForm({
        first_name: null,
        last_name: null,
        email: null
      });
      setProfileStatus({
        submitting: false,
        error: '',
        success: response.data?.message || 'Profile updated successfully'
      });
    } catch (error) {
      setProfileStatus({
        submitting: false,
        error: error.response?.data?.message || 'Could not update profile right now.',
        success: ''
      });
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setStatus({
      submitting: true,
      error: '',
      success: ''
    });

    try {
      const response = await api.post('/auth/change-password', passwordForm);
      await refreshUser();
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setStatus({
        submitting: false,
        error: '',
        success: response.data?.message || 'Password changed successfully'
      });
    } catch (error) {
      setStatus({
        submitting: false,
        error: error.response?.data?.message || 'Could not change password right now.',
        success: ''
      });
    }
  };

  return (
    <Layout>
      <div className="account-page">
        <h2 className="page-title">My Account</h2>
        <p className="page-intro">
          Review your role, gym access, and password settings in one place.
        </p>

        <section className="page-section account-overview-section">
          <div className="section-header">
            <div>
              <h3>Account overview</h3>
              <p className="section-note">This is your current app identity and access level.</p>
            </div>
          </div>
          <div className="account-overview-grid">
            <div className="summary-card account-summary-card">
              <div className="account-summary-heading">
                <span className="dashboard-card-icon"><AppIcon name="account" /></span>
                <div>
                  <strong>{user?.first_name} {user?.last_name}</strong>
                  <div className="meta-text">{user?.email}</div>
                  <div className="account-inline-meta">
                    <span className="member-card-summary-pill">
                      {roleLabels[user?.role] || 'Unknown role'}
                    </span>
                    <span className="member-card-summary-pill">{user?.gym_name || 'No gym'}</span>
                  </div>
                  <div className="meta-text">
                    {roleDescriptions[user?.role] || 'Your access details are available here.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="summary-card account-summary-card">
              <div className="account-summary-heading">
                <span className="dashboard-card-icon"><AppIcon name="progress" /></span>
                <div>
                  <strong>Access summary</strong>
                  <div className="meta-text">What this account can do in Progressory.</div>
                </div>
              </div>
              <div className="detail-block">
                <div className="meta-text account-access-kicker">
                  Access level: {roleLabels[user?.role] || 'Unknown role'}
                </div>
                <div className="account-access-list">
                  {accessSummaryItems.map((item) => (
                    <div key={item} className="account-access-item">
                      <AppIcon name="progress" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="account-security-status">
                <strong>Security status</strong>
                <div className="account-security-status-list">
                  {securityStatusItems.map((item) => (
                    <div key={item.label} className="account-status-row">
                      <span className="meta-text">{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-section account-permissions-section">
          <div className="section-header">
            <div>
              <h3>Role permissions</h3>
              <p className="section-note">
                A quick reminder of where this account has room to work and where higher access is still required.
              </p>
            </div>
          </div>

          <div className="account-permissions-grid">
            <div className="summary-card account-summary-card">
              <div className="account-summary-heading">
                <span className="dashboard-card-icon"><AppIcon name="progress" /></span>
                <div>
                  <strong>This account can</strong>
                  <div className="meta-text">Everyday actions available at your current access level.</div>
                </div>
              </div>
              <div className="account-access-list">
                {accessSummaryItems.map((item) => (
                  <div key={`permission-${item}`} className="account-access-item">
                    <AppIcon name="progress" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {user?.role !== 'owner' ? (
              <div className="summary-card account-summary-card">
                <div className="account-summary-heading">
                  <span className="dashboard-card-icon"><AppIcon name="account" /></span>
                  <div>
                    <strong>Still needs higher access</strong>
                    <div className="meta-text">Helpful boundaries to keep in mind for this role.</div>
                  </div>
                </div>
                <div className="account-access-list">
                  {rolePermissionItems.map((item) => (
                    <div key={`restriction-${item}`} className="account-access-item is-muted">
                      <AppIcon name="account" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {user?.role === 'owner' ? (
          <section className="page-section account-billing-section">
            <div className="section-header">
              <div>
                <h3>Billing</h3>
                <p className="section-note">
                  Billing is not live yet, but this is where owner-only subscription controls will land.
                </p>
              </div>
            </div>

            <div className="account-billing-card">
              <div className="account-summary-heading">
                <span className="dashboard-card-icon"><AppIcon name="reports" /></span>
                <div>
                  <strong>Billing workspace</strong>
                  <div className="meta-text">
                    This owner-only area is where subscription status, plan changes, and payment settings will live.
                  </div>
                </div>
              </div>

              <div className="account-inline-meta">
                <span className="member-card-summary-pill">Owner only</span>
                <span className="member-card-summary-pill">Coming soon</span>
              </div>

              <div className="account-billing-status-grid">
                <div className="account-billing-status-card">
                  <span className="meta-text">Current plan</span>
                  <strong>Demo environment</strong>
                </div>
                <div className="account-billing-status-card">
                  <span className="meta-text">Billing status</span>
                  <strong>Not live yet</strong>
                </div>
                <div className="account-billing-status-card">
                  <span className="meta-text">Payments</span>
                  <strong>Coming soon</strong>
                </div>
              </div>

              <div className="account-billing-list">
                <div className="account-access-item">
                  <AppIcon name="progress" />
                  <span>Review active subscription details here once billing launches.</span>
                </div>
                <div className="account-access-item">
                  <AppIcon name="progress" />
                  <span>Manage plan upgrades, renewals, and future payment settings from one place.</span>
                </div>
              </div>

              <div className="inline-actions">
                <Link to="/billing" className="secondary-button">
                  <AppIcon name="reports" />
                  <span>Open Billing</span>
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <section className="page-section account-activity-section">
          <div className="section-header">
            <div>
              <h3>Account activity</h3>
              <p className="section-note">
                A small record of when this account was created and last updated in the app.
              </p>
            </div>
          </div>

          <div className="account-billing-status-grid">
            {accountActivityItems.map((item) => (
              <div key={item.label} className="account-billing-status-card">
                <span className="meta-text">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <ExpandableSection
          title="Profile details"
          note="Open this when you want to update your name or login email."
          summary="Edit profile?"
          isOpen={isProfileSectionOpen}
          onToggle={setIsProfileSectionOpen}
          className="account-profile-section"
        >
          <form className="form-grid account-password-form" onSubmit={handleUpdateProfile}>
            <div>
              <label htmlFor="profileFirstName">First name</label>
              <input
                id="profileFirstName"
                type="text"
                name="first_name"
                value={profileForm.first_name ?? user?.first_name ?? ''}
                onChange={handleProfileFieldChange}
                autoComplete="given-name"
              />
            </div>

            <div>
              <label htmlFor="profileLastName">Last name</label>
              <input
                id="profileLastName"
                type="text"
                name="last_name"
                value={profileForm.last_name ?? user?.last_name ?? ''}
                onChange={handleProfileFieldChange}
                autoComplete="family-name"
              />
            </div>

            <div>
              <label htmlFor="profileEmail">Email</label>
              <input
                id="profileEmail"
                type="email"
                name="email"
                value={profileForm.email ?? user?.email ?? ''}
                onChange={handleProfileFieldChange}
                autoComplete="email"
              />
            </div>

            {profileStatus.error ? (
              <p className="error-text account-form-feedback">{profileStatus.error}</p>
            ) : null}
            {profileStatus.success ? (
              <p className="success-text account-form-feedback">{profileStatus.success}</p>
            ) : null}

            <div className="inline-actions">
              <button type="submit" className="secondary-button" disabled={profileStatus.submitting}>
                <AppIcon name="account" />
                <span>{profileStatus.submitting ? 'Saving...' : 'Save profile'}</span>
              </button>
            </div>
          </form>
        </ExpandableSection>

        <ExpandableSection
          title="Security"
          note="Open this when you want to rotate your password."
          summary="Change password?"
          isOpen={isPasswordSectionOpen}
          onToggle={setIsPasswordSectionOpen}
          className="account-security-section"
        >
          <form className="form-grid account-password-form" onSubmit={handleChangePassword}>
            <div>
              <label htmlFor="currentPassword">Current password</label>
              <input
                id="currentPassword"
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordFieldChange}
                autoComplete="current-password"
              />
            </div>

            <div>
              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordFieldChange}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword">Confirm new password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordFieldChange}
                autoComplete="new-password"
              />
            </div>

            {status.error ? (
              <p className="error-text account-form-feedback">{status.error}</p>
            ) : null}
            {status.success ? (
              <p className="success-text account-form-feedback">{status.success}</p>
            ) : null}

            <div className="inline-actions">
              <button type="submit" className="secondary-button" disabled={status.submitting}>
                <AppIcon name="account" />
                <span>{status.submitting ? 'Saving...' : 'Save new password'}</span>
              </button>
            </div>
          </form>
        </ExpandableSection>
      </div>
    </Layout>
  );
}
