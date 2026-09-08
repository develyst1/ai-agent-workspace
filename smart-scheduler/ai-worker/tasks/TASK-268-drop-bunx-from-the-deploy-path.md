**Status:** DONE — code (Sober 09-07, reviewed) — tsc 0 / 1694 pass 0 fail / --plan run by both of us / nothing applied. PENDING DEPLOY 8 unchanged. The third resolution (db:migrate via the script-runner PATH) RULED no task: the .bin shim is generated from the same bin field --plan reads.

# TASK-268 — invoke `drizzle-kit` directly, so the checked resolution is the used one

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-06)
**Source:** the gap **you** flagged at the end of TASK-267 and deliberately did not close. **Small.** 📌 **No
hurry** — `uat` is not blocked on it.

---

## §1 The gap, in your words
> *"`--plan` proves the **module** resolves, not that **`bunx` picks the local binary**. `bunx` prefers
> `node_modules/.bin`, so the two agree today — but they are different resolutions and only one of them is
> checked."*

⇒ **`--plan` verifies one thing and the run uses another.** They agree today. **This project's most repeated
lesson is that two things which agree today are two things that can disagree later** — three status lists, three
parent lookups, two labelling conventions, a projection and its builder. **All of them agreed once.**

## §2 🔴 The cost you were protecting against is not there
You held off *"because it changes the command the deploy note names."* **It does not.**
PENDING DEPLOY 8 names **`bun run db:migrate:through 0032_booking_paused_status`** — a *package script*.
**`bunx drizzle-kit` is internal to that script**, and the only place it surfaces is `--plan`'s *"would run"*
line. ⇒ **the deploy note is unaffected. @Porter carries nothing new to the owner.**

## §3 The change
Resolve **`node_modules/.bin/drizzle-kit`** from the repo root and invoke it directly instead of via `bunx`.
✅ **Then `--plan` checks the binary the run actually uses**, and `bunx` leaves the deploy path entirely —
**one less thing between the owner and the migration**, and one less network-capable resolver in a step that
should touch nothing but the disk and the database.
⚠️ **Refuse loudly if that path does not exist**, with the same failing-closed rule as the rest: *a preflight that
passes when it cannot see is worse than none.*
⚠️ **Windows**: the `.bin` entry is a shim, not the script. **Run `--plan` on this machine and paste it**, the way
you did for TASK-267 — that is what caught the last two bugs here.

## §4 What must not change
- 🚫 The two commands in PENDING DEPLOY 8 — **if this changes them, stop and tell me.**
- 🚫 `--plan`'s promise: exit 0, no connection, folder removed.
- 🚫 The node-walk resolution check. **It stays** — it proves the *config's* import; this adds the *binary's*.
  **They are two different questions and both are now asked.**

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, state the count
- [ ] `drizzle-kit` is invoked from the resolved local path; **no `bunx` anywhere in the migrate path** — asserted
- [ ] `--plan` checks **that same path**, and a test proves the check **fails** when it is absent — *break it and
      watch*, as you did twice on TASK-267
- [ ] **You ran `--plan` and pasted the output**
- [ ] PENDING DEPLOY 8's two commands are **unchanged** — quote them back
- [ ] 🚫 Nothing applied, no database touched

## Question
**Is `bunx` anywhere else in a path that runs against a real box?** `sale:ensure-items`, `line:publish-menus`,
`line:remove-menus`, `db:preflight`, `db:verify`. **I have not swept it** — and if it is, the same reasoning
applies, but as its own task rather than folded into this one.

---

# ✅ Jason (BE) — DONE, code. 2026-09-07

`smart-scheduler-back` · **tsc --noEmit → 0** · **bun test → 1694 pass / 0 fail, 133 files**
🚫 Nothing applied · **no database touched** · no migration · the node-walk module check kept (two different
questions, both now asked) · `--plan`'s promise unchanged: exit 0, no connection, folder removed.
New: `src/lib/drizzle-bin.test.ts` (11 tests).

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1694 / 0**, 133 files
- [x] `drizzle-kit` invoked from the resolved local path; **no `bunx` anywhere in the migrate path** — asserted
      across the three scripts **and every `package.json` script**
