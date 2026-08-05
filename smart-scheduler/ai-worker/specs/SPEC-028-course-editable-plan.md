# SPEC-028 — A course is an editable PLAN (reconcile-to-`size` sessions)

- Source: REQ-030 (owner, 2026-08-01/02; all 4 questions answered, worked example given)
- Depends on / builds atop: TASK-091 (`reconcileBookingHolds` whole-booking freelance reconcile), SPEC-025
  (continue-existing-course — shares this machinery), the existing leave/extension logic (`lib/leave.ts`).
- Status: DESIGN — for @Porter to get an owner design-ack before build tasks are cut (design-first gate, as REQ-006).
- Go-live: **2026-08-20**. Staged (below): **Stage 1 = go-live**, Stage 2 = after.

Grounded in a code sweep (2026-08-03). All file refs are `smart-scheduler-back` unless noted.

---

## 1. The model — the sessions ARE the plan (confirmed; no new entity)

A course today is **one `course_packages` header** (`schema.ts:252` — `size`, `startDate`, `weekday`, `startTime`,
`expiryDate`, `usedSessions`, `leaveUsed`, `adminUnlocked`) **+ N `bookings`** linked by `bookings.courseId`
(`schema.ts:317`). Each booking already carries **its own `teacherId`, `subjectId`, `date`, `startTime`, `status`.
There is no separate plan/schedule table** — verified end-to-end. **We keep it that way.** The owner's own note is
the rule: *"the sessions ARE the plan; a separate plan entity that can disagree with the bookings is a second
source of truth, and this project has already paid for one of those."* So **the plan is a read-projection over the
course's bookings**, and every plan edit is a booking mutation.

### The invariant (the whole design turns on this)
> **A course owes `size` teachable sessions.** The plan is *where* those sessions land; leave and insert are
> **moves within that number, never changes to it.** A 6-session course is 6 sessions after any sequence of
> absences and inserts — **by construction, not by counting.**

Expressed on the rows, with `LIVE = {PENDING, CONFIRMED, EXTENDED}` and `DELIVERED = {ATTENDED, NO_SHOW}`:

```
count(bookings[courseId].status ∈ LIVE) + count(status ∈ DELIVERED) == size      # the target
```

- **SICK_LEAVE** = an excused/absent session — **not** live, **not** delivered; it *earns a replacement*.
- **CANCELLED** = out of the plan entirely.
- This is the direct analog of TASK-091's `planHoldMoves`: a *target* (`size`) and moves that bring the world to
  it. Nothing can create a 7th session because nothing ever creates one outside the reconcile.

✅ **Resolved (owner, 2026-08-03):** a **NO_SHOW consumes/forfeits** the course session (no make-up), unlike a
sick-leave. So `NO_SHOW ∈ DELIVERED` as written — the family loses that session, the course does not extend.

---

## 2. The core — `reconcileCoursePlan(tx, courseId)` (correct-by-construction)

One pure planner + one transactional applier, mirroring TASK-091 exactly (`planHoldMoves` + `reconcileBookingHolds`):

- **Pure `planCourseMoves(sessions, size)`** → the moves needed to reach the target:
  - **short** (`live + delivered < size`, i.e. a leave opened a gap): **append** `size − (live+delivered)`
    sessions after the last live session date (reuse `findFreeExtensionDate`, `scheduler.service.ts:1090` — +7d,
    same weekday/time, skip clashes), each `status: EXTENDED`, `extendedFromId` = the absence that created it.
  - **long** (`live + delivered > size`, i.e. an insert satisfied a gap): **remove** the trailing **appended**
    session(s) — newest-dated `EXTENDED` (`extendedFromId` set), still `LIVE`, → `CANCELLED`. Never touch an
    attended/delivered or a hand-placed session.
  - **at target**: no-op (idempotent — a date/teacher-only edit produces zero moves).
- **`reconcileCoursePlan`** applies the moves **in the same transaction** as the triggering edit, then the derived
  end date follows for free (§4).

**"The appended session and the inserted session are the same session, moved"** falls straight out: an insert makes
the course *long*, the reconcile cancels the newest `EXTENDED` → net zero. The owner's worked example
(7·14·21·28 → leave 14 appends "4th next month" → insert 15 removes it → ends 28) is exactly this and should be a
verbatim test.

