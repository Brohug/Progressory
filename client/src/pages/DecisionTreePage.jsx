import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import curriculumIndexSeed from '../data/curriculumIndexSeed';
import { useAuth } from '../hooks/useAuth';

const relationshipGroups = [
  { key: 'entriesIntoPosition', label: 'Entries' },
  { key: 'commonAttacks', label: 'Common attacks' },
  { key: 'commonTransitions', label: 'Common transitions' },
  { key: 'commonFollowUps', label: 'Common follow-ups' },
  { key: 'commonDefenses', label: 'Common defensive reactions' },
  { key: 'relatedPositions', label: 'Related positions' }
];

const defaultFocusId = '';
const COLLAPSED_GUIDED_OPTION_LIMIT = 3;
const COLLAPSED_SCENARIO_PREVIEW_LIMIT = 3;
const excludedDecisionTreeSearchCategories = new Set([
  'Constraint-Led Games',
  'Drills',
  'Positional Sparring'
]);

const inferTopicTypeFromEntry = (entry) => {
  const category = String(entry?.category || '').toLowerCase();

  if (category.includes('position') || category.includes('guard')) return 'position';
  if (category.includes('submission') || category.includes('leg lock')) return 'submission';
  if (category.includes('escape') || category.includes('defense') || category.includes('retention')) return 'escape';
  if (category.includes('takedown')) return 'takedown';
  if (category.includes('concept') || category.includes('fundamental') || category.includes('strategy')) return 'concept';

  return 'technique';
};

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
    },
    guidedPrompts: [
      {
        question: 'Where are you struggling to pass?',
        expandableLabel: 'Need more options?',
        options: [
          { label: 'Closed guard', description: 'Posture breaking and angle control usually matter first.', focusName: 'Closed Guard' },
          { label: 'Half guard', description: 'Underhooks, flattening, and knee-line control usually decide the pass.', focusName: 'Half Guard' },
          { label: 'Knee shield', description: 'You usually need angle changes and cleaner knee-line clearing here.', focusName: 'Knee Shield Half Guard' },
          { label: 'Butterfly guard', description: 'Inside hooks and elevation timing are often the main issue.', focusName: 'Butterfly Guard' },
          { label: 'Open guard', description: 'Distance, feet, and fast redirection usually matter most.', focusName: 'Open Guard' },
          { label: 'De La Riva', description: 'Hook control and leg-pin passing usually become more important.', focusName: 'De La Riva' },
          { label: 'Reverse De La Riva', description: 'Spin-under threats and backside exposure usually change the passing lane.', focusName: 'Reverse De La Riva', isExtended: true },
          { label: 'Spider / lasso', description: 'Grip breaking and posture management usually matter more here.', focusName: 'Spider Guard', isExtended: true },
          { label: 'Single-Leg X / leg entanglements', description: 'Base, balance, and leg-line awareness usually decide the pass.', focusName: 'Single-Leg X', isExtended: true },
          { label: 'X-Guard', description: 'Base management and stepping angles usually matter most.', focusName: 'X-Guard', isExtended: true },
          { label: 'Half Butterfly', description: 'Balance, pressure shifts, and hook-clearing usually shape the pass here.', focusName: 'Butterfly Half', isExtended: true },
          { label: 'Reverse X / Reverse Ashi', description: 'Leg-line awareness and angle changes usually matter more here.', focusName: 'Ashi Garami', isExtended: true },
          { label: 'Waiter guard', description: 'Underneath balance and leg visibility usually decide the passing lane.', focusName: 'Waiter Guard', isExtended: true },
          { label: 'Deep half guard', description: 'Hip weight, head position, and base direction usually matter most.', focusName: 'Deep Half Guard', isExtended: true },
          { label: 'Seated guard', description: 'Distance, front-headlock threats, and wrestle-up entries usually shape the pass.', focusName: 'Seated Guard', isExtended: true },
          { label: 'Collar-sleeve', description: 'Grips, angle management, and posture discipline usually become the issue.', focusName: 'Collar-Sleeve Guard', isExtended: true },
          { label: 'Worm / lapel guard', description: 'Grip clearing and hip untangling usually matter more than speed alone.', focusName: 'Worm Guard', isExtended: true }
        ]
      },
      {
        question: 'What passing style fits you best right now?',
        expandableLabel: 'Need more passing styles?',
        options: [
          {
            label: 'Pressure passing',
            description: 'Best for compact or heavier players who like chest-to-chest control.',
            focusName: 'Pressure Passing',
            filters: { preferredStyle: 'pressure', bodyType: 'larger', riskTolerance: 'low' }
          },
          {
            label: 'Mobility passing',
            description: 'Best for faster players who like circling, redirecting, and staying light.',
            focusName: 'Standing Passing',
            filters: { preferredStyle: 'scrambles', bodyType: 'smaller', riskTolerance: 'medium' }
          },
          {
            label: 'Leg pin passing',
            description: 'Best for players who like stapling legs and winning angles before control.',
            focusName: 'Leg Weave / Leg Pin Passing',
            filters: { preferredStyle: 'pressure', riskTolerance: 'medium' }
          },
          {
            label: 'Under / stack passing',
            description: 'Best for players who like folding the hips and lifting the legs.',
            focusName: 'Stack / Under Passing',
            filters: { preferredStyle: 'pressure', bodyType: 'compact', riskTolerance: 'low' }
          },
          {
            label: 'Inside passing',
            description: 'Best for players who like knee-cut, split-squat, and inside-lane pressure.',
            focusName: 'Inside Passing',
            filters: { preferredStyle: 'pressure', topBottom: 'top', riskTolerance: 'medium' },
            isExtended: true
          },
          {
            label: 'Outside / direction-change passing',
            description: 'Best for players who like long-step, backstep, and angle-change routes.',
            focusName: 'Outside Passing',
            filters: { preferredStyle: 'scrambles', topBottom: 'top', riskTolerance: 'medium' },
            isExtended: true
          },
          {
            label: 'Floating / movement passing',
            description: 'Best for players who like staying light and converting failed pressure into motion.',
            focusName: 'Floating / Direction Change Passing',
            filters: { preferredStyle: 'scrambles', topBottom: 'top', riskTolerance: 'medium' },
            isExtended: true
          },
          {
            label: 'Half-guard passing chains',
            description: 'Best if the real issue is passing when the guard is already half-won but sticky.',
            focusName: 'Half Guard Passing',
            filters: { preferredStyle: 'pressure', topBottom: 'top', weakArea: 'guardPassing' },
            isExtended: true
          }
        ]
      }
    ]
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
    focusName: 'Leg Lock Defense',
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
      { label: 'Ashi control first', focusName: 'Ashi Garami' },
      { label: 'Single-Leg X connections', focusName: 'Single-Leg X' }
    ]
  },
  {
    label: 'I keep getting heel-hooked',
    category: 'Leg locks',
    focusName: 'Heel Hook Line Defense',
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
    focusName: 'Front Headlock Standing',
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
    label: "I can't keep mount",
    category: 'Passing and top control',
    focusName: 'Mount',
    description: 'Work on control, weight distribution, and reactions that help mount stay stable.',
    filters: {
      preferredStyle: 'pressure',
      topBottom: 'top',
      riskTolerance: 'low'
    },
    guidedPrompts: [
      {
        question: 'How are they usually escaping your mount?',
        expandableLabel: 'Need more mount-control fixes?',
        options: [
          {
            label: 'Big bridge and roll',
            description: 'Lower base and weight distribution usually need attention first.',
            focusName: 'Low Mount',
            filters: { preferredStyle: 'pressure', riskTolerance: 'low' }
          },
          {
            label: 'Elbow-knee recovery',
            description: 'Tighter upper-body trapping and higher control usually help more.',
            focusName: 'Gift Wrap',
            filters: { preferredStyle: 'pressure', riskTolerance: 'low' }
          },
          {
            label: 'They turn and expose the back',
            description: 'You likely need a cleaner route into technical mount and back control.',
            focusName: 'Technical Mount',
            filters: { preferredStyle: 'backTakes', topBottom: 'top', riskTolerance: 'medium' }
          },
          {
            label: 'I lose chest-to-chest pressure',
            description: 'You likely need a more stable upper-body trap before the attacks even start.',
            focusName: 'Gift Wrap',
            filters: { preferredStyle: 'pressure', topBottom: 'top', riskTolerance: 'low' },
            isExtended: true
          },
          {
            label: 'They recover half guard late',
            description: 'You likely need a cleaner follow-up when mount begins to slip downward.',
            focusName: 'Top Half Guard',
            filters: { preferredStyle: 'pressure', topBottom: 'top', riskTolerance: 'low' },
            isExtended: true
          },
          {
            label: 'I need better attack control from mount',
            description: 'You likely need the transition that lets offense and control support each other better.',
            focusName: 'Technical Mount',
            filters: { preferredStyle: 'submissions', topBottom: 'top', riskTolerance: 'medium' },
            isExtended: true
          }
        ]
      }
    ]
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
    focusName: 'Open Guard Recovery',
    description: 'Bias toward frames, pummeling, recovery, and defensive guard rebuilding before the pass settles.',
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
    label: "I can't hold side control",
    category: 'Passing and top control',
    focusName: 'Side Control',
    description: 'Find control ideas, transitions, and pressure reactions before the opponent reguards.',
    filters: {
      preferredStyle: 'pressure',
      topBottom: 'top',
      riskTolerance: 'low'
    },
    guidedPrompts: [
      {
        question: 'What part of side control are you losing most often?',
        expandableLabel: 'Need more side-control fixes?',
        options: [
          {
            label: 'They keep finding the underhook',
            description: 'Upper-body pinning and head control usually need to win earlier.',
            focusName: 'Crossface and Underhook Control',
            filters: { preferredStyle: 'pressure', riskTolerance: 'low' }
          },
          {
            label: 'They keep getting the knee back inside',
            description: 'You may need to understand the reguard earlier instead of assuming you already advanced to the next top position.',
            focusName: 'Open Guard Recovery',
            filters: { preferredStyle: 'pressure', riskTolerance: 'medium' }
          },
          {
            label: 'They turn away and start turtling',
            description: 'You likely need cleaner back-taking and ride-style follow-ups.',
            focusName: 'Side Control To Back',
            filters: { preferredStyle: 'backTakes', topBottom: 'top', riskTolerance: 'medium' }
          },
          {
            label: 'They frame and create too much space',
            description: 'You likely need to read the guard recovery first instead of assuming the next top pin is already there.',
            focusName: 'Open Guard Recovery',
            filters: { preferredStyle: 'pressure', topBottom: 'top', riskTolerance: 'medium' },
            isExtended: true
          },
          {
            label: 'I lose the chest angle entirely',
            description: 'You likely need a cleaner secondary control hub once the first pin starts failing.',
            focusName: 'North-South',
            filters: { preferredStyle: 'pressure', topBottom: 'top', riskTolerance: 'low' },
            isExtended: true
          },
          {
            label: 'I need better submission-linked control',
            description: 'You likely need a top-control branch that attacks without giving away the position.',
            focusName: 'Kimura',
            filters: { preferredStyle: 'submissions', topBottom: 'top', riskTolerance: 'medium' },
            isExtended: true
          }
        ]
      }
    ]
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
    focusName: 'Open Guard Recovery',
    description: 'Work backward through frames, guard recovery, pummeling, and anti-pressure responses before trying to restart offense.',
    filters: {
      preferredStyle: 'defense',
      topBottom: 'bottom',
      weakArea: 'guardRetention',
      partnerStrength: 'passing'
    },
    followUps: [
      { label: 'Open guard', focusName: 'Open Guard Recovery' },
      { label: 'Half guard', focusName: 'Half Guard Recovery' },
      { label: 'Knee shield', focusName: 'Frame Replacement' },
      { label: 'Butterfly guard', focusName: 'Butterfly Hook Recovery' },
      { label: 'Spider guard', focusName: 'Spider Guard Recovery' }
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
    label: "I can't finish from the back",
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
      { label: 'Closed guard', focusName: 'Posture' },
      { label: 'Side control', focusName: 'Bottom Side Control' },
      { label: 'Mount', focusName: 'Bottom Mount' },
      { label: 'Back control', focusName: 'Back Choke Defense' },
      { label: 'Leg locks', focusName: 'Leg Lock Defense' }
    ]
  },
  {
    label: 'I need better back escapes',
    category: 'Escapes and defense',
    focusName: 'Back Control',
    description: 'Sharpen hand fighting, hook removal, shoulder alignment, and the next recovery after escaping the back.',
    filters: {
      preferredStyle: 'defense',
      topBottom: 'bottom',
      weakArea: 'escapes',
      riskTolerance: 'low'
    }
  },
  {
    label: 'I need submission defense',
    category: 'Escapes and defense',
    focusName: 'Armbar Defense',
    description: 'Choose the submission giving you trouble and build the safer defensive path plus the next recovery after it works.',
    filters: {
      preferredStyle: 'defense',
      topBottom: 'bottom',
      weakArea: 'escapes',
      riskTolerance: 'low',
      partnerStyle: 'submissions'
    }
  },
  {
    label: 'I want better takedown entries',
    category: 'Standing and takedowns',
    focusName: 'Front Headlock Standing',
    description: 'Choose a standing lane and explore snap-downs, body locks, singles, doubles, and go-behinds.',
    filters: {
      preferredStyle: 'wrestling',
      topBottom: 'standing',
      weakArea: 'takedowns',
      wrestlingFamiliarity: 'comfortable'
    },
    followUps: [
      { label: 'Front headlock', focusName: 'Front Headlock Standing' },
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

const getSearchRelevanceScore = (entry, normalizedSearch) => {
  if (!normalizedSearch) {
    return 0;
  }

  const normalizedName = normalizeValue(entry.name);
  const normalizedCategory = normalizeValue(entry.category);
  const normalizedSubcategory = normalizeValue(entry.subcategory);
  const normalizedDescription = normalizeValue(entry.description);
  const normalizedTags = (entry.tags || []).map(normalizeValue);
  const normalizedRelatedPositions = (entry.relatedPositions || []).map(normalizeValue);
  const normalizedEntriesIntoPosition = (entry.entriesIntoPosition || []).map(normalizeValue);
  const normalizedCommonAttacks = (entry.commonAttacks || []).map(normalizeValue);
  const normalizedTransitions = (entry.commonTransitions || []).map(normalizeValue);
  const normalizedFollowUps = (entry.commonFollowUps || []).map(normalizeValue);
  const normalizedDefenses = (entry.commonDefenses || []).map(normalizeValue);

  if (normalizedName === normalizedSearch) return 100;
  if (normalizedName.startsWith(normalizedSearch)) return 90;
  if (normalizedName.includes(normalizedSearch)) return 80;
  if (normalizedCategory === normalizedSearch || normalizedSubcategory === normalizedSearch) return 70;
  if (normalizedTags.includes(normalizedSearch)) return 60;
  if (normalizedRelatedPositions.includes(normalizedSearch)) return 50;
  if (normalizedEntriesIntoPosition.includes(normalizedSearch)) return 47;
  if (normalizedCommonAttacks.includes(normalizedSearch)) return 45;
  if (normalizedTransitions.includes(normalizedSearch)) return 40;
  if (normalizedFollowUps.includes(normalizedSearch)) return 35;
  if (normalizedDefenses.includes(normalizedSearch)) return 30;
  if (normalizedDescription.includes(normalizedSearch)) return 20;

  return 10;
};

const getSearchIntentCategoryBonus = (entry, normalizedSearch) => {
  if (!normalizedSearch) {
    return 0;
  }

  const normalizedCategory = normalizeValue(entry.category);
  const normalizedSubcategory = normalizeValue(entry.subcategory);
  const isDefenseQuery = normalizedSearch.includes('defense') || normalizedSearch.includes('escape');
  const isSubmissionQuery = ['submission', 'choke', 'armbar', 'triangle', 'kimura', 'guillotine', 'americana', 'omoplata']
    .some((term) => normalizedSearch.includes(term));
  const isLegLockQuery = ['leg lock', 'heel hook', 'ankle lock', 'kneebar', 'toe hold', 'aoki']
    .some((term) => normalizedSearch.includes(term));
  const isGripQuery = ['grip', 'hand fight', 'tie']
    .some((term) => normalizedSearch.includes(term));
  const isBackTakeQuery = ['back take', 'take back', 'rear angle', 'back exposure']
    .some((term) => normalizedSearch.includes(term));
  const isSweepQuery = ['sweep', 'off balance', 'wrestle up']
    .some((term) => normalizedSearch.includes(term));
  const isMovementQuery = ['movement', 'granby', 'shrimp', 'hip escape', 'sit out', 'technical stand up', 'roll']
    .some((term) => normalizedSearch.includes(term));
  const isStrategyQuery = ['strategy', 'game plan', 'reaction', 'transition', 'decision', 'teaching pattern']
    .some((term) => normalizedSearch.includes(term));
  const isDrillQuery = ['drill', 'round', 'sparring', 'game', 'positional']
    .some((term) => normalizedSearch.includes(term));

  if (isDefenseQuery) {
    if (normalizedCategory === 'submission defense') return 45;
    if (normalizedCategory === 'escapes') return 30;
  }

  if (isLegLockQuery) {
    if (normalizedCategory === 'leg locks') return 45;
    if (normalizedCategory === 'submissions') return 30;
  }

  if (isSubmissionQuery && !isDefenseQuery) {
    if (normalizedCategory === 'submissions') return 45;
    if (normalizedCategory === 'leg locks') return 35;
    if (normalizedCategory === 'submission defense') return 15;
  }

  if (isGripQuery) {
    if (normalizedCategory === 'grip fighting' || normalizedSubcategory === 'grip fighting') return 40;
    if (normalizedCategory === 'positions') return 20;
  }

  if (isBackTakeQuery) {
    if (normalizedCategory === 'back takes') return 40;
    if (normalizedCategory === 'sweeps') return 20;
  }

  if (isSweepQuery) {
    if (normalizedCategory === 'sweeps') return 40;
    if (normalizedCategory === 'back takes') return 20;
  }

  if (isMovementQuery && !isDefenseQuery) {
    if (normalizedCategory === 'movements') return 40;
    if (normalizedCategory === 'escapes') return 15;
  }

  if (isStrategyQuery) {
    if (normalizedCategory === 'strategy and game planning') return 35;
    if (normalizedCategory === 'concepts') return 25;
  }

  if (isDrillQuery) {
    if (normalizedCategory === 'positional sparring') return 35;
    if (normalizedCategory === 'constraint led games') return 30;
    if (normalizedCategory === 'drills') return 25;
    if (normalizedCategory === 'grip fighting') return 10;
  }

  return 0;
};

const getDefaultCategoryPriority = (entry) => {
  const normalizedCategory = normalizeValue(entry.category);

  const priorityMap = {
    'submission defense': 110,
    escapes: 100,
    'leg locks': 95,
    submissions: 90,
    'back takes': 80,
    sweeps: 75,
    'grip fighting': 70,
    positions: 65,
    movements: 60,
    'strategy and game planning': 55,
    concepts: 50,
    'positional sparring': 45,
    'constraint led games': 40,
    drills: 35
  };

  return priorityMap[normalizedCategory] || 0;
};

const duplicateNameCategoryPreference = {
  'aoki lock': ['Leg Locks', 'Submissions'],
  'arm drag to back': ['Back Takes', 'Sweeps'],
  'armbar stacking defense': ['Submission Defense', 'Escapes'],
  'attack transitions': ['Strategy and Game Planning', 'Concepts'],
  'banana split': ['Leg Locks', 'Submissions'],
  'calf slicer': ['Leg Locks', 'Submissions'],
  'collar tie': ['Grip Fighting', 'Positions'],
  'electric chair': ['Leg Locks', 'Submissions'],
  'force predictable reactions': ['Strategy and Game Planning', 'Concepts'],
  'granby roll': ['Movements', 'Escapes'],
  'guard retention rounds': ['Positional Sparring', 'Constraint-Led Games'],
  'hamstring slicer': ['Leg Locks', 'Submissions'],
  'hand-fight specific rounds': ['Positional Sparring', 'Constraint-Led Games'],
  'inside heel hook': ['Leg Locks', 'Submissions'],
  'inside tie': ['Grip Fighting', 'Positions'],
  kneebar: ['Leg Locks', 'Submissions'],
  'outside heel hook': ['Leg Locks', 'Submissions'],
  pummeling: ['Grip Fighting', 'Drills'],
  'sit-out': ['Movements', 'Escapes'],
  'straight ankle lock': ['Leg Locks', 'Submissions'],
  'texas cloverleaf': ['Leg Locks', 'Submissions'],
  'toe hold': ['Leg Locks', 'Submissions']
};

const getDuplicateNamePreferenceBonus = (entry) => {
  const normalizedName = normalizeValue(entry.name);
  const preferredCategories = duplicateNameCategoryPreference[normalizedName];

  if (!preferredCategories) {
    return 0;
  }

  const categoryIndex = preferredCategories.indexOf(entry.category);
  if (categoryIndex === -1) {
    return 0;
  }

  return (preferredCategories.length - categoryIndex) * 20;
};

const pickCanonicalEntry = (entries, normalizedSearch = '') => {
  if (!entries.length) return null;
  if (entries.length === 1) return entries[0];

  return [...entries].sort((a, b) => {
    const scoreA = getSearchRelevanceScore(a, normalizedSearch) + getSearchIntentCategoryBonus(a, normalizedSearch);
    const scoreB = getSearchRelevanceScore(b, normalizedSearch) + getSearchIntentCategoryBonus(b, normalizedSearch);
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }

    const descriptionA = normalizeValue(a.description).includes(normalizedSearch) ? 1 : 0;
    const descriptionB = normalizeValue(b.description).includes(normalizedSearch) ? 1 : 0;
    if (descriptionB !== descriptionA) {
      return descriptionB - descriptionA;
    }

    const duplicatePreferenceDifference = getDuplicateNamePreferenceBonus(b) - getDuplicateNamePreferenceBonus(a);
    if (duplicatePreferenceDifference !== 0) {
      return duplicatePreferenceDifference;
    }

    const defaultPriorityDifference = getDefaultCategoryPriority(b) - getDefaultCategoryPriority(a);
    if (defaultPriorityDifference !== 0) {
      return defaultPriorityDifference;
    }

    return a.category.localeCompare(b.category);
  })[0];
};

const getCollapsedSearchResults = (entries, normalizedSearch) => {
  const groupedByName = entries.reduce((acc, entry) => {
    const key = normalizeValue(entry.name);
    if (!acc.has(key)) {
      acc.set(key, []);
    }
    acc.get(key).push(entry);
    return acc;
  }, new Map());

  return Array.from(groupedByName.values())
    .map((group) => pickCanonicalEntry(group, normalizedSearch))
    .filter(Boolean);
};

const coachingScenarioGuidedPromptMap = {
  [normalizeValue('I am stuck under pressure')]: [
    {
      question: 'Where are you getting pinned most often?',
      expandableLabel: 'Need more survival branches?',
      options: [
        { label: 'Bottom side control', description: 'Frame building, underhook timing, and reguarding usually decide the escape.', focusName: 'Bottom Side Control' },
        { label: 'Bottom mount', description: 'Bridge timing, elbow-knee recovery, and top-leg traps usually matter most.', focusName: 'Bottom Mount' },
        { label: 'Bottom north-south', description: 'Shoulder turns, hip movement, and turtle/recovery timing usually matter here.', focusName: 'Bottom North-South' },
        { label: 'Bottom knee-on-belly', description: 'Distance management and catching the posting leg usually become the issue.', focusName: 'Bottom Knee-On-Belly' },
        { label: 'Back-control pressure', description: 'Best if hand-fighting and weakening the immediate choking line are the real pressure problem.', focusName: 'Rear Naked Choke Hand Peel Defense', isExtended: true },
        { label: 'Half-guard flattening pressure', description: 'Best if you are not fully passed but still getting pinned and denied frames.', focusName: 'Half Guard Recovery', isExtended: true },
        { label: 'Front headlock / turtle pressure', description: 'Best if the pressure trap starts while you are trying to build up or recover.', focusName: 'Front Headlock Strangle Defense', isExtended: true }
      ]
    }
  ],
  [normalizeValue('Build a back-take path')]: [
    {
      question: 'Where are you most often finding the back-take window?',
      expandableLabel: 'Need more back-take routes?',
      options: [
        { label: 'Front headlock / snap-downs', description: 'Spin-behinds and ride-style follow-ups usually open first here.', focusName: 'Front Headlock Standing' },
        { label: 'Turtle reactions', description: 'Hooks, seatbelt control, and ride pressure usually shape the route once they shell up.', focusName: 'Spiral Ride' },
        { label: 'Half guard / dogfight', description: 'Underhooks, come-ups, and backside exposure usually create the angle.', focusName: 'Dogfight' },
        { label: 'Backside rotational routes from leg entanglements', description: 'Best if your back takes come from inversion, leg entanglements, and backside rotational entries that can overlap with bolo or nearby crab-ride routes.', focusName: 'Matrix Back Takes' },
        { label: 'Seatbelt already connected', description: 'Best if you are already on the upper body and need cleaner control upgrades.', focusName: 'Seatbelt', isExtended: true },
        { label: 'Arm drags and rear angles', description: 'Best if you keep getting behind the shoulder line and want the cleaner path from rear access into true back control.', focusName: 'Arm Drag To Back', isExtended: true },
        { label: 'Berimbolo / matrix-style backside routes', description: 'Best if your back takes often come from inversion into a specific backside rotational angle, not just any loose wedge behind the hips.', focusName: 'Matrix Back Takes', isExtended: true }
      ]
    }
  ],
  [normalizeValue('Opponent is leg locking')]: [
    {
      question: 'Which leg-lock scenario is causing the problem most often?',
      expandableLabel: 'Need more leg-lock scenarios?',
      options: [
        { label: 'Standard ashi / straight entanglements', description: 'Booting, clearing the knee line, and stripping grips usually matter first.', focusName: 'Straight Ankle Lock Boot Defense' },
        { label: '50/50', description: 'Hand fighting, heel hiding, and secondary-leg awareness usually become the priority.', focusName: 'Heel Hook Line Defense' },
        { label: 'Saddle / inside sankaku', description: 'Heel exposure and knee-line danger usually spike here, so the defensive branch should start earlier.', focusName: 'Heel Hook Line Defense' },
        { label: 'Backside 50/50 / deep heel-hook chains', description: 'Rotation awareness and safer defensive reactions usually matter before anything else.', focusName: 'Heel Hook Line Defense' },
        { label: 'Straight ankle into rotational follow-ups', description: 'Best if the danger starts as a safer foot lock and then becomes more complex.', focusName: 'Straight Ankle Lock Boot Defense', isExtended: true },
        { label: 'Toe hold / kneebar scrambles', description: 'Best if the leg-lock threat usually appears during top scrambles or transitions.', focusName: 'Leg Lock Defense', isExtended: true },
        { label: 'I mainly need the escape reactions', description: 'Best if you want the defensive branch itself instead of starting from the attacking entanglement.', focusName: 'Leg Lock Defense', isExtended: true }
      ]
    }
  ],
  [normalizeValue('I need safer leg-lock basics')]: [
    {
      question: 'Which lower-body lane feels safest to build first?',
      expandableLabel: 'Need more lower-body basics?',
      options: [
        { label: 'Straight ankle lock', description: 'Best if you want clean mechanics and lower-risk finishing habits first.', focusName: 'Straight Ankle Lock' },
        { label: 'Ashi control first', description: 'Best if you want to build safer entanglement control before worrying about the finish.', focusName: 'Ashi Garami' },
        { label: 'Single-Leg X connections', description: 'Best if you want to learn safer off-balancing, stand-up, and ankle-lock entries before deeper heel-hook chains.', focusName: 'Single-Leg X' },
        { label: 'Come up on top first', description: 'Best if you want the lower-body lane to lead into top position before chasing the finish harder.', focusName: 'Single-Leg X Stand-Up Sweep', isExtended: true },
        { label: '50/50 control first', description: 'Best if you want safer lower-body familiarity before chasing the finish.', focusName: '50/50', isExtended: true }
      ]
    }
  ],
  [normalizeValue('I keep getting heel-hooked')]: [
    {
      question: 'Where are the heel-hook threats usually coming from?',
      expandableLabel: 'Need more heel-hook contexts?',
      options: [
        { label: 'Ashi garami', description: 'Knee-line awareness and heel hiding usually decide whether danger builds here.', focusName: 'Heel Hook Line Defense' },
        { label: '50/50', description: 'Secondary-leg control and hand fighting usually matter more than speed alone.', focusName: 'Heel Hook Line Defense' },
        { label: 'Saddle / inside sankaku', description: 'This usually demands sharper rotation awareness and earlier defensive choices.', focusName: 'Heel Hook Line Defense' },
        { label: 'Backside 50/50', description: 'You usually need safer defensive reactions before the rotation gets too deep.', focusName: 'Heel Hook Line Defense' },
        { label: 'I need the actual escape branch', description: 'Best if you want the defensive route itself instead of another attacking entanglement lane.', focusName: 'Heel Hook Line Defense', isExtended: true },
        { label: 'Outside heel-hook style reactions', description: 'Best if the outside rotational line is what keeps catching you and you want the earlier defensive answers.', focusName: 'Heel Hook Line Defense', isExtended: true },
        { label: 'Inside heel-hook style reactions', description: 'Best if the inside rotational line is the main danger you are feeling and you want the earlier defensive answers.', focusName: 'Heel Hook Line Defense', isExtended: true }
      ]
    }
  ],
  [normalizeValue('Improve standing exchanges')]: [
    {
      question: 'Which standing lane feels most natural to you right now?',
      expandableLabel: 'Need more standing lanes?',
      options: [
        { label: 'Collar tie / snap-downs', description: 'Best if you like head control, snaps, and front-headlock reactions.', focusName: 'Front Headlock Standing' },
        { label: 'Underhooks / body lock', description: 'Best if you like pressure, connection, and staying chest-to-chest.', focusName: 'Body Lock Standing' },
        { label: 'Russian tie / arm drags', description: 'Best if you like angles, off-balancing, and getting behind the opponent.', focusName: 'Russian Tie Standing' },
        { label: 'Single-leg entries', description: 'Best if you like wrestling up and attacking the legs directly.', focusName: 'Single Leg Position' },
        { label: 'Inside tie / short offense', description: 'Best if you like compact hand-fighting and quick entries from the center line.', focusName: 'Inside Tie', isExtended: true },
        { label: 'Ankle-pick timing', description: 'Best if you prefer posture breaks and lower-risk timing attacks.', focusName: 'Ankle Pick', isExtended: true },
        { label: 'Double-leg pressure shots', description: 'Best if you want a more direct penetration lane off reactions or level change.', focusName: 'Double Leg Position', isExtended: true },
        { label: 'Judo-style off-balancing', description: 'Best if you like movement-based entries and timing more than pure shots.', focusName: 'Foot Sweep', isExtended: true }
      ]
    }
  ],
  [normalizeValue('Beginner-safe path')]: [
    {
      question: 'What do you want the beginner-safe path to build first?',
      expandableLabel: 'Need more beginner-safe ideas?',
      options: [
        { label: 'Closed guard basics', description: 'Good for posture, breaking balance, and simple sweep-submission connections.', focusName: 'Closed Guard' },
        { label: 'Half guard survival', description: 'Good for frames, underhooks, and learning to recover before rushing the sweep.', focusName: 'Half Guard Recovery' },
        { label: 'Side control stability', description: 'Good for learning top pressure and when to move before the escape starts.', focusName: 'Side Control' },
        { label: 'Mount control', description: 'Good for simple top control, posture, and clean attack progression.', focusName: 'Mount' },
        { label: 'Posture and base', description: 'Good if you want safer top habits before branching into more specific attacks.', focusName: 'Posture', isExtended: true },
        { label: 'Guard retention basics', description: 'Good if you want a defensive-first path through recovery and re-guarding.', focusName: 'Knee-Elbow Recovery', isExtended: true },
        { label: 'Recovery back to guard', description: 'Good if you want clearer reset routes to safer guard positions.', focusName: 'Recovery To Seated Guard', isExtended: true }
      ]
    }
  ],
  [normalizeValue('Opponent turtles a lot')]: [
    {
      question: 'What first contact do you usually get when they turtle?',
      expandableLabel: 'Need more turtle follow-ups?',
      options: [
        { label: 'Front headlock', description: 'Good if you usually catch the head and need better standing snap-down, spin-behind, or choke decisions.', focusName: 'Front Headlock Standing' },
        { label: 'Seatbelt / harness', description: 'Good if you are already climbing toward the back but need cleaner control.', focusName: 'Seatbelt' },
        { label: 'Ride pressure', description: 'Good if you are flattening them but need better follow-ups into hooks or control.', focusName: 'Spiral Ride' },
        { label: 'Scramble to the side', description: 'Good if the turtle exchange stays loose and timing-based.', focusName: 'Clock-Style Spin To Back' },
        { label: 'I usually end up passing instead', description: 'Good if the turtle mostly turns into top control instead of a direct back take.', focusName: 'Pass From Turtle', isExtended: true },
        { label: 'Back takes from rear angles', description: 'Good if you often catch a loose rear angle and need a cleaner finish to control.', focusName: 'Arm Drag To Back', isExtended: true }
      ]
    }
  ],
  [normalizeValue('I play half guard')]: [
    {
      question: 'Which half-guard lane feels most like your game?',
      expandableLabel: 'Need more half-guard lanes?',
      options: [
        { label: 'Underhook half guard', description: 'Best if you like coming up, dogfights, and wrestling-style pressure.', focusName: 'Underhook Half Guard' },
        { label: 'Butterfly half', description: "Best if you like elevating, framing, and changing the opponent's base.", focusName: 'Butterfly Half' },
        { label: 'Knee shield half guard', description: 'Best if you need more space, angle changes, and safer retention.', focusName: 'Knee Shield Half Guard' },
        { label: 'Deep half / waiter routes', description: 'Best if you like getting underneath and turning the base.', focusName: 'Deep Half Guard' },
        { label: 'Dogfight finishes', description: 'Best if you already win the underhook and need better top finishes from the rise.', focusName: 'Dogfight', isExtended: true },
        { label: 'Recovery-first half guard', description: 'Best if you want to stop getting flattened before chasing the sweep.', focusName: 'Half Guard Recovery', isExtended: true },
        { label: 'Passing from top half guard', description: 'Best if you often come on top and want the next passing branch immediately.', focusName: 'Top Half Guard', isExtended: true }
      ]
    }
  ],
  [normalizeValue('Improve guard retention')]: [
    {
      question: 'Where is your guard usually falling apart first?',
      expandableLabel: 'Need more retention branches?',
      options: [
        { label: 'Open guard distance', description: 'Feet, frames, and re-squaring usually need to rebuild first before the guard starts feeling safe again.', focusName: 'Open Guard Recovery' },
        { label: 'Knee shield getting smashed', description: 'Hip line protection and replacing frames usually matter more here than jumping back into offense too early.', focusName: 'Frame Replacement' },
        { label: 'Butterfly hooks getting cleared', description: 'Timing, inside re-pummeling, and rebuilding the hook line usually become the issue.', focusName: 'Leg Pummeling' },
        { label: 'Seated guard getting run around', description: 'Distance, front-headlock awareness, and sitting back into a real guard usually shape the recovery.', focusName: 'Recovery To Seated Guard' },
        { label: 'Leg-drag pressure', description: 'Best if you need to square your hips back up before the pass settles.', focusName: 'Retaining Against Leg Drag', isExtended: true },
        { label: 'Body-lock passing pressure', description: 'Best if chest-to-hip compression is what is actually breaking your guard.', focusName: 'Retaining Against Body Lock', isExtended: true },
        { label: 'I just need open guard recovery', description: 'Best if you want the reset branch back to safer guards after the first break.', focusName: 'Open Guard Recovery', isExtended: true },
        { label: 'Supine to seated recovery', description: 'Best if you are surviving the first wave but not converting back to offense.', focusName: 'Recovery To Seated Guard', isExtended: true }
      ]
    }
  ],
  [normalizeValue('I need more sweep options')]: [
    {
      question: 'Which guard do you want more sweep options from?',
      expandableLabel: 'Need more guards?',
      options: [
        { label: 'Closed guard', description: 'Tilt, sit-up, and off-balancing options usually become the first layer here.', focusName: 'Closed Guard' },
        { label: 'Half guard', description: 'Underhook, dogfight, waiter, and base-changing reactions usually matter most.', focusName: 'Half Guard' },
        { label: 'Butterfly guard', description: 'Elevation timing and posting reactions usually decide the sweep family.', focusName: 'Butterfly Guard' },
        { label: 'Open guard', description: 'Distance, posts, and wrestle-up opportunities usually shape the next branch.', focusName: 'Open Guard' },
        { label: 'Spider guard', description: 'Grip control and angle breaking usually become the main off-balancing tools.', focusName: 'Spider Guard' },
        { label: 'X-guard', description: 'Base loading and stand-up connections usually drive the sweep path.', focusName: 'X-Guard' },
        { label: 'Deep half guard', description: 'Underneath loading and turning the hips usually create the sweep route.', focusName: 'Deep Half Guard', isExtended: true },
        { label: 'Single-Leg X', description: 'Off-balancing and threatening the stand-up usually shape the finish.', focusName: 'Single-Leg X', isExtended: true },
        { label: 'De La Riva', description: 'Ankle dumps, off-balancing, and backside threats usually become available.', focusName: 'De La Riva', isExtended: true },
        { label: 'Butterfly half', description: 'Base shifts and elevation reactions usually make the path clearer here.', focusName: 'Butterfly Half', isExtended: true }
      ]
    }
  ],
  [normalizeValue('Build submission chains')]: [
    {
      question: 'Which submission family do you want to build from?',
      expandableLabel: 'Need more submissions?',
      options: [
        { label: 'Triangle family', description: 'Good if you want angles, posture reactions, and armbar/omoplata links.', focusName: 'Triangle Choke' },
        { label: 'Kimura family', description: 'Good if you want control-first attacks that often connect to top or back exposure.', focusName: 'Kimura' },
        { label: 'Front headlock chokes', description: "Good if you want guillotines, anaconda, and D'Arce-style chains.", focusName: 'Front Headlock' },
        { label: 'Back choke chains', description: 'Good if you want high-percentage finishing routes once back control is already secured and the real issue is hand fighting into the finish.', focusName: 'Seatbelt' },
        { label: 'Armbar family', description: 'Good if you want direct arm-isolation chains from guard or top control.', focusName: 'Straight Armlock', isExtended: true },
        { label: 'Omoplata family', description: 'Good if you want shoulder-control chains that connect to sweeps, triangles, and armbars.', focusName: 'Omoplata', isExtended: true },
        { label: 'Collar choke chains', description: 'Good if you want gi-based posture breaking and layered collar-finishing routes.', focusName: 'Cross Collar Choke', isExtended: true },
        { label: 'Head-and-arm chokes', description: 'Good if you want pressure-based finishing routes from stable top control.', focusName: 'Arm Triangle', isExtended: true },
        { label: 'Americana family', description: 'Good if you want shoulder-lock attacks that connect to armbars and top control.', focusName: 'Americana', isExtended: true },
        { label: 'Straight ankle family', description: 'Good if you want a cleaner lower-body submission chain before deeper rotational finishes.', focusName: 'Straight Ankle Lock', isExtended: true }
      ]
    }
  ],
  [normalizeValue('Win scramble exchanges')]: [
    {
      question: 'Where do your scrambles usually start?',
      expandableLabel: 'Need more scramble starts?',
      options: [
        { label: 'Dogfight / half guard', description: 'Good if you are already coming up and need better finishes or back routes.', focusName: 'Dogfight' },
        { label: 'Turtle reactions', description: 'Good if the exchange gets loose and you need clearer stand-up or back-take choices.', focusName: 'Turtle' },
        { label: 'Front headlock', description: 'Good if scramble wins usually come from standing snaps, spin-behinds, or choking pressure.', focusName: 'Front Headlock Standing' },
        { label: 'Single-leg battles', description: 'Good if you are usually winning or losing the angle off a leg attack.', focusName: 'Single Leg Position' },
        { label: 'Granby / sit-out reactions', description: 'Good if the scramble often becomes a rotational or turtle-based recovery battle.', focusName: 'Granby Roll', isExtended: true },
        { label: 'Sit-out and re-attack exchanges', description: 'Good if you keep escaping the line but need a cleaner turn back on top.', focusName: 'Sit-Out', isExtended: true },
        { label: 'Recovering half guard under pressure', description: 'Good if your scrambles usually come from bad positions you are trying to survive first.', focusName: 'Recover Half Guard From Turtle', isExtended: true }
      ]
    }
  ],
  [normalizeValue('Gi guard development')]: [
    {
      question: 'Which gi guard are you trying to build right now?',
      expandableLabel: 'Need more gi guards?',
      options: [
        { label: 'Spider guard', description: 'Best if you want sleeve control, off-balancing, and direct triangle/omoplata links.', focusName: 'Spider Guard' },
        { label: 'Lasso guard', description: 'Best if you want stronger control and slower-breaking attack chains.', focusName: 'Lasso Guard' },
        { label: 'Collar-sleeve guard', description: 'Best if you want a versatile grip-based hub with sweep and submission options.', focusName: 'Collar-Sleeve Guard' },
        { label: 'Worm / lapel guard', description: 'Best if you want sticky control and off-balancing through lapel entanglement.', focusName: 'Worm Guard' },
        { label: 'Closed guard with collars', description: 'Best if you want a simpler gi hub with strong posture-breaking and choke routes.', focusName: 'Closed Guard', isExtended: true },
        { label: 'De La Riva', description: 'Best if you want outside hooks, sleeve control, and off-balancing into sweeps or back takes.', focusName: 'De La Riva', isExtended: true },
        { label: 'Open guard recovery', description: 'Best if the real issue is rebuilding your gi guard before the pass settles.', focusName: 'Open Guard Recovery', isExtended: true }
      ]
    }
  ],
  [normalizeValue('Learn X-guard routes')]: [
    {
      question: 'Which X-guard lane do you want to understand better?',
      expandableLabel: 'Need more X-guard routes?',
      options: [
        { label: 'Classic X-guard sweeps', description: 'Best if you want technical stand-up, overhead, and base-breaking routes.', focusName: 'X-Guard' },
        { label: 'Single-Leg X connections', description: 'Best if you want a tighter bridge between off-balancing and leg entries.', focusName: 'Single-Leg X' },
        { label: 'Backside / leg-entanglement transitions', description: 'Best if you want to understand the earlier lower-body chain before it turns into a deeper backside exchange.', focusName: 'Ashi Garami' },
        { label: 'Waiter-style underneath routes', description: 'Best if you like elevating and tipping the base from underneath.', focusName: 'Waiter Guard' },
        { label: 'Stand-up sweep finishes', description: 'Best if you want the wrestle-up and ankle-pick style endings from underneath.', focusName: 'Basic X-Guard Sweep', isExtended: true },
        { label: 'Leg-entry conversions', description: 'Best if you want X-guard to open directly into safer lower-body chains.', focusName: 'Ashi Garami', isExtended: true },
        { label: 'Retaining the route before the sweep', description: 'Best if you lose the entry before the actual X-guard offense begins.', focusName: 'K-Guard Entry For Retention', isExtended: true }
      ]
    }
  ],
  [normalizeValue('I keep getting my guard passed')]: [
    {
      question: 'Which guard keeps getting passed first?',
      expandableLabel: 'Need more guards?',
      options: [
        { label: 'Open guard', description: 'Distance and hip line protection usually need an open-guard recovery branch first.', focusName: 'Open Guard Recovery' },
        { label: 'Half guard', description: 'Flattening pressure and underhook battles usually mean you need the recovery branch before the sweep branch.', focusName: 'Half Guard Recovery' },
        { label: 'Knee shield', description: 'Space management and replacing frames usually matter more here than re-attacking immediately.', focusName: 'Frame Replacement' },
        { label: 'Butterfly guard', description: 'Hook pummeling and rebuilding the inside line usually shape the recovery path.', focusName: 'Butterfly Hook Recovery' },
        { label: 'Spider guard', description: 'Grip breaks and posture disruption usually mean you need the rebuild branch first.', focusName: 'Spider Guard Recovery' },
        { label: 'Seated guard', description: 'Distance, front-headlock awareness, and re-squaring usually matter most before seated offense starts again.', focusName: 'Recovery To Seated Guard', isExtended: true },
        { label: 'Collar-sleeve', description: 'Grip retention and angle recovery usually mean you need the rebuild branch before collar-sleeve offense starts again.', focusName: 'Collar Sleeve Recovery', isExtended: true },
        { label: 'De La Riva', description: 'Leg-pinning and backside exposure usually mean you need to reconnect the split-leg barrier before the pass settles.', focusName: 'Split-Leg Retention Recovery', isExtended: true },
        { label: 'Leg-drag pressure', description: 'Best if the pass is starting from hip misalignment more than total guard failure.', focusName: 'Retaining Against Leg Drag', isExtended: true },
        { label: 'Body-lock pressure', description: 'Best if chest-to-hip compression is what is breaking the retention sequence.', focusName: 'Retaining Against Body Lock', isExtended: true },
        { label: 'I need the reset branch', description: 'Best if you survive the first pass attempt but cannot rebuild a real guard after.', focusName: 'Open Guard Recovery', isExtended: true }
      ]
    }
  ],
  [normalizeValue('I get stuck in closed guard')]: [
    {
      question: 'What usually stops your closed-guard pass first?',
      expandableLabel: 'Need more closed-guard top fixes?',
      options: [
        { label: 'Posture keeps breaking', description: 'You likely need stronger posture discipline before the pass even starts.', focusName: 'Posture' },
        { label: 'I cannot get the guard open', description: 'You likely need a clearer opening sequence and base position.', focusName: 'Combat Base' },
        { label: 'They keep climbing attacks', description: 'You likely need safer top positioning before forcing the pass.', focusName: 'Posture' },
        { label: 'They force me forward into sweeps', description: 'You likely need better angle control and pressure direction first.', focusName: 'Stack / Under Passing' },
        { label: 'I need the first passing lane after the guard opens', description: 'Best if you open the guard but stall immediately on the next decision.', focusName: 'Standing Passing', isExtended: true },
        { label: 'I need safer pressure from the top', description: 'Best if you want to stay heavy and deny attacks before chasing speed.', focusName: 'Pressure Passing', isExtended: true },
        { label: 'I lose inside hand position first', description: 'Best if the issue starts before the pass with posture and arm-frame discipline.', focusName: 'Posture', isExtended: true }
      ]
    }
  ],
  [normalizeValue("I can't finish from the back")]: [
    {
      question: 'What part of the back finish is usually failing?',
      expandableLabel: 'Need more back-finish branches?',
      options: [
        { label: 'Hand fighting / grip wins', description: 'You likely need cleaner control before the choke becomes available.', focusName: 'Seatbelt' },
        { label: 'I lose the control position', description: 'You likely need stronger harness control before the finishing line becomes reliable.', focusName: 'Seatbelt' },
        { label: 'They turn and escape the line', description: 'You likely need to preserve harness control or re-control first before assuming the top bailout is already won.', focusName: 'Seatbelt' },
        { label: 'The choke mechanics stall out', description: 'You likely need a tighter finishing family to branch from.', focusName: 'Short Choke' },
        { label: 'I need the classic choke branch', description: 'Best if you want the high-percentage rear choke route itself.', focusName: 'Rear Naked Choke', isExtended: true },
        { label: 'I need more control before the choke', description: 'Best if you are losing the hooks or chest connection before mechanics matter.', focusName: 'Back Control', isExtended: true },
        { label: 'I want the mount bailout when the back slips', description: 'Best if you need a safer top finish branch when the back is not sticking.', focusName: 'Technical Mount', isExtended: true }
      ]
    }
  ],
  [normalizeValue('I keep getting submitted')]: [
    {
      question: 'Where are you getting submitted most often?',
      expandableLabel: 'Need more danger zones?',
      options: [
        { label: 'Closed guard', description: 'Posture, hand fighting, and angle denial usually matter first before you worry about the pass itself.', focusName: 'Posture' },
        { label: 'Bottom side control', description: 'Frame priority and escape timing usually need to sharpen here.', focusName: 'Bottom Side Control' },
        { label: 'Bottom mount', description: 'Bridge, elbow-knee recovery, and panic control usually matter most.', focusName: 'Bottom Mount' },
        { label: 'Back control', description: 'Hand fighting and hook-removal sequencing usually become the issue.', focusName: 'Back Choke Defense' },
        { label: 'Leg entanglements', description: 'Knee-line awareness and earlier defensive choices usually matter here.', focusName: 'Leg Lock Defense' },
        { label: 'Turtle / front-headlock scrambles', description: 'Best if the submission danger shows up while trying to stand or recover.', focusName: 'Front Headlock Strangle Defense', isExtended: true },
        { label: 'I keep getting caught while pressure-passing', description: 'Best if the danger starts when you drive forward and expose your neck or arms from top.', focusName: 'Guillotine / Front Headlock Choke Defense', isExtended: true },
        { label: 'Passing into guillotines', description: 'Best if you keep getting caught while pressuring forward from top.', focusName: 'Guillotine / Front Headlock Choke Defense', isExtended: true }
      ]
    }
  ],
  [normalizeValue('I need better back escapes')]: [
    {
      question: 'What part of the back escape is usually failing first?',
      expandableLabel: 'Need more back-escape branches?',
      options: [
        { label: 'I lose the hand-fight immediately', description: 'Start with controlling the choking arm before worrying about the hook line.', focusName: 'Two-On-One Grip Fight' },
        { label: 'I cannot get my shoulders back to the mat', description: 'The shoulder line usually has to win first before the rest of the escape opens.', focusName: 'Shoulder-To-Mat Escape' },
        { label: 'The hooks or body triangle keep me stuck', description: 'Hook stripping and lower-body clearing usually become the priority first.', focusName: 'Hook Stripping Escape' },
        { label: 'I escape but do not know what to do after', description: 'Build the route that turns the back escape into a top or safer recovery.', focusName: 'Escape To Top Half' },
        { label: 'I slide but cannot finish the turn', description: 'Best if you are winning space but not converting it into a full escape.', focusName: 'Shoulder Slide Escape', isExtended: true },
        { label: 'I need the scoop / lower-body route', description: 'Best if the lower body is what keeps you trapped after the hand fight.', focusName: 'Scoop Escape', isExtended: true },
        { label: 'Rear naked choke threats keep freezing me', description: 'Best if the immediate choke line is the real bottleneck.', focusName: 'Rear Naked Choke Hand-Peel Escape', isExtended: true }
      ]
    }
  ],
  [normalizeValue('I need submission defense')]: [
    {
      question: 'Which submission is giving you the most trouble right now?',
      expandableLabel: 'Need more submissions?',
      options: [
        { label: 'Armbar', description: 'Start from the armbar problem itself, then choose the defensive answer that fits the direction and timing.', focusName: 'Armbar Defense' },
        { label: 'Triangle', description: 'Start from the triangle problem itself, then choose the escape that fits the angle and posture battle.', focusName: 'Triangle Defense' },
        { label: 'Kimura', description: 'Start from the kimura problem itself, then choose the shoulder-safe answer before the rotation gets deep.', focusName: 'Kimura / Americana Defense' },
        { label: 'Guillotine / front headlock', description: 'Start from the guillotine problem itself, then choose the hand-fight or exit that fits the squeeze.', focusName: 'Guillotine / Front Headlock Choke Defense' },
        { label: 'Rear naked choke', description: 'Start by exposing the secondary hand, weakening the lock, and then choose the turn or strip that fits once the choke line opens.', focusName: 'Rear Naked Choke Hand Peel Defense', isExtended: true },
        { label: 'Bow and arrow choke', description: 'Start from the gi back-choke problem itself, then choose the collar-relief and shoulder-line defense that fits.', focusName: 'Bow And Arrow Hand-Fight Defense', isExtended: true },
        { label: 'Collar chokes', description: 'Start from the gi collar-choke problem itself, then choose the posture or grip-stripping answer that fits.', focusName: 'Collar Choke Defense', isExtended: true },
        { label: 'Americana', description: 'Start from the shoulder-lock problem itself, then choose the frame or turning answer that fits.', focusName: 'Americana Elbow Recovery Defense', isExtended: true },
        { label: 'Arm triangle', description: 'Start from the head-and-arm choke problem itself, then choose the escape toward space or half guard.', focusName: 'Head-And-Arm Choke Defense', isExtended: true },
        { label: 'North-south choke', description: 'Start from the north-south choke problem itself, then choose the shoulder-relief or turn-out answer that fits.', focusName: 'North-South Choke Defense', isExtended: true },
        { label: "D'Arce / anaconda", description: 'Start from the front-headlock strangle problem itself, then choose the daylight-turning or roll-through answer that fits.', focusName: 'Front Headlock Strangle Defense', isExtended: true },
        { label: 'Omoplata', description: 'Start from the shoulder-isolation problem itself, then choose the posture or roll-through answer that fits.', focusName: 'Omoplata Defense', isExtended: true },
        { label: 'Leg locks', description: 'Start from the lower-body danger itself, then choose the knee-line and foot-line defense branch that fits.', focusName: 'Leg Lock Defense', isExtended: true },
        { label: 'Ezekiel / forearm choke', description: 'Start from the short-pressure choke problem itself, then choose the posture and hand-fight answer that fits.', focusName: 'Ezekiel / Forearm Choke Defense', isExtended: true }
      ]
    }
  ],
  [normalizeValue('I want better takedown entries')]: [
    {
      question: 'Which takedown lane fits you best right now?',
      expandableLabel: 'Need more takedown entries?',
      options: [
        { label: 'Front headlock / snap-downs', description: 'Best if you like turning reactions into go-behinds and top control.', focusName: 'Front Headlock Standing' },
        { label: 'Body lock / clinch', description: 'Best if you like pressure, trips, and chest-to-chest control.', focusName: 'Body Lock Standing' },
        { label: 'Single-leg entries', description: 'Best if you like level changes, angles, and wrestling finishes.', focusName: 'Single Leg Position' },
        { label: 'Double-leg entries', description: 'Best if you like direct penetration and driving through the hips.', focusName: 'Double Leg Position' },
        { label: 'Russian tie / angle entries', description: 'Best if you like drags, outside angles, and getting behind the arms.', focusName: 'Russian Tie Standing' },
        { label: 'Collar tie / snap-down timing', description: 'Best if you want the standing hand-fight hub before choosing the finish.', focusName: 'Collar Tie', isExtended: true },
        { label: 'Inside tie and short offense', description: 'Best if you prefer compact ties and cleaner centerline attacks.', focusName: 'Inside Tie', isExtended: true },
        { label: 'Ankle-pick entries', description: 'Best if you want posture breaks and timing-based attacks before bigger shots.', focusName: 'Ankle Pick', isExtended: true },
        { label: 'Foot sweeps and movement', description: 'Best if you prefer off-balancing and timing over direct penetration shots.', focusName: 'Foot Sweep', isExtended: true }
      ]
    }
  ],
  [normalizeValue('I need safer submissions')]: [
    {
      question: 'Which control-first submission family fits you best?',
      expandableLabel: 'Need more safer submissions?',
      options: [
        { label: 'Kimura family', description: 'Good if you want a submission that often leads to control, back takes, or top position.', focusName: 'Kimura' },
        { label: 'Arm triangle family', description: 'Good if you prefer pressure-based finishes from stable top control.', focusName: 'Arm Triangle' },
        { label: 'Back choke family', description: 'Good if you want high-percentage finishes after control is already won and need the cleanest harness-to-choke route.', focusName: 'Seatbelt' },
        { label: 'Straight ankle family', description: 'Good if you want a simpler lower-body attack before deeper rotational entries.', focusName: 'Straight Ankle Lock' },
        { label: 'Americana family', description: 'Good if you want a top-control attack that often keeps you in a stable pin.', focusName: 'Americana', isExtended: true },
        { label: 'Cross-collar chains', description: 'Good if you want slower, control-first gi attacks that build off posture and grips.', focusName: 'Cross Collar Choke', isExtended: true },
        { label: 'Straight armbar family', description: 'Good if you want direct arm isolation that still links back into top control.', focusName: 'Straight Armlock', isExtended: true },
        { label: 'Triangle family', description: 'Good if you want layered reactions into sweeps and arm attacks once posture is broken.', focusName: 'Triangle Choke', isExtended: true }
      ]
    }
  ]
};

const escapeContinuationMap = {
  [normalizeValue('Bridge And Turn-In')]: ['Half Guard', 'Underhook Escape', 'Underhook Half Guard', 'Dogfight', 'Open Guard'],
  [normalizeValue('Underhook Escape')]: ['Underhook Half Guard', 'Dogfight', 'Single Leg', 'Half Guard'],
  [normalizeValue('Ghost Escape')]: ['Turtle', 'Seated Guard', 'Single Leg', 'Open Guard', 'Re-Guarding'],
  [normalizeValue('Running Escape')]: ['Running Man', 'Turtle', 'Seated Guard', 'Open Guard'],
  [normalizeValue('Reguard With Knee Inside')]: ['Half Guard', 'Open Guard', 'Butterfly Guard', 'Seated Guard'],
  [normalizeValue('Elbow Frame Recovery')]: ['Half Guard', 'Knee Shield Half Guard', 'Open Guard', 'Re-Guarding'],
  [normalizeValue('Armbar Hitchhiker')]: ['Top Half Guard', 'Combat Base', 'Single Leg', 'Open Guard'],
  [normalizeValue('Armbar Stacking Escape')]: ['Combat Base', 'Double Under Pass', 'Top Half Guard', 'Open Guard'],
  [normalizeValue('Armbar Stacking Defense')]: ['Combat Base', 'Double Under Pass', 'Top Half Guard', 'Open Guard'],
  [normalizeValue('Triangle Posture Break Escape')]: ['Combat Base', 'Double Under Pass', 'Top Half Guard', 'Open Guard'],
  [normalizeValue('Triangle Posture Defense')]: ['Combat Base', 'Double Under Pass', 'Top Half Guard', 'Open Guard'],
  [normalizeValue('Triangle Escape With Hand Fighting/Angles')]: ['Combat Base', 'Double Under Pass', 'Top Half Guard', 'Open Guard'],
  [normalizeValue('Shoulder Slide Escape')]: ['Closed Guard', 'Open Guard', 'Top Half Guard'],
  [normalizeValue('Escape To Top Half')]: ['Top Half Guard', 'Knee On Belly', 'Mount'],
  [normalizeValue('Rear Naked Choke Hand-Peel Escape')]: ['Shoulder-To-Mat Escape', 'Hook Stripping Escape', 'Back To The Mat Escape', 'Escape To Top Half'],
  [normalizeValue('Rear Naked Choke Hand Peel Defense')]: ['Shoulder-To-Mat Escape', 'Hook Stripping Escape', 'Back To The Mat Escape', 'Escape To Top Half'],
  [normalizeValue('Bow And Arrow Hand-Fight Escape')]: ['Shoulder-To-Mat Escape', 'Back To The Mat Escape', 'Open Guard', 'Escape To Top Half'],
  [normalizeValue('Bow And Arrow Choke Hand Fight Defense')]: ['Shoulder-To-Mat Escape', 'Back To The Mat Escape', 'Open Guard', 'Escape To Top Half'],
  [normalizeValue('Ezekiel Posture Escape')]: ['Combat Base', 'Top Half Guard', 'Open Guard', 'Double Under Pass'],
  [normalizeValue('Ezekiel Posture Defense')]: ['Combat Base', 'Top Half Guard', 'Open Guard', 'Double Under Pass'],
  [normalizeValue('Loop Choke Escape')]: ['Standing', 'Open Guard', 'Combat Base', 'Single Leg'],
  [normalizeValue('Two-On-One Grip Fight')]: ['Shoulder-To-Mat Escape', 'Hook Stripping Escape', 'Back To The Mat Escape', 'Escape To Top Half'],
  [normalizeValue('Back To The Mat Escape')]: ['Open Guard', 'Half Guard', 'Escape To Top Half', 'Standing'],
  [normalizeValue('Posture')]: ['Combat Base', 'Standing', 'Open Guard', 'Top Half Guard'],
  [normalizeValue('Collar Choke Grip-Stripping Escapes')]: ['Combat Base', 'Standing', 'Open Guard', 'Top Half Guard', 'Double Under Pass'],
  [normalizeValue('Rear Naked Choke Escape Choices')]: ['Shoulder-To-Mat Escape', 'Hook Stripping Escape', 'Back To The Mat Escape', 'Escape To Top Half'],
  [normalizeValue('Bow And Arrow Escape Choices')]: ['Shoulder-To-Mat Escape', 'Back To The Mat Escape', 'Open Guard', 'Escape To Top Half']
};

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

const getGroupConnectionReason = ({ groupKey, focusEntry }) => {
  const focusName = focusEntry?.name || 'current focus';

  switch (groupKey) {
    case 'entriesIntoPosition':
      return `Common entry into ${focusName}`;
    case 'commonAttacks':
      return `Common attack from ${focusName}`;
    case 'commonTransitions':
      return `Common transition from ${focusName}`;
    case 'commonFollowUps':
      return `Common follow-up from ${focusName}`;
    case 'commonDefenses':
      return `Common reaction branch from ${focusName}`;
    case 'relatedPositions':
      return `Closely related to ${focusName}`;
    default:
      return `Connected to ${focusName}`;
  }
};

const getGroupConnectionSummary = ({ groupKey, focusEntry, entry }) => {
  const focusName = focusEntry?.name || 'the current focus';
  const entryName = entry?.name || 'this option';

  switch (groupKey) {
    case 'entriesIntoPosition':
      return `${entryName} is a common entry that helps you arrive at ${focusName} more cleanly.`;
    case 'commonAttacks':
      return `${entryName} is one of the cleaner attacks once ${focusName} is established.`;
    case 'commonTransitions':
      return `${entryName} is a natural transition when ${focusName} starts to shift.`;
    case 'commonFollowUps':
      return `${entryName} is a strong follow-up if ${focusName} starts opening the exchange.`;
    case 'commonDefenses':
      return `${entryName} is a common answer when the opponent's reaction changes the line from ${focusName}.`;
    case 'relatedPositions':
      return `${entryName} keeps you close to ${focusName} without losing the path entirely.`;
    default:
      return `${entryName} stays connected to ${focusName}.`;
  }
};

const getOptionReasons = ({ entry, groupKey, filters, focusEntry = null }) => {
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
    reasons.push(
      entry
        ? getGroupConnectionReason({ groupKey, focusEntry, entry })
        : 'Referenced by this focus'
    );
  }

  return reasons.slice(0, 2);
};

