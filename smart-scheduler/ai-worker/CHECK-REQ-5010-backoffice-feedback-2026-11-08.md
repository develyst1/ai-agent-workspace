# CHECK-REQ-5010 — พี่ฟีน's 20-item back-office feedback: per item (w) wording/layout · (q) her question · (+) new ask
Source: `requirements/REQ-5010-backoffice-feedback-from-phi-feen-2026-11-08.md` (her words verbatim; split table at its end). Read-only; nothing is built from this until Porter says. File created by Sector 2026-11-08 with one heading per team; each SA writes only under its own.

## Sober (Team A): nav order · 1 colour · 4 · 6 (with B) · 15 · 16 · 17 · 18 · 19 · 20
**Searched (role-sa §4.3 #5):** CUSTOMER-ANSWERS.md (Stock, Stock Demo, Reports, Revenue, Payment method); REQ-120 §1–§3 (R2.3 filters l.100, R3.1 l.103, R3.x commission l.105/112, R3.8 reports l.124), §9.x, **§12 reports-last** (l.256–258); final-ui design (`smart-scheduler-requirement/02-requirements/final-ui/` — bundled HTML + `screenshots-dark/3-stock-out.png`). **Data:** none needed.
**Scope note that sets most sizes:** the current build is the **Salary demo** (SPEC-100/101; shell + pay run/slip). The **Stock block** (items 15–19) and the **Reports page** (item 20) are **not built yet** — Stock/Commission is a later block (SPEC-101 §1: Commission OUT, needs Stock) and Reports are scheduled **last** (REQ-120 §12). So every Stock/Report wording item below is **(w) at zero cost, applied when that block is cut** — none is demo work.

| # | item | kind | answer / what goes into the build | size |
|---|---|---|---|---|
| nav | move **Notifications + Setting** to the bottom of the left nav | (w) | nav order — the shell (Team A, Fern's shell where TASK-866 set `PAGE_RULES` + the menu). Folds into a shell-polish TASK | 0 |
| 1 | main colour **blue → orange** | (w) | one Mantine theme token (`theme.primaryColor`), applies app-wide — not per screen. **One open detail, not blocking:** the exact orange (brand hex). Default = Mantine `orange`; if ฟีน wants a specific brand orange, that hex is a one-line ask in the next customer message | 0 (token); hex = 1 line if he wants a specific orange |
| 4 | Payment details: **Freelance Teaching Pay → Freelance Hour** | (w) | the **display label** for the FL teaching-pay line (SPEC-101 §6). The internal `pay_line_kind` and the computation are unchanged — label only, on the slip / payment-details screen | 0 |
| 6 | Daily Training Report: balance the spacing | (w) | **Team B owns this** — it's Fanta's screen (Silver's row 6 → TASK-862). No separate Team A build; concur it's layout-only | 0 |
| 15a | Product: **Quanity → Unit** | (w) | label — Stock block (not built yet) | 0 |
| 15b | "will there be **moving stock, branch 1 → branch 2**?" | (q) → (+) later | **Not in this build.** Multi-branch is **future** by her own word (QK3, 10-14: *"ตอนนี้มีที่เดียว แต่ต่อไปจะมีอยู่ที่อื่นด้วย"*; Balance is per-branch *"ถ้ามีมากกว่า 1 สาขา"* p.31). The movement model **already has a `moves` type** (REQ-120 R3.8, l.124), so when a 2nd branch opens a transfer action is a small add on existing data. Answer to him: *one branch today, so no move screen yet; the data is ready for it when a 2nd location opens.* | **≈ 1–2 d** as a (+) **when a 2nd branch exists** — moot until then |
| 16 | Import from Excel: **Apply Import → Apply** | (w) | button label — Stock block | 0 |
| 17 | "Stock out **is the sell page**, correct?" | (q) | **Yes** — SALES RECORD = STOCK OUT (CUSTOMER-ANSWERS Stock, 10-19 p.28) | 0 |
| 17a | a **search box** to find the item to sell | (q)/(+) small | The product picker on the sell screen. **Mantine `Select`/`Autocomplete` is searchable by default** → if products are picked via a Select it's already there (w); if it's a plain list, a search filter is ≤0.5 d. FE confirms at build (Stock block) | 0 if via Select, else **≤ 0.5 d** |
| 17b | remove the word **Items** at the top | (w) | layout — Stock block | 0 |
| 17c | "commissions — a box where **Full time** comes up to select?" | (q) | **Yes, planned** (not demo — it's the commission flow, SPEC-101 §1 OUT / Stock block). A sale lets you pick the **coaches earning commission** (REQ-120 R3, l.112 *"coaches earning commission (several → split)"*); the **FT share pools and splits month-end** (CUSTOMER-ANSWERS 10-23: *"FT รวมค่าคอม…หารแบ่งตามครู FT (จ่ายสิ้นเดือน)"*). The selector widget is a build detail inside that block | 0 (already in Stock-block scope) |
| 17d | **Save** at the bottom | (w) | layout — Stock block | 0 |
| 18 | Stock demo: move **Who** to the last column + balance spacing | (w) | column order + layout — Stock block. Fits her existing ask to control column position (*"Bravo ไว้แถวซ้ายสุด และกำหนดตำแหน่งแต่ละที่เองได้"*, 10-19 p.29) | 0 |
| 19 | Stock report: **Filter Type / Product** + **free search** | (+) small | Stock reports exist (REQ-120 R3.8: sales history · balance · movement, over a chosen period). Type/Product filters + free-text search are additions, folded into the **Reports block (last, §12)** | **≈ 0.5–1 d**, inside the Reports block |
| 20a | heading **Reports → Report** (no S) | (w) | label (she earlier called it *"All Report"* 10-25; this updates it). Reports page (last, §12) | 0 |
| 20b | "will **Report Revenue** + **Report Conversion** be added?" | (q) — part **needs him** | The Reports page aggregates reports and is built **last** (REQ-120 §12). But the **confirmed report set is P1** (10-14): *"REPORT STOCK CHECK IN COURSE SALARY STUDENT"* — **Revenue and Conversion reports are NOT in that list.** So a Report page is coming, but *these two specifically* are beyond the agreed set → fold into the Reports-block scope (owner) or confirm with him. **Cross-link:** this is the same "Report Conversion" as Silver's item 9 (Conversion totals/filters/export) | 0 to answer; the two reports are sized when the Reports block is cut |

**Summary for Porter:**
- **(w), zero cost, applied when the block is built:** nav order, colour (1), label (4) — these three are in the **current** build's reach (shell + slip); 15a, 16, 17b, 17d, 18, 20a land in the **Stock/Reports blocks** (not built yet); 6 is **Team B's** (Fanta). Colour has one tiny rider — the exact orange hex, only if he wants a specific one (else Mantine orange).
- **(q) answered from the spec:** 17 (yes, Stock out = sell page), 17c (yes, commission selector is in the Stock-block scope; FT-pool rule set). 15b (not yet — one branch today; ready in the model). **17a** confirmed (searchable picker).
- **(q) that needs him:** **20b** — does the Reports page include *Report Revenue* + *Report Conversion*? They're beyond the P1 confirmed set. One line in the next message, or the owner folds them in.
- **(+) to size (Master Plan §2, 263 ฿/d unless the owner folds in):** 15b branch transfer **≈1–2 d** (only when a 2nd branch exists); 17a search **≤0.5 d** (likely 0 via Mantine Select); 19 stock-report filters+search **≈0.5–1 d** (Reports block). None is demo work.

**Owner ruling applied (2026-11-08, Porter relay — *"แก้แค่ข้อความ หรือ UI นิดหน่อย ทำให้ฟรี … หากเป็นการแก้หลักการ ให้เก็บไปคุย"*):**
- **FOLD IN FREE (all my (w) + 17a):** nav order, colour (1 → orange), item 4 label → **item 4 pinned into SPEC-101 §6** ("Freelance Hour" display label) so link 3 carries it; nav + orange → handed to **Fern** (inbox/FE) to fold into the shell on her next touch. 15a · 16 · 17b · 17d · 18 · 20a + **17a search (small UI → free)** → carried into the **Stock-block** TASKs **when that block is cut** (recorded here; no TASK exists to hold them yet). 6 is Team B's.
- **PARKED (owner → talk with พี่เบส + แนท; do NOT build):** 15b branch→branch transfer; 19 stock-report Type/Product filter + free search; **20b** Report Revenue / Report Conversion (scope beyond the P1 set — a principle/scope change, parked with its Silver-item-9 cross-link).
- **Nothing here is current-demo work.** The in-reach free items (nav, orange, item-4 label) ride the shell/link-3 builds; the rest wait for their blocks.

## Silver (Team B): items 2 · 3 · 5 · 6 · 7 · 9 · 10
**Read:**
- The final UI (`smart-scheduler-requirement/02-requirements/final-ui/SOM-BACK-OFFICE-final-ui.html`; routes `/salary/people`, `/salary/settings`, `/salary/entries`, `/salary/daily`, `/fo/branch`, `/fo/trial-link`, `/fo/no-teacher`).
- REQ-120 §1–§5, CUSTOMER-ANSWERS (Employee, Branch, Park Rent), and the TASKs 862 / 865 / 868.
- No data needed.

**The 2026-11-08 search found no earlier answer** for any (q) below, except where a pointer is given.

| # | item | kind | answer / what goes into the build | size |
|---|---|---|---|---|
| 2 | Employee: "Add employee" → **Add** | (w) | label → TASK-862 (Fanta, the screens carried over) | 0 |
| 2 | Employee: balance the page (it leans right) | (w) | layout → TASK-862 | 0 |
| 2 | **Motorbike → Motorcycle** | (w) | label only, on every screen that shows the vehicle (Employee, Profile, Payment Setting transport box). The stored value stays `motorbike` (TASK-868), so no data change | 0 |
| 3 | Payment Setting: "will each box get an Edit button?" | (q) + part (+) | **Schools: yes.** Distance is editable per R1.2, and TASK-868 has the edit route. **The other boxes:** REQ-120 states those numbers as fixed rules (Extra Hour 350, OT formula, Bonus 50/100, transport 6/3 ฿ per km with minimums 60/40). Our build holds them as constants, shown read-only. Answer to her: *"Schools can be edited. The rates are fixed as agreed; if ฟีน wants to change them himself, that's an add-on."* | add-on (edit for the rate boxes, CEO only, with a history so old slips keep their rate): **≈ 1.5 d** |
| 3 | Use **ฟูลไทม์**, not ฟลูไทม์, in the long Full-time sentence | (w) | spelling → TASK-862. Note: her own 10-23 answer spelled it ฟลูไทม์ (CUSTOMER-ANSWERS l.93), and this supersedes it | 0 |
| 3 | Move **Add school** into the same box as the school list below | (w) | layout → TASK-862 | 0 |
| 5 | Other Income: "a deduction = type a minus sign?" | (q) | **Yes.** R1.2 "Other ±": a minus amount is a deduction, and a reason is required. The engine already stores signed lines (TASK-865 contract) | 0 |
| 5 | "no need to type the ฿ sign, correct?" | (q) | **Yes.** It's a number field; ฿ is only the unit shown beside it | 0 |
| 5 | **OT hours → OT Hour** | (w) | label → TASK-862 | 0 |
| 6 | Daily Training Report: balance the spacing | (w) | layout → TASK-862 (Fanta's screen) | 0 |
| 7 | **Branch for booking → Branch for Booking** | (w) | label (nav title + page heading) | 0 |
| 7 | "Is the example a one-off move? A course's branch is chosen when creating the course / booking the class; a one-off change goes in **Move session** (timetable 3-dot); a whole-course change goes **next to Change teacher**?" | (q) | **Yes. That's how F1 will be built.** The mock shows one booking only. **The branch is stored on every booking** (R2.4, default Bravo). It's picked on Create course / Book class, and every session of the course takes it. **A one-off change** = the Move session dialog. **A whole-course change** = beside Change teacher, applying to that course's remaining sessions (sessions already taught keep their branch, so past revenue doesn't move). *Interpreted* (her own proposal; it changes no rule) | inside F1 (F1's TASK isn't cut yet). If the Master Plan's F1 size covered "branch at booking" only, the whole-course change is **≈ +0.5 d** |
| 9 | Conversion: rename to **Bonus 50 (1st Trial)** / **Bonus 100 (Renew)** | (w) | labels | 0 |
| 9 | A **Total per box + Total All** | (+) | the mock page is a link / pick list, not a report. Totals turn it into the "Report Conversion" that Sober's item 20 names (REQ-120 §4 back-office reports, content to be agreed). **Porter / owner: fold it into §4, or charge it as an add-on** | together with the next two rows: **≈ 1 d** (BB reader + BF filters/totals) |
| 9 | **Period filter** (like the other pages) | (+) | same as above | (in the 1 d) |
| 9 | **Filter by coach** | (+) | same as above | (in the 1 d) |
| 9 | **Export Excel + PDF** | (+) | REQ-120 has export only for Payment Detail (§ l.220). Reuse that export when it's built (it's a later Team B piece, TASK-862 note) | **≈ 1 d** after the Payment Detail export exists |
| 10 | Park Rent: "the **custom** choice works correctly?" | (q) **needs her** | The Park Rent screen has no "Custom" option. Its fields are Type (Rental / Other) · Name · Teacher (No Teacher) · Date · Time · Charge ฿ · Payment Method. **We need her to say which one she means**: the time (we'll allow any start/end, not only the 2 sample slots) or the charge (typed freely per booking; nothing is fixed). One short line in the next customer message. Ties to her open park-fee same-hour question (REQ-120 park fee, Porter's draft 11-08) | 0 for both readings |

**Summary:**
- **(w):** 11 labels / layout, all into TASK-862 (Fanta), except 7's label (F1, front office) and 9's labels (Conversion).
- **(q):** 5 answered from REQ-120 / our design; 1 needs her (item 10 "custom").
- **(+):** 3 sized:
  - Payment Setting editable rates ≈ 1.5 d;
  - Conversion totals + period + coach filter ≈ 1 d;
  - Conversion export ≈ 1 d.
  - Plus F1's whole-course change ≈ 0.5 d, only if F1's plan size doesn't already cover it.
- 263 ฿/d applies per Master Plan §2, unless the owner folds these in.

## Sector (Team C): items 8 · 11 · 12 · 13 · 14
**Searched:** CUSTOMER-ANSWERS.md, for export / Revenue / Refund / camp (the only export answer, 2026-10-23 p.5, is the **Salary Payment Detail** Excel/PDF, not Revenue); REQ-120 §2 R2.5, §8 D3, §9 C-f; the final UI (REQ-133) `pages/b/revenue/{Summary,Detail,Refund,Categories}.tsx` and `pages/a/frontoffice/{Payment,ConfirmCamp}.tsx`; the built BF screens (TASK-859). **Data:** none needed.

| # | page | her words (short) | kind | our answer / plan | size |
|---|---|---|---|---|---|
| 8 | Payment Method (F2, front office) | course price → **Course Fee** | **(w)** | Final UI `Payment.tsx:130` reads "Course price". SPEC-099 slice 2 (F2) uses "Course Fee". | 0 |
| 11 | To Confirm Camp (D3) | "Sold - not confirm yet": remove "Sold" | **(w)** | Final UI `ConfirmCamp.tsx:27` "Sold — not confirmed yet". The build shows **"Not confirmed yet"** (and "Confirmed" after). The D3 TASK carries it. | 0 |
| 12a | Revenue Summary | heading → **"Summary"** | **(w)** | Built screen `RevenueSummary.tsx:72` "Revenue Summary". It changes to "Summary" in the Revenue cut-over/polish TASK. | 0 |
| 12b | Revenue Summary | **export** the data | **(+), small** | Not in REQ-120 R2.5 and not on the agreed Summary screen. The agreed **Detail** screen does have Export (final UI `Detail.tsx:65`); it is in scope, but not yet built (SPEC-098 left it for later). **Proposal:** one export for both pages, Excel = what the page shows (Summary: Today/MTD/YTD by type; Detail: the filtered lines). **Open, for her:** Excel only, or Excel + PDF like Payment Detail? Default Excel only. | **+0.5 d** for Summary over the Detail export (shared code); +0.5 d more if PDF too. **Inferred:** whether Detail export is inside Silver's R2 32.8 d. If it isn't, Detail export ≈ 1 d on top. |
| 13a | Refund | box "Session Cancelled on Sep" → **"Cancelled"** | **(w)** | Final UI `Refund.tsx` session table (the month label + "CANCELLED ON SAVE"). The refund TASK (later) labels it "Cancelled". | 0 |
| 13b | Refund | "Save refund" → **"Save"** | **(w)** | Final UI `Refund.tsx:67`. The refund TASK uses "Save". | 0 |
| 14 | Type and Category | "Add category" → **"Add"** | **(w)** | Built screen `RevenueCategories.tsx:84` (button) and `:144` (dialog title). The button becomes "Add"; the dialog title stays "Add category" unless she says so. | 0 |

**Summary for Porter:** 6 wording items go into the build, no question. 1 new ask (12b, Summary export): about +0.5 d, with one question for her (Excel only, or Excel + PDF). No (q) items in Team C's five.

### Silver: carried after the owner's ruling (2026-11-08: "แก้แค่ข้อความ หรือ UI นิดหน่อย ทำให้ฟรี ทีเหลือ หากเป็นการแก้หลักการ ให้เก็บไปคุย")
- **Items 2 / 3 / 5 / 6 (w)** → `tasks/TASK-862-…` § "REQ-5010 folds" (Fanta, now).
- **Item 7 (w)** "Branch for Booking" and **item 9 (w)** "Bonus 50 (1st Trial)" / "Bonus 100 (Renew)" have no screen TASK yet. **They must be written into the F1 front-office TASK and the Conversion-screen TASK when I cut them.** This line is the reminder.
- **Item 7 (q):** the branch design (pick at Create course / Book class; one-off change in Move session; whole-course change next to Change teacher) is our answer, built inside F1. **The whole-course change is a principle-level piece, so it stays PARKED** unless the F1 plan size already covers it. Decided when F1 is cut.
- **PARKED, not built:** editable rate boxes (item 3); Conversion totals, filters and export (item 9).
- **Still open with her:** item 10, Park Rent "custom".

### Silver → Sector: item 7 hand-over (F1 is Team C's, Porter 2026-11-08 evening)
- **The (w) to carry into Team C's F1 TASK:** the nav title and page heading read **"Branch for Booking"** (capital B).
- **The (q) answer we gave:** see the item 7 row in § Silver.
  - The branch is stored on every booking (R2.4, default Bravo) and picked on Create course / Book class.
  - A one-off change goes in Move session.
  - A whole-course change sits beside Change teacher and applies to the course's remaining sessions; sessions already taught keep their branch.
- **The whole-course piece is PARKED** under the owner's ruling, unless F1's plan size already covers it. That's Sector's call now.
- Team B no longer carries item 7.
