# TASK-011: Search/filter UI + export button
- Source: SPEC-002
- Status: DONE
- Assignee: Fern (FE)
- Depends on: TASK-008 (search/export API), TASK-009 (people list)

## What to do
In `manager-gold-front`, on the people list page:
- **Search/filter controls:** a text box (`q`), a tag filter, and a relationship filter.
  On change, call `GET /api/people` with the matching query params (debounce the text box)
  and re-render. Clearing a control drops that param. Empty result → an empty state.
- **Export button:** triggers `GET /api/export` and saves the returned JSON as a file
  (`manager-gold-export.json`) — fetch via `lib/api.ts` (so the cookie is sent), then
  create a Blob download. Confirm the file contains the user's people + nested data.

## Definition of Done
- [x] Typing in `q` filters the list (matches name/nickname/notes); clearing restores it
      (browser: `q="acmecorp"` → only Bob (notes match); cleared → full list).
- [x] Tag and relationship filters narrow the list; combining them ANDs
      (browser: `relationship=friend` → Alice+Carol; `+ tag=work` → Carol only).
- [x] Export downloads a JSON file with the user's full dataset (verified by opening it):
      button → `GET /api/export` 200, `Content-Disposition: attachment; filename="manager-gold-export.json"`,
      body has all 3 people + nested feelings/interactions/tags, **no `user_id`**.
- [x] `bun run build` clean. Browser walkthrough below.

## Implementation Notes
Implemented by Fern, 2026-07-28 in `manager-gold-front` (branch `dong`, commit `ce50924`).

**Files (mod):**
- `lib/people.ts` — `listPeople(filters?)` now builds `?q=&tag=&relationship=` via `URLSearchParams`
  (only set when non-empty); added `fetchExportBlob()` (`GET /api/export` via `lib/api.ts` → `Blob`).
- `app/people/page.tsx` — three filter inputs (q / relationship / tag) with a **300ms debounce**
  (one effect keyed on all three; clearing a box drops its param); a filter-aware empty state
  ("No people match your filters." vs the first-run "No people yet."); an **Export** button that
  fetches the blob and triggers a client download of `manager-gold-export.json`.

**Verification (evidence) — my own backend on :4020 + real browser on :3020 (baseline §7):**
- Seeded 3 people (Alice/friend/[vip]/"loves hiking", Bob/colleague/[work]/"PM at acmecorp",
  Carol/friend/[vip,work]).
- `q="acmecorp"` → only **Bob** (notes match); cleared → all 3 back.
- `relationship="friend"` → **Alice + Carol**; then `+ tag="work"` → **Carol** only (AND).
- `q="zzznomatch"` → **"No people match your filters."** empty state (no rows).
- Export button → `GET /api/export` **200** (seen in the network panel), console clean; `curl`
  of the same endpoint confirmed `Content-Disposition: attachment; filename="manager-gold-export.json"`,
  `application/json`, all 3 people + nested `feelings`/`interactions`/`tags`, and **zero `user_id`**.
- `bun run build` clean. §7: servers were free pre-launch (so unambiguously mine); stopped my own
  instances after — ports released.

**For Sober:** relationship/tag are exact-match text inputs (matching the API's `relationship`
exact + `tag` has-tag semantics) — kept simple rather than deriving Select options from the data;
easy to upgrade to Selects later if you want. This is the last REQ-002 FE task.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-28. Read `app/people/page.tsx` + the `lib/people.ts`
`listPeople(filters)`/`fetchExportBlob` additions:
- `listPeople` builds `URLSearchParams` for `q`/`tag`/`relationship` (omits blanks) — matches the
  TASK-008 contract. Debounced (300ms) fetch on filter change with an `active` stale-write guard;
  filter-aware empty state ("No people match your filters" vs "No people yet").
- Export fetches `/api/export` through `lib/api` (cookie sent) → Blob → triggers a
  `manager-gold-export.json` download; errors surface in the alert.
- Build clean; E2E verified. Accepted.

**This is the 7th and final task of SPEC-002 / REQ-002 — REQ-002 is complete.**