const getEntrySummarySentence = (entry) => {
  const description = String(entry?.description || '').trim();

  if (!description) return '';

  const firstSentenceMatch = description.match(/[^.!?]+[.!?]?/);
  return (firstSentenceMatch?.[0] || description).trim();
};

const joinSummaryParts = (...parts) => parts.filter(Boolean).join(' ');

const buildBranchSummary = ({ entry, groupKey, focusEntry }) => joinSummaryParts(
  getGroupConnectionSummary({ groupKey, focusEntry, entry }),
  getEntrySummarySentence(entry)
);

const buildReactionSummary = ({ entry, reaction, cue }) => (
  cue || joinSummaryParts(
    `${entry.name} is often the cleaner branch when ${reaction.toLowerCase()}.`,
    getEntrySummarySentence(entry)
  )
);

const buildEscapeContinuationSummary = ({ entry, focusEntry, seeded = false }) => joinSummaryParts(
  seeded
    ? `${entry.name} is one of the most common ways to capitalize once ${focusEntry.name} works.`
    : `${entry.name} keeps the momentum after ${focusEntry.name} succeeds.`,
  getEntrySummarySentence(entry)
);

const buildRecommendationSummary = ({ option, focusEntry }) => {
  if (option.summary) {
    return option.summary;
  }

  const reactionReason = option.reasons.find((reason) => reason.startsWith('Common reaction: '));

  if (reactionReason && option.cue) {
    return option.cue;
  }

  return buildBranchSummary({
    entry: option.entry,
    groupKey: option.sourceKey,
    focusEntry,
  });
};

