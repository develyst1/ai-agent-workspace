# TASK-007: Sub-resources — feelings, interactions, tags
- Source: SPEC-002
- Status: DONE
- Assignee: Jason (BE)
- Depends on: TASK-006

## What to do
Add the child-resource endpoints in `manager-gold-back` per SPEC-002 §API/§Flow. Every
route calls `getOwnedPerson(userId, :id)` first → `404` if not owned (no existence leak):
- `POST /api/people/:id/feelings` — `{sentiment (positive|negative|neutral), note?}` →
  insert → `201 {feeling}`. (These also surface as `currentSentiment`/timeline elsewhere.)
- `POST /api/people/:id/interactions` — `{occurredOn (YYYY-MM-DD), topic, outcome?,
  whatWorked?}` → `201 {interaction}`.
- `DELETE /api/people/:id/interactions/:iid` — only if that interaction belongs to the
  owned person → `204`; else `404`.
- `PUT /api/people/:id/tags` — `{tags: string[]}` **replaces** the whole set: trim, drop
  empties, dedupe (case-insensitive), enforce caps (≤50 chars each, ≤50 tags) → `200 {tags}`.
- Validate required fields; bad input → `400 {error:"validation", fields}`.

## Definition of Done
- [x] `bun test` covers: add feeling→201 and it appears as the person's `currentSentiment`;
      add interaction→201 and it appears in the profile; delete interaction→204;
      PUT tags replaces/dedupes/trims and rejects over-cap input (400).
- [x] **Isolation:** posting a feeling/interaction/tag to another user's person id → `404`;
      deleting another user's interaction → `404`.
- [x] Cascade holds: deleting the person removes its feelings/interactions/tags.
- [x] Live curl for each endpoint pasted into Implementation Notes.

## Implementation Notes
Implemented by Jason on 2026-07-28 in `H:\manager-gold\manager-gold-back`
(branch `dong`, commit `d9e3653`).

**Files changed:**
- `src/people/service.ts` (mod) — added `SENTIMENTS`, `parseFeeling`,
  `parseInteraction` (real-calendar-date check on `occurredOn`), `parseTags`
  (trim / drop-empty / case-insensitive dedupe / caps ≤50 chars, ≤50 tags).
- `src/people/routes.ts` (mod) — 4 endpoints: POST feelings, POST interactions,
  DELETE interactions/:iid (ownership re-checked: interaction must belong to the
  owned person), PUT tags (replace whole set via delete-then-insert). Reused the
  read helpers/DTOs added in TASK-006.
- `test/people-subresources.test.ts` (new) — 7 tests.

**Verification (evidence):**
- `bun test` → **30 pass / 0 fail** (122 assertions). Covers: feeling→201 and becomes
  `currentSentiment` (+ newest-first timeline); interaction→201 in profile, bad date→400;
  delete interaction→204; PUT tags replace/dedupe/trim (`["  vip ","VIP","friend",""]` →
  `["friend","vip"]`) and over-cap (51 chars / 51 tags)→400; **isolation** (user B → 404
  on POST feeling/interaction, PUT tags, DELETE interaction for A's person); **cascade**
  (delete person clears feelings/interactions/tags).

**Live curl walkthrough (server on :4020):**
```
POST /api/people/:id/feelings {"sentiment":"positive","note":"warm"}
  → 201 {"feeling":{"id":"370546…","sentiment":"positive","note":"warm","createdAt":…}}
POST /api/people/:id/interactions {"occurredOn":"2026-07-27","topic":"coffee","outcome":"good"}
  → 201 (interaction id 508e81…)
PUT  /api/people/:id/tags {"tags":["  vip ","VIP","friend",""]}
  → 200 {"tags":["friend","vip"]}                 ← trimmed, empty dropped, deduped
GET  /api/people/:id  → {feelings:["positive"], interactions:["coffee"], tags:["friend","vip"]}
DELETE /api/people/:id/interactions/:iid  → 204 ; profile interactions then = 0
POST interactions {"occurredOn":"2026-13-40","topic":"x"}  → 400 {"error":"validation","fields":{"occurredOn":"must be a valid YYYY-MM-DD date"}}
PUT tags {"tags":["x"×51]}  → 400
```

**Notes for review:**
- `PUT tags` replaces the set with delete-then-insert (SPEC "replace whole set"); returns
  the stored set via `tagsFor` (sorted).
- Interaction delete confirms the row's `person_id` matches the owned person before deleting —
  a client can't delete another person's interaction by guessing an `iid`.
- Coordination heads-up (see log): my earlier live check hit `EADDRINUSE` on `:4020` — a stale
  backend from another session was bound, so my curls hit old code (fixed: killed it, re-ran,
  and I now kill only my own server PID, never a broad `taskkill`).
- Commit local on `dong` only (not pushed), per baseline §6.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-28 (commit `d9e3653` on `dong`). Read `people/service.ts`
(parsers), `people/routes.ts` (4 endpoints), `test/people-subresources.test.ts`:
- Every child route resolves `getOwnedPerson` first → 404 (no leak); **interaction delete also
  re-checks `interaction.person_id === owned person`** so an `iid` from another person can't be
  deleted. Isolation test proves user B → 404 on POST feeling/interaction, PUT tags, DELETE interaction.
- `parseInteraction` validates a **real** calendar date (regex + `Date` round-trip → rejects
  `2026-13-40` and `2026-02-30`). `parseTags` trims/drops-empty/case-insensitive-dedupes/caps
  (≤50 chars, ≤50 tags) → 400. `parseFeeling` sentiment ∈ set.
- `PUT tags` replaces the set (delete-then-insert), returns the sorted stored set. 30 tests pass; cascade verified.

Non-blocking (optional): `PUT tags` delete-then-insert isn't wrapped in a transaction — a crash
between the two would drop tags. Extremely low risk here (sync bun:sqlite, validated input); wrap
in `db.transaction` later if you touch this. No action needed now.

DoD: all 4 met. → TASK-008 unblocked; the TASK-010 (profile page) contract is now live for Fern.
