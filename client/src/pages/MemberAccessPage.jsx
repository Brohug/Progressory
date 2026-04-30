import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

export default function MemberAccessPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { login } = useAuth();
  const [invite, setInvite] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInvite = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/auth/member-access/${token}`);
        setInvite(response.data.invite);
      } catch (err) {
        console.error('Load member access invite error:', err);
        setError(err.response?.data?.message || 'Could not load this setup link.');
      } finally {
        setLoading(false);
      }
    };

    loadInvite();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const response = await api.post(`/auth/member-access/${token}`, { password });
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Set member access password error:', err);
      setError(err.response?.data?.message || 'Could not finish account setup right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-shell">
      <div className="auth-card">
        <h2>{invite?.type === 'reset_password' ? 'Reset Member Password' : 'Set Up Member Access'}</h2>
        <p className="section-note">
          {invite
            ? `Finish access for ${invite.first_name} ${invite.last_name} at ${invite.gym_name}.`
            : 'Open your member setup link to finish password access.'}
        </p>

        {loading ? <p className="empty-state">Loading link details...</p> : null}
        {!loading && error ? <p className="error-text">{error}</p> : null}

        {!loading && invite ? (
          <form onSubmit={handleSubmit} className="form-grid">
            <div>
              <label>Email</label>
              <input type="email" value={invite.email || ''} readOnly />
            </div>

            <div>
              <label>New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="inline-actions">
              <button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Password and Enter App'}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
