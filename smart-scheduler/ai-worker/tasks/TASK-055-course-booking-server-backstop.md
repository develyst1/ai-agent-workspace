# TASK-055: scheduling (BE) — require `courseId` on COURSE_PACKAGE bookings (server backstop)
- Source: SPEC-017 (REQ-022) — raised by Sober during TASK-052's review
- Status: DONE  (reviewed 2026-08-01 by Sober — symmetric refine verified, caller check done properly, symmetry test; tsc 0 / 232 tests) — ⚠️ **deploy FE before/with BE** or every Course-tab booking 400s
- Depends on: none
- Assignee: @Jason (smart-scheduler-back, port 4006)

## Why
`validation.ts` already refuses a VOUCHER booking with no `voucherId`, with the reason written in the code:

```ts
// การจองแบบ Voucher ต้องผูกวอยเชอร์เสมอ (ไม่งั้นชั่วโมงจะไม่ถูกตัด)
.refine((d) => d.bookingType !== "VOUCHER" || !!d.voucherId, …)
```

**There is no symmetric rule for `COURSE_PACKAGE`**, and the consequence is identical: `insertBooking` stores
`courseId: input.courseId ?? null`, and both the check-in increment (`scheduler.service.ts:786`,
`if (current.courseId && current.course)`) and the end-of-day NO_SHOW cut are gated on `courseId`. So a
COURSE_PACKAGE booking without one is a **free session** — attended it deducts nothing, no-showed it cuts
nothing — and the course's remaining count drifts away from reality, which is the number TASK-051's eligibility
rule reads.

This bit us for real: TASK-052's Course tab shipped to review sending no `courseId`. The FE fix closes it, but
the UI shouldn't be the only thing standing between us and a silent entitlement leak — same reasoning as the
server-side suspend gate in TASK-048.

## What to do
- Add the symmetric `.refine` to `createBooking` in `validation.ts`: `bookingType === "COURSE_PACKAGE"` ⇒
  `courseId` required, with a clear Thai message in the same style as the voucher one.
- ⚠️ **Before you do: check no other caller relies on the current leniency.** `createCoursePackage` calls
  `insertBooking` directly (not the route) so it isn't affected, and the sick-leave auto-extension inserts
  directly too — but confirm that yourself rather than taking my word, and **say what you found**. If some
  legitimate path does post a COURSE_PACKAGE booking without a course, tell me and stop — that changes the
  answer.
- Nothing else changes: no migration, no change to the booking flow, the freelance cap, or the suspend gate.

## Definition of Done
- [ ] `POST /bookings` with `bookingType: "COURSE_PACKAGE"` and no `courseId` → **400** with a clear message;
      with a `courseId` → unchanged behaviour.
- [ ] Stated in your notes which other callers you checked and why they're unaffected.
- [ ] `bunx tsc --noEmit` clean; `bun test` green — a test per branch (missing → 400, present → passes), sitting
      next to the existing voucher-refine coverage.

## Implementation Notes

Added the symmetric `.refine` to `createBooking` in `validation.ts`, immediately after the voucher one and in
the same style:
```ts
.refine((d) => d.bookingType !== "COURSE_PACKAGE" || !!d.courseId, {
  message: "การจองแบบคอร์สต้องเลือกคอร์ส (courseId)",
  path: ["courseId"],
})
```
with a comment stating the consequence (no `courseId` ⇒ the check-in increment and the end-of-day cut are both
skipped ⇒ a free session and a course balance that drifts from the number TASK-051's eligibility reads).

**Caller check — I verified it myself rather than taking your word, and it matches what you expected:**
- `v.createBooking` is referenced by **exactly one** route: `POST /bookings` (`routes/api.ts:112`). Grep found
  no other user of the schema.
- The other two paths that create booking rows **bypass this schema entirely**, so neither is affected:
  - `createCoursePackage` → calls `insertBooking(...)` **directly** (`scheduler.service.ts:632`); its route
    `POST /courses` validates with the separate `v.createCoursePackage`, and it always has a `courseId` because
    it just created the course;
  - the sick-leave **auto-extension** → a direct `insert(bookings)` (`:849`), no route validation at all.
- **No legitimate path posts a COURSE_PACKAGE booking without a course**, so there was nothing to stop and
  report back on.

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **232 pass / 0 fail** (39 files).
- New `validation.booking-refine.test.ts`, sitting beside the behaviour it mirrors: **COURSE_PACKAGE without
  `courseId` → rejected** (and the issue is reported on the `courseId` path, so the FE can highlight the right
  field) · **with `courseId` → passes** · the **existing voucher rule still holds** both ways (symmetry check,
  so a future edit can't quietly break one while fixing the other) · `FIRST_TRIAL` / `SINGLE_SESSION` need
  neither id and are unaffected.

**DoD:** `POST /bookings` COURSE_PACKAGE without `courseId` → **400** with a clear Thai message; with one →
unchanged ✓ · other callers checked and stated (both bypass the schema) ✓ · tsc clean + `bun test` green with a
test per branch next to the voucher coverage ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- If you find a real path that legitimately creates a course booking with no `courseId`, **stop and tell me** —
  don't force the rule through.

## Review
**Verdict: DONE ✅ (Sober, 2026-08-01).** Verified in `validation.ts`: the new refine sits immediately after the
voucher one, in the same shape, with `path: ["courseId"]` so the FE can highlight the right field, and a comment
stating the *consequence* (free session + drifting balance) rather than just restating the code. `bunx tsc
--noEmit` → **0**; `bun test` → **232/0** on my own run.

- **The caller check is what I asked for and he actually did it:** `v.createBooking` is used by exactly one
  route, and the two other booking-row creators (`createCoursePackage` → `insertBooking` directly;
  the sick-leave auto-extension → a direct insert) **bypass the schema entirely**. He named them and said why
  each is unaffected instead of asserting "nothing else uses it".
- **The symmetry test is the right one** — asserting the *voucher* rule still holds both ways alongside the new
  course rule means a future edit can't quietly break one while fixing the other. That's the failure this
  backstop exists to prevent, applied to the backstop itself.

### ⚠️ Deploy-order hazard — @Porter, this one bites if the batch is applied out of order
This refine makes `POST /bookings` **reject** a COURSE_PACKAGE booking with no `courseId` — and the FE only
started sending it in **TASK-052**. So:
> **Deploy the frontoffice FIRST (or both together). Backend-first breaks every Course-tab booking with a 400.**

FE-first is safe: the new FE sends `courseId`, and the old backend simply accepts it (the field has always been
optional). Please put this line in the deploy manifest — it's the only ordering constraint in the batch.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-055 | scheduling (BE): server backstop — **require `courseId` on COURSE_PACKAGE bookings** | SPEC-017 | ✅ **DONE** (Sober 2026-08-01 — symmetric refine + `path:["courseId"]`, caller check done properly (both other insert paths bypass the schema), symmetry test guards the voucher rule too; tsc 0 / 232 tests) — 🔴 **DEPLOY ORDER: frontoffice FIRST or both together — backend-first 400s every Course-tab booking** | Jason | — |
```
