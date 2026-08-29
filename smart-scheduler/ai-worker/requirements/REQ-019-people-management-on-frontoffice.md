# REQ-019: People management on the frontoffice web — parents & students (with demographics + suspend)
- Status: READY_FOR_SA
- Priority: MEDIUM (normal queue — stakeholder: "ต่อคิว")
- Requested: 2026-07-30 by stakeholder (คุณฟีน)
- Deadline: none
- Source: stakeholder direction 2026-07-30. **SUPERSEDES REQ-012** (the LINE/LIFF demographics form) — the data
  is now captured here instead. Pairs with **REQ-020** (LINE pairing security).

## Problem / Goal
Teachers are managed on the frontoffice web, but **parents and students are not** — they only come into existence
through the LINE bot, and staff have no screen to see or correct them. At the same time we need to capture
customer **demographics** (for the SOM dashboard) and we need a way to **stop a bad or unwanted account**.

Goal: manage **people** in one place on the **frontoffice web**, next to teachers — parents, their students, and
the customer information the business needs.

## Requirement
1. Staff can **see all parents** and, under each parent, **their students** — search/browse, view details.
2. Staff can **create and edit** a parent and their students from the web (not only via LINE).
3. **Customer information is captured here**: **gender**, **date of birth** (age derived), **province**, and
   **nationality (Thai / foreign)** — for the student, and whatever of it applies to the parent.
4. Staff can **suspend** a parent account (and its access), and un-suspend it — without deleting history.
5. **Parents keep self-service creation via LINE — no approval step.** This screen is for **visibility and
   control after the fact**, per the stakeholder.
6. The captured information must be available to the dashboard/analytics (REQ-013).

## Acceptance Criteria
- [ ] A "people" area on the frontoffice web lists parents, with their students shown under them; searchable.
- [ ] Staff can add/edit a parent and a student, including gender, date of birth, province, nationality.
- [ ] Staff can **suspend / un-suspend** a parent; a suspended parent can no longer use the service (the exact
      effect is confirmed in Questions), and nothing is deleted.
- [ ] A parent created via LINE appears here immediately, and is editable.
- [ ] The new fields are readable by the dashboard (REQ-013 demographics).
- [ ] No regression to the existing teacher-management screen or to LINE parent self-registration.

## Analysis / current state (Porter, read-only — for Sober to verify)
- **No parents/students screen exists** on the frontoffice web; the nav has calendar, teachers, bookings, badges,
  dashboard, reports. Students appear only inside booking flows.
- `public.students` = {name, nickname, parentId, lineUserId, crmPoints, crmLevel, note, …};
  `public.parents` = {phone, name, lineUserId, note, …}. **gender / DOB / province / nationality do not exist** —
  all four are new (this is the REQ-012 finding, now landing here).
