# TASK-533 — every `mock.module` must spread the real module — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-27) · **Size XS.** From @Fern's finding in TASK-532. **The backend uses `mock.module` in five files — I counted.**

## §0 The trap
**`mock.module` is global to the test PROCESS.** A mock that returns **only the members the current file needs** **silently deletes the rest for every other file in that process.**
Fern hit it within an hour of adding the FE's DOM harness: **two unrelated suites failed with *"Export named 'useResolveClashMove' not found"*** — 🔑 **and the failure named the innocent files, not the mock that caused it.**
📌 **That is what makes it worth an XS task rather than a note: the damage lands somewhere you are not looking, and the message points away from the cause.** The BE suite is green today, so **no current mock is doing it** — but the next one written from an existing example will copy whatever those five do.

## §1 Build
- **Each of the five spreads the real module and replaces one member**, with the reason written beside it. **If one already spreads, say so and leave it.**
- 🔑 **Then pin the rule** so the next mock cannot be written the narrow way: **a scan asserting every `mock.module` in `src` spreads.** 📌 The scan matters more than the five edits — **the five are already harmless, and the pin is what stops the sixth.**
- ⚠️ **If a mock genuinely must NOT expose the real module** (a module whose import has a side effect, say), **that is an exception: name it, pin the reason, and let the scan allow exactly it.** 🔑 **A scan that cannot express a legitimate exception gets deleted** — TASK-512's lesson.
- 🚫 **Do not change what any test asserts.** This is about the mock's shape, not its subject. **If spreading a module makes a test fail, stop and tell me** — that failure is a finding, because it means the test depended on a member being absent.

## Definition of Done
- [ ] All five spreading (or an existing one confirmed and left) · 🔑 **a scan pinning that every `mock.module` in `src` spreads**, with an exception mechanism that carries its reason · no test's subject changed · **a test that fails on spreading reported, not worked around** · suite **count** normally **and unreachable** · tsc 0 · 60 = 60 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation narrowing one mock back · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-27): the pin is built. There were no mocks to edit: the "five files" are COMMENTS recording TASK-072's removal. One ruling for you (§2). **3442 / 0 normally AND unreachable, 0 failed queries** · tsc 0 · 60 = 60 · mutations bite

## §1 The count, corrected: zero calls, five comments
- **The backend has NO `mock.module` call.** The five files a grep finds are **notes about its removal**:
  - `api.teacher-routing.test.ts` · `calendar.route.test.ts` · `eligible.route.test.ts` · `people.route.test.ts` · `module-isolation.test.ts`.
- **TASK-072** (`a7d9322`) replaced every whole-module stub with **narrow `spyOn`s, restored after each test**, because the stubs had cost five tasks (TASK-053/062/070 + two).
- `module-isolation.test.ts` is that task's guard, but **it only proves three modules still resolve. Nothing stopped a sixth mock.** That gap is what this task closes.
- ⇒ **No edits to any test and no test's subject touched.** There was nothing to spread, so no spreading could fail a test.

## §2 ⚠️ A finding that needs your ruling: TASK-072's rule is STRICTER than this task's
- **Spreading fixes the "Export named … not found" half only.** A spread mock **still replaces its one member for every file in the process**. Another file calling that member gets the **fake**, silently, with no error at all.
  - Fern's failure was the loud half; this is the quiet half of the same mechanism.
- TASK-072 chose **"nothing leaks — other files see the real module"**, which is why the repo uses `spyOn` + restore.
- **I built the scan to YOUR rule** (spread, or a named exception), so it doesn't overrule you. The failure message **recommends `spyOn` first**.
- ⭐ **My recommendation:** make the scan **"no `mock.module` at all, except a named exception"**. It's a one-line change to the rule, with the same exception mechanism. **Your call.**

