# TASK-005: ops — recurring FT/PT salary + shared month-start job (reset + materialize)
- Source: SPEC-002 (salary) + SPEC-001 (freelance reset)
- Status: DONE (code); deploy steps → Porter/human (migration apply + scheduled tasks)
- Depends on: TASK-001 (for the freelance reset part)
- Assignee: @Jason (smart-scheduler-backoffice-back + smart-scheduler-back)

## What to do

### A. ops — effective-dated recurring salary (SPEC-002)
Files: `src/db/schema.ts` (+ migration), `src/services/`, `src/routes/`.
1. **New table `ops.recurring_costs`** (see SPEC-002 Data Model): per-teacher,
   `amount_minor`, `effective_from` (month), `effective_to` (nullable), `active`,
   `party_id`, `item_id`, `metadata.teacherType`.
2. **`POST /api/v1/recurring-costs`** — set/change a salary: on change, **supersede**
   the prior open row (`effective_to` = month before new `effective_from`) and insert
   the new row. Create the teacher's `FIXED_COST` `catalog_item`
   (`track_stock=false`, `external_ref=teacherId`) on first set if absent.
   **`GET /api/v1/recurring-costs?externalSource=smart-scheduler`** — list + history.
3. **`POST /api/v1/internal/recurring/materialize`** — body `{month:"YYYY-MM"}`,
   service-token guarded. For each active recurring cost effective in `month`, post
   one `FIXED_COST` `OUT` movement, `amount_minor` = that month's effective salary,
   `idempotencyKey='salary:<partyId>:<month>'` (idempotent). Reads the effective row
   per month → past months always reflect the salary in effect then.

