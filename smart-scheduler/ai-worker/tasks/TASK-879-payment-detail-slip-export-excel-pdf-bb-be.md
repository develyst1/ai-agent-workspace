# TASK-879 — BE: REQ-120 **Payment Detail export: one slip as Excel (summary) and PDF (everything)** (backoffice-back) — @Jason (Team A; moved from @Bob by Porter 2026-11-08, starting now) — Silver reviews
**From @Silver, 2026-11-08.** Scope: REQ-120 l.220 *"Payment Detail export: Excel = a summary per section (e.g. Bonus + Subtotal), PDF = everything incl. the details"*. In scope by the owner's 11-07 *"รวมให้ทั้งหมด"* (REQ-120 l.279: "Slip export … IN scope"). Repo `smart-scheduler-backoffice-back`, branch `dong`. **No git command: git only on the owner's word.** No migration. **Size ≈ 1.5 d** (my estimate; say so if the libraries make it more).

## What it reads
Jason's slip, through his service only: `service.getSlip(id)` → `{ id, period, teacherId, baseAmount, status, lines: [{ id, kind, label, amount, source }], total }`. Money is integer satang (`routes/salary.ts` header). **Don't read the tables directly, and don't change Jason's files** except one route line each (below).

## What to build
1. **The section model, pure (`src/lib/slip-sections.ts`):** group a slip's lines into the Payment Detail sections, **in the final UI's order and with the final UI's section names**.
   - Read `final-ui` `Slip.tsx` / `SlipView.tsx` for the order and names (repo path in `machine.local.md`). **No new words.**
   - Each section: its lines, plus a subtotal in satang. The grand total must equal `slip.total`; a test pins it.
   - Base salary is its own row.
   - A `kind` the final UI has no section for goes under the final UI's "Other" section, never dropped. List the kinds you met in the report.
2. **Excel:** `GET /salary/slips/:id/export.xlsx`, CEO only.
   - One sheet: one row per **section** (name + subtotal in baht, 2 decimals), then the total.
   - Header: the person's name (via the profile / teacher read Jason's service already exposes; if none exists, use the teacher id and tell me), the period label, the status.
   - Filename `slip-<YYYY-MM>-<teacherId8>.xlsx`.
3. **PDF:** `GET /salary/slips/:id/export.pdf`, CEO only.
   - Everything: the header, every section with **every line** (label + amount), the subtotals, the total.
   - **Thai text must render.** Embed a Thai-capable font with an OFL licence (e.g. Sarabun), committed under `assets/fonts/` with its licence file.
   - A test asserts the font is embedded and a Thai label round-trips as text (extract text from the produced PDF).
4. **The routes:** add **one line each** to Jason's salary router, tagged `🔻 TASK-879`, behind his `ceo` guard. **Never an admin; never a coach yet** (the coach's own slip is SPEC-100 §5's later extension).
5. **Libraries:**
   - Pick one maintained, pure-JS library for XLSX and one for PDF that run under Bun and inside `bun build --compile` (the deploy shape).
   - **Prove the compiled binary serves both exports** (`bun run build`, then hit the routes on the binary with a seeded / fixture store).
   - Name the libraries + versions in the report. Pin exact versions in `package.json`; nothing else in it changes.

## Tests (DB-less, SAFE env; each must fail when its code is removed)
- Sections: the order, the subtotals, Σ = `total`, an unknown kind lands in "Other", a negative Other± line subtracts.
- XLSX: parse the produced file back and check the rows / amounts (baht with 2 decimals from satang, no float drift: 1,234,567 satang → "12,345.67").
- PDF: the Thai label extracts as text; every line label is present; the total matches.
- Routes: 401 with no token, 403 for an admin or a coach, 404 for an unknown slip, 200 with the right `Content-Type` + `Content-Disposition` for the CEO.
- A mutation set over the section grouping + the satang→baht formatting.

## Files (claim, Team B)
- `src/lib/slip-sections.ts`, `src/services/slip-export.service.ts` + tests;
- `assets/fonts/**` (the font + its licence);
- `package.json` (the 2 pinned deps only) + the lockfile;
- **one line each** in `src/routes/salary.ts`, tagged.
- Pure mirror test edits are pre-approved (tagged `🔻 TASK-879`, listed), e.g. Jason's route count.

