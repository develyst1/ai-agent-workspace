# RESUME HERE: where this project is right now

> 🔴 **REPLACED, NEVER APPENDED TO.** A snapshot, not a log. The previous snapshot is kept verbatim at
> `archive/RESUME-HERE-2026-11-10-pre-rewrite.md`.
> History → `log/` · decisions → `SYSTEM-FACTS.md` / `DECISIONS-REQ-120-build.md` · state → `board.md`.

**Written:** 2026-11-10 00:05 by Porter (PM) · **Newest logs:** `log/2026-11-09.md`, `log/2026-11-10.md`
**⏸️ DESK PAUSED by the owner at 00:04 (*"พักก่อน เบรกก่อน"*).** Every seat was told to finish its current step and stop. Ring them on his word.

## Standing owner rules made on 11-09 (full text in SYSTEM-FACTS)
- **Delivery bar:** finish 2 weeks before every Master Plan date (Salary sid 6 Dec; Revenue/Stock sid 3 Jan; reports sid 17 Jan).
- **Omakase:** build early, but hand to the customer slowly, one piece at a time, when the owner chooses.
- **Git:** SAs commit + push on `dong` themselves once a change is on sid AND Tanya passed it (*"ฉันให้สิทธิ์ git ในการ commit + push"*). Merge, release, tags and deploys are still his.
- **Local-tree deploys need a freeze:** the owner deploys BB/BF from his local tree, so the SAs confirm a green, frozen tree first.

## Where the back office stands (sid)
- **Deployed + committed:** BB 6f1b427 / BF 001a1ef (Salary, Revenue, Stock, 2.1 reports, R0.1 login management). SB 77a4262 (TASK-916).
- **Tested on sid (TEST-150, CEO card):** Salary 12/14 (the coach confirm + admin money-masking + web notifications are still open), Revenue (except Refund), Stock, R1.8, 2.1, R0.1 (CEO side).
- **Ready but NOT deployed:** the "English back office" bundle on a frozen tree (BF 442/0, BB 1396/0): D-150-1 Team A + Team B (TASK-933), O-150-1 (TASK-932 teacher names), TASK-934 + admin/login English. **Next: the owner's ONE BB+BF redeploy → Tanya → Sober commits (whole pages.ts) → Silver commits (Fanta's screens).**
- **Gated:** TASK-935 (Brew, BB API English sweep) starts only after Sober's bundle commit.

## Waiting on the owner (ask one at a time)
| # | Item | Detail |
|---|---|---|
| 1 | Redeploy the English bundle (BB + BF, local, no migrate) | Sober: frozen tree green 00:02 |
| 2 | Park fee: several groups per hour, true? | ขวัญ's LINE 11-09 vs DECISIONS row 11. Silver sized it: 1.5–2.5 d, medium risk (SIZE-park-fee-…) |
| 3 | Fill `[bo-admin]` = qa-nostatus-077 and `[bo-coach]` = qa-coach-qatt75 (their FO passwords) in picklocker/access.txt | unlocks admin/coach tests (R0 masking, coach confirm) |
| 4 | Refund env on sid BB: `SCHEDULER_API_URL` + `SCHEDULER_INTERNAL_SECRET` (= SB INTERNAL_JOB_SECRET) | D-150-2, Refund 503 |
| 5 | Front-office intake (ขวัญ 11-09): F5 needs his OK (it reverses TASK-551); then F2, F4, F1 (6–8 d, high risk; ask her if worth it); F3 held; F6 dashboard: who builds it? | INTAKE-2026-11-09-…, CHECK-2026-11-09-frontoffice-intake.md |
| 6 | "เริ่มนับคำนวณเดือนนี้" (revenue start): which month? | CUSTOMER-ANSWERS § 2026-11-09 LINE |
| 7 | Send ขวัญ the question pack (commission ×2, the SALARY report, 2.1 reports, Group kind) + an answer to her "why is 2.1 its own timeline" | COPY-DRAFT-khwan-commission-2026-11-09.md |
| 8 | F-054: the leaked sid admin token (exp ~11-12). Reissue? | his call |

## Timed rings
- **After the sid 17:30 day-end on 2026-11-10:** ring Tanya (Bonus 100 re-run, apply-bonus on the Nov 2026 period, which is OPEN and must never be locked) and Twenty (TEST-142 case 18).

## Known gaps / not tested
Sign-in AS admin/coach (needs #3) · Refund (#4) · LINE pay-confirm tasks not registered (hard gate) · Low-stock Monday job not registered (DEPLOY-NOTES).
