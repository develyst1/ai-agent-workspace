# TASK-030: backoffice-back — make `migrate:bo` drift-safe (ops passes must never block the freelance pass)
- Source: SPEC-006 (correctness fix on TASK-025/027's `migrate-to-bo.ts`)
- Status: DONE  (reviewed 2026-07-28 by Sober — verified tsc 0 + bun test 48/0 + code inspection; see ## Review)
- Depends on: none. **This is the confirmed critical-path unblock for the REQ-006 re-deploy** (config verified correct 2026-07-28 — the shared `smart_scheduler` DB carries a leftover drifted `ops` schema; see ## Questions).
- Assignee: @Jason (smart-scheduler-backoffice-back, port 4010)

## The bug (confirmed in prod during the REQ-006 re-deploy)
`bun run migrate:bo` failed twice with `column catalogItems.item_group does not exist` (Postgres **42703**),
inside `migrateCatalogItems()` (`src/db/migrate-to-bo.ts:59`). Root cause (Sober verified in code):
- `opsSchemaPresent()` (`:193`) guards the ops passes by checking only that the **table** `ops.catalog_items`
  **exists** (`information_schema.tables`). It does **not** check the table is **usable** (has the columns the
  migration reads). On a **drifted** `ops.catalog_items` — the `0001_item_pl` migration never applied, so
  `item_group` is missing (the known shared-`__drizzle_migrations` drift) — the guard passes, then
  `db.query.catalogItems.findMany(...)` selects `item_group` → **42703 → the whole migration aborts**,
  including the **essential** `migrateFreelanceBudgets()` pass. So a legacy/drifted ops schema blocks go-live
  even though the ops data is non-essential post-pivot.

## What to do
Make the ops passes **degrade gracefully** so the essential `public.freelance_budgets → bo.item` pass
(`migrateFreelanceBudgets`) **always runs**, whether `ops.*` is absent, present-and-clean, or present-but-drifted.

In `main()` (`:200`), keep the existing `opsSchemaPresent()` fast-path (clean skip when ops is absent), but
also **catch schema-shape errors from the ops passes** and degrade to freelance-only:
- Wrap the three ops passes (`migrateCatalogItems` → `migrateMovements` → `migrateRecurringSalary`) in a
  `try/catch`. On a Postgres **undefined_table (42P01)** or **undefined_column (42703)** error, `console.warn`
  a clear line (e.g. `"ops schema absent or drifted (<code>) — skipping ops passes; migrating freelance
  budgets only"`) and continue. **Re-throw any other error** (don't mask real failures).
- Then always run `migrateFreelanceBudgets()` (unchanged) and print the summary.
- Detect the pg error code robustly (the driver surfaces it as `err.code` / `err.cause?.code` — match how
  other code in this repo reads pg error codes; don't string-match the message).

Keep it minimal — no behavior change when ops is clean; only the drifted/absent paths change. Do not touch the
freelance pass or the mapping logic.

## Definition of Done
- [ ] Running `migrate:bo` against a DB whose `ops.catalog_items` exists but is **missing `item_group`**
      completes with exit 0, logs the skip warning, and **still migrates the freelance budgets** (does not abort).
- [ ] Ops absent (shared `smart_scheduler`) still skips cleanly (unchanged); ops present-and-clean still
      migrates fully (unchanged).
- [ ] A non-schema error (e.g. a genuine bug) is still **re-thrown**, not swallowed.
- [ ] `bunx tsc --noEmit` clean. If a unit test is impractical (DB-runtime), state that in Implementation
      Notes and describe the manual verification instead.

## Implementation Notes

**One-file, minimal change** — `src/db/migrate-to-bo.ts` `main()` only. Kept the `opsSchemaPresent()`
fast-path (clean skip when `ops` is absent); wrapped the **three ops passes** (`migrateCatalogItems` →
`migrateMovements` → `migrateRecurringSalary`) in a `try/catch`. On catch:
- `const code = pgErrorCode(err)` — reused the repo's existing chain-walking helper
  (`src/lib/http.ts:27`, checks `err.code`/`err.cause?.code` for a 5-char SQLSTATE) rather than
  string-matching the message.
- If `code` is **`42P01` (undefined_table)** or **`42703` (undefined_column)** → `console.warn` a clear
  "ops schema present but drifted (<code>) — skipping ops passes; migrating freelance budgets only." and
  fall through.
- **Any other code → `throw err`** (real failures are not masked).
Then `migrateFreelanceBudgets()` runs **unconditionally** (unchanged), followed by the summary log. The
freelance pass + all mapping logic are untouched; the clean-ops path is byte-for-byte the same behavior.

Added the import `import { pgErrorCode } from "../lib/http";`.

**Why the drift slipped past the guard:** `opsSchemaPresent()` only checks `information_schema.tables` for
`ops.catalog_items` existing — not that it has the columns the migration reads. On the drifted prod DB
(`0001_item_pl` never applied → `item_group` missing) the guard passed, then `catalogItems.findMany` selected
`item_group` → 42703 → the whole migration (incl. the essential freelance pass) aborted. The try/catch turns
that into a graceful degrade.

**Verification** (`H:\scheduler\smart-scheduler-backoffice-back`):
- `bunx tsc --noEmit` → **clean (exit 0)**.
- `bun test` → **48 pass / 0 fail** (10 files) — unchanged; no test imports this script.
- ⚠️ **No unit test added — impractical here, by design.** The script executes `await main()` at top level
  (`:222`), so importing it from a test would run the whole migration (needs a live DB) — there is no pure
  helper to import in isolation, and I did **not** restructure the script (out of scope; the task allows
  stating this). Correctness is by inspection + tsc. **Manual verification (deploy-time, brownfield):**
  1. On the shared `smart_scheduler` (drifted `ops`, missing `item_group`): `bun run migrate:bo` → exits 0,
     logs the `(42703)` skip warning, and reports `freelance=<n>` migrated (the previously-aborting case).
  2. Ops absent (clean shared DB): still logs "ops.* not present … freelance-only" (unchanged).
  3. Ops present-and-clean: still migrates fully (unchanged) — the try only catches 42P01/42703, so a clean
     run never enters it.
  4. Re-run is still idempotent (upsert-by-key unchanged).

**DoD:** drifted-`ops` run completes + still migrates freelance ✓ (by inspection) · absent/clean paths
unchanged ✓ · non-schema errors re-thrown ✓ · `bunx tsc --noEmit` clean ✓ · unit test impractical →
manual verification documented ✓ (per the DoD's allowance).

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- **✅ UPDATE 2026-07-28 — config check came back; TASK-030 IS the unblock (not a config issue).** The
  DATA REQUEST result (`project-docs/migrate-bo-db-check-2026-07-28.md`) shows `DATABASE_URL` → **`smart_scheduler`
  (the correct shared DB)**, with `public.freelance_budgets` ✅, `bo.item` ✅, **and `ops.catalog_items` present
  (non-null)**. So my earlier "wrong DB" hypothesis is **disproven** — the shared `smart_scheduler` itself
  carries a **leftover, drifted `ops` schema** (missing `item_group`). Repointing won't help; `opsSchemaPresent()`
  sees the table and runs the failing ops pass. **This task is the chosen unblock** (stakeholder picked it over
  a `DROP SCHEMA ops` workaround). Build it → then re-running `migrate:bo` on `smart_scheduler` skips the drifted
  `ops` and completes the freelance pass. **This is the critical path to REQ-006 go-live.**
- Scope reminder: skipping the ops passes means the leftover `ops.*` data is **not** carried into `bo` — that's
  intended (ops retired per the pivot; the essential live data is `public.freelance_budgets`). No business
  concern flagged; if คุณฟีน later wants the old ops history in `bo`, that's a separate migration after the
  drift is repaired.

## Review
**Verdict: DONE ✅ (Sober, 2026-07-28).** Minimal, correct, and it unblocks the re-deploy.
- **Verified in code** (`src/db/migrate-to-bo.ts` `main()`): the `try/catch` wraps **only** the three ops
  passes (`:210–221`); on catch, `pgErrorCode(err)` → re-throws anything that isn't `42P01`/`42703` (real
  failures not masked), else warns + falls through. `migrateFreelanceBudgets()` (`:225`) runs
  **unconditionally** and is **outside** the try — so the essential pass always runs, and a genuine freelance
  failure still propagates. The clean-ops / ops-absent paths are byte-for-byte unchanged.
- **`pgErrorCode`** (`lib/http.ts:27`) walks the `.cause` chain (≤5) for a 5-char SQLSTATE → correctly catches
  both `err.code` and Drizzle-wrapped `err.cause.code`. Right helper, not message-matching.
- **Verified myself** (`H:\scheduler\smart-scheduler-backoffice-back`): `bunx tsc --noEmit` → 0; `bun test`
  → **48 pass / 0 fail**.
- **No unit test** — accepted. The script runs `await main()` at top level, so importing it would execute the
  whole migration (needs a live DB); there's no pure helper to isolate, and restructuring is out of scope. The
  DoD explicitly allowed this with documented manual verification, which Jason provided. *(Optional, non-blocking
  future nicety: extract the degrade decision into a pure `shouldSkipOpsPasses(err)` helper so it's unit-testable
  — not required for this task.)*
- **DoD:** drifted-ops run degrades + still migrates freelance ✓ · absent/clean unchanged ✓ · non-schema
  re-thrown ✓ · tsc clean ✓ · manual-verification documented ✓.
- **TASK-030 → DONE.** This clears the last REQ-006 re-deploy blocker. **@Porter:** the deploy can resume —
  re-run `bun run migrate:bo` on `smart_scheduler` (it now skips the drifted `ops` + migrates the freelance
  budgets) → restart both → re-enter/confirm budgets → post-deploy acceptance → REQ-005 + REQ-006 DELIVERED.
