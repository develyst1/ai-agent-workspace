# TASK-004: Home rebuild — four sections on the new language

- Source: SPEC-001
- Status: DONE (Sober 2026-08-30 — see §Review; FQ8 answered, two boxes carried to TASK-005)
- Owner: — (closed)
- Depends on: TASK-002, TASK-003

Read **SPEC-001 §"Flow — the new `/`"** and **§"Retired patterns"** first. This is
the task the owner actually looks at. `app/page.tsx` is **not** edited — it already
delegates to `HomeContent`.

## What to do

**0. Token corrections — SA-OWN-1 and SA-OWN-2, answered 2026-08-30. Do this first;
the rest of the page is built on it.** Both were defects in SPEC-001's own numbers,
not in TASK-001/TASK-002. Those tasks stay DONE and are not reopened; their two files
are edited here instead. Rationale and every measurement live in **SPEC-001 §"CSS
variables"** — read the two resolved blocks there, do not re-derive the shades.

- `front/src/theme/theme.ts`, `cssVariablesResolver` **`dark`** block — three values
  change, no name is added or removed:
  - `'--site-cta-bg': iris[5]` → **`iris[4]`**
  - `'--site-cta-bg-hover': iris[4]` → **`iris[3]`**
  - `'--site-cta-fg': '#f5f3fb'` → **`obsidian[9]`**
- `front/src/theme/theme.ts` — **one new name**, added to **both** the `dark` and the
  `light` block (the `light` block is unreachable but no name may ever be undefined):
  - `dark`: `'--site-quote-translation': obsidian[1]`
  - `light`: `'--site-quote-translation': obsidian[4]`
- `front/src/components/ui/PullQuote/PullQuote.module.css` — **one line**, `.translation`:
  `color: var(--mantine-color-dimmed)` → `color: var(--site-quote-translation)`.
  Nothing else in that file changes; in particular do **not** touch `font-size` or
  `font-weight` — size and weight are now the whole hierarchy between the two lines,
  by decision (SPEC-001 SA-OWN-2 §"Accepted cost").
- **`--mantine-color-dimmed` stays `#a9a3ba`.** It is read by the five out-of-scope
  routes and by the at-rest nav link, and the ≤ L 0.046 header ceiling in item 1a is
  derived from it. Changing it is not in scope here.
- The theme comment above `components.Button` (about pairing a filled button's own
  foreground with its own fill) is now more accurate, not less — leave it.

`HomeContent` re-composes into four sections in this order, each wrapped in the
existing `PageSection` so gutters and max-width stay site-wide consistent.

**1a. The header overlay — added 2026-08-30, the answer to TASK-003 §FQ5.** Read that
answer and SPEC-001 §Flow → Shell before building the hero; it changes what the top of the
page is.

- `front/src/app/globals.css` — add **one** token to the existing `:root` block, beside
  `--site-z-header`: `--site-header-height: 64px;`, plus `72px` inside a
  `@media (min-width: 48em)` `:root` block. Those are the two `min-height` values
  `SiteHeader.module.css .inner` already uses; they are duplicated on purpose (a CSS module
  cannot publish a value to `:root`) and must move together if the bar ever resizes.
  **Nothing else in `globals.css` changes.**
- `HomeHero.module.css` — the hero rises under the sticky bar:
  `margin-top: calc(-1 * var(--site-header-height)); padding-top: var(--site-header-height);`
  A `min-height: 100dvh` hero then fills the viewport exactly, with no overflow.
- **Do not touch `SiteShell.module.css`, `SiteShell.tsx` or `SiteHeader.*`.** The bar stays
  `position: sticky`; going `fixed`, or padding `.main`, drags the five out-of-scope routes
  under the bar. That was considered and rejected in FQ5.
- **Binding contrast constraint — this is the price of the overlay.** At rest the bar is
  fully transparent, so the nav links (`--mantine-color-dimmed` `#a9a3ba`) sit on whatever
  the hero puts behind them. Measured: **3.82:1** over `--site-aurora-2`, **2.23:1** over
  `--site-aurora-1`, **1.29:1** over `--site-aurora-3` — all failing 4.5:1. So the aurora’s
  bright cores must sit **below** the header band; the top `--site-header-height` stays
  effectively the page ground. See the DoD item for the number to check.
- If the hero you want needs a bright core inside that band, **stop and ask** — do not nudge
  an alpha, a gradient stop or a nav colour. The fallback is deleting the two lines above,
  which returns `/` to the non-overlapping bar TASK-003 shipped, and costs nothing else.

**1. `HomeHero.tsx` + `HomeHero.module.css` (rebuilt)**

- `AuroraBackdrop variant="hero"` behind the content; the hero wrapper becomes the
  positioned parent and content sits above it.
- `SITE.name` as the oversized display wordmark — `<Title order={1}>`, which now
  carries the `clamp(3rem, 11vw, 8.5rem)` scale from TASK-001. This is the page's
  main visual event.
- **Delete the `letter-spacing: -0.025em` override on `.name`** and do not replace
  it. The h1 tracking is global as of TASK-001/FQ1
  (`h1 { letter-spacing: -0.04em }` in `globals.css`); that class override is the
  only thing shadowing it, and no CSS module re-declares h1 tracking (SPEC-001
  §"Token layer").
- `SITE.nickname` + `SITE.role` as the supporting line, `HOME_LEAD` as the paragraph.
- `SITE.availability` as a small live marker in a **new shape** — the current
  mono-uppercase pill with a dot is a retired pattern.
- CTAs: primary = filled purple pill, `component={Link} href="/portfolio"`, label
  **`View my work`** (existing string, unchanged). Secondary = a plain underlined
  text link with a trailing arrow, `href="/contact"`, label **`Get in touch`**
  (existing string, unchanged) — `variant="default"` is a retired pattern, so this
  becomes a real link, not a Button; it needs a 44px minimum touch target and a
  visible `:focus-visible` ring.
- `<PullQuote id="q4" size="lead" />` sits with the CTAs as the hero's closing line.
- The `CAREER_STATS` block moves **out** of the hero into `HomeStats`.
- Keep the entrance animation's `prefers-reduced-motion: reduce` opt-out.

**2. `HomeStats.tsx` + `HomeStats.module.css` (new)**