### B. shared month-start job (SPEC-001 reset + SPEC-002 materialize)
Add a monthly trigger (scheduling `POST /internal/jobs/month-start`, guarded by
`INTERNAL_JOB_SECRET`, or an ops equivalent — your call; keep it idempotent):
1. **Freelance reset**: for each `FREELANCE_BUDGET` item, `ADJUST reason='=monthlyBudgetMinor'`
   (P&L-neutral, `idempotencyKey='fl-reset:<teacherId>:<month>'`). Top-ups do NOT carry
   (overwrite semantics — REQ-001 #Q3).
   ⚠️ **From TASK-001 review:** `applyStockMovement` asserts `quantity > 0` (DB check
   `stock_movements_qty_chk`) and computes `amountMinor = amountMinor ?? quantity × salePriceMinor`.
   So the reset (and the TOPUP `IN` in TASK-003) MUST pass a **positive `quantity`** placeholder
   (e.g. `monthlyBudgetMinor`, or 1) **AND an explicit `amountMinor: 0`** — otherwise the stored
   ledger amount is a misleading `quantity × salePriceMinor`. (P&L stays correct regardless, since
   `getPLReport` never pulls ADJUST/TOPUP — but keep the ledger figure honest.)
2. **Salary materialize**: call `/internal/recurring/materialize` for the new month.
Document how the trigger is invoked monthly (Windows Task Scheduler, like the
existing end-of-day job).

## Definition of Done
- [ ] Setting a teacher's salary creates the schedule row + FIXED_COST item; a later
      change with a future effective month closes the old row and opens a new one.
- [ ] `materialize` for a month posts each FT/PT teacher's salary as a FIXED_COST
      expense in `/reports/pl` for that month; re-running does not double-post.
- [ ] Materializing a past month uses that month's effective amount (not the latest).
- [ ] Month-start job resets every freelance budget to its configured amount
      (top-ups cleared) and is idempotent per month.
- [ ] Migrations apply; repo tests pass; add a materialize idempotency + effective-
      date test.

## Implementation Notes
Built **entirely in `smart-scheduler-backoffice-back`** (port 3002) — see decision D1 below (the
month-start job lives in ops, not scheduling, since both halves are ops-owned; scheduling untouched).

**A. Effective-dated recurring salary (SPEC-002)**
- **New table `ops.recurring_costs`** (`schema.ts`) per the SPEC Data Model: `party_id` (nullable link),
  `item_id` (the FIXED_COST posting item), `label`, `amount_minor`, `effective_from`/`effective_to`
  (`date`, first-of-month), `active`, `metadata.teacherType`. Migration **`drizzle/0003_even_turbo.sql`**
  (see D3 — hand-trimmed).
- **`GET /api/v1/recurring-costs?externalSource=&externalRef=`** — list + history, newest effective_from
  first, joined to the item for `externalRef`/teacherType.
- **`POST /api/v1/recurring-costs`** (`adminAuth`) — `{externalRef, label?, amountMinor, effectiveFrom
  (YYYY-MM), teacherType?}`. First set creates the per-teacher FIXED_COST item (`SERVICE`/`FIXED_COST`/
  `track_stock=false`, `external_ref=teacherId`, `metadata.kind='FTPT_SALARY'`). A change **supersedes**
  the prior open row (`effective_to = prevMonthFirstDay(effectiveFrom)`) then inserts the new open row.
- **`POST /api/v1/internal/recurring/materialize`** (`serviceAuth`) — `{month}`. Posts one FIXED_COST
  `OUT` per teacher **whose window covers `month`** (`effective_from ≤ d AND (effective_to IS NULL OR ≥ d)`),
  `amount_minor` = that row's amount, `idempotencyKey='salary:<teacherId>:<month>'`. Reads the row in
  effect *for the target month* → past months use their own amount; re-run is idempotent (no double-post).

**B. Shared month-start job**
- **`POST /api/v1/internal/jobs/month-start`** (`serviceAuth`) — `{month}`: (a) resets every
  `FREELANCE_BUDGET` item via `ADJUST reason='=<monthlyBudgetMinor>'`, positive `quantity` placeholder +
  explicit `amountMinor:0` (per TASK-001 review), `idempotencyKey='fl-reset:<teacherId>:<month>'`
  (P&L-neutral, overwrite semantics — top-ups cleared); then (b) calls the materialize logic. Returns
  `{month, freelanceReset, salariesPosted}`. Idempotent per month.
- **Monthly trigger (Windows Task Scheduler, like the end-of-day job):** a scheduled task on the 1st of
  each month POSTs `/api/v1/internal/jobs/month-start` with `{"month":"YYYY-MM"}` and the `X-Service-Token`
  header, e.g. `schtasks /create /tr "curl -X POST .../internal/jobs/month-start -H \"X-Service-Token: %SVC%\" -d {...}" /sc MONTHLY /d 1`.
- Effective-dating logic extracted to a **pure `src/lib/month.ts`** (`monthFirstDay`, `prevMonthFirstDay`,
  `coversMonth`) so it's unit-testable without a DB.

**Verification**
- `bun run db:generate` produced the migration **offline (no DB connection)**; `bunx tsc --noEmit` → clean.
- `bun test` → **17 pass / 0 fail** (added `month.test.ts`, 6 cases: month math + Jan→Dec rollover +
  the supersede scenario proving a past month resolves to the amount in effect *then*, boundaries inclusive).
- ⚠️ **DB-runtime paths verified by inspection, not executed** (brownfield — no DB): table creation,
  set/supersede round-trip, materialize idempotency (`applyStockMovement` idempotencyKey — proven pattern
  from TASK-001), month-start reset. The core business rule (effective-date selection) is unit-tested purely.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- **D1 — month-start job placed in ops, not scheduling (your call in the task).** Both halves (freelance
  reset = ADJUST on ops items; salary materialize = ops) are ops-owned, so I put the whole job in ops
  (`/internal/jobs/month-start`) — no cross-repo call, scheduling untouched. OK? (SPEC-002 also lists it
  as ops-or-scheduling.)
  > answer (Sober): **OK — ops is the right home.** Both halves mutate ops items; keeping the whole
  > job in ops avoids a cross-repo call and a second secret. Scheduling stays untouched. Good call.
- **D2 — `party_id` nullable + idempotency keyed by `teacherId`, not `partyId`.** The freelance model is
  deliberately party-less (anchors on `catalog_items.external_ref=teacherId`). To stay consistent I made
  `recurring_costs.party_id` a **nullable best-effort link** (populated only if an ops party already exists)
  and keyed the salary movement `salary:<teacherId>:<month>` (teacherId = item `external_ref`), not
  `<partyId>` as the SPEC wrote. Functionally identical (one posting per teacher-month) and avoids
  auto-creating parties. Flag if you want real parties + partyId keys instead.
  > answer (Sober): **Keep `teacherId` keys + nullable `party_id`.** Consistency with the party-less
  > freelance anchor (`external_ref=teacherId`) matters more than matching the SPEC's `<partyId>` wording
  > — and not silently auto-creating parties is the right restraint (SPEC-002's `party_id` was always a
  > "best-effort link"). One posting per teacher-month is the invariant; you kept it. No change.
- **D3 — migration hand-trimmed (drizzle meta drift).** `db:generate` re-emitted `item_group`/`item_type`/
  `external_*`/`amount_minor` ADDs because the repo's drizzle snapshot was behind the real DB (the
  hand-patched 0001/0002 issue on the board). I trimmed `0003_even_turbo.sql` to only the new
  `recurring_costs` object so it won't collide on apply. **Applying (`db:migrate`) is integration's step —
  I can't run it (no DB).** The underlying meta-drift is the pre-existing infra item @Porter has flagged.
  > answer (Sober): **Accepted, and escalated as an integration gate — not code rework.** The migration
  > SQL is correct by inspection (creates only `recurring_costs` + its FKs/indexes). Trimming the stale
  > re-adds was the right move. But "migration applies cleanly" **cannot be closed by BE under the
  > brownfield rule**, and the shared `__drizzle_migrations` meta-drift between the two backends is a real
  > landmine at apply-time. I'm routing **migration application + the two scheduled-task setups** to
  > @Porter → human as an explicit **deployment/integration checklist** before REQ-001 can be DELIVERED
  > (see the board Blocked/waiting row + my log entry). The code is DONE; the *deploy* is a human step.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20) — code complete & correct. Re-ran `backoffice-back`:
`bun test` → **17 pass / 0 fail**, `tsc` → exit 0. Read the real logic:
- **Effective-dating correct** — `setRecurringCost` supersedes the prior open row at
  `prevMonthFirstDay(effectiveFrom)` and opens a new one; `materializeRecurring` selects the row
  *covering* the target month and is idempotent per `salary:<teacherId>:<month>`; a past-month
  re-materialize uses that month's amount, never a mutable "current". The pure `month.ts` helpers
  (Jan→Dec rollover, inclusive boundaries) are unit-tested. ✓
- **`runMonthStart`** resets `FREELANCE_BUDGET` items (`ADJUST '=budget'`, `amountMinor:0`, idempotent
  `fl-reset` key — exactly the TASK-001 review contract) then materializes salaries; each movement is
  its own idempotent tx so a partial run is safe to retry. ✓
- **FIXED_COST item** is `track_stock=false` (P&L posting only) — correct; lands in `byType[FIXED_COST]`.
- Minor nit (not rework): the migration made `organization_id` nullable though it's always set in code —
  harmless; tighten if the schema is ever regenerated.

**Two integration steps for the human (via @Porter) before this is deployable** — logged, not blocking
further build: (1) apply `drizzle/0003_even_turbo.sql` in the real env + reconcile the drizzle meta-drift;
(2) set up the two scheduled tasks — existing end-of-day (scheduling :3001) + new month-start (ops :3002).
**TASK-006 (Fern) is unblocked.**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-005 | ops: recurring FT/PT salary + shared month-start job (reset + materialize) | SPEC-002 | DONE | Jason | TASK-001 |
```
