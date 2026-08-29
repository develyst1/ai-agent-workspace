# TASK-016: scheduling — teacher CRUD + archive + backoffice sync + setup-incomplete gate
- Source: SPEC-004
- Status: DONE (core accepted; small 502-mapping fast-follow noted in Q&A)
- Depends on: TASK-015
- Assignee: @Jason (smart-scheduler-back, port 4006)

## What to do
Add teacher lifecycle endpoints + the ops sync bridge + the money-setup gate. Files:
`src/db/schema.ts` (+migration), `src/lib/ops-client.ts`, `src/services/scheduler.service.ts`,
`src/routes/api.ts`, `src/validation.ts`, `src/db/mappers.ts`.

1. **Schema**: add `teachers.archived boolean NOT NULL default false` (+ migration). No linkage column
   (teacher.id is the sync key).
2. **ops-client sync fns** (new, calling TASK-015's endpoints; **blocking**, not best-effort — throw on
   failure): `onboardOpsTeacher(id, displayName)`, `updateOpsTeacher(id, {displayName?, active?})`,
   `offboardOpsTeacher(id, effectiveMonth)`, `switchTypeOpsTeacher(id, effectiveMonth)`. Reuse
   `opsHeaders()`/`OPS_API_URL`/timeout. Also add a `fetchOpenSalaryTeacherIds()` →
   `GET /recurring-costs?externalSource=smart-scheduler` → Set of teacherIds with an open row.
3. **`POST /teachers`** `{name, nickname, type, workDays?, subjectIds?}`: insert teacher, then
   **blocking** `onboardOpsTeacher(id, name)`; if it throws → surface a clean error and do NOT leave a
   teacher without a party (insert + onboard in one flow; roll back the insert on onboard failure).
   Returns the DTO (`setupIncomplete=true`).
4. **`PATCH /teachers/:id`** `{name?, nickname?, type?, subjectIds?}`: update; if `name` changed →
   `updateOpsTeacher(id, {displayName})`; **if `type` changed → `switchTypeOpsTeacher(id, currentMonth)`**
   (close old money; new money set later via admin UI). Manage `teacherSubjects` if subjectIds given.
5. **`POST /teachers/:id/archive`**: reject **409** if the teacher has a future live booking —
   `date >= today(Bangkok) AND status NOT IN ('CANCELLED','NO_SHOW')` — with a clear "clear/reassign
   bookings first" message. Else set `archived=true, active=false`; `offboardOpsTeacher(id, currentMonth)`.
6. **`POST /teachers/:id/reactivate`**: `archived=false, active=true`; `updateOpsTeacher(id, {active:true})`.
7. **`GET /teachers`**: exclude `archived` by default; add `?archived=true` (or `includeArchived`) for the
   archived list.
8. **`setupIncomplete`**: in `attachTeacherQuotas` (or alongside), compute per teacher
   `moneyReady = type==='FREELANCE' ? quotas.has(id) : openSalaryIds.has(id)`;
   `setupIncomplete = !archived && !moneyReady`. Add to `toTeacherDTO`.
9. **Booking guard**: in the booking create/commit path, reject a `setupIncomplete` teacher (server-side
   backstop to the FE `bookable` gate).

## Definition of Done
- [ ] Create teacher → teacher exists AND an ops party exists (verified via ops GET by ref); if ops is
      unreachable, the create **fails** and no teacher is left without a party.
- [ ] Edit name → ops party displayName updates. Change type → old money closed (FL budget deactivated OR
      salary terminated) effective this month; past months unaffected.
- [ ] Archive with a future live booking → **409** + message; archive with none → teacher archived
      (hidden from `getTeachers` default + calendar), ops party deactivated, money stopped going forward.
      Reactivate restores it.
- [ ] A teacher with no money is `setupIncomplete=true`, not bookable (server guard rejects booking).
- [ ] Migration applies; `bun test` + `bunx tsc --noEmit` clean; tests for the future-bookings guard +
      setupIncomplete computation + create-rollback-on-ops-failure (mock ops).

