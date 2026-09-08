# TASK-253 — REQ-077: the renderer learns WHO it is writing to, and the fields the templates need
**Status:** ✅ **DONE — code** (Sober 09-06, reviewed) — tsc 0 · bun test **1359/0** · 🚫 nothing sent. ⚠️ `daily_reminder` wiring intentionally NOT in this task — Q2 ruled (repeat the block, one message per person); the 8-class coach question is with @Porter.

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-06)
**Spec:** `SPEC-072` · **Requirement:** `REQ-077` § *"THE TEMPLATES — final, for build"* + its per-type table.
🥇 **The owner's current priority** (*"ทำเรื่องแจ้งเตือนก่อน"*). **Nothing new sends in this task** — five live
messages change shape, and that is the whole risk.

---

## §1 The enabling change: `formatOutboxMessage` gains the recipient

```ts
export function formatOutboxMessage(payload: OutboxPayload, ctx: MessageContext = {}, lang: Lang = "TH"): string
```

**It cannot tell a parent from a teacher**, so Porter's *"the teacher's copy loses `*Expiry date` and
`**Advance Leave Notice`"* is not expressible today.

⇒ **Pass `recipientType` through** (the outbox row already has it — the worker just never forwarded it).
Keep the function **pure**; this is one more input, not a lookup.

🔴 **ONE payload, TWO renderings — and do not solve it any other way.** `scheduler.service.ts:3325` deliberately
builds the payload **once** for both people, with the reason in a comment: *"two copies… one of them would be
missed, which is how the parent ends up reading a different schedule from the teacher."*
🚫 **No second payload. No `teacher_course_confirmed` kind. No caller-side field list.** Each re-creates the exact
failure that comment prevents, and the failure mode is the parent and the coach disagreeing about **when the class
is** — worse than the privacy problem being solved. **The facts stay one object; the audience changes the
projection.**

## §2 The fields

`MessageContext` today: `studentName · teacherNickname · subject · date · startTime · endTime · title`.

| Field | Where it comes from | Notes |
|---|---|---|
| `Program` | per the REQ's per-type table | package name · voucher programme · `activity + 1 HR` · `activity + 1st Trial` · **the typed title** for อื่นๆ (`ctx.title` already exists for this) |
| `Start` | the course's first class date | **only on `course_confirmed`** — Porter's decision 1 |
| `Remaining` | course/voucher balance | **omitted** for 1HR · 1st Trial · อื่นๆ |
| `*Expiry date` | course/voucher expiry | **omitted** where the type has none |
| `**Advance Leave Notice` | declared absences | ⚠️ **prints `ไม่มี` when there are none** |
| `Coach` | **may be several** (REQ-078 `bookingTeachers`) | **joined into the existing field, not a new one** |

✅ **Decision 2 is nearly free — the mechanism is already there:**
`const line = (label, value) => (value ? \`${label}: ${value}\n\` : "")` omits an empty field already.
⚠️ **The one exception must not go through that path.** `**Advance Leave Notice` resolves to the literal `ไม่มี`
**before** rendering, so it is never an empty value. **Porter's reason, and keep it in a comment:** *a parent may
be reading the message TO CHECK that, and silence cannot be told from a missing feature.*

## §3 What must not regress — five live messages are in this blast radius
`booking_confirmed` · `daily_reminder` · `course_confirmed` · `sick_leave` / `leave_teacher` ·
`teacher_assigned` / `teacher_unassigned`.
⚠️ **`booking_confirmed`'s อื่นๆ title line (TASK-228 / AC-16) must stay byte-identical for the four lesson
types** — that is an owner-verified message. **Assert it, do not eyeball it.**

## §4 Keep Porter's decisions one line to revert
Each of the five is labelled reversible and the customer has not reviewed them yet. ⇒ **the per-type behaviour
belongs in ONE table-shaped place** (a map from booking type → which fields render), not scattered through the
switch. **A decision that costs a rewrite to reverse was not really reversible**, and the customer's answer is
coming.

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1359 pass / 0 fail** (21 new)
- [x] `formatOutboxMessage(payload, ctx, lang, recipientType)` — still pure, one more input; the worker forwards
      `row.recipientType` (`admin` reads as `parent`, the fuller message — see the Notes)
- [x] Parent vs teacher asserted **as an identity**: `strip(parent) === strip(teacher)` once the two removed
      lines are taken out, so a future drift between the two copies fails here rather than on a phone
- [x] The per-type table asserted for all five types, all three templates, both audiences
- [x] `**Advance Leave Notice` renders **`ไม่มี`** when empty (`None` in EN) — and it is resolved **before** the
      omit-empty rule can see it, asserted
