import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [editingPrograms, setEditingPrograms] = useState({});
  const [editProgramMap, setEditProgramMap] = useState({});
  const [showInactive, setShowInactive] = useState(false);
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
      setError(err.response?.data?.message || 'Couldn\'t load programs right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const orderedPrograms = useMemo(() => {
    const active = programs.filter((program) => program.is_active);
    const inactive = programs.filter((program) => !program.is_active);

    const sortByName = (a, b) => a.name.localeCompare(b.name);

    active.sort(sortByName);
    inactive.sort(sortByName);

    return showInactive ? [...active, ...inactive] : active;
  }, [programs, showInactive]);

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
      setError(err.response?.data?.message || 'Couldn\'t create that program just now.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEditProgram = (program) => {
    if (!editProgramMap[program.id]) {
      setEditProgramMap((prev) => ({
        ...prev,
        [program.id]: {
          name: program.name || '',
          description: program.description || '',
          is_active: program.is_active ? 'true' : 'false'
        }
      }));
    }

    setEditingPrograms((prev) => ({
      ...prev,
      [program.id]: !prev[program.id]
    }));
  };

  const handleEditProgramChange = (programId, e) => {
    const { name, value } = e.target;

    setEditProgramMap((prev) => ({
      ...prev,
      [programId]: {
        ...prev[programId],
        [name]: value
      }
    }));
  };

  const handleUpdateProgram = async (programId) => {
    try {
      setError('');

      const editData = editProgramMap[programId];

      await api.put(`/programs/${programId}`, {
        name: editData.name,
        description: editData.description || null,
        is_active: editData.is_active === 'true'
      });

      await fetchPrograms();

      setEditingPrograms((prev) => ({
        ...prev,
        [programId]: false
      }));
    } catch (err) {
      console.error('Update program error:', err);
      setError(err.response?.data?.message || 'Couldn\'t update that program just now.');
    }
  };

  const handleDeactivateProgram = async (programId) => {
    const confirmed = window.confirm(
      'Make this program inactive? Existing data will stay in place, but it will be hidden from the default view.'
    );
    if (!confirmed) return;

    try {
      setError('');
      await api.patch(`/programs/${programId}/deactivate`);
      await fetchPrograms();
    } catch (err) {
      console.error('Deactivate program error:', err);
      setError(err.response?.data?.message || 'Couldn\'t update that program right now.');
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
              {submitting ? 'Saving...' : 'Save Program'}
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
          <h3 style={{ marginBottom: 0 }}>Program List</h3>
          <button
            className="secondary-button"
            onClick={() => setShowInactive((prev) => !prev)}
          >
            {showInactive ? 'Hide Inactive Programs' : 'Show Inactive Programs'}
          </button>
        </div>

        {loading ? (
          <p className="empty-state">Loading programs...</p>
        ) : orderedPrograms.length === 0 ? (
          <p className="empty-state">No programs have been added yet.</p>
        ) : (
          <ul className="card-list">
            {orderedPrograms.map((program) => (
              <li key={program.id} className="card-item">
                <strong>{program.name}</strong>
                <div className="detail-block">
                  <div>{program.description || 'No description added yet.'}</div>
                  <div className="meta-text">
                    Active: {program.is_active ? 'Yes' : 'No'}
                  </div>
                  {program.created_at && (
                    <div className="meta-text">
                      Created: {new Date(program.created_at).toLocaleString()}
                    </div>
                  )}
                  {program.updated_at && (
                    <div className="meta-text">
                      Updated: {new Date(program.updated_at).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="inline-actions">
                  <button
                    className="secondary-button"
                    onClick={() => toggleEditProgram(program)}
                  >
                    {editingPrograms[program.id] ? 'Hide Edit Program' : 'Edit Program'}
                  </button>

                  {program.is_active ? (
                    <button
                      className="danger-button"
                      onClick={() => handleDeactivateProgram(program.id)}
                    >
                      Deactivate Program
                    </button>
                  ) : null}
                </div>

                {editingPrograms[program.id] && (
                  <div className="detail-block">
                    <section className="page-section">
                      <h4>Edit Program Details</h4>

                      <form
                        className="form-grid"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleUpdateProgram(program.id);
                        }}
                      >
                        <div>
                          <label>Program Name</label>
                          <input
                            type="text"
                            name="name"
                            value={editProgramMap[program.id]?.name || ''}
                            onChange={(e) => handleEditProgramChange(program.id, e)}
                          />
                        </div>

                        <div>
                          <label>Description</label>
                          <textarea
                            name="description"
                            value={editProgramMap[program.id]?.description || ''}
                            onChange={(e) => handleEditProgramChange(program.id, e)}
                            rows="3"
                          />
                        </div>

                        <div>
                          <label>Active Status</label>
                          <select
                            name="is_active"
                            value={editProgramMap[program.id]?.is_active || 'true'}
                            onChange={(e) => handleEditProgramChange(program.id, e)}
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        </div>

                        <div className="inline-actions">
                          <button type="submit">Save Program Details</button>
                        </div>
                      </form>
                    </section>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}
