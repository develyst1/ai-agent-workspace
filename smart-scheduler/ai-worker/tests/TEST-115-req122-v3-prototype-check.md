# TEST-115: REQ-122 v3 prototype, page-by-page check against §8 (both roles) + the [?] captures

- **QA:** Tanya
- **Date:** 2026-10-21
- **Brief:** Porter's ▶️ TEST-115 PART B entry in `inbox/QA.md`; REQ-122 §7.1 / §7.4 / §8; REQ-120 §9; Silver's page list (`inbox/PM.md` 10-21, "Team B pages DONE")
- **Part A (Team A's pages)** follows when TASK-832 / 834 land.
- **Evidence:** `project-docs/qa-2026-10-21/test115b/`; the captures are in the spec's `help/`.

---
# PART B: Team B pages (Revenue · Stock · Reports)
**Verdict:**
- **✅ 13 of 14 pages pass every §8 item.** STOCK OUT passes every item but one.
- **❌ 1 (STOCK OUT, the discount): the page shows no ฿ / % choice.**
- **Two notes for the pins** (N1, N2).
- **The single file works alone.**

## 0 · The single file, built and opened alone
- **Build:** `node build/single.mjs` ⇒ `dist/SOM-BACK-OFFICE-v3.html`, **3.83 MB, 40 scripts, 32 images inlined**.
- **Opened from disk, headless:** copied ALONE into an empty folder, with **every network request blocked**.
- **Result:** every page renders and the [?] popups open.
  - The only outside request is Google Fonts (Noto Sans Thai). Blocked, the page falls back to the system font and still reads fine.
  - 0 page errors.
  - The 2 "file not found" in the first run = STOCK OUT's [?] image did not exist yet, so its popup showed "ภาพประกอบกำลังจัดทำ". **It exists now** (below).
- **⚠ The dist was built BEFORE my new captures.** It needs one more `node build/single.mjs` after the pins (746) so the captures are inside it.

## 1 · Captures for the [?] help (1280 × 800, CEO = the most privileged role, light, ⋯ closed, no dialog, the prototype's own example data)
| File (into the spec's `help/`) | KB | Main action in the frame |
|---|---|---|
| `revenue-summary.png` | 71 | Add Manually ✅ |
| `revenue-lines.png` | 96 | Add Manually ✅ |
| `revenue-manual.png` | 53 | Save ✅ |
| `revenue-refund.png` | 70 | Save refund ✅ |
| `revenue-categories.png` | 75 | Add category ✅ |
| `revenue-eca-term.png` | 64 | Save ✅ |
| `stock-products.png` | 93 | Add product ✅ |
| `stock-stock-in.png` | 47 | Save ✅ |
| `stock-import.png` | 70 | Apply import ✅ |
| **`stock-stock-out.png`** (NEW route) | 65 | Save ✅ |
| `stock-demo.png` | 79 | Move A → B ✅ |
| `stock-low-stock.png` | 60 | Save ✅ |
| `stock-reports.png` | 60 | Search ✅ |
| `reports-home.png` | 49 | (no action on the page) |

- **For Silver's 746 pins:** the 14 names above, same naming as v2 (`<route-slug>.png`).
- **Left in `help/` from v2, now unused** (the routes are removed; I did not delete them): `stock-locations.png`, `stock-sales-record.png`.
- **N1 (for the pins):** on STOCK OUT the **Commission box** (the "Coaches who sold" picker + the per-coach amounts) is **below the 800-px frame**. The [?] step about it has nothing to point at in this capture. This is the very control Khwan could not find in v2 (REQ-122 §6). Silver's call: a second capture, or move the box up.

## 2 · Page by page (CEO and admin)
**Shared checks (all 14 pages, both roles), by a text sweep of every page + its [?] popup:**
- **0** of her old words left (52 checked: SALES RECORD, Buyer, Write-off, Products for sale, Receive goods, New sale, New manual line, New ECA term, Every Line, Manual, …);
- **0** dates without the year;
- **0** fee / our-price words (service fee, ค่าบริการ, Develyst, subscription, licence, ต่อเดือน …).
- Every [?] has its feedback (✓ ครบ / ✗ ไม่ครบ).
- **The sidebar:** brand *SOM BALANCE / SOM BACK OFFICE*; menu headings **SALARY · NOTIFICATION · SETTING · REVENUE · STOCK · REPORTS**, ALL CAPS ✅. Removed: `#/stock/locations`, `#/stock/sales-record` ✅.

| Page | Item → result |
|---|---|
| **Revenue Summary** (CEO only) | ✅ title; Today / MTD / YTD; "Today 16/10/26"; rows by Type with **View**; **Total Revenue**; **Refund (Expense)** · ✅ **admin: "This role cannot see this page"**, so the admin sees no revenue |
| **Detail** | ✅ title (was Every Line); **14 ITEMS**; columns Date · Branch · Type · Category · **Description** · Amount · **Method** · Remark; every date 16/10/26; 1st Trial rows typed **1ST TRIAL** with category "1st Trial (Inline Skate)"; **Add Manually** · ✅ admin blocked · ⚪ the header says "14 ITEMS", the total row "(13 items)" (13 revenue lines + 1 refund line; reads fine, just noting) |
| **Add Manually** | ✅ no "New manual line" title; **Type** = the full list incl. **1st Trial**, **no Manual type**; Category; Date; Branch; **Method default = Transfer** · ✅ admin blocked |
| **Refund** | ✅ **Refund Record · From · Record · Period · Sep (Sales) / Oct (Refund)**; Method default Transfer; **Sessions: Attended 6 KEPT · Not attended yet 4 CANCELLED ON SAVE**; the [?] says the families are told on LINE (ruling C-f) · ✅ **question 3 (course status + voucher) in [?]** · ✅ admin blocked |
| **Type and Category** | ✅ title; **Inline Skate**; **Other Course** = BALANCE CAMP BIRTHDAY (under COURSE); **Other Type**; **1st Trial its own type, a category per activity** (8); **EQUIPMENT · PARK**; no Manual · ✅ admin blocked |
| **ECA Payment** | ✅ no "New ECA term" title; **Student · Class / Term · Payment Date · Total Amount · Save · ECA Payment History**; no "Counts as revenue on" · ✅ admin blocked |
| **Product** (CEO + admin) | ✅ title **Product**; **Sales Product**; headers ALL CAPS; **COMMISSION**; **CATEGORY before PRODUCT NAME**; **QUANTITY + LOCATION columns**; **Location filter** (All / Bravo); **Add Location**; the Locations page gone · admin sees the same page (product prices are fine) |
| **Stock In** | ✅ no "Receive goods" title; **Save**; **Bravo**; **Date = a date picker** (`input type=date`), not typing |
| **Import from Excel** | ✅ **Updated Item · New Item Added**; **"Never deleted" in plain words:** *"Products that are not in the file are kept, with their history."* (+ the [?]: no product is deleted) |
| **STOCK OUT** (CEO + admin) | ✅ title **STOCK OUT** (route `#/stock/stock-out`); no "New sale"; **a cart:** 2 lines + **Add item** + Remove; **Student · Other Customer · Price**; **Payment default = Transfer**; **ONE bill discount** (one field, "10 %"); **Commission**: a "Coaches who sold" picker **inside the form** (REQ-122 §6) + an editable amount per coach; **2 questions in [?]** (admin raise/lower; per item / per bill) |
| | ✅ **admin Save:** *"บันทึกแล้ว: ตัดสต็อกแล้ว + บันทึกการขายแล้ว"*, **no revenue** (the CEO's says "+ รายได้ SALES +3,510 ฿ …"); the admin sees only this bill's commission lines, no pay totals |
| | ❌ **F1: the ฿ / % choice is not on the page.** The Discount box is one text field showing "10 %". Typing "300 ฿" or "300" changes nothing (the prototype's numbers are fixed, by design), and no ฿ / % toggle is visible. **Only the [?] text says "฿ หรือ %".** Khwan may read this as "% only". (`stock-stock-out.png`) |
| **Stock Demo** | ✅ **Bravo leftmost**; **Delete · Total · To**; **More → Add Location · Location Order** (the order is settable); "Teaching equipment by site" gone; history dates 16/10/26 |
| **Low Stock** | ✅ **Setting · Alert (Unit) · Balance Stock · Balance · Save**; "Monday 19/10/26" · ✅ **question 4 (Low Stock recipients) in [?]** |
| **Stock reports** | ✅ **Search · Customer** (and the Type wording); **Balance tab = every location, with a Location picker** (All locations / Bravo), the answer to her item 31; "no revenue" in the [?] |
| **Reports** (CEO only) | ✅ six sections each **"LATER · รายละเอียดจะคุยกันอีกครั้ง"** (= agreed later); [?] says so · ✅ admin blocked |

**The 4 questions inside [?]: all 4 present** = Refund (1) + STOCK OUT (2) + Low Stock (1).

## Findings (to Porter only; I don't fix)
| # | Sev | Page | What |
|---|---|---|---|
| F1 | ❌ 🟠 | STOCK OUT | The ruling says **one bill discount ฿ / %**. The page shows one box with "10 %" and no visible ฿ / % choice; only the [?] text mentions ฿. |
| N1 | 🟡 | STOCK OUT capture | The Commission box (the coach picker) is below the 1280 × 800 frame, so its [?] step can't be pinned on this capture. It is the control Khwan missed in v2. |
| N2 | ⚪ | build | The dist predates the new captures. Rebuild after 746. Two unused v2 images remain in `help/` (`stock-locations.png`, `stock-sales-record.png`). |
| N3 | ⚪ | sidebar (Team A's part) | Still shows "F1 · Branch on a booking", "F2 · Payment record" (§7.1: Payment record → **Payment Method**). These are the b-fo pages Team A's 834 replaces. For Part A. |

**Scripts (scratchpad):**
- `t115a.js`: the isolated file + dumps.
- `t115scan.js`: the word / date / fee sweep.
- `t115b.js`: defaults, cart, More, Balance.
- `t115c.js`: discount, admin Save, captures.


---
# PART A: Team A pages (SALARY · NOTIFICATION · SETTING + Home) · 2026-10-21
**Build:** `node build/single.mjs` ⇒ **3,736,541 bytes** (= Sober's), 42 scripts, 33 images. **Copied ALONE into an empty folder, every network request blocked:** 31 pages, 0 page errors, 0 missing local files.

**Verdict: ✅ every §8 item on all 17 Team A pages + Home, for CEO / admin (and Coach where it applies). One 🟡 wording point (A1). 19 captures done.**

## 1 · Captures (1280 × 800, most privileged role, light, ⋯ closed, no dialog), saved over the same `help/<slug>.png` names, so nothing needs re-wiring
| File | KB | Role | Main action in frame |
|---|---|---|---|
| `salary-people.png` | 64 | CEO | Add employee ✅ |
| `salary-person.png` | 72 | CEO | Save profile ✅ |
| `salary-settings.png` | 98 | CEO | Save settings ✅ |
| `salary-payrun.png` | 81 | CEO | Remind the ones in Draft ✅ (+ the month picker) |
| `salary-slip.png` | 73 | CEO | Download PDF ✅ (+ the month picker) |
| `salary-my-slip.png` | 66 | **Coach** | Confirm this slip ✅ |
| `salary-entries.png` | 78 | CEO | Save ✅ (+ the month picker) |
| `salary-daily.png` | 61 | CEO | (Export / date tabs; no primary) |
| `notify-settings.png` | 71 | CEO | (no action) |
| `notify-inbox.png` | 73 | CEO | (Mark all as read) |
| `frontoffice-teacher-roles.png` | 60 | CEO | Save ✅ |
| `frontoffice-coach-login.png` | 59 | CEO | Create User ✅ |
| `fo-branch.png` | 56 | CEO | Save booking ✅ |
| `fo-payment.png` | 72 | CEO | Confirm ✅ |
| `fo-trial-link.png` | 60 | CEO | (Change coach mid-course, in frame) |
| `fo-no-teacher.png` | 62 | CEO | Save booking ✅ |
| `fo-confirm-camp.png` | 50 | CEO | Confirm camp ✅ |
| **extra** `home.png` | 87 | CEO | — (not wired to a [?] yet) |
| **extra** `datefield-open.png` | 78 | CEO | Other Income, the date box focused (shows 20/10/26 + its calendar button). **The calendar itself is the browser's native picker, which a headless screenshot can't show.** For the "เลือกวันที่ในช่อง" pin. Not wired yet. |

For Fern's 835 pins: the 17 names are unchanged; the 2 extras are new files.

## 2 · Page by page
**Shared (every page, every role):**
- **0** of the §7.1 old words (33 checked: People, Pay run, Inbox, Payment record, First coach, Scheduling app, Front office changes, …);
- **0** dates without the year;
- **0** fee / our-price words (the one "ต่อเดือน" hit is the Daily help saying base salary counts per month).
- **Sidebar:** brand **SOM BALANCE / SOM BACK OFFICE**; **SALARY · NOTIFICATION · SETTING** in ALL CAPS; SETTING lists Role Setting · User Setting · F1 · **F2 · Payment Method** · **F4 · Conversion** · F5 · No Teacher · D3 · Confirm camp (Part B's N3 is now fixed).
- **Coach sidebar:** Home · SALARY → **My slip** · NOTIFICATION → Notification Alert (My slip reachable ✅).

| Page | Item → result |
|---|---|
| **Employee** | ✅ title; types FT / PT / FL / STAFF after names (allowed) · ✅ **admin: Base salary = "🔒 CEO ONLY"** · coach blocked |
| **Employee Profile** | ✅ title; **"Freelance hourly rate per class type"**; "Part-time / Freelance keep their own" (spelled out) · ✅ **admin: base salary + rates 🔒** |
| **Payment Setting** (CEO only) | ✅ title; headings **Full-time · Part-time · Freelance · STAFF**; Bonus 50 = the first coach of the Trial only; **Bonus 100 Special Case → "Who get Bonus? 1st Coach · 2nd Coach · Share 50 / 50"**; no 25 / 25 |
| **Monthly Payment (Up to date)** (CEO only) | ✅ title; **month picker** (‹ month · year ›); "Period 30/09/26–30/10/26"; "Confirm by 31/10/26 · before 12:00" |
| **Payment Detail** (CEO only) | ✅ title; **month picker**; every line dated dd/mm/yy |
| **My slip** (Coach) | ✅ reachable; Confirm this slip / Tell an admin; dates dd/mm/yy |
| **Other Income** (CEO + admin) | ✅ title; **month picker**; **Other Income Detail**; date fields show **20/10/26** (dd/mm/yy) · ✅ **admin: "Slip total 🔒 HIDDEN FOR ADMIN"**, sees only the amounts of the items entered (the ruling) |
| **Daily Training Report** (CEO only) | ✅ title; columns **Coach · Role · Hour · Extra · Daily Income**; **"Total · 3 coaches"** (the coach total); [?]: *"นับจากชั่วโมงสอนในตารางเท่านั้น (ไม่มีเวลาเช็คอิน–เอาต์)"* |
| **Notification Setting** (CEO only) | ✅ title; **CEO and Staff · Who · MYSELF - ALWAYS**; *"Everyone always gets all their own items — there is nothing to switch off."* (no opt-out ticks) · 🟡 **A1:** the sub-heading reads **"Coaches (FT / PT)"**; §7.1 asks headings to spell out Full-time / Part-time |
| **Notification Alert** (all 3 roles) | ✅ title; each role sees its own (CEO 6, admin 3 with **no amounts**, coach 3); dates dd/mm/yy |
| **Role Setting** | ✅ title; **"หน้าบ้าน (SOM SCHEDULE)"** on each frame; FT / PT / FL / STAFF; role by day |
| **User Setting** | ✅ title; **หน้าบ้าน (SOM SCHEDULE)**; **Visible · Invisible · My slip · Confirm · Create User · Invitation · After signing in · Individual Information** |
| **F1 · Branch on a booking** | ✅ **หน้าบ้าน (SOM SCHEDULE)**; Branch default Bravo; Date 18/10/26 |
| **F2 · Payment Method** | ✅ title renamed; **หน้าบ้าน (SOM SCHEDULE)** + a BACK OFFICE table; **default Transfer** (front + back); installments; [?] records her answer B |
| **F4 · Conversion** | ✅ title; **Coach: · New Package after 1st Trial · Renew Course · RENEW · 1st Coach : KID 2nd Coach : POO · Special Case**; **"Change coach mid-course" opens "Who get Bonus?" = 1st Coach : Kid · 2nd Coach : Poo · Share : 50 / 50** (`test115a/f4-who-get-bonus.png`); [?]: no 25 / 25 |
| **F5 · No Teacher** | ✅ **หน้าบ้าน (SOM SCHEDULE)**; Teacher = "No Teacher"; **Payment Method default Transfer**; "Sat 18/10/26" |
| **D3 · Confirm camp** | ✅ **หน้าบ้าน (SOM SCHEDULE)**; **"Confirm camp" opens with Payment Method = Transfer**, Date received 16/10/26 (`test115a/d3-confirm-camp-dialog.png`); [?] records her answer B (LINE at Confirm camp) |
| **Home** | ✅ explains the roles; "หน้า My slip ดูได้เมื่อสลับเป็นบทบาท Coach" |

**An admin sees no coach pay and no revenue:**
- 🔒 on every pay figure (Employee, Profile, Other Income's slip total);
- Payment Setting / Monthly Payment / Payment Detail / Daily are CEO-only;
- the admin's Notification Alert has no amounts;
- the Revenue pages are CEO-only (Part B).

## Findings, Part A (to Porter)
| # | Sev | Page | What |
|---|---|---|---|
| A1 | 🟡 | Notification Setting | Sub-heading "Coaches (FT / PT)". §7.1: headings spell out **Full-time / Part-time** (FT / PT only after a name). |

**Still open from Part B** (for Silver, re-captures when he says so): F1 the STOCK OUT ฿ / % discount, N1 the Commission box in the frame, revenue-summary with no toast, and the date pages.

**Scripts:**
- `t115d.js`: the isolated file + dumps.
- `t115ddump.js`: the text dump.
- `t115e.js`: the sweep, dialogs, date field, Coach sidebar, captures.


---
# PART B re-capture (Silver's 7, after 745 fixes + SPEC.dateField) · 2026-10-21
- **Build:** re-built from the current spec folder ⇒ **3,594,199 bytes**, 41 scripts, 35 images (incl. my Part A captures + the 2 extras).
- **How:** opened ALONE, network blocked, **a fresh page load per capture** (so no leftover toast), CEO, light, ⋯ closed. **0 page errors.**
- **The leftover toast on the Part B `revenue-summary.png` was mine:** I saved a STOCK OUT sale in the same page just before capturing. Fixed by the fresh load.

| File (over the same name) | KB | Checks |
|---|---|---|
| `revenue-manual.png` | 55 | date field **16/10/26**, no native `type=date`; no toast |
| `revenue-refund.png` | 70 | date **16/10/26**; no native date; no toast |
| `revenue-eca-term.png` | 65 | date **16/10/26**; no native date; no toast |
| `stock-stock-in.png` | 48 | date **16/10/26**; no native date; no toast |
| `stock-reports.png` | 61 | From **01/10/26** · To **16/10/26**; no native date; no toast |
| `stock-stock-out.png` | 68 | **F1 FIXED:** Discount = a **฿ / %** selector + the amount · **N1 FIXED:** the Commission box ("Coaches who sold" + per-coach amounts) is **top-right, inside 1280 × 800** (top 157 px) |
| `revenue-summary.png` | 71 | **no toast**, "Viewing as" visible |

- **Every date field** on the 5 pages shows **dd/mm/yy**; 0 native date inputs remain.
- The calendar pop-up of `SPEC.dateField` doesn't show in a headless screenshot (as in Part A).
- 🟡 **N4 (small, STOCK OUT):** with the Commission box beside it, the Items table is narrower, and **each line's "Remove" link is cut to "Re"** at 1280 wide (`stock-stock-out.png`). Cosmetic.

**Part B findings now:** F1 ✅ fixed · N1 ✅ fixed · N2 (dist rebuilt; the 2 unused v2 images are still in `help/`) · N3 ✅ fixed (Part A) · **N4 🟡 new**.
**Next for Team B:** Fanta re-checks / adds the pins on these 7 (746), Silver overlays them.
