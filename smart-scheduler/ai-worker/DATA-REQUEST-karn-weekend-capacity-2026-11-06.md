# DATA REQUEST: Karn's Sat–Sun capacity = 4 h (REQ-5004, TASK-756) — @Porter, 2026-11-06
**Status:** WAITING for the deploy of the 756 + 757 build (migration 0073 first). The owner runs it, bare SQL.
**Source:** Silver, then Tanya (TEST-138): on sid Karn is FREELANCE and inactive, so the plain UPDATE would show nothing.

## sid (after the deploy). Porter's ruling: match sid's row to uat's
sid is the owner's test box; Karn reappearing on sid's calendar is accepted.
```sql
UPDATE teachers SET type = 'PART_TIME', active = true, work_days = ARRAY[0,1,6]::smallint[], weekend_capacity_hours = 4 WHERE id = '821186fa-44ce-4e55-addc-c5230b5383cc';
```
Optional read, for all-data available hours (else NOT_TESTED):
```sql
SELECT id, type, (created_at AT TIME ZONE 'Asia/Bangkok')::date AS created_day FROM teachers WHERE active AND NOT archived ORDER BY id;
```

## uat (later, after uat's deploy). Karn is PART_TIME + active there (Tanya's 11-05 dump); re-check the row first
```sql
SELECT id, nickname, type, active, weekend_capacity_hours FROM teachers WHERE id = 'c3648d58-d451-4be7-8a42-75f19d23b4c0';
UPDATE teachers SET weekend_capacity_hours = 4 WHERE id = 'c3648d58-d451-4be7-8a42-75f19d23b4c0';
```
