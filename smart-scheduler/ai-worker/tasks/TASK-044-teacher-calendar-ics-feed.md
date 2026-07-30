# TASK-044: scheduling (BE) — per-teacher `.ics` calendar subscription feed
- Source: SPEC-014 (REQ-017)
- Status: DONE  (reviewed 2026-07-31 by Sober — migration/journal audit, auth-boundary, UID + STATUS:CANCELLED + UTF-8 folding verified; tsc 0 / suite 173/0; see ## Review)
- Depends on: **TASK-043** (reuses the teacher-schedule lookup; adds a quick reply to its reply) — DONE
- Assignee: @Jason (smart-scheduler-back, port 4006)

## What to do
Give each teacher a private, self-refreshing `.ics` subscription so their bookings land in their phone calendar.
Read-only, BE-only. **No Google OAuth** — that's a separate (much heavier) REQ if the stakeholder ever asks.

**1. Token — `teachers.calendar_token`** (`text`, nullable, **unique index**):
- Migration `drizzle/0013_teacher_calendar_token.sql` — `ADD COLUMN IF NOT EXISTS` + `CREATE UNIQUE INDEX IF NOT
  EXISTS`, hand-authored, and **registered in `drizzle/meta/_journal.json` as idx 13**.
  ⚠️ **Per `drizzle/README.md` (the rule you just established in TASK-042): do NOT run `db:generate`** — it would
  re-emit the entire schema. Hand-write the SQL + the journal entry, exactly like 0012.
- **Do not apply it** (brownfield) — the human runs `bun run db:migrate` at deploy. State that in your notes.
- Token: cryptographically random, ≥128 bits, URL-safe. Get-or-create per teacher; **rotating** issues a new one
  and the old link must 404 immediately.

**2. Public feed — `GET /api/calendar/:token.ics`:**
- Mount it **auth-free**, the same way `publicCheckin` is (`app.route("/api", …)` **before**
  `app.use("/api/*", authMiddleware)` in `index.ts`) — the token in the URL *is* the credential.
- Unknown/rotated token → **404** (don't distinguish "expired" from "never existed").
- `Content-Type: text/calendar; charset=utf-8`, `Cache-Control: private, no-store`. Never log the token.
- **Window:** bookings from **today − 30d** to **today + 90d** (keeps the feed small; the teacher-date index
  covers it).
- **Isolation:** the token resolves to exactly one teacher and the query filters by that id — never accept a
  teacher id from the URL/query (same rule as the TASK-038 pickers).

**3. VEVENT serialization — this is what makes "stays up to date" real:**
- **`UID` stable per booking id** (e.g. `booking-<id>@smart-scheduler`) → an edit **updates** the existing event
  instead of creating a duplicate. Bump `SEQUENCE` + `LAST-MODIFIED`/`DTSTAMP` on change.
- `DTSTART`/`DTEND` from date + start/end time in **Asia/Bangkok** — emit with an explicit `TZID` (or as UTC);
  **no floating times**.
- `SUMMARY` = student + sport/subject; status in `DESCRIPTION` if useful.
- **Include `CANCELLED` bookings with `STATUS:CANCELLED`** so subscribers *remove* them — dropping them silently
  leaves a cancelled class on the teacher's phone.
- Escape text per RFC 5545 (commas/semicolons/newlines) and fold long lines — a malformed feed fails silently in
  calendar apps, which is painful to debug later.

**4. Getting the link to the teacher:**
- **Staff/authenticated:** `POST /api/teachers/:id/calendar-link` → returns the `webcal://` + `https://` URLs
  (get-or-create); **`?rotate=true`** → new token, old link dead.
- **LINE (REQ-015):** keyword `ปฏิทิน` / `calendar` **and** a quick reply on TASK-043's teacher-schedule reply →
  the bot replies with the teacher's `webcal://` link + a one-line "add to your phone calendar" hint.
  All strings TH/EN in `line-i18n` (no literal outside the table).

## Definition of Done
- [ ] A teacher can obtain their link (LINE keyword/quick reply, or the staff endpoint) and subscribe on a phone;
      their bookings appear.
- [ ] Editing/cancelling a booking updates the **same** event on re-fetch (stable `UID`; cancelled events carry
      `STATUS:CANCELLED`) — no duplicates.
- [ ] The feed returns only that teacher's bookings, within the −30d/+90d window; an unknown or **rotated** token
      → 404; rotation invalidates the old link.
- [ ] Migration `0013_*` is hand-authored **and journal-registered** (idx 13), additive/idempotent, **not
      applied** here; `db:generate` was **not** run.
- [ ] `bunx tsc --noEmit` clean; `bun test` green — add pure tests for the serializer (UID stability, TZ/format,
      escaping/folding, `STATUS:CANCELLED`, window filtering). The HTTP + phone subscription are deploy/OA smoke;
      state the smoke steps (e.g. validate the output with an iCal validator + subscribe once on a real phone).

## Implementation Notes

Read-only subscription feed; **no Google OAuth** (that stays a separate REQ, per your Questions). Six pieces:

**1. Token — `teachers.calendar_token`.** Schema field added; migration **`drizzle/0013_teacher_calendar_token.sql`**
— `ADD COLUMN IF NOT EXISTS` + `CREATE UNIQUE INDEX IF NOT EXISTS … WHERE calendar_token IS NOT NULL` (partial,
so the many NULLs don't collide) — **hand-authored and registered as idx 13 in `meta/_journal.json`**, per the
rule TASK-042 established. **`db:generate` was NOT run.** Re-ran the folder audit: **14 journal entries = 14
`.sql`**, idx contiguous 0–13, no orphans either way. **NOT applied here** (brownfield) — the human runs
`bun run db:migrate`. Token = `randomBytes(24).toString("base64url")` → **192 bits**, URL-safe.

**2. Feed — `GET /api/calendar/:token.ics`** (`routes/calendar.ts`), mounted `app.route("/api", publicCalendar)`
**before** `app.use("/api/*", authMiddleware)` — the same auth-free pattern as `publicCheckin`. Unknown **or
rotated** token → **404** (indistinguishable). `Content-Type: text/calendar; charset=utf-8`,
`Cache-Control: private, no-store`. **The token is never logged.** Window **today−30d … today+90d**.
**Isolation:** the token resolves to exactly one teacher and the query filters by that id — no teacher id is
ever read from the URL/query.

**3. Serialization — `lib/ics.ts` (pure).** **Stable `UID: booking-<id>@smart-scheduler`** → an edit *updates*
the event instead of duplicating. `SEQUENCE` from `bookings.updatedAt` (epoch seconds, monotonic) +
`LAST-MODIFIED`/`DTSTAMP`. **Times emitted as UTC (`…Z`)** — Thailand is UTC+7 with no DST, so the conversion is
exact and needs **no `VTIMEZONE`** (the usual source of broken feeds); never floating. `SUMMARY` = student ·
subject, status in `DESCRIPTION`. **`CANCELLED` bookings are included with `STATUS:CANCELLED`** so subscribers
*remove* them (PENDING→`TENTATIVE`, everything else→`CONFIRMED`). RFC 5545 escaping (`\ ; ,` + newlines) and
**75-octet folding counted in UTF-8 bytes** — critical here, since Thai names are 3 bytes/char and char-based
folding would emit over-long lines that stricter clients reject.

**4. Staff endpoint — `POST /api/teachers/:id/calendar-link`** (authenticated) → `{ https, webcal, rotated }`;
**`?rotate=true`** issues a new token, which 404s the old link immediately.

**5. LINE delivery (REQ-015 style).** Keyword **`ปฏิทิน` / `calendar`** *and* a **"ปฏิทินของฉัน / My calendar"
quick reply on TASK-043's teacher-schedule reply** → the bot replies with the teacher's **`webcal://`** link plus
a one-line "add to your phone calendar" hint and a *don't share this* warning. Token resolved from the caller's
own `lineUserId` (created on first ask), never from the payload. New i18n keys `btn_calendar` / `cal_link` /
`cal_not_teacher` in **TH+EN**; `calendar` added to `KNOWN_POSTBACK_ACTIONS` so it isn't logged as UNHANDLED.

**6. Config:** added **`PUBLIC_CALENDAR_BASE_URL`** to `.env.example` (falls back to `PUBLIC_CHECKIN_BASE_URL`).

### Deploy steps (human)
1. **`bun run db:migrate`** — applies 0013 (re-runnable, idempotent, **no psql**).
2. Set **`PUBLIC_CALENDAR_BASE_URL`** (e.g. `https://som.develyst.online`) — without it the link is relative and
   unusable on a phone.
3. Redeploy scheduling-back (:4006). Teachers then get their link from LINE (`ปฏิทิน` or the quick reply), or
   staff can fetch it via `POST /api/teachers/:id/calendar-link`.

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **173 pass / 0 fail** (31 files).
- New tests: **`ics.test.ts` (14)** — UTC conversion incl. the early-slot previous-UTC-day case, escaping,
  folding (ASCII **and** a Thai line asserted ≤75 octets *and* not splitting a character), stable UID across an
  edit, `STATUS:CANCELLED` retained, PENDING→TENTATIVE, SEQUENCE advancing, empty feed still valid;
  **`calendar-link.test.ts`** (https/webcal shape, trailing-slash, `.ics` parsing → 404 cases);
  **`routes/calendar.route.test.ts`** — drives the real Hono route with the service stubbed: valid token → 200
  `text/calendar` + `private, no-store` + the expected UID/DTSTART; **unknown/rotated → 404**; non-`.ics` → 404.
- ✅ **Ran a real feed through a structural check** (generated output, not just unit assertions): every line
  **≤75 octets**, **CRLF-only**, `BEGIN/END:VEVENT` balanced, `;` `,` `\` all escaped, and the cancelled booking
  present with `STATUS:CANCELLED` — including a long Thai name and a subject containing `;` and `,`.
- ⚠️ **Not run against a live DB or a real phone** (brownfield). **Deploy/OA smoke:** paste the feed into an iCal
  validator; subscribe once on a phone (iOS: the `webcal://` link → Subscribe); edit a booking → the **same**
  event updates (no duplicate); cancel one → it **disappears** from the phone; `?rotate=true` → the old URL 404s
  and the new one works.

**DoD:** teacher gets the link via LINE or the staff endpoint and can subscribe ✓ · edits update the same event,
cancels carry `STATUS:CANCELLED` (stable UID) ✓ · only that teacher's bookings, −30d/+90d, unknown/rotated →
404 ✓ (route-tested) · 0013 hand-authored + journal-registered idx 13, idempotent, **not applied**, `db:generate`
not run ✓ · tsc clean + `bun test` green with serializer tests ✓ · smoke steps stated ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- Read-only subscription only — **do not** add Google OAuth/two-way write-back; if that ever becomes the ask it's
  a separate REQ (SPEC-014 `## Questions` has the reasoning, and Porter is flagging the refresh-latency caveat to
  the stakeholder).
- If a phone/calendar client turns out to reject something in the feed during smoke, flag it here — feed
  formatting bugs are easy to fix but hard to notice.

## Review
(Sober fills at REVIEW.)
**Verdict: DONE ✅ (Sober, 2026-07-31).** Correct on the details that decide whether an `.ics` feed actually
works in the wild — and the migration followed the rule we just wrote.
- **Migration discipline held (the TASK-042 rule's first real test):** `0013_teacher_calendar_token.sql` is
  hand-authored, `ADD COLUMN IF NOT EXISTS` + `CREATE UNIQUE INDEX IF NOT EXISTS`, **registered as idx 13** — I
  re-ran the audit: **14 journal entries = 14 `.sql`**, contiguous, no orphans. `db:generate` was **not** run,
  and it isn't applied here (human runs `db:migrate`). Exactly right.
- **Auth boundary verified in `index.ts`:** `app.route("/api", publicCalendar)` at `:43` sits **before**
  `app.use("/api/*", authMiddleware)` at `:50` — same pattern as `publicCheckin`, so the token in the URL is the
  credential. Unknown **or rotated** token → 404 (indistinguishable), `Cache-Control: private, no-store`, and
  **the token is never logged** (grep). Isolation: the token resolves to one teacher; no id is read from the URL.
- **The two details I called out in the spec are both right:** stable **`UID: booking-<id>@…`** (edits update
  rather than duplicate, with `SEQUENCE` from `updatedAt`), and **`STATUS:CANCELLED` emitted** (`veventStatus`
  maps CANCELLED→CANCELLED, PENDING→TENTATIVE, else CONFIRMED) so a cancelled class actually **disappears** from
  the teacher's phone instead of lingering.
- **Two judgement calls of his that I'd have had to ask for otherwise — both correct:**
  (a) **UTC (`…Z`) instead of `VTIMEZONE`** — Thailand is UTC+7 with no DST, so the conversion is exact and it
  sidesteps the most common source of malformed feeds; (b) **folding counted in UTF-8 octets** (`TextEncoder`,
  ≤75) — with Thai names at 3 bytes/char, char-based folding would emit over-long lines that stricter clients
  silently reject. That's the kind of failure that would have surfaced as "it just doesn't work on some phones".
- **Verified myself:** `bunx tsc --noEmit` → 0; full `bun test` → **173/0** (up from 152).
- **HTTP + real-phone subscription are deploy/OA smoke** (brownfield) — accepted, steps documented.
- **TASK-044 → DONE ⇒ REQ-017 SPEC_DONE.** Deploy needs **three** things, not one: (1) `bun run db:migrate`
  (0013), (2) set **`PUBLIC_CALENDAR_BASE_URL`** — without it the link is relative and useless on a phone, and
  (3) redeploy :4006. Then a teacher gets the link from LINE (`ปฏิทิน` / quick reply) or staff via
  `POST /api/teachers/:id/calendar-link`.
