# TASK-563 — name the DOM tests that assert only the screen — FE, XS

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-29) · **Size XS. 🔑 A SURVEY, not a fix.**

## §0 Why now, and why standalone
**This was going to ride on your next FE task. Both of your FE items are HELD on owner rulings** (item 8's Close, item 2's recording act), **so it becomes its own small job rather than waiting.**
🔑 **The reason it matters: in TASK-559 a mutation emptied the handler and the typing test STILL PASSED.** ⇒ **`user.type` does not drive Mantine's `NumberInput` under happy-dom: the box showed the characters and nothing was stored.**
📌 **Any other DOM test that types into an input and asserts only what is on screen may be green for that same wrong reason.**

## §1 The deliverable — a LIST
- **Every DOM test that types into an input and asserts only what is rendered**, with **the file, the test name, and the control type.**
- 🔑 **For each, say what it would take to make it assert an OUTCOME** — the request, the state, the save. **One line each.**
- ⚠️ **Say which of them you are CONFIDENT are false-greens and which you are not**, and 🚫 **do not guess the difference — if the only way to know is to break the code and watch, say so and size that separately.**
- 🚫 **Fix NOTHING.** ⚠️ **Not even the obvious one.** 🔑 **I want the size before anyone spends it**, and *a survey that fixes as it goes stops being a survey and becomes an untracked change.*

## §2 Shape of the answer
**A short table in the report and in `inbox/SA.md`: file · test · control · what it asserts today · what it should assert · confident or not.**
✅ **If the answer is "none besides the one already fixed", that is a fine answer** — **say how you derived it**, not that you looked.

## §3 Not in scope
🚫 Any fix · 🚫 new tests · 🚫 Palm's items 4, 9, 11 · 🚫 the held FE work.

## Definition of Done
- [ ] The list, with the six columns · **derivation stated, not "I looked"** · confident/not-confident separated, 🚫 **no guessing** · 🚫 **nothing fixed** · suite **count unchanged and said so** · front repo re-read and said · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Fern (2026-09-29): the survey · **759 / 0, unchanged — nothing was fixed** · 🔑 **the answer is "one, and it is already fixed" — plus the RULE for which controls can lie**

## §0 ✅ The front repo, re-read — and said
`git log`: newest commits are the owner's (`dev`) carrying my work; **newest outside-chain commit still `c8e9639` (`neeeeroooo`, 09-22)**. Working tree: only my own files from TASK-555/557/559/564. **Suite 759/0 across 82 files before and after this task — I changed nothing.** 🚫 Palm's items 4/9/11 and the held FE work: untouched.

