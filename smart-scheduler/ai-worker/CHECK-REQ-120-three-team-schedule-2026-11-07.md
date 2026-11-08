# CHECK: REQ-120 — the three-team schedule for the Master Plan
**Porter, 2026-11-07.** Owner: *"เอา ร่าง Master Plan เลย"*. พี่เบส asked for a Master Plan (all features + clear durations) before work starts. Draft: `project-docs/master-plan-2026-11-07/MASTER-PLAN-v1.md` (weeks marked `[SA]` wait for this file).
**Read-only. No GO, no TASK.** No SA-to-SA edge (ORDER 56.2): each answers in his own section; Porter reconciles.

## What changed since your last sizes (all owner rulings, REQ-120 §13)
- Salary first, **whole block**, fast (A + B on it). Commission waits for Stock.
- IN scope, inside 39,200: slip export (5 d) · CEO "remind now" (1 d) · git-style Stock import, diff → confirm → movements (+2.5 d, Sober) · course-change revenue split **A** (1.5 d, Silver) · dark theme (0.5–1 d). **Stock card view OUT.**
- Team C (Sector, Brew, Flash) exists. Second tester (Twenty) exists.

## Porter's proposed piles (the three-way split, to be torn apart)
| team | pile |
|---|---|
| **A** Sober · Jason · Fern | Salary spine (Sober's: R0.1 → F3 → hours reader → pay run → slip, Extra Hour, FL pay, OT, Merit, Other ±, F6), then **Stock** |
| **B** Silver · Bob · Fanta | Salary's parallel pile (Silver's list: F4, F5, Bonus lines, Transportation, remind, R1.7/R1.8, the 8 screens, export), then Stock's share (rebalance) |
| **C** Sector · Brew · Flash | **Revenue** whole: R2.1–R2.5 + C1 + F1 · F2 · C-d · D3 · ECA · refund (C-f) · revenue split A, in parallel with Salary from week 1 |

## Questions
1. **(Sober)** Your pile's weeks: Salary live on sid / uat; then Stock (39.5 d with the git import) with Team B's help: Stock live week. Does Team C on Revenue change anything you need (C1 touches the sale path; F3 and F4 hot files)?
2. **(Silver)** Your pile's weeks; then your Stock share. Hand-over to Team C: anything of Revenue you have built or designed (GAP-backoffice-revenue, CHECK-REQ-5007) that Sector must start from? **Confirm the worked example** in the draft's §8.2 (10 h skate, 5 taught, switch to bike: what the revenue report shows by month and activity) is what "A" builds.
3. **(Sector)** Revenue with Team C from week 1, at the rate you'd sign: Revenue + C1 live week, whole block live week. What you need from A or B first (R0.1 roles: Revenue is CEO-only; F4 links), and the hot files with them.
4. **(All)** Anything in the draft's feature lists that is wrong, missing, or promised beyond the files: say the line and the fix.

## Answers
### Sober
**Q1 — my pile's weeks.**
- **Salary (A + B both on it, QA alongside):** critical path is the serial spine R0.1→F3→hours reader→pay run→slip ≈ 28.8 d (my whole-block answer). **Live sid ≈ wk 6 · uat ≈ wk 7.**
- **Stock (A + B move over after Salary; git-import 39.5 d, Stock Card OUT):** can start ~wk 6–7 while Salary sits in uat; 39.5 d ÷ two teams + 1 QA wk. **Live sid ≈ wk 10 · uat ≈ wk 11.**
- **So my pile: Salary wk 6–7, Stock wk 10–11.** Unchanged by headcount beyond ~2 teams on each (the spine is the wall).

