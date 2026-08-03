# TASK-097: scheduling (BE) — per-entitlement plan DTO (course + voucher)
- Source: SPEC-028 §7 (REQ-030 Req 8)
- Status: BLOCKED (on TASK-092)
- Depends on: TASK-092
- Assignee: @Jason (smart-scheduler-back)

## What to build
The read model behind the per-entitlement view — "what does this child have, and how do I move it?".
- **Course:** the plan as rows of `date · time · teacher · subject · status`, plus derived fields: **live end date
  = max(date) over LIVE sessions** (derived, not the stored `expiryDate`), `leaveUsed`/quota, `MAX_WEEK` ceiling,
  and the outstanding-owed count. Do NOT store the end date — derive it each read (SPEC-028 §4).
- **Voucher:** no recurrence — the "plan" is the sessions booked against the hours + **hours remaining**. Same
  view shape, no append/contract (a voucher has no `size` target; its bound is hours remaining, already enforced).
- One endpoint (e.g. `GET /entitlements/:id/plan`) or extend the course/voucher DTOs — SA-flexible, but **one DTO
  shape** the FE renders for both, so the view isn't two code paths.

## Definition of Done
- [ ] Course plan DTO returns per-session rows + derived live-end + quota/ceiling + owed count.
- [ ] Voucher plan DTO returns booked sessions + hours remaining.
- [ ] Live end date is derived from the sessions, never read from a stored field.
- [ ] `bunx tsc --noEmit` clean; `bun test` green.
