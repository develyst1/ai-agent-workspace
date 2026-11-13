# SIZE: park fee, several groups in the SAME hour (ขวัญ «พร้อมกันหลายกรุ้ปได้นะคะ», not yet confirmed by the owner). Silver, 2026-11-09. Size only, nothing built
**Today (TASK-861, DECISIONS row 11):**
- Every park block is an OTHER booking on the one system teacher "No Teacher".
- `bookings_teacher_slot_uq` is unique on (teacher, date, start_time) (`smart-scheduler-back` `src/db/schema.ts:606`), so a 2nd block in the same hour → 409 `SLOT_TAKEN`.

## What changes
| part | change | size |
|---|---|---|
| **DB (SB)** | the system teacher's rows must leave the slot index. Its predicate can't reference `teachers.is_system`, and the system teacher's uuid differs per database, so add a stored flag on the booking (e.g. `bookings.slot_exempt boolean NOT NULL DEFAULT false`, set true for No-Teacher rows) and **rebuild `bookings_teacher_slot_uq` with `AND NOT slot_exempt`**. One additive migration, plus the witness (index-predicate probe) and the journal `when` check. | ≈ 0.5 d |
| **App checks (SB)** | the app-side slot checks that mirror the predicate (`SLOT_INACTIVE_STATUSES` / `lib/slot-holder.ts`, and the availability read that already excludes the system teacher) must treat exempt rows the same way; the inserter sets the flag for the system teacher only. Tests: 3 park blocks in one hour OK; a real teacher still can't double-book. | ≈ 0.5–1 d |
| **Calendar (SF)** | the "No Teacher" column must show **N blocks in one hour cell** (stacked, each its own group / charge), and the OTHER form must allow a 2nd one. | ≈ 0.5–1 d |
| **Revenue / park-fee lines** | **no change.** It's already one revenue line per booking (C1), so N groups = N lines. | 0 |

**Total ≈ 1.5–2.5 d** (BE ≈ 1–1.5 Bob · FE ≈ 0.5–1 Fanta).

**Risk: medium.** `bookings_teacher_slot_uq` is the hottest index in SB. Its predicate has been rebuilt 3 times before (0002 / 0007 / 0022), the witness probes the predicate text, and the rebuild locks `bookings` briefly on sid / uat (use `CREATE … CONCURRENTLY` outside the tx, or accept a short lock at deploy). Nothing changes for real teachers if the flag is only ever set for the system teacher.
