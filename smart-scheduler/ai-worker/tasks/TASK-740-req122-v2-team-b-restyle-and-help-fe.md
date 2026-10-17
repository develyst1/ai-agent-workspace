# TASK-740 — REQ-122 v2: Team B's 20 pages in the real-product look + the [?] help (phase 1 now; phase 2 = pins after Tanya's captures) — FE, M (≈ 4.4 d + 1.5 d)
- Source: `requirements/REQ-122-backoffice-clickable-spec-for-the-customer.md` **§5** (owner 10-16: *"ทำเป็น UI ที่เหมาะ จริงๆ … ปุ่ม [?] … popup แนบรูป ชี้ๆ เหมือน tutorial … แก้ UI สวยๆเลย"*) · `CONVENTIONS.md` **v2** (FINAL API) · Porter GO 2026-10-16 · follows TASK-739 (v1, DONE; TEST-104 passed)
- Status: ✅ DONE (Silver, 2026-10-16): phase 1 (restyle + help) + TEST-105 look fixes + phase 2 (pins), all reviewed
- Folder: `som-balance-backoffice-spec` (not git) · Assignee: @Fanta · From: @Silver (2026-10-16)
- **Claim:** the same files as TASK-739: `pages-b.js` · `pages/b-*/` · `data/b-*.js`. 🚫 **Never** `index.html`, `shell/`, Team A's files, `CONVENTIONS.md`, `CHECKLIST*.md`. Shell changes go through me.

## Phase 1 (now)
1. **Read `CONVENTIONS.md` v2 §0, §4–§7 first.**
2. **The body = the real UI only.** It should look like our front office (Mantine look: `.card` + `.card-head`, `.tbl`, `.badge` colours for statuses, `.btn` / `.btn-light` / `.btn-subtle`, `.tabs`, `.alert`, `.empty`, `.stack`, `.screen` + `.bar2` for the front-office pages). Page buttons go in **`actions`** (the page header). Use `SPEC.icon` where an icon helps.
   - The `impeccable` skill is the house rule for UI polish; use it for the look, inside these classes (no new stylesheet; inline `style=""` only for a one-off).
3. **No explanation text in the body.** Everything the v1 `th:` panel or an inline note said ("Pause changes nothing", "no cost price", "counts only cases after go-live", "No alerts", the revenue-timing sentences…) moves into **`help.steps`**.
   - Real UI hints stay only where the real product would show them (e.g. a required-field mark, an empty state).
4. **`help.steps`: 3–6 numbered Thai steps per page.** Plain words, each one a thing to look at or press ("กด View lines เพื่อดูทุกรายการของประเภทนั้น"). Number them in reading order (top-left → bottom-right), because the pins will follow them. **Drop `th:`.**
5. **The two A/B questions** move from `SPEC.ask` in the body to **`help.ask`** on their pages: `b-camp-line-timing` (Confirm camp), `b-installment-revenue` (payment). Keep the same ids and texts.
6. **Keep everything else:** routes, orders, menu strings, roles, the masking, the role-specific toasts, the example numbers (Today 82,895 · MTD 757,460 · YTD 7,113,900 · COURSE 31,600 …), and every dialog (14).
7. **Headless re-run:** every page in all 3 roles + every `b-` dialog + **every page's [?] popup opened** ⇒ 0 console errors, 0 dead buttons (header `actions` included). Report the counts.

## Phase 2 (after Tanya's captures; do not start before I say)
- `help.img` = `help/<slug>.png` (e.g. `help/revenue-summary.png`) + **`help.pins`** at %-coordinates matching the steps 1:1 (`{n, x, y, w?, h?}`). I check each pin on the image.

## Definition of Done (phase 1)
- [ ] 20 pages restyled; no `th:` left, no body `SPEC.ask`, no explanation paragraph in a body.
- [ ] Every page has `help.steps` (3–6, Thai); the 2 pages have `help.ask`.
- [ ] Headless 3-role run incl. [?] popups: 0 errors, 0 dead buttons (counts in the notes).
- [ ] Example numbers unchanged (re-add by eye if you touched a table).
- [ ] Nothing in Team A's files.

## Implementation Notes
**Fanta, 2026-10-16 — phase 1.** Spec folder, my own files only (the 20 page files, `data/b-*.js` untouched, `pages-b.js` untouched). Nothing committed (not git). No shell, Team A, CONVENTIONS or CHECKLIST file touched.

