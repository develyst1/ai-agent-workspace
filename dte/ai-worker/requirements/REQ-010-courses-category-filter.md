# REQ-010: `/courses` — make the category filter actually filter the course list
- Status: DRAFT — BLOCKED (waiting: owner — §Questions Q1–Q3)
- Priority: HIGH — Porter's call (it is reason 1 of the `/courses` FAIL that gates SPEC-006 Phase 3); one word from him overturns
- Requested: 2026-09-13 by the owner (reported as a defect — "ตรง filter category ยังใช้งานไม่ได้", `SYSTEM-FACTS.md` A48)
- Deadline: none stated

## Problem / Goal

On 2026-09-13 the owner failed the redesigned `/courses` page for two reasons; the first is
**"ตรง filter category ยังใช้งานไม่ได้"** — *the category filter still does not work*
(`SYSTEM-FACTS.md` **A48**). Sober's diagnosis the same day (`requirements/REQ-001-…md` §Questions
**Q10**, a code read on `develop`): the filter has **never worked** — the 14 category pills on
`/courses` are buttons with no behaviour, the active pill is hard-coded to `ทั้งหมด`, the grid always
shows every course, and the home page's four category cards link to `/courses?category=…` with values
that nothing reads and that match no category name. It is **pre-existing** (recorded in TASK-006
§Findings 2 before he looked), **not a defect of the visual pass**, and wiring it is **new
user-facing behaviour** that REQ-001 (foundation) and SPEC-006 (a visual pass) never asked for —
so it is homed here as its own requirement, exactly as Sober asked.

For the owner the outcome is simple: **click a category on `/courses` and see only that category's
courses.** Until this works, `/courses` cannot pass his eyes and Phase 3 of the visual pass stays gated.

## Requirement

1. On `/courses`, choosing a category **must narrow the visible course list to that category**, and
   choosing `ทั้งหมด` must show every course again. _(Porter's reading of "filter ใช้งานไม่ได้"; confirm — Q1.)_
2. The chosen category must be visibly marked as the active one (today `ทั้งหมด` is always marked).
3. The four category cards on the home page that already link to `/courses?category=…` must land the
   visitor on `/courses` **already narrowed** to that category — or must stop pretending to
   (they carry values that name no category today). _(Owner's call — Q2.)_
4. The grid heading `ทักษะทั้งหมด (N ทักษะ)` when a category is selected: whether the heading and
   the count change with the selection is copy, the owner's call — Q3.

## Acceptance Criteria

- [ ] AC 1 — Clicking each category pill on `/courses` shows only courses of that category; clicking
      `ทั้งหมด` restores the full list. Engineer evidence: the command/harness and its output, per pill.
- [ ] AC 2 — Exactly one pill reads as active at any time and it is the one last chosen.
- [ ] AC 3 — The home page's category cards behave as the owner decides in Q2 (pre-filtered landing,
      or the links changed so nothing dead is offered).
- [ ] AC 4 — Nothing else on `/courses` changes because of this REQ (the look is SPEC-006's).
- [ ] AC 5 — **The owner's own eyes**: he clicks a category on `/courses` and it works for him. This is
      the AC that re-opens the SPEC-006 Phase 2 verdict (A48 reason 1); reason 2 ("ไม่สวยพอ") is a
      separate open item and is not closed by this REQ.

## Constraints

- Frontend `front/` is the known site of the defect; whether any `back/` change is needed is
  **Sober's to establish** — Porter names no mechanism, no component, no engineer.
- The course data on `/courses` today is the frontend's mock data (Sober's Q10 finding: the grid maps
  `mockSkills`); what the filter filters when real courses exist is outside this REQ unless the
  owner says otherwise.
- Standing rules unchanged: no agent commits, deploys, or touches production (A23, PROTOCOL.md
  §Environments). `DELIVERED` ≠ deployed.

## Out of Scope

- A48 **reason 2** ("ไม่สวยพอ") — waits on the owner's specifics, carried on REQ-001 §Owner's-eyes gates.
- The non-existent `/courses/[id]` page every card links to (board Blocked row, its own decision).
- Any change to the category **list** itself (the 14 names) or to the course data.

## Questions

**For the owner (asked in Thai 2026-09-13 by Porter; the REQ moves to `READY_FOR_SA` when all three are answered):**

- **Q1 — what a category pill does.** Porter's reading: clicking a pill narrows the course grid on the
  same page to that category; `ทั้งหมด` shows all. Is that what "ใช้งานไม่ได้" means — or did he expect
  something else (e.g. a separate page per category)?
- **Q2 — the home page's four category cards** (`เว็บ / AI / ดีไซน์ / ธุรกิจ`, linking to
  `/courses?category=…`): should they land on `/courses` already filtered to that category? Their
  four values match none of the 14 category names on `/courses` today, so **which of the 14 each card
  maps to** is also his to say (or: the cards stop linking to a filter).
- **Q3 — the grid heading `ทักษะทั้งหมด (N ทักษะ)`** when a category is selected: stays as is, or
  changes to the category name and its count? (Copy — the owner's word, never invented.)

- **Priority note (Porter's call, not the owner's word).** `HIGH` because A48 reason 1 is what he
  named first and Phase 3 of the visual pass is gated on `/courses` passing. One word from him overturns.

(SA Lead adds questions here as new bullets; Porter answers as `> answer: ...`)
