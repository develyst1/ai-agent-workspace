# SPEC-019: Close the freelance ceiling when a teacher stops being freelance (+ an admin warning)
- Source: REQ-009
- Status: ACTIVE

## Overview
When a FREELANCE teacher becomes FT/PT, their monthly budget ceiling stops meaning anything — but today it stays
**active**, and the admin gets no warning that the change touches money. Close the ceiling on the change, and
tell the admin first so it is a decision rather than a side effect.

## As-built — I read the code, and two of the REQ's assumptions have moved
**1. "Closing" already has a representation. There is no new concept and no migration.**
`bo.item.active` is exactly this flag: `findFreelanceItem`, `listFreelanceCeilings` and `resetFreelanceBudgets`
**all** filter `active = true`. So **close = `active = false`**, and the ceiling instantly disappears from
enforcement, from the monthly reset, and from the calendar's cap — without deleting a thing. History
(`bo.movement` rows, prior P&L) is untouched by construction, which satisfies REQ item 3 for free.

**2. ⚠️ The REQ's Q1 — "immediate or from the effective month?" — is answered by the code, not by คุณฟีน.**
There is **no effective-dating in the live system**. `updateTeacher` (`scheduler.service.ts:1079`) writes `type`
immediately; the comment on it says type change was effective-dated *"only in the (deferred) backoffice salary
model"*, and that ops teacher-sync was **removed by TASK-029** when teacher management went standalone. So
"immediate on confirm" is not a business choice — it is the only behaviour the system has. **No routing needed;
I'm proceeding.**

**3. 🔎 A second stale-ceiling path the REQ doesn't name — and it is the same defect.**
`archiveTeacher` (`:1106`) sets `archived/active` on the teacher and **nothing else**, despite its own comment
mentioning the local `bo.item`. And `resetFreelanceBudgets` (`:1198`) resets **every active freelance item with
no join to `teachers`**. So an archived freelance teacher's dead budget is **re-filled to its ceiling every
month, forever**. No money leaks (the drawdown reconcile skips non-FREELANCE and archived teachers can't be
booked), but it is precisely the "stale active budget lingering" this REQ exists to end, on a path nobody looked
at. **Closing it is the same one-line call**, so this spec covers it — see Questions for the FYI to คุณฟีน.

## Design
**One helper, used by every path that ends a freelance arrangement:** `closeFreelanceCeiling(exec, teacherId)`
→ sets the teacher's freelance `bo.item.active = false` (no-op when there is no item). Called from:
- **`updateTeacher`**, when `type` changes **away from FREELANCE** — inside the existing transaction, so the
  type change and the closure land together or not at all;
- **`archiveTeacher`**, for the reason in §3.

**Nothing is deleted, nothing is recalculated.** `remainingQty` / `ceilingQty` stay as they were — the row is
simply no longer active. That is what makes "history preserved" true rather than asserted.

**Going back to freelance = start fresh (REQ item 4), and it already works.** `findFreelanceItem` only sees
active items, so a re-freelanced teacher has none → `isFreelanceSetupIncomplete` reports `setupIncomplete`, the
calendar refuses to book them, and the admin must call `setFreelanceBudget`, which inserts a **new** item. **No
code needed for item 4** — but a test should pin it, because it's behaviour we're relying on rather than writing.

**The warning is the FE half.** The admin must see, *before* confirming, that the freelance budget will close
and the remaining amount will not carry over. The number is already available:
**remaining baht = `remainingQty × unitPriceMinor`** on the item the teacher DTO already exposes.

## API
No new endpoint. `PATCH /api/teachers/:id` is unchanged in shape — the closure is a **consequence** of a type
change, never a separate call the FE could forget to make. (If closing were its own endpoint, the guarantee
would depend on the browser; it must not.)

## Data Model
**None. No migration.** `bo.item.active` already exists and is already the filter everywhere.

## Flow
1. Admin edits a teacher and switches FREELANCE → FT/PT.
2. **Before saving**, the FE shows a confirmation naming the budget and the **remaining amount in baht**, and
   stating it will not carry over. Cancel changes nothing (no request is sent).
3. On confirm, `PATCH /teachers/:id` applies the type change **and** closes the ceiling in one transaction.
4. The teacher is FT/PT with no active ceiling: gone from the freelance cap, the monthly reset, and the
   budget list. Past movements and P&L unchanged.

## Non-functional
- Server-side is the guarantee; the confirmation is UX. A type change posted directly must still close the
  ceiling.
- No change to booking, the drawdown reconcile, top-up, or the monthly reset's own logic.

## Tasks
- **TASK-060** (Jason, BE): `closeFreelanceCeiling` + wire into `updateTeacher` (away-from-FREELANCE) and
  `archiveTeacher`; tests incl. the "back to freelance starts fresh" behaviour.
- **TASK-061** (Fern, FE): the pre-save confirmation on the teacher edit form, naming the remaining baht.
  (depends on TASK-060 only for ordering, not for contract — the API shape doesn't change.)

## Questions
(Sober asks; Porter answers as `> answer: ...`)
1. **REQ Q1 is withdrawn — answered from the code**, not a business call: there is no effective-dating left in
   the system (it went with the ops sync in TASK-029), so the change is immediate. Recording it so the REQ's
   open question doesn't look unanswered.
2. **REQ Q2 — bookings that already drew the ceiling: I am proceeding on "leave them alone", and here's why.**
   Those hours are **committed spend** — the centre booked a freelance session at a freelance rate, and REQ
   item 3 says history is preserved. Releasing them would rewrite a past month's cost. Mechanically it also
   settles itself: `reconcileFreelanceDraw` skips non-FREELANCE teachers, so nothing will touch those hours
   again, and no *new* draws happen once the type changes. **Non-blocking**, but if คุณฟีน believes the centre
   stops owing the freelance rate for sessions **already booked but not yet taught**, that's a different answer
   and a small follow-up — worth asking when convenient.
3. **FYI, one deliberate extension beyond the REQ's wording:** I'm also closing the ceiling on **archive**
   (§3 above) — an archived freelance teacher's dead budget is currently re-filled by the monthly job every
   month. Same defect, same one-line fix, no behaviour a user would miss. Say if คุณฟีน wants archive left
   alone and I'll split it out.
