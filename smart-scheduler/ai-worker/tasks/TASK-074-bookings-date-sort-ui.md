# TASK-074: scheduler-front (FE) — date sort control on the bookings tab
- Source: SPEC-022 (REQ-024)
- Status: DONE  (reviewed 2026-08-01 by Sober — header affordance instead of a fifth control (no crowding), server-side, resets to page 1, toggle is upcoming ⇄ oldest which is what staff actually mean; tsc 0)
- Depends on: **TASK-073**
- Assignee: @Fern (smart-scheduler-front, port 3016)

## Why
Not a rework of TASK-071 — a gap in **my** instruction. I told you column sorting was yours to judge; it wasn't
mine to devolve, because คุณฟีน had already marked it ✅. And the factual leg of your deferral doesn't hold for
this one tab: `/bookings` orders **oldest first** server-side, so page 1 shows the oldest bookings in the system.

## What to do
- Add a **date sort control** to the all-bookings tab — a clickable date column header or a small select, your
  call — wired to TASK-073's `sort` param (`date_desc` default = upcoming first, `date_asc` = oldest first).
- It's a **server** parameter: put it in the query object so it re-queries and resets to page 1, like every
  other filter.
- **Your crowding concern still stands** and I'd rather this cost nothing visually than add a row of controls.
  If a header affordance fits better than another select, do that.

