# TASK-505 — 🔴 a test run starts the outbox worker and would DELIVER real LINE messages — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size XS**, one line in a production file. Found by you in TASK-504 and correctly left alone there. **Build this before continuing TASK-504.**

## §0 What it is
`index.ts` starts the outbox worker on import. **Roughly 25 test files import the root app**, so every one of those test processes:
- **reads `sid`'s `notification_outbox`**, and
- **because `.env` carries a real LINE token, would DELIVER any pending rows** — racing `sid`'s own worker.
The boot tick's error is caught, so nothing ever failed and nobody noticed.

## §1 Why this is not covered by the owner's ruling
**He ruled that testing against `sid` is by design.** That is about **reading and writing a database we own.** 🔑 **He did not rule that a test run may SEND MESSAGES**, and those are different acts: one touches a box, **the other puts text on a real person's phone.**
📌 And it is worse in one window than it looks: **during the 09-26 release `.env` held the REAL OA token** (`@427ybeky`). A test run in that window would have delivered **the customer's own queued messages**, from a machine nobody thought was sending anything. TASK-503 now refuses that run — **but only because of a guard we happened to build yesterday**, and this door should be shut on its own.

## §2 Build
- **The worker does not start when the module is imported by a test.** 🔑 **Detect the test run, not the environment** — a check that depends on a variable somebody has to set will be wrong on the day it matters. Say what you used and why it cannot be false-negative.
- 🔑 **The production path must be untouched and PROVEN untouched:** the worker still starts normally on a real boot. **Pin that by value**, not by reading the diff — this is a production file and the failure mode is "the shop's messages silently stop going out", which is far worse than the bug being fixed.
- **Say whether anything else starts on import** with the same shape (a timer, a poller, a connection). 📌 **One is a bug; two would be a pattern**, and I want to know which this is.
- 🚫 **Nothing about what the worker does when it runs, about the outbox table, or about any message.** 🚫 Do not touch `.env`.
- ⚠️ **If the honest fix is bigger than one line** — for example if the worker's start is entangled with the app's construction — **stop and tell me.** I would rather rule on a real shape than have a clever one-liner in a file this important.

## §3 After it lands
📌 Say in your report whether the 16 remaining unreachable-run failures include any that were only the outbox tick. **If this closes some of TASK-504's files for free, that is worth knowing before you mock them.**

## Definition of Done
- [ ] No outbox worker in a test process · **the detection explained and argued as not false-negative** · the production start **pinned by value as unchanged** · anything else starting on import named · nothing else touched · suite **count** normally **and with the database unreachable** · tsc 0 · 59 = 59 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that starts the worker under test and one that stops it starting in production · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason → @Sober (2026-09-26) — one line: the worker starts only when `index.ts` is the process ENTRY. Proven on all three production launchers, and absent from every test process. Normally 3282 pass / 0 fail · database unreachable 3266 / 16 fail · tsc 0 · 59 = 59 · 2/2 mutations bite

## The change: one line in `src/index.ts`, the rest a comment
`if (import.meta.main) startOutboxWorker();` (was `startOutboxWorker();`). Nothing else in the file, the worker, the outbox or any message changed.

## 🔑 The detection, and why it can't be false-negative
- **It detects the test run itself, not the environment.** `import.meta.main` is true only for the module the process was STARTED with. **A test never starts `index.ts`; it IMPORTS it** (`await import("../index")`), and there `import.meta.main` is false by construction.
  - **No variable, nothing anyone must set or remember.** It doesn't depend on `NODE_ENV` (which a `.env` could set to `production`) or on any flag.
  - So under `bun test` it **cannot** be true. That's the false-negative you asked about: the worker starting in a test.
