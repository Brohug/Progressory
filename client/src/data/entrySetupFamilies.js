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
    title: 'Ankle-pick entry setups',
    lane: 'Standing',
    summary: 'Use level changes and post reactions to expose the ankle cleanly.',
    description:
      'This family is for head touches, collar ties, wrist pulls, and inside-tie reactions that make the opponent step or lighten the lead leg before the ankle pick actually opens.',
    setupNodes: ['Head Touch + Level Change', 'Collar Tie Snap', 'Wrist Post Pull', 'Inside Tie To Outside Angle'],
    nextAttacks: ['Ankle Pick', 'Single Leg', 'Front Headlock Standing', 'Body Lock Standing'],
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
    title: 'Butterfly-sweep setups',
    lane: 'Guard',
    summary: 'Use upper-body wins and posts to make the butterfly sweep feel inevitable.',
    description:
      'This family is for double underhooks, overhook clamp reactions, shoulder-crunch control, and arm-drag sit-ups that create the butterfly sweep, wrestle-up, or back-take lane.',
    setupNodes: ['Double Underhooks', 'Overhook Clamp', 'Shoulder Crunch', 'Arm Drag Sit-Up'],
    nextAttacks: ['Butterfly Sweep', 'Wrestle-Up Single Leg Sweep', 'Shoulder Crunch Butterfly Sweep', 'Back Control'],
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
    title: 'Knee-shield wrestle-up setups',
    lane: 'Guard',
    summary: 'Use the knee shield to win the hand fight before you come up.',
    description:
      'This family is for knee-shield frames, wrist control, and underhook timing that make the top player post or drift high enough for the wrestle-up, dogfight, or sit-up sweep lane.',
    setupNodes: ['Knee Shield Frame', 'Wrist Control', 'Inside Elbow Lift', 'Underhook Sit-Up'],
    nextAttacks: ['Dogfight Sweep', 'Wrestle-Up Single Leg Sweep', 'Single-Leg From Seated Guard', 'Technical Stand-Up Sweep'],
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
    title: 'Dogfight sweep setups',
    lane: 'Guard',
    summary: 'Win the underhook battle and hip height before you ask the dogfight to solve itself.',
    description:
      'This family is for underhook half-guard entries, coyote-style angles, shoulder height wins, and stand-up reactions that make the dogfight sweep, wrestle-up, or back-take lane open without stalling underneath.',
    setupNodes: ['Underhook Half Guard', 'Coyote Angle', 'Shoulder Height Win', 'Stand-Up Reaction'],
    nextAttacks: ['Dogfight Sweep', 'Wrestle-Up To Back', 'Wrestle-Up Single Leg Sweep', 'Single Leg'],
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
    title: 'Leg-drag passing setups',
    lane: 'Passing',
    summary: 'Pull the legs off center first, then run the drag before the guard resets.',
    description:
      'This family is for ankle-control pulls, shin redirects, body-lock-to-leg-drag reactions, and leg pummels that move the knees off line before the drag, backstep, or side-control finish appears.',
    setupNodes: ['Ankle-Control Pull', 'Shin Redirect', 'Leg Pummel', 'Body Lock To Leg Drag'],
    nextAttacks: ['Leg Drag', 'Backstep Pass', 'Pass To Knee On Belly', 'Side Control'],
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
  },
  {
    title: 'Triangle-entry setups',
    lane: 'Submission',
    summary: 'Win the wrist, angle, or posture break first, then lock the triangle cleanly.',
    description:
      'This family is for collar-tie and wrist-control lanes, shoulder-crunch control, overhook clamps, and angle-building leg pummels that make the triangle, omoplata, or armbar chain open cleanly.',
    setupNodes: ['Collar Tie + Wrist Control', 'Shoulder Crunch', 'Overhook Clamp', 'Leg Pummel To Angle'],
    nextAttacks: ['Triangle Choke', 'Omoplata', 'Straight Armbar From Guard', 'Mounted Triangle'],
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
    title: 'Clamp-guard attack setups',
    lane: 'Submission',
    summary: 'Use clamp-style shoulder and posture control to open triangles, sweeps, and kimura lanes.',
    description:
      'This family is for clamp guard pressure, breaking posture, shoulder crunch-style control, and angle shifts that expose the triangle, clamp-guard sweep, kimura, or back-take chain without rushing the finish.',
    setupNodes: ['Clamp Pressure', 'Posture Break', 'Shoulder Crunch Tie-Up', 'Angle Shift'],
    nextAttacks: ['Clamp Guard Sweep', 'Triangle Choke', 'Kimura', 'Back Control'],
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