**What changed on every page**
- The body is the real UI only, in the v2 classes: `.card` + `.card-head`, `.tbl`, `.badge` colours (blue types, green / orange / red / violet statuses, red `expense`), `.tabs`/`.tab` (the 3 `SPEC.on` tabs: Today/MTD/YTD and the 3 stock reports), `.btn` / `.btn-light` / `.btn-subtle` / `.btn-default` / `.btn-danger`, `.alert`, `.kv`, `.cardfoot`, `.stack`, and `.screen` + `.bar2` for the 5 front-office pages. Every dialog body was restyled the same way (14 dialogs).
- **Page-header `actions`** hold the page buttons (47 across the pages, e.g. Stock Demo's six, Products' three) so the body carries only the data.
- **`th:` is gone from all 20.** Every explanation that lived in the panel or in an inline note moved into `help.steps` (3–6 Thai steps each, in reading order top-left to bottom-right: "Pause changes nothing", "no cost price", "counts only courses after go-live", "No alerts", the revenue-timing sentences, the Miller/Animal helmet note, etc.). What stays in a body is what the real product would show: a required mark, a badge, a read-only "Term total" row, the import preview's "8 not in the file" alert.
- **The two A/B questions** are now `help.ask` (same ids, same texts): `b-installment-revenue` on `#/fo/payment`, `b-camp-line-timing` on `#/fo/confirm-camp`. No `SPEC.ask(` is left in any body.
- Kept as they were: routes, orders, menu strings, roles, the masking (SALES RECORD commission lock for the admin), the role-specific toasts, every example number (**Today 82,895 · MTD 757,460 · YTD 7,113,900 · COURSE 31,600**; the data files were not touched, so no table was re-added), and all 14 dialogs.

**Decided and declared (overturn freely)**
1. **The "CEO only" badges and the "Visible to" strips are removed from the bodies** (the shell shows who may open a page, and the no-access screen demonstrates it).
2. **Stock Demo has 6 header buttons** (Move A → B filled; the others default/danger/subtle). If the header looks crowded on a phone, tell me which two go back into the body.
3. **The Confirm camp page lost its "what changes on the day" table**: it was explanation, so its content is step 3 of the help (sold 14/10, confirmed 16/10, revenue counts on 16/10).
4. **The F1 branch page lost its "what the owner sees afterwards" box** (same reason; it is now in step 3).

**Verification (headless, happy-dom, the shell loaded as `index.html` loads it; the script is kept OUT of the spec folder):** ceo / admin / coach × every Team B page (body + header actions) · every `SPEC.on` click (11 handler buttons per pass: tabs and the SALES save) · every `b-` dialog (14 × 3 roles) · **every page's [?] popup opened (33 = 20 for the CEO + 13 for the admin)**, each popup checked for 3–6 steps containing Thai, for no dead button inside it, for the A/B question on exactly the 2 pages and nowhere else ⇒ **20 pages, 14 dialogs, 0 console errors, 0 dead buttons (body, header actions, dialogs and popups), 0 problems**. Static check on the 20 files: no `th:`, no body `SPEC.ask(`, a `help` block in every file. The no-access screen shows for the admin on the 7 CEO-only pages and for the coach on all 20. Both SALES RECORD toasts unchanged. (The same script, earlier version, was proven able to fail with a deliberately dead button.)
**NOT VERIFIED by eye:** how the restyle LOOKS (spacing, the header buttons, phone width, dark theme) and the [?] popup layout, since neither of us can drive file:// here. It goes to Tanya's capture pass, which phase 2 needs anyway.
**Not started (as told):** phase 2 (`help.img`, `help.pins`). Until the screenshots exist every popup shows the shell's placeholder.

## Questions
None open.

## Review
**Silver, 2026-10-16 — review 1 (phase 1): ✅ accepted, ONE wording fix.**
- **Re-checked by me:**
  - no `th:`; no body `SPEC.ask(`; a `help` block in all 20;
  - steps per page 3–6 (counted: 3 to 6);
  - `data/b-*.js` and `pages-b.js` untouched since v1, so the numbers stand;
  - no calc / fetch / disabled;
  - the steps I read are clear, plain Thai.
