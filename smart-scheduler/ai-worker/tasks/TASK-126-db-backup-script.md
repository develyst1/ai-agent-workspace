# TASK-126: scheduling (BE) — `db:backup` script (prod snapshot for the deploy GATE 0)

- Source: customer-prod runbook GATE 0 (Porter, owner mid-deploy 2026-08-10) — needs a one-command prod DB snapshot
  that reads the connection from `.env`, never pasted by hand.
- Status: DONE ✅ (SA-reviewed 2026-08-11 — tsc 0 reproduced; built exactly to spec: missing-URL→exit1, `pg_dump -Fc -f` owns the file, `proc.success`→non-zero on fail, 0-byte guard, prints path+size+restore, Windows-safe `toISOString()` stamp. GATE 0 unblocked.)
- Depends on: — · Assignee: @Jason (smart-scheduler-back)

## Why a script, not Porter's inline one-liner
Porter proposed `"db:backup": "pg_dump \"$DATABASE_URL\" > backup-$(date +%Y%m%d-%H%M%S).sql"`. Two problems:
1. **The owner is on Windows.** `$(date +%Y%m%d-%H%M%S)` is unreliable under Bun's shell there (Windows `date` doesn't
   take strftime) → a broken/blank filename.
2. **`>` shell redirect** writes a file even if `pg_dump` fails mid-run — a partial file that *looks* like a backup.
A tiny `scripts/backup.ts` (same mold as `verify-migrations.ts` / `seed-ledger-from-schema.ts`) is robust cross-platform
and lets `pg_dump` own the file (`-f`), so a failure leaves no false-positive archive. **Custom format (`-Fc`)** — SA
call on Porter's "your call" — compressed, and restorable whole-or-selective via `pg_restore`.

## What to build
### 1) `smart-scheduler-back/scripts/backup.ts`
```ts
// GATE 0 of the customer-prod deploy — a snapshot before any migrate. Reads DATABASE_URL from the (bun-loaded)
// .env, writes a timestamped pg_dump custom-format archive. Fails loud + non-zero; never leaves a partial archive
// that looks like a good backup. Restore: pg_restore --clean --if-exists -d "$DATABASE_URL" <file>
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set — check the backend .env points at the intended DB before backing up.");
  process.exit(1);
}
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const file = `sm-prod-backup-${stamp}.dump`;
console.log(`Backing up DATABASE_URL → ${file} (pg_dump -Fc)…`);
const proc = Bun.spawnSync(["pg_dump", "-Fc", url, "-f", file], { stdout: "inherit", stderr: "inherit" });
if (!proc.success) {
  console.error(
    "\npg_dump failed (exit " + proc.exitCode + "). Is pg_dump on PATH and DATABASE_URL reachable? " +
      "No usable backup was written — do NOT proceed past GATE 0.",
  );
  process.exit(proc.exitCode || 1);
}
const size = Bun.file(file).size;
if (size === 0) {
  console.error(`\n${file} is 0 bytes — treat as FAILED, do NOT proceed.`);
  process.exit(1);
}
console.log(`\n✅ Backup written: ${file} (${(size / 1_048_576).toFixed(1)} MB). Restore with:`);
console.log(`   pg_restore --clean --if-exists -d "$DATABASE_URL" ${file}`);
```
### 2) `package.json` — add beside the other `db:*`
```
"db:backup": "bun run scripts/backup.ts"
```

## Definition of Done
- [ ] `bun run db:backup` reads `DATABASE_URL` from `.env` (never a hand-pasted connection), writes a timestamped
      `-Fc` archive, prints the path + size + the restore command, and **exits non-zero** if `pg_dump` is missing/fails
      or the file is empty (no false-positive backup).
- [ ] `bunx tsc --noEmit` clean. (No unit test — it shells out to `pg_dump`; the guard is the non-zero exit.)
- [ ] Runbook note: **`pg_dump` must be on the owner's PATH** (Postgres client tools). I'll add this precondition to
      GATE 0.
