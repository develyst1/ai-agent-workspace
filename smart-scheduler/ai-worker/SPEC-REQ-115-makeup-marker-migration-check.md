# REQ-115 (T1) — the make-up MARKER migration and its OWN verification — @Sober, 2026-10-06
**Written now, at @Porter's condition, so it goes INTO the REQ-115 TASK verbatim when that is cut.** 🚫 **Not a TASK yet; nothing cut.**
🔑 **If the backfill misses a row, that make-up becomes an ordinary class in the system's eyes and the engine can never trim it again — silent, permanent, per row, on the customer's live system.** ⇒ **the migration CHECKS ITSELF and refuses to finish if it is wrong.** **Nobody decides anything at 1 a.m.**

## 1. WHAT counts as an existing make-up — three populations, all marked
| | population | why it is a make-up |
|---|---|---|
| **P1** | `status = 'EXTENDED'` | the engine creates every make-up in this status; nothing else ever writes it |
| **P2** | `extended_from_id IS NOT NULL` | linked to the leave it replaces — survives confirm, attend, cancel |
| **P3** | `note = 'คาบขยายอัตโนมัติจากการปรับแผนคอร์ส'` | the engine's own note — 🔴 **catches the ones P1 and P2 miss: a make-up appended WITHOUT a link (TASK-553's case) that was later CONFIRMED** |
**All three over `booking_type = 'COURSE_PACKAGE'`, ANY status** (a delivered or cancelled make-up keeps its badge in history). **Marker = P1 ∪ P2 ∪ P3.**
⚠️ **P3 depends on a note a person COULD have edited — that is why it is a third population, not the only one; a P3-only row is counted and REPORTED separately.**

## 2. 🔴 The migration verifies ITSELF — one transaction, no half state
**In the SAME migration, after the backfill `UPDATE`:**
1. **`missed`** = rows in P1 ∪ P2 ∪ P3 whose marker is NOT set → **must be 0**
2. **`extra`** = rows whose marker IS set but are in none of P1/P2/P3 → **must be 0**
3. **`marked`** = rows with the marker set → **must equal the size of P1 ∪ P2 ∪ P3**, counted in the same transaction
▶️ **If ANY of the three fails: `RAISE EXCEPTION` with the three numbers ⇒ the whole migration ROLLS BACK ⇒ no column, no marks, nothing half-written ⇒ `db:verify` is RED ⇒ the new code is NOT started.** 🔑 **The decision for "counts disagree" is made HERE, in advance: STOP, change nothing, send the three numbers to @Sober.** 🚫 **Never "fix it by hand" on the box.**
**The engineer's DB-unreachable tests pin this SQL by value (the three checks and the RAISE); it is proven to abort on a seeded mismatch on sid before uat.**

## 3. BEFORE / AFTER counts — run by the OWNER (SELECT only), on sid first, then on uat in the release note
```sql
-- BEFORE the migration (and again AFTER: the union must not have changed)
SELECT count(*) FILTER (WHERE status = 'EXTENDED')                                    AS p1,
       count(*) FILTER (WHERE extended_from_id IS NOT NULL)                           AS p2,
       count(*) FILTER (WHERE note = 'คาบขยายอัตโนมัติจากการปรับแผนคอร์ส')            AS p3,
       count(*) FILTER (WHERE status = 'EXTENDED' OR extended_from_id IS NOT NULL
                          OR note = 'คาบขยายอัตโนมัติจากการปรับแผนคอร์ส')            AS union_,
       count(*) FILTER (WHERE note = 'คาบขยายอัตโนมัติจากการปรับแผนคอร์ส'
                          AND status <> 'EXTENDED' AND extended_from_id IS NULL)       AS p3_only
FROM bookings WHERE booking_type = 'COURSE_PACKAGE';
-- AFTER: the marker count must equal union_ (column name per the TASK)
```
**The release note states: BEFORE `union_` = N · AFTER marked = N · `p3_only` = M (reported, not a failure).**

## 4. The number we expect on uat — known BEFORE we go
**From READ 2 (owner, 2026-10-06), make-up rows (P2 ∪ P3) = 47 ATTENDED + 11 + 18 SICK_LEAVE + 26 + 49 CANCELLED + 305 EXTENDED + 5 CONFIRMED = `461`.** **All 305 `EXTENDED` rows sat inside that filter (READ 1 counted 305 `EXTENDED` in total) ⇒ P1 adds nothing on 10-06 ⇒ union ≈ 461.**
⇒ **On release night `union_` should be 461 PLUS the make-ups created since 10-06 (each leave adds one).** **A number far from that is a reason to STOP and ask before migrating — not after.**

## 5. Rollback
**The column is new, nullable / default false, and read only by the new code.** ⇒ **rolling the CODE back needs no database step** — old code never reads it. 🚫 **No down-migration on a live box.**
