import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import AppIcon from '../components/AppIcon';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email:'',
    password: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const memberAccessToken = searchParams.get('memberAccessToken');
    const staffAccessToken = searchParams.get('staffAccessToken');

    if (memberAccessToken) {
      navigate(`/member-access/${memberAccessToken}`, { replace: true });
      return;
    }

    if (staffAccessToken) {
      navigate(`/staff-access/${staffAccessToken}`, { replace: true });
    }
  }, [navigate, searchParams]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        ...formData,
        email: formData.email.trim()
      });
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
            <h2>Welcome back</h2>
            <p className="section-note">
              Log in to open your gym dashboard, classes, curriculum, and progress tools.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div>
            <label htmlFor="loginEmail">Email</label>
            <input
              id="loginEmail"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              inputMode="email"
            />
          </div>

          <div>
            <label htmlFor="loginPassword">Password</label>
            <input
              id="loginPassword"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              type="button"
              className="text-button"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? 'Hide password' : 'Show password'}
            </button>
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          <div className="inline-actions auth-login-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? 'Logging in...' : 'Log in'}
            </button>
            
            <Link to="/" className="secondary-button">
              <AppIcon name="dashboard" />
              <span>Back to founder page</span>
            </Link>
          </div>
        </form>

        <div className="auth-login-support">
          <strong>Need access first?</strong>
          <p className="meta-text">
            Use your staff or member setup link if your gym sent you one, or return to the founder page if you are exploring Progressory for your academy.
          </p>
        </div>
      </div>
    </div>
  );
}
