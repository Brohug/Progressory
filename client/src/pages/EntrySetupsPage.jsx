import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { getEntrySetupFamilySlug, setupFamilies } from '../data/entrySetupFamilies';
import { useAuth } from '../hooks/useAuth';

const buildCurriculumLink = (search) => `/index?search=${encodeURIComponent(search)}`;
const buildDecisionTreeLink = (search, setupFamily) => (
  `/decision-tree?search=${encodeURIComponent(search)}&setupFamily=${encodeURIComponent(setupFamily)}`
);

const buildInitialCustomExampleForm = (visibility = 'private') => ({
  title: '',
  lane: 'Standing',
  linked_family_title: '',
  summary: '',
  description: '',
  setup_nodes_input: '',
  next_attacks_input: '',
  example_sequence_input: '',
  curriculum_search: '',
  tree_search: '',
  visibility
});

const formatCreatorName = (value) => {
  const text = String(value || '')
    .trim()
    .replace(/\s+/g, ' ');

  return text || 'Gym owner';
};

const parseCommaSeparatedList = (value) => (
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
);

const parseSequenceList = (value) => {
  const text = String(value || '').trim();

  if (!text) {
    return [];
  }

  const segments = text.split(/\s*(?:->|>|,)\s*/);

  return segments
    .map((item) => item.trim())
    .filter(Boolean);
};

const buildListInputValue = (items, delimiter = ', ') => (
  Array.isArray(items) ? items.join(delimiter) : ''
);

