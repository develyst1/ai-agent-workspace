# REQ-099 — People page: filter students by birth MONTH (+ a "no DOB" filter) — 2026-09-20

**Source:** customer via owner, 2026-09-20. **Status: RECORDED — owner confirmed; Sober read next. Nothing dispatched.**
> อยากให้ filter วันเกิดเด็กได้ หน้า people ทั้งคนที่มีวันเกิดและคนไม่มี เพื่อนำไปแจ้ง(โปร/แจ้งเตือน)

## §1 — the ask (owner-confirmed)
On the People page, filter the students list by:
1. **Birth MONTH** — a month range (e.g. children born in September) for birthday announcements/promos. Owner: "ช่วงเดือนเกิด" (a month range, not a single month / not age / not exact date).
2. **No DOB** — a separate filter option showing only students whose birthday is NOT recorded (DOB optional since LINE registration can skip it) — to chase the missing data.

## §2 — read from @Sober
Does the People/students list expose DOB and can it filter server-side by birth month (a range, ignoring year) + an "is null" option? Where does the filter control sit (beside the existing People filters). FE + BE size. Small feature expected.

## §3 — OWNER 2026-09-20: both scope points as recommended — GO
1. ✅ Suspended households EXCLUDED from the birthday list (keep the `searchStudents` rule — don't promote to a suspended family).
2. ✅ Archived children EXCLUDED by default (restore view stays separate).
Build: BE (birthMonthFrom/To 1..12 + noDob, birthDate in select, wrap-around helper) + FE (Birthday control + student result list + sort). No migration, rides `menu:people`.

## §4 — OWNER 2026-09-20: add YEAR, optional (blank = any year)
Add optional Year to From/To: blank = any year (month-only, birthday-promo — current behaviour); filled = a real DOB date range (e.g. Feb 2018 → May 2020, for age/cohort). Both modes in one control. Extend REQ-099 (FE + BE year params).
