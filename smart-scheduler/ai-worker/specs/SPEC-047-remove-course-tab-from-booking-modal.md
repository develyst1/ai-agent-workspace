# SPEC-047: Remove the COURSE tab from the New-booking modal (REQ-044, option C)
- Source: REQ-044 (owner pre-authorised A or C; SA chose C)
- Status: ACTIVE (redirect wording ← Porter)

## Decision + why (Q4 answered)
REQ-044's premise ("the COURSE tab moves a make-up, total unchanged") was false — the tab does a plain
`createBooking` (+1 session, no owed check, can over-fill a course to `size+1`). The owner pre-authorised
**(A)** make it a real make-up insert **or (C)** remove it. **Grounded Q4 and chose (C).**

**Q4 — when is a course session owed-but-unplaced (`ยังค้างอีก N คาบ` > 0)?** N = `size −` (LIVE-or-DELIVERED
COURSE_PACKAGE sessions) (`course-plan.ts`, `scheduler.service.ts:1193`). A `SICK_LEAVE`/`CANCELLED` gap makes
N>0 **only until an `EXTENDED` make-up is appended**. The honest enumeration:
- **Normal leave (Path A, under quota)** auto-appends a tail make-up immediately → **N stays 0.** (This is the
  owner's "press leave, it grows at the tail".)
- **N > 0 only when:** the leave is **over-quota-locked** (`canTakeLeave` false → `locked`, no append, pending
  admin unlock) — the dominant real case; **or** a course was imported/created short of `size`.
- Extension-ceiling and cancel-at-ceiling **abort atomically** (roll back) — they never persist a gap.
- ⇒ **N is almost always 0.**

**Why C, not A:**
1. Option A routes the tab through `applyPlanChange {kind:"insert"}`, which **refuses with `NO_OWED_SESSION`
   unless a session is genuinely owed** — i.e. almost always (N≈0). A tab on the primary booking modal that
   *usually rejects* is worse UX than no tab.
2. Make-up insertion already has a proper, context-rich home — the plan modal's `แทรกคาบชดเชย` (owed-gated) —
   and paid-extra has `เพิ่มคาบ(คิดเงิน)` + the Single-session tab (REQ-037). The COURSE tab is a **redundant
   third door** onto the same action (Porter's business point), and its current create-path is the one that's
   actually wrong (over-fills).
3. Course *creation* is not this tab's job either — that's the course-create flow (`CreatePlanFlow`). Removing
   the tab loses no capability; it removes a broken/redundant door.

(I hold the owner's standing authorisation for C — this does not round-trip to him.)

## Change (FE-only, surgical)
`smart-scheduler-front/src/components/partials/Calendar/Modal/BookingModal.tsx`:
- Remove `COURSE_PACKAGE` from `BOOKING_TABS` (`:545`) so the New-booking modal offers **Trial · Single ·
  Voucher** only.
- Remove the now-dead `isCourse` code paths in `CreateForm`: the course branch of the payload build
  (`isCourse` in `input`/`valid`), the course teacher/time row, and the course-only `useEligibleStudents(
  "COURSE_PACKAGE", …)` wiring. **Keep the VOUCHER `usesEligible` path intact** (EligibleStudentSelect,
  ContextCard, program picker, voucher-time from REQ-048) — voucher still uses it.
- Grep for orphans after removal (`isCourse`, `courseStudents`, course-only i18n keys) and clean only what the
  removal orphans (surgical — don't touch voucher/trial/single).
- **No BE change.** `POST /bookings` with a courseId stays valid for any other caller; only the modal tab goes.

## Redirect wording (← Porter, UX-writer)
The owner asked the honest question. Porter writes the one line that tells staff **where course make-ups now
live** — the student's plan (`แผนของ …` → `แทรกคาบชดเชย`) — surfaced wherever a staff member might have reached
for the old tab (e.g. a short helper note if there's a natural spot, or just release notes). **No engineer
drafts this copy.** If Porter wants an in-modal pointer, that's a small addition to TASK-143.

## Regressions to preserve
Trial / Single / Voucher tabs unchanged (incl. REQ-043 picker unification, REQ-048 voucher time, REQ-027
exclusions, SPEC-026 program pick). The plan modal's `แทรกคาบชดเชย` / `เพิ่มคาบ(คิดเงิน)` untouched (REQ-030).
Nothing that books an eligible **course** student any other way is affected.

## Tasks
- **TASK-143 (FE, Fern)** — remove `COURSE_PACKAGE` from the modal tabs + the dead `isCourse` paths; keep
  voucher/trial/single; grep-clean orphans; tsc 0 · build ok · hallmark. (+ Porter's redirect pointer if he
  wants one in-modal.)

## Questions
- **To Porter:** the redirect wording (where staff go for a course make-up now). And confirm you're content
  with C over A given the grounded "N≈0 → A would usually refuse" finding (owner already pre-authorised both).
