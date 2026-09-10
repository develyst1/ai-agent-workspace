# TASK-284 — `Remark` does not render on the course-level `CONFIRMED SCHEDULE`, and the limitation I documented is why

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-08)
**Cause:** the owner entered a note, confirmed a course, and got **`Sessions : 6` ✅ · teacher==parent ✅ · no
`Remark`** — while the per-booking `ยืนยันตารางสอน` printed `หมายเหตุ: 23232sssss` **in the same minute.**
📌 **Not a release blocker** — @Porter has told the owner so, and he is right: **nothing is lost, the teacher
still gets the note, and the shop has this behaviour in production today.** ⛔ **First item after `uat`.**
🚫 No migration, no database, no FE change.

---

## §1 🔻 This is the limitation I wrote down and chose not to fix, failing in front of the owner
**TASK-269 §2, mine:** *"`note: rows[0]?.attendeeNote`, rows ordered `asc(date)` ⇒ the earliest session's note…
`setAttendeeNote` edits ONE booking, so after a per-session edit only a note on the EARLIEST session reaches this
message. Known, recorded, and NOT fixed here."*
⇒ **The owner put a note on a booking that was not the earliest.** **The record was accurate and the decision was
wrong** — I optimised for not inventing an answer, and shipped a field that renders nothing on the path a human
actually takes.
📌 **@Porter insisted the check be run with a note PRESENT. A booking without one proved nothing; the first one
with a note found it in a minute.** **That instruction is the reason this is a defect and not a report from the
shop next month.**

## §2 The ruling — **the first non-empty note, in date order**
**Not `rows[0].attendeeNote`. The first row that HAS one.**
- ✅ **On the normal path it is identical:** TASK-178 puts one note at creation onto **every** session, so every
  row carries the same string and "first non-empty" is that string.
- ✅ **On the owner's path it now renders**, which is the whole point.
- ⚠️ **When a course carries DIFFERENT notes, it prints the earliest one.** 🚫 **Do not print several, do not
  join them, do not add "and 2 more".** **A course summary has no true answer to *"which session's note"*, and
  the earliest is at least a rule rather than an accident.** **Write that sentence in the comment.**
🔑 **The difference from `rows[0]` is small and it is the whole defect:** `rows[0]` answers *"the earliest
session's note"*; this answers *"the course's note, if it has one"* — **and only the second is what a reader of
`CONFIRMED SCHEDULE` would take it to mean.**

## §3 What must not change
- 🚫 `ob_f_note` = `Remark`, its position (last), and the omit-empty rule — **a course with no note anywhere still
  prints no line.**
- 🚫 The per-booking `ยืนยันตารางสอน` / `booking_confirmed` — **byte-frozen, owner-verified, and it is the message
  `REQ-007` is satisfied by.** **This task must not touch it.**
- 🚫 `setAttendeeNote`, `attendeeNote` on the booking, the payload's other fields.
- 🚫 No migration, no database, no FE change.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count**
- [ ] 🔑 **A note on a LATER session renders** — the owner's exact case, asserted
- [ ] **A note on every session renders that string** — the normal path, unchanged
- [ ] **Differing notes print the EARLIEST**, asserted, with the comment saying why it is a rule and not a guess
- [ ] **No note anywhere ⇒ no `Remark` line** — omit-empty still holds
- [ ] 🚫 `booking_confirmed` byte-identical — asserted
- [ ] 🚫 No migration, no database, no FE change

## Question
**Is `rows[0]?.x` used for any OTHER field on that payload?** `teacherId`, `subjectId` and `student` are read the
same way in `confirmCourse`. 📌 *For a course those are genuinely uniform, and the note was the one field that
is not* — **but I assumed that rather than checking it.** **Name any other field where the rows can differ; fix
none of them here.**

---

# ➕ §5 AMENDMENT — @Sober, 2026-09-09. **This task is now ALL THREE of `REQ-085 §3` / `§7.1`. The owner ruled on the whole message.**

**`uat` is out; this was *"first item after `uat`"* and it is now first.** 🔑 **The other two fixes are to the
SAME message, and two tasks a week apart on one message is the split we spent the night closing.**
🚫 Still no migration, no database, no FE change.

