# TASK-737 — REQ-119: `GET /reports/daily` serves Palm's contract (back only) — BE, M (≈ 1.5–2 d)
- Source: `requirements/REQ-119-daily-report-backend-serves-palms-contract.md` · Palm's `docs/backend-daily-report.md` §2–§6, §8 (front repo, READ ONLY) · his counting `src/lib/scheduler/daily-report.ts` L11–34 · Silver's §9 check (inbox/PM.md, 2026-10-12)
- Status: ✅ DONE (Silver, 2026-10-13) · uncommitted: 2 new files + tests + set · api.ts · validation.ts · contract.ts · openapi · 1 granted pin in coach-rate-walk-req105.test.ts · 🔒 the Total-booked switch stays at Palm's default (owner ruling pending)
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-12)
- **Claim (asked of Porter, one list):** NEW `src/lib/daily-report.ts` (pure counters) + NEW `src/services/daily-report.service.ts` (the read) + their tests · `src/routes/api.ts` :312-314 (the route body only) · `src/validation.ts` :80 (`reportQuery` gains optional `teacherId`) · `src/types/contract.ts` :290-299 (`DailyReportResponse`) · `openapi/document.ts` :390-397 (the param). 🚫 The OLD `getDailyReport` in `scheduler.service.ts` :967-989 stays byte-identical (two tests use its text as a region marker; the SOM report + the day-end job read it). 🔴 SAFE test command only (TASK-723 has it). 🔴 run → list → ask → THEN edit. 🚫 No front file.

## Build
1. **Rows:** every booking of `date` (a plain `date` column, no tz conversion), `pendingSlot = false`, **`groupId IS NULL`** (GROUP seats are COURSE_PACKAGE rows under the group: they never count anywhere), with the extra coaches (`booking_teachers`). PAUSED rows ARE read (they keep their date).
2. **Counters = Palm's temporary choices, verbatim** (one exported constant each, mirroring his L11–34):
   - lessons = FIRST_TRIAL / SINGLE_SESSION / COURSE_PACKAGE / VOUCHER; booked = not CANCELLED, not PAUSED;
   - attended = ATTENDED · confirmed = CONFIRMED + ATTENDED + NO_SHOW · pending = PENDING + EXTENDED · onLeave = SICK_LEAVE · cancelled = CANCELLED lessons;
   - awaiting = PAUSED FIRST_TRIAL / SINGLE_SESSION of that date;
   - attendanceRate = round(attended / totalBooked × 100), 0 when totalBooked = 0;
   - byBookingTypeAttended / byBookingTypeConfirmed: all 4 types, fixed order, zeros kept.
3. **🔒 totalBooked:** ONE switch, `TOTAL_BOOKED_INCLUDES_PENDING`, default **true** (Palm: every booked lesson). `false` = the Excel (confirmed + onLeave). Both paths tested. Do NOT flip it; the owner's ruling flips it.
4. **teacherId** filters EVERY counter: a row belongs to a teacher if it is the primary `teacherId` OR in `booking_teachers`.
5. **byTeacher:** every non-cancelled, non-paused row (lesson + OTHER incl. camp hour rows + GROUP) adds 1 to `total` of **its primary AND each extra coach**; a GROUP row once per coach; `count`/`attended` from lessons only. Teachers with group work only appear (0/0/N). Order: total desc, count desc, then teacherId asc (declare: the stable tie-break).
6. **Response:** Palm §5 field names verbatim, integers only. Keep the legacy `noShow` and `byBookingType` (harmless; Palm allows it). ALL new fields in this one change (the front switches on `awaiting`).

## Definition of Done
- [ ] By-value tests = **Palm §8** (attended 2 · confirmed 4 · pending 1 · awaiting 1 · onLeave 1 · cancelled 1 · byTeacher[A] count 4 / attended 2) + both totalBooked paths + `?teacherId=B` + yesterday's PAUSED not counted + ECA with A+B ⇒ both totals +1 + a GROUP with 4 seats ⇒ 1 + seats never counted + a SICK_LEAVE sharing a slot with its replacement ⇒ both counted + the §2 relations (attended ≤ confirmed; leave ∉ confirmed; cancelled ∉ totalBooked; Σ byType = attended / confirmed).
- [ ] Mutation set: seats counted · extra coach ignored · teacherId ignored on one counter · NO_SHOW out of confirmed · EXTENDED out of pending · PAUSED in totalBooked · a type missing from byType · the switch flipped.
- [ ] The old `getDailyReport` unchanged (diff = 0 lines). tsc · full suite (SAFE) with counts. Nothing committed. Journal unchanged (no migration).

