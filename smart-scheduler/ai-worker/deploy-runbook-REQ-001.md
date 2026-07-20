# Deploy Runbook — REQ-001 (Freelance budget-stock + FT/PT recurring salary + day-end revenue)
- Author: Sober (SA). For: the human, relayed by Porter. Date: 2026-07-20.
- Status: build acceptance PASS (all 12 tasks DONE). This runbook covers the **real-environment
  deploy gate** — the only work BE/FE can't do under the brownfield rule (no DB/live-env access).
- **Do the steps in order.** Each has a check. Stop and report if a check fails.

## 0. What ships
- **ops** (`smart-scheduler-backoffice-back`, :4010): new `recurring_costs` table + migration; recurring
  salary + month-start job endpoints; reversible P&L; `first-trial`/`single-session` revenue items (seed).
- **scheduling** (`smart-scheduler-back`, :4006): booking-time freelance draw-down/reversal; day-end
  trial/single revenue; teacher budget DTO + override.
- **FE**: Freelance Budgets + FT/PT Salary admin screens (:3018); staff baht `remaining/budget` (:3016).

## 1. Env / port map (set before starting)
Canonical ports: **staff-front :3016 · scheduling :4006 · ops :4010 · ops-front :3018.**

| Service | Env vars to set (prod) |
|---|---|
| scheduling `:4006` | `OPS_API_URL=http://<ops-host>:4010` · `SERVICE_TOKEN=<shared>` · `INTERNAL_JOB_SECRET=<secret>` · `SKIP_AUTH=false` |
| ops `:4010` | `SERVICE_TOKEN=<same shared>` · `SKIP_ADMIN_AUTH=false` · `DATABASE_URL=<postgres>` |
| ops-front `:3018` | `NEXT_PUBLIC_BACKOFFICE_API_URL=http://<ops-host>:4010/api` |
| staff-front `:3016` | `NEXT_PUBLIC_API_URL=https://som.develyst.online/api` (already prod) |

`SERVICE_TOKEN` **must match** between scheduling and ops (scheduling→ops calls + the month-start job use it).

## 2. Apply the ops migration (⚠️ meta-drift)
The two backends historically shared a `__drizzle_migrations` journal → `drizzle-kit` may mis-track.
The only genuinely-new object is `ops.recurring_costs`.

```bash
cd smart-scheduler-backoffice-back
# Preferred:
bun run db:migrate            # applies drizzle/0003_even_turbo.sql
```
- **If it errors on already-existing objects (the meta-drift):** apply the new table directly instead —
  `drizzle/0003_even_turbo.sql` contains ONLY the `recurring_costs` CREATE TABLE + its FKs/indexes, so it's
  safe to run by hand:
  ```bash
  psql "$DATABASE_URL" -f drizzle/0003_even_turbo.sql
  ```
  then record it in the journal if you use drizzle tracking.
- ✅ **Check:** `\d ops.recurring_costs` in psql shows the table (id, party_id, item_id, amount_minor,
  effective_from/to, active, metadata…).

## 3. Seed the day-end revenue items
```bash
cd smart-scheduler-backoffice-back && bun run db:seed
```
- Idempotent (`onConflictDoNothing`) — safe to re-run.
- ✅ **Check:** `GET http://<ops-host>:4010/api/v1/catalog/items?externalSource=smart-scheduler&itemType=INCOME`
  returns `first-trial` + `single-session` (price 1,390 placeholder). Swap for real prices later (step 5 / UI).

## 4. Enter real per-teacher data (placeholders in `project-docs/seed-data-placeholder-2026-07-20.md`)
Fastest = type it in the admin UI (:3018); or extend the seed. Either is fine.
- **Freelance Budgets** screen → 8 freelancers, budget 70,000 @ rate 500/hr (placeholder).
- **FT/PT Salary** screen → 7 FT @ 50,000, 8 PT @ 15,000 (placeholder), effective-from = deploy month.
- Adjust `first-trial`/`single-session` prices (Items screen, TASK-009 edit) when คุณฟีน gives real ones
  (single-session is program-dependent 1,090–1,690).
- ✅ **Check:** budgets show `remaining/budget`; salaries show in the FT/PT list with effective-from.

## 5. Scheduled tasks (Windows Task Scheduler) — 2 jobs
**A. End-of-day cut + revenue** — scheduling `:4006`, header `x-internal-secret`, nightly (e.g. 23:30 Asia/Bangkok):
```bash
curl -X POST http://<sched-host>:4006/internal/jobs/end-of-day \
  -H "x-internal-secret: $INTERNAL_JOB_SECRET" -H "Content-Type: application/json" -d '{}'
```
**B. Month-start reset + salary materialize** — ops `:4010`, header `X-Service-Token`, 1st of month 00:05:
```bash
curl -X POST http://<ops-host>:4010/api/v1/internal/jobs/month-start \
  -H "X-Service-Token: $SERVICE_TOKEN" -H "Content-Type: application/json" -d '{"month":"YYYY-MM"}'
```
Register both via `schtasks /create … /sc DAILY` (A) and `/sc MONTHLY /d 1` (B).
- ✅ **Check (manual run once):** A returns `{noShow, coursesCut, vouchersCut, revenuePosted, report}`;
  B returns `{month, freelanceReset, salariesPosted}`. Re-running either is idempotent (no double-post).

## 6. Live acceptance walkthrough (Porter signs off → DELIVERED)
1. **Budget draw-down:** book a freelance on the calendar → `/reports/pl` `costMinor` rises by rate×1h;
   the freelance's `remaining` drops. Cancel it → expense nets back to 0, remaining restored.
2. **Cap + auto-hide:** drive a freelance's remaining to ≤ 0 → they disappear from booking columns and
   show the over-budget flag; top-up or override → bookable again.
3. **Salary:** confirm this month's FIXED_COST salary posted (`/reports/pl` `byType[FIXED_COST]`); change a
   salary effective next month → past month's P&L unchanged.
4. **Revenue:** mark a `FIRST_TRIAL`/`SINGLE_SESSION` attended, run job A → revenue appears in
   `byType[INCOME]`; a course/voucher booking does **not** add day-end revenue (already counted at sale).
5. **P&L sanity:** `profit = revenue − freelance expense − FT/PT fixed cost`.

## 7. Rollback / notes
- Feature is additive; to disable revenue posting, leave the two INCOME items unseeded (day-end skips).
- To pause the money mechanic, unset scheduling `OPS_API_URL` → all ops calls become best-effort no-ops
  (bookings still work; no draw-down/expense).
- Non-blocking maintenance: FE `bun run lint` is broken repo-wide (`next lint` removed in Next 16) — migrate
  to the ESLint CLI when convenient (doesn't affect runtime/build).
