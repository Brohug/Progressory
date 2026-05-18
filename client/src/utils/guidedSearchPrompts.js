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
