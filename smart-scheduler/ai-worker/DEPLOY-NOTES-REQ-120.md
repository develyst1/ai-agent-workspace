# DEPLOY-NOTES — REQ-120 build: what the owner must know at each deploy
Append only. Porter reads this before handing the owner any deploy step, and puts the relevant lines into that step.

| from | when it applies | note |
|---|---|---|
| Sector 2026-11-08 | every backoffice-back deploy (sid now, **uat later**) | sid had a pre-existing **0006 ledger gap** in backoffice-back (fixed on sid). uat may have the same ⇒ the uat deploy runs `db:verify` before and after migrating. |
| Sector 2026-11-08 | every deployed server | `SKIP_ADMIN_AUTH=true` makes every caller the dev CEO (Team A `auth.ts`). It must **never** be set on sid's or uat's deployed back office; local dev only. |
| Owner 2026-11-08 | uat backoffice deploy | uat already holds 0007 (bo.role + empty bo.users + ledger row), kept by the owner; the deploy skips it. (May not exist — see F-038 footnote.) |
| Silver 2026-11-08 | first sid deploy of smart-scheduler-back + -front | F4 + F5 ship together in one round (back `bun run build` → `dist/smart-scheduler-back`; front `bun run build`), so "No Teacher" never shows in the old front. |
| Porter 2026-11-08 | every smart-scheduler-back sid deploy | **The build is the whole `dong` working tree** — it carries every team's uncommitted SB work at that moment (Team B F4/F5 AND Team C's C1, TASK-864). Porter hands the owner a deploy step only when **every** team with SB hunks in the tree says "deploy-safe" (DONE, or its hunks inert). The QA rounds for that build: F4 + F5 (Twenty, TEST-142) and C1's confirm path (TASK-864 recipe; a confirm sends LINE to the booking teacher, so testers run it, never engineers). |
| Silver 2026-11-08 | the uat deploy that carries TASK-870 (REQ-5008) | Check-in on an empty voucher is now REFUSED (Khwan "B"), incl. a parent's LIFF check-in. On uat today it can only hit voucher `fe7fa6ff…` (2 booked sessions with no hours left, CHECK-REQ-5008 § RESULT). **Before that uat deploy, staff sort that voucher out** (cancel/move 2 sessions or sell hours) — Porter raises it with the owner/ขวัญ then. |
