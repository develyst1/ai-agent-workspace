# TASK-309 — the creation preview still refuses a plan, and a make-up can land six months out in silence

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-09)
📌 **No clock.** 🚫 No migration. 🚫 No FE change *(§4 names the FE half and it is @Fern's)*.
**Source: both halves are YOUR findings on TASK-308** — the one live caller you refused to call dead, and the
26-week scan you noticed had lost its backstop.

---

## §1 🔴 The last refusal — and `§12`'s principle reaches it too
**`exceedsExtensionCeiling` has exactly ONE live caller: the creation preview's `exceedsCeiling`
(`scheduler.service.ts:2060`).** ✅ **You were right that it is NOT dead, and right not to take my word:** **the
preview projects make-ups at a weekly cadence while `findFreeExtensionDate` SEARCHES, so a taken slot can push a
real make-up past the projection.**

🔑 **You then asked the right question, and here is the ruling: it must not refuse either.**
**`REQ-085 §12` says the expiry stretches *"at creation AND after it, identically"*, and `§10` says the ceiling
stretches at creation.** ⇒ **a plan refused because a PROJECTED make-up exceeds a boundary computed from the same
projection is `§12`'s defect wearing the one costume we left it.**
📌 **And the human consequence is the owner's own screenshot from two days ago:** ***"This course can only extend
to week 5 — reduce the planned absences or pick a different start date"*, with `Create plan` DISABLED.** 🔑 **He was
told to change what he wanted because a date could not move. `§12` is the answer to exactly that sentence.**

## §2 ✅ What to do — §1
✅ **The creation preview reports the boundary the plan actually needs, and refuses nothing.**
🔑 **`exceedsCeiling` becomes ALWAYS FALSE** ⇒ ⚠️ **which makes it a field that cannot be true, and you already know
what we do with those.**
🚫 **But do NOT remove it here.** **§6 of TASK-308 stands: the FE reads it, and a removed field is a contract
change.** ⇒ **make it false, assert it cannot be true, and I will cut the FE half.** 📌 *Two repos, two tasks, one
order — the FE gate goes first or the field goes first, never both at once.*
⚠️ **If making it false means the born ceiling must widen to the SEARCHED dates rather than the projected ones,
say so** — 🔑 **that is a real design point and I would rather have your answer than my guess: the preview cannot
run the search for every candidate without becoming the save.**

## §3 🔴 A search that gives up and answers anyway — and its backstop was the line you deleted
**`MAX_EXTENSION_WEEKS_SCANNED = 26` (`extension-slot.ts:7`).** `firstFreeWeeklySlot` scans 26 weeks and, finding
nothing free, **returns the last candidate anyway.** **Its own comment says the caller's ceiling is what refuses
it** — *"this function never silently invents a valid-looking date."*
🔴 **That caller was the refusal TASK-308 removed.** ⇒ **on a slot booked solid for 26 weeks, a make-up now lands
half a year out and the expiry stretches to meet it, in silence.**
✅ **You were right to leave it: the remedy is a decision, not a patch.** **Here is the decision.**

**🔑 It must NOT refuse — `§12` forbids that — and it must not be silent either.**
⇒ **When a make-up lands absurdly far from the session it replaces, the leave still succeeds and somebody is
TOLD.** 📌 **That is this week's shape everywhere else: `warn, and still save` (REQ-082 AC-4), `§11.3`'s
warn-before-saving, the pause count.** 🔑 **A refusal is the owner's to grant; a warning is ours to owe.**
- ✅ **Who is told: the ADMIN**, through the path that already carries admin alerts. 🚫 **Not the parent** — they
  asked for a leave and got one; the date is our problem, not theirs.
- ⚠️ **The THRESHOLD is not mine to invent.** 🔑 **Report the FACT — how far the make-up landed from the session it
  replaces — and let me take a number to @Porter.** 📌 *Until then, `26` weeks is the only number anyone has
  written down, and it was chosen as a scan limit, not as a promise.*
- 🚫 **Do not change `MAX_EXTENSION_WEEKS_SCANNED`, and do not make the search refuse.**
⚠️ **And fix the comment either way** — it says a caller refuses, and none does. 🔑 *A comment that outlived its
mechanism is the thing we have hit three times this week.*

## §4 📌 Named, not in this task
**The FE's `Create plan` gate reads `exceedsCeiling`.** ⇒ **once §2 lands it is dead FE code** — **@Fern's, and I
cut it once your assertion says the field cannot be true.**

## §5 What must not change
- 🚫 **The quota gate** (`leaveLocked`), `adminUnlocked`, the per-change `override` — **still the only refusal.**
- 🚫 TASK-308's stretch and its single `recordExpiryChange` · TASK-282's derived expiry · TASK-300's anchor.
- 🚫 `MAX_EXTENSION_WEEKS_SCANNED` · the DTO's shape · `§7.1`–`§7.4`'s pinned messages.
- 🚫 No migration · no FE change.

## Definition of Done
- [ ] `bun test` all pass, **state the count** · typecheck clean, **say which command** · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **The owner's `Create plan` case: a 4-session course with three declared absences PREVIEWS without
      refusal** — asserted, **and the preview's boundary covers the plan it describes**
- [ ] 🔑 **`exceedsCeiling` cannot be true** — asserted as an absence, **and the field still EXISTS on the DTO**
- [ ] 🔑 **A make-up pushed far out by a busy slot: the leave SUCCEEDS and the admin is TOLD** — asserted on both
      halves. ⚠️ *The success without the warning is the silence this task exists to end*
- [ ] **A normal make-up warns NOBODY** — asserted. 🔑 *A warning that fires every time is not a warning, and this
      one would land on the admin every leave*
- [ ] **`extension-slot.ts`'s comment corrected** — it names a refusal that no longer exists
- [ ] 🔑 **Break it and watch** — both halves; restored, suite green before the number

## Question
🔴 **You found `MAX_STUDENTS_PER_PARENT = 5` refusing with a comment that cites NOTHING** — *"Business rule: a
single phone may register at most 5 students"* — **and the customer's own copy hardcodes 5, so you could not tell
whether the copy is the source or an echo of the code.**
🔑 **That is going to @Porter as a question for the owner, not to you.**
📌 **What I want from you instead is your own test, applied once more:** ***"does the cited source ask for a
REFUSAL, or only name a worry?"*** ⚠️ **You listed nine traceable refusals.** **Pick the two you are LEAST sure
of and read their sources** — 🔑 **not to change them, but because you said it yourself: *the first is a grep, the
second is a read, and it is the read that would have caught this in TASK-093*.**

---

## ✅ RESULT 2026-09-09 — @Jason. **1863 pass / 0 fail**, 149 files · 🚫 **35 `.sql` = 35 journal tags.**
📌 Typecheck: `bunx --package typescript@5.6.3 tsc --noEmit` → **0**.

- [x] 🔑 **The owner's `Create plan` case previews without refusal**, and the boundary covers the plan it describes
- [x] 🔑 **`exceedsCeiling` cannot be true** — asserted on the shape that makes it so — **and the field still exists**
- [x] 🔑 **A make-up pushed far out: the leave SUCCEEDS and the admin is TOLD** — both halves
- [x] **A normal make-up warns NOBODY** — including one that skipped a few busy weeks
- [x] **`extension-slot.ts`'s comment corrected**
- [x] 🔑 **Break it and watch** — both halves; restored, suite green before this number

New: `src/lib/makeup-far-out.test.ts` (9 tests), `searchExhausted` / `weeksBetween`, `makeup_far_out`.

### §2 ✅ And the answer to your design point is **yes — and it costs nothing**
You asked whether making `exceedsCeiling` false means the born ceiling must widen to the **searched** dates
rather than the projected ones. **It does, and the preview can do it without becoming the save: it has already
run the search** — it places the make-ups itself. So the boundary is now `max(bornCeiling, furthest session it
laid out)`, and nothing in that array can exceed a maximum taken over it.
🔑 **Preview and save still agree, from the other side:** TASK-308 grows the stored expiry to cover the make-ups
the reconcile appends, so both land on the finished course's own last date. **No second search anywhere.**
🚫 Left as the computation rather than a literal `false`, so the day someone narrows the ceiling again it starts
telling the truth instead of lying quietly.

### §3 ✅ Not refused, not silent — and the trigger is the only line nobody invented
`searchExhausted(fromDate, landed)` tells a found slot from a surrendered one by the one signal there is: the
distance. A success lands at or before `from + 26` weeks; exhaustion lands one week beyond.
⚠️ **I warn on EXHAUSTION, not on a distance I picked** — a threshold of my own choosing would be the same
mistake as the ceiling. 📌 The alert carries **how far** (`weeks`, `replaces`, `landedOn`), so @Porter can take a
smaller number to the owner and this becomes one constant.
🚫 The admin, not the parent: *they asked for a leave and got one; the date is our problem, not theirs.*
⚠️ **The wording is mine** — an admin-facing operational alert in the admin-alert convention (Thai, like
`ob_leave_admin` beside it), not one of the customer's §7 templates. **It states the fact and decides nothing.**
If @Porter wants different words it is one key.

---

## 🔴 The Question — and applying my own test EXONERATES the ceiling. I was wrong in TASK-308.

I picked the two closest in shape to the ceiling: both **notice-based refusals**.

**✅ `TEACHER_CHANGE_TOO_LATE` — passes cleanly.** `SPEC-028 §5 #3` does not name a worry; it specifies the
mechanism: *"a named `Record<…, days>` + accessor + pure `hasEnoughTeacherChangeNotice(…)` + message helper +
`conflict("TEACHER_CHANGE_TOO_LATE", …)` at the call site with admin `override`. **The number is DECIDED: 3 days
(owner)**"*. **The source asks for the refusal, names the code, and attributes the number.** Nothing to report.

**⚠️ `LEAVE_NOTICE_TOO_LATE` — I cannot close it.** `SPEC-048`'s own source is `REQ-047`, and what it asks for is
that the values become **EDITABLE**: *"The owner wants those values to be editable settings."* It **inherits**
the refusal and never asks for one. The refusal's authority is cited as **`UC-029`** — 🔴 **and `UC-029` does not
exist anywhere in this workspace.** The only file that mentions it is SPEC-048, referring to it.
⇒ **Its authority is a document I cannot read.** 📌 And it matters today: **`§12` says the QUOTA is the only
thing that may ever refuse a leave, and this refuses one.** It has an admin `override`, which softens it — but
a parent using LINE self-service has no override. 🚫 **Changed nothing.**

### 🔻 And the correction, which is the part I most want you to read
**My TASK-308 sentence — *"the ceiling was a limit no requirement ever asked for"* — is WRONG, and you are about
to put my formulation into `SYSTEM-FACTS`.**

Applying my own test to the ceiling, honestly, `SPEC-028 §5 #2` says:
> *"the reconcile's **append refuses** when the appended date would exceed `startDate + MAX_WEEK weeks`, with a
> reason (…). **Week-8 (size 6) is owner-confirmed** and load-bearing."*

⇒ **The source DID ask for a refusal, explicitly, and attributes the number to the owner.** The code comment I
read cited *"a leave could otherwise extend a course indefinitely"* — a fear — **but the SPEC one paragraph up
specifies the gate itself.** I judged the citation by the comment quoting it, not by the source.

🔑 **So the lesson is not the one I gave you.** The ceiling was **a genuine, owner-confirmed requirement that the
owner has now reversed** (`§12`). Nothing was invented. ⚠️ **The failure was not untraceable authority — it was
that three tasks treated a superseded rule as current**, and none of us noticed the owner had said something
that contradicted it.
📌 **My test still stands and I would still use it** — it passed `TEACHER_CHANGE_TOO_LATE` and caught
`LEAVE_NOTICE_TOO_LATE` on the same day. **But it does not explain the ceiling, and if it goes into
`SYSTEM-FACTS` attached to the ceiling it will teach the wrong thing.** ⇒ **the ceiling belongs under a
different heading: a rule can be correctly sourced, correctly built, and still be wrong because the owner
changed his mind — and the repo has no way to notice that.**

### §4 📌 For @Fern, when you cut it
`exceedsCeiling` **cannot be true and still exists on the DTO.** Same shape, same field.

**BALL: @Sober — TASK-309 ready for review. ⛔ Nothing else is on me.**
