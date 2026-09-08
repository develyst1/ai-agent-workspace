# SPEC-072 — REQ-077's notification half, grounded in the code that already sends these messages

**Status:** ACTIVE · **From:** @Sober (2026-09-06) · **Source:** `REQ-077` § *"THE TEMPLATES — final, for build"*
and its per-type table (@Porter, 2026-09-06, under the owner's *"คิดเองไปเลย"*).
**Owner's priority (via @Porter, 09-06): notifications first.** AC-5 parked, not cancelled.

> **Porter's five decisions are accepted as written.** This spec does not re-open them; it says what the code has
> to become for them to be true, and names the three things the templates could not know.

---

## §1 What already exists — the architecture decides the shape of this build

Sending is **not** per-call-site text. Every notification is
`enqueueLine({ recipientType, recipientLineUserId, bookingId, payload: { kind, … } })` → an outbox row → the
worker enriches it with booking details → **`formatOutboxMessage(payload, ctx, lang)` renders the text**
(`src/lib/line-message.ts`, pure, unit-tested).

⇒ **Porter's "5 of the 6 already exist" is right, and it is stronger than it sounds: five of six already have a
trigger, a payload and an outbox row. This is mostly a RENDERER change.** Existing kinds:

| Porter's message | existing `kind` | trigger today |
|---|---|---|
| Parent 1 · `CONFIRMED SCHEDULE` | `course_confirmed` | course confirmed (`scheduler.service.ts:3325`) — **already sent to parent AND teacher** |
| Parent 2 · `TODAY'S SCHEDULE` | `daily_reminder` | the daily reminder job |
| Parent 3 · `COURSE DEDUCTION` | 🆕 **none** | 🆕 **none** — the genuinely new one |
| Teacher 1 & 2 | same two kinds, `recipientType: "teacher"` | already sent |
| Teacher 3 · `แจ้งลา ‼️` | `leave_teacher` / `sick_leave` | already sent |

---

## §2 🔴 The blocker the templates could not see: **the renderer cannot tell a parent from a teacher**

```ts
export function formatOutboxMessage(payload: OutboxPayload, ctx: MessageContext = {}, lang: Lang = "TH"): string
```

**There is no `recipientType`.** Porter's Teacher 1 & 2 decision — *the same two messages minus `*Expiry date`
and `**Advance Leave Notice`* — **is not expressible today.** Nothing in the templates says this, and it is the
single largest structural implication in the REQ.

⚠️ **And it collides with a deliberate existing invariant.** `scheduler.service.ts:3325` says, in a comment:

> *"The payload is built ONCE above and sent to both people. Two copies of this object would be two places to
> update… and one of them would be missed, which is how the parent ends up reading a different schedule from the
> teacher."*

### ⇒ The decision: **ONE payload, TWO renderings.**
The invariant is about **facts**; Porter's rule is about **audience**. They are compatible, but only if the
divergence lives in the **renderer**, keyed on `recipientType`.

🚫 **Do NOT build a second payload, a `teacher_course_confirmed` kind, or a caller-side field list.** Any of those
re-creates exactly the two-places-to-update failure the comment was written to prevent — the parent and the coach
would once again be able to disagree about *when the class is*, which is worse than the privacy problem this is
solving.
✅ `recipientType` is already on the outbox row, so the worker can pass it. **The facts stay one object; the
projection differs.**

---

## §3 🔴 The second thing the templates could not know: `COURSE DEDUCTION` has TWO triggers

Quota is deducted in **two** places:

| Site | Path | How |
|---|---|---|
| `scheduler.service.ts:2513/2520` | an admin marks attendance | `usedSessions: current.course.usedSessions + 1` (read-then-write) |
| `jobs.service.ts:58/65` | **the day-end auto-attend** | `sql\`usedSessions + 1\`` (in-place) |

🔴 **Since REQ-070/TASK-180 the day-end auto-attends every unmarked class — so the day-end is the MAJORITY path,
not the exception.** A `COURSE DEDUCTION` message wired only to the manual check-in would be missing for most
sessions, **and would look like it worked** in every test anyone thought to write.

⇒ **It fires at both sites, from the same helper.** ⚠️ **Two different reads for the same number:** the manual
site already holds the pre-value and can add one; the day-end's `sql\`… + 1\`` must **`.returning()` the updated
row** — the true post-deduction figure, never a recomputation.

📌 **`Remaining` is the balance AFTER the deduction** (Porter, and he is right: a before-figure under a heading
that says DEDUCTION is the one number that must never be ambiguous). **Read it from the write, not around it.**

---

## §4 The third: `ctx` does not carry the fields these templates need

`MessageContext` today: `studentName · teacherNickname · subject · date · startTime · endTime · title`.
The templates additionally need **`Program` · `Start` · `Remaining` · `*Expiry date` ·
`**Advance Leave Notice` · `Coach` (possibly several)**.

- **`Coach`** — REQ-078 allows several teachers per booking (`bookingTeachers`). Porter: joined into the existing
  field, **not a new one.** ⇒ `ctx.teacherNickname` becomes a joined string built by the worker's enrichment.
- **`Program`** — per the per-type table: package name · voucher programme · `activity + 1 HR` ·
  `activity + 1st Trial` · **the admin's typed title** for อื่นๆ (`ctx.title` already exists for exactly this).
- **`Start`** — first class date of the course. Only on `course_confirmed` (Porter's decision 1).

✅ **Decision 2 is nearly free and the mechanism already exists:** `const line = (label, value) => (value ? … : "")`
already omits an empty field. ⚠️ **The one exception must NOT go through it** — `**Advance Leave Notice` prints
**`ไม่มี`**, so its value is resolved to the literal before rendering, never left empty.

---

## §5 The `อื่นๆ`-with-no-student case is an ENQUEUE rule, not a rendering one

Porter: *"an `อื่นๆ` booking may have NO student ⇒ the message goes to the teacher only."*
⇒ **Guard it where the recipient is chosen**, not in the renderer. A renderer that "handles" a missing parent has
already been handed a row addressed to nobody; the outbox would carry a SKIPPED row implying we tried to reach a
family that does not exist. **No parent ⇒ no parent row.**

---

## §6 What this spec does NOT decide

- 🅿️ **The customer's review of Porter's five decisions.** Each is one line to revert; the build must keep them
  that way — **a decision that costs a rewrite to reverse was not really labelled reversible.**
- 🚫 **The OA-move / rich-menu half of REQ-077** stays DRAFT and unrelated.
- ⚠️ **Whether the teacher's copy really loses those two lines** is Porter's call, flagged to the customer. §2's
  mechanism serves either answer — **which is the point of putting it in the renderer.**

## §7 Build order
1. **TASK-253** — `recipientType` into the renderer + the `ctx` fields + the per-type table. **Nothing new sends.**
2. **TASK-254** — the `course_deduction` kind and its **two** triggers, on top of 253.

**Sequenced, not parallel:** 254's message cannot be rendered until 253 exists, and splitting them keeps the new
trigger out of the change that touches five live messages.

---

# §8 — `CONFIRMED SCHEDULE` corrections from two LIVE messages (2026-09-07) · TASK-269

Three corrections off `sid`, one pass over `case "course_confirmed"`. **§6 said the customer's review of
@Porter's five decisions was not this spec's to decide. The review has now happened, and this is it.**

## §8.1 `Sessions` is the size of the course as bought — and the fix is chosen by a self-contradiction

`confirmCourse` printed the count of rows it FLIPPED. An advance leave is `SICK_LEAVE`, never `PENDING`
⇒ `10 HR` with two leaves printed `Sessions : 8`. **The customer is right on the meaning** — the line sits in a
message that *also prints the leave dates*, so a remainder makes the reader subtract twice.

🔴 **What decides the implementation is not the report:** the same message already prints
`Program : Surfskate 10 HR`, built from `course.size`. ⇒ **one message printed `10 HR` and `Sessions : 8` — two
derivations of one fact, disagreeing, in front of a parent.**
⇒ **`Sessions` reads `size`, the SAME field `programLabel` reads.** 🚫 **Not `confirmed + leaves`:** a derived
figure can disagree with the one beside it, and it would still be wrong on a re-confirm and on a budget failure.
🔑 **The send-gate keeps `confirmed`.** *Nothing changed ⇒ nothing to announce* is a different question from
*how big is this course*, and they were one variable.

## §8.2 The note's label is `Remark`, and its source is left alone deliberately

`ob_f_note` → `Remark`. 🚫 `ob_l_note` untouched — it renders `booking_confirmed`, byte-frozen.
✅ **Omit-empty stays** — its absence from both samples was the rule working, which is why it must be
**verified with a note present.**
📌 **`rows[0].attendeeNote` (earliest session) is kept, with its limit written down:** TASK-178 puts one note at
creation onto every session, so the normal path is exact; `setAttendeeNote` edits one booking, so a per-session
note reaches this message only from the earliest row. **A course summary has no true answer to "which session's
note" when they differ — recording the limit beats inventing one.**

## §8.3 🔻 DECISION 5 IS REVERSED — and the reversal costs one line, which was the point of §2

Owner: *"เอาหมด"*. ⇒ **`AUDIENCE_OMITS.teacher = []`** — the teacher's `CONFIRMED SCHEDULE` is the parent's,
field for field, and the teacher's `TODAY'S SCHEDULE` regains `*Expiry date` in the same move (per-audience, not
per-template — and the customer's own draft asked for exactly that).

🔴 **The consequence that is NOT in anyone's report, and is this addendum's reason to exist:** `advanceLeave`
resolves to `ไม่มี` **before** the block, so **the teacher now gets `**Advance Leave Notice : ไม่มี` on every
course with no leaves.** **TASK-206 held the opposite for a teacher.**
⇒ **Ruled: field for field includes the empty case.** *Silence cannot be told from a missing feature* is at
least as true for a coach checking whether a rostered child will be absent — **and "identical except when empty"
is a third rule nobody asked for.**

## §8.4 `AUDIENCE_OMITS` is empty — it is KEPT, and the emptiness is made loud

**Nothing left to omit, for any template, for either audience.** 🚫 **Not deleted.** Its one line is what made a
customer reversal cost one line — **the mechanism §2 was built for, doing the thing it was built for**, on a
field this customer has now changed their mind about twice. Deleting it re-threads `audience` through five
signatures the next time.
📌 **`audience` itself is NOT dead** — `line-schedule.ts` still splits `คาบสอน` / `คาบเรียน` by it. **The
projection is live; one table inside it is empty**, and the comment must say both halves.
🔑 **The emptiness is pinned by the REQUIREMENT, not by an assertion about the table:** the same payload rendered
to `teacher` and to `parent` must be **byte-identical**. An assertion that repeats the table proves the table
equals itself.

## §8.5 The day name follows `line_lang` BY DESIGN — not a defect, and not a default

Teacher `Date : อาทิตย์` · parent `Date : Monday`. `lineLang` is `null → TH`, and on linking it is **seeded from
the recipient's own LINE profile locale** (`getProfileLang`, `line-webhook.service.ts:1144`).
⇒ **the parent who read `Monday` has an English LINE app.** A Thai-preference family always gets Thai day names.
⚠️ **The honest caveat:** *"English labels, Thai values"* is literally true only for a TH recipient; for an EN
recipient the message is English throughout. **If the customer meant the day name is always Thai, that is a
different rule and one line** — it is a question, not a defect, and it is @Porter's to put.

## §8.6 ⏸️ HELD, deliberately — `Sessions` over-states after a partial confirm, and I am not spending the owner on it

If a session fails on `INSUFFICIENT_BUDGET` during a course confirm it stays `PENDING`, so the parent reads
`Sessions : 10` with 8 on the calendar.

**Not fixed, not asked, and the hold is declared rather than silent.**
- **`Sessions` is a fact about the COURSE, not the calendar** — the size the family bought. That stays true
  whatever the confirm did.
- **Nothing got worse.** The old number excluded declared leaves **and** failures ⇒ it never meant *"sessions
  scheduled"*; it meant *"rows this call flipped"*, which is not a fact anyone outside `confirmCourse` needs.
- ⚠️ **@Porter's addition (09-07), and it is the sharper half: the person who could be confused is the PARENT, not staff** — *"it says 10 and I count 8"*. **Still not worth the owner's attention now**, and it does not change the answer: **a third meaning for one field is how `Sessions` broke in the first place.**
- **The failure is not silent to staff:** `confirmCourse` returns `skipped` and a per-session `results` list with
  the reason, and the message is gated on `confirmed > 0`.
- ⇒ **It needs a budget failure during a course confirm, and it is a non-regression.** **The owner's attention is
  the scarcest thing this project spends**, and @Porter is already carrying §8.3's `ไม่มี` change to him.

✅ **If he ever wants the message to say what is on the calendar, the answer is a SECOND field** — `Scheduled`
beside `Sessions` — **not a third meaning for the first one.** (@Jason's, TASK-269 Q2.)
📌 **@Porter has been told that I am holding this.** *A hold nobody knows about is indistinguishable from an
oversight.*
