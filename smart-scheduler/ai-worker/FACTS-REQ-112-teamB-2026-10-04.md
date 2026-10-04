# FACTS — REQ-112 (A: cancel extends expiry · B: a make-up is leavable) — @Silver, 2026-10-04
**These are the code's behaviour today, and nothing more.** 🚫 There is no design, no TASK and no edit here. The files are Team A's this batch, and the owner rules on the model separately (REQ-112 §7–§10).
**CERTAIN** means read in back `src/` on today's shared tree; the lines that decide something I read myself. **INFERRED** is marked. `sched` means `services/scheduler.service.ts`.

## 🔑 The fact everything hangs on: what "EXTENDED" means
- **EXTENDED is the status of an UNCONFIRMED make-up.** Confirming it (`sched:3754-3760`, which checks only `confirmedAt`) turns it **CONFIRMED**; it keeps `extendedFromId`.
- ⇒ **A confirmed make-up is an ordinary CONFIRMED row**, and a family **can** already take leave on it from LINE.

## B — a make-up must be leavable
**1. Does the leave ACT refuse an EXTENDED session? NO (CERTAIN).**
- `updateBookingStatus` has no status or type guard on `sick-leave`. Its only early guards are a camp-row check and two confirm/attend-only checks (`sched:3735`, `:3750-3752`).
- The leave branch picks only on ATTENDED / SICK_LEAVE / everything else (`:3975`, `:4013`, `:4018`).
- The PATCH route (`routes/api.ts:320-329`) and its validator (`validation.ts:389-397`) refuse nothing by status.
- ⇒ **Only the window hides it.** The parent leave list is CONFIRMED-only (`checkin.service.ts:177-179`).
- ⇒ **Widening the window is enough for her.** It is the leave half of next-round item 3, **unchanged in size (S/M)**: one named set, read by the window and by a guard in the act.

**2. Does a leave on an EXTENDED session spend leave quota today? YES (CERTAIN), read myself at `sched:4045`.**
- `charges = !declaredFree && course && canTakeLeave(course) && !plannedAtCreation`. **Nothing in it looks at EXTENDED or `extendedFromId`.**
- The counter goes up at `:4060-4064`.
- **It appends a make-up of the make-up:** a new EXTENDED row with `extendedFromId` set to the make-up just left (`:4081-4097`).
- **When quota is used up:** the leave is still recorded as SICK_LEAVE, **no make-up is added**, and the course is flagged `locked` for an admin unlock (`:4102-4103`). No refusal is thrown on this path.
- ⇒ **Today the chain self-limits through the quota.** A family with 2 leaves gets 2 make-ups in total, however they fall.

**3. Is "we confirm Extended only one day ahead" ours or theirs? THEIRS (CERTAIN).**
- There is no auto-confirm anywhere: no job, no setting (`jobs.service.ts` has none). Confirming is always a manual act: the single confirm, bulk confirm (which lets EXTENDED through, `lib/bulk-confirm.ts:17`) or `confirmCourse` (PENDING only).
- Also: the daily reminder skips EXTENDED rows (`lib/daily-reminder.ts:87-89`).

## A — a school-side cancel extends the expiry
**4. What does a cancel record today? (CERTAIN, read myself)**
- **A fixed reason list already exists:** `END_REASONS = PROGRAM_CHANGED · CUSTOMER_CANCELLED · ADMIN_ERROR · TEACHER_LEAVE` (`lib/course-plan.ts:409`).
  - It is stored in `bookings.cancel_reason` (`db/schema.ts:460`) and `course_packages.end_reason`.
- 🔴 **But it is REQUIRED only for SINGLE_SESSION, VOUCHER, FIRST_TRIAL, OTHER and GROUP** (`sched:3898-3909`).
  - **A COURSE session's cancel stores NO reason code**: a code sent with it is ignored, and only the free-text `note` is kept.
  - ⇒ **For the very sessions REQ-112 A is about (course sessions), a cancel cannot be told apart by reason today.**
- The teacher-leave cancel is the exception: it writes `cancelReason: "TEACHER_LEAVE"` itself (`sched:3402`).
- **No `cancelledBy` is recorded** on a cancel.
- 📌 **Two of the four existing codes already read as "the school's" (`TEACHER_LEAVE`, `ADMIN_ERROR`), and two do not.** Whether that list is the one Khwan means, and which codes extend, is **the owner's to rule.** I am not proposing it.

**5. Does any cancel touch the expiry today? Yes, indirectly (CERTAIN).**
- A course-session cancel, and the teacher-leave cancel, run `reconcileCoursePlan` (`sched:3958`, `:3403`).
  - The reconcile **stretches** the expiry when a re-owed make-up lands past it (`:3018-3029`, recorded with no actor).
  - That is a stretch **to fit a make-up**. It is not "+1 week because of who caused it".
- **Every writer of `expiryDate` today:**
  - creation (`:2286`);
  - import (`:2057`, `:2104`, `:2155`);
  - the reconcile stretch (`:3021`);
  - the admin edit (`:5149`);
  - a start-date change (`:5337`);
  - a resume re-plan (`:5428`, `:5452`);
  - undo (`undo.service.ts:179`).
- **INFERRED:** the per-session leave's own make-up (`:4074-4101`) writes no expiry and does not run the reconcile, so it can land past the stored expiry without moving it. ⚠️ That bears on REQ-112 §9.1 ("allow the leave, and tell the admin"). It needs a confirming read before anyone builds on it.

**6. Where "+1 week per school cancel" meets the existing ceiling (CERTAIN on where; no resolution offered)**
- **The ceiling today:** `courseExpiry` = start + (maxWeek − 1) weeks, where `maxWeek = size + quota` (`lib/recurring.ts:44`, `lib/leave.ts:35`). It is widened by declared absent weeks (`courseBornCeiling`, `lib/course-plan.ts:178`).
  - 🔑 **Nothing REFUSES on the ceiling any more.** The refusal was removed (`sched:2953`, `:3951`). `exceedsExtensionCeiling` (`course-plan.ts:150`) survives only as a preview flag that is never true.
  - When the make-up search gives up, the admin is told (`makeup_far_out`, `:2976-2988`).
- **Where the two rules collide** (both write `expiryDate` through `recordExpiryChange`, `sched:5045`):
  1. the reconcile's **grow-only stretch** (`:3018-3029`): a cancel that both re-owes a make-up and earns "+1 week" moves the same number twice in one act;
  2. **`replanExpiry` / `courseBornCeiling`**, which **recompute** the expiry from scratch on a resume or start-date change (`:5428`, `:5452`, `:5337`): a "+1 week" added earlier would be recomputed away unless it is remembered;
  3. **undo's `expiryDecision`** (`lib/booking-undo.ts:97-105`), which restores only when the latest change is a system stretch with no actor.
- ⚠️ **And REQ-112 §8/§9 (no leave quota at all) would remove `quota` from `maxWeek = size + quota`.** That changes the base the ceiling is computed from. It is the owner's model question, and I name it only because it is the same number.

## Next-round item 3, re-stated
- **Leave half: unchanged, S/M.** B adds a customer, not a cost. The act already accepts EXTENDED, so the fix is still one named set (`COURSE_LIVE_STATUSES` = PENDING · CONFIRMED · EXTENDED, `lib/course-plan.ts:7`) read by the window and by a guard that stops the act taking leave on CANCELLED or NO_SHOW rows.
- **Check-in half: XS (wording), as the owner ruled.** Nothing in B touches it.
