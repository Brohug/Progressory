import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/programs');
      setPrograms(response.data);
    } catch (err) {
      console.error('Fetch programs error:', err);
      setError(err.response?.data?.message || 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
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
      await api.post('/programs', formData);

      setFormData({
        name: '',
        description: ''
      });

      await fetchPrograms();
    } catch (err) {
      console.error('Create program error:', err);
      setError(err.response?.data?.message || 'Failed to create program');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <h2 className="page-title">Programs</h2>

      <section className="page-section" style={{ maxWidth: '760px' }}>
        <h3>Create Program</h3>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div>
            <label>Program Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
            <button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Program'}
            </button>
          </div>
        </form>
      </section>

      {error && <p className="error-text">{error}</p>}

      <section className="page-section">
        <h3>Program List</h3>

        {loading ? (
          <p className="empty-state">Loading programs...</p>
        ) : programs.length === 0 ? (
          <p className="empty-state">No programs found.</p>
        ) : (
          <ul className="card-list">
            {programs.map((program) => (
              <li key={program.id} className="card-item">
                <strong>{program.name}</strong>
                <div className="detail-block">
                  <div>{program.description || 'No description'}</div>
                  <div className="meta-text">
                    Active: {program.is_active ? 'Yes' : 'No'}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}