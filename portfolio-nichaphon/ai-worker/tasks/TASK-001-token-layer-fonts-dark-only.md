# TASK-001: Token layer + fonts + dark-only mount

- Source: SPEC-001
- Status: DONE (2026-08-30, Sober — reviewed against SPEC-001, build re-run clean; see §Review)
- Owner: Fern (FE)
- Depends on: none

Repo `portfolio-nichaphon-web`, everything under `front/` (absolute path: workspace-root
`machine.local.md`). Read **SPEC-001 §"Token layer"** before starting — the hex values
there are the spec's, not suggestions. Do not invent, round or "improve" a colour.

## What to do

Four files, no others.

**1. `front/src/theme/theme.ts`**

- Replace the `rust` / `sand` / `darkSand` tuples with the `iris` and `obsidian`
  tuples given verbatim in SPEC-001 §"Token layer". `obsidian` serves as the
  neutral ramp **and** as Mantine's inverted `dark` scale (it is already written
  in that convention).
- `primaryColor: 'iris'`; `colors: { iris, obsidian, gray: obsidian, dark: obsidian }`.
- `primaryShade: { dark: 3 }`.
- `white: '#f5f3fb'`, `black: '#0b0916'`.
- `defaultRadius: 'lg'` and the new `radius` scale
  (`xs 4px / sm 8px / md 12px / lg 20px / xl 28px`).
- `headings.fontFamily` → `var(--site-font-display)` (the alias, not `--font-display`
  — the fallback stack lives in `globals.css`); `headings.fontWeight: '700'`;
  `h1` → `clamp(3rem, 11vw, 8.5rem)`, `lineHeight: '0.92'`, `letterSpacing: '-0.04em'`;
  `h2` → `clamp(2rem, 5vw, 3.5rem)`. `h3`–`h6` unchanged.
- Unchanged: `autoContrast`, `focusRing`, `respectReducedMotion`, the 4pt `spacing`
  scale, the whole `other` block, and the `components` block **except** adding
  `'--button-radius': '999px'` to the `filled` branch of `Button.vars`. Keep the
  44px minimum height and the existing `--site-cta-*` wiring exactly as they are.
- `cssVariablesResolver`: **every existing variable name stays.** Re-point the `dark`
  block to the values in SPEC-001's variable table, add the six new
  `--site-glass-*` / `--site-aurora-*` names, and mirror all of them in the `light`
  block so no variable is ever undefined. The `light` block is not a designed
  scheme and is unreachable in this build — do not spend time tuning it, but do not
  leave a name out of it either.

**2. `front/src/app/globals.css`**

- `--site-font-display` fallback becomes a sans stack:
  `var(--font-display), 'Segoe UI', system-ui, sans-serif`.
- **Amended 2026-08-30 (answer to FQ1 — this is the only scope change):** add one
  rule directly under the existing `h1..h6` block:

  ```css
  /* Mantine 8's HeadingStyle has no letterSpacing key, so the h1 tracking from
     SPEC-001 lives here, with the other heading properties the theme cannot hold. */
  h1 {
    letter-spacing: -0.04em;
  }
  ```

- Everything else in this file is unchanged — the existing declarations inside the
  `h1..h6` rule, `text-wrap`, the `:focus-visible` ring, `.site-numeric`,
  `.site-skip-link`, the z-layers.

**3. `front/src/app/layout.tsx`**

- Swap the display face: `Fraunces` → `Space_Grotesk` from `next/font/google`,
  same `variable: '--font-display'`, `subsets: ['latin']`, `display: 'swap'`.
- `IBM_Plex_Sans_Thai` (body) and `JetBrains_Mono` (mono) stay exactly as they are.
  The Thai subset is not optional — the quotes are Thai.
- `<ColorSchemeScript defaultColorScheme="auto" />` → `<ColorSchemeScript forceColorScheme="dark" />`.
  `mantineHtmlProps` stays on `<html>`; the script stays in `<head>`.
- `metadata` is untouched.

**4. `front/src/components/providers/UIProvider.tsx`**

- `defaultColorScheme="auto"` → `forceColorScheme="dark"`. Nothing else changes.

## Explicitly not in this task

- Do **not** remove `ColorSchemeToggle` from the header — that is TASK-003.
  The site will look odd mid-stream (a toggle that no longer toggles); that is
  expected and correct until TASK-003 lands.
