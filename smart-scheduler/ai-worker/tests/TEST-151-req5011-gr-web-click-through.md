# TEST-151: REQ-5011 GR web (the clickable mock site) — click-through per batch
**Status:** B1 + B2 ✅ TEST_PASSED (0 console errors, roles right, Proposed banner on all 7) · 3 Thai-text notes for Porter.
**Source:** Porter's 2026-11-10 01:06 + 01:25 entries in `inbox/QA.md` · REQ-5011.

## B1 (Salary + Notifications) + B2 (7 Proposed pages), 2026-11-10 ~01:45 Bangkok
**Instrument:** the prototype `som-balance-backoffice-spec/final-ui` run locally (`npx vite`, port 5199; mock data, no network writes), headless Chrome 1440 px. Each role set through the switcher's own storage key (`somfinal.role`); the switcher reads "CEO | Admin | Coach". Every link in that role's menu opened in turn; console errors + page errors captured per page. **Build:** the folder as on disk now (not a git repo); Porter: final-ui tsc 0.
| Role | Pages opened | Console / page errors |
|---|---|---|
| CEO | 38 | **0** |
| Admin | 20 | **0** |
| Coach | 2 (My slip · Notification Alert) | **0** |
- **Proposed banner: ✅ on all 7** (CEO: payment-setting, conversion, conversion-export, revenue-export, move-course, stock-report, report-revenue-conversion); the admin's one (stock-report) shows it too. The "ask ขวัญ first" wording is on report-revenue-conversion, as built.
- **Who sees what:** the admin's menu has **no** Pay run, Slip, Daily, Salary report, Payment Setting, Notification Setting or any Revenue page, and the admin's Employee page shows **no ฿ amounts** (the CEO's shows the base salaries). The coach sees **only** My slip (Payment Detail) and Notification Alert.
- **English labels:** every page's labels are English except **3 spots of Thai text** (mock children's names «น้อง…», ขวัญ's name and the ฿ sign excluded; the slip keeps ขวัญ's v3 words by ruling):
  1. **Home (CEO, admin):** the welcome paragraph «ยินดีต้อนรับค่ะ — นี่คือตัวอย่างหน้าจอระบบหลังบ้านของ SOM BALANCE …» is Thai. Likely meant for ขวัญ; Porter's call.
  2. **Payment Setting (CEO):** the Full-time commission sentence «รวมค่าคอมของทั้งเดือน และหารแบ่งตามจำนวนของครูฟูลไทม์ …» is Thai. It's ฟีน's own requested wording (REQ-5010 #3, «ฟูลไทม์»), so probably kept on purpose; Porter's call.
  3. **Stock import (CEO, admin):** the note «สินค้าที่ไม่ได้ถูกเปลี่ยนแปลงจะยังคงข้อมูลเดิม» is a Thai label on an English page — the one that looks like a slip.
- **Limits:** my Thai scan looked at the first 6 Thai-block lines per page (the ฿ sign sits in that block too), so a Thai word deep in a long page could be missed; toasts (Thai by design, per `parts.tsx`) weren't triggered; desktop width only; nothing was clicked inside the pages beyond opening them.
**Test data:** none (local mock).

## B3 (Team C: Revenue 6 pages + All Report), Porter 01:27: ✅ TEST_PASSED — covered by the same run
My run (~01:45) opened the folder as it was after Porter's 01:27 line, so B3 was in it: **CEO** — `#/revenue/summary`, `#/revenue/lines`, `#/revenue/manual`, `#/revenue/refund`, `#/revenue/categories`, `#/revenue/eca-term`, `#/reports/home`; **admin** — `#/reports/home` only (no Revenue page in the admin's menu). **0 console errors** on each; labels English (only ฿, mock children's names and the "Counted on the CONFIRM date" note seen — no Thai label). Not covered yet: Fern's Users/login and Fanta's Stock (to come, per Porter).

## Stock (7 pages) + Users/login (TASK-941), Porter 01:42 — re-run of the whole site, 2026-11-10 ~02:10: ✅ TEST_PASSED · toasts not checked
Same method (local Vite, mock data, 3 roles via `somfinal.role`), the folder as on disk now. **59 pages (CEO 38 · admin 19 · coach 2), 0 console / page errors.**
- **Stock ✅:** Product, STOCK IN, Import from Excel, STOCK OUT, Stock Demo, Low Stock, Stock Report (+ the Proposed "Stock Report filters") — all load for **CEO and admin**, **no Thai label**; coach has no Stock page.
- **Users/login ✅:** "User Setting" (`#/frontoffice/coach-login`, under FRONT OFFICE) opens for the **CEO only** — "Admit a login", the sign-in explanation, the Username · Role · Person · Status · Actions table. **The admin's menu no longer has it** (20 → 19 links since B1, matching the registry's `roles: ["ceo"]`). Role Setting stays on both CEO and admin's menus. No separate login screen exists in the prototype (none in its routes).
- **Thai since B1:** the **Home welcome paragraph and the Stock import note are now English** (both gone from the scan). **Still Thai:** Payment Setting's commission rules block (5 lines: «รวมค่าคอมของทั้งเดือน …», «จ่ายแยกของใครของมัน», «*หากมีครูมากกว่า 1 คน …», «**หากมีส่วนลด …», «***หากจ่ายสด กรอก 0») — the customer's own rule text; if that's one of ขวัญ's kept texts, fine; Porter's call.
- **Not checked:** **Flash's toasts** (they only show after an action; Porter: being fixed now — one click round on them once Sector says done); phone width; inside-page actions.

## Toast spot-check on the built site (Porter 01:52), md5 `87d5cfb34b1b127d9b63418f70d5bf88` ✅ — Revenue / Stock / Proposed toasts all English
**Instrument:** `final-ui/dist/index.html` — md5 checked = **87d5cfb34b1b127d9b63418f70d5bf88** (matches) — served by `vite preview` (port 5198), headless, CEO. On each page every visible button in the page body was pressed once (fresh load each time; if a dialog opened, its last button too), and every toast's text was collected. Mock only.
- **Revenue (6) · Stock (7) · Proposed (7): 31 toasts raised, 0 Thai, 0 page errors** ✅ (e.g. "Revenue added: +… (type …, category …, branch …)", "Moved n × … from … to … (history saved)", "Filters cleared", "New rates saved; they apply from the next pay period (sample)").
- **Note, outside the three areas and not in Porter's "known" list:** the **front-office** pages' toasts are **Thai** — seen live on `#/fo/payment` (3: «บันทึกแล้ว: … (ถ้าไม่ได้แก้ ระบบนับเป็น Transfer ให้เอง)», «บันทึกแล้ว: Payment Method ของคอร์ส … เป็น …», «เพิ่มงวดใหม่แล้ว (ตัวอย่าง): …»), `#/fo/branch` (2: «เปลี่ยนสาขาของการจองนี้เป็น Other แล้ว …», «จองแล้ว: … สาขา Other …»), `#/fo/confirm-camp` (2: «แก้ไขตารางค่ายแล้ว …», «ยืนยันค่ายแล้ว: … ส่งข้อความ CONFIRMED SCHEDULE ทาง LINE …»); in the source also `Conversion.tsx:105` and `ParkRent.tsx:37/40`. The front office (SOM SCHEDULE) is a Thai/English app, so this may be intended; Porter's call.
- **Known and allowed / known for the next build (not re-judged):** the FT-commission block in Thai; the card-7 banner; the front-office SETTING pages.
- **Limits:** one press per button (no typed input), so toasts behind filled-in forms (e.g. a valid ECA save, a valid Refund) weren't raised; their source strings are English (`EcaPayment.tsx:48`, `Refund.tsx:60`). Both preview / dev servers stopped after the run.

