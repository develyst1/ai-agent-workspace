**Status:** DONE — code (Sober 09-06, reviewed) — tsc 0 / 1553 pass 0 fail / nothing applied. The sweep found the same defect at 0001/0002: a FRESH database is broken today.

# TASK-266 — `db:migrate` must REFUSE a batch it cannot apply, instead of failing inside it

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-06)
**Cause:** tonight's `sid` failure. **Clean rollback, nothing to repair** — journal 35 · witnesses 32 · `0032`
`0033` `0034` all unapplied. 🟢 **It cost nothing because the owner insisted on `sid` first.**
🔴 **This must exist before `uat` sees the same three migrations.**

---

## §1 🔴 My error, stated first, because the fix follows from it

`SPEC-075` §2 said: *"a new enum value cannot be USED in the transaction that adds it ⇒ **two migrations**."*
**The Postgres half was right and the tool half was wrong.** `db:migrate` is
`drizzle-kit migrate && bun run db:verify`, and **`drizzle-kit migrate` applies every pending migration in ONE
transaction.** ⇒ **two files are not two transactions.** The requirement was **two RUNS**, and I wrote **two
migrations**.

@Jason wrote the constraint into `0032`'s header, correctly and in full. **The command that applies it does not
read comments.**

## §2 The finding worth more than the fix — @Porter's, and he is right
> *"The requirement had no mechanism. 'Must be applied as a separate run' lives in a comment inside the file being
> applied, and the command that applies it never reads it."*

📌 **Third instance this week:** TASK-225's `sale:ensure-items` step lived only in a TASK · the deploy line that
never reached PENDING DEPLOY · this. **A note is not a mechanism.**
⚠️ **And the next person will hit it**, because `db:migrate` is *the documented command* and the constraint is
invisible from outside the file.

## §3 The mechanism — refuse, do not warn
**Add a preflight to `db:migrate`, before `drizzle-kit migrate`.** It reads the **pending** set and **exits
non-zero** when that set cannot be applied in one transaction.

**The rule to detect:** a pending migration contains `ALTER TYPE … ADD VALUE '<label>'`, **and a later pending
migration references `'<label>'`.** ⇒ they cannot share a transaction.

**On refusal it must print the split**, not a diagnosis — the operator needs the next command, not a lecture:
```
✗ this batch cannot be applied in one run: 0033 uses 'PAUSED', which 0032 adds.
  run:  <the command that applies up to and including 0032>
  then: bun run db:migrate      (applies the rest)
```
✅ **Reuse `src/lib/migration-ledger.ts`** — `missingMigrations` / `wouldApply` already compute *pending*.
🚫 **Do not make it clever.** It does not need to understand SQL; it needs to find one `ADD VALUE` and one later
mention of the same quoted label. **A narrow rule that fires is worth more than a general one that is disabled.**
📌 **`db:verify` is the precedent and it says so in its own header:** *"a deploy step that cannot fail visibly is
not a control."* **This is that, one step earlier.**

## §4 And it must be RUNNABLE, not only refusable
A refusal that leaves the operator stuck is a worse control than none.
⇒ **Provide the split command** — `db:migrate:to <tag>` or equivalent — so the sequence is two commands the
runbook can name, both of which end in `db:verify`.
⚠️ **Whatever the shape, it goes in the DEPLOY NOTE for `uat` as literal commands**, not as prose. @Porter carries
it to the owner and he types it on a live box.

## §5 What NOT to do
- 🚫 **Do not reorder or merge `0032`/`0033`.** They are correct; the *runner* was wrong.
- 🚫 **Do not make the preflight apply the split itself.** Silently doing two transactions where the operator
  asked for one is the same class of surprise as the one we are fixing. **Refuse and instruct.**
- 🚫 No change to `0034`.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, state the count
- [ ] The preflight refuses **tonight's exact batch** (`0032` `0033` `0034` pending) — asserted against the real
      files, not a fixture that only resembles them
- [ ] It **allows** a batch with no such pair — asserted, **including a batch containing `0032` alone**
- [ ] The refusal names the two migrations and prints the commands
- [ ] A split command exists and both halves end in `db:verify`
- [ ] 🚫 Nothing applied, no SQL run, no migration added

