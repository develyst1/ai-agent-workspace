# Inbox — SA-B (Team B, Silver)

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

---

---

---

---

---

---

---

---
---

---

---

---

---

---

---
---

---

---

---

---
---
---

---

---
---

---

---

---

---

---
---

---

---

---
## @Porter → @Silver — 2026-10-21 — REQ-122 v3 prototype: read REQ-122 **§8**. Your part: Revenue, Stock (incl. the STOCK OUT cart, Products with qty + location + filter, the Locations page removed, Stock Demo order) and Reports. Sober has the shell + Salary + Notifications + the front-office pages. Follow his shell contract. Size it (+10%; you estimated ≈2.5 d for Fanta), cut from **745**, and reply in `inbox/PM.md`.

---
## @Sober (SA, Team A) → @Silver (SA, Team B) — 2026-10-21 — REQ-122 v3: the SHELL contract (TASK-831), for coordination (Porter: "coordinate the shell contract with her")
What the shell v3 will give your pages (CONVENTIONS v3 follows when 831 lands; nothing changes in your files before that):
- the answer key `somspec.v3`: every page unanswered; the export lists all pages in menu order;
- ALL CAPS menu headings + a **FRONT OFFICE (SOM SCHEDULE)** group;
- **one date helper** (dd/mm/yy, "16/10/26");
- **one month picker** (yours to use on Revenue if you want it);
- **the A/B ask slot in the [?] popup:** `ask: { q, a, b }` on your page, stored + exported with its ✓/✗. **Your 4 follow-ups** (commission lower/raise · per item/per bill · refund status + voucher · Low Stock recipients) use it;
- **the single-file build:** every `SPEC.load`-ed file and `help/*.png` is inlined, so **load only through `SPEC.load`** and reference images only as `help/<name>.png`.

**One thing to agree:** §8.10 gives "the front-office pages" to Team A. If Porter confirms, your v2 `pages/b-fo/*` + `data/b-fo.js` move to Team A (TASK-834), and you drop their lines from `pages-b.js` on the same day. Tell me if you see a problem.
Anything you need from the shell → write here.

---
## @Porter → @Silver — 2026-10-21 — ✅ GO REQ-122 v3, Team B: TASK-745 + 746 (≈6.6 d), started on Sober's v3 shell contract
- **Front-office pages:** `pages/b-fo/*` + `data/b-fo.js` move to **Team A** (TASK-834). **Unregister them from `pages-b.js`** when Sober's 834 lands. Fanta doesn't edit them.
- **The ask slot will take a LIST** (Sober's 831), so STOCK OUT carries its two questions in [?].
- **Delivery: one self-contained .html** (Sober's build). Your pages must have no external loads.
- 746 follows Tanya's TEST-115 captures. Block left after this: 747–749.

---
## @Porter → @Silver — 2026-10-21 — Answers to your addendum
- **Routing: you're right.** My "coordinate with her" to Sober was loose wording. SA → SA is not a channel. **The shell contract is a FILE:** Sober publishes it in `CONVENTIONS.md` (v3), you build on it, and questions about it come to me. Sober is told the same.
- **`ask` as a LIST: already ordered** in Sober's GO (≥ 2 questions per page). STOCK OUT keeps its two separate questions; don't merge them.
- **The b-fo hand-over:** confirmed (see my GO above). Drop the lines when 834 lands.
- **Your inbox clean-up:** fine to leave it. A processed entry marked read in your log is enough.

---
## @Sober → @Silver — 2026-10-21 — REQ-122 v3: Porter's GO. Two updates to my shell note above
- **The ask slot is a LIST:** `ask: [{ q, a, b }, …]`, so STOCK OUT can carry two questions.
- **The front-office handover is confirmed:** please unregister `pages/b-fo/*` + `data/b-fo.js` from `pages-b.js` on the same day Fern registers them in `pages-a.js`. I'll tell you the moment she's ready.
- CONVENTIONS v3 follows when TASK-831's shell is stable.

---
## @Porter → @Silver — 2026-10-21 — From Sober's 831 verify (CONVENTIONS v3 is now published, spec folder `CONVENTIONS.md` §00)
1. 🔴 **`#/revenue/categories` throws** (`undefined.map`) after a `data/b-revenue.js` change in today's test build. Fix it in 745.
2. **Not a defect:** an admin seeing the **product prices** on Products / Import / STOCK OUT. §8.9's "no money, no prices" means OUR service fee only. The admin rule stays REQ-120 R0: **no coach pay** (beyond the sale's own commission line) and **no revenue** (CEO only). Check STOCK OUT's admin toast still shows no revenue.
3. **The FO menu heading = SETTING** (her word). Unregister `pages/b-fo` when 834 lands.
## [Fanta → Silver] 2026-10-21 — TASK-745 REVIEW
Team B v3 built in the spec folder (Revenue · Stock · Reports), dates via SPEC.date, ask lists. Headless check: 19 pages · 16 dialogs · 31 popups · 0 errors · 0 dead buttons. Not verified: full real-browser pass, pins (TASK-746). Details, old→new page list for Tanya, and 5 decisions to confirm are in the TASK's Implementation Notes. Removed routes: stock/locations, stock/sales-record → stock/stock-out. Please review the four B_ASKS effects (my wording). Also: inbox/FE-B.md processed lines can't be drained (no drain-inbox.mjs in smart-scheduler/ai-worker).
## [Fanta → Silver] 2026-10-21 — re your nudge (categories fix + v3 notes)
Already covered in TASK-745 (REVIEW): 1) #/revenue/categories opens clean (data/b-revenue.js rewritten; headless 0 errors). 2) Admin STOCK OUT toast shows no revenue ("บันทึกแล้ว: ตัดสต็อกแล้ว + บันทึกการขายแล้ว"); admin sees product prices only. 3) b-fo untouched. SPEC.date everywhere, grep clean. One note: my 4 B_ASKS items use the legacy {id,q,options:[{k,label,effect}]} shape (shell still accepts it) to keep the A/B consequences; say so if you want them converted to {q,a,b}. No answer: set (she hasn't answered in LINE as far as my files show).

---
## @Porter → @Silver — 2026-10-21 — FYI from Sober's 832 verify: `#/stock/stock-out` has no help image (the route is new; it was `/sales-record`). Expected until Tanya's TEST-115 captures. Make sure 746 points `help.img` at the new capture name.

---
## @Porter → @Silver — 2026-10-21 — TEST-115 part B: 13 / 14 pages ✅. STOCK OUT needs two fixes, then 746 goes
See Tanya's 10-21 entry in `inbox/PM.md` (the 14 captures are in `help/`).
- **❌ F1:** the STOCK OUT bill discount has **no ฿ / % choice**. Her words: *"Discount = เลือกเป็นบาทได้ด้วย"*; R3.5 says ฿ or %. **Fix.**
- **🟡 N1 → treat as a FIX:** the STOCK OUT **Commission box sits below the capture frame**. This is exactly what Khwan couldn't find in v2 (REQ-122 §6, *"อันนี้เลือกคอมครูตรงไหนคะ"*). **Put the commission picker inside the sale form, visible without scrolling at 1280×800.**
- **Then:** Tanya re-captures STOCK OUT only. **GO 746 (pins) now for the 13 passing pages**; STOCK OUT's pins follow its re-capture.

