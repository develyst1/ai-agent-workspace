# TASK-739 — REQ-122: Team B's pages of the CLICKABLE back-office spec (Revenue · Stock · front-office F1/F2/F4/F5 + Confirm camp · Reports) — FE, M (≈ 6 d)
- Source: `requirements/REQ-122-backoffice-clickable-spec-for-the-customer.md` (§1 form, §2 pages, §3 the two in-page questions) · the content is REQ-120 (`requirements/REQ-120-backoffice-rebuild-salary-revenue-stock.md` §2, §3, §4, §5, §8) · Porter GO 2026-10-16
- Status: ✅ DONE (Silver, 2026-10-16) · the LOOK (layout / phone / dark) is for Tanya's 3-role pass + the owner (REQ-122 §4)
- Repo/folder: `som-balance-backoffice-spec` (path in `machine.local.md`; **not git**) · Assignee: @Fanta · From: @Silver (2026-10-16)
- **Claim (yours only):** `pages-b.js` · `pages/b-*/` · `data/b-*.js`. 🚫 **Never edit** `index.html`, `shell/`, `pages-a.js`, `pages/a-*`, `data/a-*` or `CONVENTIONS.md`. **Need a shell change? Tell me** (I relay it to Porter → Sober). 🚫 The `requirement-hub` / `galaxy-spec` skills are banned (owner).

## Read first
1. **`CONVENTIONS.md` (v1, FINAL API)**: all of it. The rules that bite:
   - `SPEC.page` / `SPEC.dialog` / `SPEC.toast` / `SPEC.ask` / `SPEC.locked` / `SPEC.on`;
   - **no dead button** (every `<button>` / `<a>` has `data-go` / `data-dialog` / `data-toast` / `data-close` / `SPEC.on`; never `disabled`);
   - **no `fetch`, no network, no modules**;
   - **NO calculation anywhere**: type every total, and check your addition by eye.
2. The example page `pages/a-example/everything.js` (copy it to start), when Team A has written it.

## The rules of the content
- **A MOCK only** (Porter): fixed example data on ONE global, `window.B_REV` / `window.B_STOCK` / `window.B_FO`; a click shows its EFFECT in a Thai toast and computes nothing.
- **UI labels ENGLISH.** The **side panel `th:` (2–4 lines) and the toasts are THAI**, plain, with no tech words, no "TASK/REQ/SCR", no ids.
  - **Write the `th:` lines and toasts yourself;** I review every one.
- **Names:**
  - staff: Kid, Poo, Kung, Bank, London, พี่ฟีน, Nelson;
  - **children only น้องเอ / น้องบี / น้องซี**;
  - no phone, LINE id or address.
- **Money and dates:** `3,705 ฿` · dates as she writes them (`14/10`, `30/9–30/10`).
- **Ids:** dialogs / asks start with **`b-`**. **Menu order 400–899:** Revenue 400–499 · Stock 500–649 · front office 650–749 · Reports 750–899. **Menu names exactly:** `Revenue` · `Stock` · `Front office changes` · `Reports`.
- **Roles (REQ-120 §0):**
  - **Revenue is CEO-only:** every Revenue page has `roles: ["ceo"]`, so the admin and the coach get the no-access screen (that IS the demo).
  - **Stock:** CEO + admin (the coach gets no-access).
  - **Front office changes:** CEO + admin.
  - **Reports:** CEO.
  - **Inside Stock**, nothing is pay or revenue, except that SALES RECORD's toast mentions revenue. Keep that toast for the CEO; for the admin, say only "ตัดสต็อกแล้ว + บันทึกการขายแล้ว".

