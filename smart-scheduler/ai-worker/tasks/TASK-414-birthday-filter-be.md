# TASK-414 — People birthday filter, BE: `GET /students` gains `birthMonthFrom` / `birthMonthTo` (1..12, wrap-around) + `noDob`, and `birthDate` in the select (`REQ-099`)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-20) · **Size XS–S.** No migration (47 = 47), no key (rides `menu:people`). `sid`; joins the batch's `uat` deploy.

## §0 Owner's scope (Porter 09-20): filter students by birth MONTH RANGE (year ignored) for promos; a separate `no DOB recorded` filter; **suspended households EXCLUDED** (the `searchStudents` rule stands); **archived children EXCLUDED by default** (the restore view stays separate).

## §1 The contract (from my read of `searchStudents` — say if anything differs)
- **`studentsQuery`** gains `birthMonthFrom?: int 1..12`, `birthMonthTo?: int 1..12` (both or neither — one alone ⇒ `400`), `noDob?: boolean`. `noDob` and a month range together ⇒ `400` (they contradict).
- **The select** gains `birthDate` (ISO `YYYY-MM-DD` | null) on every row (the FE renders `DD-MM-YYYY` or `—`).
- **`lib/birth-month.ts` (pure):** `birthMonthWhere(from, to)` ⇒ `from <= to` ⇒ `EXTRACT(MONTH FROM birth_date) BETWEEN from AND to`; `from > to` (wrap, e.g. 11 → 2) ⇒ `month >= from OR month <= to`; both `AND birth_date IS NOT NULL` by construction. `noDob` ⇒ `birth_date IS NULL`. Pinned by value through `toSQL` (the three shapes) and by a table of months (12 → 2 includes 12, 1, 2; excludes 3 and 11).
- **Ordering:** when a month range is set, `ORDER BY EXTRACT(MONTH …), EXTRACT(DAY …), name` (a wrap range orders from `from` around — the helper returns the sort key too: `(month - from + 12) % 12`); otherwise today's `name` order. `noDob` ⇒ name order.
- The suspended exclusion and the archived default are untouched (pinned: the two filters compose with the existing `searchWhere`, never replace it). `limit` stays (max 200) — a promo month is under that; say if the owner needs more.

## Definition of Done
- [ ] Suite, **count** · tsc 0 · 47 = 47 · the helper by value (three shapes + the month table + the wrap sort key) · the validator's two `400`s · the select's `birthDate` · the composition by source · 🔑 Break-and-watch, `finally`, CHECKSUM · contract lines for @Fern (I expect none beyond §1) · report here + `inbox/SA.md` + log.

---

# 📤 REPORT — @Jason → @Sober (2026-09-20)

✅ **DONE (code), exactly your §1 — nothing differed on the read.** **2561 pass / 0 fail**, **198 files** (+1) · `tsc --noEmit` clean · 🚫 no migration (**47 = 47**), no key.

## What was built
- **`lib/birth-month.ts`** (new, pure): `monthInRange(m, from, to)` (the table's truth); `birthMonthWhere(from, to)` ⇒ `from <= to` ? `extract(month from birth_date) BETWEEN from AND to` : `month >= from OR month <= to` (a NULL month satisfies neither — "IS NOT NULL" by construction); `noDobWhere()` ⇒ `birth_date IS NULL`; `wrapSortKey(m, from) = (m − from + 12) % 12` and `birthMonthOrder(from)` ⇒ `ORDER BY ((month − from + 12) % 12), day, name`; `withBirthdayFilter(base, f)` composes WITH the caller's base (noDob wins over a range — the validator refuses the pair anyway; nothing set ⇒ the base untouched).
- **`studentsQuery`** + `birthMonthFrom` / `birthMonthTo` (coerced ints 1..12) + `noDob` (`"true" | "false"`); two refines ⇒ `400`: one month alone; `noDob` with a range. `q` / `limit` / `archived` unchanged.
- **`searchStudents(q, limit, archived, birthday)`**: the select + `birthDate`; `.where(withBirthdayFilter(baseWhere, birthday))` where `baseWhere` is today's search ∧ archived-default ∧ suspended-exclusion (the composition, never a replacement); the order switches to the wrap order ONLY on a range (noDob and plain searches keep the name order); `limit` stays (max 200). The DTO + `birthDate: "YYYY-MM-DD" | null`. The route passes the three fields through.
- 🔻 One REQ-093 pin re-pointed (the route line gained the filter argument; the archived flag unchanged).

## Pinned (`lib/birth-month-req099.test.ts`, 7 tests)
- **The helper by VALUE through `toSQL`:** the three shapes byte-for-byte with their params (BETWEEN · `>= OR <=` · IS NULL); the month table (12 → 2 = {12, 1, 2}, 11 → 2 = {11, 12, 1, 2}, 3 → 5, 6 → 6, 1 → 12 = all; 3 and 11 excluded from 12 → 2); the wrap sort key (Nov, Dec, Jan, Feb ⇒ 0, 1, 2, 3) and the ORDER BY text with the key, the day, the name; the composition (the base untouched when nothing is set; the archived term still present beside BETWEEN; noDob wins and BETWEEN is absent).
- **The validator:** both-or-neither, 1..12 ints (0, 13, 1.5 refused), the contradiction refused, the defaults, `archived=true&noDob=true` allowed (the restore view may chase DOBs too).
- **By source:** the select + DTO carry `birthDate`; the REQ-093 archived term and the TASK-058 suspended exclusion untouched and UNDER the filter; the order switch on `ranged`; the limit; no SQL in the service (the helper owns it); the route line; 47 files.
- **Through the ROOT app:** the range and `noDob` reach the service as parsed; a lone month and the contradiction ⇒ 400 before the service.

## 🔑 Mutation — thirteen, `finally`, checksum — all bite
A the wrap branch gone · B the wrap with AND · C the sort key unwrapped · D the ORDER BY unwrapped · E the filter REPLACES the base (suspended/archived dropped) · F a range wins over noDob · G `monthInRange` inverted · H `birthDate` dropped from the select · I the month order on every query · J the filter over the search half only (the suspended exclusion lost) · K a lone month accepted · L noDob + a range accepted · M month 13 accepted. Every restore byte-identical.

## 📌 Contract lines for @Fern (via you) — final, none beyond your §1
`GET /api/students?birthMonthFrom=11&birthMonthTo=2` (both or neither; 1..12; wraps) · `GET /api/students?noDob=true` (not with a range ⇒ 400) · both compose with `q`, `archived`, `limit` (max 200) · every row now carries `birthDate: "YYYY-MM-DD" | null` (render `DD-MM-YYYY` or `—`) · a range comes back ordered from its first month around the year, then by day, then name.

🚫 No deploy request. ⛔ Only you mark this DONE. ▶️ Next: whatever waits on the board.
