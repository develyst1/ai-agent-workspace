# TASK-051: scheduling (BE) — `GET /students/eligible?type=…` (who can be booked, with their context)
- Source: SPEC-017 (REQ-022)
- Status: DONE  (reviewed 2026-08-01 by Sober — delegation to `voucherUsable` + route order verified; both flags answered; tsc 0 / suite 193/0; see ## Review)
- Depends on: none
- Assignee: @Jason (smart-scheduler-back, port 4006)

## What to do
The New-booking modal is being reworked so the **booking type is chosen first** and the student list is limited
to who is actually eligible. Eligibility is a **domain rule**, so it answers here — not in the browser.

**`GET /students/eligible?type=COURSE_PACKAGE|VOUCHER`** (authenticated staff) →
`{ students: Array<{ id, name, nickname, context }> }`:
- `COURSE_PACKAGE` → `context = { courseId, subject: {id,name}|null, size, usedSessions, remainingSessions,
  leaveUsed, leaveQuota, expiryDate }`
- `VOUCHER` → `context = { voucherId, totalHours, usedHours, remainingHours, expiryDate }`

**Eligibility — one definition, server-side:** a student qualifies when they hold a course/voucher that is
**not expired** and **has sessions/hours remaining**. Reuse the existing meaning already in the code (the course
summary's expiry/`usedSessions`/`size`, the voucher's `remaining`/expiry) — **do not invent a second rule**.
- A student with **two active courses appears once per course** (staff pick which); same for vouchers.
- `FIRST_TRIAL` / `SINGLE_SESSION` are **not** served here — those tabs keep `GET /students?q=` (any student,
  including a brand-new one, is valid). Reject an unsupported `type` with a clear 400.

Reuse `getCourses()` / `getVouchers()` and the existing summary mappers rather than writing new joins where you
can avoid it. No new table, no migration, and **no change to `POST /bookings`**.

## Definition of Done
- [ ] `type=COURSE_PACKAGE` returns only students with a **non-expired course with sessions remaining**, each
      with the course context (program, used/size, remaining, leave used/quota, expiry).
- [ ] `type=VOUCHER` returns only students with a **non-expired voucher with hours remaining**, with hours +
      expiry.
- [ ] A student with two active courses appears twice (one per course); a student whose only course is expired
      or fully used does **not** appear. Unsupported/missing `type` → 400.
- [ ] No change to booking creation, the freelance cap, or the suspend gate.
- [ ] `bunx tsc --noEmit` clean; `bun test` green — pure tests for the eligibility predicate (expired · fully
      used · remaining · multi-course) so the rule is pinned down independently of the query.

## Implementation Notes

No migration, no new joins, **no change to `POST /bookings`**, the freelance cap, or the suspend gate.

**Reuse — answering your Question directly.** For **vouchers** the rule already existed: **`voucherUsable(v, onDate)`**
(`lib/voucher.ts`, the same helper `prepareVoucherBooking` enforces at booking time). `voucherEligible` **delegates
to it** — not a copy, so the list and the booking can't drift apart. For **courses there was no equivalent helper**
(only the meaning implied by the summary's `expiryDate` / `usedSessions` / `size`), so I added `courseEligible`
mirroring the same shape in a new pure `lib/eligibility.ts`. Both are used by the query and unit-tested.

**Service — `getEligibleStudents(type)`** (`scheduler.service.ts`): reuses **`getCourses()`** and
**`getVouchers()`** (which already embed student + subject + the computed summaries — `getCourses` carries
`subject` thanks to TASK-034), filters with the pure predicates against **today** (Bangkok), and maps to
`{ id, name, nickname, context }`. Because it maps per entitlement, **a student with two active courses appears
twice** (one row per course), as specified — same for vouchers. Unsupported/missing `type` → **400**.

**Route — `GET /students/eligible`** (`routes/api.ts`, authenticated, `z.enum(["COURSE_PACKAGE","VOUCHER"])`).
Registered **before** the other `/students` routes and I verified the dispatch — the TASK-029 shadowing lesson
applied deliberately, not assumed.

> **⚠️ Flagged, not decided silently (your Question invited exactly this): a LEAVE-LOCKED course is still
> eligible.** `leaveLocked` (over leave quota, not admin-unlocked) governs further **rescheduling/extension**, per
> the domain rules — not whether the family's remaining **paid** sessions may be booked. Excluding them would
> silently withhold entitlement they already own. I included them and documented it in `lib/eligibility.ts`.
> **Say the word if คุณฟีน wants leave-locked courses hidden from the picker** — it's a one-line predicate change.

> **Nuance worth one line: "not expired" is evaluated against TODAY, not the booking date.** The endpoint takes
> no date (the spec defines none). So a voucher/course expiring soon can be listed as eligible while a booking for
> a **far-future** date would still be refused later by `prepareVoucherBooking`. That's the correct conservative
> direction (we never hide something bookable today), and adding `&date=` would be a small follow-up if the modal
> ever books far ahead.

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **193 pass / 0 fail** (35 files).
- New `lib/eligibility.test.ts` — the rule pinned down independently of the query: **expired** → out,
  **fully used** → out, **remaining + valid** → in, expiry **exactly today** → still in (inclusive),
  `remainingSessions` never negative, **multi-course** (one active + one spent → exactly one eligible), and the
  voucher cases incl. an assertion that `voucherEligible` **agrees with `voucherUsable`** (proving it's the same
  rule, not a second one).
- New `routes/eligible.route.test.ts` — proves the literal path **isn't shadowed** by `GET /students`:
  `?type=FIRST_TRIAL` → **400** (only this route's enum can produce that; `/students` would ignore an unknown
  query param), missing type → 400, plus a **control** asserting plain `/students?type=…` does *not* 400.
  *(No service mock: `./api` is already imported by other test files, so a late `mock.module` wouldn't apply —
  I used the assertion that needs no DB and still proves dispatch, rather than a mock that silently no-ops.)*
- ⚠️ The DB-backed 200 path is **deploy smoke** (brownfield). **Smoke:** with a student holding an active course
  → `GET /students/eligible?type=COURSE_PACKAGE` lists them once with program/used/remaining/leave/expiry; a
  student whose only course is expired or fully used is absent; two active courses → two rows; `?type=VOUCHER`
  lists hours + expiry.

**DoD:** course/voucher eligibility with context ✓ · two active courses → two rows, expired/fully-used absent,
bad type → 400 ✓ · no change to booking creation / freelance cap / suspend gate ✓ · tsc clean + `bun test` green
with pure predicate tests (expired · fully used · remaining · multi-course) ✓.

**Handoff:** Fern's **TASK-052** is unblocked — `GET /students/eligible?type=COURSE_PACKAGE|VOUCHER` →
`{ students: [{ id, name, nickname, context }] }`; the FIRST_TRIAL / SINGLE_SESSION tabs keep `GET /students?q=`.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- If "active" turns out to already exist as a helper somewhere, **use it** and tell me — the point is one
  definition, not a new one. If the existing meaning is ambiguous (e.g. leave-locked courses), flag it here
  rather than choosing silently.
- Don't build the modal (that's Fern's TASK-052) and don't change the booking payload.

## Review
**Verdict: DONE ✅ (Sober, 2026-08-01).** Both flags answered below — and he did the thing I care most about:
**he found the existing rule and delegated to it instead of writing a second one.**
- **One definition, verified not just claimed:** `voucherEligible` is literally `voucherUsable(v, onDate).ok` —
  the *same* helper `prepareVoucherBooking` enforces at booking time, so the picker and the booking cannot
  drift. Courses genuinely had no equivalent, so `courseEligible` (`remainingSessions > 0 && onDate <=
  expiryDate`, expiry inclusive) is new and documented as mirroring the meaning the summary already implied.
  The test asserting **`voucherEligible` agrees with `voucherUsable`** is exactly how you pin "one rule" down.
- **Route-shadowing lesson applied deliberately:** `/students/eligible` (`:19`) is registered **before**
  `/students` (`:23`), and he proved dispatch with a test rather than assuming — TASK-029 carried forward
  unprompted.
- **✅ Flag 1 — leave-locked courses stay eligible: agreed, keep it.** `leaveLocked` is the Policy-Lock on
  further *rescheduling/extension*; it says nothing about whether the family's remaining **paid** sessions may
  be booked. Hiding them would silently withhold entitlement they already own — and the context exposes
  `leaveUsed`/`leaveQuota`, so staff can see the situation and decide. Documented in `lib/eligibility.ts`, where
  the next person will look. **@Porter: one-line FYI to คุณฟีน** — hiding them is a one-line change if she wants
  it, but I'd argue against it.
- **✅ Flag 2 — eligibility judged against TODAY, not the booking date: accepted as-is, deliberately.** His
  direction is the safe one (never hide something bookable today), and a far-future booking against a
  soon-expiring entitlement is still refused by `prepareVoucherBooking` — a **late but safe** failure, no bad
  data. Adding `&date=` would be speculative, so I'm **not** building it. **What I did instead:** the
  consequence is now written into **TASK-052** — the modal must surface that submit-time rejection clearly, so
  it reads as *"this voucher expires before that date"*, not as a broken form.
- **Verified myself:** `bunx tsc --noEmit` → 0; full `bun test` → **193/0** (up from 181), incl. the eligibility
  matrix (expired · fully used · remaining · expiry-exactly-today · multi-course) and the not-shadowed route test.
- **Honest test note worth naming:** he dropped a service mock that would have **silently no-opped** (`./api`
  was already imported elsewhere) and used a DB-free assertion that actually proves dispatch. A mock that
  quietly does nothing is worse than no mock — right call.
- **DB-backed 200 path is deploy smoke** (brownfield) — accepted, steps documented.
- **TASK-051 → DONE. @Fern: TASK-052 unblocked** (contract as specced).

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-051 | scheduling (BE): `GET /students/eligible?type=…` — server-side eligibility (active course/voucher) + booking context | SPEC-017 | ✅ **DONE** (Sober-reviewed 2026-08-01 — delegates to `voucherUsable`, route order proven not-shadowed, both flags answered; tsc 0 / 193 tests) — ⏳ deploy smoke on `sid` | Jason | — |
```
