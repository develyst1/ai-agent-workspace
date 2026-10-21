# TASK-745 — REQ-122 v3 (Team B): Revenue · Stock · Reports rebuilt from ALL of Khwan's feedback — FE, M (≈ 4.4 d → with phase 2 pins TASK-746)
- Source: `requirements/REQ-122-backoffice-clickable-spec-for-the-customer.md` **§8** (the v3 brief) + **§7.1–§7.4** (her words, layout, answers) · `requirements/REQ-120-…` **§9** (her rulings C-a…C-k) · the verbatim part 1 + part 2 files · Porter 2026-10-21
- Status: 🔁 REWORK (TEST-115 part B: 2 STOCK OUT fixes, Porter 2026-10-21)
- Folder: `som-balance-backoffice-spec` · Assignee: @Fanta · From: @Silver (2026-10-21)
- **Claim:** `pages-b.js` · `pages/b-revenue/*` · `pages/b-stock/*` · `pages/b-reports/*` · `data/b-*.js`.
  - 🔁 **`pages/b-fo/*` (F1 / F2 / F4 / F5 / Confirm camp) move to TEAM A in v3** (§8.10). How the hand-over happens comes from Porter / Sober; don't touch them until then.
  - 🚫 Never the shell / Team A's files / CONVENTIONS / CHECKLIST.

## Build (follow Sober's v3 contract; a pure mock as before: no calculation, no network, no money / prices beyond the example amounts, an admin view never shows pay)
1. **Every word in §7.1 + §7.4, exactly as she wrote it.**
   - **Revenue:** Revenue Summary · Refund · View · Detail · Add Manually · Description · Method · "N items" · Total Revenue · Refund (Expense) · Type and Category · Inline Skate · Other Course · Other Type · EQUIPMENT · PARK · ECA Payment (Student · Class / Term · Payment Date · Total Amount · Save · ECA Payment History). The Refund page: Refund Record · From · Record · Period · Sep (Sales) / Oct (Refund).
   - **Stock:** Product · Sales Product · ALL-CAPS column headers · COMMISSION · Save · Bravo · Updated Item · New Item Added · **STOCK OUT** · Student · Other Customer · Price · Commission · Add Location · Delete · Total · To · Setting · Alert (Unit) · Balance Stock · Balance · Search · Customer · Type.
   - **Drop the struck titles:** "New manual line", "New ECA term", "Receive goods", "New sale". Drop the "Counts as revenue on" line on ECA.
   - **Every date with the year** (16/10/26). Stock In uses a **date picker**.
2. **Layout (§7.4):**
   - **Products:** Category column BEFORE Product Name; **Quantity + Location columns**; a **Location filter**.
   - **The Locations page is REMOVED** (unregister it; its job is Products).
   - **Stock Demo:** **Bravo leftmost**, a "location order" setting (a dialog is enough); remove the "Teaching equipment by site" heading.
   - **Import:** "Never deleted" said in plain words (*products not in the file are kept, with their history*).
   - **Stock reports:** the Balance view = every location, with a location picker.
3. **Her rulings (REQ-120 §9):**
   - **C-j STOCK OUT = a CART:** several lines (product + qty), ONE bill discount (฿ or %), the Price total typed.
   - **C-a commission editable per sale** on that sale's commission lines.
     - CEO and admin can both edit.
     - The admin sees **only this sale's lines**, never a total or a slip.
   - **C-b Method defaults to Transfer**, editable.
   - **C-i 1st Trial = its own revenue TYPE**, with a category per activity ("1st Trial (Inline Skate)" …). BALANCE CAMP BIRTHDAY stays under Course. **No "Manual" type**: Add Manually picks from the full type / category list.
   - **C-f Refund:** saving a refund also **cancels the course's unattended sessions and tells the families** (a toast that states it: *"คืนเงินแล้ว: ยกเลิก 4 คาบที่ยังไม่ได้เรียน และแจ้งผู้ปกครองทาง LINE"*).
   - **C-k:** Write-off is labelled **Delete**; history is kept.
4. **The open follow-ups as [?] questions** (§8.5), A/B with the consequence:
   - on STOCK OUT: *commission: lower only / raise too* AND *commission per item / per bill* (two questions on one page; see the shell note);
   - on Refund: *the course's status + does a voucher refund work the same*;
   - on Low Stock: *who receives it*.
   - If she answers in LINE first, apply the answer instead.
5. **Reports:** stays "agreed later" (REQ-120 §4) and says so.
6. **Help:** rewrite `help.steps` for every changed page (Thai, 3–6, reading order) and clear the old pins (the screenshots change). Pins = TASK-746.

## Definition of Done
- [ ] Every §7.1 / §7.4 word and layout item above is applied. List any you could not apply, with the reason.
- [ ] The rulings and the 4 questions are in place; the Locations page is gone.
- [ ] Headless run, 3 roles + every dialog + every [?]: 0 errors, 0 dead buttons. The admin view shows no pay total anywhere.
- [ ] Example numbers consistent by eye (the cart lines add up to the bill; the discount stated).
- [ ] Report the page list (old → new) for Tanya's TEST-115 captures.

