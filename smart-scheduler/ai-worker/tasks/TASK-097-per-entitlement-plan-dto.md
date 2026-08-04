# TASK-097: scheduling (BE) — per-entitlement plan DTO (course + voucher)
- Source: SPEC-028 §7 (REQ-030 Req 8)
- Status: REVIEW (TASK-092 DONE)
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

## Implementation Notes
Read-only; no schema change. **One DTO shape** the FE renders for both a course and a voucher.

- **`getEntitlementPlan(id)` (`scheduler.service.ts`)** — looks the id up in `course_packages` first, else
  `vouchers`, else 404. Returns `{ kind, id, student, sessions[], liveEndDate, summary }`:
  - `sessions` = the entitlement's bookings (teacher+subject joined), `date · startTime · teacher · subject · status`.
  - **`liveEndDate` is DERIVED** each read via the pure `deriveLiveEndDate` (max date over LIVE sessions) — never
    the stored `expiryDate` (SPEC-028 §4). Course `summary.expiryDate` is exposed **only as the MAX_WEEK ceiling**,
    labelled as such.
  - **course** `summary`: `size · leaveUsed · leaveQuota · maxWeek · owedCount (= size − LIVE−DELIVERED) · expiryDate`
    (`toCourseSummary` + `courseCurrent`, no re-derived leave/ceiling math).
  - **voucher** `summary`: `totalHours · usedHours · hoursRemaining · expiryDate` — no append/contract (no `size`
    target; the bound is hours-remaining, already enforced elsewhere).
- **Route** `GET /entitlements/:id/plan`.
- **Pure `deriveLiveEndDate(sessions)`** in `lib/course-plan.ts` (unit-tested).

**Verification**
- `bunx tsc --noEmit` clean; `bun test` → **413 pass / 0 fail** (+2 `deriveLiveEndDate`: max over LIVE only —
  ignores delivered/cancelled/sick; null when nothing live). The endpoint's DB reads are by inspection
  (brownfield); the one piece of logic that could drift (the derived end) is pure-tested.

## Questions
- One shape, `kind`-discriminated `summary`, per the task's "one DTO the FE renders for both" — flag if you'd
  rather two endpoints. `owedCount` is `max(0, size − current)` so a (shouldn't-happen) over-target course reads 0
  rather than negative.
  > **answer (Sober): one shape is right** — the FE renders a single view for both (Req 8's intent); a `kind`
  > discriminator is the clean way, not two endpoints. `owedCount` clamp is correct.

## Review
**Verdict: DONE ✅** — Sober, 2026-08-03 (code-verified). Read `getEntitlementPlan` + `deriveLiveEndDate`, ran the
suite: `bunx tsc --noEmit` exit 0 · `bun test` **413/0** (`course-plan` 10/10, +2 derive cases).
- **`liveEndDate` is derived in BOTH branches** via `deriveLiveEndDate` (max over LIVE only, null when none) — never
  the stored `expiryDate`, which is exposed **only as the labelled ceiling** (`summary.expiryDate`). Matches SPEC §4.
- **One `kind`-discriminated DTO** (`course`/`voucher`) with the shared envelope `{id, student, sessions[],
  liveEndDate, summary}` — the FE renders one view for both (Req 8). Sessions joined+ordered via `toSessionRow`.
- **No second definition of the derived math** — reuses `toCourseSummary` + `courseCurrent`; `owedCount =
  max(0, size − current)`; voucher `hoursRemaining = totalHours − usedHours`, no append/contract (no `size` target).
- course-first → voucher → 404 dispatch. Clean. **DONE** — unblocks TASK-099 (the FE plan view).
