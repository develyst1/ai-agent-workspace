# RESUME HERE: where this project is right now

> 🔴 **REPLACED, NEVER APPENDED TO.** A snapshot, not a log. The previous one is kept verbatim at
> `archive/RESUME-HERE-2026-11-11-2358-pre-rewrite.md`.
> History → `log/` · decisions → `SYSTEM-FACTS.md` / `DECISIONS-REQ-120-build.md` · state → `board.md`.

**Written:** 2026-11-11 ~23:58 by Porter (PM). Newest log: `log/2026-11-11.md`.

## Standing ways of working (full text in SYSTEM-FACTS)
- **GR web = the BACK-OFFICE demo only.**
  - Back-office feedback: update the demo (Sober → Otto → Tanya LIVE + screenshots), then a message to ขวัญ on the owner's "ส่ง", sent by the bot.
  - Everything else (front office, money, scope): take it to the owner first.
  - Every accepted item also goes in `GR-FEEDBACK-TO-CODE.md` and is built in the real code from 14 Nov.
- **LINE bot:**
  - It is live and records the SOM SYSTEM group.
  - `tools/watch-line.sh` polls every 30 min. Start it each session from `smart-scheduler/`: `bash ai-worker/tools/watch-line.sh /h/scheduler/develyst-line-bot`.
  - The bot sends at most **3 images** per send.
  - Every customer message needs the owner's "ส่ง" for that message.
- **The owner's PC is offline from about 08:30 to 19:00–20:00.** Daytime "offline" alarms are normal.
- **A ball line means the holder is moving.** Check `list_sessions` first; doorbell every hand-off, including an SA's engineer.
- **Recommendations to the customer start from her own asks** (F-061), not from our cost.
- **The free small-change limit after 17 Nov is ≤ 2 days.** VAT is quoted as before (no VAT line). The source code becomes the customer's after the back office. Acceptance is 7 working days; payment is 7 days after acceptance.

## Where things stand
- **uat (the customer's live system) was deployed on 11-11 with SB bfe5ef6 + SF 86316ee** (Palm's SOM pies included).
  - The back-office DB schema on uat now equals sid (BB full migrate + seed-ledger).
  - TEST-154 is a read-only PASS. ขวัญ was told (bot).
  - It includes F5 + F2 (TEST-152), the voucher, payments, branch, camp, No Teacher, and the SOM dashboard API (TEST-153).
- **sid:** SB bfe5ef6. BB/BF are an older build; the English bundle is committed but not deployed (BB e3a37de, BF 68a9409).
  - `SKIP_ADMIN_AUTH=false` since 11-11 (D-150-3 closed).
- **GR web (som-gr) is at round 5 (md5 3341cf63).** All of ขวัญ's 11/11 feedback is answered.
  - The per-menu permission tick list is HELD behind a flag until she chooses from the quote.
- **All 4 code repos are clean.** SB 8ee821a → bfe5ef6; BF 68a9409; BB e3a37de.

## Waiting
- **ขวัญ:**
  - the quote: `deliverables/SOM-proposal-extra-work-2026-11-11.html`, recommended 7,850 ฿ / cheapest 5,150 ฿;
  - the owner sends it, with Trolley cards 21–24 for the doc team;
  - more GR feedback until 17 Nov.
- **แนท:** the agreement answers are posted on Trolley board 2 card 20. The owner sends the party details himself.
- **The owner:** nothing urgent.

## On 14 Nov (the real build resumes)
1. Deploy the English back office (BB + BF) to sid.
   - Add the Refund env (`SCHEDULER_API_URL`, `SCHEDULER_INTERNAL_SECRET`).
   - Check `SKIP_ADMIN_AUTH=false`.
2. TASK-951 (Jason): `/bo/reports/*` is CEO-only, with route tests.
3. Back-office ledger rows (GR-FEEDBACK-TO-CODE 1–25): TASK-942 park fee, TASK-935 English sweep, row 24, Revenue filters/export, Stock Report export.
4. Palm's SOM pies to sid; then Tanya's screen check. It is already on uat.
5. TASK-946 follow-up: the group-series cancel-all still regrows the old way (≈ 0.25 d).

## Dates
- **17 Nov:** the GR feedback window closes.
- **18 Nov:** the URS PDF goes out by email.
- **Delivery bar:** Salary sid by 6 Dec, uat by 13 Dec · Revenue + Stock sid by 3 Jan · reports by 17 Jan.
