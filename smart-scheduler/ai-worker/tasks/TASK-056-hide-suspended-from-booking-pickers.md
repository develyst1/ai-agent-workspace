# TASK-056: scheduling (BE) — hide a suspended household's students from the **booking** pickers
- Source: SPEC-016 (REQ-019 acceptance failure) — also closes the same gap in REQ-022's new pickers
- Status: DONE  (reviewed 2026-08-01 by Sober — one rule via `lib/suspend.ts`, exclusion-set `innerJoin` keeps walk-ins by construction, empty-set case handled, flag contract tested; tsc 0 / 232 tests). FE half = TASK-057
- Depends on: TASK-048 (DONE — the suspend gate + `lib/suspend.ts`)
- Assignee: @Jason (smart-scheduler-back, port 4006)

## Why (the acceptance failure, and why the fix is here and not in the browser)
REQ-019's acceptance found that a suspended parent's students **still appear in the booking picker**, so the
block is only discovered at Save. คุณฟีน settled it 2026-08-01: **hide them** — not a disabled row —
*"แล้วเขากดระงับไปทำไม"*. The server-side `400` stays regardless: hiding is convenience, the API is the
guarantee.

"Is this household suspended" is a **domain rule that already exists server-side** (`lib/suspend.ts`,
`bookingBlockedBySuspension`, enforced in `insertBooking`). Filtering it in the browser would be a second copy
that drifts — the same reasoning as TASK-051's eligibility. **So the pickers must stop returning them.**

⚠️ **This is NOT only REQ-019.** REQ-022 shipped two brand-new pickers today and neither filters suspension —
I checked: `getEligibleStudents` (`scheduler.service.ts:362`) filters on course/voucher eligibility only, and
`searchStudents` (`parent.service.ts:316`) has no suspension clause at all. All four booking tabs are affected.

## ⚠️ Do NOT filter `GET /students` unconditionally — I traced the callers
`GET /students?q=` is not only the booking picker. `StudentSelect` also backs **`CreateCourseModal`** and
**`CreateVoucherModal`** — i.e. *selling* a course or voucher. Hiding suspended families there would be a scope
change **nobody decided** (selling ≠ booking; a voucher sale creates no booking at all). Blanket-filtering the
shared endpoint would quietly change two screens beyond this REQ.

## What to do
1. **`GET /students/eligible`** — filter unconditionally. This endpoint exists **only** to answer "who can be
   booked", so a suspended household never belongs in it.
2. **`GET /students`** — add an **opt-in** query flag (`bookable=true`, or a name you prefer — say which) that
   excludes suspended households. Default = today's behaviour, so the course/voucher **sale** screens are
   untouched. The FE will pass it from the booking picker only; that's a small follow-up I'll raise once this
   lands, not part of this task.
3. **Use `lib/suspend.ts` — do not write a second rule.** The predicate is `isSuspended(parent.suspendedAt)`
   and the "no parent = never blocked" carve-out is already stated in `bookingBlockedBySuspension`.
   ⚠️ **A student with no parent (walk-in / First-Trial, `students.parent_id` nullable by design) must still
   appear.** `searchStudents` already LEFT-joins parents — keep it that way; an inner join would delete the
   entire walk-in cohort from the picker. Same failure mode as the badge report.
4. Nothing else changes: no migration, no change to `POST /bookings`, the server-side suspend gate, the
   freelance cap, or the People screen (suspended families stay **fully visible** there — that's where staff
   see them).

## Definition of Done
- [ ] `GET /students/eligible?type=…` never returns a student whose parent is suspended (both types).
- [ ] `GET /students?q=…&<flag>=true` excludes them; **without the flag the response is byte-for-byte what it
      is today** (the sale screens must not change).
- [ ] A student with **no parent** still appears in both, flag or no flag.
- [ ] The server-side `400` on `POST /bookings` is untouched — hiding is convenience, not the guarantee.
- [ ] `bunx tsc --noEmit` clean; `bun test` green — tests for: suspended → absent, un-suspended → back,
      **parentless → present**, and the no-flag default unchanged.

## Implementation Notes

**Flag name: `bookable=true`** (your suggestion — it says *why* the caller wants the filter, not *what* it does,
so it stays meaningful if the exclusion rules ever grow).

**One rule, one helper — `suspendedStudentIds()`** (`parent.service.ts`): returns the set of student ids whose
household is suspended, built by filtering joined rows through **`isSuspended` from `lib/suspend.ts`**. Both
pickers consume that set; neither restates the rule.

> ⚠️ **The `innerJoin` in that helper is deliberate and I've commented it as such.** It builds the set of
> students to **exclude**, so a student with **no parent** (walk-in / First-Trial) simply never appears in it
> and therefore **stays visible**. Excluding by id (never by a nullable `parent_id` predicate) also sidesteps
> the SQL-NULL trap — `parent_id NOT IN (…)` would have evaluated to NULL for parentless students and silently
> deleted the entire walk-in cohort. That's the badge-report failure mode, avoided by construction rather than
> by remembering to LEFT-join.

1. **`GET /students/eligible` — filtered unconditionally** (`getEligibleStudents`, both `COURSE_PACKAGE` and
   `VOUCHER` branches). This endpoint exists only to answer "who can be booked".
2. **`GET /students` — opt-in only.** `searchStudents(q, limit, { bookable })` applies
   `notInArray(students.id, excluded)` **only** when the flag is on; the query is otherwise untouched, so
   `CreateCourseModal` / `CreateVoucherModal` (selling ≠ booking) behave exactly as before. Zod parses
   `bookable` as `"true" | "false"` → boolean, **defaulting to `false`**, and rejects anything else.
