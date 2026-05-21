const normalizeValue = (value) => (
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
);

const rawSetupFamilies = [
  {
    title: 'Standing hand-fight setups',
    lane: 'Standing',
    summary: 'Win the first reaction before you commit to the shot.',
    description:
      'Use head touches, level changes, collar ties, inside ties, and two-on-one control to make the stance react before the actual takedown starts.',
    setupNodes: ['Collar Tie', 'Inside Tie', 'Russian Tie Standing', 'Two-On-One Standing', 'Snap Down'],
    nextAttacks: ['Ankle Pick', 'Single Leg', 'Double Leg', 'Front Headlock Standing'],
    previewSequence: ['Collar tie', 'They posture tall', 'Snap down', 'Front headlock standing'],
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
    previewSequence: ['Russian tie two-on-one', 'They turn away', 'Single leg', 'Finish or run the pipe'],
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
    previewSequence: ['Sprawl', 'Head stays low', 'Front headlock', 'D’Arce or spin-behind lane'],
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
    previewSequence: ['Duck under', 'Rear angle opens', 'Single leg', 'Mat return if they stay up'],
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
    previewSequence: ['Elbow pull to clamp', 'They square up', 'Body lock takedown', 'Single leg if hips back out'],
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
    title: 'Ankle-pick entry setups',
    lane: 'Standing',
    summary: 'Use level changes and post reactions to expose the ankle cleanly.',
    description:
      'This family is for head touches, collar ties, wrist pulls, and inside-tie reactions that make the opponent step or lighten the lead leg before the ankle pick actually opens.',
    setupNodes: ['Head Touch + Level Change', 'Collar Tie Snap', 'Wrist Post Pull', 'Inside Tie To Outside Angle'],
    nextAttacks: ['Ankle Pick', 'Single Leg', 'Front Headlock Standing', 'Body Lock Standing'],
    previewSequence: ['Collar tie snap', 'Foot stays planted', 'Ankle pick', 'Front headlock if they sprawl early'],
    exampleSequence: [
      'Head touch + level change',
      'They step',
      'Ankle pick',
      'They square back up',
      'Single-leg continuation'
    ],
    curriculumSearch: 'ankle pick',
    treeSearch: 'ankle pick',
    relatedTerms: ['ankle pick', 'single leg', 'front headlock standing', 'body lock standing', 'collar tie', 'inside tie']
  },
  {
    title: 'Low-single entry setups',
    lane: 'Standing',
    summary: 'Use reactions that make the lead leg light before you drop to the low single.',
    description:
      'This family is for level changes, wrist-post pulls, collar-tie snaps, and angle changes that make the lead foot reachable before the defender can sprawl or square back up.',
    setupNodes: ['Wrist Post Pull', 'Collar Tie Snap', 'Inside Tie Angle Change', 'Head Touch To Level Change'],
    nextAttacks: ['Low Single', 'Ankle Pick', 'Single Leg', 'Front Headlock Standing'],
    previewSequence: ['Inside tie angle change', 'Lead foot gets heavy', 'Low single', 'Ankle pick if they step wide'],
    exampleSequence: [
      'Wrist post pull',
      'Lead foot plants heavy',
      'Low single',
      'They square their hips',
      'Single-leg continuation'
    ],
    curriculumSearch: 'low single',
    treeSearch: 'low single',
    relatedTerms: ['low single', 'ankle pick', 'single leg', 'front headlock standing', 'collar tie', 'inside tie']
  },
  {
    title: 'Guard wrestle-up setups',
    lane: 'Guard',
    summary: 'Use bottom position reactions to create a come-up.',
    description:
      'This family is for seated guard, shin-to-shin, half guard, and butterfly situations where the setup is really about making the top player post, overcommit, or drift high enough that the wrestle-up becomes available.',
    setupNodes: ['Shin-To-Shin', 'Seated Guard', 'Underhook Half Guard', 'Butterfly Guard'],
    nextAttacks: ['Wrestle-Up Single Leg Sweep', 'Single-Leg From Seated Guard', 'Wrestle-Up Double Leg Sweep', 'Dogfight Sweep'],
    previewSequence: ['Seated guard', 'They post forward', 'Ankle-pick or come-up', 'Top finish from the leg'],
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
    previewSequence: ['Overhook clamp', 'They posture into you', 'Triangle choke', 'Armbar if they pull free'],
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
    title: 'Closed-guard legacy submission setups',
    lane: 'Guard',
    summary: 'Break posture or isolate an arm first, then let the submission lane appear.',
    description:
      'This family is for closed-guard situations where the setup is really about making posture react first: collar pulls, shoulder-crunch ties, hip-bump threats, and overhook clamps that open triangles, armbars, kimuras, or omoplatas.',
    setupNodes: ['Collar Pull', 'Shoulder Crunch', 'Hip Bump Threat', 'Overhook Clamp'],
    nextAttacks: ['Triangle Choke', 'Straight Armbar From Guard', 'Kimura', 'Omoplata'],
    previewSequence: ['Shoulder crunch', 'Elbow stays trapped', 'Straight armbar from guard', 'Triangle if posture changes'],
    exampleSequence: [
      'Collar pull',
      'They posture back up',
      'Hip bump threat',
      'They post the hand',
      'Kimura / triangle continuation'
    ],
    curriculumSearch: 'closed guard',
    treeSearch: 'triangle choke',
    relatedTerms: ['closed guard', 'triangle choke', 'straight armbar from guard', 'kimura', 'omoplata', 'shoulder crunch']
  },
  {
    title: 'Butterfly sweep setups',
    lane: 'Guard',
    summary: 'Use upper-body wins and posts to make the butterfly sweep feel inevitable.',
    description:
      'This family is for double underhooks, overhook clamp reactions, shoulder-crunch control, and arm-drag sit-ups that create the butterfly sweep, wrestle-up, or back-take lane.',
    setupNodes: ['Double Underhooks', 'Overhook Clamp', 'Shoulder Crunch', 'Arm Drag Sit-Up'],
    nextAttacks: ['Butterfly Sweep', 'Wrestle-Up Single Leg Sweep', 'Shoulder Crunch Butterfly Sweep', 'Back Control'],
    previewSequence: ['Arm drag sit-up', 'Back starts to show', 'Back control', 'Mat return or top settle'],
    exampleSequence: [
      'Double underhooks',
      'They post wide',
      'Butterfly sweep',
      'They base out',
      'Wrestle-up / back-take continuation'
    ],
    curriculumSearch: 'butterfly sweep',
    treeSearch: 'butterfly sweep',
    relatedTerms: ['butterfly sweep', 'wrestle-up single leg sweep', 'shoulder crunch butterfly sweep', 'back control', 'double underhooks', 'arm drag']
  },
  {
    title: 'Butterfly-guard submission setups',
    lane: 'Guard',
    summary: 'Use upper-body control and posts to turn butterfly guard into a submission lane.',
    description:
      'This family is for butterfly guard moments where the opening is not just a sweep. Shoulder crunches, overhook clamps, head snaps, and arm drags can all create triangles, guillotines, omoplatas, or back exposure if the top player leans the wrong way.',
    setupNodes: ['Shoulder Crunch', 'Overhook Clamp', 'Head Snap', 'Arm Drag Sit-Up'],
    nextAttacks: ['Triangle Choke', 'Guillotine', 'Omoplata', 'Back Control'],
    previewSequence: ['Head snap', 'Neck stays exposed', 'Guillotine', 'Front-headlock continuation if they hide'],
    exampleSequence: [
      'Shoulder crunch',
      'They drive posture forward',
      'Triangle / guillotine lane opens',
      'They pull back late',
      'Omoplata / back-take continuation'
    ],
    curriculumSearch: 'butterfly guard',
    treeSearch: 'triangle choke',
    relatedTerms: ['butterfly guard', 'triangle choke', 'guillotine', 'omoplata', 'back control', 'shoulder crunch']
  },
  {
    title: 'Knee-shield wrestle-up setups',
    lane: 'Guard',
    summary: 'Use the knee shield to win the hand fight before you come up.',
    description:
      'This family is for knee-shield frames, wrist control, and underhook timing that make the top player post or drift high enough for the wrestle-up, dogfight, or sit-up sweep lane.',
    setupNodes: ['Knee Shield Frame', 'Wrist Control', 'Inside Elbow Lift', 'Underhook Sit-Up'],
    nextAttacks: ['Dogfight Sweep', 'Wrestle-Up Single Leg Sweep', 'Single-Leg From Seated Guard', 'Technical Stand-Up Sweep'],
    previewSequence: ['Wrist control', 'They drift high', 'Technical stand-up sweep', 'Single-leg if they retreat hard'],
    exampleSequence: [
      'Knee shield frame',
      'They pressure forward',
      'Underhook sit-up',
      'They post the far hand',
      'Wrestle-up single / dogfight continuation'
    ],
    curriculumSearch: 'knee shield',
    treeSearch: 'dogfight sweep',
    relatedTerms: ['knee shield', 'dogfight sweep', 'wrestle-up single leg sweep', 'technical stand-up sweep', 'underhook half guard']
  },
  {
    title: 'X-guard sweep setups',
    lane: 'Guard',
    summary: 'Make the standing player carry your hooks and weight before the sweep opens.',
    description:
      'This family is for shin-to-shin entries, under-leg lifts, off-balancing pulls, and upper-body steering that make the X-guard sweep, ankle-pick lane, or leg-drag finish appear without forcing the position too early.',
    setupNodes: ['Shin-To-Shin', 'Under-Leg Lift', 'Off-Balance Pull', 'Upper-Body Steering'],
    nextAttacks: ['Basic X-Guard Sweep', 'X-Guard To Ankle Pick', 'X-Guard To Leg Drag Sweep', 'X-Guard Back Take'],
    previewSequence: ['Under-leg lift', 'They widen the base', 'Overhead sweep', 'Back take if they post long'],
    exampleSequence: [
      'Shin-to-shin',
      'They stay tall',
      'X-guard entry',
      'They widen the base',
      'Ankle-pick / overhead-sweep continuation'
    ],
    curriculumSearch: 'x-guard',
    treeSearch: 'x-guard',
    relatedTerms: ['x-guard', 'shin to shin', 'basic x-guard sweep', 'x-guard to ankle pick', 'x-guard to leg drag sweep', 'x-guard back take']
  },
  {
    title: 'Spider / lasso sweep setups',
    lane: 'Guard',
    summary: 'Use sleeve and leg tension to make the top player light before you tip them.',
    description:
      'This family is for spider guard, lasso guard, and collar-sleeve style control that creates overhead sweeps, balloon sweeps, omoplata lanes, and top-position follow-ups once the base gets stretched out.',
    setupNodes: ['Spider Sleeve Control', 'Lasso Tension', 'Collar-Sleeve Pull', 'Foot-On-Hip Extension'],
    nextAttacks: ['Balloon Sweep From Spider', 'Basic Lasso Sweep', 'Spider Lasso Sweep', 'Omoplata'],
    previewSequence: ['Lasso tension', 'They stay stretched', 'Basic lasso sweep', 'Omoplata if shoulder lingers'],
    exampleSequence: [
      'Spider sleeve control',
      'They posture forward',
      'Balloon / overhead lane opens',
      'They widen the post',
      'Omoplata / top-position continuation'
    ],
    curriculumSearch: 'spider guard',
    treeSearch: 'balloon sweep',
    relatedTerms: ['spider guard', 'lasso guard', 'balloon sweep from spider', 'basic lasso sweep', 'spider lasso sweep', 'omoplata']
  },
  {
    title: 'De La Riva sweep setups',
    lane: 'Guard',
    summary: 'Off-balance the lead leg and hip line before you commit to the sweep or back-take lane.',
    description:
      'This family is for De La Riva pulls, ankle steering, tripod-style off-balancing, and waiter-style follow-ups that create sweeps, leg-drag finishes, or back exposure once the standing player loses alignment.',
    setupNodes: ['DLR Sleeve Pull', 'Ankle Steering', 'Tripod Off-Balance', 'Waiter-Style Tilt'],
    nextAttacks: ['Basic De La Riva Off-Balance Sweep', 'De La Riva Tripod Variation', 'De La Riva To Single-Leg X Sweep', 'Berimbolo'],
    previewSequence: ['Ankle steering', 'Tripod lane opens', 'DLR tripod variation', 'Single-Leg X if they pull free'],
    exampleSequence: [
      'DLR sleeve pull',
      'They post the weight forward',
      'Tripod / off-balance lane opens',
      'They recover late',
      'Single-Leg X / bolo continuation'
    ],
    curriculumSearch: 'de la riva',
    treeSearch: 'de la riva',
    relatedTerms: ['de la riva', 'basic de la riva off-balance sweep', 'de la riva tripod variation', 'de la riva to single-leg x sweep', 'berimbolo']
  },
  {
    title: 'Deep-half sweep setups',
    lane: 'Guard',
    summary: 'Get under the hips first, then let the top player carry the sweep for you.',
    description:
      'This family is for deep-half entries, waiter-style wedges, and under-the-centerline angles that open the waiter sweep, basic deep-half sweep, or leg-transition lanes once the top player commits their balance.',
    setupNodes: ['Under-Hip Entry', 'Waiter Wedge', 'Inside Knee Turn', 'Shoulder Under The Belt Line'],
    nextAttacks: ['Deep Half Waiter Sweep', 'Basic Deep Half Sweep', 'Single-Leg X', 'Leg Drag'],
    previewSequence: ['Waiter wedge', 'Base stays wide', 'Basic deep-half sweep', 'Leg drag if hips float across'],
    exampleSequence: [
      'Under-hip entry',
      'They commit weight forward',
      'Waiter / deep-half lane opens',
      'They post wide',
      'Single-Leg X / leg-drag continuation'
    ],
    curriculumSearch: 'deep half guard',
    treeSearch: 'deep half guard',
    relatedTerms: ['deep half guard', 'deep half waiter sweep', 'basic deep half sweep', 'waiter guard', 'single-leg x']
  },
  {
    title: 'Reverse De La Riva sweep setups',
    lane: 'Guard',
    summary: 'Use the outside hook and angle change to create either a sweep or a wrestle-up lane.',
    description:
      'This family is for Reverse De La Riva angles, waiter-style tilts, spin-under looks, and wrestle-up reactions that open the basic sweep, waiter variation, or back-side transitions once the standing player loses balance.',
    setupNodes: ['RDLR Hook Angle', 'Waiter Tilt', 'Spin-Under Threat', 'Wrestle-Up Read'],
    nextAttacks: ['Basic Reverse De La Riva Sweep', 'Reverse De La Riva Waiter Sweep', 'Reverse De La Riva Spin Under Sweep', 'RDLR Wrestle-Up Sweep'],
    previewSequence: ['Spin-under threat', 'They square late', 'Spin-under sweep', 'Wrestle-up if they back away'],
    exampleSequence: [
      'RDLR hook angle',
      'They step heavy',
      'Basic sweep / waiter lane opens',
      'They recover posture late',
      'Spin-under / wrestle-up continuation'
    ],
    curriculumSearch: 'reverse de la riva',
    treeSearch: 'reverse de la riva',
    relatedTerms: ['reverse de la riva', 'basic reverse de la riva sweep', 'reverse de la riva waiter sweep', 'reverse de la riva spin under sweep', 'rdlr wrestle-up sweep']
  },
  {
    title: 'Dogfight setups',
    lane: 'Guard',
    summary: 'Win the underhook battle and hip height before you ask the dogfight to solve itself.',
    description:
      'This family is for underhook half-guard entries, coyote-style angles, shoulder height wins, and stand-up reactions that make the dogfight sweep, wrestle-up, or back-take lane open without stalling underneath.',
    setupNodes: ['Underhook Half Guard', 'Coyote Angle', 'Shoulder Height Win', 'Stand-Up Reaction'],
    nextAttacks: ['Dogfight Sweep', 'Wrestle-Up To Back', 'Wrestle-Up Single Leg Sweep', 'Single Leg'],
    previewSequence: ['Coyote angle', 'Back starts to show', 'Wrestle-up to back', 'Single leg if they stay square'],
    exampleSequence: [
      'Underhook half guard',
      'You win shoulder height',
      'Dogfight lane opens',
      'They square or post wide',
      'Single leg / back-take continuation'
    ],
    curriculumSearch: 'dogfight',
    treeSearch: 'dogfight',
    relatedTerms: ['dogfight', 'dogfight sweep', 'wrestle-up to back', 'wrestle-up single leg sweep', 'single leg', 'underhook half guard']
  },
  {
    title: 'Passing setup chains',
    lane: 'Passing',
    summary: 'Win the grips or pins that make the pass start cleanly.',
    description:
      'These are the setup lanes that make passing easier before the actual pass happens: grip breaking, leg pinning, headquarters-style control, and body-lock access before the guard can reset.',
    setupNodes: ['Grip Fighting', 'Leg Pin Pass', 'Headquarters Pass', 'Body Lock Standing'],
    nextAttacks: ['Knee Cut', 'Torreando Pass', 'Body Lock Pass', 'Leg Drag'],
    previewSequence: ['Leg pin pass', 'Knee line opens', 'Knee cut', 'Leg drag if they square back in'],
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
    previewSequence: ['Headquarters leg lift', 'Hip switch lane opens', 'Hip smash pass', 'Backstep if they turn away'],
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
    title: 'Closed-guard passing setups',
    lane: 'Passing',
    summary: 'Win posture and hand position first, then open the guard before you think about the pass.',
    description:
      'This family is for top closed-guard situations where the real setup is posture, sleeve stripping, elbow position, and standing rhythm before the guard opens. The point is to get out cleanly, not force a bad pass while still trapped.',
    setupNodes: ['Posture Frame', 'Sleeve / Wrist Peel', 'Combat Base Rise', 'Standing Guard-Open Rhythm'],
    nextAttacks: ['Combat Base', 'Closed Guard Posture Control', 'Standing Passing', 'Leg Drag'],
    previewSequence: ['Sleeve / wrist peel', 'Elbows stay safe', 'Standing passing', 'Torreando or leg-drag lane opens'],
    exampleSequence: [
      'Posture frame',
      'Strip the sleeve or wrist',
      'Combat base rise',
      'Guard opens',
      'Standing pass / leg-drag continuation'
    ],
    curriculumSearch: 'closed guard posture control',
    treeSearch: 'combat base',
    relatedTerms: ['closed guard posture control', 'combat base', 'standing passing', 'leg drag', 'closed guard']
  },
  {
    title: 'Leg-drag passing setups',
    lane: 'Passing',
    summary: 'Pull the legs off center first, then run the drag before the guard resets.',
    description:
      'This family is for ankle-control pulls, shin redirects, body-lock-to-leg-drag reactions, and leg pummels that move the knees off line before the drag, backstep, or side-control finish appears.',
    setupNodes: ['Ankle-Control Pull', 'Shin Redirect', 'Leg Pummel', 'Body Lock To Leg Drag'],
    nextAttacks: ['Leg Drag', 'Backstep Pass', 'Pass To Knee On Belly', 'Side Control'],
    previewSequence: ['Body lock to leg drag', 'Knees turn off line', 'Leg drag', 'Knee-on-belly if hips stay flat'],
    exampleSequence: [
      'Ankle-control pull',
      'Knees turn off line',
      'Leg drag',
      'They square the hips late',
      'Backstep / side-control continuation'
    ],
    curriculumSearch: 'leg drag',
    treeSearch: 'leg drag',
    relatedTerms: ['leg drag', 'backstep pass', 'pass to knee on belly', 'side control', 'ankle control', 'body lock pass']
  },
  {
    title: 'Knee-cut passing setups',
    lane: 'Passing',
    summary: 'Win the frame battle first, then slide into the knee-cut lane cleanly.',
    description:
      'This family is for grip wins, shin redirects, near-side arm pins, and upper-body pressure that open the knee cut before the bottom player can rebuild the frame or chase the underhook.',
    setupNodes: ['Near-Side Arm Pin', 'Shin Redirect', 'Crossface Threat', 'Hip Switch Fake'],
    nextAttacks: ['Knee Cut', 'Hip Smash Pass', 'Crossface Underhook Half Guard Pass', 'Backstep Half Guard Pass'],
    previewSequence: ['Crossface threat', 'They frame hard', 'Crossface-underhook pass', 'Backstep if they turn away'],
    exampleSequence: [
      'Near-side arm pin',
      'Shin redirect',
      'Knee-cut lane opens',
      'They frame hard',
      'Crossface-underhook continuation'
    ],
    curriculumSearch: 'knee cut',
    treeSearch: 'knee cut',
    relatedTerms: ['knee cut', 'hip smash pass', 'crossface underhook half guard pass', 'backstep half guard pass', 'shin redirect']
  },
  {
    title: 'Torreando passing setups',
    lane: 'Passing',
    summary: 'Clear the grips and turn the hips before you run around the guard.',
    description:
      'This family is for sleeve clearing, ankle steering, hip turns, and outside-angle footwork that make the torreando, bullfighter, or cross-step lane open before the guard can reconnect to your legs.',
    setupNodes: ['Sleeve Clear', 'Ankle Steering', 'Hip Turn', 'Outside-Angle Footwork'],
    nextAttacks: ['Torreando Pass', 'Bullfighter Pass', 'Cross-Step Pass', 'Pass To Knee On Belly'],
    previewSequence: ['Ankle steering', 'They chase the far hip', 'Cross-step pass', 'North-south if they keep turning'],
    exampleSequence: [
      'Sleeve clear',
      'Hips turn off line',
      'Torreando lane opens',
      'They chase the far hip',
      'Cross-step / knee-on-belly continuation'
    ],
    curriculumSearch: 'torreando pass',
    treeSearch: 'torreando pass',
    relatedTerms: ['torreando pass', 'bullfighter pass', 'cross-step pass', 'pass to knee on belly']
  },
  {
    title: 'Over-under / stack passing setups',
    lane: 'Passing',
    summary: 'Fold the hips and stack the knees before you drive the finish.',
    description:
      'This family is for double-under pressure, leg folding, hip stacking, and shoulder-driven angle changes that make the over-under, stack, or north-south style pass open without rushing through the frames.',
    setupNodes: ['Double-Under Pressure', 'Leg Fold', 'Hip Stack', 'Shoulder-Drive Angle'],
    nextAttacks: ['Over-Under Pass', 'Stack Pass', 'Folding Pass', 'North-South Pass'],
    previewSequence: ['Leg fold', 'Knees stay compressed', 'Stack pass', 'North-south if they turn the hips'],
    exampleSequence: [
      'Double-under pressure',
      'Knees fold toward the chest',
      'Stack / over-under lane opens',
      'They turn the hips late',
      'North-south / folding-pass continuation'
    ],
    curriculumSearch: 'over-under pass',
    treeSearch: 'over-under pass',
    relatedTerms: ['over-under pass', 'stack pass', 'folding pass', 'north-south pass', 'double under pass']
  },
  {
    title: 'Headquarters passing setups',
    lane: 'Passing',
    summary: 'Use headquarters to split the legs and choose the cleanest pass before the guard reconnects.',
    description:
      'This family is for headquarters control, shin staples, hip turns, and leg-lift reactions that open knee-slice, cross-knee, float, or side-smash style passes once the bottom player is stretched out.',
    setupNodes: ['Headquarters Split', 'Shin Staple', 'Hip Turn Read', 'Leg Lift Reaction'],
    nextAttacks: ['Headquarters Pass', 'Knee Slice Pass', 'Cross Knee Pass', 'Float Headquarters Pass'],
    previewSequence: ['Shin staple', 'Hip turn opens', 'Cross-knee pass', 'Float pass if they recover late'],
    exampleSequence: [
      'Headquarters split',
      'Bottom leg gets stretched high',
      'Knee-slice / float lane opens',
      'They hip-escape late',
      'Cross-knee / side-smash continuation'
    ],
    curriculumSearch: 'headquarters pass',
    treeSearch: 'headquarters pass',
    relatedTerms: ['headquarters pass', 'float headquarters pass', 'knee slice pass', 'cross knee pass', 'shin staple pass']
  },
  {
    title: 'Body-lock passing setups',
    lane: 'Passing',
    summary: 'Beat the hip frames first, then let the body-lock pressure decide the pass.',
    description:
      'This family is for hip clamps, knee-pinch pressure, shoulder line wins, and folding reactions that make body-lock, folding, float-headquarters, or side-smash passing much cleaner once the legs stop recovering inside.',
    setupNodes: ['Hip Clamp', 'Knee Pinch Pressure', 'Shoulder-Line Win', 'Folding Reaction'],
    nextAttacks: ['Body Lock Pass', 'Body Lock Passing', 'Folding Pass', 'Float Headquarters Pass'],
    previewSequence: ['Shoulder-line win', 'Frames stay pinned', 'Body lock pass', 'Folding pass if knees stay inside'],
    exampleSequence: [
      'Hip clamp',
      'Frames get pinned inside',
      'Body-lock / folding lane opens',
      'They turn the hips late',
      'Float-headquarters / side-smash continuation'
    ],
    curriculumSearch: 'body lock pass',
    treeSearch: 'body lock pass',
    relatedTerms: ['body lock pass', 'body lock passing', 'folding pass', 'float headquarters pass', 'side smash pass']
  },
  {
    title: 'Float / side-smash passing setups',
    lane: 'Passing',
    summary: 'Make the hips chase one direction, then switch above the frames before they can recover.',
    description:
      'This family is for float-pass reactions, side-smash pressure, shoulder-switch timing, and north-south style redirections that keep the passer light until the bottom player loses the frame battle.',
    setupNodes: ['Float Threat', 'Side-Smash Pressure', 'Shoulder Switch', 'North-South Redirection'],
    nextAttacks: ['Float Pass', 'Side Smash Pass', 'Float Headquarters Pass', 'North-South Pass'],
    previewSequence: ['Shoulder switch', 'Frames chase the wrong side', 'Float pass', 'North-south if they turn away'],
    exampleSequence: [
      'Float threat',
      'Frames chase the wrong side',
      'Side-smash / float lane opens',
      'They hip-escape late',
      'North-south / backstep continuation'
    ],
    curriculumSearch: 'float pass',
    treeSearch: 'float pass',
    relatedTerms: ['float pass', 'side smash pass', 'float headquarters pass', 'north-south pass', 'ghost-style float pass']
  },
  {
    title: 'Submission-entry setups',
    lane: 'Submission',
    summary: 'Create the control that makes the finish realistic first.',
    description:
      'This family is for upper-body or positional control that creates the submission later: shoulder crunches, front headlocks, kimura traps, and gift-wrap style control that forces the next attack to open cleanly.',
    setupNodes: ['Shoulder Crunch', 'Front Headlock', 'Kimura Trap', 'Gift Wrap'],
    nextAttacks: ['Choi Bar', 'Guillotine', 'Kimura', 'Technical Mount To Back'],
    previewSequence: ['Front headlock', 'Arm stays threaded', 'D’Arce or anaconda lane', 'Go-behind if neck hides'],
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
    previewSequence: ['Mount isolation', 'Elbow line opens', 'Straight armbar from mount', 'Mounted triangle if posture stays bent'],
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
  },
  {
    title: 'Triangle-entry setups',
    lane: 'Submission',
    summary: 'Win the wrist, angle, or posture break first, then lock the triangle cleanly.',
    description:
      'This family is for collar-tie and wrist-control lanes, shoulder-crunch control, overhook clamps, and angle-building leg pummels that make the triangle, omoplata, or armbar chain open cleanly.',
    setupNodes: ['Collar Tie + Wrist Control', 'Shoulder Crunch', 'Overhook Clamp', 'Leg Pummel To Angle'],
    nextAttacks: ['Triangle Choke', 'Omoplata', 'Straight Armbar From Guard', 'Mounted Triangle'],
    previewSequence: ['Leg pummel to angle', 'Posture breaks forward', 'Triangle choke', 'Omoplata if they rip back'],
    exampleSequence: [
      'Collar tie + wrist control',
      'Angle opens',
      'Triangle choke',
      'They posture awkwardly',
      'Omoplata / armbar continuation'
    ],
    curriculumSearch: 'triangle choke',
    treeSearch: 'triangle choke',
    relatedTerms: ['triangle choke', 'mounted triangle', 'omoplata', 'straight armbar from guard', 'shoulder crunch', 'overhook clamp']
  },
  {
    title: 'Kimura-entry setups',
    lane: 'Submission',
    summary: 'Win the elbow and shoulder line first, then choose the best kimura-chain finish.',
    description:
      'This family is for wrist pins, hip-bump threats, overhook reactions, and trap-style control that open the kimura, tarikoplata, armbar, or back-take lane without forcing the finish too early.',
    setupNodes: ['Wrist Pin', 'Hip Bump Threat', 'Overhook Clamp', 'Kimura Trap'],
    nextAttacks: ['Kimura', 'Tarikoplata', 'Straight Armbar From Guard', 'Technical Mount To Back'],
    previewSequence: ['Kimura trap', 'Arm straightens', 'Tarikoplata', 'Back take if they turn away'],
    exampleSequence: [
      'Hip bump threat',
      'They post the hand',
      'Kimura grip connects',
      'They straighten the arm',
      'Tarikoplata / armbar continuation'
    ],
    curriculumSearch: 'kimura',
    treeSearch: 'kimura',
    relatedTerms: ['kimura', 'kimura trap', 'tarikoplata', 'straight armbar from guard', 'technical mount to back', 'overhook clamp']
  },
  {
    title: 'Omoplata-entry setups',
    lane: 'Submission',
    summary: 'Win the angle and shoulder line first, then let the omoplata open naturally.',
    description:
      'This family is for overhook clamps, collar-sleeve angles, triangle-to-omoplata reactions, and posture breaks that expose the shoulder without forcing the finish before the angle is there.',
    setupNodes: ['Overhook Clamp', 'Collar-Sleeve Angle', 'Triangle Reaction', 'Hip Angle Shift'],
    nextAttacks: ['Omoplata', 'Monoplata', 'Triangle Choke', 'Back Control'],
    previewSequence: ['Collar-sleeve angle', 'Shoulder stays exposed', 'Omoplata', 'Back control if they roll through'],
    exampleSequence: [
      'Overhook clamp',
      'They posture the shoulder line forward',
      'Omoplata lane opens',
      'They roll or posture awkwardly',
      'Triangle / back-take continuation'
    ],
    curriculumSearch: 'omoplata',
    treeSearch: 'omoplata',
    relatedTerms: ['omoplata', 'monoplata', 'triangle choke', 'collar-sleeve guard', 'overhook clamp', 'omoplata position']
  },
  {
    title: 'Guillotine-entry setups',
    lane: 'Submission',
    summary: 'Break posture or win the head position first, then choose the right guillotine finish.',
    description:
      'This family is for snap-downs, front-headlock catches, arm-in exposures, and seated-control reactions that make the guillotine, high-elbow guillotine, or go-behind lane open with much less force.',
    setupNodes: ['Snap Down', 'Front Headlock Catch', 'Arm-In Exposure', 'Seated Head Clamp'],
    nextAttacks: ['Guillotine', 'High Elbow Guillotine', 'Arm-In Guillotine', 'Front Headlock Go-Behind'],
    previewSequence: ['Front headlock catch', 'They drive deeper', 'Arm-in guillotine', 'Go-behind if the finish hides'],
    exampleSequence: [
      'Snap down',
      'Neck stays exposed',
      'Guillotine grip connects',
      'They hide the finish line',
      'High-elbow / go-behind continuation'
    ],
    curriculumSearch: 'guillotine',
    treeSearch: 'guillotine',
    relatedTerms: ['guillotine', 'high elbow guillotine', 'arm-in guillotine', 'front headlock', 'front headlock go-behind', 'snap down']
  },
  {
    title: 'Side-control submission setups',
    lane: 'Submission',
    summary: 'Win the far arm or head line first, then choose the finish instead of forcing it.',
    description:
      'This family is for side-control top players who need to isolate an arm, flatten the shoulders, or trap the near-side frame before kimuras, americanas, arm triangles, or side-control armbars really become available.',
    setupNodes: ['Crossface Pressure', 'Near-Side Underhook', 'Far-Arm Isolation', 'Kimura Trap'],
    nextAttacks: ['Kimura', 'Americana', 'Arm Triangle', 'Straight Armbar From Side Control'],
    previewSequence: ['Near-side underhook', 'Head and arm stay trapped', 'Arm triangle', 'Mount if they turn hard'],
    exampleSequence: [
      'Crossface pressure',
      'Far arm gets isolated',
      'Kimura / americana lane opens',
      'They turn the elbow line late',
      'Arm triangle / armbar continuation'
    ],
    curriculumSearch: 'side control',
    treeSearch: 'kimura',
    relatedTerms: ['side control', 'kimura', 'americana', 'arm triangle', 'straight armbar from side control', 'kimura trap']
  },
  {
    title: 'Mount legacy submission setups',
    lane: 'Submission',
    summary: 'Make the elbows separate and posture react before you chase the finish.',
    description:
      'This family is for mount situations where the real setup is climbing high, isolating an elbow, forcing a post, or feeding gift wrap before the arm triangle, mounted triangle, armbar, or americana lane becomes clean.',
    setupNodes: ['High Mount Climb', 'Gift Wrap', 'Elbow Walk Isolation', 'Cross-Wrist Pin'],
    nextAttacks: ['Arm Triangle', 'Mounted Triangle', 'Straight Armbar From Mount', 'Americana'],
    previewSequence: ['Gift wrap', 'They hide one elbow', 'Mounted triangle', 'Armbar if they extend late'],
    exampleSequence: [
      'High mount climb',
      'Elbow line separates',
      'Mounted triangle / armbar lane opens',
      'They turn and post late',
      'Arm triangle / americana continuation'
    ],
    curriculumSearch: 'mount',
    treeSearch: 'arm triangle',
    relatedTerms: ['mount', 'arm triangle', 'mounted triangle', 'straight armbar from mount', 'americana', 'gift wrap']
  },
  {
    title: 'Clamp-guard attack setups',
    lane: 'Submission',
    summary: 'Use clamp-style shoulder and posture control to open triangles, sweeps, and kimura lanes.',
    description:
      'This family is for clamp guard pressure, breaking posture, shoulder crunch-style control, and angle shifts that expose the triangle, clamp-guard sweep, kimura, or back-take chain without rushing the finish.',
    setupNodes: ['Clamp Pressure', 'Posture Break', 'Shoulder Crunch Tie-Up', 'Angle Shift'],
    nextAttacks: ['Clamp Guard Sweep', 'Triangle Choke', 'Kimura', 'Back Control'],
    previewSequence: ['Shoulder crunch tie-up', 'Elbow line opens', 'Kimura', 'Back control if they turn away'],
    exampleSequence: [
      'Clamp pressure',
      'Posture breaks toward the trapped side',
      'Triangle / sweep lane opens',
      'They post or hide the elbow',
      'Kimura / back-take continuation'
    ],
    curriculumSearch: 'clamp guard',
    treeSearch: 'clamp guard',
    relatedTerms: ['clamp guard', 'clamp guard sweep', 'triangle choke', 'kimura', 'back control', 'high guard']
  },
  {
    title: 'High-guard attack setups',
    lane: 'Submission',
    summary: 'Climb the legs high first, then force the armbar, triangle, or mount-transition lane to appear.',
    description:
      'This family is for high-guard climbing, elbow-line isolation, posture-breaking pulls, and shoulder-control reactions that make armbars, triangles, and mounted-triangle-style transitions much easier to finish cleanly.',
    setupNodes: ['Leg Climb High', 'Elbow-Line Isolation', 'Posture Pull', 'Shoulder Control'],
    nextAttacks: ['Triangle Choke', 'Armbar Position', 'Mounted Triangle', 'Omoplata'],
    previewSequence: ['Shoulder control', 'Arm stays inside', 'Armbar position', 'Mounted triangle if posture folds'],
    exampleSequence: [
      'Leg climb high',
      'Elbow line gets trapped',
      'Triangle / armbar lane opens',
      'They posture awkwardly',
      'Mounted-triangle / omoplata continuation'
    ],
    curriculumSearch: 'high guard',
    treeSearch: 'high guard',
    relatedTerms: ['high guard', 'triangle choke', 'armbar position', 'mounted triangle', 'omoplata']
  },
  {
    title: 'Rubber-guard attack setups',
    lane: 'Submission',
    summary: 'Use posture-breaking upper-body control to make the shoulder and neck line vulnerable.',
    description:
      'This family is for rubber guard, Williams guard, and related upper-body controls that create gogoplata, omoplata, triangle, or back-take lanes once the head and shoulder line get trapped in place.',
    setupNodes: ['Rubber Guard Clamp', 'Williams Guard Control', 'Crackhead Control', 'Meat Hook Transition'],
    nextAttacks: ['Gogoplata', 'Omoplata', 'Triangle Choke', 'Back Control'],
    previewSequence: ['Williams guard control', 'Head stays pinned', 'Gogoplata', 'Triangle if they posture out late'],
    exampleSequence: [
      'Rubber guard clamp',
      'Head and shoulder get pinned',
      'Gogoplata / omoplata lane opens',
      'They posture or circle late',
      'Triangle / back-take continuation'
    ],
    curriculumSearch: 'rubber guard',
    treeSearch: 'rubber guard',
    relatedTerms: ['rubber guard', 'williams guard', 'gogoplata', 'omoplata', 'triangle choke', 'back control']
  },
  {
    title: 'Open-guard submission setups',
    lane: 'Submission',
    summary: 'Use sleeve, collar, or leg-control reactions to create the submission before you force it.',
    description:
      'This family is for open-guard situations where the setup comes first: off-balancing through collar-sleeve, forcing a hand post, exposing the elbow line, or turning the shoulder so triangles, omoplatas, armbars, and guillotines open more cleanly.',
    setupNodes: ['Collar-Sleeve Angle', 'Overhook Clamp', 'Leg Pummel To Angle', 'Head Snap Sit-Up'],
    nextAttacks: ['Triangle Choke', 'Omoplata', 'Straight Armbar From Guard', 'Guillotine'],
    previewSequence: ['Head snap sit-up', 'Neck stays exposed', 'Guillotine', 'Triangle if they posture back out'],
    exampleSequence: [
      'Collar-sleeve angle',
      'They post the far hand',
      'Triangle / omoplata lane opens',
      'They hide the shoulder line late',
      'Armbar / guillotine continuation'
    ],
    curriculumSearch: 'open guard',
    treeSearch: 'triangle choke',
    relatedTerms: ['open guard', 'triangle choke', 'omoplata', 'straight armbar from guard', 'guillotine', 'collar-sleeve guard']
  },
  {
    title: 'Top-half-guard submission setups',
    lane: 'Submission',
    summary: 'Flatten the shoulders or isolate the far arm before you chase the finish from top half guard.',
    description:
      'This family is for top-half-guard pressure where the setup matters more than the finish itself: crossface wins, underhook climbs, kimura-trap reactions, and head-and-arm exposure that open kimuras, arm triangles, darces, and mounted armbars.',
    setupNodes: ['Crossface Pressure', 'Underhook Climb', 'Kimura Trap', 'Head-And-Arm Pin'],
    nextAttacks: ['Kimura', 'Arm Triangle', "D'Arce Choke", 'Straight Armbar From Mount'],
    previewSequence: ['Kimura trap', 'They turn the elbow line late', 'Kimura', 'Arm triangle if they hide the arm'],
    exampleSequence: [
      'Crossface pressure',
      'Underhook climb connects',
      'Head-and-arm lane opens',
      'They turn back to the mat',
      'Arm triangle / D’Arce continuation'
    ],
    curriculumSearch: 'top half guard',
    treeSearch: 'kimura',
    relatedTerms: ['top half guard', 'kimura', 'arm triangle', "d'arce choke", 'straight armbar from mount', 'kimura trap']
  },
  {
    title: 'North-south attack setups',
    lane: 'Submission',
    summary: 'Turn the shoulders and pin the elbows before you attack from north-south.',
    description:
      'This family is for top players who reach north-south through passing or top scrambles, then need to pin the shoulders, hide the elbows, or trap the near arm before the choke, kimura, or armbar line actually opens.',
    setupNodes: ['Shoulder Turn', 'Near-Arm Scoop', 'Elbow Hide Pressure', 'North-South Float'],
    nextAttacks: ['North-South Choke', 'Kimura', 'Straight Armbar From Side Control', 'Back Control'],
    previewSequence: ['Near-arm scoop', 'Elbow stays pinned', 'Kimura', 'North-south choke if the head stays trapped'],
    exampleSequence: [
      'Shoulder turn',
      'North-south float settles',
      'Elbow line gets hidden',
      'They frame late with the near arm',
      'North-south choke / kimura continuation'
    ],
    curriculumSearch: 'north south',
    treeSearch: 'north south choke',
    relatedTerms: ['north south', 'north south choke', 'kimura', 'straight armbar from side control', 'back control', 'side control']
  },
  {
    title: 'Back-control attack setups',
    lane: 'Submission',
    summary: 'Win the upper-body control and hide the escape hand before you chase the finish.',
    description:
      'This family is for back-control situations where the setup is really about hand-fighting, shoulder alignment, and seatbelt control before the rear naked choke, short choke, bow and arrow, or arm trap lane becomes clean.',
    setupNodes: ['Seatbelt Control', 'Straightjacket Trap', 'Cross-Wrist Peel', 'Shoulder-Line Hide'],
    nextAttacks: ['Rear Naked Choke', 'Short Choke', 'Bow And Arrow Choke', 'Arm Trap'],
    previewSequence: ['Cross-wrist peel', 'Escape hand gets hidden', 'Short choke', 'Rear naked choke if the chin slips high'],
    exampleSequence: [
      'Seatbelt control',
      'Shoulder-line hide wins',
      'Straightjacket trap connects',
      'They fight the choking hand late',
      'Rear naked choke / short-choke continuation'
    ],
    curriculumSearch: 'back control',
    treeSearch: 'rear naked choke',
    relatedTerms: ['back control', 'rear naked choke', 'short choke', 'bow and arrow choke', 'seatbelt', 'straightjacket control']
  },
  {
    title: 'K-guard attack setups',
    lane: 'Submission',
    summary: 'Use angle and leg-line wins to expose the heel or back-take lane from K-guard.',
    description:
      'This family is for K-guard entries where the setup is about angle first: hiding the knee line, elevating the hips, forcing a post, or turning the opponent so backside 50/50, inside heel hook, wrestle-up, or back-take chains appear naturally.',
    setupNodes: ['K-Guard Angle', 'Hip Elevation', 'Far-Hand Post', 'Inversion Threat'],
    nextAttacks: ['Backside 50/50', 'Inside Heel Hook', 'Wrestle-Up Single Leg Sweep', 'Back Control'],
    previewSequence: ['Far-hand post', 'Backside lane opens', 'Backside 50/50', 'Inside heel hook if the knee line stays trapped'],
    exampleSequence: [
      'K-guard angle',
      'Hip elevation creates the turn',
      'Backside 50/50 opens',
      'They keep the knee line shallow',
      'Inside heel hook / wrestle-up continuation'
    ],
    curriculumSearch: 'k guard',
    treeSearch: 'inside heel hook',
    relatedTerms: ['k guard', 'backside 50/50', 'inside heel hook', 'wrestle-up single leg sweep', 'back control', '50/50']
  },
  {
    title: 'Single-leg X sweep setups',
    lane: 'Guard',
    summary: 'Use kuzushi and ankle-line reactions to turn Single-Leg X into the standard sweep or direct leg attacks.',
    description:
      'This family is for Single-Leg X situations where the setup is about off-balancing first: lifting the base, steering the far hip, exposing the ankle line, or forcing the post so the standard sweep or direct ankle-lock variations open without detouring into a different position too early.',
    setupNodes: ['Ankle Steering', 'Far-Hip Kuzushi', 'Under-Leg Lift', 'Stand-Up Threat'],
    nextAttacks: ['Basic Single-Leg X Sweep', 'Single-Leg X Stand-Up Sweep', 'Tren Lock', 'Caio Terra Lock'],
    previewSequence: ['Stand-up threat', 'They post the far hand', 'Single-Leg X stand-up sweep', 'Tren Lock or Caio Terra Lock if the foot stays trapped'],
    exampleSequence: [
      'Far-hip kuzushi',
      'Base widens around the posting leg',
      'Ankle line stays exposed',
      'They sit the hips back late',
      'Basic Single-Leg X sweep / leg-lock continuation'
    ],
    curriculumSearch: 'single leg x',
    treeSearch: 'straight ankle lock',
    relatedTerms: ['single leg x', 'basic single-leg x sweep', 'single-leg x stand-up sweep', 'tren lock', 'caio terra lock', 'straight ankle lock', 'ashi garami']
  },
  {
    title: 'North-south passing setups',
    lane: 'Passing',
    summary: 'Use shoulder turns and hip redirects to arrive in north-south before the guard recovers.',
    description:
      'This family is for passing sequences that flow into north-south through cross-steps, stack pressure, float reactions, and shoulder-line wins rather than forcing the pin after the opponent has already recovered frames.',
    setupNodes: ['Cross-Step Turn', 'Stack Pressure', 'Float Redirect', 'Shoulder-Line Win'],
    nextAttacks: ['North-South Pass', 'North-South Choke', 'Kimura', 'Back Control'],
    previewSequence: ['Float redirect', 'Hips turn away', 'North-south pass', 'Kimura if the near arm lingers'],
    exampleSequence: [
      'Cross-step turn',
      'Shoulders get redirected off line',
      'North-south pass settles',
      'They reach late with the near arm',
      'North-south choke / kimura continuation'
    ],
    curriculumSearch: 'north south pass',
    treeSearch: 'north south pass',
    relatedTerms: ['north south pass', 'north south choke', 'kimura', 'back control', 'float pass', 'stack pass']
  },
  {
    title: 'Side-control passing transitions',
    lane: 'Passing',
    summary: 'Land the pass, then move immediately into stronger top control instead of stalling.',
    description:
      'This family is for the transition layer after the pass is mostly won: switching from side control into north-south, knee on belly, mount, or back exposure before the bottom player rebuilds frames or reguards.',
    setupNodes: ['Crossface Settle', 'Hip Switch', 'Near-Side Underhook', 'Far-Hip Block'],
    nextAttacks: ['Pass To Knee On Belly', 'Mount', 'North-South Pass', 'Back Control'],
    previewSequence: ['Hip switch', 'Frames chase late', 'North-south pass', 'Knee on belly if they square back in'],
    exampleSequence: [
      'Crossface settle',
      'Far-hip block wins',
      'Side control gets stabilized',
      'They turn into the pressure late',
      'Mount / north-south continuation'
    ],
    curriculumSearch: 'side control',
    treeSearch: 'pass to knee on belly',
    relatedTerms: ['side control', 'pass to knee on belly', 'mount', 'north south pass', 'back control', 'crossface']
  },
  {
    title: 'Top turtle setups',
    lane: 'Passing',
    summary: 'Use top pressure and angle wins to attack turtle before the opponent stands back up.',
    description:
      'This family is for top turtle situations where the setup is about shoulder pressure, hip control, and angle changes that open front headlocks, spiral rides, mat returns, or back takes before the bottom player escapes.',
    setupNodes: ['Front Headlock Clamp', 'Spiral Ride', 'Near-Hip Block', 'Seatbelt Chase'],
    nextAttacks: ['Front Headlock Go-Behind', 'Back Control', 'Mat Return', 'Punch Choke'],
    previewSequence: ['Spiral ride', 'Near hip gets pinned', 'Back control', 'Mat return if they stand back up'],
    exampleSequence: [
      'Front headlock clamp',
      'They square to turtle',
      'Near-hip block wins',
      'They build to a knee late',
      'Go-behind / mat-return continuation'
    ],
    curriculumSearch: 'turtle',
    treeSearch: 'front headlock',
    relatedTerms: ['turtle', 'front headlock go-behind', 'back control', 'mat return', 'punch choke', 'spiral ride']
  },
  {
    title: 'Leg-entanglement entry setups',
    lane: 'Standing',
    summary: 'Use transitions and off-balancing to enter leg-entanglement positions with control first.',
    description:
      'This family is for creating clean Ashi Garami and 50/50 entries through ankle exposure, seated-entry pulls, wrestle-up reactions, and turning the hips before you commit to the entanglement itself.',
    setupNodes: ['Ankle Exposure', 'Seated Pull-In', 'Hip Turn-Off', 'Wrestle-Up Redirect'],
    nextAttacks: ['Ashi Garami', '50/50', 'Backside 50/50', 'Straight Ankle Lock'],
    previewSequence: ['Seated pull-in', 'Hip turns off line', 'Ashi Garami', '50/50 if they square the knee line back in'],
    exampleSequence: [
      'Ankle exposure',
      'They pull the knee line back late',
      'Ashi Garami entry connects',
      'They re-square into the leg line',
      '50/50 / straight-ankle continuation'
    ],
    curriculumSearch: 'ashi garami',
    treeSearch: 'ashi garami',
    relatedTerms: ['ashi garami', '50/50', 'backside 50/50', 'straight ankle lock', 'single leg x', 'inside heel hook']
  },
  {
    title: 'Mount escape-to-reguard setups',
    lane: 'Guard',
    summary: 'Build frames and hip angle first so the reguard appears before the mount settles again.',
    description:
      'This family is for defensive recovery from mount where the setup is really the frame-and-hip work: elbow-knee connection, bridge reactions, and shoulder turns that reopen half guard, full guard, or wrestle-up space.',
    setupNodes: ['Elbow-Knee Frame', 'Bridge To Hip Turn', 'Forearm Frame', 'Knee-Recover Window'],
    nextAttacks: ['Half Guard Recovery', 'Closed Guard', 'Wrestle-Up Single Leg Sweep', 'Technical Stand-Up Sweep'],
    previewSequence: ['Bridge to hip turn', 'Knee-recover window opens', 'Half guard recovery', 'Wrestle-up if they overcommit on top'],
    exampleSequence: [
      'Elbow-knee frame',
      'Bridge shifts the mount high',
      'Knee-recover window opens',
      'They chase the mount late',
      'Half-guard / closed-guard continuation'
    ],
    curriculumSearch: 'mount escape',
    treeSearch: 'half guard',
    relatedTerms: ['mount escape', 'half guard recovery', 'closed guard', 'wrestle-up single leg sweep', 'technical stand-up sweep', 'knee elbow escape']
  },
  {
    title: 'Back escape setups',
    lane: 'Guard',
    summary: 'Hand-fight and shoulder-turn first, then use the escape to recover guard or counterattack.',
    description:
      'This family is for back-escape sequences where the setup is about stripping the choke hand, turning the shoulders, and reconnecting the hips so you can recover half guard, full guard, or come up on a leg if they overcommit.',
    setupNodes: ['Choking-Hand Strip', 'Shoulder Slide', 'Hip Scoot', 'Guard-Reconnect Window'],
    nextAttacks: ['Half Guard Recovery', 'Closed Guard', 'Single Leg', 'Top Turtle'],
    previewSequence: ['Shoulder slide', 'Bottom hip clears first', 'Half guard recovery', 'Single leg if they follow too far forward'],
    exampleSequence: [
      'Choking-hand strip',
      'Shoulder slide turns you down the safe side',
      'Guard-reconnect window opens',
      'They follow too far over the hips',
      'Half-guard / single-leg continuation'
    ],
    curriculumSearch: 'back escape',
    treeSearch: 'half guard',
    relatedTerms: ['back escape', 'half guard recovery', 'closed guard', 'single leg', 'top turtle', 'rear naked choke defense']
  },
  {
    title: 'Open-guard passing setups',
    lane: 'Passing',
    summary: 'Win the first angle and grip break before you try to run through open guard.',
    description:
      'This family is for passing open guard through grip breaks, ankle steering, outside-angle footwork, and body-position wins that create torreando, leg-drag, body-lock, or knee-cut lanes before the guard recenters.',
    setupNodes: ['Grip Break', 'Ankle Steering', 'Outside-Angle Step', 'Body Position Win'],
    nextAttacks: ['Torreando Pass', 'Leg Drag', 'Body Lock Pass', 'Knee Slice Pass'],
    previewSequence: ['Outside-angle step', 'Feet get turned off line', 'Torreando pass', 'Leg drag if they square back in'],
    exampleSequence: [
      'Grip break',
      'Ankle steering turns the hips away',
      'Outside-angle step opens the lane',
      'They chase the near side late',
      'Leg-drag / torreando continuation'
    ],
    curriculumSearch: 'open guard passing',
    treeSearch: 'torreando pass',
    relatedTerms: ['open guard passing', 'torreando pass', 'leg drag', 'body lock pass', 'knee slice pass', 'guard passing']
  },
  {
    title: 'North-south submission setups',
    lane: 'Submission',
    summary: 'Pin the shoulders and hide the elbows before you attack from north-south.',
    description:
      'This family is for north-south top positions where the setup is about shoulder turn, elbow hiding, and arm trapping before the north-south choke, kimura, or side-control armbar lane becomes clean.',
    setupNodes: ['Shoulder Turn', 'Elbow Hide Pressure', 'Near-Arm Scoop', 'North-South Float'],
    nextAttacks: ['North-South Choke', 'Kimura', 'Straight Armbar From Side Control', 'Back Control'],
    previewSequence: ['Elbow-hide pressure', 'Near arm stays trapped', 'North-south choke', 'Kimura if they flare the elbow out'],
    exampleSequence: [
      'Shoulder turn',
      'North-south float settles the pin',
      'Near arm gets scooped and hidden',
      'They frame late with the elbow line',
      'North-south choke / kimura continuation'
    ],
    curriculumSearch: 'north south choke',
    treeSearch: 'north south choke',
    relatedTerms: ['north south choke', 'kimura', 'straight armbar from side control', 'back control', 'north south', 'side control']
  },
  {
    title: 'Side-control escape setups',
    lane: 'Guard',
    summary: 'Create the frame and hip turn first, then recover guard before the top pressure settles again.',
    description:
      'This family is for side-control escapes where the setup is the real work: forearm frames, shoulder turns, knee-recovery windows, and underhook wins that let you recover half guard, full guard, or come up on a leg.',
    setupNodes: ['Forearm Frame', 'Shoulder Turn', 'Knee-Recover Window', 'Underhook Win'],
    nextAttacks: ['Half Guard Recovery', 'Closed Guard', 'Technical Stand-Up Sweep', 'Single Leg'],
    previewSequence: ['Underhook win', 'Top pressure drifts high', 'Single leg', 'Half guard if they sprawl back down'],
    exampleSequence: [
      'Forearm frame',
      'Shoulder turn creates the knee line',
      'Knee-recover window opens',
      'They chase the crossface late',
      'Half-guard / closed-guard continuation'
    ],
    curriculumSearch: 'side control escape',
    treeSearch: 'half guard',
    relatedTerms: ['side control escape', 'half guard recovery', 'closed guard', 'technical stand-up sweep', 'single leg', 'underhook']
  },
  {
    title: 'Half-guard bottom submission setups',
    lane: 'Submission',
    summary: 'Use bottom half-guard ties and angle changes to expose submissions instead of only sweeping.',
    description:
      'This family is for bottom half-guard attacks where the setup comes from shoulder crunches, overhook clamps, knee-shield angles, and head positioning that create kimura, guillotine, choi-bar, or triangle-style lanes.',
    setupNodes: ['Shoulder Crunch', 'Overhook Clamp', 'Knee-Shield Angle', 'Head Position Win'],
    nextAttacks: ['Kimura', 'Guillotine', 'Choi Bar', 'Triangle Choke'],
    previewSequence: ['Knee-shield angle', 'Head stays low', 'Guillotine', 'Kimura if they pull the elbow free'],
    exampleSequence: [
      'Shoulder crunch',
      'Elbow line stays trapped',
      'Choi Bar / kimura lane opens',
      'They posture and drive the head low late',
      'Triangle / guillotine continuation'
    ],
    curriculumSearch: 'half guard',
    treeSearch: 'kimura',
    relatedTerms: ['half guard', 'kimura', 'guillotine', 'choi bar', 'triangle choke', 'knee shield']
  },
  {
    title: 'Turtle escape setups',
    lane: 'Guard',
    summary: 'Build the hand fight and base first, then stand or wrestle up before top control settles.',
    description:
      'This family is for turtle escapes where the setup is about hand fighting, base-building, hip turns, and timing the stand-up or single-leg recovery before the top player locks down the ride or back take.',
    setupNodes: ['Hand Fight Clear', 'Base Build', 'Hip Turn Window', 'Peek-Out Threat'],
    nextAttacks: ['Technical Stand-Up Sweep', 'Single Leg', 'Front Headlock Standing', 'Closed Guard'],
    previewSequence: ['Peek-out threat', 'Top player overcommits forward', 'Single leg', 'Technical stand-up if they release the waist'],
    exampleSequence: [
      'Hand fight clear',
      'Base build creates the stand-up window',
      'Hip turn opens the angle',
      'They chase the waist late',
      'Single-leg / technical-stand-up continuation'
    ],
    curriculumSearch: 'turtle escape',
    treeSearch: 'single leg',
    relatedTerms: ['turtle escape', 'technical stand-up sweep', 'single leg', 'front headlock standing', 'closed guard', 'peek out']
  },
  {
    title: 'Leg-drag counter / reguard setups',
    lane: 'Guard',
    summary: 'Use hip turns and frames to turn the leg-drag threat into a reguard or counterattack.',
    description:
      'This family is for bottom players dealing with the leg drag by framing, turning the hips, and reconnecting hooks so they can recover guard, invert, wrestle up, or expose a leg-entanglement lane instead of just holding on.',
    setupNodes: ['Hip Turn Frame', 'Far-Hip Post', 'Inside-Knee Reconnect', 'Inversion Threat'],
    nextAttacks: ['Open Guard Recovery', 'Single-Leg X', 'Technical Stand-Up Sweep', 'Wrestle-Up Single Leg Sweep'],
    previewSequence: ['Inversion threat', 'Leg line gets light', 'Single-Leg X', 'Wrestle-up if they back out of the entanglement'],
    exampleSequence: [
      'Hip turn frame',
      'Inside knee reconnects the guard line',
      'Far-hip post creates the angle',
      'They back out of the drag late',
      'Open-guard / Single-Leg X continuation'
    ],
    curriculumSearch: 'leg drag',
    treeSearch: 'single leg x',
    relatedTerms: ['leg drag', 'open guard recovery', 'single leg x', 'technical stand-up sweep', 'wrestle-up single leg sweep', 'inversion']
  },
  {
    title: 'Mount escape setups',
    lane: 'Guard',
    summary: 'Use the mount escape to recover the leg line, then convert that space into Single-Leg X.',
    description:
      'This family is for mount escapes where the initial goal is survival, but the real opportunity appears when the top player posts or widens the base enough for the leg line to reconnect into Single-Leg X, technical stand-ups, or ankle attacks.',
    setupNodes: ['Elbow-Knee Frame', 'Bridge To Knee Line', 'Leg Pummel Reconnect', 'Far-Leg Catch'],
    nextAttacks: ['Single-Leg X', 'Straight Ankle Lock', 'Technical Stand-Up Sweep', 'Wrestle-Up Single Leg Sweep'],
    previewSequence: ['Bridge to knee line', 'Far leg gets light', 'Single-Leg X', 'Straight ankle lock if they sit back in'],
    exampleSequence: [
      'Elbow-knee frame',
      'Bridge reconnects the knee line',
      'Far-leg catch opens the entanglement',
      'They widen the base late',
      'Single-Leg X / technical-stand-up continuation'
    ],
    curriculumSearch: 'mount escape',
    treeSearch: 'single leg x',
    relatedTerms: ['mount escape', 'single leg x', 'straight ankle lock', 'technical stand-up sweep', 'wrestle-up single leg sweep', 'ashi garami']
  },
  {
    title: 'North-south escape-to-reguard setups',
    lane: 'Guard',
    summary: 'Frame and shoulder-turn first so north-south pressure becomes a reguard window instead of a stall.',
    description:
      'This family is for escaping north-south by rebuilding frames, turning the shoulders, reconnecting the hips, and finding the near leg before the top player settles back into side control or switches to a choke.',
    setupNodes: ['Shoulder Turn', 'Near-Elbow Frame', 'Hip Reconnect', 'Near-Leg Catch'],
    nextAttacks: ['Open Guard Recovery', 'Half Guard Recovery', 'Single-Leg X', 'Technical Stand-Up Sweep'],
    previewSequence: ['Near-elbow frame', 'Hips reconnect underneath', 'Open guard recovery', 'Single-Leg X if the leg line stays close'],
    exampleSequence: [
      'Shoulder turn',
      'Near-elbow frame buys the hip line',
      'Near-leg catch opens the reguard window',
      'They float back toward side control late',
      'Open-guard / half-guard continuation'
    ],
    curriculumSearch: 'north south escape',
    treeSearch: 'open guard',
    relatedTerms: ['north south escape', 'open guard recovery', 'half guard recovery', 'single leg x', 'technical stand-up sweep', 'side control escape']
  },
  {
    title: 'Seatbelt / back-take entry setups',
    lane: 'Standing',
    summary: 'Win the shoulder line and seatbelt first, then let the back take or mat return appear.',
    description:
      'This family is for creating the seatbelt and back-take lane through arm drags, snap-downs, spiral rides, and duck-under reactions before the opponent squares up or clears the hips.',
    setupNodes: ['Arm Drag', 'Duck Under', 'Snap Down', 'Seatbelt Chase'],
    nextAttacks: ['Back Control', 'Rear Body Lock Standing', 'Mat Return', 'Front Headlock Go-Behind'],
    previewSequence: ['Duck under', 'Seatbelt chase wins', 'Back control', 'Mat return if they stay standing'],
    exampleSequence: [
      'Arm drag',
      'Shoulder line opens behind the hips',
      'Seatbelt chase connects',
      'They keep the base under them late',
      'Back control / mat-return continuation'
    ],
    curriculumSearch: 'seatbelt',
    treeSearch: 'back take',
    relatedTerms: ['seatbelt', 'back take', 'back control', 'rear body lock standing', 'mat return', 'front headlock go behind']
  },
  {
    title: 'Crab-ride attack setups',
    lane: 'Guard',
    summary: 'Use leg entries and hip turns to connect to crab ride before the back take opens.',
    description:
      'This family is for guard-based entries where the real setup is getting the hips turned and the legs connected first, so crab ride, back takes, wrestle-ups, and backside angles become available without a scramble guessing match.',
    setupNodes: ['Leg Pummel', 'Hip Turn-Off', 'Backside Angle', 'Far-Hip Pull'],
    nextAttacks: ['Crab Ride', 'Back Control', 'Backside 50/50', 'Wrestle-Up Single Leg Sweep'],
    previewSequence: ['Backside angle', 'Far hip gets pulled across', 'Crab ride', 'Back control if they keep turning away'],
    exampleSequence: [
      'Leg pummel',
      'Hip turn-off opens the backside angle',
      'Far-hip pull connects the ride',
      'They keep trying to turn away late',
      'Crab-ride / back-control continuation'
    ],
    curriculumSearch: 'crab ride',
    treeSearch: 'crab ride',
    relatedTerms: ['crab ride', 'back control', 'backside 50/50', 'wrestle-up single leg sweep', 'k guard', 'leg pummel']
  },
  {
    title: 'Standing front-headlock finish setups',
    lane: 'Standing',
    summary: 'Break posture and angle the head first so the standing front-headlock finishes feel earned.',
    description:
      'This family is for standing front-headlock situations where the setup is the finish: shoulder drops, angle changes, elbow control, and head position that create clean guillotine, D’Arce, anaconda, or snap-to-go-behind lanes.',
    setupNodes: ['Shoulder Drop', 'Angle Step', 'Elbow Control', 'Head Clamp'],
    nextAttacks: ['Guillotine', "D'Arce Choke", 'Anaconda Choke', 'Front Headlock Go-Behind'],
    previewSequence: ['Angle step', 'Elbow stays trapped', 'D’Arce choke', 'Go-behind if the neck line slips free'],
    exampleSequence: [
      'Shoulder drop',
      'Head clamp wins the posture break',
      'Elbow control opens the angle',
      'They hide the neck line late',
      'Guillotine / go-behind continuation'
    ],
    curriculumSearch: 'front headlock standing',
    treeSearch: 'front headlock',
    relatedTerms: ['front headlock standing', 'guillotine', "d'arce choke", 'anaconda choke', 'front headlock go-behind', 'snap down']
  },
  {
    title: 'Guard retention setups',
    lane: 'Guard',
    summary: 'Use retention reactions to create the counter instead of only surviving the pass attempt.',
    description:
      'This family is for turning guard retention into offense through leg pummels, hip turns, frames, and off-balancing reactions that reopen open guard, create wrestle-ups, or expose Single-Leg X and sweep lanes.',
    setupNodes: ['Leg Pummel', 'Hip Turn', 'Frame Rebuild', 'Far-Hip Off-Balance'],
    nextAttacks: ['Open Guard Recovery', 'Single-Leg X', 'Wrestle-Up Single Leg Sweep', 'Technical Stand-Up Sweep'],
    previewSequence: ['Far-hip off-balance', 'Base gets light', 'Wrestle-up single leg sweep', 'Open guard if they pull the leg away'],
    exampleSequence: [
      'Leg pummel',
      'Hip turn rebuilds the guard line',
      'Frame rebuild redirects the pressure',
      'They post the far hand late',
      'Single-Leg-X / wrestle-up continuation'
    ],
    curriculumSearch: 'guard retention',
    treeSearch: 'open guard',
    relatedTerms: ['guard retention', 'open guard recovery', 'single leg x', 'wrestle-up single leg sweep', 'technical stand-up sweep', 'leg pummel']
  },
  {
    title: '50/50 counter setups',
    lane: 'Guard',
    summary: 'Clear the immediate danger first, then turn 50/50 defense into a sweep, stand-up, or counter leg attack.',
    description:
      'This family is for 50/50 exchanges where the setup is defensive first: hand fighting, knee-line clearing, hip turning, and freeing the heel so you can stand, sweep, or counter into your own leg attack instead of just surviving the entanglement.',
    setupNodes: ['Hand Fight Clear', 'Knee-Line Slip', 'Heel Hide Turn', 'Stand-Up Window'],
    nextAttacks: ['Basic 50/50 Sweep', 'Standing', 'Straight Ankle Lock', 'Backside 50/50'],
    previewSequence: ['Knee-line slip', 'Heel clears the breaking line', 'Stand up', 'Straight ankle lock if they keep the leg extended'],
    exampleSequence: [
      'Hand fight clear',
      'Knee-line slip creates the turn',
      'Heel-hide turn reduces the pressure',
      'They keep the leg line hanging late',
      'Basic 50/50 sweep / straight-ankle continuation'
    ],
    curriculumSearch: '50/50',
    treeSearch: '50/50',
    relatedTerms: ['50/50', 'basic 50/50 sweep', 'straight ankle lock', 'backside 50/50', 'standing', 'heel hook line defense']
  },
  {
    title: 'Top-half-guard passing transitions',
    lane: 'Passing',
    summary: 'Win the chest position and far hip first, then flow from top half guard into stronger passing finishes.',
    description:
      'This family is for the transition layer from top half guard into knee cuts, smash passes, backsteps, and mount as the bottom player turns, frames, or exposes the far hip while trying to rebuild guard.',
    setupNodes: ['Crossface Settle', 'Far-Hip Block', 'Underhook Climb', 'Hip Switch'],
    nextAttacks: ['Knee Cut', 'Half Guard Smash Pass', 'Backstep Half Guard Pass', 'Mount'],
    previewSequence: ['Hip switch', 'Bottom knee line gets stapled', 'Backstep half-guard pass', 'Mount if they turn back in late'],
    exampleSequence: [
      'Crossface settle',
      'Far-hip block prevents the reguard',
      'Underhook climb starts the pass',
      'They frame and turn late',
      'Knee-cut / smash-pass continuation'
    ],
    curriculumSearch: 'top half guard',
    treeSearch: 'knee cut',
    relatedTerms: ['top half guard', 'knee cut', 'half guard smash pass', 'backstep half guard pass', 'mount', 'crossface']
  },
  {
    title: 'Turtle top submission setups',
    lane: 'Submission',
    summary: 'Pin the shoulder line and hide the escape space before you attack submissions from top turtle.',
    description:
      'This family is for top turtle situations where the finish only opens after you flatten, trap an elbow, or win the head-and-arm line enough for guillotines, Darces, anacondas, and punch-choke-style attacks to become clean.',
    setupNodes: ['Front Headlock Clamp', 'Spiral Ride Flatten', 'Near-Elbow Trap', 'Shoulder Turn'],
    nextAttacks: ['Guillotine', "D'Arce Choke", 'Anaconda Choke', 'Punch Choke'],
    previewSequence: ['Spiral ride flatten', 'Near elbow gets trapped', 'Punch choke', 'D’Arce if the head stays turned in'],
    exampleSequence: [
      'Front headlock clamp',
      'Shoulder turn flattens the turtle line',
      'Near-elbow trap closes the escape space',
      'They keep the neck line extended late',
      'Guillotine / D’Arce continuation'
    ],
    curriculumSearch: 'turtle',
    treeSearch: 'front headlock',
    relatedTerms: ['turtle', 'guillotine', "d'arce choke", 'anaconda choke', 'punch choke', 'front headlock']
  },
  {
    title: 'Closed-guard retention-to-wrestle-up setups',
    lane: 'Guard',
    summary: 'Use the guard-reopening reaction to build a wrestle-up instead of only re-closing the guard.',
    description:
      'This family is for moments when closed guard breaks open and the setup becomes a transition: hand posts, hip scoots, collar pulls, and knee-line connections that reopen seated guard, shin-to-shin, or a direct wrestle-up path.',
    setupNodes: ['Collar Pull', 'Hand Post Read', 'Hip Scoot Out', 'Knee-Line Reconnect'],
    nextAttacks: ['Shin-To-Shin', 'Wrestle-Up Single Leg Sweep', 'Single-Leg X', 'Technical Stand-Up Sweep'],
    previewSequence: ['Hand post read', 'Guard opens on your timing', 'Shin-to-shin', 'Wrestle-up if they keep the weight forward'],
    exampleSequence: [
      'Collar pull',
      'They post and open the guard line',
      'Hip scoot out reconnects the knee line',
      'They keep leaning forward late',
      'Shin-to-shin / wrestle-up continuation'
    ],
    curriculumSearch: 'closed guard',
    treeSearch: 'shin to shin',
    relatedTerms: ['closed guard', 'shin to shin', 'wrestle-up single leg sweep', 'single leg x', 'technical stand-up sweep', 'seated guard']
  },
  {
    title: 'Outside-ashi attack setups',
    lane: 'Guard',
    summary: 'Use outside-leg exposure and hip alignment to build direct ankle and heel attacks.',
    description:
      'This family is for outside-ashi situations where the setup comes from turning the knee line, exposing the ankle, and controlling the outside hip enough for straight ankle locks, Aoki locks, outside heel hooks, or top-finishing transitions.',
    setupNodes: ['Outside Leg Exposure', 'Hip Turn-Off', 'Knee-Line Clamp', 'Foot-Line Catch'],
    nextAttacks: ['Straight Ankle Lock', 'Aoki Lock', 'Outside Heel Hook', 'Leg Drag'],
    previewSequence: ['Hip turn-off', 'Ankle line stays exposed', 'Aoki Lock', 'Leg drag if they boot and pull free'],
    exampleSequence: [
      'Outside leg exposure',
      'Knee-line clamp holds the turn',
      'Foot-line catch sharpens the bite',
      'They boot and turn late',
      'Straight-ankle / outside-heel continuation'
    ],
    curriculumSearch: 'outside ashi',
    treeSearch: 'straight ankle lock',
    relatedTerms: ['outside ashi', 'straight ankle lock', 'aoki lock', 'outside heel hook', 'leg drag', 'ashi garami']
  },
  {
    title: 'Front-headlock defense-to-wrestle-up setups',
    lane: 'Guard',
    summary: 'Clear the head line first, then turn the front-headlock defense into a stand-up or counterattack.',
    description:
      'This family is for moments when someone snaps on the front headlock and the setup becomes defensive first: hand fighting, shoulder-posture recovery, hip turns, and angle changes that let you stand, come up on a leg, or reset to guard with initiative.',
    setupNodes: ['Hand Fight Clear', 'Shoulder Posture Recover', 'Hip Turn-Out', 'Peek-To-Leg'],
    nextAttacks: ['Single Leg', 'Technical Stand-Up Sweep', 'Open Guard Recovery', 'Shin-To-Shin'],
    previewSequence: ['Hip turn-out', 'Head line clears', 'Single leg', 'Shin-to-shin if they sprawl back over you'],
    exampleSequence: [
      'Hand fight clear',
      'Shoulder posture recover rebuilds the base',
      'Hip turn-out creates the angle',
      'They stay heavy over the head late',
      'Single-leg / stand-up continuation'
    ],
    curriculumSearch: 'front headlock defense',
    treeSearch: 'single leg',
    relatedTerms: ['front headlock defense', 'single leg', 'technical stand-up sweep', 'open guard recovery', 'shin to shin', 'front headlock']
  },
  {
    title: 'De La Riva footlock setups',
    lane: 'Guard',
    summary: 'Use De La Riva angle and outside-leg control to expose the footlock before the passer squares up.',
    description:
      'This family is for De La Riva and open-guard one-leg attachment situations where the setup is about turning the hip line, keeping the outside hook alive, and exposing the ankle before the Caio Terra Lock, straight ankle, or sweep lane opens.',
    setupNodes: ['De La Riva Hook', 'Outside-Hip Turn', 'Ankle Exposure', 'Foot-Line Catch'],
    nextAttacks: ['Caio Terra Lock', 'Straight Ankle Lock', 'Basic De La Riva Off-Balance Sweep', 'Single-Leg X'],
    previewSequence: ['Outside-hip turn', 'Foot line stays exposed', 'Caio Terra Lock', 'Single-Leg X if they clear the DLR hook'],
    exampleSequence: [
      'De La Riva hook',
      'Outside-hip turn bends the angle',
      'Ankle exposure keeps the foot available',
      'They try to clear the hook late',
      'Caio Terra Lock / straight-ankle continuation'
    ],
    curriculumSearch: 'de la riva',
    treeSearch: 'caio terra lock',
    relatedTerms: ['de la riva', 'caio terra lock', 'straight ankle lock', 'basic de la riva off-balance sweep', 'single leg x', 'dlr footlock']
  },
  {
    title: 'Ashi defense-to-stand-up setups',
    lane: 'Guard',
    summary: 'Clear the immediate Ashi threat first, then turn the escape into a stand-up or reguard.',
    description:
      'This family is for Ashi Garami defense where the setup is defensive first: hand fighting, knee-line clearing, hip turns, and posture rebuilding that let you stand, reguard, or counter before the entanglement tightens again.',
    setupNodes: ['Hand Fight Clear', 'Knee-Line Slip', 'Hip Turn-Up', 'Stand-Up Window'],
    nextAttacks: ['Standing', 'Open Guard Recovery', 'Single-Leg X', 'Straight Ankle Lock'],
    previewSequence: ['Knee-line slip', 'Hip turns back upright', 'Stand up', 'Single-Leg X if they keep the foot attached'],
    exampleSequence: [
      'Hand fight clear',
      'Knee-line slip creates the opening',
      'Hip turn-up rebuilds posture',
      'They stay connected to the foot late',
      'Standing / reguard continuation'
    ],
    curriculumSearch: 'ashi garami defense',
    treeSearch: 'standing',
    relatedTerms: ['ashi garami defense', 'standing', 'open guard recovery', 'single leg x', 'straight ankle lock boot defense', 'heel hook line defense']
  },
  {
    title: 'Top side-control-to-back setups',
    lane: 'Passing',
    summary: 'Use shoulder turns and hip blocks to make the back-take appear from top side control.',
    description:
      'This family is for top side-control players who want the back, not just a pin. The setup is about crossface pressure, near-hip blocks, elbow isolation, and forcing the turn until the back-control lane becomes clean.',
    setupNodes: ['Crossface Pressure', 'Near-Hip Block', 'Elbow Isolation', 'Shoulder Turn'],
    nextAttacks: ['Back Control', 'Technical Mount To Back', 'Seatbelt', 'Mat Return'],
    previewSequence: ['Near-hip block', 'They turn away to recover', 'Technical mount to back', 'Seatbelt if they keep rising'],
    exampleSequence: [
      'Crossface pressure',
      'Near-hip block stops the reguard',
      'Shoulder turn forces the exposure',
      'They keep turning away late',
      'Back-control / seatbelt continuation'
    ],
    curriculumSearch: 'side control',
    treeSearch: 'back control',
    relatedTerms: ['side control', 'back control', 'technical mount to back', 'seatbelt', 'mat return', 'crossface']
  },
  {
    title: 'Knee-shield retention-to-underhook setups',
    lane: 'Guard',
    summary: 'Use the knee shield to survive first, then win the underhook lane back into offense.',
    description:
      'This family is for knee-shield half-guard situations where the setup is about frame recovery, head position, and timing the underhook so you can come up, dogfight, or reconnect stronger half-guard offense instead of only stalling.',
    setupNodes: ['Knee-Shield Frame', 'Head Position Win', 'Inside Elbow Lift', 'Underhook Pummel'],
    nextAttacks: ['Underhook Half Guard', 'Dogfight', 'Wrestle-Up Single Leg Sweep', 'Shoulder Crunch'],
    previewSequence: ['Head position win', 'Underhook pummel connects', 'Dogfight', 'Wrestle-up if they keep the weight forward'],
    exampleSequence: [
      'Knee-shield frame',
      'Inside elbow lift makes the space',
      'Underhook pummel reconnects offense',
      'They stay heavy over the shoulder late',
      'Dogfight / wrestle-up continuation'
    ],
    curriculumSearch: 'knee shield',
    treeSearch: 'underhook half guard',
    relatedTerms: ['knee shield', 'underhook half guard', 'dogfight', 'wrestle-up single leg sweep', 'shoulder crunch', 'half guard']
  },
  {
    title: 'Body-lock passing counters',
    lane: 'Guard',
    summary: 'Use frames and hip redirection to turn the body-lock pass attempt into reguards or counters.',
    description:
      'This family is for defending body-lock passing by rebuilding frames, turning the hips, and reconnecting guard before the passer settles chest-to-chest. From there, the counter can become open guard, shin-to-shin, a wrestle-up, or a leg-entanglement lane.',
    setupNodes: ['Frame Rebuild', 'Hip Turn-Out', 'Inside-Knee Reconnect', 'Shin Re-Pummel'],
    nextAttacks: ['Open Guard Recovery', 'Shin-To-Shin', 'Wrestle-Up Single Leg Sweep', 'Single-Leg X'],
    previewSequence: ['Hip turn-out', 'Inside knee reconnects', 'Shin-to-shin', 'Wrestle-up if they keep driving forward'],
    exampleSequence: [
      'Frame rebuild',
      'Hip turn-out creates the first gap',
      'Inside-knee reconnect wins the guard line',
      'They keep chasing the hips late',
      'Open-guard / wrestle-up continuation'
    ],
    curriculumSearch: 'body lock pass',
    treeSearch: 'open guard',
    relatedTerms: ['body lock pass', 'open guard recovery', 'shin to shin', 'wrestle-up single leg sweep', 'single leg x', 'guard retention']
  },
  {
    title: 'Front-headlock defense-to-guard-recovery setups',
    lane: 'Guard',
    summary: 'Break the front-headlock line first, then use the escape to rebuild guard instead of forcing a stand-up every time.',
    description:
      'This family is for front-headlock defense where the best next answer is reguarding: hand fighting, hip turns, shoulder-posture recovery, and shin insertion that let you rebuild open guard, shin-to-shin, or knee-shield structure after clearing the head line.',
    setupNodes: ['Hand Fight Clear', 'Shoulder Posture Recover', 'Hip Turn-In', 'Shin Insert'],
    nextAttacks: ['Open Guard Recovery', 'Shin-To-Shin', 'Knee Shield Half Guard', 'Single-Leg X'],
    previewSequence: ['Hip turn-in', 'Shin inserts under the chest line', 'Open guard recovery', 'Single-Leg X if the foot stays close'],
    exampleSequence: [
      'Hand fight clear',
      'Shoulder posture recover opens the head line',
      'Hip turn-in creates the shin-insertion window',
      'They stay draped over the shoulders late',
      'Open-guard / knee-shield continuation'
    ],
    curriculumSearch: 'front headlock defense',
    treeSearch: 'open guard',
    relatedTerms: ['front headlock defense', 'open guard recovery', 'shin to shin', 'knee shield half guard', 'single leg x', 'guard recovery']
  },
  {
    title: 'Waiter-guard attack setups',
    lane: 'Guard',
    summary: 'Use the waiter angle and leg elevation to expose sweeps, leg entanglements, or backside lanes.',
    description:
      'This family is for waiter-style guard entries where the setup is about getting under the hips, elevating the leg line, and turning the angle enough for sweeps, Single-Leg X, backside entries, or leg attacks to appear cleanly.',
    setupNodes: ['Under-Hip Scoop', 'Leg Elevation', 'Angle Turn', 'Far-Hip Lift'],
    nextAttacks: ['Deep Half Waiter Sweep', 'Single-Leg X', 'Backside 50/50', 'Ashi Garami'],
    previewSequence: ['Leg elevation', 'Angle turn opens the backside', 'Backside 50/50', 'Single-Leg X if they square the hips back in'],
    exampleSequence: [
      'Under-hip scoop',
      'Far-hip lift tilts the base',
      'Angle turn opens the sweep line',
      'They square the hips back in late',
      'Waiter sweep / leg-entry continuation'
    ],
    curriculumSearch: 'waiter guard',
    treeSearch: 'single leg x',
    relatedTerms: ['waiter guard', 'deep half waiter sweep', 'single leg x', 'backside 50/50', 'ashi garami', 'deep half guard']
  },
  {
    title: 'Baby-bolo / backside-entry setups',
    lane: 'Guard',
    summary: 'Use inversion and hip-turn reactions to create the backside lane before the back or leg entry opens.',
    description:
      'This family is for baby-bolo and backside entries where the setup is about inversion timing, hip rotation, and keeping the far hip connected long enough to reach the back, crab ride, or backside 50/50 without losing the angle.',
    setupNodes: ['Inversion Entry', 'Far-Hip Catch', 'Hip Rotation', 'Backside Angle'],
    nextAttacks: ['Backside 50/50', 'Crab Ride', 'Back Control', 'Kiss Of The Dragon'],
    previewSequence: ['Far-hip catch', 'Backside angle stays connected', 'Crab ride', 'Back control if they keep turning away'],
    exampleSequence: [
      'Inversion entry',
      'Far-hip catch wins the backside angle',
      'Hip rotation keeps the entry alive',
      'They continue turning away late',
      'Backside-50/50 / back-take continuation'
    ],
    curriculumSearch: 'baby bolo',
    treeSearch: 'backside 50/50',
    relatedTerms: ['baby bolo', 'backside 50/50', 'crab ride', 'back control', 'kiss of the dragon', 'berimbolo']
  },
  {
    title: 'Leg-drag passing-to-submission setups',
    lane: 'Passing',
    summary: 'Use the leg drag to flatten the shoulders and expose submissions instead of only settling the pass.',
    description:
      'This family is for top players who already win the leg drag and want the next layer: shoulder flattening, near-arm trapping, and hip pinning that open kimuras, north-south attacks, mount armbars, or quick back takes.',
    setupNodes: ['Shoulder Flatten', 'Near-Arm Trap', 'Hip Pin', 'Crossface Settle'],
    nextAttacks: ['Kimura', 'North-South Choke', 'Straight Armbar From Mount', 'Back Control'],
    previewSequence: ['Near-arm trap', 'Shoulders stay flat', 'Kimura', 'Back control if they turn away under pressure'],
    exampleSequence: [
      'Shoulder flatten',
      'Hip pin prevents the reguard',
      'Near-arm trap closes the escape space',
      'They turn away late',
      'Kimura / north-south continuation'
    ],
    curriculumSearch: 'leg drag',
    treeSearch: 'kimura',
    relatedTerms: ['leg drag', 'kimura', 'north south choke', 'straight armbar from mount', 'back control', 'north south']
  },
  {
    title: 'Top-half-guard submission transitions',
    lane: 'Submission',
    summary: 'Use top-half pressure to flow directly into submissions instead of only finishing the pass first.',
    description:
      'This family is for top-half-guard moments where the setup is already there: crossface pressure, underhook climbs, kimura traps, and head-and-arm pins that make the submission lane open before the opponent fully loses the half guard.',
    setupNodes: ['Crossface Pressure', 'Underhook Climb', 'Kimura Trap', 'Head-And-Arm Pin'],
    nextAttacks: ['Kimura', 'Arm Triangle', "D'Arce Choke", 'Punch Choke'],
    previewSequence: ['Head-and-arm pin', 'Neck line stays extended', 'D’Arce choke', 'Arm triangle if they flatten back out'],
    exampleSequence: [
      'Crossface pressure',
      'Underhook climb keeps the shoulders pinned',
      'Kimura trap or head-and-arm lane appears',
      'They turn the elbow line late',
      'Kimura / D’Arce / arm-triangle continuation'
    ],
    curriculumSearch: 'top half guard',
    treeSearch: 'arm triangle',
    relatedTerms: ['top half guard', 'kimura', 'arm triangle', "d'arce choke", 'punch choke', 'kimura trap']
  },
  {
    title: 'Bottom-side-control-to-single-leg setups',
    lane: 'Guard',
    summary: 'Use the escape window to come up on a leg instead of only recovering guard.',
    description:
      'This family is for bottom side-control situations where the escape setup becomes a wrestle-up: frames, shoulder turns, underhook wins, and hip movement that let you come to a single leg before the top player resets the chest pin.',
    setupNodes: ['Forearm Frame', 'Shoulder Turn', 'Underhook Win', 'Hip Scoot Out'],
    nextAttacks: ['Single Leg', 'Technical Stand-Up Sweep', 'Half Guard Recovery', 'Shin-To-Shin'],
    previewSequence: ['Underhook win', 'Chest line gets light', 'Single leg', 'Half guard if they sprawl back over you'],
    exampleSequence: [
      'Forearm frame',
      'Shoulder turn creates the underhook window',
      'Hip scoot out brings you under the base',
      'They try to square back down late',
      'Single-leg / half-guard continuation'
    ],
    curriculumSearch: 'side control escape',
    treeSearch: 'single leg',
    relatedTerms: ['side control escape', 'single leg', 'technical stand-up sweep', 'half guard recovery', 'shin to shin', 'underhook']
  },
  {
    title: 'Mount retention-to-attack setups',
    lane: 'Submission',
    summary: 'Use the retention reactions from mount to reopen your attack instead of restarting from neutral mount.',
    description:
      'This family is for mount top players who lose part of the position and need to rebuild pressure into offense again through cross-wrist pins, gift wrap control, elbow walks, and shoulder pressure that reopen triangles, armbars, and arm triangles.',
    setupNodes: ['Cross-Wrist Pin', 'Gift Wrap Reconnect', 'Elbow Walk', 'Shoulder Pressure'],
    nextAttacks: ['Mounted Triangle', 'Straight Armbar From Mount', 'Arm Triangle', 'Americana'],
    previewSequence: ['Gift-wrap reconnect', 'Shoulders stay pinned', 'Mounted triangle', 'Armbar if they extend the elbow late'],
    exampleSequence: [
      'Cross-wrist pin',
      'Elbow walk rebuilds the high mount line',
      'Shoulder pressure keeps the posture folded',
      'They extend the elbow or turn late',
      'Triangle / armbar / arm-triangle continuation'
    ],
    curriculumSearch: 'mount',
    treeSearch: 'mounted triangle',
    relatedTerms: ['mount', 'mounted triangle', 'straight armbar from mount', 'arm triangle', 'americana', 'gift wrap']
  },
  {
    title: 'Shin-to-shin attack setups',
    lane: 'Guard',
    summary: 'Use shin-to-shin control to create sweeps, leg entries, or stand-up attacks before the top player resets.',
    description:
      'This family is for shin-to-shin situations where the setup is about getting under the hips, controlling the far side, and timing the stand-up or leg entry before the top player clears the shin connection.',
    setupNodes: ['Shin Clamp', 'Far-Hand Post', 'Stand-Up Threat', 'Hip Pull-In'],
    nextAttacks: ['Single-Leg X', 'Wrestle-Up Single Leg Sweep', 'Technical Stand-Up Sweep', 'Ashi Garami'],
    previewSequence: ['Stand-up threat', 'Far hand posts forward', 'Wrestle-up single leg sweep', 'Single-Leg X if they pull the leg back'],
    exampleSequence: [
      'Shin clamp',
      'Hip pull-in tilts the base',
      'Far-hand post creates the lane',
      'They retract the leg late',
      'Single-Leg-X / stand-up continuation'
    ],
    curriculumSearch: 'shin to shin',
    treeSearch: 'single leg x',
    relatedTerms: ['shin to shin', 'single leg x', 'wrestle-up single leg sweep', 'technical stand-up sweep', 'ashi garami', 'seated guard']
  },
  {
    title: 'Quarter-guard attack setups',
    lane: 'Guard',
    summary: 'Use quarter-guard frames and underhook timing to create sweeps or leg entries before the pass settles.',
    description:
      'This family is for quarter-guard moments where the setup is about framing, catching the hip line, and reconnecting the underhook so the position becomes a launch point instead of a dying half-guard shell.',
    setupNodes: ['Hip Frame', 'Underhook Pummel', 'Inside-Knee Clamp', 'Shoulder Crunch Catch'],
    nextAttacks: ['Dogfight Sweep', 'Single-Leg X', 'Wrestle-Up Single Leg Sweep', 'Deep Half Waiter Sweep'],
    previewSequence: ['Underhook pummel', 'Hip line stays trapped', 'Dogfight sweep', 'Single-Leg X if they backstep out'],
    exampleSequence: [
      'Hip frame',
      'Inside-knee clamp slows the pass',
      'Underhook pummel reconnects offense',
      'They backstep or square late',
      'Dogfight / waiter continuation'
    ],
    curriculumSearch: 'quarter guard',
    treeSearch: 'dogfight',
    relatedTerms: ['quarter guard', 'dogfight', 'single leg x', 'wrestle-up single leg sweep', 'deep half waiter sweep', 'half guard']
  },
  {
    title: 'Turtle front-headlock attack setups',
    lane: 'Submission',
    summary: 'Use turtle reactions to make the front-headlock submission lane open cleaner.',
    description:
      'This family is for turtle situations where the front headlock is already near, but the finish still needs setup through elbow traps, shoulder turns, and angle changes before the guillotine, D’Arce, or anaconda becomes reliable.',
    setupNodes: ['Front Headlock Clamp', 'Near-Elbow Trap', 'Shoulder Turn', 'Angle Step'],
    nextAttacks: ['Guillotine', "D'Arce Choke", 'Anaconda Choke', 'Front Headlock Go-Behind'],
    previewSequence: ['Near-elbow trap', 'Shoulder stays turned in', 'D’Arce choke', 'Go-behind if the neck line slips free'],
    exampleSequence: [
      'Front headlock clamp',
      'Angle step improves the bite',
      'Near-elbow trap hides the escape path',
      'They keep the neck exposed late',
      'Guillotine / D’Arce continuation'
    ],
    curriculumSearch: 'front headlock',
    treeSearch: 'front headlock',
    relatedTerms: ['front headlock', 'guillotine', "d'arce choke", 'anaconda choke', 'front headlock go-behind', 'turtle']
  },
  {
    title: 'Top-side-control-to-mounted-triangle setups',
    lane: 'Submission',
    summary: 'Use top side-control pressure to climb into the mounted-triangle lane instead of forcing it cold.',
    description:
      'This family is for top side-control players who want the mounted triangle and need the right setup first: near-arm isolation, shoulder pressure, mount transition timing, and elbow-line exposure before the legs climb high.',
    setupNodes: ['Near-Arm Isolation', 'Shoulder Pressure', 'Mount Climb', 'Elbow-Line Exposure'],
    nextAttacks: ['Mounted Triangle', 'Straight Armbar From Mount', 'Arm Triangle', 'Americana'],
    previewSequence: ['Mount climb', 'Elbow line stays trapped', 'Mounted triangle', 'Armbar if they extend late'],
    exampleSequence: [
      'Near-arm isolation',
      'Shoulder pressure flattens the posture',
      'Mount climb raises the knees high',
      'They extend or hide the elbow late',
      'Mounted-triangle / armbar continuation'
    ],
    curriculumSearch: 'side control',
    treeSearch: 'mounted triangle',
    relatedTerms: ['side control', 'mounted triangle', 'straight armbar from mount', 'arm triangle', 'americana', 'mount']
  },
  {
    title: 'Reverse De La Riva retention-to-inversion setups',
    lane: 'Guard',
    summary: 'Use RDLR retention to create the inversion or backside lane instead of only rebuilding neutral guard.',
    description:
      'This family is for Reverse De La Riva situations where the setup is about hip turns, far-hip control, and inversion timing that create waiter, kiss-of-the-dragon, baby-bolo, or backside-entry lanes before the passer squares back up.',
    setupNodes: ['Far-Hip Frame', 'Hip Turn', 'Inversion Entry', 'Outside-Leg Track'],
    nextAttacks: ['Kiss Of The Dragon', 'Baby Bolo', 'Backside 50/50', 'Single-Leg X'],
    previewSequence: ['Inversion entry', 'Far hip stays connected', 'Kiss of the Dragon', 'Backside 50/50 if they keep turning away'],
    exampleSequence: [
      'Far-hip frame',
      'Hip turn opens the inversion angle',
      'Outside-leg track keeps the lane alive',
      'They continue turning away late',
      'Kiss-of-the-Dragon / backside continuation'
    ],
    curriculumSearch: 'reverse de la riva',
    treeSearch: 'kiss of the dragon',
    relatedTerms: ['reverse de la riva', 'kiss of the dragon', 'baby bolo', 'backside 50/50', 'single leg x', 'inversion']
  },
  {
    title: 'Backside-50/50 attack setups',
    lane: 'Guard',
    summary: 'Use the backside angle to create leg locks or back-take follow-ups before the knee line disappears.',
    description:
      'This family is for backside-50/50 situations where the setup is about keeping the backside angle, trapping the knee line, and reading whether the better next answer is the leg attack, the back-take lane, or a crab-ride continuation.',
    setupNodes: ['Backside Angle', 'Knee-Line Trap', 'Hip Turn-Off', 'Far-Hip Pull'],
    nextAttacks: ['Inside Heel Hook', 'Lachy Lock', 'Crab Ride', 'Back Control'],
    previewSequence: ['Knee-line trap', 'Backside angle stays tight', 'Lachy Lock', 'Crab ride if they keep turning away'],
    exampleSequence: [
      'Backside angle',
      'Hip turn-off prevents the square-up',
      'Knee-line trap sharpens the control',
      'They turn away or free the foot late',
      'Inside-heel / back-take continuation'
    ],
    curriculumSearch: 'backside 50/50',
    treeSearch: 'backside 50/50',
    relatedTerms: ['backside 50/50', 'inside heel hook', 'lachy lock', 'crab ride', 'back control', '50/50']
  },
  {
    title: 'Butterfly-half attack setups',
    lane: 'Guard',
    summary: 'Use butterfly-half elevation and upper-body control to create sweeps or leg entries before top pressure settles.',
    description:
      'This family is for butterfly-half situations where the setup is about shoulder crunches, underhook wins, and elevation timing that make the sweep, wrestle-up, or leg-entry lane appear before the passer flattens the position.',
    setupNodes: ['Shoulder Crunch', 'Underhook Win', 'Butterfly Elevation', 'Head Position Lift'],
    nextAttacks: ['Shoulder Crunch Butterfly Sweep', 'Wrestle-Up Single Leg Sweep', 'Single-Leg X', 'Ashi Garami'],
    previewSequence: ['Butterfly elevation', 'Base lifts just enough', 'Shoulder-crunch butterfly sweep', 'Single-Leg X if they pull the knee back'],
    exampleSequence: [
      'Shoulder crunch',
      'Underhook win tilts the chest line',
      'Butterfly elevation opens the base',
      'They pull the knee back late',
      'Sweep / leg-entry continuation'
    ],
    curriculumSearch: 'butterfly half',
    treeSearch: 'shoulder crunch butterfly sweep',
    relatedTerms: ['butterfly half', 'shoulder crunch butterfly sweep', 'wrestle-up single leg sweep', 'single leg x', 'ashi garami', 'shoulder crunch']
  },
  {
    title: 'Knee-cut passing-to-submission setups',
    lane: 'Passing',
    summary: 'Use the knee-cut finish to expose upper-body submissions instead of only settling side control.',
    description:
      'This family is for top players who win the knee cut and want the next layer: shoulder flattening, elbow exposure, and head control that create kimuras, north-south chokes, mounted armbars, or arm triangles off the pass.',
    setupNodes: ['Crossface Win', 'Shoulder Flatten', 'Near-Elbow Exposure', 'Head Control'],
    nextAttacks: ['Kimura', 'North-South Choke', 'Straight Armbar From Mount', 'Arm Triangle'],
    previewSequence: ['Shoulder flatten', 'Near elbow stays exposed', 'Kimura', 'North-south choke if they turn the head line away'],
    exampleSequence: [
      'Crossface win',
      'Knee cut finishes across the hips',
      'Shoulder flatten traps the chest line',
      'They expose the near elbow late',
      'Kimura / arm-triangle continuation'
    ],
    curriculumSearch: 'knee cut',
    treeSearch: 'kimura',
    relatedTerms: ['knee cut', 'kimura', 'north south choke', 'straight armbar from mount', 'arm triangle', 'side control']
  },
  {
    title: 'Underhook-half-guard attack setups',
    lane: 'Guard',
    summary: 'Use the underhook-half-guard lane to build dogfight, wrestle-ups, or backside angles before you get flattened.',
    description:
      'This family is for underhook half guard where the setup is about head position, hip height, and angle wins that create dogfight, back-take, wrestle-up, or leg-entry chains before the top player crossfaces you flat.',
    setupNodes: ['Underhook Win', 'Head Position Up', 'Hip Height Build', 'Angle Turn'],
    nextAttacks: ['Dogfight Sweep', 'Underhook To Come-Up Sweep', 'Back Control', 'Single-Leg X'],
    previewSequence: ['Hip height build', 'Angle turn wins the corner', 'Dogfight sweep', 'Back control if they keep turning away'],
    exampleSequence: [
      'Underhook win',
      'Head position stays higher than the shoulder line',
      'Hip height build creates the corner',
      'They turn away or sprawl late',
      'Dogfight / wrestle-up continuation'
    ],
    curriculumSearch: 'underhook half guard',
    treeSearch: 'dogfight',
    relatedTerms: ['underhook half guard', 'dogfight sweep', 'underhook to come-up sweep', 'back control', 'single leg x', 'half guard']
  },
  {
    title: 'Half-butterfly wrestle-up setups',
    lane: 'Guard',
    summary: 'Use half-butterfly reactions to stand into the single-leg lane before the passer kills the hook.',
    description:
      'This family is for half-butterfly moments where the setup is the stand-up itself: underhook wins, shoulder-crunch ties, and hook elevation that make the single-leg or wrestle-up lane open before the chest gets flattened.',
    setupNodes: ['Underhook Win', 'Shoulder Crunch', 'Hook Elevation', 'Hip Scoot Under'],
    nextAttacks: ['Wrestle-Up Single Leg Sweep', 'Single Leg', 'Shoulder Crunch Butterfly Sweep', 'Dogfight Sweep'],
    previewSequence: ['Hook elevation', 'Hip scoot gets under the base', 'Single leg', 'Dogfight if they sprawl but keep the leg close'],
    exampleSequence: [
      'Underhook win',
      'Hook elevation lifts the near hip',
      'Hip scoot under creates the stand-up window',
      'They sprawl but keep the leg close',
      'Single-leg / dogfight continuation'
    ],
    curriculumSearch: 'half butterfly',
    treeSearch: 'single leg',
    relatedTerms: ['half butterfly', 'wrestle-up single leg sweep', 'single leg', 'shoulder crunch butterfly sweep', 'dogfight sweep', 'butterfly half']
  },
  {
    title: 'Open-guard retention-to-ashi setups',
    lane: 'Guard',
    summary: 'Use open-guard retention reactions to reconnect directly into Ashi instead of only resetting neutral guard.',
    description:
      'This family is for open-guard retention when the guard is under pressure but the leg line is still close. The setup is about leg pummels, hip turns, and ankle catches that rebuild the entanglement before the passer clears away.',
    setupNodes: ['Leg Pummel', 'Hip Turn', 'Ankle Catch', 'Far-Hip Redirect'],
    nextAttacks: ['Ashi Garami', 'Single-Leg X', 'Straight Ankle Lock', 'Technical Stand-Up Sweep'],
    previewSequence: ['Ankle catch', 'Hip turn reconnects the leg line', 'Ashi Garami', 'Straight ankle lock if the foot stays exposed'],
    exampleSequence: [
      'Leg pummel',
      'Far-hip redirect stops the pass angle',
      'Ankle catch reconnects the leg line',
      'They hesitate on the reset late',
      'Ashi / stand-up continuation'
    ],
    curriculumSearch: 'open guard',
    treeSearch: 'ashi garami',
    relatedTerms: ['open guard', 'ashi garami', 'single leg x', 'straight ankle lock', 'technical stand-up sweep', 'guard retention']
  },
  {
    title: 'Straight-ankle-lock defense-to-counter setups',
    lane: 'Guard',
    summary: 'Clear the straight-ankle threat first, then turn the defense into a stand-up, reguard, or counterattack.',
    description:
      'This family is for straight-ankle-lock defense where the setup is defensive first: booting, hand fighting, hip turns, and knee-line clearing that lead into standing, open guard, Single-Leg X, or a return ankle attack once the break line is safer.',
    setupNodes: ['Boot Defense', 'Hand Fight Clear', 'Hip Turn-Out', 'Knee-Line Free'],
    nextAttacks: ['Standing', 'Open Guard Recovery', 'Single-Leg X', 'Straight Ankle Lock'],
    previewSequence: ['Knee-line free', 'Hip turn removes the break line', 'Stand up', 'Straight ankle lock if their own foot stays exposed'],
    exampleSequence: [
      'Boot defense',
      'Hand fight clear opens the knee line',
      'Hip turn-out reduces the break angle',
      'They keep the foot connected late',
      'Stand-up / counter-leg-lock continuation'
    ],
    curriculumSearch: 'straight ankle lock defense',
    treeSearch: 'standing',
    relatedTerms: ['straight ankle lock defense', 'standing', 'open guard recovery', 'single leg x', 'straight ankle lock', 'straight ankle lock boot defense']
  },
  {
    title: 'Collar-sleeve attack setups',
    lane: 'Guard',
    summary: 'Use collar-sleeve control to create angle, posture breaks, and the first real attack lane.',
    description:
      'This family is for collar-sleeve guard where the setup is about turning the shoulders, controlling the far post, and creating enough angle for triangles, omoplatas, armbars, or overhead-style sweeps before the top player recenters.',
    setupNodes: ['Collar Pull', 'Sleeve Post Control', 'Hip Angle Shift', 'Far-Hand Read'],
    nextAttacks: ['Triangle Choke', 'Omoplata', 'Straight Armbar From Guard', 'Balloon Sweep'],
    previewSequence: ['Hip angle shift', 'Far hand posts wide', 'Triangle choke', 'Omoplata if the shoulder lingers'],
    exampleSequence: [
      'Collar pull',
      'Sleeve post control keeps the arm honest',
      'Hip angle shift creates the lane',
      'They widen the far post late',
      'Triangle / sweep continuation'
    ],
    curriculumSearch: 'collar sleeve guard',
    treeSearch: 'triangle choke',
    relatedTerms: ['collar sleeve guard', 'triangle choke', 'omoplata', 'straight armbar from guard', 'balloon sweep', 'open guard']
  },
  {
    title: 'Top turtle ride-to-back setups',
    lane: 'Passing',
    summary: 'Use turtle rides and hip control to turn top turtle into clean back exposure.',
    description:
      'This family is for top turtle control where the setup is about spiral rides, hip blocks, seatbelt chases, and mat-return pressure that create the back-take lane before the bottom player escapes or stands up.',
    setupNodes: ['Spiral Ride', 'Near-Hip Block', 'Seatbelt Chase', 'Mat-Return Pressure'],
    nextAttacks: ['Back Control', 'Rear Body Lock Standing', 'Mat Return', 'Front Headlock Go-Behind'],
    previewSequence: ['Near-hip block', 'Seatbelt chase connects', 'Back control', 'Mat return if they stand into the ride'],
    exampleSequence: [
      'Spiral ride',
      'Near-hip block prevents the turn-in',
      'Seatbelt chase tracks the shoulders',
      'They stand but keep the hip exposed late',
      'Back-control / mat-return continuation'
    ],
    curriculumSearch: 'turtle',
    treeSearch: 'back control',
    relatedTerms: ['turtle', 'back control', 'rear body lock standing', 'mat return', 'front headlock go-behind', 'spiral ride']
  },
  {
    title: 'Body-lock takedown setups',
    lane: 'Standing',
    summary: 'Use the body lock to create the finish you actually need, not just the initial connection.',
    description:
      'This family is for body-lock takedowns after the lock is already connected. The setup is about hip pressure, angle changes, and reading whether the better finish is the mat return, trip, outside angle, or knee tap.',
    setupNodes: ['Hip Clamp', 'Angle Turn', 'Mat-Return Lift', 'Outside Step'],
    nextAttacks: ['Mat Return', 'Body Lock Takedown', 'Single Leg', 'Knee Tap'],
    previewSequence: ['Angle turn', 'Outside step wins the corner', 'Body lock takedown', 'Single leg if they drop the hips away'],
    exampleSequence: [
      'Hip clamp',
      'Mat-return lift breaks the balance',
      'Outside step sharpens the angle',
      'They drop the hips away late',
      'Mat-return / single-leg continuation'
    ],
    curriculumSearch: 'body lock takedown',
    treeSearch: 'body lock takedown',
    relatedTerms: ['body lock takedown', 'mat return', 'single leg', 'knee tap', 'rear body lock standing', 'body lock']
  },
  {
    title: 'Single-leg finish-chain setups',
    lane: 'Standing',
    summary: 'Use the single leg to build the actual finish chain instead of forcing one finish too early.',
    description:
      'This family is for single-leg finishes after the leg is already collected. The setup is about running the pipe, shelving, switching the head position, and climbing posture to create the best finish instead of betting on one answer too soon.',
    setupNodes: ['Run-The-Pipe Threat', 'Shelf The Leg', 'Head Position Switch', 'Posture Climb'],
    nextAttacks: ['Single Leg', 'Mat Return', 'Knee Tap', 'Double Leg'],
    previewSequence: ['Shelf the leg', 'Posture climb gets upright', 'Mat return', 'Knee tap if they hop the leg out wide'],
    exampleSequence: [
      'Run-the-pipe threat',
      'Head position switch changes the finish line',
      'Posture climb keeps the leg gathered',
      'They hop and widen the base late',
      'Mat-return / knee-tap continuation'
    ],
    curriculumSearch: 'single leg',
    treeSearch: 'single leg',
    relatedTerms: ['single leg', 'mat return', 'knee tap', 'double leg', 'run the pipe', 'shelf the leg']
  },
  {
    title: 'North-south defense-to-reguard setups',
    lane: 'Guard',
    summary: 'Use frames and hip recovery to turn north-south defense into a real guard rebuild.',
    description:
      'This family is for defending north-south by building the frame and turning the hips until open guard, half guard, shin-to-shin, or a stand-up lane becomes available before the top player settles back in.',
    setupNodes: ['Near-Elbow Frame', 'Hip Turn', 'Knee Reconnect', 'Far-Leg Catch'],
    nextAttacks: ['Open Guard Recovery', 'Half Guard Recovery', 'Shin-To-Shin', 'Technical Stand-Up Sweep'],
    previewSequence: ['Hip turn', 'Knee reconnects under the chest line', 'Half guard recovery', 'Shin-to-shin if the far leg stays close'],
    exampleSequence: [
      'Near-elbow frame',
      'Hip turn creates the first opening',
      'Far-leg catch reconnects the guard line',
      'They float back toward side control late',
      'Open-guard / half-guard continuation'
    ],
    curriculumSearch: 'north south escape',
    treeSearch: 'open guard',
    relatedTerms: ['north south escape', 'open guard recovery', 'half guard recovery', 'shin to shin', 'technical stand-up sweep', 'guard recovery']
  },
  {
    title: 'Mount-bottom elbow-knee-to-half-guard setups',
    lane: 'Guard',
    summary: 'Use the elbow-knee escape to turn bottom mount survival into a useful half-guard rebuild.',
    description:
      'This family is for bottom mount when the elbow-knee escape is the real setup: frame timing, hip turns, and knee insertion that open half guard, quarter guard, or even shin-to-shin before the top player resets the mount.',
    setupNodes: ['Elbow Frame', 'Hip Turn', 'Knee Insert', 'Bottom-Leg Catch'],
    nextAttacks: ['Half Guard Recovery', 'Quarter Guard', 'Shin-To-Shin', 'Single-Leg X'],
    previewSequence: ['Knee insert', 'Bottom leg gets caught on the way through', 'Half guard recovery', 'Shin-to-shin if the leg line stays loose'],
    exampleSequence: [
      'Elbow frame',
      'Hip turn makes the knee-insertion lane',
      'Bottom-leg catch keeps the connection',
      'They climb high but leave the leg line late',
      'Half-guard / shin-to-shin continuation'
    ],
    curriculumSearch: 'mount escape',
    treeSearch: 'half guard',
    relatedTerms: ['mount escape', 'half guard recovery', 'quarter guard', 'shin to shin', 'single leg x', 'elbow knee escape']
  },
  {
    title: 'Seated guard arm-drag attack setups',
    lane: 'Guard',
    summary: 'Use seated guard arm drags to build the rear angle before the opponent squares back up.',
    description:
      'This family is for seated-guard arm drags where the setup is about pulling the shoulder line across, climbing to the hip, and deciding whether the cleaner continuation is the back take, wrestle-up, shin-to-shin, or crab-ride style entry.',
    setupNodes: ['Arm Drag Pull', 'Shoulder-Line Win', 'Hip Climb', 'Rear-Angle Chase'],
    nextAttacks: ['Back Control', 'Wrestle-Up Single Leg Sweep', 'Shin-To-Shin', 'Crab Ride'],
    previewSequence: ['Shoulder-line win', 'Rear angle opens behind the hip', 'Back control', 'Shin-to-shin if they pull the leg back under them'],
    exampleSequence: [
      'Arm drag pull',
      'Hip climb keeps the angle alive',
      'Rear-angle chase gets behind the shoulder line',
      'They square the legs back underneath late',
      'Back-take / wrestle-up continuation'
    ],
    curriculumSearch: 'arm drag',
    treeSearch: 'back control',
    relatedTerms: ['arm drag', 'back control', 'wrestle-up single leg sweep', 'shin to shin', 'crab ride', 'seated guard']
  },
  {
    title: 'Shin-to-shin retention-to-ashi setups',
    lane: 'Guard',
    summary: 'Use shin-to-shin retention to reconnect the leg line into Ashi before the passer clears away.',
    description:
      'This family is for shin-to-shin moments where the first attack stalls and the setup becomes a recovery into Ashi, Single-Leg X, or a stand-up sweep through hip turns, ankle catches, and far-leg control.',
    setupNodes: ['Shin Re-Clamp', 'Ankle Catch', 'Far-Leg Control', 'Hip Turn-In'],
    nextAttacks: ['Ashi Garami', 'Single-Leg X', 'Straight Ankle Lock', 'Technical Stand-Up Sweep'],
    previewSequence: ['Ankle catch', 'Hip turn-in reconnects the line', 'Ashi Garami', 'Single-Leg X if they retract the knee late'],
    exampleSequence: [
      'Shin re-clamp',
      'Far-leg control keeps the line close',
      'Hip turn-in opens the entry',
      'They retract the knee but leave the foot late',
      'Ashi / stand-up continuation'
    ],
    curriculumSearch: 'shin to shin',
    treeSearch: 'ashi garami',
    relatedTerms: ['shin to shin', 'ashi garami', 'single leg x', 'straight ankle lock', 'technical stand-up sweep', 'open guard']
  },
  {
    title: 'Top mount-to-back setups',
    lane: 'Passing',
    summary: 'Use mount pressure to force the turn and create the back-take lane cleanly.',
    description:
      'This family is for top mount situations where the back take is the real goal. The setup is about wrist pins, gift-wrap control, shoulder turns, and pressure that make the back or seatbelt appear before the mount fully collapses.',
    setupNodes: ['Gift Wrap', 'Cross-Wrist Pin', 'Shoulder Turn', 'High-Mount Pressure'],
    nextAttacks: ['Technical Mount To Back', 'Back Control', 'Seatbelt', 'Mounted Triangle'],
    previewSequence: ['Gift wrap', 'Shoulder turn forces the back line open', 'Technical mount to back', 'Seatbelt if they keep turning away'],
    exampleSequence: [
      'Cross-wrist pin',
      'High-mount pressure forces the turn',
      'Shoulder turn exposes the back line',
      'They continue turning away late',
      'Back-take / mounted-triangle continuation'
    ],
    curriculumSearch: 'mount',
    treeSearch: 'technical mount to back',
    relatedTerms: ['mount', 'technical mount to back', 'back control', 'seatbelt', 'mounted triangle', 'gift wrap']
  },
  {
    title: 'Side-control kesa-to-attack setups',
    lane: 'Submission',
    summary: 'Use kesa and side-control pressure to trap the arm or head before the submission opens.',
    description:
      'This family is for side-control and kesa-gatame top attacks where the setup is about head control, near-arm trapping, and hip positioning that create armbars, chest-compression lanes, kimuras, or back takes instead of just holding the pin.',
    setupNodes: ['Head Clamp', 'Near-Arm Trap', 'Hip Block', 'Kesa Turn-In'],
    nextAttacks: ['Straight Armbar From Side Control', 'Kimura', 'Back Control', 'Arm Triangle'],
    previewSequence: ['Near-arm trap', 'Kesa turn-in tightens the chest line', 'Kimura', 'Back control if they turn away under pressure'],
    exampleSequence: [
      'Head clamp',
      'Hip block keeps the far turn from escaping',
      'Near-arm trap closes the frame',
      'They turn away or flare the elbow late',
      'Armbar / kimura continuation'
    ],
    curriculumSearch: 'kesa gatame',
    treeSearch: 'kimura',
    relatedTerms: ['kesa gatame', 'straight armbar from side control', 'kimura', 'back control', 'arm triangle', 'side control']
  },
  {
    title: 'Half-guard passing counters',
    lane: 'Guard',
    summary: 'Use passing pressure to bait the reaction, then turn it into a reguard or wrestle-up counter.',
    description:
      'This family is for defending half-guard passes through frames, hip turns, and underhook timing that reopen half guard, shin-to-shin, dogfight, or open guard once the passer commits too hard to the finish.',
    setupNodes: ['Frame Rebuild', 'Hip Turn-Out', 'Underhook Timing', 'Inside-Knee Reconnect'],
    nextAttacks: ['Half Guard Recovery', 'Dogfight', 'Shin-To-Shin', 'Open Guard Recovery'],
    previewSequence: ['Underhook timing', 'Passer chases the crossface', 'Dogfight', 'Open guard if they backstep out of range'],
    exampleSequence: [
      'Frame rebuild',
      'Hip turn-out creates the first gap',
      'Inside-knee reconnect slows the pass',
      'They overcommit to the chest line late',
      'Dogfight / reguard continuation'
    ],
    curriculumSearch: 'half guard defense',
    treeSearch: 'dogfight',
    relatedTerms: ['half guard defense', 'half guard recovery', 'dogfight', 'shin to shin', 'open guard recovery', 'underhook half guard']
  },
  {
    title: 'Turtle bottom sit-out-to-single setups',
    lane: 'Guard',
    summary: 'Use the sit-out and hip turn to create the single-leg lane before top turtle control settles.',
    description:
      'This family is for bottom turtle escapes where the sit-out is the setup: hand fighting, hip turns, and leg catches that open the single leg, stand-up, or shin-to-shin lane before the top player reconnects the ride.',
    setupNodes: ['Hand Fight Clear', 'Sit-Out Turn', 'Leg Catch', 'Hip Turn-Up'],
    nextAttacks: ['Single Leg', 'Technical Stand-Up Sweep', 'Shin-To-Shin', 'Open Guard Recovery'],
    previewSequence: ['Sit-out turn', 'Leg catch stays connected', 'Single leg', 'Shin-to-shin if they sprawl back over the shoulder'],
    exampleSequence: [
      'Hand fight clear',
      'Sit-out turn creates the angle',
      'Leg catch reconnects under the base',
      'They sprawl but keep the leg close late',
      'Single-leg / stand-up continuation'
    ],
    curriculumSearch: 'turtle escape',
    treeSearch: 'single leg',
    relatedTerms: ['turtle escape', 'single leg', 'technical stand-up sweep', 'shin to shin', 'open guard recovery', 'sit out']
  },
  {
    title: 'Knee-shield dogfight-to-back setups',
    lane: 'Guard',
    summary: 'Use the knee shield and underhook fight to turn dogfight pressure into back exposure.',
    description:
      'This family is for knee-shield half-guard moments where the real setup is winning the underhook, climbing into dogfight, and using shoulder position or hip height to turn the exchange into the back instead of a straight wrestle-up only.',
    setupNodes: ['Knee Shield Frame', 'Underhook Win', 'Dogfight Rise', 'Shoulder Clamp'],
    nextAttacks: ['Back Control', 'Seatbelt', 'Wrestle-Up Single Leg Sweep', 'Crab Ride'],
    previewSequence: ['Underhook win', 'Dogfight rise changes the angle', 'Back control', 'Seatbelt if they keep turning away'],
    exampleSequence: [
      'Knee shield frame',
      'Underhook win gets up to dogfight',
      'Shoulder clamp keeps the turn going',
      'They keep turning away to hide the single late',
      'Back-take / seatbelt continuation'
    ],
    curriculumSearch: 'dogfight',
    treeSearch: 'back control',
    relatedTerms: ['dogfight', 'knee shield half guard', 'back control', 'seatbelt', 'wrestle-up single leg sweep', 'crab ride']
  },
  {
    title: 'Combat-base passing setups',
    lane: 'Passing',
    summary: 'Use posture and base changes to open closed guard without rushing the pass.',
    description:
      'This family is for top closed-guard passing where combat base is the setup itself. The goal is to use posture, knee angle, and sleeve or wrist control to open the guard before the real passing lane appears.',
    setupNodes: ['Posture Build', 'Combat Base Rise', 'Wrist Peel', 'Knee Angle Shift'],
    nextAttacks: ['Closed Guard Passing', 'Standing Passing', 'Leg Drag', 'Combat Base'],
    previewSequence: ['Combat base rise', 'Guard starts to open', 'Closed guard passing', 'Leg drag if the knees separate late'],
    exampleSequence: [
      'Posture build',
      'Combat base rise changes the pressure line',
      'Wrist peel breaks the climbing grip',
      'They open the guard late to adjust',
      'Closed-guard-pass / standing-pass continuation'
    ],
    curriculumSearch: 'combat base',
    treeSearch: 'closed guard passing',
    relatedTerms: ['combat base', 'closed guard passing', 'standing passing', 'leg drag', 'closed guard posture control', 'top closed guard']
  },
  {
    title: 'Side-control near-side-armbar setups',
    lane: 'Submission',
    summary: 'Use side-control pressure to isolate the near arm before the armbar lane is obvious.',
    description:
      'This family is for top side-control armbars where the setup is really about wrist control, head positioning, and near-arm isolation that make the armbar appear before the bottom player can hide the elbow or turn back in.',
    setupNodes: ['Near-Wrist Pin', 'Head Control', 'Elbow Flare Trap', 'Hip Walk North'],
    nextAttacks: ['Straight Armbar From Side Control', 'Kimura', 'North South Choke', 'Back Control'],
    previewSequence: ['Near-wrist pin', 'Hip walk north clears the elbow line', 'Straight armbar from side control', 'Kimura if they re-bend the arm late'],
    exampleSequence: [
      'Near-wrist pin',
      'Head control keeps the shoulders flat',
      'Hip walk north exposes the elbow line',
      'They flare the elbow late trying to turn in',
      'Armbar / kimura continuation'
    ],
    curriculumSearch: 'straight armbar from side control',
    treeSearch: 'straight armbar from side control',
    relatedTerms: ['straight armbar from side control', 'kimura', 'north south choke', 'back control', 'side control', 'near side armbar']
  },
  {
    title: 'Top turtle crucifix setups',
    lane: 'Submission',
    summary: 'Use top-turtle control to trap the far arm and build the crucifix lane cleanly.',
    description:
      'This family is for top turtle attacks where the setup is about hand-fighting, far-arm separation, and hip placement that make the crucifix appear before the defender can square up or sit out.',
    setupNodes: ['Far-Arm Separation', 'Seatbelt Threat', 'Hip Drop', 'Near-Hook Pummel'],
    nextAttacks: ['Crucifix', 'Back Control', 'Turtle Front Headlock', 'Short Choke'],
    previewSequence: ['Far-arm separation', 'Hip drop traps the shoulder line', 'Crucifix', 'Back control if they hide the arm and turn away'],
    exampleSequence: [
      'Seatbelt threat',
      'Far-arm separation clears the elbow line',
      'Hip drop traps the shoulder',
      'They sit back toward the hook side late',
      'Crucifix / back-take continuation'
    ],
    curriculumSearch: 'crucifix',
    treeSearch: 'crucifix',
    relatedTerms: ['crucifix', 'back control', 'turtle front headlock', 'short choke', 'top turtle', 'far arm separation']
  },
  {
    title: 'Open-guard collar-drag setups',
    lane: 'Guard',
    summary: 'Use open-guard collar drags to pull the shoulder line past the hips before the opponent can square back up.',
    description:
      'This family is for open-guard collar drags where the setup is about off-balancing through the collar, pulling the shoulder line past the base, and deciding whether the best next answer is the back, a wrestle-up, shin-to-shin, or a drag-to-top angle.',
    setupNodes: ['Collar Drag Pull', 'Shoulder-Line Pull', 'Hip Angle Change', 'Top-Leg Catch'],
    nextAttacks: ['Back Control', 'Wrestle-Up Single Leg Sweep', 'Shin-To-Shin', 'Technical Stand-Up Sweep'],
    previewSequence: ['Collar drag pull', 'Shoulder line runs past the hips', 'Back control', 'Wrestle-up if they square the upper body first'],
    exampleSequence: [
      'Collar drag pull',
      'Hip angle change chases the rear corner',
      'Top-leg catch keeps the angle alive',
      'They square up but leave the leg close late',
      'Back-take / wrestle-up continuation'
    ],
    curriculumSearch: 'collar drag',
    treeSearch: 'back control',
    relatedTerms: ['collar drag', 'back control', 'wrestle-up single leg sweep', 'shin to shin', 'technical stand-up sweep', 'open guard']
  },
  {
    title: 'Quarter-guard wrestle-up setups',
    lane: 'Guard',
    summary: 'Use quarter guard to come up before the passer fully clears the trapped leg.',
    description:
      'This family is for quarter-guard moments where the setup is really about staying connected just long enough to wrestle up, grab the leg, or recover shin-to-shin before the passer frees the knee line completely.',
    setupNodes: ['Bottom-Leg Clamp', 'Underhook Reach', 'Hip Scoot', 'Knee Reconnect'],
    nextAttacks: ['Wrestle-Up Single Leg Sweep', 'Dogfight', 'Shin-To-Shin', 'Single Leg'],
    previewSequence: ['Underhook reach', 'Hip scoot keeps the knee line trapped', 'Wrestle-up single leg sweep', 'Dogfight if they pull the leg higher'],
    exampleSequence: [
      'Bottom-leg clamp',
      'Underhook reach starts the rise',
      'Hip scoot keeps the trapped knee line close',
      'They pull the leg high but leave the shoulder near late',
      'Wrestle-up / dogfight continuation'
    ],
    curriculumSearch: 'quarter guard',
    treeSearch: 'wrestle-up single leg sweep',
    relatedTerms: ['quarter guard', 'wrestle-up single leg sweep', 'dogfight', 'shin to shin', 'single leg', 'underhook half guard']
  },
  {
    title: 'Single-Leg-X retention-to-sweep setups',
    lane: 'Guard',
    summary: 'Use Single-Leg X retention to keep the off-balance alive until the sweep lane opens.',
    description:
      'This family is for Single-Leg X moments where the first off-balance does not finish cleanly and the setup becomes foot tracking, hip angle, and upper-body steering that reopen the standard sweep, stand-up sweep, or ankle-lock lane.',
    setupNodes: ['Foot Re-Track', 'Hip Angle Reset', 'Top-Hand Pull', 'Far-Leg Steering'],
    nextAttacks: ['Basic Single-Leg X Sweep', 'Single-Leg X Stand-Up Sweep', 'Straight Ankle Lock', 'Technical Stand-Up Sweep'],
    previewSequence: ['Hip angle reset', 'Far-leg steering keeps them light', 'Basic Single-Leg X Sweep', 'Straight ankle lock if they post heavy on the mat'],
    exampleSequence: [
      'Foot re-track',
      'Top-hand pull breaks their balance line again',
      'Hip angle reset keeps the leg trapped',
      'They post heavy but leave the knee line tall late',
      'Sweep / ankle-lock continuation'
    ],
    curriculumSearch: 'single leg x',
    treeSearch: 'basic single-leg x sweep',
    relatedTerms: ['single leg x', 'basic single-leg x sweep', 'single-leg x stand-up sweep', 'straight ankle lock', 'technical stand-up sweep', 'ashi garami']
  },
  {
    title: 'Butterfly-arm-drag-to-back setups',
    lane: 'Guard',
    summary: 'Use butterfly arm drags to win the back angle before the hips square back up.',
    description:
      'This family is for butterfly-guard arm drags where the setup is about shoulder-line wins, hook assistance, and hip climbing that turn a simple drag into the back, crab ride, or wrestle-up lane instead of a stalled scramble.',
    setupNodes: ['Arm Drag Pull', 'Butterfly Hook Assist', 'Hip Climb', 'Shoulder-Line Chase'],
    nextAttacks: ['Back Control', 'Crab Ride', 'Wrestle-Up Single Leg Sweep', 'Seatbelt'],
    previewSequence: ['Butterfly hook assist', 'Shoulder line runs past the hips', 'Back control', 'Crab ride if they sit through and hide the shoulder'],
    exampleSequence: [
      'Arm drag pull',
      'Butterfly hook assist keeps them tilted',
      'Hip climb chases the rear corner',
      'They sit through late trying to square up',
      'Back-take / crab-ride continuation'
    ],
    curriculumSearch: 'butterfly guard',
    treeSearch: 'back control',
    relatedTerms: ['butterfly guard', 'arm drag', 'back control', 'crab ride', 'wrestle-up single leg sweep', 'seatbelt']
  },
  {
    title: 'Top-side-control-to-north-south setups',
    lane: 'Passing',
    summary: 'Use side-control pressure to rotate the shoulders and expose the north-south lane.',
    description:
      'This family is for top side-control transitions where the real setup is head control, shoulder rotation, and hip walking that make north-south or north-south choke appear before the bottom player can recover frames.',
    setupNodes: ['Head Control', 'Shoulder Rotation', 'Hip Walk North', 'Near-Elbow Pin'],
    nextAttacks: ['North South', 'North South Choke', 'Kimura', 'Back Control'],
    previewSequence: ['Shoulder rotation', 'Hip walk north clears the near frame', 'North South', 'North South choke if the elbows stay wide late'],
    exampleSequence: [
      'Head control',
      'Shoulder rotation turns the chest away from the hips',
      'Hip walk north clears the near-side frame',
      'They flare the elbows but stay flat late',
      'North-south / choke continuation'
    ],
    curriculumSearch: 'north south',
    treeSearch: 'north south',
    relatedTerms: ['north south', 'north south choke', 'kimura', 'back control', 'side control', 'hip walk north']
  },
  {
    title: 'Mount gift-wrap-to-armbar setups',
    lane: 'Submission',
    summary: 'Use the gift wrap to pin the shoulder line before the armbar actually opens.',
    description:
      'This family is for top mount attacks where the gift wrap is the setup itself: cross-wrist control, shoulder turns, and high-mount pressure that make the armbar, mounted triangle, or back-take lane appear without losing chest connection.',
    setupNodes: ['Gift Wrap', 'Cross-Wrist Pin', 'High-Mount Climb', 'Shoulder Turn'],
    nextAttacks: ['Straight Armbar From Mount', 'Mounted Triangle', 'Back Control', 'Technical Mount To Back'],
    previewSequence: ['Gift wrap', 'High-mount climb stretches the shoulder line', 'Straight armbar from mount', 'Mounted triangle if they hide the elbow and turn late'],
    exampleSequence: [
      'Gift wrap',
      'Cross-wrist pin keeps the shoulder line trapped',
      'High-mount climb lifts the elbow line',
      'They turn late trying to hide the arm',
      'Armbar / mounted-triangle continuation'
    ],
    curriculumSearch: 'gift wrap',
    treeSearch: 'straight armbar from mount',
    relatedTerms: ['gift wrap', 'straight armbar from mount', 'mounted triangle', 'back control', 'technical mount to back', 'mount']
  },
  {
    title: 'Turtle bottom peek-out-to-backdoor setups',
    lane: 'Guard',
    summary: 'Use the peek-out to slip underneath the ride before top turtle control settles fully.',
    description:
      'This family is for bottom turtle counters where the peek-out is the setup: hand-fighting, hip turns, and knee-line escapes that create the backdoor single, shin-to-shin, or stand-up lane before the rider reconnects chest pressure.',
    setupNodes: ['Hand Fight Clear', 'Peek-Out Turn', 'Knee-Line Slip', 'Hip Turn-Up'],
    nextAttacks: ['Backdoor Single', 'Shin-To-Shin', 'Technical Stand-Up Sweep', 'Open Guard Recovery'],
    previewSequence: ['Peek-out turn', 'Knee-line slip clears the hips', 'Backdoor single', 'Shin-to-shin if they sprawl back over the shoulders'],
    exampleSequence: [
      'Hand fight clear',
      'Peek-out turn slips underneath the ride',
      'Knee-line slip keeps the angle open',
      'They sprawl but leave the leg near late',
      'Backdoor-single / shin-to-shin continuation'
    ],
    curriculumSearch: 'turtle escape',
    treeSearch: 'backdoor single',
    relatedTerms: ['turtle escape', 'backdoor single', 'shin to shin', 'technical stand-up sweep', 'open guard recovery', 'peek out']
  },
  {
    title: 'Standing snap-down-to-go-behind setups',
    lane: 'Standing',
    summary: 'Use the snap-down to break posture and turn the corner before the opponent squares back up.',
    description:
      'This family is for standing snap-down sequences where the setup is really about timing the posture break, redirecting the shoulders, and deciding whether the better continuation is the go-behind, front headlock, knee tap, or mat-return style finish.',
    setupNodes: ['Snap Down', 'Shoulder Redirect', 'Outside Step', 'Head Position Win'],
    nextAttacks: ['Front Headlock To Spin Behind', 'Go-Behind Position', 'Knee Tap', 'Mat Return'],
    previewSequence: ['Shoulder redirect', 'Outside step wins the corner', 'Go-Behind Position', 'Front headlock if they keep the head low and square late'],
    exampleSequence: [
      'Snap down',
      'Shoulder redirect turns the head away from the hips',
      'Outside step wins the corner',
      'They square late but keep the head low',
      'Go-behind / front-headlock continuation'
    ],
    curriculumSearch: 'snap down',
    treeSearch: 'go-behind position',
    relatedTerms: ['snap down', 'front headlock to spin behind', 'go-behind position', 'knee tap', 'mat return', 'standing']
  },
  {
    title: 'Closed-guard overhook-to-omoplata setups',
    lane: 'Guard',
    summary: 'Use the overhook and shoulder angle to make the omoplata appear before posture returns.',
    description:
      'This family is for closed-guard overhook attacks where the setup is about collar pulls, posture breaks, and hip angles that make the omoplata, triangle, or armbar lane show up before the top player can recover clean posture.',
    setupNodes: ['Overhook Clamp', 'Collar Pull', 'Hip Angle Shift', 'Shoulder Break'],
    nextAttacks: ['Omoplata', 'Triangle Choke', 'Straight Armbar From Guard', 'Kimura'],
    previewSequence: ['Overhook clamp', 'Hip angle shift exposes the shoulder line', 'Omoplata', 'Triangle if they posture and hide the arm late'],
    exampleSequence: [
      'Collar pull',
      'Overhook clamp keeps the shoulder line bent',
      'Hip angle shift clears the outside angle',
      'They posture late but leave the elbow inside',
      'Omoplata / triangle continuation'
    ],
    curriculumSearch: 'omoplata',
    treeSearch: 'omoplata',
    relatedTerms: ['omoplata', 'triangle choke', 'straight armbar from guard', 'kimura', 'closed guard', 'overhook']
  },
  {
    title: 'Shin-to-shin wrestle-up-to-back setups',
    lane: 'Guard',
    summary: 'Use the wrestle-up threat from shin-to-shin to make the back angle appear when they turn away.',
    description:
      'This family is for shin-to-shin sequences where the setup is really about coming up on the leg, making the opponent turn or post, and deciding whether the cleaner continuation is the back, a single leg, or a stand-up sweep.',
    setupNodes: ['Shin Re-Connect', 'Come-Up On Leg', 'Shoulder Turn', 'Rear-Corner Chase'],
    nextAttacks: ['Back Control', 'Single Leg', 'Wrestle-Up Single Leg Sweep', 'Technical Stand-Up Sweep'],
    previewSequence: ['Come up on leg', 'Shoulder turn makes them turn away', 'Back control', 'Single leg if they stay square with the hips'],
    exampleSequence: [
      'Shin re-connect',
      'Come-up on leg gets underneath the base',
      'Shoulder turn chases the rear corner',
      'They turn away late to free the leg',
      'Back-take / single-leg continuation'
    ],
    curriculumSearch: 'shin to shin',
    treeSearch: 'back control',
    relatedTerms: ['shin to shin', 'back control', 'single leg', 'wrestle-up single leg sweep', 'technical stand-up sweep', 'open guard']
  },
  {
    title: 'Leg-drag backstep-to-kimura setups',
    lane: 'Passing',
    summary: 'Use the leg drag and backstep threat to open the near-arm kimura lane.',
    description:
      'This family is for top passing transitions where the setup is about forcing the hips across, backstepping at the right time, and trapping the near arm so the kimura appears before the bottom player can rebuild frames.',
    setupNodes: ['Leg Drag Pull', 'Backstep Threat', 'Near-Arm Trap', 'Hip Pin'],
    nextAttacks: ['Kimura', 'North South Choke', 'Back Control', 'Straight Armbar From Side Control'],
    previewSequence: ['Backstep threat', 'Near-arm trap appears under the shoulder', 'Kimura', 'North-south choke if they hide the wrist late'],
    exampleSequence: [
      'Leg drag pull',
      'Hip pin forces the knees across the center',
      'Backstep threat opens the near-arm line',
      'They hide the wrist but leave the shoulder trapped late',
      'Kimura / choke continuation'
    ],
    curriculumSearch: 'leg drag',
    treeSearch: 'kimura',
    relatedTerms: ['leg drag', 'kimura', 'north south choke', 'back control', 'straight armbar from side control', 'backstep pass']
  },
  {
    title: 'North-south kimura-to-choke setups',
    lane: 'Submission',
    summary: 'Use the kimura threat from north-south to force the elbow line open for the choke.',
    description:
      'This family is for north-south top attacks where the kimura and choke are chained together. The setup is about shoulder pressure, wrist control, and elbow flares that let one threat open the other instead of attacking both separately.',
    setupNodes: ['Wrist Capture', 'Shoulder Pressure', 'Elbow Flare', 'Head Walk'],
    nextAttacks: ['Kimura', 'North South Choke', 'Straight Armbar From Side Control', 'Back Control'],
    previewSequence: ['Wrist capture', 'Elbow flare exposes the neck line', 'North South Choke', 'Kimura if they hide the neck and leave the arm bent late'],
    exampleSequence: [
      'Shoulder pressure',
      'Wrist capture keeps the arm from hiding cleanly',
      'Head walk opens the neck line',
      'They tuck the chin but leave the elbow bent late',
      'Choke / kimura continuation'
    ],
    curriculumSearch: 'north south choke',
    treeSearch: 'north south choke',
    relatedTerms: ['north south choke', 'kimura', 'straight armbar from side control', 'back control', 'north south', 'side control']
  },
  {
    title: 'Bottom-side-control ghost-escape-to-single setups',
    lane: 'Guard',
    summary: 'Use the ghost-escape angle to come underneath and reconnect to the single-leg lane.',
    description:
      'This family is for bottom side-control escapes where the setup is about shoulder turns, hip slides, and underhook timing that make the ghost-escape angle lead into the single leg, shin-to-shin, or open-guard lane instead of only a reset.',
    setupNodes: ['Shoulder Turn', 'Hip Slide', 'Underhook Reach', 'Knee-Line Catch'],
    nextAttacks: ['Single Leg', 'Shin-To-Shin', 'Open Guard Recovery', 'Technical Stand-Up Sweep'],
    previewSequence: ['Underhook reach', 'Hip slide gets underneath the chest line', 'Single leg', 'Shin-to-shin if they sprawl across the shoulders late'],
    exampleSequence: [
      'Shoulder turn',
      'Hip slide creates the ghost-escape lane',
      'Underhook reach gets underneath the hips',
      'They sprawl but leave the knee line nearby late',
      'Single-leg / shin-to-shin continuation'
    ],
    curriculumSearch: 'ghost escape',
    treeSearch: 'single leg',
    relatedTerms: ['ghost escape', 'single leg', 'shin to shin', 'open guard recovery', 'technical stand-up sweep', 'side control escape']
  },
  {
    title: 'Standing collar-tie-to-knee-tap setups',
    lane: 'Standing',
    summary: 'Use the collar tie to steer posture and make the knee-tap lane appear cleanly.',
    description:
      'This family is for standing collar-tie attacks where the setup is about pulling posture, steering the head, and timing the outside step so the knee tap or single-leg continuation opens before the stance re-centers.',
    setupNodes: ['Collar Tie', 'Head Pull', 'Outside Step', 'Inside-Hand Check'],
    nextAttacks: ['Knee Tap', 'Single Leg', 'Front Headlock Standing', 'Body Lock Takedown'],
    previewSequence: ['Head pull', 'Outside step wins the angle', 'Knee tap', 'Single leg if they pull the leg back and stay tall'],
    exampleSequence: [
      'Collar tie',
      'Head pull breaks posture just enough',
      'Outside step wins the knee line',
      'They pull the leg back but stay tall late',
      'Knee-tap / single-leg continuation'
    ],
    curriculumSearch: 'knee tap',
    treeSearch: 'knee tap',
    relatedTerms: ['knee tap', 'single leg', 'front headlock standing', 'body lock takedown', 'collar tie', 'standing']
  },
  {
    title: 'Butterfly shoulder-crunch-to-choi-bar setups',
    lane: 'Submission',
    summary: 'Use the shoulder crunch from butterfly to build the Choi Bar or triangle lane before posture resets.',
    description:
      'This family is for butterfly shoulder-crunch attacks where the setup is about upper-body control, hip angle, and arm isolation that make the Choi Bar, triangle, or sweep lane appear without rushing the finish.',
    setupNodes: ['Shoulder Crunch', 'Arm Isolation', 'Hip Angle Shift', 'Butterfly Lift'],
    nextAttacks: ['Choi Bar', 'Triangle Choke', 'Butterfly Sweep', 'Arm Drag To Back'],
    previewSequence: ['Shoulder crunch', 'Hip angle shift exposes the elbow line', 'Choi Bar', 'Triangle if they posture and hide the arm late'],
    exampleSequence: [
      'Shoulder crunch',
      'Arm isolation keeps the elbow from retracting',
      'Hip angle shift clears the finish line',
      'They posture late but leave the shoulder trapped',
      'Choi-Bar / triangle continuation'
    ],
    curriculumSearch: 'shoulder crunch',
    treeSearch: 'choi bar',
    relatedTerms: ['shoulder crunch', 'choi bar', 'triangle choke', 'butterfly sweep', 'arm drag to back', 'butterfly guard']
  },
  {
    title: 'Open-guard ankle-pick-to-leg-drag setups',
    lane: 'Passing',
    summary: 'Use the ankle-pick threat from open guard to pull the hips across into the leg-drag lane.',
    description:
      'This family is for open-guard top transitions where the setup is about ankle picks, foot steering, and hip redirection that turn a stand-up or off-balance moment into the leg drag or pass-to-control lane.',
    setupNodes: ['Ankle Pick Threat', 'Foot Steering', 'Hip Redirection', 'Shin Clear'],
    nextAttacks: ['Leg Drag', 'Pass To Knee On Belly', 'Backstep Pass', 'Side Control'],
    previewSequence: ['Foot steering', 'Hip redirection turns the knees across', 'Leg drag', 'Backstep if they turn the hips away late'],
    exampleSequence: [
      'Ankle pick threat',
      'Shin clear opens the outside angle',
      'Hip redirection drags the knees past center',
      'They turn late to face but leave the legs across',
      'Leg-drag / backstep continuation'
    ],
    curriculumSearch: 'leg drag',
    treeSearch: 'leg drag',
    relatedTerms: ['leg drag', 'pass to knee on belly', 'backstep pass', 'side control', 'open guard', 'ankle pick']
  },
  {
    title: 'Top-half-kimura-to-back setups',
    lane: 'Submission',
    summary: 'Use the kimura threat from top half guard to make the back line open when they hide the arm.',
    description:
      'This family is for top half-guard attacks where the setup is about kimura control, crossface pressure, and hip positioning that make the back take appear when the defender turns to protect the arm.',
    setupNodes: ['Kimura Grip', 'Crossface Pressure', 'Hip Block', 'Shoulder Turn'],
    nextAttacks: ['Back Control', 'Technical Mount To Back', 'Kimura', 'Arm Triangle'],
    previewSequence: ['Kimura grip', 'Shoulder turn makes them run from the arm', 'Back control', 'Arm triangle if they flatten back under pressure'],
    exampleSequence: [
      'Kimura grip',
      'Crossface pressure keeps the chest line turned',
      'Hip block stops the guard from recovering',
      'They turn away late to hide the shoulder',
      'Back-take / arm-triangle continuation'
    ],
    curriculumSearch: 'kimura',
    treeSearch: 'back control',
    relatedTerms: ['kimura', 'back control', 'technical mount to back', 'arm triangle', 'top half guard', 'crossface underhook half guard pass']
  },
  {
    title: 'Mount smother-to-armbar setups',
    lane: 'Submission',
    summary: 'Use smother pressure to make the arms react before the armbar lane is exposed.',
    description:
      'This family is for top mount attacks where the smother is the setup: chest pressure, high-mount climbing, and wrist tracking that force the defender to push or turn so the armbar or mounted triangle lane appears.',
    setupNodes: ['Smother Pressure', 'High-Mount Climb', 'Wrist Track', 'Head-Line Block'],
    nextAttacks: ['Straight Armbar From Mount', 'Mounted Triangle', 'Punch Choke', 'Back Control'],
    previewSequence: ['Smother pressure', 'Wrist track catches the push reaction', 'Straight armbar from mount', 'Mounted triangle if they hide the elbow and turn late'],
    exampleSequence: [
      'Smother pressure',
      'High-mount climb keeps the hips light',
      'Wrist track catches the defensive push',
      'They turn late but leave the elbow high',
      'Armbar / mounted-triangle continuation'
    ],
    curriculumSearch: 'mount',
    treeSearch: 'straight armbar from mount',
    relatedTerms: ['straight armbar from mount', 'mounted triangle', 'punch choke', 'back control', 'mount', 'smother']
  },
  {
    title: 'Turtle bottom granby-to-reguard setups',
    lane: 'Guard',
    summary: 'Use the granby roll to create reguard or shin-to-shin lanes before the rider settles back down.',
    description:
      'This family is for bottom turtle recoveries where the setup is about hand clears, shoulder turns, and granby timing that reopen guard, shin-to-shin, or stand-up lanes instead of accepting the ride.',
    setupNodes: ['Hand Fight Clear', 'Shoulder Turn', 'Granby Roll', 'Leg Reconnect'],
    nextAttacks: ['Open Guard Recovery', 'Shin-To-Shin', 'Technical Stand-Up Sweep', 'Single-Leg X'],
    previewSequence: ['Granby roll', 'Leg reconnect opens the hip line', 'Open guard recovery', 'Shin-to-shin if the passer chases the legs late'],
    exampleSequence: [
      'Hand fight clear',
      'Shoulder turn starts the roll under the chest line',
      'Granby roll pulls the hips free',
      'They chase the legs but leave one foot near late',
      'Reguard / shin-to-shin continuation'
    ],
    curriculumSearch: 'granby roll',
    treeSearch: 'open guard',
    relatedTerms: ['granby roll', 'open guard recovery', 'shin to shin', 'technical stand-up sweep', 'single leg x', 'turtle escape']
  },
  {
    title: 'Standing two-on-one-to-arm-drag setups',
    lane: 'Standing',
    summary: 'Use the two-on-one to pull the shoulder line across and open the rear angle cleanly.',
    description:
      'This family is for standing two-on-one attacks where the setup is about steering the shoulder line, changing angles, and turning the elbow so the arm drag, rear angle, or single-leg lane appears before they square back up.',
    setupNodes: ['Two-On-One Control', 'Shoulder Pull', 'Angle Step', 'Elbow Turn'],
    nextAttacks: ['Arm Drag To Back Take', 'Rear Body Lock Standing', 'Single Leg', 'Back Control'],
    previewSequence: ['Shoulder pull', 'Angle step wins the rear corner', 'Arm Drag To Back Take', 'Single leg if they square but leave the leg close'],
    exampleSequence: [
      'Two-on-one control',
      'Elbow turn keeps the arm from retracting',
      'Angle step clears the shoulder past the hips',
      'They square late but leave the leg underneath',
      'Arm-drag / single-leg continuation'
    ],
    curriculumSearch: 'two on one',
    treeSearch: 'arm drag to back take',
    relatedTerms: ['two on one', 'arm drag to back take', 'rear body lock standing', 'single leg', 'back control', 'standing']
  },
  {
    title: 'Closed-guard clamp-to-triangle setups',
    lane: 'Guard',
    summary: 'Use the clamp and posture break to make the triangle lane appear before the arm slips free.',
    description:
      'This family is for closed-guard clamp attacks where the setup is about breaking posture, trapping one shoulder line, and climbing the hips so the triangle, armbar, or omoplata lane opens without chasing the finish too early.',
    setupNodes: ['Clamp Lock', 'Posture Break', 'Hip Climb', 'Shoulder Trap'],
    nextAttacks: ['Triangle Choke', 'Straight Armbar From Guard', 'Omoplata', 'Kimura'],
    previewSequence: ['Clamp lock', 'Hip climb traps the shoulder line', 'Triangle choke', 'Armbar if they posture and pull the elbow late'],
    exampleSequence: [
      'Clamp lock',
      'Posture break folds the head over the hips',
      'Hip climb keeps the shoulder trapped',
      'They posture late but leave the elbow inside',
      'Triangle / armbar continuation'
    ],
    curriculumSearch: 'triangle choke',
    treeSearch: 'triangle choke',
    relatedTerms: ['triangle choke', 'straight armbar from guard', 'omoplata', 'kimura', 'closed guard', 'clamp guard']
  },
  {
    title: 'Half-butterfly shoulder-crunch-to-sweep setups',
    lane: 'Guard',
    summary: 'Use the shoulder crunch from half butterfly to tilt the base before the sweep or arm attack opens.',
    description:
      'This family is for half-butterfly attacks where the setup is about shoulder crunch control, hook lift timing, and hip angles that create the sweep, Choi Bar, or wrestle-up lane before the top player squares back up.',
    setupNodes: ['Shoulder Crunch', 'Half-Butterfly Hook Lift', 'Hip Angle Shift', 'Elbow Trap'],
    nextAttacks: ['Butterfly Sweep', 'Choi Bar', 'Wrestle-Up Single Leg Sweep', 'Technical Stand-Up Sweep'],
    previewSequence: ['Shoulder crunch', 'Hook lift tips the base', 'Butterfly sweep', 'Choi Bar if they widen the elbow and posture late'],
    exampleSequence: [
      'Shoulder crunch',
      'Half-butterfly hook lift keeps the hips tilted',
      'Hip angle shift follows the shoulder line',
      'They post late but leave the elbow high',
      'Sweep / Choi-Bar continuation'
    ],
    curriculumSearch: 'butterfly sweep',
    treeSearch: 'butterfly sweep',
    relatedTerms: ['butterfly sweep', 'choi bar', 'wrestle-up single leg sweep', 'technical stand-up sweep', 'half butterfly', 'shoulder crunch']
  },
  {
    title: 'Top-side-control-to-far-side-armbar setups',
    lane: 'Submission',
    summary: 'Use side-control pressure to open the far-side armbar before the shoulders can turn back in.',
    description:
      'This family is for top side-control armbar attacks where the setup is really about head control, far-arm isolation, and hip walking that expose the far elbow line before the bottom player can rebuild inside frames.',
    setupNodes: ['Head Control', 'Far-Arm Isolation', 'Hip Walk North', 'Shoulder Turn'],
    nextAttacks: ['Straight Armbar From Side Control', 'Kimura', 'North South Choke', 'Back Control'],
    previewSequence: ['Far-arm isolation', 'Hip walk north exposes the elbow line', 'Straight armbar from side control', 'Kimura if they bend the arm and hide the wrist late'],
    exampleSequence: [
      'Head control',
      'Far-arm isolation stretches the shoulder line',
      'Hip walk north clears the elbow path',
      'They bend the arm late trying to turn in',
      'Far-side-armbar / kimura continuation'
    ],
    curriculumSearch: 'straight armbar from side control',
    treeSearch: 'straight armbar from side control',
    relatedTerms: ['straight armbar from side control', 'kimura', 'north south choke', 'back control', 'side control', 'far side armbar']
  },
  {
    title: 'North-south float-to-kimura setups',
    lane: 'Submission',
    summary: 'Use the float through north-south to expose the kimura line before the elbow tucks back in.',
    description:
      'This family is for north-south transitions where the setup is about floating around the shoulders, changing the chest angle, and catching the wrist or elbow so the kimura appears before the defender squares up again.',
    setupNodes: ['Float Step', 'Shoulder Float', 'Wrist Catch', 'Elbow Lift'],
    nextAttacks: ['Kimura', 'North South Choke', 'Straight Armbar From Side Control', 'Back Control'],
    previewSequence: ['Float step', 'Wrist catch exposes the bent elbow line', 'Kimura', 'North South Choke if they hide the arm and leave the neck line late'],
    exampleSequence: [
      'Float step',
      'Shoulder float keeps the hips from reconnecting',
      'Wrist catch stops the arm from hiding',
      'They tuck the elbow late but leave the neck line open',
      'Kimura / choke continuation'
    ],
    curriculumSearch: 'kimura',
    treeSearch: 'kimura',
    relatedTerms: ['kimura', 'north south choke', 'straight armbar from side control', 'back control', 'north south', 'float pass']
  },
  {
    title: 'Bottom-mount bridge-to-knee-elbow setups',
    lane: 'Guard',
    summary: 'Use the bridge to force the post, then time the knee-elbow escape before mount resets.',
    description:
      'This family is for bottom mount escapes where the bridge is the setup: making the top player post, shifting the weight line, and then inserting the knee-elbow escape to reopen half guard or quarter guard before they re-center.',
    setupNodes: ['Bridge Bump', 'Post Reaction', 'Hip Shift', 'Knee-Elbow Insert'],
    nextAttacks: ['Half Guard Recovery', 'Quarter Guard', 'Shin-To-Shin', 'Single-Leg X'],
    previewSequence: ['Bridge bump', 'Post reaction lightens the hip line', 'Half guard recovery', 'Quarter guard if the knee sneaks in only halfway'],
    exampleSequence: [
      'Bridge bump',
      'Post reaction makes the near hip light',
      'Hip shift opens the knee-elbow lane',
      'They settle back down late but leave the knee line open',
      'Half-guard / quarter-guard continuation'
    ],
    curriculumSearch: 'mount escape',
    treeSearch: 'half guard',
    relatedTerms: ['mount escape', 'half guard recovery', 'quarter guard', 'shin to shin', 'single leg x', 'knee elbow escape']
  },
  {
    title: 'Standing inside-tie-to-snap-down setups',
    lane: 'Standing',
    summary: 'Use the inside tie to pull posture and steer into the snap-down lane before the stance squares up.',
    description:
      'This family is for standing inside-tie attacks where the setup is about elbow control, head position, and angle changes that make the snap-down, front headlock, or go-behind lane appear before the opponent rebuilds posture.',
    setupNodes: ['Inside Tie', 'Elbow Pull', 'Head Position Win', 'Angle Step'],
    nextAttacks: ['Snap Down', 'Front Headlock Standing', 'Go-Behind Position', 'Knee Tap'],
    previewSequence: ['Elbow pull', 'Head position wins the shoulder line', 'Snap down', 'Go-behind if they square late with the head still low'],
    exampleSequence: [
      'Inside tie',
      'Elbow pull breaks the upper-body posture',
      'Head position win keeps the line turned',
      'They square late but keep the head low',
      'Snap-down / go-behind continuation'
    ],
    curriculumSearch: 'snap down',
    treeSearch: 'snap down',
    relatedTerms: ['snap down', 'front headlock standing', 'go-behind position', 'knee tap', 'inside tie', 'standing']
  },
  {
    title: 'Open-guard foot-post-to-tripod-sweep setups',
    lane: 'Guard',
    summary: 'Use the foot post and ankle control to make the tripod sweep lane open before the base resets.',
    description:
      'This family is for open-guard tripod-style sweeps where the setup is about foot posting, ankle control, and hip angles that make the sweep, technical stand-up, or leg-drag follow-up appear before the top player regains posture.',
    setupNodes: ['Foot Post', 'Ankle Control', 'Hip Pull', 'Far-Leg Lift'],
    nextAttacks: ['Tripod Sweep', 'Technical Stand-Up Sweep', 'Leg Drag', 'Single Leg'],
    previewSequence: ['Foot post', 'Far-leg lift tips the hips back', 'Tripod sweep', 'Leg drag if they square late but leave the knees across'],
    exampleSequence: [
      'Foot post',
      'Ankle control keeps the base from stepping free',
      'Hip pull tips the shoulders behind the heels',
      'They square late but leave the legs extended',
      'Tripod-sweep / technical-stand-up continuation'
    ],
    curriculumSearch: 'tripod sweep',
    treeSearch: 'tripod sweep',
    relatedTerms: ['tripod sweep', 'technical stand-up sweep', 'leg drag', 'single leg', 'open guard', 'ankle control']
  },
  {
    title: 'Collar-sleeve shoulder-walk-to-triangle setups',
    lane: 'Guard',
    summary: 'Use collar-sleeve control and shoulder walks to climb into the triangle before posture returns.',
    description:
      'This family is for collar-sleeve attacks where the setup is about shoulder walking, posture breaking, and leg climbing that make the triangle, omoplata, or armbar lane appear before the top player clears the sleeve line.',
    setupNodes: ['Collar Control', 'Sleeve Control', 'Shoulder Walk', 'Hip Climb'],
    nextAttacks: ['Triangle Choke', 'Omoplata', 'Straight Armbar From Guard', 'Clamp Guard'],
    previewSequence: ['Shoulder walk', 'Hip climb closes the angle', 'Triangle choke', 'Omoplata if they posture and hide the elbow late'],
    exampleSequence: [
      'Collar control',
      'Sleeve control fixes the post',
      'Shoulder walk climbs the hips up the back line',
      'They posture late but leave the arm inside',
      'Triangle / omoplata continuation'
    ],
    curriculumSearch: 'triangle choke',
    treeSearch: 'triangle choke',
    relatedTerms: ['triangle choke', 'omoplata', 'straight armbar from guard', 'clamp guard', 'collar sleeve guard', 'closed guard']
  },
  {
    title: 'Top-half crossface-to-arm-triangle setups',
    lane: 'Submission',
    summary: 'Use the crossface from top half to pin the head-and-arm line before the choke is obvious.',
    description:
      'This family is for top half-guard chokes where the setup is about crossface pressure, head control, and shoulder trapping that make the arm triangle or mount lane appear before the bottom player can rebuild frames.',
    setupNodes: ['Crossface Pressure', 'Head Pin', 'Shoulder Trap', 'Hip Settle'],
    nextAttacks: ['Arm Triangle', 'Mount', 'Punch Choke', 'Back Control'],
    previewSequence: ['Crossface pressure', 'Shoulder trap pins the head-and-arm line', 'Arm triangle', 'Mount if they frame hard and turn back under late'],
    exampleSequence: [
      'Crossface pressure',
      'Head pin keeps the chin from turning back in',
      'Shoulder trap seals the head-and-arm line',
      'They frame late but leave the arm trapped',
      'Arm-triangle / mount continuation'
    ],
    curriculumSearch: 'arm triangle',
    treeSearch: 'arm triangle',
    relatedTerms: ['arm triangle', 'mount', 'punch choke', 'back control', 'top half guard', 'crossface underhook half guard pass']
  },
  {
    title: 'Side-control windshield-wiper-to-mount setups',
    lane: 'Passing',
    summary: 'Use the windshield-wiper transition to move from side control into mount before the knees recover.',
    description:
      'This family is for top side-control transitions where the setup is about pinning the hips, lifting the near knee, and windshield-wipering into mount while the bottom player is still stuck under shoulder pressure.',
    setupNodes: ['Hip Pin', 'Near-Knee Lift', 'Shoulder Pressure', 'Windshield-Wiper Step'],
    nextAttacks: ['Mount', 'Gift Wrap', 'Punch Choke', 'Technical Mount To Back'],
    previewSequence: ['Near-knee lift', 'Windshield-wiper step clears the legs', 'Mount', 'Gift wrap if they turn and expose the shoulder late'],
    exampleSequence: [
      'Hip pin',
      'Shoulder pressure keeps the frames flat',
      'Near-knee lift opens the mount line',
      'They turn late but leave the shoulder exposed',
      'Mount / gift-wrap continuation'
    ],
    curriculumSearch: 'mount',
    treeSearch: 'mount',
    relatedTerms: ['mount', 'gift wrap', 'punch choke', 'technical mount to back', 'side control', 'windshield wiper']
  },
  {
    title: 'Bottom-side-control underhook-to-dogfight setups',
    lane: 'Guard',
    summary: 'Use the underhook escape from bottom side control to build dogfight before the passer settles back in.',
    description:
      'This family is for bottom side-control escapes where the setup is about underhook timing, hip turns, and knee recovery that turn the escape into dogfight, a wrestle-up, or shin-to-shin instead of only a neutral reset.',
    setupNodes: ['Underhook Reach', 'Hip Turn', 'Knee Recover', 'Come-Up Angle'],
    nextAttacks: ['Dogfight', 'Wrestle-Up Single Leg Sweep', 'Shin-To-Shin', 'Half Guard Recovery'],
    previewSequence: ['Underhook reach', 'Come-up angle wins the shoulder line', 'Dogfight', 'Wrestle up if they stay tall and chase the underhook late'],
    exampleSequence: [
      'Underhook reach',
      'Hip turn opens the inside lane',
      'Knee recover keeps the legs connected',
      'They stay tall late trying to flatten the shoulders',
      'Dogfight / wrestle-up continuation'
    ],
    curriculumSearch: 'dogfight',
    treeSearch: 'dogfight',
    relatedTerms: ['dogfight', 'wrestle-up single leg sweep', 'shin to shin', 'half guard recovery', 'side control escape', 'underhook']
  },
  {
    title: 'Standing arm-drag-to-knee-tap setups',
    lane: 'Standing',
    summary: 'Use the arm drag to make the hips turn and expose the knee-tap lane before they square up.',
    description:
      'This family is for standing arm-drag attacks where the setup is about shoulder-line wins, angle steps, and hip reactions that make the knee tap, rear body lock, or single-leg lane appear off the drag.',
    setupNodes: ['Arm Drag Pull', 'Angle Step', 'Shoulder-Line Win', 'Hip Chase'],
    nextAttacks: ['Knee Tap', 'Rear Body Lock Standing', 'Single Leg', 'Back Control'],
    previewSequence: ['Angle step', 'Hip chase turns the far knee into range', 'Knee tap', 'Rear body lock if they keep turning away late'],
    exampleSequence: [
      'Arm drag pull',
      'Shoulder-line win keeps them from squaring cleanly',
      'Angle step chases the far hip',
      'They keep turning away but leave the knee near',
      'Knee-tap / rear-body-lock continuation'
    ],
    curriculumSearch: 'knee tap',
    treeSearch: 'knee tap',
    relatedTerms: ['knee tap', 'rear body lock standing', 'single leg', 'back control', 'arm drag', 'standing']
  },
  {
    title: 'Closed-guard sweep setups',
    lane: 'Guard',
    summary: 'Use posture breaks and sleeve control to make the flower-sweep angle appear before they square back up.',
    description:
      'This family is for closed-guard sweeps where the setup is really about breaking posture, controlling the far arm, and shifting the hips so the flower sweep, hip-bump follow-up, or back-take lane appears before the top player rebuilds balance.',
    setupNodes: ['Collar Pull', 'Sleeve Drag', 'Hip Angle Shift', 'Far-Arm Clamp'],
    nextAttacks: ['Flower Sweep', 'Hip Bump Sweep', 'Closed Guard Arm Drag To Back', 'Kimura'],
    previewSequence: ['Collar pull', 'Hip angle shift exposes the far shoulder line', 'Flower sweep', 'Hip bump if they posture hard and pull the elbow free late'],
    exampleSequence: [
      'Collar pull',
      'Sleeve drag stops the post from resetting',
      'Hip angle shift opens the flower-sweep lane',
      'They posture late but leave the arm across the center line',
      'Flower-sweep / hip-bump continuation'
    ],
    curriculumSearch: 'flower sweep',
    treeSearch: 'flower sweep',
    relatedTerms: ['flower sweep', 'hip bump sweep', 'closed guard arm drag to back', 'kimura', 'closed guard', 'sleeve drag']
  },
  {
    title: 'De La Riva off-balance-to-Single-Leg-X setups',
    lane: 'Guard',
    summary: 'Use De La Riva off-balances to create the foot exposure and angle that feed straight into Single-Leg X.',
    description:
      'This family is for De La Riva guards where the setup is about kuzushi, ankle steering, and hip angle changes that make the Single-Leg-X, ankle-dump, or leg-drag lane appear before the passer can clear the outside hook.',
    setupNodes: ['DLR Hook', 'Ankle Steering', 'Upper-Body Pull', 'Hip Scoot Under'],
    nextAttacks: ['De La Riva To Single-Leg X Sweep', 'Basic Single-Leg X Sweep', 'DLR Ankle Dump', 'Leg Drag'],
    previewSequence: ['Ankle steering', 'Hip scoot under exposes the foot line', 'De La Riva to Single-Leg X sweep', 'Leg drag if they pull the knee free but stay extended'],
    exampleSequence: [
      'DLR hook',
      'Ankle steering tips the knee outward',
      'Hip scoot under creates the Single-Leg-X lane',
      'They pull the leg late but keep the foot exposed',
      'SLX-entry / ankle-dump continuation'
    ],
    curriculumSearch: 'de la riva to single leg x sweep',
    treeSearch: 'de la riva to single leg x sweep',
    relatedTerms: ['de la riva to single leg x sweep', 'basic single leg x sweep', 'dlr ankle dump', 'leg drag', 'de la riva', 'single leg x']
  },
  {
    title: 'Leg-weave smash-to-pass setups',
    lane: 'Passing',
    summary: 'Use the leg weave and shoulder pressure to collapse the knees and open the pass before guard retention resets.',
    description:
      'This family is for top passing where the setup is about weaving the legs, pinning the knee line, and applying shoulder pressure so the smash pass, weave pass, or mount lane appears before the bottom player can pummel a frame back inside.',
    setupNodes: ['Leg Weave', 'Knee Pin', 'Shoulder Pressure', 'Hip Walk'],
    nextAttacks: ['Leg Weave Pass', 'Smash Pass', 'Weave To Mount', 'Pass To Knee On Belly'],
    previewSequence: ['Leg weave', 'Shoulder pressure folds the knees together', 'Smash pass', 'Mount if they turn hard and expose the top hip late'],
    exampleSequence: [
      'Leg weave',
      'Knee pin blocks the inside pummel',
      'Shoulder pressure collapses the hip line',
      'They turn late trying to recover half guard',
      'Smash-pass / weave-to-mount continuation'
    ],
    curriculumSearch: 'leg weave pass',
    treeSearch: 'leg weave pass',
    relatedTerms: ['leg weave pass', 'smash pass', 'weave to mount', 'pass to knee on belly', 'leg weave / leg pin passing', 'top half guard']
  },
  {
    title: 'Torreando-to-north-south setups',
    lane: 'Passing',
    summary: 'Use the torreando redirection to circle behind the knees and settle into north-south before the hips square back up.',
    description:
      'This family is for movement passing where the setup is about redirecting the shins, winning the shoulder line, and circling around the legs so north-south, side control, or back-step pressure appears before the guard can invert again.',
    setupNodes: ['Shin Redirect', 'Shoulder-Line Win', 'Circle Step', 'Hip Turn-Off'],
    nextAttacks: ['North-South', 'North-South Pass', 'Side Control', 'Backstep Pass'],
    previewSequence: ['Shin redirect', 'Circle step beats the knee line', 'North-south', 'Backstep if they invert late and keep one shin across'],
    exampleSequence: [
      'Shin redirect',
      'Shoulder-line win keeps the upper body pointed away',
      'Circle step clears the legs',
      'They invert late but leave one shin trapped underneath',
      'North-south / backstep continuation'
    ],
    curriculumSearch: 'north south pass',
    treeSearch: 'north south',
    relatedTerms: ['north south', 'north south pass', 'side control', 'backstep pass', 'torreando pass', 'open guard']
  },
  {
    title: 'Side-control americana-to-armbar setups',
    lane: 'Submission',
    summary: 'Use the Americana threat to straighten the arm and make the armbar lane appear before the elbow hides.',
    description:
      'This family is for side-control attacks where the setup is about shoulder pinning, wrist control, and threatening the Americana so the defender straightens or turns the elbow in a way that exposes the armbar or kimura continuation.',
    setupNodes: ['Crossface Pin', 'Wrist Staple', 'Americana Threat', 'Elbow Lift'],
    nextAttacks: ['Americana', 'Straight Armbar From Side Control', 'Kimura', 'Mount'],
    previewSequence: ['Americana threat', 'Elbow lift straightens the arm line', 'Straight armbar from side control', 'Kimura if they bend the arm and hide the elbow late'],
    exampleSequence: [
      'Crossface pin',
      'Wrist staple fixes the hand to the mat',
      'Americana threat makes the elbow react',
      'They straighten late trying to free the shoulder',
      'Americana-to-armbar continuation'
    ],
    curriculumSearch: 'americana',
    treeSearch: 'americana',
    relatedTerms: ['americana', 'straight armbar from side control', 'kimura', 'mount', 'side control', 'wrist staple']
  },
  {
    title: 'Back-control short-choke-to-armbar setups',
    lane: 'Submission',
    summary: 'Use the short-choke threat to turn the chin and expose the armbar before the hands reconnect.',
    description:
      'This family is for back-control attacks where the setup is about choking pressure, hand-fighting reactions, and shoulder-line control that make the armbar, rear triangle, or rear naked choke lane appear before the defender can fully hide the arm.',
    setupNodes: ['Seatbelt Tightening', 'Short-Choke Threat', 'Hand-Peel Reaction', 'Shoulder-Line Trap'],
    nextAttacks: ['Short Choke', 'Armbar Position', 'Rear Triangle', 'Rear Naked Choke'],
    previewSequence: ['Short-choke threat', 'Hand peel exposes the elbow line', 'Armbar position', 'Rear triangle if they tuck the arm but leave the shoulder trapped late'],
    exampleSequence: [
      'Seatbelt tightening',
      'Short-choke threat makes the hands peel upward',
      'Shoulder-line trap keeps the turn limited',
      'They defend late but leave the elbow outside the ribs',
      'Short-choke / armbar continuation'
    ],
    curriculumSearch: 'short choke',
    treeSearch: 'short choke',
    relatedTerms: ['short choke', 'armbar position', 'rear triangle', 'rear naked choke', 'back control', 'seatbelt']
  },
  {
    title: 'Closed-guard hip-bump-to-kimura setups',
    lane: 'Guard',
    summary: 'Use the hip-bump threat to force the post and expose the kimura before posture settles back in.',
    description:
      'This family is for closed-guard attacks where the setup is about sitting up hard enough to create the hip-bump threat, forcing a post, and then turning that post into the kimura, arm drag, or triangle lane before the top player regains posture.',
    setupNodes: ['Sit-Up Threat', 'Hip Bump', 'Post Reaction', 'Wrist Capture'],
    nextAttacks: ['Hip Bump Sweep', 'Kimura', 'Closed Guard Arm Drag To Back', 'Triangle Choke'],
    previewSequence: ['Hip bump threat', 'Post reaction exposes the wrist', 'Kimura', 'Triangle if they rip the arm free but leave it inside late'],
    exampleSequence: [
      'Sit-up threat',
      'Hip bump makes the post appear',
      'Wrist capture stops the hand from escaping cleanly',
      'They pull the elbow free late but leave the arm inside',
      'Kimura / triangle continuation'
    ],
    curriculumSearch: 'hip bump sweep',
    treeSearch: 'hip bump sweep',
    relatedTerms: ['hip bump sweep', 'kimura', 'closed guard arm drag to back', 'triangle choke', 'closed guard', 'wrist capture']
  },
  {
    title: 'Seated single-leg setups',
    lane: 'Standing',
    summary: 'Use the seated two-on-one to turn the shoulders and expose the single-leg before they square up again.',
    description:
      'This family is for seated-to-standing connections where the setup is about winning a two-on-one, steering the shoulder line, and coming up as the opponent turns away so the single-leg, ankle-pick, or front-headlock lane opens before they reset.',
    setupNodes: ['Two-On-One', 'Shoulder Turn', 'Come-Up Step', 'Head Position Win'],
    nextAttacks: ['Single-Leg From Seated Guard', 'Single Leg', 'Seated Ankle Pick Sweep', 'Front Headlock Standing'],
    previewSequence: ['Two-on-one', 'Shoulder turn exposes the leg line', 'Single-leg from seated guard', 'Front headlock if they sprawl late but leave the head low'],
    exampleSequence: [
      'Two-on-one',
      'Shoulder turn keeps them from squaring back up',
      'Come-up step chases the leg',
      'They sprawl late but keep the head low',
      'Single-leg / front-headlock continuation'
    ],
    curriculumSearch: 'single-leg from seated guard',
    treeSearch: 'single-leg from seated guard',
    relatedTerms: ['single-leg from seated guard', 'single leg', 'seated ankle pick sweep', 'front headlock standing', 'two-on-one standing', 'seated guard']
  },
  {
    title: 'Knee-cut-to-mount-or-arm-triangle setups',
    lane: 'Passing',
    summary: 'Use the knee cut to pin the shoulder line and choose mount or arm triangle before half guard rebuilds.',
    description:
      'This family is for top half-guard passing where the setup is about knee-cut pressure, head control, and shoulder pinning that make the mount, arm triangle, or knee-on-belly lane appear before the bottom player recovers the inside knee.',
    setupNodes: ['Knee Cut Entry', 'Crossface Pin', 'Shoulder Flatten', 'Hip Switch'],
    nextAttacks: ['Mount Off Knee Cut', 'Arm Triangle', 'Pass To Knee On Belly', 'Long Step'],
    previewSequence: ['Crossface pin', 'Shoulder flatten kills the knee line', 'Mount off knee cut', 'Arm triangle if they frame late and leave the head-and-arm line trapped'],
    exampleSequence: [
      'Knee cut entry',
      'Crossface pin flattens the upper body',
      'Shoulder flatten blocks the inside knee recovery',
      'They frame late but keep the head-and-arm line trapped',
      'Mount / arm-triangle continuation'
    ],
    curriculumSearch: 'mount off knee cut',
    treeSearch: 'mount off knee cut',
    relatedTerms: ['mount off knee cut', 'arm triangle', 'pass to knee on belly', 'long step', 'knee cut', 'top half guard']
  },
  {
    title: 'North-south-to-paper-cutter setups',
    lane: 'Submission',
    summary: 'Use north-south control to make the paper-cutter line appear before the near arm reconnects.',
    description:
      'This family is for upper-body attacks where the setup is about north-south chest pressure, wrist or elbow control, and head turns that expose the paper-cutter, kimura, or north-south-choke lane before the defender gets frames back in place.',
    setupNodes: ['North-South Float', 'Near-Arm Pin', 'Head Turn', 'Collar / Wrist Find'],
    nextAttacks: ['Paper Cutter Choke', 'North-South Choke', 'Kimura', 'Straight Armbar From Side Control'],
    previewSequence: ['Near-arm pin', 'Head turn opens the collar line', 'Paper cutter choke', 'Kimura if they block the collar line but leave the elbow bent late'],
    exampleSequence: [
      'North-south float',
      'Near-arm pin keeps the frame from returning',
      'Head turn exposes the choke angle',
      'They block the collar line late but leave the elbow bent',
      'Paper-cutter / kimura continuation'
    ],
    curriculumSearch: 'paper cutter choke',
    treeSearch: 'paper cutter choke',
    relatedTerms: ['paper cutter choke', 'north-south choke', 'kimura', 'straight armbar from side control', 'north-south', 'head turn']
  },
  {
    title: 'Back-control rear-triangle setups',
    lane: 'Submission',
    summary: 'Use choking pressure and shoulder traps to turn the back attack into a rear-triangle before the elbow hides.',
    description:
      'This family is for back-control submissions where the setup is about threatening the choke, trapping the shoulder line, and opening the armpit space so the rear triangle, armbar, or short-choke continuation appears before the defender fully closes the elbow line.',
    setupNodes: ['Seatbelt Clamp', 'Choke Threat', 'Shoulder Trap', 'Leg Climb'],
    nextAttacks: ['Rear Triangle', 'Armbar Position', 'Short Choke', 'Rear Naked Choke'],
    previewSequence: ['Choke threat', 'Shoulder trap opens the armpit lane', 'Rear triangle', 'Armbar if they hide the neck but leave the elbow outside late'],
    exampleSequence: [
      'Seatbelt clamp',
      'Choke threat raises the defense line',
      'Shoulder trap opens the triangle lane',
      'They hide the neck late but leave the elbow exposed',
      'Rear-triangle / armbar continuation'
    ],
    curriculumSearch: 'rear triangle',
    treeSearch: 'rear triangle',
    relatedTerms: ['rear triangle', 'armbar position', 'short choke', 'rear naked choke', 'back control', 'seatbelt']
  },
  {
    title: 'Open-guard collar-drag-to-front-headlock setups',
    lane: 'Guard',
    summary: 'Use the collar drag to pull posture forward and enter the front-headlock lane before they square back up.',
    description:
      'This family is for open-guard upper-body entries where the setup is about collar dragging, steering the head, and chasing the shoulder turn so the front headlock, go-behind, or seated single-leg lane opens before the opponent regains posture.',
    setupNodes: ['Collar Drag', 'Head Pull', 'Shoulder Turn', 'Come-Up Chase'],
    nextAttacks: ['Front Headlock Standing', 'Snap Down', 'Go-Behind Position', 'Single-Leg From Seated Guard'],
    previewSequence: ['Collar drag', 'Shoulder turn leaves the head ahead of the hips', 'Front headlock standing', 'Go-behind if they keep turning and the head stays low late'],
    exampleSequence: [
      'Collar drag',
      'Head pull keeps the posture broken forward',
      'Shoulder turn stops the square-up',
      'They keep turning late with the head still low',
      'Front-headlock / go-behind continuation'
    ],
    curriculumSearch: 'front headlock standing',
    treeSearch: 'front headlock standing',
    relatedTerms: ['front headlock standing', 'snap down', 'go-behind position', 'single-leg from seated guard', 'collar drag sweep', 'open guard']
  },
  {
    title: 'Butterfly two-on-one-to-arm-drag setups',
    lane: 'Guard',
    summary: 'Use the butterfly two-on-one to turn the shoulders and expose the arm-drag lane before the base squares up.',
    description:
      'This family is for butterfly-guard attacks where the setup is about two-on-one control, shoulder turns, and head position that make the arm drag, shoulder crunch, single-leg, or back-take lane appear before the top player can re-center their base.',
    setupNodes: ['Two-On-One Control', 'Shoulder Turn', 'Head Position Win', 'Angle Sit-Up'],
    nextAttacks: ['Arm Drag To Back', 'Shoulder Crunch Butterfly Sweep', 'Single Leg', 'Back Control'],
    previewSequence: ['Two-on-one control', 'Shoulder turn opens the far-side lane', 'Arm drag to back', 'Shoulder crunch if they square late but leave the elbow near the ribs'],
    exampleSequence: [
      'Two-on-one control',
      'Shoulder turn keeps the post from reconnecting',
      'Angle sit-up exposes the drag lane',
      'They square late but leave the elbow tucked close',
      'Arm-drag / shoulder-crunch continuation'
    ],
    curriculumSearch: 'arm drag to back',
    treeSearch: 'arm drag to back',
    relatedTerms: ['arm drag to back', 'shoulder crunch butterfly sweep', 'single leg', 'back control', 'butterfly guard', 'two-on-one standing']
  },
  {
    title: 'Closed-guard submission setups',
    lane: 'Guard',
    summary: 'Use the posture break to keep the arm inside and make the triangle lane appear before posture returns.',
    description:
      'This family is for closed-guard attacks where the setup is about posture breaking, shoulder-line control, and hip climbing that make the triangle, armbar, omoplata, or clamp-guard lane appear before the top player clears the trapped arm.',
    setupNodes: ['Posture Break', 'Head Pull', 'Hip Climb', 'Arm-In Clamp'],
    nextAttacks: ['Triangle Choke', 'Straight Armbar From Guard', 'Omoplata', 'Clamp Guard'],
    previewSequence: ['Posture break', 'Hip climb closes the shoulder line', 'Triangle choke', 'Omoplata if they posture late but leave the elbow trapped outside'],
    exampleSequence: [
      'Posture break',
      'Head pull keeps the shoulders folded forward',
      'Hip climb traps the arm inside',
      'They posture late but keep the elbow outside the ribs',
      'Triangle / omoplata continuation'
    ],
    curriculumSearch: 'triangle choke',
    treeSearch: 'triangle choke',
    relatedTerms: ['triangle choke', 'straight armbar from guard', 'omoplata', 'clamp guard', 'closed guard', 'posture break']
  },
  {
    title: 'Top-half underhook-to-knee-slice setups',
    lane: 'Passing',
    summary: 'Use the underhook and shoulder win to open the knee-slice lane before half guard rebuilds.',
    description:
      'This family is for top half-guard passing where the setup is about underhook wins, head position, and freeing the knee line so the knee slice, mount, or knee-on-belly lane appears before the bottom player reconnects frames.',
    setupNodes: ['Underhook Win', 'Head Position', 'Knee-Line Free', 'Hip Switch'],
    nextAttacks: ['Knee Slice Pass', 'Mount Off Knee Cut', 'Pass To Knee On Belly', 'Long Step'],
    previewSequence: ['Underhook win', 'Knee line clears the shield', 'Knee slice pass', 'Mount if they chase the underhook late and lose the elbow frame'],
    exampleSequence: [
      'Underhook win',
      'Head position turns the shoulders away',
      'Knee-line free step clears the inside hook',
      'They chase the underhook late but lose the elbow frame',
      'Knee-slice / mount continuation'
    ],
    curriculumSearch: 'knee slice pass',
    treeSearch: 'knee slice pass',
    relatedTerms: ['knee slice pass', 'mount off knee cut', 'pass to knee on belly', 'long step', 'top half guard', 'underhook half guard']
  },
  {
    title: 'Side-control-to-crucifix setups',
    lane: 'Submission',
    summary: 'Use side-control arm isolation to turn the shoulders and enter crucifix before the elbow hides.',
    description:
      'This family is for top side-control attacks where the setup is about near-arm isolation, head control, and shoulder turns that make the crucifix, north-south choke, or back-take lane appear before the bottom player gets the elbow back inside.',
    setupNodes: ['Near-Arm Isolation', 'Head Control', 'Shoulder Turn', 'Hip Walk North'],
    nextAttacks: ['Crucifix', 'North-South Choke', 'Back Control', 'Straight Armbar From Side Control'],
    previewSequence: ['Near-arm isolation', 'Shoulder turn exposes the far shoulder line', 'Crucifix', 'Back control if they roll late and leave the chest-to-back lane open'],
    exampleSequence: [
      'Near-arm isolation',
      'Head control keeps the turn from squaring back up',
      'Shoulder turn opens the crucifix line',
      'They roll late trying to hide the arm',
      'Crucifix / back-control continuation'
    ],
    curriculumSearch: 'crucifix',
    treeSearch: 'crucifix',
    relatedTerms: ['crucifix', 'north-south choke', 'back control', 'straight armbar from side control', 'side control', 'near arm isolation']
  },
  {
    title: 'Back-control bow-and-arrow setups',
    lane: 'Submission',
    summary: 'Use collar control and hip angle to make the bow-and-arrow lane appear before the shoulder line escapes.',
    description:
      'This family is for gi back attacks where the setup is about collar control, top-side shoulder traps, and hip angle changes that make the bow-and-arrow, short-choke, or technical-mount lane appear before the defender hides the choking shoulder.',
    setupNodes: ['Collar Feed', 'Shoulder Trap', 'Hip Angle Change', 'Top-Leg Control'],
    nextAttacks: ['Bow And Arrow Choke', 'Short Choke', 'Technical Mount', 'Back Control'],
    previewSequence: ['Collar feed', 'Hip angle change opens the bow-and-arrow line', 'Bow and arrow choke', 'Short choke if they hide the shoulder late but keep the collar exposed'],
    exampleSequence: [
      'Collar feed',
      'Shoulder trap keeps the turn from closing the lane',
      'Hip angle change creates the bow-and-arrow finish line',
      'They hide the shoulder late but leave the collar exposed',
      'Bow-and-arrow / short-choke continuation'
    ],
    curriculumSearch: 'bow and arrow choke',
    treeSearch: 'bow and arrow choke',
    relatedTerms: ['bow and arrow choke', 'short choke', 'technical mount', 'back control', 'collar feed', 'back control']
  },
  {
    title: 'Standing front-headlock setups',
    lane: 'Standing',
    summary: 'Use the snap-down to force the head low and choose the front-headlock finish before posture recovers.',
    description:
      'This family is for standing front-headlock sequences where the setup is about posture breaks, shoulder turns, and angle steps that make the front headlock, go-behind, or guillotine lane appear before the opponent rebuilds to a balanced stance.',
    setupNodes: ['Snap Down', 'Head Pull', 'Angle Step', 'Shoulder Cover'],
    nextAttacks: ['Front Headlock Standing', 'Go-Behind Position', 'Guillotine', 'Snap Down To Front Headlock'],
    previewSequence: ['Snap down', 'Angle step traps the head ahead of the hips', 'Front headlock standing', 'Go-behind if they square late but keep the head low'],
    exampleSequence: [
      'Snap down',
      'Head pull keeps the posture folded',
      'Angle step covers the shoulder line',
      'They square late with the head still low',
      'Front-headlock / go-behind continuation'
    ],
    curriculumSearch: 'front headlock standing',
    treeSearch: 'front headlock standing',
    relatedTerms: ['front headlock standing', 'go-behind position', 'guillotine', 'snap down to front headlock', 'snap down', 'standing']
  },
  {
    title: 'K-guard entry-to-backside-50/50 setups',
    lane: 'Guard',
    summary: 'Use K-guard entries to tilt the hips and expose the backside-50/50 lane before the leg line clears.',
    description:
      'This family is for open-guard leg-entry attacks where the setup is about K-guard entries, leg pummeling, and hip angle wins that make backside 50/50, inside heel hook, or back-take lanes appear before the passer can clear the entanglement.',
    setupNodes: ['K-Guard Entry', 'Leg Pummel', 'Hip Tilt', 'Secondary-Leg Clamp'],
    nextAttacks: ['Backside 50/50', 'Inside Heel Hook', 'Wedging Back Take', '50/50'],
    previewSequence: ['K-guard entry', 'Hip tilt exposes the backside line', 'Backside 50/50', 'Inside heel hook if they keep the foot line trapped late'],
    exampleSequence: [
      'K-guard entry',
      'Leg pummel traps the near knee line',
      'Hip tilt opens the backside angle',
      'They try to turn free late but keep the foot exposed',
      'Backside-50/50 / heel-hook continuation'
    ],
    curriculumSearch: 'backside 50/50',
    treeSearch: 'backside 50/50',
    relatedTerms: ['backside 50/50', 'inside heel hook', 'wedging back take', '50/50', 'k-guard', 'leg pummel']
  },
  {
    title: 'Dogfight underhook-to-plan-b setups',
    lane: 'Guard',
    summary: 'Use the dogfight underhook to make the far knee light and open the Plan B lane before the whizzer settles.',
    description:
      'This family is for half-guard wrestle-up attacks where the setup is about dogfight underhooks, angle wins, and far-knee exposure that make Plan B, dogfight sweep, or single-leg continuations appear before the top player can square their hips back up.',
    setupNodes: ['Dogfight Underhook', 'Head Position Win', 'Far-Knee Chase', 'Hip Shelf'],
    nextAttacks: ['Plan B Sweep', 'Dogfight Sweep', 'Single Leg', 'Underhook Half Guard To Dogfight To Back'],
    previewSequence: ['Far-knee chase', 'Hip shelf makes the far leg light', 'Plan B sweep', 'Single leg if they turn the knee away but stay tall late'],
    exampleSequence: [
      'Dogfight underhook',
      'Head position keeps the shoulder line turned',
      'Far-knee chase makes the hip shelf work',
      'They turn the knee away late but stay tall',
      'Plan-B / single-leg continuation'
    ],
    curriculumSearch: 'plan b sweep',
    treeSearch: 'plan b sweep',
    relatedTerms: ['plan b sweep', 'dogfight sweep', 'single leg', 'underhook half guard to dogfight to back', 'dogfight', 'underhook half guard']
  },
  {
    title: 'Top-side-control-to-paper-cutter setups',
    lane: 'Submission',
    summary: 'Use side-control shoulder pressure and collar access to expose the paper-cutter lane before frames return.',
    description:
      'This family is for gi side-control attacks where the setup is about shoulder pressure, collar access, and elbow control that make the paper-cutter choke, kimura, or mount lane appear before the bottom player rebuilds the near-side frame.',
    setupNodes: ['Shoulder Pressure', 'Collar Feed', 'Near-Elbow Pin', 'Hip Walk'],
    nextAttacks: ['Paper Cutter Choke', 'Kimura', 'Mount', 'North-South Choke'],
    previewSequence: ['Collar feed', 'Near-elbow pin keeps the frame flat', 'Paper cutter choke', 'Mount if they defend the choke late and give up the knee line'],
    exampleSequence: [
      'Shoulder pressure',
      'Collar feed creates the choke line',
      'Near-elbow pin blocks the frame from returning',
      'They defend the collar late but expose the knee line',
      'Paper-cutter / mount continuation'
    ],
    curriculumSearch: 'paper cutter choke',
    treeSearch: 'paper cutter choke',
    relatedTerms: ['paper cutter choke', 'kimura', 'mount', 'north-south choke', 'side control', 'collar feed']
  },
  {
    title: 'Mount gift-wrap-to-back setups',
    lane: 'Submission',
    summary: 'Use the gift wrap from mount to turn the shoulders and expose the back before the elbow hides again.',
    description:
      'This family is for top mount transitions where the setup is about gift-wrap control, shoulder turns, and hip adjustments that make the technical-mount-to-back, rear attacks, or armbar lane appear before the bottom player can reconnect the near elbow.',
    setupNodes: ['Gift Wrap', 'Shoulder Turn', 'Technical Mount Step', 'Hip Follow'],
    nextAttacks: ['Technical Mount To Back', 'Back Control', 'Rear Naked Choke', 'Straight Armbar From Mount'],
    previewSequence: ['Gift wrap', 'Technical-mount step opens the back line', 'Technical mount to back', 'Armbar if they keep the back flat but leave the elbow outside late'],
    exampleSequence: [
      'Gift wrap',
      'Shoulder turn keeps the near elbow disconnected',
      'Technical-mount step opens the back line',
      'They stay flat late but leave the elbow outside',
      'Back-take / armbar continuation'
    ],
    curriculumSearch: 'technical mount to back',
    treeSearch: 'technical mount to back',
    relatedTerms: ['technical mount to back', 'back control', 'rear naked choke', 'straight armbar from mount', 'gift wrap', 'technical mount']
  },
  {
    title: 'Seated collar-drag-to-back setups',
    lane: 'Guard',
    summary: 'Use the seated collar drag to pull the shoulder line forward and open the back-take lane before they square up.',
    description:
      'This family is for seated-guard upper-body attacks where the setup is about collar drags, shoulder turns, and quick angle changes that make the back take, front headlock, or seated single-leg lane appear before the opponent recovers posture.',
    setupNodes: ['Seated Collar Drag', 'Shoulder Pull', 'Angle Step', 'Chest Follow'],
    nextAttacks: ['Arm Drag To Back', 'Back Control', 'Front Headlock Standing', 'Single-Leg From Seated Guard'],
    previewSequence: ['Seated collar drag', 'Angle step opens the rear shoulder lane', 'Arm drag to back', 'Front headlock if they square late but keep the head low'],
    exampleSequence: [
      'Seated collar drag',
      'Shoulder pull keeps the posture broken forward',
      'Angle step wins the rear shoulder line',
      'They square late with the head still low',
      'Back-take / front-headlock continuation'
    ],
    curriculumSearch: 'arm drag to back',
    treeSearch: 'arm drag to back',
    relatedTerms: ['arm drag to back', 'back control', 'front headlock standing', 'single-leg from seated guard', 'collar drag sweep', 'seated guard']
  },
  {
    title: 'Reverse De La Riva back-take setups',
    lane: 'Guard',
    summary: 'Use Reverse De La Riva angle changes to expose the spin-under lane before the passer squares up.',
    description:
      'This family is for inversion-style guard attacks where the setup is about Reverse De La Riva hooks, shoulder turns, and spin-under angles that make Kiss of the Dragon, baby bolo, or backside entries appear before the passer clears the hip line.',
    setupNodes: ['RDLR Hook', 'Shoulder Turn', 'Spin-Under Entry', 'Hip Follow'],
    nextAttacks: ['Kiss Of The Dragon', 'Baby Bolo', 'Back Control', 'Ashi Garami'],
    previewSequence: ['Spin-under entry', 'Hip follow wins the backside lane', 'Kiss of the Dragon', 'Baby bolo if they keep circling late and the back lane stays open'],
    exampleSequence: [
      'RDLR hook',
      'Shoulder turn keeps the knee from squaring up',
      'Spin-under entry opens the backside path',
      'They circle late but leave the back lane open',
      'Kiss-of-the-dragon / baby-bolo continuation'
    ],
    curriculumSearch: 'kiss of the dragon',
    treeSearch: 'kiss of the dragon',
    relatedTerms: ['kiss of the dragon', 'baby bolo', 'back control', 'ashi garami', 'reverse de la riva', 'spin under']
  },
  {
    title: 'Spider-guard submission setups',
    lane: 'Guard',
    summary: 'Use posture breaks and sleeve control to expose the omoplata before the elbow line clears.',
    description:
      'This family is for spider-guard submission attacks where the setup is about sleeve tension, posture breaks, and hip angles that make the omoplata, triangle, or armbar lane appear before the top player fully squares the shoulders back up.',
    setupNodes: ['Sleeve Tension', 'Posture Break', 'Hip Angle', 'Leg Re-Climb'],
    nextAttacks: ['Omoplata', 'Triangle Choke', 'Straight Armbar From Guard', 'Spider Lasso Sweep'],
    previewSequence: ['Sleeve tension', 'Posture breaks forward', 'Omoplata', 'Triangle if they posture late but keep the arm inside'],
    exampleSequence: [
      'Sleeve tension',
      'Posture break folds the shoulder line forward',
      'Hip angle swings the leg over the arm',
      'They posture late but keep the elbow inside the hip line',
      'Omoplata / triangle continuation'
    ],
    curriculumSearch: 'omoplata',
    treeSearch: 'omoplata',
    relatedTerms: ['omoplata', 'triangle choke', 'straight armbar from guard', 'spider lasso sweep', 'spider guard', 'lasso guard']
  },
  {
    title: 'Seated front-headlock setups',
    lane: 'Guard',
    summary: 'Use the seated arm drag to force posture forward and expose the front-headlock lane.',
    description:
      'This family is for seated-guard attacks where the setup is about arm drags, shoulder pulls, and head position that make the front headlock, go-behind, or single-leg lane appear before the top player can rebuild posture.',
    setupNodes: ['Arm Drag', 'Shoulder Pull', 'Head Position', 'Angle Sit-Up'],
    nextAttacks: ['Front Headlock Standing', 'Go-Behind Position', 'Single-Leg From Seated Guard', 'Snap Down'],
    previewSequence: ['Arm drag', 'Head stays ahead of the hips', 'Front headlock standing', 'Go-behind if they square late but stay folded'],
    exampleSequence: [
      'Arm drag',
      'Shoulder pull keeps the head moving past the frame',
      'Head position wins the front-headlock lane',
      'They square late but stay folded at the hips',
      'Front-headlock / go-behind continuation'
    ],
    curriculumSearch: 'front headlock standing',
    treeSearch: 'front headlock standing',
    relatedTerms: ['front headlock standing', 'go-behind position', 'single-leg from seated guard', 'snap down', 'arm drag to back', 'seated guard']
  },
  {
    title: 'Top-half submission setups',
    lane: 'Submission',
    summary: 'Use crossface pressure and collar access to expose the paper-cutter lane before frames rebuild.',
    description:
      'This family is for gi top-half submissions where the setup is about crossface pressure, collar access, and elbow control that make the paper-cutter, mount, or north-south lane appear before the bottom player re-wedges the near-side frame.',
    setupNodes: ['Crossface Pressure', 'Collar Feed', 'Near-Elbow Pin', 'Hip Walk'],
    nextAttacks: ['Paper Cutter Choke', 'Mount', 'North-South Choke', 'Kimura'],
    previewSequence: ['Crossface pressure', 'Collar feed opens the choke line', 'Paper cutter choke', 'Mount if they defend late and lose the near elbow'],
    exampleSequence: [
      'Crossface pressure',
      'Collar feed opens the blade across the neck',
      'Near-elbow pin blocks the frame from returning',
      'They defend late but lose the near elbow line',
      'Paper-cutter / mount continuation'
    ],
    curriculumSearch: 'paper cutter choke',
    treeSearch: 'paper cutter choke',
    relatedTerms: ['paper cutter choke', 'mount', 'north-south choke', 'kimura', 'top half guard', 'crossface']
  },
  {
    title: 'Mount back-take setups',
    lane: 'Submission',
    summary: 'Use smother pressure to force defensive hands high and expose the gift-wrap lane.',
    description:
      'This family is for top mount attacks where the setup is about smother pressure, wrist captures, and shoulder turns that make the gift wrap, back take, or armbar lane appear before the elbows reconnect.',
    setupNodes: ['Smother Pressure', 'Wrist Capture', 'Shoulder Turn', 'Head Follow'],
    nextAttacks: ['Gift Wrap', 'Technical Mount To Back', 'Straight Armbar From Mount', 'Mounted Triangle'],
    previewSequence: ['Smother pressure', 'Hands come high to frame', 'Gift wrap', 'Back take if they turn late but leave the shoulder line open'],
    exampleSequence: [
      'Smother pressure',
      'Wrist capture keeps the hand from dropping back inside',
      'Shoulder turn opens the gift-wrap lane',
      'They turn late but leave the shoulder line exposed',
      'Gift-wrap / back-take continuation'
    ],
    curriculumSearch: 'gift wrap',
    treeSearch: 'gift wrap',
    relatedTerms: ['gift wrap', 'technical mount to back', 'straight armbar from mount', 'mounted triangle', 'mount', 'smother']
  },
  {
    title: 'Front-headlock submission setups',
    lane: 'Submission',
    summary: 'Use the snap and shoulder cover to expose the D’Arce lane before posture rebuilds.',
    description:
      'This family is for front-headlock attacks where the setup is about snap pressure, shoulder coverage, and angle changes that make the D’Arce, anaconda, or go-behind lane appear before the defender squares up or clears the head.',
    setupNodes: ['Snap Pressure', 'Shoulder Cover', 'Angle Step', 'Elbow Thread'],
    nextAttacks: ['DArce Choke', 'Anaconda Choke', 'Front Headlock Standing', 'Go-Behind Position'],
    previewSequence: ['Snap pressure', 'Shoulder cover traps the near arm', 'DArce choke', 'Go-behind if they square late but keep the head low'],
    exampleSequence: [
      'Snap pressure',
      'Shoulder cover keeps the near arm pinned across the line',
      'Angle step exposes the elbow thread',
      'They square late with the head still trapped low',
      'DArce / go-behind continuation'
    ],
    curriculumSearch: 'darce choke',
    treeSearch: 'darce choke',
    relatedTerms: ['darce choke', 'anaconda choke', 'front headlock standing', 'go-behind position', 'front headlock', 'snap down']
  },
  {
    title: 'Single-Leg-X submission setups',
    lane: 'Guard',
    summary: 'Use the off-balance first, then attack the ankle while the stance is still adjusting.',
    description:
      'This family is for Single-Leg X attacks where the setup is about off-balancing, foot exposure, and hip angle that make the straight ankle lock, Caio Terra lock, or sweep lane appear before the top player resets their base.',
    setupNodes: ['SLX Off-Balance', 'Foot Exposure', 'Hip Angle', 'Top-Leg Clamp'],
    nextAttacks: ['Straight Ankle Lock', 'Caio Terra Lock', 'Basic Single-Leg X Sweep', 'Single-Leg X Stand-Up Sweep'],
    previewSequence: ['SLX off-balance', 'Foot stays exposed on the recovery', 'Straight ankle lock', 'Sweep if they pull the foot free but give up their base'],
    exampleSequence: [
      'SLX off-balance',
      'Foot exposure stays available while they try to reposture',
      'Hip angle lines up the ankle-lock finish',
      'They pull the foot late but give up the base',
      'Ankle-lock / sweep continuation'
    ],
    curriculumSearch: 'straight ankle lock',
    treeSearch: 'straight ankle lock',
    relatedTerms: ['straight ankle lock', 'caio terra lock', 'basic single-leg x sweep', 'single-leg x stand-up sweep', 'single-leg x', 'foot exposure']
  }
];

