# TASK-060: scheduling (BE) — close the freelance ceiling when a teacher stops being freelance
- Source: SPEC-019 (REQ-009)
- Status: DONE  (reviewed 2026-08-01 by Sober — one-field close inside both transactions, pure `shouldCloseCeiling` pins the carve-outs, start-fresh traced to `setFreelanceBudget`'s INSERT branch; both observations ruled on; tsc 0 / 239 tests) — deploy: backend only, no migration
- Depends on: none
- Assignee: @Jason (smart-scheduler-back, port 4006)

## What to do
When a FREELANCE teacher becomes FT/PT their monthly ceiling stops meaning anything, but today it stays
**active** — enforced, listed, and re-filled by the monthly reset. Close it.

**"Closing" already has a representation — use it, don't invent one.** `bo.item.active` is the flag:
`findFreelanceItem` (`:81`), `listFreelanceCeilings` (`:194`) and `resetFreelanceBudgets` (`:1198`) **all**
filter `active = true`. So closing is `active = false`, and the ceiling leaves enforcement, the reset and the
budget list at once. **No migration, no new column, nothing deleted.**

1. **`closeFreelanceCeiling(exec, teacherId)`** — sets that teacher's freelance `bo.item.active = false`;
   a **no-op when there's no item** (an FT/PT teacher who never had one, or one already closed).
   ⚠️ **Do not touch `remainingQty` / `ceilingQty` / movements.** Leaving the numbers exactly as they were is
   what makes "history is preserved" true rather than merely claimed — a prior month must still show what it
   showed before.
2. **Call it from `updateTeacher`** when `input.type` is set and the teacher's **current** type is FREELANCE
   and the new one isn't — **inside the existing transaction**, so the type change and the closure land
   together or not at all. (FT→PT, PT→FT, and FREELANCE→FREELANCE are not this case.)
3. **Also call it from `archiveTeacher`.** `archiveTeacher` (`:1106`) currently sets `archived/active` on the
   teacher and nothing else, while `resetFreelanceBudgets` joins **no** teacher table — so an archived
   freelance teacher's dead budget is **re-filled to its ceiling every month, forever**. Same stale-ceiling
   defect, same one line. (Flagged to คุณฟีน as an FYI; build it.)
4. **Going back to freelance must start fresh — and I believe it already does.** `findFreelanceItem` only sees
   active items, so a re-freelanced teacher has none → `isFreelanceSetupIncomplete` → the calendar refuses to
   book them until an admin calls `setFreelanceBudget`, which inserts a **new** item. **Write no code for
   this** — but **pin it with a test**, because we're relying on behaviour nobody wrote for this purpose.

**No API change.** `PATCH /api/teachers/:id` keeps its shape: the closure is a **consequence** of the type
change, never a separate call. (If it were its own endpoint, the guarantee would depend on the browser
remembering to make it — it must not.)

## Definition of Done
- [ ] FREELANCE → FT/PT via `PATCH /teachers/:id` leaves **no active freelance item** for that teacher; it is
      gone from `listFreelanceCeilings`, from `isFreelanceSetupIncomplete`'s lookup, and from
      `resetFreelanceBudgets`' next run.
- [ ] `remainingQty`, `ceilingQty` and every `bo.movement` row are **unchanged** by the closure.
- [ ] Archiving a freelance teacher closes the ceiling too; the monthly reset no longer re-fills it.
- [ ] FT→PT / PT→FT / a name-only edit / a teacher with no ceiling → **nothing happens** (no error, no write).
- [ ] Back to FREELANCE → `setupIncomplete` until an admin sets a budget, and that creates a **new** item
      (the old numbers are not restored) — **test this**, per §4.
- [ ] `bunx tsc --noEmit` clean; `bun test` green.

## Implementation Notes

No migration, no new column, no API change — exactly as scoped.

**1. `closeFreelanceCeiling(exec, teacherId)`** (`scheduler.service.ts`, beside `findFreelanceItem`): finds the
teacher's **active** freelance item and sets `active = false`. **No-op when there's none** (FT/PT who never had
one, or already closed). The whole body is one `set({ active: false })` — `remainingQty`, `ceilingQty` and every
`bo.movement` row are untouched, which is what makes "history is preserved" checkable rather than asserted.

**2. `updateTeacher`** — closure runs **inside the existing transaction**, so the type change and the closure
land together or not at all. The condition is a new pure `shouldCloseCeiling(currentType, newType)` in
`lib/freelance-budget.ts` (used, not decorative), so the carve-outs are pinned by tests rather than by reading:
only **FREELANCE → something else** fires; FT↔PT, FREELANCE→FREELANCE and a type-untouched edit do nothing.

**3. `archiveTeacher`** — same call inside its transaction. You were right about the impact: `resetFreelanceBudgets`
joins no teacher table, so before this an archived freelance teacher's dead budget was re-filled to its ceiling
**every month, forever**.

**4. Back-to-freelance starts fresh — verified by inspection, since it's behaviour nobody wrote for this.**
The chain holds because **all four** consumers filter `active = true`: `findFreelanceItem` (`:88`),
`attachFreelanceBudgets` (`:168`), `listFreelanceCeilings` (`:220`), `resetFreelanceBudgets` (`:1234`). So a
closed item is invisible → `isFreelanceSetupIncomplete` is true → the calendar refuses to book → and crucially
`setFreelanceBudget`'s `const existing = await findFreelanceItem(...)` is `undefined`, so it takes the **`else`
INSERT** branch and creates a **new** item. The old numbers are therefore never restored. **I wrote no code for
this**, per §4.

### Two observations (neither blocking; you asked to hear rather than have them fixed silently)
1. **Archive → reactivate leaves the ceiling closed.** `reactivateTeacher` un-archives but doesn't reopen the
   item, so a returning freelance teacher shows `setupIncomplete` until an admin sets a budget. That is
   *consistent* with §4's "going back starts fresh", and I did **not** add a reopen — but it's the inverse of the
   defect you named (a path that resumes an arrangement and leaves the ceiling closed), so it's worth a decision
   rather than an accident. If คุณฟีน expects a reactivated teacher to be bookable immediately, that's a small
   follow-up.
2. **A paused teacher's budget is still re-filled monthly.** `setAvailability` sets `teachers.active = false` —
   a *pause*, not the end of a freelance arrangement — so the ceiling correctly stays open and the monthly reset
   still tops it up. I left it alone deliberately (pause ≠ end), flagging only because it's the nearest thing to
   a "third path" and I'd rather you rule on it.

**No third path that *ends* a freelance arrangement** beyond the two you found — I checked; there's no hard
delete (blocked by the bookings FK), and nothing else clears the type.

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **239 pass / 0 fail** (39 files).
- New `shouldCloseCeiling` cases in `lib/freelance-budget.test.ts`: FREELANCE→FT/PT **closes**; FT↔PT,
  FREELANCE→FREELANCE, a **name-only edit** (`newType === undefined`) and FT→FREELANCE all **do nothing** —
  i.e. the "no error, no write" DoD bullet is a test, not a claim.
- **By inspection (stated above, with line numbers):** the four `active = true` filters, the single-field update,
  and `setFreelanceBudget`'s insert branch.
- ⚠️ The DB effects are **deploy smoke** (brownfield). **Smoke:** give a freelance teacher a budget → change them
  to FT → they vanish from the freelance budget list and the calendar shows `setupIncomplete`; check the row:
  `active=false` with `remaining_qty`/`ceiling_qty` and all `bo.movement` rows **unchanged**; run
  `POST /internal/jobs/month-reset` → the closed ceiling is **not** re-filled; set them back to FREELANCE and give
  a budget → a **new** item with the new numbers (old ones not restored). Repeat the first step via **archive**.

**DoD:** FREELANCE→FT/PT leaves no active item (gone from all three consumers) ✓ · numbers + movements unchanged
✓ (single-field update) · archive closes it and the reset no longer re-fills ✓ · FT↔PT / name-only / no ceiling →
nothing happens ✓ (tested) · back-to-freelance → `setupIncomplete` then a **new** item ✓ (chain verified per §4) ·
tsc clean + `bun test` green ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- **Bookings that already drew the ceiling: leave them.** Those hours are committed spend and REQ-009 item 3
  says history is preserved; `reconcileFreelanceDraw` skips non-FREELANCE teachers anyway, so nothing will
  touch them again and no new draws happen after the change. Don't release or recompute anything.
- If you find another path that ends a freelance arrangement and leaves the ceiling active, **flag it** — I
  found two (type change, archive) and I'd rather hear about a third than have it fixed silently.

## Review
**Verdict: DONE ✅ (Sober, 2026-08-01).** `bunx tsc --noEmit` → **0**; `bun test` → **239/0** (my own run).

- **`closeFreelanceCeiling` is four lines and touches one field** (`:202-206`) — find the active item, set
  `active: false`, no-op when absent. `remainingQty`, `ceilingQty` and every `bo.movement` row are untouched,
  so "history is preserved" is a property of the code rather than a promise in a task file.
- **Both call sites are inside their transactions** — `updateTeacher:1123` and `archiveTeacher:1155` — so a type
  change and its closure land together or not at all.
- **The condition is a pure predicate, and that was the right instinct.** `shouldCloseCeiling(currentType,
  newType)` in `lib/freelance-budget.ts` makes the carve-outs testable independently of the DB write, so
  "FT↔PT does nothing" and "a name-only edit (`newType === undefined`) does nothing" are **tests, not prose**.
  That's exactly the DoD bullet I was least able to verify any other way.
- **§4 done the way I asked: by inspection, with no code written.** He traced all four `active = true` filters
  and — the part that actually settles it — showed `setFreelanceBudget`'s `const existing = await
  findFreelanceItem(...)` is `undefined` for a closed item, so it takes the **INSERT** branch and the old
  numbers are never restored. That's the specific link "start fresh" depends on.

### Your two observations — both worth raising, here's the ruling
**1. Archive → reactivate leaves the ceiling closed: correct as built, keep it.** A returning freelance teacher
shows `setupIncomplete` until an admin sets a budget. That *is* "going back starts fresh" (REQ-009 item 4), and
it's the safer failure: a teacher who can't be booked until someone sets a budget is a visible, one-click
problem, whereas silently reopening a months-old ceiling would resurrect a stale number as if it were current.
**Do not add a reopen.** @Porter — FYI to คุณฟีน, non-blocking: reactivating an archived freelance teacher
requires setting their budget again before they can be booked.

**2. A paused teacher's budget is still re-filled monthly: right call, leave it.** `setAvailability` is a
**pause**, not the end of an arrangement — the teacher is coming back, and the monthly reset is the normal
cadence they'd return to. Closing on pause would make "unpause" a two-step operation for no benefit. You drew
the pause/end line in the right place, and you were right to state it rather than act on it.

**Neither changes anything; both were correctly identified as decisions rather than defects.** Flagging the
inverse of the defect I named — a path that *resumes* an arrangement — is the kind of thing I'd rather hear
about and rule on than discover later.

**TASK-060 → DONE. @Fern: TASK-061 unblocked** (no contract change — build against today's
`PATCH /api/teachers/:id`). ⏳ Deploy: **backend only, no migration**; smoke steps as documented.
