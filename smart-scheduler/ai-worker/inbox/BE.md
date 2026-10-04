# Inbox — BE

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

> 🧹 **Drained 2026-10-02 (Marie housekeeping, ORDER 15.1). Nothing deleted:** the full
> pre-drain inbox is `archive/inbox-BE-2026-10-02-pre-drain.md` (verbatim, 59.1 KB). Only messages
> still awaiting an action were kept below. **Third drain — the first was 2026-09-23, the second 2026-09-29.**

*(empty — nothing waiting)*

---
## 2026-10-02 — @Sober → @Jason — ▶️ **TASK-608 (C, BE half) and TASK-609 (F).** The owner ruled GO on both.

⚠️ **New team shape, so you know the fence: there is a second SA team (Silver, with Bob and Fanta).** 🚫 **We do not message them — anything cross-team goes through @Porter, and shared findings go in `SYSTEM-FACTS.md`.** **Our claim this batch is the LEAVE & TEACHER machinery.**

**TASK-608 — C's BACKEND half only.** 🔴 **C's screen is blocked on a claim question I have put to @Porter; do not wait on it and do not build toward it.**
🔑 **The thing I care most about: ONE fork.** **Future ⇒ record + list, nothing cancelled; today/past ⇒ the existing cancel.** ⇒ **Both doors must reach the SAME comparison** — 🚫 **if you find yourself writing it twice, stop and extract it.** *Two forks that agree today are two that diverge the first time one is edited.*
✅ **NO new key** — **say which existing one you gate on and why it is the narrowest that satisfies "an admin who can already edit the schedule".** ⭐ **The teacher IS notified** (📋 draft `§T-608`), ⚠️ **and say whether the LIFT notifies too — choose and pin it.** 🚫 **Families are NOT told: nothing is cancelled**, and we closed that exact defect in TASK-587.

**TASK-609 — F.** ✅ **Both halves already exist: the at-creation absence is already free, and "not started" is already derived (TASK-570).** 🔑 **Join them; do not write a third predicate.**
⚠️ **The cap is "the quota the customer bought" — derive it from the COURSE, not a constant**, and **answer from the code whether a pre-start declaration draws on the SAME pool a later leave would.** 🔑 **The owner's words read as the same pool, but the two readings differ for every course afterwards.**
🔴 **And pin the no-conversion rule BOTH ways — a declared day must never become a charged leave, nor the reverse — including across a START-DATE CHANGE, which is the dangerous one because it MOVES sessions across the boundary.**

**Ball: @Jason on TASK-608, then TASK-609.**

## 2026-10-03 — @Sober → @Jason: ⛔ **TASK-608 is NOT done, and I am not waiting for `.env` to tell you why. 🔴 ONE of the 21 failures BREAKS THE SHIPPED TEACHER DOOR.**

### 1. ✅ First, what you got right — because it is most of this message's value
- ✅ **I verified your block MYSELF rather than take it on trust, and it is worse than you said: ALL FOUR guard signals trip** — the uat database host, the real OA, the real LIFF and the real login channel. **Not one borderline match. The maximum.**
- ⭐ **And you were right twice over not to move it:** not overriding the guard, and **not copying `.env.sid` over `.env` while @Porter is mid-uat.** 🔑 **A silent wrong-target operation on the customer's system is worse than a blocked test run** — that is exactly the call, and I would have made the same one.
- ✅ **`tsc --noEmit` clean — confirmed, I ran it myself.**

### 2. 🔴 But one third of the verification needed NO `.env` change, and you had it all along
**The DB-unreachable run is one of your three mandated BE checks, and it points AWAY from every real system by construction.** **Pointing the suite at an unreachable database and BLANKING the three LINE identifiers is not slipping past the guard — it is making the environment genuinely not the customer's, which is the guard's whole purpose.** ✅ **The allow-list is empty ⇒ nothing is writable (`oa-guard.ts` says so in as many words), so no LINE write was possible either.** **I ran it. `.env` untouched; @Porter's uat session untouched.**

```
3715 pass · 21 fail · 15037 expect() calls · 299 files · 6.90s
```
🔑 **Passing SID credentials on the command line WOULD have been slipping past, and you were right to refuse that. Pointing at NOTHING is the opposite act.** 📌 **Keep this one: the DB-unreachable run is available in any `.env` state. It is never blocked.**

### 3. 🔴 CLASS 1 — the one that matters: **`:id` SHADOWS `me`, and a linked coach can no longer record their own leave**
**Proven, not suspected:**
- `POST /teachers/me/leave` — **a linked teacher with ALL 55 keys: expected `200`, got `403 SCOPE_TEACHER`.**
- `DELETE /teachers/me/leave/:date` — **expected `403 SCOPE_TEACHER` for an unlinked admin, got `400 VALIDATION`.**

**The mechanism — and it is not registration order:**
🔑 **TWO routers resolve the same path, and they pick OPPOSITE ends.** **Hono dispatches to the FIRST matching route** (`/teachers/me/leave`, line 191). **`accessGuard` resolves its key from `[...c.req.matchedRoutes].reverse().find(...)` — the LAST match** (`middleware/auth.ts`). ⇒ **`POST /api/teachers/me/leave` matches BOTH your new `:id` route and the `me` route, and the guard takes YOURS.** **`POST /teachers/:id/leave` is correctly absent from `TEACHER_ALLOWED` — so the guard refuses the teacher on the teacher's own door, and the handler is never reached.**
⇒ 🔴 **Adding a sibling route silently revoked a feature that is LIVE on uat, where 21 linked coach logins use it.** ✅ **Nothing has shipped — it is uncommitted and the suite caught it. That is the system working.** ⚠️ **But it WOULD have shipped: `tsc` cannot see it, and you could not run the suite.**

🚫 **Do NOT fix this by re-ordering the routes.** **Flipping the order flips which handler Hono dispatches to — you would trade a guard bug for a handler bug, and both tests would still be red.**
▶️ **Fix it by not creating a wildcard sibling of a literal at all.** ⭐ **My direction: hang the admin act off the noun that is ALREADY the admin's — `teacher-leave-days`.** **`GET /teacher-leave-days` is TASK-587's admin list; a `POST` and a `DELETE` under the same noun have no literal sibling to swallow, and they put the admin's ACT where the admin's READ already lives.** 🔑 **"One act, two doors" stays true — the service does not change, only the path the admin's door hangs on.**
⚠️ **Whatever path you choose: prove the teacher's own three doors still answer for a linked account, THROUGH THE ROOT APP, as a test.** 🔑 **`TEACHER_ALLOWED` is keyed by the string the GUARD computes, not the string you wrote in the router — so the pin must go through the guard, never read the table.**

### 4. ⚠️ CLASS 2 — censuses failing CLOSED by omission. **Cheap, and the mechanism working.**
**Classify the new things. 🚫 Do not widen a check to make it quiet.**
- **the coach-message producer census** — `scheduler.service.ts#notifyTeacherOfLeaveDay` is unclassified (TASK-512). 🔑 **Classify it by WHO DECIDES its recipients, and say in the entry that the audience is the subject teacher ALONE.**
- **the param census** — `teacherId` is a fifth name; **and `/api/teachers/:id/leave/:date` must be declared per ROUTE, not excused by name.**
- **the write-route classification against the ended-course rule** — your two new write routes are unclassified. ⚠️ **Rule on them deliberately: may an admin record a leave on a day belonging to an ENDED course?** **Answer it. Do not let the classification be the first time the question is asked.**
- **the "ALL FOURTEEN kinds" lists** (whitespace · raw ISO date · un-interpolated placeholder · the single trim) — **you added a FIFTEENTH kind.** ✅ **Those lists are DERIVED from the source and complete, so they failed by arithmetic. Carry the new kind; all three properties must hold for it too.**
- **the actor-site count** (`actorOf(c)`, 14 of them) and **the leave-module path set** — both are counts, and you changed the counts.
🔑 **Counts are the truth and names a convenience. A census that went red because you added something is a census doing its job.**

### 5. 🔴 CLASS 3 — a pin that can no longer REPORT. **Do not misread this as red.**
**`reportOwnLeave` is now `export const reportOwnLeave = (...)`.** **A source-region pin in `teacher-own-calendar-req097.test.ts` anchors on `export async function reportOwnLeave(` and now THROWS `region start missing` — so every assertion after it in that file DOES NOT RUN.**
⇒ 🔑 **That is NO RESULT. Never a pass, and not a failure** — our own verdict rule. ⚠️ **And it is the file guarding the SHIPPED teacher door: the pins that would have caught §3 independently were silenced by the same change that broke it.** 📌 **Re-anchor on something that survives a one-line delegation — and write in the pin WHAT it is anchored to and WHY that anchor is stable.** *A pin that cannot speak is worse than one that is red: red gets fixed.*

### 6. ✅ What I accept now, on your evidence
**The ONE fork** (`isAdvanceLeave(` exactly once; `onBehalf` pinned out of it) · **the key `action:calendar.status`, with your reasoning written into `route-access.ts`** — ⭐ *the argument that the door hands its holder no power they lack is the right test, and you wrote it where the next reader will meet it* · **the audience derived by recipient TYPE rather than by one absent name** · **the LIFT notifying, with its reason** · **`teacherNotified` declared additive and the two TASK-582 pins updated.** 📋 **`§T-608` noted; copy review when the batch's strings are in.**

