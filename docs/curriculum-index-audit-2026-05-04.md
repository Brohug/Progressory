# Curriculum Index Audit - 2026-05-04

Source audited: [C:\Users\kylec\Progressory\client\src\data\curriculumIndexSeed.js](C:\Users\kylec\Progressory\client\src\data\curriculumIndexSeed.js)

## Overview

- Total indexed items: `740`
- Total categories: `21`
- Broken relationship references found: `0`

## High-Level Findings

1. The graph is structurally valid.
   - Every reference in `relatedPositions`, `entriesIntoPosition`, `commonAttacks`, `commonTransitions`, `commonFollowUps`, `commonDefenses`, and `decisionTreeModel.commonReactions[].branches` resolves to a real indexed item.

2. The biggest remaining issue is not broken links, but missing or templated relationship maps.
   - Many action-oriented categories still have no populated `entries/common attacks/common transitions/common follow-ups/common defensive reactions` at all.

3. Same-name overlap still exists in `21` name clusters.
   - Search handling is better now, but the seed still contains multiple legitimate duplicate names across categories.

4. There are `39` items where two or more relationship sections are still identical.
   - Some of these may be acceptable.
   - Many still read as templated and are worth manual QA.

## Zero-Map Counts In Likely Action Categories

These are items with all five relationship-map sections empty:

- `Back Takes`: `1 / 30`
- `Escapes`: `41 / 53`
- `Guard Passing`: `58 / 62`
- `Guard Retention`: `37 / 37`
- `Grip Fighting`: `28 / 28`
- `Leg Locks`: `17 / 17`
- `Movements`: `12 / 12`
- `Pins and Control`: `4 / 11`
- `Self-Defense Basics`: `11 / 11`
- `Strategy and Game Planning`: `22 / 24`
- `Submission Defense`: `13 / 33`
- `Submissions`: `24 / 68`
- `Sweeps`: `73 / 77`
- `Takedowns`: `30 / 56`
- `Turtle and Scrambles`: `11 / 11`

## Remaining Same-Name Duplicate Clusters

- `Aoki Lock`: `Submissions > Leg Locks` and `Leg Locks`
- `Arm Drag To Back`: `Sweeps > Seated / Shin-To-Shin` and `Back Takes`
- `Attack Transitions`: `Concepts` and `Strategy and Game Planning`
- `Banana Split`: `Submissions > Leg Locks` and `Leg Locks`
- `Calf Slicer`: `Submissions > Leg Locks` and `Leg Locks`
- `Collar Tie`: `Positions > Standing` and `Grip Fighting > Standing And Hand Fighting`
- `Electric Chair`: `Submissions > Leg Locks` and `Leg Locks`
- `Force Predictable Reactions`: `Concepts` and `Strategy and Game Planning`
- `Granby Roll`: `Movements` and `Escapes > Turtle Escapes`
- `Guard Retention Rounds`: `Constraint-Led Games` and `Positional Sparring`
- `Hamstring Slicer`: `Submissions > Leg Locks` and `Leg Locks`
- `Hand-Fight Specific Rounds`: `Constraint-Led Games` and `Positional Sparring`
- `Inside Heel Hook`: `Submissions > Leg Locks` and `Leg Locks`
- `Inside Tie`: `Positions > Standing` and `Grip Fighting > Standing And Hand Fighting`
- `Kneebar`: `Submissions > Leg Locks` and `Leg Locks`
- `Outside Heel Hook`: `Submissions > Leg Locks` and `Leg Locks`
- `Pummeling`: `Drills` and `Grip Fighting > Standing And Hand Fighting`
- `Sit-Out`: `Movements` and `Escapes > Turtle Escapes`
- `Straight Ankle Lock`: `Submissions > Leg Locks` and `Leg Locks`
- `Texas Cloverleaf`: `Submissions > Leg Locks` and `Leg Locks`
- `Toe Hold`: `Submissions > Leg Locks` and `Leg Locks`

## Repeated Relationship Sections

These are items where two or more non-empty relationship sections are identical:

- `Positions / Shoulder Crunch`: `commonAttacks = commonFollowUps`
- `Positions / Cross Ashi`: `commonAttacks = commonFollowUps`
- `Positions / Backside 50/50`: `commonAttacks = commonFollowUps`
- `Positions / Collar Tie`: `commonAttacks = commonFollowUps`
- `Positions / Inside Tie`: `commonAttacks = commonFollowUps`
- `Positions / Body Triangle Back Control`: `commonAttacks = commonFollowUps`
- `Positions / Guillotine Position`: `commonAttacks = commonFollowUps`
- `Positions / Inside Sankaku`: `commonAttacks = commonFollowUps`
- `Takedowns / Running The Pipe`: `commonTransitions = commonFollowUps`
- `Takedowns / Tree-Top Finish`: `commonTransitions = commonFollowUps`
- `Escapes / Kimura Roll Escape`: `commonTransitions = commonFollowUps`
- `Escapes / Guillotine Shoulder-Pressure Escape`: `commonTransitions = commonFollowUps`
- `Guard Passing / Leg Drag`: `commonTransitions = commonFollowUps`
- `Pins and Control / Seatbelt`: `commonAttacks = commonFollowUps`
- `Pins and Control / Crab Ride`: `commonAttacks = commonFollowUps`
- `Back Takes / Seatbelt From Turtle To Hooks`: `commonAttacks = commonFollowUps`
- `Submissions / North-South Choke`: `entriesIntoPosition = commonTransitions`
- `Submissions / Tarikoplata`: `commonAttacks = commonFollowUps`
- `Submissions / Monoplata`: `commonAttacks = commonFollowUps`
- `Submissions / Arm Triangle`: `entriesIntoPosition = commonTransitions`
- `Submissions / Straight Ankle Lock`: `entriesIntoPosition = commonTransitions`
- `Submissions / Inside Heel Hook`: `entriesIntoPosition = commonTransitions`
- `Submissions / Outside Heel Hook`: `entriesIntoPosition = commonTransitions`
- `Submissions / Aoki Lock`: `entriesIntoPosition = commonTransitions`
- `Submissions / Paper Cutter Choke`: `entriesIntoPosition = commonTransitions`
- `Submissions / Can Opener`: `commonAttacks = commonFollowUps`
- `Submissions / Ninja Choke`: `commonAttacks = commonFollowUps`
- `Submissions / Mongolian Choke`: `commonAttacks = commonFollowUps`
- `Submissions / Side Triangle`: `commonAttacks = commonFollowUps`
- `Submissions / Rear Triangle`: `commonAttacks = commonFollowUps`
- `Submissions / One-Hand Collar Choke`: `commonAttacks = commonFollowUps`
- `Submissions / Okuri Eri Jime`: `commonAttacks = commonFollowUps`
- `Submissions / Canto Choke`: `commonAttacks = commonFollowUps`
- `Submissions / Helio Choke`: `entriesIntoPosition = commonTransitions` and `commonAttacks = commonFollowUps`
- `Submission Defense / Americana Elbow Recovery Defense`: `commonTransitions = commonFollowUps`
- `Submission Defense / Arm Triangle Escape`: `commonTransitions = commonFollowUps`
- `Submission Defense / North-South Choke Escape`: `commonTransitions = commonFollowUps`
- `Submission Defense / D'Arce Escape`: `commonTransitions = commonFollowUps`
- `Submission Defense / Anaconda Escape`: `commonTransitions = commonFollowUps`

## Likely Incomplete Items: Empty Relationship Maps

### Back Takes

- `Arm Drag To Back`

### Escapes

- `Elbow-Knee Escape`
- `Knee-Elbow To Half Guard`
- `Trap And Roll`
- `Kipping Escape`
- `Frame And Shrimp`
- `Leg Pummel Escape`
- `Recovery To Butterfly`
- `Running Escape`
- `Reguard With Knee Inside`
- `Elbow Frame Recovery`
- `Inversion Recovery`
- `North-South Escape To Turtle`
- `Shoulder Slide Escape`
- `Back To The Mat Escape`
- `Scoop Escape`
- `Escape To Top Half`
- `Stand-Up From Turtle`
- `Granby Roll`
- `Hip Switch`
- `Sit-Out`
- `Build Base And Hand Fight`
- `Recover Half Guard From Turtle`
- `Recover Seated Guard`
- `Rear Naked Choke Hand-Peel Escape`
- `Americana Elbow Recovery Escape`
- `Straight Ankle Lock Boot Escape`
- `Heel Hook Line Escape`
- `Kneebar Turn Escape`
- `Omoplata Forward Roll Escape`
- `Bow And Arrow Hand-Fight Escape`
- `Ezekiel Posture Escape`
- `Upa Escape`
- `Shoulder Walk Escape`
- `Turn-To-Knees Escape`
- `Knee Push Escape`
- `Two-On-One Hand Fight Escape`
- `Hip Walk Escape`
- `Hip Pummel Escape`
- `Calf Slicer Escape`
- `Twister Escape`
- `Backslide Escape`