- `CAREER_STATS` from `@/constant/content/about` as a row of `GlassPanel` cards
  (`as="div"`), values in the mono face with `tabular-nums` (the existing
  `.site-numeric` global class does this).
- Keep the `<dl>` / `<dd>` / `<dt>` semantics the current hero markup already uses.
- **No heading.** There is no existing heading string for this section and none may
  be invented (REQ-001 R4) — an unheaded band is the intended design.

**3. `HomeCapabilities.tsx` + `HomeCapabilities.module.css` (rebuilt)**

- Same `SectionHeading` call with the same props and the same `CAPABILITIES_*`
  strings from `Home.config.ts` — including `id="capabilities-heading"`, which
  `PageSection labelledBy` points at.
- New pattern: large numbered rows inside **one** `GlassPanel glow`, separated by
  spacing, with a purple edge-light on `:hover` / `:focus-within`. The 2×2 1px
  hairline grid is retired and must not survive in any form.
- `CAPABILITIES` content and the `01`/`02` index numerals stay.

**4. `HomeStatement.tsx` + `HomeStatement.module.css` (new)**

- Full-bleed deeper band with `AuroraBackdrop variant="band"`, carrying
  `<PullQuote id="q2" size="band" />` bilingually (Thai primary, English beneath).
- No heading, no CTA, no other copy.

**5. `HomeContent.tsx`** — compose the four in order. **6. `Home/index.ts`** — export
the two new partials alongside the existing three.

**7. One line in a shared file — the FQ2 answer (TASK-002 §Questions)**

- `front/src/components/ui/GlassPanel/GlassPanel.module.css` — add `list-style: none;`
  to `.panel`. That is the whole change: a component offering `as="li"` must not need
  undocumented consumer CSS to avoid showing a marker.
- Home uses `as="div"` only, so nothing here exercises it — do **not** convert any
  section to a list to "use" it. If a future consumer ever does pass `as="li"`, that
  consumer's `<ul>` owns its own `margin` / `padding-inline-start` reset and must
  carry `role="list"` (Safari/VoiceOver drops list semantics when items compute
  `list-style-type: none`).

**8. The FQ6 answer — the two bleeding sections invert their nesting, and the hero
aurora's peak comes down. Added 2026-08-30 by Sober; this is the only work left in
this TASK.** Read **SPEC-001 §Flow → "Composition"** and **§Flow → Shell → the
amendment box** first; the reasoning and every number are there and are not repeated
here. Nothing already built is thrown away — §1a's two pull-up lines stay exactly as
you wrote them and finally do what they were meant to.

- **`HomeContent.tsx`** — `HomeHero` and `HomeStatement` are no longer wrapped in
  `PageSection`; they render bare, as direct children of `<main>`. `HomeStats` and
  `HomeCapabilities` keep their wrappers **unchanged**, `bordered` and
  `labelledBy="capabilities-heading"` included.
- **`HomeHero.tsx`** — `.hero` becomes the bleeding wrapper and the `PageSection`
  moves *inside* it:
  `<div className={classes.hero}><AuroraBackdrop variant="hero" /><PageSection density="tight"><div className={`${classes.content} ${classes.enter}`}>…</div></PageSection></div>`.
  The content markup inside is untouched.
- **`HomeHero.module.css`** — `.hero` keeps `position: relative`, `display: grid`,
  `align-content: center`, `min-height: 100dvh` and the two `--site-header-height`
  lines **verbatim**. No new property is needed. `.content` already carries
  `position: relative; z-index: 1`; leave it.
- **`HomeStatement.tsx`** — same inversion:
  `<div className={classes.band}><AuroraBackdrop variant="band" /><PageSection density="regular"><div className={classes.inner}><PullQuote id="q2" size="band" /></div></PageSection></div>`.
- **`HomeStatement.module.css`** — `.band` keeps `position: relative` and
  `background-color: var(--site-surface)`; **delete `border`, `border-radius` and
  `overflow: hidden`** (a bleeding band has no edge to draw, and nothing overflows a
  layer that is `inset: 0`). `.inner` becomes **only** `position: relative; z-index: 1`
  — delete both padding rules and the media query with them; `PageSection` supplies
  the padding now.
- **`front/src/components/ui/AuroraBackdrop/AuroraBackdrop.module.css`** — three
  numbers in the **`.hero`** block, nothing else in the file:
  `var(--site-aurora-1) 55%` → **`48%`**, `var(--site-aurora-2) 62%` → **`52%`**,
  `var(--site-aurora-3) 24%` → **`22%`**. The `.band` block is **not** touched. No hex
  enters this file, no stop position moves, no gradient centre moves, no layer is
  added or removed. This is a fifth file outside `partials/Home/` — the `git status`
  DoD item below is widened to five for it.
- **Do not touch** `PageSection.tsx`, `PageSection.module.css`, `SiteShell.*`,
  `SiteHeader.*`, `SiteFooter.*` or `theme.ts`. The whole point of this shape is that
  it costs no shared-component edit; if you find yourself needing one, **stop and ask**.
- **Do not** reach for `100vw`, `calc(50% - 50vw)` or `overflow-x: clip`. The bleeding
  wrapper is a child of full-width `<main>`, so `width: 100%` already reaches both
  edges and the scrollbar trap you measured cannot occur. If a horizontal scrollbar
  appears at any width, that is a **stop-and-ask**, not something to clip away.

## Hard rules for this task

- **SA-OWN-1 and SA-OWN-2 are ANSWERED (2026-08-30) and land as item 0 above.**
  Nothing about the CTA or the quote colours is blocked any more. What remains
  binding: the values in item 0 are the whole fix — do not add a fourth colour, a
  scrim, an opacity or an alpha nudge to "help" either of them, and do not change
  `--mantine-color-dimmed` or any `--site-aurora-*` value. Both fixes carry a
  measured backdrop-luminance ceiling (≤ **L 0.046** under the header band, ≤
  **L 0.1027** under any `PullQuote`); if the hero you want breaches either, that is
  a **stop-and-ask** in `## Questions`, not a colour you retune.
- **Quotes on Home are `q4` and `q2` only.** Not `q1`, not `q3` — REQ-001 R5 forbids
  all four on one page and the acceptance criteria require at least one.
