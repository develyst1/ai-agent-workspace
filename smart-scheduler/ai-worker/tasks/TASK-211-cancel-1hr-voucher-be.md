# TASK-211: Cancel a 1HR / Voucher booking, with a reason (REQ-074) (scheduler-back)

- Source: REQ-074 (owner). 🟠 MEDIUM. Gates uat. On `develop`.
- Status: ✅ **BE DONE (Sober 2026-08-29)** — migration RATIFIED (Q1); enum queryable not free-text; SINGLE_SESSION/VOUCHER only; no refund. tsc 0·911/0. `0025` owner-run sid-first. ⚠️ Lands WITH TASK-212 (FE) or FE-first — BE-alone 400s the cancel button.
- Repo: **scheduler-back**.

## What — REUSE REQ-036's enum, do not invent a second reason-set
Cancel a **1HR (`SINGLE_SESSION`)** or **Voucher** booking with a **required reason** from **the SAME enum** as REQ-036:
`ADMIN_ERROR` · `CUSTOMER_CANCELLED` · `PROGRAM_CHANGED` (same three labels). A parallel reason-set would drift and make
*"find every admin-error cancellation"* impossible to answer in one query — so it must be the same enum + the same
storage (`note`/reason field the cancel path already uses).

## Design
- A single-booking cancel-with-reason. Check whether `updateBookingStatus(id, "cancel", {reason})` already carries the
  reason (REQ-036/TASK-105 added required-reason on delivered cancels) — **reuse it** for 1HR/voucher; only add what's
  missing. Enumerate the cancel paths from the router (the TASK-185 habit).
- 🔴 **Money: record the reason, build NO refund logic** (same line held on REQ-036). Consequences differ and are for
  a later human: a `SINGLE_SESSION` posts revenue **at day-end when ATTENDED** (cancel before attend → nothing posted);
  a **voucher posts at sale** (cancelling a voucher session does not un-post the sale). The reason enum is what makes
  cleanup possible later — do not attempt it now.
- Idempotent; a cancelled booking re-cancelled is refused, not double-written.

## DoD
- [ ] A 1HR and a voucher booking can be cancelled with one of the three reasons; the reason is stored on the SAME
      field/enum as REQ-036 (a query for `ADMIN_ERROR` finds it alongside course cancels).
- [ ] No refund / no bo.movement written by the cancel (assert at source, TASK-185 style).
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun test` green.

## Notes
(Jason fills in. FE dialog = TASK-212. If the cancel path already does all this, say so and the task is a thin
confirmation + a test, not new code.)


## Implementation Notes
**Files:** `drizzle/0025_booking_cancel_reason.sql` (new) · journal idx 25 · `lib/migration-witness.ts` ·
`db/schema.ts` · `services/scheduler.service.ts` (the cancel branch + a 5th optional arg) · `validation.ts` ·
`routes/api.ts` · `openapi/document.ts` · `services/cancel-reason.test.ts` (new, 8).

**I enumerated the cancel paths from the router first** (the TASK-185 habit): there is exactly **one** —
`PATCH /bookings/:id/status` with `action: "cancel"`. No second door to guard.

**The existing path did NOT already do this**, so this is real code, not a confirmation: it required a reason
only for a **delivered** session, and stored it as **free text in `note`**.

### 🔴 The judgement call, and the migration the task didn't ask for
The task said to store the reason on "the same field the cancel path already uses" (`note`). **I added a column
instead** (`0025`, same closed set + CHECK as `0023`), because the DoD's own promise — *"a query for
`ADMIN_ERROR` finds it alongside course cancels"* — is not deliverable from free text. A token inside a human
sentence answers that with `LIKE '%ADMIN_ERROR%'`: it matches notes that merely mention the words, misses one
typed in Thai, and stops working the day somebody rephrases. **"We can clean this up later" is only true if
later is a `WHERE`.** `note` keeps the human sentence; the column keeps the machine one.

**Required for `SINGLE_SESSION` and `VOUCHER` only.** A `COURSE_PACKAGE` cancel is a **reschedule that re-owes
a make-up** (SPEC-028 §11.3) — a different act with its own rules — so forcing an enum onto it would change a
path REQ-074 never asked about. There is a test asserting that path is byte-identical, and the column is only
written when the enum applies.

**No refund, no ledger write** — asserted by absence (`recordSale` / `boMovement` / `refund` do not appear in
the cancel branch). A `SINGLE_SESSION` posts revenue at day-end **when ATTENDED**, so a cancel before that
posted nothing; a **voucher posts at sale**, so cancelling a session cannot un-post it. The money consequences
differ and are a later human's call — recording the reason is what makes that call possible.

**`reasonCode` is a 5th optional argument**, so every existing caller of `updateBookingStatus` is untouched.
Zod carries the shape; the **requirement** lives in the service only — a second copy of a domain rule in the
validator is how the two drift.

**Verified:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **911 pass / 0 fail** (+8).
⚠️ Nothing run against a database. **Owner-run: `0025`, `sid` first.**

### ⚠️ This merges WITH TASK-212, not before it
The server now **refuses** a 1HR/voucher cancel that carries no `reasonCode`. If this lands alone, the current
UI's cancel button starts returning 400 on those two booking types. Same coordinated-merge rule as TASK-168/169
— **and if they cannot land together, land the FE first**: an FE sending a field the server ignores is
harmless, the reverse is a broken button.

## Questions
- Q1: the migration (`0025`) instead of reusing `note` — reasoning above. If you'd rather ship without a
  migration this week, the fallback is storing the token in `note` and accepting a `LIKE` audit, and I'd want
  that written down as a known limitation rather than discovered later.
- Q2: **existing cancelled bookings keep `cancel_reason = NULL`** and are deliberately not back-filled. Nobody
  asked those people for a reason; a guessed value would be indistinguishable from a recorded one, which is
  worse than a gap.

  > answer: (Sober)

## Review — ✅ PASS + migration ratified (Sober 2026-08-29)
Reproduced tsc 0 · `bun test` **911/0** (+8). Enumerated-from-router (one cancel path), enum required for
SINGLE_SESSION/VOUCHER only (course cancel byte-identical — it's a re-owe, different act), no refund/ledger asserted by
absence, `reasonCode` a 5th optional arg so existing callers are untouched and the rule lives only in the service. Clean.

**Q1 — RATIFY the migration; it catches an error in MY spec.** I said "store on the field the cancel path uses" (`note`,
free text), but the same task's DoD promised *"a query for `ADMIN_ERROR` finds it"* — **those contradict.** `LIKE
'%ADMIN_ERROR%'` matches a note that only mentions the words, misses a Thai rephrasing, and breaks when someone reworders
the sentence. Jason's `0025` column (same closed set + CHECK as `0023`) makes the enum **actually queryable** while
`note` keeps the human sentence. "Cleanup later" is only real if later is a `WHERE`. Correct call — ship the migration.
(Nuance: course-cancel enum is `course_packages.end_reason`, booking-cancel is now `bookings.reasonCode` — two tables,
so "alongside" = queryable-by-enum on both, a union, not literally one column. That satisfies the intent.)

**Q2 — accept: existing cancelled rows stay NULL.** Nobody asked those people for a reason; a guessed value would be
indistinguishable from a recorded one. No backfill.

**🔴 Deploy-order constraint (carry to Porter):** the server now **400s** a 1HR/voucher cancel with no `reasonCode`, so
TASK-211 (BE) must land **with** TASK-212 (FE), or **FE first** — BE-alone breaks the cancel button in front of staff
(the TASK-168/169 lesson). Goes in the one-deploy uat batch together.
