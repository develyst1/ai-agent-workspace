# TASK-637 — FE: **port the mutation runner's test-list fix into the front repo**
**From @Sober to @Fern.** 📌 **Cut because of what I found VERIFYING `TASK-611`, not because of anything you did wrong.**
🔑 **You followed the front repo's own convention exactly. The convention is what is short.**

---

## 1. The problem, in one paragraph
**The front runner takes `--tests "<files>"` on the command line, and a mutation set is a BARE ARRAY that cannot carry one.** ⇒ 🔴 **A set's test list lives only in whoever ran it.**
**Two consequences, both already real here:**
- 🔴 **Your `A8`/`A9` survived their first run because the denied-key file was missing from the list.** **Second time this fortnight.** 🔑 **The list is part of the run, and nothing in the repo says what it was.**
- 🔴 **When I verified your 14/14 I had to GUESS your list.** **I guessed right and the set bit 14/14 — but until I did, your number was unverifiable by anybody but you.** ⇒ **That is the exact failure we closed in the back repo two days ago, still open here.**

## 2. ✅ The fix already exists — **port it, do not re-invent it**
**@Jason changed the BACK repo's runner today.** **Read `smart-scheduler-back/scripts/mutation/run.ts` and its README, and bring the same behaviour across:**
- **A set may be `{ tests, mutations }` as well as the old bare array.** ✅ **Old sets keep working.**
- **`--tests` still WINS when given** — the command line can still override.
- 🔴 **A set with NO list anywhere is REFUSED, not guessed at.** 🔑 **A guessed test set produces a verdict about something nobody chose.**
- **The run prints the list it used** (yours already does — keep it).

⚠️ **What must NOT change: THE VERDICT RULE.** 🔑 **Widen the INPUT; leave the JUDGEMENT alone.** **Check the rule text is byte-for-byte the same before and after** — *that section is written to be identical across repos, and this is the moment it would drift.*
📌 **Keep the front repo's own file convention (`scripts/mutation/task-NNN.json`).** 🚫 **Do not move the sets to match the back repo's layout** — **the property that matters is that the set is in the repo and carries its own test list, not where it sits.**

## 3. ▶️ Then backfill
**Put your test list inside `scripts/mutation/task-611.json`.** 📌 **And `task-634`'s when you write it.**
🚫 **Do not re-run the older sets to backfill their lists** — ⚠️ **if you cannot recover a set's list honestly, leave it without one and let the new refusal say so.** 🔑 **A list invented after the fact is worse than an absent one: it reads as evidence.**

## 4. ✅ Done means
**`tsc` · `bun test` · `build` — all three clean, with COUNTS.**
**And prove the three behaviours by using them:** **a set WITH a list runs with no `--tests` · `--tests` overrides it · a set with NO list anywhere is REFUSED with a message that says why.**
📌 **No mutation set is required for this task** — 🔑 *the tool that measures is not measured by itself.* ⚠️ **But re-run `task-611.json` from its own list afterwards and tell me the counts; that is the proof it works.**

## 5. 🚫 Not in this task
**Changing any existing mutation set's CONTENT** · **the verdict rule** · **the back repo, which you do not touch** · **`TASK-624`.**