- **No new copy.** Every string on the page must already exist in `constant/site.ts`,
  `Home.config.ts`, `constant/content/about.ts`, `constant/content/quotes.ts`, or be
  one of the two CTA labels above. If a section you are building seems to need a
  label that does not exist, **stop and write it in `## Questions`** — that is a DATA
  REQUEST to the owner via Sober → Porter, never a placeholder, never a guess.
- **Nothing from the reference screenshot's content**: no `150+`, no `12Years`, no
  filler paragraph, no other brand's name (REQ-001 R9).
- **No inline strings in JSX** and no one-off colour, font or spacing literal in the
  CSS modules — every value reads a token or a `--site-*` variable. A value the
  tokens cannot express is a SPEC decision: ask in `## Questions`.
- **No new `"use client"`** — all four sections are static server components.
- Shared component props (`PageSection`, `SectionHeading`, `TechChip`, `ChipRow`,
  `ImageLightbox`, `SiteShell`) are frozen. Do not change a signature to make Home
  easier.

## Definition of Done

**Re-run rule, added 2026-08-30 with §8.** §8 changes markup, layout and the band
aurora's size, so a ticked box is only still true if §8 could not have touched it.
**Re-run and re-tick every box below** — the build, the 360px overflow check, the
quote-rendering check and the SA-OWN-2 sample all sit downstream of the new geometry.
Boxes whose evidence genuinely cannot have moved (the greps, the string-source list)
may be left ticked; say which ones you re-ran.

- [x] `cd front && npm run build` completes with no errors and no new warnings.
- [x] `/` loads in `npm run dev` with an empty browser console.
- [x] Every string visible on `/` is traceable to a `constant/` or `*.config.ts`
      file — list the sources in Implementation Notes.
- [x] Grep `src/components/partials/Home/` for `"use client"` → no hits.
- [x] Grep the Home CSS modules for `#` hex literals and `gap: 1px` → no hits.
- [x] Both quotes render both scripts correctly (Thai renders as Thai, not tofu),
      and `q4` renders English alone with no empty second line.
- [x] At 360px width: no horizontal scrollbar, no clipped Thai line, the wordmark
      does not overflow.
- [x] **RE-RUN AFTER §8 — aurora luminance ceiling (replaces the old item 1a check;
      rewritten 2026-08-30 with the FQ6 answer).** The rule is no longer about the header
      band alone: **no point of the composited hero aurora may exceed relative luminance
      0.046.** Scan the whole `.hero` box, not just its top strip, at **1280×800 and
      360×740 at minimum**, and report the single highest sampled luminance in
      Implementation Notes together with the `#a9a3ba` ratio it implies. Expected ≈
      **L 0.0387 → 4.87:1**. Above 0.046 is a **stop-and-ask** — do not retune an alpha,
      a stop or a gradient centre to land it.
- [x] **RE-RUN AFTER §8 — the hero actually fills the viewport. Rule corrected by Sober
      2026-08-30 with the FQ8 answer: `height >= window.innerHeight`, not `===`.** At both
      widths, at scroll 0: the `.hero` element's `getBoundingClientRect()` has `top === 0`
      (±1px) and `height >= window.innerHeight` (±1px), and `document.scrollWidth ===
      document.clientWidth`. Quote the rect.
      **TICKED on the corrected rule — all three rects Fern quoted (800.00/800,
      769.56/740, 790.09/600) satisfy it. The `===` was my own wording error: it asserted
      an equality that `min-height: 100dvh` never promises. See FQ8.**
- [x] **RE-RUN AFTER §8 — the two bleeding layers reach both edges.** For the hero
      aurora and the band aurora, the element's rect spans `left === 0` and
      `right === document.documentElement.clientWidth`. This is the check that the seams
      you measured at x=104.5 / x=1160.5 are gone; say so explicitly.
- [x] **RE-RUN AFTER §8 — hero text runs against the moved backdrop.** The aurora's peak
      luminance and the hero's geometry both changed, so your contrast table for the hero
      is stale. Re-sample every text run in the hero (the `dimmed` ones — `role`, `lead` —
      are the ones at risk) and re-post the table. Every run ≥ 4.5:1. A run that fails is
      a **stop-and-ask**: the remedy would be moving that run to `--mantine-color-text`,
      which is my call, not a colour you pick.
- [x] **RE-RUN AFTER §8 — `git status --porcelain` shows exactly FIVE touched files
      outside `partials/Home/`** (widened from four by §8): `app/globals.css`,
      `theme/theme.ts`, `ui/GlassPanel/GlassPanel.module.css`,
      `ui/PullQuote/PullQuote.module.css`, `ui/AuroraBackdrop/AuroraBackdrop.module.css`.
      A sixth file means the shape went wrong — stop and ask.
- [x] **SA-OWN-1 measured on the render, not asserted from the token** (item 0). On the
      rendered primary CTA, read the *computed* `color` and `background-color` of the
      button — expect `rgb(11, 9, 22)` on `rgb(139, 102, 255)` — and the same on
      `:hover` (`rgb(164, 136, 255)`). If the computed label is not the ink colour,
      `autoContrast` is winning over `--button-color` and that is a **stop-and-ask**,
      not something to patch. Quote both computed values in Implementation Notes.
- [x] **SA-OWN-2 measured on the render** (item 0). Only the **band** quote `q2`
      exercises the new token: `q4` has no `th`, so the hero quote renders through
      `.primary` (`--mantine-color-text` `#eceaf2`, 6.15:1 over the hero composite —
      already safe) and has no translation line at all. So: on the band quote, confirm
      the translation line's computed `color` is `rgb(211, 207, 221)`, and sample the
      composited backdrop behind that text box — every sample at or below relative
      luminance **0.1027**. Report the highest sampled luminance. Do **not** go looking
      for a translation line in the hero; its absence is correct, and an empty second
      line there is a bug (existing DoD item above).
- [ ] (UNTICKED — rule present and correctly targeted, but this session cannot emulate the OS flag) With OS reduced-motion on, the hero entrance animation does not play.
- [x] The other five routes still build and render (they will look old — expected).
- [x] `GlassPanel.module.css` `.panel` carries `list-style: none` (item 7) and no
      other line of that file changed.

## Implementation Notes

Filled by Fern 2026-08-30. Branch `develop`, no git write, no deploy, no
`package.json` change. Dev server stopped after the run.

### Files touched — 15

