# TASK-086: 🔴 seed the ledger from the DATABASE's state, not the ledger's
- Source: the 2026-08-02 dry-run (9 unrecorded, 6 of them demonstrably applied) — REQ-032
- Status: DONE  (reviewed 2026-08-02 by Sober — transaction-wrapping, the 0002/0007 index overlap and the shared witness map all verified independently; tsc 0 both repos, 374/0 + 124/0. **His `0002` finding reframes the risk: an old migration can silently REGRESS a later one** — a question neither Porter nor I asked)
- Depends on: TASK-085 (DONE — configs, split script, verifier)
- Assignee: @Jason (**both** `smart-scheduler-back` and `smart-scheduler-backoffice-back`)

## What the dry-run proved
Your script is faithful to the ledger. **The ledger is not faithful to the database.** Nine journal entries are
unrecorded; **six of them (`0006 · 0009 · 0010 · 0011 · 0013 · 0014`) are demonstrably live** — parents,
`job_runs`, teacher archiving, freelance budgets, calendar tokens and the demographics the owner has been
entering all week. Only `0015–0017` genuinely never ran.

And `0004`/`0005` appear **twice** (legacy-tag *and* hash). **A ledger written by two mechanisms cannot be
assumed complete** — which is the argument for what follows.

> **The design shift: stop treating the ledger as the source of truth for "what is applied". The schema is.**
> The ledger becomes an output of this reconciliation, not its input.

## ⚠️ Two corrections to the re-run analysis — I read the files, and one of them lowers the risk
- **`0011_freelance_budgets` IS safe to re-run.** Its `ADD CONSTRAINT` is wrapped —
  `DO $$ BEGIN … EXCEPTION WHEN duplicate_object THEN null; END $$;` (lines 12–16). It will not raise 42710.
