# REQ-007: Freelance income-cap on the staff calendar — budget-fill color strip + auto-hide when full
- Status: READY_FOR_SA  (⚠️ REVISED 2026-07-28 — changes the already-built TASK-031; needs rework)
- Priority: MEDIUM
- Requested: 2026-07-26 by stakeholder; **REVISED 2026-07-28 by stakeholder (คุณฟีน)**
- Deadline: none
- Source: requirement hub UC-016. Builds on delivered REQ-001 (auto-disable at cap) / REQ-004.

## ⚠️ REVISION note (read first)
The first build (SPEC-008 / TASK-031, DONE) made over-cap freelances **stay bookable with a per-action
override**. **The stakeholder has corrected the intent (2026-07-28):** the point of the freelance income
ceiling is to **stop giving a full freelance more work** — so when a freelance's budget is **full, the
teacher must be HIDDEN from the calendar (auto-disabled, like an inactive teacher)**, not bookable-with-
override. This **supersedes** the earlier "show + keep bookable" reading (and the confirm/attend override
work). The **color strip stays** (with corrected %-based bands). The admin can still bring a full freelance
back via the existing top-up / limit-override on the Teachers page.

## Problem / Goal
On the staff calendar, staff can't see how "loaded" each freelance teacher is against their monthly income
ceiling. They want an at-a-glance color indicator of how much of the ceiling a freelance has taken, and — the
whole purpose of the ceiling — a freelance who has hit the ceiling should **drop off the calendar** so work
goes to others.

## Requirement
1. On the calendar, each **freelance** teacher column shows a **budget-fill color strip** reflecting **how
   much of their monthly ceiling is used** (higher use = "less available"):
   - 🟢 **green** — 0–30% used (plenty of budget left)
   - 🟡 **yellow** — 30–70% used
   - 🔴 **red** — 70 to <100% used (near the ceiling)
2. When a freelance is **full — budget 100% used, or the next booking's pay would exceed the ceiling — the
   teacher is HIDDEN from the calendar** (auto-disabled, like an inactive teacher): no column, not selectable
   in the booking/course-create flows. (This restores REQ-001's "auto-disable at cap".)
3. The admin can bring a hidden (full) freelance **back** by **topping up the budget or setting the
   limit-override** on the existing Teachers management page (no new surface) — or it returns automatically on
   the monthly budget reset.

## Acceptance Criteria
- [ ] A freelance's calendar strip is green at ≤30% used, yellow at 30–70%, red at 70–<100%.
- [ ] A freelance whose budget is full (or whose next booking would exceed the ceiling) is **not shown** on
      the calendar and cannot be selected for a new booking — same as an inactive teacher.
- [ ] Topping up the budget or setting the limit-override on the Teachers page makes the teacher reappear on
      the calendar (and the monthly reset does too).
- [ ] The strip/hide reflect the same budget the backend already computes (drawn at booking confirm) — FE and
      backend never disagree. No regression on the Teachers-page budget display.

## Constraints
- The freelance budget model (per-teacher monthly ceiling, drawn at booking confirm, admin top-up /
  limit-override, monthly reset) is already built (REQ-001/REQ-004). This REQ is **display (the color strip)
  + auto-hide-when-full** — reuse the existing budget/remaining/override the backend already ships.
- The **exact %-used thresholds** (green/yellow/red cut-offs) and the precise **"full" trigger** (remaining ≤ 0
  vs. "next session's pay would exceed remaining") are confirmed as the bands above; the SA maps them to the
  backend's `remaining`/`budget`/`overLimit` fields.
- Rework note: TASK-031 built (a) a color strip via a reorder-based tone and (b) over-cap-stays-bookable +
  override at confirm/attend. Keep the strip **but switch it to the %-based bands**, and **replace
  bookable+override with hide-when-full**. The confirm/attend override dialog is **removed** by this revision.
- Backend is source of truth; the FE strip/hide is display + gating only.

## Out of Scope
- Changing how the budget is set / reset / topped up, or the limit-override mechanism (already delivered).
- Freelance P&L / expense reporting; bulk actions (REQ-008).

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`. Per stakeholder: unclear / business call → write it
here and route `@Porter` before building — do not guess.)
- ~~Override at confirm vs PENDING-create~~ — **moot:** the override-to-book flow is removed; full freelances
  are hidden instead.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-007 | Freelance cap on the calendar — budget-fill color strip + auto-hide when full | MEDIUM | ✅ **DELIVERED** | **Live acceptance PASSED 2026-07-29** (stakeholder ran, Porter verified): freelance with budget shows the **%-used color strip** (🟢≤30/🟡30-70/🔴>70); a **full** freelance is **hidden** from the calendar (like inactive); **top-up / limit-override / monthly reset brings them back**. TASK-032 (revised, superseded TASK-031; hide-when-full + %-strip, override-to-book removed), FE-only, deployed to `smart-scheduler-front`. TASK-031 never shipped → no wrong behavior was ever live. |
```
