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
