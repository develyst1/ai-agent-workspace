# TASK-370 — LINE to the TEACHER when a CONFIRMED class is cancelled or paused (`REQ-089 §6`, item 7) — BE, copy GATED

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-16)
**Owner rulings (`REQ-089 §6`):** per-COURSE one message for the bulk paths (a drop cancels N sessions), per-SESSION for the single paths; fields **student · date · time · reason**; both languages; unlinked teacher ⇒ `skipped`. 🔴 **STYLE is a hard constraint: the message MUST mirror the existing outbox house format** — the `REQ-085 §7` confirm/leave layouts and `LEAVE NOTICE / แจ้งลา` (header stamp, field order, emoji discipline, two-language block). **No new phrasing.**
🔴 **GATE: the drafted COPY (both languages, both shapes) goes to me BEFORE the send path is finalised — @Porter shows the owner ONCE. Build the plumbing with the copy as PLACEHOLDER keys; the words land after his eye.**
**Size M.** ⛔ Chain stopped. Batch 4/5/7.

---

## §1 The prior facts (verify)
- Teacher sends exist: `enqueueLine({ recipientType: "teacher", … })` (`scheduler.service.ts:2473`, `:2648`), non-throwing, `SKIPPED` when unlinked (`:2447`). The teacher-facing kind to MIRROR is `leave_teacher` (`line-message.ts:484`, `ob_leave_teacher` in `line-i18n.ts:560`): student · date · time · program — the house shape.
- **The paths:** single cancel = `updateBookingStatus` → `CANCELLED` (`:2678`, the write at `:2866`); single pause = `pauseBooking` (`:3771`); **bulk = `dropCourse` (`:4021`)** — the course "pause" in the customer's words IS the drop (REQ-076/084 vocabulary). ❓ `endCourse` (`:4209`) also cancels the rest — the owner named cancel/pause; **say whether an END should tell the teacher too and build it only if the answer is obviously yes by the same rule (a confirmed class the teacher was expecting vanishes)** — otherwise list it.
- **"CONFIRMED" is the gate:** only a session whose status WAS `CONFIRMED` before the change earns a message (a PENDING one the teacher never held). For the bulk path: one message per course IF at least one cancelled session was CONFIRMED; it lists the confirmed ones (dates), count included.

## §2 The contract (kinds; the `formatOutboxMessage` discipline)
- Two new kinds — **`class_cancelled_teacher`** (single: cancel or pause, `reason` says which and carries the cancel reason/note) and **`course_dropped_teacher`** (bulk: student, program, count, the dates, reason). 14 → 16 kinds; `TEMPLATE_FIELDS`/`TYPE_OMITS`/`AUDIENCE_OMITS` extended; the ONE trim at the exit; the output-shaped checks (`no-placeholder-leak`, `no-iso-date-leak`, trailing) cover them by construction — assert they DO (a new kind that the walkers do not reach is the defect).
- `reason` = the closed code's label where there is one, else the note, else `-` — the same rule the parent's own message uses (name the function; one source).
- Dates via `ddmmyyyy`; time via the existing helper; the bulk list capped at… ❓ say what the house format does for a list (the daily digest is the precedent).
- 🚫 No message to the PARENT changes; the existing parent sends on these paths untouched, asserted.

## Definition of Done
- [ ] Contract + **DRAFTED COPY (TH+EN, both kinds) in `inbox/SA.md` FIRST** — mirroring `ob_leave_teacher` and the `§7` layouts line for line; I forward to @Porter
- [ ] Suite, **count** · tsc · **35 = 35**
- [ ] Pinned: single cancel of a CONFIRMED ⇒ one teacher row; of a PENDING ⇒ none · pause ⇒ one, says paused · drop with 3 CONFIRMED + 2 PENDING ⇒ ONE row naming 3 dates · unlinked ⇒ `SKIPPED` · parent sends unchanged (count pins)
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ A cancelled session that is later RESTORED (a move, an un-cancel path if one exists) — does the teacher get told again? Say what paths can bring a `CANCELLED` back; build nothing.

---

## §3 📋 CONTRACT + COPY — verified against the tree; FOUR corrections to §1, then the copy (@Jason, 2026-09-16, before building)

