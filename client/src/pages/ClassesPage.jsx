import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
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

  const [formData, setFormData] = useState({
    program_id: '',
    title: '',
    class_date: '',
    start_time: '',
    end_time: '',
    head_coach_user_id: user?.id || '',
    notes: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
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
    } catch (err) {
      console.error('Create class error:', err);
      setError(err.response?.data?.message || 'Failed to create class');
    } finally {
      setSubmitting(false);
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
      (
        !classTopicsMap[classId] ||
        !classTrainingEntriesMap[classId] ||
        !classMembersMap[classId]
      )
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
    } catch (err) {
      console.error('Update class error:', err);
      setError(err.response?.data?.message || 'Failed to update class');
    }
  };

  const getTopicsForClass = (classItem) => {
    return allTopics.filter((topic) => {
      return topic.program_id === null || topic.program_id === classItem.program_id;
    });
  };

  const getScenariosForClass = (classItem) => {
    return trainingScenarios.filter((scenario) => {
      return scenario.program_id === null || scenario.program_id === classItem.program_id;
    });
  };

  const getMembersForClass = (classItem) => {
    return allMembers.filter((member) => {
      return member.program_id === null || member.program_id === classItem.program_id;
    });
  };

  const handleDeleteClassTopic = async (classId, topicEntryId) => {
    const confirmed = window.confirm('Remove this topic from the class?');
    if (!confirmed) return;

    try {
      setError('');
      await api.delete(`/classes/${classId}/topics/${topicEntryId}`);
      await loadClassDetails(classId);
    } catch (err) {
      console.error('Delete class topic error:', err);
      setError(err.response?.data?.message || 'Failed to delete class topic');
    }
  };

  const handleDeleteTrainingEntry = async (classId, entryId) => {
    const confirmed = window.confirm('Remove this training entry from the class?');
    if (!confirmed) return;

    try {
      setError('');
      await api.delete(`/classes/${classId}/training-entries/${entryId}`);
      await loadClassDetails(classId);
    } catch (err) {
      console.error('Delete training entry error:', err);
      setError(err.response?.data?.message || 'Failed to delete training entry');
    }
  };

  const handleDeleteClassMember = async (classId, classMemberId) => {
    const confirmed = window.confirm('Remove this attendance record from the class?');
    if (!confirmed) return;

    try {
      setError('');
      await api.delete(`/classes/${classId}/members/${classMemberId}`);
      await loadClassDetails(classId);
    } catch (err) {
      console.error('Delete class member error:', err);
      setError(err.response?.data?.message || 'Failed to remove class member');
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
              {programs.map((program) => (
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
      </section>

      {error && <p className="error-text">{error}</p>}

      <section className="page-section">
        <h3>Class List</h3>

        {loading ? (
          <p className="empty-state">Loading classes...</p>
        ) : classes.length === 0 ? (
          <p className="empty-state">No classes found.</p>
        ) : (
          <ul className="card-list">
            {classes.map((classItem) => (
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
                            <strong>{topic.topic_title}</strong> — {topic.topic_type} —{' '}
                            {topic.coverage_type} — {topic.focus_level}
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
                              <div className="meta-text">
                                Scenario: {entry.training_scenario_name || 'None'}
                              </div>
                              <div className="meta-text">
                                Topic: {entry.curriculum_topic_title || 'None'}
                              </div>
                              <div className="meta-text">Order: {entry.segment_order}</div>
                              <div className="meta-text">
                                Duration: {entry.duration_minutes || 0} minutes
                              </div>
                              {entry.constraints_text && (
                                <div>Constraints: {entry.constraints_text}</div>
                              )}
                              {entry.win_condition_top && (
                                <div>Top Win: {entry.win_condition_top}</div>
                              )}
                              {entry.win_condition_bottom && (
                                <div>Bottom Win: {entry.win_condition_bottom}</div>
                              )}
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
      </section>
    </Layout>
  );
}