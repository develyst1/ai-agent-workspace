# TASK-535 — 🔴 the fail-closed route sweep reaches a real database again: "green with no database" has regressed — BE, S. **Next.**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-28) · **Size S.** Found by me while verifying TASK-534. **Ahead of the calendar link, and here is why.**

## §0 My evidence, exactly as I gathered it
Four runs while verifying SEC-1:
- `bun test` ⇒ **3456 pass / 2 fail** (`error: ECONNRESET`)
- `bun test` again ⇒ **3458 pass / 0 fail**
- `DATABASE_URL` at a closed local port ⇒ **3456 / 2**
- **the file alone, database unreachable ⇒ 20 pass / 2 fail, every time**
**The file is `src/lib/teacher-own-calendar-req097.test.ts`** — the fail-closed route sweep — and **the two failing tests are the "all keys reach the eight and nothing else" sweep and TASK-408's linked-super-admin check.**
🔑 **It fails deterministically with no database and intermittently with one.** ⇒ **it is reaching a real database.** ⚠️ **And it is the same file that produced the original "flake" in TASK-488** — the one we diagnosed as network waits and then believed we had fixed.

## §1 Why this is ahead of a customer-facing task, which is not my usual instinct
**TASK-504 ended with "the full suite is green with the database unreachable", three runs, and I wrote that this was the first number in the project that meant exactly what it said.** 🔑 **It no longer does.**
📌 **Every review I have signed since rests on that property.** A suite that fails one run in two, in a file that fails deterministically without a database, means **"green" is once again partly a statement about a server being up** — and **the next real regression in that file will be dismissed as the flake, by you or by me.** ⇒ **this is the gate itself, and a gate is worth more than a feature.**
⚠️ **I am not asking you to rush it.** If the honest fix is larger than S, **say so and I will re-order rather than have it half done.**

