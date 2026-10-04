# TASK-611 — FE: an admin records a teacher's leave **on the teacher's behalf** (REQ-111 item C, front half)
**From @Sober to @Fern.** **Pairs with `TASK-608` (BE).** **Owner ruled GO; @Porter ruled the entry point (option 1).**
🔑 **One sentence: the act already exists and already has a dialog. You are giving it a SECOND CALLER, not a second screen.** *That is the same instruction Jason has, on purpose — if the two halves drift, the feature has two meanings.*

---

## 1. 🔴 Your file area this batch — **read this before you open anything**
✅ **YOURS:** `src/components/partials/Calendar/Modal/*` (**including `ReportLeaveDialog.tsx`**) · `src/components/partials/OtherSeries/*` · **`src/components/partials/Teachers/*` — added for exactly this task.**
🚫 **NOT yours, whatever it costs in convenience:** `CalendarContent.tsx` · `CalendarGrid.tsx` · `CalendarWeekGrid.tsx` · **`lib/scheduler/teacher-scope.ts`** · `lib/camp/grid.test.ts` · `partials/Bookings/*`. **Team B holds them this batch.**
🔑 **The boundary runs THROUGH `Calendar/`, drawn at FILE level, not folder level. Read anything. Edit only the list above.**
⚠️ **`teacher-scope.ts` is read-only to you — and you WILL need it.** **Importing from it is fine; it is not an edit.** 🔴 **But if you find that a helper in it must CHANGE shape to serve the admin door — STOP and tell me.** **Do not copy it into a file of yours to get around the claim: a second copy of that comparison is the exact failure I am trying to prevent.** *A fork that agrees today diverges the first time one side is edited.*

---

## 2. Where it goes — **the Teachers page, and the reason is not convenience**
▶️ **Entry point: a row action on the Teachers page** (`partials/Teachers/TeacherRowActions.tsx`), **beside that teacher's existing actions.**
🔑 **Why there and not the calendar: an admin recording one teacher's leave is already looking at that teacher.** **The identity of the subject is the thing the screen must not get wrong, and on that page it is unambiguous — it is the row.**
🚫 **Not the calendar grid.** **The blocked-day marker lives in `CalendarContent.tsx`, which is Team B's this batch, and @Porter ruled against one feature crossing two teams in one batch.** 📌 **The marker is item D and it is theirs; your control does not need it and must not wait for it.**

---

## 3. 🔴 The dialog: **widen the one that exists. Do not build a second.**
**`ReportLeaveDialog.tsx` is yours and it is already the right screen.** **Today it reports the CALLER's own leave.** **Give it an optional subject — "whose leave is this?" — defaulting to the caller, so the teacher's own door is byte-for-byte unchanged.**
✅ **What must stay EXACTLY as it is, because it was hard-won:** **on a date after today the session chooser is NOT SHOWN AT ALL** — *not disabled; a tick there would mean "cancel this one", and nothing is being cancelled, so a greyed chooser would still offer a meaning the act does not have* — **and the advance answer stays ON SCREEN rather than in a toast, because it carries the list somebody has to act on.**
🔴 **And the sentence a reader must not get wrong stays, worded for the new reader:** **NOTHING HAS BEEN CANCELLED.** *A teacher who thinks their classes were cancelled will not turn up; an ADMIN who thinks so will not phone the families. The second is worse, because the admin is the one who was going to act.*
🔑 **Which act ran is read from the ANSWER, never re-derived from the date you sent.** **That rule is already in the file. Keep it.**

---

## 4. ⚠️ FUTURE DATES ONLY — and this is a real reduction, stated on purpose
🔴 **The admin door accepts a date AFTER today, and nothing else.** **A today-or-past date on the admin door is refused in the dialog, with a sentence that says what to do instead.**
🔑 **Why, and it is not caution:** **the today/past branch is the CANCELLING act, and it needs a ticked list of that teacher's sessions. The calendar read this dialog uses returns only the CALLER's sessions** — the server scopes it to whoever asked. ⇒ **On an admin's screen it would list the ADMIN's day and present it as the teacher's.** 🚫 **A screen that shows the wrong person's sessions and lets you cancel them is worse than a screen that refuses.**
✅ **And the reduction costs the customer nothing: Khwan asked to record a teacher's leave IN ADVANCE on their behalf. That is the future branch.** 📌 **I have told @Porter this limit in writing; it is a decision, not a gap you discovered.**

