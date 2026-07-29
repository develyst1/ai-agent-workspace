# REQ-017: Teacher bookings → phone calendar (subscription feed)  [LINE-C]
- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-29 by stakeholder (คุณฟีน — "ideally, put it on their phone calendar")
- Deadline: none
- Source: stakeholder direction 2026-07-29; hub UC-035 / WF-011 (Google Calendar sync = Planned/future).

## Problem / Goal
Teachers want their bookings to show up in **their phone's calendar app**, so they see their teaching schedule
alongside their personal calendar without opening the staff app / LINE.

## Requirement
1. Each teacher can get their teaching schedule into their **phone calendar** — bookings appear and stay
   **kept up to date** as they change.

## Acceptance Criteria
- [ ] A teacher can add their schedule to their phone calendar (a one-time setup), and their bookings appear.
- [ ] When bookings change, the phone calendar reflects it (within the sync/refresh interval).
- [ ] A teacher only sees their own bookings.

## Analysis / current state + recommendation (Porter — for Sober to verify)
- **Nothing exists today** — no `.ics`/iCal feed, no Google Calendar integration (UC-035/WF-011 Planned).
- ✅ **Feasible — recommend the light path:** a **per-teacher tokenized `.ics` subscription feed**
  (`GET /calendar.ics?token=…`), serialized from the existing `GET /api/bookings?teacherId&from&to`, reusing the
  existing per-user token pattern (`lib/checkin-token.ts`). The teacher adds the `webcal://…` link once; **any
  phone calendar** (Google / Apple) subscribes and auto-refreshes. **Small effort.**
- Heavier alternative = full **Google Calendar API** two-way sync (per-teacher OAuth) — much bigger; only if the
  stakeholder specifically wants events *written into* their Google account (vs a read-only subscription).

## Constraints
- Read-only subscription (bookings → calendar), not two-way, unless the stakeholder asks for Google two-way.
- The `.ics` link is a **secret per teacher** (tokened) — treat like a private URL.
- Distribute the link via LINE (REQ-015 rich menu) or the staff app.

## Out of Scope
- Two-way editing from the phone calendar back into the system.

## Questions
(SA + stakeholder.)
- OK with the **`.ics` subscription** approach (works on any phone, low effort), or do you specifically need
  **Google Calendar** two-way (heavier)?