🔴 **Correction 1 — the single PAUSE already tells the teacher.** `pauseBooking` sends `booking_paused` (`ob_paused`: *"คาบนี้ถูกพักไว้ชั่วคราวค่ะ — {student} · {date} {time} · ยังไม่มีกำหนดใหม่"*) — TASK-260, @Porter's copy VERBATIM from the REQ, owner-approved. **I build no second pause message: two messages for one pause would be the defect.** Two deviations from today's ruling, reported not changed: it fires for any pausable status (PENDING too, not only CONFIRMED), and an unlinked teacher gets NO row rather than a SKIPPED one (`if (current.teacher?.lineUserId)`). Both are one-line changes if you rule them in; the shipped copy stays byte-frozen either way.
🔴 **Correction 2 — the single CANCEL sends nothing to anyone today.** No parent message, no teacher message (`updateBookingStatus`'s cancel branch has no `enqueueLine`). So "the parent sends on these paths unchanged" is pinned as ZERO, and the new teacher row is the first send on that path.
🔴 **Correction 3 — the kind to mirror is `leave_notice`, not `leave_teacher`.** `leave_teacher` (`ob_leave_teacher`) and `sick_leave` are DEAD (TASK-344's inventory, TASK-333's list); the LIVE teacher-facing house shape is `leave_notice`: the `LEAVE NOTICE / แจ้งลา ‼️` stamp + `renderFieldBlock` (`Student : / Program : / Date : / Time : / Coach :`) + the `extra`-shaped `Remark :`. The copy below mirrors THAT.
🔴 **Correction 4 — no reason-label rule exists to reuse** (see the copy's last paragraph): one new function, the one source.

✅ **The kinds:** `class_cancelled_teacher` (single cancel of a CONFIRMED) and `course_dropped_teacher` (drop or end; the payload's `cause` picks the header). **15 → 17 `case`s** in the switch — the three output-shaped walkers (`no-placeholder-leak`, `no-iso-date-leak`, `message-trailing`) pin the count at 15 and will MOVE to 17: that is them reaching the new kinds, and I rewrite the number with the reason, as TASK-334 did (14 → 15). Two new `TemplateKey`s (`class_cancelled`: student · program · date · time · coach; `course_dropped`: student · program · coach) in `TEMPLATE_FIELDS`; `TYPE_OMITS` / `AUDIENCE_OMITS` gain nothing (a cancel of a 1HR omits `remaining`/`expiry` already — neither template lists them). The ONE trim at the exit covers them by construction.
✅ **The gate:** single — only when `current.status === "CONFIRMED"` before the write. Bulk — the cancelled rows filtered to those that WERE `CONFIRMED`; none ⇒ no row; **grouped by teacher** (a re-teachered course has sessions under two coaches — each gets one message naming HIS dates), one `enqueueLine` per teacher, `bookingId` = the first of that teacher's dates so the worker's enrichment has a row.
✅ **END tells the teacher too — built, by the same rule:** `endCourse` cancels every live row with the note *"ยกเลิกคอร์ส (จบคอร์สก่อนกำหนด)"* — a confirmed class the coach was expecting vanishes exactly as on a drop; the only difference is the header word, so it is the same kind with `cause: "ended"`. If you rule it out it is one call site removed.
✅ **Unlinked ⇒ `SKIPPED`** by `enqueueLine` itself (`recipientLineUserId: null` writes the SKIPPED row, "no line userId") — nothing to build.
🚫 **Untouched, asserted:** every existing `enqueueLine` on these paths (count pins: cancel 0 before → 0 parent after; pause's one `booking_paused`; drop 0 → the new one; end 0 → the new one); `ob_paused` byte-frozen.
📌 **Your owner's-list question — what brings a `CANCELLED` back: nothing.** The only un-cancel-shaped paths are `resumeBooking` (PAUSED → CONFIRMED, and it already sends `booking_resumed` to the teacher) and `resumeCourse` (a dropped course gets NEW rows through the create path, whose confirm sends `booking_confirmed` to the teacher). A `CANCELLED` row is never revived (`:3079` — "never un-cancels"). So the coach is told again on every restore that exists, today, by TASK-260 and the confirm path. Nothing to build.

### 📝 THE DRAFTED COPY — placeholders MINE, the customer has NOT seen them (both languages, both kinds)
**Mirrors `leave_notice` line for line:** the bilingual header stamp with `‼️`, the customer's `Label : value` block in the customer's field order (`Student · Program · Date · Time · Coach`), then the appended lines in the same `extra` shape as `Remark`. The header is Thai-and-English in BOTH languages, exactly as `LEAVE NOTICE / แจ้งลา ‼️` is — the audience is coaches, never a parent. `(-)` for an absent value, the house `TEMPLATE_NONE`. Dates `DD-MM-YYYY`. **New words are ONLY the three header stamps, the `Reason` label, and the three reason-code labels — everything else is an existing key.**

**Kind 1 — `class_cancelled_teacher` (single cancel of a CONFIRMED class):**
```
CLASS CANCELLED / ยกเลิกคาบ ‼️
Student : น้องเอ
Program : Skate 6 HR
Date : 22-09-2026
Time : 10:00-11:00
Coach : Camp
Reason : ลูกค้ายกเลิก
```
EN: identical labels (the customer's are English in both languages); header identical; the reason value in English (`Customer cancelled`).

**Kind 2 — `course_dropped_teacher` (a drop OR an end that cancels ≥ 1 CONFIRMED class; one message per course per teacher):**
```
COURSE PAUSED / พักคอร์ส ‼️          ← an END prints  COURSE ENDED / ยกเลิกคอร์ส ‼️
Student : น้องเอ
Program : Skate 6 HR
Coach : Camp
Sessions : 3
Date : 22-09-2026, 29-09-2026, 06-10-2026
Time : 10:00-11:00
Reason : พักคอร์สชั่วคราว
```
`Sessions` = the count of CONFIRMED classes this coach loses (existing key `ob_f_sessions`); `Date` = those dates joined with `, ` — the `**Advance Leave Notice` list's own join (`§7.1`), the one precedent for a list of dates in the customer's block; `Time` = the slot (distinct times joined the same way if a course was ever re-slotted). **No cap on the list:** the digest's precedent (`DIGEST_LIST_LIMIT` 5 + *"+ อีก n รายการ — ดูในเว็บแอป"*) points to the web app, which a coach cannot open, and a course has at most `size + absences` rows — every date prints.

**The reason value — one new function, `cancelReasonText`, the ONE source:** the closed code's label when the code is one of `END_REASONS` (**`PROGRAM_CHANGED` → `เปลี่ยนโปรแกรม` / `Program changed` · `CUSTOMER_CANCELLED` → `ลูกค้ายกเลิก` / `Customer cancelled` · `ADMIN_ERROR` → `จองผิด (แอดมิน)` / `Booking error (admin)`** — placeholders, gated), else the human note (`bookings.note` — for a drop that is `พักคอร์สชั่วคราว`, for an end `ยกเลิกคอร์ส (จบคอร์สก่อนกำหนด)`, both existing strings), else `(-)`. 🔻 *Your §2 said "the same rule the parent's own message uses" — there is no such rule: no parent message carries a reason today and `END_REASONS` has no label anywhere in the repo. The function is new and it is the only one.*

▶️ **Building the plumbing now with these keys as placeholders (the `ob_deduct_title_voucher` convention: the FORM is pinned, the bytes are not); the words land after the owner's eye.**

---

# 📤 REPORT — @Jason → @Sober (2026-09-16)

✅ **PLUMBING DONE (code); the WORDS remain gated on the owner's eye.** **2215 pass / 0 fail**, **179 files** (+1) · `tsc --noEmit` clean · 🚫 **no migration (35 = 35)**.

## §4 What was built
- `line-i18n.ts`: the placeholder keys, marked as MINE and unseen — three stamps (`ob_class_cancelled_title`, `ob_course_dropped_title`, `ob_course_ended_title`), `ob_f_reason`, and `ob_reason_<code>` for exactly the three `END_REASONS`.
- `line-message-fields.ts`: two `TemplateKey`s — `class_cancelled` (= `leave_notice`'s field list, asserted equal) and `course_dropped` (student · program · coach). `TYPE_OMITS` / `AUDIENCE_OMITS` unchanged — neither lists `remaining`/`expiry`.
- `line-message.ts`: **`cancelReasonText(code, note, lang)`** exported — the one reason rule; two `case`s in the switch (15 → 17), both `leave_notice`'s shape: stamp, `renderFieldBlock`, `extra`-shaped appended lines (`Reason`; for the bulk one `Sessions` · `Date` list joined `, ` · `Time` · `Reason`). The ONE trim covers them.
- `scheduler.service.ts`: `confirmedOnly`, **`sendClassCancelledToTeacher`** (returns `null` unless the pre-write status was `CONFIRMED`) wired into the cancel branch as its `notification`; **`sendCourseDroppedToTeachers`** (confirmed rows grouped by `teacherId`, one `enqueueLine` per coach, `bookingId` = his first date, the slot on the payload) wired into `dropCourse` (`"dropped"`, note = `COURSE_PAUSE_NOTE`) and `endCourse` (`"ended"`, `cancelReason` = the end reason). `pauseBooking` untouched.
- 🔻 **Eight pins moved, each with the reason written beside the number:** the three output walkers' `15 → 17` (five assertions — `no-placeholder-leak` ×2, `no-iso-date-leak`, `message-trailing` ×2: *that is them reaching the new kinds*); TASK-332/337's `|| undefined` survivor count `6 → 8` (the two notices mirror `leave_notice`'s own `studentName` line — same shape, same reason); TASK-318's *"`Sessions :` is gone"* re-scoped to the `course_confirmed` region (the bulk notice prints its own `Sessions :`, a different figure in a different message); and `message-time-format`'s `Record<TemplateKey>` refused to compile until both templates declared where their `Time`'s two ends are formatted — the sixth and seventh time that control has fired.

## §5 Pinned (`lib/teacher-told-on-cancel-req089.test.ts`, 16 tests)
- **The reason rule with values:** every closed code has a TH and an EN label, they differ, and neither is the raw code · no code ⇒ the note · blank note ⇒ `(-)` · an unknown code is not a label.
- **The single notice's FORM:** line 0 matches `^[A-Z ]+ / \S+ ‼️$` (the `LEAVE NOTICE / แจ้งลา ‼️` shape — words not frozen); lines 1–6 are exactly `Student : มะขิด` · `Program : Freeskate 6 HR` · `Date : 22-09-2026` · `Time : 12:00-13:00` · `Coach : Ek` · `Reason : <label>`; EN identical labels and stamp, the reason in English; a 1HR prints `Freeskate 1 HR` and falls back to the note; **the `leave_notice` twin renders the identical block for the same session.**
- **The bulk notice's FORM:** `Sessions : 3` · `Date : 22-09-2026, 29-09-2026, 06-10-2026` · `Time : 12:00-13:00` · `Reason : พักคอร์สชั่วคราว`; an END prints a different stamp and the closed reason's label; **twelve dates all print, no "more"**; an empty list prints no bare label.
- **Wiring:** the gate line; the cancel branch has ZERO `enqueueLine` (the parent was not told before and is not now) and one call to the sender; the bulk groups by coach with one `enqueueLine`; drop and end call it after their cancel loops with the pre-write rows; **`pauseBooking` has exactly its one `booking_paused` send and `ob_paused` is byte-frozen**; both senders pass `teacher?.lineUserId ?? null` and never branch on it; the i18n block says PLACEHOLDERS and the reason labels cover exactly `END_REASONS`.

## §6 🔑 Mutation — seven, `finally`, checksum — all bite
A the single gate dropped (a PENDING cancel pages the coach) · B the bulk gate dropped · C the end path silenced · D the reason rule leaks the raw code · E the bulk list prints raw ISO dates (2 fail — the task's pin and the form pin) · F the single template drops `Coach` (3 fail — the block no longer equals `leave_notice`'s) · G a second pause message added to `pauseBooking` (1 fail). Every restore byte-identical.

## §7 🔻 One correction to my own §3
I called the pause's *"unlinked ⇒ no row"* a deviation. It is not: the code's own comment is **SPEC-072 AC-7 — an ENQUEUE rule: no teacher ⇒ no row at all**, because a SKIPPED row *"would read as we tried to reach someone when there was nobody to reach"*. The new kinds follow the leave notice's convention instead (SKIPPED via `enqueueLine`, so the outbox shows the attempt) — two conventions exist in the tree and each has a reason; I have not unified them. Say which one item 7 wants and it is one line either way.

## §8 ❓ Open for the owner (unchanged from §3): the WORDS
Three stamps, one label, three reason labels — everything else is an existing shipped key. The send path is final; the strings are the only thing his eye changes.

---

# 📤 REPORT (strings landed) — @Jason → @Sober (2026-09-16)

✅ **The owner's words are LIVE — markers off, bytes unchanged.** The seven string lines' fingerprint before and after: `e1f188a5…` = `e1f188a5…` (md5 over the seven `ob_*` lines) — **0 bytes of copy changed.** Three comment blocks rewritten (`line-i18n.ts`'s placeholder note → *"APPROVED by the owner as drafted (`§6.1`), END path kept (`§6.2`) … byte-frozen from here — the `ob_deduct_title` convention"*; the matching sentences in `line-message.ts` and `scheduler.service.ts`). **Count: 7 keys, 14 values** — three stamps, one label, three reason labels, TH + EN each.
🔒 **Byte-frozen in the test now** (the convention once the owner has seen them): a `FROZEN` table of the 7 × 2 values asserted through `t()`; the single stamp asserted by bytes as well as by form; the placeholder marker asserted ABSENT. Mutation F above (a stamp drifting by one byte) fails two tests. **2213 / 0**, tsc 0, 35 = 35. END path kept as built.
