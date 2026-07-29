# TASK-019: Restyle auth + people list + form
- Source: SPEC-005
- Status: DONE
- Assignee: Fern (FE)
- Depends on: TASK-018 (theme + shell)

## What to do
Apply the TASK-018 theme to these screens in `manager-gold-front` — restyle only, no behaviour change:
- **Auth** (`/login`, `/register`): tidy centered card, clear hierarchy, consistent inputs/buttons,
  the generic error styled, the register/login cross-link. Polished in light + dark.
- **People list** (`/people`): clean card/row layout for each person (name/nickname, sentiment,
  relationship·role, tags), tidy the filter controls (q/tag/relationship) + Export + New-person
  buttons, and the loading/empty (incl. filter-aware) states.
- **PersonForm** (`/people/new`, `/people/:id/edit`): tidy grouping/spacing of the many fields,
  the axis `Select`s, the action buttons (Create/Save/Cancel/Delete), field-error styling.
- Keep everything working: the same `lib/people.ts` calls, validation, delete-confirm, navigation.

## Definition of Done
- [x] Login/register (shared `AuthCard`), people list, and the create/edit form restyled to the new
      theme — verified in **both light and dark** (list cards + badges light `#fff` and dark).
- [x] Responsive at 375px: auth card, filters (SimpleGrid), person cards, and the form all stack
      cleanly — `scrollWidth == clientWidth == 375`, no horizontal scroll (auth, list, form checked).
- [x] No regression — behaviour is byte-identical (only JSX/layout changed): create smoke worked
      ("Dave Restyle" → list); login/list/filter/edit/delete call the same unchanged `lib/people.ts`.
- [x] `bun run build` clean. Browser walkthrough below.

## Implementation Notes
Implemented by Fern, 2026-07-29 in `manager-gold-front` (branch `dong`, commit `6b30c73`).
Restyle only — no behaviour/API changes; Sober's no-double-container note followed (auth uses a
centered `Box maw` inside the Shell container, not a nested `Container`). Design: clean/minimal,
legible both modes, avoided the uppercase-tracked "eyebrow" slop (plain sentence-case section labels).

**Files:**
- `components/AuthCard.tsx` (new) — shared centered auth card (brand + title + subtitle) used by both
  `login` and `register`, so they're identical.
- `app/login/page.tsx` + `app/register/page.tsx` (mod) — use `AuthCard`; full-width submit; centered
  cross-link. Same submit handlers / errors / navigation.
- `app/people/page.tsx` (mod) — header with a live count + Export/New; filters grouped in a `Paper`
  via responsive `SimpleGrid` (1 col mobile → 3 desktop); tidy person cards (name/nickname, colored
  sentiment badge teal/gray/red, relationship·role, outline tag badges, Open/Edit); `Center` loader +
  filter-aware empty `Paper`. Same debounced `listPeople(filters)` + `fetchExportBlob`.
- `components/PersonForm.tsx` (mod) — grouped into **Basics** / **Thinking & communication style**
  (5 axis `Select`s in a 2-col grid) / **Topics, values & notes**; same state/`toInput`/validation/
  submit/delete.

**Verification (evidence) — real browser on :3020 (§7):**
- People list: renders all people; **light** (`#fff`) shows 3 cards with colored sentiment + tag
  badges; toggled **dark** — legible. Mobile 375: `scrollWidth==clientWidth`, no h-scroll.
- Form `/people/new`: sections "Basics / Thinking & communication style / Topics, values & notes",
  axis Selects, Create button; 375px no h-scroll. **Create smoke:** name → Create → back on `/people`
  with the new person (no regression).
- Auth `/login` + `/register`: `AuthCard` (brand + "Log in"/"Create your account" + email/password +
  cross-link), 400px centered, 375px no h-scroll.
- `bun run build` clean. Only console message is the known ColorSchemeScript React-19 dev warning
  (TASK-018 note). Ports freed.

**⚠️ Coordination — real backend needs local Postgres now (FYI to Sober):** `manager-gold-back` is
now on **Postgres (Jason's TASK-017, commit `b91413b`, in REVIEW)**. A plain `bun run start` with
defaults crashes on migrate (`CREATE SCHEMA "drizzle"` — no `DATABASE_URL`/local-PG configured in my
env), so the real backend isn't a one-command run for me the way SQLite was. I did **not** configure
his DB or run migrations against it (out of my lane). This restyle is a **pure-visual** change, so I
verified it against a **throwaway mock backend** I control (auth + people endpoints) + the auth
screens with no backend — same evidence quality for a restyle. A quick re-confirm against the real
API is trivial once TASK-017 is accepted and a runnable local-PG backend is the norm. Not a blocker.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-29 (commit `6b30c73` on `dong`). Read `AuthCard.tsx`,
`app/people/page.tsx`, `components/PersonForm.tsx` (+ login/register use `AuthCard`):
- **Restyle-only, no behaviour change** (the key risk): `people/page` keeps the same q/relationship/tag
  state, debounced `listPeople(filters)`, `onExport` (`fetchExportBlob`→Blob), and links — only JSX/
  layout changed (count header, filters in a responsive `SimpleGrid`, tidy person `Card`s, `Center`
  loader, filter-aware empty `Paper`). `PersonForm`'s `toInput`/`initialState`/props/submit are
  byte-identical; only `SectionLabel` grouping added. `AuthCard` is presentational.
- Followed my no-nested-container note (auth uses a centered `Box maw`, not a nested `Container`).
- Responsive at 375px verified; light+dark verified; build clean.
- **Accepted verification approach:** for a pure-visual restyle Fern used a throwaway mock backend
  (the real backend now needs local Postgres post-TASK-017) — fine here, the API contract is unchanged
  and this task only touches layout/rendering. A real-PG reconfirm is trivial now that TASK-017 is DONE.

DoD: all 4 met. → TASK-020 (profile + AI cards) is the last redesign task.
