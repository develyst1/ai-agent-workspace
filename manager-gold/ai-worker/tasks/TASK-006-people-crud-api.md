# TASK-006: People CRUD API
- Source: SPEC-002
- Status: DONE
- Assignee: Jason (BE)
- Depends on: TASK-005

## What to do
Implement the core people endpoints in `manager-gold-back` per SPEC-002 §API/§Flow, all
under the `requireAuth` guard, all scoped to the caller's `userId`:
- `POST /api/people` — validate (name required; axis fields against their allowed sets;
  free-text fields optional) → insert with `user_id` = caller → `201 {person}`.
- `GET /api/people` — list the caller's people as **summaries**
  `{id,name,nickname,relationship,role,currentSentiment,tags}` (currentSentiment = latest
  feeling or null; tags from `person_tags`). (Filters `q`/`tag`/`relationship` are TASK-008 —
  return the unfiltered list here.)
- `GET /api/people/:id` — via `getOwnedPerson` → full `{person, feelings[], interactions[], tags[]}`
  (feelings newest-first, interactions by `occurred_on` desc, tags sorted). 404 if not owned.
- `PATCH /api/people/:id` — `getOwnedPerson` → validate provided subset → update + bump
  `updated_at` → `200 {person}`. 404 if not owned.
- `DELETE /api/people/:id` — `getOwnedPerson` → delete (children cascade) → `204`. 404 if not owned.
- Person DTO camelCases columns and omits `user_id`.

## Definition of Done
- [x] `bun test` covers: create→201; list returns only the caller's people as summaries;
      get full profile shape; patch updates + bumps `updated_at`; delete→204 then get→404;
      validation→400 (missing name, bad axis value).
- [x] **Isolation test:** user B gets `404` on GET/PATCH/DELETE of user A's person id
      (not 403, no existence leak) — mirrors TASK-003's isolation test.
- [x] No `user_id` leaks in any response body.
- [x] Live curl walkthrough (create→get→patch→delete) pasted into Implementation Notes.

## Implementation Notes
Implemented by Jason on 2026-07-27 in `H:\manager-gold\manager-gold-back`
(branch `dong`, commit `8bf4f60`).

**Files changed:**
- `src/people/service.ts` (mod) — added axis allowed-value sets (`AXIS_VALUES`),
  `parsePersonCreate`/`parsePersonPatch` (name required; axis ∈ set; free-text
  optional; `null` clears on patch), `personDTO` (camelCase, omits `user_id`),
  `feelingDTO`/`interactionDTO`, and read helpers `currentSentiment`/`tagsFor`/
  `feelingsFor`/`interactionsFor` (shared with TASK-007).
- `src/people/routes.ts` (new) — `registerPeopleRoutes`: POST/GET list/GET :id/
  PATCH/DELETE. Every `:id` route goes through `getOwnedPerson` → 404 if not owned.
- `src/app.ts` (mod) — mounts `registerPeopleRoutes` (under the existing `/api/*`
  `requireAuth` guard).
- `test/people-api.test.ts` (new) — 7 API tests.

**Verification (evidence):**
- `bun test` → **23 pass / 0 fail** (96 assertions) across smoke/auth/people-schema/
  people-api. Covers create→201; list returns only the caller's people as summaries
  (incl. `currentSentiment` = latest feeling, `tags`); full profile shape
  `{person,feelings,interactions,tags}`; patch updates + bumps `updated_at`
  (`await Bun.sleep(5)` to force a later ts); delete→204 then get→404; validation→400
  (missing name, bad axis); **isolation** (user B → 404 on GET/PATCH/DELETE of A's id,
  A's row untouched); no `user_id`/`userId` in responses.

**Live curl walkthrough (server on :4020):**
```
### CREATE  → 201, person returned (no user_id)
POST /api/people {"name":"Dana","relationship":"client","decisionBasis":"emotion","pace":"careful","notes":"prefers stories"}
### GET /api/people/:id
{"person":{"id":"84454d8b…","name":"Dana","relationship":"client","decisionBasis":"emotion","pace":"careful","notes":"prefers stories","createdAt":1785171264594,"updatedAt":1785171264594,…},"feelings":[],"interactions":[],"tags":[]}
### GET /api/people  (summaries)
{"people":[{"id":"84454d8b…","name":"Dana","nickname":null,"relationship":"client","role":null,"currentSentiment":null,"tags":[]}]}
### PATCH {"name":"Dana R.","relationship":"partner"}
{"person":{…,"name":"Dana R.","relationship":"partner","createdAt":1785171264594,"updatedAt":1785171264761}}   ← updatedAt bumped, createdAt unchanged
### DELETE → delete=204  then GET → get_after=404
### POST /api/people {"relationship":"friend"}  → 400 {"error":"validation","fields":{"name":"required"}}
```

**Notes for review:**
- List is intentionally unfiltered (SPEC-002 puts `q`/`tag`/`relationship` + export in TASK-008).
- Sub-resource writes (feelings/interactions/tags) are TASK-007; the read helpers +
  `feelingDTO`/`interactionDTO` are already here so TASK-007 just adds the write endpoints.
- List does per-person reads for `currentSentiment`/`tags` (N+1) — fine for a personal-scale
  dataset; can batch later if a real N ever warrants it.
- Commit local on `dong` only (not pushed), per baseline §6.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-28 (commit `8bf4f60` on `dong`). Read the real
`people/service.ts`, `people/routes.ts`, `app.ts`, and `test/people-api.test.ts`:
- **Isolation**: every `:id` route resolves `getOwnedPerson` first → `404 {error:"not_found"}`
  for both absent and not-owned (no existence leak). Test proves user B → 404 on
  GET/PATCH/DELETE of A's person, and A's row is untouched.
- **No mass-assignment**: `PersonWrite` omits id/userId/timestamps; the parsers copy only the
  known name/axis/free fields, so a client body can't inject `userId`/`id`. Route sets those.
- **No leak**: `personDTO` strips `user_id`; tests assert no `user_id`/`userId` in create/list responses.
- **Contract**: create→201; list→summaries (`currentSentiment`=latest feeling, sorted tags,
  exact key set); get→`{person,feelings,interactions,tags}` with the specified ordering;
  patch validates the present subset, `null`-clears, bumps `updated_at`, keeps `created_at`;
  delete→204 then get→404. Validation 400 on missing name / bad axis value.
- 23 tests pass. N+1 in list (per-person `currentSentiment`/`tags`) is fine at personal scale —
  batch later only if a real N warrants it.

DoD: all 4 met. → TASK-007 (sub-resources) unblocked; TASK-009's API dependency (Fern) is now satisfied.