## Spot-check on the replacement build md5 `f6744d5e0a30e06785216daa335f51e4` (Porter 01:55; supersedes 87d5cfb3): ✅ TEST_PASSED
**md5 checked:** `final-ui/dist/index.html` = **f6744d5e0a30e06785216daa335f51e4** ✓. Served by `vite preview`, headless, the 3 roles.
- **Pages:** CEO **32**, admin **13**, coach **2** — **0 console / page errors**. **Only Thai on any page: the Payment Setting commission block** (the allowed one) ✓.
- **Card-7 banner now English:** "Proposed: to ask Khwan first. Not in the agreed scope yet. Size not estimated." ✓
- **Front-office SETTING rows hidden:** gone from **both** CEO's and admin's menus — Role Setting, Branch for Booking, Payment Method, Conversion (trial link), Park Rent (no-teacher), To confirm camp. User Setting stays (CEO only) ✓.
- **Toasts:** pressing every visible button on Revenue (6) · Stock (7) · Proposed (7): **all English, 0 Thai** ✓.
- **Note (not a fail by the menu path):** the hidden front-office pages still **open by direct URL** (e.g. `#/fo/payment`), and their toasts are Thai there (the same 12 as on 87d5cfb3). Nobody reaches them from the menu; if the customer gets a URL list, keep those out.
Servers stopped after the run.

## Porter 01:59: the live site + "does a reload undo a Lock?", 2026-11-10 ~02:25
- **Live site `som-gr.develyst.online`: NOT_TESTED.** It answers **401** (HTTP basic auth; the browser gets `ERR_INVALID_AUTH_CREDENTIALS`). I don't sign in with a password, so the live checks (card-7 banner, front-office rows, the Lock reload) wait for a way in that isn't me typing one — e.g. a session / auth card made by whoever holds it, or the owner looking.
- **Same build checked locally instead** (`vite preview` of `dist/index.html`, md5 **f6744d5e…** confirmed on the served bytes):
  - card-7 banner: "Proposed: to ask Khwan first. Not in the agreed scope yet. Size not estimated." ✓
  - menus: CEO 32 links, admin 13, **no front-office SETTING row** in either; User Setting on CEO only ✓; 0 page errors.
  - **🐞 O-151-1 — yes, a reload undoes a Lock.** Pay run before: «Open · Locks automatically on 31/10/26 12:00 · Confirmed · Draft …»; press **Lock** → toast "Period locked", «Locked · Locked on 20/10/26 10:30 · This period is locked — slips cannot be edited …», every slip «Locked»; **reload** → back to «Open … Confirmed · Draft · Draft». The prototype keeps only the role in `localStorage` (`shell/roles.tsx`); every other change lives in page memory. A customer who locks, then refreshes on 17 Nov, will see the lock gone. Whether to keep mock state across reloads (e.g. sessionStorage) or add a "sample: resets on reload" note is the team's call.
Servers stopped.

## Round-1 addendum (Porter 02:28): build md5 `9a5e7307693a5aaff89f8999a16fafc7` — ✅ TEST_PASSED with 1 cosmetic finding
**md5 checked:** `dist/index.html` = **9a5e7307693a5aaff89f8999a16fafc7** ✓; `vite preview`, headless; mock only.
- **Theme:** all **33 CEO pages** render **light** (`data-mantine-color-scheme="light"`, body `rgb(245,247,251)`); Mantine's primary colour is **orange `#fd7e14`** (light and dark). **Dark toggle:** light → dark (`rgb(26,27,30)`) → light again ✓. 0 console / page errors.
- **🐞 O-151-2 (cosmetic, low):** the **active menu item is still blue** (`rgb(34,139,230)` on `rgba(34,139,230,.1)`, Mantine blue), in light and dark — the one leftover of the old theme I found.
- **Pay run Lock → Unlock (CEO):** before Lock: «Open · Locks automatically on 31/10/26 12:00», **no Unlock**, Lock + Run enabled. After Lock: «Locked · Locked on 20/10/26 10:30 · **Proposed: to confirm**», **Unlock shown**, Lock + Run disabled. Unlock → toast "Period unlocked (proposed). Edit or run it, then lock it again.", back to «Open», **Unlock gone, Lock + Run enabled again** (editing resumes). **Lock again** → Locked, Unlock back ✓.
- **Admin / coach:** the Pay run isn't in their menus; by direct URL they get «This role cannot see this page … (Pay run)», **no Unlock** ✓.
- Reminder: as in O-151-1, all of this resets on a page reload (mock state).
Servers stopped.
**Round-1 screenshots** (Porter 02:59 standing rule; build md5 9a5e7307 re-confirmed; mock data only, CEO, 1440 px) in `tests/evidence/gr-round-1/`:
- `01-home-light-orange.png` — Home, light theme.
- `02-home-dark-toggle.png` — the same after the dark toggle.
- `03-payrun-open.png` — Pay run, October 2026 open (Run + Lock enabled, no Unlock).
- `04-payrun-locked-unlock-proposed.png` — after Lock: «Locked», Run/Lock greyed, **Unlock** + **"Proposed: to confirm"** badge, the lock note, toast "Period locked".
- `05-payrun-after-unlock.png` — after Unlock: open again, Run + Lock enabled.
- The screenshots also show **O-151-2**: the selected menu item (and the logo badge) are blue, not orange.