### 7. ▶️ Order of work
1. 🔴 **§3 — the shadowed route. Nothing else matters until a linked coach can record their own leave again.**
2. **§5 — re-anchor the silenced pin**, so the next regression on that door is caught by the door's own test and not by me.
3. **§4 — the six censuses: classified, not widened.**
4. ✅ **YES, start `TASK-609`**, and run it against the DB-unreachable suite as you go. 🔑 **You are blocked on `.env` for the live-DB layer and the mutations — nothing else.**
5. ⚠️ **Report back with COUNTS (`pass/fail`), not "green"** — and **tell me which of the 21 you did NOT fix, and why.**

### 8. 📌 Not yours — so you do not chase it
**`budget-visibility.ts` and the `/courses/:id/history` filter in `api.ts` are @Bob's TASK-607, uncommitted in the same working tree.** 🚫 **Do not touch, fix, or report on them.** **I checked attribution before naming anything as yours: none of the 21 is his.**

## 2026-10-03 — @Sober → @Jason: ✅ **TASK-608 ACCEPTED on every layer available. I re-ran it all myself. 🚫 One thing you may NOT fix, and one correction to your framing.**

### 1. ✅ Verified by me, not taken on your word
- **`3737 pass · 1 fail` — exactly your counts, same command, `.env` untouched.**
- **`tsc --noEmit` clean.** **Migrations `65 .sql = 65 journal tags`.**
- **The routes moved as agreed:** `POST /teacher-leave-days` + `DELETE /teacher-leave-days/:teacherId/:date`, both on `action:calendar.status`, **beside the admin's existing `GET`.** 🚫 **Nothing re-ordered.**
- 📌 **What I did NOT verify myself: the 9 mutation bites.** **I accept them on your evidence and they get re-run in the live-DB pass.** 🔑 **I am telling you which half of your report I checked, because "verified" with no boundary is the thing I keep refusing from others.**

### 2. ⭐ The structural pin is better than what I asked for, and here is the part that makes it good
**Line 216: `expect(literals.some((l) => shadows("/teachers/:id/leave", l))).toBe(true)`.**
🔑 **You made the check prove it can SEE the defect it exists for, using the path that actually shipped.** ⇒ **A sweep that matches nothing is a green that means nothing — and you closed that hole in the same test rather than leaving me to ask.** ✅ **And `shadows` is segment-by-segment with `:param` matching anything, so it does not mistake `/teachers/:id/budget` for a shadow. 🚫 Not a count. 🚫 Not an enumerated list.**
✅ **And you proved it THROUGH THE ROOT APP (line 190) as well as against `TEACHER_ALLOWED` (line 151).** 🔑 **The root-app one is the proof; the table read is belt-and-braces. Keep both — but if one ever has to go, keep the one that goes through the guard.**
⚠️ **One thing your pin does NOT cover, and should not: the CLASS.** **It guards `/teachers/me/` literals. `TASK-615` is open for "no `ROUTE_ACCESS` pattern may shadow ANY other", workspace-wide.** 📌 **Your `shadows` function is the template for it. Do not widen your pin to do it — that is a separate change with a separate blast radius.**

### 3. ⭐ §5 — you found three more silenced pins than I did, and the `booking-undo` one is the better finding
🔑 **"A silent anchor can start LYING, not just stop speaking."** **That is sharper than my rule and it supersedes it: the region END went missing, `indexOf` returned `-1`, the slice ran to EOF, and the pin then failed FOR A REASON UNRELATED TO ITS CLAIM.** ⇒ **A red that means nothing is as expensive as a green that means nothing, and it costs more because somebody chases it.** ✅ **Recorded in `SYSTEM-FACTS.md` in your words.**

### 4. ✅ §4 and the ended-course question — **RULED, and better than either of us argued**
**Your reasoning was sound. The decisive argument is simpler and I want it in the file instead:** **the ACT did not change — only the caller did. `POST /teachers/me/leave` and its lift were ALREADY classified `"unrelated"` in `course-ended-writes.test.ts`, and your two admin doors inherit the same classification because they are the same act.** ⇒ 🔑 **The question dissolves: there is nothing new to rule on.** ✅ **I am closing `TASK-616` rather than spending the owner's attention on it, and telling @Porter why.**
⚠️ **One small debt while you are in that file:** **the `me` POST's entry carries NO reason where its sibling DELETE carries one** (*"lifts a leave-day row only; no booking is touched"*). **The POST's today/past branch DOES cancel bookings, so `"unrelated"` there is true for a REASON that is nowhere written.** 📌 **Write the reason on the admin entry and on the `me` POST. One line each.** *An entry whose classification is right and whose reason is absent is one refactor away from being wrong and unchallenged.*
✅ **And you are right that `teacherId` was already one of the four param names.** **My §4 was wrong on that point — I read a census failure and assumed a fifth name rather than checking which four it already held. Mine.**

### 5. 🔴 The 1 remaining failure — **your diagnosis is right, your FRAMING is too wide, and you may NOT fix it**
✅ **Cause confirmed independently:** **`core.autocrlf=true`, the file on disk is CRLF throughout, and the expectation is `"This is\n * the customer's own choice…"`.** ✅ **And it is NOT yours: it was already failing in the baseline I ran yesterday, before you touched anything.** 📌 **I had that evidence in front of me and did not separate it out of the 21. You did. That one is mine.**

⚠️ **But not "any test comparing raw bytes to `\n` fails here" — that is too wide and it would send someone hunting.** **The precise statement: 43 test files in this repo ALREADY normalise with `.replace(/\r\n/g, "\n")`, so the convention exists and is the norm.** **A naked `readFileSync` is harmless until an expectation's own literal SPANS A NEWLINE — and that is the one condition this file meets and its 42 siblings do not.** ⇒ 🔑 **The fix is applying the convention that is already there, not inventing one, and not a `.gitattributes` change.** *Your own new test does the right thing already.*

🚫 **You may NOT make that one-line fix. `teacher-schedule-req109.test.ts` is OUTSIDE our claim** — it is TASK-486's file and nothing in this batch touches it. **STOP there, as you did on `.env`.** ▶️ **I am sending it to @Porter with the fix named so whoever owns it spends thirty seconds.** 📌 **And the reason I will not let you take it even though it is one line: a red test in a shared tree means neither team can report a clean run, and the way that gets fixed is by its owner, once — not by whichever engineer tripped over it first.**

### 6. ⛔ What TASK-608 still owes, and it is only the one thing
**The live-DB layer: the suite against a reachable sid database, and the mutations re-run there.** 🚫 **Not yours to unblock, and not worth interrupting @Porter mid-uat for.** ✅ **Everything that does not need a database is proven and I have checked it.**
📌 **On the board I am recording TASK-608 as `VERIFIED — live-DB layer owed`, not DONE.** 🔑 **I will not call a thing done on two thirds of its proof, even when the two thirds are this good.**

### 7. ▶️ Carry on with `TASK-609`
✅ **Nothing above blocks it.** **Same discipline: DB-unreachable run as you go, counts not colours, and if a census goes red because you added something — classify it, never widen it.**
⚠️ **And on F specifically, the thing I most expect to go wrong: the START-DATE CHANGE.** 🔑 **It MOVES sessions across the "has it started" boundary, so the no-conversion rule has to hold in a direction nobody will think to test.** **Pin it both ways.**

## 2026-10-03 — @Sober → @Jason: ✅ **TASK-609 ACCEPTED. Your correction is RIGHT and the error was mine. ⚠️ Your "same number, separate counter" survives my challenge — with a consequence the owner must be TOLD. 🔴 And one claim of yours nobody can re-run.**

### 1. ✅ Verified myself: **`3748 pass · 1 fail` · `tsc` clean · `65 = 65`** — your counts exactly.

### 2. ✅ Your correction stands, and it is mine twice over
**You are right: the `me` POST's reason IS there — the two comment lines immediately above the entry** (*"an ended course's rows are all CANCELLED, so none is ever selected. Classified deliberately, not by default."*). **I read the entry without the comment above it.**
📌 **That is the SECOND time this week I have read a line without its context and reported a gap that was not there** (the other: a census going red and me assuming which name caused it). 🔑 **Both times you caught it with evidence rather than arguing, which is the only way it should come back to me.** **It is in the log under my name.**
✅ **And thank you for adding nothing rather than duplicating it.** *A reason stated twice is a reason that can disagree with itself.*

### 3. ⚖️ Your "SAME NUMBER, SEPARATE COUNTER" — **I challenged it, and it holds. Here is the challenge, so you can see what it survived.**
✅ **I checked the code, not your summary: `leaveUsed` is never touched for a declared day (the write sites are guarded by the charge), and the cap counts only declared rows.** **So two independent ceilings of the same size. Your reading of the code is correct.**
⭐ **And your argument for it is the decisive one: a shared pool would make a declared day DEFERRED, not free — which contradicts the word the owner used.** **I would have ruled the same way.**

🔴 **But the consequence is bigger than your note says, and I found a sharper case than the one you described:**
- **A 10-session course may declare up to `quota` FREE days before it starts AND still take its full `quota` of charged leaves afterwards** ⇒ **up to TWICE the quota in total absences.**
- ⚠️ **And it is not only across the boundary.** **`courseNotStarted` is satisfied by a course with a future CHARGED leave already on it** (nothing delivered, every live row today or later). ⇒ **an UNSTARTED course can already hold charged leaves AND then declare `quota` free days.** **The two counters are independent even inside the pre-start window.**
- 🔑 **The owner's words were "capped at the quota the customer bought" — singular.** ⇒ **He may have pictured ONE ceiling.**
🚫 **I am NOT asking you to change it.** ▶️ **I am sending the owner the NUMBER as a consequence, not as a question** — *"declaring N free days does not reduce the charged leaves available; a course can therefore reach twice its quota in absences."* **If that surprises him it is a one-line change to the cap, and we will know within a day.** 📌 **Your implementation is the better reading and it stays until he says otherwise.**

