# TASK-575 — is your mutation runner lying too? — BE, XS ⚠️ **do this FIRST**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-30) · **Size XS.** 🔴 **Stop whatever else you were going to start and answer this.**

## §0 What happened on the FE
**@Fern's mutation runner used `execSync`'s DEFAULT 1 MB `maxBuffer`. Her suite prints ~6.9 MB.** ⇒ **The child was killed mid-run, NO summary line was printed, and her runner read "no failures found" as a PASS.** 🔴 **Ten rows reported green that had never run.**
🔑 **She caught it, fixed it (256 MB), and made the runner trust the COUNTS rather than extracted failure names** — one row had been labelled "slipped" while the counts plainly read `1 fail`.
🔑 **Counts are the truth; names are a convenience.**

## §1 The question, and it is urgent because of the size
🔴 **Your suite is more than four times hers.** ⇒ **If your runner has the same shape, your tables have been at risk for longer.**
1. **Does your runner cap the buffer?** **Say the exact value, or say there is none.**
2. **How large is your suite's output today?** **A number.**
3. **Does it decide from COUNTS or from extracted failure names?** 🔑 **If it reads names, it can mislabel a real failure as anything at all.**
4. 🔑 **If it is or was vulnerable: derive roughly WHEN the output crossed the limit, and therefore WHICH earlier break-and-watch tables are SUSPECT.** 🚫 **Do not re-run them yet. Give me the list.**

## §2 If it is vulnerable
- **Fix it: an explicit generous buffer, and decide from the counts.**
- ✅ **Prove the fix the only way that counts: make a run that WOULD have overflowed, and show it now reports honestly.** 🚫 **"I set a bigger number" is not a proof.**
- ⚠️ **And make an absent summary LOUD** — 🔑 **inconclusive must be impossible to read as green.** *That is the rule from two different causes now; it should not need a third.*

## §3 If it is not vulnerable
✅ **Say how you know — the value, the size, and the decision source.** 🔑 **"Mine is fine" without the three numbers is not an answer**, and it is the kind of answer that ages badly.

## Definition of Done
- [ ] The four questions answered **with numbers** · fixed if vulnerable, **proven by an overflowing run**, absent summary made loud · 🔑 **the list of suspect earlier tables, or a derived statement that there are none** · 🚫 nothing re-run yet · suite **count** unchanged **and said so** · report + `inbox/SA.md` + log.

---

# ✅ ANSWER — @Jason (2026-09-30): **the same default, YES — but my output never came near it, so NO table is suspect from overflow.** Three of my five runner families COULD have faked a BITE had it happened; one is PROVEN to on a passing run. **Fixed and proven on a run that really overflows.** Nothing re-run.

## §1 The four numbers
1. **The buffer: NONE set, in all 103 runner files** (`mut364` … `mut507`), so Node's default **`maxBuffer` = 1 MiB (1,048,576 bytes)**. Same shape as @Fern's.
2. **My output size:**
   - the **full suite, passing = 19,049 bytes**. Bun prints nothing per passing test; **output grows only with FAILURES**;
   - measured: **1,282 bytes per failure** (a sizing run: 41 failures = 52,577 bytes; restored byte-identical);
   - ⇒ **the 1 MiB limit needs ≈ 800 failures in ONE run.**
   - **The worst row in ANY recorded table: 46 failures ≈ 59 KB, about 18× under the limit.** The biggest I could produce on purpose with a real code mutation over the WHOLE suite was 126 failures = **0.21 MiB**.
3. **What the verdict is decided from, by family** (all read the COUNT lines; none decides from failure names):

| family | files | verdict when NO summary was captured |
|---|---|---|
| **A** | mut364–381 (13) | "✅ **? fail**" (printed as caught, **with visible `?`s**) |
| **B** | mut385–449 (37) + mut450–463 (~12) | **BITES** when any `error:` is in the partial output ⚠️ |
| **C** | mut465–503 (33) | **BITES**, because `hung = (signal === "SIGTERM")`, **and an overflow ALSO kills with SIGTERM** 🔴 |
| **D** | mut383/389/396/413/461/504a/505/507 | "PASSED ⚠", a false SURVIVOR (the conservative error) |

   - Also: families A–C read the FIRST `N fail` in the output, not the final summary (fixed in mut505 with `lastOf`). That can misprint a row's COUNTS when failure frames quote such text, but not its verdict: frames only exist when real failures exist.
4. **When did my output cross the limit? It never did.** No recorded run is within an order of magnitude, and **no recorded row carries a `?` count** (searched every TASK, archive and log). A no-summary run would have printed one.
   - ⇒ **No table is suspect from overflow.**
   - **If you want certainty rather than evidence, the ones that COULD have faked a bite are families B and C: TASK-385 … TASK-503.** Re-running them with the new runner is the check. **Your call; I re-ran nothing.**

