import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import ClassTopicsForm from '../components/ClassTopicsForm';
import ClassTrainingEntriesForm from '../components/ClassTrainingEntriesForm';
import ClassAttendanceForm from '../components/ClassAttendanceForm';

export default function ClassesPage() {
  const { user } = useAuth();

  const [classes, setClasses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [trainingMethods, setTrainingMethods] = useState([]);
  const [trainingScenarios, setTrainingScenarios] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [classTopicsMap, setClassTopicsMap] = useState({});
  const [classTrainingEntriesMap, setClassTrainingEntriesMap] = useState({});
  const [classMembersMap, setClassMembersMap] = useState({});
  const [expandedClasses, setExpandedClasses] = useState({});
  const [editClassMap, setEditClassMap] = useState({});
  const [classFeedbackMap, setClassFeedbackMap] = useState({});
  const [editingScenarios, setEditingScenarios] = useState({});
  const [editScenarioMap, setEditScenarioMap] = useState({});
  const [showAllClasses, setShowAllClasses] = useState(false);
  const [showInactiveScenarios, setShowInactiveScenarios] = useState(false);
  const [classSearch, setClassSearch] = useState('');

  const [formData, setFormData] = useState({
    program_id: '',
    title: '',
    class_date: '',
    start_time: '',
    end_time: '',
    head_coach_user_id: user?.id || '',
    notes: ''
  });

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

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scenarioSubmitting, setScenarioSubmitting] = useState(false);
  const [classMessage, setClassMessage] = useState('');
  const [error, setError] = useState('');
  const [scenarioError, setScenarioError] = useState('');
  const [scenarioMessage, setScenarioMessage] = useState('');

  const clearClassFeedback = (classId) => {
    setClassFeedbackMap((prev) => ({
      ...prev,
      [classId]: {
        message: '',
        error: ''
      }
    }));
  };

  const setClassFeedback = (classId, nextFeedback) => {
    setClassFeedbackMap((prev) => ({
      ...prev,
      [classId]: {
        message: nextFeedback.message || '',
        error: nextFeedback.error || ''
      }
    }));
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (err) {
      console.error('Fetch classes error:', err);
      setError(err.response?.data?.message || 'Failed to load classes');
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

  const fetchAllTopics = async () => {
    try {
      const response = await api.get('/topics');
      setAllTopics(response.data);
    } catch (err) {
      console.error('Fetch all topics error:', err);
      setError(err.response?.data?.message || 'Failed to load topics');
    }
  };

  const fetchTrainingMethods = async () => {
    try {
      const response = await api.get('/training-methods');
      setTrainingMethods(response.data);
    } catch (err) {
      console.error('Fetch training methods error:', err);
      setError(err.response?.data?.message || 'Failed to load training methods');
    }
  };

  const fetchTrainingScenarios = async () => {
    try {
      const response = await api.get('/training-scenarios');
      setTrainingScenarios(response.data);
    } catch (err) {
      console.error('Fetch training scenarios error:', err);
      setError(err.response?.data?.message || 'Failed to load training scenarios');
    }
  };

  const fetchAllMembers = async () => {
    try {
      const response = await api.get('/members');
      setAllMembers(response.data);
    } catch (err) {
      console.error('Fetch members error:', err);
      setError(err.response?.data?.message || 'Failed to load members');
    }
  };

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError('');
        await Promise.all([
          fetchClasses(),
          fetchPrograms(),
          fetchAllTopics(),
          fetchTrainingMethods(),
          fetchTrainingScenarios(),
          fetchAllMembers()
        ]);
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

  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => {
      const dateA = new Date(`${a.class_date}T${a.start_time || '00:00:00'}`).getTime();
      const dateB = new Date(`${b.class_date}T${b.start_time || '00:00:00'}`).getTime();
      return dateB - dateA;
    });
  }, [classes]);

  const filteredClasses = useMemo(() => {
    const searchTerm = classSearch.trim().toLowerCase();

    if (!searchTerm) {
      return sortedClasses;
    }

    return sortedClasses.filter((classItem) => {
      const coachName = `${classItem.head_coach_first_name || ''} ${
        classItem.head_coach_last_name || ''
      }`
        .trim()
        .toLowerCase();
      const dateText = classItem.class_date
        ? new Date(classItem.class_date).toLocaleDateString().toLowerCase()
        : '';

      return (
        (classItem.title || '').toLowerCase().includes(searchTerm) ||
        (classItem.program_name || '').toLowerCase().includes(searchTerm) ||
        coachName.includes(searchTerm) ||
        (classItem.class_date || '').toLowerCase().includes(searchTerm) ||
        dateText.includes(searchTerm)
      );
    });
  }, [classSearch, sortedClasses]);

  const visibleClasses = classSearch.trim()
    ? filteredClasses
    : showAllClasses
      ? sortedClasses
      : sortedClasses.slice(0, 20);

  const orderedScenarios = useMemo(() => {
    const active = trainingScenarios.filter((scenario) => scenario.is_active);
    const inactive = trainingScenarios.filter((scenario) => !scenario.is_active);

    return showInactiveScenarios ? [...active, ...inactive] : active;
  }, [trainingScenarios, showInactiveScenarios]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setClassMessage('');
    setError('');

    try {
      const payload = {
        program_id: Number(formData.program_id),
        title: formData.title,
        class_date: formData.class_date,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        head_coach_user_id: Number(formData.head_coach_user_id),
        notes: formData.notes
      };

      await api.post('/classes', payload);

      setFormData({
        program_id: '',
        title: '',
        class_date: '',
        start_time: '',
        end_time: '',
        head_coach_user_id: user?.id || '',
        notes: ''
      });

      await fetchClasses();
      setClassMessage('Class created successfully.');
    } catch (err) {
      console.error('Create class error:', err);
      setError(err.response?.data?.message || 'Failed to create class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateScenario = async (e) => {
    e.preventDefault();
    setScenarioSubmitting(true);
    setScenarioError('');
    setScenarioMessage('');

    try {
      const payload = {
        program_id: scenarioFormData.program_id
          ? Number(scenarioFormData.program_id)
          : null,
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

      setScenarioMessage('Training scenario created successfully.');
      await fetchTrainingScenarios();
    } catch (err) {
      console.error('Create training scenario error:', err);
      setScenarioError(
        err.response?.data?.message || 'Failed to create training scenario'
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
      setScenarioError('');
      setScenarioMessage('');

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

      setScenarioMessage('Training scenario updated successfully.');
    } catch (err) {
      console.error('Update training scenario error:', err);
      setScenarioError(
        err.response?.data?.message || 'Failed to update training scenario'
      );
    }
  };

  const handleDeactivateScenario = async (scenarioId) => {
    const confirmed = window.confirm(
      'Deactivate this training scenario? Existing class entries will remain, but this scenario will no longer be used for new entries.'
    );
    if (!confirmed) return;

    try {
      setScenarioError('');
      setScenarioMessage('');
      await api.patch(`/training-scenarios/${scenarioId}/deactivate`);
      await fetchTrainingScenarios();
      setScenarioMessage('Training scenario deactivated successfully.');
    } catch (err) {
      console.error('Deactivate training scenario error:', err);
      setScenarioError(
        err.response?.data?.message || 'Failed to deactivate training scenario'
      );
    }
  };

  const loadClassDetails = async (classId) => {
    try {
      const [topicsRes, trainingEntriesRes, membersRes] = await Promise.all([
        api.get(`/classes/${classId}/topics`),
        api.get(`/classes/${classId}/training-entries`),
        api.get(`/classes/${classId}/members`)
      ]);

      setClassTopicsMap((prev) => ({
        ...prev,
        [classId]: topicsRes.data
      }));

      setClassTrainingEntriesMap((prev) => ({
        ...prev,
        [classId]: trainingEntriesRes.data
      }));

      setClassMembersMap((prev) => ({
        ...prev,
        [classId]: membersRes.data
      }));
    } catch (err) {
      console.error('Load class details error:', err);
      setError(err.response?.data?.message || 'Failed to load class details');
    }
  };

  const toggleClassDetails = async (classItem) => {
    const classId = classItem.id;
    const isExpanded = expandedClasses[classId];

    if (
      !isExpanded &&
      (!classTopicsMap[classId] ||
        !classTrainingEntriesMap[classId] ||
        !classMembersMap[classId])
    ) {
      await loadClassDetails(classId);
    }

    if (!editClassMap[classId]) {
      setEditClassMap((prev) => ({
        ...prev,
        [classId]: {
          title: classItem.title || '',
          class_date: classItem.class_date
            ? new Date(classItem.class_date).toISOString().split('T')[0]
            : '',
          start_time: classItem.start_time || '',
          end_time: classItem.end_time || '',
          notes: classItem.notes || ''
        }
      }));
    }

    setExpandedClasses((prev) => ({
      ...prev,
      [classId]: !prev[classId]
    }));
  };

  const handleEditClassChange = (classId, e) => {
    const { name, value } = e.target;

    setEditClassMap((prev) => ({
      ...prev,
      [classId]: {
        ...prev[classId],
        [name]: value
      }
    }));
  };

  const handleUpdateClass = async (classItem) => {
    try {
      clearClassFeedback(classItem.id);
      setError('');

      const editData = editClassMap[classItem.id];

      const payload = {
        program_id: classItem.program_id,
        title: editData.title,
        class_date: editData.class_date,
        start_time: editData.start_time || null,
        end_time: editData.end_time || null,
        head_coach_user_id: classItem.head_coach_user_id,
        notes: editData.notes || ''
      };

      await api.put(`/classes/${classItem.id}`, payload);
      await fetchClasses();
      setClassFeedback(classItem.id, {
        message: 'Class updated successfully.',
        error: ''
      });
    } catch (err) {
      console.error('Update class error:', err);
      setClassFeedback(classItem.id, {
        message: '',
        error: err.response?.data?.message || 'Failed to update class'
      });
    }
  };

  const getTopicsForClass = (classItem) => {
    return allTopics.filter((topic) => {
      return (
        topic.program_id === null ||
        String(topic.program_id) === String(classItem.program_id)
      );
    });
  };

  const getScenariosForClass = (classItem) => {
    return trainingScenarios.filter((scenario) => {
      return (
        scenario.is_active &&
        (
          scenario.program_id === null ||
          String(scenario.program_id) === String(classItem.program_id)
        )
      );
    });
  };

  const getMembersForClass = (classItem) => {
    return allMembers.filter((member) => {
      return (
        member.program_id === null ||
        String(member.program_id) === String(classItem.program_id)
      );
    });
  };

  const getTopicsForScenarioProgram = (programId) => {
    if (!programId) {
      return allTopics.filter((topic) => topic.is_active);
    }

    return allTopics.filter((topic) => {
      return (
        topic.is_active &&
        (
          topic.program_id === null ||
          String(topic.program_id) === String(programId)
        )
      );
    });
  };

  const handleDeleteClassTopic = async (classId, topicEntryId) => {
    const confirmed = window.confirm('Remove this topic from the class?');
    if (!confirmed) return;

    try {
      clearClassFeedback(classId);
      setError('');
      await api.delete(`/classes/${classId}/topics/${topicEntryId}`);
      await loadClassDetails(classId);
      setClassFeedback(classId, {
        message: 'Topic removed from class.',
        error: ''
      });
    } catch (err) {
      console.error('Delete class topic error:', err);
      setClassFeedback(classId, {
        message: '',
        error: err.response?.data?.message || 'Failed to delete class topic'
      });
    }
  };

  const handleDeleteTrainingEntry = async (classId, entryId) => {
    const confirmed = window.confirm('Remove this training entry from the class?');
    if (!confirmed) return;

    try {
      clearClassFeedback(classId);
      setError('');
      await api.delete(`/classes/${classId}/training-entries/${entryId}`);
      await loadClassDetails(classId);
      setClassFeedback(classId, {
        message: 'Training entry removed from class.',
        error: ''
      });
    } catch (err) {
      console.error('Delete training entry error:', err);
      setClassFeedback(classId, {
        message: '',
        error: err.response?.data?.message || 'Failed to delete training entry'
      });
    }
  };

  const handleDeleteClassMember = async (classId, classMemberId) => {
    const confirmed = window.confirm('Remove this attendance record from the class?');
    if (!confirmed) return;

    try {
      clearClassFeedback(classId);
      setError('');
      await api.delete(`/classes/${classId}/members/${classMemberId}`);
      await loadClassDetails(classId);
      setClassFeedback(classId, {
        message: 'Attendance removed from class.',
        error: ''
      });
    } catch (err) {
      console.error('Delete class member error:', err);
      setClassFeedback(classId, {
        message: '',
        error: err.response?.data?.message || 'Failed to remove class member'
      });
    }
  };

  return (
    <Layout>
      <h2 className="page-title">Classes</h2>

      <section className="page-section" style={{ maxWidth: '760px' }}>
        <h3>Create Class</h3>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div>
            <label>Program</label>
            <select
              name="program_id"
              value={formData.program_id}
              onChange={handleChange}
            >
              <option value="">Select Program</option>
              {programs.filter((program) => program.is_active).map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Class Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Class Date</label>
            <input
              type="date"
              name="class_date"
              value={formData.class_date}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Start Time</label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>End Time</label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>

        {classMessage && <p className="success-text">{classMessage}</p>}
        {error && <p className="error-text">{error}</p>}
      </section>

      <section className="page-section" style={{ maxWidth: '760px' }}>
        <h3>Create Training Scenario</h3>

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
              <option value="">Select Training Method</option>
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
              <option value="">No Starting Topic</option>
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

        {scenarioMessage && <p className="success-text">{scenarioMessage}</p>}
        {scenarioError && <p className="error-text">{scenarioError}</p>}
      </section>

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
          <h3 style={{ marginBottom: 0 }}>Existing Training Scenarios</h3>
          <button
            className="secondary-button"
            onClick={() => setShowInactiveScenarios((prev) => !prev)}
          >
            {showInactiveScenarios ? 'Hide Inactive Scenarios' : 'Show Inactive Scenarios'}
          </button>
        </div>

        {orderedScenarios.length === 0 ? (
          <p className="empty-state">No training scenarios found.</p>
        ) : (
          <ul className="card-list">
            {orderedScenarios.map((scenario) => (
              <li key={scenario.id} className="card-item">
                <strong>{scenario.name}</strong>
                <div className="detail-block">
                  <div className="meta-text">
                    Program: {scenario.program_name || 'No Program'}
                  </div>
                  <div className="meta-text">
                    Training Method: {scenario.training_method_name}
                  </div>
                  <div className="meta-text">
                    Starting Topic: {scenario.starting_position_title || 'None'}
                  </div>
                  <div className="meta-text">
                    Duration: {scenario.round_duration_seconds || 'None'} seconds
                  </div>
                  <div className="meta-text">
                    Active: {scenario.is_active ? 'Yes' : 'No'}
                  </div>
                  <div>Description: {scenario.description || 'None'}</div>
                  <div>Top Objective: {scenario.top_objective || 'None'}</div>
                  <div>Bottom Objective: {scenario.bottom_objective || 'None'}</div>
                  <div>Constraints: {scenario.constraints_text || 'None'}</div>
                </div>

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
                </div>

                {editingScenarios[scenario.id] && (
                  <div className="detail-block">
                    <section className="page-section">
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
                            <option value="">Select Training Method</option>
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
                            <option value="">No Starting Topic</option>
                            {getTopicsForScenarioProgram(editScenarioMap[scenario.id]?.program_id).map((topic) => (
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
                            <option value="true">active</option>
                            <option value="false">inactive</option>
                          </select>
                        </div>

                        <div className="inline-actions">
                          <button type="submit">Save Scenario</button>
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
          <h3 style={{ marginBottom: 0 }}>Class List</h3>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <input
              type="search"
              value={classSearch}
              onChange={(e) => setClassSearch(e.target.value)}
              placeholder="Search classes, programs, coach, or date"
              aria-label="Search classes"
              style={{ minWidth: '280px' }}
            />
            <button
              className="secondary-button"
              onClick={() => setShowAllClasses((prev) => !prev)}
            >
              {showAllClasses ? 'Show Recent 20 Classes' : 'Show Older Classes'}
            </button>
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Loading classes...</p>
        ) : visibleClasses.length === 0 ? (
          <p className="empty-state">
            {classSearch.trim() ? 'No classes match your search.' : 'No classes found.'}
          </p>
        ) : (
          <ul className="card-list">
            {visibleClasses.map((classItem) => (
              <li key={classItem.id} className="card-item">
                <strong>{classItem.title || 'Untitled Class'}</strong>

                <div className="detail-block">
                  <div className="meta-text">Program: {classItem.program_name}</div>
                  <div className="meta-text">
                    Coach: {classItem.head_coach_first_name} {classItem.head_coach_last_name}
                  </div>
                  <div className="meta-text">
                    Date: {new Date(classItem.class_date).toLocaleDateString()}
                  </div>
                  <div className="meta-text">
                    Time: {classItem.start_time || 'N/A'} - {classItem.end_time || 'N/A'}
                  </div>
                  <div>{classItem.notes || 'No notes'}</div>
                </div>

                <div className="inline-actions">
                  <button
                    className="secondary-button"
                    onClick={() => toggleClassDetails(classItem)}
                  >
                    {expandedClasses[classItem.id] ? 'Hide Class' : 'Manage Class'}
                  </button>
                </div>

                {expandedClasses[classItem.id] && (
                  <div className="detail-block">
                    <section className="page-section">
                      <h4>Edit Class Details</h4>

                      <form
                        className="form-grid"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleUpdateClass(classItem);
                        }}
                      >
                        <div>
                          <label>Class Title</label>
                          <input
                            type="text"
                            name="title"
                            value={editClassMap[classItem.id]?.title || ''}
                            onChange={(e) => handleEditClassChange(classItem.id, e)}
                          />
                        </div>

                        <div>
                          <label>Class Date</label>
                          <input
                            type="date"
                            name="class_date"
                            value={editClassMap[classItem.id]?.class_date || ''}
                            onChange={(e) => handleEditClassChange(classItem.id, e)}
                          />
                        </div>

                        <div>
                          <label>Start Time</label>
                          <input
                            type="time"
                            name="start_time"
                            value={editClassMap[classItem.id]?.start_time || ''}
                            onChange={(e) => handleEditClassChange(classItem.id, e)}
                          />
                        </div>

                        <div>
                          <label>End Time</label>
                          <input
                            type="time"
                            name="end_time"
                            value={editClassMap[classItem.id]?.end_time || ''}
                            onChange={(e) => handleEditClassChange(classItem.id, e)}
                          />
                        </div>

                        <div>
                          <label>Notes</label>
                          <textarea
                            name="notes"
                            value={editClassMap[classItem.id]?.notes || ''}
                            onChange={(e) => handleEditClassChange(classItem.id, e)}
                            rows="3"
                          />
                        </div>

                        <div className="inline-actions">
                          <button type="submit">Save Class Details</button>
                        </div>
                      </form>

                      {classFeedbackMap[classItem.id]?.message && (
                        <p className="success-text">
                          {classFeedbackMap[classItem.id].message}
                        </p>
                      )}
                      {classFeedbackMap[classItem.id]?.error && (
                        <p className="error-text">
                          {classFeedbackMap[classItem.id].error}
                        </p>
                      )}
                    </section>

                    <ClassAttendanceForm
                      classId={classItem.id}
                      members={getMembersForClass(classItem)}
                      onSuccess={() => loadClassDetails(classItem.id)}
                    />

                    <h4>Attendance</h4>
                    {classMembersMap[classItem.id]?.length ? (
                      <ul className="card-list">
                        {classMembersMap[classItem.id].map((member) => (
                          <li key={member.id} className="card-item">
                            <strong>{member.first_name} {member.last_name}</strong> — {member.attendance_status}
                            <div className="detail-block">
                              <div className="meta-text">Belt Rank: {member.belt_rank || 'None'}</div>
                            </div>
                            <div className="inline-actions">
                              <button
                                className="danger-button"
                                onClick={() => handleDeleteClassMember(classItem.id, member.id)}
                              >
                                Remove Attendance
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="empty-state">No members attached to this class.</p>
                    )}

                    <ClassTopicsForm
                      classId={classItem.id}
                      topics={getTopicsForClass(classItem)}
                      onSuccess={() => loadClassDetails(classItem.id)}
                    />

                    <ClassTrainingEntriesForm
                      classId={classItem.id}
                      trainingMethods={trainingMethods}
                      trainingScenarios={getScenariosForClass(classItem)}
                      topics={getTopicsForClass(classItem)}
                      onSuccess={() => loadClassDetails(classItem.id)}
                    />

                    <h4>Topics Covered</h4>
                    {classTopicsMap[classItem.id]?.length ? (
                      <ul className="card-list">
                        {classTopicsMap[classItem.id].map((topic) => (
                          <li key={topic.id} className="card-item">
                            <strong>{topic.topic_title}</strong> — {topic.topic_type} — {topic.coverage_type} — {topic.focus_level}
                            <div className="detail-block">
                              <div>{topic.notes || 'No notes'}</div>
                            </div>
                            <div className="inline-actions">
                              <button
                                className="danger-button"
                                onClick={() => handleDeleteClassTopic(classItem.id, topic.id)}
                              >
                                Remove Topic
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="empty-state">No topics logged for this class.</p>
                    )}

                    <h4>Training Entries</h4>
                    {classTrainingEntriesMap[classItem.id]?.length ? (
                      <ul className="card-list">
                        {classTrainingEntriesMap[classItem.id].map((entry) => (
                          <li key={entry.id} className="card-item">
                            <strong>{entry.segment_title || 'Untitled Segment'}</strong>
                            <div className="detail-block">
                              <div className="meta-text">Method: {entry.training_method_name}</div>
                              <div className="meta-text">Scenario: {entry.training_scenario_name || 'None'}</div>
                              <div className="meta-text">Topic: {entry.curriculum_topic_title || 'None'}</div>
                              <div className="meta-text">Order: {entry.segment_order}</div>
                              <div className="meta-text">Duration: {entry.duration_minutes || 0} minutes</div>
                              {entry.constraints_text && <div>Constraints: {entry.constraints_text}</div>}
                              {entry.win_condition_top && <div>Top Win: {entry.win_condition_top}</div>}
                              {entry.win_condition_bottom && <div>Bottom Win: {entry.win_condition_bottom}</div>}
                              {entry.notes && <div>Notes: {entry.notes}</div>}
                            </div>
                            <div className="inline-actions">
                              <button
                                className="danger-button"
                                onClick={() => handleDeleteTrainingEntry(classItem.id, entry.id)}
                              >
                                Remove Training Entry
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="empty-state">No training entries logged for this class.</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {!classSearch.trim() && !showAllClasses && sortedClasses.length > 20 && (
          <p className="meta-text" style={{ marginTop: '12px' }}>
            Showing the 20 most recent classes first.
          </p>
        )}
      </section>
    </Layout>
  );
}