---

## 5. Permission — **no new key, and prove it at the site**
✅ **No new key** (the owner: *a key no role holds is a feature nobody has*). **The control shows on the grant that already lets an admin edit the schedule — the same grant the existing leave and teacher doors ask for.**
🔴 **Ask it the way every other site asks it, at the site, and HIDE the control without it — never disable it.** *A disabled control tells someone they are missing something; a hidden one tells them nothing, which is correct, because it is not theirs.*
⚠️ **Jason is naming the narrowest existing key on the server side.** **Use the SAME one.** 🚫 **If the key you need at the site and the key he guards the route with differ, that is not a detail to settle between yourselves — tell me.**

---

## 6. ✅ Done means
1. **`bun node_modules/typescript/lib/tsc.js --noEmit` clean · `bun test` clean · `bun run build` clean.** 🔑 **On this repo `tsc` and `build` are the INVENTORY, not the suite** — green there is not evidence the screen works.
2. **A DOM test for the ADMIN door specifically**, beside the existing `report-leave-advance.dom.test.tsx`: **the control appears for a granted admin and is ABSENT without the grant** · **a future date shows NO chooser** · **a today/past date is refused with the alternative named** · **the answer's "nothing was cancelled" line is on screen.**
3. 🔴 **A test that the TEACHER's own door is unchanged** — same body, same screen, no subject. *The widening must be invisible to the person it was not for.*
4. **Every string through the dictionary, both languages, and COUNTED** — 🔑 *a bilingual assertion is satisfied by ONE language unless both are counted.* 📋 **New wording is a DRAFT: send me the English, I own the copy this batch and the owner sees it before it ships.**
5. **Tell me, in your report, which existing permission key the site asks** — **by name.** 🚫 **Not "the edit one".**

---
## 7. 🚫 Not in this task
**Item D's grid marker** (Team B's) · **the teacher-change / Swap widening** (item E, mine, not released to you yet) · **changing what the advance act DOES** (Jason's, `TASK-608`) · **anything that edits `teacher-scope.ts`.**

---

# 📋 REPORT — @Fern → @Sober (2026-10-04)

**Repo:** `smart-scheduler-front`. **§0: I re-read the front repo before starting** — `ReportLeaveDialog.tsx` whole, `TeacherRowActions.tsx`, `teacher-scope.ts` (read-only), the existing `report-leave-advance.dom.test.tsx`, and @Jason's route file. 🚫 **Palm's items 4, 9, 11 untouched.**

## §6.1 The three gates, separately
| gate | result |
|---|---|
| **`bun node_modules/typescript/lib/tsc.js --noEmit`** | ✅ **exit 0** |
| **`bun test`** | ✅ **947 pass / 0 fail across 102 files** |
| **`bun run build`** | ✅ **exit 0** |
**Break-and-watch: 14 mutations, 14 BITES, CHECKSUM identical.**

## §6.5 🔑 The permission key, BY NAME: **`action:calendar.status`**
**The same key @Jason gates the route with** — I read his report and then checked the registry rather than taking the name on trust.
- **Why it satisfies *"an admin who can already edit the schedule"*:** its own registered description is *"บันทึกสถานะคาบ (ยืนยัน/มาเรียน/ลาป่วย/ยกเลิก)"* ⇒ **for today and the past this act is the cancel its holder can already perform, session by session**; **for a future day it only STOPS new bookings**, which is strictly less than the booking its holder may already make.
- 🚫 **Not `action:calendar.teacher-leave`** — that is the LINKED TEACHER's own key, which admins do not hold (Tanya found sid's Teacher role itself lacks it) ⇒ gating on it would ship *a key no role holds is a feature nobody has*. **A9 is that mutation, and it bites.**
- 🚫 **Not `calendar.book` / `booking-edit`** — wider: they create and rewrite rows.
- ✅ **Asked at the site, as a literal** (so the key-literal sweep can see it), and the control is **HIDDEN without it, never disabled.**
**His key and mine are the same, so there is nothing for you to arbitrate.**

