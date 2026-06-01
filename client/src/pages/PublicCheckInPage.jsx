import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
};

const defaultForm = {
  first_name: '',
  last_name: '',
  email: ''
};

export default function PublicCheckInPage() {
  const { slug } = useParams();
  const formRef = useRef(null);
  const [mode, setMode] = useState('setup');
  const [pageState, setPageState] = useState({
    loading: true,
    error: '',
    gym: null
  });
  const [formData, setFormData] = useState(defaultForm);
  const [submitState, setSubmitState] = useState({
    loading: false,
    error: '',
    success: '',
    checkedInAt: '',
    alreadyCheckedIn: false,
    matchedSessionLabel: '',
    requiresSessionChoice: false,
    sessionChoices: []
  });
  const [selectedSessionChoice, setSelectedSessionChoice] = useState('');

  useEffect(() => {
    const loadPage = async () => {
      try {
        setPageState({ loading: true, error: '', gym: null });
        const response = await api.get(`/public-check-in/${slug}`);
        setPageState({
          loading: false,
          error: '',
          gym: response.data?.gym || null
        });
      } catch (error) {
        setPageState({
          loading: false,
          error: error.response?.data?.message || 'Could not load this gym check-in page right now.',
          gym: null
        });
      }
    };

    loadPage();
  }, [slug]);

  const modeCopy = useMemo(() => (
    mode === 'setup'
      ? {
          title: 'Need app access?',
          body: 'Enter your roster email and last name. If this gym already has you on the roster, Progressory will open the right setup link for you.'
        }
      : {
          title: 'Already a member? Click here!',
          body: 'Use your roster email and last name for a fast QR check-in. Staff can use this as a quick arrival signal before class starts.'
        }
  ), [mode]);

  const modeStatusText = mode === 'setup'
    ? 'Initial setup mode is active.'
    : 'Quick check-in mode is active.';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setSubmitState({
      loading: false,
      error: '',
      success: '',
      checkedInAt: '',
      alreadyCheckedIn: false,
      matchedSessionLabel: '',
      requiresSessionChoice: false,
      sessionChoices: []
    });
    setSelectedSessionChoice('');

    window.requestAnimationFrame(() => {
      if (formRef.current) {
        const targetTop = formRef.current.getBoundingClientRect().top + window.scrollY - 24;
        window.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' });
      }
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitState({
      loading: true,
      error: '',
      success: '',
      checkedInAt: '',
      alreadyCheckedIn: false,
      matchedSessionLabel: '',
      requiresSessionChoice: false,
      sessionChoices: []
    });

    try {
      if (mode === 'setup') {
        const response = await api.post(`/public-check-in/${slug}/access-setup`, formData);
        setSubmitState({
          loading: false,
          error: '',
          success: 'Setup matched. Opening your secure access link now...',
          checkedInAt: '',
          alreadyCheckedIn: false,
          matchedSessionLabel: ''
        });
        window.setTimeout(() => {
          window.location.assign(response.data.redirect_to);
        }, 700);
        return;
      }

      const [selectedSessionType = '', selectedSessionId = ''] = selectedSessionChoice.split(':');
      const response = await api.post(`/public-check-in/${slug}/quick-check-in`, {
        ...formData,
        selected_session_type: selectedSessionType || undefined,
        selected_session_id: selectedSessionId || undefined
      });

      if (response.data?.requires_session_choice) {
        setSubmitState({
          loading: false,
          error: '',
          success: response.data?.message || 'Choose the class you are attending.',
          checkedInAt: '',
          alreadyCheckedIn: false,
          matchedSessionLabel: '',
          requiresSessionChoice: true,
          sessionChoices: response.data?.session_choices || []
        });
        return;
      }

      setSubmitState({
        loading: false,
        error: '',
        success: response.data?.already_checked_in
          ? `${response.data.display_name} is already checked in.`
          : `${response.data.display_name} is checked in.`,
        checkedInAt: response.data?.checked_in_at || '',
        alreadyCheckedIn: Boolean(response.data?.already_checked_in),
        matchedSessionLabel: response.data?.matched_session?.label || '',
        requiresSessionChoice: false,
        sessionChoices: []
      });
    } catch (error) {
      setSubmitState({
        loading: false,
        error: error.response?.data?.message || 'Could not finish that step right now.',
        success: '',
        checkedInAt: '',
        alreadyCheckedIn: false,
        matchedSessionLabel: '',
        requiresSessionChoice: false,
        sessionChoices: []
      });
    }
  };

  return (
    <div className="auth-page-shell qr-check-in-page">
      <div className="auth-card qr-check-in-card">
        <span className="eyebrow">Progressory check-in</span>
        <h2>{pageState.gym?.name || 'Gym check-in'}</h2>
        <p className="section-note">
          Use this page at the front door to set up app access or check in in well under a minute.
        </p>

        <div className="qr-check-in-mode-row">
          <button
            type="button"
            className={`secondary-button${mode === 'setup' ? ' is-attention' : ''}`}
            onClick={() => handleModeChange('setup')}
          >
            Initial setup
          </button>
          <button
            type="button"
            className={`secondary-button${mode === 'check-in' ? ' is-attention' : ''}`}
            onClick={() => handleModeChange('check-in')}
          >
            Already a member? Click here!
          </button>
        </div>

        <p className="section-note qr-check-in-mode-status">{modeStatusText}</p>

        <div className="account-billing-card qr-check-in-mode-card">
          <strong>{modeCopy.title}</strong>
          <p className="section-note">{modeCopy.body}</p>
        </div>

        {pageState.loading ? <p className="empty-state">Loading gym check-in page...</p> : null}
        {!pageState.loading && pageState.error ? <p className="error-text">{pageState.error}</p> : null}

        {!pageState.loading && pageState.gym ? (
          <form ref={formRef} onSubmit={handleSubmit} className="form-grid qr-check-in-form">
            <div>
              <label>First name</label>
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Optional but helpful"
              />
            </div>

            <div>
              <label>Last name</label>
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Required"
                required
              />
            </div>

            <div>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Use the email your gym has on file"
                required
              />
            </div>

            {submitState.requiresSessionChoice ? (
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Choose your class</label>
                <div className="suggestion-chip-row">
                  {submitState.sessionChoices.map((choice) => {
                    const choiceValue = `${choice.session_type}:${choice.session_id}`;
                    const isSelected = selectedSessionChoice === choiceValue;

                    return (
                      <button
                        key={choiceValue}
                        type="button"
                        className={`suggestion-chip${isSelected ? ' selected' : ''}`}
                        onClick={() => setSelectedSessionChoice(choiceValue)}
                      >
                        {choice.label}
                      </button>
                    );
                  })}
                </div>
                <p className="section-note">
                  Two nearby classes match this check-in time. Pick the one you are attending, then press check in again.
                </p>
              </div>
            ) : null}

            {submitState.error ? <p className="error-text">{submitState.error}</p> : null}
            {submitState.success ? (
              <div className="success-banner qr-check-in-success">
                <strong>{submitState.success}</strong>
                {submitState.checkedInAt ? (
                  <p className="section-note">
                    {submitState.alreadyCheckedIn ? 'Latest check-in' : 'Checked in at'} {formatDateTime(submitState.checkedInAt)}
                  </p>
                ) : null}
                {submitState.matchedSessionLabel ? (
                  <p className="section-note">
                    Matched to {submitState.matchedSessionLabel}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="inline-actions">
              <button type="submit" disabled={submitState.loading}>
                {submitState.loading
                  ? (mode === 'setup' ? 'Matching roster...' : 'Checking in...')
                  : (mode === 'setup'
                    ? 'Set up my access'
                    : submitState.requiresSessionChoice
                      ? 'Check in to selected class'
                      : 'Check in now')}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
