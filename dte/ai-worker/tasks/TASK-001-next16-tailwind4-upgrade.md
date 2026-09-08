# TASK-001: Upgrade `front/` — Next 15 → 16 and Tailwind 3 → 4
- Source: SPEC-001 (Decision 2)
- Owner: FE (Fern)
- Status: **DONE** (2026-09-07 07:55, Sober — reviewed; 3 UNVERIFIED items accepted, see §Review)
  *(History: TODO/IN_PROGRESS 2026-09-07 → REVIEW 2026-09-07 by Fern → DONE. BLOCKED until the C5(b) gate closed.)*
- Depends on: none

> ✅ **CLEARED TO RUN, 2026-09-07.** Porter carried this plan to the owner exactly as REQ-001
> C5(b) required and he answered **"รันเลย"** (`SYSTEM-FACTS.md` A16). Sober flipped the status.
> **"Run" means run it LOCALLY on `develop`, with your own evidence** — production stays the
> owner's alone (PROTOCOL.md "Environments"). Nothing else about this plan changed.
>
> *(History: this read `BLOCKED (waiting: the owner — he asked to SEE this plan before it runs)`
> from when it was written on 2026-09-07 until the gate closed the same day.)*

## What to do

One upgrade, in `front/` only, in this order. `back/` is not touched. No screen is redesigned
and no component library is installed here — that is TASK-003, behind a separate owner gate.

### Step 0 — safety net (before any edit)

- Confirm `git status` in the repo is clean, and record the current commit hash in
  §Implementation Notes. **You do not commit anything** — the human owns git. The hash is so the
  rollback below is a one-liner for him.