- Do not delete `components/ui/ColorSchemeToggle/`, and do not remove its export
  from the `ui/` barrel. Reinstating light mode must stay a two-line revert.
- No `package.json` edit. No dependency added, removed or upgraded — Mantine stays
  at 8.3.18 (SPEC-001 §"Decision: the UI library does not change").
- No component or CSS-module file is touched. Colours will shift everywhere on
  their own, because every component already reads these variables — that is the
  point of the task.

## Definition of Done

- [ ] `cd front && npm run build` completes with no errors and no new warnings.
- [ ] `cd front && npm run dev`, all six routes (`/`, `/about`, `/services`,
      `/portfolio`, `/blog`, `/contact`) load with an empty browser console.
- [ ] All six routes render on the dark ground with the OS theme set to **light**
      — i.e. the force actually took, no light flash on first paint.
- [ ] No CSS variable that existed before this task is missing afterwards
      (diff the two `cssVariablesResolver` blocks name-by-name; count must only grow).
- [ ] On a route that does not override it (`/about`), the `h1` computes to
      `letter-spacing: -0.04em`, read back from the running page.
- [ ] `git diff --stat` shows exactly four changed files and no others.

## Implementation Notes

Implemented 2026-08-30 by Fern, in two rounds: everything but the h1 tracking first,
then the FQ1 rule after Sober answered (a). Final `git diff --stat` on `develop`
(clean tree before, no commits made) — four files, no others:

```
front/src/app/globals.css                     |   8 +-
front/src/app/layout.tsx                      |   8 +-
front/src/components/providers/UIProvider.tsx |   2 +-
front/src/theme/theme.ts                      | 183 ++++++++++++++------------
4 files changed, 111 insertions(+), 90 deletions(-)
```

**What changed**

- `theme/theme.ts` — `rust`/`sand`/`darkSand` replaced by `iris`/`obsidian`
  (hex verbatim from SPEC-001 §"Token layer"); `primaryColor: 'iris'`,
  `primaryShade: { dark: 3 }`, `colors: { iris, obsidian, gray: obsidian, dark: obsidian }`,
  `white`/`black`, `defaultRadius: 'lg'` + the new radius scale, headings
  (`var(--site-font-display)`, weight 700, new h1/h2 sizes), `'--button-radius': '999px'`
  on the `filled` branch only. `cssVariablesResolver`: dark block re-pointed to the
  SPEC table, six `--site-glass-*`/`--site-aurora-*` names added, `light` block
  re-pointed onto the same ramps and given the six new names (untuned, unreachable).
  `autoContrast`, `focusRing`, `respectReducedMotion`, `spacing`, `other`, the 44px
  control heights and the `--site-cta-*` wiring are byte-identical.
- `app/globals.css` — two edits, both named by the TASK: `--site-font-display`
  fallback is now a sans stack, and the amended `h1 { letter-spacing: -0.04em }`
  rule (with its comment) sits directly under the `h1..h6` block. Nothing else in
  the file moved — the `h1..h6` declarations, `text-wrap`, `:focus-visible`,
  `.site-numeric`, `.site-skip-link` and the z-layers are byte-identical.
- `app/layout.tsx` — `Fraunces` → `Space_Grotesk` (same `--font-display`, `latin`,
  `swap`); `ColorSchemeScript defaultColorScheme="auto"` → `forceColorScheme="dark"`.
  `IBM_Plex_Sans_Thai` (with `thai` subset) and `JetBrains_Mono` untouched; `metadata`
  untouched; `mantineHtmlProps` still on `<html>`, script still in `<head>`.
- `providers/UIProvider.tsx` — one line: `forceColorScheme="dark"`.

**Definition of Done — evidence**

All six boxes below were re-run **after** the FQ1 rule landed; this is the final state.

- [x] `cd front && npm run build` → `✓ Compiled successfully in 7.5s`, all 10 static
      pages generated, zero errors, zero warnings (only npm's own "new npm available"
      notice, unrelated).
- [x] `npm run dev` (port 3000 was already occupied by another process on this
      machine, so Next used **3001**). All six routes loaded — `/`, `/about`,
      `/services`, `/portfolio`, `/blog`, `/contact` — console contained only React
      DevTools info + Fast Refresh logs. **No errors, no warnings.**
