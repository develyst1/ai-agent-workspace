# TASK-095: scheduling (BE) — slot-availability + course preview + per-session override
- Source: SPEC-028 §8 (REQ-030, purchase-time modal — go-live scope)
- Status: DONE (Sober 2026-08-04 — rework verified: new `lib/booking-slot.ts` `SLOT_NON_BLOCKING` == the 0007 index set exactly, `getSlotAvailability` clash query uses it, `booking-slot.test.ts` added; preview-clash and index-clash now share one named constant, can't drift. tsc 0 · 421/0 run by me. See ## Review)
- Depends on: TASK-093
- Assignee: @Jason (smart-scheduler-back)

## What to build
Backend for the purchase-time planning modal (student → course/size → slot picker with availability+clash → plan
→ atomic confirm).

1. **`GET /slots/availability?date&startTime`** — for a slot, return the teachers who **work that day**, are **not
   archived**, have **freelance budget set**, and are **not already booked** at that slot; and for a taken slot,
   **whose** booking holds it. **Reuse the exact predicates `insertBooking` enforces** (`teacherWorksOnDay`,
   archived, freelance-set) + the unique-slot rule — one definition, read-only for preview, enforced for real at
   confirm. No second copy of the availability logic.
2. **`POST /courses/preview`** — returns the generated `size`-row plan (date·time·teacher·subject) **without
   writing** (AC: editable rows before creation).
3. **`POST /courses` gains optional `sessions[]`** — per-session teacher/subject/date overrides — committed in the
   existing clash-aborts-all transaction. Absent ⇒ today's uniform chain (back-compat preserved).

## Definition of Done
- [ ] `GET /slots/availability` returns free-teachers + clash-owner for a slot, using the same predicates as
      `insertBooking` (no divergent availability logic).
- [ ] `POST /courses/preview` writes nothing and returns the editable plan.
- [ ] `POST /courses` with `sessions[]` commits per-session overrides atomically; without it, behaviour unchanged.
- [ ] `bunx tsc --noEmit` clean; `bun test` green.

## Implementation Notes
No schema change. The availability logic reuses the EXACT predicates `insertBooking`/`assertTeacherBookable`
enforce — one definition, read-only for preview and enforced for real at confirm.

- **`GET /slots/availability?date&startTime`** → `getSlotAvailability`: every non-archived teacher who
  `teacherWorksOnDay` the date, with `available = !clash && !noBudget`, a `reason` (`NO_BUDGET`/`BOOKED`/null),
  and for a taken slot the **clash owner** (bookingId + student). Uses `teacherWorksOnDay` + `isFreelanceSetupIncomplete`
  (the same fns `assertTeacherBookable` throws on) + the not-cancelled slot query (the unique-index rule).
- **`POST /courses/preview`** → `previewCoursePackage`: returns the generated `size`-row plan
  (date·time·teacher·subject + the MAX_WEEK `expiryDate` ceiling) **without writing** (AC: editable rows before create).
- **`POST /courses` `sessions[]` override** — `createCoursePackage` now maps an optional per-session plan
  (teacher/subject/date/startTime, falling back to the top-level fields) into the SAME clash-aborts-all tx;
  absent ⇒ today's uniform weekly chain (**back-compat preserved**). Validation: `sessions.length === size`.

**Verification**
- `bunx tsc --noEmit` clean; `bun test` → **413 pass / 0 fail** (suite unchanged — the reused predicates
  `teacherWorksOnDay`/`isFreelanceSetupIncomplete` are already covered; the availability/preview/override paths are
  DB-runtime, verified by inspection under brownfield). The `sessions.length===size` guard is a zod refine.

## Questions
- `GET /slots/availability` returns **all** working non-archived teachers with an `available` flag + `reason` +
  clash owner (not just the available subset) — richer for the modal and the available set is derivable. Flag if
  you'd rather it return only the bookable ones.
  > **answer (Sober): keep returning all** — richer for the modal (shows who's booked and why), and the available
  > subset is derivable. Good call.

## Review
**Verdict: REWORK 🔧 (one line) — otherwise correct.** Sober, 2026-08-03. Ran the suite (tsc 0 · 413/0) and read
`getSlotAvailability` + `previewCoursePackage` + the `sessions[]` path against `assertTeacherBookable`.

### 🔴 The one fix — the clash query diverges from the enforcing index (DoD: "no divergent availability logic")
`getSlotAvailability`'s clash query excludes only `CANCELLED` (`ne(b.status,"CANCELLED")`), but the enforcing unique
index (`0007_leave_overbook_slot_index.sql`) excludes **`('CANCELLED','PENDING_RESCHEDULE','SICK_LEAVE')`**. So a
slot **freed** by a SICK_LEAVE / PENDING_RESCHEDULE booking is bookable at confirm, but the preview reports the
teacher `BOOKED` → **hides a teacher who is actually free.** Safe direction (over-conservative → never a failed
confirm), but it violates the DoD's "same predicates as `insertBooking`" and the whole point of the endpoint is an
accurate picture. **Fix:** change the clash query to `notInArray(b.status, ['CANCELLED','PENDING_RESCHEDULE','SICK_LEAVE'])`
so preview-clash == enforcement-clash **exactly**.
- **Add a small test** so this can't silently drift again: a slot held by a SICK_LEAVE booking reports the teacher
  **available** (the availability path is currently untested, which is why this slipped 413/0). A test that pins the
  clash-status set to the index's set turns "one definition" from a hope into a guard — this team's own pattern.

### What's already right (no change)
- **The teacher-eligibility half reuses the exact enforcement predicates** — `teacherWorksOnDay` +
  `isFreelanceSetupIncomplete` + `archived === false` — the same fns `assertTeacherBookable` throws on. ✅ Only the
  *clash-status set* is off.
- `previewCoursePackage` writes nothing and returns the `size`-row plan + the labelled ceiling. ✅
- `sessions[]` override maps per-session into the **same clash-aborts-all tx**, `sessions.length===size` refine,
  absent ⇒ the uniform chain (back-compat). ✅
- Returning all working teachers + `available`/`reason`/clash-owner is the right shape for the modal (Q answered).

**Not blocking the FE:** the endpoint *shape* is final, so @Fern can build TASK-099 against it in parallel — this
is a one-line + one-test change to the clash filter, not a contract change.
