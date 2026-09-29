# TASK-504 — the 44–46 tests that only pass because a real database answers them — BE, M. **Ordinary maintenance, a file at a time.**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size M**, and deliberately **not urgent**. Owner: mocking tests that were meant to be unit tests is **ordinary work, not an incident**. Your own list from TASK-500 is the spec.

## §0 What this is
With the database pointed at a closed port, **44–46 tests in 16 files fail.** ⚠️ **The count moves between runs** — so those tests are not merely database-dependent, they are **non-deterministic** without one. Today they pass because `sid` answers.
📌 **The honest framing, and it is mine as much as yours: every green count I quoted this week was partly sid-backed.** The mutations, the by-value pins and the source scans stand on their own; the *counts* meant slightly less than I said. This task is how that stops being true.

## §1 The files (yours, from TASK-500)
`middleware/auth` (3) · `services/teacher-help-list-req109` (7) · `services/unmute-and-chips-req107` (7) · `services/co-taught-my-schedule-req109` (3) · `services/duo-suspension-req108` (3) · `services/liff-link-req107` (3) · `services/line-phone-in-silence-req105` (3) · `services/richmenu-round2-req107` (3) · `services/teacher-schedule-tap-req109` (3) · `services/no-token-in-parent-copy-req107` (2) · `services/webhook-never-silent-req105` (2) · `lib/budget-visibility-req102` (1) · `lib/camp-day-rate-req104` (1) · `lib/coach-rate-visibility-req102-6` (1) · `routes/envelope-reachability.route` (1) · `services/camp-absent-terminal-req108` (1).
**The pattern you named:** the LINE dispatcher's unmocked reads and writes (the idempotency store, session and link tables) and the auth guard's user row.

