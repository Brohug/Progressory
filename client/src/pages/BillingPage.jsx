import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';

export default function BillingPage() {
  return (
    <Layout>
      <div className="billing-page">
        <h2 className="page-title">Billing</h2>
        <p className="page-intro">
          This owner-only workspace will hold billing, subscription, and payment controls once billing goes live.
        </p>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>Billing overview</h3>
              <p className="section-note">
                For now, this page frames where owner-only billing controls will live without mixing unfinished payment setup into the rest of the app.
              </p>
            </div>
          </div>

          <div className="account-billing-status-grid">
            <div className="account-billing-status-card">
              <span className="meta-text">Current plan</span>
              <strong>Demo environment</strong>
            </div>
            <div className="account-billing-status-card">
              <span className="meta-text">Billing status</span>
              <strong>Not live yet</strong>
            </div>
            <div className="account-billing-status-card">
              <span className="meta-text">Payments</span>
              <strong>Coming soon</strong>
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>What will live here</h3>
              <p className="section-note">
                These are the owner-only billing controls we can grow into next without confusing coaches or members.
              </p>
            </div>
          </div>

          <div className="account-permissions-grid">
            <div className="summary-card account-summary-card">
              <div className="account-summary-heading">
                <span className="dashboard-card-icon"><AppIcon name="reports" /></span>
                <div>
                  <strong>Subscription controls</strong>
                  <div className="meta-text">Manage the active plan once billing launches.</div>
                </div>
              </div>
              <div className="account-access-list">
                <div className="account-access-item">
                  <AppIcon name="progress" />
                  <span>View current plan details and renewal timing.</span>
                </div>
                <div className="account-access-item">
                  <AppIcon name="progress" />
                  <span>Upgrade or change plans from one owner-only page.</span>
                </div>
              </div>
            </div>

            <div className="summary-card account-summary-card">
              <div className="account-summary-heading">
                <span className="dashboard-card-icon"><AppIcon name="account" /></span>
                <div>
                  <strong>Payment settings</strong>
                  <div className="meta-text">Future billing records and payment tools will land here.</div>
                </div>
              </div>
              <div className="account-access-list">
                <div className="account-access-item is-muted">
                  <AppIcon name="account" />
                  <span>Update payment details when live billing is ready.</span>
                </div>
                <div className="account-access-item is-muted">
                  <AppIcon name="account" />
                  <span>Review invoices, receipts, and payment history in one place.</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
