# SPEC-063: Session note (REQ-068) + the unified calendar cell / display toggle (REQ-052 amended)

- Source: REQ-068 (session note) + REQ-052 (amended: display toggle + icons-only). Cut together because both land on
  the **same calendar cell**, which must be built **once** (Porter).
- Author: Sober (SA) 2026-08-23
- Status: READY — TASK-178 (BE) + TASK-142 re-cut (FE cell) + TASK-179 (FE input) cut.

## Q3 — 🔴 the note needs a NEW column; `bookings.note` is occupied

`bookings.note` (`schema.ts:362`) already exists and is the system's **status-reason / audit** field — cancel,
sick-leave and auto-extend all write it (`scheduler.service.ts:1595, 1737, 1927, 1990, 2031`, e.g.
`"คาบขยายอัตโนมัติจากการลา"`). Sharing it for REQ-068's attendee note would mean **a leave reason silently clobbers
the "bringing 2 siblings" note, and vice versa** — data loss on both, on a money-adjacent path.
⇒ **New column `bookings.attendee_note`** (name SA's; distinct from `note`). The two never mix.

## REQ-068 scope (Q1/Q2 already answered "ไม่" by the owner)
- **Free text, per SESSION, all four booking types + editable per-session from manage-course.** Editing one course
  session's note must NOT touch the other nine (AC-3). Optional everywhere; empty changes nothing (AC-5).
- **~200-char cap** (keeps it a note, not a record). Constraint (Porter to word): names + logistics, **not** phone /
  address / medical.
- **Q1 → not in the daily report** (a "who's coming" note belongs *before* the session, not on the after-the-fact
  sheet). **Q2 → editing/adding a note enqueues NO notification** (AC-8, provable by an empty outbox) — a phone that
  pings on every correction gets muted.
- **Travels to:** the **teacher LINE schedule** (rides REQ-067 Part B's now-readable message — the note lands there,
  not in a new message) and the **admin day view**.

## REQ-052 amended — one cell, one toggle
- The cell shows, when everything is on: **time · name** (always, not toggleable) **· booking type · program ·
  badge · note · rental**. A **visible display toggle** over a **fixed five-item set** — `booking type · program ·
  badge · note · rental` — **default ON for all on first use**, **display-only** (no filtering of which bookings
  appear, no data change). ⚠️ **Exactly those five** — anything more is a new decision, not an assumption.
- **Icons only, no emoji** (AC-9): the type marker is an icon **component** + the type **also in text** (the icon is
  reinforcement, never the sole signal); status stays the primary signal (StatusChip unchanged).
- **Built once** — program + type (REQ-052) and note (REQ-068) render in the same cell under the same toggle, so the
  cell can't bloat and isn't touched twice.

## The three pieces

### TASK-178 — BE (the foundation everything else needs)
1. **Migration:** `bookings.attendee_note text` (nullable), ~200-char guard at the write boundary (zod). Additive,
   `sid` first, hand-authored + journal-registered.
2. **Store on all four booking types** at creation (`createBooking` etc.) and via a **per-session edit** path
   (manage-course) — the edit sets **only** this booking's `attendee_note`, never touches `note` or other sessions.
   **Editing enqueues NO notification** (AC-8).
3. **Expose on the booking DTO** (`toBookingDTO`) as `attendeeNote: string | null`, typed through `AppType`.
4. **Teacher LINE schedule** (`line-webhook.service.ts`, the REQ-067B builder): when a session has an
   `attendee_note`, show it (an indented line under the session); sessions without one look exactly as today (AC-4).
   TH/EN; keep the cap/empty/quick-replies.

### TASK-142 — FE, re-cut: the unified cell + the display toggle
Supersedes the old TASK-142. Renders in **one** cell: time · name (always) · type + program (REQ-052, dual-colour
edge-stripe + **icon**, type always as text, legend names both dimensions) · **note** (REQ-068) · badge · rental —
each of the five behind the **display toggle** (fixed set, default all-ON, display-only, persisted FE preference).
Icons-only (AC-9). Responsive 1440/768/375 (program shortens first, never the type label). Depends on TASK-178's DTO
+ TASK-141 nickname (done).

### TASK-179 — FE, the note input + admin view
The `attendee_note` input on the four booking forms + **manage-course per-session** (AC-3: per session, doesn't write
the others) + the **booking detail** + the **admin day view**. ~200-char counter; the not-for-PII wording (Porter's).
Bilingual, no raw key. Depends on TASK-178's DTO/endpoint.

## Out of scope
Extending badges (REQ-068 constraint). Parent-facing LINE. Any toggle item beyond the five. Filtering by the toggle.
