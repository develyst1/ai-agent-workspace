# SPEC-051: Wave-1 student + family importer (REQ-055 go-live, master data only)
- Source: REQ-055
- Status: ACTIVE

## Scope
The **importer only** (the create side). The **wipe** is the existing REQ-040 reset (owner-run, sequenced
by Porter — backup-verified first). This spec = a **repeatable, dry-run-default, day-by-day, owner-run
importer** that loads the customer's real **parents + students** from `Student list.xlsx` and produces a
**row-keyed reconciliation report**. **Wave 1 = master data only** (no courses/schedule — that data isn't in
the file; wave 2 later).

🔴 **PII:** the file holds real children's names, DOBs, parents' phones. It lives **only** in gitignored
`project-docs/` and **never** enters a tracked file, this spec/task, a log, or pasted output. The team
**never runs the importer** against the customer env — the **owner runs every step**; the team ships the
script + reads back the report he returns (brownfield rule).

## Input (column shape — confirmed by owner; NO rows here)
`Student list.xlsx`, one sheet, cols A–H: **A** child's class day (preserved, wave-2 only — AC-12) · **B**
row no. · **C** name (Thai nicknames, some `nick (nick)`) · **D** DOB (`DD/MM/YYYY`, some malformed) · **E**
Thai/Foreign · **F** Gender · **G** parent phone (Excel dropped the leading 0) · **H** family/parent-name
note (e.g. a mother's name). ~176 named rows.

## The rules (every one is an AC — apply exactly, guess nothing)
1. **Phone → 10 digits or hold back (AC-4):** prefix `0` to the sheet value; if the result is **not exactly
   10 digits**, do **not** store it — the row goes on the hold-back list. (1 such row today.)
2. **No phone → HELD BACK (AC-9):** a named row with no phone is **not imported**; it's on the hold-back
   list (a family with no contact can't pair LINE / be found). (~23–32 rows.)
3. **One parent per phone; children merge (AC-3):** two students sharing a phone → **one** parent, **two**
   students. Never two parents. Idempotent merge (AC-6).
4. **Parent name = column H, or a parent-row's name (AC-11, Q8):** where H (or a row that is plainly a parent,
   e.g. `คุณแม่น้อง …`) carries a name, use it as the **parent's name**. **Parent-rows are NEVER created as
   students** — reported for a human decision. (4 parent-rows today.)
5. **Ambiguous / missing DOB → empty + reported (AC-10):** `3072021`, `22022020`, blank, or a non-child year
   → store **empty**, list it. Never guess a birthday.
6. **Yellow rows → EXCLUDED entirely (AC-13/AC-16):** the customer's yellow = "ยังไม่พร้อม / not ready" — these
   rows are **not created, not updated, not reported as done**, and appear on their **own** list (separate
   from "needs confirmation"). (27 rows today.) *(The importer needs the yellow-row set as an input — the
   owner supplies it, since cell fill isn't reliably in a CSV; see Impl note.)*
7. **Column A preserved verbatim, interpreted by nobody (AC-12):** keep the raw value as an untouched note on
   the row; drives nothing (no schedule, no day-of-week inference).
8. **Nothing invented (AC-7):** no course/voucher/program/booking/teacher/time. People only.
9. **Thai text intact (AC-5):** nicknames render with no mojibake/truncation (use a UTF-8-correct xlsx read).

## Behaviour
- **Dry-run by DEFAULT** (the project's OBS-3 idiom): prints the row-keyed report + the counts and **writes
  nothing**; commits only on an explicit `--commit`.
- **Day-by-day / batchable, resumable (AC-14):** run one day's group (column-A day, incl. the `Voucher`
  group), review on screen, then the next. Re-running a completed batch **changes nothing** (idempotency per
  batch). Owner's plan: **Monday first, stop, look, then continue** (Mon–Fri = a low-risk rehearsal before
  the Sat/Sun bulk = 135/176).
- **Idempotent (AC-6):** keyed on parent phone (unique) + student (parent + name/nickname); a second run is
  a no-op. Merge, never duplicate.
- **Row-keyed reconciliation report (AC-2/AC-15) — a WORK CHECKLIST for the owner, not a customer letter:**
  every line carries the **source Excel row number**, sorted top-down, with **exactly three states**:
  **✅ ทำได้** (imported) · **⚠️ ติด + the reason in the same row** · **⛔ ยังไม่พร้อม** (yellow — untouched).
  `imported + skipped-with-reason = N`, no row disappears. Produced **again after each real batch** (post-run
  truth, not just the pre-run prediction) so the owner colours the online sheet green from what actually
  landed. Report goes to gitignored `project-docs/`; **never write to the customer**.

## Constraints / safety
- Owner-run only; dry-run default; backup + wipe (REQ-040) precede the import (Porter sequences: backup
  verified non-zero → wipe confirmed clean → import, per AC-8). No team DB access.
- Report + any examples **anonymised** in anything tracked; the real report lives in `project-docs/`.

## Impl notes (Jason)
- Read the xlsx with a UTF-8-correct parser (Thai). If cell **fill colour** (yellow) isn't readable from the
  export, the importer takes the **yellow-row set as an explicit input** (a list of Excel row numbers the
  owner provides) rather than guessing — do not infer "not ready" from anything else.
- No schema change (parents/students exist; `parents.phone` unique; up to 5 students/parent). Column A + a
  malformed-DOB note land in existing free-text/note fields — don't add columns for wave-1.
- The importer is a `scripts/` command (like `db:reset`/`line:*`), never a route.

## Tasks
- **TASK-150 (BE, Jason)** — the wave-1 importer script per the above: parse `Student list.xlsx`, apply rules
  1–9, dry-run default + `--commit`, day/batch + idempotent, row-keyed 3-state report to `project-docs/`.
  Unit-test the **pure** rule functions (phone→10-or-holdback, parent-vs-student classification, DOB
  parse-or-empty, phone-merge keying) with **synthetic/anonymised** rows only. The owner runs it; the team
  never touches the customer env. Migration: none.

## Questions
(Jason asks here; Sober answers `> answer: ...`. Q6 wording etc. are answered in REQ-055.)
