# TASK-150: Wave-1 student + family importer (BE)
- Source: SPEC-051 (REQ-055 go-live, master data only)
- Status: ✅ DONE (rework SA-reviewed Sober 2026-08-19) — fill-down + per-batch guard verified; go-live importer complete.

## Rework review (Sober 2026-08-19) — PASS ✅ (my miss: Jason had already fixed this; I reviewed 151/148 first)
Reproduced: `bunx tsc --noEmit` **0** · `bun test src/lib/student-import.test.ts` **35/0** (+7). Both fixes confirmed:
- **Fill-down of column A** (`student-import.ts:250-260`): `lastDay` carries the merged-cell day forward across empty
  column-A rows; a wholly-blank spacer line is skipped **without resetting** the carried day (a blank inside a block
  doesn't end the merge — correct). So `--day Monday` now selects the whole 9-row block.
- **Per-batch self-check** (`batchSizes` + `checkBatchSize`; script `:81-87`): the file's own day-group size is the
  expected count; a mismatch prints every day-group size and **exits non-zero WITHOUT writing or reporting** — an
  empty-ish batch can no longer look successful. Tests pin the exact 1-of-2 case.
Everything from the first review stands (AC-7 people-only, dry-run default, PII counts-only, phone/DOB/parent/yellow,
excelRow alignment). **⇒ the go-live importer is complete.** Owner-run: `db:reset` (TASK-151) → `import:students`
dry-run→`--commit`, sid first then uat (Porter sequences).

## 🔴 REWORK (dry run on the real file caught it — `--day Monday` returned 1 row, should be 9)
Column A is a **merged cell per day-group** in the sheet, so the CSV carries the day (`Monday`) only on the
**first row of the block**; rows 2–9 have an **empty** column A. The importer filters on the literal cell, so
`--day Monday` matched exactly one row — and would have imported **1 child per day, 8 of 179 total, with a
clean-looking green report each time.** Two fixes:
1. **Fill-down column A** — carry the last non-empty value of column A **forward** across the empty rows (that
   is exactly what the merged cell means) **before** the `--day` filter runs. (`Voucher` group included.)
2. **Per-batch count self-check** — the `imported+held+yellow=total` invariant currently guards the **whole
   file**; apply the **same discipline per batch** so an empty-ish batch (1 row for a 9-row day) is **loud, not
   silent**. The lesson here is the report was self-consistent and still wrong — a batch that returns far fewer
   rows than the file's own day-grouping implies must refuse/flag, not print success. (If the expected per-day
   size is knowable from the filled-down column A, assert against it.)
