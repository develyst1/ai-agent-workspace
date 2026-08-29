# REQ-037: Add a one-time EXTRA session to a course — charged (single-session sale), does NOT use the course quota

- Status: READY_FOR_SA
- Priority: HIGH (owner wants it **in the 2026-08-20 go-live**)
- Requested: 2026-08-04 by คุณฟีน (stakeholder)
- Related: REQ-030 (course = editable plan) · REQ-035 (sell-side item, `SINGLE_SESSION` kind)

## Problem / Goal
REQ-030 gives a course a fixed `size` of teachable sessions, and "Insert" **reschedules within that size**
(it pulls from the tail — the last week — so the total stays `size`). That is the **quota** path.

The owner wants a **second, distinct** way to add a day to a course student: an **extra one-time session that does
NOT draw the course quota** (does not shrink the tail). The family simply **buys one more session** on top of the
course. Owner's words: *"มันมีการเพิ่มวัน โดยไม่ใช้ quota ด้วย … จองเพิ่มโดยเป็นจองแบบ one-time … คิดเงินเพิ่ม (ขายคาบเดี่ยว)."*

So there are two clearly-different "add a day" actions, and staff must not confuse them:
1. **Insert (uses quota)** — REQ-030. Reschedule within `size`; pulls from the last week; total unchanged. *(No new money.)*
2. **Add extra one-time session (this REQ)** — a **paid single-session sale**; `size` and the course end date are
   **unchanged**; it's an additional booking.

## Requirement
1. From the course context (the plan modal / course card), staff can **"Add extra session (charged)"** — clearly
   separate from "Insert" (quota reschedule). Pick day/time/teacher via the same availability+clash view.
2. It is a **single-session SALE** — reuse REQ-035's `SINGLE_SESSION` `kind`: it **posts revenue** at its own price
   and (if stock-limited) decrements stock; an unlimited item just posts revenue.
3. It **draws the freelance budget** like any taught session (a teacher teaches it) — same ceiling rules as every
   booking; blocked/consumes exactly as a normal session does.
4. It does **NOT** change the course's `size`, its owed count, or its derived end date. The course plan's
   "6 stays 6" invariant is **untouched** — this session lives *beside* the plan, not inside it.
5. Cancel/refund of the extra session behaves like a single-session cancel (releases its own hold; no course re-owe).

## Acceptance Criteria
- [ ] "Add extra session" is a visibly separate action from "Insert", from the course/plan surface.
- [ ] Adding one posts revenue at the single-session price and (if capped) decrements stock; cancel restores/reverses.
- [ ] It draws the freelance ceiling like a normal booking (blocks at 0 as usual).
- [ ] The course's `size`, owed count, and end date are **unchanged** after adding one.
- [ ] Standard availability/clash/no-double-booking guards apply to the chosen slot.

## Constraints
- **Reuse REQ-035 `SINGLE_SESSION` + the sale/revenue path** — do not invent a second money mechanism.
- **Reuse REQ-030's availability/clash slot picker** — same UX, different action semantics (additive, not reconcile).
- Keep it **out of** `reconcileCoursePlan` (that engine owns quota; this is additive) — the seam must stay clean.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
- SA: **Go-live timeline** — owner wants this in the 16-day window. Give the honest read (is it mostly wiring the
  existing single-session sale to the course surface, or more?), and flag if it pressures 2026-08-20 so Porter can
  set expectations — same protect-order discipline as REQ-030.
- SA: Does the extra session **link to the course** (for context/reporting) or stand fully alone as the student's
  single-session booking? Recommend a soft link (shows on the course view) without counting toward `size`.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-037 | Add an EXTRA one-time session to a course — charged (single-session sale), does NOT use the course quota | 🔴 **HIGH** | ✅ **DELIVERED** (deployed `sid` 2026-08-10 + Tanya post-deploy acceptance PASS; revenue-post re-check after next day-end, non-blocking). 🧪 `TEST_PASSED`. **Visibly separate, measurably so:** “**Add extra (charged)**” grape `rgb(134,46,156)` on `rgb(243,217,250)`, 165 px, beside blue “**Insert make-up**” (139 px) — different label AND colour, so a paid add can't be mistaken for a quota reschedule. Adds a **`SINGLE_SESSION`** (201), row badged **EXTRA** with **no Mark absence**; **`size` 4→4 · counted 4→4 · end unchanged**; **cancelling it does NOT re-owe** (verified on two separate extras). ⚠️ **`NOT TESTED`: the revenue posting itself** — it rides the existing day-end `revenueItemRef` path and triggering that scheduled job is not mine to run; I verified the booking shape it consumes. **@Porter — re-check after the next day-end, or owner's P&L eyeball?** **→ ready to mark DELIVERED.** _Prior:_ **SPEC_DONE — `SPEC-033`; TASK-112/113 cut** | A **second, distinct** "add a day": a **paid single-session ON TOP** of the course that does **NOT** shrink the tail — vs REQ-030 "Insert" which reschedules within `size`. Charged (posts revenue, REQ-035 `SINGLE_SESSION`), draws freelance like any booking; **`size`/owed/end UNCHANGED**. 🗓️ **Timeline (Sober): achievable for go-live, additive, NO protect-order** — BE ~0.5–1d (one seam-keeper: `reconcileCoursePlan` counts only `COURSE_PACKAGE` so the extra never counts/re-owes), FE ~1d (a "Add extra session (charged)" action, visibly distinct from Insert, reusing the 099 picker; rides on 099/098). Soft-link via `courseId` (shows on course view, never counts). **@Jason — TASK-112 dep-free (careful pass, touches the LIVE course engine).** |
```
