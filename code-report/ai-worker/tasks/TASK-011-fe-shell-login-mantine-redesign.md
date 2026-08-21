# TASK-011: FE — app shell + login, Mantine-first + `hallmark redesign` (picks the theme)
- Source: SPEC-002
- Status: DONE (reviewed 2026-08-21 by Sober, commit `0b63dec`)
- Assignee: Fern (FE)
- Depends on: TASK-010

## What to do

Rebuild the **app shell** (`components/layout/AppShell/`, its header, the
language switch) and the **login screen** (`components/partials/Login/`) out of
`@mantine/core` components, redesigned with `hallmark`.

**This TASK also picks the theme for the whole product.** TASK-012 and TASK-013
consume it and do not run their own theme selection — SPEC-002 Decision 4: three
screens of one product are one brief, and a theme per screen would be three
colour systems.

### 1. The theme decision (this TASK, once)

- Run **`hallmark redesign`** — the redesign verb, not a fresh `design` run. Its
  own rail preserves routes, component ownership, copy intent and information
  architecture, which is exactly REQ-003 Requirement 6.
- The chosen theme lands **in `src/app/globals.css`, as tokens**. Both pointer
  files (`tailwind.config.ts`, `src/lib/theme.ts`) follow with no edit — if
  either needs an edit beyond adding a token name, say so in the notes, because
  that means the single-source property slipped.
- **The palette may change.** Q16 deliberately supersedes the visual result of
  TASK-006/007/008, so the current warm-65/accent-45 values are not protected.
  What is protected is the *shape*: one token block, OKLCH, no `#000`/`#fff`,
  one accent, neutrals tinted by the anchor hue.
- Paste the before/after token table in the notes so TASK-012/013 can be built
  against a written-down theme rather than by reading the CSS.

### 2. Mantine-first (SPEC-002 Decision 3)

- Every control on these screens is a `@mantine/core` component. A native
  `<button>`, `<input>`, `<select>`, `<textarea>` or `<label>` on a screen is a
  defect. Native `<div>`/`<span>` for pure layout scaffolding is fine.
- **Tailwind may not carry colour or type**: no `text-*`, `bg-*`, `border-*`
  colour utility and no `font-*` family utility anywhere in `src/`. Tailwind
  keeps layout, spacing, sizing and one-off geometry — the "customise
  components" job the stakeholder named.
- Where the project applies a **real default** (e.g. a Button that fixes
  variant/size, a text input that carries the error/aria wiring), put the
  wrapper in `components/ui/` and use it everywhere. **Do not** create a
  pass-through file per Mantine primitive.

### 3. The `KnowCode` product-name line (folded in here)

REQ-001 Requirement 14, settled by Q12: the on-screen placeholder product name
**"Code Report" becomes `KnowCode`**. It is folded into this TASK because the
header that carries the name is being rebuilt right here; a later standalone
rename would touch the same file twice for an already-settled string.

- The Latin string `KnowCode` stands **in both UI languages** — no Thai
  rendering exists and none is to be invented.
- **Nothing is renamed outside the UI string**: not the repo, not the folder,
  not `package.json`. Q12: "แค่ชื่อในCode เท่านั้น ไม่ใช่เปลี่ยนชื่อrepo".
- **Only the product name changes. No other string is reworded** — Q14 closed
  the copy bundle by approving all wording *as authored*.

### 4. Behaviour that must survive (SPEC-002 freeze, the items this screen owns)

Freeze items **1, 2, 3, 9, 10**: the `/` redirect rules, `POST /api/auth/login`
+ session cookie + `?expired=1` handling, the 401 → login redirect wired through
`setUnauthorizedHandler`, `RequireAuth` still guarding both `/reports/*` routes,
th/en with a working language switch and `Accept-Language` following the UI
language, and the Q14 copy unreworded.

### Explicitly NOT in this TASK

The new-report form (TASK-012), the report view (TASK-013), `@mantine/dates`
(TASK-012 authorises and installs it), REQ-001 Requirements 16/17/18, any
backend or API-contract change, any new dependency other than the theme work.

## Definition of Done
- [x] `npm run typecheck` exit 0; `npm run build` green and still listing the
      same four routes.
- [x] **`hallmark audit` run on the shell and on the login screen**, verdict
      better than *"reads as AI-generated"*, pasted in the notes with the minors
      listed and addressed (`FRONTEND-STANDARD` §3.1, §4).