- [x] `Coach` renders several joined names — `joinCoaches` in the worker, primary first, deduped
- [x] 🔴 `booking_confirmed` for the four lesson types asserted **in full, byte-for-byte** (`toBe`, not
      `toContain`) — including its `: ` separator, which the new block deliberately does not use
- [x] One table-shaped place: `src/lib/line-message-fields.ts`
- [x] 🚫 No migration (32 = 32) · no SQL · **nothing sent** — the only execution was `bun test` and `tsc`
- [ ] ⚠️ **`daily_reminder` (Parent 2 · TODAY'S SCHEDULE) is NOT re-cut in this task** — deliberately, because
      your Q2 asks for the current behaviour *before* we change it and the answer is a conflict you need to rule
      on. See the answer below. The machinery it needs (`todays_schedule` in the table, the field block, the
      audience) is built and tested; wiring it is a small change once you decide.

## Implementation Notes — Jason, 2026-09-06

Repo **`smart-scheduler-back`**, HEAD **`219fd59`**. New: `src/lib/line-message-fields.ts` +
`src/lib/line-message-fields.test.ts`. Touched: `src/lib/line-message.ts` · `src/lib/line-i18n.ts` ·
`src/services/outbox.service.ts` · `src/services/scheduler.service.ts` · `src/lib/line-message.test.ts`.

**§1 — one payload, two renderings, and nothing else changed shape to get there.** The recipient is a fourth
argument with a default of `parent`: **the fuller message**, so a caller that has not been updated cannot
silently strip lines from someone entitled to them. `scheduler.service.ts` still builds **one** `coursePayload`;
I added facts to it (`bookingType` · `size` · `expiryDate` · `coach`) rather than creating a second object.

**§2/§4 — the table.** `line-message-fields.ts` holds template field order, `TYPE_OMITS`, `AUDIENCE_OMITS`,
`programLabel` and the DB-enum mapping. Every one of @Porter's five decisions is one line of data; reverting one
is deleting or flipping that line. The renderer only prints.

**⚠️ Two lines I KEPT that the template does not list**, additive and one line each to delete: the confirmed
`Sessions` count (what the message exists to announce) and the `note` (TASK-219's fix — a note typed at booking
reaching the one message a teacher reads). **Removing them was not asked for and would be a regression**, so
they sit below the customer's block. Say the word if their template is meant to be exhaustive.

📌 **The audience projection reconciled a rule I thought I would have to break.** TASK-206 says an empty
advance-leave line *"reads as a problem to a teacher scanning the message"* ⇒ omit it. @Porter says it must print
`ไม่มี` ⇒ never omit it. **Both are now true**: the teacher's copy has no such line at all, and the parent's
always prints. The test that used to assert the absence now asserts the reversal, with the reason.

## Answers to your two questions

**1 — No, the worker did NOT load the course or the voucher, and it still does not.** `bookingContext` loads
student / teacher / subject / times / `otherTitle`. For `course_confirmed` nothing new was needed: the balance
and the expiry are in the **payload**, written inside the transaction that confirmed the course — which is also
why that row deliberately carries no `bookingId` to enrich from.
⇒ **The one read I did add**, and it is not a second round trip: `additionalTeachers: { with: { teacher: true } }`
joined onto the **existing** `bookings.findFirst` in `bookingContext`, for REQ-077's `Coach` (REQ-078 allows
several). Same query, one more relation.
🔴 **TASK-254 will need the course/voucher balance on a BOOKING-based message**, and that is a genuine new read
per outbox row. I have not added it here.

**2 — One message per person per day, listing every class. `TODAY'S SCHEDULE` as written does not fit it, and I
did not decide that alone.**
`groupReminders` keys on the **person**, not the booking: *"a parent with two children gets ONE message listing
both"*, and the header comment says why — *"per-booking would send a teacher eight separate pushes before 08:20…
that is how a notification channel gets muted, and a muted channel is worse than no channel."* `reminderKey` is
`reminder:<type>:<personId>:<date>` — the send-once guarantee is built on one-per-person too. The body is
`renderSchedule`, the owner-verified `ตารางวันนี้` composer.
⇒ **The conflict:** Porter's template is a single block (`Student : … Program : … Remaining : …`). Rendering it
per person means **repeating the block per class**; rendering it per class means **abandoning one-message-per-
person** and the idempotency key with it. **I recommend repeating the block** — it keeps both non-negotiables and
changes only the composer — but it replaces `renderSchedule` on a live, owner-verified message, which is your
call and probably @Porter's. **Everything it needs is built and tested; wiring it is small.**

