import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ExpandableSection from '../components/ExpandableSection';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

export default function ProgramsPage() {
  const { user } = useAuth();
  const isManagement = user?.role === 'owner' || user?.role === 'admin';
  const [programs, setPrograms] = useState([]);
  const [topics, setTopics] = useState([]);
  const [showCreateProgramForm, setShowCreateProgramForm] = useState(false);
  const [expandedProgramDetails, setExpandedProgramDetails] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [editingPrograms, setEditingPrograms] = useState({});
  const [editProgramMap, setEditProgramMap] = useState({});
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeProgramId, setActiveProgramId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const fetchTopics = async () => {
    try {
      const response = await api.get('/topics');
      setTopics(response.data);
    } catch (err) {
      console.error('Fetch topics for programs error:', err);
      setError(err.response?.data?.message || 'Couldn\'t load topics right now.');
    }
  };

  useEffect(() => {
    const loadPageData = async () => {
      await Promise.all([fetchPrograms(), fetchTopics()]);
    };

    loadPageData();
  }, []);

  const topicCountByProgramId = useMemo(() => {
    const nextMap = new Map();

    topics
      .filter((topic) => topic.is_active)
      .forEach((topic) => {
        if (!topic.program_id) {
          return;
        }

        nextMap.set(topic.program_id, (nextMap.get(topic.program_id) || 0) + 1);
      });

    return nextMap;
  }, [topics]);

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
    setSuccessMessage('');

    try {
      await api.post('/programs', formData);

      setFormData({
        name: '',
        description: ''
      });

      await fetchPrograms();
      setSuccessMessage('Program saved successfully.');
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
      setSuccessMessage('');
      setActiveProgramId(programId);

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
      setSuccessMessage('Program details updated successfully.');
    } catch (err) {
      console.error('Update program error:', err);
      setError(err.response?.data?.message || 'Couldn\'t update that program just now.');
    } finally {
      setActiveProgramId(null);
    }
  };

  const handleDeactivateProgram = async (programId) => {
    const confirmed = window.confirm(
      'Make this program inactive? Existing data will stay in place, but it will be hidden from the default view.'
    );
    if (!confirmed) return;

    try {
      setError('');
      setSuccessMessage('');
      setActiveProgramId(programId);
      await api.patch(`/programs/${programId}/deactivate`);
      await fetchPrograms();
      setSuccessMessage('Program moved out of the active list.');
    } catch (err) {
      console.error('Deactivate program error:', err);
      setError(err.response?.data?.message || 'Couldn\'t update that program right now.');
    } finally {
      setActiveProgramId(null);
    }
  };

  const handleReactivateProgram = async (programId) => {
    try {
      setError('');
      setSuccessMessage('');
      setActiveProgramId(programId);
      await api.patch(`/programs/${programId}/activate`);
      await fetchPrograms();
      setSuccessMessage('Program reactivated successfully.');
    } catch (err) {
      console.error('Reactivate program error:', err);
      setError(err.response?.data?.message || 'Couldn\'t update that program right now.');
    } finally {
      setActiveProgramId(null);
    }
  };
  

  const toggleProgramDetails = (programId) => {
    setExpandedProgramDetails((prev) => ({
      ...prev,
      [programId]: !prev[programId]
    }));
  };

  return (
    <Layout>
      <h2 className="page-title">Programs</h2>
      <p className="page-intro">
        Build the broad training tracks here, then move into topics so those programs become usable in planning, classes, Library, and reports.
      </p>

      {isManagement ? (
        <section className="action-grid" style={{ marginBottom: '1.5rem' }}>
          <Link to="/topics?action=create" className="action-card dashboard-action-card">
            <strong>Add topic to a program</strong>
            <div className="detail-block">
              <div className="meta-text">Use this when the program exists but the actual curriculum topics under it still need to be built.</div>
            </div>
          </Link>
          <Link to="/topics" className="action-card dashboard-action-card">
            <strong>Review topic library</strong>
            <div className="detail-block">
              <div className="meta-text">Open Topics to search, clean up, or expand the real curriculum tied to these programs.</div>
            </div>
          </Link>
          <Link to="/index" className="action-card dashboard-action-card">
            <strong>Browse curriculum map</strong>
            <div className="detail-block">
              <div className="meta-text">Use Curriculum when you want the broader teaching map before deciding which program topics to add next.</div>
            </div>
          </Link>
        </section>
      ) : null}

      {isManagement ? (
      <section className="page-section" style={{ maxWidth: '760px' }}>
        <div className="compact-form-shell">
          <div className="compact-form-header">
            <div>
              <h3>Create Program</h3>
              <p className="section-note">
                Add a program when you need it, but keep the page light by hiding the longer setup form until then.
              </p>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowCreateProgramForm((prev) => !prev)}
            >
              {showCreateProgramForm ? 'Hide form' : 'Show form'}
            </button>
          </div>

          {showCreateProgramForm && (
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
          )}

          {successMessage ? (
            <div className="success-followup-row">
              <p className="success-text" style={{ marginBottom: 0 }}>{successMessage}</p>
              <Link className="secondary-button" to="/topics">
                Next: View Topics
              </Link>
              <Link className="secondary-button" to="/topics?action=create">
                Next: Add topic
              </Link>
            </div>
          ) : null}
        </div>
      </section>
      ) : null}

      {error && <p className="error-text">{error}</p>}

      <ExpandableSection
        title="Program List"
        note="Review active tracks by default, then expand this section when you need to manage names, descriptions, or inactive programs."
        summary={`${orderedPrograms.length} program${orderedPrograms.length === 1 ? '' : 's'} ready to review.`}
        actions={(
          <button
            className="secondary-button"
            onClick={() => setShowInactive((prev) => !prev)}
            type="button"
          >
            {showInactive ? 'Hide Inactive Programs' : 'Show Inactive Programs'}
          </button>
        )}
      >
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
        </div>

        {loading ? (
          <p className="empty-state">Loading programs...</p>
        ) : orderedPrograms.length === 0 ? (
          <p className="empty-state">No programs have been added yet.</p>
        ) : (
          <ul className="card-list">
            {orderedPrograms.map((program) => (
              <li key={program.id} className="card-item compact-topic-card">
                <div className="compact-topic-header">
                  <div>
                    <strong>{program.name}</strong>
                    <div className="compact-topic-meta meta-text">
                      {program.is_active ? 'Active' : 'Inactive'} • {topicCountByProgramId.get(program.id) || 0} topic{(topicCountByProgramId.get(program.id) || 0) === 1 ? '' : 's'} linked
                    </div>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => toggleProgramDetails(program.id)}
                  >
                    {expandedProgramDetails[program.id] ? 'Hide details' : 'Open details'}
                  </button>
                </div>

                <div className="member-card-summary-row">
                  <span className="member-card-summary-pill">{program.is_active ? 'Active' : 'Inactive'}</span>
                  <span className="member-card-summary-pill">
                    {topicCountByProgramId.get(program.id) || 0} topic{(topicCountByProgramId.get(program.id) || 0) === 1 ? '' : 's'}
                  </span>
                </div>

                {expandedProgramDetails[program.id] && (
                  <div className="detail-block">
                    <div>{program.description || 'No description added yet.'}</div>
                    <div className="meta-text">
                      Active: {program.is_active ? 'Yes' : 'No'}
                    </div>
                    <div className="meta-text">
                      Linked topics: {topicCountByProgramId.get(program.id) || 0}
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
                )}

                <div className="inline-actions">
                  {isManagement ? (
                    <Link className="secondary-button" to={`/topics?program=${program.id}`}>
                      View Topics
                    </Link>
                  ) : null}
                  {isManagement ? (
                    <Link className="secondary-button" to={`/topics?action=create&suggestedProgramId=${program.id}`}>
                      Add Topic
                    </Link>
                  ) : null}
                  <Link className="secondary-button" to={`/index?search=${encodeURIComponent(program.name)}`}>
                    Open Curriculum
                  </Link>
                  {isManagement ? (
                    <button
                      className="secondary-button"
                      onClick={() => toggleEditProgram(program)}
                    >
                      {editingPrograms[program.id] ? 'Close editor' : 'Edit program'}
                    </button>
                  ) : null}

                  {isManagement ? (
                    program.is_active ? (
                      <button
                        className="danger-button"
                        onClick={() => handleDeactivateProgram(program.id)}
                        disabled={activeProgramId === program.id}
                      >
                        {activeProgramId === program.id ? 'Updating...' : 'Deactivate'}
                      </button>
                    ) : (
                      <button
                        className="secondary-button"
                        onClick={() => handleReactivateProgram(program.id)}
                        disabled={activeProgramId === program.id}
                      >
                        {activeProgramId === program.id ? 'Updating...' : 'Reactivate'}
                      </button>
                    )
                  ) : null}
                </div>

                {isManagement && editingPrograms[program.id] && (
                  <div className="detail-block">
                    <section className="compact-form-shell">
                      <div className="compact-form-header">
                        <div>
                          <h4>Edit Program Details</h4>
                          <p className="section-note">
                            Adjust the program name, description, or active state here without adding more clutter to the main list.
                          </p>
                        </div>
                      </div>
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
                          <button type="submit" disabled={activeProgramId === program.id}>
                            {activeProgramId === program.id ? 'Saving...' : 'Save Program Details'}
                          </button>
                        </div>
                      </form>
                    </section>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </ExpandableSection>
    </Layout>
  );
}
