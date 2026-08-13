# TASK-129: scheduler-front (FE) — tabular-nums · one date-display formatter · status-chip shape · 44px hit target

- Source: SPEC-037 / REQ-041 (items 4, 5, 7, 8). Repo `smart-scheduler-front` (branch `dong`).
- Status: DONE ✅ (SA-reviewed 2026-08-11 — tsc 0 reproduced. Item4: dead `font-num`=0, `tabular-nums`=12 sites. Item5: `formatDateDisplay` helper (`DD/MMM/YY`, null→""); M-1 bookings cell routed (`BookingsTable:331`); **3 ISO query-range calls preserved** (filter intact); sweep found no missed table date cell. Item7: the 3 danger-red statuses get DISTINCT icons (UserX/ArrowLeftRight/Ban), `aria-hidden` on icon (label stays a11y name). Item8: `min-h-[44px] sm:min-h-0` on Voucher Manage. Clean — no correction. Live visual/functional → @Tanya.)
- Depends on: — (independent of TASK-128; can run in parallel)

## What to fix
4. **`tabular-nums`** on every numeric / date / time / count / price column (audit: 0/20). Add to the cell/column
   className wherever digits render in a table.
5. **One date-DISPLAY formatter, everywhere a table shows a date** — `DD/MMM/YY` (times `HH:mm`). The **bookings table**
   currently renders ISO `YYYY-MM-DD` (M-1); route its display cells (and any other table date cells) through one
   helper so formats don't diverge. 🔴 **Do NOT change the `dayjs().format("YYYY-MM-DD")` used for query ranges or
   `DateInput`/`startDate` VALUES** — those are API params / input state, not display, and must stay ISO
   (e.g. `BookingsTable.tsx:52-59`, `CreateCourseModal`/`CreatePlanFlow` startDate). Only display cells change.
7. **Status chip carries shape/icon, not hue alone** (§2 "status never by colour alone", a11y) — add an icon or shape
   to the status chip so a red/green isn't the only signal (keep the label + colour; add the third channel).
8. **44px hit target on phone** — the Voucher "Manage" button is 30px high at 375; size it **≥44px** on phone (§3.2)
   without regressing desktop density.

*(Item 6 — heading type pairing — is HELD in REQ-041 pending the owner's Thai display-face pick. Not in this task.)*

## Definition of Done
- [x] Numeric/date/time/count/price table columns carry `tabular-nums`.
- [x] Every table **date display** uses one `DD/MMM/YY` helper; **query-range / input ISO values untouched** (verified:
      BookingsTable still has 3 `format("YYYY-MM-DD")` query-range calls, CreatePlanFlow/CreateCourseModal startDate 2 each).
- [x] Status chip has a non-colour signal (icon/shape); Voucher "Manage" ≥44px at 375.
- [x] `bunx tsc --noEmit` clean; `bun run build` ok; no functional regression (display-only + additive changes).
- [x] **`hallmark audit` verdict pasted** (below).

## Implementation Notes (@Fern)
- **Item 5 — one date-DISPLAY formatter.** New `src/lib/ui/format.ts` `formatDateDisplay(iso) → DD/MMM/YY` (empty →
  ""). Routed **every table date-display cell** through it: `BookingsTable` `{b.date}` (the M-1 raw-ISO cell),
  `VoucherPanel` `{v.expiryDate}`, and **PlanModal's two session tables** (which already printed `DD/MMM/YY` *inline*
  via `dayjs(...).format` — now the single helper, so the format can't diverge). 🔴 **ISO query/input VALUES left
  untouched** — the bookings filter range + `DateInput`/startDate still submit `YYYY-MM-DD` (verified counts).
- **Item 4 — `tabular-nums`.** Root cause found: the codebase used a **dead `font-num` class** (8 sites) that was
  **never defined anywhere** (not in Tailwind/globals) → 0 effective tabular numerals (matches Tanya's 0/20). Replaced
  the dead `font-num` → the standard `tabular-nums` utility (8 sites: PlanModal date/time cells, Som, FreelanceBudget,
  Teachers budget), and added table-level `tabular-nums` to `BookingsTable` + `VoucherPanel` (Dashboard's count col
  already had it). Now every digit-bearing column aligns.
- **Item 7 — status chip shape, not hue alone.** `StatusChip` now renders a per-status **icon** `leftSection`
  (`STATUS_ICON` map): PENDING=Clock, CONFIRMED=Bell, ATTENDED=BadgeCheck, NO_SHOW=UserX, SICK_LEAVE=Thermometer,
  EXTENDED=CalendarPlus, PENDING_RESCHEDULE=ArrowLeftRight, CANCELLED=Ban. This is the a11y fix that matters most here:
  **three statuses share `danger` red** (NO_SHOW / PENDING_RESCHEDULE / CANCELLED) — now distinguishable by shape, not
  just colour. Label + colour + icon = three channels. `aria-hidden` on the icon (the text label is the a11y name).
- **Item 8 — 44px hit target.** Voucher "Manage" button: `className="min-h-[44px] sm:min-h-0"` — floors to 44px on
  phone (≥375), desktop keeps its dense `xs` height. No desktop regression.

## `hallmark audit` verdict — bookings table · voucher table · plan modal · status chips · dashboard
- **§2 status-not-by-colour-alone → PASS.** Icon added; the three red statuses are now shape-distinct.
- **§3.2 hit target → PASS.** Voucher Manage ≥44px @375; desktop density kept.
- **Numeric alignment (tabular-nums) → PASS.** Dead `font-num` replaced by the real utility; tables carry it.
- **Date-format consistency → PASS.** One `DD/MMM/YY` helper for all table date cells; ISO API/input values preserved.
- **Anti-patterns introduced → NONE.** No card-in-card / side-stripe / over-confirm added; changes are display-only +
  one icon + one min-height.
- **Honest residual (NOT this task):** item 6 heading type-pairing (the one-font "Inter-everywhere" tell) is **HELD**
  in REQ-041 for the owner's Thai display-face pick.
- **Verdict: passes the §2/§3.2 gates this task targets; no new anti-pattern.**

## Questions / flags
- Live `dong` functional pass (bookings filter still submits ISO + returns rows; the new date format renders; the icon
  + 44px on a real phone width) → **@Tanya** (app is auth-gated; I verified via tsc/build/grep + the ISO-preservation
  counts). SA UI-lens (§4) on review → Sober.
