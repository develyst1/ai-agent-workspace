# TASK-487 — 🔴 a co-teacher's class is in Monday's digest and MISSING from `ตารางของฉัน` — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size S.** No migration expected. Found by you in TASK-486 and **not** fixed there, correctly — it is a different defect from the format.

## §0 The defect, in the terms that matter
The teacher **reply** (`ตารางของฉัน`, today and week) reads **primary-teacher rows only**. The **Monday digest** includes **additional teachers**. Same coach, same week, two answers.
⇒ **A coach who is the second teacher on a class sees it in Monday's message and does NOT see it when they open their own schedule.**

🔴 **This is the EXTENDED gap wearing different clothes: a coach is not shown a class they are teaching.** It is worse in one respect — the two surfaces **disagree with each other**, so the coach who notices does not learn "my schedule is incomplete", they learn "the app is unreliable", which is a more expensive belief to fix. And the one who does not notice simply does not turn up.
📌 And it is the sharper version of what we have now seen three times this week: **the defect was never in the thing being changed.** TASK-486 changed a format and, by putting the two readers side by side for the first time, exposed that they were reading different data all along.

## §1 The ruling: the REPLY is wrong, not the digest
A coach teaching a class must see it in **both**. The digest's rule (primary **and** additional teachers) is the correct one; the reply's is the bug.
⚠️ **But do not simply copy the digest's `where` across.** Establish first, and say in your report:
- **which read is the older one**, and whether the reply's primary-only filter was a decision or an omission (a comment, a task number, or nothing — say which);
- whether anything **else** reads the teacher's own sessions on the same assumption — the calendar link, the reminder, the check-in scan, the scope in REQ-097. 🔑 **If a fourth reader exists with a fourth answer, I want it named before anything is changed.** One shared predicate would then be the fix, not three edits.

## §2 Build
- The reply's read includes **additional teachers**, matching the digest — ideally as **one shared predicate both call**, for the same reason TASK-486 made one formatter: two readers of "my classes" will diverge again otherwise.
- 🔑 **Pinned by value, and this is the point:** a session where the coach is the **additional** teacher appears in **`ตารางของฉัน` (today AND week) and in the digest** — the same row, from both doors. A mutation restoring the primary-only filter must bite.
- **The primary teacher's view is unchanged** (pin it): nobody loses a row.
- ⚠️ **Say what a co-taught row looks like** — it renders through TASK-486's formatter like any other, and if two coaches see the same class in their own schedules that is correct. If the rendering carries anything that implies sole ownership, tell me.
- 🚫 No change to the format, to the digest's audience, or to REQ-097's scope rules. **If the fix would widen what a coach can SEE beyond their own classes, stop** — that is a scope decision and it is mine, not the task's.

## Definition of Done
- [ ] The co-taught row present in the reply (today **and** week) and the digest, by value · **one shared predicate** if that is the honest shape (say either way) · the primary view pinned unchanged · the other readers of "my sessions" **enumerated and stated**, and any fourth answer named rather than fixed · suite **count** · tsc 0 · 57 = 57 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation restoring the primary-only filter and one that widens the read past the coach's own classes · report here + `inbox/SA.md` + log.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-26) — an OMISSION, not a decision; FIVE readers, TWO answers (no fourth); the fix is the predicate that already existed; 3155 pass / 0 fail; 5/5 mutations bite

**Numbers:** `bun test` **3155 pass / 0 fail** (+7; new `src/services/co-taught-my-schedule-req109.test.ts`) · `tsc` **0** · **57 = 57** · 🚫 no change to the format, the digest's audience, or REQ-097's scope rules.

## §1 Decision or omission? **Omission.**
- The reply's read (`findBookingsForTeacher`, `eq(b.teacherId, teacher.id)`) is **the older one**: it dates from the first teacher schedule, commit `52e06ef` (2026-07-30, "implement teacher schedule rendering"). That was before **additional teachers existed at all** (`booking_teachers`, TASK-228).
- It carried **no comment and no task number** about the choice. When TASK-228 arrived it taught the daily reminder about additional teachers ("so an อื่นๆ session appears on every assigned teacher's schedule") and **missed this read**. TASK-271 later edited the same query for PAUSED and didn't touch the teacher filter either.

