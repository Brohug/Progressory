const createOffenseOption = (allowedCategories = ['Submissions'], extras = {}) => ({
  label: 'Offense',
  preserveSearch: true,
  allowedCategories,
  ...extras
});

const createDefenseOption = (allowedCategories = ['Submission Defense', 'Escapes'], extras = {}) => ({
  label: 'Defense',
  preserveSearch: true,
  allowedCategories,
  ...extras
});

const createPositionOption = (
  label,
  requiredTerms,
  allowedCategories = ['Submissions', 'Positions'],
  focusName = null
) => ({
  label,
  preserveSearch: true,
  enterTree: true,
  focusName,
  requiredTerms: Array.isArray(requiredTerms) ? requiredTerms : [requiredTerms],
  allowedCategories
});

const createPositionsPrompt = (question, options) => ({
  label: 'Positions',
  nextPrompt: {
    question,
    options
  }
});

const createOffenseDefensePositionsPrompt = ({
  matches,
  question,
  offenseCategories = ['Submissions'],
  defenseCategories = ['Submission Defense', 'Escapes'],
  positionsQuestion,
  positionOptions
}) => ({
  matches,
  question,
  options: [
    createOffenseOption(offenseCategories),
    createDefenseOption(defenseCategories),
    createPositionsPrompt(positionsQuestion, positionOptions)
  ]
});

