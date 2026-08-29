# TASK-141: Add `nickname` to the Booking DTO (BE)
- Source: SPEC-046 (REQ-052)
- Status: DONE — no BE change needed, verified (SA-reviewed Sober 2026-08-17); the FE nickname wiring folds into TASK-142
- Assignee: @Jason (BE)
- Depends on: none

## What to do (smart-scheduler-back)
The calendar cell (REQ-052) shows the student's **nickname**, but the Booking DTO carries only
`studentName` (full). Add `nickname` to the booking response.
1. Booking mapper (`src/db/mappers.ts`) — include `nickname` from the joined `students.nickname` on the
   booking DTO (the booking already joins the student for `studentName`; add the field). No schema change
   (`students.nickname` exists).
2. Contract type (`src/types/contract.ts`) — add `nickname` to the booking DTO shape.
3. Confirm every booking-returning path (list, create, plan) carries it, or default it safely.

## Definition of Done
- [ ] Booking DTO includes `nickname` (falls back to name/empty if a student somehow has none).
- [ ] No schema/migration change; existing booking consumers unaffected.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green.

## Implementation Notes / Questions
(Jason fills in. Coordinate the FE `Booking` type add with TASK-142.)

## Implementation Notes / Questions
🟢 **No BE change needed — the field is already there. I verified rather than added it.**

- `src/db/mappers.ts` → `studentRef()` already emits **`nickname: s.nickname ?? null`**, and `toBookingDTO`
  embeds `student: studentRef(b.student)`. `src/types/contract.ts` `StudentRef` already declares
  `nickname: string | null`, so `BookingDTO.student.nickname` is part of the published contract.
- **Every booking-returning path carries it** (DoD item 3): `loadBookingDTO` uses `withBookingRelations`
  (which includes `student: true`), and **`getCalendar` maps every cell through the full `toBookingDTO`** —
  so the day *and* week grids already receive the nickname. Checked the other booking loaders too
  (`checkin.service`, `calendar.service`, `attention.service`) — all join `student`.
- **The gap is FE-side, one line:** `smart-scheduler-front/src/lib/api/mappers.ts:13` flattens the DTO into
  `studentName: dto.student.name` and simply **doesn't carry `nickname` through**;
  `CalendarGrid.tsx:119` then renders `booking.studentName`. So the week-view nickname is a **TASK-142**
  change (`nickname: dto.student.nickname` in that mapper + render `nickname || studentName`), not a BE one.
- `students.nickname` is **nullable** in the schema, hence `?? null`.

**On the DoD's "falls back to name/empty":** I did **not** change `nickname` to fall back to `name`. That field
is shared by every student-bearing DTO (courses, vouchers, bookings), and making it silently mirror `name` would
destroy the "has no nickname" signal for existing consumers. The fallback belongs at the render site
(`nickname || name`), which is what the FE already does elsewhere (`attention.ts` uses exactly that shape).

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **493 pass / 0 fail** — unchanged, because no code changed
for this task.

## Questions
- Q1: agreed that this is FE-only, and that the `nickname || name` fallback belongs in TASK-142's render rather
  than in the shared `StudentRef`? If you'd rather the BE emit a non-null `nickname`, say so and I'll do it as a
  contract change with the consumers checked — but I wouldn't fold it in silently.

  > answer (Sober): **agreed on both — good verify-instead-of-add.** The BE already carries `student.nickname` (`mappers.ts:54`
  > `?? null`), so there's no BE task here; keeping `StudentRef.nickname` **nullable** preserves the "has no nickname"
  > signal for every consumer, and the `nickname || name` fallback belongs at the **render** site. **The whole nickname
  > change is now one FE line inside TASK-142** — carry `nickname` through `api/mappers.ts:13` (`nickname: dto.student.nickname`)
  > and render `nickname || studentName` in the cells. I've folded that into SPEC-046 / TASK-142. **TASK-141 = DONE (no BE
  > change).** Nice catch — saved a needless contract change.

## Review
**PASS ✅ — no BE change, verified (Sober 2026-08-17).** Confirmed `mappers.ts:54` already emits `nickname: s.nickname ?? null`
and `getCalendar` maps every cell through `toBookingDTO`, so both grids already receive `student.nickname`. The gap is the
FE flatten dropping it (`smart-scheduler-front/src/lib/api/mappers.ts:13`) → moved into TASK-142. `bun test` 493/0 (unchanged).
Correctly refused to make the shared `nickname` mirror `name` (would destroy the null signal). DONE.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-141 | scheduler-back (BE): add `nickname` to the Booking DTO (mapper joins `students.nickname`; no schema change) | SPEC-046 (REQ-052) | ✅ **DONE — no BE change, verified (SA-reviewed Sober 2026-08-17)** · the FE nickname wiring folds into TASK-142 (`api/mappers.ts:13` + render `nickname||studentName`); kept `StudentRef.nickname` nullable (preserves the no-nickname signal). · _prior:_ 🟢 REVIEW — no BE change needed (Jason 2026-08-17 — verified, not added: `studentRef()` already emits `nickname`, `BookingDTO.student.nickname` is already in `contract.ts`, and **`getCalendar` maps every cell through the full `toBookingDTO`**, so both grids already receive it. The gap is **FE-only**: `front/src/lib/api/mappers.ts:13` flattens `studentName: dto.student.name` and drops nickname → a TASK-142 line. Did NOT make `nickname` fall back to `name` — that field is shared by every student-bearing DTO and the fallback belongs at the render site. Q1 for @Sober.) | Jason | — |
```
