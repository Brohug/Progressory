import { useEffect, useMemo, useRef, useState } from 'react';
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

const coachingScenarios = [
  {
    label: 'I need to pass guard',
    category: 'Passing and top control',
    focusName: 'Headquarters',
    description: 'Start from a common passing hub and bias toward top pressure options.',
    filters: {
      preferredStyle: 'pressure',
      topBottom: 'top',
      weakArea: 'guardPassing'
    }
  },
  {
    label: 'I am stuck under pressure',
    category: 'Escapes and defense',
    focusName: 'Bottom Side Control',
    description: 'Prioritize defensive reactions, frames, and escape pathways.',
    filters: {
      preferredStyle: 'defense',
      topBottom: 'bottom',
      weakArea: 'escapes',
      partnerStyle: 'pressure'
    }
  },
  {
    label: 'Build a back-take path',
    category: 'Back takes and control',
    focusName: 'Back Control',
    description: 'Surface entries, transitions, and follow-ups that lead toward the back.',
    filters: {
      preferredStyle: 'backTakes',
      weakArea: 'backTakes',
      riskTolerance: 'medium'
    }
  },
  {
    label: 'Opponent is leg locking',
    category: 'Leg locks',
    focusName: 'Ashi Garami',
    description: 'Use leg-lock familiarity and weakness filters to shrink the options.',
    filters: {
      preferredStyle: 'legLocks',
      legLockFamiliarity: 'learning',
      weakArea: 'legLocks',
      partnerStyle: 'legLocks'
    }
  },
  {
    label: 'I need safer leg-lock basics',
    category: 'Leg locks',
    focusName: 'Straight Ankle Lock',
    description: 'Start with more teachable lower-body control and lower-risk routes before jumping into deeper heel-hook chains.',
    filters: {
      preferredStyle: 'legLocks',
      legLockFamiliarity: 'learning',
      riskTolerance: 'low',
      weakArea: 'legLocks'
    },
    followUps: [
      { label: 'Straight ankle lock', focusName: 'Straight Ankle Lock' },
      { label: 'Kneebar', focusName: 'Kneebar' },
      { label: 'Aoki lock', focusName: 'Aoki Lock' }
    ]
  },
  {
    label: 'I keep getting heel-hooked',
    category: 'Leg locks',
    focusName: 'Inside Heel Hook',
    description: 'Bias toward defensive branches, knee-line awareness, and safer lower-body reactions.',
    filters: {
      preferredStyle: 'defense',
      topBottom: 'bottom',
      weakArea: 'legLocks',
      legLockFamiliarity: 'avoid',
      partnerStyle: 'legLocks'
    }
  },
  {
    label: 'Improve standing exchanges',
    category: 'Standing and takedowns',
    focusName: 'Front Headlock',
    description: 'Bias toward wrestling, front-headlock, and takedown-related branches.',
    filters: {
      preferredStyle: 'wrestling',
      topBottom: 'standing',
      weakArea: 'takedowns',
      wrestlingFamiliarity: 'comfortable'
    }
  },
  {
    label: 'Beginner-safe path',
    category: 'Beginner paths',
    focusName: 'Closed Guard',
    description: 'Keep the tree closer to beginner-friendly guard, posture, and control ideas.',
    filters: {
      experience: 'Beginner',
      riskTolerance: 'low',
      legLockFamiliarity: 'avoid'
    }
  },
  {
    label: 'I can’t keep mount',
    category: 'Passing and top control',
    focusName: 'Mount',
    description: 'Work on control, weight distribution, and reactions that help mount stay stable.',
    filters: {
      preferredStyle: 'pressure',
      topBottom: 'top',
      riskTolerance: 'low'
    }
  },
  {
    label: 'Opponent turtles a lot',
    category: 'Back takes and control',
    focusName: 'Turtle',
    description: 'Look for back exposure, front-headlock options, and ride-style follow-ups.',
    filters: {
      preferredStyle: 'backTakes',
      topBottom: 'top',
      weakArea: 'backTakes',
      partnerStyle: 'scrambles'
    }
  },
  {
    label: 'I play half guard',
    category: 'Guard and sweeps',
    focusName: 'Half Guard',
    description: 'Find underhook, dogfight, sweep, and recovery paths from half guard.',
    filters: {
      preferredStyle: 'guard',
      topBottom: 'bottom',
      weakArea: 'sweeps'
    }
  },
  {
    label: 'Improve guard retention',
    category: 'Escapes and defense',
    focusName: 'Open Guard',
    description: 'Bias toward frames, pummeling, recovery, and defensive guard rebuilding.',
    filters: {
      preferredStyle: 'defense',
      topBottom: 'bottom',
      weakArea: 'guardRetention',
      partnerStrength: 'passing'
    }
  },
  {
    label: 'I need more sweep options',
    category: 'Guard and sweeps',
    focusName: 'Butterfly Guard',
    description: 'Start with a common guard hub, then choose the guard you play to narrow the route.',
    filters: {
      preferredStyle: 'guard',
      topBottom: 'bottom',
      weakArea: 'sweeps'
    },
    followUps: [
      { label: 'Closed guard', focusName: 'Closed Guard' },
      { label: 'Half guard', focusName: 'Half Guard' },
      { label: 'Butterfly guard', focusName: 'Butterfly Guard' },
      { label: 'Open guard', focusName: 'Open Guard' },
      { label: 'Spider guard', focusName: 'Spider Guard' },
      { label: 'X-guard', focusName: 'X-Guard' }
    ]
  },
  {
    label: 'I can’t hold side control',
    category: 'Passing and top control',
    focusName: 'Side Control',
    description: 'Find control ideas, transitions, and pressure reactions before the opponent reguards.',
    filters: {
      preferredStyle: 'pressure',
      topBottom: 'top',
      riskTolerance: 'low'
    }
  },
  {
    label: 'Build submission chains',
    category: 'Submissions',
    focusName: 'Triangle Choke',
    description: 'Start from a major submission family and surface related attacks, reactions, and follow-ups.',
    filters: {
      preferredStyle: 'submissions',
      weakArea: 'submissions',
      riskTolerance: 'medium'
    }
  },
  {
    label: 'Win scramble exchanges',
    category: 'Standing and takedowns',
    focusName: 'Dogfight',
    description: 'Use a transitional hub for wrestle-ups, reversals, back exposure, and top control.',
    filters: {
      preferredStyle: 'scrambles',
      wrestlingFamiliarity: 'comfortable',
      partnerPace: 'aggressive'
    }
  },
  {
    label: 'Gi guard development',
    category: 'Guard and sweeps',
    focusName: 'Spider Guard',
    description: 'Bias toward gi-specific guard, sleeve control, and off-balancing connections.',
    filters: {
      ruleSet: 'gi',
      preferredStyle: 'guard',
      topBottom: 'bottom'
    }
  },
  {
    label: 'Learn X-guard routes',
    category: 'Guard and sweeps',
    focusName: 'X-Guard',
    description: 'Explore technical stand-up, sweep, leg exposure, and transition-heavy lower-body routes.',
    filters: {
      preferredStyle: 'guard',
      topBottom: 'bottom',
      weakArea: 'sweeps',
      riskTolerance: 'medium'
    }
  },
  {
    label: 'I keep getting my guard passed',
    category: 'Escapes and defense',
    focusName: 'Open Guard',
    description: 'Work backward through frames, guard recovery, pummeling, and anti-pressure responses.',
    filters: {
      preferredStyle: 'defense',
      topBottom: 'bottom',
      weakArea: 'guardRetention',
      partnerStrength: 'passing'
    },
    followUps: [
      { label: 'Open guard', focusName: 'Open Guard' },
      { label: 'Half guard', focusName: 'Half Guard' },
      { label: 'Knee shield', focusName: 'Knee Shield Half Guard' },
      { label: 'Butterfly guard', focusName: 'Butterfly Guard' },
      { label: 'Spider guard', focusName: 'Spider Guard' }
    ]
  },
  {
    label: 'I get stuck in closed guard',
    category: 'Passing and top control',
    focusName: 'Closed Guard',
    description: 'Bias toward posture, opening the guard, and passing without giving up easy attacks.',
    filters: {
      preferredStyle: 'pressure',
      topBottom: 'top',
      weakArea: 'guardPassing',
      riskTolerance: 'low'
    }
  },
  {
    label: 'I can’t finish from the back',
    category: 'Back takes and control',
    focusName: 'Back Control',
    description: 'Look for control upgrades, hand-fighting wins, choke options, and mount transitions.',
    filters: {
      preferredStyle: 'submissions',
      topBottom: 'top',
      weakArea: 'submissions',
      riskTolerance: 'medium'
    }
  },
  {
    label: 'I keep getting submitted',
    category: 'Escapes and defense',
    focusName: 'Closed Guard',
    description: 'Prioritize safer posture, hand fighting, submission defense, and escape reactions.',
    filters: {
      preferredStyle: 'defense',
      topBottom: 'bottom',
      weakArea: 'escapes',
      riskTolerance: 'low',
      partnerStyle: 'submissions'
    },
    followUps: [
      { label: 'Closed guard', focusName: 'Closed Guard' },
      { label: 'Side control', focusName: 'Side Control' },
      { label: 'Mount', focusName: 'Mount' },
      { label: 'Back control', focusName: 'Back Control' },
      { label: 'Leg locks', focusName: 'Ashi Garami' }
    ]
  },
  {
    label: 'I want better takedown entries',
    category: 'Standing and takedowns',
    focusName: 'Front Headlock',
    description: 'Choose a standing lane and explore snap-downs, body locks, singles, doubles, and go-behinds.',
    filters: {
      preferredStyle: 'wrestling',
      topBottom: 'standing',
      weakArea: 'takedowns',
      wrestlingFamiliarity: 'comfortable'
    },
    followUps: [
      { label: 'Front headlock', focusName: 'Front Headlock' },
      { label: 'Body lock', focusName: 'Body Lock Standing' },
      { label: 'Single leg', focusName: 'Single Leg Position' },
      { label: 'Double leg', focusName: 'Double Leg Position' }
    ]
  },
  {
    label: 'I need safer submissions',
    category: 'Submissions',
    focusName: 'Kimura',
    description: 'Favor attacks that connect to control, follow-ups, and position instead of one-shot gambles.',
    filters: {
      preferredStyle: 'submissions',
      riskTolerance: 'low',
      experience: 'Intermediate'
    }
  }
];

