import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import curriculumIndexSeed from '../data/curriculumIndexSeed';

const skillLevelOrder = ['Beginner', 'Intermediate', 'Advanced'];

const normalizeValue = (value) => (
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
);

export default function CurriculumIndexPage() {
  const [topics, setTopics] = useState([]);
  const [libraryEntries, setLibraryEntries] = useState([]);
  const [topicCoverage, setTopicCoverage] = useState([]);
  const [neglectedTopics, setNeglectedTopics] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [skillLevelFilter, setSkillLevelFilter] = useState('');
  const [entryNoticeMap, setEntryNoticeMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadIndexSignals = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          topicsRes,
          libraryRes,
          topicCoverageRes,
          neglectedTopicsRes
        ] = await Promise.all([
          api.get('/topics'),
          api.get('/library'),
          api.get('/reports/topic-coverage'),
          api.get('/reports/neglected-topics?days=30')
        ]);

        setTopics(topicsRes.data);
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

  const categories = useMemo(() => (
    Array.from(new Set(curriculumIndexSeed.map((entry) => entry.category))).sort()
  ), []);

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
              <p className="section-note">This first version is read-only and designed to show where each item currently connects across the app.</p>
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
                          </div>

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
