# TASK-105: scheduling (BE+FE) — every course-cancel re-owes; delivered-cancel needs a reason
- Source: SPEC-028 §11.2 + §11.3 (owner decisions 2026-08-03 — relaxes TASK-093's guard + unifies the cancel rule)
- Status: TODO
- Depends on: TASK-093 (the guard it relaxes)
- Assignee: @Jason (BE) + @Fern (FE)

## What to change
The `isDelivered` guard stays for **edit/move**, but **cancel is allowed on a DELIVERED session (ATTENDED/NO_SHOW)
iff a non-empty `reason` is supplied** — to undo a mis-marked attendance, audited.

- **BE (`updateBookingStatus:cancel`, `scheduler.service.ts:~1390`):**
  1. If the session is `DELIVERED` and no non-empty `reason` → reject (`REASON_REQUIRED`, "ต้องระบุเหตุผลในการยกเลิกคาบที่เรียนไปแล้ว").
  2. Allow the cancel; **store `reason` + actor + timestamp** for audit (reuse the booking `note`/reason fields;
     add an audit field if none fits — SA-flexible, but the *why* must be recorded and surfaceable).
  3. **Ripple (both, in the one tx) — applies to EVERY course-session cancel, delivered or not (§11.3):**
     - **course-size** — call `reconcileCoursePlan` on cancel so the cancelled session **re-owes** (appends a
       makeup); `current` returns to `size`. ⚠️ This is **not** wired into the cancel path today — add it. A
       per-session cancel is a reschedule, not a forfeit. **Only `NO_SHOW` consumes** (unchanged).
     - **money** — `reconcileBookingHolds(..., "CANCELLED", ...)` **releases** the drawn hour (CANCELLED is releasing). ✅
  4. Keep edit/move of delivered **blocked** — this opens only the cancel-with-reason door. The **reason is required
     only for the DELIVERED case**; a plain non-delivered cancel re-owes with no reason.
- **FE:** cancelling a delivered session prompts for a **required reason** before the call; show the server's
  `REASON_REQUIRED` if missing; surface the stored reason where cancellations are shown.

## Definition of Done
- [ ] Cancel of an ATTENDED/NO_SHOW session **without** a reason → rejected; **with** a reason → succeeds, reason stored.
- [ ] The freelance hour releases; the course re-owes (a makeup is appended) — verified in a test.
- [ ] **A non-delivered (CONFIRMED/PENDING) course cancel ALSO re-owes** — `current` returns to `size`, no reason
      required; a test proves both delivered and non-delivered cancels append a makeup.
- [ ] `NO_SHOW` still consumes (no re-owe) — unchanged.
- [ ] Edit/move of a delivered session still `SESSION_DELIVERED`.
- [ ] `bunx tsc --noEmit` clean; `bun test` green; FE tsc/build ok.

## Resolved
The non-delivered-cancel question is answered (owner 2026-08-03): **all course cancels re-owe; only NO_SHOW
consumes** (SPEC-028 §11.3). Folded in above.
🔴 **Separate confirmed gap → future REQ (post-go-live):** there is **no cancel-course / refund / early-termination
flow** (grep-confirmed). Since a per-session cancel now never shrinks a course, ending a course early has no path.
Flagged to @Porter; not go-live-blocking.

## Review (BE half)
**Verdict: BE DONE ✅** — Sober, 2026-08-04 (code-verified). Read the `cancel` branch + `requiresCancelReason`; ran
the suite: **tsc 0 · 437/0**.
- **Reason-gate right** — `requiresCancelReason(status) = isDelivered(status)`; a delivered cancel with an empty
  (or whitespace-only — `.trim()`) reason → `REASON_REQUIRED`; the reason is stored in `note`.
- **Re-owe wired correctly** — `if (courseId) reconcileCoursePlan(tx, courseId)` after CANCELLED; re-owes for BOTH a
  live and a delivered cancel (both end CANCELLED, `current` drops, the count-driven append restores `size`).
  Idempotent (`current==size` → no-op), so a re-cancel doesn't double-append. **Only NO_SHOW consumes** (its action
  untouched); edit/move of delivered stays `SESSION_DELIVERED`.
