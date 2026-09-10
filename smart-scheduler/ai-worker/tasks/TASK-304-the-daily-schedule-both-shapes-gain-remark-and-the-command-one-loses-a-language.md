# TASK-304 — the daily schedule: BOTH shapes gain `Remark`, and only the COMMAND one loses a language (`REQ-085 §7.2`)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-09)
📌 **No clock.** 🚫 No migration, no database, no FE change. **Third of the four `§7` formats.**
🔴 **The owner NARROWED this one after @Porter first routed it. Read §1 before anything else.**

---

## §1 🔴 What the owner actually said — and what it excludes
> *"Format แจ้งเตือน Auto โอเคแล้วค่ะ แต่แบบคำสั่งให้เป็นภาษาเดียวพอ โดยต้องเพิ่มให้แสดง Remark ทั้ง 2 อันนะคะ
> ทั้ง Auto และกดคำสั่งเอง"*

| | AUTO | COMMAND |
|---|---|---|
| **one language** | 🚫 **NOT in scope — *"Auto โอเคแล้ว"*, it is already right** | ✅ **yes** |
| **`Remark`** | ✅ **yes** | ✅ **yes** |

⚠️ **`REQ-085 §4` ("the daily schedule must be ONE language") is NARROWER than it reads** — 🔻 **@Porter routed it
as covering the daily schedule generally and corrected himself: it applies to the COMMAND version only.**
🚫 **Do not touch AUTO's language, layout, or field order. It gains one field and nothing else.**

## §2 🔑 The two shapes are DIFFERENT BY DESIGN — do not unify them
**AUTO** — numbered blocks, one field per line:
```
1) Time : 10:00-11:00
Student : Aiwa
Program : Private Freeskate 1 Hr
Remark : เตรียมเฉพาะ Freeskate ให้น้อง
```
**COMMAND** — a compact two-line entry, then `Remark`:
```
10:00 Aiwa
Private Freeskate 1 Hr · Confirmed
Remark : เตรียมเฉพาะ Freeskate ให้น้อง
```
🔑 **@Porter, explicitly: *"Not a drafting slip; do not unify them."*** ⇒ **two renderers, one field added to
each.** ⚠️ **If a shared helper genuinely fits, use it — but say so; do not reshape one message to match the
other.**

## §3 🔴 `Remaining` and `*Expiry date` are CONDITIONAL — and the owner's REASON is the acceptance criterion
**They appear on the COURSE entry and NOT on the 1-hour one.** The owner, ruling `§9`:
> *"ใช่ ไม่งั้นมันจะแยกยังไง"* — **yes, otherwise how would you tell them apart.**

⇒ 🔑 **Those two lines are what tells a coach a COURSE row from a one-off.** ⇒ **assert they are ABSENT on a
non-course row, not merely present on a course one.**
⚠️ **A positive-only test PASSES while the distinction is broken** — **that is @Porter's warning and it is the
whole point of the field.**
📌 **This is `§7.2` AUTO's existing behaviour; the ruling makes it a REQUIREMENT rather than an accident. If it
is already conditional, assert it and say so — the assertion is the deliverable either way.**

## §4 ⚠️ `Remark` here is the `*ถ้ามี` kind — the same as `§7.3`, NOT the `(-)` kind
🚫 **No `(-)` on either shape.** 🔑 **Only `§7.1`'s `Advance Leave Notice` prints `(-)`, and that message is not
in this task.**
⚠️ **Third message in a row where the risk is carrying a rule across.** ⇒ **assert `(-)` never appears here.**
📌 **`Remark` is per-BOOKING** — the entry's own note, not the course's. **AUTO shows two entries with different
Remarks in the customer's own example**, so a per-message note would be visibly wrong.

## §5 🔑 A ruling you are owed, from your own TASK-303 note
> *"A proxy that has to move twice in one night is a proxy worth retiring."*

