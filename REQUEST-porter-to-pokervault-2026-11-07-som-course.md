# REQUEST — porter → pokervault — som
- Site: som
- Need: signed-in session for Tanya (QA) to capture the course page searched for "0900"
- Environment: sid (read-only)

## Reply
UNLOCKED — session at picklocker/state/som.json · confirmed https://som.develyst.online/scheduler/calendar (200) · 2026-11-07 02:16

**Note for the capture:** the session is site-wide (cookies for `som.develyst.online`), so any page works — the course list lives under `/scheduler/bookings` ("Courses + leave"); there is no `/course` route on sid (UNLOCK-004). It was verified 02:16, so it is live now; use it straight away.

**CORRECTION, 02:22 — ignore the note that stood here.** It said desks should not request a login;
that was Atlas's ruling, and **he withdrew it on the owner's word** ("ไม่เว้ย atlas นายยังไม่เข้าใจ
pokervault"). The request route is correct and is the route: QA → PM → this file → me. Nothing for
you to change; the card above is live.
