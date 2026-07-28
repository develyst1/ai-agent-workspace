# SPEC-002: People database — per-person profiles
- Source: REQ-002
- Status: DONE (all 7 tasks 005–011 accepted 2026-07-28; REQ-002 → SPEC_DONE, pending Porter acceptance)
- Baseline: `../architecture-baseline.md`. Builds directly on SPEC-001 (auth + the
  per-user isolation pattern proven in TASK-003).

## Overview
The core feature: a signed-in user keeps a private database of "person" records —
each capturing how that person thinks/feels (incl. toward the user) and how they
reason — plus a dated interaction log and free-form tags, with list/search and a
data export. All data is per-user and **isolated server-side**: `people` rows carry
`user_id`; child rows (feelings/interactions/tags) inherit ownership through their
parent person, which is **always re-checked against the authenticated user** before
any read/write. No new auth — reuse the SPEC-001 `requireAuth` guard on `/api/*`.

Semi-structured axis fields (decision basis, directness, pace, comm content/formality)
are stored as nullable text with a **documented allowed-value set** (validated in the
service, rendered as Mantine `Select`s), not DB enums — SQLite-friendly and flexible.
Feeling-toward-user is modeled as **dated entries** (a small time series); "current
feeling" = the latest entry. Export is a single **JSON** download of the user's whole
dataset.

## Data Model
SQLite/Drizzle. New tables (all `id` = uuid TEXT PK, timestamps = epoch ms INTEGER).

**`people`** — one row per person, owned by a user.
- `user_id` TEXT NOT NULL → `users.id` ON DELETE CASCADE
- `name` TEXT NOT NULL · `nickname` TEXT NULL · `relationship` TEXT NULL (boss/friend/
  client/family/…, free text) · `role` TEXT NULL
- Axis fields (nullable text, allowed set in §Validation):
  `decision_basis` (reason|emotion|mixed) · `directness` (direct|indirect) ·
  `pace` (fast|careful) · `comm_content` (data|stories|mixed) · `comm_formality` (formal|casual)
- Free text: `topics_to_raise` · `topics_to_avoid` · `values` · `motivations` ·
  `notes` (long free-form; REQ-003 will summarize this)
- `created_at` NOT NULL · `updated_at` NOT NULL
- Index: `people_user_id_idx` on `user_id`.

**`person_feelings`** — feeling toward the user, over time.
- `person_id` TEXT NOT NULL → `people.id` ON DELETE CASCADE
- `sentiment` TEXT NOT NULL (positive|negative|neutral) · `note` TEXT NULL · `created_at` NOT NULL
- Index on (`person_id`, `created_at`). Latest = current.

**`interactions`** — dated log.
- `person_id` TEXT NOT NULL → `people.id` ON DELETE CASCADE
- `occurred_on` TEXT NOT NULL (YYYY-MM-DD) · `topic` TEXT NOT NULL · `outcome` TEXT NULL ·
  `what_worked` TEXT NULL · `created_at` NOT NULL
- Index on (`person_id`, `occurred_on`).

**`person_tags`** — free-form tags.
- `person_id` TEXT NOT NULL → `people.id` ON DELETE CASCADE · `tag` TEXT NOT NULL
- PRIMARY KEY (`person_id`, `tag`) · Index `person_tags_tag_idx` on `tag` (cross-person filter).

`PRAGMA foreign_keys=ON` is already set (SPEC-001). Deleting a person cascades its children.

## API / Interface Design
All routes under `/api/*` (session-guarded; `userId` from the guard). JSON.
**Ownership rule:** every `/api/people/:id...` route first resolves the person via a
helper `getOwnedPerson(userId, id)` → **404 `{error:"not_found"}`** if it doesn't exist
OR isn't owned by `userId` (same 404 for both — no existence leak). Never query a child
by a client id without confirming the parent is owned.