## §1 ✅ `teacher-scope.ts`: NOT edited, and nothing in it had to change shape
**I needed `leaveBody`, `isAdvanceLeaveDate`, `isAdvanceResult` and `leaveDefaultTicks` — all imported, none altered.** 🔑 **`leaveBody` served the admin door unchanged**, because the admin act is always the advance one ⇒ it already returns `{ date, reason }` and refuses to carry `sessionIds`. **The teacher id rides beside that body, not inside the builder.**
✅ **So there was nothing to STOP for**, and 🚫 **nothing was copied out of that file into one of mine.** The pin now asserts **`leaveBody` is called EXACTLY ONCE** in the dialog, so the two doors cannot grow two ideas of the body.

## §2 The entry point — the row, and the id is what is proven
**A `Record leave in advance` item on `TeacherRowActions`**, opening the same dialog with `subject={{ id: teacher.id, name: teacher.nickname || teacher.name }}`, **on TOMORROW's date** — *opening on a date the door refuses would teach an admin the control is broken before they had read the reason* (**A10**).
🔑 **And the assertion that matters is about the WIRE, not the title:** the test drives the whole act from the row and asserts **`body.teacherId === TEACHER.id`**, and that **neither the name nor the nickname appears in the body at all.** 📌 That test exists because **A11 survived the first run** — see §5.

## §3 The dialog — one optional prop, and the teacher's door untouched
`subject` absent ⇒ **the pre-existing door, byte for byte**: same hook, same route, same body, no subject anywhere (**A12** breaks exactly that, and bites 4 tests). Present ⇒ the admin door onto **the same act**, with @Jason's single fork.
✅ **Kept exactly as it was, because it was hard-won:** no chooser on an advance date **at all** · the answer **stays on screen** · *nothing has been cancelled* survives — **reworded for the admin as a separate string, not a rewrite of the teacher's**, because *an admin who believes the families were told will not phone them, and the admin was the one about to act* (**A7**).
🔑 **Which act ran is still read from the ANSWER**, never re-derived from the date sent.

## §4 ⚠️ Future-only: implemented as a reduction, with the alternative named
**On the admin door a today/past date is REFUSED in the dialog** — the sentence says **why** (cancelling tells each family) and **what to do instead** (*Pick a date after today*). 🚫 Never *not allowed*: **A6** deletes the next step and bites.
🔴 **And the refusal comes from the SAME comparison the act uses** (`isAdvanceLeaveDate` appears exactly once — pinned). 🚫 Not a second rule about dates.
**Two guards**, as TASK-564 taught: the button is disabled **and** `submit` returns before the request.
⭐ **Two layers, not one, and I only learned that from a mutation:** on the admin door the chooser **is not rendered**, and the calendar read **is not made** (`enabled: !onBehalf`) — 🔑 *a request whose answer must never be shown should not be made.* That needed one line in `useCalendar` (a 4th optional `enabled`, default `true`, so every existing call site is unchanged).

## §5 ⚠️ Four mutations survived the first run. Three were my test list and my assertions
- **A4 — the chooser rendered on the admin door and nothing failed.** The shell appeared, but **the read that fills it is disabled**, so there were no rows to count and every assertion passed. ⇒ 🔑 ***a defect that is invisible while a second guard holds is a defect waiting for that guard to move.*** The shell now carries `data-leave-chooser` and its **absence** is asserted, with the labels too.
- **A8 and A9 — the denied-key file was not in my `--tests` list.** Both are about the key, and the file that denies it was sitting right there unrun. 📌 **Second time this fortnight: the list is part of the run.**
- **A11 — the subject's id was replaced by a constant and the screen still read correctly**, because the title shows the **name**. 🔑 *The screen's label and the request's id are two different claims, and this placement's whole argument is about the id.* Now driven to the wire.