## Questions
1. **Is `ALTER TYPE … ADD VALUE` the only statement with this property in our migrations?** I know of no other,
   **but I did not sweep** — and the last three times someone swept a question I asked, it came back with more
   than I named. **If there are others, the preflight should cover them or say why not.**
2. 🔴 **Does drizzle's one-transaction batching hold for everything we write?** Tonight it **saved** us — the
   whole batch rolled back and left nothing half-done. **But that is a property of what we happen to write, not a
   guarantee.** Anything non-transactional (a `CONCURRENTLY` index, an `ALTER TYPE` on an older server) would
   break it. **Name what in our set relies on it**, because @Porter has to tell the owner what a failure on `uat`
   would leave behind.

---

# ✅ Jason (BE) — DONE, code. 2026-09-06

`smart-scheduler-back` · **tsc --noEmit → 0** · **bun test → 1553 pass / 0 fail, 122 files**
🚫 **Nothing applied · no SQL run · no migration added** (35 `.sql` = 35 tags, unchanged) · **I did not execute
`db:preflight` or `db:migrate:through`** — both need `DATABASE_URL` and would reach a real database. The decision
they make is pure and is tested against the real migration files instead.
New: `src/lib/migrate-preflight.ts` · `scripts/migrate-preflight.ts` · `scripts/migrate-through.ts` ·
`src/lib/migrate-preflight.test.ts` (20 tests).

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1553 / 0**, 122 files
- [x] Refuses **tonight's exact batch**, read off disk — `real(tag)` reads `drizzle/*.sql`, no fixture
- [x] **Allows** a batch with no such pair, **including `0032` alone** — the split it prints has to work, or the
      instruction is a loop
- [x] The refusal names the two migrations and prints the commands
- [x] `db:migrate:through <tag>` exists; **both halves end in a `db:verify`**
- [x] 🚫 Nothing applied, no SQL run, no migration added

## The shape
`db:migrate` is now `bun run db:preflight && drizzle-kit migrate && bun run db:verify`.
The decision is pure (`src/lib/migrate-preflight.ts`); the script computes *pending* with **`missingMigrations`,
the same function `db:verify` uses** — asserted, because "pending" meaning two things in the two halves of one
deploy step is how they would come to disagree.

⚠️ **It FAILS CLOSED.** No `DATABASE_URL`, an unreadable journal, a query that throws ⇒ exit non-zero. *A
preflight that passes when it cannot see is worse than none, because the deploy note will say it ran.*
🚫 **It refuses and instructs; it never splits the batch itself** (§5) — asserted: the script contains no
`drizzle-kit` and no `Bun.spawn`.

🔴 **Comments are stripped before anything is matched, and that is load-bearing.** `0029`'s header contains the
words `ALTER TYPE … ADD VALUE` **and** `'OTHER'` in prose; `0033`'s header contains `CONCURRENTLY` in a 🚫 line.
A preflight that read comments would refuse three correct migrations — **and a control that refuses correct work
is a control somebody removes.** Asserted on the real files, and mutation-tested: dropping the strip fails four
tests.

## §4 — the literal commands for the deploy note
🚫 I have not edited the board's PENDING DEPLOY block; it is yours. **This is the text:**

```
bun run db:migrate:through 0032_booking_paused_status
bun run db:migrate
```

`db:migrate:through` builds a **temporary** migrations folder holding the journal entries up to that tag and
their `.sql` files **copied byte-for-byte**, points a temporary drizzle config at it, and runs the ordinary
`drizzle-kit migrate` — same tool, same transaction semantics, **same ledger table**. Because drizzle's ledger
hash is the sha256 of the file text, the rows it writes are identical to the ones the full command would have
written, so the second run sees those as applied and continues.
🚫 **The real `drizzle/` folder is never modified** — asserted. A deploy step that edits the thing it is deploying
turns a half-finished run into an unrecoverable one.
✅ It ends in `bun run scripts/verify-migrations.ts --through <tag>` — a verify **scoped to what that run was
supposed to apply**. An unscoped one would report the migrations the run deliberately left behind as failures,
and a control that cries wolf on its own printed instruction is a control people stop reading. **`db:verify`'s
default is unchanged and unscoped** — the narrowing must be asked for, by a caller that knows what it applied.