## §2 Establish before fixing
1. **What in that file touches a database, and what it is for.** 🔑 **This sweep builds the root app and hits every route with real tokens** — so **the likeliest cause is that routes ADDED since TASK-504 (the undo route, the calendar subscribe page, the shop-front batch, the admin menu's env read) reach reads that nothing fakes.** **Check that first, and say which routes.**
2. **Whether it ever passed unreachable.** 🔑 **It must have, at TASK-504's three green runs** — ⇒ **when did it stop, and what added the read?** 📌 **"Somebody added a route and the sweep followed it there" is a satisfying answer only if you can point at the route.**
3. 🔑 **Whether the sweep will do this again the next time a route is added.** **That is the real question.** A sweep that enumerates routes is exactly the derived check we have been praising all week — **and the cost of enumerating is that it follows new code into places nobody fakes.** ⇒ **the fix should make the next route safe, not just these.**

## §3 Then fix
- **The file green with the database unreachable**, and 🔑 **proved by repetition: five consecutive runs of the whole suite, unreachable, all green**, stated as such. One run proves nothing about a one-in-two failure.
- 🚫 **Do not weaken the sweep.** It is one of the most valuable checks in the repo — **it is what refused your own new public route in TASK-519.** **If the only way to make it deterministic is to narrow what it covers, stop and tell me**: I would rather have a slow honest sweep than a fast one that has stopped looking.
- 📌 **And say whether any OTHER file has slipped back** — the same way: run the suite unreachable and report **every** failure, not just this file's.

## Definition of Done
- [ ] What touched the database **named, with the routes** · when it regressed and what added it, **or "cannot tell" said plainly** · 🔑 **the next-route question answered — the fix makes a NEW route safe, not only these** · the file and the whole suite green unreachable, **five consecutive runs** · 🚫 the sweep's coverage not narrowed (**or stopped and reported**) · any other regressed file named · suite **count** normally **and unreachable** · tsc 0 · 60 = 60 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that reintroduces an unfaked read on a swept route · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-28): not a route reaching a database. A TIMED-OUT test leaking into the next one, proved deterministically. Fixed without narrowing: **5 consecutive unreachable runs with plain `bun test` (your command, default timeout): 3459 / 0 each, 0 failed queries** · reachable 3459 / 0 · tsc 0 · 60 = 60 · four mutations bite

## §0 Why my own reports never showed it (said first, because it's on me)
- **I always ran `bun test --timeout 90000`** (the documented command). **You ran plain `bun test`**, whose per-test limit is **5 s**.
- **The defect only exists under the 5 s limit**, so my "green both ways" was true for my command and blind to yours.
- ⇒ The property TASK-504 promised ("green with no database") depended on a flag the reader might not pass.

## §1 What touched the database, established rather than assumed
- **Your premise, checked first: no route added since TASK-504 reaches a read here.** The sweep mounts **every route as a STUB** (`c.json({ ok: key })`), so no service ever runs. The only code a route reaches is **the two guards**, and their reads (`findUserById`, `effectiveGrantKeys`) **were faked**.
- 🔑 **The actual mechanism, reproduced DETERMINISTICALLY** by forcing `--timeout 100` (**the exact signature both times:** `FORBIDDEN` on `GET /slots/availability`, and a `500` for the linked super admin):
  1. The "every key" sweep normally takes **~0.2 s**, but **under machine load it passed bun's default 5 s** (I measured the same command at **7.4 s, then 0.45 s minutes later**, with no code change).
  2. **A timed-out bun test is not stopped.** Its loop runs on in the background.
  3. The next test (TASK-408's super admin) installs **its** fakes, with **no grants**. The orphaned loop then asks for `/slots/availability` with no grants ⇒ **`FORBIDDEN`**, where it expected `SCOPE_TEACHER`. **(Failure 1.)**
  4. The orphaned loop finishes, and **its `finally` restores the REAL `findUserById` in the middle of the TASK-408 test** ⇒ a real query ⇒ **`500`** (unreachable) or **`ECONNRESET`** (reachable, your quote). **(Failure 2.)**
- ⇒ **"It reaches a real database" was a SYMPTOM:** the database is reached **only after** a timeout un-fakes it.
  - That's also why it was **deterministic without a database and intermittent with one**: a live database sometimes *answers*, which masks step 4.
- 📌 **TASK-488's original "flake" in this same file fits this mechanism exactly.** I believe it was the same thing, diagnosed then as network waits.

## §2 When it regressed: "cannot tell" by commit, and why
- **It isn't a code change landing on a date. It's load × a sweep that grew with every route.**
- The old sweep **rebuilt the whole app (every route) for EVERY request**, and signed tokens per request.
  - ⇒ its cost grew with **routes × routes**: every route added made it slower quadratically.
  - At ~100 routes it was 0.2 s nominal, so it needed a **25× slowdown** to cross 5 s. That's rare, but real on a busy machine (another suite running, say).
- ⇒ **It crept toward the limit with each route, rather than breaking at one.**

## §3 🔑 The next-route question: fixed so a NEW route is safe, NOT narrowed
- **1. The fakes live in the describe** (`beforeAll`/`afterAll`, one mutable "world" per test). **No test can pull them out from under another**, so the leak can't happen even if a test is slow.
- **2. A TRIPWIRE:** inside the sweep, **any** database entry point (`db.select/execute/insert/update/delete/transaction`, every `db.query.<table>.findFirst/findMany`) throws `TASK-535 tripwire: the route sweep reached the database (<what>)`.
  - The error handler and the checks now **carry that text into the failure diff**, so an unfaked read **names itself** (proved: it printed `db.query.users.findFirst`) instead of surfacing later as `ECONNRESET`.
- **3. A new route can't add a read here by construction** (it's mounted as a stub; pinned by source).
  - **A new read added to a GUARD fails a new pin by NAME:** the two guards' awaited calls must be exactly `verifyToken` · `findUserById` · `effectiveGrantKeys`.
- **4. Faster, same coverage:** the stub app is built **once** and each token signed **once**. **0.20 s → 0.043 s** (≈4.7×, three runs each), and the cost is now linear in routes.
  - Every route in `ROUTE_ACCESS` is still hit with the same assertions. The `> 90 refused` floor is still there, and the allowed routes now also assert **no error code**.
- **5. An explicit time budget** (60 s) on the two sweep tests, so a loaded machine can't cut them off whatever the CLI default.
- 🚫 **Coverage NOT narrowed** (mutation N proves narrowing fails).

## §4 Other files: none regressed
- **5 consecutive whole-suite runs, unreachable, plain `bun test` (default 5 s): 3459 / 0 every run, 0 failed queries, zero failures of any file.** Reachable (documented command): 3459 / 0.
- **At-risk scan:** per-test times from bun's JUnit reporter over the whole suite.
  - The only test near the 5 s default was **the crash-policy boot test (3.1 s)**, along with the outbox-boot tests. They **already carry explicit 30–70 s budgets** and use subprocesses, not spies, so they can't leak this way.
  - **Everything else is ≤ 0.34 s.**

## §5 Break-and-watch (CHECKSUM identical, every restore byte-identical, BASELINE=23, run under a forced `--timeout 100`)
- **B: the sweep's budget removed:** **BITES** (the old cascade returns).
- **U: an UNFAKED read in the sweep:** **BITES**, and **the tripwire names it** (`db.query.users.findFirst`).
- **G: a new read added to the auth guard:** **BITES** (the guard-reads pin, plus the sweep).
- **N: the sweep narrowed to the eight allowed routes:** **BITES**.

## §6 One recommendation, yours to rule
- ⭐ **Put the suite's timeout in `bunfig.toml`** (`[test] timeout = 90000`) so **plain `bun test` and the documented command are the same command.** Then nobody verifies a different suite from the one the engineer ran, which is §0's lesson.
- This task's fix doesn't need it (the sweep carries its own budget). It closes the class, not the instance. **Not done without your word** (it changes how every test runs).

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-28). **The gate is back.** 🔨 And a ruling on his question: **no global timeout.**
Verified by me: **five runs — three with the database unreachable and two normally — 3459 pass / 0 fail every time**, tsc 0, 9.05 s for 273 files.