**Insert guard:** an insert is only valid when the course has an outstanding owed session to satisfy — i.e. when it
would **not** push `live + delivered` above `size` *after* the reconcile cancels an appended session. If there is no
appended (`EXTENDED`) session to absorb it, refuse with a reason (*"คอร์สนี้ครบจำนวนคาบแล้ว — ไม่มีคาบค้างให้เลื่อน"*)
rather than silently growing to `size + 1`.

---

## 3. Confirm is the gate — one atomic outcome, or nothing

Per the owner (*"พอกดยืนยัน ผ่านกฎถูกต้องทุกอย่างได้"*): **all validation runs at confirm, and the quota
deduction + append/remove + new end date are one atomic transaction.** Any rule failure ⇒ **nothing is written and
the reason is returned.** A half-applied plan is worse than a rejected one.

Every plan edit therefore goes through **one shared applier** — `applyPlanChange(courseId, change)` — that opens a
transaction, applies the booking mutation, runs `reconcileCoursePlan` + `reconcileBookingHolds` (freelance), and
either commits or rolls back with a typed reason. **This is the single implementation both entry points call**
(§6, interaction #4).

Validation gate (all inside the tx, all must pass or the whole thing rolls back):
1. **Attended-immutability** — a `DELIVERED` session can't be edited, moved, or cancelled (new guard — see §5, gap).
2. **Leave quota / lock** — planned-absence rules (§7).
3. **Extension ceiling** — `MAX_WEEK_BY_SIZE` (§5, interaction #2).
4. **Teacher availability** — works-that-day, not archived, freelance budget set (currently missing in `moveBooking`).
5. **Slot clash** — the DB partial unique index (`bookings_teacher_slot_uq`) → `SLOT_TAKEN`.
6. **Freelance ceiling** — `reconcileBookingHolds` (TASK-091), release-A-draw-B, in the same tx.
7. **Teacher-change notice** — min-days rule (§7, interaction #3).

---

## 4. The end date is DERIVED, never a stored assumption

- **Displayed "ends on"** = `max(date)` over the course's `LIVE` sessions — recomputed on every read from the
  bookings. Not stored. (Today `expiryDate` is a stored snapshot never recomputed on extension — that's the drift
  the owner is eliminating.)
- **`expiryDate` stays, but only as the CEILING** = `startDate + MAX_WEEK_BY_SIZE[size] weeks` (what `courseExpiry`
  already computes, `recurring.ts:32`). It is the *latest a session may fall*, used by booking-eligibility
  (`courseEligible`, `eligibility.ts:38`). Keeping it as the fixed policy bound (not the live end) means no second
  source of truth for "where the plan currently ends" — that's always derived.
- Note the ceiling and the quota already encode the same limit: `MAX_WEEK = natural_end + leaveQuota` for every size
  (4: 4+1=5, 6: 6+2=8, 10: 10+3=13). Enforce both anyway (defense in depth); flag if they ever disagree.

---

## 5. The four interactions REQ-030 named — resolved, incl. 3 real current gaps

**#1 — per-session teacher × freelance ceiling.** ✅ Already correct: `moveBooking` → `reconcileBookingHolds`
(TASK-091, Sober-verified 2026-08-03) releases A and draws B in one tx for a teacher change. **Reused as-is** by
`applyPlanChange`. No new money logic.

**#2 — `MAX_WEEK_BY_SIZE` is now a HARD ceiling (🔴 current gap: unenforced).** Today the sick-leave append
(`scheduler.service.ts:1210`) ignores `expiryDate`/`MAX_WEEK` — a leave can append past the ceiling silently.
SPEC: the reconcile's **append refuses** when the appended date would exceed `startDate + MAX_WEEK weeks`, with a
reason (*"คอร์สขยายเกินสัปดาห์ที่ N ไม่ได้"*). Week-8 (size 6) is **owner-confirmed** and load-bearing; test the
boundary (2 planned absences on a 6-course land exactly week 8; a 3rd is refused).

**#3 — teacher-change min-days notice (new named rule).** Mirror `lib/leave-notice.ts` exactly: a named
`Record<…, days>` + accessor with `?? default` + pure `hasEnoughTeacherChangeNotice(date, …, now)` (whole-day diff,
reuse `minutesUntilClass(...)/1440`) + message helper + `conflict("TEACHER_CHANGE_TOO_LATE", …)` at the call site
with admin `override`. **The number is DECIDED: 3 days** (owner) — unit is **days**, not hours. Ship it here as a
named `lib/` constant (default = 3) consumed by a pure function. 🔗 **Making that 3-day value editable via a
settings screen is REQ-031's job** (business-rules-as-editable-settings), which explicitly keeps the `lib/`
functions pure and feeds the override in — so build the function pure here and REQ-031 plugs the DB override in
later **without touching `lib/`**. Do **not** wire `app_settings` into this rule in SPEC-028; that couples the two.
On a confirmed+notified teacher swap, **both teachers get a LINE message** (old: off your schedule; new: on it) via
the existing `notification_outbox` — a silent reassignment means someone doesn't turn up.

**#4 — two entry points, one behaviour.** ✅ Enforced structurally: calendar and course screen both call the **same**
`applyPlanChange` endpoint. No second code path for the rule (the TASK-058 `SUSPENDED_MESSAGE` lesson). The FE may
*preview*; the server *enforces* and is the only writer.

**Plus a 4th gap the sweep found — attended-immutability is absent at the mutation layer.** `updateBookingStatus`
`cancel` and `moveBooking` operate on **any** status with no `ATTENDED` guard (`scheduler.service.ts:1164`, `1295`).
SPEC: add the guard centrally in `applyPlanChange` (and defensively in `moveBooking`) — a `DELIVERED` session is
immutable; edits targeting one are refused with a reason. (AC: *"sessions already attended cannot be edited away."*)
> 🔁 **Owner reversal (2026-08-03, TASK-105):** the guard blocks **edit/move** of a delivered session, but **cancel
> IS allowed on a delivered session with a MANDATORY reason** (fix a mis-marked attendance, audited). See §11.

Also fold in the availability re-check `moveBooking` currently skips (`teacherWorksOnDay`/archived/freelance-set,
present in `insertBooking:705` but not in `moveBooking`) so a date/teacher edit can't land a teacher on a
non-working day.

---

## 6. Planned absence vs sick day — Q1's two rules, kept distinct

The owner: a **planned absence** consumes quota + earns the extension **exactly like a sick day**, *but* going over
quota this way **does NOT lock**. So we need to tell the two apart. Model it as a **marker on the leave action**
(`planned: true`) — not a new status (SICK_LEAVE stays the row status; the marker rides on the action/`note`):

- **planned = true:** increment `leaveUsed`, append via reconcile, **bypass the soft `leaveLocked` gate** (no
  `adminUnlocked` needed) — but **still bounded by `MAX_WEEK`** (§5 #2). Declaring known dates up front is the
  behaviour we don't punish.
- **planned = false (today's sick-leave):** unchanged — over quota ⇒ `locked` (needs `adminUnlocked`).

`leaveLocked` (`leave.ts:41`) keeps its original job: stop **open-ended rescheduling after a course has started**.
Planned, declared-up-front absences are the opposite behaviour and skip it.

---

## 7. Requirement 8 — the per-entitlement management view (course AND voucher)

The owner asked twice for *"manage this child's plan"* from the Bookings page; the missing thing is a
**per-entitlement view**. Entry point already exists: the Bookings ▸ **Courses + leave** card (`mappers.ts:120`).

- **Course** → the plan above: rows of date·time·teacher·subject·status, mark planned-absence, insert, change
  teacher, derived end date.
- **Voucher** → **no recurrence**, so the "plan" is *the sessions booked against the hours + hours remaining*. Same
  question — *"what does this child have, how do I move it?"* — so the same view shell, minus append/contract (a
  voucher has no `size`-target to reconcile; its bound is hours remaining, already enforced). Move/cancel a voucher
  session and change its teacher reuse `applyPlanChange` without the course reconcile.

---

## 7.5 The plan is a *living thing* — orphaned sessions (owner sanity-check, 2026-08-03)

The owner asked whether a course session **disrupted later** (its teacher pulled away / archived / stops working
that weekday, leaving a future Sat-3-of-6 orphaned) is (a) surfaced and (b) re-plannable. I checked the code:

- **(b) re-plannable — ✅ covered.** The after-purchase editor (`applyPlanChange`: move day/time/teacher, or
  extend) handles it with the same engine. No gap.
- **(a) surfaced on Needs-attention + LINE — 🔴 REAL GAP.** The attention registry (`lib/attention.ts`) has 9
  checks; **none detects a future `LIVE` course session whose teacher is now archived or no longer works that
  weekday.** So an orphaned session sits silent until someone notices. This IS the owner's concern and it is
  **not** built.

**SPEC adds a 10th attention check — `orphaned_sessions`:** a future booking (`status ∈ LIVE`) whose teacher is
`archived` **or** `!teacherWorksOnDay(workDays, weekdayOf(date))`. Pure predicate + one registry append (the
registry is explicitly "add a check = append one entry"), a loader, and it flows into the 08:00 LINE digest +
the web panel for free. Names a person (time · student · teacher), so `namesPeopleInDigest: true`. Small, and it
closes the "living plan" loop — detection feeds the re-planning the editor already supports.

**Prevent-at-source (owner, 2026-08-03) — mostly ALREADY BUILT.** `archiveTeacher` (`scheduler.service.ts:1464`,
REQ-005/TASK-029) **already refuses `409 HAS_FUTURE_BOOKINGS`** ("move or cancel upcoming sessions first") when a
teacher has any future non-cancelled booking — exactly the owner's guard for the deliberate archive/disable path.
`updateTeacher` can't change `workDays`/`active`, and disable == archive (guarded). So the **only** path that can
still orphan a session is a **`workDays` change** (a teacher stops working a weekday) — which is a softer,
sometimes-legitimate change where a *hard* block would trap admins; `orphaned_sessions` (above) is the correct
tool there. Optional small add: a **warning** (not a block) when a `workDays` change would orphan N future
sessions. So point-1's core is done — no new hard-guard needed.

## 8. Purchase-time planning modal — NOW GO-LIVE SCOPE (owner, 2026-08-03)

The owner **combined the stages**: the purchase-time planner ships **for go-live**, not later. The flow:
1. pick student → 2. pick course/program + #weeks (`size`) → 3. **a slot picker (calendar) that, for a chosen
   date/time, SHOWS which teachers are available and any clashes (whose booking conflicts) — before confirm** →
4. plan every session (per-session teacher/time/day; a leave → move to another day *or* extend to the last week;
   insert a make-up) → 5. **atomic confirm** (§3).

Backend for the modal:
- **`GET /slots/availability?date&startTime`** (or `?weekday`) → for a slot, the teachers who **work that day**,
  are **not archived**, have **freelance budget**, and are **not already booked** at that slot — plus, for a
  clash, **whose** booking holds it. This is the "availability + clash" surface; it reuses the exact predicates
  `insertBooking` already enforces (`teacherWorksOnDay`, archived, freelance-set) + the unique-slot rule — **one
  definition, queried read-only for preview and enforced for real at confirm.**
- **`POST /courses/preview`** — returns the generated `size`-row plan (date·time·teacher·subject) **without
  writing** (AC: *"editable rows before it is created"*).
- **`POST /courses` gains an optional `sessions[]` override** — per-session teacher/subject/date — committed
  atomically (the clash-aborts-all tx it already has). Absent ⇒ today's uniform chain (back-compat).

⚠️ **The planning ENGINE is shared** — the modal is mostly UX over the same `applyPlanChange` + the availability
query. The added cost is the modal UX and the availability endpoint, not a second engine. **Go-live impact: real
but bounded — see the log entry to @Porter.**

---

## 9. Scope — COMBINED for go-live (owner overrode the staging, 2026-08-03)

Everything ships in the first release (owner accepted the go-live-date risk): the after-purchase per-entitlement
editor (course **and** voucher), **and** the purchase-time planning modal (§8) with teacher-availability + clash
at slot selection. All of it rides on one shared engine (`planCourseMoves` → `reconcileCoursePlan` /
`applyPlanChange`), so the marginal cost of the modal is UX + the availability query, not a second engine. The
realistic go-live-impact assessment is in the log for @Porter to set the owner's expectation.

---

## 10. Status — design ACK'd, all questions closed, tasks cut

✅ **Design ACK'd by owner (2026-08-03)** — the `size`-target reconcile and planned-absence-doesn't-lock endorsed.
✅ **NO_SHOW = consume** (§1). ✅ Week-8 ceiling (Q2), planned-absence rules (Q1), teacher swap + 3-day notice +
dual notify (Q3), insert-free-but-draws-budget (Q4 — via `reconcileBookingHolds`). ✅ **Scope combined** — the
purchase-time modal (§8) is go-live scope. ✅ Orphaned-session detector added (§7.5).

🔗 **REQ-031 coupling (not a blocker):** the teacher-change notice ships here as a pure `lib/` constant (3 days);
REQ-031 makes it editable via a settings screen **without touching `lib/`** — so this spec does NOT wire
`app_settings`.

**Tasks cut:** TASK-092…099 (see board). Go-live-impact assessment routed to @Porter in the 2026-08-03 log.

### Task breakdown (combined scope)
**BE** — **TASK-092** `planCourseMoves` (pure) + `reconcileCoursePlan` (the `size`-target engine, tests incl. the
owner's 7·14·21·28 walkthrough) · **TASK-093** `applyPlanChange` shared atomic applier + the 3 guards (`MAX_WEEK`
ceiling, attended-immutability, `moveBooking` availability re-check) + planned-absence marker · **TASK-094**
teacher-change 3-day notice rule (`lib/`) + dual-teacher LINE notify · **TASK-095** `GET /slots/availability`
(teachers-free-and-clashes) + `POST /courses/preview` + `POST /courses` `sessions[]` override · **TASK-096**
`orphaned_sessions` attention check (§7.5) · **TASK-097** per-entitlement DTO (course plan + voucher sessions/hours).
**FE** — **TASK-098** purchase-time planning modal (student → course/size → slot picker w/ availability+clash →
per-session plan → atomic confirm) · **TASK-099** after-purchase per-entitlement view (course plan + voucher),
mark-absence / insert / change-teacher / derived end / reasons-on-refusal, from the Bookings ▸ Courses card.
Dependency spine: 092 → 093 → {094, 095, 097} → FE {098, 099}; 096 independent.

---

## 11. Owner reversals (2026-08-03) — two decisions after seeing the built behaviour

Both came from the two cross-rule consequences I surfaced at the TASK-093 review. Neither changes the plan *engine*
(092); both are money/guard changes on top.

### 11.1 SICK_LEAVE no longer draws the freelance ceiling (reverses TASK-028) — **TASK-104**
The owner reversed the locked "still pay the sick-leave freelance" rule. **`heldTarget(SICK_LEAVE)` → 0**
(SICK_LEAVE moves from the *consuming* set to *releasing*): `consuming = {CONFIRMED, ATTENDED, EXTENDED}`;
`releasing = {SICK_LEAVE, NO_SHOW, CANCELLED, PENDING}`.
- **Effect:** a sick-leave now costs **1** freelance hour, not 2 — the absent session's hold **releases**, and only
  the **makeup** draws (when taught, Q4 unchanged). This is the money side only; the **course-size reconcile is
  unchanged** — a sick-leave still appends a makeup (that's 092, a separate concern).
- **Compensation is MANUAL:** if the owner wants to pay a fuel/travel allowance (ค่าน้ำมัน) for the held slot, an
  admin records an **ad-hoc EXPENSE movement** in the backoffice. ✅ **Already supported** — the REQ-006 item model
  has `POST /bo/items` (create a variable EXPENSE item) + `POST /bo/items/:id/movements` (hand-entered movement),
  both `adminAuth`. No new REQ; optionally seed one "ค่าน้ำมันครู" EXPENSE item for convenience (ops choice).
- Touches TASK-028/091's classification + the tests that pin SICK_LEAVE consuming. Single-line rule change, but
  it's live money — careful pass + test updates.

### 11.2 An ATTENDED session CAN be cancelled — with a MANDATORY reason (relaxes TASK-093) — **TASK-105**
The `isDelivered` guard stays for **edit/move**, but **cancel is allowed on a delivered session iff a non-empty
`reason` is supplied** (audit: store reason + actor + timestamp). Intent: undo a mis-marked attendance, with a why.
- **Ripple, made explicit (Porter asked):**
  - **money** — CANCELLED is *releasing*, so `reconcileBookingHolds` **releases** the drawn hour. ✅
  - **course-size** — a delivered→cancelled session drops `current` below `size`, so `reconcileCoursePlan`
    **re-owes it** (appends a makeup) → the session "goes back to un-taught". That is the intended mis-mark behaviour.
### 11.3 The UNIFIED course-cancel rule (owner, 2026-08-03) — every course-session cancel re-owes
The owner settled the follow-up: **cancelling any course session — delivered OR non-delivered — re-owes a makeup;
the student stays at `size`** ("ใช่ A"). A per-session cancel is a **reschedule, not a forfeit**. So:
- **`CANCELLED` (from any prior status) → `reconcileCoursePlan` re-owes** (appends a makeup) + releases the money.
  `reconcileCoursePlan` is **not** wired into the cancel path today (only `applyPlanChange`) — **TASK-105 adds it to
  `updateBookingStatus:cancel`.**
- **Only `NO_SHOW` consumes** (the forfeit already lives there, §1). A cancel never consumes.
- **Reason is required only for the DELIVERED case** (the audit trail for undoing a mis-mark); a plain
  non-delivered cancel needs no reason. So TASK-105 widens to *all* course cancels for the re-owe, and gates
  *only delivered* cancels on a reason.
- 🔴 **Boundary (confirmed gap → future REQ, not go-live-blocking):** since a cancel never shrinks a course, **the
  only way to end/shorten a course early is a separate cancel-course / refund flow — which does NOT exist** (grep:
  no `cancelCourse`/`terminate`/`refund` path). Early termination / refund is a **post-go-live REQ** (@Porter).
  Confirmed with the owner that quitting a course is a separate flow from per-session cancel.

---

## 12. OBS-3 — plan-change transparency: an `insertable` flag + a plan-diff preview (owner ruling 2026-08-04)

Tanya observed that at `owedCount == 0` an Insert can still cancel a trailing make-up "silently". I flagged that
**disabling Insert at owed-0 would break REQ-030's own worked example** (after an absence, the makeup restores owed
to 0, and the insert-that-satisfies-it happens at owed 0). The owner confirmed **(A)**: keep the flow, but make it
**not silent** — show the resulting plan *before* confirm. Owner: *"บอกว่าแผนจะเป็นแบบนี้นะ."* Two parts:

### 12.1 The `insertable` flag (disable Insert only when there's truly nothing to reschedule)
`owedCount` alone can't tell the two 0-owed states apart (full course vs a course with an appended makeup). So the
**course plan DTO (TASK-097 `getEntitlementPlan`) exposes `insertable: boolean = canInsert(sessions, size)`**
(`current < size || hasEXTENDED`; always `false` for a voucher — no insert). The FE **disables the Insert action
when `!insertable`** with the reason "no session to reschedule". That blocks *only* the genuinely-nothing case (which
the BE already refuses with `NO_OWED_SESSION`) — the post-absence insert stays enabled, as REQ-030 requires.

### 12.2 The plan-diff preview (show what the change does, before commit)
A **dry-run** of the plan change that returns the resulting plan **without writing**, so the confirm shows a
**plan diff** ("session on the 14th → moves to week 5; inserting the 15th removes the appended make-up; your plan
becomes wk1·wk2·wk3·15·wk5"), not a raw "continue?".

- 🔑 **Reuse the REAL applier — the preview must not diverge from the apply.** Add a `dryRun` mode to
  `applyPlanChange`: it runs the **full** transaction (every guard + `reconcileCoursePlan` + `reconcileBookingHolds`),
  then **reads back the resulting sessions + derived end and ROLLS BACK** instead of committing, returning
  `{ moves: {appended, cancelled}, resultingSessions, liveEndDate }`. On a guard failure it throws the **same typed
  reason** the real apply would (the FE shows it). A separate re-derivation would be a second definition of the
  reconcile — exactly the drift this project keeps paying for; the rollback approach guarantees preview == apply.
- **Endpoint:** `POST /courses/:id/plan/preview` (same body as `/plan`).
- **FE:** on Insert / mark-absence / move, call preview → render the diff in the confirm → on confirm, call the real
  `/plan`. (mark-absence already sets `planned:true`; the preview shows the appended makeup + new end.)

### 12.3 Tasks
- **BE TASK-114** — `insertable` on the plan DTO (`= canInsert`, false for voucher) + `applyPlanChange` `dryRun` mode
  (real tx, roll back, return resulting sessions + `liveEndDate` + moves; same typed refusals) + `POST
  /courses/:id/plan/preview`. Tests: dry-run writes nothing; its result matches a real apply's; `insertable` false on a
  full no-EXTENDED course and true post-absence.
- **FE TASK-115** — disable Insert when `!insertable` (with the reason); on a plan change, show the **preview diff**
  in the confirm before committing. (Also folds OBS-4: render `HH:mm`, not raw `13:00:00`.)
