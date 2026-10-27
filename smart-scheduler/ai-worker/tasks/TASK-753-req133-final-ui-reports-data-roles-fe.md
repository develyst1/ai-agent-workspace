# TASK-753 — REQ-133: the final UI's REPORTS page + Team B's typed mock data + role visibility — FE, ≈ 1.3 d (+ 0.5 d Tanya-fix buffer)
- Source: REQ-133 · Silver's plan (inbox/PM.md 10-27) · Porter GO 2026-10-27
- Status: ✅ DONE 2026-10-27 (Silver review) → ready for QA (Tanya's gate) · no git
- Assignee: @Fanta · From: @Silver (2026-10-27)
- **Repo / folder:** `som-balance-backoffice-spec` → `final-ui/` (Sober's Vite + React + TS + Mantine shell, TASK-843). **Build only inside the shell's page / data slots its contract names.** The shell, router, theme and role context are Team A's: run → list → ask before touching them.
- **The rules for every page:**
  - no backend, no network calls; it opens offline from the static build;
  - realistic mock data with Thai names and no real children's names;
  - every v3 word of Khwan's applied exactly (REQ-122 §7.1, §7.4, §9, §10; verbatim `project-docs/customer-2026-10-22-backoffice-prototype-v3/khwan-answers-v3-full-2026-10-25-VERBATIM.md`);
  - dates are dd/mm/yy (16/10/26) with NO times; FT / PT / FL are written in full;
  - a row a role can't see is HIDDEN, never marked "hidden";
  - every button does something (a dialog, a filter, a toast), with no dead buttons.
- **Carry-over:** plain React components + Mantine + a typed data import. No Vite-only APIs, so the page moves into the Next.js build nearly as-is.
- **Source to port:** the v3 Team B pages in `som-balance-backoffice-spec/pages/b-revenue|b-stock|b-reports/` + `data/b-revenue.js`, `data/b-stock.js`.
- **Done when:** `tsc` 0 · the build 0 errors · 0 console errors on every page of mine · Silver's review · then Tanya's gate (REQ-133 §Constraints). No git: only on the owner's word.

## Build
1. **The data (first):** port `data/b-revenue.js` + `data/b-stock.js` into typed TS modules in the shell's data slot.
   - Thai mock names only; the totals stay hand-typed and must ADD UP (check them by eye, as in v3).
   - **Fix the stale v3 remark** "bill discount 10 % already taken off" → a per-item discount.
   - The Revenue numbers the deck's "how it's used" section shows come from HERE. Export them by name for Sober's deck.
2. **All Report**: the 6 headings REPORT · STOCK · CHECK IN · COURSE · SALARY · STUDENT, each marked "content agreed when this part starts" (Porter's default).
3. **Role visibility (with the shell's role context):**
   - **CEO** sees all of my pages;
   - **Admin** has no REVENUE menu at all, and STOCK OUT shows the commission entry for that sale only, never a total;
   - **Coach** sees none of my pages.
   - Hidden, never "🔒".

## Implementation Notes

Fanta, 2026-10-27. Built in `som-balance-backoffice-spec/final-ui/` (only `src/pages/b/**`, `src/mock/b-*`; the shell, router, theme, roles untouched; no new package).
- **Checks:** `tsc --noEmit` 0 errors · `npm run build` OK → one `dist/index.html` (1.24 MB, gzip 425 kB) · 14 pages visited as CEO / Admin / Coach · 109 controls clicked on the CEO sweep · console: 0 errors, 0 warnings from the app (my first sweep's errors came from my own test dispatching a keyboard event on `document`; not the app) · at 375 px no page scrolls sideways (main = 375/375 on all 14).
- **Roles:** REVENUE (6) + All Report are `["ceo"]` only; STOCK (7) `["ceo","admin"]`; Coach sees none. Admin has no REVENUE / REPORTS menu at all. No `<Locked>` anywhere (hide, don't lock). Admin's Product page hides the COMMISSION column (a commission rate is pay, R0) — say if you'd rather show it; prices are shown (your ruling). Admin's STOCK OUT toast has no revenue and no total of commission is shown to anyone.
- **Not verified:** the built `dist/index.html` opened by double-click (checked on the dev server only); Thai text proof-reading by Khwan; the real mouse click path while the browser pane is hidden (Mantine transitions don't run then: modals "failed" to open only in that state, they open when the pane is visible).

**TASK-753:** the typed data is ported to TS (`b-revenue.ts`, `b-stock.ts`; totals hand-typed and added up by eye in comments). The stale v3 remark "bill discount 10 % already taken off" is replaced by the per-item one. All Report: the six headings (REPORT · STOCK · CHECK IN · COURSE · SALARY · STUDENT), each marked "Content agreed when this part starts"; each card toasts. Roles are as above.

**The numbers (declared, per your example):** per-item discount replaces the v3 bill discount. Today 16/10/26: COURSE 31,000 · 1st Trial 600 · VOUCHER 8,400 · ECA 36,000 · **SALES 3,510** (Miller skate 3,900 −10 % on that item) · **F&B 150** (Snack ×3, no discount; v3 had 135) · RENT 2,300 · OTHER 740 = **82,700** (v3 82,685; +15). MTD F&B 2,800→2,815 = **757,475**; YTD F&B 31,600→31,615 = **7,113,915**. Refunds −5,000 / −15,000 / −96,000 unchanged. STOCK OUT cart: Miller 3,510 + Snack 150 = **Price 3,660**; commission Kid 50 + Poo 50 unchanged by the discount (shown next to the discounted price). The defect line is on **14/10/26** (not Today): Balance bike 3,200 −400 ฿ = 2,800, commission lowered by hand 50 → 30 ฿, in Detail's remark. Children are invented Thai nicknames (น้องมะลิ, น้องภูมิ, น้องข้าวหอม, น้องใบบัว). Data in `src/mock/b-revenue.ts`, `b-stock.ts`; the deck can import `REV_DECK` (today/MTD/YTD totals + today by type).
- **Detail** holds 14/10–16/10 lines only (Today = 14 lines; day filter works); Month/Custom totals are the sum of the rows shown, with a small Thai note — they do NOT equal the typed MTD on the Summary (that would need ~700 rows).


## Questions

## Review

### ✅ Silver, 2026-10-27
- tsc 0 · `npm run build` OK, ONE `dist/index.html` (1.24 MB) · roles per `pages/b/index.ts` right · no `<Locked>`, no network, no item codes.
- Fixed after my review: the real staff names → the §2.8 map (the scan prints 0); Product's COMMISSION shown to the Admin (a rate, not pay; consistent with STOCK OUT); the "STOCK IN" title.
- Not verified by me: the built file opened by double-click (my pane can't open `file://`). It goes to Tanya's gate.
