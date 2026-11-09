# DATA REQUEST: uat, for REQ-5004's uat gate (TEST-138) — @Porter, 2026-11-07
**Status:** WAITING for the owner's uat deploy (migration 0073 first). He runs these on **uat**, bare SQL; CSV results back to Porter → Tanya.

1. Karn (Tanya's 11-05 dump: PART_TIME + active). Read first; if `type` isn't PART_TIME, stop and send the row:
```sql
SELECT id, nickname, type, active, work_days, weekend_capacity_hours FROM teachers WHERE id = 'c3648d58-d451-4be7-8a42-75f19d23b4c0';
```
```sql
UPDATE teachers SET weekend_capacity_hours = 4 WHERE id = 'c3648d58-d451-4be7-8a42-75f19d23b4c0';
```
Expected: `UPDATE 1`.

2. Buy days (fresh; DR-7 stops at 11-05), as CSV:
```sql
SELECT 'course' AS kind, id, to_char(created_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD') AS buy_day FROM course_packages
UNION ALL
SELECT 'voucher', id, to_char(created_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD') FROM vouchers
ORDER BY 1, 3;
```

3. Expiry changes, as CSV:
```sql
SELECT 'course' AS kind, course_id AS id, from_date, to_char(changed_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD') AS changed_day FROM course_expiry_changes
UNION ALL
SELECT 'voucher', voucher_id, from_date, to_char(changed_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD') FROM voucher_expiry_changes
ORDER BY 1, 4;
```