export default function EntrySetupsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedFamily = searchParams.get('family') || '';
  const [familySearch, setFamilySearch] = useState('');
  const [activeLane, setActiveLane] = useState('');
  const [expandedFamilies, setExpandedFamilies] = useState({});
  const [customExamples, setCustomExamples] = useState([]);
  const [customExamplesLoading, setCustomExamplesLoading] = useState(true);
  const [customExamplesError, setCustomExamplesError] = useState('');
  const [customExamplesFeedback, setCustomExamplesFeedback] = useState('');
  const [isExampleFormOpen, setIsExampleFormOpen] = useState(false);
  const [editingExampleId, setEditingExampleId] = useState(null);
  const [exampleSort, setExampleSort] = useState('newest');
  const [isBuiltInCompactView, setIsBuiltInCompactView] = useState(true);
  const [isSavedCompactView, setIsSavedCompactView] = useState(true);
  const [exampleForm, setExampleForm] = useState(() => buildInitialCustomExampleForm());
  const [isMobileCompactCards, setIsMobileCompactCards] = useState(() => (
    typeof window !== 'undefined' ? window.innerWidth <= 720 : false
  ));
  const quickLanes = useMemo(() => ['Standing', 'Guard', 'Passing', 'Submission'], []);
  const isOwner = user?.role === 'owner';
  const useBuiltInCompactCards = isMobileCompactCards || isBuiltInCompactView;
  const useSavedCompactCards = isMobileCompactCards || isSavedCompactView;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(max-width: 720px)');
    const syncCompactState = (event) => {
      setIsMobileCompactCards(event.matches);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncCompactState);
      return () => mediaQuery.removeEventListener('change', syncCompactState);
    }

    mediaQuery.addListener(syncCompactState);
    return () => mediaQuery.removeListener(syncCompactState);
  }, []);

  useEffect(() => {
    if (!selectedFamily) {
      return;
    }

    const familyId = `entry-setup-family-${getEntrySetupFamilySlug(selectedFamily)}`;

    window.setTimeout(() => {
      document.getElementById(familyId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 120);
  }, [selectedFamily]);

  useEffect(() => {
    setExampleForm((current) => ({
      ...current,
      visibility: isOwner && current.visibility === 'gym_shared' ? 'gym_shared' : 'private'
    }));
  }, [isOwner]);

  useEffect(() => {
    let isMounted = true;

    const loadCustomExamples = async () => {
      try {
        setCustomExamplesLoading(true);
        setCustomExamplesError('');
        const response = await api.get('/entry-setup-examples');

        if (!isMounted) {
          return;
        }

        setCustomExamples(response.data || []);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error('Load entry setup examples error:', error);
        setCustomExamplesError(error.response?.data?.message || 'Could not load saved setup examples right now.');
      } finally {
        if (isMounted) {
          setCustomExamplesLoading(false);
        }
      }
    };

    loadCustomExamples();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSetupFamilies = useMemo(() => {
    const normalizedSearch = familySearch
      .trim()
      .toLowerCase();

    if (!normalizedSearch) {
      return activeLane
        ? setupFamilies.filter((family) => family.lane === activeLane)
        : setupFamilies;
    }

    return setupFamilies.filter((family) => {
      const haystack = [
        family.lane,
        family.title,
        family.summary,
        family.description,
        ...(family.setupNodes || []),
        ...(family.nextAttacks || []),
        ...(family.exampleSequence || [])
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch) && (!activeLane || family.lane === activeLane);
    });
  }, [activeLane, familySearch]);

  const filteredCustomExamples = useMemo(() => {
    const normalizedSearch = familySearch
      .trim()
      .toLowerCase();

    return customExamples.filter((example) => {
      const matchesLane = !activeLane || example.lane === activeLane;

      if (!matchesLane) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        example.lane,
        example.title,
        example.linked_family_title,
        example.summary,
        example.description,
        ...(example.setup_nodes || []),
        ...(example.next_attacks || []),
        ...(example.example_sequence || [])
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [activeLane, customExamples, familySearch]);

  const sortedCustomExamples = useMemo(() => {
    const sorted = [...filteredCustomExamples];

    sorted.sort((left, right) => {
      if (exampleSort === 'shared-first' && left.visibility !== right.visibility) {
        return left.visibility === 'gym_shared' ? -1 : 1;
      }

      if (exampleSort === 'my-edits') {
        const leftIsMine = String(left.created_by_user_id) === String(user?.id);
        const rightIsMine = String(right.created_by_user_id) === String(user?.id);

        if (leftIsMine !== rightIsMine) {
          return leftIsMine ? -1 : 1;
        }
      }

      return new Date(right.updated_at || right.created_at || 0) - new Date(left.updated_at || left.created_at || 0);
    });

    return sorted;
  }, [exampleSort, filteredCustomExamples, user?.id]);

  const sharedExamples = useMemo(
    () => sortedCustomExamples.filter((example) => example.visibility === 'gym_shared'),
    [sortedCustomExamples]
  );

  const privateExamples = useMemo(
    () => sortedCustomExamples.filter((example) => example.visibility === 'private'),
    [sortedCustomExamples]
  );

  const toggleFamily = (familyTitle) => {
    setExpandedFamilies((current) => ({
      ...current,
      [familyTitle]: !current[familyTitle]
    }));
  };

  const toggleExpandedCard = (cardKey) => {
    setExpandedFamilies((current) => ({
      ...current,
      [cardKey]: !current[cardKey]
    }));
  };

  const getSequenceStepTone = (index, totalSteps) => {
    if (index === 0) {
      return 'start';
    }

    if (index === totalSteps - 1) {
      return 'finish';
    }

    return 'middle';
  };

  const getLinkedFamily = (linkedFamilyTitle) => (
    setupFamilies.find((family) => family.title === linkedFamilyTitle) || null
  );

  const getExampleCurriculumSearch = (example) => (
    example.curriculum_search
    || getLinkedFamily(example.linked_family_title)?.curriculumSearch
    || example.title
  );

  const getExampleTreeSearch = (example) => (
    example.tree_search
    || getLinkedFamily(example.linked_family_title)?.treeSearch
    || example.title
  );

  const resetExampleComposer = () => {
    setEditingExampleId(null);
    setExampleForm(buildInitialCustomExampleForm(isOwner ? 'private' : 'private'));
  };

  const openCreateExampleForm = () => {
    resetExampleComposer();
    setCustomExamplesFeedback('');
    setCustomExamplesError('');
    setIsExampleFormOpen(true);
  };

  const openCloneFamilyForm = (family) => {
    setEditingExampleId(null);
    setExampleForm({
      title: `${family.title} - my version`,
      lane: family.lane || 'Standing',
      linked_family_title: family.title,
      summary: family.summary || '',
      description: family.description || '',
      setup_nodes_input: buildListInputValue(family.setupNodes),
      next_attacks_input: buildListInputValue(family.nextAttacks),
      example_sequence_input: buildListInputValue(family.exampleSequence, ' -> '),
      curriculum_search: family.curriculumSearch || family.title,
      tree_search: family.treeSearch || family.title,
      visibility: 'private'
    });
    setCustomExamplesFeedback('');
    setCustomExamplesError('');
    setIsExampleFormOpen(true);
  };

  const openEditExampleForm = (example) => {
    setEditingExampleId(example.id);
    setExampleForm({
      title: example.title || '',
      lane: example.lane || 'Standing',
      linked_family_title: example.linked_family_title || '',
      summary: example.summary || '',
      description: example.description || '',
      setup_nodes_input: buildListInputValue(example.setup_nodes),
      next_attacks_input: buildListInputValue(example.next_attacks),
      example_sequence_input: buildListInputValue(example.example_sequence, ' -> '),
      curriculum_search: example.curriculum_search || '',
      tree_search: example.tree_search || '',
      visibility: isOwner && example.visibility === 'gym_shared' ? 'gym_shared' : 'private'
    });
    setCustomExamplesFeedback('');
    setCustomExamplesError('');
    setIsExampleFormOpen(true);
  };

  const closeExampleForm = () => {
    setIsExampleFormOpen(false);
    resetExampleComposer();
  };

  const updateExampleFormValue = (field, value) => {
    setExampleForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const submitExampleForm = async (event) => {
    event.preventDefault();

    const linkedFamily = getLinkedFamily(exampleForm.linked_family_title);
    const payload = {
      title: exampleForm.title,
      lane: exampleForm.lane,
      linked_family_title: exampleForm.linked_family_title || null,
      summary: exampleForm.summary || null,
      description: exampleForm.description || null,
      setup_nodes: parseCommaSeparatedList(exampleForm.setup_nodes_input),
      next_attacks: parseCommaSeparatedList(exampleForm.next_attacks_input),
      example_sequence: parseSequenceList(exampleForm.example_sequence_input),
      curriculum_search: exampleForm.curriculum_search || linkedFamily?.curriculumSearch || exampleForm.title,
      tree_search: exampleForm.tree_search || linkedFamily?.treeSearch || exampleForm.title,
      visibility: isOwner ? exampleForm.visibility : 'private'
    };

    try {
      setCustomExamplesError('');
      setCustomExamplesFeedback('');

      if (editingExampleId) {
        const response = await api.put(`/entry-setup-examples/${editingExampleId}`, payload);
        setCustomExamples((current) => current.map((example) => (
          example.id === editingExampleId ? response.data.entrySetupExample : example
        )));
        setCustomExamplesFeedback('Setup example updated.');
      } else {
        const response = await api.post('/entry-setup-examples', payload);
        setCustomExamples((current) => [response.data.entrySetupExample, ...current]);
        setCustomExamplesFeedback('Setup example saved.');
      }

      closeExampleForm();
    } catch (error) {
      console.error('Save entry setup example error:', error);
      setCustomExamplesError(error.response?.data?.message || 'Could not save that setup example right now.');
    }
  };

  const handleDeleteExample = async (exampleId) => {
    try {
      setCustomExamplesError('');
      setCustomExamplesFeedback('');
      await api.delete(`/entry-setup-examples/${exampleId}`);
      setCustomExamples((current) => current.filter((example) => example.id !== exampleId));
      setCustomExamplesFeedback('Setup example deleted.');
    } catch (error) {
      console.error('Delete entry setup example error:', error);
      setCustomExamplesError(error.response?.data?.message || 'Could not delete that setup example right now.');
    }
  };

  // eslint-disable-next-line no-unused-vars
  const renderSequenceFlowLegacy = (steps, keyPrefix) => (
    <div className="entry-setup-sequence-row">
      {steps.map((step, index) => {
        const stepTone = getSequenceStepTone(index, steps.length);

        return (
          <Fragment key={`${keyPrefix}-step-${step}-${index}`}>
            {index > 0 ? (
              <span className="entry-setup-sequence-arrow" aria-hidden="true">
                →
              </span>
            ) : null}
            <div
              className={`entry-setup-sequence-step entry-setup-sequence-step-${stepTone}`}
            >
              <span className="entry-setup-info-chip entry-setup-sequence-chip">
                {step}
              </span>
            </div>
          </Fragment>
        );
      })}
    </div>
  );

  const renderSequenceFlow = (steps, keyPrefix) => (
    <div className="entry-setup-sequence-row">
      {steps.map((step, index) => {
        const stepTone = getSequenceStepTone(index, steps.length);

        return (
          <Fragment key={`${keyPrefix}-clean-step-${step}-${index}`}>
            {index > 0 ? (
              <span className="entry-setup-sequence-arrow" aria-hidden="true">
                {'\u2192'}
              </span>
            ) : null}
            <div className={`entry-setup-sequence-step entry-setup-sequence-step-${stepTone}`}>
              <span className="entry-setup-info-chip entry-setup-sequence-chip">
                {step}
              </span>
            </div>
          </Fragment>
        );
      })}
    </div>
  );

  const renderCustomExampleCard = (example, scopeLabel, canEdit) => {
    const cardKey = `custom-example-${example.id}`;
    const isExpanded = !useSavedCompactCards || Boolean(expandedFamilies[cardKey]);
    const summaryLabel = scopeLabel === 'shared' ? 'Why this helps the gym' : 'Why this helps me';
    const descriptionLabel = scopeLabel === 'shared' ? 'Coach note for the gym' : 'Study note';

    return (
      <article
        key={`${scopeLabel}-${example.id}`}
        className={`action-card dashboard-action-card entry-setup-family-card entry-setup-custom-card${useSavedCompactCards ? ' is-collapsible' : ''}${isExpanded ? ' is-expanded' : ''}`}
      >
        <div className="entry-setup-family-header">
          <div>
            <strong>{example.title}</strong>
            <span className="meta-text">
              {scopeLabel === 'shared'
                ? `Shared by ${formatCreatorName(example.created_by_name)} with the gym`
                : 'Saved by you · Private'}
            </span>
            <div className="entry-setup-family-lane">
              <span className="entry-setup-info-chip">{example.lane}</span>
              {example.linked_family_title ? <span className="entry-setup-info-chip">{example.linked_family_title}</span> : null}
            </div>
          </div>
          {useSavedCompactCards ? (
            <button
              type="button"
              className="secondary-button entry-setup-family-toggle"
              onClick={() => toggleExpandedCard(cardKey)}
            >
              {isExpanded ? 'Hide' : 'Expand'}
            </button>
          ) : null}
        </div>

        <div className="entry-setup-family-actions entry-setup-family-actions-primary">
          <Link className="secondary-button" to={buildCurriculumLink(getExampleCurriculumSearch(example))}>
            Open in Curriculum
          </Link>
          <Link className="secondary-button" to={buildDecisionTreeLink(getExampleTreeSearch(example), example.linked_family_title || example.title)}>
            Continue in Decision Trees
          </Link>
        </div>

        {canEdit ? (
          <div className="entry-setup-family-actions entry-setup-family-actions-secondary">
            <button type="button" className="secondary-button" onClick={() => openEditExampleForm(example)}>
              Edit
            </button>
            <button type="button" className="danger-button" onClick={() => handleDeleteExample(example.id)}>
              Delete
            </button>
          </div>
        ) : null}

        {isExpanded ? (
          <>
            {example.summary ? (
              <div className="entry-setup-family-block">
                <span className="meta-text entry-setup-block-label">{summaryLabel}</span>
                <p className="section-note">{example.summary}</p>
              </div>
            ) : null}
            {example.description ? (
              <div className="entry-setup-family-block">
                <span className="meta-text entry-setup-block-label">{descriptionLabel}</span>
                <p className="section-note">{example.description}</p>
              </div>
            ) : null}
            <div className="entry-setup-family-block">
              <span className="meta-text entry-setup-block-label">Starting topic</span>
              <div className="suggestion-chip-row">
                <span className="entry-setup-info-chip entry-setup-info-chip-accent">
                  {getExampleCurriculumSearch(example)}
                </span>
                <span className="entry-setup-info-chip">
                  Tree handoff: {getExampleTreeSearch(example)}
                </span>
              </div>
              <div className="entry-setup-family-inline-links">
                <Link to={buildCurriculumLink(getExampleCurriculumSearch(example))}>
                  View starting topic
                </Link>
                <Link to={buildDecisionTreeLink(getExampleTreeSearch(example), example.linked_family_title || example.title)}>
                  Use tree handoff
                </Link>
              </div>
            </div>
            {example.setup_nodes?.length ? (
              <div className="entry-setup-family-block">
                <span className="meta-text entry-setup-block-label">Common setups</span>
                <div className="suggestion-chip-row">
                  {example.setup_nodes.map((node) => (
                    <span key={`${scopeLabel}-${example.id}-${node}`} className="entry-setup-info-chip entry-setup-info-chip-accent">
                      {node}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {example.example_sequence?.length ? (
              <div className="entry-setup-family-block">
                <span className="meta-text entry-setup-block-label">Example sequence</span>
                {renderSequenceFlow(example.example_sequence, `${scopeLabel}-${example.id}`)}
              </div>
            ) : null}
          </>
        ) : (
          <div className="entry-setup-family-collapsed-preview">
            <span className="meta-text entry-setup-block-label">Common setups</span>
            <div className="suggestion-chip-row">
              {(example.setup_nodes || []).slice(0, 3).map((node) => (
                <span key={`${scopeLabel}-${example.id}-preview-${node}`} className="entry-setup-info-chip entry-setup-info-chip-accent">
                  {node}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    );
  };

  return (
    <Layout>
      <div className="entry-setups-page">
        <h2 className="page-title">Entry Setups</h2>
        <p className="page-intro">
          Use this page for the reactions and opening moves that create the attack before the actual takedown,
          submission, sweep, or back take begins. Curriculum holds the full map, and Decision Trees help you
          continue the sequence once you choose the branch.
        </p>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>What these setups are for</h3>
              <p className="section-note">These are strong starter chains, not an all-encompassing list of every possible route.</p>
            </div>
          </div>
          <p className="section-note">
            These setups help coaches and students start thinking in sequences. Some are as simple as A plus B. Others
            need A plus B plus C before the real opening appears. The goal is to make one threat open the next limb,
            posture break, or angle.
          </p>
          <p className="section-note">
            If your gym builds other strong setup paths, that is a good thing. This page is here to give practical
            starting structure, not pretend the app already covers every expert variation in the room.
          </p>
        </section>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>How this layer works</h3>
              <p className="section-note">Setups are the bridge between isolated techniques and real sequences.</p>
            </div>
          </div>
          <div className="action-grid entry-setups-overview-grid">
            <div className="action-card dashboard-action-card">
              <strong>Setups</strong>
              <p className="section-note">The opening reactions you create first: head touch, level change, collar tie, drag, snap, or post break.</p>
            </div>
            <div className="action-card dashboard-action-card">
              <strong>Entries</strong>
              <p className="section-note">The first committed attack: ankle pick, single leg, front headlock, arm drag, or sweep entry.</p>
            </div>
            <div className="action-card dashboard-action-card">
              <strong>Sequences</strong>
              <p className="section-note">The follow-up chain after the first answer: sprawl to front headlock, drag to back, or wrestle-up to top control.</p>
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>Saved setup examples</h3>
              <p className="section-note">Owner-shared examples are visible to the whole gym. Private examples stay only with the account that created them.</p>
            </div>
            <div className="inline-actions">
              <button
                type="button"
                className={`secondary-button${isSavedCompactView ? ' is-active' : ''}`}
                onClick={() => setIsSavedCompactView((current) => !current)}
              >
                {isSavedCompactView ? 'Show more detail' : 'Use compact saved view'}
              </button>
              <button type="button" className="secondary-button" onClick={openCreateExampleForm}>
                {editingExampleId ? 'Editing setup example' : 'Create setup example'}
              </button>
            </div>
          </div>

          <div className="entry-setups-search-shell">
            <p className="section-note">
              Use this layer when your gym wants to save example setup paths beyond the built-in starter families. Owners can share across the gym. Everyone else can keep private versions for their own study.
            </p>
            <div className="entry-setups-search-summary">
              <span className="entry-setup-info-chip">{setupFamilies.length} built-in families</span>
              <span className="entry-setup-info-chip">{sharedExamples.length} shared owner example{sharedExamples.length === 1 ? '' : 's'}</span>
              <span className="entry-setup-info-chip">{privateExamples.length} private example{privateExamples.length === 1 ? '' : 's'}</span>
            </div>
            <div className="entry-setups-lane-row entry-setups-sort-row">
              <button
                type="button"
                className={`secondary-button${exampleSort === 'newest' ? ' is-active' : ''}`}
                onClick={() => setExampleSort('newest')}
              >
                Newest
              </button>
              <button
                type="button"
                className={`secondary-button${exampleSort === 'shared-first' ? ' is-active' : ''}`}
                onClick={() => setExampleSort('shared-first')}
              >
                Shared first
              </button>
              <button
                type="button"
                className={`secondary-button${exampleSort === 'my-edits' ? ' is-active' : ''}`}
                onClick={() => setExampleSort('my-edits')}
              >
                My edits
              </button>
            </div>
            {customExamplesFeedback ? <p className="success-text">{customExamplesFeedback}</p> : null}
            {customExamplesError ? <p className="error-text">{customExamplesError}</p> : null}
          </div>

          {isExampleFormOpen ? (
            <form className="page-section entry-setup-example-form" onSubmit={submitExampleForm}>
              <div className="section-header">
                <div>
                  <h4>{editingExampleId ? 'Edit setup example' : 'Create setup example'}</h4>
                  <p className="section-note">Keep it practical: short title, clear lane, one useful example sequence, and the search handoff you want people to use.</p>
                </div>
              </div>
              <div className="form-grid">
                <div>
                  <label htmlFor="entry-setup-example-title">Title</label>
                  <input
                    id="entry-setup-example-title"
                    value={exampleForm.title}
                    onChange={(event) => updateExampleFormValue('title', event.target.value)}
                    placeholder="Single-leg off failed ankle pick"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="entry-setup-example-lane">Lane</label>
                  <select
                    id="entry-setup-example-lane"
                    value={exampleForm.lane}
                    onChange={(event) => updateExampleFormValue('lane', event.target.value)}
                  >
                    {quickLanes.map((lane) => (
                      <option key={lane} value={lane}>{lane}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="entry-setup-example-family">Related built-in family</label>
                  <select
                    id="entry-setup-example-family"
                    value={exampleForm.linked_family_title}
                    onChange={(event) => updateExampleFormValue('linked_family_title', event.target.value)}
                  >
                    <option value="">No linked family</option>
                    {setupFamilies.map((family) => (
                      <option key={family.title} value={family.title}>{family.title}</option>
                    ))}
                  </select>
                </div>
                {isOwner ? (
                  <div>
                    <label htmlFor="entry-setup-example-visibility">Visibility</label>
                    <select
                      id="entry-setup-example-visibility"
                      value={exampleForm.visibility}
                      onChange={(event) => updateExampleFormValue('visibility', event.target.value)}
                    >
                      <option value="private">Private to me</option>
                      <option value="gym_shared">Share with the whole gym</option>
                    </select>
                  </div>
                ) : null}
                <div className="span-2">
                  <label htmlFor="entry-setup-example-summary">Summary</label>
                  <input
                    id="entry-setup-example-summary"
                    value={exampleForm.summary}
                    onChange={(event) => updateExampleFormValue('summary', event.target.value)}
                    placeholder="Use one threat to make the next attack easier."
                  />
                </div>
                <div className="span-2">
                  <label htmlFor="entry-setup-example-description">Description</label>
                  <textarea
                    id="entry-setup-example-description"
                    rows={3}
                    value={exampleForm.description}
                    onChange={(event) => updateExampleFormValue('description', event.target.value)}
                    placeholder="Add the coaching idea behind the sequence so the next person understands why it works."
                  />
                </div>
                <div className="span-2">
                  <label htmlFor="entry-setup-example-setup-nodes">Setup nodes</label>
                  <input
                    id="entry-setup-example-setup-nodes"
                    value={exampleForm.setup_nodes_input}
                    onChange={(event) => updateExampleFormValue('setup_nodes_input', event.target.value)}
                    placeholder="Head touch, level change, wrist pull"
                  />
                </div>
                <div className="span-2">
                  <label htmlFor="entry-setup-example-next-attacks">Common next attacks</label>
                  <input
                    id="entry-setup-example-next-attacks"
                    value={exampleForm.next_attacks_input}
                    onChange={(event) => updateExampleFormValue('next_attacks_input', event.target.value)}
                    placeholder="Ankle pick, single leg, front headlock"
                  />
                </div>
                <div className="span-2">
                  <label htmlFor="entry-setup-example-sequence">Example sequence</label>
                  <input
                    id="entry-setup-example-sequence"
                    value={exampleForm.example_sequence_input}
                    onChange={(event) => updateExampleFormValue('example_sequence_input', event.target.value)}
                    placeholder="Head touch -> they step -> ankle pick -> they square up -> single leg"
                  />
                </div>
                <div>
                  <label htmlFor="entry-setup-example-curriculum-search">Curriculum search handoff</label>
                  <input
                    id="entry-setup-example-curriculum-search"
                    value={exampleForm.curriculum_search}
                    onChange={(event) => updateExampleFormValue('curriculum_search', event.target.value)}
                    placeholder="Optional override"
                  />
                </div>
                <div>
                  <label htmlFor="entry-setup-example-tree-search">Decision Tree handoff</label>
                  <input
                    id="entry-setup-example-tree-search"
                    value={exampleForm.tree_search}
                    onChange={(event) => updateExampleFormValue('tree_search', event.target.value)}
                    placeholder="Optional override"
                  />
                </div>
              </div>
              <div className="inline-actions">
                <button type="submit" className="secondary-button">
                  {editingExampleId ? 'Save changes' : 'Save setup example'}
                </button>
                <button type="button" className="secondary-button" onClick={closeExampleForm}>
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          <div className="entry-setups-custom-section-list">
            {customExamplesLoading ? (
              <div className="empty-state">
                <p>Loading saved setup examples...</p>
              </div>
            ) : (
              exampleSort === 'shared-first' ? (
                <div className="entry-setups-custom-group">
                  <div className="section-header">
                    <div>
                      <h4>All matching examples</h4>
                      <p className="section-note">Shared owner examples appear first, then private ones beneath them.</p>
                    </div>
                  </div>
                  {sortedCustomExamples.length === 0 ? (
                    <p className="meta-text entry-setups-inline-empty">No saved setup examples match these filters yet.</p>
                  ) : (
                    <div className="action-grid entry-setups-family-grid">
                      {sortedCustomExamples.map((example) => renderCustomExampleCard(
                        example,
                        example.visibility === 'gym_shared' ? 'shared' : 'private',
                        String(example.created_by_user_id) === String(user?.id)
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="entry-setups-custom-group">
                    <div className="section-header">
                      <div>
                        <h4>Gym owner examples</h4>
                        <p className="section-note">These are the shared examples your gym owner wants everyone to be able to revisit.</p>
                      </div>
                    </div>
                    {sharedExamples.length === 0 ? (
                      <p className="meta-text entry-setups-inline-empty">No shared owner examples match these filters yet.</p>
                    ) : (
                      <div className="action-grid entry-setups-family-grid">
                        {sharedExamples.map((example) => renderCustomExampleCard(
                          example,
                          'shared',
                          String(example.created_by_user_id) === String(user?.id)
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="entry-setups-custom-group">
                    <div className="section-header">
                      <div>
                        <h4>My private examples</h4>
                        <p className="section-note">Only you can see these saved setup examples.</p>
                      </div>
                    </div>
                    {privateExamples.length === 0 ? (
                      <p className="meta-text entry-setups-inline-empty">No private saved examples match these filters yet.</p>
                    ) : (
                      <div className="action-grid entry-setups-family-grid">
                        {privateExamples.map((example) => renderCustomExampleCard(example, 'private', true))}
                      </div>
                    )}
                  </div>
                </>
              )
            )}
          </div>
        </section>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>Built-in setup families</h3>
              <p className="section-note">Start with the setup family, then jump into Curriculum or Decision Trees from the branch you want.</p>
            </div>
            <div className="inline-actions">
              <button
                type="button"
                className={`secondary-button${isBuiltInCompactView ? ' is-active' : ''}`}
                onClick={() => setIsBuiltInCompactView((current) => !current)}
              >
                {isBuiltInCompactView ? 'Show more detail' : 'Use compact built-in view'}
              </button>
            </div>
          </div>

          <div className="entry-setups-search-shell">
            <div className="entry-setups-search-row">
              <div>
                <label htmlFor="entry-setup-search">Search setup families</label>
                <input
                  id="entry-setup-search"
                  type="text"
                  value={familySearch}
                  onChange={(event) => setFamilySearch(event.target.value)}
                  placeholder="Search single leg, front headlock, guard, passing..."
                />
              </div>
            </div>
            <div className="entry-setups-lane-row">
              <button
                type="button"
                className={`secondary-button${!activeLane ? ' is-active' : ''}`}
                onClick={() => setActiveLane('')}
              >
                All lanes
              </button>
              {quickLanes.map((lane) => (
                <button
                  key={lane}
                  type="button"
                  className={`secondary-button${activeLane === lane ? ' is-active' : ''}`}
                  onClick={() => setActiveLane(lane)}
                >
                  {lane}
                </button>
              ))}
            </div>
            <div className="entry-setups-search-summary">
              <span className="entry-setup-info-chip">
                {filteredSetupFamilies.length} famil{filteredSetupFamilies.length === 1 ? 'y' : 'ies'} shown
              </span>
              <span className="entry-setup-info-chip">
                {setupFamilies.length} total families
              </span>
              {familySearch || activeLane ? (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setFamilySearch('');
                    setActiveLane('');
                  }}
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          </div>

          <div className="action-grid entry-setups-family-grid">
            {filteredSetupFamilies.length === 0 ? (
              <div className="empty-state">
                <p>No setup families match that search yet.</p>
              </div>
            ) : (
              filteredSetupFamilies.map((family) => {
                const isExpanded = !useBuiltInCompactCards || Boolean(expandedFamilies[family.title]) || selectedFamily === family.title;

                return (
                  <article
                    key={family.title}
                    id={`entry-setup-family-${getEntrySetupFamilySlug(family.title)}`}
                    className={`action-card dashboard-action-card entry-setup-family-card${selectedFamily === family.title ? ' is-selected' : ''}${useBuiltInCompactCards ? ' is-collapsible' : ''}${isExpanded ? ' is-expanded' : ''}`}
                  >
                    <div className="entry-setup-family-header">
                      <div>
                        <strong>{family.title}</strong>
                        <span className="meta-text">{family.summary}</span>
                        <div className="entry-setup-family-lane">
                          <span className="entry-setup-info-chip">{family.lane}</span>
                        </div>
                      </div>
                      {useBuiltInCompactCards ? (
                        <button
                          type="button"
                          className="secondary-button entry-setup-family-toggle"
                          onClick={() => toggleFamily(family.title)}
                        >
                          {isExpanded ? 'Hide' : 'Expand'}
                        </button>
                      ) : null}
                    </div>

                    <div className="entry-setup-family-actions">
                      <Link className="secondary-button" to={buildCurriculumLink(family.curriculumSearch)}>
                        Open in Curriculum
                      </Link>
                      <Link className="secondary-button" to={buildDecisionTreeLink(family.treeSearch, family.title)}>
                        Continue in Decision Trees
                      </Link>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => openCloneFamilyForm(family)}
                      >
                        Save to use / study
                      </button>
                    </div>

                    {isExpanded ? (
                      <>
                        <p className="section-note">{family.description}</p>

                        <div className="entry-setup-family-block">
                          <span className="meta-text entry-setup-block-label">Common setups</span>
                          <div className="suggestion-chip-row">
                            {family.setupNodes.map((node) => (
                              <span key={`${family.title}-${node}`} className="entry-setup-info-chip entry-setup-info-chip-accent">
                                {node}
                              </span>
                            ))}
                          </div>
                        </div>

                        {family.exampleSequence?.length ? (
                          <div className="entry-setup-family-block">
                            <span className="meta-text entry-setup-block-label">Example sequence</span>
                            {renderSequenceFlow(family.exampleSequence, family.title)}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="entry-setup-family-collapsed-preview">
                        <span className="meta-text entry-setup-block-label">Common setups</span>
                        <div className="suggestion-chip-row">
                          {family.setupNodes.slice(0, 3).map((node) => (
                            <span key={`${family.title}-preview-${node}`} className="entry-setup-info-chip entry-setup-info-chip-accent">
                              {node}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className="page-section">
          <div className="section-header">
            <div>
              <h3>What comes next</h3>
              <p className="section-note">This first version organizes setup families. A later layer can add full reaction-by-reaction sequences.</p>
            </div>
          </div>
          <p className="section-note">
            The future version of this feature should let a coach or student move through a full chain like:
            head touch - level change - ankle pick - single leg - sprawl reaction - front headlock - turtle attack,
            then continue the rest of the branch inside Decision Trees.
          </p>
        </section>
      </div>
    </Layout>
  );
}
