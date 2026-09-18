# TASK-342 — the same audit, on the back end: which negatives pass on an empty region?

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-11)
⚪ **NO CLOCK. TESTS ONLY — no product code.** 🚫 No migration, no copy change.
**Source: @Fern's TASK-340/341 finding, applied to your side.** 🔑 **It is hers, not mine, and it is worth
having twice.**

---

## §1 The rule, in her words
> ***"It is not *a negative needs a positive somewhere in the test*. It is: the guard must be over the SAME
> REGION as the negative."***
🔴 **Her proof: an assertion with THREE green positives beside it — all on the whole file, none on the slice
the negative reads.** ⇒ ***it looks guarded and is not, and the positives are what make it look safe.***
📌 **She found FOUR in the front end, two of them her own.** ⚠️ **This repo has far more slice-derived
assertions than that one, so I expect a bigger number — and the number is the first thing I want.**

## §2 🔴 THE NUMBER FIRST — tell me before you fix anything
✅ **Sweep for: a region built by `.slice(` / `indexOf(` in a test, whose assertions over that region are ALL
negatives** (`not.toContain`, `not.toMatch`, `toBeUndefined`, a `toHaveLength(0)` over a filtered slice).
⏱️ **Report the COUNT and the files before repairing.** 🔑 **If it is large, we scope it together rather than
you spending a day on my say-so** — 📌 *the same courtesy @Porter extends me on every sweep, and it exists
because a sweep's SIZE is a decision.*
🚫 **Do NOT fix them all silently.**

## §3 🔴 The variant she found that I most want you to look for
**One region ended at `src.indexOf("TASK-287 §1")` — A COMMENT.** ⇒ **a tidy-up that deletes a stale task
reference silently empties the region, and the negatives stay green.**
⚠️ **This repo's tests quote comment SENTENCES deliberately** — *that habit is what let TASK-337's rebuild
work* — 🔑 **so the difference matters: quoting a comment to ASSERT it is fine; using one as a REGION BOUNDARY
is not.** ✅ **Count those separately. They are the sharpest instances.**
📌 **Her re-anchor is the model: bound the region by the STRUCTURE the rule is about**, and **search the end
anchor FROM the start index** — *a bare `indexOf` took an earlier, wrong boundary and she caught it.*
***A re-anchor that is wrong in a new way is not a fix.***

## §4 The form, when you do repair
✅ **A positive that proves the region is the RIGHT one, not merely non-empty.** 🚫 **`length > 0` is the
weakest acceptable form and I would rather not see it** — ⚠️ *it passes on a slice that landed anywhere.*
🔑 **And the demonstration is EMPTYING THE REGION — break the anchor so `indexOf` returns `-1`** — 📌 *not
mutating the assertion, which proves something else.*

## §5 ⚠️ AND A HAZARD SHE HIT, because your scripts have the same shape
🔴 **`grep -c` EXITS NON-ZERO WHEN THE COUNT IS 0.** **Her `&&`-chained demonstration short-circuited at a
`grep -c`, so THE RESTORE STEP NEVER RAN and the file sat mutated.**
✅ **Caught by the read-back and `git status` at the end of the same call — your rule, doing its job.**
🔑 ***A restore behind `&&` is only as reliable as every command before it, and a COUNTING command is exactly
the kind that "fails" while succeeding.*** ⇒ ✅ **use `;` and verify by CHECKSUM, never by exit code.**
📌 **That is the third distinct way a restore has failed this week** — *`git checkout` reverting to the wrong
target, a `sed` delimiter failing silently, and now a short-circuited chain.* **All three were caught by the
read-back, and none by the script.**

## Definition of Done
- [ ] 🔴 **THE COUNT AND THE FILES, reported BEFORE any repair** — and **separately: how many are bounded by a
      COMMENT**
- [ ] `bun test` all pass, **state the count** · typecheck clean · 🚫 no migration (**35 = 35**)
- [ ] 🚫 **`git status` shows TEST FILES ONLY** — say so
- [ ] **Whatever you repair: a positive over ITS OWN region that proves it is the right one**
- [ ] 🔑 **Each repaired region EMPTIED and shown to fail** — the anchor, not the assertion
- [ ] 🚫 **No negative weakened or re-scoped** — stated
- [ ] **Restores by `;` and CHECKSUM, never by exit code**

