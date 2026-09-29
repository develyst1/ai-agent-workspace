# TASK-506 — the server's crash policy is installed on IMPORT, so it runs inside every test process — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size XS**, the same shape as TASK-505. Found by you there; named, not fixed, which was right.

## §0 What it is
`src/index.ts` installs `process.on("uncaughtException", … process.exit(1))` and the `unhandledRejection` logger **at import** — the server's crash policy from TASK-462. **Every test process that imports the root app (~25 files) installs it too.**
⇒ **An uncaught exception inside such a test process calls `process.exit(1)` and the whole run stops**, instead of bun reporting the error against the test that caused it.

## §1 Why it is worth an XS task
- **It fails loudly, so it is less dangerous than the worker** — nobody loses money and nothing reaches a customer. **That is why it is XS and not urgent.**
- 🔑 **But "the run stopped" and "a test failed" look completely different in a report, and only one of them names the culprit.** A run that dies at file 9 of 256 tells you nothing about which test was wrong.
- 📌 **It is therefore a candidate for some of what we have been calling flakiness this week.** I am not claiming it is — **establish whether it has ever actually fired in a test run**, and say so either way. ⚠️ **If the honest answer is "no evidence it has ever fired", say that**; the fix is still right, but I do not want it written up as the cause of something it did not cause.

## §2 Build
- The crash policy is installed **only when `index.ts` is the process entry** — the same `import.meta.main` shape as TASK-505, and for the same reason: *how the module was entered* needs nothing anyone has to set.
- 🔑 **Pin the production side by value, as you did for the worker:** a real entry process still installs it. **The failure mode of getting this wrong is a production server that no longer exits on an uncaught exception** — it would keep running in an unknown state, which is worse than crashing. Prove it with a real process, not by reading the diff.
- 🚫 **Nothing about what the policy DOES when it fires** — the exit code, the logging, TASK-462's behaviour on a real boot, all unchanged.
- 📌 **Say whether a test that legitimately wants an uncaught exception exists**, now that the policy will not swallow the process. If one does, its behaviour changes and I want it named.

## Definition of Done
- [ ] The crash policy installed only on a real entry, by the same detection · **the production install pinned by value with a real process** · evidence on whether it has ever fired in a test run, **stated either way and not overclaimed** · nothing about the policy's behaviour changed · any test affected by the change named · suite **count** normally **and with the database unreachable** · tsc 0 · 59 = 59 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that installs it under test and one that stops it installing in production · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason → @Sober (2026-09-26) — the crash policy is installed only on a real ENTRY; proven with a real boot that survives a rejection and exits 1 on a throw. Normally 3285 pass / 0 fail · database unreachable 3269 / 16 fail · tsc 0 · 59 = 59 · 2/2 mutations bite

## Has it ever fired in a test run? **No evidence that it has, and I'm not claiming it caused anything.**
- **I searched every suite output I captured today: 46 runs** (full and single-file, normal and unreachable) for the handler's own line `[process] uncaughtException`, and for any run that ended without its final `Ran N tests` summary (the signature of an `exit(1)` mid-run).
- **Zero occurrences of the line, and no truncated run.** I can't speak for runs I didn't capture (yours included).
- ⇒ **It is NOT the cause of this week's "flake"**, which TASK-500 showed was network waits on sid. The fix stands on its own: a latent way for one bad test to end the whole run silently as to which test did it.

## The change (`src/index.ts`): installation moved, behaviour identical
- The two handlers are now named exports, **`onUnhandledRejection`** and **`onUncaughtException`**, with **bodies byte-identical** to TASK-462's: same log lines, still `exit(1)`, still never `exit(0)`.
- They're installed only when the file is the process entry: `if (import.meta.main) { process.on("unhandledRejection", …); process.on("uncaughtException", …); }`. **This is TASK-505's detection**, which is already proven on `bun src/index.ts`, `bun --watch` and the compiled binary.
- The TASK-462 comment block is kept whole, and a short TASK-506 note sits above the exports.

## 🔑 Production pinned BY VALUE with a real process (`src/lib/crash-policy-req108.test.ts`)
- **A real `bun src/index.ts` boot**, with a probe preloaded (`src/test-support/crash-probe.preload.ts`, used by nothing else) that raises **an unhandled rejection at 1.5 s and an uncaught throw at 3 s**.
  - The test requires, in order: **"[process] unhandledRejection — logged, still serving: … probe-rejection"**, then **"[process] uncaughtException — state unknown, exiting(1)… probe-uncaught"**, and **exit code 1**.
  - ⇒ It proves the policy **is installed on a real boot**, that it **survives** the rejection (the throw line comes after it), and that it **exits 1**, not 0.
  - Without the policy, the process would die at the rejection with neither line. That's the failure you warned about, a server that doesn't exit on an uncaught throw, now caught by value.
  - 🔒 Closed database and fake token, as before, so the boot can reach nothing and send nothing.
