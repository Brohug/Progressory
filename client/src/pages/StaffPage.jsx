import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function StaffPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'coach'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isOwner = user?.role === 'owner';

  const fetchUsers = async () => {
    const response = await api.get('/users');
    setUsers(response.data);
  };

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

  useEffect(() => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      await api.post('/users', payload);

      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'coach'
      });

      await fetchUsers();
    } catch (err) {
      console.error('Create staff user error:', err);
      setError(err.response?.data?.message || 'Failed to create staff user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (userId) => {
    const confirmed = window.confirm(
      'Deactivate this staff account? They will no longer be able to log in.'
    );

    if (!confirmed) return;

    try {
      setError('');
      await api.patch(`/users/${userId}/deactivate`);
      await fetchUsers();
    } catch (err) {
      console.error('Deactivate staff user error:', err);
      setError(err.response?.data?.message || 'Failed to deactivate staff user');
    }
  };

  return (
    <Layout>
      <h2 className="page-title">Staff</h2>

      {!isOwner ? (
        <section className="page-section">
          <p className="error-text">Only the owner can manage staff accounts.</p>
        </section>
      ) : (
        <>
          <section className="page-section" style={{ maxWidth: '760px' }}>
            <h3>Create Staff Account</h3>

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
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
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
                  {submitting ? 'Creating...' : 'Create Staff Account'}
                </button>
              </div>
            </form>
          </section>

          {error && <p className="error-text">{error}</p>}

          <section className="page-section">
            <h3>Staff Accounts</h3>

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

                    {staffUser.role !== 'owner' && staffUser.is_active ? (
                      <div className="inline-actions">
                        <button
                          className="danger-button"
                          onClick={() => handleDeactivate(staffUser.id)}
                        >
                          Deactivate Staff Account
                        </button>
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