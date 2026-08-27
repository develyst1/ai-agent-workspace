# SPEC-057: Repair already-stored demographics in place + forgiving readers (REQ-060 Part B)

- Source: REQ-060 Part B (requirements 3/4/5; AC-4 · AC-5 · AC-6 · AC-7 · AC-8)
- Author: Sober (SA) 2026-08-22
- Status: READY. **Part B.1 (the repair) — task cut (TASK-157), BE, owner-run.** **Part B.2 (forgiving readers) —
  specced below, NOT cut** (it is FE + a BE reader and Fern/Tanya are stood down; flagged for Porter to schedule).

Part A (TASK-154, DONE) fixed the importer so **new** rows store `male`/`ไทย`. Part B fixes the rows written
**before** Part A, and hardens the readers so a stray value can't make a field invisible again.

## Measured scope (Porter's `uat` reconciliation, 2026-08-22)

- **`uat`: exactly 24 rows** still capitalised — `Male` 14 + `Female` 10. **1 row (`คุณมะเหมี่ยว`) is already
  `female`** — the customer fixed it by hand and it must **not** be touched.
- **`sid`: the 130-row rehearsal** carries the same stale shape (not customer-facing, but it is where Tanya tests —
  stale gender there would quietly mislead QA).

## Part B.1 — the repair (TASK-157, BE, owner-run)

A script `scripts/repair-demographics.ts`, wired `demographics:repair`, house pattern, **reusing
`lib/demographics.ts`** so the repair and the importer can never diverge:

- **For every student**, compute `normalizeGender(stored.gender)` / `normalizeNationality(stored.nationality)`.
  A row is a **candidate change** only when the normalised value is **non-null AND differs** from what is stored
  (`Male`→`male`, `Thai`→`ไทย`). A value that already normalises to itself (`female`, `ไทย`, `Japan`) is **skipped**
  — which is why **`คุณมะเหมี่ยว` falls out untouched for free** (AC-6, no special case needed).
- **Never blank:** if a stored value is non-empty but unreadable (`normalize().value === null`, e.g. a stray `?`),
  **leave it and report it** — the repair corrects casing, it does not erase data.
- **Only `students.gender` and `students.nationality` are ever written.** Names, DOB, courses, bookings, vouchers,
  quota, plans and LINE links are **never** read or written (AC-5). One transaction, no DDL.
- **Dry-run by default:** prints the plan and rolls back (same `__dry_run_rollback__` sentinel). `--commit` writes
  only the candidate rows.
- 🔴 **PII:** students are real people — **the console prints COUNTS ONLY** (`เพศ: N แถวจะแก้ · สัญชาติ: M แถว ·
  อ่านไม่ออก: K`). The **named per-row report** (`ชื่อ · gender Male→male · nationality Thai→ไทย`) is written to
  **gitignored `project-docs/`**, exactly as `import:students` does — never to the console, never to a tracked file.
- **Idempotent:** a second run finds 0 candidates and says so (AC-4/AC-6).
- **Run target: BOTH boxes** — each box repairs its own stale rows (`uat` 24, `sid` 130). This is idempotent
  normalisation of whatever is stored, not the divergent import, so both boxes is correct and carries no duplicate
  hazard (per the board's standing-rule distinction). Owner runs dry-run → reads the `project-docs/` report →
  `--commit`, on each box.

**AC-7 (SOM demographics named bucket)** is satisfied by the repair for stored data: once the 24 rows read `male`/
`female`/`ไทย`, `som-report.service.ts`'s breakdown buckets them correctly — no reader change needed for the
existing data.

## Part B.2 — forgiving readers (requirement 3) — SPECced, NOT cut (needs Fern; flag to Porter)

Defence-in-depth so **no single non-normalised value can make a field invisible again**, independent of the repair:
- **FE** (`PeopleContent.tsx:62` list · `StudentFormModal.tsx` edit form · `OverviewContent.tsx` / `SomContent.tsx`
  SOM): match gender case-insensitively, and **show an unknown value as-is** rather than rendering `null`.
- **BE** (`som-report.service.ts` breakdown, `attention.ts:72` own-missing): bucket case-insensitively.

**Priority: LOW.** With Part A normalising on write and B.1 repairing history, a non-normalised value should no
longer occur through any supported path; B.2 only guards future edge cases (a manual DB edit, an unforeseen import
shape). It is **not** cut as a task because it is FE work and **Fern is stood down** — raising it for Porter to
schedule rather than cutting into an idle engineer. If Porter wants it, it is one small FE task + a one-line BE tweak.

**Sequencing when B.2 is scheduled (Jason's Q1, SA-agreed):** do the **BE write-path adoption first** — have
`parent.service`/`validation` normalise via `lib/demographics.ts` (the door Part A deliberately left alone). That is
the durable half: it stops a non-normalised value entering through the UI/API at all. The FE forgiving-readers
(show-unknown-as-is, case-insensitive) are the softer display-only guard and can follow.

## Out of scope

- Any change to how demographics are stored (free text stays free text — REQ-060 constraint).
- Names (REQ-059) and the import path itself (Part A, done).

## Acceptance mapping

- **AC-4** dry-run reports exactly which of the 24 it would change, from→to, writes nothing ⇐ B.1 dry-run + report.
- **AC-5** committed: those students show gender/nationality; courses/bookings/names/LINE **byte-identical** ⇐ only
  two columns written, asserted by count + spot-check.
- **AC-6** `คุณมะเหมี่ยว` reported "already correct — skipped", not rewritten ⇐ normalises to itself.
- **AC-7** SOM breakdown counts every repaired student in a named bucket ⇐ post-repair lowercase values.
- **AC-8** (regression) UI-created students unaffected ⇐ they already store normalised values; the repair skips them.
