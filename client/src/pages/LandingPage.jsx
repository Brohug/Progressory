import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import AppIcon from '../components/AppIcon';

const demoRequestHref = 'mailto:owner.progressory@gmail.com?subject=Progressory%20Demo%20Request';
const founderAccessHref = 'mailto:owner.progressory@gmail.com?subject=Progressory%20Founder%20Access';

const whoItHelps = [
  {
    title: 'Gym owners',
    description: 'Keep curriculum, coach accounts, and student progress organized without relying on scattered notes or memory.'
  },
  {
    title: 'Coaches',
    description: 'Plan classes faster, log what happened, and give students a clearer system without carrying every detail in your head.'
  },
  {
    title: 'Kids programs',
    description: 'Create more consistency for instructors and parents when students need structure, progress visibility, and repeatable teaching tracks.'
  },
  {
    title: 'Growing academies',
    description: 'Add a cleaner curriculum and planning system before growth makes coaching communication and progress tracking harder to manage.'
  }
];

const founderPlanItems = [
  'First 5-10 gyms only',
  'Locked-in while subscribed',
  '30-day free trial',
  'Cancel anytime',
  'Personal onboarding included'
];

const onboardingItems = [
  'Set up first curriculum categories',
  'Import or build a starter structure',
  'Learn how to log a class',
  'Decide how to track student progress'
];

const featureItems = [
  'Curriculum index',
  'Class planning',
  'Student progress tracking',
  'Coach accounts',
  'Member/parent portal beta',
  'Decision-tree and scenario tools'
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-brand">
          <span className="dashboard-card-icon"><AppIcon name="dashboard" /></span>
          <div>
            <strong>Progressory</strong>
            <div className="meta-text">Built for BJJ gyms</div>
          </div>
        </div>
        <div className="landing-header-actions">
          <Link to="/login" className="secondary-button">
            <AppIcon name="account" />
            <span>Login</span>
          </Link>
        </div>
      </header>

      <main className="landing-shell">
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="eyebrow">Founder release</span>
            <h1>Curriculum and progress tracking built for BJJ gyms.</h1>
            <p className="landing-subheadline">
              Plan classes, organize curriculum, track student progress, and give coaches a clearer system.
            </p>

            <div className="landing-chip-row">
              {whoItHelps.map((item) => (
                <span key={item.title} className="member-card-summary-pill">
                  {item.title}
                </span>
              ))}
            </div>

            <div className="landing-cta-row">
              <a href={demoRequestHref} className="secondary-button">
                <AppIcon name="reports" />
                <span>Book a 20-minute demo</span>
              </a>
              <a href={founderAccessHref} className="secondary-button is-attention">
                <AppIcon name="account" />
                <span>Apply for founder access</span>
              </a>
            </div>
            <p className="landing-cta-note">
              Demos are 20 minutes. Founder access is $50/month for the first 5-10 gyms, Standard access is $99.99/month, both include a 30-day free trial, and founder access comes with personal onboarding.
            </p>
          </div>

          <aside className="landing-plan-card">
            <span className="eyebrow">Founder Plan</span>
            <div className="landing-plan-price">
              <strong>$50/month</strong>
              <span>for first 5-10 gyms</span>
            </div>
            <div className="landing-plan-list">
              {founderPlanItems.map((item) => (
                <div key={item} className="account-access-item">
                  <AppIcon name="progress" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="page-section landing-section">
          <div className="section-header">
            <div>
              <h3>Who it helps</h3>
              <p className="section-note">
                Built for gym owners and coaches who want a clearer teaching and progress system without extra software noise.
              </p>
            </div>
          </div>
          <div className="account-permissions-grid">
            {whoItHelps.map((item) => (
              <div key={item.title} className="summary-card account-summary-card">
                <div className="account-summary-heading">
                  <span className="dashboard-card-icon"><AppIcon name="members" /></span>
                  <div>
                    <strong>{item.title}</strong>
                    <div className="meta-text">{item.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="page-section landing-section">
          <div className="section-header">
            <div>
              <h3>What's included</h3>
              <p className="section-note">
                Enough structure to organize coaching, planning, and student tracking from one system.
              </p>
            </div>
          </div>
          <div className="account-permissions-grid">
            {featureItems.map((item) => (
              <div key={item} className="summary-card account-summary-card">
                <div className="account-summary-heading">
                  <span className="dashboard-card-icon"><AppIcon name="curriculum" /></span>
                  <div>
                    <strong>{item}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="page-section landing-section">
          <div className="section-header">
            <div>
              <h3>Decision Trees make problem-solving easier</h3>
              <p className="section-note">
                This is one of the strongest bonus layers in the app for gyms that want students to keep learning even when coaches are spread across a full room and cannot get to every student and every question during live class time.
              </p>
            </div>
          </div>
          <div className="account-permissions-grid">
            <div className="summary-card account-summary-card">
              <div className="account-summary-heading">
                <span className="dashboard-card-icon"><AppIcon name="trees" /></span>
                <div>
                  <strong>Problem-solving support</strong>
                  <div className="meta-text">
                    Members can work through common coaching problems and find clearer next steps without always competing for coach attention.
                  </div>
                </div>
              </div>
            </div>

            <div className="summary-card account-summary-card">
              <div className="account-summary-heading">
                <span className="dashboard-card-icon"><AppIcon name="progress" /></span>
                <div>
                  <strong>Build sequences in your game</strong>
                  <div className="meta-text">
                    Decision Trees help students connect techniques into usable sequences instead of collecting isolated moves they cannot organize yet.
                  </div>
                </div>
              </div>
            </div>

            <div className="summary-card account-summary-card">
              <div className="account-summary-heading">
                <span className="dashboard-card-icon"><AppIcon name="staff" /></span>
                <div>
                  <strong>Better coaching time</strong>
                  <div className="meta-text">
                    Coaches can still guide students well, while feeling less pressure to divide limited time across every question and every stage of development.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-section landing-section">
          <div className="section-header">
            <div>
              <h3>Personal onboarding included</h3>
              <p className="section-note">
                Early onboarding is part of the product so the first gyms get a working system, not just a login.
              </p>
            </div>
          </div>
          <div className="landing-onboarding-grid">
            {onboardingItems.map((item) => (
              <div key={item} className="account-access-item">
                <AppIcon name="progress" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="page-section landing-section landing-final-cta">
          <div className="section-header">
            <div>
              <h3>Start with the founder offer</h3>
              <p className="section-note">
                Keep the first offer low-friction, get early gyms onboarded personally, and grow the billing/product system from there.
              </p>
            </div>
          </div>
          <div className="landing-cta-row">
            <a href={demoRequestHref} className="secondary-button">
              <AppIcon name="reports" />
              <span>Book a 20-minute demo</span>
            </a>
            <a href={founderAccessHref} className="secondary-button is-attention">
              <AppIcon name="account" />
              <span>Apply for founder access</span>
            </a>
          </div>
          <p className="landing-cta-note">
            Founder access means paid access to the founder plan, not just a waitlist. Demos stay short and focused so gym owners can quickly see whether the system fits.
          </p>
        </section>
      </main>
    </div>
  );
}
