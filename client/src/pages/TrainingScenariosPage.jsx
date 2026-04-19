import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

export default function TrainingScenariosPage() {
  const [programs, setPrograms] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [trainingMethods, setTrainingMethods] = useState([]);
  const [trainingScenarios, setTrainingScenarios] = useState([]);
  const [editingScenarios, setEditingScenarios] = useState({});
  const [expandedScenarioDetails, setExpandedScenarioDetails] = useState({});
  const [editScenarioMap, setEditScenarioMap] = useState({});
  const [scenarioFeedbackMap, setScenarioFeedbackMap] = useState({});
  const [showInactiveScenarios, setShowInactiveScenarios] = useState(false);
  const [showCreateScenarioForm, setShowCreateScenarioForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scenarioSubmitting, setScenarioSubmitting] = useState(false);
  const [scenarioError, setScenarioError] = useState('');
  const [scenarioMessage, setScenarioMessage] = useState('');
  const [scenarioFormData, setScenarioFormData] = useState({
    program_id: '',
    training_method_id: '',
    name: '',
    description: '',
    starting_position_topic_id: '',
    top_objective: '',
    bottom_objective: '',
    constraints_text: '',
    round_duration_seconds: ''
  });

  const clearScenarioFeedback = (scenarioId) => {
    setScenarioFeedbackMap((prev) => ({
      ...prev,
      [scenarioId]: {
        message: '',
        error: ''
      }
    }));
  };

  const setScenarioFeedback = (scenarioId, nextFeedback) => {
    setScenarioFeedbackMap((prev) => ({
      ...prev,
      [scenarioId]: {
        message: nextFeedback.message || '',
        error: nextFeedback.error || ''
      }
    }));
  };

  const fetchPrograms = async () => {
    const response = await api.get('/programs');
    setPrograms(response.data);
  };

  const fetchAllTopics = async () => {
    const response = await api.get('/topics');
    setAllTopics(response.data);
  };

  const fetchTrainingMethods = async () => {
    const response = await api.get('/training-methods');
    setTrainingMethods(response.data);
  };

  const fetchTrainingScenarios = async () => {
    const response = await api.get('/training-scenarios');
    setTrainingScenarios(response.data);
  };

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setScenarioError('');

        await Promise.all([
          fetchPrograms(),
          fetchAllTopics(),
          fetchTrainingMethods(),
          fetchTrainingScenarios()
        ]);
      } catch (err) {
        console.error('Load training scenarios page error:', err);
        setScenarioError(
          err.response?.data?.message || 'Couldn\'t load training scenarios right now.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  const orderedScenarios = useMemo(() => {
    const active = trainingScenarios.filter((scenario) => scenario.is_active);
    const inactive = trainingScenarios.filter((scenario) => !scenario.is_active);

    return showInactiveScenarios ? [...active, ...inactive] : active;
  }, [showInactiveScenarios, trainingScenarios]);

  const scenarioSummaryCards = useMemo(() => {
    const activeCount = trainingScenarios.filter((scenario) => scenario.is_active).length;
    const inactiveCount = trainingScenarios.length - activeCount;
    const linkedPrograms = new Set(
      trainingScenarios
        .filter((scenario) => scenario.program_id)
        .map((scenario) => scenario.program_id)
    ).size;

    return [
      { label: 'Total scenarios', value: trainingScenarios.length },
      { label: 'Active scenarios', value: activeCount },
      { label: 'Inactive scenarios', value: inactiveCount },
      { label: 'Programs using scenarios', value: linkedPrograms }
    ];
  }, [trainingScenarios]);

  const getTopicsForScenarioProgram = (programId) => {
    if (!programId) {
      return allTopics.filter((topic) => topic.is_active);
    }

    return allTopics.filter((topic) => (
      topic.is_active &&
      (
        topic.program_id === null ||
        String(topic.program_id) === String(programId)
      )
    ));
  };

  const handleScenarioFormChange = (e) => {
    const { name, value } = e.target;

    setScenarioFormData((prev) => {
      const next = {
        ...prev,
        [name]: value
      };

      if (name === 'program_id') {
        next.starting_position_topic_id = '';
      }

      return next;
    });
  };

  const handleCreateScenario = async (e) => {
    e.preventDefault();
    setScenarioSubmitting(true);
    setScenarioError('');
    setScenarioMessage('');

    try {
      const payload = {
        program_id: scenarioFormData.program_id ? Number(scenarioFormData.program_id) : null,
        training_method_id: Number(scenarioFormData.training_method_id),
        name: scenarioFormData.name,
        description: scenarioFormData.description || null,
        starting_position_topic_id: scenarioFormData.starting_position_topic_id
          ? Number(scenarioFormData.starting_position_topic_id)
          : null,
        top_objective: scenarioFormData.top_objective || null,
        bottom_objective: scenarioFormData.bottom_objective || null,
        constraints_text: scenarioFormData.constraints_text || null,
        round_duration_seconds: scenarioFormData.round_duration_seconds
          ? Number(scenarioFormData.round_duration_seconds)
          : null
      };

      await api.post('/training-scenarios', payload);

      setScenarioFormData({
        program_id: '',
        training_method_id: '',
        name: '',
        description: '',
        starting_position_topic_id: '',
        top_objective: '',
        bottom_objective: '',
        constraints_text: '',
        round_duration_seconds: ''
      });

      setScenarioMessage('Training scenario saved successfully.');
      await fetchTrainingScenarios();
    } catch (err) {
      console.error('Create training scenario error:', err);
      setScenarioError(
        err.response?.data?.message || 'Couldn\'t create that training scenario just now.'
      );
    } finally {
      setScenarioSubmitting(false);
    }
  };

  const toggleEditScenario = (scenario) => {
    if (!editScenarioMap[scenario.id]) {
      setEditScenarioMap((prev) => ({
        ...prev,
        [scenario.id]: {
          program_id: scenario.program_id ? String(scenario.program_id) : '',
          training_method_id: scenario.training_method_id
            ? String(scenario.training_method_id)
            : '',
          name: scenario.name || '',
          description: scenario.description || '',
          starting_position_topic_id: scenario.starting_position_topic_id
            ? String(scenario.starting_position_topic_id)
            : '',
          top_objective: scenario.top_objective || '',
          bottom_objective: scenario.bottom_objective || '',
          constraints_text: scenario.constraints_text || '',
          round_duration_seconds: scenario.round_duration_seconds
            ? String(scenario.round_duration_seconds)
            : '',
          is_active: scenario.is_active ? 'true' : 'false'
        }
      }));
    }

    setEditingScenarios((prev) => ({
      ...prev,
      [scenario.id]: !prev[scenario.id]
    }));
  };

  const handleEditScenarioChange = (scenarioId, e) => {
    const { name, value } = e.target;

    setEditScenarioMap((prev) => {
      const next = {
        ...prev,
        [scenarioId]: {
          ...prev[scenarioId],
          [name]: value
        }
      };

      if (name === 'program_id') {
        next[scenarioId].starting_position_topic_id = '';
      }

      return next;
    });
  };

  const handleUpdateScenario = async (scenarioId) => {
    try {
      clearScenarioFeedback(scenarioId);

      const editData = editScenarioMap[scenarioId];

      await api.put(`/training-scenarios/${scenarioId}`, {
        program_id: editData.program_id ? Number(editData.program_id) : null,
        training_method_id: Number(editData.training_method_id),
        name: editData.name,
        description: editData.description || null,
        starting_position_topic_id: editData.starting_position_topic_id
          ? Number(editData.starting_position_topic_id)
          : null,
        top_objective: editData.top_objective || null,
        bottom_objective: editData.bottom_objective || null,
        constraints_text: editData.constraints_text || null,
        round_duration_seconds: editData.round_duration_seconds
          ? Number(editData.round_duration_seconds)
          : null,
        is_active: editData.is_active === 'true'
      });

      await fetchTrainingScenarios();

      setEditingScenarios((prev) => ({
        ...prev,
        [scenarioId]: false
      }));

      setScenarioFeedback(scenarioId, {
        message: 'Training scenario updated successfully.',
        error: ''
      });
    } catch (err) {
      console.error('Update training scenario error:', err);
      setScenarioFeedback(scenarioId, {
        message: '',
        error: err.response?.data?.message || 'Failed to update training scenario'
      });
    }
  };

  const handleDeactivateScenario = async (scenarioId) => {
    const confirmed = window.confirm(
      'Deactivate this training scenario? Existing class entries will remain, but this scenario will no longer be used for new entries.'
    );
    if (!confirmed) return;

    try {
      clearScenarioFeedback(scenarioId);
      await api.patch(`/training-scenarios/${scenarioId}/deactivate`);
      await fetchTrainingScenarios();
      setScenarioFeedback(scenarioId, {
        message: 'Training scenario deactivated successfully.',
        error: ''
      });
    } catch (err) {
      console.error('Deactivate training scenario error:', err);
      setScenarioFeedback(scenarioId, {
        message: '',
        error: err.response?.data?.message || 'Failed to deactivate training scenario'
      });
    }
  };

  const handleDeleteScenario = async (scenarioId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this training scenario? This cannot be undone.'
    );

    if (!confirmed) return;

    try {
      clearScenarioFeedback(scenarioId);
      await api.delete(`/training-scenarios/${scenarioId}`);
      await fetchTrainingScenarios();
      setScenarioMessage('Training scenario deleted successfully.');
      setScenarioError('');
    } catch (err) {
      console.error('Delete training scenario error:', err);
      setScenarioFeedback(scenarioId, {
        message: '',
        error:
          err.response?.data?.message || 'Couldn\'t delete that training scenario just now.'
      });
    }
  };

  const toggleScenarioDetails = (scenarioId) => {
    setExpandedScenarioDetails((prev) => ({
      ...prev,
      [scenarioId]: !prev[scenarioId]
    }));
  };

  return (
    <Layout>
      <div className="training-scenarios-page">
        <h2 className="page-title">Training Scenarios</h2>
        <p className="page-intro">
          Create reusable scenarios for your gym here, then pull them into planned classes and
          completed class logs whenever they fit. Think of this page as your reusable class-setup
          library.
        </p>

        <section className="action-grid">
          <div className="action-card">
            <span className="eyebrow">Build Once</span>
            <strong>Create reusable scenarios</strong>
            <p>
              Set the method, starting topic, and objectives once so coaches do not have to rebuild
              the same scenario every time.
            </p>
          </div>
          <div className="action-card">
            <span className="eyebrow">Plan Faster</span>
            <strong>Use them in planned classes</strong>
            <p>
              Pull scenarios straight into Planned Classes when mapping out the week so the class
              structure is already lined up.
            </p>
          </div>
          <div className="action-card">
            <span className="eyebrow">Reuse Later</span>
            <strong>Use them in completed classes</strong>
            <p>
              Reuse the same scenarios when logging live classes so repeated coaching themes stay
              consistent over time.
            </p>
          </div>
        </section>

        <section className="stats-grid">
          {scenarioSummaryCards.map((card) => (
            <div key={card.label} className="stat-card">
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
            </div>
          ))}
        </section>

        <section className="page-section" style={{ maxWidth: '760px' }}>
          <div className="section-header">
            <div>
              <h3>Create and reuse scenarios</h3>
              <p className="section-note">
                Build a scenario once, then reuse it later in Planned Classes and Completed Classes.
              </p>
            </div>
            <button onClick={() => setShowCreateScenarioForm((prev) => !prev)}>
              {showCreateScenarioForm ? 'Hide New Scenario' : 'New Training Scenario'}
            </button>
          </div>
        </section>

        {showCreateScenarioForm ? (
          <section className="page-section compact-form-shell" style={{ maxWidth: '760px' }}>
            <h3>Create Training Scenario</h3>
            <p className="section-note">
              Give coaches a reusable setup they can pull into planning or live class logs later.
            </p>

            <form className="form-grid" onSubmit={handleCreateScenario}>
              <div>
                <label>Program</label>
                <select
                  name="program_id"
                  value={scenarioFormData.program_id}
                  onChange={handleScenarioFormChange}
                >
                  <option value="">No Program</option>
                  {programs.filter((program) => program.is_active).map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Training Method</label>
                <select
                  name="training_method_id"
                  value={scenarioFormData.training_method_id}
                  onChange={handleScenarioFormChange}
                >
                  <option value="">Choose a training method</option>
                  {trainingMethods.filter((method) => method.is_active).map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Scenario Name</label>
                <input
                  type="text"
                  name="name"
                  value={scenarioFormData.name}
                  onChange={handleScenarioFormChange}
                />
                <div className="meta-text">
                  Use a specific name. Example: Shrimping - 45 Second Warmup
                </div>
              </div>

              <div>
                <label>Starting Position Topic</label>
                <select
                  name="starting_position_topic_id"
                  value={scenarioFormData.starting_position_topic_id}
                  onChange={handleScenarioFormChange}
                >
                  <option value="">No starting topic</option>
                  {getTopicsForScenarioProgram(scenarioFormData.program_id).map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Top Objective</label>
                <input
                  type="text"
                  name="top_objective"
                  value={scenarioFormData.top_objective}
                  onChange={handleScenarioFormChange}
                />
              </div>

              <div>
                <label>Bottom Objective</label>
                <input
                  type="text"
                  name="bottom_objective"
                  value={scenarioFormData.bottom_objective}
                  onChange={handleScenarioFormChange}
                />
              </div>

              <div>
                <label>Round Duration (seconds)</label>
                <input
                  type="number"
                  name="round_duration_seconds"
                  value={scenarioFormData.round_duration_seconds}
                  onChange={handleScenarioFormChange}
                  min="1"
                />
              </div>

              <div>
                <label>Description</label>
                <textarea
                  name="description"
                  value={scenarioFormData.description}
                  onChange={handleScenarioFormChange}
                  rows="3"
                />
              </div>

              <div>
                <label>Constraints</label>
                <textarea
                  name="constraints_text"
                  value={scenarioFormData.constraints_text}
                  onChange={handleScenarioFormChange}
                  rows="3"
                />
              </div>

              <div className="inline-actions">
                <button type="submit" disabled={scenarioSubmitting}>
                  {scenarioSubmitting ? 'Creating...' : 'Create Training Scenario'}
                </button>
              </div>
            </form>

            {scenarioMessage ? <p className="success-text">{scenarioMessage}</p> : null}
            {scenarioError ? <p className="error-text">{scenarioError}</p> : null}
          </section>
        ) : null}

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>Existing Training Scenarios</h3>
              <p className="section-note">
                These scenarios are ready to reuse in Planned Classes and Completed Classes.
              </p>
            </div>
            <button
              className="secondary-button"
              onClick={() => setShowInactiveScenarios((prev) => !prev)}
            >
              {showInactiveScenarios ? 'Hide Inactive Scenarios' : 'Show Inactive Scenarios'}
            </button>
          </div>

          <p className="section-note" style={{ marginBottom: '14px' }}>
            If a scenario is no longer part of your current rotation, make it inactive so your past
            class history stays intact.
          </p>

          {loading ? (
            <p className="empty-state">Loading training scenarios...</p>
          ) : orderedScenarios.length === 0 ? (
            <p className="empty-state">No training scenarios have been added yet.</p>
          ) : (
            <ul className="card-list">
              {orderedScenarios.map((scenario) => (
                <li key={scenario.id} className="card-item compact-topic-card">
                  <div className="compact-topic-header">
                    <div>
                      <strong>{scenario.name}</strong>
                      <div className="meta-text compact-topic-meta">
                        {(scenario.training_method_name || 'No method')}
                        {' • '}
                        {(scenario.program_name || 'No Program')}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => toggleScenarioDetails(scenario.id)}
                    >
                      {expandedScenarioDetails[scenario.id] ? 'Hide details' : 'Show details'}
                    </button>
                  </div>
                  {expandedScenarioDetails[scenario.id] ? (
                    <div className="detail-block">
                      <div className="meta-text">
                        Starting Topic: {scenario.starting_position_title || 'None'}
                      </div>
                      <div className="meta-text">
                        Duration: {scenario.round_duration_seconds || 'None'} seconds
                      </div>
                      <div className="meta-text">
                        Active: {scenario.is_active ? 'Yes' : 'No'}
                      </div>
                      <div><strong>Description:</strong> {scenario.description || 'None'}</div>
                      <div><strong>Top Objective:</strong> {scenario.top_objective || 'None'}</div>
                      <div><strong>Bottom Objective:</strong> {scenario.bottom_objective || 'None'}</div>
                      <div><strong>Constraints:</strong> {scenario.constraints_text || 'None'}</div>
                    </div>
                  ) : null}

                  <div className="inline-actions">
                    <button
                      className="secondary-button"
                      onClick={() => toggleEditScenario(scenario)}
                    >
                      {editingScenarios[scenario.id] ? 'Hide Edit Scenario' : 'Edit Scenario'}
                    </button>

                  {scenario.is_active ? (
                    <button
                      className="danger-button"
                      onClick={() => handleDeactivateScenario(scenario.id)}
                    >
                      Deactivate Scenario
                    </button>
                  ) : null}
                  <button
                    className="danger-button"
                    onClick={() => handleDeleteScenario(scenario.id)}
                  >
                    Delete Scenario
                  </button>
                </div>

                  {scenarioFeedbackMap[scenario.id]?.message ? (
                    <p className="success-text">{scenarioFeedbackMap[scenario.id].message}</p>
                  ) : null}
                  {scenarioFeedbackMap[scenario.id]?.error ? (
                    <p className="error-text">{scenarioFeedbackMap[scenario.id].error}</p>
                  ) : null}

                  {editingScenarios[scenario.id] ? (
                    <div className="detail-block">
                      <section className="page-section compact-form-shell">
                        <h4>Edit Training Scenario</h4>

                        <form
                          className="form-grid"
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdateScenario(scenario.id);
                          }}
                        >
                          <div>
                            <label>Program</label>
                            <select
                              name="program_id"
                              value={editScenarioMap[scenario.id]?.program_id || ''}
                              onChange={(e) => handleEditScenarioChange(scenario.id, e)}
                            >
                              <option value="">No Program</option>
                              {programs.filter((program) => program.is_active).map((program) => (
                                <option key={program.id} value={program.id}>
                                  {program.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label>Training Method</label>
                            <select
                              name="training_method_id"
                              value={editScenarioMap[scenario.id]?.training_method_id || ''}
                              onChange={(e) => handleEditScenarioChange(scenario.id, e)}
                            >
                              <option value="">Choose a training method</option>
                              {trainingMethods.filter((method) => method.is_active).map((method) => (
                                <option key={method.id} value={method.id}>
                                  {method.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label>Scenario Name</label>
                            <input
                              type="text"
                              name="name"
                              value={editScenarioMap[scenario.id]?.name || ''}
                              onChange={(e) => handleEditScenarioChange(scenario.id, e)}
                            />
                          </div>

                          <div>
                            <label>Starting Position Topic</label>
                            <select
                              name="starting_position_topic_id"
                              value={editScenarioMap[scenario.id]?.starting_position_topic_id || ''}
                              onChange={(e) => handleEditScenarioChange(scenario.id, e)}
                            >
                              <option value="">No starting topic</option>
                              {getTopicsForScenarioProgram(
                                editScenarioMap[scenario.id]?.program_id
                              ).map((topic) => (
                                <option key={topic.id} value={topic.id}>
                                  {topic.title}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label>Top Objective</label>
                            <input
                              type="text"
                              name="top_objective"
                              value={editScenarioMap[scenario.id]?.top_objective || ''}
                              onChange={(e) => handleEditScenarioChange(scenario.id, e)}
                            />
                          </div>

                          <div>
                            <label>Bottom Objective</label>
                            <input
                              type="text"
                              name="bottom_objective"
                              value={editScenarioMap[scenario.id]?.bottom_objective || ''}
                              onChange={(e) => handleEditScenarioChange(scenario.id, e)}
                            />
                          </div>

                          <div>
                            <label>Round Duration (seconds)</label>
                            <input
                              type="number"
                              name="round_duration_seconds"
                              value={editScenarioMap[scenario.id]?.round_duration_seconds || ''}
                              onChange={(e) => handleEditScenarioChange(scenario.id, e)}
                              min="1"
                            />
                          </div>

                          <div>
                            <label>Description</label>
                            <textarea
                              name="description"
                              value={editScenarioMap[scenario.id]?.description || ''}
                              onChange={(e) => handleEditScenarioChange(scenario.id, e)}
                              rows="3"
                            />
                          </div>

                          <div>
                            <label>Constraints</label>
                            <textarea
                              name="constraints_text"
                              value={editScenarioMap[scenario.id]?.constraints_text || ''}
                              onChange={(e) => handleEditScenarioChange(scenario.id, e)}
                              rows="3"
                            />
                          </div>

                          <div>
                            <label>Active Status</label>
                            <select
                              name="is_active"
                              value={editScenarioMap[scenario.id]?.is_active || 'true'}
                              onChange={(e) => handleEditScenarioChange(scenario.id, e)}
                            >
                              <option value="true">Active</option>
                              <option value="false">Inactive</option>
                            </select>
                          </div>

                          <div className="inline-actions">
                            <button type="submit">Save Scenario</button>
                          </div>
                        </form>
                      </section>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Layout>
  );
}
