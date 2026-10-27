# TASK-752 — REQ-133: the final UI's STOCK pages (7), incl. the STOCK OUT cart — FE, ≈ 3.6 d
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
1. **Product**:
   - CATEGORY before PRODUCT NAME, the headers ALL CAPS, COMMISSION (not "group");
   - QUANTITY + LOCATION columns and a Location filter.
2. **STOCK IN**: product + qty + a date picker; "Bravo"; Save; no "Receive goods" title.
3. **Import from Excel**:
   - Updated Item · New Item Added · Apply;
   - "Products that are not in the file are kept, with their history." plus her Thai line, verbatim: «สินค้าที่ไม่ได้ถูกเปลี่ยนแปลงจะยังคงข้อมูลเดิม».
4. 🔴 **STOCK OUT (a cart):**
   - several items, each with qty and **its OWN discount (฿ or %)**, so there is NO bill discount;
   - Student (picked from the system) or Other Customer; Price; Method (default Transfer);
   - a **Commission** picker INSIDE the form, an obvious labelled multi-select (REQ-122 §6). The split table is the result;
   - **commission edited PER ITEM, lower or raise** (her v3 answer B + A);
   - the commission picker stays as a record (Porter's default).
   - Show by example that the discount does NOT reduce the commission ("หากมีส่วนลด ค่าคอมยังเท่าเดิม").
5. **Stock Demo**:
   - Bravo is the leftmost column, the location order is settable; Add Location; Delete (history kept, with a reason); Total; From → To;
   - "Defect Product → Demo"; no time on dates.
6. **Low Stock**: Setting · Alert (Unit) · Balance Stock · Balance · Save; per location; the recipients are chosen one by one (London + พี่ฟีน); Monday dd/mm/yy.
7. **Stock Report**: Sales History · Balance (every location, with a picker) · Movement; Search; Customer; Type.

## 🔴 First, by Mon 11-02 (the deck embeds it)
- STOCK OUT.

## Implementation Notes

Fanta, 2026-10-27. Built in `som-balance-backoffice-spec/final-ui/` (only `src/pages/b/**`, `src/mock/b-*`; the shell, router, theme, roles untouched; no new package).
- **Checks:** `tsc --noEmit` 0 errors · `npm run build` OK → one `dist/index.html` (1.24 MB, gzip 425 kB) · 14 pages visited as CEO / Admin / Coach · 109 controls clicked on the CEO sweep · console: 0 errors, 0 warnings from the app (my first sweep's errors came from my own test dispatching a keyboard event on `document`; not the app) · at 375 px no page scrolls sideways (main = 375/375 on all 14).
- **Roles:** REVENUE (6) + All Report are `["ceo"]` only; STOCK (7) `["ceo","admin"]`; Coach sees none. Admin has no REVENUE / REPORTS menu at all. No `<Locked>` anywhere (hide, don't lock). Admin's Product page hides the COMMISSION column (a commission rate is pay, R0) — say if you'd rather show it; prices are shown (your ruling). Admin's STOCK OUT toast has no revenue and no total of commission is shown to anyone.
- **Not verified:** the built `dist/index.html` opened by double-click (checked on the dev server only); Thai text proof-reading by Khwan; the real mouse click path while the browser pane is hidden (Mantine transitions don't run then: modals "failed" to open only in that state, they open when the pane is visible).

**TASK-752 pages (7):** Product (CATEGORY before PRODUCT NAME, ALL-CAPS headers, COMMISSION, QUANTITY + LOCATION, category tabs, Location filter, Add product / Add category / Add Location dialogs that really add), Stock In (DateField, Bravo, Save raises the shown balance), Import from Excel (Updated Item · New Item Added · Not in the file + her Thai line verbatim «สินค้าที่ไม่ได้ถูกเปลี่ยนแปลงจะยังคงข้อมูลเดิม»), **STOCK OUT** (cart; each line has its OWN discount ฿/%, no bill discount; Student or Other Customer; Payment default Transfer; the Commission picker is INSIDE the form, directly under the items and visible without scrolling at 1280×800; commission edited per item, lower or raise; Thai line «หากมีส่วนลด ค่าคอมยังเท่าเดิม»; role-aware toast), Stock Demo (Bravo leftmost; Move A → B, Delete with a reason and history kept, Defect Product → Demo, Add Location, Location Order; History has dates only, no times), Low Stock (Setting · Alert (Unit) · Balance Stock · Balance · Save; recipients picked one by one: London + พี่ฟีน; Monday dd/mm/yy), Stock Report (Sales History · Balance with a Location picker · Movement; Search; Customer; Type).

**The numbers (declared, per your example):** per-item discount replaces the v3 bill discount. Today 16/10/26: COURSE 31,000 · 1st Trial 600 · VOUCHER 8,400 · ECA 36,000 · **SALES 3,510** (Miller skate 3,900 −10 % on that item) · **F&B 150** (Snack ×3, no discount; v3 had 135) · RENT 2,300 · OTHER 740 = **82,700** (v3 82,685; +15). MTD F&B 2,800→2,815 = **757,475**; YTD F&B 31,600→31,615 = **7,113,915**. Refunds −5,000 / −15,000 / −96,000 unchanged. STOCK OUT cart: Miller 3,510 + Snack 150 = **Price 3,660**; commission Kid 50 + Poo 50 unchanged by the discount (shown next to the discounted price). The defect line is on **14/10/26** (not Today): Balance bike 3,200 −400 ฿ = 2,800, commission lowered by hand 50 → 30 ฿, in Detail's remark. Children are invented Thai nicknames (น้องมะลิ, น้องภูมิ, น้องข้าวหอม, น้องใบบัว). Data in `src/mock/b-revenue.ts`, `b-stock.ts`; the deck can import `REV_DECK` (today/MTD/YTD totals + today by type).
- **Detail** holds 14/10–16/10 lines only (Today = 14 lines; day filter works); Month/Custom totals are the sum of the rows shown, with a small Thai note — they do NOT equal the typed MTD on the Summary (that would need ~700 rows).


**Review fixes 10-27 (Silver):** (1) real staff names swapped to the invented map (grep 0 hits); (2) **decision: the Admin DOES see the COMMISSION column on Product** (the product's commission rate, not a coach's pay; consistent with STOCK OUT; an Admin never sees a coach's total) — this replaces my earlier hide; (3) page + menu title "STOCK IN" (her v3 note p.25). tsc 0; build OK 1.24 MB; the BUILT file served by `vite preview` (file:// can't be opened in my pane): 14 pages open, console empty.

## Questions

## Review

### ✅ Silver, 2026-10-27
- tsc 0 · `npm run build` OK, ONE `dist/index.html` (1.24 MB) · roles per `pages/b/index.ts` right · no `<Locked>`, no network, no item codes.
- Fixed after my review: the real staff names → the §2.8 map (the scan prints 0); Product's COMMISSION shown to the Admin (a rate, not pay; consistent with STOCK OUT); the "STOCK IN" title.
- Not verified by me: the built file opened by double-click (my pane can't open `file://`). It goes to Tanya's gate.
