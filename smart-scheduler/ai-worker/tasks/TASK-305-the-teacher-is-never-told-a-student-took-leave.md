# TASK-305 — the teacher is never told a student took leave (`REQ-085 §2` + `§7.4` + `§9.1`)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-09)
📌 **No clock.** 🚫 No migration, no FE change. **Last of the four `§7` formats — and the only one that is a NEW
message rather than a re-wording.**
🔴 **The owner has raised this twice:** *"ของแจ้งเตือนครูเด็กลายังไม่ขึ้น"*, and earlier
*"ทำไมของครูไม่มีบอกเหมือนกันกับผปค"*.

---

## §1 The defect, in one sentence
**A parent declares leave. The parent is notified. THE TEACHER IS NOT.** ⇒ 🔴 **a coach can arrive for a session
the student cancelled**, and the admin — who covers every coach — learns nothing either.

## §2 The message — `REQ-085 §9.1`, the owner's FINAL shape
```
LEAVE NOTICE
Student : น้องดีซี
Program : Private Freeskate 6 HR
Date :
Time :
Coach :
Remark : เตรียมเฉพาะ Freeskate ให้น้อง
```
✅ **`LEAVE NOTICE` in ENGLISH** — the owner's `§9` ruling; **the Thai `แจ้งลา` in `§7.4` is SUPERSEDED.**
✅ **`Coach` and `Remark` were ADDED by that ruling** — `§7.4`'s original block carried neither.

## §3 🔑 WHO receives it — and who deliberately does not
> *"เฉพาะแชทครู / แอดมิน"*

| | |
|---|---|
| **the teacher's chat** | ✅ |
| **the admin chat** | ✅ |
| 🚫 **the parent** | **NO — they are the one who declared it.** *Telling them what they just did is noise, and the product already confirms the leave to them.* |

🔑 **`Coach` earns its line for the ADMIN, not the teacher** — the owner's reasoning, and it is the acceptance
criterion: **the teacher receives this in their OWN chat and already knows it is theirs; the admin receives every
coach's.** ⇒ **without `Coach`, three leaves from three teachers in one day arrive as three identical-looking
messages.**
⚠️ **So a test that only checks the teacher's copy proves half the requirement.**

## §4 🔴 `Remark` here is `*ถ้ามี` — and this message contains ONLY that rule
🚫 **No `(-)` anywhere on it.** ⚠️ **`§9.1` explicitly warns: *"`Remark` follows the `§8.1` rule — `*ถ้ามี`, NOT
the `-` rule."*** 🔑 **Fourth message running where the risk is carrying a rule across, and this is the one the
requirement itself felt the need to warn about.**
📌 **Its value here is specific and worth building for:** a Remark is usually about PREPARATION
(*"เตรียมเฉพาะ Freeskate ให้น้อง"*) ⇒ **a coach who learns of a leave also learns there is nothing to prepare.**

## §5 ⚖️ A ruling, and the one thing I want @Porter to confirm afterwards
**`Date` renders an ENGLISH WEEKDAY**, as `§7.1` and `§7.3` do. **The customer's block shows `Date :` with no
value, so there is nothing to follow — the product's convention decides it.**
⚠️ **I am flagging my own doubt rather than hiding it:** **a leave can be declared WEEKS ahead**, and
*"Date : Tuesday"* for a leave three weeks out tells a coach very little. 🔑 **Build the convention** — 📌 **if
the customer says they need the calendar date, it is one line, and I would rather change one line than ship a
fourth date format.**

## §6 What must not change
- 🚫 **WHO may declare leave, the quota, `plannedAtCreation`, the make-up, the ceiling** — **nothing about the
  MECHANICS of leave.** **This task ADDS a notification and changes nothing else.**
- 🚫 The parent's existing leave confirmation — **byte-identical, asserted.**
- 🚫 `§7.1` (284) · `§7.3` (303) · `§7.2` (304) — **all three pinned; assert they still are.**
- 🚫 The outbox, `formatOutboxMessage`, `TEMPLATE_FIELDS` semantics · a human's own words (`§8.2`).
- 🚫 No migration · no FE change.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count** · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **The message pinned BYTE-FOR-BYTE** against `§9.1`'s block
- [ ] 🔑 **BOTH recipients asserted** — the teacher's chat AND the admin chat ⚠️ **a teacher-only test proves half
      the requirement**
- [ ] 🔑 **The PARENT does not receive it** — asserted **as an absence**. *This is the assertion that keeps it a
      notification and not a broadcast*
- [ ] **`Coach` is present and correct on the ADMIN's copy** — 📌 *the reason the field exists*
- [ ] 🔑 **`Remark` absent entirely when there is no note**, and ⚠️ **`(-)` never appears on this message**
- [ ] **`Date` renders an ENGLISH WEEKDAY** — asserted by the word
- [ ] **The parent's existing leave confirmation is byte-identical** — asserted
- [ ] 🔑 **Break it and watch** — restored, suite green before the number
- [ ] **Say WHEN it fires** — every path that sets `SICK_LEAVE`, or only some. ⚠️ **If some paths do not notify,
      NAME them rather than leaving it implied**

