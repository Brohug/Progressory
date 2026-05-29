import { Link } from 'react-router-dom';
import { policyLinks } from '../constants/policies';
import { useAuth } from '../hooks/useAuth';

export default function PolicyPageLayout({
  eyebrow,
  title,
  summary,
  children
}) {
  const { user } = useAuth();
  const appDestination = user ? '/dashboard' : '/login';
  const appDestinationLabel = user ? 'Back to app' : 'Login';

  return (
    <div className="policy-page-shell">
      <header className="policy-page-header">
        <div className="policy-page-brand">
          <div>
            <strong>Progressory</strong>
            <div className="meta-text">Policy and safety information</div>
          </div>
        </div>
        <div className="policy-page-actions">
          <Link to={appDestination} className="secondary-button">
            {appDestinationLabel}
          </Link>
          {!user ? (
            <Link to="/" className="secondary-button">
              Founder page
            </Link>
          ) : null}
        </div>
      </header>

      <main className="policy-page-main">
        <section className="page-section policy-page-card">
          <div className="policy-page-intro">
            <div>
              <span className="eyebrow">{eyebrow}</span>
              <h2>{title}</h2>
              <p className="section-note">{summary}</p>
            </div>
          </div>
          <div className="detail-block policy-page-content">
            {children}
          </div>
        </section>
      </main>

      <footer className="policy-page-footer">
        <div className="policy-page-footer-links">
          {policyLinks.map((link) => (
            <Link key={link.key} to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
