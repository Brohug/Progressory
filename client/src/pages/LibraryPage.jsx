import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

export default function LibraryPage() {
  const [entries, setEntries] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [topics, setTopics] = useState([]);
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

  const handleDelete = async (entryId) => {
  const confirmed = window.confirm('Delete this library entry?');
  if (!confirmed) return;

  try {
    setError('');
    await api.delete(`/library/${entryId}`);
    await fetchEntries();
  } catch (err) {
    console.error('Delete library entry error:', err);
    setError(err.response?.data?.message || 'Failed to delete library entry');
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
                  {type}
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
                  {option}
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
        <h3>Library Entries</h3>

        {loading ? (
          <p className="empty-state">Loading library...</p>
        ) : entries.length === 0 ? (
          <p className="empty-state">No library entries found.</p>
        ) : (
          <ul className="card-list">
            {entries.map((entry) => (
              <li key={entry.id} className="card-item">
                <strong>{entry.title}</strong>

                <div className="detail-block">
                  <div className="meta-text">Type: {entry.entry_type}</div>
                  <div className="meta-text">Program: {entry.program_name || 'None'}</div>
                  <div className="meta-text">Topic: {entry.topic_title || 'None'}</div>
                  <div className="meta-text">Visibility: {entry.visibility}</div>
                  <div className="meta-text">
                    Created By: {entry.created_by_first_name} {entry.created_by_last_name}
                  </div>
                  <div>{entry.description || 'No description'}</div>
                </div>

                <div className="inline-actions">
                  {entry.video_url && (
                    <a href={entry.video_url} target="_blank" rel="noreferrer">
                      Open Video Link
                    </a>
                  )}
                  <button
                    className="danger-button"
                    onClick={() => handleDelete(entry.id)}
                  >
                    Delete Entry
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}
