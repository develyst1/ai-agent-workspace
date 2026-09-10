# TASK-316 — `ลา` scans ONE DAY, and the picker labels a session by its RECURRING attributes (`REQ-085 §14`)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-10)
📌 **Batch item 1 — the long pole.** ⏱️ **`uat` waits for the batch; the clock is off. Build it right.**
🚫 No migration, no FE change.
🔑 **The flow the owner asked for ALREADY EXISTS. Read §1 before you plan — this is smaller than it looks in one
way and larger in another, and the larger way is not in his words.**

---

## §1 ✅ What already exists — do not build any of it
`doLeave` (`line-webhook.service.ts:901`) **already does everything `§14` describes:**
| the owner asked for | today |
|---|---|
| *"scan to see what customer have"* | ✅ `findTodayBookingsForParent` |
| *"ลูกคนไหนค่ะ"* | ✅ `needsChildStep` → `childPicker` |
| *"เวลาไหนของลูกคนนี้"* | ✅ `sessionPicker` |
| a question with one answer | ✅ `eligible.length === 1` → straight to the booking |
🔴 **The ONLY thing wrong is the WINDOW.** **`findTodayBookingsForParent(lineUserId, date)` — one day.**
⇒ 📌 **`§14` is not "build a flow". It is *the flow exists behind a window one day wide*.**

## §2 🔴 THE PART THAT IS NOT IN HIS WORDS — widening the window BREAKS the picker
`lib/line-leave.ts:32` — **`sessionLabel` is `time · teacher · program`. There is NO DATE in it.**
✅ **Correct for a TODAY-only list, where the date is implied by the question.**
🔴 **The moment the window widens, a weekly course produces THREE IDENTICAL ROWS** — *"15:00 · Bank ·
Skateboard"*, this Tuesday, next Tuesday, the one after. ⇒ **a parent cannot tell which class they are
cancelling.**
🔑 **That is `§15`'s defect, on the parent's side.** **`§15`: the teacher got two byte-identical LEAVE NOTICES
because `Date : Tuesday` names a recurring slot.** **Here the PICKER does the same thing to the parent, and it
does it BEFORE the act rather than after.**
📌 ***Both labels were sufficient only while their context was one day wide.*** ⇒ **`§14` and `§15` are one
defect on two surfaces, and this task must not create the second one while fixing the first.**

## §3 ⚠️ The 20-CHARACTER CONSTRAINT — and I am not ruling it
**`sessionLabel` feeds TWO places** (`sessionPicker:842`): **the BUTTON label, clamped by the reply layer to
LINE's 20-char limit**, and **the prompt BODY, unclamped.**
⇒ 🔴 **A date cannot simply be prepended: `time · teacher · program` already overflows 20, and the clamp will
eat whichever end the date lands on.**
🔑 **The body and the button may need DIFFERENT forms** — **the body naming the date in full, the button carrying
whatever 20 characters actually distinguish one row from another.**
⚠️ **You can see the clamp and I cannot from here.** ⇒ **decide it, and SAY what you decided and why.**
🚫 **Do not silently truncate a date** — 📌 *a half-printed date is worse than none: it looks like information.*

## §4 What to build
✅ **(a) Widen the scan to UPCOMING sessions across all the family's children** — not today.
✅ **(b) Offer ONLY sessions still eligible under the cutoff.** 🔑 **Use `hasEnoughLeaveNotice` — the SAME helper
`updateBookingStatus` throws from** (`:2479`). 🚫 **Not a second copy of the rule.**
📌 *`LEAVE_NOTICE_TOO_LATE` STANDS (`§12.2`)* ⇒ ***offering a session the bot will then refuse is worse than not
offering it.***
🔴 **(c) `doLeaveBooking` (`:915`) RE-FETCHES with `findTodayBookingsForParent` too.** ⚠️ **Widen it as well, or
every pick outside today fails authorization and the parent gets *"nothing eligible"* after choosing.**
🔑 **This is the sibling-door shape you named yesterday — two functions, one stale window.** ✅ **One source for
"the family's eligible sessions", both callers.**
✅ **(d) The empty message must become TRUE.** **Today it says *"no class eligible TODAY"*.** ⇒ **it must say
nothing UPCOMING is eligible** — ⚠️ **and when sessions EXIST but are all inside the cutoff, SAY THAT.**
🔑 **The owner's own distinction: *"too late for tomorrow's class, call the school" is help; "no class eligible"
is a shrug.*** 📌 **A parent can currently be TOO EARLY and TOO LATE and read the same sentence.**

## §5 What must not change
- 🚫 **`LEAVE_NOTICE_TOO_LATE` and its per-teacher-type cutoff** — `§12.2`, and **removing a refusal there is a
  regression.**
- 🚫 The child step's *"ask only when ≥2 children"* rule (AC-3/AC-5) · the one-session shortcut · the typed twin
  for every tap (AC-19 — **LINE on PC cannot tap**).
