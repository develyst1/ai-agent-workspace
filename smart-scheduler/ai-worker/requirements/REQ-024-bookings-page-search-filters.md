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

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-024 | Bookings page — proper search & filtering on every tab | **MEDIUM–HIGH** | ✅ 🧪 **`TEST_PASSED` (Tanya, 2026-08-04) — the last gate is closed.** On the deployed `sid` build the CUSTOM date inputs measure **176 px at 1600 / 1280 / 768 / 375** (the original defect was **26/36 px**), no page overflow, and they wrap to their own line below 1280 instead of crushing. API re-checked on today's build: nickname **and** parent-phone search both return 8; sort asc `2026-01-05` vs desc `2026-09-23` with **totals 89 = 89** (a sort, not a filter); `sort=NONSENSE` → **400**; custom range 28 rows, **0** outside. Evidence: `tests/TEST-BATCH-2026-08-04-sid-acceptance.md`. Prior: **API PASS 2026-08-02; only a painted item left.** `sid` re-check after today's redeploy: **search (nickname + parent phone) PASS · sort PASS** (desc→2026-09-23 first, asc→2026-07-01, `NONSENSE`→400) **· custom-range API PASS**. Yesterday's "sort not deployed" is **resolved** (it was undeployed, not broken — `sid` redeployed during recovery). **Only remaining gate = the collapsed custom-date-INPUT fix (TASK-081), which is painted** and needs a composited browser measured at 1600/1280/768/375. 🔴 **I structurally cannot verify it** — the page is behind login and I don't enter passwords into a login field (see log [afternoon-2]); needs the owner to eyeball, or a no-auth/SKIP_AUTH FE surface. _Prior (Porter):_ ✅ DELIVERED (pending the fix deploy) — acceptance 4/5 PASS 2026-08-01; collapsed custom date inputs fixed by TASK-081 | **@Porter — deploy + acceptance. BUILD COMPLETE 2026-08-01: TASK-070 ✅ · 071 ✅ · 073 ✅ · 074 ✅.** 🔴 **Ships as ONE batch — TASK-070+071 cannot be split** (breaking response shape). ⚠️ **Acceptance, since this is the customer's own complaint:** open the bookings tab → **page 1 must start at the next session, not the oldest booking in the system** → click the date header → flips to oldest-first **and the count does not change** (a sort, not a filter). Also: search a **nickname** and a **parent phone** — both must find the child. SPEC-022 (2026-08-01). **Two of the five ACs are nearly free:** AC 3 (nickname + parent phone) is a swap to the existing `studentSearchConditions()` — exported and unit-tested since the REQ-011 fix; the bookings search simply was not using it, which is exactly why the same query works in the student picker and returns nothing here. AC 4 (custom date range) is **FE-only** — the API has always accepted arbitrary from/to. ⚠️ **Design constraint found while verifying:** `getCourses()` has **four** consumers and three need the whole list (attention checks, eligible-students, SOM report) — paging them would silently truncate a digest count, an eligibility list and a dashboard figure. So paging is **opt-in**, while the stable ORDER BY (there is none today, so card order really does vary) is unconditional. ⚠️ **Why it sat: I never saw it** — I select work by grepping the board for READY_FOR_SA, and my greps ran before this REQ was written; once I had a queue in my head I worked it without re-deriving. Not judged and rejected — **never seen.** Fix adopted: re-grep immediately before choosing, never from memory. **Early sizing: ~1 BE + ~1 FE day** — AC #3 (search must match nickname + parent phone) is **nearly free**,  already does name/nickname/phone and is exported + unit-tested (the REQ-011 fix); the all-bookings search simply isn't using it. No migration. _Porter's original:_ Sober — spec. คุณฟีน 2026-08-01: "หน้า booking ทำให้มี search filter อย่างเหมาะสม". **Porter audited it first — the page is very uneven:** 🔴 the **Courses tab (the DEFAULT)** has **no search / filter / sort / pagination** and fetches **every** course package — and `getCourses()` has **no `ORDER BY`**, so card order isn't even stable · 🔴 **Vouchers tab unbounded, no search in the UI** · ✅ **All-bookings is already well equipped** (q · status · teacher · type · date preset · server pagination) **but its search matches only student NAME + subject — not nickname, not parent phone**, while the student picker elsewhere searches both ⇒ same query works in one place, silently fails here. **Cheap wins (backend already done, UI missing):** vouchers `q` exists in the API (FE-only) · arbitrary `from`/`to` already accepted, UI sends only 4 presets (FE-only) · `studentSearchConditions()` (name+nickname+phone) already exists and just isn't called by the bookings search (BE-only). **Real work:** `GET /courses` has **no query schema at all** ⇒ BE+FE, and its other callers must keep unfiltered access. ✅ **ALL 4 Qs ANSWERED 2026-08-01:** Courses filters = **delegated to the team** — her words *"กรองปกติเลย ที่ช่วยทำให้เขาใช้งานได้ง่าย"*; hold each filter to "does a staff member actually ask this?" (Porter's baseline: search-by-student · locked/unlocked · expiring soon · nearly finished · by sport) · **badge filter ✅ include** (Porter softened his earlier "wait for REQ-021" — that caution was about misleading *totals*; a filter is safe, just **don't add badge counts/totals to this page**) · **column sorting ✅ include** (at least date — staff want upcoming, not oldest-first) · **URL-persisted tab+filters ✅ include**. Nothing blocking. |
```
