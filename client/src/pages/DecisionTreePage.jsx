import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import curriculumIndexSeed from '../data/curriculumIndexSeed';

const relationshipGroups = [
  { key: 'entriesIntoPosition', label: 'Entries' },
  { key: 'commonAttacks', label: 'Common attacks' },
  { key: 'commonTransitions', label: 'Common transitions' },
  { key: 'commonFollowUps', label: 'Common follow-ups' },
  { key: 'commonDefenses', label: 'Common defensive reactions' },
  { key: 'relatedPositions', label: 'Related positions' }
];

const skillLevelRank = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3
};

const normalizeValue = (value) => (
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
);

const uniqueValues = (values) => (
  Array.from(new Set(values.filter(Boolean)))
);

const getEntryText = (entry) => normalizeValue([
  entry?.name,
  entry?.category,
  entry?.subcategory,
  entry?.description,
  ...(entry?.tags || []),
  ...(entry?.relatedPositions || []),
  ...(entry?.entriesIntoPosition || []),
  ...(entry?.commonAttacks || []),
  ...(entry?.commonTransitions || []),
  ...(entry?.commonFollowUps || []),
  ...(entry?.commonDefenses || [])
].join(' '));

const styleMatchers = {
  gi: ['gi', 'collar', 'lapel', 'spider', 'lasso', 'worm', 'squid', 'sleeve'],
  nogi: ['no gi', 'nogi', 'wrestling', 'front headlock', 'body lock', 'leg lock', 'heel hook', 'ashi'],
  top: ['top', 'passing', 'pass', 'mount', 'side control', 'north south', 'knee on belly', 'pressure'],
  bottom: ['guard', 'bottom', 'retention', 'sweep', 'reguard', 'closed guard', 'open guard'],
  standing: ['standing', 'takedown', 'clinch', 'single leg', 'double leg', 'snap down'],
  pressure: ['pressure', 'smash', 'body lock', 'crossface', 'underhook', 'pin'],
  mobility: ['mobility', 'float', 'invert', 'berimbolo', 'scramble', 'granby', 'spin'],
  wrestling: ['wrestling', 'single leg', 'double leg', 'snap down', 'front headlock', 'dogfight', 'wrestle up'],
  frontHeadlock: ['front headlock', 'guillotine', 'anaconda', "d'arce", 'snap down', 'sprawl'],
  legLocks: ['leg lock', 'heel hook', 'ashi', 'saddle', '50 50', 'kneebar', 'toe hold', 'aoki'],
  backTakes: ['back take', 'back control', 'seatbelt', 'rear', 'crab ride', 'berimbolo'],
  submissions: ['submission', 'choke', 'armbar', 'kimura', 'triangle', 'finish'],
  escapes: ['escape', 'defense', 'retention', 'reguard', 'survival']
};

const styleHintLabels = {
  gi: 'Gi',
  nogi: 'No-gi',
  top: 'Top',
  bottom: 'Bottom',
  standing: 'Standing',
  pressure: 'Pressure',
  mobility: 'Mobility',
  wrestling: 'Wrestling',
  frontHeadlock: 'Front headlock',
  legLocks: 'Leg locks',
  backTakes: 'Back takes',
  submissions: 'Submissions',
  escapes: 'Escapes'
};

