# TEST-130: REQ-133 final UI, DARK MODE (TASK-847 + Silver's fix). Built file, offline, headless

- **QA:** Tanya
- **Date:** 2026-10-27, ~23:45–00:10 Bangkok
- **Brief:** Porter's "GO: final UI DARK MODE gate" in `inbox/QA.md`. Owner: *"backoffice start with dark mode first"*.
- **File:** `som-balance-backoffice-spec/final-ui/dist/index.html`, 1,245,875 B, md5 **`8cc93ae4b5f98ba380e976e0e0295f69`** (built 23:39; checked before the run).
- **How:**
  - headless Chrome, `file://`, a fresh browser context (empty storage);
  - a computed WCAG contrast scan of **every visible text node** (incl. SVG chart text) against its real background, plus a "light band" scan (any ≥ 200 × 24 px element with a light background) on **every page × every role that can open it (52 page-views)**;
  - a dialog opened on each CEO page where a control opens one (23 dialogs);
  - a toast;
  - screenshots checked by eye. Screenshots are in my scratchpad (not in the repo).

## Verdict: ✅ PASS · 🟡 three small contrast notes (none unreadable)

| Gate | Result | |
|---|---|---|
| **First open, empty storage = dark** | storage keys before any click: none; `data-mantine-color-scheme` = **dark** | ✅ |
| **Toggle both ways + remembered** | the header sun / moon: dark → **light** (still light after a reload) → **dark** (still dark after a reload) | ✅ |
| **No light bands** | **0** light-background bands on all 52 page-views, all 23 dialogs and the toast | ✅ |
| **Nothing unreadable** | lowest contrast anywhere in dark mode = **2.91 : 1** (one grey remark on a hovered row); everything else ≥ **3.27 : 1**. 0 white-on-white / black-on-black | ✅ |
| Tables, badges, role switcher, forms, charts, dialogs, toasts | read by eye on the shots: **Confirmed** (green), **Pending** (orange), **AUTO-LOCKED** (purple) badges legible; the type badges (COURSE / 1ST TRIAL / VOUCHER / ECA / SALES / F&B / RENT / OTHER) legible; the "Viewing as CEO / Admin / Coach" switcher legible; inputs, selects, date picker, NumberInputs, checkboxes legible; the STOCK OUT toast reads clearly | ✅ |
| **Revenue › Detail's expense rows** | the Refund row is a **dark red band** with *"Refund — Inline Private 10 Hr (… sold 15/09/26)"*, an **EXPENSE** tag and **−5,000 ฿**; "Refund (Expense) −5,000 ฿" under the total. All readable (see 🟡 1) | ✅ |
| **Light mode after toggling** | renders as light (Monthly Payment, Revenue Detail, STOCK OUT checked); readable (see 🟡 3) | ✅ |
| Console | **0 errors / warnings / page errors**, 0 network, across the whole run | ✅ |
| **`shots-dark/` (5 files for the deck)** | 1 Monthly Payment · 2 Revenue Summary · 3 STOCK OUT · 4 Branch for booking · 5 Role Setting: all dark, readable, **invented names only** (Pete / May / Ton / Ploy / Nam / Beam, น้องมะลิ), no item codes, no light bands | ✅ |

## 🟡 Notes (small; for Silver if wanted, not blocking)
1. **Revenue › Detail, the expense row:**
   - the amount **−5,000 ฿** in red on the row's dark-red band = **3.27 : 1**, and the grey remark on the same band also 3.27 : 1;
   - readable, but it's the weakest spot on the page;
   - a lighter red (or white) amount on that band would lift it above 4.5.
2. **Dimmed grey text in dark mode** (labels such as "Type", "Merit", "Rate", the remarks, the date-picker weekday names) = **3.53 : 1**, Mantine's default dimmed colour. Readable, but below the 4.5 body-text guideline.
   - The active menu item (blue on the dark sidebar) = 4.24 : 1;
   - white on the blue primary buttons = 3.56 : 1 (Mantine default).
3. **Light mode** (not new to dark mode; seen after toggling):
   - the sidebar's group labels / menu items in slate grey on white = **2.56 : 1** (e.g. "BACK OFFICE", "Home", "SALARY");
   - the F&B badge (orange on pale yellow) = 2.69 : 1.
   - Dark is the default now, so this only matters for someone who switches.

## Screenshot for Porter
- **Monthly Payment, CEO, dark:** `req133-final-ui-dark.png` in his scratchpad.
- **The rest of TEST-129 stands** (the brief).


---
## Re-check: Conversion fix (md5 `1d0ce1f63ae826984172ade3d724f41a`, 2026-10-28): ✅ PASS
- **Conversion** (CEO and Admin): the bonus / Special Case lines now name **May** (Full-time).
  - *"Skateboard Duo 10 Hr May Renew Course"* · *"1st Coach : Ton 2nd Coach : May"*;
  - **0 "Ploy"** (STAFF) left on the page ✅.
- **Nothing else moved:** every page's text × each role was compared with the TEST-129 read.
  - The only other difference is the Admin's Other Income (OT / Transportation amounts hidden), which is the earlier `ef3063bc` fix, as intended.
  - Menus per role are still exact (CEO 29 / Admin 17 / Coach 2); every route × role open / "cannot see" as before; 375 px OK.
- **Dark mode:** a first open = **dark**; toggle → light → dark, each kept after a reload ✅.
- **Console:** 0 errors / warnings / page errors, 0 network ✅.
