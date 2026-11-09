# TASK-922 — BE: REQ-120 R1.8 **month-end SALARY reports: (A) teaching summary per coach, (B) salary + other income per person** (backoffice-back, read-only) — @Bob after TASK-921 (or a lent BE, Porter's call) — Silver reviews
**From @Silver, 2026-11-09.** Porter: a gap in Salary block 1 (Master Plan §3 "เงินเดือน … + รายงาน SALARY"). REQ-120 **R1.8**: *"each coach's teaching summary; everyone's salary + other income"*. **There's no final-UI page for it**, and ขวัญ said the report details are agreed when this part starts (CUSTOMER-ANSWERS 2026-10-14). So this TASK builds the **default content below**, and Porter asks her one line (see the end). Repo `smart-scheduler-backoffice-back`, branch `dong`. **No git command: git only on the owner's word.** **No migration, no write.** **Size ≈ 1.5 d.**

## (A) `GET /salary/reports/teaching?periodId=` (CEO only)
- **Per coach** with teaching in the R1.4 period. Read through **TASK-872's hours reader** (`services/hours-reader.ts:333 readHours`), the same source as the pay run and TASK-885, so the numbers can't disagree.
- `rows: [{ teacherId, role, minutesByClass: { private, duo, group, eca, camp }, weekdayMinutes, weekendMinutes, totalMinutes, sessions }]`.
- `role` = their type(s) in the period (as 885 words them).
- `totals` = the same keys summed.
- **"No Teacher" is never a row.** **No money in (A).**

