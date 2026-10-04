# TASK-608 — REQ-111 C: an ADMIN records a teacher's leave — BE, S/M

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-10-02) · **The owner ruled GO.** 🔴 **BE half only — C's screen is blocked on a claim question with @Porter.**

## §0 The ruling
**An admin may record a teacher's leave on their behalf.** ✅ **It NOTIFIES the teacher.** ✅ **NO new permission key — any admin who can already edit the schedule may do it** (*the owner's own words: a key no role holds is a feature nobody has*).
🔴 **The future-vs-today fork must be THE SAME ONE, from the same place.**

## §1 Build
- **A door that takes a TEACHER ID and an ADMIN identity.** 🔑 **Today the identity IS the link — the route asserts a linked account and there is no teacher in the body.** ⇒ **This is a second caller of the same act, not a second act.**
- 🔴 **The fork is the thing I care most about.** **Future ⇒ record + list, nothing cancelled. Today/past ⇒ the existing cancel.** ✅ **Pin that BOTH doors reach the SAME fork** — 🚫 **if you find yourself writing the comparison twice, stop and extract it.** *Two forks that agree today are two that diverge the first time one is edited.*
- ✅ **No new key.** ⚠️ **Say which EXISTING key you gate on, and why it is the narrowest that satisfies "an admin who can already edit the schedule".** 🚫 **Do not widen anything.**
- ⭐ **The notice to the teacher** — **naming the day and that an admin recorded it.** 🔑 **A day blocked on someone's behalf is a change to THEIR week, and they must not learn it from an empty calendar.**
  - 📋 **The words are a DRAFT into the copy file, `§T-608`, both languages, pinned by shape.** 🚫 **Code not held.**
  - ⚠️ **Say whether the LIFT also notifies.** **Choose and pin it** — *a notice with no counterpart leaves a teacher believing a day is still blocked.*
- ⚠️ **And derive the audience precisely: the teacher, and who else?** 🚫 **Not the families — nothing is cancelled.** 🔑 *A family hearing "teacher X is away" about a class still going ahead is the defect we closed in TASK-587.*

## §2 Not in scope
🚫 The screen (blocked on a claim question) · 🚫 any new key · 🚫 the teacher's own act, which stays exactly as it is.

## Definition of Done
- [ ] An admin door taking a teacher id · 🔑 **ONE fork, proven shared by both doors, pinned** · the existing key named **and justified as narrowest** · ⭐ the teacher notified, **the lift case chosen and pinned**, 🚫 families NOT told · 📋 draft copy filed as `§T-608` early · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · migration reported if any · mutations incl. **a second fork**, **the teacher not told**, **a family told** · report + `inbox/SA.md` + log.

---

# 🟠 REPORT — @Jason (2026-10-02): **BUILT and tsc-green — but ⛔ STOPPED before the proof: our OWN test guard refuses to run, because `.env` points at the CUSTOMER'S uat system and real OA.** 🚫 **I did not override it.** Everything below is written and compiles; **the suite, the DB-unreachable runs and the mutations are NOT run**, so this is not DONE.

## §0 ⛔ THE BLOCK — read this first
```
🔴 REFUSING TO RUN THE TESTS — .env points at the CUSTOMER'S system (uat / the real OA):
   · DATABASE_URL → host 154.197.124.29 — the uat database
   · LINE_OA_WRITE_ALLOW → @427ybeky — the customer's real OA
   · LIFF_ID / LINE_LOGIN_CHANNEL_ID → the customer's real LIFF + login channel
```
- **That is TASK-503's guard** (the owner's own ruling, 09-26) **doing exactly its job.** Its text says there is **no override, on purpose** — *"an override would be used at 2 a.m. by the person this exists for"*.
- 🚫 **So I did not override it, and I did not pass sid values on the command line to slip past it** — that is the same override wearing a different hat.
- 🚫 **And I did NOT copy `.env.sid` over `.env` myself**, although the guard's message suggests it: **@Porter is mid-uat right now** (menus published, the 246-account relink applied, waiting on Khwan). **If I switched the file under him, his next uat command would quietly hit sid.** 🔑 *A silent wrong-target operation on the customer's system is far worse than a blocked test run.*
- ⚠️ **What I need, from the owner, when his uat session is at a safe point:** `.env` back to the sid values (`.env.sid` exists beside it). **Then I run the suite, the 3× DB-unreachable runs and the mutations, and report the numbers.** 📌 **Nothing else is waiting on it.**
- ✅ **What I COULD prove without running a test, and did:** **`tsc` is clean** (it does not load the guard), and **the six new notice renderings were produced from the pure renderer** — no service, no DB, no network. They are in §3.

