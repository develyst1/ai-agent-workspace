# TASK-228: BE — an อื่นๆ booking on the teacher's LINE: the admin's title names it

- Source: SPEC-070 + its 2026-08-31 amendment (REQ-078 · **AC-16 revised**. 🔴 **AC-17 is WITHDRAWN** by the
  owner — teacher-less อื่นๆ no longer exists, so there is nothing to not-send.)
- Status: ✅ DONE — code (Sober 2026-09-01) · rendered LINE check = @Tanya
- Depends on: **TASK-224** (`otherTitle` / `displayName` must exist)
- Repo: **smart-scheduler-back**, on `develop`. Assignee: **@Jason**

## What to do

An อื่นๆ booking gets the **same** LINE confirmation and the **same** place on the teacher's daily schedule as any
other booking (REQ-072 / TASK-219's booking-confirm path, and the 08:15 job's teacher schedule line). **Two things
change: what names it, and that there may be several teachers.**

🆕 **AC-16 (revised) — EVERY assigned teacher is told.** An อื่นๆ booking may carry more than one teacher
(TASK-224's `booking_teachers`). **Each** of them gets the confirmation, and it appears on **each** of their daily
schedules. Iterate the **one accessor** TASK-224 provides (`teachers[]`) — 🚫 never read `teacher_id` and the join
table separately here; that is the second reader that makes the two disagree.
⚠️ **One message per teacher, not one message naming them all** — the existing message is addressed to its
recipient, and a shared body would change what the other four types read too.

- **The name is the admin's typed title** — the `displayName` TASK-224 already computes. 🔴 **Never the words
  "อื่นๆ" / "Other".** That is the whole reason the owner is asked to type it (REQ-078 📌).
- **A studentless booking's line is the title alone** — *"ประชุมทีม"* — with **no student field and no empty
  label**. TASK-219's lesson, stated in the REQ: an empty label reads as information that went missing.
- **No program line** for อื่นๆ (`subject` is null). Same rule: omit the field, do not print a blank one.
- 🚫 **Do not build a new message type.** Reuse the existing confirm/schedule messages; this is a naming change on
  a path that already works, and a second message shape would drift from the one the teachers already read.

### 🔴 AC-17 is WITHDRAWN — do not build the "no teacher ⇒ send nothing" branch

My earlier draft of this task held AC-17 open pending @Porter. **The owner has since ruled that every booking must
have a teacher** (*"ทุกการจองต้องมีครู"*, 2026-08-31), so the teacher-less state no longer exists and AC-17 was
**withdrawn from the REQ, not deferred**.
⇒ **Write no guard for it.** A branch for a state the schema forbids is dead code that the next reader takes for a
supported case — and Porter's reason for withdrawing rather than parking it is the sharper one: an impossible case
handed to QA gets marked "pass".

## Definition of Done — the OUTCOME
- [ ] Confirming an อื่นๆ booking sends **every assigned teacher** the same confirmation as any other type,
      **named by the admin's title** — checked against the actual rendered message text, not the payload field.
      With 3 teachers: **3 messages, one each** — assert the count and the recipients, not just that one was sent.
- [ ] The booking appears on **each** assigned teacher's daily schedule line under the same name.
- [ ] A **studentless** อื่นๆ message shows the title and **no empty student/program label** — assert on the
      composed string; a test that only checks a field is set would pass on *"ประชุมทีม · นักเรียน: "*.
- [ ] The four existing types' messages are **byte-identical** — the existing message tests still green, plus a
      diff check on the composer.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun test` green (report the count).
- [ ] 🚫 **No LINE message sent to any real recipient.** Compose-and-assert only — the outbox/notification tests'
      existing pattern. Real delivery is Tanya's, inside the owner's window (`REQ-077`, webhook/token rules).

## Implementation Notes (Jason, 2026-09-01)
| | |
|---|---|
| Repo | `H:\scheduler\smart-scheduler-back` — the `machine.local.md` row |
| `git rev-parse HEAD` | `6dfa5a7` |
| Branch | `dong` (still ahead of `develop` — the human's merge) |

🔴 **No migration.** `drizzle/*.sql` = **30** = journal tags, counted just now. Code only.

### What changed

| File | Change |
|---|---|
| `src/lib/line-message.ts` | `MessageContext.title`; `booking_confirmed` renders it on its own line, no label |
| `src/services/outbox.service.ts` | the worker carries `otherTitle` into the message context |
| `src/services/scheduler.service.ts` | confirm loops **every** assigned teacher; **new** `assignedTeacherIds` |
| `src/lib/daily-reminder.ts` | `ReminderSession.additionalTeachers`; grouping is one loop over all assigned |
| `src/lib/line-schedule.ts` | `subjectName` may be `null`; the program segment is omitted, not blanked |
| `src/services/jobs.service.ts` | the reminder feeds `displayName` + `null` program + the extra teachers |
| `src/services/other-booking-line.test.ts` **(new)** | 22 tests, all on the **composed string** |
| `src/services/other-booking.test.ts` | the join-table reader count updated — see below |

### The parts worth your eye

**No empty label needed new code — it needed the right `null`.** `line(label, value)` already omits a field with
no value, and `bookingContext` uses `b.student?.name` / `b.subject?.name`, which are `undefined` for an อื่นๆ
booking. So the confirmation was *already* label-free; what was missing was the **name**. The title now renders
on its **own line with no label** — it is not a student, and putting it behind `ob_l_student` would state
something false. The daily schedule needed one real fix: `subjectName` was `?? "-"`, which would have printed
`- · CONFIRMED`. It is `null` now, and `renderSchedule` drops the segment.

**Every teacher, and one message each.** `assignedTeacherIds` returns primary-first, then the extras, and the
confirm path loops it. One message per teacher, never a shared body naming them all — the confirmation is
addressed to its recipient and rendered in that person's own language, so a shared body would change what the
other four types read. The returned `notification` still describes the booking's **own** teacher, so the FE's
"ส่ง LINE แล้ว / ยังไม่ผูก LINE" keeps meaning exactly what it always meant.

**🔴 I had to change one of my own TASK-224 tests, and I want that on the record.** It asserted the join table is
mentioned in `scheduler.service.ts` exactly twice (import + insert) — *"nothing outside the accessor READS it"*.
TASK-228 needs an id-level reader: the LINE paths hold a bare booking row inside a transaction, with no relation
loaded, so `bookingTeachers()` in `mappers.ts` cannot serve them. **The test caught exactly what it was built to
catch**, and the honest fix was not to raise the number. It now requires **every** mention to sit inside one of
two *named* functions (`attachAdditionalTeachers` writes, `assignedTeacherIds` reads) and counts them
structurally — so a third reader still fails the suite, which is the property that mattered. Two readers, one
per context, both encoding the same "primary first, then extras" order.

**AC-17 stayed unwritten, and a test enforces the absence.** No branch for a teacher-less booking — the schema
forbids that state, and a branch for an impossible case is dead code the next reader takes for a supported one.

### Verified
```
bunx --package typescript@5.6.3 tsc --noEmit   → exit 0
bun test                                        → 1050 pass / 0 fail (+22 on TASK-225's 1028)
drizzle/*.sql = 30 = journal tags (no migration)
```
Every message assertion is on the **composed string**, per the DoD — a field check would pass on
*"ประชุมทีม · นักเรียน: "*, which is the defect.

### 🚫 Not proven by me
No LINE message was sent to anybody, and nothing ran against any environment. That a real phone shows this
correctly — 3 teachers, 3 messages, the title where a name belongs — is Tanya's, inside the owner's window
(REQ-077).

## Questions
- **A studentless อื่นๆ confirm writes a SKIPPED *parent* outbox row, for a parent who cannot exist.**
  `confirmBooking` enqueues a parent message beside the teacher one (TASK-207). `parentLineUserId` already
  returns `null` for a null `studentId`, so nothing is sent — but `enqueueLine` still writes a SKIPPED row with
  `"no line userId"`. **It is harmless and I left it**, because it is the honest record of "we ran the parent
  path and there was nobody", and suppressing it would be a behaviour change to a path TASK-228 was not asked to
  touch. ⚠️ **But it does colour a number you and Porter read:** the reminder job's `unlinkedParents` reach and
  any "how many parents are unlinked?" glance at the outbox will now include อื่นๆ bookings that never had a
  parent. If that matters, the fix is one condition at the enqueue site — your call, and a separate task.

- **A discount is refused on อื่นๆ, so the confirmation never carries one — but the CHARGE is invisible in the
  message.** A teacher confirming a ฿5,000 school visit reads the title, the time and nothing about money. That
  is consistent with every other type (a course confirmation does not state the price either), so I did **not**
  add it. Flagging only because อื่นๆ is the first type where the person confirming it is often also the person
  who set the amount, and "did I type the right number?" is a question the message could answer. **Owner's
  call via @Porter, not mine to invent.**

- **`renderSchedule`'s program segment is now conditional, which is a shared composer.** The four lesson types
  always have a program, so their output is byte-identical (asserted). I mention it because `renderSchedule` is
  **also** the teacher's weekly `.ics`/"my schedule" view (REQ-016/TASK-043) — so the same omission rule will
  apply there the day an อื่นๆ booking appears in a week view. That is the behaviour we want; I am naming it so
  it is not discovered as a surprise.

## Review
(Sober fills this in at REVIEW.)

## Review — Sober, 2026-09-01: ✅ **PASS.** REQ-078's BE side is complete.

**Reproduced:** `tsc --noEmit` → **0**; the task-owned suites green; **no migration** (`drizzle/*.sql` = 30 =
journal tags, re-counted).

📌 **"No empty label needed no new code — it needed the right `null`."** That is the right diagnosis and it found a
bug my task did not name: `subjectName: r.subject?.name ?? "-"` would have sent a teacher **`- · CONFIRMED`**. A
`"-"` placeholder is worse than an omission because it reads as data. You removed the cause instead of adding a
condition.

📌 **The title on its own line, not behind a student label** — right, and for the stated reason: putting it there
would *state something false*. That is the same rule as `subject: null` rather than a placeholder program.

### 🔴 The test you had to change — you handled this exactly right, and I want the reasoning preserved

My TASK-224 rule was *"one accessor, never two reads"*, pinned by a count of **2** mentions. TASK-228 genuinely
needs an **id-level** reader (the LINE paths hold a bare booking row inside a transaction, no relation loaded), so
the mapper accessor cannot serve them.

**The honest fix was not to raise the number to 3, and you didn't.** Requiring every mention to sit inside one of
**two named functions**, counted structurally, keeps the guard's actual purpose — *a third, unnamed reader still
fails the suite* — while admitting the second context that really exists. **The test caught precisely what it was
built to catch, and the response was to sharpen it rather than loosen it.** That is the same call as Jason's
`price > 0` carve-out in TASK-225, twice in one day.
⚠️ The one thing to hold: **both readers must encode the same order** (primary first, then extras). You say they
do; that invariant is now load-bearing for AC-16 and AC-18 agreeing about who "the first teacher" is.

**AC-17 stayed unwritten with a test enforcing its absence** — correct. A branch for a state the schema forbids
is dead code the next reader mistakes for a supported case.

### Your two observations — both go to @Porter, neither changes this task

> **A studentless อื่นๆ confirm writes a SKIPPED *parent* outbox row for a parent who cannot exist.** Agreed it is
> the honest record of "we ran the parent path and found nobody", and agreed it is **not free**: it colours
> `unlinkedParents` and every *"how many parents are unlinked?"* glance at the outbox. 📌 Porter reports that
> number to the owner, so a metric quietly counting non-existent parents is exactly the kind of thing that gets
> believed. **Carried up; one condition fixes it if he wants it, as its own task.**

> **The charge is invisible in the teacher's confirmation.** ✅ Not adding it was right — consistency with the
> other four types is the safer default and this was not asked for. **But your framing of why it is different is
> the part worth the owner's ear:** อื่นๆ is the first type where the person confirming is often the person who
> **typed the amount**, and *"did I type the right number?"* is a question the message could answer for free.
> Owner's call via @Porter. Not blocking.

**Status → DONE (code).** That a real phone shows 3 teachers → 3 messages with the title where a name belongs is
@Tanya's, in the owner's LINE window (REQ-077) — routed with the rest.
