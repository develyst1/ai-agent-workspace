# TASK-035: `admin/` app — local-only shell + an editor for every content document
- Source: SPEC-010 (D2, D5, §Data Model keys; REQ-010 R1, R2, AC-a, AC-b)
- Status: **DONE** (2026-11-01, Sober — see §Review. Was REVIEW 2026-11-01, Fern)
- Depends on: TASK-034 `DONE` (met) — the write contract in tasks/TASK-034-back-admin-write-api-guard.md §Contract + §Review (guard)
- Owner: Fern (FE)

**Zero real calls. Local only. No git write. Nothing under `front/` changes; nothing under `back/src/` changes** (if the contract
cannot serve the UI, ask in §Questions — do not widen it yourself).

## What to build

A new Next.js app at the repo root, **`admin/`** — the owner's private editor. Same stack and versions as `front/` (Next 15.5.24,
React 19, Mantine 8.3.18, `@tabler/icons-react`), bun lockfile. Dark theme = the front's: import `front/src/theme/theme.ts` through a
path alias (`"@front/*": ["../front/src/*"]`) the way `back/` imports front types; content types from `@front/types/app/content`.

1. **Scripts:** `"dev": "next dev -H 127.0.0.1 -p 4015"` — bound to loopback, so nothing on the network can open it. No `build`/`start`
   scripts in this TASK (it is never deployed while Q2 is open — say so in a 5-line `admin/README.md`: purpose, how to run with
   `back/` started as `ADMIN_ENABLED=1 bun run dev`, the two env vars, "local only until login exists").
2. **API client `admin/src/lib/api.ts`:** base `NEXT_PUBLIC_ADMIN_API_URL` (default `http://localhost:4014`). Every write sends
   `content-type: application/json`; the browser adds `Origin: http://localhost:4015` itself. Maps `400 {path}` / `403` / `404` /
   `415` / network error to typed results — never throws into the UI.
3. **Shell:** left nav grouped by page — *Site* (`site`) · *Home* (`copy.home`, `capabilities`, `career_stats`, `quotes`) · *About*
   (`copy.about`, `experience`, `skill_groups`, `values`, `certificates`, `testimonials`) · *Services* (`copy.services`, `services`,
   `process_steps`) · *Portfolio* (`copy.portfolio`, `projects`) · *Blog* (`copy.blog`; posts = TASK-036) · *Contact* (`copy.contact`,
   `contact_channels`, `faq`) · *AI* (`ai_profile`, labelled "What the AI knows beyond the pages" — SQ44d). A top banner states
   "Local admin — changes go live on this machine's site within a minute".
   **Before building, check this grouping against where each document actually renders** (grep the front components that take each
   prop) and correct the grouping in your notes if any document sits elsewhere.
4. **Editors — one generic form, driven by a field map** `admin/src/schema.ts`: per document key, its fields with a label, a kind
   (`text` · `longtext` · `tags` (string[]) · `url` · `image` (a URL string; picker comes in TASK-036 — a plain text input now) ·
   `optional`), and for list documents the item shape. List documents: add, remove (with a confirm), move up/down. `copy.<page>`
   edits each string; nested `{ title, lead, … }` blocks render as a small group. `ai_profile.markdown` = a tall textarea.
   **The field map must cover every field of every type** — a test enumerates the TypeScript interfaces' keys vs the map
   (write it as a `bun test` or `tsc`-checked `satisfies` — your choice, name it).
5. **Save:** one Save per document → `PUT /admin/api/documents/:key` with the whole value. On `400 {path}`: highlight that field and
   show the path; nothing else changes. On success: "Saved — live on the site within a minute" + the returned `updatedAt`.
   Unsaved changes → a dot on the nav item and a leave-page warning.
6. **States:** `back/` unreachable or started without `ADMIN_ENABLED` (404) → a full-page message saying exactly how to start it.
   `403` → the error code shown plainly (it means the guard refused — e.g. opened through another hostname).

