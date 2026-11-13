# TASK-978 — FE: GR web round 13 — ขวัญ's Feedback 13/11, Team B part — @Fanta

**From @Silver (SA-B), 2026-11-13.** Source: `REQUEST-porter-to-sober-2026-11-13-gr-round-13-feedback-1311.md` (items 1, 2, 3, 9; Sober's § Answer → Team B slice).
Repo `SOM-BALANCE-Backoffice-spec/final-ui` (path: `machine.local.md` → som-balance-backoffice-spec), **mock only, no git, no backend**. Team A (TASK-976, Fern) and Team C (Flash) do their own items in the same round. Rules: `RULE-2026-11-12-gr-web-alignment.md` (all 7 still apply, rule 6 amended in §4 below).
Status: TODO · Owner: Fanta (FE-B) · Depends on: nothing.

## 1. People / Person: «Base Salary», and the column nearer the left [customer-asked, item 1: "Base + Net ขยับซ้าย หน่อยค่ะ จัดแถวให้เท่าๆกัน"]
`src/pages/a/salary/People.tsx` l.38–50, `src/pages/a/salary/Person.tsx` l.31.
- Label «Base salary» → **«Base Salary»** in both files (People l.43, Person l.31). Comments may stay.
- People, CEO view: keep the column ORDER; change the shares so Base Salary sits nearer Name:
  **Name 18% · Type 22% · Vehicle 10% · Base Salary 14% · Merit 24% · Action 12%** (today 16 · 26 · 14 · 14 · 20 · 10). Base Salary stays `ta="right"` (rule 1).
  - If a Type cell's badges wrap at 1280 with 22%, move 2% from Merit to Type; note it in Implementation Notes.
- Admin view (names only) is unchanged.

## 2. Daily: the Hour column nearer Role [customer-asked, item 3: "ขยับ Hour ออกมาซ้าย จัดสมดุลแถวเหมือนเดิม"]
`src/pages/a/salary/Daily.tsx` l.61–71. Together with §3's new Action column, the shares become:
**Coach 18% · Role 14% · Hour 10% · Description 28% · Daily Income 16% · Action 14%**. Hour and Daily Income stay right-aligned; the Total row keeps its cells under the same columns (rule 2; add an empty `Td` for Action).

## 3. Daily: open a row's detail, and Edit (CEO) [customer-asked, item 2: "กดเข้าไปดูรายละเอียดด้วยได้ไหม ว่าชั่วโมงสอนใครไปบ้าง และ edit ได้ไหม บางกรณีถ้าค่าสอนผิด"]
The page is CEO-only already (`shell/grants.ts` l.16, `/salary/daily` is never grantable), so no new permission check.
- **Open:** a last column «Action» (`ta="right"`, rule 4) with a `compact-sm` light button **«View»**; clicking the row does the same (`cursor: pointer`). The Total row has no button.
- **Detail = a `Modal`** titled `«{coach} · {dd/mm/yy} ({weekday})»`:
  - a table **Time · Class · Hours · Students** (Hours right-aligned), one row per class that coach taught that day. Students = the learners' names, comma-separated (a Group class lists several).
  - under it, a label/value list (rule 5): **Role** · **Total Hours** · **Daily Income** (`fmtBaht`, or «— (in monthly salary)» when `income === null`) · **Description** (as on the row).
- **Edit** button in the Modal footer (right-aligned, rule 6) → the same Modal switches to a form, one field per row:
  - **Hours** (`NumberInput`, ≥ 0, step 0.5);
  - **Daily Income** (`NumberInput`, ≥ 0, whole baht): **shown only when the row has an income** (`income !== null`). A Full-time row with no daily income edits Hours only [SA-decided: their pay is the monthly salary; cheap to reverse];
  - **Reason** (`Textarea`, **required**);
  - **Save** disabled until Reason is non-blank AND a value changed; **Cancel** returns to the detail without change.
- **After Save:** the row shows the new values plus an **«Edited»** badge (light, orange) next to the coach name; the Total row follows (it sums the edited values); the detail shows one line «Edited by CEO · {reason}». Keep edits in page state keyed `day|coach` (lost on reload: it is a mock), and `notify("Saved (example)")`.
- **Mock data:** a NEW file `src/mock/b-daily-detail.ts` exporting `DAILY_CLASSES: Record<string, { time: string; cls: string; hours: number; students: string[] }[]>` keyed `"{YYYY-MM-DD}|{coach}"`, one entry for **every** row of `DAILY_7` (`mock/a-salary-b.ts` l.24 on; days 13/14 come from `DAILY`). Each entry's class hours **sum to that row's `hours`**; class types follow the row's description where it names one (ECA / Private / Group / Extra Hour). Made-up English first names for students. Do NOT edit `a-salary-b.ts` or `a-salary.ts`.
- The real behaviour (a pay correction with reason + audit, the slip following) is **not** in this TASK: it goes to Porter's ledger as BIG (Sober's estimate, ~2–3 d, own SPEC).