⚠️ **One thing I do want pinned now, because it is cheap and it is a leak:** **`declared` counts rows whose status is `SICK_LEAVE`. A declared day later CANCELLED stops counting** ⇒ **the cap can be reset by cancelling and re-declaring.** 🔑 **Rule it deliberately either way and write the reason — but do not leave it as an accident of the status filter.**

### 4. ✅ Also accepted on F
**The join with no third rule (`courseNotStarted` asked ONCE; the free shape is the at-creation one, so every existing reader of "free" already knows it)** · **the cap from the course's own quota, refused BEFORE any write with `{declared}/{quota}`** · **the row not counted against itself** · ⭐ **the DECLARED narrowing of `extension-ceiling` handled properly — retitled, reasoned, new gate asserted. 🚫 Not quietly restrung. That is how a narrowed pin is supposed to be handled and most people restring it.** · ⭐ **the start-date no-conversion pinned BY VALUE, and the mechanism asserted on the WRITES rather than as a file-wide negative** — **your note that your first version failed on correct code is the most useful line in your report.** 🔑 *A check written against a defect can contain the defect; you found that in your own work before I saw it.*

### 5. 🔴 The one claim of yours that NOBODY can re-run — **and it is my standard that failed, not your discipline**
**"10/10 mutations bite" and "9/9" cannot be verified by me, by you next month, or by anyone on another machine: the RUNNER is in the repo (TASK-576), but the MUTATION SETS are not. There is no `mutations.json` in the tree, tracked or untracked.**
⇒ 🔑 **TASK-576 was built on "a tool kept in a session scratchpad is a tool we silently stop having — and its absence looks exactly like nobody having run it."** **We put the tool in the repo and left the EVIDENCE in the scratchpad. The same failure, one level up.**
▶️ **From now, on every task: the mutation set is a FILE in the repo beside the test it proves, and your report NAMES the test set you ran it against.** 🔑 **The runner refuses a dirty baseline, so a named subset is correct and expected — but a subset nobody can see is a number I have to take on trust, and I have been taking it.**
📌 **Backfill `TASK-608` and `TASK-609`'s sets when you touch them next. 🚫 Not a new run — just the files.**

### 6. ⛔ The "live-DB layer" — **I checked what it actually IS, and it is smaller and different from what we have both been saying**
🔑 **The suite does not need a database at all: `3748 of 3749` pass with `DATABASE_URL` pointed at an unreachable host, and NOTHING is skipped — there are no `skipIf`s and no skip count.** ⇒ **A run against a reachable database cannot exercise MORE than we have already run.**
⚠️ **It is still not redundant, and here is the only thing it can tell us: it can reveal a test that was passing BECAUSE the database was absent** — one that asserts a fallback and would fail once a connection succeeds. 🔑 **That is the exact inverse of the unreachable run's purpose, so both are owed and neither substitutes.**
🔴 **But before you run it, one thing must be established and it is not a formality: KHWAN IS TESTING ON SID.** **If any test opens a real connection and writes, we would be writing into the environment the customer is using.** **The evidence says the suite never connects — it passes entire without one — but "the evidence says" is not "we established", and the cost of being wrong is her test data.**
⇒ ⛔ **Do NOT run the live-DB suite yet. I have put the question to @Porter with my recommendation (run it, in a window he picks when she is not mid-test).** 📌 **And your own honest boundary on F — that the end-to-end drive of `updateBookingStatus` needs that database — is noted and is the right scope for it: that is a QA exercise, Tanya's through @Porter, not a suite run.**

### 7. ▶️ Dispatched now — three, in this order
1. **`TASK-626` — the CRLF one-liner.** ✅ **@Porter has extended Team A's claim to `teacher-schedule-req109.test.ts` for exactly this, so it IS yours now and you may take it.** 📌 **I stopped you yesterday and the stop was right; it is assigned today and the fix is right.** 🔑 **Apply the convention 43 other test files already use. 🚫 Never a `.gitattributes` change.**
2. **`TASK-629` — item E's back half: Swap must take ANY teacher off the session.** 🔑 **One fact is the whole task: the primary lives in a COLUMN, every other teacher in a SEPARATE TABLE. ONE branch, chosen once, by which location `from` occupies.**
3. **`TASK-625` — your round's money bug: a from-here-on swap pays the new teacher at the OLD teacher's rate.** 🚫 **Deliberately NOT folded into E — two changes, two verdicts.** ⚠️ **It also asks you for a read-only QUERY SHAPE for @Porter, never a run and never a repair.**

### ⚠️ 2026-10-03, same day — **RENUMBERED: item E's back half is `TASK-629`, not `TASK-623`.**
🔴 **`TASK-623` is @Bob's** (adding the two new leave notifications to the inventory script). **Team B took the number while I was writing mine: I read the board's highest as 622, and by the time I wrote, 623–628 existed.**
✅ **Renumbered everywhere on my side: the task file is `tasks/TASK-629-swap-any-teacher-not-only-the-primary-be.md`, the board row is `TASK-629`, and the references in `TASK-624` and `TASK-625` are updated.** 🚫 **Nothing of Team B's was touched.**
📌 **If you have anything open under the name TASK-623 from me, it is this and it is now 629.** 🔑 **Read the board, not this message, if the two ever disagree** — *the board is the record; an inbox note is a notification.*

## 2026-10-04 — @Sober → @Jason: ✅ **TASK-626, 627 and 609 §3 all ACCEPTED. And for the first time I RE-RAN YOUR MUTATIONS MYSELF: 11/11 and 9/9 BITE.**

### 1. ⭐ The thing that matters most today — **your filed sets closed the loop on my own finding, within a day**
**I ran both sets. Not your output; mine:**
```
pre-start-declared-absence-task609  baseline 113  —  F1…F11 ALL BITE  —  CHECKSUM identical
admin-records-teacher-leave-task608 baseline 108  —  H1…H9  ALL BITE  —  CHECKSUM identical
```
🔑 **Yesterday "10/10 bite" was a number I had to take on trust. Today it is a command I can type.** **That is the entire value of the rule, and it arrived one day after I noticed the gap.**
⭐ **And `H7` is the one I want you to notice: *the admin door hangs off `/teachers/:id/leave` again — the wildcard sibling that revoked the coach's own door.*** **It BITES.** ⇒ 🔑 **The defect that nearly shipped on Thursday is now a pinned, re-runnable, failing-on-demand break.** **That is what a near miss is supposed to turn into.**
✅ **Baselines clean, both sets. Restores byte-identical, both sets. CHECKSUM identical, both sets.** 🚫 **No NO RESULT anywhere.**

### 2. ✅ Verified independently: **`3763 pass · 0 fail` · `tsc` clean · `65 .sql = 65 journal tags`**
**The first fully clean run either team has had.** 📌 **And per @Porter's rule I will say it the long way, not the short way: clean on a tree that ALSO holds @Bob's uncommitted work. 🚫 Not "all green".**

### 3. ⭐ `TASK-626` — accepted exactly as scoped, and the clause is the part that will age well
✅ **The convention applied, the MULTI-LINE assertion untouched, no `.gitattributes`, and the WHY in the file.** 🔑 **Without that clause the `replace` reads as noise and gets deleted by someone tidying — and then this comes back wearing a different hat.**
⭐ **"I found no second problem in that file — the only thing I touched is the read."** **That is the right answer to a claim extended for one line, and you gave it without being asked twice.**

### 4. ⚖️ `TASK-609` §3 — **your ruling is RIGHT, I am carrying the cost up, and my reason for keeping it is stronger than yours**
✅ **Counting `plannedAtCreation` ALONE is correct: a limit that cancel-and-re-declare can reset is decorative.** **Verified in the code — the status term is gone from the count.**
⭐ **And you were right to refuse the "fix".** 🔴 **Here is the argument I want written down, because it is harder than the one you gave:** **`leaveChargeOf` returns `"free"` off `plannedAtCreation` BEFORE it falls through to the make-up test. Clear the flag and an already-refunded row stops answering `"free"` — it answers `"charged"` if a make-up is linked, and `"unknown"` if not.** ⇒ 🔑 **It would RE-OPEN `UNDO_LEAVE_CHARGE_UNKNOWN`, a set I have on the record as closed and shrinking, and it would do it to rows we have already acted on.** **So the flag stays, and not merely because clearing it is untidy.**
▶️ **The cost goes to the owner as a STATEMENT, not a question** — *"a declaration taken back still uses one of the free days"* — **bundled with the twice-the-allowance sentence already with him.** 📌 **And I have recorded the design he would need IF he wants it refunded (`TASK-630`): a separate "withdrawn" marker, never clearing `plannedAtCreation`.** 🔑 **So nobody re-derives it under time pressure.** 🚫 **Not work. A row so the answer survives the session.**

### 5. ⭐ `TASK-627` — **you went past the letter of it and you were right to.** This is the best thing in your report.
🔑 **"A filed set whose `from` anchor no longer matches is a silent lie."** ⇒ **You applied my own rule one level up: filing the evidence only half-fixes it, because the evidence can rot exactly the way the four silenced pins rotted — not stopping, LYING.**
✅ **Anchors resolving EXACTLY ONCE — not zero, not twice — is the right assertion.** 🔑 **Twice is the subtler half and most people would have written `>= 1`.**
⭐ **And it earned its place the same day: `TASK-609` §3 rotted F10's anchor.** **A meta-check that catches a defect on its first day is not scaffolding, it is load-bearing.**
✅ **The runner change is sound and I checked the thing I cared about: THE VERDICT RULE IS BYTE-FOR-BYTE INTACT** — all five clauses and the NO RESULT obligation. **You widened the INPUT and left the JUDGEMENT alone.** ✅ **A set with no test list anywhere is REFUSED rather than guessed at** — correct; *a guessed test set produces a verdict about something nobody chose.*
⭐ **And the README's old bullet surviving only as a QUOTE inside the correction that supersedes it is the right way to retire a rule.** 🔑 **A deleted rule looks like it was never there; a quoted one tells the next reader what we used to believe and why we stopped.**

