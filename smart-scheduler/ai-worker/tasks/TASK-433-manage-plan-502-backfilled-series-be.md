# TASK-433 — 🔴 DEFECT `REQ-101`: the Manage-plan page returns **502 from origin** on a BACKFILLED series on `sid` (a created series is fine) — BE side first: reproduce on backfilled data, find the throw/timeout, fix — S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-22) · **Size S (debug).** Blocks `uat`.

## §0 The owner's repro (`sid`, via Porter)
`/scheduler/other/d2b80ca9-7378-40a4-b988-ee03e95ea703` — the backfilled series **"ABC / Balance Camp · ECA · New"** ⇒ 502 origin. Every other page fine. Tanya's API pass on a series she CREATED (`GET /other-series/:key`) = 200. The FE page fetches client-side (`useOtherSeries(key)` + `useAllBookings({ type: OTHER, teacherId, from: first, to: last, limit: 200 })` — I read it; no SSR call), so a 502 is either the API dying/timing out on the backfilled key, or the Next server on that route. **You own the API half; the owner is asked for the server log line (DATA REQUEST via Porter) to settle which.**

## §1 Reproduce on data the backfill produces, not the creator
1. Build a fixture the way `scripts/backfill-other-series.ts --apply` leaves rows: OLD OTHER rows (pre-TASK-394 shapes — `other_title` set? `head_count` null? `teacher_rate_minor` null? `end_time` null? a CANCELLED/ATTENDED-only series with NO live row? rows whose `additionalTeachers` relation has a teacher since ARCHIVED? a title with `/`?) stamped with one key — then `GET /other-series/:key`, `GET /other-series?from&to`, and the page's second call `GET /bookings?type=OTHER&teacherId=…&from=<first>&to=<last>&limit=200` for a LONG span (a backfilled series can be months of rows — does `getBookings` over a wide span with `limit: 200` do a slow scan? what does the DB do on `sid`'s volume?).
2. Read `getOtherSeries` for any throw on a null the creator always writes but old rows may lack (`hhmm(t.startTime)` on a null; `ratesOf`; `extrasOf` with a null relation; `templateOf` when every row is ended ⇒ `rows[0]` — fine). Read `hhmm` itself.
3. Say what you found — a 500 (⇒ the fix + a pin on that fixture), a slow query (⇒ the index/predicate + a pin), or nothing (⇒ say so; then the Next server is the suspect and the log decides).

## §2 Fix + DoD
- [ ] The cause named with the line · the fix · a pin on the backfilled fixture (every shape in §1.1 opens) · suite **count** · tsc 0 · 50 = 50 · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log. 🚫 No `sid` access, no SQL — fixtures only.

---

# 🔎 READ DONE — @Jason → @Sober (2026-09-22) — the API half does NOT throw or stall on backfilled data (reproduced on every §1.1 shape, pinned); the cause is on the FE/Next side — one hypothesis + what settles it

**Numbers:** `bun test` **2704 pass / 0 fail** (+4: `src/lib/other-series-backfilled-req101.test.ts`) · `tsc --noEmit` **0** · 50 = 50 · no product change (the pin only).

## §1 What I reproduced — the page's BOTH calls, on rows shaped as the backfill leaves OLD rows
Fixture: five rows under the key `d2b80ca9-…` — title `ABC / Balance Camp` (the `/`), `head_count` / `teacher_rate_minor` / `note` NULL, statuses CANCELLED · ATTENDED · NO_SHOW (an ALL-ENDED series, no live row), an extra whose teacher row is gone (`teacher: null`), the primary since ARCHIVED, one row with NO title, a nine-month span (Jan → Sep).
1. `GET /other-series/:key` ⇒ **200**, the header from the first row (`templateOf` falls back to `rows[0]` when nothing is live), `headCount: null`, `teacherRates: {}`, the extra listed by id, every row in order.
2. `GET /bookings?type=OTHER&teacherId=<T1>&from=2026-01-03&to=2026-09-03&limit=200` (the page's second call, the hand-built select path + the DTO) ⇒ **200**, five items, `other: { kind, headCount: null, teacherRates: {} }`, `rate: null`, `otherSeriesKey`, a title-less row renders with `displayName: ""`.
3. `GET /other-series?from&to` over the span ⇒ **200**, one line (`liveCount: 0, total: 5`).
4. A key with no rows ⇒ a clean **404 envelope**; a malformed key ⇒ Postgres' uuid error ⇒ the 500 envelope (TASK-297's handler) — never a dead socket.
Read as well: `hhmm` (`t.slice(0, 5)`) is the only thing in `getOtherSeries` that throws on a null — and `start_time` / `end_time` are NOT NULL in the schema (`0000`, `schema.ts:422–423`), so the backfill cannot produce that shape. `listOtherSeries` is N+1 by design (one read per key in the range) — the page does not call it. The TASK-431 mask returns before touching the body for a super admin / a keyed viewer, and for a masked viewer rebuilds the Response from the original headers (`c.json` sets only `content-type`; Bun computes the length) — no length mismatch a proxy could 502 on.
**Verdict (§1.3): nothing.** The API answers 200 on every shape the backfill produces, in the shapes the page requests. Pinned (4 tests; 4 mutations that would make a shape throw — no template on an all-ended series · the extra's null teacher read · a null rate assumed a number · a null head count assumed present — all bite).

## §2 So the Next server is the suspect — ONE hypothesis that fits "one key 502s, another 200s"
The owner opened the BACKFILLED series by URL (a hard load — the Next server renders the route shell); Tanya reached the CREATED series by clicking through from the calendar (a soft navigation — the client router renders it, no server request for the page). A 502 "from origin" on a hard load of `/scheduler/other/[key]` is the Next server failing on that route's server render — independent of the key's data. **What settles it in one minute, no log needed:** open the CREATED series by pasting its URL into a fresh tab. 502 ⇒ the route's server render (Fern's half, any key); 200 ⇒ the data does matter and the server log line is the next fact. Either way the API is not it — a curl of `GET /other-series/d2b80ca9-…` on `sid` with the owner's token (your DATA REQUEST) will read 200 like the fixture.

🚫 Nothing changed in product code; no `sid` access; no SQL. ⛔ Only you mark this DONE — or route the FE half to Fern with the one-minute check.

---

# ✅ DONE (read) — REVIEWED by @Sober (2026-09-22) — the API is cleared; the FE route's client/server boundary read by me
Jason: both of the page's calls 200 on every backfill shape (+4 pins, 2704/0); `start_time`/`end_time` NOT NULL. Me: `page.tsx` is a server page rendering a `"use client"` `OtherSeriesContent` (dialogs `"use client"` too; no `window`/`localStorage` at module scope) — the same shape as the calendar page; nothing in the code explains a route-specific 502. **What decides it is on `sid`:** the owner's one-minute check (paste the CREATED series' URL into a fresh tab — a hard load) + the FE server log + the curl. No task to Fern until a fact points at the route.
