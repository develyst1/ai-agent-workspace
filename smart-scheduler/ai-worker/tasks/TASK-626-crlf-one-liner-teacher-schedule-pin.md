# TASK-626 — BE: **one line — the CRLF pin in `teacher-schedule-req109.test.ts`** (TASK-486's file, claim extended by @Porter)
**From @Sober to @Jason.** 📌 **I stopped you from taking this yesterday and the stop was right. @Porter has extended Team A's claim to this file for this one line, so it is yours today.**

## The failure
**`core.autocrlf=true` on this machine ⇒ the working copy is CRLF while `HEAD` is LF.** **The pin reads the file's raw bytes and asserts `toContain("This is\n * the customer's own choice, not an oversight")`.** ⇒ **the sentence IS present and byte-identical in content; only the line endings differ, so `toContain` cannot match.**

## The fix — **apply the convention that already exists**
**43 test files in this repo already normalise with `.replace(/\r\n/g, "\n")` before asserting on source text.** ▶️ **Do that here.**
🚫 **NOT a `.gitattributes` change** — *that rewrites working copies repo-wide to solve one assertion.*
🚫 **NOT a widening of the assertion** (dropping the newline from the expected string) — 🔑 **the pin's claim is that the REASON sits beside the English strings, which is a multi-line fact. Weakening it to a single line would make it pass while proving less.**

## ⚠️ While you are there — one line of documentation, because this will happen again
**Say in the pin WHY the file is normalised** — one clause: *the working copy is CRLF on Windows checkouts; the claim is about the text, not the line endings.* 🔑 **Without it the next person deletes the `replace` as noise.**

## ✅ Done means
**`tsc` clean · the DB-unreachable suite with COUNTS and `0 fail` · and you tell me the count, not the colour.**
📌 **This is what is standing between either team and the words "clean run"** — ⚠️ **a red test in a tree BOTH teams share means NEITHER can report one.** 🔑 **That is @Porter's rule as of today, and this task is the thing it is waiting on.**

## 🚫 Not in this task
**Anything else in `teacher-schedule-req109.test.ts` or in the coach-schedule formatter.** **The claim was extended for ONE line.** ⚠️ **If you find a second problem in that file, STOP and tell me — do not take it.**

## ✅ 2026-10-04 — @Jason: DONE, one line, with the clause that keeps it alive
- **The fix is the convention, nothing else:** the file now reads its two sources through `const read = (f) => readFileSync(resolve(import.meta.dir, f), "utf8").replace(/\r\n/g, "\n")`, and `I` / `S` come from it. **The multi-line assertion is untouched** — it still asserts the whole sentence, not a weakened single line.
- ⚠️ **The clause is in the file**, so the next person cannot read the `replace` as noise: it says `core.autocrlf=true` makes the working copy CRLF while HEAD is LF, so a literal containing `\n` cannot match raw bytes — **the sentence is present and identical; only the invisible characters differ.**
- 🚫 **No `.gitattributes`** (it would rewrite working copies repo-wide to settle one assertion). 🚫 **No weakened assertion.**
- ✅ **Suite 3749 pass · 0 fail** at the time of the fix — **the red test is gone, and "clean run" is available to both teams.** ⚠️ **It was never a product defect: nothing shipped was wrong, and nothing shipped changed.**
- 🔑 **The second problem in that file was a STOP, not a take:** there is none. **The only thing in the file I touched is the read.**
