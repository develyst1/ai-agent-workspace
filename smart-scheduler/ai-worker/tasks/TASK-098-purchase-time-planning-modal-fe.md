# TASK-098: scheduler-front (FE) — purchase-time CREATE-mode wrapper (reuses TASK-099's component)
- Source: SPEC-028 §8 (REQ-030 — go-live scope)
- Status: BLOCKED (on TASK-099, TASK-095)
- Depends on: TASK-099 (the shared plan-modal component), TASK-095 (preview + `sessions[]` create)
- Assignee: @Fern (smart-scheduler-front)

## What to build — a THIN create wrapper, not a second modal
The purchase flow is the shared plan-modal (TASK-099) in **create mode**, plus the create-only chrome:
1. **Entry chrome:** student picker → course/program + **#weeks (size)** picker.
2. **Start date/time** selection → `POST /courses/preview` **generates** the initial `size`-row plan from nothing
   (the after-purchase editor loads existing rows instead — this generate step is the main create-only addition).
3. **Render the TASK-099 component** on that generated plan (same availability/clash view, same per-session edit,
   mark-absence, insert).
4. **Atomic confirm** → `POST /courses` with `sessions[]` (create = course row + N bookings in one tx). On refusal,
   show the server's reason; nothing is written until confirm succeeds.

⚠️ **Do NOT re-implement the plan table / availability view / editing** — reuse TASK-099's component. This task is
the picker + start-date/generate + create-confirm wiring only.

## Definition of Done
- [ ] The 5-step flow works end to end, reusing the TASK-099 component for steps 3–4 (no duplicated plan UI).
- [ ] Start-date selection generates the preview; editing/absence/insert reflect before confirm.
- [ ] A refused confirm shows the server's reason; nothing written on failure.
- [ ] tsc clean; build ok. Measure shared-row controls at 1600/1280/768/375 (board STANDING RULE).