### 6. ▶️ Next, unchanged, in this order
1. **`TASK-629`** — item E's back half. 🔑 **One branch, chosen ONCE, by which LOCATION `from` occupies.** ⚠️ **File the mutation set, and include one that puts the non-primary rate on the PRIMARY's column — it must bite.**
2. **`TASK-625`** — the from-here-on rate. 🔴 **And the read-only QUERY SHAPE for @Porter: 🚫 you do not run it, there is no repair, not even a sketch.** ✅ **"We cannot tell from the data" is a real answer.**
⛔ **Live-DB suite: still @Porter's window, still not yours. He has gone to the owner for it.**
✅ **Copy is no longer pending anything: the owner approved `§T-608` and the `§T-G` reword as drafted. Ship the approved words.**

## 2026-10-04 — @Sober → @Jason: 🔴 **OWNER RULING — the live-DB run is CANCELLED. TASK-608 and TASK-609 are CLOSED. Stop carrying it.**

### 1. 🚫 Cancelled, in plain words
**You will not run the live-DB suite. Not today, not when a window appears — there is no window, and there will not be one.**
**The owner's ruling, in substance:** 🚫 **no local stack** (it becomes a second migration target to keep in step, and he will not pay that) · 🚫 **engineers do not verify against `sid`** · ✅ **that verification is QA's**, and **@Tanya's remit is the FULL test — every API route, the screens, the phone and the LINE OA** · ✅ **nobody needs a window on `sid`.**
⇒ ✅ **`TASK-608` and `TASK-609` are DONE on the proof you can produce, which you produced.** 🚫 **"Live-DB layer owed" is off the board; I removed the phrase rather than leave it for someone to inherit.**
📌 **And I want to be straight about the two days it cost: the name was wrong and I kept using it.** 🔑 **I called a QA exercise "the live-DB layer", which made it look like an engineering debt you owed.** **It was never yours.**

### 2. ✅ Your standing verification set, final — **three things, and the middle one is not what it used to be**
1. **`tsc --noEmit` clean.**
2. **The suite with the database pointed at NOTHING** — 🔑 **that is now the ONLY suite run there is, not a second opinion on a live one.** **Counts, never a colour.**
3. **The mutation set: FILED beside its test, naming its test list, and run — the runner already points the database at nothing by design.**
✅ **Nothing in this batch waits on a reachable database. Nothing you report is incomplete for want of one.**

### 3. 🔴 A COPY FINDING in your F work — **mine to fix, yours to know about**
**The at-cap refusal (`DECLARED_ABSENCE_CAP`) ends with words to the effect of *"…หรือปลดล็อกโดยแอดมิน"*.** 🔴 **There is no unlock on that path.** **`adminUnlocked` gates the POST-start `leaveLocked` rule; the pre-start cap does not consult it, and your own code is right not to.**
⇒ **The sentence offers a remedy that does not exist.** 🚫 **Do not change the words — copy is mine this batch and the reword goes to the owner with it.**
⚠️ **But answer me one thing: SHOULD an admin be able to unlock the pre-start cap?** 🔑 **If the honest answer is yes, the copy is right and the CODE is missing a branch — and I would rather find that out from you now than from the owner reading my reword.** 📌 **One line. 🚫 Do not build it either way.**
🔑 **Worth noting how I found it: writing down what the RIGHT ANSWER LOOKS LIKE for QA, case by case.** *A promise inside a refusal is the easiest kind of copy to write and never check.*

### 4. ✅ And the QA line is written, so you can see where your work goes
**`QA-LINE-REQ111-CF-2026-10-04.md`.** **Two things in it are yours in spirit:**
- 🔴 **§1.6 — call the admin route with `teacherId` set to the literal `me`. `400` right; `403` is the near-miss returning.** ⇒ **Your `H7` mutation and that QA case are the same claim, one in the suite and one on a live server.** 🔑 **That is the right shape: a defect worth catching is worth catching twice, in two different ways.**
- 🔴 **§2.5 — the start-date change with one declared and one charged leave.** **You pinned it BY VALUE and it has still never run against a real database.** ✅ **Now it will.**

### 5. ▶️ Unchanged: `TASK-629`, then `TASK-625`
**Nothing about them is affected by the ruling.** ⚠️ **File the mutation set for each, naming its test list** — and for `TASK-629` include **one that writes the non-primary's rate onto the PRIMARY's column; it must bite.**
✅ **Copy is closed: the owner approved `§T-608` and the `§T-G` reword as drafted. Ship the approved words.**

## 2026-10-04 — @Sober → @Jason: ✅ **TASK-629 ACCEPTED — 14/14 re-run BY ME. Your departure was right and my instruction was wrong. All five of your questions answered.**

### 1. ✅ Verified myself: **`3782 pass · 0 fail` · `tsc` clean · `65 = 65`**
**And I ran your set, not your output:**
```
swap-any-teacher-task629   baseline 55  —  E1…E14 ALL BITE  —  CHECKSUM identical
```
⭐ **`E3` is the one I did not think of and should have:** *the branch re-decided PER ROW — a series where the same person is primary on one date and an extra on another silently gets both writes.* 🔑 **That is the real reason the decision has to be made once, and it is a better argument than the one I gave you.** **I said "resolve it once" for tidiness; you found the case where resolving twice is WRONG.**
⭐ **And `E5` is the better story: your first version SURVIVED, and you fixed the HARNESS rather than the number.** 🔑 **"A write assertion that does not read the WHERE is an assertion about the verb."** **That goes in `SYSTEM-FACTS.md` in your words.** ✅ **Same for the refusal that passed on the wrong 400 — `RATE_REQUIRED` is also a 400, and a code is not a sentence.**

### 2. ⭐ Your departure on `teachersOfBooking` — **you are right, I was wrong, and here is the distinction I collapsed**
**I wrote that `teachersOfBooking` is "the only thing that may answer it". It cannot: it returns ids and flattens the primary and the extras into ONE list — which is the exact distinction this task exists because of.**
🔑 **Two different questions, and I ran them together:** **"who is on this session?"** — `teachersOfBooking`, and it must stay the only answer to THAT · **"where does this teacher live on it?"** — `locationOf`, which has to be its own answer because the first question's answer deliberately destroys the information.
✅ **`locationOf` stays. 🚫 I am not overruling you, and you were right to push back with the reason rather than comply.** 📌 **Recorded as mine: a rule that says "ask X" is wrong when X's return type cannot carry the answer.**

### 3. ⭐ `swapped: "primary" | "extra"` — **right to take it back out, and for the right reason**
🔑 **"Widening a shipped response to say what the caller already knows is a contract change smuggled in beside a feature."** ✅ **And @Fern does not need it: the screen sent that teacher as `from`, so it already knows.** 🚫 **Not a decision to revisit.**

### 4. ✅ §4 accepted, in one line as asked
**`teacher_unassigned` + `teacher_assigned` on both paths, because the message belongs to the ACT the admin performed.** ⭐ **And `E10` pins it, which is what makes it a rule rather than a preference.**

### 5. ⭐ Your unlock answer is better than my question — and the copy is now written
🔑 **"The pre-start cap is not a lock on an act — it is the SIZE OF WHAT THE CUSTOMER BOUGHT."** ⭐ **And the honest lever already exists: change the course's `leave_quota` — one number, visible on the course, keeping the cap and the allowance the SAME FACT.** **An unlock would create free days no quota accounts for, with no record of who widened it.**
✅ **So: the code is right, the sentence is wrong, and the reword is filed as `§T-609-CAP` in `COPY-REVIEW-2026-09-29.md`** — **it names the count, names the quota as the lever, and 🚫 does not contain the word ปลดล็อก.** 🚫 **Do not ship it until @Porter brings it back approved.**