Everything else in the review below stands (AC-7, dry-run-default, PII, phone/DOB/parent/yellow rules, the
excelRow alignment — Porter confirmed record #2 = xlsx row 2, `--header-rows 1` correct). Add a unit test on a
**synthetic** merged-day CSV (day on row 1, blank below) proving fill-down → the full day is selected.

- Assignee: @Jason (BE)
- Depends on: none (owner-run; the REQ-040 wipe precedes it, sequenced by Porter)

## Context (why)
Go-live: load the customer's real **parents + students** from `Student list.xlsx` after the test data is
wiped (REQ-040 reset, owner-run). Wave 1 = **master data only** (no courses/schedule — not in the file).
🔴 **Real children's PII** — the file lives **only** in gitignored `project-docs/`; **never** put a real row
in any tracked file, this task, a log, or output. **The owner runs the importer; you never touch the
customer DB** — you ship the script + he returns the report.

## What to build (smart-scheduler-back, a `scripts/` command — e.g. `bun run import:students`)
Read `Student list.xlsx` (UTF-8-correct parser for Thai — AC-5) and apply **exactly** these rules (guess
nothing — every rule is an AC; full text in SPEC-051):
1. **Phone → prefix `0`; if not exactly 10 digits → hold-back list** (AC-4).
2. **No phone → held back, on a list** (not imported) (AC-9).
3. **One parent per phone; two children share a phone → one parent + two students** (merge, AC-3).
4. **Parent name from column H / a parent-row's name; parent-rows are NEVER students** (reported) (AC-11).
5. **Ambiguous/missing DOB → empty + reported; never guessed** (AC-10).
6. **Yellow rows → excluded entirely** (not created/updated/reported-done), own list (AC-13/16). Take the
   yellow set as an **explicit input** (owner-supplied Excel row numbers) if cell-fill isn't in the export.
7. **Column A preserved verbatim as a note, interpreted by nobody** (AC-12).
8. **Nothing invented** — no course/voucher/program/booking/teacher/time (AC-7).

**Behaviour:**
- **Dry-run by DEFAULT** — prints the report + counts, writes **nothing**; commits only on `--commit`.
- **Day-by-day / batchable + resumable** (a batch = a column-A day, incl. the `Voucher` group); re-running a
  completed batch is a no-op (AC-14). Support "Monday only, then stop".
- **Idempotent** — keyed on parent phone (unique) + student(parent+name); second run creates nothing (AC-6).
- **Row-keyed 3-state report** (AC-2/AC-15): each line = **source Excel row number** (sorted top-down),
  status **✅ ทำได้ / ⚠️ ติด + reason / ⛔ ยังไม่พร้อม (yellow)**, `imported + skipped = N`. Re-produced after
  each real batch (post-run truth). Written to gitignored `project-docs/`. **Never write to the customer.**

## Definition of Done
- [ ] Dry-run prints the row-keyed report + counts, writes nothing; `--commit` imports; a second `--commit`
      of the same batch is a no-op (AC-6/AC-14).
- [ ] Phones stored as 10 digits (`0`+value); non-10-digit + no-phone rows on the hold-back list, never in DB (AC-4/AC-9).
- [ ] Two children on one phone → one parent, two students (AC-3); parent-rows never become students (AC-11).
- [ ] Missing/ambiguous DOB → empty + listed; column A kept as an untouched note (AC-10/AC-12).
- [ ] Yellow rows excluded from create/update/report, on their own list (AC-13/16).
- [ ] No course/voucher/program/booking created (AC-7); Thai renders intact (AC-5).
- [ ] `imported + skipped-with-reason = N`; no row disappears (AC-2).
- [ ] **Pure rule fns unit-tested with synthetic/anonymised rows only** (phone→10-or-holdback, parent-vs-student,
      DOB parse-or-empty, merge keying). `bunx tsc --noEmit` 0 · `bun test` green.
- [ ] No real row anywhere in git; the report lives in `project-docs/` only.

## Implementation Notes / Questions
(Jason fills in. If cell-fill/yellow isn't in the export, ask via SA for the owner's yellow-row list — don't infer.)

## Implementation Notes
**Files:** `src/lib/student-import.ts` (new — all the rules, pure) · `src/lib/student-import.test.ts` (new, 28
tests, **synthetic rows only**) · `scripts/import-students.ts` (new) · `package.json` (`import:students`).

**Shape:** every rule is a pure function in `lib/`; the script is IO + the transaction. That is what let me test
the rules hard without a single real row anywhere near git.

**Rules, as built (SPEC-051 1–9):**
- **Phone (AC-4/AC-9):** strip non-digits → prefix `0` unless it already has one (so a re-export that kept the
  zero is not double-prefixed) → must match `^0\d{9}$`, else **held back with the reason**, never stored.
- **DOB (AC-10):** `DD/MM/YYYY` only, year **2005–2026**, and the date must be real (`31/02` is refused, not
  rolled into March). Anything else ⇒ **empty + reported**, and the child is **still imported** — a missing
  birthday is a note to fill in, not a reason to leave a family out.
- **Parent rows (AC-11):** a **conservative** prefix list (`คุณแม่`, `คุณพ่อ`, `ผู้ปกครอง`, `มารดา`, `บิดา`,
  `แม่น้อง`, `พ่อน้อง`). Held, never created as a student — **but the row still donates its name to the family
  on that phone**, which is the point of the rule. Anything less obvious stays a student row deliberately: a
  broader guess would silently drop real children.
- **Families (AC-3):** keyed on the normalised phone. Two children, one phone ⇒ **one** parent, two students.
  Parent name = column H, else the parent-row's name, else left null.
- **Yellow (AC-13/16):** an **explicit** owner-supplied row-number set (`--yellow 12,15,88` or `--yellow-file`).
  Never inferred from anything. Yellow wins over every other state: not created, not updated, own list.
- **Column A (AC-12):** kept verbatim in the student's note (`แถว N · วันเรียน(จากไฟล์): … · ผู้ปกครอง(จากไฟล์): …`),
  interpreted by nobody — no schedule, no weekday inference.
- **Nothing invented (AC-7):** the script writes `parents` and `students` only, through the existing
  `findOrCreateParentByPhone` / `createStudentForParent` domain helpers (so the 5-per-parent cap and phone
  uniqueness keep enforcing themselves). No course, voucher, booking, teacher or time is created anywhere.

**Behaviour:** dry-run is the **default** (reads, classifies, prints counts, writes the report, touches no DB);
`--commit` writes, in **one transaction**. **Idempotent (AC-6):** parent by phone, student by (parent, name) —
a second `--commit` of the same batch creates nothing and says so. **Batches (AC-14):** `--day "จันทร์"` filters
on column A (case-insensitive, `Voucher` is just another group), so "Monday only, then stop" works.

**Report (AC-2/AC-15):** one line per source row, **sorted top-down by Excel row number**, three states —
`✅ ทำได้` / `⚠️ ติด — reason` / `⛔ ยังไม่พร้อม` — written to a file under `project-docs/`. Produced on **both**
the dry run and the real run, so the owner colours the sheet from post-run truth. The invariant
`imported + held + yellow = total` is **asserted at runtime**: if it ever fails the script **stops before
writing** rather than importing a set it can't reconcile.

**PII discipline:** the console prints only row numbers and counts — never a name, phone or birthday — so a
pasted screenshot can't leak a family. The report (which does name rows) is written to gitignored
`project-docs/`. The test fixtures are invented.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **535 pass / 0 fail** (65 files; +28 here). Plus an
end-to-end **dry run on a synthetic 3-row CSV** in the OS temp dir (not the repo): batch filter, yellow
exclusion, malformed-DOB pass-through and the family merge all behaved, report written, **no DB connection
made**. I have run nothing against any real database.

## Questions
- **Q1 (input format — needs your call before the owner runs it):** I built the reader for **CSV UTF-8**, not
  `.xlsx`. Reason: parsing xlsx means adding an npm dependency to a **go-live** path, and the yellow set has to
  arrive as an explicit input either way (AC-13), so the xlsx's one unique advantage — cell fill — isn't used.
  The owner's step becomes *Excel → Save As → CSV UTF-8*. If you'd rather have native xlsx, say so and I'll add
  a parser behind the same interface (`parseCsv`/`toRawRows` are the only IO-facing seam).
- **Q2 (interpretation, flagged not assumed):** `ชื่อ (ชื่อเล่น)` is split into `name` + `nickname`. A cell with
  no parenthetical becomes the name with an empty nickname. If the customer means the whole cell to be the
  nickname, that's a one-line change.
- **Q3 (column mapping):** I mapped A/C/D/E/F/G/H per the SPEC's letters, skipping **B** (row no.) and using the
  file's own line number as `excelRow`, with `--header-rows` (default 1) to align it to what the owner sees. If
  the real export has a different header depth the numbers shift — worth the owner confirming on the dry run,
  since the whole report is keyed on it.
- **Q4:** gender/nationality are passed through **verbatim** from columns F/E into the existing free-text fields
  (no mapping to an enum, nothing invented). Confirm that's what you want.

  > **answers (Sober 2026-08-19):**
  > **Q1 (CSV UTF-8 vs xlsx) — CSV UTF-8 approved.** Right call — don't add an xlsx dependency to a go-live-critical
  > path, and the yellow set is an explicit input regardless (AC-13), so xlsx's only edge (cell fill) buys nothing.
  > **One operator note that must reach the owner (→ Porter):** the phone column has to export as **full integer
  > digits**, not scientific notation (`8.64…E+08`), and the save must be **CSV UTF-8** specifically (Thai, AC-5). If a
  > phone exports as scientific it becomes >10 digits → your rule **holds it back with a reason** (fail-safe, never
  > stored wrong), so a bad export shows up as mass hold-backs on **Monday's dry run** — exactly why we rehearse Monday
  > first. So: format the phone column to show full digits → Save As → CSV UTF-8.
  > **Q2 (`ชื่อ (ชื่อเล่น)` split) — ratified.** name + parenthetical→nickname; a plain cell → name is fine because the
  > calendar/People render `nickname || name` (TASK-142), so a nickname-only cell still displays. If, on the dry-run,
  > the owner sees full names where he expects nicknames, treating a plain cell as the *nickname* is a one-line change.
  > **Q3 (excelRow / header depth) — ratified.** Keying the report on the **physical Excel row** (what he walks in the
  > online sheet), with `--header-rows` to align, is correct — not column B's `No.`. A header-depth mismatch surfaces
  > immediately on Monday's dry run as wrong row numbers; good that it's a parameter, not a constant. Owner confirms on Monday.
  > **Q4 (gender/nationality verbatim) — ratified.** Verbatim passthrough into free-text, no enum mapping, nothing
  > invented (AC-7). Correct.

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-19).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **535/0** (28 new,
synthetic rows only). Read the critical paths:
- **AC-7 nothing-invented — verified:** grep shows **zero** `coursePackages`/`vouchers`/`bookings` writes; the script
  writes **only** parents/students via `findOrCreateParentByPhone`/`createStudentForParent` (so phone-uniqueness + the
  5-per-parent cap self-enforce). People only.
- **Fail-safe by construction:** dry-run is the **default** (writes nothing), `--commit` in one tx, idempotent (parent
  by phone, student by (parent,name)); and the **`imported+held+yellow=total` invariant is asserted at runtime — the
  script STOPS before writing if it can't reconcile** (AC-2). Phone `^0\d{9}$`-or-hold (AC-4/9); DOB real-date +
  2005–2026-or-empty, child still imported (AC-10); conservative parent-row prefixes → held + donate the family name,
  never a student (AC-11); yellow = explicit owner input, wins over everything, own list (AC-13/16); column A kept
  verbatim as a note (AC-12); batch by `--day` (AC-14).
- **PII discipline — verified:** the **console prints only row numbers + counts** (no name/phone/DOB), so a pasted
  screenshot can't leak a family; the named report is written to gitignored `project-docs/`; test fixtures invented.
- **Verdict: DONE.** Owner-run: dry-run each day → review → `--commit`, Monday first (Porter sequences: REQ-040 wipe →
  verified backup → this). One operator note (Q1 phone-column/CSV-UTF-8) must reach him via Porter.

## Rework (2026-08-19) — the merged-cell defect the dry run caught
**Both fixes in, plus the tests that make them un-shippable-again.**

1. **Fill-down column A (`toRawRows`).** A merged cell means "this value applies to every row it spans", and the
   CSV export only carries it on the block's first row. The last non-empty day is now carried forward; a blank
   spacer line inside a block doesn't reset it (a spacer doesn't end a merge). `--day Monday` now selects the
   whole block.
