# Board — smart-scheduler

> Single source of truth. Update me at the end of every session (see PROTOCOL.md).

## Project info

- Description: Smart Scheduler — scheduling + back-office ERP for a balance/wheeled
  sports activity center (replaces manual Excel + Alis To Soft).
- Code repository (monorepo root): `C:\Users\Admin\develyst\smart-scheduler`
  - `smart-scheduler-back` — scheduling API, Bun + Drizzle, port 3001 (~75%) → Jason
  - `smart-scheduler-front` — staff calendar UI, Next.js, port 3000 (~70%) → Fern
  - `smart-scheduler-backoffice-back` — ops/finance API (`ops` schema), port 3002 (~40%) → Jason
  - `smart-scheduler-backoffice-front` — admin ERP/money UI, Next.js, port 3100 → Fern
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
| REQ-001 | Freelance pay as monthly budget-stock + auto-disable at cap | HIGH | IN_SPEC | Sober (finalize SPEC + cut TASKs) |

> Decision (2026-07-20, คุณฟีน): backoffice = **Path A, item-centric P&L**. No full
> payroll engine, no student hour-wallet. Freelance pay = per-teacher monthly
> "budget-stock" drawn down at the end-of-day cut → auto-disable at cap. Full/part-time
> = manual `FIXED_COST`. See REQ-001 + `project-understanding.md` §6.

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| — | *(none yet)* | | | | |

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| — | | *(REQ-001 unblocked 2026-07-20 — Porter answered all 3; back to Sober)* |