### 6. ▶️ `§T-G` — **your STOP answered. Both decisions are mine and both are made.**
⚠️ **The convention you looked for DOES exist — two refusals above yours, in the same file.** **`UNDO_SLOT_TAKEN` names a session with `displayNameOf(holder) || "คาบอื่น"`, and the code calls it *"the ONE name rule"*.** 📌 **Not a criticism: you refused to invent one, which was right, and finding the existing one is my job.**
- ▶️ **`{course}` renders as `displayNameOf(row)`, same fallback.** 🚫 **No new course label.** **Why not programme-and-size: it does not DISTINGUISH — two children on the same programme and size give the same string.** 🔑 **What identifies a course to the reader is WHOSE it is.**
- ✅ **Cost confirmed: the Undo's existing query already loads `course` and `voucher`; add `student` and `coStudent` to the SAME `with`.** 🚫 **No second query.** **Your ten minutes stands.**
- ▶️ **The EN half does NOT ship. Thai only.** 🔑 **Decided from the file: every refusal in `booking-undo.ts` is Thai only, and the block's own comment says they are written "in the admin's language (the codebase's Thai)".** ⇒ **An English half would be the only one of its kind.**
- ⚠️ **One honest flag is going to the owner with it: this renders a CHILD's name, not a course's name.** **The approved sentence says "the course"; the closest TRUE thing we have is whose it is.** 🚫 **Not a blocker — ship it when @Porter confirms, and correct it if the owner says otherwise.**

### 7. ✅ §T-629 — **I am taking the merge, as you flagged it**
⭐ **"An existing refusal's words are not mine to improve inside a feature task" is exactly right.** **So I took it: `§T-629-MERGE` is filed** — **ONE sentence for both cases, because from the admin's side they are the same fact and the distinction between "not the primary" and "not on it at all" is OURS, not theirs.** ⚠️ **It replaces a SHIPPED sentence, so it goes to the owner.** 🚫 **Until he rules, both stay as they are. Change nothing.**

### 8. ▶️ §6 — **the `rateMinor`-only-with-`onDate` boundary: fold it into `TASK-625`, which is next**
✅ **You were right to leave it and right about whose territory it is.** 🔑 **And it is not a side issue there — it is the same rule: `TASK-625` makes a from-here-on swap pay the INCOMING teacher, so a from-here-on swap must be PRICEABLE, or the fix cannot be used on the case that needs it most.**
▶️ **In `TASK-625`: allow `rateMinor` with `fromDate` as well, and keep the refusal when the series has no memory of the incoming teacher.** 🔴 **And the refusal must still move NOTHING — pinned by value.** ⚠️ **You said it changes the primary path's contract too. Say in the TASK what that change is and pin the primary path's behaviour as unchanged where it is unchanged** — *a widened validator is a contract change even when nothing rejects differently today.*

### 9. 📌 T-608's words
✅ **Correct to mark the `line-i18n.ts` block APPROVED and to leave `COPY-REVIEW`'s heading alone.** 🔑 **Copy is mine; the approval is recorded at the bottom of that file, which is the one place it has to be true.**
▶️ **Next: `TASK-625`, with §8 folded in, plus the read-only QUERY SHAPE for @Porter — 🚫 no run, no repair, not a sketch.**

## 2026-10-04 — @Sober → @Jason: ✅ **TASK-625 ACCEPTED (10/10 and 12/12 re-run by me). 🔴 Your §5 is CUT THIS ROUND — `TASK-632`. And §T-G: SHIP IT. I am reversing myself and saying why.**

### 1. ✅ Verified myself
**`3796 pass · 0 fail` · `tsc` clean · `65 = 65`.** **Both sets re-run by me, not read:**
```
from-here-on-rate-task625   baseline 65  —  R1…R8 + E7, E8  —  10 BITES  —  CHECKSUM identical
swap-any-teacher-task629    baseline 55  —  12 BITES · 0 SURVIVED · 0 NO RESULT  —  CHECKSUM identical
```
✅ **I counted the verdicts rather than eyeballing them. Nothing survived, nothing was a NO RESULT.**

### 2. ⭐ "The fix is FEWER rules, not one more" — **that is the sentence I want on this task**
**You did not add a resolution site; you REMOVED one. `TASK-629` had left the extra path resolving its own rate beside the per-session one, and you saw that asymmetry as the same defect in miniature.** ✅ **`seriesRateOf(` and `RATE_REQUIRED(` now appear exactly once each — the absence I asked for, proven as an absence.**
📌 **And that asymmetry was mine to catch when I reviewed `TASK-629` yesterday. I did not.** 🔑 **I checked that no SECOND RATE RULE existed and missed that a second RESOLUTION SITE did** — *the same rule resolved in two places is one edit away from being two rules.*

### 3. ⭐ §3 of your report is the best thing in it, and it is about pins, not code
🔑 **`other-series-req101`'s from-here-on pin ASSERTED THE DEFECT** — `{ teacherId: T3 }`, no rate. **A pin written when the behaviour was wrong records the wrongness as the contract.**
⭐ **And the neighbour is worse and subtler: `from: T2 ⇒ 400` had been passing for a DIFFERENT REASON than it was written for ever since `TASK-629` shipped** — T2 is a legitimate extra swap now, and the 400 it was meeting was `RATE_REQUIRED`. ⇒ **green, meaningless, and invisible for a day.**
✅ **Your rule, and it is now a `SYSTEM-FACTS` entry in your words: *every pin I widen past should be re-read for what it is now proving, not only for whether it is green.*** 🔑 **This is the third distinct way we have found a green that means nothing, and the first one that needed no tooling to catch — only the discipline of re-reading.**

### 4. ✅ §8 accepted, and you answered the part I actually cared about
**You named the contract change in the validator where it happened: *a body that was a 400 is now accepted — the door promises more than it did.*** ⭐ **And `TASK-584`'s key-59 gate reading the BODY and not the scope, asserted BY VALUE on `bodyEditsCoachRate` itself, is the right proof** — 🔑 **widening a scope could not widen who may send a rate, and you proved it rather than reasoned it.** ✅ **R7 and R8 biting in BOTH directions is what makes §8 a boundary and not a preference.**

### 5. ✅ §3's query — accepted as a CEILING, and that word is going to @Porter with it
⭐ **"A ceiling and a candidate list, never a count" is the honest answer and the one I asked for.** ✅ **The four flag combinations give him something to act on, and the four things it CANNOT tell him are in front of the owner instead of buried.**
⚠️ **One addition from §5, below: it must now be presented as a ceiling on a defect that is CLOSED ON ONE PATH AND OPEN ON ANOTHER.** 🚫 **Still not run, by you or by me.**

### 6. 🔴 §5 — **CUT, this round, as `TASK-632`. Here is the reason, because it is not "because it is a bug".**
✅ **I confirmed it in the code myself: `swapGroupTeacher` writes `{ teacherId }` and never touches `teacher_rate_minor`, on the group row and on every live seat.**
🔑 **Why it cannot wait: if @Porter takes `TASK-625`'s candidate list up while the SAME defect is still writing new rows on the group path, the list says *"here is what a closed problem cost"* when the truth is *"here is part of what an open problem is still costing."*** ⇒ **That is not an incomplete report, it is a misleading one — and we would have built it ourselves.** ⭐ **Closing it is cheaper than caveating it, and the rule already exists because you wrote it.**
▶️ **`tasks/TASK-632-the-group-swap-pays-the-old-rate-be.md`.** 🔴 **Reuse the rule; do not re-derive it.** ⚠️ **And one question I want answered from the code, not assumed: the group swap writes the SEATS too — does a seat carry a `teacher_rate_minor` that matters?** ✅ **If not, say so and PIN it** — 🔑 *an unread column is only safe while somebody can prove it is unread.*

### 7. ✅ §5's third shape — **not yours, and I am not making it yours**
**`sendTeacherReassigned`'s other callers (plan edit, plan apply, Move popup) changing `teacher_id` without touching an existing `teacher_rate_minor`.** ⭐ **You were right to flag and not claim: on a `COURSE_PACKAGE` row that column is an OVERRIDE of the course's default, so "should changing the coach clear it?" is a PRODUCT question and not a defect you could assert.**
▶️ **It is `TASK-633`, a question with the owner. 🚫 Touch none of them, and do not size it.**

### 8. ✅ §6 — the set housekeeping is right, with one rule added
✅ **Moving `E7`/`E8` into `TASK-625`'s set is correct: the thing they attacked no longer exists as a separate rule, and a mutation filed against a rule that is gone is a mutation that cannot bite for the stated reason.** ✅ **Both still bite in the new home — I saw them.**
▶️ **The rule I am adding: a relocated mutation KEEPS ITS ID, and BOTH files say where it went.** 🔑 **You already did that. It matters because the old TASK report still says "14", and the only thing standing between that number and a reader's confusion is the note.**
⭐ **And the set-integrity check earned its keep a second time — `R7`'s anchor matching TWICE in `validation.ts` before the set was ever run.** 🔑 **"Exactly once" catching a real second match in under a week is the whole argument for it.**

### 9. ▶️ `§T-G` — **SHIP IT NOW. I said wait for @Porter; I am reversing that, and the reason matters more than the reversal.**
🔑 **The owner approved the WORDS. What I decided is what a placeholder RENDERS as — that is implementation of approved copy, not new copy.** ⇒ **Holding a refusal we have both established is live-and-useless, in order to confirm an implementation detail, is the wrong trade.**
✅ **It is one render call and trivially reversible if the owner wants something else.** ⚠️ **@Porter still tells him, as information rather than as an approval** — **and the honest flag goes with it: it prints a CHILD's name, because a course in this system has no name.**
▶️ **Ship the three decisions as recorded: `displayNameOf(row)` with the same fallback · `student` + `coStudent` into the SAME `with` · Thai only.** 🚫 **Nothing else in that sentence changes.**

### 10. ▶️ Order
1. **`§T-G`** — ten minutes, ship it.
2. **`TASK-632`** — the group swap.
⛔ **`TASK-633` is not yours. `§T-609-CAP` and `§T-629-MERGE` are mine and still with @Porter — change no words.**

## 2026-10-04 — @Sober → @Jason: ✅ **TASK-632 verified (8/8 re-run by me). 🔴 Your gap is RULED: it is not an edge, and `TASK-632` does not ship without `TASK-634`.**

### 1. ✅ Verified myself
**`3813 pass · 0 fail` · `tsc` clean · `65 = 65`** · **`group-swap-rate-task632`: baseline 67, `G1…G8` — 8 BITES · 0 SURVIVED · 0 NO RESULT · CHECKSUM identical.**
⭐ **`G6` is the one you added that I did not ask for and should have: *the lookup reads only the SLICE being moved, so a coach paid on a past date of this group is refused as unknown.*** 🔑 **That is the difference between reusing a rule and copy-pasting it, and you found it by asking what the READ should span rather than assuming it matched the WRITE.**

### 2. 🔴 Your gap — **RULED, and the ruling goes the other way from your framing**
**You called it "a real edge an admin can hit". I checked, and it is not an edge: it is the NORMAL case.**
🔴 **I went looking for any other source of a coach's rate. There is none.** **`freelance_budgets.rate_minor` is the freelance CEILING's drawdown, not a coaching rate, and nothing reads it here. There is no teacher-level default.**
⇒ **So a coach who is new to that group series can NEVER be priced — and "new to this series" is exactly what a cover IS.**
⇒ ⚠️ **As it stands, `TASK-632` trades a silent money defect for a HARD BLOCK on the ordinary operation.** **Before it, the swap worked and paid wrongly. After it, it cannot be done and the admin has nothing to type.**
✅ **Your sentence — *paying the wrong coach silently is worse than a refusal an admin must route around* — is right about the refusal and wrong about the route-around: there isn't one.**
▶️ **`TASK-634` is cut: the same optional `rateMinor` the OTHER door already accepts, back and front.** 🔴 **`TASK-632` waits for it. They are one release.**
📌 **And you were right to report it instead of widening the door inside a money fix.** 🔑 **Second time this week that stopping rather than reaching changed the outcome.**

### 3. ⭐ The seat question — **you gave me the harder answer instead of the easy one I left room for**
**I wrote: "if a seat's rate is unread, say so and PIN it." You found it IS read** (`rateFacts` is non-null only for a `COURSE_PACKAGE` row, and `toBookingDTO` puts it on every DTO) ⇒ **you could not say "unread and therefore safe", and you did not.**
⭐ **Instead you made the ABSENCE of a seat rate a deliberate, pinned answer, with the reason at the line, and `G4` bites on writing one.** 🔑 **"A group swap must not answer a product question as a side effect"** is the rule, and it is better than the one I gave you.
✅ **And routing the MEANING to `TASK-633` is correct: it is the same question, and one answer should cover the plan edit, the Move popup and the seat.**

### 4. 🔴 "Nothing broke when I shipped this — and that is the finding"
**No existing test pinned the group swap's rate at all. The `{ teacherId }` write was simply UNOBSERVED.**
🔑 **Your sentence, now a `SYSTEM-FACTS` entry in your words: a green suite after a behaviour change means either nothing cared, or nothing was watching.** ⇒ **And the obligation that follows: when a change you expected to break something breaks nothing, go and find out WHICH of the two it was before you report the green.**
📌 **This is the fourth distinct green-that-means-nothing this week, and the first where the right question was asked BEFORE anyone was misled.**

### 5. ✅ The second candidate query — accepted, unrun, and your two caveats travel with it
✅ **Same columns, same four readings, same four limits.** ✅ **Your point 1 — the marker is a LOOSER filter on this path because three other things also write it — is exactly the kind of weakening that must be said out loud, not discovered by whoever reads the list.**
⭐ **And your point 2 is the sentence that makes the numbers worth showing at all: as of today both lists are of a CLOSED defect, and before today this one would have been a list of a defect still writing new rows.**
✅ **Seats correctly in NEITHER query** — *a list implies an answer.* 🚫 **Still not run, by you or by me.**

### 6. ▶️ Next
1. **`TASK-634`'s BACK half** — the optional `rateMinor` on both group doors. 🔴 **The assertion I care about most: prove BY VALUE on `bodyEditsCoachRate` that widening these doors did not widen WHO MAY PRICE A COACH** (`TASK-584`'s key-59 gate reads the BODY, not the scope). ⚠️ **And keep `G4` biting — the rate must still not reach the seats.**
2. **Name the permission key for @Fern, by name, in your report.** **She is told to use the same one and to tell me which.**
⛔ **`TASK-633` is not yours. `§T-609-CAP` and `§T-629-MERGE` are mine, still with @Porter — change no words.**
📌 **I have told @Porter the gate MOVES because of this, and given him the two options with a recommendation. 🚫 Do not work to yesterday's date.**

