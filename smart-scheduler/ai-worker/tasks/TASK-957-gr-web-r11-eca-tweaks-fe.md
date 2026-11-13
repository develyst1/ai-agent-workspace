# TASK-957 — FE: GR web round 11 — ECA Payment tweaks (ขวัญ 22:32) — @Flash (Team C, via Porter)

**From @Sober, 2026-11-12.** Source: `REQUEST-porter-to-sober-2026-11-12-gr-round-11-eca-tweaks.md`; her words are in CUSTOMER-ANSWERS l.410–415 (2026-11-12 22:32, `.private/line-20261112-223501.json`). Back-office feedback is free until 17 Nov.
Repo `SOM-BALANCE-Backoffice-spec/final-ui`, mock only, no git. **File: `b/revenue/EcaPayment.tsx` only.** The formulas from TASK-956 (in satang, half-up) stay as they are.

## 1. Mode defaults to «Amount includes VAT» [customer-asked]
On a new entry, and after Save resets the form. Existing rows keep their own mode.

## 2. A tick box for VAT and for WHT [customer-asked]
- One checkbox each, **ticked by default**, next to its % box. Unticked: that % box is disabled, the tax counts as 0 %, its result line shows `–` (not 0.00), and it is left out of Net received.
- **How the modes behave [SA-decided]:** the formulas simply run with v = 0 or w = 0. The modes that then mean nothing are **hidden**, never shown greyed:
  - **VAT unticked:** hide «Amount includes VAT». «Amount excludes VAT» reads as «Amount (no VAT)». If «includes VAT» was selected, switch to «excludes». Before VAT = Amount; VAT `–`; Total incl. VAT = Amount.
  - **WHT unticked:** hide «Amount is net after WHT». If it was selected, switch to the default («includes VAT» when VAT is ticked, else «excludes»).
  - **Both unticked:** only one mode is left, so the Mode select shows it, disabled. Net received = Amount.
  - **VAT unticked + net after WHT:** Before VAT = Amount ÷ (1 − w), and Net = Amount stays fixed, as now.
- Each history row stores its two ticks. Its Before VAT / Net received columns follow them.

## 3. A compact layout [customer-asked: «ทำให้กล่องสั้นลง»]
- **This form is an exception to rule 6** (one field per row; TASK-953). She asked for it in her own words, for this page. Note it at the top of the file in one comment. Other forms keep rule 6.
- Grid (`SimpleGrid cols={{ base: 1, sm: 3 }}`):
  - Row 1: School · Term · Status
  - Row 2: Price per class · Student · Class / Term
  - Row 3: Payment Date (only while Received) · Mode
  - Row 4: VAT ☐ + % · WHT ☐ + %
- **The results go in a summary card**, beside the form from `md` up (form ≈ 2/3, summary ≈ 1/3, `Grid`) and under it on small screens. The card holds: Total Amount, then Before VAT · VAT · Total incl. VAT · Withholding tax · Net received (label left, value right, 2 decimals). The «Proposed: to confirm» tag stays on Net received.
- Save stays at the bottom right of the form.
- **375 px:** one column, the summary under the form, no horizontal overflow.

## Done =
- `npx --yes --package typescript@5.6.3 tsc --noEmit` → 0 · build OK · no `ta="center"` · English only.
- Headless as CEO:
  - a new entry opens on «includes VAT»;
  - her 10,000 example still gives 9,345.79 / 654.21 / 10,000.00 / 280.37 / 9,719.63;
  - VAT unticked, 10,000 → Before 10,000.00 · VAT – · Total 10,000.00 · WHT 300.00 · Net 9,700.00, and «includes VAT» is not offered;
  - WHT unticked, includes VAT 10,000 → WHT – · Net 10,000.00, and «net after WHT» is not offered;
  - both unticked → one disabled mode, Net = Amount;
  - Mark received and the Status filter still work;
  - 1280 and 375 px have no overflow;
  - 0 console errors.
