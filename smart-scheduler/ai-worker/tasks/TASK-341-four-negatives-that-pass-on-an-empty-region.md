# TASK-341 — four negative assertions that pass on an empty region

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-11)
⚪ **NO CLOCK. TESTS ONLY — no product code.** 🚫 No BE change, no migration.
**Source: your TASK-340 Question.** 🔑 **You found four, two of them yours, and a rule sharper than the one I
asked for.**

---

## §1 Your rule, which is the task
> ***"It is not *a negative needs a positive somewhere in the test*. It is: the guard must be over the SAME
> REGION as the negative."***
🔴 **`dialog-labels.test.ts:127` is the proof: the `it` HAS three positives — and they are on `modal`, the whole
file, not on `header`.** ⇒ ***it looks guarded and is not***, and the three green assertions beside it are what
make it look safe.
📌 **That is a better statement of the problem than "green by absence", because it names how the failure
HIDES.**

## §2 The four
| | region | fix |
|---|---|---|
| `expiry-warning.test.ts:52` | `call` slice | **one positive over `call`** |
| `expiry-warning.test.ts:73-74` | `panel` slice | **one positive over `panel`** — 🔴 **and see `§3`** |
| `dialog-labels.test.ts:127` | `header` slice | **one positive over `header`, not over `modal`** |
| `dialog-labels.test.ts:144-146` | same `header` | **covered by the above if it is in the same `it`; say which** |
✅ **A positive that would FAIL if the slice were empty.** ⚠️ *`expect(region.length).toBeGreaterThan(0)` is the
weakest acceptable form — 🔑 **prefer something that also proves it is the RIGHT region**, the way
`wire-names` and `t-arg-shape` do.*

## §3 🔴 THE ONE I WANT DEALT WITH SEPARATELY — a region bounded by a COMMENT
**`expiry-warning.test.ts:71` ends its slice at `src.indexOf("TASK-287 §1")`** — **a task reference in prose.**
⇒ 🔑 **the check depends on a COMMENT surviving**, and this week has been about comments not surviving.
⚠️ **A tidy-up that removes a stale task reference silently empties the region** — **and with only negatives
inside it, the test stays green.** 📌 ***That is the same failure the positive guards against, arriving through
the door we have spent three tasks proving is open.***
✅ **Re-anchor it to CODE, not prose** — 🔑 **or, if the comment is genuinely the only stable boundary, say so
and add the positive AND a note at the comment saying a test depends on it.** ⚠️ **The second option is worse
and I would rather you argue for the first.**

## §4 What must not change
- 🚫 **What any of the four assert.** ✅ **This task ADDS guards; it must not weaken or re-scope a negative.**
- 🚫 The nineteen already-guarded assertions you listed · `t-arg-shape`'s two-directional form · any product
  code.
- 🚫 No BE change · no migration.

## Definition of Done
- [ ] Suite passes, **state the count** · typecheck clean · 🚫 **`git status` shows TEST FILES ONLY** — say so
- [ ] **Each of the four has a positive over ITS OWN region** — 🔑 **and you say which form you used and why**
- [ ] 🔴 **`§3` answered** — re-anchored to code, or argued
- [ ] 🔑 **Break it and watch: EMPTY EACH REGION and show the test now FAILS** — ⚠️ **that is the actual claim
      of this task, and a mutation of the assertion would not prove it**
- [ ] 🚫 **No negative was weakened or re-scoped** — asserted or stated
- [ ] **Restore verified by checksum**, one call

## Question
🔑 **Your report said `contract.ts` *"now closes with"* the clause. It does not — it is at line 16 of 553, at
the end of the HEADER.** ✅ **And the header is the RIGHT place: nobody reads to line 553 of a types file, so
end-of-file would have been useless.** ⇒ **the placement is right and the SENTENCE ABOUT IT was loose.**
📌 *I am not making a thing of it — I am naming it because it is one word of the same class we have spent two
days on, in a report rather than in code.*
⇒ ❓ **Is there anything worth doing about it, or is the honest answer that REPORT prose has no reader after me
and does not need the same discipline as code prose?** ⚠️ **I would take that answer** — 🔑 **but I would
rather hear it argued than assume it, because your reports are what I quote to @Porter, and he quotes them to
the owner.**

---

## §5 ✅ IMPLEMENTED — Fern, 2026-09-11. **Four guards, `panel` re-anchored to code, and every region emptied to prove it.**

```
bunx tsc --noEmit → exit 0
bun test          →  245 pass / 0 fail   (unchanged — guards, not new cases)
git status        →  M dialog-labels.test.ts · M expiry-warning.test.ts     ← TEST FILES ONLY
```
🚫 No product code · no BE change · no migration.

### §2 — the form I used, and why not `length > 0`
**Each region gets a positive that also proves it is the RIGHT region**, which is the stronger of the two forms
you allowed:
| region | the guard | what it also proves |
|---|---|---|
| `call` | `toContain("startDate")` + `toContain("startTime")` | it is the resume call, and it is the two fields that must go |
| `panel` | `toContain("endCourse.resumeCreated")` | it is the re-plan SUMMARY, not some other JSX branch |
| `header` ×2 | `toContain('t("plan.endsOn", { date: lastSession })')` | it is `SummaryBar` after TASK-319, not the file |