## Answers

### Q1 — **not the only class, and not the only instance. The sweep came back with both.**

**(a) A SECOND instance of the same pair, and it is `0001`/`0002`.**
`0001` adds `'PENDING_RESCHEDULE'`; `0002` uses it in an index predicate — **the identical shape, thirty-one
migrations earlier.** `0007` and `0033` reference the same label again.
🔴 **It never failed because the two were authored days apart and applied one run at a time.** `0032`/`0033` were
written the same afternoon and therefore met the same batch. **The defect was never in the SQL; it is in what
happens to be pending together.**
⚠️ **And the consequence is live, not historical: a FRESH database has all 35 pending**, so `drizzle-kit migrate`
from empty would fail at `0002` **today** — a new environment, a rebuilt dev box, `db:reset`. The preflight now
refuses that too and prints the same instruction, chained:
```
bun run db:migrate:through 0001_add_reschedule_fields
bun run db:migrate                       # refuses again, at 0032
bun run db:migrate:through 0032_booking_paused_status
bun run db:migrate
```
📌 **The framing the rule taught me, which I had wrong twice while writing the test:** the offender is the
**ADDER, not the user.** Removing `0002` from a batch just promotes `0007`. Once `0001` is committed the label
exists and every user is fine — which is exactly why a split works, and why the split point is the `ALTER TYPE`
file rather than the first use.

**(b) A second CLASS: statements Postgres refuses inside a transaction block at all** — `CONCURRENTLY`, `VACUUM`,
`ALTER SYSTEM`, `CREATE DATABASE`, `DROP DATABASE`. **None is present in our set** (`0033`'s header rules
`CREATE INDEX CONCURRENTLY` out explicitly, on lock grounds). Covered anyway, as a literal five-word list, with
its **own message and no split instruction** — no split rescues them, so printing one would be a lie. Cheap to
add now; expensive after the first one lands.

### Q2 — 🔴 **Everything we write relies on it, and the fix takes it away for one run. @Porter needs this sentence.**

**What relies on it today:**
1. **The rollback that saved us.** `sid` failed and left **nothing** — journal 35, witnesses 32, none applied.
   That is a property of drizzle's one transaction, **not of our SQL**.
2. **The witness design's `rerunnable` flags.** `migration-witness.ts`'s own header says as much: `db:migrate`
   cannot leave a half-applied migration, and the real exposure is **out-of-band** application — the deleted
   `db-check-migrate.ts` ran statements one at a time with `sql.unsafe`, no transaction, for `0004`/`0005`.
   `0033` is `rerunnable: false` (unguarded `DROP INDEX` then a bare `CREATE UNIQUE INDEX`), and `0002`/`0007`
   are the same shape: **outside a transaction, a death between those two statements is not fixable by
   re-running.** Rule 1 ("witness the LAST object") exists for exactly this.
3. Nothing in our set is non-transactional — swept, see Q1(b).

🔴 **The exposure the fix CREATES, which must be in the deploy note rather than discovered:**
**`db:migrate:through` makes the batch NOT atomic. Run 1 COMMITS.** If run 2 then fails, run 1's work stays.
✅ **What that leaves, concretely, for tonight's batch:** the `'PAUSED'` label on `booking_status`, **and nothing
else.** That residue is **inert** — no index, no column and no application code reads it until `0033` lands —
and `ALTER TYPE … ADD VALUE IF NOT EXISTS` makes run 1 safe to repeat. ⇒ **A failure in run 2 is recoverable by
re-running `db:migrate`, and `db:verify` will name exactly what is missing.**
⚠️ **But the general guarantee is gone for that deploy**, and that is the honest answer to *"what would a failure
on `uat` leave behind"*: **not nothing, as tonight — one enum label.**

## Review — Sober, 2026-09-06: ✅ **PASS. TASK-266 is DONE (code).** 🔴 **And the sweep found the same defect thirty-one migrations back — live today.**

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1553 pass / 0 fail** (122 files) · `db:migrate` is now
`db:preflight && drizzle-kit migrate && db:verify` · `0001` really is
`ALTER TYPE … ADD VALUE 'PENDING_RESCHEDULE'` and `0002` references it · `0032` is
**`ADD VALUE IF NOT EXISTS 'PAUSED'`** — I checked that one because the recovery story depends on it.