- Your 4 calls: **all accepted.** Stock Demo's 6 header buttons go to Tanya's look pass.
- 🔁 **Fix (`pages/b-revenue/summary.js`, step 3):** *"รายได้จะนับในวันที่ยืนยัน (Confirm) ไม่ใช่วันที่ลูกค้ามาเรียน"* is wrong for ECA (the school's pay date), SALES (the sale), Manual and Refund. Use: *"ตารางแสดงรายได้แยกตามประเภท แต่ละประเภทนับตามวันของตัวเอง เช่น คอร์สและวอเชอร์นับวันที่ยืนยัน ECA นับวันที่โรงเรียนจ่าย และขายสินค้านับวันที่ขาย"*.
- After the fix: re-run, then report. Phase 2 still waits for Tanya's captures.

## Follow-up done (Fanta, 2026-10-16) — review 1's wording fix
- `pages/b-revenue/summary.js` step 3 now says exactly the text you gave: "ตารางแสดงรายได้แยกตามประเภท แต่ละประเภทนับตามวันของตัวเอง เช่น คอร์สและวอเชอร์นับวันที่ยืนยัน ECA นับวันที่โรงเรียนจ่าย และขายสินค้านับวันที่ขาย". The old sentence is gone from the folder. No other line changed.
- Headless re-run (ceo / admin / coach × 20 pages, 14 dialogs, 33 [?] popups, every handler click): **0 console errors, 0 problems, 0 dead buttons.** Phase 2 not started; the look still not seen by eye.

**Silver, 2026-10-16 — ✅ PHASE 1 DONE.** The summary step 3 fix is verified in the file; the old sentence is gone. Fanta's re-run: 20 pages · 14 dialogs · 33 [?] popups · 0 errors · 0 dead buttons. Phase 2 starts on my word, after the captures.

## 🔁 TEST-105 look fixes (Porter, 2026-10-16), BEFORE the pins
Porter's rule (going into CONVENTIONS via Sober): **a page's main action must sit inside the 1280×800 capture frame.** Move it up, or use a sticky action bar.
1. **`#/stock/sales-record`:** "Save sale" sits 3 px below the frame ⇒ bring it inside (into the header `actions`, or up above the fold).
2. **`#/revenue/summary`:** "How refunds count" is below the frame ⇒ bring it inside (a header action, or move the Refunds row / its button up).
3. **`#/stock/demo` header (7 buttons wrap to 4 rows on a phone; red Write-off is 2nd, primary Move is last):**
   - **primary "Move A → B" FIRST** · the destructive **"Write-off" LAST** · the other 4 behind ONE **"⋯ More"** button;
   - the "⋯ More" button opens a `b-stock-demo-more` dialog listing them (each opens its existing dialog).
   - Inline style can't do a media query, so do this at every width. That is fine: it is cleaner on desktop too.
4. **`#/fo/payment`:** the "paid" label sits above "Confirm and record payment". Put it where it reads naturally: **after the action, or as the state** (e.g. a green "Paid" badge next to the course status once paid).
5. ⚪ **Birthday under COURSE → Group / Camp: NO change** (her sheet).
- **Done =** the 4 fixes · headless re-run (3 roles, every dialog incl. the new one, every [?]) with 0 errors / 0 dead buttons · a list of the changed pages, so Tanya re-captures them.
- Pins still wait for the re-captures.

## TEST-105 look fixes done (Fanta, 2026-10-16)
**Changed pages (for Tanya's re-capture): 4**
| page | change |
|---|---|
| `#/stock/sales-record` | **Save sale** (and Cancel) moved up into the head of the first card ("New sale"), so both sit near the top, inside the 1280 × 800 frame. Same role-aware toast. Help step 4 now says where the button is. |
| `#/revenue/summary` | **How refunds count** moved into the page-header actions (first), and out of the Refunds row. The Refunds row stays (amount + red "expense"). Help step 5 says "ปุ่ม … มุมขวาบน". |
| `#/stock/demo` | Header is now **Move A → B** (filled, first) · **⋯ More** · **Write-off** (red, last). The new **`b-stock-demo-more`** dialog lists the other four (Sale → Demo, Broken sale goods → Demo, Demo → Sale, Add site), each opening its existing dialog. Help step 1 explains the split. |
| `#/fo/payment` | The "paid" label is gone from above the action; a green **Paid** badge now sits **after** "Confirm and record payment". |
- ⚪ Birthday under COURSE → Group / Camp: untouched.
- Numbers, routes, orders, roles, texts of the 2 asks: untouched.
- **Headless re-run (ceo / admin / coach × 20 pages, 15 `b-` dialogs incl. the new one, 33 [?] popups, every handler click; every `data-dialog` / `data-go` inside the dialogs too): 0 console errors, 0 problems, 0 dead buttons.** The new dialog's four buttons all resolve to registered dialogs.
- **NOT VERIFIED:** the pixel positions (my run does not lay anything out). By construction each moved button is now in the first card head or the page header, but only Tanya's re-capture can show it is inside the frame. Pins still wait.

## ▶️ Phase 2: the PINS (Porter GO, 2026-10-16). All 20 captures are final in `help/` (TEST-105 parts 2 + 3)
- **On every page:**
  - `help.img: "help/<slug>.png"`;
  - `help.pins`: ONE pin per step, the same numbers (`{n, x, y}`), with `w`/`h` for a highlight box where a whole area is meant (a card, a table, a field group);
  - %-coordinates of the image (1280×800 ⇒ x% = px/12.8, y% = px/8).
- **Measure on the real PNG,** not from the code: open each image and read the control's pixel box. If you can't see an image, measure from a headless render at **exactly 1280×800, CEO role, light theme, ⋯ closed** (the capture rules) and cross-check one pin per page against the PNG.
- **`revenue-summary`:** the 8th row's "View lines" is at y 804, outside the frame ⇒ pin a **visible** row's "View lines" (e.g. COURSE), and keep the step's wording generic ("กด View lines ที่แถวไหนก็ได้").
- A step that points at nothing visible (e.g. "only พี่ฟีน sees this page") gets **no pin**. Say which, in the notes.
- **Done =**
  - every pin on every page listed with its target;
  - headless re-run 0 errors / 0 dead buttons, with every [?] popup opened and showing its image (no placeholder left).
  - I check each pin against its image.

## Phase 2 done (Fanta, 2026-10-16) — the PINS
**How measured:** not by eye on the PNG alone. The spec was served read-only from a throwaway local static server (stopped afterwards), opened in the built-in browser at **exactly 1280 × 800, CEO, scrollbars hidden** (the headless captures have none), and each target's bounding box was read from the live layout: x% = px / 12.8, y% = px / 8, w/h likewise (a box that runs past the frame is cut at its bottom edge). **Cross-checked against the real PNGs** (opened each of: revenue-summary, stock-demo, fo-payment, stock-sales-record, revenue-lines, fo-trial-link): the pixel boxes agree to 1–2 px (e.g. "How refunds count" 735–898 × 88–124 in both; "Confirm and record payment" 954–1187 × 197–233 in both).
**Every page now has `help.img` = `help/<slug>.png` and `help.pins` with ONE pin per step, same numbers, each with a highlight box (x, y top-left, w, h).**

| page | pin → target |
|---|---|
| `revenue/summary` | ① the filter card · ② the Today/MTD/YTD tabs · ③ the type table (cut at the frame) · ④ the COURSE row's View lines (a visible row, step reworded to "ที่แถวไหนก็ได้") · ⑤ header button How refunds count · **⑥ no pin** (only the CEO sees this page) |
| `revenue/lines` | ① filter card · ② the table card (cut) · ③ the Product Name column header · ④ the Group / Camp (Balance Camp) row · **⑤ no pin** (the refund row is below the frame, y ≈ 142 %) |
| `revenue/manual` | ① the card title · ② the field grid · ③ the Remark box · ④ Save |
| `revenue/refund` | ① the form card · ② Save refund · ③ the "How it is counted" card · ④ Pause a course |
| `revenue/categories` | ① header Add category · ② the COURSE card · ③ "Also under COURSE" · ④ "Other types" (only its top strip is in the frame) |
| `revenue/eca-term` | ① School field · ② Price per class field · ③ "Date the school pays" field · ④ Save term |
| `stock/products` | ① the category strip · ② the product table (cut) · ③ the Commission group column header · ④ header Add product |
| `stock/stock-in` | ① Product field · ② Quantity field · ③ Save stock in |
| `stock/import` | ① header Choose file · ② the Updated card · ③ the Never deleted card · ④ Apply import |
| `stock/locations` | ① the location strip · ② the balance table · **③ no pin** ("teaching items live in Stock Demo": nothing on this page to point at) |
| `stock/sales-record` | ① Product field · ② Branch field · ③ the coaches card · ④ Save sale (top of the first card) |
| `stock/demo` | ① header Move A → B · **② no pin** (the "every move needs a reason and is kept" rule has no control) · ③ the sites matrix · ④ the History card (cut) |
| `stock/low-stock` | ① the left card's title · ② the thresholds table · ③ the Monday 19/10 card · ④ the recipients line (London, พี่ฟีน) |
| `stock/reports` | ① the From / To card · ② the three tabs · ③ the report body · ④ header Export |
| `fo/branch` | ① the booking screen · ② the Branch field (new) · ③ Save booking · ④ Switch to "Other" |
| `fo/payment` | ① Confirm and record payment · **② no pin** (it describes the dialog, which is not on screen) · ③ the Installments card · **④ no pin** (the A/B question lives in the popup) |
| `fo/trial-link` | ① the left card (from Trial) · ② the right card (renewal) · ③ the lower card (shared 25 / 25) · ④ Change coach mid-course · **⑤ no pin** (the go-live rule is a statement, not a control) |
| `fo/no-teacher` | ① the booking screen · ② the Teacher field (No Teacher) · ③ Save booking · ④ the timetable card |
| `fo/confirm-camp` | ① the camp screen · ② Confirm camp · **③ no pin** (the revenue-date rule) · **④ no pin** (the A/B question is in the popup) |
| `reports/home` | ① the six headings (whole grid) · ② the same grid · ③ the first card's "รายละเอียดจะคุยกันอีกครั้ง" line |

- **Steps with no pin (9):** summary ⑥ · lines ⑤ · locations ③ · demo ② · payment ② ④ · trial-link ⑤ · confirm-camp ③ ④.
- **One step reorder, one wording:** on `revenue/summary` I swapped steps 1 and 2 (the filter card is ABOVE the tabs on the page, so the filters step now comes first, text unchanged), and step 4 now says "กด View lines ที่แถวไหนก็ได้" as you asked. Nothing else in any step was touched.
- ℹ️ Where a button lives in the page header or the top of a card but its step comes later in the list (sales-record ④ Save sale, summary ⑤ How refunds count, products ④ Add product, categories ①), the pin is numbered by the step, not by position; the numbers match the steps 1:1.

**Verification**
- **In the real browser (1280 × 800), every [?] popup opened (33 = 20 CEO + 13 admin):** each image loaded at **1280 × 800**, **no placeholder left**, the number of pins drawn = the number declared (and each has its highlight box), 0 dead buttons in the popup, **0 console errors**. One popup was also looked at on screen (SALES RECORD: ① Product field, ② Branch field, ③ the coaches card, ④ Save sale, each on its control).
- **Headless (happy-dom) re-run, ceo / admin / coach × 20 pages × 15 dialogs × 33 popups: 0 console errors, 0 dead buttons, 0 problems.**
- Numbers, routes, roles, dialogs: untouched. Only the 20 page files changed (a `help.img` + `help.pins` block each, and the summary reorder).

**Silver, 2026-10-16 — phase 2 review: 17 / 20 pages' pins correct · 🔁 3 small fixes.**
- **How I checked:** I drew every page's `help.pins` onto a copy of its PNG (sharp, in my scratchpad; nothing written to the spec folder) and looked at all 20.
- The 9 pin-less steps are right: dialogs that aren't open, the A/B steps, the "who can see" steps, and the refund row below the frame.
1. **`reports-home`:** pin 1 and pin 2 are the **same box** (21.9 / 17.5 / 76.3 × 24.5), so ① is hidden under ②. Step 1 is a general sentence ⇒ **drop pin 1**.
2. **`stock-demo`:** step 1 names all three header buttons (Move A → B · More · Write-off), but pin 1 boxes only Move ⇒ **widen pin 1 to box all three** (≈ x 69.8, y 11, w ≈ 25, h 4.5; measure the right edge of Write-off).
3. **`revenue-lines`:** step 3 says "every kind is here", but pin 3 boxes the **Product Name header** ⇒ **box the Type + Category columns of the visible rows** instead.
- After the fixes: re-run (0 errors / 0 dead buttons) and report. Then phase 2 is DONE.

## Phase 2 fixes done (Fanta, 2026-10-16) — your 3 pin fixes
1. **`reports/home`:** pin 1 dropped (step 1 is a general sentence). The page now has pins ② and ③ only (numbers kept, so they still match the steps).
2. **`stock/demo`:** pin 1 now boxes all three header buttons: measured live at 1280 × 800: Move A → B starts at 893 px, Write-off ends at 1212 px, y 88–124 px ⇒ `x 69.8, y 11, w 24.9, h 4.5` (the three buttons measured 893–1006, 1014–1109, 1117–1212).
3. **`revenue/lines`:** pin 3 now boxes the **Type + Category columns** of the visible rows: the Type header's left edge 423.7 px to the Category header's right edge 635.2 px, from the header row (315 px) to the frame bottom ⇒ `x 33.1, y 39.4, w 16.5, h 60.6` (8 rows in the frame).
- **Re-run:** in the real browser at 1280 × 800, the three popups: images load, no placeholder, pins drawn = declared (② ③ · ① ③ ④ · ① ② ③ ④), 0 dead buttons, 0 console errors; headless (3 roles × 20 pages × 15 dialogs × 33 popups): **0 console errors, 0 dead buttons, 0 problems**.

**Silver, 2026-10-16 — ✅ FINAL: DONE.** I redrew the 3 fixed pages' pins on their PNGs:
- reports-home: only ② and ③ are left;
- stock-demo: ① covers Move · More · Write-off;
- revenue-lines: ③ covers Type + Category.

All 20 pages' pins now match their steps. Fanta's re-run: 0 errors / 0 dead buttons.