✅ **You are right, and here is the ruling so it stops moving:** **the `th !== en` proxy does not belong on a
NOTIFICATION at all.** **Every notification is English-by-ruling (`REQ-079 §18`), and each `§7` format makes one
more of them invariant** ⇒ **any notification-based proxy is guaranteed to move again.**
⇒ **Move it to a CONVERSATION flow, where bilingual is the RULE rather than a leftover.** 🔑 **Then it is
measuring the thing it was always for, and `§7.4` will not move it a fourth time.**
🚫 **Do not delete it** — the property is real.

## §6 What must not change
- 🚫 **AUTO's language, layout and field order** — *"โอเคแล้ว"*. **One field added. Nothing else.**
- 🚫 `§7.1` (TASK-284) and `§7.3` (TASK-303) — **byte-identical, asserted.**
- 🚫 WHEN either message fires, WHO receives it, the outbox, `formatOutboxMessage`.
- 🚫 A human's own words — the `Remark` and student names are reproduced **exactly as typed** (`§8.2`).
- 🚫 No migration · no database · no FE change.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count** · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **BOTH shapes pinned BYTE-FOR-BYTE** against `§7.2`'s two blocks
- [ ] 🔑 **`Remaining` and `*Expiry date` asserted ABSENT on a NON-course entry** — ⚠️ **the negative case is the
      requirement; the positive one is not enough**
- [ ] **`Remark` is per-BOOKING** — asserted with **two entries carrying different notes**, as in their example
- [ ] 🔑 **`Remark` absent entirely when there is no note**, and ⚠️ **`(-)` never appears on either shape**
- [ ] **AUTO's language is UNCHANGED** — asserted, ⚠️ **because the requirement that reached me first said
      otherwise and the next reader will meet that version too**
- [ ] **`§7.1` and `§7.3` unchanged** — asserted
- [ ] **§5: the `th !== en` proxy moved to a CONVERSATION flow**, with one line on which and why
- [ ] 🔑 **Break it and watch** — restored, suite green before the number

## Question
🔴 **`§7.2` COMMAND prints a STATUS — `Confirmed`, `Pending`.** 📌 *That is a `BookingStatus` reaching a customer's
eye, in English, in a message.*
🔑 **How many statuses can appear there, and does every one of them have a word a parent or coach would
understand?** ⚠️ **`SYSTEM-FACTS` records four different status LISTS in this product and two separate
`BookingStatus` unions** — **so "which statuses can reach this message" is a real question, not a rhetorical
one.**
🚫 **Change nothing.** **Name the set, and name any member whose label would confuse the reader** — 🔴 **because
`EXTENDED`, `PENDING_RESCHEDULE` and `PAUSED` all mean something to us and nothing to a parent.**

---

## ✅ RESULT 2026-09-09 — @Jason. tsc **0** · **1828 pass / 0 fail**, 146 files · 🚫 **35 `.sql` = 35 journal tags.**

- [x] 🔑 **BOTH shapes pinned in full** against `§7.2`'s two blocks
- [x] 🔑 **`Remaining` and `*Expiry date` asserted ABSENT on a non-course entry** — and on the one-hour BLOCK of
      a mixed message, not just on the message
- [x] **`Remark` is per BOOKING** — asserted with two entries carrying different notes in one render
- [x] 🔑 **`Remark` absent entirely with no note**, and ⚠️ **`(-)` never appears on either shape**
- [x] **AUTO's language is UNCHANGED** — asserted as *"the message with the note IS the message without it,
      plus one line"*
- [x] **`§7.1` and `§7.3` unchanged** — their full-message pins still hold
- [x] **§5: the proxy moved to a CONVERSATION flow** — see below
- [x] 🔑 **Break it and watch** — restored, suite green before this number
- [x] 🚫 No migration, no database, no FE change

New: `src/lib/daily-schedule-req085.test.ts` (10 tests).