**Does Team C on Revenue change what I need? Yes — two things.**
1. **R0.1 roles must ship first, as a published contract.** Revenue is CEO-only, so Team C can't integrate until R0.1 lands. It is already the **first link of my spine** (Jason, wk 1–2) — but its **role contract must be published early** so C builds Revenue behind it from week 1. Flag for Porter: prioritise R0.1's contract.
2. **🔴 A three-team hot-file collision on the sale-post path.** **C1 (Team C)** moves the posting point in `recordSale` / `sale-post.ts`; **F3 (my spine)** touches the **same booking transaction** (the freelance ceiling); **R3.5 (Stock)** also writes the sale/movement path. Three teams editing one transaction path at once is the top rework risk. I need, **brokered by Porter (SA↔SA isn't a channel):** a stated **owner + sequence for `sale-post.ts` / `recordSale` / the booking tx** (one team at a time, or a designed seam agreed before anyone edits it), and **three separate test DBs + dev ports** so the teams don't drop each other's data.

**Q4 — line check: the draft `MASTER-PLAN-v1.md` is NOT on disk yet** (`project-docs/master-plan-2026-11-07/` doesn't exist). I won't review lines I can't read. The lines my blocks **must** carry when you write it — I'll line-check against the file once it exists:
- **Salary:** first slip **and** whole block both ≈ **wk 6–7 sid / 7 uat**; **commission is BY HAND (Other ±) until Stock (~wk 10–11)** — name it as the one gap, or "ครบ" is false.
- **By-hand gaps, each with its end week:** nothing on the Salary slip is "missing" — it is hand-entered via Other ± until its line ships; list FL pay / OT / Transport / Merit / Bonus 50 / commission with the week each becomes automatic.
- **Stock:** git-style import (diff → confirm → movements, nothing deleted); **Stock Card view is OUT of scope**; Stock ≈ wk 10–11.
- **Extras rule:** 263 ฿/d during the build · 500 ฿/d after the 6-month free warranty.
- **In-scope extras folded into 39,200:** slip export (+5 d), CEO remind-now (+1 d), git-import (+2.5 d), dark theme (0.5–1 d) — **only if พี่ฟีน accepted the ≈ +6 d / 1,600 ฿ number** (still open, meeting read-out #1).

### Silver
**Silver (SA-B), 2026-11-07. Read-only:** my estimates, not sized TASKs. Sober leads Salary and Stock: his chain, critical path and the Stock split win over mine.

**Q2a. Team B's weeks** (2 engineers; "at 7" = 7 engineer-days a week per team; "at 2×" = the rate I'd sign, 14, if rulings and sid deploys each come within a day)
| | d | at 7 | at 2× |
|---|---|---|---|
| **Salary's parallel pile:** F4 5.5 · F5 2.8 · Bonus 50/100 3.3 · Transportation 3.3 · remind 1 · R1.7 + R1.8 6.1 · 8 screens ≈ 12–14 · export 5 | **≈ 39–41** | built ≈ wk 6 | built ≈ wk 3–3½ |
| **Stock share:** my proposal, Sober to split. R3.3 locations 2.2 (no dependency, can start first) · R3.6 Demo 6.6 · R3.7 Low Stock 2.2 · R3.8 reports 4.4 · their screens | **≈ 15–20** | built ≈ wk 8½–9, **live ≈ wk 10** | built ≈ wk 5, **live ≈ wk 6** |

- ⚠️ **At 7, Team B's Salary pile is about as long as Team A's spine.** "Salary on sid ≈ wk 5–6" in the draft only holds at a rate above 7. At 7, Team B lands at ≈ wk 6, the draft's outer edge.
  - If the rate slips, **the R1.7 / R1.8 reports (6.1 d) go last.** They read the finished pay lines, so they're the first thing to cut from the live date and ship a week later.
  - The draft shouldn't promise wk 5–6 unless Sober signs a rate above 7.
- **Stock live is Sober's number.** Mine above assume Team A's R3.1 products and R3.5 sales arrive as Team B finishes Salary. If not, Team B starts with R3.3 and has a gap.

**Q2b. Handover to Team C (Sector): what Revenue starts from**
- **Nothing of Revenue is built.** Designed and mapped, to read first:
  - `GAP-backoffice-revenue-2026-10-13.md`: today's code, every posting point (sale / day-end / camp / rental / ECA), keys, and why nothing posts at confirm;
  - `SIZING-REQ-120-revenue-frontoffice-2026-10-15.md`: R2.1–R2.5 · F1 · F2 · C-d · D3 · C1, the order (F1 + F2 before R2.2) and the risks (§ "No Teacher" leaks; exact only from go-live);
  - `CHECK-REQ-5007-money-2026-11-07.md` §2 and §4: the split's design (the re-class pair) and **one trap to fix inside R2.** Today's back-office revenue by activity takes a course's activity from **its first class row, unordered** (`backoffice-back` `revenue.service.ts:70-78`). After any switch, the sale's activity can flip between reads;
  - DELIVERY-FACTS (11-03 / 11-05): C1 ships inside Revenue; F4 + F5 go ahead of it.
- **F4 and F5 stay Team B's** (Salary needs both). Team C depends on F5 for Park fee (the "No Teacher" teacher) and gets it in week 1. Revenue itself doesn't read F4.
- 🔴 **Hot files, Team B ↔ Team C:** F4 (Team B, wk 1) and C1 + F2 (Team C) all write in `smart-scheduler-back` `scheduler.service.ts`: sale and confirm paths (`applyConfirm`, `confirmCourse`, 12 confirm sites) and the course-create path.
  - **F4 goes first, wk 1; C1 / F2 after it lands.** Otherwise two teams merge in one file at once. Sector should know this before his first TASK.
  - `lib/sale-post.ts` (today's ledger) becomes Team C's. Whether the new revenue line bridges it or replaces it is his design call (SIZING §2).

**Q2c. The §8.2 worked example, checked**
- ✅ **The shape is what A builds.** At the switch, the hours not yet used move from the old activity to the new one, dated the switch day. The closed month isn't edited, and the month's total doesn't change. 9,790 ฿ is the card's 10 h price for skate and bike, which share one price, so it's a fair example: 5 of 10 hours moved = 4,895.
- **Four fixes to the text before the customer reads it:**
  1. **The months:** the plan says revenue counts **from the first day of the go-live month**, so a course confirmed in October (before go-live) isn't in the system to split. Write it as *เดือนที่ 1 / เดือนที่ 2 หลังเริ่มใช้ระบบ*, not ต.ค. / พ.ย.
  2. **A course confirmed before go-live, switched after it:** it has no line to split. **My recommendation is that nothing is written,** since its money is in the old Excel. One line in §5 so she isn't surprised, e.g. *"คอร์สที่ยืนยันก่อนเริ่มใช้ระบบ ไม่ถูกแบ่ง"*.
  3. **The amount is what was actually paid,** after any discount, not the card price. Add *"(คิดจากยอดที่จ่ายจริง)"*. A course with a 10 % discount moves 4,405.50, not 4,895.
  4. **"Hours taught" = hours already used from the course** (attended, or charged as no-show; a leave or a cancelled class isn't used). Say *"ชั่วโมงที่ใช้ไปแล้ว"*, which matches what she sees as the quota.
- **Not covered by A, and must not be implied:** a switch between activities with **different prices** (e.g. skate → onewheel, +1,410 ฿ on 6 h), and a 4 h course to Balance, which has no 4 h price. **A only splits; the price difference is still REQ-5007's open ruling** (owner: "noteไว้คุย กับ พี่เบส"). Add it to §9 as undecided, or state *"กรณีราคาต่างกัน ตกลงแยก"*.

**Q4. Line check of the draft (my areas only)**
| § | line | fix |
|---|---|---|
| 3 | Salary *"ขึ้นระบบทดสอบ สัปดาห์ที่ 5–6"* | holds only above 7 a week for Team B too (Q2a). State the rate, or widen to 6–7. |
| 5 | report *"รายวัน / MTD / YTD"* | add: YTD counts **from the go-live month**, so the first year's YTD is partial (the earlier months are in Excel). |
| 5 | *"เปลี่ยนคอร์สกลางคัน: แบ่งรายได้ตามชั่วโมงที่เรียนไปแล้ว"* | → *"ตามชั่วโมงที่ใช้ไปแล้ว จากยอดที่จ่ายจริง (ราคาเท่ากัน) · ส่วนต่างราคา: ข้อ 9"* |
| 7 | data table | **add for Revenue:** her revenue type / category list (R2.1 seed) and the branch list, **before Revenue starts, so wk 1 if Team C runs in parallel**. **Add for Salary:** who is Merit-eligible (it's in the profile, R1.2). |
| 8.2 | the example | the four fixes above. |
| 9 | open decisions | **add:** the price difference on a course switch (REQ-5007, waiting for the owner's talk with พี่เบส). |
- **Nothing in §5 promises beyond the files**, except as fixed above. C-f's refund (cancel unattended + tell the family, vouchers alike), ECA on the school's pay date, Camp at the admin's confirm, and branch + method on every line all match REQ-120 §2, §5 and the rulings table.
### Sector
**Sector (SA, Team C), 2026-11-07. Read-only: no code opened yet, nothing run.** The days are Silver's sizes (DELIVERY-FACTS Q1, SIZING-REQ-120-revenue-frontoffice, CHECK-REQ-5007 §5), not mine re-measured. The code lines are from his GAP of 10-13, not re-read on today's `develop`.

**Q3. Revenue with Team C from week 1**
| piece | d | source |
|---|---|---|
| R2.1–R2.5 (incl. ECA, R2.3 refund as an expense) | 32.8 | Silver |
| C1 (posting moves to confirm) | 3.3 | Silver |
| F1 branch · F2 payment method · C-d installments · D3 camp confirm | 7.2 · 8.8 · 5.5 · 4.4 | Silver |
| Course-change split A (the re-class pair) | 1.5 | Silver, CHECK-REQ-5007 §5 |
| C-f front-office half: cancel the unattended classes, course/voucher → CANCELLED, tell the families | **0–2** | UNVERIFIED whether Silver's 10-20 re-size includes it (10-15 R2.3 = expense only, 2.8 d). My estimate if not: ≈ 2 d. **Silver to confirm.** |
| **total** | **≈ 63.5–65.5** | |

- **Rate I sign: 7 ed/wk + 1 wk review/QA.** That is the planning rate both SAs use. I won't sign 2×: Team C has never touched these repos.
- **Plus ≈ 0.5–1 wk start-up:** my SPEC (the C1 posting contract, the R2.2 line shape, F2's payment record) and the engineers learning SB/BB. Brew and Flash start on F1 from about day 3, since it stands on its own.
- **Weeks after GO:**
  - first usable piece, Revenue + C1 (R0.1 live): **≈ wk 7–8**;
  - **whole REVENUE block: sid ≈ wk 10–11 · uat ≈ wk 11–12.**
  - That matches Silver's ≈ 10–11 for the same pile in two hands, plus the start-up. It sits behind Salary (wk 6–7), as her order asks.
- **What I need from A or B first:**
  1. **A — R0.1 sign-in + roles:** the role names and middleware contract frozen by the end of wk 1 (Revenue = CEO only; admins and Khwan see none, §9.4 #6). R0.1 must be live before Revenue goes up. It is, because it ships with Salary.
  2. **B — F4 merged before C1 starts (≈ wk 2).** F4 writes the links at the course sale, and C1 moves posting out of those same functions.
  3. **B — F5 "No Teacher"** before the Park fee revenue line.
  4. **A — F3 vs C1 in the confirm path.** F3 changes the freelance expense hold, written at confirm; C1 adds revenue posting at confirm. Same function region, so the order or a file split gets decided at TASK cut.
- **Hot files, inferred from Silver's GAP until I re-read them:**
  - SB `scheduler.service.ts`: course sale ≈ :2524–2642 (F4 = B), confirm `applyConfirm` ≈ :3994–4053 (C1), freelance hold ≈ :252–262 / :4513–4521 (F3 = A);
  - SB `lib/sale-post.ts`, `jobs.service.ts` (day-end posting retired by C1), `camp.service.ts` (D3), the booking modal (F1/F2 with B's F4/F5 dialogs);
  - **SB and BB drizzle migrations: three teams will collide on numbering.** One rule is needed, Porter's: a migration-number block per team, or one at a time;
  - BB `schema.ts` and the auth middleware (R0.1 = A).
- **Environment, before wk 1:** Team C gets its own test database/schema on the owner's dev Postgres and its own dev ports for SB/FE/BB/BF, or we drop the other teams' test data. The env values come from the owner through Porter.

**Q4. Lines in the draft (§3, §5, §8.2, §9) — line, then fix**
1. **§5 "ขายสินค้า / F&B (หักส่วนลดแล้ว)"** is listed as delivered with Revenue. It comes from Stock's SALES RECORD, which ships last (DELIVERY-FACTS Q2.5). **Fix:** add *"(เริ่มเข้าอัตโนมัติเมื่อก้อนสต็อกเสร็จ ก่อนหน้านั้นใส่เป็นรายการเองได้)"*, and add the same to a "ยังต้องใส่มือ" line in §5, as §4 does for commission.
2. **§8.2, the worked example: the numbers match A** (whole 9,790 in Oct; in Nov −4,895 skate / +4,895 bike, month total unchanged, Oct not edited; CHECK-REQ-5007 §4). **But skate → bike is the same price group** (`bike-skate`). A change across groups (e.g. to Onewheel, +1,410 on a 6 h course) has a price difference. REQ-5007's rulings 1–3 (which amount, may the front office write money, refund vs credit) are still open. **Fix:** say *"เปลี่ยนเป็นกิจกรรมราคาเดียวกัน"* in §5/§8.2, and add the different-price case to §9.
3. **§5 refund:** add that the **course becomes CANCELLED** and **a Voucher refund works the same way** (§9.1 C-f).
4. **§5 front-office list leaves out installments (C-d, 5.5 d)**, though they are in this block's days. D4 says *"เปิดไว้ก็ได้"*. **Fix, Porter's call:** list *"แบ่งชำระได้"*, or drop C-d from scope (−5.5 d ≈ −0.8 wk on my dates).
5. **§5 "Birthday":** add *"(ใส่ยอดเอง)"*. R2.2 says it is an Other booking plus revenue typed by hand, so she won't expect a price card.
6. **§3 row 2:** sid **≈ wk 10–11**, uat **≈ wk 11–12** (above).
7. **Not a customer line; a risk I own:** at cut-over, a course sold before go-live has already posted at sale under today's rule. §9.4 #1 says it counts again at its confirm date. The C1 SPEC must keep that from counting twice. I'll design it; no customer question.

**BALL: @Porter.**

## Porter's reconciliation, 2026-11-07
- **Draft updated to v1.1** with: Salary sid wk 6 / uat 7 (Sober; Silver: wk 5–6 only above 7/wk) · Revenue sid wk 10–11 / uat 11–12 (Sector, 7/wk + start-up) · Stock sid wk 10 / uat 11 (Sober) · Silver's 4 example fixes + §5/§7/§9 lines · Sector's lines 1, 3, 5, 6; C-d kept and listed as "แบ่งชำระได้" (D4 "เปิดไว้ก็ได้", already in the days). Sober's line check was against a file not yet on disk: he re-checks v1.1.
- **For GO, Porter's (batch claims, ORDER 56.2):** R0.1 role contract frozen end of wk 1 (Sober → published for Sector); sale/confirm path order: F4 (B, wk 1) → C1 / F2 (C), F3 vs C1 split at TASK cut; one migration-number block per team; three test databases/schemas + dev ports on the owner's dev Postgres (env from the owner).
- **Open to the owner:** the price-difference case on a switch (REQ-5007), now in the draft's §9.

#### Sober — Master Plan v1.1 line-check (§3, §4, §6), 2026-11-07
- **§3 timeline:** ✅ my rows right — Salary sid wk 6 / uat wk 7; Stock sid wk 10 / uat wk 11. §3 line 36 (parallel-run a paid month + พี่ฟีน certifies before real pay) is correct and matches §4's acceptance.
- **§4 Salary:** ✅ accurate. Slip items, visibility (CEO all · admin incl. Khwan adds-but-no-pay · coach own), confirm/auto-lock, export, reports all match REQ-120 R1. **"ยังต้องใส่มือ = commission only" is correct for a WHOLE-block delivery** (FL pay/OT/Transport/Merit/Bonus are *in* the block; only commission waits for Stock). No over-promise.
- **§6 Stock — one fix (line 81):** the import diff lists "แก้ข้อมูล" (a name/price/category change) and then says every confirmed change "บันทึกเป็นรายการเข้า-ออก". **A field change is a product-record edit, NOT an in-out movement** — only a **quantity (balance) change** becomes an in/out movement; a rename/reprice updates the product (audited, but it is not stock moving). Suggest: *"จำนวนที่เปลี่ยน → บันทึกเป็นรายการเข้า-ออก · ชื่อ/ราคา/หมวดที่เปลี่ยน → แก้ข้อมูลสินค้า (เก็บประวัติการแก้ แต่ไม่ใช่รายการเข้า-ออก)"*. Everything else in §6 (never-delete, removed row shown, negative refused, Demo, low-stock, R3.8 reports, Stock Card correctly OUT, commission→salary on completion) is right.
- **§7 data (fill the `[SA]`):** the product **Excel is in hand (3 พ.ย.)**; the **real opening counts** are needed **at Stock start (≈ wk 7)** and **re-counted on the go-live day** (a 10-30 snapshot isn't the opening balance).
- **FYI (not my block):** §8.2's discount math looks internally inconsistent (9,790 vs moving 4,405.50 on a 10% course) — Silver's to reconcile, as Porter routed it.

## Round 2 — the 6 report pages move into their blocks (owner, 2026-11-07: "เอาตามนั้น ทำตามก้อน")
Mapping (Porter's, confirm or move): Salary → SALARY · CHECK IN · Revenue → REPORT · COURSE · STUDENT · Stock → STOCK. Old rough size ≈ 24.75 d total (REQ-120 §10: Silver 8.8 + Sober 13.75 + frame 2.2, ±50 %). Content isn't agreed yet; Khwan gives it at each block's start.
- **(Sober)** SALARY · CHECK IN · STOCK pages, and the shared frame: size each, and the new sid/uat weeks for Salary and Stock. Does the mapping fit?
- **(Sector)** REPORT · COURSE · STUDENT pages: size each (with Silver's 8.8 as the starting point), and the new Revenue weeks.
- **(Silver)** Only if your pile changes: do any of these pages land on Team B (e.g. screens)?
### Sober (round 2)
### Sector (round 2)
**Sector (SA, Team C), 2026-11-07. Read-only.** These are the 10-22 rough sizes, ±50 %, which still apply: the content isn't agreed yet, and the final UI has only a placeholder card per heading (TASK-753 step 2).
- REPORT 5.5 is Silver's: his 8.8 = REPORT 5.5 + STOCK 3.3, digest 2026-10-22 l.51.
- COURSE 3.85 and STUDENT 3.3 are Sober's 10-22 numbers (log/2026-10-22 l.37), not Silver's.

| page | d (±50 %) | what it reads | note |
|---|---|---|---|
| **REPORT** | 5.5 (2.8–8.3) | the revenue lines (R2.2) | It may overlap R2.5's first page ("summarises by type", already in R2's 32.8). If her content is that summary, it shrinks toward ≈ 2–3 d. |
| **COURSE** | 3.85 (1.9–5.8) | front-office courses (sold, hours used/left, ended) | needs no Revenue code |
| **STUDENT** | 3.3 (1.7–5.0) | front-office students (+ spend from the revenue lines) | needs no Revenue code, except a spend column |
| **total** | **12.65 (6.3–19)** | | |

- **The shared frame (2.2 d) isn't mine.** Salary's reports ship first, so the frame comes with them (Sober). If it hasn't landed when I start: +2.2 d.
- **The mapping fits.** REPORT belongs with Revenue. COURSE and STUDENT depend on no block, so Revenue is as good a home as any, and it keeps Salary's critical path clean.
- **New Revenue weeks**, same rate (7 ed/wk + start-up + 1 wk QA). The pile goes from ≈ 63.5–65.5 to **≈ 76–78 d**:
  - Revenue + C1 usable: **≈ wk 7–8** (unchanged; the reports come last);
  - **whole REVENUE block: sid ≈ wk 12–13 · uat ≈ wk 13–14** (was 10–11 / 11–12).
  - At the ±50 % edges: sid ≈ wk 11–12 to wk 13–14.
- **Needed for these dates:** Khwan's content for the three pages **by ≈ wk 8**, when Team C reaches them. "Agreed at each block's start" works only if her answer comes in the first weeks. A late answer moves uat one-for-one.
- **Levers, Porter's call** (each one keeps Revenue at about wk 11–12 uat):
  - **(a)** the three pages ship ≈ 2 wk after the rest of the block, as a second drop inside REVENUE;
  - **(b)** drop C-d installments (−5.5 d ≈ −0.8 wk);
  - **(c)** Team B's FE takes the three page screens once Salary is done (≈ wk 6), before Stock: ≈ −1 wk for C. That takes Fanta from Stock, so it's Sober's/Silver's to weigh.

**BALL: @Porter.**
### Silver (round 2)
**Silver, 2026-11-07. Read-only.** **Team B's pile changes only if SALARY and CHECK IN come to it.** That's Sober's call.
- 🔴 **Overlap, so they aren't counted twice:**
  - Team B's pile already holds **R1.7 (the daily check-in report) and R1.8 (month-end) at 6.1 d.** The CHECK IN page and the SALARY page read like the same two reports as pages.
  - Fern's final-UI Salary pages include **Daily**, which is in my "8 screens".
  - ⇒ **My proposal:** CHECK IN = R1.7 and SALARY = R1.8, built by Team B as one piece with them. Only the extra beyond R1.7 / R1.8, once Khwan gives the content, is new. If Sober keeps them with Team A, then R1.7 / R1.8 move with them, and Team B's pile drops by ≈ 6.1 d + the Daily screen.
- **My 8.8 d (REPORT · COURSE · STUDENT)** was a ROUGH ±50 % with no agreed content. It's Sector's starting point now, and his numbers win. Those pages read front-office data (bookings, courses, students), not Team B's Salary pieces, so they don't touch Team B's pile.
- **Nothing else on Team B moves.** F4, F5, the bonus lines, Transportation, remind, export and the Stock share all stay as in my round-1 answer.

### Sober (round 2)
**Mapping fits:** SALARY page → Salary ✅ · **CHECK IN page → Salary ✅** (it shows each coach's hours **and pay** per day — that is R1.7, Salary data, not a neutral attendance view) · STOCK page → Stock ✅.
**Size (my 3 pages + the shared frame; content not agreed ⇒ ±50 %). These are the DASHBOARD/presentation pages — the data compute (R1.7/R1.8/R3.8) is already inside 43.1 / 37.0, so this is the page layer only:**
| page | block | d (±50 %) | note |
|---|---|---|---|
| **shared frame** (shell · date-range · filters · export) | Salary (first block) | **2.2** | built **once**, reused by all 6 pages — no re-charge to Revenue/Stock |
| **SALARY dashboard** | Salary | **~3** | month overview per coach (reads the pay run) |
| **CHECK IN dashboard** | Salary | **~2.5** | reuses R1.7's compute |
| **STOCK dashboard** | Stock | **~3.5** | reuses R3.8's compute |
| **my total** | | **~11.2 d** | ≈ the old §10 "Sober 13.75 + frame 2.2" (3 pages, not more) |

**New weeks — small impact, because these are FE pages that run PARALLEL to the BE critical spine (R0.1→F3→hours→pay run→slip), not on it:**
- **Salary:** the frame + SALARY + CHECK IN (~7.7 d FE) fit alongside the spine while Fern/Fanta also build the 8 operational screens. They add weeks **only if the FE is saturated past the spine's end.** Honest: **sid wk 6 → wk 6–7 · uat wk 7 → wk 7–8** (≤ +0.5 wk, FE-bound).
- **Stock:** STOCK dashboard (~3.5 d FE) parallels the Stock build: **sid wk 10 → wk 10–11 · uat wk 11** (≤ +0.5 wk).
- **Net:** the 6-page move adds ~11 d to my piles but **≤ ~0.5 wk of calendar each**, because the spine is still the wall. If a block's FE turns out thin, there is **no** week impact.
- ⚠️ **Content risk:** Khwan gives each page's content at the block's start (±50 %). A page that grows into new *computed* metrics (not just a view of data we already have) could add BE days and then push the spine — flag to re-size when her content lands.

### Sector (round 2)

## Porter's reconciliation, round 2 (2026-11-07)
- Mapping kept. CHECK IN = R1.7, SALARY = R1.8 (Silver): one piece, not counted twice; only content beyond them is new. Who builds them is Sober's call at TASK cut.
- Plan v1.3: Salary sid 6–7 / uat 7–8 (Sober) · Revenue sid 10–11 / uat 11–12 with its 3 pages as a second drop ≈ 2 wk later, sid 12–13 / uat 13–14 (Sector's lever a) · Stock sid 10–11 / uat 11 (Sober). Khwan's content for Revenue's pages by ≈ wk 8. New computed metrics ⇒ re-size (Sober).
- Levers b (drop C-d) and c (Fanta on the pages) not taken: b drops a ruled scope item; c is Sober's and Silver's to weigh later.

## Round 3 — a thin-slip demo on sid ≈ 2 wk after 9 Nov
### Sober (round 3)
**Yes — ~20–23 Nov is reachable, and it does NOT move Salary wk 6–7/7–8 — with 3 conditions.** What it shows: พี่ฟีน (CEO-only) signs in → an **FT** coach's slip = base salary + a couple of hand-typed **Other ±** lines → the month overview → the **12:00 auto-lock** → export, on **sid seed data**. **Not** PT/FL/STAFF, no Extra Hour / bonus / commission (those are the later spine).
- **Why it doesn't push wk 6–7:** the demo subset (R0.1 CEO-only ~1.5 · FT base ~2 · pay run + slip + auto-lock ~8–10) is **critical-path work anyway** — building it first is a **re-sequence**, not extra work. **F3 + hours reader run in parallel on the other team**, so the full block still converges at wk 6–7.
- **Conditions:** (1) **two BEs** focus the first 2 weeks on that subset (one BE alone ⇒ slips to ~27 Nov–1 Dec — the pay-run+slip engine is ~10 d by itself); (2) the slip/pay-run is **designed from day 1 to accept added line types** (base + Other ± now, computed lines later) so F3/hours-reader lines slot in with **no rework**; (3) it is a **DEMO** — light QA, seed data, **no real money paid from it**; the pay-grade QA + the paid-month parallel-run (§3 line 36) still gate real pay.
- **One honest caveat:** the money-grade slip is still wk 6–7; the 20–23 Nov item is a *look at work-in-progress on the critical path*, not a shippable payroll.

## Sector — the owner's one-shared-DB ruling (2026-11-08), Team C
**Read on 2026-11-08, read-only:** `smart-scheduler-back` (branch `dong` @ `0a1f250`): `drizzle.config.ts` l.1–14, `src/lib/journal-series.ts` l.1–16, `bunfig.toml`, `src/test-env-guard.preload.ts`, `package.json` scripts, `.env.example`. `smart-scheduler-backoffice-back` (`dong` @ `aa2a7cc`) and `-backoffice-front` (`dong` @ `afcf30e`): `.env.example` vs the env keys the code reads. Nothing was run against any database.
- **What it changes for Team C:** my round-1 need "Team C's own test DB" is dropped. I accept three of the four rules as written:
  - test data named with the team letter;
  - nobody truncates, resets or drops shared data;
  - dev ports per team.
- **🔴 Objection: "one migration-number block per team" will silently lose migrations in `smart-scheduler-back`.**
  - **How drizzle decides:** it applies a migration only when its journal `when` is greater than the newest `created_at` in the ledger. It skips everything else silently, with exit 0 (`drizzle.config.ts` l.6–8; `journal-series.ts` l.4–6, the TASK-085/494 incidents).
  - **What goes wrong:** on one shared DB, block numbers do not follow apply order. If Team C's block is applied first, a team with a lower block is skipped forever.
  - **The journal:** all three teams write one shared file, `drizzle/meta/_journal.json`.
  - **Proposed rule [SA-decided, for Porter to confirm or route]:** one series, in apply order. A migration takes its number when it is about to be applied to sid, through the existing `bun run db:generate` renumbering. One seat applies migrations to sid at a time; who that is, is Porter's call or the owner's.
  - **Same caution for any branch:** once a branch's migration is on sid, every other team's code runs against that schema. Migrations should only add things (new tables or nullable columns) until the merge. No renames or drops.
  - **Not checked:** the back-office back's own migration setup. I will check it at TASK cut.
- **Two more rules I ask Porter to add:**
  1. **Never run `db:push` or `db:reset` on sid.** `db:push` changes the schema without going through the ledger. `db:reset` deletes rows table by table (`scripts/db-reset.ts`).
  2. **Shared settings.** `bun test` in `smart-scheduler-back` uses whatever `.env` points at. The guard refuses uat and the real OA only, so sid is allowed. 98 of its 373 test files use the database. Two of them change global settings rows: `src/lib/line-admin.test.ts` and `src/services/settings.service.test.ts`. On a shared sid, those two must restore what they change. Better still, they should not run while another team or Tanya is testing on sid. (I have not audited whether every test cleans up after itself.)
- **Revenue-specific:** C1 moves revenue posting to confirm. So Team C's test runs on sid will add revenue movement rows. Those rows show up in the sid revenue figures and SOM Dashboard numbers that Tanya and the owner read. Plan: Team C's test data uses its own C-tagged students and courses. Tanya gets that list so she can leave them out of her checks.
- **`.env.example`: not yet complete.** The format check counted only names that the code reads directly.
  - **`smart-scheduler-back`:** 17 keys, 9 without a purpose line. Missing: `SCHEDULER_API_URL`, `INTERNAL_JOB_SECRET` (both used by the 5 scheduled job scripts), `PUBLIC_ADMIN_BASE_URL`, `ADMIN_URL_ENV`, and `BASE` (smoke script). `ENV` and `NODE_ENV` are not checked.
  - **`smart-scheduler-backoffice-back`:** 8 keys, 3 without a purpose line. Missing: `API_BASE` (smoke script).
  - **`smart-scheduler-backoffice-front`:** 1 key, with its purpose line. Complete by this check.
  - **The fix is a TASK line, not a value request.** Each Team C TASK that touches a repo adds the missing keys with one-line purposes. The values come from the owner via Porter, and the list goes to him before anyone needs them.

**BALL: @Porter — decide on the migration rule before you publish the four.**

## Porter — shared sid DB rules, PUBLISHED 2026-11-08 (Silver + Sober + Sector agreed; replaces my four)
Owner, verbatim: *"ไม่มี database ทดสอบ 3 ตัว ใช้ของ sit ได้เลย เต็มที่"* → the 3 teams share the existing sid DB on the owner's Postgres.
1. **Migrations: ONE series per repo, in apply order.** No per-team number blocks. A migration takes its number when it is about to go onto sid (`bun run db:generate` renumbering), on top of the latest shared branch.
2. **One at a time, through a file, not SA-to-SA:** before applying to sid, the SA appends a line to `MIGRATION-QUEUE.md` (repo · migration · team · `applying`), applies, then appends `applied · verified` (`db:verify`). Nobody applies while that repo's last line says `applying`. Back-office back is the busiest queue (Sector checks its migration setup at TASK cut).
3. **Additive only until every team has merged:** new tables, nullable columns. No rename, no drop.
4. **Never on sid:** `db:seed` (TRUNCATE … CASCADE), `db:push`, `db:reset` (owner-only), any truncate/drop of shared data.
5. **Test data carries the team letter** (A/B/C). Team C's revenue rows come from C-tagged students/courses; Sector gives the testers that list.
6. **Shared settings:** back's `line-admin.test.ts` and `settings.service.test.ts` restore what they change and are not run against sid while another team or a tester is on it.
7. **Dev ports per team** (back + BB pair each; 4006/4010 stay Team A's). Each SA names its pair in its first TASK.
8. **`.env.example`:** the first TASK touching each repo adds every missing key with a one-line purpose (back: SCHEDULER_API_URL, INTERNAL_JOB_SECRET, PUBLIC_ADMIN_BASE_URL, ADMIN_URL_ENV, LINE_OA_WRITE_ALLOW, BASE + 9 purpose lines; backoffice-back: API_BASE + 3 purpose lines). Then Porter sends the owner ONE list of values. Git only on the owner's word.
Still not a build GO.

## Sector — Team C wk-1 cut + claim request (2026-11-08, after the GO)
**Cut:** SPEC-098 (revenue ledger foundation) · TASK-858 (Brew, BB) · TASK-859 (Flash, BF). Wk 1 = the Revenue ledger in the back office only; F1/F2/C1 (front office + `scheduler.service.ts`) wait for F4 (TASK-860) and get their own SPEC in wk 2.
**Claim request for the board (`## Batch claims`; Porter writes it, ORDER 56.2):**
- **BB:** `src/db/schema-revenue.ts` · `src/lib/revenue-ledger*` · `src/services/revenue-ledger.service*` · `src/routes/revenue-ledger*` (the old `revenue.service.ts` stays untouched) · `src/middleware/revenue-access.ts` · Team C's one new migration in `drizzle/` (+ its journal entry/snapshot, through the queue).
- **BF:** `src/app/(admin)/revenue/{summary,detail,manual,categories}/**` · `src/components/partials/RevenueLedger/**` · `src/services/revenue-ledger.service.ts` · `src/types/app/revenue-ledger.ts`.
- **Two shared lines need your ruling (same working tree as TASK-856):**
  1. **BB `drizzle.config.ts`**, `schema:` → an array (adds `schema-revenue.ts`). I chose this to keep Team C out of `schema.ts`, which TASK-856 edits. Grant it to Team C, or to whoever touches it first.
  2. **BB `src/routes/api.ts`**, one `.route("/revenue", …)` mount line. TASK-856 may also edit this file. Proposed: Team C adds its line after TASK-856 is DONE (Brew builds and tests the routes unmounted until then).
- **Not claimed:** BB `schema.ts` · `middleware/auth.ts` · `routes/auth.ts` (Team A) · BF menu `AdminLayout.config.ts` · `(admin)/layout.tsx` · the old `/revenue` page (the block's cut-over TASK, later). BB `.env.example` (API_BASE + 3 purposes): **yours to grant.** TASK-856 step 5 also edits it; one owner only.
- **Team C ports:** BB 4310 · BF 3310 · SB 4306 · SF 3306.
**BALL: @Porter — write Team C's claim line; rule the two shared lines.**

## Sector — old back-office code removal, Team C's part (2026-11-08; Sober leads, per Porter's ask)
Read on 2026-11-08: BB `dong` @ `aa2a7cc`, `src/routes/bo.ts` (route list), grep of `revenue-attribution` users; BF `src/app/(admin)/revenue/page.tsx`.
- **Old Revenue code:**
  - BB: `src/lib/revenue-attribution.ts` (+ test), `src/services/revenue.service.ts`, and the routes `GET /v1/bo/reports/revenue-by-activity` and `/reports/customer-spend` (`bo.ts` l.66–69).
  - BF: `/revenue` + `components/partials/Revenue/**`, plus its menu entry (`AdminLayout.config.ts` l.15).
- **Removal:** all of these go in the Revenue block's cut-over TASK, the same change that points the menu at `/revenue/summary`. Never before: the live screen stays usable until its replacement is.
  - These only READ `bo.movement` / `bo.item`. Removing them changes no table and no write.
- **C1 keeps working:** Team C removes nothing that SB writes. The freelance ceiling, sale postings and undo reversals keep writing `bo.item` / `bo.movement` until C1's own SPEC (wk 2+) moves the revenue writes to `bo.revenue_line` at confirm.
  - The bridge tables are dropped only by a queued migration after every team has merged.
- **Weeks:** none move for Revenue. SPEC-098 builds the new ledger without reusing the attribution code.
  - **Inferred:** whether Silver's 24.9 d of reused BO_old parts counted anything on the Revenue side. If it did, it is the attribution report, which the new ledger replaces anyway. Silver would settle it.

## Silver — old back-office code removal, Team B's part (2026-11-08; Sober leads)
Read on 2026-11-08, code only, nothing run: BB `dong` HEAD `src/routes/api.ts` + `ls src/routes src/services drizzle/`; SB `src/lib/ops-client.ts` + grep of its callers; SB `schema.ts` `bo` tables. My 24.9 d is the 10-22 figure (`archive/inbox-PM-2026-11-01-pre-order51.md` l.6624; REQ-120 l.190).
- **The 24.9 d, piece by piece. Almost none of it is "old back office the customer doesn't want":**
  | part | d | where | keep or remove |
  |---|---|---|---|
  | C1-SALE-POST 4.4 · C1-CATALOG 3.3 · C1-UNDO 1.1 · C1-FREELANCE-CEILING 5.0 · C1-READS 0.6 | 14.4 | **SB** writes and reads `bo.item` / `bo.movement` directly in the shared DB (sale posts, product rows, undo reversals, the FL ceiling items `metadata.kind = 'FREELANCE_CEILING'`) | **KEEP, untouched.** It's the live front office's money path; C1's own SPEC moves it later. |
  | BO-SCHEMA | 1.7 | BB's `bo` schema: `bo.item` / `bo.movement` + migrations 0004–0006 under ledger `drizzle.__drizzle_migrations_bo` | **KEEP.** SB writes these tables. A "clean" BB keeps `drizzle/` and its ledger, and new tables go on top. 🔴 Restarting the series at 0000 would fail on existing tables, or be skipped silently (TASK-085). |
  | BO-SCAFFOLD | 4.4 | BB's Hono app, db client, auth middleware, migration-ledger / preflight / verify | **KEEP** (TASK-856 already builds on it). |
  | BF-SHELL | 4.4 | BF's Next + Mantine app: config, provider, api client, build | **KEEP the app skeleton.** Fern's TASK-857 replaces the layout and sign-in *inside* it. |
- ⇒ **Remove only the old screens and the dormant files, and no week moves for Team B.** Team B's whole pile is new code: F4 / F5 in SB, and the Bonus / Transportation / remind / R1.7–R1.8 lines and Fanta's screens in BB / BF. None of it was counted as reuse.
  - **If anyone removes a KEEP row above,** that row's days come back (up to 24.9 d), and the C1 rows break the live front office on sid / uat.
- **Safe to remove now, from my reading:**
  - BB's **dormant `ops` route / service files**. `api.ts` at HEAD mounts only `/auth` + `/bo` ("the old `ops.*` routes are retired … dormant (unimported)", REQ-006 / TASK-027): `accounts.ts`, `catalog.ts`, `commercial.ts`, `parties.ts`, `pricing.ts`, `recurring.ts`, `teacher-sync.ts` and their services. Check each one is unimported before deleting it (`bunx tsc` + the suite).
  - **SB's `ops-client.ts` calls exactly those retired endpoints** (`/catalog/items…`, `/internal/teacher-sync/…`, `/recurring-costs…`). It's best-effort: it returns empty on failure or when unset. My grep found **no non-test caller** of its exports, only a comment in `mappers.ts`. So removing BB's ops files breaks nothing live.
    - I'm **not** removing `ops-client.ts` in SB in this pass: it's a front-office file in three teams' hot tree. It goes on a later cleanup line.
- **Not safe until its replacement is live** (Sector's point, agreed): any old BF screen still reachable from the menu (`/revenue`, P&L). They read only, so removing them changes no data. The cut-over goes in the replacing TASK.
- **Concur with D1-prop** (rebuild REQ-shaped, keep the primitives), with one correction to its premise: **BB is no longer the July generic ERP at runtime.** The `ops` part has been unmounted since REQ-006. What runs is `auth` + the universal `bo` item / movement model, and that model is exactly the primitive set to keep.
- **Concur with DECISIONS row 1 (Sector, `schema-revenue.ts`).** Team B will do the same when it first touches BB: `src/db/schema-salary-b.ts` for Bonus / Transportation / remind tables, added to the `drizzle.config.ts` array. That's one line, after Team C's.

## Sector — slice 2a claim (F2 payment record) + the F1 owner question, 2026-11-08
**Claim request (Porter writes it):**
- **BB:** `src/db/schema-revenue.ts` (+ `payment`) · one new `drizzle/` migration via the queue · `src/lib/migration-witness.ts` (one appended entry, row 6) · `src/services/revenue-ledger.service.ts` · `src/routes/revenue-ledger.ts` (+ test) · `src/lib/revenue-ledger.ts` (+ test) · `src/middleware/revenue-access.ts`. All already Team C's except the new migration.
- **SB:**
  - new `src/lib/payment-record.ts` (+ test) · new `src/routes/payments.ts` (+ test);
  - `src/db/bo-revenue.ts` · `src/lib/revenue-line.ts`, both already ours;
  - **shared:**
    - `src/index.ts`: one `app.route` line;
    - `src/lib/route-access.ts`: three entries;
    - `src/services/scheduler.service.ts`: one hunk each in `createCoursePackage` and `createVoucher`, after the commit, beside `recordSale`. `createCoursePackage` was Team B's for F4, which is DONE.
- **SF:**
  - new `src/components/partials/Payments/**` · `src/services/payments.service.ts` · `src/types/payments.ts`;
  - **shared:** one block in `src/components/partials/Bookings/CreatePlanFlow.tsx`, and one `<PaymentCard>` line each in `PlanModal.tsx` and `VoucherPanel.tsx`.

**Question, F1 branch owner:**
- F1 (7.2 d) is in Team C's Revenue pile (CHECK §Sector round 1; Porter's reconciliation kept it).
- But REQ-5010's split lists 7 Branch for Booking under Team B, and Silver's CHECK-REQ-5010 line 94 says he will write the wording into *"the F1 front-office TASK … when I cut them"*.
- **One owner, Porter's call:** Team C (default: Revenue needs the branch on every line, and the payment card sits in the same SF screens) or Team B. Whoever owns it carries Silver's answer to REQ-5010 #7 (branch on every booking, picked at create; a one-off move in Move session; a whole-course change next to Change teacher).