- 🚫 `updateBookingStatus`, the quota, the make-up, TASK-315's link flow, `§17c`'s pinned screens.
- 🚫 No migration · no FE change · no new i18n key without telling me.

## Definition of Done
- [ ] `bun test` all pass, **state the count** · typecheck clean, **say which command** · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **A parent whose child has a class on THURSDAY can start a leave on TUESDAY** — asserted. *That is the
      owner's sentence, made executable*
- [ ] 🔴 **Two sessions of the SAME weekly course are DISTINGUISHABLE in the picker** — asserted **on the rendered
      rows**, ⚠️ **because this is the defect the widening would otherwise create**
- [ ] **A session inside the cutoff is NOT OFFERED** — asserted, **using the same helper the write refuses with**
- [ ] 🔴 **A pick outside TODAY succeeds** — asserted end to end. ⚠️ *This is `doLeaveBooking`'s window; without it
      the picker offers what the next step rejects*
- [ ] **Nothing upcoming ⇒ the "nothing" message; sessions exist but all inside the cutoff ⇒ a DIFFERENT
      message** — both asserted
- [ ] **One child ⇒ no child question** — asserted, unchanged
- [ ] **The button/body decision is STATED**, with what you did about the 20-char clamp
- [ ] 🔑 **Break it and watch** — ⚠️ **restore by READING the line, not by the script's exit code** *(your own rule,
      and it is now mine for reviews)*

## Question
🔑 **`sessionLabel` was correct until its context changed. `Date : Tuesday` was correct until a course recurred.**
⇒ ❓ **What else in this product is labelled by an attribute that only distinguishes things WITHIN a narrow
window?**
📌 *You have now seen three: the leave notice's weekday, this picker, and — the one that started it — a `Select`
whose value was fine until the options list changed underneath it.*
⚠️ **Name them; fix nothing.** 🔑 **I am not asking for a sweep — I am asking whether "sufficient in context" is a
recognisable shape, the way "two writers" turned out to be.**

---

## ✅ RESULT 2026-09-10 — @Jason. **1946 pass / 0 fail**, 156 files · 🚫 **35 `.sql` = 35 journal tags.**
📌 Typecheck: `bunx --package typescript@5.6.3 tsc --noEmit` → **0**. 🚫 No migration, no FE change.
⚠️ **Two new i18n keys — you asked to be told; see §4(d).** New: `src/lib/leave-window-req085.test.ts` (22 tests).

- [x] 🔑 **A class on THURSDAY can be cancelled on TUESDAY** — the query asks `>= today`
- [x] 🔴 **Two sessions of the same weekly course are DISTINGUISHABLE** — asserted on the rendered rows, **and
      the OLD label's collision is asserted first**, because it is the reason the task is not a `where` clause
- [x] **A session inside the cut-off is NOT offered** — through `hasEnoughLeaveNotice`, the write's own helper
- [x] 🔴 **A pick outside today succeeds** — `doLeaveBooking` authorizes from the SAME list
- [x] **Nothing upcoming ⇒ one sentence; all inside the cut-off ⇒ a DIFFERENT one** — both asserted
- [x] **One child ⇒ no child question** — unchanged, asserted
- [x] **The button/body decision is stated** — §3 below, and in the code next to it
- [x] 🔑 **Break it and watch — twice, and the first one caught ME** (below)

### §3 ✅ THE DECISION YOU ASKED FOR — the body and the button are NOT the same string
- **BODY, unclamped, names the date in full:** `อังคาร 22/09 · 15:00 · ครูBank · Skateboard`. **Weekday first
  because that is how a family holds its week; the date second because that is what tells one Tuesday from the
  next.** *(Same reading as your `§15` wording, reached independently — I did not touch `§15`.)*
- **BUTTON: `22/09 15:00` — 11 characters.** 🔑 **`time · teacher · program` already overflows 20 today**, so a
  prepended date would be eaten at one end or the other. ⇒ **the button carries exactly the pair that
  distinguishes the rows, and teacher/program are dropped from it PRECISELY BECAUSE they are identical across
  the rows being told apart.** The body beside it still names them.
- 🚫 **Nothing can be truncated:** the form is fixed-width and language-neutral, so *"never a half-printed date"*
  is a property rather than a promise. 📌 Date+time is a genuine key for one child — a child cannot be in two
  classes at one moment.
- 🚫 **check-in and `qr` keep the old label.** They really are today-only lists; a date there is noise.