const curatedSetupFamilyTitles = [
  'Standing hand-fight setups',
  'Single-leg setup chains',
  'Standing front-headlock setups',
  'Body-lock takedown setups',
  'Closed-guard sweep setups',
  'Closed-guard submission setups',
  'Closed-guard passing setups',
  'Butterfly sweep setups',
  'Butterfly-guard submission setups',
  'Spider / lasso sweep setups',
  'Spider-guard submission setups',
  'De La Riva sweep setups',
  'De La Riva footlock setups',
  'Reverse De La Riva back-take setups',
  'Dogfight setups',
  'K-guard attack setups',
  'Single-leg X sweep setups',
  'Single-Leg-X submission setups',
  'Seated single-leg setups',
  'Seated front-headlock setups',
  'Half-guard passing setups',
  'Top-half submission setups',
  'Side-control passing transitions',
  'Side-control submission setups',
  'Mount back-take setups',
  'Back-control attack setups',
  'Front-headlock submission setups',
  'Top turtle setups',
  'Leg-entanglement entry setups',
  '50/50 counter setups',
  'Mount escape setups',
  'Side-control escape setups',
  'Back escape setups',
  'Turtle escape setups',
  'Guard retention setups'
];

export const setupFamilies = curatedSetupFamilyTitles
  .map((title) => rawSetupFamilies.find((family) => family.title === title))
  .filter(Boolean);

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