3. **Callers checked (your Question):** I re-grepped `GET /students`' consumers and found **no consumer you
   missed** — the endpoint backs the booking picker plus the two sale modals, which is exactly the split you
   described. Nothing else changed: no migration, `POST /bookings`' 400 gate untouched, freelance cap untouched,
   and the People screen still shows suspended families in full.
4. The FE passing `bookable=true` from the booking picker is the small follow-up you said you'd raise — **not
   done here.**

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **232 pass / 0 fail** (39 files).
- New `services/suspended-pickers.test.ts`: suspended → in the exclusion set · active → not · **parentless →
  can't be in the set** (walk-in stays visible in both pickers) · un-suspend removes them again ·
  `/students/eligible` filters unconditionally keeping the walk-in · **`/students` without the flag applies no
  filter at all** (the sale screens' guarantee) · with the flag, suspended gone and walk-in kept.
- ✅ **Checked the flag contract directly:** no flag → `bookable:false`, `=false` → `false`, `=true` → `true`,
  and `bookable=yes` is **rejected** — so the default can't be flipped by a typo'd query string.
- ⚠️ The DB-backed picker results are **deploy smoke** (brownfield). **Smoke:** suspend a household on the
  People screen → their students disappear from all four booking tabs (`/students/eligible` for course/voucher,
  `/students?bookable=true` once the FE passes it) while **still appearing** in the course/voucher **sale**
  modals and in full on the People screen → un-suspend → they return everywhere.

**DoD:** `/students/eligible` never returns a suspended household (both types) ✓ · `/students` excludes only
with the flag, unchanged without it ✓ (contract-tested) · parentless students still appear in both ✓ ·
`POST /bookings` 400 untouched ✓ · tsc clean + `bun test` green with all four cases ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- If the two pickers want to share one helper, good — but it must sit **on top of** `lib/suspend.ts`, not
  restate the rule.
- If you find another consumer of `GET /students` I missed, **tell me before changing its default**.

## Review
**Verdict: DONE ✅ (Sober, 2026-08-01) — and the `innerJoin` reasoning is better than what I asked for.**
`bunx tsc --noEmit` → **0**; `bun test` → **232/0** (my own run).

- **One rule, honoured:** `suspendedStudentIds()` filters through **`isSuspended` from `lib/suspend.ts`** rather
  than restating "suspended" in SQL, and both pickers consume the same set.
- **The inversion is the good part.** I told him to keep the LEFT join so parentless walk-in students survive.
  He did something stronger: built the set of students to **exclude** with an `innerJoin`, so a parentless
  student can't be in it **by construction** — and pointed out that the obvious alternative,
  `parent_id NOT IN (…)`, would evaluate to **NULL** for parentless rows and silently delete the entire walk-in
  cohort. That's the badge-report failure mode dodged by structure rather than by remembering a rule, and it's
  a sharper answer than the one in my task. He commented it so nobody "fixes" it back.
- **The empty-set case is handled** — `excluded.length ? and(searchWhere, notInArray(...)) : searchWhere`. This
  is exactly where this pattern usually breaks: `notInArray(col, [])` on an empty list is the classic way to
  make a picker return nothing on the happy path (no suspended households at all). It was the first thing I
  checked and it's correct.
- **The opt-in contract is properly closed:** `bookable` is `z.enum(["true","false"]).optional()` → boolean,
  **defaulting to off**, and `bookable=yes` is **rejected** rather than silently falsy. So the sale screens
  (`CreateCourseModal` / `CreateVoucherModal`) can't lose students to a typo'd query string — and he tested that
  contract directly rather than assuming Zod's behaviour.
- `/students/eligible` filters **both** the COURSE_PACKAGE and VOUCHER branches; the server-side `400` gate is
  untouched, which keeps hiding as convenience and the API as the guarantee.

**Accepted with a note, no action:** `suspendedStudentIds()` reads students⋈parents on every call, including
each debounced keystroke of the picker. A `NOT EXISTS` / `or(isNull(...))` clause on the existing LEFT join
would avoid the second query — but it would restate the suspend rule in SQL, which is precisely what I told him
not to do. **He made the tradeoff I asked for**; fine at this roster size, and worth revisiting only if the
student table grows a lot.

**TASK-056 → DONE. This clears REQ-019's acceptance blocker.**
**⏳ Small FE follow-up (mine to raise, not his):** the booking picker must actually pass `bookable=true`, or
the Trial/Single tabs still list suspended households. Raised as **TASK-057** for @Fern. Note `/students/eligible`
already filters unconditionally, so the **Course and Voucher tabs are correct with no FE change at all**.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-056 | scheduling (BE): 🔴 **REQ-019 acceptance blocker** — hide a suspended household's students from the **booking** pickers (`/students/eligible` unconditionally + opt-in `bookable=true` on `/students`, so the course/voucher **sale** screens are untouched) | SPEC-016 | ✅ **DONE** (Sober 2026-08-01 — one rule via `lib/suspend.ts`; the exclusion-set `innerJoin` keeps walk-in students visible **by construction** and dodges the `NOT IN` + SQL-NULL trap that would have deleted the whole walk-in cohort; empty-set case handled; flag contract tested incl. `bookable=yes` rejected; tsc 0 / **232 tests**) | Jason | TASK-048 |
```
