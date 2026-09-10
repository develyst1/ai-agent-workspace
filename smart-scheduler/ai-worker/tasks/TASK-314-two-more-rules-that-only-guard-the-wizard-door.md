# TASK-314 — two more rules that guard only the WIZARD door

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-09)
📌 **NO CLOCK. Not in the release** — 🚫 **do not let this near the owner's LINE round.** 🚫 No migration, no FE
change.
**Source: YOUR Question answer on TASK-313.** 🔑 **You found the pattern, named three, and correctly judged one of
them harmless.**

---

## §1 The pattern, in your words — and it is the finding, not the two instances
> *"`addStudentAndReply` predates the wizard, and every rule written FOR the wizard was written INTO the wizard.
> The inline door never generates a report: it succeeds, wrongly, and silently."*

🔑 **That is why *"the fix went where the report came from"* keeps producing defects here specifically:** **the
wizard is the door with a prompt to get STUCK in, so it is the only door that ever complains.**
📌 **Three instances found this week, all the same shape: the leave notice (one door of four, TASK-306), the
reserved-word guard (TASK-313), and these two.**

## §2 🔴 The two that are real
**1. `decideDuplicate` — AC-9's duplicate check — runs only in the wizard.**
⇒ **`add น้องเอ` twice creates TWO students named `น้องเอ` in one household.** **The wizard would have asked for
more detail.**
🔑 **The AC's own words: *"a duplicate asks for MORE DETAIL, never demands a rename."*** ⇒ **true of one door.**
⚠️ **And the consequence is worse here than a duplicate row:** **there is no delete route and no archive flag** —
**both records are permanent, and neither parent nor admin can tell them apart.**

**2. `notifyAdmins({ kind: "student_registered" })` — AC-11 — fires only from the wizard's confirm.**
⇒ **a child added inline is a child NO ADMIN IS TOLD ABOUT.**
🔑 **TASK-152's lesson was that the admin is told, loud SKIPPED rows and all** — ⇒ **true of one door.**
📌 **This is the quieter of the two and the one I would fix first**, because *a roster that grows without anyone
being told* is how the shop finds out from a parent.

## §3 ⚪ The third — you named it and judged it fine, and I agree
**`assertCanAddStudent`'s courtesy check at the wizard's FIRST step is not on the inline door.**
✅ **Correctly harmless: the write's own precondition still enforces the cap** — *which is exactly why it was
extracted.* 🔑 **The difference is a worse MESSAGE, not a missing rule.**
🚫 **Do not "fix" it.** 📌 **Recorded so the next reader does not mistake it for a fourth instance.**

## §4 What to do — and the shape matters more than the two fixes
✅ **Both rules move to where BOTH doors reach them.** 🚫 **Not copied into the inline path** — 🔑 **a second copy is
what created this whole class.**
⚠️ **`addStudentAndReply` is the older function and the wizard's confirm is the richer one.** **Say which
direction you moved the rule and why** — 📌 *if the honest answer is that one rule belongs in the SERVICE and the
other in the handler, say that; they need not move to the same place.*
🚫 **Do not change what the rules DO.** **`decideDuplicate`'s "more detail, never a rename" and the admin
notification's content stay exactly as they are.**

## Definition of Done
- [ ] `bun test` all pass, **state the count** · typecheck clean, **say which command** · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **`add น้องเอ` twice behaves as the WIZARD does** — asserted, **and the AC's rule is unchanged: more
      detail, never a rename**
- [ ] 🔑 **A child added INLINE notifies the admin** — asserted, **including the loud SKIPPED row when no admin is
      linked** *(TASK-152 — a silent failure to notify is the defect, not the absence of an admin)*
- [ ] **The wizard's behaviour is BYTE-IDENTICAL** — asserted. ⚠️ *This task moves a rule; it must not reword one*
- [ ] **You say which direction each rule moved and why** — 📌 *and if they moved to different places, why that is
      right rather than untidy*
- [ ] 🔑 **Break it and watch** — restored, suite green before the number
- [ ] 🚫 The cap's courtesy check left alone — asserted, with §3's reason

## Question
🔴 **Four instances of one shape, all in the same feature, all found in one week — and all found by asking rather
than by failing.**
🔑 **`addStudentAndReply` predates the wizard.** ⇒ ❓ **what else in this product has an OLDER path and a NEWER
one, where the newer got the rules?**
⚠️ **I am not asking for a sweep and not asking you to change anything.** **Name the pairs** — 📌 *the value is
knowing where to look the next time an AC says "the system does X" and it turns out to mean "one door does X".*
🔑 **And if you think the honest answer is that this feature is unusual rather than typical, say THAT** — **it
would be the more useful finding, and it would stop me looking for a pattern that is not there.**

---

