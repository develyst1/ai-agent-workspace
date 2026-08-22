# SPEC-055: Bulk teacher↔subject link — every teacher can teach every program (REQ-058 req 6 / AC-9-10)

- Source: REQ-058 requirement 6 (owner 2026-08-22: *"ก ให้ทุกครูเห็นสอนได้ทุกอันไปเลย แล้วให้เขามาแก้ทีหลังเอา"*)
- Author: Sober (SA) 2026-08-22
- Status: READY — task cut (TASK-155). BE-only. **The last thing between REQ-058 and DELIVERED** (it makes the 19
  programs selectable — AC-2/AC-3 — which is all that remains after the rows went live on both boxes).

## Why a new script, not a flag on `subjects:add`

Porter's instinct was "probably a flag on the tool Jason built." I looked: `subjects:add` creates **one** subject
and optionally links **one** teacher to it. This operation is a **cross-product** — every teacher × every subject —
which is a different shape; bolting it onto `subjects:add` would overload a create-one command with a
link-everything mode. It is a **sibling** in the same owner-run family (`db:reset` / `import:students` /
`subjects:add`), reusing the house safety pattern but not the code. Small, self-contained.

## Behaviour

A script `scripts/link-all-teacher-subjects.ts`, wired as `teacher-subjects:link-all`, house pattern:

- **Target set (stated, not assumed):** **non-archived** teachers × **active** subjects.
  - `teachers.archived = true` are offboarded and hidden from bookings (`schema.ts:138`) — linking them is dead
    config; **excluded**. `teachers.active = false` (paused) are still employed and can teach when unpaused —
    **included** (pause is availability, not capability).
  - `subjects.active = true` only (an inactive program should not become newly teachable).
- **Dry-run by default:** open one transaction, compute the full matrix, print the summary — **N teachers × M
  subjects = N·M possible links; would-create X; already-present Y** — then **throw to ROLLBACK**. Nothing written
  without `--commit`.
- **Insert-if-missing:** `insert(teacherSubjects).values(pairs).onConflictDoNothing()`. `teacher_subjects` has a
  composite PK `(teacherId, subjectId)` (verified in the TASK-153 review), so the bare on-conflict is idempotent by
  construction — a re-run creates 0 and cannot duplicate.
- **Console = counts + a short per-teacher created/skipped tally** (teacher nicknames + program names are
  catalogue/staff data, not student PII — safe to print, same as `subjects:add`). This is AC-10's evidence.
- **One transaction · no DDL.**

### Run target — BOTH boxes (and why this is not the import hazard)

Unlike the REQ-055 student import, this is **idempotent config, not divergent per-box data** — there is no
name-key, no rename problem, nothing to duplicate. `sid` and `uat` each hold the same 19 subjects; the script links
each box's own teachers to its own subjects. ⇒ **run on both `sid` and `uat`** (order irrelevant; re-runnable).
Stated explicitly per the board's standing-rule note that a run target is chosen by the operation, not by reflex.

## Acceptance mapping

- **AC-9** — one owner-run command links every non-archived teacher to every active subject; dry-run first;
  idempotent (second run creates 0).
- **AC-10** — the run prints teachers × subjects × created/skipped, so the owner can see it did exactly what it
  claims and nothing more.
- **Closes REQ-058 AC-2/AC-3** — with every teacher linked to all 19 programs, each program appears in
  `teacher.subjectOptions` ⇒ selectable in course/single/trial/voucher booking. REQ-058 → DELIVERED once the owner
  runs it on both boxes.

## Recorded trade-off (owner's deliberate choice, not sloppiness)

Linking everyone to everything means every teacher's booking dropdown lists all 19 programs, and `teacher_subjects`
temporarily stops meaning "who can *actually* teach this" until staff prune it in the product. **The owner chose
this** — open by default, corrected later in the UI — over assembling the real 24×19 capability matrix by hand while
the nine programs stayed invisible. The alternative (456 single `subjects:add --teacher` runs) is an error-prone
trap, which is the whole reason this bulk tool exists.

## Out of scope

- Any pruning / "who really teaches what" UI — that is the staff's in-product job, by the owner's design.
- Creating subjects or teachers (that is `subjects:add` / existing flows).
- Removing links — this tool only ever adds. (If un-linking is ever needed it is a separate, deliberate tool.)
