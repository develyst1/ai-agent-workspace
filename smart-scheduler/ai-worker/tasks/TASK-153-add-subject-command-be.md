
## Implementation Notes
**Files:** `src/lib/subject-add-plan.ts` (new, pure) · `src/lib/subject-add-plan.test.ts` (new, 14 tests) ·
`scripts/add-subject.ts` (new) · `package.json` (`subjects:add`).

Built to the house pattern (`db-reset.ts` / `import-students.ts`): the decision is a pure function, the script is
IO + one transaction.

- **Dry-run by default** — the plan is printed inside a transaction that is then **rolled back** via the same
  `__dry_run_rollback__` sentinel `db:reset` uses, so a dry run cannot write even by accident.
- **Refused before any write:** an invalid `--group` (checked against the real `PRICE_GROUPS` union, not a
  hand-copied list), an empty `--name`, an unknown teacher, and an **ambiguous** nickname — that last one is
  refused rather than resolved by taking the first match, the same discipline as TASK-047's nickname rule.
- **Insert-if-missing by unique `name`** (`onConflictDoNothing`), so an existing program prints
  *"มีอยู่แล้ว — ไม่แก้ไข"* and is never updated. **AC-5 holds by construction**: the tool has no update and no
  delete path at all, so it cannot rename, re-group or remove the nine existing programs or the KEPT combined
  `Bike / Scooter / Balance Cruiser`. A test pins that specific name as a no-op.
- **`--teacher`** links `teacher_subjects` insert-if-missing, in the same transaction — AC-3 becomes one command
  the moment the owner answers who-teaches-what, with no further code.
- **Console = program/teacher names + counts.** No student or parent row is read or written by this script.
- No DDL. One transaction. Not run by me against any database.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **578 pass / 0 fail** (69 files; +14). Tests cover new-name
creates · existing-name no-op · the KEPT combined name · whitespace not creating a near-duplicate · all four real
groups accepted · a typo'd group refused · unique nickname resolves · id beats nickname · ambiguous refused ·
unknown refused · no-teacher is valid · the operator output.

### 🔴 The nine-line invocation — for the OWNER to run (sid first, then uat). I have not run it.
Names verbatim from SPEC-053/REQ-058; all `--group bike-skate` (⇒ 4,790 / 6,490 / 9,790 and voucher-eligible by
the group, per Sober's grounding). **Run each without `--commit` first if you want to see the plan.**
```
bun run subjects:add --name "Bike" --group bike-skate --commit
bun run subjects:add --name "Balance Cruiser" --group bike-skate --commit
bun run subjects:add --name "Balance Bike" --group bike-skate --commit
bun run subjects:add --name "Scooter" --group bike-skate --commit
bun run subjects:add --name "Inline Skate & Bike" --group bike-skate --commit
bun run subjects:add --name "Surfskate & Bike" --group bike-skate --commit
bun run subjects:add --name "Surfskate & Inline Skate" --group bike-skate --commit
bun run subjects:add --name "Bike & Scooter" --group bike-skate --commit
bun run subjects:add --name "Surfskate & Freeskate" --group bike-skate --commit
```
Re-running the whole block is safe — every line reports "already present — unchanged" the second time.
⚠️ **A program with no teacher linked will not appear in the booking dropdown** (the list is
`teacher.subjectOptions`). So AC-2 is only *visible* once REQ-058 Q2 is answered and each program gets at least
one `--teacher <nickname>` run — the mechanism is here, the who is still owner-owed.

## Questions
- Q1 (non-blocking): the combined `Bike / Scooter / Balance Cruiser` stays untouched, per SPEC-053's out-of-scope
  note. Once the nine exist, its 3 live courses still point at the combined program — if the owner ever wants
  those migrated, that is a separate REQ and needs a data decision, not this tool.

  > answer: (Sober)
