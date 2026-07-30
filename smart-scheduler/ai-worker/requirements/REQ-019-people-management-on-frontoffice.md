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
2. **Whose demographics do we record** — the **student** (the one who trains) or the **parent** (the paying
   customer), or both? (Porter's lean: the **student**, since the dashboard asks about the people attending; the
   parent keeps name/phone/province.)
3. **Required or optional** fields at creation? (Porter's lean: optional, so LINE self-registration and quick
   staff entry aren't blocked; coverage grows over time.)
4. **Province** = a Thai-province dropdown, and **nationality** = Thai/foreign flag (per the 2026-07-25 meeting)
   — confirm, given "ลูกค้านอกประเทศ" was raised.
