# TASK-058: scheduling (BE) — a suspended household cannot BUY; `/students` excludes them by default
- Source: SPEC-016 addendum (REQ-019) — คุณฟีน 2026-08-01: *"ไม่ควรซื้อได้"*
- Status: DONE  (reviewed 2026-08-01 by Sober — one neutral `blockedBySuspension`, both sale gates verified in-tx and before the revenue post, one suspension message, `bookable` retired; tsc 0 / 234 tests. Deploy order FREE)
- Depends on: TASK-056 (DONE)
- Assignee: @Jason (smart-scheduler-back, port 4006)

## What to do

### 1. Block the purchase server-side (the guarantee)
- **`createVoucher`** has **no suspend gate at all** today — add one.
- **`createCoursePackage`** currently fails only *incidentally*: it creates sessions, and `insertBooking`'s
  booking gate rejects them. The transaction rolls back so the outcome is right, but **incidental enforcement
  isn't enforcement** — it breaks the moment someone reorders that code or adds a course type that books no
  sessions. Make it explicit at the top of the function.
- **Gate after `resolveStudentId`**, not before: that call can find-or-create the student/parent, so the
  household is only known afterwards.
- **Reuse `lib/suspend.ts`.** `bookingBlockedBySuspension` is named for bookings; either rename the concept or
  add a sibling that shares `isSuspended` — **do not write a second "is suspended" test**. Your call which
  reads better; say which you chose.
- ⚠️ **A student with no parent (walk-in / First-Trial) is never blocked** — no household, nothing to suspend.
  Same carve-out as the booking gate.
- The error must say why, in the same voice as the booking one
  (`"บัญชีผู้ปกครองถูกระงับ — ติดต่อเจ้าหน้าที่เพื่อเปิดใช้งานก่อน…"`), not a generic 400.
- **Block before the revenue post.** `createVoucher` fires `recordSale(...)` after the insert — a blocked sale
  must never reach it.

### 2. Retire the `bookable` flag — exclusion becomes the default on `GET /students`
With the sell-side answered, **all three** consumers (booking picker + both sale modals) want the same thing,
so an opt-in flag now just means "remember to ask for the policy", and whoever forgets opens a silent hole.
- `searchStudents` excludes suspended households **always**; drop the `opts.bookable` parameter and the
  `bookable` field from `studentsQuery`.
- **Do not add an `includeSuspended` escape hatch.** Nothing needs one — the People screen reads `/parents`,
  where suspended families must stay fully visible. I'm not building a lever on speculation.
- `/students/eligible` already filters unconditionally — unchanged.
- Keep the exclusion-set approach exactly as you built it: `suspendedStudentIds()` + `notInArray`, **including
  the empty-array guard** and the `innerJoin` that keeps parentless students visible by construction.

**No migration.** No change to `POST /bookings`, the suspend gate, the freelance cap, or the People screen.

## Definition of Done
- [ ] `POST /vouchers` and `POST /courses` for a **suspended** household → **400** with the suspension message,
      and **no voucher/course/booking row and no revenue post** is created (transaction clean).
- [ ] The same calls for an active household, and for a **walk-in student with no parent**, work exactly as
      today.
- [ ] `GET /students?q=` excludes suspended households **with no flag**; the `bookable` param is gone (an
      old client still sending it is simply ignored — confirm that, it matters for deploy order).
- [ ] Only one definition of "suspended" in the codebase — say where it lives.
- [ ] `bunx tsc --noEmit` clean; `bun test` green — a test per branch (suspended → blocked, active → allowed,
      parentless → allowed) for **both** sale paths, plus the picker default.

## Implementation Notes