- **The other direction (the shop's messages silently stop) is where the real risk lies, so I proved it rather than argued it.** Every launcher in the repo was checked: `start` = `bun src/index.ts`, `dev` = `bun --watch src/index.ts`, `build` = `bun build src/index.ts --compile` (the owner builds locally, zips, and runs `pm2 restart`). **Nothing in `src/` or `scripts/` imports `index.ts` except tests.**
  1. **A probe, run three ways:** as `bun entry.ts` ⇒ entry `true`, dependency `false` · **compiled** (`--compile`) ⇒ entry `true` · imported by `bun test` ⇒ entry `false`.
  2. **The REAL app, compiled** exactly as `build` does (into my scratchpad, then deleted), started with a closed database and a fake token ⇒ **`[outbox] LINE worker started (every 15s)`**.
  3. **Pinned in the suite, by value, as real processes** (`src/lib/outbox-start-req108.test.ts`):
     - **`bun src/index.ts` prints `[outbox] LINE worker started (every 15s)`**;
     - **a real `bun test` of a file that imports the root app prints no `[outbox]` line at all**;
     - by source, exactly one start, guarded by `import.meta.main`.
  - 🔒 Every probe ran with the database on a **closed local port** and a **fake** LINE token, so none of them could read an outbox or send anything, even if the guard had been wrong.
- ⚠️ **The limit, stated:** pm2's launch script lives on the servers, not in the repo. **If a server's pm2 entry points at a wrapper file that IMPORTS `src/index.ts`** (rather than running it or the binary), the worker would not start there. Everything in the repo and every documented deploy runs `index.ts` or its binary directly. **Worth one look at `pm2 describe` on sid and uat at the next deploy:** confirm `[outbox] LINE worker started` appears in the log after restart, as SYSTEM-FACTS already records it does.

## Anything else that starts on import? **Yes, one more, so it's a pattern (named, not fixed)**
`index.ts` also installs `process.on("uncaughtException", … process.exit(1))` and an `unhandledRejection` logger **at import**. Those are the server's crash policy (TASK-462), and they're installed in **every test process that imports the app**.
- ⇒ **An uncaught exception inside such a test process now calls `process.exit(1)`: the whole run stops**, instead of bun reporting the error against the test that caused it.
- It fails loudly, not silently, so it's less dangerous than the worker. It's still server behaviour running where no server is. The same one-line shape would fix it; **not done, since it's yours to rule on.**
- **Nothing else:** there are no other module-level timers, pollers, servers or connections in `src/`. The db client is lazy, and the default export's server starts only when the file is the entry.

## §3: did this close any of TASK-504's 16 for free? **No.**
With the database unreachable it is still **16 fail, the same 9 files**. As I expected, the outbox tick's failure was always caught, so it never failed a test; it only reached sid.
- **But the full normal run's output now contains ZERO `[outbox]` lines** (before, one per file that imported the app). **No test process reads sid's outbox or can deliver from it any more.**

## Break-and-watch: `mut505.mjs`, 2 mutations, **2 bite**
Every mutated run had a closed database and a blank token in its own environment. `finally` + sha-256 restore, byte-identical. **CHECKSUM `bf919155…` identical before and after.** `BASELINE=3`.
- **A — the worker STARTS UNDER TEST again** (the guard removed): **bites, 2 fail**.
- **B — the worker STOPS STARTING IN PRODUCTION** (the guard inverted): **bites, 3 fail**.
- ⚠️ **Honest note:** my first run reported both as "PASSED ⚠" with "8 pass". **My runner took the FIRST "N pass" in the output, and these tests quote a subprocess's output inside their failure messages**, so it read the inner process's summary. I fixed the runner to read the **final** summary lines and re-ran: both bite. **That mistake also applied to TASK-503's runner** (its guard test quotes a subprocess too). I re-ran TASK-503's five with the fix: **all five still bite**, but with **corrected counts** (recorded in TASK-503).

**Numbers:** normally **3282 pass / 0 fail** (+3) · database unreachable **3266 / 16 fail** · tsc **0** · **59 = 59**.
⛔ Only you mark this DONE. Back to TASK-504 (9 files) after your ruling.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26)
Verified by me: `if (import.meta.main) startOutboxWorker();` at `src/index.ts:40` · tsc 0 · 59 = 59 · **normal run 3282 pass / 0 fail, and NOT ONE `[outbox]` line in the whole output** — which is the result, stated the way it should be stated. 📌 With the database unreachable I measured **18–20 fail against his 16**; that is the instability we already recorded, not a discrepancy — **the number that will settle it is a green unreachable run, and that is unambiguous.**

🔑 **`import.meta.main` is the right detection and the argument for it is the good part: it is true only for the module the process was STARTED with, and a test never starts `index.ts` — it imports it.** So the guard **cannot** be true under `bun test`, by construction, **with no variable for anyone to set or forget.** My instruction was "detect the test run, not the environment"; this detects *how the module was entered*, which is stronger than either.
🔑 **And he proved the direction that actually matters rather than arguing it.** The dangerous failure here is *the shop's messages silently stop going out*, so: a probe run three ways (entry, **compiled**, imported-under-test), **the real app compiled exactly as `build` does and started**, and then **pinned in the suite as real processes** — `bun src/index.ts` prints the worker line, a `bun test` that imports the app prints no `[outbox]` at all. ✅ **Every probe ran with a closed database and a fake token, so nothing could have been read or sent even if the guard had been wrong.** That is how to test a change whose failure mode is silence.
✅ **The limit is named and it is the right one:** pm2's launch script lives on the servers, not in the repo, so a wrapper that *imports* `index.ts` would not start the worker. Everything in the repo runs the file or its binary directly. **→ one check at the next deploy**, which I am sending to Porter.

## 📌 The runner bug he found in himself — and it reaches backwards
**His mutation runner took the FIRST "N pass" in the output**, and these tests **quote a subprocess's output inside their failure messages** — so it read the inner process's summary and reported two real bites as passes.
🔑 **That is a measuring instrument reporting the wrong thing, and it is the second time this week we have had one** (the provenance report's "after" query). **A tool we use to decide whether a test caught something is exactly as load-bearing as the tests.**
✅ **He fixed the runner, re-ran, and then went back and re-ran TASK-503's five** — which also quote a subprocess — **and reported the corrected counts.** Going back to a task already marked DONE, unprompted, because the instrument that judged it was wrong, is the behaviour I would most want and least expect to have to ask for.

## ▶️ The second thing starting on import: **TASK-506, cut. It is a pattern, as you said.**
`index.ts` installs `process.on("uncaughtException", … process.exit(1))` **at import**, so it is live in every test process that imports the app. ⇒ **an uncaught exception in such a process kills the whole run** instead of failing the test that caused it. **It fails loudly rather than silently, so it is less dangerous than the worker** — but it is server behaviour running where there is no server, and 📌 **it is a candidate for some of what we have been calling flakiness**, because "the run stopped" and "a test failed" look very different in a report.
