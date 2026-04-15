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
    id: 'takedowns-duck-under',
    category: 'Takedowns',
    subcategory: 'Wrestling-Based',
    name: 'Duck Under',
    skillLevel: 'Intermediate',
    tags: ['takedown', 'wrestling', 'angle'],
    description: 'A go-behind style standing attack that uses head position and arm control to create a clean angle to the back.',
    relatedPositions: ['Standing']
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
    id: 'escapes-upa-escape',
    category: 'Escapes',
    subcategory: 'Mount Escapes',
    name: 'Upa Escape',
    skillLevel: 'Beginner',
    tags: ['escape', 'mount', 'bridge'],
    description: 'A classic bridge-and-roll escape from mount when a strong trap is available.',
    relatedPositions: ['Mount']
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
    id: 'escapes-escape-from-body-triangle',
    category: 'Escapes',
    subcategory: 'Back Escapes',
    name: 'Escape From Body Triangle',
    skillLevel: 'Intermediate',
    tags: ['escape', 'back control', 'body triangle'],
    description: 'A back-escape pathway that addresses the leg configuration first so breathing, turning, and hand fighting improve.',
    relatedPositions: ['Back Control']
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
    name: 'Toreando Pass',
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
    id: 'guard-passing-stack-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Stack Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'pressure', 'stack'],
    description: 'A pass that compresses the lower body, folds the hips, and uses posture control to clear the guard.',
    relatedPositions: ['Closed Guard', 'Open Guard']
  },
  {
    id: 'guard-passing-over-under-pass',
    category: 'Guard Passing',
    subcategory: 'Specific Passes',
    name: 'Over-Under Pass',
    skillLevel: 'Intermediate',
    tags: ['passing', 'pressure', 'pinning'],
    description: 'A pressure-based pass that stapled one leg while lifting the other to collapse mobility and turn the hips.',
    relatedPositions: ['Open Guard', 'Half Guard Top']
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
    id: 'submission-defense-triangle-posture-escape',
    category: 'Submission Defense',
    subcategory: 'Triangle Defense',
    name: 'Triangle Posture Escape',
    skillLevel: 'Beginner',
    tags: ['submission defense', 'triangle', 'posture'],
    description: 'A defensive response focused on restoring posture, managing angle, and addressing the strongest control points first.',
    relatedPositions: ['Closed Guard']
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
    id: 'drills-guard-retention-rounds',
    category: 'Drills',
    subcategory: null,
    name: 'Guard Retention Rounds',
    skillLevel: 'Intermediate',
    tags: ['drill', 'guard retention', 'timing'],
    description: 'Focused rounds built around recovering frames, hooks, and angle before the pass fully settles.',
    relatedPositions: ['Open Guard', 'Half Guard']
  },
  {
    id: 'drills-constraint-led-games',
    category: 'Drills',
    subcategory: null,
    name: 'Constraint-Led Games',
    skillLevel: 'Advanced',
    tags: ['drill', 'ecological', 'decision making'],
    description: 'Game-like rounds built around constraints that guide better movement, timing, and problem solving.',
    relatedPositions: []
  },
  {
    id: 'drills-positional-sparring-systems',
    category: 'Drills',
    subcategory: null,
    name: 'Positional Sparring Systems',
    skillLevel: 'Intermediate',
    tags: ['drill', 'positional sparring', 'structure'],
    description: 'Structured rounds that isolate one exchange so students can build pattern recognition through repetition.',
    relatedPositions: []
  },
  {
    id: 'drills-hand-fight-specific-rounds',
    category: 'Drills',
    subcategory: null,
    name: 'Hand-Fight Specific Rounds',
    skillLevel: 'Intermediate',
    tags: ['drill', 'hand fighting', 'timing'],
    description: 'Short rounds that emphasize early grip wins, head position, and controlling the first connection.',
    relatedPositions: ['Standing', 'Front Headlock']
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
  }
];

export default curriculumIndexSeed;
