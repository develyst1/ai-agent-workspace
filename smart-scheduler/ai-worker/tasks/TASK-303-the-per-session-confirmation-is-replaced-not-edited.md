# TASK-303 — the per-session confirmation is REPLACED, not edited (`REQ-085 §7.3`)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-09)
📌 **No clock.** 🚫 No migration, no database, no FE change. **Second of the four `§7` formats.**
🔑 **This is the message TASK-284 just asserted BYTE-IDENTICAL (`booking_confirmed`). That assertion now
changes — deliberately, and it is the only one that may.**

---

## §1 The customer's words — `REQ-085 §7.3`, verbatim
**FROM (today):**
```
ยืนยันตารางสอน
นักเรียน: Aiwa
วิชา: Freeskate
เวลา: 2026-09-08 10:00-11:00
```
**TO:**
```
CONFIRMED SCHEDULE:
Student : Aiwa
Program : Private Freeskate 1 Hr
Date : Tuesday
Time : 11:00-12:00
Remark : เตรียมเฉพาะ Safety ให้น้อง
```
⚠️ **A REPLACEMENT, not an edit** — every label changes, and `เวลา` **splits into two fields.**

## §2 🔑 What the shape actually tells you
| | |
|---|---|
| **`Date` names a WEEKDAY** | `Tuesday` — **not a date**, exactly as `§7.1` ⇒ **the product's convention, not this message's quirk** |
| **`เวลา: 2026-09-08 10:00-11:00` becomes `Date` + `Time`** | 🔑 **the DATE disappears from the message entirely.** *Their example even shows a different hour from the FROM block; do not read a time change into it — `§7`'s two blocks are not the same booking* |
| **`Program`** | `Private Freeskate 1 Hr` — **the course/booking's own program string, as `§7.1` prints it** |
| **`Remark`** | the admin's note ⇒ 🔴 **`*ถ้ามี` — ABSENT ENTIRELY when there is none** |
✅ **`§7.1`'s helpers already answer three of these.** 🚫 **Do not write a second `courseNote`, a second weekday
lookup or a second `(-)`.** ⚠️ **If a helper does not fit, say why rather than forking it.**

## §3 🔴 The trap, and it is `§8.1` pointing the other way
**`§7.1` has TWO opposite empty-field rules. `§7.3` has ONLY ONE** — **`Remark`, the `*ถ้ามี` kind.**
🚫 **There is NO `Advance Leave Notice` on this message and no `(-)` rule to inherit.**
⚠️ **You have just built the message where the other rule lives.** 🔑 **The risk here is not forgetting the rule;
it is CARRYING one across from the message you finished an hour ago.** ⇒ **assert the absence, and assert that
nothing prints `(-)` on this message at all.**

## §4 ⚠️ The one thing that makes this bigger than a string swap
**This message goes to a PARENT, per booking, on the ordinary path.** ⇒ **it is the highest-volume notification
in the product.**
🔴 **A break here is not a wrong label on a screen an admin can re-read — it is a wrong message in a family's
LINE, unrecallable.** ⇒ **`TASK-284`'s `booking_confirmed` byte-identical assertion is the guard that must now
be REWRITTEN rather than deleted:** 🔑 **it should still pin the message byte-for-byte — to the NEW text.**
📌 *An assertion that changes because a requirement changed is correct. One that is deleted because it failed is
how this class of defect ships.*
🚫 **`§7.2` (the daily schedule, AUTO and COMMAND) and `§7.4` (the leave notice) are NOT in this task.**

## §5 What must not change
- 🚫 `§7.1` / `CONFIRMED SCHEDULE` (course-level) — **TASK-284 just shipped it; it stays byte-identical, asserted.**
- 🚫 WHEN this message fires, WHO receives it, the outbox, `formatOutboxMessage`, `TEMPLATE_FIELDS` semantics.
- 🚫 The bilingual CONVERSATION rules (`REQ-079 §18`) — **this is a NOTIFICATION.**
- 🚫 A human's own words: the student's name and the `Remark` are reproduced **exactly as typed** (`§8.2`).
- 🚫 No migration · no database · no FE change.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count** · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **The whole message pinned BYTE-FOR-BYTE against `§7.3`'s block** — the new text, **as a replacement for
      the old pin, not as a deletion of it**
- [ ] **`Date` renders an ENGLISH WEEKDAY** and 🔑 **the calendar date appears NOWHERE in the message** —
      asserted as an absence, because that is what the split actually did
- [ ] 🔑 **`Remark` is ABSENT — the whole line — when there is no note**, asserted · ⚠️ **and asserted that
      `(-)` never appears on this message**
- [ ] **A Thai student name and a Thai `Remark` are byte-identical to what was typed** — asserted
- [ ] **`§7.1`'s course-level message is unchanged** — asserted, **because both now say `CONFIRMED SCHEDULE`
      and the next person to edit one will find the other**
- [ ] 🔑 **Break it and watch** — and **restore it, suite green before you report a number**
- [ ] **Say which `§7.1` helpers you reused, and name anything you had to write twice** — with the reason

## Question
🔴 **Two different messages now open with `CONFIRMED SCHEDULE`.** 📌 *One is a course; one is a single session.*
🔑 **Is anything able to tell them apart** — an outbox `type`, a template key, a test that would fail if one
message's text were pasted into the other's builder? ⚠️ **I am not asking you to rename either** — **the customer
chose both headers and they are their words.**
**What I want to know is whether the CODE distinguishes them, or only the surrounding lines do.** 🔑 *Because
`REQ-086` is going to hand these to a customer as editable rows, and two rows with the same title is the point
at which someone edits the wrong one.*

---

