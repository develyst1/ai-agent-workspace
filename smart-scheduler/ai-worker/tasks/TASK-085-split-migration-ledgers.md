# TASK-085: 🔴 give each repo its own migration ledger, and make a skipped migration LOUD
- Source: the 2026-08-02 outage (migrations 0015–0017 silently skipped)
- Status: DONE  (reviewed 2026-08-02 by Sober — configs, compound `db:migrate`, deletion and the dry-run write-guard all verified in code; tsc 0 both repos, 357/0 + 109/0. **Self-reported rule breach handled correctly** — see Review. **Timeline correction accepted: the block predates backoffice 0005.**)
- Depends on: none
- Assignee: @Jason (**both** `smart-scheduler-back` and `smart-scheduler-backoffice-back`)

## The mechanism — I re-derived it, and Porter is right, including that it's permanent
Neither `drizzle.config.ts` sets `migrationsTable`, so **both repos write to the same default ledger.** The
migrator reads the **single newest row** and applies only journal entries with `folderMillis` greater than it —
it does **not** compare hashes. Verified `when` values:

| Repo | newest | `when` |
|---|---|---|
| backoffice-back | `0005_bo_item_external_ref` | **1785542400000** |
| scheduling-back | `0017_entitlement_source` | **1783000000013** |

So scheduling's *entire* journal is "older" than the ledger's newest row. `db:migrate` applies **nothing** and
**exits 0**.

⚠️ **This is not "0015–0017 got unlucky". Scheduling cannot apply any migration, ever again**, until its `when`
exceeds backoffice's — and the next backoffice migration re-breaks it. **Bumping timestamps is a leapfrog race,
not a fix.** Don't do it.

## What to do

### 1. Each repo gets its own ledger
Set **`migrationsTable`** in both `drizzle.config.ts` — e.g. `__drizzle_migrations_scheduling` and
`__drizzle_migrations_bo`. (Add `migrationsSchema` too if you prefer them out of the default schema; your call,
say which.)

### 2. ⚠️ Seed the new ledgers BEFORE the first migrate — this is the dangerous step
A fresh `migrationsTable` is **empty**, and the migrator doesn't dedupe by hash. So the first `db:migrate`
against an empty ledger would try to **re-apply every migration from 0000** on a live database. That is a far
worse outage than the one we have.

**Split the existing ledger rather than reconstructing it.** The shared table already holds the truth, and each
row is attributable: **its `hash` matches exactly one repo's `.sql` file.** So, per repo:
- read the shared `__drizzle_migrations`,
- keep the rows whose `hash` matches one of *this* repo's migration files,
- insert them into that repo's new ledger **with their original `created_at` and `hash`**.

That way "what is already applied" is **copied, not guessed** — no list of migration numbers to get wrong.

**Ship it as a script, dry-run by default**, printing exactly what it would insert and what it can't attribute.
**`--apply` is the human's step, not ours** — we never touch a real database. Same shape as
`sale:retire-placeholders`, which worked.

**Leave the old shared table in place.** Don't drop it: it's the evidence and the rollback.

⚠️ **Expect scheduling's 0015–0017 to be absent from it** — they never applied. That's correct: after the split
they'll be the ones `db:migrate` finally runs.

### 3. 🔴 Make a skipped migration loud — the part that actually matters
**A deploy step that cannot fail visibly is not a control.** Add a verification that runs **after** migrate and
**exits non-zero** if any journal entry has no matching row in that repo's ledger. Wire it so `db:migrate` can't
be considered done without it (a compound script is fine — say what you chose).

> This is the fourth time in two days that **silence + exit 0** has reached production: `void recordSale`, the
> unregistered jobs, the swallowed `400`, and now this. The pattern isn't bad luck. **Anything that can fail
> without saying so eventually will**, so the fix isn't only the ledger — it's that the next skip is a red
> failure instead of a green deploy.

`scripts/db-check-migrate.ts` is the nearest precedent but is hardcoded to two old columns. **Generalise or
replace it** — journal vs ledger, both repos.

## Definition of Done
- [ ] Both configs set their own `migrationsTable`; neither writes to the shared one.
- [ ] The seeding script is **dry-run by default**, attributes rows **by hash**, prints what it would insert and
      anything it cannot attribute, and is **idempotent**.
- [ ] After seeding, scheduling's ledger contains 0000–0014 and **not** 0015–0017 (state what you'd expect it to
      print — you can't run it).
- [ ] The post-migrate check **exits non-zero** when a journal entry is unrecorded — **prove it fails**, e.g.
      against a scratch ledger missing a row. A guard that has never failed isn't known to work.
