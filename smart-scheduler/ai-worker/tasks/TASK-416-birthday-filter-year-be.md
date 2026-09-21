# TASK-416 — REQ-099 extension, BE: optional YEAR on the birthday range — blank = month-only any year (as built); filled = a real DOB date range

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-20) · **Size XS.** No migration (47 = 47). `sid`.

## §1 The contract
- `studentsQuery` gains `birthYearFrom?`, `birthYearTo?` (ints 1900..2100). Rules: a year is allowed ONLY beside its month (`birthYearFrom` needs `birthMonthFrom`, same for To); **both years or neither** (a half-dated range ⇒ `400`); with years ⇒ `from date <= to date` else `400`; `noDob` still exclusive with any of the four.
- **With years:** the filter is a DATE range — `birth_date BETWEEN make_date(yf, mf, 1) AND (make_date(yt, mt, 1) + interval '1 month' - interval '1 day')` — the whole To month included; no wrap-around (a dated range cannot wrap); the order = `birth_date` ascending, then name. **Without years:** exactly TASK-414 (month-only, wrap allowed, month/day order). One helper, two branches, pinned by value through `toSQL` for both, plus a table (Sep 2018 → Feb 2019 includes 15-01-2019, excludes 15-03-2019 and 15-01-2018).
- `birthDate` in the select unchanged.

## Definition of Done
- [ ] Suite, **count** · tsc 0 · 47 = 47 · the validator's rules (five `400`s) · both branches by value · the order · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

---

# 📤 REPORT — @Jason → @Sober (2026-09-20)

✅ **DONE (code), exactly your §1.** **2565 pass / 0 fail** (+4), 198 files · `tsc --noEmit` clean · 🚫 no migration (**47 = 47**), no key.

## What was built
- **`lib/birth-month.ts`** — the DATED branch beside TASK-414's: `birthDateRangeWhere(yf, mf, yt, mt)` ⇒ `birth_date BETWEEN make_date(yf, mf, 1) AND (make_date(yt, mt, 1) + interval '1 month' - interval '1 day')` (the whole To month; no wrap — the validator refuses `from > to`; NULL never satisfies a BETWEEN); `birthDateOrder()` ⇒ `birth_date, name`; the pure table helpers `monthStart` / `monthEnd` (day 0 of the next month — a leap February gives the 29th) / `dateInRange`; **ONE branch decision `birthdayMode(f)`** (`noDob` › `date` (years + months) › `month` › `none`) that BOTH `withBirthdayFilter` and the new `birthdayOrder` read — the where and the order cannot disagree. Without years the month-only branch is TASK-414's code byte-unchanged (its `toSQL` pins still pass).
- **`studentsQuery`** + `birthYearFrom` / `birthYearTo` (ints 1900..2100); the refines, each necessary: both years or neither · a year only beside its month · `from <= to` as `year × 100 + month` (same year, months backwards ⇒ 400) · the month rule from 414 · `noDob` exclusive — ⚠️ one simplification: the "noDob with years" clause was REDUNDANT (years imply months by the rule above, so the one `noDob && months` clause already covers all four) — dropped, with the reason in the comment; the five 400s are pinned by value.
- **`searchStudents`** takes the `BirthdayFilter` type; `.orderBy(...birthdayOrder(birthday))` replaces the inline `ranged` ternary; the route passes the five fields. `birthDate` in the select unchanged.

## Pinned (`lib/birth-month-req099.test.ts` — 11 tests, +4; two 414 pins re-pointed)
- **The dated branch by `toSQL`:** the BETWEEN text with `make_date` and the four params, the date order, no `extract(month …)`.
- **The date table:** Sep 2018 → Feb 2019 includes 15-01-2019 and the edges 01-09-2018 / 28-02-2019 / 31-12-2018; excludes 15-03-2019, 15-01-2018, 01-03-2019, 31-08-2018; `monthEnd` on a leap February and December.
- **The ONE decision:** `birthdayMode` five ways (noDob wins over a DATED range too); the where AND the order follow it (dated ⇒ `make_date` + the base term surviving beside it + the date order; month-only ⇒ the wrap OR + the `% 12` key; nothing ⇒ the name).
- **The validator:** the happy dated shape; a lone From year; a lone To year (the both-or-neither rule alone); years without months; `from > to` across years AND within one year; noDob with years; the bounds; one month + one year.
- The service's order line, the route's five fields.

## 🔑 Mutation — thirteen, `finally`, checksum — all bite (five passed first ⇒ pins/code tightened, listed honestly)
A the To month cut to its 1st · B the From month from its last day · C the dated branch ordered by the month key · D years ignored · E noDob loses to a dated range · F `monthEnd` off by one · G the dated branch drops the base · H a lone year accepted · I years without months accepted · J `from > to` accepted · K the check compares years only · L noDob with a range accepted · M the service's order ignores the branch. **First run: E, G, H, I, L passed.** E/G/H were pin gaps (noDob vs a dated range; the base beside the dated where; a lone TO year) — pinned. I was unobservable because the `from <= to` refine tripped on `NaN` when months were missing — that refine now guards on months, so the year-needs-month rule is the ONE that refuses and I bites. L was the redundant clause — removed (simpler code), the mutation re-aimed at the one clause. Every restore byte-identical.

📌 **@Fern (via you):** `GET /api/students?birthMonthFrom=9&birthMonthTo=2&birthYearFrom=2018&birthYearTo=2019` — the years both or neither, only beside the months, from ≤ to (a dated range does not wrap); the result comes back in `birthDate` order. Everything else as TASK-414.

🚫 No deploy request. ⛔ Only you mark this DONE. ▶️ Next: whatever waits on the board.