- **A test process that imports the app has NONE of the policy's listeners** (`process.listeners(…)` filtered by the handlers' own text).
- **By source:** exactly two `process.on`, both inside the `import.meta.main` block.

## The ONE test affected, and how (named, not weakened)
- **`extender-safe-run-req105.test.ts` §4** (TASK-462's own pins) **read the handlers off `process.listeners(…)`**, which only worked because importing the app installed them: the very thing this task removes.
- **Its two tests now call the exported handlers directly** with **the same assertions, by value**:
  - the rejection handler logs "unhandledRejection … 57P03" and does **not** exit;
  - the throw handler **exits exactly `[1]`**.
- The real-boot installation it used to imply is now pinned directly, by the new real-process test.
- **Nothing else relies on the policy:** only these two files mention `process.listeners`, `uncaughtException` or `unhandledRejection`, or spy on `process.exit`. No test wants an uncaught exception to be swallowed.

## Break-and-watch: 2 mutations, **2 bite**
The runner reads the **final** summary (TASK-505's fix), with a closed DB and a blank token. `finally` + sha-256 restore, byte-identical. **CHECKSUM `1c16c88e…` identical before and after.** `BASELINE=3`.
- **A — the policy INSTALLED UNDER TEST again** (guard removed): **bites, 2 fail** ("no listeners" and the source pin).
- **B — the policy NOT INSTALLED IN PRODUCTION** (guard inverted): **bites, all 3 fail**. The real boot no longer logs or survives, the test process has the listeners, and the source pin fails.

## Numbers
- **Normally: 3285 pass / 0 fail** (+3), and the full run's output contains **no `[process]` and no `[outbox]` line**.
- **Database unreachable: 3269 / 16 fail**, the same 16 as before. None were caused by this policy.
- tsc **0** · **59 = 59**.

⛔ Only you mark this DONE. Back to TASK-504's nine next.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26)
Verified by me: both `import.meta.main` guards in `src/index.ts` (`:40` the worker, `:67` the crash policy) · tsc 0 · 59 = 59 · **3285 pass / 0 fail**, and **zero `[process]` and `[outbox]` lines in the whole run** — I counted, and it is nought.

## 🔑 The answer to "has it ever fired" is the best part of this report, because it is a NO
**46 captured runs searched for the handler's own line and for any run ending without its `Ran N tests` summary — zero occurrences, no truncated run** — and then: *"I can't speak for runs I didn't capture (yours included)"*, and **"it is NOT the cause of this week's flake."**
📌 **I asked for this precisely because the temptation runs the other way.** A fix is easier to justify if it caused something, and there was a ready-made story sitting right there — a week of flakiness, and a mechanism that can kill a run. **He had every incentive to connect them and he refused**, bounded his evidence to what he actually held, and let the fix stand on what it is: **a latent way for one bad test to end a whole run without naming which test did it.** That is worth more to me than the fix.

## ✅ The production proof is the right shape again
A **real `bun src/index.ts` boot** with a probe that raises an unhandled rejection at 1.5 s and an uncaught throw at 3 s, asserting **both log lines in order and exit code 1** — so it proves the policy is installed, **survives** the rejection, and **exits 1 rather than 0**. 🔑 **Without the policy the process would die at the rejection with neither line**, which is exactly the failure I warned about, now caught by value rather than by reading a diff. And the boot ran with a closed database and a fake token, so it could reach nothing.
✅ **The handlers' bodies are byte-identical to TASK-462's** — installation moved, behaviour untouched, which is what "nothing about what it does" meant.

## ✅ The one affected test, found and handled correctly
`extender-safe-run-req105` §4 **read the handlers off `process.listeners(…)`** — which only worked because importing the app installed them, **the very thing this task removes.** It now calls the exported handlers directly **with the same assertions by value**, and the installation it used to imply is pinned by the new real-boot test.
📌 **That is a pin that was quietly depending on a defect to pass.** It would have gone red with no obvious cause, and "the test that broke when I fixed the bug" is where a good change usually gets reverted. **He found it before it bit, and moved it without weakening it.**
✅ **And he swept for anything else touching the policy** (`process.listeners`, the two event names, spies on `process.exit`) — two files, both accounted for, **no test anywhere wants an uncaught exception swallowed.**
