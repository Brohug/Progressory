import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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
  example_sequence_steps: ['', '', '', ''],
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

const buildListInputValue = (items, delimiter = ', ') => (
  Array.isArray(items) ? items.join(delimiter) : ''
);

const buildSequenceStepArray = (items = [], minimumSteps = 4) => {
  const cleaned = Array.isArray(items)
    ? items.map((item) => String(item || '').trim()).filter(Boolean)
    : [];

  if (cleaned.length >= minimumSteps) {
    return cleaned;
  }

  return [...cleaned, ...Array.from({ length: minimumSteps - cleaned.length }, () => '')];
};

const getSequenceStepLabel = (index, totalSteps) => {
  if (index === 0) {
    return 'Start';
  }

  if (index === totalSteps - 1) {
    return 'Finish';
  }

  return `Step ${index + 1}`;
};

const normalizeSearchText = (value) => (
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
);

const getSearchScore = (normalizedSearch, parts = [], exactTerms = []) => {
  if (!normalizedSearch) {
    return 0;
  }

  const normalizedExactTerms = exactTerms
    .map((term) => normalizeSearchText(term))
    .filter(Boolean);

  if (normalizedExactTerms.some((term) => term === normalizedSearch)) {
    return 4;
  }

  if (normalizedExactTerms.some((term) => term.startsWith(normalizedSearch))) {
    return 3;
  }

  const haystack = normalizeSearchText(parts.join(' '));

  return haystack.includes(normalizedSearch) ? 1 : -1;
};