## Done =
- `bunx --package typescript@5.9.3 tsc --noEmit` 0;
- BB suite green (before / after);
- `bun run build` 0, and the compiled binary serves both files;
- mutation set all bite;
- the report in `inbox/SA-B.md`, with one sample `.xlsx` + `.pdf` from fixture data (invented names only) in `tests/evidence/task-879/`.
- `git status` = only the claimed files. No git command run.
- **The front's buttons** (TASK-862 left them inert on purpose) are wired by Fanta in a later TASK. Not here.

## Owner change — @Silver, 2026-11-08: **@Jason builds it now.** Silver reviews.
- **Your chain is Sober,** so put your report and any questions in this TASK (`## Questions`), as Brew did for 863 / 867 / 868. Sober relays them.
- **"One line each in `salary.ts`"** is your own router, so the "don't change Jason's files" wording simply means: keep the export logic in the new files, and use only your service's slip read.
- **The coach's own export** (from `GET /salary/my-slip`, TASK-880) is **not** in scope. The routes stay CEO only, as written.
- Typecheck with `bunx --package typescript@5.9.3 tsc --noEmit`. Plain `bunx tsc` = tsgo, which panics on this machine.

## Jason (BE) 2026-11-08 — TASK-879 GREEN (Payment Detail export: Excel summary + PDF with everything, CEO only)
**Built (backoffice-back; no migration, no scheduler file, no git):** `src/lib/slip-sections.ts` (pure section model + `bahtText` + period label + filename) · `src/services/slip-export.service.ts` (`slipToXlsx`, `slipToPdf`, `exportSlip`) · `assets/fonts/Sarabun-Regular.ttf`, `Sarabun-Bold.ttf`, `OFL.txt` · `src/assets.d.ts` (module shims) · two tagged route lines in `src/routes/salary.ts`: `GET /salary/slips/:id/export.xlsx` and `.../export.pdf`, both behind `ceo`; route-count pin 26→28 (tagged `🔻 TASK-879`).
**Libraries (pinned exact in package.json, the only change there):** `exceljs 4.4.0` (XLSX; last release 2023 but stable, pure JS, reads and writes so the test parses the file back) and `pdfkit 0.20.2` (PDF; embeds the TTF and shapes Thai through fontkit). Sarabun copied from a copy already on this machine; its name table says "SIL Open Font License 1.1, Copyright 2018 The Sarabun Project Authors"; I wrote the standard OFL 1.1 text next to it.
**Sections = the final UI's order and names** (read from `final-ui` `SlipView.tsx` + `mock/a-salary.ts`): Base Salary · Freelance Teaching Pay · Extra Hour · OT · Commission · Bonus · Transportation · Merit · Other ±; empty sections are omitted, as the UI does. Base is its own section/row ("Set by the CEO"). Kinds met: base, fl_pay, extra_hour, ot, commission, bonus, transport, merit, other; **any other kind goes under Other ± and is never dropped** (tested with an invented kind). Σ subtotals = `slip.total` is pinned. Status words are the UI's: draft→Pending, confirmed→Confirmed, locked→AUTO-LOCKED. Dates DD/MM/YY (period `30/09/26–30/10/26`). Person = `teacherName`, else the teacher id.
**Excel:** one sheet, header (name, period, status), one row per section with its subtotal, then Total. Amounts are real numbers made from integer satang (÷100) with format `#,##0.00;-#,##0.00`; `bahtText(1234567)` = "12,345.67". Filename `slip-<YYYY-MM>-<teacherId8>.xlsx`.
**PDF:** header, every section with every line (label + amount), subtotals, total; paginates (120-line test). Sarabun Regular+Bold are embedded (`/BaseFont XXXXXX+Sarabun…`, `/FontFile2`, no Helvetica). Thai round-trips as text.
**Evidence:** pinned tsc 5.9.3 → 0 `error TS` · suite 740 pass / 0 fail (new `slip-export-task879.test.ts`: 15 tests — sections, xlsx parsed back, pdf text extracted back, routes: 401 no token, 403 admin and coach, 404 unknown/malformed, 200 with Content-Type + Content-Disposition) · **mutation set: 15/15 bite** (section order, unknown-kind drop, negative line, base row, total, thousands separator, 2-decimal padding, sign, float division, filename, xlsx ÷10, xlsx total, body font Helvetica, PDF rows missing, export open to admin) · `bun run build` exit 0 (binary 101 MB) · **compiled binary proof:** the real routes + export service on an in-memory fixture store, compiled with `bun build --compile` (temporary file, deleted), answered `200` for `.xlsx` (6,816 bytes, correct type/filename) and `.pdf` (11,580 bytes) and `404` for an unknown slip, so exceljs, pdfkit and both embedded fonts work inside the compiled shape. Samples (invented name "Pete"): `tests/evidence/task-879/sample-slip.xlsx` and `sample-slip.pdf` in backoffice-back.
**Questions / things to know (Sober → Silver):**
1. **Freelance pay is one section, not split per class type.** The final UI shows "Freelance Teaching Pay · Private" and "· Group" with a note like "6 Hr × 300". Our fl_pay line is one per DATE with the class breakdown in its label, so I cannot split by class type without parsing the label. Say if you want the line label or a new field to carry the class type; today it is a single "Freelance Teaching Pay" section.
2. **Titles carry no suffix** ("Base Salary (Part-time)", "Merit (Every 3 month)", "Extra Hour (Part-time)" in the mock): the slip data has no role/cadence to put there. I used the bare names.
3. **No "Teaching Hours" table in the PDF** (the UI's student list at the bottom): it needs the R1.6 students reader that Porter deferred until after the demo deploy.
4. **PDF text extraction quirk:** pdfkit writes Thai "ำ" (sara am) as nikhahit + sara aa and lists the aa twice in its ToUnicode map, so a copy-paste from the PDF may read "ทําา". The page shows correctly; my test collapses it. Cosmetic.
5. **I could not open the PDF visually here** (the preview pane refuses local file snapshots), so the Thai layout is proven by embedded font + extracted text, not by eye. Please open `sample-slip.pdf` once.
6. `src/assets.d.ts` types `pdfkit` as `any` because its own typings are not reachable under this tsconfig; adding `@types/pdfkit` would have added a third dependency.
7. Fanta's buttons (TASK-862) are not wired here, as the TASK says. The coach's own export is out of scope.
Security review: not requested for 879 (the routes are CEO-only behind the existing guard and take only a UUID path id); nothing user-controlled reaches a file path or query.
Ball: Sober (review) → Silver.

## Review — the "two hands" check — @Silver, 2026-11-08
- **Bob's answer (inbox/SA-B.md, verbatim):** "I created or edited NO file for TASK-879 — nothing in backoffice-back at all … every edit I made today was in smart-scheduler-back."
- **So: none. Bob only announced it.** Every TASK-879 file in the tree is Jason's, and the case is closed. *(The code review of 879 follows when it's marked REVIEW.)*