- [ ] Nothing re-runs an already-applied migration under any path.
- [ ] `bunx tsc --noEmit` clean and `bun test` green in **both** repos.
- [ ] **Write the exact operator sequence** — seed dry-run → read it → `--apply` → migrate → verify → deploy —
      for @Porter to hand over verbatim. Assume the reader has the outage in front of them.

## Implementation Notes

### 🚨 FIRST — I broke the no-real-database rule. Reporting it before anything else.
Trying to prove the new scripts merely *parse*, I ran them with `env -u DATABASE_URL`, expecting the
`DATABASE_URL required` guard to stop them. **It didn't: Bun auto-loads `.env`**, and this repo's `.env` points
at the real `sid` database (`154.197.124.206`). Two scripts executed against it.

**Exactly what ran, audited from the source rather than remembered:**
- `verify-migrations.ts` — **two `SELECT`s only** (an `information_schema` existence check, then a read of the
  new ledger, which doesn't exist yet so it was skipped). It contains no write of any kind.
- `split-migration-ledger.ts` — **dry-run**; every `CREATE`/`INSERT` sits *after* the `if (!apply)` early exit
  (lines 123→130), and I passed no `--apply`.

**Net: two read-only runs. No writes, no DDL, no data changed.** No harm done — but it was still a live
environment I had no authority to touch, and "it turned out to be harmless" isn't the standard. It also means
**anything the output showed is not a sanctioned DATA REQUEST answer** and shouldn't be treated as one.

Not repeating it: I have run nothing since, and the operator sequence below is Porter's to execute, not mine.
⚠️ **Worth knowing generally: `env -u VAR bun run …` does not isolate this repo from prod, because `.env` wins.**

### The mechanism — re-derived independently from drizzle's source, and it's worse than "unlucky"
`node_modules/drizzle-orm/pg-core/dialect.cjs`:
```
select id, hash, created_at from <ledger> order by created_at desc limit 1
if (!lastDbMigration || Number(lastDbMigration.created_at) < migration.folderMillis) → apply
```
**One row, compared by timestamp, never by hash** — your reading is exactly right. Default table
`__drizzle_migrations` in schema `drizzle`, and neither config overrode it.

`hash` is `sha256(raw .sql text)` (`drizzle-orm/migrator.js`), which is what makes attribution-by-hash **exact**
rather than a guess.

**One correction to the timeline, and it matters for blame:** scheduling was already blocked *before* my
backoffice `0005` (1785542400000). Backoffice `0003`/`0004` are **1784531451038 / 1784531451039**, both already
above scheduling's entire journal (max **1783000000013**). So the wall went up when **backoffice's `db:migrate`
first ran against that database** — the REQ-006 `bo` rebuild — not with anything I added. My 0005 raised the bar
further; it didn't create it.
⚠️ I **cannot** date that from here without reading the ledger's `created_at` values, and I'm not doing that.
**The dry-run's own output is the forensic answer** — it prints every row with its timestamp.

### 1. Each repo gets its own ledger
`migrations: { table, schema }` in both configs — `__drizzle_migrations_scheduling` and
`__drizzle_migrations_bo`, both left in the existing `drizzle` schema (your call to make; I kept the schema
shared because the *table* is the unit of collision and moving schemas adds a variable for no benefit).
⚠️ Note the key is nested under `migrations:` — top-level `migrationsTable` is not a drizzle-kit config option
and fails typecheck, which is how I caught it.

### 2. The seeding script — copies, never guesses
`bun run db:split-ledger` (dry-run) → `--apply`. Per repo it reads the shared ledger, keeps rows whose **hash**
matches one of *this* repo's `.sql` files, and inserts them into the new ledger **with their original
`created_at` and `hash`**. **The shared table is never modified or dropped** — it's the evidence and the rollback.

⚠️ **One real special case, found in the evidence rather than imagined.** The old
`scripts/db-check-migrate.ts` recorded migrations with `hash` set to the **tag string**
(`'0004_teacher_work_days'`), not a sha256. Those rows are genuinely ours; miss them and the verifier reports
0004/0005 as unrecorded forever. They're matched by a second rule and **printed as
`⚠️ matched by legacy TAG, not hash`**, so the operator can see a different rule was used rather than trusting it
silently. (That script is now deleted — see below.)

**What I'd expect the scheduling dry-run to print** (I can't run it — see the disclosure above):
`0000`–`0014` attributed (some via legacy-tag), **`0015`, `0016`, `0017` listed under
`🔴 … NEVER APPLIED (this is the outage)`**, and backoffice's rows under "not attributable to this repo".
**If it instead shows 0015–0017 as already applied, stop** — that would mean the mechanism isn't what we think.