- If `audit-align.mjs` (Team B's rule-6 check) flags this form, name it in your Notes; I clear it as this TASK's exception.
- Screenshots: 1280 (form + summary side by side) and 375.

**Sober reviews → round-11 build → Otto → Tanya via Porter.** Her 2 ECA questions (revenue = before VAT? net = gross − WHT?) stay open with the «to confirm» tags.

## Questions
_(—)_

## Implementation Notes
### Flash (Team C) — 2026-11-12
File touched: `final-ui/src/pages/b/revenue/EcaPayment.tsx` only. tsc 0 · build OK · no `ta="center"` · no Thai characters left in the file (the two Thai comment words were changed to English).
- **1 Mode default:** a new entry, and the form after Save, open on «Amount includes VAT». Seed rows keep their own mode (excludes).
- **2 Tick boxes:** VAT and WHT each have a checkbox (ticked), with the % box beside it; unticked disables the % box. The formulas run with 0 %. The result line shows `–` for VAT / Withholding tax (Net received is still a number). Modes that no longer apply are removed from the select, not greyed:
  - VAT off: «includes VAT» is gone; «excludes» reads «Amount (no VAT)»; a selected «includes» switches to «excludes».
  - WHT off: «net after WHT» is gone; a selected «net» switches to the default.
  - Both off: one mode left, shown and disabled. Net = Amount.
  - VAT off + net: Before VAT = Amount ÷ (1 − w) (10,000 → 10,309.28), Net fixed.
  - Each history row stores `vatOn` / `whtOn`; its Before VAT / Net received follow them (a VAT-off, WHT 3 %, 10,000 row shows 10,000.00 / 9,700.00).
- **3 Layout:** form and summary card side by side from `md` (8 / 4 columns), summary under the form below `md`. Form = Mantine `Grid` with 4-column cells (3 per row), not `SimpleGrid`, so Mode can take two cells while Payment Date is shown and VAT · WHT always land together on row 4; while Pending, Mode · VAT · WHT share row 3. The «Proposed: to confirm» tag stays on Net received. Save is bottom-right of the form card. The rule-6 exception is noted in one comment at the top of the file. The Pending hint («No Payment Date yet…») moved from the Status description to a line under the grid, so Status stays level with School and Term.
- `audit-align.mjs`: not found in `final-ui` or in `smart-scheduler`, so I could not run it. This form is the one rule-6 exception.
- **Evidence** (`evidence/TASK-957/`): `check-957.mjs` → `r11-run.json`, **32 PASS / 0 FAIL**, 0 console errors, no network requests. It covers: default mode; 10,000 example (9,345.79 / 654.21 / 10,000.00 / 280.37 / 9,719.63); VAT off (10,000.00 · – · 10,000.00 · 300.00 · 9,700.00, no «includes»); WHT off (– · 10,000.00, no «net»); both off (one disabled mode); the fall-backs; row layout (3 · 3 · 2 · 2); history row; reset after Save; Mark received; Status filter; 1280 side by side; 375 one column, summary under the form; no horizontal overflow at either width. Screenshots `r11-1280-ceo-eca-form-summary.png`, `r11-375-ceo-eca-form-summary.png`.
- Not changed: the formulas, the history table, the Mark received / Delete modals, the revenue-total footer.

## Review
- **Sober, 2026-11-12: ✅ DONE.**
  - Re-run: tsc 5.6.3 → 0 · 0 `ta="center"` · `MENU_ACCESS_HELD = false`.
  - `r11-1280-ceo-eca-form-summary.png`: 3 · 3 · 2 · 2 grid (School · Term · Status / Price · Student · Class / Payment Date · Mode / VAT ☐ % · WHT ☐ %), Save bottom-right; the summary card on the right reads 10,000 → 9,345.79 / 654.21 / 10,000.00 / 280.37 / 9,719.63, with the tag on Net received. Default mode «Amount includes VAT».
  - Flash's 32/0 covers the tick-box cases, including the hidden modes and the fall-backs.
  - **`audit-align.mjs`** (Flash could not find it: it lives in `SOM-BALANCE-Backoffice-spec/tests/evidence/task-936/`). Run by me on the round-11 build: **60 PASS / 0 FAIL**, 0 console/network. It audits Team B's pages only, so ECA is not in it. The rule-6 exception here stands as this TASK states.
  - Using `Grid` instead of `SimpleGrid` (so Mode can span two cells) is accepted.
  - Security review: none (mock only).
- **Round 11 built:** md5 `6e26e1cc577ec3971cb865b911d25ffd`. → Otto.
- **Round 11: Tanya PASS (TEST-151 § GR round 11), via Porter 2026-11-12.**
- **Queued for the next GR round [PM-decided, not blocking]: O-151-11a.** At 375 px the History table's Status badges are cut («Pend…», «Recei…») and Term wraps («Term / 3»). Fix in `EcaPayment.tsx` (Flash): give the table a `minWidth` inside its `Table.ScrollContainer` so it scrolls in its own box instead of squeezing, and `nowrap` on the Status and Term cells. Done = at 375 px the badges read in full, Term stays on one line, and there is still no page overflow. It goes with the next round's TASK; this file only holds it.
