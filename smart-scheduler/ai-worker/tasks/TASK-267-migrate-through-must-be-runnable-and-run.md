**Status:** DONE — code (Sober 09-06, reviewed) — tsc 0 / 1568 pass 0 fail / --plan executed by both of us / nothing applied. Follow-up: TASK-268 (bunx).

# TASK-267 — `db:migrate:through` cannot resolve `drizzle-kit`, and it had never been run

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-06)
**Cause:** the owner ran it on `sid`. **Nothing committed** — it failed before touching the database, and said so.
🔴 **`uat` is blocked again until this lands.** 📌 **No hurry** — @Porter: *"`sid` is not urgent and nothing is
broken — take the time."*

---

## §1 The defect
`scripts/migrate-through.ts:52` — `mkdtempSync(join(tmpdir(), "migrate-through-"))`, and the generated
`drizzle.config.ts` is written **into that OS temp folder** (`:60`). Its first line is
`import { defineConfig } from "drizzle-kit"`.
⇒ **module resolution walks up from `C:\Users\…\Temp\` and never reaches the repo's `node_modules`.**
```
Cannot find module 'drizzle-kit'
```

**Fix: put the scratch folder INSIDE the repo** — `mkdtempSync(join(<repo root>, ".migrate-through-"))` or
equivalent — so the config resolves `drizzle-kit` exactly as `drizzle.config.ts` does.
✅ Everything else about the design stands: byte-for-byte copies · the same ledger table · the real `drizzle/`
never modified · the scoped verify.
⚠️ **Add the scratch name to `.gitignore`**, and **remove the folder on every exit path including failure** — a
stray directory that looks like a migrations folder is its own hazard.

## §2 🔴 The real finding, and it is @Porter's
> *"TASK-266 was written and reviewed but never RUN. A deploy tool whose entire job is to be executed had never
> been executed once."*

**He is right, and the omission is mine before it is anyone's.** ⚠️ **I required a dry-run for
`line:remove-menus`** — TASK-250 §2, *"dry-run by default, `--apply` to act… the dry-run is the deliverable, not a
courtesy"* — **and then wrote TASK-266 without one.** The precedent was in my own hand and I did not apply it.

📌 **And the failure was in the half that needs no database at all.** Config placement is decided before a
connection is opened. **It was always testable; nobody made it testable.**

⇒ **`db:migrate:through` gains `--plan`** (dry-run), which does everything except the irreversible step:
1. resolves the tag, builds the scratch folder and the config;
2. 🔑 **proves `drizzle-kit` resolves from that config's location** — the exact failure above;
3. prints the migrations it would apply, in order, and the command it would run;
4. **exits 0 without connecting to a database.**

✅ **And a test must RUN `--plan`** — not read its source. **That is the assertion that would have caught this**,
and it needs no `DATABASE_URL`.

## §3 What must not change
- 🚫 The split itself, the scoped verify, the ledger table, the byte-for-byte copies — all correct.
- 🚫 **Do not fall back to the real `drizzle/` folder on any error path.** A tool that quietly applies everything
  when its partial mode fails is worse than one that fails.
- 🚫 **Do not run it against a database.** `--plan` is yours to run; the real one is the owner's.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, state the count
- [ ] The scratch folder is inside the repo, gitignored, and **removed on success AND on failure** — asserted
- [ ] 🔑 **`--plan` exists, and a test EXECUTES it** and asserts: the config resolves `drizzle-kit`, the listed
      migrations are the right ones in the right order, and **no connection is attempted**
- [ ] **You ran `--plan` yourself and pasted the output** — the point of this task is that it has been run
- [ ] The refusal/instruction text from TASK-266 still names commands that now work end to end
- [ ] 🚫 Nothing applied, no database touched, no migration added

## Question
**Is `--plan` enough to have caught this, or only this instance?** Name what `--plan` still cannot see. **A
dry-run that stops one step short of the risky part is a control; one that stops five steps short is a comfort**,
and I would rather know which this is.

---

# ✅ Jason (BE) — DONE, code. 2026-09-06

`smart-scheduler-back` · **tsc --noEmit → 0** · **bun test → 1568 pass / 0 fail, 123 files**
🚫 Nothing applied · **no database touched** · no migration added (35 `.sql` = 35 tags, unchanged).
New: `src/lib/migrate-through-plan.test.ts` (15 tests, and it **runs the script**).

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1568 / 0**, 123 files
- [x] Scratch folder inside the repo, gitignored, **removed on success AND on failure** — asserted by running the
      script and then listing the directory, on four paths (success · unknown tag · missing tag · no URL)
- [x] 🔑 `--plan` exists and a test **EXECUTES** it — resolution, listed migrations in journal order, no connection
- [x] **I ran it. Output pasted below.**
- [x] TASK-266's refusal text still names commands that now work end to end
- [x] 🚫 Nothing applied, no database touched, no migration added

## §1 — the fix
`mkdtempSync(join(root, ".migrate-through-"))`, gitignored as `.migrate-through-*`.
⚠️ **And a second bug in the same area, which the restructuring exposed:** the old code called `process.exit()`
**inside the `try`** — and `process.exit()` does not run `finally`. The cleanup was written and would never have
run on the success path. Now nothing inside the try exits; the code is collected and `process.exit(exitCode)` is
the last line of the file. Asserted by listing the directory after four different runs.

## 🔴 The thing I got wrong first, and it is the answer to your Question
My first `--plan` proved resolution with **`Bun.resolveSync("drizzle-kit", scratch)`**. It printed a ✓.
**I mutated the script back to the OS temp folder to check the guard bit — and it still printed the ✓.**
`Bun.resolveSync` finds the package in **Bun's global install cache**
(`~/.bun/install/cache/drizzle-kit@0.31.10…`), which no amount of being in the wrong directory affects.

⇒ **A dry-run that stops one step short is a control; that one stopped short and said ✓ over the exact failure.**
Replaced with `resolvesByNodeWalk` — **node's own algorithm**, walk up for `node_modules/<pkg>` — which is what
esbuild and therefore drizzle-kit's config loader end up doing. Re-mutated: it now **fails**, with the message
the owner would have needed.
📌 ⚠️ And the first version of *that* was forward-slash-only and reported *"not reachable"* from **inside** the
repo on Windows. **A check that fails on the correct arrangement is as useless as one that passes on the broken
one** — both are in the unit tests now, as separate cases.

## The run — `--plan`, no `DATABASE_URL`, nothing contacted
```
$ DATABASE_URL= bun run scripts/migrate-through.ts 0032_booking_paused_status --plan

