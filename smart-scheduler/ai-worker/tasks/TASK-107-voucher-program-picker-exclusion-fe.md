# TASK-107: scheduler-front (FE) — voucher program picker omits the excluded programs
- Source: SPEC-030 §4 (REQ-027 part b, UI half)
- Status: DONE ✅ (SA-reviewed 2026-08-04 — tsc 0 reproduced; BE `voucherAllowedGroups()` enforced at `service:763`, FE filters picker+preselect+payload off the same `voucherSubjectOptions`, "no over-hide" leaves unclassifiable programs to the server backstop. **Minor (non-blocking):** add a 3-case unit test for `voucherAllowsSubject` opportunistically.) Was FAST-FOLLOW; pulled forward as it closes REQ-027 (b) and is small.
- Depends on: TASK-106 (the exposed allowed/excluded set + the server rule)
- Assignee: @Fern (smart-scheduler-front)

## What to build
In the voucher booking flow's program picker (REQ-029/TASK-089), **omit or disable Onewheel and Balance Play** so
an excluded program isn't selectable for a voucher — driven by the **exposed** allowed set from TASK-106, **not** a
hardcoded list (the card will change before the code does).

- Course bookings are unaffected (all programs still selectable at their offered sizes).
- If a `VOUCHER_PROGRAM_EXCLUDED` refusal is ever hit (e.g. a stale client), show the server's reason — never a
  silent dead button.

## Definition of Done
- [x] The voucher program picker does not offer Onewheel or Balance Play; it does for a course.
- [x] The excluded set comes from the API (TASK-106), not a literal in the FE.
- [x] A server `VOUCHER_PROGRAM_EXCLUDED` message is surfaced if hit.
- [x] tsc clean; build ok.

## Implementation Notes (@Fern)
**Where the picker actually is:** a voucher is issued as program-agnostic *hours* (`CreateVoucherModal` has no program
field) — the program is chosen at **booking time**, in the calendar `BookingModal` voucher tab
(`voucherSubjectId`, from the clicked teacher's `slotSubjectOptions`). So that's the picker this task filters, not the
issue flow. Course bookings use a different subject path and are untouched.

- **Contract wired** (`types/app/pricing`): added `voucherAllowedGroups: string[]` to `SellablePackagesResponse` —
  the exact field TASK-106 added to `GET /sellable-packages` (verified in `scheduler.service.ts:885`,
  `voucherAllowedGroups()` = the allowed **price groups**; on the real card that's just `["bike-skate"]`). Mock updated
  to match (`["bike-skate"]`).
- **Pure rule** (`lib/scheduler/sellable.ts`) `voucherAllowsSubject(data, subjectId)`: a subject is excluded **only
  when it maps to a known excluded price group** (has packages, none in `voucherAllowedGroups`). A subject with no
  package (pricing unknown) or before the card loads stays selectable — **the server is still the backstop**, so the FE
  never over-hides a program it can't classify. Driven entirely by the exposed set; **no hardcoded Onewheel/Balance
  literal in the FE.**
- **Picker** (`BookingModal.tsx`): `voucherSubjectOptions = slotSubjectOptions.filter(s => voucherAllowsSubject(...))`
  now feeds the voucher `<Select>` data, the single-option preselect effect, and the `voucherSubject` lookup (so an
  excluded id can't reach the payload). Course bookings unaffected.
- **Two empty states**: teacher has *no* programs → existing `voucherNoProgram`; teacher has programs but *none*
  voucher-allowed → new `voucherNoAllowedProgram` ("…use a course booking instead"), EN+TH.
- **Stale-client safety net (DoD #3):** the voucher submit already routes any `ApiClientError.message` into
  `submitError` (`:732` → rendered `:951`), so a server `VOUCHER_PROGRAM_EXCLUDED` shows its Thai reason — no change
  needed, no dead button.
- Verified: `bunx tsc --noEmit` → 0; `bun run build` → ok.

## Questions / flags
- None blocking. Note the picker location (booking-time, not issue-time) above — if the owner expected an exclusion on
  a *voucher-issue* program field, there isn't one to filter (issue is hours-only); the exclusion correctly lives where
  a program is actually chosen. Live render (auth-gated) → QA alongside the other FE items.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-107 | scheduler-front (FE): voucher program picker omits Onewheel + Balance Play (from the exposed set, not hardcoded); surface the server refusal | SPEC-030 | ✅ **DONE** (SA-reviewed 2026-08-04 — tsc 0 reproduced; BE `voucherAllowedGroups()` enforced at `service:763`, FE filters picker+preselect+payload off one `voucherSubjectOptions`, no over-hide. Minor non-blocking: add a 3-case `voucherAllowsSubject` unit test. **REQ-027(b) closed.**) · (Fern 2026-08-04 — tsc 0 · build ok. The picker is the **calendar `BookingModal` voucher tab** (`voucherSubjectId`) — a voucher is issued as program-agnostic hours, program chosen at booking time. Added `voucherAllowedGroups:string[]` to `SellablePackagesResponse` (matches BE `service:885`, real card = `["bike-skate"]`) + mock; pure `voucherAllowsSubject(data,subjectId)` in `lib/scheduler/sellable.ts` excludes a subject **only** when it maps to a known excluded price group (no package / not-yet-loaded → selectable, server is backstop — no over-hide, no hardcoded list). Filters the voucher `<Select>` + preselect + payload lookup; course bookings untouched. New empty state `voucherNoAllowedProgram` (EN+TH) when a teacher has programs but none voucher-allowed. Server `VOUCHER_PROGRAM_EXCLUDED` already surfaced via `submitError` (`:732→:951`). Live render → QA) | Fern | TASK-106 ✅ |
```
