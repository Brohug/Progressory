import { Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../api/axios';
import AppIcon from '../components/AppIcon';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    setResetLink('');

    try {
      const response = await api.post('/auth/forgot-password', {
        email: email.trim()
      });

      setMessage(response.data?.message || 'If that email is registered, a reset link has been sent.');
      setResetLink(response.data?.reset_link || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not request a reset link right now.');
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
            <h2>Reset your password</h2>
            <p className="section-note">
              Enter the email tied to your Progressory account. If it exists, we will send a secure reset link.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div>
            <label htmlFor="forgotPasswordEmail">Email</label>
            <input
              id="forgotPasswordEmail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              inputMode="email"
              required
            />
          </div>

          {message ? <p className="success-text">{message}</p> : null}
          {error ? <p className="error-text">{error}</p> : null}

          {resetLink ? (
            <div className="auth-login-support">
              <strong>Local testing link</strong>
              <p className="meta-text">
                Email delivery is not required in local development. Open this reset link to finish QA.
              </p>
              <a href={resetLink} className="secondary-button">
                Open reset link
              </a>
            </div>
          ) : null}

          <div className="inline-actions auth-login-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? 'Sending link...' : 'Send reset link'}
            </button>

            <Link to="/login" className="secondary-button">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