## §3 The pin: `src/lib/mock-module-scan-task533.test.ts` (9 tests)
- **It walks all of `src` + `scripts`** (>400 files; asserted, so it can't shrink silently).
  - Comments are stripped first, so **TASK-072's own notes are not read as calls**.
  - Each call is read to its matching `)` (strings skipped).
  - A call passes if it **spreads** (an identifier, or `...(await import(…))`) **or** is in `EXCEPTIONS`.
- 🔑 **Exceptions, TASK-512's lesson:** `EXCEPTIONS[file][specifier] = reason`, honoured for **exactly that pair**.
  - A reason under 20 characters fails, and **a stale exception** (naming a call that no longer exists) fails. The list is empty today.
- 📌 **"Today: ZERO calls" is pinned too.** Whoever adds the first legitimate mock has to touch this file, so it's a deliberate act, not a copy-paste.
- **Not vacuous:** the scanner is proven on samples. A narrow mock is caught (with its specifier); both spread forms pass; comment notes are ignored; a `)` inside a string doesn't end the call; an exception holds for its pair only.
- ⚠️ **Known limit, stated:** it's a text scan. A mock built by indirection (`const m = mock; m.module(…)`) isn't seen. No such code exists; if it ever does, that's a review matter.

## §4 Break-and-watch (CHECKSUM identical, every restore byte-identical, BASELINE=9)
- **N: a SIXTH mock written the narrow way, in a real test file** (your "narrowing one back"; there's no existing mock to narrow, so this is the equivalent): **BITES**, and names the file and specifier.
- **S (control):** a **spread** mock added. **The rule passes it**; only the "zero today" pin fails, which is the intended "make it visible".
- **E:** spread detection broken: BITES (via the sample test).
- **C:** comments not stripped, so TASK-072's notes read as calls: BITES.
- **X:** a silent exception (empty reason, no such call): BITES.

⛔ Only you mark this DONE, and §2 is yours to rule.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27), with 🔨 **his stricter rule accepted as an addendum**
Verified: **3442 pass / 0 fail** · tsc 0 · 60 = 60.

## 📌 First, my count was wrong, and how it was wrong is the interesting part
I told him *"the backend uses `mock.module` in five files — I counted."* **There are ZERO calls.** I had counted files that **mention the string** — and those five are **comments recording that TASK-072 REMOVED them**, for this exact reason.
🔑 **So the repo had already learned this lesson once, and wrote it down in five comments.** ⇒ **it took an FE discovery, months later, to turn it into a check.** 📌 **A fact recorded in five comments is not a rule — it is five chances for someone to not read it.** That is the same shape as everything else this week (a list is a memory, a derivation is a fact), and **here the memory was ours.**
⚠️ **And I should have opened the files before writing "I counted" in a task.** He took the instruction, found the truth, and built for the truth rather than for my sentence.

## ✅ What he built
**My rule as written** (spread, or a named exception) — **plus "zero today" pinned**, so **the first real `mock.module` in this repo is a visible act** rather than a quiet one. 🔑 **That is the part I would not have thought to ask for:** the rule I gave protects the sixth mock; **his addition makes the FIRST one a decision someone has to defend.**
✅ **The scanner is proven on samples**, so **a green scan over zero calls is not a vacuous one** — the TASK-507 control, applied unprompted to a check whose subject does not exist yet. ✅ Exceptions carry a reason of real length, **and a stale exception fails.** ✅ Comments stripped (Fern's lesson, one repo over).
✅ **The failure message recommends `spyOn` first** — pointing at the thing to do rather than only at the thing not to.

## 🔨 Ruling on his recommendation: **yes — take the stricter rule**
**"No `mock.module` at all, except a named exception."** It is a one-line switch on the mechanism he already built.
**Why:** **the repo already has zero**, `spyOn` has served every case for months, and **the trap is process-global — it damages files nobody is looking at.** ⇒ **the honest default is "not this, unless you argue for it".** 🔑 **And the exception mechanism is what makes a ban acceptable:** a rule with no door is a rule someone eventually routes around.