const relationshipPriorityBonus = {
  entriesIntoPosition: 1,
  commonAttacks: 8,
  commonTransitions: 11,
  commonFollowUps: 10,
  commonDefenses: 6,
  relatedPositions: 0
};

const broadPositionNames = new Set([
  'closed guard',
  'open guard',
  'half guard',
  'seated guard',
  'butterfly guard',
  'x guard',
  'single leg x',
  'mount',
  'side control',
  'north south',
  'turtle',
  'standing',
  'front headlock'
]);

const getFocusContinuationBonus = ({ focusEntry, entry, groupKey }) => {
  if (!focusEntry || !entry) return 0;

  let bonus = 0;
  const normalizedFocusName = normalizeValue(focusEntry.name);
  const normalizedEntryName = normalizeValue(entry.name);

  if (focusEntry.category === entry.category) {
    bonus += ['commonAttacks', 'commonTransitions', 'commonFollowUps', 'commonDefenses'].includes(groupKey) ? 5 : 2;
  }

  if (
    focusEntry.subcategory
    && entry.subcategory
    && normalizeValue(focusEntry.subcategory) === normalizeValue(entry.subcategory)
  ) {
    bonus += 3;
  }

  if ((entry.relatedPositions || []).some((value) => normalizeValue(value) === normalizedFocusName)) {
    bonus += 3;
  }

  if ((entry.commonTransitions || []).some((value) => normalizeValue(value) === normalizedFocusName)) {
    bonus += 2;
  }

  if ((entry.commonFollowUps || []).some((value) => normalizeValue(value) === normalizedFocusName)) {
    bonus += 2;
  }

  if (normalizedEntryName === normalizedFocusName) {
    bonus -= 8;
  }

  return bonus;
};