- [x] **h1 tracking, read back from the running page.** With `prefers-color-scheme:
      light` emulated, `/about`'s `h1` computes to `letter-spacing: -1.92px` at
      `font-size: 48px` — exactly `-0.04em`. Same `-1.92px` on `/services`,
      `/portfolio`, `/blog`, `/contact` (all `SectionHeading_title`). `/`'s hero
      computes `-1.2px` (= `-0.025em`) because `HomeHero_name` still shadows it —
      the expected mid-stream state you predicted; TASK-004 deletes that override.
      Also confirmed on the same read: h1 `font-weight: 700`, family resolves to
      `"Space Grotesk", "Space Grotesk Fallback", "Segoe UI", system-ui, sans-serif`.
- [x] Force took under a light OS: with `prefers-color-scheme: light` emulated,
      `document.documentElement[data-mantine-color-scheme]` = `dark`,
      `getComputedStyle(body).backgroundColor` = `rgb(11, 9, 22)` (= `#0b0916`),
      text `rgb(236, 234, 242)`. Re-confirmed per route on the final re-run: all six
      of `/`, `/about`, `/services`, `/portfolio`, `/blog`, `/contact` report
      `data-mantine-color-scheme="dark"` and `body` background `rgb(11, 9, 22)`.
      Live-page variable read-back: `--site-glass-bg rgba(120, 96, 200, 0.10)`,
      `--site-glass-border rgba(196, 178, 255, 0.18)`,
      `--site-glass-glow 0 0 40px rgba(122, 79, 255, 0.22)`,
      `--site-aurora-1/2/3 #7040ff / #3b2fb5 / #c3b2ff`, `--site-surface #151122`,
      `--site-hairline #2c2640`, `--site-cta-bg #7a4fff`, `--mantine-color-anchor #a488ff`.
      Computed `h1` font-family resolves to `"Space Grotesk", "Space Grotesk Fallback",
      "Segoe UI", system-ui, sans-serif`, weight 700.
- [x] No variable name lost. Sorted name-by-name diff of the two `theme.ts` versions:
      **0 names removed**, 7 added (`--button-radius` + the six `--site-glass-*` /
      `--site-aurora-*`). Count 23 → 30.
- [x] Exactly four changed files (stat above). No `package.json` edit, no dependency
      move, no component or CSS-module file touched, `ColorSchemeToggle` still in the
      header and still exported from the `ui/` barrel.

**Not claimed:** "no light flash on first paint" is asserted from the mechanism (the
blocking `<head>` script), not from a measured frame — see observation 1 below and
your SA note under §Questions. Everything else above was read back from the running
page. Nothing here is a visual/aesthetic judgement — that is the owner's, via Porter.

**Observations for Sober (no action taken on either)**

1. **The SSR markup still says `light`.** `mantineHtmlProps` is a Mantine constant
   hard-coded to `{ suppressHydrationWarning: true, 'data-mantine-color-scheme': 'light' }`
   (`@mantine/core/esm/core/MantineProvider/mantine-html-props.mjs`), and the TASK
   requires it to stay. `curl http://localhost:3001/` therefore shows
   `<html data-mantine-color-scheme="light">`, corrected to `dark` by the blocking
   inline script Mantine renders in `<head>` — which is exactly the repo gotcha the
   README names, and why the script must stay in `<head>`. A reviewer diffing raw
   HTML will see `light` and should not read it as the force failing. If you want the
   served attribute itself to be `dark`, that is a one-line change in `layout.tsx`
   (`{...mantineHtmlProps} data-mantine-color-scheme="dark"`) — I did **not** make it,
   because the TASK says `mantineHtmlProps` stays as it is.
2. **The dev server used port 3001**, not 3000: another process on this machine
   already holds 3000. Nothing was killed except the server I started.

## Questions

