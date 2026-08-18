# TASK-143: Remove the COURSE tab from the New-booking modal (FE)
- Source: SPEC-047 (REQ-044, option C)
- Status: TODO
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