const coachingScenarioCategories = [
  'Passing and top control',
  'Escapes and defense',
  'Guard and sweeps',
  'Back takes and control',
  'Submissions',
  'Standing and takedowns',
  'Leg locks',
  'Beginner paths'
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

const getEntryProfileText = (entry) => normalizeValue([
  entry?.name,
  entry?.category,
  entry?.subcategory,
  entry?.description,
  ...(entry?.tags || [])
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
  legLocks: ['leg lock', 'heel hook', 'ashi', 'saddle', '50 50', 'kneebar', 'toe hold', 'aoki', 'estima', 'inside sankaku', 'backside 50 50', 'abe lock', 'lachy lock', 'mikey lock', 'junny lock'],
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

const fitProfiles = [
  {
    key: 'flexible',
    label: 'Flexibility helps',
    terms: [
      'rubber guard',
      'mission control',
      'new york',
      'chill dog',
      'meat hook',
      'crackhead control',
      'gogoplata',
      'omoplata',
      'monoplata',
      'tarikoplata',
      'high guard',
      'clamp guard',
      'williams guard',
      'inversion',
      'inversion position',
      'invert',
      'invert to reguard',
      'shoulder invert recovery',
      'berimbolo',
      'baby bolo',
      'kiss of the dragon',
      'matrix',
      'k guard',
      'k guard entry',
      'octopus guard',
      'reverse de la riva spin',
      'spin under'
    ],
    applies: (entry) => ![
      'Guillotine Position',
      'Armbar Position',
      'Spiderweb Position',
      'Triangle Position'
    ].includes(entry?.name),
    matches: ({ filters }) => filters.flexibility === 'high' || filters.bodyType === 'longer',
    caution: ({ filters }) => filters.flexibility === 'low'
  },
  {
    key: 'hipMobility',
    label: 'Hip mobility helps',
    terms: [
      'granby',
      'hip heist',
      'shrimp',
      'reverse shrimp',
      'leg pummel',
      'pummel',
      'guard retention',
      'retention',
      'reguard',
      're guard',
      'shoulder walk',
      'running man',
      'technical stand up',
      'seated guard recovery',
      'supine square up'
    ],
    applies: (entry) => !['Grip Fighting'].includes(entry?.category),
    matches: ({ filters }) => filters.flexibility === 'medium' || filters.flexibility === 'high' || filters.preferredStyle === 'scrambles',
    caution: ({ filters }) => filters.flexibility === 'low' && filters.preferredStyle !== 'pressure'
  },
  {
    key: 'longLimbs',
    label: 'Long limbs help',
    terms: ['triangle', 'd arce', 'darce', 'anaconda', 'arm triangle', 'body triangle', 'spider guard', 'lasso', 'collar sleeve', 'high guard', 'closed guard armbar', 'teepee choke'],
    applies: () => true,
    matches: ({ filters }) => filters.bodyType === 'longer',
    caution: () => false
  },
  {
    key: 'pressure',
    label: 'Pressure-friendly',
    terms: ['pressure', 'smash', 'body lock', 'crossface', 'underhook', 'mount', 'side control', 'half guard top', 'headquarters'],
    applies: (entry) => {
      if ([
        'Escapes',
        'Guard Retention',
        'Submission Defense',
        'Sweeps',
        'Turtle and Scrambles',
        'Submissions',
        'Leg Locks',
        'Self-Defense Basics',
        'Drills',
        'Positional Sparring'
      ].includes(entry?.category)) {
        return false;
      }

      const name = normalizeValue(entry?.name);
      return ![
        'bottom ',
        'supine guard',
        'running man',
        'lasso guard',
        'z guard',
        'knee shield half guard'
      ].some((term) => name.includes(term));
    },
    matches: ({ filters }) => filters.preferredStyle === 'pressure' || filters.bodyType === 'larger' || filters.bodyType === 'compact',
    caution: () => false
  },
  {
    key: 'scramble',
    label: 'Scramble-heavy',
    terms: ['scramble', 'dogfight', 'wrestle up', 'granby', 'sit out', 'turtle', 'front headlock', 'crab ride'],
    applies: () => true,
    matches: ({ filters }) => filters.preferredStyle === 'scrambles' || filters.wrestlingFamiliarity === 'comfortable',
    caution: ({ filters }) => filters.riskTolerance === 'low'
  },
  {
    key: 'legLock',
    label: 'Leg-lock familiarity helps',
    terms: ['leg lock', 'heel hook', 'ashi garami', 'outside ashi', 'cross ashi', 'reverse ashi', 'saddle', '50 50', 'kneebar', 'toe hold', 'aoki', 'estima', 'inside sankaku', 'backside 50 50', 'abe lock', 'lachy lock', 'mikey lock', 'junny lock'],
    applies: (entry) => !['Takedowns'].includes(entry?.category),
    matches: ({ filters }) => filters.legLockFamiliarity === 'learning' || filters.legLockFamiliarity === 'comfortable',
    caution: ({ filters }) => filters.legLockFamiliarity === 'avoid'
  }
];

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

const filterFieldLabels = {
  experience: 'Experience',
  ruleSet: 'Ruleset',
  preferredStyle: 'Style',
  topBottom: 'Top / bottom',
  bodyType: 'Body type',
  flexibility: 'Flexibility',
  wrestlingFamiliarity: 'Wrestling',
  legLockFamiliarity: 'Leg locks',
  riskTolerance: 'Risk',
  weakArea: 'Weak area',
  partnerRelativeSize: 'Partner size',
  partnerStyle: 'Partner style',
  partnerExperience: 'Partner experience',
  partnerPace: 'Partner pace',
  partnerStrength: 'Partner strength'
};

const filterValueLabels = {
  experience: {
    Beginner: 'Beginner',
    Intermediate: 'Intermediate',
    Advanced: 'Advanced'
  },
  ruleSet: {
    gi: 'Gi',
    nogi: 'No-gi'
  },
  preferredStyle: {
    pressure: 'Pressure / control',
    guard: 'Guard player',
    wrestling: 'Wrestling / front headlock',
    legLocks: 'Leg locks',
    backTakes: 'Back takes',
    submissions: 'Submission hunting',
    scrambles: 'Scrambly / mobile',
    defense: 'Defensive / escape work'
  },
  topBottom: {
    top: 'Top',
    bottom: 'Bottom',
    standing: 'Standing'
  },
  bodyType: {
    smaller: 'Smaller / faster',
    larger: 'Larger / pressure',
    longer: 'Longer limbs',
    compact: 'Compact / stocky'
  },
  flexibility: {
    low: 'Low flexibility',
    medium: 'Medium flexibility',
    high: 'High flexibility'
  },
  wrestlingFamiliarity: {
    new: 'New to wrestling',
    comfortable: 'Comfortable wrestling'
  },
  legLockFamiliarity: {
    avoid: 'Avoid for now',
    learning: 'Learning',
    comfortable: 'Comfortable'
  },
  riskTolerance: {
    low: 'Low risk',
    medium: 'Medium risk',
    high: 'High risk'
  },
  weakArea: {
    guardPassing: 'Guard passing',
    guardRetention: 'Guard retention',
    escapes: 'Escapes',
    submissions: 'Submissions',
    takedowns: 'Takedowns',
    legLocks: 'Leg locks',
    backTakes: 'Back takes',
    sweeps: 'Sweeps',
    frontHeadlock: 'Front headlock'
  },
  partnerRelativeSize: {
    bigger: 'Bigger partner',
    smaller: 'Smaller partner',
    similar: 'Similar size partner'
  },
  partnerStyle: {
    pressure: 'Pressure passer',
    guard: 'Guard player',
    wrestling: 'Wrestler',
    legLocks: 'Leg locker',
    submissions: 'Submission hunter',
    scrambles: 'Scrambler'
  },
  partnerExperience: {
    Beginner: 'Beginner partner',
    Intermediate: 'Intermediate partner',
    Advanced: 'Advanced partner'
  },
  partnerPace: {
    calm: 'Calm pace',
    moderate: 'Moderate pace',
    aggressive: 'Aggressive pace'
  },
  partnerStrength: {
    passing: 'Passing strength',
    guard: 'Guard strength',
    wrestling: 'Wrestling strength',
    legLocks: 'Leg-lock strength',
    backControl: 'Back-control strength',
    submissions: 'Submission strength'
  }
};

const buildFilterSummary = (filters, keys) => (
  keys
    .filter((key) => Boolean(filters[key]))
    .map((key) => ({
      key,
      label: filterFieldLabels[key],
      value: filterValueLabels[key]?.[filters[key]] || filters[key]
    }))
);

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

const getFitProfileMatches = (entry, filters) => {
  const entryText = getEntryProfileText(entry);

  return fitProfiles
    .filter((profile) => (
      profile.applies(entry)
      && profile.terms.some((term) => entryText.includes(normalizeValue(term)))
    ))
    .map((profile) => ({
      key: profile.key,
      label: profile.label,
      isMatch: profile.matches({ filters }),
      isCaution: profile.caution({ filters })
    }));
};

const getOptionReasons = ({ entry, groupKey, filters }) => {
  const reasons = [];
  const styleHints = getSelectedStyleHints(filters);
  const fitMatches = getFitProfileMatches(entry || {}, filters);

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

  const matchingFit = fitMatches.find((fit) => fit.isMatch);
  const cautionFit = fitMatches.find((fit) => fit.isCaution);

  if (matchingFit) {
    reasons.push(matchingFit.label);
  } else if (cautionFit) {
    reasons.push(`May require: ${cautionFit.label.toLowerCase()}`);
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

  getFitProfileMatches(entry, filters).forEach((fit) => {
    if (fit.isMatch) score += 2;
    if (fit.isCaution) score -= 3;
  });

  return score;
};

const findEntryByName = (entryMap, name) => entryMap.get(normalizeValue(name)) || null;

const getFilteredBranches = ({ focusEntry, entryMap, filters }) => {
  const weakAreaStyles = filterConfig.weakArea[filters.weakArea] || [];
  const shouldShrink = Boolean(filters.weakArea);

  return relationshipGroups.map((group) => {
    const values = uniqueValues(focusEntry[group.key] || []);
    const rankedOptions = values
      .map((name) => {
        const entry = findEntryByName(entryMap, name);
        return {
          name,
          entry,
          score: scoreOption({ entry: entry || { name }, groupKey: group.key, filters }),
          reasons: getOptionReasons({ entry: entry || { name }, groupKey: group.key, filters }),
          fitProfiles: getFitProfileMatches(entry || { name }, filters)
        };
      })
      .filter((option) => normalizeValue(option.name) !== normalizeValue(focusEntry.name))
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

    const filteredOptions = rankedOptions
      .filter((option) => (
        !shouldShrink
        || !option.entry
        || optionMatchesStyles(option.entry, weakAreaStyles)
        || option.score >= 6
      ))
      .slice(0, shouldShrink ? 6 : 10);

    const options = filteredOptions.length
      ? filteredOptions
      : rankedOptions.slice(0, shouldShrink ? 4 : 10).map((option) => ({
          ...option,
          reasons: ['Connected from current focus', 'Showing fallback path']
        }));

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
  const [scenarioFeedback, setScenarioFeedback] = useState('');
  const [pendingScenarioScroll, setPendingScenarioScroll] = useState(false);
  const filtersSectionRef = useRef(null);

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

  const groupedCoachingScenarios = useMemo(() => (
    coachingScenarioCategories
      .map((category) => ({
        category,
        scenarios: coachingScenarios.filter((scenario) => scenario.category === category)
      }))
      .filter((group) => group.scenarios.length > 0)
  ), []);

  const visibleBranchCount = branchGroups.reduce((count, group) => count + group.options.length, 0);
  const activeFilterSummary = useMemo(
    () => buildFilterSummary(filters, [
      'experience',
      'ruleSet',
      'preferredStyle',
      'topBottom',
      'bodyType',
      'flexibility',
      'wrestlingFamiliarity',
      'legLockFamiliarity',
      'riskTolerance',
      'weakArea'
    ]),
    [filters]
  );
  const activePartnerSummary = useMemo(
    () => buildFilterSummary(filters, [
      'partnerRelativeSize',
      'partnerStyle',
      'partnerExperience',
      'partnerPace',
      'partnerStrength'
    ]),
    [filters]
  );
  const focusDecisionTreeModel = focusEntry.decisionTreeModel || null;
  const focusReactionGroups = useMemo(() => {
    if (!focusDecisionTreeModel?.commonReactions?.length) return [];

    return focusDecisionTreeModel.commonReactions
      .map((reaction) => ({
        ...reaction,
        options: (reaction.branches || [])
          .map((name) => findEntryByName(entryMap, name))
          .filter(Boolean)
      }))
      .filter((reaction) => reaction.options.length > 0);
  }, [entryMap, focusDecisionTreeModel]);

  const topRecommendations = useMemo(() => {
    const seen = new Set();

    return branchGroups
      .flatMap((group) => (
        group.options.map((option) => ({
          ...option,
          sourceLabel: group.label,
          sourceKey: group.key
        }))
      ))
      .filter((option) => option.entry)
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .filter((option) => {
        const key = option.entry.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 6);
  }, [branchGroups]);

  useEffect(() => {
    if (!scenarioFeedback) return undefined;

    const timeoutId = window.setTimeout(() => {
      setScenarioFeedback('');
    }, 2800);

    return () => window.clearTimeout(timeoutId);
  }, [scenarioFeedback]);

  useEffect(() => {
    if (!pendingScenarioScroll) return;

    const timeoutId = window.setTimeout(() => {
      filtersSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      setPendingScenarioScroll(false);
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [pendingScenarioScroll, focusEntry.id, topRecommendations.length, visibleBranchCount]);

  const applyCoachingScenario = (scenario) => {
    const scenarioFocus = entries.find((entry) => normalizeValue(entry.name) === normalizeValue(scenario.focusName));
    const focusWasUpdated = scenarioFocus && scenarioFocus.id !== focusEntry.id;

    if (focusWasUpdated) {
      setHistory((current) => [focusEntry, ...current].slice(0, 8));
      setFocusId(scenarioFocus.id);
    }

    setFilters({
      ...defaultFilters,
      ...scenario.filters
    });
    setSearch('');
    setShowFilters(true);
    setShowPartnerContext(Boolean(scenario.filters.partnerStyle));
    setScenarioFeedback(
      focusWasUpdated
        ? `Applied "${scenario.label}". Focus moved to ${scenarioFocus.name}, matching filters were turned on, and the page jumped to Simple filters below.`
        : `Applied "${scenario.label}". Matching filters were turned on and the page jumped to Simple filters below.`
    );
    setPendingScenarioScroll(true);
  };

  const applyScenarioFollowUp = (event, scenario, followUp) => {
    event.stopPropagation();
    applyCoachingScenario({
      ...scenario,
      focusName: followUp.focusName,
      label: `${scenario.label}: ${followUp.label}`
    });
  };

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

        {focusDecisionTreeModel ? (
          <section className="page-section decision-tree-logic-panel">
            <div className="decision-tree-section-heading">
              <div>
                <h3>How this position usually works</h3>
                <p className="meta-text">
                  This layer tracks the common mechanics, goals, and realistic reactions from {focusEntry.name}.
                </p>
              </div>
            </div>

            <div className="decision-tree-logic-grid">
              <article className="decision-tree-logic-card">
                <h4>Common mechanics</h4>
                <ul className="decision-tree-logic-list">
                  {focusDecisionTreeModel.mechanics?.map((item) => (
                    <li key={`mechanic-${item}`}>{item}</li>
                  ))}
                </ul>
              </article>

              <article className="decision-tree-logic-card">
                <h4>Common goals</h4>
                <ul className="decision-tree-logic-list">
                  {focusDecisionTreeModel.commonGoals?.map((item) => (
                    <li key={`goal-${item}`}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </section>
        ) : null}

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

        <section className="page-section">
          <div className="decision-tree-section-heading">
            <div>
              <h3>Start with a coaching problem</h3>
              <p className="meta-text">
                Pick a real-life situation and the tree will choose a useful starting point plus matching filters.
              </p>
            </div>
          </div>

          {scenarioFeedback ? (
            <div className="decision-tree-scenario-feedback" role="status" aria-live="polite">
              {scenarioFeedback}
            </div>
          ) : null}

          <div className="decision-tree-scenario-groups">
            {groupedCoachingScenarios.map((group) => (
              <div className="decision-tree-scenario-group" key={group.category}>
                <h4>{group.category}</h4>
                <div className="decision-tree-scenario-grid">
                  {group.scenarios.map((scenario) => (
                    <button
                      key={scenario.label}
                      type="button"
                      className="decision-tree-scenario-card"
                      onClick={() => applyCoachingScenario(scenario)}
                    >
                      <strong>{scenario.label}</strong>
                      <span>{scenario.description}</span>
                      {scenario.followUps?.length ? (
                        <span className="decision-tree-follow-up-row" aria-label="Choose a guard">
                          {scenario.followUps.map((followUp) => (
                            <span
                              key={followUp.focusName}
                              className="decision-tree-follow-up-chip"
                              role="button"
                              tabIndex={0}
                              onClick={(event) => applyScenarioFollowUp(event, scenario, followUp)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  applyScenarioFollowUp(event, scenario, followUp);
                                }
                              }}
                            >
                              {followUp.label}
                            </span>
                          ))}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={`page-section compact-form-shell decision-tree-collapsible-shell${showFilters ? ' is-open' : ''}`} ref={filtersSectionRef}>
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

          {!showFilters ? (
            <div className="decision-tree-collapsible-summary">
              <p className="meta-text">
                Keep this closed unless you want to narrow the tree further.
              </p>
              {activeFilterSummary.length > 0 ? (
                <div className="decision-tree-summary-chip-row">
                  {activeFilterSummary.map((item) => (
                    <span className="curriculum-index-tag" key={`summary-${item.key}`}>
                      {item.label}: {item.value}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="decision-tree-summary-empty">No extra filters applied yet.</span>
              )}
            </div>
          ) : null}

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

        <section className={`page-section compact-form-shell decision-tree-collapsible-shell${showPartnerContext ? ' is-open' : ''}`}>
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

          {!showPartnerContext ? (
            <div className="decision-tree-collapsible-summary">
              <p className="meta-text">
                Leave this tucked away unless you want the tree to account for a specific training partner or matchup.
              </p>
              {activePartnerSummary.length > 0 ? (
                <div className="decision-tree-summary-chip-row">
                  {activePartnerSummary.map((item) => (
                    <span className="curriculum-index-tag" key={`partner-summary-${item.key}`}>
                      {item.label}: {item.value}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="decision-tree-summary-empty">No partner context applied.</span>
              )}
            </div>
          ) : null}

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

        <section className={`page-section decision-tree-simulation-panel decision-tree-collapsible-shell${showSimulation ? ' is-open' : ''}`}>
          <div>
            <h3>Advanced simulation</h3>
            <p className="meta-text">
              Explosiveness, grip strength, scramble level, cardio, and mobility are intentionally reserved for simulation mode later.
            </p>
          </div>
          <button className="secondary-button" type="button" onClick={() => setShowSimulation((value) => !value)}>
            {showSimulation ? 'Hide simulation traits' : 'Show simulation traits'}
          </button>
          {!showSimulation ? (
            <div className="decision-tree-collapsible-summary">
              <p className="meta-text">
                Leave this closed unless you want future simulation-style traits to shape the recommendations more deeply.
              </p>
              <span className="decision-tree-summary-empty">No simulation traits in play.</span>
            </div>
          ) : null}
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

        <section className="page-section decision-tree-branch-spotlight">
          <div className="decision-tree-section-heading">
            <div>
              <span className="decision-tree-next-step">Next step</span>
              <h3>Tree branches</h3>
              <p className="meta-text">
                Showing {visibleBranchCount} filtered options from the universal graph.
              </p>
              <p className="decision-tree-branch-callout">
                Most users will work here first after choosing a coaching problem, then fine-tune with filters only if they need to narrow the path further.
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

          {focusReactionGroups.length > 0 ? (
            <div className="decision-tree-reaction-panel">
              <div className="decision-tree-section-heading">
                <div>
                  <h4>Common reactions from here</h4>
                  <p className="meta-text">
                    These branches come from the usual reactions to {focusEntry.name}, not just the first direct links.
                  </p>
                </div>
              </div>

              <div className="decision-tree-reaction-grid">
                {focusReactionGroups.map((reaction) => (
                  <article className="decision-tree-reaction-card" key={reaction.reaction}>
                    <strong>{reaction.reaction}</strong>
                    <p className="meta-text">{reaction.cue}</p>
                    <div className="decision-tree-reaction-actions">
                      {reaction.options.map((option) => (
                        <button
                          key={`${reaction.reaction}-${option.id}`}
                          type="button"
                          className="secondary-button"
                          onClick={() => selectFocusEntry(option)}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {topRecommendations.length > 0 ? (
            <div className="decision-tree-top-recommendations">
              <div className="decision-tree-section-heading">
                <div>
                  <h4>Best next moves</h4>
                  <p className="meta-text">
                    These are the strongest next branches from the current focus and filters.
                  </p>
                </div>
              </div>

              <div className="decision-tree-top-grid">
                {topRecommendations.map((option) => (
                  <article className="decision-tree-top-card" key={`top-${option.entry.id}`}>
                    <div className="decision-tree-top-card-header">
                      <div>
                        <strong>{option.name}</strong>
                        <span>{option.sourceLabel}</span>
                      </div>
                      <span className="curriculum-index-tag">
                        {option.entry.category}
                      </span>
                    </div>

                    <p className="meta-text">
                      {option.reasons.join(' | ')}
                    </p>

                    {option.fitProfiles.length > 0 ? (
                      <div className="decision-tree-fit-row">
                        {option.fitProfiles.map((profile) => (
                          <span
                            key={`top-${option.entry.id}-${profile.key}`}
                            className={`decision-tree-fit-chip${profile.isCaution ? ' is-caution' : ''}${profile.isMatch ? ' is-match' : ''}`}
                          >
                            {profile.label}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="inline-actions decision-tree-top-actions">
                      <button type="button" className="secondary-button" onClick={() => selectFocusEntry(option.entry)}>
                        Open in tree
                      </button>
                      <Link className="secondary-button" to={`/index?search=${encodeURIComponent(option.entry.name)}`}>
                        View in Index
                      </Link>
                      <Link className="secondary-button" to={`/library?search=${encodeURIComponent(option.entry.name)}`}>
                        Library
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          <div className="decision-tree-branch-grid">
            {branchGroups.map((group) => (
              <div className="decision-tree-branch-group" key={group.key}>
                <div className="decision-tree-branch-heading">
                  <h4>{group.label}</h4>
                  <span className="meta-text">{group.options.length} shown</span>
                </div>
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
                          {option.fitProfiles.length > 0 ? (
                            <span className="decision-tree-fit-row">
                              {option.fitProfiles.map((profile) => (
                                <span
                                  key={profile.key}
                                  className={`decision-tree-fit-chip${profile.isCaution ? ' is-caution' : ''}${profile.isMatch ? ' is-match' : ''}`}
                                >
                                  {profile.label}
                                </span>
                              ))}
                            </span>
                          ) : null}
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