const filterConfig = {
  ruleSet: {
    gi: ['gi'],
    nogi: ['nogi', 'wrestling', 'legLocks', 'frontHeadlock']
  },
  preferredStyle: {
    pressure: ['pressure', 'top'],
    guard: ['bottom'],
    wrestling: ['wrestling', 'standing'],
    legLocks: ['legLocks'],
    backTakes: ['backTakes'],
    submissions: ['submissions'],
    scrambles: ['mobility'],
    defense: ['escapes']
  },
  topBottom: {
    top: ['top'],
    bottom: ['bottom'],
    standing: ['standing']
  },
  bodyType: {
    smaller: ['mobility', 'backTakes', 'wrestling'],
    larger: ['pressure', 'top'],
    longer: ['guard', 'submissions', 'bottom'],
    compact: ['wrestling', 'pressure', 'top']
  },
  flexibility: {
    low: ['top', 'pressure', 'wrestling'],
    medium: ['top', 'bottom', 'standing'],
    high: ['bottom', 'mobility', 'legLocks']
  },
  wrestlingFamiliarity: {
    new: ['bottom', 'guard', 'escapes'],
    comfortable: ['wrestling', 'standing']
  },
  legLockFamiliarity: {
    avoid: ['top', 'pressure', 'backTakes'],
    learning: ['legLocks'],
    comfortable: ['legLocks']
  },
  riskTolerance: {
    low: ['top', 'pressure', 'escapes'],
    medium: ['top', 'bottom', 'submissions'],
    high: ['legLocks', 'mobility', 'backTakes']
  },
  weakArea: {
    guardPassing: ['top', 'pressure'],
    guardRetention: ['escapes', 'bottom'],
    escapes: ['escapes'],
    submissions: ['submissions'],
    takedowns: ['standing', 'wrestling'],
    legLocks: ['legLocks'],
    backTakes: ['backTakes'],
    sweeps: ['bottom', 'guard'],
    frontHeadlock: ['wrestling', 'submissions']
  },
  partnerRelativeSize: {
    bigger: ['mobility', 'bottom', 'wrestling'],
    smaller: ['pressure', 'top'],
    similar: ['top', 'bottom', 'standing']
  },
  partnerStyle: {
    pressure: ['escapes', 'bottom', 'mobility'],
    guard: ['top', 'pressure'],
    wrestling: ['standing', 'wrestling', 'frontHeadlock'],
    legLocks: ['legLocks', 'escapes'],
    submissions: ['escapes'],
    scrambles: ['wrestling', 'backTakes']
  },
  partnerPace: {
    calm: ['pressure', 'top'],
    moderate: ['top', 'bottom', 'standing'],
    aggressive: ['escapes', 'wrestling', 'backTakes']
  },
  partnerStrength: {
    passing: ['guard', 'escapes'],
    guard: ['top', 'pressure'],
    wrestling: ['standing', 'wrestling'],
    legLocks: ['legLocks', 'escapes'],
    backControl: ['escapes', 'backTakes'],
    submissions: ['escapes']
  }
};

const defaultFilters = {
  experience: '',
  ruleSet: '',
  preferredStyle: '',
  topBottom: '',
  bodyType: '',
  flexibility: '',
  wrestlingFamiliarity: '',
  legLockFamiliarity: '',
  riskTolerance: '',
  weakArea: '',
  partnerRelativeSize: '',
  partnerStyle: '',
  partnerExperience: '',
  partnerPace: '',
  partnerStrength: ''
};

const getStyleTags = (entry) => {
  const text = getEntryText(entry);

  return Object.entries(styleMatchers)
    .filter(([, terms]) => terms.some((term) => text.includes(normalizeValue(term))))
    .map(([style]) => style);
};

const optionMatchesStyles = (entry, styles) => {
  if (!styles.length) return true;

  const entryStyles = getStyleTags(entry);
  const entryText = getEntryText(entry);

  return styles.some((style) => (
    entryStyles.includes(style)
    || entryText.includes(normalizeValue(style))
  ));
};

const getSelectedStyleHints = (filters) => uniqueValues(
  Object.entries(filters).flatMap(([key, value]) => filterConfig[key]?.[value] || [])
);

const getOptionReasons = ({ entry, groupKey, filters }) => {
  const reasons = [];
  const styleHints = getSelectedStyleHints(filters);

  if (entry?.skillLevel && filters.experience && entry.skillLevel === filters.experience) {
    reasons.push(`Matches ${filters.experience.toLowerCase()} level`);
  }

  if (filters.ruleSet && optionMatchesStyles(entry || {}, filterConfig.ruleSet[filters.ruleSet] || [])) {
    reasons.push(filters.ruleSet === 'gi' ? 'Fits gi context' : 'Fits no-gi context');
  }

  if (filters.weakArea && optionMatchesStyles(entry || {}, filterConfig.weakArea[filters.weakArea] || [])) {
    reasons.push('Targets selected weak area');
  }

  if (styleHints.length && optionMatchesStyles(entry || {}, styleHints)) {
    reasons.push('Matches active style tags');
  }

  if (groupKey === 'commonDefenses' && filters.weakArea === 'escapes') {
    reasons.push('Defense branch prioritized');
  }

  if (!reasons.length) {
    reasons.push(entry ? 'Connected from current focus' : 'Referenced by this focus');
  }

  return reasons.slice(0, 2);
};

