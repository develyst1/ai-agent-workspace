# TASK-812 — FE: **clickable spec v2: the numbered pins on Team A's 12 help screenshots** (REQ-122 §5) — @Fern (S ≈ 0.6 d incl. +10 percent)
**From @Sober to @Fern, 2026-10-16.** **Starts only after Tanya's screenshots are in `help/`** (Porter GOes her once both teams have restyled).
- For each of your 12 pages, place `pins` at %-coordinates so pin ① sits on what step ① talks about. Use a box `{w,h}` where a pin alone is ambiguous (a table column, a whole card).
- If a screenshot does not match the page (a different role, a dialog open, the wrong size), **do not re-capture it yourself**: tell me, and it goes back to Tanya through Porter.
- **Done means:** each [?] shows the real image with its pins on the right spots (check at desktop and at 375 px, where the image scales and the pins must follow); images ≤ 150 KB each; 0 console errors.

---
## 📋 @Fern REPORT — 2026-10-16 — 🔨 TASK-812 DONE (57 pins on my 12 screenshots), ready for @Sober
All 12 screenshots **match their pages** (right role — CEO, My slip as Coach — light theme, no dialog open, 1280 × 800): **nothing to send back to Tanya.** Pins were read off each PNG in its native 1280 × 800 coordinates (x % = px ÷ 12.8, y % = px ÷ 8) and written into each page's `help.pins`; **a `{w,h}` box wherever a lone pin would be ambiguous** (a column, a card, a button), a lone pin only for a single checkbox and the two "below the fold" cases.
### Page → pins (n = the step number; two pins with the same number = that step names two places)
| page | steps | pins | what is pinned |
|---|---|---|---|
| People | 4 | **5** | ① the list · ② Kid's two type badges · ③ Base salary column · ④ Open column + ④ Add person |
| Person profile | 5 | **5** | ① tabs · ② the settings table · ③ Role by day · ④ base + rate rows · ⑤ Save profile |
| Pay settings | 5 | **7** | ① title · ② Extra Hour · ③ OT + ③ both Bonus cards · ④ Commission groups + ④ Add group · ⑤ Save settings |
| Pay run | 4 | **5** | ① rows · ② Status column · ③ the confirm-by line · ④ Open slip column + ④ Remind button |
| Slip | 4 | **4** | ① tabs · ② Extra Hour group · ③ a Subtotal row · ④ bottom edge (lone) |
| My slip | 4 | **4** | ① the slip · ② Confirm · ③ the deadline banner · ④ Tell an admin |
| Admin entries | 5 | **5** | ① the forms · ② "Slip total — hidden for Admin" · ③ Other ± · ④ Merit · ⑤ bottom edge (lone) |
| Daily check-in | 4 | **4** | ① table · ② date tabs · ③ What counts + Pay for the day · ④ Export |
| Notification settings | 4 | **4** | ① Staff and admins · ② ฟีน + London rows · ③ a checkbox (lone) · ④ Coaches card |
| Inbox | 4 | **5** | ① the list · ② type badges · ③ Mark as read column + ③ Mark all as read · ④ "6 new" |
| F3 Teacher roles + STAFF | 5 | **5** | ① the screen bar · ② Type checkboxes · ③ day header · ④ role badges · ⑤ Poo's STAFF |
| F6 Web login | 4 | **4** | ① the login screen · ② the three buttons · ③ "Menu: My slip · Inbox" · ④ See it as Coach |
| **Total** | | **57** | |
### ⚠️ What the screenshots cannot show (viewport-only captures at 800 px) — pinned as well as possible, tell me if you want a taller capture
- **Pay settings ⑤** — the Transportation and School-distances tables sit below the fold; the pin is on **Save settings** (step text says both).
- **Slip ④** ("the teaching-hours table is below") and **Admin entries ⑤** ("the table below is the items I entered") — a lone pin at the bottom edge (50 %, 96 %) means "scroll down".
- **Slip ③** pins the first Subtotal row; the slip total itself is below the fold.
**Checked:** each [?] loads its **real PNG** (1280 × 800, no placeholder fallback), shows exactly its pin count (boxes = box pins), every pin inside the image, **0 console errors**. **At 375 × 812** the image scales to the popup width (aspect 1.6) and **each pin is within 1.5 px of its computed % position** on all 12 pages, no horizontal scroll. Small shell tweak: pins are 20 px on phones (26 px on desktop) so they do not cover the scaled image. Images: **80–127 KB, max 127,136 B (≤ 150 KB)**, `help/` = 1.1 MB for 12. Not changed: any step text, any numbers, CONVENTIONS.
⚠️ Still unproven: double-click from a zip (file://). **BALL: @Sober.**

---
## ✅ 2026-10-16 — @Sober: TASK-812 VERIFIED (my own pass)
- **12 pages, 57 pins**, the per-page counts exactly as in your table. Every pin is drawn.
- **Every step number has at least one pin.** No pin or box lies outside its image.
- **Every [?] loads the real PNG at 1280 × 800** (no placeholder). 0 console errors.
- **Eyeballed Pay run:** ① the rows, ② the Status column, ③ the confirm-by line, ④ Open slip + Remind. All on target.
- **The 3 below-the-fold pins** (Pay settings ⑤, Slip ④, Admin entries ⑤) are the one weak spot: "scroll down" is a weak pointer for a tutorial. I've offered @Porter an optional fix: Tanya re-captures **those 3 pages only** as taller (full-page, 1280 wide) PNGs, still ≤ 150 KB, then you re-pin those 3 (≈ 0.1 d). **Do nothing unless I say GO.**

---
## 🔧 2026-10-16 — @Sober → @Fern: TEST-105 look fix (Porter's rule). Two pages + one CONVENTIONS rule
**The rule (Porter's call, I authorise the CONVENTIONS change):** a page's **main action must sit inside the 1280 × 800 capture frame**, so its pin can point at it. The capture size stays 1280 × 800.
1. **Shell + CONVENTIONS (v2.1):**
   - add an optional **sticky action bar** (a class such as `.actionbar`, sticky at the bottom of the page area, Mantine-like: border-top, background, right-aligned buttons, safe at 375 px);
   - add to CONVENTIONS §5.3 + §7: *"the main action of a page is inside the 1280 × 800 frame: either up in the page-header `actions`, or in `.actionbar`."*
   - status line → **v2.1**, one sentence on what changed. The API is otherwise unchanged.
2. **Pay settings:** "Add school / Edit" (the school-distances table) is below the fold. Bring it into the frame: a page-header action, or the action bar with **Save settings**. Your choice; keep it real-product-like.
3. **Admin entries:** "Save" is below the fold. Use the action bar, or move the forms so Save is in the frame.
4. **Then:**
   - re-check those 2 pages × 3 roles at 1280 × 800 (the main action visible without scrolling) and at 375 px; 0 console errors, 0 dead buttons;
   - **leave their pins as they are** until Tanya re-captures those 2 pages. Then you re-pin only those 2;
   - the other 10 pages' pins stand.

Nudge me when 1–3 are done.

## 📌 2026-10-16 — @Porter's ruling (via @Sober): full-page re-captures for Pay settings, Admin entries AND Slip
After the 2-page layout fix, Tanya re-captures those 3 as full-page PNGs (1280 wide, ≤ 150 KB), then Fern re-pins the 3. The popup must show a tall image cleanly at desktop and at 375 px.

---
## 🔧 @Fern — 2026-10-16 — TEST-105 look fix DONE (1–3): action bar + CONVENTIONS v2.1, Pay settings, Admin entries
1. **Shell + CONVENTIONS v2.1** (your authorisation): new optional **`.actionbar`** (sticky at the bottom of the screen, border-top, translucent surface, right-aligned buttons, an optional left `.dim` hint; at 375 px it goes edge-to-edge and the buttons share the width). CONVENTIONS: status → **v2.1** with one sentence; §5.3 gains *"the main action of a page is inside the 1280 × 800 frame — up in the page-header `actions`, or in `.actionbar`; a form's own Save must be visible without scrolling"*; §7 gains the `.actionbar` entry + its markup. Nothing else changed.
2. **Pay settings:** **"Add school"** (light, with +) is now a **page-header action** next to **Save settings** — both inside the frame (bottoms at y = 124 of 800); it opens the same Add-school dialog. The per-row "Edit" buttons stay in the school table. Step 5's text now names Add school.
3. **Admin entries:** the four forms now sit **side by side in one row** (OT · Merit · Transportation · Other ±), so every Save is inside the frame: measured at 1280 × 800 the four Save buttons end at y = **515 · 443 · 663 · 515** (CEO and Admin). Items-I-entered table follows below.
**Checked:** `.actionbar` injected on a page: at 1280 × 800 it sticks at y = 800 (right edge aligned with the content edge) and stays when scrolled to the end; at **375 × 812** it sits at y = 812, full width, no horizontal scroll. **12 pages × 3 roles at 1280 × 800: no filled (primary) button below the fold on any page, 0 open/blocked mismatches, 0 dead buttons, 0 console errors**; at 375 px: 0 dead, no horizontal scroll, header 56 px. **Pins untouched** (as ordered): the 10 other pages stand; **Pay settings and Admin entries pins are now out of date and wait for Tanya's re-capture of those 2 pages** (the Add-school pin ④b on Pay settings moves to the header; Entries ①–⑤ move because the forms are now one row).
**BALL: @Sober** (Tanya re-captures those 2 → I re-pin only those 2).

## ✅ 2026-10-16 — @Sober: TEST-105 layout fix VERIFIED (my own pass at 1280 × 800)
- **Pay settings:** "Add school" and "Save settings" sit in the page header at y = 124, inside the frame. The per-row "Edit" buttons of the school table stay lower; they are row actions, not the page's main action, and the full-page re-capture shows them.
- **Admin entries:** all four Saves are inside the frame (bottom y = 515 / 443 / 663 / 515).
- **CONVENTIONS v2.1:** the status line, the rule (§5.3) and `.actionbar` (§7) are written.
- **Regression, 32 pages × 3 roles:** 52 opened / 44 blocked (unchanged), 0 console errors.
- **Next:** Tanya re-captures **Pay settings, Admin entries, Slip** as full-page PNGs; then Fern re-pins those 3.

---
## 🔧 2026-10-16 — @Sober → @Fern: TEST-105 part 4, three small fixes (Tanya, via @Porter)
1. 🟡 **Admin entries is 21 px too wide at 1280.** Two 260 px labels in the "Other ±" card cause sideways overflow. Make the card fit: shorter label widths, wrapping, or a stacked label. **No horizontal scroll at 1280 × 800 or at 375.**
2. ⚪ **In a full-page capture the fixed sidebar stops at 800 px** and the area below is grey, which looks broken. **The sidebar must run the full page height** (e.g. the layout's nav column stretches with the page, or the fixed nav gets a full-height background), at least in a tall capture. Keep the phone layout as it is.
3. ⚪ **Pay settings shows two "Add school" buttons.** **Keep the one inside the 1280 × 800 frame** (the page-header action you added for v2.1) **and remove the copy lower down.** Porter's brief says "the one in the action bar"; the intent is the one in the frame, so the header one stays. The per-row "Edit" buttons stay.

**Check:** those pages × 3 roles at 1280 × 800 and 375, plus one full-page look at Pay settings (the sidebar reaches the bottom). 0 console errors, 0 dead buttons. **Don't re-pin yet:** Tanya re-captures the 3 tall pages after this. Nudge me.

---
## 🔧 @Fern — 2026-10-16 — TEST-105 part 4 DONE (3 fixes)
1. **Admin entries "Other ±" too wide:** its inner Person/Amount two-column grid (2 × 260 px labels) is now a plain stack, so the card fits its column. **No horizontal scroll** at 1280 × 800 or 375 (Entries, Pay settings, Slip; document and `.main`).
2. **Sidebar full height:** on ≥1024 px the `.shell` paints the sidebar column (surface + 1 px line, 256 px) down its whole height, so a tall capture has no grey gap under the sticky nav. Checked on Pay settings (page 1583 px tall): the nav stays sticky at 800 while the white column runs to the bottom. Phone layout untouched (no gradient < 1024 px).
3. **Pay settings:** the lower "Add school" button in the School distances card is removed; the header one stays (1 "Add school" button on the page, CEO). Per-row Edit buttons stay.
**Checked:** Entries · Pay settings · Slip × 3 roles at 1280 × 800: no horizontal scroll, 0 console errors, Admin/Coach still blocked where they were (no Add school anywhere but CEO header). 375 px: no horizontal scroll, 0 errors.
**Pins:** still not touched. Entries and Pay settings pins wait for Tanya's full-page re-capture (with Slip). **BALL: @Sober → Tanya.**

## ✅ 2026-10-16 — @Sober: TEST-105 part 4 fixes VERIFIED (my own pass)
- **(1)** Admin entries, Pay settings and Slip: **no horizontal scroll at 1280 × 800 or at 375 × 812**.
- **(2)** The sidebar runs the full page height. Scrolled to the bottom of Slip (1,759 px tall), the nav column and its background are still there.
- **(3)** Pay settings has exactly **one** "Add school" (the header one).
- 0 console errors; phone header 56 px.
- **Next:** Tanya re-captures salary-settings, salary-entries and salary-slip full-page; then Fern re-pins those 3.

---
## ▶️ 2026-10-16 — @Sober → @Fern: GO re-pin the 3 tall pages (Tanya's part-5 captures are final)
- **New images:** `salary-settings.png` 1280 × 1583 (83 KB) · `salary-entries.png` 1280 × 968 (103 KB) · `salary-slip.png` 1280 × 1759 (76 KB).
- 🔴 **Re-place EVERY pin on these 3 pages, not only the last steps.** Pins are % of the image height, and the height changed (800 → 968 / 1583 / 1759), so every old y % now lands in the wrong place. x % is unchanged (still 1280 wide). Re-read each spot off the new PNG (y % = px ÷ height).
- **Now pin the last steps onto the real rows:** Pay settings ⑤ on the Transportation + School-distances tables; Slip ④ on the teaching-hours table (and ③ on the slip total if the step names it); Admin entries ⑤ on the items-entered table.
- **Check:** each pin on its target at desktop and at 375 px (the popup scrolls the tall image). 0 console errors. Report the pin count per page.

---
## 🔧 @Fern — 2026-10-16 — RE-PIN of the 3 tall pages DONE
Every pin re-placed from pixel positions read off Tanya's final PNGs (x % = px ÷ 1280, y % = px ÷ image height). Slip ② covers the whole slip card; ③ sits on its rows.
| Page | Image | Pins | Where |
|---|---|---|---|
| Pay settings (`salary-settings`) | 1280 × 1583 | **10** | ① title · ② Extra Hour · ③ OT + Bonus 50 + Bonus 100 · ④ Commission groups + Add group · ⑤ header Add school/Save settings + **Transportation + School distances tables** |
| Admin entries (`salary-entries`) | 1280 × 968 | **5** | ① the four forms · ② Slip-total lock · ③ Other ± Reason · ④ Merit · ⑤ **Items-I-entered table** |
| Slip (`salary-slip`) | 1280 × 1759 | **5** | ① tabs · ② slip card · ③ Extra Hour subtotal + **total row** · ④ **teaching-hours table** |
**Checked:** desktop — each popup shows the real tall image, frame ratio = image ratio, pins visibly on target (screenshots of Slip and Pay settings); **375 px** — frames 317 × 240 / 392 / 436, popup scrolls, every highlight box inside its frame, no horizontal scroll. **0 console errors.** The other 9 pages' pins untouched. Step texts unchanged.
**BALL: @Sober.**

## ✅ 2026-10-16 — @Sober: the 3-page re-pin is VERIFIED. TASK-812 is fully VERIFIED
- **Real full-page PNGs load:** salary-settings 1280 × 1583 · salary-entries 1280 × 968 · salary-slip 1280 × 1759.
- **Pins:** 10 / 5 / 5, all drawn. Every step has a pin, and none lies outside its image.
- **The last steps now sit on real rows below the old 800 px edge:**
  - Admin entries ⑤ at 697 px;
  - Pay settings ⑤ at 1205 px (the tables) + the header button;
  - Slip ④ at 1333 px.
- **Eyeballed Slip:** ③ frames the total row (23,139 ฿), ④ boxes the teaching-hours table, and the tall image scrolls inside the popup.
- 0 console errors.
- **Team A total now 63 pins on 12 pages.**
