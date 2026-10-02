# TASK-587 — the admin can SEE a recorded leave day — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-30) · **Size S.** Your own finding in TASK-582, ruled in — **both halves.**

## §0 Why both
**The owner ruled: "Classes already booked with them that day are LISTED FOR THE ADMIN to handle by hand."** 🔴 **Today no admin can see a recorded day or its classes.**
🔑 **And the half you did not claim: the OLD act cancelled, and a cancel TOLD the admins. The new act tells nobody.** ⇒ **We removed a signal at the same moment we stopped cancelling.**
⚖️ **So: (a) the read, and (b) the notice.** 🔑 **Adding a notification is the owner's call. NOT LOSING one is ours.** ⇒ **(b) is a restoration, not a proposal.**

## §1 (a) the admin read
- **An admin can see recorded leave days and the live classes on them.** ✅ **`leaveDayBookings` is already built — reuse it.** 🚫 **Do not build a second answer to the same question.**
- ⚠️ **Which key? Use the narrowest existing one that fits and say which.** 🚫 **No new key on a guess.**
- ⚠️ **Say where an admin would naturally look for this** — 🔑 **a read nobody can find is the list we already have.** **If the honest answer is "nowhere yet", say so and it becomes @Fern's placement question.**

## §2 (b) the notice — a restoration
- **Admins are told when a teacher records an advance leave, naming the day and HOW MANY live classes are on it.** 🔑 **The point is "you have classes to handle", not "someone is off".**
- 📋 **Words are a DRAFT into `COPY-REVIEW-2026-09-29.md`, both languages, pinned BY SHAPE. Code not held.**
- ⚠️ **Pin the AUDIENCE deliberately** — *"admins only" is a decision, and the family must NOT be told: nothing has been cancelled.* 🔑 **A family hearing "teacher X is away" about a class that is still going ahead is a new defect.**
- ⚠️ **And say what happens when the leave is LIFTED.** **Either a second notice or deliberate silence — choose and pin it.** 📌 *A notice with no counterpart leaves admins acting on a day that is no longer blocked.*

## §3 Not in scope
No FE placement (@Fern) · the cancel path (unchanged) · any new permission key.

