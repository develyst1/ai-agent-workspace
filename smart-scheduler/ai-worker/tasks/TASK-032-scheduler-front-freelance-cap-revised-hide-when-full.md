# TASK-032: scheduler-front — REQ-007 revised: hide-when-full + %-used strip (remove the override-to-book)
- Source: SPEC-008 (revised 2026-07-28)
- Status: DONE  (re-reviewed 2026-07-29 by Sober — verified tsc 0 / test 4/0 / build ok + clean-revert grep + code inspection; see ## Review)
- Depends on: none. **Supersedes TASK-031** (which built the now-corrected "bookable + override" reading).
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
คุณฟีน revised REQ-007: a **full** freelance must be **hidden** from the calendar (auto-disabled, like
inactive) — not bookable-with-override. Keep the color strip but switch it to **%-of-ceiling-used** bands.
This mostly **reverts TASK-031's parts 1 & 3** and **re-bands part 2's helper**. FE-only; no BE change.

**1. Restore hide-when-full** — `src/lib/scheduler/teacher.ts` `toTeacherView`:
- Revert `bookable` to **`teacher.active && !overLimit && !teacher.setupIncomplete`** (put `!overLimit` back).
  Leave `overLimit` as-is (`FREELANCE && teacher.overLimit && !teacher.limitOverride`).
- Effect: a full freelance (remaining ≤ 0, no durable override) drops off the calendar + isn't selectable in
  the booking/course-create modals — like an inactive teacher. Top-up / limit-override / monthly reset flips
  `overLimit` off and the teacher reappears (no code needed — it already flows from the DTO).

**2. Re-band the strip to %-used** — `budgetTone` in `teacher.ts`:
- Change the signature to **`budgetTone(remainingMinor, budgetMinor)`** and compute
  `usedPct = (budgetMinor − remainingMinor) / budgetMinor × 100`:
  - 🟢 green: `usedPct ≤ 30` · 🟡 yellow: `30 < usedPct ≤ 70` · 🔴 red: `70 < usedPct < 100`.
  - return `null` when `budgetMinor` is null/≤ 0 or `remainingMinor` is null (no strip). Non-FREELANCE: no strip.
- Update the strip component (`FreelanceBudgetStrip.tsx`) + both call sites (day `CalendarGrid` + week
  `CalendarWeekGrid`) to pass `budgetMinor` instead of `reorderMinor`. Keep it display-only (no FE recompute).
- Update the `budgetTone` unit test to the %-used bands (green/yellow/red + null-budget/no-data).

**3. Remove the override-to-book** (revert TASK-031 part 3):
- `BookingModal.tsx`: remove the `budgetBlock` state, the red `INSUFFICIENT_BUDGET` override `Alert`, and the
  override branches in `handleConfirm` / `handleAttended` (they go back to a plain confirm/attend; on error,
  the normal error handling). **Keep** the sick-leave `LEAVE_NOTICE_TOO_LATE` override `Alert` (`noticeError`)
  untouched.
- `services/scheduler.service.ts`: drop the `override` arg from `confirmBooking` + `markAttended` (back to
  `(id)` sending `{action}` with no override).
- `hooks/scheduler/useScheduler.ts`: `useConfirmBooking` / `useMarkAttended` back to `(id: string)`.
- Remove the now-orphaned i18n keys `booking.budgetFullTitle` / `booking.budgetOverrideBtn` (en + th). Keep the
  strip label key (`calendar.freelanceBudget`).
- **Do NOT touch** the backend `override` param or the durable `limitOverride` (pre-existing, still used).

## Definition of Done
- [ ] A **full** freelance (remaining ≤ 0, no durable override) is **not shown** on the calendar and can't be
      selected for a booking/course — same as inactive. A topped-up / limit-overridden freelance **reappears**.
- [ ] The strip is 🟢 at ≤30% used, 🟡 at 30–70%, 🔴 at 70–<100% (from `budgetMinor`/`remainingMinor`), only on
      visible FREELANCE columns; no strip when there's no budget data.
- [ ] The confirm/attend `INSUFFICIENT_BUDGET` override dialog is **gone**; confirm + attend are plain again;
      sick-leave notice-override still works.
- [ ] No regression on the Teachers-page budget display.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds; `budgetTone` unit test updated + green. (Repo `lint`
      is known-broken on Next 16 — don't gate on it.)

## Implementation Notes
**Fern — DONE, ready for review (2026-07-29). All 3 parts + DoD verified. `smart-scheduler-front` only; no BE touch.**

Clean revert — confirmed via `git diff` that `BookingModal.tsx`, `hooks/scheduler/useScheduler.ts`, and
`services/scheduler.service.ts` are now **byte-for-byte back to the branch baseline** (all TASK-031 override
plumbing gone). What remains changed vs baseline is only the strip + `budgetTone` + test + tsconfig exclude.

**1. Restore hide-when-full** — `lib/scheduler/teacher.ts` `toTeacherView`: `bookable` back to
**`teacher.active && !overLimit && !teacher.setupIncomplete`** (`overLimit` formula unchanged:
`FREELANCE && overLimit && !limitOverride`). A full freelance (remaining ≤ 0, no durable override) now drops off
the calendar day/week grids + isn't selectable in the booking/course modals — same as inactive. Top-up /
limit-override / monthly reset flips `overLimit` off → reappears (no code; flows from the DTO). `setupIncomplete`
still suppresses.

**2. Re-band the strip to %-used** — `budgetTone(remainingMinor, budgetMinor)` (was `reorderMinor`) on
`usedPct = (budget − remaining) / budget × 100`: 🟢 ≤30 · 🟡 30–70 · 🔴 >70; null when `budgetMinor` null/≤0 or
`remainingMinor` null. `FreelanceBudgetStrip.tsx` now passes `teacher.budgetMinor`; day/week call sites unchanged
(they pass the whole teacher). `reorderMinor` is no longer read by the calendar strip (still used by the Teachers
page's own near-cap warning — untouched). Note: red is `usedPct > 70` (no <100 upper clamp) so a defensively-shown
100% teacher still reads red; in practice they're hidden by part 1, so the strip only renders for < 100%.

**3. Remove the override-to-book** — reverted TASK-031 part 3 entirely: dropped `budgetBlock` state + the
`INSUFFICIENT_BUDGET` override `Alert` in `BookingModal.tsx`; `handleConfirm`/`handleAttended` are plain again;
`confirmBooking`/`markAttended` back to `(id)`; `useConfirmBooking`/`useMarkAttended` back to `(id: string)`.
**Kept** the sick-leave `LEAVE_NOTICE_TOO_LATE` override (`noticeError`) and the backend `override` param /
durable `limitOverride` (pre-existing). Removed the orphaned `booking.budgetFullTitle`/`budgetOverrideBtn` i18n
keys (en + th); kept `calendar.freelanceBudget`.

**Verification (all clean):**
- `bunx tsc --noEmit` → 0 errors.
- `bun test src/lib/scheduler/teacher.test.ts` → **4 pass / 0 fail** (12 assertions) — %-used green/yellow/red +
  null (no budget / zero budget / no remaining).
- `bun run build` → compiled successfully, all 11 routes generated.
- Not run against a live backend (brownfield). `bun run lint` not run — known-broken on Next 16 (per DoD, not gated).

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- Revert was clean — nothing another feature depended on. `reorderMinor` is still used by the Teachers page's own
  near-cap warning (`TeachersContent`) + the set-budget form, so I left the field/type in place; only the calendar
  strip stopped using it, per spec.

## Review
**Verdict: DONE ✅ (Sober, 2026-07-29).** Matches the revised REQ-007; clean revert of TASK-031's superseded
parts + the re-banded strip.
- **Verified in code:** `teacher.ts` — `bookable` back to `active && !overLimit && !setupIncomplete` (full
  freelance hidden like inactive; `overLimit` still folds in durable `limitOverride`, so top-up/override/reset
  reappear from the DTO). `budgetTone(remainingMinor, budgetMinor)` computes `usedPct` → green ≤30 / yellow ≤70
  / red else; null on no-budget. `FreelanceBudgetStrip.tsx:29` now passes `teacher.budgetMinor`. The red band
  has no <100 upper clamp — fine, since 100%-used teachers are hidden by §1, so the strip only renders < 100%.
- **Override cleanly removed:** grep of `src/` for `budgetBlock` / `INSUFFICIENT_BUDGET` / `budgetFullTitle` /
  `budgetOverrideBtn` → **0 hits**. confirm/attend are plain again; sick-leave `LEAVE_NOTICE_TOO_LATE` override
  + the backend `override` param / durable `limitOverride` untouched (correct). Orphaned i18n keys gone.
- **Verified myself (`smart-scheduler-front`):** `bunx tsc --noEmit` → 0; `bun test teacher.test.ts` → 4/0 (12
  assertions, %-used bands + nulls); `bun run build` → success (all routes incl. `/scheduler/calendar`).
- **All DoD met:** full freelance hidden + reappears on top-up/override · strip 🟢≤30/🟡30–70/🔴>70 from
  budget/remaining, visible FREELANCE only · override dialog gone, confirm/attend plain, sick-leave override
  intact · no Teachers-page regression (`reorderMinor` still serves that page) · tsc + test + build clean.
- **TASK-032 → DONE**, superseding TASK-031. It's REQ-007's active task → **REQ-007 → SPEC_DONE** (→ @Porter
  for acceptance; ships on the next frontoffice deploy). Backend untouched.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-032 | scheduler-front: REQ-007 revised — hide-when-full + %-used strip; remove the override-to-book (reverts TASK-031) | SPEC-008 | ✅ **DONE** | Fern | — |
```