const getActionabilityBonus = ({ entry, groupKey }) => {
  if (!entry) return 0;

  const isPosition = entry.category === 'Positions';
  const normalizedName = normalizeValue(entry.name);
  const isBroadPosition = isPosition && broadPositionNames.has(normalizedName);

  if (['commonAttacks', 'commonTransitions', 'commonFollowUps'].includes(groupKey)) {
    if (!isPosition) return 3;
    if (isBroadPosition) return -3;
    return -1;
  }

  if (groupKey === 'commonDefenses') {
    return isPosition ? -1 : 2;
  }

  if (['entriesIntoPosition', 'relatedPositions'].includes(groupKey)) {
    return isPosition ? 2 : 0;
  }

  return 0;
};

const scoreOption = ({ entry, groupKey, filters, focusEntry = null }) => {
  let score = 0;
  const styleHints = getSelectedStyleHints(filters);
  const entryText = getEntryText(entry);

  score += relationshipPriorityBonus[groupKey] || 0;

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
  score += getFocusContinuationBonus({ focusEntry, entry, groupKey });
  score += getActionabilityBonus({ entry, groupKey });

  getFitProfileMatches(entry, filters).forEach((fit) => {
    if (fit.isMatch) score += 2;
    if (fit.isCaution) score -= 3;
  });

  return score;
};