---
## @Porter → @Silver — 2026-10-21 — ▶️ NOW: the b-fo hand-over (Sober's 834 is ready). **Remove the 6 b-fo lines from `pages-b.js`**: line 7 + lines 28–32 (Sober's count; check them by content: the `pages/b-fo/*` / `data/b-fo.js` registrations only). Nothing else in the file. Tell me when done, so Fern can register Team A's right after.
## [Fanta → Silver] 2026-10-21 — TASK-745 TEST-115 part B fixes done (STOCK OUT)
1. Discount now has a ฿ / % selector before the number (example stays 10 % → −405 ฿, no totals changed).
2. STOCK OUT is now two columns: Items + form on the left, the Commission box (coaches who sold + each coach's amount) on the right, at the top. Measured in the built-in browser at 1280×800: coach checkboxes bottom at y=235, both commission rows within the first ~330 px, no scrolling. Help step 3/4 reworded (unit selector; "Commission box on the right").
Headless re-run (3 roles): 19 pages · 16 dialogs · 31 popups · 0 errors · 0 problems. Tanya can re-capture STOCK OUT. Starting TASK-746 (13 pages) now.
## [Fanta → Silver] 2026-10-21 — TASK-746 (13 pages) done; 745 part B fixes already reported above
Pinned the 13 passing pages on the NEW captures (help.img = new slugs), each checked as an overlay on its real PNG; Import corrected from the PNG. No-pin list + method are in the TASK-746 Implementation Notes. Headless: 19 pages · 31 popups · 0 errors. STOCK OUT: unpinned, waits for Tanya's re-capture (tell me when it lands). Set 746 to REVIEW with STOCK OUT outstanding.
## [Fanta → Silver] 2026-10-21 — b-fo hand-over DONE (TASK-834 ready for Fern)
pages-b.js: removed exactly the 6 b-fo lines (SPEC.load data/b-fo.js + the five pages/b-fo/*), plus the now-orphan comment line. Nothing else touched; b-fo files left in place. No b-fo/B_FO reference remains in Team B files. Headless: Team B pages 14 (was 19) · dialogs 13 · popups 21 · 0 errors · 0 problems. Fern can register Team A's copies now.
## [Fanta → Silver] 2026-10-21 — both items done
1. b-fo hand-over: already DONE (entry above: 6 lines out of pages-b.js, headless 14 pages / 0 errors).
2. ECA pin 2 moved to the Student / Class-per-Term row + Total Amount (x23.2 y32.2 w49.7 h11.0), so its corner no longer sits under ①. Trade-off: the Price-per-class field (top row, right) is not inside ②'s box; say if you want ② to start at the Price field instead. Not re-overlaid on the PNG after the edit (geometry from the same live measurements as before).

---
## @Porter → @Silver — 2026-10-21 — Date fields: **B**, not A
- **Why:** Khwan will click through the file on HER own browser. A native field shows whatever her locale gives (US 10/16/2026, or a Buddhist year). Recapturing with en-GB (A) only fixes our pictures, not what she sees.
- **Her words are the rule:** *"Date = เอาปีด้วยค่ะ 16/10/26 ขอเป็นเลือกวันที่ในช่องนะคะ ถ้าเป็นการพิมพ์ format จะต่างกันค่ะ"*.
- **So B:** a field that always SHOWS `16/10/26` (via `SPEC.date`), with a calendar picker to choose. No typing format.
- Apply it on every Team B date field: Add Manually, Refund, ECA, Stock In, Stock reports. **Tell me if Team A has native date fields too**; I'll pass it to Sober.
- Then Tanya re-captures those pages + STOCK OUT + revenue-summary (no toast) in ONE pass. Say when B is in.

---
## @Porter → @Silver — 2026-10-21 — Date fields: **don't build your own picker.** Fern is adding ONE shared shell picker, `SPEC.dateField` (always shows dd/mm/yy). Switch your 5 native inputs to it as soon as it appears in `CONVENTIONS.md`. I'll tell you when it's published. (Team A has 0 native date inputs.)
## [Fanta → Silver] 2026-10-21 — date fields = B DONE (5 pages)
- New `data/b-dates.js` (loaded from pages-b.js, after b-stock): `window.B_DATE.field(iso)` = a READ-ONLY box showing SPEC.date (16/10/26) + a calendar-icon button (`data-dialog="b-date-pick"`), and ONE shared dialog `b-date-pick` "Select date": static October 2026 grid (typed rows, no calculation), a day closes it with a toast "เลือกวันที่ dd/mm/yy แล้ว (ตัวอย่าง)"; the field itself does not change (mock).
- Replaced all 6 native date inputs: Add Manually (Date), Refund (Date), ECA Payment (Payment Date), Stock In (Date), Stock reports (From + To). grep `type="date"` in Team B = 0.
- Help step updated only where it mentioned choosing from a calendar (Stock In). The other steps just say "วันที่"/Payment Date, nothing about typing.
- Headless (3 roles): 14 pages · 14 b- dialogs (+1) · 21 popups · 0 errors · 0 problems. Also opened the dialog in the browser: renders, 16 highlighted.
- Pins of the 5 changed pages may shift a few % (the date box is a different width): NOT re-checked — they are re-checked after Tanya's single re-capture, as you said.

---
## @Porter → @Silver — 2026-10-21 — ▶️ `SPEC.dateField` is PUBLISHED (spec `CONVENTIONS.md` §00 item 9). Switch your 5 native date inputs to it now, plus the ECA pin fix. Tell me when done: Tanya then re-captures Team B's date pages + STOCK OUT + revenue-summary (no toast) in the same pass as Team A's.
## [Fanta → Silver] 2026-10-21 — SPEC.dateField switch DONE
- All 5 pages (6 fields) now use `SPEC.dateField(iso, { label })`: Add Manually (Date), Refund (Date), ECA Payment (Payment Date), Stock In (Date), Stock reports (From + To). Visible <label> text kept; the shell wires it.
- `data/b-dates.js` deleted, its SPEC.load line removed from pages-b.js, dialog `b-date-pick` gone. grep in Team B files for B_DATE / b-date-pick / b-dates / type="date" = 0.
- Headless (3 roles): our 14 pages and 13 b- dialogs: 0 console errors, 0 problems, 31 popups. (The page count now reads 19 because Fern's Team A fo pages are registered; my harness flags `#/fo/payment` and `#/fo/confirm-camp` "ask not shown" — that is my checker not knowing their ask shape, Team A's pages, not touched.) I loaded shell/datefield.js into my checker.
- Pins of the 5 changed pages: not re-checked yet (after Tanya's re-capture).

---
## @Porter → @Silver — 2026-10-21 — Team B's re-capture pass ✅ (all date fields dd/mm/yy; revenue-summary has no toast; STOCK OUT F1 ฿ / % + N1 commission in frame fixed). **🟡 N4 → fix:** a **"Remove" button is cut to "Re"** (Tanya's 10-21 entry in `inbox/PM.md` has the page). Widen it or let it wrap. Then **pin the new STOCK OUT capture (746)** and tell me Team B is final.
## [Fanta → Silver] 2026-10-21 — last two items done (N4 + 746 pins on the new captures)
1. **N4 (STOCK OUT "Re")**: the Remove button/cell is now white-space:nowrap; nowrap alone made the Items table overflow (524 > 446 px, Remove pushed out of the card), so the product select is now 165 px and Qty 50 px. Measured at 1280×800: table 446/446 (no scroll), "Remove" right edge 731 px inside the card (right 760), full word.
   ⚠ This changes STOCK OUT's Items table (narrower select, full Remove) AFTER Tanya's capture → one more STOCK OUT capture would be needed to show it. Layout above/below the table is unchanged.
2. **TASK-746**: STOCK OUT pinned (5 pins, on the current help/stock-stock-out.png; vertical positions don't change with N4, but that PNG still shows "Re"). Re-checked the 6 re-captured pages as overlays on their NEW PNGs: revenue-summary ✓, manual ✓, stock-reports ✓; corrected from the PNGs: eca-term (pin 2 → 47.5×10.1, pin 3 Payment Date field now inline → x73.1 y29.8 w18.8 h4.3, pin 4), stock-in (Save pin up to y35.8), refund (card h61.3, Save refund y72.3). All verified on overlay after the fix. Every Team B page now has help.img + pins.
- Headless: 14 pages / 13 dialogs / 31 popups, 0 console errors; my checker's only 4 flags are Team A's #/fo/payment + #/fo/confirm-camp (ask shape).

---
## @Porter → @Silver — 2026-10-21 — ▶️ `stock-stock-out.png` is re-captured (Tanya: both "Remove" links in full, the Commission box in frame, no toast). Re-check its pins, then call **Team B final**.

---
## @Porter → @Silver — 2026-10-22 — REQUEST: size the EXISTING back office, as if it were built from ZERO (analysis only)
**Owner, 2026-10-22, verbatim:** *"แล้ว มองอันเดิม ก่อน ว่าก่อนเราจะแก้เป็นแบบนี้ ถือว่า อันนั้น ถ้าทำใหม่จาก 0 เป็นกี่วัน"*.
**Why:** he compares the new back office (REQ-120, ≈175 d) with what the customer already has (bought as Option C), in the same unit.
- **Read the code as it is today:** `smart-scheduler-backoffice-back` + `smart-scheduler-backoffice-front` (paths in `machine.local.md`). Plus the back-office parts that live in the scheduling back (the `bo.*` write points, C1).
- **Inventory it module by module:** what exists and works (screens, endpoints, tables, jobs). One line each.
- **Size each module as if built from zero today:** the same unit as REQ-120 (engineer-days, your estimate + 10%, build + tests). **No credit for "already written".**
- **Then a total**, plus a line: which of these REQ-120 keeps / reuses vs replaces (so the owner can see the overlap).
- **No money, no opinions on price.**
- **Your part** (you surveyed it for C3): the existing back office's **auth / users / roles, revenue / income / reports, the dashboards, settings**, and the back-office front's shell. Sober takes Stock / items / movements, pay-like parts and the C1 write points. **No overlap:** list your module names; I merge.

---
## @Porter → @Silver — 2026-10-22 — ⚠️ RE-SPLIT (replaces my earlier split today): **you size the WHOLE OLD back office (BO_old), as if built from zero**
**Owner's method, 2026-10-22, verbatim:** *"ฉัน อยากรู้ว่า frontoffice + backoffice ที่ทำไป ตอนนี้ นับเป็นกี่วัน · ให้จำนวนวันนั้น = 73000 เอามาหาร จำนวนวัน จะตกวันละเท่าไหร่ · แล้วเอา ราคาต่อวันนั้น อ่ะ มา คูณ กับ backoffice new - backoffice old"*. So: **rate = 73,000 ÷ (FO_now + BO_old)**; **price = rate × (BO_new − BO_old)**.
- **Scope:** `smart-scheduler-backoffice-back` + `smart-scheduler-backoffice-front` as they are today (every module), **plus** the back-office write points inside the scheduling back (C1, `bo.*`).
- **Module by module, one line each:** engineer-days **from zero** (estimate + 10%, build + tests, the same unit as REQ-120). No credit for "already written".
- **Then the total**, and one line per REQ-120 part: what of BO_old it keeps / reuses.
- **Sober now does the front office (FO_now) only.** No money. Reply in `inbox/PM.md`.

---
## @Porter → @Silver — 2026-10-22 — ONE-LINE confirm for the owner's pricing: is REQ-120's ≈175 d (BO_new) **incremental**, i.e. sized ON TOP of reusing BO_old (scaffold, schema, the C1 bridge, BF-SHELL…, as your keeps / reuses table suggests)? Or is it a from-zero total of the new back office? If incremental, give the from-zero equivalent: 175 + the BO_old parts it reuses (sum them). Also note: Sober counts the C1 sale posting / FL ceiling in FO_now module 9 (≈12 d), and you count C1 in BO_old (17.2), so it's double-counted once merged. Which side should hold it? One line each. Reply in `inbox/PM.md`.

---
## @Porter → @Silver — 2026-10-22 — Pricing: two more numbers
**Owner, 2026-10-22, on the pricing write-up's "not included" list** (QA/deploy/UAT · the §4 Reports · Palm's screens), verbatim: *"เอ่า นับสิ"*. Palm's screens are now counted in FO (Porter). Two more numbers are needed, analysis only, engineer-days, the same unit:
1. **QA + deploy + UAT** effort for **each** of FO_now, BO_old and BO_new (from zero). Use one consistent rule, e.g. a % of build or per module, and say which. All three sides get it, so the comparison stays fair.
2. **The §4 back-office Reports** (REQ-120 §4 headings: REPORT · STOCK · CHECK IN · COURSE · SALARY · STUDENT). A **rough** size from the headings + what Khwan's sheet / prototype show. Mark it as rough (the content isn't agreed with her yet).
- **Yours:** item 1 for BO_old + BO_new; item 2 for REPORT · STOCK · SALARY-free parts as you see fit. Agree a split with me if needed. **Sober does FO_now's QA line and the SALARY / CHECK IN / COURSE / STUDENT reports.** Reply in `inbox/PM.md`.

---
## @Porter → @Silver — 2026-10-22 — FYI, no action: the pricing is CLOSED. The owner ruled *"ยอมนับรวมเข้าไป โดยไม่ต้องคิดวันเพิ่ม"*: QA / deploy / UAT, the §4 reports and Palm's screens are included in the price with **no extra days**. So the 25 % line and the report sizes are recorded (REQ-120 §10) but **not used in the price** (≈ 39,200 ฿). Thank you, nothing more needed.

---
## @Porter → @Silver — 2026-10-22 — ✅ GRANT TASK-747: the SOM Today % follows the Daily Report rule (Khwan chose A)
Read REQ-124 → "Khwan, 2026-10-22 … = A".
- `today.attendanceRate` = **attended ÷ (Confirmed + on leave)**: the same numerator / denominator definitions as `/reports/daily` (REQ-119 Total booked). Prove it by value: **the same day ⇒ the same % on both endpoints**, incl. a day with a child on leave and a day with no bookings (0, not NaN).
- **Claim:** `lib/som-contract.ts` (the rate line), its test + set, the contract / OpenAPI description if it states the formula. Nothing else. No front, no migration.
- Then the commit list. Also **one line for Palm** (his doc §1 states the old formula), and I'll draft it.

From Bob 2026-10-22: TASK-747 is in REVIEW - SOM today.attendanceRate = countDaily's own value (attended / (Confirmed + On leave)); the leave case is 50, not 67; empty day 0. SAFE 5064 pass / 0 fail (363 files), tsc 0; sets 741 45/45 - 742 47/47 - 743 25/25 - 737 11/11, checksums identical; old SOM/daily code 0-line diff. Own pins only (741 test + set). HEADS-UP: the repo .env now points at the CUSTOMER's system (LINE_OA_WRITE_ALLOW / LIFF_ID / LINE_LOGIN_CHANNEL_ID) so the test-env guard refuses a bare bun test / mutation:run; I did not touch it and used the SAFE overrides - see the TASK note.

---
## @Porter → @Silver — 2026-10-25 — REQ-129: the customer says the Daily Report's per-coach **Total (+Group)** is wrong (24 Oct, uat). Read REQ-129
1. **From code + Palm's `backend-daily-report.md` (the workload section):** exactly which statuses and kinds count in Total (+Group). Do **on-leave** (34 that day), pending, ECA / Other hours and camp hours count? What did "(+Group)" mean in Palm's spec?
2. **Tie it to Tanya's TEST-118 row lists** (Kid 3/6 → 9; Tarb 0/0 → 2; Ek 0/0 → 1).
3. **Is it a bug against the agreed definition, or a definition the label misleads?** If the latter, give 2–3 options as consequences for Khwan (A / B / C), with the size.
No fix yet. Reply in `inbox/PM.md`.

---
## @Porter → @Silver — 2026-10-25 — ✅ GRANT TASK-748: REQ-129 = **B** (Khwan: *"แบบ A แต่นับงานกลุ่มเป็นชั่วโมง"*)
- **Per-coach Total (+Group)** = that coach's **confirmed lessons (attended included)** + **group work in HOURS**: each ECA / Other / Free / KOL hour, each camp hour, each group class (counted by its hours).
- **Out:** on leave, pending, awaiting, cancelled, paused. The same-slot double rows (a leave + its replacement) therefore count once, as the replacement.
- **Prove it by value** on her cases: 25 Oct Kid = 6; 24 Oct Kid = 5, Toth = 4, Tarb / Ek = 0 (+ any group hours). Plus a 2-hour ECA = 2.
- **Claim:** `lib/daily-report.ts` (the workload loop) + its tests + set, and the contract / OpenAPI text if it describes Total. Back only, the shape unchanged. **One line for Palm** (his doc's Q6 is now answered).
- Then the commit list. Under the new rule I'll say **"ขึ้น git"**.

From Bob 2026-10-25: TASK-748 is in REVIEW - the Daily Report per-coach total = confirmed lessons + group work in hours (one named constant WORKLOAD_STATUSES; only the workload loop changed). SAFE 5091 pass / 0 fail (365 files), tsc 0; NEW set 748 9/9; 737 11/11 - 743 25/25 - 741 45/45 - 742 47/47 all still bite, checksums identical; getDailyReport + old SOM files 0-line diff. Two own pins re-based in 737's test (Palm §8 total 11 -> 9; coach B 2 -> 1). Notes in the TASK.

---
## @Porter → @Silver — 2026-10-25 — **ขึ้น git**: TASK-748 (back, exactly the 4 files in your entry), per the `git-command` skill (the existing branch, the shared message shape). **Commit + sync only, no deploy.** Report the hash.

---
## @Porter → @Silver — 2026-10-25 — REQ-130: Khwan asks what the admin morning digest's **"Sales not posted to backoffice: 6"** means. Read `requirements/REQ-130-…md`. From code: what `sales_not_posted` counts and why a sale would be 'not posted'; a **bare read-only SQL** for the owner to list today's 6 on uat (ids / kind / date / status, no personal data); real gap or false alarm; the fix if real. Reply in `inbox/PM.md`.

---
## @Porter → @Silver — 2026-10-25 — REQ-130: the owner's SQL result (uat), **13 rows**. Ids withheld here (the owner has them); kinds / times only
| # | kind | day | start | price_group | channel | marked_at (BKK) | dayend_ran |
|---|---|---|---|---|---|---|---|
| 1 | first_trial | 10-18 | 17:00 | bike-skate | staff | 10-18 18:20 | true |
| 2 | single_session | 10-18 | 09:00 | onewheel | staff | 10-18 18:34 | true |
| 3 | single_session | 10-18 | 09:00 | bike-skate | staff | 10-18 18:34 | true |
| 4 | single_session | 10-18 | 09:00 | bike-skate | staff | 10-18 18:34 | true |
| 5 | first_trial | 10-18 | 17:00 | bike-skate | staff | 10-18 18:20 | true |
| 6 | first_trial | 10-18 | 17:00 | onewheel | staff | 10-18 18:12 | true |
| 7–13 | first_trial ×3 / single_session ×4 | **10-25 (today)** | 10:00–14:00 | bike-skate | line ×5, shopfront-qr ×1 | 10-25 09:52–13:51 | **false** (today's day-end hasn't run yet) |

**My reading, for you to confirm:**
- **The 6 in the digest = rows 1–6 (18 Oct)**, all marked attended **the same evening (18:12–18:34)**, and that date's day-end **succeeded**. So it is NOT a next-day late check-in. Either the **day-end ran BEFORE ~18:12** that day (then cause 1 still applies, as same-day-but-after-the-run), or something else.
- **What time does the day-end cron run?** I can ask the owner for `job_runs` start times for 10-18.
- **Also odd:** the 10-20 08:00 digest showed `sales_not_posted: 0`, while these 18-Oct rows were inside its 7-day window. Was the posting there and later reversed? Or is `updated_at` not the marking time?
- **Rows 7–13 (today):** expected to post tonight. Re-check tomorrow.

Give me: the cause; any SQL you need (e.g. `job_runs` for 10-18, `bo.movement` for those ids incl. reversals); and the fix + size (TASK-749).

---
## @Porter → @Silver — 2026-10-25 — ✅ GRANT TASK-749 (REQ-130): the day-end also sweeps the last 7 days' ATTENDED trial / 1 HR / priced OTHER rows with no SALE movement (idempotent via `rev:<id>`; an undone row stays reversed). **Claim:** `src/services/jobs.service.ts` (the day-end posting select only; Team A's file, so Sober is copied) + a new test + set. SQL 1 / 2 have gone to the owner; tie your DONE note to their result. Build now. Git only when the owner says so.

From Bob 2026-10-25: TASK-749 - LIST before I edit (your rule). Plan: inside the posting block only - widen the attended select from "date = runDate" to the 8 dates runDate-7..runDate (via the existing inArray + addDays, no new drizzle import), keep the SAME per-booking loop, count older rows into summary.sweptPosted (revenuePosted stays today-only). The auto-attend block is not touched. ONE line OUTSIDE the posting part is needed: an import line in jobs.service.ts  `import { NOT_POSTED_WINDOW_DAYS } from "../lib/attention";`  (reuse the digest constant, as the TASK says). Asking GO for that one import line; I start the Team B test + set meanwhile.

---
## @Porter → @Silver — 2026-10-25 — REQ-130: SQL 1 + 2 results (the owner, uat). **The cause looks clear: the day-end runs at 17:30 every day, not 23:30**
**SQL 1:** `end-of-day` started **17:30** BKK on EVERY date 10-17 … 10-24 (status success; auto_attended 3 / 4 / 0 / 5 / 6 / 2 / 0 / 4; revenue_posted 7 / 13 / 7 / 5 / 3 / 6 / 4 / 9). `daily-digest` 08:00 daily: sales_not_posted **1 (10-17), 1 (10-18), 6 from 10-19 to 10-25**. *(The earlier "0" for 10-20 came from the **sid** outbox digest, not uat. Not a contradiction.)*
**SQL 2 (18 Oct, 19 ATTENDED trial / 1 HR rows):**
- **13 have a `SALE/SALE@10-18 17:30`** movement: posted by the 17:30 run.
- **6 have ONLY `BOOKING/…` movements**: the 3 × 09:00 SINGLE_SESSION last written by staff at **18:33–18:34**, and the 3 × 17:00 FIRST_TRIAL by staff at **18:10–18:20**. These 6 are the digest's 6. **No undos.**
- One row (b6638872…, a 10:00 trial) shows `SALE@10-18 17:30` + a `BOOKING_REVERSAL@10-18 09:58`. Note it, in case it matters.

**So:** any attendance marked **after 17:30** (staff closing the day after evening classes) is never posted. A **daily, systemic** gap, not a one-off. Please confirm, and say:
1. why 17:30 (the server's scheduled-task time? a time-zone offset? 23:30 per `DEPLOY-scheduled-tasks-windows.md`). **The owner's server step** to move it to 23:30, if that's the intent;
2. does TASK-749's 7-day sweep still stand, **plus** the schedule move (both, I'd say);
3. the 18 Oct re-run: still needed today (18 Oct leaves the 7-day window after today).

From Bob 2026-10-25 (amends my entry above): TASK-749 - the selection lives in a NEW Team B file src/lib/day-end-sweep.ts (testable by value). Ask: (1) that new file; (2) ONE import line in jobs.service.ts: import { isSwept, postingWhere } from "../lib/day-end-sweep"; (replaces the NOT_POSTED_WINDOW_DAYS import ask); (3) inside the posting block only: .where(postingWhere(runDate)), date: bookings.date in the select, and the counters (revenuePosted = today, summary.sweptPosted = older). jobs.service.ts untouched until you answer.

From Bob 2026-10-25: TASK-749 built (jobs.service.ts posting block + import + new src/lib/day-end-sweep.ts; test 18 pass, set 14/14). Full SAFE: 5110 pass / 3 fail, tsc 0. The 3 fails are MIRROR PINS of the sweep type list, which moved from jobs.service.ts into day-end-sweep.ts - NOT touched, asking: (1) src/lib/group-session-req095-2a.test.ts:232  (2) src/services/booking-pause.test.ts:241  (3) src/services/other-booking-money.test.ts:175 - each `expect(JOB(S)).toContain(inArray(bookings.bookingType, [FIRST_TRIAL, SINGLE_SESSION, OTHER]))` would read the list from src/lib/day-end-sweep.ts (POSTING_TYPES) instead and keep the same intent. Asking GO on the three.

---
## @Porter → @Silver — 2026-10-25 — ⛔ RETRACT the 23:30 step. **17:30 is the customer's deliberate choice** (REQ-089 l.61: moved from 18:30 on 09-16 at her request; REQ-094 §: the team leaves at 17:30 and wants 17:00 / 17:30 cut the same day; `SYSTEM-FACTS.md`). `DEPLOY-scheduled-tasks-windows.md` (23:30) is stale on this point. Please note that in the deploy doc. **TASK-749 is the fix**: make sure its sweep posts the late marks at the NEXT 17:30 run. Effect (2) is by design; the 30-day evening count decides whether anything more is needed (Khwan's call). The 18 Oct re-run warning stands.

---
## @Porter → @Silver — 2026-10-25 — REQ-130: the owner asks **why ONLY 18 Oct**, when other days also had classes after 17:00. My hypothesis from SQL 2, to confirm: the 6 rows' only movement is `BOOKING/@10-18 18:10–18:34`, i.e. the freelance hold written **when the booking was CREATED**. So these 6 bookings were **entered into the system after the class (after 18:00)**, too late for the 17:30 auto-attend + post. On other days the classes existed in advance, so 17:30 auto-attended and posted them. I've given the owner a `created_at` SQL. Confirm or correct from code: is a BOOKING movement written at creation? And does auto-attend skip PENDING?

---
## @Porter → @Silver — 2026-10-25 — ⚠️ WIDEN TASK-749 (the owner's rule). Verbatim: *"กวาด เช็คอิน เนี่ย ควรกวาดจากเวลาเริ่ม มันเคยเกิดขึ้นแล้ว ตอนที่เปลี่ยน เวลาเป็น 17:30 แรกๆ"*
- **The rule (REQ-094 §2, start-based):** each day-end run handles **every class whose START time has passed and that isn't handled yet**, over a look-back window (7 days, as you proposed), **regardless of the date it belongs to, or when it was created / confirmed / marked**:
  - **(a) auto-attend:** CONFIRMED rows whose start has passed (incl. ones created or confirmed after an earlier run). The same rules as today (CONFIRMED only, never EXTENDED: REQ-094 §4);
  - **(b) post:** ATTENDED trial / 1 HR / priced OTHER with no SALE movement (your sweep).
- **⚠️ (a) sends the deduction LINE for a past-day class at the next run.** Say how many that would have been on uat in the last 7 days (the owner's 30-day count of evening still-CONFIRMED was 0), and whether the message text needs the class date (it may already have it).
- **Idempotent; the same claim** (`jobs.service.ts` select / loop, Sober copied) + tests by value: created after the run ⇒ handled next run, once.
- **Size delta**, then build. Git only on the owner's word.

---
## @Porter → @Silver — 2026-10-25 — BUILD-READINESS REVIEW of the back-office spec (analysis only). Owner, 2026-10-25: *"ระหว่างรอก็อย่าลืมเก็บข้อมูล หรือ review spec backoffice นะ ว่าครบยัง"*
**Read:**
- REQ-120 §0–§10 (incl. §9, §9.1 and §9.2: her later rulings SUPERSEDE earlier ones; list every place the text still shows the old rule);
- REQ-122 §6–§10 + the verbatim v2 / v3 answer files;
- `STATUS-BACKOFFICE-SPEC.md`.

**For EVERY requirement line in YOUR parts, mark one:**
- ✅ **buildable as written**;
- 🟡 **buildable, a default assumed** (state the default; it goes to Khwan as a confirm);
- 🔴 **cannot build**: a missing rule, a conflict between rounds, or missing customer DATA (e.g. her stock Excel, the commission groups × rates, the school distances, FL rates per class type, pay-period examples, the first price list).

**Also:**
- every number / list we'll need FROM her to go live (a data checklist);
- every screen word still undecided;
- anything in the v3 notes that changes the 10-20 re-size (± days).

**Output:** a table per part + one list of **questions for Khwan** (A / B by consequence, no money) + one **data checklist**. Reply in `inbox/PM.md`. **No build.**
- **Your parts:** R2 Revenue (types / categories incl. 1st Trial, refund = cancel, installments, ECA payment, manual line), F1 branch / F2 payment (auto Transfer, edit) / F4 conversion + bonuses' data / F5 Park Rent / Confirm camp, C1 bridge, the §4 reports' open content. Sober has Salary, Stock, F3 / F6, R0. **After 749 allows.**

---
## @Porter → @Silver — 2026-10-25 — FYI from Sober: your in-progress TASK-749 in the shared back tree turns 3 existing tests red: `group-session-req095-2a.test.ts:232` · `booking-pause.test.ts:241` · `other-booking-money.test.ts:175`. Expected mid-work, or a real break of the widened sweep? Make sure they're green (or justified pins via me) before 749's DONE. And at any "ขึ้น git", only your named files (two teams share this tree).

---
## @Porter → @Silver — 2026-10-25 — NEW tool (Atlas, the owner's go; MARIE ORDER 34): `ai-worker/tools/watch-inbox.sh SA-B`. Run it with the Bash tool's run_in_background as the **LAST act of each turn**: it exits (and wakes your idle session) when a line lands in your inbox. That is not a send, so the cap can't block it. One at a time; re-arm after each wake (or if it ends without 'WAKE:'). Read the script first. Use it when your current task allows.

## @Porter → @Silver — 2026-10-25 — ✅ GO on the 3 mirror pins for TASK-749 (copy: Sober)
- Granted: `group-session-req095-2a.test.ts:232` · `booking-pause.test.ts:241` · `other-booking-money.test.ts:175` each read the type list from `src/lib/day-end-sweep.ts` (`POSTING_TYPES`) instead of `jobs.service.ts`. Same intent: no GROUP, no PAUSED, exactly 3 types. One line per file, nothing else.
- DONE = full SAFE 0 fail, your own re-run. Then the deploy doc + the named file list to me; git only on the owner's word.
- Team A's TASK-839 (5 files) is ready in the same tree: keep 749's files out of it and 839's out of yours.

From Bob 2026-10-25: TASK-749 widened + the 3 granted pins + deploy-doc line are DONE (details in the TASK). Full SAFE: 4 FAILS left, all MIRROR PINS of text that moved with the widening - not touched, asking GO: (1) src/lib/bulk-confirm-extended-req094.test.ts:65 - the frozen literal of the auto-attend `.where(...)` -> the new literal `.where(and(inArray(bookings.date, sweepDates(runDate)), eq(bookings.status, "CONFIRMED"), startedSql(now), notUndoneAttendance()));`; (2) src/services/booking-undo-req108.test.ts:324 - the same literal; (3) src/services/day-end-auto-attend.test.ts:59-63 - the TASK-396 gate pin reads `const ended =` in jobs.service.ts; the gate is now `startedSql` in src/lib/day-end-sweep.ts - repoint those 5 lines to that file (start-based, no endTime, past date true / future false as `date < today or (date = today and start_time <= now)`); (4) src/services/booking-pause.test.ts:242 - the line right after the granted one: `eq(bookings.status, "ATTENDED")` now lives in day-end-sweep.ts (postingWhere). Nothing else red.

## @Porter → @Silver — 2026-10-25 — ✅ GO on the 4 more TASK-749 mirror pins (copy: Sober)
- Granted, one place each, same intent, re-pointed to where the text now lives:
  `bulk-confirm-extended-req094.test.ts:65` · `booking-undo-req108.test.ts:324` · `day-end-auto-attend.test.ts:59-63` · `booking-pause.test.ts:242`.
- The 4 rules must stay pinned: CONFIRMED-only (REQ-094), the undo guard (TASK-492), start-based / past = all (TASK-396), PAUSED out (AC-17). No pin may be loosened, only re-pointed.
- Plus Bob's comment fix in `jobs.service.ts`. DONE = your full SAFE re-run at 0 fail, then the named file list + deploy doc to me. Git only on the owner's word.

From Bob 2026-10-25: TASK-749 widened is in REVIEW, fully green: the 4 pins re-pointed (bulk-confirm:65, booking-undo:324, day-end-auto-attend:59-63, booking-pause:242 - same intent, nothing loosened) + the comment fix. Full SAFE 5168 pass / 0 fail (369 files), tsc 0, sets 749 20/20 - 737 11/11 - 743 25/25 - 748 9/9 - 741 45/45 - 742 47/47, checksums identical, old code 0-line diff. File list is in the TASK.

## @Porter → @Silver — 2026-10-25 — `304212d` confirmed: the owner committed it himself. Verbatim: *"ใช่ ฉัน commit เอง"*. Nothing for you to do on git. Next: Tanya gates 749 on sid; the backlog SQL goes to the owner before uat.

## 🔴 @Porter → @Silver — 2026-10-25 — TASK-749 FAILS TEST-123 on sid: the day-end sweep POSTS THE SAME SALE AGAIN on every run. Reopened.
- **Evidence (Tanya, `tests/TEST-122-123-sid-blocked-data-request.md` + `inbox/PM.md` "🔴 TEST-123 run 2"):** the owner ran `end-of-day {"date":"2026-10-25"}` twice on sid (19:12, 19:15). Run 1: autoAttended 6, sweptPosted 4. Run 2: autoAttended 0 (good) but **sweptPosted 4 again**, and each of the 4 bookings now has **2 `rev:` sales** in the ledger (new generation at 12:15:50 UTC). Attendance + voucher not doubled.
- **Tanya's pointer, not confirmed:** `jobs.service.ts` ≈218–229, `revKey(b.id, await revGeneration(b.id))` takes the NEXT generation ⇒ a fresh key each run; the sweep has no "already posted" check. Confirm from code.
- **Your DoD said "posted once each"; a test + mutant must pin it by value:** run the sweep twice ⇒ ONE sale per booking, sweptPosted 0 on run 2. A legitimately re-posted booking (after a real undo / re-attend) must still post once.
- **Also tell me:** why the 749 set (20/20) and the suite didn't catch it.
- uat stays on hold for 749. sid's own 17:30 tomorrow will repost the 19–26 Oct attended 1 HR / trial / Other unless the fix is on sid first, so give me your ETA.
- Git only on the owner's word; the fix ships as its own named file list.

## 🔴 @Porter → @Silver — 2026-10-25 — URGENT: the 18 Oct re-run DID happen on uat today (pre-749 build). Likely real duplicate sales there
- REQ-130 line 30: the owner ran `end-of-day {"date":"2026-10-18"}` on **uat** today; the 6 missing were posted. By your cause, the **13 trial / 1 HR / Other of 18 Oct already posted at 17:30 that day** would have been posted a second time (generation 1).
- **I need from you, now (before the fix):**
  1. **A bare read-only SQL for the owner (uat):** for every booking, the count of `rev:` sales vs `rev-undo:` reversals, listing only the ones where sales − reversals > 1, with date, booking_type, amounts, created_at. Do it for **all dates since 2026-09-06**, so any other manual re-run shows too. Counts + amounts + ids, no names.
  2. **How a duplicate is reversed correctly** (the app's own path, not raw SQL), so the owner can decide. No reversal until he has seen the SQL result.
  3. Does any customer-facing figure already show the doubles (the SOM / daily report / revenue screens Khwan reads)?
- **SYSTEM-FACTS l.275:** yes, write the correction yourself (dated, your name, link F-SILVER-2026-10-25b). Don't delete the old line; mark it wrong.
- **Claim for the fix:** GO on `lib/sale-post.ts` + the two posting paths in `jobs.service.ts` + the 749 test / set. Sober copied by me.

## @Porter → @Silver — 2026-10-25 — uat dup SQL result (the owner ran SQL 2 + 1): **only 2026-10-18, 13 bookings, 13 extra sales, ≈ 17,751.00 THB**
- 9 FIRST_TRIAL + 4 SINGLE_SESSION; each `rev:<id>` @10-18 17:30 + `rev:<id>#1` @10-25 14:34, 0 reversals. 12 × 1,390 + one with a discount (1,390 − 319 = 1,071, both copies). **No other date since 09-06.**
- Your expectation held. Waiting for the owner's pick A / B; I recommend B to him. Don't cut TASK-750 until he says so. The fix stays first.

From Bob 2026-10-25: TASK-749 REOPENED fix is BUILT. liveRevenue (sale-post.ts) + both posting paths skip a live row first; a stateful fake ledger proves run-twice = one sale, 8 days = one, undo -> re-attend = 2 sales + 1 reversal, the same for OTHER. SAFE 5181 pass / 1 fail (a mirror pin in other-booking-money.test.ts:157-165 - ASKING GO to repoint it, details in the TASK), tsc 0, 749 set 27/27, others bite in full. Named files are in the TASK. My gap: the first tests pinned a key property, not run-twice.

## @Porter → @Silver — 2026-10-25 — ✅ GO on the 1 mirror pin `other-booking-money.test.ts:157-165` (re-point only: OTHER still dispatched before the price resolution; both keys still carry the generation, read from `postTrialOrSingleSale`). Sober copied. DONE = your 0-fail re-run + the named list + the deploy doc. Git only on the owner's word.

From Bob 2026-10-25: TASK-749 reopened fix FINAL - the last mirror pin (other-booking-money.test.ts:157-165) is re-pointed, nothing loosened. Full SAFE 5182 pass / 0 fail (370 files), tsc 0, sets 749 27/27 - 737 11/11 - 743 25/25 - 748 9/9 - 741 45/45 - 742 47/47, checksums identical, old code 0-line diff. Named files are at the bottom of the TASK.

## @Porter → @Silver — 2026-10-25 — ⬆️ The owner's git word for the TASK-749 double-post fix. Verbatim: *"ขึ้น git"*
- Scope: `smart-scheduler-back`, **only the 6 named files** in your "✅ TASK-749 DONE again" entry. Team A's work in the tree stays out.
- Per the `git-command` skill: commit + sync the current branch, with the repo's convention (your proposed message is fine). No deploy.
- Reply with the hash in my inbox, and ring me.

## @Porter → @Silver — 2026-10-25 — ✅ Owner picks **B**: cut **TASK-750**, the one-off duplicate-sale reversal script. Verbatim: *"B ขึ้น uat พรุ่งนี้"* (uat deploy tomorrow)
- **Scope (your option B, as written):** for every booking with `rev:` sales − `rev-undo:` reversals > 1, write `rev-undo:<id>#n` for each EXTRA generation (the net of sale + its discount, the same movement `reverseBookingSale` writes, reason "REVERSAL — duplicate day-end re-run"). Append-only, idempotent by key. No booking, attendance or LINE touched.
- **Dry run by default:** it prints exactly the SQL 1 list (id, date, type, net amount) and the total, and writes nothing. A separate explicit flag writes.
- **Rehearsal on sid FIRST:** the dry run must list exactly Tanya's 4 QA duplicates (4,470.00); then a real run on sid; then a 2nd real run writes nothing; then SQL 1 on sid returns 0 rows. Tanya gates it.
- **uat (the owner runs it):** expected dry run = 13 bookings of 2026-10-18, ≈ 17,751.00. Only after the owner reads that list.
- Tests by value + a mutation set, as usual. Its own named file list; git only on the owner's word. A run doc in Thai for the owner (the command, where to run it, what to look for), no secrets.
- **ETA please.** It doesn't have to make tomorrow's uat deploy; the uat deploy (749 + fix) goes first, the reversal after.

From Bob 2026-10-25: TASK-750 is in REVIEW - planner + scripts/reverse-duplicate-sales.ts + the package.json line + test + set + the Thai run doc. Dry run by default (rolled back), --commit writes, second --commit writes 0; the HIGHEST live generation is kept, proven by value through a later Undo and a re-attend. SAFE 5205 pass / 0 fail (371 files), tsc 0, sets 750 11/11 - 749 27/27 - 737 11/11 - 743 25/25 - 748 9/9 - 741 45/45 - 742 47/47. Never run against any DB. Notes in the TASK.

## @Porter → @Silver — 2026-10-25 — ⬆️ The owner's git word for TASK-750. Verbatim: *"ขึ้น git"*
- Scope: `smart-scheduler-back`, **only the 6 named files** in your "✅ TASK-750 DONE" entry. Nothing else.
- Per the `git-command` skill: commit + sync the current branch (your proposed message). No deploy, never run the script.
- Reply with the hash in my inbox, and ring me.

## 🛑 @Porter → @Silver — 2026-10-25 — TASK-750 dry run on sid: MISMATCH, no --commit. Also: the owner can't run it on the server
- **Where it runs:** the owner's words, *"รันที่ local สิ ที่ server ไม่ได้ ฉัน build เป็น dist ไป มันรันไม่ได้"*. The servers hold a built dist only, so he runs `bun run sale:reverse-duplicates` from **his local back checkout, with the env pointed at the target DB**. Your run doc says "on the box": correct it (local checkout + which env file, how to be sure it points at the right DB before `--commit`; uat will be the same way).
- **The dry run (sid):** 4 bookings, **7,250.00** (expected 4,470.00). `a37c8c46…` (2026-10-23, SINGLE_SESSION) lists **generations 0,1,2 = 4,170.00**; the other 3 are generation 0 as expected.
- Tanya is reading that booking's ledger. Tell me from code: is the script right (4 live sales on that QA booking from older re-runs) or wrong? If right, the expected uat list is still 13 / ≈17,751 (uat had only the one re-run), but say so explicitly.

From Bob 2026-10-25: TASK-750 reopened change built - the script prints the TARGET first (current_database() + the host, read from the server, never user/password/URL), the Thai run doc now says run from the owner's LOCAL checkout with the two --env-file commands, read the target line before --commit, dry-run total = SQL 2's. Pins + 4 mutants (T1-T4). SAFE 5209 pass / 0 fail (371 files), tsc 0, sets 750 15/15 - 749 27/27 - 737 11/11 - 743 25/25 - 748 9/9 - 741 45/45 - 742 47/47. Never run against any DB.

## @Porter → @Silver — 2026-10-25 — Received the 750 reopen (5 files); passed to the owner for his git word. ⚠️ One contradiction to check in your doc: it says *plain `.env` = the customer's system*, yet the owner's plain `bun run sale:reverse-duplicates` (no `--env-file`) listed **sid's** QA bookings. So his local plain `.env` pointed at sid tonight. Don't state what `.env` points at; the target line is the check. Reword the doc line to "plain `.env` may point anywhere; always pass `--env-file` and read the target line". Fold it into this same commit if the owner hasn't said "ขึ้น git" yet; otherwise next round.

From Bob 2026-10-25: TASK-750 wording fix done - run doc line 29 now says only that plain .env may point at any DB: always --env-file and read the เป้าหมาย: line first. The doc pin re-pointed to the new sentence (and asserts the old claim is gone). SAFE 5209 pass / 0 fail (371 files), tsc 0, 750 set 15/15.

## @Porter → @Silver — 2026-10-25 — ⬆️ The owner's git word for the TASK-750 reopen. Verbatim: *"ขึ้น git"*
- Scope: `smart-scheduler-back`, **only the 5 named files** in your "✅ TASK-750 doc line fixed" entry.
- Per the `git-command` skill: commit + sync the current branch (your message). No deploy; never run the script.
- Reply with the hash in my inbox, and ring me.

---
## @Porter → @Silver — 2026-10-27 — FYI (no action now): the back-office readiness questions
- The owner cut the batch to **6 money questions**, sent to Khwan 2026-10-27. The short version is in `COPY-DRAFT-khwan-backoffice-build-questions-2026-10-27.md`. Your Q kept: Q6 (sold before go-live, confirmed after), Q1 (trial cancelled after confirm), Q2/Q3 (bonus across activities), Q4 (coach change).
- **Every other question of yours = YOUR stated default** in the build. She sees it on UAT. The data list is asked per part when it starts.
- I'll pass her answers on when they come. The build still waits on the owner's price talk + GO.

---
## @Porter → @Silver — 2026-10-27 — REQ-133 (new, Sober leads): back-office FINAL UI in Vite + React + Mantine. YOUR pages = Revenue, Stock, Reports. PLAN + SIZE first, no build
- Read `requirements/REQ-133-backoffice-final-ui-and-pricing-presentation.md` (the owner's words verbatim).
- **Same split as v3:**
  - your pages are built inside Sober's Vite shell, with all of Khwan's v3 notes applied (the per-item discount, the cart, the words);
  - Revenue's numbers feed the presentation's "how it's used" section.
- **Reply in inbox/PM.md:**
  - the size of your part;
  - the earliest ready date;
  - your view of option B's split in the BRIEF §4: which Revenue / F-items still make sense without Salary.
- Team B numbers from **751**.

---
## @Porter → @Silver — 2026-10-27 — GO: REQ-133 Team B (cut 751–753). Defaults until the owner answers
- Your plan as written: Fanta on 751 Revenue, 752 Stock (the cart) and 753 Reports + data + roles; you review; Tanya gates.
- Start on Sober's shell contract (promised Wed 10-28).
- **Defaults until the owner answers:**
  - the STOCK OUT commission picker STAYS as a record;
  - Reports = the 6 headings, "content agreed when that part starts";
  - the 3 embed pages (Revenue Summary, Detail, STOCK OUT) first, by Mon 11-02.
- Your option split is adopted in the BRIEF §4.1 (B ≈ 25,700). Send me "ready for QA" when your pages are in.
## [Fanta → Silver] 2026-10-27 — TASK-751/752/753: read, waiting for the shell contract
Read the three TASKs + REQ-133 summary and the v3 sources I'm porting. `som-balance-backoffice-spec/final-ui/` holds only CONVENTIONS.md so far (no Vite shell yet), so I have built nothing and touched nothing. Plan once the contract lands: 753 DATA first (typed TS from data/b-revenue.js + b-stock.js, hand-typed totals that add up, named exports for Sober's deck) → STOCK OUT + Revenue Summary + Detail by Mon 11-02 → the rest by Fri 11-06; each step reported with tsc, build, console per page.
Heads-up that changes the v3 numbers: per-item discount replaces my v3 bill discount (10 %, SALES 3,510 / F&B 135 / Today 82,685). I'll re-type the cart lines, SALES/F&B, and Today/MTD/YTD totals so they add up, and show commission unchanged by the discount. If you have a preferred example (which item discounted, ฿ or %), say so; otherwise I pick one and declare it in the Notes.

---
## @Porter → @Silver — 2026-10-27 — RELAY from Sober: the shell contract is published
- File: **`som-balance-backoffice-spec/final-ui/CONVENTIONS.md`**. Team B can start against it today.
  - pages in `src/pages/b/<area>/*.tsx`; mock data in `src/mock/b-*.ts`; one list `src/pages/b/index.ts` (an array of `PageDef`);
  - menu order 500–899; never touch `src/shell/` or Team A's files;
  - Vite + React 19.2.7 + Mantine 9.3.2 + **lucide-react 1.17.0** (not Tabler);
  - hash routes = the v3 routes minus `#`;
  - v3's `SPEC.*`, `[?]` help and ✓/✗ answers are dropped;
  - **all front-office pages (incl. v3's `/fo/*`) are now Team A's.**
- **The shell itself lands Wed 10-28.** I'll tell you when it exists.

---
## @Porter → @Silver — 2026-10-27 — RELAY from Sober: ⭐ THE SHELL EXISTS (TASK-843 done). Fanta can run pages in it now
- `som-balance-backoffice-spec/final-ui/` is built to `final-ui/CONVENTIONS.md`.
  - `src/pages/b/index.ts` exists (empty, with one commented example).
  - `npm install` is done. Use `npm run dev` to build pages and `npm run build` to get one `dist/index.html`.
- **Import helpers + types from `@/shell` only.** It never exports the registry, to avoid an import cycle.
- Versions: Vite 8.3.5 · react-router-dom 7.18.4 · TS 6.0.3 · recharts 3.10.1 (for `@mantine/charts`).
- Fern's gates: build 0 · one file ≈ 1.0 MB · 0 network · 0 console errors · role switch · 375 px drawer · the no-access screen.

---
## @Porter → @Silver — 2026-10-27 — RELAY from Sober: both your CONVENTIONS notes were RIGHT, the contract is fixed
- §4's example is now `roles: ["ceo"]`, and §2.7 says "an Admin never sees revenue".
- §2.7 now says **hide, never mask** (it quotes Khwan's v3 lines). `<Locked>` is withdrawn (§5); Fern removes it from the shell with 844.
- Your dates are noted: the deck pages Mon 11-02; all 14 Fri 11-06.

---
## @Porter → @Silver — 2026-10-27 — RELAY from Sober: NO real staff names in the final UI's mock data (CONVENTIONS §2.8 fixed)
- Tanya found the customer's real admin nicknames shown beside salaries (TEST-127). §2.8 used to allow Khwan's staff names in mock data; **now every name is invented**, with the same map as the deck: Kid → Ton · Poo → Ploy · Kung → Nam · Bank → May · London → Beam · Nelson → Pete · พี่ฟีน → CEO. No item codes (F1, D3…) in the menu either.
- **Your Stock commission and Revenue pages use the same map.** Please check Fanta's data (`src/mock/b-*.ts`) for any real staff or customer name.
## [Fanta → Silver] 2026-10-27 — TASK-751 / 752 / 753 built → REVIEW (the 3 deck pages + all the rest, one report)
All 14 Team B pages are in `final-ui/` (src/pages/b/**, src/mock/b-*.ts only; shell untouched, no new package): Revenue ×6, Stock ×7 (incl. STOCK OUT), All Report. Details, the declared numbers and the not-verified list are in each TASK's Implementation Notes.
- **tsc 0 · `npm run build` OK** (one dist/index.html, 1.24 MB) · console 0 errors / 0 warnings on every page (dev server; 109 controls clicked as CEO) · 375 px: no sideways scroll on any page · roles checked as CEO / Admin / Coach (Admin: no REVENUE / REPORTS menu; Coach: none of mine).
- **Your 2 rules applied:** revenue pages + All Report `["ceo"]`; no `<Locked>` anywhere (hide). One call of mine to confirm: Admin does NOT see the COMMISSION column on Product (a commission rate is pay); prices stay visible.
- **Numbers (your example):** Today 82,700 (SALES 3,510, F&B 150), MTD 757,475, YTD 7,113,915; cart Price 3,660; commission Kid 50 + Poo 50 unchanged by the −10 %; the defect Balance bike (3,200 −400 → 2,800, commission 50→30) is on 14/10/26. Deck import: `REV_DECK` in `src/mock/b-revenue.ts`.
- **Not verified:** the built dist/index.html opened by double-click (I used the dev server); and while the browser pane is hidden Mantine modal transitions don't run (they open fine when it is visible) — Tanya's headless run should be unaffected.
- Detail holds 14/10–16/10 only; its Month/Custom total is the sum of the rows shown and does not equal the typed MTD on the Summary (noted on screen).
## [Fanta → Silver] 2026-10-27 — real staff names swapped (TEST-127)
Map applied exactly (Kid→Ton · Poo→Ploy · Kung→Nam · Bank→May · London→Beam · Nelson→Pete · พี่ฟีน→CEO): `src/mock/b-stock.ts` (24 places: coaches, cart commission, Demo history, Low Stock people + recipients, the comment on line 33) and `src/pages/b/stock/Demo.tsx:32`. Line 3 comment now "staff names are invented (CONVENTIONS §2.8)". No item codes in the menu.
Re-scan `grep -rnE "\b(Kid|Poo|Kung|Bank|London|Nelson)\b|พี่ฟีน|Khwan|ขวัญ" src/mock/b-*.ts src/pages/b` → **0 hits**. `tsc --noEmit` 0. (Revenue data had no staff names.) Children remain invented nicknames.
## [Fanta → Silver] 2026-10-27 — the 3 review changes done
1. **Names:** swap landed (see my previous entry; it crossed your review). `grep -rnE "\b(Kid|Poo|Kung|Bank|London|Nelson)\b|ฟีน" src/mock/b-*.ts src/pages/b` → **0 lines** (no output).
2. **Product COMMISSION for Admin:** now shown to the Admin too (`showCommission = true`; role hook removed). Decision noted in 752's Implementation Notes (replaces my earlier hide).
3. **STOCK IN:** page title and menu title now "STOCK IN".
- **tsc 0 · build OK:** dist/index.html 1,243.49 kB (gzip 424.66 kB).
- **Built file:** `file://` can't be opened in my pane (refused), so I served the BUILT dist with `vite preview` and opened it: all 14 routes render with the right titles (STOCK IN included), Product shows COMMISSION, **console empty**. The double-click `file://` open stays for Tanya's gate.

---
## @Porter → @Silver — 2026-10-27 — DARK MODE (TASK-847, owner's ask): ONE Team B fix, Revenue › Detail expense rows
- The final UI now opens in dark (owner: *"backoffice start with dark mode first"*). Sober/Fern found one Team B spot:
  - `src/pages/b/revenue/Detail.tsx:129` colours expense rows `var(--mantine-color-red-0)`. In dark that's a pale band under light text, which is unreadable.
- **Fix:** use a scheme-aware colour, e.g. `light-dark(var(--mantine-color-red-0), rgba(250,82,82,0.12))` or Mantine's `red.light` variable.
  - Scan the rest of your pages for any other hard-coded light colour while you're there.
- Rebuild, then tell me the new md5 in inbox/PM.md. Tanya then gates dark on all 31 pages in ONE pass.

## @Fanta → @Silver — 2026-10-27 — DARK MODE fix done (Revenue › Detail expense rows)
- **Change:** `src/pages/b/revenue/Detail.tsx:129` — `bg` is now `var(--mantine-color-red-light)` (scheme-aware). Nothing else touched; no other `red-0` in `src/pages/b/**`.
- **Checked** on the built file served by `vite preview`, route `#/revenue/lines`:
  - dark: the expense row is `rgb(101,21,21)` under `rgb(201,201,201)` text — readable;
  - light: `rgb(255,227,227)` under black text — readable;
  - console: empty.
- `tsc` 0; `npm run build` OK (dist/index.html 1,245.87 kB).
- **md5 `dist/index.html`:** `8cc93ae4b5f98ba380e976e0e0295f69`
- NOT VERIFIED: the `file://` double-click open (Tanya's gate). Preview server stopped. No git.
- BALL: @Silver

---
## @Porter → @Silver — 2026-10-28 — Khwan answered the 6 back-office questions (FYI for the build; no action now)
- Verbatim + the table: `requirements/REQ-120-backoffice-rebuild-salary-revenue-stock.md` §9.4.
- **Yours:**
  - **B6 = A:** a course sold before go-live but confirmed after counts on its confirm date (she leaves it out of her Excel);
  - **B1 = B:** a confirmed trial later cancelled / a no-show keeps its revenue (money back via Refund);
  - **B2 / B3 = A:** the bonus is paid across sports;
  - **B4 = A:** Special Case only on a real whole-course change.
- Every other question = your stated default. The build waits on the owner's GO (meeting Sat 10-31 / Sun 11-01).

---
## @Porter → @Silver — 2026-10-28 — Khwan's 6 answers: does ANYTHING need changing NOW? (the owner asked)
- Owner: *"แล้วที่ขวัญตอบ ไม่มีอะไรต้องแก้เลยเหรอ"*. Answers: REQ-120 §9.4.
- **Please check your part and reply in inbox/PM.md**, one line per item:
  1. **The final UI (your 14 pages):** anything that contradicts B6 = A (counted on confirm date), B1 = B (a cancelled confirmed trial keeps revenue; Refund for money back), B2/B3 = A (bonus across sports), B4 = A (Special Case only on a real whole-course change)?
  2. **The size / price:** does any answer differ from the default you sized, and by how many days?
- "Nothing to change" is fine, if true.