**Naming (your call to make, so here's mine): I renamed the predicate rather than adding a sibling.**
`bookingBlockedBySuspension` → **`blockedBySuspension`** in `lib/suspend.ts`. The rule is identical for booking
and buying, so a booking-flavoured and a purchase-flavoured sibling would be two things to keep correct with no
difference between them. One neutral name, one definition — **`lib/suspend.ts` is the only place "suspended"
is defined**, and its doc now names both gates. The old name has no remaining references (tsc would have failed;
I also updated its existing test).

**1. Purchases blocked server-side.** New `assertHouseholdNotSuspended(exec, studentId)` in
`scheduler.service.ts` — resolves the household via the existing `findParentOfStudent` and throws through
`blockedBySuspension`. Called **inside the transaction, immediately after `resolveStudentId`** (which can
find-or-create the parent, so the household is only knowable afterwards) in **both**:
- **`createVoucher`** — had *no* gate at all. The check sits **before the insert**, so a blocked sale never
  reaches the `recordSale(...)` revenue post that fires after the transaction.
- **`createCoursePackage`** — now **explicit at the top** rather than relying on `insertBooking` rejecting the
  generated sessions. Your point stands: incidental enforcement stops being enforcement the moment someone
  reorders it or adds a course type that books no sessions.

**On your second Question (two messages for one action):** it would have happened — `createCoursePackage` would
hit my new gate first, but the booking gate's wording differed. I made them **one string**, `SUSPENDED_MESSAGE`
("บัญชีผู้ปกครองถูกระงับ — ติดต่อเจ้าหน้าที่เพื่อเปิดใช้งานก่อน"), with the booking gate appending "จอง". So a
household never sees two wordings for one policy, and there's one string to change if the copy is revised.

**Walk-in carve-out preserved:** a student with no parent is never blocked, on either path — same
`blockedBySuspension(null) === false`, unit-tested.

**2. `bookable` retired — exclusion is the default.** `searchStudents(q, limit)` now **always** excludes
suspended households (the `opts.bookable` parameter is gone), and `bookable` is removed from `studentsQuery`.
Kept exactly as built: `suspendedStudentIds()` + `notInArray` **with the empty-array guard**, and the
`innerJoin` that keeps parentless students visible by construction. **No `includeSuspended` escape hatch** —
nothing needs one, and the People screen reads `/parents` where suspended families stay fully visible.
`/students/eligible` unchanged (already unconditional).

### ✅ Deploy order: FREE (this one, unlike TASK-055)
I verified the ignored-param behaviour rather than assuming it: Zod objects strip unknown keys, so an old FE
still sending `bookable=true` is **accepted and the param silently dropped** — checked directly, `{q:"a",
bookable:"true"}` parses to `{q:"a", limit:50}`. It was asking for the behaviour that is now the default, so
**BE-first, FE-first and simultaneous are all safe.** (Worth contrasting with TASK-055, which *does* need FE
first.)

**Third purchase path (your Question):** I looked — `createCoursePackage` and `createVoucher` are the only two.
Top-ups/extensions (`topUpFreelanceBudget`, the sick-leave auto-extension) are **not** purchases and I left them
alone, as instructed. Nothing new to flag.

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → **clean (exit 0)** — which also proves the rename left no stale references;
  `bun test` → **234 pass / 0 fail** (39 files).
- `lib/suspend.test.ts` now states the shared rule explicitly: suspended → refused a **booking** *and* refused a
  **purchase**; active → both allowed; **parentless → never blocked on either**.
- `services/suspended-pickers.test.ts` updated for the new default: `/students` excludes suspended **with no
  flag**, the walk-in survives the default exclusion, and the **nobody-suspended** case exercises the
  empty-array guard and returns everyone.
- ⚠️ The DB-backed behaviour is **deploy smoke** (brownfield). **Smoke:** suspend a household → selling them a
  **course** and a **voucher** both fail with the suspension message, **no row and no revenue post** is created
  (check `bo` movements), while an active household and a **walk-in student with no parent** both still buy
  normally → un-suspend → selling works again. Also confirm their students no longer appear in the sale modals'
  student dropdown.

**DoD:** `POST /vouchers` + `POST /courses` for a suspended household → 400 with the suspension message, no rows,
no revenue post (gate is inside the tx, before the insert and before `recordSale`) ✓ · active + parentless
unchanged ✓ · `/students` excludes with no flag, `bookable` gone and **ignored if still sent** ✓ (verified) ·
one definition of "suspended", in `lib/suspend.ts` ✓ · tsc clean + `bun test` green with a branch per path ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- **Top-ups / extensions of an existing entitlement are NOT "buying" here** — leave them alone. If you find a
  third purchase path I haven't named, flag it rather than deciding.
- If blocking inside `createCoursePackage` turns out to duplicate the booking gate in a way that makes the
  error worse (e.g. two different messages for one action), tell me — one clear message beats two correct ones.

## Review
**Verdict: DONE ✅ (Sober, 2026-08-01).** `bunx tsc --noEmit` → **0**; `bun test` → **234/0** (my own run).

- **The naming call was his to make and he made the better one.** I offered "rename or add a sibling"; he
  renamed `bookingBlockedBySuspension` → **`blockedBySuspension`** with the reasoning that a booking-flavoured
  and a purchase-flavoured predicate would be two things to keep correct **with no difference between them**.
  `lib/suspend.ts` is now the single place "suspended" is defined, and its doc names both gates. tsc passing is
  itself the proof the rename left nothing stale.
- **Both gates verified in place, not just claimed:** `assertHouseholdNotSuspended` is called **inside the
  transaction, immediately after `resolveStudentId`** in `createCoursePackage` (`:633`) and `createVoucher`
  (`:715`) — and in the voucher path it sits **before the insert**, so a blocked sale can never reach the
  `recordSale(...)` revenue post that fires after the transaction. That was the specific hole (`createVoucher`
  had no gate at all) and it's closed at the right point.
- **He answered my "two messages for one action" question by preventing it rather than reporting it.** One
  `SUSPENDED_MESSAGE` constant, with the booking gate appending "จอง". So one policy has one wording, and there
  is one string to change if the copy is revised. **And the booking message is byte-identical to before**, so
  REQ-019's just-passed acceptance doesn't regress.
- **Walk-in carve-out preserved** on both paths via the same predicate, unit-tested.
- **`bookable` retired cleanly:** `searchStudents(q, limit)` always excludes, the param is gone from the service
  and `studentsQuery`, and the exclusion-set machinery (empty-array guard, `innerJoin` keeping parentless
  students visible by construction) is kept exactly as built.
- **He verified the ignored-param claim instead of repeating mine** — parsed `{q:"a", bookable:"true"}` and
  showed it yields `{q:"a", limit:50}`. **Deploy order is free here** (BE-first, FE-first, simultaneous all
  safe), in contrast to TASK-055 which genuinely needs FE first. Checking rather than inheriting my assertion is
  the right instinct — I'd have accepted "Zod strips unknown keys" as obvious, and obvious is where things hide.
- **Third-purchase-path question answered with a search, not a guess:** only the two paths; top-ups and the
  sick-leave auto-extension are not purchases and were left alone, as instructed.

**TASK-058 → DONE. @Fern: TASK-059 unblocked** — the sale endpoints now return the suspension `400`, so the two
sale modals need the `ApiClientError` → visible message treatment (the picker default change is already done
server-side, so the FE only removes plumbing).
