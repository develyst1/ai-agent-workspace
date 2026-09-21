# TASK-409 — The booking modal offers `Confirm + LINE` for an EXTENDED session, exactly as for PENDING (`REQ-094` reopen — the owner's ruling: a make-up is confirmed first, like a new booking; the job stays CONFIRMED-only)

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-19) · **Size XS.** `sid`, then `uat` — a live customer complaint ("purple not cut at 17:30"): the purple could never be confirmed on the single modal, so the CONFIRMED-only day-end never saw it.

## §0 The facts (verified in the BE by me)
- The BE single confirm (`PATCH /bookings/:id/status { action: "confirm" }`) checks ONLY `confirmedAt` — an EXTENDED row confirms exactly like a PENDING one (⇒ CONFIRMED, `confirmedAt`, the teacher told). Bulk-confirm accepts EXTENDED since TASK-389. **No BE change.**
- `BookingModal.tsx:717`: `{booking.status === "PENDING" && canStatus && (… Confirm + LINE …)}` — PENDING only. That is the whole bug.

## §1 Do
- The confirm door shows for `PENDING` **and** `EXTENDED` — through ONE list (a `CONFIRMABLE_STATUSES = ["PENDING", "EXTENDED"]` beside `MOVABLE_STATUSES`, not a second `===`), same body, same success notice; pinned by value both ways (an EXTENDED row renders the door; a CONFIRMED one does not).
- 🚫 Nothing else: the `Attended` door, the purple hue, the bulk-confirm page, the day-end are untouched.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · the door by value for both statuses · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-19. **`Confirm + LINE` for EXTENDED as for PENDING — one list, one predicate, the one door.**

```
bunx tsc --noEmit → exit 0
bun test          →  480 pass / 0 fail   (was 478; +2 — new lib/scheduler/confirm-door.test.ts)
bun run build     → ok
git status        →  the fix: BookingModal.tsx (+ two pins moved) · the follow-up: auth.ts · auth.config.ts · next-auth.d.ts · useMe.ts · contract.ts (login type)
```
🚫 No deploy asked.

- **The fix (§1):** `CONFIRMABLE_STATUSES: Booking["status"][] = ["PENDING", "EXTENDED"]` beside `MOVABLE_STATUSES`, and a
  pure `canOfferConfirm(status) = CONFIRMABLE_STATUSES.includes(status)`; the door at `:717` reads
  `{canOfferConfirm(booking.status) && canStatus && (` — same `handleConfirm`, same `booking.confirmBtn`, same success
  notice. **By value both ways:** EXTENDED and PENDING ⇒ the door; CONFIRMED · ATTENDED · SICK_LEAVE · CANCELLED ·
  PAUSED · NO_SHOW · PENDING_RESCHEDULE ⇒ none. By source: no `=== "PENDING"` / `=== "EXTENDED"` literal on the door
  (one list, not a second); the Attended door (`canAttend`) untouched; the purple hue, bulk-confirm, the day-end not
  touched (no file of theirs changed).
- **Also in this touch — the TASK-407 §2.2 flash, as @Sober asked (TASK-408 follow-up, not a task):** the login body's
  `teacherId` now rides `auth.ts` (`typeof === "string" ? … : null`) → the JWT (`auth.config.ts`) → the session → the
  `/me` SEED in `useMe` (`teacherId: su.teacherId ?? null`); `next-auth.d.ts` + the login type carry the field. A linked
  account's doors are therefore scoped from the FIRST paint; `/me` still refetches at once and stays the truth. Pinned
  in `teacher-scope.test.ts` (mutations 5, 6).

### 🔑 Break-and-watch — six, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | the list loses EXTENDED (the bug back) | **1 fail** |
| 2 | the list gains CONFIRMED | **1 fail** |
| 3 | the door goes back to a `=== "PENDING"` literal | **3 fail** |
| 4 | the predicate ignores the list | **1 fail** |
| 5 | the seed forgets the link (the flash back) | **1 fail** |
| 6 | `auth.ts` drops the login body's link | **1 fail** |
None slipped; `md5` identical on the three mutated files. Pins moved: the door's line in `action-gate.test.ts` and
`teacher-scope.test.ts` (`=== "PENDING"` → `canOfferConfirm`).

### Definition of Done
- [x] **480 / 0** · `tsc` 0 · build ok
- [x] The door by value for both statuses (and none for the rest)
- [x] 🔑 Break-and-watch — six, `finally`, checksum

### ⚠️ Not seen on a screen
For @Tanya on `sid`: open a purple (EXTENDED) make-up ⇒ `Confirm + LINE` beside `Attended`, as on a PENDING one; press
it ⇒ the confirm dialog names the teacher(s) ⇒ CONFIRMED, the teacher's LINE; the next 17:30 run cuts it. A CONFIRMED
row still shows no confirm button. Log in as a linked teacher ⇒ from the very first paint no create/confirm doors.