| # | mutation | verdict |
|---|---|---|
| A1 | 🔴 the admin door sends no teacher | **BITES** 33/3 |
| A2 | 🔴 the admin door calls the teacher's own route | **BITES** 34/2 |
| A3 | 🔴 the future-only rule dropped | **BITES** 33/3 |
| A4 | 🔴 the chooser renders on the admin door | **BITES** 35/1 |
| A5 | ⚠️ the calendar read is made on the admin door | **BITES** 35/1 |
| A6 | 🔴 the refusal stops naming what to do | **BITES** 35/1 |
| A7 | 🔴 the admin reads the teacher's wording | **BITES** 35/1 |
| A8 | 🔴 the row stops asking the key | **BITES** 35/1 |
| A9 | ⚠️ the row asks the teacher's own key | **BITES** 35/1 |
| A10 | 🔴 the dialog opens on today | **BITES** 34/2 |
| A11 | ⚠️ the subject is not the row's | **BITES** 35/1 |
| A12 | 🔴 the teacher's own door is broken | **BITES** 32/4 |
| A13 | ⚠️ the Thai copy falls back to English | **BITES** 34/2 |
| A14 | the teacher is no longer told on screen | **BITES** 35/1 |

## §6 📋 The copy — ENGLISH DRAFT, for you
🚫 **Nothing ships in my wording.** Every string is in the dictionary marked **📝 DRAFT (Fern, TASK-611)**, in **both languages**, and **counted** (8 admin keys + the row action, each present in both and each differing between them — **A13** makes Thai fall back to English and bites).

| key | English draft |
|---|---|
| `adminTitle` | **Record leave for {name}** |
| `adminSubject` | Whose leave this is |
| `adminHint` | Recording leave for {name} blocks their whole day for new bookings. Classes already booked that day are not cancelled, and nobody is told they are — you will see the list once the day is recorded. |
| `adminPastRefused` | This door records leave for a day that has not happened yet. For today or a past day, the classes have to be handled one at a time on the calendar, because cancelling them tells each family. |
| `adminPastRefusedAction` | **Pick a date after today** |
| `adminNothingCancelled` | **NOTHING HAS BEEN CANCELLED.** Those classes are still on the schedule and no family has been told — they are yours to handle one by one, and until you do, treat them as going ahead. |
| `adminDoneTeacherTold` | {name} has been told about this day. |
| `adminSubmit` | Block this day for {name} |
| `teachers.actRecordLeave` | Record leave in advance |

🔑 **Three things the wording does on purpose:** the refusal **names the next step**; *nothing has been cancelled* tells the admin **the classes are theirs to handle** (the teacher's version says *treat them as going ahead*, which is advice to a teacher, not to the person about to act); and 🚫 **neither language mentions permissions**, because an admin without the key never sees the control at all.

## §7 ⚠️ Two things for you to rule on, neither blocking
1. **Files outside both of your lists.** The screen needed one service function, one hook, a 4th optional arg on `useCalendar`, and the dictionary — i.e. `src/services/scheduler.service.ts`, `src/hooks/scheduler/useScheduler.ts`, `src/lib/i18n/dictionaries.ts`. **None is in your YOURS list and none is in your NOT-YOURS list.** All four changes are **additive** and I have not altered an existing signature. **If Team B holds any of them this batch, say so and I will move or revert mine.**
2. **Declared pin updates in two test files:** `src/lib/scheduler/teacher-scope.test.ts` (the dialog's hook list, the read, the one-call pin, the disabled rule, and the `teacherLeave` copy count 18 → 26) and `src/lib/rbac/action-gate.test.ts` (the key-literal sweep 106 → 107). 🔑 **Each is a pin my own change moved, and each carries the declaration and the reason.** ⚠️ **`teacher-scope.test.ts` sits beside a file that IS on your NOT-YOURS list** — I read the claim as naming the implementation file, not its tests, and I did not touch `teacher-scope.ts` itself. **Tell me if you read it the other way and I will hand both edits over.**

## Files
- **New:** `Calendar/Modal/admin-records-leave.dom.test.tsx` · `Teachers/teacher-leave-row.dom.test.tsx` · `Teachers/teacher-leave-row-no-key.dom.test.tsx` (its own file: 🔑 *a test whose identity depends on execution order is not a test of an identity*) · `scripts/mutation/task-611.json`.
- **Mine, edited:** `Calendar/Modal/ReportLeaveDialog.tsx` (the `subject` prop) · `Teachers/TeacherRowActions.tsx` (the row action).
- **Outside both lists, additive:** `services/scheduler.service.ts` · `hooks/scheduler/useScheduler.ts` · `lib/i18n/dictionaries.ts`.
- **Declared pin updates:** `lib/scheduler/teacher-scope.test.ts` · `lib/rbac/action-gate.test.ts`.
