# SPEC-014: Teacher bookings → phone calendar (tokenized `.ics` subscription)
- Source: REQ-017
- Status: ACTIVE

## Overview
Give each teacher a private, self-refreshing calendar subscription so their teaching schedule appears in their
own phone calendar. **Design = the light path Porter recommended and the REQ's Constraints already default to:**
a **per-teacher tokenized `.ics` feed** the phone subscribes to — not Google two-way (that would need per-teacher
OAuth and is a much larger, different REQ; the REQ says read-only "unless the stakeholder asks for Google
two-way"). BE-only.

**As-built verified:**
- **No `.ics` / iCal / Google integration exists** — greenfield (grep: 0 hits).
- There is an established **auth-free public route pattern**: `routes/checkin.ts` is mounted as
  `app.route("/api", publicCheckin)` **before** `app.use("/api/*", authMiddleware)` (`index.ts:41` vs `:48`).
  The feed mounts the same way — the token in the URL *is* the credential.
- Token precedent: `bookings.checkinToken` (text column + unique index, `lib/checkin-token.ts`). The feed needs
  a **per-teacher, long-lived, rotatable** token — same shape, different lifetime.
- The teacher's bookings query already exists (`bookings_teacher_date_idx`), and **TASK-043 (REQ-016)** is adding
  `findBookingsForTeacher(lineUserId, from, to)` — the feed reuses that lookup shape by teacher id.

## API / Interface
- **`GET /api/calendar/:token.ics`** (public, no JWT — mounted before `authMiddleware`).
  → `text/calendar; charset=utf-8`, a `VCALENDAR` of the teacher's bookings. `404` on unknown/rotated token
  (never reveal whether a token merely expired vs never existed).
- **`POST /api/teachers/:id/calendar-link`** (authenticated, staff): get-or-create the teacher's token and return
  the `webcal://…/api/calendar/<token>.ics` + `https://` URLs. **`?rotate=true`** issues a new token and
  invalidates the old link.
- **Delivery to the teacher via LINE** (REQ-015): keyword `ปฏิทิน` / `calendar`, plus a quick reply on the
  teacher-schedule reply from TASK-043 → the bot replies with their `webcal://` link + one-line "add to your
  phone calendar" instructions (TH/EN via `line-i18n`).

## Data Model
- `teachers.calendar_token` — `text`, nullable, **unique index**. Additive.
- Migration `drizzle/0013_teacher_calendar_token.sql`: `ADD COLUMN IF NOT EXISTS` + `CREATE UNIQUE INDEX IF NOT
  EXISTS`, hand-authored **and registered in `drizzle/meta/_journal.json`** (idx 13) — per the rule TASK-042 just
  established in `drizzle/README.md`. **Do NOT run `db:generate`** (it would re-emit the whole schema). BE does
  not apply it; the human runs `bun run db:migrate` at deploy.

## Flow
1. **Token:** cryptographically random, ≥128 bits, URL-safe; stored on the teacher row; get-or-create on demand;
   `rotate` replaces it (old link 404s immediately). It is a bearer secret — anyone with the URL sees that
   teacher's schedule, so: no listing endpoint, no token in logs, `Cache-Control: private, no-store`.
2. **Feed window (bounded, so the file stays small and fast):** bookings from **today − 30 days** to
   **today + 90 days**.
3. **VEVENT per booking** — the part that makes "stays up to date" actually work:
   - **`UID` stable per booking id** (e.g. `booking-<id>@smart-scheduler`) so an edit **updates** the existing
     event instead of creating a duplicate;
   - `DTSTART`/`DTEND` from date + start/end time in **Asia/Bangkok** (emit with `TZID`, or as UTC — be
     explicit; do not emit floating times);
   - `SUMMARY` = student + sport/subject; `DESCRIPTION` may add the status; `LAST-MODIFIED`/`DTSTAMP` +
     `SEQUENCE` bumped on change;
   - **`CANCELLED` bookings are included with `STATUS:CANCELLED`** (not omitted) — a subscriber then *removes*
     the event; silently dropping it leaves a cancelled class sitting on the teacher's phone.
4. **Isolation:** the token resolves to exactly one teacher; the query filters by that teacher id only. No
   teacher id is ever accepted from the URL/query.

## Non-functional
- Read-only; no business-logic change. Response is generated per request (no cache table); the query is indexed
  and window-bounded.
- ⚠️ **Refresh latency is client-controlled**: Apple/iOS lets the user pick (as low as ~15 min); **Google
  Calendar refreshes subscribed feeds on its own schedule — often hours**. This satisfies the REQ's AC ("within
  the sync/refresh interval") but sets a real expectation — see ## Questions.

## Tasks
- TASK-044: scheduling (BE) — `calendar_token` + migration (journal-registered), `GET /api/calendar/:token.ics`,
  the staff get/rotate endpoint, and the LINE delivery of the link. (Jason)
  (depends on: **TASK-043** — reuses the teacher-schedule lookup + adds the quick reply to its reply)

## Questions
(Sober asks; Porter answers as `> answer: ...`)
- **Non-blocking, but worth telling คุณฟีน before teachers use it — the honest version of the REQ's question.**
  The REQ asked "`.ics` or Google two-way?"; its own Constraints already default to read-only `.ics`, and that's
  what I've specced (any phone, small, no OAuth). The thing that actually decides whether teachers are happy is
  **refresh latency**: on iPhone it's user-configurable (~15 min), but **Google Calendar can take hours** to pick
  up changes. So a booking changed at 09:00 may not appear on an Android teacher's calendar until much later.
  - If that's acceptable → nothing to do, ship as specced.
  - If she needs **near-real-time** on Android, that is a different, much heavier build (Google Calendar API +
    per-teacher OAuth + write-back) and should be its **own REQ** — the `.ics` feed remains useful either way,
    so this work is not wasted.
  I'm proceeding with `.ics`; flag it if she wants the heavier path.
