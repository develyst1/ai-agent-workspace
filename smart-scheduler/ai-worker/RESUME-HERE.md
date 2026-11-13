# RESUME HERE: where this project is right now

> 🔴 **REPLACED, NEVER APPENDED TO.** A snapshot, not a log. The previous one is kept verbatim at
> `archive/RESUME-HERE-2026-11-13-pre-rewrite.md`.
> History → `log/` · decisions → `SYSTEM-FACTS.md` / `DECISIONS-REQ-120-build.md` · state → `board.md`.

**Written:** 2026-11-13 ~02:20 by Porter (PM), state line updated ~03:30. Newest log: `log/2026-11-13.md`.

> **NOW (~03:15 11-13): REQ-5016 is SPEC_DONE; all 4 TASKs are built (969, 970+A1, 971, 972). 0081 is applied on sid (82/130/82). Gate #2: Team C GREEN; Team B signs after clearing ChangeActivityDialog.tsx. Then I ask the owner for «ขึ้น git» in the morning, he deploys sid, and Tanya tests REQ-5016. uat later = 5 pending (0077–0081), ledger 98 → 103. Owner's morning wording pack: REQ-5015 Q1, REQ-5016 Q1 (pattern line), TASK-972 new Thai strings, and whether a leave should send the family a message (AC4 correction).**
> **Earlier (~02:30 11-13): REQ-5016 multi-day (paid 1,850) is being built by TWO teams on the owner's «ให้ทีม B ช่วยเลย»: SPEC-109 §8, Brew/Flash (C) + Bob/Fanta (B), sid ≈ 11-16. Owner asleep, wants the full picture on waking. Overnight: an idle sweep every 30 min, and SA-B and SA-C coordinate through me.**
> **Earlier (later 11-13): committed SB 738b6eb / SF 6c52040 is on sid. Tanya passed REQ-5013/5014/5015 and TASK-942. The owner said «ยังไม่รวมโค้ด»: uat waits on his word. Follow-ups wait for the uat deploy: TASK-961 Amendment 1 (Bob) and TASK-967/968 (Brew/Flash). Multi-day F1 (Team C) is next. LINE images: read them in chat.line.biz (SYSTEM-FACTS).**
> _Older line:_ **(03:30): the joint full-tree gate is GREEN** (PLAN-2026-11-13-joint-deployable-commit-sb-sf.md § Gate result). All 4 front-office jobs are done: 942, 959/960, 961/962, 965/966. **Waiting for the owner's «ขึ้น git»**, then the sid deploy of that commit, then Tanya, then uat. uat steps for the owner go in chat at the moment of asking (uat = «รวมโค้ด» + «release code», then his routine + preflight/migrate/verify 0077–0080, ledger 102); team detail in `DEPLOY-NOTE-uat-2026-11-13-close-a-day.md` + PLAN § Gate result. **Don't tell ขวัญ** (owner, 11-13). Quote brief for แนท: `deliverables/QUOTE-BRIEF-for-nat-som-2026-11-13.md`. Daylight to-do: the REQ-row DELIVERED pass (Marie ORDER 67 (b)); the board is 44.7 KB.

## Standing ways of working (full text in SYSTEM-FACTS)
- **Deploys:**
  - The shared SB/SF tree is finished whole, then shipped once.
  - The gate is: tsc 0, every suite 0 fail, journal = ledger. Then the owner says «ขึ้น git», Silver commits both repos, and the owner deploys **that commit** to sid. Tanya tests, then uat gets the same commit.
  - **Never deploy a working tree.** Before any deploy ask, every SA confirms "nothing new of mine", and I check the tree's migrations against the target DB (F-068, F-072).
  - sid may stay broken until then (owner, 11-13).
- **The build pause until 14 Nov covers the BACK OFFICE only.** Front-office work runs now (owner, 11-12).
- **Pricing:** extra money is charged for the FRONT office only. Back-office feedback is free until 17 Nov (it goes on the GR web first). ขวัญ is an admin in BOTH systems.
- **LINE bot:**
  - The poller is `tools/watch-line.sh`. For a manual pull: `bun scripts/pull.ts --since $(cat .private/line-cursor)`, then file the result in `.private/line-*.json` and advance the cursor.
  - The bot sends at most 3 images per send. Every customer message needs the owner's "ส่ง".
  - When QA passes on something she asked for, I draft the "done" message at once.
- **One topic and one ask per message to the owner.** A ball line means the holder is moving. Relay doorbells for SAs whose sends are capped.

## Where things stand
- **Paid front-office deal: 4,000 ฿.** พี่ฟีน accepted it 11-12, in exchange for a Fastwork collab and a review. The post is up.
  - close-a-day B (REQ-5013): ✅ TEST-156 on sid.
  - change activity A (REQ-5014: TASK-961/962, Team B): done; Tanya is testing on sid.
  - multi-day schedule F1 (≈ 7.5 d, Team C): starts after REQ-5015. ขวัญ's answers are in.
- **Free:**
  - REQ-5015 (Team C, TASK-965/966): multi-coach leave, part-day leave, coach hours. Due **11-15**.
  - TASK-942: park fee, several groups per hour. D-155-1 fix done; the re-test waits for the full tree.
  - Activities & prices page in the back office: sized, step 1 ≈ 1.5 d, from 14 Nov. Owner go pending.
- **sid** runs the owner's full deploy of the shared tree (0077–0080 applied). Some paths are broken until 965 is green; Sector's avoid list is in TASK-965.
- **uat:** SB bfe5ef6 / SF 86316ee (11-11). Mixed activity «Private INLINE SKATE & FREESKATE» was added 11-13.
- **GR web:** round 12 live (TEST-151 passed). All of ขวัญ's 11-12 back-office feedback is on it.

## Waiting
- **The owner:** approve the LINE words for part-day leave («เวลา {from}–{to}»), REQ-5015 Q1. Then the go for the activities & prices page.
- **ขวัญ:** 2 ECA questions (revenue = pre-VAT? net = gross − WHT?), the Fastwork account name, and her morning feedback.
- **แนท:** the quotation, from `deliverables/NAT-info-som-extra-work-2026-11-12.md`. Paid 4,000.

## Next
1. **~11-15:** Team C finishes. Then the full-tree gate, «ขึ้น git», the sid deploy of that commit, and Tanya: TEST-155 re-run, REQ-5014, REQ-5015.
2. **uat:** the same commit. Migrations 0077–0080 run in one go at a quiet time (0078 locks bookings), per `DEPLOY-NOTE-uat-2026-11-13-close-a-day.md`.
3. **14 Nov:** the back office resumes. Deploy the English bundle (BB e3a37de / BF 68a9409) to sid, TASK-951, TASK-963/964, then the activities & prices page.

## Dates
- **17 Nov:** the GR feedback window closes. **18 Nov:** the URS PDF goes out.
- **Delivery bar:** Salary sid by 6 Dec, uat by 13 Dec · Revenue + Stock sid by 3 Jan · reports by 17 Jan.
