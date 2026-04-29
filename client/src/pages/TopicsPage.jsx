import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import ExpandableSection from '../components/ExpandableSection';
import { formatLabel } from '../utils/formatLabel';
import TopicSearchSelect from '../components/TopicSearchSelect';

export default function TopicsPage() {
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
  const [error, setError] = useState('');

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
      await api.put(`/topics/${topic.id}`, {
        program_id: topic.program_id,
        parent_topic_id: topic.parent_topic_id,
        title: topic.title,
        topic_type: topic.topic_type,
        description: topic.description || '',
        is_active: nextIsActive
      });
      await fetchTopics();
    } catch (err) {
      console.error('Update topic active state error:', err);
      setError(err.response?.data?.message || 'Couldn\'t update that topic right now.');
    }
  };

  return (
    <Layout>
      <h2 className="page-title">Topics</h2>

      <ExpandableSection
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
      </ExpandableSection>

      {error && <p className="error-text">{error}</p>}

      <ExpandableSection
        title="Topic List"
        note="Search and filter your curriculum as the topic library grows."
        summary="Expand this when you want to search, filter, or review the current topic library."
        defaultOpen
        actions={(
          <button
            className="secondary-button"
            onClick={() => setShowInactive((prev) => !prev)}
          >
            {showInactive ? 'Hide Inactive Topics' : 'Show Inactive Topics'}
          </button>
        )}
      >

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

        {loading ? (
          <p className="empty-state">Loading topics...</p>
        ) : filteredTopics.length === 0 ? (
          <p className="empty-state">
            {topics.length === 0 ? 'No topics have been added yet.' : 'No topics match those filters right now.'}
          </p>
        ) : (
          <ul className="card-list">
            {filteredTopics.map((topic) => (
              <li key={topic.id} className="card-item">
                <strong>{topic.title}</strong>
                <div className="detail-block">
                  <div className="meta-text">Type: {formatLabel(topic.topic_type)}</div>
                  <div className="meta-text">Program: {topic.program_name || 'None'}</div>
                  <div className="meta-text">Parent: {topic.parent_topic_title || 'None'}</div>
                  <div className="meta-text">
                    Active: {topic.is_active ? 'Yes' : 'No'}
                  </div>
                  <div>{topic.description || 'No description added yet.'}</div>
                </div>

                <div className="inline-actions">
                  {topic.is_active ? (
                    <button
                      className="danger-button"
                      onClick={() => handleSetActiveState(topic, false)}
                    >
                      Deactivate Topic
                    </button>
                  ) : (
                    <button
                      className="secondary-button"
                      onClick={() => handleSetActiveState(topic, true)}
                    >
                      Make Topic Active Again
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </ExpandableSection>
    </Layout>
  );
}
