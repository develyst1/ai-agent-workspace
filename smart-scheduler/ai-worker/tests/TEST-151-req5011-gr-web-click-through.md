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