## ✅ RESULT 2026-09-09 — @Jason. tsc **0** · **1818 pass / 0 fail**, 145 files · 🚫 **35 `.sql` = 35 journal tags.**

- [x] 🔑 **The whole message pinned BYTE-FOR-BYTE against `§7.3`'s block** — as a **replacement** for the old
      pin, not a deletion of it
- [x] **`Date` renders an ENGLISH WEEKDAY** and 🔑 **the calendar date appears NOWHERE** — asserted as an absence
- [x] 🔑 **`Remark` is ABSENT when there is no note**, and ⚠️ **`(-)` never appears on this message** — asserted
      across every empty combination
- [x] **A Thai student name and a Thai `Remark` are byte-identical to what was typed**
- [x] **`§7.1`'s course-level message is unchanged** — pinned in full, in the same file, beside this one
- [x] 🔑 **Break it and watch** — §3's trap committed on purpose; restored, suite green before this number
- [x] 🚫 No migration, no database, no FE change

New: `src/lib/session-confirmed-req085.test.ts` (8 tests) and the `session_confirmed` template.

### §1 What it renders now
```
📅CONFIRMED SCHEDULE:
Student : Aiwa
Program : Private Freeskate 1 HR
Date : Tuesday
Time : 11:00-12:00
Remark : เตรียมเฉพาะ Safety ให้น้อง
```

### §2 ✅ Helpers REUSED — and nothing written twice
`ob_course_title` · `renderFieldBlock` + `TEMPLATE_FIELDS` · `programLabel` · `notifyTypeOf` · the `ob_dow_*`
table with `TEMPLATE_LANG` · `extra()` with `ob_f_note` · `fieldLines`' omit-empty rule.
🚫 **No second `courseNote`, no second weekday lookup, no second `(-)`, no second omit-empty rule.**
✅ A new `TemplateKey` (`session_confirmed`) rather than reusing `confirmed_schedule`: the two messages have
different field lists, and — the part that matters — **this one has no `**Advance Leave Notice`, so §8.1's
`(-)` rule has nothing here to attach to.**

### §3 ⚠️ The ONE thing I added outside the message, and why
**`bookingType` and `size` on the `booking_confirmed` payload.** §7.3 asks for the booking's program string *as
§7.1 prints it*, and `programLabel` needs both. `MessageContext` carries neither and the worker's enrichment is
out of scope (§5). **Without them every COURSE session would print `1 HR` — a false statement about the package
on the majority of bookings.** Additive, and exactly what `course_confirmed` already carries.

### §4 🔴 One deviation from §7.3's literal block — flagging, not deciding
**Their example says `Private Freeskate 1 Hr`; we render `1 HR`.** §2 told me to use *"the program string as
`§7.1` prints it"*, and §7.1 ships `6 HR` — so I followed the instruction rather than the casing in the example.
⇒ **If the customer meant `Hr`, it is a one-line change in `programLabel` that moves `§7.1` too**, which is why
I did not make it unilaterally. **Your call.**

### §5 ✅ Break it and watch — §3's trap, committed deliberately
Making `Remark` fall back to `TEMPLATE_NONE` — **carrying `§7.1`'s `(-)` across, the exact mistake §3 names** —
fails two assertions: *"`Remark` is ABSENT"* and *"`(-)` NEVER appears"*. It would have looked entirely
deliberate in a diff.

### 🔻 Thirteen tests were pinning the old message. All corrected, none deleted.
The §4 pin was **rewritten to the new text**, as instructed. Two of the corrections are worth naming:
- 🔴 **AC-16's *"no line ends in a bare colon"* began failing on the customer's own header** (`CONFIRMED
  SCHEDULE:`). Narrowed to the FIELD lines — the property was always *a label printed with nothing after it*,
  and the title is not a label.
- 🔴 **The `th !== en` proxy moved AGAIN, in the same session.** TASK-284 moved it onto `booking_confirmed`
  because `course_confirmed` had become language-invariant; **this task made `booking_confirmed` invariant
  too.** It now sits on `reschedule_requested`, which still carries bilingual `ob_l_*` labels. ⚠️ **A proxy that
  has to move twice in one night is a proxy worth retiring** — I have kept it because the property is real, but
  it is measuring the wrong thing and the next REQ-085 format will move it a third time.

### 🔑 The Question — **the code distinguishes them, but not where `REQ-086` will need it to**
| what distinguishes them | strength |
|---|---|
| `payload.kind` — `booking_confirmed` vs `course_confirmed` | ⚠️ a plain string on an untyped payload (`[k: string]: unknown`); a typo falls through to the generic fallback |
| **`TemplateKey`** — `session_confirmed` vs `confirmed_schedule` | ✅ **structural** — `Record<TemplateKey, …>` forces every key to be declared, and it **caught this template today** in `message-time-format.test.ts` |
| the two byte-for-byte pins | ✅ pasting one message's text into the other's builder fails both |

🔴 **What does NOT distinguish them is the TITLE.** Both render `t("ob_course_title")` — **one i18n key, one
string.** ⇒ **for `REQ-086`, two editable rows would carry the same name and the same key**, and nothing in the
data says which message a row belongs to. 📌 **`TemplateKey` is the only real name either message has, and it
never reaches the outbox row or the i18n table** — so the honest answer to *"does the CODE distinguish them?"*
is **yes internally, and no at the layer the customer will edit.**
⇒ 🔑 **My suggestion, named not built: when `REQ-086` makes these rows, key them on `TemplateKey`, not on the
title.** The titles are the customer's words and two of them are identical; the template key is ours and cannot
be.

**BALL: @Sober — TASK-303 ready for review. ⛔ Nothing else is on me.**
