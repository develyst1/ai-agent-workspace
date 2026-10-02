# TASK-596 — an assertion that cannot report — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-10-01) · **Size S.** Your class finding in TASK-595, taken.

## §0 Why now rather than later
🔑 ***"An assertion whose failure message cannot be read is an assertion that cannot report."***
**`expect(node).toBeNull()` makes the runner print the RECEIVED value, and a happy-dom element serializes its whole document graph (~307 MB)** ⇒ **the run is killed and the verdict is NO RESULT, not a red.**
🔴 **And it is invisible until it matters: a PASSING run prints nothing.** ⇒ **The defect appears exactly on the day you need the test to speak.**
📌 **Six no-results in this stretch. This one we can remove before it costs us anything.**

## §1 The work
- **Every `.dom.test.tsx` "not there" assertion reads a COUNT (`1` vs `0`), or something else whose failure message is small.** ⚠️ **Derive the set — do not hunt it.** 🔑 **`toBeNull`, `toBeFalsy`, `not.toBeInTheDocument`, `toBe(null)` — and anything else that can be handed a DOM NODE.** **Name what you looked for.**
- ⚠️ **Say which ones you did NOT change and why** — 🔑 **if an assertion receives a small value, it is fine, and changing it is churn.** **This is about what the failure PRINTS, not about the operator.**
- ⭐ **And the enforcement, or it comes back:** **a check that fails if a DOM node can reach one of those matchers in a `.dom.test.tsx`.** ⚠️ **If that cannot be decided honestly — a variable's type is not always knowable — say so and say what you can enforce instead.** 🚫 **Nothing that fires on correct code.**
- ✅ **Prove the fix the only way that counts: make one of them FAIL and show the message is readable.** 🚫 **"It is a count now" is not a proof.**

## §2 Not in scope
🚫 Non-DOM tests · 🚫 the two-act audit (TASK-597) · 🚫 Palm's items.

## Definition of Done
- [ ] The set **derived, with what you searched for named** · every one converted, **and the ones left alone justified** · ⭐ **a check that stops a DOM node reaching those matchers, or a stated honest limit** · ✅ **one made to FAIL, with the message shown readable** · suite **count** · tsc · build ok · Break-and-watch, CHECKSUM · report + `inbox/SA.md` + log.

---

# 📋 REPORT — @Fern → @Sober (2026-10-01)

**Repo:** `smart-scheduler-front` (working tree). **§0: I re-read the front repo before starting** — all twelve `.dom.test.tsx` files and the `scripts/mutation` runner. 🚫 **Palm's items 4, 9, 11 untouched.**

**Suite 921 pass / 0 fail across 96 files · `tsc --noEmit` 0 · `bun run build` ok · Break-and-watch 8/8 BITES, CHECKSUM identical.**

## §1 The set — DERIVED, and here is exactly what I searched for
I parsed every `.dom.test.tsx` and reported each `expect(X).matcher(…)` where **both halves are true**:
- **The matcher prints the RECEIVED value on failure** — `toBeNull` · `toBeFalsy` · `toBeUndefined` · `toBeDefined` · `toBe` · `toEqual` · `toStrictEqual` · `toHaveLength` · `toContain` · `toContainEqual` · `toMatchObject` · `toBeInTheDocument`.
- **`X` produces a DOM node** — `querySelector(` · `querySelectorAll(` · `queryBy*` · `queryAllBy*` · `getBy*` · `getAllBy*` · `findBy*` · `findAllBy*` · `.closest(` · `.parentElement` · `.firstElementChild` · `.lastElementChild` · `activeElement` — **unless** the expression also reads something small off it (`.length`, `.textContent`, `.getAttribute(`, `.value`, `.checked`, `.disabled`, `.id`, `.className`, `.tagName`, `.innerHTML`, `.outerHTML`, `.map(`, `.filter(`, `.some(`, `.every(`, `.includes(`) or is negated with `!`, which makes it a boolean.
- **One indirection followed:** a `const` in the same file whose initializer produces a node, including a helper arrow (`const saveBtn = () => document.querySelector(…)`), because that is how these tests are written.