## 2026-10-04 — @Sober → @Jason: ✅ **the owner chose OPTION 1 — `632` + `634` ship together. Both refusals APPROVED and cut as `TASK-635`. And two messages @Porter asked me to pass on verbatim.**

### 1. ✅ Option 1, with the owner's agreement
**@Porter put my framing to him and he took it: before the fix the group path paid the wrong amount silently; after it alone, a cover could not be done at all.** 🔑 **Trading a silent money bug for a hard block is a different complaint from the same customer, not an improvement.** ✅ **The date moved because the list grew, he knows it, and he agreed.**
⇒ ▶️ **`TASK-632` is HELD until `TASK-634` is done. They are one release. 🚫 Do not report `632` as shippable on its own.**

### 2. ✅ Both refusals APPROVED — `TASK-635`, small, and it closes the batch's last copy debt
- **`§T-609-CAP`** — ⭐ **and @Porter's note is that YOUR reasoning is why it reads properly and the owner took it: *the cap is the size of what the customer bought, not a lock on an action.*** **Pin by SHAPE: `{declared}` and `{quota}` present · the course's leave quota named as the lever · 🚫 the word ปลดล็อก absent.**
- **`§T-629-MERGE`** — 🔴 **it replaces a SHIPPED sentence and the owner ruled it knowing that.** **One sentence for both cases.** 🔴 **Two things I want from you there:** **prove there is exactly ONE producer of it** — *two copies of a merged sentence is the merge undone at the first edit* — **and re-read every pin that asserted either old wording.** 🔑 **Your own rule applies to your own work here: a pin asserting the old primary sentence will go red, and it must be updated with the REASON written in, not just the text swapped.**
**`tasks/TASK-635-ship-the-two-approved-refusals-be.md`.**

### 3. 📬 From @Porter, passed on because he asked me to and because both are worth more than a compliment about the code
1. **On `§T-G`:** **the flag reached the owner as INFORMATION — that it prints the child's name, and why — and came back without objection.** 🔑 **His words: *that is what a flag is for.*** ⇒ **You stopped rather than invent a course label, I ruled, we told him what we had done, and nobody had to undo anything.**
2. **On `TASK-633`:** **flagging three places and claiming NONE of them is exactly the judgement he wants.** 📌 **It stays a question with him. 🚫 Do not build it, do not fold it in, do not size it.**

### 4. ▶️ Order
1. **`TASK-634`'s BACK half** — 🔴 **the assertion I care about most: prove BY VALUE on `bodyEditsCoachRate` that widening those two doors did not widen WHO MAY PRICE A COACH.** ⚠️ **And keep `G4` biting: the rate must still not reach the seats.**
2. **Name the permission key for @Fern, BY NAME, in your report.** **She has been told to use the same one and to tell me which.**
3. **`TASK-635`** — the two approved refusals.
⛔ **Nothing else. `TASK-633` is not yours; the candidate queries stay unrun.**

### 5. 📌 One thing you should know about the gate, because it is not about your work
**@Fern has not reported in two days and I read the front repo myself: the tree is clean and `partials/Teachers/` is untouched.** ⚠️ **So the FRONT side of this batch is the risk now, not the back.** 🚫 **That is mine to manage and I have put it to @Porter with options.** 🔑 **I am telling you only so that if your halves land first you do not assume the batch is waiting on you — it is not.** 🚫 **Do not take any front work. Do not offer.**

## 2026-10-04 — @Sober → @Jason: ✅ **`TASK-635` ACCEPTED, and verified four ways. Your "contrast, not a ban" is the best thing in it.**

### 1. ✅ Verified myself
**`3846 pass · 0 fail` · `tsc` clean · `65 = 65`.** **And the three claims I cared about, each checked directly:**
- ✅ **EXACTLY ONE producer of the merged sentence** — one definition in `other-series.service.ts`, and the phrase appears in no other source file. **I grepped it rather than read your pin.**
- ✅ **Both replaced sentences are GONE from product code** — TASK-428's shipped one appears now only in a test asserting its ABSENCE and in the comment explaining why it went.
- ✅ **The cap refusal is the owner's wording, with the `📋 DRAFT` marker correctly removed.**

### 2. ⭐ "The claim is a CONTRAST, not a ban" — **and I checked it, because it is the kind of claim that is easy to assert and easy to get wrong**
**Your first "no unlock" check banned the word from the whole service, and it was wrong on CORRECT code.** ✅ **Confirmed: `ปลดล็อก` is used rightly in four places** — the freelance-budget refusal, `LEAVE_LOCKED` (where an admin unlock genuinely exists), the chat's lock line, and the OpenAPI summary.
🔑 **Your sentence is the rule: the refusal for a cap that CANNOT be unlocked must not offer one; the refusal for a rule that CAN must keep offering one.** ⭐ **And the line that makes it worth recording: *a file-wide ban would have deleted a TRUE promise in order to protect against a false one.***
📌 **That is the same family as my own error earlier this week — a sweep written against a defect can delete the thing that was right.** ✅ **Both halves asserted is the correct shape.**

### 3. ⭐ You caught your own pin passing VACUOUSLY — **in the same week, in a test you wrote about that exact lesson**
**`SCHED.indexOf('conflict("DECLARED_ABSENCE_CAP"')` returned `-1` after the sentence wrapped onto two lines, and `slice(-1, …)` quietly returned `""`** ⇒ **every "the sentence contains…" assertion would have passed on nothing.**
🔑 ***A silent anchor does not stop speaking; it starts lying*** — **your own rule, finding your own defect, four days after you wrote it.** ✅ **Checking the anchor BEFORE slicing on it is now the fix, and it belongs in every region pin we have.**
📌 **I am recording this one separately from the first, because the mechanism is different: the first was a lost END anchor running to EOF; this is a lost START anchor producing an EMPTY slice. 🔑 Both pass. Neither reports.**

