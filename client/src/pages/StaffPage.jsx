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
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [inviteNotice, setInviteNotice] = useState(null);
  const [actionUserId, setActionUserId] = useState(null);
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
      await api.patch(`/users/${userId}/deactivate`);
      await fetchUsers();
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
      await api.patch(`/users/${userId}/activate`);
      await fetchUsers();
    } catch (err) {
      console.error('Activate staff user error:', err);
      setError(err.response?.data?.message || 'Failed to activate staff user');
    } finally {
      setActionUserId(null);
    }
  };

  return (
    <Layout>
      <h2 className="page-title">Staff</h2>
      <p className="page-intro">
        Manage who can run the gym inside the app, send secure setup links, and keep owner, admin, and coach access clearly separated.
      </p>

      {!isOwner ? (
        <section className="page-section">
          <p className="error-text">Only the owner can manage staff accounts.</p>
        </section>
      ) : (
        <>
          <section className="action-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="action-card dashboard-action-card">
              <strong>Owner</strong>
              <div className="detail-block">
                <div className="meta-text">Full control over staff accounts, setup links, and the highest-level gym management decisions.</div>
              </div>
            </div>
            <div className="action-card dashboard-action-card">
              <strong>Admin</strong>
              <div className="detail-block">
                <div className="meta-text">Best for trusted gym managers who need broad operational access without outranking the owner.</div>
              </div>
            </div>
            <div className="action-card dashboard-action-card">
              <strong>Coach</strong>
              <div className="detail-block">
                <div className="meta-text">Best for day-to-day coaching workflows like planning, classes, reports, and progress without staff-management power.</div>
              </div>
            </div>
          </section>

          <section className="page-section" style={{ maxWidth: '860px' }}>
            <h3>Create Staff Setup Link</h3>
            <p className="section-note">
              Add the staff member, pick the role, and give them a one-time setup link so they
              can create their own password the first time they enter the app.
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
                  {submitting ? 'Creating link...' : 'Create Staff Setup Link'}
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
              <div className="detail-block">
                <div className="meta-text">
                  For: {inviteNotice.user?.first_name} {inviteNotice.user?.last_name} ({inviteNotice.user?.role})
                </div>
                <div className="meta-text">Expires: {new Date(inviteNotice.expires_at).toLocaleString()}</div>
              </div>
              <label>Staff access link</label>
              <input type="text" value={inviteNotice.url} readOnly />
              <div className="inline-actions" style={{ marginTop: '0.75rem' }}>
                <button type="button" onClick={() => handleCopyInvite(inviteNotice.url)}>
                  {inviteNotice.copied ? 'Copied' : 'Copy Link'}
                </button>
              </div>
            </section>
          ) : null}

          {error && <p className="error-text">{error}</p>}

          <section className="page-section">
            <h3>Staff Accounts</h3>
            <p className="section-note">
              Review active staff here, reset access when someone forgets their password, and deactivate accounts when someone should no longer be able to log in.
            </p>

            {loading ? (
              <p className="empty-state">Loading staff users...</p>
            ) : users.length === 0 ? (
              <p className="empty-state">No staff users found.</p>
            ) : (
              <ul className="card-list">
                {users.map((staffUser) => (
                  <li key={staffUser.id} className="card-item">
                    <strong>
                      {staffUser.first_name} {staffUser.last_name}
                    </strong>

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

                    {staffUser.role !== 'owner' ? (
                      <div className="inline-actions">
                        <button
                          onClick={() => handleSendReset(staffUser)}
                          disabled={actionUserId === staffUser.id}
                        >
                          {actionUserId === staffUser.id ? 'Preparing...' : staffUser.is_active ? 'Create Reset Link' : 'Create Setup Link'}
                        </button>

                        {staffUser.is_active ? (
                          <button
                            className="danger-button"
                            onClick={() => handleDeactivate(staffUser.id)}
                            disabled={actionUserId === staffUser.id}
                          >
                            Deactivate Staff Account
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(staffUser.id)}
                            disabled={actionUserId === staffUser.id}
                          >
                            Activate Staff Account
                          </button>
                        )}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </Layout>
  );
}