- **Money releases** — the post-branch `reconcileBookingHolds(id, after.status=CANCELLED)` (`:1705`) targets 0 and
  releases; the makeup draws on its own confirm ⇒ a cancel nets 0 freelance hours until the makeup is taught.

### Two notes (neither blocks BE-DONE)
1. **Actor not captured — accepted, honest gap.** No per-user auth today (one shared login), so "who cancelled"
   can't be recorded truthfully; Jason stored *why* + *when* (`updatedAt`) and flagged it rather than faking an
   actor. Correct call. **Actor lands with separate-logins** (the REQ-031 prerequisite), not here.
2. 🔴 **Cross-rule edge → @Porter (owner awareness):** a course-session cancel is **REFUSED with `EXTENSION_CEILING`**
   when the course is already at its `MAX_WEEK` — the re-owe makeup would fall past the ceiling (`:1357`). Rare (only
   a fully-extended course), and arguably correct, **but the message is about *extension* while the user *cancelled*
   — confusing UX.** Escape today is admin `override`; the real home is REQ-036 (early termination). The owner
   should know a late-in-a-maxed-out-course cancel can be blocked.

**FE half (reason prompt + surface the stored reason) is @Fern's.**

## FE half — BLOCKED (Fern 2026-08-04): the task assumes a cancel UI the FE doesn't have + a DTO gap → @Sober
Investigated before building. Two concrete blockers — routing to you rather than guessing where a brand-new
cancel surface lands on the just-`TEST_PASSED` plan modal:
1. **There is NO cancel-booking action anywhere in the FE today.** `BookingModal` has confirm/attend/sick-leave
   only; there's no `cancelBooking` in `scheduler.service.ts`/`useScheduler.ts`, no `action:"cancel"` call
   (grep-clean). So this isn't "add a reason to the existing cancel" — it's **adding the cancel capability**.
   **Where should it live?** My proposal: the **plan modal** (TASK-099) — delivered rows (currently read-only for
   edit/move, correctly) gain a **"cancel (with reason)"** action; non-delivered rows get a plain cancel (re-owes,
   no reason). That's consistent with §11 ("opens only the cancel-with-reason door"; edit/move stay blocked). OK,
   or should cancel live in the calendar/BookingsTable instead?
2. **"Surface the stored reason where cancellations are shown" isn't reachable from the plan modal.** The plan
   **session DTO (`toSessionRow`) has no `note`/`reason`** — only `{id,date,startTime,status,teacher,subject}`. The
   reason is on the full `BookingDTO.note` (calendar/bookings-table have it), but the plan rows don't. So either
   (a) @Jason adds `note` to `toSessionRow` so I can show the reason on a cancelled plan row, or (b) the reason is
   surfaced only in the booking views that already carry `note` (which is also where a cancel button might belong).
   Please decide (1)+(2) together — they're the same "where does cancel live" question.
- **Ready to build immediately** once you confirm placement; the BE (`cancel` + reason-gate + `CANCEL_AT_CEILING`)
  is DONE, so it's a focused FE add. Set FE `BLOCKED (waiting: Sober)`.

### ✅ Sober decision (2026-08-04) — UNBLOCKED, and it's smaller than it looked
Good investigation — routing before guessing was right. Both answered:
1. **Placement → the PLAN MODAL (your proposal, confirmed).** Add a `cancelBooking(id, reason?)` service call (the
   BE `updateBookingStatus` cancel action) and wire it in `PlanModal`:
   - **Delivered rows** (ATTENDED/NO_SHOW, currently read-only for edit/move) → a **"ยกเลิกคาบ (ระบุเหตุผล)"**
     action that prompts for a **required reason**, then cancels. Empty reason → the BE 400s `REASON_REQUIRED`; show it.
   - **Non-delivered LIVE rows** (PENDING/CONFIRMED/EXTENDED) → a plain **"ยกเลิกคาบ"** (no reason; the BE re-owes).
   - Edit/move of delivered stay blocked (unchanged). Consistent with §11 "opens only the cancel-with-reason door."
   - After a cancel, the plan refetches → the cancelled row drops out and the re-owed makeup appears (BE already does this).
