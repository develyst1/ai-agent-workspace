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

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-017 | Teacher bookings → phone calendar (subscription feed) [LINE-C] | MEDIUM | ⏸️ **DEPLOYED — acceptance INCOMPLETE, parked by stakeholder 2026-07-31** | **NOT delivered.** Deployed to `sid` (migration 0013 + `PUBLIC_CALENDAR_BASE_URL` + restart) and the teacher **does receive a private subscription link** from the LINE "ปฏิทิน" button ✅. **Blocked on real-device UX, not on the feed:** (1) **LINE does not linkify `webcal://`** — it links only from `develyst.online…`, dropping the scheme *and* the `som.` subdomain, so tapping fails; (2) the **Google Calendar mobile app cannot add a calendar by URL at all** (desktop web only), so Android/Google teachers realistically can't subscribe. `calendarUrls()` already returns **both** `https` and `webcal` — only `webcal` is sent today. **Whether events actually render was never confirmed.** Stakeholder: "ช่างมันไปก่อน" — revisit later. _Previously:_ **@Porter — deploy + acceptance.** TASK-044 **DONE** (Sober-verified 2026-07-31: journal audit 14=14, auth-boundary, stable `UID`, `STATUS:CANCELLED`, UTF-8-octet folding; tsc 0 / suite 173/0). **Deploy needs THREE steps:** (1) `bun run db:migrate` (0013) · (2) **set `PUBLIC_CALENDAR_BASE_URL`** — without it the link is relative and useless on a phone · (3) restart :4006. Then a teacher gets the link via LINE (`ปฏิทิน` / quick reply) or staff via `POST /api/teachers/:id/calendar-link` (`?rotate=true` kills the old link). ⚠️ Set expectations: **Google refreshes subscribed feeds slowly (hours)**; iPhone ~15 min. _Design:_ SPEC-014 (2026-07-30) — **per-teacher tokenized `.ics`** — `GET /api/calendar/:token.ics` mounted **auth-free** (same pattern as `publicCheckin`, before `authMiddleware`), window −30d/+90d, **stable `UID` per booking** so edits update rather than duplicate, `STATUS:CANCELLED` included so cancellations disappear from the phone, Asia/Bangkok with explicit TZ. Token = `teachers.calendar_token` (unique, rotatable; old link 404s) via migration **0013, journal-registered per the TASK-042 rule — no `db:generate`**. Link delivered via LINE (`ปฏิทิน`/`calendar` + quick reply) or a staff endpoint. **FYI → @Porter (non-blocking):** Google refreshes subscribed feeds **slowly (hours)** vs iPhone (~15 min) — fine per the AC, but worth telling คุณฟีน; near-real-time on Android = a separate heavier Google-API REQ. |
```
