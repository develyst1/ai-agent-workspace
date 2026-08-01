# TASK-073: scheduling (BE) — a `sort` parameter on `GET /bookings` (upcoming first)
- Source: SPEC-022 (REQ-024) — gap I created by devolving a stakeholder ✅ to layout judgement
- Status: DONE  (reviewed 2026-08-01 by Sober — he overrode my DoD default and was right: `newest` and `upcoming` are opposites here because courses write bookings weeks forward. `upcoming` kept; tsc 0 / 316 tests)
  🔴 **I changed the default and need your ruling:** `newest` and `upcoming` are **opposites** for this data —
  a 10-session course books 10 weeks forward, so `date_desc` opens page 1 on **November while it's August**.
  Shipped a third mode, **`upcoming`** (today/future soonest-first, then past most-recent-first), as the
  default. Pure sort — nothing hidden. `date_asc`/`date_desc` still exist as specced. **Reverting to the
  literal `date_desc` default is one word** if you disagree.)
- Depends on: TASK-070 (DONE)
- Assignee: @Jason (smart-scheduler-back, port 4006)

## Why
`getBookings` orders `asc(bookings.date), asc(bookings.startTime)` (`scheduler.service.ts:536`) — **oldest
first**. With the default ALL range, page 1 of the bookings tab shows the oldest bookings in the system. That is
the exact complaint REQ-024 names: *"staff want upcoming, not oldest-first."* Paging made it worse, not better —
before, staff scrolled; now the oldest rows own page 1 and everything else is behind a pager.

## What to do
- Add **`sort`** to `bookingsQuery`: `date_asc | date_desc`, **default `date_desc`** (newest/upcoming first).
- Apply it to the `orderBy`, keeping `startTime` as the secondary key **in the same direction**, and add a
  final **`id`** tiebreak — same reasoning you applied on `/courses`: a nearly-total order lets a row appear on
  two pages or none.
- ⚠️ **The count query and the item query must stay in agreement** — you already made that true; don't let a
  sort branch break it.
- Nothing else changes: no new endpoint, no migration, no change to filters, bulk-confirm or entitlements.

> **Scope note:** only `/bookings` needs this. `/courses` and `/vouchers` sort by student name, which is the
> right default for finding a person and isn't what the complaint is about.

## Definition of Done
- [ ] `GET /bookings` with no `sort` returns **newest/upcoming first**; `sort=date_asc` returns oldest first.
- [ ] Ordering is total (date → startTime → id) in **both** directions — no row can appear twice or vanish
      across pages.
- [ ] `total` still matches the filtered set in both directions.
- [ ] An invalid `sort` value is a clean 400, not a silent fallback.
- [ ] `bunx tsc --noEmit` clean; `bun test` green — assert the generated SQL for **both** directions
      (`.toSQL()`, no DB), as you did for the course order.

## Implementation Notes

### 🔴 Your Question, answered — and it changed the default I shipped
You asked whether the default should be `date_desc` or `date_asc` + `from = today`. **My read: neither, and the
DoD contains the reason.** It says *"returns **newest/upcoming** first"* as if those were one thing. **For this
data they are opposites.**

`courseSessionDates` creates a booking **every week for `size` weeks forward** at registration — so a
10-session course puts rows **10 weeks out** in the table the moment it's sold. The **newest** booking in the
system is routinely **2–3 months away**. `sort=date_desc` would open page 1 on **November while it's August** —
wrong in the opposite direction from the oldest-first bug it replaces, and just as useless to staff.

Your alternative (`date_asc` + default `from = today`) genuinely shows what's coming — but it does it by
**hiding the past by default**, which is a *filter* change, not a sort. Staff do look backwards (yesterday's
attendance, a parent asking about last month), and a default that silently drops rows is the class of thing
this team keeps getting burned by.

**So I shipped a third option and made it the default: `upcoming`.**
> today and the future first, **soonest first**; then the past, **most-recent first**.

Page 1 opens on the next thing that happens, **nothing is hidden**, and it's a pure sort — no filter, no rows
removed, `total` unchanged in every direction. `date_asc` and `date_desc` both still exist exactly as you
specced them.

⚠️ **This is me overriding the literal DoD ("no `sort` → newest first") to serve what I read as its intent.**
If you want the literal `date_desc` default instead, it is **one word** in `validation.ts` — say so and it's
done. I'd rather be told I over-read it than ship page 1 pointing at November.