## Pages (each one REQ-120 line it must show; routes and orders are mine, change only with a reason)
### Revenue (`menu: "Revenue"`, `roles: ["ceo"]`)
| order | route | must show |
|---|---|---|
| 400 | `#/revenue/summary` | **page 1 = summary BY TYPE** (COURSE · VOUCHER · ECA · SALES · F&B · RENT · OTHER · Manual) for **Today / MTD / YTD** (tabs via `SPEC.on`) + filters **branch (Bravo / Other) · period (day / month / custom) · type · category**; each type row → `data-go` the lines page |
| 410 | `#/revenue/lines` | **every line**: columns **Date · Branch · Type · Category · Product Name · Amount · Payment · Remark**; ~12 example rows covering: course (whole amount at CONFIRM), voucher, trial, **camp (counts on Confirm camp)**, ECA term, Rent, **Park fee (an Other booking, teacher "No Teacher")**, **Birthday (typed by hand)**, SALES / F&B (from SALES RECORD, net of discount), a manual line, **a refund shown as an expense in the refund month** |
| 420 | `#/revenue/manual` | a manual line form: type + category + amount + remark (+ branch + payment) → Save = toast |
| 430 | `#/revenue/refund` | refund = **an expense in the month of the refund**; a note "Pause changes nothing" |
| 440 | `#/revenue/categories` | the type → category tree from her list (REQ-120 §2.1; **Private / Duo / 1 HR under EVERY sport**) + "Add category" |
| 450 | `#/revenue/eca-term` | ECA term setup: school · **price per class × students × classes per term** (a typed total) · **the date the school pays** = when it counts |

