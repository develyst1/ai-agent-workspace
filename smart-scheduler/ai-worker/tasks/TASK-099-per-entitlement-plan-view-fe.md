# TASK-099: scheduler-front (FE) — the SHARED plan-modal component (used by both create & after-purchase)
- Source: SPEC-028 §6, §7, §8 (REQ-030 Req 6 & 8)
- Status: BLOCKED (on TASK-097, TASK-093, TASK-095)
- Depends on: TASK-097 (DTO), TASK-093 (`applyPlanChange`), TASK-095 (`GET /slots/availability`)
- Assignee: @Fern (smart-scheduler-front)

## What to build — ONE component, two modes (owner: "same modal, create vs update")
This is the **bulk** of the FE work and is reused by the purchase flow (TASK-098, create mode). Build it as a
single plan-modal component driven by a `mode: "create" | "edit"` prop:
- **The plan table** — rows of date·time·teacher·subject·status; the **derived end date** updates live.
- **Per-session editing** — change teacher/day/time; each edit shows the **availability + clash view** from
  `GET /slots/availability` (who's free at that slot, whose booking clashes) — needed in *both* modes.
- **mark planned absence** (extends), **insert a make-up** (contracts); attended sessions read-only.
- **Voucher variant** — no append/contract; sessions booked against hours + hours remaining.
- Every action (edit mode) calls the shared `applyPlanChange` (TASK-093). **On refusal, show the server's exact
  reason** (busy teacher, ceiling full, too-late teacher change, over-ceiling extend) — never silently drop it.

**Edit mode** entry point: the Bookings ▸ Courses + leave card → open one child's entitlement (course or voucher).

## Definition of Done
- [ ] Component renders + edits a plan (course and voucher) in **edit** mode from the entitlement card.
- [ ] The availability/clash view works at slot selection and is the same code the create flow will use.
- [ ] mark-absence extends, insert contracts, derived end updates; attended rows read-only; refusals show reasons.
- [ ] Cleanly exposes a **create** mode (renders a passed-in generated plan, confirm hook overridable) so TASK-098
      is a thin wrapper, not a second modal.
- [ ] tsc clean; build ok. Measure new shared-row controls at 1600/1280/768/375 (board STANDING RULE).