⚠️ **`length > 0` would pass on a slice that landed anywhere.** These fail on **empty** *and* on **misplaced**,
which is the difference between *"I read something"* and *"I read the right thing"*.
📌 **The two `header` assertions are in DIFFERENT `it`s** (`:127` and `:144`), so each re-slices and **cannot
borrow the other's guard** — both got one, and the demonstration below shows both fail independently.

### §3 ✅ RE-ANCHORED TO CODE — the option you preferred, and it is strictly better
`panel` ended at `src.indexOf("TASK-287 §1")` — **a task reference in prose.** It now runs from `result ? (` to
**the `) : (` that closes that JSX branch**, searched **from the start index**.
🔑 **Why searching from the start matters:** `) : (` also appears earlier, at the drop/reason branch — a bare
`indexOf` would have silently taken the wrong boundary. **A re-anchor that is wrong in a new way is not a
fix.**
✅ **The boundary is now the STRUCTURE the rule is about** — the rule says *"this branch computes no dates"*,
so the branch's own delimiters are the honest edges.

**Proof it worked, and it is the §3-specific one:** I deleted the `TASK-287 §1` reference from the component —
the tidy-up you described — and the suite stayed **245 / 0**. ⇒ **the check no longer depends on a comment
surviving.** *(Before the re-anchor that same deletion would have emptied the region and left the negatives
passing on `""`.)*

### 🔑 The demonstration the DoD actually asked for — **each region EMPTIED, not an assertion mutated**
Broke each region's start anchor in turn, so `indexOf` returns `-1` and the slice collapses:
```
1) call    → (fail) 🔴 sends NO `weekday` …
2) panel   → (fail) 🚫 derives neither date — no arithmetic on the response
3+4) header→ (fail) §2 option 2 — a non-date can no longer enter the `{date}` slot
             (fail) 🚫 the VALUE is untouched — a rename, not a re-derivation, and not a control
```
✅ **One anchor break, BOTH `header` tests red** — which is the evidence that they needed separate guards.
✅ **Every restore verified byte-identical by `md5sum`; suite 245/0 after each.**

### 🔻 My restore chain broke, and the thing that caught it was the restore check itself
**`grep -c` exits NON-ZERO when the count is 0.** My `&&`-chained demonstration therefore short-circuited at
`grep -c "TASK-287 §1"` → **the restore step never ran, and the component sat mutated.**
✅ **Caught immediately** because the same call ends in `git status` and a read-back of the line — **the two
checks @Jason's rule exists for.** Restored, verified by reading line 279, and re-run.
📌 **Worth writing down: a restore step behind `&&` is only as reliable as every command before it**, and a
counting command is exactly the kind that "fails" while succeeding. ⇒ **the demonstration scripts now use `;`
and verify with a checksum, not with an exit code.**

### §4 ✅ Nothing weakened
**No negative was removed, re-scoped or loosened** — every one asserts precisely what it did before; the diff is
additive except for `panel`'s end anchor, which is the §3 fix. `t-arg-shape`'s two-directional form and the
nineteen already-guarded assertions are untouched.

### Definition of Done
- [x] `bun test` **245 / 0** · `bunx tsc --noEmit` exit 0 · 🚫 **`git status` shows two TEST FILES and nothing
      else**
- [x] Each of the four has a positive over **its own** region — **form stated, and why not `length > 0`**
- [x] 🔴 §3 answered — **re-anchored to code**, with the from-start search explained
- [x] 🔑 **Each region emptied; each test failed** — the anchors, not the assertions
- [x] 🚫 No negative weakened or re-scoped — stated
- [x] Restores verified by checksum — **including the one that failed and was caught**

## Question — **does report prose need the same discipline as code prose?**

🔻 **First, plainly: *"now closes with"* was wrong.** The clause is at the end of the **header block**, line 16
of 553. ✅ **And you are right that the header is the correct place** — nobody reads to the end of a types file.

**But I do not accept the premise, and your own sentence is why:**
> *"your reports are what I quote to @Porter, and he quotes them to the owner."*

⇒ **report prose has a LONGER chain than most code comments — three hops, each one losing the tree it
described** — and under the amnesia rule the TASK file is the only memory a future reader gets. **A code
comment at least sits beside the thing it describes; a report describes a tree that has already moved on.**
🔑 **So it needs a DIFFERENT discipline, not a lighter one, and it cannot be the same one: a test can pin a
comment to its code. Nothing can pin a report to a commit that has since changed.**

✅ **The rule I would use, and it is narrow enough to keep:**
> **Be exact about anything a reader can ACT ON or RE-QUOTE — a location, a number, a verdict. Be free with
> emphasis.**

📌 *"Now closes with"* failed in exactly the actionable category. **The looseness was not general; it was in the
one kind of claim that travels.**

🔑 **And the concrete form is a rule you already made me adopt one layer down.** TASK-340 replaced `file:line`
pins with `file | expression`, because **a position is invalidated by any change and an identity is not.**
⇒ **the same rule for prose: state a location the way the reader will LOOK IT UP** — *"at the end of the header
block, after the `Nothing here is generated` line"* — **not as a spatial impression.** *"Closes with"* is
`file:line` for sentences.
⚠️ **What I would NOT do is add ceremony** — a report that hedges every location becomes unreadable, and an
unread report is worse than a loose one. **Exactness where it is quotable; plain language everywhere else.**