### Guard Passing

- `Pressure Passing`
- `Speed Passing`
- `Outside Passing`
- `Inside Passing`
- `Smash Passing`
- `Body Lock Passing`
- `Leg Weave Passing`
- `Floating Passing`
- `Stack Pass Style`
- `Standing Passing`
- `Over-Under Pass`
- `Long Step`
- `Smash Pass`
- `Weave Pass`
- `Double Under Pass`
- `Folding Pass`
- `X-Pass`
- `Side Smash Pass`
- `Knee Staple Pass`
- `Backstep Pass`
- `Windshield Wiper Pass`
- `Shin Trap Pass`
- `Split Squat Pass`
- `Leg Pin Pass`
- `Float Pass`
- `Cartwheel Pass`
- `Hip Switch Pass`
- `North-South Pass`
- `Cross Knee Pass`
- `Throw-By Pass`
- `Tripod Pass`
- `Staple Pass Versus De La Riva`
- `Backstep Versus Half Butterfly`
- `Underhook Half Guard Pass`
- `Reverse Half Guard Pass`
- `Smash Knee Shield Pass`
- `Weave To Mount`
- `Mount Off Knee Cut`
- `Pass To Knee On Belly`
- `Pass From Turtle`
- `Bullfighter Pass`
- `Knee Slice Pass`
- `Stack Pass`
- `Headquarters Pass`
- `Staple Pass`
- `Leg Weave Pass`
- `Sao Paulo Pass`
- `Shin Pin Pass`
- `Hip Smash Pass`
- `Cross-Step Pass`
- `Near-Side Underhook Pass`
- `Half Guard Smash Pass`
- `Crossface Underhook Half Guard Pass`
- `Backstep Half Guard Pass`
- `Half Guard Windshield-Wiper Pass`
- `Ghost-Style Float Pass`
- `Float Headquarters Pass`
- `Side Smash Headquarters`

### Guard Retention

- `Hip Escape Retention`
- `Leg Pummeling`
- `Knee-Elbow Recovery`
- `Retaining Against Leg Drag`
- `Retaining Against Body Lock`
- `High Leg Recovery`
- `Frame Replacement`
- `Shin Insert Recovery`
- `Foot-To-Hip Recovery`
- `Butterfly Hook Recovery`
- `Half Guard Recovery`
- `Open Guard Recomposition`
- `Seated Guard Recovery`
- `Supine Square-Up Recovery`
- `Double Shin Recovery`
- `Shin-To-Shin Recovery`
- `Lasso Recovery`
- `Spider Guard Recovery`
- `Collar Sleeve Recovery`
- `K-Guard Entry For Retention`
- `Invert-To-Reguard`
- `Anti-Leg-Drag Square-Up`
- `Shoulder Walk Recovery`
- `Hand Pummel Recovery`
- `High Pummel Recovery`
- `Low Pummel Recovery`
- `Shoulder Post And Square-Up`
- `Two-Feet-On-Hips Recovery`
- `Pummel-To-Seated Guard`
- `Frame-To-Turtle-To-Reguard`
- `Turtle-To-Seated Recovery`
- `Running-Man Style Recovery To Guard`
- `Hip Swivel Recovery`
- `Shoulder Invert Recovery`
- `Split-Leg Retention Recovery`
- `Recovery To Seated Guard`
- `Recovery To Supine Guard`

### Grip Fighting

- `Collar Grip`
- `Sleeve Grip`
- `Pistol Grip`
- `Pocket Grip`
- `C-Grip`
- `Wrist Control`
- `Russian Tie`
- `Cross Sleeve Grip`
- `Same-Side Sleeve Grip`
- `Pant Grip`
- `Belt Grip`
- `Lapel Grip`
- `Cross Collar Grip`
- `No-Gi Wrist Ride`
- `Elbow Control`
- `Bicep Tie`
- `Inside Tie`
- `Collar Tie`
- `Snap Down`
- `Peel Grip`
- `Strip Grip`
- `Re-Grip`
- `Grip Breaking From Standing`
- `Grip Breaking From Guard`
- `Posting Hand Removal`
- `Two-On-One`
- `Hand Fighting`
- `Pummeling`

