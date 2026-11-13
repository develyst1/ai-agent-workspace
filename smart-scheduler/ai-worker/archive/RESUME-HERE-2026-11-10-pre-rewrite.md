# RESUME HERE — where this project is right now

> 🔴 **REPLACED, NEVER APPENDED TO.** A snapshot, not a log. Previous snapshot (2026-11-01) is kept verbatim at
> `archive/RESUME-HERE-2026-11-08-pre-rewrite.md`.
> **One page, ~4–6 KB.** History → `log/` · decisions → `SYSTEM-FACTS.md` / `DECISIONS-REQ-120-build.md` · state → `board.md`.
> **Written by** the PM before ending any session; **read by** the PM and the SA Lead, first. **On opening,**
> check it against `board.md` + today's log and **report any disagreement to the owner**. Provenance on every line.

**Written:** 2026-11-08 20:50 by Porter (PM) · **Newest log at the time:** `log/2026-11-08.md`

## What we are in the middle of

1. 🔨 **Back-office build (REQ-120), block 1, is running in 3 teams.** `[owner-approved 2026-11-08: "GO … ทำไปเลย … ตัดสินใจกันไป"]`
   - Done: TASK-856/857 (sign-in + roles + shell), 858/859/873 (Revenue), 864 (revenue line at confirm, SB), 865/866 (pay-run + slip), 860 (F4), 872 (hours reader).
   - In progress: 861 (F5 "No Teacher"), 870 (REQ-5008 voucher), 863 (Bonus candidates), 871 (people model + pay period), 862 (Salary 6 screens). Then 867, 868, 869.
   - The team decides build blockers itself → `DECISIONS-REQ-120-build.md` (rows 1–17). Shared sid DB → `MIGRATION-QUEUE.md`; rules in `CHECK-REQ-120-three-team-schedule-2026-11-07.md`.
2. 🗂 **Extras from พี่ฟีน's 20-point feedback (REQ-5010):** wording / small UI = free, folded into the TASKs; principle changes = parked on Trolley. `[owner-approved 2026-11-08: "แก้แค่ข้อความ หรือ UI นิดหน่อย ทำให้ฟรี ทีเหลือ … เก็บไปคุย"]`
   - 7 cards on Trolley `SOM System Dev → NEW REQUIREMENT` (ids 12–18); meeting card 19 on `ทีมงานหมอลำ → DONG (PM)` with a 7-item checklist (days · baht) and members Dong D1 · Remy (= แนท) · Salamander (= พี่เบส). Detail: `TROLLEY-CARDS-PENDING.md`.
3. 📋 **Trolley = the human team's board** (owner + พี่เบส + แนท + ปาล์ม). Porter works it through the owner's Discord sign-in in Porter's browser (tab-2). DB access (Atlas phase 1): ON HOLD — `.env.trolley` points at 127.0.0.1; waiting for แนท's real host/SSH. `[owner 2026-11-08]`

## What each thread is waiting on, and from whom

| Thread | Waiting on | Since | What unblocks it |
|---|---|---|---|
| Meeting on the 7 extras | **พี่เบส + แนท** (owner asked them for a date) | 11-08 | Date → set card 19's due date. After the talk: move each card to BACKLOG / WON'T DO, cut TASKs, send ขวัญ the 3 questions in ONE message. |
| SB/SF sid deploy round | **Silver** ("ready to deploy") | 11-08 | Then hand the owner the deploy steps (BEFORE checks from `DEPLOY-NOTES-REQ-120.md`), then TEST-142 (Twenty) + TASK-864 C1. |
| Back-office demo deploy on sid | the build | 11-08 | ≈ 20–23 Nov (Salary demo). |
| **TEST-142 part 2 (Twenty)** | **Porter: ring Twenty after 17:30 on 2026-11-09** (sid day-end) | 11-09 | First coach, SAME_COACH, park-block settle. Part 1 PASS. |
| uat deploy (incl. Palm's SOM work) | **owner: "จะไม่ขึ้นจนกว่าโค้ดที่ sit ตอนนี้ผ่าน" + "เรื่องขึ้น uat ไว้ทีหลัง จากแก้ทุกอย่างนิ่งเลย ระบบหน้าบ้าน"**: deferred until the frontoffice is fully stable on sid | 11-09 | Bob's TASK-870 Amend 3 (race fix) + Brew's TASK-875 → ขึ้น git → SB sid deploy → Tanya re-run → TEST-142 pt 2 → C1 DB read. uat needs SB 0074 + 0075 migrate. |
| ขวัญ: Bonus 100 1A/1B · park fee · data dates · activity table (REQ-5009 #5) | **ขวัญ** | 11-08 | Her reply → `CUSTOMER-ANSWERS.md` at once. |
| Palm's merge | **Palm** | 11-08 | — |
| Trolley DB | **แนท** (host / SSH) | 11-08 | Then one SA seat maps the schema → `TROLLEY.md` (Atlas phase 1). |

## Decided recently

- **SA seats may run read-only SELECTs on uat** via `scripts/uat-select.mjs` (role `sa_readonly`). `[owner-approved 2026-11-08]`
- **Search before asking the customer:** `CUSTOMER-ANSWERS.md` + verbatim files + uat data first. `[owner-approved 2026-11-08; F-040]`
- **Hand the owner one combined, paste-ready message**; never ask "sent?" when he needs the text. `[owner 2026-11-08; F-041]`
- **REQ-5008 voucher:** ขวัญ chose "B" — count booked sessions at booking; empty-voucher check-in refused (TASK-870). `[customer-asked 2026-11-08]`
- **Shared sid DB:** additive migrations only, through the queue; never `db:seed/push/reset` on sid. `[team-proposed 2026-11-07, owner GO 11-08]`

## What becomes urgent, and when

- 📅 **≈ 20–23 Nov:** Salary demo on sid — block 1 must be deployable by then.
- ⚠️ **Hygiene gate FAIL (28):** inboxes far over 2 KB (SA.md 108 KB, SA-B 55 KB, QA 55 KB), board 62 KB, today's log 147 KB, 9 unreviewed FAILURES (Atlas). Housekeeping = Marie's; asked via `MARIE.md`-side request 11-08. `[team-proposed 2026-11-08]`

## What we already tried that did NOT work

- **Asking ขวัญ things she already answered** (F-040) — search first.
- **Asking the owner "was it sent?"** instead of giving him the combined text (F-041).
- **Clicking a Trolley card's round button** marks it complete (card 12, reverted). Use the "…" menu; verify with `find`, screenshots lag.
- **Many customer questions at once** (31 → *"เห้ย ทำไม มันเยอะจังวะ"*). One pack per block, before its build.