### Stock (`menu: "Stock"`, `roles: ["ceo","admin"]`)
| order | route | must show |
|---|---|---|
| 500 | `#/stock/products` | Model code · Product Name · category · **commission group** · price · picture (a placeholder box) · note. Categories: **Miller division (incl. Miller helmets + pads)** · Inlineskate · Bike · **Safety (non-Miller helmets/pads)** · F&B · Other (Shirt, Sock, Bag) + "Add category". Show a Miller helmet row with group **"Miller helmet 40"**, separate from "Animal Helmet 40" (REQ-122 §2 Salary line) |
| 510 | `#/stock/stock-in` | product + **quantity + date**; **no cost price** (say so in `th:`) |
| 520 | `#/stock/import` | Excel import **matched by Model code**: a preview with 3 sections **updated / added / never deleted** (history kept) + Export + Manual add |
| 530 | `#/stock/locations` | locations (one today, can add) + balance per product per location |
| 540 | `#/stock/sales-record` | SALES RECORD: Product · **buyer picked from the system OR typed** · branch · **Discount ฿ or %** · **Payment (Transfer / Cash / Credit card)** · remark · **coaches earning commission (several → split; not reduced by the discount)** → Save toast: **"บันทึกแล้ว: ตัดสต็อก 1 ชิ้น + รายได้ SALES +3,705 ฿"** (CEO) |
| 550 | `#/stock/demo` | Stock Demo **sites matrix** STA · ABC · RIS · WA (Abbey) · KIS · Bravo (+ add a site) with dialogs: **move A→B · sale→Demo · broken sale goods→Demo (reason) · Demo→sale · write-off (reason)** + a history list (who / when / from → to / reason). **No alerts** |
| 560 | `#/stock/low-stock` | Low Stock: **every Monday**, **per location**, thresholds per type editable (**F&B 10 · Safety 1 · Miller 5 · Sock 1 · Shirt 1**); who gets it: **London + พี่ฟีน** (a link to Team A's Notifications page is NOT ours to make; just name them) |
| 570 | `#/stock/reports` | sales history · balance · movement (sales / stock-in / moves) over a chosen period |

### Front office changes (`menu: "Front office changes"`, `roles: ["ceo","admin"]`, use `.screen` frames that look like the front office)
| order | route | must show |
|---|---|---|
| 650 | `#/fo/branch` | **F1:** the booking dialog with a **Branch** field, default **Bravo**, "Other" for future branches |
| 660 | `#/fo/payment` | **F2:** the payment record dialog at confirm / sale: **date received · amount · method (Transfer / Cash / Credit card), REQUIRED** (Save without it = a Thai toast saying it is required) + an **"Installments (optional)"** demo with 2 payments. **`SPEC.ask("b-installment-revenue", …)`**, see below |
| 670 | `#/fo/trial-link` | **F4:** the course card showing **"from Trial of 12/10 (Kid)"** / **"renewal of course …"** + the **first coach**; two coaches on the first class = **"shared 25 / 25"**; coach changed mid-course = **"Admin chooses"** dialog. Note (D6): counts only cases that start after go-live |
| 680 | `#/fo/no-teacher` | **F5:** a Park-fee **Other booking** that charges and blocks the timetable with teacher **"No Teacher"** |
| 690 | `#/fo/confirm-camp` | **D3:** the camp package with a separate **"Confirm camp"** button; the revenue counts on that date; the payment dialog opens from it. **`SPEC.ask("b-camp-line-timing", …)`**, see below |

### Reports (`menu: "Reports"`, `roles: ["ceo"]`)
| 750 | `#/reports/home` | 6 headings **REPORT · STOCK · CHECK IN · COURSE · SALARY · STUDENT**, each marked **"รายละเอียดจะคุยกันอีกครั้ง"** |

## The two in-page questions (REQ-122 §3), text to use (you may smooth the Thai, keep the meaning)
- **`b-camp-line-timing`** (on Confirm camp): q *"ข้อความ "CONFIRMED SCHEDULE" ทาง LINE ถึงผู้ปกครอง ควรส่งตอนไหน?"*
  - A *"ส่งตอนขายแพ็กเกจ (เหมือนตอนนี้)"*. Effect: *"ผู้ปกครองได้ตารางทันที แม้ค่ายยังไม่ได้กด Confirm camp"*.
  - B *"ส่งตอนกด Confirm camp"*. Effect: *"ผู้ปกครองได้ตารางหลังยืนยันแล้วเท่านั้น ถ้าแอดมินยังไม่กด ผู้ปกครองจะยังไม่ได้ข้อความ"*.
- **`b-installment-revenue`** (on the payment page): q *"ถ้าแบ่งจ่ายเป็นงวด รายได้ควรนับอย่างไร?"*
  - A *"นับเต็มจำนวนในวันที่ Confirm"*. Effect: *"ยอดรายได้เดือนนั้นสูงเต็มจำนวน แม้ยังเก็บเงินไม่ครบ"*.
  - B *"นับแต่ละงวดในวันที่ได้รับเงิน"*. Effect: *"ยอดรายได้ตรงกับเงินที่เข้าจริง แต่คอร์สเดียวจะกระจายหลายเดือน"*.

## Definition of Done
- [ ] Every page above is registered from `pages-b.js` (data first), in your own files only.
- [ ] Opened by double-click (once the shell boots): **every Team B page in ALL 3 roles + every `b-` dialog opened ⇒ the console shows NO `dead button` and NO error.** List what you clicked in Implementation Notes.
- [ ] No calculation in code (no `reduce` / sum); totals typed and consistent by eye.
- [ ] Thai `th:` (2–4 lines) on every page; toasts in Thai and stating the effect; labels in English; only the allowed names.
- [ ] Nothing committed (not a git folder anyway). Report to me with the page list; I review every page and its Thai, then the CHECKLIST map goes in.

## Implementation Notes
**Fanta, 2026-10-16.** Folder `som-balance-backoffice-spec` (`H:\scheduler\SOM-BALANCE-Backoffice-spec`). Not git, nothing committed. **Touched only:** `pages-b.js` · `data/b-revenue.js` · `data/b-stock.js` · `data/b-fo.js` · `pages/b-revenue/*` (6) · `pages/b-stock/*` (8) · `pages/b-fo/*` (5) · `pages/b-reports/home.js`. No shell, no Team A file, no CONVENTIONS, no CHECKLIST.

**Pages (20), all with a Thai 2–4 line panel, English labels, only the allowed names:**
| order · route | roles | what it shows |
|---|---|---|
| 400 `#/revenue/summary` | ceo | by type, tabs Today / MTD / YTD (`SPEC.on`), filters branch · period · type · category, each row → `data-go` the lines |
| 410 `#/revenue/lines` | ceo | 14 lines (the day 16/10), all the kinds you listed, the refund as an expense line |
| 420 `#/revenue/manual` | ceo | type + category + amount + remark + branch + payment, Save = toast |
| 430 `#/revenue/refund` | ceo | refund = expense in the refund month (Sep sale / Oct expense table) + "Pause changes nothing" |
| 440 `#/revenue/categories` | ceo | the tree; every sport has Private / Duo / 1 HR; "Add category" dialog |
| 450 `#/revenue/eca-term` | ceo | 400 ฿ × 18 × 5 = 36,000 ฿ typed; counts on the school's pay date 16/10 |
| 500 `#/stock/products` | ceo, admin | Model code · name · category · commission group · price · picture box · note; "Miller helmet 40" next to "Animal Helmet 40" |
| 510 `#/stock/stock-in` | ceo, admin | product + quantity + date, "no cost price" |
| 520 `#/stock/import` | ceo, admin | preview: Updated 3 · Added 2 · Never deleted 8 (11 + 2 = 13), Export, Add manually |
| 530 `#/stock/locations` | ceo, admin | one location "Bravo shop", balances, Add location |
| 540 `#/stock/sales-record` | ceo, admin | the form; coach split masked for the admin; toast per role (below) |
| 550 `#/stock/demo` | ceo, admin | matrix STA · ABC · RIS · WA (Abbey) · KIS · Bravo + Add site; 5 action dialogs + ± + write-off; history; no alerts |
| 560 `#/stock/low-stock` | ceo, admin | Monday · per location · F&B 10 · Safety 1 · Miller 5 · Sock 1 · Shirt 1 · to London + พี่ฟีน; this Monday's example |
| 570 `#/stock/reports` | ceo, admin | period + 3 views (sales history / balance / movement); no revenue |
| 650 `#/fo/branch` | ceo, admin | F1: Branch field, default Bravo |
| 660 `#/fo/payment` | ceo, admin | F2: payment dialog (method REQUIRED, "Save without a method" ⇒ the Thai refusal toast) + 2 installments + `SPEC.ask("b-installment-revenue")` |
| 670 `#/fo/trial-link` | ceo, admin | F4: "from Trial of 12/10 (Kid)", "renewal of course …", "shared 25 / 25", "Admin chooses" dialog, no back-fill note |
| 680 `#/fo/no-teacher` | ceo, admin | F5: Park fee, teacher "No Teacher", blocks the slot |
| 690 `#/fo/confirm-camp` | ceo, admin | D3: "Confirm camp" opens its own payment dialog; `SPEC.ask("b-camp-line-timing")` |
| 750 `#/reports/home` | ceo | the 6 headings, each "รายละเอียดจะคุยกันอีกครั้ง" |

**Decided and declared (internal; overturn freely):**
1. 🔎 **Summary rows: I added TRIAL and CAMP** to your eight (COURSE · VOUCHER · ECA · SALES · F&B · RENT · OTHER · Manual), because the lines you asked for include a trial, a camp and a Birthday, and her own type list (NOTE 10-11 §3) has Trial and Group/Camp as types. So the summary is **COURSE · TRIAL · CAMP · VOUCHER · ECA · SALES · F&B · RENT · OTHER · Manual**; Park fee sits under RENT, Birthday under CAMP. Say if you want them folded.
2. **Today = the 14 lines, exactly.** The type totals of "Today" are the sums of the lines page, typed and re-added by eye: COURSE 20,500 · TRIAL 600 · CAMP 10,500 · VOUCHER 8,400 · ECA 36,000 · SALES 3,705 · F&B 150 · RENT 2,300 · OTHER 240 · Manual 500 = **82,895 ฿**; refund −5,000 ฿. MTD 757,460 and YTD 7,113,900 are typed independently (each ≥ Today) and re-added by eye.
3. **YTD caption says "since the go-live month began"** (D5: no old revenue), not "1/1".
4. **SALES RECORD:** 3,705 ฿ is a 5% discount (195 ฿) on a 3,900 ฿ product; the CEO's toast is exactly yours; the admin's is "บันทึกแล้ว: ตัดสต็อกแล้ว + บันทึกการขายแล้ว"; the coach commission (50 ฿ + 50 ฿ of "Miller skate 100", not reduced by the discount) shows as a lock to the admin.
5. **Confirm camp has its OWN payment dialog** (`b-fo-camp-payment`, 4,500 ฿) so the numbers match the camp card; the camp is sold 14/10 and confirmed 16/10, matching the camp line on the revenue page.
6. **Admin and revenue words:** F1's "see the revenue lines" link is for the CEO only, and the other admin-visible pages carry no revenue sentence. ⚠️ **F2's and D3's text you gave me mention revenue timing** (the `b-installment-revenue` effects, the Confirm camp explanation); I kept them as written, since that is the question being asked. Tell me if the admin should not see them.
7. **Product codes are examples** (`MIL-IN-001` …); the names that are hers (Miller / Seaworld, Animal Helmet, Royal baby, Chinese / Decathlon, the commission figures) come from the NOTE.
8. **Low Stock** reads "below the lowest amount"; this Monday's example is 19/10 (a Monday; 16/10 is a Friday): Water 8 / 10 · Miller helmet — M 4 / 5 · Sock 0 / 1, consistent with the balances on the locations page.

**Verification (headless; the shell loaded exactly as `index.html` loads it, in happy-dom; the script is kept OUT of the spec folder):** for each of **ceo / admin / coach** every Team B page opened, every `SPEC.on` button clicked (tabs, saves), every `b-` dialog opened (14) ⇒ **20 pages registered, 14 dialogs, 0 console errors, 0 dead buttons, every Thai side-panel line on screen, every `data-go` a real route, every `data-dialog` a real dialog**; the no-access screen shows for the admin on the 7 CEO-only pages and for the coach on all 20. I proved the check can fail: a page with one dead button made it print `dead button: …` and exit non-zero. The SALES RECORD toast was read in both roles.
**NOT VERIFIED:** how it LOOKS (layout, phone width, dark theme): the built-in browser shows a local file as a snapshot I cannot drive. Please open `index.html` once, or have QA do it. Also not done: the CHECKLIST "Built" column (yours, after your review).

## Questions
None open. Items 1 and 6 are the two calls I would like confirmed.

## Review
- **CHECKLIST:** Team B's map is in `CHECKLIST-b.md` in the spec folder (Porter 10-16: Sober links it). The Built column is ticked after my review.

**Silver, 2026-10-16 — review 1: ✅ build accepted · 🔁 2 small fixes · ⏳ the LOOK is checked by QA.**
- **Re-checked by me:**
  - `pages-b.js` loads 3 data files + 20 pages in order; all files are Team B's own (976 lines);
  - no `reduce` / `sum` / `fetch` / `import` / `disabled`; no TASK / REQ / SCR / UC / WF words;
  - children only น้องเอ / บี / ซี; no phone numbers or LINE ids;
  - every Thai side panel read: plain, 2–4 lines, correct;
  - Today's total re-added by eye: 82,895 ฿ ✓.
- **Your call 1: FOLD them.** Her sheet puts **Trial** and **Group / Camp** as **CATEGORIES under COURSE**, not as types (`UNDERSTANDING-backoffice-2026-10-13.md` §2.1: *"COURSE also: Trial (1st time) · Group / Camp (Balance Camp/ Birthday)"*). Her TYPES are COURSE · VOUCHER · ECA · SALES · F&B · RENT · OTHER · Manual.
  - In `data/b-revenue.js`: the trial line ⇒ type **COURSE**, category **Trial**; the camp + Birthday lines ⇒ type **COURSE**, category **Group / Camp**.
  - In the categories tree: **Trial** and **Group / Camp** go under COURSE (drop the separate "CAMP (Group / Camp)" type, incl. the `categories.js` select).
  - In the summary: COURSE Today **31,600 ฿** (20,500 + 600 + 10,500). Re-type MTD / YTD COURSE so each type row still adds up by eye. The grand total is unchanged.
  - Park fee under RENT stays (her "Rent All / Park fee").
- **Your call 6: KEEP as written.** The side panel and the `SPEC.ask` speak to the customer reviewing the page, not to the admin using the product. What the admin's *screen* shows (no amounts) is what the role switch demonstrates, and you already mask those.
- **Fix 2: wording.** "ค่าเข้าสวน" reads as a garden fee. Use **"ค่าใช้ลาน (Park fee)"** in `pages/b-fo/no-teacher.js` :9 and :24 and `pages/b-revenue/lines.js` :10.
- **The look (layout, phone width, dark theme):** neither of us can drive file:// here. It goes to Tanya's 3-role headless pass + the owner's look (REQ-122 §4), via Porter.
- After the 2 fixes, re-run your headless check (0 errors, 0 dead buttons) and report counts. Then I tick CHECKLIST-b.

## Follow-up done (Fanta, 2026-10-16) — review 1's two fixes
1. **TRIAL and CAMP folded under COURSE** (reverses my declared call 1; Silver's ruling, her sheet §2.1):
   - `data/b-revenue.js`: the trial line is now type COURSE, category "Trial (1st time)"; the camp and Birthday lines are type COURSE, category "Group / Camp"; the categories tree has no TRIAL / CAMP types any more and a `courseExtra` list (Trial · Group / Camp with Balance Camp, Birthday) that `categories.js` draws under COURSE; the "Add category" and the filter selects lost the CAMP and TRIAL options; the manual line's type list has COURSE instead of CAMP.
   - **Summary re-typed, each type row re-added by eye:** Today COURSE **31,600 ฿** (20,500 + 600 + 10,500), total **82,895 ฿** unchanged; MTD COURSE **410,600 ฿** (312,500 + 9,600 + 88,500), total 757,460 ฿ unchanged; YTD COURSE **3,830,800 ฿** (3,120,400 + 98,400 + 612,000), total 7,113,900 ฿ unchanged. The eight rows (COURSE · VOUCHER · ECA · SALES · F&B · RENT · OTHER · Manual) add up to each total; I also re-added them with a throwaway script run only to CHECK my typing (the pages still contain no calculation).
2. **"ค่าเข้าสวน" → "ค่าใช้ลาน (Park fee)"** in the 3 places (`b-fo/no-teacher.js` the panel line and the Save toast; `b-revenue/lines.js` the panel line). No other "ค่าเข้าสวน" remains.
- Call 6 kept as written.
- **Headless re-run (ceo / admin / coach, every page, every `SPEC.on` click, 14 dialogs): 20 pages, 0 console errors, 0 problems (no dead button, every Thai panel line on screen, every `data-go` / `data-dialog` target real), no-access screens: admin 7, coach 20.** The SALES RECORD toasts are unchanged in both roles. The look is still NOT seen by eye (goes to QA and the owner via Porter).

**Silver, 2026-10-16 — ✅ FINAL: DONE (engineering).**
- **Checked by me:**
  - "ค่าเข้าสวน" gone; "ค่าใช้ลาน" in all 3 places;
  - no TRIAL / CAMP type left: the trial line is COURSE · Trial (1st time), the camp + Birthday lines are COURSE · Group / Camp, and the tree has both under COURSE;
  - re-added by eye: Today **82,895** · MTD **757,460** · YTD **7,113,900** ✓;
  - still no calc / fetch.
- **Fanta's headless re-run:** 20 pages · 0 errors · 0 dead buttons.
- CHECKLIST-b: all 28 lines ticked "Built".
