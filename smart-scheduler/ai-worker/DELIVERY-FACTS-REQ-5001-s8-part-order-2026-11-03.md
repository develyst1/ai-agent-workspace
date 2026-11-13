# DELIVERY FACTS for REQ-5001 §8: can Khwan choose the order of the parts? (Q1–Q5) · COMPILED, both teams · Sober (SA, Team A), 2026-11-03
**✅ FINAL, AGREED SET, 2026-11-03.** Silver confirmed every Q (see "Silver's corrections" at the end). His one refinement, that only R0.1 + R0.5 must precede the first block, is folded into Q4. **Porter: use these numbers only.**
**For:** @Porter, who writes the customer wording. Facts only; nothing here is customer text.
**Sources:**
- Team B's lines are Silver's, verbatim in substance (`inbox/PM.md`, "@Silver → @Porter — REQ-5001 §8: Team B's lines");
- Team A's are mine;
- the days: Silver's 10-20 re-size (174.6);
- the build order: `SIZING-REQ-120-revenue-frontoffice-2026-10-15.md` + `SIZING-REQ-120-salary-stock-2026-10-15.md` §3.

> **Correction (my error, now fixed):** my first version of this file (earlier on 11-03) put roles (R0), F3 and F6 under Team B. They are **Team A's**: my own 10-25 readiness review covers them, and Porter set F3 / F6 = Team A on 10-16. That made me call Team B the long pole and give **≈ 10 weeks**. With the right split, the critical path is Team A, and the total is in Q3 below. FAILURES entry written.

**One rate for both teams** (Silver's, which I adopt so the two halves agree):
- each team = 1 back + 1 front engineer ≈ 2 engineer-days per working day;
- at ≈ 70 % parallel efficiency (hand-offs between back and front) ≈ **7 engineer-days per calendar week**;
- **+ ≈ 1 week per part** for SA review + Tanya's QA on sid.
- The 174.6 days exclude QA / deploy / UAT.
- **Optimistic edge:** full parallel use (≈ 10 engineer-days a week). It's shown where it changes the answer. I don't count on our recent faster pace: it was on a mock with no data and no customer UAT.

## Q1. Each part
| part | days | team | ≈ calendar to sid, UAT-ready, QA included (7 ed/wk) |
|---|---|---|---|
| **Salary** (R1) | 43.1 | A | ≈ 7 wk. **First slice ≈ 4 wk:** real slips with base + the manual lines (OT, Merit, Transportation, Other ±), confirmed by each person |
| **Stock** (R3) | 37.0 | A | ≈ 6 wk. **First slice ≈ 3 wk:** catalogue from her Excel, Stock In, live balance per location, Demo |
| **Revenue** (R2) | 32.8 | B | ≈ 5–6 wk (Silver) |
| **Front office**: Team B's items (F1 branch 7.2 · F2 method 8.8 · C-d installments 5.5 · F4 Conversion 5.5 · F5 Park Rent 2.8 · D3 To Confirm Camp 4.4) | 34.2 | B | ≈ 6 wk; **F1 + F2 alone ≈ 3 wk** (Silver) |
| **Front office**: Team A's items (F3 multi-role / STAFF 9.4 · F6 coach login 2.2) | 11.6 | A | ≈ 2–3 wk |
| **Roles** (R0) | 12.7 | A | ≈ 2–3 wk |
| **Integration** (C1, posting at confirm) | 3.3 | B | ships **inside** the Revenue release (Silver) |
| **total** | **174.6** | **A 104.4 · B 70.3** | |

**The cut I recommend for her choice: 3 blocks + roles first.** "Front office" isn't one thing she receives; it splits by what it feeds, the same way today's installments already do:

| block | contains | days | price |
|---|---|---|---|
| **Roles** (+ C1 integration) | everyone's sign-in and what each sees · C1 | 16.0 | 3,600, **with the first block** (C1's ≈ 750 of it is delivered with REVENUE; see Q5) |
| **STOCK** | Stock | 37.0 | 8,300 |
| **REVENUE** | Revenue + F1 · F2 · C-d · D3 · F5 | 61.4 | 13,800 |
| **SALARY** | Salary + F3 · F4 · F6 | 60.2 | 13,500 |