## §1 🔑 ONE fork, two callers — the thing you cared most about
- **The act is now `reportTeacherLeave(teacherId, input, actor, { onBehalf })`**, and the FORK (`isAdvanceLeave`) is asked **inside it, once.**
  - **`reportOwnLeave` is a one-line caller** with `{ onBehalf: false }`; **the admin route is the other caller** with `{ onBehalf: true }`.
  - **`liftTeacherLeave` / `liftOwnLeave`** are the same shape for the lift.
- 🔑 **Pinned: `isAdvanceLeave(` appears EXACTLY ONCE in the whole service** — so a second comparison cannot exist, let alone diverge.
- 🚫 **And pinned that `onBehalf` never reaches the fork:** it says only WHO acted (and therefore who is told), never WHAT happens. The fork's region is asserted free of it.
- **Future ⇒ record + list, nothing cancelled. Today/past ⇒ the existing cancel, untouched** — both from that one comparison.

## §2 🔑 The key: NO new one — `action:calendar.status`, and why it is the narrowest that fits
**The owner's words: "any admin who can already edit the schedule".** I gate on **`action:calendar.status`** — the key already on `PATCH /bookings/:id/status` — with the same menus (`menu:calendar` + `menu:bookings`).
- **Why it satisfies the words, and grants NOTHING new:**
  - its own registered description is *"บันทึกสถานะคาบ (ยืนยัน/มาเรียน/**ลาป่วย/ยกเลิก**)"* ⇒ **for TODAY and the PAST this act is the cancel its holder can already perform, session by session**;
  - **for a FUTURE day the act only STOPS new bookings** — strictly less than the booking its holder may already make.
- **Why not the alternatives:**
  - 🚫 **`action:calendar.teacher-leave`** — it is the LINKED TEACHER's own key. **Admins do not hold it** (Tanya found sid's Teacher role itself lacks it), so gating on it would ship exactly *"a key no role holds is a feature nobody has"*;
  - 🚫 **`action:calendar.book` / `booking-edit`** — WIDER: they create and rewrite rows.
- 🚫 **No key registered, nothing widened** (pinned: no third key whose name contains "leave").
- ✅ **A LINKED teacher cannot use the admin doors** — they are not in `TEACHER_ALLOWED`, so the route sweep 403s them; a teacher uses their own door. **Pinned both ways.**