const findEntryByName = (entriesByNameMap, name, normalizedSearch = '') => (
  pickCanonicalEntry(entriesByNameMap.get(normalizeValue(name)) || [], normalizedSearch)
);

const getFilteredBranches = ({ focusEntry, entriesByNameMap, filters, excludedEntryIds = [] }) => {
  const weakAreaStyles = filterConfig.weakArea[filters.weakArea] || [];
  const shouldShrink = Boolean(filters.weakArea);
  const excludedIds = new Set(excludedEntryIds.filter(Boolean));
  const allowDefensiveBranches = isDefensiveRecommendationContext({ focusEntry, filters });

  return relationshipGroups
    .filter((group) => allowDefensiveBranches || group.key !== 'commonDefenses')
    .map((group) => {
    const values = uniqueValues(focusEntry[group.key] || []);
    const clusteredOptions = new Map();

    values
      .map((name) => {
        const entry = findEntryByName(entriesByNameMap, name, normalizeValue(name));
        return {
          name,
          entry,
          score: scoreOption({ entry: entry || { name }, groupKey: group.key, filters, focusEntry }),
          reasons: getOptionReasons({ entry: entry || { name }, groupKey: group.key, filters, focusEntry }),
          summary: entry ? buildBranchSummary({ entry, groupKey: group.key, focusEntry }) : '',
          fitProfiles: getFitProfileMatches(entry || { name }, filters)
        };
      })
      .filter((option) => normalizeValue(option.name) !== normalizeValue(focusEntry.name))
      .filter((option) => !option.entry || !excludedIds.has(option.entry.id))
      .filter((option) => allowDefensiveBranches || !option.entry || !isDefensiveDecisionTreeEntry(option.entry))
      .filter((option) => !option.entry || !shouldHideRegressiveFamilyOption({
        focusEntry,
        entry: option.entry,
        groupKey: group.key
      }))
      .forEach((option) => {
        const clusterKey = option.entry ? getRecommendationClusterKey(option.entry) : option.name;
        const existingOption = clusteredOptions.get(clusterKey);

        if (!existingOption || option.score > existingOption.score) {
          clusteredOptions.set(clusterKey, option);
          return;
        }

        clusteredOptions.set(clusterKey, {
          ...existingOption,
          reasons: uniqueValues([...existingOption.reasons, ...option.reasons]).slice(0, 3)
        });
      });

    const rankedOptions = Array.from(clusteredOptions.values())
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
          reasons: [
            getGroupConnectionReason({ groupKey: group.key, focusEntry }),
            'Showing fallback path'
          ],
          summary: option.entry
            ? buildBranchSummary({ entry: option.entry, groupKey: group.key, focusEntry })
            : option.summary
        }));

    return {
      ...group,
      options
    };
    });
};