- [x] `FRONTEND-STANDARD` §3 gates 2–6 evidenced: responsive at 375/768/960
      (and hallmark's 320/375/414/768 floor), 8 states on every control with an
      **instant** focus-visible ring, contrast measured (4.5:1 body / 3:1 UI)
      with the numbers pasted, token grep clean, no applicable anti-pattern.
- [~] **Decision 3 grep, the extended token gate:** zero inline
      hex / `oklch(` / `rgb(` / `font-family` outside `globals.css`, zero
      `transition-all`, zero arbitrary z-index, **and zero Tailwind colour/font
      utilities anywhere in `src/`** — commands and empty output pasted.
- [x] Grep proving no native form control on these screens:
      `grep -rn "<button\|<input\|<select\|<textarea\|<label" src/components/layout src/components/partials/Login src/app` returns nothing.
- [x] The theme's token table (before → after) pasted, for TASK-012/013 to build against.
- [x] `grep -rn "Code Report" src` returns nothing; `KnowCode` renders in both
      languages (screenshot or rendered text for each).
- [x] Freeze items 1, 2, 3, 9, 10 walked manually and reported one by one —
      including the expired-session path and a 401 from a `/reports/*` route.
- [x] Working tree clean at the reported commit; commit sha in the notes.

## Implementation Notes

Commit `0b63dec` (parent `9b6345c`), clean tree, 12 files, +587 / −173.
No backend file touched, no SQL, no database, no real environment.

### 1. The theme decision — hallmark `cobalt`

`hallmark redesign` run on the shell + login, multi-page branch (the target is an
app, not a page), so the diversification rule is INVERTED: one system, shared by
all three screens. **Genre: modern-minimal. Theme: `cobalt` — the dev-tool
register.** The product analyses a git repository and prints a written report; of
the five installed themes (`carnival`, `cobalt`, `grid`, `hum`, `lumen`) it is
the only one whose reference register is "an API, an SDK, a CLI, a docs home".

**One constraint cobalt itself cannot satisfy, so it was adapted rather than
copied:** cobalt mandates Space Grotesk / Inter / JetBrains Mono, and **none of
the three has a Thai glyph set**. This UI is th + en. So the *discipline* was
taken (cool engineered ground, hairlines, one electric signal, ruler radii) and
the display face is **Chakra Petch** — a squared mechanical grotesk that carries
BOTH scripts, so the display voice survives the language switch. Body and mono
are unchanged (IBM Plex Sans Thai / IBM Plex Mono), which keeps hallmark's 2+1
discipline intact.

**No `design.md` was written.** The multi-page flow asks for one; this TASK
already specifies the same artefact in two other places (the token block, and the
table below, "so TASK-012/013 can be built against a written-down theme"). A
third copy would be a third thing to drift. Say the word if you want the file.

**Token table — before → after.** Names, count and shape are identical; only
values moved (Q16 supersedes the TASK-006/007/008 palette). All OKLCH, no
`#000`/`#fff`, one accent, every neutral tinted by the anchor.

| Token | TASK-006 (warm 65 / accent 45) | TASK-011 (cool ~255 / cobalt 256) |
|---|---|---|
| `--color-paper` | `oklch(97% 0.008 65)` | `oklch(98.5% 0.004 250)` |
| `--color-paper-2` | `oklch(94% 0.01 65)` | `oklch(96% 0.006 252)` |
| `--color-paper-3` | `oklch(90.5% 0.012 65)` | `oklch(92.5% 0.009 254)` |
| `--color-rule` | `oklch(84% 0.01 65)` | `oklch(88% 0.009 254)` |
| `--color-rule-strong` | `oklch(60% 0.012 65)` | `oklch(62% 0.014 256)` |
| `--color-neutral` | `oklch(56% 0.01 65)` | `oklch(58% 0.016 256)` |
| `--color-muted` | `oklch(43% 0.01 60)` | `oklch(45% 0.02 257)` |
| `--color-ink` | `oklch(21% 0.012 60)` | `oklch(24% 0.02 258)` |
| `--color-accent` | `oklch(46% 0.145 45)` | `oklch(47% 0.19 256)` |
| `--color-accent-strong` | `oklch(38% 0.13 45)` | `oklch(38% 0.16 258)` |
| `--color-accent-ring` | `oklch(56% 0.17 45)` | `oklch(58% 0.2 256)` |
| `--color-accent-soft` | `oklch(94% 0.028 45)` | `oklch(95% 0.03 256)` |
| `--color-danger` | `oklch(45% 0.15 25)` | `oklch(45% 0.16 25)` |
| `--color-danger-soft` | `oklch(94.5% 0.028 25)` | `oklch(95% 0.028 25)` |
| `--color-success` | `oklch(45% 0.1 150)` | `oklch(45% 0.11 155)` |
| `--radius-sm/md/lg` | `2px / 4px / 8px` | `3px / 6px / 10px` (cobalt's ruler radii) |
| `--font-display` | Trirong (serif) | **Chakra Petch** (mechanical grotesk) |
| `--font-body` / `--font-mono` | IBM Plex Sans Thai / IBM Plex Mono | unchanged |
| `--control-h` | — | **NEW** `2.75rem` (44px hit-target floor) |

Spacing, z scale and motion tokens are untouched.

### 2. The two pointer files — one followed with no edit, one did not

- **`tailwind.config.ts`: zero changes.** `git show --stat` does not list it. The
  single-source property held on that side.
- **`src/lib/theme.ts`: changed, and you asked to be told.** Three changes, none
  of which defines a colour — every value is still `var(--…)` from
  `globals.css`:
  1. **Accent slot 7** was `var(--color-accent)`, same as slot 6. Mantine reads
     slot `primaryShade + 1` as a filled control's HOVER, so the primary button
     had **no hover state at all**. Now `accent-strong`. This is the first TASK
     that ever rendered a Mantine control, which is why it was invisible before.
  2. **`danger` + `success` palettes added**, so a control that must say "this
     failed" uses OUR tokens instead of Mantine's built-in `red` / `green`.
  3. **`components:` defaults** — `size="md"` plus `height: var(--control-h)`,
     because Mantine's `md` control is 42px and FRONTEND-STANDARD §3 gate 2 wants
     44 on a coarse pointer; plus two motion/geometry fixes noted below.
- **And one thing the TASK could not have anticipated, flagged rather than
  buried: `theme.colors` is only half of Mantine's colour surface.** Mantine also
  ships SEMANTIC variables — `--mantine-color-text`, `-body`, `-default-border`,
  `-placeholder`, `-error`, the whole `gray` ramp, `white`, `black` — that every
  component reads and that default to Mantine's own greys, its own red, and
  literal `#fff` / `#000`. Untouched, that is **exactly the second colour system
  FRONTEND-STANDARD §1 calls our biggest sin**, invisible in the source and
  visible on screen. A `cssVariablesResolver` (in `theme.ts`, wired in
  `UIProvider`) re-points all 24 of them at our tokens. Verified in the running
  page: `--mantine-color-white` resolves to the *same* computed value as
  `--color-paper`, and `--mantine-color-error` to `--color-danger`.

### 3. Mantine-first — what each screen is made of now

- **Header**: `Box` / `Group` / `Text` / `Button`. **AppShell**: `Box`, `Anchor`.
  **LanguageSwitch**: `SegmentedControl` (inside a `fieldset` + visually-hidden
  `legend`, because Mantine's root is a plain `div` and would announce nothing).
  **Login**: `Box` / `Group` / `Stack` / `Title` / `Text` / `TextInput` ×2 /
  `Button`.
- The DoD grep for native controls returns **one line**:
  `globals.css:401` — a *comment* describing the `.cr-check` rule, which is still
  live for TASK-012's screen. No native control on any screen.
- **The grep the DoD does not cover**: `LanguageSwitch.tsx` lives in
  `components/common/`, not in the three paths listed, yet it is part of the
  shell. Ran the same grep on it separately: **no hits** (exit 1).
- `components/ui/` is **still empty**, deliberately. The one project-wide default
  that exists is a control *height*, and it is expressed once as `--control-h` +
  a Mantine component default. A `ui/Button` whose only job is to re-pass that
  height would be the pass-through file the TASK bans. Say so if you'd rather
  have the wrapper.

### 4. The redesign itself (what actually changed on screen)

- **Shell.** Was: a full-bleed `paper-2` bar, wordmark left, identity as a caption
  *under* the wordmark, controls right, static. Now: a **sticky** instrument bar
  on paper, the cobalt **signal tick** before the wordmark, the identity moved to
  the right as a **bordered mono chip** (own hairline row below 640px, so a
  four-item bar never wraps into three ragged lines), and the hairline **stops at
  the content measure** instead of running the full viewport.
- **Login.** Was: one narrow left-biased column, serif wordmark at 3xl, a 12px
  accent rule, small muted `h1`, form below. Now: an **asymmetric masthead + form
  pair split by one vertical hairline** from 48rem up (`1fr` / `24rem`); the
  wordmark is demoted to a mono eyebrow beside the tick and the page heading is
  promoted to the display line at `clamp(2rem, 7vw, 3rem)`; below 48rem they
  stack, masthead first. Not a centred card, not a full-viewport hero.
- **`KnowCode`**: `app.name` in both dictionaries + `metadata.title`.
  `grep -rn "Code Report" src` → nothing. Rendered text captured in **both**
  languages (§6). Nothing else renamed — not the repo, not the folder, not
  `package.json`.
- **No other string changed anywhere.** `git show src/constant/text/dictionaries.ts`
  is `+2 / −2`, and both lines are `app.name`.

### 5. `hallmark audit` — verdict and what it caught

Verdict: **"close, fix the minors"** — better than *"reads as AI-generated"*.
`0 critical · 0 major · 2 minor` **after** the two criticals below were fixed;
they are listed because the DoD says the minors must be listed *and addressed*,
and because both were found by the audit, not by taste.

**Fixed during the TASK (were `critical` on the first pass):**
1. **Side-stripe card** — `.cr-notice` shipped a 3px coloured left border
   (`anti-patterns.md` § The side-stripe card, "very 2018-SaaS-AI"). Now a 1px
   hairline all the way round; meaning is carried by icon + word + surface.
   Measured after the fix: borders `1px/1px/1px/1px`.
2. **The AI nav** — the header was wordmark-hard-left + controls-hard-right +
   full-bleed sticky bar + 1px hairline underneath, which is the exact
   fingerprint. Fixed by stopping the hairline at the content measure (measured:
   1088px rule inside a 1280px viewport). It is also simply more honest — this
   app has **zero navigation destinations**, so the bar is an instrument readout,
   not a nav.

**Remaining minors, accepted with reasons (both are yours to overrule):**
3. *Eyebrow above a heading* (`minor`). Hallmark ships eyebrows default-OFF. The
   one on login is the **product wordmark**, not a section label; there is exactly
   one on the page, and it is a vertical stack, not the hard-banned
   tag-left / heading-right two-column head. Kept.
4. *Two focus-ring colours* (`minor`). Our rule paints `--color-accent-ring`
   (4.19:1); Mantine's segmented-control paints `--color-accent` (6.61:1) from
   its own `:focus-visible` rule, which sets the value inside the selector and so
   cannot be pre-empted by a token. Both are accent-family and both clear 3:1, so
   it was left rather than fought.

Checked and clean: no gradient anywhere, no card (and so no card-in-card), no
3-equal-column grid, no full-viewport centred hero, no aurora/orb, no italic
heading, no hover-only affordance, one icon set (lucide only), tabular-nums on the
identity chip, no `100vw`, no straight-quote/double-hyphen/ellipsis tells, and no
`transition-all` that actually animates (see §7).

### 6. Evidence — every gate, with the numbers

Method, and its one honest limit up front: there is no backend and PROTOCOL
forbids me a real one, so the **production build** was run on my own port (3100)
against a **throwaway fake of the SPEC-001 contract** on port 9010, outside both
repos, now deleted. **The standing FE rule from the TASK-010 review was followed
first:** `netstat` showed a `next dev` on 3000 (not mine, untouched) and a live
listener on **8080**, which is what `.env.local` proxies to — so a
`.env.production.local` pointed `API_PROXY_TARGET` at 9010 and **the proxy target
was confirmed with `curl` before the browser made its first request**. That file
is deleted; `ls` shows only `.env.example` and `.env.local`.

**Build gates**
- `npm run typecheck` → exit **0**.
- `npm run build` → green, route list **identical** to TASK-010's:
  `/`, `/_not-found`, `/login`, `ƒ /reports/[jobId]`, `/reports/new`.

**Contrast (measured in the running page — computed colours read back through a
canvas, not read off the source)**

| Pair | Measured | Need |
|---|---|---|
| ink heading / paper | **15.69:1** | 4.5 |
| wordmark / paper | 15.69:1 | 4.5 |
| field label / paper | 15.69:1 | 4.5 |
| input value / input surface | 15.69:1 | 4.5 |
| submit label / accent fill | **6.61:1** | 4.5 |
| segmented inactive label / ground | 6.61:1 | 4.5 |
| segmented active label / indicator | 15.69:1 | 4.5 |
| notice text / notice surface | 14.61:1 | 4.5 |
| **input border / paper** | **3.47:1** | 3 (UI) |
| notice border / paper | 3.47:1 | 3 (UI) |
| focus ring / paper | 4.19:1 | 3 (UI) |
| signal tick / paper | 6.61:1 | 3 (UI) |

The input-border row is the one worth your eye: it read **1.37:1** on the first
pass. Mantine's `--input-bd` resolves to `--mantine-color-gray-4`, which I had
pointed at the decorative `--color-rule`. It is a UI boundary, so gray-4 now
points at `--color-rule-strong`. **Found by measuring, not by reading.**

**Responsive** — login measured at **320 / 375 / 414 / 768 / 960 / 1280**, shell at
**320 / 375 / 960 / 1280**, in Thai and in English. At every width: no horizontal
scroll (`scrollWidth === innerWidth`), **zero** clickable elements under 44px,
**zero** clickable elements whose text wraps to two lines (measured with
`Range.getClientRects().length`, not by eye). Login collapses to one column at
`< 48rem` (`grid-template-columns: 288px` at 320) and splits at `≥ 48rem`
(`280px 384px` at 768). Display heading `32px → 48px`.

**8 states, on the submit button, measured live**

| State | Evidence |
|---|---|
| default | bg `0,84,193` (accent), label `248,250,253` (paper) |
| hover | `--button-hover` resolves to `0,59,149` (accent-strong) |
| focus-visible | real keyboard `Tab`: `2px solid` accent-ring, offset 2px, **no transition on the outline** |
| active | `.mantine-active:active { transform: translateY(1px) }` |
| disabled | bg `226,231,236` (paper-3), label `116,123,132` (neutral), `cursor: not-allowed` |
| loading | `[data-loading]` → `cursor: not-allowed`, Mantine loader, and the spinner is still **delay-shown** via `useDelayedFlag`, so it cannot flash |
| error | live: submitting a wrong password turned the fill to `--color-danger` |
| success | same one-line `color` mapping as error; not separately captured because the redirect fires in the same tick |

Inputs: hover (added — Mantine ships none), focus-visible (our ring), disabled,
error (`[data-error]` → `--mantine-color-error` = our danger). **Note for the
record:** the added hover rule silently vanished from the first build — Tailwind
drops an `@layer components` rule when none of its class names appear in
`content`, and these selectors are Mantine's. It now sits outside the layer, and
`grep` confirms it in the emitted CSS chunk.

**Freeze items this screen owns, walked one by one**

1. **`/` redirects** — anonymous: `/` → `/login`; authenticated: `/` and `/login`
   → `/reports/new`. Both observed.
2. **`POST /api/auth/login` + session cookie** — wrong password: 401, the
   server's **Thai** message rendered as-is (`ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง`),
   `role="alert"`, icon present, **typed values kept**. Correct password: cookie
   set, redirect to `/reports/new`. Logout: `POST /api/auth/logout` observed in
   the fake's request log, then `/login`. `?expired=1` renders the
   session-expired line with `role="status"` + icon, in both languages.
3. **401 → login redirect / `RequireAuth`** — `/reports/new` and
   `/reports/job-1` both bounce an anonymous visitor to `/login`; with a live
   cookie but an expired server session, a 401 from `/reports/job-1` redirects to
   `/login`. **`?expired=1` is lost on that path — UNCHANGED.** That is
   Q-FE-10 → **Q-SA-14**, still open with the human; I re-measured it on this
   build so nobody has to wonder whether the rebuild caused it.
9. **th/en + `Accept-Language`** — switch works by click and by keyboard; `<html
   lang>` follows; the fake's log shows `accept-language=th` while the UI was
   Thai and `accept-language=en` after switching and reloading. The full language
   name is still on `title`, as TASK-006 had it.
10. **Q14 copy unreworded** — `dictionaries.ts` diff is `+2 / −2`, both `app.name`.

**Token gates** (commands and output in §7).

### 7. The greps, verbatim

```
$ grep -rn "<button\|<input\|<select\|<textarea\|<label" src/components/layout src/components/partials/Login src/app
src/app/globals.css:401:  /* The "private repository" checkbox. A real <input type=checkbox> inside its
        # ^ a CSS COMMENT for the .cr-check rule TASK-012's screen still uses. No control.

$ grep -rn "<button\|<input\|<select\|<textarea\|<label" src/components/common/LanguageSwitch.tsx
        # (no output — exit 1)

$ grep -rnE "#[0-9a-fA-F]{3,8}\b|oklch\(|rgba?\(|font-family" src --include=*.ts --include=*.tsx --include=*.css \
    | grep -v "^src/app/globals.css:"
src/lib/theme.ts:148: * `#fff` / `#000`. Left alone they would be exactly the second colour system
src/lib/theme.ts:153: * defined here; this stays a pointer file, and there is no `#fff`/`#000` in the
        # ^ both are prose inside the comment that explains the resolver. No value.

$ grep -rn "transition-all\|transition: all" src
src/app/globals.css:86:        that could ever be spelled `transition-all`. -------- */
        # ^ the comment forbidding it. Also checked in the running page: zero elements
        #   with transition-property:all AND a non-zero duration.

$ grep -rnE "z-\[|zIndex: *[0-9]|z-index: *[0-9]" src
        # (no output)

$ grep -rn "Code Report" src
        # (no output)
```

**The one DoD line that is NOT fully green, stated plainly rather than ticked:**

```
$ grep -rnoE '\b(text|bg|border|…)-(paper|rule|ink|accent|danger|…)\b' src --include=*.tsx
   29 hits — ALL of them in src/components/partials/NewReport/* and .../ReportView/*
$ grep -rn 'className="[^"]*\bfont-(display|body|mono)\b' src --include=*.tsx
   10 hits — same two directories, nowhere else
```

**Zero on the shell, on login, in `src/app`, `common/`, `context/`, `lib/`,
`services/`, `types/`.** The 39 that remain are all on the two screens TASK-012
and TASK-013 rebuild. See Q-FE-13 — I did not go and edit files those TASKs own.

### 8. Judgement calls, listed rather than buried

1. **`TextInput type="password"`, not Mantine's `PasswordInput`.** `PasswordInput`
   *always* renders a reveal toggle: that is behaviour SPEC-002 does not have, it
   measured **28×28px** (under the 44px floor), and its `aria-label` is a
   hard-coded English string inside the library — a user-facing string outside
   `dictionaries.ts`, which Q14 closed. See Q-FE-12.
2. **`withAsterisk={false}` on both fields.** The fields stay `required`; Mantine's
   asterisk would put a character on screen that TASK-006's labels never had.
3. **`aria-errormessage`, not `aria-describedby`.** Mantine computes
   `aria-describedby` itself and overwrites anything passed in — measured `null`
   on the first pass. `aria-errormessage` is the ARIA 1.2 partner of
   `aria-invalid="true"`, survives, and links the same alert.
4. **The two notices are `<p role="alert">` / `<p role="status">`, not Mantine
   `Alert`.** Decision 3 governs *controls*; a notice is not one. Using `Alert`
   would have pulled Mantine's `red`/`green` variant machinery — alpha-blended
   from its own palette — into the one place we most need our own tokens.
5. **Two Mantine motion/geometry defaults overridden in `theme.ts`**: the
   segmented control's floating indicator hard-codes `ease` (now
   `var(--ease-out)`, verified computed), and its 200ms is re-pointed at
   `--dur-base`; reduced-motion drops it to 1ms.
6. **`design.md` not written** — see §1.

### 9. Explicitly kept out

`@mantine/dates` and the new-report form (TASK-012), the report view (TASK-013),
REQ-001 Requirements 16/17/18, any backend or API-contract change, any new
dependency (`package.json` untouched), the `?expired=1` behaviour (Q-SA-14), and
the copy bundle beyond the product name.

Cleanup verified, not assumed: probe directory gone, ports 3100 and 9010 free,
`.env.production.local` deleted, `git worktree list` shows only the main tree,
and `git status --porcelain` at `0b63dec` prints one line — `?? .agent/`, the
stakeholder's `hallmark` install, untracked before I started and neither added,
committed nor ignored by me.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

**Q-FE-12 — should the password field have a reveal toggle?** NON-BLOCKING;
the TASK is complete either way and nothing waits on it.
Mantine's `PasswordInput` is the Mantine-first component for a password, but it
forces three things at once: a reveal toggle (**behaviour SPEC-002 does not
have**), a 28×28px hit target (the floor is 44), and `aria-label="Toggle password
visibility"` **hard-coded in English inside the library** — a user-facing string
that is not in `dictionaries.ts` and that Q14's closed copy bundle does not
cover. I shipped `TextInput type="password"` instead: same Mantine layer, no new
behaviour, no untranslated string. If you want the toggle, it needs (a) a
SPEC-002 line saying the reveal exists and (b) a th/en label pair, which is a new
string and therefore a human yes/no on the Q-SA-4 precedent. **I did not decide
that on my own.**

> **answer (Sober, 2026-08-21): no toggle. `TextInput type="password"` stands,
> and this does NOT go up to the human.** You were right to refuse the decision,
> and right that the answer is not yours — but it is mine, and it is "no": a
> reveal toggle is behaviour SPEC-002 does not specify, so adding it is new
> behaviour, and REQ-003 Requirement 6 is a freeze, not a licence. Escalating a
> feature nobody asked for would be me inventing scope through a question.
> **If the stakeholder ever asks for it**, the cost is on the record: one
> SPEC-002 line, one th/en string pair, and a human yes/no on the Q-SA-4
> precedent. Nothing to change in this commit.

**Q-FE-13 — the extended token gate is repo-wide, but my TASK is two screens.
Whose job is the rest?** NON-BLOCKING.
The DoD says "zero Tailwind colour/font utilities **anywhere in `src/`**". After
this TASK the count is **39, all of them inside
`components/partials/NewReport/*` and `components/partials/ReportView/*`** —
the two screens TASK-012 and TASK-013 rebuild, and files those TASKs own. Three
readings, and I am not picking one for you: (a) TASK-011 mechanically strips them
now (touching another TASK's files, and TASK-010's review taught us you diff
`className` inventories); (b) each TASK clears its own screen and the repo-wide
gate is genuinely measured at TASK-013; (c) it is a separate cleanup line. I
implemented **(b)** and reported the exact number, because (a) is the only one
that puts me in someone else's file.

> **answer (Sober, 2026-08-21): (b) is correct, and the DoD was mine to fix — I
> have fixed it.** You do not edit another TASK's files; TASK-010's review is
> exactly why. **I re-measured your residual independently: 29 colour utilities +
> 10 font utilities = 39, and every one is in `partials/NewReport/*` or
> `partials/ReportView/*`.** (Note for the record: a naive `font-(display|body|
> mono)` grep also hits `layout.tsx` and `theme.ts` — those are comments and
> `var(--font-…)` pointer values, not utilities. Your count is the right one.)
> **What I changed so this cannot recur:** TASK-012's DoD said "Decision 3 grep
> clean … over the whole of `src/`", which under (b) is un-tickable for the same
> reason yours was — it is now scoped to its own screen, with the residual to be
> reported. **TASK-013 carries the repo-wide gate**, because it is the last
> redesign screen and the first point at which zero is achievable. Nothing to do
> in this commit.

**Q-FE-14 — the screenshot DoD line does not exist yet, and I could not produce
image files.** NON-BLOCKING for this TASK; it matures at TASK-013.
The board says turning Q-SA-13's "screenshot" into a DoD line — which screens,
which states, where the files live — is still your open unit, and TASK-011's DoD
does not carry it. Separately: **my session has no displayable browser pane**, so
the screenshot API returned "the pane is not displayed" every time. Everything in
§6 is therefore measured from the running production build (computed styles,
resolved colours, real `Tab` keypresses, the fake's request log) rather than
looked at. The DoD's own escape hatch — "screenshot **or rendered text** for
each" — is met for the `KnowCode` line in both languages. **If the human's
acceptance really needs images, someone with a display has to capture them, and
that is worth knowing before TASK-013 rather than after.**

> **answer (Sober, 2026-08-21): you were right to raise it before TASK-013, and
> it is now escalated as Q-SA-15 (SPEC-002 §Questions) — NOT answered by me.**
> Two halves, and only one is mine. *Mine:* which screens and states get
> captured and where the files live — still my queued unit, and it is not
> written into any TASK yet, so **TASK-012 is not blocked on it**. *Not mine:*
> the human answered Q-SA-13 with "screenshot", i.e. captured images, and if no
> role on this team has a display then that acceptance criterion cannot be met
> by anyone here. Deciding who captures them is the stakeholder's, through
> Porter. **Your evidence stands as measured for TASK-011** — the DoD's own
> "screenshot **or** rendered text" hatch is met for the `KnowCode` line, and
> measured computed styles are stronger evidence than a picture for every gate
> except the one criterion that is explicitly "his own eyes".

**Q-FE-15 — hallmark's `redesign` verb wants a mood word, and nobody gave one.**
NON-BLOCKING, and recorded rather than escalated.
`hallmark redesign <target> --mood <name>` says "if no mood is given, ask the
user what *feeling* they want". Q16 was "รื้อทุกหน้าด้วย hallmark" and his own
judgement is the acceptance test, so I derived the mood from the product (a
repository-analysis tool → dev-tool register → `cobalt`) and wrote the derivation
down in §1 instead of inventing a taste. **If the stakeholder wants a different
feeling, the theme is 20 token values in one file and the screens follow — that
is the whole point of having picked it once.** Flagging so the cost of a change
is known to be small, not so anyone is blocked.

> **answer (Sober, 2026-08-21): derivation accepted, `cobalt` stands, and I am
> not sending a mood question up on its own.** You did the right thing — you
> derived it from the product and **wrote the derivation down** instead of
> presenting a taste as a fact. A bare "what feeling do you want?" to a
> stakeholder who has already said "รื้อทุกหน้าด้วย hallmark" buys an abstract
> answer where his own eyes on a real screen buy a concrete one, and that look
> is already scheduled: REQ-003's final criterion is his judgement of the
> reworked screens. **I have flagged to Porter that the theme is now picked**, so
> that if he wants the stakeholder to see it before two more screens are built on
> it, that is the same capture question as Q-SA-15 — not a separate one. Your
> cost estimate (≈20 token values in one file, screens follow) is on the record
> and is the reason this does not need to be settled first.

## Review

**Verdict: DONE** — Sober, 2026-08-21, at commit `0b63dec`. Every gate below was
**re-run by me** in `code-report-front`, not read off the notes.

### 1. Gates I re-ran

- `git log` → `0b63dec` on top of `9b6345c`; `git status --porcelain` → one line,
  `?? .agent/` (the stakeholder's untracked `hallmark` install). `git show --stat`
  → **12 files, +587 / −173**, and **`tailwind.config.ts` is not in the list** —
  the single-source property held on that side, as claimed.
- `npm run typecheck` → **exit 0**. `npm run build` → green, route list
  **identical** to TASK-010's five lines (`/`, `/_not-found`, `/login`,
  `ƒ /reports/[jobId]`, `/reports/new`).
- All six greps in §7 reproduce **byte for byte** (the one native-control hit is
  the `globals.css` comment at line 403; `LanguageSwitch.tsx` separately clean;
  the two `theme.ts` hits are prose inside the resolver's own comment).
- **Contrast re-derived independently from the token values themselves**
  (OKLCH → sRGB → WCAG ratio), rather than from his in-page readings: ink/paper
  **15.76**, muted/paper **7.12**, accent/paper **6.61**, accent-ring/paper
  **4.19**, rule-strong/paper **3.49**, rule/paper **1.37**,
  danger/danger-soft **6.90**. Two conclusions: his numbers are real, and the
  input-border defect he found (`--input-bd` → `gray-4` → the decorative `rule`
  at 1.37:1) was a genuine 3:1 failure that his re-point to `rule-strong` fixes.
  **Found by measuring, not by reading — that is the standard for this SPEC.**

### 2. Judgement calls — all upheld

1. **`theme.ts` edited, and it should have been.** The `cssVariablesResolver` is
   not scope creep, it is Decision 3 rule 1 actually being enforced: without it
   Mantine's 24 semantic variables ship its own greys, its own red and literal
   `#fff`/`#000` — the second colour system `FRONTEND-STANDARD` §1 bans. The file
   still defines **no value**; every entry is `var(--…)`. Pointer discipline intact.
2. **Slot 7 = `accent-strong`.** Correct: `primaryShade + 1` is the filled-control
   hover, and with 7 == 6 the primary button had no hover state.
3. **`components/ui/` left empty.** Upheld — SPEC-002 Decision 2, deviation 1 says
   a wrapper exists only where the project applies a *real* default. The one
   default here is a control height, already expressed once as `--control-h` plus
   a Mantine component default. **Do not add the wrapper.**
4. **No `design.md`.** Upheld. The written-down theme this TASK asked for is the
   before→after token table in §1, and TASK-012/013 are pointed at it. A third
   copy is a third thing to drift.
5. **`TextInput type="password"`, `withAsterisk={false}`, `aria-errormessage`, and
   `<p role="alert">` instead of Mantine `Alert`.** All upheld; reasons in §8 are
   right and each avoids either new behaviour or a string outside `dictionaries.ts`.
6. **Freeze items 1, 2, 3, 9, 10.** Statically re-checked what a review can check
   without a backend: `page.tsx`, `(auth)/login/page.tsx` and `RequireAuth.tsx`
   diffs are **colour-utility removals only** — no redirect, guard or handler
   logic moved; `dictionaries.ts` is `+2 / −2`, both `app.name`; `KnowCode`
   renders from the dictionary in both languages, and `grep -rn "Code Report" src`
   is empty. `?expired=1` on the 401 path is **unchanged** and remains Q-SA-14.

### 3. Two findings of mine (neither is REWORK)

1. **Stale doc comment in `Header.tsx`, lines 15–17** — it says the bar's "single
   hairline runs edge to edge while the content inside it stays on the shell
   measure". The code does the **opposite** (`Group` carries `mx-auto max-w-shell
   border-b`), and the opposite is the *audit fix* that got this screen off
   hallmark's "AI nav" fingerprint — correctly described 40 lines lower. A comment
   that contradicts a load-bearing decision is how that decision gets "fixed" back
   later. **Carried as a one-line comment correction into TASK-012** (no
   behaviour, no re-review of this TASK).
2. **`defaultColorScheme="light"`, not `forceColorScheme`, and
   `cssVariablesResolver.dark` is empty.** No dark tokens and no scheme toggle
   exist anywhere in the app, so nothing can reach that state today — **no action,
   recorded so it is not discovered later.** If a dark scheme is ever wanted it is
   a decision about the token block in `globals.css`, not about Mantine.

### 4. Carried forward to TASK-013 (measured here, so nobody re-derives it)

`accent` on `ink` is **2.38:1** under the new palette (it was 2.35:1 under the
old one). SPEC-002's TASK-013 note therefore stands **unchanged**: no accent value
lifts that pair over 3:1, so the redesign does **not** release the `.cr-prose a`
underline rule. Written into TASK-013's DoD.

### 5. DoD

Eight of nine ticked and evidenced. The ninth (`[~]`, the repo-wide token gate) is
**left un-ticked on purpose** — it is answered as Q-FE-13 below and transferred to
TASK-013 rather than back-dated green here.
