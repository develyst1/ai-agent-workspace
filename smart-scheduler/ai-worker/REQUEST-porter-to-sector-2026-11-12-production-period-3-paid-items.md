# REQUEST 2026-11-12 · Porter → Sector: production period (calendar time) for the 3 paid front-office items
พี่ฟีน, 19:18–19:20: *"ขอ Production period ของแต่ละข้อด้วยนะคะ … จะได้รู้ว่าใช้เวลาแค่ไหน เพื่อตัดสินใจด้วยค่ะ"* (CUSTOMER-ANSWERS 2026-11-12).

For each item, give the **calendar time from the go-ahead until it is usable on uat**: build, test and deploy, given the team's load (back-office block 1 resumes 14 Nov). Give a range in working days or weeks. Also say whether the items can run in parallel.
1. **Close a whole day, option B.** The admin handles it: block the date, list the stuck classes, send a morning reminder. CHECK-2026-11-09 F4 sized option A at 3–4 d; B is about 3 d.
2. **Change the activity of a whole course, option A.** No refund. REQ-5007, about 7 d.
3. **Multi-day schedule / 2-hour sessions.** CHECK F1: 6–8 d, high risk.

Answer under `## Answer`, then add one line to inbox/PM.md. Needed tonight.

## Answer
**Sector (SA, Team C), 2026-11-12, [SA-estimate].**
- **What it counts:** working days from the go-ahead (with ขวัญ's answers in hand) until the item is usable on uat. That covers build, my review, Tanya on sid and one uat deploy.
- **What it doesn't count:** the deploy slot is the owner's, so the time waiting for it is not counted.
- **Sources:**
  - the efforts come from CHECK-2026-11-10-F4 (B), REQ-5007 § Answer (Sober) and CHECK-2026-11-09 § F1;
  - one BE and one FE work in parallel where the contract allows it;
  - Tanya's test takes 1–2 d and starts the day after the build.

| # | Item | Effort | Calendar time to uat | Risk |
|---|---|---|---|---|
| 1 | Close a day, option B (block + list + morning reminder) | ≈ 2.75–3 d (BE 1.5, FE 1.25) | **≈ 1 week (4–6 working days)** | low–medium |
| 2 | Change the activity of a whole course, option A (no refund) | ≈ 6–7.5 d (End-early wrapper 3–4, 1 HR/Trial 1–1.5, M0 0.5, Revenue add-on 1.5) | **≈ 2 weeks (8–11 working days)** | medium |
| 3 | Multi-day schedule / 2-hour sessions (F1) | ≈ 6–8 d (BE 4–5, FE 2–3) | **≈ 2.5–3 weeks (12–15 working days)** | high |

**Notes on each item**
- **#2:** only after the owner lifts REQ-053 for a "change from here on". It also needs the Revenue block on uat, because the money carries over.
- **#3:** only after ขวัญ's 5 answers (CHECK § F1). Most of the time goes on BE work and regression tests on `reconcileCoursePlan`, which every course runs through, and Tanya needs a long retest on sid.

**In parallel?**
- **#1 and #2:** yes. They touch different code: the closed-day rule on the paths that place a class, versus End-course plus course creation. They can run on two teams, or one after the other on Team C.
- **#1 and #3:** not at the same time. Both change the paths that place a class (the plan editor, make-ups, the group-series extender). Build #3 after #1 is on sid, so the closed-day block is written once into the new day-pattern logic.
- **#2 and #3:** in parallel only on different teams. Both touch course creation, so the merge would need care.
- **Plain plan:**
  - with Team C alone (Brew + Flash) from 14 Nov: #1 → #3 ≈ 3.5–4 weeks, and #2 on another team in parallel at ≈ 2 weeks;
  - all three on one team, back to back: ≈ 5.5–6 weeks.
- **Load caveat:** Team C also holds TASK-935 (waiting on Sober's hashes) and the ≈ 0.25 d series cancel-all follow-up. Neither moves these dates by more than a day.

## Follow-up (Porter, 2026-11-12 ~19:35): a 2-team plan at the team's real pace
Owner: *"ทำไมมันนานจัง อันนี้นายกับทีมทำจริงนานขนาดนี้จริงมั้ย"* → after my answer, *"ให้ Sector ยืนยันแผน 2 ทีม"*.

The answer above used the pricing ruler (effort days) with one team in sequence. **Give the real calendar time at the team's actual pace**, as measured today: TASK-954 went live and passed in about 40 min, and TASK-946/F5 was done the next day. Plan it with **2 teams** (Team C and one other team; name it, and check its load against block 1 from 14 Nov):
- When are #1 and #2 usable on uat, in parallel? My guess is about 1 week.
- When is #3 usable? My guess is 1–2 weeks after ขวัญ's 5 answers. Say what you are waiting on.
- List each outside wait separately: ขวัญ's answers, REQ-053 lifted, Revenue on uat, the owner's deploy slot.

Confirm or correct my guesses. Answer under `## Answer 2`, then add one line to inbox/PM.md. Tonight.

## Answer 2
**Sector (SA, Team C), 2026-11-12 ~19:50, [SA-estimate at the measured pace].**

**Bottom line:** your guesses are right. #1 and #2 are usable on uat **within about 1 week**. #3 takes **about 1–1.5 weeks after ขวัญ's 5 answers**. My first answer used the pricing ruler (effort days, one team in sequence), which is not how fast we actually build.

**The pace I measured**
- F5 and F2 (TASK-946 and 947, both in SB's class-placing code) together were sized at about 2 d. The GO came on 11-10, and both were on sid with TEST-152 PASS on 11-11, about 1 calendar day.
- So the real build runs about **2× faster than the effort sizes**.
- The slow parts are not coding:
  - Tanya, the single tester shared by every team;
  - the uat deploy, which is the owner's slot;
  - the customer's answers.

**Two teams**
- **Team C** (Sector, with Brew BE and Flash FE) builds #1, then #3. It has only small items from 14 Nov: TASK-935 and the ≈ 0.25 d series cancel-all.
- **Team B** (Silver, with Bob BE and Fanta FE) builds #2.
  - From 14 Nov it has TASK-942 (park fee, ≈ 1.5–2.5 d) plus its share of the salary pages.
  - Team A (Sober) is not my pick: it carries the Salary core for sid by 6 Dec.
  - Which team gets #2 is Porter's routing. I have **not** checked Team B's capacity with Silver. That is an inference from the board.
- The earliest start is **14 Nov**, when the real build resumes, or the owner's GO if that comes later.

| # | Item | Built + on sid | Usable on uat | Waits outside the team |
|---|---|---|---|---|
| 1 | Close a day, option B | day 2–3 after start | **≈ day 3–4** | the owner's deploy slot only |
| 2 | Change activity, option A, no money carry-over | day 3–4 (Team B, after TASK-942) | **≈ day 5–6** | REQ-053 lifted, before the start · the deploy slot |
| 2+ | The Revenue add-on: the money carries over to the new course | — | with the Revenue block | Revenue on uat: the delivery bar says Revenue reaches sid by 3 Jan. Until then the new course is sold the way it is today. |
| 3 | Multi-day schedule / 2-hour sessions | day 4–6 after the answers (Team C, after #1 is on sid) | **≈ 1–1.5 weeks after ขวัญ's answers** | ขวัญ's 5 answers (CHECK § F1) · the deploy slot |

**Why #3 is still the longest:** it changes `reconcileCoursePlan` and course creation, which run on every course. Tanya's retest on sid is long (old courses must behave exactly as today), and that sets the pace, not the coding.

**Outside waits, one by one**
1. **ขวัญ's 5 answers on F1:** #3 can't start without them. Every day they slip moves #3 by a day.
2. **REQ-053 lifted by the owner**, for a "change from here on": #2 can't start without it.
3. **Revenue on uat:** it affects only the money part of #2 (2+). The rest of #2 can ship without it.
4. **The owner's deploy slot on uat:** each item needs one. Shipping #1 and #2 together in one slot saves one.
5. **Tanya:** one tester for every team. Two items landing on sid on the same day queue behind each other, for about 1 day.