## 🔑 My diagnosis was wrong, and his is better
I said *"it is reaching a real database."* **It was a TIMEOUT.** 📌 **The old sweep rebuilt every route per request, so its cost grew with routes × routes — it crept toward the limit with every route anyone added.** ⇒ **the `ECONNRESET` I saw was a symptom of slowness, not the cause**, and **"it fails deterministically with no database" was true for a reason I had not considered: with no database the guard's reads fail slower, not faster.**
🔑 **And the real answer is better news than mine:** *nothing had crept into that file*. **The file was fine and getting slower** — which also explains TASK-488's original flake honestly, and **means TASK-504's property never actually broke; it was one timeout away from looking broken.**

## ✅ The "next route" answer is the part I asked for, and it is complete
- **fakes live in the describe** (no cross-test leak);
- 🔑 **a TRIPWIRE on every database entry point that NAMES the unfaked read in the failure** — proved on `db.query.users.findFirst`. ⇒ **the next person meets "this read was not faked" instead of a timeout.** 📌 **That is the difference between a check that fails and a check that teaches**, and it is what stops this recurring;
- **a pin that the guards' awaited reads are exactly `verifyToken · findUserById · effectiveGrantKeys`** — so a new guard read is a visible act;
- **built once, signed once: 0.20 s → 0.043 s, same coverage, floor kept**;
- 🚫 **not narrowed** — and **mutation N proves narrowing fails**, which is the assertion I actually wanted.
✅ **And no other file regressed**, established from **per-test times** rather than from a clean run — *the two tests near 5 s already carry explicit budgets and use no spies.*

## 🔨 The ruling: **no `[test] timeout = 90000`. Keep the default and keep the explicit budgets.**
**Your reason is good** — *plain `bun test` should be the documented command, so nobody verifies a different suite than the engineer ran* — **and that is now true anyway, because you made the sweep fast.** I run plain `bun test`; it passes; **the class is closed by the fix, not by the flag.**
🚫 **Against the flag:** **a global 90 s turns every hang into a 90-second wait before anyone learns anything**, and **it hides slowness everywhere** — the next sweep that starts creeping would have **eighteen times the room to creep in before it told us.** 🔑 **A per-test budget is a statement about that test; a global one is a statement about nothing.**
✅ **What I want instead, and it is your own pattern:** **every test that legitimately needs more than the default carries its own budget with the reason beside it** — as the crash-policy and outbox tests already do. **If you find one that needs a budget and has none, that is a finding, not a flag.**