## ✅ RESULT 2026-09-09 — @Jason. **1914 pass / 0 fail**, 154 files · 🚫 **35 `.sql` = 35 journal tags.**
📌 Typecheck: `bunx --package typescript@5.6.3 tsc --noEmit` → **0**. 🚫 No migration, no FE change. Off the clock, not in the release.

- [x] 🔑 **`add น้องเอ` twice behaves as the WIZARD does** — the inline door asks the same question and the parent
      continues in the wizard from its detail step · **AC-9's rule unchanged** (more detail, never a rename, not a strike)
- [x] 🔑 **A child added INLINE notifies the admin** — through the one `notifyAdmins`, so TASK-152's loud SKIPPED
      row (`skipReason: "no admin recipient configured"`) is inherited, not re-implemented
- [x] **The wizard's behaviour is byte-identical** — asserted by ORDER on both branches it touched
- [x] **Direction stated for each** — below, and they went to DIFFERENT homes on purpose
- [x] 🔑 **Break it and watch — twice, and the second one caught ME** (below)
- [x] 🚫 **The cap's courtesy check left alone** — asserted, with §3's reason in the test

### 🔑 §4 — the DIRECTION each rule moved, and why they did not move to the same place
**Both moved OUT of the wizard. Neither moved INTO the service. They landed in two different handler helpers —
and that is because they are two different KINDS of rule, not untidiness.**
- **AC-9 (duplicate → more detail) → `duplicateOutcomeFor` + `askMoreDetail`, handler helpers.** The rule's
  whole content is a QUESTION, and only a handler can ask one. The pure `decideDuplicate` did not move and has
  exactly one caller. ⚠️ On the inline door the question drops the parent into `AWAIT_STUDENT_DETAIL` — the
  wizard's own next step — so a duplicate inline add simply joins the wizard from there.
- **AC-11 (admin notified) → `createStudentFromLine`, the ONE LINE-side creator both doors call.** 🚫 **Not into
  `createStudentForParent`** — that service function is also the staff screen's write (`routes/api.ts:54`,
  `parent.service.createStudent`), and an admin adding a student would be notified of their own act. The rule
  is *"a parent registered a child over LINE"*; it lives on the LINE side. **`createStudentForParent` now has
  ONE caller in the handler and `student_registered` ONE site — the notification cannot be skipped by
  construction.** Row first, then message, as before.

### 🔴 Break it and watch — and the second mutation was green, which is the finding
- **A. the creator stops notifying** → 4 fail (two mine, two of TASK-233's AC-11 pins re-pointed). ✅
- **B. the inline door skips the duplicate question (`if (false && …)`)** → 🔴 **9 pass, 0 fail.** My two pins
  (`indexOf` ordering, `toContain` of the helper call) were satisfied by the TEXT of a disabled condition.
  **A green mutation proves nothing, and I nearly reported it as coverage.** ✅ Tightened to the exact guard
  line; re-run → 1 fail, the right one. The test carries the reason next to the pin.

---

## ❓ THE QUESTION — older path / newer path, where the newer got the rules. **The honest answer: the shape is NOT general here, and I can show why.**

I counted where each keyword door and each postback door LANDS. **Nine of eleven `do*` handlers are reached
from BOTH doors** — `doMenu` (4 ways), `doQr`, `doChildren`, `doCallAdmin`, `doMyCourses`, `doCheckinBooking`,
`doLeaveBooking`, `doTeacherSchedule`, `doTeacherCalendar` — the typed word and the tap converge on ONE function
within a line, and the rules live in that function. `doCheckin` / `doLeave` are single-door only because the
tapped form carries a booking id and goes straight to the `…Booking` sibling — same convergence, one hop later.
🔑 **Add-student was the ONE feature with TWO WRITERS** — `addStudentAndReply` (older, inline) and the wizard's
confirm (newer) — instead of two doors converging on one. **That is why four instances landed in one feature
in one week and none anywhere else.** After TASK-313/314 it has one writer too (`createStudentFromLine`).
📌 **Two pairs that DO exist, named so you know where to look — neither is a defect today:**
1. **`verifyAndLink`: existing parent (older) vs new parent (newer).** The 2FA branch exists only on the
   existing-parent path — correct, a new parent has nothing to protect — but it is the same shape: a rule on
   one branch of two. If 2FA ever becomes "on link", the new-parent branch is the one nobody will remember.
2. **`handleFollow` vs the unlinked-postback fallback** — both send `welcome`, converged today; they diverged
   once before (TASK-231's silence rules reached one and not the other) and were re-converged by hand.
⇒ **Look for TWO WRITERS, not two doors.** Two doors that converge are safe; a feature whose second entry
point grew its own write is where the next one is.

**BALL: @Sober — TASK-314 ready for review. ⛔ Nothing else is on me.**