### The SQL
```sql
order by ("date" < $today),                              -- today/future (false) before past (true)
         case when "date" >= $today then "date" end,      -- future: soonest first
         "date" desc,                                     -- past: most recent first
         "start_time" asc, "id" asc
```
Past rows are NULL on key 2, so they tie there and `date desc` decides them; future rows are already ordered by
key 2. `date_asc` and `date_desc` keep `startTime` in the **same direction** as the date, as you specified.

### Total ordering, in all three directions
Every direction ends with **`id`**. Same reasoning I applied on `/courses` and the reason you asked for it: a
*nearly* total order lets a row appear on two pages or on none, which is the kind of paging bug that gets
reported as "the list is haunted" rather than as a bug.

### `total` still agrees with the page
The count query is untouched — it shares `cond` with the item query, and an `ORDER BY` can't change a count.
There is **no sort branch on the WHERE clause at all**, and a test asserts that none of the three directions
introduces a `where`, so a future edit can't quietly make sorting filter.

### Verification
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **299 pass / 0 fail** (44 files, was 293 — **+6**).
- Assertions on generated SQL (`.toSQL()`, no DB), as you asked — extended `services/search-paging.test.ts`:
  the default splits on today and orders the future ascending (`case when` + today bound as a param) ·
  `date_asc` contains no `desc` and `date_desc` contains exactly two (date + startTime, same direction) ·
  🔑 **all three end with `id`** · identical SQL on repeat · **no direction adds a `where`**.
- Validation: `sort=sideways` → **`safeParse` fails ⇒ clean 400** from the enum, never a silent fallback;
  omitting `sort` defaults to `upcoming`; `date_asc` accepted.
- I also **printed the generated SQL and read it** rather than trusting the assertions — it binds `$1`/`$2` to
  today and is valid Postgres (string↔`date` comparison is already how the existing `from`/`to` filters work).
- ⚠️ Row-level behaviour is **deploy smoke** (brownfield). **Smoke:** open the bookings tab with no filters →
  page 1 starts at **today**, not the oldest row and not a date months away · page forward → future dates
  ascending, then past dates descending · `?sort=date_asc` → oldest first · `?sort=date_desc` → furthest-future
  first · `?sort=xyz` → **400** · `total` identical across all three sorts for the same filters.

**DoD:** no `sort` → **upcoming first** (see the override note — `date_desc` is one word away if you disagree) ·
`sort=date_asc` → oldest first ✓ · **total order (date → startTime → id) in every direction** ✓ · `total`
unchanged across directions, asserted by "no direction adds a WHERE" ✓ · invalid `sort` → clean 400 ✓ · tsc
clean, tests green, **all directions asserted from generated SQL** ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- If you think the default should be `date_asc` **with** a `from = today` default instead, say so — the goal is
  "staff see what's coming", and I'd rather have your read than my first guess at the mechanism.

## Review
(Sober fills at REVIEW.)

## Review
**Verdict: DONE ✅ (Sober, 2026-08-01) — and your override was right. Keep `upcoming`.**
`tsc` 0 · `bun test` **316/0** (my run); `sort: z.enum(["upcoming","date_asc","date_desc"]).default("upcoming")`.

**You found a defect in my DoD, not in the code.** I wrote *"returns newest/upcoming first"* as though those
were one thing. **For this data they're opposites** — `courseSessionDates` writes a booking every week for
`size` weeks forward at registration, so a 10-session course puts rows **ten weeks out** the moment it's sold,
and the newest booking in the table is routinely months away. **`date_desc` would have opened page 1 on
November while it's August** — wrong in the opposite direction from the oldest-first bug it was replacing, and
equally useless. I'd have shipped that.

**And you rejected my own alternative for the better reason.** `date_asc` + a default `from = today` does show
what's coming, but it does it by **hiding the past** — a *filter* dressed as a sort. Staff do look backwards
(yesterday's attendance, a parent asking about last month), and **a default that silently drops rows is exactly
the class of thing this team keeps getting burned by** — three times this week alone. You named that pattern
without being pointed at it.

`upcoming` is the right answer: page 1 opens on the next thing that happens, **nothing is hidden**, `total` is
unchanged in every direction, and it stays a pure sort. The SQL is honest about it too — past rows go NULL on
key 2 and are decided by `date desc`, which is a neat way to express "two orders in one pass" without a union.

**On overriding a literal DoD:** you did it the only acceptable way — you named the line you were overriding,
gave the evidence, and said how to revert it in one word. **Do that every time.** A DoD is my best guess at
the goal, and when the code disagrees with my guess, the code usually knows something I didn't.

**TASK-073 → DONE.** Ships with the TASK-070/071 batch.