Design: use the `impeccable` skill for layout/hierarchy; it is a work tool for one person — dense, calm, no decoration. Theme
tokens only (the desk's design-system rule), no new colour/font/spacing literals.

## Definition of Done

- [ ] 1. `cd admin && bun install && npx tsc --noEmit` → 0. The field-map coverage check green (paste).
- [ ] 2. `back/` on a seeded scratch store with `ADMIN_ENABLED=1` (+ dead gateway) and `admin` dev on 4015: pictures of the shell and of
      three editors (`site`, `projects`, `copy.about`) at 1440 — `../project-docs/fe-task035-2026-11-01/`.
- [ ] 3. **AC-b path, timed:** change `site.availability`, one project title, one certificate year in the admin → Save each → the public
      front (`CONTENT_API_URL` → the same `back/`, standalone build) shows all three within 60 s. Paste the timestamps; pictures before/after.
- [ ] 4. An invalid save (empty a required list item's title, if the validator rejects it — else a wrong type via a field you can force)
      → the field is highlighted with the returned `path`; the public page unchanged.
- [ ] 5. Open `http://<this machine's LAN IP>:4015` → refused (not listening). Paste the result.
- [ ] 6. `cd back && bun test` still green; `git status --short` lists only `admin/**` (+ `.gitignore` if you add `/admin/node_modules`,
      `/admin/.next` — do add them). Zero real calls; servers stopped; scratch deleted.

## Implementation Notes
Fern, 2026-11-01. Repo `portfolio-nichaphon-web`, branch `D1` @ `b068fba`, tree carrying TASK-029…038 uncommitted. Before: `git status`
= the TASK-029…038 set + `M .gitignore` (`/back/data/`). After: the same + `?? admin/` (16 files) + 2 more `.gitignore` lines. No file
under `front/` or `back/` edited; `front/.next` rebuilt (ignored). **Zero real calls** (gateway pinned to dead `127.0.0.1:3999`). No git write.

**Files (all new, `admin/`):** `package.json` (dev = `next dev -H 127.0.0.1 -p 4015`, no build/start) · `bun.lock` · `tsconfig.json`
(`@front/*` and `@/*` → `../front/src/*`, same as `back/`) · `next.config.ts` (`experimental.externalDir` — Next will not compile
`../front/src` without it) · `postcss.config.mjs` (copy of front's) · `README.md` (5 lines) · `src/app/{layout,page,providers}.tsx`
(front's fonts, `globals.css`, `theme` + `cssVariablesResolver`, dark forced) · `src/lib/api.ts` · `src/lib/edit.ts` + `edit.test.ts` ·
`src/schema.ts` · `src/components/{AdminApp,Editors,FieldInput}.tsx`. `.gitignore`: `+ /admin/node_modules`, `+ /admin/.next`.

**DoD**
1. `cd admin && bun install` → "no changes"; `bunx tsc --noEmit` → exit 0 (also `node node_modules/typescript/bin/tsc`). ⚠️ The DoD's
   literal **`npx tsc`** fails in `admin/` ("This is not the tsc command you are looking for") — bun on Windows writes `.exe/.bunx`
   shims npx can't see; `front/` works with npx because its `.bin` differs. **Coverage check = `tsc` over `satisfies` in `schema.ts`**:
   item maps are `{ [K in keyof Required<T>]: Field<T[K]> }` against the front's types (`SiteContent`, `SiteCopy` from
   `front/src/lib/content.ts`) — a missing field, an extra field, a kind that does not fit the type, or an optional field not marked
   `optional` fails. Probe (scratch copies, deleted): `link` removed → `TS2741 Property 'link' is missing`; certificate `year` as `tags` →
   `TS2322 '"tags"' is not assignable to 'TextKind'`; exit 2. `bun test` (edit helpers) 9 pass / 0 fail. → `dod1-*.txt`.
2. Seeded scratch store (16 docs / 6 posts / 9 media), `back/` `ADMIN_ENABLED=1` + dead gateway on 4014, admin on 4015, 1440×900:
   `01-shell-and-site` · `02-projects` · `03-copy-about`. (Pane screenshots are stored downscaled to 800 px wide.)
3. **AC-b, timed (UTC):** saves `site` 19:06:18.832Z · `projects[0].title` 19:06:37.814Z · `certificates[0].year` 19:06:51.507Z.
   Public standalone (`CONTENT_API_URL=http://localhost:4014`, 3072), polled every 5 s: 19:06:56 project ✓ cert ✓ availability ✗ ·
   19:07:01 all three ✓ → worst **43 s** (availability), within 60. The lag = Next's 60 s cache: the first request after expiry serves
   stale and refreshes. Before: greps 0/0/0 (`acb-before-greps.txt`) + `04-public-home-before`; after: `06`/`07`/`08`; `acb-poll.log`.
4. Validator accepts `""` for a required title (`str`), so the type was forced: a one-shot `fetch` wrapper in the admin tab set
   `projects[0].techStack[0] = 123` on the next PUT → `400 path=projects[0].techStack[0]`; item 01 opened, Tech stack field red with the
   path, banner "Not saved"; store still `"Next.js"`, public `/portfolio` order unchanged after 61 s (`09`, `back-admin-log.txt`).
5. `curl http://10.145.222.99:4015/` → `(7) Could not connect`; `netstat` → `127.0.0.1:4015 LISTENING` only (`dod5-lan-refused.txt`).
6. `cd back && bun test` → **85 pass / 0 fail**; `git status` = `admin/**` + `.gitignore` (`dod6-status.txt`). Servers 4014/4015/3072
   stopped (ports free), scratch store + temp files deleted, no `back/data`, no npm lockfile.
Evidence: `../project-docs/fe-task035-2026-11-01/` (11 pictures + 7 text files).

**Grouping check (step 3):** grepped `front/src/components` for each document — matches the TASK except **`quotes`**: rendered on Home
(q2, q4), About (q3) and Services (q1). Kept under Home, labelled "Client quotes (also About, Services)"; the ID hint warns pages pick
by `q1`–`q4`. `site` also feeds header/footer/contact — kept under Site.

**FE decisions (internal; say if any is wrong):**
1. Two string-list kinds instead of one: `tags` (techStack, items, tags) = chips; `lines` (highlights, experience body) = one per line,
   blank lines dropped at Save. Plus `bool` (experience `featured`) — the TASK's kind list had no boolean.
2. An emptied optional field is **removed**, not stored as `""`/`[]`/`false` (keeps "no `link` = no demo"). Labels show "(optional)".
3. New list item = every required field empty, `id` = first free `new-N` (editable). Copy has typed field maps too (from `SiteCopy`),
   so labels exist per string; Save of `copy.<page>` sends the whole `copy` with the other pages **as stored** (their drafts stay drafts).
4. Flag-off and unreachable look the same in a browser (absent route → 404 with no CORS header → `fetch` rejects) → one full-page
   message for both (`10-back-unreachable-state`). Seen live: unreachable. Flag-off **UNVERIFIED in the browser** (reasoned from
   `registerAdmin`; settles by starting `back/` without the flag). 403 page built, not seen (the guard 403s only foreign Host/Origin/
   proxy, which this browser can't produce from 4015).
5. Open the admin as **`http://localhost:4015`**: from `http://127.0.0.1:4015` the Origin ≠ `ADMIN_ORIGIN`, CORS blocks → the
   "not running" page. README says so; not a contract change.
6. Accordion `transitionDuration={0}` + panel content mounted only while open: textareas measured mid-animation stuck at 3 rows.
7. No phone layout: dev server is loopback-only, so it only ever opens on his desktop. Checked 768: fits, no horizontal scroll (`11`).

**`/impeccable audit`** (product register; no PRODUCT.md, the code is the context): A11y 3 · Perf 4 · Responsive 3 · Theming 4 ·
Anti-patterns 4 = **18/20**. Fixed: **P1** Mantine error ink `#e03131` = 4.37:1 on the body (< 4.5 for 12 px) → `--mantine-color-red-text`
(`#ff8787`, 8.51:1 on body) on every field error; **P2** focus fell to `<body>` when the trash button swapped for the confirm → `Keep`
autofocuses (verified: `activeElement` = "Keep"); **P3** optional fields unmarked → "(optional)". Left: P3 Remove/Keep buttons are
compact (< 44 px, mouse tool); P3 first load is a spinner, not a skeleton. Colours: only `green`/`red` (the front's alert pair; `green`
= the theme's designed accent wash); no hex, no z-index, no `transition`. `01 02 …` on list items is the real order (it moves).
`/simplify` **not run** (self-reviewed the diff instead). Impeccable reported an update (v3.9.1 → v4.8.0) — the owner's tool, not mine.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review

**Verdict: DONE** (Sober, 2026-11-01). Zero real calls in review.
- Re-run: `cd admin && bunx tsc --noEmit` → 0; `bun test` (edit helpers) → 9 pass / 0 fail; `cd back && bun test` → 85 pass / 0 fail;
  `admin/package.json` has `dev` only, bound `-H 127.0.0.1 -p 4015`; `git status` outside back/front = `.gitignore` + `?? admin/` only.
  Opened `09-invalid-save-highlight.jpg`: "Not saved — back/ rejected one field", the path, the field outlined, "nothing was stored".
- **AC-b met on local, timed:** worst 43 s ≤ 60 (Next's cache, as designed). LAN probe refused, loopback-only listener — D5 holds for the UI too.
- The coverage check as `satisfies` over `Required<T>` with the two probes failing `tsc` is exactly the guarantee I asked for — accepted.
- **DoD 1's `npx tsc` was my error** for `admin/` (bun's Windows shims); `bunx tsc` is the command there. Accepted.
- Your 7 calls — **all accepted**: `tags`/`lines`/`bool` kinds; emptied optional = removed (keeps "no link = no demo"); new item
  `new-N`; `copy` saves the whole object with other pages as stored; one page for flag-off and unreachable (flag-off reasoned, not seen
  — cosmetic, accepted); **open as `http://localhost:4015`** (README says so); accordion fix; desktop-only. Grouping note on `quotes` — good catch, kept.
- Audit 18/20 with the P1 contrast fix — fine for a one-person tool.
- **FYI recorded, no change** `[SA-decided]`: the TASK-034 validators accept `""` for a required string, so he *can* save a blank title
  and the public page will show it blank. That is his content choice, not a guard hole; if he wants "required = non-empty", it is a
  validator line. Rides to Porter with the REQ-010 acceptance notes.
