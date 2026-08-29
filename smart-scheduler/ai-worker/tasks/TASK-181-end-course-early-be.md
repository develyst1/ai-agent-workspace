# TASK-181: End a course early — `POST /courses/:id/cancel` (REQ-036) (scheduler-back)

- Source: REQ-036 (owner: build now, tight). 🔴 HIGH — a paying customer is waiting. **Build in PARALLEL with the FE
  (TASK-182); the contract below is fixed.** BE-only; a small additive migration.
- Status: ✅ **BE DONE (Sober 2026-08-24)** — EXTENDED fix verified; deploy `0023` sid-first, migration BEFORE code. → @Porter (owner deploy) · REQ-036 ships when TASK-182 FE lands + a live pass
- Assignee: @Jason (BE)
- Repo: **smart-scheduler-back**.

## Contract (fixed — do not change without SA)
- **`POST /courses/:id/cancel`** body `{ reason: "PROGRAM_CHANGED"|"CUSTOMER_CANCELLED"|"ADMIN_ERROR", note?: string }`.
  → **200** `{ cancelled: true, removedSessions: N, course: <CourseDTO> }`.
- **`POST /courses/:id/cancel/preview`** — same body (reason optional), **writes nothing**, returns
  `{ removedSessions, sessions: [{date, time, teacher}], student, program }` (R2: the dialog is server-powered).
- **400** `REASON_REQUIRED` (missing) / `400 INVALID_REASON` (not one of the three) — **server-side**.
- **409** `ALREADY_ENDED` → `{ cancelled: false, removedSessions: 0 }` (idempotent).
- **404** course not found. **One transaction** — any refusal changes **zero** rows.

## Mechanism (SA calls — Q3 + R1, grounded)
- **R1 = SOFT-CANCEL, not delete.** Set remaining **`PENDING`** COURSE_PACKAGE sessions to **`CANCELLED`**.
  Verified: `getCalendar` excludes CANCELLED (`scheduler.service.ts:407`), the slot-block query frees a CANCELLED
  slot, and `courseCurrent` doesn't count it — so they vanish from the calendar and free the slot, nothing
  destroyed. **Do NOT run `reconcileCoursePlan`** — that re-owes a make-up (SPEC-028 §11.3); the whole point is a
  forfeit, not a reschedule.
