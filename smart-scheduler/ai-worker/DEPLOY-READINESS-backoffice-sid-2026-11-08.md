# Deploy-readiness — backoffice to sid (the 20–23 Nov demo), Sober (SA Lead A), 2026-11-08

Prepared at Porter's request once TASK-878 was accepted. **App-level readiness only** — the server/platform mechanics (PM2 · nginx · SSL · the standalone/compile build) are Otto's/the owner's. The actual deploy + the sid login click-through are the owner's hands.

## What deploys
- **smart-scheduler-backoffice-back** (Bun/Hono/Drizzle) — branch `dong`
- **smart-scheduler-backoffice-front** (Next 16 + Mantine) — branch `dong`

## ✅ Commit state — the finished spine IS committed (deploy these)
- **backoffice-back** `dong` **`45a5977`** — the complete money-grade spine (TASK-878 link 3 + the insertLine source_ref fix). tsc 0, suite 577/0.
- **backoffice-front** `dong` **`7baca31`** — unchanged since the first save point (Fern's integration touched no front code).
Both pushed. The sequencing caveat is resolved (owner said `ขึ้น git หลังบ้านอีกรอบ` on 2026-11-08). **The deploy carries back `45a5977` + front `7baca31`.**

## Migrations — already on sid, nothing to run at deploy
All applied·verified on sid (154.197.124.206), additive, through MIGRATION-QUEUE, host-checked:
`0007` users/roles · `0008` revenue ledger · `0009` thin-slip salary · `0010` people model + R1.4 period · `0011` source_ref + idempotency index · `0012` payment.
**The sid DB is at/ahead of the code — the deploy runs the app, it does NOT run migrations.** (The CEO is already seeded: `bo.users` 1 row, role=ceo.)

## Env the owner sets on the deploy host (names only — values are his)
**backoffice-back:**
- `DATABASE_URL` → sid (154.197.124.206), the `smart_scheduler` DB
- `PORT` → the back's port on the host
- `JWT_SECRET` → a real secret (not the example)
- `JWT_TTL_SECONDS` → token lifetime (e.g. 43200 = 12h)
- **`SKIP_ADMIN_AUTH=false` — CRITICAL: must be `false` on sid** so auth is enforced and the CEO logs in via `bo.users`. `true` would make every request a dev-ceo with no login.
- `API_BASE` → the smoke target
- **`SERVICE_TOKEN` — CRITICAL: must be a REAL RANDOM secret on sid, the SAME on BB and SB.** It gates the machine-only routes (`serviceAuth`: teacher-sync, accounts debits, recurring; and `/internal/salary/unconfirmed`). After the fail-closed + placeholder guard (TASK-890/896), in enforced mode (`SKIP_ADMIN_AUTH=false`) **both an unset `SERVICE_TOKEN` AND the placeholder `change-me-service-token` (still in both repos' `.env`/`.env.example`) make every machine call 401** — including **SB's `fetchUnconfirmed`** (the pay-confirm reminder would then report `backoffice-unavailable`, no send). So: set a real random value, identical on BB and SB; the placeholder is not a valid token any more.
- **`SCHEDULER_API_URL`** → SB's base URL (e.g. `http://localhost:4006`); empty = remind-now / refund-cancel don't call SB.
- **`SCHEDULER_INTERNAL_SECRET`** → must **equal SB's `INTERNAL_JOB_SECRET`** (Sector/TASK-893): BB calls SB for the pay-confirm remind-now (887) AND for a refund that cancels the course/voucher in SB; without it those SB calls fail. Empty by default.
- (`ADMIN_USERNAME`/`ADMIN_PASSWORD` only matter under SKIP mode — not used when `SKIP_ADMIN_AUTH=false`.)

**backoffice-front:**
- `NEXT_PUBLIC_BACKOFFICE_API_URL` → the deployed backoffice-back URL on sid

## ~~🔴 BEFORE the BF build/deploy — self-host fonts~~ → PARKED, NOT a deploy blocker (Porter 2026-11-09 04:05)
~~BF `next build` uses `next/font/google` which fetches from Google at build time.~~ **Resolved as a non-blocker:** the **front-office uses the same `next/font/google` import and deploys fine**, so the backoffice deploys with it too (the deploy box reaches Google at build time). **TASK-897 (Fern self-host swap) is PARKED** — no longer gates the backoffice deploy, and does not wait on the owner's font-download approval for deploy purposes. (Keep it on the backlog only as a hardening nicety for a truly offline build box; it is not on the critical path.)

## BEFORE checks (all green as of 2026-11-08)
- back `tsc` 0 · suite **577/0** · front `tsc` 0 · `next build` 0
- the spine proven on sid in rolled-back transactions (871 14/14, 878 13/13, 872 real read) — no residue
- CEO seed on sid (1 row); `teacherName` read-only lookup works; `is_system=true` ("No Teacher") excluded from every enumeration
- no scheduler file touched; backoffice reads `public.teachers` read-only only

## 🔴 HARD GATE — the LINE-reminder Windows Tasks (sid runs Task Scheduler)
sid runs Windows Task Scheduler jobs, and the pay-confirm reminder has two `.ps1` tasks (`sm-jobs/pay-confirm-0900.ps1`, `pay-confirm-1100.ps1`) that fire the 09:00 / 11:00 LINE reminders. **They only run if registered** via `schtasks /create` — and they are **NOT** in the current registered set (`sm-end-of-day`, `sm-month-reset`, `sm-daily-digest`). There is no auto-registration.
**DO NOT register `pay-confirm-0900` / `-1100` on sid until ALL of:**
1. Bob's TASK-887 `GET /api/v1/internal/salary/unconfirmed` is **live on BB** (else the job stops at `backoffice-unavailable` — safe, but it can't work);
2. `LINE_OA_WRITE_ALLOW` holds the right OA for the box. **Confirmed sid state (owner, 2026-11-09, verbatim "LINE_OA_WRITE_ALLOW ที่ deploy sid เป็นของ line SOM DEMO ของฉัน"):** on **sid** the allow-list is the owner's **demo OA**, NOT the customer's — so sid can only ever message the demo OA (safe for testing). The **customer OA goes only on the production server**. (Nothing else is sent unless the OA is on the box's allow-list — `OA_NOT_ALLOWED` otherwise.)
3. **Khwan has approved the wording** (it messages real coaches);
4. SB's `INTERNAL_JOB_SECRET` on sid **equals the `.ps1`'s `sid-server-task-schedule`** (or the `.ps1` is updated to match).
**Until then leave them UNREGISTERED** — unregistered tasks cannot fire. Register as a separate, gated step after the chain is proven. (Today they are safe regardless: it is not month-end → `not-confirm-day`; and `backoffice-unavailable`; and `no-channel-token` — multiple layers, no send.)

## After deploy — the one proof we can't do ourselves
A real **sid click-through**: the owner (or someone allowed to log in on sid) signs in as CEO, runs a pay period, sees the slips/CSV. We proved the contract against the real BE code in a harness (TASK-866) but cannot log in on sid. This is the final acceptance, the owner's hands.

**Ball: Porter → owner** (say `ขึ้น git` to commit the completed spine, then schedule the deploy with Otto/himself). I commit on his word and stand by for the deploy.
