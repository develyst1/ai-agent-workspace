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
| REQ-001 | Freelance pay as monthly budget-stock + auto-disable at cap | HIGH | **SPEC_DONE** | Deployed; **live acceptance BLOCKED by REQ-002 (auth 403)**. Resume §6 acceptance once admin login exists. Build acceptance PASS; all 12 tasks DONE. |
| REQ-002 | Backoffice admin authentication (login + real JWT) | HIGH | **SPEC_DONE** | **Human — deploy** (SEPARATE ops creds: set `ADMIN_USERNAME`/`ADMIN_PASSWORD`/`JWT_SECRET` + `SKIP_ADMIN_AUTH=false`, redeploy backoffice-front, log in at `/login`) → Porter live acceptance → then REQ-001 acceptance resumes. Runbook relayed by Porter. |

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

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| REQ-001 acceptance — **auth 403** | REQ-002 **deploy** | REQ-002 **build DONE** (TASK-013/014, SPEC-003). REQ-001 live acceptance resumes once the auth is **deployed**: set ops `SKIP_ADMIN_AUTH=false` + `ADMIN_USERNAME`/`ADMIN_PASSWORD`/`JWT_SECRET`, redeploy backoffice-front, log in, then re-run runbook §6. |
| repo lint (both FE) | Porter/maint | `bun run lint` broken — `next lint` removed in Next 16. Pre-existing, not from our changes. Small maintenance fix (migrate to ESLint CLI). |
| REQ-001 deploy gate | Porter → human | Before DELIVERED: (1) apply ops migration `drizzle/0003_even_turbo.sql` in the real env + reconcile the shared `__drizzle_migrations` meta-drift; (2) set up 2 scheduled tasks — end-of-day (**:4006**, INTERNAL_JOB_SECRET) + month-start (**:4010**, X-Service-Token, 1st of month); (3) seed data (DATA REQUEST) — **placeholder numbers PROVIDED** in `project-docs/seed-data-placeholder-2026-07-20.md` (FL budget 70k @ 500/hr, FT 50k, PT 15k, Trial 1,390, Single 1,390 placeholder). Can be typed via admin UI post-deploy or dev-seeded. BE can't apply migrations/DB under brownfield. |