- [x] `--plan` checks **that same path**, and the failure is proved four ways (below)
- [x] **I ran `--plan`.** Output pasted
- [x] **PENDING DEPLOY 8's two commands are unchanged** — quoted back below
- [x] 🚫 Nothing applied, no database touched

## 🔴 §3's `node_modules/.bin/drizzle-kit` does not exist on this machine
`.bin` holds **`drizzle-kit.exe`** and **`drizzle-kit.bunx`** — Bun's Windows shims — while POSIX gets a bare
symlink. ⇒ resolving *"the `.bin` entry"* means guessing a per-platform filename, which is a second thing that
can be wrong.
✅ **So I read the package's own `bin` field instead:** `drizzle-kit`'s `package.json` declares
`"bin": { "drizzle-kit": "./bin.cjs" }` — **authoritative, one file, identical on every platform**, and it is
what every shim ultimately executes. Resolved with the same `resolvesByNodeWalk` we already trust, then run as
`bun <path> migrate --config …`.
📌 **I read the field rather than the shim's bytes.** The `.bunx` shim happens to contain `drizzle-kit\bin.cjs`,
which would have given the same answer today — but reverse-engineering a shim is exactly the *"agrees today"*
shape this task exists to remove.

## The run
```
$ DATABASE_URL= bun run scripts/migrate-through.ts 0032_booking_paused_status --plan
  scratch folder : H:\scheduler\smart-scheduler-back\.migrate-through-A0jo9Z
  drizzle-kit    : …/node_modules/drizzle-kit ✓  (found by walking up from the config, as node does)
  config         : loads and exports a config ✓
  drizzle-kit bin: …/node_modules/drizzle-kit/bin.cjs ✓  (the package's own `bin` entry — not a shim, not a PATH lookup)
  would run      : bun …/node_modules/drizzle-kit/bin.cjs migrate --config …\drizzle.config.ts
  then           : bun run scripts/verify-migrations.ts --through 0032_booking_paused_status

✅ --plan: nothing was applied and no database was contacted.
```
⇒ **`--plan` now prints the command it will actually run**, and both resolutions are checked. Scratch folder
removed, as before.

## Break it and watch — four ways, because there are four ways to fail
`resolveDrizzleKitBin` is a pure function taking `exists` and `readJson`, so each failure is its own test rather
than a mutation: **no package** · **no `bin` field** · **a `bin` naming a file that is not there** · **an
unreadable `package.json`** (which returns `null`, never throws — *a preflight that crashes is a preflight whose
message nobody reads*). Plus the script's own refusal branch, asserted at the source because the real package
cannot be made to disappear from inside a test.
📌 ⚠️ **And one of those four caught a mistake in my own fixture:** `tree({ bin: undefined })` hit the helper's
**default parameter** and silently got the default back, so *"no `bin` field"* was testing the happy path. Fixed
with `"bin" in opts`, and the reason is on the line. **A test that cannot express the case it names is worse than
no test**, and it took the first run to see it.

## 🔑 PENDING DEPLOY 8 — unchanged, quoted back
```
bun run db:migrate:through 0032_booking_paused_status
bun run db:migrate
```
Both are package scripts; `bunx` was internal, and the only place it ever surfaced was `--plan`'s *"would run"*
line. **@Porter carries nothing new.** Asserted as an equality on both script bodies, so a future edit to either
fails here.

## Answer — **`bunx` is now in no executable path. But name the third resolution.**
✅ Swept `scripts/`, `src/` and `package.json`: **zero `bunx` in any command**. The only remaining occurrences are
two comments and this task's own prose. Kept as a test over all three scripts **and every `package.json` script**,
so it stays true.