**Result: 38 sites in 8 of the 12 files** — and 🔑 **every one of them was `toBeNull`.** Not one `toBeFalsy`, `toHaveLength` or `not.toBeInTheDocument` exists in the DOM tests, so the class is narrower than the shape I searched for. ✅ **After the conversion the same derivation answers `TOTAL 0 in 12 files`.**

**What I changed them to:**
- `document.querySelector("[x]")` ⇒ **the count of the same selector** (`querySelectorAll("[x]").length).toBe(0)`).
- `screen.queryByText(…)` / `queryByLabelText(…)` ⇒ **`queryAllBy…(…).length`**.
- a helper that returns ONE node (`saveBtn()`) ⇒ **`expect(!!saveBtn()).toBe(false)`**, because there is no list to count. 📌 *A count where a list exists, a boolean where only one thing can be asked.* **The repo already used this idiom** — `line-admins.dom.test.tsx`'s `dialogOpen()` is built the same way.

## §1b ⚠️ What I did NOT change, and why
🔑 **This is about what the failure PRINTS, not about the operator**, so three large groups were left exactly as they are:
- **`toBeTruthy` — 88 uses, all correct.** When it fails on a query the received value is `null`, which prints as `null`. 🚫 Converting them would be churn and would make the tests read worse.
- **`toBeUndefined` — 9 uses, all on SMALL values:** request-body fields (`body.address`, `body.rateMinor`, `second.phone`…) and `batchTo()`, which returns a recorded POST, not a node. **Checked each one**, not inferred from the name.
- **`toEqual` / `toBe` on scalars, strings, arrays of ids and `Object.keys(...).sort()`** — the received value is already small.
- 📌 And two apparent hits were **prose**: the note I wrote in TASK-595, and `line-admins.dom.test.tsx`'s own comment (see §3).

## §2 ⭐ The enforcement — `src/lib/ui/dom-assert-readable.test.ts`
**It sweeps every `.dom.test.tsx` and fails when a node-producing expression reaches a matcher that prints what it received**, naming `file:line`. The two lists above ARE the check; the derivation and the enforcement are the same code, which is why the set cannot drift away from what is enforced.
✅ **It asserts the file count first** (`> 8`): 🔑 *a sweep over an empty list passes forever.*
✅ **And it has FIXTURES, because a sweep that currently finds nothing proves nothing about what it would find.** Five true positives, each paired with the correct shape beside it — including the deliberate **non**-catch, `toBeTruthy` on a node.

⚠️ **The honest limit, stated in the file:** a node reached through a **function parameter**, an **imported** helper, or a value whose type only the type-checker knows is **not tracked**. 🚫 **I did not try to infer types** — that needs the program rather than the file, and *a check that is sometimes right about types fires on correct code.* **What it enforces is the shape, across the files where this class has actually bitten.**

## §3 📌 The part I would rather not report: the knowledge already existed
`src/components/partials/LinkRequests/line-admins.dom.test.tsx:77` carries a note **in my own hand**: *asserted as booleans, never as elements — a failed `toBeNull()` on a happy-dom node prints the entire React fiber tree, which turned one red assertion in this file into an eight-minute run before I noticed.*
⇒ 🔑 **I had met this, understood it, written it down in the file where it bit me, and let 38 instances of it stand everywhere else.** 📌 **Fourth time this fortnight that a rule had to become a check because prose did not hold it** — and this one is worse than the others, because the prose was first-hand.

## §4 ✅ The proof — one made to FAIL, and the message read
🚫 *"It is a count now"* is not a proof, so I re-applied **TASK-595's W1 by hand** (the exact mutation that produced the NO RESULT) and ran the same test file:

| | before (the node) | after (the count) |
|---|---|---|
| output | **~307 MB** | **1,077 bytes** (the whole run) |
| outcome | **KILLED at the time limit ⇒ NO RESULT** | **exit 1 in 2.4 s ⇒ a red** |
| message | the document graph: parents, listeners, prototypes | `error: expect(received).toBe(expected)` · `Expected: 0` · `Received: 1` · `report-leave-advance.dom.test.tsx:127:77` |

⇒ **the same defect now names itself in three lines**, and the mutation that could not report a verdict reports one.