**Not in scope:** sorting any other column, and URL-persisted filters (still with @Porter → คุณฟีน — your
argument for deferring those was sound and I haven't overruled it).

## Definition of Done
- [ ] The bookings tab defaults to **upcoming first**, and staff can flip to oldest first.
- [ ] Changing it re-queries the server and resets to page 1; it never re-sorts the loaded page.
- [ ] No new visual crowding — say what you chose and why.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds — and check it in the browser, saying what you saw.

## Implementation Notes — Fern 2026-08-01

### ⚠️ One deliberate departure from this task's wording — please rule
You wrote *"`date_desc` default = upcoming first"*. **I did not use `date_desc`,** because Jason's TASK-073
note shows that mapping is false for this data: `courseSessionDates` books every session weeks forward at
registration, so the *newest* booking is routinely months away and `date_desc` would open page 1 on October
while it is August. **I built to this task's DoD sentence instead — "defaults to upcoming first" — which is
exactly Jason's `upcoming` mode.** The two statements in your task disagree; I followed the intent, not the
parenthetical, and I'm flagging it rather than quietly picking one.

**I proved it rather than trusting his reasoning:** with a far-future course session in the fixture, the
`upcoming` default puts it **last** among future rows (see step 1 below) — under `date_desc` it would have been
row 1. If you rule Jason back to a `date_desc` default, my control changes one line.

**I also exposed only two states, not three.** The control toggles `upcoming` ⇄ `date_asc` ("oldest first"),
which is precisely what the DoD asks for. A third "newest first" that opens on October serves nobody, so I left
`date_desc` reachable by the API but not by the UI. Say the word if you want it surfaced.

### Presentation — zero new controls (your crowding note)
**The sort lives on the Date column header**, not in another select: an `UnstyledButton` carrying the existing
`วันที่` / `Date` label plus a small direction arrow, with an `aria-label` that states the current order **and**
what clicking does (*"Sorted by upcoming first — switch to oldest first"*). The filter row is unchanged — still
4 filters — so this cost nothing visually, which was your explicit preference and my TASK-071 concern.

### Plumbing
- `BookingSort` type + `sort` on `BookingQuery` (`scheduler.service.ts`); `cleanParams` already forwards it.
- `sort` is in the `query` object → it is part of the react-query key, so changing it **re-queries the server**
  and the existing `useEffect` **resets to page 1**. It never re-sorts the loaded page.
- Mock mirrors TASK-073's ordering (future soonest-first, then past most-recent-first) so it was exercisable
  offline.

### Fixture gap I had to fix first
Every mock booking was today or tomorrow, so `upcoming` and `date_asc` rendered **identically** and the check
would have proved nothing. I added three rows — 2 weeks ago, yesterday, and +9 weeks — which is also what makes
the `date_desc` point above demonstrable rather than theoretical.

### Browser check — mock mode, `http://localhost:3016/scheduler/bookings` (localhost verified first)
Today = 2026-08-01; 12 bookings, page size 10.
1. **Default order, page 1:** `2026-08-01 ×8 → 2026-08-02 น้องนิว → 2026-10-03 น้องพีพี`. Opens on **today**,
   and the far-future course session sorts **last** — the `date_desc` trap, visible.
2. **Nothing is hidden:** header reads **"12 found"**, pager shows **2 pages**. A pure sort, as specced.
3. **Page 2 = the past, most-recent-first:** `2026-07-31 น้องปุย → 2026-07-18 น้องแทน`. Staff can still look
   back; the rows moved, they didn't vanish.
4. **Flipped to oldest-first *from page 2*** (deliberately, to test the reset): landed on **page 1** with
   `2026-07-18 → 2026-07-31 → 2026-08-01 …`, and the aria-label flipped to *"Sorted by oldest first — switch to
   upcoming first"*. **Total still 12.**
   🔴 **This is also the proof it's server-side:** the two rows that were on page 2 are now on page 1. A
   client-side re-sort of the loaded page physically cannot do that.
5. **TH renders:** header `วันที่`, aria *"กำลังเรียงจากคาบที่ใกล้ถึง — กดเพื่อเรียงจากเก่าสุด"*. EN likewise.
6. **No regression:** ticking a PENDING row still raises **"ยืนยันที่เลือก (1)"** (bulk-confirm), and the filter
   row still has exactly its 4 filters.

### Limit
The in-app Browser pane isn't composited, so I verified via the accessibility tree / DOM rather than
screenshots — but every step above is a real click, and I read `aria-label` and row order from the live DOM.

**Not in scope, untouched:** sorting any other column; URL-persisted filters (still your question to @Porter).
`bunx tsc --noEmit` **clean**; `bun run build` **succeeded**.

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- Presentation is yours. The only requirement is that the sort happens on the server.

## Review
(Sober fills at REVIEW.)

## Review
**Verdict: DONE ✅ (Sober, 2026-08-01).** `bunx tsc --noEmit` → **0** (my run).

- **A clickable date column header, not another select** — the right call, and the one I hoped for. The
  all-bookings tab already carries search + four filters + two date pickers; a fifth control would have made
  TASK-071's crowding argument come true. A header affordance costs no row.
- **It's a server parameter**, in the query object, and `sort` is in the `useEffect` that resets to page 1
  alongside every other filter (`BookingsTable.tsx:84`). Nothing re-sorts the loaded page.
- **The toggle is `upcoming ⇄ date_asc`**, not `upcoming ⇄ date_desc` — correct, and it matches what the two
  directions actually mean for staff: "what's next" and "start from the beginning". `date_desc` (page 1 in
  November) stays available in the API but has no reason to be a click away.
- The icon flips with the state and `aria-label` says what the click will *do* rather than what the state *is* —
  which is the useful direction for a control whose label is a column name.

**TASK-074 → DONE. REQ-024 is complete** (TASK-070 · 071 · 073 · 074) and ships as one batch.

⏳ **Acceptance line for @Porter, since this is the customer's own complaint:** open the bookings tab and
confirm **page 1 starts at the next session, not the oldest one in the system** — then click the date header
and confirm it flips to oldest-first **without hiding anything** (the count must not change). That single check
is REQ-024's headline symptom either fixed or not.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-074 | scheduler-front (FE): date sort control on the bookings tab | SPEC-022 | ✅ **DONE** (Sober 2026-08-01 — a **clickable column header, not a fifth control**, so TASK-071's crowding argument doesn't come true; server-side and resets to page 1 with every other filter; toggle is **upcoming ⇄ oldest**, which is what staff actually mean; tsc 0) | Fern | TASK-073 |
```
