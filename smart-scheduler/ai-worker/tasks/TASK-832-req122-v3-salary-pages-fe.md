# TASK-832 — FE: **REQ-122 v3 — SALARY, the 8 pages** — @Fern, ≈ 1.4 d incl. +10%
**From @Sober, 2026-10-21.** Brief: REQ-122 **§8** (+ §7.1–§7.4 words, REQ-120 §9 rulings). Repo: the spec folder (logical name `som-balance-backoffice-spec`; the path is in `machine.local.md`). Plain HTML/JS, **no money, no prices anywhere; an admin view never shows pay.** ⏳ **Waits for @Porter's GO + claims.**

## Do (every word exactly as §7.1)
- **Renames:**
  - People → **Employee** · Person profile → **Employee Profile** · Pay settings → **Payment Setting** · Pay run → **Monthly Payment (Up to date)** · Slip → **Payment Detail**;
  - Admin entries → **Other Income** · Items I entered this period → **Other Income Detail**;
  - Daily check-in report → **Daily Training Report** (Role that day → Role · Hours cut → Hour · What counts → Extra · Pay for the day → Daily Income · Day total → Total).
- **Headings spell out Full-time / Part-time / Freelance.** After a coach's name, FT / PT / FL.
- **Every date has the year** (the shell helper).
- **A month picker** on Monthly Payment, Payment Detail and Other Income. Other Income runs per pay period (R1.4).
- **Daily Training Report:** by teaching hours only (no check-in/out), plus the **total number of coaches** (C-g).
- **Commission eligibility, plain words:** "STAFF earns commission on Skate bag sales only" (R1.3), not "Eligibility By type — STAFF today: Skate bag only".
- **My slip (6)** gets its own ✓/✗: it was unanswered in v2.
- Strike every page title she struck (§7.1/§7.4).
- **[?] steps updated to the new words.** The help images are Tanya's re-captures (TASK-835 re-pins them).

## Done means
8 pages × 3 roles: 0 errors · 0 dead · Admin sees no pay. Every §7.1 Salary word string-matched.

---
## ✅ 2026-10-21 — GO (@Porter). Fern: after 831.

---
## FE report — Fern, 2026-10-21 — TASK-832 DONE (8 Salary pages + the two small items). Spec folder only (not a git repo)
**Files changed:** `data/a-salary.js` (rewritten), `pages/a-salary/{people,person,payrun,slip,settings,my-slip,entries,daily}.js`, `shell/core.js` (one line: `FO_GROUP = "SETTING"`), `shell/ui.js` (icon map), `CONVENTIONS.md` (§00.3, §8). `unhandled-between-tests: n/a`.
**Words (§7.1), string-checked on the built file; old words grep-clean in the sources (only file comments remain):**
- Titles: People → **Employee** · Person profile → **Employee Profile** · Pay settings → **Payment Setting** · Pay run → **Monthly Payment (Up to date)** · Slip → **Payment Detail** · Admin entries → **Other Income** (+ card "Items I entered this period" → **Other Income Detail**) · Daily check-in report → **Daily Training Report**.
- Daily columns: Coach · **Role** · **Hour** · **Extra** · **Daily Income**; last row **Total** (+ "3 coaches"). **No check-in/out column** (hours by teaching only, C-g).
- Buttons follow: "Add person" → Add employee · "Open slip" → Payment Detail · "Back to Pay run" → Back to Monthly Payment · "Daily check-in report" → Daily Training Report · "Pay run total" → Total.
- Headings spell out **Full-time / Part-time / Freelance** (slip sections, commission-group columns, profile row, Settings "Applies to"); FT/PT/FL stay after a coach's name and in badges.
- Commission wording: "**STAFF earns commission on Skate bag sales only**" (Payment Setting "Who earns it", Poo's profile, Poo's slip line). "Eligibility By type — …" is gone.
- Bonus (C-e, my reading of §7.3): removed "Two coaches on the first class — 25 each"; Bonus 100 gets "Special Case (the coach changed mid-course): **Who get Bonus? 1st Coach · 2nd Coach · Share 50 / 50**". ⚠️ please confirm that is where she wants it on this page (the F4 page in 834 carries the full wording).
- "SALES RECORD" → **STOCK OUT** on Poo's slip line.
**Dates:** every date on the 8 pages goes through `SPEC.date` (dd/mm/yy); the rendered text of all 12 role-allowed renders has **0 dates without a year** (regex scan). The two "next 11/26" merit notes now read "next Nov 2026".
**Month picker:** on Monthly Payment, Payment Detail, Other Income. Choosing a month redraws with that month's **pay period** (last day of the previous month → the day before the last day of the month, R1.4); the example figures stay the same (only October exists).
**Other Income / admin:** an admin now sees **no ฿ and no amount**: amount inputs are empty with a placeholder, the Detail amounts are 🔒, toasts say no amount. Scan: admin ฿ = **false** on Employee, Employee Profile, Other Income. (CEO still sees them.)
**My slip:** its own ✓/✗ this time: the page is now open to **CEO and Coach** (was Coach only, which is why Khwan never saw it); the CEO sees Kid's slip. ⚠️ a decision of mine: say if you would rather keep it Coach-only and add a note on the Home page instead.
**SETTING:** `FO_GROUP = "SETTING"` (menu now: SALARY · NOTIFICATION · SETTING · REVENUE · STOCK · REPORTS); the "หน้าบ้าน (SOM SCHEDULE)" label unchanged.
**Proof (built file `dist/SOM-BACK-OFFICE-v3.html`, 4,044,277 bytes, copied alone to an empty folder, Edge headless):** 31 pages × 3 roles = 93 renders; Salary: **0 errors · 0 dead buttons** on all 12 allowed renders; Salary images 8/8.
**Not mine / saw in the same run:** `#/stock/stock-out` has no help image (Silver renamed the route; `ERR_FILE_NOT_FOUND` + a placeholder) and still shows ฿ to an admin, as do `#/fo/payment`, `#/stock/products`, `#/stock/import` (834 / Team B).
**Not done:** pins are untouched (835 re-pins; settings step 6 was appended at the END so existing pin numbers still match); no eye on the screens — numbers from the DOM only.

