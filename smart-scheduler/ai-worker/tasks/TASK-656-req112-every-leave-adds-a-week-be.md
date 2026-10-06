# TASK-656 — BE: **REQ-112 core — EVERY leave adds ONE week; the counter stops gating** — @Jason, Wed–Thu
**From @Sober to @Jason.** ⚖️ **Source of truth: `requirements/REQ-112-khwan-expiry-extended-leave-timeline.md` §11 (Khwan's model) + §⚖️ 2026-10-06 (owner rulings 1–4, IN FORCE).** **Sizing: `SIZING-teamA-next-round-2026-10-05.md` 10-06 addendum.**
✅ **Claim (Team A):** `src/services/scheduler.service.ts` · `src/lib/leave.ts` · `src/lib/course-plan.ts` · `src/lib/course-start-change.ts` · `src/lib/recurring.ts` · `src/services/line-webhook.service.ts` (the leave reply's lock line only) · `src/lib/line-i18n.ts` (`leave_lockline` only) · their co-located tests. 🚫 **NOT** `undo.service.ts` / `booking-undo.ts` (that is `TASK-657`, Friday) · 🚫 no Team B file (`camp.service.ts` included).
🔴 **SHIP-SET: `TASK-656` + `TASK-657` + `TASK-658` ship TOGETHER to sid (batch #2) — or not at all.** **656 alone removes the silent stretch before 657's admin flag exists.**
⚠️ **No database anywhere — the DB-unreachable run only. No migration expected; if you find you need one, STOP and tell me.**

---

## 1. The rule, in her words and the owner's
1. **Base validity UNCHANGED:** `maxWeekFor(size, quota) = size + quota` ⇒ **4⇒5 · 6⇒8 · 10⇒13 weeks** (`courseExpiry` = start + (week − 1) × 7 days). **The number stops being a LIMIT and becomes only the BASE.**
2. 🔴 **EVERY leave adds ONE week (7 days) to the course's expiry, at the moment the leave is taken.** **Today a mid-course leave adds nothing unless its make-up lands past the expiry — that is the behaviour change.**
3. **Ruling 1 — FORWARD-ONLY:** applies to leaves taken from the ship date. 🚫 **No recompute, no back-fill, no data step. An existing course's expiry moves ONLY when a NEW leave is taken on it.**
4. **Ruling 3 — a make-up past the expiry is CREATED, never held, never refused, and 🚫 the expiry is NEVER silently extended to fit it.** ⇒ **`reconcileCoursePlan`'s stretch-to-fit (`expiryAfterAppends`, ~:2951–3035) comes OUT.** **The admin flag for it is `TASK-657` §3** — which is why they ship together.
5. **Ruling 4 — ALL doors add a week; ONE helper; no per-door variation.**

## 2. 🔴 THE DOORS — the owner named five CATEGORIES; the CODE has more PATHS. Every one is in scope.
**My map from reading the code (verify it; 🚫 do not trust it):**
| owner's door | code path(s) I found |
|---|---|
| **parent** | `line-webhook.service.ts:1056` → `updateBookingStatus(…, "sick-leave")` |
| **admin** | the session's **Record leave** → `updateBookingStatus` sick-leave (~:4040–4075) · 🔴 **the plan editor's `Mark absence` → `applyPlanChange` (~:3590–3610)** — found by @Silver; **today it CHARGES and refuses `LEAVE_LOCKED` while the session's button is free pre-start: two doors, two answers for one act** |
| **the coach's own cancel** + **an admin-recorded coach leave** | `reportTeacherLeave` (~:3372, `onBehalf` for the admin) — cancels each class `TEACHER_LEAVE` and re-owes via `reconcileCoursePlan(…, { reowedFor })` |
| **a school cancel** | `updateBookingStatus` cancel on a course session (~:3966) · a group date → `cancelSeatsOfGroup` (~:1880) |
| *(already +1/absence today — must use the SAME arithmetic)* | course creation's declared absences (`courseBornCeiling`, ~:2271) · the pre-start declaration (`preStartDeclaration`, TASK-609/646, ~:4122) · a start-date change re-plan (`course-start-change.ts:79`) |
▶️ **Your first deliverable is the TRUE table** — every path that turns a LIVE course session into an absence that earns a make-up. 🔴 **If you find a path NOT in my table, it is in scope: add it and tell me.** **If one of mine is NOT such a path, say why.**
🔑 **One mechanical criterion so nothing is missed:** *every write of `SICK_LEAVE` onto a course row, and every `reconcileCoursePlan(…, { reowedFor })`.*

## 3. ▶️ What to build
- **ONE helper** (e.g. `addLeaveWeek(tx, courseId, why)`) — `expiryDate += 7 days`, recorded through the ONE expiry writer (`recordExpiryChange`) **with no actor (the system) and a reason naming the door** (so the Undo in `TASK-657` can find the week it added). **The declared-absence arithmetic (`courseBornCeiling`, start-change) states the SAME "+7 per absence" — one rule, two spellings is how the LAST badge cost three days.**
- **Every path in your table calls it exactly once per absence.** 🚫 **Never +2 for one leave** (e.g. a leave AND its re-owe both adding), 🚫 **never 0.** **Whether you call it at each door or at ONE choke point that every door passes, is your design — justify it in the report.**
- **The counter stops GATING:** `canTakeLeave` / `leaveLocked` / `adminUnlocked` stop deciding anything; **`LEAVE_LOCKED` is no longer thrown**; every leave gets its make-up. **`leave_lockline` (the parent's LINE "quota full" line) stops being sent.** 📌 **`plannedAtCreation` STAYS** (TASK-609's warning: clearing it changes Undo answers).
- **`leaveUsed` becomes a plain COUNT of leaves taken** — incremented once per leave on every door, no limit. **State the meaning change at the column and in SYSTEM-FACTS.** *(The screens stop showing "x of y" in `TASK-658`.)*
- **Pre-start (REQ-111 F):** 📌 **there is NO cap today** — `TASK-643` removed it on 10-04. ⇒ **under REQ-112 a pre-start declaration is simply one more leave that adds a week, through the same helper.** **`preStartDeclaration` keeps deciding only that it is FREE (no counter), which now means nothing extra — keep the predicate, pin that both admin doors (session button AND plan editor) answer the SAME.** ⚠️ **`courseNotStarted` (`course-start-change.ts:39-41`) is NOT the ACTIVE status:** a course stops being "not started" the moment today's class is checked in — **including by tonight's end-of-day auto check-in.** **Pin that boundary by value.**

## 4. 🔴 The pins that make a second place impossible — @Porter's condition
1. **Per-door VALUE tests — the real proof:** for EVERY row of your table, a leave/cancel through that path ⇒ **expiry exactly +7 days, exactly one expiry-change record, exactly one make-up.** **Incl. the plan editor's `Mark absence` and a group-date cancel.**
2. **The helper's call sites, pinned by COUNT, by value — against YOUR table, not against "five".** 🔴 **If the pin is written to five and the plan editor is a sixth, the pin passes and the defect ships.**
3. **The writers of `coursePackages.expiryDate`, pinned as an exact list** (today: creation · the helper · the admin's own expiry edit · plan apply · start change · the Undo). 🔑 **A new place that moves the expiry must fail a test, not pass review.**
4. **Ruling 3:** a make-up that lands past the expiry ⇒ **created, expiry UNCHANGED** (value test). **The stretch-to-fit's removal bites in a mutation.**
5. **Forward-only:** an existing course with past leaves and no new one ⇒ **expiry byte-identical** after deploy (no code path recomputes it on read).

## 5. ✅ Done means
1. **`tsc` · the DB-unreachable suite with COUNTS** (⚠️ the 5 camp DATE-BOMB failures are Team B's and known — report them separately, never in your count) · **`65 = 65`.**
2. **The door table** in your report — path, file:line, which owner door, and how it reaches the helper.
3. **Mutations, filed, test list IN the file:** each door's call removed (each must BITE alone) · the helper adds 14 days · `LEAVE_LOCKED` re-introduced · the stretch-to-fit restored · the plan editor charging again · `courseBornCeiling` using a different week count than the helper.
4. **Nothing in `undo.service.ts` / `booking-undo.ts`** — that is Friday's.

## 6. 🔴 THE sid GATE — how @Tanya hand-checks the expiry (written now, so she does not invent it)
**On sid (her full-access box). For EACH size 4 / 6 / 10, a fresh course, first session D. Worked example: D = Wed 2026-10-14.**
| step | action | expected expiry | 4-session | 6-session | 10-session |
|---|---|---|---|---|---|
| 0 | create the course, no declared absence | **D + (base − 1) weeks** | **2026-11-11** (wk 5) | **2026-12-02** (wk 8) | **2027-01-06** (wk 13) |
| 1 | session 2 → the session's **Record leave** | **+7** | 2026-11-18 | 2026-12-09 | 2027-01-13 |
| 2 | session 3 → the plan modal's **Mark absence** | **+7 again — same rule, other door** | 2026-11-25 | 2026-12-16 | 2027-01-20 |
| 3 | *(10 only)* an admin records the coach's leave on session 4's date | **+7** | — | — | 2027-01-27 |
| 4 | *(6 only)* the admin CANCELS session 4 (school cancel) | **+7** | — | 2026-12-23 | — |
**At every step also check:** **one make-up appended per absence · NO "x of y leaves" anywhere · no `LEAVE_LOCKED` · the card's "ขยายได้ถึงสัปดาห์ที่ N" = the expected expiry's week.**
**Ruling 3, once:** on the 4-session course, the admin moves the expiry EARLIER by hand to the last session's date, then records one more leave ⇒ **the make-up is CREATED past the expiry, the expiry is ONLY +7 from the moved date (not stretched to fit), and the admin is flagged (`TASK-657`).**
**Forward-only, once:** an EXISTING sid course with past leaves, untouched ⇒ **its expiry is exactly what it was before the deploy** (read it before; read it after).
📌 **If D is not 2026-10-14, the expected dates are D + 28 / 49 / 84 days at step 0, and +7 per step.**

## 2026-10-06 — @Jason → @Sober: ▶️ **`TASK-656` deliverable 1 — the TRUE door table** · 🛑 **and ONE stop before I wire the helper**

### 🛑 THE STOP — **the "reason naming the door" needs a COLUMN that does not exist**
**§3 asks for the +7 to be recorded through `recordExpiryChange` *"with no actor (the system) and a reason naming the door (so the Undo in `TASK-657` can find the week it added)"*.**
🔴 **`course_expiry_changes` has `course_id · from_date · to_date · actor · changed_at` and NOTHING else.** **There is no reason/why/source column.** ⇒ **a reason cannot be recorded without a migration**, and the task says a migration is a STOP.
**The three ways I can see, with my recommendation:**
1. ⭐ **RECOMMENDED — one nullable `reason text` column, one migration (0066).** **It is the only option that lets `TASK-657` find the week by FACT rather than by inference, and the audit answer *"why did this date move?"* is the table's own stated purpose.** 📌 **One column, nullable, no backfill — forward-only like ruling 1.**
2. 🚫 **Put a sentinel in `actor`** (e.g. `"system:leave"`). **I will not do this without your word:** that column's own comment says it is the TOKEN's subject and *"a path with no authenticated user must write nothing rather than write a lie"* — and you asked for **no actor**. **It would also make every existing actor reader ambiguous.**
3. ⚠️ **Record nothing, and have `TASK-657` INFER the week** (a row for that course, `actor IS NULL`, `to = from + 7`). **Works until two leaves land in one day, or an admin's own −7 edit looks the same.** 🔑 **An inference that is usually right is the thing we keep removing.**
▶️ **Your ruling. Meanwhile I am building everything that does NOT depend on it** — the helper, every door, the counter change, the stretch-to-fit removal and the pins — **and the helper will take the reason as an argument from the start, so option 1 is a column plus one line when you rule.**

### ✅ Deliverable 1 — THE DOOR TABLE, verified against the code
**Criterion used, exactly as you gave it:** *every write of `SICK_LEAVE` onto a course row, and every `reconcileCoursePlan(…, { reowedFor })`.*

| # | code path | file:line | owner's door | reaches the helper |
|---|---|---|---|---|
| **1** | `updateBookingStatus(id, "sick-leave")` — the leave branch | `scheduler.service.ts:4060` | **parent** (`line-webhook.service.ts:1056`) **AND admin** (the session's *Record leave*) | ONE write, TWO callers — the helper is called once in the branch |
| **2** | `applyPlanChange` — *Mark absence* | `:3598` (write) + `:3609` (reconcile) | **admin**, plan editor | 🔴 @Silver's find — **today it CHARGES and can refuse `LEAVE_LOCKED` while door 1 is free** |
| **3** | `reportTeacherLeave` — each class `CANCELLED`/`TEACHER_LEAVE` + re-owe | `:3409` | **the coach's own cancel** · **an admin on behalf** (`onBehalf`) | once per CLASS cancelled (one absence, one week) |
| **4** | `updateBookingStatus` — cancel on a course session | `:3966` | **a school cancel** | re-owes via `{ reowedFor }` |
| **5** | `cancelSeatsOfGroup` — a group DATE cancelled | `:1887` | **a school cancel** (group) | once per seat whose course re-owes |
| **6** | course creation's declared absences | `:2303` · `:2347`, ceiling at `:2271` | *(already +1 per absence)* | 🚫 no helper call — it must use the SAME arithmetic, pinned |
| **7** | the pre-start declaration | door **1** with `declaredFree`; stretch at `:4122` (TASK-646) | *(already +1)* | it IS door 1 — 🔑 **not a separate door**, which is why door 1 must add exactly one week and not two |
| **8** | a start-date change re-plan | `course-start-change.ts:79` | *(already +1)* | 🚫 no helper call — same arithmetic, pinned |

**🔴 Three corrections to your map:**
1. **Your table lists the parent and the admin's *Record leave* as two doors. In the CODE they are ONE path** (`updateBookingStatus`'s leave branch) with two callers. ⇒ **the helper is called once there, and a per-door pin written as "one call per door" would otherwise demand two and be wrong.**
2. **The pre-start declaration is NOT a separate path** — it is door 1 with `declaredFree`, and TASK-646 already stretches the expiry on it through `courseBornCeiling`. 🔴 **So door 1 is the one place where +14 is a real risk: the declaration's recompute AND the new +7 would both fire.** **I will make them one answer and pin it by value.**
3. **`applyPlanChange` has a SECOND `reconcileCoursePlan` at `:3657` — it is the INSERT path (adding a session), not an absence.** 🚫 **Not a door.** **Checked rather than assumed.**
**And two that are NOT doors, named so the count is closed:** `undo.service.ts:186` (yours on Friday) · `db/seed.ts:211` (a fixture).
⇒ **SIX paths call the helper (1–5, and 1 covers 7); TWO more (6, 8) must agree with its arithmetic without calling it.** **That is the number the call-site pin will be written to — not "five".**


## ⚖️ 2026-10-06 — @Sober: §3's "reason naming the door" is STRUCK — no column, no migration.
**`TASK-657` §1 never looks for "the week it added" (it gives back one week only if the last week is empty), so the premise was left over from the old rule.** **Record the +7 through `recordExpiryChange` with actor NULL and nothing else.** **Add a pin: after creation, the helper is the ONLY actor-less writer of the expiry ⇒ "actor NULL, +7" in the history means "a leave added a week", by the writer list (§4.3).** **Door table accepted (8 rows); the call-site pin is written to the count of actual helper calls, listed by file:line — reconcile "six" vs the five calls in rows 1–5.**

## ✅ 2026-10-06 — @Jason: `TASK-656` DONE — and the value tests found THREE defects in my own first draft of the doors
**`tsc` 0 · the DB-unreachable suite 4081 pass · 1 fail · `65 = 65`, no migration.**
⚠️ **The ONE failure is NOT mine and is not the camp bombs (those are gone):** `archive-owed-task667.mutations.json` — its anchor `inArray(bookings.status, [...ARCHIVE_BLOCKING_STATUSES])` now matches **TWICE** in `parent.service.ts`. **It is TASK-667's set (untracked, in-flight alongside an in-progress edit of `parent.service.ts`), I have not touched it, and it is reported separately — never inside my count.** *It surfaced only because I widened an integrity check — see "A guard I had gotten wrong", below.*
**Set: `src/services/every-leave-adds-a-week-task656.mutations.json` — 18 / 18 BITE**, baseline 72, CHECKSUM identical, every restore byte-identical. **Test list in the file.**

### ① The door table — final, with the call sites CHECKABLE
**FIVE calls, not six** (your reconciliation was right; my "six" was a miscount, and 1–5 are five with 7 inside 1):
| # | call site | door | owner's category |
|---|---|---|---|
| 1 | `scheduler.service.ts:4153` `leave:session-button` | the session's *Record leave* — **admin button AND parent through LINE, ONE path** · the pre-start declaration is THIS door with `declaredFree` | parent · admin |
| 2 | `scheduler.service.ts:3621` `leave:plan-editor` | the plan editor's *Mark absence* | admin |
| 3 | `scheduler.service.ts:3404` `leave:teacher-leave` | the coach's own cancel / an admin on their behalf — **once per CLASS** | coach · admin-on-behalf |
| 4 | `scheduler.service.ts:3984` `leave:school-cancel` | a school cancel of a course session (**incl. a cancelled MAKE-UP**) | school cancel |
| 5 | `scheduler.service.ts:1890` `leave:group-cancel` | a group date cancelled — **once per SEAT** | school cancel (group) |
**Two paths state the SAME arithmetic WITHOUT calling the helper:** creation's declared absences (`courseBornCeiling`) and the start-date re-plan (`course-start-change.ts:79`). The pin is written to the COUNT IN THE CODE (5, by name) — and the test fails with the NAME of a door that is missing.

### ② 🔴 THE DEFECTS MY OWN VALUE TESTS FOUND — the part you asked me to take seriously
**I wrote the doors, got a green suite, and was one report away from calling it done. Then I wrote tests that act on the SAME row TWICE — and three things were wrong, all of them the "never +2 for one leave" case you named:**
1. 🔴 **Door 2 (`Mark absence`): re-marking a row that is ALREADY an absence added a SECOND WEEK** (and counted a second leave). That door deliberately accepts re-marks (TASK-148) and has no guard that the row is still live.
2. 🔴 **Door 2: on a not-started course a re-mark of a CHARGED leave FLIPPED IT TO FREE.** `courseNotStarted` is still true for a course carrying a charged leave with nothing delivered — **the very case you warned about — so the no-conversion rule would have been broken by a double-click.**
3. 🔴 **Door 4: cancelling the SAME row twice added a second week.**
**All three FAILED on the draft** (I ran them before fixing — 3 red / 0 green). **One rule fixes them: everything an absence EARNS — its week, its charge flag, its free/charged decision — happens only on the TRANSITION from a live lesson into an absence** (`becomesAbsence`, and a live-status guard at door 4). **A re-mark still updates the status and note it always did, and touches nothing else.**
✅ **Doors 1, 3 and 5 were already idempotent by their own filters** (door 1 has a `SICK_LEAVE` no-op branch; 3 and 5 only act on live rows) — **I tested that rather than assumed it.**
🔑 **`I1`/`I2`/`I3` are those three, each as its own mutation, and each bites.** ⚠️ **They would have SURVIVED my first tests, because those acted on each row once.**
⚠️ **Behaviour change you should know about: a re-mark used to increment `leaveUsed` AGAIN each time. It no longer does.** That is a fix to an existing double-count, but it is a change, and I made it.

### ③ 🔴 The +14 at door 1 — the one you said you would check hardest
**Closed by REPLACING TASK-646's recompute, not placing the helper beside it** (the recompute produced +1 week per declared absence, which is exactly what the helper adds). **By value, through the real `updateBookingStatus`:** a pre-start declaration ⇒ **+7, ONE record, ONE make-up** · **two declarations in sequence ⇒ +14 total (one week each, two records — never +28)** · **a course whose first class was checked in TODAY ⇒ no longer "not started", still +7** (the boundary you named). **`W2` puts a second `+7` beside the helper and bites.**

### ④ Both admin doors answer the SAME — and I had claimed it before it was true
**§3 asked me to pin that the session button and the plan editor answer the same for one act. My first test was TITLED "it answers the SAME as door 1" and only checked the week.** **It was not true: door 2 still CHARGED a pre-start leave while door 1 marked it free. I had removed its LOCK but not its CHARGE** — and a comment I wrote there said *"They answer the same now"*, **which was false as written.**
✅ **Door 2 now asks the SAME `preStartDeclaration` as door 1, computed before the row flips.** **The test now runs ONE act through BOTH doors on identical worlds and compares the whole record** — `plannedAtCreation`, `leaveCharged`, `leaveUsed`, the expiry, the record count, the make-up count — **and on a STARTED course both COUNT it** (so it is the predicate and not a blanket). `C1`/`C2` bite.
🔑 ***A title is a claim; if the body does not check it, the title is the bug.***

### ⑤ Ruling 3, forward-only, and the writers
- **Ruling 3, by value:** the admin moves the expiry earlier by hand, one more leave ⇒ **the make-up is CREATED past the expiry, the expiry is ONLY +7 from the moved date, and it did NOT follow the make-up.** `S1` restores the stretch-to-fit and bites.
- **Forward-only, by value:** a course with past leaves and no new one ⇒ expiry **byte-identical**, and every read path (the summary builder) leaves it alone and records nothing. `F1` makes the summary write the expiry and bites.
- 🔴 **The writers of `coursePackages.expiryDate` — SEVEN, not six, and pinned BY FUNCTION NAME**, derived from the source: `createCoursePackage` · **`importCoursePackage` (a SECOND birth path your list did not have)** · `addLeaveWeek` · `updateCourseExpiry` · `changeCourseStart` · **`resumeCourse` (your "plan apply" — `applyPlanChange` never writes the expiry, it calls the helper)** · the Undo's `undoBooking`. **A new place that moves an expiry now fails with its NAME.**
- 🔑 **"Actor NULL, +7" = "a leave added a week":** `addLeaveWeek` is the **only** `recordExpiryChange` with a LITERAL `actor: null` (pinned; `R2` gives it an actor and bites), and the Undo carries the caller's actor, never none.
- ⚠️ **ONE LIMIT on that, stated rather than hidden — and it is a correction to the premise of your ruling:** `changeCourseStart` writes **`actor ?? null`**, and `actorOf` returns **null when there is no authenticated user** (dev / `SKIP_AUTH` only). **In production a token always has a username, so your claim holds BY THE AUTH LAYER, not by construction in the code** — and a start-date change of exactly one week with no user would be indistinguishable from a leave. **Pinned as exactly what it is.** 🚫 Not fixed: it is dev-only and out of this task.
- **The helper's arithmetic is ONE atomic statement** (`expiry_date + interval '7 days'`), **not read-then-write** — TASK-492's `leaveUsed` race in its expiry twin. ⚠️ **`R1` makes it read-then-write and bites — but on a SOURCE pin, not a value, because a fake transaction cannot race. That is a real limit of what I can prove here.**

### ⑥ ⚖️ A guard I had gotten wrong — **and it was mine, from `TASK-627`**
**`mutation-sets-task627.test.ts` — the check I wrote so a filed set could never silently rot — scanned `src/lib` ONLY.** **Sets are filed "beside the test they prove", and tests live in `src/services` too, so SIX sets were sitting where that check could not see them.** **One of them was `TASK-646`'s — and it had gone completely dead this morning when TASK-656 replaced the code it anchored on (six of its eight mutations pointed at lines that no longer exist). Nothing said so.**
✅ **The scan now walks all of `src`.** **Re-cut `646`'s set per your rule from 643 — a lost SUBJECT is a retirement, a lost ANCHOR is a re-anchor: `X1` re-anchored (its subject — the stretch must happen on this path — survives); `X2`–`X6` RETIRED with ids kept and the reason in the file (they attacked the recompute that no longer exists; `X6` is also INVERTED by the owner's ruling, since the stretch is supposed to ride every leave now).** **`X7`/`X8` untouched and alive.**
🔑 ***A guard that scans one folder protects the folder, not the rule*** — **it surfaced only because I filed a new set outside it and finally asked why it was not in the list. That is the same lesson as the `courseBornCeiling` census, one level up: a check answers the question you ask it and cannot tell you what is MISSING from the list.**

### ⑦ 14 pins corrected earlier (reported already) + 5 more today, each with the reason
**`pre-start-declared-absence-task609` ×3 (the NO-CONVERSION pins — `charged`/`becomesAbsence`, and the `plannedAtCreation: true` count 3 ⇒ 4, the fourth being door 2's declaration)** · **`booking-undo-req108` (door 2's write now `absenceFlags`)** · **`declared-absence-stretches-expiry-task646` ×2 (the harness did not model the interval write, so it turned the date into `NaN` — a fake that cannot read the write under test reports a defect in itself).**
⚠️ **The 609 count is worth your eye: it is the pin that guards "a charged leave can never become free", and I changed it from 3 to 4. The justification is the VALUE tests in this task (a re-mark of a charged leave stays charged), not the count.**

### 📝 SYSTEM-FACTS entry written — and what I could NOT do
**Added to `SYSTEM-FACTS.md` under *Leaves and the expiry — REQ-112*** (the five doors; `leaveUsed` = a plain count; ruling 3; forward-only; the SEVEN writers; the actor limit).
⚠️ **"State the meaning change at the column": the column's definition is `db/schema.ts`, which is OUTSIDE this task's claim — so I stated it on `CourseLike.leaveUsed` in `leave.ts` (the type every reader goes through) and said so there.** ▶️ **If you want a comment on the column itself, `schema.ts` needs a claim.**

### ❓ FOUR QUESTIONS — decided nothing silently; each has my recommendation
1. **`toCourseSummary` still emits `leaveLocked: true` when `leaveUsed >= quota` — for a course that is no longer locked by anything.** **That is a second READER of the old rule, TASK-650's exact shape.** ▶️ **Recommend `leaveLocked` always `false` at the source (one line in `leave.ts`, my claim)** — **but it changes a DTO value @Fern's screens read and `TASK-658` is hers, so it is yours to coordinate. I have not touched it.**
2. **Door 4 earns a week only for a LIVE row. Cancelling an ATTENDED row (a correction of a mis-marked check-in) re-owes a make-up but earns NO week.** ▶️ **Recommend leave it** (it is a correction, not a lesson that was missed) — **your call.**
3. **A cancelled MAKE-UP earns a week** (it re-owes, so by *one absence ⇒ one make-up ⇒ one week* it counts) — **stated in a test as behaviour so you can overrule it.**
4. **`leave_lockline` is dead in product code but still a dictionary entry and still composed by `line-v2-messages-req107.test.ts`.** ▶️ **Recommend delete the key and that one test assertion** — it is a sentence for a state that no longer exists. **Left in place; tell me and it is two lines.**


## 📌 2026-10-06 — @Sober: VERIFIED with follow-ups. tsc 0 · 65=65 · 4081/1 (the 1 = Team B TASK-667 set, in flight) · set 656 18/18 BITE, CHECKSUM identical, files restored · 646 re-cut OK. 🔴 609 set: F7 SURVIVED as filed (its proof lives in the 656 test file, missing from the 609 list) — add it, re-run the whole set. Rulings: leaveLocked always false · ATTENDED cancel earns no week (pin as behaviour) · cancelled make-up earns a week EXCEPT the TASK-551 same-slot re-add (check + pin) · leave_lockline deleted. schema.ts granted for ONE comment on leave_used.


---

# 🔴 RE-AIM — 2026-10-06 (night), @Sober → @Jason. **THIS SECTION OVERRIDES §1–§6 WHERE THEY DIFFER.** Restart now.
⚖️ **The customer corrected REQ-112 and then answered with NUMBERS (via @Porter): 10-session course, coach away twice ⇒ "15" · 4-session course, one absence declared before the start ⇒ "6".** **The complete model is in `REQ-112` — quote THAT.**

## R1. The rule — 🔴 an EXPLICIT, CLOSED list of THREE triggers. Nothing else moves the expiry.
| event | expiry |
|---|---|
| **an ORDINARY leave during the course — any number, any door** | **+0** — unlimited inside the existing validity; the make-up goes to the next free week |
| ✅ **T1 — an absence DECLARED before the course starts** (door 1 / door 2 with `preStartDeclaration`; creation's declared weeks; the start-change re-plan) | **+1 week each** — `TASK-646`, live on uat, **STAYS** |
| ✅ **T2 — a COACH's leave** (the coach's own, or recorded by an admin; door 3 — **and the group SEATS it cancels**) | **+1 week per class cancelled** |
| ✅ **T3 — a school cancel with the reason `ปัญหาจากทางเรา`** (door 4, **and a group-date cancel carrying that reason** — door 5) | **+1 week** |
| a make-up that cannot fit before the expiry | **+0 — the ADMIN is told (`TASK-657` §3); a person decides** |
🔴 **@Porter's condition, and mine: the triggers are a LIST, pinned BY VALUE — 🚫 NEVER a predicate over "whose fault" or "the family did not choose it".** **That predicate gets T1 BACKWARDS (a pre-start declaration IS the family's choice and still adds a week).** 🔑 *A tidy summary standing in for the list the customer gave is what produced this whole night.*

## R2. What changes in what you built
- ✅ **KEEP:** no gating / no `LEAVE_LOCKED` / no quota LINE line · the stretch-to-fit OUT · `addLeaveWeek` (atomic, actor NULL) · plan-editor parity with the session button · the re-mark fixes (`I1`–`I3`) · the expiry-writer list · forward-only.
- ❌ **REMOVE the helper call from ORDINARY leaves:** door 1 and door 2 call it **ONLY when the absence is a pre-start declaration** (T1). **An ordinary leave at either door ⇒ +0, still one make-up.**
- ✅ **Door 3 (coach's leave): keep +1 per class.** ⚠️ **When a coach's leave cancels a GROUP, its seats are cancelled through `cancelSeatsOfGroup` — each seat's course gets +1 too (T2).**
- 🔴 **Door 4 / door 5: +1 ONLY when the cancel reason is the new "our side" code (`TASK-690`).** **Every other reason ⇒ +0.** **Door 5 takes the trigger from its CALLER** (`cancelSeatsOfGroup` is reached from a coach's leave, a group-date cancel and the series cancel-all — each passes whether it earns a week). 🚫 **Never read the reason back from a free-text note.**
- **Your earlier rulings on Q2/Q3 are SUPERSEDED:** cancelling a mis-marked ATTENDED row ⇒ +0 unless the reason is "our side"; a cancelled make-up ⇒ +0 unless "our side" (the TASK-551 same-slot case then cannot earn one — pin it anyway).
- **`leaveLocked` always `false` · `leave_lockline` deleted · the `schema.ts` comment on `leave_used`** — still yours, unchanged.
- 🔴 **`TASK-609`'s set: add `every-leave-adds-a-week-task656.test.ts` to its `tests` (F7 SURVIVES as filed) and re-run the WHOLE set from the file.**

## R3. The proofs — re-aimed BEFORE they are written
1. **By VALUE, through the real functions:** an ordinary leave at door 1 and at door 2 ⇒ **+0, one make-up** · a pre-start declaration at door 1 AND at door 2 ⇒ **+7, one record** (same answer, both doors) · a coach's leave over 2 classes ⇒ **+14** (her "15" on a 13-week course) · a coach's leave that cancels a group ⇒ **+7 on EACH seat's course** · a cancel with "our side" ⇒ **+7** · a cancel with each OTHER reason ⇒ **+0** · a pre-start declaration on a 4-session course ⇒ **week 6** (her "6").
2. **The trigger list pinned as an exact list of THREE, by name** — a fourth trigger, or a predicate replacing the list, must FAIL a test.
3. **The helper's call sites pinned by count against your re-aimed table** (with file:line in the report).
4. **Mutations, list IN the file:** each trigger removed (each BITES alone) · the helper called on an ordinary leave (BITES) · door 4 earning a week for `ADMIN_ERROR` (BITES) · a "whose fault" predicate replacing the list such that a pre-start declaration earns +0 (BITES) · the re-mark mutations `I1`–`I3` kept.

## R4. 🚫 The sid gate in §6 is REPLACED by `TASK-657` §R-gate — the expected dates changed.

## ✅ 2026-10-06 (night) — @Jason: `TASK-656` §R DONE — three triggers, ordinary leave +0, 29 / 29 bite, the four follow-ups done
**`tsc` 0 · DB-unreachable suite 4119 pass · 1 fail (TASK-667's own mutation set — Team B, in flight, NOT mine, reported separately) · `66 .sql = 66 journal tags`.**
**Set: `src/services/leave-week-triggers-task656.mutations.json` — 29 / 29 BITE**, baseline 167, CHECKSUM identical, every restore byte-identical. **Test list is in the file.** The old `every-leave-adds-a-week-task656.*` (test + set) is **DELETED, not edited** — its NAME stated the opposite of the rule, and a title is a claim.
**TASK-609's whole set re-run FROM ITS FILE: 7 / 7 BITE, baseline 158** (F1 F2 F3 F5 F6 F7 F8) — the 656 test file is now in its `tests` list, so F7 survives as filed. **TASK-646's set re-run: 3 / 3** (X1 re-anchored onto door 1's gate; X7, X8 unchanged).

### The rule as built — a LIST, by value
`LEAVE_WEEK_TRIGGERS = ["T1_PRE_START_DECLARATION", "T2_COACH_LEAVE", "T3_SCHOOL_ISSUE"]` in `lib/course-plan.ts`, the customer's Thai quoted beside it. **`addLeaveWeek(tx, courseId, trigger: LeaveWeekTrigger)` takes ONLY a member** — a fourth trigger fails to COMPILE, then fails the list pin (`X1` bites). **No "whose fault" predicate exists** (pinned absent; `P1` replaces the list with one and bites 16 tests — it gets T1 backwards, exactly as the requirement said).

### Call sites — against your re-aimed table (`scheduler.service.ts`, by file:line now)
| # | door | line | trigger | gate |
|---|---|---|---|---|
| 1 | session *Record leave* (admin button + parent via LINE) | 4185 | T1 | `declaredFree` only — an ordinary leave never calls |
| 2 | plan editor *Mark absence* | 3634 | T1 | `declaredFree` only (it already includes "just became an absence") |
| 3 | coach's leave, per class | 3415 | T2 | each class cancelled; GROUP rows pass `{weekTrigger:"T2_COACH_LEAVE"}` to door 5 |
| 4 | school cancel of a course session | 4017 | T3 | `reasonCode === SCHOOL_ISSUE` ∧ row LIVE or ATTENDED ∧ `!slot.family` |
| 5 | `cancelSeatsOfGroup` | 1898 | from the CALLER | only if the caller passed `opts.weekTrigger` |
**FIVE `addLeaveWeek(` call sites, pinned by value** (two T1, one T2, one T3, one `opts.weekTrigger`) **and every literal checked against the list**; nothing outside the scheduler calls it. **`cancelSeatsOfGroup`'s THREE callers pinned by name, each with its trigger:** coach leave ⇒ T2 · group-date cancel ⇒ T3 only if `enumReason === SCHOOL_ISSUE` · series cancel-all (`other-series.service.ts`) ⇒ T3 only if `reasonCode === SCHOOL_ISSUE`. Every other reason passes nothing ⇒ +0. **The reason is read from the CODE, never the free-text note** (`E2` types «ปัญหาจากทางเรา» into the note and bites).
**A course-session cancel now carries ONLY `SCHOOL_ISSUE`** (stored on the row, so the coach's notice reads "A problem on our side"); every other code is still ignored there, so those cancels stay byte-identical (`E6` stores every code and bites).

### Proofs by value, through the REAL functions (nothing calls the helper directly)
- **Ordinary leave, door 1 AND door 2 ⇒ +0, one make-up, counted** · two ordinary leaves on two doors ⇒ still +0, two make-ups · a course whose first class was checked in TODAY: ordinary ⇒ +0.
- **Pre-start declaration at door 1 AND door 2 ⇒ +7, ONE record** — the whole record compared across both doors (`C1`, `C2`, `O2` bite). Two in sequence ⇒ +14 total, two records. **Her "6": 4-session course, one declared absence ⇒ week 6.**
- **Coach's leave over two classes ⇒ +14, two records** (her "15" as a difference of two weeks). **Coach's leave cancelling a group ⇒ +7 on EACH seat's course.**
- **School cancel with "our side" ⇒ +7, one record, one make-up, code stored** · **each OTHER reason (PROGRAM_CHANGED / CUSTOMER_CANCELLED / ADMIN_ERROR / TEACHER_LEAVE) ⇒ +0 and the code NOT stored** · no code ⇒ +0.
- **Group-date cancel with "our side" ⇒ each seat +7; any other reason ⇒ every seat +0.**
- **Pinned as you asked, and STATED:** cancelling a mis-marked ATTENDED row ⇒ +0 unless reason is "our side" (then +7) · a cancelled MAKE-UP ⇒ +0 for any other reason · with "our side": **+0 when the re-plan puts it back in the SAME slot (TASK-551 — nobody lost a class), +7 when the slot differs.** ⚠️ **The same-slot condition is MY reading of "pin it anyway"** — if you meant "our side on a make-up always earns", delete `&& !slot.family` (one token; `E3` is the mutation that shows the difference).
- **One act, one decision:** re-marking a charged leave ⇒ no second count, not flipped to free (`I2`); re-marking a pre-start declaration earns its week ONCE (`I1`); cancelling the same row twice with "our side" ⇒ one week (`E5`).
- **Ruling 3 kept:** a make-up that lands past the expiry is created and the expiry does NOT follow it — now also for an ORDINARY leave (+0, the admin is told in 657). **Forward-only kept.**

### The four follow-ups — all DONE
1. **609's set:** the 656 test file is in its `tests`; the WHOLE set re-run from the file: **7 / 7, baseline 158.**
2. **`leaveLocked` always `false`** in `leave.ts`, with a value pin (counter 0 and 99 both false) and mutation `L2`; two old tests that asserted the lock (`leave.test.ts`, `course-status.test.ts`) were REWRITTEN to the new rule, each saying so — not deleted.
3. **`leave_lockline` DELETED** (key + the one assertion in `line-v2-messages-req107.test.ts`, replaced by a test that the key is gone and the reply is the normal-case line).
4. **`schema.ts`: ONE comment, nothing else** — above `leave_used`: "A plain count of leaves taken (REQ-112) — not a limit; nothing gates on it."

### ⚠️ What I changed in existing pins — each with its reason
- `cancel-reason.test` ("COURSE_PACKAGE cancel byte-identical") — **narrowed with the exception named**, not loosened: still never REQUIRED, exactly ONE `COURSE_PACKAGE` mention, and it is the `SCHOOL_ISSUE` one.
- `teacher-own-calendar-req097`, `group-series-req104` (×2), `group-session-req095-2a` — the three `cancelSeatsOfGroup` call lines now carry their trigger option.
- **`declared-absence-stretches-expiry-task646.test`:** (a) the test I "CORRECTED" earlier to "a started course's ordinary leave ALSO adds a week" was **WRONG under §R** — corrected back to 646's own claim (+0), history kept in the comment; (b) **a describe that pinned the TASK-646 recompute block was pinning code that no longer exists** (TASK-656's first build deleted it) — retired and replaced by asks of the CODE: the recompute strings are gone, and exactly TWO `T1_PRE_START_DECLARATION` calls exist.
- **SYSTEM-FACTS rewritten** (the old section stated "every leave adds a week"): three triggers, the list-not-predicate lesson, call sites, `leaveLocked`, writers pin.
- Stale comments rewritten to the three-trigger rule (helper doc, `leave.ts` `leaveUsed` doc, door comments, ruling-3 comments). **Door comments still say "DOOR n of 5" — five, pinned.**

### ❓ For you (not touched)
- `canTakeLeave` (`leave.ts`) now has **no production caller** and still reads "quota gone ⇒ false". Dead code that reads like a gate — yours to claim for deletion.
- `openapi/document.ts` `reasonCode` enum is still the stale fourth copy (from 690).
- **Unchanged and still owed by 657:** the admin overflow notice, the Undo's expiry logic deleted, the new sid gate ("15" and "6"). 656 + 657 + 658 ship together to sid batch #2. **`TASK-659` (XS copy) queued after.**

▶️ **Ball: Sober verifies 656. I start `TASK-657` §R next.**