const sharedBroadSearchPromptConfig = [
  createOffenseDefensePositionsPrompt({
    matches: ['armbar'],
    question: 'Do you want offense, defense, or the main positions for the armbar family?',
    positionsQuestion: 'Which armbar position do you want to focus on?',
    positionOptions: [
      createPositionOption('From guard', 'guard', ['Submissions', 'Positions'], 'Closed Guard'),
      createPositionOption('From mount', 'mount', ['Submissions', 'Positions'], 'Mount'),
      createPositionOption('From side control', 'side control', ['Submissions', 'Positions'], 'Side Control')
    ]
  }),
  createOffenseDefensePositionsPrompt({
    matches: ['kimura'],
    question: 'Do you want offense, defense, or the main kimura positions?',
    positionsQuestion: 'Which kimura position do you want to focus on?',
    positionOptions: [
      createPositionOption('Closed guard', 'closed guard', ['Submissions', 'Positions'], 'Closed Guard'),
      createPositionOption('Side control', 'side control', ['Submissions', 'Positions'], 'Side Control'),
      createPositionOption('Top half guard', 'top half guard', ['Submissions', 'Positions'], 'Top Half Guard')
    ]
  }),
  createOffenseDefensePositionsPrompt({
    matches: ['americana'],
    question: 'Do you want offense, defense, or the main americana positions?',
    positionsQuestion: 'Which americana position do you want to focus on?',
    positionOptions: [
      createPositionOption('Side control', 'side control', ['Submissions', 'Positions'], 'Side Control'),
      createPositionOption('Mount', 'mount', ['Submissions', 'Positions'], 'Mount')
    ]
  }),
  createOffenseDefensePositionsPrompt({
    matches: ['choi bar', 'choibar'],
    question: 'Do you want offense, defense, or the main positions that feed the Choi Bar?',
    positionsQuestion: 'Which Choi Bar position do you want to focus on?',
    positionOptions: [
      createPositionOption('Shoulder crunch', 'shoulder crunch', ['Submissions', 'Positions'], 'Shoulder Crunch'),
      createPositionOption('Butterfly half', 'butterfly half', ['Submissions', 'Positions'], 'Butterfly Half'),
      createPositionOption('Closed guard', 'closed guard', ['Submissions', 'Positions'], 'Closed Guard')
    ]
  }),
  {
    matches: ['lachy lock', 'lachy'],
    question: 'Do you want offense, defense, or the main positions around the Lachy Lock?',
    options: [
      createOffenseOption(['Leg Locks', 'Submissions'], {
        resultNames: ['Lachy Lock', 'Inside Heel Hook', 'Outside Heel Hook', 'Kneebar', 'Toe Hold', 'Mikey Lock']
      }),
      createDefenseOption(['Submission Defense', 'Escapes'], {
        searchValue: 'heel hook line defense',
        resultNames: ['Heel Hook Line Defense', 'Straight Ankle Lock Boot Defense', 'Toe Hold Escape', 'Aoki Lock Escape', 'Kneebar Turn Defense']
      }),
      createPositionsPrompt('Which Lachy Lock position do you want to focus on?', [
        createPositionOption('Backside 50/50', 'backside 50/50', ['Positions', 'Leg Locks'], 'Backside 50/50'),
        createPositionOption('70/30', '70/30', ['Positions', 'Leg Locks'], '70/30'),
        createPositionOption('50/50', '50/50', ['Positions', 'Leg Locks'], '50/50')
      ])
    ]
  },
  createOffenseDefensePositionsPrompt({
    matches: ['junny lock', 'junny'],
    question: 'Do you want offense, defense, or the main positions around the Junny Lock?',
    offenseCategories: ['Leg Locks', 'Submissions'],
    positionsQuestion: 'Which Junny Lock position do you want to focus on?',
    positionOptions: [
      createPositionOption('Saddle', 'saddle', ['Positions', 'Leg Locks'], 'Saddle'),
      createPositionOption('Backside 50/50', 'backside 50/50', ['Positions', 'Leg Locks'], 'Backside 50/50')
    ]
  }),
  createOffenseDefensePositionsPrompt({
    matches: ['abe lock', 'abe'],
    question: 'Do you want offense, defense, or the main positions around the Abe Lock?',
    offenseCategories: ['Leg Locks', 'Submissions'],
    positionsQuestion: 'Which Abe Lock position do you want to focus on?',
    positionOptions: [
      createPositionOption('Outside Ashi', 'outside ashi', ['Positions', 'Leg Locks'], 'Outside Ashi'),
      createPositionOption('50/50', '50/50', ['Positions', 'Leg Locks'], '50/50')
    ]
  }),
  createOffenseDefensePositionsPrompt({
    matches: ['mikey lock', 'mikey'],
    question: 'Do you want offense, defense, or the main positions around the Mikey Lock?',
    offenseCategories: ['Leg Locks', 'Submissions'],
    positionsQuestion: 'Which Mikey Lock position do you want to focus on?',
    positionOptions: [
      createPositionOption('50/50', '50/50', ['Positions', 'Leg Locks'], '50/50'),
      createPositionOption('Outside Ashi', 'outside ashi', ['Positions', 'Leg Locks'], 'Outside Ashi')
    ]
  }),
  createOffenseDefensePositionsPrompt({
    matches: ['aoki lock', 'aoki'],
    question: 'Do you want offense, defense, or the main positions around the Aoki Lock?',
    offenseCategories: ['Leg Locks', 'Submissions'],
    positionsQuestion: 'Which Aoki Lock position do you want to focus on?',
    positionOptions: [
      createPositionOption('Single-Leg X', 'single-leg x', ['Positions', 'Leg Locks'], 'Single-Leg X'),
      createPositionOption('Ashi Garami', 'ashi garami', ['Positions', 'Leg Locks'], 'Ashi Garami')
    ]
  }),
  createOffenseDefensePositionsPrompt({
    matches: ['toe hold'],
    question: 'Do you want offense, defense, or the main positions around the toe hold?',
    offenseCategories: ['Leg Locks', 'Submissions'],
    positionsQuestion: 'Which toe-hold position do you want to focus on?',
    positionOptions: [
      createPositionOption('50/50', '50/50', ['Positions', 'Leg Locks'], '50/50'),
      createPositionOption('Saddle', 'saddle', ['Positions', 'Leg Locks'], 'Saddle')
    ]
  }),
  createOffenseDefensePositionsPrompt({
    matches: ['kneebar'],
    question: 'Do you want offense, defense, or the main positions around the kneebar?',
    offenseCategories: ['Leg Locks', 'Submissions'],
    positionsQuestion: 'Which kneebar position do you want to focus on?',
    positionOptions: [
      createPositionOption('Saddle', 'saddle', ['Positions', 'Leg Locks'], 'Saddle'),
      createPositionOption('Cross Ashi', 'cross ashi', ['Positions', 'Leg Locks'], 'Cross Ashi')
    ]
  }),
  createOffenseDefensePositionsPrompt({
    matches: ['straight ankle lock', 'ankle lock'],
    question: 'Do you want offense, defense, or the main positions around the straight ankle lock?',
    offenseCategories: ['Leg Locks', 'Submissions'],
    positionsQuestion: 'Which straight-ankle-lock position do you want to focus on?',
    positionOptions: [
      createPositionOption('Single-Leg X', 'single-leg x', ['Positions', 'Leg Locks'], 'Single-Leg X'),
      createPositionOption('Ashi Garami', 'ashi garami', ['Positions', 'Leg Locks'], 'Ashi Garami')
    ]
  }),
  {
    matches: ['inside heel hook'],
    question: 'Do you want offense, defense, or the main positions around the inside heel hook?',
    options: [
      createOffenseOption(['Leg Locks', 'Submissions']),
      createDefenseOption(['Submission Defense', 'Escapes'], {
        searchValue: 'heel hook line defense',
        resultNames: [
          'Heel Hook Line Defense',
          'Kneebar Turn Defense',
          'Leg Lock Defense'
        ]
      }),
      createPositionsPrompt('Which inside-heel-hook position do you want to focus on?', [
        createPositionOption('Saddle / Cross Ashi', ['saddle', 'cross ashi'], ['Positions', 'Leg Locks'], 'Saddle'),
        createPositionOption('50/50', '50/50', ['Positions', 'Leg Locks'], '50/50')
      ])
    ]
  },
  createOffenseDefensePositionsPrompt({
    matches: ['outside heel hook'],
    question: 'Do you want offense, defense, or the main positions around the outside heel hook?',
    offenseCategories: ['Leg Locks', 'Submissions'],
    positionsQuestion: 'Which outside-heel-hook position do you want to focus on?',
    positionOptions: [
      createPositionOption('Cross Ashi', 'cross ashi', ['Positions', 'Leg Locks'], 'Cross Ashi'),
      createPositionOption('Outside Ashi', 'outside ashi', ['Positions', 'Leg Locks'], 'Outside Ashi')
    ]
  }),
  createOffenseDefensePositionsPrompt({
    matches: ['triangle choke', 'triangle'],
    question: 'Do you want offense, defense, or the main triangle positions?',
    positionsQuestion: 'Which triangle position do you want to focus on?',
    positionOptions: [
      createPositionOption('Closed guard', 'closed guard', ['Submissions', 'Positions'], 'Closed Guard'),
      createPositionOption('Mounted triangle', 'mounted triangle', ['Submissions', 'Positions'], 'Mounted Triangle')
    ]
  }),
  createOffenseDefensePositionsPrompt({
    matches: ['omoplata'],
    question: 'Do you want offense, defense, or the main omoplata positions?',
    positionsQuestion: 'Which omoplata position do you want to focus on?',
    positionOptions: [
      createPositionOption('Closed guard', 'closed guard', ['Submissions', 'Positions'], 'Closed Guard'),
      createPositionOption('Triangle position', 'triangle position', ['Submissions', 'Positions'], 'Triangle Position')
    ]
  }),
  createOffenseDefensePositionsPrompt({
    matches: ['guillotine'],
    question: 'Do you want offense, defense, or the main guillotine positions?',
    positionsQuestion: 'Which guillotine position do you want to focus on?',
    positionOptions: [
      createPositionOption('Front headlock', 'front headlock', ['Submissions', 'Positions'], 'Front Headlock'),
      createPositionOption('Closed guard', 'closed guard', ['Submissions', 'Positions'], 'Closed Guard')
    ]
  }),
  {
    matches: ['arm triangle'],
    question: 'Do you want offense, defense, or the main arm-triangle positions?',
    options: [
      createOffenseOption(['Submissions'], {
        blockedNames: ['Body Triangle Rib Compression']
      }),
      createDefenseOption(['Submission Defense', 'Escapes'], {
        searchValue: 'head and arm choke defense'
      }),
      createPositionsPrompt('Which arm-triangle position do you want to focus on?', [
        createPositionOption('Mount', 'mount', ['Submissions', 'Positions'], 'Mount'),
        createPositionOption('Side control', 'side control', ['Submissions', 'Positions'], 'Side Control')
      ])
    ]
  },
  createOffenseDefensePositionsPrompt({
    matches: ['short choke'],
    question: 'Do you want offense, defense, or the main short-choke positions?',
    positionsQuestion: 'Which short-choke position do you want to focus on?',
    positionOptions: [
      createPositionOption('Back control', 'back control'),
      createPositionOption('Seatbelt', 'seatbelt')
    ]
  }),
  createOffenseDefensePositionsPrompt({
    matches: ['cross collar choke', 'cross collar'],
    question: 'Do you want offense, defense, or the main cross-collar-choke positions?',
    positionsQuestion: 'Which cross-collar-choke position do you want to focus on?',
    positionOptions: [
      createPositionOption('Closed guard', 'closed guard'),
      createPositionOption('Mount', 'mount')
    ]
  }),
  {
    matches: ['kimura trap'],
    question: 'Do you want offense, defense, or the main positions around the kimura trap?',
    options: [
      { label: 'Offense', value: 'kimura trap', allowedCategories: ['Positions', 'Submissions'], focusName: 'Kimura Trap' },
      { label: 'Defense', value: 'kimura', allowedCategories: ['Submission Defense', 'Escapes'] },
      { label: 'Side control', value: 'side control', allowedCategories: ['Positions', 'Submissions'], focusName: 'Side Control' },
      { label: 'Top half guard', value: 'top half guard', allowedCategories: ['Positions', 'Submissions'], focusName: 'Top Half Guard' }
    ]
  },
  createOffenseDefensePositionsPrompt({
    matches: ['rear naked choke', 'rear naked', 'rnc'],
    question: 'Do you want offense, defense, or the main rear-naked-choke positions?',
    positionsQuestion: 'Which rear-naked-choke position do you want to focus on?',
    positionOptions: [
      createPositionOption('Back control', 'back control'),
      createPositionOption('Straightjacket control', 'straightjacket control')
    ]
  }),
  {
    matches: ['bow and arrow', 'bow & arrow'],
    question: 'Do you want offense, defense, or the main positions around the bow and arrow choke?',
    options: [
      { label: 'Offense', value: 'bow and arrow choke', allowedCategories: ['Submissions'] },
      { label: 'Defense', value: 'bow and arrow hand-fight defense', allowedCategories: ['Submission Defense', 'Escapes'] },
      { label: 'Back control', value: 'back control', allowedCategories: ['Positions', 'Submissions'] },
      { label: 'Back mount', value: 'back mount', allowedCategories: ['Positions', 'Submissions'] }
    ]
  },
  createOffenseDefensePositionsPrompt({
    matches: ['back take', 'back takes', 'back control'],
    question: 'Do you want offense, defense, or the main back-control positions?',
    offenseCategories: ['Positions', 'Submissions'],
    positionsQuestion: 'Which back-control position do you want to focus on?',
    positionOptions: [
      createPositionOption('Seatbelt', 'seatbelt'),
      createPositionOption('Crab ride', 'crab ride')
    ]
  }),
  createOffenseDefensePositionsPrompt({
    matches: ['front headlock'],
    question: 'Do you want offense, defense, or the main front-headlock positions?',
    offenseCategories: ['Positions', 'Submissions'],
    positionsQuestion: 'Which front-headlock position do you want to focus on?',
    positionOptions: [
      createPositionOption('Guillotine position', 'guillotine position'),
      createPositionOption('Sprawl front headlock', 'sprawl front headlock')
    ]
  }),
  createOffenseDefensePositionsPrompt({
    matches: ["d'arce", 'd arce', 'darce'],
    question: 'Do you want offense, defense, or the main D\'Arce positions?',
    positionsQuestion: 'Which D\'Arce position do you want to focus on?',
    positionOptions: [
      createPositionOption('Front headlock', 'front headlock', ['Submissions', 'Positions'], 'Front Headlock'),
      createPositionOption('Top half guard', 'top half guard', ['Submissions', 'Positions'], 'Top Half Guard')
    ]
  }),
  createOffenseDefensePositionsPrompt({
    matches: ['anaconda'],
    question: 'Do you want offense, defense, or the main anaconda positions?',
    positionsQuestion: 'Which anaconda position do you want to focus on?',
    positionOptions: [
      createPositionOption('Front headlock', 'front headlock'),
      createPositionOption('Sprawl front headlock', 'sprawl front headlock')
    ]
  }),
  {
    matches: ['guard'],
    question: 'Do you want offense, defense, or a specific guard family?',
    options: [
      { label: 'Guard passing', value: 'guard passing' },
      { label: 'Guard retention', value: 'guard retention' },
      { label: 'Open guard', value: 'open guard' },
      { label: 'Half guard', value: 'half guard' }
    ]
  },
  {
    matches: ['scissor sweep'],
    question: 'Do you want offense, defense, or the main positions around the scissor sweep?',
    options: [
      { label: 'Offense', value: 'scissor sweep', allowedCategories: ['Sweeps'], focusName: 'Scissor Sweep' },
      { label: 'Defense', value: 'posting', allowedCategories: ['Positions'], focusName: 'Posting' },
      { label: 'Closed guard', value: 'closed guard', allowedCategories: ['Sweeps', 'Positions'], focusName: 'Closed Guard' }
    ]
  },
  {
    matches: ['sweep', 'sweeps'],
    question: 'Do you want an offensive sweep family, a defensive angle, or a starting position?',
    options: [
      { label: 'Closed guard sweeps', value: 'closed guard sweeps' },
      { label: 'Sweep defense', value: 'posting base posture', allowedCategories: ['Positions', 'Escapes', 'Submission Defense'] },
      { label: 'Butterfly sweeps', value: 'butterfly sweeps' },
      { label: 'Half guard sweeps', value: 'half guard sweeps' }
    ]
  },
  {
    matches: ['single leg'],
    question: 'Do you want offense, defense, entry setups, or the main single-leg position?',
    options: [
      createOffenseOption(['Takedowns']),
      {
        label: 'Defense',
        nextPrompt: {
          question: 'Which single-leg defense branch do you want to focus on?',
          options: [
            createPositionOption('Sprawl', 'sprawl', ['Takedowns', 'Positions', 'Escapes'], 'Sprawl'),
            createPositionOption('Overhook / whizzer', 'overhook', ['Takedowns', 'Positions', 'Escapes'], 'Overhook'),
            createPositionOption('Front headlock counter', 'front headlock', ['Takedowns', 'Positions', 'Escapes'], 'Front Headlock'),
            createPositionOption('Go-behind counter', 'go-behind', ['Takedowns', 'Positions', 'Escapes'], 'Go-Behind Position')
          ]
        }
      },
      {
        label: 'Entry setups',
        nextPrompt: {
          question: 'Which single-leg setup branch do you want to focus on?',
          options: [
            createPositionOption('Collar tie', 'collar tie', ['Positions', 'Takedowns'], 'Collar Tie'),
            createPositionOption('Inside tie', 'inside tie', ['Positions', 'Takedowns'], 'Inside Tie'),
            createPositionOption('Russian tie', 'russian tie standing', ['Positions', 'Takedowns'], 'Russian Tie Standing'),
            createPositionOption('Sweep single', 'sweep single', ['Positions', 'Takedowns'], 'Sweep Single')
          ]
        }
      },
      createPositionOption('Single leg position', 'single leg position', ['Positions', 'Takedowns'], 'Single Leg Position')
    ]
  },
  {
    matches: ['double leg'],
    question: 'Do you want offense, defense, or the main positions around the double leg?',
    options: [
      { label: 'Offense', value: 'double leg', allowedCategories: ['Takedowns'] },
      { label: 'Defense', value: 'sprawl posting overhook', allowedCategories: ['Takedowns', 'Positions', 'Escapes'] },
      { label: 'Standing', value: 'standing', allowedCategories: ['Positions', 'Takedowns'] },
      { label: 'Collar tie', value: 'collar tie', allowedCategories: ['Positions', 'Takedowns'] }
    ]
  },
  {
    matches: ['ankle pick'],
    question: 'Do you want offense, defense, or the main positions around the ankle pick?',
    options: [
      { label: 'Offense', value: 'ankle pick', allowedCategories: ['Takedowns'] },
      { label: 'Defense', value: 'posture posting sprawl', allowedCategories: ['Takedowns', 'Positions', 'Escapes'] },
      { label: 'Standing', value: 'standing', allowedCategories: ['Positions', 'Takedowns'] },
      { label: 'Collar tie', value: 'collar tie', allowedCategories: ['Positions', 'Takedowns'] }
    ]
  },
  {
    matches: ['body lock takedown', 'body lock'],
    question: 'Do you want offense, defense, or the main positions around the body lock takedown?',
    options: [
      { label: 'Offense', value: 'body lock takedown', allowedCategories: ['Takedowns'] },
      { label: 'Defense', value: 'pummeling base posture', allowedCategories: ['Takedowns', 'Positions', 'Escapes'] },
      { label: 'Clinch', value: 'clinch', allowedCategories: ['Positions', 'Takedowns'] },
      { label: 'Body lock standing', value: 'body lock standing', allowedCategories: ['Positions', 'Takedowns'] }
    ]
  },
  {
    matches: ['takedown', 'takedowns'],
    question: 'Do you want offense, defense, or a takedown style?',
    options: [
      { label: 'Takedown offense', value: 'takedown', allowedCategories: ['Takedowns'] },
      { label: 'Takedown defense', value: 'sprawl', allowedCategories: ['Takedowns', 'Positions', 'Escapes'], focusName: 'Sprawl' },
      { label: 'Single leg', value: 'single leg' },
      { label: 'Judo throws', value: 'judo throws' }
    ]
  },
  {
    matches: ['leg lock', 'leg locks', 'heel hook', 'ankle lock', 'toe hold', 'kneebar'],
    question: 'Do you want attacks, defenses, or a safer starting point?',
    options: [
      { label: 'Leg lock attacks', value: 'inside heel hook', allowedCategories: ['Leg Locks', 'Submissions'] },
      { label: 'Leg lock defense', value: 'leg lock defense', allowedCategories: ['Escapes', 'Submission Defense'], focusName: 'Leg Lock Defense' },
      { label: 'Straight ankle lock', value: 'straight ankle lock', focusName: 'Straight Ankle Lock' },
      { label: 'Heel hook defense', value: 'heel hook line defense', focusName: 'Heel Hook Line Defense' }
    ]
  },
  {
    matches: ['ashi garami', 'ashi'],
    question: 'Do you want offense, defense, or the main positions around ashi garami?',
    options: [
      { label: 'Offense', value: 'ashi garami', allowedCategories: ['Positions', 'Leg Locks', 'Submissions'] },
      { label: 'Defense', value: 'leg lock defense', allowedCategories: ['Submission Defense', 'Escapes'] },
      { label: 'Single-Leg X', value: 'single-leg x', allowedCategories: ['Positions', 'Leg Locks'] },
      { label: 'Cross Ashi', value: 'cross ashi', allowedCategories: ['Positions', 'Leg Locks'] }
    ]
  },
  {
    matches: ['saddle'],
    question: 'Do you want offense, defense, or the main positions around the saddle?',
    options: [
      { label: 'Offense', value: 'saddle', allowedCategories: ['Positions', 'Leg Locks', 'Submissions'] },
      { label: 'Defense', value: 'leg lock defense', allowedCategories: ['Submission Defense', 'Escapes'] },
      { label: 'Backside 50/50', value: 'backside 50/50', allowedCategories: ['Positions', 'Leg Locks'] },
      { label: 'Cross Ashi', value: 'cross ashi', allowedCategories: ['Positions', 'Leg Locks'] }
    ]
  },
  {
    matches: ['50/50', 'backside 50/50'],
    question: 'Do you want offense, defense, or the main positions around 50/50?',
    options: [
      { label: 'Offense', value: '50/50', allowedCategories: ['Positions', 'Leg Locks', 'Submissions'] },
      { label: 'Defense', value: 'leg lock defense', allowedCategories: ['Submission Defense', 'Escapes'] },
      { label: 'Backside 50/50', value: 'backside 50/50', allowedCategories: ['Positions', 'Leg Locks'] },
      { label: 'Saddle', value: 'saddle', allowedCategories: ['Positions', 'Leg Locks'] }
    ]
  }
];