2. **Surfacing the stored reason → DEFER (no DTO change now, not a 3-day-core item).** A **cancelled session leaves
   the plan** (CANCELLED isn't LIVE/DELIVERED → filtered out; the makeup replaces it), so there is **no plan row to
   show the reason on** — surfacing it belongs to a **booking-history / calendar** view (where cancelled bookings
   are listed, which already carries `note`), and that's **post-go-live**. So **do NOT** add `note` to `toSessionRow`
   for launch. The core AC — *cancel-with-reason works and the reason is stored/audited* — is met by the BE gate +
   the prompt. **No @Jason dependency; build now.**

So 105-FE core = **the cancel action + the required-reason prompt in the plan modal.** Small, no BE change. **GO.**

## 🟡 Small follow-up (Porter ruling 2026-08-04) — @Jason: clearer ceiling-on-cancel message
The owner accepted the ceiling-edge (keep `override`; the real fix is REQ-036). One ask: the message must **not say
"extension" on a cancel**. Today the re-owe append throws the generic `EXTENSION_CEILING` ("คอร์สขยายเกินสัปดาห์ที่
N ไม่ได้"), which is confusing on a *cancel*.
- **Approach:** in `updateBookingStatus:cancel`, wrap the `reconcileCoursePlan` call so an `EXTENSION_CEILING` from
  the re-owe is re-thrown with a **cancel-specific** reason, e.g. *"ยกเลิกคาบนี้ไม่ได้ — คอร์สขยายเต็มสัปดาห์ที่ N
  แล้ว ไม่มีที่ให้คาบทดแทน (ใช้สิทธิ์แอดมินปลดล็อก)"*. Keep the generic message for the plan-editor extend/append path.
- Small; not go-live-blocking. The full behavioural fix (shrink a course) is REQ-036.

## FE half — DONE → REVIEW (Fern 2026-08-04, per your placement decision)
Built exactly as ruled — cancel-with-reason in the plan modal, reason-surfacing deferred (no DTO change).
- `services/scheduler.service.ts`: `cancelBooking(id, reason?)` → `PATCH /bookings/:id/status {action:"cancel", reason?}`
  + mock stub. Hook `useCancelBooking` (→ `invalidateAll`, so the plan refetches → cancelled row drops, makeup appears).
- `PlanModal` (edit mode only): a per-row **cancel** action + `CancelSessionDialog`:
  - **Delivered rows** (ATTENDED/NO_SHOW — edit/move stay blocked) → "ยกเลิกคาบ" → dialog with a **required reason**
    (client-guarded + the server's `REASON_REQUIRED` shown inline if it slips through).
  - **Live rows** (PENDING/CONFIRMED/EXTENDED) → plain "ยกเลิกคาบ" → dialog confirms (no reason; note: re-owes a makeup).
  - The dialog surfaces the server's exact refusal **inline** (`REASON_REQUIRED` / `CANCEL_AT_CEILING` / clash) and
    stays open so nothing is silently dropped. Create mode has no cancel (preview rows aren't bookings).
- i18n `plan.cancel*` (en + th). **Surfacing the stored reason DEFERRED** per your call (a cancelled session leaves
  the plan; belongs to a post-go-live booking-history/calendar view; no `toSessionRow` change).
- Verified: `bunx tsc --noEmit` 0 · `bun run build` 0. ⚠️ Live render sid-gated (not driven); the cancel button
  sits in the existing plan-table actions cell (already `Table.ScrollContainer`) → no new 4-width item.
- **@Sober: FE ready for review.** Note: this is the intended relaxation of TASK-099's "delivered rows read-only"
  (edit/move still blocked; cancel-with-reason is the newly-opened door) — worth a QA line since Tanya passed the
  read-only behaviour.

## FE Review — DONE ✅ (Sober 2026-08-04) — 🎉 completes the REQ-030 core FE
Code-verified (`CancelSessionDialog` + `cancelBooking` + the PlanModal wiring); ran **tsc 0** myself.
- **Built exactly to the placement decision:** `cancelBooking(id, reason?)` → the BE `action:"cancel"`; delivered
  rows send the reason (`delivered ? reason.trim() : undefined`) with a **client-guard + the BE `REASON_REQUIRED`
  surfaced inline**; live rows plain-cancel; **edit/move of delivered stay blocked** (`:285`). Refusals
  (`REASON_REQUIRED`/`CANCEL_AT_CEILING`/clash) keep the dialog open — nothing dropped, input kept. On success the
  plan refetches → cancelled row drops, makeup appears.
- **Reason-surfacing correctly deferred** (no `toSessionRow` change). Create mode has no cancel (right — preview rows
  aren't bookings). No new shared-row control (button in the existing `ScrollContainer` actions cell).
- **TASK-105 fully DONE (BE + FE).**
- 📌 **QA flag routed (@Porter → Tanya):** delivered rows are no longer *fully* read-only — **edit/move still blocked,
  but cancel-with-reason is now allowed.** Tanya passed the read-only behaviour, so her re-check should confirm:
  edit/move of a delivered row still refuses, AND the new cancel-with-reason works (empty reason → refused; with
  reason → cancels + a makeup appears). Good proactive flag by Fern.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-105 | scheduling (BE+FE): **owner reversals** — **every** course cancel re-owes a makeup (`reconcileCoursePlan` on cancel, not wired today; only NO_SHOW consumes) + a **DELIVERED** cancel needs a **mandatory reason** (audited) + releases the freelance hour; relaxes TASK-093's guard | SPEC-028 §11.2/§11.3 | 🔎 **BE REVIEW · FE→Fern** (Jason 2026-08-04 — tsc 0 · **437/0**, careful pass. `updateBookingStatus:cancel`: (1) DELIVERED cancel now ALLOWED but only with a non-empty `reason` → else `REASON_REQUIRED`; pure guard `requiresCancelReason(status)=isDelivered` (tested). (2) reason audited into `note` (already in DTO — surfaceable); **actor not captured — no per-user auth today** (same shared-login limit as REQ-031). (3) **`reconcileCoursePlan` wired into cancel for the first time** → EVERY course cancel re-owes a makeup, `current`→`size`; money releases via the existing CANCELLED reconcile (makeup draws on own confirm ⇒ cancel nets 0 freelance hrs until taught). Edit/move of delivered still `SESSION_DELIVERED` (untouched). Pure tests: both live & delivered cancel append a makeup, NO_SHOW still consumes. **@Fern:** prompt required reason on a delivered cancel, surface `REASON_REQUIRED` + the stored reason. 🔴 post-go-live gap unchanged: no cancel-course/refund flow (flagged @Porter) — ✅ **BE DONE** Sober 2026-08-04: code-verified (reason-gate incl. `.trim()`, re-owe idempotent for live+delivered, money release at `:1705`); tsc 0 · 437/0 run by me. **2 notes:** actor deferred to separate-logins (honest gap, accepted); 🔴 **@Porter edge** — a cancel at a course's MAX_WEEK is refused `EXTENSION_CEILING` (re-owe makeup can't fit) — confusing "extension" msg on a cancel; escape = override / REQ-036. **FE half still @Fern** — 🔧 **ceiling-msg FOLLOW-UP DONE** Jason 2026-08-04: the cancel path now catches `EXTENSION_CEILING` from `reconcileCoursePlan` and re-throws cancel-specific `CANCEL_AT_CEILING` ("คอร์สเต็มกำหนดสัปดาห์สูงสุด คาบชดเชยไม่มีที่ลง — ใช้ override หรือสิ้นสุดคอร์สก่อนกำหนด"); the extend paths keep the generic message. tsc 0 · 445/0) · 🖥️ **FE → REVIEW** (Fern 2026-08-04, per Sober's placement call — `cancelBooking(id,reason?)` + `CancelSessionDialog` in `PlanModal`: delivered rows → required-reason cancel; live rows → plain cancel; server refusals (`REASON_REQUIRED`/`CANCEL_AT_CEILING`) shown inline; reason-surfacing DEFERRED per Sober; tsc 0 / build 0. ⚠️ relaxes TASK-099's "delivered read-only" — QA line for @Tanya) — ✅ **FE DONE** Sober 2026-08-04: code-verified (delivered→required-reason w/ client-guard + BE `REASON_REQUIRED` inline, live→plain, edit/move still blocked, refusals keep dialog open); tsc 0 run by me. **TASK-105 FULLY DONE (BE+FE). 🎉 Completes the REQ-030 core FE.** QA flag → @Tanya (delivered edit/move still refuses; new cancel-with-reason works) | Jason+Fern | TASK-093 |
```
