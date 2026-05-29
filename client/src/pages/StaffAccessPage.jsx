import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import {
  policyAcknowledgementText,
  policyLinks,
  policyUseText
} from '../constants/policies';

export default function StaffAccessPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { login } = useAuth();
  const [invite, setInvite] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [policyAgreementAccepted, setPolicyAgreementAccepted] = useState(false);
  const [founderUseAcknowledged, setFounderUseAcknowledged] = useState(false);
  const requiresPolicyAcceptance = invite?.role === 'owner' || invite?.role === 'admin';

  useEffect(() => {
    const loadInvite = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/auth/staff-access/${token}`);
        setInvite(response.data.invite);
      } catch (err) {
        console.error('Load staff access invite error:', err);
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

    if (requiresPolicyAcceptance && (!policyAgreementAccepted || !founderUseAcknowledged)) {
      setError('You must accept the policies before finishing account setup.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const response = await api.post(`/auth/staff-access/${token}`, {
        password,
        policyAgreementAccepted,
        founderUseAcknowledged
      });
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Set staff access password error:', err);
      setError(err.response?.data?.message || 'Could not finish staff setup right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-shell">
      <div className="auth-card">
        <h2>{invite?.type === 'reset_password' ? 'Reset Staff Password' : 'Set Up Staff Access'}</h2>
        <p className="section-note">
          {invite
            ? `Finish ${invite.role} access for ${invite.first_name} ${invite.last_name} at ${invite.gym_name}.`
            : 'Open your staff setup link to create your password and enter the app.'}
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

            {requiresPolicyAcceptance ? (
              <div className="policy-agreement-card" style={{ gridColumn: '1 / -1' }}>
                <strong>Before entering the app</strong>
                <p className="meta-text">
                  Owner and admin accounts must accept the current Progressory policies before setup is complete.
                </p>
                <div className="policy-link-row">
                  {policyLinks.map((link) => (
                    <Link key={link.key} to={link.to} target="_blank" rel="noreferrer">
                      {link.label}
                    </Link>
                  ))}
                </div>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={policyAgreementAccepted}
                    onChange={(e) => setPolicyAgreementAccepted(e.target.checked)}
                    required
                  />
                  <span>{policyAcknowledgementText}</span>
                </label>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={founderUseAcknowledged}
                    onChange={(e) => setFounderUseAcknowledged(e.target.checked)}
                    required
                  />
                  <span>{policyUseText}</span>
                </label>
              </div>
            ) : null}

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
