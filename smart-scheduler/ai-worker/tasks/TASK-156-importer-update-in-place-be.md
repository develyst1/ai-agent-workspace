# TASK-156: Importer updates in place — safe re-import against an edited sheet (REQ-059) (BE)

- Source: SPEC-056 (REQ-059)
- Status: DONE (SA-reviewed Sober 2026-08-22) — REQ-059 complete; wipe-and-re-import retired as the correction path

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-22).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **613/0** (update-plan
13/0, +13). Read the code:
- **Pure `lib/student-update-plan.ts` is exactly the ruling:** three cases — parent-new→create · exact name→update ·
  known-parent-no-name-match→**`review-rename`** (candidates carried, never auto-created/updated). Both sides
  normalised via `lib/demographics.ts` before comparing (so `Male` vs `male` isn't a phantom diff every run);
  fill-empty→change, correction→change with `from→to`, **blank sheet cell never blanks a stored value** (→ `kept`),
  import-owned fields only (`birthDate`/`gender`/`nationality`; `name` is the match key, never overwritten here).
- **The three-case wiring in the script is correct, including the subtle dry-run path:** `before` is a **read-only**
  parent lookup; `parent` only `findOrCreate`s on `--commit` (else `before ?? null`); `parentIsNew: !before`
  classifies identically in both modes; every write is `if (commit)`-guarded inside the transaction, and dry-run
  throws `__dry_run_rollback__`. **So the dry-run reads but cannot write** — Jason flagged this evolution from
  wave-1's no-DB dry-run, and it's the right call: a field diff (AC-2) is impossible without reading stored values.
- **`review-rename` is the load-bearing safety** — the `เอแคลร์ → เอแคลร์ อังศุมาลิณณ์` shape is held with the
  candidate child named, and a genuine new sibling is held too (both pinned by tests). **31 silent duplicate-forks →
  31 explicit review lines**, exactly as ruled.
- **+AC-8 dual-phone:** `splitPhones` on `,`/`/`, first valid number is the family key, the rest echoed
  ("เบอร์สำรอง") — the row imports, not held. **AC-6:** immediate re-run = all-unchanged (normalised no-op).

**Verdict: DONE.** REQ-059 is complete — the importer now corrects the customer's edited sheet in place without ever
forking the roster, and "wipe and re-import" is retired as the correction mechanism.

## Conflict policy (owner, via Porter)
Built to the specced default: **sheet wins on a non-empty conflict, every change shown in the dry-run diff.** One
branch in `planStudentUpdate` (turn the `correction` case into a `review` kind) flips it to hold-conflicts if the
owner prefers — non-blocking, his call.
- Assignee: @Jason (BE)
- Depends on: `lib/demographics.ts` (TASK-154, DONE) — reuse it for gender/nationality normalisation on update.
  BE-only, owner-run, no migration.

## Why (one paragraph)

Wave 1 imported **insert-only** (match → skip, else create). That was right for an empty box; it is wrong now — the
customer has attached courses to these students (so no wipe-and-re-import) and keeps editing the sheet, including
**31 student renames** that the current `(parent phone, name)` match would turn into **31 duplicate children**. The
importer must update in place, and must make a rename a **human decision, not a guess**.

## What to build (smart-scheduler-back — the `import:students` script + its pure helpers)

Today: `findOrCreateParentByPhone` → `listStudentsOfParent` → `existing.some(name===p.name)` skips, else
`createStudentForParent` (`scripts/import-students.ts:113-131`). Change the per-row resolution to three cases:

1. **Parent newly created by this phone** ⇒ **CREATE** the child (AC-1).
2. **Parent exists AND exact name match** ⇒ **UPDATE in place** (rules below).
3. **Parent exists AND no name match** ⇒ **HOLD as `review: possible rename`** — never auto-create, never
   auto-update. Report the parent's existing children (+DOBs) beside the sheet name (+DOB) (AC-5, +AC-9).

### Update rules (case 2), all via a pure, tested diff helper

Add a pure `planStudentUpdate({ sheet, stored })` → `{ changes: Array<{field, from, to}>, kept: string[] }` so the
logic is unit-tested with no DB. Rules:
- Normalise `gender`/`nationality` with **`lib/demographics.ts`** on **both** sides before comparing (so `Male` vs
  `male` is not a diff).
- **Fill empties** (stored empty, sheet has value) → change.
- **Correction** (both present, differ) → change, recorded as `field: from → to`.
- **Never blank** (sheet empty, stored has value) → no change, add to `kept`.
- Import-owned fields only: `dob`, `gender`, `nationality` (and parent `name` fill-if-empty). **`name` is the match
  key — not overwritten here** (a changed name is case 3). **Never** read or write courses/bookings/vouchers/quota/
  plans/LINE/notes.

### Dual-phone (+AC-8)

Before the phone rule, split the phone cell on `,` or `/`; the **first valid 10-digit** number is the parent key;
echo the remaining number(s) in the report as "second contact: …" (not stored). The row imports; it is **not** held
for having two numbers.

### Report (AC-7) — per Excel row

`created` · `updated` + `field: from → to` list · `unchanged` · `held` + reason · **`review: possible rename`** +
candidate child · echoed Note column · echoed second contact. No bare counts.

## Definition of Done

- [ ] Dry-run default; `--commit` writes; per-row report as above; **counts never stand alone**.
- [ ] AC-1 create · AC-2 correction updates and is **named in the dry-run** before write · AC-3 empty cell never
      blanks · AC-6 immediate re-run = 0 created / 0 updated / all unchanged.
- [ ] AC-5/+AC-9: a renamed row (name-miss under a known parent) is **held as `review: possible rename`** with the
      candidate child named — **no duplicate created.** Unit-tested with the `เอแคลร์ → เอแคลร์ อังศุมาลิณณ์` shape.
- [ ] +AC-8: a two-number phone cell imports on the first number, echoes the second, is not held for that reason.
- [ ] AC-4: pure helper touches only import-owned fields; a synthetic student "with a course" is unaffected across
      an update (assert the update path never references course/booking/voucher tables).
- [ ] Pure `planStudentUpdate` unit tests: fill-empty · correction-with-diff · never-blank · normalised no-op
      (`Male`/`male`) · import-owned-only.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green.
- [ ] You run **nothing** against a DB. **Runsheet note:** run target is **`uat`** (the box holding the customer's
      edited-sheet corrections) — NOT sid-first; this is divergent data, not a schema migration (see the board's
      standing-rule note). Dry-run → owner reviews the field diffs → `--commit`.

## Notes / Questions

(Jason fills in. One owner decision is pending via Porter — conflict policy (sheet-wins-shown vs hold-conflicts);
default is **sheet wins, every change shown in the dry-run**. Build to the default; it is a small branch to flip if
the owner prefers hold. Do **not** attempt to auto-resolve the current 31 renames — that is a one-time human
reconciliation outside this tool.)

## Implementation Notes
**Files:** `src/lib/student-update-plan.ts` (new, pure) · `src/lib/student-update-plan.test.ts` (new, 13 tests) ·
`src/lib/student-import.ts` (dual-phone in `normalizeImportPhone`) · `scripts/import-students.ts` (the three-case
resolution + the per-row report lines).

**The three cases, exactly as ruled:** parent new ⇒ **create** · exact name match ⇒ **update in place** · known
parent, no name match ⇒ **`review: possible rename`**, held, with the parent's existing children (+DOBs) named
beside the sheet's name. Nothing is created and nothing is updated for a review row — that is the line between
"31 review questions a human answers in seconds" and "31 duplicate children next to children that already have
courses attached".

**Update rules** (pure `planStudentUpdate`, all tested): gender/nationality normalised via `lib/demographics.ts`
on **both** sides before comparing (so `Male` vs stored `male` is not a spurious diff every run) · fill-empty →
change · correction → change, recorded `field: from → to` · **sheet blank never blanks a stored value** — it goes
to `kept` and is reported (the `คุณมะเหมี่ยว` protection) · import-owned fields only (`birthDate`, `gender`,
`nationality`). `name` is the match key and is never overwritten here — a changed name is case 3 by definition.

**+AC-8 dual phone:** `normalizeImportPhone` now splits on `,` / `/`, keys the family on the **first valid**
number, and returns the rest as `others`; the row imports and the extra number is echoed in the report
("เบอร์สำรอง: …"). Not a hold.

🔴 **One consequence of AC-2 worth calling out: the dry run now READS the database.** It has to — "show the field
diff before writing" is impossible without comparing against what is stored. It reads inside a transaction that
is then **rolled back by the same `__dry_run_rollback__` sentinel** the other scripts use, so a dry run still
**cannot write**. That is a change from wave 1's "no DB connection at all", and I'd rather flag it than have you
find it.

**Report per row (AC-7):** `สร้างใหม่` · `อัปเดต — field: from → to · คงค่าเดิม (ไฟล์ว่าง): …` · `ไม่เปลี่ยนแปลง` ·
`⚠️ review: possible rename` + candidates · `เบอร์สำรอง` echo — plus the existing held/yellow lines. Counts never
stand alone; every line carries its Excel row.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **613 pass / 0 fail** (72 files; +13). Tests pin: create ·
unchanged (AC-6 re-run) · `Male`/`male` no-op · fill-empty · correction with the rendered diff · **blank never
blanks** · import-owned-only · **the `เอแคลร์ → เอแคลร์ อังศุมาลิณณ์` rename held with the candidate named** · a
genuine new sibling also held · the right child matched among several · dual-phone split.

⚠️ **I ran nothing against a database.** **Run target: `uat`** (the box holding the customer's edited-sheet
corrections) — **not** sid-first: this is divergent data, not a schema migration. Dry-run → the owner reads the
field diffs and the review lines → `--commit`.

**Conflict policy:** built to the default you specced — **sheet wins, every change shown in the dry-run**. If the
owner prefers conflicts held, it is one branch in `planStudentUpdate` (turn the `correction` case into a
`review` kind); say the word.

## Questions
- Q1: the 31 existing duplicate-forks are a **one-time human reconciliation** out of this tool, as you scoped —
  worth confirming Porter has that on his list, because the tool will now report those children as
  `review: possible rename` on every future run until someone merges them, and repeated identical review lines
  are how a report starts getting skimmed.

  > answer: (Sober)
