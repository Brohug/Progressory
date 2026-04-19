import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { formatLabel } from '../utils/formatLabel';
import TopicSearchSelect from '../components/TopicSearchSelect';

export default function LibraryPage() {
  const [entries, setEntries] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [topics, setTopics] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [showCreateEntryForm, setShowCreateEntryForm] = useState(false);
  const [expandedEntryDetails, setExpandedEntryDetails] = useState({});
  const [formData, setFormData] = useState({
    program_id: '',
    curriculum_topic_id: '',
    title: '',
    entry_type: 'video_note',
    description: '',
    video_url: '',
    visibility: 'coach_only'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const entryTypes = ['technique', 'concept', 'drill', 'cla_game', 'video_note'];
  const visibilityOptions = ['coach_only', 'member_visible'];

  const fetchEntries = async () => {
    const response = await api.get('/library');
    setEntries(response.data);
  };

  const fetchPrograms = async () => {
    const response = await api.get('/programs');
    setPrograms(response.data);
  };

  const fetchTopics = async () => {
    const response = await api.get('/topics');
    setTopics(response.data);
  };

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError('');
        await Promise.all([fetchEntries(), fetchPrograms(), fetchTopics()]);
      } catch (err) {
        console.error('Load library page error:', err);
        setError(err.response?.data?.message || 'Couldn\'t load the library right now.');
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  const orderedEntries = useMemo(() => {
    const active = entries.filter((entry) => entry.is_active);
    const inactive = entries.filter((entry) => !entry.is_active);

    return showInactive ? [...active, ...inactive] : active;
  }, [entries, showInactive]);

  const availableTopics = useMemo(() => {
    const activeTopics = topics.filter((topic) => topic.is_active);

    if (!formData.program_id) {
      return activeTopics;
    }

    const matchingTopics = activeTopics.filter((topic) => (
      topic.program_id === null || String(topic.program_id) === String(formData.program_id)
    ));

    return matchingTopics.length > 0 ? matchingTopics : activeTopics;
  }, [topics, formData.program_id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleTopicChange = (topicId) => {
    setFormData((prev) => ({
      ...prev,
      curriculum_topic_id: topicId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        program_id: formData.program_id ? Number(formData.program_id) : null,
        curriculum_topic_id: formData.curriculum_topic_id
          ? Number(formData.curriculum_topic_id)
          : null,
        title: formData.title,
        entry_type: formData.entry_type,
        description: formData.description || null,
        video_url: formData.video_url || null,
        visibility: formData.visibility
      };

      await api.post('/library', payload);

      setFormData({
        program_id: '',
        curriculum_topic_id: '',
        title: '',
        entry_type: 'video_note',
        description: '',
        video_url: '',
        visibility: 'coach_only'
      });

      await fetchEntries();
    } catch (err) {
      console.error('Create library entry error:', err);
      setError(err.response?.data?.message || 'Couldn\'t create that library entry just now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetActiveState = async (entry, nextIsActive) => {
    const confirmed = window.confirm(
      nextIsActive
        ? 'Make this library entry active again?'
        : 'Make this library entry inactive? It will stay in the system, but it will be hidden from the default view.'
    );
    if (!confirmed) return;

    try {
      setError('');
      await api.put(`/library/${entry.id}`, {
        program_id: entry.program_id,
        curriculum_topic_id: entry.curriculum_topic_id,
        title: entry.title,
        entry_type: entry.entry_type,
        description: entry.description || null,
        video_url: entry.video_url || null,
        visibility: entry.visibility,
        is_active: nextIsActive
      });
      await fetchEntries();
    } catch (err) {
      console.error('Update library entry active state error:', err);
      setError(err.response?.data?.message || 'Couldn\'t update that library entry right now.');
    }
  };

  const toggleEntryDetails = (entryId) => {
    setExpandedEntryDetails((prev) => ({
      ...prev,
      [entryId]: !prev[entryId]
    }));
  };

  return (
    <Layout>
      <h2 className="page-title">Library</h2>

      <section className="page-section" style={{ maxWidth: '760px' }}>
        <div className="compact-form-shell">
          <div className="compact-form-header">
            <div>
              <h3>Create Library Entry</h3>
              <p className="section-note">
                Add a teaching resource, video note, or reference and only open the full form when you are ready to log it.
              </p>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowCreateEntryForm((prev) => !prev)}
            >
              {showCreateEntryForm ? 'Hide form' : 'Show form'}
            </button>
          </div>

          {showCreateEntryForm && (
            <form className="form-grid" onSubmit={handleSubmit}>
              <div>
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Entry Type</label>
                <select
                  name="entry_type"
                  value={formData.entry_type}
                  onChange={handleChange}
                >
                  {entryTypes.map((type) => (
                    <option key={type} value={type}>
                      {formatLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Program</label>
                <select
                  name="program_id"
                  value={formData.program_id}
                  onChange={handleChange}
                >
                  <option value="">No program</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Curriculum Topic</label>
                <TopicSearchSelect
                  topics={availableTopics}
                  value={formData.curriculum_topic_id}
                  onChange={handleTopicChange}
                  placeholder="Search curriculum topics for this entry..."
                  emptySelectionLabel="No topic selected"
                  helperText="Search and select a curriculum topic if this entry should be linked."
                />
              </div>

              <div>
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

              <div>
                <label>Video URL</label>
                <input
                  type="text"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Visibility</label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                >
                  {visibilityOptions.map((option) => (
                    <option key={option} value={option}>
                      {formatLabel(option)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Library Entry'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {error && <p className="error-text">{error}</p>}

      <section className="page-section">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <h3 style={{ marginBottom: 0 }}>Library Entries</h3>
          <button
            className="secondary-button"
            onClick={() => setShowInactive((prev) => !prev)}
          >
            {showInactive ? 'Hide Inactive Entries' : 'Show Inactive Entries'}
          </button>
        </div>

        {loading ? (
          <p className="empty-state">Loading library...</p>
        ) : orderedEntries.length === 0 ? (
          <p className="empty-state">No library entries have been added yet.</p>
        ) : (
          <ul className="card-list">
            {orderedEntries.map((entry) => (
              <li key={entry.id} className="card-item compact-topic-card">
                <div className="compact-topic-header">
                  <div>
                    <strong>{entry.title}</strong>
                    <div className="compact-topic-meta meta-text">
                      {formatLabel(entry.entry_type)} • {entry.program_name || 'No program'} • {entry.topic_title || 'No linked topic'}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => toggleEntryDetails(entry.id)}
                  >
                    {expandedEntryDetails[entry.id] ? 'Hide details' : 'Show details'}
                  </button>
                </div>

                {expandedEntryDetails[entry.id] && (
                  <div className="detail-block">
                    <div className="meta-text">Type: {formatLabel(entry.entry_type)}</div>
                    <div className="meta-text">Program: {entry.program_name || 'None'}</div>
                    <div className="meta-text">Topic: {entry.topic_title || 'None'}</div>
                    <div className="meta-text">Visibility: {formatLabel(entry.visibility)}</div>
                    <div className="meta-text">
                      Active: {entry.is_active ? 'Yes' : 'No'}
                    </div>
                    <div className="meta-text">
                      Created By: {entry.created_by_first_name} {entry.created_by_last_name}
                    </div>
                    {entry.created_at && (
                      <div className="meta-text">
                        Created: {new Date(entry.created_at).toLocaleString()}
                      </div>
                    )}
                    {entry.updated_at && (
                      <div className="meta-text">
                        Updated: {new Date(entry.updated_at).toLocaleString()}
                      </div>
                    )}
                    <div>{entry.description || 'No description added yet.'}</div>
                  </div>
                )}

                <div className="inline-actions">
                  {entry.video_url && (
                    <a href={entry.video_url} target="_blank" rel="noreferrer">
                      Open Video Link
                    </a>
                  )}
                  {entry.is_active ? (
                    <button
                      className="danger-button"
                      onClick={() => handleSetActiveState(entry, false)}
                    >
                      Deactivate Entry
                    </button>
                  ) : (
                    <button
                      className="secondary-button"
                      onClick={() => handleSetActiveState(entry, true)}
                    >
                      Make Entry Active Again
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}