## §2 🔴 Proven, not argued (a scratchpad fixture that really overflows, never in the repo)
- A test printing ~2 MiB, then **one failing test**. At the **old default**: `ENOBUFS` + `SIGTERM`, **1,114,112 bytes captured, no summary**.
  - **mut505/507 read it as "PASSED ⚠"**: a failing run read as SURVIVED.
  - **mut470–504 read it as BITES**: the right colour, for the wrong reason (no counts at all).
- 🔴 **The same ~2 MiB with EVERY test PASSING**: ENOBUFS + SIGTERM ⇒ **family C reads it as BITES. A FAKE BITE, proven.**
  - That's the dangerous direction, and it's why the size numbers in §1 matter: my runs never reached it.

## §3 The fix: an absent summary can no longer be read as ANY colour
- **`runner-core575.mjs`, ONE shared decision:**
  - a **512 MiB** buffer;
  - a verdict **ONLY from the parsed FINAL counts**: **BITES** · **SURVIVED** · **NO RESULT** (with the reason: OUTPUT OVERFLOW / KILLED (signal) / ERROR);
  - 🚫 **a timeout is no longer a bite either** ("counts are the truth").
- **`mut575.mjs`** = mut507 + that decision (it also prints each run's byte count).
- **Proven on the run that DOES overflow:**
  - **the new runner parsed the full 2,097,951 bytes ⇒ BITES (1 fail / 1 pass)**;
  - **forcing an overflow ON the new decision** (a 64 KiB buffer) ⇒ **"NO RESULT [OUTPUT OVERFLOW]"**, never green, never red.
  - Syntax-checked. **Not used on any table yet** (you said don't re-run).

## §4 ⚠️ One thing the amnesia rule says I must name
**Every runner that produced every break-and-watch table lives in MY session scratchpad, not the repo.** It is machine-local and disposable. A fresh session could not reproduce one table, nor inspect the runner that made it. Candidates:
- **move `runner-core575.mjs` + `mut575.mjs` into the backend repo** (e.g. `scripts/mutation/`, with the proof fixture as a test);
- or record the rule in SYSTEM-FACTS.
- (Files only; committing is the human's.) **Your call.**

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30) · ⚖️ **no blanket re-run** · ▶️ **TASK-576**

## ✅ Answered with numbers, which is what I asked for
**Same default (no `maxBuffer` in all 103 runners ⇒ 1 MiB) — BUT the output never came near it:**
**the full suite PASSING prints 19,049 B** (Bun prints only failures) · **1,282 B per failure, measured** ⇒ **the limit needs ≈ 800 failures in ONE run** · **the worst recorded row is 46 failures ≈ 59 KB** · **no recorded row has a `?` count.**
🔑 **A 17× margin, derived from a measured rate rather than an impression.** ⇒ **"Mine is fine" with the three numbers, which is the only version of that sentence worth anything.**

## 🔴 And he proved the failure mode is REAL, then showed his runs never reached it
**On a real >1 MiB fixture, family C reads a run where EVERY TEST PASSES as BITES.**
🔑 **Note which way his failure points: @Fern's overflow faked a GREEN; his would fake a BITE.** ⇒ **Both are false REASSURANCE — a fake bite says "the pin caught it" when nothing ran.** 📌 **Same danger, opposite colour. Worth knowing, because the instinct is to think a red result is the safe kind.**

## ⚖️ Ruling: **no blanket re-run of families B + C**
🔑 **The margin is 17×, it is measured, and the fake bite needs ~800 failures in a single run — which would itself be an obviously broken mutation, not a quiet one.** ⇒ **Evidence over ceremony.**
✅ **And the thing that makes this safe to decide is his last number: no recorded row has a `?` count** — *the gap would have been a row whose count we never had, and there is none.*
⚠️ **If a historical row ever turns up with an implausible failure count, that row alone gets re-run.** 🚫 **Not forty tasks on principle.**

## ✅ The fix
**512 MiB · the verdict ONLY from parsed counts ⇒ BITES / SURVIVED / NO RESULT [reason] · a timeout is no longer a bite.** ✅ **Proven by parsing a 2,097,951-byte run correctly, and a forced overflow answering NO RESULT — never a colour.**
🔑 **"NO RESULT, never a colour" is the rule both engineers now have, arrived at from two different causes.** ⇒ **It should not need a third.**

## ⚠️ His last point is the one I care most about — **and it is our own standing rule**
**"All runners live in my session scratchpad, not the repo."**
🔴 **The repo is the only memory.** ⇒ **A tool that proves our tests are honest, living somewhere a session reset destroys, is a tool we will silently stop having.** ⇒ **TASK-576: move them in.** 📌 *He raised it unprompted, which is the amnesia rule working as intended.*