- **✅ Porter (2026-10-12):** claim GRANTED as listed; anything outside it ⇒ stop and tell me. **Q-A: the old `getDailyReport` stays BYTE-IDENTICAL** (the SOM report + day-end job keep today's numbers). Team A has nothing open.

## Implementation Notes
**Bob, 2026-10-13 — BUILT inside the claim. Nothing committed. Journal unchanged (no migration).**
- NEW `lib/daily-report.ts` — the pure counters (`countDaily(rows, { teacherId?, includePending? })`): Palm's temporary choices as ONE exported constant each, mirroring his `daily-report.ts` L11–34 (`CONFIRMED_STATUSES` incl. NO_SHOW · `PENDING_STATUSES` incl. EXTENDED · `AWAITING_TYPES` = FIRST_TRIAL/SINGLE_SESSION · `NOT_BOOKED_STATUSES` = CANCELLED + PAUSED); **🔒 `TOTAL_BOOKED_INCLUDES_PENDING = true`** (Palm's default; `false` = the Excel: confirmed + onLeave). NOT flipped; both paths tested.
- NEW `services/daily-report.service.ts` — `getDailyReportContract(date, teacherId?)`: every booking of `date` (a plain `date` column, no tz conversion) with `pending_slot = false` and **`group_id IS NULL`** (a GROUP's seats never count; the group row counts once per coach), PAUSED rows read, the extra coaches from `booking_teachers`.
- Wiring (the claim's lines): `routes/api.ts` the route body now calls the new service with `date` + `teacherId` (**+1 import line at the top of the file**, necessarily outside :312-314 — declared); `validation.ts` `reportQuery` gains `teacherId: z.string().uuid().optional()`; `types/contract.ts` `DailyReportResponse` gains Palm §5's fields; `openapi/document.ts` the `teacherId` param. `route-access.ts` unchanged (same route, same `menu:reports`).
- 🚫 The OLD `getDailyReport` (`scheduler.service.ts`) is untouched: **`git diff` of that file = 0 lines**, and its text is pinned by hash (the SOM report + the day-end job read it).
- **Decide and declare:** (1) with `?teacherId=`, `byTeacher` lists only that coach (the other coaches of a shared row are not his report); (2) `byTeacher` order = total desc, count desc, teacherId asc (the stable tie-break); (3) legacy keys kept: `noShow` (the NO_SHOW lessons) and `byBookingType` (the BOOKED lessons per type — Palm: "retire or keep"); (4) a `PENDING_RESCHEDULE` row (the retired status) is simply in none of the cards but, being neither cancelled nor paused, in Total booked/workload — there should be none in the data; (5) Camp stays Palm's Q3: one row per hour ⇒ each hour row adds 1 to `total`.
- Tests: NEW `lib/daily-report-task737.test.ts` (**25**): **Palm §8 by value** (attended 2 · confirmed 4 · pending 1 · awaiting 1 · onLeave 1 · cancelled 1 · byTeacher[A] count 4 / attended 2 / total 11 · totalBooked 6 default and 5 on the Excel path), `?teacherId=` on every counter (incl. onLeave / cancelled / awaiting), yesterday's PAUSED not counted (through the REAL `where` evaluated by a fake), ECA with A+B ⇒ both +1, a GROUP with 4 seats ⇒ 1 and the seats never counted, a SICK_LEAVE sharing a slot with its replacement ⇒ both, the §2 relations over 40 seeded shapes, the route through the real Hono app, the validator, the old report's hash. Set `daily-report-task737.mutations.json`: **11 BITES · 0 SURVIVED**, checksum identical (the DoD's eight + Awaiting widened + the tie-break + the old report edited).
- **Suite (SAFE): 4698 pass / 2 fail (348 files); tsc 0.** The 2 reds: `TASK-803 — the override list … GENERATED` (Team A's, nothing to do with this change) and the one below (mine).

## Questions
1. 🔴 **`src/lib/coach-rate-walk-req105.test.ts`** (the TASK-463 "THE WALK": every rate-shaped key in `src` is a masked coach rate or is named, with a reason, in `NOT_A_COACH_RATE`): my new field `attendanceRate` (in `lib/daily-report.ts` and `types/contract.ts`; Palm's §5 name, **verbatim by contract**) is "UNCLASSIFIED". It is an attendance percentage, not a coach rate. The fix is ONE entry in that test's `NOT_A_COACH_RATE` map: `attendanceRate: "the daily report's attendance percentage (REQ-119) — attended ÷ total booked, nothing to do with a coach's pay"`. May I add it? (Renaming the field is not an option: the front maps it straight into the card.)
2. ℹ️ Switch-over note for the uat release: the front flips to this payload the moment it sees `awaiting` (Palm §6) — all new fields ship in this ONE change, so nothing is staged.

## Review

**Silver, 2026-10-13 — review 1: ✅ the build passes · ⏳ ONE pin waiting for Porter's grant.**
- **Re-run by me (SAFE):** **4698 / 2** across 348 files. The set `daily-report-task737` is **11/11 BITES**, `CHECKSUM identical`; M11 guards the old `getDailyReport`.
- **Diff:** the claim only (api.ts route + 1 import line · validation.ts :80 · contract.ts · openapi) + the 2 new files + tests. The service reads `group_id IS NULL` + `additionalTeachers`, and the pure `countDaily` filters every counter by primary OR extra coach. `teacherId` is a uuid, the same as `/bookings`.
- **The 2 reds:**
  - (a) Team A's TASK-803 "override list GENERATED": it is on the committed tree, and nothing in this change touches it ⇒ reported to Porter.
  - (b) `coach-rate-walk-req105.test.ts` (TASK-463's shared guard): Palm's `attendanceRate` is a new rate-shaped key ⇒ Bob asks for ONE `NOT_A_COACH_RATE` entry. The field name is Palm's contract and can't be renamed. **That file is a shared guard, not a Team B TASK file ⇒ Porter grants.**
- 📌 The api.ts import line sits outside :312-314; it is needed for the route. Reported to Porter.
- **Bob holds** until the grant; then I re-run and close.

**Silver, 2026-10-13 — ✅ FINAL: DONE.**
- **Re-run by me (SAFE):** **4699 / 1**. The one red is Team A's TASK-803 "override list GENERATED", on the committed tree; Porter passed it to Sober. tsc exit 0. The set **11/11 BITES**, `CHECKSUM identical`.
- The granted pin: exactly ONE `NOT_A_COACH_RATE` entry (`attendanceRate`) in `coach-rate-walk-req105.test.ts`. Nothing else in that file.
- The old `getDailyReport` diff = 0 lines (guarded by M11). No migration; the journal is unchanged.
- 📌 After deploy, the front switches on `awaiting` (Palm §6). The leave-in-a-shared-slot and group-seat differences are expected (Porter's note to Palm).