⚠️ **The honest remainder: `db:migrate` still runs a bare `drizzle-kit migrate`**, resolved by **bun's own script
runner**, which prepends `node_modules/.bin` to `PATH`. That is a **third** resolution — different from both the
module walk and the `bin` field.
🔑 **It is not the same risk**, and the difference is worth stating rather than flattening: the script-runner
PATH is **local-only and never network-capable**, which was the specific hazard `bunx` carried into a deploy
step. ⇒ **I have not changed it**, because §4 forbids changing those two commands and because the risk it carries
is a different, smaller one.
📌 **But `--plan` does not check it either** — `--plan` belongs to `db:migrate:through`. **If you want the full
`db:migrate` path checked too, that is its own small task**, and it is the last unchecked resolution in the
deploy path. **Naming it rather than leaving the sweep sounding complete.**

## Review — Sober, 2026-09-07: ✅ **PASS. TASK-268 is DONE.** 🔑 **You did not build what §3 asked for, and you were right not to.** 🔴 **My ruling on the third resolution: NO task — and the reason is not "small risk".**

**Reproduced, and I ran `--plan` myself:** `bunx tsc --noEmit` → **0** · `bun test` → **1694 pass / 0 fail**,
133 files · **zero `bunx` in any command** across `scripts/`, `src/` and `package.json` (three comments remain) ·
`--plan` → **exit 0, nothing contacted, scratch folder gone**, and it now prints
`drizzle-kit bin: …/node_modules/drizzle-kit/bin.cjs ✓` · **PENDING DEPLOY 8's two commands verbatim unchanged.**

### 🔑 §3 asked for `node_modules/.bin/drizzle-kit`. It does not exist. You read the `bin` FIELD instead.
`.bin` holds **`drizzle-kit.exe`** and **`drizzle-kit.bunx`** on this machine and a bare symlink on POSIX ⇒
**resolving "the `.bin` entry" means guessing a per-platform filename — a second thing that can be wrong.**
✅ **`drizzle-kit`'s own `package.json` declares `"bin": { "drizzle-kit": "./bin.cjs" }`** — I checked it —
**authoritative, one file, identical everywhere.**
🔑 **And the sentence that makes it a decision rather than a shortcut:** *"I read the field rather than the
shim's bytes… reverse-engineering a shim is exactly the 'agrees today' shape this task exists to remove."*
**You refused to solve the task with the technique the task exists to eliminate.** That is the right instinct and
I did not put it in the task.

### 🔴 The third resolution — I am ruling NO TASK, and not because it is small
`db:migrate` runs a bare `drizzle-kit migrate`, resolved by bun's script runner through `node_modules/.bin` on
`PATH`. **You named it rather than letting the sweep sound complete, which is why it can be ruled on at all.**

**My reason is structural, not a risk estimate:** ⇒ **the `.bin` shim is GENERATED from the same `bin` field
`--plan` now reads.** **They are one fact seen twice, not two facts that happen to agree** — and this project's
rule has always been about *independent* facts that agree today and can disagree tomorrow. **A derived value
cannot drift from its source.**
✅ **Your point stands too and is worth keeping:** the script-runner `PATH` is **local-only and never
network-capable**, which was the specific hazard `bunx` carried into a deploy step. ⇒ its failure is **loud and
local** (*command not found*), never a silently different version.
🚫 **So: not built, and recorded rather than left as a loose end.** 📌 **The deploy path is now closed** —
`--plan` checks both the module walk and the binary, and the one remaining lookup is derived from the second.

### ⚠️ Your fixture bug is the third of that shape today, and you found it yourself
> *"`tree({ bin: undefined })` hit the helper's default parameter and silently got the default back, so 'no
> `bin` field' was testing the happy path."*

**A test that cannot express the case it names is worse than no test** — it is a green light with a label on it.
📌 **Third time today:** the `size: 6`/`confirmed: 6` fixture · my malformed 11th card failing `tsc` for the
wrong reason · this. **All three were only visible to somebody who checked WHY the result came out that way.**
✅ **And four failure paths as separate pure-function tests rather than mutations** — including *"an unreadable
`package.json` returns `null`, never throws: a preflight that crashes is a preflight whose message nobody
reads"* — is the right shape for a thing whose whole job is to explain itself.

📌 **Your queue is empty.** **The pause shipment (270+271+272) has been ready since the evening and is now the
oldest thing on the board.**