const getReactionBranchOptions = ({
  focusEntry,
  decisionTreeModel,
  entriesByNameMap,
  filters,
  excludedEntryIds = []
}) => {
  if (!focusEntry || !decisionTreeModel?.commonReactions?.length) return [];

  const excludedIds = new Set(excludedEntryIds.filter(Boolean));
  const allowDefensiveBranches = isDefensiveRecommendationContext({ focusEntry, filters });
  const optionsById = new Map();

  decisionTreeModel.commonReactions.forEach((reaction, reactionIndex) => {
    (reaction.branches || []).forEach((name, branchIndex) => {
      const entry = findEntryByName(entriesByNameMap, name, normalizeValue(name));

      if (!entry || entry.id === focusEntry.id || excludedIds.has(entry.id)) {
        return;
      }

      if (!allowDefensiveBranches && isDefensiveDecisionTreeEntry(entry)) {
        return;
      }

      let score = scoreOption({ entry, groupKey: 'commonTransitions', filters, focusEntry });
      score += Math.max(0, 8 - reactionIndex);
      score += Math.max(0, 3 - branchIndex);

      if (['Positions', 'Pins and Control', 'Back Takes', 'Submissions', 'Sweeps', 'Takedowns'].includes(entry.category)) {
        score += 2;
      }

      const nextOption = {
        name: entry.name,
        entry,
        score,
        reasons: uniqueValues([
          `Common reaction: ${reaction.reaction}`,
          ...getOptionReasons({ entry, groupKey: 'commonTransitions', filters, focusEntry })
        ]).slice(0, 3),
        summary: buildReactionSummary({ entry, reaction: reaction.reaction, cue: reaction.cue }),
        fitProfiles: getFitProfileMatches(entry, filters),
        sourceLabel: `Reaction: ${reaction.reaction}`,
        cue: reaction.cue
      };

      const existingOption = optionsById.get(entry.id);

      if (!existingOption || nextOption.score > existingOption.score) {
        optionsById.set(entry.id, nextOption);
        return;
      }

      optionsById.set(entry.id, {
        ...existingOption,
        reasons: uniqueValues([...existingOption.reasons, ...nextOption.reasons]).slice(0, 3)
      });
    });
  });

  return Array.from(optionsById.values())
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 6);
};

const isEscapeContinuationContext = ({ focusEntry, filters }) => {
  if (!focusEntry) return false;

  return [
    'Escapes',
    'Submission Defense',
    'Guard Retention'
  ].includes(focusEntry.category) || [
    'escapes',
    'guardRetention'
  ].includes(filters.weakArea);
};

const isDefensiveRecommendationContext = ({ focusEntry, filters }) => (
  isEscapeContinuationContext({ focusEntry, filters })
  || filters.preferredStyle === 'defense'
  || ['Escapes', 'Submission Defense', 'Guard Retention'].includes(focusEntry?.category)
);

const defensiveDecisionTreeCategories = new Set([
  'Escapes',
  'Submission Defense',
  'Guard Retention',
  'Reversals'
]);

const isDefensiveDecisionTreeEntry = (entry) => (
  defensiveDecisionTreeCategories.has(entry?.category)
);

const getRecommendationClusterKey = (entry) => {
  const normalizedName = normalizeValue(entry?.name);

  if (normalizedName === 'body triangle' || normalizedName === 'body triangle back control') {
    return 'body-triangle-back-control-family';
  }

  return entry?.id || normalizedName;
};

const backControlFamilyRank = new Map([
  ['back control', 1],
  ['back mount', 2],
  ['seatbelt', 2],
  ['body triangle', 3],
  ['body triangle back control', 3],
  ['straightjacket control', 4]
]);

const shouldHideRegressiveFamilyOption = ({ focusEntry, entry, groupKey }) => {
  const normalizedFocusName = normalizeValue(focusEntry?.name);
  const normalizedEntryName = normalizeValue(entry?.name);
  const focusRank = backControlFamilyRank.get(normalizedFocusName);
  const entryRank = backControlFamilyRank.get(normalizedEntryName);

  if (!focusRank || !entryRank) return false;
  if (!['entriesIntoPosition', 'commonTransitions', 'relatedPositions'].includes(groupKey)) return false;

  return entryRank < focusRank;
};

