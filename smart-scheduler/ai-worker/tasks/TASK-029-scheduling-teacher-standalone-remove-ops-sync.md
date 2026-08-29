# TASK-029: scheduling — make teacher management standalone (remove ops teacher-sync + fix availability 500)
- Source: SPEC-007
- Status: DONE  (re-reviewed 2026-07-28 by Sober — §3 routing fix verified: tsc 0 + routing test 2/0 + full suite 102/0; see ## Review)
- Depends on: none
- Assignee: @Jason (smart-scheduler-back, port 4006)

## What to do
Teacher lifecycle ops in `src/services/scheduler.service.ts` call the backoffice ops teacher-sync, which is
now a dead route (REQ-006/TASK-027 retired all `ops` routes) → **502 + tx rollback** in prod. The ops party
sync is obsolete (freelance money is a local `bo.item` keyed by teacher id). Remove it so teacher CRUD is
fully local, retire the dead ops drift report, and fix a separate availability 500.

**1. Remove the 5 ops teacher-sync calls** (each wrapped in `opsSyncOr502(...)`). Delete only the ops call;
keep every other line of each function exactly as-is (subjects, future-booking guard, archived/active flags,
effective-month math):
- `createTeacher` — `:941` `opsSyncOr502(onboardOpsTeacher(...))`
- `updateTeacher` — `:974` `opsSyncOr502(updateOpsTeacher(...))` (name change) **and** `:975`
  `opsSyncOr502(switchTypeOpsTeacher(...))` (type change)
- `archiveTeacher` — `:1003` `opsSyncOr502(offboardOpsTeacher(...))`
- `reactivateTeacher` — `:1015` `opsSyncOr502(updateOpsTeacher(id,{active:true}))`
Then delete the now-unused `opsSyncOr502` helper (`:894`) and remove the imports it orphans
(`onboardOpsTeacher`/`updateOpsTeacher`/`offboardOpsTeacher`/`switchTypeOpsTeacher` from `lib/ops-client.ts`)
— **only if nothing else references them.** Do not touch unrelated ops-client fns (e.g. the booking-time
best-effort ones) unless they become orphaned by this change.

**2. Retire the ops drift report** — `reconcileTeachers` (`:1097`, `GET /api/teachers/reconcile`) calls
`fetchOpsPartyRefs`/`fetchOpsBudgetRefs`/`fetchOpsOpenSalaryRefs` and 502s when ops is gone. **Preferred:**
remove the route + the `reconcileTeachers` service + `reconcileTeacherDrift` usage and their orphaned
imports. If you'd rather keep the endpoint, make it return 200 with an empty/"ops retired" report — it must
never throw. Flag in `## Questions` if removing the route affects any FE caller.

**3. Fix `PATCH /api/teachers/availability` 500 (`{code:"INTERNAL"}`) — distinct, no ops call.**
`setAvailability` (`:839`) returns `rows.map(toTeacherDTO)`; `toTeacherDTO` (`src/db/mappers.ts:21–24`) does
an **unguarded** `ts.subject.id`/`ts.subject.name` → a `teacher_subjects` row with a null/absent joined
`subject` throws → 500. **Harden the mapper:** filter out / guard entries with no `subject`
(`(t.teacherSubjects ?? []).filter(ts => ts.subject).map(...)` or `ts.subject?.id`). This is the candidate
cause; the real prod stack trace is being fetched (SPEC-007 DATA REQUEST) to confirm — if it shows a
different cause, note it in `## Questions` and stop before over-fixing. The defensive mapper is correct to
ship regardless (an endpoint must not crash on a dangling subject row).

## Definition of Done
- [ ] With ops routes gone / `OPS_API_URL` unset / backoffice offline, teacher **create, edit
      (name+type), archive, reactivate** all succeed — **no 502, no ops-induced rollback**. A genuine DB
      error still rolls back (unchanged).
- [ ] `GET /api/teachers/reconcile` no longer throws when ops is gone (removed, or 200 no-op).
- [ ] `PATCH /api/teachers/availability` returns 200 for a teacher/type whose roster includes a
      dangling `teacher_subjects` row (add a test with a null-subject relation) — no 500.
- [ ] Existing behaviors preserved: archive-blocked-on-future-bookings (409), setup-incomplete gate,
      change-type effective-dating, soft-archive+reactivate. No orphaned/partial records.
- [ ] `bunx tsc --noEmit` clean; `bun test` green (update/remove any test that asserted the ops
      teacher-sync calls — e.g. `ops-client.test.ts` teacher-sync cases, if they exercise removed code).

## Implementation Notes

Removed the obsolete ops teacher-sync from all 5 sites + retired the drift report + hardened the DTO
mapper. Only the ops calls (and their now-orphaned imports/helpers) were touched; every other line of each
lifecycle function is unchanged (subjects, future-booking 409 guard, archived/active flags, tx).

**§1 — removed the 5 ops teacher-sync calls** (`src/services/scheduler.service.ts`):
- `createTeacher` — dropped `opsSyncOr502(onboardOpsTeacher(...))`.
- `updateTeacher` — dropped both `updateOpsTeacher` (name) + `switchTypeOpsTeacher` (type); also removed the
  now-unused `nameChanged`/`typeChanged`/`month` locals that only fed those calls.
- `archiveTeacher` — dropped `offboardOpsTeacher(...)` (kept `today` — still used by the future-booking guard).
- `reactivateTeacher` — dropped `updateOpsTeacher(id,{active:true})`; its tx wrapped a single update, so it's
  now a plain `db.update` (no behavior change).
- Deleted the orphaned `opsSyncOr502` helper and trimmed the orphaned imports it caused — `onboardOpsTeacher`,
  `updateOpsTeacher`, `offboardOpsTeacher`, `switchTypeOpsTeacher`, `fetchOpsPartyRefs`, `fetchOpsBudgetRefs`,
  `fetchOpsOpenSalaryRefs`, `reconcileTeacherDrift`, and `ApiException`. **Kept `recordSale`** (still used by
  course/voucher sale + `jobs.service.ts`). The ops-client fns themselves are untouched (still exported;
  `ops-client.test.ts` still exercises them).

**§2 — retired the drift report:** removed the `reconcileTeachers` service + the `GET /api/teachers/reconcile`
route (`src/routes/api.ts`). No FE caller — grep of `smart-scheduler-front/src` for `reconcile` → 0 hits (see
`## Questions`). No OpenAPI/contract entry existed for it.

**§3 — availability 500 fix:** `toTeacherDTO` (`src/db/mappers.ts`) now `.filter(ts => ts.subject)` before
mapping, so a dangling `teacher_subjects` row (null joined subject) is skipped instead of throwing on
`ts.subject.id`. This is the exact path behind `PATCH /api/teachers/availability` → `setAvailability` →
`rows.map(toTeacherDTO)`. Applied at the mapper so every teacher-listing endpoint is hardened.

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → clean (exit 0) — confirms no dangling refs to the removed symbols/route.
- `bun test` → **100 pass / 0 fail** (17 files). Added `mappers.test.ts` case: a roster with a null/undefined
  joined subject → `subjects` yields only the valid entry, no throw (the availability-500 repro at the mapper).
- ⚠️ **Not run against a live DB** (brownfield). The lifecycle changes are pure deletions of the ops call, so
  create/edit/archive/reactivate can no longer 502 on a dead/unset ops route; verified by inspection + tsc.
  Recommended deploy smoke: create → edit(name+type) → archive → reactivate a teacher with ops offline
  (`OPS_API_URL` unset) → all 200; toggle a teacher's availability whose roster has a stale subject → 200.

**DoD:** create/edit/archive/reactivate no longer call ops (no 502) ✓ · `GET /teachers/reconcile` retired ✓
(now 404 — see Q) · availability mapper hardened + unit test ✓ · 409-on-future-bookings / setup-incomplete
gate / soft-archive+reactivate preserved ✓ · tsc clean + `bun test` green ✓. Live-DB spot-checks = deploy-time.

---

### §3 REWORK (2026-07-28, Jason) — availability 500 was a route-shadow bug, not the mapper

Thanks Sober + the prod trace (`project-docs/prod-traces-…`) — confirmed the real cause and re-fixed:

- **Root cause:** in `src/routes/api.ts` the chained routes match in registration order, and
  `.patch("/teachers/:id")` was registered **before** the literal `.patch("/teachers/availability")` (and
  `.patch("/teachers/type-order")`). So `PATCH /teachers/availability` matched the param route →
  `updateTeacher("availability")` → `findFirst where id="availability"` → Postgres **22P02 invalid uuid** →
  500. The mapper never ran.
- **Fix (reorder only, no handler change):** moved the two literal `/teachers/<word>` PATCH routes to
  **above** `.patch("/teachers/:id")` (with a warning comment). `type-order` was shadowed the same way —
  fixed together. Removed their old (shadowed) registrations. The GET `/teachers/type-order` was never
  shadowed (no GET `/teachers/:id`) → left in place.
- **Kept** the §3 mapper filter (`.filter(ts => ts.subject)`) as defensive hardening per your review — it's
  harmless and correct, just not the fix.
- **Route-level test added** — `src/routes/api.teacher-routing.test.ts`: drives the real Hono app via
  `api.request("/teachers/availability", {method:"PATCH", …})` / `…/type-order` and asserts each dispatches
  to its own handler (200), not `updateTeacher(<word>)`. The service is stubbed via `mock.module` so dispatch
  is tested without a DB (this is what the earlier service-level test couldn't catch — it bypassed the router).
- **Re-verify:** `bunx tsc --noEmit` clean; `bun test` → **102 pass / 0 fail** (18 files).
- **Note (from your review, no action from me):** archive-502 in current prod is the OLD ops-live build's
  backoffice query erroring (`item_group` 42703 drift), not a 404 — §1 still fixes it once the ops call is
  gone; the TASK-027 re-deploy addresses the drift. §1/§2 code unchanged in this rework.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- Note: the availability-500 root cause is being confirmed via a DATA REQUEST (real stack trace + prod
  deploy state) in SPEC-007. Build the certain parts (§1, §2, the defensive mapper in §3) now; if the trace
  reveals the 500 is something else (e.g. a missing shared-DB migration), raise it here before adding more.
- **DATA REQUEST ANSWERED (Porter, from stakeholder prod logs 2026-07-28 →**
  `project-docs/prod-traces-2026-07-28-teacher-archive502-availability500.md`**):** the real traces
  **CONTRADICT the §3 diagnosis — @Sober please catch this in review before DONE:**
  > **Availability 500 = routing/UUID bug, NOT the mapper.** Trace (`som-back`):
  > `PATCH /api/teachers/availability` runs `select ... from teachers where id = $1` with **param
  > `id = "availability"`** → `invalid input syntax for type uuid: "availability"` (22P02). The request
  > is matched to a **by-id handler** with id="availability" — a dedicated `/teachers/availability` route
  > is missing or shadowed by `/teachers/:id`; the mapper never runs. **§3's `.filter(ts=>ts.subject)` is
  > harmless but does NOT fix this** — a routing fix is needed. SA to direct.
  > **Archive 502 = backoffice-back query error, NOT a 404 from retired routes.** Trace
  > (`backoffice-back` :4010): archive reaches the backoffice, which queries `ops.catalog_items` and fails
  > with **`column "item_group" does not exist`** (42703). So **prod runs the OLD ops-live build**
  > (ops reachable → create/edit work) with a **migration drift** (`0001_item_pl` not applied). **§1
  > (removing the ops teacher-sync call) STILL fixes archive-502** — good — but the "ops routes retired →
  > 404" premise is wrong for current prod; the re-deploy plan (TASK-027 `bo`/shared-DB) must account for
  > the drift. §1 + §2 look correct; only §3's target is wrong.
- **§2 — reconcile route: I chose REMOVE (your preferred), so `GET /api/teachers/reconcile` now returns 404**
  (not a 200 no-op). Verified no caller in `smart-scheduler-front/src` (grep `reconcile` → 0). OK to leave it
  a 404, or do you want the 200-empty-report shim instead? (I can add it in one line if a client polls it.)
- **§1 — type-change money is now a NO-OP locally (flag, kept in scope).** The removed `switchTypeOpsTeacher`
  used to close the old ops money on a FL↔FT/PT change. Per the task I removed **only** the ops call and did
  NOT add any local money handling — so a teacher who changes **away from FREELANCE keeps their freelance
  `bo.item` ceiling** (and one changing **into** FREELANCE has none until set via the admin UI, correctly
  gated by `setupIncomplete`). The stale-ceiling-on-FL→FT case looks like a possible follow-up (deactivate
  the `bo.item` when type leaves FREELANCE?), but it's out of TASK-029's "remove the ops leg" scope — routing
  to you rather than inventing it. Want a follow-up task?

## Review
**Verdict: REWORK 🔁 (Sober, 2026-07-28).** §1 + §2 are correct and verified; **§3 fixes the wrong root
cause** — the availability 500 is a routing bug the mapper filter doesn't touch. One scoped change needed.

**§1 (remove ops teacher-sync) — CORRECT ✅.** Verified `bunx tsc --noEmit` → exit 0 (no dangling refs to the
removed `opsSyncOr502`/imports), `bun test` → **100 pass / 0 fail**. The 5 sites are gone; lifecycle fns keep
their local logic (subjects, 409-future guard, archived/active flags, tx). The prod trace confirms archive-502
was the backoffice ops query erroring (`item_group` drift), so removing the call **does** fix archive. Good.

**§2 (retire `GET /teachers/reconcile`) — CORRECT ✅.** Removed route + service; grep confirms no FE caller.
> **answer (Jason's Q): 404 is fine — leave it.** No caller, no OpenAPI entry. Don't add the 200-shim.

**§3 (availability 500) — REWORK 🔁. Wrong target.** The DATA REQUEST trace (thanks Porter) proves it is a
**routing/path-param bug**, not the mapper:
- **Root cause (I verified in code):** `routes/api.ts:32` `.patch("/teachers/:id", updateTeacher)` is
  registered **before** `:75` `.patch("/teachers/availability", …)`. `PATCH /teachers/availability` matches
  the param route first → `updateTeacher("availability", …)` → `findFirst where id="availability"` →
  Postgres `22P02 invalid uuid` → 500. **The mapper never runs**, so §3's `.filter(ts => ts.subject)` cannot
  fix it (keep the filter — it's a fine defensive hardening — but it is NOT the fix).
- **Why the DoD test passed anyway:** the added test calls `setAvailability(...)` at the **service** layer,
  which bypasses the router. The bug lives in route dispatch, so a service-level test can't catch it.
- **Fix (do this):** make the literal `/teachers/<word>` PATCH routes win over the param route — either move
  `.patch("/teachers/:id", …)` to **after** all literal `/teachers/*` PATCH routes, or move
  `.patch("/teachers/availability", …)` (and see next bullet) **above** `:32`. Reorder only; no handler change.
- **Same latent bug — fix together:** `:46` `.patch("/teachers/type-order", …)` is **also** shadowed by
  `:32` `/teachers/:id` (→ `updateTeacher("type-order")`). Reorder it above the param route too.
- **Add a ROUTE-level test** (via the Hono app / `app.request('/api/teachers/availability', {method:'PATCH', …})`)
  asserting 200 (not 500) — this is what would have caught it; the service-level test stays but isn't sufficient.
- Re-run `bunx tsc --noEmit` + `bun test` and put it back to REVIEW.

**§1 type-change follow-up (Jason's Q) — good catch, out of scope here.** Removing `switchTypeOpsTeacher`
means a teacher who changes **away from FREELANCE keeps a dormant `bo.item` ceiling** (never drawn —
`reconcileFreelanceDraw` early-returns on non-FREELANCE — so no money leak, but it may show a stale budget on
the DTO). This is beyond REQ-005's "remove the ops leg". **I'm routing the business/cleanup decision to
@Porter** (should a FL→FT/PT change deactivate the freelance `bo.item`?) as a possible small follow-up REQ —
do **not** add it to this task. Nothing for you to do here now.

> **Net: fix §3's routing (+ type-order) + add the route-level test → REVIEW. §1/§2 stay as built.**

---

**Re-review verdict: DONE ✅ (Sober, 2026-07-28).** The §3 rework fixes the real (routing) cause.
- **§3 verified in code:** `routes/api.ts` now registers `.patch("/teachers/availability")` (:35) and
  `.patch("/teachers/type-order")` (:38) **before** `.patch("/teachers/:id")` (:41), with a warning comment
  (:33). The mapper `.filter(ts => ts.subject)` is kept as defensive hardening (correct to keep).
- **New route-level test** (`api.teacher-routing.test.ts`) drives the real Hono app via `api.request(...)`
  and asserts `PATCH /teachers/availability` dispatches to `setAvailability` (not `updateTeacher("availability")`)
  — exactly the dispatch check the service-level test couldn't make. Both routing cases asserted.
- **Verified myself (`H:\scheduler\smart-scheduler-back`):** `bunx tsc --noEmit` → 0; the routing test →
  **2 pass / 0 fail**; full suite → **102 pass / 0 fail** (18 files). §1/§2 unchanged, no regression.
- **All DoD met:** ops-sync removed (no 502) · `/teachers/reconcile` retired (404) · availability PATCH
  dispatches correctly (routing fixed) + mapper hardened · existing behaviors preserved · tsc + tests green.
- **Answered Jason's Qs:** §2 404 is fine (no shim). §1 type-change stale-`bo.item` — **promoted to REQ-009**
  by Porter (stakeholder confirmed: on FREELANCE→FT/PT, close the freelance budget + warn the admin) → NOT
  part of this task; no follow-up needed from you here.
- **TASK-029 → DONE.** It was REQ-005's only task → **REQ-005 → SPEC_DONE** (→ @Porter for acceptance). With
  TASK-028 also DONE, both pre-deploy blockers for the REQ-006 re-deploy are cleared.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-029 | scheduling: standalone teacher mgmt — remove ops teacher-sync (5 sites) + retire `reconcile` + fix availability 500 (routing) | SPEC-007 | ✅ **DONE** | Jason | — |
```
