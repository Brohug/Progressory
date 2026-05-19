const normalizeValue = (value) => (
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
);

export const setupFamilies = [
  {
    title: 'Standing hand-fight setups',
    lane: 'Standing',
    summary: 'Win the first reaction before you commit to the shot.',
    description:
      'Use head touches, level changes, collar ties, inside ties, and two-on-one control to make the stance react before the actual takedown starts.',
    setupNodes: ['Collar Tie', 'Inside Tie', 'Russian Tie Standing', 'Two-On-One Standing', 'Snap Down'],
    nextAttacks: ['Ankle Pick', 'Single Leg', 'Double Leg', 'Front Headlock Standing'],
    curriculumSearch: 'collar tie',
    treeSearch: 'single leg',
    relatedTerms: ['collar tie', 'inside tie', 'russian tie', 'two on one', 'snap down', 'ankle pick', 'single leg', 'double leg', 'front headlock standing']
  },
  {
    title: 'Single-leg setup chains',
    lane: 'Standing',
    summary: 'Build the single leg through reactions instead of shooting blind.',
    description:
      'This family is for getting to the single leg through feints, stance reactions, sweep-single looks, and tied-up upper-body entries before the defender can sprawl cleanly.',
    setupNodes: ['Sweep Single', 'Russian Tie To Single', 'Head-Inside Single', 'Head-Outside Single', 'Snatch Single'],
    nextAttacks: ['Single Leg', 'Low Single', 'Double Leg', 'Front Headlock'],
    exampleSequence: [
      'Head touch + level change',
      'They step',
      'Ankle pick',
      'They stay tall',
      'Single leg',
      'They sprawl',
      'Front headlock / go-behind / turtle attack'
    ],
    curriculumSearch: 'sweep single',
    treeSearch: 'single leg',
    relatedTerms: ['single leg', 'low single', 'sweep single', 'russian tie to single', 'head inside single', 'head outside single', 'snatch single', 'ankle pick']
  },
  {
    title: 'Front headlock setup chains',
    lane: 'Standing',
    summary: 'Create the head drop before you chase the finish or go-behind.',
    description:
      'Use snap-downs, stance breaks, sprawls, and head-position wins to create the front headlock first, then decide whether the best next answer is a choke, spin-behind, or turtle attack.',
    setupNodes: ['Snap Down', 'Snap Down To Front Headlock', 'Sprawl', 'Front Headlock Standing'],
    nextAttacks: ['Front Headlock', 'Guillotine', "D'Arce Choke", 'Front Headlock To Spin Behind'],
    exampleSequence: [
      'Snap down',
      'Head drops cleanly',
      'Front headlock',
      'They turn to knees',
      'Spin behind / turtle attack'
    ],
    curriculumSearch: 'snap down',
    treeSearch: 'front headlock',
    relatedTerms: ['front headlock', 'snap down', 'sprawl', 'guillotine', "d'arce choke", 'anaconda choke', 'front headlock to spin behind']
  },
  {
    title: 'Rear-angle and drag setups',
    lane: 'Standing',
    summary: 'Win the shoulder line, then attack behind the hips.',
    description:
      'Arm drags, duck unders, collar drags, and two-on-one steering all belong here. These setups are less about raw force and more about creating a clean rear angle before the opponent squares up again.',
    setupNodes: ['Arm Drag To Back Take', 'Duck Under', 'Collar Drag', 'Arm Drag Rear Angle'],
    nextAttacks: ['Back Control', 'Rear Body Lock Standing', 'Single Leg', 'Mat Return'],
    exampleSequence: [
      'Arm drag',
      'Back exposure opens',
      'Rear body lock',
      'They keep standing',
      'Mat return / single leg finish'
    ],
    curriculumSearch: 'arm drag',
    treeSearch: 'back take',
    relatedTerms: ['arm drag', 'back take', 'back control', 'duck under', 'collar drag', 'rear body lock', 'mat return']
  },
  {
    title: 'Body-lock entry setups',
    lane: 'Standing',
    summary: 'Win the upper body first, then connect your takedown or mat return.',
    description:
      'This family is for underhook pressure, elbow-pull reactions, duck-under access, and rear-body-lock connections that lead into body-lock takedowns, single legs, or standing-to-mat-return sequences.',
    setupNodes: ['Underhook Pressure', 'Elbow Pull To Clamp', 'Duck Under', 'Turn-The-Corner Body Lock'],
    nextAttacks: ['Body Lock Takedown', 'Single Leg', 'Rear Body Lock Standing', 'Mat Return'],
    exampleSequence: [
      'Underhook pressure',
      'They turn away',
      'Rear body lock',
      'They keep standing',
      'Mat return'
    ],
    curriculumSearch: 'body lock takedown',
    treeSearch: 'body lock takedown',
    relatedTerms: ['body lock takedown', 'rear body lock standing', 'rear body lock mat return', 'duck under', 'single leg', 'mat return']
  },
  {
    title: 'Guard wrestle-up setups',
    lane: 'Guard',
    summary: 'Use bottom position reactions to create a come-up.',
    description:
      'This family is for seated guard, shin-to-shin, half guard, and butterfly situations where the setup is really about making the top player post, overcommit, or drift high enough that the wrestle-up becomes available.',
    setupNodes: ['Shin-To-Shin', 'Seated Guard', 'Underhook Half Guard', 'Butterfly Guard'],
    nextAttacks: ['Wrestle-Up Single Leg Sweep', 'Single-Leg From Seated Guard', 'Wrestle-Up Double Leg Sweep', 'Dogfight Sweep'],
    exampleSequence: [
      'Shin-to-shin',
      'They drift high',
      'Wrestle-up single leg',
      'They square up',
      'Top finish / single-leg continuation'
    ],
    curriculumSearch: 'wrestle up',
    treeSearch: 'single leg',
    relatedTerms: ['wrestle up', 'shin to shin', 'seated guard', 'underhook half guard', 'butterfly guard', 'dogfight sweep', 'single leg x']
  },
  {
    title: 'Closed-guard attack setups',
    lane: 'Guard',
    summary: 'Use posture breaks and arm reactions to open sweeps or submissions.',
    description:
      'This family is for closed-guard reactions that create real openings: collar pulls, shoulder crunches, hip-bump threats, and overhook control that lead toward sweeps, triangles, armbars, or kimura chains.',
    setupNodes: ['Collar Pull', 'Shoulder Crunch', 'Hip Bump Threat', 'Overhook Clamp'],
    nextAttacks: ['Scissor Sweep', 'Triangle Choke', 'Straight Armbar From Guard', 'Kimura'],
    exampleSequence: [
      'Collar pull',
      'They posture back up',
      'Hip bump threat',
      'They post the hand',
      'Kimura'
    ],
    curriculumSearch: 'closed guard',
    treeSearch: 'triangle choke',
    relatedTerms: ['closed guard', 'triangle choke', 'straight armbar from guard', 'kimura', 'scissor sweep', 'shoulder crunch', 'omoplata']
  },
  {
    title: 'Passing setup chains',
    lane: 'Passing',
    summary: 'Win the grips or pins that make the pass start cleanly.',
    description:
      'These are the setup lanes that make passing easier before the actual pass happens: grip breaking, leg pinning, headquarters-style control, and body-lock access before the guard can reset.',
    setupNodes: ['Grip Fighting', 'Leg Pin Pass', 'Headquarters Pass', 'Body Lock Standing'],
    nextAttacks: ['Knee Cut', 'Torreando Pass', 'Body Lock Pass', 'Leg Drag'],
    exampleSequence: [
      'Grip break',
      'Legs separate',
      'Torreando / knee cut lane',
      'They square back in',
      'Leg drag / body lock continuation'
    ],
    curriculumSearch: 'headquarters pass',
    treeSearch: 'guard passing',
    relatedTerms: ['guard passing', 'grip fighting', 'leg pin pass', 'headquarters pass', 'body lock pass', 'knee cut', 'torreando pass', 'leg drag']
  },
  {
    title: 'Half-guard passing setups',
    lane: 'Passing',
    summary: 'Win the arm and head-fight first, then choose the cleanest passing lane.',
    description:
      'This family is for half-guard top players who first need to win the hand fight, pin the near-side arm, earn the underhook, or lift the bottom leg from headquarters before the pass opens cleanly.',
    setupNodes: ['Near-Side Arm Pin', 'Far-Side Reach To Underhook', 'Knee Slice With Arm Pin', 'Headquarters Leg Lift'],
    nextAttacks: ['Knee Cut', 'Half Guard Smash Pass', 'Hip Smash Pass', 'Backstep Half Guard Pass'],
    exampleSequence: [
      'Pin the near-side arm',
      'They reach with the far-side arm',
      'Underhook',
      'Free the trapped leg',
      'Knee cut / smash-pass continuation'
    ],
    curriculumSearch: 'top half guard',
    treeSearch: 'top half guard',
    relatedTerms: ['top half guard', 'half guard smash pass', 'backstep half guard pass', 'knee cut', 'hip smash pass']
  },
  {
    title: 'Submission-entry setups',
    lane: 'Submission',
    summary: 'Create the control that makes the finish realistic first.',
    description:
      'This family is for upper-body or positional control that creates the submission later: shoulder crunches, front headlocks, kimura traps, and gift-wrap style control that forces the next attack to open cleanly.',
    setupNodes: ['Shoulder Crunch', 'Front Headlock', 'Kimura Trap', 'Gift Wrap'],
    nextAttacks: ['Choi Bar', 'Guillotine', 'Kimura', 'Technical Mount To Back'],
    exampleSequence: [
      'Shoulder crunch',
      'They keep the elbow isolated',
      'Choi Bar / triangle',
      'They posture awkwardly',
      'Sweep / armbar continuation'
    ],
    curriculumSearch: 'shoulder crunch',
    treeSearch: 'armbar',
    relatedTerms: ['shoulder crunch', 'choi bar', 'triangle choke', 'kimura trap', 'kimura', 'gift wrap', 'guillotine', 'armbar', "d'arce choke", 'anaconda choke', 'technical mount to back']
  },
  {
    title: 'Armbar-entry setups',
    lane: 'Submission',
    summary: 'Isolate the arm first, then choose the best armbar lane.',
    description:
      'This family is for building into the armbar through shoulder crunches, mount isolation, kimura-trap style control, and gift-wrap transitions that open the armbar, triangle, or back-take chain.',
    setupNodes: ['Shoulder Crunch', 'Mount Isolation', 'Kimura Trap', 'Gift Wrap'],
    nextAttacks: ['Straight Armbar From Guard', 'Straight Armbar From Mount', 'Choi Bar', 'Mounted Triangle'],
    exampleSequence: [
      'Shoulder crunch',
      'Elbow stays isolated',
      'Choi Bar / armbar lane',
      'They posture awkwardly',
      'Triangle / sweep continuation'
    ],
    curriculumSearch: 'armbar',
    treeSearch: 'armbar',
    relatedTerms: ['armbar', 'straight armbar from guard', 'straight armbar from mount', 'choi bar', 'mounted triangle', 'kimura trap', 'gift wrap']
  }
];

export const getEntrySetupFamilySlug = (title) => (
  normalizeValue(title).replace(/\s+/g, '-')
);

export const buildEntrySetupsLink = (familyTitle) => (
  `/entry-setups?family=${encodeURIComponent(familyTitle)}`
);

export const buildEntrySetupsDecisionTreeLink = (family) => (
  `/decision-tree?search=${encodeURIComponent(family.treeSearch)}&setupFamily=${encodeURIComponent(family.title)}`
);

export const findRelatedSetupFamilies = (entryName) => {
  const normalizedEntryName = normalizeValue(entryName);

  if (!normalizedEntryName) {
    return [];
  }

  return setupFamilies.filter((family) => (
    family.relatedTerms?.some((term) => normalizeValue(term) === normalizedEntryName)
  ));
};
