# REQ-024: Bookings page — proper search & filtering on every tab
- Status: READY_FOR_SA
- Priority: MEDIUM–HIGH (the default tab is unusable at real data volumes)
- Requested: 2026-08-01 by stakeholder (คุณฟีน) — "หน้า booking ทำให้มี search filter อย่างเหมาะสม"
- Deadline: none
- Source: stakeholder direction + Porter's read-only audit of `/scheduler/bookings`, 2026-08-01.

## Problem / Goal
The Bookings page has three tabs and their search/filter support is **wildly uneven**:

- **Courses tab — the DEFAULT tab — has nothing at all.** No search, no filter, no sort, no pagination. It
  fetches **every** course package and renders every card. With a few hundred students, staff must scroll and
  eyeball to find one child, and the page pulls the entire list every visit. Card order is not even stable —
  the query has no `ORDER BY`, so the same list can come back in a different order.
- **Vouchers tab has no search in the UI** — even though the API already accepts one.
- **All-bookings tab is actually well equipped** (search, status, teacher, type, date-range preset, server
  pagination) — but its **search misses the two things Thai staff actually type**: a child's **nickname** and the
  **parent's phone**. The student picker elsewhere in the app searches both, so the same query works in one place
  and silently returns nothing here — which reads as "the system is broken".

Goal: staff can **find what they're looking for on every tab**, and the page stays fast as the school grows.

## Requirement
1. **Courses tab: add search + filtering + a stable order, and stop loading the whole list.** Staff must be able
   to find a student's course quickly and page through results.
2. **Vouchers tab: add search** (by student), with the same "don't load everything" treatment.
3. **All-bookings search must also match the child's nickname and the parent's phone number**, consistent with
   the student picker used elsewhere.
4. **Custom date range** on the all-bookings tab (currently only ALL / TODAY / WEEK / MONTH presets).
5. Filtering must be **server-side** — filters that only narrow the current page are misleading.
6. Nothing already working may regress (bulk-confirm, the sport/program on course cards).

## Acceptance Criteria
- [ ] Courses tab: search by student finds their course; results are paged and consistently ordered.
- [ ] Vouchers tab: search by student works.
- [ ] All-bookings: searching a **nickname** or a **parent phone** finds the child's bookings.
- [ ] All-bookings: staff can pick an arbitrary from–to date range.
- [ ] Filters narrow the whole result set, not just the visible page.
- [ ] Bulk-confirm and the course-card sport line still work.

## Analysis / current state (Porter, read-only audit 2026-08-01 — for Sober to verify)

| Tab | Search | Filters | Sort | Pagination | Volume |
|---|---|---|---|---|---|
| **Courses** (default) | ❌ none | ❌ none | ❌ none — **no `ORDER BY` at all** | ❌ none | 🔴 **unbounded** |
| **Vouchers** | ❌ none in UI (**API already has `q`**) | ❌ none | `createdAt DESC` | ❌ none | 🔴 **unbounded** |
| **All bookings** | ✅ `q` (student **name** + subject name only) | ✅ status · teacher · type · date-range **preset** | fixed `date, startTime` ASC | ✅ server-side, default 10 | ✅ bounded |

**Cheap wins the audit found (backend already done, UI missing):**
- **Vouchers `q` exists in the API** with no UI control → FE-only.
- **Arbitrary `from`/`to` already accepted** by the bookings API; the UI only sends 4 presets → FE-only.
- **`studentSearchConditions(q)`** (name + nickname + parent phone, with an empty-digits guard) **already exists**
  in `parent.service.ts` and is used by the student picker — the bookings search simply doesn't call it → BE-only,
  small, and it removes the inconsistency in #3.

**Where real work is needed:**
- `GET /courses` has **no query schema at all** — courses search/filter/sort/pagination is **BE + FE**. Note
  `getCourses()` is also called by other code paths, so adding parameters must not break those callers.
- Badge filtering on the bookings list would be BE + FE (no badge param exists today).

## Constraints
- Frontoffice only (`smart-scheduler-front` + scheduling API).
- Server-side filtering/pagination — the Courses and Vouchers tabs must stop fetching unbounded lists.
- HOW (query shapes, control layout, whether to add sorting) is the SA's design.

## Out of Scope
- The New-booking modal redesign → **REQ-022**.
- Badge system improvements themselves → REQ-021 (parked). A badge *filter* here is a Question below.

## Questions
(SA + stakeholder. Porter answers as `> answer: ...`; business calls → `@Porter`.)
1. **On the Courses tab, which filters actually help staff?** My proposal from the card states that already
   exist: **locked / admin-unlocked**, **expiring soon**, **nearly finished**, and **by sport/program**.
   Anything you'd add or drop?
2. **Should the bookings list gain a badge filter (and a badge column)?** Badges are the branch / onsite-vs-online
   mechanism, but they're currently invisible on this list. (Porter's lean: **yes, once REQ-021 is un-parked** —
   filtering by a tag system with known gaps could mislead. Not blocking this REQ.)
3. **Sorting** — worth adding clickable column sorting on the all-bookings table (e.g. newest first)? Today it's
   fixed oldest-first by date. (Porter's lean: yes for date at least; staff usually want what's coming up.)
4. Should the selected **tab and filters survive a refresh / be shareable via the URL**? Today a refresh drops
   you back to the Courses tab with everything reset. (Porter's lean: yes — cheap, and staff live on this page.)

> ### ✅ ANSWERS (Porter, from คุณฟีน 2026-08-01) — all four answered
> **Q1 — Courses filters: she deliberately did NOT pick a list.** Her words: *"กรองปกติเลย ที่ช่วยทำให้เขาใช้งาน
> ได้ง่าย"* — i.e. **use judgement; give staff the ordinary filters that genuinely make the page easy to work
> with.** So this is delegated to the team, with one standard to hold it to: **each filter must answer a question
> staff actually ask**, not exist because the data happens to be there.
> **Porter's baseline to design from** (from the states the course cards already show): search by student ·
> **locked / admin-unlocked** · **expiring soon** · **nearly finished** · **by sport/program**. Add or drop
> against the "does a staff member actually ask this?" test; you don't need to come back to me for that.
> **Q2 — badge filter: "ok to have".** ✅ Include it. **I'm softening my earlier lean:** I said wait for REQ-021,
> but that caution was really about **aggregate reporting** — the REQ-021 defect is that the badge *report*
> silently drops untagged rows. A **filter** is a deliberate "show me these" and doesn't produce a misleading
> total, so it's safe to ship now. **Just don't add badge-based counts/totals to this page** — that's where the
> gap bites.
> **Q3 — column sorting: "ok to have".** ✅ Include. At minimum date (staff usually want what's upcoming; today
> it's fixed oldest-first).
> **Q4 — URL-persisted tab + filters: "ok".** ✅ Include — refresh and sharing a filtered view both work.
>
> Nothing here is blocking. **REQ-024 is fully answered.**