Outside `partials/Home/` (exactly the four the DoD names):
`app/globals.css` (§1a token only), `theme/theme.ts` (§0),
`ui/GlassPanel/GlassPanel.module.css` (§7, one line), `ui/PullQuote/PullQuote.module.css`
(§0, one line — `font-size`/`font-weight` untouched).
Inside `partials/Home/`: `HomeContent.tsx`, `index.ts`, `Home.config.ts` (+2 CTA
label constants), `HomeHero.tsx/.module.css` (rebuilt), `HomeCapabilities.tsx/.module.css`
(rebuilt), `HomeStats.tsx/.module.css` (new), `HomeStatement.tsx/.module.css` (new).

`git status --porcelain` at the end lists **exactly** those four outside
`partials/Home/`. (TASK-003's four shell files disappeared from the working tree
mid-run — the owner committed them as `2ef36ec`.)

### Verification — commands and results

- `npx tsc --noEmit` → exit 0. `cd front && npm run build` → exit 0, "Compiled
  successfully", 10/10 static pages, **no warnings**. Run twice.
- All six routes `200` on `npm run dev` (port 3001). Browser console: only the
  React-DevTools info line; the two `404`s seen mid-run were
  `_next/static/webpack/*.hot-update.json`, i.e. Fast-Refresh artefacts of my own
  edits, gone after a fresh navigation.
- Greps in `src/components/partials/Home/`: `"use client"` → 0 hits; `#` in the CSS
  modules → 0 hits; `gap: 1px` → 0 hits.
- 360×740: `scrollWidth == clientWidth == 360`, zero elements outside the viewport
  box, `h1` `scrollWidth == clientWidth == 320` at `48px` — no clip, no overflow.
- Quotes: band `q2` renders `<p lang="th">` + `<p lang="en">`, Thai glyphs present
  (no tofu), the owner's straight `"` characters intact. Hero `q4` renders **one**
  `<p lang="en" class="PullQuote_primary">` — no empty second line.
- Reduced motion: the served stylesheet carries
  `@media (prefers-reduced-motion: reduce) { .HomeHero_enter { animation: none } }`
  plus the two new `transition: none` guards (`.textLink`, `.row::before`).
  **Not frame-verified** — this session cannot emulate the OS reduced-motion flag,
  so the rule is confirmed present and correctly targeted, not observed suppressing
  the animation.

### DoD — SA-OWN-1, measured on the render

Read off the live primary CTA with `getComputedStyle`, at rest and while actually
hovered (`:hover` asserted true):

| state | computed `color` | computed `background-color` | ratio |
|---|---|---|---|
| rest | `rgb(11, 9, 22)` | `rgb(139, 102, 255)` | 5.11:1 |
| hover | `rgb(11, 9, 22)` | `rgb(164, 136, 255)` | 7.08:1 |

Both match SPEC-001 SA-OWN-1 exactly. `autoContrast` did **not** win —
`--button-color` from `theme.components.Button.vars` is what the label resolves to.
Control height 44px.

### DoD — SA-OWN-2, measured on the render

Band quote `q2`: translation line computed `color` = **`rgb(211, 207, 221)`**
(`#d3cfdd`) as required. Highest sampled backdrop luminance behind that text box:
**L 0.01566** (ceiling 0.1027) → 10.46:1. Thai primary line: `rgb(236, 234, 242)`,
backdrop max **L 0.02412** → 11.89:1. Hero quote has no translation line, as
specified — nothing to sample there.

### DoD — header-overlay band luminance (item 1a) — READ THIS WITH FQ6

Highest sampled relative luminance across the top `--site-header-height` (72px) of
`/` at scroll 0, **as the page currently ships**: **L 0.03325** (worst sample at
x=273, composite `rgb(55, 33, 123)`), giving the at-rest nav link `#a9a3ba`
**5.19:1**. Under the 0.046 ceiling — *but only because the hero never reaches the
viewport top*; see FQ6. Same scan with the hero flush to y=0 as item 1a intends:
**L 0.04667** at an 800px-tall viewport and **L 0.0482** at 700px — both **breach**
the ceiling.

*Method, stated honestly.* This is a computed composite, not a pixel readback: the
sampler reads the aurora layer's real `getBoundingClientRect()` and the real
computed `--site-aurora-*` / body values from the running page, then applies each
gradient's own geometry and stops (premultiplied linear alpha, layers composited in
paint order) at 3px steps. No API in this session returns live pixels.

### Contrast-driven token choices inside the hero (not prescribed by the TASK)

`--mantine-color-dimmed` `#a9a3ba` fails 4.5:1 over the aurora's bright core
(SA-OWN-2: 3.02:1), so every hero text run was sampled before a token was picked:

| run | token | worst backdrop L | ratio |
|---|---|---|---|
| availability marker | `--mantine-color-text` | 0.03572 | 10.28:1 |
| `h1` wordmark | `--mantine-color-text` | 0.03585 | 10.26:1 |
| nickname | `--mantine-color-text` | 0.01473 | 13.61:1 |
| role | `--mantine-color-dimmed` | 0.01473 | 6.67:1 |
| lead | `--mantine-color-dimmed` | 0.00708 | 7.56:1 |
| secondary CTA link | `--mantine-color-text` | 0.00324 | 16.54:1 |

`role` and `lead` keep `dimmed` because it also clears under both alternative
geometries in FQ6 (7.74:1 / 8.11:1). No new token, no alpha, no aurora value moved.

### Strings — every visible string on `/` and its source

`constant/site.ts`: `SITE.availability`, `SITE.name`, `SITE.nickname`, `SITE.role`.
`Home.config.ts`: `HOME_LEAD`, `CAPABILITIES_EYEBROW`, `CAPABILITIES_TITLE`,
`CAPABILITIES_LEAD`, and the two CTA labels — `HERO_CTA_PRIMARY` "View my work",
`HERO_CTA_SECONDARY` "Get in touch", moved out of JSX **verbatim** so the DoD's
"traceable to a config file" holds and the hard rule "no inline strings in JSX" is
met. `constant/content/about.ts`: `CAREER_STATS` (4), `CAPABILITIES` (4).
`constant/content/quotes.ts`: `q4` (hero), `q2` (band). The `01`–`04` numerals are
computed from the array index, as before. **No string was added, edited or
invented**, and nothing from the reference screenshot appears.

### Retired patterns — gone from `/`

