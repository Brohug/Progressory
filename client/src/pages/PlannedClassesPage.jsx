import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ExpandableSection from '../components/ExpandableSection';
import Layout from '../components/Layout';
import TopicSearchSelect from '../components/TopicSearchSelect';
import { useAuth } from '../hooks/useAuth';
import curriculumIndexSeed from '../data/curriculumIndexSeed';
import { formatLabel } from '../utils/formatLabel';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const READY_FOR_ATTENDANCE_KEY = 'progressory-ready-for-attendance';

const normalizeValue = (value) => (
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
);

const inferTopicType = (entry) => {
  const category = String(entry.category || '').toLowerCase();

  if (category === 'positions') return 'position';
  if (category === 'submissions' || category === 'leg locks') return 'submission';
  if (category === 'escapes' || category === 'submission defense') return 'escape';
  if (category === 'takedowns') return 'takedown';
  if (
    category === 'fundamentals' ||
    category === 'concepts' ||
    category === 'strategy and game planning'
  ) {
    return 'concept';
  }
  if (
    category === 'drills' ||
    category === 'constraint-led games' ||
    category === 'positional sparring'
  ) {
    return 'drill_theme';
  }

  return 'technique';
};

const formatDateKey = (dateValue) => {
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

const getMonthStart = (dateValue) => new Date(dateValue.getFullYear(), dateValue.getMonth(), 1);

const buildCalendarDays = (visibleMonth, plannedClasses) => {
  const monthStart = getMonthStart(visibleMonth);
  const monthEnd = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(monthStart.getDate() - monthStart.getDay());
  const calendarEnd = new Date(monthEnd);
  calendarEnd.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()));

  const plansByDate = plannedClasses.reduce((acc, plannedClass) => {
    const dateKey = formatDateKey(plannedClass.class_date);

    if (!dateKey) {
      return acc;
    }

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }

    acc[dateKey].push(plannedClass);
    return acc;
  }, {});

  const days = [];
  const currentDay = new Date(calendarStart);

  while (currentDay <= calendarEnd) {
    const dateKey = formatDateKey(currentDay);
    days.push({
      date: new Date(currentDay),
      dateKey,
      isCurrentMonth: currentDay.getMonth() === visibleMonth.getMonth(),
      plans: (plansByDate[dateKey] || []).sort((left, right) => {
        const leftTime = new Date(`1970-01-01T${left.start_time || '00:00:00'}`).getTime();
        const rightTime = new Date(`1970-01-01T${right.start_time || '00:00:00'}`).getTime();
        return leftTime - rightTime;
      })
    });

    currentDay.setDate(currentDay.getDate() + 1);
  }

  return days;
};

const storeReadyForAttendanceIds = (classIds) => {
  if (typeof window === 'undefined' || !Array.isArray(classIds) || classIds.length === 0) {
    return;
  }

  const existingIds = JSON.parse(window.sessionStorage.getItem(READY_FOR_ATTENDANCE_KEY) || '[]');
  const mergedIds = [...new Set([...existingIds, ...classIds.map(String)])];
  window.sessionStorage.setItem(READY_FOR_ATTENDANCE_KEY, JSON.stringify(mergedIds));
};