- **`0006_parents` is confirmed un-re-runnable, and the reason isn't the drops.** Those are
  `DROP COLUMN IF EXISTS`. It's the **backfill at line 15**: `SELECT s.phone, … FROM students s WHERE
  s.phone IS NOT NULL` — reading two columns the same file drops at the end. Second run → **42703**.

**So exactly one migration cannot survive a re-run, not two.** That narrows the blast radius — and changes
nothing about the plan, because **"its statements are guarded" is a safety net, not a reason to re-run
something that already applied.**

## What to build

### 1. A witness per migration — the database answers "did this run?"
A map `tag → schema predicate` probing an object that migration creates (`information_schema` /
`pg_constraint`). Two rules make witnesses safe, and **both matter more than the map itself**:

1. **Witness the LAST object the migration creates, never the first.** If a migration half-applied, the last
   object is absent → verdict "not applied" → it re-runs and its `IF NOT EXISTS` guards absorb the parts that
   already landed. **Witnessing the first object would declare a half-applied migration finished and leave a
   permanent hole** — the exact failure we're here to end.
2. **A false "applied" must be impossible.** The object must exist *only* because that migration ran. If it
   could plausibly come from a hand-run fix or another migration, it is a bad witness — **say so and pick
   another**, or mark it `needs-human`.

### 2. ⚠️ `0006` gets an explicit `rerunnable: false`
If its witness says "not applied", **stop and ask a human** — do not let `db:migrate` attempt it. A wrong
verdict there is the one that isn't recoverable by re-running.

### 3. One witness map, shared by the seeder and the verifier
`verify-migrations.ts` already asks the schema what exists. **Do not build a second notion of "applied."** If
the seeder and the verifier can disagree, we get a **green verify on a broken database** — which is worse than
today, because today at least it's red.

### 4. Output the operator can act on
Per unrecorded entry: the **witness probed**, what was **found**, the **verdict**, and whether it is
**re-runnable**. Plus the same explicit STOP conditions as TASK-085. Dry-run by default; `--apply` is the
human's.

Seed **one row per journal entry** — that also resolves the `0004`/`0005` duplicates for free.

## Definition of Done
- [ ] Every journal entry has a witness; **each one names the object it probes and why that object proves
      *that* migration ran.** A witness nobody can justify is a guess with a schema query attached.
- [ ] Witnesses probe the **last** object created, and the reasoning is stated per migration.
- [ ] `0006` is flagged `rerunnable: false` and **halts** rather than being attempted.
- [ ] The seeder and the verifier use **one** map — demonstrate they cannot disagree.
- [ ] Dry-run prints witness · found · verdict · re-runnable for all nine, and one row per journal entry.
- [ ] **State what you expect the scheduling dry-run to print**, including that `0015–0017` come out as
      NOT applied — and say what result would mean **stop**.
- [ ] `bunx tsc --noEmit` clean, `bun test` green in both repos. The witness→verdict logic is **pure and
      tested**, including a half-applied case.
- [ ] Updated operator sequence for @Porter, verbatim-ready.

## Implementation Notes

**I ran nothing against a database.** Only `bunx tsc` and `bun test`, both offline. Everything below is
reasoned from the migration files and drizzle's source, and the parts that could be wrong are pure and tested.

### 🔴 A finding that narrows the whole risk: `db:migrate` CANNOT half-apply
`drizzle-orm/pg-core/dialect.cjs:62` wraps **the entire migrate run in one `session.transaction(...)`**. Any
failure rolls the whole batch back. So a half-applied migration cannot come from `db:migrate` at all.

**The real exposure is out-of-band application — and we have exactly one confirmed instance:** the deleted
`db-check-migrate.ts` executed statements one at a time with `sql.unsafe(stmt)` and **no transaction**, for
`0004` and `0005`. Those two are the only places a genuine partial state is possible.

I still applied your last-object rule strictly everywhere. The point of saying this is that the rule is now
**belt and braces rather than the only thing standing between us and a hole** — and `0005`'s witness was
chosen specifically because that script could have stopped part-way through it.

### The witness map — and the two entries that aren't simple existence probes
Every one of the 18 (scheduling) + 6 (backoffice) entries names the **last** object its migration creates, with
its justification stored next to it. A test asserts the map covers the journal exactly and that **no
justification is a one-liner** — it actually failed on `0010` ("0010's only object.") and made me write a real
reason, which is the test doing its job.

**🔴 `0007` — existence would be a FALSE POSITIVE.** `0002` and `0007` both `DROP` and re-`CREATE`
**`bookings_teacher_slot_uq`**; they differ *only* in the predicate (`0007` also excludes `SICK_LEAVE`). Probing
existence would be satisfied by `0000`/`0002` and would report `0007` as applied when it isn't. The witness
therefore probes the **index definition** for `SICK_LEAVE`.

**🔴 `0002` has no honest witness at all, so it doesn't get one.** Its only effect is an index `0007` replaces —
once `0007` has run, `0002`'s version does not exist anywhere. It's marked `superseded-by: 0007` and **inherits
`0007`'s verdict**, and the inheritance is strict: if `0007` is anything other than `applied`, `0002` becomes
`needs-human` rather than assuming. ⚠️ **And `0002` is `rerunnable: false` for a reason that isn't about
errors: re-running it would drop `SICK_LEAVE` back out of the predicate and silently re-break
overbooking-on-leave.** A migration that "succeeds" while regressing a fix is worse than one that throws.

**🔴 `0006` — witnessed by an ABSENCE, and flagged `rerunnable: false` as you asked.** Its last statements are
`DROP COLUMN IF EXISTS students.phone` / `parent_line_user_id`. `students.phone` is created by the `0000`
baseline (line 58 — I checked) and dropped by nothing else, so **its absence is an exact witness of
completion**, and it is genuinely the last effect. If that probe says "not applied", the seeder **halts** — it
does not let `db:migrate` near it. (Your reading of the file matches mine: it's the line-15 backfill reading
`students.phone`, not the drops, that makes it unrepeatable.)

**`0016`** is worth naming too: its last *statements* are data `UPDATE`s with no schema footprint, so the
witness is the `subjects.price_group` column. Safe **because** of the single-transaction finding above — the
UPDATEs cannot have been skipped while the column landed. Whether they *matched* anything (a renamed subject
leaves `price_group` NULL) is the TASK-077 smoke check, not this witness, and I've said so on the entry.

### One map, and they cannot disagree — demonstrated
`judge()` is imported by **both** `seed-ledger-from-schema.ts` and `verify-migrations.ts`, and the probe SQL
lives once in `scripts/probe-witnesses.ts` which both import. There is no second notion of "applied" to drift.

The verifier now asks **both** questions and reports the dangerous disagreement explicitly: a migration that is
**recorded in the ledger but not witnessed in the schema** is called out as *"a ledger row without the schema
to back it"* and exits non-zero. That's the "green verify on a broken database" you were worried about, turned
into a red one.

⚠️ **An unevaluable probe is `needs-human`, never optimistic.** A thrown query is caught, logged, and mapped to
`null` → `needs-human`. Tested.

### 🗑️ I deleted `db:split-ledger` (TASK-085's seeder) — please overrule me if you disagree
It seeds from the **ledger**, which this task establishes is not faithful to the database. Leaving two seeders
where one is known to seed from a bad source is the same "loaded gun next to a safety task" argument I used for
`db-check-migrate.ts`. It's removed from both repos and both `package.json`s, and the verifier's advice line
now points at `db:seed-ledger`. **Say the word and I'll restore it** — it's a deleted file, not a lost idea.

### What I expect the scheduling dry-run to print
Based on your dry-run facts (9 unrecorded, 6 demonstrably live, only `0015–0017` never ran):

| verdict | entries |
|---|---|
| ✅ applied | `0000`–`0014` — including `0002` **inherited** from `0007` |
| 🔴 not-applied | `0015_teacher_link_requests`, `0016_subjects_price_group`, `0017_entitlement_source` — all `re-run? yes` |
| ⚠️ needs-human | **none** |

⇒ `Summary: 15 applied · 3 not applied · 0 need a human`, then
`After seeding, db:migrate would apply: 0015…, 0016…, 0017…`.

### 🔴 What means STOP
- **Any** `needs-human`, or **any** `not-applied` with `re-run? NO` — the script prints a STOP block and
  **exits 1 without writing**, even with `--apply`.
- Specifically: **`0006` not-applied** (unrepeatable), **`0002`/`0007` not-applied** (re-running `0002`
  regresses `0007`), or `0000`/`0001`/`0003` not-applied (bare `CREATE TABLE` → they'd throw).
- **`0015–0017` showing as applied.** That would contradict the outage and mean a witness is wrong — worth
  more than the deploy.
- The backoffice run should show **all six applied, nothing to do**; anything else, stop.

### 🔴 Operator sequence for @Porter — replaces TASK-085's, verbatim-ready
Scheduling first, then backoffice.
```
# 1. Ask the DATABASE what is applied. Read the whole table before continuing. Changes nothing.
bun run db:seed-ledger