- Copy `front/package.json` and `front/package-lock.json` to `front/package.json.bak` /
  `front/package-lock.json.bak`. Delete both `.bak` files at the end of the task (the repo is the
  owner's to keep clean).
- Record the "before" evidence: `node -v`, `npm ls next react react-dom`, and a full
  `npm run build` — **its real output, pasted**. If the build already fails before you change
  anything, **stop and report that**; do not upgrade on top of a broken baseline.

### Step 1 — Next 16 + React

Pin exact versions, no `^`/`~` (the house pattern's rule, and the reason past projects hit peer
warnings):

```
next@16.2.9  react@19.2.7  react-dom@19.2.7
```

- Then `npm ls react` must print **one** `19.2.7`. Two Reacts is the actual cause of
  "Invalid hook call" / hydration errors — if you see two, stop and report.
- `@next/third-parties` is currently `^15.5.4` and tracks Next's major: bump it to its 16 line.
  If npm cannot resolve a matching version, **stop and ask Sober** — do not leave it on 15 and
  do not substitute a different package.
- Turbopack is already used for `dev` and `build` here, so the 16 default is not a change.
  Leave the `--turbopack` flags as they are.
- Expect App Router API churn: `params` / `searchParams` are async. `classroom/[id]/page.tsx` is
  the only dynamic route in the tree — check it explicitly and paste what you found.

### Step 2 — Tailwind 4

- `tailwindcss@4.3.0` + `@tailwindcss/postcss@4.3.0`; `postcss.config.mjs` switches from
  `{ tailwindcss: {}, autoprefixer: {} }` to the `@tailwindcss/postcss` plugin (autoprefixer is
  folded in — remove it only if the build confirms it is redundant, and say so in the notes).
- `front/tailwind.config.ts` is JS-config; Tailwind 4 is CSS-first. **Do not silently drop the
  config** — either keep it via `@config` or port it into `@theme`. State which you did and why.
- While porting, fix the defect SPEC-001 §Decision 3 records: the config declares
  `rgb(var(--bg-primary) / <alpha-value>)` while `src/styles/themes.css` defines those variables
  as **hex**. Either the variables become `R G B` triplets or the config stops wrapping them in
  `rgb()` — pick one, apply it consistently, and say which. `themes.css` stays the palette of
  record; do not introduce a second palette.
- The config's custom plugin defines utilities (`.bg-primary`, `.text-primary`, …) whose names
  collide with the colours in `theme.extend`. Carry the collision forward as-is if you can; if
  Tailwind 4 rejects it, report what it said rather than renaming classes used by pages.

### Step 3 — prove nothing broke

Every route below, in a real browser against `npm run dev`, in **both** light and dark (the
`ThemeToggle` is load-bearing here):
`/` · `/courses` · `/login` · `/register` · `/verify-email` · `/teach` · `/classroom/<some id>` ·
`/about` · `/blog` · `/contact` · `/portfolio` · `/services`

(The last four are slated for deletion by REQ-003 but still exist today — a blank page after an
upgrade is still a regression, and they are cheap to open.)

For each: does it render, does the theme toggle still switch it, and does the console show new
errors? Anything you could not check — a route needing a real logged-in user or a real course id
— is written `UNVERIFIED — <what would settle it>`. Do not paper over it.

## Definition of Done

- [ ] `npm run build` succeeds — paste the real command and its real output.
- [ ] `npm ls next react react-dom tailwindcss` shows the pinned versions and **one** React —
      paste the output.
- [ ] `npm run dev` starts, and each of the 12 routes above is recorded as OK / broken /
      UNVERIFIED with what you actually saw. A list without observations is not evidence.
- [ ] Light **and** dark verified on at least `/`, `/login`, `/classroom/[id]`.
- [ ] No `^`/`~` on `next`, `react`, `react-dom`, `tailwindcss`, `@tailwindcss/postcss`.
- [ ] The two `.bak` files are deleted and `git status` shows only intended files changed.
- [ ] §Implementation Notes states the Tailwind-config decision (Step 2) and the hex-vs-rgb fix.

## Blast radius

- **Every page of `front/`.** This changes the framework and the CSS pipeline; there is no screen
  it cannot affect. That is precisely why it is its own TASK and runs before any screen migration.
- **`back/` — zero.** No file under `back/` is touched, no API contract changes.
- **Production — zero, by this task.** Nothing is deployed by an agent. The blast reaches real
  users only when *the owner* deploys, and `dte.develyst.online` runs `develop`'s tip
  (`SYSTEM-FACTS.md` A4) — so he should know that merging this to `develop` is what puts it in
  front of users, not this task.
- **Worst realistic failure:** Tailwind 4's config migration silently changes spacing/colour on
  screens nobody opened, or an antd-free CSS-order change alters the marketing pages. The
  12-route light+dark walkthrough exists to catch exactly that, and it is the owner's own eyes
  that settle it — there is no QA here.

## Rollback

Single step, and the human runs it: `git checkout -- front/package.json front/package-lock.json
front/postcss.config.mjs front/tailwind.config.ts` (plus any source file this task touched — list
them in §Implementation Notes as you go), then `rm -rf front/node_modules && npm ci` in `front/`.
Because nothing here is committed by an agent and no screen is migrated in this task, the tree
returns to the recorded commit hash from Step 0 with no half-migrated state to untangle.

## Implementation Notes

*(Fern, 2026-09-07. Every claim below carries the command and its real output. Anything not
actually run is `UNVERIFIED — <what would settle it>`.)*

### Step 0 — safety net

- `git status --short` in the repo was **clean** (no output) before any edit.
- Commit hash recorded for the human's rollback: **`253eeda9fbdf1fa3eca73558361fcb437b5745e0`**
  (`feat: update sender and instructor fields to use display names`).
- ⚠️ **The checked-out branch is `D1`, not `develop`.** `git rev-parse D1` and `git rev-parse develop`
  both return `253eeda9…`, so the working tree content is identical to `develop`'s tip and the edits
  are the same edits either way. I did **not** switch branches — a checkout is a git write and git is
  the human's. Flagged to Sober in `## Questions` Q1.
- `front/package.json` / `front/package-lock.json` were copied to `.bak`, and **both `.bak` files were
  deleted at the end** (`ls *.bak` → nothing).
- `node -v` → **v22.23.2** · `npm -v` → **10.9.8**
- `front/node_modules` did not exist; `npm ci` installed 186 packages from the committed lock file.
- **Baseline BEFORE any change** — `npm ls next react react-dom tailwindcss`:
  `next@15.5.4` · `react@19.2.4` · `react-dom@19.2.4` · `tailwindcss@3.4.17`, one React in the tree.
- **Baseline `npm run build` SUCCEEDED** on Next 15.5.4 (Turbopack): `✓ Compiled successfully in 2.5s`,
  `✓ Generating static pages (15/15)`, 13 routes listed, `/` at 8.97 kB. So the upgrade did **not**
  start on a broken baseline.

### Step 1 — Next 16 + React

- `npm install --save-exact next@16.2.9 react@19.2.7 react-dom@19.2.7 @next/third-parties@16.2.9`
- `npm ls react --all` → exactly **one** `react@19.2.7`. (The other `…react@…` strings in that output
  are package *names* — `@headlessui/react@2.2.9`, `@heroicons/react@2.2.0`, `lucide-react@0.546.0`,
  `@floating-ui/react@0.26.28` — not React copies.)
- `@next/third-parties`: a stable **16.2.9** exists and matches `next` exactly, so it was pinned to
  that. No substitution was needed. (It is imported **nowhere** in `src/` — `grep -rn "third-parties" src/`
  returns nothing — so it is a dependency with no current usage.)
- Turbopack flags left untouched on `dev` and `build`, as instructed.
- **Async `params` / `searchParams`: nothing to change.** `grep -rn "searchParams|useParams|params" src/app`
  shows every use is a **client hook**, never a page prop:
  - `classroom/[id]/page.tsx` is a `'use client'` component and reads the id via `useParams()`
    (lines 4, 38, 52, 68, 84, 108).
  - `login`, `register`, `verify-email` use `useSearchParams()`.
  There is no `async function Page({ params })` anywhere in the tree, so the Next 16 async-params churn
  does not touch this app.
- `npm run build` on Next 16 + Tailwind 3 succeeded before Tailwind was touched:
  `▲ Next.js 16.2.9 (Turbopack)` · `✓ Compiled successfully in 2.4s` · `✓ Generating static pages (14/14)`.
- **Next 16 rewrote two files by itself** during the build (not my edits, and reverting them is pointless
  because the next build rewrites them): `front/next-env.d.ts` (`/// <reference path=…>` becomes an
  `import "…"`) and `front/tsconfig.json` (`"jsx": "preserve"` → **`"react-jsx"`**, `.next/dev/types/**/*.ts`
  added to `include`, arrays reformatted one-per-line). Listed here so they are not mistaken for hand edits.

### Step 2 — Tailwind 4

- `npm install --save-exact -D tailwindcss@4.3.0 @tailwindcss/postcss@4.3.0`
- `postcss.config.mjs`: `{ tailwindcss: {}, autoprefixer: {} }` → `{ "@tailwindcss/postcss": {} }`.
- **autoprefixer removed** (`npm uninstall autoprefixer`) — it is folded into `@tailwindcss/postcss`,
  the build confirmed it is redundant (`✓ Compiled successfully in 2.1s` after removal), and after the
  postcss change nothing in the repo referenced it any more. It was an orphan created by this task.
- `src/app/globals.css`: the three `@tailwind` directives became `@import "tailwindcss";`.

**Tailwind-config decision (Step 2 asks for this explicitly): the JS config was KEPT via `@config`,
not ported to `@theme`.** `globals.css` now carries `@config "../../tailwind.config.ts";`.
Why: `tailwind.config.ts` is not just theme tokens — it contains a **JS plugin** (`addUtilities`) that
defines eleven utilities the pages use. `@theme` cannot express a plugin, so porting would have meant
rewriting those utilities as CSS in the same task that swaps the framework. `@config` keeps the
migration to one moving part and leaves the CSS-first port as a separate, reviewable decision.
It works: the utilities are present in the built CSS (`.bg-primary`, `.text-accent`, `.ring-focus`,
`.animate-blob`, `.animation-delay-2000` all emitted).

**hex-vs-rgb defect (SPEC-001 §Decision 3) — fixed by dropping the `rgb()` wrapper, NOT by converting
the variables to `R G B` triplets.** `src/styles/themes.css` stays the palette of record, still hex,
and **no second palette was introduced**. `'rgb(var(--bg-primary) / <alpha-value>)'` became
`'var(--bg-primary)'` in `theme.extend.colors`, and `'rgb(var(--bg-primary))'` became `'var(--bg-primary)'`
in the plugin.
Why this direction: `themes.css` is consumed directly as `var(--x)` by `globals.css` (`.light body`,
`::selection`, `a`) and by inline styles in components; turning the variables into triplets would have
broken every one of those and forced a second, `rgb()`-shaped palette. The only thing lost is the alpha
modifier on those eight colours, and **no page uses one** —
`grep -rnoE "\b(bg|text|border)-(primary|secondary|tertiary|accent)/[0-9]+" src/` returns nothing.
Note both sides of that defect were **already broken before this task**: `rgb(#FAFAF9 / 1)` is invalid
CSS, so those utilities silently did nothing under Tailwind 3 as well.

### Step 2b — the plugin/theme name collision, and what Tailwind 4 did with it

The TASK said to carry the collision forward if possible and report what Tailwind said. **Tailwind 4
did not reject it — it resolved it the opposite way from Tailwind 3, silently.** Evidence, from
compiling the *same* config with both majors:

- Tailwind 3 (`npx tailwindcss@3.4.17 -c tailwind.config.ts -i in.css -o out3.css`) emits each colliding
  class **twice**, plugin last, so the plugin wins:
  `.text-secondary { color: var(--bg-secondary); }` … then … `.text-secondary { color: var(--text-secondary); }`
  and `.hover\:text-primary:hover { color: var(--bg-primary); }` … then … `{ color: var(--text-primary); }`
- Tailwind 4 (`npm run build`, production CSS) emits **one** rule and it is the theme-derived one:
  `.text-secondary{color:var(--bg-secondary)}` · `.border-secondary{border-color:var(--bg-secondary)}`
  · `.text-primary{color:var(--bg-primary)}` · `hover\:text-primary:hover{color:var(--bg-primary)}`

So `text-secondary` would have shifted from stone-600 body text (`#57534E`) to stone-100 (`#F5F5F4`) —
near-invisible text — across every page that uses it, with no error anywhere. Confirmed in the browser
before the fix: a `<p class="text-secondary">` computed `rgb(245,245,244)`.

**Fix, and it renames nothing:** the two colour keys whose derivations were the wrong *meaning* —
`'primary': var(--bg-primary)` and `'secondary': var(--bg-secondary)` — were removed from
`theme.extend.colors`, leaving the plugin as the single definition of those names. Every class the
pages actually use survives; usage is small and was enumerated first:
`text-secondary` ×5, `hover:text-primary` ×4, `border-secondary` ×1, `bg-primary` ×1, and **no**
`ring-` / `from-` / `to-` / `divide-` / `placeholder-` / `shadow-` variant of `primary`/`secondary` anywhere.
Verified in the final production CSS — every value now equals Tailwind 3's effective value:

```
.bg-primary{background-color:var(--bg-primary)}      .text-primary{color:var(--text-primary)}
.bg-secondary{background-color:var(--bg-secondary)}  .text-secondary{color:var(--text-secondary)}
.text-tertiary{color:var(--text-tertiary)}           .text-accent{color:var(--color-primary)}
.border-primary{border-color:var(--border-primary)}  .border-secondary{border-color:var(--border-secondary)}
hover\:text-primary:hover{color:var(--text-primary)}
```

### Step 2c — second silent regression: Tailwind 4 cascade layers

Tailwind 4 wraps its output in native cascade layers (confirmed in the browser: the page's layers are
`properties, theme, base, utilities`). **An unlayered rule beats every layered rule regardless of
specificity**, so the plain element rules at the bottom of `globals.css` — which sat *after*
`@tailwind utilities` under Tailwind 3 and lost to utilities on specificity — started winning.
Measured before the fix: `<a class="text-secondary">` computed `rgb(14,165,233)` (from the
`a { color: var(--color-primary) }` rule) instead of `--text-secondary`. That is every link on the site.

Fix: the trailing global block of `globals.css` (from `body {` to the final `a:hover` — `body`,
`.light body`, `.dark body`, the scrollbar rules, `*`, `*:focus`, `::selection`, `a`, `a:hover`) is
wrapped in **`@layer base { … }`**, restoring the Tailwind-3 outcome. Verified after: the same probe
computes `rgb(87,83,78)` = `--text-secondary`, and `border-secondary` computes `rgb(214,211,209)` =
`--border-secondary`.

**One thing I tried and reverted, so nobody re-does it:** I also imported `themes.css` with
`layer(base)`. It is a **no-op** — `src/app/layout.tsx` imports `@/styles/themes.css` a *second* time,
unlayered and after `globals.css`, so `themes.css` already beat utilities under Tailwind 3 too
(`.btn-primary`'s `transition: all .2s` beat `duration-300` in both majors). Reverted; `globals.css`
line 2 is byte-identical to before.

### Step 3 — the routes, in a real browser against `npm run dev`

`npm run dev` → `▲ Next.js 16.2.9 (Turbopack)` · `- Local: http://localhost:3000` · `✓ Ready in 458ms`.
No `.env` file exists, so `NEXT_PUBLIC_API_URL` fell back to the in-code `http://localhost:4002` and
`NEXT_PUBLIC_AI_API_URL` was undefined. **Nothing was pointed at production; no request left the machine.**
The backend was **not** running (it is Jason's), so anything needing real API data is UNVERIFIED below.

| Route | Result |
|---|---|
| `/` | **OK** — renders, light and dark both checked |
| `/courses` | **OK** — renders the mock list ("ทักษะทั้งหมด (20 ทักษะ)"), dark checked |
| `/login` | **OK** — renders, light and dark both checked |
| `/register` | **OK** — form renders, dark checked |
| `/verify-email` | **OK** — renders its no-token error state (expected without a token), dark checked |
| `/about` | **OK** — renders, dark checked |
| `/blog` | **OK** — renders, dark checked |
| `/contact` | **OK** — renders, dark checked |
| `/portfolio` | **OK** — renders, dark checked |
| `/services` | **OK** — renders, dark checked |
| `/teach` | **UNVERIFIED** — the auth guard redirects to `/login` (the login screen itself renders fine). Settled by: a logged-in teacher account against a running local `back/`. |
| `/classroom/1` | **UNVERIFIED** — same auth guard, redirects to `/login`. Settled by: a logged-in user plus a real course id against a running local `back/`. |

- **Theme toggle, on the final build:** clicked the Navbar "Toggle theme" button on `/login` and chose
  **Light** from its menu → `localStorage['dte-theme']` became `light`, `<html>` became `class="light"`,
  and the page repainted light. Light and dark were both captured on `/` and `/login`.
- **Light + dark on `/classroom/[id]` could not be done** — the route is behind the auth guard.
  `UNVERIFIED — a logged-in user and a real course id, with local back/ running, would settle it.`
- **Console:** the only errors were `WebSocket connection to 'ws://localhost:3000/_next/webpack-hmr…'
  failed` — the dev HMR socket left over from restarting the dev server during this task, not app code.
  No React errors, no hydration errors, no "Invalid hook call".

### Honest limits of this evidence

- **Deep-scroll screenshots are not evidence here and I did not treat them as such.** After scrolling,
  the capture in my browser tool goes stale: I injected a `position: fixed` red probe box at the
  top-left of the viewport and it did **not** appear in the screenshot, while the DOM reported the
  page's text as `visibility: visible`, `opacity: 1`, dark-on-light. So below-the-fold appearance on
  every route is `UNVERIFIED — the owner scrolling each page himself is what settles it.`
  Above-the-fold rendering, computed styles and the console are real evidence and are what the table
  above rests on.
- Nothing was deployed, no git write was made, `back/` was not touched, production was never contacted.

### Files changed by me

- `front/package.json`, `front/package-lock.json` (versions; autoprefixer removed)
- `front/postcss.config.mjs`
- `front/tailwind.config.ts`
- `front/src/app/globals.css`

Rewritten by Next 16 itself, not by hand (add to the human's rollback list):

- `front/next-env.d.ts`, `front/tsconfig.json`

`git status --short` at the end shows exactly these seven files and nothing else. Both `.bak` files
are gone.

### Definition of Done

- [x] `npm run build` succeeds — output pasted above (Next 16.2.9, 14/14 static pages, 13 routes).
- [x] `npm ls next react react-dom tailwindcss` shows the pins and **one** React — pasted above.
- [x] `npm run dev` starts and all 12 routes are recorded OK / UNVERIFIED with what I saw.
- [x] Light **and** dark verified on `/` and `/login`. **`/classroom/[id]` NOT done — UNVERIFIED**, auth guard.
- [x] No `^`/`~` on the five pinned packages (checked in `package.json`, all exact; `@next/third-parties` too).
- [x] Both `.bak` files deleted; `git status` shows only intended files.
- [x] §Implementation Notes states the Tailwind-config decision and the hex-vs-rgb fix.

## Questions

*(Fern asks here; Sober answers as `> answer: ...`)*

- **Q1 — the repo is checked out on branch `D1`, not `develop`.** Both names point at the same commit
  (`253eeda9…`), so the tree I edited is `develop`'s tip content and the diff is the same either way.
  I did not `git checkout develop` because that is a git write and git is the human's alone.
  **Is `D1` where these edits are meant to sit, or does the human need to move them to `develop`
  before he commits?** I have not acted on either reading.
  > answer (Sober, 2026-09-07): **Do nothing, and you were right not to.** Your seven changed files
  > are *uncommitted working-tree* changes — I re-checked read-only, `git status --short` shows
  > exactly those seven and nothing else — so they belong to no branch yet. `D1` and `develop` both
  > resolve to `253eeda9…`, so the edits themselves imply no move. Which branch they are committed
  > on is a **git write, and git is the human's alone.**
  > I am **not** deciding it and I am not inferring one: `board.md` says work happens on `develop`,
  > but the checkout being on `D1` is a fact about his machine whose reason nobody here knows.
  > Raised to Porter, for the owner, as a one-line question.
- **Q2 — the plugin/theme collision fix changes the config's shape, and that may be yours to approve.**
  TASK-001 said to carry the collision forward and, if Tailwind 4 rejected it, to report rather than
  rename classes. Tailwind 4 did not reject it; it silently flipped which rule wins (§Step 2b). I
  removed the two colliding colour keys because leaving it would have shipped near-invisible
  `text-secondary` text site-wide, and because it renames no class any page uses. **If you would rather
  the collision stayed untouched and the colour shift be accepted, say so and I will revert that hunk.**
  > answer (Sober, 2026-09-07): **APPROVED — do not revert.** "Carry the collision forward" carried an
  > assumption that carrying it forward *preserved behaviour*. §Step 2b proves it did not: Tailwind 4
  > silently flipped which rule wins. Carrying it forward would therefore have **violated** the binding
  > constraint — SPEC-001 §Non-functional, "a migrated screen must look and behave as it did".
  > Near-invisible `text-secondary` body text site-wide is a regression, not a preserved state.
  > Your fix restores the Tailwind-3 effective value for every one of those classes and renames nothing.
  > I re-verified the load-bearing claim myself, read-only, over `front/src/**/*.{ts,tsx}`: the only
  > utilities of that family the code uses are `text-secondary` ×5, `text-primary` ×4,
  > `border-secondary` ×1, `bg-primary` ×1 — **zero** `ring-`/`from-`/`to-`/`via-`/`divide-`/
  > `placeholder-`/`shadow-`/`outline-` variants and **zero** `/alpha` modifiers. Removing the two
  > `theme.extend.colors` keys costs nothing that exists. (My first grep also hit `bg-accent` /
  > `border-accent`; those are the `--bg-accent` / `--border-accent` *variables inside* `themes.css`,
  > not utility classes in markup — no page uses those utilities either.)
  > ⚠️ **Residual, accepted, recorded so it is not rediscovered as a bug:** the `accent` key in
  > `theme.extend.colors` STILL collides with the plugin's `.text-accent`. It is benign *today* only
  > because both sides resolve to `var(--color-primary)`. Change either side and the silent flip
  > returns. That becomes a rule in `front/FRONTEND-CONVENTIONS.md` — added to TASK-002 §What to do.
- **Q3 — pre-existing, NOT touched, not in this task's scope.** `src/app/layout.tsx` puts
  `bg-theme-primary text-theme-primary` on `<body>`; those classes are defined in `themes.css`, so they
  do work — but `layout.tsx` also imports `themes.css` a second time (line 4) when `globals.css`
  already imports it (line 2), so that stylesheet is bundled twice. Also `globals.css` defines
  `.animate-fade-in` twice with different durations (0.3s at the top, 0.8s inside `@layer utilities`).
  Both are pre-existing; I left them alone. **Do you want either written up as its own TASK?**
  > answer (Sober, 2026-09-07): **Neither becomes a TASK. Both become conventions (TASK-002).**
  > (a) The **double import of `themes.css` is not a cleanup — it is load-bearing.** Your own §Step 2c
  > found why: the second, unlayered import in `layout.tsx` is what keeps `themes.css` beating
  > Tailwind's utility layer. Deleting the "duplicate" would change the cascade on every page. I
  > confirmed read-only that `themes.css` contains **no element selectors at all** — every rule is
  > class-based — which is exactly why your `layer(base)` experiment was correctly reverted. A future
  > TASK touching it must know this, so it is a written convention, not a defect to fix.
  > (b) `.animate-fade-in` twice (line 32 unlayered, line 135 inside `@layer utilities`): by the same
  > mechanism you measured, the **unlayered line-32 rule (0.3s) wins under Tailwind 4** — and it won
  > under Tailwind 3 too, where `@layer utilities` content is emitted at the directive position near
  > the top of the file. Same winner in both majors → no regression. But:
  > `UNVERIFIED — I reasoned this from the mechanism you proved; nobody has measured this rule.`
  > A duplicate-definition smell, not a proven bug; not worth a TASK on a live site.
  > I also checked the general form of your §Step 2c risk: **no bare element-selector rules remain
  > unlayered in `globals.css`** above the block you wrapped — everything up there is
  > class-specificity, which already won by source order under Tailwind 3. Your fix is complete.
- **Q4 — a build warning I deliberately did not silence.** Every build prints
  `[MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of …/front/tailwind.config.ts is not specified`
  and suggests adding `"type": "module"` to `front/package.json`. It is a performance warning only, the
  build succeeds, and adding `"type": "module"` changes how **every** `.js`/`.mjs` in `front/` is parsed
  — too wide a blast radius to slip into an upgrade task. **Own TASK, or leave it?**
  > answer (Sober, 2026-09-07): **Leave it. No TASK, and do not silence it.** Your blast-radius
  > reasoning is right — `"type": "module"` re-parses every `.js`/`.mjs` in `front/`, a far bigger
  > change than the warning it removes, and this is a *performance* warning on a build that succeeds.
  > It also has a natural death: it exists only because a JS `tailwind.config.ts` is still loaded via
  > `@config`, so it disappears when that config is retired in favour of CSS-first `@theme` — the
  > separate, reviewable decision you deliberately kept out of this task. **Accepted as a known,
  > permitted build warning**, recorded here so nobody re-raises it as an incident.

## Review

**Reviewed by Sober (SA Lead), 2026-09-07 07:55. Verdict: ✅ DONE**, with three UNVERIFIED items
accepted and carried up (below). Not a laundered "it works" — see what I did and did not check.

### What I checked myself, read-only, in the code repo (never a build, never a browser, never `back/`)

Reviewing the evidence, not the claim (PROTOCOL.md "Evidence and the missing QA role"):

| Fern's claim | How I checked it | Result |
|---|---|---|
| Only 7 files changed, both `.bak` gone | `git status --short` in the repo | ✅ exactly those 7, no `.bak` |
| Branch `D1` == `develop` == `253eeda9…` | `git rev-parse` on all three | ✅ identical |
| Five packages pinned exact, autoprefixer gone | read `front/package.json` | ✅ `next 16.2.9`, `react`/`react-dom 19.2.7`, `tailwindcss`/`@tailwindcss/postcss 4.3.0`, `@next/third-parties 16.2.9`, no `^`/`~`, no `autoprefixer` |
| postcss switched to the v4 plugin | read `front/postcss.config.mjs` | ✅ single `@tailwindcss/postcss` |
| Config kept via `@config`, not ported | `git diff` of `globals.css` | ✅ `@import "tailwindcss"` + `@config "../../tailwind.config.ts"` |
| hex-vs-rgb fixed by dropping `rgb()` | `git diff` of `tailwind.config.ts` | ✅ every `rgb(var(--x))` → `var(--x)`, in both `theme.extend` and the plugin |
| Cascade-layer fix scoped to the trailing block | `git diff` of `globals.css` | ✅ `@layer base { … }` wraps `body` → `a:hover` |
| The collision fix costs no used class | my own grep of `front/src/**/*.{ts,tsx}` for every `bg\|text\|border\|ring\|from\|to\|via\|divide\|placeholder\|shadow\|outline`-`primary\|secondary\|tertiary\|accent` variant | ✅ only `text-secondary` ×5, `text-primary` ×4, `border-secondary` ×1, `bg-primary` ×1; no `/alpha`; no removed class is used |
| `themes.css` double-import reasoning | grepped `themes.css` for element selectors | ✅ none — all class-based, so the `layer(base)` revert was correct |

**What I did NOT check and cannot:** I ran no build, started no dev server, opened no browser. The
build output, the 12-route walkthrough, the computed-style measurements and the Tailwind-3-vs-4 CSS
diff are **Fern's evidence and only Fern's**. I checked that they are internally consistent with the
files on disk; I did not reproduce them.

### Why this is DONE and not REWORK

Every Definition-of-Done line is met with pasted command output, and the three open items are
honest UNVERIFIEDs, not gaps in the work:

1. `/teach` and `/classroom/[id]` — behind the auth guard, so **not walked**. Settling them needs a
   logged-in user, a real course id and a running local `back/`. `back/` is Jason's and standing up a
   local database was never in this TASK. **Correctly UNVERIFIED, not papered over.**
2. **Light + dark on `/classroom/[id]`** — a Definition-of-Done line that is explicitly **NOT met**,
   for the same reason, and said so plainly rather than ticked. That honesty is why this is DONE.
3. **Below-the-fold appearance on every route** — Fern *disproved his own tool* (a `position: fixed`
   probe did not appear in the post-scroll capture) rather than trusting a stale screenshot. The
   owner's own eyes settle it.

Two silent regressions (§2b plugin/theme flip, §2c cascade layers) were found and fixed with
before/after measurements. Neither was visible in a green build; both would have shipped. That is the
single strongest piece of evidence in this TASK and it is exactly what the 12-route walkthrough
existed to catch.

### ⚠️ What Porter must carry to the owner (the residual risk of accepting this)

- **Nothing is deployed and nothing is committed.** The upgrade is seven uncommitted files in his
  working tree. It reaches real users only when **he** commits and merges — and `dte.develyst.online`
  runs `develop`'s tip (`SYSTEM-FACTS.md` A4), so that merge *is* the release.
- **The branch question (Q1) is his, not mine** — the checkout is on `D1`, not `develop`.
- **Two screens were never seen after the upgrade** (`/teach`, `/classroom/[id]`) and **no page was
  seen below the fold.** There is no QA on this project; his own eyes are the last check before he
  merges. Recommended: open those two screens logged in, and scroll each page, before merging.
- One build warning is **accepted on purpose** (`MODULE_TYPELESS_PACKAGE_JSON`) — see Q4.

### Follow-through I did, so nothing here is lost

- **TASK-002 §What to do** gains one item: `front/FRONTEND-CONVENTIONS.md` must record the two
  cascade traps this TASK uncovered (the surviving `accent` plugin/theme collision, and the
  load-bearing double import of `themes.css`). Discovered knowledge, written down once.
- No other TASK, no scope change. TASK-002 is unblocked by this verdict.
