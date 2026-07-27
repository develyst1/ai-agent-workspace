# Board — smart-scheduler

> Single source of truth. Update me at the end of every session (see PROTOCOL.md).

## Project info

- Description: Smart Scheduler — scheduling + back-office ERP for a balance/wheeled
  sports activity center (replaces manual Excel + Alis To Soft).
- Code repository (monorepo root): `C:\Users\Admin\develyst\smart-scheduler`
  - `smart-scheduler-back` — scheduling API, Bun + Drizzle, **port 4006** (~75%) → Jason
  - `smart-scheduler-front` — staff calendar UI, Next.js, **port 3016** (~70%) → Fern
  - `smart-scheduler-backoffice-back` — ops/finance API (`ops` schema), **port 4010** → Jason
  - `smart-scheduler-backoffice-front` — admin ERP/money UI, Next.js, **port 3018** → Fern
    (**NOT 0%** — P&L dashboard + Items CRUD already built; backoffice pivoted to an
    item-centric P&L model, wallet/payroll set aside — see `project-understanding.md` §6)
- **Read first**: `ai-worker/project-understanding.md` (as-built map of all 4 repos,
  2026-07-20), then the monorepo root `CLAUDE.md` and `docs/` (business-domain,
  product-catalog-pricing, teacher-roster-payroll, monorepo-overview,
  requirement-timeline — newest entry wins). Older docs saying "tutoring school"
  are wrong — the real business is sports/balance programs.
- DB: one PostgreSQL — `public.*` (scheduling, owned by back) + `ops.*` (finance,
  owned by backoffice-back). The DATA REQUEST rule applies to **real/production
  data and live environments**; reading schema from the repos' Drizzle files is fine.
- Team: Porter (PM) · Sober (SA Lead) · Jason (BE) · Fern (FE)

## Requirements

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-001 | Freelance pay as monthly budget-stock + auto-disable at cap | HIGH | ✅ **DELIVERED** | Live & confirmed by คุณฟีน 2026-07-20 (freelance cap shows on frontoffice; budgets/salaries/P&L working). **Remaining ops (non-blocking):** register 2 scheduled tasks + swap placeholder→real numbers. |
| REQ-002 | Backoffice admin authentication (login + real JWT) | HIGH | ✅ **DELIVERED** | Live & confirmed 2026-07-20 — admin login works, auth enforced (`SKIP_ADMIN_AUTH=false`). |
| REQ-003 | Unified teacher onboarding/offboarding — one action, auto-synced both systems | HIGH | ⏸️ **ON HOLD** | **Do NOT deploy** (built, but its backoffice sync is moot — backoffice is being torn down). Rework the teacher-management parts as standalone under a later REQ. |
| REQ-004 | Move freelance limit into the frontoffice — standalone, no backoffice dependency | HIGH | ✅ **DELIVERED** | Deployed & confirmed working by คุณฟีน 2026-07-20. Freelance limit now standalone in the frontoffice. |
| REQ-005 | Standalone teacher management (rework REQ-003 minus ops sync) | MEDIUM | DRAFT | Porter — confirm scope/priority with คุณฟีน (not urgent: REQ-003 is undeployed, so no live 502). May be absorbed by the backoffice rebuild (REQ-006). |
| REQ-006 | Backoffice rebuild — universal "item" model on the shared DB | HIGH | **SPEC_DONE (fix applied) → re-deploy** | DB-topology bug FIXED (**TASK-027 DONE**): backoffice-back `.env`→`smart_scheduler`, `migrate-to-bo` ops-optional, ops routes retired (only `/auth`+`/bo`). Code is now shared-DB-correct. **Porter/human — re-deploy:** on `smart_scheduler`, apply `bo` 0004 → `bun run migrate:bo` (ops-optional now) → restart both on `smart_scheduler` → re-enter budgets via FE. **Follow-ups:** re-home TRIAL/SINGLE revenue → `bo` (ops retired = no-op now); 2 pre-deploy fast-follows (tag prefill; migration spot-check). |

> ⚠️ **STRATEGIC PIVOT (2026-07-20, คุณฟีน):** current **backoffice is being torn down &
> rebuilt from scratch** (hard to use / not scalable). Finish the **frontoffice first,
> stand-alone**. Freelance limit → moves into frontoffice (REQ-004). Freelance **P&L/expense
> + FT/PT salary = deferred** to the new backoffice. REQ-003 (teacher↔ops sync) ON HOLD.
> REQ-001/002 stay DELIVERED but their backoffice-side money features are superseded by the rebuild.

> SPECs written 2026-07-20: **SPEC-001** (freelance budget-stock, booking-time cap
> & expense) + **SPEC-002** (FT/PT recurring effective-dated fixed-cost salary),
> both from REQ-001. 6 buildable tasks cut; TASK-007 (day-end revenue) blocked on
> a revenue-recognition question to Porter (does NOT block the other 6).