const scoreOption = ({ entry, groupKey, filters }) => {
  let score = 0;
  const styleHints = getSelectedStyleHints(filters);
  const entryText = getEntryText(entry);

  styleHints.forEach((style) => {
    if (optionMatchesStyles(entry, [style])) score += 2;
  });

  if (filters.ruleSet === 'gi' && optionMatchesStyles(entry, ['gi'])) score += 4;
  if (filters.ruleSet === 'nogi' && optionMatchesStyles(entry, ['nogi', 'wrestling', 'legLocks'])) score += 4;
  if (filters.topBottom === 'top' && optionMatchesStyles(entry, ['top'])) score += 3;
  if (filters.topBottom === 'bottom' && optionMatchesStyles(entry, ['bottom'])) score += 3;
  if (filters.topBottom === 'standing' && optionMatchesStyles(entry, ['standing'])) score += 3;
  if (filters.weakArea && optionMatchesStyles(entry, filterConfig.weakArea[filters.weakArea] || [])) score += 6;

  if (filters.experience) {
    const entryRank = skillLevelRank[entry?.skillLevel] || 2;
    const targetRank = skillLevelRank[filters.experience] || 2;
    score += Math.max(0, 4 - Math.abs(entryRank - targetRank));
  }

  if (filters.partnerExperience) {
    const partnerRank = skillLevelRank[filters.partnerExperience] || 2;
    const entryRank = skillLevelRank[entry?.skillLevel] || 2;
    if (partnerRank > entryRank) score += 1;
  }

  if (groupKey === 'commonDefenses' && filters.weakArea === 'escapes') score += 4;
  if (groupKey === 'entriesIntoPosition' && filters.preferredStyle === 'wrestling') score += 2;
  if (entryText.includes('beginner') && filters.experience === 'Beginner') score += 1;

  return score;
};

const findEntryByName = (entryMap, name) => entryMap.get(normalizeValue(name)) || null;

const getFilteredBranches = ({ focusEntry, entryMap, filters }) => {
  const weakAreaStyles = filterConfig.weakArea[filters.weakArea] || [];
  const shouldShrink = Boolean(filters.weakArea);

  return relationshipGroups.map((group) => {
    const values = uniqueValues(focusEntry[group.key] || []);
    const options = values
      .map((name) => {
        const entry = findEntryByName(entryMap, name);
        return {
          name,
          entry,
          score: scoreOption({ entry: entry || { name }, groupKey: group.key, filters }),
          reasons: getOptionReasons({ entry: entry || { name }, groupKey: group.key, filters })
        };
      })
      .filter((option) => (
        !shouldShrink
        || !option.entry
        || optionMatchesStyles(option.entry, weakAreaStyles)
        || option.score >= 6
      ))
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, shouldShrink ? 6 : 10);

    return {
      ...group,
      options
    };
  });
};

