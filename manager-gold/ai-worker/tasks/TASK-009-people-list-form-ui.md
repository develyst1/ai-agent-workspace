# TASK-009: People list + create/edit person form
- Source: SPEC-002
- Status: DONE
- Assignee: Fern (FE)
- Depends on: TASK-006 (people CRUD API)

## What to do
In `manager-gold-front` (all calls via `lib/api.ts`, protected by the existing AuthGate):
- **People list** (`/people`, or make it the home): fetch `GET /api/people`, render the
  summaries (name/nickname, relationship, role, current sentiment, tags) as Mantine cards or
  a table. Each row links to the person's profile (`/people/:id`, TASK-010). Empty state +
  a "New person" button. (Search/filter UI is TASK-011.)
- **Create/edit form** (`/people/new` and edit from the profile): all SPEC-002 person fields.
  Axis fields = Mantine `Select`s with the documented options
  (decision_basis reason|emotion|mixed; directness direct|indirect; pace fast|careful;
  comm_content data|stories|mixed; comm_formality formal|casual) — all optional/clearable.
  Free-text fields = `TextInput`/`Textarea`. `name` required.
  - Create → `POST /api/people` → on 201 go to the new profile (or list). 400 → show field errors.
  - Edit → `PATCH /api/people/:id`. Delete (with a confirm) → `DELETE` → back to the list.
- Add a typed API helper module (e.g. `lib/people.ts`) matching the SPEC-002 shapes; read the
  as-built routes if in doubt.

## Definition of Done
- [x] Create a person → appears in the list; open → edit → changes persist (browser-verified vs real TASK-006 API).
- [x] Delete (after confirm) removes it from the list (list returned to empty state).
- [x] Required-field and 400 validation errors render on the right inputs (whitespace name → backend 400 → "required" on Name).
- [x] Axis Selects show the documented options and round-trip (options render per set; decisionBasis="reason" prefilled on edit reload).
- [x] `bun run build` clean (all 7 routes compile). Browser walkthrough in Implementation Notes.

## Implementation Notes
**IN_PROGRESS — scaffolded against the SPEC-002 contract (per Sober's OK to build ahead of
TASK-006), 2026-07-27.** Not yet committed / not REVIEW: the live create/edit/delete DoD needs
Jason's TASK-006 people API (still TODO). Will read the as-built routes, integrate, run the
browser walkthrough, commit, and move to REVIEW once TASK-006 lands.

**Files (committed `8165e7d` on `dong`):**
- `lib/people.ts` — typed client for SPEC-002 §API: `PersonSummary`/`Person`/`PersonInput`
  types, `AXIS_OPTIONS` (the 5 documented allowed sets), and `listPeople`/`getPerson`/
  `createPerson`/`updatePerson`/`deletePerson` (all via `lib/api.ts`; 400 → `{fields}` mapped
  to a typed `WriteResult`).
- `components/PersonForm.tsx` — shared create/edit form: `name` required, 3 short text fields,
  5 axis `Select`s (clearable, options from `AXIS_OPTIONS`), 5 `Textarea`s; maps blank → null;
  surfaces per-field 400 errors; Delete button in edit mode.
- `app/people/page.tsx` — list: `GET /api/people` → summary cards (name/nickname/relationship/
  role/current sentiment/tags), Open (→ profile, TASK-010) + Edit links, "New person", empty state.
- `app/people/new/page.tsx` — create (`POST`); on success → `/people`.
- `app/people/[id]/edit/page.tsx` — loads person, edits (`PATCH`), deletes (confirm → `DELETE`).
- `app/page.tsx` (mod) — home now links to `/people`.

**Interim verification (no people API yet — auth from TASK-003 is live):**
- `bun run build` → ✓ clean; routes `/people`, `/people/new`, `/people/[id]/edit` compile, no type errors.
- Browser (logged in): `/people/new` renders the full form — Name + all 5 axis Selects + all
  text/textarea fields — console clean; the AuthGate lets the authed user in.
- `/people` degrades gracefully with no API route yet: shows the header/New-person button and a
  clean "Failed to load people (404)" alert (no crash).

**Integration + live E2E (2026-07-28) — committed `8165e7d` on `dong`:**
- **Reconciled against the as-built TASK-006 routes** (`people/routes.ts` + `service.ts`): the
  contract matches SPEC-002 exactly (`{person}`/`{people}` wrappers, camelCase DTO with no
  `user_id`, identical axis allowed-sets, `400 {error:"validation",fields}`, `404 {error:"not_found"}`).
  **No code changes were needed** — the scaffold was contract-accurate.
- Browser walkthrough against the **real** backend (:4020) + real browser (:3020), logged in:
  - Create "Alice Example" (decisionBasis=reason via the Select) → redirected to `/people`, row appears. ✓
  - Open Edit → form prefilled decisionBasis=**reason** (axis round-trip). Set Role="Engineering
    Manager", Save → `/people`, the row now shows the new role (edit persists). ✓
  - Axis Selects render the documented options (verified all 5 sets in the DOM:
    reason/emotion/mixed · direct/indirect · fast/careful · data/stories/mixed · formal/casual). ✓
  - Whitespace-only name → backend `400` → "required" renders under the **Name** input,
    stays on `/people/new`. ✓
  - Delete (confirm) → redirected to `/people`, list back to "No people yet." ✓
  - Console clean throughout; `bun run build` clean. Servers stopped, ports freed.
- Note (browser tool constraint, not a product issue): the pane wasn't displayed so coordinate
  clicks/screenshots were unavailable — I drove the Mantine `Select`/submit via DOM events; the
  widgets themselves work normally for a user.

**For Sober:**
- "Open" links to `/people/:id` (the profile) which is **TASK-010** — that route 404s until 010 lands (expected).
- Delete uses a native `window.confirm`. Simple + in-scope; if you'd prefer a Mantine confirm modal
  I can switch it in TASK-010 (the profile also gets an edit/delete affordance). Flagging, not blocking.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-28 (commit `8165e7d` on `dong`). Read `lib/people.ts`,
`components/PersonForm.tsx`, `app/people/page.tsx`, `app/people/new/page.tsx`,
`app/people/[id]/edit/page.tsx`:
- `lib/people.ts` is contract-accurate to the as-built TASK-006 routes (summary/full/input types,
  `AXIS_OPTIONS`, 400→`{fields}`, other→throw). Good that the scaffold needed no changes.
- `PersonForm` is a clean shared create/edit form: name required, 3 short + 5 axis Selects
  (clearable, options from `AXIS_OPTIONS`) + 5 textareas; blanks → null via `toInput`; 400 field
  errors mapped to the right inputs; Delete only in edit mode.
- List page has proper loading/empty/error states, sentiment + tag badges, Open/Edit links.
  Edit page loads via `getPerson`, delete confirms then routes back.
- DoD all met with browser E2E (create/edit/delete, axis round-trip, 400 "required"); build clean.

Non-blocking notes: the list "Open" link → `/people/:id` will 404 until **TASK-010** lands
(expected — the profile page is 010). Native `window.confirm` for delete is fine for MVP; swap
to a Mantine modal in TASK-010 only if you want the polish. Accepted.