db:migrate:through 0032_booking_paused_status --plan — handing drizzle the 33 journal entries up to and including 0032_booking_paused_status.
  (drizzle applies only the ones missing from the ledger; the rest are no-ops.)
  0000  0000_supreme_zarek
  0001  0001_add_reschedule_fields
  …
  0032  0032_booking_paused_status

  scratch folder : H:\scheduler\smart-scheduler-back\.migrate-through-urGUmu
  drizzle-kit    : H:\scheduler\smart-scheduler-back/node_modules/drizzle-kit ✓  (found by walking up from the config, as node does)
  config         : loads and exports a config ✓
  would run      : bunx drizzle-kit migrate --config H:\scheduler\smart-scheduler-back\.migrate-through-urGUmu\drizzle.config.ts
  then           : bun run scripts/verify-migrations.ts --through 0032_booking_paused_status

✅ --plan: nothing was applied and no database was contacted.
exit 0
```
And the same script with the scratch folder put back in the OS temp dir — the `sid` arrangement:
```
✗ db:migrate:through — drizzle-kit is not reachable from C:\Users\KUYDONG\AppData\Local\Temp\.migrate-through-kdHryl by walking up for node_modules.
  The generated config imports it, so this run would fail with: Cannot find module drizzle-kit.
  Nothing was applied and no database was contacted.
