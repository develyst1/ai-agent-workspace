# TASK-110: scheduling (BE) — booking-type filter on the SOM dashboard snapshot
- Source: SPEC-032 (REQ-034)
- Status: TODO (MEDIUM — POST-GO-LIVE unless owner pulls it in; owner confirmation on SPEC-032 §5 first)
- Depends on: —
- Assignee: @Jason (smart-scheduler-back)

## What to build
Extend `getSomReport` (`som-report.service.ts`) with a booking-type filter — the **same** computation restricted to
a type, so "All" is unchanged (read-only, no migration).
- **`GET /api/reports/som?bookingType=ALL|FIRST_TRIAL|VOUCHER|COURSE_PACKAGE`**, default `ALL`.
- **Sport share:** build `bookingsByStudent` from **only the bookings of that type** (everything downstream —
  `primarySport`, `breakdown` — unchanged). Unit stays **distinct students** (SPEC-032 §1).
- **Demographics:** restrict the student set to students who have ≥1 booking of the type.
- **Per-section `applicable` flags:** `newVsRenewing` sub-metrics (newByFirstTrial = trial-only; renewing =
  course/voucher-only) and `today` (not type-split) carry an `applicable`/`filtered` flag so the FE can say
  "not applicable to this filter" (SPEC-032 §3). Existing-customers is already type-split — leave as-is.
- **Voucher caveat flag:** when `bookingType=VOUCHER`, set a flag the FE renders as the historical-data caveat
  (subjectId was array-position before REQ-029) — SPEC-032 §4.

## Definition of Done
- [ ] `?bookingType=ALL` (and no param) returns **byte-for-byte** today's payload (AC #4 — no regression; test it).
- [ ] A type filter restricts sport-share + demographics to in-type students; "All" = every student.
- [ ] Sections that can't be type-split carry the `applicable=false` flag; voucher caveat flag set under VOUCHER.
- [ ] `bunx tsc --noEmit` clean; `bun test` green.