### §4 ✅ One source, and I found a THIRD caller
`leavableSessions(lineUserId, date)` returns `{ upcoming, eligible }`. **`doLeave`, `doLeaveBooking` and — the
one not in the task — the typed `ลา <n>` twin (`:1189`) all read it.** ⚠️ **That third one indexed today's list
while the picker offered another**, so a number would have meant one session on a phone and a different one on
a PC. 🔑 `doLeaveBooking` now authorizes by membership of `eligible` rather than by `status === "CONFIRMED"` —
**a row could pass the status check and still be outside the window it was offered from.**
📌 **`linkedStudentIds` extracted in `checkin.service.ts`:** the window is the only thing allowed to differ
between the two queries; **who the family IS must not be able to differ at all** (TASK-259's lesson, and there
are now two windows for the first time).
🔑 **`§4(b)` uses `hasEnoughLeaveNotice`, the SAME helper the write throws `LEAVE_NOTICE_TOO_LATE` from**, with
the cut-off resolved per teacher TYPE exactly as `SPEC-048` does — **once per type, not once per row.**
🚫 **`§12.2` is untouched:** the refusal still exists and still explains itself, because a stale tap or an admin
edit between the offer and the pick must still be refused with a reason.

### §4(d) ⚠️ TWO NEW KEYS — telling you, as §5 requires
- **`empty_leave` REWORDED** — it said *"no class eligible for leave **today**"* and the flow no longer checks
  today. **That sentence had to become true or be deleted.**
- **`empty_leave_cutoff` — NEW.** *"Your upcoming classes are too close to their start time to cancel here.
  Please contact the admin."* 🔑 **A parent could be TOO EARLY and TOO LATE and read the same line** — your
  owner's *"call the school is help; no class eligible is a shrug"*. 🚫 **It names no NUMBER**: the hours are a
  per-teacher-type setting, and a sentence with `6` in it would be a second copy of the rule. **Both are OURS,
  not `§17c`, not `§7.x`; reword either and nothing else moves.**

### 🔻 Break it and watch — and mutation A was GREEN, which is the finding
- **A. `leavableSessions` narrowed back to `findTodayBookingsForParent`** → 🔴 **21 pass, 0 fail.** I had
  asserted that the upcoming QUERY exists and that both doors call `leavableSessions` — **and never that
  `leavableSessions` calls the upcoming query.** ⇒ **the whole widening rested on one line I had not pinned.**
  ✅ Pinned it (and its negative), re-ran mutated → 1 fail, the right one. **Second time this week a green
  mutation found a hole in my own coverage; both times the hole was the load-bearing line rather than an edge.**
- **B. the picker reverted to the undated label** → 1 fail, the right one.
- ✅ **Both restores verified by READING the line back.** ⚠️ And it earned its keep immediately: **B's restore
  `sed` failed on a delimiter and the file stayed mutated** — the exit code would not have told me, and the
  suite I ran next would have been green on a broken build.

---

## ❓ THE QUESTION — *"sufficient in context"* is a recognisable shape. Here is what I think it looks like, and where it is.

**Yes, and it is sharper than "two writers" because it has a tell.** 🔑 ***A label is at risk exactly when it
names an attribute that is CONSTANT across the set it is displayed in.*** ⇒ **the test is not "is this label
complete?" but "what varies among the rows a reader sees at once?"** *"15:00 · Bank · Skateboard"* was a perfect
label for one row and a useless one for three, and **nothing about the label changed — the SET did.**
📌 **That is why these arrive in pairs: the widening and the label defect are the same commit.** `§14` would
have shipped `§15` again on the parent's side.

**Where else, named and NOT fixed:**
1. 🔴 **`sessionLabel` in the CHECK-IN and `qr` pickers** — the same string, still today-only, **so it is
   correct today and correct only because of that.** ⚠️ It carries the child's name (`withChild`) precisely
   because that picker has no child step — **someone already hit this shape here and solved it locally.** ⇒ the
   day check-in looks past today, this breaks identically. **The mitigation is that `sessionPick` now exists
   beside it.**
2. 🔴 **`leave_ok_session`'s confirmation** — *"แจ้งลาแล้ว: {name} — {date} {time}"* — already carries the date,
   ✅ safe. **But `ob_reschedule`/`leave_teacher` and friends should be read with this question**, and `§7.3`'s
   `Date : Wednesday` is the one you have already put to the owner. 📌 **`§7.3` is the same shape with a
   different context width: fine at the moment of booking, cold days later.**
3. ⚠️ **`children_title` + a count, and the course card's `เหลือ {remaining}/{total}`** — both name a state that
   is only unambiguous *while you are looking at one family/one course*. **Not defects; listed because they are
   the same class and someone should check them the next time either is embedded in a longer list.**
4. 📌 **The one that started it — the `Select` whose value was fine until the options changed underneath it —
   is the same shape with TIME as the context** rather than a list: **sufficient in the set that existed when
   it was written.**

🔑 **So the recognisable shape is: *a label whose distinguishing power comes from its CONTEXT rather than from
its content*.** ⚠️ **And the practical rule I would use is narrow enough to be worth having:** ***whenever a
list's WINDOW widens — more rows, longer period, more owners — re-ask what varies among the rows, because the
label was written against the old set and nothing will fail.***

**BALL: @Sober — TASK-316 ready for review. ⛔ Nothing else is on me.**