That is 39,200 ฿, and in today's order exactly today's 11,900 / 13,800 / 13,500. Silver's split by days (front office ≈ 6,450 with REVENUE + ≈ 3,850 with SALARY) agrees with mine (≈ 6,400 + 3,800) to rounding.

## Q2. Hard dependencies (one line each)
1. **Roles (R0, Team A) first, or in the same release as the first block.** Every screen is reached through it. Revenue is CEO-only, so it can't go live without R0's roles (Silver).
2. **Revenue ships with C1** (Team B). The posting point moves from day-end to confirm in the same release; otherwise a sale counts twice (Silver).
3. **Salary needs F3 + F6 (Team A) and F4 (Team B):** F3 feeds FL pay / Extra Hour / OT, F4 feeds Bonus 50 / 100, and F6 is how a coach opens their slip. ✅ Porter's pair 1 confirmed by both SAs.
4. **STOCK OUT's commission is paid only once Salary exists.** Stock records each line's commission from day one. ✅ Confirmed.
5. **Stock sales reach Revenue only once Revenue exists.** Stock first is fine; Revenue picks up the recorded movements later. ✅ Confirmed by both.
6. **Salary before Stock:** commission is typed by hand (Other ±) until STOCK lands. Everything else on the slip works.
7. **Soft, not hard (Silver; this corrects my earlier "hard"):** F1 / F2 / C-d / F5 / D3 work in the front office alone. Revenue alone works with the defaults (branch Bravo, method Transfer). They make Revenue *complete*; they don't block it.

**Parallel:** any pairing works, Team A on STOCK / Roles / SALARY's F3 + F6 + Salary and Team B on REVENUE / its front-office items / F4. The one rule: **SALARY waits for (or runs alongside) F4.**

## Q3. The fastest total, both teams in parallel
| | at 7 ed/wk (planning rate) | at 10 ed/wk (optimistic edge) |
|---|---|---|
| as split today (A 104.4 · B 70.3: Team A is the critical path) | **≈ 15–16 wk** | ≈ 11–12 wk |
| **rebalanced to ≈ 87 d each** (Team B takes ≈ 17 d of Team A's work, e.g. Stock's front-end pages, which Fanta already built in the final UI) | **≈ 13 wk ≈ 3 months** | **≈ 10 wk ≈ 2½ months** |

- **It assumes:**
  - the load is rebalanced;
  - her product Excel + stock counts at GO (the Stock import is the likeliest overrun);
  - UAT feedback within about 2 working days a round;
  - the owner's deploys within a day of "ready".
- ⚠️ **What this means for the deck's "2–3 months":** it holds only at the optimistic edge **and** with the rebalance. At the planning rate it's **about 3 months**.
  - **Both SAs agree it can't honestly be shorter** with 4 engineers. Silver: *"2–3 months is already tight"*.
  - The customer line is yours; the facts point to **"about 3 months"** for everything.
- **What is genuinely fast is the FIRST block:** 3–6 weeks (Q4).

