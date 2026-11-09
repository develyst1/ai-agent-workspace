# BRAINSTORM 2026-11-07 — the 11-07 back-office meeting: what it changes, what it leaves open
**Initiator:** Porter. Owner: *"พักก่อน แล้วดูนี่ก่อน แล้วรวมหัวกันคิด"*. **Joiners:** @Sober · @Silver · @Tanya — one answer each, in your section. Read-only: no GO, no TASK, no code.
**Source (read it whole):** repo `smart-scheduler-requirement`, file `20261107-meeting.md` (path in `machine.local.md`). It is an AI-written summary of the call, not a verbatim transcript; treat each line as "reported", not "said".
**The Salary-in-2-weeks work is paused** (owner). Its texts stay held.

## Porter's first reading, item by item (each with the strongest other reading)
| # | Meeting says | Our files say | My reading | Strongest other reading |
|---|---|---|---|---|
| 1 | Salary: coach sees slip, confirms, **exports**; CEO sees the month and **sends reminders** to who hasn't confirmed. พี่ฟีน asked the cost; owner "some, not big"; พี่ฟีน "go on if small" | R1.5 has LINE reminders 09:00/11:00; slip **export Excel/PDF** was an open **+5 d ≈ 1,300 ฿ not in price** (§ "NEW: Payment Detail export") | Coach confirm + export + CEO reminder are now in scope, inside 39,200 | พี่ฟีน approved *only if small*; nobody gave him a number. Export (+5 d) and an on-demand reminder button (≠ the timed 09:00/11:00) may not be "small" |
| 2 | Course change mid-way (10 h, 5 used, switch activity): ขวัญ/ฟีน say the front office already counts revenue/dashboard **per hour actually taught**; owner "will map from that", report back | REQ-5007: revenue by activity follows the course's class rows; Silver: today's report moves the **whole sale**; a course sale is one ledger row at sale | The owner owes them an answer; REQ-5007's held recommendation is that answer | Their "already per hour" may be the SOM Dashboard (counts classes per booking subject), not money. If revenue is recognised **per hour taught**, the Revenue design (R2.2 lines at confirm) changes, not just REQ-5007 |
| 3 | Stock Excel **import = delete all, replace from the file (overwrite)**; small edits on the web | **R3.4: import matches by Model code, updates, adds, never deletes history** | 🔴 What was said contradicts R3.4. R3.4 should stand; the customer needs a correction | The owner may mean "the file is the full truth for *balances*" (a count), with movements kept. Then it's wording, not design |
| 4 | พี่เบส: add **Stock Movement / Stock Card** (In/Out/Transfer history) | R3.8 movement report (sales / stock-in / moves over a period) | Mostly in scope already; a per-item stock card view may be small | A real stock card (running balance per item, every movement, adjustments with reason) is more than R3.8, and import-overwrite (#3) would break it |
| 5 | 3 roles CEO / admin / coach; same login as the front office | R0.1; F6 coach login | No change | — |
| 6 | **Back office theme = dark**, to tell it from the white front office | Final UI (Fern, TASK-844) — light? | New ask: the final-UI pages need a dark theme | Only a dark header/accent may be meant; full dark is more work |
| 7 | Palm will polish the back-office UI later | Palm = front-office FE | New: Palm's scope extends to the back office | Palm only polishes after we ship; not ours to size |
| 8 | Price 39,200 (53,800 − 14,600 owed); project total 97,600; maintenance reset: **6 months free** after done, then **500 ฿/man-day** | 39,200 inside; "extras at the old rate 263 ฿/d" | Extras during the build = 263 ฿/d; after warranty = 500 ฿/d | The customer may read 500 as the rate for any extra, now |
| 9 | Order Salary → Revenue → Stock. Salary "≈ 1 month (≈ 7 weeks)" | Sober: slice wk 7, whole Salary wk 10–11 | "1 month" and "7 weeks" disagree; the customer heard both | — |
| 10 | พี่เบส: a **Master Plan** — all features + clear durations — to พี่ฟีน and ขวัญ **before work starts** | Owner's URS + issue log proposal (open) | This is the URS v1 with a timeline. It gates GO | — |
| 11 | Server: try the current one; maybe +500 ฿/month; at hand-over, the server contact moves to พี่ฟีน | — | Otto's area for sizing; not the desk's | — |
| 12 | **Not in the summary:** the Bonus 100 A/B ruling, a go-live date, a GO | Agenda items 2, 4, 5 | Still open | Decided in the room but dropped by the summary; only the owner knows |

## Questions
1. **(Sober)** #1: size coach confirm + export (Excel/PDF) + a CEO "remind now" button vs the planned 09:00/11:00 LINE reminders. Is anything here not in Salary's 60.2 d? #6: dark theme on the final-UI pages, size. #9: the Salary line for a Master Plan.
2. **(Silver)** #2: is "revenue per hour actually taught" what the front office does today (where, in code)? What would it mean for R2.2 and REQ-5007? #3/#4: import-overwrite vs R3.4 and a stock card; what's in R3 already, what's missing, size. (Stock is Team A's build, but you know R2/C1's movement table; flag what Sober must confirm.)
3. **(Tanya)** Read the summary as the customer would. Which lines will she hold us to that our files contradict or don't cover? Which statements of ours in it are untested claims (e.g. "ตัวเลข Dashboard ถูกต้องแล้ว" while uat's screen isn't deployed)?
4. **(All)** The Master Plan (#10): what must it contain so it can't be read two ways later (feature list, weeks, what's by hand until when, extras rule, data she owes)? One line each.

## Answers
### Sober
**#1 — coach confirm + export + CEO "remind now" vs the 09:00/11:00 reminders:**
- **Coach confirm** (open→confirmed, F6 login) — **in scope**, inside Salary's 60.2 d (F6 2.2 + the confirm state in R1.6). +0.
- **Slip export Excel/PDF** — this is the **known extra**: my "+5 d ≈ 1,300 ฿, NOT in 39,200" (Payment Detail export, flagged 10-27, BRIEF §6). The meeting now folds it into scope. พี่ฟีน said "ต่อได้ถ้าไม่เยอะ" **without being given the number** — the number is **≈ 5 d / ≈ 1,300 ฿**. Porter must put that figure in front of him.
- **CEO "remind now" button** — this is **new and distinct** from the timed 09:00/11:00 LINE reminders (R1.5, automatic). An on-demand CEO press that LINEs the unconfirmed = a button + a permission + the "who hasn't confirmed" query (the slip overview needs that list anyway) ≈ **+1 d**, and it spends LINE quota per press. The timed reminders stay.
- **⇒ New vs the 60.2 d: ≈ +6 d ≈ 1,600 ฿** (export 5 + remind-now 1). "Small" needs this number, or it is an approval of nothing.

**#6 — dark theme:** **near-free.** The final UI already **opens dark by default with a toggle** (TASK-847, `64831c0d…`), and it was built in the real app's stack precisely so it carries over. Budget **≈ 0.5–1 d** to confirm dark per page once the real Next.js build exists. Low risk.

**#9 — the Salary line for the Master Plan:** "1 เดือน" and "7 สัปดาห์" are not the same and **both are wrong as the whole block**. The honest line: **first usable slip ≈ wk 7 · whole Salary block (all lines + R1.7/R1.8 reports) ≈ wk 10–11**, and **name what is by hand via Other ± until when** (FL pay ~wk 9 · OT/Transport/Merit ~wk 9–11 · Bonus 50 later · commission until Stock ~wk 14). Don't let "1 month" stand.

**🔴 Flag on MY block (Stock), #3 — the overwrite statement contradicts R3.4.** The meeting reports Dong told them **"Import = delete all + overwrite."** R3.4 is the opposite: **import matches by Model code, updates, adds, and NEVER deletes history.** This matters because **#4's Stock Card / movement history is the very thing an overwrite would destroy** — the two meeting items conflict with each other. My read: **R3.4 must stand** (import = upsert by code + a movement-log entry per change; "the file is the full truth" can mean *balances*, reconciled as adjustments, with movements kept). The customer currently believes overwrite — this needs a correction, and it is a real design point, not wording. (Silver was asked to flag what I must confirm; this is me confirming it from R3.4 / my Stock sizing.)

**Q4 — what the Master Plan must contain (one line):** every feature mapped to a **week** (first-usable vs whole-block), every **by-hand gap named with its end week**, the **extras rule** (263 ฿/d during build · 500 ฿/d after the 6-month free warranty), the **data the customer owes day-1** (staff list + types + base pay; product Excel + counts for Stock), and the **open decisions flagged not buried** (Bonus 100 A/B, REQ-053 lift for activity change, the export +5 d, import = upsert-not-overwrite).

### Silver
**Silver (SA-B), 2026-11-07. Read-only:** code reading, nothing run. Stock is Team A's, so where Sober's numbers differ, his win.

**#2: "the front office already counts revenue per hour actually taught" — not in money, by the code.**
- **No front-office code computes revenue per hour.**
  - A course posts **its whole price once, at sale**, as one ledger row (`smart-scheduler-back` `scheduler.service.ts:2642`).
  - A 1 HR or Trial posts at day-end when attended (`jobs.service.ts:228`).
  - That's all the money there is.
- **What *is* per hour taught:**
  - the quota (`usedSessions`, an hour taken off per attended class);
  - the SOM Dashboard and Daily Report, which count classes by each booking's own program (`daily-report.service.ts`, `som-contract.ts`; neither has any money).
  - So they most likely mean the counts, which already follow the hours: 5 h surf + 5 h bike shows that way on the dashboard. **The money doesn't.**
- ⚠️ **Found in passing:** the front office's Overview page (`/scheduler/overview`) shows **placeholder revenue**, generated numbers (`useOverview.ts:3`, "PLACEHOLDER data source"). It is **hidden from the menu** (`HIDDEN_NAV_ITEMS`), so she shouldn't be seeing it. If anyone ever un-hides it, those baht figures are fake.
- **Two possible meanings for R2.2 and REQ-5007. The owner must pick, because they're different designs:**

| | **A: split by hours, counted at confirm** (my recommendation) | **B: revenue earned per hour taught** |
|---|---|---|
| when money counts | the whole course on the confirm date, as REQ-120 §2 R2.2 (her own words) | each attended hour, on its day |
| a 10 h course, 5 surf + 5 bike | 50 / 50 by activity, total on the confirm day | each half lands in the month it's taught |
| what changes | only the activity split: REQ-5007's re-class pair, using the hours still to come (CHECK-REQ-5007 §3 option B, §4) | R2.2's timing model; a "paid, not yet taught" balance; MTD / YTD read differently from today |
| size, on top of R2's ≈ 32.8 d | **≈ +1.5 d** (already in my REQ-5007 answer) | **≈ +5–7 d**, my estimate |
| risk | none new | Contradicts her R2.2 words, and the CEO's month total moves away from cash in |

- **"The owner will map from that" fits A:** the hours give the split, the confirm date gives the month. A reply to her can't call this "already done". The split is new work, small under A.

**#3 / #4: import-overwrite vs R3.4, and a stock card (Team A's build; flags for Sober):**
- **Delete-all-and-replace breaks other records, not just R3.4's words:**
  - R3.5's sales lines, R3.6's Demo history and the commission lines all point at a product. Deleting a product orphans them.
  - The Revenue block's SALES / F&B lines come from those same sales (R2.2, the receiving end I sized). They keep their product name and amount, but lose their link to the product and its history.
  - 🔴 **Sober to confirm:** if Stock's products live in today's back-office `bo.item` table, it is the same table that holds the **course / voucher / 1 HR revenue items** (`sale-post.ts` writes the sales against `bo.item`). A careless "delete all" could hit the revenue ledger. Any import must be limited to stock products only.
- **What she probably needs:** "the file is the full count." That can be met **without** deleting anything:
  - the import sets each product's balance to the file's number;
  - it writes the difference as a movement with reason "import / count" (who, when, from → to);
  - a product missing from the file is marked inactive, never deleted.
  - Then R3.4 stands, and the stock card stays true. My estimate: **≈ +0.5–1 d** on R3.4, Sober's to size.
- **Stock card (พี่เบส):** most of it is already in scope.
  - R3.6 keeps ± with history (who / when / from → to / reason), and R3.8 reports movement over a period.
  - What's missing is a **per-product running-balance view** over the same movements. My estimate: **≈ 1–1.5 d** if R3's movements are one table, Sober's to confirm.
  - It only works with the import above. Overwrite would wipe it.
- **The correction she needs:** the meeting text says import overwrites. Our design keeps history. One line to her, once Sober agrees.

**#4 of the questions: the Master Plan. My lines, so it can't be read two ways:**
- **For each feature:**
  - the week it goes live, counted from GO, and the rate it assumes (stated, e.g. 7 engineer-days a week + 1 QA week);
  - what stays **by hand until when** (e.g. PT / FL / STAFF pay by Other ± until F3; Commission until Stock).
- **For each open ruling:** the default we build on, and the date it's needed by, so a late answer visibly moves a date. Bonus 100 A/B, REQ-5007's difference rule and #2's A/B above.
- **What changes for her:** the way she works today vs. after, e.g. revenue counted at confirm, not at sale. "Correct" alone is two readings.
- **Data she owes, by week:** staff list + types + base pay before Salary; her October sheet for a replay; product sheet before Stock.
- **The extras rule:** 263 ฿/d during the build, 500 ฿/d after the 6 months free. Both numbers on one line, so #8 can't be misread.
### Tanya
**Q3. Read as the customer would. Read-only, from the summary file, REQ-120 and my own TESTs.**

**A. Lines she'll hold us to that our files contradict:**
1. **Stock import "ลบข้อมูลเดิมทั้งหมด … Overwrite"** (lines 27, 73) against **R3.4** ("matches by Model code … never deletes history"). This is the sharpest one, because the summary also gives her a workflow: export, edit, upload back. Under R3.4, a row she deletes from the sheet stays in the system. Under overwrite, the movement history and a stock card (#4) can't exist. Whichever rule stands, she needs a written correction before Stock starts, or the first import will "fail" by her reading.
2. **Mid-course change, "หน้าบ้านคำนวณรายได้ … เป็นรายชั่วโมงตามจริงอยู่แล้ว"** (line 21). **My run contradicts it for money:** on sid, in TEST-141 / REQ-5007, a whole-course change moved the **whole sale** between activities (the owner's SQL: −649,000 old, +790,000 new). Nothing was split by the hours taught. The front office counts *classes* per hour (the SOM Dashboard, TEST-138), not revenue. If the owner's answer is "we map from the per-hour data", that's a new design for revenue, not a reading of what exists.
3. **"เงินเดือน ≈ 1 เดือน (≈ 7 สัปดาห์)"** (lines 42, 86). She'll remember "1 month". Our files: the first slice ≈ wk 7, the whole Salary block ≈ wk 10–11. "≈ 3 เดือน" for the whole build (line 38) is roughly in line with ≈ 13–14 weeks. The 6 free months count from that end date, so a slip there moves the warranty too.

**B. Lines she'll hold us to that our files don't cover:**
4. **The CEO "กดเตือน / กดส่งเตือน" button** (lines 13, 63). R1.5 has *timed* LINE reminders at 09:00 and 11:00, not a button. Line 15 also says reminders use the LINE quota, which isn't in REQ-120.
5. **The coach "Export ไฟล์" of the slip** (lines 13, 63). It's still the open "Payment Detail export" (REQ-120 line 220), which isn't in the price. พี่ฟีน's "go on if small" got no number.
6. **The dark back-office theme** (lines 33, 68). Agreed in the room, but in no file. The final-UI pages weren't built for it.
7. **"ใช้รหัสเดิมได้เลย", the same login as the front office** (line 31). R0.1 says each coach has their own user. Whether coaches have a front-office login today isn't in our files. It needs Sober's word.
8. **Palm polishing the back office** (line 32) and **the server at +500 ฿/month** (line 47). Not ours to test; noted so they don't land on the desk as promises.

Covered already, checked: cancel only the classes not yet taught, and tell the parents (REQ-120 line 173); branch and payment method on every line (R2.4); rentals; camp confirm (D3, flagged as new work, not sized).

**C. Statements of ours in it that are untested claims:**
- **"Dashboard … ตัวเลขคำนวณถูกต้องแล้ว"** (lines 48, 89). True **for what I gated:** REQ-5004 on sid (counts, screen, paged list on `45bf187`) and on uat read-only (API and month screen on `dccddce`, recounted against the CSVs). **Not true yet** for the build she'll see: Palm's text change "ขึ้นระบบตอนเย็น" (`45bf187`) isn't on uat, and my uat screen round of that build hasn't run. So the honest line is "correct on what's been tested; the latest build is tested on our test system, and her system is next".
- **The import behaviour** (A1) describes a system that doesn't exist yet, and it's not what the REQ says.
- **The login** (B7): login cases on deployed hosts are NOT_TESTED under the standing rule, so "ใช้รหัสเดิมได้เลย" is unproven by QA either way.
- **The weeks and "≈ 3 เดือน"** are estimates, as the SAs say. Nothing tests them.

**Q4. The Master Plan, my one line:** for each feature, state its week, what's typed by hand until then, its acceptance check in her own words (for example "the slip total = what you paid in October"), and the data she owes and when. Every line in A and B above must be ruled in or out by name, so the summary can't be read against it later.

## Porter's synthesis, 2026-11-07 (to the owner)
- **Agreed by all three:** 🔴 import-overwrite contradicts R3.4 and would destroy the stock card; R3.4 stands, the customer gets a correction. "Revenue already per hour" is not true in code (Silver) and TEST-141 showed the whole sale moving (Tanya). "Salary ≈ 1 month" must not stand: slice wk 7, whole block wk 10–11.
- **Extras the room approved only "if small", never given a number:** slip export +5 d + "remind now" +1 d ≈ 1,600 ฿ (Sober). Others: import as a full count via adjustments +0.5–1 d, stock card ≈ 1–1.5 d (Silver; Sober sizes), course-change revenue A +1.5 d (Silver's pick; B +5–7 d), dark theme 0.5–1 d (final UI already opens dark). ≈ 9.5–11 d ≈ 2,500–2,900 ฿ at 263 ฿/d; the revenue split may overlap REQ-5007's +1.5 d.
- **Master Plan (พี่เบส) = URS v1:** per feature a week, what's by hand until then, an acceptance check in her words, the data she owes, each disputed line ruled in or out by name (Tanya).
- **Open, owner's:** Bonus 100 A/B, go-live date, GO (not in the summary).

---
### Sober — Import ruling (addendum, 2026-11-07, read-only)
Owner's §13 ruling = git-style import (upload → per-item diff → confirm → each change becomes a movement; nothing deleted). This is R3.4 done right. Sized against R3.4 (3.9 d) + the movement model (R3.2/R3.5/R3.6/R3.8, `bo.movement`) **as they stand**:
- **Already in Stock's 37.0 (R3.4, 3.9 d):** match by Model code · update existing · add new · **never delete** · a **dry-run preview** · export · manual add. The upsert and a basic preview are here.
- **Added by the ruling:**
  - **Classified per-item diff + per-line confirm** (upgrade the dry-run into: unchanged · **balance ±** · **field change** · **new** · **in-system-not-in-file** · **would-go-negative**) ≈ **+1.5 d** (FE diff table · BE diff compute · the edge rules).
  - **Write each confirmed BALANCE change as a `bo.movement` row** (reason "import adjustment") — the import becomes another movement writer, reusing R3.2/R3.5's model ≈ **+1 d**.
  - ⇒ **git-import ≈ +2.5 d** on top of R3.4.
- **What the diff shows per the owner's cases:**
  - **Removed row** (in system, not in file): **nothing deleted** — shown "in system, not in file · no change"; zeroing it is a deliberate manual edit, never automatic.
  - **Price / name / category change:** a **field change** → old→new; on confirm it **updates the product** (NOT a stock movement — a rename/reprice isn't an in/out; audited as a field edit).
  - **Negative result** (a balance edit taking stock < 0): **flagged and refused** on that line (or requires an explicit adjustment reason) — never a silent negative.
- **Separate from the import — พี่เบส's Stock Card** (per-item running balance + every In/Out/Transfer/adjustment): R3.8 today is a **period movement report**, not a per-item card. A real **Stock Card view** ≈ **+2–2.5 d** (the screen + the running-balance query). Size it on its own; it is **not** inside 37.0.
- **Net:** Stock block **≈ 39.5 d** with the git-import (37.0 + 2.5); **≈ 41.5–42 d** if the per-item Stock Card is also wanted. Both are **extras at the old rate (263 ฿/d)** unless the owner folds them into 39,200 — Porter's call. No GO.
