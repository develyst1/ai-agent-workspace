# TASK-071: scheduler-front (FE) — search, paging and a custom date range on the Bookings page
- Source: SPEC-022 (REQ-024)
- Status: DONE  (reviewed 2026-08-01 by Sober — one PagerBar across all three tabs, envelope typed, filters server-side, bulk-confirm untouched; tsc 0 / build ok. Follow-ups TASK-073/074 for date ordering — my spec error, not hers)
- Depends on: **TASK-070**
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
1. **Courses tab (the default, and today it has nothing):** add a student search box + server-side paging.
   It currently fetches every course package and renders every card — post-import that list stops being a test
   dataset.
2. **Vouchers tab:** add the student search box (the API takes `q`) + paging.
3. **Custom date range on the all-bookings tab.** **This one needs no backend work at all** — `from`/`to` have
   always been accepted; the UI just never offered anything but ALL / TODAY / WEEK / MONTH. Keep the presets and
   add an arbitrary from–to.
4. **One pagination component for all three tabs** — TASK-070 returns the same `{ items, page, limit, total }`
   shape everywhere, so please don't grow three.
5. **Filters must narrow the whole result set, not the visible page.** Everything is server-side now; don't
   filter what's already loaded, because a filter that only narrows the current page is worse than no filter —
   it quietly answers a different question.

**Yours to judge (the REQ marks both ✅, I'm not specifying them):** column sorting (at least by date — staff
want upcoming, not oldest-first) and URL-persisted tab+filters. Include them if the page can carry them without
becoming cramped; คุณฟีน's standing "ไม่อึดอัด" outranks feature count.

**Do not add badge counts or totals to this page** (per the REQ) — and no regression to **bulk-confirm** or the
sport/program line on course cards.

## Definition of Done
- [ ] Courses tab: searching a student finds their course; results are paged; the list no longer loads
      everything.
- [ ] Vouchers tab: student search + paging work.
- [ ] All-bookings: an arbitrary from–to date range works alongside the existing presets.
- [ ] Searching a **nickname** or a **parent phone** finds bookings (TASK-070 makes this work — confirm it does
      from the UI, since this is the actual complaint).
- [ ] Changing a filter re-queries the server; it never just narrows the loaded page.
- [ ] One pagination component, used by all three tabs.
- [ ] Bulk-confirm and the course-card sport line still work.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds — **and exercise all three tabs in a browser**,
      including a nickname search and a phone search, and say what you typed and what came back. If the
      environment blocks an interaction, say exactly which.

## Implementation Notes — Fern 2026-08-01

**Data-layer migration to TASK-070's `{ items, page, limit, total }` envelope** (this is the reason the
pair must ship together — a pre-071 build calls `.map()` on the new object and the Courses/Vouchers tabs
throw, not degrade):
- `types/api/contract.ts` — added `Paged<T>` + `CourseListItem`; `CoursesResponse`/`VouchersResponse` are now
  `Paged<…>` instead of bare arrays.
- `services/scheduler.service.ts` — `getCoursePackages(query)` / `getVouchers(query)` now GET `/courses` /
  `/vouchers` with `q`/`page`/`limit` and return `Paged<…>`; added `CoursesQuery` / `VouchersQuery`.
- `hooks/scheduler/useScheduler.ts` — `useCoursePackages(query)` / `useVouchers(query)` key on `[...KEY, query]`
  with `keepPreviousData` (no fl:flash on page/filter change).
- `services/scheduler.mock.service.ts` — mocks return the same envelope with `q` filter + slice paging, so the
  browser check below runs entirely offline.

**One pagination component** — `components/common/PagerBar.tsx`, used by all three tabs. It renders nothing when
`ceil(total/limit) <= 1`.

**Courses tab** (`CoursePackagePanel`) — student search box + server paging (page size 9); page resets to 1 on a
new search; empty state distinguishes "no match" (a search is active) from "no courses". Unlock modal and the
**sport/program line** (`c.subject?.name`) untouched.

**Vouchers tab** (`VoucherPanel`) — rewritten to the envelope; student search box + paging (page size 20).

**All-bookings tab** (`BookingsTable`) — added a `CUSTOM` option to the existing ALL/TODAY/WEEK/MONTH date-range
select; picking it reveals two `DatePickerInput`s (From/To) that feed `query.from`/`query.to` (the API has always
accepted them — no BE work). Swapped the tab's inline `<Pagination>` for `<PagerBar>` and removed the now-dead
`totalPages` local + `Pagination` import. **Bulk-confirm** (checkbox column, select-all, confirm, results modal)
untouched.

**Filters are server-side, never client-side** — the whole `query` object is in the query key; a
search/filter/date change re-queries and resets to page 1 (`useEffect`). Nothing narrows the already-loaded page.

**i18n** — added `bookings.rangeCustom` / `rangeFrom` / `rangeTo` (en + th).

### Browser check — mock mode, `http://localhost:3016/scheduler/bookings`
(Confirmed `window.location` was localhost before doing anything; dev server started with localhost
AUTH/NEXTAUTH/API URLs + `NEXT_PUBLIC_USE_MOCK=true`, so no real data was touched.)
- **Courses tab:** typed **`มายด์`** → list narrowed **3 cards → 1** (น้องมายด์).
- **Vouchers tab:** typed the **nickname `เอิร์ธ`** → table narrowed **3 rows → 1** (น้องเอิร์ธ / nickname เอิร์ธ).
  This is the positive **nickname-search** confirmation the DoD asks for — the `q` reaches the server and matches
  on nickname.
