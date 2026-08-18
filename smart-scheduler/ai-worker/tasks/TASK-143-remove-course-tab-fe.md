# TASK-143: Remove the COURSE tab from the New-booking modal (FE)
- Source: SPEC-047 (REQ-044, option C)
- Status: DONE (code — SA-reviewed Sober); tab-strip render pass → @Tanya; Porter's redirect wording still owed

## Review
**PASS ✅ (code — Sober).** Reproduced: `bunx tsc --noEmit` **0** · `bun test src/lib/scheduler/` **15/0** · §3.5 greps 0.
- `BOOKING_TABS = ["FIRST_TRIAL","SINGLE_SESSION","VOUCHER"]` (`:547`); **0** `COURSE_PACKAGE`/`isCourse`/`CourseContext`
  left in the modal. Dead `isCourse` payload/validity branch, course teacher/time row, and the
  `useEligibleStudents("COURSE_PACKAGE")` query all removed; the dead render fork collapsed (no `{cond ? x : null}`
  pretending a choice remains). Surgical.
- 🟢 **Orphan discipline — the part I most wanted to check:** `bookingType.COURSE_PACKAGE` **kept** (2 = TH+EN — still
  labels existing course bookings on the calendar/table `BookingTypeChip`) and `noCourseStudents` **kept** (still a live
  branch of the generic `EligibleStudentSelect`). `courseContext` **removed** (0 readers). He removed only true orphans
  and resisted the "grep says orphan" mistake — verified each.
- **Voucher path intact** (EligibleStudentSelect/REQ-043, program pick + exclusions REQ-027/SPEC-026, ContextCard, the
  REQ-048 time Select) — the only touch is the voucher ContextCard shedding a now-redundant `&& isVoucher`. Trial/Single
  untouched.
- 🔴 **Rendered check + hallmark not verifiable headless** → @Tanya. Her specific look (Fern flagged it, good): the strip
  now has **3** tabs where staff have muscle-memory for 4, and Voucher sits where Course used to — confirm nobody lands
  on Voucher expecting Course.
- ⏸️ **Porter's redirect wording** correctly not written by Fern (waiting on copy) — still owed by Porter.
- **Verdict: DONE.** REQ-044 resolves via C; closes on Tanya's tab-strip pass + (optional) Porter's redirect note.
- Assignee: @Fern (FE)
- Depends on: none

## Context (why)
The New-booking modal's COURSE tab did a plain `createBooking` (+1 session, no owed check — could over-fill a
course to size+1). Its intended job (make-up insert) already lives in the plan modal's `แทรกคาบชดเชย`, and
paid-extra in `เพิ่มคาบ(คิดเงิน)` / the Single tab. SA chose option C (remove) over A (grounded: a real
make-up insert would refuse `NO_OWED_SESSION` almost always, since owed-count is ~0). Owner pre-authorised C.

## What to do (smart-scheduler-front, `Calendar/Modal/BookingModal.tsx`)
1. Remove `COURSE_PACKAGE` from `BOOKING_TABS` (`:545`) → modal offers **Trial · Single · Voucher**.
2. Remove the now-dead `isCourse` paths in `CreateForm`: the course payload/validity branch, the course
   teacher/time row, and the `useEligibleStudents("COURSE_PACKAGE", …)` wiring.
3. **Keep the VOUCHER path fully intact** — `EligibleStudentSelect`, ContextCard, program picker, the REQ-048
   voucher time Select. Voucher still uses `usesEligible`.
4. Grep-clean only what the removal orphans (`isCourse`, `courseStudents`, `courseLoading`, course-only i18n
   keys, unused imports). Do **not** touch trial/single/voucher behaviour.
5. **No BE change.** (Porter may supply a short in-modal redirect note pointing staff to the plan screen for
   course make-ups — add it only if he provides the copy.)

