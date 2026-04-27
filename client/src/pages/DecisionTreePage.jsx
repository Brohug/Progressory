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

const defaultFocusId = '';

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
          { label: 'Reverse X / Reverse Ashi', description: 'Leg-line awareness and angle changes usually matter more here.', focusName: 'Reverse Ashi', isExtended: true },
          { label: 'Waiter guard', description: 'Underneath balance and leg visibility usually decide the passing lane.', focusName: 'Waiter Guard', isExtended: true },
          { label: 'Deep half guard', description: 'Hip weight, head position, and base direction usually matter most.', focusName: 'Deep Half Guard', isExtended: true },
          { label: 'Seated guard', description: 'Distance, front-headlock threats, and wrestle-up entries usually shape the pass.', focusName: 'Seated Guard', isExtended: true },
          { label: 'Collar-sleeve', description: 'Grips, angle management, and posture discipline usually become the issue.', focusName: 'Collar-Sleeve Guard', isExtended: true },
          { label: 'Worm / lapel guard', description: 'Grip clearing and hip untangling usually matter more than speed alone.', focusName: 'Worm Guard', isExtended: true }
        ]
      },
      {
        question: 'What passing style fits you best right now?',
        options: [
          {
            label: 'Pressure passing',
            description: 'Best for compact or heavier players who like chest-to-chest control.',
            focusName: 'Body Lock Pass',
            filters: { preferredStyle: 'pressure', bodyType: 'larger', riskTolerance: 'low' }
          },
          {
            label: 'Mobility passing',
            description: 'Best for faster players who like circling, redirecting, and staying light.',
            focusName: 'Toreando Pass',
            filters: { preferredStyle: 'scrambles', bodyType: 'smaller', riskTolerance: 'medium' }
          },
          {
            label: 'Leg pin passing',
            description: 'Best for players who like stapling legs and winning angles before control.',
            focusName: 'Leg Drag',
            filters: { preferredStyle: 'pressure', riskTolerance: 'medium' }
          },
          {
            label: 'Under / stack passing',
            description: 'Best for players who like folding the hips and lifting the legs.',
            focusName: 'Stack Pass',
            filters: { preferredStyle: 'pressure', bodyType: 'compact', riskTolerance: 'low' }
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
    },
    guidedPrompts: [
      {
        question: 'How are they usually escaping your mount?',
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
    },
    guidedPrompts: [
      {
        question: 'What part of side control are you losing most often?',
        options: [
          {
            label: 'They keep finding the underhook',
            description: 'Upper-body pinning and head control usually need to win earlier.',
            focusName: 'Crossface and Underhook Control',
            filters: { preferredStyle: 'pressure', riskTolerance: 'low' }
          },
          {
            label: 'They keep getting the knee back inside',
            description: 'You may need a sharper transition before they fully reguard.',
            focusName: 'Knee On Belly',
            filters: { preferredStyle: 'pressure', riskTolerance: 'medium' }
          },
          {
            label: 'They turn away and start turtling',
            description: 'You likely need cleaner back-taking and ride-style follow-ups.',
            focusName: 'Side Control To Back',
            filters: { preferredStyle: 'backTakes', topBottom: 'top', riskTolerance: 'medium' }
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

const coachingScenarioGuidedPromptMap = {
  [normalizeValue('I am stuck under pressure')]: [
    {
      question: 'Where are you getting pinned most often?',
      options: [
        { label: 'Bottom side control', description: 'Frame building, underhook timing, and reguarding usually decide the escape.', focusName: 'Bottom Side Control' },
        { label: 'Bottom mount', description: 'Bridge timing, elbow-knee recovery, and top-leg traps usually matter most.', focusName: 'Bottom Mount' },
        { label: 'Bottom north-south', description: 'Shoulder turns, hip movement, and turtle/recovery timing usually matter here.', focusName: 'Bottom North-South' },
        { label: 'Bottom knee-on-belly', description: 'Distance management and catching the posting leg usually become the issue.', focusName: 'Bottom Knee-On-Belly' }
      ]
    }
  ],
  [normalizeValue('Build a back-take path')]: [
    {
      question: 'Where are you most often finding the back-take window?',
      options: [
        { label: 'Front headlock / snap-downs', description: 'Spin-behinds and ride-style follow-ups usually open first here.', focusName: 'Front Headlock' },
        { label: 'Turtle reactions', description: 'Hooks, seatbelt control, and ride pressure usually shape the route.', focusName: 'Turtle' },
        { label: 'Half guard / dogfight', description: 'Underhooks, come-ups, and backside exposure usually create the angle.', focusName: 'Dogfight' },
        { label: 'Leg entanglements / inversion', description: 'Crab-ride exposure and backside transitions usually become available.', focusName: 'Crab Ride' }
      ]
    }
  ],
  [normalizeValue('Opponent is leg locking')]: [
    {
      question: 'Which leg-lock scenario is causing the problem most often?',
      options: [
        { label: 'Standard ashi / straight entanglements', description: 'Booting, clearing the knee line, and stripping grips usually matter first.', focusName: 'Ashi Garami' },
        { label: '50/50', description: 'Hand fighting, heel hiding, and secondary-leg awareness usually become the priority.', focusName: '50/50' },
        { label: 'Saddle / inside sankaku', description: 'Heel exposure and knee-line danger usually spike here.', focusName: 'Saddle' },
        { label: 'Backside 50/50 / deep heel-hook chains', description: 'Rotation awareness and safer defensive reactions become more important.', focusName: 'Backside 50/50' }
      ]
    }
  ],
  [normalizeValue('I need safer leg-lock basics')]: [
    {
      question: 'Which lower-body lane feels safest to build first?',
      options: [
        { label: 'Straight ankle lock', description: 'Best if you want clean mechanics and lower-risk finishing habits first.', focusName: 'Straight Ankle Lock' },
        { label: 'Kneebar', description: 'Best if you like extension-based finishes and strong top control links.', focusName: 'Kneebar' },
        { label: 'Aoki lock', description: 'Best if you want to learn a rotational finish without diving straight into heel hooks.', focusName: 'Aoki Lock' },
        { label: 'Ashi control first', description: 'Best if you want to build safer entanglement control before worrying about the finish.', focusName: 'Ashi Garami' }
      ]
    }
  ],
  [normalizeValue('I keep getting heel-hooked')]: [
    {
      question: 'Where are the heel-hook threats usually coming from?',
      options: [
        { label: 'Ashi garami', description: 'Knee-line awareness and heel hiding usually decide whether danger builds here.', focusName: 'Ashi Garami' },
        { label: '50/50', description: 'Secondary-leg control and hand fighting usually matter more than speed alone.', focusName: '50/50' },
        { label: 'Saddle / inside sankaku', description: 'This usually demands sharper rotation awareness and earlier defensive choices.', focusName: 'Saddle' },
        { label: 'Backside 50/50', description: 'You usually need safer defensive reactions before the rotation gets too deep.', focusName: 'Backside 50/50' }
      ]
    }
  ],
  [normalizeValue('Improve standing exchanges')]: [
    {
      question: 'Which standing lane feels most natural to you right now?',
      options: [
        { label: 'Collar tie / snap-downs', description: 'Best if you like head control, snaps, and front-headlock reactions.', focusName: 'Collar Tie' },
        { label: 'Underhooks / body lock', description: 'Best if you like pressure, connection, and staying chest-to-chest.', focusName: 'Body Lock Standing' },
        { label: 'Russian tie / arm drags', description: 'Best if you like angles, off-balancing, and getting behind the opponent.', focusName: 'Russian Tie Standing' },
        { label: 'Single-leg entries', description: 'Best if you like wrestling up and attacking the legs directly.', focusName: 'Single Leg Position' }
      ]
    }
  ],
  [normalizeValue('Beginner-safe path')]: [
    {
      question: 'What do you want the beginner-safe path to build first?',
      options: [
        { label: 'Closed guard basics', description: 'Good for posture, breaking balance, and simple sweep-submission connections.', focusName: 'Closed Guard' },
        { label: 'Half guard survival', description: 'Good for frames, underhooks, and learning to recover or sweep without rushing.', focusName: 'Half Guard' },
        { label: 'Side control stability', description: 'Good for learning top pressure and when to move before the escape starts.', focusName: 'Side Control' },
        { label: 'Mount control', description: 'Good for simple top control, posture, and clean attack progression.', focusName: 'Mount' }
      ]
    }
  ],
  [normalizeValue('Opponent turtles a lot')]: [
    {
      question: 'What first contact do you usually get when they turtle?',
      options: [
        { label: 'Front headlock', description: 'Good if you usually catch the head and need better spin-behind or choke decisions.', focusName: 'Front Headlock' },
        { label: 'Seatbelt / harness', description: 'Good if you are already climbing toward the back but need cleaner control.', focusName: 'Seatbelt' },
        { label: 'Ride pressure', description: 'Good if you are flattening them but need better follow-ups into hooks or control.', focusName: 'Spiral Ride' },
        { label: 'Scramble to the side', description: 'Good if the turtle exchange stays loose and timing-based.', focusName: 'Clock-Style Spin To Back' }
      ]
    }
  ],
  [normalizeValue('I play half guard')]: [
    {
      question: 'Which half-guard lane feels most like your game?',
      options: [
        { label: 'Underhook half guard', description: 'Best if you like coming up, dogfights, and wrestling-style pressure.', focusName: 'Underhook Half Guard' },
        { label: 'Butterfly half', description: 'Best if you like elevating, framing, and changing the opponent’s base.', focusName: 'Butterfly Half' },
        { label: 'Knee shield half guard', description: 'Best if you need more space, angle changes, and safer retention.', focusName: 'Knee Shield Half Guard' },
        { label: 'Deep half / waiter routes', description: 'Best if you like getting underneath and turning the base.', focusName: 'Deep Half Guard' }
      ]
    }
  ],
  [normalizeValue('Improve guard retention')]: [
    {
      question: 'Where is your guard usually falling apart first?',
      options: [
        { label: 'Open guard distance', description: 'Feet, frames, and re-squaring usually need to win earlier here.', focusName: 'Open Guard' },
        { label: 'Knee shield getting smashed', description: 'Hip line protection and replacing frames usually matter more here.', focusName: 'Knee Shield Half Guard' },
        { label: 'Butterfly hooks getting cleared', description: 'Timing, elevation threats, and re-pummeling usually become the issue.', focusName: 'Butterfly Guard' },
        { label: 'Seated guard getting run around', description: 'Distance, front-headlock awareness, and wrestle-up timing usually shape the recovery.', focusName: 'Seated Guard' }
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
      options: [
        { label: 'Triangle family', description: 'Good if you want angles, posture reactions, and armbar/omoplata links.', focusName: 'Triangle Choke' },
        { label: 'Kimura family', description: 'Good if you want control-first attacks that often connect to top or back exposure.', focusName: 'Kimura' },
        { label: 'Front headlock chokes', description: 'Good if you want guillotines, anaconda, and D’Arce-style chains.', focusName: 'Guillotine' },
        { label: 'Back choke chains', description: 'Good if you want high-percentage finishing routes after back control is won.', focusName: 'Rear Naked Choke' }
      ]
    }
  ],
  [normalizeValue('Win scramble exchanges')]: [
    {
      question: 'Where do your scrambles usually start?',
      options: [
        { label: 'Dogfight / half guard', description: 'Good if you are already coming up and need better finishes or back routes.', focusName: 'Dogfight' },
        { label: 'Turtle reactions', description: 'Good if the exchange gets loose and you need clearer stand-up or back-take choices.', focusName: 'Turtle' },
        { label: 'Front headlock', description: 'Good if scramble wins usually come from snaps, spin-behinds, or choking pressure.', focusName: 'Front Headlock' },
        { label: 'Single-leg battles', description: 'Good if you are usually winning or losing the angle off a leg attack.', focusName: 'Single Leg Position' }
      ]
    }
  ],
  [normalizeValue('Gi guard development')]: [
    {
      question: 'Which gi guard are you trying to build right now?',
      options: [
        { label: 'Spider guard', description: 'Best if you want sleeve control, off-balancing, and direct triangle/omoplata links.', focusName: 'Spider Guard' },
        { label: 'Lasso guard', description: 'Best if you want stronger control and slower-breaking attack chains.', focusName: 'Lasso Guard' },
        { label: 'Collar-sleeve guard', description: 'Best if you want a versatile grip-based hub with sweep and submission options.', focusName: 'Collar-Sleeve Guard' },
        { label: 'Worm / lapel guard', description: 'Best if you want sticky control and off-balancing through lapel entanglement.', focusName: 'Worm Guard' }
      ]
    }
  ],
  [normalizeValue('Learn X-guard routes')]: [
    {
      question: 'Which X-guard lane do you want to understand better?',
      options: [
        { label: 'Classic X-guard sweeps', description: 'Best if you want technical stand-up, overhead, and base-breaking routes.', focusName: 'X-Guard' },
        { label: 'Single-Leg X connections', description: 'Best if you want a tighter bridge between off-balancing and leg entries.', focusName: 'Single-Leg X' },
        { label: 'Backside / leg-entanglement transitions', description: 'Best if you want to understand when X-guard opens the lower-body chain.', focusName: 'Backside 50/50' },
        { label: 'Waiter-style underneath routes', description: 'Best if you like elevating and tipping the base from underneath.', focusName: 'Waiter Guard' }
      ]
    }
  ],
  [normalizeValue('I keep getting my guard passed')]: [
    {
      question: 'Which guard keeps getting passed first?',
      expandableLabel: 'Need more guards?',
      options: [
        { label: 'Open guard', description: 'Distance and hip line protection usually need attention first.', focusName: 'Open Guard' },
        { label: 'Half guard', description: 'Flattening pressure and underhook battles usually decide the problem.', focusName: 'Half Guard' },
        { label: 'Knee shield', description: 'Space management and replacing frames usually matter most here.', focusName: 'Knee Shield Half Guard' },
        { label: 'Butterfly guard', description: 'Hook pummeling and timing usually shape the recovery path.', focusName: 'Butterfly Guard' },
        { label: 'Spider guard', description: 'Grip breaks and posture disruption usually become the first issue.', focusName: 'Spider Guard' },
        { label: 'Seated guard', description: 'Distance, front-headlock awareness, and re-squaring usually matter most.', focusName: 'Seated Guard', isExtended: true },
        { label: 'Collar-sleeve', description: 'Grip retention and angle recovery usually become the issue here.', focusName: 'Collar-Sleeve Guard', isExtended: true },
        { label: 'De La Riva', description: 'Leg-pinning and backside exposure usually change the defensive problem.', focusName: 'De La Riva', isExtended: true }
      ]
    }
  ],
  [normalizeValue('I get stuck in closed guard')]: [
    {
      question: 'What usually stops your closed-guard pass first?',
      options: [
        { label: 'Posture keeps breaking', description: 'You likely need stronger posture discipline before the pass even starts.', focusName: 'Posture' },
        { label: 'I cannot get the guard open', description: 'You likely need a clearer opening sequence and base position.', focusName: 'Combat Base' },
        { label: 'They keep climbing attacks', description: 'You likely need safer top positioning before forcing the pass.', focusName: 'Closed Guard Top' },
        { label: 'They force me forward into sweeps', description: 'You likely need better angle control and pressure direction first.', focusName: 'Double Under Pass' }
      ]
    }
  ],
  [normalizeValue('I can’t finish from the back')]: [
    {
      question: 'What part of the back finish is usually failing?',
      options: [
        { label: 'Hand fighting / grip wins', description: 'You likely need cleaner control before the choke becomes available.', focusName: 'Seatbelt' },
        { label: 'I lose the control position', description: 'You likely need stronger hook or body-triangle management first.', focusName: 'Body Triangle Back Control' },
        { label: 'They turn and escape the line', description: 'You likely need better transitions when the choke does not finish.', focusName: 'Technical Mount' },
        { label: 'The choke mechanics stall out', description: 'You likely need a tighter finishing family to branch from.', focusName: 'Short Choke' }
      ]
    }
  ],
  [normalizeValue('I keep getting submitted')]: [
    {
      question: 'Where are you getting submitted most often?',
      options: [
        { label: 'Closed guard', description: 'Posture, hand fighting, and angle denial usually matter first.', focusName: 'Closed Guard' },
        { label: 'Bottom side control', description: 'Frame priority and escape timing usually need to sharpen here.', focusName: 'Bottom Side Control' },
        { label: 'Bottom mount', description: 'Bridge, elbow-knee recovery, and panic control usually matter most.', focusName: 'Bottom Mount' },
        { label: 'Back control', description: 'Hand fighting and hook-removal sequencing usually become the issue.', focusName: 'Back Control' },
        { label: 'Leg entanglements', description: 'Knee-line awareness and earlier defensive choices usually matter here.', focusName: 'Ashi Garami' }
      ]
    }
  ],
  [normalizeValue('I want better takedown entries')]: [
    {
      question: 'Which takedown lane fits you best right now?',
      options: [
        { label: 'Front headlock / snap-downs', description: 'Best if you like turning reactions into go-behinds and top control.', focusName: 'Front Headlock' },
        { label: 'Body lock / clinch', description: 'Best if you like pressure, trips, and chest-to-chest control.', focusName: 'Body Lock Standing' },
        { label: 'Single-leg entries', description: 'Best if you like level changes, angles, and wrestling finishes.', focusName: 'Single Leg Position' },
        { label: 'Double-leg entries', description: 'Best if you like direct penetration and driving through the hips.', focusName: 'Double Leg Position' },
        { label: 'Russian tie / angle entries', description: 'Best if you like drags, outside angles, and getting behind the arms.', focusName: 'Russian Tie Standing' }
      ]
    }
  ],
  [normalizeValue('I need safer submissions')]: [
    {
      question: 'Which control-first submission family fits you best?',
      options: [
        { label: 'Kimura family', description: 'Good if you want a submission that often leads to control, back takes, or top position.', focusName: 'Kimura' },
        { label: 'Arm triangle family', description: 'Good if you prefer pressure-based finishes from stable top control.', focusName: 'Arm Triangle' },
        { label: 'Back choke family', description: 'Good if you want high-percentage finishes after control is already won.', focusName: 'Rear Naked Choke' },
        { label: 'Straight ankle family', description: 'Good if you want a simpler lower-body attack before deeper rotational entries.', focusName: 'Straight Ankle Lock' }
      ]
    }
  ]
};

const escapeContinuationMap = {
  [normalizeValue('Bridge And Turn-In')]: ['Half Guard', 'Underhook Half Guard', 'Dogfight', 'Open Guard'],
  [normalizeValue('Underhook Escape')]: ['Underhook Half Guard', 'Dogfight', 'Single Leg Position', 'Half Guard'],
  [normalizeValue('Ghost Escape')]: ['Turtle', 'Seated Guard', 'Single Leg Position', 'Open Guard'],
  [normalizeValue('Running Escape')]: ['Running Man', 'Seated Guard', 'Open Guard'],
  [normalizeValue('Reguard With Knee Inside')]: ['Half Guard', 'Open Guard', 'Butterfly Guard'],
  [normalizeValue('Elbow Frame Recovery')]: ['Half Guard', 'Knee Shield Half Guard', 'Open Guard'],
  [normalizeValue('Armbar Hitchhiker')]: ['Top Half Guard', 'Combat Base', 'Single Leg Position'],
  [normalizeValue('Armbar Stacking Defense')]: ['Combat Base', 'Double Under Pass', 'Top Half Guard'],
  [normalizeValue('Triangle Posture Escape')]: ['Combat Base', 'Double Under Pass', 'Top Half Guard'],
  [normalizeValue('Triangle Escape With Hand Fighting/Angles')]: ['Combat Base', 'Double Under Pass', 'Top Half Guard'],
  [normalizeValue('Shoulder Slide Escape')]: ['Closed Guard', 'Open Guard', 'Top Half Guard'],
  [normalizeValue('Escape To Top Half')]: ['Top Half Guard', 'Knee On Belly', 'Mount']
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

const getFilteredBranches = ({ focusEntry, entryMap, filters, excludedEntryIds = [] }) => {
  const weakAreaStyles = filterConfig.weakArea[filters.weakArea] || [];
  const shouldShrink = Boolean(filters.weakArea);
  const excludedIds = new Set(excludedEntryIds.filter(Boolean));

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
      .filter((option) => !option.entry || !excludedIds.has(option.entry.id))
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

const getEscapeContinuationOptions = ({
  focusEntry,
  entryMap,
  filters,
  excludedEntryIds = []
}) => {
  if (!focusEntry) return [];

  const excludedIds = new Set(excludedEntryIds.filter(Boolean));
  const seededNames = escapeContinuationMap[normalizeValue(focusEntry.name)] || [];
  const candidateNames = uniqueValues([
    ...seededNames,
    ...(focusEntry.commonFollowUps || []),
    ...(focusEntry.commonTransitions || []),
    ...(focusEntry.commonAttacks || []),
    ...(focusEntry.relatedPositions || [])
  ]);

  return candidateNames
    .map((name, index) => {
      const entry = findEntryByName(entryMap, name);

      if (!entry || entry.id === focusEntry.id || excludedIds.has(entry.id)) {
        return null;
      }

      const text = getEntryText(entry);
      let score = scoreOption({ entry, groupKey: 'commonFollowUps', filters });

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
          seededNames.includes(name) ? 'Common continuation from this reaction' : 'Connected next step'
        ],
        fitProfiles: getFitProfileMatches(entry, filters)
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, 4);
};

export default function DecisionTreePage() {
  const [search, setSearch] = useState('');
  const [searchIsActive, setSearchIsActive] = useState(false);
  const [focusId, setFocusId] = useState(defaultFocusId);
  const [history, setHistory] = useState([]);
  const [decisionPath, setDecisionPath] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [showPartnerContext, setShowPartnerContext] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [scenarioFeedback, setScenarioFeedback] = useState('');
  const [pendingScrollTarget, setPendingScrollTarget] = useState('');
  const [activeScenarioPrompt, setActiveScenarioPrompt] = useState(null);
  const [expandedPromptKeys, setExpandedPromptKeys] = useState({});
  const [showEscapeContinuation, setShowEscapeContinuation] = useState(false);
  const filtersSectionRef = useRef(null);
  const scenarioPromptRef = useRef(null);
  const treeBranchesRef = useRef(null);
  const recommendationsRef = useRef(null);

  const entries = curriculumIndexSeed;

  const entryMap = useMemo(() => {
    const nextMap = new Map();
    entries.forEach((entry) => {
      nextMap.set(normalizeValue(entry.name), entry);
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

    const rankedMatches = entries
      .filter((entry) => getEntryText(entry).includes(normalizedSearch))
      .sort((a, b) => {
        const aName = normalizeValue(a.name);
        const bName = normalizeValue(b.name);
        const aScore = aName === normalizedSearch ? 3 : aName.startsWith(normalizedSearch) ? 2 : 1;
        const bScore = bName === normalizedSearch ? 3 : bName.startsWith(normalizedSearch) ? 2 : 1;
        return bScore - aScore || a.name.localeCompare(b.name);
      });

    const seenNames = new Set();

    return rankedMatches
      .filter((entry) => {
        const key = normalizeValue(entry.name);
        if (seenNames.has(key)) return false;
        seenNames.add(key);
        return true;
      })
      .slice(0, 8);
  }, [entries, search]);

  const activeStyleHints = useMemo(() => getSelectedStyleHints(filters), [filters]);

  const branchGroups = useMemo(() => (
    focusEntry
      ? getFilteredBranches({
          focusEntry,
          entryMap,
          filters,
          excludedEntryIds: [previousPathEntryId]
        })
      : relationshipGroups.map((group) => ({
          ...group,
          options: []
        }))
  ), [focusEntry, entryMap, filters, previousPathEntryId]);

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

  const escapeContinuationOptions = useMemo(() => (
    getEscapeContinuationOptions({
      focusEntry,
      entryMap,
      filters,
      excludedEntryIds: decisionPath
    })
  ), [focusEntry, entryMap, filters, decisionPath]);

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

      targetRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
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
      scrollTarget: 'filters',
      closeSearch: true,
      feedback: (nextFocus || scenarioFocus) && (nextFocus || scenarioFocus).id !== focusEntry?.id
        ? `Applied "${scenario.label}". Focus moved to ${(nextFocus || scenarioFocus).name}, matching filters were turned on, and the page jumped to Simple filters below.`
        : `Applied "${scenario.label}". Matching filters were turned on and the page jumped to Simple filters below.`
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
    setScenarioFeedback('Submission success logged. The decision tree has been reset for the next scenario.');
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
    setScenarioFeedback('Filters reset. Your current tree path stayed in place.');
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
            <h3>{focusEntry?.name || 'No start point selected yet'}</h3>
            <p>{focusEntry?.description || 'Pick a coaching problem or search the Curriculum Index to start building a real path through the tree.'}</p>
            <div className="decision-tree-chip-row">
              {focusEntry?.category && <span className="curriculum-index-tag">{focusEntry.category}</span>}
              {focusEntry?.subcategory && <span className="curriculum-index-tag">{focusEntry.subcategory}</span>}
              {focusEntry?.skillLevel && <span className="curriculum-index-tag">{focusEntry.skillLevel}</span>}
            </div>
            {focusEntry ? (
              <div className="decision-tree-focus-links">
                <Link className="secondary-button" to={`/index?search=${encodeURIComponent(focusEntry.name)}`}>
                  View in Index
                </Link>
                <Link className="secondary-button" to={`/library?search=${encodeURIComponent(focusEntry.name)}`}>
                  Find Library Resources
                </Link>
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
            Search the universal Index and choose the position, attack, defense, or concept you want the tree to start from.
          </p>
          <label htmlFor="decision-tree-search">Search Curriculum Index</label>
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
              {searchResults.map((entry) => (
                <li className="decision-tree-search-result" key={entry.id}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectFocusEntry(entry, {
                      pathMode: 'reset',
                      scrollTarget: 'tree',
                      closeSearch: true,
                      feedback: `Focused on ${entry.name}. The page jumped to Tree branches below.`
                    })}
                  >
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

          {activeScenarioPrompt ? (
            <div className="decision-tree-guided-prompt" ref={scenarioPromptRef}>
              {(() => {
                const prompt = activeScenarioPrompt.scenario.guidedPrompts[activeScenarioPrompt.stepIndex];
                const promptKey = `${activeScenarioPrompt.scenario.label}-${activeScenarioPrompt.stepIndex}`;
                const isExpanded = Boolean(expandedPromptKeys[promptKey]);
                const visibleOptions = prompt.options.filter((option) => isExpanded || !option.isExtended);

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
              {prompt.options.some((option) => option.isExtended) ? (
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

        <section className={`page-section compact-form-shell decision-tree-collapsible-shell${showFilters ? ' is-open' : ''}`} ref={filtersSectionRef}>
          <div className="compact-form-header">
            <div>
              <h3>Simple filters</h3>
              <p className="meta-text">
                These filters shrink and rank the answers. Open them when you want more specific suggestions.
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
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => selectFocusEntry(option.entry, {
                          pathMode: 'append',
                          scrollTarget: 'recommendations',
                          feedback: `Moved from ${focusEntry.name} to ${option.entry.name}. Jumped to the next recommendation layer below.`
                        })}
                      >
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

          {focusEntry ? (
            <div className="decision-tree-success-row">
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
                      {option.entry.description}
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