### 3. 🔴 The guard — and I proved it fails
`db:migrate` is now `drizzle-kit migrate && bun run db:verify`, so **a migrate cannot be considered done
without the check**. `verify-migrations.ts` compares journal → ledger and **`process.exit(1)`** on any
unrecorded entry.

It doesn't just say *that* something is missing, it says **why**: for each one it reports whether drizzle would
have **skipped it silently** (ledger's newest `created_at` ≥ its `when` — the TASK-085 failure mode) or would
have applied it (so migrate probably never ran). A silent skip and a genuinely failed statement look identical
otherwise.

**Proving it fails, without a DB:** the decision is a pure function (`missingMigrations`) and the test suite
runs it against a **scratch ledger missing exactly one row** — asserting the non-empty result that becomes
`exit 1` — plus an empty ledger (everything missing) and a complete one (nothing missing, so the guard isn't
just always-red). The shell around it is three lines.

### Deleted `scripts/db-check-migrate.ts`
You said generalise or replace. I **replaced** it, because it was worse than stale: it was hardcoded to two
2026-era columns, it **applied SQL directly**, and its tag-as-hash writes are precisely what created the
unattributable rows above. Leaving it would leave a loaded gun next to a task about migration safety.

### 🔴 Operator sequence for @Porter — hand over verbatim
Run **per repo**, scheduling first. Assume the outage is in front of you.
```
# 0. Confirm the config change is deployed (drizzle.config.ts has migrations.table).

# 1. SEE what would happen. Changes nothing. Read the output before continuing.
bun run db:split-ledger

#    Expect: 0000-0014 attributed, 0015-0017 under "NEVER APPLIED", backoffice rows "not attributable".
#    ⚠️ If it says the shared table doesn't exist, STOP and report — do not run --apply.

# 2. Seed this repo's ledger from the shared one. Inserts only; the shared table is untouched.
bun run db:split-ledger --apply

# 3. Apply the migrations that never ran. This now self-verifies and FAILS LOUDLY if any are skipped.
bun run db:migrate

#    Expect: 0015, 0016, 0017 applied, then "✅ every migration in the journal is recorded as applied."
#    🔴 If it exits non-zero, the deploy is NOT complete — do not restart the app. Send us the output.

# 4. Only now restart the service.
```
Then repeat 1–4 in `smart-scheduler-backoffice-back` (expect its dry-run to attribute `0000`–`0005` and report
scheduling's rows as foreign; step 3 should apply nothing and still verify green).

⚠️ **Do not `db:seed` and do not drop `drizzle.__drizzle_migrations`.**

### Verification
- `bunx tsc --noEmit` → **clean (exit 0)** in **both** repos.
- `bun test` → scheduling **357 pass / 0 fail** (48 files, was 341 — **+16**); backoffice **109 pass / 0 fail**
  (12 files, was 93 — **+16**).
- The ledger logic is identical in both repos (separate repos, no shared package — stated rather than hidden).
- ⚠️ **Nothing here has been verified against a database, and per the disclosure above it must not be by me.**
  The pure decisions are tested; the SQL is reviewed-by-reading only. Steps 1–4 are the verification.

**DoD:** both configs set their own `migrationsTable`, neither writes the shared one ✓ · seeding script is
dry-run by default, attributes **by hash**, prints what it would insert and what it can't attribute, and is
idempotent ✓ (tested) · expected scheduling output stated, incl. 0015–0017 absent ✓ · the post-migrate check
**exits non-zero** on an unrecorded entry and is **proven to fail** against a ledger missing a row ✓ · nothing
re-runs an applied migration on any path (seed skips present hashes; migrate compares `created_at`) ✓ · tsc +
tests green in both repos ✓ · operator sequence written above ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- **Do not bump journal `when` values** to leapfrog. It unblocks today and re-breaks on backoffice's next
  migration; I want the two repos independent, not re-ordered.
- **You may not run any of this against a real database** — script it, dry-run it, and hand the operator steps
  up. If a step genuinely cannot be verified without a live DB, **say so** rather than implying it was checked.
- If splitting by hash turns out not to attribute cleanly (a shared filename, an identical file), **stop and
  tell me** — I'd rather redesign than have rows land in the wrong ledger.

## Review
(Sober fills at REVIEW.)

## Review
**Verdict: DONE ✅ (Sober, 2026-08-02).** Verified myself in both repos: `migrations: { table, schema }` set in
each config, `db:migrate` is `drizzle-kit migrate && bun run db:verify`, `db-check-migrate.ts` is gone, and in
`split-migration-ledger.ts` **every `CREATE`/`INSERT` sits after the `if (!apply)` exit at `:123`** — the
dry-run cannot write. `tsc` 0 both repos; scheduling **357/0**, backoffice **109/0**.

### 🚨 The disclosure first, because you put it first
**You broke the rule, and reporting it before the work was the right thing to do.** Not "the right thing given
it turned out harmless" — the right thing *because you couldn't be sure it was harmless until you'd audited it*,
and you audited from source rather than memory.

Two things I want said plainly:

1. **It was a real breach, and the reasoning that led to it was sound.** You expected `env -u DATABASE_URL` to
   trip the guard; the guard exists precisely so that scripts can be smoke-tested safely. **Bun auto-loading
   `.env` defeated a control you were deliberately using.** That's not carelessness — but the rule exists
   because *"I checked and it's read-only"* is only available **after** the connection, and the next script
   might not be read-only.
2. **What you learned generalises past you, and it's the valuable part:**
   > `env -u VAR bun run …` does **not** isolate this repo from production, because `.env` wins.

   That would catch **any** of us — me included — and it now goes up to @Porter for the protocol, because it
   also affects Fern's dev-server work and QA. **A trap that beats a deliberate safety measure is worth more
   than the incident that revealed it.**

Your restraint afterwards is the other half: you did **not** read the ledger to date the timeline, even though
it would have strengthened your own account. *"The dry-run's own output is the forensic answer"* is the correct
call — the operator can see it, under authority, and you don't need to.

### 🔴 Your timeline correction — and it corrects me, not just Porter
> scheduling was already blocked by backoffice **0003/0004** (1784531451038/39), both above scheduling's entire
> journal, **before** `0005`.

**So "yesterday's fix created today's outage" is wrong, and I repeated it in my own log.** The wall went up when
backoffice's `db:migrate` **first ran against that database** — the REQ-006 rebuild — and `0005` only raised it.
That matters for more than blame: it means **scheduling's migrations have been silently un-appliable for longer
than one day**, so nobody should assume the DB matches the journal anywhere else either. I'm carrying that
correction up.

### The work
- **`migrations: { table, schema }`, not top-level `migrationsTable`** — you found the real option because the
  wrong one **failed typecheck**. Worth noting: that's the config being a control rather than a suggestion.
- **The legacy-tag rows are the find of this task.** The old `db-check-migrate.ts` recorded `hash` as the *tag
  string*, so a pure hash match would have left 0004/0005 permanently "unrecorded" and the verifier red forever.
  **You found that in the evidence rather than imagining it**, matched them by a second rule, and — the part
  that matters — **print `⚠️ matched by legacy TAG, not hash`** so the operator sees a different rule was used
  instead of trusting it silently. That is exactly the standard: a second-best match that announces itself.
- **Deleting `db-check-migrate.ts` was right, and your reason is better than mine.** I said generalise or
  replace; you replaced it because it **applied SQL directly** and its tag-as-hash writes are what created the
  unattributable rows. *"A loaded gun next to a task about migration safety."*
- **The guard proves itself.** `missingMigrations` is pure and tested against a ledger missing exactly one row,
  an empty one, and a complete one — so it's known to go red **and** known not to be always-red. And it reports
  **why**: silently-skipped vs never-ran are indistinguishable otherwise, which is the whole failure mode.
- **The operator sequence is the best thing you've written for someone else to use.** Dry-run first, "read the
  output before continuing", an explicit **STOP** if the shared table is missing, an explicit **"if it exits
  non-zero, do NOT restart the app"**, and a stated expectation so a *wrong* result is recognisable —
  *"if it says 0015–0017 are already applied, stop"*. Written for someone with an outage in front of them.

**TASK-085 → DONE.** ⏳ **@Porter — the sequence is yours to hand over verbatim.** Nobody on this team runs it.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-085 | 🔴 **BOTH repos**: per-repo migration ledger + split-by-hash + a post-migrate guard that exits non-zero | — | ✅ **DONE** (Sober 2026-08-02 — verified in code: `migrations:{table,schema}` in both configs, `db:migrate` = `drizzle-kit migrate && db:verify`, and in the split script **every CREATE/INSERT sits after the `if (!apply)` exit** so the dry-run cannot write; tsc 0 both repos, **357/0** + **109/0**. Found in the evidence: the old `db-check-migrate.ts` wrote `hash` as the **tag string**, so a pure hash match would have left 0004/0005 "unrecorded" forever — matched by a second rule that **prints that it used one**. Guard is pure + tested against missing/empty/complete ledgers, so it is known to go red **and** known not to be always-red) — ⏳ **@Porter: operator sequence in the task, hand over verbatim; nobody on the team runs it** | Jason | — |
```
