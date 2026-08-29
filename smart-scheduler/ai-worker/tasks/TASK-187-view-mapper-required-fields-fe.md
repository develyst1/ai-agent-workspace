# TASK-187: Sweep view mappers to required-by-default fields (kill the 4th-time omission class) (FE)

- Source: TASK-183 Q1 (Fern). 🟢 **LOW / opportunistic** — process hardening, not a live defect. Do before/with the
  next view-mapper change, not as an interrupt.
- Status: **REVIEW** (Fern 2026-08-25 — required-by-default on the Booking/PlanSession view fields; guard demonstrated failing; dead `isCourseEnded` deleted)
- Repo: **smart-scheduler-front**.

## Why
Four times in this feature set a **response mapper silently dropped a field the BE already sent**, compiler-silent
until someone made the field required: `createBooking` body (TASK-170), `dtoToBooking` (TASK-170 Part 2), `toSessionRow`
(TASK-184, BE-side), and `dtoToCourseView` (TASK-183). TASK-172 guards *request* bodies; nothing guards *response*
mappers. The fix that can't rot: make the DTO-derived **view** types' fields **required**, so an allow-list mapper that
forgets one is a compile error.

## Scope
- Audit the course/booking/plan view types (`CoursePackageView`, `PlanSession`/plan rows, booking view, etc.) and make
  fields that come from a DTO **required** (not `?:`) where a `null` is meaningful — mirror how TASK-183/184 did it.
- Where a field is genuinely sometimes-absent, keep it optional but say why in a comment, so "optional" is a decision,
  not the default that hid four bugs.
- No behaviour change intended — this is types + any mapper lines the newly-required fields force you to add.

## DoD
- [ ] The known DTO-derived view types require their DTO fields; a mapper omitting one fails `tsc`.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun run build` ok. No runtime behaviour change.

## Notes
(Fern fills in. This is the symmetric guard to TASK-172. Keep it a types sweep — don't fold feature work into it.)

## Add-on (Sober 2026-08-25): one dead helper to remove while you're here
TASK-189 replaced the FE's lifecycle re-compute with the server `course.status`, leaving `isCourseEnded`
(`src/types/app/scheduler/index.ts:280`) with **zero callers**. Delete it in this sweep (verify no import first) —
"removed, not left to rot", same principle as deleting `course-status.ts`.

---

## Implementation Notes (Fern 2026-08-25)
**Types + the mapper lines they forced. No behaviour change — verified by build + suite, not asserted.**

### Made required (the mapper always sets them, so an omission is now a compile error)
- `Booking`: **`nickname`**, **`badges`**, **`discount`** — the three that `dtoToBooking` coalesces.
- `PlanSession`: **`attendeeNote`**, mirroring the BE's own `PlanSessionRow` (Jason made it required there in
  TASK-184 for the same reason).

### Left optional — but now as a stated decision, not a default
- `Booking.courseId` — a trial / single / voucher booking genuinely has no course; `undefined` is a **fact about the
  booking**, not a mapper that forgot.
- `Booking.note` — the mapper coalesces `null → undefined` and every reader treats "no note" identically; there is
  nothing for a required field to protect.

That distinction is the actual deliverable: "optional" used to be the default that hid four bugs; each remaining one
now carries its reason in a comment.

### 🟢 I proved the guard bites rather than assuming it
Deleted `discount: dto.discount ?? null` from `dtoToBooking` — the exact TASK-170-Part-2 mistake — and re-ran:
```
src/lib/api/mappers.ts(11,3): error TS2741: Property 'discount' is missing … but required in type 'Booking'
```
Restored; `tsc` back to 0. **The class of bug that cost this feature set four incidents is now a compile error.**

### Fallout, handled without churn
Making the fields required surfaced every fixture that built a `Booking`/`PlanSession` by hand — which is the guard
working. Rather than editing ~20 literals, the mock bookings now go through a small **`mockBooking()` factory** that
fills the DTO-derived defaults once, so the *next* required field is one edit, not twenty, and the fixtures can't
drift from the type.

### Also deleted
**`isCourseEnded`** — TASK-189 removed its last caller (lifecycle is the server's `status` now). A second way to ask
"is this over?" is exactly the duplication that made a cancelled course show a green badge, so it's deleted rather
than left for someone to find and reuse. Its absence is commented at the site.

**Evidence:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun run build` **ok** ·
`bun test src/lib/scheduler/ src/services/` **40/0** · guard demonstrated failing and restored.

## Questions
- **Q1 (scope, deliberate):** I did **not** touch `CoursePackageView.subject` or the voucher/teacher view types. They
  have the same shape, but each carries real churn (`subject` is threaded through the offline `CoursePackage` path
  too) and this task is explicitly low/opportunistic — I'd rather sweep them **with** the next change to those
  mappers, as the task itself suggests, than do a wide type edit with no behaviour to verify it against.
