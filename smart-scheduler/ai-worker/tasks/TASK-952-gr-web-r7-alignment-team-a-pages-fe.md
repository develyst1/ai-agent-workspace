# TASK-952 — FE: GR web round 7a — one alignment rule on Team A's pages — @Fern (Team A)

**From @Sober, 2026-11-12.** Source: ขวัญ (CUSTOMER-ANSWERS 2026-11-12 03:15, ledger 28): "every page … some left, some right". Porter 03:29. **The rule is `RULE-2026-11-12-gr-web-alignment.md` (7 lines). Read it first.** It is my proposal; Silver may amend it through Porter. If he does, I amend this TASK, and the change will be small. Start now; don't wait. Repo `SOM-BALANCE-Backoffice-spec/final-ui` (mock only, not a git repo, so no git). Size about 0.5 d.

## Your files (closed list)
- `src/pages/a/salary/{PayRun, Slip, SlipView}.tsx`
- `src/pages/a/frontoffice/{Branch, ConfirmCamp, Conversion, ParkRent, Payment, RoleSetting, UserSetting}.tsx`
- `src/pages/a/notify/{NotifyAlert, NotifySettings}.tsx`: keep the words Fanta set in round 5 #9 («Visible», no «In the web»). Change alignment only.
- Not yours: the other `a/salary/*` pages (Fanta), `a/salary/parts.tsx` (shared; ask me first), `src/shell/*` (mine), `b/*`, `proposed/*`.
- **`MENU_ACCESS_HELD` stays `true`** in UserSetting.

## What to do
On each page apply rules 1–7: numeric columns right (header + cells) · totals in their column · `fmtBaht` + `tabular-nums` · Action column last + right · label/value boxes as label-left, value-right rows · forms one column, Save/Cancel bottom-right · actions in `PageHeader`. Change **layout only**: no words, data or behaviour. Payment Detail (`Slip`/`SlipView`) already shows 2-decimal satang; keep its format and only align it.

## Done = (evidence in `## Implementation Notes`)
- **Step 0 (write first):** per page, the list of what was off (e.g. "PayRun: Total column left-aligned") → what you changed.
- `npx --yes --package typescript@5.6.3 tsc --noEmit` → 0 · `vite build` OK (scratch outDir) · Thai scan: no new Thai.
- Headless, through the real «Viewing as» dropdown, as CEO, plus admin where the page allows it:
  - on each of your pages, every numeric `th`/`td` computes `text-align: right`, and every text column left;
  - every form dialog is one column (no two inputs on one row except a From/To pair);
  - 375px: no horizontal overflow;
  - 0 console errors.
- Screenshots in `tests/evidence/task-952-fern/`: Monthly Payment, Payment Detail, User Setting, one front-office page with a form.
**Sober reviews.** No git.

## Questions
_(—)_

## Implementation Notes
**Fern, 2026-11-12. Layout only: no words, data or behaviour changed, except the «Action» header the rule asks for on two tables (rule 4).**

**Step 0: what was off → what I changed** (rules 1–7; every table also got `className="tabular-nums"` on the `Table`, rule 3)
- **PayRun:** Run · Lock · Unlock (+ «Proposed» tag) · Export CSV sat in the card body above the table (rule 7) → moved into `PageHeader` (shown only when a period exists); the action column header was empty → «Action», right (rule 4); the empty-state text was centred → left. Base/Net/Total already right and the Total row already in its column.
- **Slip:** the «Add an Other ±» form was capped at 360 px and its Add button sat left → full width, Add bottom-right (rule 6).
- **SlipView:** «Subtotal» was a free-floating `Text` in the card header (rule 2) → a last table row, amount in the same right-aligned cell as the lines above.
- **UserSetting:** only the empty-state centring dropped (the table, Action column and dialog already fit).
- **RoleSetting:** Name/Nickname sat side by side (a 2-column grid; not a From/To pair) → one column.
- **Branch / ParkRent:** the form was a 2-column grid → one column, label above, full width; Save/Cancel unchanged bottom-right.
- **ConfirmCamp (dialog) / Payment (Edit dialog):** «Date received» + «Amount» shared a row (`Group grow`) → one column.
- **Payment:** «Add an installment» sat in a card header above the table → `PageHeader`; the Save column header was empty → «Action» right; the «#» (installment number) column was left → right, header + cells (a count; rule 1 literal).
- **Conversion:** the Special Case box mixed inline and stacked → rows, label left / value right (the text «1st Coach :» is unchanged).
- **NotifyAlert:** «No notifications» was centred in a table cell → left. **NotifySettings:** all text columns, nothing to move.
- Not changed on purpose: `Conversion` «Change coach mid-course» and `ConfirmCamp` «Edit schedule / To Confirm Camp» stay inside their cards (they sit bottom-right / on one card, not above a table); `MENU_ACCESS_HELD` stays `true`; `parts.tsx` and `src/shell/*` untouched. Wider note: the Add Other ± form is now card-wide because rule 6 says «full width»; say if you want a cap.

**Evidence** (scratchpad `fui-952.mjs`, headless Playwright, viewer switched through the real «Viewing as» dropdown)
- `tsc --noEmit` (typescript 5.6.3) → 0 · `vite build` (scratch outDir) → OK · Thai scan: no Thai added (the existing «น้อง…» mock names and `notify()` Thai toasts untouched).
- As **CEO**: PayRun, Slip, UserSetting, RoleSetting, Branch, Payment, Conversion, ParkRent, ConfirmCamp, NotifySettings, NotifyAlert: every numeric `th`/`td` computes `text-align:right`, no text cell right/centred, every header matches its column's alignment. As **Admin (Khwan)**: Branch, Payment, RoleSetting, NotifyAlert: same checks pass.
- Forms one column (no two inputs on one row): the page forms (Slip Add, RoleSetting, Branch, ParkRent) and the dialogs (Lock, Accept Login, Payment Edit, To Confirm Camp) all pass.
- PayRun checks: Run/Lock/Export CSV above the card; «Action» last + right; Total amounts in the Base/Net columns. Slip: Subtotal in the amount column; Add button right.
- 375 px: no horizontal overflow on all 11 pages. Console errors/warnings: 0.
- Screenshots `tests/evidence/task-952-fern/`: `fui-952-1-monthly-payment.png`, `-2-payment-detail.png`, `-3-user-setting.png`, `-4-role-setting-form.png`, `-5-payment-method.png`, `-6-monthly-payment-375.png`.
- No git. unhandled-between-tests: 0.

## Review (Sober, 2026-11-12) — ✅ DONE
Re-ran: tsc 5.6.3 → 0 · `MENU_ACCESS_HELD = true` (UserSetting:15) · no `ta="center"` left in the 12 files · `tabular-nums` on every page that has a table (Slip/Branch/ConfirmCamp have no table). Rendered: `fui-952-1-monthly-payment.png` shows Run/Lock/Export CSV in the header, Base/Net right with the Total row in those columns, and «Action» last, right. `fui-952-2-payment-detail.png` shows every amount right, and each Subtotal is now a table row in the amount column. Step 0 is complete and layout-only. The two «Action» headers fall under rule 4, accepted. Judgement call: the Add Other ± form at card width is fine, no cap (rule 6). Headless check passed: CEO on 11 pages, plus Admin on 4; 375px; 0 console errors. Security review: none (mock-only).