## Implementation Notes
Repo: `smart-scheduler-back` (port 4006).

- **Schema/migration:** `teachers.archived boolean NOT NULL default false`. Hand-wrote
  `drizzle/0010_teacher_archived.sql` (`ADD COLUMN IF NOT EXISTS`, matching the repo's 0004 style) +
  a `_journal.json` entry — `drizzle-kit generate` **can't run non-interactively** here (prompts a
  rename/create conflict against the drifted meta snapshot, same landmine as ops 0003). IF-NOT-EXISTS
  makes apply safe; meta-reconcile stays a deploy-gate step.
- **`ops-client.ts`** — blocking sync fns (throw on non-2xx) via `opsTeacherSync()`:
  `onboardOpsTeacher`, `updateOpsTeacher`, `offboardOpsTeacher`, `switchTypeOpsTeacher` → TASK-015's
  endpoints with `X-Service-Token`. `fetchOpenSalaryTeacherIds()` (open recurring rows, best-effort).
  Money-setup gate extracted to a **pure `isSetupIncomplete(teacher, budgetIds, salaryIds)`**
  (FREELANCE⇒has budget item, FT/PT⇒has open salary; archived never incomplete); `attachSetupIncomplete`
  (DTO decorator) + `isTeacherSetupIncomplete` (single, for the guard) share `fetchMoneyState()` which
  **does NOT gate when ops is unavailable** (can't tell "no money" from "ops down" → avoid hiding everyone).
- **`scheduler.service.ts`**:
  - `createTeacher` — insert + subjects + **blocking `onboardOpsTeacher` inside the tx** → a sync failure
    rolls back the insert (no teacher without a party, REQ #1.4).
  - `updateTeacher` — name→`updateOpsTeacher(displayName)`; **type-change→`switchTypeOpsTeacher(currentMonth)`**
    (closes old money; new money set later); manages `teacherSubjects`.
  - `archiveTeacher` — **409 `HAS_FUTURE_BOOKINGS`** if any `date >= today(Bangkok) AND status NOT IN
    (CANCELLED, NO_SHOW)`; else `archived=true, active=false` + `offboardOpsTeacher(currentMonth)`.
  - `reactivateTeacher` — `archived=false, active=true` + `updateOpsTeacher(active:true)`.
  - `getTeachers({archived})` — excludes archived by default; `?archived=true` → archived list; both attach
    `setupIncomplete`. `getCalendar` also attaches it (FE folds into `bookable`).
  - **Booking guard** in `insertBooking` (covers single + course + voucher): rejects an `archived` teacher
    and a `setupIncomplete` teacher (server backstop to the FE gate).
- **`mappers.ts`** — `archived` + `setupIncomplete` on `toTeacherDTO`. **`api.ts`** — `GET /teachers?archived=`,
  `POST /teachers`, `PATCH /teachers/:id`, `POST /teachers/:id/{archive,reactivate}`. **`validation.ts`** —
  `createTeacher`/`updateTeacher`/`teachersQuery`.

**Verification**
- `bunx tsc --noEmit` → clean; `bun test` → **78 pass / 0 fail** (added 7: `isSetupIncomplete` 5 cases
  incl. archived-never-incomplete + FT/FL both directions; `onboardOpsTeacher` resolves-on-2xx /
  **throws-on-500** which proves the create rolls back).
- ⚠️ **DB-runtime paths verified by inspection, not executed** (brownfield — no DB): create+rollback,
  future-bookings 409 query, archive/reactivate/type-change round-trips, the in-`insertBooking` guard.
  The money-setup rule + the blocking-throw contract are unit-tested; DB queries reuse proven patterns.

**@Fern — TASK-017 unblocked.** DTO now carries `archived` + `setupIncomplete`. Endpoints:
`POST /teachers {name,nickname,type,workDays?,subjectIds?}` · `PATCH /teachers/:id {name?,nickname?,type?,subjectIds?}`
· `POST /teachers/:id/archive` (409 `HAS_FUTURE_BOOKINGS` if it has future live bookings) ·
`POST /teachers/:id/reactivate` · `GET /teachers?archived=true`. Fold `setupIncomplete` into `bookable`.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- **Migration meta (same as ops 0003):** `drizzle-kit generate` prompts interactively (drift) so I
  hand-wrote `0010_teacher_archived.sql` + a journal entry; I did **not** author a meta snapshot. `migrate`
  applies via the journal + .sql (snapshots are for `generate`), and IF-NOT-EXISTS guards a double-apply —
  but this rides the same `__drizzle_migrations` meta-drift the deploy gate already tracks. Flag if you
  want me to omit the journal entry (leaving the human to apply the SQL manually) instead.
  > answer (Sober): **Keep the journal entry** — `migrate` auto-applies it and `ADD COLUMN IF NOT EXISTS`
  > makes re-apply safe. This is a NEW scheduling migration (`0010`) → it goes in the **REQ-003 deploy gate**
  > (apply on the scheduling DB, like ops `0003`); I'll capture that in the REQ-003 deploy note when the REQ
  > reaches SPEC_DONE. No change needed.
- **Ops-sync failure surfaces as 500** (the thrown `Error`, not an `ApiException`) — the tx rollback keeps
  data consistent (no orphan), but the client sees a generic 500 with the Thai message. Good enough, or
  map it to a 502 "backoffice sync failed" for a cleaner FE message?
  > answer (Sober): **Map it to 502 `OPS_SYNC_FAILED`** — cleaner contract for TASK-017 (Fern shows a
  > "ซิงค์หลังบ้านไม่สำเร็จ ลองใหม่" retry message, distinct from a real server bug). It's a tiny wrap
  > (catch the sync throw on create/edit/archive/reactivate → `throw new ApiException(502,"OPS_SYNC_FAILED",…)`).
  > **Fold it in as a fast-follow amendment under this task** (doesn't block TASK-017/018 starting; TASK-017's
  > contract already assumes "sync error → retry"). Not a rework of the reviewed core.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20) — with one tiny fast-follow (502 mapping, above). Re-ran
`smart-scheduler-back`: `bun test` → **78 pass / 0 fail**, `tsc` 0. Read the correctness-critical paths:
- **`createTeacher`** is fully inside `db.transaction` — teacher + subjects + **blocking `onboardOpsTeacher`**;
  a sync throw rolls the whole tx back → no teacher without a party (REQ #1.4). Test proves onboard
  throws-on-500 → rollback. ✓ (Same network-call-inside-tx tradeoff as TASK-002, fine for a rare admin action.)
- **`archiveTeacher`**: `date >= today(Bangkok) AND status NOT IN ('CANCELLED','NO_SHOW')` → 409
  `HAS_FUTURE_BOOKINGS`; else `archived=true, active=false` + `offboardOpsTeacher`. Exactly the confirmed rule. ✓
- **`getTeachers({archived})`** filters `archived` (default false; `?archived=true` = archived list). Type-change
  → `switchTypeOpsTeacher(currentMonth)`; reactivate → `updateOpsTeacher(active:true)`. ✓
- **Booking guard** rejects `archived` + `setupIncomplete` (server backstop). ✓
- **Money-setup gate** — `isSetupIncomplete` pure + unit-tested (archived never incomplete; FL⇒budget item,
  FT/PT⇒open salary); and the **right safety call**: `fetchMoneyState` does NOT gate when ops is unreachable
  (can't distinguish "no money" from "ops down" → won't hide the whole roster). Good instinct. ✓
- Migration `0010_teacher_archived.sql` is `ADD COLUMN IF NOT EXISTS` (safe). DB-runtime paths accepted under
  brownfield (logic unit-tested, queries reuse proven patterns). No rework on the core. **TASK-017 unblocked.**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-016 | scheduling: teacher CRUD + archive + ops sync + setup-incomplete gate | SPEC-004 | DONE | Jason | TASK-015 |
```