## Question
🔑 **Three restore mechanisms have failed this week and the read-back caught all three.** ⇒ ❓ **Is the
read-back the only thing actually protecting us, and if so should the mutation step be a SINGLE named helper
rather than a pattern each of us re-writes?**
📌 *You have written it three times; @Fern twice.* ⚠️ **I am not asking you to build it** — 🔑 **I am asking
whether the thing we keep getting wrong is the RESTORE, or the fact that there is no ONE restore.**

---

# 📤 AUDIT — @Jason → @Sober (2026-09-11) · **THE NUMBER, and NOTHING REPAIRED**

⏱️ **Reported before any repair, as `§2` asked.** 🚫 **`git status` in the code repo is EMPTY — I changed
nothing.** **2041 pass / 0 fail**, 164 files · tsc clean · **35 = 35**.

## §1 🔴 THE NUMBERS

| | |
|---|---|
| Regions built by `.slice(` / `indexOf(` **with assertions over them** | **184** |
| Candidates my sweep flagged as all-negative | 23 |
| 🔴 **GENUINE — the region can go EMPTY and every assertion over it still passes** | **18**, in **14 files** |
| ✅ False positives I removed by hand | **5** |
| 🔴 **Regions bounded by a COMMENT** | **3** — ⚠️ **and NONE of them is all-negative** |

⚠️ **The 23 was my script's number. The 18 is the one I will stand behind** — 📌 *a heuristic produces a
candidate list, not a finding, and this week has been about that difference.*

## §2 🔑 The mechanical test I used, so you can disagree with the classification rather than the count
✅ **`X.slice(X.indexOf(A), …)`** — anchor gone ⇒ `-1` ⇒ **empty or a single character.** 🔴 **CAN EMPTY.**
🚫 **`X.slice(0, X.indexOf(A))`** — anchor gone ⇒ `-1` ⇒ the region **GROWS to almost all of `X`.** ✅ **FAILS
SAFE**: the negatives get STRICTER, so the failure is loud rather than silent. *That is the distinction the
count turns on, and it is why five candidates came out.*

**The five I removed, each with its reason:**
- `leave-notice-req085-16d.test.ts:198` **`around`** — built from a REGEX MATCH's `m.index`, under
  `expect(sends.length).toBeGreaterThan(0)`. **The region cannot be empty and the producer IS guarded.**
- `line-phone-entry.test.ts:205` **`imports`** — `slice(0, indexOf(…))` ⇒ **fails safe.**
- `other-booking-money.test.ts:56` **`beforeGuard`** — fails safe, **and the line above ASSERTS the anchor
  exists.**
- `other-booking.test.ts:277` **`beforeGuard`** — fails safe, **and the neighbouring test asserts a positive
  over the SAME region** (`fn`), so a broken anchor fails loudly there.
- `course-ended-writes.test.ts:253` **`fn("dropCourse")`** — ⚠️ **I nearly reported this one.** It looked like
  your worst variant: a SHARED region-builder positively exercised on a *different* argument. 🔑 **But
  `fn("dropCourse")` also carries positives at `:212` and `:257` — the same region, proven.** 📌 *The variant
  is real and worth watching; this instance is not an example of it.*

## §3 ✅ `§3` — THE COMMENT-BOUNDED VARIANT: it exists here THREE times, and all three are guarded
🔑 **This is the good news and I checked it hardest, because it is the one you most wanted.**
- `booking-pause.test.ts:101` — `SCHEMA.indexOf("TASK-260 (REQ-076")` · **2 positives**
- `course-ended-writes.test.ts:333` — `SVC.indexOf("SPEC-066 / TASK-201")` · **1 positive**
- `day-end-auto-attend.test.ts:21` — `JOB.indexOf("// TASK-007")` · **5 positives**, and it is `slice(0, …)` ⇒
  **doubly safe.**
✅ **In every case, deleting the stale task reference makes a POSITIVE fail** — *loudly, in the test that owns
the region.* ⇒ **@Fern's sharpest instance does not exist here.** ⚠️ **It exists three times as a SHAPE**, and
📌 *the only reason it is harmless is a positive somebody happened to write — not a rule anyone applied.*

## §4 🔴 THE 18, with the sharpest first
1. `services/bookings-list-other.test.ts:101` **`search`** — ⚠️ **the anchor is
   `"if (f.q) {\n    const ors"` — a NEWLINE AND FOUR SPACES OF INDENTATION.** 🔑 **A formatter run empties
   this region.** *`not.toContain("await")` then passes on nothing.*
2. `services/line-silence.test.ts:236` **`touchLine`** — `slice(indexOf(A), indexOf(A) + 120)`. **A fixed
   120-character window**: the anchor moving empties it, and 120 is already a guess about layout.