## Question
🔴 **`SYSTEM-FACTS` says leave is ONE state with SIX PRICES, and this task adds the sixth — the notification.**
📌 *Until today that row read "parent only".*
🔑 **A leave can be set from several places** — the plan editor, a per-session action, an advance declaration at
creation, a re-plan. ⇒ **do all of them go through one write, or several?**
⚠️ **If it is one, say so and the notification has one home.** 🔴 **If it is several, that is the finding** —
**because a notification wired to some of them is a teacher who is told SOMETIMES**, which is worse than never:
**never is a gap people learn to work around; sometimes is a promise that fails silently.**
🚫 **Name it. Do not restructure anything.**

---

## ✅ RESULT 2026-09-09 — @Jason. tsc **0** · **1839 pass / 0 fail**, 147 files · 🚫 **35 `.sql` = 35 journal tags.**

- [x] 🔑 **Pinned BYTE-FOR-BYTE** against `§9.1`'s block
- [x] 🔑 **BOTH recipients asserted** — the admin chat AND the teacher's, from **one payload object**
- [x] 🔑 **The PARENT does not receive it** — asserted as an absence
- [x] **`Coach` present and correct**, and asserted on the fuller (admin) audience too
- [x] 🔑 **`Remark` absent entirely with no note**, and ⚠️ **`(-)` never appears**
- [x] **`Date` renders an ENGLISH WEEKDAY** — asserted by the word
- [x] **The parent's existing leave confirmation is byte-identical** · **§7.1 and §7.3 still pinned**
- [x] 🔑 **Break it and watch** — restored, suite green before this number
- [x] 🚫 No migration, no FE change, and nothing about the MECHANICS of leave

New: `leave_notice` (template + title + renderer), `src/lib/leave-notice-req085.test.ts` (11 tests).

### §1 🔻 It was not un-built. It was gated off.
A teacher notification already existed — **`kind: "leave_teacher"`, wrapped in
`if (notifyOnLeave === "admin_and_teacher")`, and `notify_on_leave` defaults to `admin_only`.**
⇒ **on a default install that branch never ran**, which is exactly why the owner raised it twice and why it read
as missing. 📌 **A feature behind a default-off setting is indistinguishable from a feature nobody wrote** —
and this one had a comment explaining the default, so it was deliberate and still wrong for what he asked for.
🔑 **His ruling is unconditional** (*"เฉพาะแชทครู / แอดมิน"*), so the setting no longer gates the send.
⚠️ **`notify_on_leave` is now UNREAD by any code path.** Its spec row still exists (`lib/settings.ts:79`) and the
settings screen still offers it. **I did not delete it** — whether it goes or gets repurposed is yours, and a
setting that silently does nothing is the shape we spent this week naming. **Named, not removed.**

### §2 One payload, two sends
`leavePayload` is built once and handed to `notifyAdmins` and to the teacher's `enqueueLine` — **so a coach and
an admin can never read different versions of one leave.** The teacher send is non-throwing: `enqueueLine`
writes a SKIPPED row when the coach has no LINE link, so a leave never fails because of a notification.
📌 `bookingType` and `size` ride on the payload for the same reason as TASK-303: `MessageContext` carries
neither, and without them a COURSE session's `Program` reads `1 HR`.

### §3 ✅ Break it and watch
Removing the teacher send — leaving the admin's, **which is precisely the state that shipped** — fails the
both-recipients assertion and nothing else. 🔑 **That is the half-requirement §3 warned about, reproduced: the
admin-only build looks entirely functional from the admin's side.**

### 🔴 The Question — **FOUR writes set `SICK_LEAVE`, and ONE notifies. This is the finding.**
| # | path | notifies |
|---|---|---|
| `scheduler.service.ts:1703` | **declared at creation** (`absentWeeks`, `plannedAtCreation`) | ❌ nothing |
| `:2382` | **the plan editor**, `mark-absence` | ❌ nothing |
| `:2749` | **attendance correction**, `ATTENDED → SICK_LEAVE` | ❌ nothing |
| `:2810` | `updateBookingStatus` action `sick-leave` | ✅ **this task's `LEAVE NOTICE`** |

⇒ 🔴 **A teacher is now told SOMETIMES**, which is the thing you named as worse than never. Being precise about
how bad, because the three silent paths are not equal:
- **Creation-time declaration** — the leave is declared *before the course exists*; the teacher has not been
  told of the class yet either, so there is nothing to correct. **Arguably fine.**
- **Attendance correction** — the class already happened; the coach was there. A notice would be about the
  past. **Arguably fine, and its own branch says so.**
- 🔴 **The plan editor's `mark-absence` is the real hole.** It cancels a FUTURE session exactly as the
  per-session action does, and an admin using the plan editor is doing the same thing by a different door.
  **That is a coach arriving for a cancelled class, with the notification working.**

🚫 **Restructured nothing and wired nothing**, as instructed. 🔑 **My read: it is one path, not three, and it is
`:2382`** — which makes this smaller than "four writes" sounds, and I would rather say that than hand you a
number with no shape.

### §5 ⚖️ Your date doubt — I share it, and the convention is built
`Date : Tuesday` for a leave declared three weeks out tells a coach very little, and this message is the one of
the four most likely to be about a distant date. **Built to the convention as ruled**, and it is the one line
you said it would be if @Porter comes back with the calendar date.

**BALL: @Sober — TASK-305 ready for review. ⛔ Nothing else is on me.**