export default function DecisionTreePage() {
  const [search, setSearch] = useState('');
  const [focusId, setFocusId] = useState('positions-closed-guard');
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [showPartnerContext, setShowPartnerContext] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);

  const entries = curriculumIndexSeed;

  const entryMap = useMemo(() => {
    const nextMap = new Map();
    entries.forEach((entry) => {
      nextMap.set(normalizeValue(entry.name), entry);
    });
    return nextMap;
  }, [entries]);

  const focusEntry = useMemo(() => (
    entries.find((entry) => entry.id === focusId) || entries[0]
  ), [entries, focusId]);

  const searchResults = useMemo(() => {
    const normalizedSearch = normalizeValue(search);

    if (!normalizedSearch) return [];

    return entries
      .filter((entry) => getEntryText(entry).includes(normalizedSearch))
      .sort((a, b) => {
        const aName = normalizeValue(a.name);
        const bName = normalizeValue(b.name);
        const aScore = aName === normalizedSearch ? 3 : aName.startsWith(normalizedSearch) ? 2 : 1;
        const bScore = bName === normalizedSearch ? 3 : bName.startsWith(normalizedSearch) ? 2 : 1;
        return bScore - aScore || a.name.localeCompare(b.name);
      })
      .slice(0, 8);
  }, [entries, search]);

  const activeStyleHints = useMemo(() => getSelectedStyleHints(filters), [filters]);

  const branchGroups = useMemo(() => (
    getFilteredBranches({ focusEntry, entryMap, filters })
  ), [focusEntry, entryMap, filters]);

  const visibleBranchCount = branchGroups.reduce((count, group) => count + group.options.length, 0);

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value
    }));
  };

  const selectFocusEntry = (entry) => {
    if (!entry || entry.id === focusEntry.id) return;
    setHistory((current) => [focusEntry, ...current].slice(0, 8));
    setFocusId(entry.id);
    setSearch('');
  };

  const goBack = () => {
    const [previous, ...rest] = history;
    if (!previous) return;
    setFocusId(previous.id);
    setHistory(rest);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <Layout>
      <div className="decision-tree-page">
        <h2 className="page-title">Decision Tree</h2>
        <p className="page-intro">
          Explore one universal grappling tree from the Curriculum Index, then use real-life filters to narrow the next best options for a coach, student, or matchup.
        </p>

        <section className="page-section decision-tree-hero">
          <div>
            <p className="meta-text">Current focus</p>
            <h3>{focusEntry.name}</h3>
            <p>{focusEntry.description || 'No description added yet.'}</p>
            <div className="decision-tree-chip-row">
              <span className="curriculum-index-tag">{focusEntry.category}</span>
              {focusEntry.subcategory && <span className="curriculum-index-tag">{focusEntry.subcategory}</span>}
              {focusEntry.skillLevel && <span className="curriculum-index-tag">{focusEntry.skillLevel}</span>}
            </div>
            <div className="decision-tree-focus-links">
              <Link className="secondary-button" to={`/index?search=${encodeURIComponent(focusEntry.name)}`}>
                View in Index
              </Link>
              <Link className="secondary-button" to={`/library?search=${encodeURIComponent(focusEntry.name)}`}>
                Find Library Resources
              </Link>
            </div>
          </div>
          <div className="decision-tree-hero-actions">
            <button className="secondary-button" type="button" onClick={goBack} disabled={!history.length}>
              Back
            </button>
            <button className="secondary-button" type="button" onClick={resetFilters}>
              Reset filters
            </button>
          </div>
        </section>

        <section className="page-section">
          <h3>Start point</h3>
          <p className="meta-text">
            Search the universal Index and choose the position, attack, defense, or concept you want the tree to start from.
          </p>
          <label htmlFor="decision-tree-search">Search Curriculum Index</label>
          <input
            id="decision-tree-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search closed guard, knee cut, front headlock..."
          />

          {searchResults.length > 0 && (
            <ul className="card-list decision-tree-search-results">
              {searchResults.map((entry) => (
                <li className="decision-tree-search-result" key={entry.id}>
                  <button type="button" onClick={() => selectFocusEntry(entry)}>
                    <strong>{entry.name}</strong>
                    <span>{entry.category}{entry.subcategory ? ` | ${entry.subcategory}` : ''}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="page-section compact-form-shell">
          <div className="compact-form-header">
            <div>
              <h3>Simple filters</h3>
              <p className="meta-text">
                These filters shrink and rank the answers. Open them when you want more specific suggestions.
              </p>
            </div>
            <button className="secondary-button" type="button" onClick={() => setShowFilters((value) => !value)}>
              {showFilters ? 'Hide filters' : 'Show filters'}
            </button>
          </div>

          {showFilters && (
            <div className="decision-tree-filter-grid">
              <label>
                User experience
                <select value={filters.experience} onChange={(event) => handleFilterChange('experience', event.target.value)}>
                  <option value="">Any experience</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </label>

              <label>
                Gi / no-gi
                <select value={filters.ruleSet} onChange={(event) => handleFilterChange('ruleSet', event.target.value)}>
                  <option value="">Either</option>
                  <option value="gi">Gi</option>
                  <option value="nogi">No-gi</option>
                </select>
              </label>

              <label>
                Preferred style
                <select value={filters.preferredStyle} onChange={(event) => handleFilterChange('preferredStyle', event.target.value)}>
                  <option value="">Any style</option>
                  <option value="pressure">Pressure / control</option>
                  <option value="guard">Guard player</option>
                  <option value="wrestling">Wrestling / front headlock</option>
                  <option value="legLocks">Leg locks</option>
                  <option value="backTakes">Back takes</option>
                  <option value="submissions">Submission hunting</option>
                  <option value="scrambles">Scrambly / mobile</option>
                  <option value="defense">Defensive / escape work</option>
                </select>
              </label>

              <label>
                Top / bottom preference
                <select value={filters.topBottom} onChange={(event) => handleFilterChange('topBottom', event.target.value)}>
                  <option value="">Any preference</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="standing">Standing</option>
                </select>
              </label>

              <label>
                Body type
                <select value={filters.bodyType} onChange={(event) => handleFilterChange('bodyType', event.target.value)}>
                  <option value="">Any body type</option>
                  <option value="smaller">Smaller / faster</option>
                  <option value="larger">Larger / pressure</option>
                  <option value="longer">Longer limbs</option>
                  <option value="compact">Compact / stocky</option>
                </select>
              </label>

              <label>
                Flexibility
                <select value={filters.flexibility} onChange={(event) => handleFilterChange('flexibility', event.target.value)}>
                  <option value="">Any flexibility</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>

              <label>
                Wrestling familiarity
                <select value={filters.wrestlingFamiliarity} onChange={(event) => handleFilterChange('wrestlingFamiliarity', event.target.value)}>
                  <option value="">Any familiarity</option>
                  <option value="new">New to wrestling</option>
                  <option value="comfortable">Comfortable wrestling</option>
                </select>
              </label>

              <label>
                Leg lock familiarity
                <select value={filters.legLockFamiliarity} onChange={(event) => handleFilterChange('legLockFamiliarity', event.target.value)}>
                  <option value="">Any familiarity</option>
                  <option value="avoid">Avoid for now</option>
                  <option value="learning">Learning</option>
                  <option value="comfortable">Comfortable</option>
                </select>
              </label>

              <label>
                Risk tolerance
                <select value={filters.riskTolerance} onChange={(event) => handleFilterChange('riskTolerance', event.target.value)}>
                  <option value="">Any risk tolerance</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>

              <label>
                Weak areas
                <select value={filters.weakArea} onChange={(event) => handleFilterChange('weakArea', event.target.value)}>
                  <option value="">No weakness filter</option>
                  <option value="guardPassing">Guard passing</option>
                  <option value="guardRetention">Guard retention</option>
                  <option value="escapes">Escapes</option>
                  <option value="submissions">Submissions</option>
                  <option value="takedowns">Takedowns</option>
                  <option value="legLocks">Leg locks</option>
                  <option value="backTakes">Back takes</option>
                  <option value="sweeps">Sweeps</option>
                  <option value="frontHeadlock">Front headlock</option>
                </select>
              </label>
            </div>
          )}
        </section>

        <section className="page-section compact-form-shell">
          <div className="compact-form-header">
            <div>
              <h3>Partner context</h3>
              <p className="meta-text">
                Add opponent or training-partner context when you want the tree to behave more like a coaching assistant.
              </p>
            </div>
            <button className="secondary-button" type="button" onClick={() => setShowPartnerContext((value) => !value)}>
              {showPartnerContext ? 'Hide partner context' : 'Show partner context'}
            </button>
          </div>

          {showPartnerContext && (
            <div className="decision-tree-filter-grid">
            <label>
              Relative size
              <select value={filters.partnerRelativeSize} onChange={(event) => handleFilterChange('partnerRelativeSize', event.target.value)}>
                <option value="">Any size</option>
                <option value="bigger">Bigger than user</option>
                <option value="smaller">Smaller than user</option>
                <option value="similar">Similar size</option>
              </select>
            </label>

            <label>
              Preferred style
              <select value={filters.partnerStyle} onChange={(event) => handleFilterChange('partnerStyle', event.target.value)}>
                <option value="">Any style</option>
                <option value="pressure">Pressure passer</option>
                <option value="guard">Guard player</option>
                <option value="wrestling">Wrestler</option>
                <option value="legLocks">Leg locker</option>
                <option value="submissions">Submission hunter</option>
                <option value="scrambles">Scrambler</option>
              </select>
            </label>

            <label>
              Experience
              <select value={filters.partnerExperience} onChange={(event) => handleFilterChange('partnerExperience', event.target.value)}>
                <option value="">Any experience</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </label>

            <label>
              Pace / aggression
              <select value={filters.partnerPace} onChange={(event) => handleFilterChange('partnerPace', event.target.value)}>
                <option value="">Any pace</option>
                <option value="calm">Calm</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </label>

            <label>
              Known strengths
              <select value={filters.partnerStrength} onChange={(event) => handleFilterChange('partnerStrength', event.target.value)}>
                <option value="">No known strength</option>
                <option value="passing">Passing</option>
                <option value="guard">Guard</option>
                <option value="wrestling">Wrestling</option>
                <option value="legLocks">Leg locks</option>
                <option value="backControl">Back control</option>
                <option value="submissions">Submissions</option>
              </select>
            </label>
            </div>
          )}
        </section>

        <section className="page-section decision-tree-simulation-panel">
          <div>
            <h3>Advanced simulation</h3>
            <p className="meta-text">
              Explosiveness, grip strength, scramble level, cardio, and mobility are intentionally reserved for simulation mode later.
            </p>
          </div>
          <button className="secondary-button" type="button" onClick={() => setShowSimulation((value) => !value)}>
            {showSimulation ? 'Hide simulation traits' : 'Show simulation traits'}
          </button>
          {showSimulation && (
            <div className="decision-tree-simulation-note">
              <span>Explosiveness</span>
              <span>Grip strength</span>
              <span>Scramble level</span>
              <span>Cardio</span>
              <span>Mobility</span>
            </div>
          )}
        </section>

        <section className="page-section">
          <div className="decision-tree-section-heading">
            <div>
              <h3>Tree branches</h3>
              <p className="meta-text">
                Showing {visibleBranchCount} filtered options from the universal graph.
              </p>
            </div>
            {activeStyleHints.length > 0 && (
              <div className="decision-tree-chip-row">
                {activeStyleHints.map((hint) => (
                  <span className="curriculum-index-tag" key={hint}>{styleHintLabels[hint] || hint}</span>
                ))}
              </div>
            )}
          </div>

          <div className="decision-tree-branch-grid">
            {branchGroups.map((group) => (
              <div className="decision-tree-branch-group" key={group.key}>
                <h4>{group.label}</h4>
                {group.options.length > 0 ? (
                  <ul className="card-list">
                    {group.options.map((option) => (
                      <li className="decision-tree-option" key={`${group.key}-${option.name}`}>
                        <button
                          type="button"
                          onClick={() => option.entry && selectFocusEntry(option.entry)}
                          disabled={!option.entry}
                        >
                          <strong>{option.name}</strong>
                          <span>
                            {option.entry
                              ? `${option.entry.category}${option.entry.skillLevel ? ` | ${option.entry.skillLevel}` : ''}`
                              : 'Not a full Index node yet'}
                          </span>
                          <span className="decision-tree-reason-row">
                            {option.reasons.join(' | ')}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-state">No branches match the current filters yet.</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
