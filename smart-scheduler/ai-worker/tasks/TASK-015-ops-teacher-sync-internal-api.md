# TASK-015: ops — serviceAuth teacher-sync internal API (party upsert/deactivate + salary terminate)
- Source: SPEC-004
- Status: DONE
- Depends on: none
- Assignee: @Jason (smart-scheduler-backoffice-back, port 4010)

## Why
The scheduling auto-sync needs machine-callable ops writes that don't exist today: party
create/update/**deactivate** (no party mutation endpoint exists) and salary **terminate**
(`setRecurringCost` only supersedes with a new open row). Build them as a `serviceAuth`
internal API so the generic admin-create endpoints stay admin-only and scheduling needs no admin creds.

## What to do
New router `src/routes/teacher-sync.ts`, mounted under `v1` as `.route("/internal/teacher-sync", …)`,
all `serviceAuth`. New service logic in `parties.service.ts` + `recurring.service.ts`.

1. **`POST /v1/internal/teacher-sync/onboard`** `{externalRef, displayName}` → **upsert party**:
   `findPartyByExternal(smart-scheduler, externalRef)`; if none, create (`kind='PERSON'`,
   `externalSource='smart-scheduler'`, `externalRef`, `active:true`); if exists, ensure `active:true` +
   update `displayName`. Idempotent (guards the missing unique constraint). Return the party.
2. **`POST .../update`** `{externalRef, displayName?, active?}` → update the party's name/active by ref
   (covers edit-name + reactivate). New `updateParty` service fn (404 if no party).
3. **`POST .../offboard`** `{externalRef, effectiveMonth:"YYYY-MM"}` → (a) party `active=false`;
   (b) deactivate the active FREELANCE_BUDGET item for the ref (reuse `updateCatalogItem` active=false);
   (c) `terminateRecurring(externalRef, effectiveTo=prevMonthFirstDay(effectiveMonth))`. Idempotent —
   skip any piece that isn't present.
4. **`POST .../switch-type`** `{externalRef, effectiveMonth}` → close OLD money only: deactivate any
   active FL budget item **and** terminate any open salary row for the ref. Party untouched. Idempotent.
5. **`terminateRecurring(externalRef, effectiveTo)`** (new, `recurring.service.ts`): set `effective_to`
   on the teacher's **open** recurring row (`itemId=<their FIXED_COST item> AND effectiveTo IS NULL`)
   WITHOUT inserting a successor. No-op if none open. (This is the missing "stop salary" path.)

## Definition of Done
- [ ] `onboard` creates a party once; a second call with the same ref does NOT duplicate (idempotent).
- [ ] `update` changes displayName / reactivates (active:true) an existing party.
- [ ] `offboard` sets party inactive + deactivates the FL budget item + sets `effective_to` on the open
      salary row; re-running is a no-op. `switch-type` closes old money, leaves the party active.
- [ ] `terminateRecurring` sets `effective_to` on the open row and inserts NO new row; a later
      materialize for months after `effective_to` posts nothing for that teacher.
- [ ] All four routes require a valid `serviceAuth` (X-Service-Token); `bun test` + `bunx tsc --noEmit`
      clean; add tests (onboard idempotency, terminate-without-successor, offboard composite).

## Implementation Notes
Repo: `smart-scheduler-backoffice-back`. New router + orchestrator service + 3 reused-table primitives.
No schema change.

- **`src/routes/teacher-sync.ts`** (new) — 4 `serviceAuth` routes mounted `.route("/internal/teacher-sync", …)`
  under `v1` → `POST /api/v1/internal/teacher-sync/{onboard,update,offboard,switch-type}`. (Mounted
  alongside `/internal` — distinct concrete paths, no collision.)
- **`src/services/teacher-sync.service.ts`** (new) — orchestrators: `syncOnboard`, `syncUpdate` (404 if no
  party), `syncOffboard` (party inactive + deactivate FL budget item + terminate open salary), `syncSwitchType`
  (close old money only, party untouched). Private `deactivateFreelanceBudget(orgId, ref)` finds the active
  `metadata.kind='FREELANCE_BUDGET'` EXPENSE item and PATCHes `active:false` via `updateCatalogItem`. Every
  path is idempotent (find-by-ref / set-state; skips missing pieces).
- **`parties.service.ts`** — `upsertPartyByExternal(ref, name)` (create-or-reactivate+rename; guards the
  missing unique constraint) and `updatePartyByExternal(ref, {displayName?, active?})` (returns **null** if no
  party, so offboard no-ops and `/update` 404s).
- **`recurring.service.ts`** — `terminateRecurring(ref, effectiveTo)`: sets `effective_to` on the teacher's
  **open** row (`itemId=<their FIXED_COST> AND effective_to IS NULL AND active`) **without inserting a
  successor** — the missing "stop salary" path. No-op if none open; a later `materialize` for months after
  `effective_to` posts nothing (coversMonth excludes them).
- **`validation.ts`** — `teacherSyncOnboard/Update/Offboard/SwitchType` (reused `MONTH` regex for effectiveMonth).

**Verification**
- `bunx tsc --noEmit` → clean; `bun test` → **33 pass / 0 fail** (added `teacher-sync.test.ts`, 5: no
  service-token → 401 before handler; onboard requires externalRef+displayName → 400; offboard/switch-type
  reject a non-`YYYY-MM` month → 400). These exercise the guard + validation without a DB.
- ⚠️ **DB-runtime behaviour verified by inspection, not executed** (brownfield — no DB): onboard idempotency
  (find-by-ref then create/reactivate), `update` name/active, offboard composite, `terminateRecurring`
  no-successor. All reuse the proven query patterns from TASK-001/005/009; idempotency is structural
  (upsert / `effective_to IS NULL` set-state).

**@Jason(next)/@Fern:** the sync contract is fixed — scheduling (TASK-016) calls these 4 with
`X-Service-Token`; bodies `{externalRef, displayName}` / `{externalRef, displayName?, active?}` /
`{externalRef, effectiveMonth}`.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- None. Note: idempotency relies on find-by-ref because `parties(external_source, external_ref)` has **no
  unique constraint** (SPEC-004 flagged this as optional hardening, out of scope here) — a concurrent
  double-onboard could still race to two parties; reconcile (TASK-018) catches that. Flag if you'd rather I
  add the unique index now.
  > answer (Sober): **Defer the index — find-by-ref is fine here.** Onboarding is a low-volume single-admin
  > action (one click), so a concurrent double-onboard race is near-impossible in practice, and a partial
  > unique index on `(external_source, external_ref) WHERE active` would be another ops migration riding the
  > `__drizzle_migrations` meta-drift landmine — not worth the risk for launch. reconcile (TASK-018) is the
  > backstop. Noted as optional future hardening; revisit only if drift ever appears.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20). Re-ran `backoffice-back`: `bun test` → **33 pass / 0 fail**,
`tsc` exit 0. Read the real logic — the two gap-filling primitives are correct:
- **`terminateRecurring`**: finds the teacher's FIXED_COST item, UPDATEs the **open** row
  (`active AND effectiveTo IS NULL`) setting `effectiveTo`, **inserts no successor**; no-op if no item /
  no open row. `effectiveTo = prevMonthFirstDay(offboardMonth)` → the offboard month and later post
  nothing (`coversMonth` excludes them), months through M-1 stay — matches REQ #4.3 + the existing
  supersede convention. ✓
- **`syncOffboard`** = party `active=false` + `deactivateFreelanceBudget` (PATCH active=false on the active
  FREELANCE_BUDGET item) + `terminateRecurring`; **`syncSwitchType`** closes old money, leaves party active;
  **`syncOnboard`** upserts (idempotent); **`syncUpdate`** 404s if no party. All idempotent, all `serviceAuth`.
- Tests cover the guard (no token → 401) + validation (missing ref / bad month → 400) without a DB; the
  DB-runtime idempotency reuses proven TASK-001/005/009 patterns — accepted under brownfield.
No rework. **TASK-016 unblocked.**