- **FQ1 — the `h1` `letterSpacing: '-0.04em'` has nowhere to live in the four files
  this TASK allows.** Mantine 8.3.18's `HeadingStyle` accepts only
  `{ fontSize, fontWeight?, lineHeight }`
  (`@mantine/core/lib/core/MantineProvider/theme.types.d.ts:116-120`) — no
  `letterSpacing` key, and Mantine generates no `--mantine-h1-letter-spacing`
  variable. Putting it in `headings.sizes.h1` is a TypeScript excess-property error
  and would fail `npm run build`, so **everything else in the TASK is implemented and
  this one declaration is not.** I did not pick a substitute location, because all
  three candidates are outside what this TASK permits:
  (a) a `letter-spacing` on the `h1` rule in `globals.css` — the TASK says everything
  else in that file is unchanged;
  (b) a `Title` entry in `theme.components` — the TASK says the components block is
  unchanged except the button radius;
  (c) leave it to the per-component CSS module in TASK-004 — note the current hero
  title already sets its own `letter-spacing: -0.025em` **and** its own `font-size`
  in `HomeHero.module.css:63`, so the theme `h1` values do not reach the hero
  wordmark today regardless.
  Which of (a)/(b)/(c) do you want? The value itself is not in question — `-0.04em`
  is the SPEC's, I have not altered or approximated it.

  > answer (Sober, 2026-08-30): **(a) — `front/src/app/globals.css`.** TASK-001's
  > scope for that file is amended above to permit exactly this one rule; the other
  > three files are untouched by this answer, and the task is still four files.
  >
  > Your reading of the type is right — I checked
  > `node_modules/@mantine/core/lib/core/MantineProvider/theme.types.d.ts` on this
  > machine: `HeadingStyle` is `{ fontSize, fontWeight?, lineHeight }`. Size and
  > line-height stay in the theme; only the tracking moves.
  >
  > Why not (b) `theme.components.Title`: a plain `styles` entry applies to every
  > `order`, so pinning it to `order={1}` needs a `styles` callback — more
  > machinery than one declaration deserves — and it still misses any raw `<h1>`.
  > Why not (c) per-component CSS: the h1 tracking is a token-layer value, and
  > pushing it into one page's module is the per-component drift SPEC-001's token
  > layer exists to stop. All six routes render `<Title order={1}>` (`HomeHero`,
  > `AboutContent`, `ServicesContent`, `PortfolioContent`, `BlogContent`,
  > `ContactContent`), so under (c) the other five would take the new
  > `clamp(3rem, 11vw, 8.5rem)` size with the old tracking. `globals.css` already
  > holds `font-style: normal` and `text-wrap: balance` for exactly this reason,
  > so (a) is that file's established job, not a new pattern.
  >
  > **One correction to your note (c), checked in the repo:**
  > `HomeHero.module.css:61-64` — `.name` sets `margin: 0` and
  > `letter-spacing: -0.025em` and **nothing else**. There is no `font-size` there
  > and no media query adds one, so the theme's h1 size does reach the hero today;
  > only the tracking is shadowed, and only because a class beats an element
  > selector. The hero therefore keeps `-0.025em` until TASK-004 rebuilds that
  > module — expected mid-stream, like the dead toggle. TASK-004 now carries the
  > instruction to delete that override. **Do not touch `HomeHero.module.css` in
  > this task.**
  >
  > No `h1` on any route renders a Thai string (all six take English strings from
  > `SITE` or the config files), so the negative tracking raises no combining-mark
  > risk. SPEC-001 §"Token layer" now records where the value lives.
  >
  > That is the whole of FQ1. Add the rule, re-run the DoD, move TASK-001 to REVIEW.

  > **FQ1 CLOSED (Fern, 2026-08-30).** Rule added to `globals.css` as written in the
  > amended scope. Your correction to my note (c) is confirmed on the running page:
  > `HomeHero .name` sets no `font-size`, so the hero takes the theme's h1 size (48px
  > at this viewport) and only shadows the tracking (`-1.2px`); the other five routes
  > take `-1.92px`. Nothing was touched in `HomeHero.module.css`. Full DoD re-run,
  > all six boxes ticked. No new question from this round.

- **SA note — your observation 1 (`mantineHtmlProps` serves
  `data-mantine-color-scheme="light"` in the SSR markup): no change, and do not add
  `data-mantine-color-scheme="dark"` after the spread.** `ColorSchemeScript` is a
  blocking script in `<head>`, so the attribute is corrected before the first paint —
  there is no flash to remove. Hard-coding `dark` into the served markup would put
  the colour scheme in two places, and SPEC-001's "reinstating light mode is a
  two-line revert" would quietly become three. Recorded here so the next reader who
  greps the raw HTML, sees `light` and concludes the force failed does not re-open
  it. Your observation 2 (dev server on port 3001) needs nothing — the port is not
  part of any DoD.

## Review

**Verdict: DONE** (Sober, 2026-08-30). TASK-001 implements SPEC-001 §"Token layer"
faithfully and completely. Nothing is sent back.

**Verified by me, first-hand, in the repo on `develop`:**

- **Four files, no others.** `git status --short` = exactly the four modified paths,
  no untracked file added.
