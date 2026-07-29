# SPEC-008: Freelance income-cap on the calendar — %-used strip + auto-hide when full
- Source: REQ-007
- Status: ACTIVE  (⚠️ **REVISED 2026-07-28** per REQ-007 revision — supersedes the first design below)

## ⚠️ Revision note (read first)
The first SPEC-008 / TASK-031 (DONE) made over-cap freelances **stay bookable with a per-action override**.
คุณฟีน corrected the intent (2026-07-28): the ceiling exists to **stop giving a full freelance more work**, so
a **full** freelance must be **HIDDEN from the calendar** (auto-disabled, like inactive) — not bookable. The
**color strip stays but switches to %-used bands**; the **confirm/attend override-to-book is removed**. This
spec now describes that corrected design; the rework is **TASK-032** (TASK-031 is superseded).

## Overview
Still **frontoffice-FE-only** (`smart-scheduler-front`); backend unchanged (verified — see below). Two changes
vs. the delivered TASK-031: (1) **restore hide-when-full** — an over-cap freelance drops off the calendar; and
(2) **re-band the strip to %-of-ceiling-used**. Everything TASK-031 added for "bookable + override" is reverted.

## Backend — no change, verified
- `getCalendar` attaches freelance budgets to every teacher DTO (`scheduler.service.ts:229`
  `attachFreelanceBudgets`) → each calendar teacher carries `budgetMinor` / `remainingMinor` / `overLimit` /
  `limitOverride` / `type` (satang). The strip + the hide decision both read these.
- `overLimit` = backend `remainingQty ≤ 0` (a whole-hour ceiling drawn 1h/booking, so remaining is integer
  hours; `overLimit` ⇔ "budget 100% used / next booking would exceed"). The FE `overLimit` already folds in the
  durable `limitOverride` (`FREELANCE && teacher.overLimit && !teacher.limitOverride`) → a limit-overridden or
  topped-up teacher is not `overLimit` → reappears (REQ #3). Monthly reset restores `remaining` → also reappears.
- No new endpoint, field, migration, or config.

## Data Model
None.

## Flow
**1. Restore hide-when-full** — `lib/scheduler/teacher.ts` `toTeacherView`: **revert** the TASK-031 change,
i.e. put `overLimit` back into the gate → `bookable = teacher.active && !overLimit && !teacher.setupIncomplete`
(with `overLimit = FREELANCE && teacher.overLimit && !teacher.limitOverride`, unchanged). Effect: a full
freelance (remaining ≤ 0, no durable override) is **not a calendar column and not selectable** in the
booking/course-create flows — same treatment as an inactive teacher (REQ #2, restores REQ-001 auto-disable).
Admin top-up / limit-override (Teachers page) or the monthly reset flips `overLimit` off → the teacher
reappears (REQ #3). `setupIncomplete` still suppresses (unchanged).

**2. Re-band the color strip to %-used** — the strip stays (component + placement from TASK-031), but its tone
is now **how much of the monthly ceiling is used**, computed from the DTO satang fields:
`usedPct = (budgetMinor − remainingMinor) / budgetMinor × 100`.
- 🟢 **green** — `usedPct ≤ 30`
- 🟡 **yellow** — `30 < usedPct ≤ 70`
- 🔴 **red** — `70 < usedPct < 100` (near the ceiling; at 100% the teacher is hidden, so the strip only ever
  renders for visible < 100% teachers)
- No strip when there's no budget data (`budgetMinor` null/≤0 or `remainingMinor` null) or non-FREELANCE.
- Change `budgetTone(remainingMinor, reorderMinor)` → **`budgetTone(remainingMinor, budgetMinor)`** returning
  `"green"|"yellow"|"red"|null` on the %-used rule above. `reorderMinor` is **no longer used** by the strip
  (REQ dropped the near-cap-reorder banding). Display-only — never recompute "which hours count" on the FE.

**3. Remove the override-to-book (revert TASK-031 part 3).** Delete the confirm/attend `INSUFFICIENT_BUDGET`
override dialog + its `budgetBlock` state in `BookingModal.tsx`, and the `override` argument TASK-031 added to
`confirmBooking` / `markAttended` (service) and `useConfirmBooking` / `useMarkAttended` (hooks). Since a full
freelance is now hidden, the `INSUFFICIENT_BUDGET` path is no longer reachable from the calendar, so the
dialog is dead weight. **Do not touch** the sick-leave `LEAVE_NOTICE_TOO_LATE` override (separate, keep) or the
backend `override` param / durable `limitOverride` (pre-existing, REQ-004). Remove the now-orphaned i18n keys
TASK-031 added (`booking.budgetFullTitle` / `booking.budgetOverrideBtn`); keep the strip label key.

## Non-functional
- FE display + gating only; backend is source of truth. No new config/migration.
- No regression on the Teachers-page budget display (reads the same DTO; only the calendar `bookable` gate +
  the strip tone change).

## Tasks
- TASK-032: scheduler-front — revise REQ-007 FE to the 2026-07-28 revision (restore hide-when-full, re-band
  the strip to %-used, remove the confirm/attend override). (Fern) (depends on: —) **Supersedes TASK-031.**

_(No backend task — the budget/remaining/overLimit the strip + hide read are already shipped.)_

## Questions
(Sober asks; Porter answers as `> answer: ...`)
- **Design is fully specified by the revised REQ (bands + hide-at-`overLimit` mapping confirmed) — no open
  business question.** One **non-blocking heads-up → @Porter:** if TASK-031 (bookable + override) already
  shipped to the frontoffice, TASK-032 must go out on the next deploy to correct it; if TASK-031 hasn't
  deployed yet, TASK-032 simply replaces it pre-deploy. Please confirm the deploy state so the change lands
  before staff see the (now-superseded) bookable-over-cap behavior.
