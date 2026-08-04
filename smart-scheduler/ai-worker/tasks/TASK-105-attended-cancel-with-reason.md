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