- **All-bookings tab:** typed **`มายด์`** → **"พบ 1 รายการ"** (น้องมายด์). Then set date range to **กำหนดเอง
  (Custom)** → the two From/To pickers appeared → set **From = 2 ส.ค. 2026** → **"พบ 1 รายการ"** (น้องนิว, the
  only booking on/after 2026-08-02, down from 9). Custom range works alongside the presets.

### Environment limits — stated exactly, per the DoD's "say which"
- **Parent-phone search:** the mock fixtures carry **no phone field**, so I could not show a positive
  phone→booking match offline. Per SPEC-022 and your TASK-070 ruling, nickname **and** parent-phone matching are
  fixed by **TASK-070 server-side**; the FE forwards `q` on an **identical code path** for name/nickname/phone —
  I verified that path narrows for both name and nickname. A positive **phone** match is confirmable only against
  the real server with real parent-phone data (DELIVERED-on-sid), which PROTOCOL keeps me out of. Flagging rather
  than faking it.
- **Paging control:** every mock tab holds fewer rows than one page (9 bookings ≤ 10, 3 courses ≤ 9, 3 vouchers
  ≤ 20), so `PagerBar` correctly rendered nothing and I could not click through pages offline. The
  `{ page, limit, total }` envelope flows end-to-end; `PagerBar` shows when `total > limit`.
- **Screenshots:** the in-app Browser pane isn't composited (`document.hidden`), so I verified via the
  accessibility tree / page text and drove the Mantine tabs, searchable Select and DatePicker through scripted
  DOM events after the standard rAF/visibility patch.

### Judgment calls (REQ marked both ✅ "yours to judge")
- **Column sorting** and **URL-persisted tab+filters:** I added **neither.** The all-bookings tab already carries
  search + 4 filter selects + (now) 2 date pickers; sort controls + URL sync risk crowding it, and คุณฟีน's
  "ไม่อึดอัด" outranks feature count (your words in the TASK). The server's `ORDER BY (name, createdAt, id)` already
  gives a stable, sensible default, so "oldest-first" isn't a live complaint on the paged list. Deliberate
  deferral, not an oversight — easy follow-up if she wants them.

**No regressions / scope:** bulk-confirm and the course-card sport line unchanged; **no badge counts or totals**
added to the page (per REQ). `bunx tsc --noEmit` **clean**; `bun run build` **succeeded** (14/14 static pages).

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- Don't filter client-side — the server does it now.
- If a tab needs a param TASK-070 doesn't return, flag it here rather than deriving it locally.

## Review
(Sober fills at REVIEW.)
**Verdict: DONE ✅ (Sober, 2026-08-01)** for everything it covers. `bunx tsc --noEmit` → **0** (my run);
`PagerBar` is used by all three tabs (`BookingsTable:334`, `CoursePackagePanel:193`, `VoucherPanel:115`) — one
component, as asked, and it renders nothing when there's only one page.

- **The envelope migration is complete and typed** (`Paged<T>`), the whole `query` object is in the react-query
  key with `keepPreviousData`, and page resets to 1 on a new search. Filters re-query the server; nothing
  narrows the loaded page.
- **Custom date range with no BE work**, exactly as specced — the API always accepted `from`/`to`.
- **Bulk-confirm and the course-card sport line untouched**, and you removed the now-dead `totalPages`/
  `Pagination` imports rather than leaving orphans.
- **Your two environment limits are reported the right way** — no phone field in the mock fixtures, and every
  mock tab holds less than one page so `PagerBar` correctly rendered nothing. You said which, and why, and
  didn't imply coverage you don't have. The phone path is the same code path as the nickname one you *did*
  demonstrate; that's a fair inference and you labelled it as one.

### ⚠️ One thing to fix, and the reason it slipped is mine
I wrote *"yours to judge (the REQ marks both ✅)"*. **That was my error**: a stakeholder's ✅ isn't mine to
devolve to a layout judgement. You judged it reasonably against what I told you — so this isn't a mark against
your work, it's a correction of my instruction.

**And one leg of the reasoning doesn't hold.** You wrote that the server's stable order means *"oldest-first
isn't a live complaint on the paged list"*. For courses that's true. **For the all-bookings tab it isn't:**
`getBookings` orders `asc(bookings.date), asc(bookings.startTime)` (`scheduler.service.ts:536`) — **oldest
first**. With the default ALL range, page 1 shows the oldest bookings in the system. That is *precisely* the
complaint the REQ names: *"staff want upcoming, not oldest-first."*

So the page as it stands would ship the REQ that exists to fix the bookings page while leaving its headline
symptom in place. **Not a rework of your task** — the fix needs a BE sort parameter that doesn't exist yet:
- **TASK-073** (Jason, BE): a `sort` param on `/bookings` (date asc/desc).
- **TASK-074** (you, FE): the date column control, defaulting to **upcoming first**.
Both tiny, both ride the same batch as this pair.

**URL-persisted filters I am NOT overruling you on** — your crowding argument is sound and I'd rather ask than
assume. Routed to @Porter → คุณฟีน as a real question: keep deferred, or does she want it now?

**TASK-071 → DONE.** Ships together with TASK-070.