## Definition of Done
- [ ] (a) an admin read reusing `leaveDayBookings`, **the key named and narrowest**, where it would be found **stated** · (b) admins told, **naming the day and the class count**, **the family NOT told — pinned** · the lift case **chosen and pinned** · drafts filed early, code not held · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · mutations incl. **the family told** and **a lifted day still notified** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-30): (a) BUILT · 🔴 **(b) STOPPED: its premise does not hold. The old act never told the admins**, so a notice is NEW (the owner's call by your own rule). Drafts filed as a PROPOSAL, both languages, lift counterpart included · the family pinned NOT told · **NO migration (65)** · **3672 / 0 normally and 3× DB-unreachable (0 failed queries)** · tsc 0 · **6 / 6 mutations bite**

## §1 🔴 (b): the premise checked BEFORE building, and it is false
- **Your ruling:** *"the OLD act cancelled, and a cancel TOLD the admins"*.
- **The code:** the old act (`reportOwnLeave`, today / past) sends exactly **two** notices per cancelled class:
  - `class_cancelled_teacher` to **the class's OTHER coaches** (`sendClassCancelledToOtherTeachers`);
  - `class_cancelled_parent` to **the families** (`sendClassCancelledToFamilies`).
  - **There is no `notifyAdmins` in `reportOwnLeave` or in either sender** (pinned by source).
  - The daily attention digest (the admins' other channel) has **no check that reads `TEACHER_LEAVE`** (`grep`: the code appears only in the enum, the i18n label, the migration witness and the cancel's own write).
- ⇒ **No admin signal was lost when we stopped cancelling.** What admins had before was only **seeing the cancelled rows on the calendar**, which is exactly what (a) now replaces with something better: the classes that still need a human, listed.
- ⇒ **A notice to admins is an ADDITION.** By your own line, *"adding a notification is the owner's call"*, so **I did not build it.**
- 📋 **Drafts filed anyway** (`COPY-REVIEW-2026-09-29.md` **§16**, both languages, marked **PROPOSAL, NOT BUILT**), including **the lift counterpart**: if one is sent, the other must be, or admins act on a day that is no longer blocked. **One "yes" from the owner makes it ≈30 lines** (`notifyAdmins` in the act and the lift, a renderer case, two i18n keys).
- ✅ **What IS pinned now:** the advance act tells **nobody** (no family, since their class is still going ahead; no coach; no admin), and the leave module never sends.

## §2 ✅ (a) The admin's list: BUILT
- **`GET /teacher-leave-days?from&to`** ⇒ `{ items: [{ teacherId, teacherName, date, reason, createdBy, bookings }] }`, by date then coach.
  - `bookings` is **`leaveDayBookings`, reused by name**: one class read per day, THE answer. 🚫 No second query.
  - The window defaults to **today (Bangkok) → +60 days**. At most 92 days, in order; else 400 in words.
  - It lives in `lib/teacher-leave.ts`, so that module is still the ONLY toucher of the table.
- 🔑 **The KEY: `menu:calendar`, read only. No action, no new key.** It is the narrowest existing one that fits: the rows it lists are **the calendar's own rows**, which that viewer already sees on the grid.
  - **A linked teacher is refused** (not in `TEACHER_ALLOWED`): TASK-406's route sweep 403s it automatically, so a coach can't read colleagues' leave.

## §3 Where an admin would naturally LOOK: **nowhere yet** ⇒ @Fern's placement question
- **The natural place is the CALENDAR DAY**, for example a marker on that teacher's column or a line in the day banner (*"ครูเอก ลา · 2 คาบต้องจัดการ"*), the same way the camp banner marks a camp day. That's where an admin books, and where they'd try to book that teacher and hit the 409.
- **A second natural place is the Attention page**, as a check: "classes on a teacher's recorded leave day". ⚠️ Attention also feeds the **daily LINE digest to admins**, so that is effectively a notification too, and **the owner's call like (b)**.

## §4 Checks
- Suite: **3672 / 0** (3665 + 7 new, `src/lib/teacher-leave-admin-list-task587.test.ts`). **DB-unreachable 3×: 3672 / 0, 0 "Failed query".** tsc 0. **65 .sql = 65 tags, no migration.** Line endings kept per file, none mixed.
- **Mutations with `bun run mutation:run`:** baseline 40, measured; CHECKSUM identical; every restore byte-identical:
  - **A1, a second answer instead of `leaveDayBookings`:** BITES.
  - **A2, the default window wrong:** BITES.
  - **A3, a linked teacher reaches the admin list:** BITES.
  - **A4, the family told on an advance leave:** BITES.
  - **A5, a lifted day still notified (a notice on the lift):** BITES. *(Pinned as SILENCE today; if the owner says yes to §16, this pin flips to "the lift sends its counterpart".)*
  - **A6, any window accepted:** BITES.

⛔ Only you mark this DONE.

---

# ✅ (a) DONE · 🔴 (b) STOPPED — REVIEWED by @Sober (2026-09-30)
Verified by me: **3672 / 0 both ways** (0 failed queries) · tsc 0 · **6/6 bite.**

## 🔴 He falsified MY premise, and he is right
**I wrote: "the OLD act cancelled, and a cancel TOLD the admins."** 🔴 **It did not.** **`reportOwnLeave` sends only `class_cancelled_teacher` (other coaches) and `class_cancelled_parent` (families) — no `notifyAdmins` anywhere, and the digest never reads `TEACHER_LEAVE`. Pinned by source.**
⇒ **No admin signal was lost. An admin notice is NEW ⇒ the owner's call, by my own rule.** ✅ **He stopped and filed it as a PROPOSAL with its lift counterpart.**
📌 **I owe this plainly: I reasoned from what the system OUGHT to have done rather than from what it does.** 🔑 **That is the exact class I have been ruling against all fortnight — an assumption about behaviour treated as a fact about it.** **Third time this week an engineer has checked a premise of mine and found it false, and each time they were right to.**

## ⚖️ But the requirement did not go away — **it changed shape, and that is what goes up**
**The owner ruled the classes are "listed for the admin TO HANDLE BY HAND".** 🔑 **That ruling PRESUPPOSES the admin knows.** ⇒ **An admin who is never told cannot handle anything.**
⇒ **So this is not "would you like a notice?" — it is: his ruling needs ONE of two things.**
- ✅ **(i) a place the admin will SEE it** — **which is exactly what (a) is missing: a home.**
- ✅ **(ii) a notice** — **new, and therefore his.**
⚖️ **Ruled: do (i) FIRST.** 🔑 **If a marker on the calendar day does the job, the notice may not be needed at all** — *and asking for a new feature before we know whether it is needed is how a system grows noise.* ⇒ **TASK-589.**
📌 **The proposal goes up as "also?", not "instead" — with his §16 drafts already written, so a yes costs ~30 lines.**

## ✅ (a), and the key choice is right
**`GET /teacher-leave-days?from&to`, each day carrying `leaveDayBookings` REUSED.** ✅ **Default today → +60, max 92.**
✅ **Key: `menu:calendar` read, no new key — "the calendar's own rows" is the right reading**, and 🔑 **a linked teacher is REFUSED, which is the half that proves this is an ADMIN read and not the teacher's own list wearing a new URL.**
✅ **And what is pinned matters as much: the advance act tells NOBODY — no family, no coach, no admin — and the lift is silent, flipping only if §16 is approved.**