No `gap: 1px` hairline surface anywhere (both the hero `.facts` grid and the 2×2
`.grid` are deleted). No mono-uppercase eyebrow: the availability marker is now an
accent capsule in the body face. No `Button variant="default"`: the secondary CTA
is a real underlined `next/link` with a 44px min-height and the global
`:focus-visible` ring. `HomeHero.module.css .name` no longer declares
`letter-spacing`, so the global `h1 { -0.04em }` reaches the wordmark.

### What I did NOT verify

- Scrolled screenshots. This session's browser pane paints only the first frame
  after a navigation (the same environment limit TASK-003 hit); DOM geometry,
  computed styles and text content for Stats / Capabilities / Statement were
  verified programmatically, and one partial screenshot caught the stats cards and
  the capabilities heading rendering — but I have no full-page image below the fold.
- The reduced-motion flag itself (above).
- How it *looks*. Visual acceptance is the owner's, via Porter.

---

## Implementation Notes — §8, second pass (Fern, 2026-08-30)

Everything above this line is the first pass and still stands unless a line below
supersedes it. Branch `develop`, no git write, no deploy, no `package.json` change.
Dev server (port 3007) stopped after the run.

### Files touched by §8 — five, exactly as §8 names them

`HomeContent.tsx` (hero + statement now bare children of `<main>`),
`HomeHero.tsx` (+`PageSection` import; the `PageSection density="tight"` moved
*inside* `.hero`, content markup byte-identical, only re-indented),
`HomeStatement.tsx` (same inversion, `density="regular"`),
`HomeStatement.module.css` (`border` / `border-radius` / `overflow: hidden` and both
`.inner` padding rules + their media query deleted; `.inner` is now only
`position: relative; z-index: 1`),
`AuroraBackdrop.module.css` (three alpha numbers in `.hero`).
**`HomeHero.module.css` was not touched** — §8 needed no new property there, and the
two §1a pull-up lines survive verbatim.

`git diff --stat` on `AuroraBackdrop.module.css`: **3 insertions, 3 deletions**, all
inside the `.hero` block. `.band` is byte-identical. No hex entered the file, no stop
position, gradient centre or layer moved.

### DoD — `git status --porcelain` outside `partials/Home/` — FIVE, as widened

`app/globals.css` · `theme/theme.ts` · `ui/GlassPanel/GlassPanel.module.css` ·
`ui/PullQuote/PullQuote.module.css` · `ui/AuroraBackdrop/AuroraBackdrop.module.css`.
No sixth file. `PageSection.*`, `SiteShell.*`, `SiteHeader.*` and `SiteFooter.*` are
untouched by this pass.

### DoD — build and console, re-run after §8

`npx tsc --noEmit` → exit 0. `cd front && npm run build` → exit 0, "Compiled
successfully in 6.2s", **10/10 static pages, no warnings**. All six routes `200` on
`npm run dev`. Browser console on `/`: **one** line, the React-DevTools info notice.

### DoD — aurora luminance ceiling (whole `.hero` box, not just the top strip)

Same computed-composite sampler as the first pass (method restated below), now run
over the **entire** hero box at **1px** steps:

| viewport | hero box | highest sampled L | composite | `#a9a3ba` ratio |
|---|---|---|---|---|
| 1280×800 | 1265×800 | **0.03883** at (202, 80) | `rgb(59, 35, 134)` | **4.86:1** |
| 360×740 | 360×769.6 | **0.03873** at (58, 77) | `rgb(59, 35, 134)` | **4.87:1** |
| 1280×600 | 1265×790 | **0.03869** at (202, 80) | `rgb(59, 35, 134)` | **4.87:1** |

Ceiling 0.046 — **cleared at every viewport**, with the ~16% headroom the SPEC asks
for. These land on Sober's predicted **L 0.03873 → 4.87:1** to four decimals. Nothing
was retuned to get there; the three alphas are exactly `48 / 52 / 22`.

*Method, restated honestly (unchanged from the first pass).* This is a **computed**
composite, not a pixel readback: the sampler reads the aurora layer's live
`getBoundingClientRect()` and its live computed `background-image` — so the alphas and
stops come off the running page, never from the source file — then applies each
gradient's own ellipse geometry with premultiplied linear alpha, layers composited in
paint order (first-listed on top) over the real body ground `rgb(11, 9, 22)`. No API in
this session returns live pixels. If a real readback ever contradicts this, it wins.

### DoD — the two bleeding layers reach both edges: the seams are gone

At 1280×800 (`clientWidth` 1265) and 360×740 (`clientWidth` 360), at scroll 0:

| element | left | right | width |
|---|---|---|---|
| `.hero` and hero aurora @1280 | **0** | **1265** | 1265 |
| `.band` and band aurora @1280 | **0** | **1265** | 1265 |
| `.hero` and hero aurora @360 | **0** | **360** | 360 |
| `.band` and band aurora @360 | **0** | **360** | 360 |

Both auroras now share their wrapper's rect exactly and span `0 → clientWidth`.
**The vertical seams I measured at x=104.5 / x=1160.5 and the horizontal one at y=65
no longer exist** — confirmed in the rects above and visible in the one screenshot this
session could take (hero at 1280×800: the gradient runs off both edges, no boxed
rectangle, the bar floating over the wordmark). `document.scrollWidth ===
document.clientWidth` at both widths — no horizontal scrollbar, and no `100vw`,
`calc(50% - 50vw)` or `overflow-x: clip` was used anywhere.

### DoD — hero text runs re-sampled against the moved backdrop

Backdrop = the composited aurora under each run's own box. The availability marker
additionally has its `--site-accent-wash` `rgba(164, 136, 255, 0.10)` composited on
top, since that is the layer its text actually sits on:

| run | token | 1280×800 worst L / ratio | 360×740 worst L / ratio |
|---|---|---|---|
| availability marker | `--mantine-color-text` | 0.04010 / **9.78:1** | 0.04407 / **9.36:1** |
| `h1` wordmark | `--mantine-color-text` | 0.03166 / **10.79:1** | 0.02145 / **12.33:1** |
| nickname | `--mantine-color-text` | 0.00324 / **16.54:1** | 0.01023 / **14.63:1** |
| role | `--mantine-color-dimmed` | 0.00324 / **8.11:1** | 0.02097 / **6.08:1** |
| lead | `--mantine-color-dimmed` | 0.00530 / **7.81:1** | 0.03154 / **5.29:1** |
| secondary CTA link | `--mantine-color-text` | 0.00324 / **16.54:1** | 0.00324 / **16.54:1** |
| hero quote `q4` | `--mantine-color-text` | 0.00324 / **16.54:1** | 0.00324 / **16.54:1** |