const getEscapeContinuationOptions = ({
  focusEntry,
  entriesByNameMap,
  filters,
  excludedEntryIds = []
}) => {
  if (!focusEntry) return [];

  const excludedIds = new Set(excludedEntryIds.filter(Boolean));
  const normalizedFocusName = normalizeValue(focusEntry.name);
  const seededNames = escapeContinuationMap[normalizedFocusName] || [];
  const candidateNames = seededNames.length
    ? uniqueValues(seededNames)
    : uniqueValues([
        ...(focusEntry.commonFollowUps || []),
        ...(focusEntry.commonTransitions || []),
        ...(focusEntry.commonAttacks || []),
        ...(focusEntry.relatedPositions || [])
      ]);

  return candidateNames
    .map((name, index) => {
      const entry = findEntryByName(entriesByNameMap, name, normalizeValue(name));

      if (!entry || entry.id === focusEntry.id || excludedIds.has(entry.id)) {
        return null;
      }

      const text = getEntryText(entry);
      let score = scoreOption({ entry, groupKey: 'commonFollowUps', filters, focusEntry });

      if (index < seededNames.length) score += 8;
      if (
        text.includes('guard')
        || text.includes('dogfight')
        || text.includes('single leg')
        || text.includes('wrestle up')
        || text.includes('back control')
        || text.includes('mount')
        || text.includes('side control')
        || text.includes('kimura')
        || text.includes('triangle')
      ) {
        score += 3;
      }

      if (['Positions', 'Pins and Control', 'Back Takes', 'Submissions', 'Sweeps', 'Takedowns'].includes(entry.category)) {
        score += 2;
      }

      return {
        entry,
        score,
        reasons: [
          'Built from the successful escape',
          seededNames.includes(name)
            ? `Common continuation after ${focusEntry.name}`
            : `Keeps the path moving after ${focusEntry.name}`
        ],
        summary: buildEscapeContinuationSummary({
          entry,
          focusEntry,
          seeded: seededNames.includes(name)
        }),
        fitProfiles: getFitProfileMatches(entry, filters)
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, 4);
};

const buildLibraryLink = ({ entryName, focusEntry, decisionPathEntries }) => {
  const params = new URLSearchParams();
  params.set('search', entryName);

  if (focusEntry?.name) {
    params.set('focus', focusEntry.name);
  }

  if (decisionPathEntries?.length) {
    params.set('path', decisionPathEntries.map((entry) => entry.name).join(' -> '));
    params.set('source', 'tree');
  }

  return `/library?${params.toString()}`;
};

const buildPlannedClassLink = (entry) => (
  `/planned-classes?openForm=1&treeTopicTitle=${encodeURIComponent(entry.name)}&treeEntryType=${encodeURIComponent(inferTopicTypeFromEntry(entry))}`
);

const buildAddTopicLink = (entry) => (
  `/topics?action=create&suggestedTitle=${encodeURIComponent(entry.name)}&suggestedType=${encodeURIComponent(inferTopicTypeFromEntry(entry))}`
);

const buildCurriculumIndexLink = (entry) => {
  const params = new URLSearchParams();
  params.set('search', entry.name);
  params.set('entryId', entry.id);
  return `/index?${params.toString()}`;
};

export default function DecisionTreePage() {
  const { user } = useAuth();
  const isMember = user?.role === 'member';
  const isManagement = user?.role === 'owner' || user?.role === 'admin';
  const [searchParams] = useSearchParams();
  const querySearch = searchParams.get('search') || '';
  const queryEntryId = searchParams.get('entryId') || '';
  const initialQueryMatch = useMemo(() => {
    if (queryEntryId) {
      return curriculumIndexSeed.find((entry) => entry.id === queryEntryId) || null;
    }

    const normalizedQuery = normalizeValue(querySearch);

    if (!normalizedQuery) return null;

    const exactNameMatches = curriculumIndexSeed.filter((entry) => normalizeValue(entry.name) === normalizedQuery);
    const canonicalExactMatch = pickCanonicalEntry(exactNameMatches, normalizedQuery);
    if (canonicalExactMatch) {
      return canonicalExactMatch;
    }

    return pickCanonicalEntry(
      curriculumIndexSeed.filter((entry) => getEntryText(entry).includes(normalizedQuery)),
      normalizedQuery
    )
      || null;
  }, [queryEntryId, querySearch]);
  const [search, setSearch] = useState(querySearch);
  const [searchIsActive, setSearchIsActive] = useState(false);
  const [expandedSearchResultIds, setExpandedSearchResultIds] = useState([]);
  const [focusId, setFocusId] = useState(initialQueryMatch?.id || defaultFocusId);
  const [history, setHistory] = useState([]);
  const [decisionPath, setDecisionPath] = useState(initialQueryMatch ? [initialQueryMatch.id] : []);
  const [filters, setFilters] = useState(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [showPartnerContext, setShowPartnerContext] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [scenarioFeedback, setScenarioFeedback] = useState(
    initialQueryMatch ? `Focused on ${initialQueryMatch.name} from Library. Start tracing the next coaching branches below.` : ''
  );
  const [pendingScrollTarget, setPendingScrollTarget] = useState('');
  const [activeScenarioPrompt, setActiveScenarioPrompt] = useState(null);
  const [isMobileScenarioCards, setIsMobileScenarioCards] = useState(() => (
    typeof window !== 'undefined' ? window.innerWidth <= 640 : false
  ));
  const [expandedScenarioCardLabels, setExpandedScenarioCardLabels] = useState({});
  const [expandedPromptKeys, setExpandedPromptKeys] = useState({});
  const [showEscapeContinuation, setShowEscapeContinuation] = useState(false);
  const filtersSectionRef = useRef(null);
  const scenarioPromptRef = useRef(null);
  const treeBranchesRef = useRef(null);
  const recommendationsRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(max-width: 640px)');
    const syncMobileState = (event) => {
      setIsMobileScenarioCards(event.matches);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncMobileState);
      return () => mediaQuery.removeEventListener('change', syncMobileState);
    }

    mediaQuery.addListener(syncMobileState);
    return () => mediaQuery.removeListener(syncMobileState);
  }, []);

  const entries = curriculumIndexSeed;

  const entriesByNameMap = useMemo(() => {
    const nextMap = new Map();
    entries.forEach((entry) => {
      const key = normalizeValue(entry.name);
      if (!nextMap.has(key)) {
        nextMap.set(key, []);
      }
      nextMap.get(key).push(entry);
    });
    return nextMap;
  }, [entries]);

  const focusEntry = useMemo(() => (
    entries.find((entry) => entry.id === focusId) || null
  ), [entries, focusId]);
  const decisionPathEntries = useMemo(
    () => decisionPath
      .map((id) => entries.find((entry) => entry.id === id))
      .filter(Boolean),
    [decisionPath, entries]
  );
  const previousPathEntryId = decisionPath.length > 1 ? decisionPath[decisionPath.length - 2] : null;

  const searchResults = useMemo(() => {
    const normalizedSearch = normalizeValue(search);

    if (!normalizedSearch) return [];

    const matchingEntries = entries
      .filter((entry) => !excludedDecisionTreeSearchCategories.has(entry.category))
      .filter((entry) => getEntryText(entry).includes(normalizedSearch));

    return getCollapsedSearchResults(matchingEntries, normalizedSearch)
      .sort((a, b) => {
        const scoreA = getSearchRelevanceScore(a, normalizedSearch) + getSearchIntentCategoryBonus(a, normalizedSearch);
        const scoreB = getSearchRelevanceScore(b, normalizedSearch) + getSearchIntentCategoryBonus(b, normalizedSearch);
        return scoreB - scoreA || a.name.localeCompare(b.name);
      })
      .slice(0, 8);
  }, [entries, search]);

  const isCompactSearchResults = search.trim().length > 0 && searchResults.length > 1;

  const visibleExpandedSearchResultIds = useMemo(() => {
    if (!isCompactSearchResults) {
      return [];
    }

    const visibleIds = new Set(searchResults.map((entry) => String(entry.id)));
    return expandedSearchResultIds.filter((entryId) => visibleIds.has(String(entryId)));
  }, [expandedSearchResultIds, isCompactSearchResults, searchResults]);

  const toggleSearchResultDetails = (entryId) => {
    setExpandedSearchResultIds((previousIds) => (
      previousIds.includes(entryId)
        ? previousIds.filter((currentId) => currentId !== entryId)
        : [...previousIds, entryId]
    ));
  };

  const activeStyleHints = useMemo(() => getSelectedStyleHints(filters), [filters]);

  const branchGroups = useMemo(() => (
    focusEntry
      ? getFilteredBranches({
          focusEntry,
          entriesByNameMap,
          filters,
          excludedEntryIds: [previousPathEntryId]
        })
      : relationshipGroups.map((group) => ({
          ...group,
          options: []
        }))
  ), [focusEntry, entriesByNameMap, filters, previousPathEntryId]);

  const resolvedCoachingScenarios = useMemo(() => (
    coachingScenarios.map((scenario) => {
      if (scenario.guidedPrompts?.length) {
        return scenario;
      }

      const mappedGuidedPrompts = coachingScenarioGuidedPromptMap[normalizeValue(scenario.label)];

      return mappedGuidedPrompts?.length
        ? {
            ...scenario,
            guidedPrompts: mappedGuidedPrompts
          }
        : scenario;
    })
  ), []);

  const groupedCoachingScenarios = useMemo(() => (
    coachingScenarioCategories
      .map((category) => ({
        category,
        scenarios: resolvedCoachingScenarios.filter((scenario) => scenario.category === category)
      }))
      .filter((group) => group.scenarios.length > 0)
  ), [resolvedCoachingScenarios]);

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
  const focusDecisionTreeModel = focusEntry?.decisionTreeModel || null;
  const focusReactionGroups = useMemo(() => {
    if (!focusDecisionTreeModel?.commonReactions?.length) return [];
    const allowDefensiveBranches = isDefensiveRecommendationContext({ focusEntry, filters });

    return focusDecisionTreeModel.commonReactions
      .map((reaction) => ({
        ...reaction,
        options: (reaction.branches || [])
          .map((name) => findEntryByName(entriesByNameMap, name, normalizeValue(name)))
          .filter((entry) => allowDefensiveBranches || !isDefensiveDecisionTreeEntry(entry))
          .filter(Boolean)
      }))
      .filter((reaction) => reaction.options.length > 0);
  }, [entriesByNameMap, filters, focusDecisionTreeModel, focusEntry]);

  const reactionBranchOptions = useMemo(() => (
    getReactionBranchOptions({
      focusEntry,
      decisionTreeModel: focusDecisionTreeModel,
      entriesByNameMap,
      filters,
      excludedEntryIds: decisionPath
    })
  ), [focusEntry, focusDecisionTreeModel, entriesByNameMap, filters, decisionPath]);

  const topRecommendations = useMemo(() => {
    const priorPathIds = new Set(decisionPath.slice(0, -1));
    const mergedOptions = new Map();
    const allowDefensiveBranches = isDefensiveRecommendationContext({ focusEntry, filters });

    [
      ...reactionBranchOptions,
      ...branchGroups
      .flatMap((group) => (
        group.options.map((option) => ({
          ...option,
          sourceLabel: group.label,
          sourceKey: group.key
        }))
      ))
    ].forEach((option, index) => {
      if (!option.entry || priorPathIds.has(option.entry.id)) return;
      if (!allowDefensiveBranches && option.sourceKey === 'commonDefenses') return;

      const clusterKey = getRecommendationClusterKey(option.entry);
      const existingOption = mergedOptions.get(clusterKey);
      const mergedReasons = existingOption
        ? uniqueValues([...existingOption.reasons, ...option.reasons]).slice(0, 3)
        : option.reasons;

      if (!existingOption || option.score > existingOption.score) {
        mergedOptions.set(clusterKey, {
          ...option,
          reasons: mergedReasons,
          summary: option.summary || buildRecommendationSummary({ option, focusEntry }),
          sortIndex: index
        });
        return;
      }

      mergedOptions.set(clusterKey, {
        ...existingOption,
        reasons: mergedReasons,
        summary: existingOption.summary || option.summary || buildRecommendationSummary({ option, focusEntry })
      });
    });

    return Array.from(mergedOptions.values())
      .sort((a, b) => b.score - a.score || a.sortIndex - b.sortIndex || a.name.localeCompare(b.name))
      .slice(0, 6);
  }, [branchGroups, decisionPath, filters, focusEntry, reactionBranchOptions]);

  const escapeContinuationOptions = useMemo(() => (
    getEscapeContinuationOptions({
      focusEntry,
      entriesByNameMap,
      filters,
      excludedEntryIds: decisionPath
    })
  ), [focusEntry, entriesByNameMap, filters, decisionPath]);

  const showEscapeContinuationAction = useMemo(() => (
    isEscapeContinuationContext({ focusEntry, filters }) && escapeContinuationOptions.length > 0
  ), [focusEntry, filters, escapeContinuationOptions.length]);

  useEffect(() => {
    if (!scenarioFeedback) return undefined;

    const timeoutId = window.setTimeout(() => {
      setScenarioFeedback('');
    }, 2800);

    return () => window.clearTimeout(timeoutId);
  }, [scenarioFeedback]);

  useEffect(() => {
    if (!pendingScrollTarget) return;

    const timeoutId = window.setTimeout(() => {
      const targetRef = pendingScrollTarget === 'filters'
        ? filtersSectionRef
        : pendingScrollTarget === 'prompt'
          ? scenarioPromptRef
        : pendingScrollTarget === 'recommendations' && topRecommendations.length > 0
          ? recommendationsRef
          : treeBranchesRef;

      const targetElement = targetRef.current;

      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const currentScrollY = window.scrollY || window.pageYOffset;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
        const centeredOffset = Math.max(80, (viewportHeight - rect.height) / 2);
        const nextTop = Math.max(0, currentScrollY + rect.top - centeredOffset);

        window.scrollTo({
          top: nextTop,
          behavior: 'smooth'
        });
      }

      setPendingScrollTarget('');
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [pendingScrollTarget, focusEntry?.id, topRecommendations.length, visibleBranchCount]);

  const navigateToEntry = (entry, {
    pathMode = 'append',
    scrollTarget = '',
    feedback = '',
    closeSearch = false
  } = {}) => {
    if (!entry) return;

    if (entry.id !== focusEntry?.id) {
      setHistory((current) => (focusEntry ? [focusEntry, ...current].slice(0, 8) : current));
      setFocusId(entry.id);
    }

    setShowEscapeContinuation(false);

    setDecisionPath((current) => {
      if (pathMode === 'reset') {
        return [entry.id];
      }

      if (current[current.length - 1] === entry.id) {
        return current;
      }

      return [...current, entry.id].slice(-8);
    });

    if (closeSearch) {
      setSearch('');
      setSearchIsActive(false);
    }

    if (feedback) {
      setScenarioFeedback(feedback);
    }

    if (scrollTarget) {
      setPendingScrollTarget(scrollTarget);
    }
  };

  const applyScenarioSelection = (scenario, overrides = {}) => {
    const scenarioFocus = entries.find((entry) => normalizeValue(entry.name) === normalizeValue(scenario.focusName));
    const nextFilters = {
      ...defaultFilters,
      ...scenario.filters,
      ...(overrides.filters || {})
    };
    const nextFocusName = overrides.focusName || scenario.focusName;
    const nextFocus = entries.find((entry) => normalizeValue(entry.name) === normalizeValue(nextFocusName));

    setFilters(nextFilters);
    setShowFilters(true);
    setShowPartnerContext(Boolean(nextFilters.partnerStyle));
    navigateToEntry(nextFocus || scenarioFocus, {
      pathMode: 'reset',
      scrollTarget: 'tree',
      closeSearch: true,
      feedback: (nextFocus || scenarioFocus) && (nextFocus || scenarioFocus).id !== focusEntry?.id
        ? `Applied "${scenario.label}". Focus moved to ${(nextFocus || scenarioFocus).name}, matching filters were turned on, and the page jumped to Tree branches below.`
        : `Applied "${scenario.label}". Matching filters were turned on and the page jumped to Tree branches below.`
    });
  };

  const applyCoachingScenario = (scenario) => {
    if (scenario.guidedPrompts?.length) {
      setActiveScenarioPrompt({
        scenario,
        stepIndex: 0,
        selectedFilters: {},
        selectedFocusName: scenario.focusName
      });
      setExpandedPromptKeys({});
      setScenarioFeedback(`Working through "${scenario.label}". Answer the next question below to narrow the tree.`);
      setPendingScrollTarget('prompt');
      return;
    }

    applyScenarioSelection(scenario);
  };

  const applyScenarioFollowUp = (event, scenario, followUp) => {
    event.stopPropagation();
    applyCoachingScenario({
      ...scenario,
      focusName: followUp.focusName,
      label: `${scenario.label}: ${followUp.label}`
    });
  };

  const getScenarioPreview = (scenario) => {
    if (scenario.followUps?.length) {
      return {
        items: scenario.followUps.slice(0, COLLAPSED_SCENARIO_PREVIEW_LIMIT).map((followUp) => ({
          key: followUp.focusName,
          label: followUp.label,
          interactive: true,
          followUp
        })),
        hint: scenario.followUps.length > COLLAPSED_SCENARIO_PREVIEW_LIMIT
          ? (scenario.expandableLabel || 'Need more options?')
          : ''
      };
    }

    const firstPrompt = scenario.guidedPrompts?.[0];
    if (!firstPrompt?.options?.length) {
      return { items: [], hint: '' };
    }

    return {
      items: firstPrompt.options
        .slice(0, COLLAPSED_GUIDED_OPTION_LIMIT)
        .map((option) => ({
          key: `${scenario.label}-${option.label}`,
          label: option.label,
          interactive: false
        })),
      hint: firstPrompt.options.length > COLLAPSED_GUIDED_OPTION_LIMIT
        ? firstPrompt.expandableLabel || 'Need more options?'
        : ''
    };
  };

  const toggleScenarioCard = (label) => {
    setExpandedScenarioCardLabels((current) => ({
      ...current,
      [label]: !current[label]
    }));
  };

  const applyGuidedScenarioOption = (option) => {
    if (!activeScenarioPrompt) return;

    const nextFilters = {
      ...activeScenarioPrompt.selectedFilters,
      ...(option.filters || {})
    };
    const nextFocusName = option.focusName || activeScenarioPrompt.selectedFocusName;
    const nextStepIndex = activeScenarioPrompt.stepIndex + 1;

    if (nextStepIndex >= activeScenarioPrompt.scenario.guidedPrompts.length) {
      setActiveScenarioPrompt(null);
      setExpandedPromptKeys({});
      applyScenarioSelection(activeScenarioPrompt.scenario, {
        filters: nextFilters,
        focusName: nextFocusName
      });
      return;
    }

    setActiveScenarioPrompt({
      ...activeScenarioPrompt,
      stepIndex: nextStepIndex,
      selectedFilters: nextFilters,
      selectedFocusName: nextFocusName
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value
    }));
  };

  const selectFocusEntry = (entry, options) => {
    navigateToEntry(entry, options);
  };

  const goBack = () => {
    const [previous, ...rest] = history;
    if (!previous) return;
    setFocusId(previous.id);
    setHistory(rest);
    setDecisionPath((current) => (current.length > 1 ? current.slice(0, -1) : current));
  };

  const resetDecisionTree = () => {
    setFocusId(defaultFocusId);
    setHistory([]);
    setDecisionPath([]);
    setFilters(defaultFilters);
    setShowFilters(false);
    setShowPartnerContext(false);
    setShowSimulation(false);
    setSearch('');
    setSearchIsActive(false);
    setPendingScrollTarget('');
    setActiveScenarioPrompt(null);
    setExpandedPromptKeys({});
    setShowEscapeContinuation(false);
    setScenarioFeedback('Submission success logged. Start a new problem or search a new start point next.');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const resetStartPoint = () => {
    setFocusId(defaultFocusId);
    setHistory([]);
    setDecisionPath([]);
    setSearch('');
    setSearchIsActive(false);
    setPendingScrollTarget('');
    setActiveScenarioPrompt(null);
    setExpandedPromptKeys({});
    setShowEscapeContinuation(false);
    setScenarioFeedback('Start point cleared. Pick a new coaching problem or search the Index to begin again.');
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setScenarioFeedback('Filters reset. Your current path stayed in place.');
  };

  return (
    <Layout>
      <div className="decision-tree-page">
        <h2 className="page-title">Decision Trees</h2>
        <p className="page-intro">
          {isMember
            ? 'Follow one study path at a time, then jump back into Curriculum or Library when you want more support.'
            : 'Explore one universal grappling tree from Curriculum, then use real-life filters to narrow the next best options for a coach, student, or matchup.'}
        </p>

        <section className="page-section decision-tree-hero">
          <div>
            <p className="meta-text">Current focus</p>
            <h3>{focusEntry?.name || 'No start point selected yet'}</h3>
            <p>{focusEntry?.description || 'Pick a coaching problem or search Curriculum to start building a real path through the tree.'}</p>
            <div className="decision-tree-chip-row">
              {focusEntry?.category && <span className="curriculum-index-tag">{focusEntry.category}</span>}
              {focusEntry?.subcategory && <span className="curriculum-index-tag">{focusEntry.subcategory}</span>}
              {focusEntry?.skillLevel && <span className="curriculum-index-tag">{focusEntry.skillLevel}</span>}
            </div>
              {focusEntry ? (
                <div className="decision-tree-focus-links">
                  <Link className="secondary-button" to={buildCurriculumIndexLink(focusEntry)}>
                    View in Index
                  </Link>
                <Link
                  className="secondary-button"
                  to={buildLibraryLink({
                    entryName: focusEntry.name,
                    focusEntry,
                    decisionPathEntries
                  })}
                  >
                    Find Library Resources
                  </Link>
                  {!isMember ? (
                    <Link className="secondary-button" to={buildPlannedClassLink(focusEntry)}>
                      Plan next class
                    </Link>
                  ) : null}
                  {isManagement ? (
                    <Link className="secondary-button" to={buildAddTopicLink(focusEntry)}>
                      Add topic
                    </Link>
                  ) : null}
                </div>
              ) : null}
          </div>
          <div className="decision-tree-hero-actions">
            <button className="secondary-button" type="button" onClick={goBack} disabled={!history.length}>
              Back
            </button>
            <button className="secondary-button" type="button" onClick={resetStartPoint}>
              Reset start point
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
            {isMember
              ? 'Search the Curriculum and choose the position, attack, defense, or concept you want to study next.'
              : 'Search Curriculum and choose the position, attack, defense, or concept you want the tree to start from.'}
          </p>
          <label htmlFor="decision-tree-search">Search Curriculum</label>
          <input
            id="decision-tree-search"
            type="text"
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            value={search}
            onFocus={() => setSearchIsActive(true)}
            onBlur={() => {
              window.setTimeout(() => setSearchIsActive(false), 120);
            }}
            onChange={(event) => {
              setSearch(event.target.value);
              setSearchIsActive(true);
            }}
            placeholder="Search closed guard, knee cut, front headlock..."
          />

          {searchIsActive && searchResults.length > 0 && (
            <ul className="card-list decision-tree-search-results">
              {searchResults.map((entry) => {
                const showSearchResultDetails = !isCompactSearchResults || visibleExpandedSearchResultIds.includes(entry.id);

                return (
                  <li className="decision-tree-search-result" key={entry.id}>
                    <div className={`decision-tree-search-result-card${isCompactSearchResults && !showSearchResultDetails ? ' is-compact' : ''}`}>
                      <div className="decision-tree-search-result-header">
                        <div className="decision-tree-search-result-title">
                          <strong>{entry.name}</strong>
                          <span>{entry.category}{entry.subcategory ? ` | ${entry.subcategory}` : ''}</span>
                        </div>
                        <div className="decision-tree-search-result-actions">
                          <button
                            type="button"
                            className="secondary-button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectFocusEntry(entry, {
                              pathMode: 'reset',
                              scrollTarget: 'tree',
                              closeSearch: true,
                              feedback: `Focused on ${entry.name}. The page jumped to Tree branches below.`
                            })}
                          >
                            Use in tree
                          </button>
                          {isCompactSearchResults ? (
                            <button
                              type="button"
                              className="secondary-button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => toggleSearchResultDetails(entry.id)}
                            >
                              {showSearchResultDetails ? 'Hide details' : 'Open details'}
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {showSearchResultDetails ? (
                        <div className="decision-tree-search-result-details">
                          <p>{entry.description}</p>
                          {entry.relatedPositions?.length ? (
                            <div className="meta-text">
                              Related positions: {entry.relatedPositions.join(', ')}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
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
                    (() => {
                      const preview = getScenarioPreview(scenario);
                      const isExpanded = !isMobileScenarioCards || Boolean(expandedScenarioCardLabels[scenario.label]);

                      return (
                        <article
                          key={scenario.label}
                          className={`decision-tree-scenario-card${isMobileScenarioCards ? ' is-collapsible' : ''}${isExpanded ? ' is-expanded' : ''}`}
                        >
                          <div className="decision-tree-scenario-card-header">
                            <strong>{scenario.label}</strong>
                            {isMobileScenarioCards ? (
                              <button
                                type="button"
                                className="secondary-button decision-tree-scenario-toggle"
                                onClick={() => toggleScenarioCard(scenario.label)}
                              >
                                {isExpanded ? 'Hide' : 'Expand'}
                              </button>
                            ) : null}
                          </div>

                          {isExpanded ? (
                            <>
                              <span>{scenario.description}</span>
                              {preview.items.length || preview.hint ? (
                                <span className="decision-tree-follow-up-row" aria-label="Scenario preview options">
                                  {preview.items.map((item) => (
                                    item.interactive ? (
                                      <span
                                        key={item.key}
                                        className="decision-tree-follow-up-chip"
                                        role="button"
                                        tabIndex={0}
                                        onClick={(event) => applyScenarioFollowUp(event, scenario, item.followUp)}
                                        onKeyDown={(event) => {
                                          if (event.key === 'Enter' || event.key === ' ') {
                                            applyScenarioFollowUp(event, scenario, item.followUp);
                                          }
                                        }}
                                      >
                                        {item.label}
                                      </span>
                                    ) : (
                                      <span
                                        key={item.key}
                                        className="decision-tree-follow-up-chip decision-tree-follow-up-chip-static"
                                      >
                                        {item.label}
                                      </span>
                                    )
                                  ))}
                                  {preview.hint ? (
                                    <span className="decision-tree-follow-up-chip decision-tree-follow-up-hint">
                                      {preview.hint}
                                    </span>
                                  ) : null}
                                </span>
                              ) : null}

                              <div className="decision-tree-scenario-card-actions">
                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={() => applyCoachingScenario(scenario)}
                                >
                                  Start here
                                </button>
                              </div>
                            </>
                          ) : null}
                        </article>
                      );
                    })()
                  ))}
                </div>
              </div>
            ))}
          </div>

          {activeScenarioPrompt ? (
            <div className="decision-tree-guided-prompt" ref={scenarioPromptRef}>
              {(() => {
                const prompt = activeScenarioPrompt.scenario.guidedPrompts[activeScenarioPrompt.stepIndex];
                const promptKey = `${activeScenarioPrompt.scenario.label}-${activeScenarioPrompt.stepIndex}`;
                const isExpanded = Boolean(expandedPromptKeys[promptKey]);
                const visibleOptions = isExpanded
                  ? prompt.options
                  : prompt.options.slice(0, COLLAPSED_GUIDED_OPTION_LIMIT);

                return (
                  <>
              <div className="decision-tree-section-heading">
                <div>
                  <h4>{activeScenarioPrompt.scenario.label}</h4>
                  <p className="meta-text">
                    {prompt.question}
                  </p>
                </div>
              </div>

              <div className="decision-tree-guided-grid">
                {visibleOptions.map((option) => (
                  <button
                    key={`${activeScenarioPrompt.scenario.label}-${option.label}`}
                    type="button"
                    className="decision-tree-guided-option"
                    onClick={() => applyGuidedScenarioOption(option)}
                  >
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </button>
                ))}
              </div>
              {prompt.options.length > COLLAPSED_GUIDED_OPTION_LIMIT ? (
                <button
                  type="button"
                  className="secondary-button decision-tree-guided-toggle"
                  onClick={() => setExpandedPromptKeys((current) => ({
                    ...current,
                    [promptKey]: !isExpanded
                  }))}
                >
                  {isExpanded ? 'Show fewer options' : prompt.expandableLabel || 'Need more options?'}
                </button>
              ) : null}
                  </>
                );
              })()}
            </div>
          ) : null}
        </section>

        <section className="page-section decision-tree-branch-spotlight" ref={treeBranchesRef}>
          <div className="decision-tree-section-heading">
            <div>
              <span className="decision-tree-next-step">Next step</span>
              <h3>Tree branches</h3>
              {decisionPathEntries.length > 0 ? (
                <p className="decision-tree-path-text">
                  Path: {decisionPathEntries.map((entry, index) => (
                    <span key={`path-${entry.id}`}>
                      {index > 0 ? ' -> ' : ''}
                      {entry.name}
                    </span>
                  ))}
                </p>
              ) : null}
              <p className="meta-text">
                Showing {visibleBranchCount} filtered options from the universal graph.
              </p>
              <p className="decision-tree-branch-callout">
                Most users will work here first after choosing a coaching problem, then fine-tune with filters only if they need to narrow the path further.
              </p>
            </div>
            <div className="decision-tree-header-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={goBack}
                disabled={!history.length}
              >
                Back 1 step
              </button>
              {activeStyleHints.length > 0 && (
                <div className="decision-tree-chip-row">
                  {activeStyleHints.map((hint) => (
                    <span className="curriculum-index-tag" key={hint}>{styleHintLabels[hint] || hint}</span>
                  ))}
                </div>
              )}
            </div>
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
                          onClick={() => selectFocusEntry(option, {
                            pathMode: 'append',
                            scrollTarget: 'recommendations',
                            feedback: `Moved from ${focusEntry.name} to ${option.name}. Jumped to the next recommendation layer below.`
                          })}
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

          {!focusEntry ? (
            <p className="empty-state">Choose a start point or coaching problem to begin building the tree.</p>
          ) : null}

          {topRecommendations.length > 0 ? (
            <div className="decision-tree-top-recommendations" ref={recommendationsRef}>
              <div className="decision-tree-section-heading">
                <div>
                  <h4>Best next moves</h4>
                  <p className="meta-text">
                    These are the strongest next branches from the current focus, current path, and the realistic reactions that usually happen from here.
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

                    <p className="decision-tree-recommendation-summary">
                      {buildRecommendationSummary({ option, focusEntry })}
                    </p>

                    <p className="meta-text">
                      {option.reasons.join(' | ')}
                    </p>

                    {option.cue ? (
                      <p className="meta-text decision-tree-top-cue">
                        {option.cue}
                      </p>
                    ) : null}

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
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => selectFocusEntry(option.entry, {
                          pathMode: 'append',
                          scrollTarget: 'recommendations',
                          feedback: `Moved from ${focusEntry.name} to ${option.entry.name}. Jumped to the next recommendation layer below.`
                        })}
                      >
                        Go to next step
                      </button>
                      <Link className="secondary-button" to={buildCurriculumIndexLink(option.entry)}>
                        View in Index
                      </Link>
                      <Link
                        className="secondary-button"
                        to={buildLibraryLink({
                          entryName: option.entry.name,
                          focusEntry,
                          decisionPathEntries
                        })}
                      >
                        Library
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {focusEntry ? (
            <div className="decision-tree-success-row">
              <Link className="secondary-button" to={buildCurriculumIndexLink(focusEntry)}>
                Open Curriculum
              </Link>
              <Link
                className="secondary-button"
                to={buildLibraryLink({
                  entryName: focusEntry.name,
                  focusEntry,
                  decisionPathEntries
                })}
              >
                Open Library
              </Link>
              {showEscapeContinuationAction ? (
                <button
                  className="secondary-button decision-tree-continuation-toggle"
                  type="button"
                  onClick={() => {
                    setShowEscapeContinuation((value) => !value);
                    setScenarioFeedback(
                      showEscapeContinuation
                        ? 'Closed the post-escape continuation panel.'
                        : 'Escape worked. Showing likely next positions and attacks from here.'
                    );
                  }}
                >
                  {showEscapeContinuation ? 'Hide post-escape options' : 'Escape worked: what next?'}
                </button>
              ) : null}
              <button className="success-button" type="button" onClick={resetDecisionTree}>
                Submission success
              </button>
            </div>
          ) : null}

          {showEscapeContinuationAction && showEscapeContinuation ? (
            <div className="decision-tree-guided-prompt decision-tree-continuation-panel">
              <div className="decision-tree-section-heading">
                <div>
                  <h4>After the escape works</h4>
                  <p className="meta-text">
                    Turn the recovery into a safer guard, a scramble win, or a dominant follow-up that fits this exact escape.
                  </p>
                </div>
              </div>

              <div className="decision-tree-guided-grid">
                {escapeContinuationOptions.map((option) => (
                  <button
                    key={`escape-continuation-${option.entry.id}`}
                    type="button"
                    className="decision-tree-guided-option"
                    onClick={() => selectFocusEntry(option.entry, {
                      pathMode: 'append',
                      scrollTarget: 'recommendations',
                      feedback: `Escape worked. Continue through ${option.entry.name} from here.`
                    })}
                  >
                    <strong>{option.entry.name}</strong>
                    <span>
                      {option.summary || option.entry.description}
                    </span>
                    <span className="decision-tree-reason-row">
                      {option.reasons.join(' | ')}
                    </span>
                  </button>
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
                            onClick={() => option.entry && selectFocusEntry(option.entry, {
                              pathMode: 'append',
                              scrollTarget: 'recommendations',
                              feedback: `Moved from ${focusEntry.name} to ${option.entry.name}. Jumped to the next recommendation layer below.`
                            })}
                            disabled={!option.entry}
                          >
                          <strong>{option.name}</strong>
                          <span>
                            {option.entry
                              ? `${option.entry.category}${option.entry.skillLevel ? ` | ${option.entry.skillLevel}` : ''}`
                              : 'Not a full Index node yet'}
                          </span>
                          {option.summary ? (
                            <span className="decision-tree-summary-row">
                              {option.summary}
                            </span>
                          ) : null}
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

        <section className={`page-section compact-form-shell decision-tree-collapsible-shell${showFilters ? ' is-open' : ''}`} ref={filtersSectionRef}>
          <div className="compact-form-header">
            <div>
              <h3>Simple filters</h3>
              <p className="meta-text">
                These filters shrink and rank the answers. If you do not want to narrow anything right now, just keep going with the Tree branches above.
              </p>
            </div>
            <div className="decision-tree-header-actions">
              {showFilters ? (
                <button className="secondary-button" type="button" onClick={resetFilters}>
                  Reset filters
                </button>
              ) : null}
              <button className="secondary-button" type="button" onClick={() => setShowFilters((value) => !value)}>
                {showFilters ? 'Hide filters' : 'Show filters'}
              </button>
            </div>
          </div>

          {!showFilters ? (
            <div className="decision-tree-collapsible-summary">
              <p className="meta-text">
                Leave this closed unless you want more specific suggestions. The main next-step path is already above.
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
                Add opponent or training-partner context when you want the tree to behave more like a coaching assistant. If not, keep following the path above.
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
      </div>
    </Layout>
  );
}