## §3 ⭐ The notice — audience derived precisely, and the LIFT case CHOSEN
- **Audience: the teacher whose day it is, and NOBODY else.** Pinned **by recipient TYPE** (no row whose `recipientType` is not `teacher`), not by one absent name.
  - 🚫 **Not the families** — nothing was cancelled (TASK-587's defect, closed, stays closed). 🚫 **Not the other coaches** — their classes are untouched.
  - **An unlinked teacher ⇒ a SKIPPED outbox row**, so a mis-set account is loud rather than silent (TASK-152).
- 🚫 **A teacher's OWN act notifies nobody** — they need no notice of their own. **Only "on behalf" sends.**
- 📌 **Recorded twice ⇒ no second notice:** the first record stands, so an admin repeating themselves does not ping the teacher again.
- ⚖️ **THE LIFT NOTIFIES — chosen, with the reason: *a notice with no counterpart leaves a teacher believing a day is still blocked.*** They were told it was blocked; they are told when it is not. **Pinned.**
- 📋 **Copy filed as `§T-608`, both languages.** ✅ **Rendered from the pure renderer** (no service, no DB, no network) — all six:
```
🗓️ แอดมินบันทึกวันลาของคุณแล้ว            🗓️ An admin recorded a leave day for you
Date: 21-10-2026                          Date: 21-10-2026
วันนั้นจะไม่มีการจองคาบใหม่กับคุณ          No new class can be booked with you that day.
คาบที่จองไว้แล้ว 2 คาบยังอยู่ในตาราง…      The 2 class(es) already booked that day are unchanged and NOT cancelled — …
บันทึกโดย: admin-ploy                      Recorded by: admin-ploy
```
  - **On an EMPTY day the "nothing was cancelled" line is absent** (there is nothing to reassure anyone about) — rendered and checked.
  - **The lift's three lines** render with no class count and no actor line.

## §4 The doors
- **`POST /teachers/:id/leave`** — body unchanged (`v.teacherLeave`); `:id` is the TEACHER, the actor is the signed-in admin.
- **`DELETE /teachers/:id/leave/:date`** — `:date` declared free-form in the uuid guard (`:id` stays a uuid), pinned.
- ⚠️ **Response shape, declared as ADDITIVE:** both doors now return **`teacherNotified`** (always `0` on the teacher's own door). **Two existing TASK-582 pins updated for it** — and `tsc` caught both, which is why they are updated rather than discovered later.

## §5 What is NOT done, and why
- 🚫 **The suite count, the 3× DB-unreachable runs, the migration count and the mutations** (*a second fork · the teacher not told · a family told*) — **all blocked by §0.** The mutation JSON is ready to run the moment `.env` is back on sid.
- 🚫 **The screen** — not in scope (blocked on your claim question with @Porter); **I built nothing toward it.**
- ⚠️ **So this is NOT DONE.** ⛔ Do not mark it so. **Say the word once `.env` is switched and I will finish the proof in one pass.**

---

# ✅ REPORT 2 — @Jason (2026-10-03): **20 of the 21 fixed. 3737 pass / 1 fail — and the 1 is NOT mine, with proof.** tsc 0 · **9 / 9 mutations bite** · 65 = 65 · ⛔ live-DB layer still blocked on `.env`

## §0 📌 First — the lesson I accept, in my own words
**You were right and I was wrong.** 🔑 **Pointing the suite at an unreachable database and blanking the three LINE identifiers is not slipping past the guard — it is making the environment genuinely not the customer's, which is the guard's whole purpose.** **Passing SID credentials would have been the override; pointing at NOTHING is the opposite act.**
⇒ **I had a third of the verification in my hand and did not use it, and that is why a defect in a SHIPPED door reached you instead of me.** ✅ **Kept: the DB-unreachable run is available in ANY `.env` state. It is never blocked.** 📌 **I will run it before reporting any block, always.**

## §1 🔴 §3 — the shadowed route: FIXED, and the coach's door answers again
- **Moved the admin act OFF `/teachers/:id/leave` and ONTO the admin's own noun**, exactly as you directed: **`POST /teacher-leave-days`** and **`DELETE /teacher-leave-days/:teacherId/:date`**, beside TASK-587's admin READ. **A noun with no literal sibling cannot be shadowed.**
- 🚫 **Not re-ordered** — that only moves the break from the guard to the handler.
- **The service did not change at all:** *one act, two doors* still holds; only the path the admin's door hangs on moved.
- ✅ **Proven THROUGH THE GUARD, as you required** — never off `TEACHER_ALLOWED`, because that set is keyed by the string the **guard computes**, not the one in the router:
  - a **LINKED coach with every key** now gets **200** on all three of **`POST` / `GET` /teachers/me/leave** and **`DELETE /teachers/me/leave/:date`**;
  - the same coach gets **403 SCOPE_TEACHER** on both admin doors.
- ✅ **And a structural pin so the shape cannot come back:** no route may hang a **wildcard sibling** beside a `/teachers/me/...` literal — compared **segment-by-segment** (`:param` matches anything), **not by segment count**, which would have flagged `/teachers/:id/budget` wrongly. 🔑 **The pin proves it can SEE the defect:** it asserts that the path this task originally shipped WOULD be caught.
- **Mutation H7 restores the old path and BITES.**

## §2 🔴 §5 — the silenced pins: re-anchored, and there were FOUR, not one
**`reportOwnLeave` became a one-line delegation, so every region anchored on `export async function reportOwnLeave(` went dark.** I swept for the shape rather than fixing the one you named:
| file | what it guards |
|---|---|
| `teacher-own-calendar-req097` (×2 regions) | the SHIPPED teacher door — the pins that would have caught §3 independently |
| `teacher-leave-admin-list-task587` (×2) | the admin list, and "the advance act tells nobody" |
| `teacher-leave-day-task561` | the leave module writes nothing but its own table |
| `booking-undo-req108` | 🔴 **the worst of them** — its region END was `reportOwnLeave`, so with the anchor gone `indexOf` returned **-1** and the slice ran to the END OF FILE. The region then "contained" `tx.query.teachers.findFirst` from elsewhere and the pin **failed for a reason that had nothing to do with its claim.** *A silent anchor does not only stop speaking; it can start lying.* |
- ✅ **All re-anchored on `reportTeacherLeave` — the ACT**, and **each carries the reason in the pin**: the act is where the behaviour lives, so it survives a door being added, renamed or reduced to a one-liner. The old anchor died the moment a door delegated.

## §3 ⚠️ §4 — the six censuses: CLASSIFIED, none widened
| census | what I did |
|---|---|
| coach-message producers (TASK-512) | **`notifyTeacherOfLeaveDay` → `NAMED_BY_DESIGN`**, with the entry saying the audience is **the subject teacher ALONE** — *a DAY, not a class: no predicate to apply, no other coach, no family* |
| write routes vs the ENDED-course rule | **RULED, not waved through — the answer is YES, and the rule is not engaged.** A leave day is a fact about a TEACHER and a DATE: it names no course and writes no booking. A FUTURE day only stops NEW bookings, and an ended course cannot gain one; TODAY/past is the existing cancel, which reads LIVE rows only, and an ended course has none. ⇒ nothing of an ended course is reachable either way. Both routes `unrelated`, with that reasoning in the entry |
| the param census + the free-form list (×2 files) | the new route **declared PER ROUTE**, never excused by name. 📌 **`teacherId` is not a fifth name** — it was already one of the four (`date · id · key · teacherId`); I chose `:teacherId` deliberately so no fifth name appears |
| the "ALL FOURTEEN kinds" lists (×3 properties) | **two** new kinds, so **29 → 31** by arithmetic, in both the kind list and the `case "` count. **All three properties hold for them**: the date goes through `ddmmyyyy` (no raw ISO), `{n}` is interpolated by `t(…, { n })`, and the builder's single trim keeps the tail clean — I checked the lift's rendering, whose last line is conditional |
| the actor-site count | **23 → 24** — `POST /teacher-leave-days` carries `actorOf(c)`: WHO recorded the day, onto `created_by` and into the teacher's notice |

## §4 🔴 THE ONE I DID NOT FIX — and it is not mine. Proof, not a claim
**`teacher-schedule-req109` ▸ "the REASON sits beside the English strings".** It asserts `S.toContain("This is\n * the customer's own choice…")` against the **RAW bytes** of `src/lib/teacher-schedule.ts`.
```
raw (as the test reads it) contains it: false
after normalising CRLF→LF            : true
```
- **The content is identical; only the line endings differ.** **`git config core.autocrlf` = `true` on this machine**, so the working copy is CRLF while HEAD is LF.
- 🔑 **It is repo-wide, not local to one file: of 333 `src/lib` files, 332 are LF in HEAD and CRLF on disk** — and `git status` reports them unmodified, because git normalises on commit. **I touched a dozen files; this is 332.**
- ⇒ **The test cannot pass on this working copy regardless of TASK-608.** It belongs to TASK-486 (REQ-109), and **the fix is one line — normalise before comparing, as its sibling tests do.**
- 🚫 **I did not apply it:** it is another task's pin, and the cause is an environment fact the team should decide about rather than have me paper over. ⚠️ **Worth a SYSTEM-FACT either way: any test comparing RAW file bytes to a `\n` literal will fail on this checkout.** **Say the word and I will fix it in one line.**

## §5 Counts, as you asked — not "green"
- **`bun test` (DB-unreachable, all four guard signals blanked): 3737 pass · 1 fail** — the one above. **Was 3715 / 21.**
- **tsc 0.** **65 .sql = 65 journal tags, no migration.**
- **Mutations (`bun run mutation:run`, same unreachable environment): baseline 69, CHECKSUM identical, every restore byte-identical — 9 / 9 BITE:**
  - **H1 a SECOND fork at the admin door** · **H2 the fork asked twice in the service** — *the thing you cared most about, broken two different ways, both caught*
  - **H3 the teacher not told** · **H5 told of their OWN act** · **H9 pinged again on a repeat** · **H6 the LIFT stops notifying**
  - **H4 a FAMILY told** — the TASK-587 defect, re-attempted and refused
  - **H7 the admin door back on `/teachers/:id/leave`** — *the shadowing regression itself*
  - **H8 gated on the teacher's own key**
- ⛔ **Still blocked, and only this:** the **live-DB** layer (the normal `bun test` against sid). **Nothing else waits on `.env`.**

## §6 ▶️ Next
**TASK-609 started next, run against the DB-unreachable suite as I go**, per your order of work.

---

# 📌 ADDENDUM — @Jason (2026-10-03): your §4 debt, and a correction
- ✅ **The admin entries now carry YOUR argument instead of mine** — *the act did not change, only the caller did; they inherit the `me` pair's classification because they are the same act* — plus the line that keeps it honest: **if the ACT ever touches a course's rows, BOTH pairs change together.**
- ⚠️ **Correction, with the evidence: the `me` POST was NOT missing its reason.** It carries one directly above it, lines 148–149: *"a teacher's own leave cancels the LIVE sessions they teach that day; an ended course's rows are all CANCELLED, so none is ever selected. Classified deliberately, not by default."* 🔑 **That is exactly the reason you asked me to add, already written.** ⇒ **I added nothing there rather than duplicate it.** 📌 **I think you read the entry without the comment above it — the same shape as my own `:id` miss: the line is right, the context is one line away.**
