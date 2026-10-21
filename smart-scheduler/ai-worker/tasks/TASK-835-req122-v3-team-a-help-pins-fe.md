# TASK-835 — FE: **REQ-122 v3 — re-pin Team A's [?] help images on Tanya's v3 captures** — @Fern, ≈ 0.55 d incl. +10%
**From @Sober, 2026-10-21.** Brief: REQ-122 **§8** (+ §7.1–§7.4 words, REQ-120 §9 rulings). Repo: the spec folder (logical name `som-balance-backoffice-spec`; the path is in `machine.local.md`). Plain HTML/JS, **no money, no prices anywhere; an admin view never shows pay.** ⏳ **Waits for @Porter's GO + claims.**
**After** Tanya's re-captures of Team A's 19 pages (1280×800, the main action inside the frame).

## Do
- Swap Team A's `help/*.png` for Tanya's v3 captures.
- Re-place the numbered pins so that **every step has its pin**, as in TASK-812.
- Re-build the single `.html`.

## Done means
- Every Team A [?] step pinned on a real v3 PNG.
- The built file passes 831's from-disk check.
- 0 errors.

---
## ✅ 2026-10-21 — GO (@Porter). Fern: after 834 and Tanya's v3 captures.

---
## ▶️ 2026-10-21 — GO (@Porter): TEST-115 part A PASSED (17 Team A pages + Home, all roles). Pins on Tanya's 19 captures (`help/`), plus fix A1 + a sweep, then THE FINAL BUILD
**A1 + the sweep.** Her rule: *"หัวข้อให้ใช้ตัวเต็มทั้งหมดค่ะ"*. Headings, labels and standalone terms use **Full-time / Part-time / Freelance**. FT / PT / FL appear **only right after a coach's name** (a badge beside the name, "Nelson (FT)", the type column of a row that names the coach). Found by my grep:
- `pages/a-notify/settings.js:36`: h2 "Coaches (FT / PT)" → **"Coaches (Full-time / Part-time)"** (A1);
- `pages/a-salary/settings.js:5`: the tick labels "FT (to the FT pool)" · "PT" · "FL" → **"Full-time (to the Full-time pool)" · "Part-time" · "Freelance"**;
- `pages/a-salary/settings.js:66`: th "FT shares" → **"Full-time shares"**, and "the FT pool" / "all FT" in that row → "the Full-time pool" / "all Full-time coaches";
- `pages/a-frontoffice/teacher-roles.js:25 + :32`: the tick labels FT / PT / FL → **Full-time / Part-time / Freelance**;
- `data/a-salary.js:29–32`: the commission table's "FT pool" values → **"Full-time pool"**;
- `data/a-salary.js:62`: the slip row "FT pool 1,200 ฿ ÷ 6 FT" → "Full-time pool 1,200 ฿ ÷ 6 Full-time coaches".

**Stay:**
- Kid's "PT + FL" badge;
- "Nelson (FT)" / "Bank (FT)";
- the types columns on rows that name the coach (Employee, Monthly Payment, Daily Training Report, Kid's day grid);
- the Thai help steps (explanations, not headings). Change those too if a step reads as a heading.

**Then:**
1. the pins on the 19 captures, every step pinned;
2. `node build/single.mjs`;
3. report the **file name + size** and 31 pages × 3 roles (0 errors · 0 dead).

---
## FE report — Fern, 2026-10-21 — TASK-835 DONE: pins on Tanya's v3 captures + A1 + the FT/PT/FL sweep + THE FINAL BUILD
**THE BUILD:** `dist/SOM-BACK-OFFICE-v3.html` = **3,606,013 bytes (3.44 MiB)**, md5 `540dc06ba50a…`. Opened ALONE from an empty folder (`file://`) in **headless Edge AND headless Chrome**: **31 pages × 3 roles = 93 renders · 0 errors · 0 dead buttons · 0 load errors · 31/31 help images** (35 PNGs inlined). Questions/answers: `somspec.v3`, export lists 31 pages.
**Pins:** all **17** Team A pages (8 Salary · 2 Notification · Role Setting · User Setting · F1 · F2 · F4 · F5 · D3) re-placed on Tanya's 1280×800 captures; **every step has its pin** (17/17 pages, 0 steps without one). Method: each page is rendered at 1280×800 in a headless browser and each step's target element is *measured* (x/y/w/h in %), then written into the page's `help.pins` (the pins follow the real layout, not my eye). I looked at the [?] popups of Monthly Payment, F4 and Payment Setting on the PNGs: the pins sit on the right elements.
  - Where a step's target is below the 1280×800 frame, the pin is clipped to the frame edge (Payment Setting commission card, Payment Detail table, Other Income Detail, My slip card); **one** step has nothing visible at all: *Payment Detail step 4 (the teaching-hours table)*, pinned as a thin strip at the bottom edge ("it continues below").
  - `help/home.png` and `help/datefield-open.png` are not page captures (Home has no [?]); not pinned.
**A1 + the sweep (all 6 spots done + the Thai steps that read as headings):** Notification Setting h2 "Coaches (Full-time / Part-time)" · Payment Setting tick labels "Full-time (to the Full-time pool)" / "Part-time" / "Freelance" and th "Full-time shares" + "the Full-time pool … all Full-time coaches" · Role Setting tick labels ×2 → Full-time / Part-time / Freelance · commission table values "Full-time pool" ×4 · slip row "Full-time pool 1,200 ฿ ÷ 6 Full-time coaches" · plus Nelson's profile text and the Thai steps of Notification Setting and Role Setting. Stay as FT/PT/FL (after a coach's name): the Employee / Monthly Payment / Daily Training Report type columns, Kid's "PT + FL" badge and day grid, "Nelson (FT)". Grep for "FT pool / FT shares / (FT / PT)" and the old tick labels: 0 left.
**Files:** `pages/a-*/*.js` (17 page files: `help.pins` + the sweep spots), `data/a-salary.js`. Not touched: `pages-b.js`, Team B pages, the old `b-fo` files (kept on disk, unloaded).
**Not done / caveats:** screens not eyeballed beyond the three above; the build contains Team B's pages as they are at this minute (Silver may still change them: a final re-build after her last edit is one command).

## ✅ 2026-10-21 — @Sober: TASK-835 + THE FINAL BUILD VERIFIED → DONE
- **The final file:** `dist/SOM-BACK-OFFICE-v3.html`, **3,606,013 bytes (3.44 MB)**. Served ALONE from an empty folder: 31 pages, 50 role-allowed renders · **0 errors · 0 dead**.
- **Pins:** on all 17 Team A pages, every [?] step has its pin. Every image loads from inside the file at **1280×800**.
- **A1 + the sweep:** the page text has "Coaches (Full-time / Part-time)" · "Full-time shares" · "Full-time pool". 0 left of "Coaches (FT / PT)" / "FT shares" / "FT pool" / "÷ 6 FT".
  - The tick labels read Full-time / Part-time / Freelance on Payment Setting and Role Setting.
  - The abbreviations stay only after a coach's name.
- **Team A's REQ-122 v3 work (831–835) is complete.**