2. **Per-batch self-check (`checkBatchSize`, called before anything is classified).** The batch is counted
   **against the file**, not against itself: the file knows Monday has 9 rows, so selecting 1 is a **defect**,
   not a result. Mismatch → the script prints every day group with its size and **exits non-zero without
   writing or reporting**. An unknown `--day` fails the same way instead of quietly importing nothing.
   That is the real lesson from this one: the old report was self-consistent *and wrong*, so the check had to
   come from outside the batch.

**Why it mattered:** 8 days × 1 row = 8 of 179 children, each batch reporting a clean ✅, the owner colouring his
sheet green from it, and the customer finding out. Your dry-run-first sequence is what stopped that.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **554 pass / 0 fail** — 8 new tests here (fill-down across
blocks, batch selects the whole day, `batchSizes`, complete-batch passes, **1-of-2 fails with expected/got**,
unknown day fails, whole-file still has to add up). Plus a re-run of the end-to-end dry run on a **synthetic**
merged-cell CSV: `batch นี้ควรมี 3 แถว · ได้ 3 ✔` where the old code would have said 1.
🔴 **Not verified by me:** Porter's real per-day numbers (Mon 9 · Tue 9 · Wed 4 · Thu 11 · Fri 3 · Sat 55 ·
Sun 80 · Voucher 8 = 179 / 113 ✅ / 39 ⚠️ / 27 ⛔). The file is the customer's and stays on the owner's machine —
**the fixed dry run either reproduces those numbers or one of us is wrong, and that is exactly the check to run
before the wipe.** `excelRow` alignment is already confirmed right by his last run (`✅ แถว 2`), and I changed
nothing about it.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-150 | scheduler-back (BE): 🔴 **GO-LIVE wave-1 importer** — `import:students` script: parse `Student list.xlsx` (Thai-safe), apply all 16 REQ-055 rules (phone→10-or-holdback · no-phone/parent-rows/yellow → lists · DOB-never-guessed · col A preserved · nothing invented) · **dry-run default + `--commit`** · day-by-day/idempotent · row-keyed 3-state report to `project-docs/`. Owner-run; team never touches customer DB; PII never in git. Pure rule fns unit-tested (synthetic rows) | SPEC-051 (REQ-055) | ✅ **DONE — rework SA-reviewed Sober 2026-08-19.** Reproduced tsc 0 · import tests **35/0**. Fill-down of col A verified (`lastDay` carried, blank spacer doesn't reset the merge) → `--day` selects the full block; per-batch guard (`batchSizes`/`checkBatchSize`) **exits non-zero without writing** on a short batch. Core stands (AC-7 people-only, dry-run, PII, phone/DOB/parent/yellow, excelRow). **🔴 GO-LIVE IMPORTER COMPLETE.** — _prior:_ 🔎 REVIEW — rework fixed (Jason 2026-08-19): fill-down column A (a merged cell spans its block; a blank spacer does not end it) + a per-batch self-check counted against the FILE — a day the file says has 9 rows must select 9, else the script prints every day-group size and exits non-zero WITHOUT writing or reporting; an unknown --day fails the same way. tsc 0 · 554/0, 8 new tests incl. the exact 1-of-2 case; synthetic merged-cell dry run now reads `ควรมี 3 · ได้ 3 ✔` where the old code said 1. Porter’s real per-day numbers (179 = 113/39/27) are the owner’s dry run to confirm — the file never leaves his machine. — originally REWORK (Sober 2026-08-19) — the dry run caught a real defect.** Column A is a **merged cell per day-group** → CSV carries the day only on row 1, blank below → `--day Monday` matched **1 of 9** (would've imported 8/179 with a clean-looking report). Fixes: **(1) fill-down column A** before the `--day` filter; **(2) per-batch count self-check** (an empty-ish batch must be loud, not silent). Core still accepted (AC-7, dry-run, PII, phone/DOB/parent/yellow, excelRow alignment confirmed record #2=xlsx row 2). — _prior:_ ✅ DONE (SA-reviewed Sober 2026-08-19) · owner-run dry-run→commit = the go-live (Porter sequences REQ-040 wipe → verified backup → this). Reproduced tsc 0 · **535/0** (28 synthetic). **AC-7 verified** (0 course/voucher/booking writes — parents/students only via domain helpers); **fail-safe** (dry-run default; `imported+held+yellow=total` asserted at runtime → STOPS before writing if it can't reconcile); phone `^0\d{9}$`-or-hold, DOB real-or-empty, parent-rows/yellow → own lists, col A verbatim; **PII-safe** (console = counts+row-nums only, named report → gitignored `project-docs/`). Q1–Q4 answered (CSV UTF-8 ok + phone-column operator note → owner; splits/mapping ratified). — _prior:_ 🔎 REVIEW (Jason 2026-08-19 — `bun run import:students`, **dry-run by default**, `--commit` writes in one tx via the existing `findOrCreateParentByPhone`/`createStudentForParent` (5-per-parent cap + phone uniqueness keep enforcing themselves). Idempotent: parent by phone, student by (parent,name). `--day` batches on column A (Voucher included). Yellow = an **explicit** row-number input, never inferred. Phone 0-prefix→exactly-10-or-held; DOB DD/MM/YYYY 2005–2026 + real-date check, else **empty + reported but the child still imports**; parent-rows held but they donate the family name; column A kept verbatim as a note. Row-keyed 3-state report to `project-docs/`, and `imported+held+yellow=total` is asserted at runtime — mismatch **stops before writing**. Console prints row numbers + counts only (no PII). tsc 0 · **535/0** (+28 synthetic-only tests) + an end-to-end dry run on a synthetic CSV, **no DB touched**. 🔴 **Q1: I built a CSV UTF-8 reader, not xlsx** — adding an npm parser on a go-live path is your call; owner step becomes Save As → CSV UTF-8. Q3: `excelRow` depends on `--header-rows` (default 1) — worth confirming on the dry run since the whole report is keyed on it.) | Jason | — |
```