## ➕ (b) `Date` must be ENGLISH — and it names a **WEEKDAY**
> *"Date ให้เป็นภาษาอังกฤษ"* · 🔗 **`REQ-079 §18` already ruled notification labels English** ⇒ **`Date : อังคาร`
> is a standing defect, and he is asking for a ruling to be applied, not a new one.**
🔑 **`Date : Tuesday` — a WEEKDAY NAME, not a date.** ⚠️ **`REQ-085 §8.3`: *"worth stating because 'Date' naming a
weekday is surprising the first time you build it."*** ✅ **`§7.3` does the same, so it is the product's
convention rather than this message's quirk.**

## ➕ (c) `**Advance Leave Notice` ALWAYS prints — `(-)` when there is none
> 🔑 **The owner's reason IS the acceptance criterion:** **a field that vanishes when empty is indistinguishable
> from a field that was never sent.** ⇒ **`(-)` is the parent being told *we checked, and there is none*.**

## 🔴 §8.1 — THE TRAP, and it is the easiest mistake in the whole batch
**Two OPPOSITE empty-field rules, and BOTH fields sit at the bottom of THIS message:**
| field | when there is nothing |
|---|---|
| **`**Advance Leave Notice`** | 🟢 **ALWAYS PRINTS. Shows `(-)`.** |
| **`Remark`** | 🔴 **DOES NOT PRINT AT ALL** — *"(Note)\*ถ้ามี"* |
⚠️ **They are not arbitrary:** **a missing leave notice is something the parent must be able to trust we
CHECKED; an absent Remark is just an admin with nothing to say.**
🔑 **Each needs its OWN assertion. One test covering "empty fields" will not catch a swap** — **and a swap is
invisible to every reader who has not read this table.**

## ⚠️ "ENGLISH" MEANS **LABELS AND SYSTEM VALUES** — never a human's words
🔗 `REQ-085 §8.2`. **Read literally, *"eng ล้วน"* would romanise `น้องดีซี` and translate
`เตรียมเฉพาะ Freeskate ให้น้อง`.** **The customer's own examples keep both in Thai.**
✅ **Labels and SYSTEM-generated values are English** — `Date : Tuesday` not `อังคาร`; `(-)` not `ไม่มี`.
🚫 **CONTENT A HUMAN TYPED is reproduced EXACTLY as typed.** 🔑 **`Remark` is the admin's own sentence, and
translating it would be putting words in their mouth.**

## 📌 One definition site, because `REQ-086` is coming
**The customer will edit these messages themselves** (`REQ-086`, unblocked, not yet designed) — **and `§7.1`'s
text becomes its shipped DEFAULT.** ⇒ **give this message ONE definition site, shaped so it can become a row
later.** 🚫 **Do not build any template store, and do not change how any other message is composed.**
⚠️ **If that would mean restructuring the composer, STOP and say so** — **it is a note about where to put the
string, not permission to refactor.**

## ➕ Added to the Definition of Done
- [ ] 🔑 **`Advance Leave Notice` prints `(-)` when there is none** — asserted **on the empty case**
- [ ] 🔑 **`Remark` is ABSENT — the whole line — when there is no note** — asserted, **and asserted separately
      from the line above.** ⚠️ *Two assertions, because the rules are opposite*
- [ ] **`Date` renders an ENGLISH WEEKDAY** — asserted **by the word**, on a known date
- [ ] **A Thai student name and a Thai `Remark` are byte-identical to what was typed** — asserted. 🔑 *This is
      the assertion that stops "English only" being applied to a human's words*
- [ ] 🔑 **Break it and watch** — and **restore it, suite green before the number**
- [ ] 🚫 The per-booking `ยืนยันตารางสอน` message unchanged — asserted *(it already prints the note correctly, and
      `§7.3` replaces it in a LATER task, not this one)*

---

## ✅ RESULT 2026-09-09 — @Jason. tsc **0** · **1809 pass / 0 fail**, 144 files · 🚫 **35 `.sql` = 35 journal tags.**

All three of `REQ-085 §3` / `§7.1`, in one message and one shipment.

- [x] `tsc --noEmit` → **0** · `bun test` → **1809 / 0**, 144 files · 🚫 no migration, no database, no FE change
- [x] 🔑 **A note on a LATER session renders** — the owner's exact case
- [x] **A note on every session renders that string** — the normal path, unchanged
- [x] **Differing notes print the EARLIEST**, with the comment saying why it is a rule and not a guess
- [x] **No note anywhere ⇒ no `Remark` line**
- [x] 🔑 **`Advance Leave Notice` prints `(-)` when there is none** — asserted on the empty case
- [x] 🔑 **`Remark` is ABSENT — the whole line — when there is no note**, asserted **separately**
- [x] **`Date` renders an ENGLISH WEEKDAY** — asserted by the word, on a known date
- [x] **A Thai student name and a Thai `Remark` are byte-identical to what was typed**
- [x] 🔑 **Break it and watch** — both halves; restored, suite green before this number
- [x] 🚫 `booking_confirmed` byte-identical — asserted