export default function PlannedClassesPage() {
  const { user } = useAuth();
  const isMember = user?.role === 'member';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const formSectionRef = useRef(null);
  const plansSectionRef = useRef(null);

  const [plannedClasses, setPlannedClasses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [topics, setTopics] = useState([]);
  const [trainingScenarios, setTrainingScenarios] = useState([]);
  const [libraryEntries, setLibraryEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [memberProgramFilter, setMemberProgramFilter] = useState('');
  const [lastSavedPlannedClassDate, setLastSavedPlannedClassDate] = useState('');
  const [editingPlannedClassId, setEditingPlannedClassId] = useState(null);
  const [showPlanForm, setShowPlanForm] = useState(true);
  const [expandedPlannedClassDetailsMap, setExpandedPlannedClassDetailsMap] = useState({});
  const [activeView, setActiveView] = useState('list');
  const [visibleMonth, setVisibleMonth] = useState(getMonthStart(new Date()));
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);
  const [libraryPlanningContext, setLibraryPlanningContext] = useState(null);
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

  const fetchLibraryEntries = async () => {
    const response = await api.get('/library');
    setLibraryEntries(response.data);
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

        if (isMember) {
          await fetchPlannedClasses();
          return;
        }

        const processedResult = await processDuePlannedClasses();

        await Promise.all([
          fetchPlannedClasses(),
          fetchPrograms(),
          fetchTopics(),
          fetchTrainingScenarios(),
          fetchLibraryEntries()
        ]);

        if (processedResult?.processedCount > 0) {
          storeReadyForAttendanceIds(processedResult.processed.map((item) => item.classId));
          setMessage(
            processedResult.processedCount === 1
              ? '1 planned class moved into Completed Classes and is ready for attendance.'
              : `${processedResult.processedCount} planned classes moved into Completed Classes and are ready for attendance.`
          );
        }
      } catch (err) {
        console.error('Load planned classes page error:', err);
        setError(err.response?.data?.message || 'Couldn\'t load planned classes right now.');
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [isMember]);

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

  const availableTopics = useMemo(() => (
    topics.filter((topic) => {
      if (!topic.is_active) return false;
      if (!formData.program_id) return true;
      return !topic.program_id || String(topic.program_id) === String(formData.program_id);
    })
  ), [formData.program_id, topics]);

  const availableTopicOptions = useMemo(() => {
    const existingTopicTitles = new Set(
      availableTopics.map((topic) => normalizeValue(topic.title))
    );

    const seedOnlyTopics = curriculumIndexSeed
      .filter((entry) => !existingTopicTitles.has(normalizeValue(entry.name)))
      .map((entry) => ({
        id: `seed:${entry.id}`,
        title: entry.name,
        topic_type: inferTopicType(entry),
        description: entry.description || '',
        isSeedOnly: true,
        seedEntryId: entry.id
      }));

    return [...availableTopics, ...seedOnlyTopics];
  }, [availableTopics]);

  const availableScenarios = useMemo(() => (
    trainingScenarios.filter((scenario) => {
      if (!scenario.is_active) return false;
      if (!formData.program_id) return true;
      return !scenario.program_id || String(scenario.program_id) === String(formData.program_id);
    })
  ), [formData.program_id, trainingScenarios]);

  useEffect(() => {
    if (isMember || topics.length === 0) return;

    const topicIdFromLibrary = searchParams.get('libraryTopicId');
    const programIdFromLibrary = searchParams.get('libraryProgramId');
    const topicTitleFromLibrary = searchParams.get('libraryTopicTitle') || '';
    const openFormFromLibrary = searchParams.get('openForm') === '1';

    if (!topicIdFromLibrary) return;

    const linkedTopic = topics.find((topic) => String(topic.id) === String(topicIdFromLibrary));
    if (!linkedTopic) return;

    setShowPlanForm(true);
    setActiveView('list');
    setSelectedTopicId(String(linkedTopic.id));
    setSelectedTopicIds((current) => (
      current.includes(String(linkedTopic.id)) ? current : [...current, String(linkedTopic.id)]
    ));
    setLibraryPlanningContext({
      topicId: String(linkedTopic.id),
      topicTitle: linkedTopic.title || topicTitleFromLibrary,
      programName: linkedTopic.program_name || ''
    });
    setMessage(`Planning around "${linkedTopic.title}". Add the date, time, and any supporting topics for this class.`);
    setFormData((prev) => ({
      ...prev,
      program_id: prev.program_id || (programIdFromLibrary ? String(programIdFromLibrary) : linkedTopic.program_id ? String(linkedTopic.program_id) : ''),
      title: prev.title || linkedTopic.title || '',
      notes: prev.notes || `Built from Library resource support for ${linkedTopic.title}.`
    }));

    if (openFormFromLibrary) {
      window.setTimeout(() => {
        formSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 120);
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('libraryTopicId');
    nextParams.delete('libraryProgramId');
    nextParams.delete('libraryTopicTitle');
    nextParams.delete('openForm');
    setSearchParams(nextParams, { replace: true });
  }, [isMember, topics, searchParams, setSearchParams]);

  const groupedPlannedClasses = useMemo(() => {
    const todayKey = formatDateForInput(new Date());
    const sortWeight = (plannedClass) => {
      const classDateKey = formatDateForInput(plannedClass.class_date);

      if (plannedClass.status === 'planned') {
        if (!classDateKey || classDateKey < todayKey) {
          return 2;
        }

        return 0;
      }

      return 1;
    };

    const sorted = [...plannedClasses].sort((left, right) => {
      const weightDifference = sortWeight(left) - sortWeight(right);

      if (weightDifference !== 0) {
        return weightDifference;
      }

      const leftTime = new Date(`${left.class_date}T${left.start_time || '00:00:00'}`).getTime();
      const rightTime = new Date(`${right.class_date}T${right.start_time || '00:00:00'}`).getTime();

      if (leftTime !== rightTime) {
        return leftTime - rightTime;
      }

      return left.id - right.id;
    });

    return sorted.reduce((acc, plannedClass) => {
      if (!acc[plannedClass.class_date]) {
        acc[plannedClass.class_date] = [];
      }

      acc[plannedClass.class_date].push(plannedClass);
      return acc;
    }, {});
  }, [plannedClasses]);

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth, plannedClasses),
    [plannedClasses, visibleMonth]
  );

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

  const selectedTopics = selectedTopicIds
    .map((topicId) => availableTopics.find((topic) => String(topic.id) === String(topicId)))
    .filter(Boolean);

  const activeLibraryTopicIds = useMemo(() => (
    new Set(
      libraryEntries
        .filter((entry) => {
          if (!entry.is_active || !entry.curriculum_topic_id) {
            return false;
          }

          const hasVideo = Boolean(String(entry.video_url || '').trim());
          const hasTeachingNote = Boolean(String(entry.description || '').trim());

          return hasVideo || hasTeachingNote;
        })
        .map((entry) => String(entry.curriculum_topic_id))
    )
  ), [libraryEntries]);

  const selectedTopicsWithLibrarySupport = useMemo(() => (
    selectedTopics.filter((topic) => activeLibraryTopicIds.has(String(topic.id)))
  ), [selectedTopics, activeLibraryTopicIds]);

  const selectedProgram = activePrograms.find(
    (program) => String(program.id) === String(formData.program_id)
  );

  const selectedScenario = availableScenarios.find(
    (scenario) => String(scenario.id) === String(formData.training_scenario_id)
  );

  const planReadinessItems = [
    {
      label: 'Program',
      value: selectedProgram?.name || 'Choose a program',
      complete: Boolean(formData.program_id)
    },
    {
      label: 'Date',
      value: formData.class_date ? formatDateForDisplay(formData.class_date) : 'Pick a date',
      complete: Boolean(formData.class_date)
    },
    {
      label: 'Topics',
      value: selectedTopics.length > 0 ? `${selectedTopics.length} selected` : 'No topics added yet',
      complete: selectedTopics.length > 0
    },
    {
      label: 'Scenario',
      value: selectedScenario?.name || 'Optional',
      complete: Boolean(formData.training_scenario_id)
    }
  ];

  const visibleMonthLabel = visibleMonth.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric'
  });

  if (isMember) {
    const memberVisiblePlannedClasses = plannedClasses.filter((plannedClass) => plannedClass.status === 'planned');
    const memberProgramOptions = [...new Set(memberVisiblePlannedClasses.map((item) => item.program_name).filter(Boolean))].sort();
    const filteredMemberPlannedClasses = memberVisiblePlannedClasses.filter((plannedClass) => {
      const normalizedSearch = memberSearch.trim().toLowerCase();
      const matchesSearch = !normalizedSearch || [
        plannedClass.title,
        plannedClass.program_name,
        plannedClass.notes,
        ...(plannedClass.topics || []).map((topic) => topic.title)
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));
      const matchesProgram = !memberProgramFilter || plannedClass.program_name === memberProgramFilter;

      return matchesSearch && matchesProgram;
    });
    const groupedMemberPlannedClasses = filteredMemberPlannedClasses.reduce((acc, plannedClass) => {
      if (!acc[plannedClass.class_date]) {
        acc[plannedClass.class_date] = [];
      }

      acc[plannedClass.class_date].push(plannedClass);
      return acc;
    }, {});
    const nextMemberPlannedClass = filteredMemberPlannedClasses[0] || memberVisiblePlannedClasses[0] || null;

    return (
      <Layout>
        <div className="planned-classes-page">
          <h2 className="page-title">Planned Classes</h2>
          <p className="page-intro">
            Review the classes your gym has planned next. This member view is read-only on purpose.
          </p>

          {error ? <p className="error-text">{error}</p> : null}

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Upcoming plans</div>
              <div className="stat-value">{memberVisiblePlannedClasses.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Programs</div>
              <div className="stat-value">
                {new Set(memberVisiblePlannedClasses.map((item) => item.program_name).filter(Boolean)).size}
              </div>
            </div>
          </section>

          <section className="page-section dashboard-onboarding-section">
            <div className="section-header">
              <div>
                <h3>Next class snapshot</h3>
                <p className="section-note">Start with the next class, then use the Index, Library, or Decision Tree if you want to study around it.</p>
              </div>
            </div>
            <div className="dashboard-setup-grid">
              <div className="dashboard-setup-current">
                <strong>{nextMemberPlannedClass ? (nextMemberPlannedClass.title || nextMemberPlannedClass.program_name) : 'No class planned yet'}</strong>
                <div className="detail-block">
                  {nextMemberPlannedClass ? (
                    <>
                      <div className="meta-text">{formatDateForDisplay(nextMemberPlannedClass.class_date)}</div>
                      <div className="meta-text">
                        {formatTimeForDisplay(nextMemberPlannedClass.start_time)}
                        {nextMemberPlannedClass.end_time ? ` - ${formatTimeForDisplay(nextMemberPlannedClass.end_time)}` : ''}
                      </div>
                      <div className="meta-text">Program: {nextMemberPlannedClass.program_name || 'No program'}</div>
                      {nextMemberPlannedClass.topics?.length > 0 ? (
                        <div className="suggestion-chip-row planned-classes-card-topics">
                          {nextMemberPlannedClass.topics.slice(0, 4).map((topic) => (
                            <span
                              key={`member-next-${nextMemberPlannedClass.id}-${topic.curriculum_topic_id}`}
                              className="suggestion-chip"
                            >
                              {topic.title}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="dashboard-setup-helper">Your coaches have not linked topics to this class yet.</div>
                      )}
                    </>
                  ) : (
                    <div className="dashboard-setup-helper">
                      Your gym has not shared an upcoming planned class yet. Library and the Decision Tree are still ready to use.
                    </div>
                  )}
                </div>
              </div>

              <div className="dashboard-setup-upcoming">
                <strong>Study from here</strong>
                <div className="dashboard-setup-list">
                  <Link to="/index" className="dashboard-setup-item">
                    <span>Open Curriculum Index</span>
                    <small>Use the universal topic map before class starts.</small>
                  </Link>
                  <Link to="/library" className="dashboard-setup-item">
                    <span>Open Library</span>
                    <small>Revisit the videos and notes your coaches already shared.</small>
                  </Link>
                  <Link to="/decision-tree" className="dashboard-setup-item">
                    <span>Open Decision Tree</span>
                    <small>Work through likely branches when you want more than a static list.</small>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <ExpandableSection
            title="Upcoming planned classes"
            note="Expand this to review the next planned sessions."
            summary={`${filteredMemberPlannedClasses.length} planned class${filteredMemberPlannedClasses.length === 1 ? '' : 'es'} in the current member view.`}
            className="planned-classes-results-section"
            defaultOpen
          >
            <div className="form-grid" style={{ marginBottom: '16px' }}>
              <div>
                <label>Search</label>
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search class title, topic, or notes..."
                />
              </div>

              <div>
                <label>Program</label>
                <select
                  value={memberProgramFilter}
                  onChange={(e) => setMemberProgramFilter(e.target.value)}
                >
                  <option value="">All programs</option>
                  {memberProgramOptions.map((programName) => (
                    <option key={programName} value={programName}>
                      {programName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <p className="empty-state">Loading planned classes...</p>
            ) : Object.keys(groupedMemberPlannedClasses).length === 0 ? (
              <p className="empty-state">
                {memberVisiblePlannedClasses.length === 0
                  ? 'No planned classes are available right now.'
                  : 'No planned classes match your current search.'}
              </p>
            ) : (
              Object.entries(groupedMemberPlannedClasses).map(([date, classesForDate]) => (
                <div key={date} className="detail-block">
                  <h4>{formatDateForDisplay(date)}</h4>
                  <div className="card-list">
                    {classesForDate.map((plannedClass) => (
                      <article key={plannedClass.id} className="item-card compact-topic-card">
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
                          <span className="status-badge">{plannedClass.program_name}</span>
                        </div>

                        {plannedClass.topics?.length > 0 ? (
                          <div className="suggestion-chip-row planned-classes-card-topics">
                            {plannedClass.topics.map((topic) => (
                              <span
                                key={`${plannedClass.id}-${topic.curriculum_topic_id}`}
                                className="suggestion-chip"
                              >
                                {topic.title}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        {plannedClass.notes ? (
                          <p className="meta-text">{plannedClass.notes}</p>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </div>
              ))
            )}
          </ExpandableSection>
        </div>
      </Layout>
    );
  }

  const resetForm = () => {
    setEditingPlannedClassId(null);
    setSelectedTopicId('');
    setSelectedTopicIds([]);
    setLastSavedPlannedClassDate('');
    setLibraryPlanningContext(null);
    setShowQuickAdd(false);
    setQuickAddData({
      title: '',
      topic_type: 'technique'
    });
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

  const togglePlannedClassDetails = (plannedClassId) => {
    setExpandedPlannedClassDetailsMap((prev) => ({
      ...prev,
      [plannedClassId]: !prev[plannedClassId]
    }));
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

  const handleAddTopic = async (topicId) => {
    if (!topicId) return;

    const selectedTopicOption = availableTopicOptions.find(
      (topic) => String(topic.id) === String(topicId)
    );

    if (!selectedTopicOption) {
      return;
    }

    if (String(topicId).startsWith('seed:')) {
      try {
        setIsCreatingTopic(true);
        setMessage('');
        setError('');

        const response = await api.post('/topics', {
          program_id: formData.program_id ? Number(formData.program_id) : null,
          parent_topic_id: null,
          title: selectedTopicOption.title.trim(),
          topic_type: selectedTopicOption.topic_type,
          description: selectedTopicOption.description || ''
        });

        const createdTopic = response.data?.topic;
        await fetchTopics();

        if (createdTopic?.id) {
          setSelectedTopicIds((prev) => {
            if (prev.includes(String(createdTopic.id))) {
              return prev;
            }

            return [...prev, String(createdTopic.id)];
          });
          setMessage('Topic pulled in from the Curriculum Index and added to this class plan successfully.');
        }
      } catch (err) {
        console.error('Create planned class topic from index error:', err);
        setError(
          err.response?.data?.message ||
            'Couldn\'t pull that topic in from the Curriculum Index just now.'
        );
      } finally {
        setIsCreatingTopic(false);
        setSelectedTopicId('');
      }

      return;
    }

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
        setSelectedTopicIds((prev) => {
          if (prev.includes(String(createdTopic.id))) {
            return prev;
          }

          return [...prev, String(createdTopic.id)];
        });
      }

      setSelectedTopicId('');
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
    setLastSavedPlannedClassDate('');

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
      setLastSavedPlannedClassDate(payload.class_date);

      const processedResult = await processDuePlannedClasses();
      resetForm();
      await fetchPlannedClasses();

      if (processedResult?.processedCount > 0) {
        storeReadyForAttendanceIds(processedResult.processed.map((item) => item.classId));
        setMessage(
          processedResult.processedCount === 1
            ? 'Planned class saved and moved into Completed Classes because its scheduled end time is already in the past.'
            : `${processedResult.processedCount} planned classes were moved into Completed Classes because their scheduled end times are already in the past.`
        );
      }
    } catch (err) {
      console.error('Save planned class error:', err);
      setError(err.response?.data?.message || 'Couldn\'t save that planned class just now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (plannedClass) => {
    setShowPlanForm(true);
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

    window.requestAnimationFrame(() => {
      if (formSectionRef.current) {
        const targetTop = formSectionRef.current.getBoundingClientRect().top + window.scrollY - 24;
        window.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' });
      }
    });
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
      const completedClassId = response.data?.classId;

      if (!completedClassId) {
        throw new Error('The completed class id was missing from the response.');
      }

      storeReadyForAttendanceIds([completedClassId]);
      navigate(`/classes?openClassId=${completedClassId}&focus=attendance`);
    } catch (err) {
      console.error('Complete planned class error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Couldn\'t complete that planned class just now.'
      );
    }
  };

  const handlePreviousMonth = () => {
    setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleCurrentMonth = () => {
    setVisibleMonth(getMonthStart(new Date()));
  };

  const scrollToPlansSection = () => {
    window.requestAnimationFrame(() => {
      if (plansSectionRef.current) {
        const targetTop = plansSectionRef.current.getBoundingClientRect().top + window.scrollY - 24;
        window.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' });
      }
    });
  };

  const handleViewChange = (nextView) => {
    setActiveView(nextView);

    if (nextView === 'calendar') {
      scrollToPlansSection();
    }
  };

  const handleSelectCalendarDay = (dateValue) => {
    const normalizedDate = formatDateForInput(dateValue);

    if (!normalizedDate) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      class_date: normalizedDate
    }));
    setMessage(`Planning date set to ${formatDateForDisplay(normalizedDate)}.`);
    setError('');

    window.requestAnimationFrame(() => {
      if (formSectionRef.current) {
        const targetTop = formSectionRef.current.getBoundingClientRect().top + window.scrollY - 24;
        window.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' });
      }
    });
  };

  return (
    <Layout>
      <div className="planned-classes-page">
        <h2 className="page-title">Planned Classes</h2>
        <p className="page-intro">
          Map out upcoming classes, tie them to scenarios and topics, then complete the plan after
          class and finish attendance inside the regular class workflow.
        </p>

        <section className="stats-grid planned-classes-stats-grid">
          {planSummaryCards.map((card) => (
            <div key={card.label} className="stat-card">
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
            </div>
          ))}
        </section>

        <section className="page-section planned-classes-view-section">
          <div className="section-header">
            <div>
              <h3>Planning view</h3>
              <p className="section-note">
                Check the calendar before you build the next class so you can spot open days and
                keep the week balanced.
              </p>
            </div>

            <div className="inline-actions">
              <div className="planned-classes-view-toggle" role="tablist" aria-label="Planned class view">
                <button
                  type="button"
                  className={`secondary-button${activeView === 'list' ? ' is-active' : ''}`}
                  onClick={() => handleViewChange('list')}
                  aria-pressed={activeView === 'list'}
                >
                  List
                </button>
                <button
                  type="button"
                  className={`secondary-button${activeView === 'calendar' ? ' is-active' : ''}`}
                  onClick={() => handleViewChange('calendar')}
                  aria-pressed={activeView === 'calendar'}
                >
                  Calendar
                </button>
              </div>
            </div>
          </div>
        </section>

        <section ref={formSectionRef} className="page-section planned-classes-form-section">
          <div className="section-header">
            <div>
              <h3>{editingPlannedClassId ? 'Edit planned class' : 'Create planned class'}</h3>
              <p className="section-note">
                Choose a program first so the scenario and topic pickers stay focused on the right
                part of your curriculum.
              </p>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowPlanForm((prev) => !prev)}
            >
              {showPlanForm ? 'Hide form' : 'Show form'}
            </button>
          </div>

          <div className="planned-classes-readiness-grid">
            {planReadinessItems.map((item) => (
              <div
                key={item.label}
                className={`planned-classes-readiness-card${item.complete ? ' complete' : ''}`}
              >
                <span className="meta-text">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          {showPlanForm ? (
          <>
          {libraryPlanningContext ? (
            <div className="library-linked-topic-banner" style={{ marginBottom: '16px' }}>
              <div>
                <strong>Planning from Library: {libraryPlanningContext.topicTitle}</strong>
                <div className="meta-text">
                  This plan started from a Library resource, so the topic is already in focus for the class you are building.
                </div>
              </div>
              <div className="inline-actions">
                <Link
                  className="secondary-button"
                  to={`/library?topicId=${encodeURIComponent(libraryPlanningContext.topicId)}`}
                >
                  Back to Library
                </Link>
                <button type="button" className="secondary-button" onClick={() => setLibraryPlanningContext(null)}>
                  Clear planning focus
                </button>
              </div>
            </div>
          ) : null}
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
                  ? (
                    availableScenarios.length > 0
                      ? `${availableScenarios.length} matching scenario${availableScenarios.length === 1 ? '' : 's'} available for this program.`
                      : 'No matching scenarios yet for this program.'
                  )
                  : 'Choose a program first, then add a scenario if you want the completed class to start with a seeded training entry.'}
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
                topics={availableTopicOptions}
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
                  : 'Choose a program to narrow the topic list, or search across all active topics if this plan crosses categories.'}
              </p>

              {selectedTopics.length > 0 ? (
                <>
                  <p className="section-note planned-classes-inline-note">
                    {selectedTopics.length} topic{selectedTopics.length === 1 ? '' : 's'} selected
                    for this class plan.
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
                  {selectedTopicsWithLibrarySupport.length > 0 ? (
                    <div className="inline-actions planned-classes-library-actions">
                      <span className="meta-text">Need coaching resources for one of these topics?</span>
                      {selectedTopicsWithLibrarySupport.slice(0, 3).map((topic) => (
                        <Link
                          key={`plan-library-${topic.id}`}
                          className="secondary-button"
                          to={`/library?source=planned-classes&topicId=${encodeURIComponent(topic.id)}&search=${encodeURIComponent(topic.title)}`}
                        >
                          Library: {topic.title}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="section-note planned-classes-inline-note">
                      No Library resources are linked to these selected topics yet.
                    </p>
                  )}
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
                  ? editingPlannedClassId ? 'Saving...' : 'Creating...'
                  : editingPlannedClassId ? 'Save Planned Class' : 'Create Planned Class'}
              </button>

              {editingPlannedClassId ? (
                <button type="button" className="secondary-button" onClick={resetForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>

          {message ? (
            <div className="success-followup-row">
              <p className="success-text">{message}</p>
              {lastSavedPlannedClassDate ? (
                <Link
                  className="secondary-button"
                  to={`/classes?workflow=today-completed&classDate=${encodeURIComponent(lastSavedPlannedClassDate)}`}
                >
                  Next: Finished a class?
                </Link>
              ) : null}
            </div>
          ) : null}
          {error ? <p className="error-text">{error}</p> : null}
          </>
          ) : null}
        </section>

        <ExpandableSection
          title="Upcoming planned classes"
          note="Review what is coming up, make quick edits, or complete a plan once class is finished."
          summary={`${plannedClasses.length} planned class${plannedClasses.length === 1 ? '' : 'es'} currently loaded.`}
          className="planned-classes-results-section"
        >
          <section ref={plansSectionRef} className="page-section" style={{ padding: 0, marginBottom: 0, border: 'none', boxShadow: 'none', background: 'transparent' }}>
          <div className="section-header">
            <div>
              <h3>Upcoming planned classes</h3>
              <p className="section-note">
                Review what is coming up, make quick edits, or complete a plan once class is
                finished.
              </p>
            </div>
          </div>

          {loading ? <p>Loading planned classes...</p> : null}

          {!loading && Object.keys(groupedPlannedClasses).length === 0 ? (
            <p className="empty-state">No planned classes have been added yet.</p>
          ) : null}

          {!loading && activeView === 'calendar' ? (
            <div className="planned-classes-calendar">
              <div className="planned-classes-calendar-toolbar">
                <div>
                  <h4>{visibleMonthLabel}</h4>
                  <p className="section-note">
                    Scan what is planned this month by day, program, and primary topic. Click a day
                    to start planning directly on that date.
                  </p>
                </div>

                <div className="inline-actions">
                  <button type="button" className="secondary-button" onClick={handlePreviousMonth}>
                    Previous
                  </button>
                  <button type="button" className="secondary-button" onClick={handleCurrentMonth}>
                    Today
                  </button>
                  <button type="button" className="secondary-button" onClick={handleNextMonth}>
                    Next
                  </button>
                </div>
              </div>

              <div className="planned-classes-calendar-weekdays">
                {WEEKDAY_LABELS.map((label) => (
                  <div key={label} className="planned-classes-calendar-weekday">
                    {label}
                  </div>
                ))}
              </div>

              <div className="planned-classes-calendar-grid">
                {calendarDays.map((day) => {
                  const isToday = day.dateKey === formatDateKey(new Date());
                  const isSelected = day.dateKey === formData.class_date;

                  return (
                    <div
                      key={day.dateKey}
                      className={`planned-classes-calendar-day${day.isCurrentMonth ? '' : ' is-outside-month'}${isToday ? ' is-today' : ''}${isSelected ? ' is-selected' : ''}`}
                    >
                      <div className="planned-classes-calendar-day-header">
                        <button
                          type="button"
                          className="planned-classes-calendar-day-trigger"
                          onClick={() => handleSelectCalendarDay(day.date)}
                          disabled={!day.isCurrentMonth}
                        >
                          <span>{day.date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                          <strong>{day.date.getDate()}</strong>
                        </button>
                        <span className="meta-text">
                          {day.plans.length > 0
                            ? `${day.plans.length} plan${day.plans.length === 1 ? '' : 's'}`
                            : ''}
                        </span>
                      </div>

                      <div className="planned-classes-calendar-items">
                        {day.plans.length === 0 ? (
                          <span className="planned-classes-calendar-empty">No class planned</span>
                        ) : (
                          day.plans.map((plannedClass) => {
                            const primaryTopic = plannedClass.topics?.[0]?.title;

                            return (
                              <button
                                key={plannedClass.id}
                                type="button"
                                className={`planned-classes-calendar-item${plannedClass.status === 'completed' ? ' is-completed' : ''}`}
                                onClick={() => (
                                  plannedClass.status === 'planned'
                                    ? handleEdit(plannedClass)
                                    : navigate(`/classes?openClassId=${plannedClass.completed_class_id}`)
                                )}
                              >
                                <strong>{formatTimeForDisplay(plannedClass.start_time)}</strong>
                                <span>{plannedClass.program_name}</span>
                                {primaryTopic ? <span className="meta-text">{primaryTopic}</span> : null}
                                <span className="planned-classes-calendar-status">
                                  {plannedClass.status === 'completed' ? 'Completed' : 'Planned'}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {!loading && activeView === 'list' ? (
            Object.entries(groupedPlannedClasses).map(([date, classesForDate]) => (
              <div key={date} className="detail-block">
                <h4>{formatDateForDisplay(date)}</h4>

                <div className="card-list">
                  {classesForDate.map((plannedClass) => (
                    <article key={plannedClass.id} className="item-card compact-topic-card">
                      <div className="item-header">
                        <div>
                          <h4>{plannedClass.title || plannedClass.program_name}</h4>
                          <p className="meta-text">
                            {formatTimeForDisplay(plannedClass.start_time)}
                            {plannedClass.end_time
                              ? ` - ${formatTimeForDisplay(plannedClass.end_time)}`
                              : ''}
                            {!plannedClass.start_time && !plannedClass.end_time
                              ? ''
                              : ` | ${formatDateForDisplay(plannedClass.class_date)}`}
                          </p>
                        </div>

                        <span
                          className={`status-badge${plannedClass.status === 'completed' ? ' inactive' : ''}`}
                        >
                          {formatLabel(plannedClass.status)}
                        </span>
                      </div>

                      <div className="meta-text compact-topic-meta">
                        {plannedClass.program_name} • {plannedClass.topics.length} topic{plannedClass.topics.length === 1 ? '' : 's'}
                      </div>

                      {expandedPlannedClassDetailsMap[plannedClass.id] ? (
                        <>
                          <div className="planned-class-meta-grid">
                            <p>
                              <strong>Program:</strong> {plannedClass.program_name}
                            </p>
                            <p>
                              <strong>Head coach:</strong> {plannedClass.head_coach_first_name}{' '}
                              {plannedClass.head_coach_last_name}
                            </p>
                            <p>
                              <strong>Scenario:</strong>{' '}
                              {plannedClass.training_scenario_name
                                || (plannedClass.status === 'completed' ? 'Deleted after use' : 'No scenario planned')}
                            </p>
                            <p>
                              <strong>Topics:</strong>{' '}
                              {plannedClass.topics.length > 0
                                ? `${plannedClass.topics.length} planned`
                                : 'No topics planned yet'}
                            </p>
                          </div>

                          {plannedClass.topics.length > 0 ? (
                            <>
                              <div className="suggestion-chip-row planned-classes-card-topics">
                                {plannedClass.topics.map((topic) => (
                                  <span
                                    key={`${plannedClass.id}-${topic.curriculum_topic_id}`}
                                    className="suggestion-chip"
                                  >
                                    {topic.title}
                                  </span>
                                ))}
                              </div>
                              {plannedClass.topics.filter((topic) => activeLibraryTopicIds.has(String(topic.curriculum_topic_id))).length > 0 ? (
                                <div className="inline-actions planned-classes-library-actions">
                                  <span className="meta-text">Need supporting resources?</span>
                                  {plannedClass.topics
                                    .filter((topic) => activeLibraryTopicIds.has(String(topic.curriculum_topic_id)))
                                    .slice(0, 3)
                                    .map((topic) => (
                                      <Link
                                        key={`planned-class-library-${plannedClass.id}-${topic.curriculum_topic_id}`}
                                        className="secondary-button"
                                        to={`/library?source=planned-classes&topicId=${encodeURIComponent(topic.curriculum_topic_id)}&search=${encodeURIComponent(topic.title)}`}
                                      >
                                        Library: {topic.title}
                                      </Link>
                                    ))}
                                </div>
                              ) : (
                                <p className="section-note planned-classes-inline-note">
                                  No Library resources are linked to this class plan&apos;s topics yet.
                                </p>
                              )}
                            </>
                          ) : null}

                          {plannedClass.notes ? (
                            <p>
                              <strong>Notes:</strong> {plannedClass.notes}
                            </p>
                          ) : null}
                        </>
                      ) : null}

                      <div className="button-row">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => togglePlannedClassDetails(plannedClass.id)}
                        >
                          {expandedPlannedClassDetailsMap[plannedClass.id] ? 'Hide details' : 'Show details'}
                        </button>
                        {plannedClass.status === 'planned' ? (
                          <>
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() => handleEdit(plannedClass)}
                            >
                              Edit plan
                            </button>
                            <button type="button" onClick={() => handleComplete(plannedClass.id)}>
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
            ))
          ) : null}
          </section>
        </ExpandableSection>
      </div>
    </Layout>
  );
}