## Questions
1. **Does the worker's enrichment already load the course/voucher** behind a booking, or only student/teacher/
   subject/time? If the balance and expiry need a new read, **say what you added and where** — this runs per
   outbox row.
2. **`daily_reminder` groups sessions** (`groupReminders`, `reminderKey`). Porter's `TODAY'S SCHEDULE` is written
   as one class. **What does a parent with two children, or two classes in a day, actually receive today** — one
   message or several? **The templates do not say, and I want the current behaviour before we change it.**


## Review — Sober, 2026-09-06: ✅ **PASS. TASK-253 is DONE (code).** And the Q2 ruling you asked for is below.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1359 pass / 0 fail** (112 files) ·
`AUDIENCE_OMITS.teacher = ["expiry", "advanceLeave"]` · `strip(parent) === strip(teacher)` asserted ·
`booking_confirmed` asserted with `toBe`, and `expect(parent).toBe(teacher)` for the four lesson types ·
`ไม่มี` resolved at `line-message.ts:184`, **before** the omit rule can see it, with the reason in the comment.

### ✅ The table is the right shape, and it is why the decisions stay reversible

```ts
visibleFields = TEMPLATE_FIELDS[template] − TYPE_OMITS[type] − AUDIENCE_OMITS[audience]
```

**Everything above it is data.** @Porter's five decisions are now literally lines of data, and reverting one is
deleting or flipping a line — which is what he promised the customer, made structurally true rather than
asserted. 📌 **`AUDIENCE_OMITS.parent = []` is the detail that makes it honest:** the parent is not a special
case in the code, it is the full message with nothing removed, so *"the teacher's copy is the parent's minus two
lines"* is a fact of the data rather than a claim in a comment.

✅ **Defaulting the recipient to `parent` — the fuller message — is right**, and your reason is the right one: a
caller that has not been updated **cannot silently strip lines from someone entitled to them.** The safe default
is the one that over-informs.

### 📌 The reconciliation I would have missed
> *"TASK-206 says an empty advance-leave line reads as a problem to a teacher ⇒ omit it. @Porter says it must
> print `ไม่มี` ⇒ never omit it. **Both are now true.**"*

**Two rules that looked contradictory were about two audiences**, and the projection dissolved the conflict
instead of picking a winner. You also turned the old assertion into its reversal **with the reason attached**,
rather than deleting it — which is exactly the `not.toContain` discipline from 09-05, applied by you to yourself
twice now.

### ✅ Two lines you kept that the template does not list — keep them
The confirmed `Sessions` count and TASK-219's `note`. **Removing them was not asked for and would be a
regression**, and you put them below the customer's block and flagged them. **Correct call.** @Porter, that is a
question for the customer only if their template is meant to be exhaustive — **I do not think it is; it is a
layout, not a whitelist.**

---

## 🔴 Q2 ruling: **repeat the block, one message per person. Do not abandon the grouping.**

Your read is right and the conflict is real. **Deciding it:**

**`groupReminders` is not a formatting choice — it is a control with a stated failure mode.** The header says it:
*"per-booking would send a teacher eight separate pushes before 08:20… that is how a notification channel gets
muted, and a muted channel is worse than no channel."* And `reminderKey = reminder:<type>:<personId>:<date>` —
**the send-once guarantee is built on one-per-person.**

⇒ **One message per class would break two load-bearing things to satisfy a layout**, and one of them is the
idempotency key. **The layout is not worth either.**

📌 **And the customer never asked for it.** Their template says **what one class's information looks like**. It
does not say **how many messages a day arrive** — that is us reading a delivery policy out of a block of fields.
⚠️ **Inferring a decision they did not make is how we end up defending it later as if they had.**

✅ **So: repeat the block per class inside the one message**, as you recommended.
📌 **The risk is narrower than it looks:** for a parent with ONE class that day — the common case — the repeated
block renders **identically** to a single-class message. The divergence only appears at two or more.

### ⚠️ But the teacher case is the one to look at, and I am naming it rather than solving it
**A coach with eight classes gets eight blocks where they used to get a list.** `renderSchedule` exists because
that is a list, and it is owner-verified.
⇒ **Do not delete `renderSchedule`.** The audience mechanism you just built makes keeping it for the teacher copy
nearly free — and if the customer wants blocks for coaches too, that is one line the other way.
**@Porter: this is the one thing in the notification half I want the customer asked, and it is concrete — "a coach
with eight classes: eight blocks, or the list they get today?"**

**Status → DONE (code).** The `daily_reminder` wiring moves to TASK-254's sibling or its own task once @Porter has
that answer — **the machinery is built and tested, so it stays small either way.**
