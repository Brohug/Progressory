import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/axios';
import AppIcon from '../components/AppIcon';
import { FOUNDER_CONTACT_LINK_LABEL, POLICY_SUPPORT_EMAIL, policyLinks } from '../constants/policies';

const emptyRequestForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  gym_name: ''
};

const ctaActions = [
  {
    key: 'demo',
    requestType: 'demo',
    className: 'secondary-button',
    icon: 'reports',
    label: 'Book a 20-minute demo'
  },
  {
    key: 'founder',
    requestType: 'founder',
    className: 'secondary-button is-attention',
    icon: 'account',
    label: 'Request Founder Access'
  }
];

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
  '30-day trial/onboarding period',
  'Locked-in founder rate while subscribed',
  'Up to 5 coaches',
  'Up to 200 active members'
];

const standardPlanItems = [
  'Standard plan after founder spots are filled',
  'Up to 5 coaches',
  'Up to 200 active members',
  'Same core Progressory workflow',
  'Built for the production rollout after founder pricing closes'
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
  const submitActionsRef = useRef(null);
  const [requestState, setRequestState] = useState({
    open: false,
    requestType: 'demo',
    form: { ...emptyRequestForm },
    slots: [],
    timezone: '',
    selectedSlot: '',
    loadingSlots: false,
    submitting: false,
    error: '',
    success: ''
  });

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

  const groupedDemoSlots = useMemo(() => {
    const groups = new Map();

    requestState.slots.forEach((slot) => {
      if (!groups.has(slot.date_label)) {
        groups.set(slot.date_label, {
          dateLabel: slot.date_label,
          timezone: slot.timezone,
          slots: []
        });
      }

      groups.get(slot.date_label).slots.push(slot);
    });

    return Array.from(groups.values());
  }, [requestState.slots]);

  const openRequestModal = async (requestType) => {
    setRequestState({
      open: true,
      requestType,
      form: { ...emptyRequestForm },
      slots: [],
      timezone: '',
      selectedSlot: '',
      loadingSlots: requestType === 'demo',
      submitting: false,
      error: '',
      success: ''
    });

    if (requestType !== 'demo') {
      return;
    }

    try {
      const response = await api.get('/public-inquiries/demo-slots');
      setRequestState((current) => ({
        ...current,
        slots: response.data?.slots || [],
        timezone: response.data?.timezone || '',
        loadingSlots: false
      }));
    } catch (error) {
      setRequestState((current) => ({
        ...current,
        loadingSlots: false,
        error: error.response?.data?.message || 'Could not load demo times right now. Please try again.'
      }));
    }
  };

  const closeRequestModal = () => {
    setRequestState({
      open: false,
      requestType: 'demo',
      form: { ...emptyRequestForm },
      slots: [],
      timezone: '',
      selectedSlot: '',
      loadingSlots: false,
      submitting: false,
      error: '',
      success: ''
    });
  };

  const handleRequestFieldChange = (event) => {
    const { name, value } = event.target;
    setRequestState((current) => ({
      ...current,
      form: {
        ...current.form,
        [name]: value
      }
    }));
  };

  const handleDemoSlotSelect = (slotStart) => {
    setRequestState((current) => ({
      ...current,
      selectedSlot: slotStart,
      error: ''
    }));

    window.setTimeout(() => {
      submitActionsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 80);
  };

  const handleRequestSubmit = async (event) => {
    event.preventDefault();

    if (requestState.requestType === 'demo' && !requestState.selectedSlot) {
      setRequestState((current) => ({
        ...current,
        error: 'Choose one of the available demo times before submitting.'
      }));
      return;
    }

    setRequestState((current) => ({
      ...current,
      submitting: true,
      error: ''
    }));

    try {
      await api.post('/public-inquiries', {
        request_type: requestState.requestType,
        ...requestState.form,
        demo_slot_start: requestState.requestType === 'demo' ? requestState.selectedSlot : undefined
      });

      setRequestState((current) => ({
        ...current,
        submitting: false,
        success: current.requestType === 'demo'
          ? 'Thank you, you will get a confirmation email after it is approved.'
          : 'Thank you, I will reach out soon with the information you gave.',
        error: ''
      }));
    } catch (error) {
      setRequestState((current) => ({
        ...current,
        submitting: false,
        error: error.response?.data?.message || 'Failed to submit your request. Please try again.'
      }));
    }
  };

  return (
    <>
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
            <span className="eyebrow">June 1 launch</span>
            <h1>Track more than attendance.</h1>
            <p className="landing-subheadline">
              Progressory helps martial arts gyms connect curriculum, class planning, attendance context, student progress, coach-created review content, and guided technique pathways in one place.
            </p>

            <div className="landing-chip-row">
              {whoItHelps.map((item) => (
                <span key={item.title} className="member-card-summary-pill">
                  {item.title}
                </span>
              ))}
            </div>

            <div className="landing-cta-row">
              <Link to="/register" className="secondary-button is-attention">
                <AppIcon name="account" />
                <span>Start Founder Plan</span>
              </Link>
              {ctaActions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  className={action.className}
                  aria-label={action.label}
                  onClick={() => openRequestModal(action.requestType)}
                >
                  <AppIcon name={action.icon} />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
            <p className="landing-cta-note">
              Demos are 20 minutes. Founder access is $49.99/month for the first 5-10 gyms and includes a 30-day trial/onboarding period. Standard access is $99.99/month.
            </p>
            <p className="landing-cta-note">
              Prefer email? <a className="library-resource-link" href={`mailto:${POLICY_SUPPORT_EMAIL}`}>{FOUNDER_CONTACT_LINK_LABEL}</a> with your name, gym, and what you want help with.
            </p>
          </div>

          <aside className="landing-plan-card">
            <span className="eyebrow">Founder Plan</span>
            <div className="landing-plan-price">
              <strong>$49.99/month</strong>
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
              <h3>Founder launch pricing</h3>
              <p className="section-note">
                Built first with Treasure Valley gyms and early gym feedback. Founder pricing is meant for the earliest gyms helping shape the product in the field.
              </p>
            </div>
          </div>
          <div className="account-permissions-grid">
            <div className="summary-card account-summary-card">
              <div className="account-summary-heading">
                <span className="dashboard-card-icon"><AppIcon name="reports" /></span>
                <div>
                  <strong>Founder Plan - $49.99/month</strong>
                  <div className="meta-text">First 5-10 gyms only</div>
                </div>
              </div>
              <div className="account-access-list">
                {founderPlanItems.map((item) => (
                  <div key={item} className="account-access-item">
                    <AppIcon name="progress" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="summary-card account-summary-card">
              <div className="account-summary-heading">
                <span className="dashboard-card-icon"><AppIcon name="curriculum" /></span>
                <div>
                  <strong>Standard Plan - $99.99/month</strong>
                  <div className="meta-text">Standard plan after founder spots are filled</div>
                </div>
              </div>
              <div className="account-access-list">
                {standardPlanItems.map((item) => (
                  <div key={item} className="account-access-item">
                    <AppIcon name="progress" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="detail-block" style={{ marginTop: '1rem' }}>
            <p className="landing-cta-note" style={{ marginBottom: 0 }}>
              Most gym software handles attendance, billing, and member management. Progressory focuses on the learning side of training - what was taught, what students covered, what they missed, and what they can review next.
            </p>
            <p className="landing-cta-note" style={{ marginBottom: 0 }}>
              During the founder beta, the gym library supports coach-created review content and external video links. Direct video upload limits may apply while storage and streaming are finalized.
            </p>
          </div>
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
              <h3>What&apos;s included</h3>
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
            {ctaActions.map((action) => (
              <button
                key={action.key}
                type="button"
                className={action.className}
                aria-label={action.label}
                onClick={() => openRequestModal(action.requestType)}
              >
                <AppIcon name={action.icon} />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
          <p className="landing-cta-note">
            Founder access means paid access to the founder plan, not just a waitlist. Demos stay short and focused so gym owners can quickly see whether the system fits.
          </p>
          <p className="landing-cta-note">
            Prefer email? <a className="library-resource-link" href={`mailto:${POLICY_SUPPORT_EMAIL}`}>{FOUNDER_CONTACT_LINK_LABEL}</a> with your name, gym, and what you want help with.
          </p>
        </section>
      </main>

      {requestState.open ? (
        <div
          className="landing-request-overlay"
          role="presentation"
          onClick={closeRequestModal}
        >
          <div
            className="landing-request-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="landingRequestTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="landing-request-header">
              <div>
                <span className="eyebrow">{requestState.requestType === 'demo' ? 'Book Demo' : 'Founder Access'}</span>
                <h3 id="landingRequestTitle">
                  {requestState.requestType === 'demo'
                    ? 'Book a 20-minute demo'
                    : 'Apply for founder access'}
                </h3>
                <p className="section-note">
                  {requestState.success
                    ? requestState.requestType === 'demo'
                      ? 'Your demo request was submitted.'
                      : 'Your founder access request was submitted.'
                    : requestState.requestType === 'demo'
                      ? 'Choose an open time, then share the basics so I can confirm the demo.'
                      : 'Share your contact details and gym so I can email you back about founder access.'}
                </p>
              </div>
              <button
                type="button"
                className="secondary-button landing-request-close"
                onClick={closeRequestModal}
              >
                Close
              </button>
            </div>

            {requestState.success ? (
              <div className="landing-request-success">
                <p className="success-text account-form-feedback">{requestState.success}</p>
                <div className="inline-actions">
                  <button type="button" className="secondary-button" onClick={closeRequestModal}>
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form className="form-grid landing-request-form" onSubmit={handleRequestSubmit}>
                <div className="form-grid landing-request-grid">
                  <div>
                    <label htmlFor="landingFirstName">First name</label>
                    <input
                      id="landingFirstName"
                      name="first_name"
                      value={requestState.form.first_name}
                      onChange={handleRequestFieldChange}
                      autoComplete="given-name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="landingLastName">Last name</label>
                    <input
                      id="landingLastName"
                      name="last_name"
                      value={requestState.form.last_name}
                      onChange={handleRequestFieldChange}
                      autoComplete="family-name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="landingEmail">Email</label>
                    <input
                      id="landingEmail"
                      type="email"
                      name="email"
                      value={requestState.form.email}
                      onChange={handleRequestFieldChange}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="landingPhone">Phone number</label>
                    <input
                      id="landingPhone"
                      type="tel"
                      name="phone"
                      value={requestState.form.phone}
                      onChange={handleRequestFieldChange}
                      autoComplete="tel"
                      required
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="landingGym">Gym</label>
                    <input
                      id="landingGym"
                      name="gym_name"
                      value={requestState.form.gym_name}
                      onChange={handleRequestFieldChange}
                      autoComplete="organization"
                      required
                    />
                  </div>
                </div>

                {requestState.requestType === 'demo' ? (
                  <div className="landing-request-slots">
                    <div>
                      <strong>Available demo times</strong>
                      <div className="meta-text">
                        {requestState.timezone
                          ? `These times are shown from the current booking schedule in ${requestState.timezone}.`
                          : 'Choose an open time before submitting your request.'}
                      </div>
                    </div>

                    {requestState.loadingSlots ? (
                      <p className="meta-text">Loading available demo times...</p>
                    ) : groupedDemoSlots.length > 0 ? (
                      <div className="landing-request-slot-groups">
                        {groupedDemoSlots.map((group) => (
                          <div key={group.dateLabel} className="landing-request-slot-group">
                            <strong>{group.dateLabel}</strong>
                            <div className="landing-request-slot-row">
                              {group.slots.map((slot) => (
                                <button
                                  key={slot.starts_at}
                                  type="button"
                                  className={`secondary-button landing-request-slot-button${requestState.selectedSlot === slot.starts_at ? ' is-selected' : ''}`}
                                  onClick={() => handleDemoSlotSelect(slot.starts_at)}
                                >
                                  {slot.time_label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="meta-text">
                        No open demo times are available right now. Please <a className="library-resource-link" href={`mailto:${POLICY_SUPPORT_EMAIL}`}>{FOUNDER_CONTACT_LINK_LABEL}</a> and I&apos;ll coordinate directly.
                      </p>
                    )}
                  </div>
                ) : null}

                {requestState.error ? (
                  <p className="error-text account-form-feedback">{requestState.error}</p>
                ) : null}

                <div className="inline-actions" ref={submitActionsRef}>
                  <button type="submit" disabled={requestState.submitting || requestState.loadingSlots}>
                    {requestState.submitting
                      ? 'Submitting...'
                      : requestState.requestType === 'demo'
                        ? 'Submit demo request'
                        : 'Submit founder request'}
                  </button>
                  <button type="button" className="secondary-button" onClick={closeRequestModal}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>

      <footer className="landing-footer">
        <div className="landing-footer-copy">
          Progressory is for martial arts education, curriculum planning, class review, attendance context, progress tracking, and gym-created training resources.
        </div>
        <div className="landing-footer-links">
          {policyLinks.map((link) => (
            <Link key={link.key} to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>
      </footer>
    </>
  );
}

