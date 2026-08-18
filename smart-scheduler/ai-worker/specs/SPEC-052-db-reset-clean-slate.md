# SPEC-052: `db:reset` — clean-slate data reset (keep teachers + subjects + config)
- Source: REQ-040 (design on record 2026-08-11) — now the go-live blocker for REQ-055
- Status: ACTIVE

## Why this exists / history
REQ-040's reset was fully designed and owner-authorized on **2026-08-11**, but the SPEC/TASK were **never
cut** (my gap — REQ-040 was carried as "done bar the owner running it"). The go-live sequence (REQ-055) is
**backup → wipe → import**, and step 2 has no tool: there is no `db:reset` in `package.json`/`scripts/`.
Handing the owner hand-written prod SQL tonight throws away every safety rail. So the reset ships as an
**owner-run, dry-run-default script** — the *safer* path, not a new risk. Cut now under the owner's direct
go-live authorization ("เคลียร์ข้อมูลทั้งหมดที่ sid และ uat"). It runs on **both `sid` and `uat` — `sid`
first** (REQ-055 UPDATE 3 / AC-17/18: rehearse on sid, prove in the product, then uat).

## Scope (from REQ-040, owner-confirmed; SA/BE re-verify FK check against `schema.ts`)
- **KEEP (untouched):** `teachers`, `subjects`, `teacher_subjects`, `badge_types`, `badge_values`,
  `app_settings` — plus the **schema** and **all 3 drizzle ledgers** (never touched).
- **CLEAR (delete rows):** `booking_badges`, `notification_outbox`, `bookings`, `course_packages`,
  `vouchers`, `students`, `parents`, `freelance_budgets`, `teacher_link_requests`, `line_link_sessions`,
  `job_runs`.
- **FK-restrict delete order** (Sober's on-record 08-11 design — a KEEP table never FK-references a CLEAR
  table, so clearing can't cascade into config): `booking_badges → notification_outbox → bookings →
  course_packages → vouchers → students → parents → freelance_budgets → teacher_link_requests →
  line_link_sessions → job_runs`. **BE re-verifies this against `src/db/schema.ts` before writing** (relations
  may have shifted since 08-11).

## Safety model (non-negotiable — this is a mass delete on a real DB)
- **Dry-run by DEFAULT** (the project's OBS-3 idiom, same as `import:students`): prints a **per-table count
  table** (before), asserts the **KEEP-set counts are unchanged**, then **`ROLLBACK`** — writes nothing.
- **`--commit`** performs the delete in **ONE transaction**, **explicit `DELETE`** in the FK order above
  (never `TRUNCATE ... CASCADE`), then **re-counts and asserts KEEP unchanged + every CLEAR table = 0**
  before `COMMIT`; any assertion failure → **`ROLLBACK`**, nothing deleted.
- **Schema + all 3 ledgers never touched.** No DDL. (So it does not depend on the uat ledger state — same
  reasoning as the importer; safe on uat now.)
- **Idempotent:** a second `--commit` finds the CLEAR tables already empty → deletes 0, KEEP intact.
- **Owner-run only.** The team **never** runs it against sid/uat/prod (brownfield). Backup-verified-non-zero
  (REQ-055 AC-8) is the restore point and precedes any `--commit`.
- **Console = counts only** (no names/phones/PII), consistent with the importer.

## Flow (owner, per environment, sid first)
`db:backup` (verified non-zero) → `bun run db:reset` (dry-run: read the count table, KEEP asserted, nothing
written) → `bun run db:reset --commit` (deletes, re-asserts, COMMIT) → confirm KEEP intact + CLEAR = 0 →
then the REQ-055 import. Rehearse the whole thing on **sid**, prove it in the product, then repeat on **uat**.

## Tasks
- **TASK-151 (BE, Jason)** — `scripts/db-reset.ts` + `db:reset` in `package.json`. **Re-verify the FK/keep
  split against `src/db/schema.ts`** (no KEEP table FK-references a CLEAR table; if one now does, stop and
  flag — do not reorder blindly). Dry-run default (count table + KEEP-assert + ROLLBACK); `--commit` (one tx,
  explicit DELETE in FK order, re-assert KEEP-unchanged + CLEAR=0, COMMIT-or-ROLLBACK); idempotent; schema +
  ledgers untouched; console counts-only. **Pure helpers unit-tested** (the keep/clear partition, the
  assertion logic) with synthetic counts; the DB path is the owner's run (team never touches a real DB).
  `bunx tsc --noEmit` 0 · `bun test` green.

## Questions
(Jason asks here; Sober answers `> answer: ...`. The FK re-verify is the one thing that could change the
delete order — flag it if the schema disagrees with the 08-11 list.)