## §1 The derivation — stated, not "I looked"
Three steps, each mechanical:
1. **Every DOM test file**, by glob `src/**/*.dom.test.tsx` ⇒ **6 files.**
2. **Every typing site in `src`**, by pattern `\.type\(|fireEvent\.change|user\.clear\(` over the whole tree ⇒ **4 hits in 3 files** (two of them the same already-fixed camp test).
3. For each hit, **read what the test asserts after it** — and, where the assertion is on screen only, **decide from the CONTROL whether screen can diverge from state** (§3's rule).
⇒ **the population is 3 typing sites in 3 files**, and there is nothing else in the repo that types into an input.

## §2 The list, with the six columns
| file | test | control | asserts today | should assert | confident? |
|---|---|---|---|---|---|
| `Camp/open-week-dialog.dom.test.tsx` | *the rate box … TAKES a value* | Mantine **`NumberInput`** (masked) | ✅ **already the outcome** — the per-day PATCH carries `rateMinor: 65000` | — (fixed in TASK-559) | **CONFIRMED, by mutation:** emptying `onChange` passed before, fails now |
| `common/undo-control.dom.test.tsx` | *a LEAVE row: … the reason typed by hand reaches the request* | plain `Textarea` | ✅ **the REQUEST**: `body: { reason: "keyed by mistake" }` | — nothing to change | **confident** (the typed string is in the asserted body) |
| `Checkin/shopfront-checkin.dom.test.tsx` | the shared `toList` helper (used by all 3 tests) | plain `TextInput` (phone) | ⚠️ **an outcome, but not the VALUE**: it asserts the list arrives, which only happens if the phone reached state (`canLookup` is `trim().length > 0`, the button is `disabled={!canLookup(phone)}`) | **one line**: assert the lookup body is `{ phone: "0812345678" }` | **confident it is NOT a false-green; confident the VALUE is unasserted** |

🔑 **So: no second false-green.** The one that existed is the one TASK-559 fixed, and I can say that with a mutation behind it rather than a reading.
⚠️ **One real gap, and it is not a false-green:** the shopfront test would still pass if the phone handler stored a *mangled* value (a wrong phone that is still non-empty). **Size: one assertion, in one line, no new test.** 🚫 **Not done here.**

## §3 🔑 The rule worth more than the list — which controls CAN lie
A screen-only assertion is a false-green **exactly when the control keeps its own display state**:
- 🔴 **Can lie:** Mantine's **masked** inputs — `NumberInput` (react-number-format) and, by the same construction, `PinInput` and any `Autocomplete`/`TagsInput` that renders its own text. They show the characters whether or not the parent stored them. **This is what TASK-559 hit.**
- ✅ **Cannot lie:** a **controlled native** input — `checked` on a `Checkbox`/`Radio` and `value` on a plain `TextInput`/`Textarea` come straight from the prop, so a dead handler leaves the DOM unchanged and the screen assertion fails.
📌 **That is why the checkbox-only assertions in `bulk-confirm.dom.test.tsx` (`pending.checked && extended.checked`, the select-all toggle, the indeterminate state) are NOT on this list**: Mantine's `Checkbox` is controlled by `checked={selected.includes(id)}`, so those assertions *are* state assertions wearing a DOM coat. **I checked that by construction, not by trying it.**
⚠️ **Where I would not trust the rule without watching it break:** a Mantine `Select`/`MultiSelect`/`DatePickerInput`. Today **no DOM test asserts one of those on screen only** (`series-scope.dom.test.tsx` and the camp test both go on to assert the request), so it is not a live risk — **but if one is ever written, it belongs in the "break it and watch" column, not in a reading.** 🚫 I did not guess it.

## §4 What it would cost to close the remaining gap
| item | work | size |
|---|---|---|
| assert the phone in the shopfront lookup body | one `expect` on the recorded POST body | **XS — one line** |
| a standing guard (a rule test that no `.dom.test.tsx` may type into a MASKED input and assert only `.value`) | a source sweep, the same shape as `event-in-updater.test.ts` | **XS–S**, and 🔑 **it is the version that survives me** — say the word and I will cut it as its own task |

## §5 🚫 Nothing was fixed
**No source file, no test file, and no copy changed.** **759 pass / 0 fail across 82 files — the same numbers as TASK-564's report**, which is the check that this stayed a survey. 📌 *A survey that fixes as it goes stops being a survey and becomes an untracked change.*

---

# ✅ DONE — REVIEWED by @Sober (2026-09-29)
**759/0 across 82 files — the SAME numbers as TASK-564's report.** ✅ **That identity is the proof it stayed a survey**, and using it as the check is exactly right.

## ✅ A derivation, not a look
**Three mechanical steps: glob `*.dom.test.tsx` ⇒ 6 files · pattern over the WHOLE TREE for `.type(` / `fireEvent.change` / `user.clear(` ⇒ 4 hits in 3 files · then read each assertion.**
🔑 **The second step is the one that makes it a derivation: it searched the whole tree, not the DOM tests** — *so "nothing else in the repo types into an input" is a finding, not an assumption.*
✅ **Result: no second false-green.** **The one that existed is the one TASK-559 fixed.** ⚠️ **One real gap: ③ `shopfront-checkin`'s `toList` asserts an outcome but NOT THE VALUE** — **XS, correctly not done.**

## 🔑 The rule she extracted outlives the list, and that is the deliverable
**"A screen-only assertion is a false-green EXACTLY when the control keeps its own display state."**
🔴 **Masked inputs can lie** (`NumberInput`, and by construction `PinInput` / `Autocomplete` / `TagsInput`); ✅ **a controlled native `Checkbox` / `Radio` / `TextInput` / `Textarea` cannot.**
📌 **And the corollary is the sharp part: `bulk-confirm`'s `checked` assertions are NOT on the list — they are state assertions wearing a DOM coat, settled BY CONSTRUCTION rather than by trying it.** 🔑 **Knowing which greens need no defence is worth as much as knowing which ones do.**
✅ **She refused to guess about `Select` / `MultiSelect` / `DatePickerInput`: they belong in the break-it-and-watch column, no test does that today, and she named it so nobody rediscovers it.** ⚠️ *Named, not fixed, not inflated into a risk.*

## ⚖️ Her two offers — **both taken, as one task behind TASK-566**
1. **The phone assertion (XS).**
2. ⭐ **The standing sweep: no `.dom.test.tsx` may type into a masked input and assert only `.value`, the same shape as `event-in-updater.test.ts` (XS–S).**
🔑 **"The sweep is the version that survives me" is the argument, and it is the same one I accepted in TASK-554: prose has failed at this once already.** ⇒ **A rule we have written down twice and enforced once is a rule half-kept.** ⇒ **TASK-567.**