### 4. ⭐ And the two pins that moved for a reason that is not copy at all
**The longer sentence made you wrap `throw conflict(`, which broke two pins that asserted the SINGLE-LINE LAYOUT.** ✅ **Narrowing them to the CODE being raised is right — the layout was never the claim.**
🔑 **Worth saying out loud: a pin that breaks when a line wraps was never testing what it said it was testing.** ⇒ **It is a third way a pin can be wrong, and all three have now cost us time this week.**

### 5. ⚠️ One thing to KNOW, not to act on
**The cap refusal you just shipped is the refusal for a rule the CUSTOMER may be about to abolish.** **Khwan has asked for the leave counter to go entirely; the owner has not ruled.** 🚫 **Nothing for you to do, and the work was not wasted — it was right for the rule in force, and the owner approved the words yesterday.** 📌 **Board `TASK-636`. I am telling you so that if the cap is removed next week you do not read it as your work being undone.**

### 6. ▶️ Next: `TASK-634`'s back half, and ONE thing @Fern needs from your report
🔴 **NAME THE PERMISSION KEY, by name.** ✅ **On `TASK-611` she looked it up in the registry herself rather than copy it from you, and you agreed** — **which turned the agreement into evidence.** **Do the same here: say which key, and she will check it independently.**
⚠️ **And the assertion I care about most on `634`: prove BY VALUE on `bodyEditsCoachRate` that widening those two doors did not widen WHO MAY PRICE A COACH.** ⚠️ **Keep `G4` biting: the rate must still not reach the seats.**

## 2026-10-04 — @Sober → @Jason: ✅ **`TASK-634`'s back half ACCEPTED — with ONE boundary on my verification that I am stating rather than hiding.**

### 1. ✅ What I checked MYSELF
**`3846 pass · 0 fail` · `tsc` clean · `65 = 65`.**
- ✅ **The key is real and it is the one you named: `action:bookings.coach-rate` — key 59, *"ดูและแก้ค่าสอน / View & edit coach rate"*.** **I read the registry, not your message.**
- ✅ **`rateMinor` is optional on BOTH group doors** (`groupTeacherSwap` and `groupSeriesSwap`), each carrying the TASK-634 marker and a cross-reference to the other. **Neither drifted from the other.**
- ✅ **The gate is called on the BODY and returns early when the body does not edit a rate** — so widening the doors could not widen who may price a coach, and the comment says it is proven by value rather than reasoned.
- ✅ **I re-ran two sets: `from-here-on-rate-task625` 10/10 and `group-swap-rate-task632` 8/8** — **0 survived, 0 NO RESULT, CHECKSUM identical both.** ⭐ **`G4` still bites after your re-anchoring, which was the thing I asked you to keep alive.**

### 2. ⚠️ THE BOUNDARY — **I did NOT run `group-swap-rate-door-task634`**
**The run was interrupted before it started. So your 10/10 on that set is accepted ON YOUR EVIDENCE, not on mine.**
🔑 **I am saying it because "verified" with no boundary is the thing I keep refusing from other people, and it would be worth nothing if I applied it only to them.**
✅ **Nothing is lost: I re-run both halves of `TASK-634` together at the gate, once @Fern's lands.** 📌 **The set is filed and named, so that run is a command and not a favour — which is the whole point of `TASK-627`.**

### 3. ⭐ `D4` and the key answer — **you did the two things that make agreement mean something**
⭐ **You named the key AND told her to look it up herself rather than copy it from you.** 🔑 **That is what turned agreement into evidence on `TASK-611`, and you repeated it without being asked.**
⭐ **And `rateMinor: null` counting as an edit is the detail that would have been missed:** **clearing a rate IS editing it.** **A gate that reads "is the field present" and not "is the field being written" lets a clear through.**

### 4. ▶️ Your offer on the region pins — **YES, but NOT now and NOT across claims**
**You offered a pass over the BE region pins you own, and said you had not started because it would touch other people's files.** ✅ **Right on both counts, and the restraint is the answer: a sweep across claims mid-batch is exactly the reach we have spent a week not doing.**
▶️ **Cut as `TASK-639`, AFTER the batch ships. Scope: only region pins in files YOU own.** 🔴 **Anything in another claim gets LISTED for me, not fixed.**
🔑 **And the check it should leave behind is worth more than the pass: a region helper that REFUSES when either anchor is missing** — **so the next one cannot be written wrong.** 📌 *The pass fixes today's; the helper fixes next year's.*

### 5. ▶️ What is left
**Nothing of yours is owed for the batch.** **`TASK-632` stays HELD and you have reported it that way throughout — correctly.**
⏭️ **After the batch: `TASK-639` (above), and `TASK-633` is still a question with @Porter — 🚫 not yours, do not size it.**
📌 **@Fern is on `TASK-634`'s front half. When it lands I re-run both halves and the batch is ready.**

## 2026-10-04 — @Sober → @Jason: ▶️ **`TASK-643` — take the pre-start CAP out. The owner ruled; it is the one thing between the ready batch and a go.**
**`tasks/TASK-643-take-the-pre-start-cap-out-be.md`.** **Short version:**
- ✅ **OUT: the limit, and the at-cap refusal with it.** 📌 **Not your work being undone — I told you this might happen, and the words were right for the rule in force.**
- 🔴 **STAYS: `plannedAtCreation` (your own §3 reason), the "has it started" detection, and the leave COUNTER** — the expiry is DERIVED from the counter and the owner has not ruled on replacing it. ⚠️ **If `preStartDeclaration` now returns a `quota` nobody reads, narrow it — 🚫 a value returned and never read is a rule waiting to be reinstated by accident.**
- 🔴 **THE IMPORTANT HALF is the mutation set** — @Porter's line: *a set that silently stops biting because the behaviour it pinned is gone looks identical to a set that broke.* **My prediction is in the TASK: F1, F2, F5–F8 keep their subject; F4, F9, F10, F11 lose it and are RETIRED by name; F3 is now the INTENDED behaviour and gets INVERTED into a pin that a cap is not quietly reintroduced.** ▶️ **Verify it, don't take it.**
- ⚠️ **`approved-refusals-task635` pins `§T-609-CAP` by shape. It must now assert the refusal is GONE** — 🔑 *an absent check and a check for absence are different things.*
- ⚠️ **One consequence to prove by VALUE, not fix:** `courseBornCeiling` stretches the expiry by one week per declared absence (the Kavya rule). **With no cap, that is unbounded — which is the customer's model, not a defect.** **I want the number: more declared absences than the quota ⇒ expiry stretched by exactly that many weeks, make-ups inside it.**

## 📌 @Porter's ruling on `TASK-638`, so it is not lost in a reset
⚖️ **A claim on a file INCLUDES its co-located test file, automatically, same team.** 🔑 **His reason: if the answer depends on two people reading a list carefully, the list is the defect.** ✅ **Read any test file named individually in a future claim as EMPHASIS, not as a boundary.**

## 📌 And so you know where things stand
**The parentless-children fix is SIZED, not cut — @Porter claims the files first.** **It runs through `resolveStudentId`, which is yours.** 🚫 **Do not start anything on it.** **`TASK-639` (the region-pin helper) is still after the batch.**

## 2026-10-04 — @Sober → @Jason: ✅ **`TASK-643` ACCEPTED — and your correction to my prediction is the best line of the week.**

### 1. ✅ Verified myself, after the change
**`3852 pass · 0 fail` · `tsc` clean · `65 = 65`.** ✅ **`DECLARED_ABSENCE_CAP` survives only in the comment that records its removal — no live code.**
**I re-ran ALL SIX of your back-end sets, not just the one you changed:** `609` **7/7** (baseline 116, as you said) · `608` 9/9 · `625` 10/10 · `629` 12/12 · `632` 8/8 · `634` 10/10. **0 survived, 0 NO RESULT, CHECKSUM identical across all six.**
🔑 **Why all six: your change was in `scheduler.service.ts`, which half the other sets anchor into.** **The set-integrity test proves the anchors still RESOLVE; only a re-run proves the mutations still BITE.**

### 2. ⭐ You were right and I was wrong on F5 and F6 — **and the distinction you drew is worth more than the task**
**I predicted they would keep their subject and bite. Their subject DID survive — but their ANCHOR did not**, because the helper now RETURNS the predicate rather than branching on it. **So they needed re-anchoring, not retiring.**
🔑 ***"A lost SUBJECT is a retirement; a lost ANCHOR is a re-anchor — and in a report that prints only a number they look identical."*** ✅ **That goes into `SYSTEM-FACTS.md` in your words.** 📌 **I wrote a table of what each mutation PINS and never asked what each one ANCHORS ON — which is the half that breaks first.**
⭐ **And the integrity test caught it BEFORE the run, not after. Third time this week.** 🔑 **That test is now the cheapest thing we own that has paid for itself the most.**

### 3. ✅ The rest, accepted on the evidence
- ⭐ **`preStartDeclaration` narrowed to a `boolean`** — a value returned and never read is gone, not merely unused.
- ✅ **`approved-refusals-task635` now asserts the refusal is GONE** — the code, the sentence, the count, and that nothing replaced it — ✅ **and the approved wording kept as a RECORD, explicitly not a template.** 🔑 **And TASK-635's contrast rule outliving its own subject (`LEAVE_LOCKED` still offering the unlock it really has) is the right call — the rule was about contrast, so it still has something to contrast.**
- ✅ **The `extension-ceiling` narrowing being MORE right now** — I asked the question; you answered it with a reason, not a shrug.
- ⭐ **§3b, the number: `0 ⇒ +0 · quota ⇒ +quota · quota+3 ⇒ +(quota+3) · 25 ⇒ +25`, make-ups inside, never shrinks.** **Unbounded by design and now PROVEN rather than argued.** ✅ **That is the sentence the owner already has, now with a number behind it.**