## LIVE site `https://som-gr.develyst.online` (Porter 03:03), 2026-11-10 ~03:10: ✅ — closes the live NOT_TESTED items above
**Instrument:** PokerVault's basic-auth card `openCard(browser, "som-gr")` (the credential stays in picklocker; never read, printed or written by me), headless, 1440 px, mock data. **The live page is round 1: HTTP 200, md5 `9a5e7307693a5aaff89f8999a16fafc7`** (the bytes served, through the card).
- **Card-7 banner (live):** "Proposed: to ask Khwan first. Not in the agreed scope yet. Size not estimated." ✓
- **Front-office SETTING rows (live):** none in the CEO menu (32 links) nor the admin menu (13); User Setting on CEO only ✓.
- **Pay run, Lock then reload (live):** Open → Lock → «Locked · Proposed: to confirm» + Unlock → Unlock → Open → Lock again → Locked → **reload → «Open» again**. So **O-151-1 holds on the live site too**: a reload undoes a Lock (mock state in memory).
- 0 console / page errors on the pages visited (Home, report-revenue-conversion, Pay run; admin Home).
**Round-1 LIVE screenshots** in `tests/evidence/gr-round-1-live/`: `01-home-light-orange.png` · `02-home-dark-toggle.png` · `03-payrun-open.png` · `04-payrun-locked-unlock-proposed.png` · `05-payrun-after-unlock.png` (mock data only; O-151-2's blue menu highlight visible as before).

## GR round 2 LIVE (Porter 03:07), 2026-11-10 ~03:20: ✅ TEST_PASSED — O-151-2 fixed · some blue badges remain (note)
**Instrument:** som-gr basic-auth card (credential stays in picklocker), headless, 1440 px, CEO, mock data. **Live page: HTTP 200, md5 `6ac40756f3e238cd8a47717c2a4e1973`** ✓ (Sober's release 20261109-200651).
- **O-151-2 fixed:** the **active menu item is orange** (`rgb(253,126,20)` on `rgba(253,126,20,.1)`, light and dark); the **logo badge is orange** (screenshot); the **Home welcome banner is light orange** (`rgb(255,232,204)`) ✓.
- **Dark toggle:** light ↔ dark on all 33 CEO pages (`data-mantine-color-scheme` light → dark), 0 console / page errors ✓.
- **Unlock still OK:** Lock → «Locked · Proposed: to confirm» + Unlock → Unlock → «Open», Run enabled again ✓.
- **Note — blue still left (not one of the three Porter named):** a scan of every visible element for Mantine's blue palette finds **37 blue elements on 8 pages**, all *light-variant badges or info boxes*: Pay run status badges "Open" / "Confirmed" (8), Payment Detail "Confirmed" badge + the **"Net total" box background** (`rgb(208,235,255)`) (3), Notification Alert type badges "Transportation" / "Extra Hour" (2), Revenue Summary / Detail type badges "COURSE" … (2 + 8), Stock import info alert "Products that are not in the file…" (6), Proposed Conversion "Total: 7 conversions · 500 ฿" (2), Proposed Move course "Bravo" badges (6). In dark mode the same elements use `rgb(231,245,255)` text. Whether "all orange" includes status/type badges (blue is a common neutral-info colour) is Porter's / Sober's call.
**Round-2 LIVE screenshots for the customer** in `tests/evidence/gr-round-2-live/`: `01-home-light-orange-ceo.png` (Home, light/orange, CEO) · `02-payrun-locked-unlock.png` (Pay run locked, Unlock + "Proposed: to confirm") · `03-payrun-after-unlock-editable.png` (after Unlock: Open, Run enabled). Mock data only.

## GR round 3 LIVE (Porter 20:07), 2026-11-10 ~20:15: ✅ TEST_PASSED
**Instrument:** som-gr basic-auth card (credential stays in picklocker), headless, 1440 px, mock data. **Live page: HTTP 200, md5 `cb7334e73e449dc4d71a28b87fb62e90`** ✓.
- **Brand:** the sidebar's top-left reads **"SOM BACK OFFICE"** only (the next line is the menu's "Home"), for CEO and admin ✓.
- **Admin, Merit nowhere:** "Merit" (any case) appears on **0 of the 15 admin pages** — Home, every menu page, plus `#/salary/entries` (Other Income), `#/salary/people` (Employee: names only), `#/salary/person` by direct URL ✓.
- **CEO, Merit still there:** Employee (`#/salary/people`) has the **Merit column**; Person (`#/salary/person`) shows «Merit · Yes · every 3 months (Nov 2026)» ✓. (Other Income has no Merit for the CEO because that page refuses the CEO by design — Porter 2026-11-09 21:24.)
- 0 console / page errors.
- Not done: opening a Person page *from* the admin's Employee list (its rows have no link for the admin), so Person was checked by direct URL.
**Round-3 LIVE screenshots** in `tests/evidence/gr-round-3-live/`: `01-sidebar-brand.png` (the top-left brand, cropped) · `02-admin-other-income-no-merit.png` · `03-admin-people-no-merit.png`. Mock data only.

## GR round 4 LIVE (Porter 08:20), 2026-11-11 ~08:30: ✅ TEST_PASSED
**Instrument:** som-gr basic-auth card (credential stays in picklocker), headless, 1440 px, mock data; **one page session, no reload** (the switches live in page memory), roles changed through the new **"Viewing as" dropdown**, pages by hash. **Live page: HTTP 200, md5 `949cf32a203c4304caf75566575fa9ca`** ✓.
- **Dropdown:** options **CEO · Admin (Khwan) · Admin (Kung) · Coach** ✓.
- **(1) CEO → User Setting:** columns Username · Role · Person · Status · **Can see Revenue** · Actions. **khwan (Admin) ON · kung (Admin) OFF**; the deactivated admin "mali" OFF; the CEO row reads "Always"; coaches have no switch ✓.
- **(2) Admin (Khwan):** the menu has all **6 Revenue pages** (Summary · Detail · Add Manually · Refund · Type and Category · ECA Payment); Summary opens ✓.
- **(3) Admin (Kung):** **no Revenue** in the menu (13 links); `#/revenue/summary` by hash → «This role cannot see this page … (Summary)» ✓.
- **Flip:** as CEO, Kung's switch OFF → **ON**; back as Admin (Kung) → **all 6 Revenue pages appear** ✓.
- 0 console / page errors. (As with O-151-1, the switch state resets on a page reload — mock.)
**Round-4 LIVE screenshots** in `tests/evidence/gr-round-4-live/`: `01-user-setting-can-see-revenue.png` (CEO, the switches) · `02-revenue-visible-admin-khwan.png` (Revenue Summary as Admin (Khwan)) · `03-menu-admin-kung-no-revenue.png` (Admin (Kung)'s menu, no Revenue). Mock data only.

## GR round 5 LIVE (Porter 19:35; ขวัญ's 11/11 list, PLAN-2026-11-11-gr-round5-split), 2026-11-11 ~19:50: ✅ TEST_PASSED on 13 of 16 + the extras · 3 "balance the rows" points not judged
**Instrument:** som-gr basic-auth card (credential stays in picklocker), headless, 1440 px, CEO, mock data, one page session. **Live page: HTTP 200, md5 `3341cf63e8e97915e7ca5f5e264cfe79`** ✓. 0 console / page errors.
| # | Her point | Seen on the live site |
|---|---|---|
| 1 | NOTIFICATION + SETTING to the bottom, REPORT last | menu: SALARY · REVENUE · STOCK · PROPOSED · **NOTIFICATION · SETTING · REPORT** (last) ✓ |
| 2 | "Pay run" → "Monthly Payment" | menu item + page title **"Monthly Payment"**; slip's "Back to Monthly Payment" ✓ |
| 3 | "REPORTS" → "REPORT" | group label **REPORT** ✓ |
| 4 | Employee: balance the columns | columns Name · Type · Vehicle · Base salary · Merit present — **"balanced" not judged** (visual, no measure) |
| 5 | Payment Detail Other ± | **"Add an Other ±"**, **"Negative = a deduction"**; the two inputs **stacked** (same x 297, y 1398 / 1471); the add block **below** the Other ± lines (y 1323 > 1190–1208) ✓ |
| 6 | Other Income: CEO sees the admin's page | the CEO opens it: OT Hour · **Merit** · Transportation trip · Other ± (Merit = CEO-only, as round 3) ✓ |
| 7 | Daily Training Report: balance the rows | rows render (Coach · Role · Hour · Description · Daily Income + total) — **not judged** (visual) |
| 8 | Salary Report | **"Teaching (HR)"**, **"Payment"**, **"Camp (HR)"**, whole numbers (no .00; 1.5 / 2.5 h where half), **no "Classes"** column (only Total); the Payment table has borders (`data-with-table-border`, cells 1px solid) ✓ |
| 9 | Notification Setting | "Gets" → **"Visible"**; **no "In the web"** ✓ |
| 10 | User Setting | intro paragraph **gone**; **"Revenue Visible"**; **"Action"**; button **"Accept Login"**; its dialog has **no intro text**, label **"Front-office Username"** ✓ |
| 11 | Revenue Summary | **"Apply Filter"**; top box **Type · Unit · Revenue** (e.g. COURSE 4 / 31,000 ฿) ✓ |
| 12 | Second box Category / Unit / Revenue | **"Category / Unit / Revenue"** box with **all 12 categories at once** (ECA · Skateboard · Inline Skate · Voucher · Birthday · Balance Camp · Sales · Rent · Other · 1st Trial · F&B), **Total 16 / 82,700 ฿ = the Type box's total** ✓ |
| 13 | Product | the **picture** field is back ("Upload picture" + PICTURE column); **COMMISSION group is a dropdown** (read-only select, "No commission"); revenue category unchanged ✓ |
| 14 | STOCK OUT | no top "Items" word; the **Product box is searchable** (an editable combobox); **Save is the last button**, at the very bottom ✓ |
| 15 | Stock Demo: balance the rows | rows render — **not judged** (visual) |
| 16 | Conversion | **"Total: 7 (Bonus 500 ฿)"**; columns **Type** / **Amount**; menu **"Bonus (Conversion)" under SALARY, before Other Income**; **no "Proposed" banner** ✓ |
**Extras:**
- **Folding menu groups ✓:** folding SALARY hides its 8 links (32 → 24 visible), unfolding brings them back.
- **Add Demo ✓ end to end:** dialog Item · Location · Qty · Reason → Helmet (demo) at STA, 2, "QA TEST-151 round 5 add demo" → toast "Demo added: 2 × Helmet (demo) at STA", **STA 6 → 8, Total 26 → 28**, history row «Added → STA · 2 · reason».
- **"Revenue Visible" switch** present per admin (round 4's behaviour, re-labelled) ✓.
**Not judged / NOT_TESTED:** #4, #7, #15 "balance the rows/columns" — visual; I have no measure to pass or fail them (the customer's eye); admin/coach views this round (not asked); phone width.
**Round-5 LIVE screenshots for the customer** in `tests/evidence/gr-round-5-live/` (mock data):
- `01-menu-new-order-monthly-payment-bonus-conversion.png` — the menu: new order, Monthly Payment, Bonus (Conversion) (on the Monthly Payment page).
- `01b-menu-stock-group-folded.png` — a folded group.
- `02-revenue-summary-unit-and-category-box.png` + `02b-revenue-category-unit-revenue-box.png` — Revenue Summary with Unit, and the Category / Unit / Revenue box.
- `03-salary-report.png` + `03b-salary-report-payment-grid.png` — Salary Report (Teaching (HR), Payment with grid).
- `04-stock-demo-add-demo.png` — Stock Demo after an Add Demo (the new history row).
- `05-user-setting.png` — User Setting (Revenue Visible, Accept Login).

## GR round 6 LIVE (Porter 03:07; release 20261111-200639; ledger row 27; TASK-936 Part 5), 2026-11-12 ~03:20: ✅ TEST_PASSED · 1 observation
**Instrument:** som-gr basic-auth card (credential stays in picklocker), headless, 1440 px, CEO, mock data. Live page HTTP 200; Payment Setting = `#/salary/settings`. **0 console / page errors.**
| Check (TASK-936 Part 5) | Seen on the live site |
|---|---|
| Commission table: an Edit on each group row | header Group · Rate · Full-time · Part-time · Freelance · STAFF · (empty) — **8 rows, 8 Edit links**, incl. the "No commission" rows ✓ |
| Modal «Edit commission group», prefilled | Animal Helmet → «Animal Helmet» / «40 ฿»; Miller skate → «Miller skate» / «100 ฿» ✓. Fields: Group name · Rate per item · Cancel · Save; **no "Who earns it"** ✓ |
| Empty name or rate → Save disabled | empty name → disabled ✓; empty rate → disabled ✓; both filled → enabled ✓ |
| Save → closes + toast | name «QA round 6 group», rate 150 → dialog closed; toast **«Commission group “QA round 6 group” saved — 150»** ✓ |
| Cancel | closes, 0 dialogs ✓ |
| Untouched | **Add group** button still there; the other cards present; no Thai in the modal or toast ✓ |
- **O-151-6 (for Porter, not a defect by the TASK):** after Save the **table row still shows the old name and rate** (a mock; nothing is stored, as Part 5 says). ขวัญ may read that as "the edit didn't take". Also the toast shows the rate as typed (`150`, no ฿). Whether to say "preview only" in the round note is Porter's call. The real back office has no group-edit route yet (Silver's note in Part 5).
- **NOT_TESTED:** admin/coach views (the page is CEO-only, not asked); phone width.
**Round-6 LIVE screenshot for the customer:** `tests/evidence/gr-round-6-live/commission-group-edit.png` — the Commission table with an Edit on every row and the Edit modal open on «Miller skate» (100 ฿), mock data.

## GR round 6b LIVE (Porter 03:13; release 20261111-201241), 2026-11-12 ~03:30: ✅ TEST_PASSED — O-151-6 fixed · 1 small observation (O-151-7)
Same instrument (som-gr card, headless, 1440 px, CEO, mock). HTTP 200, **0 console / page errors.**
- **O-151-6 fixed ✓:** Edit «Miller skate» (prefill «Miller skate» / «100 ฿») → «Miller skate (new)», `120` → Save → dialog closed, toast «Commission group “Miller skate (new)” saved — 120», and **the row now reads «Miller skate (new) · 120 · Share Equally · Own · Own · —»**. The other 7 rows are unchanged. Re-opening Edit on that row is prefilled with the new values; Cancel leaves them. A **page reload brings back «Miller skate · 100 ฿»** (mock, nothing stored, as Part 5 says).
- **O-151-7 (small, Porter's call):** a rate typed without the unit shows as **«120»** in the table while every other row shows «… ฿» (the prefill carries «100 ฿», so the ฿ only stays if the user keeps it). It is visible in the screenshot. Typing «120 ฿» would show it like the others.
**Screenshot replaced:** `tests/evidence/gr-round-6-live/commission-group-edit.png` — the Commission table after Save, with the updated row «Miller skate (new) · 120» and the saved toast (mock data).

## GR round 6c LIVE (Porter 03:17; release 20261111-201644), 2026-11-12 ~03:40: ✅ TEST_PASSED — O-151-7 fixed
Same instrument (som-gr card, headless, 1440 px, CEO, mock). HTTP 200, **0 console / page errors.**
- **Typed bare ✓:** «Miller skate» → «Miller skate (new)», `120` → the row reads **«120 ฿»**; toast «… saved — 120 ฿»; re-opening Edit is prefilled «120 ฿».
- **Typed with the unit ✓ (no double ฿):** «Royal baby» `60 ฿` → the row reads **«60 ฿»**; toast «… saved — 60 ฿».
- The other rows are unchanged; Add group is still there.
**Screenshot replaced (goes to ขวัญ):** `tests/evidence/gr-round-6-live/commission-group-edit.png` — the whole Commission table after one edit, with «Miller skate (new) · 120 ฿» among the «… ฿» rows, an Edit on every row, and the saved toast (mock data).

## GR round 7 LIVE (Porter 03:41; release 20261111-204103; RULE-2026-11-12-gr-web-alignment; ledger 28), 2026-11-12 ~04:00: ⚠️ TEST_FAILED on 2 Stock pages (rule 6 / rule 1) · PASS on the other 30 · commission-Edit shot retaken
**Instrument:** som-gr card, headless, CEO, mock. Crawled **all 32 menu pages** at 1440 px: computed `text-align` of every `th`/`td`, columns classed numeric when ≥ 60 % of cells are numbers / ฿ / Hr / KM / %, centred text anywhere, inputs sharing a row; then each page at **375 px**. Every flag was then judged on a screenshot (my classifier mis-reads Total rows with fewer cells and label/value tables, so it flagged rows that are in fact right).
**Passes (30 pages):** 0 console / page errors on all 32 · **0 horizontal overflow at 375 px on all 32** · every numeric column and its header compute `right`, text columns `left`, Total rows sit under their column (e.g. Salary Report Teaching (HR): numbers right, Total row aligned — round 5's "no right-aligned column" is gone; Daily, Revenue Detail, Other Income Detail, Payment Setting tables) · Action columns right with an "Action" header (Commission, School Distance, Coach login) · nothing centred except the month label between the ‹ › arrows (a control, not a column) · dialogs stack one field per row at full width with Cancel / Save bottom-right (Edit commission group, Add commission group, Add school, Edit school).
**Defects (Team B files per the RULE's ownership list):**
- **D-151-7a: Stock In: three fields on one row (rule 6).** `#/stock/stock-in`: Product · Quantity · Date side by side (y equal), not one per row. Expected: stacked, full width.
- **D-151-7b: Stock Out: side-by-side form fields (rule 6).** `#/stock/stock-out`: **Student | Other Customer** and **Branch | Payment** share rows. Student / Other Customer may count as an either/or pair (Silver's call); Branch / Payment is not a pair.
- **D-151-7c: Stock Out: Qty and Discount headers left over numeric inputs (rule 1).** Header computes `start`; Price and Action are right. Expected: numeric columns' headers (and inputs) right.
**Observations (Porter's call, not judged as defects):** the date inputs show their value right-aligned (Other Income, Stock In, Revenue Detail filter); rule 1 says dates left, but these are inputs, not columns · filter bars (Revenue Summary / Detail, Proposed Stock report) put 4–5 filters in one row; I read rule 6 as forms, not filter bars · Other Income's Transportation trip: School | Trip on one row (a pair, allowed).
**Commission-Edit screenshot for ขวัญ, retaken:** `tests/evidence/gr-round-6-live/commission-group-edit.png`: the Edit modal on «Miller skate» with **Group name and Rate per item stacked** (both x 516, width 408; y 402 / 479), Cancel / Save bottom-right; Save → row «120 ฿» still works.
**NOT_TESTED:** admin / coach views; other dialogs beyond the four above (Add Manually, Product edit, Add Demo); colours (out of the rule).

## GR round 7b LIVE (Porter 03:52; release 20261111-205156), 2026-11-12 ~04:10: ✅ TEST_PASSED — D-151-7a/b/c fixed · Entries School/Trip stacked
Same instrument (som-gr card, headless, CEO, mock); positions measured, then judged on screenshots. **0 console / page errors; 0 overflow at 375 px** on all three pages.
- **7a Stock In ✓:** Product · Quantity · Date now one per row, each full width (x 297, w 1102); Save bottom-right.
- **7b Stock Out ✓:** Student, Other Customer, Branch, Payment and Remark each on their own row, full width (x 297, w 1102). No form fields share a row.
- **7c Stock Out ✓:** headers `Qty:right · Discount (this item):right · Price:right · Action:right`, Product left; the Qty / Discount inputs' values are right-aligned too (the ฿ / % toggle stays next to them). The commission split table (Item left; Ton / Ploy right) is unchanged.
- **Entries (Other Income) ✓:** the Transportation trip card stacks Person · Date · **School · Trip** one per row. The four cards (OT Hour, Merit, Transportation trip, Other ±) are still side by side as cards, each stacked inside. The Detail table: Date / Person / Description left, Amount right.
- Unchanged observation: the date inputs show their value right-aligned (Stock In Date, Other Income Date). Porter's call, as in round 7.
**Round 7 overall:** all 32 pages now meet the RULE as I measured it, with the observations from round 7 noted.

## GR round 8 LIVE (Porter 2026-11-12; release 20261112-121234; TASK-954 § Review), 2026-11-12: ✅ TEST_PASSED on every Done line · 2 observations
**Instrument:** som-gr card, headless, 1440 px, mock. **Live page md5 `0ba926f4635859c1dfa9d7d2c2fa9a52` = Sober's round-8 build** ✓. The viewer was switched through the real «Viewing as» dropdown (CEO · Admin (Khwan) · Admin (Kung) · Coach). **0 console / page errors.** Every tick I changed was put back (mock state; a reload resets it anyway).
| Check | Seen on the live site |
|---|---|
| CEO · User Setting | headers Username · Role · Person · Status · **Menu Access** · Action; **no «Revenue Visible» switch**. phin (CEO) «All»; kung «11 of 18 menus» + Edit; khwan «17 of 18 menus» + Edit; coaches «—»; the deactivated admin «11 of 18», with Edit greyed out ✓ |
| Modal «Menu access — Kung» | groups SALARY · REVENUE · STOCK · NOTIFICATION · REPORT, with a group checkbox each (half-filled when partly ticked) + **18 pages**; **no PROPOSED**; **none** of Payment Setting / Monthly Payment / Payment Detail / Daily Training Report / Salary Report / User Setting / **Bonus (Conversion)** (Sober's shell change is live) ✓. «Notification Setting» is tickable (Sober: not money) |
| Defaults | Khwan: Home · Employee · Other Income · Summary · Detail · Add Manually · Refund · Type and Category · ECA Payment · Product · STOCK IN · Import from Excel · STOCK OUT · Stock Demo · Low Stock · Stock Report · Stock Report filters · Notification Alert · All Report. **Kung: the same without the 6 REVENUE pages.** Equal to Fern's "before" lists ✓. Coach: Payment Detail · Notification Alert ✓ |
| Untick → gone | CEO unticks STOCK › Product for Kung → toast «Kung: Product off», his cell 11 → **10 of 18**; as Kung the menu has no Product and **`#/stock/products` shows the lock page** ✓. Re-tick → Product is back in his menu and the page opens ✓ |
| Tick → appears | CEO ticks REVENUE › Summary for Kung → **Summary appears in his menu and the page opens** ✓ (then unticked again: 11 of 18) |
| Merit stays CEO-only | as Kung: Other Income has **no Merit card**; Employee has **no Merit column** (Name only) ✓. Control: the CEO sees Merit on Other Income ✓ |
| Never-grantable by URL | as Kung: `#/salary/payrun` and `#/proposed/conversion` → lock page ✓ |
| 375 px | User Setting and the modal: 0 horizontal overflow ✓ |
**Observations (Porter's call, not defects by TASK-954):**
- **O-151-8a, a dead-end shortcut:** with only Summary ticked, Kung's Revenue Summary still shows the header buttons **Detail · Refund · ECA Payment · Add Manually** (and the per-row **View**). Each leads to the lock page. The gate holds, but the admin is offered pages he can't open. Hiding those buttons when the page isn't granted would fix it. Revenue pages are Team C's under the round-7 RULE's ownership list.
- **O-151-8b, the lock page text is per role:** "This role cannot see this page / The Admin role does not see this page (Product)". With per-person menus, another Admin (Khwan) **does** see Product, so the sentence is no longer true. Something like "You don't have access to this page" would fit. Home's welcome text also still says "switch roles (CEO / Admin / Coach)", which is still true for the preview.
**Round-8 LIVE screenshots for the customer** in `tests/evidence/gr-round-8-live/` (mock data):
- `01-user-setting-menu-access.png`: User Setting with «Menu Access» (N of 18 menus + Edit).
- `02-menu-access-modal.png`: the «Menu access — Kung» modal (groups and per-menu ticks).
- `03-admin-product-unticked-no-access.png`: Kung after Product was unticked: gone from the menu, and the lock page on its URL.
**NOT_TESTED:** Khwan's untick/tick (the same code path, tested on Kung) · a group checkbox click (whole group on/off) · the deactivated admin's view (not in «Viewing as»).

## GR round 9 LIVE (Porter 2026-11-12; release 20261112-123023; TASK-955 § Review), 2026-11-12: ✅ TEST_PASSED — O-151-8a and O-151-8b fixed
**Instrument:** som-gr card, headless, 1440 px, mock. **Live md5 `dc7a73dc0e980018b33c9c895ff73bd4` = Sober's round-9 build** ✓. Ticks were made as CEO in User Setting, then the viewer switched to Admin (Kung) through the real «Viewing as» dropdown; hash navigation (the ticks live in memory). **0 console / page errors.** Kung was put back to his default (11 of 18) at the end.
Buttons in `main`, per page, for each viewer (LOCK = the lock page):
| Page | CEO | Kung: Summary only | Kung: + Detail | Kung: + Detail, Product off, Alert off, Notif. Setting on | Kung: all ticked |
|---|---|---|---|---|---|
| Revenue Summary | Detail · Refund · ECA Payment · Add Manually · Apply Filter · View × 8 | **Apply Filter only** ✓ | Detail · Apply Filter · View × 8 ✓ | same ✓ | = CEO ✓ |
| Revenue Detail | Summary · Export · Add Manually · Apply filters | LOCK | Summary · Export · Apply filters (no Add Manually) ✓ | same ✓ | = CEO ✓ |
| Add Manually / Refund / ECA Payment | Summary · (date) · [Cancel] · Save | LOCK | LOCK | LOCK | = CEO ✓ |
| Import from Excel | Export · Add product manually · Choose file · Cancel · Apply import | unchanged (Product open) | unchanged | **no «Add product manually»** ✓ | = CEO ✓ |
| STOCK OUT | Product · Add item · Cancel · Save | unchanged | unchanged | **no «Product» button** ✓ | = CEO ✓ |
| Notification Setting | Notification Alert | LOCK | LOCK | **no buttons** (page opens) ✓ | = CEO ✓ |
- **Cancel stays put without Product ✓:** as Kung with Product unticked, Cancel on STOCK OUT and on Import from Excel stays on its own page; neither lands on the lock page.
- **8b lock text ✓:** «**You don't have access to this page** / Product is not open for this login. The CEO can give access in User Setting. In this preview, switch «Viewing as» at the top to see it.» No role named.
**Round-9 LIVE screenshots for the customer** in `tests/evidence/gr-round-9-live/` (mock data):
- `01-admin-summary-only-no-links.png`: Kung with only Summary of REVENUE ticked. The Summary page has no buttons to Detail / Refund / ECA / Add Manually and no row View.
- `02-lock-page-text.png`: the new lock-page text (Product unticked).
**NOT_TESTED:** Khwan (the same rule, tested on Kung) · "Apply import" with Product unticked (needs a file; Sober read it in code) · phone width this round.

## GR round 10 (TASK-956, ขวัญ's 11-12 approvals) — 2026-11-12 — ⚠️ TEST_FAILED on 1 item (D-151-10a, School Distance) · everything else ✅
**Build:** live `https://som-gr.develyst.online` md5 `207fcd1abad6aa87d713c3ee2ca4b299` = Sober's round-10 build ✓. Headless Chrome with the som-gr card. The viewer was switched through the real «Viewing as» box. Console/page errors: **0** on every run. Mock data only. Scripts: my scratchpad `gr32`–`gr44`.
**Slice C (Flash):**
- **ECA Payment ✓.** The form has one field per row: Status · Payment Date · Mode · VAT % (7) · WHT % (3). **Her example, Price 100 × 10 students × 10 classes, «Amount includes VAT» → Total 10,000 ฿ · Before VAT 9,345.79 · VAT 654.21 · Total incl. VAT 10,000.00 · WHT 280.37 · Net received 9,719.63**, exactly. There is one net line, tagged «Proposed: to confirm».
  - «excludes»: 10,000 → 10,000.00 / 700.00 / 10,700.00 / 300.00 / 10,400.00 ✓.
  - «net after WHT»: 10,000 → 9,615.38 / 673.08 / 10,288.46 / 288.46 / 10,000.00, and the lines add up ✓.
  - **Pending ✓:**
    - Payment Date hides while Pending. Saving gives the toast «saved as Pending … counts as revenue once it is Received», and the total stays at **64,800.00**.
    - Mark received opens a modal with Payment Date and Amount. Save → Received, total **74,145.79** (= 64,800 + 9,345.79) ✓.
    - Received rows have no action. Delete on a Pending row asks «Delete this Pending entry? … cannot be undone». Cancel keeps the row; Delete removes it.
    - Status filter: All 3 · Pending 1 · Received 2 ✓. «Revenue = Before VAT · Proposed: to confirm» sits next to the total ✓.
- **All Report → REVENUE (CEO) ✓.** Box 1 is by Category (Aug–Nov + Total) and box 2 by Type. **Every column's rows add up to its Total Revenue row** (both boxes 1,320,000 / 1,540,000 / 1,610,500 / 1,482,000 / 5,952,500 ฿), with Refund (Expense) under it. The Excel button gives the toast `report-revenue.xlsx`.
- **All Report → CONVERSION ✓.** Columns Coach · 1st Trial (Student) · Open Course (After Trial) · Conversion % · Renewal Course. Every % = Open ÷ Trial, rounded (58/44/38, Total 48) ✓. **All 9 count links open a list whose length = the count** ✓. Month ‹ › and Branch filters are there.
- **Admin (Kung, and Khwan) ✓:** tabs REPORT · STOCK · CHECK IN · COURSE · STUDENT · CONVERSION. **No REVENUE** and no SALARY. CONVERSION shows no ฿ and no Excel button.
- **Exports ✓:**
  - Bonus (Conversion): Excel → `conversion-2026-10-01_2026-10-31.xlsx`, PDF → `.pdf`.
  - Revenue Summary: Excel → `revenue-summary-2026-10-16.xlsx`.
- **PROPOSED menu ✓:** the only `/proposed` links left are «Bonus (Conversion)» (under SALARY) and «Move course to branch».
**Slice B (Fanta):**
- **Payment Setting Edit ✓ on the cards.** There are 18 Edit buttons:
  - Extra Hour rate 350 → 375 → Save → the card shows «375 ฿ per hour», with the toast «Extra Hour saved — applies from the next pay period» ✓.
  - Transportation: Edit → change → Cancel → unchanged ✓.
  - Commission Royal baby 50 → 55 → Save → shows 55 ฿ ✓.
  - Each dialog has one field per row with Cancel/Save bottom-right.
- **Product filter bar ✓:** one bar (Type · Product · Search), the same as slice A.
- 🔴 **D-151-10a (minor; probably older than round 10): School Distance Add and Edit change nothing except the toast.**
  - **Repro:** as the CEO, Payment Setting → School Distance → STA (12 KM) → Edit → type 13 → Save.
    - **Expected:** STA shows 13 KM.
    - **Actual:** toast «Distance of STA changed to 13 km», but the table still says **12 KM**, reopening Edit shows 12, and so does leaving and coming back.
  - **Add school:** typing «QAS» and 7 → Save → toast «School **NIS (18 km)** added …», which is not what was typed, and **no row is added**.
  - Round 7 checked only these dialogs' layout, so this may predate round 10. It sits on the page ขวัญ approved for editing.
**Slice A (Fern) + Product ✓**, as the CEO **and** as Admin (Kung, whose defaults already include all of STOCK). Every list:
- Type has «All» first and offers only the types that list has.
- Type narrows the list: Product 12→3, Low Stock 10→9, Demo 11→7, Report Sales 5→1, Balance 12→3, Movement 8→1.
- Product narrows it further; «All» restores it; Search «zzz» shows «No matching items»; clearing the search restores it.
- On Stock Report the bar works on all 3 tabs, and the Movement tab has «Movement type».
**375 px:** no horizontal overflow on All Report (REVENUE and CONVERSION), ECA, Payment Setting, Stock Report / Low Stock / Demo / Product, Bonus (Conversion), Summary ✓.
**Observations (not defects):**
- **O-151-10a:** Payment Setting edits only one number per card:
  - Extra Hour = the rate only; Weekday > 4th / Weekend > 5th can't be edited;
  - Transportation = per-KM only; Minimum / Trip can't be edited;
  - OT = the multiplier;
  - Bonus = the amount; condition and Pay to can't be edited.
  - ขวัญ asked for «rates, commission rules». Whether the thresholds and minimums count is Porter's to judge.
- **O-151-10b:** the conversion name list for Pete · 1st Trial · Oct has **12 rows but 10 children**: «Nong Phum» and «Nong Baibua» each appear twice, with different dates and activities. The header says «1st Trial (Student)» and «12 students». If the column counts students, it should be 10; if it counts trials, the label is off. The mock only has to be consistent, but ขวัญ may read it.
- Payment Setting's commission notes are still in Thai (as in earlier rounds; not this round's change).
**Round-10 LIVE screenshots** in `tests/evidence/gr-round-10-live/` (mock data, invented names):
- `01-all-report-revenue-ceo.png`: REVENUE, both boxes.
- `02-all-report-conversion-modal.png`: CONVERSION with Pete's 1st Trial list open.
- `03-eca-form-10000-incl-vat.png`: ขวัญ's 10,000 example → 9,345.79 / 654.21 / 10,000.00 / 280.37 / 9,719.63.
- `04-eca-history-after-mark-received.png`: after Mark received; total 74,145.79.
- `05-payment-setting-edit-bonus50.png`: the Edit dialog.
- `06-admin-kung-all-report-conversion.png`: Admin, with no REVENUE tab.
**NOT_TESTED:** Conversion month ‹ › / Branch switching (present, not exercised) · the Apply-import path · Khwan on the Stock bars (same code as Kung).
**Test data:** none persists. GR is in-memory mock, and every change made is gone on reload.

## GR round 10b (TASK-956 § Round 10b) — 2026-11-12 — ✅ PASS: D-151-10a fixed, O-151-10a and O-151-10b done
**Build:** live md5 `e9590dc66e45893ed6444db065012c39` = Sober's round-10b build ✓. Headless, som-gr card, real «Viewing as» box. Console/page errors: **0**. Scripts: my scratchpad `gr45`–`gr47`.
- **D-151-10a ✓ fixed.**
  - STA Edit 12 → 13 → Save: the row shows **13 KM**, the toast says «changed to 13 km», and reopening shows 13.
  - **Add school «QAS» + 7** → a row «QAS 7 KM» appears, with the toast «School QAS (7 km) added».
  - Save is disabled on an empty name, on the duplicate name STA, on KM 0 and on KM −3.
- **O-151-10a ✓, every number is editable**, each dialog one field per row:
  - **Extra Hour:** rate, Weekday and Weekend thresholds. 360 / 3 / 6 → the card reads «360 ฿ per hour · > 3rd HR · > 6th HR», with a toast.
  - **OT:** the multiplier. 1.2 → «Salary ÷ 26 ÷ 8 × 1.20».
  - **Bonus 50 / 100:** Amount, plus Condition and Pay to as selects. Bonus 50 → 60 ฿ with Condition «Renewal Course» shows on the card. Pay to has a single option, «1st Coach», the only value the page shows.
  - **Transportation:** Car and Motorcycle, each with per-KM and Minimum / Trip. Car Min 70 and Motorcycle 4 ฿ show on the card.
  - **Cancel** (Bonus 100 amount set to 999) leaves the card unchanged ✓.
  - Admin Kung and Khwan both still get «You don't have access to this page» ✓.
- **O-151-10b ✓, counts are distinct children.**
  - Pete · Oct · 1st Trial = **10**, and the modal reads «10 students (one row per child)» with 10 rows. Children with 2 trials show both dates and courses in one row.
  - **All 92 non-zero counts** were checked: every month with data (Aug–Nov) × branch (All / Bravo / Other) × coach × column (1st Trial · Open Course · Renewal). On each, count = rows = distinct names; a 0 has no link. Lists hold 54 multi-date rows. There are no suffixed names.
  - The Total row = the sum of the coach rows, and every % = Open ÷ Trial (both 0 off). All = Bravo + Other on the cells I compared. Jun and Jul show no table (no data).
- **Regression ✓:** the ECA 10,000 example still gives 9,345.79 / 654.21 / 10,000.00 / 280.37 / 9,719.63; Status filter 1 / 2 / 3.
**Screenshots** in `tests/evidence/gr-round-10-live/`:
- New: `07-payment-setting-edit-bonus50-10b.png` (Amount + Condition + Pay to) and `08-conversion-pete-oct-trial-10b.png` (10 children, one row each).
- **Removed as out of date:** `02-…conversion-modal.png` (12 rows) and `05-…bonus50.png` (one field).
- Kept: 01, 03, 04, 06.
**NOT_TESTED:** phone width this round; the edit dialogs as Khwan (locked out).
**Test data:** none persists (in-memory mock).

## GR round 11 (TASK-957, ECA tweaks, ขวัญ 22:32) — 2026-11-12 — ✅ PASS · 1 small observation
**Build:** live md5 `6e26e1cc577ec3971cb865b911d25ffd` = Sober's round-11 build ✓. Headless, som-gr card, CEO. Console/page errors: **0**. Scripts: my scratchpad `gr48`–`gr50`. Inputs: Price 100 × Student 10 × Class 10 = 10,000.
- **1 · Default mode ✓.** A new entry opens on «Amount includes VAT». After Save the form resets to «includes VAT» with both ticks on and Term empty.
- **2 · Tick boxes ✓.** VAT ☑ and WHT ☑ by default, each beside its % box.
  - **Both ticked:** ขวัญ's example → **9,345.79 / 654.21 / 10,000.00 / 280.37 / 9,719.63** ✓. Modes offered: excludes · includes · net.
  - **VAT unticked:**
    - The VAT % box is disabled. «includes» is not offered, and the mode switched to «Amount (no VAT)».
    - 10,000 → Before **10,000.00** · VAT **–** · Total **10,000.00** · WHT **300.00** · Net **9,700.00** ✓.
    - With «net after WHT»: Before 10,309.28 · VAT – · WHT 309.28 · Net 10,000.00 (= Amount ÷ 0.97) ✓.
  - **WHT unticked:**
    - «net after WHT» is not offered. includes VAT 10,000 → WHT **–** · Net **10,000.00** ✓.
    - With «net» selected first, unticking WHT switches the mode to «includes VAT» ✓.
  - **Both unticked:** the Mode select shows «Amount (no VAT)», **disabled**; Net = **10,000.00** = Amount ✓.
  - **Saved row:** a VAT-off / WHT-on row (KIS Term QA, Received) shows Before **10,000.00** and Net **9,700.00**. The revenue total rose by 10,000 to 74,800.00 ✓.
- **Mark received ✓:**
  - A Pending entry (STA Term P, includes VAT) saved with Payment Date hidden. Mark received → Save → Received 16/10/26, and the total moved +9,345.79 to 84,145.79.
  - Status filter: Pending 1 · Received 4 · All 5 ✓.
- **3 · Compact layout ✓.**
  - **1280:** the rows are School · Term · Status / Price · Student · Class / Payment Date · Mode (Mode across 2 cells) / VAT ☑ % · WHT ☑ %. Save is bottom-right of the form. **The summary card sits on the right** with Total Amount and the 5 lines, and «Proposed: to confirm» stays on Net received.
  - **While Pending:** Mode · VAT · WHT share row 3, and there is no Payment Date.
  - **375 px:** one column, the summary card **under** the form, and no horizontal overflow (scrollWidth 375) ✓.
- **O-151-11a (minor, not this round's change):** at 375 px the History table's Status badges are cut off («Pend…», «Recei…»), and Term wraps («Term / 3»). The page itself doesn't overflow. Porter's call whether it matters on a phone.
**Screenshots** in `tests/evidence/gr-round-11-live/`:
- `01-eca-1280-form-summary.png`: the 10,000 example, form and summary side by side.
- `02-eca-375.png`: phone width, the summary under the form.
**NOT_TESTED:** Admin Khwan on ECA (the page logic is the same; her access was checked in round 9/10) · Delete (unchanged, passed in round 10).
**Test data:** none persists (in-memory mock).

## GR round 12 (TASK-958, Revenue Summary readable, ขวัญ 22:59 + O-151-11a) — 2026-11-12 — ✅ PASS
**Build:** live md5 `21731a389bf1bd92b5d62ee2d0fa347e` = Sober's round-12 build ✓. Headless, som-gr card, real «Viewing as» box. Console/page errors: **0**. Scripts: my scratchpad `gr51`–`gr52`.
- **Side by side ✓ (Today, MTD and YTD alike).**
  - **1280:** the Type card is at x280, w464 and the Category card beside it at x760, w656.
  - **1024:** they stack, each w720 (= `maw`).
  - **375:** they stack at w343. No page overflow at any width.
- **Numbers ✓.** On every tab, each table's rows add up to its Total, and Type Total = Category Total:
  - Today: 82,700 ฿ (16 units), Refund −5,000;
  - MTD: 757,475 (208), Refund −15,000;
  - YTD: 7,113,915 (2,067), Refund −96,000.
  - Today's values are the same as in my round-10/11 runs, which used the same seed.
- **Row style ✓:** zebra rows. Total Revenue is bold with a top border and tint, and Refund is red under it (seen in `01`). Detail and All Report REVENUE are also striped, with the Total row bold.
- **Type row → Detail ✓.**
  - The 8 Type rows have `tabindex=0`, a chevron and a pointer cursor.
  - Click on COURSE → `#/revenue/lines?type=COURSE`. Enter on a focused «1st Trial» row → `?type=1st Trial`. Both work on all 3 tabs.
  - **Category rows, Total and Refund** have no chevron and no pointer; a click stays on Summary ✓.
- **Admin Kung with only Summary ticked** (ticked by the CEO, then put back to «11 of 18»): no tabindex, no chevron, no pointer. Click and Enter both stay on Summary, with no console error ✓.
- **O-151-11a ✓ fixed:** at 375 px the ECA History badges read «Pending» / «Received» in full, «Term 3» stays on one line, the table scrolls inside its own box, and the page doesn't overflow.
- **Observation (not this round's change):** a Type row clicked on **MTD or YTD** opens Detail on **Day 16/10/26**, not on that period. COURSE is 47 units on MTD, but Detail shows today's lines. This is the same target the old View button had. Porter's call whether ขวัญ will expect the period to carry over.
**Screenshots** in `tests/evidence/gr-round-12-live/`:
- `01-summary-1280-side-by-side.png`
- `02-summary-375.png`
- `03-eca-history-375.png`
**NOT_TESTED:** dark mode tint · Khwan (same rule as Kung).
**Test data:** none persists (in-memory mock). Kung's ticks were restored.

## GR round 13 (TASK-976 A · TASK-978 B · TASK-977 C + Amd 1, ขวัญ Feedback 13/11) — 2026-11-13 — ✅ PASS on items 1–14 · items 15–17 NOT_TESTED live (not in the build) · 3 observations
**Build:** live md5 `15c265e1ce4aff6afe40675a52ce0bb5` = Sober's round-13 build ✓ (release 20261113-085526). Headless Chrome, som-gr card, «Viewing as» CEO (Kung/Khwan only for #14). Console/page errors: **0** on every page. Scripts: my scratchpad `t151/r1`–`r9`.
| # | Item | Result |
|---|---|---|
| 1 | Employee + Monthly Payment: Base Salary / Net Total left, title case | ✅ Employee: Base Salary header L50 %–R64 % (target ≤ 65 %), right-aligned. Monthly Payment: Coach 0–24 %, **Base Salary 24–41 %, Net Total 41–58 %**, both right-aligned. Labels «Base Salary», «Net Total»; Payment Detail reads «Net Total (…)». |
| 2 | Daily: row → detail, Edit pay | ✅ View on Ton (14/10/26) → «Time · Class · Hours · Students: 16:00 Private 1 Hr Emma … Daily Income 300 ฿» + Edit. Edit: Save **disabled with a blank Reason**, enabled once filled. 300 → 400 ฿ → the row shows **«Edited»** and 400 ฿, Total **1,350 → 1,450 ฿**. Pete (Full-time) Edit has **no Daily Income** field (Hours + Reason only). |
| 3 | Daily: Hour column left | ✅ Hour header L32 %–**R42 %** (target ≤ 45 %), right-aligned, next to Role. |
| 4 | Summary: Category rows → Detail; Refund in the Category box | ✅ Category rows have `tabindex=0`. Skateboard → `#/revenue/lines?cat=Skateboard&tab=today|mtd|ytd&branch=All`, and Detail opens on **that tab's period** (Date 16/10/26 · Month Oct 2026 · 01/01/26–16/10/26). Category box ends with **Refund (Expense)** = Type box's on every tab (−5,000 · −15,000 · −96,000). |
| 5 | Add Manually: typed Other | ✅ Type OTHER → categories Shirt · Sock · Bag · **Other (type it)** → a required «Category name». Empty → «Type the category name». «QA Locker fee» 123 ฿ → toast «Revenue added: +123 ฿ (type OTHER, category QA Locker fee, branch Bravo)». The category list and Type and Category page are **unchanged**. |
| 6 | Refund badge | ✅ An unrefunded sale shows **REFUND** before save (no «CANCELLED ON SAVE» anywhere); Save → confirm → **REFUNDED**. |
| 7 | Type and Category: no SPORTS | ✅ no «SPORTS» on the page. |
| 8 | ECA Payment | ✅ New entry defaults to **Pending** (also after re-opening the page). History headers exactly: School · Term · Status · **Net Amount** (Proposed: to confirm) · **Students** · Payment Date · Action, with no Total Amount or Before VAT. **Cancel** STA: confirm needs a reason (blank → «Enter the reason», row unchanged); with a reason the row reads «Cancelled · QA check: wrong term», has no Edit/Cancel, and the total goes **64,800.00 → 28,800.00**. **Edit** RIS prefills (RIS · Term 2 · Received · 18) with «Save changes / Drop changes»; Student 18 → 20 replaces the row (33,280.00 ฿ · 20) and the total follows (32,000.00). 375 px: no overflow. |
| 9 | STOCK IN / STOCK OUT short fields | ✅ STOCK IN: Quantity **240 px**, Date **240 px** (Product full width). STOCK OUT: Student / Other Customer **360 px**, Branch / Payment **240 px**, Remark full width. |
| 10 | Stock Demo: Edit a History row | ✅ «Edit history line» (Item · From · To · Qty · Reason). Qty 2 → 3 + a remark → the row shows the new remark and **«edited»**; the grid follows (Skateboard Bravo 5 → 4, STA 3 → 4, total 13). |
| 11 | Stock Report: no Month | ✅ the control reads **Day · Custom** only. |
| 12 | Notification Setting | ✅ the line «This list is set up by the SOM BALANCE team. To change who receives a notification, ask the team.» (Sober's corrected answer). |
| 13 | User Setting «menu» | ✅ «10 of 17 menu», «16 of 17 menu». |
| 14 | All Report hidden | ✅ not in the menu or on Home as CEO, Admin (Kung) or Admin (Khwan). `#/reports/home` shows Home, the same as any unknown hash (`#/no-such-page`). |
| 15–17 | All Report REVENUE period picker, the two titles, the Conversion note | ⚪ **NOT_TESTED live.** With #14 the page is no longer in the build: the live HTML (= local `dist/index.html`) has none of «Revenue By Category», «Revenue By Type» or the new note. The source has them (`RevenueTab.tsx` l.94 MonthPicker + Branch, l.116 / l.143 titles; `ConversionTab.tsx` l.115 the exact note), but that is a code read. They can be checked when the menu comes back. |
| — | 375 px | ✅ no page overflow on Employee, Monthly Payment, Daily, Summary, STOCK IN, STOCK OUT, Demo. |
**Observations (for Porter, not defects against the TASKs):**
- **O-151-13a:** after a Daily pay edit (300 → 400 ฿), the Description still reads «Private 1 Hr × 300 ฿» next to 400 ฿ (`04`). ขวัญ may read it as a mismatch.
- **O-151-13b:** a manual line (typed «QA Locker fee», and a plain «Shirt» as a control) doesn't appear on Detail, which still shows 14 items for 16/10/26. That is the mock's existing behaviour, not this round's; the typed name is shown only in the toast.
- **O-151-13c:** the ECA **form's** summary card still says «Net received»; only History was renamed (as asked). Porter's call whether she wants both the same.
- (Info) Category → Detail on MTD/YTD lists only the sample's 14–16/10 lines (e.g. Skateboard 80,200 ฿ on MTD vs 22,000 ฿ of lines); the page says so in its own note.
**Screenshots for ขวัญ** in `tests/evidence/gr-round-13-live/`: `01-employee-1280` · `02-monthly-payment-1280` · `03-daily-detail-modal` · `04-daily-after-edit` · `05-summary-1280` (full page) · `06-detail-from-category-mtd` · `07-type-and-category-1280` · `08-add-manually-other-typed` · `13-refund-badge-before-save` · `13b-refund-after-save` · `10-eca-after-cancel-1280` · `11-eca-375` · `12-eca-cancel-blank-reason` · `14-stock-in-1280` · `15-stock-out-1280-bottom` · `16-demo-after-edit-1280` · `21-notification-setting-1280` · `22-user-setting-1280` · `23-stock-report-1280` · 375 px: `17-employee` · `18-monthly-payment` · `19-summary` · `20-demo`. (`09-refund-already-refunded-sale` is a working shot.) Screenshots show the mock's sample children's names, as in earlier rounds.
**NOT_TESTED:** items 15–17 (above) · Admin views of the changed pages other than #14 · dark mode.
**Test data:** none persists (in-memory mock; every edit is gone on reload).

## GR round 13b (TASK-978 Amd 1 · TASK-977 Amd 2) — 2026-11-13 — ✅ PASS: O-151-13a and O-151-13c fixed
**Build:** live md5 `f12833e4e85a4c300d61006e21af736f` = Sober's r13b build ✓ (release 20261113-091125). Headless, som-gr card, CEO. Console/page errors: **0**. Scripts: my scratchpad `t151/b1`–`b2`.
- **O-151-13a ✓ (Daily description follows a pay edit).** Row cell and the detail's Description read the same in each case:
  - 14/10 Ton, Daily Income 300 → 400: «Private 1 Hr × 300 ฿» → **«Private 1 Hr × 400 ฿»**, «Edited», 400 ฿.
  - 10/10 Ton (Part-time, 7 Hr taught), 700 → 755: «Extra Hour 2 Hr × 350 ฿» → **«Extra Hour 2 Hr · 755 ฿»** (755 ÷ 2 isn't whole, so no rate; the 2 paid hours are kept, not the 7 taught).
  - 14/10 May, Hours 5 → 6 only: **«Extra Hour 1 Hr × 350 ฿»**, unchanged (row «Edited», 6 Hr, 350 ฿).
- **O-151-13c ✓ (ECA form card).** The summary card reads **«Net Amount»** with «Proposed: to confirm», value **bold** (700); «Net received» appears nowhere on the page. History still reads «Net Amount» too.
**Screenshots replaced/added** in `tests/evidence/gr-round-13-live/`: `04-daily-after-edit.png` (now «Private 1 Hr × 400 ฿») · `10c-eca-form-net-amount-1280.png` (the form card). `10-eca-after-cancel-1280.png` and `11-eca-375.png` **retaken on 13b** (full page, so the card now reads «Net Amount»; 375 px no overflow). `12` is a dialog close-up and is unaffected.
**Test data:** none persists (in-memory mock).
