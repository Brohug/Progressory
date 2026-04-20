# Curriculum Index Build Roadmap - 2026-04-20

This note ties together the current Index planning docs so the next build/refinement phase has a clear order.

## Goal

Use the `Curriculum Index` as the app's curriculum source of truth:

- cleaner taxonomy
- stronger relationship maps
- better topic coverage
- better Library linking
- safer future `Decision Tree` work

## Existing Source Notes

Current planning notes:

- [curriculum-index-qa-notes-2026-04-16.md](C:/Users/kylec/Progressory/docs/curriculum-index-qa-notes-2026-04-16.md)
- [backtakes-index-planning-notes-2026-04-19.md](C:/Users/kylec/Progressory/docs/backtakes-index-planning-notes-2026-04-19.md)
- [escapes-index-planning-notes-2026-04-20.md](C:/Users/kylec/Progressory/docs/escapes-index-planning-notes-2026-04-20.md)
- [guard-passing-index-planning-notes-2026-04-20.md](C:/Users/kylec/Progressory/docs/guard-passing-index-planning-notes-2026-04-20.md)
- [guard-retention-index-planning-notes-2026-04-20.md](C:/Users/kylec/Progressory/docs/guard-retention-index-planning-notes-2026-04-20.md)
- [leg-locks-index-planning-notes-2026-04-20.md](C:/Users/kylec/Progressory/docs/leg-locks-index-planning-notes-2026-04-20.md)
- [positions-index-planning-notes-2026-04-20.md](C:/Users/kylec/Progressory/docs/positions-index-planning-notes-2026-04-20.md)
- [submissions-index-planning-notes-2026-04-20.md](C:/Users/kylec/Progressory/docs/submissions-index-planning-notes-2026-04-20.md)
- [sweeps-index-planning-notes-2026-04-20.md](C:/Users/kylec/Progressory/docs/sweeps-index-planning-notes-2026-04-20.md)
- [takedowns-index-planning-notes-2026-04-20.md](C:/Users/kylec/Progressory/docs/takedowns-index-planning-notes-2026-04-20.md)

## Recommended Build Order

### Phase 1: Taxonomy / Position Foundations

Start with:

1. `Positions`
2. `Takedowns`
3. `Submissions`

Why:

- these create many of the anchors other categories cross-reference
- they reduce duplicate naming drift later
- they give relationships a more stable backbone

### Phase 2: Major Offensive Branches

Then build:

1. `Sweeps`
2. `Guard Passing`
3. `Back Takes`

Why:

- these branch naturally from the Phase 1 anchors
- they also feed future `Decision Tree` pathways well

### Phase 3: Defensive / Recovery Branches

Then build:

1. `Escapes / Submission Defense`
2. `Guard Retention`
3. `Leg Locks` cleanup / entanglement refinement

Why:

- these depend heavily on existing position and submission families
- they benefit from having the offensive side already anchored

## Working Rules

Use these rules during the next refinement passes:

- do not bulk-add without checking whether the item is:
  - a true core node
  - a family
  - a variation
  - a setup
  - a position
  - a control platform
- avoid duplicate stuffing
- prefer relationship mapping over duplicate node creation when possible
- only revisit already-strong hubs when:
  - they are clearly missing something important
  - or QA shows they are wrong

## Good First Implementation Targets

If starting actual Index build work from these notes, the strongest first slice is probably:

1. `Positions`
2. `Submissions`
3. `Takedowns`

Then:

4. `Sweeps`
5. `Guard Passing`
6. `Back Takes`

This order should make the next relationship-map pass much easier.

## Reminder

The planning notes are intentionally richer than the current seed.

That does not mean every listed item must become a top-level node.

In many cases, a better model will be:

- top-level family
- sub-variation kept in notes or relationships
- position cross-reference instead of duplicate entry
