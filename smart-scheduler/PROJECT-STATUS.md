# smart-scheduler — PROJECT STATUS (resume-here / cross-machine memory)

> **Source of truth for resuming the project on any machine.** This file is git-synced, so it travels;
> the local `.claude/memory/` does **not**. To resume: `git pull` → read `ai-worker/PROTOCOL.md` + your role
> file → read this + `ai-worker/board.md` + the newest `ai-worker/log/*.md` → act on your role's open balls.
>
> **Last updated:** 2026-08-11 by Porter (PM). REQ *file headers* are STALE — this doc is reconciled against
> `board.md` + the logs; trust this over the REQ file status lines.

## Where we are
- 🏁 **Customer-prod go-live essential set is DELIVERED and live** on `frontoffice.develyst.online` (2026-08-11):
  the editable course plan, extra paid session, plan-diff preview, and REQ-038 #1–5 (incl. timetable student search
  + deduction history). Full post-deploy re-check PASS, zero defects.
- 📐 **Frontend standard adopted** — `FRONTEND-STANDARD.md` (workspace root) after a pro FE engineer graded our UI
  "AI-generated." REQ-041 conformance DELIVERED.
- ✅ **No open engineering blockers.** What remains is backlog + owner-run QA/housekeeping.

## Environments
- **prod (customer):** `frontoffice.develyst.online` (+ `backoffice.develyst.online`) · DB `smart_scheduler`
  on the Windows prod server (localhost there; network host `154.197.124.29`).
- **sid (dev/staging):** `som.develyst.online`.
- **DB topology:** ONE shared DB, TWO drizzle ledgers (`__drizzle_migrations_bo`, `__drizzle_migrations_scheduling`).
  Migrate **backoffice-back before scheduling-back** (bo owns the `bo` schema scheduling references).
- **Deploy:** build 4 apps locally → copy to server → `pm2 restart` bo-back→bo-front→sched-back→sched-front.
  Backup first (`db:backup`). Runbooks in `develyst/smart-scheduler/DEPLOY-CUSTOMER-PROD-*.md`.

## 🧹 Deferred housekeeping (owner-run, NOT blocking)
- **prod `pg_hba` temp-open** — the `host all all 110.171.40.169/32 scram-sha-256` line added for the deploy is
  still open. Close it (remove line → `SELECT pg_reload_conf();` → verify 0 rows). Security item, owner's call.
- **QA test residue in prod** — Tanya's `QA-prod-student` + 2 courses + 1 voucher + bookings. Re-run the REQ-040
  delete block in server `psql` to return to a clean slate.

## REQ status (reconciled 2026-08-11)

### ✅ DELIVERED / live
- **Go-live essential set (prod, re-checked):** REQ-030 (editable course plan) · REQ-037 (extra paid session) ·
  REQ-038 #1–5 (standard timetable incl. #3 search, #5 deduction history) · OBS-3 (plan-diff preview) ·
  REQ-040 (prod data reset) · REQ-041 (FE-standard conformance, items 1–5,7,8).
- **Shipped in the 08-11 deploy (sid-accepted, code now on prod):** REQ-009 · REQ-022 · REQ-024 · REQ-026 ·
  REQ-027 · REQ-028 · REQ-029 · REQ-031 · REQ-032.
- **Older, live:** REQ-001, 002, 004, 005, 006, 007, 008, 010, 011, 013 (SOM dashboard), 016 (teacher schedule on LINE), 019.

### 🔨 OPEN — ready to build (needs owner's sequencing call)
- **REQ-035 — sell-side item model** (frontoffice sells from the `bo` catalog → atomic stock-draw + revenue,
  block-at-0). SPEC-034 done; TASK-116/117/118 cut; genuinely **unbuilt**. Touches live money + 1 migration →
  owner decides **go-live vs fast-follow**. (Note: sell-side is frontoffice-facing — aligns with "focus frontoffice".)