| Method | Path | Body / Query | Success | Errors |
|--------|------|--------------|---------|--------|
| GET | `/api/people` | `?q=&tag=&relationship=` | `200 {people:[summary]}` | — |
| POST | `/api/people` | person fields | `201 {person}` | 400 |
| GET | `/api/people/:id` | — | `200 {person, feelings[], interactions[], tags[]}` | 404 |
| PATCH | `/api/people/:id` | any subset of fields | `200 {person}` | 400, 404 |
| DELETE | `/api/people/:id` | — | `204` | 404 |
| POST | `/api/people/:id/feelings` | `{sentiment, note?}` | `201 {feeling}` | 400, 404 |
| POST | `/api/people/:id/interactions` | `{occurredOn, topic, outcome?, whatWorked?}` | `201 {interaction}` | 400, 404 |
| DELETE | `/api/people/:id/interactions/:iid` | — | `204` | 404 |
| PUT | `/api/people/:id/tags` | `{tags:string[]}` (replace whole set) | `200 {tags}` | 400, 404 |
| GET | `/api/export` | — | `200` JSON attachment (all the user's people + nested) | — |

- **person summary** (list): `{id, name, nickname, relationship, role, currentSentiment, tags}`
  (`currentSentiment` = latest feeling's sentiment or null).
- **person** (full): all columns except `user_id`, camelCased, `+ createdAt/updatedAt`.
- List filters combine (AND): `q` = case-insensitive substring over name/nickname/notes;
  `tag` = has that tag; `relationship` = exact. All optional.

## Flow
1. Create person: validate → insert with `user_id` = caller → `201 {person}` (no children yet).
2. List: select the caller's people (+ latest sentiment + tags), apply filters, return summaries.
3. Get profile: `getOwnedPerson` → load feelings (newest first), interactions (newest
   `occurred_on` first), tags (sorted) → `200`.
4. Update: `getOwnedPerson` → validate provided fields → update + bump `updated_at`.
5. Delete: `getOwnedPerson` → delete person (children cascade) → `204`.
6. Feelings/interactions/tags: `getOwnedPerson` first, then act. `PUT tags` replaces the
   set (dedupe, trim, drop empties). Delete interaction: confirm it belongs to the owned person.
7. Export: gather all the caller's people with nested feelings/interactions/tags → JSON,
   `Content-Disposition: attachment; filename="manager-gold-export.json"`.
8. Edge/error: missing required (`name`; feeling `sentiment`; interaction `occurredOn`+`topic`)
   → `400 {error:"validation", fields}`. Bad axis value → `400`. Any not-owned/absent id → `404`.

## Non-functional
- Isolation is the headline requirement — see the Ownership rule. Add a test proving user B
  cannot read/patch/delete/append-to user A's person (expect 404), mirroring TASK-003's isolation test.
- Validation on every write; axis fields checked against their allowed sets; tags capped
  (e.g. ≤ 50 chars each, ≤ 50 per person) to avoid abuse. Dates validated `YYYY-MM-DD`.
- No auth/logging changes beyond reusing `requireAuth`. No rate limiting (out of scope, as SPEC-001).

## Tasks
- TASK-005: BE — schema + migration (people/feelings/interactions/tags) + `getOwnedPerson` helper (depends: —)
- TASK-006: BE — people CRUD API (create/list/get-full/update/delete) + validation (depends: TASK-005)
- TASK-007: BE — sub-resources: feelings, interactions, tags endpoints (depends: TASK-006)
- TASK-008: BE — list search/filter (`q`/`tag`/`relationship`) + `GET /api/export` (depends: TASK-007)
- TASK-009: FE — people list + create/edit person form (all fields, Mantine Selects) (depends: TASK-006)
- TASK-010: FE — person profile page: fields + feelings timeline + interaction log + tags editor (depends: TASK-007, TASK-009)
- TASK-011: FE — search/filter UI + export button (depends: TASK-008, TASK-009)

## Questions
(Jason / Fern ask here; Sober answers as `> answer: ...`)

## Design decisions (Sober — recorded so engineers don't re-litigate)
- Axis fields = nullable text + service-validated allowed sets (not DB enums): SQLite-simple, flexible.
- Feeling = dated entries (`person_feelings`), current = latest — honors "trackable over time".
- Tags normalized in `person_tags` (indexed) so "filter by tag" is a real query, not JSON scan.
- Export = one JSON download of the whole dataset (simplest complete backup; matches "export (backup)").
- Child ownership via parent re-check (`getOwnedPerson`), never a direct child-by-client-id read.
