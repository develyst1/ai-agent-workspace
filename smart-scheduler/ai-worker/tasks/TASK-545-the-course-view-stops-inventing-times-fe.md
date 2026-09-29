# TASK-545 — the course view stops inventing times — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-28) · **Size S.** The finding you stopped on in TASK-544, ruled.

## §0 The ruling and its reason
**`dtoToCourseView` fills `startDate: ""`, `weekday: 0`, `startTime: "09:00"` because `CoursePackage` requires them and `CourseSummary` sends none.**
⚖️ **Fix the TYPE, not the contract.** 🚫 **Do NOT ask the server for the three fields** — *we do not add an obligation to a server contract to satisfy a shape that has no reader; that is a second thing to keep true forever.*
🔑 **The defect is that the view DEMANDS what its source cannot supply.** **The view is what is wrong.**
📌 **And your caveat is why this is worth doing now rather than when it bites: "no reader found", not "no reader possible" — the values are plausible, so the day a reader appears nothing FAILS, it just shows Sunday 09:00.**

## §1 Build
- **The mapper's output type must not require what `CourseSummary` does not carry.** `Omit`, optional fields, a separate type — **your call; say which and why in one line.** 🔑 **The test is that the three values can no longer be INVENTED, whatever shape you pick.**
- ⚠️ **Readers first, then the change.** **Enumerate every reader of a `dtoToCourseView` result and say what each does with the three** — *if the count is zero, say zero and how you derived it, not "I looked".* 🚫 **If a reader DOES use one, stop and report** — that one is a real contract question and I will take it to @Jason.
- 🚫 **No screen behaviour change.** If making a field optional forces a guard at a call site, **the guard must preserve today's rendering exactly**, and say so.
- ✅ **Keep TASK-544's invention pin alive** — it must still fail on a fourth invention **and** must not pass merely because the fields are gone. **If the pin's meaning changes, say what it means now.**

## §2 What I am NOT asking for
🚫 Not a BE change · not a new DTO field · not a rewrite of `CoursePackage` for its real users (the plan flow has genuine times — **leave them alone**).

## Definition of Done
- [ ] The three can no longer be invented, shape chosen **and justified in one line** · 🔑 **every reader enumerated with a derivation, not a look** · 🚫 a reader that uses one ⇒ **STOP and report** · no rendering change (guards, if any, named) · TASK-544's pin still meaningful and still biting · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — including a mutation that re-introduces a fabricated default · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Fern (2026-09-28): the course view can no longer invent times · **682 / 0** · tsc 0 · build ok · **5 mutations bite** · 🔑 **zero readers, and the COMPILER is the derivation**

## §1 The shape, and the one-line reason
**`CoursePackageView extends Omit<CoursePackage, "startDate" | "weekday" | "startTime">`**, and the three fabricated lines are gone from `dtoToCourseView`.

🔑 **`Omit`, not three optional fields:** an optional field still invites a reader to try, and **these three values are plausible** — so with optionals the day a reader appears it reads `undefined`, guards, and shows nothing *silently*; with `Omit` **that reader is a compile error before it ships.** 🚫 `CoursePackage` itself is untouched (pinned): the plan flow has genuine times and they are none of this type's business.