### ❓ OPEN — waiting on an owner decision
- **REQ-036 — end a course early / refund.** DEFERRED — owner will discuss with the customer. **Owner's leaning
  (2026-08-11):** treat a course as **hours** — "buy 10h, get to use 10h whenever; unused is fine; no forced end."
  That is a **different model** from what's built (session-count + expiry + leave-extension). **Open question for
  Sober:** what exactly makes a course "not close" today (expiry vs extension-ceiling vs unattended sessions), and
  is an hours-use-forever model feasible? Resolve before specing REQ-036.
- **REQ-034 — SOM dashboard filter by booking type.** SPEC-032 + TASK-110/111 cut; **post-go-live**; needs 2 owner
  confirms (students-vs-entitlements unit; which sections honour the filter).
- **REQ-039 — dashboard consolidation/rename** + **REQ-033 — 8 items from the 2026-08-01 meeting** (incl.
  conversion-rate-per-teacher = the customer's stated "important" one; board-only freelance-approval **BLOCKED on
  separate logins**). Owner wants the **full wishlist gathered before scoping**; dashboards done "if nothing else left."

### 💤 Parked / post-go-live / backlog
- **REQ-014 — revenue-by-activity (backoffice).** Owner: **backoffice later, focus frontoffice.** ⚠️ Built but its
  one acceptance check appears **never actually run**, and it reports **฿0 until `sale:ensure-items` is run with real
  prices** → treat as **delivered-but-UNVERIFIED**; confirm before anyone reads a revenue figure.
- **REQ-017** teacher phone calendar feed — deployed but acceptance parked (real-device webcal UX blocked).
- **REQ-021** badge/tagging — BACKLOG, lowest priority.
- **REQ-038 #6–9** — post-go-live (teacher working *hours*, Group/Camp/ECA, conversion/performance → REQ-033,
  per-day freelance/PT type = new money-model gap).
- **REQ-041 item 6** — heading display-font pairing — **CUT** by owner.
- Dead/superseded: REQ-012→019, REQ-018→020, REQ-003 (moot).

### 🧪 QA standing backlog (owner-run tests)
- **Script 4 (REQ-020)** — LINE teacher claim must QUEUE→approve/reject (not auto-grant). **Owner testing on phone.**
- **Script 5 (REQ-023)** — morning digest = one message / silent when empty / no duplicate. **Owner testing on phone.**
- **REQ-037 revenue** — the extra-session revenue posting rides the day-end job; **re-check after a day-end**.
- **REQ-009** — one AC left: "past P&L unchanged" (backoffice, cross-month) — untested.
- **REQ-015 (TASK-046/047)** — LINE role-switch + PII-leak fixes built + SA-verified; await a **sid deploy + repro re-check**.
- **REQ-029 (owner data call)** — historical voucher bookings still carry a guessed program; dashboards report as-is.

### Defects
**DEF-1** (375 voucher Manage) · **DEF-2** (#3 timetable search gap) · **DEF-3** (token swap killed Tailwind opacity)
— **all CLOSED.** None open.

## Owner directives (2026-08-11, in force)
- **Focus frontoffice; backoffice later** (defers REQ-014).
- **Dashboards only if nothing else is left** (REQ-039/034).
- **REQ-036 not urgent** — talk to customer; owner's hours-based course-model idea (above).
- **Owner tests LINE himself** (Scripts 4+5); font (REQ-041 item 6) **CUT**.
- **prod `pg_hba` close + QA data cleanup — deferred** (owner's call, low urgency; nil exposure pre-go-live).

## Team & workflow
PM=Porter · SA=Sober · BE=Jason · FE=Fern · QA=Tanya. Chain is hard: Human→Porter→Sober→(Jason/Fern), QA hangs off
Porter. Coordination lives in `ai-worker/` (board, log, REQ/SPEC/TASK/TEST). See `ai-worker/PROTOCOL.md`.