```
⇒ **`--plan` reproduces the failure it exists for. That is the claim, and it is measured, not asserted.**

📌 One wording change that came out of running it: the header said *"33 migration(s)"*, which on a live box reads
as *"about to re-run the world."* It now says **handing drizzle the 33 journal entries**, with
*"(drizzle applies only the ones missing from the ledger; the rest are no-ops.)"* — because `--plan` cannot see
the ledger and must not imply it can. **I would not have noticed that by reading the code.**

## Answer — **what `--plan` still cannot see**
It is a control for **this class**, not a general one. Honestly:

| ✅ it proves | 🚫 it cannot see |
|---|---|
| the tag exists and the entry list is right, in journal order | **which migrations are actually pending** — that is in the ledger, and `--plan` opens nothing. `db:preflight` is the command that knows |
| the scratch folder builds; the `.sql` copies land | whether **drizzle-kit's CLI** accepts the config — I prove the module is *reachable* and that Bun can *load* the file; I do not run `drizzle-kit` |
| `drizzle-kit` is reachable **by node's algorithm** from the config's directory | whether the **database** is reachable, whether `drizzle.__drizzle_migrations_scheduling` exists, whether the role can DDL |
| the generated config parses and exports a config | whether the SQL itself applies — a constraint violation on real data is invisible to any dry run |
| the folder is removed on success and on failure | that **run 1 commits what we think** — the atomicity note from TASK-266 stands unchanged |

🔴 **The one gap I would flag as still real:** the command line is `bunx drizzle-kit migrate --config …`, and
`--plan` proves the *module* resolves, not that **`bunx` picks the local binary**. `bunx` prefers
`node_modules/.bin`, so the two agree today — but they are different resolutions and only one of them is checked.
⇒ **If you want that closed, it is one more line** (resolve `node_modules/.bin/drizzle-kit` and invoke it
directly instead of via `bunx`), and it removes `bunx` from the deploy path entirely. **Your call — I have not
done it, because it changes the command the deploy note names and that note is now with @Porter.**

## Review — Sober, 2026-09-06: ✅ **PASS. TASK-267 is DONE (code).** 🔴 **And your first `--plan` printed a ✓ over the exact failure — that is the answer to my Question.**

**Reproduced, and I ran it myself:** `tsc --noEmit` → **0** · `bun test` → **1568 pass / 0 fail** (123 files) ·
`.gitignore:120` has `.migrate-through-*` · `scripts/migrate-through.ts:70` is
`mkdtempSync(join(root, ".migrate-through-"))` · **I executed `DATABASE_URL= bun run scripts/migrate-through.ts
0032_booking_paused_status --plan`** — resolution ✓, config loads ✓, exit 0, nothing contacted — **and the scratch
folder was gone afterwards.**

### 🔴 The finding: a guard that passed over the thing it guards
> *"My first `--plan` proved resolution with `Bun.resolveSync`. It printed a ✓. I mutated the script back to the
> OS temp folder to check the guard bit — and it still printed the ✓."*

`Bun.resolveSync` finds the package in **Bun's global install cache**, which no amount of being in the wrong
directory affects. ⇒ **the dry-run would have shipped, said ✓, and the owner would have hit `Cannot find module`
on the next run anyway.**
📌 **That is the answer to my Question, and it is better than the question:** *"a dry-run that stops one step
short is a control; that one stopped short and said ✓ over the exact failure."* ⇒ replaced with **node's own
walk-up**, which is what drizzle-kit's config loader ends up doing, **and re-mutated to prove it now fails.**
🔑 **The technique is the keeper: you did not test the guard by reading it — you broke the thing it guards and
watched.** That is the only way to know a control is one.

### ✅ Two more found by the same method
- 🔴 **`process.exit()` inside the `try` means `finally` never runs.** The cleanup was written **and would never
  have run on the success path.** ⇒ nothing inside the try exits; the code is collected and exit is the last line.
  **Asserted by listing the directory after four different runs** — success, unknown tag, missing tag, no URL.
  📌 **A `finally` that cannot run is the same shape as everything else this week: written, believed, never
  exercised.**
- ⚠️ **Your first walk-up was forward-slash-only and reported "not reachable" from INSIDE the repo on Windows.**
  *"A check that fails on the correct arrangement is as useless as one that passes on the broken one"* — and both
  are separate unit cases now. **The false-red and the false-green, each pinned.**

### ✅ The wording change you could only have found by running it
*"33 migration(s)"* → *"handing drizzle the 33 journal entries… (drizzle applies only the ones missing from the
ledger; the rest are no-ops)"*, **because `--plan` cannot see the ledger and must not imply it can.**
📌 **On a live box the first phrasing reads as "about to re-run the world."** *"I would not have noticed that by
reading the code"* — **that is DEPLOY RULE 6 paying for itself on the day it was written.**

### ✅ The gap table is the right shape, and I am ruling on the one you left open
Five honest "cannot see" rows — pending set, the CLI's own acceptance, the database, the SQL applying, atomicity.
**All correctly out of scope for a dry run.**

🔴 **Your flagged gap — `bunx` vs module resolution — CLOSE IT.** You held off because *"it changes the command the
deploy note names."* ⚠️ **It does not.** The note names **`bun run db:migrate:through 0032_booking_paused_status`**
— a package script. `bunx drizzle-kit` is **internal to that script**, and only `--plan`'s *"would run"* line
echoes it. ⇒ **PENDING DEPLOY 8 is unaffected, so the cost you were protecting against is not there.**
📌 **And the reason to close it is this project's most repeated lesson:** two resolutions that agree today are two
things that can disagree later, and **only one of them is checked.** ⇒ resolve `node_modules/.bin/drizzle-kit`
and invoke it directly. **`bunx` leaves the deploy path entirely** — one less thing between the owner and the
migration.
✅ **Small follow-up, not a re-open:** TASK-267 is DONE; this goes on as **TASK-268**.

**Status → DONE (code).** ⇒ **`uat` is unblocked, and `sid` can take the split run.**
