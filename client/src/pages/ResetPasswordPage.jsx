import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import AppIcon from '../components/AppIcon';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { login } = useAuth();
  const [reset, setReset] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReset = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/auth/reset-password/${token}`);
        setReset(response.data.reset);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load this reset link.');
      } finally {
        setLoading(false);
      }
    };

    loadReset();
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();

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
      const response = await api.post(`/auth/reset-password/${token}`, {
        password,
        confirmPassword
      });
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset this password right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-shell">
      <div className="auth-card auth-login-card">
        <div className="account-summary-heading">
          <span className="dashboard-card-icon"><AppIcon name="account" /></span>
          <div>
            <h2>Choose a new password</h2>
            <p className="section-note">
              {reset
                ? `Reset access for ${reset.first_name} ${reset.last_name} at ${reset.gym_name}.`
                : 'Open a valid Progressory reset link to choose a new password.'}
            </p>
          </div>
        </div>

        {loading ? <p className="empty-state">Checking reset link...</p> : null}
        {!loading && error ? <p className="error-text">{error}</p> : null}

        {!loading && reset ? (
          <form onSubmit={handleSubmit} className="form-grid">
            <div>
              <label>Email</label>
              <input type="email" value={reset.email || ''} readOnly />
            </div>

            <div>
              <label htmlFor="resetPassword">New Password</label>
              <input
                id="resetPassword"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="resetConfirmPassword">Confirm Password</label>
              <input
                id="resetConfirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="inline-actions auth-login-actions">
              <button type="submit" disabled={submitting}>
                {submitting ? 'Saving password...' : 'Save password and enter app'}
              </button>

              <Link to="/login" className="secondary-button">
                Back to login
              </Link>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
