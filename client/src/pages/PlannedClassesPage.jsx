import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import TopicSearchSelect from '../components/TopicSearchSelect';
import { useAuth } from '../hooks/useAuth';
import { formatLabel } from '../utils/formatLabel';

export default function PlannedClassesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [plannedClasses, setPlannedClasses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [topics, setTopics] = useState([]);
  const [trainingScenarios, setTrainingScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingPlannedClassId, setEditingPlannedClassId] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);
  const [formData, setFormData] = useState({
    program_id: '',
    training_scenario_id: '',
    title: '',
    class_date: '',
    start_time: '',
    end_time: '',
    head_coach_user_id: user?.id || '',
    notes: ''
  });
  const [quickAddData, setQuickAddData] = useState({
    title: '',
    topic_type: 'technique'
  });

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';

    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }

    const normalizedDate = new Date(dateValue);

    if (Number.isNaN(normalizedDate.getTime())) {
      return '';
    }

    return normalizedDate.toISOString().split('T')[0];
  };

  const formatDateForDisplay = (dateValue) => {
    if (!dateValue) return 'Date not set';

    const normalizedDate = new Date(`${formatDateForInput(dateValue)}T00:00:00`);

    if (Number.isNaN(normalizedDate.getTime())) {
      return 'Date not set';
    }

    return normalizedDate.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimeForDisplay = (timeValue) => {
    if (!timeValue) return 'Time not set';

    const normalizedDate = new Date(`1970-01-01T${timeValue}`);

    if (Number.isNaN(normalizedDate.getTime())) {
      return timeValue;
    }

    return normalizedDate.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const fetchPlannedClasses = async () => {
    const response = await api.get('/planned-classes');
    setPlannedClasses(response.data);
  };

  const fetchPrograms = async () => {
    const response = await api.get('/programs');
    setPrograms(response.data);
  };

  const fetchTopics = async () => {
    const response = await api.get('/topics');
    setTopics(response.data);
  };

  const fetchTrainingScenarios = async () => {
    const response = await api.get('/training-scenarios');
    setTrainingScenarios(response.data);
  };

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError('');

        await Promise.all([
          fetchPlannedClasses(),
          fetchPrograms(),
          fetchTopics(),
          fetchTrainingScenarios()
        ]);
      } catch (err) {
        console.error('Load planned classes page error:', err);
        setError(err.response?.data?.message || 'Couldn\'t load planned classes right now.');
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  useEffect(() => {
    if (user?.id) {
      setFormData((prev) => ({
        ...prev,
        head_coach_user_id: user.id
      }));
    }
  }, [user]);

  const activePrograms = useMemo(
    () => programs.filter((program) => program.is_active),
    [programs]
  );

  const availableTopics = useMemo(() => {
    return topics.filter((topic) => {
      if (!topic.is_active) return false;
      if (!formData.program_id) return true;
      return !topic.program_id || String(topic.program_id) === String(formData.program_id);
    });
  }, [formData.program_id, topics]);

  const availableScenarios = useMemo(() => {
    return trainingScenarios.filter((scenario) => {
      if (!scenario.is_active) return false;
      if (!formData.program_id) return true;
      return !scenario.program_id || String(scenario.program_id) === String(formData.program_id);
    });
  }, [formData.program_id, trainingScenarios]);

  const groupedPlannedClasses = useMemo(() => {
    const sorted = [...plannedClasses].sort((a, b) => {
      const left = new Date(`${a.class_date}T${a.start_time || '00:00:00'}`).getTime();
      const right = new Date(`${b.class_date}T${b.start_time || '00:00:00'}`).getTime();
      return left - right;
    });

    return sorted.reduce((acc, plannedClass) => {
      if (!acc[plannedClass.class_date]) {
        acc[plannedClass.class_date] = [];
      }

      acc[plannedClass.class_date].push(plannedClass);
      return acc;
    }, {});
  }, [plannedClasses]);

  const planSummaryCards = useMemo(() => {
    const today = formatDateForInput(new Date());
    const plannedItems = plannedClasses.filter((plannedClass) => plannedClass.status === 'planned');
    const completedItems = plannedClasses.filter((plannedClass) => plannedClass.status === 'completed');
    const upcomingItems = plannedItems.filter((plannedClass) => {
      const classDate = formatDateForInput(plannedClass.class_date);
      return classDate && classDate >= today;
    });

    return [
      { label: 'Upcoming plans', value: upcomingItems.length },
      { label: 'Completed plans', value: completedItems.length },
      { label: 'Active programs', value: activePrograms.length },
      { label: 'Topics in this plan', value: selectedTopicIds.length }
    ];
  }, [activePrograms.length, plannedClasses, selectedTopicIds.length]);

  const resetForm = () => {
    setEditingPlannedClassId(null);
    setSelectedTopicId('');
    setSelectedTopicIds([]);
    setFormData({
      program_id: '',
      training_scenario_id: '',
      title: '',
      class_date: '',
      start_time: '',
      end_time: '',
      head_coach_user_id: user?.id || '',
      notes: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: value
      };

      if (name === 'program_id') {
        next.training_scenario_id = '';
      }

      return next;
    });
  };

  const handleAddTopic = (topicId) => {
    if (!topicId) return;

    setSelectedTopicIds((prev) => {
      if (prev.includes(String(topicId))) {
        return prev;
      }

      return [...prev, String(topicId)];
    });

    setSelectedTopicId('');
  };

  const handleRemoveTopic = (topicId) => {
    setSelectedTopicIds((prev) => prev.filter((id) => String(id) !== String(topicId)));
  };

  const handleQuickAddChange = (e) => {
    setQuickAddData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleOpenQuickAdd = (title) => {
    setQuickAddData({
      title,
      topic_type: 'technique'
    });
    setShowQuickAdd(true);
    setMessage('');
    setError('');
  };

  const handleCreateTopic = async () => {
    if (!quickAddData.title.trim()) {
      setError('Add a topic title before creating it.');
      return;
    }

    try {
      setIsCreatingTopic(true);
      setMessage('');
      setError('');

      const response = await api.post('/topics', {
        program_id: formData.program_id ? Number(formData.program_id) : null,
        parent_topic_id: null,
        title: quickAddData.title.trim(),
        topic_type: quickAddData.topic_type,
        description: ''
      });

      const createdTopic = response.data?.topic;

      await fetchTopics();

      if (createdTopic?.id) {
        setSelectedTopicId(String(createdTopic.id));
        setSelectedTopicIds((prev) => {
          if (prev.includes(String(createdTopic.id))) {
            return prev;
          }

          return [...prev, String(createdTopic.id)];
        });
      }

      setShowQuickAdd(false);
      setQuickAddData({
        title: '',
        topic_type: 'technique'
      });
      setMessage('Topic created and added to this class plan successfully.');
    } catch (err) {
      console.error('Create planned class topic error:', err);
      setError(err.response?.data?.message || 'Couldn\'t create that topic just now.');
    } finally {
      setIsCreatingTopic(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        ...formData,
        class_date: formatDateForInput(formData.class_date),
        topic_ids: selectedTopicIds
      };

      if (editingPlannedClassId) {
        await api.put(`/planned-classes/${editingPlannedClassId}`, payload);
        setMessage('Planned class updated successfully.');
      } else {
        await api.post('/planned-classes', payload);
        setMessage('Planned class created successfully.');
      }

      resetForm();
      await fetchPlannedClasses();
    } catch (err) {
      console.error('Save planned class error:', err);
      setError(err.response?.data?.message || 'Couldn\'t save that planned class just now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (plannedClass) => {
    setEditingPlannedClassId(plannedClass.id);
    setSelectedTopicId('');
    setSelectedTopicIds(
      (plannedClass.topics || []).map((topic) => String(topic.curriculum_topic_id))
    );
    setFormData({
      program_id: plannedClass.program_id ? String(plannedClass.program_id) : '',
      training_scenario_id: plannedClass.training_scenario_id
        ? String(plannedClass.training_scenario_id)
        : '',
      title: plannedClass.title || '',
      class_date: formatDateForInput(plannedClass.class_date),
      start_time: plannedClass.start_time || '',
      end_time: plannedClass.end_time || '',
      head_coach_user_id: plannedClass.head_coach_user_id
        ? String(plannedClass.head_coach_user_id)
        : user?.id || '',
      notes: plannedClass.notes || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (plannedClassId) => {
    const confirmed = window.confirm(
      'Delete this planned class? This will only remove the plan and will not touch completed class logs.'
    );

    if (!confirmed) return;

    try {
      setError('');
      setMessage('');
      await api.delete(`/planned-classes/${plannedClassId}`);
      setMessage('Planned class removed successfully.');

      if (editingPlannedClassId === plannedClassId) {
        resetForm();
      }

      await fetchPlannedClasses();
    } catch (err) {
      console.error('Delete planned class error:', err);
      setError(err.response?.data?.message || 'Couldn\'t remove that planned class just now.');
    }
  };

  const handleComplete = async (plannedClassId) => {
    const confirmed = window.confirm(
      'Complete this planned class now? This will create the live class entry and open it in Classes so you can add attendance.'
    );

    if (!confirmed) return;

    try {
      setError('');
      setMessage('');

      const response = await api.post(`/planned-classes/${plannedClassId}/complete`);
      await fetchPlannedClasses();

      navigate(`/classes?openClassId=${response.data.classId}`);
    } catch (err) {
      console.error('Complete planned class error:', err);
      setError(err.response?.data?.message || 'Couldn\'t complete that planned class just now.');
    }
  };

  const selectedTopics = selectedTopicIds
    .map((topicId) => availableTopics.find((topic) => String(topic.id) === String(topicId)))
    .filter(Boolean);

  return (
    <Layout>
      <div className="planned-classes-page">
        <h2 className="page-title">Planned Classes</h2>
        <p className="page-intro">
          Map out upcoming classes, tie them to scenarios and topics, then complete the plan after class and finish attendance inside the regular class workflow.
        </p>

        <section className="stats-grid planned-classes-stats-grid">
          {planSummaryCards.map((card) => (
            <div key={card.label} className="stat-card">
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
            </div>
          ))}
        </section>

        <section className="page-section planned-classes-form-section">
          <div className="section-header">
            <div>
              <h3>{editingPlannedClassId ? 'Edit planned class' : 'Create planned class'}</h3>
              <p className="section-note">
                Choose a program first so the scenario and topic pickers stay focused on the right part of your curriculum.
              </p>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
          <div>
            <label>Program</label>
            <select
              name="program_id"
              value={formData.program_id}
              onChange={handleChange}
              required
            >
              <option value="">Choose a program</option>
              {activePrograms.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Training Scenario</label>
            <select
              name="training_scenario_id"
              value={formData.training_scenario_id}
              onChange={handleChange}
            >
              <option value="">No scenario</option>
              {availableScenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
            <p className="section-note planned-classes-inline-note">
              {formData.program_id
                ? (availableScenarios.length > 0
                    ? `${availableScenarios.length} matching scenario${availableScenarios.length === 1 ? '' : 's'} available for this program.`
                    : 'No matching scenarios yet for this program.')
                : 'You can leave this blank or choose a scenario to seed class training entries later.'}
            </p>
          </div>

          <div>
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Optional class title"
            />
          </div>

          <div>
            <label>Class date</label>
            <input
              type="date"
              name="class_date"
              value={formData.class_date}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Start time</label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>End time</label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label>Topics</label>
            <TopicSearchSelect
              topics={availableTopics}
              value={selectedTopicId}
              onChange={setSelectedTopicId}
              placeholder="Search topics..."
              emptySelectionLabel="No topic selected yet"
              helperText="Choose a topic, then click Add Topic below."
              onCreateOption={handleOpenQuickAdd}
            />

            <div className="button-row planned-classes-topic-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => handleAddTopic(selectedTopicId)}
                disabled={!selectedTopicId}
              >
                Add Topic
              </button>

              {selectedTopics.length > 0 ? (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setSelectedTopicIds([])}
                >
                  Clear topics
                </button>
              ) : null}
            </div>

            <p className="section-note planned-classes-inline-note">
              {formData.program_id
                ? `${availableTopics.length} matching topic${availableTopics.length === 1 ? '' : 's'} available for this program.`
                : 'Choose a program to narrow the topic list, or search across all active topics.'}
            </p>

            {selectedTopics.length > 0 ? (
              <>
                <p className="section-note planned-classes-inline-note">
                  {selectedTopics.length} topic{selectedTopics.length === 1 ? '' : 's'} selected for this class plan.
                </p>
                <div className="suggestion-chip-row planned-classes-selected-topics">
                {selectedTopics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    className="suggestion-chip selected"
                    onClick={() => handleRemoveTopic(topic.id)}
                    title="Remove topic"
                  >
                    {topic.title}
                  </button>
                ))}
                </div>
              </>
            ) : (
              <p className="section-note">No topics added yet.</p>
            )}

            {showQuickAdd ? (
              <div className="quick-add-panel" style={{ marginTop: '14px' }}>
                <label>New Topic Title</label>
                <input
                  type="text"
                  name="title"
                  value={quickAddData.title}
                  onChange={handleQuickAddChange}
                />

                <label>Topic Type</label>
                <select
                  name="topic_type"
                  value={quickAddData.topic_type}
                  onChange={handleQuickAddChange}
                >
                  <option value="position">{formatLabel('position')}</option>
                  <option value="technique">{formatLabel('technique')}</option>
                  <option value="concept">{formatLabel('concept')}</option>
                  <option value="submission">{formatLabel('submission')}</option>
                  <option value="escape">{formatLabel('escape')}</option>
                  <option value="takedown">{formatLabel('takedown')}</option>
                  <option value="drill_theme">{formatLabel('drill_theme')}</option>
                </select>

                <div className="inline-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleCreateTopic}
                    disabled={isCreatingTopic}
                  >
                    {isCreatingTopic ? 'Creating Topic...' : 'Create Topic'}
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setShowQuickAdd(false)}
                    disabled={isCreatingTopic}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Optional notes, coaching reminders, or class goals"
            />
          </div>

          <div className="button-row">
            <button type="submit" disabled={submitting}>
              {submitting
                ? (editingPlannedClassId ? 'Saving...' : 'Creating...')
                : (editingPlannedClassId ? 'Save Planned Class' : 'Create Planned Class')}
            </button>

            {editingPlannedClassId ? (
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel edit
              </button>
            ) : null}
          </div>
          </form>

          {message ? <p className="success-text">{message}</p> : null}
          {error ? <p className="error-text">{error}</p> : null}
        </section>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>Upcoming planned classes</h3>
              <p className="section-note">
                Review what is coming up, make quick edits, or complete a plan once class is finished.
              </p>
            </div>
          </div>

          {loading ? <p>Loading planned classes...</p> : null}

          {!loading && Object.keys(groupedPlannedClasses).length === 0 ? (
            <p className="empty-state">No planned classes have been added yet.</p>
          ) : null}

          {!loading && Object.entries(groupedPlannedClasses).map(([date, classesForDate]) => (
            <div key={date} className="detail-block">
              <h4>{formatDateForDisplay(date)}</h4>

              <div className="card-list">
                {classesForDate.map((plannedClass) => (
                  <article key={plannedClass.id} className="item-card">
                    <div className="item-header">
                      <div>
                        <h4>{plannedClass.title || plannedClass.program_name}</h4>
                        <p className="meta-text">
                          {formatTimeForDisplay(plannedClass.start_time)}
                          {plannedClass.end_time
                            ? ` - ${formatTimeForDisplay(plannedClass.end_time)}`
                            : ''}
                        </p>
                      </div>

                      <span className={`status-badge${plannedClass.status === 'completed' ? ' inactive' : ''}`}>
                        {formatLabel(plannedClass.status)}
                      </span>
                    </div>

                    <div className="planned-class-meta-grid">
                      <p>
                        <strong>Program:</strong> {plannedClass.program_name}
                      </p>
                      <p>
                        <strong>Head coach:</strong> {plannedClass.head_coach_first_name} {plannedClass.head_coach_last_name}
                      </p>
                      <p>
                        <strong>Scenario:</strong> {plannedClass.training_scenario_name || 'No scenario planned'}
                      </p>
                      <p>
                        <strong>Topics:</strong>{' '}
                        {plannedClass.topics.length > 0
                          ? `${plannedClass.topics.length} planned`
                          : 'No topics planned yet'}
                      </p>
                    </div>

                    {plannedClass.topics.length > 0 ? (
                      <div className="suggestion-chip-row planned-classes-card-topics">
                        {plannedClass.topics.map((topic) => (
                          <span key={`${plannedClass.id}-${topic.curriculum_topic_id}`} className="suggestion-chip">
                            {topic.title}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {plannedClass.notes ? (
                      <p>
                        <strong>Notes:</strong> {plannedClass.notes}
                      </p>
                    ) : null}

                    <div className="button-row">
                      {plannedClass.status === 'planned' ? (
                        <>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => handleEdit(plannedClass)}
                          >
                            Edit plan
                          </button>
                          <button
                            type="button"
                            onClick={() => handleComplete(plannedClass.id)}
                          >
                            Complete class
                          </button>
                          <button
                            type="button"
                            className="danger-button"
                            onClick={() => handleDelete(plannedClass.id)}
                          >
                            Remove plan
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => navigate(`/classes?openClassId=${plannedClass.completed_class_id}`)}
                        >
                          Open completed class
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </Layout>
  );
}