**Every run ≥ 4.5:1**; the worst is `lead` at **5.29:1** (360×740). No run needed
moving to `--mantine-color-text`, so no stop-and-ask here. No token, alpha or aurora
value was changed to reach these.

### DoD — SA-OWN-1, re-measured on the new geometry

| state | computed `color` | computed `background-color` | ratio |
|---|---|---|---|
| rest | `rgb(11, 9, 22)` | `rgb(139, 102, 255)` | 5.11:1 |
| hover (`:hover` asserted true) | `rgb(11, 9, 22)` | `rgb(164, 136, 255)` | 7.08:1 |

Unchanged by §8. Control height 44px. `autoContrast` still does not win.

### DoD — SA-OWN-2, re-measured (the band is wider now, so this number moved)

Band quote `q2` translation line computed `color` = **`rgb(211, 207, 221)`**, as
required. The band aurora is unchanged, but the band is now full-bleed, so the backdrop
under the quote is brighter than the first pass's boxed measurement:

| line | computed colour | highest backdrop L (was) | ratio |
|---|---|---|---|
| Thai primary | `rgb(236, 234, 242)` | **0.02832** (was 0.02412) | 11.25:1 |
| English translation | `rgb(211, 207, 221)` | **0.02028** (was 0.01566) | 9.77:1 |

Ceiling ≤ **0.1027** — cleared with a wide margin on both lines.

### DoD — quotes, strings, greps, 360px (re-run)

- `q2` renders `<blockquote>` → `<p lang="th">` + `<p lang="en">`, Thai glyphs present
  (no tofu), the owner's straight quote characters intact. `q4` renders **one**
  `<p lang="en">`, no empty second line. (Re-run.)
- 360×740: `scrollWidth === clientWidth === 360`; the only element outside the viewport
  box is the `.site-skip-link` at its off-screen rest position — by design, pre-existing
  and shell-owned. `h1` `scrollWidth === clientWidth === 320` at `48px` — no clip, no
  overflow. (Re-run.)
- Greps in `src/components/partials/Home/`: `"use client"` 0 · `#` in the CSS modules
  0 · `gap: 1px` 0. (Re-run; they could not have moved, but they were cheap.)
- The string-source list in the first pass is **unchanged** — §8 moved markup and added,
  edited and removed no string. Not re-derived.
- Reduced-motion rules still present and correctly targeted (`HomeHero.module.css`
  `.enter` and `.textLink`, `HomeCapabilities.module.css` `.row::before`, plus the
  global one). **Still not frame-verified** — this session cannot emulate the OS flag.

### One measured deviation, and one thing I did NOT verify

- **The hero exceeds the fold at short viewports.** Numbers and the mechanism are in
  **FQ8** below; nothing was changed to hide it.
- **Below-the-fold screenshots.** The browser pane still paints only the first frame
  after a navigation (the TASK-003 limit), so I have an image of the hero and none of
  Stats / Capabilities / Statement. Their geometry, computed styles and text content
  were verified programmatically, as before. **How it looks is the owner's call.**

## Questions

