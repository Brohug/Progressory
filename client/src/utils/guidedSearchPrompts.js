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
  'ankle-pick entry setups': {
    question: 'Which ankle-pick setup branch do you want to continue from?',
    options: [
      {
        label: 'Head touch + level change',
        nextPrompt: {
          question: 'What reaction did the level change create?',
          options: [
            { label: 'They step', value: 'ankle pick', enterTree: true, focusName: 'Ankle Pick', allowedCategories: ['Takedowns'] },
            { label: 'They stay tall', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'They sprawl early', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Positions', 'Takedowns'] },
            { label: 'They square up', value: 'body lock standing', enterTree: true, focusName: 'Body Lock Standing', allowedCategories: ['Positions', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Collar tie snap',
        nextPrompt: {
          question: 'What opening did the collar tie create?',
          options: [
            { label: 'Foot stays planted', value: 'ankle pick', enterTree: true, focusName: 'Ankle Pick', allowedCategories: ['Takedowns'] },
            { label: 'Posture stays high', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Head drops forward', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Positions', 'Takedowns'] },
            { label: 'Chest comes in close', value: 'body lock standing', enterTree: true, focusName: 'Body Lock Standing', allowedCategories: ['Positions', 'Takedowns'] }
          ]
        }
      },
      { label: 'Wrist post pull', value: 'ankle pick', allowedCategories: ['Takedowns', 'Grip Fighting'] },
      { label: 'Inside tie to outside angle', value: 'ankle pick', allowedCategories: ['Takedowns', 'Grip Fighting'] }
    ]
  },
  'low-single entry setups': {
    question: 'Which low-single setup branch do you want to continue from?',
    options: [
      {
        label: 'Wrist post pull',
        nextPrompt: {
          question: 'What reaction did the wrist-post pull create?',
          options: [
            { label: 'Lead foot stays heavy', value: 'low single', enterTree: true, focusName: 'Low Single', allowedCategories: ['Takedowns'] },
            { label: 'They square up', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'They sprawl early', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Positions', 'Takedowns'] },
            { label: 'They step away', value: 'ankle pick', enterTree: true, focusName: 'Ankle Pick', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      {
        label: 'Collar tie snap',
        nextPrompt: {
          question: 'What did the collar-tie snap open up?',
          options: [
            { label: 'Head stays high', value: 'low single', enterTree: true, focusName: 'Low Single', allowedCategories: ['Takedowns'] },
            { label: 'Lead leg reaches back', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'They post forward', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Positions', 'Takedowns'] },
            { label: 'Foot plants wide', value: 'ankle pick', enterTree: true, focusName: 'Ankle Pick', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      { label: 'Inside tie angle change', value: 'low single', allowedCategories: ['Takedowns', 'Grip Fighting'] },
      { label: 'Head touch to level change', value: 'low single', allowedCategories: ['Takedowns', 'Grip Fighting'] }
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
  'closed-guard legacy submission setups': {
    question: 'Which closed-guard submission branch do you want to continue from?',
    options: [
      {
        label: 'Collar pull',
        nextPrompt: {
          question: 'What reaction did the collar pull create?',
          options: [
            { label: 'They posture back up', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'They post the hand', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Elbow line opens', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Shoulder line stays long', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Shoulder crunch',
        nextPrompt: {
          question: 'What continuation do you want from shoulder-crunch control?',
          options: [
            { label: 'Triangle choke', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Straight armbar', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Omoplata', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Hip bump threat', value: 'kimura', allowedCategories: ['Sweeps', 'Submissions'] },
      { label: 'Overhook clamp', value: 'triangle choke', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'butterfly sweep setups': {
    question: 'Which butterfly sweep branch do you want to continue from?',
    options: [
      {
        label: 'Double underhooks',
        nextPrompt: {
          question: 'What reaction did the double underhooks create?',
          options: [
            { label: 'They post wide', value: 'butterfly sweep', enterTree: true, focusName: 'Butterfly Sweep', allowedCategories: ['Sweeps'] },
            { label: 'They base back', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Arm stays isolated', value: 'shoulder crunch butterfly sweep', enterTree: true, focusName: 'Shoulder Crunch Butterfly Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Back starts to show', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Positions'] }
          ]
        }
      },
      {
        label: 'Overhook clamp',
        nextPrompt: {
          question: 'What continuation do you want from the overhook clamp?',
          options: [
            { label: 'Butterfly sweep', value: 'butterfly sweep', enterTree: true, focusName: 'Butterfly Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Triangle lane', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Armbar lane', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Back exposure', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Positions'] }
          ]
        }
      },
      { label: 'Shoulder crunch', value: 'shoulder crunch butterfly sweep', allowedCategories: ['Sweeps', 'Submissions'] },
      { label: 'Arm drag sit-up', value: 'back control', allowedCategories: ['Back Takes', 'Sweeps'] }
    ]
  },
  'butterfly-guard submission setups': {
    question: 'Which butterfly-guard submission branch do you want to continue from?',
    options: [
      {
        label: 'Shoulder crunch',
        nextPrompt: {
          question: 'What reaction did the shoulder crunch create?',
          options: [
            { label: 'They drive forward', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Neck stays exposed', value: 'guillotine', enterTree: true, focusName: 'Guillotine', allowedCategories: ['Submissions'] },
            { label: 'Shoulder line stays long', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Back starts to show', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Positions'] }
          ]
        }
      },
      {
        label: 'Overhook clamp',
        nextPrompt: {
          question: 'What continuation do you want from the overhook clamp?',
          options: [
            { label: 'Triangle choke', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Guillotine', value: 'guillotine', enterTree: true, focusName: 'Guillotine', allowedCategories: ['Submissions'] },
            { label: 'Omoplata', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Back control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Positions'] }
          ]
        }
      },
      { label: 'Head snap', value: 'guillotine', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Arm drag sit-up', value: 'back control', allowedCategories: ['Back Takes', 'Submissions'] }
    ]
  },
  'knee-shield wrestle-up setups': {
    question: 'Which knee-shield wrestle-up branch do you want to continue from?',
    options: [
      {
        label: 'Knee shield frame',
        nextPrompt: {
          question: 'What reaction did the knee shield frame create?',
          options: [
            { label: 'They pressure forward', value: 'dogfight sweep', enterTree: true, focusName: 'Dogfight Sweep', allowedCategories: ['Sweeps', 'Positions'] },
            { label: 'They post the far hand', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'They drift high', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Leg line opens', value: 'single-leg from seated guard', enterTree: true, focusName: 'Single-Leg From Seated Guard', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Underhook sit-up',
        nextPrompt: {
          question: 'What continuation do you want from the underhook sit-up?',
          options: [
            { label: 'Dogfight', value: 'dogfight sweep', enterTree: true, focusName: 'Dogfight Sweep', allowedCategories: ['Sweeps', 'Positions'] },
            { label: 'Wrestle up', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Come up on the leg', value: 'single-leg from seated guard', enterTree: true, focusName: 'Single-Leg From Seated Guard', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Stand to top', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps'] }
          ]
        }
      },
      { label: 'Wrist control', value: 'dogfight sweep', allowedCategories: ['Sweeps', 'Positions'] },
      { label: 'Inside elbow lift', value: 'wrestle-up single leg sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
    ]
  },
  'x-guard sweep setups': {
    question: 'Which X-guard sweep setup branch do you want to continue from?',
    options: [
      {
        label: 'Shin-to-shin',
        nextPrompt: {
          question: 'What reaction did the shin-to-shin entry create?',
          options: [
            { label: 'They stay tall', value: 'x-guard', enterTree: true, focusName: 'X-Guard', allowedCategories: ['Positions', 'Sweeps'] },
            { label: 'They step wide', value: 'x-guard to ankle pick', enterTree: true, focusName: 'X-Guard To Ankle Pick', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Hips get light', value: 'basic x-guard sweep', enterTree: true, focusName: 'Basic X-Guard Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Back starts to show', value: 'x-guard back take', enterTree: true, focusName: 'X-Guard Back Take', allowedCategories: ['Sweeps', 'Back Takes'] }
          ]
        }
      },
      {
        label: 'Under-leg lift',
        nextPrompt: {
          question: 'What continuation do you want from the under-leg lift?',
          options: [
            { label: 'Overhead sweep', value: 'x-guard overhead sweep', enterTree: true, focusName: 'X-Guard Overhead Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Ankle-pick lane', value: 'x-guard to ankle pick', enterTree: true, focusName: 'X-Guard To Ankle Pick', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Leg-drag finish', value: 'x-guard to leg drag sweep', enterTree: true, focusName: 'X-Guard To Leg Drag Sweep', allowedCategories: ['Sweeps', 'Passing'] },
            { label: 'Back-take lane', value: 'x-guard back take', enterTree: true, focusName: 'X-Guard Back Take', allowedCategories: ['Sweeps', 'Back Takes'] }
          ]
        }
      },
      { label: 'Off-balance pull', value: 'basic x-guard sweep', allowedCategories: ['Sweeps', 'Positions'] },
      { label: 'Upper-body steering', value: 'x-guard back take', allowedCategories: ['Sweeps', 'Back Takes'] }
    ]
  },
  'spider / lasso sweep setups': {
    question: 'Which spider / lasso sweep branch do you want to continue from?',
    options: [
      {
        label: 'Spider sleeve control',
        nextPrompt: {
          question: 'What reaction did the spider sleeve control create?',
          options: [
            { label: 'They posture forward', value: 'balloon sweep from spider', enterTree: true, focusName: 'Balloon Sweep From Spider', allowedCategories: ['Sweeps'] },
            { label: 'They widen the post', value: 'overhead sweep', enterTree: true, focusName: 'Overhead Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Shoulder line stays trapped', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Leg line crosses', value: 'spider lasso sweep', enterTree: true, focusName: 'Spider Lasso Sweep', allowedCategories: ['Sweeps'] }
          ]
        }
      },
      {
        label: 'Lasso tension',
        nextPrompt: {
          question: 'What continuation do you want from the lasso tension?',
          options: [
            { label: 'Basic lasso sweep', value: 'basic lasso sweep', enterTree: true, focusName: 'Basic Lasso Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Lasso tilt sweep', value: 'lasso tilt sweep', enterTree: true, focusName: 'Lasso Tilt Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Lasso overhead sweep', value: 'lasso overhead sweep', enterTree: true, focusName: 'Lasso Overhead Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Omoplata lane', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Collar-sleeve pull', value: 'balloon sweep', allowedCategories: ['Sweeps', 'Positions'] },
      { label: 'Foot-on-hip extension', value: 'overhead sweep', allowedCategories: ['Sweeps', 'Positions'] }
    ]
  },
  'de la riva sweep setups': {
    question: 'Which De La Riva sweep branch do you want to continue from?',
    options: [
      {
        label: 'DLR sleeve pull',
        nextPrompt: {
          question: 'What reaction did the sleeve pull create?',
          options: [
            { label: 'They post forward', value: 'basic de la riva off-balance sweep', enterTree: true, focusName: 'Basic De La Riva Off-Balance Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Tripod lane opens', value: 'de la riva tripod variation', enterTree: true, focusName: 'De La Riva Tripod Variation', allowedCategories: ['Sweeps'] },
            { label: 'Leg line opens', value: 'de la riva to single-leg x sweep', enterTree: true, focusName: 'De La Riva To Single-Leg X Sweep', allowedCategories: ['Sweeps', 'Positions'] },
            { label: 'Back starts to show', value: 'berimbolo', enterTree: true, focusName: 'Berimbolo', allowedCategories: ['Back Takes', 'Sweeps'] }
          ]
        }
      },
      {
        label: 'Ankle steering',
        nextPrompt: {
          question: 'What continuation do you want from the ankle steering?',
          options: [
            { label: 'Off-balance sweep', value: 'basic de la riva off-balance sweep', enterTree: true, focusName: 'Basic De La Riva Off-Balance Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Tripod variation', value: 'de la riva tripod variation', enterTree: true, focusName: 'De La Riva Tripod Variation', allowedCategories: ['Sweeps'] },
            { label: 'Single-Leg X lane', value: 'de la riva to single-leg x sweep', enterTree: true, focusName: 'De La Riva To Single-Leg X Sweep', allowedCategories: ['Sweeps', 'Positions'] },
            { label: 'Bolo lane', value: 'berimbolo', enterTree: true, focusName: 'Berimbolo', allowedCategories: ['Back Takes', 'Sweeps'] }
          ]
        }
      },
      { label: 'Tripod off-balance', value: 'de la riva tripod variation', allowedCategories: ['Sweeps', 'Positions'] },
      { label: 'Waiter-style tilt', value: 'de la riva to single-leg x sweep', allowedCategories: ['Sweeps', 'Positions'] }
    ]
  },
  'deep-half sweep setups': {
    question: 'Which deep-half sweep branch do you want to continue from?',
    options: [
      {
        label: 'Under-hip entry',
        nextPrompt: {
          question: 'What reaction did the under-hip entry create?',
          options: [
            { label: 'They commit weight forward', value: 'deep half waiter sweep', enterTree: true, focusName: 'Deep Half Waiter Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Base stays wide', value: 'basic deep half sweep', enterTree: true, focusName: 'Basic Deep Half Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Leg line opens', value: 'single-leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Positions', 'Sweeps'] },
            { label: 'Hips drift across', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing', 'Sweeps'] }
          ]
        }
      },
      {
        label: 'Waiter wedge',
        nextPrompt: {
          question: 'What continuation do you want from the waiter wedge?',
          options: [
            { label: 'Waiter sweep', value: 'deep half waiter sweep', enterTree: true, focusName: 'Deep Half Waiter Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Basic deep-half sweep', value: 'basic deep half sweep', enterTree: true, focusName: 'Basic Deep Half Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Single-Leg X lane', value: 'single-leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Positions', 'Sweeps'] },
            { label: 'Leg-drag finish', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing', 'Sweeps'] }
          ]
        }
      },
      { label: 'Inside knee turn', value: 'basic deep half sweep', allowedCategories: ['Sweeps', 'Positions'] },
      { label: 'Shoulder under the belt line', value: 'deep half guard', allowedCategories: ['Sweeps', 'Positions'] }
    ]
  },
  'reverse de la riva sweep setups': {
    question: 'Which Reverse De La Riva sweep branch do you want to continue from?',
    options: [
      {
        label: 'RDLR hook angle',
        nextPrompt: {
          question: 'What reaction did the RDLR hook angle create?',
          options: [
            { label: 'They step heavy', value: 'basic reverse de la riva sweep', enterTree: true, focusName: 'Basic Reverse De La Riva Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Waiter lane opens', value: 'reverse de la riva waiter sweep', enterTree: true, focusName: 'Reverse De La Riva Waiter Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Spin-under lane opens', value: 'reverse de la riva spin under sweep', enterTree: true, focusName: 'Reverse De La Riva Spin Under Sweep', allowedCategories: ['Sweeps', 'Back Takes'] },
            { label: 'Wrestle-up lane opens', value: 'rdlr wrestle-up sweep', enterTree: true, focusName: 'RDLR Wrestle-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Waiter tilt',
        nextPrompt: {
          question: 'What continuation do you want from the waiter tilt?',
          options: [
            { label: 'Basic sweep', value: 'basic reverse de la riva sweep', enterTree: true, focusName: 'Basic Reverse De La Riva Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Waiter sweep', value: 'reverse de la riva waiter sweep', enterTree: true, focusName: 'Reverse De La Riva Waiter Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Spin-under sweep', value: 'reverse de la riva spin under sweep', enterTree: true, focusName: 'Reverse De La Riva Spin Under Sweep', allowedCategories: ['Sweeps', 'Back Takes'] },
            { label: 'Wrestle-up sweep', value: 'rdlr wrestle-up sweep', enterTree: true, focusName: 'RDLR Wrestle-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      { label: 'Spin-under threat', value: 'reverse de la riva spin under sweep', allowedCategories: ['Sweeps', 'Back Takes'] },
      { label: 'Wrestle-up read', value: 'rdlr wrestle-up sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
    ]
  },
  'dogfight setups': {
    question: 'Which dogfight branch do you want to continue from?',
    options: [
      {
        label: 'Underhook half guard',
        nextPrompt: {
          question: 'What reaction did the underhook half guard create?',
          options: [
            { label: 'They square up', value: 'dogfight sweep', enterTree: true, focusName: 'Dogfight Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Back starts to show', value: 'wrestle-up to back', enterTree: true, focusName: 'Wrestle-Up To Back', allowedCategories: ['Back Takes', 'Sweeps'] },
            { label: 'Leg stays available', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'They stand high', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      {
        label: 'Coyote angle',
        nextPrompt: {
          question: 'What continuation do you want from the coyote angle?',
          options: [
            { label: 'Dogfight sweep', value: 'dogfight sweep', enterTree: true, focusName: 'Dogfight Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Back take', value: 'wrestle-up to back', enterTree: true, focusName: 'Wrestle-Up To Back', allowedCategories: ['Back Takes', 'Sweeps'] },
            { label: 'Wrestle-up single', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Single leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      { label: 'Shoulder height win', value: 'dogfight', allowedCategories: ['Sweeps', 'Positions'] },
      { label: 'Stand-up reaction', value: 'wrestle-up to back', allowedCategories: ['Sweeps', 'Back Takes'] }
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
  'closed-guard passing setups': {
    question: 'Which closed-guard passing branch do you want to continue from?',
    options: [
      {
        label: 'Posture frame',
        nextPrompt: {
          question: 'What did the posture frame create?',
          options: [
            { label: 'Guard starts to open', value: 'combat base', enterTree: true, focusName: 'Combat Base', allowedCategories: ['Positions', 'Passing'] },
            { label: 'They climb high', value: 'closed guard posture control', enterTree: true, focusName: 'Closed Guard Posture Control', allowedCategories: ['Positions', 'Passing'] },
            { label: 'You can stand cleanly', value: 'standing passing', enterTree: true, focusName: 'Standing Passing', allowedCategories: ['Passing', 'Positions'] },
            { label: 'Legs separate late', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing'] }
          ]
        }
      },
      {
        label: 'Combat base rise',
        nextPrompt: {
          question: 'What continuation do you want from combat base?',
          options: [
            { label: 'Open the guard cleanly', value: 'combat base', enterTree: true, focusName: 'Combat Base', allowedCategories: ['Positions', 'Passing'] },
            { label: 'Rebuild posture control', value: 'closed guard posture control', enterTree: true, focusName: 'Closed Guard Posture Control', allowedCategories: ['Positions', 'Passing'] },
            { label: 'Stand into passing', value: 'standing passing', enterTree: true, focusName: 'Standing Passing', allowedCategories: ['Passing', 'Positions'] },
            { label: 'Drag the legs off line', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing'] }
          ]
        }
      },
      { label: 'Sleeve / wrist peel', value: 'closed guard posture control', allowedCategories: ['Passing', 'Positions'] },
      { label: 'Standing guard-open rhythm', value: 'standing passing', allowedCategories: ['Passing', 'Positions'] }
    ]
  },
  'leg-drag passing setups': {
    question: 'Which leg-drag setup branch do you want to continue from?',
    options: [
      {
        label: 'Ankle-control pull',
        nextPrompt: {
          question: 'What opening did the ankle-control pull create?',
          options: [
            { label: 'Knees turn off line', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing'] },
            { label: 'Bottom leg lightens', value: 'backstep pass', enterTree: true, focusName: 'Backstep Pass', allowedCategories: ['Passing'] },
            { label: 'Hip line stays exposed', value: 'pass to knee on belly', enterTree: true, focusName: 'Pass To Knee On Belly', allowedCategories: ['Passing'] },
            { label: 'Chest clears the legs', value: 'side control', enterTree: true, focusName: 'Side Control', allowedCategories: ['Positions', 'Passing'] }
          ]
        }
      },
      {
        label: 'Shin redirect',
        nextPrompt: {
          question: 'What continuation do you want from the shin redirect?',
          options: [
            { label: 'Finish leg drag', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing'] },
            { label: 'Backstep lane', value: 'backstep pass', enterTree: true, focusName: 'Backstep Pass', allowedCategories: ['Passing'] },
            { label: 'Knee on belly lane', value: 'pass to knee on belly', enterTree: true, focusName: 'Pass To Knee On Belly', allowedCategories: ['Passing'] },
            { label: 'Side control lane', value: 'side control', enterTree: true, focusName: 'Side Control', allowedCategories: ['Positions', 'Passing'] }
          ]
        }
      },
      { label: 'Leg pummel', value: 'leg drag', allowedCategories: ['Passing', 'Positions'] },
      { label: 'Body lock to leg drag', value: 'leg drag', allowedCategories: ['Passing', 'Positions'] }
    ]
  },
  'knee-cut passing setups': {
    question: 'Which knee-cut passing branch do you want to continue from?',
    options: [
      {
        label: 'Near-side arm pin',
        nextPrompt: {
          question: 'What opening did the near-side arm pin create?',
          options: [
            { label: 'Knee-cut lane opens', value: 'knee cut', enterTree: true, focusName: 'Knee Cut', allowedCategories: ['Passing'] },
            { label: 'They frame hard', value: 'crossface underhook half guard pass', enterTree: true, focusName: 'Crossface Underhook Half Guard Pass', allowedCategories: ['Passing'] },
            { label: 'Hip line stays exposed', value: 'hip smash pass', enterTree: true, focusName: 'Hip Smash Pass', allowedCategories: ['Passing'] },
            { label: 'They turn away', value: 'backstep half guard pass', enterTree: true, focusName: 'Backstep Half Guard Pass', allowedCategories: ['Passing'] }
          ]
        }
      },
      {
        label: 'Shin redirect',
        nextPrompt: {
          question: 'What continuation do you want from the shin redirect?',
          options: [
            { label: 'Finish knee cut', value: 'knee cut', enterTree: true, focusName: 'Knee Cut', allowedCategories: ['Passing'] },
            { label: 'Crossface-underhook lane', value: 'crossface underhook half guard pass', enterTree: true, focusName: 'Crossface Underhook Half Guard Pass', allowedCategories: ['Passing'] },
            { label: 'Hip smash lane', value: 'hip smash pass', enterTree: true, focusName: 'Hip Smash Pass', allowedCategories: ['Passing'] },
            { label: 'Backstep lane', value: 'backstep half guard pass', enterTree: true, focusName: 'Backstep Half Guard Pass', allowedCategories: ['Passing'] }
          ]
        }
      },
      { label: 'Crossface threat', value: 'knee cut', allowedCategories: ['Passing', 'Positions'] },
      { label: 'Hip switch fake', value: 'hip smash pass', allowedCategories: ['Passing', 'Positions'] }
    ]
  },
  'torreando passing setups': {
    question: 'Which torreando passing branch do you want to continue from?',
    options: [
      {
        label: 'Sleeve clear',
        nextPrompt: {
          question: 'What opening did the sleeve clear create?',
          options: [
            { label: 'Torreando lane opens', value: 'torreando pass', enterTree: true, focusName: 'Torreando Pass', allowedCategories: ['Passing'] },
            { label: 'Bullfighter lane opens', value: 'bullfighter pass', enterTree: true, focusName: 'Bullfighter Pass', allowedCategories: ['Passing'] },
            { label: 'Cross-step lane opens', value: 'cross-step pass', enterTree: true, focusName: 'Cross-Step Pass', allowedCategories: ['Passing'] },
            { label: 'Chest clears to finish', value: 'pass to knee on belly', enterTree: true, focusName: 'Pass To Knee On Belly', allowedCategories: ['Passing'] }
          ]
        }
      },
      {
        label: 'Ankle steering',
        nextPrompt: {
          question: 'What continuation do you want from the ankle steering?',
          options: [
            { label: 'Torreando pass', value: 'torreando pass', enterTree: true, focusName: 'Torreando Pass', allowedCategories: ['Passing'] },
            { label: 'Bullfighter pass', value: 'bullfighter pass', enterTree: true, focusName: 'Bullfighter Pass', allowedCategories: ['Passing'] },
            { label: 'Cross-step pass', value: 'cross-step pass', enterTree: true, focusName: 'Cross-Step Pass', allowedCategories: ['Passing'] },
            { label: 'Knee-on-belly finish', value: 'pass to knee on belly', enterTree: true, focusName: 'Pass To Knee On Belly', allowedCategories: ['Passing'] }
          ]
        }
      },
      { label: 'Hip turn', value: 'torreando pass', allowedCategories: ['Passing', 'Positions'] },
      { label: 'Outside-angle footwork', value: 'bullfighter pass', allowedCategories: ['Passing', 'Positions'] }
    ]
  },
  'over-under / stack passing setups': {
    question: 'Which over-under / stack passing branch do you want to continue from?',
    options: [
      {
        label: 'Double-under pressure',
        nextPrompt: {
          question: 'What opening did the double-under pressure create?',
          options: [
            { label: 'Over-under lane opens', value: 'over-under pass', enterTree: true, focusName: 'Over-Under Pass', allowedCategories: ['Passing'] },
            { label: 'Stack lane opens', value: 'stack pass', enterTree: true, focusName: 'Stack Pass', allowedCategories: ['Passing'] },
            { label: 'Folding lane opens', value: 'folding pass', enterTree: true, focusName: 'Folding Pass', allowedCategories: ['Passing'] },
            { label: 'Head clears north-south', value: 'north-south pass', enterTree: true, focusName: 'North-South Pass', allowedCategories: ['Passing'] }
          ]
        }
      },
      {
        label: 'Leg fold',
        nextPrompt: {
          question: 'What continuation do you want from the leg fold?',
          options: [
            { label: 'Over-under pass', value: 'over-under pass', enterTree: true, focusName: 'Over-Under Pass', allowedCategories: ['Passing'] },
            { label: 'Stack pass', value: 'stack pass', enterTree: true, focusName: 'Stack Pass', allowedCategories: ['Passing'] },
            { label: 'Folding pass', value: 'folding pass', enterTree: true, focusName: 'Folding Pass', allowedCategories: ['Passing'] },
            { label: 'North-south pass', value: 'north-south pass', enterTree: true, focusName: 'North-South Pass', allowedCategories: ['Passing'] }
          ]
        }
      },
      { label: 'Hip stack', value: 'stack pass', allowedCategories: ['Passing', 'Positions'] },
      { label: 'Shoulder-drive angle', value: 'over-under pass', allowedCategories: ['Passing', 'Positions'] }
    ]
  },
  'headquarters passing setups': {
    question: 'Which headquarters passing branch do you want to continue from?',
    options: [
      {
        label: 'Headquarters split',
        nextPrompt: {
          question: 'What opening did the headquarters split create?',
          options: [
            { label: 'Headquarters pass', value: 'headquarters pass', enterTree: true, focusName: 'Headquarters Pass', allowedCategories: ['Passing'] },
            { label: 'Knee-slice lane opens', value: 'knee slice pass', enterTree: true, focusName: 'Knee Slice Pass', allowedCategories: ['Passing'] },
            { label: 'Cross-knee lane opens', value: 'cross knee pass', enterTree: true, focusName: 'Cross Knee Pass', allowedCategories: ['Passing'] },
            { label: 'Float lane opens', value: 'float headquarters pass', enterTree: true, focusName: 'Float Headquarters Pass', allowedCategories: ['Passing'] }
          ]
        }
      },
      {
        label: 'Shin staple',
        nextPrompt: {
          question: 'What continuation do you want from the shin staple?',
          options: [
            { label: 'Headquarters pass', value: 'headquarters pass', enterTree: true, focusName: 'Headquarters Pass', allowedCategories: ['Passing'] },
            { label: 'Knee-slice pass', value: 'knee slice pass', enterTree: true, focusName: 'Knee Slice Pass', allowedCategories: ['Passing'] },
            { label: 'Cross-knee pass', value: 'cross knee pass', enterTree: true, focusName: 'Cross Knee Pass', allowedCategories: ['Passing'] },
            { label: 'Float pass', value: 'float headquarters pass', enterTree: true, focusName: 'Float Headquarters Pass', allowedCategories: ['Passing'] }
          ]
        }
      },
      { label: 'Hip turn read', value: 'headquarters pass', allowedCategories: ['Passing', 'Positions'] },
      { label: 'Leg lift reaction', value: 'float headquarters pass', allowedCategories: ['Passing', 'Positions'] }
    ]
  },
  'body-lock passing setups': {
    question: 'Which body-lock passing branch do you want to continue from?',
    options: [
      {
        label: 'Hip clamp',
        nextPrompt: {
          question: 'What opening did the hip clamp create?',
          options: [
            { label: 'Body-lock pass', value: 'body lock pass', enterTree: true, focusName: 'Body Lock Pass', allowedCategories: ['Passing'] },
            { label: 'Pressure-passing lane', value: 'body lock passing', enterTree: true, focusName: 'Body Lock Passing', allowedCategories: ['Passing'] },
            { label: 'Folding lane opens', value: 'folding pass', enterTree: true, focusName: 'Folding Pass', allowedCategories: ['Passing'] },
            { label: 'Float lane opens', value: 'float headquarters pass', enterTree: true, focusName: 'Float Headquarters Pass', allowedCategories: ['Passing'] }
          ]
        }
      },
      {
        label: 'Knee pinch pressure',
        nextPrompt: {
          question: 'What continuation do you want from the knee-pinch pressure?',
          options: [
            { label: 'Body-lock pass', value: 'body lock pass', enterTree: true, focusName: 'Body Lock Pass', allowedCategories: ['Passing'] },
            { label: 'Body-lock pressure pass', value: 'body lock passing', enterTree: true, focusName: 'Body Lock Passing', allowedCategories: ['Passing'] },
            { label: 'Folding pass', value: 'folding pass', enterTree: true, focusName: 'Folding Pass', allowedCategories: ['Passing'] },
            { label: 'Float-headquarters pass', value: 'float headquarters pass', enterTree: true, focusName: 'Float Headquarters Pass', allowedCategories: ['Passing'] }
          ]
        }
      },
      { label: 'Shoulder-line win', value: 'body lock passing', allowedCategories: ['Passing', 'Positions'] },
      { label: 'Folding reaction', value: 'folding pass', allowedCategories: ['Passing', 'Positions'] }
    ]
  },
  'float / side-smash passing setups': {
    question: 'Which float / side-smash passing branch do you want to continue from?',
    options: [
      {
        label: 'Float threat',
        nextPrompt: {
          question: 'What opening did the float threat create?',
          options: [
            { label: 'Float pass', value: 'float pass', enterTree: true, focusName: 'Float Pass', allowedCategories: ['Passing'] },
            { label: 'Ghost-style float', value: 'ghost-style float pass', enterTree: true, focusName: 'Ghost-Style Float Pass', allowedCategories: ['Passing'] },
            { label: 'Float headquarters lane', value: 'float headquarters pass', enterTree: true, focusName: 'Float Headquarters Pass', allowedCategories: ['Passing'] },
            { label: 'North-south lane', value: 'north-south pass', enterTree: true, focusName: 'North-South Pass', allowedCategories: ['Passing'] }
          ]
        }
      },
      {
        label: 'Side-smash pressure',
        nextPrompt: {
          question: 'What continuation do you want from the side-smash pressure?',
          options: [
            { label: 'Side smash pass', value: 'side smash pass', enterTree: true, focusName: 'Side Smash Pass', allowedCategories: ['Passing'] },
            { label: 'Float pass', value: 'float pass', enterTree: true, focusName: 'Float Pass', allowedCategories: ['Passing'] },
            { label: 'Float headquarters pass', value: 'float headquarters pass', enterTree: true, focusName: 'Float Headquarters Pass', allowedCategories: ['Passing'] },
            { label: 'North-south pass', value: 'north-south pass', enterTree: true, focusName: 'North-South Pass', allowedCategories: ['Passing'] }
          ]
        }
      },
      { label: 'Shoulder switch', value: 'float pass', allowedCategories: ['Passing', 'Positions'] },
      { label: 'North-south redirection', value: 'north-south pass', allowedCategories: ['Passing', 'Positions'] }
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
  },
  'triangle-entry setups': {
    question: 'Which triangle-entry setup branch do you want to continue from?',
    options: [
      {
        label: 'Collar tie + wrist control',
        nextPrompt: {
          question: 'What attack do you want from the wrist-control lane?',
          options: [
            { label: 'Triangle choke', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Omoplata', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Straight armbar', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Mounted triangle path', value: 'mounted triangle', enterTree: true, focusName: 'Mounted Triangle', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Shoulder crunch',
        nextPrompt: {
          question: 'What continuation do you want from shoulder crunch control?',
          options: [
            { label: 'Triangle choke', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Omoplata', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Straight armbar', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Butterfly sweep', value: 'shoulder crunch butterfly sweep', enterTree: true, focusName: 'Shoulder Crunch Butterfly Sweep', allowedCategories: ['Sweeps'] }
          ]
        }
      },
      { label: 'Overhook clamp', value: 'triangle choke', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Leg pummel to angle', value: 'triangle choke', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'kimura-entry setups': {
    question: 'Which kimura-entry setup branch do you want to continue from?',
    options: [
      {
        label: 'Hip bump threat',
        nextPrompt: {
          question: 'What reaction did the hip-bump threat create?',
          options: [
            { label: 'They post the hand', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Arm straightens', value: 'tarikoplata', enterTree: true, focusName: 'Tarikoplata', allowedCategories: ['Submissions'] },
            { label: 'Elbow hides but shoulder stays trapped', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Back starts to show', value: 'technical mount to back', enterTree: true, focusName: 'Technical Mount To Back', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Kimura trap',
        nextPrompt: {
          question: 'What continuation do you want from kimura-trap control?',
          options: [
            { label: 'Finish kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Tarikoplata', value: 'tarikoplata', enterTree: true, focusName: 'Tarikoplata', allowedCategories: ['Submissions'] },
            { label: 'Armbar lane', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] },
            { label: 'Back take', value: 'technical mount to back', enterTree: true, focusName: 'Technical Mount To Back', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Wrist pin', value: 'kimura', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Overhook clamp', value: 'kimura', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'omoplata-entry setups': {
    question: 'Which omoplata-entry setup branch do you want to continue from?',
    options: [
      {
        label: 'Overhook clamp',
        nextPrompt: {
          question: 'What reaction did the overhook clamp create?',
          options: [
            { label: 'Shoulder stays exposed', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Triangle lane opens', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Arm turns weak', value: 'monoplata', enterTree: true, focusName: 'Monoplata', allowedCategories: ['Submissions'] },
            { label: 'Back starts to show', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Collar-sleeve angle',
        nextPrompt: {
          question: 'What continuation do you want from the collar-sleeve angle?',
          options: [
            { label: 'Omoplata', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Triangle choke', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Monoplata', value: 'monoplata', enterTree: true, focusName: 'Monoplata', allowedCategories: ['Submissions'] },
            { label: 'Back control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Triangle reaction', value: 'omoplata', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Hip angle shift', value: 'omoplata position', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'guillotine-entry setups': {
    question: 'Which guillotine-entry setup branch do you want to continue from?',
    options: [
      {
        label: 'Snap down',
        nextPrompt: {
          question: 'What reaction did the snap down create?',
          options: [
            { label: 'Neck stays exposed', value: 'guillotine', enterTree: true, focusName: 'Guillotine', allowedCategories: ['Submissions'] },
            { label: 'They drive in', value: 'arm-in guillotine', enterTree: true, focusName: 'Arm-In Guillotine', allowedCategories: ['Submissions'] },
            { label: 'They posture awkwardly', value: 'high elbow guillotine', enterTree: true, focusName: 'High Elbow Guillotine', allowedCategories: ['Submissions'] },
            { label: 'Finish hides but angle breaks', value: 'front headlock go-behind', enterTree: true, focusName: 'Front Headlock Go-Behind', allowedCategories: ['Back Takes', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Front headlock catch',
        nextPrompt: {
          question: 'What continuation do you want from the front-headlock catch?',
          options: [
            { label: 'Guillotine', value: 'guillotine', enterTree: true, focusName: 'Guillotine', allowedCategories: ['Submissions'] },
            { label: 'High-elbow guillotine', value: 'high elbow guillotine', enterTree: true, focusName: 'High Elbow Guillotine', allowedCategories: ['Submissions'] },
            { label: 'Arm-in guillotine', value: 'arm-in guillotine', enterTree: true, focusName: 'Arm-In Guillotine', allowedCategories: ['Submissions'] },
            { label: 'Go-behind', value: 'front headlock go-behind', enterTree: true, focusName: 'Front Headlock Go-Behind', allowedCategories: ['Back Takes', 'Takedowns'] }
          ]
        }
      },
      { label: 'Arm-in exposure', value: 'arm-in guillotine', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Seated head clamp', value: 'guillotine position', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'side-control submission setups': {
    question: 'Which side-control submission branch do you want to continue from?',
    options: [
      {
        label: 'Crossface pressure',
        nextPrompt: {
          question: 'What reaction did the crossface pressure create?',
          options: [
            { label: 'Far arm isolates', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Elbow flares high', value: 'americana', enterTree: true, focusName: 'Americana', allowedCategories: ['Submissions'] },
            { label: 'Head and arm stay trapped', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] },
            { label: 'Arm straightens late', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Kimura trap',
        nextPrompt: {
          question: 'What continuation do you want from the kimura trap?',
          options: [
            { label: 'Finish kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Americana lane', value: 'americana', enterTree: true, focusName: 'Americana', allowedCategories: ['Submissions'] },
            { label: 'Arm triangle lane', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] },
            { label: 'Side-control armbar', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Far-arm isolation', value: 'kimura', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Near-side underhook', value: 'arm triangle', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'mount submission setups': {
    question: 'Which mount submission branch do you want to continue from?',
    options: [
      {
        label: 'High mount climb',
        nextPrompt: {
          question: 'What reaction did the high mount create?',
          options: [
            { label: 'Head and arm stay trapped', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] },
            { label: 'Elbow line opens', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] },
            { label: 'Arms cross late', value: 'mounted triangle', enterTree: true, focusName: 'Mounted Triangle', allowedCategories: ['Submissions'] },
            { label: 'Wrist stays pinned', value: 'americana', enterTree: true, focusName: 'Americana', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Gift wrap',
        nextPrompt: {
          question: 'What continuation do you want from gift-wrap control?',
          options: [
            { label: 'Mounted triangle', value: 'mounted triangle', enterTree: true, focusName: 'Mounted Triangle', allowedCategories: ['Submissions'] },
            { label: 'Straight armbar from mount', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] },
            { label: 'Arm triangle', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] },
            { label: 'Americana', value: 'americana', enterTree: true, focusName: 'Americana', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Elbow walk isolation', value: 'straight armbar from mount', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Cross-wrist pin', value: 'americana', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'clamp-guard attack setups': {
    question: 'Which clamp-guard attack branch do you want to continue from?',
    options: [
      {
        label: 'Clamp pressure',
        nextPrompt: {
          question: 'What reaction did the clamp pressure create?',
          options: [
            { label: 'Posture breaks', value: 'clamp guard sweep', enterTree: true, focusName: 'Clamp Guard Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Triangle lane opens', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Elbow line opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Back starts to show', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Posture break',
        nextPrompt: {
          question: 'What continuation do you want from the posture break?',
          options: [
            { label: 'Clamp-guard sweep', value: 'clamp guard sweep', enterTree: true, focusName: 'Clamp Guard Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Triangle choke', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Back control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Shoulder crunch tie-up', value: 'triangle choke', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Angle shift', value: 'clamp guard', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'high-guard attack setups': {
    question: 'Which high-guard attack branch do you want to continue from?',
    options: [
      {
        label: 'Leg climb high',
        nextPrompt: {
          question: 'What reaction did the high leg climb create?',
          options: [
            { label: 'Triangle lane opens', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Armbar lane opens', value: 'armbar position', enterTree: true, focusName: 'Armbar Position', allowedCategories: ['Submissions', 'Positions'] },
            { label: 'Mounted-triangle path opens', value: 'mounted triangle', enterTree: true, focusName: 'Mounted Triangle', allowedCategories: ['Submissions'] },
            { label: 'Omoplata lane opens', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Elbow-line isolation',
        nextPrompt: {
          question: 'What continuation do you want from the elbow-line isolation?',
          options: [
            { label: 'Armbar position', value: 'armbar position', enterTree: true, focusName: 'Armbar Position', allowedCategories: ['Submissions', 'Positions'] },
            { label: 'Triangle choke', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Mounted triangle', value: 'mounted triangle', enterTree: true, focusName: 'Mounted Triangle', allowedCategories: ['Submissions'] },
            { label: 'Omoplata', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Posture pull', value: 'high guard', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Shoulder control', value: 'triangle choke', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'rubber-guard attack setups': {
    question: 'Which rubber-guard attack branch do you want to continue from?',
    options: [
      {
        label: 'Rubber guard clamp',
        nextPrompt: {
          question: 'What reaction did the rubber-guard clamp create?',
          options: [
            { label: 'Gogoplata lane opens', value: 'gogoplata', enterTree: true, focusName: 'Gogoplata', allowedCategories: ['Submissions'] },
            { label: 'Omoplata lane opens', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Triangle lane opens', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Back starts to show', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Williams guard control',
        nextPrompt: {
          question: 'What continuation do you want from Williams guard control?',
          options: [
            { label: 'Gogoplata', value: 'gogoplata', enterTree: true, focusName: 'Gogoplata', allowedCategories: ['Submissions'] },
            { label: 'Omoplata', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Triangle choke', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Back control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Crackhead control', value: 'rubber guard', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Meat hook transition', value: 'gogoplata', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'open-guard submission setups': {
    question: 'Which open-guard submission branch do you want to continue from?',
    options: [
      {
        label: 'Collar-sleeve angle',
        nextPrompt: {
          question: 'What reaction did the collar-sleeve angle create?',
          options: [
            { label: 'Triangle lane opens', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Omoplata lane opens', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Armbar lane opens', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Guillotine lane opens', value: 'guillotine', enterTree: true, focusName: 'Guillotine', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Head snap sit-up',
        nextPrompt: {
          question: 'What continuation do you want from the head-snap sit-up?',
          options: [
            { label: 'Guillotine', value: 'guillotine', enterTree: true, focusName: 'Guillotine', allowedCategories: ['Submissions'] },
            { label: 'Triangle choke', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Omoplata', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Straight armbar from guard', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Overhook clamp', value: 'triangle choke', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Leg pummel to angle', value: 'omoplata', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'top-half-guard submission setups': {
    question: 'Which top-half-guard submission branch do you want to continue from?',
    options: [
      {
        label: 'Crossface pressure',
        nextPrompt: {
          question: 'What reaction did the crossface pressure create?',
          options: [
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Arm-triangle lane opens', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] },
            { label: "D'Arce lane opens", value: "d'arce choke", enterTree: true, focusName: "D'Arce Choke", allowedCategories: ['Submissions'] },
            { label: 'Mount armbar lane opens', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Kimura trap',
        nextPrompt: {
          question: 'What continuation do you want from the kimura trap?',
          options: [
            { label: 'Finish kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Arm triangle', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] },
            { label: "D'Arce choke", value: "d'arce choke", enterTree: true, focusName: "D'Arce Choke", allowedCategories: ['Submissions'] },
            { label: 'Straight armbar from mount', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Underhook climb', value: 'arm triangle', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Head-and-arm pin', value: "d'arce choke", allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'north-south attack setups': {
    question: 'Which north-south attack branch do you want to continue from?',
    options: [
      {
        label: 'Shoulder turn',
        nextPrompt: {
          question: 'What reaction did the shoulder turn create?',
          options: [
            { label: 'North-south choke lane opens', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Side-control armbar lane opens', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Near-arm scoop',
        nextPrompt: {
          question: 'What continuation do you want from the near-arm scoop?',
          options: [
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'North-south choke', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Straight armbar from side control', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] },
            { label: 'Back control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Elbow-hide pressure', value: 'north south choke', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'North-south float', value: 'north south pass', allowedCategories: ['Passing', 'Positions'] }
    ]
  },
  'back-control attack setups': {
    question: 'Which back-control attack branch do you want to continue from?',
    options: [
      {
        label: 'Seatbelt control',
        nextPrompt: {
          question: 'What reaction did the seatbelt control create?',
          options: [
            { label: 'Rear naked choke lane opens', value: 'rear naked choke', enterTree: true, focusName: 'Rear Naked Choke', allowedCategories: ['Submissions'] },
            { label: 'Short-choke lane opens', value: 'short choke', enterTree: true, focusName: 'Short Choke', allowedCategories: ['Submissions'] },
            { label: 'Bow-and-arrow lane opens', value: 'bow and arrow choke', enterTree: true, focusName: 'Bow And Arrow Choke', allowedCategories: ['Submissions'] },
            { label: 'Arm-trap lane opens', value: 'straightjacket control', enterTree: true, focusName: 'Straightjacket Control', allowedCategories: ['Positions', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Straightjacket trap',
        nextPrompt: {
          question: 'What continuation do you want from the straightjacket trap?',
          options: [
            { label: 'Rear naked choke', value: 'rear naked choke', enterTree: true, focusName: 'Rear Naked Choke', allowedCategories: ['Submissions'] },
            { label: 'Short choke', value: 'short choke', enterTree: true, focusName: 'Short Choke', allowedCategories: ['Submissions'] },
            { label: 'Bow and arrow choke', value: 'bow and arrow choke', enterTree: true, focusName: 'Bow And Arrow Choke', allowedCategories: ['Submissions'] },
            { label: 'Arm trap control', value: 'straightjacket control', enterTree: true, focusName: 'Straightjacket Control', allowedCategories: ['Positions', 'Submissions'] }
          ]
        }
      },
      { label: 'Cross-wrist peel', value: 'short choke', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Shoulder-line hide', value: 'rear naked choke', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'k-guard attack setups': {
    question: 'Which K-guard attack branch do you want to continue from?',
    options: [
      {
        label: 'K-guard angle',
        nextPrompt: {
          question: 'What reaction did the K-guard angle create?',
          options: [
            { label: 'Backside 50/50 lane opens', value: 'backside 50/50', enterTree: true, focusName: 'Backside 50/50', allowedCategories: ['Positions', 'Leg Locks'] },
            { label: 'Inside heel-hook lane opens', value: 'inside heel hook', enterTree: true, focusName: 'Inside Heel Hook', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Wrestle-up lane opens', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Far-hand post',
        nextPrompt: {
          question: 'What continuation do you want from the far-hand post reaction?',
          options: [
            { label: 'Backside 50/50', value: 'backside 50/50', enterTree: true, focusName: 'Backside 50/50', allowedCategories: ['Positions', 'Leg Locks'] },
            { label: 'Inside heel hook', value: 'inside heel hook', enterTree: true, focusName: 'Inside Heel Hook', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Wrestle-up single leg sweep', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Back control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Hip elevation', value: 'backside 50/50', allowedCategories: ['Positions', 'Leg Locks'] },
      { label: 'Inversion threat', value: 'inside heel hook', allowedCategories: ['Leg Locks', 'Positions'] }
    ]
  },
  'single-leg x sweep setups': {
    question: 'Which Single-Leg X sweep branch do you want to continue from?',
    options: [
      {
        label: 'Far-hip kuzushi',
        nextPrompt: {
          question: 'What reaction did the far-hip kuzushi create?',
          options: [
            { label: 'Basic sweep lane opens', value: 'basic single-leg x sweep', enterTree: true, focusName: 'Basic Single-Leg X Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Stand-up sweep lane opens', value: 'single-leg x stand-up sweep', enterTree: true, focusName: 'Single-Leg X Stand-Up Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Tren-lock lane opens', value: 'tren lock', enterTree: true, focusName: 'Tren Lock', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Caio-Terra-lock lane opens', value: 'caio terra lock', enterTree: true, focusName: 'Caio Terra Lock', allowedCategories: ['Leg Locks', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Stand-up threat',
        nextPrompt: {
          question: 'What continuation do you want from the stand-up threat?',
          options: [
            { label: 'Single-Leg X stand-up sweep', value: 'single-leg x stand-up sweep', enterTree: true, focusName: 'Single-Leg X Stand-Up Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Basic Single-Leg X sweep', value: 'basic single-leg x sweep', enterTree: true, focusName: 'Basic Single-Leg X Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Tren Lock', value: 'tren lock', enterTree: true, focusName: 'Tren Lock', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Caio Terra Lock', value: 'caio terra lock', enterTree: true, focusName: 'Caio Terra Lock', allowedCategories: ['Leg Locks', 'Submissions'] }
          ]
        }
      },
      { label: 'Ankle steering', value: 'straight ankle lock', allowedCategories: ['Leg Locks', 'Positions'] },
      { label: 'Under-leg lift', value: 'basic single-leg x sweep', allowedCategories: ['Sweeps', 'Positions'] }
    ]
  },
  'north-south passing setups': {
    question: 'Which north-south passing branch do you want to continue from?',
    options: [
      {
        label: 'Cross-step turn',
        nextPrompt: {
          question: 'What opening did the cross-step turn create?',
          options: [
            { label: 'North-south pass', value: 'north south pass', enterTree: true, focusName: 'North-South Pass', allowedCategories: ['Passing'] },
            { label: 'North-south choke', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Float redirect',
        nextPrompt: {
          question: 'What continuation do you want from the float redirect?',
          options: [
            { label: 'North-south pass', value: 'north south pass', enterTree: true, focusName: 'North-South Pass', allowedCategories: ['Passing'] },
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'North-south choke', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Back control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Stack pressure', value: 'north south pass', allowedCategories: ['Passing', 'Positions'] },
      { label: 'Shoulder-line win', value: 'north south choke', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'side-control passing transitions': {
    question: 'Which side-control transition branch do you want to continue from?',
    options: [
      {
        label: 'Crossface settle',
        nextPrompt: {
          question: 'What transition do you want after the crossface settle?',
          options: [
            { label: 'Pass to knee on belly', value: 'pass to knee on belly', enterTree: true, focusName: 'Pass To Knee On Belly', allowedCategories: ['Passing'] },
            { label: 'Mount', value: 'mount', enterTree: true, focusName: 'Mount', allowedCategories: ['Positions', 'Submissions'] },
            { label: 'North-south pass', value: 'north south pass', enterTree: true, focusName: 'North-South Pass', allowedCategories: ['Passing'] },
            { label: 'Back control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Hip switch',
        nextPrompt: {
          question: 'What continuation do you want from the hip switch?',
          options: [
            { label: 'North-south pass', value: 'north south pass', enterTree: true, focusName: 'North-South Pass', allowedCategories: ['Passing'] },
            { label: 'Pass to knee on belly', value: 'pass to knee on belly', enterTree: true, focusName: 'Pass To Knee On Belly', allowedCategories: ['Passing'] },
            { label: 'Mount', value: 'mount', enterTree: true, focusName: 'Mount', allowedCategories: ['Positions', 'Submissions'] },
            { label: 'Back control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Near-side underhook', value: 'mount', allowedCategories: ['Positions', 'Submissions'] },
      { label: 'Far-hip block', value: 'pass to knee on belly', allowedCategories: ['Passing', 'Positions'] }
    ]
  },
  'top turtle setups': {
    question: 'Which top turtle branch do you want to continue from?',
    options: [
      {
        label: 'Front headlock clamp',
        nextPrompt: {
          question: 'What reaction did the front-headlock clamp create?',
          options: [
            { label: 'Go-behind lane opens', value: 'front headlock go-behind', enterTree: true, focusName: 'Front Headlock Go-Behind', allowedCategories: ['Back Takes', 'Takedowns'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Mat-return lane opens', value: 'mat return', enterTree: true, focusName: 'Mat Return', allowedCategories: ['Takedowns'] },
            { label: 'Punch-choke lane opens', value: 'punch choke', enterTree: true, focusName: 'Punch Choke', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Spiral ride',
        nextPrompt: {
          question: 'What continuation do you want from the spiral ride?',
          options: [
            { label: 'Back control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Mat return', value: 'mat return', enterTree: true, focusName: 'Mat Return', allowedCategories: ['Takedowns'] },
            { label: 'Front headlock go-behind', value: 'front headlock go-behind', enterTree: true, focusName: 'Front Headlock Go-Behind', allowedCategories: ['Back Takes', 'Takedowns'] },
            { label: 'Punch choke', value: 'punch choke', enterTree: true, focusName: 'Punch Choke', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Near-hip block', value: 'mat return', allowedCategories: ['Takedowns', 'Positions'] },
      { label: 'Seatbelt chase', value: 'back control', allowedCategories: ['Back Takes', 'Positions'] }
    ]
  },
  'leg-entanglement entry setups': {
    question: 'Which leg-entanglement entry branch do you want to continue from?',
    options: [
      {
        label: 'Ankle exposure',
        nextPrompt: {
          question: 'What reaction did the ankle exposure create?',
          options: [
            { label: 'Ashi Garami lane opens', value: 'ashi garami', enterTree: true, focusName: 'Ashi Garami', allowedCategories: ['Positions', 'Leg Locks'] },
            { label: '50/50 lane opens', value: '50/50', enterTree: true, focusName: '50/50', allowedCategories: ['Positions', 'Leg Locks'] },
            { label: 'Backside 50/50 lane opens', value: 'backside 50/50', enterTree: true, focusName: 'Backside 50/50', allowedCategories: ['Positions', 'Leg Locks'] },
            { label: 'Straight-ankle lane opens', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Leg Locks', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Seated pull-in',
        nextPrompt: {
          question: 'What continuation do you want from the seated pull-in?',
          options: [
            { label: 'Ashi Garami', value: 'ashi garami', enterTree: true, focusName: 'Ashi Garami', allowedCategories: ['Positions', 'Leg Locks'] },
            { label: '50/50', value: '50/50', enterTree: true, focusName: '50/50', allowedCategories: ['Positions', 'Leg Locks'] },
            { label: 'Backside 50/50', value: 'backside 50/50', enterTree: true, focusName: 'Backside 50/50', allowedCategories: ['Positions', 'Leg Locks'] },
            { label: 'Straight ankle lock', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Leg Locks', 'Submissions'] }
          ]
        }
      },
      { label: 'Hip turn-off', value: 'ashi garami', allowedCategories: ['Positions', 'Leg Locks'] },
      { label: 'Wrestle-up redirect', value: '50/50', allowedCategories: ['Positions', 'Leg Locks'] }
    ]
  },
  'mount escape-to-reguard setups': {
    question: 'Which mount escape-to-reguard branch do you want to continue from?',
    options: [
      {
        label: 'Elbow-knee frame',
        nextPrompt: {
          question: 'What reaction did the elbow-knee frame create?',
          options: [
            { label: 'Half-guard recovery lane opens', value: 'half guard', enterTree: true, focusName: 'Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Closed-guard lane opens', value: 'closed guard', enterTree: true, focusName: 'Closed Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Wrestle-up lane opens', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Technical-stand-up lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Bridge to hip turn',
        nextPrompt: {
          question: 'What continuation do you want from the bridge-to-hip-turn reaction?',
          options: [
            { label: 'Half guard recovery', value: 'half guard', enterTree: true, focusName: 'Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Closed guard', value: 'closed guard', enterTree: true, focusName: 'Closed Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Wrestle-up single leg sweep', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Technical stand-up sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      { label: 'Forearm frame', value: 'half guard', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Knee-recover window', value: 'closed guard', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'back escape setups': {
    question: 'Which back escape branch do you want to continue from?',
    options: [
      {
        label: 'Choking-hand strip',
        nextPrompt: {
          question: 'What reaction did the choking-hand strip create?',
          options: [
            { label: 'Half-guard recovery lane opens', value: 'half guard', enterTree: true, focusName: 'Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Closed-guard lane opens', value: 'closed guard', enterTree: true, focusName: 'Closed Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Single-leg counter lane opens', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Top-turtle lane opens', value: 'turtle', enterTree: true, focusName: 'Turtle', allowedCategories: ['Positions', 'Back Takes'] }
          ]
        }
      },
      {
        label: 'Shoulder slide',
        nextPrompt: {
          question: 'What continuation do you want from the shoulder slide?',
          options: [
            { label: 'Half guard recovery', value: 'half guard', enterTree: true, focusName: 'Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Closed guard', value: 'closed guard', enterTree: true, focusName: 'Closed Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Single leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Top turtle', value: 'turtle', enterTree: true, focusName: 'Turtle', allowedCategories: ['Positions', 'Back Takes'] }
          ]
        }
      },
      { label: 'Hip scoot', value: 'half guard', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Guard-reconnect window', value: 'closed guard', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'open-guard passing setups': {
    question: 'Which open-guard passing branch do you want to continue from?',
    options: [
      {
        label: 'Grip break',
        nextPrompt: {
          question: 'What opening did the grip break create?',
          options: [
            { label: 'Torreando lane opens', value: 'torreando pass', enterTree: true, focusName: 'Torreando Pass', allowedCategories: ['Passing'] },
            { label: 'Leg-drag lane opens', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing'] },
            { label: 'Body-lock lane opens', value: 'body lock pass', enterTree: true, focusName: 'Body Lock Pass', allowedCategories: ['Passing'] },
            { label: 'Knee-slice lane opens', value: 'knee slice pass', enterTree: true, focusName: 'Knee Slice Pass', allowedCategories: ['Passing'] }
          ]
        }
      },
      {
        label: 'Outside-angle step',
        nextPrompt: {
          question: 'What continuation do you want from the outside-angle step?',
          options: [
            { label: 'Torreando pass', value: 'torreando pass', enterTree: true, focusName: 'Torreando Pass', allowedCategories: ['Passing'] },
            { label: 'Leg drag', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing'] },
            { label: 'Body lock pass', value: 'body lock pass', enterTree: true, focusName: 'Body Lock Pass', allowedCategories: ['Passing'] },
            { label: 'Knee slice pass', value: 'knee slice pass', enterTree: true, focusName: 'Knee Slice Pass', allowedCategories: ['Passing'] }
          ]
        }
      },
      { label: 'Ankle steering', value: 'torreando pass', allowedCategories: ['Passing', 'Positions'] },
      { label: 'Body position win', value: 'body lock pass', allowedCategories: ['Passing', 'Positions'] }
    ]
  },
  'north-south submission setups': {
    question: 'Which north-south submission branch do you want to continue from?',
    options: [
      {
        label: 'Shoulder turn',
        nextPrompt: {
          question: 'What reaction did the shoulder turn create?',
          options: [
            { label: 'North-south choke lane opens', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Side-control armbar lane opens', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Elbow-hide pressure',
        nextPrompt: {
          question: 'What continuation do you want from the elbow-hide pressure?',
          options: [
            { label: 'North-south choke', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Straight armbar from side control', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] },
            { label: 'Back control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Near-arm scoop', value: 'kimura', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'North-south float', value: 'north south choke', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'side-control escape setups': {
    question: 'Which side-control escape branch do you want to continue from?',
    options: [
      {
        label: 'Forearm frame',
        nextPrompt: {
          question: 'What reaction did the forearm frame create?',
          options: [
            { label: 'Half-guard recovery lane opens', value: 'half guard', enterTree: true, focusName: 'Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Closed-guard lane opens', value: 'closed guard', enterTree: true, focusName: 'Closed Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Technical-stand-up lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Single-leg lane opens', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      {
        label: 'Underhook win',
        nextPrompt: {
          question: 'What continuation do you want from the underhook win?',
          options: [
            { label: 'Single leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Technical stand-up sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Half guard recovery', value: 'half guard', enterTree: true, focusName: 'Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Closed guard', value: 'closed guard', enterTree: true, focusName: 'Closed Guard', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      { label: 'Shoulder turn', value: 'half guard', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Knee-recover window', value: 'closed guard', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'half-guard bottom submission setups': {
    question: 'Which bottom-half-guard submission branch do you want to continue from?',
    options: [
      {
        label: 'Shoulder crunch',
        nextPrompt: {
          question: 'What reaction did the shoulder crunch create?',
          options: [
            { label: 'Choi Bar lane opens', value: 'choi bar', enterTree: true, focusName: 'Choi Bar', allowedCategories: ['Submissions'] },
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Triangle lane opens', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Guillotine lane opens', value: 'guillotine', enterTree: true, focusName: 'Guillotine', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Knee-shield angle',
        nextPrompt: {
          question: 'What continuation do you want from the knee-shield angle?',
          options: [
            { label: 'Guillotine', value: 'guillotine', enterTree: true, focusName: 'Guillotine', allowedCategories: ['Submissions'] },
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Choi Bar', value: 'choi bar', enterTree: true, focusName: 'Choi Bar', allowedCategories: ['Submissions'] },
            { label: 'Triangle choke', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Overhook clamp', value: 'triangle choke', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Head-position win', value: 'guillotine', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'turtle escape setups': {
    question: 'Which turtle escape branch do you want to continue from?',
    options: [
      {
        label: 'Hand fight clear',
        nextPrompt: {
          question: 'What reaction did the hand-fight clear create?',
          options: [
            { label: 'Single-leg lane opens', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Technical-stand-up lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Front-headlock-standing lane opens', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Takedowns', 'Positions'] },
            { label: 'Closed-guard lane opens', value: 'closed guard', enterTree: true, focusName: 'Closed Guard', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      {
        label: 'Peek-out threat',
        nextPrompt: {
          question: 'What continuation do you want from the peek-out threat?',
          options: [
            { label: 'Single leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Technical stand-up sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Front headlock standing', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Takedowns', 'Positions'] },
            { label: 'Closed guard', value: 'closed guard', enterTree: true, focusName: 'Closed Guard', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      { label: 'Base build', value: 'technical stand-up sweep', allowedCategories: ['Sweeps', 'Positions'] },
      { label: 'Hip-turn window', value: 'single leg', allowedCategories: ['Takedowns', 'Positions'] }
    ]
  },
  'leg-drag counter / reguard setups': {
    question: 'Which leg-drag counter / reguard branch do you want to continue from?',
    options: [
      {
        label: 'Hip turn frame',
        nextPrompt: {
          question: 'What reaction did the hip-turn frame create?',
          options: [
            { label: 'Open-guard recovery lane opens', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Technical-stand-up lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Wrestle-up lane opens', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Inversion threat',
        nextPrompt: {
          question: 'What continuation do you want from the inversion threat?',
          options: [
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Open guard recovery', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Technical stand-up sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Wrestle-up single leg sweep', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      { label: 'Far-hip post', value: 'open guard', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Inside-knee reconnect', value: 'single leg x', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'mount escape setups': {
    question: 'Which mount escape branch do you want to continue from?',
    options: [
      {
        label: 'Elbow-knee frame',
        nextPrompt: {
          question: 'What reaction did the elbow-knee frame create?',
          options: [
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Straight-ankle lane opens', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Technical-stand-up lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Wrestle-up lane opens', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Far-leg catch',
        nextPrompt: {
          question: 'What continuation do you want from the far-leg catch?',
          options: [
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Straight ankle lock', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Technical stand-up sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Wrestle-up single leg sweep', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      { label: 'Bridge to knee line', value: 'single leg x', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Leg pummel reconnect', value: 'straight ankle lock', allowedCategories: ['Leg Locks', 'Positions'] }
    ]
  },
  'north-south escape-to-reguard setups': {
    question: 'Which north-south escape-to-reguard branch do you want to continue from?',
    options: [
      {
        label: 'Shoulder turn',
        nextPrompt: {
          question: 'What reaction did the shoulder turn create?',
          options: [
            { label: 'Open-guard recovery lane opens', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Half-guard recovery lane opens', value: 'half guard', enterTree: true, focusName: 'Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Technical-stand-up lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Near-leg catch',
        nextPrompt: {
          question: 'What continuation do you want from the near-leg catch?',
          options: [
            { label: 'Open guard recovery', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Half guard recovery', value: 'half guard', enterTree: true, focusName: 'Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Technical stand-up sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      { label: 'Near-elbow frame', value: 'open guard', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Hip reconnect', value: 'half guard', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'seatbelt / back-take entry setups': {
    question: 'Which seatbelt / back-take entry branch do you want to continue from?',
    options: [
      {
        label: 'Arm drag',
        nextPrompt: {
          question: 'What reaction did the arm drag create?',
          options: [
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Rear-body-lock lane opens', value: 'rear body lock standing', enterTree: true, focusName: 'Rear Body Lock Standing', allowedCategories: ['Takedowns', 'Positions'] },
            { label: 'Mat-return lane opens', value: 'mat return', enterTree: true, focusName: 'Mat Return', allowedCategories: ['Takedowns'] },
            { label: 'Front-headlock-go-behind lane opens', value: 'front headlock go-behind', enterTree: true, focusName: 'Front Headlock Go-Behind', allowedCategories: ['Back Takes', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Seatbelt chase',
        nextPrompt: {
          question: 'What continuation do you want from the seatbelt chase?',
          options: [
            { label: 'Back control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Rear body lock standing', value: 'rear body lock standing', enterTree: true, focusName: 'Rear Body Lock Standing', allowedCategories: ['Takedowns', 'Positions'] },
            { label: 'Mat return', value: 'mat return', enterTree: true, focusName: 'Mat Return', allowedCategories: ['Takedowns'] },
            { label: 'Front headlock go-behind', value: 'front headlock go-behind', enterTree: true, focusName: 'Front Headlock Go-Behind', allowedCategories: ['Back Takes', 'Takedowns'] }
          ]
        }
      },
      { label: 'Duck under', value: 'back control', allowedCategories: ['Back Takes', 'Positions'] },
      { label: 'Snap down', value: 'front headlock go-behind', allowedCategories: ['Back Takes', 'Takedowns'] }
    ]
  },
  'crab-ride attack setups': {
    question: 'Which crab-ride attack branch do you want to continue from?',
    options: [
      {
        label: 'Leg pummel',
        nextPrompt: {
          question: 'What reaction did the leg pummel create?',
          options: [
            { label: 'Crab-ride lane opens', value: 'crab ride', enterTree: true, focusName: 'Crab Ride', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Backside-50/50 lane opens', value: 'backside 50/50', enterTree: true, focusName: 'Backside 50/50', allowedCategories: ['Positions', 'Leg Locks'] },
            { label: 'Wrestle-up lane opens', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Backside angle',
        nextPrompt: {
          question: 'What continuation do you want from the backside angle?',
          options: [
            { label: 'Crab ride', value: 'crab ride', enterTree: true, focusName: 'Crab Ride', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Back control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Backside 50/50', value: 'backside 50/50', enterTree: true, focusName: 'Backside 50/50', allowedCategories: ['Positions', 'Leg Locks'] },
            { label: 'Wrestle-up single leg sweep', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      { label: 'Hip turn-off', value: 'crab ride', allowedCategories: ['Back Takes', 'Positions'] },
      { label: 'Far-hip pull', value: 'back control', allowedCategories: ['Back Takes', 'Positions'] }
    ]
  },
  'standing front-headlock finish setups': {
    question: 'Which standing front-headlock finish branch do you want to continue from?',
    options: [
      {
        label: 'Shoulder drop',
        nextPrompt: {
          question: 'What reaction did the shoulder drop create?',
          options: [
            { label: 'Guillotine lane opens', value: 'guillotine', enterTree: true, focusName: 'Guillotine', allowedCategories: ['Submissions'] },
            { label: "D'Arce lane opens", value: "d'arce choke", enterTree: true, focusName: "D'Arce Choke", allowedCategories: ['Submissions'] },
            { label: 'Anaconda lane opens', value: 'anaconda choke', enterTree: true, focusName: 'Anaconda Choke', allowedCategories: ['Submissions'] },
            { label: 'Go-behind lane opens', value: 'front headlock go-behind', enterTree: true, focusName: 'Front Headlock Go-Behind', allowedCategories: ['Back Takes', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Angle step',
        nextPrompt: {
          question: 'What continuation do you want from the angle step?',
          options: [
            { label: 'Guillotine', value: 'guillotine', enterTree: true, focusName: 'Guillotine', allowedCategories: ['Submissions'] },
            { label: "D'Arce choke", value: "d'arce choke", enterTree: true, focusName: "D'Arce Choke", allowedCategories: ['Submissions'] },
            { label: 'Anaconda choke', value: 'anaconda choke', enterTree: true, focusName: 'Anaconda Choke', allowedCategories: ['Submissions'] },
            { label: 'Front headlock go-behind', value: 'front headlock go-behind', enterTree: true, focusName: 'Front Headlock Go-Behind', allowedCategories: ['Back Takes', 'Takedowns'] }
          ]
        }
      },
      { label: 'Elbow control', value: "d'arce choke", allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Head clamp', value: 'guillotine', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'guard retention setups': {
    question: 'Which guard-retention branch do you want to continue from?',
    options: [
      {
        label: 'Leg pummel',
        nextPrompt: {
          question: 'What reaction did the leg pummel create?',
          options: [
            { label: 'Open-guard-recovery lane opens', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Wrestle-up lane opens', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Technical-stand-up lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Far-hip off-balance',
        nextPrompt: {
          question: 'What continuation do you want from the far-hip off-balance?',
          options: [
            { label: 'Wrestle-up single leg sweep', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Open guard recovery', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Technical stand-up sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      { label: 'Hip turn', value: 'open guard', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Frame rebuild', value: 'single leg x', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  '50/50 counter setups': {
    question: 'Which 50/50 counter branch do you want to continue from?',
    options: [
      {
        label: 'Hand fight clear',
        nextPrompt: {
          question: 'What reaction did the hand-fight clear create?',
          options: [
            { label: 'Basic 50/50 sweep lane opens', value: 'basic 50/50 sweep', enterTree: true, focusName: 'Basic 50/50 Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Standing lane opens', value: 'standing', enterTree: true, focusName: 'Standing', allowedCategories: ['Positions', 'Takedowns'] },
            { label: 'Straight-ankle lane opens', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Backside-50/50 lane opens', value: 'backside 50/50', enterTree: true, focusName: 'Backside 50/50', allowedCategories: ['Positions', 'Leg Locks'] }
          ]
        }
      },
      {
        label: 'Knee-line slip',
        nextPrompt: {
          question: 'What continuation do you want from the knee-line slip?',
          options: [
            { label: 'Stand up', value: 'standing', enterTree: true, focusName: 'Standing', allowedCategories: ['Positions', 'Takedowns'] },
            { label: 'Basic 50/50 sweep', value: 'basic 50/50 sweep', enterTree: true, focusName: 'Basic 50/50 Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Straight ankle lock', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Backside 50/50', value: 'backside 50/50', enterTree: true, focusName: 'Backside 50/50', allowedCategories: ['Positions', 'Leg Locks'] }
          ]
        }
      },
      { label: 'Heel-hide turn', value: 'standing', allowedCategories: ['Positions', 'Leg Locks'] },
      { label: 'Stand-up window', value: 'basic 50/50 sweep', allowedCategories: ['Sweeps', 'Positions'] }
    ]
  },
  'top-half-guard passing transitions': {
    question: 'Which top-half-guard passing transition branch do you want to continue from?',
    options: [
      {
        label: 'Crossface settle',
        nextPrompt: {
          question: 'What reaction did the crossface settle create?',
          options: [
            { label: 'Knee-cut lane opens', value: 'knee cut', enterTree: true, focusName: 'Knee Cut', allowedCategories: ['Passing'] },
            { label: 'Smash-pass lane opens', value: 'half guard smash pass', enterTree: true, focusName: 'Half Guard Smash Pass', allowedCategories: ['Passing'] },
            { label: 'Backstep lane opens', value: 'backstep half guard pass', enterTree: true, focusName: 'Backstep Half Guard Pass', allowedCategories: ['Passing'] },
            { label: 'Mount lane opens', value: 'mount', enterTree: true, focusName: 'Mount', allowedCategories: ['Positions', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Hip switch',
        nextPrompt: {
          question: 'What continuation do you want from the hip switch?',
          options: [
            { label: 'Backstep half-guard pass', value: 'backstep half guard pass', enterTree: true, focusName: 'Backstep Half Guard Pass', allowedCategories: ['Passing'] },
            { label: 'Knee cut', value: 'knee cut', enterTree: true, focusName: 'Knee Cut', allowedCategories: ['Passing'] },
            { label: 'Half guard smash pass', value: 'half guard smash pass', enterTree: true, focusName: 'Half Guard Smash Pass', allowedCategories: ['Passing'] },
            { label: 'Mount', value: 'mount', enterTree: true, focusName: 'Mount', allowedCategories: ['Positions', 'Submissions'] }
          ]
        }
      },
      { label: 'Far-hip block', value: 'knee cut', allowedCategories: ['Passing', 'Positions'] },
      { label: 'Underhook climb', value: 'half guard smash pass', allowedCategories: ['Passing', 'Positions'] }
    ]
  },
  'turtle top submission setups': {
    question: 'Which turtle top submission branch do you want to continue from?',
    options: [
      {
        label: 'Front headlock clamp',
        nextPrompt: {
          question: 'What reaction did the front-headlock clamp create?',
          options: [
            { label: 'Guillotine lane opens', value: 'guillotine', enterTree: true, focusName: 'Guillotine', allowedCategories: ['Submissions'] },
            { label: "D'Arce lane opens", value: "d'arce choke", enterTree: true, focusName: "D'Arce Choke", allowedCategories: ['Submissions'] },
            { label: 'Anaconda lane opens', value: 'anaconda choke', enterTree: true, focusName: 'Anaconda Choke', allowedCategories: ['Submissions'] },
            { label: 'Punch-choke lane opens', value: 'punch choke', enterTree: true, focusName: 'Punch Choke', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Spiral ride flatten',
        nextPrompt: {
          question: 'What continuation do you want from the spiral-ride flatten?',
          options: [
            { label: 'Punch choke', value: 'punch choke', enterTree: true, focusName: 'Punch Choke', allowedCategories: ['Submissions'] },
            { label: 'Guillotine', value: 'guillotine', enterTree: true, focusName: 'Guillotine', allowedCategories: ['Submissions'] },
            { label: "D'Arce choke", value: "d'arce choke", enterTree: true, focusName: "D'Arce Choke", allowedCategories: ['Submissions'] },
            { label: 'Anaconda choke', value: 'anaconda choke', enterTree: true, focusName: 'Anaconda Choke', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Near-elbow trap', value: 'punch choke', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Shoulder turn', value: 'guillotine', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'closed-guard retention-to-wrestle-up setups': {
    question: 'Which closed-guard retention-to-wrestle-up branch do you want to continue from?',
    options: [
      {
        label: 'Collar pull',
        nextPrompt: {
          question: 'What reaction did the collar pull create?',
          options: [
            { label: 'Shin-to-shin lane opens', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Wrestle-up lane opens', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Technical-stand-up lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Hand post read',
        nextPrompt: {
          question: 'What continuation do you want from the hand-post read?',
          options: [
            { label: 'Shin-to-shin', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Wrestle-up single leg sweep', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Technical stand-up sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      { label: 'Hip scoot out', value: 'shin to shin', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Knee-line reconnect', value: 'single leg x', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'outside-ashi attack setups': {
    question: 'Which outside-ashi attack branch do you want to continue from?',
    options: [
      {
        label: 'Outside leg exposure',
        nextPrompt: {
          question: 'What reaction did the outside-leg exposure create?',
          options: [
            { label: 'Straight-ankle lane opens', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Aoki-lock lane opens', value: 'aoki lock', enterTree: true, focusName: 'Aoki Lock', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Outside-heel lane opens', value: 'outside heel hook', enterTree: true, focusName: 'Outside Heel Hook', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Leg-drag lane opens', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing'] }
          ]
        }
      },
      {
        label: 'Hip turn-off',
        nextPrompt: {
          question: 'What continuation do you want from the hip turn-off?',
          options: [
            { label: 'Aoki Lock', value: 'aoki lock', enterTree: true, focusName: 'Aoki Lock', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Straight ankle lock', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Outside heel hook', value: 'outside heel hook', enterTree: true, focusName: 'Outside Heel Hook', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Leg drag', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing'] }
          ]
        }
      },
      { label: 'Knee-line clamp', value: 'straight ankle lock', allowedCategories: ['Leg Locks', 'Positions'] },
      { label: 'Foot-line catch', value: 'aoki lock', allowedCategories: ['Leg Locks', 'Positions'] }
    ]
  },
  'front-headlock defense-to-wrestle-up setups': {
    question: 'Which front-headlock defense-to-wrestle-up branch do you want to continue from?',
    options: [
      {
        label: 'Hand fight clear',
        nextPrompt: {
          question: 'What reaction did the hand-fight clear create?',
          options: [
            { label: 'Single-leg lane opens', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Technical-stand-up lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Open-guard-recovery lane opens', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Shin-to-shin lane opens', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      {
        label: 'Hip turn-out',
        nextPrompt: {
          question: 'What continuation do you want from the hip turn-out?',
          options: [
            { label: 'Single leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Technical stand-up sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Open guard recovery', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Shin-to-shin', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      { label: 'Shoulder posture recover', value: 'open guard', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Peek-to-leg', value: 'single leg', allowedCategories: ['Takedowns', 'Positions'] }
    ]
  },
  'de la riva footlock setups': {
    question: 'Which De La Riva footlock branch do you want to continue from?',
    options: [
      {
        label: 'De La Riva hook',
        nextPrompt: {
          question: 'What reaction did the DLR hook create?',
          options: [
            { label: 'Caio-Terra-lock lane opens', value: 'caio terra lock', enterTree: true, focusName: 'Caio Terra Lock', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Straight-ankle lane opens', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'DLR sweep lane opens', value: 'basic de la riva off-balance sweep', enterTree: true, focusName: 'Basic De La Riva Off-Balance Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      {
        label: 'Foot-line catch',
        nextPrompt: {
          question: 'What continuation do you want from the foot-line catch?',
          options: [
            { label: 'Caio Terra Lock', value: 'caio terra lock', enterTree: true, focusName: 'Caio Terra Lock', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Straight ankle lock', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Basic DLR off-balance sweep', value: 'basic de la riva off-balance sweep', enterTree: true, focusName: 'Basic De La Riva Off-Balance Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      { label: 'Outside-hip turn', value: 'caio terra lock', allowedCategories: ['Leg Locks', 'Positions'] },
      { label: 'Ankle exposure', value: 'straight ankle lock', allowedCategories: ['Leg Locks', 'Positions'] }
    ]
  },
  'ashi defense-to-stand-up setups': {
    question: 'Which Ashi defense-to-stand-up branch do you want to continue from?',
    options: [
      {
        label: 'Hand fight clear',
        nextPrompt: {
          question: 'What reaction did the hand-fight clear create?',
          options: [
            { label: 'Standing lane opens', value: 'standing', enterTree: true, focusName: 'Standing', allowedCategories: ['Positions', 'Takedowns'] },
            { label: 'Open-guard-recovery lane opens', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Straight-ankle-counter lane opens', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Leg Locks', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Knee-line slip',
        nextPrompt: {
          question: 'What continuation do you want from the knee-line slip?',
          options: [
            { label: 'Stand up', value: 'standing', enterTree: true, focusName: 'Standing', allowedCategories: ['Positions', 'Takedowns'] },
            { label: 'Open guard recovery', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Straight ankle lock', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Leg Locks', 'Submissions'] }
          ]
        }
      },
      { label: 'Hip turn-up', value: 'standing', allowedCategories: ['Positions', 'Leg Locks'] },
      { label: 'Stand-up window', value: 'open guard', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'top side-control-to-back setups': {
    question: 'Which top side-control-to-back branch do you want to continue from?',
    options: [
      {
        label: 'Crossface pressure',
        nextPrompt: {
          question: 'What reaction did the crossface pressure create?',
          options: [
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Technical-mount-to-back lane opens', value: 'technical mount to back', enterTree: true, focusName: 'Technical Mount To Back', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Seatbelt lane opens', value: 'seatbelt', enterTree: true, focusName: 'Seatbelt', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Mat-return lane opens', value: 'mat return', enterTree: true, focusName: 'Mat Return', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      {
        label: 'Shoulder turn',
        nextPrompt: {
          question: 'What continuation do you want from the shoulder turn?',
          options: [
            { label: 'Back control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Technical mount to back', value: 'technical mount to back', enterTree: true, focusName: 'Technical Mount To Back', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Seatbelt', value: 'seatbelt', enterTree: true, focusName: 'Seatbelt', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Mat return', value: 'mat return', enterTree: true, focusName: 'Mat Return', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      { label: 'Near-hip block', value: 'technical mount to back', allowedCategories: ['Back Takes', 'Positions'] },
      { label: 'Elbow isolation', value: 'back control', allowedCategories: ['Back Takes', 'Positions'] }
    ]
  },
  'knee-shield retention-to-underhook setups': {
    question: 'Which knee-shield retention-to-underhook branch do you want to continue from?',
    options: [
      {
        label: 'Knee-shield frame',
        nextPrompt: {
          question: 'What reaction did the knee-shield frame create?',
          options: [
            { label: 'Underhook-half-guard lane opens', value: 'underhook half guard', enterTree: true, focusName: 'Underhook Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Dogfight lane opens', value: 'dogfight', enterTree: true, focusName: 'Dogfight', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Wrestle-up lane opens', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Shoulder-crunch lane opens', value: 'shoulder crunch', enterTree: true, focusName: 'Shoulder Crunch', allowedCategories: ['Positions', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Underhook pummel',
        nextPrompt: {
          question: 'What continuation do you want from the underhook pummel?',
          options: [
            { label: 'Underhook half guard', value: 'underhook half guard', enterTree: true, focusName: 'Underhook Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Dogfight', value: 'dogfight', enterTree: true, focusName: 'Dogfight', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Wrestle-up single leg sweep', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Shoulder crunch', value: 'shoulder crunch', enterTree: true, focusName: 'Shoulder Crunch', allowedCategories: ['Positions', 'Submissions'] }
          ]
        }
      },
      { label: 'Head position win', value: 'dogfight', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Inside elbow lift', value: 'underhook half guard', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'body-lock passing counters': {
    question: 'Which body-lock passing counter branch do you want to continue from?',
    options: [
      {
        label: 'Frame rebuild',
        nextPrompt: {
          question: 'What reaction did the frame rebuild create?',
          options: [
            { label: 'Open-guard-recovery lane opens', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Shin-to-shin lane opens', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Wrestle-up lane opens', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      {
        label: 'Hip turn-out',
        nextPrompt: {
          question: 'What continuation do you want from the hip turn-out?',
          options: [
            { label: 'Open guard recovery', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Shin to shin', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Wrestle-up single leg sweep', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      { label: 'Inside-knee reconnect', value: 'open guard', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Shin re-pummel', value: 'shin to shin', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'front-headlock defense-to-guard-recovery setups': {
    question: 'Which front-headlock defense-to-guard-recovery branch do you want to continue from?',
    options: [
      {
        label: 'Hand fight clear',
        nextPrompt: {
          question: 'What reaction did the hand-fight clear create?',
          options: [
            { label: 'Open-guard-recovery lane opens', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Shin-to-shin lane opens', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Knee-shield lane opens', value: 'knee shield half guard', enterTree: true, focusName: 'Knee Shield Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      {
        label: 'Shin insert',
        nextPrompt: {
          question: 'What continuation do you want from the shin insert?',
          options: [
            { label: 'Open guard recovery', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Shin to shin', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Knee Shield Half Guard', value: 'knee shield half guard', enterTree: true, focusName: 'Knee Shield Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      { label: 'Shoulder posture recover', value: 'open guard', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Hip turn-in', value: 'knee shield half guard', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'waiter-guard attack setups': {
    question: 'Which waiter-guard attack branch do you want to continue from?',
    options: [
      {
        label: 'Under-hip scoop',
        nextPrompt: {
          question: 'What reaction did the under-hip scoop create?',
          options: [
            { label: 'Waiter-sweep lane opens', value: 'deep half waiter sweep', enterTree: true, focusName: 'Deep Half Waiter Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Backside-50/50 lane opens', value: 'backside 50/50', enterTree: true, focusName: 'Backside 50/50', allowedCategories: ['Positions', 'Leg Locks'] },
            { label: 'Ashi-garami lane opens', value: 'ashi garami', enterTree: true, focusName: 'Ashi Garami', allowedCategories: ['Positions', 'Leg Locks'] }
          ]
        }
      },
      {
        label: 'Angle turn',
        nextPrompt: {
          question: 'What continuation do you want from the angle turn?',
          options: [
            { label: 'Deep-half waiter sweep', value: 'deep half waiter sweep', enterTree: true, focusName: 'Deep Half Waiter Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Backside 50/50', value: 'backside 50/50', enterTree: true, focusName: 'Backside 50/50', allowedCategories: ['Positions', 'Leg Locks'] },
            { label: 'Ashi Garami', value: 'ashi garami', enterTree: true, focusName: 'Ashi Garami', allowedCategories: ['Positions', 'Leg Locks'] }
          ]
        }
      },
      { label: 'Leg elevation', value: 'deep half waiter sweep', allowedCategories: ['Sweeps', 'Positions'] },
      { label: 'Far-hip lift', value: 'single leg x', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'baby-bolo / backside-entry setups': {
    question: 'Which baby-bolo / backside-entry branch do you want to continue from?',
    options: [
      {
        label: 'Inversion entry',
        nextPrompt: {
          question: 'What reaction did the inversion entry create?',
          options: [
            { label: 'Backside-50/50 lane opens', value: 'backside 50/50', enterTree: true, focusName: 'Backside 50/50', allowedCategories: ['Positions', 'Leg Locks'] },
            { label: 'Crab-ride lane opens', value: 'crab ride', enterTree: true, focusName: 'Crab Ride', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Kiss-of-the-dragon lane opens', value: 'kiss of the dragon', enterTree: true, focusName: 'Kiss Of The Dragon', allowedCategories: ['Back Takes', 'Positions'] }
          ]
        }
      },
      {
        label: 'Backside angle',
        nextPrompt: {
          question: 'What continuation do you want from the backside angle?',
          options: [
            { label: 'Backside 50/50', value: 'backside 50/50', enterTree: true, focusName: 'Backside 50/50', allowedCategories: ['Positions', 'Leg Locks'] },
            { label: 'Crab Ride', value: 'crab ride', enterTree: true, focusName: 'Crab Ride', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Kiss Of The Dragon', value: 'kiss of the dragon', enterTree: true, focusName: 'Kiss Of The Dragon', allowedCategories: ['Back Takes', 'Positions'] }
          ]
        }
      },
      { label: 'Far-hip catch', value: 'crab ride', allowedCategories: ['Back Takes', 'Positions'] },
      { label: 'Hip rotation', value: 'backside 50/50', allowedCategories: ['Positions', 'Leg Locks'] }
    ]
  },
  'leg-drag passing-to-submission setups': {
    question: 'Which leg-drag passing-to-submission branch do you want to continue from?',
    options: [
      {
        label: 'Shoulder flatten',
        nextPrompt: {
          question: 'What reaction did the shoulder flatten create?',
          options: [
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'North-south-choke lane opens', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Mount-armbar lane opens', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Near-arm trap',
        nextPrompt: {
          question: 'What continuation do you want from the near-arm trap?',
          options: [
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'North South Choke', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Straight Armbar From Mount', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Hip pin', value: 'kimura', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Crossface settle', value: 'north south choke', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'top-half-guard submission transitions': {
    question: 'Which top-half-guard submission transition branch do you want to continue from?',
    options: [
      {
        label: 'Crossface pressure',
        nextPrompt: {
          question: 'What reaction did the crossface pressure create?',
          options: [
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Arm-triangle lane opens', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] },
            { label: "D'Arce lane opens", value: "d'arce choke", enterTree: true, focusName: "D'Arce Choke", allowedCategories: ['Submissions'] },
            { label: 'Punch-choke lane opens', value: 'punch choke', enterTree: true, focusName: 'Punch Choke', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Kimura trap',
        nextPrompt: {
          question: 'What continuation do you want from the kimura trap?',
          options: [
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Arm Triangle', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] },
            { label: "D'Arce Choke", value: "d'arce choke", enterTree: true, focusName: "D'Arce Choke", allowedCategories: ['Submissions'] },
            { label: 'Punch Choke', value: 'punch choke', enterTree: true, focusName: 'Punch Choke', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Underhook climb', value: 'arm triangle', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Head-and-arm pin', value: "d'arce choke", allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'bottom-side-control-to-single-leg setups': {
    question: 'Which bottom-side-control-to-single-leg branch do you want to continue from?',
    options: [
      {
        label: 'Forearm frame',
        nextPrompt: {
          question: 'What reaction did the forearm frame create?',
          options: [
            { label: 'Single-leg lane opens', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Technical-stand-up lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Half-guard lane opens', value: 'half guard', enterTree: true, focusName: 'Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Shin-to-shin lane opens', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      {
        label: 'Underhook win',
        nextPrompt: {
          question: 'What continuation do you want from the underhook win?',
          options: [
            { label: 'Single Leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Technical Stand-Up Sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Half Guard', value: 'half guard', enterTree: true, focusName: 'Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Shin-To-Shin', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      { label: 'Shoulder turn', value: 'half guard', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Hip scoot out', value: 'single leg', allowedCategories: ['Takedowns', 'Positions'] }
    ]
  },
  'mount retention-to-attack setups': {
    question: 'Which mount retention-to-attack branch do you want to continue from?',
    options: [
      {
        label: 'Cross-wrist pin',
        nextPrompt: {
          question: 'What reaction did the cross-wrist pin create?',
          options: [
            { label: 'Mounted-triangle lane opens', value: 'mounted triangle', enterTree: true, focusName: 'Mounted Triangle', allowedCategories: ['Submissions'] },
            { label: 'Mount-armbar lane opens', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] },
            { label: 'Arm-triangle lane opens', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] },
            { label: 'Americana lane opens', value: 'americana', enterTree: true, focusName: 'Americana', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Gift-wrap reconnect',
        nextPrompt: {
          question: 'What continuation do you want from the gift-wrap reconnect?',
          options: [
            { label: 'Mounted Triangle', value: 'mounted triangle', enterTree: true, focusName: 'Mounted Triangle', allowedCategories: ['Submissions'] },
            { label: 'Straight Armbar From Mount', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] },
            { label: 'Arm Triangle', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] },
            { label: 'Americana', value: 'americana', enterTree: true, focusName: 'Americana', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Elbow walk', value: 'straight armbar from mount', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Shoulder pressure', value: 'arm triangle', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'shin-to-shin attack setups': {
    question: 'Which shin-to-shin attack branch do you want to continue from?',
    options: [
      {
        label: 'Shin clamp',
        nextPrompt: {
          question: 'What reaction did the shin clamp create?',
          options: [
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Wrestle-up lane opens', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Stand-up lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Ashi-garami lane opens', value: 'ashi garami', enterTree: true, focusName: 'Ashi Garami', allowedCategories: ['Positions', 'Leg Locks'] }
          ]
        }
      },
      {
        label: 'Stand-up threat',
        nextPrompt: {
          question: 'What continuation do you want from the stand-up threat?',
          options: [
            { label: 'Wrestle-up single leg sweep', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Technical stand-up sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Ashi Garami', value: 'ashi garami', enterTree: true, focusName: 'Ashi Garami', allowedCategories: ['Positions', 'Leg Locks'] }
          ]
        }
      },
      { label: 'Far-hand post', value: 'wrestle-up single leg sweep', allowedCategories: ['Sweeps', 'Positions'] },
      { label: 'Hip pull-in', value: 'single leg x', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'quarter-guard attack setups': {
    question: 'Which quarter-guard attack branch do you want to continue from?',
    options: [
      {
        label: 'Hip frame',
        nextPrompt: {
          question: 'What reaction did the hip frame create?',
          options: [
            { label: 'Dogfight lane opens', value: 'dogfight', enterTree: true, focusName: 'Dogfight', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Wrestle-up lane opens', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Waiter-sweep lane opens', value: 'deep half waiter sweep', enterTree: true, focusName: 'Deep Half Waiter Sweep', allowedCategories: ['Sweeps'] }
          ]
        }
      },
      {
        label: 'Underhook pummel',
        nextPrompt: {
          question: 'What continuation do you want from the underhook pummel?',
          options: [
            { label: 'Dogfight', value: 'dogfight', enterTree: true, focusName: 'Dogfight', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Wrestle-up single leg sweep', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Deep Half Waiter Sweep', value: 'deep half waiter sweep', enterTree: true, focusName: 'Deep Half Waiter Sweep', allowedCategories: ['Sweeps'] }
          ]
        }
      },
      { label: 'Inside-knee clamp', value: 'dogfight', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Shoulder crunch catch', value: 'single leg x', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'turtle front-headlock attack setups': {
    question: 'Which turtle front-headlock attack branch do you want to continue from?',
    options: [
      {
        label: 'Front headlock clamp',
        nextPrompt: {
          question: 'What reaction did the front-headlock clamp create?',
          options: [
            { label: 'Guillotine lane opens', value: 'guillotine', enterTree: true, focusName: 'Guillotine', allowedCategories: ['Submissions'] },
            { label: "D'Arce lane opens", value: "d'arce choke", enterTree: true, focusName: "D'Arce Choke", allowedCategories: ['Submissions'] },
            { label: 'Anaconda lane opens', value: 'anaconda choke', enterTree: true, focusName: 'Anaconda Choke', allowedCategories: ['Submissions'] },
            { label: 'Go-behind lane opens', value: 'front headlock go-behind', enterTree: true, focusName: 'Front Headlock Go-Behind', allowedCategories: ['Back Takes', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Angle step',
        nextPrompt: {
          question: 'What continuation do you want from the angle step?',
          options: [
            { label: 'Guillotine', value: 'guillotine', enterTree: true, focusName: 'Guillotine', allowedCategories: ['Submissions'] },
            { label: "D'Arce Choke", value: "d'arce choke", enterTree: true, focusName: "D'Arce Choke", allowedCategories: ['Submissions'] },
            { label: 'Anaconda Choke', value: 'anaconda choke', enterTree: true, focusName: 'Anaconda Choke', allowedCategories: ['Submissions'] },
            { label: 'Front Headlock Go-Behind', value: 'front headlock go-behind', enterTree: true, focusName: 'Front Headlock Go-Behind', allowedCategories: ['Back Takes', 'Takedowns'] }
          ]
        }
      },
      { label: 'Near-elbow trap', value: "d'arce choke", allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Shoulder turn', value: 'guillotine', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'top-side-control-to-mounted-triangle setups': {
    question: 'Which top-side-control-to-mounted-triangle branch do you want to continue from?',
    options: [
      {
        label: 'Near-arm isolation',
        nextPrompt: {
          question: 'What reaction did the near-arm isolation create?',
          options: [
            { label: 'Mounted-triangle lane opens', value: 'mounted triangle', enterTree: true, focusName: 'Mounted Triangle', allowedCategories: ['Submissions'] },
            { label: 'Mount-armbar lane opens', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] },
            { label: 'Arm-triangle lane opens', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] },
            { label: 'Americana lane opens', value: 'americana', enterTree: true, focusName: 'Americana', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Mount climb',
        nextPrompt: {
          question: 'What continuation do you want from the mount climb?',
          options: [
            { label: 'Mounted Triangle', value: 'mounted triangle', enterTree: true, focusName: 'Mounted Triangle', allowedCategories: ['Submissions'] },
            { label: 'Straight Armbar From Mount', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] },
            { label: 'Arm Triangle', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] },
            { label: 'Americana', value: 'americana', enterTree: true, focusName: 'Americana', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Shoulder pressure', value: 'mounted triangle', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Elbow-line exposure', value: 'straight armbar from mount', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'reverse de la riva retention-to-inversion setups': {
    question: 'Which Reverse De La Riva retention-to-inversion branch do you want to continue from?',
    options: [
      {
        label: 'Far-hip frame',
        nextPrompt: {
          question: 'What reaction did the far-hip frame create?',
          options: [
            { label: 'Kiss-of-the-Dragon lane opens', value: 'kiss of the dragon', enterTree: true, focusName: 'Kiss Of The Dragon', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Baby-bolo lane opens', value: 'baby bolo', enterTree: true, focusName: 'Baby Bolo', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Backside-50/50 lane opens', value: 'backside 50/50', enterTree: true, focusName: 'Backside 50/50', allowedCategories: ['Positions', 'Leg Locks'] },
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      {
        label: 'Inversion entry',
        nextPrompt: {
          question: 'What continuation do you want from the inversion entry?',
          options: [
            { label: 'Kiss Of The Dragon', value: 'kiss of the dragon', enterTree: true, focusName: 'Kiss Of The Dragon', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Baby Bolo', value: 'baby bolo', enterTree: true, focusName: 'Baby Bolo', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Backside 50/50', value: 'backside 50/50', enterTree: true, focusName: 'Backside 50/50', allowedCategories: ['Positions', 'Leg Locks'] },
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      { label: 'Hip turn', value: 'kiss of the dragon', allowedCategories: ['Back Takes', 'Positions'] },
      { label: 'Outside-leg track', value: 'single leg x', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'backside-50/50 attack setups': {
    question: 'Which backside-50/50 attack branch do you want to continue from?',
    options: [
      {
        label: 'Backside angle',
        nextPrompt: {
          question: 'What reaction did the backside angle create?',
          options: [
            { label: 'Inside-heel lane opens', value: 'inside heel hook', enterTree: true, focusName: 'Inside Heel Hook', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Lachy-lock lane opens', value: 'lachy lock', enterTree: true, focusName: 'Lachy Lock', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Crab-ride lane opens', value: 'crab ride', enterTree: true, focusName: 'Crab Ride', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Knee-line trap',
        nextPrompt: {
          question: 'What continuation do you want from the knee-line trap?',
          options: [
            { label: 'Inside Heel Hook', value: 'inside heel hook', enterTree: true, focusName: 'Inside Heel Hook', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Lachy Lock', value: 'lachy lock', enterTree: true, focusName: 'Lachy Lock', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Crab Ride', value: 'crab ride', enterTree: true, focusName: 'Crab Ride', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Hip turn-off', value: 'inside heel hook', allowedCategories: ['Leg Locks', 'Positions'] },
      { label: 'Far-hip pull', value: 'crab ride', allowedCategories: ['Back Takes', 'Positions'] }
    ]
  },
  'butterfly-half attack setups': {
    question: 'Which butterfly-half attack branch do you want to continue from?',
    options: [
      {
        label: 'Shoulder crunch',
        nextPrompt: {
          question: 'What reaction did the shoulder crunch create?',
          options: [
            { label: 'Shoulder-crunch-sweep lane opens', value: 'shoulder crunch butterfly sweep', enterTree: true, focusName: 'Shoulder Crunch Butterfly Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Wrestle-up lane opens', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Ashi-garami lane opens', value: 'ashi garami', enterTree: true, focusName: 'Ashi Garami', allowedCategories: ['Positions', 'Leg Locks'] }
          ]
        }
      },
      {
        label: 'Butterfly elevation',
        nextPrompt: {
          question: 'What continuation do you want from the butterfly elevation?',
          options: [
            { label: 'Shoulder Crunch Butterfly Sweep', value: 'shoulder crunch butterfly sweep', enterTree: true, focusName: 'Shoulder Crunch Butterfly Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Wrestle-Up Single Leg Sweep', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Ashi Garami', value: 'ashi garami', enterTree: true, focusName: 'Ashi Garami', allowedCategories: ['Positions', 'Leg Locks'] }
          ]
        }
      },
      { label: 'Underhook win', value: 'wrestle-up single leg sweep', allowedCategories: ['Sweeps', 'Positions'] },
      { label: 'Head position lift', value: 'single leg x', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'knee-cut passing-to-submission setups': {
    question: 'Which knee-cut passing-to-submission branch do you want to continue from?',
    options: [
      {
        label: 'Crossface win',
        nextPrompt: {
          question: 'What reaction did the crossface win create?',
          options: [
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'North-south-choke lane opens', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Mount-armbar lane opens', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] },
            { label: 'Arm-triangle lane opens', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Near-elbow exposure',
        nextPrompt: {
          question: 'What continuation do you want from the near-elbow exposure?',
          options: [
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'North South Choke', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Straight Armbar From Mount', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] },
            { label: 'Arm Triangle', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Shoulder flatten', value: 'kimura', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Head control', value: 'north south choke', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'underhook-half-guard attack setups': {
    question: 'Which underhook-half-guard attack branch do you want to continue from?',
    options: [
      {
        label: 'Underhook win',
        nextPrompt: {
          question: 'What reaction did the underhook win create?',
          options: [
            { label: 'Dogfight lane opens', value: 'dogfight', enterTree: true, focusName: 'Dogfight', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Come-up-sweep lane opens', value: 'underhook to come-up sweep', enterTree: true, focusName: 'Underhook To Come-Up Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      {
        label: 'Hip height build',
        nextPrompt: {
          question: 'What continuation do you want from the hip-height build?',
          options: [
            { label: 'Dogfight', value: 'dogfight', enterTree: true, focusName: 'Dogfight', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Underhook To Come-Up Sweep', value: 'underhook to come-up sweep', enterTree: true, focusName: 'Underhook To Come-Up Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      { label: 'Head position up', value: 'dogfight', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Angle turn', value: 'back control', allowedCategories: ['Back Takes', 'Positions'] }
    ]
  },
  'half-butterfly wrestle-up setups': {
    question: 'Which half-butterfly wrestle-up branch do you want to continue from?',
    options: [
      {
        label: 'Underhook win',
        nextPrompt: {
          question: 'What reaction did the underhook win create?',
          options: [
            { label: 'Wrestle-up lane opens', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Single-leg lane opens', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Butterfly-sweep lane opens', value: 'shoulder crunch butterfly sweep', enterTree: true, focusName: 'Shoulder Crunch Butterfly Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Dogfight lane opens', value: 'dogfight', enterTree: true, focusName: 'Dogfight', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      {
        label: 'Hook elevation',
        nextPrompt: {
          question: 'What continuation do you want from the hook elevation?',
          options: [
            { label: 'Single Leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Wrestle-Up Single Leg Sweep', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Shoulder Crunch Butterfly Sweep', value: 'shoulder crunch butterfly sweep', enterTree: true, focusName: 'Shoulder Crunch Butterfly Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Dogfight', value: 'dogfight', enterTree: true, focusName: 'Dogfight', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      { label: 'Shoulder crunch', value: 'shoulder crunch butterfly sweep', allowedCategories: ['Sweeps', 'Positions'] },
      { label: 'Hip scoot under', value: 'single leg', allowedCategories: ['Takedowns', 'Positions'] }
    ]
  },
  'open-guard retention-to-ashi setups': {
    question: 'Which open-guard retention-to-ashi branch do you want to continue from?',
    options: [
      {
        label: 'Leg pummel',
        nextPrompt: {
          question: 'What reaction did the leg pummel create?',
          options: [
            { label: 'Ashi-garami lane opens', value: 'ashi garami', enterTree: true, focusName: 'Ashi Garami', allowedCategories: ['Positions', 'Leg Locks'] },
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Straight-ankle lane opens', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Stand-up lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Ankle catch',
        nextPrompt: {
          question: 'What continuation do you want from the ankle catch?',
          options: [
            { label: 'Ashi Garami', value: 'ashi garami', enterTree: true, focusName: 'Ashi Garami', allowedCategories: ['Positions', 'Leg Locks'] },
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Straight Ankle Lock', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Leg Locks', 'Submissions'] },
            { label: 'Technical Stand-Up Sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      { label: 'Hip turn', value: 'ashi garami', allowedCategories: ['Positions', 'Leg Locks'] },
      { label: 'Far-hip redirect', value: 'single leg x', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'straight-ankle-lock defense-to-counter setups': {
    question: 'Which straight-ankle-lock defense-to-counter branch do you want to continue from?',
    options: [
      {
        label: 'Boot defense',
        nextPrompt: {
          question: 'What reaction did the boot defense create?',
          options: [
            { label: 'Standing lane opens', value: 'standing', enterTree: true, focusName: 'Standing', allowedCategories: ['Positions', 'Takedowns'] },
            { label: 'Open-guard-recovery lane opens', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Straight-ankle-counter lane opens', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Leg Locks', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Knee-line free',
        nextPrompt: {
          question: 'What continuation do you want once the knee line is free?',
          options: [
            { label: 'Stand up', value: 'standing', enterTree: true, focusName: 'Standing', allowedCategories: ['Positions', 'Takedowns'] },
            { label: 'Open guard recovery', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Straight Ankle Lock', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Leg Locks', 'Submissions'] }
          ]
        }
      },
      { label: 'Hand fight clear', value: 'standing', allowedCategories: ['Positions', 'Leg Locks'] },
      { label: 'Hip turn-out', value: 'open guard', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'collar-sleeve attack setups': {
    question: 'Which collar-sleeve attack branch do you want to continue from?',
    options: [
      {
        label: 'Collar pull',
        nextPrompt: {
          question: 'What reaction did the collar pull create?',
          options: [
            { label: 'Triangle lane opens', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Omoplata lane opens', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Armbar lane opens', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Balloon-sweep lane opens', value: 'balloon sweep', enterTree: true, focusName: 'Balloon Sweep', allowedCategories: ['Sweeps'] }
          ]
        }
      },
      {
        label: 'Hip angle shift',
        nextPrompt: {
          question: 'What continuation do you want from the hip-angle shift?',
          options: [
            { label: 'Triangle Choke', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Omoplata', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Straight Armbar From Guard', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Balloon Sweep', value: 'balloon sweep', enterTree: true, focusName: 'Balloon Sweep', allowedCategories: ['Sweeps'] }
          ]
        }
      },
      { label: 'Sleeve post control', value: 'triangle choke', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Far-hand read', value: 'balloon sweep', allowedCategories: ['Sweeps', 'Positions'] }
    ]
  },
  'top turtle ride-to-back setups': {
    question: 'Which top turtle ride-to-back branch do you want to continue from?',
    options: [
      {
        label: 'Spiral ride',
        nextPrompt: {
          question: 'What reaction did the spiral ride create?',
          options: [
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Rear-body-lock lane opens', value: 'rear body lock standing', enterTree: true, focusName: 'Rear Body Lock Standing', allowedCategories: ['Takedowns', 'Positions'] },
            { label: 'Mat-return lane opens', value: 'mat return', enterTree: true, focusName: 'Mat Return', allowedCategories: ['Takedowns'] },
            { label: 'Front-headlock-go-behind lane opens', value: 'front headlock go-behind', enterTree: true, focusName: 'Front Headlock Go-Behind', allowedCategories: ['Back Takes', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Seatbelt chase',
        nextPrompt: {
          question: 'What continuation do you want from the seatbelt chase?',
          options: [
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Rear Body Lock Standing', value: 'rear body lock standing', enterTree: true, focusName: 'Rear Body Lock Standing', allowedCategories: ['Takedowns', 'Positions'] },
            { label: 'Mat Return', value: 'mat return', enterTree: true, focusName: 'Mat Return', allowedCategories: ['Takedowns'] },
            { label: 'Front Headlock Go-Behind', value: 'front headlock go-behind', enterTree: true, focusName: 'Front Headlock Go-Behind', allowedCategories: ['Back Takes', 'Takedowns'] }
          ]
        }
      },
      { label: 'Near-hip block', value: 'back control', allowedCategories: ['Back Takes', 'Positions'] },
      { label: 'Mat-return pressure', value: 'mat return', allowedCategories: ['Takedowns', 'Positions'] }
    ]
  },
  'body-lock takedown setups': {
    question: 'Which body-lock takedown branch do you want to continue from?',
    options: [
      {
        label: 'Hip clamp',
        nextPrompt: {
          question: 'What reaction did the hip clamp create?',
          options: [
            { label: 'Mat-return lane opens', value: 'mat return', enterTree: true, focusName: 'Mat Return', allowedCategories: ['Takedowns'] },
            { label: 'Body-lock-takedown lane opens', value: 'body lock takedown', enterTree: true, focusName: 'Body Lock Takedown', allowedCategories: ['Takedowns'] },
            { label: 'Single-leg lane opens', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Knee-tap lane opens', value: 'knee tap', enterTree: true, focusName: 'Knee Tap', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      {
        label: 'Angle turn',
        nextPrompt: {
          question: 'What continuation do you want from the angle turn?',
          options: [
            { label: 'Mat Return', value: 'mat return', enterTree: true, focusName: 'Mat Return', allowedCategories: ['Takedowns'] },
            { label: 'Body Lock Takedown', value: 'body lock takedown', enterTree: true, focusName: 'Body Lock Takedown', allowedCategories: ['Takedowns'] },
            { label: 'Single Leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Knee Tap', value: 'knee tap', enterTree: true, focusName: 'Knee Tap', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      { label: 'Mat-return lift', value: 'mat return', allowedCategories: ['Takedowns', 'Positions'] },
      { label: 'Outside step', value: 'body lock takedown', allowedCategories: ['Takedowns', 'Positions'] }
    ]
  },
  'single-leg finish-chain setups': {
    question: 'Which single-leg finish-chain branch do you want to continue from?',
    options: [
      {
        label: 'Run-the-pipe threat',
        nextPrompt: {
          question: 'What reaction did the run-the-pipe threat create?',
          options: [
            { label: 'Single-leg lane stays open', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Mat-return lane opens', value: 'mat return', enterTree: true, focusName: 'Mat Return', allowedCategories: ['Takedowns'] },
            { label: 'Knee-tap lane opens', value: 'knee tap', enterTree: true, focusName: 'Knee Tap', allowedCategories: ['Takedowns'] },
            { label: 'Double-leg lane opens', value: 'double leg', enterTree: true, focusName: 'Double Leg', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      {
        label: 'Shelf the leg',
        nextPrompt: {
          question: 'What continuation do you want from shelving the leg?',
          options: [
            { label: 'Mat Return', value: 'mat return', enterTree: true, focusName: 'Mat Return', allowedCategories: ['Takedowns'] },
            { label: 'Knee Tap', value: 'knee tap', enterTree: true, focusName: 'Knee Tap', allowedCategories: ['Takedowns'] },
            { label: 'Double Leg', value: 'double leg', enterTree: true, focusName: 'Double Leg', allowedCategories: ['Takedowns'] },
            { label: 'Single Leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      { label: 'Head position switch', value: 'single leg', allowedCategories: ['Takedowns', 'Positions'] },
      { label: 'Posture climb', value: 'mat return', allowedCategories: ['Takedowns', 'Positions'] }
    ]
  },
  'north-south defense-to-reguard setups': {
    question: 'Which north-south defense-to-reguard branch do you want to continue from?',
    options: [
      {
        label: 'Near-elbow frame',
        nextPrompt: {
          question: 'What reaction did the near-elbow frame create?',
          options: [
            { label: 'Open-guard-recovery lane opens', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Half-guard-recovery lane opens', value: 'half guard', enterTree: true, focusName: 'Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Shin-to-shin lane opens', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Technical-stand-up lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Hip turn',
        nextPrompt: {
          question: 'What continuation do you want from the hip turn?',
          options: [
            { label: 'Open Guard Recovery', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Half Guard Recovery', value: 'half guard', enterTree: true, focusName: 'Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Shin-To-Shin', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Technical Stand-Up Sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      { label: 'Knee reconnect', value: 'half guard', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Far-leg catch', value: 'open guard', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'mount-bottom elbow-knee-to-half-guard setups': {
    question: 'Which mount-bottom elbow-knee-to-half-guard branch do you want to continue from?',
    options: [
      {
        label: 'Elbow frame',
        nextPrompt: {
          question: 'What reaction did the elbow frame create?',
          options: [
            { label: 'Half-guard-recovery lane opens', value: 'half guard', enterTree: true, focusName: 'Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Quarter-guard lane opens', value: 'quarter guard', enterTree: true, focusName: 'Quarter Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Shin-to-shin lane opens', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      {
        label: 'Knee insert',
        nextPrompt: {
          question: 'What continuation do you want from the knee insert?',
          options: [
            { label: 'Half Guard', value: 'half guard', enterTree: true, focusName: 'Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Quarter Guard', value: 'quarter guard', enterTree: true, focusName: 'Quarter Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Shin-To-Shin', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      { label: 'Hip turn', value: 'half guard', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Bottom-leg catch', value: 'quarter guard', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'seated guard arm-drag attack setups': {
    question: 'Which seated-guard arm-drag branch do you want to continue from?',
    options: [
      {
        label: 'Arm-drag pull',
        nextPrompt: {
          question: 'What reaction did the arm-drag pull create?',
          options: [
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Wrestle-up lane opens', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Shin-to-shin lane opens', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Crab-ride lane opens', value: 'crab ride', enterTree: true, focusName: 'Crab Ride', allowedCategories: ['Back Takes', 'Positions'] }
          ]
        }
      },
      {
        label: 'Hip climb',
        nextPrompt: {
          question: 'What continuation do you want from the hip climb?',
          options: [
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Wrestle-Up Single Leg Sweep', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Shin-To-Shin', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Crab Ride', value: 'crab ride', enterTree: true, focusName: 'Crab Ride', allowedCategories: ['Back Takes', 'Positions'] }
          ]
        }
      },
      { label: 'Shoulder-line win', value: 'back control', allowedCategories: ['Back Takes', 'Positions'] },
      { label: 'Rear-angle chase', value: 'crab ride', allowedCategories: ['Back Takes', 'Positions'] }
    ]
  },
  'shin-to-shin retention-to-ashi setups': {
    question: 'Which shin-to-shin retention-to-ashi branch do you want to continue from?',
    options: [
      {
        label: 'Shin re-clamp',
        nextPrompt: {
          question: 'What reaction did the shin re-clamp create?',
          options: [
            { label: 'Ashi-garami lane opens', value: 'ashi garami', enterTree: true, focusName: 'Ashi Garami', allowedCategories: ['Positions', 'Leg Locks'] },
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Straight-ankle-lock lane opens', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Submissions', 'Leg Locks'] },
            { label: 'Technical-stand-up lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Far-leg control',
        nextPrompt: {
          question: 'What continuation do you want from the far-leg control?',
          options: [
            { label: 'Ashi Garami', value: 'ashi garami', enterTree: true, focusName: 'Ashi Garami', allowedCategories: ['Positions', 'Leg Locks'] },
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Straight Ankle Lock', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Submissions', 'Leg Locks'] },
            { label: 'Technical Stand-Up Sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      { label: 'Ankle catch', value: 'ashi garami', allowedCategories: ['Positions', 'Leg Locks'] },
      { label: 'Hip turn-in', value: 'single leg x', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'top mount-to-back setups': {
    question: 'Which top mount-to-back branch do you want to continue from?',
    options: [
      {
        label: 'Gift wrap',
        nextPrompt: {
          question: 'What reaction did the gift wrap create?',
          options: [
            { label: 'Technical-mount lane opens', value: 'technical mount to back', enterTree: true, focusName: 'Technical Mount To Back', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Seatbelt lane opens', value: 'seatbelt', enterTree: true, focusName: 'Seatbelt', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Mounted-triangle lane opens', value: 'mounted triangle', enterTree: true, focusName: 'Mounted Triangle', allowedCategories: ['Submissions', 'Positions'] }
          ]
        }
      },
      {
        label: 'High-mount pressure',
        nextPrompt: {
          question: 'What continuation do you want from the high-mount pressure?',
          options: [
            { label: 'Technical Mount To Back', value: 'technical mount to back', enterTree: true, focusName: 'Technical Mount To Back', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Seatbelt', value: 'seatbelt', enterTree: true, focusName: 'Seatbelt', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Mounted Triangle', value: 'mounted triangle', enterTree: true, focusName: 'Mounted Triangle', allowedCategories: ['Submissions', 'Positions'] }
          ]
        }
      },
      { label: 'Cross-wrist pin', value: 'technical mount to back', allowedCategories: ['Back Takes', 'Positions'] },
      { label: 'Shoulder turn', value: 'back control', allowedCategories: ['Back Takes', 'Positions'] }
    ]
  },
  'side-control kesa-to-attack setups': {
    question: 'Which side-control kesa-to-attack branch do you want to continue from?',
    options: [
      {
        label: 'Head clamp',
        nextPrompt: {
          question: 'What reaction did the head clamp create?',
          options: [
            { label: 'Armbar lane opens', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] },
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Arm-triangle lane opens', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Near-arm trap',
        nextPrompt: {
          question: 'What continuation do you want from the near-arm trap?',
          options: [
            { label: 'Straight Armbar From Side Control', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] },
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Arm Triangle', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Hip block', value: 'kimura', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Kesa turn-in', value: 'arm triangle', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'half-guard passing counters': {
    question: 'Which half-guard passing counter branch do you want to continue from?',
    options: [
      {
        label: 'Frame rebuild',
        nextPrompt: {
          question: 'What reaction did the frame rebuild create?',
          options: [
            { label: 'Half-guard-recovery lane opens', value: 'half guard', enterTree: true, focusName: 'Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Dogfight lane opens', value: 'dogfight', enterTree: true, focusName: 'Dogfight', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Shin-to-shin lane opens', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Open-guard-recovery lane opens', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      {
        label: 'Underhook timing',
        nextPrompt: {
          question: 'What continuation do you want from the underhook timing?',
          options: [
            { label: 'Half Guard Recovery', value: 'half guard', enterTree: true, focusName: 'Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Dogfight', value: 'dogfight', enterTree: true, focusName: 'Dogfight', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Shin-To-Shin', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Open Guard Recovery', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      { label: 'Hip turn-out', value: 'dogfight', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Inside-knee reconnect', value: 'half guard', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'turtle bottom sit-out-to-single setups': {
    question: 'Which turtle bottom sit-out-to-single branch do you want to continue from?',
    options: [
      {
        label: 'Sit-out turn',
        nextPrompt: {
          question: 'What reaction did the sit-out turn create?',
          options: [
            { label: 'Single-leg lane opens', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Stand-up-sweep lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Shin-to-shin lane opens', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Open-guard-recovery lane opens', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      {
        label: 'Leg catch',
        nextPrompt: {
          question: 'What continuation do you want from the leg catch?',
          options: [
            { label: 'Single Leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Technical Stand-Up Sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Shin-To-Shin', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Open Guard Recovery', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      { label: 'Hand-fight clear', value: 'single leg', allowedCategories: ['Takedowns', 'Positions'] },
      { label: 'Hip turn-up', value: 'technical stand-up sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
    ]
  },
  'knee-shield dogfight-to-back setups': {
    question: 'Which knee-shield dogfight-to-back branch do you want to continue from?',
    options: [
      {
        label: 'Underhook win',
        nextPrompt: {
          question: 'What reaction did the underhook win create?',
          options: [
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Seatbelt lane opens', value: 'seatbelt', enterTree: true, focusName: 'Seatbelt', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Dogfight lane stays open', value: 'dogfight', enterTree: true, focusName: 'Dogfight', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Crab-ride lane opens', value: 'crab ride', enterTree: true, focusName: 'Crab Ride', allowedCategories: ['Back Takes', 'Positions'] }
          ]
        }
      },
      {
        label: 'Shoulder clamp',
        nextPrompt: {
          question: 'What continuation do you want from the shoulder clamp?',
          options: [
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Seatbelt', value: 'seatbelt', enterTree: true, focusName: 'Seatbelt', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Dogfight', value: 'dogfight', enterTree: true, focusName: 'Dogfight', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Crab Ride', value: 'crab ride', enterTree: true, focusName: 'Crab Ride', allowedCategories: ['Back Takes', 'Positions'] }
          ]
        }
      },
      { label: 'Knee shield frame', value: 'dogfight', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Dogfight rise', value: 'back control', allowedCategories: ['Back Takes', 'Positions'] }
    ]
  },
  'combat-base passing setups': {
    question: 'Which combat-base passing branch do you want to continue from?',
    options: [
      {
        label: 'Combat base rise',
        nextPrompt: {
          question: 'What reaction did the combat-base rise create?',
          options: [
            { label: 'Closed-guard-pass lane opens', value: 'closed guard passing', enterTree: true, focusName: 'Closed Guard Passing', allowedCategories: ['Passing'] },
            { label: 'Standing-passing lane opens', value: 'standing passing', enterTree: true, focusName: 'Standing Passing', allowedCategories: ['Passing', 'Positions'] },
            { label: 'Leg-drag lane opens', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing'] },
            { label: 'Combat-base posture lane stays open', value: 'combat base', enterTree: true, focusName: 'Combat Base', allowedCategories: ['Positions', 'Passing'] }
          ]
        }
      },
      {
        label: 'Wrist peel',
        nextPrompt: {
          question: 'What continuation do you want from the wrist peel?',
          options: [
            { label: 'Closed Guard Passing', value: 'closed guard passing', enterTree: true, focusName: 'Closed Guard Passing', allowedCategories: ['Passing'] },
            { label: 'Standing Passing', value: 'standing passing', enterTree: true, focusName: 'Standing Passing', allowedCategories: ['Passing', 'Positions'] },
            { label: 'Leg Drag', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing'] },
            { label: 'Combat Base', value: 'combat base', enterTree: true, focusName: 'Combat Base', allowedCategories: ['Positions', 'Passing'] }
          ]
        }
      },
      { label: 'Posture build', value: 'combat base', allowedCategories: ['Passing', 'Positions'] },
      { label: 'Knee angle shift', value: 'closed guard passing', allowedCategories: ['Passing', 'Positions'] }
    ]
  },
  'side-control near-side-armbar setups': {
    question: 'Which side-control near-side-armbar branch do you want to continue from?',
    options: [
      {
        label: 'Near-wrist pin',
        nextPrompt: {
          question: 'What reaction did the near-wrist pin create?',
          options: [
            { label: 'Near-side-armbar lane opens', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] },
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'North-south-choke lane opens', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Hip walk north',
        nextPrompt: {
          question: 'What continuation do you want from the hip walk north?',
          options: [
            { label: 'Straight Armbar From Side Control', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] },
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'North South Choke', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Head control', value: 'straight armbar from side control', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Elbow flare trap', value: 'kimura', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'top turtle crucifix setups': {
    question: 'Which top-turtle crucifix branch do you want to continue from?',
    options: [
      {
        label: 'Far-arm separation',
        nextPrompt: {
          question: 'What reaction did the far-arm separation create?',
          options: [
            { label: 'Crucifix lane opens', value: 'crucifix', enterTree: true, focusName: 'Crucifix', allowedCategories: ['Submissions', 'Positions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Turtle-front-headlock lane opens', value: 'turtle front headlock', enterTree: true, focusName: 'Turtle Front Headlock', allowedCategories: ['Submissions', 'Positions'] },
            { label: 'Short-choke lane opens', value: 'short choke', enterTree: true, focusName: 'Short Choke', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Hip drop',
        nextPrompt: {
          question: 'What continuation do you want from the hip drop?',
          options: [
            { label: 'Crucifix', value: 'crucifix', enterTree: true, focusName: 'Crucifix', allowedCategories: ['Submissions', 'Positions'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Turtle Front Headlock', value: 'turtle front headlock', enterTree: true, focusName: 'Turtle Front Headlock', allowedCategories: ['Submissions', 'Positions'] },
            { label: 'Short Choke', value: 'short choke', enterTree: true, focusName: 'Short Choke', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Seatbelt threat', value: 'back control', allowedCategories: ['Back Takes', 'Positions'] },
      { label: 'Near-hook pummel', value: 'crucifix', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'open-guard collar-drag setups': {
    question: 'Which open-guard collar-drag branch do you want to continue from?',
    options: [
      {
        label: 'Collar-drag pull',
        nextPrompt: {
          question: 'What reaction did the collar-drag pull create?',
          options: [
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Wrestle-up lane opens', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Shin-to-shin lane opens', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Stand-up-sweep lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Hip angle change',
        nextPrompt: {
          question: 'What continuation do you want from the hip angle change?',
          options: [
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Wrestle-Up Single Leg Sweep', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Shin-To-Shin', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Technical Stand-Up Sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      { label: 'Shoulder-line pull', value: 'back control', allowedCategories: ['Back Takes', 'Positions'] },
      { label: 'Top-leg catch', value: 'wrestle-up single leg sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
    ]
  },
  'quarter-guard wrestle-up setups': {
    question: 'Which quarter-guard wrestle-up branch do you want to continue from?',
    options: [
      {
        label: 'Underhook reach',
        nextPrompt: {
          question: 'What reaction did the underhook reach create?',
          options: [
            { label: 'Wrestle-up lane opens', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Dogfight lane opens', value: 'dogfight', enterTree: true, focusName: 'Dogfight', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Shin-to-shin lane opens', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Single-leg lane opens', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      {
        label: 'Hip scoot',
        nextPrompt: {
          question: 'What continuation do you want from the hip scoot?',
          options: [
            { label: 'Wrestle-Up Single Leg Sweep', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Dogfight', value: 'dogfight', enterTree: true, focusName: 'Dogfight', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Shin-To-Shin', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Single Leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      { label: 'Bottom-leg clamp', value: 'wrestle-up single leg sweep', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Knee reconnect', value: 'dogfight', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'single-leg-x retention-to-sweep setups': {
    question: 'Which Single-Leg-X retention-to-sweep branch do you want to continue from?',
    options: [
      {
        label: 'Foot re-track',
        nextPrompt: {
          question: 'What reaction did the foot re-track create?',
          options: [
            { label: 'Basic-sweep lane opens', value: 'basic single-leg x sweep', enterTree: true, focusName: 'Basic Single-Leg X Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Stand-up-sweep lane opens', value: 'single-leg x stand-up sweep', enterTree: true, focusName: 'Single-Leg X Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Ankle-lock lane opens', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Submissions', 'Leg Locks'] },
            { label: 'Technical-stand-up lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Hip angle reset',
        nextPrompt: {
          question: 'What continuation do you want from the hip angle reset?',
          options: [
            { label: 'Basic Single-Leg X Sweep', value: 'basic single-leg x sweep', enterTree: true, focusName: 'Basic Single-Leg X Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Single-Leg X Stand-Up Sweep', value: 'single-leg x stand-up sweep', enterTree: true, focusName: 'Single-Leg X Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Straight Ankle Lock', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Submissions', 'Leg Locks'] },
            { label: 'Technical Stand-Up Sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      { label: 'Top-hand pull', value: 'basic single-leg x sweep', allowedCategories: ['Sweeps', 'Positions'] },
      { label: 'Far-leg steering', value: 'straight ankle lock', allowedCategories: ['Submissions', 'Leg Locks'] }
    ]
  },
  'butterfly-arm-drag-to-back setups': {
    question: 'Which butterfly arm-drag-to-back branch do you want to continue from?',
    options: [
      {
        label: 'Arm-drag pull',
        nextPrompt: {
          question: 'What reaction did the arm-drag pull create?',
          options: [
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Crab-ride lane opens', value: 'crab ride', enterTree: true, focusName: 'Crab Ride', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Wrestle-up lane opens', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Seatbelt lane opens', value: 'seatbelt', enterTree: true, focusName: 'Seatbelt', allowedCategories: ['Back Takes', 'Positions'] }
          ]
        }
      },
      {
        label: 'Butterfly hook assist',
        nextPrompt: {
          question: 'What continuation do you want from the butterfly-hook assist?',
          options: [
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Crab Ride', value: 'crab ride', enterTree: true, focusName: 'Crab Ride', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Wrestle-Up Single Leg Sweep', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Seatbelt', value: 'seatbelt', enterTree: true, focusName: 'Seatbelt', allowedCategories: ['Back Takes', 'Positions'] }
          ]
        }
      },
      { label: 'Hip climb', value: 'back control', allowedCategories: ['Back Takes', 'Positions'] },
      { label: 'Shoulder-line chase', value: 'crab ride', allowedCategories: ['Back Takes', 'Positions'] }
    ]
  },
  'top-side-control-to-north-south setups': {
    question: 'Which top-side-control-to-north-south branch do you want to continue from?',
    options: [
      {
        label: 'Shoulder rotation',
        nextPrompt: {
          question: 'What reaction did the shoulder rotation create?',
          options: [
            { label: 'North-south lane opens', value: 'north south', enterTree: true, focusName: 'North South', allowedCategories: ['Positions', 'Passing'] },
            { label: 'North-south-choke lane opens', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Hip walk north',
        nextPrompt: {
          question: 'What continuation do you want from the hip walk north?',
          options: [
            { label: 'North South', value: 'north south', enterTree: true, focusName: 'North South', allowedCategories: ['Positions', 'Passing'] },
            { label: 'North South Choke', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Head control', value: 'north south', allowedCategories: ['Passing', 'Positions'] },
      { label: 'Near-elbow pin', value: 'north south choke', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'mount gift-wrap-to-armbar setups': {
    question: 'Which mount gift-wrap-to-armbar branch do you want to continue from?',
    options: [
      {
        label: 'Gift wrap',
        nextPrompt: {
          question: 'What reaction did the gift wrap create?',
          options: [
            { label: 'Armbar lane opens', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] },
            { label: 'Mounted-triangle lane opens', value: 'mounted triangle', enterTree: true, focusName: 'Mounted Triangle', allowedCategories: ['Submissions', 'Positions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Technical-mount lane opens', value: 'technical mount to back', enterTree: true, focusName: 'Technical Mount To Back', allowedCategories: ['Back Takes', 'Positions'] }
          ]
        }
      },
      {
        label: 'High-mount climb',
        nextPrompt: {
          question: 'What continuation do you want from the high-mount climb?',
          options: [
            { label: 'Straight Armbar From Mount', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] },
            { label: 'Mounted Triangle', value: 'mounted triangle', enterTree: true, focusName: 'Mounted Triangle', allowedCategories: ['Submissions', 'Positions'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Technical Mount To Back', value: 'technical mount to back', enterTree: true, focusName: 'Technical Mount To Back', allowedCategories: ['Back Takes', 'Positions'] }
          ]
        }
      },
      { label: 'Cross-wrist pin', value: 'straight armbar from mount', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Shoulder turn', value: 'mounted triangle', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'turtle bottom peek-out-to-backdoor setups': {
    question: 'Which turtle bottom peek-out-to-backdoor branch do you want to continue from?',
    options: [
      {
        label: 'Peek-out turn',
        nextPrompt: {
          question: 'What reaction did the peek-out turn create?',
          options: [
            { label: 'Backdoor-single lane opens', value: 'backdoor single', enterTree: true, focusName: 'Backdoor Single', allowedCategories: ['Takedowns'] },
            { label: 'Shin-to-shin lane opens', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Stand-up-sweep lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Open-guard-recovery lane opens', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      {
        label: 'Knee-line slip',
        nextPrompt: {
          question: 'What continuation do you want from the knee-line slip?',
          options: [
            { label: 'Backdoor Single', value: 'backdoor single', enterTree: true, focusName: 'Backdoor Single', allowedCategories: ['Takedowns'] },
            { label: 'Shin-To-Shin', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Technical Stand-Up Sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Open Guard Recovery', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      { label: 'Hand-fight clear', value: 'backdoor single', allowedCategories: ['Takedowns', 'Positions'] },
      { label: 'Hip turn-up', value: 'shin to shin', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'standing snap-down-to-go-behind setups': {
    question: 'Which standing snap-down-to-go-behind branch do you want to continue from?',
    options: [
      {
        label: 'Snap down',
        nextPrompt: {
          question: 'What reaction did the snap down create?',
          options: [
            { label: 'Go-behind lane opens', value: 'go-behind position', enterTree: true, focusName: 'Go-Behind Position', allowedCategories: ['Takedowns', 'Positions'] },
            { label: 'Front-headlock lane opens', value: 'front headlock to spin behind', enterTree: true, focusName: 'Front Headlock To Spin Behind', allowedCategories: ['Submissions', 'Takedowns'] },
            { label: 'Knee-tap lane opens', value: 'knee tap', enterTree: true, focusName: 'Knee Tap', allowedCategories: ['Takedowns'] },
            { label: 'Mat-return lane opens', value: 'mat return', enterTree: true, focusName: 'Mat Return', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      {
        label: 'Shoulder redirect',
        nextPrompt: {
          question: 'What continuation do you want from the shoulder redirect?',
          options: [
            { label: 'Go-Behind Position', value: 'go-behind position', enterTree: true, focusName: 'Go-Behind Position', allowedCategories: ['Takedowns', 'Positions'] },
            { label: 'Front Headlock To Spin Behind', value: 'front headlock to spin behind', enterTree: true, focusName: 'Front Headlock To Spin Behind', allowedCategories: ['Submissions', 'Takedowns'] },
            { label: 'Knee Tap', value: 'knee tap', enterTree: true, focusName: 'Knee Tap', allowedCategories: ['Takedowns'] },
            { label: 'Mat Return', value: 'mat return', enterTree: true, focusName: 'Mat Return', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      { label: 'Outside step', value: 'go-behind position', allowedCategories: ['Takedowns', 'Positions'] },
      { label: 'Head position win', value: 'front headlock to spin behind', allowedCategories: ['Submissions', 'Takedowns'] }
    ]
  },
  'closed-guard overhook-to-omoplata setups': {
    question: 'Which closed-guard overhook-to-omoplata branch do you want to continue from?',
    options: [
      {
        label: 'Overhook clamp',
        nextPrompt: {
          question: 'What reaction did the overhook clamp create?',
          options: [
            { label: 'Omoplata lane opens', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Triangle lane opens', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Armbar lane opens', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Hip angle shift',
        nextPrompt: {
          question: 'What continuation do you want from the hip angle shift?',
          options: [
            { label: 'Omoplata', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Triangle Choke', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Straight Armbar From Guard', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Collar pull', value: 'omoplata', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Shoulder break', value: 'triangle choke', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'shin-to-shin wrestle-up-to-back setups': {
    question: 'Which shin-to-shin wrestle-up-to-back branch do you want to continue from?',
    options: [
      {
        label: 'Come-up on leg',
        nextPrompt: {
          question: 'What reaction did the come-up on the leg create?',
          options: [
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Single-leg lane opens', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Wrestle-up lane stays open', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Stand-up-sweep lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Shoulder turn',
        nextPrompt: {
          question: 'What continuation do you want from the shoulder turn?',
          options: [
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Single Leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Wrestle-Up Single Leg Sweep', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Technical Stand-Up Sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      { label: 'Shin re-connect', value: 'single leg', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Rear-corner chase', value: 'back control', allowedCategories: ['Back Takes', 'Positions'] }
    ]
  },
  'leg-drag backstep-to-kimura setups': {
    question: 'Which leg-drag backstep-to-kimura branch do you want to continue from?',
    options: [
      {
        label: 'Backstep threat',
        nextPrompt: {
          question: 'What reaction did the backstep threat create?',
          options: [
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'North-south-choke lane opens', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Armbar lane opens', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Near-arm trap',
        nextPrompt: {
          question: 'What continuation do you want from the near-arm trap?',
          options: [
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'North South Choke', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Straight Armbar From Side Control', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Leg drag pull', value: 'kimura', allowedCategories: ['Passing', 'Positions'] },
      { label: 'Hip pin', value: 'north south choke', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'north-south kimura-to-choke setups': {
    question: 'Which north-south kimura-to-choke branch do you want to continue from?',
    options: [
      {
        label: 'Wrist capture',
        nextPrompt: {
          question: 'What reaction did the wrist capture create?',
          options: [
            { label: 'Choke lane opens', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Armbar lane opens', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Elbow flare',
        nextPrompt: {
          question: 'What continuation do you want from the elbow flare?',
          options: [
            { label: 'North South Choke', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Straight Armbar From Side Control', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Shoulder pressure', value: 'north south choke', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Head walk', value: 'kimura', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'bottom-side-control ghost-escape-to-single setups': {
    question: 'Which bottom-side-control ghost-escape-to-single branch do you want to continue from?',
    options: [
      {
        label: 'Underhook reach',
        nextPrompt: {
          question: 'What reaction did the underhook reach create?',
          options: [
            { label: 'Single-leg lane opens', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Shin-to-shin lane opens', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Open-guard-recovery lane opens', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Stand-up-sweep lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Hip slide',
        nextPrompt: {
          question: 'What continuation do you want from the hip slide?',
          options: [
            { label: 'Single Leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Shin-To-Shin', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Open Guard Recovery', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Technical Stand-Up Sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      { label: 'Shoulder turn', value: 'single leg', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Knee-line catch', value: 'shin to shin', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'standing collar-tie-to-knee-tap setups': {
    question: 'Which standing collar-tie-to-knee-tap branch do you want to continue from?',
    options: [
      {
        label: 'Head pull',
        nextPrompt: {
          question: 'What reaction did the head pull create?',
          options: [
            { label: 'Knee-tap lane opens', value: 'knee tap', enterTree: true, focusName: 'Knee Tap', allowedCategories: ['Takedowns'] },
            { label: 'Single-leg lane opens', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Front-headlock lane opens', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Submissions', 'Takedowns'] },
            { label: 'Body-lock lane opens', value: 'body lock takedown', enterTree: true, focusName: 'Body Lock Takedown', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      {
        label: 'Outside step',
        nextPrompt: {
          question: 'What continuation do you want from the outside step?',
          options: [
            { label: 'Knee Tap', value: 'knee tap', enterTree: true, focusName: 'Knee Tap', allowedCategories: ['Takedowns'] },
            { label: 'Single Leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Front Headlock Standing', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Submissions', 'Takedowns'] },
            { label: 'Body Lock Takedown', value: 'body lock takedown', enterTree: true, focusName: 'Body Lock Takedown', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      { label: 'Collar tie', value: 'knee tap', allowedCategories: ['Takedowns', 'Positions'] },
      { label: 'Inside-hand check', value: 'single leg', allowedCategories: ['Takedowns', 'Positions'] }
    ]
  },
  'butterfly shoulder-crunch-to-choi-bar setups': {
    question: 'Which butterfly shoulder-crunch-to-Choi-Bar branch do you want to continue from?',
    options: [
      {
        label: 'Shoulder crunch',
        nextPrompt: {
          question: 'What reaction did the shoulder crunch create?',
          options: [
            { label: 'Choi-Bar lane opens', value: 'choi bar', enterTree: true, focusName: 'Choi Bar', allowedCategories: ['Submissions'] },
            { label: 'Triangle lane opens', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Butterfly-sweep lane opens', value: 'butterfly sweep', enterTree: true, focusName: 'Butterfly Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Arm-drag-to-back lane opens', value: 'arm drag to back', enterTree: true, focusName: 'Arm Drag To Back', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Hip angle shift',
        nextPrompt: {
          question: 'What continuation do you want from the hip angle shift?',
          options: [
            { label: 'Choi Bar', value: 'choi bar', enterTree: true, focusName: 'Choi Bar', allowedCategories: ['Submissions'] },
            { label: 'Triangle Choke', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Butterfly Sweep', value: 'butterfly sweep', enterTree: true, focusName: 'Butterfly Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Arm Drag To Back', value: 'arm drag to back', enterTree: true, focusName: 'Arm Drag To Back', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Arm isolation', value: 'choi bar', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Butterfly lift', value: 'butterfly sweep', allowedCategories: ['Sweeps', 'Positions'] }
    ]
  },
  'open-guard ankle-pick-to-leg-drag setups': {
    question: 'Which open-guard ankle-pick-to-leg-drag branch do you want to continue from?',
    options: [
      {
        label: 'Ankle-pick threat',
        nextPrompt: {
          question: 'What reaction did the ankle-pick threat create?',
          options: [
            { label: 'Leg-drag lane opens', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing'] },
            { label: 'Knee-on-belly lane opens', value: 'pass to knee on belly', enterTree: true, focusName: 'Pass To Knee On Belly', allowedCategories: ['Passing'] },
            { label: 'Backstep lane opens', value: 'backstep pass', enterTree: true, focusName: 'Backstep Pass', allowedCategories: ['Passing'] },
            { label: 'Side-control lane opens', value: 'side control', enterTree: true, focusName: 'Side Control', allowedCategories: ['Passing', 'Positions'] }
          ]
        }
      },
      {
        label: 'Hip redirection',
        nextPrompt: {
          question: 'What continuation do you want from the hip redirection?',
          options: [
            { label: 'Leg Drag', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing'] },
            { label: 'Pass To Knee On Belly', value: 'pass to knee on belly', enterTree: true, focusName: 'Pass To Knee On Belly', allowedCategories: ['Passing'] },
            { label: 'Backstep Pass', value: 'backstep pass', enterTree: true, focusName: 'Backstep Pass', allowedCategories: ['Passing'] },
            { label: 'Side Control', value: 'side control', enterTree: true, focusName: 'Side Control', allowedCategories: ['Passing', 'Positions'] }
          ]
        }
      },
      { label: 'Foot steering', value: 'leg drag', allowedCategories: ['Passing', 'Positions'] },
      { label: 'Shin clear', value: 'backstep pass', allowedCategories: ['Passing', 'Positions'] }
    ]
  },
  'top-half-kimura-to-back setups': {
    question: 'Which top-half-kimura-to-back branch do you want to continue from?',
    options: [
      {
        label: 'Kimura grip',
        nextPrompt: {
          question: 'What reaction did the kimura grip create?',
          options: [
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Technical-mount lane opens', value: 'technical mount to back', enterTree: true, focusName: 'Technical Mount To Back', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Kimura lane stays open', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Arm-triangle lane opens', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Shoulder turn',
        nextPrompt: {
          question: 'What continuation do you want from the shoulder turn?',
          options: [
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Technical Mount To Back', value: 'technical mount to back', enterTree: true, focusName: 'Technical Mount To Back', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Arm Triangle', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Crossface pressure', value: 'back control', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Hip block', value: 'arm triangle', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'mount smother-to-armbar setups': {
    question: 'Which mount smother-to-armbar branch do you want to continue from?',
    options: [
      {
        label: 'Smother pressure',
        nextPrompt: {
          question: 'What reaction did the smother pressure create?',
          options: [
            { label: 'Armbar lane opens', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] },
            { label: 'Mounted-triangle lane opens', value: 'mounted triangle', enterTree: true, focusName: 'Mounted Triangle', allowedCategories: ['Submissions', 'Positions'] },
            { label: 'Punch-choke lane opens', value: 'punch choke', enterTree: true, focusName: 'Punch Choke', allowedCategories: ['Submissions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Wrist track',
        nextPrompt: {
          question: 'What continuation do you want from the wrist track?',
          options: [
            { label: 'Straight Armbar From Mount', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] },
            { label: 'Mounted Triangle', value: 'mounted triangle', enterTree: true, focusName: 'Mounted Triangle', allowedCategories: ['Submissions', 'Positions'] },
            { label: 'Punch Choke', value: 'punch choke', enterTree: true, focusName: 'Punch Choke', allowedCategories: ['Submissions'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'High-mount climb', value: 'straight armbar from mount', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Head-line block', value: 'punch choke', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'turtle bottom granby-to-reguard setups': {
    question: 'Which turtle bottom granby-to-reguard branch do you want to continue from?',
    options: [
      {
        label: 'Granby roll',
        nextPrompt: {
          question: 'What reaction did the granby roll create?',
          options: [
            { label: 'Open-guard-recovery lane opens', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Shin-to-shin lane opens', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Stand-up-sweep lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      {
        label: 'Leg reconnect',
        nextPrompt: {
          question: 'What continuation do you want from the leg reconnect?',
          options: [
            { label: 'Open Guard Recovery', value: 'open guard', enterTree: true, focusName: 'Open Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Shin-To-Shin', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Technical Stand-Up Sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      { label: 'Hand-fight clear', value: 'open guard', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Shoulder turn', value: 'shin to shin', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'standing two-on-one-to-arm-drag setups': {
    question: 'Which standing two-on-one-to-arm-drag branch do you want to continue from?',
    options: [
      {
        label: 'Two-on-one control',
        nextPrompt: {
          question: 'What reaction did the two-on-one control create?',
          options: [
            { label: 'Arm-drag lane opens', value: 'arm drag to back take', enterTree: true, focusName: 'Arm Drag To Back Take', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Rear-body-lock lane opens', value: 'rear body lock standing', enterTree: true, focusName: 'Rear Body Lock Standing', allowedCategories: ['Takedowns', 'Positions'] },
            { label: 'Single-leg lane opens', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Angle step',
        nextPrompt: {
          question: 'What continuation do you want from the angle step?',
          options: [
            { label: 'Arm Drag To Back Take', value: 'arm drag to back take', enterTree: true, focusName: 'Arm Drag To Back Take', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Rear Body Lock Standing', value: 'rear body lock standing', enterTree: true, focusName: 'Rear Body Lock Standing', allowedCategories: ['Takedowns', 'Positions'] },
            { label: 'Single Leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Shoulder pull', value: 'arm drag to back take', allowedCategories: ['Standing', 'Positions'] },
      { label: 'Elbow turn', value: 'single leg', allowedCategories: ['Standing', 'Positions'] }
    ]
  },
  'closed-guard clamp-to-triangle setups': {
    question: 'Which closed-guard clamp-to-triangle branch do you want to continue from?',
    options: [
      {
        label: 'Clamp lock',
        nextPrompt: {
          question: 'What reaction did the clamp lock create?',
          options: [
            { label: 'Triangle lane opens', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Armbar lane opens', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Omoplata lane opens', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Hip climb',
        nextPrompt: {
          question: 'What continuation do you want from the hip climb?',
          options: [
            { label: 'Triangle Choke', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Straight Armbar From Guard', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Omoplata', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Posture break', value: 'triangle choke', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Shoulder trap', value: 'omoplata', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'half-butterfly shoulder-crunch-to-sweep setups': {
    question: 'Which half-butterfly shoulder-crunch-to-sweep branch do you want to continue from?',
    options: [
      {
        label: 'Shoulder crunch',
        nextPrompt: {
          question: 'What reaction did the shoulder crunch create?',
          options: [
            { label: 'Butterfly-sweep lane opens', value: 'butterfly sweep', enterTree: true, focusName: 'Butterfly Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Choi-Bar lane opens', value: 'choi bar', enterTree: true, focusName: 'Choi Bar', allowedCategories: ['Submissions'] },
            { label: 'Wrestle-up lane opens', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Stand-up-sweep lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Hook lift',
        nextPrompt: {
          question: 'What continuation do you want from the hook lift?',
          options: [
            { label: 'Butterfly Sweep', value: 'butterfly sweep', enterTree: true, focusName: 'Butterfly Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Choi Bar', value: 'choi bar', enterTree: true, focusName: 'Choi Bar', allowedCategories: ['Submissions'] },
            { label: 'Wrestle-Up Single Leg Sweep', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Technical Stand-Up Sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] }
          ]
        }
      },
      { label: 'Hip angle shift', value: 'butterfly sweep', allowedCategories: ['Sweeps', 'Positions'] },
      { label: 'Elbow trap', value: 'choi bar', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'top-side-control-to-far-side-armbar setups': {
    question: 'Which top-side-control-to-far-side-armbar branch do you want to continue from?',
    options: [
      {
        label: 'Far-arm isolation',
        nextPrompt: {
          question: 'What reaction did the far-arm isolation create?',
          options: [
            { label: 'Armbar lane opens', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] },
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'North-south-choke lane opens', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Hip walk north',
        nextPrompt: {
          question: 'What continuation do you want from the hip walk north?',
          options: [
            { label: 'Straight Armbar From Side Control', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] },
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'North South Choke', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Head control', value: 'straight armbar from side control', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Shoulder turn', value: 'kimura', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'north-south float-to-kimura setups': {
    question: 'Which north-south float-to-kimura branch do you want to continue from?',
    options: [
      {
        label: 'Float step',
        nextPrompt: {
          question: 'What reaction did the float step create?',
          options: [
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'North-south-choke lane opens', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Armbar lane opens', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Wrist catch',
        nextPrompt: {
          question: 'What continuation do you want from the wrist catch?',
          options: [
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'North South Choke', value: 'north south choke', enterTree: true, focusName: 'North South Choke', allowedCategories: ['Submissions'] },
            { label: 'Straight Armbar From Side Control', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Shoulder float', value: 'kimura', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Elbow lift', value: 'north south choke', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'bottom-mount bridge-to-knee-elbow setups': {
    question: 'Which bottom-mount bridge-to-knee-elbow branch do you want to continue from?',
    options: [
      {
        label: 'Bridge bump',
        nextPrompt: {
          question: 'What reaction did the bridge bump create?',
          options: [
            { label: 'Half-guard-recovery lane opens', value: 'half guard', enterTree: true, focusName: 'Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Quarter-guard lane opens', value: 'quarter guard', enterTree: true, focusName: 'Quarter Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Shin-to-shin lane opens', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Single-Leg-X lane opens', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      {
        label: 'Knee-elbow insert',
        nextPrompt: {
          question: 'What continuation do you want from the knee-elbow insert?',
          options: [
            { label: 'Half Guard Recovery', value: 'half guard', enterTree: true, focusName: 'Half Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Quarter Guard', value: 'quarter guard', enterTree: true, focusName: 'Quarter Guard', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Shin-To-Shin', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Single-Leg X', value: 'single leg x', enterTree: true, focusName: 'Single-Leg X', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      { label: 'Post reaction', value: 'half guard', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Hip shift', value: 'quarter guard', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'standing inside-tie-to-snap-down setups': {
    question: 'Which standing inside-tie-to-snap-down branch do you want to continue from?',
    options: [
      {
        label: 'Elbow pull',
        nextPrompt: {
          question: 'What reaction did the elbow pull create?',
          options: [
            { label: 'Snap-down lane opens', value: 'snap down', enterTree: true, focusName: 'Snap Down', allowedCategories: ['Takedowns'] },
            { label: 'Front-headlock lane opens', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Submissions', 'Takedowns'] },
            { label: 'Go-behind lane opens', value: 'go-behind position', enterTree: true, focusName: 'Go-Behind Position', allowedCategories: ['Takedowns', 'Positions'] },
            { label: 'Knee-tap lane opens', value: 'knee tap', enterTree: true, focusName: 'Knee Tap', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      {
        label: 'Head position win',
        nextPrompt: {
          question: 'What continuation do you want from the head-position win?',
          options: [
            { label: 'Snap Down', value: 'snap down', enterTree: true, focusName: 'Snap Down', allowedCategories: ['Takedowns'] },
            { label: 'Front Headlock Standing', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Submissions', 'Takedowns'] },
            { label: 'Go-Behind Position', value: 'go-behind position', enterTree: true, focusName: 'Go-Behind Position', allowedCategories: ['Takedowns', 'Positions'] },
            { label: 'Knee Tap', value: 'knee tap', enterTree: true, focusName: 'Knee Tap', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      { label: 'Inside tie', value: 'snap down', allowedCategories: ['Standing', 'Positions'] },
      { label: 'Angle step', value: 'go-behind position', allowedCategories: ['Standing', 'Positions'] }
    ]
  },
  'open-guard foot-post-to-tripod-sweep setups': {
    question: 'Which open-guard foot-post-to-tripod-sweep branch do you want to continue from?',
    options: [
      {
        label: 'Foot post',
        nextPrompt: {
          question: 'What reaction did the foot post create?',
          options: [
            { label: 'Tripod-sweep lane opens', value: 'tripod sweep', enterTree: true, focusName: 'Tripod Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Stand-up-sweep lane opens', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Leg-drag lane opens', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing'] },
            { label: 'Single-leg lane opens', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      {
        label: 'Hip pull',
        nextPrompt: {
          question: 'What continuation do you want from the hip pull?',
          options: [
            { label: 'Tripod Sweep', value: 'tripod sweep', enterTree: true, focusName: 'Tripod Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Technical Stand-Up Sweep', value: 'technical stand-up sweep', enterTree: true, focusName: 'Technical Stand-Up Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Leg Drag', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing'] },
            { label: 'Single Leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      { label: 'Ankle control', value: 'tripod sweep', allowedCategories: ['Sweeps', 'Positions'] },
      { label: 'Far-leg lift', value: 'technical stand-up sweep', allowedCategories: ['Sweeps', 'Positions'] }
    ]
  },
  'collar-sleeve shoulder-walk-to-triangle setups': {
    question: 'Which collar-sleeve shoulder-walk-to-triangle branch do you want to continue from?',
    options: [
      {
        label: 'Shoulder walk',
        nextPrompt: {
          question: 'What reaction did the shoulder walk create?',
          options: [
            { label: 'Triangle lane opens', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Omoplata lane opens', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Armbar lane opens', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Clamp-guard lane opens', value: 'clamp guard', enterTree: true, focusName: 'Clamp Guard', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      {
        label: 'Hip climb',
        nextPrompt: {
          question: 'What continuation do you want from the hip climb?',
          options: [
            { label: 'Triangle Choke', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Omoplata', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Straight Armbar From Guard', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Clamp Guard', value: 'clamp guard', enterTree: true, focusName: 'Clamp Guard', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      { label: 'Collar control', value: 'triangle choke', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Sleeve control', value: 'omoplata', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'top-half crossface-to-arm-triangle setups': {
    question: 'Which top-half crossface-to-arm-triangle branch do you want to continue from?',
    options: [
      {
        label: 'Crossface pressure',
        nextPrompt: {
          question: 'What reaction did the crossface pressure create?',
          options: [
            { label: 'Arm-triangle lane opens', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] },
            { label: 'Mount lane opens', value: 'mount', enterTree: true, focusName: 'Mount', allowedCategories: ['Passing', 'Positions'] },
            { label: 'Punch-choke lane opens', value: 'punch choke', enterTree: true, focusName: 'Punch Choke', allowedCategories: ['Submissions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Shoulder trap',
        nextPrompt: {
          question: 'What continuation do you want from the shoulder trap?',
          options: [
            { label: 'Arm Triangle', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] },
            { label: 'Mount', value: 'mount', enterTree: true, focusName: 'Mount', allowedCategories: ['Passing', 'Positions'] },
            { label: 'Punch Choke', value: 'punch choke', enterTree: true, focusName: 'Punch Choke', allowedCategories: ['Submissions'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Head pin', value: 'arm triangle', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Hip settle', value: 'mount', allowedCategories: ['Passing', 'Positions'] }
    ]
  },
  'side-control windshield-wiper-to-mount setups': {
    question: 'Which side-control windshield-wiper-to-mount branch do you want to continue from?',
    options: [
      {
        label: 'Near-knee lift',
        nextPrompt: {
          question: 'What reaction did the near-knee lift create?',
          options: [
            { label: 'Mount lane opens', value: 'mount', enterTree: true, focusName: 'Mount', allowedCategories: ['Passing', 'Positions'] },
            { label: 'Gift-wrap lane opens', value: 'gift wrap', enterTree: true, focusName: 'Gift Wrap', allowedCategories: ['Submissions', 'Positions'] },
            { label: 'Punch-choke lane opens', value: 'punch choke', enterTree: true, focusName: 'Punch Choke', allowedCategories: ['Submissions'] },
            { label: 'Technical-mount lane opens', value: 'technical mount to back', enterTree: true, focusName: 'Technical Mount To Back', allowedCategories: ['Back Takes', 'Positions'] }
          ]
        }
      },
      {
        label: 'Windshield-wiper step',
        nextPrompt: {
          question: 'What continuation do you want from the windshield-wiper step?',
          options: [
            { label: 'Mount', value: 'mount', enterTree: true, focusName: 'Mount', allowedCategories: ['Passing', 'Positions'] },
            { label: 'Gift Wrap', value: 'gift wrap', enterTree: true, focusName: 'Gift Wrap', allowedCategories: ['Submissions', 'Positions'] },
            { label: 'Punch Choke', value: 'punch choke', enterTree: true, focusName: 'Punch Choke', allowedCategories: ['Submissions'] },
            { label: 'Technical Mount To Back', value: 'technical mount to back', enterTree: true, focusName: 'Technical Mount To Back', allowedCategories: ['Back Takes', 'Positions'] }
          ]
        }
      },
      { label: 'Hip pin', value: 'mount', allowedCategories: ['Passing', 'Positions'] },
      { label: 'Shoulder pressure', value: 'gift wrap', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'bottom-side-control underhook-to-dogfight setups': {
    question: 'Which bottom-side-control underhook-to-dogfight branch do you want to continue from?',
    options: [
      {
        label: 'Underhook reach',
        nextPrompt: {
          question: 'What reaction did the underhook reach create?',
          options: [
            { label: 'Dogfight lane opens', value: 'dogfight', enterTree: true, focusName: 'Dogfight', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Wrestle-up lane opens', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Shin-to-shin lane opens', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Half-guard-recovery lane opens', value: 'half guard', enterTree: true, focusName: 'Half Guard', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      {
        label: 'Come-up angle',
        nextPrompt: {
          question: 'What continuation do you want from the come-up angle?',
          options: [
            { label: 'Dogfight', value: 'dogfight', enterTree: true, focusName: 'Dogfight', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Wrestle-Up Single Leg Sweep', value: 'wrestle-up single leg sweep', enterTree: true, focusName: 'Wrestle-Up Single Leg Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Shin-To-Shin', value: 'shin to shin', enterTree: true, focusName: 'Shin-To-Shin', allowedCategories: ['Guard', 'Positions'] },
            { label: 'Half Guard Recovery', value: 'half guard', enterTree: true, focusName: 'Half Guard', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      { label: 'Hip turn', value: 'dogfight', allowedCategories: ['Guard', 'Positions'] },
      { label: 'Knee recover', value: 'half guard', allowedCategories: ['Guard', 'Positions'] }
    ]
  },
  'standing arm-drag-to-knee-tap setups': {
    question: 'Which standing arm-drag-to-knee-tap branch do you want to continue from?',
    options: [
      {
        label: 'Arm-drag pull',
        nextPrompt: {
          question: 'What reaction did the arm-drag pull create?',
          options: [
            { label: 'Knee-tap lane opens', value: 'knee tap', enterTree: true, focusName: 'Knee Tap', allowedCategories: ['Takedowns'] },
            { label: 'Rear-body-lock lane opens', value: 'rear body lock standing', enterTree: true, focusName: 'Rear Body Lock Standing', allowedCategories: ['Takedowns', 'Positions'] },
            { label: 'Single-leg lane opens', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Hip chase',
        nextPrompt: {
          question: 'What continuation do you want from the hip chase?',
          options: [
            { label: 'Knee Tap', value: 'knee tap', enterTree: true, focusName: 'Knee Tap', allowedCategories: ['Takedowns'] },
            { label: 'Rear Body Lock Standing', value: 'rear body lock standing', enterTree: true, focusName: 'Rear Body Lock Standing', allowedCategories: ['Takedowns', 'Positions'] },
            { label: 'Single Leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Angle step', value: 'knee tap', allowedCategories: ['Standing', 'Positions'] },
      { label: 'Shoulder-line win', value: 'rear body lock standing', allowedCategories: ['Standing', 'Positions'] }
    ]
  },
  'closed-guard sweep setups': {
    question: 'Which closed-guard sweep branch do you want to continue from?',
    options: [
      {
        label: 'Collar pull',
        nextPrompt: {
          question: 'What reaction did the collar pull create?',
          options: [
            { label: 'Flower-sweep lane opens', value: 'flower sweep', enterTree: true, focusName: 'Flower Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Hip-bump lane opens', value: 'hip bump sweep', enterTree: true, focusName: 'Hip Bump Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Back-take lane opens', value: 'closed guard arm drag to back', enterTree: true, focusName: 'Closed Guard Arm Drag To Back', allowedCategories: ['Back Takes', 'Sweeps'] },
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Hip angle shift',
        nextPrompt: {
          question: 'What continuation do you want from the hip-angle shift?',
          options: [
            { label: 'Flower Sweep', value: 'flower sweep', enterTree: true, focusName: 'Flower Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Hip Bump Sweep', value: 'hip bump sweep', enterTree: true, focusName: 'Hip Bump Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Closed Guard Arm Drag To Back', value: 'closed guard arm drag to back', enterTree: true, focusName: 'Closed Guard Arm Drag To Back', allowedCategories: ['Back Takes', 'Sweeps'] },
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Sleeve drag', value: 'flower sweep', allowedCategories: ['Guard', 'Sweeps'] },
      { label: 'Far-arm clamp', value: 'kimura', allowedCategories: ['Guard', 'Submissions'] }
    ]
  },
  'de la riva off-balance-to-single-leg-x setups': {
    question: 'Which De La Riva off-balance-to-Single-Leg-X branch do you want to continue from?',
    options: [
      {
        label: 'Ankle steering',
        nextPrompt: {
          question: 'What reaction did the ankle steering create?',
          options: [
            { label: 'DLR-to-SLX lane opens', value: 'de la riva to single leg x sweep', enterTree: true, focusName: 'De La Riva To Single-Leg X Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Basic-SLX-sweep lane opens', value: 'basic single leg x sweep', enterTree: true, focusName: 'Basic Single-Leg X Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Ankle-dump lane opens', value: 'dlr ankle dump', enterTree: true, focusName: 'DLR Ankle Dump', allowedCategories: ['Sweeps'] },
            { label: 'Leg-drag lane opens', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing'] }
          ]
        }
      },
      {
        label: 'Hip scoot under',
        nextPrompt: {
          question: 'What continuation do you want from the hip scoot under?',
          options: [
            { label: 'De La Riva To Single-Leg X Sweep', value: 'de la riva to single leg x sweep', enterTree: true, focusName: 'De La Riva To Single-Leg X Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Basic Single-Leg X Sweep', value: 'basic single leg x sweep', enterTree: true, focusName: 'Basic Single-Leg X Sweep', allowedCategories: ['Sweeps'] },
            { label: 'DLR Ankle Dump', value: 'dlr ankle dump', enterTree: true, focusName: 'DLR Ankle Dump', allowedCategories: ['Sweeps'] },
            { label: 'Leg Drag', value: 'leg drag', enterTree: true, focusName: 'Leg Drag', allowedCategories: ['Passing'] }
          ]
        }
      },
      { label: 'DLR hook', value: 'de la riva to single leg x sweep', allowedCategories: ['Guard', 'Sweeps'] },
      { label: 'Upper-body pull', value: 'basic single leg x sweep', allowedCategories: ['Guard', 'Sweeps'] }
    ]
  },
  'leg-weave smash-to-pass setups': {
    question: 'Which leg-weave smash-to-pass branch do you want to continue from?',
    options: [
      {
        label: 'Leg weave',
        nextPrompt: {
          question: 'What reaction did the leg weave create?',
          options: [
            { label: 'Leg-weave-pass lane opens', value: 'leg weave pass', enterTree: true, focusName: 'Leg Weave Pass', allowedCategories: ['Passing'] },
            { label: 'Smash-pass lane opens', value: 'smash pass', enterTree: true, focusName: 'Smash Pass', allowedCategories: ['Passing'] },
            { label: 'Weave-to-mount lane opens', value: 'weave to mount', enterTree: true, focusName: 'Weave To Mount', allowedCategories: ['Passing'] },
            { label: 'Knee-on-belly lane opens', value: 'pass to knee on belly', enterTree: true, focusName: 'Pass To Knee On Belly', allowedCategories: ['Passing', 'Positions'] }
          ]
        }
      },
      {
        label: 'Shoulder pressure',
        nextPrompt: {
          question: 'What continuation do you want from the shoulder pressure?',
          options: [
            { label: 'Leg Weave Pass', value: 'leg weave pass', enterTree: true, focusName: 'Leg Weave Pass', allowedCategories: ['Passing'] },
            { label: 'Smash Pass', value: 'smash pass', enterTree: true, focusName: 'Smash Pass', allowedCategories: ['Passing'] },
            { label: 'Weave To Mount', value: 'weave to mount', enterTree: true, focusName: 'Weave To Mount', allowedCategories: ['Passing'] },
            { label: 'Pass To Knee On Belly', value: 'pass to knee on belly', enterTree: true, focusName: 'Pass To Knee On Belly', allowedCategories: ['Passing', 'Positions'] }
          ]
        }
      },
      { label: 'Knee pin', value: 'leg weave pass', allowedCategories: ['Passing', 'Positions'] },
      { label: 'Hip walk', value: 'smash pass', allowedCategories: ['Passing', 'Positions'] }
    ]
  },
  'torreando-to-north-south setups': {
    question: 'Which torreando-to-north-south branch do you want to continue from?',
    options: [
      {
        label: 'Shin redirect',
        nextPrompt: {
          question: 'What reaction did the shin redirect create?',
          options: [
            { label: 'North-south lane opens', value: 'north south', enterTree: true, focusName: 'North-South', allowedCategories: ['Passing', 'Positions'] },
            { label: 'North-south-pass lane opens', value: 'north south pass', enterTree: true, focusName: 'North-South Pass', allowedCategories: ['Passing'] },
            { label: 'Side-control lane opens', value: 'side control', enterTree: true, focusName: 'Side Control', allowedCategories: ['Passing', 'Positions'] },
            { label: 'Backstep-pass lane opens', value: 'backstep pass', enterTree: true, focusName: 'Backstep Pass', allowedCategories: ['Passing'] }
          ]
        }
      },
      {
        label: 'Circle step',
        nextPrompt: {
          question: 'What continuation do you want from the circle step?',
          options: [
            { label: 'North-South', value: 'north south', enterTree: true, focusName: 'North-South', allowedCategories: ['Passing', 'Positions'] },
            { label: 'North-South Pass', value: 'north south pass', enterTree: true, focusName: 'North-South Pass', allowedCategories: ['Passing'] },
            { label: 'Side Control', value: 'side control', enterTree: true, focusName: 'Side Control', allowedCategories: ['Passing', 'Positions'] },
            { label: 'Backstep Pass', value: 'backstep pass', enterTree: true, focusName: 'Backstep Pass', allowedCategories: ['Passing'] }
          ]
        }
      },
      { label: 'Shoulder-line win', value: 'north south', allowedCategories: ['Passing', 'Positions'] },
      { label: 'Hip turn-off', value: 'side control', allowedCategories: ['Passing', 'Positions'] }
    ]
  },
  'side-control americana-to-armbar setups': {
    question: 'Which side-control Americana-to-armbar branch do you want to continue from?',
    options: [
      {
        label: 'Americana threat',
        nextPrompt: {
          question: 'What reaction did the Americana threat create?',
          options: [
            { label: 'Americana lane opens', value: 'americana', enterTree: true, focusName: 'Americana', allowedCategories: ['Submissions'] },
            { label: 'Armbar lane opens', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] },
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Mount lane opens', value: 'mount', enterTree: true, focusName: 'Mount', allowedCategories: ['Passing', 'Positions'] }
          ]
        }
      },
      {
        label: 'Elbow lift',
        nextPrompt: {
          question: 'What continuation do you want from the elbow lift?',
          options: [
            { label: 'Americana', value: 'americana', enterTree: true, focusName: 'Americana', allowedCategories: ['Submissions'] },
            { label: 'Straight Armbar From Side Control', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] },
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Mount', value: 'mount', enterTree: true, focusName: 'Mount', allowedCategories: ['Passing', 'Positions'] }
          ]
        }
      },
      { label: 'Crossface pin', value: 'americana', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Wrist staple', value: 'straight armbar from side control', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'back-control short-choke-to-armbar setups': {
    question: 'Which back-control short-choke-to-armbar branch do you want to continue from?',
    options: [
      {
        label: 'Short-choke threat',
        nextPrompt: {
          question: 'What reaction did the short-choke threat create?',
          options: [
            { label: 'Short-choke lane opens', value: 'short choke', enterTree: true, focusName: 'Short Choke', allowedCategories: ['Submissions'] },
            { label: 'Armbar-position lane opens', value: 'armbar position', enterTree: true, focusName: 'Armbar Position', allowedCategories: ['Submissions', 'Positions'] },
            { label: 'Rear-triangle lane opens', value: 'rear triangle', enterTree: true, focusName: 'Rear Triangle', allowedCategories: ['Submissions'] },
            { label: 'RNC lane opens', value: 'rear naked choke', enterTree: true, focusName: 'Rear Naked Choke', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Hand-peel reaction',
        nextPrompt: {
          question: 'What continuation do you want from the hand-peel reaction?',
          options: [
            { label: 'Short Choke', value: 'short choke', enterTree: true, focusName: 'Short Choke', allowedCategories: ['Submissions'] },
            { label: 'Armbar Position', value: 'armbar position', enterTree: true, focusName: 'Armbar Position', allowedCategories: ['Submissions', 'Positions'] },
            { label: 'Rear Triangle', value: 'rear triangle', enterTree: true, focusName: 'Rear Triangle', allowedCategories: ['Submissions'] },
            { label: 'Rear Naked Choke', value: 'rear naked choke', enterTree: true, focusName: 'Rear Naked Choke', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Seatbelt tightening', value: 'short choke', allowedCategories: ['Back Takes', 'Submissions'] },
      { label: 'Shoulder-line trap', value: 'armbar position', allowedCategories: ['Back Takes', 'Submissions'] }
    ]
  },
  'closed-guard hip-bump-to-kimura setups': {
    question: 'Which closed-guard hip-bump-to-kimura branch do you want to continue from?',
    options: [
      {
        label: 'Hip-bump threat',
        nextPrompt: {
          question: 'What reaction did the hip-bump threat create?',
          options: [
            { label: 'Hip-bump lane opens', value: 'hip bump sweep', enterTree: true, focusName: 'Hip Bump Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Back-take lane opens', value: 'closed guard arm drag to back', enterTree: true, focusName: 'Closed Guard Arm Drag To Back', allowedCategories: ['Back Takes', 'Sweeps'] },
            { label: 'Triangle lane opens', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Wrist capture',
        nextPrompt: {
          question: 'What continuation do you want from the wrist capture?',
          options: [
            { label: 'Hip Bump Sweep', value: 'hip bump sweep', enterTree: true, focusName: 'Hip Bump Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Closed Guard Arm Drag To Back', value: 'closed guard arm drag to back', enterTree: true, focusName: 'Closed Guard Arm Drag To Back', allowedCategories: ['Back Takes', 'Sweeps'] },
            { label: 'Triangle Choke', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Sit-up threat', value: 'hip bump sweep', allowedCategories: ['Guard', 'Sweeps'] },
      { label: 'Post reaction', value: 'kimura', allowedCategories: ['Guard', 'Submissions'] }
    ]
  },
  'seated single-leg setups': {
    question: 'Which seated single-leg branch do you want to continue from?',
    options: [
      {
        label: 'Two-on-one',
        nextPrompt: {
          question: 'What reaction did the two-on-one create?',
          options: [
            { label: 'Seated-single lane opens', value: 'single-leg from seated guard', enterTree: true, focusName: 'Single-Leg From Seated Guard', allowedCategories: ['Takedowns', 'Sweeps'] },
            { label: 'Single-leg lane opens', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Seated-ankle-pick lane opens', value: 'seated ankle pick sweep', enterTree: true, focusName: 'Seated Ankle Pick Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Front-headlock lane opens', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Submissions', 'Takedowns'] }
          ]
        }
      },
      {
        label: 'Shoulder turn',
        nextPrompt: {
          question: 'What continuation do you want from the shoulder turn?',
          options: [
            { label: 'Single-Leg From Seated Guard', value: 'single-leg from seated guard', enterTree: true, focusName: 'Single-Leg From Seated Guard', allowedCategories: ['Takedowns', 'Sweeps'] },
            { label: 'Single Leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Seated Ankle Pick Sweep', value: 'seated ankle pick sweep', enterTree: true, focusName: 'Seated Ankle Pick Sweep', allowedCategories: ['Sweeps', 'Takedowns'] },
            { label: 'Front Headlock Standing', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Submissions', 'Takedowns'] }
          ]
        }
      },
      { label: 'Come-up step', value: 'single-leg from seated guard', allowedCategories: ['Seated Guard', 'Takedowns'] },
      { label: 'Head-position win', value: 'single leg', allowedCategories: ['Standing', 'Takedowns'] }
    ]
  },
  'knee-cut-to-mount-or-arm-triangle setups': {
    question: 'Which knee-cut-to-mount-or-arm-triangle branch do you want to continue from?',
    options: [
      {
        label: 'Crossface pin',
        nextPrompt: {
          question: 'What reaction did the crossface pin create?',
          options: [
            { label: 'Mount-off-knee-cut lane opens', value: 'mount off knee cut', enterTree: true, focusName: 'Mount Off Knee Cut', allowedCategories: ['Passing'] },
            { label: 'Arm-triangle lane opens', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] },
            { label: 'Knee-on-belly lane opens', value: 'pass to knee on belly', enterTree: true, focusName: 'Pass To Knee On Belly', allowedCategories: ['Passing', 'Positions'] },
            { label: 'Long-step lane opens', value: 'long step', enterTree: true, focusName: 'Long Step', allowedCategories: ['Passing'] }
          ]
        }
      },
      {
        label: 'Shoulder flatten',
        nextPrompt: {
          question: 'What continuation do you want from the shoulder flatten?',
          options: [
            { label: 'Mount Off Knee Cut', value: 'mount off knee cut', enterTree: true, focusName: 'Mount Off Knee Cut', allowedCategories: ['Passing'] },
            { label: 'Arm Triangle', value: 'arm triangle', enterTree: true, focusName: 'Arm Triangle', allowedCategories: ['Submissions'] },
            { label: 'Pass To Knee On Belly', value: 'pass to knee on belly', enterTree: true, focusName: 'Pass To Knee On Belly', allowedCategories: ['Passing', 'Positions'] },
            { label: 'Long Step', value: 'long step', enterTree: true, focusName: 'Long Step', allowedCategories: ['Passing'] }
          ]
        }
      },
      { label: 'Knee-cut entry', value: 'mount off knee cut', allowedCategories: ['Passing', 'Positions'] },
      { label: 'Hip switch', value: 'arm triangle', allowedCategories: ['Passing', 'Submissions'] }
    ]
  },
  'north-south-to-paper-cutter setups': {
    question: 'Which north-south-to-paper-cutter branch do you want to continue from?',
    options: [
      {
        label: 'Near-arm pin',
        nextPrompt: {
          question: 'What reaction did the near-arm pin create?',
          options: [
            { label: 'Paper-cutter lane opens', value: 'paper cutter choke', enterTree: true, focusName: 'Paper Cutter Choke', allowedCategories: ['Submissions'] },
            { label: 'North-south-choke lane opens', value: 'north-south choke', enterTree: true, focusName: 'North-South Choke', allowedCategories: ['Submissions'] },
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Armbar lane opens', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Head turn',
        nextPrompt: {
          question: 'What continuation do you want from the head turn?',
          options: [
            { label: 'Paper Cutter Choke', value: 'paper cutter choke', enterTree: true, focusName: 'Paper Cutter Choke', allowedCategories: ['Submissions'] },
            { label: 'North-South Choke', value: 'north-south choke', enterTree: true, focusName: 'North-South Choke', allowedCategories: ['Submissions'] },
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Straight Armbar From Side Control', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'North-south float', value: 'paper cutter choke', allowedCategories: ['Passing', 'Submissions'] },
      { label: 'Collar / wrist find', value: 'kimura', allowedCategories: ['Submissions', 'Positions'] }
    ]
  },
  'back-control rear-triangle setups': {
    question: 'Which back-control rear-triangle branch do you want to continue from?',
    options: [
      {
        label: 'Choke threat',
        nextPrompt: {
          question: 'What reaction did the choke threat create?',
          options: [
            { label: 'Rear-triangle lane opens', value: 'rear triangle', enterTree: true, focusName: 'Rear Triangle', allowedCategories: ['Submissions'] },
            { label: 'Armbar-position lane opens', value: 'armbar position', enterTree: true, focusName: 'Armbar Position', allowedCategories: ['Submissions', 'Positions'] },
            { label: 'Short-choke lane opens', value: 'short choke', enterTree: true, focusName: 'Short Choke', allowedCategories: ['Submissions'] },
            { label: 'RNC lane opens', value: 'rear naked choke', enterTree: true, focusName: 'Rear Naked Choke', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Leg climb',
        nextPrompt: {
          question: 'What continuation do you want from the leg climb?',
          options: [
            { label: 'Rear Triangle', value: 'rear triangle', enterTree: true, focusName: 'Rear Triangle', allowedCategories: ['Submissions'] },
            { label: 'Armbar Position', value: 'armbar position', enterTree: true, focusName: 'Armbar Position', allowedCategories: ['Submissions', 'Positions'] },
            { label: 'Short Choke', value: 'short choke', enterTree: true, focusName: 'Short Choke', allowedCategories: ['Submissions'] },
            { label: 'Rear Naked Choke', value: 'rear naked choke', enterTree: true, focusName: 'Rear Naked Choke', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Seatbelt clamp', value: 'rear triangle', allowedCategories: ['Back Takes', 'Submissions'] },
      { label: 'Shoulder trap', value: 'armbar position', allowedCategories: ['Back Takes', 'Submissions'] }
    ]
  },
  'open-guard collar-drag-to-front-headlock setups': {
    question: 'Which open-guard collar-drag-to-front-headlock branch do you want to continue from?',
    options: [
      {
        label: 'Collar drag',
        nextPrompt: {
          question: 'What reaction did the collar drag create?',
          options: [
            { label: 'Front-headlock lane opens', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Submissions', 'Takedowns'] },
            { label: 'Snap-down lane opens', value: 'snap down', enterTree: true, focusName: 'Snap Down', allowedCategories: ['Takedowns'] },
            { label: 'Go-behind lane opens', value: 'go-behind position', enterTree: true, focusName: 'Go-Behind Position', allowedCategories: ['Takedowns', 'Positions'] },
            { label: 'Seated-single lane opens', value: 'single-leg from seated guard', enterTree: true, focusName: 'Single-Leg From Seated Guard', allowedCategories: ['Takedowns', 'Sweeps'] }
          ]
        }
      },
      {
        label: 'Come-up chase',
        nextPrompt: {
          question: 'What continuation do you want from the come-up chase?',
          options: [
            { label: 'Front Headlock Standing', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Submissions', 'Takedowns'] },
            { label: 'Snap Down', value: 'snap down', enterTree: true, focusName: 'Snap Down', allowedCategories: ['Takedowns'] },
            { label: 'Go-Behind Position', value: 'go-behind position', enterTree: true, focusName: 'Go-Behind Position', allowedCategories: ['Takedowns', 'Positions'] },
            { label: 'Single-Leg From Seated Guard', value: 'single-leg from seated guard', enterTree: true, focusName: 'Single-Leg From Seated Guard', allowedCategories: ['Takedowns', 'Sweeps'] }
          ]
        }
      },
      { label: 'Head pull', value: 'front headlock standing', allowedCategories: ['Standing', 'Takedowns'] },
      { label: 'Shoulder turn', value: 'go-behind position', allowedCategories: ['Standing', 'Takedowns'] }
    ]
  },
  'butterfly two-on-one-to-arm-drag setups': {
    question: 'Which butterfly two-on-one-to-arm-drag branch do you want to continue from?',
    options: [
      {
        label: 'Two-on-one control',
        nextPrompt: {
          question: 'What reaction did the two-on-one control create?',
          options: [
            { label: 'Arm-drag lane opens', value: 'arm drag to back', enterTree: true, focusName: 'Arm Drag To Back', allowedCategories: ['Back Takes', 'Takedowns'] },
            { label: 'Shoulder-crunch lane opens', value: 'shoulder crunch butterfly sweep', enterTree: true, focusName: 'Shoulder Crunch Butterfly Sweep', allowedCategories: ['Sweeps', 'Submissions'] },
            { label: 'Single-leg lane opens', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Shoulder turn',
        nextPrompt: {
          question: 'What continuation do you want from the shoulder turn?',
          options: [
            { label: 'Arm Drag To Back', value: 'arm drag to back', enterTree: true, focusName: 'Arm Drag To Back', allowedCategories: ['Back Takes', 'Takedowns'] },
            { label: 'Shoulder Crunch Butterfly Sweep', value: 'shoulder crunch butterfly sweep', enterTree: true, focusName: 'Shoulder Crunch Butterfly Sweep', allowedCategories: ['Sweeps', 'Submissions'] },
            { label: 'Single Leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Head-position win', value: 'arm drag to back', allowedCategories: ['Guard', 'Back Takes'] },
      { label: 'Angle sit-up', value: 'shoulder crunch butterfly sweep', allowedCategories: ['Guard', 'Sweeps'] }
    ]
  },
  'closed-guard submission setups': {
    question: 'Which closed-guard submission branch do you want to continue from?',
    options: [
      {
        label: 'Posture break',
        nextPrompt: {
          question: 'What reaction did the posture break create?',
          options: [
            { label: 'Triangle lane opens', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Armbar lane opens', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Omoplata lane opens', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Clamp-guard lane opens', value: 'clamp guard', enterTree: true, focusName: 'Clamp Guard', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      {
        label: 'Hip climb',
        nextPrompt: {
          question: 'What continuation do you want from the hip climb?',
          options: [
            { label: 'Triangle Choke', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Straight Armbar From Guard', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Omoplata', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Clamp Guard', value: 'clamp guard', enterTree: true, focusName: 'Clamp Guard', allowedCategories: ['Guard', 'Positions'] }
          ]
        }
      },
      { label: 'Head pull', value: 'triangle choke', allowedCategories: ['Guard', 'Submissions'] },
      { label: 'Arm-in clamp', value: 'omoplata', allowedCategories: ['Guard', 'Submissions'] }
    ]
  },
  'top-half underhook-to-knee-slice setups': {
    question: 'Which top-half underhook-to-knee-slice branch do you want to continue from?',
    options: [
      {
        label: 'Underhook win',
        nextPrompt: {
          question: 'What reaction did the underhook win create?',
          options: [
            { label: 'Knee-slice lane opens', value: 'knee slice pass', enterTree: true, focusName: 'Knee Slice Pass', allowedCategories: ['Passing'] },
            { label: 'Mount lane opens', value: 'mount off knee cut', enterTree: true, focusName: 'Mount Off Knee Cut', allowedCategories: ['Passing'] },
            { label: 'Knee-on-belly lane opens', value: 'pass to knee on belly', enterTree: true, focusName: 'Pass To Knee On Belly', allowedCategories: ['Passing', 'Positions'] },
            { label: 'Long-step lane opens', value: 'long step', enterTree: true, focusName: 'Long Step', allowedCategories: ['Passing'] }
          ]
        }
      },
      {
        label: 'Knee-line free',
        nextPrompt: {
          question: 'What continuation do you want from the cleared knee line?',
          options: [
            { label: 'Knee Slice Pass', value: 'knee slice pass', enterTree: true, focusName: 'Knee Slice Pass', allowedCategories: ['Passing'] },
            { label: 'Mount Off Knee Cut', value: 'mount off knee cut', enterTree: true, focusName: 'Mount Off Knee Cut', allowedCategories: ['Passing'] },
            { label: 'Pass To Knee On Belly', value: 'pass to knee on belly', enterTree: true, focusName: 'Pass To Knee On Belly', allowedCategories: ['Passing', 'Positions'] },
            { label: 'Long Step', value: 'long step', enterTree: true, focusName: 'Long Step', allowedCategories: ['Passing'] }
          ]
        }
      },
      { label: 'Head position', value: 'knee slice pass', allowedCategories: ['Passing', 'Positions'] },
      { label: 'Hip switch', value: 'mount off knee cut', allowedCategories: ['Passing', 'Positions'] }
    ]
  },
  'side-control-to-crucifix setups': {
    question: 'Which side-control-to-crucifix branch do you want to continue from?',
    options: [
      {
        label: 'Near-arm isolation',
        nextPrompt: {
          question: 'What reaction did the near-arm isolation create?',
          options: [
            { label: 'Crucifix lane opens', value: 'crucifix', enterTree: true, focusName: 'Crucifix', allowedCategories: ['Submissions', 'Positions'] },
            { label: 'North-south-choke lane opens', value: 'north-south choke', enterTree: true, focusName: 'North-South Choke', allowedCategories: ['Submissions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Armbar lane opens', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Shoulder turn',
        nextPrompt: {
          question: 'What continuation do you want from the shoulder turn?',
          options: [
            { label: 'Crucifix', value: 'crucifix', enterTree: true, focusName: 'Crucifix', allowedCategories: ['Submissions', 'Positions'] },
            { label: 'North-South Choke', value: 'north-south choke', enterTree: true, focusName: 'North-South Choke', allowedCategories: ['Submissions'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Straight Armbar From Side Control', value: 'straight armbar from side control', enterTree: true, focusName: 'Straight Armbar From Side Control', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Head control', value: 'crucifix', allowedCategories: ['Positions', 'Submissions'] },
      { label: 'Hip walk north', value: 'north-south choke', allowedCategories: ['Positions', 'Submissions'] }
    ]
  },
  'back-control bow-and-arrow setups': {
    question: 'Which back-control bow-and-arrow branch do you want to continue from?',
    options: [
      {
        label: 'Collar feed',
        nextPrompt: {
          question: 'What reaction did the collar feed create?',
          options: [
            { label: 'Bow-and-arrow lane opens', value: 'bow and arrow choke', enterTree: true, focusName: 'Bow And Arrow Choke', allowedCategories: ['Submissions'] },
            { label: 'Short-choke lane opens', value: 'short choke', enterTree: true, focusName: 'Short Choke', allowedCategories: ['Submissions'] },
            { label: 'Technical-mount lane opens', value: 'technical mount', enterTree: true, focusName: 'Technical Mount', allowedCategories: ['Positions', 'Back Takes'] },
            { label: 'Back-control lane stays open', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Hip angle change',
        nextPrompt: {
          question: 'What continuation do you want from the hip angle change?',
          options: [
            { label: 'Bow And Arrow Choke', value: 'bow and arrow choke', enterTree: true, focusName: 'Bow And Arrow Choke', allowedCategories: ['Submissions'] },
            { label: 'Short Choke', value: 'short choke', enterTree: true, focusName: 'Short Choke', allowedCategories: ['Submissions'] },
            { label: 'Technical Mount', value: 'technical mount', enterTree: true, focusName: 'Technical Mount', allowedCategories: ['Positions', 'Back Takes'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] }
          ]
        }
      },
      { label: 'Shoulder trap', value: 'bow and arrow choke', allowedCategories: ['Back Takes', 'Submissions'] },
      { label: 'Top-leg control', value: 'short choke', allowedCategories: ['Back Takes', 'Submissions'] }
    ]
  },
  'standing front-headlock setups': {
    question: 'Which standing front-headlock branch do you want to continue from?',
    options: [
      {
        label: 'Snap down',
        nextPrompt: {
          question: 'What reaction did the snap down create?',
          options: [
            { label: 'Front-headlock lane opens', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Submissions', 'Takedowns'] },
            { label: 'Go-behind lane opens', value: 'go-behind position', enterTree: true, focusName: 'Go-Behind Position', allowedCategories: ['Takedowns', 'Positions'] },
            { label: 'Guillotine lane opens', value: 'guillotine', enterTree: true, focusName: 'Guillotine', allowedCategories: ['Submissions'] },
            { label: 'Snap-down-front-headlock lane opens', value: 'snap down to front headlock', enterTree: true, focusName: 'Snap Down To Front Headlock', allowedCategories: ['Takedowns', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Angle step',
        nextPrompt: {
          question: 'What continuation do you want from the angle step?',
          options: [
            { label: 'Front Headlock Standing', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Submissions', 'Takedowns'] },
            { label: 'Go-Behind Position', value: 'go-behind position', enterTree: true, focusName: 'Go-Behind Position', allowedCategories: ['Takedowns', 'Positions'] },
            { label: 'Guillotine', value: 'guillotine', enterTree: true, focusName: 'Guillotine', allowedCategories: ['Submissions'] },
            { label: 'Snap Down To Front Headlock', value: 'snap down to front headlock', enterTree: true, focusName: 'Snap Down To Front Headlock', allowedCategories: ['Takedowns', 'Submissions'] }
          ]
        }
      },
      { label: 'Head pull', value: 'front headlock standing', allowedCategories: ['Standing', 'Takedowns'] },
      { label: 'Shoulder cover', value: 'go-behind position', allowedCategories: ['Standing', 'Takedowns'] }
    ]
  },
  'k-guard entry-to-backside-50/50 setups': {
    question: 'Which K-guard entry-to-backside-50/50 branch do you want to continue from?',
    options: [
      {
        label: 'K-guard entry',
        nextPrompt: {
          question: 'What reaction did the K-guard entry create?',
          options: [
            { label: 'Backside-50/50 lane opens', value: 'backside 50/50', enterTree: true, focusName: 'Backside 50/50', allowedCategories: ['Positions', 'Submissions'] },
            { label: 'Inside-heel-hook lane opens', value: 'inside heel hook', enterTree: true, focusName: 'Inside Heel Hook', allowedCategories: ['Submissions'] },
            { label: 'Back-take lane opens', value: 'wedging back take', enterTree: true, focusName: 'Wedging Back Take', allowedCategories: ['Back Takes'] },
            { label: '50/50 lane opens', value: '50/50', enterTree: true, focusName: '50/50', allowedCategories: ['Positions', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Hip tilt',
        nextPrompt: {
          question: 'What continuation do you want from the hip tilt?',
          options: [
            { label: 'Backside 50/50', value: 'backside 50/50', enterTree: true, focusName: 'Backside 50/50', allowedCategories: ['Positions', 'Submissions'] },
            { label: 'Inside Heel Hook', value: 'inside heel hook', enterTree: true, focusName: 'Inside Heel Hook', allowedCategories: ['Submissions'] },
            { label: 'Wedging Back Take', value: 'wedging back take', enterTree: true, focusName: 'Wedging Back Take', allowedCategories: ['Back Takes'] },
            { label: '50/50', value: '50/50', enterTree: true, focusName: '50/50', allowedCategories: ['Positions', 'Submissions'] }
          ]
        }
      },
      { label: 'Leg pummel', value: 'backside 50/50', allowedCategories: ['Guard', 'Submissions'] },
      { label: 'Secondary-leg clamp', value: 'inside heel hook', allowedCategories: ['Guard', 'Submissions'] }
    ]
  },
  'dogfight underhook-to-plan-b setups': {
    question: 'Which dogfight underhook-to-Plan-B branch do you want to continue from?',
    options: [
      {
        label: 'Dogfight underhook',
        nextPrompt: {
          question: 'What reaction did the dogfight underhook create?',
          options: [
            { label: 'Plan-B lane opens', value: 'plan b sweep', enterTree: true, focusName: 'Plan B Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Dogfight-sweep lane opens', value: 'dogfight sweep', enterTree: true, focusName: 'Dogfight Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Single-leg lane opens', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Back-take lane opens', value: 'underhook half guard to dogfight to back', enterTree: true, focusName: 'Underhook Half Guard To Dogfight To Back', allowedCategories: ['Back Takes', 'Sweeps'] }
          ]
        }
      },
      {
        label: 'Far-knee chase',
        nextPrompt: {
          question: 'What continuation do you want from the far-knee chase?',
          options: [
            { label: 'Plan B Sweep', value: 'plan b sweep', enterTree: true, focusName: 'Plan B Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Dogfight Sweep', value: 'dogfight sweep', enterTree: true, focusName: 'Dogfight Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Single Leg', value: 'single leg', enterTree: true, focusName: 'Single Leg', allowedCategories: ['Takedowns'] },
            { label: 'Underhook Half Guard To Dogfight To Back', value: 'underhook half guard to dogfight to back', enterTree: true, focusName: 'Underhook Half Guard To Dogfight To Back', allowedCategories: ['Back Takes', 'Sweeps'] }
          ]
        }
      },
      { label: 'Head-position win', value: 'plan b sweep', allowedCategories: ['Guard', 'Sweeps'] },
      { label: 'Hip shelf', value: 'dogfight sweep', allowedCategories: ['Guard', 'Sweeps'] }
    ]
  },
  'top-side-control-to-paper-cutter setups': {
    question: 'Which top-side-control-to-paper-cutter branch do you want to continue from?',
    options: [
      {
        label: 'Collar feed',
        nextPrompt: {
          question: 'What reaction did the collar feed create?',
          options: [
            { label: 'Paper-cutter lane opens', value: 'paper cutter choke', enterTree: true, focusName: 'Paper Cutter Choke', allowedCategories: ['Submissions'] },
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Mount lane opens', value: 'mount', enterTree: true, focusName: 'Mount', allowedCategories: ['Passing', 'Positions'] },
            { label: 'North-south-choke lane opens', value: 'north-south choke', enterTree: true, focusName: 'North-South Choke', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Near-elbow pin',
        nextPrompt: {
          question: 'What continuation do you want from the near-elbow pin?',
          options: [
            { label: 'Paper Cutter Choke', value: 'paper cutter choke', enterTree: true, focusName: 'Paper Cutter Choke', allowedCategories: ['Submissions'] },
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] },
            { label: 'Mount', value: 'mount', enterTree: true, focusName: 'Mount', allowedCategories: ['Passing', 'Positions'] },
            { label: 'North-South Choke', value: 'north-south choke', enterTree: true, focusName: 'North-South Choke', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Shoulder pressure', value: 'paper cutter choke', allowedCategories: ['Submissions', 'Positions'] },
      { label: 'Hip walk', value: 'mount', allowedCategories: ['Passing', 'Positions'] }
    ]
  },
  'mount gift-wrap-to-back setups': {
    question: 'Which mount gift-wrap-to-back branch do you want to continue from?',
    options: [
      {
        label: 'Gift wrap',
        nextPrompt: {
          question: 'What reaction did the gift wrap create?',
          options: [
            { label: 'Back-take lane opens', value: 'technical mount to back', enterTree: true, focusName: 'Technical Mount To Back', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'RNC lane opens', value: 'rear naked choke', enterTree: true, focusName: 'Rear Naked Choke', allowedCategories: ['Submissions'] },
            { label: 'Armbar lane opens', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Technical-mount step',
        nextPrompt: {
          question: 'What continuation do you want from the technical-mount step?',
          options: [
            { label: 'Technical Mount To Back', value: 'technical mount to back', enterTree: true, focusName: 'Technical Mount To Back', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Rear Naked Choke', value: 'rear naked choke', enterTree: true, focusName: 'Rear Naked Choke', allowedCategories: ['Submissions'] },
            { label: 'Straight Armbar From Mount', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Shoulder turn', value: 'technical mount to back', allowedCategories: ['Mount', 'Back Takes'] },
      { label: 'Hip follow', value: 'straight armbar from mount', allowedCategories: ['Mount', 'Submissions'] }
    ]
  },
  'seated collar-drag-to-back setups': {
    question: 'Which seated collar-drag-to-back branch do you want to continue from?',
    options: [
      {
        label: 'Seated collar drag',
        nextPrompt: {
          question: 'What reaction did the seated collar drag create?',
          options: [
            { label: 'Back-take lane opens', value: 'arm drag to back', enterTree: true, focusName: 'Arm Drag To Back', allowedCategories: ['Back Takes', 'Takedowns'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Front-headlock lane opens', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Submissions', 'Takedowns'] },
            { label: 'Seated-single lane opens', value: 'single-leg from seated guard', enterTree: true, focusName: 'Single-Leg From Seated Guard', allowedCategories: ['Takedowns', 'Sweeps'] }
          ]
        }
      },
      {
        label: 'Angle step',
        nextPrompt: {
          question: 'What continuation do you want from the angle step?',
          options: [
            { label: 'Arm Drag To Back', value: 'arm drag to back', enterTree: true, focusName: 'Arm Drag To Back', allowedCategories: ['Back Takes', 'Takedowns'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Front Headlock Standing', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Submissions', 'Takedowns'] },
            { label: 'Single-Leg From Seated Guard', value: 'single-leg from seated guard', enterTree: true, focusName: 'Single-Leg From Seated Guard', allowedCategories: ['Takedowns', 'Sweeps'] }
          ]
        }
      },
      { label: 'Shoulder pull', value: 'arm drag to back', allowedCategories: ['Guard', 'Back Takes'] },
      { label: 'Chest follow', value: 'back control', allowedCategories: ['Guard', 'Back Takes'] }
    ]
  },
  'reverse de la riva back-take setups': {
    question: 'Which Reverse De La Riva back-take branch do you want to continue from?',
    options: [
      {
        label: 'RDLR hook',
        nextPrompt: {
          question: 'What reaction did the RDLR hook create?',
          options: [
            { label: 'Kiss-of-the-dragon lane opens', value: 'kiss of the dragon', enterTree: true, focusName: 'Kiss Of The Dragon', allowedCategories: ['Back Takes', 'Sweeps'] },
            { label: 'Baby-bolo lane opens', value: 'baby bolo', enterTree: true, focusName: 'Baby Bolo', allowedCategories: ['Back Takes', 'Sweeps'] },
            { label: 'Back-control lane opens', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Ashi lane opens', value: 'ashi garami', enterTree: true, focusName: 'Ashi Garami', allowedCategories: ['Positions', 'Submissions'] }
          ]
        }
      },
      {
        label: 'Spin-under entry',
        nextPrompt: {
          question: 'What continuation do you want from the spin-under entry?',
          options: [
            { label: 'Kiss Of The Dragon', value: 'kiss of the dragon', enterTree: true, focusName: 'Kiss Of The Dragon', allowedCategories: ['Back Takes', 'Sweeps'] },
            { label: 'Baby Bolo', value: 'baby bolo', enterTree: true, focusName: 'Baby Bolo', allowedCategories: ['Back Takes', 'Sweeps'] },
            { label: 'Back Control', value: 'back control', enterTree: true, focusName: 'Back Control', allowedCategories: ['Back Takes', 'Submissions'] },
            { label: 'Ashi Garami', value: 'ashi garami', enterTree: true, focusName: 'Ashi Garami', allowedCategories: ['Positions', 'Submissions'] }
          ]
        }
      },
      { label: 'Shoulder turn', value: 'kiss of the dragon', allowedCategories: ['Guard', 'Back Takes'] },
      { label: 'Hip follow', value: 'baby bolo', allowedCategories: ['Guard', 'Back Takes'] }
    ]
  },
  'spider-guard submission setups': {
    question: 'Which spider-guard submission branch do you want to continue from?',
    options: [
      {
        label: 'Sleeve tension',
        nextPrompt: {
          question: 'What reaction did the sleeve tension create?',
          options: [
            { label: 'Omoplata lane opens', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Triangle lane opens', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Armbar lane opens', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Sweep lane opens', value: 'spider lasso sweep', enterTree: true, focusName: 'Spider Lasso Sweep', allowedCategories: ['Sweeps'] }
          ]
        }
      },
      {
        label: 'Posture break',
        nextPrompt: {
          question: 'What continuation do you want from the posture break?',
          options: [
            { label: 'Omoplata', value: 'omoplata', enterTree: true, focusName: 'Omoplata', allowedCategories: ['Submissions'] },
            { label: 'Triangle Choke', value: 'triangle choke', enterTree: true, focusName: 'Triangle Choke', allowedCategories: ['Submissions'] },
            { label: 'Straight Armbar From Guard', value: 'straight armbar from guard', enterTree: true, focusName: 'Straight Armbar From Guard', allowedCategories: ['Submissions'] },
            { label: 'Spider Lasso Sweep', value: 'spider lasso sweep', enterTree: true, focusName: 'Spider Lasso Sweep', allowedCategories: ['Sweeps'] }
          ]
        }
      },
      { label: 'Hip angle', value: 'omoplata', allowedCategories: ['Guard', 'Submissions'] },
      { label: 'Leg re-climb', value: 'triangle choke', allowedCategories: ['Guard', 'Submissions'] }
    ]
  },
  'seated front-headlock setups': {
    question: 'Which seated front-headlock branch do you want to continue from?',
    options: [
      {
        label: 'Arm drag',
        nextPrompt: {
          question: 'What reaction did the arm drag create?',
          options: [
            { label: 'Front-headlock lane opens', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Submissions', 'Takedowns'] },
            { label: 'Go-behind lane opens', value: 'go-behind position', enterTree: true, focusName: 'Go-Behind Position', allowedCategories: ['Takedowns', 'Positions'] },
            { label: 'Single-leg lane opens', value: 'single-leg from seated guard', enterTree: true, focusName: 'Single-Leg From Seated Guard', allowedCategories: ['Takedowns', 'Sweeps'] },
            { label: 'Snap-down lane opens', value: 'snap down', enterTree: true, focusName: 'Snap Down', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      {
        label: 'Head position',
        nextPrompt: {
          question: 'What continuation do you want from the head-position win?',
          options: [
            { label: 'Front Headlock Standing', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Submissions', 'Takedowns'] },
            { label: 'Go-Behind Position', value: 'go-behind position', enterTree: true, focusName: 'Go-Behind Position', allowedCategories: ['Takedowns', 'Positions'] },
            { label: 'Single-Leg From Seated Guard', value: 'single-leg from seated guard', enterTree: true, focusName: 'Single-Leg From Seated Guard', allowedCategories: ['Takedowns', 'Sweeps'] },
            { label: 'Snap Down', value: 'snap down', enterTree: true, focusName: 'Snap Down', allowedCategories: ['Takedowns'] }
          ]
        }
      },
      { label: 'Shoulder pull', value: 'front headlock standing', allowedCategories: ['Guard', 'Takedowns'] },
      { label: 'Angle sit-up', value: 'go-behind position', allowedCategories: ['Guard', 'Takedowns'] }
    ]
  },
  'top-half submission setups': {
    question: 'Which top-half submission branch do you want to continue from?',
    options: [
      {
        label: 'Crossface pressure',
        nextPrompt: {
          question: 'What reaction did the crossface pressure create?',
          options: [
            { label: 'Paper-cutter lane opens', value: 'paper cutter choke', enterTree: true, focusName: 'Paper Cutter Choke', allowedCategories: ['Submissions'] },
            { label: 'Mount lane opens', value: 'mount', enterTree: true, focusName: 'Mount', allowedCategories: ['Passing', 'Positions'] },
            { label: 'North-south lane opens', value: 'north-south choke', enterTree: true, focusName: 'North-South Choke', allowedCategories: ['Submissions'] },
            { label: 'Kimura lane opens', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Collar feed',
        nextPrompt: {
          question: 'What continuation do you want from the collar feed?',
          options: [
            { label: 'Paper Cutter Choke', value: 'paper cutter choke', enterTree: true, focusName: 'Paper Cutter Choke', allowedCategories: ['Submissions'] },
            { label: 'Mount', value: 'mount', enterTree: true, focusName: 'Mount', allowedCategories: ['Passing', 'Positions'] },
            { label: 'North-South Choke', value: 'north-south choke', enterTree: true, focusName: 'North-South Choke', allowedCategories: ['Submissions'] },
            { label: 'Kimura', value: 'kimura', enterTree: true, focusName: 'Kimura', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Near-elbow pin', value: 'paper cutter choke', allowedCategories: ['Top Half Guard', 'Submissions'] },
      { label: 'Hip walk', value: 'mount', allowedCategories: ['Top Half Guard', 'Passing'] }
    ]
  },
  'mount back-take setups': {
    question: 'Which mount back-take branch do you want to continue from?',
    options: [
      {
        label: 'Smother pressure',
        nextPrompt: {
          question: 'What reaction did the smother pressure create?',
          options: [
            { label: 'Gift-wrap lane opens', value: 'gift wrap', enterTree: true, focusName: 'Gift Wrap', allowedCategories: ['Submissions', 'Positions'] },
            { label: 'Back-take lane opens', value: 'technical mount to back', enterTree: true, focusName: 'Technical Mount To Back', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Armbar lane opens', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] },
            { label: 'Mounted-triangle lane opens', value: 'mounted triangle', enterTree: true, focusName: 'Mounted Triangle', allowedCategories: ['Submissions'] }
          ]
        }
      },
      {
        label: 'Wrist capture',
        nextPrompt: {
          question: 'What continuation do you want from the wrist capture?',
          options: [
            { label: 'Gift Wrap', value: 'gift wrap', enterTree: true, focusName: 'Gift Wrap', allowedCategories: ['Submissions', 'Positions'] },
            { label: 'Technical Mount To Back', value: 'technical mount to back', enterTree: true, focusName: 'Technical Mount To Back', allowedCategories: ['Back Takes', 'Positions'] },
            { label: 'Straight Armbar From Mount', value: 'straight armbar from mount', enterTree: true, focusName: 'Straight Armbar From Mount', allowedCategories: ['Submissions'] },
            { label: 'Mounted Triangle', value: 'mounted triangle', enterTree: true, focusName: 'Mounted Triangle', allowedCategories: ['Submissions'] }
          ]
        }
      },
      { label: 'Shoulder turn', value: 'gift wrap', allowedCategories: ['Mount', 'Submissions'] },
      { label: 'Head follow', value: 'technical mount to back', allowedCategories: ['Mount', 'Back Takes'] }
    ]
  },
  'front-headlock submission setups': {
    question: 'Which front-headlock submission branch do you want to continue from?',
    options: [
      {
        label: 'Snap pressure',
        nextPrompt: {
          question: 'What reaction did the snap pressure create?',
          options: [
            { label: "D'Arce lane opens", value: 'darce choke', enterTree: true, focusName: "D'Arce Choke", allowedCategories: ['Submissions'] },
            { label: 'Anaconda lane opens', value: 'anaconda choke', enterTree: true, focusName: 'Anaconda Choke', allowedCategories: ['Submissions'] },
            { label: 'Front-headlock lane stays open', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Submissions', 'Takedowns'] },
            { label: 'Go-behind lane opens', value: 'go-behind position', enterTree: true, focusName: 'Go-Behind Position', allowedCategories: ['Takedowns', 'Positions'] }
          ]
        }
      },
      {
        label: 'Elbow thread',
        nextPrompt: {
          question: 'What continuation do you want from the elbow thread?',
          options: [
            { label: "D'Arce Choke", value: 'darce choke', enterTree: true, focusName: "D'Arce Choke", allowedCategories: ['Submissions'] },
            { label: 'Anaconda Choke', value: 'anaconda choke', enterTree: true, focusName: 'Anaconda Choke', allowedCategories: ['Submissions'] },
            { label: 'Front Headlock Standing', value: 'front headlock standing', enterTree: true, focusName: 'Front Headlock Standing', allowedCategories: ['Submissions', 'Takedowns'] },
            { label: 'Go-Behind Position', value: 'go-behind position', enterTree: true, focusName: 'Go-Behind Position', allowedCategories: ['Takedowns', 'Positions'] }
          ]
        }
      },
      { label: 'Shoulder cover', value: 'darce choke', allowedCategories: ['Front Headlock', 'Submissions'] },
      { label: 'Angle step', value: 'go-behind position', allowedCategories: ['Front Headlock', 'Takedowns'] }
    ]
  },
  'single-leg-x submission setups': {
    question: 'Which Single-Leg-X submission branch do you want to continue from?',
    options: [
      {
        label: 'SLX off-balance',
        nextPrompt: {
          question: 'What reaction did the off-balance create?',
          options: [
            { label: 'Straight-ankle-lock lane opens', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Submissions'] },
            { label: 'Caio-Terra-lock lane opens', value: 'caio terra lock', enterTree: true, focusName: 'Caio Terra Lock', allowedCategories: ['Submissions'] },
            { label: 'Basic-sweep lane opens', value: 'basic single-leg x sweep', enterTree: true, focusName: 'Basic Single-Leg X Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Stand-up-sweep lane opens', value: 'single-leg x stand-up sweep', enterTree: true, focusName: 'Single-Leg X Stand-Up Sweep', allowedCategories: ['Sweeps'] }
          ]
        }
      },
      {
        label: 'Foot exposure',
        nextPrompt: {
          question: 'What continuation do you want from the foot exposure?',
          options: [
            { label: 'Straight Ankle Lock', value: 'straight ankle lock', enterTree: true, focusName: 'Straight Ankle Lock', allowedCategories: ['Submissions'] },
            { label: 'Caio Terra Lock', value: 'caio terra lock', enterTree: true, focusName: 'Caio Terra Lock', allowedCategories: ['Submissions'] },
            { label: 'Basic Single-Leg X Sweep', value: 'basic single-leg x sweep', enterTree: true, focusName: 'Basic Single-Leg X Sweep', allowedCategories: ['Sweeps'] },
            { label: 'Single-Leg X Stand-Up Sweep', value: 'single-leg x stand-up sweep', enterTree: true, focusName: 'Single-Leg X Stand-Up Sweep', allowedCategories: ['Sweeps'] }
          ]
        }
      },
      { label: 'Hip angle', value: 'straight ankle lock', allowedCategories: ['Guard', 'Submissions'] },
      { label: 'Top-leg clamp', value: 'caio terra lock', allowedCategories: ['Guard', 'Submissions'] }
    ]
  }
};

export const getSetupFamilyPrompt = (setupFamily) => {
  const normalizedFamily = String(setupFamily || '')
    .trim()
    .toLowerCase();

  return setupFamilyPromptConfig[normalizedFamily] || null;
};
