# TASK-008: List search/filter + data export
- Source: SPEC-002
- Status: DONE
- Assignee: Jason (BE)
- Depends on: TASK-007

## What to do
In `manager-gold-back`:
- Extend `GET /api/people` with optional, combinable (AND) query filters per SPEC-002:
  - `q` — case-insensitive substring over `name`, `nickname`, `notes`.
  - `tag` — person has that tag (join `person_tags`).
  - `relationship` — exact match.
  All still scoped to the caller; absent params = no filter.
- Add `GET /api/export` — gather ALL the caller's people with nested
  `feelings[]`, `interactions[]`, `tags[]` into one JSON document; respond `200` with
  `Content-Type: application/json` and
  `Content-Disposition: attachment; filename="manager-gold-export.json"`.

## Definition of Done
- [x] `bun test` covers: `q` matches name/nickname/notes substrings (case-insensitive);
      `tag` filter returns only tagged people; `relationship` exact; combined filters AND;
      all filters respect user scoping (never returns another user's rows).
- [x] `GET /api/export` returns the caller's full dataset (people + nested children) and
      the `Content-Disposition` attachment header; a second user's export contains only
      their own data (isolation test).
- [x] Live curl (a couple of filter combinations + an export) pasted into Implementation Notes.

## Implementation Notes
Implemented by Jason on 2026-07-28 in `H:\manager-gold\manager-gold-back`
(branch `dong`, commit `eabbc5f`).

**Files changed:**
- `src/people/routes.ts` (mod) — `GET /api/people` now builds an AND condition list:
  base `user_id` scope + optional `q` (`lower(name|nickname|notes) LIKE %q%`,
  case-insensitive), `relationship` (exact `eq`), `tag` (person ids that have the tag
  via `person_tags`, `inArray`; empty → forced empty result). Added `GET /api/export`:
  the caller's people + nested `feelings`/`interactions`/`tags`, returned as
  `{exportedAt, people:[…]}` with `Content-Disposition: attachment;
  filename="manager-gold-export.json"`. Reused `personDTO`/child DTOs/read helpers.
- `test/people-search-export.test.ts` (new) — 6 tests.

**Verification (evidence):**
- `bun test` → **36 pass / 0 fail** (142 assertions). Filters: `q` matches name/nickname/
  notes case-insensitively (and `?q=zzz`→[]); `tag` returns only tagged; `relationship`
  exact; `q`+`relationship` AND; **user-scope never crosses** (B's identical filter sees only
  B's row). Export: full nested dataset, `application/json` + attachment header, no `user_id`,
  and a second user's export = only their data.

**Live curl (server on :4020, stopped by PID per baseline §7):**
```
POST people ×2: Alice{nickname:"Ali",relationship:"boss",notes:"likes DATA"}, Bob{relationship:"friend"}
PUT Alice tags ["vip","client"]
GET /api/people?q=ali            → Alice     (nickname, ci)
GET /api/people?q=data           → Alice     (notes, ci)
GET /api/people?relationship=friend → Bob
GET /api/people?tag=vip          → Alice
GET /api/people?q=likes&relationship=boss → Alice   (AND)
GET /api/people                  → Alice,Bob (no filter)
GET /api/export  → 200, Content-Type: application/json,
                   Content-Disposition: attachment; filename="manager-gold-export.json"
  body: {"exportedAt":…,"people":[{…"name":"Dana","relationship":"client",
         "feelings":[{"sentiment":"positive",…}],"interactions":[{"topic":"coffee",…}],
         "tags":["vip"]}]}   (no user_id)
```

**Notes for review:**
- `q` uses `lower(col) LIKE lower(%term%)` for explicit case-insensitivity across name/
  nickname/notes (SQLite `LIKE` is ASCII-ci by default; lowering also covers the term).
- `tag` filter is an exact tag match (tags are stored trimmed, deduped case-insensitively).
- Export is one JSON document (SPEC-002 §Design decisions — simplest complete backup).
- This is the **last BE task of REQ-002**; TASK-011 (Fern) consumes these (filter UI + export button).
- Commit local on `dong` only (not pushed), per baseline §6/§7.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-28 (commit `eabbc5f` on `dong`). Read `people/routes.ts`
(list filters + export) and `test/people-search-export.test.ts`:
- Filters build an AND list with `user_id` scope **always first** — `q` (OR `lower LIKE` over
  name/nickname/notes), `relationship` (exact), `tag` (subquery of person ids with that tag,
  `inArray`, empty→forced-empty). Critically, even though the `tag` subquery isn't user-scoped,
  the outer `AND user_id = caller` excludes other users' rows — **no cross-user leak** (test
  "filters never cross user scope" confirms with two users holding identically-named rows).
- `GET /api/export` returns `{exportedAt, people:[…nested…]}` with the attachment header and no
  `user_id`; second-user export contains only their data (tested).
- 36 tests pass. `/api/export` is declared before `/api/people/:id` (no capture issue anyway).

DoD: all 3 met. **This is the last BE task of REQ-002** — TASK-011 (Fern) consumes these.