- There is **no suspend/disable concept** for a parent today.
- Backend already has `GET /students?q=` (name/nickname/parent phone) and parent/student services to build on.
- Placement decision (**frontoffice**, confirmed by Porter's recommendation + stakeholder): teacher management is
  already here, this is **daily staff work**, and the backoffice is reserved for money/executive use.

## Constraints
- Frontoffice web (`smart-scheduler-front` + scheduling API). **Money/finance stays on the backoffice.**
- Parents self-register via LINE — do **not** put an approval gate in front of them (that's teachers only, REQ-020).
- Suspending must never delete bookings, students, or history.
- HOW (schema shape, screen layout, what "suspended" blocks) is the SA's design.

## Out of Scope
- Teacher LINE pairing/approval and unlinking → **REQ-020**.
- The dashboard charts themselves → REQ-013.
- Changing teacher management (already built).

## Questions
(SA + stakeholder. Porter answers as `> answer: ...`; business calls → `@Porter`, don't guess.)
1. **What should "suspend a parent" actually stop?** (a) their LINE bot access only, (b) also block new bookings
   for their students, or (c) hide them from day-to-day lists entirely? (Porter's lean: (a)+(b) — stop the account
   acting, keep the history visible.)
   > **answer (Porter, from คุณฟีน) — the definition of "suspended" has now been settled in three steps:**
   > 1. **2026-08-01 (a)+(b):** blocks **LINE bot access** and **new bookings** for their students. History,
   >    bookings and students stay intact and visible. Reversible. **Enforced server-side**, not hidden in the UI.
   > 2. **2026-08-01:** their students are **NOT listed in the booking picker at all** (not shown-disabled) —
   >    คุณฟีน: *"แล้วเขากดระงับไปทำไม"*. The People screen is where suspended families remain visible.
   > 3. **2026-08-01 — EXTENSION: a suspended family may NOT BUY a course or voucher either.** คุณฟีน:
   >    *"ไม่ควรซื้อได้"*. Rationale: selling a course they cannot schedule is taking money for something we
   >    can't deliver — a refund conversation we'd be creating for ourselves. Staff un-suspend first, then sell.
   >
   > ⚠️ **Note for whoever implements #3:** the selling screens (CreateCourseModal / CreateVoucherModal) share
   > the `GET /students?q=` picker with other, non-selling uses — Sober flagged this exact trap on TASK-056. So
   > this must **not** be a blanket filter on that shared endpoint; scope it to the selling flows deliberately.
   > **Existing** courses/vouchers a suspended family already owns are untouched (consistent with #1 —
   > suspension stops new activity, it never erases what exists).
2. **Whose demographics do we record** — the **student** (the one who trains) or the **parent** (the paying
   customer), or both? (Porter's lean: the **student**, since the dashboard asks about the people attending; the
   parent keeps name/phone/province.)
3. **Required or optional** fields at creation? (Porter's lean: optional, so LINE self-registration and quick
   staff entry aren't blocked; coverage grows over time.)
4. **Province** = a Thai-province dropdown, and **nationality** = Thai/foreign flag (per the 2026-07-25 meeting)
   — confirm, given "ลูกค้านอกประเทศ" was raised.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-019 | People management on the frontoffice web — parents & students (demographics + suspend) | MEDIUM | ✅ **DELIVERED** (+1 follow-up in build: **TASK-058/059 — the sell-side block**, scoped 2026-08-01) — **re-acceptance PASSED 2026-08-01** (stakeholder ran, Porter verified): suspend → students gone from **all four** booking tabs · **still present in the SALE modals** (correct) · un-suspend → back · **walk-in students visible throughout** · the backend `400` now renders as a red message. Create/edit of parents + students passed in the earlier round. _Previously: SPEC_DONE, blocker cleared_ (both defects closed: the swallowed error by TASK-052, the picker by TASK-056+TASK-057) | **@Porter — RE-ACCEPTANCE (not a fresh round). All fixes DONE 2026-08-01: TASK-056 (BE) + TASK-057 (FE), and the error-surfacing came free with TASK-052.** ⚠️ **Re-acceptance script:** suspend a household → their students vanish from **all four** booking tabs, but are **still listed** in the course/voucher **SALE** modals and in full on the People screen → un-suspend → they return everywhere; a **walk-in student (no parent) stays visible throughout**; and the suspend `400` now shows as a **red message**, not a dead Save button. _Diagnosis note: this was NOT an FE fix._ 🔎 **Sober traced both defects: (1) the swallowed error is ALREADY FIXED** — TASK-052 added a **generic** `ApiClientError → red alert` catch on booking submit (`BookingModal` handleSubmit), which surfaces *any* backend rejection incl. this `400`; the acceptance ran against a build **without** TASK-052, so this needs **no new work**, only the pending deploy. **(2) The picker gap is a BACKEND fix**: "is this household suspended" is a domain rule that already exists server-side (`lib/suspend.ts`), so filtering it in the browser would be a second copy that drifts — same reasoning as TASK-051. ⚠️ **And it is wider than REQ-019: REQ-022 shipped two NEW pickers today and neither filters suspension** (`getEligibleStudents` filters entitlement only; `searchStudents` has no clause) — all four booking tabs are affected. ⚠️ **`GET /students` must NOT be blanket-filtered**: I traced the callers — `StudentSelect` also backs **CreateCourseModal / CreateVoucherModal**, i.e. *selling*, and hiding suspended families there is a scope change nobody decided (a voucher sale creates no booking). So TASK-056 filters `/students/eligible` unconditionally + adds an **opt-in flag** on `/students`. ❓ **Non-blocking Q for คุณฟีน: should a suspended family be able to BUY a course/voucher at all?** Today they can; I have deliberately not changed it. _Acceptance 2026-08-01:_ **create + edit PASS** (incl. the paths never click-driven in review). **Suspend: backend CORRECT** — booking a suspended parent's student returns `400 VALIDATION "บัญชีผู้ปกครองถูกระงับ…"`, enforced server-side as specced ✅. **But the FE fails it:** (1) that error is **never shown** — Save appears to do nothing, so staff read it as a broken button; (2) a suspended parent's **students still appear in the booking picker**, so the block is only discovered at Save. Blocked-but-silent ≠ working. ✅ **PICKER DECISION SETTLED 2026-08-01 (applies to REQ-019 AND REQ-022 Q1): HIDE them — a suspended parent's students are NOT listed in the booking picker at all** (no disabled row). คุณฟีน: *"แล้วเขากดระงับไปทำไม"* — suspension is a deliberate decision, so the picker shouldn't re-surface it; Porter conceded (his "where did the child go?" concern belongs on the **People screen**, where suspended families stay fully visible). **Hold two things:** the server-side `400` stays regardless (hiding is convenience, the API is the guarantee), and **error surfacing is still required** — that was the actual defect. Note by design: suspension blocks **new** bookings only; already-booked sessions remain on the calendar. Also worth checking whether the booking flow swallows **all** backend errors, not just this one. _Previously:_ **@Porter — deploy + acceptance.** TASK-048 (BE) + TASK-049 (FE) both DONE & Sober-verified (BE: suspend gate audited across **every** booking-insert path, journal 15=15, tsc 0 / suite 181/0 · FE: tsc 0 / build ok, province label unmistakable vs the badge, badge untouched, age derived). **Deploy:** `bun run db:migrate` (0014) → restart :4006 → deploy the frontoffice. **⚠️ Acceptance must include a create/edit click-through:** Fern exercised list · search-by-child · suspend/un-suspend · TH/EN · derived age **live**, but the **create/edit form modals could not be click-driven** (the Browser pane runs hidden; Mantine `Select`/`DatePickerInput` need a composited pane). Honestly reported, and the components are the same ones already shipped in `TeacherFormModal`/`BookingModal` — so I accepted it, **but the live create/edit path is unproven and belongs in your acceptance pass.** _Build history:_ **@Jason TASK-048 (BE) → @Fern TASK-049 (FE).** SPEC-016 ACTIVE — Q1/Q2 answered 2026-07-31. **Q1:** suspend blocks LINE bot + new bookings, history kept, reversible, **server-side**. **Q2 (Porter refined, I accepted):** gender/DOB/nationality → **student**, **province → parent** (household address; avoids sibling duplication/drift). ⚠️ **My condition, now baked into the tasks:** `students.parentId` is **nullable by design** (walk-in/First-Trial), so any province-by-student aggregation must **LEFT-join with an explicit "unknown" bucket** — otherwise the trial cohort silently vanishes from REQ-013, the same failure Porter found in the badge report. ⚠️ Also: the FE province label must be unmistakable vs the existing per-booking **`จังหวัด` badge**; REQ-013 reads `parents.province` **only**. Verified as-built: BE has **only** `GET /students?q=` + `POST /students` — **no parent endpoint at all**; FE has no people screen; the 4 demographic fields and any suspend concept **don't exist**. Design = one additive migration (journal-registered, **no `db:generate`**) + `GET/POST/PATCH /parents(/:id)` + `/parents/:id/students` + suspend/unsuspend, and a `/scheduler/people` screen (parents with their students underneath, search, modals) following the Teachers-screen patterns. **Deliberately NOT staged** (unlike REQ-020): splitting would build the same forms twice and unblocks nothing, since REQ-020 Stage 2 is independently blocked on its own dual-role question. **2 load-bearing Qs → @Porter → คุณฟีน: (Q1)** what "suspend" actually blocks (my rec = his lean: LINE bot **and** new bookings; nothing deleted) · **(Q2)** whose demographics — student / parent / both (my rec: **student**; it decides which table the migration touches). **Q3/Q4 I'm proceeding on** (fields optional; province dropdown + Thai/foreign flag). _Porter's original:_ Stakeholder 2026-07-30: manage **parents + their students on the frontoffice** next to teachers; capture **gender / DOB / province / nationality** here (replaces REQ-012's LINE form); staff can **view + suspend** a parent. **Parents keep self-service LINE creation — NO approval gate** (stakeholder's call). Feeds REQ-013's demographics. Qs: what "suspend" blocks; whose demographics (student vs parent); required/optional; province dropdown + Thai/foreign flag.  **➕ FOLLOW-UP SCOPED 2026-08-01 (Sober):** คุณฟีน answered the last open half — a suspended household **may not BUY** ("ไม่ควรซื้อได้"). Verified as-built: **`createVoucher` has NO suspend gate at all**, and `createCoursePackage` only fails *incidentally* because the sessions it creates hit `insertBooking`'s booking gate — **incidental enforcement is not enforcement**. → **TASK-058** (BE: gate both sale paths after `resolveStudentId` and **before the revenue post**, reusing `lib/suspend.ts`; walk-in students never blocked) + **TASK-059** (FE). ⚠️ **I am also retiring my own `bookable` flag**: I introduced it *because* the sell-side answer was open and blanket-filtering a shared endpoint would have changed screens nobody had decided about — right then, obsolete now. With all three consumers wanting the same thing, an opt-in policy flag just means "remember to ask for the policy", so **exclusion becomes the default** and no `includeSuspended` lever is being built on speculation. **No deploy-order hazard this time** (an old client still sending `bookable` is ignored, not rejected). **Out of scope, stated:** top-ups/extensions of an existing entitlement are not "buying" — separate REQ if she wants them blocked. |
```