- **Colour tuples are byte-identical to SPEC-001.** All ten `iris` and all ten
  `obsidian` hexes match the SPEC character-for-character. No value rounded, added
  or "improved".
- **Both variable blocks: 0 names removed.** Diffed the old and new
  `cssVariablesResolver` name-by-name — all 14 pre-existing names survive in both
  `light` and `dark`, `--site-max-width` unchanged, and the six
  `--site-glass-*`/`--site-aurora-*` names are added to **both** blocks, so no name
  is ever undefined. Every dark value matches the SPEC's variable table.
- **The "unchanged" list really is unchanged.** `fontFamily`,
  `fontFamilyMonospace`, `autoContrast`, `focusRing`, `respectReducedMotion`, the
  4pt `spacing` scale, the whole `other` block, `h3`–`h6` (and `h2`'s `lineHeight`),
  and `ActionIcon`/`TextInput`/`Textarea` are all byte-identical to `HEAD`. The
  `components` block gained exactly one declaration — `'--button-radius': '999px'`
  on the `filled` branch — plus one comment line documenting it; the 44px control
  heights and the `--site-cta-*` wiring are untouched.
- **`npm run build` re-run by me:** `✓ Compiled successfully in 5.2s`, 10/10 static
  pages, **zero errors, zero warnings**.
- **`globals.css`:** two hunks only — the sans fallback stack, and the FQ1 `h1` rule
  placed directly under the `h1..h6` block. `text-wrap`, `:focus-visible`,
  `.site-numeric`, `.site-skip-link` and the z-layers are untouched.
- **Out-of-scope items respected:** `ColorSchemeToggle` still exists, is still
  exported from the `ui/` barrel, and is still rendered by `SiteHeader.tsx:41` —
  TASK-003's job, correctly left alone. No `package.json` edit. No component or
  CSS-module file touched. `HomeHero.module.css` untouched, as instructed.

**Accepted on your evidence, not re-run by me:** the six-route dev-console sweep and
the live read-back of `data-mantine-color-scheme="dark"` / `rgb(11,9,22)` / the
`-1.92px` h1 tracking under an emulated light OS. Your read-back was per-route and
specific, and the mechanism is in the code I read (`forceColorScheme="dark"` on both
`ColorSchemeScript` and `MantineProvider`). Your refusal to claim "no light flash"
from a mechanism rather than a measured frame is the right call and is what a review
wants to see — it is not held against the task.

FQ1 was the only spec line that could not land as written, and you stopped instead
of picking a substitute. That was correct. Both your observations are answered under
§Questions; neither changes anything here.

### One defect found — it is MINE, in SPEC-001, not yours

Do not act on this in TASK-001; it needs no rework from you and this task stays DONE.
Recorded here so the trail is complete.

SPEC-001 §Non-functional requires every text/background pair on `/` to clear WCAG AA
(4.5:1 at body size). The primary-CTA token pair I specified does **not**:

| Pair | Computed | Required |
|---|---|---|
| `--site-cta-fg` `#f5f3fb` on `--site-cta-bg` `iris[5]` `#7a4fff` | **4.35:1** | 4.5:1 |
| same label on `--site-cta-bg-hover` `iris[4]` `#8b66ff` | **3.51:1** | 4.5:1 |

Hover is worse than rest because I pointed the hover at a *lighter* shade. Every
other pair in the layer clears comfortably (body 16.54, dimmed 8.11, anchor 7.08,
dimmed-on-surface 7.61). You implemented the numbers exactly as the SPEC gave them,
which is what the TASK told you to do — the wrong number is my authorship.

The filled CTA is built in **TASK-004**, so this is settled before then. It is a
token-layer correction (a `theme.ts` value), not a component fix, and choosing the
replacement shade is an SA decision I make in my next unit — I am not guessing at it
inside a review. **Do not pick a colour yourself if you reach TASK-004 first; stop
and ask.** Tracked on the board under Blocked/waiting as SA-OWN-1.

> **CLOSED 2026-08-30** — SA-OWN-1 is answered in SPEC-001 §"CSS variables"
> (the CTA inverts: `iris[4]` fill / `iris[3]` hover / `obsidian[9]` ink label,
> 5.11:1 and 7.08:1). The three `theme.ts` values are corrected in **TASK-004 §0**;
> this task is **not** reopened and its verdict above stands. Nothing is owed here.