## §2 🔑 Every reader, enumerated by derivation — **zero**
**Producers first (the set is closed):** exactly two functions return a `CoursePackageView` — `dtoToCourseView` (the API path: `listCourses`' `data.items.map(dtoToCourseView)` and the single-course read) and `toCourseView(course: CoursePackage)` (the offline path). No other code constructs one.

**Readers, derived by the compiler rather than by searching:** removing the three fields from the type makes **any** read of them on a `CoursePackageView` a type error. **`tsc --noEmit` is clean** ⇒ **no app code reads any of the three.**

⚠️ **And I checked the derivation is not vacuous** — a check that would pass on anything proves nothing. Two of the mutations below show the compiler firing on exactly this file and type: **F1** *(`'startTime' does not exist in type 'CoursePackageView'`)* and **F3** *(`missing the following properties … startDate, weekday, startTime`)*. ⇒ the compiler is genuinely reading these declarations, so its silence is evidence.

📌 **The one gap, stated:** `tsconfig.json` excludes `src/**/*.test.ts(x)`, so **the compiler's enumeration does not cover test files.** Covered two weaker ways instead: the suite is green **at runtime**, where the fields are now genuinely absent from every `dtoToCourseView` result (a test asserting one would fail), and a grep of test files found only my own declarations in `mapper-drops.test.ts`. **I am reporting that as weaker on purpose.**

✅ **Corroboration from before my time on this:** `expiry-warning.test.ts` already pins `expect(dialog).not.toContain("course.weekday")` — **someone else had already pinned the absence of one such reader**, which is consistent with a count of zero rather than with a reader I failed to find.

## §3 🚫 No rendering change, and no guard was forced
**`tsc` is clean with no edits outside the two files**, which is the same statement as *"no call site needed a guard"* — nothing had to be defended because nothing read them. ⇒ **no screen changed, and I added no `?? ""` anywhere** (a guard preserving a fabricated default would have re-introduced the lie one layer up).
📌 The offline path still spreads a real `CoursePackage`, so **at runtime** `toCourseView`'s result happens to carry the three; **the TYPE simply no longer promises them**, so no reader can rely on it. That is the intended asymmetry, not an oversight.

## §4 ✅ TASK-544's invention pin — still biting, and it says something STRONGER now
It used to assert *"these three inventions are declared, and a fourth fails"*. It now asserts **"`dtoToCourseView` invents NOTHING — there is no literal-valued key in its body at all"**, plus the type that makes it impossible (`Omit`) and the fact that `CoursePackage` keeps all three.
🔑 **So it cannot pass merely because the three are gone:** **F2 re-introduces `weekday: 3`** — a different value under one of the same names would be too, and so would a brand-new name — **and it bites.** `INVENTED_COURSEVIEW` is now `{}`, and the reasons test asserts that count, so **the empty set is itself pinned.**

## §5 🔑 Break-and-watch — `BASELINE=` (md5), `try/finally`, CHECKSUM verified
```
BASELINE= mappers.ts                     d81ad3583ee903b967d0113873062960
          types/app/scheduler/index.ts   c9edc23d33dbe4c4c7bea24725e584a2
          mapper-drops.test.ts           0508e06e023e313c2fc94b1d196d1a89
```
| # | mutation | caught by |
|---|---|---|
| F1 | **a fabricated default comes back** (`startTime: "09:00"`) — the task's required mutation | the invention pin **and `tsc`** (`'startTime' does not exist in type 'CoursePackageView'`) |
| F2 | a fabricated default **under a different name** (`weekday: 3`) | the invention pin — proving it is about **inventing**, not about three names |
| F3 | the view goes back to **demanding** the three (`extends CoursePackage`) | the type pin **and `tsc`** (`missing … startDate, weekday, startTime`) |
| F4 | **`CoursePackage` itself** loses a time the plan flow genuinely uses | the "the package keeps all three" pin |
| F5 | the courseView student list silently loses a declared drop | the drops pin **and** the reasons pin |

All five bite; none slipped; **CHECKSUM: every file back to baseline.** 📌 **F1 and F3 are now caught twice — the compiler became a second net, which is the real gain of fixing the type rather than the values.**

## §6 Verification
**682 pass / 0 fail across 72 files in 3.7 s** (unchanged count: this task **removed** a fabrication and **re-pointed** a pin rather than adding tests — the stronger assertion lives in the same test) · **`tsc --noEmit`: 0** · **`bun run build` ok**.
🚫 No BE change · no new DTO field · no rewrite of `CoursePackage` · no deploy request.
⚠️ **What I did not do:** give the course view real times. **Nothing needs them today**, and if something ever does, **that is the contract question** — `CourseSummary` would have to carry them — **and it now arrives as a compile error on someone's screen instead of as Sunday 09:00 on the owner's.**

---

# ✅ DONE — REVIEWED by @Sober (2026-09-28)
Verified: **682 pass / 0 fail** · tsc 0 · build ok.

## ✅ `Omit` over optional — and the one line is the right one
🔑 **"An optional still invites a reader, and these values are plausible."** ⇒ **an optional hands a future reader `undefined` and a silent blank; `Omit` hands them a COMPILE ERROR before it ships.** **That is the same argument that made inventing worse than dropping, applied one level up** — *the fix inherits the reasoning of the defect.* ✅ And `CoursePackage` untouched, because **the plan flow's times are real.**

## 🔑 The part I asked for, and she did better than asked
I asked for readers **derived, not looked at.** She gave **the compiler as the derivation**: the producer set is closed, **removing the three makes any read a type error, and tsc is clean** ⇒ **ZERO, proven rather than searched.**
✅ **And she proved the derivation NON-VACUOUS** — F1 and F3 fire on exactly this type, so **its silence is evidence, not luck.** 📌 *A green check that would be green either way proves nothing; she closed that hole unasked.*
⚠️ **Gap stated honestly: tsc excludes test files**, so that half rests on the suite plus a grep — **weaker, and she says so.** ✅ Corroborated by a pin she did not write (`expiry-warning.test.ts` already asserting `not.toContain("course.weekday")`).

## ✅ No guard, and the reason matters more than the absence
🚫 **No `?? ""` anywhere** — 🔑 **"a guard preserving a fabricated default only moves the lie one layer up."** *Correct: the defect was never the mapper's line, it was the claim.* **tsc clean with no edits outside the two files IS the no-rendering-change statement.**

## ✅ The pin now says something stronger than I required
**"This mapper invents NOTHING — no literal-valued key at all"**, plus the `Omit`, plus `CoursePackage` keeping all three ⇒ 🔑 **it cannot pass merely because the three are gone** (F2 re-introduces `weekday: 3` and bites), **and the empty set is itself pinned.**
📌 **The real gain, in her words: the compiler became a SECOND net** — which is exactly why the ruling was the type and not the contract.
▶️ **Thread closed.** If something ever needs real times, **it arrives as a compile error, not as Sunday 09:00 on the owner's screen** — and only then is it @Jason's contract question.
