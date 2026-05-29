import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import {
  policyAcknowledgementText,
  policyLinks,
  policyUseText
} from '../constants/policies';

const initialFormState = {
  gym_name: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirmPassword: '',
  policyAgreementAccepted: false,
  founderUseAcknowledged: false
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.policyAgreementAccepted || !formData.founderUseAcknowledged) {
      setError('You must accept the policies and confirm the allowed platform use.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const response = await api.post('/auth/register', {
        gym_name: formData.gym_name,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        policyAgreementAccepted: formData.policyAgreementAccepted,
        founderUseAcknowledged: formData.founderUseAcknowledged
      });
      login(response.data.token, response.data.user);
      navigate('/billing');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-shell">
      <div className="auth-card">
        <h2>Create owner account</h2>
        <p className="section-note">
          For direct owner signup, complete the details below. Most gyms will still start with a demo or founder-access conversation first.
        </p>

        <form onSubmit={handleSubmit} className="form-grid">
          <div>
            <label htmlFor="registerGymName">Gym name</label>
            <input id="registerGymName" name="gym_name" value={formData.gym_name} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="registerFirstName">First name</label>
            <input id="registerFirstName" name="first_name" value={formData.first_name} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="registerLastName">Last name</label>
            <input id="registerLastName" name="last_name" value={formData.last_name} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="registerEmail">Email</label>
            <input id="registerEmail" type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="registerPassword">Password</label>
            <input id="registerPassword" type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="registerConfirmPassword">Confirm password</label>
            <input id="registerConfirmPassword" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          <div className="policy-agreement-card">
            <strong>Before continuing</strong>
            <p className="meta-text">
              Review the current policies before creating a gym account.
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
                name="policyAgreementAccepted"
                checked={formData.policyAgreementAccepted}
                onChange={handleChange}
                required
              />
              <span>{policyAcknowledgementText}</span>
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                name="founderUseAcknowledged"
                checked={formData.founderUseAcknowledged}
                onChange={handleChange}
                required
              />
              <span>{policyUseText}</span>
            </label>
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          <div className="inline-actions auth-login-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create owner account'}
            </button>
            <Link to="/login" className="secondary-button">
              Log in instead
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
