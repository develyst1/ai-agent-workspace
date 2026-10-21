# TASK-834 — FE: **REQ-122 v3 — the FRONT OFFICE pages F1 Branch · F2 Payment Method · F4 Conversion · F5 No Teacher · D3 Confirm camp (taken over from Team B's v2 `b-fo`)** — @Fern, ≈ 1.1 d incl. +10%
**From @Sober, 2026-10-21.** Brief: REQ-122 **§8** (+ §7.1–§7.4 words, REQ-120 §9 rulings). Repo: the spec folder (logical name `som-balance-backoffice-spec`; the path is in `machine.local.md`). Plain HTML/JS, **no money, no prices anywhere; an admin view never shows pay.** ⏳ **Waits for @Porter's GO + claims.**
**Handover:** in v2 these 5 pages were Team B's (`pages/b-fo/*`, `data/b-fo.js`, their `pages-b.js` lines). §8.10 gives them to Team A. They move to `pages/a-frontoffice/` + `data/a-fo.js`, loaded from `pages-a.js`, and Team B drops them from `pages-b.js`. **Porter confirms the claim; Silver agrees the cut-over** (same day as 831, so no page is loaded twice or lost).

## Do: all in the FRONT OFFICE group with the "หน้าบ้าน (SOM SCHEDULE)" label
- **F1 Branch:** the plain explanation "the branch where the class happens (revenue by branch; default Bravo)". It is not a branch move.
- **F2 Payment Method** (was "Payment record"):
  - **defaults to Transfer** (C-b), with no daily confirming;
  - editable in the front **and** the back (her ruling);
  - the page shows both places.
- **F4 Conversion** (was "First coach and links"):
  - First coach → Coach;
  - the cards read **New Package after 1st Trial** / **Renew Course**; RENEWAL → **RENEW**;
  - a mid-course coach change shows **Who get Bonus?** (1st Coach : Kid · 2nd Coach : Poo · Share : 50 / 50);
  - **no trial 25/25 case** (C-e).
- **F5 No Teacher:** words per §7.1, front-office label.
- **D3 Confirm camp:**
  - the front-office button also sets Transfer (C-c);
  - the LINE "CONFIRMED SCHEDULE" goes at Confirm.
- **[?] steps updated.**

## Done means
5 pages × 3 roles: 0 errors · 0 dead · words string-matched. Team B's `pages-b.js` no longer loads `b-fo` (checked together with Silver).

---
## ✅ 2026-10-21 — GO (@Porter): the handover is CONFIRMED. `pages/b-fo/*` + `data/b-fo.js` are Team A's
Silver unregisters them from `pages-b.js` on the same day (Porter told her in SA-B.md). Move them to `pages/a-frontoffice/` + `data/a-fo.js` and register them in `pages-a.js`. Fern: after 832.

