# TASK-153: `subjects:add` — owner-run, dry-run-first program creator (BE)

- Source: SPEC-053 (REQ-058)
- Status: DONE (SA-reviewed Sober 2026-08-22) — mechanism complete; owner runs the runsheet below on sid→uat

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-22).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **578/0** (plan builder
14/0, +14 overall). Read the code:
- **Pure decision factored out** (`src/lib/subject-add-plan.ts`, mirroring `db-reset-plan.ts`) so every rule is
  DB-free tested. `planSubjectAdd` returns `{ok, problems, willCreate, alreadyPresent, group, link}`; the script
  (`scripts/add-subject.ts`) is thin IO around it.
- **AC-5 by construction:** insert-if-missing by unique `name` (`onConflictDoNothing({target: subjects.name})`);
  an existing program is a no-op — the tool cannot rename/regroup/delete, including the KEPT combined
  `Bike / Scooter / Balance Cruiser` (test pins it).
- **AC-4:** `--group` validated against `PRICE_GROUPS` before any write; a typo is refused (no unsellable row).
- **AC-3:** `--teacher` resolves by id then unique nickname; **ambiguous or missing is refused, never first-wins**
  (verified `teacher_subjects` has composite PK `(teacherId, subjectId)`, so the bare `onConflictDoNothing()` on the
  link is idempotent — a re-run can't duplicate).
- **House safety intact:** dry-run default (`__dry_run_rollback__` throw), one transaction, no DDL, console = program
  /teacher names + counts only (catalogue data, not PII). `--commit` writes; a second run reports already-present.
- **AC-6:** name+group are args ⇒ a tenth program is a command, not a deploy.

**Two notes (neither blocks DONE):**
1. **Cosmetic:** `formatSubjectAddPlan` prints `จะสร้างใหม่` on the *refusal* path too (it keys on `alreadyPresent`,
   not `willCreate`), so a refused run shows "will create" directly above its 🔴 reason. Outcome is unambiguous
   (nothing is written; the 🔴 line + "refused before any write" are shown) — worth a one-line polish next time this
   file is touched, not a rework.
2. **DoD gap I closed for Jason:** the "documented nine-line invocation in the task notes" box was left unchecked
   (notes empty). Runsheet added below so the owner has it.

**Verdict: DONE.** The missing mechanism exists; REQ-058's programs are now an owner-run command away.

## Runsheet for the owner (SA-supplied) — sid FIRST, then uat
For each program: **dry-run, read the plan, then re-run with `--commit`.** All nine are `--group bike-skate`.
Names are the customer's exact words — do not abbreviate or split the `X & Y` ones.

```bash
# from smart-scheduler-back, env pointing at sid (then repeat with env → uat)
bun run subjects:add --name "Bike"                      --group bike-skate            # dry-run → then add --commit
bun run subjects:add --name "Balance Cruiser"           --group bike-skate
bun run subjects:add --name "Balance Bike"              --group bike-skate
bun run subjects:add --name "Scooter"                   --group bike-skate
bun run subjects:add --name "Inline Skate & Bike"       --group bike-skate
bun run subjects:add --name "Surfskate & Bike"          --group bike-skate
bun run subjects:add --name "Surfskate & Inline Skate"  --group bike-skate
bun run subjects:add --name "Bike & Scooter"            --group bike-skate
bun run subjects:add --name "Surfskate & Freeskate"     --group bike-skate
```
Teacher links (AC-3) come later once the owner says who teaches each — append `--teacher "<nickname>"` to the same
command, e.g. `subjects:add --name "Bike" --group bike-skate --teacher "ก้อง" --commit`.
- Assignee: @Jason (BE)
- Depends on: none (BE/data-only; **no FE change** — the booking UI reads `teacher.subjectOptions`, which is data)

## Why (one paragraph)

The customer is live on `uat` and cannot book programs that do not exist, and **`subjects` rows are created only in
`db/seed.ts:46` — no API, no UI, no command.** That missing mechanism is the real defect; the nine programs are its
first use. Everything else REQ-058 seemed to need is already data: the booking modal's subject list is
`selectedTeacher.subjectOptions` (front `…/Calendar/Modal/BookingModal.tsx:596`), price + voucher eligibility key
off `price_group` (`voucherAllowsProgram("bike-skate") === true`), and all nine map to `bike-skate`. So this task is
just the owner-runnable creator — nothing more.

## What to build (smart-scheduler-back)

A script `scripts/add-subject.ts`, wired as `"subjects:add"` in `package.json`, **mirroring the house safety
pattern of `scripts/db-reset.ts` and `scripts/import-students.ts`**:

1. **Args:** `--name "<program>"` (required, verbatim) · `--group <bike-skate|onewheel|balance-private|balance-group>`
   (required, **validated against the union — refuse an unknown group, do not create an unsellable row by typo**) ·
   `--teacher <nickname|id>` (optional) · `--commit` (absent = dry run).
2. **Dry run by default:** open one transaction, compute + print the plan (would-create / already-present, the
   group, any teacher link), then **throw to ROLLBACK** (same `__dry_run_rollback__` idiom as `db-reset.ts`).
   Nothing is written without `--commit`.
3. **Insert-if-missing by unique `name`:** `insert(subjects).values({name, priceGroup:group}).onConflictDoNothing({target: subjects.name})`.
   An existing program prints **"already present — unchanged"** and is never updated or deleted. (This is what
   makes AC-5 hold — the tool is structurally incapable of touching the nine existing programs or the KEPT
   combined `Bike / Scooter / Balance Cruiser`.)
4. **Optional teacher link:** if `--teacher` is given, resolve the teacher (by id, else unique nickname; ambiguous
   or missing ⇒ refuse with a clear message, no partial write), then insert the `teacher_subjects` row
   insert-if-missing. Enables AC-3 in one command the moment the owner names who-teaches-what.
5. **Console = program/teacher names + counts only** (catalogue data, not PII — no student/parent rows are read or
   written). Safe to paste back.
6. **No DDL. One transaction. `sid` first, then `uat`, owner-run** — like every environment action.

### Pure plan builder (so it is testable without a DB)

Factor the decision into a pure function in `src/lib/` (mirror `db-reset-plan.ts`), e.g.
`planSubjectAdd({name, group, existingNames, teacher})` → `{ willCreate, alreadyPresent, groupValid, link }`, so the
"insert-if-missing / validate group / refuse unknown teacher" logic is unit-tested with no database.

## Definition of Done

- [ ] `bun run subjects:add --name "Bike" --group bike-skate` (no `--commit`) prints the plan and **writes nothing**
      (verify count unchanged).
- [ ] `--commit` creates the row; a second `--commit` run reports "already present — unchanged" and does **not**
      error or duplicate (idempotent; AC-5).
- [ ] An unknown `--group` and an unknown/ambiguous `--teacher` are **refused before any write**, with a clear message.
- [ ] `--teacher` links `teacher_subjects` insert-if-missing (AC-3 mechanism).
- [ ] Unit tests on the pure plan builder: new name → create · existing name → no-op · bad group → refused ·
      teacher resolve/refuse.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green.
- [ ] The documented nine-line invocation (all `--group bike-skate`, names verbatim from SPEC-053) is written in
      the task notes for the owner to run — **you do not run it** (owner-run on `sid` then `uat`).

## Notes / Questions

(Jason fills in. Names — copy exactly, they are the customer's words:
`Bike · Balance Cruiser · Balance Bike · Scooter · Inline Skate & Bike · Surfskate & Bike ·
Surfskate & Inline Skate · Bike & Scooter · Surfskate & Freeskate`.)

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-153 | scheduler-back (BE): **`subjects:add`** — owner-run, **dry-run-first** program creator. Args `--name` (verbatim) · `--group` (validated union, refuse typo) · optional `--teacher <nickname\|id>` (links `teacher_subjects`) · `--commit`. Insert-if-missing by unique `name` (existing = no-op ⇒ AC-5 by construction; can't touch the KEPT combined program). One tx, no DDL, console names+counts only, sid-first. Pure plan builder unit-tested. Ships the missing mechanism (subjects live only in `db/seed.ts:46`); owner runs the nine `--group bike-skate`. **No FE change** — booking UI reads `teacher.subjectOptions`. | SPEC-053 (REQ-058) | ✅ **DONE (SA-reviewed Sober 2026-08-22)** — reproduced tsc 0 · **578/0** (+14, plan builder 14/0). Insert-if-missing by unique name (AC-5 by construction — no update/delete path, can't touch the KEPT combined program), `--group` validated (AC-4), `--teacher` id/unique-nickname-else-refuse (AC-3; `teacher_subjects` composite PK ⇒ link idempotent), dry-run default/one-tx/no-DDL/counts-only, args ⇒ AC-6. **Nine-line owner runsheet supplied in the task** (Jason left that DoD box empty; SA filled). Minor cosmetic (refusal path prints "will create" above its 🔴) noted, non-blocking. **Mechanism DONE; awaiting owner-run on sid→uat + Q2 teacher links.** — _prior:_ 🔎 REVIEW (Jason 2026-08-22 — `bun run subjects:add --name … --group … [--teacher …] [--commit]`. Pure `lib/subject-add-plan.ts` + script, house pattern: **dry-run default** (plan printed inside a tx that is rolled back via the same `__dry_run_rollback__` sentinel as `db:reset`); **insert-if-missing by unique name** ⇒ AC-5 by construction — the tool has **no update and no delete path**, so it cannot rename/re-group/remove the existing programs or the KEPT combined one (test pins that name as a no-op). Group validated against the real `PRICE_GROUPS` union (a typo would create an unsellable program); unknown **or ambiguous** teacher refused before any write, never resolved by taking the first match. `--teacher` links `teacher_subjects` insert-if-missing in the same tx ⇒ AC-3 is one command once Q2 is answered. Console = catalogue names + counts, no PII. tsc 0 · **578/0** (+14). ⚠️ **The nine-line invocation is written in the task for the OWNER to run (sid → uat); I ran nothing.** Note AC-2 is only *visible* once each program has ≥1 teacher linked — the dropdown is `teacher.subjectOptions`.) | Sober | — |
```