## 🔎 2026-10-21 — @Sober: TASK-832 checked. Words ✅, ONE fix + two rulings, then the final check
**Checked on the source, served (8 pages × 3 roles):**
- 0 errors · 0 dead · 0 dates without the year.
- All 18 §7.1 targets present, plus SETTING; all 12 old words gone.
- **Access:**
  - Admin opens only Employee, Employee Profile and Other Income, with 0 ฿;
  - Coach opens only My slip;
  - the CEO sees everything.

**🔧 Fix: Other Income for an ADMIN.** Porter's §8.9 clarification crossed your work (my correction was still queued). Under REQ-120 R0 **an admin MAY see the amount of the line they themselves enter**.
- Restore the amount inputs and the amounts on their own Other Income Detail lines.
- Toasts may say the amount again.
- **Still NOT for an admin:** pay totals, a slip, base, rates, commission sums.
- Employee / Employee Profile stay with 0 ฿ for an admin (base / rates are pay).

**⚖️ Rulings:**
1. **Bonus 100 on Payment Setting:** ✅ as you wrote it. "Special Case (the coach changed mid-course): Who get Bonus? 1st Coach · 2nd Coach · Share 50 / 50", with the 25/25 case removed. It matches C-e; F4 (834) carries the named example.
2. **My slip stays COACH-ONLY** (the product's rule: a coach's own slip). Opening it to the CEO would show the customer a rule that doesn't exist.
   - She missed it because she never switched role. Add **one Thai hint line** on the Home page: "หน้า My slip ดูได้เมื่อสลับเป็นบทบาท Coach (มุมขวาบน)". This is prototype guidance, not product wording.
   - Re-build, then nudge me.

---
## FE correction — Fern, 2026-10-21 — per Sober's R0 ruling: ฿ NOT stripped (supersedes the "Other Income / admin" paragraph above)
`pages/a-salary/entries.js` only: an admin sees the amounts of the lines **they enter** again (the four forms' Amount fields, and the amounts in their own Other Income Detail lines); toasts name the amount; help step 2 reworded. Still 🔒 for an admin: the **slip total**.
**What an ADMIN sees on the Salary pages (built file 4,044,309 B; 93 renders, 0 dead, 0 errors on Salary):**
- **Employee:** names, types, vehicle, merit text; **base salary 🔒**.
- **Employee Profile:** type, merit, commission wording, vehicle, Kid's role-by-day; **base 🔒 and Freelance rates 🔒**.
- **Other Income:** the entry forms and their own Detail lines with amounts; **slip total 🔒**. No pay total, base or rate anywhere.
- Monthly Payment, Payment Detail, Payment Setting, Daily Training Report: CEO only (an admin gets the no-access screen). My slip: CEO + Coach only.

---
## FE — Fern, 2026-10-21 — Sober's rulings applied; re-built
- Admin's Other Income amounts: restored (see the correction above; still no slip total / base / rate).
- **My slip: Coach-only again** (`roles: ["coach"]`); Home carries the Thai hint "หน้า My slip ดูได้เมื่อสลับเป็นบทบาท Coach (มุมขวาบน)" (inside the existing welcome alert, `shell/ui.js`). The hint is in the built file (1 match).
- Bonus 100 wording: unchanged (ruled OK).
- Re-built `dist/SOM-BACK-OFFICE-v3.html` = **4,044,454 bytes**; Edge, file alone in an empty folder: 31 pages × 3 roles = 93 renders, 0 dead, 0 load errors; Salary: 0 errors, 0 yearless dates; admin ฿ only on Other Income (own lines). My slip is listed for Coach only.

## ✅ 2026-10-21 — @Sober: TASK-832 VERIFIED → DONE
- **The built file, 4,044,454 bytes,** served alone from an empty folder.
- **Salary + Notification + Role / User Setting, all roles:** 0 errors · 0 dead.
- **An admin sees ฿ only on Other Income, and only on their own entered lines** (−200 ฿ · 144 ฿). The slip total reads "🔒 HIDDEN FOR ADMIN". Employee and Employee Profile have 0 ฿. The other Salary pages are CEO-only.
- **My slip** has `roles: ["coach"]`, and the Home hint "สลับเป็นบทบาท Coach" is present.
- **Words and dates** were confirmed on the previous pass (18/18 present, 12/12 old words gone, 0 dates without the year).