## §2 How, and what I want out of it
- **A file at a time**, each landing green on its own. 🚫 **No big-bang change**; I would rather review sixteen small ones.
- 🔑 **Expect findings, not chores.** *A test that needed a real database was testing something it did not declare.* For each file, say in one line **what it turned out to be exercising** — and if a test's real subject is not what its name says, **that is a finding and I want it named**, not silently mocked into green.
- ⚠️ **Mock the boundary, not the behaviour.** A fake that answers whatever the test needs proves nothing (TASK-466's lesson: *a spy that ignores its arguments cannot see a change to those arguments*). **The fake must run the real `where` / the real arguments** where the assertion depends on them.
- 🚫 **Do not weaken an assertion to make a file pass.** If a test cannot be made honest without a database, **say so and leave it** — I will rule on it individually rather than have it quietly softened.
- 📌 **Report the count each time.** When the last file lands, **the suite should be green with the database unreachable** — that is the finish line, and it is what makes the preload worth re-proposing to the owner.

## §3 Order
Start with the ones that are **slowest to fail** (a retry or repeated queries), because they cost the most on every run today. Then the LINE dispatcher group, which is the largest and most alike — **do the first one carefully and the rest will follow its shape.**

## Definition of Done (per file, and once at the end)
- [ ] Each file green **with the database unreachable**, its subject stated in one line, and any mismatch between a test's name and its real subject **named as a finding** · the fakes honour real arguments where an assertion depends on them · nothing weakened or deleted (anything that cannot be made honest is **left and reported**) · at the end: **the full suite green with no database**, the count stated · tsc 0 · 59 = 59 · report per file + `inbox/SA.md` + log.

---

# ✅ FILE 1/16 — @Jason (2026-09-26) — `services/co-taught-my-schedule-req109.test.ts` (3 tests, the SLOWEST to fail: 10 017 ms)
**Green with the database UNREACHABLE: 7/7** (and 7/7 normally). **Full suite, database unreachable: 3237 pass / 42 fail** (was 44–46) · normally **3279 / 0** · tsc 0 · 59 = 59.

**What it turned out to be exercising — 🔑 a finding:** the file's subject is *"the co-taught class reaches both coaches through every door"*, and that part never touched the database (its reads were already faked, and faked honestly — the booking fake runs the real `ownScopeWhere`). **What needed sid was the LINE dispatcher's own undeclared work on EVERY tap:**
1. a **WRITE** — `unmute(lineUserId)` runs before every postback: `UPDATE line_link_sessions … WHERE line_user_id = $1 AND muted_until > $2`. ⚠️ **So these tests were issuing UPDATEs against sid's `line_link_sessions` on every run.** Harmless in practice — the WHERE only matches a MUTED chat and the test's fake LINE ids match no row — but writes nonetheless;
2. a **READ** — `familyOfLineUser` asks `family_line_links` (via `db.select`, which the file's `findFirst` spies never covered) whether this LINE user is a family.

**How, at the boundary (not the behaviour):**
- `db.update` → an **EMPTY `line_link_sessions`** (true for these chats: the session read already answers none): the update is recorded with its **real rendered WHERE**, touches nothing, and **any OTHER table's write throws** — so a new undeclared write in this path fails loudly instead of reaching a database.
- `db.select` → an **EMPTY `family_line_links`**: the REAL `familyOfLineUser` still runs and falls back to `parents` (none) — a coach's chat is not a family. Any other select throws.
- 📌 **The finding is now PINNED, not just faked:** the TODAY test asserts the tap issues exactly **one** un-mute, **scoped to THIS chat (`U-t2`) and to a mute live now** (`("line_link_sessions"."line_user_id" = $1 and "line_link_sessions"."muted_until" > $2)`).
- **Nothing weakened or deleted:** all the file's assertions are byte-identical; one assertion added.

**Do the fakes still see the subject? Break-and-watch with the database UNREACHABLE (`mut504a.mjs`, `BASELINE=7`, CHECKSUM `033a3908…` identical before/after):**
- **A — the reply reads PRIMARY-only classes again** (the file's own subject): **bites, 3 fail**.
- **B — the un-mute no longer scoped to THIS chat** (every muted chat un-muted — a real defect shape): **bites, 1 fail**.

📌 **The shape for the dispatcher group (the next ~10 files):** the same two boundaries — the un-mute write and the family read — are likely in most of them; I'll apply the same two fakes per file, **pin what each file's path actually writes**, and report per file.

---

# ✅ FILES 2–7/16 — @Jason (2026-09-26) — the LINE dispatcher group, on ONE shared shape. **Database unreachable: 3263 pass / 16 fail** (was 42 after file 1, 44–46 at the start) · normally **3279 / 0** · tsc 0 · 59 = 59

## The shared shape (file 1's fakes, given one home)
**`src/test-support/line-dispatch-fakes.ts`**: test support, not a test (no `.test.ts`, so bun does not run it). Two separable fakes, because one file already fakes `db.update` itself and asserts on it:
- **`fakeUnmute(spies, sessions)`**: `db.update` becomes a **`line_link_sessions` TABLE of the declared rows**.
  - It accepts **only the un-mute's exact WHERE** (this chat, muted now), applies it to the declared rows, and records it.
  - **Any other table, or any other WHERE, throws.**
- **`fakeFamilyLinks(spies, families)`**: `db.select` becomes a **`family_line_links` TABLE**, answered by the **real `line_user_id` asked for**, so the real `familyOfLineUser` still runs.
  - **Any other table or WHERE throws.**
- **`fakeDispatchBoundary`** is both together. **File 1 was moved onto it**, and its un-mute pin still holds.
- 🔑 **Why "throws":** a new undeclared database touch on the dispatcher path now fails loudly instead of silently needing sid again.

## Per file: what it turned out to be exercising (database unreachable ⇒ normal)
- **2. `teacher-schedule-tap-req109`** (4 ⇒ 4): the teacher's schedule taps. Needed sid only for **the un-mute WRITE** every tap issues. `fakeDispatchBoundary`.
- **3. `teacher-help-list-req109`** (9 ⇒ 9): the teacher's Language/Help reply. Needed sid only for **the family READ** (is this chat a family? no, it is a coach). `fakeDispatchBoundary`.
- **4. `unmute-and-chips-req107`** (10 ⇒ 10): the un-mute reply and its chips. Needed sid only for **the family READ**.
  - ⚠️ **Finding:** this file **already faked `db.update` itself, ignoring its WHERE** (TASK-466's smell). It records the patch but can't see *which* chat is un-muted. **I left its fake in place** (its tests assert on what it records; replacing it could weaken them) and added only `fakeFamilyLinks(spies, { [U]: "p1" })`, the same family its `findFirst` spy already answers.
  - **The un-mute's per-chat scoping is pinned in file 1** (break-and-watch B there). If you want this file's own update fake made WHERE-aware, that's a small follow-up; I didn't do it inside a no-weakening task.
- **5. `richmenu-round2-req107`** (14 ⇒ 14): the rich-menu flows. **The family READ** only.
- **6. `no-token-in-parent-copy-req107`** (9 ⇒ 9): the "too late" line in the chat's language. **The un-mute WRITE**, plus the outbox tick (next section).
- **7. `duo-suspension-req108`** (13 ⇒ 13, **mine**, TASK-489): the LINE-door tests. **The un-mute WRITE**, plus the outbox tick.
- **None of the six had a name/subject mismatch:** each test's real subject is what its name says. What needed sid was always the dispatcher's own two undeclared touches, never the thing under test.

## 🔴 A finding for you, not fixed: a test process acts as a SECOND OUTBOX WORKER for sid
- In the files that build the ROOT app (`import("../index")`), the remaining unmocked query was **`SELECT … FROM notification_outbox`**: **the outbox worker's BOOT TICK**, started by `index.ts` on import.
- **Because `.env` carries sid's real LINE token, every such test process reads sid's outbox and would DELIVER any pending rows**, racing sid's own worker.
- It never fails a test (the tick's error is caught), which is why it went unnoticed. Testing on sid is by design, but **a test run delivering sid's queued LINE messages** is a different thing, and yours or the owner's to rule on.
- **The narrow fix, if you want it:** don't start the worker when the module is imported by `bun test`. It would be one line in `index.ts`, a production file, so **not done here.**

## Do the fakes still see each file's SUBJECT? Break-and-watch with the database UNREACHABLE (`mut504a.mjs`, checksum `9bd1a70b…` identical before/after)
- **A — duo-suspension's subject: "ANY household" restored** (B's suspension turns A away): **bites, 6 fail**.
- **B — teacher-help-list's subject: the approved teacher list altered**: **bites, 1 fail**. (My first anchor didn't match, an escaping slip in the mutation file; I re-ran it with a unique anchor.)
- **C — no-token's subject: "too late" no longer in the chat's language**: **bites, 2 fail**.
- (File 1's two, earlier: the co-taught subject and the un-mute scoping, both bite.)

## Nothing weakened or deleted
Every existing assertion is byte-identical. The only additions are the fake calls, their imports, and file 1's un-mute pin.

## Left: 9 files, 16 tests (database unreachable)
`middleware/auth` (3) · `liff-link-req107` (3) · `line-phone-in-silence-req105` (3) · `webhook-never-silent-req105` (2) · `budget-visibility-req102` (1) · `camp-day-rate-req104` (1) · `coach-rate-visibility-req102-6` (1) · `envelope-reachability.route` (1) · `camp-absent-terminal-req108` (1).

---

# ✅ FILES 1–7 REVIEWED — @Sober (2026-09-26). ▶️ Continue. 🔴 **The outbox finding is TASK-505, and it is the most important thing in this report.**
Verified by me, both ways: **normal 3279 pass / 0 fail**, and **with the database unreachable 3263 pass / 16 fail** — his numbers exactly, down from 44–46. ⚠️ **I reproduced the unreachable run by pointing `DATABASE_URL` at a closed local port in that process only** — nothing touched, and it is now how I will check this task's progress.

## 🔑 The finding in file 1 is the one that justifies the whole task
The file's own subject — *"a co-taught class reaches both coaches"* — **never touched the database.** What needed `sid` was **the dispatcher's own undeclared work on every tap**: an `UPDATE line_link_sessions` (the un-mute) and a read of `family_line_links`.
⇒ **These tests were issuing UPDATEs against `sid` on every run.** Harmless in fact (the WHERE matches only a muted chat, and the fixtures' LINE ids match no row) — **and he says that plainly rather than either hiding it or inflating it.**
📌 **This is exactly what I meant by "a test that needed a real database was testing something it did not declare", and it is better than I expected:** the undeclared thing was not a shortcut in the test, it was **a side effect of the code under test that nobody had written down.** The un-mute's per-chat scoping is **now pinned by value** (`line_user_id = $1 AND muted_until > $2`) — **a behaviour we relied on and had never asserted.**

## ✅ The shared shape is right, and one decision in it is better than "mock it"
**`fakeUnmute` / `fakeFamilyLinks` accept only the exact table and WHERE they declare, and THROW on anything else.** 🔑 **That is the difference between a fake and a hole:** a new undeclared database touch on this path now **fails loudly** instead of silently needing `sid` again. **The fakes cannot rot into permissiveness**, which is the usual fate of shared test support.
✅ **And the fakes run the real predicates** (`ownScopeWhere`, the real `familyOfLineUser` falling through to `parents`) — TASK-466's lesson applied without being told.
✅ **Six files, no name/subject mismatch, and he says so** rather than manufacturing findings to look thorough. **A report that says "nothing here" where nothing is there is worth more than one that always finds something.**

## ✅ File 4's pre-existing fake: his call accepted
It already fakes `db.update` **ignoring its WHERE** (TASK-466's smell). He left it, added only the family fake, and noted the scoping is pinned in file 1. **Right: a no-weakening task is not the place to replace another file's assertions**, and the property is covered elsewhere. **A small follow-up when the group is done — not now, and not inside this task.**

## 🔴 TASK-505 — the outbox finding. Cut, and thank you for not touching it.
**A test process that imports the root app starts the outbox worker's boot tick, reads `sid`'s `notification_outbox`, and — because `.env` carries a real token — would DELIVER any pending rows, racing `sid`'s own worker.** The tick's error is caught, which is why it was invisible.
🔑 **The owner ruled that testing against `sid` is by design. He did not rule that a test run may SEND messages** — and those are different acts: one reads a box we own, the other **puts text on a real person's phone.** 📌 And it is worse than it looks in one respect: **during the 09-26 release window `.env` held the REAL OA token**, so a test run in that window could have delivered the customer's own queued messages.
⇒ **One line in `index.ts`, its own task, and you were right not to put a production change inside a mocking task.**

---

# ✅ FILES 8–16/16 + 🏁 THE FINISH LINE — @Jason (2026-09-26): **the full suite is GREEN with the database UNREACHABLE: 3285 pass / 0 fail, three runs in a row, identical.** Normally 3285 / 0 (twice) · tsc 0 · 59 = 59
The unreachable count that moved between 44 and 46 (and 16–20 on your machine) is now **0, and stable**. It was measured, as you do, by pointing `DATABASE_URL` at a closed local port in that process only.

## Per file: what it turned out to be exercising (all green both ways)
- **8. `liff-link-req107`** (10) and **9. `line-phone-in-silence-req105`** (9): the dispatcher's **family read** again. Both already fake `db.update` themselves, so each got only `fakeFamilyLinks`, declaring **the same family** its `findFirst` spy answers (`p1` when linked as a customer, none otherwise).
- **10. `middleware/auth`** (8): 🔑 **a finding.** The LOGIN's own answer (`userDTO` → `userGrantKeys`) reads the user's **individual grants** via a `db.select` on `user_permissions`. The file spied the guard's grant read but not that one, and the app's error handler turned the refused connection into a bare 500 (no query was printed).
  - Faked as an **empty `user_permissions`**, answering only the real `WHERE user_id = $1`; any other select throws.
  - **Pinned:** the login reads **this user's own grants, once** (`grantReads = [ROW.id]`).
- **11. `webhook-never-silent-req105`** (10): 🔑 **a finding with a twist.** The undeclared family read failed, and **the very safety net this file tests caught it** and replied with the apology, which the tests (rightly) rejected. **The subject hid the dependency.** Both harnesses now declare "no family link" with `fakeFamilyLinks`.
- **12. `budget-visibility-req102`** (11) and **13. `coach-rate-visibility-req102-6`** (9): 🔑 **a finding: a DEAD spy.** Both spied `db.query.campWeeks.findMany` to answer "no camp weeks", but the calendar **no longer makes that read**: it goes through `weeksForCalendar` → `listWeeks` (a `db.select`). **The spy was aimed at nothing, and the real query went to the database.**
  - **Re-aimed** at `campSvc.weeksForCalendar`, with **the same answer** (`[]`) at the read the code actually makes. The comment says what it replaced.
  - The old line was replaced rather than left beside it: a spy that intercepts nothing is decoration.
- **14. `camp-day-rate-req104`** (10): `checkinByToken` runs the **suspension guard (TASK-476/489) before it computes `remaining`**, and the guard reads the child's household. **This test predates the guard**, so the read was never declared.
  - Declared by the real id asked for: S1 exists with **no parent** (a walk-in), so there is no household to suspend.
- **15. `envelope-reachability.route`** (8): the ICS feed looks its teacher up by calendar token. **The 404 this test pins was the real database answering "no such teacher".**
  - Declared: no teacher holds `nonexistent`, answered by the real token asked for.
  - **Pinned:** it asked, once, by that token.
- **16. `camp-absent-terminal-req108`** (7): the shop front reads the check-in window from `app_settings`. **This test ran on whatever the real database's settings held.**
  - Declared: no rows, so the **defaults** apply. An ABSENT day is refused whatever the window (the subject mutation below confirms the file still sees it).
- **No test's name disagreed with its subject** in any of the 16. What needed a database was always an undeclared read or write **around** the subject: the dispatcher's un-mute and family read, the login's grant read, a dead spy, a guard added after the test, a settings read.

## Do the fakes still see the SUBJECTS? Subject mutations with the database UNREACHABLE
**All bite. CHECKSUM `76bbef6c…` identical before and after this batch.**
- **Files 1–7** (earlier): co-taught primary-only · un-mute unscoped · duo "any household" · teacher list altered · "too late" language.
- **This batch:**
  - **A — camp-absent-terminal: the shop front OFFERS an ABSENT day**: **bites, 1 fail**.
  - **B — envelope-reachability: the ICS 404 no longer a plain body**: **bites, 3 fail**.
  - **C — coach-rate-visibility: the mask lets every viewer see the rate**: **bites, 2 fail**.

## ⚠️ Three findings OUTSIDE the 16: tests that pass WHETHER OR NOT the database answers (named, not changed)
Each unreachable run still logs **3 failed queries** that fail no test. They are in files that were never on the list, **because their assertions tolerate a database error**:
1. 🔴 **`lib/rbac-stage2-menu-guard-req092`**: `expect(login.status).not.toBe(401 + 1000)`, i.e. **"not 1401"**. **That assertion can never fail** (no HTTP status is 1401). Its comment claims it proves "a 401 from `authenticate`, never the guard's", but it passes on **401** (database answers) and **500** (database refused) alike. **It pins nothing.**
   - The honest version is `toBe(401)` with a declared `users` read. That is **strengthening someone else's assertion**, so it's **yours to rule on.**
2. **`routes/eligible.route`**: a *control* asserting `not.toBe(400)` ("reaches the search handler"). With the database refused it gets 500, which still reaches the handler, so **its claim holds**, but it does touch the database. Low priority.
3. **`lib/webhook-ack-first-req105`**: the event's handling errors on an undeclared `teachers` read (logged), but the test only checks **acknowledgement order**, which doesn't depend on it. Low priority.

**None fails a test, so the finish line stands.** If you want strict "no database touched at all", these three are the remaining work: small, and (1) is the one worth doing.

## 📌 On the preload
Your condition was a green unreachable run. **It now exists.** Re-proposing the preload to the owner is yours (and his); nothing here builds it. The three tolerated touches above would be the only things it would expose, and all three already pass.

## Nothing weakened or deleted
Every existing assertion is byte-identical. The changes are:
- the shared fakes' calls and imports;
- the declared reads (files 10, 14, 15, 16);
- two new pins (file 10's grant read, file 15's token);
- the dead camp-weeks spy **re-aimed** (files 12–13), with the same answer.

⛔ Only you mark this DONE.

---

# 🏁 DONE — REVIEWED by @Sober (2026-09-26). **The suite is green with no database, and I checked it myself.**
**Three consecutive unreachable-database runs by me: 3285 pass / 0 fail, identical each time.** Normally 3285 / 0 · tsc 0 · 59 = 59. **Sixteen files, from 44–46 unstable failures to a stable zero.**
📌 **This is the first number in this project that means exactly what it says.** Every green count I quoted before today was partly `sid`-backed; from now on a green run is a statement about the code.

## The findings, which is why this was worth doing as work rather than as cleanup
Four of the nine are worth naming permanently:
1. 🔑 **`auth`: the LOGIN reads the user's own grants, and nothing declared it.** A test of signing in was silently depending on a second read nobody had written down — now declared and pinned.
2. 🔴 **`webhook-never-silent`: the safety net under test CAUGHT the missing read and replied with the apology — hiding it.** That is the worst shape a defect can take: **the thing that makes a failure survivable also makes it invisible**, so the test passed while the code was doing something nobody intended. It is exactly why "it passes" was never enough on this path.
3. 🔑 **`budget`/`coach-rate` visibility: a DEAD SPY.** It faked `db.query.campWeeks.findMany` — a read **the calendar no longer makes**. So part of that test was pinning a call that does not happen; re-aimed at `weeksForCalendar`, same answer. 📌 **A spy on a call nobody makes is a test asserting nothing while looking thorough**, and no count would ever have shown it.
4. **`envelope-reachability`: its 404 was `sid` saying "no such teacher".** The test believed it was asserting a route's shape; it was asserting a row's absence on a live box.
✅ **And no name/subject mismatch anywhere in the sixteen** — he checked for it each time and said so each time.

## ✅ What he named and did not touch — all three correctly
- 🔴 **`rbac-stage2` asserts `not.toBe(401 + 1000)` — vacuous: it can never fail.** ⇒ **TASK-507**, with the other two DB-tolerant tests.
- `eligible.route`'s control and `webhook-ack-first` touch the database but their claims hold — **named, left, and they are the three failed queries still logged per unreachable run.**

## ▶️ The preload: the condition is met, and it goes to the OWNER, not to me
He ruled against the dead-port preload because it would have made the suite red. **It no longer would: the suite is green with no database at all.** So the preload now costs nothing and would guarantee that **no future test quietly starts needing `sid` again** — which is the only way this comes back.
📌 **But it is still his call, and I will put it to him honestly: it changes nothing today. Its whole value is the next unnoticed one.** I am not going to sell it as more than that, and if he says no, the answer is fine — **we keep the guarantee by watching for it, which is how we found it.**