New: `courseNote` and `TEMPLATE_LANG` / `TEMPLATE_NONE` (both named, both pure), and
`src/lib/confirmed-schedule-req085.test.ts` (12 tests).

### (a) 🔻 The limitation I documented and chose not to fix
`courseNote(rows)` — **the first NON-EMPTY note, in date order** — replaces `rows[0]?.attendeeNote`. Extracted
and named rather than left inline, so the rule is testable without a database and so the sentence explaining it
has somewhere to live.
📌 **Date order is now the CALLER's stated guarantee** (`loadCourseForEnd` orders `asc(date), asc(startTime)`);
passing unordered rows would make *"earliest"* mean *"whichever the database returned first"*, and that is
written where someone would otherwise pass them.
⚠️ Whitespace is not a note: `"   "` must not become `Remark : ` — a label with nothing after it, which
TASK-219 established reads as information that went missing.

### (b) `Date : Sunday` · (c) `**Advance Leave Notice : (-)`
Both are **values WE generate**, so both follow the template's convention. `TEMPLATE_LANG` and `TEMPLATE_NONE`
sit in `line-message-fields.ts`, beside the customer's labels and their ` : ` separator — 🚫 **not a template
store, two constants**, which is the one definition site §5 asks for without restructuring anything.
🔑 **`REQ-079 §18` had already ruled labels English; `Date : อังคาร` was that ruling never applied to a VALUE.**

### 🔴 §8.1's trap — asserted separately, and the swap is caught
Three assertions, not one: the leave line **always prints**, the `Remark` line **is absent entirely**, and a
third with **both** empty where one survives and the other does not. ✅ **Break it and watch:** making the leave
line vanish when empty — the exact swap §8.1 warns about — fails the *always prints* assertion by name, and
would have passed any single "empty fields" test.
✅ **And the other half:** restoring `rows[0]` reproduces the owner's screen exactly — `Expected "23232sssss",
Received null`, no `Remark` at all.

### ⚠️ One consequence worth stating plainly: **the message is now language-INVARIANT**
Every remaining piece is a label, a value we generate, or a human's own words ⇒ **`TH` and `EN` render byte-for-
byte the same.** That is the ruling rather than an accident, and it is asserted so a translation creeping back
into any of them fails.
🔻 **Two tests asserted `th !== en` on this message.** That was a **PROXY** for *the switch still switches*; the
real property is that no notification renders BOTH languages. Both are kept — the proxy moved to
`booking_confirmed`, whose `ob_l_*` labels are bilingual and byte-frozen — and the invariance is now asserted as
the fact it is. **Seven tests in total were pinning the Thai weekday or `ไม่มี`; all corrected with the reason,
none deleted.**

### 🔑 The Question — **`Coach` is the other field, and it has no guard**
| payload field | from | can the rows differ? |
|---|---|---|
| `note` | `rows[0]?.attendeeNote` | 🔴 **yes — this task** |
| **`coach`** | `rows[0]?.teacher` | 🔴 **YES, and nothing prevents it** |
| `subject` | `rows[0]?.subject?.name` | ✅ no — **guarded twice** |
| `student` | `rows[0]?.student` | ✅ no — every row is created with the course's `studentId` |

🔴 **`coach` can differ two ways:** `createCoursePackage` accepts a per-session `teacherId` in `sessions[]`, and
`planChange`'s `move` accepts one (TASK-094's teacher-change rule exists precisely because it happens).
📌 **The contrast is the useful part:** `subject` is safe **by construction** — SPEC-045/TASK-138 refuses a mixed
course in the zod refine *and* again in the service — while **`coach` has no equivalent rule anywhere.** So a
course taught by two teachers prints the earliest session's coach on `CONFIRMED SCHEDULE`, and unlike the note
it will not look empty; **it will look confidently wrong**, which is harder to notice.
🚫 **Fixed none of them**, as instructed. ⚠️ Whether a course summary should name several coaches, or the
course's main one, is a customer question and not mine.

**BALL: @Sober — TASK-284 ready for review. ⛔ Nothing else is on me.**
