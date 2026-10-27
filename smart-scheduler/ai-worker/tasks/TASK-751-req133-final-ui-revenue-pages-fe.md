# TASK-751 — REQ-133: the final UI's REVENUE pages (6), CEO-only — FE, ≈ 2.4 d
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

## Pages (her v3 words)
1. **Revenue Summary**: by type (COURSE · 1st Trial · VOUCHER · ECA · SALES · F&B · RENT · OTHER) for Today / MTD / YTD; Refund (Expense); View → Detail; Add Manually.
2. **Detail**: Date · Branch · Type · Category · Description · Amount · Method · Remark; filters for branch, period (day / month / custom), type and category; "N items"; Total Revenue; Refund (Expense).
3. **Add Manually**: the full Type and Category list (no "manual" type); Date picker; Method; no page title.
4. **Refund**: From · Record · Period · Sep (Sales) / Oct (Refund) · Session · Type; Save; the course shows **CANCELLED**, its unattended sessions are cancelled and "families told"; a voucher refund works the same way.
5. **Type and Category**: the v3 tree (1st Trial is its own type, one category per activity; Other Course = Balance Camp / Birthday; RENT = EQUIPMENT / PARK).
6. **ECA Payment**: Student · Class / Term · Payment Date · Total Amount · Save · ECA Payment History; no "Counts as revenue on" line; no page title.

## 🔴 First, by Mon 11-02 (the deck embeds them)
- Revenue Summary + Detail.

## Implementation Notes

Fanta, 2026-10-27. Built in `som-balance-backoffice-spec/final-ui/` (only `src/pages/b/**`, `src/mock/b-*`; the shell, router, theme, roles untouched; no new package).
- **Checks:** `tsc --noEmit` 0 errors · `npm run build` OK → one `dist/index.html` (1.24 MB, gzip 425 kB) · 14 pages visited as CEO / Admin / Coach · 109 controls clicked on the CEO sweep · console: 0 errors, 0 warnings from the app (my first sweep's errors came from my own test dispatching a keyboard event on `document`; not the app) · at 375 px no page scrolls sideways (main = 375/375 on all 14).
- **Roles:** REVENUE (6) + All Report are `["ceo"]` only; STOCK (7) `["ceo","admin"]`; Coach sees none. Admin has no REVENUE / REPORTS menu at all. No `<Locked>` anywhere (hide, don't lock). Admin's Product page hides the COMMISSION column (a commission rate is pay, R0) — say if you'd rather show it; prices are shown (your ruling). Admin's STOCK OUT toast has no revenue and no total of commission is shown to anyone.
- **Not verified:** the built `dist/index.html` opened by double-click (checked on the dev server only); Thai text proof-reading by Khwan; the real mouse click path while the browser pane is hidden (Mantine transitions don't run then: modals "failed" to open only in that state, they open when the pane is visible).

**TASK-751 pages (6):** Revenue Summary (filters really filter; Period Day/Month/Custom switches the tab; Branch split exists for Today only, with a Thai note otherwise), Detail (filters: branch · period day/month/custom · type · category; N items; Total Revenue; Refund (Expense); View on the summary arrives pre-filtered by type), Add Manually (full Type/Category list, DateField, Method default Transfer), Refund (From · Record · Session; Save marks the course CANCELLED, 4 unattended sessions cancelled, families told; a Voucher works the same way), Type and Category (v3 tree + Add category dialog that adds to the screen), ECA Payment (Student · Class / Term · Payment Date · Total Amount = price × students × classes · History grows on Save).

**The numbers (declared, per your example):** per-item discount replaces the v3 bill discount. Today 16/10/26: COURSE 31,000 · 1st Trial 600 · VOUCHER 8,400 · ECA 36,000 · **SALES 3,510** (Miller skate 3,900 −10 % on that item) · **F&B 150** (Snack ×3, no discount; v3 had 135) · RENT 2,300 · OTHER 740 = **82,700** (v3 82,685; +15). MTD F&B 2,800→2,815 = **757,475**; YTD F&B 31,600→31,615 = **7,113,915**. Refunds −5,000 / −15,000 / −96,000 unchanged. STOCK OUT cart: Miller 3,510 + Snack 150 = **Price 3,660**; commission Kid 50 + Poo 50 unchanged by the discount (shown next to the discounted price). The defect line is on **14/10/26** (not Today): Balance bike 3,200 −400 ฿ = 2,800, commission lowered by hand 50 → 30 ฿, in Detail's remark. Children are invented Thai nicknames (น้องมะลิ, น้องภูมิ, น้องข้าวหอม, น้องใบบัว). Data in `src/mock/b-revenue.ts`, `b-stock.ts`; the deck can import `REV_DECK` (today/MTD/YTD totals + today by type).
- **Detail** holds 14/10–16/10 lines only (Today = 14 lines; day filter works); Month/Custom totals are the sum of the rows shown, with a small Thai note — they do NOT equal the typed MTD on the Summary (that would need ~700 rows).


## Questions

## Review

### ✅ Silver, 2026-10-27
- tsc 0 · `npm run build` OK, ONE `dist/index.html` (1.24 MB) · roles per `pages/b/index.ts` right · no `<Locked>`, no network, no item codes.
- Fixed after my review: the real staff names → the §2.8 map (the scan prints 0); Product's COMMISSION shown to the Admin (a rate, not pay; consistent with STOCK OUT); the "STOCK IN" title.
- Not verified by me: the built file opened by double-click (my pane can't open `file://`). It goes to Tanya's gate.
