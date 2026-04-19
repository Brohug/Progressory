const curriculumIndexSeed = [
  {
    id: 'fundamentals-base',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Base',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'structure', 'balance'],
    description: 'The ability to stay stable, balanced, and hard to move while applying pressure or defending movement.',
    relatedPositions: []
  },
  {
    id: 'fundamentals-elbow-knee-connection',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Elbow-Knee Connection',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'defense', 'retention'],
    description: 'Keeping the elbow and knee connected to protect inside space and limit easy openings.',
    relatedPositions: ['Guard Retention', 'Mount Defense', 'Side Control Defense']
  },
  {
    id: 'fundamentals-posture',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Posture',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'structure', 'alignment'],
    description: 'Maintaining strong alignment so pressure, movement, and defense can all happen from a safer base.',
    relatedPositions: ['Standing', 'Closed Guard Top', 'Mount']
  },
  {
    id: 'fundamentals-frames',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Frames',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'defense', 'space'],
    description: 'Using skeletal structure to preserve space and direction without wasting energy.',
    relatedPositions: ['Side Control Defense', 'Mount Defense', 'Guard Retention']
  },
  {
    id: 'fundamentals-kuzushi',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Kuzushi',
    skillLevel: 'Intermediate',
    tags: ['fundamental', 'off-balance', 'timing'],
    description: 'Breaking balance and alignment before trying to finish a sweep, takedown, or throw.',
    relatedPositions: ['Standing', 'Closed Guard', 'Butterfly Guard']
  },
  {
    id: 'fundamentals-angle-creation',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Angle Creation',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'movement', 'offense'],
    description: 'Moving off-center so attacks and escapes happen on stronger lines instead of straight into resistance.',
    relatedPositions: ['Closed Guard', 'Mount', 'Back Control']
  },
  {
    id: 'fundamentals-position-before-submission',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Position Before Submission',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'strategy', 'control'],
    description: 'Stabilizing control first so the finish becomes easier to hold and harder to escape.',
    relatedPositions: ['Mount', 'Back Control', 'Side Control']
  },
  {
    id: 'fundamentals-head-position',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Head Position',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'alignment', 'control'],
    description: 'Using head placement to strengthen posture, redirect pressure, and win key control exchanges.',
    relatedPositions: ['Standing', 'Front Headlock', 'Passing']
  },
  {
    id: 'fundamentals-pressure',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Pressure',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'control', 'top game'],
    description: 'Applying bodyweight with intention so movement becomes harder for the opponent and easier for you to guide.',
    relatedPositions: ['Side Control', 'Half Guard Top', 'Mount']
  },
  {
    id: 'fundamentals-distance-management',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Distance Management',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'distance', 'timing'],
    description: 'Controlling how close or far the exchange is so your tools stay effective and theirs are harder to use cleanly.',
    relatedPositions: ['Standing', 'Open Guard', 'Seated Guard']
  },
  {
    id: 'fundamentals-grip-fighting',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Grip Fighting',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'grips', 'control'],
    description: 'Winning the early hand and grip battle so the rest of the exchange starts on better terms.',
    relatedPositions: ['Standing', 'Closed Guard', 'Open Guard']
  },
  {
    id: 'fundamentals-balance',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Balance',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'base', 'movement'],
    description: 'Keeping your weight organized so you stay stable while moving, defending, or applying pressure.',
    relatedPositions: ['Standing', 'Passing', 'Mount']
  },
  {
    id: 'fundamentals-connection',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Connection',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'control', 'pressure'],
    description: 'Staying linked to the opponent in a way that lets you transfer pressure and feel movement more clearly.',
    relatedPositions: ['Guard Passing', 'Back Control', 'Half Guard']
  },
  {
    id: 'fundamentals-weight-distribution',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Weight Distribution',
    skillLevel: 'Intermediate',
    tags: ['fundamental', 'pressure', 'base'],
    description: 'Placing your weight deliberately so one point becomes heavier while the rest of the body stays mobile.',
    relatedPositions: ['Side Control', 'Mount', 'Passing']
  },
  {
    id: 'fundamentals-posture-maintenance',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Maintaining Posture',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'posture', 'alignment'],
    description: 'Holding your structural alignment through movement, pressure, and grip exchanges so attacks stay harder to break down.',
    relatedPositions: ['Standing', 'Closed Guard Top', 'Mount']
  },
  {
    id: 'fundamentals-breaking-posture',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Breaking Posture',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'offense', 'control'],
    description: 'Disrupting the spine and shoulder line so sweeps, submissions, and transitions become easier to connect.',
    relatedPositions: ['Closed Guard', 'Open Guard', 'Front Headlock']
  },
  {
    id: 'fundamentals-leverage',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Leverage',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'efficiency', 'mechanics'],
    description: 'Using body mechanics, angles, and structure to create stronger outcomes without relying on raw strength.',
    relatedPositions: ['Standing', 'Guard Passing', 'Submissions']
  },
  {
    id: 'fundamentals-alignment',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Alignment',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'structure', 'control'],
    description: 'Keeping your skeleton and pressure lines organized so movement, stability, and finishing power all work together.',
    relatedPositions: ['Standing', 'Mount', 'Side Control']
  },
  {
    id: 'fundamentals-structure',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Structure',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'frames', 'base'],
    description: 'Building strong supportive shapes with the body so you can resist force and direct movement more cleanly.',
    relatedPositions: ['Standing', 'Guard Retention', 'Mount Defense']
  },
  {
    id: 'fundamentals-wedges',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Wedges',
    skillLevel: 'Intermediate',
    tags: ['fundamental', 'control', 'pressure'],
    description: 'Using body parts as wedges to create separation, trap space, or reinforce tighter control without overexerting.',
    relatedPositions: ['Side Control', 'Mount', 'Guard Passing']
  },
  {
    id: 'fundamentals-hip-positioning',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Hip Positioning',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'hips', 'control'],
    description: 'Placing the hips effectively so your weight, mobility, and angle all support the exchange instead of fighting each other.',
    relatedPositions: ['Half Guard', 'Guard Passing', 'Mount']
  },
  {
    id: 'fundamentals-inside-position',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Inside Position',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'inside space', 'control'],
    description: 'Winning the inside lane with your arms, knees, or hooks so you gain stronger leverage and deny cleaner attacks.',
    relatedPositions: ['Standing', 'Half Guard', 'Guard Retention']
  },
  {
    id: 'fundamentals-outside-position',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Outside Position',
    skillLevel: 'Intermediate',
    tags: ['fundamental', 'outside angle', 'mobility'],
    description: 'Recognizing when outside positioning creates safer passing angles, back exposures, or mobility advantages.',
    relatedPositions: ['Open Guard', 'Guard Passing', 'Back Takes']
  },
  {
    id: 'fundamentals-timing',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Timing',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'timing', 'movement'],
    description: 'Applying the right movement at the right moment so the technique meets a weaker structure instead of forcing through resistance.',
    relatedPositions: ['Standing', 'Sweeps', 'Escapes']
  },
  {
    id: 'fundamentals-sensitivity',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Sensitivity',
    skillLevel: 'Intermediate',
    tags: ['fundamental', 'connection', 'feel'],
    description: 'Feeling small changes in pressure and posture so you can react earlier and choose stronger follow-up options.',
    relatedPositions: ['Half Guard', 'Butterfly Guard', 'Passing']
  },
  {
    id: 'fundamentals-space-creation',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Space Creation',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'defense', 'frames'],
    description: 'Making just enough space to move, frame, or recover without losing the structure needed for the next action.',
    relatedPositions: ['Mount Defense', 'Side Control Defense', 'Guard Retention']
  },
  {
    id: 'fundamentals-space-denial',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Space Denial',
    skillLevel: 'Intermediate',
    tags: ['fundamental', 'pressure', 'control'],
    description: 'Removing the room the opponent needs to recover posture, insert frames, or turn into stronger positions.',
    relatedPositions: ['Mount', 'Side Control', 'Guard Passing']
  },
  {
    id: 'fundamentals-mobility',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Mobility',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'movement', 'adaptability'],
    description: 'Staying mobile enough to change angles and recover structure without sacrificing balance or control.',
    relatedPositions: ['Standing', 'Open Guard', 'Scrambles']
  },
  {
    id: 'fundamentals-pinning',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Pinning',
    skillLevel: 'Intermediate',
    tags: ['fundamental', 'pinning', 'control'],
    description: 'Securing body lines so the opponent carries your pressure and loses the ability to build meaningful movement.',
    relatedPositions: ['Side Control', 'Mount', 'Back Control']
  },
  {
    id: 'fundamentals-transition-awareness',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Transition Awareness',
    skillLevel: 'Intermediate',
    tags: ['fundamental', 'transitions', 'awareness'],
    description: 'Staying aware of the moment between positions so you can stabilize first or attack before the next frame arrives.',
    relatedPositions: ['Guard Passing', 'Scrambles', 'Back Takes']
  },
  {
    id: 'fundamentals-anticipation',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Anticipation',
    skillLevel: 'Intermediate',
    tags: ['fundamental', 'timing', 'awareness'],
    description: 'Reading likely reactions early enough to position your body before the opponent completes the next movement.',
    relatedPositions: ['Passing', 'Back Control', 'Standing']
  },
  {
    id: 'fundamentals-posting',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Posting',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'base', 'defense'],
    description: 'Using hands, feet, and body lines to catch balance and prevent clean sweeps or turnovers.',
    relatedPositions: ['Standing', 'Butterfly Guard Top', 'Mount']
  },
  {
    id: 'fundamentals-retention',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Retention',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'retention', 'defense'],
    description: 'Preserving useful structure and connection long enough to avoid conceding position or to recover stronger layers of defense.',
    relatedPositions: ['Guard Retention', 'Turtle', 'Half Guard']
  },
  {
    id: 'fundamentals-breathing',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Breathing',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'composure', 'efficiency'],
    description: 'Managing breathing so posture, decision-making, and energy output stay steadier under pressure.',
    relatedPositions: ['Scrambles', 'Mount Defense', 'Passing']
  },
  {
    id: 'fundamentals-relaxation-under-stress',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Relaxation Under Stress',
    skillLevel: 'Intermediate',
    tags: ['fundamental', 'composure', 'efficiency'],
    description: 'Staying calm enough to feel the exchange clearly instead of wasting movement and timing through panic or tension.',
    relatedPositions: ['Submission Defense', 'Mount Defense', 'Scrambles']
  },
  {
    id: 'fundamentals-patience',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Patience',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'decision making', 'strategy'],
    description: 'Allowing control, timing, and reactions to develop before forcing a movement that is not ready yet.',
    relatedPositions: ['Passing', 'Mount', 'Back Control']
  },
  {
    id: 'fundamentals-control-before-movement',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Control Before Movement',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'control', 'strategy'],
    description: 'Establishing enough control before advancing so your movement creates progress instead of opening space for escapes.',
    relatedPositions: ['Guard Passing', 'Mount', 'Back Control']
  },
  {
    id: 'fundamentals-top-pressure',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Top Pressure',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'pressure', 'top game'],
    description: 'Using your weight from top positions in a way that limits movement while keeping your own balance and mobility intact.',
    relatedPositions: ['Side Control', 'Mount', 'Half Guard Top']
  },
  {
    id: 'fundamentals-bottom-connection',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Bottom Connection',
    skillLevel: 'Intermediate',
    tags: ['fundamental', 'guard', 'connection'],
    description: 'Staying meaningfully connected from bottom positions so you can off-balance, recover, or come up instead of becoming disconnected and pinned.',
    relatedPositions: ['Closed Guard', 'Open Guard', 'Half Guard']
  },
  {
    id: 'fundamentals-defensive-responsibility',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Defensive Responsibility',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'defense', 'awareness'],
    description: 'Keeping essential defensive tasks in place while attacking so you do not expose easy counters or positional losses.',
    relatedPositions: ['Standing', 'Open Guard', 'Submissions']
  },
  {
    id: 'fundamentals-isolating-limbs',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Isolating Limbs',
    skillLevel: 'Intermediate',
    tags: ['fundamental', 'control', 'submissions'],
    description: 'Separating an arm or leg from the rest of the body so it becomes easier to attack, pin, or redirect.',
    relatedPositions: ['Mount', 'Side Control', 'Back Control']
  },
  {
    id: 'fundamentals-neck-safety',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Neck Safety',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'safety', 'defense'],
    description: 'Protecting the neck through posture, hand positioning, and movement choices so scrambles and submissions stay safer.',
    relatedPositions: ['Turtle', 'Front Headlock', 'Back Control Defense']
  },
  {
    id: 'fundamentals-hand-positioning-discipline',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Hand Positioning Discipline',
    skillLevel: 'Intermediate',
    tags: ['fundamental', 'grips', 'defense'],
    description: 'Keeping the hands in purposeful positions so they support control and defense instead of becoming easy targets.',
    relatedPositions: ['Standing', 'Passing', 'Submission Defense']
  },
  {
    id: 'fundamentals-chain-attacks',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Chain Attacks',
    skillLevel: 'Intermediate',
    tags: ['fundamental', 'offense', 'sequences'],
    description: 'Linking attacks together so each defensive reaction becomes the start of the next threat.',
    relatedPositions: ['Closed Guard', 'Mount', 'Back Control']
  },
  {
    id: 'fundamentals-chain-escapes',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Chain Escapes',
    skillLevel: 'Intermediate',
    tags: ['fundamental', 'defense', 'sequences'],
    description: 'Connecting escape layers so one failed movement naturally leads into another instead of leaving you stalled underneath.',
    relatedPositions: ['Mount Defense', 'Side Control Defense', 'Back Control Defense']
  },
  {
    id: 'fundamentals-re-guarding',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Re-Guarding',
    skillLevel: 'Beginner',
    tags: ['fundamental', 'guard recovery', 'defense'],
    description: 'Recovering a workable guard layer before the top player fully settles into a dominant pin or passing sequence.',
    relatedPositions: ['Half Guard', 'Open Guard', 'Side Control Defense']
  },
  {
    id: 'fundamentals-incremental-advancement',
    category: 'Fundamentals',
    subcategory: null,
    name: 'Incremental Advancement',
    skillLevel: 'Intermediate',
    tags: ['fundamental', 'control', 'progression'],
    description: 'Improving position in smaller reliable steps so control becomes stronger before the next movement is attempted.',
    relatedPositions: ['Passing', 'Mount', 'Back Control']
  },
  {
    id: 'concepts-position-over-submission',
    category: 'Concepts',
    subcategory: null,
    name: 'Position Over Submission',
    skillLevel: 'Beginner',
    tags: ['concept', 'control', 'strategy'],
    description: 'A reminder to secure control before rushing to finish so the attack becomes easier to maintain.',
    relatedPositions: []
  },
  {
    id: 'concepts-fight-for-inside-space',
    category: 'Concepts',
    subcategory: null,
    name: 'Fight For Inside Space',
    skillLevel: 'Beginner',
    tags: ['concept', 'inside position', 'control'],
    description: 'Prioritize winning inside space so your frames, grips, and posture have a stronger foundation.',
    relatedPositions: ['Standing', 'Guard Retention', 'Half Guard']
  },
  {
    id: 'concepts-pin-hips-before-passing',
    category: 'Concepts',
    subcategory: null,
    name: 'Pin Hips Before Passing',
    skillLevel: 'Intermediate',
    tags: ['concept', 'passing', 'pinning'],
    description: 'A passing principle that emphasizes controlling hip movement before trying to clear the legs.',
    relatedPositions: ['Headquarters', 'Half Guard Top', 'Side Control']
  },
  {
    id: 'concepts-attack-in-combinations',
    category: 'Concepts',
    subcategory: null,
    name: 'Attack In Combinations',
    skillLevel: 'Intermediate',
    tags: ['concept', 'chain attacks', 'strategy'],
    description: 'Build sequences of attacks so one defense naturally opens the next opportunity.',
    relatedPositions: ['Closed Guard', 'Mount', 'Back Control']
  },
  {
    id: 'concepts-control-leads-to-submissions',
    category: 'Concepts',
    subcategory: null,
    name: 'Control Leads To Submissions',
    skillLevel: 'Beginner',
    tags: ['concept', 'control', 'strategy'],
    description: 'The cleaner the control becomes, the less force and adjustment the finish usually requires.',
    relatedPositions: ['Mount', 'Back Control', 'Side Control']
  },
  {
    id: 'concepts-win-head-position',
    category: 'Concepts',
    subcategory: null,
    name: 'Win Head Position',
    skillLevel: 'Beginner',
    tags: ['concept', 'head position', 'standing'],
    description: 'Winning the head line early often improves posture, inside space, and the quality of the next grip or entry.',
    relatedPositions: ['Standing', 'Clinch', 'Front Headlock']
  },
  {
    id: 'concepts-break-alignment',
    category: 'Concepts',
    subcategory: null,
    name: 'Break Alignment',
    skillLevel: 'Intermediate',
    tags: ['concept', 'off-balance', 'control'],
    description: 'Disrupt the spine, shoulders, or hips before forcing a movement so the exchange becomes easier to steer.',
    relatedPositions: ['Standing', 'Closed Guard', 'Butterfly Guard']
  },
  {
    id: 'concepts-remove-posts-before-sweeping',
    category: 'Concepts',
    subcategory: null,
    name: 'Remove Posts Before Sweeping',
    skillLevel: 'Beginner',
    tags: ['concept', 'sweeps', 'off-balance'],
    description: 'Clear or redirect the post first so the sweep attacks a structure that can no longer catch itself.',
    relatedPositions: ['Butterfly Guard', 'Closed Guard', 'Open Guard']
  },
  {
    id: 'concepts-pin-shoulders-before-isolating-arms',
    category: 'Concepts',
    subcategory: null,
    name: 'Pin Shoulders Before Isolating Arms',
    skillLevel: 'Intermediate',
    tags: ['concept', 'pinning', 'submissions'],
    description: 'Control the upper body first so arm isolation happens against a weaker and less mobile frame.',
    relatedPositions: ['Side Control', 'Mount', 'Back Control']
  },
  {
    id: 'concepts-threaten-two-things-at-once',
    category: 'Concepts',
    subcategory: null,
    name: 'Threaten Two Things At Once',
    skillLevel: 'Intermediate',
    tags: ['concept', 'dilemma', 'offense'],
    description: 'Create two meaningful threats at the same time so the defense is forced to make a choice you can punish.',
    relatedPositions: ['Closed Guard', 'Mount', 'Back Control']
  },
  {
    id: 'concepts-force-predictable-reactions',
    category: 'Concepts',
    subcategory: null,
    name: 'Force Predictable Reactions',
    skillLevel: 'Intermediate',
    tags: ['concept', 'strategy', 'timing'],
    description: 'Use pressure, grips, and angles to make the likely defensive response easier to read and prepare for.',
    relatedPositions: ['Passing', 'Standing', 'Half Guard']
  },
  {
    id: 'concepts-use-wedges-not-strength',
    category: 'Concepts',
    subcategory: null,
    name: 'Use Wedges, Not Strength',
    skillLevel: 'Beginner',
    tags: ['concept', 'efficiency', 'pressure'],
    description: 'Let structure and wedges do the work so the technique stays efficient and repeatable under resistance.',
    relatedPositions: ['Passing', 'Side Control', 'Mount']
  },
  {
    id: 'concepts-keep-elbows-in',
    category: 'Concepts',
    subcategory: null,
    name: 'Keep Elbows In',
    skillLevel: 'Beginner',
    tags: ['concept', 'defense', 'structure'],
    description: 'Keeping the elbows tight protects inside space and removes easy openings for passes, pins, and submissions.',
    relatedPositions: ['Guard Retention', 'Mount Defense', 'Standing']
  },
  {
    id: 'concepts-separate-knees-from-elbows',
    category: 'Concepts',
    subcategory: null,
    name: 'Separate Knees From Elbows',
    skillLevel: 'Intermediate',
    tags: ['concept', 'passing', 'defense breaking'],
    description: 'Passing and pinning improve dramatically once the defensive elbow-knee connection is split apart.',
    relatedPositions: ['Passing', 'Half Guard Top', 'Mount']
  },
  {
    id: 'concepts-climb-to-stronger-control',
    category: 'Concepts',
    subcategory: null,
    name: 'Climb To Stronger Control',
    skillLevel: 'Intermediate',
    tags: ['concept', 'progression', 'control'],
    description: 'Use each positional win to move toward a stronger layer of control before looking for the next attack.',
    relatedPositions: ['Passing', 'Mount', 'Back Control']
  },
  {
    id: 'concepts-off-balance-before-attacking',
    category: 'Concepts',
    subcategory: null,
    name: 'Off-Balance Before Attacking',
    skillLevel: 'Beginner',
    tags: ['concept', 'timing', 'off-balance'],
    description: 'Attacks become cleaner when they start against a weakened base instead of a fully settled one.',
    relatedPositions: ['Standing', 'Butterfly Guard', 'Closed Guard']
  },
  {
    id: 'concepts-attack-the-far-side',
    category: 'Concepts',
    subcategory: null,
    name: 'Attack The Far Side',
    skillLevel: 'Intermediate',
    tags: ['concept', 'angles', 'offense'],
    description: 'The far side is often harder to defend because posture and turning mechanics have to travel farther to recover.',
    relatedPositions: ['Passing', 'Mount', 'Back Takes']
  },
  {
    id: 'concepts-hide-vulnerable-limbs',
    category: 'Concepts',
    subcategory: null,
    name: 'Hide Vulnerable Limbs',
    skillLevel: 'Beginner',
    tags: ['concept', 'defense', 'limb safety'],
    description: 'Keep limbs from drifting into exposed lines where they can be isolated, pinned, or attacked easily.',
    relatedPositions: ['Standing', 'Guard Retention', 'Back Control Defense']
  },
  {
    id: 'concepts-turn-defense-into-offense',
    category: 'Concepts',
    subcategory: null,
    name: 'Turn Defense Into Offense',
    skillLevel: 'Intermediate',
    tags: ['concept', 'transitions', 'counterattacks'],
    description: 'Use defensive reactions to create entries into sweeps, reversals, stand-ups, or submissions instead of stopping at survival.',
    relatedPositions: ['Half Guard', 'Turtle', 'Submission Defense']
  },
  {
    id: 'concepts-connection-beats-explosion',
    category: 'Concepts',
    subcategory: null,
    name: 'Connection Beats Explosion',
    skillLevel: 'Intermediate',
    tags: ['concept', 'control', 'efficiency'],
    description: 'Consistent connection usually creates more reliable movement and pressure than short bursts of force.',
    relatedPositions: ['Passing', 'Back Control', 'Half Guard']
  },
  {
    id: 'concepts-pressure-creates-mistakes',
    category: 'Concepts',
    subcategory: null,
    name: 'Pressure Creates Mistakes',
    skillLevel: 'Beginner',
    tags: ['concept', 'pressure', 'strategy'],
    description: 'Sustained pressure often forces rushed reactions, weaker frames, and easier openings to attack.',
    relatedPositions: ['Side Control', 'Mount', 'Passing']
  },
  {
    id: 'concepts-movement-creates-openings',
    category: 'Concepts',
    subcategory: null,
    name: 'Movement Creates Openings',
    skillLevel: 'Beginner',
    tags: ['concept', 'movement', 'strategy'],
    description: 'Sometimes the opening is produced by movement itself, not by waiting for a static mistake to appear.',
    relatedPositions: ['Open Guard', 'Standing', 'Scrambles']
  },
  {
    id: 'concepts-make-frames-useless',
    category: 'Concepts',
    subcategory: null,
    name: 'Make Frames Useless',
    skillLevel: 'Intermediate',
    tags: ['concept', 'passing', 'pressure'],
    description: 'Redirect or collapse frames so they stop doing real work before you try to progress past them.',
    relatedPositions: ['Passing', 'Side Control', 'Mount']
  },
  {
    id: 'concepts-clear-grips-before-advancing',
    category: 'Concepts',
    subcategory: null,
    name: 'Clear Grips Before Advancing',
    skillLevel: 'Beginner',
    tags: ['concept', 'grip fighting', 'passing'],
    description: 'Removing the strongest grips first makes the next movement cleaner and reduces the chance of getting stalled.',
    relatedPositions: ['Standing', 'Passing', 'Open Guard']
  },
  {
    id: 'concepts-control-the-line-of-the-spine',
    category: 'Concepts',
    subcategory: null,
    name: 'Control The Line Of The Spine',
    skillLevel: 'Advanced',
    tags: ['concept', 'alignment', 'control'],
    description: 'When the spine is controlled, posture, turning, and defensive recovery all become weaker and slower.',
    relatedPositions: ['Back Control', 'Mount', 'Passing']
  },
  {
    id: 'concepts-beat-the-legs-before-the-torso',
    category: 'Concepts',
    subcategory: null,
    name: 'Beat The Legs Before The Torso',
    skillLevel: 'Intermediate',
    tags: ['concept', 'passing', 'sequence'],
    description: 'In many passing exchanges, clearing the legs first makes torso control easier and more sustainable.',
    relatedPositions: ['Passing', 'Open Guard']
  },
  {
    id: 'concepts-beat-the-hips-before-the-head',
    category: 'Concepts',
    subcategory: null,
    name: 'Beat The Hips Before The Head',
    skillLevel: 'Intermediate',
    tags: ['concept', 'passing', 'control'],
    description: 'Hip control usually matters first because it limits the larger turning and retention movements that keep the guard alive.',
    relatedPositions: ['Passing', 'Half Guard Top', 'Headquarters']
  },
  {
    id: 'concepts-hand-fight-early',
    category: 'Concepts',
    subcategory: null,
    name: 'Hand Fight Early',
    skillLevel: 'Beginner',
    tags: ['concept', 'grip fighting', 'standing'],
    description: 'Dealing with ties and grips early prevents the opponent from settling into stronger control layers.',
    relatedPositions: ['Standing', 'Front Headlock', 'Turtle']
  },
  {
    id: 'concepts-grip-with-purpose',
    category: 'Concepts',
    subcategory: null,
    name: 'Grip With Purpose',
    skillLevel: 'Beginner',
    tags: ['concept', 'grips', 'efficiency'],
    description: 'Every grip should support a clear goal such as posture control, off-balancing, pinning, or the next attack.',
    relatedPositions: ['Standing', 'Closed Guard', 'Passing']
  },
  {
    id: 'concepts-do-not-chase-funnel',
    category: 'Concepts',
    subcategory: null,
    name: 'Do Not Chase, Funnel',
    skillLevel: 'Advanced',
    tags: ['concept', 'strategy', 'pressure'],
    description: 'Rather than chasing every movement, direct the exchange into narrower pathways where your next control is stronger.',
    relatedPositions: ['Passing', 'Back Takes', 'Standing']
  },
  {
    id: 'concepts-trap-then-attack',
    category: 'Concepts',
    subcategory: null,
    name: 'Trap Then Attack',
    skillLevel: 'Intermediate',
    tags: ['concept', 'control', 'offense'],
    description: 'Secure enough trapping control first so the attack begins against a line that cannot easily retract or frame.',
    relatedPositions: ['Mount', 'Back Control', 'Side Control']
  },
  {
    id: 'concepts-occupy-the-space-they-need',
    category: 'Concepts',
    subcategory: null,
    name: 'Occupy The Space They Need',
    skillLevel: 'Advanced',
    tags: ['concept', 'space denial', 'control'],
    description: 'Take the space the opponent would need to recover guard, posture, or base before they can reclaim it.',
    relatedPositions: ['Passing', 'Mount', 'Back Control']
  },
  {
    id: 'concepts-force-weight-onto-one-post',
    category: 'Concepts',
    subcategory: null,
    name: 'Force Weight Onto One Post',
    skillLevel: 'Intermediate',
    tags: ['concept', 'off-balance', 'sweeps'],
    description: 'Concentrating the opponent onto one post makes sweeps and secondary attacks much easier to finish.',
    relatedPositions: ['Butterfly Guard', 'Closed Guard', 'Standing']
  },
  {
    id: 'concepts-collapse-one-side',
    category: 'Concepts',
    subcategory: null,
    name: 'Collapse One Side',
    skillLevel: 'Intermediate',
    tags: ['concept', 'off-balance', 'control'],
    description: 'Breaking one side of the structure often creates enough imbalance to expose the next layer of attack or control.',
    relatedPositions: ['Standing', 'Passing', 'Butterfly Guard']
  },
  {
    id: 'concepts-use-misdirection',
    category: 'Concepts',
    subcategory: null,
    name: 'Use Misdirection',
    skillLevel: 'Intermediate',
    tags: ['concept', 'timing', 'strategy'],
    description: 'Threatening one pathway to open another can create cleaner entries than forcing the obvious line directly.',
    relatedPositions: ['Standing', 'Closed Guard', 'Back Takes']
  },
  {
    id: 'concepts-attack-transitions',
    category: 'Concepts',
    subcategory: null,
    name: 'Attack Transitions',
    skillLevel: 'Intermediate',
    tags: ['concept', 'transitions', 'timing'],
    description: 'The moment between positions is often the best time to attack because posture and frames are not fully rebuilt yet.',
    relatedPositions: ['Passing', 'Scrambles', 'Back Takes']
  },
  {
    id: 'movements-shrimp',
    category: 'Movements',
    subcategory: null,
    name: 'Shrimp',
    skillLevel: 'Beginner',
    tags: ['movement', 'escape', 'fundamental'],
    description: 'A foundational hip-escape movement used to recover space and rebuild guard.',
    relatedPositions: ['Side Control Defense', 'Mount Defense']
  },
  {
    id: 'movements-technical-stand-up',
    category: 'Movements',
    subcategory: null,
    name: 'Technical Stand-Up',
    skillLevel: 'Beginner',
    tags: ['movement', 'self-defense', 'fundamental'],
    description: 'A safe way to stand back up while staying ready to defend distance and protect posture.',
    relatedPositions: ['Standing']
  },
  {
    id: 'movements-bridge',
    category: 'Movements',
    subcategory: null,
    name: 'Bridge',
    skillLevel: 'Beginner',
    tags: ['movement', 'escape', 'fundamental'],
    description: 'A core movement for generating elevation, disrupting balance, and creating escape reactions.',
    relatedPositions: ['Mount Defense', 'Side Control Defense']
  },
  {
    id: 'movements-hip-heist',
    category: 'Movements',
    subcategory: null,
    name: 'Hip Heist',
    skillLevel: 'Beginner',
    tags: ['movement', 'wrestle-up', 'scramble'],
    description: 'A fast rotational movement used to turn the hips through, recover base, or come up on a single.',
    relatedPositions: ['Seated Guard', 'Turtle', 'Standing']
  },
  {
    id: 'movements-granby-roll',
    category: 'Movements',
    subcategory: null,
    name: 'Granby Roll',
    skillLevel: 'Intermediate',
    tags: ['movement', 'inversion', 'scramble'],
    description: 'A rolling inversion used to recover guard, create angles, or avoid giving up clean control.',
    relatedPositions: ['Turtle', 'Guard Retention']
  },
  {
    id: 'movements-sprawl',
    category: 'Movements',
    subcategory: null,
    name: 'Sprawl',
    skillLevel: 'Beginner',
    tags: ['movement', 'takedown defense', 'base'],
    description: 'A defensive reaction that throws the hips back to shut down penetration and regain head control.',
    relatedPositions: ['Standing', 'Front Headlock']
  },
  {
    id: 'movements-inversion',
    category: 'Movements',
    subcategory: null,
    name: 'Inversion',
    skillLevel: 'Advanced',
    tags: ['movement', 'guard retention', 'back takes'],
    description: 'Rotating through the shoulders and hips to create recovery angles, entanglements, or back exposure.',
    relatedPositions: ['Open Guard', 'De La Riva', 'Turtle']
  },
  {
    id: 'movements-shot-recovery',
    category: 'Movements',
    subcategory: null,
    name: 'Shot Recovery',
    skillLevel: 'Intermediate',
    tags: ['movement', 'wrestling', 'recovery'],
    description: 'Recovering cleanly from a defended shot so you can continue attacking instead of conceding position.',
    relatedPositions: ['Standing', 'Front Headlock']
  },
  {
    id: 'movements-bear-crawl',
    category: 'Movements',
    subcategory: null,
    name: 'Bear Crawl',
    skillLevel: 'Beginner',
    tags: ['movement', 'base', 'conditioning'],
    description: 'A foundational movement for coordination, pressure transfer, and stronger base awareness through the hands and feet.',
    relatedPositions: ['Standing', 'Turtle']
  },
  {
    id: 'movements-shoulder-roll',
    category: 'Movements',
    subcategory: null,
    name: 'Shoulder Roll',
    skillLevel: 'Beginner',
    tags: ['movement', 'mobility', 'safety'],
    description: 'A rolling movement that helps with safe redirection of force, recovery, and fluid transitions through scrambles.',
    relatedPositions: ['Standing', 'Turtle']
  },
  {
    id: 'movements-reverse-shrimp',
    category: 'Movements',
    subcategory: null,
    name: 'Reverse Shrimp',
    skillLevel: 'Beginner',
    tags: ['movement', 'guard retention', 'mobility'],
    description: 'A reverse hip movement used to recover angle and chase space when the line of defense shifts.',
    relatedPositions: ['Guard Retention', 'Open Guard']
  },
  {
    id: 'movements-sit-out',
    category: 'Movements',
    subcategory: null,
    name: 'Sit-Out',
    skillLevel: 'Beginner',
    tags: ['movement', 'wrestling', 'escape'],
    description: 'A rotational movement used to free the hips, build angle, and escape from front headlock or turtle pressure.',
    relatedPositions: ['Turtle', 'Front Headlock']
  },
  {
    id: 'positions-closed-guard',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Closed Guard',
    skillLevel: 'Beginner',
    tags: ['position', 'guard', 'bottom'],
    description: 'A core guard position built on connection, posture control, and off-balancing opportunities.',
    relatedPositions: ['Mount', 'Open Guard']
  },
  {
    id: 'positions-standing',
    category: 'Positions',
    subcategory: 'Standing',
    name: 'Standing',
    skillLevel: 'Beginner',
    tags: ['position', 'standing', 'base'],
    description: 'The broad standing engagement space where stance, posture, head position, and grips decide what opens next.',
    relatedPositions: ['Clinch', 'Front Headlock Standing', 'Collar-Sleeve Standing']
  },
  {
    id: 'positions-wrestling-stance',
    category: 'Strategy and Game Planning',
    subcategory: 'Standing Stance And Posture',
    name: 'Wrestling Stance',
    skillLevel: 'Beginner',
    tags: ['strategy', 'standing', 'wrestling'],
    description: 'A lower, mobile stance built for level changes, shots, sprawls, and fast angle adjustments.',
    relatedPositions: ['Standing', 'Front Headlock Standing', 'Double Leg']
  },
  {
    id: 'positions-judo-stance',
    category: 'Strategy and Game Planning',
    subcategory: 'Standing Stance And Posture',
    name: 'Judo Stance',
    skillLevel: 'Beginner',
    tags: ['strategy', 'standing', 'judo'],
    description: 'A more upright standing posture built around kuzushi, grip control, and throw entries.',
    relatedPositions: ['Standing', 'Collar-Sleeve Standing', 'O Soto Gari']
  },
  {
    id: 'positions-collar-sleeve-standing',
    category: 'Positions',
    subcategory: 'Standing',
    name: 'Collar-Sleeve Standing',
    skillLevel: 'Intermediate',
    tags: ['position', 'standing', 'grips'],
    description: 'A classic gi standing control structure that creates off-balancing, guard pulls, and throw entries.',
    relatedPositions: ['Judo Stance', 'Standing']
  },
  {
    id: 'positions-two-on-one-standing',
    category: 'Positions',
    subcategory: 'Standing',
    name: 'Two-On-One Standing',
    skillLevel: 'Intermediate',
    tags: ['position', 'standing', 'control'],
    description: 'A standing arm-control position that limits posture and opens drags, snaps, and back-take routes.',
    relatedPositions: ['Standing', 'Russian Tie Standing']
  },
  {
    id: 'positions-body-lock-standing',
    category: 'Positions',
    subcategory: 'Standing',
    name: 'Body Lock Standing',
    skillLevel: 'Intermediate',
    tags: ['position', 'standing', 'clinch'],
    description: 'A tight torso connection that turns close-range control into takedowns, trips, and mat returns.',
    relatedPositions: ['Clinch', 'Over-Under Clinch']
  },
  {
    id: 'positions-front-headlock-standing',
    category: 'Positions',
    subcategory: 'Standing',
    name: 'Front Headlock Standing',
    skillLevel: 'Intermediate',
    tags: ['position', 'standing', 'front headlock'],
    description: 'A standing head-and-arm control that threatens snaps, go-behinds, and direct transitions to the mat.',
    relatedPositions: ['Standing', 'Front Headlock']
  },
  {
    id: 'positions-russian-tie-standing',
    category: 'Positions',
    subcategory: 'Standing',
    name: 'Russian Tie Standing',
    skillLevel: 'Intermediate',
    tags: ['position', 'standing', 'arm control'],
    description: 'A strong two-on-one standing position that opens level changes, drags, and back exposure.',
    relatedPositions: ['Two-On-One Standing', 'Standing']
  },
  {
    id: 'positions-clinch',
    category: 'Positions',
    subcategory: 'Standing',
    name: 'Clinch',
    skillLevel: 'Beginner',
    tags: ['position', 'standing', 'close range'],
    description: 'A close-range standing exchange where posture, head position, and inside control start deciding the outcome.',
    relatedPositions: ['Standing', 'Over-Under Clinch', 'Body Lock Standing']
  },
  {
    id: 'positions-over-under-clinch',
    category: 'Positions',
    subcategory: 'Standing',
    name: 'Over-Under Clinch',
    skillLevel: 'Intermediate',
    tags: ['position', 'standing', 'clinch'],
    description: 'A classic chest-to-chest clinch with one overhook and one underhook that creates trips, body locks, and transitions.',
    relatedPositions: ['Clinch', 'Body Lock Standing']
  },
  {
    id: 'positions-waiter-guard',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Waiter Guard',
    skillLevel: 'Intermediate',
    tags: ['position', 'guard', 'off-balance'],
    description: 'An underneath guard position that creates strong sweeping and wrestle-up opportunities from leg elevation.',
    relatedPositions: ['Half Guard', 'Single-Leg X', 'Deep Half Guard']
  },
  {
    id: 'positions-de-la-riva',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'De La Riva',
    skillLevel: 'Intermediate',
    tags: ['position', 'guard', 'outside hook'],
    description: 'An outside-hook guard that connects off-balancing, leg control, and inversion-based attacks.',
    relatedPositions: ['Open Guard', 'Reverse De La Riva']
  },
  {
    id: 'positions-single-leg-x',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Single-Leg X',
    skillLevel: 'Intermediate',
    tags: ['position', 'guard', 'ashi'],
    description: 'A leg-entanglement guard that creates wrestle-ups, sweeps, and direct access to lower-body attacks.',
    relatedPositions: ['X-Guard', 'Waiter Guard', 'Ashi Garami']
  },
  {
    id: 'positions-knee-shield-half-guard',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Knee Shield Half Guard',
    skillLevel: 'Beginner',
    tags: ['position', 'guard', 'frames'],
    description: 'A framing half guard variation that protects posture and builds safer underhook and upper-body entries.',
    relatedPositions: ['Half Guard']
  },
  {
    id: 'positions-headquarters',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Headquarters',
    skillLevel: 'Intermediate',
    tags: ['position', 'passing', 'control'],
    description: 'A central passing position that manages one leg at a time while preserving posture and forward pressure.',
    relatedPositions: ['Half Guard Top', 'Knee Cut']
  },
  {
    id: 'positions-turtle',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Turtle',
    skillLevel: 'Beginner',
    tags: ['position', 'defense', 'scramble'],
    description: 'A compact defensive position that can lead to recovery, stand-ups, front headlocks, or back exposure.',
    relatedPositions: ['Front Headlock', 'Back Control', 'Standing']
  },
  {
    id: 'positions-x-guard',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'X-Guard',
    skillLevel: 'Intermediate',
    tags: ['position', 'guard', 'elevation'],
    description: 'An underneath guard that controls the standing base and creates strong sweep and wrestle-up pathways.',
    relatedPositions: ['Single-Leg X', 'Waiter Guard']
  },
  {
    id: 'positions-seated-guard',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Seated Guard',
    skillLevel: 'Beginner',
    tags: ['position', 'guard', 'mobility'],
    description: 'A mobile guard posture that emphasizes distance, hand fighting, and quick transitions into wrestle-ups or entanglements.',
    relatedPositions: ['Open Guard', 'Butterfly Guard', 'Shin-To-Shin']
  },
  {
    id: 'positions-deep-half-guard',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Deep Half Guard',
    skillLevel: 'Intermediate',
    tags: ['position', 'guard', 'underneath'],
    description: 'An underneath half guard position that builds sweeps through elevation, off-balancing, and leg control.',
    relatedPositions: ['Half Guard', 'Waiter Guard']
  },
  {
    id: 'positions-reverse-de-la-riva',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Reverse De La Riva',
    skillLevel: 'Intermediate',
    tags: ['position', 'guard', 'inversion'],
    description: 'An outside-inside hook guard that creates spin-under sweeps, back takes, and transitional leg control.',
    relatedPositions: ['De La Riva', 'Waiter Guard', 'Berimbolo']
  },
  {
    id: 'positions-ashi-garami',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Ashi Garami',
    skillLevel: 'Intermediate',
    tags: ['position', 'leg entanglement', 'control'],
    description: 'A lower-body control position that stabilizes the leg line and opens direct entries into sweeps or submissions.',
    relatedPositions: ['Single-Leg X', 'Straight Ankle Lock']
  },
  {
    id: 'positions-knee-on-belly',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Knee On Belly',
    skillLevel: 'Beginner',
    tags: ['position', 'pinning', 'transition'],
    description: 'A mobile top pin that blends pressure, mobility, and easy transitions into stronger control or attacks.',
    relatedPositions: ['Side Control', 'Mount']
  },
  {
    id: 'positions-north-south',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'North-South',
    skillLevel: 'Intermediate',
    tags: ['position', 'pinning', 'control'],
    description: 'A controlling top position that changes shoulder pressure angles and opens chokes or transitions.',
    relatedPositions: ['Side Control', 'Knee On Belly']
  },
  {
    id: 'positions-open-guard',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Open Guard',
    skillLevel: 'Beginner',
    tags: ['position', 'guard', 'distance'],
    description: 'A broad family of guards that relies on distance control, hooks, frames, and angle creation.',
    relatedPositions: ['Closed Guard', 'Seated Guard', 'Butterfly Guard']
  },
  {
    id: 'positions-spider-guard',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Spider Guard',
    skillLevel: 'Intermediate',
    tags: ['position', 'guard', 'distance'],
    description: 'A sleeve-control guard that uses the feet on the arms to manage posture, distance, and off-balancing.',
    relatedPositions: ['Open Guard', 'Lasso Guard', 'Collar-Sleeve Guard']
  },
  {
    id: 'positions-lasso-guard',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Lasso Guard',
    skillLevel: 'Intermediate',
    tags: ['position', 'guard', 'control'],
    description: 'A sleeve-and-leg entanglement guard that slows pressure and creates strong sweeping and submission setups.',
    relatedPositions: ['Spider Guard', 'Collar-Sleeve Guard']
  },
  {
    id: 'positions-collar-sleeve-guard',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Collar-Sleeve Guard',
    skillLevel: 'Intermediate',
    tags: ['position', 'guard', 'grips'],
    description: 'A powerful grip-based guard that blends angle creation, off-balancing, and easy transitions into other guards.',
    relatedPositions: ['Spider Guard', 'Closed Guard', 'De La Riva']
  },
  {
    id: 'positions-half-guard',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Half Guard',
    skillLevel: 'Beginner',
    tags: ['position', 'guard', 'connection'],
    description: 'A highly strategic guard where underhooks, frames, and leg positioning decide whether you are safe or flattened.',
    relatedPositions: ['Knee Shield Half Guard', 'Deep Half Guard', 'Top Half Guard']
  },
  {
    id: 'positions-butterfly-guard',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Butterfly Guard',
    skillLevel: 'Beginner',
    tags: ['position', 'guard', 'elevation'],
    description: 'A seated open guard built around inside hooks, angle changes, and powerful elevation-based sweeps.',
    relatedPositions: ['Seated Guard', 'X-Guard']
  },
  {
    id: 'positions-shin-to-shin',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Shin-To-Shin',
    skillLevel: 'Intermediate',
    tags: ['position', 'guard', 'underneath'],
    description: 'An underneath seated guard position that creates easy transitions into wrestle-ups and leg entanglements.',
    relatedPositions: ['Seated Guard', 'Single-Leg X', 'Butterfly Guard']
  },
  {
    id: 'positions-z-guard',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Z-Guard',
    skillLevel: 'Intermediate',
    tags: ['position', 'guard', 'frames'],
    description: 'A framed half guard variation that uses knee and shin structure to manage pressure and create upper-body attacks.',
    relatedPositions: ['Knee Shield Half Guard', 'Half Guard']
  },
  {
    id: 'positions-lockdown',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Lockdown',
    skillLevel: 'Intermediate',
    tags: ['position', 'guard', 'half guard'],
    description: 'A half guard leg entanglement that limits mobility and creates elevation or stretching reactions from the top player.',
    relatedPositions: ['Half Guard', 'Deep Half Guard']
  },
  {
    id: 'positions-octopus-guard',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Octopus Guard',
    skillLevel: 'Advanced',
    tags: ['position', 'guard', 'underhook'],
    description: 'A side-underhook guard that creates wrestle-up angles, reversals, and back exposure from half guard situations.',
    relatedPositions: ['Half Guard', 'Coyote Guard']
  },
  {
    id: 'positions-k-guard',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'K-Guard',
    skillLevel: 'Advanced',
    tags: ['position', 'guard', 'leg entanglement'],
    description: 'A flexible guard structure that creates backside entries into leg entanglements, back takes, and spin-under attacks.',
    relatedPositions: ['Open Guard', '50/50', 'Single-Leg X']
  },
  {
    id: 'positions-50-50',
    category: 'Positions',
    subcategory: 'Ground',
    name: '50/50',
    skillLevel: 'Advanced',
    tags: ['position', 'guard', 'leg entanglement'],
    description: 'A mirrored leg-entanglement position that creates sweeps, heel hooks, ankle locks, and complex hand fighting.',
    relatedPositions: ['Ashi Garami', 'Saddle', 'K-Guard']
  },
  {
    id: 'positions-saddle',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Saddle',
    skillLevel: 'Advanced',
    tags: ['position', 'leg entanglement', 'control'],
    description: 'A strong inside leg-entanglement position that controls the knee line and opens powerful finishing options.',
    relatedPositions: ['50/50', 'Ashi Garami', 'Heel Hook']
  },
  {
    id: 'positions-side-control',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Side Control',
    skillLevel: 'Beginner',
    tags: ['position', 'pinning', 'top'],
    description: 'A major pinning position where shoulder pressure, hip control, and transitions create strong offense.',
    relatedPositions: ['Mount', 'North-South', 'Knee On Belly']
  },
  {
    id: 'positions-mount',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Mount',
    skillLevel: 'Beginner',
    tags: ['position', 'pinning', 'top'],
    description: 'A dominant top position that rewards posture control, balance, and disciplined progression to attacks.',
    relatedPositions: ['Technical Mount', 'S-Mount', 'Back Control']
  },
  {
    id: 'positions-technical-mount',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Technical Mount',
    skillLevel: 'Intermediate',
    tags: ['position', 'mount', 'control'],
    description: 'A mount variation that pins one side more aggressively and creates strong routes to the back or upper-body attacks.',
    relatedPositions: ['Mount', 'Back Control', 'S-Mount']
  },
  {
    id: 'positions-s-mount',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'S-Mount',
    skillLevel: 'Intermediate',
    tags: ['position', 'mount', 'arm isolation'],
    description: 'A high mount variation that isolates the upper body and sets up armbars, triangles, and tighter control.',
    relatedPositions: ['Mount', 'Technical Mount']
  },
  {
    id: 'positions-kesa-gatame',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Kesa Gatame',
    skillLevel: 'Intermediate',
    tags: ['position', 'pinning', 'side control'],
    description: 'A scarf-hold pin that controls the head and arm while creating heavy torso pressure and submission routes.',
    relatedPositions: ['Side Control', 'Reverse Kesa Gatame']
  },
  {
    id: 'positions-reverse-kesa-gatame',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Reverse Kesa Gatame',
    skillLevel: 'Intermediate',
    tags: ['position', 'pinning', 'side control'],
    description: 'A reverse scarf-hold variation that changes shoulder pressure and shifts attack opportunities across the upper body.',
    relatedPositions: ['Kesa Gatame', 'Side Control']
  },
  {
    id: 'positions-back-control',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Back Control',
    skillLevel: 'Beginner',
    tags: ['position', 'control', 'submission'],
    description: 'A dominant control position built around connection, hand fighting, and clean choking alignment.',
    relatedPositions: ['Technical Mount', 'Turtle']
  },
  {
    id: 'positions-front-headlock',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Front Headlock',
    skillLevel: 'Intermediate',
    tags: ['position', 'control', 'transition'],
    description: 'A controlling front-facing position that can create go-behinds, chokes, and turtle breakdowns.',
    relatedPositions: ['Standing', 'Turtle']
  },
  {
    id: 'positions-crucifix',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Crucifix',
    skillLevel: 'Advanced',
    tags: ['position', 'control', 'back takes'],
    description: 'A powerful upper-body trapping position that isolates an arm and creates strong choke and back-attack opportunities.',
    relatedPositions: ['Turtle', 'Back Control', 'Front Headlock']
  },
  {
    id: 'positions-top-half-guard',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Top Half Guard',
    skillLevel: 'Beginner',
    tags: ['position', 'top', 'passing'],
    description: 'A common top passing position where head control, underhooks, and hip pressure determine whether you pass or get recovered on.',
    relatedPositions: ['Half Guard', 'Headquarters', 'Side Control']
  },
  {
    id: 'positions-leg-drag-position',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Leg Drag Position',
    skillLevel: 'Intermediate',
    tags: ['position', 'passing', 'control'],
    description: 'A passing control position that drags the legs across center to weaken guard recovery and expose the back.',
    relatedPositions: ['Leg Drag', 'Side Control', 'Back Control']
  },
  {
    id: 'positions-stack-position',
    category: 'Positions',
    subcategory: 'Ground',
    name: 'Stack Position',
    skillLevel: 'Intermediate',
    tags: ['position', 'passing', 'pressure'],
    description: 'A compressed top position that folds the hips and makes guard retention much harder to sustain.',
    relatedPositions: ['Stack Pass Style', 'Double Under Pass']
  },
  {
    id: 'takedowns-double-leg',
    category: 'Takedowns',
    subcategory: 'Wrestling-Based',
    name: 'Double Leg',
    skillLevel: 'Beginner',
    tags: ['takedown', 'wrestling', 'entry'],
    description: 'A fundamental takedown built on level change, penetration, and finishing through the hips.',
    relatedPositions: ['Standing']
  },
  {
    id: 'takedowns-single-leg',
    category: 'Takedowns',
    subcategory: 'Wrestling-Based',
    name: 'Single Leg',
    skillLevel: 'Beginner',
    tags: ['takedown', 'wrestling', 'finish'],
    description: 'A reliable takedown that can finish through running the pipe, lifting, or transitioning to stronger controls.',
    relatedPositions: ['Standing']
  },
  {
    id: 'takedowns-high-crotch',
    category: 'Takedowns',
    subcategory: 'Wrestling-Based',
    name: 'High Crotch',
    skillLevel: 'Intermediate',
    tags: ['takedown', 'wrestling', 'leg attack'],
    description: 'A leg attack that penetrates deep between the stance and converts to lifts, turns, or double-leg finishes.',
    relatedPositions: ['Standing']
  },
  {
    id: 'takedowns-sweep-single',
    category: 'Takedowns',
    subcategory: 'Wrestling-Based',
    name: 'Sweep Single',
    skillLevel: 'Intermediate',
    tags: ['takedown', 'wrestling', 'single leg'],
    description: 'A single-leg finish that circles the leg across the body and forces the opponent to hop onto a weaker base.',
    relatedPositions: ['Standing']
  },
  {
    id: 'takedowns-ankle-pick',
    category: 'Takedowns',
    subcategory: 'Wrestling-Based',
    name: 'Ankle Pick',
    skillLevel: 'Intermediate',
    tags: ['takedown', 'wrestling', 'off-balance'],
    description: 'A timing-based takedown that combines posture disruption with a quick attack to the near ankle.',
    relatedPositions: ['Standing']
  },
  {
    id: 'takedowns-knee-tap',
    category: 'Takedowns',
    subcategory: 'Wrestling-Based',
    name: 'Knee Tap',
    skillLevel: 'Beginner',
    tags: ['takedown', 'wrestling', 'clinch'],
    description: 'A clinch-based takedown that uses upper-body control and a tap behind the knee to drop the base line.',
    relatedPositions: ['Standing', 'Clinch']
  },
  {
    id: 'takedowns-o-soto-gari',
    category: 'Takedowns',
    subcategory: 'Judo-Based',
    name: 'O Soto Gari',
    skillLevel: 'Intermediate',
    tags: ['takedown', 'judo', 'reap'],
    description: 'A classic outside reaping throw that depends on posture breaking, angle, and timing.',
    relatedPositions: ['Standing', 'Clinch']
  },
  {
    id: 'takedowns-o-uchi-gari',
    category: 'Takedowns',
    subcategory: 'Judo-Based',
    name: 'O Uchi Gari',
    skillLevel: 'Intermediate',
    tags: ['takedown', 'judo', 'reap'],
    description: 'A deep inside reap that works best when weight is shifted centrally and the upper body is kept upright and guided.',
    relatedPositions: ['Standing', 'Clinch']
  },
  {
    id: 'takedowns-uchi-mata',
    category: 'Takedowns',
    subcategory: 'Judo-Based',
    name: 'Uchi Mata',
    skillLevel: 'Advanced',
    tags: ['takedown', 'judo', 'throw'],
    description: 'An inside-thigh throw built on strong kuzushi, upright posture, and clean rotational entry.',
    relatedPositions: ['Standing', 'Clinch']
  },
  {
    id: 'takedowns-harai-goshi',
    category: 'Takedowns',
    subcategory: 'Judo-Based',
    name: 'Harai Goshi',
    skillLevel: 'Advanced',
    tags: ['takedown', 'judo', 'throw'],
    description: 'A sweeping hip throw that blends hip loading, rotational pull, and timing against forward pressure.',
    relatedPositions: ['Standing', 'Clinch']
  },
  {
    id: 'takedowns-tai-otoshi',
    category: 'Takedowns',
    subcategory: 'Judo-Based',
    name: 'Tai Otoshi',
    skillLevel: 'Advanced',
    tags: ['takedown', 'judo', 'throw'],
    description: 'A body-drop throw that redirects momentum over a blocking leg while the upper body turns the shoulders offline.',
    relatedPositions: ['Standing', 'Clinch']
  },
  {
    id: 'takedowns-seoi-nage',
    category: 'Takedowns',
    subcategory: 'Judo-Based',
    name: 'Seoi Nage',
    skillLevel: 'Advanced',
    tags: ['takedown', 'judo', 'shoulder throw'],
    description: 'A shoulder throw that requires tight elbow control, strong turn-in mechanics, and balanced rotation under the center of mass.',
    relatedPositions: ['Standing', 'Clinch']
  },
  {
    id: 'takedowns-sasae-tsurikomi-ashi',
    category: 'Takedowns',
    subcategory: 'Judo-Based',
    name: 'Sasae Tsurikomi Ashi',
    skillLevel: 'Advanced',
    tags: ['takedown', 'judo', 'foot sweep'],
    description: 'A blocking foot throw that lifts and redirects the upper body while stopping the advancing step at the ankle line.',
    relatedPositions: ['Standing']
  },
  {
    id: 'takedowns-de-ashi-barai',
    category: 'Takedowns',
    subcategory: 'Judo-Based',
    name: 'De Ashi Barai',
    skillLevel: 'Intermediate',
    tags: ['takedown', 'judo', 'foot sweep'],
    description: 'A timing-dependent foot sweep that catches the step while the weight is still light and moving.',
    relatedPositions: ['Standing']
  },
  {
    id: 'takedowns-snap-down-to-front-headlock',
    category: 'Takedowns',
    subcategory: 'Wrestling-Based',
    name: 'Snap Down To Front Headlock',
    skillLevel: 'Intermediate',
    tags: ['takedown', 'front headlock', 'wrestling'],
    description: 'A standing attack that uses posture breaks and head control to pull the opponent into a vulnerable front-headlock exchange.',
    relatedPositions: ['Standing', 'Front Headlock']
  },
  {
    id: 'takedowns-body-lock-takedown',
    category: 'Takedowns',
    subcategory: 'Wrestling-Based',
    name: 'Body Lock Takedown',
    skillLevel: 'Intermediate',
    tags: ['takedown', 'body lock', 'clinch'],
    description: 'A takedown pathway that turns tight upper-body connection into trips, turns, and clean finishes to the mat.',
    relatedPositions: ['Standing', 'Clinch']
  },
  {
    id: 'takedowns-blast-double',
    category: 'Takedowns',
    subcategory: 'Wrestling-Based',
    name: 'Blast Double',
    skillLevel: 'Intermediate',
    tags: ['takedown', 'wrestling', 'double leg'],
    description: 'A committed double-leg finish that drives through the hips before the opponent can widen the stance or recover frames.',
    relatedPositions: ['Standing']
  },
  {
    id: 'takedowns-snatch-single',
    category: 'Takedowns',
    subcategory: 'Wrestling-Based',
    name: 'Snatch Single',
    skillLevel: 'Intermediate',
    tags: ['takedown', 'wrestling', 'single leg'],
    description: 'A quick single-leg entry that snatches the leg from distance without a full penetration step.',
    relatedPositions: ['Standing']
  },
  {
    id: 'takedowns-low-single',
    category: 'Takedowns',
    subcategory: 'Wrestling-Based',
    name: 'Low Single',
    skillLevel: 'Advanced',
    tags: ['takedown', 'wrestling', 'single leg'],
    description: 'A low-level leg attack that reaches the ankle line directly before the stance can retract or sprawl.',
    relatedPositions: ['Standing']
  },
  {
    id: 'takedowns-duck-under',
    category: 'Strategy and Game Planning',
    subcategory: 'Standing Positional Entries',
    name: 'Duck Under',
    skillLevel: 'Intermediate',
    tags: ['strategy', 'wrestling', 'angle'],
    description: 'A go-behind style standing attack that uses head position and arm control to create a clean angle to the back.',
    relatedPositions: ['Standing', 'Body Lock Standing', 'Back Control']
  },
  {
    id: 'takedowns-arm-drag-to-back-take',
    category: 'Strategy and Game Planning',
    subcategory: 'Standing Positional Entries',
    name: 'Arm Drag To Back Take',
    skillLevel: 'Intermediate',
    tags: ['strategy', 'wrestling', 'back take'],
    description: 'A standing arm drag that creates rear angle access before the opponent can square back into stance.',
    relatedPositions: ['Standing', 'Back Control']
  },
  {
    id: 'takedowns-go-behind',
    category: 'Strategy and Game Planning',
    subcategory: 'Standing Positional Entries',
    name: 'Go-Behind',
    skillLevel: 'Beginner',
    tags: ['strategy', 'wrestling', 'rear angle'],
    description: 'A positional takedown that circles behind the hips once the head and shoulders are pulled forward or stalled.',
    relatedPositions: ['Front Headlock', 'Turtle', 'Standing']
  },
  {
    id: 'takedowns-mat-return',
    category: 'Takedowns',
    subcategory: 'Wrestling-Based',
    name: 'Mat Return',
    skillLevel: 'Intermediate',
    tags: ['takedown', 'wrestling', 'rear body lock'],
    description: 'A finish that returns the opponent to the mat once rear control is established and posture starts to rise.',
    relatedPositions: ['Back Control', 'Standing']
  },
  {
    id: 'takedowns-outside-trip',
    category: 'Takedowns',
    subcategory: 'Wrestling-Based',
    name: 'Outside Trip',
    skillLevel: 'Intermediate',
    tags: ['takedown', 'wrestling', 'trip'],
    description: 'A clinch takedown that reaps or blocks the outside line while upper-body control drives the shoulders past the hips.',
    relatedPositions: ['Clinch', 'Standing']
  },
  {
    id: 'takedowns-inside-trip',
    category: 'Takedowns',
    subcategory: 'Wrestling-Based',
    name: 'Inside Trip',
    skillLevel: 'Intermediate',
    tags: ['takedown', 'wrestling', 'trip'],
    description: 'A trip finish that attacks the inside base while tight upper-body connection keeps the opponent from stepping free.',
    relatedPositions: ['Clinch', 'Standing']
  },
  {
    id: 'takedowns-peek-out',
    category: 'Strategy and Game Planning',
    subcategory: 'Standing Positional Entries',
    name: 'Peek Out',
    skillLevel: 'Advanced',
    tags: ['strategy', 'wrestling', 'counter'],
    description: 'A reactive takedown that slips the head free and turns the angle to the outside when the front headlock pressure overcommits.',
    relatedPositions: ['Front Headlock', 'Standing']
  },
  {
    id: 'takedowns-ko-uchi-gari',
    category: 'Takedowns',
    subcategory: 'Judo-Based',
    name: 'Ko Uchi Gari',
    skillLevel: 'Intermediate',
    tags: ['takedown', 'judo', 'trip'],
    description: 'A timing-based inside reap that works especially well when the opponent shifts weight onto one leg.',
    relatedPositions: ['Standing', 'Clinch']
  },
  {
    id: 'takedowns-kosoto-gake',
    category: 'Takedowns',
    subcategory: 'Judo-Based',
    name: 'Kosoto Gake',
    skillLevel: 'Intermediate',
    tags: ['takedown', 'judo', 'hook'],
    description: 'A smaller outside hooking throw that catches the heel line while the upper body is redirected backward or laterally.',
    relatedPositions: ['Standing', 'Clinch']
  },
  {
    id: 'takedowns-tomoe-nage',
    category: 'Takedowns',
    subcategory: 'Judo-Based',
    name: 'Tomoe Nage',
    skillLevel: 'Advanced',
    tags: ['takedown', 'judo', 'sacrifice throw'],
    description: 'A sacrifice throw that places the foot centrally and sends the opponent overhead when posture is loaded forward.',
    relatedPositions: ['Standing', 'Open Guard']
  },
  {
    id: 'takedowns-sumi-gaeshi',
    category: 'Takedowns',
    subcategory: 'Judo-Based',
    name: 'Sumi Gaeshi',
    skillLevel: 'Advanced',
    tags: ['takedown', 'judo', 'sacrifice throw'],
    description: 'A corner-reversal throw that lifts and rotates the body diagonally when weight is committed over the hips.',
    relatedPositions: ['Standing', 'Butterfly Guard']
  },
  {
    id: 'takedowns-yoko-tomoe-nage',
    category: 'Takedowns',
    subcategory: 'Judo-Based',
    name: 'Yoko Tomoe Nage',
    skillLevel: 'Advanced',
    tags: ['takedown', 'judo', 'sacrifice throw'],
    description: 'A side-angle version of tomoe nage that uses lateral rotation to redirect the opponent over a posted foot.',
    relatedPositions: ['Standing']
  },
  {
    id: 'takedowns-tani-otoshi',
    category: 'Takedowns',
    subcategory: 'Judo-Based',
    name: 'Tani Otoshi',
    skillLevel: 'Intermediate',
    tags: ['takedown', 'judo', 'counter throw'],
    description: 'A rear-drop style counter that blocks the base from behind while the upper body is pulled backward into the mat.',
    relatedPositions: ['Clinch', 'Standing']
  },
  {
    id: 'takedowns-uki-waza',
    category: 'Takedowns',
    subcategory: 'Judo-Based',
    name: 'Uki Waza',
    skillLevel: 'Advanced',
    tags: ['takedown', 'judo', 'sacrifice throw'],
    description: 'A floating sacrifice throw that uses timing and angle to redirect forward pressure over the hip line.',
    relatedPositions: ['Standing']
  },
  {
    id: 'takedowns-hiza-guruma',
    category: 'Takedowns',
    subcategory: 'Judo-Based',
    name: 'Hiza Guruma',
    skillLevel: 'Intermediate',
    tags: ['takedown', 'judo', 'wheel throw'],
    description: 'A knee-wheel throw that blocks the step at the knee while rotating the upper body around the post.',
    relatedPositions: ['Standing']
  },
  {
    id: 'guard-pulls-basic-guard-pull',
    category: 'Strategy and Game Planning',
    subcategory: 'Guard Pulling And Standing Entries',
    name: 'Basic Guard Pull',
    skillLevel: 'Beginner',
    tags: ['guard pull', 'standing', 'entry'],
    description: 'A controlled entry to guard that prioritizes safe grips, posture, and a stable landing position.',
    relatedPositions: ['Standing', 'Closed Guard', 'Open Guard']
  },
  {
    id: 'guard-pulls-seated-guard-pull',
    category: 'Strategy and Game Planning',
    subcategory: 'Guard Pulling And Standing Entries',
    name: 'Seated Guard Pull',
    skillLevel: 'Beginner',
    tags: ['guard pull', 'seated guard', 'entry'],
    description: 'A direct pull to seated guard that favors mobility, distance management, and wrestle-up options.',
    relatedPositions: ['Seated Guard', 'Open Guard']
  },
  {
    id: 'guard-pulls-shin-to-shin-pull',
    category: 'Strategy and Game Planning',
    subcategory: 'Guard Pulling And Standing Entries',
    name: 'Shin-To-Shin Pull',
    skillLevel: 'Intermediate',
    tags: ['guard pull', 'shin to shin', 'entry'],
    description: 'A pull that establishes underneath connection early and opens access to single-leg X and wrestle-up chains.',
    relatedPositions: ['Shin-To-Shin', 'Single-Leg X']
  },
  {
    id: 'guard-pulls-de-la-riva-entry',
    category: 'Strategy and Game Planning',
    subcategory: 'Guard Pulling And Standing Entries',
    name: 'De La Riva Entry',
    skillLevel: 'Intermediate',
    tags: ['guard pull', 'de la riva', 'entry'],
    description: 'A standing entry into outside-hook guard that prioritizes angle, distance, and early off-balancing potential.',
    relatedPositions: ['De La Riva', 'Open Guard']
  },
  {
    id: 'escapes-elbow-knee-escape',
    category: 'Escapes',
    subcategory: 'Mount Escapes',
    name: 'Elbow-Knee Escape',
    skillLevel: 'Beginner',
    tags: ['escape', 'mount', 'reguard'],
    description: 'A staple mount escape that relies on frame discipline, hip movement, and recovering the knee line.',
    relatedPositions: ['Mount', 'Half Guard']
  },
  {
    id: 'escapes-knee-elbow-to-half-guard',
    category: 'Escapes',
    subcategory: 'Mount Escapes',
    name: 'Knee-Elbow To Half Guard',
    skillLevel: 'Beginner',
    tags: ['escape', 'mount', 'half guard'],
    description: 'A mount escape focused on regaining a trapped leg connection and rebuilding half guard before the top player settles.',
    relatedPositions: ['Mount', 'Half Guard']
  },
  {
    id: 'escapes-trap-and-roll',
    category: 'Escapes',
    subcategory: 'Mount Escapes',
    name: 'Trap And Roll',
    skillLevel: 'Beginner',
    tags: ['escape', 'mount', 'bridge'],
    description: 'A bridge-based mount escape that captures a post and uses timing to roll the opponent over cleanly.',
    relatedPositions: ['Mount']
  },
  {
    id: 'escapes-kipping-escape',
    category: 'Escapes',
    subcategory: 'Mount Escapes',
    name: 'Kipping Escape',
    skillLevel: 'Intermediate',
    tags: ['escape', 'mount', 'frames'],
    description: 'A modern mount escape that uses framing and explosive hip extension to create a path back to guard.',
    relatedPositions: ['Mount', 'Open Guard']
  },
  {
    id: 'escapes-frame-and-shrimp',
    category: 'Escapes',
    subcategory: 'Mount Escapes',
    name: 'Frame And Shrimp',
    skillLevel: 'Beginner',
    tags: ['escape', 'mount', 'frames'],
    description: 'A mount survival response that combines strong framing with hip movement to recover a safer lower-body connection.',
    relatedPositions: ['Mount', 'Half Guard']
  },
  {
    id: 'escapes-leg-pummel-escape',
    category: 'Escapes',
    subcategory: 'Mount Escapes',
    name: 'Leg Pummel Escape',
    skillLevel: 'Intermediate',
    tags: ['escape', 'mount', 'leg pummel'],
    description: 'A mount escape that uses leg re-entry to recover inside position before upper-body pressure fully settles.',
    relatedPositions: ['Mount', 'Half Guard']
  },
  {
    id: 'escapes-recovery-to-butterfly',
    category: 'Escapes',
    subcategory: 'Mount Escapes',
    name: 'Recovery To Butterfly',
    skillLevel: 'Intermediate',
    tags: ['escape', 'mount', 'butterfly guard'],
    description: 'A mount recovery route that creates enough space to sit up and rebuild butterfly structure.',
    relatedPositions: ['Mount', 'Butterfly Guard']
  },
  {
    id: 'escapes-underhook-escape',
    category: 'Escapes',
    subcategory: 'Side Control Escapes',
    name: 'Underhook Escape',
    skillLevel: 'Intermediate',
    tags: ['escape', 'side control', 'underhook'],
    description: 'A side control escape that uses timing and connection to win the underhook and start coming up safely.',
    relatedPositions: ['Side Control', 'Half Guard']
  },
  {
    id: 'escapes-ghost-escape',
    category: 'Escapes',
    subcategory: 'Side Control Escapes',
    name: 'Ghost Escape',
    skillLevel: 'Intermediate',
    tags: ['escape', 'side control', 'movement'],
    description: 'A side control escape that slips underneath upper-body pressure and turns the angle before control settles again.',
    relatedPositions: ['Side Control', 'Turtle']
  },
  {
    id: 'escapes-running-escape',
    category: 'Escapes',
    subcategory: 'Side Control Escapes',
    name: 'Running Escape',
    skillLevel: 'Intermediate',
    tags: ['escape', 'side control', 'movement'],
    description: 'A side-control escape that uses turning, hip mobility, and timing to create enough space for recovery.',
    relatedPositions: ['Side Control']
  },
  {
    id: 'escapes-bridge-and-turn-in',
    category: 'Escapes',
    subcategory: 'Side Control Escapes',
    name: 'Bridge And Turn-In',
    skillLevel: 'Beginner',
    tags: ['escape', 'side control', 'bridge'],
    description: 'A side control escape that uses bridging and inward rotation to regain frames or a lower-body connection.',
    relatedPositions: ['Side Control', 'Half Guard']
  },
  {
    id: 'escapes-reguard-with-knee-inside',
    category: 'Escapes',
    subcategory: 'Side Control Escapes',
    name: 'Reguard With Knee Inside',
    skillLevel: 'Beginner',
    tags: ['escape', 'side control', 'reguard'],
    description: 'A recovery that prioritizes sneaking the knee line back in before the pass becomes settled control.',
    relatedPositions: ['Side Control', 'Half Guard', 'Open Guard']
  },
  {
    id: 'escapes-elbow-frame-recovery',
    category: 'Escapes',
    subcategory: 'Side Control Escapes',
    name: 'Elbow Frame Recovery',
    skillLevel: 'Beginner',
    tags: ['escape', 'side control', 'frames'],
    description: 'A side-control defense that rebuilds elbow structure so the hips can move and guard recovery becomes possible.',
    relatedPositions: ['Side Control']
  },
  {
    id: 'escapes-inversion-recovery',
    category: 'Escapes',
    subcategory: 'Side Control Escapes',
    name: 'Inversion Recovery',
    skillLevel: 'Advanced',
    tags: ['escape', 'side control', 'inversion'],
    description: 'A recovery route that inverts under pressure to create angle and rebuild guard before control follows.',
    relatedPositions: ['Open Guard', 'Guard Retention']
  },
  {
    id: 'escapes-north-south-escape-to-turtle',
    category: 'Escapes',
    subcategory: 'Side Control Escapes',
    name: 'North-South Escape To Turtle',
    skillLevel: 'Intermediate',
    tags: ['escape', 'north south', 'turtle'],
    description: 'A north-south escape that turns pressure into a safer turtle recovery before the upper body gets isolated.',
    relatedPositions: ['North-South', 'Turtle']
  },
  {
    id: 'escapes-two-on-one-grip-fight',
    category: 'Escapes',
    subcategory: 'Back Escapes',
    name: 'Two-On-One Grip Fight',
    skillLevel: 'Beginner',
    tags: ['escape', 'back control', 'hand fighting'],
    description: 'A foundational back escape skill that starts by controlling the choking arm before trying to move.',
    relatedPositions: ['Back Control']
  },
  {
    id: 'escapes-shoulder-slide-escape',
    category: 'Escapes',
    subcategory: 'Back Escapes',
    name: 'Shoulder Slide Escape',
    skillLevel: 'Intermediate',
    tags: ['escape', 'back control', 'turning'],
    description: 'A back escape that uses shoulder positioning and careful rotation to turn into closed guard while escaping the back.',
    relatedPositions: ['Back Control', 'Closed Guard']
  },
  {
    id: 'escapes-back-to-the-mat-escape',
    category: 'Escapes',
    subcategory: 'Back Escapes',
    name: 'Back To The Mat Escape',
    skillLevel: 'Beginner',
    tags: ['escape', 'back control', 'alignment'],
    description: 'A core back recovery goal where the shoulders and spine are turned back toward the mat before the choke is set.',
    relatedPositions: ['Back Control']
  },
  {
    id: 'escapes-scoop-escape',
    category: 'Escapes',
    subcategory: 'Back Escapes',
    name: 'Scoop Escape',
    skillLevel: 'Intermediate',
    tags: ['escape', 'back control', 'hip movement'],
    description: 'A back escape that uses lower-body scooping mechanics to change angle and free the hips from tighter control.',
    relatedPositions: ['Back Control']
  },
  {
    id: 'escapes-escape-to-top-half',
    category: 'Escapes',
    subcategory: 'Back Escapes',
    name: 'Escape To Top Half',
    skillLevel: 'Intermediate',
    tags: ['escape', 'back control', 'half guard'],
    description: 'A back escape that turns the recovery into a top half guard finish when the angle and leg line open up.',
    relatedPositions: ['Back Control', 'Top Half Guard']
  },
  {
    id: 'escapes-stand-up-from-turtle',
    category: 'Escapes',
    subcategory: 'Turtle Escapes',
    name: 'Stand-Up From Turtle',
    skillLevel: 'Beginner',
    tags: ['escape', 'turtle', 'stand up'],
    description: 'A recovery route from turtle that prioritizes base, hand fighting, and safe posture while returning to the feet.',
    relatedPositions: ['Turtle', 'Standing']
  },
  {
    id: 'escapes-roll-escape',
    category: 'Escapes',
    subcategory: 'Turtle Escapes',
    name: 'Granby Roll',
    skillLevel: 'Intermediate',
    tags: ['escape', 'turtle', 'rolling'],
    description: 'A turtle escape that uses rolling momentum to clear pressure and recover a safer directional angle.',
    relatedPositions: ['Turtle']
  },
  {
    id: 'escapes-switch',
    category: 'Escapes',
    subcategory: 'Turtle Escapes',
    name: 'Hip Switch',
    skillLevel: 'Intermediate',
    tags: ['escape', 'turtle', 'wrestling'],
    description: 'A wrestling-based turtle escape that turns hip angle into a cleaner path away from control.',
    relatedPositions: ['Turtle', 'Standing']
  },
  {
    id: 'escapes-sit-out',
    category: 'Escapes',
    subcategory: 'Turtle Escapes',
    name: 'Sit-Out',
    skillLevel: 'Intermediate',
    tags: ['escape', 'turtle', 'wrestling'],
    description: 'A turtle escape that sits the hips out to one side to break chest-wrap style control and create a path to turn free.',
    relatedPositions: ['Turtle', 'Standing']
  },
  {
    id: 'escapes-build-base-and-hand-fight',
    category: 'Escapes',
    subcategory: 'Turtle Escapes',
    name: 'Build Base And Hand Fight',
    skillLevel: 'Beginner',
    tags: ['escape', 'turtle', 'hand fighting'],
    description: 'A turtle survival priority that restores posture and hand control before attempting a bigger recovery.',
    relatedPositions: ['Turtle']
  },
  {
    id: 'escapes-recover-half-guard-from-turtle',
    category: 'Escapes',
    subcategory: 'Turtle Escapes',
    name: 'Recover Half Guard From Turtle',
    skillLevel: 'Intermediate',
    tags: ['escape', 'turtle', 'half guard'],
    description: 'A turtle recovery route that regains a leg connection before the opponent can fully settle behind the hips.',
    relatedPositions: ['Turtle', 'Half Guard']
  },
  {
    id: 'escapes-recover-seated-guard',
    category: 'Escapes',
    subcategory: 'Turtle Escapes',
    name: 'Recover Seated Guard',
    skillLevel: 'Intermediate',
    tags: ['escape', 'turtle', 'seated guard'],
    description: 'A turtle recovery that turns the position into a more proactive seated guard instead of staying defensive.',
    relatedPositions: ['Turtle', 'Seated Guard']
  },
  {
    id: 'escapes-armbar-hitchhiker',
    category: 'Escapes',
    subcategory: 'Submission Escapes',
    name: 'Armbar Hitchhiker',
    skillLevel: 'Intermediate',
    tags: ['escape', 'submission', 'armbar'],
    description: 'A directional armbar escape that turns the thumb line and shoulders toward the safer side.',
    relatedPositions: ['Armbar Defense']
  },
  {
    id: 'escapes-armbar-stacking-defense',
    category: 'Escapes',
    subcategory: 'Submission Escapes',
    name: 'Armbar Stacking Defense',
    skillLevel: 'Intermediate',
    tags: ['escape', 'submission', 'armbar'],
    description: 'A defense that uses posture and forward pressure to stack the hips before the extension becomes clean.',
    relatedPositions: ['Closed Guard', 'Armbar Defense']
  },
  {
    id: 'escapes-triangle-posture-escape',
    category: 'Escapes',
    subcategory: 'Submission Escapes',
    name: 'Triangle Posture Escape',
    skillLevel: 'Beginner',
    tags: ['escape', 'submission', 'triangle'],
    description: 'A triangle escape focused on rebuilding posture and breaking the legs apart.',
    relatedPositions: ['Closed Guard']
  },
  {
    id: 'escapes-triangle-hand-fight-angle-kill',
    category: 'Escapes',
    subcategory: 'Submission Escapes',
    name: 'Triangle Escape With Hand Fighting/Angles',
    skillLevel: 'Intermediate',
    tags: ['escape', 'submission', 'triangle'],
    description: 'A triangle defense that hand fights the setup picking a side with your elbow to cut an angle to separate the legs and make the triangle harder to lock.',
    relatedPositions: ['Closed Guard']
  },
  {
    id: 'escapes-kimura-roll-defense',
    category: 'Escapes',
    subcategory: 'Submission Escapes',
    name: 'Kimura Roll Defense',
    skillLevel: 'Intermediate',
    tags: ['escape', 'submission', 'kimura'],
    description: 'A kimura defense that follows the rotational line safely so the shoulder does not stay trapped under pressure.',
    relatedPositions: ['Closed Guard', 'Top Half Guard']
  },
  {
    id: 'escapes-guillotine-hand-fight-shoulder-pressure',
    category: 'Escapes',
    subcategory: 'Submission Escapes',
    name: 'Guillotine Hand Fight And Shoulder Pressure Defense',
    skillLevel: 'Intermediate',
    tags: ['escape', 'submission', 'guillotine'],
    description: 'A guillotine defense that combines early hand fighting with posture and shoulder pressure to reduce finishing leverage.',
    relatedPositions: ['Standing', 'Front Headlock', 'Half Guard Top']
  },
  {
    id: 'escapes-rear-naked-choke-hand-peel',
    category: 'Escapes',
    subcategory: 'Submission Escapes',
    name: 'Rear Naked Choke Hand Peel Defense',
    skillLevel: 'Beginner',
    tags: ['escape', 'submission', 'rear naked choke'],
    description: 'A defensive priority that strips the finishing hand before the full choke line is locked in.',
    relatedPositions: ['Back Control']
  },
  {
    id: 'escapes-americana-defense',
    category: 'Escapes',
    subcategory: 'Submission Escapes',
    name: 'Americana Defense',
    skillLevel: 'Beginner',
    tags: ['escape', 'submission', 'americana'],
    description: 'A shoulder-lock defense that restores elbow positioning and denies the angle needed to finish.',
    relatedPositions: ['Side Control', 'Mount']
  },
  {
    id: 'escapes-straight-ankle-lock-boot-defense',
    category: 'Escapes',
    subcategory: 'Submission Escapes',
    name: 'Straight Ankle Lock Boot Defense',
    skillLevel: 'Beginner',
    tags: ['escape', 'submission', 'ankle lock'],
    description: 'A defensive response that uses foot posture and alignment to reduce finishing pressure while creating room to move.',
    relatedPositions: ['Ashi Garami', 'Single-Leg X']
  },
  {
    id: 'escapes-heel-hook-line-escape',
    category: 'Escapes',
    subcategory: 'Submission Escapes',
    name: 'Heel Hook Line Escape',
    skillLevel: 'Advanced',
    tags: ['escape', 'submission', 'heel hook'],
    description: 'A leg-lock defense focused on clearing the knee line and turning the hips before the rotational finish is set.',
    relatedPositions: ['Saddle', '50/50', 'Cross Ashi']
  },
  {
    id: 'escapes-kneebar-turn-defense',
    category: 'Escapes',
    subcategory: 'Submission Escapes',
    name: 'Kneebar Turn Defense',
    skillLevel: 'Intermediate',
    tags: ['escape', 'submission', 'kneebar'],
    description: 'A kneebar defense that turns the line of the knee before the hips are fully pinned in extension.',
    relatedPositions: ['Saddle', 'Top Half Guard']
  },
  {
    id: 'escapes-omoplata-forward-roll-escape',
    category: 'Escapes',
    subcategory: 'Submission Escapes',
    name: 'Omoplata Forward Roll Escape',
    skillLevel: 'Intermediate',
    tags: ['escape', 'submission', 'omoplata'],
    description: 'A shoulder-lock defense that follows the pressure line into a safer forward roll before the upper body gets pinned.',
    relatedPositions: ['Closed Guard', 'Open Guard']
  },
  {
    id: 'escapes-bow-and-arrow-hand-fight-defense',
    category: 'Escapes',
    subcategory: 'Submission Escapes',
    name: 'Bow And Arrow Choke Hand Fight Defense',
    skillLevel: 'Intermediate',
    tags: ['escape', 'submission', 'bow and arrow choke'],
    description: 'A gi choke defense that prioritizes hand fighting and shoulder alignment before the finishing angle is secured.',
    relatedPositions: ['Back Control']
  },
  {
    id: 'escapes-ezekiel-posture-defense',
    category: 'Escapes',
    subcategory: 'Submission Escapes',
    name: 'Ezekiel Posture Defense',
    skillLevel: 'Beginner',
    tags: ['escape', 'submission', 'ezekiel'],
    description: 'A choke defense that rebuilds posture and strips the arm line before the pressure closes around the neck.',
    relatedPositions: ['Mount', 'Closed Guard Top']
  },
  {
    id: 'guard-retention-hip-escape-retention',
    category: 'Guard Retention',
    subcategory: null,
    name: 'Hip Escape Retention',
    skillLevel: 'Beginner',
    tags: ['guard retention', 'frame', 'movement'],
    description: 'Using angle and hip movement to rebuild frames and recover a safer guard structure.',
    relatedPositions: ['Open Guard', 'Half Guard']
  },
  {
    id: 'guard-retention-leg-pummeling',
    category: 'Guard Retention',
    subcategory: null,
    name: 'Leg Pummeling',
    skillLevel: 'Intermediate',
    tags: ['guard retention', 'hooks', 'recovery'],
    description: 'A retention skill that uses active leg exchanges to recover inside position and rebuild guard structure.',
    relatedPositions: ['Open Guard', 'De La Riva', 'Half Guard']
  },
  {
    id: 'guard-retention-knee-elbow-recovery',
    category: 'Guard Retention',
    subcategory: null,
    name: 'Knee-Elbow Recovery',
    skillLevel: 'Beginner',
    tags: ['guard retention', 'frames', 'recovery'],
    description: 'Reconnecting the knees and elbows to rebuild defensive structure before the pass fully settles.',
    relatedPositions: ['Side Control Defense', 'Mount Defense']
  },
  {
    id: 'guard-retention-retaining-against-leg-drag',
    category: 'Guard Retention',
    subcategory: null,
    name: 'Retaining Against Leg Drag',
    skillLevel: 'Intermediate',
    tags: ['guard retention', 'passing defense', 'leg drag'],
    description: 'Recovering angle and inside position before a leg-drag style pass turns into settled control.',
    relatedPositions: ['Open Guard', 'De La Riva', 'Side Control Defense']
  },
  {
    id: 'guard-retention-retaining-against-body-lock',
    category: 'Guard Retention',
    subcategory: null,
    name: 'Retaining Against Body Lock',
    skillLevel: 'Intermediate',
    tags: ['guard retention', 'passing defense', 'body lock'],
    description: 'Using frames, hip angle, and leg recovery to stop a tight body-lock style pass from collapsing the guard.',
    relatedPositions: ['Open Guard', 'Half Guard']
  },
  {
    id: 'guard-retention-high-leg-recovery',
    category: 'Guard Retention',
    subcategory: null,
    name: 'High Leg Recovery',
    skillLevel: 'Intermediate',
    tags: ['guard retention', 'legs', 'recovery'],
    description: 'Lifting the legs high and re-pummeling to recover hooks, distance, or stronger guard structure.',
    relatedPositions: ['Open Guard', 'De La Riva']
  },
  {
    id: 'sweeps-scissor-sweep',
    category: 'Sweeps',
    subcategory: 'Closed Guard',
    name: 'Scissor Sweep',
    skillLevel: 'Beginner',
    tags: ['guard', 'sweep', 'fundamental'],
    description: 'A basic sweep from closed guard using angle, sleeve or collar control, and shin pressure.',
    relatedPositions: ['Closed Guard']
  },
  {
    id: 'sweeps-hip-bump-sweep',
    category: 'Sweeps',
    subcategory: 'Closed Guard',
    name: 'Hip Bump Sweep',
    skillLevel: 'Beginner',
    tags: ['guard', 'sweep', 'sit up'],
    description: 'A seated closed-guard sweep that uses posture breaking, angle, and upper-body momentum to tip the top player over.',
    relatedPositions: ['Closed Guard']
  },
  {
    id: 'sweeps-flower-sweep',
    category: 'Sweeps',
    subcategory: 'Closed Guard',
    name: 'Flower Sweep',
    skillLevel: 'Beginner',
    tags: ['guard', 'sweep', 'closed guard'],
    description: 'A closed-guard sweep that combines sleeve control, angle, and leg elevation to pull the opponent over the shoulder line.',
    relatedPositions: ['Closed Guard']
  },
  {
    id: 'sweeps-lumberjack-sweep',
    category: 'Sweeps',
    subcategory: 'Closed Guard',
    name: 'Lumberjack Sweep',
    skillLevel: 'Intermediate',
    tags: ['guard', 'sweep', 'off-balance'],
    description: 'A sweep that removes the posts and redirects the opponent backward before they can rebuild standing base.',
    relatedPositions: ['Closed Guard', 'Standing']
  },
  {
    id: 'sweeps-overhook-sweep',
    category: 'Sweeps',
    subcategory: 'Closed Guard',
    name: 'Overhook Sweep',
    skillLevel: 'Intermediate',
    tags: ['guard', 'sweep', 'overhook'],
    description: 'A closed-guard sweep that uses strong overhook connection to turn posture into a tipping direction.',
    relatedPositions: ['Closed Guard']
  },
  {
    id: 'sweeps-clamp-guard-sweep',
    category: 'Sweeps',
    subcategory: 'Closed Guard',
    name: 'Clamp Guard Sweep',
    skillLevel: 'Intermediate',
    tags: ['guard', 'sweep', 'clamp'],
    description: 'A clamp-based sweep that uses shoulder and torso control to limit posts before rotating to top.',
    relatedPositions: ['Closed Guard', 'Clamp Guard']
  },
  {
    id: 'sweeps-double-ankle-sweep',
    category: 'Sweeps',
    subcategory: 'Closed Guard',
    name: 'Double Ankle Sweep',
    skillLevel: 'Beginner',
    tags: ['guard', 'sweep', 'standing'],
    description: 'A sweep that punishes a standing opponent by removing both posts and redirecting the hips backward.',
    relatedPositions: ['Closed Guard', 'Standing']
  },
  {
    id: 'sweeps-waiter-sweep',
    category: 'Sweeps',
    subcategory: 'Closed Guard',
    name: 'Waiter Sweep',
    skillLevel: 'Intermediate',
    tags: ['guard', 'sweep', 'elevation'],
    description: 'A sweep that uses underneath positioning and leg elevation to tip the opponent over a trapped post.',
    relatedPositions: ['Waiter Guard', 'Closed Guard']
  },
  {
    id: 'sweeps-tripod-sweep',
    category: 'Sweeps',
    subcategory: 'Open Guard',
    name: 'Tripod Sweep',
    skillLevel: 'Beginner',
    tags: ['guard', 'sweep', 'open guard'],
    description: 'A classic off-balancing sweep from open guard that attacks the base by controlling posts and pushing angles.',
    relatedPositions: ['Open Guard']
  },
  {
    id: 'sweeps-basic-butterfly-sweep',
    category: 'Sweeps',
    subcategory: 'Butterfly Guard',
    name: 'Basic Butterfly Sweep',
    skillLevel: 'Beginner',
    tags: ['guard', 'sweep', 'elevation'],
    description: 'A core butterfly guard sweep built on underhooks, angle, and clean elevation to the side.',
    relatedPositions: ['Butterfly Guard']
  },
  {
    id: 'sweeps-arm-drag-butterfly-sweep',
    category: 'Sweeps',
    subcategory: 'Butterfly Guard',
    name: 'Arm Drag Butterfly Sweep',
    skillLevel: 'Intermediate',
    tags: ['guard', 'sweep', 'arm drag'],
    description: 'A butterfly sweep that uses arm-drag connection to expose posture and redirect the top player past their base.',
    relatedPositions: ['Butterfly Guard', 'Seated Guard']
  },
  {
    id: 'sweeps-elevator-sweep',
    category: 'Sweeps',
    subcategory: 'Butterfly Guard',
    name: 'Elevator Sweep',
    skillLevel: 'Beginner',
    tags: ['guard', 'sweep', 'elevation'],
    description: 'A classic lifting sweep that uses hook elevation and directional pull to tip the opponent over cleanly.',
    relatedPositions: ['Butterfly Guard']
  },
  {
    id: 'sweeps-shoulder-crunch-butterfly-sweep',
    category: 'Sweeps',
    subcategory: 'Butterfly Guard',
    name: 'Shoulder Crunch Butterfly Sweep',
    skillLevel: 'Intermediate',
    tags: ['guard', 'sweep', 'control'],
    description: 'A sweep that combines upper-body crunch control with butterfly elevation to weaken posting and rotate to top.',
    relatedPositions: ['Butterfly Guard']
  },
  {
    id: 'sweeps-reverse-butterfly-sweep',
    category: 'Sweeps',
    subcategory: 'Butterfly Guard',
    name: 'Reverse Butterfly Sweep',
    skillLevel: 'Intermediate',
    tags: ['guard', 'sweep', 'butterfly guard'],
    description: 'A butterfly variation that redirects the opponent across the opposite line of balance using a reverse hook path.',
    relatedPositions: ['Butterfly Guard']
  },
  {
    id: 'sweeps-butterfly-to-x-guard-sweep',
    category: 'Sweeps',
    subcategory: 'Butterfly Guard',
    name: 'Butterfly To X-Guard Sweep',
    skillLevel: 'Intermediate',
    tags: ['guard', 'sweep', 'transition'],
    description: 'A transition-based sweep that uses butterfly entries to connect into stronger underneath X-guard control.',
    relatedPositions: ['Butterfly Guard', 'X-Guard']
  },
  {
    id: 'sweeps-old-school-sweep',
    category: 'Sweeps',
    subcategory: 'Half Guard',
    name: 'Old School Sweep',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'half guard', 'underhook'],
    description: 'A classic half guard sweep that turns deep underhook position into a strong off-balancing finish.',
    relatedPositions: ['Half Guard']
  },
  {
    id: 'sweeps-plan-b-sweep',
    category: 'Sweeps',
    subcategory: 'Half Guard',
    name: 'Plan B Sweep',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'half guard', 'underhook'],
    description: 'A half-guard sweep that turns a deep underhook and hip control into a strong toppling angle.',
    relatedPositions: ['Half Guard', 'Dogfight']
  },
  {
    id: 'sweeps-knee-lever-sweep',
    category: 'Sweeps',
    subcategory: 'Half Guard',
    name: 'Knee Lever Sweep',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'half guard', 'off-balance'],
    description: 'A half-guard sweep that uses upper-body control and a knee-blocking lever to take away stable posts.',
    relatedPositions: ['Half Guard']
  },
  {
    id: 'sweeps-single-leg-x-stand-up-sweep',
    category: 'Sweeps',
    subcategory: 'X-Guard / Single-Leg X',
    name: 'Single-Leg X Stand-Up Sweep',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'single-leg x', 'wrestle up'],
    description: 'A sweep that converts lower-body control into a technical stand-up finish before the top player can reset.',
    relatedPositions: ['Single-Leg X', 'Standing']
  },
  {
    id: 'sweeps-x-guard-overhead-sweep',
    category: 'Sweeps',
    subcategory: 'X-Guard / Single-Leg X',
    name: 'X-Guard Overhead Sweep',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'x-guard', 'elevation'],
    description: 'A classic x-guard sweep that lifts and tips the standing base overhead before the post can reappear.',
    relatedPositions: ['X-Guard']
  },
  {
    id: 'sweeps-x-guard-back-take',
    category: 'Sweeps',
    subcategory: 'X-Guard / Single-Leg X',
    name: 'X-Guard Back Take',
    skillLevel: 'Advanced',
    tags: ['sweep', 'x-guard', 'back take'],
    description: 'A sweep variation that uses x-guard control to expose the hips and climb directly toward the back.',
    relatedPositions: ['X-Guard', 'Back Control']
  },
  {
    id: 'sweeps-single-leg-x-outside-reap-sweep',
    category: 'Sweeps',
    subcategory: 'X-Guard / Single-Leg X',
    name: 'Single-Leg X Outside Reap Sweep',
    skillLevel: 'Advanced',
    tags: ['sweep', 'single-leg x', 'off-balance'],
    description: 'A lower-body sweep that uses outside-leg control and off-balancing pressure to take the top player over the line.',
    relatedPositions: ['Single-Leg X']
  },
  {
    id: 'sweeps-x-guard-to-leg-drag-sweep',
    category: 'Sweeps',
    subcategory: 'X-Guard / Single-Leg X',
    name: 'X-Guard To Leg Drag Sweep',
    skillLevel: 'Advanced',
    tags: ['sweep', 'x-guard', 'passing transition'],
    description: 'A sweep that converts underneath x-guard control into a top-leg-drag style finish before the guard resets.',
    relatedPositions: ['X-Guard', 'Leg Drag Position']
  },
  {
    id: 'sweeps-x-guard-to-ankle-pick',
    category: 'Sweeps',
    subcategory: 'X-Guard / Single-Leg X',
    name: 'X-Guard To Ankle Pick',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'x-guard', 'standing'],
    description: 'A sweep that uses x-guard control to force a post and rise into an ankle-pick style finish.',
    relatedPositions: ['X-Guard', 'Standing']
  },
  {
    id: 'sweeps-sickle-sweep',
    category: 'Sweeps',
    subcategory: 'Open Guard',
    name: 'Sickle Sweep',
    skillLevel: 'Beginner',
    tags: ['sweep', 'open guard', 'off-balance'],
    description: 'A classic open-guard sweep that combines upper-body control with a sharp cut to the far leg.',
    relatedPositions: ['Open Guard']
  },
  {
    id: 'sweeps-john-wayne-sweep',
    category: 'Sweeps',
    subcategory: 'Half Guard',
    name: 'John Wayne Sweep',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'half guard', 'off-balance'],
    description: 'A half guard sweep that uses upper-body alignment and leg entanglement to knock the top player off base.',
    relatedPositions: ['Half Guard']
  },
  {
    id: 'sweeps-deep-half-waiter-sweep',
    category: 'Sweeps',
    subcategory: 'Half Guard',
    name: 'Deep Half Waiter Sweep',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'half guard', 'deep half'],
    description: 'A deep-half sweep that elevates underneath the hips and redirects the trapped leg over a weak post line.',
    relatedPositions: ['Deep Half Guard', 'Waiter Guard']
  },
  {
    id: 'sweeps-homer-simpson-sweep',
    category: 'Sweeps',
    subcategory: 'Half Guard',
    name: 'Homer Simpson Sweep',
    skillLevel: 'Advanced',
    tags: ['sweep', 'half guard', 'leg entanglement'],
    description: 'A half-guard sweep that uses stronger lower-body entanglement and turning pressure to unbalance the top player.',
    relatedPositions: ['Half Guard']
  },
  {
    id: 'sweeps-half-butterfly-sweep',
    category: 'Sweeps',
    subcategory: 'Half Guard',
    name: 'Half Butterfly Sweep',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'half guard', 'butterfly'],
    description: 'A half-guard sweep that uses a butterfly-style hook to elevate the trapped side before rotating on top.',
    relatedPositions: ['Half Guard', 'Butterfly Guard']
  },
  {
    id: 'sweeps-dogfight-sweep',
    category: 'Sweeps',
    subcategory: 'Half Guard',
    name: 'Dogfight Sweep',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'half guard', 'dogfight'],
    description: 'A wrestle-up style sweep from dogfight that capitalizes on height, underhook control, and balance breaks.',
    relatedPositions: ['Half Guard', 'Dogfight']
  },
  {
    id: 'sweeps-backdoor-sweep',
    category: 'Sweeps',
    subcategory: 'Half Guard',
    name: 'Backdoor Sweep',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'half guard', 'timing'],
    description: 'A half-guard sweep that uses a sudden angle change to slip behind the hips before the top player can react.',
    relatedPositions: ['Half Guard']
  },
  {
    id: 'sweeps-underhook-come-up-sweep',
    category: 'Sweeps',
    subcategory: 'Half Guard',
    name: 'Underhook To Come-Up Sweep',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'half guard', 'wrestle up'],
    description: 'A half-guard sweep that converts underhook height into a clean rise to top before pressure settles back in.',
    relatedPositions: ['Half Guard', 'Dogfight']
  },
  {
    id: 'sweeps-technical-stand-up-sweep',
    category: 'Sweeps',
    subcategory: 'Open Guard',
    name: 'Technical Stand-Up Sweep',
    skillLevel: 'Beginner',
    tags: ['sweep', 'open guard', 'stand up'],
    description: 'A sweep that converts distance and grip control into a clean stand-up finish before the passer can reconnect.',
    relatedPositions: ['Open Guard', 'Standing']
  },
  {
    id: 'sweeps-collar-drag-sweep',
    category: 'Sweeps',
    subcategory: 'Open Guard',
    name: 'Collar Drag Sweep',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'open guard', 'drag'],
    description: 'A drag-based sweep that snaps posture forward and redirects the shoulders across the center line.',
    relatedPositions: ['Open Guard', 'Seated Guard']
  },
  {
    id: 'sweeps-balloon-sweep',
    category: 'Sweeps',
    subcategory: 'Open Guard',
    name: 'Balloon Sweep',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'open guard', 'elevation'],
    description: 'A sweep that lifts the hips over a weak post line and floats the top player into an easy turnover.',
    relatedPositions: ['Open Guard']
  },
  {
    id: 'sweeps-overhead-sweep',
    category: 'Sweeps',
    subcategory: 'Open Guard',
    name: 'Overhead Sweep',
    skillLevel: 'Beginner',
    tags: ['sweep', 'open guard', 'elevation'],
    description: 'A sweep that uses forward pressure against the opponent and redirects their weight over the hips.',
    relatedPositions: ['Open Guard']
  },
  {
    id: 'sweeps-ankle-push-sweep',
    category: 'Sweeps',
    subcategory: 'Open Guard',
    name: 'Ankle Push Sweep',
    skillLevel: 'Beginner',
    tags: ['sweep', 'open guard', 'off-balance'],
    description: 'A sweep that combines upper-body pull with a low push against the ankle line to remove balance.',
    relatedPositions: ['Open Guard']
  },
  {
    id: 'sweeps-shin-to-shin-wrestle-up',
    category: 'Sweeps',
    subcategory: 'Seated / Shin-To-Shin',
    name: 'Shin-To-Shin Wrestle-Up',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'wrestle up', 'seated guard'],
    description: 'A seated attack that uses shin-to-shin control to come up on balance before the opponent re-posts.',
    relatedPositions: ['Shin-To-Shin', 'Seated Guard']
  },
  {
    id: 'sweeps-single-leg-from-seated-guard',
    category: 'Sweeps',
    subcategory: 'Seated / Shin-To-Shin',
    name: 'Single-Leg From Seated Guard',
    skillLevel: 'Beginner',
    tags: ['sweep', 'seated guard', 'wrestling'],
    description: 'A seated-guard wrestle-up that converts hand fighting and distance into a clean single-leg finish.',
    relatedPositions: ['Seated Guard', 'Standing']
  },
  {
    id: 'sweeps-arm-drag-to-back',
    category: 'Sweeps',
    subcategory: 'Seated / Shin-To-Shin',
    name: 'Arm Drag To Back',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'seated guard', 'back take'],
    description: 'A seated guard attack that drags the arm across and climbs behind the hips before the base recovers.',
    relatedPositions: ['Seated Guard', 'Back Control']
  },
  {
    id: 'sweeps-sumi-gaeshi-from-seated',
    category: 'Sweeps',
    subcategory: 'Seated / Shin-To-Shin',
    name: 'Sumi Gaeshi From Seated',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'seated guard', 'elevation'],
    description: 'A seated sacrifice-style sweep that loads the hips underneath and turns the opponent overhead or into a scramble.',
    relatedPositions: ['Seated Guard', 'Butterfly Guard']
  },
  {
    id: 'sweeps-shin-to-shin-to-single-leg-x-sweep',
    category: 'Sweeps',
    subcategory: 'Seated / Shin-To-Shin',
    name: 'Shin-To-Shin To Single-Leg X Sweep',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'shin to shin', 'transition'],
    description: 'A sweep that uses shin-to-shin connection to enter single-leg x and finish with stronger lower-body control.',
    relatedPositions: ['Shin-To-Shin', 'Single-Leg X']
  },
  {
    id: 'sweeps-basic-de-la-riva-off-balance-sweep',
    category: 'Sweeps',
    subcategory: 'De La Riva / Reverse De La Riva',
    name: 'Basic De La Riva Off-Balance Sweep',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'de la riva', 'off-balance'],
    description: 'A de la riva sweep that uses hook tension and upper-body control to knock the standing base off line.',
    relatedPositions: ['De La Riva']
  },
  {
    id: 'sweeps-berimbolo-back-take',
    category: 'Sweeps',
    subcategory: 'De La Riva / Reverse De La Riva',
    name: 'Berimbolo Back Take',
    skillLevel: 'Advanced',
    tags: ['sweep', 'de la riva', 'back take'],
    description: 'An inversion-based attack that turns de la riva style control into a back take through hip exposure.',
    relatedPositions: ['De La Riva', 'Back Control']
  },
  {
    id: 'sweeps-de-la-riva-tripod-variation',
    category: 'Sweeps',
    subcategory: 'De La Riva / Reverse De La Riva',
    name: 'De La Riva Tripod Variation',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'de la riva', 'tripod'],
    description: 'A tripod-style sweep that uses de la riva hook control to expose a weaker standing line.',
    relatedPositions: ['De La Riva']
  },
  {
    id: 'sweeps-baby-bolo',
    category: 'Sweeps',
    subcategory: 'De La Riva / Reverse De La Riva',
    name: 'Baby Bolo',
    skillLevel: 'Advanced',
    tags: ['sweep', 'de la riva', 'inversion'],
    description: 'A lighter inversion route that uses hip exposure and timing to climb toward the back or top position.',
    relatedPositions: ['De La Riva', 'Reverse De La Riva']
  },
  {
    id: 'sweeps-kiss-of-the-dragon',
    category: 'Sweeps',
    subcategory: 'De La Riva / Reverse De La Riva',
    name: 'Kiss Of The Dragon',
    skillLevel: 'Advanced',
    tags: ['sweep', 'reverse de la riva', 'back take'],
    description: 'A spin-under attack that creates hip exposure and strong pathways to the back from reverse de la riva.',
    relatedPositions: ['Reverse De La Riva', 'Back Control']
  },
  {
    id: 'sweeps-reverse-de-la-riva-waiter-sweep',
    category: 'Sweeps',
    subcategory: 'De La Riva / Reverse De La Riva',
    name: 'Reverse De La Riva Waiter Sweep',
    skillLevel: 'Advanced',
    tags: ['sweep', 'reverse de la riva', 'waiter'],
    description: 'A reverse de la riva sweep that transitions underneath to waiter-style elevation before tipping the base.',
    relatedPositions: ['Reverse De La Riva', 'Waiter Guard']
  },
  {
    id: 'sweeps-reverse-de-la-riva-spin-under-sweep',
    category: 'Sweeps',
    subcategory: 'De La Riva / Reverse De La Riva',
    name: 'Reverse De La Riva Spin Under Sweep',
    skillLevel: 'Advanced',
    tags: ['sweep', 'reverse de la riva', 'spin under'],
    description: 'A spin-under sweep that moves underneath the standing base and turns the angle before recovery happens.',
    relatedPositions: ['Reverse De La Riva']
  },
  {
    id: 'sweeps-de-la-riva-to-single-leg-x-sweep',
    category: 'Sweeps',
    subcategory: 'De La Riva / Reverse De La Riva',
    name: 'De La Riva To Single-Leg X Sweep',
    skillLevel: 'Intermediate',
    tags: ['sweep', 'de la riva', 'transition'],
    description: 'A sweep that uses de la riva connection to enter single-leg x and finish with stronger lower-body control.',
    relatedPositions: ['De La Riva', 'Single-Leg X']
  },
  {
    id: 'guard-passing-pressure-passing',
    category: 'Guard Passing',
    subcategory: 'Passing Styles',
    name: 'Pressure Passing',
    skillLevel: 'Intermediate',
    tags: ['passing', 'pressure', 'control'],
    description: 'A passing style that uses connection, alignment, and weight placement to limit movement before advancing.',
    relatedPositions: ['Headquarters', 'Half Guard Top']
  },
  {
    id: 'guard-passing-speed-passing',
    category: 'Guard Passing',
    subcategory: 'Passing Styles',
    name: 'Speed Passing',
    skillLevel: 'Intermediate',
    tags: ['passing', 'mobility', 'timing'],
    description: 'A passing style that relies on quick angle changes, fast footwork, and beating the guard before it can reconnect.',
    relatedPositions: ['Open Guard', 'Standing Passing']
  },
  {
    id: 'guard-passing-outside-passing',
    category: 'Guard Passing',
    subcategory: 'Passing Styles',
    name: 'Outside Passing',
    skillLevel: 'Intermediate',
    tags: ['passing', 'angle', 'mobility'],
    description: 'A style of passing that works around the legs from the outside line rather than forcing directly through them.',
    relatedPositions: ['Open Guard', 'Leg Drag Position']
  },
  {
    id: 'guard-passing-inside-passing',
    category: 'Guard Passing',
    subcategory: 'Passing Styles',
    name: 'Inside Passing',
    skillLevel: 'Intermediate',
    tags: ['passing', 'inside lane', 'pressure'],
    description: 'A style of passing that enters through the middle space to split the legs and collapse hip mobility.',
    relatedPositions: ['Headquarters', 'Half Guard Top']
  },
  {
    id: 'guard-passing-smash-passing',
    category: 'Guard Passing',
    subcategory: 'Passing Styles',
    name: 'Smash Passing',
    skillLevel: 'Intermediate',
    tags: ['passing', 'pressure', 'smash'],
    description: 'A pressure-focused style that folds frames and knees together before advancing into tighter control.',
    relatedPositions: ['Half Guard Top', 'Side Control']
  },
  {
    id: 'guard-passing-body-lock-passing',
    category: 'Guard Passing',
    subcategory: 'Passing Styles',
    name: 'Body Lock Passing',
    skillLevel: 'Intermediate',
    tags: ['passing', 'body lock', 'pressure'],
    description: 'A passing style that uses torso connection to shut down movement and force the hips into weaker directions.',
    relatedPositions: ['Open Guard', 'Half Guard Top']
  },
  {
    id: 'guard-passing-leg-weave-passing',
    category: 'Guard Passing',
    subcategory: 'Passing Styles',
    name: 'Leg Weave Passing',
    skillLevel: 'Intermediate',
    tags: ['passing', 'control', 'weave'],
    description: 'A passing style that threads the arms through the legs to isolate the hips and redirect the knees.',
    relatedPositions: ['Open Guard', 'Half Guard Top']
  },
  {
    id: 'guard-passing-floating-passing',
    category: 'Guard Passing',
    subcategory: 'Passing Styles',
    name: 'Floating Passing',
    skillLevel: 'Advanced',
    tags: ['passing', 'mobility', 'balance'],
    description: 'A lighter passing style that uses precise weight transfer and movement to stay ahead of the next frame.',
    relatedPositions: ['Open Guard', 'North-South']
  },
  {
    id: 'guard-passing-stack-pass-style',
    category: 'Guard Passing',
    subcategory: 'Passing Styles',
    name: 'Stack Pass Style',
    skillLevel: 'Intermediate',
    tags: ['passing', 'pressure', 'stack'],
    description: 'A pass that compresses the lower body, folds the hips and uses posture control to break or clear the guard.',
    relatedPositions: ['Closed Guard', 'Open Guard', 'Stack Position']
  },
  {
    id: 'guard-passing-standing-passing',
    category: 'Guard Passing',
    subcategory: 'Passing Styles',
    name: 'Standing Passing',
    skillLevel: 'Beginner',
    tags: ['passing', 'standing', 'mobility'],
    description: 'A style of guard passing done primarily on the feet, using posture and movement to clear the legs from above.',
    relatedPositions: ['Standing', 'Open Guard']
  },
  {
    id: 'guard-passing-knee-cut',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Knee Cut',
    skillLevel: 'Beginner',
    tags: ['passing', 'knee slice', 'fundamental'],
    description: 'A fundamental pass that combines angle, upper-body control, and hip pressure to clear the legs.',
    relatedPositions: ['Headquarters', 'Half Guard Top']
  },
  {
    id: 'guard-passing-toreando-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Torreando Pass',
    skillLevel: 'Beginner',
    tags: ['passing', 'speed', 'outside'],
    description: 'A staple passing option that redirects the legs, wins angles, and races to control before the guard resets.',
    relatedPositions: ['Open Guard', 'Side Control']
  },
  {
    id: 'guard-passing-body-lock-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Body Lock Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'pressure', 'body lock'],
    description: 'A connected passing option that closes distance, removes mobility, and advances through layered pinning.',
    relatedPositions: ['Open Guard', 'Half Guard Top']
  },
  {
    id: 'guard-passing-leg-drag',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Leg Drag',
    skillLevel: 'Intermediate',
    tags: ['passing', 'pinning', 'angle'],
    description: 'A passing position and finish that redirects the legs across the center line and limits re-guarding options.',
    relatedPositions: ['Open Guard', 'Side Control', 'Back Takes']
  },
  {
    id: 'guard-passing-over-under-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Over-Under Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'pressure', 'pinning'],
    description: 'A pressure-based pass that stapled one leg while lifting the other to collapse mobility and turn the hips.',
    relatedPositions: ['Open Guard', 'Half Guard Top', 'Stack Position']
  },
  {
    id: 'guard-passing-long-step',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Long Step',
    skillLevel: 'Intermediate',
    tags: ['passing', 'mobility', 'angle'],
    description: 'A passing movement that uses long directional stepping to clear frames and land in dominant control.',
    relatedPositions: ['Open Guard', 'Side Control']
  },
  {
    id: 'guard-passing-smash-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Smash Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'pressure', 'smash'],
    description: 'A pass that folds the lower body and upper-body frames together before advancing into chest-to-chest control.',
    relatedPositions: ['Half Guard Top', 'Side Control']
  },
  {
    id: 'guard-passing-weave-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Weave Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'control', 'pressure'],
    description: 'A pass that threads through the legs to isolate the hips and turn the guard into a flatter control problem.',
    relatedPositions: ['Open Guard', 'Half Guard Top']
  },
  {
    id: 'guard-passing-double-under-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Double Under Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'pressure', 'stack'],
    description: 'A pressure pass that lifts both legs and stacks the hips to limit mobility before clearing around the guard.',
    relatedPositions: ['Closed Guard', 'Stack Position']
  },
  {
    id: 'guard-passing-folding-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Folding Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'pressure', 'folding'],
    description: 'A pass that collapses the knees toward the chest to weaken the guard structure before circling to control.',
    relatedPositions: ['Open Guard', 'Half Guard Top']
  },
  {
    id: 'guard-passing-x-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'X-Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'mobility', 'outside'],
    description: 'A directional pass that redirects the legs and cuts across the guard before the hips can turn back in.',
    relatedPositions: ['Open Guard', 'Side Control']
  },
  {
    id: 'guard-passing-side-smash-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Side Smash Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'pressure', 'smash'],
    description: 'A pass that flattens the guard from an angled side line and turns the knees away from stronger recovery.',
    relatedPositions: ['Half Guard Top', 'Side Control']
  },
  {
    id: 'guard-passing-knee-staple-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Knee Staple Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'control', 'pinning'],
    description: 'A pass that pins one leg to the mat with the knee while the upper body clears around the frame line.',
    relatedPositions: ['Open Guard', 'Leg Drag Position']
  },
  {
    id: 'guard-passing-backstep-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Backstep Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'mobility', 'backstep'],
    description: 'A passing movement that uses a backstep to clear entanglements and land behind the guard line.',
    relatedPositions: ['Half Guard Top', 'Reverse Half Guard Pass']
  },
  {
    id: 'guard-passing-windshield-wiper-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Windshield Wiper Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'mobility', 'legs'],
    description: 'A pass that uses leg switching and hip turns to free trapped lines and continue advancing position.',
    relatedPositions: ['Half Guard Top', 'Headquarters']
  },
  {
    id: 'guard-passing-shin-trap-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Shin Trap Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'control', 'shin trap'],
    description: 'A pass that traps the shin to slow guard recovery before the upper body turns the corner to control.',
    relatedPositions: ['Open Guard', 'Headquarters']
  },
  {
    id: 'guard-passing-split-squat-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Split Squat Pass',
    skillLevel: 'Advanced',
    tags: ['passing', 'base', 'pressure'],
    description: 'A passing posture that uses a wider split base to control distance and create a safer entry lane.',
    relatedPositions: ['Standing Passing', 'Open Guard']
  },
  {
    id: 'guard-passing-leg-pin-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Leg Pin Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'pinning', 'control'],
    description: 'A pass that pins one or both legs in place before the torso clears into dominant control.',
    relatedPositions: ['Open Guard', 'Leg Drag Position']
  },
  {
    id: 'guard-passing-float-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Float Pass',
    skillLevel: 'Advanced',
    tags: ['passing', 'mobility', 'floating'],
    description: 'A pass that uses precise weight shifts and movement to stay one step ahead of the next guard recovery.',
    relatedPositions: ['Open Guard', 'North-South']
  },
  {
    id: 'guard-passing-cartwheel-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Cartwheel Pass',
    skillLevel: 'Advanced',
    tags: ['passing', 'mobility', 'explosive'],
    description: 'A highly mobile pass that uses aerial angle change to beat the guard before the lower body can follow.',
    relatedPositions: ['Open Guard']
  },
  {
    id: 'guard-passing-hip-switch-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Hip Switch Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'pressure', 'hip switch'],
    description: 'A pass that changes hip direction and weight placement to flatten recovery and clear the legs.',
    relatedPositions: ['Half Guard Top', 'Side Control']
  },
  {
    id: 'guard-passing-north-south-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'North-South Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'control', 'north south'],
    description: 'A pass that circles all the way around the legs into north-south style control before the hips recover.',
    relatedPositions: ['North-South', 'Side Control']
  },
  {
    id: 'guard-passing-cross-knee-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Cross Knee Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'knee line', 'control'],
    description: 'A passing route that drives across the knee line to split the guard and flatten the hips.',
    relatedPositions: ['Headquarters', 'Half Guard Top']
  },
  {
    id: 'guard-passing-throw-by-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Throw-By Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'mobility', 'throw-by'],
    description: 'A pass that redirects the legs or frames past the center line before circling to control.',
    relatedPositions: ['Open Guard', 'Side Control']
  },
  {
    id: 'guard-passing-tripod-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Tripod Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'base', 'control'],
    description: 'A pass that uses a strong three-point base to pressure through the guard without losing balance.',
    relatedPositions: ['Open Guard', 'Half Guard Top']
  },
  {
    id: 'guard-passing-staple-pass-versus-de-la-riva',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Staple Pass Versus De La Riva',
    skillLevel: 'Intermediate',
    tags: ['passing', 'de la riva', 'staple'],
    description: 'A de la riva-specific pass that pins the hook and controls the hips before the guard can re-angle.',
    relatedPositions: ['De La Riva', 'Open Guard']
  },
  {
    id: 'guard-passing-backstep-versus-half-butterfly',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Backstep Versus Half Butterfly',
    skillLevel: 'Intermediate',
    tags: ['passing', 'half butterfly', 'backstep'],
    description: 'A half-butterfly passing response that backsteps over the hook and lands on the safer side of the hips.',
    relatedPositions: ['Half Butterfly', 'Half Guard']
  },
  {
    id: 'guard-passing-underhook-half-guard-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Underhook Half Guard Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'half guard', 'underhook'],
    description: 'A half-guard pass that wins the underhook and flattens the bottom player before clearing the knee line.',
    relatedPositions: ['Half Guard', 'Top Half Guard']
  },
  {
    id: 'guard-passing-reverse-half-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Reverse Half Guard Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'half guard', 'reverse'],
    description: 'A pass that clears reverse half-guard style entanglements by changing hip direction and angle.',
    relatedPositions: ['Half Guard', 'Reverse Half Guard']
  },
  {
    id: 'guard-passing-smash-knee-shield-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Smash Knee Shield Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'knee shield', 'pressure'],
    description: 'A pressure pass that collapses the knee shield and settles the upper body before clearing the legs.',
    relatedPositions: ['Knee Shield Half Guard', 'Half Guard']
  },
  {
    id: 'guard-passing-weave-to-mount',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Weave To Mount',
    skillLevel: 'Intermediate',
    tags: ['passing', 'mount', 'weave'],
    description: 'A weave-based pass that continues all the way into mount before the guard can recover underneath.',
    relatedPositions: ['Weave Pass', 'Mount']
  },
  {
    id: 'guard-passing-mount-off-knee-cut',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Mount Off Knee Cut',
    skillLevel: 'Intermediate',
    tags: ['passing', 'mount', 'knee cut'],
    description: 'A knee-cut finish that continues through the hips and chest line until mount becomes available.',
    relatedPositions: ['Knee Cut', 'Mount']
  },
  {
    id: 'guard-passing-pass-to-knee-on-belly',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Pass To Knee On Belly',
    skillLevel: 'Beginner',
    tags: ['passing', 'knee on belly', 'transition'],
    description: 'A passing finish that prefers mobility and quick control by landing in knee-on-belly instead of settling flat.',
    relatedPositions: ['Knee On Belly', 'Side Control']
  },
  {
    id: 'guard-passing-pass-from-turtle',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Pass From Turtle',
    skillLevel: 'Intermediate',
    tags: ['passing', 'turtle', 'front headlock'],
    description: 'A passing route that converts turtle or front-headlock control into cleaner side control or back exposure.',
    relatedPositions: ['Turtle', 'Front Headlock', 'Side Control']
  },
  {
    id: 'pins-crossface-underhook-control',
    category: 'Pins and Control',
    subcategory: 'Side Control',
    name: 'Crossface and Underhook Control',
    skillLevel: 'Beginner',
    tags: ['pinning', 'side control', 'pressure'],
    description: 'A strong side control control pattern that limits rotation and starts isolating the upper body.',
    relatedPositions: ['Side Control']
  },
  {
    id: 'pins-seatbelt',
    category: 'Pins and Control',
    subcategory: 'Back Control',
    name: 'Seatbelt',
    skillLevel: 'Beginner',
    tags: ['control', 'back control', 'connection'],
    description: 'The standard back-control connection that manages rotation and creates access to the choking side.',
    relatedPositions: ['Back Control']
  },
  {
    id: 'pins-chin-strap',
    category: 'Pins and Control',
    subcategory: 'Front Headlock',
    name: 'Chin Strap',
    skillLevel: 'Intermediate',
    tags: ['control', 'front headlock', 'hand fighting'],
    description: 'A high-value control grip that manages head position and starts front headlock chains safely.',
    relatedPositions: ['Front Headlock', 'Standing']
  },
  {
    id: 'pins-gift-wrap-from-mount',
    category: 'Pins and Control',
    subcategory: 'Mount',
    name: 'Gift Wrap From Mount',
    skillLevel: 'Intermediate',
    tags: ['control', 'mount', 'isolation'],
    description: 'An upper-body control that traps the arm across the face and opens strong transitions to the back or submissions.',
    relatedPositions: ['Mount', 'Back Control']
  },
  {
    id: 'pins-spiral-ride',
    category: 'Pins and Control',
    subcategory: 'Turtle Control',
    name: 'Spiral Ride',
    skillLevel: 'Intermediate',
    tags: ['control', 'turtle', 'ride'],
    description: 'A riding control that uses hip pressure and directional force to flatten the turtle and limit movement.',
    relatedPositions: ['Turtle', 'Back Takes']
  },
  {
    id: 'pins-body-triangle',
    category: 'Pins and Control',
    subcategory: 'Back Control',
    name: 'Body Triangle',
    skillLevel: 'Intermediate',
    tags: ['control', 'back control', 'pinning'],
    description: 'A back-control configuration that increases chest-to-back connection and makes turning escapes much harder.',
    relatedPositions: ['Back Control']
  },
  {
    id: 'pins-shoulder-of-justice',
    category: 'Pins and Control',
    subcategory: 'Side Control',
    name: 'Shoulder Of Justice',
    skillLevel: 'Intermediate',
    tags: ['control', 'side control', 'pressure'],
    description: 'A side-control pressure pattern that uses the shoulder line to break posture and weaken defensive frames.',
    relatedPositions: ['Side Control']
  },
  {
    id: 'back-takes-arm-drag-to-back',
    category: 'Back Takes',
    subcategory: null,
    name: 'Arm Drag To Back',
    skillLevel: 'Intermediate',
    tags: ['back take', 'arm drag', 'transition'],
    description: 'An entry that uses arm drag control to move behind the opponent and secure stronger positional advantage.',
    relatedPositions: ['Seated Guard', 'Standing']
  },
  {
    id: 'back-takes-berimbolo',
    category: 'Back Takes',
    subcategory: null,
    name: 'Berimbolo',
    skillLevel: 'Advanced',
    tags: ['back take', 'inversion', 'guard'],
    description: 'An inversion-based back take that uses leg entanglement and angle to expose and climb to the back.',
    relatedPositions: ['De La Riva', 'Reverse De La Riva']
  },
  {
    id: 'back-takes-chair-sit-back-take',
    category: 'Back Takes',
    subcategory: null,
    name: 'Chair Sit Back Take',
    skillLevel: 'Intermediate',
    tags: ['back take', 'transition', 'control'],
    description: 'A rotational movement that turns strong upper-body control into back exposure and cleaner connection.',
    relatedPositions: ['Mount', 'Technical Mount', 'Turtle']
  },
  {
    id: 'back-takes-gift-wrap-to-back',
    category: 'Back Takes',
    subcategory: null,
    name: 'Gift Wrap To Back',
    skillLevel: 'Intermediate',
    tags: ['back take', 'gift wrap', 'transition'],
    description: 'Using a gift-wrap style upper-body control to climb to the back while keeping the shoulders pinned.',
    relatedPositions: ['Mount', 'Side Control']
  },
  {
    id: 'back-takes-leg-drag-to-back',
    category: 'Back Takes',
    subcategory: null,
    name: 'Leg Drag To Back',
    skillLevel: 'Intermediate',
    tags: ['back take', 'passing', 'transition'],
    description: 'A passing-based back take that uses leg-drag control to expose the shoulders and climb behind the hips.',
    relatedPositions: ['Leg Drag', 'Back Control']
  },
  {
    id: 'back-takes-front-headlock-to-spin-behind',
    category: 'Back Takes',
    subcategory: null,
    name: 'Front Headlock To Spin Behind',
    skillLevel: 'Beginner',
    tags: ['back take', 'front headlock', 'transition'],
    description: 'A basic back-take route that uses front headlock control to circle behind before the opponent rebuilds posture.',
    relatedPositions: ['Front Headlock', 'Turtle']
  },
  {
    id: 'submissions-rear-naked-choke',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Rear Naked Choke',
    skillLevel: 'Beginner',
    tags: ['submission', 'choke', 'back control'],
    description: 'A core finishing attack from the back built on clean alignment, hand fighting, and shoulder control.',
    relatedPositions: ['Back Control']
  },
  {
    id: 'submissions-short-choke',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Short Choke',
    skillLevel: 'Intermediate',
    tags: ['submission', 'choke', 'back control'],
    description: 'A back-control finish that shortens the choking arc and punishes defensive hand positions.',
    relatedPositions: ['Back Control']
  },
  {
    id: 'submissions-bow-and-arrow-choke',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Bow And Arrow Choke',
    skillLevel: 'Intermediate',
    tags: ['submission', 'choke', 'back control'],
    description: 'A powerful gi choke from the back that stretches the upper body and sharpens the collar line.',
    relatedPositions: ['Back Control']
  },
  {
    id: 'submissions-cross-collar-choke',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Cross Collar Choke',
    skillLevel: 'Beginner',
    tags: ['submission', 'choke', 'gi'],
    description: 'A classic gi choke that uses deep collar alignment and structure more than speed or squeezing.',
    relatedPositions: ['Closed Guard', 'Mount']
  },
  {
    id: 'submissions-sliding-collar-choke',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Sliding Collar Choke',
    skillLevel: 'Intermediate',
    tags: ['submission', 'choke', 'gi'],
    description: 'A collar finish that sharpens as the forearm and lapel line slide into the neck while posture is pinned in place.',
    relatedPositions: ['Back Control', 'Mount', 'Closed Guard']
  },
  {
    id: 'submissions-loop-choke',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Loop Choke',
    skillLevel: 'Intermediate',
    tags: ['submission', 'choke', 'front headlock'],
    description: 'A gi choke that punishes forward posture and exposes the neck during standing or seated exchanges.',
    relatedPositions: ['Standing', 'Open Guard', 'Front Headlock']
  },
  {
    id: 'submissions-baseball-bat-choke',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Baseball Bat Choke',
    skillLevel: 'Intermediate',
    tags: ['submission', 'choke', 'gi'],
    description: 'A rotational collar choke that often becomes visible from side control or guard when the grips are set early.',
    relatedPositions: ['Side Control', 'Guard']
  },
  {
    id: 'submissions-ezekiel-choke',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Ezekiel Choke',
    skillLevel: 'Beginner',
    tags: ['submission', 'choke', 'mount'],
    description: 'A choke that uses one sleeve or forearm line across the neck while the other arm completes the frame.',
    relatedPositions: ['Mount', 'Closed Guard Top']
  },
  {
    id: 'submissions-guillotine',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Guillotine',
    skillLevel: 'Beginner',
    tags: ['submission', 'choke', 'front headlock'],
    description: 'A versatile front headlock submission that can appear from standing, guard, or scrambles.',
    relatedPositions: ['Front Headlock', 'Closed Guard', 'Standing']
  },
  {
    id: 'submissions-high-elbow-guillotine',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'High Elbow Guillotine',
    skillLevel: 'Advanced',
    tags: ['submission', 'choke', 'guillotine'],
    description: 'A tighter guillotine variation that raises the elbow line to sharpen the finish and limit posture escape.',
    relatedPositions: ['Front Headlock', 'Closed Guard']
  },
  {
    id: 'submissions-arm-in-guillotine',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Arm-In Guillotine',
    skillLevel: 'Intermediate',
    tags: ['submission', 'choke', 'guillotine'],
    description: 'A guillotine variation that traps the arm inside the structure and changes the angle of pressure around the neck.',
    relatedPositions: ['Front Headlock', 'Half Guard']
  },
  {
    id: 'submissions-marcelotine',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Marcelotine',
    skillLevel: 'Advanced',
    tags: ['submission', 'choke', 'guillotine'],
    description: 'A marcelotine-style guillotine that relies on a high wrist line and fast shoulder connection to shut down posture.',
    relatedPositions: ['Front Headlock', 'Standing']
  },
  {
    id: 'submissions-anaconda-choke',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Anaconda Choke',
    skillLevel: 'Intermediate',
    tags: ['submission', 'choke', 'front headlock'],
    description: 'A rolling front-headlock choke that traps the arm and turns the shoulder line into the neck.',
    relatedPositions: ['Front Headlock', 'Turtle']
  },
  {
    id: 'submissions-darce-choke',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: "D'Arce Choke",
    skillLevel: 'Intermediate',
    tags: ['submission', 'choke', 'front headlock'],
    description: 'A long-arm head-and-arm choke that appears from front headlock control, half guard, and passing scrambles.',
    relatedPositions: ['Front Headlock', 'Half Guard Top']
  },
  {
    id: 'submissions-japanese-necktie',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Japanese Necktie',
    skillLevel: 'Advanced',
    tags: ['submission', 'choke', 'front headlock'],
    description: 'A front-headlock submission that turns the shoulder and neck into a tighter finishing wedge.',
    relatedPositions: ['Front Headlock']
  },
  {
    id: 'submissions-peruvian-necktie',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Peruvian Necktie',
    skillLevel: 'Advanced',
    tags: ['submission', 'choke', 'front headlock'],
    description: 'A front-headlock finish that uses the leg and shoulder line to stretch the upper body into the choke.',
    relatedPositions: ['Front Headlock', 'Turtle']
  },
  {
    id: 'submissions-north-south-choke',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'North-South Choke',
    skillLevel: 'Advanced',
    tags: ['submission', 'choke', 'north south'],
    description: 'A chest-and-lat based choke from north-south that depends on angle, shoulder drop, and tight connection.',
    relatedPositions: ['North-South']
  },
  {
    id: 'submissions-kimura',
    category: 'Submissions',
    subcategory: 'Arm Locks',
    name: 'Kimura',
    skillLevel: 'Beginner',
    tags: ['submission', 'shoulder lock', 'control'],
    description: 'A powerful upper-body attack that also serves as a control system for sweeps, back takes, and transitions.',
    relatedPositions: ['Closed Guard', 'Side Control', 'Half Guard']
  },
  {
    id: 'submissions-straight-armbar-from-mount',
    category: 'Submissions',
    subcategory: 'Arm Locks',
    name: 'Straight Armbar From Mount',
    skillLevel: 'Beginner',
    tags: ['submission', 'armbar', 'mount'],
    description: 'A staple mount submission that isolates the elbow line before the hips rotate into a tighter breaking angle.',
    relatedPositions: ['Mount', 'S-Mount']
  },
  {
    id: 'submissions-straight-armbar-from-side-control',
    category: 'Submissions',
    subcategory: 'Arm Locks',
    name: 'Straight Armbar From Side Control',
    skillLevel: 'Intermediate',
    tags: ['submission', 'armbar', 'side control'],
    description: 'An armbar variation from side control that turns chest-to-chest pinning into a cleaner upper-body isolation.',
    relatedPositions: ['Side Control']
  },
  {
    id: 'submissions-belly-down-armbar',
    category: 'Submissions',
    subcategory: 'Arm Locks',
    name: 'Belly-Down Armbar',
    skillLevel: 'Intermediate',
    tags: ['submission', 'armbar', 'rotation'],
    description: 'A stronger finishing angle on the armbar that rotates the torso downward to increase control and extension.',
    relatedPositions: ['Armbar', 'Mount']
  },
  {
    id: 'submissions-triangle-choke',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Triangle Choke',
    skillLevel: 'Beginner',
    tags: ['submission', 'choke', 'guard'],
    description: 'A classic lower-body choke built on angle, posture control, and isolating the correct shoulder line.',
    relatedPositions: ['Closed Guard', 'Open Guard', 'Mount']
  },
  {
    id: 'submissions-teepee-choke',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Teepee Choke',
    skillLevel: 'Intermediate',
    tags: ['submission', 'choke', 'guard'],
    description: 'A triangle-style variation that clamps the knees together to tighten the finish when the standard lock is less available.',
    relatedPositions: ['Closed Guard', 'Open Guard']
  },
  {
    id: 'submissions-straight-armbar-from-guard',
    category: 'Submissions',
    subcategory: 'Arm Locks',
    name: 'Straight Armbar From Guard',
    skillLevel: 'Beginner',
    tags: ['submission', 'armbar', 'guard'],
    description: 'A staple guard submission that depends on angle, posture breaking, and strong leg positioning around the shoulder.',
    relatedPositions: ['Closed Guard']
  },
  {
    id: 'submissions-americana',
    category: 'Submissions',
    subcategory: 'Arm Locks',
    name: 'Americana',
    skillLevel: 'Beginner',
    tags: ['submission', 'shoulder lock', 'top game'],
    description: 'A classic top-position shoulder lock that builds on wrist control, elbow isolation, and heavy pinning.',
    relatedPositions: ['Side Control', 'Mount']
  },
  {
    id: 'submissions-straight-armlock',
    category: 'Submissions',
    subcategory: 'Arm Locks',
    name: 'Straight Armlock',
    skillLevel: 'Intermediate',
    tags: ['submission', 'arm lock', 'extension'],
    description: 'A straight-line upper-body submission that extends the arm without requiring a full classic armbar structure.',
    relatedPositions: ['Side Control', 'Mount']
  },
  {
    id: 'submissions-wrist-lock',
    category: 'Submissions',
    subcategory: 'Arm Locks',
    name: 'Wrist Lock',
    skillLevel: 'Advanced',
    tags: ['submission', 'wrist lock', 'control'],
    description: 'A tight submission that uses small-angle joint pressure when posture, grips, or framing hands are exposed.',
    relatedPositions: ['Mount', 'Back Control', 'Side Control']
  },
  {
    id: 'submissions-tarikoplata',
    category: 'Submissions',
    subcategory: 'Arm Locks',
    name: 'Tarikoplata',
    skillLevel: 'Advanced',
    tags: ['submission', 'shoulder lock', 'kimura trap'],
    description: 'A shoulder-lock variation that builds off kimura-style control while turning the angle into a tighter entanglement.',
    relatedPositions: ['Kimura Trap', 'Closed Guard']
  },
  {
    id: 'submissions-baratoplata',
    category: 'Submissions',
    subcategory: 'Arm Locks',
    name: 'Baratoplata',
    skillLevel: 'Advanced',
    tags: ['submission', 'shoulder lock', 'guard'],
    description: 'A shoulder attack that traps the arm and rotates the torso to create a tighter finishing line from upper-body entanglements.',
    relatedPositions: ['Closed Guard', 'Omoplata']
  },
  {
    id: 'submissions-monoplata',
    category: 'Submissions',
    subcategory: 'Arm Locks',
    name: 'Monoplata',
    skillLevel: 'Advanced',
    tags: ['submission', 'shoulder lock', 'guard'],
    description: 'A shoulder-lock variation that threads the arm and torso into a compact finishing structure when the shoulder line is exposed.',
    relatedPositions: ['Closed Guard', 'Mount']
  },
  {
    id: 'submissions-arm-triangle',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Arm Triangle',
    skillLevel: 'Intermediate',
    tags: ['submission', 'choke', 'pinning'],
    description: 'A shoulder-and-arm based choke that develops from strong upper-body pinning and head positioning.',
    relatedPositions: ['Mount', 'Side Control']
  },
  {
    id: 'submissions-mounted-triangle',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Mounted Triangle',
    skillLevel: 'Intermediate',
    tags: ['submission', 'choke', 'mount'],
    description: 'A triangle variation from mount that isolates the shoulder and traps the upper body from a dominant top line.',
    relatedPositions: ['Mount', 'S-Mount']
  },
  {
    id: 'submissions-reverse-triangle',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Reverse Triangle',
    skillLevel: 'Advanced',
    tags: ['submission', 'choke', 'leg entanglement'],
    description: 'A triangle variation that turns the locking angle around the far shoulder and neck from less common directions.',
    relatedPositions: ['Back Control', 'North-South']
  },
  {
    id: 'submissions-gogoplata',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Gogoplata',
    skillLevel: 'Advanced',
    tags: ['submission', 'choke', 'guard'],
    description: 'A shin-based choke from guard that depends on posture control, angle, and keeping the opponent folded into the frame.',
    relatedPositions: ['Closed Guard', 'Rubber Guard']
  },
  {
    id: 'submissions-von-flue-choke',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Von Flue Choke',
    skillLevel: 'Intermediate',
    tags: ['submission', 'choke', 'side control'],
    description: 'A top-position counter choke that punishes lingering guillotine grips by driving shoulder pressure into the neck.',
    relatedPositions: ['Side Control']
  },
  {
    id: 'submissions-no-gi-ezekiel',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'No-Gi Ezekiel',
    skillLevel: 'Intermediate',
    tags: ['submission', 'choke', 'mount'],
    description: 'A no-gi adaptation of the Ezekiel that uses forearm structure and tight shoulder alignment instead of sleeve control.',
    relatedPositions: ['Mount', 'Closed Guard Top']
  },
  {
    id: 'submissions-punch-choke',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Punch Choke',
    skillLevel: 'Intermediate',
    tags: ['submission', 'choke', 'mount'],
    description: 'A compact top-position choke that drives the knuckles or forearm line into the neck while the upper body stays pinned.',
    relatedPositions: ['Mount']
  },
  {
    id: 'submissions-straight-ankle-lock',
    category: 'Submissions',
    subcategory: 'Leg Locks',
    name: 'Straight Ankle Lock',
    skillLevel: 'Beginner',
    tags: ['submission', 'leg lock', 'ashi'],
    description: 'A foundational lower-body submission that teaches alignment, control, and clean finishing mechanics.',
    relatedPositions: ['Single-Leg X', 'Ashi Garami']
  },
  {
    id: 'submissions-heel-hook',
    category: 'Submissions',
    subcategory: 'Leg Locks',
    name: 'Heel Hook',
    skillLevel: 'Advanced',
    tags: ['submission', 'leg lock', 'rotation'],
    description: 'A high-consequence leg submission that depends on controlling the knee line before rotational pressure is applied.',
    relatedPositions: ['Saddle', '50/50', 'Ashi Garami']
  },
  {
    id: 'submissions-toe-hold',
    category: 'Submissions',
    subcategory: 'Leg Locks',
    name: 'Toe Hold',
    skillLevel: 'Intermediate',
    tags: ['submission', 'leg lock', 'rotation'],
    description: 'A rotational foot lock that often appears during transitions when the heel line is exposed.',
    relatedPositions: ['50/50', 'Ashi Garami', 'Saddle']
  },
  {
    id: 'submissions-kneebar',
    category: 'Submissions',
    subcategory: 'Leg Locks',
    name: 'Kneebar',
    skillLevel: 'Intermediate',
    tags: ['submission', 'leg lock', 'extension'],
    description: 'A straight-line lower-body attack that extends the knee when the hips and knee line are tightly controlled.',
    relatedPositions: ['Saddle', 'Top Half Guard']
  },
  {
    id: 'submissions-aoki-lock',
    category: 'Submissions',
    subcategory: 'Leg Locks',
    name: 'Aoki Lock',
    skillLevel: 'Advanced',
    tags: ['submission', 'leg lock', 'ankle lock'],
    description: 'A twisting ankle lock variation that blends straight ankle lock structure with rotational pressure when the foot line is exposed.',
    relatedPositions: ['Ashi Garami', 'Single-Leg X']
  },
  {
    id: 'submissions-paper-cutter-choke',
    category: 'Submissions',
    subcategory: 'Chokes',
    name: 'Paper Cutter Choke',
    skillLevel: 'Intermediate',
    tags: ['submission', 'choke', 'side control'],
    description: 'A chest-to-chest choke that combines lapel pressure and shoulder control from dominant top pinning.',
    relatedPositions: ['Side Control']
  },
  {
    id: 'submissions-omoplata',
    category: 'Submissions',
    subcategory: 'Arm Locks',
    name: 'Omoplata',
    skillLevel: 'Intermediate',
    tags: ['submission', 'shoulder lock', 'guard'],
    description: 'A shoulder attack from guard that also creates strong sweep and top-position transitions when defended.',
    relatedPositions: ['Closed Guard', 'Open Guard']
  },
  {
    id: 'submission-defense-armbar-hitchhiker',
    category: 'Submission Defense',
    subcategory: 'Armbar Defense',
    name: 'Armbar Hitchhiker',
    skillLevel: 'Intermediate',
    tags: ['submission defense', 'armbar', 'escape'],
    description: 'A directional armbar escape that depends on turning the thumb line and moving to the safe side.',
    relatedPositions: ['Armbar Defense']
  },
  {
    id: 'submission-defense-armbar-stacking-defense',
    category: 'Submission Defense',
    subcategory: 'Armbar Defense',
    name: 'Armbar Stacking Defense',
    skillLevel: 'Intermediate',
    tags: ['submission defense', 'armbar', 'stacking'],
    description: 'A defensive response that uses posture, shoulder pressure, and angle denial to relieve the breaking line before separating the legs.',
    relatedPositions: ['Closed Guard', 'Armbar Defense']
  },
  {
    id: 'submission-defense-triangle-posture-escape',
    category: 'Submission Defense',
    subcategory: 'Triangle Defense',
    name: 'Triangle Posture Escape',
    skillLevel: 'Beginner',
    tags: ['submission defense', 'triangle', 'posture'],
    description: 'A triangle escape focused on rebuilding posture and breaking the legs apart.',
    relatedPositions: ['Closed Guard']
  },
  {
    id: 'submission-defense-triangle-hand-fight-angle-kill',
    category: 'Submission Defense',
    subcategory: 'Triangle Defense',
    name: 'Triangle Escape With Hand Fighting/Angles',
    skillLevel: 'Intermediate',
    tags: ['submission defense', 'triangle', 'hand fighting'],
    description: 'A triangle defense that hand fights the setup picking a side with your elbow to cut an angle to separate the legs and make the triangle harder to lock.',
    relatedPositions: ['Closed Guard', 'Open Guard']
  },
  {
    id: 'submission-defense-kimura-roll-defense',
    category: 'Submission Defense',
    subcategory: 'Shoulder Lock Defense',
    name: 'Kimura Roll Defense',
    skillLevel: 'Intermediate',
    tags: ['submission defense', 'kimura', 'shoulder lock'],
    description: 'A defense that addresses the kimura grip before the rolling finish develops by reclaiming posture and clearing the elbow line.',
    relatedPositions: ['Closed Guard', 'Half Guard', 'Kimura Trap']
  },
  {
    id: 'submission-defense-guillotine-hand-fight',
    category: 'Submission Defense',
    subcategory: 'Guillotine Defense',
    name: 'Guillotine Hand Fight And Shoulder Pressure Defense',
    skillLevel: 'Intermediate',
    tags: ['submission defense', 'guillotine', 'front headlock'],
    description: 'A layered defense that combines early hand fighting, posture correction, and smart shoulder pressure.',
    relatedPositions: ['Standing', 'Front Headlock', 'Half Guard Top']
  },
  {
    id: 'submission-defense-rear-naked-choke-hand-peel',
    category: 'Submission Defense',
    subcategory: 'Back Control Defense',
    name: 'Rear Naked Choke Hand Peel Defense',
    skillLevel: 'Beginner',
    tags: ['submission defense', 'back control', 'hand fighting'],
    description: 'An early back-defense priority that focuses on peeling the finishing hand before the choke fully locks.',
    relatedPositions: ['Back Control']
  },
  {
    id: 'submission-defense-bow-and-arrow-hand-fight',
    category: 'Submission Defense',
    subcategory: 'Back Control Defense',
    name: 'Bow And Arrow Choke Hand Fight Defense',
    skillLevel: 'Intermediate',
    tags: ['submission defense', 'back control', 'gi choke'],
    description: 'A defensive sequence that focuses on hand fighting, collar relief, and hip alignment before the stretching angle becomes too strong.',
    relatedPositions: ['Back Control']
  },
  {
    id: 'submission-defense-americana-defense',
    category: 'Submission Defense',
    subcategory: 'Shoulder Lock Defense',
    name: 'Americana Defense',
    skillLevel: 'Beginner',
    tags: ['submission defense', 'shoulder lock', 'frames'],
    description: 'A defense that prioritizes elbow positioning, frame recovery, and denying the angle needed to finish.',
    relatedPositions: ['Side Control', 'Mount']
  },
  {
    id: 'submission-defense-straight-ankle-lock-boot-defense',
    category: 'Submission Defense',
    subcategory: 'Leg Lock Defense',
    name: 'Straight Ankle Lock Boot Defense',
    skillLevel: 'Beginner',
    tags: ['submission defense', 'straight ankle lock', 'leg lock'],
    description: 'A foundational defense that stiffens the foot line, manages hip distance, and helps buy time to clear the knee line.',
    relatedPositions: ['Ashi Garami', 'Single-Leg X']
  },
  {
    id: 'submission-defense-heel-hook-line-escape',
    category: 'Submission Defense',
    subcategory: 'Leg Lock Defense',
    name: 'Heel Hook Line Escape',
    skillLevel: 'Advanced',
    tags: ['submission defense', 'heel hook', 'leg lock'],
    description: 'A defensive response that clears the knee line and turns the hips before the rotational finish is fully connected.',
    relatedPositions: ['Saddle', '50/50', 'Cross Ashi']
  },
  {
    id: 'submission-defense-kneebar-turn-defense',
    category: 'Submission Defense',
    subcategory: 'Leg Lock Defense',
    name: 'Kneebar Turn Defense',
    skillLevel: 'Intermediate',
    tags: ['submission defense', 'kneebar', 'leg lock'],
    description: 'A kneebar defense that turns the hips and knee line into a safer angle before the extension is fully locked in.',
    relatedPositions: ['Saddle', 'Top Half Guard']
  },
  {
    id: 'submission-defense-omoplata-forward-roll-escape',
    category: 'Submission Defense',
    subcategory: 'Shoulder Lock Defense',
    name: 'Omoplata Forward Roll Escape',
    skillLevel: 'Intermediate',
    tags: ['submission defense', 'omoplata', 'shoulder lock'],
    description: 'A response to the omoplata that uses a forward roll or angle change to relieve shoulder pressure and recover base.',
    relatedPositions: ['Closed Guard', 'Open Guard']
  },
  {
    id: 'submission-defense-ezekiel-posture-defense',
    category: 'Submission Defense',
    subcategory: 'Choke Defense',
    name: 'Ezekiel Posture Defense',
    skillLevel: 'Beginner',
    tags: ['submission defense', 'ezekiel', 'choke'],
    description: 'A defense that restores posture, protects the neck line, and addresses the choking arm before the frame tightens.',
    relatedPositions: ['Mount', 'Closed Guard Top']
  },
  {
    id: 'leg-locks-straight-ankle-lock',
    category: 'Leg Locks',
    subcategory: null,
    name: 'Straight Ankle Lock',
    skillLevel: 'Beginner',
    tags: ['leg lock', 'submission', 'ashi'],
    description: 'A foundational leg lock that teaches alignment, control, and finishing mechanics from standard ashi positions.',
    relatedPositions: ['Ashi Garami', 'Single-Leg X']
  },
  {
    id: 'leg-locks-heel-hook',
    category: 'Leg Locks',
    subcategory: null,
    name: 'Heel Hook',
    skillLevel: 'Advanced',
    tags: ['leg lock', 'submission', 'rotation'],
    description: 'A high-consequence leg attack that depends on strong control of the knee line and rotational breaking mechanics.',
    relatedPositions: ['Saddle', '50/50', 'Cross Ashi']
  },
  {
    id: 'leg-locks-aoki-lock',
    category: 'Leg Locks',
    subcategory: null,
    name: 'Aoki Lock',
    skillLevel: 'Advanced',
    tags: ['leg lock', 'submission', 'ankle lock'],
    description: 'A rotational variation off the straight ankle lock family that punishes turning and loose foot position.',
    relatedPositions: ['Single-Leg X', 'Ashi Garami']
  },
  {
    id: 'leg-locks-toe-hold',
    category: 'Leg Locks',
    subcategory: null,
    name: 'Toe Hold',
    skillLevel: 'Intermediate',
    tags: ['leg lock', 'submission', 'rotation'],
    description: 'A rotational foot lock that often appears during transitions when the knee line and heel are already exposed.',
    relatedPositions: ['50/50', 'Ashi Garami', 'Saddle']
  },
  {
    id: 'leg-locks-kneebar',
    category: 'Leg Locks',
    subcategory: null,
    name: 'Kneebar',
    skillLevel: 'Intermediate',
    tags: ['leg lock', 'submission', 'extension'],
    description: 'A straight-line leg attack that depends on knee-line control, hip placement, and tight finishing alignment.',
    relatedPositions: ['Saddle', 'Backstep Entries', 'Top Half Guard']
  },
  {
    id: 'leg-locks-estima-lock',
    category: 'Leg Locks',
    subcategory: null,
    name: 'Estima Lock',
    skillLevel: 'Advanced',
    tags: ['leg lock', 'submission', 'ankle'],
    description: 'A lower-body attack that punishes specific rotational reactions and exposed foot lines during transitions.',
    relatedPositions: ['Straight Ankle Lock', 'Ashi Garami']
  },
  {
    id: 'turtle-scrambles-building-base',
    category: 'Turtle and Scrambles',
    subcategory: null,
    name: 'Building Base',
    skillLevel: 'Beginner',
    tags: ['turtle', 'scramble', 'base'],
    description: 'A core recovery skill for getting back to a stronger structure before standing, wrestling up, or re-guarding.',
    relatedPositions: ['Turtle', 'Standing']
  },
  {
    id: 'turtle-scrambles-wrestling-up',
    category: 'Turtle and Scrambles',
    subcategory: null,
    name: 'Wrestling Up',
    skillLevel: 'Intermediate',
    tags: ['scramble', 'wrestle-up', 'transition'],
    description: 'A transition from bottom or neutralizing positions into a more proactive attacking or standing exchange.',
    relatedPositions: ['Seated Guard', 'Half Guard', 'Turtle']
  },
  {
    id: 'turtle-scrambles-quadpod',
    category: 'Turtle and Scrambles',
    subcategory: null,
    name: 'Quadpod',
    skillLevel: 'Intermediate',
    tags: ['turtle', 'scramble', 'base'],
    description: 'A turtle recovery posture that helps rebuild structure and set up stand-ups or movement reactions.',
    relatedPositions: ['Turtle']
  },
  {
    id: 'turtle-scrambles-hand-fighting-from-turtle',
    category: 'Turtle and Scrambles',
    subcategory: null,
    name: 'Hand Fighting From Turtle',
    skillLevel: 'Beginner',
    tags: ['turtle', 'scramble', 'hand fighting'],
    description: 'Using wrist control, elbow awareness, and shoulder positioning to deny easy breakdowns or back takes.',
    relatedPositions: ['Turtle', 'Front Headlock']
  },
  {
    id: 'turtle-scrambles-rolling-through',
    category: 'Turtle and Scrambles',
    subcategory: null,
    name: 'Rolling Through',
    skillLevel: 'Intermediate',
    tags: ['turtle', 'scramble', 'movement'],
    description: 'A recovery and escape skill that uses rolling momentum to avoid static breakdowns and recover a safer line.',
    relatedPositions: ['Turtle', 'Granby Roll']
  },
  {
    id: 'turtle-scrambles-turtle-retention',
    category: 'Turtle and Scrambles',
    subcategory: null,
    name: 'Turtle Retention',
    skillLevel: 'Intermediate',
    tags: ['turtle', 'retention', 'scramble'],
    description: 'Maintaining safe turtle structure long enough to stand, recover guard, or hand fight into a better exchange.',
    relatedPositions: ['Turtle']
  },
  {
    id: 'turtle-scrambles-back-exposure-awareness',
    category: 'Turtle and Scrambles',
    subcategory: null,
    name: 'Back Exposure Awareness',
    skillLevel: 'Intermediate',
    tags: ['turtle', 'scramble', 'awareness'],
    description: 'Recognizing when the shoulders and hips are drifting into a dangerous line before the back is fully lost.',
    relatedPositions: ['Turtle', 'Standing']
  },
  {
    id: 'turtle-scrambles-turtle-to-single-leg',
    category: 'Turtle and Scrambles',
    subcategory: null,
    name: 'Turtle To Single Leg',
    skillLevel: 'Intermediate',
    tags: ['turtle', 'scramble', 'single leg'],
    description: 'A wrestle-up pathway that turns turtle recovery into an attacking single-leg entry before top pressure settles in.',
    relatedPositions: ['Turtle', 'Standing']
  },
  {
    id: 'turtle-scrambles-turtle-to-leg-entanglement',
    category: 'Turtle and Scrambles',
    subcategory: null,
    name: 'Turtle To Leg Entanglement',
    skillLevel: 'Advanced',
    tags: ['turtle', 'scramble', 'leg entanglement'],
    description: 'A scramble route that inverts or turns underneath from turtle to catch the legs before control is fully established.',
    relatedPositions: ['Turtle', 'Ashi Garami', 'Single-Leg X']
  },
  {
    id: 'turtle-scrambles-scramble-recognition',
    category: 'Turtle and Scrambles',
    subcategory: null,
    name: 'Scramble Recognition',
    skillLevel: 'Intermediate',
    tags: ['scramble', 'awareness', 'decision making'],
    description: 'Recognizing transitional windows quickly so the next movement becomes proactive instead of reactive and late.',
    relatedPositions: ['Turtle', 'Standing', 'Half Guard']
  },
  {
    id: 'turtle-scrambles-re-guarding-during-scrambles',
    category: 'Turtle and Scrambles',
    subcategory: null,
    name: 'Re-Guarding During Scrambles',
    skillLevel: 'Intermediate',
    tags: ['scramble', 'guard recovery', 'retention'],
    description: 'A scramble skill that prioritizes getting the knees, hooks, or shins back inside before the top player settles control.',
    relatedPositions: ['Turtle', 'Open Guard', 'Half Guard']
  },
  {
    id: 'self-defense-clinch-safely',
    category: 'Self-Defense Basics',
    subcategory: null,
    name: 'Clinch Safely',
    skillLevel: 'Beginner',
    tags: ['self-defense', 'standing', 'safety'],
    description: 'Entering or managing a clinch in a way that protects posture, head position, and immediate defensive awareness.',
    relatedPositions: ['Standing', 'Clinch']
  },
  {
    id: 'self-defense-getting-up-safely',
    category: 'Self-Defense Basics',
    subcategory: null,
    name: 'Getting Up From The Ground Safely',
    skillLevel: 'Beginner',
    tags: ['self-defense', 'movement', 'distance'],
    description: 'Combining base, framing, and technical stand-up mechanics to return to the feet while staying protected.',
    relatedPositions: ['Standing', 'Ground Recovery']
  },
  {
    id: 'self-defense-basic-takedown-to-top',
    category: 'Self-Defense Basics',
    subcategory: null,
    name: 'Basic Takedown To Top',
    skillLevel: 'Beginner',
    tags: ['self-defense', 'takedown', 'top control'],
    description: 'A practical takedown pathway that emphasizes safe entry, balance, and ending on top in a stable position.',
    relatedPositions: ['Standing', 'Top Position']
  },
  {
    id: 'self-defense-mount-survival',
    category: 'Self-Defense Basics',
    subcategory: null,
    name: 'Mount Survival',
    skillLevel: 'Beginner',
    tags: ['self-defense', 'mount', 'defense'],
    description: 'A survival-first approach to mount that prioritizes posture protection, frames, and staying calm enough to recover.',
    relatedPositions: ['Mount Defense']
  },
  {
    id: 'self-defense-side-control-survival',
    category: 'Self-Defense Basics',
    subcategory: null,
    name: 'Side Control Survival',
    skillLevel: 'Beginner',
    tags: ['self-defense', 'side control', 'defense'],
    description: 'A foundational response to bottom side control that focuses on framing, neck safety, and building space to recover.',
    relatedPositions: ['Side Control Defense']
  },
  {
    id: 'self-defense-headlock-escape',
    category: 'Self-Defense Basics',
    subcategory: null,
    name: 'Headlock Escape',
    skillLevel: 'Beginner',
    tags: ['self-defense', 'headlock', 'escape'],
    description: 'A defensive sequence for reducing neck danger, regaining posture, and escaping a basic standing or grounded headlock.',
    relatedPositions: ['Standing', 'Front Headlock']
  },
  {
    id: 'self-defense-standing-guillotine-awareness',
    category: 'Self-Defense Basics',
    subcategory: null,
    name: 'Standing Guillotine Awareness',
    skillLevel: 'Beginner',
    tags: ['self-defense', 'guillotine', 'awareness'],
    description: 'Recognizing when neck position and level changes expose the head to quick front-headlock attacks while standing.',
    relatedPositions: ['Standing', 'Front Headlock']
  },
  {
    id: 'self-defense-punch-protection-posture',
    category: 'Self-Defense Basics',
    subcategory: null,
    name: 'Punch Protection Posture',
    skillLevel: 'Beginner',
    tags: ['self-defense', 'posture', 'safety'],
    description: 'A posture principle for protecting the head and maintaining structure when strikes are part of the context.',
    relatedPositions: ['Standing', 'Closed Guard Bottom']
  },
  {
    id: 'self-defense-closed-guard-posture-control',
    category: 'Self-Defense Basics',
    subcategory: null,
    name: 'Closed Guard Posture Control',
    skillLevel: 'Beginner',
    tags: ['self-defense', 'closed guard', 'posture'],
    description: 'Managing posture inside closed guard so balance, safety, and the ability to disengage or pass stay intact.',
    relatedPositions: ['Closed Guard Top']
  },
  {
    id: 'self-defense-wall-standing',
    category: 'Self-Defense Basics',
    subcategory: null,
    name: 'Wall Standing',
    skillLevel: 'Intermediate',
    tags: ['self-defense', 'wall work', 'recovery'],
    description: 'Using a wall or barrier to recover to standing with better balance and less exposure during the transition.',
    relatedPositions: ['Standing', 'Ground Recovery']
  },
  {
    id: 'self-defense-escaping-pins-under-strikes',
    category: 'Self-Defense Basics',
    subcategory: null,
    name: 'Escaping Pins Under Strikes',
    skillLevel: 'Intermediate',
    tags: ['self-defense', 'pins', 'defense'],
    description: 'A defensive mindset for escaping top pressure while keeping immediate head protection and posture awareness in place.',
    relatedPositions: ['Mount Defense', 'Side Control Defense']
  },
  {
    id: 'drills-pummeling',
    category: 'Drills',
    subcategory: null,
    name: 'Pummeling',
    skillLevel: 'Beginner',
    tags: ['drill', 'underhooks', 'standing'],
    description: 'A foundational drill for learning inside position, posture, and sensitivity in upper-body exchanges.',
    relatedPositions: ['Standing', 'Clinch']
  },
  {
    id: 'drills-breakfalls',
    category: 'Drills',
    subcategory: null,
    name: 'Breakfalls',
    skillLevel: 'Beginner',
    tags: ['drill', 'safety', 'movement'],
    description: 'A foundational safety drill for learning how to absorb contact with the mat while protecting posture and alignment.',
    relatedPositions: ['Standing', 'Takedowns']
  },
  {
    id: 'drills-technical-stand-up-reps',
    category: 'Drills',
    subcategory: null,
    name: 'Technical Stand-Up Reps',
    skillLevel: 'Beginner',
    tags: ['drill', 'movement', 'recovery'],
    description: 'Repetition focused on standing safely with base, posture, and defensive awareness still intact.',
    relatedPositions: ['Standing', 'Ground Recovery']
  },
  {
    id: 'drills-shrimping-lines',
    category: 'Drills',
    subcategory: null,
    name: 'Shrimping Lines',
    skillLevel: 'Beginner',
    tags: ['drill', 'movement', 'hip escape'],
    description: 'A movement drill that builds cleaner hip escapes for guard recovery, space creation, and defensive movement.',
    relatedPositions: ['Guard Retention', 'Mount Defense', 'Side Control Defense']
  },
  {
    id: 'drills-bridging-reps',
    category: 'Drills',
    subcategory: null,
    name: 'Bridging Reps',
    skillLevel: 'Beginner',
    tags: ['drill', 'movement', 'escapes'],
    description: 'A core movement drill for generating elevation, off-balancing pressure, and stronger escape reactions.',
    relatedPositions: ['Mount Defense', 'Side Control Defense']
  },
  {
    id: 'drills-guard-retention-rounds',
    category: 'Constraint-Led Games',
    subcategory: null,
    name: 'Guard Retention Rounds',
    skillLevel: 'Intermediate',
    tags: ['drill', 'guard retention', 'timing'],
    description: 'Focused rounds built around recovering frames, hooks, and angle before the pass fully settles.',
    relatedPositions: ['Open Guard', 'Half Guard']
  },
  {
    id: 'drills-positional-isolation-rounds',
    category: 'Constraint-Led Games',
    subcategory: null,
    name: 'Positional Isolation Rounds',
    skillLevel: 'Intermediate',
    tags: ['drill', 'positional sparring', 'repetition'],
    description: 'Short rounds that isolate one exchange so students can learn the feel and decisions of that position more clearly.',
    relatedPositions: ['Mount', 'Half Guard', 'Back Control']
  },
  {
    id: 'drills-constraint-led-games',
    category: 'Constraint-Led Games',
    subcategory: null,
    name: 'Constraint-Led Games',
    skillLevel: 'Advanced',
    tags: ['drill', 'ecological', 'decision making'],
    description: 'Game-like rounds built around constraints that guide better movement, timing, and problem solving.',
    relatedPositions: []
  },
  {
    id: 'drills-positional-sparring-systems',
    category: 'Constraint-Led Games',
    subcategory: null,
    name: 'Positional Sparring Systems',
    skillLevel: 'Intermediate',
    tags: ['drill', 'positional sparring', 'structure'],
    description: 'Structured rounds that isolate one exchange so students can build pattern recognition through repetition.',
    relatedPositions: []
  },
  {
    id: 'drills-hand-fight-specific-rounds',
    category: 'Constraint-Led Games',
    subcategory: null,
    name: 'Hand-Fight Specific Rounds',
    skillLevel: 'Intermediate',
    tags: ['drill', 'hand fighting', 'timing'],
    description: 'Short rounds that emphasize early grip wins, head position, and controlling the first connection.',
    relatedPositions: ['Standing', 'Front Headlock']
  },
  {
    id: 'drills-guard-passing-decision-tree-rounds',
    category: 'Constraint-Led Games',
    subcategory: null,
    name: 'Passing Decision Tree Rounds',
    skillLevel: 'Advanced',
    tags: ['drill', 'guard passing', 'decision making'],
    description: 'Rounds designed to help students recognize when to switch passing layers instead of forcing one line too long.',
    relatedPositions: ['Passing', 'Headquarters', 'Open Guard']
  },
  {
    id: 'drills-submission-chain-rounds',
    category: 'Constraint-Led Games',
    subcategory: null,
    name: 'Submission Chain Rounds',
    skillLevel: 'Advanced',
    tags: ['drill', 'submissions', 'chains'],
    description: 'Focused rounds that teach students to move smoothly between related attacks as each defense appears.',
    relatedPositions: ['Closed Guard', 'Mount', 'Back Control']
  },
  {
    id: 'positional-sparring-mount-escape-rounds',
    category: 'Positional Sparring',
    subcategory: null,
    name: 'Mount Escape Rounds',
    skillLevel: 'Beginner',
    tags: ['positional sparring', 'mount', 'escapes'],
    description: 'Focused rounds that isolate mount survival and recovery so students can build clearer defensive patterns.',
    relatedPositions: ['Mount']
  },
  {
    id: 'positional-sparring-side-control-escape-rounds',
    category: 'Positional Sparring',
    subcategory: null,
    name: 'Side Control Escape Rounds',
    skillLevel: 'Beginner',
    tags: ['positional sparring', 'side control', 'escapes'],
    description: 'Rounds that isolate bottom side control so students can build better framing, movement, and re-guard timing.',
    relatedPositions: ['Side Control']
  },
  {
    id: 'positional-sparring-back-control-rounds',
    category: 'Positional Sparring',
    subcategory: null,
    name: 'Back Control Rounds',
    skillLevel: 'Intermediate',
    tags: ['positional sparring', 'back control', 'finishing'],
    description: 'Rounds that start from back control so both control maintenance and escape timing get trained more directly.',
    relatedPositions: ['Back Control']
  },
  {
    id: 'positional-sparring-guard-retention-rounds',
    category: 'Positional Sparring',
    subcategory: null,
    name: 'Guard Retention Rounds',
    skillLevel: 'Intermediate',
    tags: ['positional sparring', 'guard retention', 'passing'],
    description: 'A live exchange focused on the battle between guard recovery and passing pressure before full control settles.',
    relatedPositions: ['Open Guard', 'Half Guard']
  },
  {
    id: 'positional-sparring-half-guard-rounds',
    category: 'Positional Sparring',
    subcategory: null,
    name: 'Half Guard Rounds',
    skillLevel: 'Intermediate',
    tags: ['positional sparring', 'half guard', 'sweeps'],
    description: 'Rounds that isolate the half guard battle so underhooks, frames, passing, and wrestle-up decisions sharpen together.',
    relatedPositions: ['Half Guard', 'Top Half Guard']
  },
  {
    id: 'positional-sparring-front-headlock-rounds',
    category: 'Positional Sparring',
    subcategory: null,
    name: 'Front Headlock Rounds',
    skillLevel: 'Intermediate',
    tags: ['positional sparring', 'front headlock', 'scrambles'],
    description: 'Rounds that isolate front headlock exchanges so control, spins, finishes, and defensive reactions all get cleaner.',
    relatedPositions: ['Front Headlock', 'Turtle']
  },
  {
    id: 'positional-sparring-hand-fight-rounds',
    category: 'Positional Sparring',
    subcategory: null,
    name: 'Hand-Fight Specific Rounds',
    skillLevel: 'Intermediate',
    tags: ['positional sparring', 'hand fighting', 'standing'],
    description: 'Rounds that isolate grip exchanges, head position, and early control battles before bigger attacks develop.',
    relatedPositions: ['Standing', 'Clinch', 'Front Headlock']
  },
  {
    id: 'strategy-game-planning-threat-stacking',
    category: 'Strategy and Game Planning',
    subcategory: null,
    name: 'Threat Stacking',
    skillLevel: 'Advanced',
    tags: ['strategy', 'attacking', 'decision making'],
    description: 'Layering attacks so the opponent has to solve multiple meaningful threats at once instead of just one.',
    relatedPositions: ['Mount', 'Back Control', 'Closed Guard']
  },
  {
    id: 'strategy-game-planning-dilemma-based-attacking',
    category: 'Strategy and Game Planning',
    subcategory: null,
    name: 'Dilemma-Based Attacking',
    skillLevel: 'Advanced',
    tags: ['strategy', 'dilemmas', 'attacking'],
    description: 'Building attacks so every reasonable defensive choice still gives you a follow-up advantage.',
    relatedPositions: ['Closed Guard', 'Mount', 'Back Control']
  },
  {
    id: 'strategy-game-planning-pass-in-stages',
    category: 'Strategy and Game Planning',
    subcategory: null,
    name: 'Pass In Stages',
    skillLevel: 'Intermediate',
    tags: ['strategy', 'passing', 'progression'],
    description: 'Advancing through guard passing in controlled layers so each stage creates the next one more safely.',
    relatedPositions: ['Headquarters', 'Half Guard Top', 'Side Control']
  },
  {
    id: 'strategy-game-planning-force-predictable-reactions',
    category: 'Strategy and Game Planning',
    subcategory: null,
    name: 'Force Predictable Reactions',
    skillLevel: 'Advanced',
    tags: ['strategy', 'reactions', 'control'],
    description: 'Apply threats and pressure in a way that narrows the opponent into a smaller set of responses you are ready for.',
    relatedPositions: ['Passing', 'Closed Guard', 'Front Headlock']
  },
  {
    id: 'strategy-game-planning-attack-transitions',
    category: 'Strategy and Game Planning',
    subcategory: null,
    name: 'Attack Transitions',
    skillLevel: 'Intermediate',
    tags: ['strategy', 'transitions', 'timing'],
    description: 'Look to attack while the opponent is between positions, grips, or frames instead of waiting for them to settle.',
    relatedPositions: ['Passing', 'Scrambles', 'Back Takes']
  },
  {
    id: 'strategy-game-planning-do-not-accept-flatness-on-bottom',
    category: 'Strategy and Game Planning',
    subcategory: null,
    name: 'Do Not Accept Flatness On Bottom',
    skillLevel: 'Intermediate',
    tags: ['strategy', 'bottom game', 'defense'],
    description: 'A bottom-game principle that emphasizes rebuilding angle and structure before flatness turns into easy pinning pressure.',
    relatedPositions: ['Half Guard', 'Side Control Defense', 'Mount Defense']
  },
  {
    id: 'strategy-game-planning-do-not-accept-looseness-on-top',
    category: 'Strategy and Game Planning',
    subcategory: null,
    name: 'Do Not Accept Looseness On Top',
    skillLevel: 'Intermediate',
    tags: ['strategy', 'top game', 'control'],
    description: 'A top-game principle that prioritizes tighter connection and fewer gaps before moving to the next attack or transition.',
    relatedPositions: ['Mount', 'Side Control', 'Back Control']
  },
  {
    id: 'strategy-game-planning-escape-in-stages',
    category: 'Strategy and Game Planning',
    subcategory: null,
    name: 'Escape In Stages',
    skillLevel: 'Intermediate',
    tags: ['strategy', 'escapes', 'progression'],
    description: 'Work escapes in reliable layers so each small win builds toward a full recovery instead of forcing a single desperate movement.',
    relatedPositions: ['Mount Defense', 'Side Control Defense', 'Back Control Defense']
  },
  {
    id: 'strategy-game-planning-reguard-before-standing',
    category: 'Strategy and Game Planning',
    subcategory: null,
    name: 'Re-Guard Before Standing',
    skillLevel: 'Intermediate',
    tags: ['strategy', 'guard recovery', 'standing'],
    description: 'Recover a safer guard layer first when needed so the stand-up happens from better distance and less exposure.',
    relatedPositions: ['Half Guard', 'Open Guard', 'Ground Recovery']
  },
  {
    id: 'strategy-game-planning-stand-safely',
    category: 'Strategy and Game Planning',
    subcategory: null,
    name: 'Stand Safely',
    skillLevel: 'Beginner',
    tags: ['strategy', 'standing', 'safety'],
    description: 'A strategic reminder that returning to the feet should preserve posture, awareness, and defensive responsibility.',
    relatedPositions: ['Standing', 'Ground Recovery', 'Turtle']
  },
  {
    id: 'strategy-game-planning-reset-posture-before-attacking-again',
    category: 'Strategy and Game Planning',
    subcategory: null,
    name: 'Reset Posture Before Attacking Again',
    skillLevel: 'Intermediate',
    tags: ['strategy', 'posture', 'offense'],
    description: 'If the exchange gets messy, rebuild alignment and control first so the next attack starts from a stronger base.',
    relatedPositions: ['Standing', 'Closed Guard Top', 'Mount']
  },
  {
    id: 'strategy-game-planning-ecological-training-games',
    category: 'Strategy and Game Planning',
    subcategory: null,
    name: 'Ecological Training Games',
    skillLevel: 'Advanced',
    tags: ['strategy', 'training design', 'ecological'],
    description: 'Training design that uses constraints and representative tasks to shape better decisions instead of only scripted repetition.',
    relatedPositions: []
  },
  {
    id: 'strategy-game-planning-ruotolo-style-movement-passing',
    category: 'Strategy and Game Planning',
    subcategory: null,
    name: 'Ruotolo-Style Movement Passing',
    skillLevel: 'Advanced',
    tags: ['strategy', 'passing', 'movement'],
    description: 'A passing emphasis built around movement, angle changes, and staying ahead of defensive frames through pace and timing.',
    relatedPositions: ['Open Guard', 'Passing']
  },
  {
    id: 'strategy-game-planning-chest-to-chest-passing-systems',
    category: 'Strategy and Game Planning',
    subcategory: null,
    name: 'Chest-To-Chest Passing Systems',
    skillLevel: 'Advanced',
    tags: ['strategy', 'passing', 'pressure'],
    description: 'A passing framework that favors tighter torso connection and pressure progression over lighter outside mobility.',
    relatedPositions: ['Half Guard Top', 'Side Control', 'Passing']
  },
  {
    id: 'grip-fighting-collar-grip',
    category: 'Grip Fighting',
    subcategory: 'Standing And Guard Grips',
    name: 'Collar Grip',
    skillLevel: 'Beginner',
    tags: ['grip fighting', 'standing', 'control'],
    description: 'A staple grip for posture control, off-balancing, and setting up takedowns or guard attacks.',
    relatedPositions: ['Standing', 'Closed Guard']
  },
  {
    id: 'grip-fighting-sleeve-grip',
    category: 'Grip Fighting',
    subcategory: 'Standing And Guard Grips',
    name: 'Sleeve Grip',
    skillLevel: 'Beginner',
    tags: ['grip fighting', 'gi', 'control'],
    description: 'A basic control grip that manages the wrist line and limits posting, re-gripping, and defensive framing.',
    relatedPositions: ['Standing', 'Closed Guard', 'Open Guard']
  },
  {
    id: 'grip-fighting-pistol-grip',
    category: 'Grip Fighting',
    subcategory: 'Standing And Guard Grips',
    name: 'Pistol Grip',
    skillLevel: 'Intermediate',
    tags: ['grip fighting', 'gi', 'sleeve'],
    description: 'A sleeve control that locks the hand into the fabric and improves directional pull for snaps, drags, and off-balancing.',
    relatedPositions: ['Standing', 'Open Guard']
  },
  {
    id: 'grip-fighting-pocket-grip',
    category: 'Grip Fighting',
    subcategory: 'Standing And Guard Grips',
    name: 'Pocket Grip',
    skillLevel: 'Intermediate',
    tags: ['grip fighting', 'gi', 'control'],
    description: 'A fabric grip that hides the fingers and helps keep cleaner pulling structure without overcommitting the arm.',
    relatedPositions: ['Standing', 'Open Guard']
  },
  {
    id: 'grip-fighting-c-grip',
    category: 'Grip Fighting',
    subcategory: 'Standing And Hand Fighting',
    name: 'C-Grip',
    skillLevel: 'Beginner',
    tags: ['grip fighting', 'no gi', 'control'],
    description: 'A versatile open-hand control that manages wrists, elbows, and ankles without overextending the fingers.',
    relatedPositions: ['Standing', 'Open Guard']
  },
  {
    id: 'grip-fighting-wrist-control',
    category: 'Grip Fighting',
    subcategory: 'Standing And Hand Fighting',
    name: 'Wrist Control',
    skillLevel: 'Beginner',
    tags: ['grip fighting', 'hand fighting', 'control'],
    description: 'A simple control that limits posting and re-gripping while opening pathways to drags, ties, and angle changes.',
    relatedPositions: ['Standing', 'Open Guard', 'Seated Guard']
  },
  {
    id: 'grip-fighting-russian-tie',
    category: 'Grip Fighting',
    subcategory: 'Standing And Hand Fighting',
    name: 'Russian Tie',
    skillLevel: 'Intermediate',
    tags: ['grip fighting', 'hand fighting', 'control'],
    description: 'A strong two-on-one control that can create drags, level changes, and back exposure.',
    relatedPositions: ['Standing']
  },
  {
    id: 'grip-fighting-cross-sleeve-grip',
    category: 'Grip Fighting',
    subcategory: 'Standing And Guard Grips',
    name: 'Cross Sleeve Grip',
    skillLevel: 'Intermediate',
    tags: ['grip fighting', 'gi', 'sleeve'],
    description: 'A sleeve grip taken across the center line that helps expose posture and opens cleaner angles for attacks.',
    relatedPositions: ['Standing', 'Closed Guard', 'Open Guard']
  },
  {
    id: 'grip-fighting-same-side-sleeve-grip',
    category: 'Grip Fighting',
    subcategory: 'Standing And Guard Grips',
    name: 'Same-Side Sleeve Grip',
    skillLevel: 'Beginner',
    tags: ['grip fighting', 'gi', 'sleeve'],
    description: 'A direct sleeve control that manages the near arm and often sets up collar-and-sleeve style attacks.',
    relatedPositions: ['Standing', 'Open Guard']
  },
  {
    id: 'grip-fighting-pant-grip',
    category: 'Grip Fighting',
    subcategory: 'Standing And Guard Grips',
    name: 'Pant Grip',
    skillLevel: 'Intermediate',
    tags: ['grip fighting', 'gi', 'leg control'],
    description: 'A lower-body fabric grip that controls stepping and helps manage distance during passing, retention, and sweeps.',
    relatedPositions: ['Open Guard', 'Standing Passing']
  },
  {
    id: 'grip-fighting-belt-grip',
    category: 'Grip Fighting',
    subcategory: 'Standing And Guard Grips',
    name: 'Belt Grip',
    skillLevel: 'Intermediate',
    tags: ['grip fighting', 'gi', 'hip control'],
    description: 'A central grip that connects directly to the hips and helps steer posture, rotation, and takedown direction.',
    relatedPositions: ['Standing', 'Back Control']
  },
  {
    id: 'grip-fighting-lapel-grip',
    category: 'Grip Fighting',
    subcategory: 'Standing And Guard Grips',
    name: 'Lapel Grip',
    skillLevel: 'Beginner',
    tags: ['grip fighting', 'gi', 'control'],
    description: 'A classic fabric grip that influences posture and shoulder alignment while opening sweeps, passes, and chokes.',
    relatedPositions: ['Standing', 'Closed Guard', 'Open Guard']
  },
  {
    id: 'grip-fighting-cross-collar-grip',
    category: 'Grip Fighting',
    subcategory: 'Standing And Guard Grips',
    name: 'Cross Collar Grip',
    skillLevel: 'Beginner',
    tags: ['grip fighting', 'gi', 'collar'],
    description: 'A deep collar control that creates sharper posture breaks and stronger attacking angles across the center line.',
    relatedPositions: ['Standing', 'Closed Guard', 'Mount']
  },
  {
    id: 'grip-fighting-no-gi-wrist-ride',
    category: 'Grip Fighting',
    subcategory: 'Standing And Hand Fighting',
    name: 'No-Gi Wrist Ride',
    skillLevel: 'Intermediate',
    tags: ['grip fighting', 'no gi', 'wrist control'],
    description: 'A sticky wrist control that tracks the arm through movement and helps deny posts during scrambles and rides.',
    relatedPositions: ['Standing', 'Turtle']
  },
  {
    id: 'grip-fighting-elbow-control',
    category: 'Grip Fighting',
    subcategory: 'Standing And Hand Fighting',
    name: 'Elbow Control',
    skillLevel: 'Beginner',
    tags: ['grip fighting', 'hand fighting', 'control'],
    description: 'A practical control point that steers the shoulder line and opens entries without needing a deep grip commitment.',
    relatedPositions: ['Standing', 'Clinch']
  },
  {
    id: 'grip-fighting-bicep-tie',
    category: 'Grip Fighting',
    subcategory: 'Standing And Hand Fighting',
    name: 'Bicep Tie',
    skillLevel: 'Beginner',
    tags: ['grip fighting', 'hand fighting', 'control'],
    description: 'A no-gi tie that manages inside space and keeps the arm line available for snaps, drags, and shots.',
    relatedPositions: ['Standing']
  },
  {
    id: 'grip-fighting-inside-tie',
    category: 'Grip Fighting',
    subcategory: 'Standing And Hand Fighting',
    name: 'Inside Tie',
    skillLevel: 'Beginner',
    tags: ['grip fighting', 'hand fighting', 'inside position'],
    description: 'A core standing control that wins inside space and helps connect the upper body to takedowns or body locks.',
    relatedPositions: ['Standing', 'Clinch']
  },
  {
    id: 'grip-fighting-collar-tie',
    category: 'Grip Fighting',
    subcategory: 'Standing And Hand Fighting',
    name: 'Collar Tie',
    skillLevel: 'Beginner',
    tags: ['grip fighting', 'hand fighting', 'standing'],
    description: 'A common standing control that manages head position, posture, and entry timing for snaps and shots.',
    relatedPositions: ['Standing', 'Front Headlock']
  },
  {
    id: 'grip-fighting-snap-down',
    category: 'Grip Fighting',
    subcategory: 'Standing And Hand Fighting',
    name: 'Snap Down',
    skillLevel: 'Beginner',
    tags: ['grip fighting', 'hand fighting', 'snap down'],
    description: 'A posture-breaking motion that drags the head and shoulders down to open front headlocks, go-behinds, and shots.',
    relatedPositions: ['Standing', 'Front Headlock']
  },
  {
    id: 'grip-fighting-peel-grip',
    category: 'Grip Fighting',
    subcategory: 'Guard And Passing Exchanges',
    name: 'Peel Grip',
    skillLevel: 'Beginner',
    tags: ['grip fighting', 'grip break', 'hand fighting'],
    description: 'A basic grip-breaking response that peels fingers or fabric away before the control settles into a stronger anchor.',
    relatedPositions: ['Standing', 'Open Guard', 'Closed Guard']
  },
  {
    id: 'grip-fighting-strip-grip',
    category: 'Grip Fighting',
    subcategory: 'Guard And Passing Exchanges',
    name: 'Strip Grip',
    skillLevel: 'Intermediate',
    tags: ['grip fighting', 'grip break', 'gi'],
    description: 'A more assertive grip break that strips the hand or sleeve away to free posture, movement, or passing lines.',
    relatedPositions: ['Standing', 'Open Guard', 'Standing Passing']
  },
  {
    id: 'grip-fighting-re-grip',
    category: 'Grip Fighting',
    subcategory: 'Guard And Passing Exchanges',
    name: 'Re-Grip',
    skillLevel: 'Beginner',
    tags: ['grip fighting', 'hand fighting', 'control'],
    description: 'A quick grip adjustment that restores a stronger control point after the first grip breaks down or loses angle.',
    relatedPositions: ['Standing', 'Open Guard', 'Closed Guard']
  },
  {
    id: 'grip-fighting-grip-breaking-from-standing',
    category: 'Grip Fighting',
    subcategory: 'Guard And Passing Exchanges',
    name: 'Grip Breaking From Standing',
    skillLevel: 'Beginner',
    tags: ['grip fighting', 'standing', 'grip break'],
    description: 'A standing skill set focused on clearing collar, sleeve, and tie controls before entering shots or passing lanes.',
    relatedPositions: ['Standing']
  },
  {
    id: 'grip-fighting-grip-breaking-from-guard',
    category: 'Grip Fighting',
    subcategory: 'Guard And Passing Exchanges',
    name: 'Grip Breaking From Guard',
    skillLevel: 'Intermediate',
    tags: ['grip fighting', 'guard', 'grip break'],
    description: 'A guard-focused sequence that clears sleeve, pant, and posture controls to recover movement and attacking options.',
    relatedPositions: ['Closed Guard', 'Open Guard', 'Half Guard']
  },
  {
    id: 'grip-fighting-posting-hand-removal',
    category: 'Grip Fighting',
    subcategory: 'Guard And Passing Exchanges',
    name: 'Posting Hand Removal',
    skillLevel: 'Intermediate',
    tags: ['grip fighting', 'posts', 'sweeps'],
    description: 'Removing or redirecting a post before sweeping so the opponent cannot easily base out and recover.',
    relatedPositions: ['Closed Guard', 'Open Guard', 'Butterfly Guard']
  },
  {
    id: 'grip-fighting-two-on-one',
    category: 'Grip Fighting',
    subcategory: 'Standing And Hand Fighting',
    name: 'Two-On-One',
    skillLevel: 'Beginner',
    tags: ['grip fighting', 'hand fighting', 'control'],
    description: 'A simple but powerful control that doubles one arm and helps create drags, snaps, and angle changes.',
    relatedPositions: ['Standing', 'Front Headlock']
  },
  {
    id: 'grip-fighting-hand-fighting',
    category: 'Grip Fighting',
    subcategory: 'Standing And Hand Fighting',
    name: 'Hand Fighting',
    skillLevel: 'Beginner',
    tags: ['grip fighting', 'hand fighting', 'standing'],
    description: 'The broader skill of managing ties, wrists, and head position before stronger grips, shots, or angles become available.',
    relatedPositions: ['Standing', 'Clinch']
  },
  {
    id: 'grip-fighting-pummeling',
    category: 'Grip Fighting',
    subcategory: 'Standing And Hand Fighting',
    name: 'Pummeling',
    skillLevel: 'Beginner',
    tags: ['grip fighting', 'pummeling', 'inside position'],
    description: 'A foundational exchange for winning inside space, improving upper-body connection, and building body-lock opportunities.',
    relatedPositions: ['Clinch', 'Standing']
  }
];

const normalizeSeedName = (value) => (
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
);

const dedupedCurriculumIndexSeed = curriculumIndexSeed.filter((entry, index, entries) => {
  const normalizedName = normalizeSeedName(entry.name);

  return entries.findIndex((candidate) => normalizeSeedName(candidate.name) === normalizedName) === index;
});

export default dedupedCurriculumIndexSeed;
