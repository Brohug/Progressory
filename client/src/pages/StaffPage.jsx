import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

const initialFormState = {
  first_name: '',
  last_name: '',
  email: '',
  role: 'coach'
};

export default function StaffPage() {
  const collapsedStaffCount = 5;
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [expandedStaffDetails, setExpandedStaffDetails] = useState({});
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [inviteNotice, setInviteNotice] = useState(null);
  const [actionUserId, setActionUserId] = useState(null);
  const [showAllStaff, setShowAllStaff] = useState(false);
  const inviteSectionRef = useRef(null);

  const isOwner = user?.role === 'owner';

  const fetchUsers = async () => {
    const response = await api.get('/users');
    setUsers(response.data);
  };

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError('');
        await fetchUsers();
      } catch (err) {
        console.error('Load staff page error:', err);
        setError(err.response?.data?.message || 'Failed to load staff users');
      } finally {
        setLoading(false);
      }
    };

    if (isOwner) {
      loadPageData();
    } else {
      setLoading(false);
    }
  }, [isOwner]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCopyInvite = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setInviteNotice((prev) => prev ? { ...prev, copied: true } : prev);
      setSuccessMessage('Staff link copied to clipboard.');
      setError('');
    } catch {
      setError('Could not copy the setup link automatically. You can still copy it manually.');
    }
  };

  const createStaffInvite = async (payload) => {
    const response = await api.post('/users/staff-access', payload);
    setInviteNotice({
      ...response.data.invite,
      user: response.data.user,
      copied: false
    });
    window.setTimeout(() => {
      inviteSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    await fetchUsers();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');
    setInviteNotice(null);

    try {
      await createStaffInvite({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        role: formData.role
      });

      setFormData(initialFormState);
    } catch (err) {
      console.error('Create staff invite error:', err);
      setError(err.response?.data?.message || 'Failed to create staff setup link');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReset = async (staffUser) => {
    try {
      setActionUserId(staffUser.id);
      setError('');
      setSuccessMessage('');
      setInviteNotice(null);
      await createStaffInvite({
        user_id: staffUser.id,
        first_name: staffUser.first_name,
        last_name: staffUser.last_name,
        email: staffUser.email,
        role: staffUser.role
      });
    } catch (err) {
      console.error('Create staff reset invite error:', err);
      setError(err.response?.data?.message || 'Failed to create staff setup link');
    } finally {
      setActionUserId(null);
    }
  };

  const handleDeactivate = async (userId) => {
    const confirmed = window.confirm(
      'Deactivate this staff account? They will no longer be able to log in.'
    );

    if (!confirmed) return;

    try {
      setActionUserId(userId);
      setError('');
      setSuccessMessage('');
      await api.patch(`/users/${userId}/deactivate`);
      await fetchUsers();
      setSuccessMessage('Staff account deactivated successfully.');
    } catch (err) {
      console.error('Deactivate staff user error:', err);
      setError(err.response?.data?.message || 'Failed to deactivate staff user');
    } finally {
      setActionUserId(null);
    }
  };

  const handleActivate = async (userId) => {
    try {
      setActionUserId(userId);
      setError('');
      setSuccessMessage('');
      await api.patch(`/users/${userId}/activate`);
      await fetchUsers();
      setSuccessMessage('Staff account reactivated successfully.');
    } catch (err) {
      console.error('Activate staff user error:', err);
      setError(err.response?.data?.message || 'Failed to activate staff user');
    } finally {
      setActionUserId(null);
    }
  };

  const visibleUsers = showAllStaff ? users : users.slice(0, collapsedStaffCount);
  const hasHiddenStaff = users.length > collapsedStaffCount;
  const toggleStaffDetails = (userId) => {
    setExpandedStaffDetails((prev) => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  return (
    <Layout>
      <div className="staff-page">
        <h2 className="page-title">Staff</h2>
        <p className="page-intro">
          Manage staff access, send setup links, and keep owner, admin, and coach roles cleanly separated.
        </p>

        {!isOwner ? (
          <section className="page-section">
            <p className="error-text">Only the owner can manage staff accounts.</p>
          </section>
        ) : (
          <>
            <section className="page-section" style={{ maxWidth: '860px' }}>
            <h3>Create Staff Setup Link</h3>
            <p className="section-note">
              Add the staff member, pick the role, and generate a one-time setup link.
            </p>

            <form className="form-grid" onSubmit={handleSubmit}>
              <div>
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="coach">coach</option>
                  <option value="admin">admin</option>
                </select>
              </div>

              <div>
                <button type="submit" disabled={submitting}>
                  {submitting ? 'Creating link...' : 'Generate staff setup link'}
                </button>
              </div>
            </form>
            </section>

            {inviteNotice ? (
              <section ref={inviteSectionRef} className="page-section" style={{ maxWidth: '860px' }}>
                <h3>{inviteNotice.type === 'reset_password' ? 'Reset Link Ready' : 'Setup Link Ready'}</h3>
                <p className="success-text">
                  {inviteNotice.type === 'reset_password'
                    ? 'The reset link is ready below.'
                    : 'The setup link is ready below.'}
                </p>
                <div className="member-card-summary-row">
                  <span className="member-card-summary-pill">
                    {inviteNotice.user?.first_name} {inviteNotice.user?.last_name}
                  </span>
                  <span className="member-card-summary-pill">{inviteNotice.user?.role}</span>
                  <span className="member-card-summary-pill">
                    Expires {new Date(inviteNotice.expires_at).toLocaleDateString()}
                  </span>
                </div>
                <label>Staff access link</label>
                <input type="text" value={inviteNotice.url} readOnly />
                <div className="inline-actions" style={{ marginTop: '0.75rem' }}>
                  <button type="button" className="secondary-button" onClick={() => handleCopyInvite(inviteNotice.url)}>
                    {inviteNotice.copied ? 'Copied staff link' : 'Copy staff link'}
                  </button>
                </div>
              </section>
            ) : null}

            {successMessage && <p className="success-text">{successMessage}</p>}
            {error && <p className="error-text">{error}</p>}

            <section className="page-section">
              <h3>Staff Accounts</h3>
              <p className="section-note">
                Review active staff, prepare access links, and deactivate accounts when needed.
              </p>

              {loading ? (
                <p className="empty-state">Loading staff users...</p>
              ) : users.length === 0 ? (
                <p className="empty-state">No staff users found.</p>
              ) : (
                  <>
                    {hasHiddenStaff ? (
                      <div className="inline-actions staff-list-toggle-row" style={{ marginBottom: '0.75rem' }}>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => setShowAllStaff((prev) => !prev)}
                        >
                          {showAllStaff ? 'Hide extra staff' : `Show staff (${users.length})`}
                        </button>
                      </div>
                    ) : null}

                  <ul className="card-list">
                    {visibleUsers.map((staffUser) => (
                      <li key={staffUser.id} className="card-item compact-topic-card member-card">
                        <div className="compact-topic-header">
                          <div>
                            <strong>
                              {staffUser.first_name} {staffUser.last_name}
                            </strong>
                            <div className="compact-topic-meta meta-text">{staffUser.email}</div>
                          </div>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => toggleStaffDetails(staffUser.id)}
                          >
                            {expandedStaffDetails[staffUser.id] ? 'Hide details' : 'Open details'}
                          </button>
                        </div>

                        <div className="member-card-summary-row">
                          <span className="member-card-summary-pill">{staffUser.role}</span>
                          <span className="member-card-summary-pill">{staffUser.is_active ? 'Active' : 'Inactive'}</span>
                          <span className="member-card-summary-pill">
                            Added {new Date(staffUser.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {expandedStaffDetails[staffUser.id] ? (
                          <div className="detail-block">
                            <div className="meta-text">Email: {staffUser.email}</div>
                            <div className="meta-text">Role: {staffUser.role}</div>
                            <div className="meta-text">
                              Active: {staffUser.is_active ? 'Yes' : 'No'}
                            </div>
                            <div className="meta-text">
                              Created: {new Date(staffUser.created_at).toLocaleString()}
                            </div>
                          </div>
                        ) : null}

                        {staffUser.role !== 'owner' ? (
                          <div className="inline-actions">
                            <button
                              className="secondary-button"
                              onClick={() => handleSendReset(staffUser)}
                              disabled={actionUserId === staffUser.id}
                            >
                              {actionUserId === staffUser.id ? 'Preparing link...' : staffUser.is_active ? 'Prepare reset link' : 'Prepare setup link'}
                            </button>

                            {staffUser.is_active ? (
                              <button
                                className="danger-button"
                                onClick={() => handleDeactivate(staffUser.id)}
                                disabled={actionUserId === staffUser.id}
                              >
                                {actionUserId === staffUser.id ? 'Deactivating...' : 'Deactivate'}
                              </button>
                            ) : (
                              <button
                                className="secondary-button"
                                onClick={() => handleActivate(staffUser.id)}
                                disabled={actionUserId === staffUser.id}
                              >
                                {actionUserId === staffUser.id ? 'Reactivating...' : 'Reactivate'}
                              </button>
                            )}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            <section className="action-grid staff-role-grid" style={{ marginTop: '1.5rem' }}>
              <div className="action-card dashboard-action-card">
                <strong>Owner</strong>
                <div className="member-card-summary-row">
                  <span className="member-card-summary-pill">Full control</span>
                </div>
                <div className="detail-block">
                  <div className="meta-text">Full control over staff accounts, setup links, and gym management.</div>
                </div>
              </div>
              <div className="action-card dashboard-action-card">
                <strong>Admin</strong>
                <div className="member-card-summary-row">
                  <span className="member-card-summary-pill">Operations access</span>
                </div>
                <div className="detail-block">
                  <div className="meta-text">Best for trusted gym managers who need broad operational access.</div>
                </div>
              </div>
              <div className="action-card dashboard-action-card">
                <strong>Coach</strong>
                <div className="member-card-summary-row">
                  <span className="member-card-summary-pill">Coaching access</span>
                </div>
                <div className="detail-block">
                  <div className="meta-text">Best for planning, classes, reports, and progress without staff-management access.</div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
