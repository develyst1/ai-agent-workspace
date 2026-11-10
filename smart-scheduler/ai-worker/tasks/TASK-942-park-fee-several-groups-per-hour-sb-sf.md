# TASK-942 — BE + FE: **park fee: several groups in the SAME hour** on the "No Teacher" column (smart-scheduler-back + smart-scheduler-front) — @Bob (BE) + @Fanta (FE) — **build starts 14 Nov** (the owner)
**From @Silver, 2026-11-10.** **The owner decided:** several groups may rent the park in one hour (ขวัญ «พร้อมกันหลายกรุ้ปได้นะคะ», CUSTOMER-ANSWERS 2026-11-09; confirmed by the owner via Porter 2026-11-10). This **supersedes DECISIONS row 11's "one park block per hour".** The size and risk are in `SIZE-park-fee-several-groups-per-hour-2026-11-09.md`. Branch `dong`. **No git command** (the SA commits after sid + Tanya). **Size ≈ 1.5–2.5 d (BE ≈ 1–1.5, FE ≈ 0.5–1).**

## Today (read)
- Every park block is an OTHER booking on the one system teacher (TASK-861).
- `bookings_teacher_slot_uq` is unique on (teacher, date, start_time) with the predicate built from `SLOT_INACTIVE_STATUSES` + `group_id IS NULL` + `slot_yielded_at IS NULL` (`src/db/schema.ts:606`; the app mirror is `src/lib/slot-holder.ts:23`). So a 2nd park block in the same hour → 409 `SLOT_TAKEN`.

## BE (Bob, smart-scheduler-back)
1. **Migration `0077`** (additive; hand-authored per `drizzle/README.md`; **check the journal `when` is unique**):
   - `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS slot_exempt boolean NOT NULL DEFAULT false;`
   - `UPDATE bookings SET slot_exempt = true WHERE teacher_id IN (SELECT id FROM teachers WHERE is_system);` (existing park blocks);
   - **rebuild `bookings_teacher_slot_uq` with its current predicate `AND NOT slot_exempt`.** Copy the predicate text exactly from the live definition + `schema.ts`, and add only that clause.
   - **The witness:** the index-predicate probe contains `slot_exempt` (`lib/migration-witness.ts`, the pattern at l.434).
   - **The lock:** the rebuild takes a short lock on `bookings`. Say in the queue line that the owner applies it at a quiet time; on sid, the queue applies it as usual.
2. **The inserter** sets `slot_exempt = true` **only** when the booking's teacher is the system teacher. Reuse TASK-861's `isSystemTeacher`; never trust a request field.
3. **The app mirror** `slotHolderWhere` (`slot-holder.ts:23`) adds `eq(b.slotExempt, false)`, so app checks and the index agree. The availability read already excludes the system teacher (861), so no change there.
4. **Tests (SAFE env, each must fail when its code is removed):**
   - 3 park blocks in one hour → all 201;
   - **a real teacher still can't double-book** (409);
   - a request body with `slotExempt: true` for a real teacher is ignored;
   - the migration text / witness / journal pins;
   - the mutation set.
   - **A rolled-back sid proof** (host .206): 2 park blocks at the same hour both insert; a real teacher's 2nd booking is refused; residue 0.

## FE (Fanta, smart-scheduler-front)
- **The calendar's "No Teacher" column shows N blocks in one hour cell**, stacked, each with its own group / name / charge, readable at 375 px.
- **The OTHER form** lets the admin add another park block in an hour that already has one (the cell's "+" stays available on the system column).
- **No new words** (reuse the existing park-fee labels). Tests: 2–3 blocks render in one cell; the add action stays available.

## Not changed
- **Revenue:** already one line per booking (C1), so N groups = N park-fee lines.
- **DECISIONS row 11's wording reuse** stands; only "one block per hour" is superseded. I'll add a DECISIONS row when the build starts.

## Done =
- **BE:** tsc 0 · SAFE suite green (before / after) · mutants · 0077 `applied · verified` on sid · the sid proof.
- **FE:** tsc 0 · tests · build 0.
- Reports in `inbox/SA-B.md`. Then sid deploy → Tanya → I commit.
