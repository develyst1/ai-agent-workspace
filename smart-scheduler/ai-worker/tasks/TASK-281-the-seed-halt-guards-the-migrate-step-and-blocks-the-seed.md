**Status:** DONE — code (Sober 09-08, reviewed) — tsc 0 / 1704 pass 0 fail / nothing run against any database / 0033 witness byte-untouched. **uat is UNBLOCKED.** He deleted blockers() and wrote seedHalts()/seedWarnings() — two questions, two functions, so the placement error cannot recur.

# TASK-281 — 🛑 `db:seed-ledger` refuses to seed because of a risk that belongs to `db:migrate`

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-08)
⏱️ **TONIGHT — the owner is holding mid-deploy on `uat`, the CUSTOMER'S live box.** Nothing has been changed
there and nothing will be until this lands.
🚫 No migration, no database, no FE change. 🚫 **Do not touch any witness declaration.**

---

## §1 What happened
The owner ran `db:seed-ledger` on `uat`. **Dry run, refused, exit 1, nothing changed** — correctly, by the rule
as written:
```
0033_paused_slot_index  [not-applied, re-runnable: NO]
  witness: index bookings_teacher_slot_uq definition contains "PAUSED" → found=false
Summary: 28 applied · 7 not applied · 1 need a human
Ledger: 37 rows present · 3 to insert
```
**The 3 to insert are `0025` `0026` `0027` — applied but unrecorded. `0028`–`0034` are genuinely not applied.**

## §2 🔻 The defect is mine, and it is a PLACEMENT error, not a logic error
`blockers()` halts on **`needs-human` OR (`not-applied` AND `!rerunnable`)**, with the comment:
> *"Anything that would have `db:migrate` attempt a migration that cannot survive it, or that we cannot judge,
> must stop the operator rather than proceed."*

**Read it again: that sentence is about `db:migrate`.** ⇒ **it is a migrate-step guard living inside a
seed-step tool, and it blocks the seed to protect the step after it.**

**Three facts settle that it is spurious here:**
1. ✅ **`--apply` inserts rows only for `applied` tags** — `toInsert` is built from `applied`. **A `not-applied`
   migration is never seeded**, so `0033` changes nothing about what this command would write.
2. ✅ **`rerunnable: false` is CORRECT** — `0033`'s SQL is a bare `DROP INDEX "bookings_teacher_slot_uq";` with
   **no `IF EXISTS`**. **Do not "fix" that.**
3. 🔑 **The scenario the rule guards against cannot occur here.** It protects against a witness saying
   *not-applied* when the migration IS applied. **`0033`'s probe is the index's PREDICATE containing `PAUSED`** —
   a string that can only be there if `0033` ran. **`found=false` is a reliable negative**, which is the entire
   content of that witness's own `why`.

📌 **And the door this rule guards grew its own lock three weeks later:** **`db:preflight` (TASK-266)** now runs
before `drizzle-kit migrate` and refuses an unsplittable batch up front. **When `blockers()` was written, nothing
else stood between the operator and a bad batch. That is no longer true.**

## §3 The change
**`blockers()` halts the SEED on `needs-human` only.**
The `not-applied && !rerunnable` case becomes a **loud WARNING that does not exit 1** — printed under its own
heading, naming the tags and saying, in one line, **what it means and what already covers it**:
> *this migration cannot survive a second attempt; `db:migrate` will apply it once. `db:preflight` refuses a
> batch that cannot be applied, and the witness above is what establishes it has not run.*

🚫 **Do NOT silently drop the case.** ⚠️ **An operator who saw a `🔴 STOP` last night must see something in the
same place tonight, or the tool looks like it stopped noticing.** **The words change; the visibility does not.**
🚫 **Do not change any witness, any probe, or `rerunnable` on any entry.**
🚫 **Do not change what `--apply` writes.** It already writes only `applied` tags — **assert that**, because it
is now the thing carrying the safety.

## §4 What must not change
- 🚫 `WITNESSES`, `judge()`, `probeAll()`, `appliedTags()`, `migrationHash()`.
- 🚫 The `needs-human` halt — **that one is still a real stop.**
- 🚫 The dry-run default. **`--apply` stays opt-in.**
- 🚫 `db:preflight`, `db:migrate`, `db:migrate:through`, **PENDING DEPLOY 8's two commands.**
- 🚫 No migration, no database, no FE change.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count**
- [ ] `blockers()` returns **only** `needs-human` — asserted, **and asserted that a `not-applied && !rerunnable`
      entry is NOT a blocker**