### §1 What "one language" actually was
🔴 **The COMMAND schedule was wrapped in `both((l) => renderSchedule(rows, l, range))`** — a teacher asking for
their schedule received **the whole list twice, once per language.** That is what *"แบบคำสั่งให้เป็นภาษาเดียวพอ"*
is about; the renderer itself was never bilingual and never needed changing.
⇒ One line at the call site, rendering in `TEMPLATE_LANG` — **the same constant every `§7` format uses, rather
than a fourth answer to *"which language is a notification in?"***
🚫 **AUTO untouched**, and asserted so: the note-bearing render equals the note-free render plus one line.

### §2 ✅ Two renderers, one field each — and one shared rule
`remarkLine()` in the AUTO renderer and the `Remark` line in COMMAND both print `ob_f_note` in the customer's
` : ` convention — **the same label §7.1 and §7.3 use, so the word means one thing across every message a family
receives.** 🚫 The two SHAPES were not unified; only the RULE is shared, which is what §2 allows and asks to be
said out loud.
📌 COMMAND's `📝` prefix is gone — their block reads `Remark : …`.
⚠️ **The note had to travel** to reach AUTO at all: `attendeeNote` now flows `jobs.service` → `ReminderSession`
→ `TodayRow`. It is per BOOKING at every step, which is what makes two different remarks in one message
possible.

### §3 ✅ It was already conditional — so the deliverable is the assertion, and it is the NEGATIVE one
`Remaining` and `*Expiry date` come off `TYPE_OMITS`, so a one-hour entry has never carried them. **The ruling
turns an accident into a requirement, and the assertion is what makes that real.** Asserted as an ABSENCE, and
also on the one-hour BLOCK inside a mixed message — 🔑 *a positive-only test passes while the distinction is
broken*, and that is exactly where a mixed day would hide it.

### §4 ✅ Break it and watch — §4's trap, committed on purpose
Making AUTO's `Remark` fall back to `(-)` — **carrying §7.1's rule across, the third message running where that
is the risk** — fails three assertions, including *"AUTO's language is UNCHANGED"*, which catches it as a
LAYOUT change rather than only as a wrong string.

### §5 ✅ The proxy is retired from notifications — and now measures the property DIRECTLY
It sat on `course_confirmed` (TASK-284), then `booking_confirmed` (TASK-303), then `reschedule_requested` — and
your ruling is right: **every notification is English-by-ruling, so any notification-based proxy is guaranteed
to move again.**
⇒ It is now `tb("children_none")` — the children list, a CONVERSATION reply. 🔑 **And it stopped being a proxy
at all:** instead of *"TH ≠ EN, therefore something switches"*, it asserts that `tb()` composes **one string
containing both `t(key,"TH")` and `t(key,"EN")`** — the bilingual property itself. **`§7.4` cannot move it.**

### 🔑 The Question — **seven statuses reach that message, and two of them are our words, not a coach's**
The COMMAND schedule reads `t(\`status_\${r.status}\`)`, and its query excludes `CALENDAR_HIDDEN_STATUSES`
(`CANCELLED`, `PAUSED`) — so of the enum's **nine**, **seven** can appear:

| status | label | a coach reading it |
|---|---|---|
| `PENDING` · `CONFIRMED` · `ATTENDED` · `SICK_LEAVE` · `NO_SHOW` | Pending · Confirmed · Attended · Leave · No-show | ✅ plain |
| 🔴 **`EXTENDED`** | **Extended** | **our word for our mechanism.** It means *a make-up appended because someone took leave* — "Extended" says none of that, and it is the commonest non-obvious row on the list |
| 🔴 **`PENDING_RESCHEDULE`** | **Awaiting move** | better, and still does not say **who is being waited on** — a coach cannot tell whether the next action is theirs |

📌 **`PAUSED` is worth naming precisely because it CANNOT reach here:** it has a label (`Paused`), and the query
hides it. **A label that exists for a row that never renders is the shape TASK-271 found the other way round** —
a row that rendered its own key because no label existed.
🚫 **Changed nothing.** ⚠️ And the reader here is a TEACHER, not a parent — which makes `Extended` more
defensible than it would be on a family's message, and is worth knowing before anyone rewords it.

**BALL: @Sober — TASK-304 ready for review. ⛔ Nothing else is on me.**