#    Expect: 0000-0014 ✅ applied · 0015/0016/0017 🔴 not applied (re-run? yes) · 0 need a human.
#    🔴 STOP and send the output if ANY row says "needs-human", or any "not applied" says "re-run? NO",
#       or if 0015-0017 come out as applied.

# 2. Write the ledger from that verdict. One row per applied migration.
bun run db:seed-ledger --apply

# 3. Apply the three that never ran. Self-verifies; fails loudly if anything is skipped.
bun run db:migrate
#    Expect: "✅ every migration is recorded in the ledger AND witnessed in the schema."
#    🔴 Non-zero exit ⇒ deploy NOT complete. Do not restart the app. Send the output.

# 4. Restart the service.
```
Then repeat 1–4 in `smart-scheduler-backoffice-back` (step 1 should show all six applied; step 3 applies
nothing and still verifies green).

⚠️ **Do not `db:seed`. Do not drop `drizzle.__drizzle_migrations`** — it stays as evidence and rollback.

### Verification
- `bunx tsc --noEmit` → **clean** in both repos.
- `bun test` → scheduling **374 pass / 0 fail** (49 files, was 357 — **+17**); backoffice **124 pass / 0 fail**
  (13 files, was 109 — **+15**).
- The witness→verdict logic is pure and tested, **including the half-applied case** (first object present, last
  absent → verdict `not-applied`, so it re-runs rather than being declared finished), strict inheritance,
  unevaluable→`needs-human`, and the blocker rules (`0006`-shaped halt vs a safe re-run).
- ⚠️ **Nothing verified against a database, and per TASK-085's disclosure it must not be by me.** The probe SQL
  is reviewed by reading only. Steps 1–4 are the verification.

**DoD:** every journal entry has a witness naming the object it probes **and why that object proves *that*
migration ran** ✓ · witnesses probe the **last** object, reasoning stated per migration ✓ · `0006` is
`rerunnable: false` and **halts** ✓ · seeder and verifier share **one** map and one probe module — they cannot
disagree ✓ · dry-run prints witness · found · verdict · re-runnable, one row per journal entry ✓ · expected
output **and** stop conditions stated ✓ · tsc + tests green in both repos, half-applied case tested ✓ ·
operator sequence written ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- ⚠️ **You cannot run this against `sid`, and `env -u DATABASE_URL` will not protect you** — that's the trap you
  found. Assume any script you execute reaches production.
- **If a migration has no honest witness, say so.** `needs-human` for one entry is a fine outcome; a
  plausible-looking probe that might be wrong is not. Six of these are already applied — being wrong about one
  costs more than leaving it for the operator to confirm.
- Porter's framing is right and I'm repeating it: **not urgent.** `sid` stays down either way, and this is the
  class of problem that gets worse when hurried.

## Review
(Sober fills at REVIEW.)

## Review
**Verdict: DONE ✅ (Sober, 2026-08-02).** Verified independently: `session.transaction(...)` at
`drizzle-orm/pg-core/dialect.cjs:62` **does** wrap the whole run; `bookings_teacher_slot_uq` really is created by
**three** files (`0000`, `0002`, `0007`) and **`0002` contains no `SICK_LEAVE`**; `split-migration-ledger.ts` is
gone; and both `verify-migrations.ts` and `seed-ledger-from-schema.ts` import the **same**
`src/lib/migration-witness`. `tsc` 0 both repos · scheduling **374/0** · backoffice **124/0**.

### 🔴 Your `0002` finding is the one nobody else had, and it changes what "safe to re-run" means
`0002` and `0007` both drop and recreate the same index, differing only in the predicate. So:
- **existence is a false positive for `0007`** — satisfied by `0000`/`0002`, which is why probing the index
  *definition* for `SICK_LEAVE` is right; and
- **re-running `0002` would silently REGRESS `0007`**, dropping `SICK_LEAVE` back out of the predicate and
  re-breaking leave-overbooking.

**Neither Porter's re-run table nor my task caught that**, because we both asked *"will this migration error?"*
The real question is **"will this migration undo a later one?"** — and an old migration that succeeds while
reverting a newer one is worse than one that fails, because nothing goes red. `rerunnable: false` **for a
reason that isn't about errors** is exactly the right conclusion.

**And refusing to give `0002` a witness was the right call**, not a gap. Its only object no longer exists in its
own form once `0007` has run, so any probe would be a lie. Inheriting `0007`'s verdict **strictly** —
`needs-human` if `0007` is anything but `applied` — is the honest version of "we can't observe this directly".

### The transaction finding narrows the risk correctly, and you still kept the rule
`db:migrate` **cannot half-apply** — one transaction, whole batch rolls back. So the last-object rule is **belt
and braces rather than the only thing standing between us and a hole**, and the genuine partial-state exposure
is the **one confirmed out-of-band applier**: the `db-check-migrate.ts` you deleted, which ran statements
individually with `sql.unsafe` and no transaction, for `0004`/`0005`.

**You narrowed the risk and then didn't relax the guard** — and chose `0005`'s witness specifically because
that script could have stopped part-way through it. That's the right order: understand the exposure, then keep
the protection anyway.

### One witness map, and a test that made you do better work
`verify-migrations.ts` and `seed-ledger-from-schema.ts` import the same module — verified, so **they cannot
disagree**, which was the requirement that mattered most: a green verify on a broken database would be worse
than today's red one.

And the test asserting **no justification is a one-liner** earning its keep immediately — it failed on `0010`
("0010's only object.") and made you write a real reason. **A test that rejects lazy prose is an unusual thing
to write and it worked**; the justification is the part a human reads when deciding whether to trust the verdict.

### Deleting `db:split-ledger` — agreed, and I'd have been wrong to keep it
It answered "what does the ledger say?" when the whole finding is that **the ledger is not the truth**. Leaving
a superseded script that reads the wrong source, next to a task about migration safety, is the same argument you
used on `db-check-migrate.ts` — and you applied it to your own work from yesterday. **Overruled nothing; you
were right.**

### Standing
You ran **nothing** against a database, said so first, and everything uncertain is pure and tested. After
yesterday's disclosure that's exactly the posture I wanted, without me having to ask for it.

**TASK-086 → DONE.** ⏳ **@Porter — the updated operator sequence is in the task**, dry-run first as before.
**Nobody on this team runs it.** ⚠️ **And carry this line to whoever executes it:** if the dry-run reports
`0002` or `0006` as *not applied*, **stop** — those are the two whose wrong verdict isn't recoverable by
re-running.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-086 | 🔴 **BOTH repos**: seed the ledger from the **database's state** — witness per migration, shared map | — | ✅ **DONE** (Sober 2026-08-02 — verified independently: drizzle wraps the whole migrate in **one transaction** (so `db:migrate` cannot half-apply; the only real partial-state exposure was the deleted out-of-band script), `bookings_teacher_slot_uq` is created by **three** files and **`0002` has no `SICK_LEAVE`**, and both scripts import the **same** witness map so they cannot disagree; tsc 0 both repos, **374/0** + **124/0**. 🔴 **His finding neither Porter nor I had: re-running `0002` would silently REGRESS `0007`** — we both asked "will it error?", the real question is "will it undo a later migration?" An old migration that succeeds while reverting a newer one is worse than one that fails, because nothing goes red) — ⏳ **@Porter: updated sequence in the task. If the dry-run reports `0002` or `0006` as NOT applied → STOP** | Jason | TASK-085 |
```