- [ ] 🔑 **The warning still PRINTS for exactly that case**, naming the tag — asserted on the output, not on the
      predicate. *A rule nobody sees is not a softer rule, it is a deleted one.*
- [ ] 🔑 **`--apply` writes rows only for `applied` tags** — asserted directly, because this is now what makes
      §3 safe rather than a side effect
- [ ] **Tonight's exact `uat` shape**, as a fixture: `0033` not-applied + not re-runnable, `0025`–`0027` applied
      and unrecorded ⇒ **exit 0, warning shown, exactly three rows to insert.** Asserted against the **real
      witness table**, not a hand-made one.
- [ ] `needs-human` still exits 1 — asserted, **because the half that stays is the half that matters**
- [ ] **Break it and watch:** make a `needs-human` entry and show it still stops
- [ ] 🚫 No witness changed · no migration · no database

## Question
**Is `blockers()` used anywhere except this script?** If `db:verify` or the preflight also calls it, softening it
changes their behaviour too — **and that would be a second placement error, not a fix.** **Check before you
change it, and say what you found.**

---

# ✅ Jason (BE) — DONE, code. 2026-09-08

`smart-scheduler-back` · **tsc --noEmit → 0** · **bun test → 1704 pass / 0 fail, 134 files**
🚫 No migration · no database · **no witness touched** — `0033`'s `rerunnable: false` and its predicate probe
are exactly as they were · nothing run against `uat`.
New: `src/lib/seed-halt.test.ts` (9 tests).

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1704 / 0**, 134 files
- [x] The seed halts on **`needs-human` only**
- [x] The other case is a **loud warning that does not exit 1** — asserted that the warning branch contains no
      `process.exit`
- [x] 🔑 **Tonight's exact `uat` shape, against the REAL witness table** — `0033` not-applied, `0025`–`0027`
      applied-and-unrecorded ⇒ **no halt, warning shown, exactly three rows to insert**
- [x] 🚫 Nothing silently dropped — the warning prints in the same place the STOP did
- [x] 🚫 No migration, no database, no witness touched

## The change — one function was answering two questions
`blockers()` is gone. In its place, **two functions named for the question each asks**:
- **`seedHalts()`** — `needs-human` only. *We do not know whether this migration ran*, and **no other tool can
  answer it**, so it stops.
- **`seedWarnings()`** — `not-applied && !rerunnable`. **Shown loudly, never fatal.**

The warning text says where the guard moved to, because the concern did not disappear:
> *"This does NOT block the seed: `--apply` writes rows only for migrations the DATABASE says are already
> applied, so these are skipped either way. ⚠️ But `db:migrate` will attempt them. Read `bun run db:preflight`
> before you run it."*

📌 **That sentence is the control against the next person re-adding the halt** — the same shape as the
*"deliberately NOT the inverse"* sentences: put the reason where somebody would otherwise make the change.

## Verified rather than accepted — your three facts, each as a test
1. **The seed cannot touch `0033`.** `appliedTags(results)` does not contain it, and has exactly
   `SCHEDULING_WITNESSES.length - 1` entries. ⇒ halting protected nothing.
2. **`rerunnable: false` is correct.** Asserted, together with the probe being `index-predicate` on
   `bookings_teacher_slot_uq` containing `PAUSED`, and with `0033`'s SQL containing a bare `DROP INDEX`.
   🚫 **The flag is not the thing to fix**, and the test says so.
3. **`db:preflight` guards the migrate step**, and the warning names it.

✅ **Break it and watch, and I checked the REASON:** restoring the old two-question halt fails **two** tests —
*"nothing halts"* **and** *"halts and warnings are counted separately"*, because `0033` then appears in both
lists. **That second failure is the one that tells me the mutation did what I meant**, not merely that something
went red.
⚠️ 📌 And the first attempt at that mutation **silently did not apply** — a `perl` pattern that did not match,
inside an `&&` chain that then skipped the test run. I only noticed because the output had no "MUTATED" line.
**A mutation test that does not mutate is a green run that proves nothing** — the same class as your own false
confirmation on TASK-273, arriving from the tooling rather than the fixture.

