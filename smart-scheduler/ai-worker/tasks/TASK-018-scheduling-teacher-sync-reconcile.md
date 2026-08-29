# TASK-018: scheduling — teacher↔ops drift reconcile report
- Source: SPEC-004 (REQ-003 #5.2)
- Status: DONE
- Depends on: TASK-016
- Assignee: @Jason (smart-scheduler-back, port 4006)

## What to do
A lean, read-only drift check so admins can spot teacher↔backoffice inconsistencies. Files:
`src/lib/ops-client.ts`, `src/services/scheduler.service.ts`, `src/routes/api.ts`.

1. **`GET /teachers/reconcile`** (admin-guarded) → compares the two sides using existing public ops GETs
   (no new ops endpoint needed): 
   - ops parties: `GET /parties?externalSource=smart-scheduler` → set of `externalRef`.
   - ops money: budget items (`?itemType=EXPENSE`) + open salary rows (`/recurring-costs`).
   - scheduling: the teacher roster (incl. archived).
2. Report per category:
   - **missingParty**: active teacher with no ops party (should have been onboarded).
   - **orphanParty**: ops party whose `externalRef` matches no teacher.
   - **moneyForArchived**: an archived teacher still has an active budget item / open salary (offboard
     didn't fully close).
   - **incompleteActive**: active teacher with a party but no money (informational — same as `setupIncomplete`).
3. Return a structured `{missingParty[], orphanParty[], moneyForArchived[], incompleteActive[]}`.
   **Repair is manual for now**: re-running onboard (missingParty) / offboard (moneyForArchived) via the
   TASK-016 endpoints fixes drift. Note this in the response; a one-click repair can be a later task.

## Definition of Done
- [ ] `GET /teachers/reconcile` returns the four drift buckets from live ops + scheduling data.
- [ ] Read-only (no writes); tolerates ops being unreachable (clear error, no crash).
- [ ] `bun test` + `bunx tsc --noEmit` clean; a unit test for the diff logic (pure function over two sets).

## Implementation Notes
Repo: `smart-scheduler-back`. Read-only; no new ops endpoint (reuses public ops GETs).

- **`ops-client.ts`** — **throwing** GETs (unlike the best-effort helpers, so drift can't be masked by an
  empty response): `fetchOpsPartyRefs` (`GET /parties?externalSource=`), `fetchOpsBudgetRefs`
  (`GET /catalog/items?…&itemType=EXPENSE` filtered to `metadata.kind='FREELANCE_BUDGET'`),
  `fetchOpsOpenSalaryRefs` (`GET /recurring-costs?…` filtered to `effectiveTo=null`). All three throw on
  non-2xx / ops-off. Pure **`reconcileTeacherDrift(teachers, partyRefs, budgetRefs, salaryRefs)`** → the 4 buckets.
- **`scheduler.service.ts`** — `reconcileTeachers()`: fetches the three ops sets in parallel; if any throws
  → **`502 OPS_UNREACHABLE`** (clean, no false drift from empties); else loads the roster (incl. archived)
  and returns `{missingParty, orphanParty, moneyForArchived, incompleteActive, repairHint}`.
- **`api.ts`** — `GET /teachers/reconcile` (admin-guarded by the existing `/api` auth middleware), declared
  before the `:id` routes.

**Drift buckets:** `missingParty` (non-archived teacher, no ops party) · `orphanParty` (party ref with no
teacher) · `moneyForArchived` (archived teacher still has active budget/open salary) · `incompleteActive`
(non-archived, party, no money = `setupIncomplete`). Repair is **manual** (re-run onboard/offboard via the
TASK-016 endpoints) — a one-click repair can be a later task.

**Verification**
- `bunx tsc --noEmit` → clean; `bun test` → **83 pass / 0 fail** (added 5: `reconcileTeacherDrift` covering
  each bucket + clean teachers landing in none).
- ⚠️ The HTTP fetches + roster query are DB/network-runtime, **verified by inspection** (brownfield — no DB/
  ops); the diff logic is pure-unit-tested.

**Note (scope honesty):** `fetchOpsPartyRefs` uses the public `GET /parties` which lists **active** parties
only — sufficient for the orphan case we care about (a failed-onboard orphan party is active). A deactivated
party whose teacher was somehow removed wouldn't show as orphan, but teachers are never hard-deleted (archive
only), so that combination can't occur. Flagged for transparency.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- None. This is the last REQ-003 BE task; all four SPEC-004 backend pieces (015/016/018) are in.
  > answer (Sober): Ack the scope-honesty note — the public `GET /parties` listing **active** parties only
  > is sufficient here: a failed-onboard orphan party is active (so it's caught), and teachers are never
  > hard-deleted (archive only), so the "deactivated party whose teacher vanished" combination can't occur.
  > Correct reasoning, no gap.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20). Re-ran `smart-scheduler-back`: `bun test` → **83 pass / 0 fail**,
`tsc` 0. Read the pure `reconcileTeacherDrift` — every bucket is right: archived+money→`moneyForArchived`;
active+no-party→`missingParty`; active+party+no-money (FL⇒budget / FT-PT⇒salary)→`incompleteActive`;
party-ref+no-teacher→`orphanParty`. The three ops fetches **throw** (not best-effort) so the service returns
a clean `502 OPS_UNREACHABLE` rather than reporting false drift from empty responses. Read-only, admin-guarded,
`repairHint` points at the TASK-016 endpoints for manual repair. Diff logic unit-tested (5 cases); HTTP/DB
paths accepted under brownfield. No rework. **All REQ-003 backend (015/016/018) is DONE.**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-018 | scheduling: teacher↔ops drift reconcile report | SPEC-004 | DONE | Jason | TASK-016 |
```