### Leg Locks

- `Straight Ankle Lock`
- `Belly-Down Ankle Lock`
- `Inside Heel Hook`
- `Outside Heel Hook`
- `Lachy Lock`
- `Mikey Lock`
- `Junny Lock`
- `Abe Lock`
- `Aoki Lock`
- `Toe Hold`
- `Kneebar`
- `Estima Lock`
- `Calf Slicer`
- `Hamstring Slicer`
- `Texas Cloverleaf`
- `Banana Split`
- `Electric Chair`

### Movements

- `Shrimp`
- `Technical Stand-Up`
- `Bridge`
- `Hip Heist`
- `Granby Roll`
- `Sprawl`
- `Inversion`
- `Shot Recovery`
- `Bear Crawl`
- `Shoulder Roll`
- `Reverse Shrimp`
- `Sit-Out`

### Pins and Control

- `Crossface and Underhook Control`
- `Chin Strap`
- `Spiral Ride`
- `Shoulder Of Justice`

### Self-Defense Basics

- `Clinch Safely`
- `Getting Up From The Ground Safely`
- `Basic Takedown To Top`
- `Mount Survival`
- `Side Control Survival`
- `Headlock Escape`
- `Standing Guillotine Awareness`
- `Punch Protection Posture`
- `Closed Guard Posture Control`
- `Wall Standing`
- `Escaping Pins Under Strikes`

### Strategy and Game Planning

- `Duck Under`
- `Arm Drag To Back Take`
- `Go-Behind`
- `Peek Out`
- `Basic Guard Pull`
- `Seated Guard Pull`
- `Shin-To-Shin Pull`
- `De La Riva Entry`
- `Threat Stacking`
- `Dilemma-Based Attacking`
- `Pass In Stages`
- `Force Predictable Reactions`
- `Attack Transitions`
- `Do Not Accept Flatness On Bottom`
- `Do Not Accept Looseness On Top`
- `Escape In Stages`
- `Re-Guard Before Standing`
- `Stand Safely`
- `Reset Posture Before Attacking Again`
- `Ecological Training Games`
- `Ruotolo-Style Movement Passing`
- `Chest-To-Chest Passing Systems`

### Submission Defense

- `Heel Hook Escape Family`
- `Triangle Posture Defense`
- `Triangle Escape With Hand Fighting/Angles`
- `Kimura Roll Defense`
- `Guillotine Hand Fight And Shoulder Pressure Defense`
- `Straight Ankle Lock Boot Defense`
- `Heel Hook Line Defense`
- `Kneebar Turn Defense`
- `Omoplata Forward Roll Defense`
- `Ezekiel Posture Defense`
- `Loop Choke Escape`
- `Toe Hold Escape`
- `Aoki Lock Escape`

### Submissions

- `Cross Collar Choke`
- `Sliding Collar Choke`
- `Loop Choke`
- `Baseball Bat Choke`
- `Ezekiel Choke`
- `High Elbow Guillotine`
- `Arm-In Guillotine`
- `Marcelotine`
- `D'Arce Choke`
- `Peruvian Necktie`
- `Straight Armbar From Side Control`
- `Belly-Down Armbar`
- `Teepee Choke`
- `Americana`
- `Straight Armlock`
- `Wrist Lock`
- `Mounted Triangle`
- `Reverse Triangle`
- `Gogoplata`
- `Von Flue Choke`
- `No-Gi Ezekiel`
- `Punch Choke`
- `Toe Hold`
- `Kneebar`

### Sweeps