## Answer — **`blockers()` had exactly ONE caller: `seed-ledger-from-schema.ts:62`**
`verify-migrations.ts` and `probe-witnesses.ts` import from `migration-witness`, but **not `blockers`** — they
take `judge`, `SCHEDULING_WITNESSES` and the probe map. `migrate-preflight.ts` has a **local variable** also
called `blockers`, from `scanBatch` — a different function entirely, and the only reason a grep looks alarming.
⇒ **Softening it changed nothing but the seed.** Kept as a test: the three other scripts are asserted not to use
either new function, so a second placement error fails here rather than at 11pm on a customer's box.

## Review — Sober, 2026-09-08: ✅ **PASS. TASK-281 is DONE. `uat` is unblocked.** 🔑 **And splitting one function into two named for their QUESTIONS is a better fix than the one I specified.**

**Reproduced:** `bunx tsc --noEmit` → **0** · `bun test` → **1704 pass / 0 fail**, 134 files · nothing run
against any database.
**Verified line by line, because the next thing that happens is a write to the customer's box:**
- `seedHalts()` = **`needs-human` only** · `seedWarnings()` = `not-applied && !rerunnable` — **neither exits.**
- `scripts/seed-ledger-from-schema.ts:121` — **`process.exit(1)` is now guarded by `halts.length` alone.**
- The warning prints **in the same place the STOP did**, before the summary, with the tag and the `why`.
- 🔑 **`toInsert` is still built from `applied`** — unchanged. **The seed still cannot write a row for a
  not-applied tag.**
- 🔴 **`0033`'s witness is byte-untouched** — `index-predicate` on `bookings_teacher_slot_uq` containing
  `PAUSED`, `rerunnable: false`. **That was the thing I most needed to be true and it is.**

### 🔑 I asked you to soften `blockers()`. You deleted it and wrote two functions named for their questions
**`seedHalts` — *we cannot judge this*. `seedWarnings` — *this cannot be retried*.**
⇒ **The placement error could not recur, because there is no longer one function that could answer both.** **My
version would have left a single predicate that the next person could quietly widen again.** ✅ **You fixed the
shape, not the symptom** — and that is the difference between the two fixes.

### 🔑 The warning text is the control against the next person, and you knew it
> *"This does NOT block the seed: `--apply` writes rows only for migrations the DATABASE says are already
> applied… ⚠️ But `db:migrate` will attempt them. Read `bun run db:preflight` before you run it."*

📌 **Same shape as the *"deliberately NOT the inverse"* sentences: put the reason where somebody would otherwise
make the change.** **Nobody re-adds a halt that explains, in place, where the guard went.**

### ✅ You verified my three facts instead of accepting them
`appliedTags` asserted not to contain `0033` (⇒ **halting protected nothing**) · `rerunnable: false` asserted
**correct**, together with the bare `DROP INDEX` in the SQL, **so the flag cannot be "fixed" by a future reader**
· `db:preflight` named in the warning. **Being told a thing is safe and asserting it are different, and on this
box the difference was the whole review.**

### ⚠️ Your mutation that silently did not mutate — the FOURTH of that class today
> *"a `perl` pattern that did not match, inside an `&&` chain that then skipped the test run. I only noticed
> because the output had no 'MUTATED' line."*

**A mutation test that does not mutate is a green run that proves nothing.** 📌 **Four today, and this one came
from the TOOLING rather than the fixture or the code** — the `size:6`/`confirmed:6` fixture · my malformed 11th
card · your `bin: undefined` default parameter · this. ⇒ **the general form has now shown up in every layer we
have**, and the only thing that caught it each time was **checking why the result came out that way.**
✅ **And your two-test failure set is the right measurement** — *"that second failure is the one that tells me the
mutation did what I meant, not merely that something went red."*

### The answer — one caller, and the alarming grep explained
**`blockers()` had exactly one caller.** ✅ **And `migrate-preflight.ts` has a LOCAL variable of the same name
from `scanBatch`** — *"a different function entirely, and the only reason a grep looks alarming."* **Naming the
false positive is worth as much as the true one**, because the next person greps too. ✅ Kept as a test that the
three other scripts use neither new function — **so a second placement error fails here rather than at 11pm on a
customer's box.**
