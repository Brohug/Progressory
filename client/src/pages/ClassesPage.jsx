import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import ClassTopicsForm from '../components/ClassTopicsForm';
import ClassTrainingEntriesForm from '../components/ClassTrainingEntriesForm';
import ClassAttendanceForm from '../components/ClassAttendanceForm';
import { formatLabel } from '../utils/formatLabel';

const READY_FOR_ATTENDANCE_KEY = 'progressory-ready-for-attendance';

const readReadyForAttendanceIds = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.sessionStorage.getItem(READY_FOR_ATTENDANCE_KEY);
    const parsedValue = JSON.parse(rawValue || '[]');
    return Array.isArray(parsedValue) ? parsedValue.map(String) : [];
  } catch (error) {
    console.error('Read ready-for-attendance ids error:', error);
    return [];
  }
};

const storeReadyForAttendanceIds = (classIds) => {
  if (typeof window === 'undefined' || !Array.isArray(classIds) || classIds.length === 0) {
    return;
  }

  const mergedIds = [...new Set([...readReadyForAttendanceIds(), ...classIds.map(String)])];
  window.sessionStorage.setItem(READY_FOR_ATTENDANCE_KEY, JSON.stringify(mergedIds));
};

export default function ClassesPage() {
  const { user } = useAuth();
  const location = useLocation();

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
  const [showAllClasses, setShowAllClasses] = useState(false);
  const [showCreateClassForm, setShowCreateClassForm] = useState(false);
  const [classSearch, setClassSearch] = useState('');
  const [expandedTopicDetailsMap, setExpandedTopicDetailsMap] = useState({});
  const [expandedTrainingEntryDetailsMap, setExpandedTrainingEntryDetailsMap] = useState({});
  const [expandedClassFormSectionsMap, setExpandedClassFormSectionsMap] = useState({});

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
  const [classMessage, setClassMessage] = useState('');
  const [error, setError] = useState('');
  const [guidedAttendanceClassId, setGuidedAttendanceClassId] = useState(null);
  const [readyForAttendanceClassIds, setReadyForAttendanceClassIds] = useState([]);

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
      setError(err.response?.data?.message || 'Couldn\'t load classes right now.');
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/programs');
      setPrograms(response.data);
    } catch (err) {
      console.error('Fetch programs error:', err);
      setError(err.response?.data?.message || 'Couldn\'t load programs right now.');
    }
  };

  const fetchAllTopics = async () => {
    try {
      const response = await api.get('/topics');
      setAllTopics(response.data);
    } catch (err) {
      console.error('Fetch all topics error:', err);
      setError(err.response?.data?.message || 'Couldn\'t load topics right now.');
    }
  };

  const fetchTrainingMethods = async () => {
    try {
      const response = await api.get('/training-methods');
      setTrainingMethods(response.data);
    } catch (err) {
      console.error('Fetch training methods error:', err);
      setError(err.response?.data?.message || 'Couldn\'t load training methods right now.');
    }
  };

  const fetchTrainingScenarios = async () => {
    try {
      const response = await api.get('/training-scenarios');
      setTrainingScenarios(response.data);
    } catch (err) {
      console.error('Fetch training scenarios error:', err);
      setError(err.response?.data?.message || 'Couldn\'t load training scenarios right now.');
    }
  };

  const fetchAllMembers = async () => {
    try {
      const response = await api.get('/members');
      setAllMembers(response.data);
    } catch (err) {
      console.error('Fetch members error:', err);
      setError(err.response?.data?.message || 'Couldn\'t load members right now.');
    }
  };

  const processDuePlannedClasses = async () => {
    try {
      const response = await api.post('/planned-classes/process-due');
      return response.data;
    } catch (err) {
      console.error('Process due planned classes error:', err);
      return null;
    }
  };

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError('');
        const processedResult = await processDuePlannedClasses();
        await Promise.all([
          fetchClasses(),
          fetchPrograms(),
          fetchAllTopics(),
          fetchTrainingMethods(),
          fetchTrainingScenarios(),
          fetchAllMembers()
        ]);

        if (processedResult?.processedCount > 0) {
          storeReadyForAttendanceIds(processedResult.processed.map((item) => item.classId));
          setClassMessage(
            processedResult.processedCount === 1
              ? '1 planned class was moved into Completed Classes and is ready for attendance.'
              : `${processedResult.processedCount} planned classes were moved into Completed Classes and are ready for attendance.`
          );
        }

        setReadyForAttendanceClassIds(readReadyForAttendanceIds());
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

  useEffect(() => {
    const missingClassIds = visibleClasses
      .map((classItem) => classItem.id)
      .filter((classId) => classMembersMap[classId] === undefined);

    if (missingClassIds.length === 0) {
      return;
    }

    let isCancelled = false;

    const loadVisibleAttendance = async () => {
      try {
        const attendanceResponses = await Promise.all(
          missingClassIds.map(async (classId) => {
            const response = await api.get(`/classes/${classId}/members`);
            return { classId, data: response.data };
          })
        );

        if (isCancelled) {
          return;
        }

        setClassMembersMap((prev) => {
          const next = { ...prev };

          attendanceResponses.forEach(({ classId, data }) => {
            next[classId] = data;
          });

          return next;
        });
      } catch (err) {
        console.error('Load visible class attendance error:', err);
      }
    };

    loadVisibleAttendance();

    return () => {
      isCancelled = true;
    };
  }, [classMembersMap, visibleClasses]);

  useEffect(() => {
    const missingClassIds = visibleClasses
      .map((classItem) => classItem.id)
      .filter(
        (classId) => (
          classTopicsMap[classId] === undefined || classTrainingEntriesMap[classId] === undefined
        )
      );

    if (missingClassIds.length === 0) {
      return;
    }

    let isCancelled = false;

    const loadVisibleWorkflowDetails = async () => {
      try {
        const detailResponses = await Promise.all(
          missingClassIds.map(async (classId) => {
            const [topicsResponse, trainingEntriesResponse] = await Promise.all([
              api.get(`/classes/${classId}/topics`),
              api.get(`/classes/${classId}/training-entries`)
            ]);

            return {
              classId,
              topics: topicsResponse.data,
              trainingEntries: trainingEntriesResponse.data
            };
          })
        );

        if (isCancelled) {
          return;
        }

        setClassTopicsMap((prev) => {
          const next = { ...prev };
          detailResponses.forEach(({ classId, topics }) => {
            next[classId] = topics;
          });
          return next;
        });

        setClassTrainingEntriesMap((prev) => {
          const next = { ...prev };
          detailResponses.forEach(({ classId, trainingEntries }) => {
            next[classId] = trainingEntries;
          });
          return next;
        });
      } catch (err) {
        console.error('Load visible class workflow details error:', err);
      }
    };

    loadVisibleWorkflowDetails();

    return () => {
      isCancelled = true;
    };
  }, [classTopicsMap, classTrainingEntriesMap, visibleClasses]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openClassId = params.get('openClassId');
    const shouldGuideAttendance = params.get('focus') === 'attendance';

    if (!openClassId) {
      return;
    }

    const matchingClass = classes.find((classItem) => String(classItem.id) === String(openClassId));

    if (!matchingClass) {
      return;
    }

    const openPlannedClass = async () => {
      setExpandedClasses((prev) => ({
        ...prev,
        [openClassId]: true
      }));
      setShowCreateClassForm(false);
      setClassMessage(
        shouldGuideAttendance
          ? 'Planned class completed successfully. Add attendance below to finish logging the session.'
          : 'Planned class opened successfully.'
      );

      await loadClassDetails(openClassId);

      if (shouldGuideAttendance) {
        setGuidedAttendanceClassId(String(openClassId));
        storeReadyForAttendanceIds([openClassId]);
        setReadyForAttendanceClassIds(readReadyForAttendanceIds());
      }

      const scrollTargetId = shouldGuideAttendance
        ? `class-attendance-${openClassId}`
        : `class-card-${openClassId}`;

      const scrollToClass = window.setTimeout(() => {
        const element = document.getElementById(scrollTargetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 160);

      const clearHighlight = window.setTimeout(() => {
        setGuidedAttendanceClassId((prev) => (
          prev === String(openClassId) ? null : prev
        ));
      }, 3000);

      return () => {
        window.clearTimeout(scrollToClass);
        window.clearTimeout(clearHighlight);
      };
    };

    let cleanup;
    openPlannedClass().then((nextCleanup) => {
      cleanup = nextCleanup;
    });

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [classes, location.search]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
      setClassMessage('Class saved successfully.');
    } catch (err) {
      console.error('Create class error:', err);
      setError(err.response?.data?.message || 'Couldn\'t create that class just now.');
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
    const activeMembers = allMembers.filter((member) => member.is_active);

    if (!classItem.program_id) {
      return activeMembers;
    }

    const matchingMembers = activeMembers.filter((member) => {
      return (
        member.program_id === null ||
        String(member.program_id) === String(classItem.program_id)
      );
    });

    return matchingMembers.length > 0 ? matchingMembers : activeMembers;
  };

  const getSuggestedTopicsForClass = (classItem) => {
    const availableTopics = getTopicsForClass(classItem);
    const currentClassTopics = classTopicsMap[classItem.id] || [];
    const suggestedTopics = [];
    const seenTopicIds = new Set();

    currentClassTopics.forEach((entry) => {
      const matchedTopic = availableTopics.find(
        (topic) => String(topic.id) === String(entry.curriculum_topic_id)
      );

      if (matchedTopic && !seenTopicIds.has(matchedTopic.id)) {
        seenTopicIds.add(matchedTopic.id);
        suggestedTopics.push(matchedTopic);
      }
    });

    availableTopics.forEach((topic) => {
      if (!seenTopicIds.has(topic.id)) {
        seenTopicIds.add(topic.id);
        suggestedTopics.push(topic);
      }
    });

    return suggestedTopics.slice(0, 6);
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

  const handleApplyClassProgress = async (classItem) => {
    try {
      clearClassFeedback(classItem.id);
      setError('');

      const response = await api.post(`/classes/${classItem.id}/apply-progress`);
      const insertedCount = response.data?.insertedCount || 0;
      const reviewedCount = response.data?.reviewedCount || 0;
      const presentMemberCount = response.data?.presentMemberCount || 0;
      const topicCount = response.data?.topicCount || 0;

      let message = 'Member progress updated successfully.';

      if (insertedCount > 0 && reviewedCount > 0) {
        message = `${insertedCount} new progress updates added and ${reviewedCount} existing progress records reviewed across ${presentMemberCount} present members and ${topicCount} topics.`;
      } else if (insertedCount > 0) {
        message = `${insertedCount} progress updates added across ${presentMemberCount} present members and ${topicCount} topics.`;
      } else if (reviewedCount > 0) {
        message = `${reviewedCount} existing progress records reviewed across ${presentMemberCount} present members and ${topicCount} topics.`;
      }

      setClassFeedback(classItem.id, {
        message,
        error: ''
      });
    } catch (err) {
      console.error('Apply class progress error:', err);
      setClassFeedback(classItem.id, {
        message: '',
        error: err.response?.data?.message || 'Couldn\'t apply member progress just now.'
      });
    }
  };

  const toggleTopicDetails = (topicEntryId) => {
    setExpandedTopicDetailsMap((prev) => ({
      ...prev,
      [topicEntryId]: !prev[topicEntryId]
    }));
  };

  const toggleTrainingEntryDetails = (entryId) => {
    setExpandedTrainingEntryDetailsMap((prev) => ({
      ...prev,
      [entryId]: !prev[entryId]
    }));
  };

  const toggleClassFormSection = (classId, sectionKey) => {
    setExpandedClassFormSectionsMap((prev) => ({
      ...prev,
      [classId]: {
        ...prev[classId],
        [sectionKey]: !prev[classId]?.[sectionKey]
      }
    }));
  };

  const scrollToClassSection = (targetId) => {
    window.requestAnimationFrame(() => {
      const element = document.getElementById(targetId);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  const handleGoToNextStep = async (classItem, nextActionTarget) => {
    if (!nextActionTarget) {
      return;
    }

    if (!expandedClasses[classItem.id]) {
      await toggleClassDetails(classItem);
      window.setTimeout(() => {
        scrollToClassSection(`class-${nextActionTarget}-${classItem.id}`);
      }, 160);
      return;
    }

    scrollToClassSection(`class-${nextActionTarget}-${classItem.id}`);
  };

  return (
      <Layout>
        <h2 className="page-title">Classes</h2>

        <section className="page-section" style={{ maxWidth: '760px' }}>
          <p className="section-note" style={{ marginBottom: '14px' }}>
            Use this page for completed classes and any unplanned sessions you need to log after the
            fact. Training scenarios now live in their own page in the main navigation so they are
            easier to build and reuse later.
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <h3 style={{ marginBottom: 0 }}>Completed Classes</h3>
            <button onClick={() => setShowCreateClassForm((prev) => !prev)}>
              {showCreateClassForm ? 'Hide New Class' : 'New Class'}
            </button>
          </div>
        </section>

        {showCreateClassForm ? (
        <section className="page-section" style={{ maxWidth: '760px' }}>
          <h3>Create Class</h3>
          <p className="section-note">
            Log a completed class here when you are recording something that already happened.
          </p>

          <form className="form-grid" onSubmit={handleSubmit}>
          <div>
            <label>Program</label>
            <select
              name="program_id"
              value={formData.program_id}
              onChange={handleChange}
            >
              <option value="">Choose a program</option>
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
      ) : null}
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
            {classSearch.trim() ? 'No classes match those filters yet.' : 'No classes have been added yet.'}
          </p>
        ) : (
          <ul className="card-list">
            {visibleClasses.map((classItem) => {
              const eligibleMembers = getMembersForClass(classItem);
              const recordedMembers = classMembersMap[classItem.id] || [];
              const loggedTopics = classTopicsMap[classItem.id] || [];
              const loggedTrainingEntries = classTrainingEntriesMap[classItem.id] || [];
              const showReadyBadge =
                readyForAttendanceClassIds.includes(String(classItem.id)) &&
                !(recordedMembers.length > 0);
              const isAttendanceComplete =
                eligibleMembers.length > 0 && recordedMembers.length >= eligibleMembers.length;
              const isClassLogComplete =
                (isAttendanceComplete || eligibleMembers.length === 0) &&
                (loggedTopics.length > 0 || loggedTrainingEntries.length > 0);
              const attendanceStatus = eligibleMembers.length === 0
                ? {
                  label: 'No members available',
                  className: 'attendance-status-neutral'
                }
                : isAttendanceComplete
                  ? {
                    label: 'Attendance complete',
                    className: 'attendance-status-complete'
                  }
                  : recordedMembers.length > 0
                    ? {
                      label: `Attendance in progress (${recordedMembers.length}/${eligibleMembers.length})`,
                      className: 'attendance-status-progress'
                    }
                    : {
                      label: 'Attendance not started',
                      className: 'attendance-status-pending'
                    };
              const topicsStatus = loggedTopics.length > 0
                ? {
                  label: `Topics logged (${loggedTopics.length})`,
                  className: 'workflow-status-complete'
                }
                : {
                  label: 'Topics logged (0)',
                  className: 'workflow-status-neutral'
                };
              const trainingEntryStatus = loggedTrainingEntries.length > 0
                ? {
                  label: `Training entries logged (${loggedTrainingEntries.length})`,
                  className: 'workflow-status-complete'
                }
                : {
                  label: 'Training entries logged (0)',
                  className: 'workflow-status-neutral'
                };
              const canApplyClassProgress = recordedMembers.some(
                (member) => member.attendance_status === 'present'
              ) && loggedTopics.length > 0;
              const nextActionTarget = !isAttendanceComplete && eligibleMembers.length > 0
                ? 'attendance'
                : loggedTopics.length === 0
                  ? 'topics'
                  : loggedTrainingEntries.length === 0
                    ? 'training-entries'
                    : canApplyClassProgress
                      ? 'member-progress'
                      : '';
              const nextActionHint = !isAttendanceComplete && eligibleMembers.length > 0
                ? 'Next: finish attendance.'
                : loggedTopics.length === 0 && loggedTrainingEntries.length === 0
                  ? 'Next: log topics or training entries.'
                  : loggedTopics.length === 0
                    ? 'Next: log the topics covered.'
                    : loggedTrainingEntries.length === 0
                      ? 'Next: add training entries if you used them.'
                      : !isClassLogComplete
                        ? 'Next: review member progress if you want to track learning from this class.'
                        : '';

              return (
              <li
                key={classItem.id}
                id={`class-card-${classItem.id}`}
                className={`card-item${showReadyBadge ? ' class-ready-card' : ''}`}
              >
                <strong>{classItem.title || 'Untitled Class'}</strong>

                <div className="detail-block">
                  {showReadyBadge ? (
                    <div className="class-ready-badge">Ready for attendance</div>
                  ) : null}
                  {isClassLogComplete ? (
                    <div className="class-log-complete-badge">Class log complete</div>
                  ) : null}
                  <div className={`class-attendance-status ${attendanceStatus.className}`}>
                    {attendanceStatus.label}
                  </div>
                  <div className="class-workflow-status-row">
                    <div className={`class-workflow-status ${topicsStatus.className}`}>
                      {topicsStatus.label}
                    </div>
                    <div className={`class-workflow-status ${trainingEntryStatus.className}`}>
                      {trainingEntryStatus.label}
                    </div>
                  </div>
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
                  {nextActionHint ? (
                    <div className="class-next-action-hint">{nextActionHint}</div>
                  ) : null}
                  <div>{classItem.notes || 'No notes'}</div>
                </div>

                <div className="inline-actions">
                  {nextActionTarget ? (
                    <button
                      className="secondary-button"
                      onClick={() => handleGoToNextStep(classItem, nextActionTarget)}
                    >
                      Go To Next Step
                    </button>
                  ) : null}
                  <button
                    className="secondary-button"
                    onClick={() => toggleClassDetails(classItem)}
                  >
                    {expandedClasses[classItem.id] ? 'Hide Details' : 'Manage Class'}
                  </button>
                </div>

                {expandedClasses[classItem.id] && (
                  <div className="detail-block">
                    <section className="page-section compact-form-shell">
                      <div className="compact-form-header">
                        <div>
                          <h4>Edit Class Details</h4>
                          <p className="section-note">
                            Open this when you need to adjust the title, date, time, or notes after class.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => toggleClassFormSection(classItem.id, 'editDetails')}
                        >
                          {expandedClassFormSectionsMap[classItem.id]?.editDetails ? 'Hide form' : 'Show form'}
                        </button>
                      </div>

                      {expandedClassFormSectionsMap[classItem.id]?.editDetails ? (
                        <>
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
                        </>
                      ) : null}
                    </section>

                    {guidedAttendanceClassId === String(classItem.id) ? (
                      <div className="class-flow-note">
                        <strong>This class was just completed from a plan.</strong>
                        <p>
                          Add attendance first, then review the imported topics and training entries
                          below to make any final adjustments.
                        </p>
                      </div>
                    ) : null}

                    <h4>Attendance</h4>
                    <div className="class-flow-summary-grid">
                      <div className="class-flow-summary-card">
                        <span className="meta-text">Recorded</span>
                        <strong>{classMembersMap[classItem.id]?.length || 0}</strong>
                      </div>
                      <div className="class-flow-summary-card">
                        <span className="meta-text">Present</span>
                        <strong>
                          {(classMembersMap[classItem.id] || []).filter((member) => (
                            member.attendance_status === 'present'
                          )).length}
                        </strong>
                      </div>
                      <div className="class-flow-summary-card">
                        <span className="meta-text">Absent</span>
                        <strong>
                          {(classMembersMap[classItem.id] || []).filter((member) => (
                            member.attendance_status === 'absent'
                          )).length}
                        </strong>
                      </div>
                    </div>
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
                      <p className="empty-state">No attendance has been logged for this class yet.</p>
                    )}

                    <div
                      id={`class-attendance-${classItem.id}`}
                      className={guidedAttendanceClassId === String(classItem.id) ? 'class-flow-focus' : ''}
                    >
                      <ClassAttendanceForm
                        classId={classItem.id}
                        members={getMembersForClass(classItem)}
                        recordedMemberIds={(classMembersMap[classItem.id] || []).map((member) => member.member_id)}
                        onSuccess={() => loadClassDetails(classItem.id)}
                      />
                    </div>

                    {canApplyClassProgress ? (
                      <section id={`class-member-progress-${classItem.id}`} className="page-section">
                        <h4>Member Progress</h4>
                        <p className="section-note">
                          Apply an introduced progress update for present members across the topics
                          logged in this class.
                        </p>
                        <div className="inline-actions">
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => handleApplyClassProgress(classItem)}
                          >
                            Apply Progress For Present Members
                          </button>
                        </div>
                        {classFeedbackMap[classItem.id]?.message ? (
                          <p className="success-text">
                            {classFeedbackMap[classItem.id].message}
                          </p>
                        ) : null}
                        {classFeedbackMap[classItem.id]?.error ? (
                          <p className="error-text">
                            {classFeedbackMap[classItem.id].error}
                          </p>
                        ) : null}
                      </section>
                    ) : null}

                    <div id={`class-topics-${classItem.id}`} className="page-section compact-form-shell">
                      <div className="compact-form-header">
                        <div>
                          <h4>Add Topic to Class</h4>
                          <p className="section-note">
                            Open this when you want to log a topic taught or reviewed in class.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => toggleClassFormSection(classItem.id, 'topics')}
                        >
                          {expandedClassFormSectionsMap[classItem.id]?.topics ? 'Hide form' : 'Show form'}
                        </button>
                      </div>
                      {expandedClassFormSectionsMap[classItem.id]?.topics ? (
                        <ClassTopicsForm
                          classId={classItem.id}
                          topics={getTopicsForClass(classItem)}
                          suggestedTopics={getSuggestedTopicsForClass(classItem)}
                          defaultProgramId={classItem.program_id ? String(classItem.program_id) : ''}
                          onTopicCreated={fetchAllTopics}
                          onSuccess={() => loadClassDetails(classItem.id)}
                        />
                      ) : null}
                    </div>

                    <div id={`class-training-entries-${classItem.id}`} className="page-section compact-form-shell">
                      <div className="compact-form-header">
                        <div>
                          <h4>Add Training Entry</h4>
                          <p className="section-note">
                            Open this when you want to log rounds, scenarios, or other training structure from class.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => toggleClassFormSection(classItem.id, 'trainingEntries')}
                        >
                          {expandedClassFormSectionsMap[classItem.id]?.trainingEntries ? 'Hide form' : 'Show form'}
                        </button>
                      </div>
                      {expandedClassFormSectionsMap[classItem.id]?.trainingEntries ? (
                        <ClassTrainingEntriesForm
                          classId={classItem.id}
                          trainingMethods={trainingMethods}
                          trainingScenarios={getScenariosForClass(classItem)}
                          topics={getTopicsForClass(classItem)}
                          onSuccess={() => loadClassDetails(classItem.id)}
                        />
                      ) : null}
                    </div>

                    <h4>Topics Covered</h4>
                    {classTopicsMap[classItem.id]?.length ? (
                      <ul className="card-list">
                        {classTopicsMap[classItem.id].map((topic) => (
                          <li key={topic.id} className="card-item compact-topic-card">
                            <div className="compact-topic-header">
                              <div>
                                <strong>{topic.topic_title}</strong>
                                <div className="meta-text compact-topic-meta">
                                  {formatLabel(topic.topic_type)} • {formatLabel(topic.coverage_type)} • {formatLabel(topic.focus_level)}
                                </div>
                              </div>
                              <button
                                type="button"
                                className="secondary-button"
                                onClick={() => toggleTopicDetails(topic.id)}
                              >
                                {expandedTopicDetailsMap[topic.id] ? 'Hide details' : 'Show details'}
                              </button>
                            </div>
                            {expandedTopicDetailsMap[topic.id] ? (
                              <div className="detail-block">
                                <div><strong>Notes:</strong> {topic.notes || 'No notes'}</div>
                              </div>
                            ) : null}
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
                      <p className="empty-state">No topics have been logged for this class yet.</p>
                    )}

                    <h4>Training Entries</h4>
                    {classTrainingEntriesMap[classItem.id]?.length ? (
                      <ul className="card-list">
                        {classTrainingEntriesMap[classItem.id].map((entry) => (
                          <li key={entry.id} className="card-item compact-topic-card">
                            <div className="compact-topic-header">
                              <div>
                                <strong>{entry.segment_title || 'Untitled Segment'}</strong>
                                <div className="meta-text compact-topic-meta">
                                  {entry.training_method_name || 'No method'} • {entry.curriculum_topic_title || 'No topic'}
                                </div>
                              </div>
                              <button
                                type="button"
                                className="secondary-button"
                                onClick={() => toggleTrainingEntryDetails(entry.id)}
                              >
                                {expandedTrainingEntryDetailsMap[entry.id] ? 'Hide details' : 'Show details'}
                              </button>
                            </div>
                            {expandedTrainingEntryDetailsMap[entry.id] ? (
                              <div className="detail-block">
                                <div className="meta-text">
                                  Scenario: {entry.training_scenario_name || (entry.segment_title ? 'Deleted scenario' : 'None')}
                                </div>
                                <div className="meta-text">Order: {entry.segment_order}</div>
                                <div className="meta-text">Duration: {entry.duration_minutes || 0} minutes</div>
                                {entry.constraints_text && <div><strong>Constraints:</strong> {entry.constraints_text}</div>}
                                {entry.win_condition_top && <div><strong>Top Win:</strong> {entry.win_condition_top}</div>}
                                {entry.win_condition_bottom && <div><strong>Bottom Win:</strong> {entry.win_condition_bottom}</div>}
                                {entry.notes && <div><strong>Notes:</strong> {entry.notes}</div>}
                              </div>
                            ) : null}
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
                      <p className="empty-state">No training entries have been logged for this class yet.</p>
                    )}
                  </div>
                )}
              </li>
              );
            })}
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

