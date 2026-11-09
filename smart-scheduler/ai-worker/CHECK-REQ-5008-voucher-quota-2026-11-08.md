# CHECK: REQ-5008 — where a voucher's quota is checked at booking and at check-in
**Silver (SA-B), 2026-11-08.** Read only: `smart-scheduler-back` `dong` working tree. Nothing was run, and no real data was read.
**What this is:** a code finding (how the code *can* let it happen). It's **not yet the cause of her case.** Tanya's uat facts and her sid reproduction decide whether this is what happened to that child.

## The answer in short
- **At booking**, the gate counts **only hours already used** (attended), not sessions already booked but not yet taught.
  - So a voucher with 1 hour left accepts **any number** of future bookings, one at a time, as long as none has been attended yet.
  - Her "1 left, 3 booked" fits this exactly.
- **At check-in and at day-end**, the hour is deducted **with no check at all**. `used_hours` simply goes past the total, and nothing warns anyone.

## Where, in the code
| moment | code | what it checks |
|---|---|---|
| **booking** (the admin booking form; the only caller) | `prepareVoucherBooking`, `scheduler.service.ts:1403–1438`, called at l.1548 | the voucher exists, belongs to the child, isn't ended; then `voucherUsable` (`lib/voucher.ts:38`): `total_hours − used_hours > 0` and not expired. **Bookings that are PENDING / CONFIRMED but not yet attended are not counted.** |
| **check-in / mark attended** (manual) | `scheduler.service.ts:~4592–4598` | none: `used_hours + 1`, unconditionally |
| **day-end auto-attend** | `jobs.service.ts:~110–115` | none: `used_hours + 1`, unconditionally |
| **remaining shown** | `voucherRemaining` = `max(0, total − used)` (`lib/voucher.ts:34`) | clamps at 0, so an over-used voucher shows "0 left" rather than "−2". **Nobody is warned.** |
| **parent / LINE** | no voucher booking path found in the LINE services | parents don't book vouchers by this read. A parent's **check-in** goes through the same deduction (no check). |

## A fix (needs no customer ruling, except the check-in part)
1. **The booking gate counts reserved sessions:** `remaining = total − used − (this voucher's bookings still PENDING or CONFIRMED)`. A new booking needs `remaining ≥ 1`.
   - **Same picker:** `voucherUsable` also feeds the voucher picker and the SOM status (`voucherStatus`), so the picker and the "EXHAUSTED" status show it too. That's one predicate, and the doors don't disagree.
   - **Which statuses reserve an hour:** to be confirmed against the deduction rules when the TASK is cut. Every row that day-end will auto-attend counts. A leave / cancel doesn't.
   - **A move or reschedule** doesn't add a booking, so it must not be refused by the new count. Test it.
2. **At check-in, refuse or warn** when the voucher has nothing left. **This is ขวัญ's call:** her message covers both "จองไม่ได้" and "ไม่มีการขึ้นเตือน".
   - With (1) in place, it can only happen to vouchers that were already over-booked before the fix.
   - My recommendation: **warn, never refuse.** The child is standing there, and refusing a check-in strands the coach's hour.
3. **The ones already over-booked:** a read-only list of vouchers where used + reserved > total (uat). It's a DATA REQUEST / Tanya read, so staff can sort them out by hand.
   - The fix doesn't touch existing bookings.

## Size (one engineer, excludes QA)
- (1): BE gate + the shared predicate + tests, incl. the move / reschedule non-regression: **≈ 1 d**. The picker's "remaining" in the front: **≈ 0.5 d**.
- (2), after her ruling: a warning on the check-in result + its message (approved words): **≈ 0.5 d**.
- **Total ≈ 1.5–2 d.** It's in `scheduler.service.ts` (the shared hot file), as a small hunk inside `prepareVoucherBooking`.

## Also noticed (not in her message)
- **One booking deducts one hour, whatever its length:** `+ 1` per booking. If a voucher class can be longer than 1 hour, the count and her "ครั้ง" may differ.
  - Worth one line in Tanya's read: the class lengths of that child's 3 bookings.

## Over-booked list: bare SQL for the owner's own tool (read-only), via Porter's DATA REQUEST (Silver, 2026-11-08)
Lists every voucher where used + still-booked exceeds what was bought. It returns the voucher, the child's nickname (for staff), and the counts. Read-only; run it on uat.
```sql
SELECT v.id AS voucher_id,
       s.nickname AS child,
       v.total_hours,
       v.used_hours,
       COUNT(b.id) FILTER (WHERE b.status IN ('PENDING','CONFIRMED')) AS booked_not_taught,
       v.total_hours - v.used_hours
         - COUNT(b.id) FILTER (WHERE b.status IN ('PENDING','CONFIRMED')) AS available
FROM vouchers v
JOIN students s ON s.id = v.student_id
LEFT JOIN bookings b ON b.voucher_id = v.id
WHERE v.ended_at IS NULL
GROUP BY v.id, s.nickname, v.total_hours, v.used_hours
HAVING v.used_hours > v.total_hours
    OR v.total_hours - v.used_hours
       - COUNT(b.id) FILTER (WHERE b.status IN ('PENDING','CONFIRMED')) < 0
ORDER BY available;
```

### Over-booked list: run attempt (Silver, 2026-11-08, via `scripts/uat-select.mjs`, host .29 = uat)
- **Not run.** `permission denied for table vouchers`. The `sa_readonly` role has **no SELECT grant on any table**: `information_schema.role_table_grants` returns 0 rows, and it has USAGE on schema `public` only. Waiting on the owner's grant (inbox/PM.md). The query to run, unchanged, is above; the no-names version drops `s.nickname` and the `students` join.

### Over-booked list: RESULT (Silver, 2026-11-08, `scripts/uat-select.mjs`, host .29 = uat; grants verified first)
Not-ended vouchers where used > bought, or used + still booked > bought. **2 vouchers:**
| voucher id | bought | used | booked, not yet taught | over by |
|---|---|---|---|---|
| `348c0822-96cd-44fb-8e9e-28538fc57c07` | 10 | **12** | 0 | 2 (already taught) |
| `fe7fa6ff-8508-4ffd-b6bc-aaa97ac39422` | 10 | 6 | **6** | 2 (not yet taught: 2 of the 6 booked sessions have no hours behind them) |
- The first shape (used 12 of 10) fits ขวัญ's example (1 left, then 3 checked in). *Inferred:* whether it IS her child's voucher is settled by matching the id in Tanya's uat read. No names are in this file.
- **What staff can do now**, staff's call, nothing written by us:
  - the 2nd voucher: cancel or move 2 of its 6 future bookings, or sell more hours, before they're taught;
  - the 1st: the 2 extra hours were already taught, so it's a money / goodwill decision.