- **FQ6 (BLOCKING one DoD item) — `PageSection` sits between the hero and the
  viewport, so item 1a cannot land as written, and the aurora paints a hard-edged
  rectangle.** I implemented the two prescribed lines exactly and invented no third;
  this is the stop-and-ask the TASK asks for.

  *Measured, 1280×800 and 360×740:*
  1. **Top gap.** `PageSection density="tight"` puts 64px (≥48em) / 48px above the
     hero. The two lines cancel only the 72px/64px header height, so the hero's top
     lands at viewport **y=65** (desktop) / **y=49** (mobile), not 0 — the overlay is
     8px deep, and the hero's `100dvh` block ends 65px/49px **below** the fold. The
     DoD item "the hero fills the viewport with no vertical overflow" therefore
     cannot be ticked.
  2. **Side seams.** `PageSection .inner` is `max-width: 1120px` + `padding-inline`,
     so the hero — the aurora's positioned parent, per item 1 — is **1056px** wide in
     a 1265px viewport. At the aurora's left edge the top gradient is still ≈37%
     alpha, so there are visible vertical seams at x=104.5 / x=1160.5 and a
     horizontal one at y=65. Plainly visible at both widths.
  3. **§4 band.** "Full-bleed" is unreachable from inside `.inner` for the same
     reason. I shipped the band at the section's full content width with
     `--mantine-radius-xl` and `overflow: hidden` rather than a `100vw` bleed, which
     overflows by the scrollbar width (`100vw` 1280 vs `clientWidth` 1265) and would
     fail the no-horizontal-scrollbar DoD item.

  *The trap, and why I did not simply close the gap:* the ≤ L 0.046 ceiling passes
  today (**0.03325**) **only** because of the 65px gap. Flush to y=0 the same scan
  gives **0.04667** at an 800px viewport and **0.0482** at 700px — a breach. So
  "make the hero reach the top" and "keep the nav links at 4.5:1" are in direct
  conflict at the aurora's current geometry, and the aurora is yours, not mine.

  *Options, each costing one file outside this TASK's scope — your call:*
  (a) **Accept as shipped** — passes the ceiling; the seams and the unfilled
  viewport stay, and that DoD item is struck.
  (b) **The TASK's stated fallback** (delete the two overlay lines) — note it fixes
  neither seam; the aurora is still boxed to 1056px. It only removes the 8px overlap.
  (c) **Let the hero escape `PageSection`** (a bleed variant in
  `PageSection.module.css`, or `overflow-x: clip` on `body`/`.section` plus `100vw`
  bleeds in Home's modules). Fixes 1–3 — and then the ≤0.046 breach above is live and
  the hero aurora's stops/positions need an SA number.
  (d) **Make the boxed aurora deliberate** (an inset, rounded panel rather than a
  bleed) — a design decision, not mine to take.

  > answer: **(c) — the hero escapes `PageSection`. But not by either mechanism you
  > costed, and the ≤0.046 breach is closed by lowering the hero aurora's peak, not by
  > moving it. Full instructions in §8; reasoning and numbers in SPEC-001 §Flow
  > (Composition + the Shell amendment box). Four things worth saying here:**
  >
  > **1. Your measurements are right, and I reproduced them independently before
  > deciding.** My own composite gives L 0.04667 at 1265×800 and L 0.04834 at 1265×700
  > flush to y=0, and L 0.03344 / `rgb(55,33,124)` for the page as you shipped it —
  > matching your 0.04667 / 0.0482 / 0.03325 / `rgb(55,33,123)`. Two models agreeing is
  > corroboration, not proof (neither of us reads pixels), which is why the fix takes
  > ~16% headroom rather than the minimum that passes.
  >
  > **2. (c) costs no shared file, because the nesting inverts instead of a bleed being
  > invented.** Both mechanisms you costed pay a shared file: a `PageSection` bleed
  > variant touches a component five out-of-scope routes render, and `100vw` /
  > `overflow-x: clip` buys the scrollbar bug you already caught. Neither is needed —
  > the hero can simply *contain* the `PageSection` instead of being contained by it,
  > and then it is a direct child of full-width `<main>`, where `width: 100%` already
  > reaches both edges. Measure and gutters still come from `PageSection`, so nothing is
  > duplicated. `PageSection`, `SiteShell`, `SiteHeader`, `SiteFooter` and `theme.ts`
  > are all untouched. Your §1a lines survive verbatim and finally land the hero at y=0.
  >
  > **3. Why the aurora's peak comes down instead of its cores moving.** I costed the
  > core-move you were pointing at. It does not remove the conflict, it relocates it: the
  > peak *is* layer 1's core, and pushed far enough down to clear the 72px band (+0.14 of
  > the hero height) that same peak lands in the hero's own text column and takes `role`
  > and `lead` — both `dimmed` — to ~4.39:1. So instead the three `.hero` alphas drop
  > `55/62/24` → `48/52/22`: computed peak **L 0.03873 → 4.87:1** anywhere in the layer,
  > at every viewport I scanned from 360×600 to 1920×1000. That turns a rule about where
  > cores may sit into one flat property of the layer, and retires the per-run
  > ceiling-chasing for good. It also reverses a rejection I recorded myself (SA-OWN-2
  > option (b), "don't lower the aurora alphas") — stated in the SPEC rather than done
  > quietly. The look does not get quieter overall: the same layer goes from a 1056px box
  > to the full viewport, so there is more purple on screen, not less.
  >
  > **4. Your point 3 (the §4 band) is answered the same way, and your stop-gap is
  > superseded.** SPEC-001 §Flow item 4 says *full-bleed* and meant it; the inset rounded
  > panel was the right call while a bleed was unreachable, and it is not the shipping
  > shape. `HomeStatement` takes the identical inversion, and its `border` /
  > `border-radius` / `overflow: hidden` go — a band that reaches both edges has no edge
  > to draw. `.band`'s aurora alphas are **not** changed.
  >
  > Not chosen, one line each: **(a)** leaves seams you call plainly visible and a hero
  > that misses the fold on the one page the owner reviews; **(b)** its own stated
  > fallback fixes neither seam, as you say; **(d)** would be me redesigning a section to
  > fit a container bug instead of fixing the container relationship.

- **FQ7 (non-blocking) — `--site-header-height` and `PageSection`'s densities are
  now coupled.** The token is correct and matches `SiteHeader.module.css .inner`
  (verified: 64px, 72px at 48em). But the *effective* pull-up is
  `header-height − section-padding`, and that padding is a literal in
  `PageSection.module.css` (48/64px tight). Whatever you decide in FQ6, that pair is
  a second place the hero drifts if either number moves — worth a line in SPEC-001
  §Token layer beside the existing warning.

  > answer: **The coupling you found is dissolved by the FQ6 answer, and the two that
  > remain are now written down.** Under §8 the hero is no longer *inside* a
  > `PageSection`, so the effective pull-up is exactly `--site-header-height` and no
  > density literal enters the sum — the pair you flagged stops being a pair. What is
  > real and now listed in SPEC-001 §Token layer ("Duplicated geometry"): (1)
  > `--site-header-height` ↔ `SiteHeader.module.css .inner` `min-height`, already
  > flagged, still binding; (2) the `20/32px` gutter, which exists in three files
  > (`PageSection`, `SiteHeader`, `SiteFooter`). (2) is **not** fixed under this REQ — a
  > `--site-gutter` token means editing two shell files TASK-003 closed and re-verifying
  > five out-of-scope routes to buy nothing REQ-001 asked for. Recorded as a follow-up so
  > the next REQ finds it; do not do it in TASK-004.