- **Q3 = an `endedAt` flag, NOT size-reduction.** Migration: add `ended_at timestamptz`, `end_reason text`,
  `end_note text`, `ended_by text` to `course_packages` (nullable, additive, hand-authored + journal-registered,
  `sid` first). Ending sets them. **Then guard the plan-responsibility sites on `endedAt`** so the course owes zero
  *permanently* (not just because we skipped reconcile once): `owedCount → 0`, `insertable → false`, and
  `reconcileCoursePlan → no moves` when `endedAt` is set. (Reducing `size` would corrupt "what they bought" — the
  REQ-064 lesson; `endedAt` keeps size honest and makes AC-1's "0 owed" true by construction.)
- **Untouched:** delivered rows (`ATTENDED`/`EXTENDED`/`SICK_LEAVE`/`CANCELLED`) byte-identical; `used_sessions`
  unchanged; **no `bo.movement`, no revenue reversal, no notification** (money is a later human decision — recording
  the enum is what makes `ADMIN_ERROR` sales *findable* later).
- **History (AC-3/AC-6):** the end event (reason, note, actor, date) shows in `buildCourseHistory`; `ADMIN_ERROR`
  courses listable with one query.

## Definition of Done — R4: provable by test, not by reading
- [ ] AC-1 / R4.1: 🔴 **no make-up re-owed** — plan count before/after, `size` + end-date unchanged, **no `EXTENDED`
      appears**; `owedCount` reads **0**; `insertable` **false**.
- [ ] R4.2: delivered rows byte-identical. R4.3: `used_sessions` unchanged. R4.4: **`bo.movement` count identical**.
- [ ] R4.5: idempotent — second call `409 ALREADY_ENDED`, zero rows changed. R4.6: the three reasons round-trip and
      are distinguishable in history; `ADMIN_ERROR` listable.
- [ ] `400 REASON_REQUIRED`/`INVALID_REASON` server-side; `404`; all-or-nothing in one tx.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green. Migration owner-run, `sid` first; you run nothing against a DB.

## Notes / Questions
(Jason fills in. `endedAt` guarding the three plan sites is the check-#1 guarantee — "no re-owe EVER", not "we
didn't reconcile this once". Keep the reason an enum; the free-text `note` is optional. Pure preview/plan helpers
unit-tested.)

## Implementation Notes
**Files:** `drizzle/0023_course_ended.sql` (new) · journal idx 23 · `lib/migration-witness.ts` ·
`db/schema.ts` · `lib/course-plan.ts` (`isCourseEnded`, `courseOwedTarget`, `canInsertIntoCourse`,
`planCourseMovesForCourse`, `endableSessions`, `END_REASONS`) · `lib/leave.ts` (summary) ·
`lib/course-history.ts` (the `course-ended` event) · `services/scheduler.service.ts` (`endCourse`,
`previewCourseEnd`, the four guard sites) · `validation.ts` · `routes/api.ts` · tests:
`lib/course-end.test.ts` (13) · `services/course-end.service.test.ts` (11) · `course-history` (+4).

**1. `0023`** — four nullable columns **plus a CHECK on `end_reason`**: a typo'd reason is an ended course
nobody can find again, which defeats the one job the enum has. Witness = the CHECK (last object, so a
half-applied run is detectable).

**2. 🔴 `endedAt` is consulted at FOUR sites, not three.** SPEC-064 names `owedCount`, `insertable` and
`reconcileCoursePlan`; the server-side `NO_OWED_SESSION` gate is the same question again (the one TASK-165 found)
and now routes through the same `canInsertIntoCourse`, so the DTO and the API cannot disagree about an ended
course. That is what makes AC-1 true *permanently* — R4.1's test asserts both directions: an ended course plans
nothing, and **the identical course not ended would have re-owed**, which is the failure the guard prevents.

**3. 🔴 Scope call I made and want ratified (Q1): the contract says "remaining PENDING"; I cancel PENDING *and*
CONFIRMED.** A course's sessions become CONFIRMED the moment staff confirm the schedule, so PENDING-only would
leave a cancelled course's sessions on the calendar, still blocking their slots — the exact thing the customer
asked us to remove. R4.2's untouched list (`ATTENDED / EXTENDED / SICK_LEAVE / CANCELLED`) pointedly omits
CONFIRMED, which is why I read it as wording rather than intent. **One constant (`ENDABLE_STATUSES`) to reverse.**

**4. R4.3/R4.4 are asserted at the source**, as in TASK-178/180: `endCourse`'s body may not contain
`recordSale`, `boMovement`, `refund`, `usedSessions`, `reconcileCoursePlan`, `enqueue`/`notify`/`outbox`. I
cannot prove "the movement count is identical" without a database; "the function cannot write one" is the
strongest guarantee available from here, and I would rather say so than let a green suite imply otherwise.

**5. The refusals throw inside the transaction**, so a refused call rolls back rather than relying on an early
return, and the 400s carry **codes** (`REASON_REQUIRED` / `INVALID_REASON`) rather than the generic VALIDATION
envelope — the FE needs to tell "you didn't pick one" from "that isn't a reason we accept".

**6. History gets ONE `course-ended` event** carrying reason + note, in date order with the sessions — not N
anonymous cancellations that nobody could tell from an ordinary cancel. `actor` stays `null` like every other
event (SPEC-035 §1, shared login); **who** ended it is recorded in `ended_by` and stays answerable by query,
which matches the ruling on the discount actor.

**7. `endedAt`/`endReason` are on the course summary**, so an ended course looks ended on *every* screen that
renders one — otherwise staff keep booking into it from a screen showing nothing wrong. `size` is untouched:
it is what the family bought (REQ-064's lesson).

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **778 pass / 0 fail** (+28). ⚠️ **I ran nothing against a
database** — so the route itself is un-exercised; the guarantees above are pure-layer and source-level.
**Owner-run: `0023`, `sid` first, migration BEFORE code** (the columns must exist before anything reads them).

**DoD:** R4.1 no re-owe — owed 0, insertable false, no EXTENDED, both directions tested ✅ · R4.2 delivered rows
never in the endable set ✅ · R4.3/R4.4 source-asserted ✅ · R4.5 second call 409, thrown in-tx ✅ · R4.6 three
reasons closed + round-tripped, `ADMIN_ERROR` queryable ✅ · coded 400s + 404 + one tx ✅ · tsc/test ✅.

## Questions
- **Q1 (the one that changes behaviour): PENDING-only vs PENDING+CONFIRMED** — see §3. I built the second; say
  the word and it is a one-constant revert.
- Q2: `previewCourseEnd` returns `alreadyEnded` so the dialog can say "already cancelled" instead of offering a
  button that will 409. Not in the contract's preview shape — additive, so nothing breaks if Fern ignores it.

  > **answer (Sober): PENDING + CONFIRMED + `EXTENDED`.** Your instinct to widen past "PENDING-only" was right — but
  > stop one status short and the bug you just fixed comes back wearing a different label. An appended `EXTENDED` is a
  > **future make-up booking** (`scheduler.service.ts:1658`/`2053` insert it with a future `date` + real slot), it is
  > **not** in `SLOT_NON_BLOCKING` (so it blocks its slot) and getCalendar only hides `CANCELLED` (so it shows). So a
  > course that ever took a sick-leave has a live `EXTENDED` on a teacher's calendar — and ending with
  > `ENDABLE=["PENDING","CONFIRMED"]` leaves that ghost session booked. The principled line is the invariant the whole
  > plan is built on: **forfeit everything still LIVE. `ENDABLE_STATUSES = COURSE_LIVE_STATUSES` (PENDING, CONFIRMED,
  > EXTENDED).** Delivered ({ATTENDED, NO_SHOW}) + SICK_LEAVE + already-CANCELLED stay byte-identical — those are real
  > history; a not-yet-attended make-up is not history, it is a future slot the customer asked us to release.
  >
  > **Q2: accept** — `previewCourseEnd.alreadyEnded` is a good additive; I'll tell Fern she may use it to show "already
  > cancelled" instead of a button that 409s. Contract shape unchanged.

## Review — REVISE (Sober 2026-08-24)
Reproduced: `bunx tsc --noEmit` **0** · `bun test` **778/0** (+28) · course-end suites **24/0**. The design is strong and
I'm keeping almost all of it: the **fourth guard site** (the server `NO_OWED_SESSION` gate routed through the same
`canInsertIntoCourse` as the DTO, so API and DTO can't disagree about an ended course — that's the right catch), the
`end_reason` **CHECK as migration witness**, coded 400s thrown **inside** the tx (refusal ⇒ rollback, zero rows), one
`course-ended` history event, `actor=null`/`ended_by` per the discount-actor ruling, `size` untouched. R4.5/idempotent,
the 404, the source-level "endCourse's body cannot call recordSale/boMovement/refund/reconcile/notify" assertions — all
accepted (you're right that "cannot write one" is the strongest claim available without a DB).

**The one change (correctness, not style):** `ENDABLE_STATUSES` → **`COURSE_LIVE_STATUSES` (add `EXTENDED`)** per the Q1
answer above. Consequently **flip R4.1/R4.2's EXTENDED assertion**: the test currently asserts an appended `EXTENDED`
stays untouched — it must assert that a **future `EXTENDED` make-up IS cancelled** by end, and that only truly-delivered
rows (ATTENDED/NO_SHOW/SICK_LEAVE/already-CANCELLED) stay byte-identical. Add one case: *a course with a sick-leave→
make-up, ended, has no live session left on the calendar and its make-up's slot is free.* That's the case that ships
wrong today. Everything else stands. **FE (TASK-182) is unaffected** — the status set is internal; `removedSessions` just
counts the EXTENDED too.

## Revision 1 — the EXTENDED gap (Sober's review, 2026-08-24)
**Fixed as ruled.** `ENDABLE_STATUSES = COURSE_LIVE_STATUSES` — PENDING, CONFIRMED **and EXTENDED**, and it is
now literally the live set rather than a second list that could drift the next time a status is added.

**The catch was right and my Q1 was too narrow.** I reasoned about CONFIRMED from "staff confirm the schedule"
and stopped there; an appended `EXTENDED` is the same thing one label over — a real future booking, not
slot-non-blocking, and shown by `getCalendar` — so **every course that has ever taken a sick leave** carries one.
Ending the course would have left a ghost make-up holding a teacher's slot, on the commonest path there is.

**What made it dangerous is the part worth recording:** my own R4.2 test *asserted EXTENDED stays untouched*, so
the suite would have gone green over it. That is the "the test asserted the bug" pattern for the third time in
this project (Onewheel 10 h, bike/skate 1 h, now this) — and the common thread each time is a test written from
the code's intent rather than from what the user would see. The assertion is flipped, and the case it should
have covered is now explicit: **course with leave → make-up, ended ⇒ nothing LIVE remains, the make-up's slot
is free**, with the sick leave itself untouched because it is history.

`SICK_LEAVE` stays out of the endable set deliberately — it is the record of an absence that already happened,
and it earned the make-up we are now cancelling.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **781 pass / 0 fail** (+3). Nothing else changed — the
contract, the guards, the history event and the source-level assertions are exactly as reviewed.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-181 | scheduler-back (BE): **REQ-036 end a course early** — `POST /courses/:id/cancel` (+`/cancel/preview`, writes nothing, powers the dialog count R2); soft-cancel the not-yet-happened sessions in one tx, **no reconcile**; migration `0023` `ended_at`/`end_reason`/`end_note`/`ended_by` + guard the plan-responsibility sites on `endedAt` (owed→0, insertable→false, reconcile→no moves); reason enum + note + actor in history; no money, no notify. | SPEC-064 (REQ-036) | 🔎 **REVIEW — rev 1** (Jason 2026-08-24 — ✅ **Sober's EXTENDED fix applied**: `ENDABLE_STATUSES = COURSE_LIVE_STATUSES` (now literally the live set, not a copy that can drift). His catch was right and my Q1 too narrow — an EXTENDED is a real future booking one label over from CONFIRMED, so **every course that ever took a leave** would have kept a ghost make-up holding a slot. 🔴 **And my own R4.2 test asserted EXTENDED stays untouched** — the suite would have gone green over it; that is the third  on this project, each time from writing the test to the code's intent instead of to what the user sees. Flipped, plus the case it should have had: leave→make-up, ended ⇒ nothing LIVE remains, slot free, SICK_LEAVE untouched (history). tsc 0 · **781/0**. — _orig:_ `0023` = 4 nullable cols **+ CHECK on `end_reason`** (a typo'd reason is an ended course nobody can find again); witness = the CHECK. 🔴 **`endedAt` guards FOUR sites, not three** — the server-side `NO_OWED_SESSION` gate is the same question, now through the same `canInsertIntoCourse`, so DTO and API cannot disagree. R4.1 tests **both directions**: an ended course plans nothing, and the identical course **not** ended WOULD have re-owed — that is the failure the guard exists for. 🔴 **Q1, a scope call to ratify**: the contract says "remaining PENDING"; I cancel **PENDING + CONFIRMED**, because sessions become CONFIRMED as soon as staff confirm the schedule, so PENDING-only leaves a cancelled course on the calendar still blocking its slots — and R4.2's untouched list pointedly omits CONFIRMED. One constant to revert. R4.3/R4.4 **source-asserted** (the fn may not contain recordSale/boMovement/usedSessions/reconcile/notify) — I cannot prove "movement count identical" without a DB and say so rather than imply it. Refusals throw **inside** the tx; 400s carry codes (`REASON_REQUIRED`/`INVALID_REASON`). History gets ONE `course-ended` event with the reason, not N anonymous cancels; `endedAt`/`endReason` on the course summary so an ended course looks ended on every screen. tsc 0 · **778/0** (+28). ⛔ `0023` owner-run, sid first, **migration before code**.) | Sober | — |
```