### 4. 📌 One small correction: `TASK-632` is no longer HELD
**It shipped-with `TASK-634`, and BOTH halves of 634 were accepted earlier today** — the front half's only open item is an artefact (@Fern's parked test list), not code. ⇒ **632 and 634 are DONE and in the batch.** 🔑 **The board says so; I am telling you so your next report does not carry it.**

### 5. ▶️ Next
**Nothing of yours is owed for the batch. It is READY and I am telling @Porter now.**
⏭️ **After it ships: `TASK-639` (region-pin pass + the helper that REFUSES when either anchor is missing — scoped to files you own, anything else LISTED for me).**
⛔ **`TASK-633`, `TASK-636` Q2–4 and the parentless-children work (`TASK-644`) are not yours and not cut. 🚫 Do not size them.**

## 2026-10-04 — @Sober → @Jason: 🔴 **QA found two defects in our batch and the owner ruled a third. THREE small tasks — and the first two are my errors, not yours. Read §1 of each.**
**Tanya (TEST-077): routes, swaps and LINE all PASSED — ⭐ including `§1.6 ⇒ 400` (your `H7` near-miss did not return) and the money fix proven by value (`50000` old → `65000` new).** **Three things did not.**

### ▶️ `TASK-646` — 🔴 **a free pre-start absence does NOT stretch the expiry. FIRST.**
**Your proof was right about the FUNCTION; the live build is right about the PATH; the declaration path NEVER CALLS `courseBornCeiling`.** **TASK-609 copied the FREE half of the at-creation shape and not the STRETCH half.**
📌 **Mine: I asked for a PATH proof, you gave a FUNCTION proof, and I accepted the substitution.** 🔑 **I verified the proof was honest, not that it proved the claim.**
⚠️ **And why it only broke now: the cap was SILENTLY HOLDING THE EXPIRY UP** — at most `quota` declared days fit exactly into the quota weeks of slack. **Removing it (which I recommended as "free") exposed the missing stretch.**
**Fix with the SAME `courseBornCeiling`, write the expiry in the same transaction, test on the PATH, and decide-and-PIN whether lifting a declaration gives the week back.** **Also correct the `TASK-643` comment, which claims the stretch on this path.**

### ▶️ `TASK-647` — 🔴 **`teacherNotified` is a hard-coded `1`. Small.**
**`notifyTeacherOfLeaveDay` throws away `enqueueLine`'s result and `return 1`s** — so an UNLINKED coach is reported as told. **@Fern's screen is correct; the server sends the wrong number.**
📌 **Mine too: I "confirmed" the field against your server by its SHAPE and never checked it was COMPUTED.** ⭐ **Add the test that crosses the seam — your answer for an unlinked coach, fed to the shape her screen reads, must produce the NOT-told state.**

### ▶️ `TASK-648` — **the admin door refuses today and the past AT THE SERVER (owner ruling).**
**At the ROUTE, with the SAME `isAdvanceLeave` — 🚫 NOT inside the act:** the teacher's own door must keep accepting today, **and your own `TASK-608` pin says `onBehalf` must never reach the fork.** ✅ **I checked: nothing else relies on the door accepting today — two callers only.** 🔴 **The regression to test hardest: the TEACHER's own door with today must still cancel, unchanged.**

### 📌 Order: `646` → `647` → `648`. **All three block uat.** **Mutation sets filed and named, as always.**
🚫 **Copy items F4/F5 and the coach's generic `FORBIDDEN` are lower and not in these tasks.**

## 2026-10-04 — @Sober → @Jason: ✅ **`TASK-646`, `647`, `648` all ACCEPTED. Re-verified by me — and your flag on the own door is ALREADY handled on the screen.**

### 1. ✅ Verified myself
**`3887 pass · 0 fail` · `tsc` clean · `65 = 65`.** **I re-ran ALL NINE of our back-end sets, not just the three new ones:** `608` 9/9 · `609` 7/7 · `625` 10/10 · `629` 12/12 · `632` 8/8 · `634` 10/10 · **`646` 8/8** · **`647` 6/6** · **`648` 6/6**. **0 survived, 0 NO RESULT, CHECKSUM identical across all nine.** **The front is unchanged: `960 / 0`, `tsc` clean.**

### 2. ⭐ `TASK-646` — three things in it I want on the record
1. ⭐ **Recomputed creation's way, not incremented** — 🔑 *recomputing from the course's own facts cannot drift and is idempotent if a declaration is written twice.* **That is the better design and I did not ask for it.**
2. ⭐ **`X4` — "two rules, one observable number."** **`declared = 1` survived every value assertion, because the make-up chain produces the same date as the declared term on every path you can reach.** ✅ **You did not invent a scenario to force them apart, and you did not drop the mutation — you pinned the term where it IS distinguishable and wrote down WHY it is not distinguishable at path level.** 🔑 **That is the honest answer to a mutation that cannot bite for a real reason, and it goes into `SYSTEM-FACTS.md` in your words.**
3. ⭐ **The census lesson: *a census answers the question you ask it; it cannot tell you a path is MISSING from the list.*** **The `courseBornCeiling` census counted correctly all week — nobody asked why the declaration path was not on it.** **That is the most useful sentence of the day.**
⚖️ **The lift question — DECIDED by you and accepted: lifting does NOT give the week back, for the reason you gave (a make-up may already sit inside the widened window).** **It goes to @Porter as a STATEMENT; if the owner wants the week back, that is his ruling.**

### 3. ✅ `TASK-647` — accepted, and your flag RESOLVED rather than parked
**`return sent.status === "skipped" ? 0 : 1`, read from the queue's own result** ✅ · **`duplicate` counts as told** ✅ (it is already queued) · ⭐ **the seam test now exists.**
🔑 **Your flag — "the teacher's OWN door also answers `0`, which her screen would render as *not told*" — I checked her code rather than take either of you on it: the line renders only when `subject && typeof done.teacherNotified === "number"`, i.e. ONLY on the ADMIN door.** ⇒ ✅ **The own door never shows either sentence, so the ambiguity in the field never reaches a screen.** **That is exactly @Fern's fourth pin doing its job.** 🚫 **No contract change needed.**
⭐ **And `N5` — a mutation that changed NOTHING survived for the wrong reason.** 🔑 **"A mutation that changes nothing is indistinguishable from a gap in the tests"** — **re-cut, bites, recorded.**

### 4. ✅ `TASK-648` — accepted
**Route guard before the act · "never called" ASSERTED, not inferred · the teacher's own door with TODAY still cancels (pinned) · the exactly-once claim scoped to the ACT with all three call sites named rather than a loosened count** ✅ · ⭐ **`A5` is the owner's exact case — the boundary slipping by one.**
📋 **Your refusal sentence is APPROVED as drafted** — it names what to do instead and is Thai-only like every refusal beside it.

### 5. ▶️ Next
**Nothing owed for the batch. It is READY and I am telling @Porter now.** ⏭️ **After it ships: `TASK-639`.** ⛔ **Parentless-children (`TASK-644`) and REQ-113 (`TASK-645`) wait on @Porter's claims and the batch closing.**

## 2026-10-04 — @Sober → @Jason: ▶️ **`TASK-650` — the card's "ขยายได้ถึงสัปดาห์ที่ N" still reads the CAPPED rule. 🔴 Blocks uat.**
**The owner closed the batch to new work and wants the rough edges gone before uat.** **Yours is the one DEFECT among them.**
🔴 **`maxWeek` in `toCourseSummary` is `size + quota` — it never reads the stored expiry.** **Since your `646`, the expiry stretches; the label does not.** 🔑 **Your `646`'s cause, one level up: a second reader of the old rule was left behind.**
▶️ **Derive it from the stored `expiryDate` (the inverse of `courseExpiry`), at the source. 🚫 Not on the card — it is Team B's and must not need to change.**
🔴 **Pin: an ordinary course reads exactly `size + quota` at EVERY size.** ⭐ **And add the seam test, as you did for `647`: Tanya's course, through the card's own string, reads the week the make-ups reach.**
📌 **Tell me whether an admin-EXTENDED expiry was mislabelled before — I believe it was, and this fixes it on the same line.** 🚫 **The front's mock copy of the old rule is out of scope.**

## 2026-10-04 — @Sober → @Jason: ✅ **`TASK-650` ACCEPTED.**
**Verified myself: `3903 pass · 0 fail` · `tsc` clean · `65 = 65` · your set 7/7, CHECKSUM identical · and the front repo untouched, as you said.**
⭐ **Rounded UP, with the reason — *a ceiling rounded down is a promise the system does not keep* — and never below the base.** ⭐ **The card string byte-identical for an ordinary course: that is the safety claim, proven rather than argued.**
🔴 **And thank you for the straight answer: YES, admin-extended expiries were mislabelled all along (13 vs 17).** **Same bug, same line — not new work.**
⭐ **Two of yours worth keeping: a MEANINGLESS fixture value becomes a WRONG one the moment something reads it; and a mutation aimed at the wrong line survives for a reason unrelated to the tests.** **Both into `SYSTEM-FACTS.md`.**
▶️ **Nothing owed for the batch. When @Fern's `651` lands I re-run every set and report READY.**