## Review — @Silver, 2026-11-09: 🔁 one small layout REWORK (the PDF subtotal wraps); everything else ACCEPTED
- **Re-run by me:**
  - BB `bunx --package typescript@5.9.3 tsc --noEmit` = 0; `bun test` (dummy URL) = **856 pass / 0 fail**;
  - `package.json` diff = exactly `exceljs 4.4.0` + `pdfkit 0.20.2`, pinned.
- **Excel formula injection (Sober's question): guarded.**
  - Every text cell goes through `formulaSafe` (`slip-sections.ts:65`, a leading `= + - @ TAB CR` gets an apostrophe), and a test pins 7 attack strings plus the safe ones.
  - **Line labels, where admin Other± reasons live, are not written to the Excel at all.** It's sections + subtotals only, so only the name / period / status / section titles reach it.
- **I opened `sample-slip.pdf`** (Jason's Q5): the Thai renders correctly on the page («ทำอุปกรณ์เสีย»), with Sarabun embedded. The text-extraction quirk (Q4) is cosmetic: accepted.
- **🔁 Rework (≈ 15 min):** in the PDF, **a section's subtotal wraps onto two lines** when it's ≥ 1,000: "Subtotal 1,225.00" / "฿" on the next line (Extra Hour, Merit, and Base's two-line "Subtotal / 20,800.00 ฿").
  - Give the right-hand column enough width (or `lineBreak: false` with `width` sized to the text) so "Subtotal 20,800.00 ฿" always sits on one line.
  - Add a test that measures the string width against the column, and regenerate the sample.
- **Answers to Jason's questions:**
  1. **FL pay as one section:** accepted for now. Splitting by class type needs the class on the line (a field, not label parsing). That's Team A's `fl_pay` line model, so I'm raising it with Sober through Porter as a follow-up, not this TASK.
  2. **Bare section titles** (no "(Part-time)" / "(Every 3 month)"): accepted; the data has no role or cadence.
  3. **No Teaching Hours table:** accepted; it waits for the R1.6 students reader.
  4. Cosmetic: accepted.
  5. Done above.
  6. `pdfkit` as `any`: accepted.
  7. Agreed.
- **Security review (I ran it by hand, as required for a file export):** none found.
  - CEO-only behind the existing guard; the path id is uuid-validated; no user input reaches a file path or query.
  - Formula injection is guarded.
  - Fonts are static assets.
  - The 101 MB binary size is noted, not a security issue.
- **After the rework:** one line in this TASK; I re-run and mark DONE.

## Jason (BE) 2026-11-09 — TASK-879: Silver's 2 review conditions DONE (formula-injection guard + /security-review)
**1. Excel formula injection — guarded.** New `formulaSafe()` in `lib/slip-sections.ts`: a text cell that BEGINS with `=`, `+`, `-`, `@`, a tab or a CR gets a leading apostrophe, so a spreadsheet shows it as text and never runs it. Applied to every text cell of the XLSX (person name, period, status, section titles) and, because it had the same hole, to the **teacher-name column of the existing salary CSV export** (`salary.service.ts` `exportCsv`). Money cells are real numbers and never go through it (a negative subtotal stays a number). The PDF keeps labels as typed (not a spreadsheet). Note on where the admin's text lands: an admin's Entries reason is a LINE ITEM label, which appears only in the PDF; the Excel summary carries section titles and the person's name (from `public.teachers`, also person-typed), so those are the cells that needed the guard.
**Tests (+5, in `slip-export-task879.test.ts`):** the guard on `= + - @ \t \r` (incl. a `HYPERLINK` payload) and untouched ordinary/Thai/`a=b`/`x-1`/` =spaced` text; the XLSX name cell for `=1+1`, `@SUM(A1)`, `+cmd`, `-1+2` is a String cell with the apostrophe and has no formula; money cells stay numbers; the PDF keeps `=1+1 reason` unchanged; the CSV name column is guarded. **Mutation set now 18/18 bite** (added: xlsx name unguarded, `@` dropped from the guard, csv name unguarded).
**2. /security-review (TASK-879 whole):** none open after the fix above. Checked: both routes CEO-only behind the existing `ceo` guard (admin/coach 403, none 401, tested) with a UUID path id (malformed ⇒ 404); the filename is built from year, month and 8 hex characters of the id, so no header injection; responses are `no-store` attachments with fixed content types; fonts are read from embedded assets, never a request-supplied path; exceljs/pdfkit only WRITE files here (no parsing of untrusted input); person-typed text in the PDF is drawn as glyphs, not interpreted; the PDF `Title` metadata holds the person's name (not executable). Residual, accepted: pay data is in the file by design, and the CEO is the only reader.
**Evidence:** pinned tsc 5.9.3 → 0 `error TS` · backoffice-back suite 856 pass / 0 fail (Bob's 887 work has landed, so the earlier 4 unrelated failures are gone) · `bun run build` unchanged by this edit.
Ball: Sober (→ Silver).

## Jason (BE) 2026-11-09 — TASK-879 PDF fix DONE (subtotals of 1,000+ stay on one line)
**Cause:** the PDF's right-hand amount column was a fixed 110 pt; the bold 13 pt section header "Subtotal 20,800.00 ฿" is wider, so pdfkit wrapped it onto a second line. **Fix (`slip-export.service.ts` `row()`):** the amount column now measures its own text (`widthOfString + 6`, never less than 110) and the label column takes the rest; the amount is drawn with `lineBreak:false`, so it can never wrap. Applies to subtotals, line amounts and the total.
**Test (+1):** a slip with subtotals of 1,000.00 up to 1,234,567.89 and a negative one; every `Subtotal <amount> ฿`, every line amount and the total is a SINGLE extracted text line, and there is never a bare "฿" or a lone "Subtotal". It **bites**: with the old fixed-width layout put back, the test fails. (The test extractor now has `pdfRaw` for per-line text; `pdfText` is unchanged.)
**Evidence:** pinned tsc 5.9.3 → 0 `error TS` · backoffice-back suite 857 pass / 0 fail · `bun run build` 0 · `tests/evidence/task-879/sample-slip.pdf` and `.xlsx` regenerated from the same invented fixture (Pete) with the new layout. I still cannot eyeball the PDF here; the single-line property is proven from the text positions.
Ball: Sober (→ Silver).

## Jason (BE) 2026-11-09 — TASK-879 export-split DONE (Freelance Teaching Pay by class type in the XLSX / PDF)
**What it does:** `fl_pay` lines are grouped by their new `classType` into **"Freelance Teaching Pay · Private / · Duo / · Group / · ECA / · Camp"** (that order, matching the final UI), placed right after Base Salary; non-`fl_pay` sections are unchanged. A frozen pre-0014 `fl_pay` line with no class stays under plain "Freelance Teaching Pay" (first). `buildSections` also returns `flTotalSatang` (Σ of the FL sections, null when none).
- **XLSX:** one row per class sub-section with its subtotal, then (only when there are 2+ FL sub-sections) an italic memo row **"Freelance Teaching Pay · all classes"** with a note in column C "sum of the Freelance rows above (already in the Total)". The Total still adds the class rows once (the memo is NOT added again: say if you would rather not have the memo row in the Excel).
- **PDF:** each class sub-section lists its lines and subtotal, then an "all classes" subtotal line (same 2+ rule); every amount stays on one line.
**Tests (+5 in `slip-export-task879.test.ts`; the `SECTION_ORDER` pin updated to the new list):** the model (class order, per-class subtotals, FL total, grand total unchanged, none ⇒ null); an old class-less line stays first under the plain title; XLSX parsed back: two class rows 2,800.00 + 250.00 and the memo 3,050.00 = their sum, Total 13,400.00; one class ⇒ no memo row; PDF: every sub-section, subtotal and the memo as single text lines. **Mutations 4/4 bite** (no per-class split, class order reversed, memo row dropped, FL total off by one).
**Evidence:** pinned tsc 5.9.3 → 0 `error TS` · backoffice-back suite 998 pass / 0 fail · samples regenerated from an invented PT+FL fixture ("Ploy": private + group over four days, merit, an Other± line) in `tests/evidence/task-879/sample-slip.xlsx` and `.pdf` (still not eyeballed by me).
**Security review:** none new: no route, input or data exposure change (the class names are fixed strings; `formulaSafe` still guards the XLSX text cells, including the new titles).
Ball: Sober (review).

## Jason (BE) 2026-11-09 — TASK-879: "all classes" memo row DROPPED (XLSX and PDF)
Removed as ruled: the Excel now has one row per Freelance class sub-section and the Total; the PDF has each class sub-section with its lines and subtotal and no "all classes" line. The class rows are what the Total adds (unchanged). I kept `flTotalSatang` on the section model (a read-only number, not rendered anywhere) in case the FE wants it; say if you want it removed too.
**Tests:** the XLSX test now expects the rows without the memo; the PDF test asserts there is no "all classes" line and no 3,050.00 subtotal; the one-class test retitled. **Evidence:** pinned tsc 5.9.3 → 0 `error TS` · backoffice-back suite 998 pass / 0 fail · samples in `tests/evidence/task-879/` regenerated.
Ball: Sober.

## Review (Sober, SA Lead A, 2026-11-09) — ✅ ACCEPTED (memo-drop verified by code read)
Read the built code, not just the report:
- **"all classes" memo row is genuinely gone from both renderers.** `slip-export.service.ts` now loops `for (const s of model.sections)` → XLSX `addRow([title, subtotal])` then one `Total`; PDF `row(title, "Subtotal …")` per section. No memo insertion anywhere. "all classes" survives only in (a) the `flTotalSatang` doc comment and (b) two test assertions that assert its **absence** (`expect(lines.some(l => l.includes("all classes"))).toBe(false)`, and the XLSX test retitled "no 'all classes' memo row").
- **Total integrity intact:** `Total = model.totalSatang/100`, each line counted once; the memo was never added to it.
- **`flTotalSatang`: KEEP it (my call).** It is a pure read-only derived number (`slip-sections.ts:22/73`), rendered nowhere, consumed only by 3 tests, with the explicit "already inside totalSatang via its class rows — never add it again" comment. The SPEC-102 My-slip/Entries FE may want a "Freelance total" summary line without re-summing; removing it buys nothing and churns 3 tests. Leave it, unrendered.
- Evidence accepted: tsc 5.9.3 → 0, BB suite 998/0, samples regenerated. **Verdict: ✅ ACCEPTED.** Jason is free; routing back to his SA (Silver, Team B) for his next.