## 4. STOCK IN / STOCK OUT: short fields are short [customer-asked, item 9: "ถ้าเนื้อหาไม่ได้เยอะ ตัดช่องสั้นลงได้ไหม อย่างช่องวันที่กดซ้ายสุดแต่ขึ้นวันที่ขวาสุด" · "ทั้ง stock out + in"]
**Rule 6 amended [customer-asked, Silver agrees with Sober's wording]:** one field per row, label above — **full width only for long text; short fields get a short input.** Sober writes it into the RULE file.
- `src/pages/b/stock/StockIn.tsx` l.42–65: Product stays full width (its label is `code · name`, long). **Quantity `maw={240}`**, **Date `maw={240}`**. Update the l.40 comment.
- `src/pages/b/stock/StockOut.tsx` l.257–261: **Student `maw={360}`**, **Other Customer `maw={360}`**, **Branch `maw={240}`**, **Payment `maw={240}`**; Remark (`Textarea`) and «Coaches who sold» (`MultiSelect`) stay full width. The items table's inline inputs are already narrow: leave them. Update the l.256 comment.
- The date «shows where it is clicked» follows from the short box: the value and the calendar open under the click. **Do not edit `shell/helpers.tsx` `DateField`** (shared).

**Files (closed list):** `src/pages/a/salary/People.tsx` · `src/pages/a/salary/Person.tsx` · `src/pages/a/salary/Daily.tsx` · `src/pages/b/stock/StockIn.tsx` · `src/pages/b/stock/StockOut.tsx` · NEW `src/mock/b-daily-detail.ts`. Nothing else (not `parts.tsx`, not `shell/*`, not other mocks).

## Done = (paste the command + output in Implementation Notes)
- `npx --yes --package typescript@5.6.3 tsc --noEmit` → 0 · `npm run build` OK · `grep -c 'ta="center"'` on the 5 pages → 0 each · English only on screen.
- A small check (node script or headless) that every `DAILY_7` row has a `DAILY_CLASSES` entry whose hours sum to the row's hours → paste «N rows, 0 mismatches».
- Headless as CEO at 1280:
  - People: the Base Salary header's right edge as % of the table width (paste x; today ≈ 70%, target ≤ 65%); numeric `th`/`td` compute `text-align: right`; no Type cell wraps.
  - Daily: Hour header's right edge ≤ 45% of the table width (paste x); open a row → the Modal lists classes; Edit a Part-time/Freelance row (change Daily Income, Reason filled) → the row shows «Edited» and the Total changes by the difference; Save is disabled with a blank Reason; a Full-time row's Edit shows no Daily Income field.
  - StockIn: Quantity and Date input widths ≤ 240 px; StockOut: Branch and Payment ≤ 240 px, Student and Other Customer ≤ 360 px, Remark full width.
  - 375 px: no page overflow on all 4 pages (People, Daily, StockIn, StockOut); 0 console errors.
- Screenshots: People 1280 · Daily 1280 with the Modal open (detail) · Daily after an edit · StockIn 1280 · StockOut 1280 (bottom fields).

**Silver reviews → Sober's round-13 build (with A and C) → Otto → Tanya via Porter.**

## Questions
_(—)_

## Implementation Notes

## Review

### Implementation Notes — Fanta · 2026-11-13 (final-ui, mock only; no git)
**Files (the closed list, nothing else):** `People.tsx` · `Person.tsx` · `Daily.tsx` · `StockIn.tsx` · `StockOut.tsx` · NEW `src/mock/b-daily-detail.ts`. (`dist/` was rebuilt by `npm run build`, as the DoD asks.)
- **§1** «Base Salary» in People + Person. People CEO shares 18 · 22 · 10 · 14 · 24 · 12 (Admin view untouched).
- **§2** Daily shares 18 · 14 · 10 · 28 · 16 · 14; the Total row has an empty `Td` under Action.
- **§3** Daily: «View» button (compact-sm, light, right-aligned) + click on the row → Modal `«{coach} · {dd/mm/yy} ({weekday})»`: Time · Class · Hours · Students table, then Role · Total Hours · Daily Income («— (in monthly salary)» when null) · Description. Edit in the footer → Hours (step 0.5, ≥ 0, 240 px), Daily Income (whole baht, only when the row has one), Reason (required, full width); Save off until Reason is non-blank AND a value changed; Cancel returns to the detail. After Save: «Edited» badge (orange) by the coach, Total follows, detail line «Edited by CEO · {reason}», `notify("Saved (example)")`. State keyed `day|coach`; lost on reload. Class rows in the detail stay the example classes (the edit changes the row's hours/income, not the class list).
- **§4** StockIn: Quantity + Date `maw={240}`; StockOut: Student + Other Customer `maw={360}`, Branch + Payment `maw={240}`; Remark and «Coaches who sold» full width. `shell/helpers.tsx` untouched (DateField passes `maw` through).

**Evidence**
- `npx --yes --package typescript@5.6.3 tsc --noEmit` → exit 0 · `npm run build` → ✓ built · `grep -c 'ta="center"'` on the 5 pages → 0, 0, 0, 0, 0.
- Mock check (bun script): **«19 rows, 0 mismatches»** (every `DAILY_7` row has a `DAILY_CLASSES` entry whose hours sum to the row's hours; 19 entries).
- Headless (vite dev, browser pane) as CEO at 1280:
  - People: Base Salary header right edge **64 %** of the table (target ≤ 65); numeric `th`/`td` compute `text-align: right`.
  - People Type cell: **Ton's row (two long badges «Part-time · Sat–Sun» + «Freelance · Mon–Fri», 131 + 133 px) wraps to two lines.** It needs ≈ 31 % of the table to fit one line; the old 26 % did not fit it either, so this is not new and moving 2 % from Merit to Type would not cure it. Shares left as specified. Every other Type cell is one line. Silver: say so if you want 31 % Type.
  - Daily: Hour header right edge **42 %** (≤ 45); View opens the detail (Pete 14/10: 4 classes listed); Edit Pete (Daily Income 700 → 1,000, Reason «Rate was entered wrong») → «Edited» badge on Pete only, Total **1,350 → 1,650 ฿** (+300 = the difference), detail line shown, toast «Saved (example)»; Save disabled on open and with a blank Reason, enabled once the Reason is filled; a Full-time row with no income (May, 12/10) → Edit shows **no Daily Income field**.
  - StockIn: Quantity 240 px, Date 240 px (Product 942 px). StockOut: Branch 240, Payment 240, Student 360, Other Customer 360, Remark 932 (full width).
  - 375 px: no horizontal overflow on People, Daily, StockIn, StockOut; console errors: none.
- **Screenshots:** I looked at People/Daily (list, detail Modal, form, after-edit)/StockOut in the browser pane but did NOT save image files; Tanya/Silver can reproduce with the steps above. Say if you want files.

### Review — Silver (SA-B) · 2026-11-13 · ✅ DONE
- Re-ran: `tsc --noEmit` → 0. Read back: «Base Salary» People l.43 / Person l.31; StockIn `maw={240}` l.56 / l.66; StockOut Student/Other 360, Branch/Payment 240 (l.257–260), Remark untouched; Daily shares 18·14·10·28·16·14 (l.106–117); Save gate l.56 needs a trimmed Reason AND a change; Full-time rows edit Hours only (`hasIncome`). Files: mtimes 15:16–15:20 only on the closed list + the new mock; `a-salary-b.ts` not touched by this TASK.
- Evidence matches every DoD line: People 64 % (≤ 65), Daily Hour 42 % (≤ 45), +300 ฿ total after edit, 19 rows 0 mismatches, 375 px no overflow, 0 console errors.
- **Ton's Type wrap: accepted as is [SA-decided].** It wrapped before (26 %); fitting it needs ≈ 31 %, which would push Base Salary back to ≈ 73 % and undo item 1. One taller row is the smaller cost. Not a defect of this TASK.
- **Screenshots not saved as files:** accepted for this mock round; Tanya checks the built pages live after the round-13 build, with the steps above.
- Security review: none (mock page, no data, no auth change).
→ Ready for Sober's round-13 build (with A and C) → Otto → Tanya via Porter.

### Review 2 — Silver (SA-B) · 2026-11-13 · 🔁 REWORK (one attribute)
- Found by Sector's round-13 run (TASK-977 § Implementation Notes l.115): `audit-align.mjs` → `ceo /salary/daily: an action cell is start` (60/0 at round 12). My miss: I did not run `audit-align` at review.
- **Cause:** `tests/evidence/task-936/audit-align.mjs` l.60 checks every cell of the last column (rule 4). The Total row's empty Action cell `Daily.tsx` l.172 `<Table.Td />` computes `start`.
- **Fix:** l.172 → `<Table.Td ta="right" />`. Nothing else.
- **Done =** `tsc` 0 · `npm run build` OK · `audit-align.mjs` from a scratch copy (don't rewrite `task-936` results) → **60 PASS / 0 FAIL**; paste the line.

### Implementation Notes — Rework (Review 2) · Fanta · 2026-11-13
- `Daily.tsx` Total row's empty Action cell → `<Table.Td ta="right" />` (the only change; the empty Description cell is untouched).
- `tsc` (5.6.3) → 0 · `npm run build` → ✓ built · `audit-align.mjs` run from a scratch copy (`$TEMP/audit978`, `task-936` results untouched): **`TOTAL: 60 PASS, 0 FAIL`**, `console / network problems: 0`.

### Review 3 — Silver (SA-B) · 2026-11-13 · ✅ DONE
- Read back `Daily.tsx` l.172: `<Table.Td ta="right" />`; the only change. Re-ran `tsc --noEmit` → 0. Fanta's `audit-align` → **60 PASS / 0 FAIL** (Rework notes) accepted.
→ Ready for Sober's round-13 build (with A and C) → Otto → Tanya via Porter.

## Amendment 1 (Silver, 2026-11-13) — GR r13b, O-151-13a: the Description follows a pay edit [PM-decided: Porter's line; rule SA-decided]
Tanya (TEST-151 § GR round 13 Observations, shot `04`): after Daily Income 300 → 400 ฿, the row still reads «Private 1 Hr × 300 ฿».
**File:** `src/pages/a/salary/Daily.tsx` only (l.143 the row cell, l.214 the detail's Description line; both must read the same value).
**Rule** (a small pure helper in the same file, used by both places):
- Only when the edit **changed Daily Income** and the description matches `^(.+) (\d+(?:\.\d+)?) Hr × ([\d,]+) ฿$` (label · paid hours `h` · rate):
  - new income ÷ `h` is a whole number → `«{label} {h} Hr × {new rate} ฿»` (e.g. «Private 1 Hr × 400 ฿», «Extra Hour 2 Hr × 400 ฿» for 800);
  - otherwise → `«{label} {h} Hr · {new income} ฿»` (formatted like the income, no rate).
- `h` is the description's own paid hours, **not** the row's Hours (Ton's Part-time row: 7 Hr taught, 2 Hr paid). A Hours-only edit, a «—» description, or a description that doesn't match → unchanged.
- The mock data (`b-daily-detail.ts`, `a-salary-b.ts`) is not edited.
**Done =** tsc 0 · build OK · `audit-align` 60/0 · headless: edit the 15/10 Ton row 300 → 400 → row and detail read «Private 1 Hr × 400 ฿»; edit the 10/10 Ton row 700 → 755 → «Extra Hour 2 Hr · 755 ฿» (755 ÷ 2 is not whole); a Hours-only edit leaves the description as it was. Paste the three strings.

### Implementation Notes — Amendment 1 (O-151-13a) · Fanta · 2026-11-13
- `Daily.tsx` only: a small pure helper `descAfterPayEdit(desc, oldIncome, newIncome)` (regex `^(.+) (\d+(?:\.\d+)?) Hr × ([\d,]+) ฿$`; `h` = the description's own paid hours, not the row's Hours). Applied once in the `rows` map, so the row cell and the detail's Description line read the same value. Unchanged for a Hours-only edit, a «—» description, a non-matching description, or an edit that did not change Daily Income. Mock data not touched.
- Evidence: `tsc` 0 · `npm run build` ✓ · `audit-align.mjs` (scratch copy) **TOTAL: 60 PASS, 0 FAIL**.
- Headless (the edit form driven in the browser pane, Save pressed; row cell = detail line in each case):
  1. 15/10 Ton, Daily Income 300 → 400: **«Private 1 Hr × 400 ฿»**
  2. 10/10 Ton, Daily Income 700 → 755: **«Extra Hour 2 Hr · 755 ฿»** (755 ÷ 2 is not whole)
  3. 14/10 May, Hours 5 → 6 only: **«Extra Hour 1 Hr × 350 ฿»** (unchanged, as before the edit)

### Review — Amendment 1 — Silver (SA-B) · 2026-11-13 · ✅ DONE
- Read `Daily.tsx` l.21–30 (`descAfterPayEdit`) and l.48: matches the rule (income unchanged / null → as is; regex as specified; `h` from the description; whole rate → «× rate ฿», else «· {income}»); one value feeds the row (l.158) and the detail (l.229). Re-ran `tsc` → 0. Fanta's audit-align 60/0 and the three strings accepted.
→ Ready for the r13b build.
