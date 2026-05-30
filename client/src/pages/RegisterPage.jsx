import { Link } from 'react-router-dom';
import AppIcon from '../components/AppIcon';

export default function RegisterPage() {
  return (
    <div className="auth-page-shell">
      <div className="auth-card auth-login-card">
        <div className="account-summary-heading">
          <span className="dashboard-card-icon">
            <AppIcon name="account" />
          </span>
          <div>
            <h2>Owner access requires approval</h2>
            <p className="section-note">
              Progressory founder access is currently reviewed before an owner account is created.
            </p>
          </div>
        </div>

        <div className="auth-login-support">
          <strong>Need access first?</strong>
          <p className="meta-text">
            Request founder access from the founder page. Once approved, you will receive the correct setup path for your gym account.
          </p>
        </div>

        <div className="inline-actions auth-login-actions">
          <Link to="/" className="secondary-button">
            <AppIcon name="dashboard" />
            <span>Back to founder page</span>
          </Link>

          <Link to="/login" className="secondary-button">
            Log in instead
          </Link>
        </div>
      </div>
    </div>
  );
}