## Definition of Done
- [ ] New-booking modal shows exactly **Trial · Single session · Voucher** — no COURSE tab.
- [ ] Voucher tab unchanged (picker unify REQ-043, voucher time REQ-048, exclusions REQ-027, program pick).
- [ ] Trial / Single unchanged (add-new picker, etc.).
- [ ] No dead `isCourse`/course-eligible code or orphaned imports/i18n keys remain (grep clean).
- [ ] `bunx tsc --noEmit` 0 · `bun run build` ok · FRONTEND-STANDARD holds · self-run hallmark, paste verdict.

## Implementation Notes / Questions
(Fern fills in.)

---

## Implementation Notes (Fern)
> ⚠️ **Date deliberately not stamped** — see the clock question in the log/handoff. This session's own date context
> says **2026-08-18**, the team's newest log file is **2026-08-17**, and my earlier entries today say **2026-08-16**.
> I am not stamping a fourth guess into an artifact until the human settles it.

**`smart-scheduler-front@dong`, uncommitted — 2 files (`BookingModal.tsx`, `dictionaries.ts`).**

### What changed
1. **`BOOKING_TABS`** → `["FIRST_TRIAL", "SINGLE_SESSION", "VOUCHER"]`. The modal offers three tabs; the reason
   (plain `createBooking` could over-fill a course to `size+1`, and the make-up insert has a proper owed-gated home)
   is a comment above it, so nobody re-adds the tab without meeting the argument.
2. **`CreateForm` dead-path removal:** the `isCourse` flag, the `useEligibleStudents("COURSE_PACKAGE", …)` query,
   the `COURSE_PACKAGE` payload/validity branch, the course `ContextCard`, and the course teacher/time row.
3. **The render fork collapsed.** `usesEligible` used to fan out into voucher-vs-course; with course gone the
   `isVoucher ? … : …` had a dead else, so the voucher block is now unconditional inside that branch — no
   `{cond ? x : null}` left behind pretending a choice still exists.
4. **Orphans cleaned:** `CourseContext` import dropped; `booking.courseContext` deleted from **both** dictionaries
   (0 readers). ⚠️ **Deliberately kept:** `bookingType.COURSE_PACKAGE` (still labels existing course bookings in
   `BookingTypeChip` on the calendar and the bookings table) and `booking.noCourseStudents` (still a live branch of
   the generic `EligibleStudentSelect`). Removing either would have been a "grep says orphan" mistake.

### DoD
- ✅ Modal shows exactly **Trial · Single · Voucher** — `BOOKING_TABS` verified, and **zero** `COURSE_PACKAGE`
  occurrences remain anywhere in the file.
- ✅ **Voucher path intact** — `EligibleStudentSelect` (REQ-043), the program picker + exclusions (REQ-027/SPEC-026),
  the ContextCard, and the REQ-048 time Select are all still there; the only change to them is that the voucher
  ContextCard condition lost its now-redundant `&& isVoucher`.
- ✅ Trial/Single untouched (`StudentSelect` + add-new, teacher/subject/time row).
- ✅ Grep clean: `isCourse` **0** · `courseStudents` **0** · `courseLoading` **0** · `eligiblePlaceholder` **0** ·
  `CourseContext` **0** in this file.
- ✅ `bunx tsc --noEmit` **0** · `bun run build` **ok** · `bun test src/lib/scheduler/` **15/0** · §3.5 greps
  0/0/0/0.
- 🔴 **Rendered check + hallmark — NOT verified** (modal won't mount in this session's non-compositing pane; same as
  131/132/133/139). Rides the @Tanya pass. **What she should look at specifically:** the tab strip now has 3 tabs
  where staff have muscle-memory for 4, and the Voucher tab is where COURSE used to sit — worth confirming nobody
  lands on Voucher expecting Course.
- ⏸️ **Porter's redirect note not added** — the task says add it *only if he supplies the copy*, and he hasn't yet.
  Flagging rather than writing staff-facing copy myself (same line I held on TASK-132's Q1).
