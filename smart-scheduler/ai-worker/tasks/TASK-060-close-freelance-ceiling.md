# TASK-060: scheduling (BE) — close the freelance ceiling when a teacher stops being freelance
- Source: SPEC-019 (REQ-009)
- Status: TODO
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
(Jason fills in.)

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- **Bookings that already drew the ceiling: leave them.** Those hours are committed spend and REQ-009 item 3
  says history is preserved; `reconcileFreelanceDraw` skips non-FREELANCE teachers anyway, so nothing will
  touch them again and no new draws happen after the change. Don't release or recompute anything.
- If you find another path that ends a freelance arrangement and leaves the ceiling active, **flag it** — I
  found two (type change, archive) and I'd rather hear about a third than have it fixed silently.

## Review
(Sober fills at REVIEW.)