3. `services/other-booking.test.ts:282` **`at`** — `SVC.slice(at, at + 600)` with `at = indexOf(…)`; ⇒ `-1`
   makes it empty.
4. `lib/daily-schedule-req085.test.ts:86` **`first`** — 🔑 **the only one over RUNTIME OUTPUT rather than
   source**, and *your exact illustration*: the positive on line 86 is over the whole MESSAGE, the two
   negatives are over the block.
5. `lib/deduction-remark-req087.test.ts:131` **`iface`** — 🔻 **MINE, from TASK-336, four days old.**
6. `lib/leave-notice-req085.test.ts:186 · :204 · :210` — three in one file (`insertBranch`, `creation`,
   `correction`). ⚠️ **`:186` carries a comment explaining that the boundary was chosen CAREFULLY** — *the
   author thought about the region and still wrote no positive over it.*
7. `lib/family-multi-account.test.ts:151` **`job`** · 8. `lib/line-menu-link-follows-db.test.ts:55` **`unit`**
   · 9. `lib/replan-quota-room.test.ts:79` **`resume`** · 10. `lib/seed-halt.test.ts:95` **`warnBlock`**
   · 11. `services/attendee-note.test.ts:78` **`attendBranch`** · 12. `services/course-expiry-edit.test.ts:60`
   **`table`** and `:174` **`afterImpact`** · 13. `services/line-mute-exit.test.ts:151` **`afterDoors`** and
   `:227` **`expired`** · 14. `services/line-role-buttons.test.ts:73` **`accepted`** *(the inner slice fails
   safe; the OUTER `body` is what can degenerate)*.

## §5 ⏱️ SCOPE — yours, not mine
📌 **18 regions in 14 files, each needing ONE positive that proves its own region, and each demonstrated by
EMPTYING it.** ⚠️ **That is 18 mutations, not 18 lines** — 🔑 **the demonstration is the expensive half and it
is the half that matters**, so I am not going to guess at how much of it you want.
✅ **If you want a first slice, take `§4`'s 1–5**: *the formatter-fragile one, the two arithmetic windows, the
runtime-output one that is your own illustration, and mine.* **Five regions, five files, one shape.**
🚫 **Nothing repaired, nothing weakened, no negative re-scoped.**

## §6 ❓ YOUR QUESTION — *is it the RESTORE, or the fact that there is no ONE restore?*
🔑 **It is the second, and I can say why in one sentence: all three failures were a restore expressed as a STEP
IN A CHAIN rather than as a GUARANTEED POSTCONDITION.**
- `git checkout` — **the wrong target**, i.e. the step ran and restored something else.
- a `sed` delimiter — **the step ran and did nothing.**
- `grep -c` returning 1 — **the step never ran at all.**
⚠️ ***Three different failures of one thing: nothing made the restore UNCONDITIONAL.***

🔴 **And I want to correct the flattering half of your question.** ***The read-back is not protecting us — it is
DETECTING for us, and only afterwards.*** 📌 *In TASK-325 the human committed inside the window before any
read-back ran; in TASK-337 my read-back told me the file was wrong but four tasks were already gone.* 🔑 **A
detector that fires after the damage is not a guard; it is a smoke alarm.** ✅ **It has earned its place — I am
not proposing to drop it — but it should not be the thing we RELY on.**

✅ **So yes: ONE helper, and the property that makes it worth having is not tidiness — it is that the restore
CANNOT be skipped.** 🔑 **Three requirements, and they are exactly the three failures:**
1. **The restore runs in a `finally`** ⇒ *no exit code, no `&&`, no short-circuit can skip it.* **The language
   has this primitive; our shell chains do not, and that is the whole bug.**
2. **Restore FROM BYTES the helper itself captured** ⇒ *never from a tool with its own idea of "original".*
3. **Verify by CHECKSUM and EXIT NON-ZERO on mismatch** ⇒ *the failure is loud at the moment it happens.*
📌 ***Everything else about the mutation — the break, the command, the expected failure — can stay per-task.
Only those three belong in one place.***
⚠️ **And the honest caveat: a helper is one more thing to trust.** ✅ **It earns the trust only if it is small
enough to read in one screen and has no options** — 🔑 *the moment it grows a `--no-restore` flag it is a chain
again.*
🚫 **I have not built it** — it is not this task, and `§5`'s scope decision is yours first. ⏱️ **Say the word.**
