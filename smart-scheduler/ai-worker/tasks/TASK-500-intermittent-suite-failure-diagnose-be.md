# TASK-500 — the intermittent full-run failure has recurred: make it diagnosable, then fix the cause — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size S.** No migration. 🚫 **Raising a timeout is not a fix** unless §2 proves it is.

## §0 It recurred, so it now has an owner
In TASK-488 you reported **one of four full runs** timing out (~10 s, not an assertion) in the route sweeps, passing alone every time. I could not reproduce it then and wrote: *"noted, owned by nobody, until it recurs."*
**It has recurred on my machine:** one run came back **3256 pass / 1 fail**, with four clean runs around it. ⇒ roughly **one run in five**, across two machines.

## §1 🔴 Why I am not letting this sit
**Our entire review process rests on "the suite is green".** I re-run every task twice and take two clean runs as evidence. **A failure that appears once in five runs means a genuine regression can be dismissed as "the flake" — by you, or by me, and most likely by whoever is here in six months and has read that it is known.** That is a worse outcome than the flake itself: **it makes the suite's verdict negotiable**, and a negotiable verdict is not a gate.
📌 It is also the one thing in this round that **weakens every other pin we have written.** All those `🔑` assertions are only worth what a red run is worth.

## §2 Establish before fixing — I want the cause, not the symptom gone
1. **Which test, and what did it actually do?** Capture the failure — a loop of full runs until it reproduces, with the file, the test name and the message kept. 🔑 **Do not start from a theory; start from a captured failure.**
2. **Is it a timeout, or an assertion that only fails under contention?** Those are completely different bugs. A timeout in a file that passes alone points at **shared cost** (the runner's concurrency, a heavy module graph, a real `await` on something). An assertion means **shared STATE between files** — and that would be the more serious finding, because it means test isolation is not what we think it is.
3. **Name what is shared.** Those route sweeps read source files and build the root app. Say whether anything is module-level and mutable, and whether two files can interfere.
4. ⚠️ **If the honest answer is "the machine was busy", say so and prove it** (the same run passing with reduced concurrency, repeatedly). Then the fix may legitimately be a timeout — **but only with that evidence, and with the number justified.** 🚫 Never silently.

## §3 Then fix
- Fix the **cause** you established. If it is contention, make the offending file cheap or explicit about its cost; if it is shared state, isolate it; if it is genuinely the runner, say so with the evidence and pick the number in the open.
- 🔑 **Prove it with repetition, not with one green run:** **twenty consecutive full runs**, all green, stated as such. One run proves nothing about a one-in-five event.
- 📌 **Say whether anything else in the suite has the same shape.** The route sweeps are not the only tests that read the tree and build the app.
- 🚫 Do not delete or skip a test to make this go away. 🚫 Do not weaken an assertion.

## Definition of Done
- [ ] The failure **captured** (file · test · message), not theorised · timeout vs contended assertion **distinguished and named** · what is shared between those files stated · the **cause** fixed, or the runner proven the cause with a justified number in the open · 🔑 **twenty consecutive green full runs** · anything else of the same shape named · no test deleted, skipped or weakened · suite **count** · tsc 0 · 59 = 59 · report here + `inbox/SA.md` + log.

---

# 🛑 STOPPED — @Jason → @Sober (2026-09-26) — the flake is almost certainly tests making REAL network calls to a live database: **sid's**. That is a safety finding first and a flake second. **Nothing changed, nothing queried; escalating.**

## What I did, in order (all evidence kept in my scratchpad; nothing written to the repo)
1. **25 consecutive full runs, idle machine: 25/25 green.** It does not reproduce on demand.
2. **Per-test timings (one JUnit run):** the slowest test is **0.88 s**, about **11× under** the 10 s budget. Pure CPU contention would need a massive stall, so "the machine was busy" was a weak explanation.
3. **Every run prints `[outbox] LINE worker started (every 15s)`.** Importing `src/index.ts` (which ~25 test files do, for the root app) starts the real outbox worker. It **only starts when `LINE_CHANNEL_ACCESS_TOKEN` is set**, and it runs one tick on boot.
4. 🔴 **Bun auto-loads `.env` into every test run.** The tests' `process.env.DATABASE_URL ??= "postgres://…localhost…/test"` **does not override** an existing value. I listed `.env`'s **key names only** and the database **host** (no values, no credentials):
   - `DATABASE_URL` host **154.197.124.206:5432 / smart_scheduler**, **the same host as `.env.sid`**;
   - `LINE_CHANNEL_ACCESS_TOKEN` **set** (value not read or shown);
   - also `LINE_CHANNEL_SECRET`, `BOOTSTRAP_ADMIN_*`, `SERVICE_TOKEN`, `OPS_API_URL` and others.
   - ⇒ **On this machine, the test suite runs with sid's live database and a real LINE token in its environment.**
5. **The safe experiment**, which touches no real system: one full run with `DATABASE_URL` pointed at a **closed local port** (`127.0.0.1:1`) and the LINE token blanked, for that process only.
   - ⇒ **44 tests in 16 files FAIL.** In a normal run **those 44 tests make real database calls, i.e. to sid.**
   - The slowest of them failed at **10 017 ms**, the exact signature of the intermittent timeout (the route sweeps and chat-dispatcher tests waiting on a database connection).

## The files whose tests reach a real database (count of tests)
`middleware/auth.test.ts` (3) · `services/teacher-help-list-req109` (7) · `services/unmute-and-chips-req107` (7) · `services/co-taught-my-schedule-req109` (3) · **`services/duo-suspension-req108` (3, MINE, TASK-489's LINE-door tests)** · `services/liff-link-req107` (3) · `services/line-phone-in-silence-req105` (3) · `services/richmenu-round2-req107` (3) · `services/teacher-schedule-tap-req109` (3) · `services/no-token-in-parent-copy-req107` (2) · `services/webhook-never-silent-req105` (2) · `lib/budget-visibility-req102` (1) · `lib/camp-day-rate-req104` (1) · `lib/coach-rate-visibility-req102-6` (1) · `routes/envelope-reachability.route` (1) · `services/camp-absent-terminal-req108` (1).
- **The pattern:** almost all go through the LINE webhook dispatcher or the root app's auth guard, **where some read or write is not mocked** (the webhook's idempotency store, the session and link tables, the auth guard's user row). These are exactly the "route sweep / dispatcher" files from TASK-488's flake reports.

## ⚠️ What I can and cannot say
- **I CANNOT say what those calls did on sid** (reads only, or writes such as webhook-idempotency rows). I will not query sid to find out; that is the owner's (or Tanya's, who has sid access).
- **I CANNOT say whether the outbox worker's boot tick ever sent a LINE message.** In the 25 runs' logs there is no `[outbox] sent=` line and no error, which fits "nothing pending" as well as anything else. **Whether any test run ever delivered a real LINE message is a question for the owner's logs.**
- **Stated plainly: the full suite has been run by me dozens of times today, and by you, on machines whose `.env` may point at sid.** If this box's `.env` is typical of the team's, every one of those runs could have reached sid's database. **I did not know until now, and I am reporting it before doing anything else.**

## Why I stopped instead of fixing
Your instruction on TASK-499 was the principle: a second live problem is a **stop and tell**, not a quiet fix. This is bigger than a flake: **the test suite touching a real environment** is what the workspace rules forbid outright ("never touch real databases/environments"). What to do about `.env`, and whether sid needs checking, is the owner's call. **I have not changed `.env`, any test, or any code.**

## Proposal: for your ruling, NOT built
1. **For the human/owner, now:** decide whether this machine's `.env` should point at sid at all while tests run. Check sid (outbox rows, `line_webhook_events`, recent writes) and the LINE channel for anything a test run caused.
2. **Make it impossible, in the repo:** a test **preload** (`bunfig.toml` `[test] preload`) that **before any import** forces `DATABASE_URL` to a closed local port and **blanks every LINE / OA credential**. Then an unmocked query fails **fast and deterministically** instead of reaching a real server. **That alone turns the one-in-five flake into a reproducible red**, which is the gate you asked for.
3. **Then fix the 44 tests' missing mocks**, file by file, as a follow-up: each is an unmocked read or write on the dispatcher / guard path.
4. **Stop the outbox worker starting on import under test** (it only starts because a real token is present), or have the preload blank the token (2), which already does it.
5. **Then** the 20 consecutive green runs you asked for, **with the preload in place**. Twenty green runs that are allowed to reach sid would prove nothing.

⛔ Waiting on your ruling (and the owner's on sid). TASK-500 itself is NOT done: no fix, no 20-run proof.

---

# 🔨 RULING — @Sober (2026-09-26): **stopping was right; this is a safety finding, not a flake.** Build the preload FIRST. 🔴 Escalated to @Porter for the owner.

**I verified the core fact myself, read-only, before escalating:** `.env` in the back repo has **`DATABASE_URL` host `154.197.124.206:5432`, database `smart_scheduler`** — **not localhost** — and a real `LINE_CHANNEL_ACCESS_TOKEN` is set. (`.env` is git-ignored, which is right; that is not the issue.) **Bun auto-loads it, and `process.env.DATABASE_URL ??= …` cannot override a value that is already there.** Your reasoning holds.

## What this actually is
🔴 **The test suite has been running against a live database, on every full run, on this machine.** Not by anyone's intent — by the interaction of three innocuous things: Bun loading `.env`, `??=` not overriding, and 44 tests in 16 files having an unmocked read on the dispatcher or guard path. **The 10 017 ms failure is a connection wait; the "flake" was the network.**
📌 **It is the round's own lesson turned on us:** we have spent two days finding rules that were true only where somebody happened to look. **"Tests never touch a real environment" was one of those** — believed, never enforced, and false in fact.
⚠️ **And I have to own my part: I have run the full suite dozens of times today, verifying your work.** Every one of those runs was on this machine, with this `.env`. **I did not check what my own verification command connected to.** I asked you all week what else reads this, and I never asked it of the thing I type twenty times a day.

## ✅ Your proposal, ruled
1. **Preload FIRST — `bunfig.toml` `[test] preload` that forces `DATABASE_URL` to a closed local port and blanks every LINE/OA credential before any import.** Build this **before** anything else, as its own change. ✅ **It makes an unmocked query fail fast and deterministically**, which turns a one-in-five flake into a reproducible red — the gate I asked for — and it stops the class rather than the instance.
   - 🔑 **The preload must also FAIL LOUDLY if it cannot take effect** (if something imported a client before it ran). A safety preload that silently does nothing is worse than none.
   - 🔑 **And it must be impossible to opt out of accidentally** — no "unless an env var says otherwise".
2. **Then the 44 tests' missing mocks, file by file** — that is a real backlog and it will have its own task with your list in it. **Expect some of them to be findings**, not chores: a test that needed a real database was testing something it did not declare.
3. ✅ **The outbox worker starting on import is covered by the preload** (it only starts with a token present). Good — one fix, two problems.
4. ✅ **The 20 green runs come AFTER the preload, and you are right that they would otherwise prove nothing.** Twenty runs allowed to reach a live box are twenty runs of the wrong thing.

## 🚫 What I am doing about my own verification, starting now
**I will not run the full suite again until the preload is in.** Until then I verify with `tsc`, the migration invariant, and by reading the code — and **I will say in each review that the suite count is yours, not mine.** 📌 **A number I cannot obtain safely is not evidence I am entitled to quote.**

---

# ✅ STEP 1 REPORT — @Jason → @Sober (2026-09-26) — the test SAFETY PRELOAD, as ruled: in effect, loud, no opt-out. **The suite is now honestly RED: 3232 pass / 44 fail — the 44 that used to reach sid.** tsc 0 · 59 = 59 · 5/5 mutations bite

## What landed (three files, nothing else touched: no `.env`, no test, no route)
- **`bunfig.toml`** (new): `[test] preload = ["./src/test/safety.preload.ts"]`, so it runs for every `bun test`, before any test file.
- **`src/test/safety.preload.ts`** (new), in order:
  1. **FORCES** `DATABASE_URL` (`=`, not `??=`) to `postgres://tests-never-touch-a-real-database:x@127.0.0.1:1/closed`, a closed local port;
  2. **deletes every outbound credential**: `LINE_CHANNEL_ACCESS_TOKEN`, `OPS_API_URL` and `SERVICE_TOKEN` (the only env values code uses to reach an external system; swept `src`). ⇒ **no LINE push, reply or menu call, no ops API call, and the outbox worker stays idle**, so one fix covers both problems;
  3. **imports the db client ITSELF and checks it was BUILT for `127.0.0.1:1`**; otherwise it **throws**, and the run refuses to start with "TEST SAFETY PRELOAD DID NOT TAKE EFFECT — refusing to run the suite… do not bypass this check."
  - **No opt-out:** it reads no env var or flag that could switch it off.
  - `LINE_CHANNEL_SECRET` is left alone on purpose: it only VERIFIES an inbound signature and reaches nothing.
- **`src/test/safety-preload.test.ts`** (new, 5 tests): pins that the preload is **in effect in the very run**:
  - the URL and the **built client's** host and port;
  - every outbound credential absent;
  - **an unmocked query fails locally and fast** (refused in ~28 ms, via drizzle's `.cause` chain);
  - wired in `bunfig.toml`;
  - by source: `=` not `??=`, it throws, and no env condition anywhere.

## 🔑 Proven by BEHAVIOUR, not just by source
- **In effect:** the full run prints `[outbox] LINE_CHANNEL_ACCESS_TOKEN not set — worker idle`. **Zero** `worker started` lines (before: one per run).
- **The loud refusal really fires.** I built the db client BEFORE the safety preload, against **another closed local port** (`127.0.0.1:2`, so nothing real was reachable), using a scratch config that ordered an early loader first. ⇒ **"🔴 TEST SAFETY PRELOAD DID NOT TAKE EFFECT — refusing to run the suite. The database client was built for 127.0.0.1:2"**, and the run ended **0 pass, 1 fail**.
  - 📌 A detail found doing it: a CLI `--preload` runs **after** `bunfig.toml`'s. So a developer's own `--preload` cannot get in first; only an earlier entry in `bunfig` could, and that is an edit to this file.

## 🔴 The suite is RED now, and that is the truth, not a regression
- **Full run under the preload: 3232 pass / 44 fail**, **exactly the same 16 files and per-file counts** as my closed-port experiment (diffed, identical). **Those 44 passed before only because sid answered them.**
- ⇒ **Every "green" number I reported earlier today was obtained with those 44 tests reaching sid.** They weren't false as counts, but they were produced by a run that touched a live box. **My numbers from TASK-486 onward carry that caveat.**
- ⚠️ **Not all 44 fail FAST:** a few still take seconds (up to ~7.8 s) before failing, although a single refused query takes ~28 ms. So those tests do something repeated (several queries, a retry, a wait). **That is part of the 44-mocks task**; worth knowing because it is also why the old flake looked like a timeout.
- **The list of 44 (16 files)** is in my stop report above. Per your ruling, **their mocks are their own task**: *"a test that needed a real database was testing something it did not declare."*

## Break-and-watch: `mut500.mjs`, 5 mutations, **5 bite**
- 🔴 **Safety of the mutation runs themselves:** every mutated run gets a closed database and blank outbound credentials **in its own environment**, so a mutation that removes the safety net cannot reach a real server. (Consequently A is caught by its source pin rather than by a behavioural failure: with the runner's own closed URL, `??=` keeps a closed value. I'd rather that than let a mutation reach sid.)
- `BASELINE=10`, `finally` + sha-256 restore, byte-identical. **CHECKSUM `332878d2…` identical before and after.**
  - **A — the URL DEFAULTED (`??=`)** instead of forced: **bites, 2 fail**.
  - **B — the outbound credentials NOT removed**: **bites, 1 fail**.
  - **C — the check made SILENT** (warn instead of throw): **bites, 1 fail**.
  - **D — the preload UNWIRED** from `bunfig.toml`: **bites, 1 fail**.
  - **E — an OPT-OUT added** (`ALLOW_REAL_DB`): **bites, 1 fail**.

## Numbers
**tsc 0 · 59 = 59 · full suite 3232 pass / 44 fail** (the 44 are the known list, now honest). 📌 From now on, **any number from this suite is from a run that cannot reach a real system**, so it is safe for you to run again.
⛔ Only you mark this step DONE. Next per your ruling: the 44 files' mocks (your task to cut), then the 20 consecutive green runs.

---

# 🔨 RULING — @Sober (2026-09-26): **revert the preload.** The owner ruled against it while you were building it. ▶️ TASK-503, then TASK-504 (the mocks).

**Timing, so this is not read as a rebuke: my ruling told you to build it, and the owner's ruling arrived after you had started.** You built what I asked for, and you built it well — **the fault in the sequencing is mine**, not yours.

## Why it must come out, even though it works
The owner's words were explicit: *"Do NOT build the dead-port preload as described; it would break the setup the owner wants."* **And it does:** with it in place the suite is **red** — I measured **3230 pass / 46 fail**, and your run said 44. ⚠️ **The count itself is not stable between runs**, which is its own small finding: those tests are not merely DB-dependent, they are **non-deterministic** without one.
⇒ A suite that is red by design is a suite nobody can use as a gate. **The owner has said his engineers test against `sid`; a permanently red run takes that away from him today in exchange for a safety property he has already declined.** Revert `bunfig.toml`, the preload and its tests, as a clean removal.

## 🔴 What you proved, which we keep
**Your green numbers before today were partly sid-backed, and you said so first.** That is the honest and uncomfortable conclusion: **44–46 tests passed because a real database answered them**, not because the code under test was right in isolation. **I have been quoting those counts in every review all week**, so the caveat is mine as much as yours. It does not invalidate the reviews — the mutations, the by-value pins and the source scans stand on their own — but **"3243 pass" meant slightly less than I said it meant**, and that belongs on the record rather than in a memory.

## The path, in the owner's order
1. **TASK-503** — the guard he *does* want: refuse on **uat or the real OA**, which is the case that must never happen.
2. **TASK-504** — the 44–46 files, mocked a file at a time, **as ordinary maintenance**. Your list is the spec.
3. **Then, and only then, the preload is worth re-proposing** — once nothing needs a database, it costs nothing and guarantees everything. 📌 **That is a proposal for the owner when it is free, not a decision for me now.** Keep the code in your scratchpad; it will be three lines when it returns.

---

# ⏪ REVERTED — @Jason (2026-09-26), per the owner's ruling via @Sober: the dead-port preload is OUT, byte-exact
- **Removed:** `bunfig.toml`, `src/test/safety.preload.ts`, `src/test/safety-preload.test.ts` (all three were new, untracked files of mine), and the now-empty `src/test/`.
- **Proof it is byte-exact:** the working-tree checksum after removal is **`0ff4e10b…`**, identical to the value recorded right after TASK-501 and before the preload existed.
- **Kept for the day it returns:** a copy of all three files in my scratchpad (`preload-kept/`).
- `bunfig.toml` now exists again for **TASK-503's guard only** (it reads and refuses; it changes nothing).
