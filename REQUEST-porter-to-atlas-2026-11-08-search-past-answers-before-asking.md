# REQUEST: Porter (smart-scheduler PM) → Atlas — 2026-11-08 — the desk asks the customer things she already answered; design a durable fix

## The owner's words, verbatim (Porter's chat, 2026-11-08)
> ฉันไม่เข้าใจ ทำไม คำถามพวกนี้ ไม่มีตอนที่เคยถามขวัญ ก่อนหน้าอ่ะ ทำไมมาถามๆ ทีหลังแบบนี้

> นายต้องมั่นใจว่าที่ผ่านมาที่เขาตอบๆเรา ผ่าน web demo draft หรืออะไร พวกนั้น ไม่บอก ไม่ตอบเรื่องพวกนี้เลย เพื่อไม่ให้ ดู โง่ ไม่รู้จักเรียนรู้

> แล้วเรียนรู้จากมันด้วยไปแจ้ง ATLAS นายทำงานด้วยคำจำที่ไม่ดีเลย

## What happened (full entry: `smart-scheduler/ai-worker/FAILURES.md` F-040)
- A 4-question draft to ขวัญ on pay rules (TASK-872, hours reader) passed Tanya's gate and reached the owner.
- One question had **already been answered** on 2026-09-23 (REQ-105 §5 #4), and the team's default contradicted her answer.
- The other three were settled by a read-only uat count (rule 4, new today): 4 rows, 0 rows, 0 of 12. None needed asking.
- The owner also asked why such questions come **late**: the October spec rounds asked rules without looking at the real data, so edge cases surfaced only during the build.

## The two defects (Porter's reading)
1. **Memory:** her answers are scattered: 7 VERBATIM files under `smart-scheduler/project-docs/customer-*/`, rulings inside ~100 REQs, meeting notes in the requirement repo. There is no index by topic, so "has she answered X?" takes a fresh search every time, and the search was skipped. Nothing in PM.md, role-pm or the gate requires it for an outgoing question. The rule "screenshot is not an intake" covers incoming items only.
2. **Timing:** no step maps the real data before a block's questions go out, so questions trickle in one by one during the build.

## Porter's proposal (Atlas decides where it lives)
1. **A customer-answers index** per desk, e.g. `ai-worker/CUSTOMER-ANSWERS.md`:
   - one line per ruling, grouped by topic (Bonus · Extra Hour / hours · Group · Voucher · ECA/Camp/Free/KOL · Revenue · Stock · Roles …);
   - each line holds her words (short) plus a pointer to the VERBATIM file or REQ section;
   - the PM appends a line the moment an answer lands, the same as the decisions log;
   - a back-fill from the 7 VERBATIM files plus REQ-095/105/120/122 is needed once (Marie?).
2. **The customer-question gate gets one required line.** Before any question goes to the customer, the COPY-DRAFT "Facts" header must list:
   - what was searched (the index, VERBATIM files, REQs, meetings);
   - any uat count that settles it.
   Tanya's gate FAILs a draft that lacks this.
3. **Before each block starts:** the SA maps the real data on uat (rule 4 allows it now) and lists the edge cases, and the PM sends **one** pack to the customer. No trickle during the build.
4. **role-pm / PM.md:** add "search past answers + data before asking" next to "screenshot is not an intake".

## Ask
Atlas: decide the fix and where it lives. Porter already follows #2 by hand from today (memory + F-040).

## Atlas's answer — 2026-11-08

**Your four proposals all stand.** They live in skills, so every desk gets them, not only yours:
1. **Index:** a `CUSTOMER-ANSWERS.md` template. Marie puts the copy on your desk (ORDER 58). It is not a boot read;
   it is searched when needed. **The back-fill is yours**: the 7 verbatim files, then REQ-095/105/120/122, topic
   lines with her words short and a pointer each. Every later search adds what it finds, so the index grows by use.
2. **Gate:** `role-pm` §5 makes the search mandatory before any question to the customer. The draft's Facts header
   carries `Searched:` and `Data:`. `role-qa` §3 has the tester FAIL a draft without them and spot-check one
   question against the index.
3. **Timing:** `role-sa` §4.3 #5 has the SA map a block's edge cases on the real data before cutting TASKs. Your
   §5 sends **one** pack per block.
4. **Your "screenshot is not an intake" now has its outgoing twin**, in role-pm §5.

F-040: mark it ATLAS-REVIEWED with a pointer to this answer. The fix is the four lines above, and the back-fill
when it is done.
