import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import TopicSearchSelect from '../components/TopicSearchSelect';
import curriculumIndexSeed from '../data/curriculumIndexSeed';

const skillLevelOrder = ['Beginner', 'Intermediate', 'Advanced'];

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
  if (category === 'drills' || category === 'constraint-led games' || category === 'positional sparring') {
    return 'drill_theme';
  }

  return 'technique';
};

export default function CurriculumIndexPage() {
  const [topics, setTopics] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [libraryEntries, setLibraryEntries] = useState([]);
  const [topicCoverage, setTopicCoverage] = useState([]);
  const [neglectedTopics, setNeglectedTopics] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [skillLevelFilter, setSkillLevelFilter] = useState('');
  const [entryNoticeMap, setEntryNoticeMap] = useState({});
  const [creatingEntryId, setCreatingEntryId] = useState(null);
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [isUpdatingTopic, setIsUpdatingTopic] = useState(false);
  const [createTopicData, setCreateTopicData] = useState({
    title: '',
    topic_type: 'technique',
    program_id: '',
    parent_topic_id: '',
    description: ''
  });
  const [editTopicData, setEditTopicData] = useState({
    title: '',
    topic_type: 'technique',
    program_id: '',
    parent_topic_id: '',
    description: '',
    is_active: 'true'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadIndexSignals = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          topicsRes,
          programsRes,
          libraryRes,
          topicCoverageRes,
          neglectedTopicsRes
        ] = await Promise.all([
          api.get('/topics'),
          api.get('/programs'),
          api.get('/library'),
          api.get('/reports/topic-coverage'),
          api.get('/reports/neglected-topics?days=30')
        ]);

        setTopics(topicsRes.data);
        setPrograms(programsRes.data);
        setLibraryEntries(libraryRes.data);
        setTopicCoverage(topicCoverageRes.data);
        setNeglectedTopics(neglectedTopicsRes.data);
      } catch (err) {
        console.error('Load curriculum index error:', err);
        setError(err.response?.data?.message || 'Couldn\'t load the curriculum index right now.');
      } finally {
        setLoading(false);
      }
    };

    loadIndexSignals();
  }, []);

  const fetchTopics = async () => {
    const response = await api.get('/topics');
    setTopics(response.data);
  };

  const categories = useMemo(() => (
    Array.from(new Set(curriculumIndexSeed.map((entry) => entry.category))).sort()
  ), []);

  const activePrograms = useMemo(
    () => programs.filter((program) => program.is_active),
    [programs]
  );

  const skillLevels = useMemo(() => (
    Array.from(new Set(curriculumIndexSeed.map((entry) => entry.skillLevel))).sort(
      (a, b) => {
        const aIndex = skillLevelOrder.indexOf(a);
        const bIndex = skillLevelOrder.indexOf(b);

        if (aIndex === -1 && bIndex === -1) {
          return a.localeCompare(b);
        }

        if (aIndex === -1) {
          return 1;
        }

        if (bIndex === -1) {
          return -1;
        }

        return aIndex - bIndex;
      }
    )
  ), []);

  const topicMap = useMemo(() => {
    const nextMap = new Map();

    topics.forEach((topic) => {
      nextMap.set(normalizeValue(topic.title), topic);
    });

    return nextMap;
  }, [topics]);

  const coverageMap = useMemo(() => {
    const nextMap = new Map();

    topicCoverage.forEach((item) => {
      nextMap.set(normalizeValue(item.topic_title), item);
    });

    return nextMap;
  }, [topicCoverage]);

  const neglectedSet = useMemo(() => (
    new Set(neglectedTopics.map((item) => normalizeValue(item.topic_title)))
  ), [neglectedTopics]);

  const libraryCountByTopicId = useMemo(() => {
    const counts = new Map();

    libraryEntries.forEach((entry) => {
      if (!entry.curriculum_topic_id) {
        return;
      }

      const key = String(entry.curriculum_topic_id);
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    return counts;
  }, [libraryEntries]);

  const enrichedEntries = useMemo(() => {
    return curriculumIndexSeed.map((entry) => {
      const topic = topicMap.get(normalizeValue(entry.name));
      const coverage = coverageMap.get(normalizeValue(entry.name));
      const linkedLibraryCount = topic
        ? (libraryCountByTopicId.get(String(topic.id)) || 0)
        : 0;

      return {
        ...entry,
        topic,
        coverage,
        linkedLibraryCount,
        isUnderused: neglectedSet.has(normalizeValue(entry.name))
      };
    });
  }, [topicMap, coverageMap, libraryCountByTopicId, neglectedSet]);

  const availableCreateParentTopics = useMemo(() => {
    const activeTopics = topics.filter((topic) => topic.is_active);

    if (!createTopicData.program_id) {
      return activeTopics;
    }

    const matchingTopics = activeTopics.filter((topic) => (
      topic.program_id === null || String(topic.program_id) === String(createTopicData.program_id)
    ));

    return matchingTopics.length > 0 ? matchingTopics : activeTopics;
  }, [createTopicData.program_id, topics]);

  const availableEditParentTopics = useMemo(() => {
    const activeTopics = topics.filter((topic) => topic.is_active);

    if (!editingTopicId) {
      return activeTopics;
    }

    const withoutCurrent = activeTopics.filter((topic) => String(topic.id) !== String(editingTopicId));

    if (!editTopicData.program_id) {
      return withoutCurrent;
    }

    const matchingTopics = withoutCurrent.filter((topic) => (
      topic.program_id === null || String(topic.program_id) === String(editTopicData.program_id)
    ));

    return matchingTopics.length > 0 ? matchingTopics : withoutCurrent;
  }, [editTopicData.program_id, editingTopicId, topics]);

  const filteredEntries = useMemo(() => {
    const normalizedSearch = normalizeValue(search);

    return enrichedEntries.filter((entry) => {
      const haystack = [
        entry.category,
        entry.subcategory,
        entry.name,
        entry.skillLevel,
        entry.description,
        ...(entry.tags || []),
        ...(entry.relatedPositions || [])
      ]
        .filter(Boolean)
        .map(normalizeValue)
        .join(' ');

      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
      const matchesCategory = !categoryFilter || entry.category === categoryFilter;
      const matchesSkillLevel = !skillLevelFilter || entry.skillLevel === skillLevelFilter;

      return matchesSearch && matchesCategory && matchesSkillLevel;
    });
  }, [enrichedEntries, search, categoryFilter, skillLevelFilter]);

  const groupedEntries = useMemo(() => {
    return filteredEntries.reduce((acc, entry) => {
      if (!acc[entry.category]) {
        acc[entry.category] = [];
      }

      acc[entry.category].push(entry);
      return acc;
    }, {});
  }, [filteredEntries]);

  const summaryCards = useMemo(() => {
    const linkedTopicCount = enrichedEntries.filter((entry) => entry.topic).length;
    const usedInClassesCount = enrichedEntries.filter(
      (entry) => Number(entry.coverage?.total_times_used || 0) > 0
    ).length;

    return [
      { label: 'Indexed Items', value: curriculumIndexSeed.length },
      { label: 'Categories', value: categories.length },
      { label: 'Linked Topics', value: linkedTopicCount },
      { label: 'Used In Class Logs', value: usedInClassesCount }
    ];
  }, [enrichedEntries, categories.length]);

  const handleCheckClassUsage = (entry, usageCount) => {
    setEntryNoticeMap((prev) => ({
      ...prev,
      [entry.id]: usageCount > 0
        ? 'Recent usage is available in Reports right now. A class-by-class drill-down can be the next phase.'
        : 'No recent classes have been logged for this item yet.'
    }));
  };

  const handleOpenCreateTopic = (entry) => {
    setCreatingEntryId(entry.id);
    setCreateTopicData({
      title: entry.name,
      topic_type: inferTopicType(entry),
      program_id: '',
      parent_topic_id: '',
      description: entry.description || ''
    });
    setEntryNoticeMap((prev) => ({
      ...prev,
      [entry.id]: ''
    }));
  };

  const handleCreateTopicChange = (e) => {
    const { name, value } = e.target;

    setCreateTopicData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateTopic = async (entry) => {
    if (!createTopicData.title.trim()) {
      setEntryNoticeMap((prev) => ({
        ...prev,
        [entry.id]: 'Add a topic title before creating it.'
      }));
      return;
    }

    try {
      setIsCreatingTopic(true);

      await api.post('/topics', {
        program_id: createTopicData.program_id ? Number(createTopicData.program_id) : null,
        parent_topic_id: createTopicData.parent_topic_id ? Number(createTopicData.parent_topic_id) : null,
        title: createTopicData.title.trim(),
        topic_type: createTopicData.topic_type,
        description: createTopicData.description || ''
      });

      await fetchTopics();
      setCreatingEntryId(null);
      setEntryNoticeMap((prev) => ({
        ...prev,
        [entry.id]: 'Topic created successfully. This item is now available in Topics and other curriculum workflows.'
      }));
    } catch (err) {
      console.error('Create topic from curriculum index error:', err);
      setEntryNoticeMap((prev) => ({
        ...prev,
        [entry.id]: err.response?.data?.message || 'Couldn\'t create that topic just now.'
      }));
    } finally {
      setIsCreatingTopic(false);
    }
  };

  const handleOpenEditTopic = (entry) => {
    if (!entry.topic) {
      return;
    }

    setCreatingEntryId(null);
    setEditingTopicId(entry.topic.id);
    setEditTopicData({
      title: entry.topic.title || entry.name,
      topic_type: entry.topic.topic_type || inferTopicType(entry),
      program_id: entry.topic.program_id ? String(entry.topic.program_id) : '',
      parent_topic_id: entry.topic.parent_topic_id ? String(entry.topic.parent_topic_id) : '',
      description: entry.topic.description || entry.description || '',
      is_active: entry.topic.is_active ? 'true' : 'false'
    });
    setEntryNoticeMap((prev) => ({
      ...prev,
      [entry.id]: ''
    }));
  };

  const handleEditTopicChange = (e) => {
    const { name, value } = e.target;

    setEditTopicData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateTopic = async (entry) => {
    if (!entry.topic) {
      return;
    }

    if (!editTopicData.title.trim()) {
      setEntryNoticeMap((prev) => ({
        ...prev,
        [entry.id]: 'Add a topic title before saving changes.'
      }));
      return;
    }

    try {
      setIsUpdatingTopic(true);

      await api.put(`/topics/${entry.topic.id}`, {
        program_id: editTopicData.program_id ? Number(editTopicData.program_id) : null,
        parent_topic_id: editTopicData.parent_topic_id ? Number(editTopicData.parent_topic_id) : null,
        title: editTopicData.title.trim(),
        topic_type: editTopicData.topic_type,
        description: editTopicData.description || '',
        is_active: editTopicData.is_active === 'true'
      });

      await fetchTopics();
      setEditingTopicId(null);
      setEntryNoticeMap((prev) => ({
        ...prev,
        [entry.id]: 'Topic updated successfully from the Curriculum Index.'
      }));
    } catch (err) {
      console.error('Update topic from curriculum index error:', err);
      setEntryNoticeMap((prev) => ({
        ...prev,
        [entry.id]: err.response?.data?.message || 'Couldn\'t update that topic just now.'
      }));
    } finally {
      setIsUpdatingTopic(false);
    }
  };

  const handleToggleTopicActive = async (entry, nextIsActive) => {
    if (!entry.topic) {
      return;
    }

    const confirmed = window.confirm(
      nextIsActive
        ? 'Make this topic active again?'
        : 'Make this topic inactive? It will stay in the curriculum, but it will be hidden from the default view.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setEntryNoticeMap((prev) => ({
        ...prev,
        [entry.id]: ''
      }));

      await api.put(`/topics/${entry.topic.id}`, {
        program_id: entry.topic.program_id ?? null,
        parent_topic_id: entry.topic.parent_topic_id ?? null,
        title: entry.topic.title,
        topic_type: entry.topic.topic_type,
        description: entry.topic.description || '',
        is_active: nextIsActive
      });

      await fetchTopics();
      setEntryNoticeMap((prev) => ({
        ...prev,
        [entry.id]: nextIsActive
          ? 'Topic made active again successfully.'
          : 'Topic made inactive successfully.'
      }));
    } catch (err) {
      console.error('Toggle topic active state from curriculum index error:', err);
      setEntryNoticeMap((prev) => ({
        ...prev,
        [entry.id]: err.response?.data?.message || 'Couldn\'t update that topic right now.'
      }));
    }
  };

  return (
    <Layout>
      <div className="curriculum-index-page">
        <h2 className="page-title">Curriculum Index</h2>
        <p className="page-intro">
          Search the broader curriculum map and quickly see whether an item exists in Topics, has shown up in class logs, or already has supporting Library entries.
        </p>

        {error && <p className="error-text">{error}</p>}

        <section className="stats-grid">
          {summaryCards.map((card) => (
            <div key={card.label} className="stat-card">
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
            </div>
          ))}
        </section>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>Search the index</h3>
              <p className="section-note">Use this as a master reference layer before something has been fully built out elsewhere in the app.</p>
            </div>
          </div>

          <div className="filter-grid">
            <div>
              <label>Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, category, tag, or related position..."
              />
            </div>

            <div>
              <label>Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Skill level</label>
              <select
                value={skillLevelFilter}
                onChange={(e) => setSkillLevelFilter(e.target.value)}
              >
                <option value="">All skill levels</option>
                {skillLevels.map((skillLevel) => (
                  <option key={skillLevel} value={skillLevel}>
                    {skillLevel}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>Index results</h3>
              <p className="section-note">Use this as both a curriculum reference layer and the first place to add operational topics when they do not exist yet.</p>
            </div>
          </div>

          {loading ? (
            <p className="empty-state">Loading curriculum signals...</p>
          ) : filteredEntries.length === 0 ? (
            <p className="empty-state">No index items match that search right now.</p>
          ) : (
            <div className="curriculum-index-groups">
              {Object.entries(groupedEntries).map(([category, entries]) => (
                <section key={category} className="curriculum-index-group">
                  <div className="curriculum-index-group-header">
                    <h4>{category}</h4>
                    <span className="meta-text">{entries.length} items</span>
                  </div>

                  <div className="card-list">
                    {entries.map((entry) => {
                      const usageCount = Number(entry.coverage?.total_times_used || 0);

                      return (
                        <article key={entry.id} className="card-item curriculum-index-card">
                          <div className="curriculum-index-card-header">
                            <div className="curriculum-index-title-block">
                              <span className="eyebrow">{entry.subcategory || entry.category}</span>
                              <strong>{entry.name}</strong>
                            </div>
                            <span className="curriculum-index-skill-level">{entry.skillLevel}</span>
                          </div>

                          <div className="detail-block">
                            <div>{entry.description}</div>

                            {entry.tags?.length ? (
                              <div className="curriculum-index-tag-row">
                                {entry.tags.map((tag) => (
                                  <span key={tag} className="curriculum-index-tag">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            ) : null}

                            {entry.relatedPositions?.length ? (
                              <div className="meta-text">
                                Related positions: {entry.relatedPositions.join(', ')}
                              </div>
                            ) : null}

                            <div className="curriculum-index-status-grid">
                              <div className="curriculum-index-status-card">
                                <span className="meta-text">Topics</span>
                                <strong>{entry.topic ? 'Available' : 'Not added yet'}</strong>
                                <div className="meta-text">
                                  {entry.topic
                                    ? 'This item already exists in Topics.'
                                    : 'This item has not been added to Topics yet.'}
                                </div>
                              </div>

                              <div className="curriculum-index-status-card">
                                <span className="meta-text">Class usage</span>
                                <strong>
                                  {usageCount > 0
                                    ? `${usageCount} logged uses`
                                    : entry.isUnderused
                                      ? 'Not used recently'
                                      : 'Not used yet'}
                                </strong>
                                <div className="meta-text">
                                  {usageCount > 0
                                    ? 'This item has shown up in recent class logs.'
                                    : 'No recent class usage has been logged for this item yet.'}
                                </div>
                              </div>

                              <div className="curriculum-index-status-card">
                                <span className="meta-text">Library</span>
                                <strong>
                                  {entry.linkedLibraryCount > 0
                                    ? `${entry.linkedLibraryCount} linked entries`
                                    : 'No linked entries yet'}
                                </strong>
                                <div className="meta-text">
                                  {entry.linkedLibraryCount > 0
                                    ? 'Supporting Library material is already connected.'
                                    : 'No Library entries are linked to this item yet.'}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="inline-actions curriculum-index-actions">
                            {!entry.topic ? (
                              <button
                                type="button"
                                className="secondary-button"
                                onClick={() => handleOpenCreateTopic(entry)}
                              >
                                Add to Topics
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={() => handleOpenEditTopic(entry)}
                                >
                                  Edit topic
                                </button>
                                {entry.topic.is_active ? (
                                  <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => handleToggleTopicActive(entry, false)}
                                  >
                                    Make inactive
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => handleToggleTopicActive(entry, true)}
                                  >
                                    Make active
                                  </button>
                                )}
                                {usageCount > 0 ? (
                                  <Link className="secondary-button curriculum-index-action-link" to="/reports">
                                    View usage in reports
                                  </Link>
                                ) : (
                                  <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => handleCheckClassUsage(entry, usageCount)}
                                  >
                                    Check class usage
                                  </button>
                                )}
                              </>
                            )}
                          </div>

                          {creatingEntryId === entry.id ? (
                            <div className="quick-add-panel curriculum-index-create-panel">
                              <label>Topic title</label>
                              <input
                                type="text"
                                name="title"
                                value={createTopicData.title}
                                onChange={handleCreateTopicChange}
                              />

                              <label>Topic type</label>
                              <select
                                name="topic_type"
                                value={createTopicData.topic_type}
                                onChange={handleCreateTopicChange}
                              >
                                <option value="position">Position</option>
                                <option value="technique">Technique</option>
                                <option value="concept">Concept</option>
                                <option value="submission">Submission</option>
                                <option value="escape">Escape</option>
                                <option value="takedown">Takedown</option>
                                <option value="drill_theme">Drill Theme</option>
                              </select>

                              <label>Program</label>
                              <select
                                name="program_id"
                                value={createTopicData.program_id}
                                onChange={handleCreateTopicChange}
                              >
                                <option value="">No program</option>
                                {activePrograms.map((program) => (
                                  <option key={program.id} value={program.id}>
                                    {program.name}
                                  </option>
                                ))}
                              </select>

                              <label>Parent topic</label>
                              <TopicSearchSelect
                                topics={availableCreateParentTopics}
                                value={createTopicData.parent_topic_id}
                                onChange={(topicId) => setCreateTopicData((prev) => ({
                                  ...prev,
                                  parent_topic_id: topicId
                                }))}
                                placeholder="Search parent topics..."
                                emptySelectionLabel="No parent topic selected"
                                helperText="Search and select a parent topic if this item belongs under another one."
                              />

                              <label>Description</label>
                              <textarea
                                name="description"
                                rows={3}
                                value={createTopicData.description}
                                onChange={handleCreateTopicChange}
                              />

                              <p className="section-note curriculum-index-inline-note">
                                This lets the item enter the operational curriculum with hierarchy in place from the start.
                              </p>

                              <div className="inline-actions">
                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={() => handleCreateTopic(entry)}
                                  disabled={isCreatingTopic}
                                >
                                  {isCreatingTopic ? 'Creating topic...' : 'Create topic'}
                                </button>
                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={() => setCreatingEntryId(null)}
                                  disabled={isCreatingTopic}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : null}

                          {editingTopicId === entry.topic?.id ? (
                            <div className="quick-add-panel curriculum-index-create-panel">
                              <label>Topic title</label>
                              <input
                                type="text"
                                name="title"
                                value={editTopicData.title}
                                onChange={handleEditTopicChange}
                              />

                              <label>Topic type</label>
                              <select
                                name="topic_type"
                                value={editTopicData.topic_type}
                                onChange={handleEditTopicChange}
                              >
                                <option value="position">Position</option>
                                <option value="technique">Technique</option>
                                <option value="concept">Concept</option>
                                <option value="submission">Submission</option>
                                <option value="escape">Escape</option>
                                <option value="takedown">Takedown</option>
                                <option value="drill_theme">Drill Theme</option>
                              </select>

                              <label>Program</label>
                              <select
                                name="program_id"
                                value={editTopicData.program_id}
                                onChange={handleEditTopicChange}
                              >
                                <option value="">No program</option>
                                {activePrograms.map((program) => (
                                  <option key={program.id} value={program.id}>
                                    {program.name}
                                  </option>
                                ))}
                              </select>

                              <label>Parent topic</label>
                              <TopicSearchSelect
                                topics={availableEditParentTopics}
                                value={editTopicData.parent_topic_id}
                                onChange={(topicId) => setEditTopicData((prev) => ({
                                  ...prev,
                                  parent_topic_id: topicId
                                }))}
                                placeholder="Search parent topics..."
                                emptySelectionLabel="No parent topic selected"
                                helperText="Search and select a parent topic if this topic belongs under another one."
                              />

                              <label>Description</label>
                              <textarea
                                name="description"
                                rows={3}
                                value={editTopicData.description}
                                onChange={handleEditTopicChange}
                              />

                              <label>Active status</label>
                              <select
                                name="is_active"
                                value={editTopicData.is_active}
                                onChange={handleEditTopicChange}
                              >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                              </select>

                              <p className="section-note curriculum-index-inline-note">
                                You can update the hierarchy here now, alongside the rest of the topic details.
                              </p>

                              <div className="inline-actions">
                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={() => handleUpdateTopic(entry)}
                                  disabled={isUpdatingTopic}
                                >
                                  {isUpdatingTopic ? 'Saving topic...' : 'Save topic'}
                                </button>
                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={() => setEditingTopicId(null)}
                                  disabled={isUpdatingTopic}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : null}

                          {entryNoticeMap[entry.id] ? (
                            <p className="section-note curriculum-index-inline-note">
                              {entryNoticeMap[entry.id]}
                            </p>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