- `Scissor Sweep`
- `Flower Sweep`
- `Lumberjack Sweep`
- `Overhook Sweep`
- `Clamp Guard Sweep`
- `Double Ankle Sweep`
- `Waiter Sweep`
- `Tripod Sweep`
- `Basic Butterfly Sweep`
- `Arm Drag Butterfly Sweep`
- `Elevator Sweep`
- `Shoulder Crunch Butterfly Sweep`
- `Reverse Butterfly Sweep`
- `Butterfly To X-Guard Sweep`
- `Old School Sweep`
- `Plan B Sweep`
- `Knee Lever Sweep`
- `Single-Leg X Stand-Up Sweep`
- `X-Guard Overhead Sweep`
- `X-Guard Back Take`
- `Single-Leg X Outside Reap Sweep`
- `X-Guard To Leg Drag Sweep`
- `X-Guard To Ankle Pick`
- `Sickle Sweep`
- `John Wayne Sweep`
- `Deep Half Waiter Sweep`
- `Homer Simpson Sweep`
- `Backdoor Sweep`
- `Technical Stand-Up Sweep`
- `Collar Drag Sweep`
- `Balloon Sweep`
- `Overhead Sweep`
- `Ankle Push Sweep`
- `Shin-To-Shin Wrestle-Up`
- `Single-Leg From Seated Guard`
- `Arm Drag To Back`
- `Sumi Gaeshi From Seated`
- `Shin-To-Shin To Single-Leg X Sweep`
- `Basic De La Riva Off-Balance Sweep`
- `Berimbolo Back Take`
- `De La Riva Tripod Variation`
- `Baby Bolo`
- `Kiss Of The Dragon`
- `Reverse De La Riva Waiter Sweep`
- `Reverse De La Riva Spin Under Sweep`
- `De La Riva To Single-Leg X Sweep`
- `Pendulum Sweep`
- `Tomoe Nage Sweep`
- `Sumi Gaeshi Sweep`
- `Hook Sweep`
- `Basic Deep Half Sweep`
- `Basic Reverse De La Riva Sweep`
- `Basic X-Guard Sweep`
- `Basic Single-Leg X Sweep`
- `Basic 50/50 Sweep`
- `Basic Spider Guard Sweep`
- `Basic Lasso Sweep`
- `Basic Collar Sleeve Sweep`
- `Knee Shield Hook Sweep`
- `Wrestle-Up Single Leg Sweep`
- `Granby Sweep`
- `Bridge-And-Roll Reversal`
- `DLR Ankle Dump`
- `DLR Waiter Sweep`
- `RDLR Wrestle-Up Sweep`
- `Balloon Sweep From Spider`
- `Spider Lasso Sweep`
- `Lasso Tilt Sweep`
- `Lasso Overhead Sweep`
- `Wrestle-Up Double Leg Sweep`
- `Seated Ankle Pick Sweep`
- `Collar Drag To Sweep`
- `Arm Drag To Rear Sweep`

### Takedowns

- `Double Leg`
- `Single Leg`
- `High Crotch`
- `Sweep Single`
- `Ankle Pick`
- `Knee Tap`
- `O Soto Gari`
- `O Uchi Gari`
- `Uchi Mata`
- `Harai Goshi`
- `Tai Otoshi`
- `Seoi Nage`
- `Sasae Tsurikomi Ashi`
- `De Ashi Barai`
- `Snap Down To Front Headlock`
- `Body Lock Takedown`
- `Blast Double`
- `Snatch Single`
- `Low Single`
- `Mat Return`
- `Outside Trip`
- `Inside Trip`
- `Ko Uchi Gari`
- `Kosoto Gake`
- `Tomoe Nage`
- `Sumi Gaeshi`
- `Yoko Tomoe Nage`
- `Tani Otoshi`
- `Uki Waza`
- `Hiza Guruma`

### Turtle and Scrambles

- `Building Base`
- `Wrestling Up`
- `Quadpod`
- `Hand Fighting From Turtle`
- `Rolling Through`
- `Turtle Retention`
- `Back Exposure Awareness`
- `Turtle To Single Leg`
- `Turtle To Leg Entanglement`
- `Scramble Recognition`
- `Re-Guarding During Scrambles`

## Suggested Priority Order

1. Fill zero-map items in these categories first:
   - `Guard Passing`
   - `Sweeps`
   - `Escapes`
   - `Takedowns`
   - `Submission Defense`

2. Then clean repeated-section items that still feel templated:
   - especially `Submissions`, `Submission Defense`, `Pins and Control`, `Leg Drag`, `Seatbelt`, `Crab Ride`

3. Leave current duplicate-name handling in place for release, but keep the `21` duplicate name clusters on the cleanup backlog.
