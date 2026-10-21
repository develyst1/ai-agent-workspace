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