## (B) `GET /salary/reports/pay?periodId=` (CEO only)
- **Per person with a slip in the period:** `rows: [{ teacherId, slipStatus, baseSatang, byKind: { fl_pay, extra_hour, ot, merit, bonus, commission, transport, other }, totalSatang }]`.
- Read from the slips + lines through Jason's store reads (`GET /salary/periods/:id` + the slip reads). **Every row's `totalSatang` must equal that slip's total**, and a test pins it.
- **"Other income"** = every kind except base (R1.8's words); the FE shows it as a column group.
- `totals` = the column sums.

## (C) Excel for both
- `GET /salary/reports/{teaching,pay}.xlsx?periodId=` (CEO).
- **Reuse TASK-879's export pieces** (`exceljs`, `formulaSafe`, `bahtText`, its section words / `KIND_LABEL`). One sheet each, a header row (the period label), rows, totals.
- **No PDF** in this TASK.

## Rules
- Integer satang; hours = minutes / 60 with 2 decimals.
- An unknown or malformed period → 404 / 400. CEO only: 401 / 403 otherwise.
- **Names are the FE's join** (§9b), so the API carries `teacherId` only. In the Excel, use the store's `teacherNames` lookup (as 879 does).

## Tests (each must fail when its code is removed)
- (A) equals 885's / the pay run's minutes for the same fixture;
- (B) row total = slip total, and Σ rows = `totals`;
- "No Teacher" absent;
- an admin / coach get 403;
- the Excel parses back with the same numbers;
- `formulaSafe` is applied to name cells.
- A mutation set over the sums and the role gate.

## Files (claim, Team B)
- New `src/services/salary-reports.service.ts` + test;
- **one route line per route** in `src/routes/salary.ts`, tagged `🔻 TASK-922`;
- read-only use of 872 / 879 / the salary store.
- Mirror pins are pre-approved (tagged).

## Done =
- `bunx --package typescript@5.9.3 tsc --noEmit` 0;
- BB suite green (before / after);
- the mutants bite;
- a rolled-back / read-only sid run of (A) and (B) for one period (host .206);
- `/security-review` (data exposure: CEO only).
- Report in `inbox/SA-B.md`. `git status` = only the claimed files. No git command run.

## The one line for ขวัญ (via Porter, sent when the block starts; the build goes ahead on these defaults)
«รายงานสิ้นเดือน (SALARY) จะมี 2 หน้า:
(1) สรุปชั่วโมงสอนของครูแต่ละคน: แยกประเภทคลาส, วันธรรมดา/เสาร์-อาทิตย์, จำนวนคลาส
(2) สรุปเงินเดือนและรายได้อื่นของทุกคน: แต่ละรายการ + รวม
พร้อม export Excel
อยากเพิ่มหรือตัดอะไรไหมคะ»

## Review — @Silver, 2026-11-09: ✅ ACCEPTED (DONE)
- **Re-run by me:**
  - BB `bunx --package typescript@5.9.3 tsc --noEmit` = **0**; `bun test` = **1308 pass / 0 fail**. Brew's TASK-924 red has since cleared.
  - The 922 file alone: 38 / 38.
- **Routes:** 4 CEO-only routes, one line each, tagged (`salary.ts:88–91`).
- **Correctness:** pay row = slip total and the teaching minutes come from the 872 reader (both tested); 42 / 42 mutants.
- **Sid:** a read-only run, 8 / 8 (3 coaches · 7,260 min · 121 sessions), residue 0.
- **Brew's brief parallel lend:** noted. Bob built to Brew's tested API and only one implementation shipped. No trace is left in the tree (one route block, one test file).
- **Security review:** none. CEO-only reads; the Excel goes through `formulaSafe`.
- **Next:** Fanta flips TASK-923's `REPORTS_SOURCE` to `"api"` against these shapes.

## Report (Bob, 2026-11-09) — TASK-922 DONE-pending-review (Silver). Read-only, no migration, nothing committed.
**⚠ A collision to know about:** while I was building, Brew (Team C, lent to this TASK by Porter before Silver gave it to me) was writing the SAME files in parallel — a 37-test file `salary-reports-task922.test.ts` and 4 route lines in `routes/salary.ts` — for a few minutes; his files and my lib / service overwrote each other's names. His lend was then cancelled (BE-C inbox) and his test + route lines disappeared from the tree. **I read his test in full before it went and kept its spec** (his fixtures, his API names `buildTeachingReport / buildPayReport / teachingToXlsx / payToXlsx / periodIdOf / reportFilename / …`, «a row that does not add up is an error», the computed-range fallback), built my service to that API, and re-created the test file from it (`salary-reports.service.test.ts`, credited in its header). So Brew's design is what shipped; nothing of his was lost. If he comes back to it, there is nothing for him to redo.

**Built (BB `dong`):**
- `src/lib/salary-reports.ts` (PURE): `teachingRow` / `teachingTotals` (minutes per class from TASK-872's days, weekday vs weekend by the Bangkok date via `isWeekend`, sessions), `rolesToWords` («Full-time» · «Part-time» · «Freelance» · «Part-time + Freelance», 885's words), `hours2`, `PAY_KINDS`, `payRow` (byKind split; an unknown kind or a stray «base» line goes under `other`, never dropped; **a row whose base + lines ≠ the slip's own total THROWS**), `payTotals`.
- `src/services/salary-reports.service.ts`: **(A)** `buildTeachingReport(periodId, deps)` — for each ACTIVE FT/PT/FL profile that is in `listEntriesPeople` («No Teacher» never), `readHours` over the period's R1.4 range (the stored range, else the computed one for a period made before TASK-871), the class COUNT from the very rows that call collected (same filter / `classifyRow` / live-group rule as `bucketMinutes`), rows ordered by role then id; **no money**, `teacherId` only. **(B)** `buildPayReport` — every slip of the period through the salary service's own `getSlip`: `{teacherId, slipStatus, baseSatang, byKind{fl_pay, extra_hour, ot, merit, bonus, commission, transport, other}, otherIncomeSatang, totalSatang}` + column-sum `totals`. **(C)** `teachingToXlsx / payToXlsx / teachingXlsxFor / payXlsxFor` (ExcelJS; header = the period label; names through `formulaSafe`, the id when no name; hours = minutes ÷ 60 to 2 decimals; baht = satang ÷ 100 as real numbers with the `#,##0.00;-#,##0.00` format; filenames `salary-<teaching|pay>-YYYY-MM.xlsx`, attachment, no-store). Both getPeriod calls pass `{missingRates:false}` (the heavy scan is not this report's business).
- **Routes (4 tagged one-liners in `routes/salary.ts`, all `ceo`):** `GET /salary/reports/teaching?periodId=` · `/reports/pay?periodId=` · `/reports/teaching.xlsx?periodId=` · `/reports/pay.xlsx?periodId=`. `periodId` missing ⇒ 400, malformed ⇒ 404 (the router's own uuid rule), unknown ⇒ 404; admin / coach ⇒ 403, no token ⇒ 401.
- **The shapes Fanta (923) builds on:** teaching `{period:{id,year,month,periodStart,periodEnd,status,label}, rows:[{teacherId, role, minutesByClass:{private,duo,group,eca,camp}, weekdayMinutes, weekendMinutes, totalMinutes, sessions}], totals:{minutesByClass, weekdayMinutes, weekendMinutes, totalMinutes, sessions}}`; pay `{period, rows:[{teacherId, slipStatus, baseSatang, byKind, otherIncomeSatang, totalSatang}], totals:{baseSatang, byKind, otherIncomeSatang, totalSatang}}`.

**Evidence:** `salary-reports.service.test.ts` **38 pass** (the TASK's list: (A) equals the reader's and TASK-885's minutes for the same rows; weekday/weekend; the inclusive range 30/9–30/10 and the stored-vs-computed range; sessions (a GROUP once, not per child; cancelled / empty group / skipped kind not counted); «No Teacher», inactive and idle coaches are not rows; role words and order; totals; no money; ids only; 404; empty period. (B) row total = slip total and base + other income = total; each kind in its column; totals = column sums; unknown kind under other; a non-adding row is an error; one getSlip per slip; on the REAL salary service. (C) the Excel parses back with the same numbers, `formulaSafe` on names, header words, number cells + format, response headers. Routes: admin / coach 403, no token 401 on all four; CEO 200 shapes; periodId 400 / 404; a source pin: read-only, four CEO-gated GETs). **Mutation set `salary-reports-task922.mutations.json`: 42 mutants, 42 BITE** (sums, weekday/weekend, role words and order, the other-income split, the does-not-add-up check, the totals, the filters, the range, the sessions, the Excel, the four role gates). BB full suite 1307 pass · 1 fail — **the 1 fail and a tsc error are in `src/routes/reports.test.ts` (Brew's TASK-924, the All Report, in progress), not in my files**; my files compile and pass (my two test files: 44 pass / 0 fail; tsc was 0 before his file landed). Mirror edit (pre-approved, tagged): `salary-routes-task865.test.ts` route count 33 → 37.

**Read-only sid run (host .206 first; REAL timetable data for the Oct-2026 period range 30/9–30/10; the profiles, a throw-away period and its slips created inside ONE rolled-back transaction; residue 0 — periods 0→0, slips 0→0, lines 0→0, profiles 0→0): 8/8 PASS** — (A) 3 real coaches, 7,260 teaching minutes, 121 sessions: every row's minutes = the reader's own answer, weekday + weekend = total, Σ rows = totals per class, «No Teacher» (given a profile on purpose) is not a row, no money; the Excel answers with the right mime and filename. (B) 4 slips: every row's total = that slip's own total, base + other income = total, the lines I added (+150000, −30050) land in Other ± (119950), Σ rows = totals, no names in the JSON, the Excel's filename.

**/security-review (hand):** all four routes are CEO-only (`ceo` guard like their siblings; admin / coach 403, tested on every route); the pay figures never appear in (A); names are never in the JSON (ids only) — in the Excel they go through `formulaSafe` (a leading = + - @ is neutralised); `periodId` is validated (400 / 404) before any read; read-only by source (a test pins that the service has no insert / update / delete / transaction); a slip that does not add up fails loudly instead of printing a wrong number. No High / Medium finding.

**Decisions / notes:** (1) «the coaches» of (A) = active profiles of type FT / PT / FL in the people list (as 885): a coach deactivated mid-period who taught earlier is NOT in the report (the pay run skips them too, so the two agree); say if the report should include them. (2) sessions = classes counted by the same rules as the minutes (a GROUP counts once however many children). (3) The teaching Excel shows hours only (no minutes column), as the TASK says. (4) No PDF, as specified. (5) Nothing built depends on ขวัญ's answer to the one-line question.