- **✅ Porter's GO (2026-10-21):**
  - **The ask slot is a LIST:** `ask: [{ q, a, b }, …]`. STOCK OUT keeps its **two separate** questions; don't merge them.
  - **Delivery = ONE self-contained .html** (Sober's build inlines every `SPEC.load`-ed file and `help/*.png`). Load ONLY through `SPEC.load`, reference images ONLY as `help/<name>.png`, and use **no external load** of any kind.
  - **The front-office pages move to Team A** (TASK-834). Don't edit `pages/b-fo/*` / `data/b-fo.js`. I tell you the day to drop their lines from `pages-b.js` (the same day Fern registers them).
  - Use the shell's **date helper** (16/10/26) and **month picker**.
  - Start the content now (data, words, the cart, the asks). Align to CONVENTIONS v3 the moment it lands, and tell me if anything in it changes your plan.

## Implementation Notes
Fanta, 2026-10-21. Spec folder (not git). Aligned to CONVENTIONS v3: every printed date via `SPEC.date()` (no hard-coded dd/mm/yy left — grep clean), list-valued `help.ask`, no `help.img`/`pins` (old ones cleared; stale until Tanya recaptures), STOCK OUT is the only new route.

**Check (headless, my harness outside the spec folder, CEO/admin/coach):** 19 Team B pages · 16 b- dialogs · 31 [?] popups (3–6 Thai steps, ask only where declared) · 40 header actions · 11 handler clicks · 0 console errors · 0 dead buttons · 0 problems. `#/revenue/categories` opens clean (the `undefined.map` Porter reported is gone with the rewritten `data/b-revenue.js`). NOT VERIFIED: a real-browser pass over every page (I looked at STOCK OUT only); no pins re-measured (that is TASK-746).

**Page list old → new (for Tanya's TEST-115 captures):**
- Revenue: `#/revenue/summary` Revenue Summary · `#/revenue/lines` Detail · `#/revenue/manual` Add Manually · `#/revenue/refund` Refund · `#/revenue/categories` Type and Category · `#/revenue/eca-term` ECA Payment
- Stock: `#/stock/products` Product · `#/stock/stock-in` · `#/stock/import` · **`#/stock/stock-out` STOCK OUT (was `#/stock/sales-record`)** · `#/stock/demo` · `#/stock/low-stock` · `#/stock/reports`
- **Removed:** `#/stock/locations` (Location is now on Product/Demo: Add Location) and `#/stock/sales-record`.
- Reports home unchanged.

**Decisions to confirm (mine, not in the brief):**
1. Cart bill 10 % discount applied to the example: SALES 3,705→3,510, F&B 150→135, Today total 82,895→82,685 (typed, no calculation). MTD/YTD totals retyped to match.
2. Refund question option B wording ("ไม่ สถานะคอร์สไม่เปลี่ยน… Voucher ใช้วิธีของมันเอง") is my interpretation of Porter's sent text; the A/B **effects** are written by me — please review all four questions (`window.B_ASKS` in `data/b-stock.js`).
3. "From → To" read as the Demo history column "To".
4. Spec toasts/help steps in Thai written by me per your delegation; STOCK OUT toast differs by role (CEO sees revenue +3,510/+135 ฿, admin does not).
5. STOCK OUT help carries two questions as a list (commission range, commission scope).

## Questions
- `inbox/FE-B.md` has processed lines I cannot drain: no `drain-inbox.mjs` in `smart-scheduler/ai-worker`. Silver/Marie: drain or provide the tool.

## Review

**Silver, 2026-10-21 — ✅ FINAL: DONE (the pins follow in 746).**
- **Checked by me:**
  - no `reduce` / `fetch` / `<img src>` / `<script src>` / `disabled` in the Team B files;
  - `pages-b.js` loads STOCK OUT and no Locations page;
  - the b-fo lines stay until 834;
  - the cart adds up: 3,900 + 150 = 4,050, −10 % = 3,645 = SALES 3,510 + F&B 135, and Today 82,895 − 195 − 15 = 82,685 ✓;
  - **the admin STOCK OUT toast has no revenue** (`stock-out.js:56-58`); the admin sees only this sale's commission lines;
  - Transfer is the default;
  - STOCK OUT carries the two asks as a list.
- **The 4 questions (`B_ASKS`) read well:** plain Thai, A/B with the consequence, the admin's limit stated. Accepted as written.
- **Your 5 decisions: all accepted.**
- **Your question:** the drain tool exists at `smart-scheduler/ai-worker/drain-inbox.mjs`. From the workspace root, run `node smart-scheduler/ai-worker/drain-inbox.mjs FE-B` to print, then delete by hash + line numbers. If it is refused in your session (as in mine), leave the lines: Porter says a processed entry noted in your log is enough.
- **Not seen by eye:** the full real-browser pass. That is Tanya's TEST-115 (with the captures).

## 🔁 TEST-115 part B (Tanya, 10-21): 13 / 14 pages ✅. STOCK OUT needs TWO fixes
1. **F1, the bill discount has no ฿ / % choice.** Her words: *"Discount = เลือกเป็นบาทได้ด้วย"*; R3.5 says ฿ or %. Add a ฿ / % selector next to the Discount field. The example stays 10 % with −405 ฿, so no total changes.
2. **N1 → a fix: the Commission box sits BELOW the 1280×800 frame.** That is exactly what she couldn't find in v2 (REQ-122 §6, *"อันนี้เลือกคอมครูตรงไหนคะ"*).
   - Put the **commission picker INSIDE the sale form** (the coaches who sold + each coach's commission line for this sale), **visible without scrolling at 1280×800**. For example, a compact block beside or under the cart, or the Remark moved down.
   - The admin still sees only this sale's lines.
   - Update STOCK OUT's help steps if the positions change.
- **Then:** re-run headless (3 roles, 0 / 0) and report. Tanya re-captures STOCK OUT only; its pins come after that (746).
