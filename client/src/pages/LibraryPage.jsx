import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { formatSentenceLabel } from '../utils/formatLabel';
import TopicSearchSelect from '../components/TopicSearchSelect';

export default function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [entries, setEntries] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [topics, setTopics] = useState([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [programFilter, setProgramFilter] = useState(searchParams.get('programId') || '');
  const [topicFilter, setTopicFilter] = useState(searchParams.get('topicId') || '');
  const [entryTypeFilter, setEntryTypeFilter] = useState(searchParams.get('entryType') || '');
  const [needsTopicOnly, setNeedsTopicOnly] = useState(searchParams.get('needsTopic') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'updated_desc');
  const [showInactive, setShowInactive] = useState(false);
  const [showCreateEntryForm, setShowCreateEntryForm] = useState(false);
  const [showLibraryGuide, setShowLibraryGuide] = useState(false);
  const [expandedEntryDetails, setExpandedEntryDetails] = useState({});
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    program_id: '',
    curriculum_topic_id: '',
    title: '',
    entry_type: 'video_note',
    description: '',
    video_url: '',
    visibility: 'coach_only'
  });
  const [formData, setFormData] = useState({
    program_id: '',
    curriculum_topic_id: '',
    title: '',
    entry_type: 'video_note',
    description: '',
    video_url: '',
    visibility: 'coach_only'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const entryTypes = ['technique', 'concept', 'drill', 'cla_game', 'video_note'];
  const visibilityOptions = ['coach_only', 'member_visible'];
  const quickEntryPresets = [
    {
      key: 'video_note',
      label: 'Video note',
      entry_type: 'video_note',
      visibility: 'coach_only',
      description: 'Quick coach-facing teaching note or video reference.'
    },
    {
      key: 'technique',
      label: 'Technique resource',
      entry_type: 'technique',
      visibility: 'member_visible',
      description: 'Technique reference meant to support a specific curriculum topic.'
    },
    {
      key: 'concept',
      label: 'Concept note',
      entry_type: 'concept',
      visibility: 'coach_only',
      description: 'Short conceptual resource for planning, teaching, or review.'
    }
  ];

  const fetchEntries = async () => {
    const response = await api.get('/library');
    setEntries(response.data);
  };

  const fetchPrograms = async () => {
    const response = await api.get('/programs');
    setPrograms(response.data);
  };

  const fetchTopics = async () => {
    const response = await api.get('/topics');
    setTopics(response.data);
  };

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError('');
        await Promise.all([fetchEntries(), fetchPrograms(), fetchTopics()]);
      } catch (err) {
        console.error('Load library page error:', err);
        setError(err.response?.data?.message || 'Couldn\'t load the library right now.');
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (search) nextParams.set('search', search);
    if (programFilter) nextParams.set('programId', programFilter);
    if (topicFilter) nextParams.set('topicId', topicFilter);
    if (entryTypeFilter) nextParams.set('entryType', entryTypeFilter);
    if (needsTopicOnly) nextParams.set('needsTopic', 'true');
    if (sortBy && sortBy !== 'updated_desc') nextParams.set('sort', sortBy);

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [search, programFilter, topicFilter, entryTypeFilter, needsTopicOnly, sortBy, searchParams, setSearchParams]);

  const orderedEntries = useMemo(() => {
    const active = entries.filter((entry) => entry.is_active);
    const inactive = entries.filter((entry) => !entry.is_active);

    const visibleEntries = showInactive ? [...active, ...inactive] : active;

    const getTimestamp = (value) => {
      const time = value ? new Date(value).getTime() : 0;
      return Number.isNaN(time) ? 0 : time;
    };

    return [...visibleEntries].sort((a, b) => {
      if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      }

      if (sortBy === 'title_desc') {
        return b.title.localeCompare(a.title);
      }

      if (sortBy === 'category_asc') {
        const categorySort = formatSentenceLabel(a.entry_type).localeCompare(formatSentenceLabel(b.entry_type));

        if (categorySort !== 0) {
          return categorySort;
        }

        return a.title.localeCompare(b.title);
      }

      if (sortBy === 'created_desc') {
        return getTimestamp(b.created_at) - getTimestamp(a.created_at);
      }

      return getTimestamp(b.updated_at || b.created_at) - getTimestamp(a.updated_at || a.created_at);
    });
  }, [entries, showInactive, sortBy]);

  const filteredEntries = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orderedEntries.filter((entry) => {
      const matchesSearch = !normalizedSearch || [
        entry.title,
        entry.description,
        entry.program_name,
        entry.topic_title,
        formatSentenceLabel(entry.entry_type),
        formatSentenceLabel(entry.visibility)
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));

      const matchesProgram = !programFilter || String(entry.program_id || '') === programFilter;
      const matchesTopic = !topicFilter || String(entry.curriculum_topic_id || '') === topicFilter;
      const matchesEntryType = !entryTypeFilter || entry.entry_type === entryTypeFilter;
      const matchesNeedsTopic = !needsTopicOnly || !entry.curriculum_topic_id;

      return matchesSearch && matchesProgram && matchesTopic && matchesEntryType && matchesNeedsTopic;
    });
  }, [orderedEntries, search, programFilter, topicFilter, entryTypeFilter, needsTopicOnly]);

  const summaryCards = useMemo(() => {
    const linkedTopicCount = filteredEntries.filter((entry) => entry.curriculum_topic_id).length;
    const memberVisibleCount = filteredEntries.filter((entry) => entry.visibility === 'member_visible').length;
    const videoCount = filteredEntries.filter((entry) => entry.video_url).length;

    return [
      { label: 'Visible entries', value: filteredEntries.length },
      { label: 'Linked to topics', value: linkedTopicCount },
      { label: 'Member visible', value: memberVisibleCount },
      { label: 'Videos linked', value: videoCount }
    ];
  }, [filteredEntries]);

  const selectedTopic = useMemo(
    () => topics.find((topic) => String(topic.id) === topicFilter) || null,
    [topics, topicFilter]
  );

  const selectedProgram = useMemo(
    () => programs.find((program) => String(program.id) === programFilter) || null,
    [programs, programFilter]
  );

  const activeFilters = useMemo(() => {
    const nextFilters = [];

    if (search) {
      nextFilters.push({ key: 'search', label: `Search: ${search}` });
    }

    if (selectedProgram) {
      nextFilters.push({ key: 'program', label: `Program: ${selectedProgram.name}` });
    }

    if (selectedTopic) {
      nextFilters.push({ key: 'topic', label: `Topic: ${selectedTopic.title}` });
    }

    if (entryTypeFilter) {
      nextFilters.push({ key: 'entryType', label: `Type: ${formatSentenceLabel(entryTypeFilter)}` });
    }

    if (needsTopicOnly) {
      nextFilters.push({ key: 'needsTopic', label: 'Needs topic' });
    }

    return nextFilters;
  }, [search, selectedProgram, selectedTopic, entryTypeFilter, needsTopicOnly]);

  const availableTopics = useMemo(() => {
    const activeTopics = topics.filter((topic) => topic.is_active);

    if (!formData.program_id) {
      return activeTopics;
    }

    const matchingTopics = activeTopics.filter((topic) => (
      topic.program_id === null || String(topic.program_id) === String(formData.program_id)
    ));

    return matchingTopics.length > 0 ? matchingTopics : activeTopics;
  }, [topics, formData.program_id]);

  const clearTopicFocus = () => {
    setTopicFilter('');
  };

  const clearAllFilters = () => {
    setSearch('');
    setProgramFilter('');
    setTopicFilter('');
    setEntryTypeFilter('');
    setNeedsTopicOnly(false);
    setSortBy('updated_desc');
  };

  const handleFocusTopic = (topicId) => {
    setTopicFilter(String(topicId));
  };

  useEffect(() => {
    if (!selectedTopic) {
      return;
    }

    setFormData((prev) => {
      if (prev.curriculum_topic_id) {
        return prev;
      }

      return {
        ...prev,
        curriculum_topic_id: String(selectedTopic.id),
        program_id: prev.program_id || (selectedTopic.program_id ? String(selectedTopic.program_id) : '')
      };
    });
  }, [selectedTopic]);

  const handleChange = (e) => {
    setSuccessMessage('');
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleEditChange = (e) => {
    setSuccessMessage('');
    setEditFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleTopicChange = (topicId) => {
    setSuccessMessage('');
    setFormData((prev) => ({
      ...prev,
      curriculum_topic_id: topicId
    }));
  };

  const handleEditTopicChange = (topicId) => {
    setSuccessMessage('');
    setEditFormData((prev) => ({
      ...prev,
      curriculum_topic_id: topicId
    }));
  };

  const handleApplyPreset = (preset) => {
    setSuccessMessage('');
    setFormData((prev) => ({
      ...prev,
      entry_type: preset.entry_type,
      visibility: preset.visibility
    }));
    setShowCreateEntryForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        program_id: formData.program_id ? Number(formData.program_id) : null,
        curriculum_topic_id: formData.curriculum_topic_id
          ? Number(formData.curriculum_topic_id)
          : null,
        title: formData.title,
        entry_type: formData.entry_type,
        description: formData.description || null,
        video_url: formData.video_url || null,
        visibility: formData.visibility
      };

      await api.post('/library', payload);

      setFormData({
        program_id: '',
        curriculum_topic_id: '',
        title: '',
        entry_type: 'video_note',
        description: '',
        video_url: '',
        visibility: 'coach_only'
      });

      await fetchEntries();
      setSuccessMessage('Library entry saved successfully.');
    } catch (err) {
      console.error('Create library entry error:', err);
      setError(err.response?.data?.message || 'Couldn\'t create that library entry just now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetActiveState = async (entry, nextIsActive) => {
    const confirmed = window.confirm(
      nextIsActive
        ? 'Make this library entry active again?'
        : 'Make this library entry inactive? It will stay in the system, but it will be hidden from the default view.'
    );
    if (!confirmed) return;

    try {
      setError('');
      await api.put(`/library/${entry.id}`, {
        program_id: entry.program_id,
        curriculum_topic_id: entry.curriculum_topic_id,
        title: entry.title,
        entry_type: entry.entry_type,
        description: entry.description || null,
        video_url: entry.video_url || null,
        visibility: entry.visibility,
        is_active: nextIsActive
      });
      await fetchEntries();
    } catch (err) {
      console.error('Update library entry active state error:', err);
      setError(err.response?.data?.message || 'Couldn\'t update that library entry right now.');
    }
  };

  const startEditingEntry = (entry) => {
    setSuccessMessage('');
    setError('');
    setEditingEntryId(entry.id);
    setEditFormData({
      program_id: entry.program_id ? String(entry.program_id) : '',
      curriculum_topic_id: entry.curriculum_topic_id ? String(entry.curriculum_topic_id) : '',
      title: entry.title || '',
      entry_type: entry.entry_type || 'video_note',
      description: entry.description || '',
      video_url: entry.video_url || '',
      visibility: entry.visibility || 'coach_only'
    });
  };

  const cancelEditingEntry = () => {
    setEditingEntryId(null);
    setEditFormData({
      program_id: '',
      curriculum_topic_id: '',
      title: '',
      entry_type: 'video_note',
      description: '',
      video_url: '',
      visibility: 'coach_only'
    });
  };

  const handleUpdateEntry = async (e, entry) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await api.put(`/library/${entry.id}`, {
        program_id: editFormData.program_id ? Number(editFormData.program_id) : null,
        curriculum_topic_id: editFormData.curriculum_topic_id
          ? Number(editFormData.curriculum_topic_id)
          : null,
        title: editFormData.title,
        entry_type: editFormData.entry_type,
        description: editFormData.description || null,
        video_url: editFormData.video_url || null,
        visibility: editFormData.visibility,
        is_active: entry.is_active
      });

      await fetchEntries();
      cancelEditingEntry();
      setSuccessMessage('Library entry updated successfully.');
    } catch (err) {
      console.error('Update library entry error:', err);
      setError(err.response?.data?.message || 'Couldn\'t update that library entry right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEntryDetails = (entryId) => {
    setExpandedEntryDetails((prev) => ({
      ...prev,
      [entryId]: !prev[entryId]
    }));
  };

  const formSelectedProgram = useMemo(
    () => programs.find((program) => String(program.id) === String(formData.program_id)) || null,
    [programs, formData.program_id]
  );

  const formSelectedTopic = useMemo(
    () => topics.find((topic) => String(topic.id) === String(formData.curriculum_topic_id)) || null,
    [topics, formData.curriculum_topic_id]
  );

  const createEntrySummary = useMemo(() => ([
    { label: 'Type', value: formatSentenceLabel(formData.entry_type) },
    { label: 'Visibility', value: formatSentenceLabel(formData.visibility) },
    { label: 'Program', value: formSelectedProgram?.name || 'No program' },
    { label: 'Linked topic', value: formSelectedTopic?.title || 'No topic linked' }
  ]), [formData.entry_type, formData.visibility, formSelectedProgram, formSelectedTopic]);

  const getTopicsForProgram = (programId) => {
    const activeTopics = topics.filter((topic) => topic.is_active);

    if (!programId) {
      return activeTopics;
    }

    const matchingTopics = activeTopics.filter((topic) => (
      topic.program_id === null || String(topic.program_id) === String(programId)
    ));

    return matchingTopics.length > 0 ? matchingTopics : activeTopics;
  };

  return (
    <Layout>
      <h2 className="page-title">Library</h2>

      <section className="page-section" style={{ maxWidth: '760px' }}>
        <div className="compact-form-shell">
          <div className="compact-form-header">
            <div>
              <h3>Create Library Entry</h3>
              <p className="section-note">
                Add a teaching resource, video note, or reference and only open the full form when you are ready to log it.
              </p>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowCreateEntryForm((prev) => !prev)}
            >
              {showCreateEntryForm ? 'Hide form' : 'Show form'}
            </button>
          </div>

          <div className="library-preset-row">
            {quickEntryPresets.map((preset) => (
              <button
                key={preset.key}
                type="button"
                className="secondary-button"
                onClick={() => handleApplyPreset(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="library-preset-help meta-text">
            Pick a quick start above to prefill the most common entry patterns, then open the form only when you are ready to finish the details.
          </div>

          {showCreateEntryForm && (
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="class-flow-summary-grid library-create-summary" style={{ gridColumn: '1 / -1' }}>
                {createEntrySummary.map((item) => (
                  <div key={item.label} className="summary-card">
                    <div className="meta-text">{item.label}</div>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>

              {selectedTopic ? (
                <div className="library-linked-topic-banner" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                  <div>
                    <strong>Creating from the current topic focus</strong>
                    <div className="meta-text">
                      New entries can start linked to {selectedTopic.title} so your library grows directly around the curriculum.
                    </div>
                  </div>
                </div>
              ) : null}

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
                <label>Entry Type</label>
                <select
                  name="entry_type"
                  value={formData.entry_type}
                  onChange={handleChange}
                >
                  {entryTypes.map((type) => (
                    <option key={type} value={type}>
                      {formatSentenceLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

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
                <label>Curriculum Topic</label>
                <TopicSearchSelect
                  topics={availableTopics}
                  value={formData.curriculum_topic_id}
                  onChange={handleTopicChange}
                  placeholder="Search curriculum topics for this entry..."
                  emptySelectionLabel="No topic selected"
                  helperText="Search and select a curriculum topic if this entry should be linked."
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <div className="meta-text">
                  Tip: link entries to a curriculum topic whenever possible so they are easier to find from the Index and class-planning flows.
                </div>
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
                <label>Video URL</label>
                <input
                  type="text"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Visibility</label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                >
                  {visibilityOptions.map((option) => (
                    <option key={option} value={option}>
                      {formatSentenceLabel(option)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Library Entry'}
                </button>
              </div>

              {successMessage ? (
                <div style={{ gridColumn: '1 / -1' }}>
                  <p className="success-text" style={{ marginBottom: 0 }}>{successMessage}</p>
                </div>
              ) : null}
            </form>
          )}
        </div>
      </section>

      {error && <p className="error-text">{error}</p>}

      <section className="page-section">
        <div className="summary-grid" style={{ marginBottom: '16px' }}>
          {summaryCards.map((card) => (
            <div key={card.label} className="summary-card">
              <div className="meta-text">{card.label}</div>
              <strong style={{ fontSize: '1.4rem' }}>{card.value}</strong>
            </div>
          ))}
        </div>

        <div className="compact-form-shell" style={{ marginBottom: '16px' }}>
          <div className="compact-form-header">
            <div>
              <h3>Find the right resource fast</h3>
              <p className="section-note">
                Search by title, topic, program, description, or resource type, then narrow the list with quick filters.
              </p>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowLibraryGuide((prev) => !prev)}
            >
              {showLibraryGuide ? 'Hide guide' : 'How Library Works'}
            </button>
          </div>

          {showLibraryGuide ? (
            <div className="library-guide-panel">
              <div>
                <strong>Before Library can show resources, the topic must exist in this gym&apos;s Curriculum Index.</strong>
                <p className="meta-text">
                  The full Index gives you the master map, but Library only searches saved resources for this gym. If no video or note has been created yet, Library will correctly show nothing.
                </p>
              </div>
              <div className="library-guide-steps">
                <span>1. Add the topic from Curriculum Index into this gym&apos;s curriculum topics.</span>
                <span>2. Create a library entry, video note, or teaching resource.</span>
                <span>3. Link that resource to the added topic so it appears in Library searches.</span>
              </div>
              <div className="inline-actions">
                <Link className="secondary-button library-topic-link-button" to="/index">
                  Go to Curriculum Index
                </Link>
                <button
                  type="button"
                  className="secondary-button library-topic-link-button"
                  onClick={() => setShowCreateEntryForm(true)}
                >
                  Create Library Entry
                </button>
              </div>
            </div>
          ) : null}

          {selectedTopic ? (
            <div className="library-linked-topic-banner">
              <div>
                <strong>Showing resources linked to {selectedTopic.title}</strong>
                <div className="meta-text">
                  This filtered view came from the Curriculum Index, so you can stay focused on supporting material for that topic.
                </div>
              </div>
              <div className="inline-actions">
                <Link
                  className="secondary-button"
                  to={`/index?search=${encodeURIComponent(selectedTopic.title)}`}
                >
                  Back to Index item
                </Link>
                <button type="button" className="secondary-button" onClick={clearTopicFocus}>
                  Clear topic focus
                </button>
              </div>
            </div>
          ) : null}

          <div className="form-grid">
            <div>
              <label>Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search the library..."
              />
            </div>

            <div>
              <label>Program</label>
              <select value={programFilter} onChange={(e) => setProgramFilter(e.target.value)}>
                <option value="">All programs</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Topic</label>
              <TopicSearchSelect
                topics={topics.filter((topic) => topic.is_active)}
                value={topicFilter}
                onChange={setTopicFilter}
                placeholder="Search added curriculum topics..."
                emptySelectionLabel="All topics"
                helperText="Library links to topics added to this gym. Add missing items from the Curriculum Index first."
              />
            </div>

            <div>
              <label>Resource Type</label>
              <select value={entryTypeFilter} onChange={(e) => setEntryTypeFilter(e.target.value)}>
                <option value="">All resource types</option>
                {entryTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatSentenceLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Sort</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="updated_desc">Recently updated</option>
                <option value="created_desc">Recently created</option>
                <option value="title_asc">Title A-Z</option>
                <option value="category_asc">Category A-Z</option>
              </select>
            </div>
          </div>

          <div className="library-quick-filter-row">
            <button
              type="button"
              className={`library-filter-toggle${needsTopicOnly ? ' is-active' : ''}`}
              onClick={() => setNeedsTopicOnly((prev) => !prev)}
            >
              Needs topic
            </button>
            <span className="meta-text">
              Use this to clean up resources that are not tied to the Curriculum Index yet.
            </span>
          </div>

          {activeFilters.length > 0 ? (
            <div className="library-active-filters">
              <div className="library-filter-chip-row">
                {activeFilters.map((filter) => (
                  <span key={filter.key} className="library-filter-chip">
                    {filter.label}
                  </span>
                ))}
              </div>
              <button type="button" className="secondary-button" onClick={clearAllFilters}>
                Clear filters
              </button>
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <h3 style={{ marginBottom: 0 }}>Library Entries</h3>
          <button
            className="secondary-button"
            onClick={() => setShowInactive((prev) => !prev)}
          >
            {showInactive ? 'Hide Inactive Entries' : 'Show Inactive Entries'}
          </button>
        </div>

        {loading ? (
          <p className="empty-state">Loading library...</p>
        ) : filteredEntries.length === 0 ? (
          <div className="empty-state">
            <div className="library-empty-callout">
              <strong>No saved library resources found yet.</strong>
              <p className="meta-text">
                Library does not pull every Curriculum Index item automatically. First add the topic to this gym&apos;s Curriculum Index, then create a video note, teaching resource, or concept note linked to it.
              </p>
              <p className="meta-text">
                If you searched for a technique and this is blank, it usually means no video/resource has been saved for that topic yet.
              </p>
            </div>
            <div className="inline-actions" style={{ justifyContent: 'center' }}>
              <Link className="secondary-button" to="/index">
                Add Topic in Curriculum Index
              </Link>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowLibraryGuide(true)}
              >
                Show Library Guide
              </button>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowCreateEntryForm(true)}
            >
              Create a library entry
            </button>
          </div>
        ) : (
          <ul className="card-list">
            {filteredEntries.map((entry) => (
              <li key={entry.id} className="card-item compact-topic-card">
                <div className="compact-topic-header">
                  <div>
                    <div className="library-card-title-row">
                      <strong>{entry.title}</strong>
                      <span className={`library-status-chip ${entry.visibility === 'member_visible' ? 'is-member-visible' : ''}`}>
                        {formatSentenceLabel(entry.visibility)}
                      </span>
                      {!entry.curriculum_topic_id && (
                        <span className="library-status-chip is-warning">Needs topic</span>
                      )}
                    </div>
                    <div className="library-card-chip-row">
                      <span className="library-info-chip">{formatSentenceLabel(entry.entry_type)}</span>
                      <span className="library-info-chip">{entry.program_name || 'No program'}</span>
                      {entry.curriculum_topic_id ? (
                        <button
                          type="button"
                          className="library-topic-chip"
                          onClick={() => handleFocusTopic(entry.curriculum_topic_id)}
                        >
                          {entry.topic_title}
                        </button>
                      ) : (
                        <span
                          className="ui-tooltip-trigger"
                          data-tooltip="Link this Library entry to a Curriculum Index topic first to focus it or open it from Index."
                        >
                          <button
                            type="button"
                            className="library-topic-chip"
                            disabled
                          >
                            {entry.topic_title || 'Unlinked library entry'}
                          </button>
                        </span>
                      )}
                    </div>
                    <div className="library-topic-link-row">
                      {entry.curriculum_topic_id ? (
                        <Link
                          className="secondary-button library-topic-link-button"
                          to={`/index?search=${encodeURIComponent(entry.topic_title)}`}
                        >
                          View in Index
                        </Link>
                      ) : null}
                    </div>
                    <div className="meta-text" style={{ marginTop: '6px' }}>
                      {entry.description
                        ? entry.description.length > 120
                          ? `${entry.description.slice(0, 120)}...`
                          : entry.description
                        : 'No description added yet.'}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => toggleEntryDetails(entry.id)}
                  >
                    {expandedEntryDetails[entry.id] ? 'Hide details' : 'Show details'}
                  </button>
                </div>

                {editingEntryId === entry.id && (
                  <form className="form-grid library-edit-form" onSubmit={(event) => handleUpdateEntry(event, entry)}>
                    <div>
                      <label>Title</label>
                      <input
                        type="text"
                        name="title"
                        value={editFormData.title}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div>
                      <label>Entry Type</label>
                      <select
                        name="entry_type"
                        value={editFormData.entry_type}
                        onChange={handleEditChange}
                      >
                        {entryTypes.map((type) => (
                          <option key={type} value={type}>
                            {formatSentenceLabel(type)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label>Program</label>
                      <select
                        name="program_id"
                        value={editFormData.program_id}
                        onChange={handleEditChange}
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
                      <label>Curriculum Topic</label>
                      <TopicSearchSelect
                        topics={getTopicsForProgram(editFormData.program_id)}
                        value={editFormData.curriculum_topic_id}
                        onChange={handleEditTopicChange}
                        placeholder="Search curriculum topics for this entry..."
                        emptySelectionLabel="No topic selected"
                        helperText="Attach this resource to the best matching Index topic."
                      />
                    </div>

                    <div>
                      <label>Video URL</label>
                      <input
                        type="text"
                        name="video_url"
                        value={editFormData.video_url}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div>
                      <label>Visibility</label>
                      <select
                        name="visibility"
                        value={editFormData.visibility}
                        onChange={handleEditChange}
                      >
                        {visibilityOptions.map((option) => (
                          <option key={option} value={option}>
                            {formatSentenceLabel(option)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditChange}
                        rows="4"
                      />
                    </div>

                    <div className="inline-actions" style={{ gridColumn: '1 / -1' }}>
                      <button type="submit" disabled={submitting}>
                        {submitting ? 'Saving...' : 'Save changes'}
                      </button>
                      <button type="button" className="secondary-button" onClick={cancelEditingEntry}>
                        Cancel edit
                      </button>
                    </div>
                  </form>
                )}

                {expandedEntryDetails[entry.id] && (
                  <div className="detail-block">
                    <div className="meta-text">Type: {formatSentenceLabel(entry.entry_type)}</div>
                    <div className="meta-text">Program: {entry.program_name || 'None'}</div>
                    <div className="meta-text">Topic: {entry.topic_title || 'None'}</div>
                    <div className="meta-text">Visibility: {formatSentenceLabel(entry.visibility)}</div>
                    <div className="meta-text">
                      Active: {entry.is_active ? 'Yes' : 'No'}
                    </div>
                    <div className="meta-text">
                      Created By: {entry.created_by_first_name} {entry.created_by_last_name}
                    </div>
                    {entry.created_at && (
                      <div className="meta-text">
                        Created: {new Date(entry.created_at).toLocaleString()}
                      </div>
                    )}
                    {entry.updated_at && (
                      <div className="meta-text">
                        Updated: {new Date(entry.updated_at).toLocaleString()}
                      </div>
                    )}
                    <div>{entry.description || 'No description added yet.'}</div>
                  </div>
                )}

                <div className="inline-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => (
                      editingEntryId === entry.id ? cancelEditingEntry() : startEditingEntry(entry)
                    )}
                  >
                    {editingEntryId === entry.id ? 'Close edit' : 'Edit entry'}
                  </button>
                  {entry.video_url && (
                    <a className="library-resource-link" href={entry.video_url} target="_blank" rel="noreferrer">
                      Open resource
                    </a>
                  )}
                  {entry.is_active ? (
                    <button
                      className="danger-button"
                      onClick={() => handleSetActiveState(entry, false)}
                    >
                      Deactivate Entry
                    </button>
                  ) : (
                    <button
                      className="secondary-button"
                      onClick={() => handleSetActiveState(entry, true)}
                    >
                      Make Entry Active Again
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}
