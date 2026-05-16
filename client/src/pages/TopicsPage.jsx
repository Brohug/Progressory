import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/axios';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import ExpandableSection from '../components/ExpandableSection';
import { formatLabel } from '../utils/formatLabel';
import TopicSearchSelect from '../components/TopicSearchSelect';
import { useAuth } from '../hooks/useAuth';

export default function TopicsPage() {
  const { user } = useAuth();
  const isManagement = user?.role === 'owner' || user?.role === 'admin';
  const [searchParams] = useSearchParams();
  const topicListSectionRef = useRef(null);
  const topicItemRefs = useRef({});
  const [topics, setTopics] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [topicSearch, setTopicSearch] = useState('');
  const [topicTypeFilter, setTopicTypeFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [formData, setFormData] = useState({
    program_id: '',
    parent_topic_id: '',
    title: '',
    topic_type: 'position',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);
  const [isTopicListOpen, setIsTopicListOpen] = useState(true);
  const [expandedTopicDetails, setExpandedTopicDetails] = useState({});

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
      setError(err.response?.data?.message || 'Couldn\'t load topics right now.');
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

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError('');
        await Promise.all([fetchTopics(), fetchPrograms()]);
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  useEffect(() => {
    const searchValue = searchParams.get('search');
    const typeValue = searchParams.get('topicType');
    const programValue = searchParams.get('program');
    const actionValue = searchParams.get('action');
    const suggestedTitle = searchParams.get('suggestedTitle');
    const suggestedType = searchParams.get('suggestedType');
    const suggestedProgramId = searchParams.get('suggestedProgramId');

    if (searchValue !== null) {
      setTopicSearch(searchValue);
    }

    if (typeValue !== null) {
      setTopicTypeFilter(typeValue);
    }

    if (programValue !== null) {
      setProgramFilter(programValue);
    }

    if (actionValue === 'create') {
      setIsCreateTopicOpen(true);
    }

    if (suggestedTitle || suggestedType || suggestedProgramId) {
      setFormData((prev) => ({
        ...prev,
        title: suggestedTitle ?? prev.title,
        topic_type: suggestedType ?? prev.topic_type,
        program_id: suggestedProgramId ?? prev.program_id
      }));
    }
  }, [searchParams]);

  const orderedTopics = useMemo(() => {
    const active = topics.filter((topic) => topic.is_active);
    const inactive = topics.filter((topic) => !topic.is_active);

    return showInactive ? [...active, ...inactive] : active;
  }, [topics, showInactive]);

  const filteredTopics = useMemo(() => {
    const normalizedSearch = topicSearch.trim().toLowerCase();

    return orderedTopics.filter((topic) => {
      const matchesSearch = !normalizedSearch || (
        (topic.title || '').toLowerCase().includes(normalizedSearch) ||
        (topic.description || '').toLowerCase().includes(normalizedSearch) ||
        (topic.parent_topic_title || '').toLowerCase().includes(normalizedSearch)
      );

      const matchesType = !topicTypeFilter || topic.topic_type === topicTypeFilter;
      const matchesProgram = !programFilter || String(topic.program_id || '') === programFilter;

      return matchesSearch && matchesType && matchesProgram;
    });
  }, [orderedTopics, topicSearch, topicTypeFilter, programFilter]);

  const activeTopicCount = topics.filter((topic) => topic.is_active).length;
  const inactiveTopicCount = topics.length - activeTopicCount;
  const activeTopicFilters = [
    topicSearch ? `Search: ${topicSearch}` : '',
    topicTypeFilter ? `Type: ${formatLabel(topicTypeFilter)}` : '',
    programFilter
      ? `Program: ${programs.find((program) => String(program.id) === programFilter)?.name || 'Selected'}`
      : ''
  ].filter(Boolean);

  useEffect(() => {
    const topicId = searchParams.get('topicId');

    if (!topicId || topics.length === 0) {
      return;
    }

    const targetTopic = topics.find((topic) => String(topic.id) === String(topicId));
    if (!targetTopic) {
      return;
    }

    if (!targetTopic.is_active) {
      setShowInactive(true);
    }

    if (!searchParams.get('search')) {
      setTopicSearch(targetTopic.title || '');
    }

    if (!searchParams.get('topicType')) {
      setTopicTypeFilter(targetTopic.topic_type || '');
    }

    if (!searchParams.get('program') && targetTopic.program_id) {
      setProgramFilter(String(targetTopic.program_id));
    }

    setIsTopicListOpen(true);

    window.setTimeout(() => {
      topicListSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      topicItemRefs.current[targetTopic.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  }, [searchParams, topics]);

  const availableParentTopics = useMemo(() => {
    const activeTopics = topics.filter((topic) => topic.is_active);

    if (!formData.program_id) {
      return activeTopics;
    }

    const matchingTopics = activeTopics.filter((topic) => (
      topic.program_id === null || String(topic.program_id) === String(formData.program_id)
    ));

    return matchingTopics.length > 0 ? matchingTopics : activeTopics;
  }, [topics, formData.program_id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleParentTopicChange = (topicId) => {
    setFormData((prev) => ({
      ...prev,
      parent_topic_id: topicId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

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
      setSuccessMessage('Topic saved successfully.');
    } catch (err) {
      console.error('Create topic error:', err);
      setError(err.response?.data?.message || 'Couldn\'t create that topic just now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetActiveState = async (topic, nextIsActive) => {
    const confirmed = window.confirm(
      nextIsActive
        ? 'Make this topic active again?'
        : 'Make this topic inactive? It will stay in the system, but it will be hidden from the default view.'
    );
    if (!confirmed) return;

    try {
      setError('');
      setSuccessMessage('');
      setActiveTopicId(topic.id);
      await api.put(`/topics/${topic.id}`, {
        program_id: topic.program_id,
        parent_topic_id: topic.parent_topic_id,
        title: topic.title,
        topic_type: topic.topic_type,
        description: topic.description || '',
        is_active: nextIsActive
      });
      await fetchTopics();
      setSuccessMessage(nextIsActive ? 'Topic reactivated successfully.' : 'Topic moved out of the active list.');
    } catch (err) {
      console.error('Update topic active state error:', err);
      setError(err.response?.data?.message || 'Couldn\'t update that topic right now.');
    } finally {
      setActiveTopicId(null);
    }
  };

  const toggleTopicDetails = (topicId) => {
    setExpandedTopicDetails((prev) => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  return (
    <Layout>
      <h2 className="page-title">Topics</h2>

      {isManagement ? (
      <ExpandableSection
        isOpen={isCreateTopicOpen}
        onToggle={setIsCreateTopicOpen}
        title="Create Topic"
        note="Add new topics only when you are ready to build out more of the curriculum."
        summary="Keep this collapsed until you want to add a new topic to the curriculum."
        className="topics-create-section"
      >

        <form className="form-grid" onSubmit={handleSubmit}>
          <div>
            <label>Program</label>
            <select
              name="program_id"
              value={formData.program_id}
              onChange={handleChange}
            >
              <option value="">No program</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Parent Topic</label>
            <TopicSearchSelect
              topics={availableParentTopics}
              value={formData.parent_topic_id}
              onChange={handleParentTopicChange}
              placeholder="Search parent topics..."
              emptySelectionLabel="No parent topic selected"
              helperText="Search and select a parent topic if this topic belongs under another one."
            />
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
                  {formatLabel(type)}
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
              {submitting ? 'Saving...' : 'Save Topic'}
            </button>
          </div>
        </form>

        {successMessage ? (
          <div className="success-followup-row">
            <p className="success-text" style={{ marginBottom: 0 }}>{successMessage}</p>
            <Link className="secondary-button" to="/index">
              Next: Open Curriculum
            </Link>
            <Link className="secondary-button" to="/library">
              Next: Add library support
            </Link>
          </div>
        ) : null}
      </ExpandableSection>
      ) : null}

      {error && <p className="error-text">{error}</p>}

      <ExpandableSection
        isOpen={isTopicListOpen}
        onToggle={setIsTopicListOpen}
        title="Topic List"
        note="Search and filter your curriculum as the topic library grows."
        summary={`${filteredTopics.length} topic${filteredTopics.length === 1 ? '' : 's'} in the current view.`}
        summaryMeta={[
          `${activeTopicCount} active`,
          inactiveTopicCount > 0 ? `${inactiveTopicCount} inactive` : 'No inactive topics',
          activeTopicFilters.length > 0 ? `${activeTopicFilters.length} filter${activeTopicFilters.length === 1 ? '' : 's'} active` : 'No filters active'
        ]}
        stickyHeader
        actions={(
          <button
            className="secondary-button"
            onClick={() => setShowInactive((prev) => !prev)}
          >
            {showInactive ? 'Hide Inactive Topics' : 'Show Inactive Topics'}
          </button>
        )}
      >
        <div ref={topicListSectionRef} />

        <div className="sticky-action-bar">
          <div className="filter-grid">
            <div>
              <label>Search Topics</label>
              <input
                type="text"
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                placeholder="Search by title, description, or parent topic..."
              />
            </div>

            <div>
              <label>Filter By Type</label>
              <select
                value={topicTypeFilter}
                onChange={(e) => setTopicTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {topicTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Filter By Program</label>
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
              >
                <option value="">All Programs</option>
                {programs.map((program) => (
                  <option key={program.id} value={String(program.id)}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Loading topics...</p>
        ) : filteredTopics.length === 0 ? (
          <p className="empty-state">
            {topics.length === 0 ? 'No topics have been added yet.' : 'No topics match those filters right now.'}
          </p>
        ) : (
          <ul className="card-list">
            {filteredTopics.map((topic) => (
              <li
                key={topic.id}
                className="card-item"
                ref={(node) => {
                  if (node) {
                    topicItemRefs.current[topic.id] = node;
                  }
                }}
              >
                <div className="compact-topic-header">
                  <div>
                    <strong>{topic.title}</strong>
                    <div className="compact-topic-meta meta-text">
                      {formatLabel(topic.topic_type)} • {topic.program_name || 'No program'} • {topic.parent_topic_title || 'Top level'}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => toggleTopicDetails(topic.id)}
                  >
                    {expandedTopicDetails[topic.id] ? 'Hide details' : 'Open details'}
                  </button>
                </div>

                <div className="member-card-summary-row">
                  <span className="member-card-summary-pill">{topic.is_active ? 'Active' : 'Inactive'}</span>
                  <span className="member-card-summary-pill">{formatLabel(topic.topic_type)}</span>
                  <span className="member-card-summary-pill">{topic.program_name || 'No program'}</span>
                  <span className="member-card-summary-pill">{topic.parent_topic_title || 'Top level'}</span>
                </div>

                <div className="inline-actions">
                  <Link className="secondary-button" to={`/index?search=${encodeURIComponent(topic.title)}`}>
                    Open Curriculum
                  </Link>
                  <Link className="secondary-button" to={`/library?topicId=${topic.id}`}>
                    Open Library
                  </Link>
                  {isManagement ? (
                    topic.is_active ? (
                      <button
                        className="danger-button"
                        onClick={() => handleSetActiveState(topic, false)}
                        disabled={activeTopicId === topic.id}
                      >
                        {activeTopicId === topic.id ? 'Updating...' : 'Deactivate'}
                      </button>
                    ) : (
                      <button
                        className="secondary-button"
                        onClick={() => handleSetActiveState(topic, true)}
                        disabled={activeTopicId === topic.id}
                      >
                        {activeTopicId === topic.id ? 'Updating...' : 'Reactivate'}
                      </button>
                    )
                  ) : null}
                </div>

                {expandedTopicDetails[topic.id] ? (
                  <div className="detail-block">
                    <div className="meta-text">Program: {topic.program_name || 'None'}</div>
                    <div className="meta-text">Parent: {topic.parent_topic_title || 'None'}</div>
                    <div className="meta-text">
                      Active: {topic.is_active ? 'Yes' : 'No'}
                    </div>
                    <div>{topic.description || 'No description added yet.'}</div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </ExpandableSection>
    </Layout>
  );
}