### 🔴 Q1's answer is bigger than the question: **a fresh database is broken today**
`0001` adds the label, `0002` uses it in an index predicate — **the identical pair, thirty-one migrations
earlier.** It never fired because those two were **authored days apart and applied one run at a time**.
> *"The defect was never in the SQL; it is in what happens to be pending together."*

📌 **That sentence reframes the whole thing.** `0032`/`0033` were written the same afternoon, so they met the same
batch — the bug is a property of the **batch**, not of a file, which is exactly why a per-file comment could never
have stopped it.
⚠️ **And it is live, not historical: a fresh database has all 35 pending**, so `drizzle-kit migrate` from empty
fails at `0002` **right now** — a rebuilt dev box, a new environment, `db:reset`. **The preflight refuses that too
and prints the chain.** ⇒ **You found a broken path nobody had walked, by answering a question about a different
one.**

### 🔴 The framing that makes the split point correct
> *"The offender is the ADDER, not the user. Removing `0002` from a batch just promotes `0007`."*

**And you said you had it wrong twice while writing the test.** ✅ Once `0001` is committed the label exists and
every user is fine — **which is why a split works at all, and why the split point is the `ALTER TYPE` file rather
than the first use.** A rule derived from getting it wrong twice is worth more than one asserted from the start.

### ✅ Fails closed, and the reason is the one that matters
> *"A preflight that passes when it cannot see is worse than none, because the deploy note will say it ran."*

**No `DATABASE_URL`, an unreadable journal, a throwing query ⇒ non-zero.** ✅ And it uses **`missingMigrations`,
the same function `db:verify` uses** — asserted, *"because 'pending' meaning two things in the two halves of one
deploy step is how they would come to disagree."*

### 🔴 Comments stripped — and this time the trap was avoided rather than survived
`0029`'s header contains `ALTER TYPE … ADD VALUE` **and** `'OTHER'` in prose; `0033`'s contains `CONCURRENTLY` in
a 🚫 line. **A preflight that read comments would refuse three correct migrations.**
> *"A control that refuses correct work is a control somebody removes."*

📌 **That is the comment-vs-code trap prevented in advance** — the third time this week it has appeared, and the
first time it never got to bite. **And it is mutation-tested:** dropping the strip fails four tests, so the
protection cannot be quietly deleted.

### ✅ The scoped verify, which I would not have thought to ask for
Run 1 ends in `db:verify --through <tag>` — *"an unscoped one would report the migrations the run deliberately
left behind as failures, and a control that cries wolf on its own printed instruction is a control people stop
reading."* ✅ **And the default stays unscoped** — the narrowing must be asked for, by a caller that knows what it
applied. **That is the difference between adding an option and weakening a check.**
✅ `db:migrate:through` copies the `.sql` byte-for-byte into a temp folder and **never modifies `drizzle/`** —
*"a deploy step that edits the thing it is deploying turns a half-finished run into an unrecoverable one."*

### 🔴 Q2 — the answer @Porter needs, and it is the uncomfortable one
> *"`db:migrate:through` makes the batch NOT atomic. Run 1 COMMITS."*

**The fix removes the property that saved us tonight.** ⇒ the honest answer to *"what would a failure on `uat`
leave behind"* is **not nothing, as tonight — one enum label.**
✅ **And you bounded it concretely:** the `'PAUSED'` label and nothing else · **inert** (no index, no column, no
code reads it until `0033`) · and `ADD VALUE IF NOT EXISTS` makes run 1 repeatable — **verified in `0032`
myself.** ⇒ **a run-2 failure is recoverable by re-running `db:migrate`, and `db:verify` names what is missing.**
📌 **Naming the exposure your own fix creates is the part most people skip.**

### ✅ And the second class, added before it was needed
`CONCURRENTLY` · `VACUUM` · `ALTER SYSTEM` · `CREATE/DROP DATABASE` — **none in our set**, covered anyway, **with
their own message and no split instruction**, *"because no split rescues them, so printing one would be a lie."*
**Cheap now, expensive after the first one lands.**

**Status → DONE (code).** ⇒ `uat` is unblocked once @Porter has the commands in the deploy note.
