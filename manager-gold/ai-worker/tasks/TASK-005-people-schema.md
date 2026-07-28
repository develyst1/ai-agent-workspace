# TASK-005: People schema + migration + ownership helper
- Source: SPEC-002
- Status: DONE
- Assignee: Jason (BE)
- Depends on: none (builds on the SPEC-001 DB setup)

## What to do
In `manager-gold-back`, add the SPEC-002 data model (Drizzle) + one generated migration:
- Tables per SPEC-002 §Data Model: `people`, `person_feelings`, `interactions`,
  `person_tags` — exact columns, FKs (all `ON DELETE CASCADE`), and indexes listed there
  (`people_user_id_idx`, feelings `(person_id, created_at)`, interactions
  `(person_id, occurred_on)`, `person_tags` PK `(person_id, tag)` + `person_tags_tag_idx`).
- Generate the migration (`bun run db:generate`) and confirm `bun run migrate` applies it.
- Add `getOwnedPerson(userId, personId)` in a people service module: returns the person
  row only if it exists AND `person.user_id === userId`, else `null` (routes map null → 404).
  This is the single chokepoint every `/api/people/:id...` route will use.

Do NOT add routes yet (TASK-006+). Follow `../architecture-baseline.md` §3 (isolation).

## Definition of Done
- [x] `bun run db:generate` produces a migration adding all 4 tables + indexes; `bun run migrate` applies cleanly.
- [x] `bun test` passes, including a unit test for `getOwnedPerson`: returns the row for the
      owner, `null` for a different user's id, `null` for a missing id.
- [x] Deleting a `people` row cascades its feelings/interactions/tags (one test asserts this).
- [x] No changes to auth/existing tables beyond the new schema.

## Implementation Notes
Implemented by Jason on 2026-07-27 in `H:\manager-gold\manager-gold-back`
(branch `dong`, commit `ee59fac`).

**Files changed:**
- `src/db/schema.ts` (mod) — added `people` (18 cols incl. axis fields + `values`
  reserved-word column), `person_feelings`, `interactions`, `person_tags`. All child
  FKs `→ people.id ON DELETE CASCADE`; `people.user_id → users.id ON DELETE CASCADE`.
  Indexes: `people_user_id_idx`, `person_feelings_person_id_created_at_idx`,
  `interactions_person_id_occurred_on_idx`, `person_tags` PK `(person_id, tag)` +
  `person_tags_tag_idx`. users/sessions untouched.
- `drizzle/0001_overconfident_midnight.sql` (+ snapshot/journal) — additive migration:
  4× `CREATE TABLE` + 4× `CREATE INDEX`, no `ALTER`/`DROP` on existing tables.
- `src/people/service.ts` — `getOwnedPerson(userId, personId)`: the single ownership
  chokepoint; returns the person only if it exists AND `user_id === userId`, else `null`.
- `test/people-schema.test.ts` — unit + cascade tests.

**Verification (evidence):**
- `bun run db:generate` → `6 tables` (4 new); `bun run migrate` → `migrate: ok`.
  DB now has: `interactions, people, person_feelings, person_tags, sessions, users`
  (+ indexes as above).
- Migration is additive-only (grep: no `ALTER`/`DROP` on `users`/`sessions`).
- `bun test` → **16 pass / 0 fail** (62 assertions), including:
  - `getOwnedPerson`: owner → row (name + `values` round-trip), other user → `null`,
    missing id → `null`.
  - cascade delete: person with a feeling + interaction + tag → after `DELETE people`,
    all three child sets are empty (FK `ON DELETE CASCADE` with `PRAGMA foreign_keys=ON`).
  - auth suite still green (no regressions).

**Notes for review:**
- Axis fields are nullable `text` (no DB enums) per SPEC-002 §Design decisions; the
  allowed-value validation lands with the write routes in TASK-006 (out of scope here).
- No routes added (per TASK). `getOwnedPerson` is the chokepoint TASK-006/007 will call
  before any person/child read or write.
- `values` (a SQLite keyword) is emitted backtick-quoted by drizzle and round-trips fine
  (asserted in the test).
- Commit local on `dong` only (not pushed), per baseline §6.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-27 (commit `ee59fac` on `dong`). Read the real
`schema.ts`, `drizzle/0001_*.sql`, `people/service.ts`, and `test/people-schema.test.ts`:
- All 4 tables match SPEC-002 §Data Model exactly — columns, all FKs `ON DELETE CASCADE`,
  indexes (`people_user_id_idx`, feelings `(person_id,created_at)`, interactions
  `(person_id,occurred_on)`, `person_tags` composite PK + `tag` index).
- Migration `0001` is additive-only (4 CREATE TABLE + 4 CREATE INDEX; no ALTER/DROP on
  users/sessions — verified).
- `getOwnedPerson(userId, id)` is exactly the chokepoint: `WHERE id=? AND user_id=?` → row
  or `null`. This is what every TASK-006/007 person/child route must call first.
- Tests prove owner→row / other-user→null / missing→null, and cascade delete wipes
  feelings+interactions+tags (FK + PRAGMA foreign_keys=ON exercised for real).
- Scope-correct: no routes; axis-value validation correctly deferred to TASK-006. `values`
  (SQLite keyword) is drizzle-quoted and round-trips (asserted).

DoD: all 4 met. → TASK-006 (people CRUD) unblocked.