export const findGuidedSearchPrompt = (normalizedSearch) => {
  if (!normalizedSearch) {
    return null;
  }

  return sharedBroadSearchPromptConfig.find((prompt) => (
    prompt.matches.some((term) => (
      normalizedSearch === term
      || normalizedSearch.includes(term)
      || term.includes(normalizedSearch)
    ))
  )) || null;
};

const setupFamilyPromptConfig = {
  'standing hand-fight setups': {
    question: 'Which standing hand-fight setup branch do you want to continue from?',
    options: [
      { label: 'Collar tie', value: 'collar tie', allowedCategories: ['Grip Fighting', 'Positions', 'Takedowns'] },
      { label: 'Inside tie', value: 'inside tie', allowedCategories: ['Grip Fighting', 'Positions', 'Takedowns'] },
      { label: 'Russian tie', value: 'russian tie standing', allowedCategories: ['Grip Fighting', 'Positions', 'Takedowns'] },
      { label: 'Two-on-one', value: 'two-on-one standing', allowedCategories: ['Grip Fighting', 'Positions', 'Takedowns'] },
      { label: 'Snap down', value: 'snap down', allowedCategories: ['Grip Fighting', 'Positions', 'Takedowns'] }
    ]
  },
  'single-leg setup chains': {
    question: 'Which single-leg setup branch do you want to continue from?',
    options: [
      {
        label: 'Head touch + level change',
        nextPrompt: {
          question: 'What reaction did that setup create?',
          options: [
            { label: 'They step', value: 'ankle pick', enterTree: true, focusName: 'Ankle Pick', allowedCategories: ['Takedowns'] },
            { label: 'They stay tall', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'They sprawl', value: 'front headlock', enterTree: true, focusName: 'Front Headlock', allowedCategories: ['Positions', 'Submissions'] },
            { label: 'Circle to back', value: 'go-behind position', enterTree: true, focusName: 'Go-Behind Position', allowedCategories: ['Back Takes', 'Positions', 'Takedowns'] }
          ]
        }
      },
      { label: 'Sweep single', value: 'sweep single', allowedCategories: ['Takedowns', 'Positions'] },
      { label: 'Russian tie to single', value: 'russian tie to single', allowedCategories: ['Takedowns', 'Grip Fighting'] },
      { label: 'Head-inside single', value: 'head-inside single', allowedCategories: ['Takedowns'] },
      { label: 'Head-outside single', value: 'head-outside single', allowedCategories: ['Takedowns'] }
    ]
  },
  'front headlock setup chains': {
    question: 'Which front-headlock setup branch do you want to continue from?',
    options: [
      {
        label: 'Snap down',
        nextPrompt: {
          question: 'What reaction did the snap down create?',
          options: [
            { label: 'Head drops cleanly', value: 'front headlock', enterTree: true, focusName: 'Front Headlock', allowedCategories: ['Positions', 'Submissions'] },
            { label: 'They posture back up', value: 'go-behind position', enterTree: true, focusName: 'Go-Behind Position', allowedCategories: ['Back Takes', 'Positions', 'Takedowns'] },
            { label: 'They square to knees', value: 'turtle', enterTree: true, focusName: 'Turtle', allowedCategories: ['Positions', 'Back Takes'] },
            { label: 'Neck stays exposed', value: 'guillotine', enterTree: true, focusName: 'Guillotine', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Snap down to front headlock', value: 'snap down to front headlock', allowedCategories: ['Takedowns', 'Positions'] },
      {
        label: 'Sprawl',
        nextPrompt: {
          question: 'What continuation do you want from the sprawl?',
          options: [
            { label: 'Front headlock', value: 'front headlock', enterTree: true, focusName: 'Front Headlock', allowedCategories: ['Positions', 'Submissions'] },
            { label: 'Spin behind', value: 'front headlock to spin behind', enterTree: true, focusName: 'Front Headlock To Spin Behind', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Go-behind', value: 'go-behind position', enterTree: true, focusName: 'Go-Behind Position', allowedCategories: ['Back Takes', 'Positions', 'Takedowns'] },
            { label: 'Turtle attack', value: 'turtle', enterTree: true, focusName: 'Turtle', allowedCategories: ['Positions', 'Back Takes'] }
          ]
        }
      },
      { label: 'Front headlock standing', value: 'front headlock standing', allowedCategories: ['Positions', 'Takedowns'] }
    ]
  },
  'rear-angle and drag setups': {
    question: 'Which rear-angle setup branch do you want to continue from?',
    options: [
      {
        label: 'Arm drag to back take',
        nextPrompt: {
          question: 'What did the arm drag open up?',
          options: [
            { label: 'Back exposure', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Rear body lock', value: 'rear body lock standing', enterTree: true, focusName: 'Rear Body Lock Standing', allowedCategories: ['Positions', 'Takedowns'] },
            { label: 'Single leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Mat return', value: 'rear body lock mat return', enterTree: true, focusName: 'Rear Body Lock Mat Return', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      {
        label: 'Duck under',
        nextPrompt: {
          question: 'What continuation do you want from the duck under?',
          options: [
            { label: 'Rear angle', value: 'duck under rear angle', enterTree: true, focusName: 'Duck Under Rear Angle', allowedCategories: ['Positions', 'Back Takes'] },
            { label: 'Back control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Single leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Mat return', value: 'rear body lock mat return', enterTree: true, focusName: 'Rear Body Lock Mat Return', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      { label: 'Collar drag', value: 'collar drag', allowedCategories: ['Takedowns', 'Sweeps', 'Grip Fighting'] },
      { label: 'Arm drag rear angle', value: 'arm drag rear angle', allowedCategories: ['Positions', 'Back Takes'] }
    ]
  },
  'body-lock entry setups': {
    question: 'Which body-lock setup branch do you want to continue from?',
    options: [
      {
        label: 'Underhook pressure',
        nextPrompt: {
          question: 'What reaction did the underhook pressure create?',
          options: [
            { label: 'They square up', value: 'body lock takedown', enterTree: true, focusName: 'Body Lock Takedown', allowedCategories: ['Takedowns'] },
            { label: 'They hips back', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'They turn away', value: 'rear body lock standing', enterTree: true, focusName: 'Rear Body Lock Standing', allowedCategories: ['Positions', 'Takedowns'] },
            { label: 'They keep standing', value: 'rear body lock mat return', enterTree: true, focusName: 'Rear Body Lock Mat Return', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      {
        label: 'Elbow pull to clamp',
        nextPrompt: {
          question: 'What did the elbow pull open up?',
          options: [
            { label: 'Body lock clamps up', value: 'body lock takedown', enterTree: true, focusName: 'Body Lock Takedown', allowedCategories: ['Takedowns'] },
            { label: 'They hips back', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'They turn the corner away', value: 'rear body lock standing', enterTree: true, focusName: 'Rear Body Lock Standing', allowedCategories: ['Positions', 'Takedowns'] },
            { label: 'They stay upright', value: 'rear body lock mat return', enterTree: true, focusName: 'Rear Body Lock Mat Return', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      {
        label: 'Duck under to rear body lock',
        nextPrompt: {
          question: 'What continuation do you want from the rear body lock?',
          options: [
            { label: 'Mat return', value: 'rear body lock mat return', enterTree: true, focusName: 'Rear Body Lock Mat Return', allowedCategories: ['Takedowns'] },
            { label: 'Back control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Single leg finish', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Stay on the body lock', value: 'rear body lock standing', enterTree: true, focusName: 'Rear Body Lock Standing', allowedCategories: ['Positions', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Turn-the-corner body lock',
        nextPrompt: {
          question: 'What continuation do you want once the body lock connects?',
          options: [
            { label: 'Stay chest-to-chest', value: 'body lock takedown', enterTree: true, focusName: 'Body Lock Takedown', allowedCategories: ['Takedowns'] },
            { label: 'They turn away', value: 'rear body lock standing', enterTree: true, focusName: 'Rear Body Lock Standing', allowedCategories: ['Positions', 'Takedowns'] },
            { label: 'They keep standing', value: 'rear body lock mat return', enterTree: true, focusName: 'Rear Body Lock Mat Return', allowedCategories: ['Takedowns'] },
            { label: 'Leg comes light', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] }
          ]
        }
      }
    ]
  },
  'guard wrestle-up setups': {
    question: 'Which wrestle-up setup branch do you want to continue from?',
    options: [
      {
        label: 'Shin-to-shin',
        nextPrompt: {
          question: 'What reaction did the shin-to-shin setup create?',
          options: [
            { label: 'They stay posted', value: 'single-leg from seated guard', enterTree: true, focusName: 'Single-Leg From Seated Guard', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'They drift high', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'They retreat', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Leg line opens', value: 'single-leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Positions', 'Sweeps', 'Leg Locks'] }
          ]
        }
      },
      {
        label: 'Seated guard',
        nextPrompt: {
          question: 'What continuation do you want from seated guard?',
          options: [
            { label: 'Come up on the leg', value: 'single-leg from seated guard', enterTree: true, focusName: 'Single-Leg From Seated Guard', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Wrestle up', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Ankle pick', value: 'seated ankle pick sweep', enterTree: true, focusName: 'Seated Ankle Pick Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Arm drag to rear angle', value: 'arm drag to rear sweep', enterTree: true, focusName: 'Arm Drag To Rear Sweep', allowedCategories: ['Sweeps', 'Back Takes'] }
          ]
        }
      },
      { label: 'Underhook half guard', value: 'underhook half guard', allowedCategories: ['Positions', 'Sweeps'] },
      { label: 'Butterfly guard', value: 'butterfly guard', allowedCategories: ['Positions', 'Sweeps'] }
    ]
  },
  'closed-guard attack setups': {
    question: 'Which closed-guard attack setup branch do you want to continue from?',
    options: [
      {
        label: 'Collar pull',
        nextPrompt: {
          question: 'What reaction did the collar pull create?',
          options: [
            { label: 'Posture breaks', value: 'scissor sweep', enterTree: true, focusName: 'Scissor Sweep', allowedCategories: ['Sweeps'] },
            { label: 'They post the hand', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Elbow line opens', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Arm extends', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Shoulder crunch',
        nextPrompt: {
          question: 'What attack do you want from shoulder crunch control?',
          options: [
            { label: 'Choi Bar', value: 'choi bar', enterTree: true, focusName: 'Choi Bar', allowedCategories: ['Submissions'] },
            { label: 'Triangle', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Armbar', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Sweep', value: 'shoulder crunch butterfly sweep', enterTree: true, focusName: 'Shoulder Crunch Butterfly Sweep', allowedCategories: ['Sweeps'] }
          ]
        }
      },
      { label: 'Hip bump threat', value: 'kimura', allowedCategories: ['Sweeps', 'Submissions'] },
      { label: 'Overhook clamp', value: 'triangle choke', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'passing setup chains': {
    question: 'Which passing setup branch do you want to continue from?',
    options: [
      {
        label: 'Grip break',
        nextPrompt: {
          question: 'What opening did the grip break create?',
          options: [
            { label: 'Knee line opens', value: 'knee cut', enterTree: true, focusName: 'Knee Cut', allowedCategories: ['Passing'] },
            { label: 'Legs separate', value: 'torreando pass', enterTree: true, focusName: 'Torreando Pass', allowedCategories: ['Passing'] },
            { label: 'Leg drag lane opens', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing'] },
            { label: 'Body lock lane opens', value: 'body lock pass', enterTree: true, focusName: 'Body Lock Pass', allowedCategories: ['Passing'] }
          ]
        }
      },
      {
        label: 'Leg pin',
        nextPrompt: {
          question: 'What continuation do you want from the leg pin?',
          options: [
            { label: 'Knee cut', value: 'knee cut', enterTree: true, focusName: 'Knee Cut', allowedCategories: ['Passing'] },
            { label: 'Leg drag', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing'] },
            { label: 'Staple pass', value: 'staple pass', enterTree: true, focusName: 'Staple Pass', allowedCategories: ['Passing'] },
            { label: 'Shin pin pass', value: 'shin pin pass', enterTree: true, focusName: 'Shin Pin Pass', allowedCategories: ['Passing'] }
          ]
        }
      },
      {
        label: 'Headquarters',
        nextPrompt: {
          question: 'What continuation do you want from headquarters?',
          options: [
            { label: 'Knee cut', value: 'knee cut', enterTree: true, focusName: 'Knee Cut', allowedCategories: ['Passing'] },
            { label: 'Leg drag', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing'] },
            { label: 'Backstep', value: 'backstep half guard pass', enterTree: true, focusName: 'Backstep Half Guard Pass', allowedCategories: ['Passing'] },
            { label: 'Float pass', value: 'float pass', enterTree: true, focusName: 'Float Pass', allowedCategories: ['Passing'] }
          ]
        }
      },
      {
        label: 'Body lock standing',
        nextPrompt: {
          question: 'What continuation do you want from the body-lock setup?',
          options: [
            { label: 'Body lock pass', value: 'body lock pass', enterTree: true, focusName: 'Body Lock Pass', allowedCategories: ['Passing'] },
            { label: 'Half guard smash pass', value: 'half guard smash pass', enterTree: true, focusName: 'Half Guard Smash Pass', allowedCategories: ['Passing'] },
            { label: 'Hip smash pass', value: 'hip smash pass', enterTree: true, focusName: 'Hip Smash Pass', allowedCategories: ['Passing'] },
            { label: 'Pass to knee on belly', value: 'pass to knee on belly', enterTree: true, focusName: 'Pass To Knee On Belly', allowedCategories: ['Passing'] }
          ]
        }
      }
    ]
  },
  'half-guard passing setups': {
    question: 'Which half-guard passing setup branch do you want to continue from?',
    options: [
      {
        label: 'Near-side arm pin',
        nextPrompt: {
          question: 'What opening did the near-side arm pin create?',
          options: [
            { label: 'Far-side arm reaches', value: 'crossface underhook half guard pass', enterTree: true, focusName: 'Crossface Underhook Half Guard Pass', allowedCategories: ['Passing'] },
            { label: 'Knee line opens', value: 'knee cut', enterTree: true, focusName: 'Knee Cut', allowedCategories: ['Passing'] },
            { label: 'They overframe', value: 'hip smash pass', enterTree: true, focusName: 'Hip Smash Pass', allowedCategories: ['Passing'] },
            { label: 'Bottom leg lightens', value: 'backstep half guard pass', enterTree: true, focusName: 'Backstep Half Guard Pass', allowedCategories: ['Passing'] }
          ]
        }
      },
      {
        label: 'Far-side reach to underhook',
        nextPrompt: {
          question: 'What continuation do you want once the underhook opens?',
          options: [
            { label: 'Smash-pass lane', value: 'half guard smash pass', enterTree: true, focusName: 'Half Guard Smash Pass', allowedCategories: ['Passing'] },
            { label: 'Crossface-underhook lane', value: 'crossface underhook half guard pass', enterTree: true, focusName: 'Crossface Underhook Half Guard Pass', allowedCategories: ['Passing'] },
            { label: 'Knee cut stays open', value: 'knee cut', enterTree: true, focusName: 'Knee Cut', allowedCategories: ['Passing'] },
            { label: 'Hip switch angle opens', value: 'hip smash pass', enterTree: true, focusName: 'Hip Smash Pass', allowedCategories: ['Passing'] }
          ]
        }
      },
      {
        label: 'Knee slice with arm pin',
        nextPrompt: {
          question: 'What continuation do you want from the knee-slice setup?',
          options: [
            { label: 'Finish knee cut', value: 'knee cut', enterTree: true, focusName: 'Knee Cut', allowedCategories: ['Passing'] },
            { label: 'They frame hard', value: 'crossface underhook half guard pass', enterTree: true, focusName: 'Crossface Underhook Half Guard Pass', allowedCategories: ['Passing'] },
            { label: 'Hips stay heavy', value: 'hip smash pass', enterTree: true, focusName: 'Hip Smash Pass', allowedCategories: ['Passing'] },
            { label: 'They turn away', value: 'backstep half guard pass', enterTree: true, focusName: 'Backstep Half Guard Pass', allowedCategories: ['Passing'] }
          ]
        }
      },
      {
        label: 'Headquarters leg lift',
        nextPrompt: {
          question: 'What opening did the headquarters leg lift create?',
          options: [
            { label: 'Knee line opens', value: 'knee cut', enterTree: true, focusName: 'Knee Cut', allowedCategories: ['Passing'] },
            { label: 'Hip switch lane opens', value: 'hip smash pass', enterTree: true, focusName: 'Hip Smash Pass', allowedCategories: ['Passing'] },
            { label: 'Backstep lane opens', value: 'backstep half guard pass', enterTree: true, focusName: 'Backstep Half Guard Pass', allowedCategories: ['Passing'] },
            { label: 'Smash-pass lane stays open', value: 'half guard smash pass', enterTree: true, focusName: 'Half Guard Smash Pass', allowedCategories: ['Passing'] }
          ]
        }
      }
    ]
  },
  'submission-entry setups': {
    question: 'Which submission-entry setup branch do you want to continue from?',
    options: [
      {
        label: 'Shoulder crunch',
        nextPrompt: {
          question: 'What attack do you want to build from shoulder crunch control?',
          options: [
            { label: 'Choi Bar', value: 'choi bar', enterTree: true, focusName: 'Choi Bar', allowedCategories: ['Submissions'] },
            { label: 'Triangle', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Butterfly sweep', value: 'shoulder crunch butterfly sweep', enterTree: true, focusName: 'Shoulder Crunch Butterfly Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Arm drag to back', value: 'arm drag to back take', enterTree: true, focusName: 'Arm Drag To Back Take', allowedCategories: ['Back Takes', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Front headlock',
        nextPrompt: {
          question: 'What attack do you want to build from front headlock control?',
          options: [
            { label: 'Guillotine', value: 'guillotine', enterTree: true, focusName: 'Guillotine', allowedCategories: ['Submissions'] },
            { label: "D'Arce", value: "d'arce choke", enterTree: true, focusName: "D'Arce Choke", allowedCategories: ['Submissions'] },
            { label: 'Anaconda', value: 'anaconda choke', enterTree: true, focusName: 'Anaconda Choke', allowedCategories: ['Submissions'] },
            { label: 'Go-behind', value: 'front headlock go-behind', enterTree: true, focusName: 'Front Headlock Go-Behind', allowedCategories: ['Back Takes', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Kimura trap',
        nextPrompt: {
          question: 'What attack do you want to build from the kimura trap?',
          options: [
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Tarikoplata', value: 'tarikoplata', enterTree: true, focusName: 'Tarikoplata', allowedCategories: ['Submissions'] },
            { label: 'Back take', value: 'technical mount to back', enterTree: true, focusName: 'Technical Mount To Back', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Armbar', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Gift wrap',
        nextPrompt: {
          question: 'What attack do you want to build from gift wrap control?',
          options: [
            { label: 'Technical mount to back', value: 'technical mount to back', enterTree: true, focusName: 'Technical Mount To Back', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Mounted triangle', value: 'mounted triangle', enterTree: true, focusName: 'Mounted Triangle', allowedCategories: ['Submissions'] },
            { label: 'Armbar', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] },
            { label: 'Punch choke', value: 'punch choke', enterTree: true, focusName: 'Punch Choke', allowedCategories: ['Submissions'] }
          ]
        }
      }
    ]
  },
  'armbar-entry setups': {
    question: 'Which armbar-entry setup branch do you want to continue from?',
    options: [
      {
        label: 'Shoulder crunch',
        nextPrompt: {
          question: 'What armbar-family attack do you want from shoulder crunch control?',
          options: [
            { label: 'Choi Bar', value: 'choi bar', enterTree: true, focusName: 'Choi Bar', allowedCategories: ['Submissions'] },
            { label: 'Straight armbar', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Triangle', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Sweep', value: 'shoulder crunch butterfly sweep', enterTree: true, focusName: 'Shoulder Crunch Butterfly Sweep', allowedCategories: ['Sweeps'] }
          ]
        }
      },
      {
        label: 'Mount isolation',
        nextPrompt: {
          question: 'What continuation do you want from mount isolation?',
          options: [
            { label: 'Straight armbar from mount', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] },
            { label: 'Mounted triangle', value: 'mounted triangle', enterTree: true, focusName: 'Mounted Triangle', allowedCategories: ['Submissions'] },
            { label: 'Americana', value: 'americana', enterTree: true, focusName: 'Americana', allowedCategories: ['Submissions'] },
            { label: 'Gift wrap', value: 'gift wrap', enterTree: true, focusName: 'Gift Wrap', allowedCategories: ['Positions', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Kimura trap',
        nextPrompt: {
          question: 'What continuation do you want from the kimura trap?',
          options: [
            { label: 'Straight armbar from side control', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] },
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Tarikoplata', value: 'tarikoplata', enterTree: true, focusName: 'Tarikoplata', allowedCategories: ['Submissions'] },
            { label: 'Back take', value: 'technical mount to back', enterTree: true, focusName: 'Technical Mount To Back', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Gift wrap', value: 'gift wrap', allowedCategories: ['Positions', 'Submissions'] }
    ]
  }
};

export const getSetupFamilyPrompt = (setupFamily) => {
  const normalizedFamily = String(setupFamily || '')
    .trim()
    .toLowerCase();

  return setupFamilyPromptConfig[normalizedFamily] || null;
};