export default function EntrySetupsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const selectedFamily = searchParams.get('family') || '';
  const [familySearch, setFamilySearch] = useState('');
  const [activeLane, setActiveLane] = useState('');
  const [expandedFamilies, setExpandedFamilies] = useState({});
  const [expandedFamilySections, setExpandedFamilySections] = useState({});
  const [customExamples, setCustomExamples] = useState([]);
  const [customExamplesLoading, setCustomExamplesLoading] = useState(true);
  const [customExamplesError, setCustomExamplesError] = useState('');
  const [customExamplesFeedback, setCustomExamplesFeedback] = useState('');
  const [isExampleFormOpen, setIsExampleFormOpen] = useState(false);
  const [showExampleAdvancedFields, setShowExampleAdvancedFields] = useState(false);
  const [editingExampleId, setEditingExampleId] = useState(null);
  const [exampleSort, setExampleSort] = useState('newest');
  const [builtInSort, setBuiltInSort] = useState('recommended');
  const [isBuiltInCompactView, setIsBuiltInCompactView] = useState(true);
  const [isSavedCompactView, setIsSavedCompactView] = useState(true);
  const [exampleForm, setExampleForm] = useState(() => buildInitialCustomExampleForm());
  const [isMobileCompactCards, setIsMobileCompactCards] = useState(() => (
    typeof window !== 'undefined' ? window.innerWidth <= 720 : false
  ));
  const hasHandledInitialFamilySelectionRef = useRef(false);
  const exampleFormRef = useRef(null);
  const builtInSearchTopRef = useRef(null);
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

    setExpandedFamilies((current) => (
      current[selectedFamily]
        ? current
        : {
            ...current,
            [selectedFamily]: true
          }
    ));

    if (!hasHandledInitialFamilySelectionRef.current) {
      hasHandledInitialFamilySelectionRef.current = true;
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
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isExampleFormOpen) {
      return;
    }

    window.setTimeout(() => {
      exampleFormRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 120);
  }, [isExampleFormOpen]);

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
    const normalizedSearch = normalizeSearchText(familySearch);
    const laneScopedFamilies = activeLane
      ? setupFamilies.filter((family) => family.lane === activeLane)
      : setupFamilies;

    const scoredFamilies = laneScopedFamilies.map((family, index) => ({
      family,
      index,
      score: getSearchScore(
        normalizedSearch,
        [
          family.lane,
          family.title,
          family.summary,
          family.description,
          ...(family.setupNodes || []),
          ...(family.nextAttacks || []),
          ...(family.exampleSequence || [])
        ],
        [family.title, ...(family.relatedTerms || [])]
      )
    }));

    const visibleFamilies = normalizedSearch
      ? scoredFamilies.filter((entry) => entry.score >= 0)
      : scoredFamilies;

    visibleFamilies.sort((left, right) => {
      if (normalizedSearch && right.score !== left.score) {
        return right.score - left.score;
      }

      if (builtInSort === 'a-z') {
        return left.family.title.localeCompare(right.family.title);
      }

      if (builtInSort === 'lane') {
        const laneCompare = left.family.lane.localeCompare(right.family.lane);

        if (laneCompare !== 0) {
          return laneCompare;
        }

        return left.family.title.localeCompare(right.family.title);
      }

      return left.index - right.index;
    });

    return visibleFamilies.map((entry) => entry.family);
  }, [activeLane, builtInSort, familySearch]);

  const searchMatchedBuiltInFamilies = useMemo(() => {
    const normalizedSearch = normalizeSearchText(familySearch);
    if (!normalizedSearch) {
      return setupFamilies;
    }

    return setupFamilies.filter((family) => (
      getSearchScore(
        normalizedSearch,
        [
          family.lane,
          family.title,
          family.summary,
          family.description,
          ...(family.setupNodes || []),
          ...(family.nextAttacks || []),
          ...(family.exampleSequence || [])
        ],
        [family.title, ...(family.relatedTerms || [])]
      ) >= 0
    ));
  }, [familySearch]);

  const builtInLaneCounts = useMemo(() => {
    const counts = {
      all: searchMatchedBuiltInFamilies.length
    };

    quickLanes.forEach((lane) => {
      counts[lane] = searchMatchedBuiltInFamilies.filter((family) => family.lane === lane).length;
    });

    return counts;
  }, [quickLanes, searchMatchedBuiltInFamilies]);

  const filteredCustomExamples = useMemo(() => {
    const normalizedSearch = normalizeSearchText(familySearch);

    return customExamples.map((example) => {
      const matchesLane = !activeLane || example.lane === activeLane;

      if (!matchesLane) {
        return null;
      }

      const score = getSearchScore(
        normalizedSearch,
        [
          example.lane,
          example.title,
          example.linked_family_title,
          example.summary,
          example.description,
          ...(example.setup_nodes || []),
          ...(example.next_attacks || []),
          ...(example.example_sequence || [])
        ],
        [example.title, example.linked_family_title]
      );

      if (normalizedSearch && score < 0) {
        return null;
      }

      return { example, score };
    }).filter(Boolean);
  }, [activeLane, customExamples, familySearch]);

  const sortedCustomExamples = useMemo(() => {
    const sorted = [...filteredCustomExamples];

    sorted.sort((leftEntry, rightEntry) => {
      if (familySearch && rightEntry.score !== leftEntry.score) {
        return rightEntry.score - leftEntry.score;
      }

      const left = leftEntry.example;
      const right = rightEntry.example;

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

    return sorted.map((entry) => entry.example);
  }, [exampleSort, familySearch, filteredCustomExamples, user?.id]);

  const topBuiltInMatch = filteredSetupFamilies[0] || null;
  const topSavedMatch = sortedCustomExamples[0] || null;

  const sharedExamples = useMemo(
    () => sortedCustomExamples.filter((example) => example.visibility === 'gym_shared'),
    [sortedCustomExamples]
  );

  const privateExamples = useMemo(
    () => sortedCustomExamples.filter((example) => example.visibility === 'private'),
    [sortedCustomExamples]
  );

  const updateSelectedFamilyUrl = (familyTitle, replace = true) => {
    const nextParams = new URLSearchParams(searchParams);

    if (familyTitle) {
      nextParams.set('family', familyTitle);
    } else {
      nextParams.delete('family');
    }

    const nextSearch = nextParams.toString();

    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : ''
      },
      { replace }
    );
  };

  const navigateFromFamily = (destination, familyTitle) => {
    updateSelectedFamilyUrl(familyTitle, true);
    navigate(destination);
  };

  const toggleFamily = (familyTitle) => {
    const isCurrentlyExpanded = Boolean(expandedFamilies[familyTitle]);

    setExpandedFamilies((current) => ({
      ...current,
      [familyTitle]: !current[familyTitle]
    }));

    updateSelectedFamilyUrl(isCurrentlyExpanded ? '' : familyTitle, true);
  };

  const toggleExpandedCard = (cardKey) => {
    setExpandedFamilies((current) => ({
      ...current,
      [cardKey]: !current[cardKey]
    }));
  };

  const toggleFamilySection = (familyTitle, sectionKey) => {
    const compositeKey = `${familyTitle}::${sectionKey}`;

    setExpandedFamilySections((current) => ({
      ...current,
      [compositeKey]: !current[compositeKey]
    }));
  };

  const isFamilySectionOpen = (familyTitle, sectionKey) => {
    const compositeKey = `${familyTitle}::${sectionKey}`;

    if (!(compositeKey in expandedFamilySections)) {
      return sectionKey === 'overview';
    }

    return Boolean(expandedFamilySections[compositeKey]);
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

  const getPrimaryExampleLine = (steps = [], limit = 3) => (
    (Array.isArray(steps) ? steps : [])
      .map((step) => String(step || '').trim())
      .filter(Boolean)
      .slice(0, limit)
      .join(' -> ')
  );

  const getEntryLogicLine = (family) => {
    const description = String(family.description || '').trim();

    if (!description) {
      return 'Create the reaction first, then attack the opening that appears.';
    }

    const sentences = description
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    return sentences[0] || description;
  };

  const getAttackWindowLine = (family) => {
    const reactionStep = (family.exampleSequence || []).find((step) => /^they\b/i.test(String(step || '').trim()));

    if (reactionStep) {
      return `Enter while "${reactionStep}" is still happening, not after they fully reset.`;
    }

    return 'Enter while the reaction you forced is still happening, not after the opponent resets their stance or posture.';
  };

  const getCompactFollowUpLine = (family) => {
    const steps = (family.exampleSequence || [])
      .map((step) => String(step || '').trim())
      .filter(Boolean);
    const reactionStep = [...steps].reverse().find((step) => /^they\b/i.test(step));
    const finishStep = steps[steps.length - 1] || '';

    if (reactionStep && finishStep && reactionStep !== finishStep) {
      return `${reactionStep} -> ${finishStep}`;
    }

    const attacks = (family.nextAttacks || []).slice(0, 2);

    return attacks.join(' / ');
  };

  const renderFamilyAccordionSection = (family, sectionKey, title, content) => {
    const isOpen = isFamilySectionOpen(family.title, sectionKey);

    return (
      <div key={`${family.title}-${sectionKey}`} className={`entry-setup-accordion-section${isOpen ? ' is-open' : ''}`}>
        <button
          type="button"
          className="entry-setup-accordion-toggle"
          onClick={() => toggleFamilySection(family.title, sectionKey)}
        >
          <span>{title}</span>
          <span className="entry-setup-accordion-indicator" aria-hidden="true">{isOpen ? '−' : '+'}</span>
        </button>
        {isOpen ? <div className="entry-setup-accordion-content">{content}</div> : null}
      </div>
    );
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
    setShowExampleAdvancedFields(false);
    setExampleForm(buildInitialCustomExampleForm(isOwner ? 'private' : 'private'));
  };

  const openSavedExamplesSection = ({ showDetail = false } = {}) => {
    if (showDetail) {
      setIsSavedCompactView(false);
    }
  };

  const openCreateExampleForm = () => {
    resetExampleComposer();
    setCustomExamplesFeedback('');
    setCustomExamplesError('');
    openSavedExamplesSection({ showDetail: true });
    setIsExampleFormOpen(true);
  };

  const openCloneFamilyForm = (family) => {
    setEditingExampleId(null);
    setShowExampleAdvancedFields(false);
    setExampleForm({
      title: `${family.title} - my version`,
      lane: family.lane || 'Standing',
      linked_family_title: family.title,
      summary: family.summary || '',
      description: family.description || '',
      setup_nodes_input: buildListInputValue(family.setupNodes),
      next_attacks_input: buildListInputValue(family.nextAttacks),
      example_sequence_steps: buildSequenceStepArray(family.exampleSequence),
      curriculum_search: family.curriculumSearch || family.title,
      tree_search: family.treeSearch || family.title,
      visibility: 'private'
    });
    setCustomExamplesFeedback('');
    setCustomExamplesError('');
    openSavedExamplesSection({ showDetail: true });
    setIsExampleFormOpen(true);
  };

  const openEditExampleForm = (example) => {
    setEditingExampleId(example.id);
    setShowExampleAdvancedFields(true);
    setExampleForm({
      title: example.title || '',
      lane: example.lane || 'Standing',
      linked_family_title: example.linked_family_title || '',
      summary: example.summary || '',
      description: example.description || '',
      setup_nodes_input: buildListInputValue(example.setup_nodes),
      next_attacks_input: buildListInputValue(example.next_attacks),
      example_sequence_steps: buildSequenceStepArray(example.example_sequence),
      curriculum_search: example.curriculum_search || '',
      tree_search: example.tree_search || '',
      visibility: isOwner && example.visibility === 'gym_shared' ? 'gym_shared' : 'private'
    });
    setCustomExamplesFeedback('');
    setCustomExamplesError('');
    openSavedExamplesSection({ showDetail: true });
    setIsExampleFormOpen(true);
  };

  const closeExampleForm = () => {
    setIsExampleFormOpen(false);
    resetExampleComposer();
  };

  const minimizeExampleForm = () => {
    setIsExampleFormOpen(false);
  };

  const applyLinkedFamilyDefaults = () => {
    const linkedFamily = getLinkedFamily(exampleForm.linked_family_title);

    if (!linkedFamily) {
      return;
    }

    setExampleForm((current) => ({
      ...current,
      lane: linkedFamily.lane || current.lane,
      summary: linkedFamily.summary || current.summary,
      description: linkedFamily.description || current.description,
      setup_nodes_input: buildListInputValue(linkedFamily.setupNodes),
      next_attacks_input: buildListInputValue(linkedFamily.nextAttacks),
      example_sequence_steps: buildSequenceStepArray(linkedFamily.exampleSequence),
      curriculum_search: linkedFamily.curriculumSearch || current.curriculum_search || linkedFamily.title,
      tree_search: linkedFamily.treeSearch || current.tree_search || linkedFamily.title
    }));

    setShowExampleAdvancedFields(true);
  };

  const handleLinkedFamilyChange = (value) => {
    const linkedFamily = getLinkedFamily(value);

    setExampleForm((current) => ({
      ...current,
      linked_family_title: value,
      lane: linkedFamily?.lane || current.lane,
      curriculum_search: current.curriculum_search || linkedFamily?.curriculumSearch || '',
      tree_search: current.tree_search || linkedFamily?.treeSearch || ''
    }));
  };

  const applyExampleStarterTemplate = (template) => {
    if (template === 'blank') {
      setExampleForm((current) => ({
        ...buildInitialCustomExampleForm(isOwner ? current.visibility : 'private'),
        visibility: isOwner ? current.visibility : 'private'
      }));
      setShowExampleAdvancedFields(false);
      return;
    }

    if (template === 'coach-note-only') {
      setExampleForm((current) => ({
        ...current,
        setup_nodes_input: '',
        next_attacks_input: '',
        example_sequence_steps: buildSequenceStepArray([]),
        curriculum_search: '',
        tree_search: ''
      }));
      setShowExampleAdvancedFields(true);
      return;
    }

    if (template === 'built-in-family') {
      applyLinkedFamilyDefaults();
    }
  };

  const updateExampleSequenceStep = (index, value) => {
    setExampleForm((current) => ({
      ...current,
      example_sequence_steps: current.example_sequence_steps.map((step, stepIndex) => (
        stepIndex === index ? value : step
      ))
    }));
  };

  const addExampleSequenceStep = () => {
    setExampleForm((current) => ({
      ...current,
      example_sequence_steps: [...current.example_sequence_steps, '']
    }));
  };

  const removeExampleSequenceStep = (index) => {
    setExampleForm((current) => {
      if (current.example_sequence_steps.length <= 2) {
        return current;
      }

      const nextSteps = current.example_sequence_steps.filter((_, stepIndex) => stepIndex !== index);

      return {
        ...current,
        example_sequence_steps: nextSteps
      };
    });
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
    const exampleSequence = exampleForm.example_sequence_steps
      .map((step) => String(step || '').trim())
      .filter(Boolean);
    const payload = {
      title: exampleForm.title,
      lane: exampleForm.lane,
      linked_family_title: exampleForm.linked_family_title || null,
      summary: exampleForm.summary || null,
      description: exampleForm.description || null,
      setup_nodes: parseCommaSeparatedList(exampleForm.setup_nodes_input),
      next_attacks: parseCommaSeparatedList(exampleForm.next_attacks_input),
      example_sequence: exampleSequence,
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

  const scrollToBuiltInSearchTop = () => {
    builtInSearchTopRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
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

  const renderSequenceStepBuilder = () => (
    <div className="entry-setup-sequence-builder">
      <div className="entry-setup-sequence-builder-header">
        <label>Example sequence</label>
        <button type="button" className="secondary-button" onClick={addExampleSequenceStep}>
          Add step
        </button>
      </div>
      <div className="entry-setup-sequence-builder-list">
        {exampleForm.example_sequence_steps.map((step, index) => (
          <div key={`example-sequence-step-${index}`} className="entry-setup-sequence-builder-row">
            <div className="entry-setup-sequence-builder-meta">
              <span className="entry-setup-sequence-builder-kicker">
                {getSequenceStepLabel(index, exampleForm.example_sequence_steps.length)}
              </span>
              {index > 0 ? <span className="entry-setup-sequence-builder-arrow" aria-hidden="true">→</span> : null}
            </div>
            <input
              value={step}
              onChange={(event) => updateExampleSequenceStep(index, event.target.value)}
              placeholder={
                index === 0
                  ? 'Head touch + level change'
                  : (index === exampleForm.example_sequence_steps.length - 1
                    ? 'Single leg / front headlock finish'
                    : 'They step / ankle pick / they sprawl')
              }
            />
            {exampleForm.example_sequence_steps.length > 2 ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => removeExampleSequenceStep(index)}
              >
                Remove
              </button>
            ) : null}
          </div>
        ))}
      </div>
      <p className="section-note entry-setup-sequence-builder-note">
        Build the chain step by step so the next coach or student can follow the reaction flow without guessing your formatting.
      </p>
    </div>
  );

  const renderCustomExampleCard = (example, scopeLabel, canEdit) => {
    const cardKey = `custom-example-${example.id}`;
    const isExpanded = !useSavedCompactCards || Boolean(expandedFamilies[cardKey]);
    const summaryLabel = scopeLabel === 'shared' ? 'Why this helps the gym' : 'Why this helps me';
    const descriptionLabel = scopeLabel === 'shared' ? 'Coach note for the gym' : 'Study note';
    const exampleFamilyContext = example.linked_family_title || example.title;

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
              className="secondary-button entry-setup-family-toggle chevron-toggle-button"
              onClick={() => toggleExpandedCard(cardKey)}
              aria-label={isExpanded ? 'Collapse saved setup example' : 'Expand saved setup example'}
            >
              <span aria-hidden="true">{isExpanded ? '▾' : '▸'}</span>
            </button>
          ) : null}
        </div>

        <div className="entry-setup-family-actions entry-setup-family-actions-primary">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigateFromFamily(buildCurriculumLink(getExampleCurriculumSearch(example)), exampleFamilyContext)}
          >
            Open in Curriculum
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigateFromFamily(buildDecisionTreeLink(getExampleTreeSearch(example), exampleFamilyContext), exampleFamilyContext)}
          >
            Continue in Decision Trees
          </button>
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
                <button
                  type="button"
                  className="link-button"
                  onClick={() => navigateFromFamily(buildCurriculumLink(getExampleCurriculumSearch(example)), exampleFamilyContext)}
                >
                  View starting topic
                </button>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => navigateFromFamily(buildDecisionTreeLink(getExampleTreeSearch(example), exampleFamilyContext), exampleFamilyContext)}
                >
                  Use tree handoff
                </button>
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

        <section className="page-section entry-setups-saved-section">
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

        <section className="page-section entry-setups-builtins-section">
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
                onClick={() => {
                  openSavedExamplesSection();
                  setIsSavedCompactView((current) => !current);
                }}
              >
                {isSavedCompactView ? 'Show more detail' : 'Minimize saved view'}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  if (isExampleFormOpen) {
                    minimizeExampleForm();
                    return;
                  }

                  openCreateExampleForm();
                }}
              >
                {isExampleFormOpen
                  ? (editingExampleId ? 'Minimize editing form' : 'Minimize setup form')
                  : (editingExampleId ? 'Editing setup example' : 'Create setup example')}
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
              {familySearch && topSavedMatch ? (
                <span className="entry-setup-info-chip entry-setup-info-chip-accent">
                  Top saved match: {topSavedMatch.title}
                </span>
              ) : null}
              {isExampleFormOpen ? (
                <span className="entry-setup-info-chip entry-setup-info-chip-accent">Draft form open</span>
              ) : null}
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
            <form ref={exampleFormRef} className="page-section entry-setup-example-form" onSubmit={submitExampleForm}>
              <div className="section-header">
                <div>
                  <h4>{editingExampleId ? 'Edit setup example' : 'Create setup example'}</h4>
                  <p className="section-note">Start with the built-in family if you can, name the version clearly, then keep only the details that actually help the next person use it.</p>
                </div>
                <div className="inline-actions">
                  <button type="button" className="secondary-button" onClick={minimizeExampleForm}>
                    Minimize form
                  </button>
                </div>
              </div>
              <div className="entry-setup-example-quickstart">
                <span className="entry-setup-info-chip entry-setup-info-chip-accent">1. Pick a lane or family</span>
                <span className="entry-setup-info-chip entry-setup-info-chip-accent">2. Name the version clearly</span>
                <span className="entry-setup-info-chip entry-setup-info-chip-accent">3. Save a sequence people can actually study</span>
              </div>
              <div className="entry-setup-example-template-row">
                <span className="meta-text entry-setup-block-label">Start from</span>
                <button type="button" className="secondary-button" onClick={() => applyExampleStarterTemplate('blank')}>
                  Blank
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => applyExampleStarterTemplate('built-in-family')}
                  disabled={!exampleForm.linked_family_title}
                >
                  Use linked family
                </button>
                <button type="button" className="secondary-button" onClick={() => applyExampleStarterTemplate('coach-note-only')}>
                  Coach note only
                </button>
              </div>
              <div className="form-grid">
                <div>
                  <label htmlFor="entry-setup-example-family">Related built-in family</label>
                  <select
                    id="entry-setup-example-family"
                    value={exampleForm.linked_family_title}
                    onChange={(event) => handleLinkedFamilyChange(event.target.value)}
                  >
                    <option value="">No linked family</option>
                    {setupFamilies.map((family) => (
                      <option key={family.title} value={family.title}>{family.title}</option>
                    ))}
                  </select>
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
                <div className="span-2">
                  <label htmlFor="entry-setup-example-title">Title</label>
                  <input
                    id="entry-setup-example-title"
                    value={exampleForm.title}
                    onChange={(event) => updateExampleFormValue('title', event.target.value)}
                    placeholder="Single-leg off failed ankle pick"
                    required
                  />
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
                  <label htmlFor="entry-setup-example-setup-nodes">Setup nodes</label>
                  <input
                    id="entry-setup-example-setup-nodes"
                    value={exampleForm.setup_nodes_input}
                    onChange={(event) => updateExampleFormValue('setup_nodes_input', event.target.value)}
                    placeholder="Head touch, level change, wrist pull"
                  />
                </div>
              </div>
              {renderSequenceStepBuilder()}
              <div className="entry-setup-example-helper-row">
                {exampleForm.linked_family_title ? (
                  <button type="button" className="secondary-button" onClick={applyLinkedFamilyDefaults}>
                    Pull in built-in family details
                  </button>
                ) : null}
                <button
                  type="button"
                  className={`secondary-button${showExampleAdvancedFields ? ' is-active' : ''}`}
                  onClick={() => setShowExampleAdvancedFields((current) => !current)}
                >
                  {showExampleAdvancedFields ? 'Hide optional detail fields' : 'Show optional detail fields'}
                </button>
              </div>
              {showExampleAdvancedFields ? (
                <div className="form-grid entry-setup-example-advanced-grid">
                  <div className="span-2">
                    <label htmlFor="entry-setup-example-summary">Quick purpose</label>
                    <input
                      id="entry-setup-example-summary"
                      value={exampleForm.summary}
                      onChange={(event) => updateExampleFormValue('summary', event.target.value)}
                      placeholder="Use one threat to make the next attack easier."
                    />
                  </div>
                  <div className="span-2">
                    <label htmlFor="entry-setup-example-description">Coach or study note</label>
                    <textarea
                      id="entry-setup-example-description"
                      rows={3}
                      value={exampleForm.description}
                      onChange={(event) => updateExampleFormValue('description', event.target.value)}
                      placeholder="Add the coaching idea behind the sequence so the next person understands why it works."
                    />
                  </div>
                  <div className="span-2">
                    <label htmlFor="entry-setup-example-next-attacks">Optional follow-ups</label>
                    <input
                      id="entry-setup-example-next-attacks"
                      value={exampleForm.next_attacks_input}
                      onChange={(event) => updateExampleFormValue('next_attacks_input', event.target.value)}
                      placeholder="Ankle pick, single leg, front headlock"
                    />
                  </div>
                  <div>
                    <label htmlFor="entry-setup-example-curriculum-search">Curriculum handoff</label>
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
              ) : null}
              <div className="inline-actions">
                <button type="submit" className="secondary-button">
                  {editingExampleId ? 'Save changes' : (exampleForm.visibility === 'gym_shared' ? 'Save gym example' : 'Save private example')}
                </button>
                <button type="button" className="secondary-button" onClick={minimizeExampleForm}>
                  Minimize
                </button>
                <button type="button" className="secondary-button" onClick={closeExampleForm}>
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          {!isSavedCompactView ? (
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
          ) : null}
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

          <div ref={builtInSearchTopRef} />
          <div className="entry-setups-search-shell entry-setups-search-shell-sticky">
            <div className="entry-setups-search-shell-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={scrollToBuiltInSearchTop}
              >
                Back to top
              </button>
            </div>
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
                All lanes ({builtInLaneCounts.all})
              </button>
              {quickLanes.map((lane) => (
                <button
                  key={lane}
                  type="button"
                  className={`secondary-button${activeLane === lane ? ' is-active' : ''}`}
                  onClick={() => setActiveLane(lane)}
                >
                  {lane} ({builtInLaneCounts[lane] || 0})
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
              {familySearch && topBuiltInMatch ? (
                <span className="entry-setup-info-chip entry-setup-info-chip-accent">
                  Top built-in match: {topBuiltInMatch.title}
                </span>
              ) : null}
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
            <div className="entry-setups-lane-row entry-setups-sort-row">
              <button
                type="button"
                className={`secondary-button${builtInSort === 'recommended' ? ' is-active' : ''}`}
                onClick={() => setBuiltInSort('recommended')}
              >
                Recommended
              </button>
              <button
                type="button"
                className={`secondary-button${builtInSort === 'a-z' ? ' is-active' : ''}`}
                onClick={() => setBuiltInSort('a-z')}
              >
                A-Z
              </button>
              <button
                type="button"
                className={`secondary-button${builtInSort === 'lane' ? ' is-active' : ''}`}
                onClick={() => setBuiltInSort('lane')}
              >
                Group by lane
              </button>
            </div>
          </div>

          <div className="action-grid entry-setups-family-grid">
            {filteredSetupFamilies.length === 0 ? (
              <div className="empty-state">
                <p>No setup families match that search yet.</p>
              </div>
            ) : (
              filteredSetupFamilies.map((family) => {
                const isExpanded = Boolean(expandedFamilies[family.title]);

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
                        <button
                          type="button"
                          className="secondary-button entry-setup-family-toggle chevron-toggle-button"
                          onClick={() => toggleFamily(family.title)}
                          aria-label={isExpanded ? `Collapse ${family.title}` : `Expand ${family.title}`}
                        >
                          <span aria-hidden="true">{isExpanded ? '▾' : '▸'}</span>
                        </button>
                    </div>

                    <div className="entry-setup-family-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => navigateFromFamily(buildCurriculumLink(family.curriculumSearch), family.title)}
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => navigateFromFamily(buildDecisionTreeLink(family.treeSearch, family.title), family.title)}
                      >
                        Decision Tree
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => openCloneFamilyForm(family)}
                      >
                        Save
                      </button>
                    </div>

                    {isExpanded ? (
                      <>
                        <div className="entry-setup-family-accordion-list">
                          {renderFamilyAccordionSection(
                            family,
                            'overview',
                            'Overview',
                            <div className="entry-setup-family-block-list">
                              <div className="entry-setup-family-block">
                                <span className="meta-text entry-setup-block-label">Goal</span>
                                <p className="section-note">{family.summary}</p>
                              </div>
                              <div className="entry-setup-family-block">
                                <span className="meta-text entry-setup-block-label">Core idea</span>
                                <p className="section-note">{getEntryLogicLine(family)}</p>
                              </div>
                              <div className="entry-setup-family-block">
                                <span className="meta-text entry-setup-block-label">Attack window</span>
                                <p className="section-note">{getAttackWindowLine(family)}</p>
                              </div>
                            </div>
                          )}

                          {renderFamilyAccordionSection(
                            family,
                            'live-chains',
                            'Live chains',
                            <div className="entry-setup-family-block-list">
                              {family.exampleSequence?.length ? (
                                <div className="entry-setup-family-block">
                                  <span className="meta-text entry-setup-block-label">Example chain</span>
                                  {renderSequenceFlow(family.exampleSequence, family.title)}
                                </div>
                              ) : null}
                              {getCompactFollowUpLine(family) ? (
                                <div className="entry-setup-family-block">
                                  <span className="meta-text entry-setup-block-label">Live follow-ups</span>
                                  <p className="section-note">{getCompactFollowUpLine(family)}</p>
                                </div>
                              ) : null}
                            </div>
                          )}

                          {renderFamilyAccordionSection(
                            family,
                            'linked-techniques',
                            'Linked techniques',
                            <div className="entry-setup-family-block-list">
                              {family.setupNodes?.length ? (
                                <div className="entry-setup-family-block">
                                  <span className="meta-text entry-setup-block-label">Setups used</span>
                                  <div className="suggestion-chip-row">
                                    {family.setupNodes.map((node) => (
                                      <span key={`${family.title}-${node}`} className="entry-setup-info-chip entry-setup-info-chip-accent">
                                        {node}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                              {family.nextAttacks?.length ? (
                                <div className="entry-setup-family-block">
                                  <span className="meta-text entry-setup-block-label">Linked techniques</span>
                                  <div className="suggestion-chip-row">
                                    {family.nextAttacks.map((attack) => (
                                      <span key={`${family.title}-${attack}`} className="entry-setup-info-chip">
                                        {attack}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="entry-setup-family-collapsed-preview">
                        <div className="entry-setup-family-compact-line">
                          <span className="meta-text entry-setup-block-label">Entry logic</span>
                          <p className="section-note">{getEntryLogicLine(family)}</p>
                        </div>
                        {family.exampleSequence?.length ? (
                          <div className="entry-setup-family-compact-line">
                            <span className="meta-text entry-setup-block-label">Example</span>
                            <p className="section-note">{getPrimaryExampleLine(family.exampleSequence)}</p>
                          </div>
                        ) : null}
                        {getCompactFollowUpLine(family) ? (
                          <div className="entry-setup-family-compact-line">
                            <span className="meta-text entry-setup-block-label">Live follow-ups</span>
                            <p className="section-note">{getCompactFollowUpLine(family)}</p>
                          </div>
                        ) : null}
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

