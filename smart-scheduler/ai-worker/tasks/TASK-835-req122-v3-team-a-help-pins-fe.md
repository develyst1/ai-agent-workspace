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