> Decision (2026-07-20, คุณฟีน): backoffice = **Path A, item-centric P&L**. No full
> payroll engine, no student hour-wallet. Freelance pay = per-teacher monthly
> "budget-stock" drawn down at the end-of-day cut → auto-disable at cap. Full/part-time
> = manual `FIXED_COST`. See REQ-001 + `project-understanding.md` §6.

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | ops: reversible P&L expense + allowNegative + freelance-budget item | SPEC-001 | DONE | Jason | — |
| TASK-002 | scheduling: freelance draw-down at booking + reversal on cancel/leave | SPEC-001 | DONE | Jason | TASK-001 |
| TASK-003 | backoffice-front: "Freelance Budgets" screen (list/create/top-up/display) | SPEC-001 | DONE | Fern | TASK-001 |
| TASK-004 | scheduler-front: baht remaining/budget + near-cap warning + real-time hide | SPEC-001 | DONE | Fern | TASK-008 |
| TASK-005 | ops: recurring FT/PT salary + shared month-start job (reset + materialize) | SPEC-002 | DONE | Jason | TASK-001 |
| TASK-006 | backoffice-front: "FT/PT Salary" admin screen (effective-dated) | SPEC-002 | DONE | Fern | TASK-005 |
| TASK-007 | scheduling: end-of-day REVENUE tally (attended TRIAL+SINGLE only) | SPEC-001 | DONE | Jason | TASK-001 |
| TASK-008 | scheduling: teacher DTO budget fields + persist limit-override | SPEC-001 | DONE | Jason | TASK-002 |
| TASK-009 | ops: PATCH /catalog/items/:id (edit item) | SPEC-001 | DONE | Jason | TASK-001 |
| TASK-010 | backoffice-front: Edit modal for Freelance Budgets | SPEC-001 | DONE | Fern | TASK-009 |
| TASK-011 | align cross-service port config to real map (ops-back :4010, ops-front :3018) | SPEC-001 | DONE | Jason | — |
| TASK-012 | ops: seed first-trial / single-session INCOME items (day-end revenue) | SPEC-001 | DONE | Jason | TASK-007 |
| TASK-013 | ops: admin login endpoint + real JWT verification (mirror scheduling) | SPEC-003 | DONE | Jason | — |
| TASK-014 | backoffice-front: login page + cookie session + proxy.ts guard + logout | SPEC-003 | DONE | Fern | TASK-013 |
| TASK-015 | ops: serviceAuth teacher-sync API (party upsert/deactivate + salary terminate) | SPEC-004 | DONE | Jason | — |
| TASK-016 | scheduling: teacher CRUD + archive + ops sync + setup-incomplete gate | SPEC-004 | DONE | Jason | TASK-015 |
| TASK-017 | scheduler-front: teacher add/edit/change-type/archive UI + setup-incomplete gate | SPEC-004 | DONE | Fern | TASK-016 |
| TASK-018 | scheduling: teacher↔ops drift reconcile report | SPEC-004 | DONE | Jason | TASK-016 |
| TASK-019 | scheduling: local freelance budget (re-home from ops, standalone) | SPEC-005 | DONE | Jason | — |
| TASK-020 | scheduler-front: frontoffice freelance budget admin (set/edit/top-up) | SPEC-005 | DONE | Fern | TASK-019 |
| TASK-021 | backoffice-back: `bo` schema + migration (item/movement/tags) | SPEC-006 | DONE | Jason | — |
| TASK-022 | backoffice-back: universal item/movement/tag API + P&L report (single-admin JWT) | SPEC-006 | DONE | Jason | TASK-021 |
| TASK-023 | backoffice-front: admin UI on the universal item model | SPEC-006 | DONE | Fern | TASK-022 |
| TASK-024 | scheduling: re-absorb freelance ceiling as a `bo.item` (in-tx, unit=hour) | SPEC-006 | DONE | Jason | TASK-021 |
| TASK-025 | backoffice-back: data migration `ops.*` + `freelance_budgets` → `bo.*` | SPEC-006 | DONE | Jason | TASK-021 |
| TASK-026 | scheduler-front: re-point freelance budget admin at `bo`-backed data | SPEC-006 | DONE | Fern | TASK-024 |
| TASK-027 | backoffice-back: shared-DB topology fix (`bo` in `smart_scheduler`; migrate ops-optional; retire ops routes) | SPEC-006 | DONE | Jason | TASK-025 |
| TASK-028 | scheduling: freelance-drawdown idempotency — reconcile-to-target invariant (fixes the REQ-006 bug + latent REQ-004) | SPEC-006 | **BLOCKED** (Porter: NO_SHOW) | Jason | TASK-024 |

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| 🐛 REQ-006 BUG — freelance drawdown not idempotent | Sober → Jason (TASK-028, UNBLOCKED) | **Business rule ANSWERED by คุณฟีน 2026-07-20 — state machine locked:** CONSUMING (held=1, pay the freelance) = **CONFIRMED, ATTENDED, SICK_LEAVE**; RELEASING (held=0, don't pay) = **NO_SHOW, CANCELLED**. ⚠️ **This CHANGES REQ-004's behavior:** SICK_LEAVE now **keeps** the drawdown (was refunding) — TASK-028 must flip that. Fix = Sober's reconcile-to-target invariant (`held∈{0,1}` from net `bo.movement(ref=booking)`; post `delta=target(status)−held` on every change; no-op at target; `remaining≤ceiling`). @Sober: fold the confirmed rule in + release TASK-028 to Jason. REQ-006 NOT delivered until it lands. |
| ~~REQ-001/002 acceptance blockers (auth 403, cap not showing)~~ | ✅ RESOLVED | Both fixed 2026-07-20 (auth deployed; `OPS_API_URL` `/api` typo corrected). REQ-001 + REQ-002 DELIVERED. |
| **Scheduled tasks not yet set up** | Human | 2 jobs to register on the Windows server: end-of-day (:4006 nightly) + month-start (:4010, 1st). **Step-by-step guide written: `smart-scheduler/DEPLOY-scheduled-tasks-windows.md`** (endpoints verified from code). Non-blocking for interactive use. |
| Real numbers (placeholders live) | พี่ฟีน → Porter | Placeholders in use (FL 70k@500, FT 50k, PT 15k, Trial/Single 1,390). พี่ฟีน to give real figures + decide single-session price (program-dependent) + โต๊ด type. |
| repo lint (both FE) | Porter/maint | `bun run lint` broken — `next lint` removed in Next 16. Pre-existing, not from our changes. Small maintenance fix (migrate to ESLint CLI). |
| REQ-003 deploy | Porter → human | Apply scheduling migration `drizzle/0010_teacher_archived.sql` (`ADD COLUMN IF NOT EXISTS`, same `__drizzle_migrations` meta-drift reconcile as ops 0003) + redeploy scheduling-back (:4006) & scheduler-front (:3016). No scheduled tasks/seed needed. Then teacher add/edit/change-type/archive is live. ⚠️ But see "teacher CRUD not standalone" — with the backoffice offline, add/archive 502; sequence the REQ-003 rework before relying on it. |
| REQ-004 deploy | Porter → human | (1) Apply scheduling migration `drizzle/0011_freelance_budgets.sql` (`CREATE TABLE IF NOT EXISTS`; same meta-drift reconcile). (2) Register a **monthly** Windows task → `POST :4006/internal/jobs/month-reset` (`x-internal-secret`=`INTERNAL_JOB_SECRET`, 1st of month) — replaces the ops month-start reset for freelance. (3) Redeploy scheduling-back (:4006) + scheduler-front (:3016). (4) Re-enter the freelance budgets via the frontoffice (placeholder 70k@500). **Pre-deploy:** Jason's month-reset idempotency guard (TASK-019 fast-follow) should land first. Then the freelance limit is fully standalone (works with ops offline). |
| REQ-003 subjects (known limit) | Porter → พี่ฟีน | The teacher Add/Edit form lists **existing** subjects only (union across the roster) — a brand-new program/subject can't be created there yet. Out of REQ-003 scope. If คุณฟีน needs to add new programs via the UI → future small REQ (`GET /subjects` + subjects-admin). Non-blocking. |
| ⚠️ Teacher CRUD not standalone yet | Porter (new REQ?) | **Pivot gap (flagged by Jason during TASK-019):** teacher add/edit/change-type/archive (REQ-003 / TASK-016) still calls ops **blocking** → once the backoffice goes offline those **502**, breaking teacher management. REQ-004 made the freelance *limit* standalone, but teacher CRUD isn't. Needs a follow-up REQ to make the teacher↔ops sync best-effort/removed (companion to the REQ-003 rework) **before the backoffice is torn down**. |
| REQ-001 deploy gate | Porter → human | Before DELIVERED: (1) apply ops migration `drizzle/0003_even_turbo.sql` in the real env + reconcile the shared `__drizzle_migrations` meta-drift; (2) set up 2 scheduled tasks — end-of-day (**:4006**, INTERNAL_JOB_SECRET) + month-start (**:4010**, X-Service-Token, 1st of month); (3) seed data (DATA REQUEST) — **placeholder numbers PROVIDED** in `project-docs/seed-data-placeholder-2026-07-20.md` (FL budget 70k @ 500/hr, FT 50k, PT 15k, Trial 1,390, Single 1,390 placeholder). Can be typed via admin UI post-deploy or dev-seeded. BE can't apply migrations/DB under brownfield. |
| ⚠️ REQ-006 deploy — **hard ordering** | Porter → human | When REQ-006 ships: **(1)** apply the `bo` migration `backoffice-back/drizzle/0004_bo_schema.sql` (`CREATE SCHEMA/TABLE IF NOT EXISTS`); **(2)** run the **TASK-025 data migration** (`ops.*` + `public.freelance_budgets` → `bo.*`) — **MUST run before/with step 3**, else live freelances have no `bo.item` → not bookable (breaks the live REQ-004 limit); **(3)** deploy TASK-024 scheduling + the rebuilt backoffice (:4010) & backoffice-front (:3018). Then the freelance limit runs off `bo.item` (still atomic, same DB). Ops routes/screens retired in a later cleanup. |