## §2 Every reader of "a coach's own classes": FIVE readers, TWO answers
| # | Reader | Rule before | How |
|---|---|---|---|
| 1 | `ตารางของฉัน` reply (`findBookingsForTeacher`) | ❌ **primary only** | SQL `eq(teacherId)` |
| 2 | 🔴 **the phone-calendar ICS feed** (`findBookingsForCalendarToken`) | ❌ **primary only** | SQL `eq(teacherId)` |
| 3 | the daily reminder (TASK-228) | ✅ primary + additional | in memory, over `additionalTeachers` |
| 4 | the Monday digest (TASK-441) | ✅ primary + additional | in memory, over `additionalTeachers` |
| 5 | the admin calendar/list for a linked coach (REQ-097, TASK-406) | ✅ primary + additional | **`ownScopeWhere`, THE predicate** |
- 📌 **No fourth ANSWER exists.** The calendar feed is a **second reader with the reply's same wrong answer**: a coach subscribed on their phone was not shown a co-taught class either. The check-in scan doesn't read a coach's classes (it is keyed by token).
- **One shared predicate already existed** (`ownScopeWhere`, pinned as SQL in `teacher-own-calendar-req097`: `teacher_id = me OR EXISTS booking_teachers(me)`). So **the fix was not three edits but two call sites moved onto it.** I fixed the feed as well, because it is the same defect and the same one-line move. If you wanted it cut separately, it is one line to revert.
- The two bulk jobs (3 and 4) express the same rule in memory, because they group EVERY teacher's rows in one pass rather than asking "mine". They're consistent with the predicate and I left them alone. The co-taught test pins that the digest and the reply now return the same row.

## §3 By value (the same co-taught row through every door)
Fixture: one class with T1 primary and T2 additional, plus a class of T3's.
- **T2 (additional):** the reply TODAY ⇒ the class; the reply WEEK ⇒ the class; the **calendar feed** ⇒ that row id only; the **digest** ⇒ the same row for T1 **and** T2.
- **T1 (primary): unchanged**, the same lines.
- **T3's class never reaches T2**, on the reply or the feed.
- **What a co-taught row looks like:** exactly like any other. TASK-486's teacher format **names no teacher at all**, so nothing on it implies sole ownership (pinned). Two coaches seeing the same class in their own schedules is correct.
- The fake DB honours what the predicate MEANS (primary or additional) only when the reader passes it. With the old hand-written `eq(teacherId)` it returns primary rows only; with no filter at all it returns everything. So the two mutations you asked for are caught for the right reason.

## Break-and-watch: `mut487.mjs`, 5 mutations, **5 bite**
Every bite shows real failing tests. `finally` + sha-256 restore, byte-identical each time. CHECKSUM over `git diff` + untracked files, `9a9263bc…`, identical before and after. `BASELINE=46` read off a real run on 3 suites.
- A 🔴 **the reply's primary-only filter restored**
- B 🔴 **the reply widened past the coach's own classes**
- C 🔴 the feed back to primary-only
- D 🔴 the feed widened (every coach's classes on one phone)
- E the reply scoped to the wrong coach

**Pins moved:** one. `teacher-own-calendar-req097` asserted the whole `checkin.service.ts` never mentions scope; its claim is that the **public scan** knows no user. It is now narrowed to the scan's two functions (`getCheckinQr`, `checkinByToken`), because the same file holds the teacher's own read, which rightly uses the predicate.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26)
Re-run by me, twice: **3155 pass / 0 fail** both times · tsc 0 · 57 = 57 · both call sites now use `ownScopeWhere`.

🔴 **The enumeration found a SECOND reader with the same wrong answer: the phone-calendar ICS feed.** A coach who subscribed to their teaching calendar on their phone **was not shown a co-taught class there either** — and that is the surface a coach actually lives in, because it is the one that puts a class in front of them without their asking. **I asked for a fourth ANSWER and the real risk turned out to be a second instance of the wrong one.** Asking "who else reads this?" is worth more than asking "does anyone disagree?", and I will write the instruction that way in future.

✅ **Fixing the feed in the same task was the right call and I am not splitting it.** It is the same defect, the same one-line move onto the same predicate, and leaving it would have meant closing this task with a **known** broken reader in the file we had just proved. Offering to revert it in one line, rather than either hiding it or asking permission first, is the right way to make that call.

✅ **The answer to "decision or omission?" is properly evidenced** — the read predates additional teachers entirely (commit `52e06ef`, before `booking_teachers`), carries no comment and no task number, and **TASK-228 taught the reminder about additional teachers and missed this read; TASK-271 later edited the same query and did not notice either.** 📌 That is the useful part: **two subsequent tasks touched this query and neither saw it**, because both were looking at something else. A rule that lives in a hand-written `where` is invisible to everyone not looking for it — which is exactly the argument for the shared predicate.

✅ **The fix was not three edits: one shared predicate already existed** (`ownScopeWhere`, pinned as SQL by REQ-097) and two call sites were moved onto it. Finding the rule that is already written down, rather than writing a fourth copy of it, is the outcome I was hoping for when I said "name it before changing anything".
✅ **Nothing on a co-taught row implies sole ownership** — TASK-486's teacher format names no teacher at all, pinned. Two coaches seeing the same class in their own schedules is correct.
✅ **The pin he moved was narrowed, not weakened**: the claim that the *public scan* knows no user is intact; it simply no longer over-reaches to a whole file that now also holds a teacher's own read. **A pin narrowed with its reason stated is maintenance; a pin deleted is a loss.** This was the former.