## §5 Break-and-watch — 8 mutations, 8 BITES, CHECKSUM identical

| # | mutation | verdict |
|---|---|---|
| X1 | 🔴 a converted assertion hands the NODE back to the matcher, in a real DOM test | **BITES** 9/1 |
| X2 | 🔴 the check stops recognising `toBeNull` as a matcher that prints received | **BITES** 8/2 |
| X3 | 🔴 the check stops recognising a node-producing expression at all | **BITES** 8/2 |
| X4 | the sweep stops finding `.dom.test.tsx` files (an empty list passes forever) | **BITES** 9/1 |
| X5 | ⚠️ it starts CRYING WOLF — `toBeTruthy` joins the list | **BITES** 8/2 |
| X6 | ⚠️ crying wolf the other way — `.length` stops counting as a small read | **BITES** 8/2 |
| X7 | 🔴 the `!x` escape is removed — a boolean treated as the node it came from | **BITES** 9/1 |
| X8 | the one indirection is dropped — a helper returning a node stops being tracked | **BITES** 9/1 |

⚠️ **X7 SURVIVED the first run, and the reason is worth more than the row.** Deleting the `!` escape changed nothing, because **every `!!` in the repo goes through a HELPER** (`!!saveBtn()`), and a helper call carries no node-producing text of its own ⇒ the escape was never the thing keeping those assertions safe. **The behaviour it protects — an INLINE `!document.querySelector(…)` — had no fixture.** I added it, and X7 bites. 🔑 ***A guard with no fixture is a guard nothing is asking about*** — and X5/X6 exist for the same reason: *a check is as much about what it must NOT flag as what it must.*

## Files
- **New:** `src/lib/ui/dom-assert-readable.test.ts` (the derivation and the enforcement, with its fixtures and its stated limit).
- **Converted (38 sites, 8 files):** `undo-control` · `change-start-date` · `extend-voucher-expiry` · `camp-week-lifecycle` · `open-week-dialog` · `cover-needs-key` · `series-scope` · `register-required`.
- **Mutations:** `scripts/mutation/task-596.json` (X1–X8).

---

# ✅ DONE — REVIEWED by @Sober (2026-10-01)
Verified by me: **921 pass / 0 fail** across 96 files · tsc 0 · build ok.

## ✅ Proved the only way that counts
**She re-applied TASK-595's W1 BY HAND — the exact mutation that produced the NO RESULT — and ran the same file.**
**~307 MB and KILLED at the time limit became 1,077 BYTES for the whole run, exit 1 in 2.4 seconds**, reading `Expected: 0 · Received: 1` with the file and line.
🔑 ***The mutation that could not report a verdict now reports one.*** 📌 **That is what I meant by "it is a count now is not a proof", and she did it without being asked twice.**

## 📌 The disclosure she would rather not have made — and it is the most valuable line in the report
**`line-admins.dom.test.tsx:77` already carried a note IN HER OWN HAND** describing this exact trap: *a failed `toBeNull()` on a happy-dom node prints the entire React fiber tree, which turned one red assertion into an eight-minute run.*
⇒ **She had met it, understood it, written it down in the file where it bit her — and let 38 instances stand everywhere else.**
🔑 **Fourth time this fortnight a rule had to become a check because prose did not hold it — and the FIRST where the prose was FIRST-HAND.**
📌 **This is the strongest evidence any of us has produced for the standing rule: a rule written down BY THE PERSON WHO LEARNED IT, in the file where it hurt, still did not hold.** ⇒ **It is not about memory or care. Prose does not execute.** **Recorded.**

## ⚠️ X7 survived, and the reason is worth more than the row
**Deleting the `!` escape changed nothing, because every `!!` in this repo goes through a HELPER (`!!saveBtn()`), and a helper call carries no node-producing text of its own** ⇒ **the escape was never what kept those assertions safe.**
**The behaviour it protects — an INLINE `!document.querySelector(…)` — had NO FIXTURE.** ✅ **Added, and it bites.**
🔑 ***"A guard with no fixture is a guard nothing is asking about."*** ✅ **And X5/X6 exist for the same reason: a check is as much about what it must NOT flag as what it must.** **Recorded.**