- **FQ8 (non-blocking; one DoD box left unticked) — after the inversion the hero is
  taller than the viewport wherever its content plus `PageSection`'s own padding
  exceeds `100dvh`.** Reporting, not fixing: every remedy is a padding, scale or copy
  decision, and `.hero`'s rules are the ones §8 told me to keep verbatim.

  *What passes.* `top` is **1** at every viewport, and `document.scrollWidth ===
  document.clientWidth` everywhere. (That 1px is the sticky bar's own `border-bottom`:
  `header` measures **73px** = `.inner` `min-height` 72 + a 1px hairline, while
  `--site-header-height` is 72 by the TASK's own definition — "the two `min-height`
  values `SiteHeader.module.css .inner` already uses". So the pull-up is 1px short by
  construction. It is inside the DoD's ±1px and I did not touch the token.)

  *What misses — `height === window.innerHeight` (±1px):*

  | viewport | `.hero` height | `innerHeight` | over |
  |---|---|---|---|
  | 1280×800 | 800.00 | 800 | **0 — passes** |
  | 360×740 | 769.56 | 740 | +29.56 |
  | 1280×600 | 790.09 | 600 | +190.09 |

  *Mechanism.* `min-height: 100dvh` only sets a floor. Before §8 the `PageSection`
  padding (`tight` = 48px per side under 48em, 64px at and above it) sat **outside**
  `.hero`; §8 moved it **inside**, so it now counts toward the hero's intrinsic height.
  At 360×740 the sum is `64` (the pull-up's `padding-top`) `+ 48 + 609.56 + 48 =
  769.56` against a 740 floor. Nothing clips, nothing scrolls sideways, and the page
  scrolls vertically as it always did — the fold simply lands 29.56px inside the hero
  instead of on its edge.

  *Not taken, because each is yours:* dropping the hero's `PageSection` to a smaller
  density; making `.hero` absorb the section padding (needs a negative-margin trick or
  a new property `.hero` is forbidden to gain); or shortening the hero copy (a content
  change, and the copy is the owner's). If that DoD box meant "fills **at least** the
  viewport" rather than "exactly", it passes as shipped and can be ticked on your read
  — say which and I will tick it.

  > answer: **"At least the viewport" — the box is ticked, and it was the box's wording
  > that was wrong, not your build.** `min-height: 100dvh` is a floor; §1a asked for exactly
  > that rule and then I wrote the DoD as an equality against it. Three reasons the floor is
  > also the right rule, not merely the convenient one:
  >
  > **1. Equality is only reachable by making something worse.** With the copy the owner
  > actually has, 1280×600 needs 790px. "Exactly 100dvh" there means clipping the hero,
  > cutting the owner's copy (his, not ours), or shrinking a padding to fit one viewport
  > height — each a real regression bought with a tick. Growing past the fold clips nothing,
  > scrolls nothing sideways, and is what a `min-height` hero is for.
  >
  > **2. Your three rects already satisfy the corrected rule** at 800 / 740 / 600, and `top`
  > and `scrollWidth` pass everywhere. Nothing is re-run for this: I re-read your numbers
  > against the rules actually in `HomeHero.module.css` (`min-height: 100dvh`,
  > `align-content: center`, the two §1a lines verbatim) and the mechanism you gave is the
  > one in the file.
  >
  > **3. What I am NOT waving through.** Two consequences are look-questions, so they go to
  > the owner's eye as new **check 20** in TASK-005, not into a tick here: (i) at short
  > viewports the hero's CTAs sit below the fold (≈190px over at 1280×600); (ii) the 1px you
  > traced correctly — `header` measures 73px (72 `min-height` + a `border-bottom` that is
  > `1px solid transparent` at scroll 0, `SiteHeader.module.css` line 6), the token is 72, so
  > the pull-up is 1px short **by construction** and a 1px band of page ground shows above
  > the aurora at scroll 0 only. **Do not fix (ii) here.** Every fix is either a 1px literal
  > in `HomeHero.module.css` (forbidden by this TASK), a token that stops equalling
  > `SiteHeader.module.css .inner` `min-height` (breaks the invariant `globals.css`
  > documents), or an edit to a shell file TASK-003 closed. It is recorded in SPEC-001
  > §Token layer beside the other duplicated geometry.
  >
  > No change to §8, no retune, nothing to re-verify. TASK-004 is **DONE**.

## Review

**Verdict: DONE** — Sober, 2026-08-30. The §8 second pass, reviewed against SPEC-001
§Flow (Composition, amended 2026-08-30) and every DoD box.

**Verified by me in the repo, not read off the notes** (branch `develop`, uncommitted):

- `git status --porcelain` outside `partials/Home/` = **exactly five**, the five files §8
  names. Every one of those diffs is minimal and exactly as specified:
  `AuroraBackdrop.module.css` is 3 insertions / 3 deletions, all inside `.hero`
  (`55/62/24` → `48/52/22`), `.band` byte-identical; `GlassPanel` the single
  `list-style: none`; `PullQuote` the single `--site-quote-translation`; `theme.ts` the
  three CTA values plus the new name in **both** blocks; `globals.css` the one token pair.
  **No shared component file touched** — `PageSection.*`, `SiteShell.*`, `SiteHeader.*`,
  `SiteFooter.*` are all clean, which was the whole point of choosing the inversion.
- The inversion is real and matches the SPEC diagram: `HomeContent` renders `<HomeHero />`
  and `<HomeStatement />` bare, each *containing* its own `PageSection`. No `100vw`, no
  `calc(50% - 50vw)`, no `overflow-x: clip` anywhere in Home — the scrollbar trap never
  arises. `HomeStatement.module.css` is down to `.band` (position + surface) and `.inner`
  (position + z-index); border, radius and `overflow: hidden` are gone, per §Flow item 4.
- `HomeHero.module.css` carries the §1a lines verbatim (`margin-top: calc(-1 *
  var(--site-header-height)); padding-top: var(--site-header-height)`).
- Greps re-run by me inside `partials/Home/`: `"use client"` **0**, `#` in the CSS modules
  **0**, `gap: 1px` **0**, and no inline text node in any Home `.tsx`. `PullQuote` ids on
  Home are **`q4` and `q2` only** — R5 satisfied.
- Build re-run by me: `npx tsc --noEmit` exit **0**; `npm run build` exit **0**, 10/10
  static pages, **no warnings**, all seven route entries present.

**Accepted on Fern's evidence** (computed composites and live rects — no API in either
session returns real pixels, and the two models were built independently before they
agreed): the aurora ceiling (max **L 0.03883 → 4.86:1**, under 0.046 at 1280×800 /
360×740 / 1280×600, landing on my predicted 0.03873 to four decimals); the seams gone
(both auroras span `0 → clientWidth` at both widths; `scrollWidth === clientWidth`); the
re-sampled hero text table (worst `lead` **5.29:1** @360, every run ≥ 4.5:1); SA-OWN-1
(`rgb(11,9,22)` on `rgb(139,102,255)` **5.11:1**, hover **7.08:1** — `--button-color`
beats `autoContrast` on the render); SA-OWN-2 (translation `rgb(211,207,221)`, backdrop
max **L 0.02832** ≤ 0.1027).

**Two boxes stay unticked. Neither is waived — each has a named destination:**

1. **Reduced motion** — rules present and correctly targeted; the OS flag is not emulable
   in an agent session. Carried to **TASK-005 check 16**, unchanged.
2. **Below-the-fold appearance** — the browser pane paints one frame per navigation, so
   Stats / Capabilities / Statement were verified programmatically and never seen. That is
   the owner's eye, and TASK-005 is where it happens.

**FQ8 is answered above and nothing was reworked for it.** Its two look-consequences (CTAs
below the fold at short viewports; the 1px top band from the header's transparent hairline)
are now **TASK-005 check 20** and are recorded in SPEC-001 §Token layer. Fern reported the
deviation instead of hiding it and declined three fixes that were mine to take — that is
what this DoD is for.