---
## ➕ 2026-10-21 — @Sober: ONE shell date field (Porter, Khwan: "เอาปีด้วยค่ะ 16/10/26 ขอเป็นเลือกวันที่ในช่อง"). ≈ 0.2 d, inside 834
- **No native `<input type=date>`** anywhere: its display follows the viewer's locale (Tanya's captures showed 10/16/2026).
- **Shell (Fern's):** add `SPEC.dateField(value, opts)`.
  - It renders a text box **showing `SPEC.date` (dd/mm/yy)** plus a small calendar popup.
  - Picking a day writes dd/mm/yy back.
  - Keyboard typing in dd/mm/yy is accepted.
  - **No dead buttons**; the month steps like `monthPicker`.
  - Document it in CONVENTIONS v3 §00, so Team B uses the same helper (Porter tells Silver).
- **Swap Team A's 5 date fields:**
  - `a-salary/entries.js` ×2 (Date);
  - `a-frontoffice/branch.js` (Date);
  - `a-frontoffice/payment.js` + `confirm-camp.js` (Date received).
  - `a-example/everything.js` is a template that isn't loaded: leave it.
- **Check:** each field opens its picker, a chosen day shows as dd/mm/yy, 0 errors / dead. Re-build.

---
## FE — Fern, 2026-10-21 — `SPEC.dateField` done (the shell date field). Registration of the 5 FO pages STILL HELD
- New `shell/datefield.js` (+ one `<script>` line in `index.html`, + ~12 CSS lines): `SPEC.dateField(value, { label?, name? })` → HTML (a text box showing dd/mm/yy + a calendar button → month grid ‹ month year ›). Delegated, so pages wire nothing; every button is `data-shell`. Typing `7/11/2026` is normalised to `07/11/26`; `31/02/26` turns the box red (not guessed). `SPEC.parseDate` exported. **No `type=date` anywhere** (0 in the built file).
- Swapped Team A's 5 fields: `entries.js` ×2 · `branch.js` · `payment.js` (dialog) · `confirm-camp.js` (dialog). `a-example` left alone.
- CONVENTIONS v3 §00 item 9 (the new item 10 is the old "rules that did not move").
- **Proof (scratch copy with the cut-over applied, Edge, file alone):** field count 2 on Other Income; picker opens (31 days of Oct); picking 5 → `05/10/26`, iso `2026-10-05`, popup closes; month step → "Nov 2026", pick 9 → `09/11/26`; typed `7/11/2026` → `07/11/26`; `31/02/26` → red; inside the Payment Method dialog the picker opens, the dialog stays open, 20 → `20/10/26`; Branch shows `18/10/26`. 31 pages × 3 roles = 93 renders, 0 errors, 0 dead. **Real folder** rebuilt with the b-fo pages still on Team B's side.

---
## FE report — Fern, 2026-10-21 — TASK-834 DONE: the 5 FO pages are REGISTERED (6 lines in `pages-a.js`) + `SPEC.dateField`
- **Files:** new `data/a-fo.js` (global `A_FO`), `pages/a-frontoffice/{branch,payment,trial-link,no-teacher,confirm-camp}.js`, `shell/datefield.js`; edited `pages-a.js`, `index.html` (+1 script line), `shell/styles.css`, `CONVENTIONS.md` (§00.9), `pages/a-salary/entries.js` (date fields). `pages-b.js` untouched (Silver's `b-fo` lines were already out: 0 matches). Old `pages/b-fo/*` + `data/b-fo.js` remain on disk, unloaded (delete when you say).
- **Built file** `dist/SOM-BACK-OFFICE-v3.html` = **3,736,328 bytes** (smaller than before: Silver removed the Locations page). Edge, file alone in an empty folder: **31 pages × 3 roles = 93 renders: 0 errors · 0 dead · no duplicate route · 33/33 help images**; 5 FO pages show "หน้าบ้าน (SOM SCHEDULE)"; menu group SETTING; 0 `type=date`.
- **Words:** F1 explanation in the steps (branch where the class happens, default Bravo, not a move); F2 **Payment Method**, defaults to **Transfer**, edit in the front (Edit dialog) and the back (table row Save); F4 **Conversion** · Coach · "New Package after 1st Trial" / "Renew Course" · RENEW · "Who get Bonus? 1st Coach : Kid · 2nd Coach : Poo · Share : 50 / 50" (no 25/25); D3 Confirm camp sets Transfer + sends the LINE CONFIRMED SCHEDULE (toast + steps); F5 Payment Method defaults to Transfer. Every date has the year (`SPEC.date`).
- **Asks:** installments and camp LINE timing are both shown as answered in LINE (B), per §7.3 C-d / C-c.
- **What an admin sees (R0):** F1/F5/D3: the booking fields and the price/charge being entered (4,500 ฿ camp, 800 ฿ park fee); F2: the payment amount being recorded (9,500 ฿) and its installments; F4: coaches and course names, no pay. No revenue figure, no coach pay on any of the 5.
- **Not done:** pins untouched (835); screens not eyeballed.

## 🔎 2026-10-21 — @Sober: TASK-834 checked. ONE small fix, then DONE
**The built file, 3,736,328 bytes** (smaller: Silver removed Locations), served alone from an empty folder:
- 31 pages; 50 role-allowed renders: **0 errors · 0 dead · 0 duplicate routes · 0 native `type=date`**.
- Menu groups: SALARY · NOTIFICATION · SETTING · REVENUE · STOCK · REPORTS.
- **The 5 FO pages:** F1 Branch · F2 Payment Method · F4 Conversion · F5 No Teacher · D3 Confirm camp. Each shows "หน้าบ้าน (SOM SCHEDULE)".
- **Words:** Payment Method · Transfer · Conversion · RENEW · Who get Bonus? · "Share : 50 / 50" (the radio in the mid-course dialog) · "CONFIRMED SCHEDULE" (the Confirm camp toast + steps + the answered ask). Old words gone (Payment record · First coach and links · RENEWAL · 25 each · Scheduling app).
- **Admin (R0):** ฿ shows only on F2: the payment being recorded (9,500 ฿) and its installments. No revenue, no coach pay.
- **The old `pages/b-fo/*` + `data/b-fo.js`:** they stay on disk, unloaded. **Not deleted** (we never delete information).

**🔧 The fix:** on F4 the course badges render in CAPITALS ("NEW PACKAGE AFTER 1ST TRIAL", the CSS uppercase). Her words are **"New Package after 1st Trial"** and **"Renew Course"**, exactly as written.
- Drop the uppercase transform on those badges, or use a non-uppercase badge class.
- RENEW stays in capitals (her word).
- Re-build, nudge me.

---
## FE — Fern, 2026-10-21 — F4 badge case fixed
New `.badge.asis` / `.tag.asis` (CSS: no uppercase, normal spacing) in `shell/styles.css`; used on the F4 badges in `trial-link.js`. Rendered text (innerText, Edge): "New Package after 1st Trial | from Trial of 12/10/26 (Kid) | Renew Course | RENEW of course Inline Private 10 Hr (ended 30/09/26) | Special Case". Re-built `dist/SOM-BACK-OFFICE-v3.html` = 3,736,541 B; 93 renders, 0 errors, 0 dead. Old `b-fo` files kept on disk.

## ✅ 2026-10-21 — @Sober: TASK-834 VERIFIED → DONE
- The built file, 3,736,541 bytes, served alone: 50 role-allowed renders · 0 errors · 0 dead.
- F4 reads "New Package after 1st Trial" and "Renew Course" exactly as written; RENEW stays in caps; no capitalised copy is left.
- **Next:** Team A's 19 pages are ready for Tanya's v3 captures → TASK-835 re-pins them.
