# SPEC-033 — Add a one-time EXTRA paid session to a course (single-session sale, NOT quota)

- Source: REQ-037 (คุณฟีน 2026-08-04). Related: REQ-030 (plan) · REQ-035 (SINGLE_SESSION sell-side).
- Status: DESIGN. **HIGH — owner wants it in the 2026-08-20 go-live.**
- Depends on: REQ-030's plan surface + availability picker (099/095); the existing single-session revenue + freelance paths.

Grounded in `scheduler.service.ts` + `jobs.service.ts` (read 2026-08-04).

## 1. The shape — a second, clearly-separate "add a day" that lives BESIDE the plan

Two distinct actions the staff must not confuse:
- **Insert (REQ-030)** — reschedules *within* `size` (pulls from the tail); no new money; goes through `reconcileCoursePlan`.
- **Add extra session (this REQ)** — a **paid `SINGLE_SESSION` booking** on top of the course; `size`/owed/end **unchanged**;
  posts revenue + draws freelance like any booking; **out of `reconcileCoursePlan`.**

## 2. The one real BE change — the seam-keeper (this is what makes it "beside, not inside")

Today `reconcileCoursePlan` loads **all** bookings `WHERE courseId = X` (`scheduler.service.ts:1325`) with **no type
filter** — so a soft-linked extra would be counted and break "6 stays 6". The fix, and it does all the work:

> **The course engine counts only `COURSE_PACKAGE` bookings.** `reconcileCoursePlan` / `planCourseMoves` /
> `courseCurrent` filter to `bookingType === "COURSE_PACKAGE"`.

With that one filter, a `SINGLE_SESSION` extra **soft-linked by `courseId`**:
- **doesn't count** toward `size`/owed/derived-end (§4) — it's not a COURSE_PACKAGE row; **and**
- **its cancel doesn't trigger a course re-owe** — TASK-105 calls `reconcileCoursePlan` on any cancel with a
  `courseId`, but the engine now ignores non-`COURSE_PACKAGE` rows, so cancelling the extra is a plain single-session
  cancel (§5). One filter closes both.

## 3. Everything else is REUSE (no new mechanism — the REQ's hard constraint)

- **The booking:** a normal `createBooking` with `bookingType: "SINGLE_SESSION"`, `courseId` set (the soft link),
  through `insertBooking` — so the availability gate + slot-clash + freelance-set checks apply unchanged (§37).
- **Revenue:** a `SINGLE_SESSION` already posts at day-end via `revenueItemRef(SINGLE_SESSION, priceGroup) →
  session-{group}` (`jobs.service.ts:77-90`) at its program price (1,690/1,390/1,090). **No new revenue path** (§40).
  *Stock-decrement* (if the item is stock-limited) rides on **REQ-035**; an unlimited item just posts revenue.
- **Freelance:** a `SINGLE_SESSION` is a consuming status → `reconcileBookingHolds` **draws** the ceiling on confirm,
  blocks at 0, exactly like any booking (§3). Existing.
- **Availability/clash picker:** reuse REQ-030's `GET /slots/availability` + the DB unique index (§41).

## 4. The action / endpoint
`POST /courses/:id/extra-session` `{ teacherId, subjectId, date, startTime }` → `createBooking({ bookingType:
"SINGLE_SESSION", courseId, ... })`. Distinct route from `/courses/:id/plan` (the quota engine) — the seam is
visible in the API, not just the UI. Returns the new booking; the course DTO is unchanged (extra shows on the course
view via `courseId`, but `summary`/`liveEndDate` don't move).

## 5. Q2 — soft-link: YES (my recommendation, matches the REQ's lean)
The extra **links to the course via `courseId`** so it shows on the course/plan view (context + reporting), but the
`COURSE_PACKAGE` filter (§2) guarantees it never counts. Fully-standalone (no link) would lose the course context the
owner wants; the soft link + filter gives both. So: soft-link.

## 6. Q1 — the honest go-live read (@Porter)
**Achievable for 2026-08-20, low-risk, additive — no protect-order needed.** It's **mostly wiring + one defensive
filter**, and it deliberately stays OUT of the reconcile engine:
- **BE (~0.5–1 day):** the `COURSE_PACKAGE` filter (the seam-keeper, ~3 call sites) + the `/extra-session` route.
  Revenue/freelance/availability are all existing paths.
- **FE (~1 day):** a separate **"Add extra session (charged)"** action on the plan/course surface, reusing the
  `SessionEditor`/availability picker from TASK-099, **visibly distinct** from "Insert" (different label + a "charged"
  affordance, so staff don't confuse quota-reschedule with a paid add).
- **The only dependency:** it rides on REQ-030's plan-modal FE (099/098), so it lands after those — but it's a small
  addition to that surface, not a fork. If the FE queue tightens, this is the kind of thing that slips a day, not the
  money core.
- ⚠️ **Testing note:** the seam-keeper touches the LIVE course engine (`reconcileCoursePlan`), so its filter change
  needs the same careful pass + the invariant re-verified (adding a SINGLE_SESSION extra leaves `courseCurrent`
  unchanged; cancelling it doesn't re-owe).

## 7. Tasks (cut now — HIGH, go-live)
- **BE TASK-112** — `COURSE_PACKAGE` filter on `reconcileCoursePlan`/`planCourseMoves`/`courseCurrent` (the seam-keeper,
  with the invariant tests) + `POST /courses/:id/extra-session` (SINGLE_SESSION booking, `courseId` soft-link, reuses
  availability/freelance/revenue). Tests: an extra leaves size/owed/end unchanged; its cancel doesn't re-owe; it draws
  freelance + posts single-session revenue.
- **FE TASK-113** — a visibly-separate "Add extra session (charged)" action on the plan/course surface, reusing the
  availability picker; confirm it's clearly distinct from "Insert".
