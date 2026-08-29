# TASK-007: scheduling — end-of-day REVENUE tally (attended TRIAL + SINGLE only)
- Source: SPEC-001 / REQ-001 #5
- Status: DONE
- Depends on: TASK-001 (DONE — reuses ops recordSale / INCOME items)
- Assignee: @Jason (smart-scheduler-back, port 3001)

## Context (revenue decision — Porter/คุณฟีน 2026-07-20)
Revenue timing is **per booking type** (REQ-001 #5, no double-count):
- `COURSE_PACKAGE` / `VOUCHER` → revenue **at sale** (the existing `recordSale` on
  course/voucher creation) — **leave unchanged**; booking a session only consumes the
  prepaid entitlement.
- `FIRST_TRIAL` / `SINGLE_SESSION` → revenue **at attendance**, recognized by the
  **end-of-day job**. These aren't sold as packages and record **no** revenue today,
  so this is **additive** — no double-count, no deferred-revenue rework.

## What to do
Extend the end-of-day job (`src/services/jobs.service.ts` `runEndOfDayJob`) — after
its existing no-show cut — to recognize trial/single revenue. Also `src/lib/ops-client.ts`.

1. Select the run date's bookings with **`status='ATTENDED'`** and
   **`bookingType IN ('FIRST_TRIAL','SINGLE_SESSION')`**.
2. For each, post revenue via the existing `recordSale` path on a **per-type INCOME
   item**: externalRef **`first-trial`** or **`single-session`**, `quantity:1`,
   `refType:'SALE'`, `refId:<bookingId>`, `idempotencyKey:'rev:<bookingId>'`. Amount =
   the INCOME item's `sale_price_minor` (let `recordSale` default `amountMinor` to
   `quantity × salePriceMinor`; don't pass an explicit amount). → posts an INCOME `OUT`
   → revenue in `/reports/pl`.
3. **Idempotent + best-effort:** the `rev:<bookingId>` key makes a re-run safe (no
   double-post); if ops is off or the INCOME item isn't seeded (404), skip silently
   (same posture as the existing `recordSale`/`consumeTeacherHours` best-effort calls) —
   never fail the job.
4. Record a count in the `job_runs` summary (e.g. `revenuePosted`) alongside the
   existing `{noShow, coursesCut, vouchersCut}`.
5. Do **NOT** post revenue for `COURSE_PACKAGE`/`VOUCHER` at day-end, and do **NOT**
   touch freelance budgets/expense here (that's booking-time, TASK-002).

**Dependency note (seed, not code):** the `first-trial` and `single-session` INCOME
items (`item_group='SERVICE'`, `item_type='INCOME'`, **`track_stock=false`**,
`external_source='smart-scheduler'`, configurable `sale_price_minor`) must exist in ops
for revenue to post. They can be created via the Items screen or seeded with the real
prices (future DATA REQUEST). Because the call is best-effort, the job is safe before
they're seeded (revenue just posts 0/skips). Call this out; don't hardcode prices.

## Definition of Done
- [ ] End-of-day job posts one INCOME revenue movement per attended `FIRST_TRIAL` /
      `SINGLE_SESSION` booking of the date; `COURSE_PACKAGE`/`VOUCHER` post none at day-end.
- [ ] Re-running the job does not double-post (idempotency `rev:<bookingId>`).
- [ ] Revenue appears under `revenueMinor` / `byType[INCOME]` in `/reports/pl`.
- [ ] Job never fails when ops is off or the INCOME item is missing (best-effort skip).
- [ ] `bun test` + `bunx tsc --noEmit` clean; add a test (mock ops) asserting only
      TRIAL+SINGLE attended → `recordSale`, correct externalRef + idempotency key.

## Implementation Notes
Repo: `smart-scheduler-back` (port 3001). Files: `src/lib/ops-client.ts`, `src/services/jobs.service.ts`,
+ tests in `src/lib/ops-client.test.ts`.

- **`ops-client.ts`** — added pure `revenueItemRef(bookingType)`: `FIRST_TRIAL→'first-trial'`,
  `SINGLE_SESSION→'single-session'`, everything else → `null` (course/voucher recognise revenue at sale,
  never at day-end). Reused the existing `recordSale` (posts INCOME `OUT`, `refType:'SALE'`; amount
  defaults server-side to `quantity × sale_price_minor` — no hardcoded price).
- **`jobs.service.ts` (`runEndOfDayJob`)** — after the no-show cut, select the run date's bookings with
  `status='ATTENDED'` AND `bookingType IN ('FIRST_TRIAL','SINGLE_SESSION')`; for each, `recordSale(ref, 1,
  {refId:bookingId, idempotencyKey:'rev:<bookingId>'})`. Counts `revenuePosted` (successful posts) into the
  `job_runs` summary alongside `{noShow, coursesCut, vouchersCut, report}`. Best-effort + idempotent: a re-run
  hits the same `rev:<id>` key (no double-post); ops off / INCOME item missing (404) → skipped, job never fails.
  Freelance budgets/expense untouched here (that's booking-time, TASK-002).

**Dependency (seed, not code):** the `first-trial` / `single-session` INCOME items
(`item_group='SERVICE'`, `item_type='INCOME'`, `track_stock=false`, `external_source='smart-scheduler'`,
real `sale_price_minor`) must exist in ops for revenue to actually post — created via the Items screen or a
future seed/DATA REQUEST. The job is safe before they're seeded (best-effort skip). No prices hardcoded.

**Verification**
- `bunx tsc --noEmit` → clean (exit 0).
- `bun test` → **71 pass / 0 fail** (added 2 cases: `revenueItemRef` mapping incl. course/voucher→null,
  and `recordSale` posts INCOME `OUT`/`SALE` with `rev:<id>` key and **no explicit amount** so ops prices it).
- ⚠️ The job's DB query + end-to-end posting is DB-runtime, **verified by inspection**, not executed
  (brownfield: no DB). The type-mapping rule and the ops call contract are unit-tested (mock `fetch`).

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- None — implemented exactly to Porter's revenue-recognition decision (attended TRIAL+SINGLE only; additive).
  Note for @Porter's deploy gate: seed the `first-trial` / `single-session` INCOME items with real prices,
  else day-end revenue posts nothing (by design, safe).
  > answer (Sober): Noted — added the `first-trial`/`single-session` INCOME item seed to the deploy gate.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20) — **the final REQ-001 task.** Re-ran `smart-scheduler-back`:
`bun test` → **71 pass / 0 fail**, `tsc` exit 0. Read the real code (`jobs.service.ts` + `revenueItemRef`):
- Selects the run date's `status='ATTENDED'` AND `bookingType IN ('FIRST_TRIAL','SINGLE_SESSION')`;
  `revenueItemRef` maps those two → `first-trial`/`single-session`, **everything else → `null` → skipped**
  (course/voucher keep sale-time revenue — no double-count). ✓
- `recordSale(ref, 1, {refId, idempotencyKey:'rev:<bookingId>'})` — **no explicit amount** (ops prices it
  from the INCOME item), idempotent per booking, best-effort (`res.ok` gates the count; ops-off / missing
  item → skip, job never fails). `revenuePosted` folded into the `job_runs` summary. ✓
- Freelance budgets/expense untouched here — correct (booking-time, TASK-002). ✓
Matches SPEC-001's Revenue-recognition section exactly. DB-runtime posting verified by inspection under
brownfield; the type-mapping + ops contract are unit-tested. No rework.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-007 | scheduling: end-of-day REVENUE tally (attended TRIAL+SINGLE only) | SPEC-001 | DONE | Jason | TASK-001 |
```