## Q4. The first block to go live (weeks after GO, planning rate)
| first block | weeks | notes |
|---|---|---|
| **STOCK** (first slice) | **≈ 4 wk** (≈ 3 at the optimistic edge) | Team A: R0.1 sign-in / roles + R0.5 labels (6.6 d ≈ 1 wk, Silver's refinement) → the Stock slice (≈ 2) → QA. Full Stock ≈ 7–8 wk |
| **REVENUE** | **first usable piece: EITHER F1 + F2 ≈ 3–4 wk, OR Revenue + C1 ≈ 6 wk (one or the other, not both) · the whole block ≈ 10 wk** | all Team B's (64.8 d incl. C1, in the same two hands), with Team A building R0.1 in parallel. *(Re-marked 2026-11-03 on Silver's correction: my "F1 + F2 ≈ 3 wk extra, in parallel" assumed a spare engineer Team B doesn't have.)* |
| **SALARY** (first slice) | **≈ 5–6 wk** for slips with base + manual lines (R0.1–R0.3 + R0.5 + F6 ≈ 11 d first); the full Salary (FL pay + bonuses) ≈ 10–11 wk, sequential in Team A | Team A: Roles + F6 → the slice; F3 (A) and F4 (B, ≈ 1.5 wk in parallel) for the rest. Commission by hand until STOCK |

**None of the three is impossible as first.** Roles always ship with the first block.

## Q5. Installments that follow her order
- **Yes:** each installment = the block she receives (STOCK 8,300 · REVENUE 13,800 · SALARY 13,500), **+ Roles 3,600 with whichever block is first.** The total stays 39,200; today's order gives exactly 11,900 / 13,800 / 13,500.
- **The two strict "together" rules** (both SAs):
  - Revenue + C1 (+ R0 live);
  - Salary + F3 / F4 / F6.
- **Two small price-allocation choices** (yours, ≈ ±750 ฿ each; I'd keep the round numbers):
  - C1 (≈ 750) is priced inside "Roles 3,600" but delivered with REVENUE;
  - F5 (≈ 600) sits in REVENUE; it could move to SALARY if SALARY comes first.
- The brief §4 price "front office 10,300" **can't be its own installment**: she never receives it in one piece. It splits ≈ 6,400 / 3,800 across REVENUE and SALARY.

## Silver's corrections
**Silver (SA-B), 2026-11-03: ✅ I CONFIRM this compiled version as written, every Q.** I added only this section.
- **Owners:** R0, F3 and F6 belong to Team A, so A = 104.4 and B = 70.3. That is my split, and Porter's 10-16 ruling (log/2026-10-16 l.7). Agreed.
- **The rate:** 7 engineer-days per week + 1 week QA per part, with 10 as the optimistic edge. That is my rate, and I stand behind it.
  - Most of Team B's days sit in ONE repo (`smart-scheduler-back`) on shared hot files: the confirm postings, F2's dialogs, C1's write points.
  - My 10-15 sizing §3 already says F1 / F2 / F3 can't all run at once. So 10 is a ceiling, not a plan.
- **The total:** ≈ 13 weeks rebalanced at the planning rate, ≈ 10 at the edge. **"About 3 months" for everything: I sign it.**
- **The 3-block cut + roles first:** confirmed.
  - One refinement: what must land ahead of the first block is R0.1 sign-in / roles + R0.5 labels (≈ 6.6 d).
  - R0.4 notifications (6.1 d) is needed only before Salary's notices / Low Stock, and R0.2 / R0.3 (2.2 d) with the Salary slip.
  - This shortens nothing on Team B's side. It may help Team A's "Roles ≈ 2–3 wk".
- **Q4 REVENUE ≈ 6 weeks:** confirmed. Revenue + C1 = 36.1 d ÷ 7 ≈ 5 wk + 1 wk QA, with Team A building R0.1 in parallel.
  - If Team B also had to build R0.1, it would be ≈ 7 weeks.
  - F1 / F2 / C-d / D3 / F5 complete the block later, inside REVENUE's ≈ 13,800.
- **Q2 / Q5:** confirmed as written.
- **Added 2026-11-03 (Porter's ask, TEST-132): the WHOLE REVENUE block when it comes first = ≈ 10 weeks from GO, at the planning rate, QA included.**
  - The block: Revenue 32.8 + C1 3.3 + F1 7.2 + F2 8.8 + C-d 5.5 + D3 4.4 + F5 2.8 = **64.8 d**.
  - It is all Team B's, at 7 per week ⇒ ≈ 9.3 wk + 1 wk QA ⇒ **≈ 10 weeks** (≈ 7.5 at the optimistic edge).
  - **If F1 + F2 go first:** 16.0 d ⇒ **≈ 3–4 weeks** live on their own (branch + payment method in the front office). The rest of the block is still done by ≈ 10 weeks.
  - **Revenue + C1 alone** stays ≈ 6 weeks, but only if Revenue is built before F1 / F2. Then F1 / F2 / C-d / D3 / F5 follow by week ≈ 10.
  - **Either way, the whole block is ≈ 10 weeks.**
  - ⚠ **Q4 row "REVENUE" needs re-marking by Sober:**
    - "F1 + F2 make it complete at ≈ 3 wk extra, in parallel" is not true. Team B has no spare engineer to run them in parallel; they come after, in the same two hands.
    - Whole block ≈ 10 weeks; its first usable piece ≈ 3–4 weeks (F1 + F2) or ≈ 6 weeks (Revenue + C1). It's one or the other, not both.

## 2026-11-05: the Salary → Revenue → Stock order (REQ-120 §11): Team B's half (Silver, SA-B)
Read-only: no GO, no TASK, no code. Same rate as above: 7 engineer-days per week, + 1 week QA. **Team A's half (Extra Hour / F3, the slice's weeks, what else is on the slip, the Stock dates) is Sober's, in his own section. Where a number below depends on his, his wins.**

**1. F4 for Bonus 100, and whether Bonus 50's part can wait**
- **F4 is 5.5 d as sized, and nothing splits it yet.** My estimate of the split, not a sized number:
  - Bonus 100's part ≈ 4 d: the first coach of a course, the course → renewal link, and the admin's "choose" when the coach changed mid-course;
  - Bonus 50's part ≈ 1.5 d: the trial → course / voucher link and the first coach of a trial.
- **Weeks:** ≈ 1 week after GO for the whole of F4 (5.5 ÷ 7), against ≈ 0.6 week for Bonus 100's part alone. It goes through QA with the Salary slice, so it has no QA week of its own and **does not hold the slice back**.
- **Bonus 50's PAYMENT can wait. Recording its link should not.**
  - Nothing stores this link today (REQ-120 C3), and D6 removed the back-fill.
  - If the link isn't recorded from go-live, a trial → course in that gap has no stored link. It could only be rebuilt later by guessing from history (the heuristic D6 removed, ≈ 1.1 d), and a guess decides who gets paid.
  - Deferring saves ≈ 0.2 week.
  - ⇒ **My line: build all of F4 in that first week, and let only the Bonus 50 pay line wait** (the pay line is Sober's).
- **One overlap to manage:** F4 and F3 are both in `smart-scheduler-back` in the first weeks, across two teams. F4 is short and comes first. The exact files get checked when TASKs are cut. Not a date change.

**2. Revenue's dates after it** (Team B: F4 first, then the block)
| what | weeks after GO | was (Revenue first) |
|---|---|---|
| F4 built | ≈ 1 | not applicable |
| first usable piece, EITHER F1 + F2 | ≈ 4–5 | ≈ 3–4 |
| OR Revenue + C1 | ≈ 7 | ≈ 6 |
| **the whole REVENUE block** (70.3 d incl. F4 ÷ 7 + 1 QA) | **≈ 11** | ≈ 10 |

- ⇒ **F4 first moves Revenue by ≈ 1 week.** Team A's R0.1 is still needed by the time Revenue goes live; it is first in Sober's order, so it causes no wait.

**3. The total, Team B's view** (my arithmetic; Sober's Stock number wins)
- Team B finishes at ≈ week 10–11, and can then take ≈ 17 d of Stock (the rebalance in Q3).
- With that, Stock lands at **≈ week 13–14**, so **≈ 3–3½ months** in this order.
- Without the rebalance, Team A alone runs ≈ 15–16 weeks (Q3).

**4. ECA in Revenue: ✅ confirmed in scope, 0 d added**
- It is in REQ-120 §2 (per term: price × students × classes, ฟีน enters, counts on the date the school pays), it is in R2.2's 32.8 d, and it is a page of the final UI (ECA Payment).
- It ships with Revenue + C1.

**5. ⚠ One open rule that changes when the first Bonus 100 appears: for @Porter, not decided here**
- Question 13 of the long draft (10-25 Q5) was **not** among the 6 she answered, and I stated no default for it: a renewal after go-live of a course from BEFORE go-live.
  - **A, paid:** Bonus 100 can appear on the first slips. Needs the old course's first coach from the timetable, my estimate ≈ +0.5 d.
  - **B, not paid (both sides after go-live):** the first Bonus 100 appears only when a course sold after go-live is renewed, so **the first slips may show none**, which she may not expect, since she asked for it in the first slice.
- D6's words (*"เริ่มนับเฉพาะวันที่ระบบเสร็จเลยไม่ทำย้อนหลังค่ะ"*) lean to B, but they were answering about history. Worth one line in the 11-07 room. **Until it's answered, I plan on B (0 d).**

## Added 2026-11-05: her order, SALARY → REVENUE → STOCK (REQ-120 §11). Read-only, no GO · Sober (Team A)
**Status:** Team A's half; Silver's half is the section above, and **the two agree** (F4 whole in the first week, Revenue wk 7, whole block wk 11, total ≈ 13–14 wk, the Bonus 100 question). **The one line still needing his yes: F5 ahead of Revenue** (§1). Same rate as above: 7 engineer-days a week per team, ≈ 1 week of review + QA before a piece is live; builders keep building during that week.
**Her first slice:** base salary + Extra Hour + Bonus 100 ("คอร์สต่อคอร์ส"); Bonus 50 later.

### 1. Weeks after GO to that slice: **≈ 7 weeks** (≈ 5 at the optimistic edge). Q4's "≈ 5–6" was a smaller slice
| Team A piece | d | why it's needed |
|---|---|---|
| R0.1 sign-in + R0.5 labels · R0.2 / R0.3 | 8.8 | everything; pay visibility |
| F6 coach login | 2.2 | a coach opens their slip |
| **F3 multi-role / STAFF** | 9.4 | **Yes, it changes it:** Extra Hour pays FT and PT "on PT days only", so it needs roles by day (sizing: Extra Hour and the hours reader depend on F3) |
| R1.2 pay profile (base) · R1.1 role by day | 5.0 | base salary |
| hours reader · Extra Hour | 4.5 | |
| R1.4 + R1.5 pay run · R1.6 slip | 10.0 | the slip itself, confirm, auto-lock |
| Bonus 100 (the Bonus 50 / 100 line is 3.3; 100's part ≈ 2) | ≈ 2 | my split of that line, not a sizing |
| **Other ±** (not on her list; see §4) | 1.1 | the only by-hand channel |
| **total** | **≈ 43** | ÷ 7 ≈ 6 wk + 1 wk QA ≈ **7 wk** |

- **Needed from Team B, in parallel:**
  - **F4 (5.5 d, built whole in ≈ week 1; Silver above):** the renewal link and the first coach. **Yes, Bonus 100 needs it.**
  - **F5 "No Teacher" (2.8 d)** `[Silver to confirm: not in his section]`**:** without it, park-fee blocks count as teaching hours and inflate Extra Hour. F5 sits in REVENUE's price today, so this is Q5's case: F5 ≈ 600 ฿ may move from REVENUE to SALARY, or keep the round numbers (Porter's call).

### 2. The blocks in her order, and the total
| block | live ≈ (planning rate) | notes |
|---|---|---|
| **SALARY**, her slice | **wk 7** | as above |
| **SALARY**, whole block (+ F3 · F6 · Roles; 67.4 d on Team A) | **wk 10–11** | FL pay, OT, Merit, Transportation, Bonus 50, reports. **Commission stays by hand until STOCK** |
| **REVENUE** (Revenue + C1) | **wk 7** (Silver) | F4 first moves Revenue ≈ **1 week** later than Q4's ≈ 6; F5 as well adds ≈ 0.4 wk more, which rounds into it |
| **REVENUE**, whole block (+ F1 · F2 · C-d · D3) | **wk 11** (Silver) | Team B's whole 70.3 d ÷ 7 ≈ 10 wk + QA |
| **STOCK**, last | **≈ wk 14** | starts ≈ wk 10–11, when both teams free up: 37 d with both teams (Fanta on its front end) ≈ 3 wk + QA |

- **The total: ≈ 14 weeks** (≈ 10–11 at the edge), against ≈ 13 in Q3 (Silver's own view: ≈ 13–14; he defers to this Stock number). A single last block can't be split between two teams as cleanly as the earlier rebalance.
- **"About 3 months" is at its upper edge in this order:** it's 3 months and a bit. Stated as a fact; the wording is yours.
- **Her ECA note** ("ก้อนรายได้ต้องมีเรื่อง ECA ด้วย"): already in Revenue's scope (REQ-120 §2), so no change.

### 3. Bonus 50 shipping later: is a trial → course in between lost?
- **Not lost, if F4 ships whole.** F4 stores both links **at the sale** (trial → course / voucher, and course → renewal) and the first coach at delivery. That's one piece of work in the sale path; there's no reason to split it. So I'd build F4 whole, ahead of Revenue.
- **Then:** from go-live every trial → course link is recorded, and when the Bonus 50 line ships (≈ 1.3 d of calculation) it can read them all.
- **D6 "no back-fill"** only concerns sales *before* go-live; these are after it.
- **Open:** does the gap get **paid** when Bonus 50 ships (default: yes, on the first slip after it ships, since the rule was already in force), or only new ones from then? That's for the customer.

### 4. What's on the first slip that she did NOT list
| item | until it ships |
|---|---|
| **FL teaching pay** (1.7 d) | **By hand** through Other ±, or wait. It's ≈ 2 weeks after the slice in Team A's queue. ⚠️ Freelancers' pay would otherwise be missing from the slip |
| **OT** (1.7 d) | by hand through Other ± |
| **Transportation** (3.3 d) | by hand through Other ± |
| **Merit** (1.1 d) | by hand through Other ± |
| **Other ±** | **in the slice** (I added it, 1.1 d): without it nothing above can reach the slip |
| **Commission** | by hand through Other ± until **STOCK** (≈ wk 14): the longest gap, about 3 months |
| **Bonus 50** | waits (§3): recorded, not paid |

- **So until the whole block (wk 10–11), the slip is real but partly hand-typed.** They may well keep their Excel beside it for those weeks.

### ⚠️ One thing you didn't ask, for the room: Bonus 100 pays almost nothing at first
- **Why:** my default S13 (REVIEW-backoffice-build-readiness §1, from her D6 *"ไม่เอาทั้งคู่ค่ะ เริ่มนับเฉพาะวันที่ระบบเสร็จเลยไม่ทำย้อนหลังค่ะ"*) pays a bonus only when **both ends** are in the system after go-live. Q8 ("Bonuses around go-live") was never asked of her, so this default stands.
- **The effect:** a renewal after go-live of a course sold *before* go-live pays **no** Bonus 100. Courses run for months, so her first-choice bonus would show little or nothing on the early slips. She put it first, so she may expect otherwise.
- **The alternative, ≈ +0.5 d (Silver's estimate):** count a renewal after go-live even if the old course is older, reading its first coach from the timetable (S14: the coach on the first attended session). Nothing is paid backwards; only the new renewal pays.
- **Decision:** the customer's, using **Silver's labels** (his §5 above): **A, paid:** the renewal after go-live is enough (≈ +0.5 d). **B, not paid:** both ends after go-live (what both SAs plan on until answered, 0 d). My recommendation: A, since it's what "Bonus 100 first" appears to want.

### Silver's corrections (2026-11-05)
_(Silver: only F5 is open: does F5 go ahead of Revenue, with F4? Confirm or correct here. SA ↔ SA goes through this file / Porter.)_

**Silver, 2026-11-05, on F5 (the line left open for me): ✅ confirmed. F5 goes ahead of Revenue, with F4.**
- My 10-15 sizing already orders F3 / F4 / F5 before Salary (§4 step 5).
- F4 + F5 = 8.3 d ≈ 1.2 wk. Revenue + C1 stays wk 7 (≈ 7.4 rounds in). The whole REVENUE block stays wk 11, because F5 was already inside its 70.3 d. F1 + F2 stays ≈ 4–5 wk.
- The price question (≈ 600 ฿) is Porter's.
