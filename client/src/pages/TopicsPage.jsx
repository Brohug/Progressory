import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

export default function TopicsPage() {
  const [topics, setTopics] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [formData, setFormData] = useState({
    program_id: '',
    parent_topic_id: '',
    title: '',
    topic_type: 'position',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const topicTypes = [
    'position',
    'technique',
    'concept',
    'submission',
    'escape',
    'takedown',
    'drill_theme'
  ];

  const fetchTopics = async () => {
    try {
      const response = await api.get('/topics');
      setTopics(response.data);
    } catch (err) {
      console.error('Fetch topics error:', err);
      setError(err.response?.data?.message || 'Failed to load topics');
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/programs');
      setPrograms(response.data);
    } catch (err) {
      console.error('Fetch programs error:', err);
      setError(err.response?.data?.message || 'Failed to load programs');
    }
  };

  const loadPageData = async () => {
    try {
      setLoading(true);
      setError('');
      await Promise.all([fetchTopics(), fetchPrograms()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
        parent_topic_id: formData.parent_topic_id ? Number(formData.parent_topic_id) : null,
        title: formData.title,
        topic_type: formData.topic_type,
        description: formData.description
      };

      await api.post('/topics', payload);

      setFormData({
        program_id: '',
        parent_topic_id: '',
        title: '',
        topic_type: 'position',
        description: ''
      });

      await fetchTopics();
    } catch (err) {
      console.error('Create topic error:', err);
      setError(err.response?.data?.message || 'Failed to create topic');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <h2 className="page-title">Topics</h2>

      <section className="page-section" style={{ maxWidth: '760px' }}>
        <h3>Create Topic</h3>

        <form className="form-grid" onSubmit={handleSubmit}>
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
            <label>Parent Topic</label>
            <select
              name="parent_topic_id"
              value={formData.parent_topic_id}
              onChange={handleChange}
            >
              <option value="">No Parent</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </div>

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
            <label>Topic Type</label>
            <select
              name="topic_type"
              value={formData.topic_type}
              onChange={handleChange}
            >
              {topicTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
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
            <button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Topic'}
            </button>
          </div>
        </form>
      </section>

      {error && <p className="error-text">{error}</p>}

      <section className="page-section">
        <h3>Topic List</h3>

        {loading ? (
          <p className="empty-state">Loading topics...</p>
        ) : topics.length === 0 ? (
          <p className="empty-state">No topics found.</p>
        ) : (
          <ul className="card-list">
            {topics.map((topic) => (
              <li key={topic.id} className="card-item">
                <strong>{topic.title}</strong>
                <div className="detail-block">
                  <div className="meta-text">Type: {topic.topic_type}</div>
                  <div className="meta-text">Program: {topic.program_name || 'None'}</div>
                  <div className="meta-text">Parent: {topic.parent_topic_title || 'None'}</div>
                  <div>{topic.description || 'No description'}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}