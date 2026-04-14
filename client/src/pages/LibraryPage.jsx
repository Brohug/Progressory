import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { formatLabel } from '../utils/formatLabel';

export default function LibraryPage() {
  const [entries, setEntries] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [topics, setTopics] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
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
        setError(err.response?.data?.message || 'Failed to load library');
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

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
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
      setError(err.response?.data?.message || 'Failed to create library entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetActiveState = async (entry, nextIsActive) => {
    const confirmed = window.confirm(
      nextIsActive
        ? 'Reactivate this library entry?'
        : 'Deactivate this library entry? It will remain in the system but be marked inactive.'
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
      setError(err.response?.data?.message || 'Failed to update library entry');
    }
  };

  return (
    <Layout>
      <h2 className="page-title">Library</h2>

      <section className="page-section" style={{ maxWidth: '760px' }}>
        <h3>Create Library Entry</h3>

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
              <option value="">No Program</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Curriculum Topic</label>
            <select
              name="curriculum_topic_id"
              value={formData.curriculum_topic_id}
              onChange={handleChange}
            >
              <option value="">No Topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
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
              {submitting ? 'Creating...' : 'Create Library Entry'}
            </button>
          </div>
        </form>
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
          <p className="empty-state">No library entries found.</p>
        ) : (
          <ul className="card-list">
            {orderedEntries.map((entry) => (
              <li key={entry.id} className="card-item">
                <strong>{entry.title}</strong>

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
                  <div>{entry.description || 'No description'}</div>
                </div>

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
                      Reactivate Entry
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
