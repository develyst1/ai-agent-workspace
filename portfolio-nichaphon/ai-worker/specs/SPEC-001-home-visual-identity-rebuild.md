# SPEC-001: Home visual identity rebuild

- Source: REQ-001
- Status: ACTIVE
- Written: 2026-08-30 by Sober (SA)
- Repo: `portfolio-nichaphon-web`, everything under `front/` (path: workspace-root `machine.local.md`)

## Overview

REQ-001 asks for a rebuild of `/` in a new identity — dark ground, purple as the
identity colour, every recurring component pattern changed, no invented copy.

The approach is three-layered, and the layering is the point:

1. **Keep the token contract, replace the token values.** `theme/theme.ts` is
   already the single source of colour/type/space, and every component reads it
   through named CSS variables (`--mantine-color-body`, `--site-surface`,
   `--site-hairline`, `--site-cta-bg`, …). This SPEC changes the *values* behind
   those names and *adds* new ones. **No existing variable name is removed or
   renamed.** That is what keeps the other five routes legible after the palette
   flips (R8) instead of half-broken.
2. **Rebuild the component patterns, not just their colours** (R1). Named,
   listed, and enforced by a "retired patterns" list below — a recoloured
   version of today's hairline grid fails this SPEC.
3. **Rebuild `/` on top of those two layers.** Only Home's own partial changes
   structurally (R3/R6).

### Decision: the UI library does not change — Mantine 8.3.18 stays

REQ-001 Constraints put this call on the team (Q9), with R7 (clean build) binding.

- The "Claude-like" look comes from this repo's own token file and its own
  component patterns — a warm sand/rust palette, a serif display face, 1px
  hairline grids. None of that is Mantine's. Replacing the library would not
  change one pixel that swapping tokens and patterns does not already change.
- Mantine 9 is a known build failure on Next 15 (`Activity` / `useEffectEvent`
  not exported by Next 15's vendored React) — `front/README.md` §"Why Mantine 8
  and not 9". Going to Mantine 9 means upgrading Next first, which is a far
  larger change than REQ-001 asked for, on a live site.
- Swapping to a different library (Tailwind + headless, etc.) means rewriting all
  six routes' components to keep them compiling, i.e. dragging five out-of-scope
  routes into a Home-only REQ (R6).

**Therefore: no dependency version changes at all in this REQ.** R7 is satisfied
by construction — the only new build input is one extra `next/font/google` face,
which is the same mechanism the repo already uses three times.

### Decision: Home ships dark-only

`UIProvider` currently mounts `defaultColorScheme="auto"`. Under `auto` a visitor
whose OS is in light mode sees a light page — which directly contradicts R2
("dark-dominant"). A purple-on-white scheme is a second design that nobody asked
for and that the reference (R9) gives no guidance on, and an undesigned light
mode is a visible defect the moment the owner clicks the toggle at review.

So: `forceColorScheme="dark"` on `MantineProvider` **and** on `ColorSchemeScript`,
and `ColorSchemeToggle` is removed from the header. The component file stays in
`components/ui/ColorSchemeToggle/` untouched and exported — reinstating light mode
is a two-line revert, nothing is deleted. The `light` block of
`cssVariablesResolver` is kept and re-pointed at the new ramp so no variable is
ever undefined; it is **not** a designed scheme and is unreachable in this build.

This is a design-system decision inside SA's boundary, but it removes a control the
owner can see today — see `## Questions` → **SQ1**, raised to Porter as a decision
notice, not a blocker.

## Interface design — component contracts

### Unchanged public APIs (hard constraint)

`PageSection`, `SectionHeading`, `TechChip`, `ChipRow`, `ImageLightbox`,
`SiteShell` keep their **exact current props**. Their internals and CSS modules may
change freely; their signatures may not. Five out-of-scope routes import them and
must keep compiling and rendering (R8). Any prop change is an SA decision first.

### New shared primitives — `front/src/components/ui/`

| Component | Props | Purpose |
|---|---|---|
| `GlassPanel` | `{ children, as?: 'div' \| 'article' \| 'li', padding?: 'sm' \| 'md' \| 'lg', glow?: boolean, className? }` | The new surface pattern: translucent fill over the page ground, 1px light-edge border, large radius, optional purple edge-glow. Replaces the hairline-grid surface everywhere on Home. Server component. |
| `AuroraBackdrop` | `{ variant: 'hero' \| 'band' }` | The decorative purple/violet gradient bleed (R9). Renders one absolutely-positioned `aria-hidden="true"` layer of layered CSS radial-gradients. **No images, no `filter: blur()` on a full-bleed layer** (paint cost), no animation. Server component. |
| `PullQuote` | `{ id: string, size?: 'lead' \| 'band' }` | Renders one quote from `constant/content/quotes.ts` bilingually: Thai as the primary line in the body face, English beneath it as the translation, marked `lang="th"` / `lang="en"`. When a quote has no Thai (quote 4), it renders the English alone — it does **not** fall back, pad, or invent a pairing. Server component. |

All three export through the existing `components/ui/index.ts` barrel and follow
the repo's conventions (no `"use client"` — none of them has state or a handler).

### Retired patterns — must not appear anywhere on `/` (this is R1)

A reviewer will check for these by name:

- 1px hairline grids (`gap: 1px` + `background: var(--site-hairline)`) used as a
  card surface — `HomeHero.module.css .facts`, `HomeCapabilities.module.css .grid`.
- The uppercase-mono eyebrow (`SectionHeading .eyebrow`, `HomeHero .status`) as the
  section-label pattern.
- Serif display headings (Fraunces).
- The rust accent, in any form.
- 4px/8px card radii and flat 1px borders as the card language.
- `Button variant="default"` as the secondary action.

## Data model — content and types

No backend, no DB. The only content change is the quotes, which are the only new
copy REQ-001 supplies (R4/R5).

- **New type** in `front/src/types/app/content/index.ts`:
  ```ts
  export interface Quote {
    id: string;
    /** Thai original. Absent when the quote was given in English only. */
    th?: string;
    en: string;
  }
  ```
- **New file** `front/src/constant/content/quotes.ts` exporting `QUOTES: Quote[]`
  with all four quotes, ids `q1`–`q4` matching REQ-001 R5's numbering.
- **The strings are copied verbatim from `REQ-001` §Requirement R5 and from
  nowhere else.** Not from the log, not from this SPEC, not retyped from memory.
  R5 is the single source; if anything ever disagrees with R5, R5 wins.
  `q4` has no `th` — no Thai version exists and none is invented.
- Keeping all four in one content file with only two rendered on Home is
  deliberate: REQ-001 Q12 (quote re-wording) is open, and this shape makes a later
  wording swap a one-line edit in one file, touching no component.

**No other copy is added, rewritten or removed.** Everything else on the new Home
already exists: `SITE` (`constant/site.ts`), `HOME_LEAD`, `CAPABILITIES_*`
(`Home.config.ts`), `CAPABILITIES`, `CAREER_STATS` (`constant/content/about.ts`),
and the two existing CTA labels "View my work" / "Get in touch". If a section
turns out to need a label that has no existing string, **stop and ask** — that is a
DATA REQUEST via Sober → Porter (R4), never a placeholder.

Nothing from the reference screenshot's own content may appear: no `150+`, no
`12Years`, no filler paragraph, no other brand's name (R9).

## Token layer — `front/src/theme/theme.ts`

Two ramps replace `rust` / `sand` / `darkSand`. These hex values are the SPEC's;
adding a colour, or changing one, is an SA decision, not an implementation choice.

```ts
// Identity accent. Purple/violet — R2.
const iris: MantineColorsTuple = [
  '#f2eeff', '#e0d7ff', '#c3b2ff', '#a488ff', '#8b66ff',
  '#7a4fff', '#7040ff', '#5e32e0', '#5329c8', '#451faf',
];

// Neutrals: near-black carrying a violet tint, so ground and accent are related.
const obsidian: MantineColorsTuple = [
  '#eceaf2', '#d3cfdd', '#a9a3ba', '#7d7596', '#5a5175',
  '#443c5c', '#2c2640', '#1e1930', '#151122', '#0b0916',
];
```

- `primaryColor: 'iris'`; `colors: { iris, obsidian, gray: obsidian, dark: obsidian }`
  — overriding `gray` and `dark` is what stops Mantine's cool default neutrals
  leaking into inputs and borders. Note `dark` uses Mantine's inverted convention
  (index 0 = lightest); `obsidian` is already written that way.
- `primaryShade: { dark: 3 }` — `#a488ff` on the `#0b0916` ground clears AA for
  body-size text; shades 5–7 do not, and must not be used for text on the ground.
- `white: '#f5f3fb'`, `black: '#0b0916'`.
- `defaultRadius: 'lg'`; `radius: { xs: '4px', sm: '8px', md: '12px', lg: '20px', xl: '28px' }`
  — the radius scale itself moves, which is half of "the component patterns changed".
- `headings.fontFamily` → `var(--site-font-display)`; `headings.fontWeight: '700'`;
  `h1` grows to `clamp(3rem, 11vw, 8.5rem)` with `lineHeight: '0.92'` and
  a tracking of `-0.04em` — the oversized wordmark is the page's main visual
  event (R9). `h2` `clamp(2rem, 5vw, 3.5rem)`.
- **The h1 tracking is not a theme key** (amended 2026-08-30, TASK-001 §FQ1).
  Mantine 8.3.18's `HeadingStyle` is `{ fontSize, fontWeight?, lineHeight }` and
  generates no `--mantine-h1-letter-spacing`, so `-0.04em` is declared once,
  globally, as `h1 { letter-spacing: -0.04em }` in `globals.css` — beside
  `font-style` and `text-wrap`, the other heading properties the theme cannot
  hold. Size and line-height stay in the theme. It is **not** a per-component value:
  no CSS module may re-declare h1 tracking, and `HomeHero.module.css`'s existing
  `-0.025em` override on `.name` is deleted in TASK-004.
- Keep `autoContrast`, `focusRing: 'auto'`, `respectReducedMotion: true`, the 4pt
  `spacing` scale and the `other` block as they are.
- `components.Button`: keep the 44px minimum height; add `borderRadius: 999px` to
  the filled variant and route its colours through the `--site-cta-*` variables as
  today.

### CSS variables — `cssVariablesResolver`

Every existing name keeps existing. New values, dark block:

| Variable | Value | Note |
|---|---|---|
| `--mantine-color-body` | `obsidian[9]` `#0b0916` | the page ground |
| `--mantine-color-text` | `#eceaf2` | |
| `--mantine-color-dimmed` | `#a9a3ba` | AA on the ground at body size |
| `--mantine-color-default` / `-hover` | `#151122` / `#1e1930` | |
| `--mantine-color-default-border` | `#443c5c` | |
| `--mantine-color-anchor` | `iris[3]` `#a488ff` | |
| `--site-surface` | `#151122` | |
| `--site-hairline` | `#2c2640` | name kept: the five other routes read it |
| `--site-ink-faint` | `#7d7596` | non-text use only |
| `--site-accent-wash` | `rgba(164, 136, 255, 0.10)` | |
| `--site-control-border` | `#443c5c` | |
| `--site-cta-bg` | `iris[4]` `#8b66ff` | filled-CTA fill, at rest — **corrected, see SA-OWN-1** |
| `--site-cta-bg-hover` | `iris[3]` `#a488ff` | filled-CTA fill, hover |
| `--site-cta-fg` | `obsidian[9]` `#0b0916` | filled-CTA label — ink, not white |

> ✅ **SA-OWN-1 — RESOLVED 2026-08-30 by Sober. The CTA inverts: a brighter fill with
> an ink label.**
>
> *The defect.* TASK-001 shipped this SPEC's original numbers — `iris[5]` fill,
> `iris[4]` hover, `#f5f3fb` label — which measure **4.35:1** at rest and **3.51:1**
> on hover, under the 4.5:1 §Non-functional requires at body size. TASK-001 is
> correct and DONE; the wrong number was this SPEC's. Full pair table:
> `tasks/TASK-001-token-layer-fonts-dark-only.md` §Review.
>
> *The fix, and its measurements* (sRGB relative-luminance formula, computed not
> estimated):
>
> | pair | ratio | bar |
> |---|---|---|
> | label `#0b0916` on rest fill `#8b66ff` | **5.11:1** | 4.5 ✅ |
> | label `#0b0916` on hover fill `#a488ff` | **7.08:1** | 4.5 ✅ |
> | rest fill `#8b66ff` vs ground `#0b0916` | 5.11:1 | informational |
> | hover fill `#a488ff` vs ground `#0b0916` | 7.08:1 | informational |
>
> *Why this and not a darker fill.* The obvious alternative — keep the white label
> and darken the fill to `iris[7]` `#5e32e0` (6.35:1) — passes the text bar but
> costs the CTA its job: that fill sits at **2.83:1** against the `#0b0916` ground,
> so the pill nearly vanishes as a shape, and it lands *quieter* than the secondary
> action beside it (a plain `#a488ff` text link at 7.08:1 on the ground). Inverting
> the pair keeps the accent bright on a near-black page, which is what R2 asks of
> the identity colour, and moves the fill into the same shades 3–4 window this
> theme already declares usable (`primaryShade: { dark: 3 }`).
>
> *Why it is safe to implement.* `theme.ts` already routes the filled button through
> `--site-cta-*` via `components.Button.vars`, and Mantine 8.3.18 merges
> `theme.components.Button.vars` **after** the component's own `varsResolver`
> (`core/styles-api/use-styles/get-style/resolve-vars/resolve-vars.mjs` →
> `merge-vars.mjs`, verified in `node_modules` 2026-08-30), so the explicit
> `--button-color` wins over `autoContrast`. Only three values change; no variable
> name is added or removed and no code path moves. The rendered label colour is
> still **measured, not assumed** — TASK-004 DoD.
>
> *Scope limit, stated so it is not re-litigated.* §Non-functional adopts WCAG
> **1.4.3 text** contrast only. This SPEC does not adopt **1.4.11 non-text**
> contrast under REQ-001 — doing so mid-flight would also re-open `GlassPanel`'s
> `rgba(196, 178, 255, 0.18)` edge, shipped and reviewed in TASK-002. The pill's
> fill-vs-ground numbers above are recorded as information, not as a bar. If the
> owner ever asks for a 1.4.11 pass, that is a new REQ.

One new **static** token, added 2026-08-30 (TASK-003 §FQ5). It is not a colour and does
not belong in `cssVariablesResolver` — it goes in `globals.css` `:root` beside
`--site-z-header`:

| Variable | Value | Used by |
|---|---|---|
| `--site-header-height` | `64px`; `72px` at `min-width: 48em` | `HomeHero`’s pull-up (§Flow → Shell) |

The two numbers are the same two `SiteHeader.module.css .inner` already sets as its
`min-height`. They are duplicated deliberately (a CSS module cannot export a value to
`:root`), so the pair moves together or the hero pull-up drifts.

**Duplicated geometry — the standing list (answer to TASK-004 §FQ7, 2026-08-30;
item 3 added at §FQ8).** Three numbers now live in more than one file, and all
three are load-bearing:

1. `--site-header-height` `64/72px` ↔ `SiteHeader.module.css .inner` `min-height`. Move
   together or the hero pull-up drifts.
2. The section gutter `20/32px` ↔ `PageSection.module.css .inner`, `SiteHeader.module.css
   .inner`, `SiteFooter.module.css`. Three copies of one value.
3. **`--site-header-height` excludes the bar's own hairline (added 2026-08-30, TASK-004
   §FQ8).** `SiteHeader.module.css` gives the bar `border-bottom: 1px solid transparent`
   at rest, so the sticky header occupies **73px** (65px under 48em) while the token is
   72px (64px). The hero's pull-up is therefore 1px short **by construction**, and a 1px
   band of page ground shows above the aurora at scroll 0 only. **Left as-is under this
   REQ**, deliberately: a `+1px` in `HomeHero.module.css` is a one-off literal the design
   system forbids; changing the token breaks invariant (1) above, which `globals.css`
   documents in a comment; and moving the hairline to a pseudo-element edits a shell file
   TASK-003 closed and five out-of-scope routes render. Reported for the owner's eye as
   TASK-005 check 20(b). If it is judged visible, the fix is a SPEC decision — most
   likely making the border a `box-shadow` so it stops adding to the bar's box.

FQ7 asked about a further coupling — `--site-header-height` against `PageSection`'s density
padding. **That one is gone**, not documented: under the composition rule (§Flow) the hero
is no longer *inside* a `PageSection`, so the effective pull-up is exactly the header
height and no density literal enters the sum. (2) is real but is **not fixed under this
REQ**: publishing a `--site-gutter` token means editing two shell files TASK-003 already
closed and re-verifying five out-of-scope routes, to buy nothing REQ-001 asked for. It is a
follow-up, recorded here so the next REQ finds it.

New colour names to add (dark block; mirror them in `light` so nothing is undefined):

| Variable | Value | Used by |
|---|---|---|
| `--site-glass-bg` | `rgba(120, 96, 200, 0.10)` | `GlassPanel` fill |
| `--site-glass-border` | `rgba(196, 178, 255, 0.18)` | `GlassPanel` edge |
| `--site-glass-glow` | `0 0 40px rgba(122, 79, 255, 0.22)` | `GlassPanel glow` |
| `--site-aurora-1` | `#7040ff` | `AuroraBackdrop` |
| `--site-aurora-2` | `#3b2fb5` | `AuroraBackdrop` |
| `--site-aurora-3` | `#c3b2ff` | `AuroraBackdrop` highlight |

The three aurora **hex values do not change** and no aurora name is added. What changed
2026-08-30 (TASK-004 §FQ6) is the per-layer alpha the `.hero` variant mixes them at —
`48% / 52% / 22%`, down from `55% / 62% / 24%` — which lives in
`AuroraBackdrop.module.css`, not here. `.band` keeps `55% / 45% / 16%`. Reasoning and
measurements: §Flow → Shell, the amendment box.
| `--site-quote-translation` | `obsidian[1]` `#d3cfdd` | `PullQuote` translation line — **added by SA-OWN-2** (light block: `obsidian[4]`, unreachable, defined only so the name is never undefined) |

> ✅ **SA-OWN-2 — RESOLVED 2026-08-30 by Sober. The translation line gets its own
> token; `--mantine-color-dimmed` is not touched.**
>
> *The defect.* §Non-functional's contrast table was measured against the *ground*
> only. Over an `AuroraBackdrop` core the ground is no longer `#0b0916`: the
> composited upper bounds are `#4130a6` (band) and `#5739cc` (hero). Against those,
> `--mantine-color-dimmed` `#a9a3ba` — which `PullQuote` uses for its English
> translation line, correctly, per this SPEC — falls to **3.93:1** and **3.02:1**,
> under 4.5:1. (`--mantine-color-text` `#eceaf2` clears at 8.01:1 / 6.15:1, so the
> Thai primary line was never at risk.) The band translation computes ~22px at
> weight 400, so the ≥24px large-text exemption does not apply.
>
> *The fix.* One new variable, `--site-quote-translation: obsidian[1] #d3cfdd`, read
> by `PullQuote.module.css .translation` in place of `--mantine-color-dimmed`. No
> new hex enters the system — `#d3cfdd` is already `obsidian[1]`. Measured:
>
> | backdrop | ratio | bar |
> |---|---|---|
> | ground `#0b0916` | **12.90:1** | 4.5 ✅ |
> | band composite `#4130a6` | **6.25:1** | 4.5 ✅ |
> | hero composite `#5739cc` | **4.80:1** | 4.5 ✅ |
>
> *The binding constraint that comes with it — same equation as the header band.*
> `#d3cfdd` clears 4.5:1 only while the backdrop under it stays at or below relative
> luminance **0.1027**. The two composited bounds above are L 0.0599 (band) and
> L 0.0931 (hero), so the aurora as specified fits — with roughly 10% of headroom on
> the hero, which is not much. Therefore: **wherever a `PullQuote` sits over an
> `AuroraBackdrop`, the composited backdrop must measure ≤ L 0.1027.** That is now an
> acceptance check in TASK-004, sampled from the render, exactly like the ≤ L 0.046
> ceiling the header overlay carries. Raising an aurora alpha or stop is therefore a
> SPEC decision, not a styling tweak.
>
> *Why not the three candidates named when the defect was raised.*
> **(a) Lighten `--mantine-color-dimmed` itself** — rejected, and this is the
> important one: that token is read by the five out-of-scope routes and by the
> at-rest nav link, and the header-overlay ceiling of **L 0.046** recorded in
> TASK-003 §Review and binding in TASK-004 is derived *from* `#a9a3ba`. Moving it
> silently invalidates a DONE review and a live acceptance number, and a `dimmed`
> raised to `#d3cfdd` stops being dimmed anywhere on the site.
> **(b) Lower the aurora alphas** — rejected: the purple bleed is the one thing R9
> actually shows, and the bounds above are already upper bounds, so this pays the
> whole look for a defect that a token fixes.
> **(c) A scrim behind the quote** — rejected: a translucent panel behind the band
> quote is `GlassPanel` in all but name, and R1 wants the patterns distinct, not a
> second surface that reads like the first.
>
> *What actually exercises this on Home.* Only the **band** quote `q2`. `q4` has no
> `th`, so `PullQuote` renders its English through `.primary`
> (`--mantine-color-text` `#eceaf2`, 6.15:1 over the hero composite) and emits no
> translation line — verified in `constant/content/quotes.ts` and `PullQuote.tsx`,
> 2026-08-30. The token and its ceiling are still defined for the general case,
> because `q1` and `q3` are reserved for the later routes and both carry Thai.
>
> *Accepted cost, named.* `#d3cfdd` sits only 1.28:1 from the primary line's
> `#eceaf2`, so the translation is no longer separated by luminance. It stays clearly
> secondary by size and weight — `PullQuote.module.css` already sets the translation
> at `max(0.9375rem, 0.55em)` and weight 400 against the primary's `1em` / 500 — and
> that hierarchy is the one that survives a contrast fix. No further change to
> `PullQuote` is authorised to compensate.

### Fonts — `front/src/app/layout.tsx` + `globals.css`

- **Display:** `Fraunces` → **`Space_Grotesk`** from `next/font/google`, bound to
  `--font-display`, subset `latin`, `display: 'swap'`. Geometric and wide-ish; it
  is the face that carries the oversized wordmark, and it is categorically not the
  serif that reads as Claude.
- **Body:** `IBM_Plex_Sans_Thai` **stays, and this is not optional** — it is the
  only face in the app that covers Thai, and the quotes are Thai (R5).
- **Mono:** `JetBrains_Mono` stays, but its use narrows to numerals only
  (`CAREER_STATS` values). The uppercase-mono micro-label pattern is retired.
- `globals.css`: `--site-font-display` fallback stack becomes a sans stack
  (`'Segoe UI', system-ui, sans-serif`), not the current serif one. Heading
  `font-style: normal`, `text-wrap: balance`, the focus-ring rule and the skip-link
  rule are unchanged (the new `h1` letter-spacing rule above is the one addition);
  the focus ring picks up the new `--mantine-color-anchor` automatically.

## Flow — the new `/`

`app/page.tsx` is unchanged (it delegates to `HomeContent`). `HomeContent`
re-composes into four sections, in this order. All four keep the site-wide
max-width and gutters, but they do not all get them the same way — see the
composition rule immediately below, amended 2026-08-30 at TASK-004 §FQ6.

**Composition — amended 2026-08-30 (TASK-004 §FQ6). Two of the four sections
*contain* a `PageSection` instead of being contained by one.**

This SPEC originally said all four sections sit inside `PageSection`. That is
wrong for the two that bleed: `PageSection` caps its child at `--site-max-width`
and pads it, so a decorative layer parented inside it is boxed to 1120px with
visible seams, and a hero inside it can never reach the viewport top. Fern
measured both (TASK-004 §FQ6). The fix keeps every shared file untouched and
inverts the nesting for those two only:

```
HomeContent
  <HomeHero />                                    ← no wrapper; owns its own bleed
  <PageSection density="regular">        <HomeStats />        </PageSection>
  <PageSection density="regular" bordered labelledBy="capabilities-heading">
                                         <HomeCapabilities /> </PageSection>
  <HomeStatement />                               ← no wrapper; owns its own bleed

HomeHero      = <div .hero>      <AuroraBackdrop hero/> <PageSection density="tight">   …content… </PageSection> </div>
HomeStatement = <div .band>      <AuroraBackdrop band/> <PageSection density="regular"> …quote…   </PageSection> </div>
```

- The bleeding wrapper is a direct child of `<main>`, which is already full
  width, so **no `100vw`, no `50% - 50vw`, no `overflow-x: clip`** — the
  scrollbar-overflow trap Fern named never arises.
- Measure and gutters still come from `PageSection`, from the same file as the
  other four routes. Nothing is duplicated and no literal is re-typed.
- `PageSection`'s props, file and CSS module are **not** touched. Neither is
  `SiteShell`, `SiteHeader` or `SiteFooter`. Its `<section>` is used here as a
  layout container with no accessible name, which is what it already is on the
  unheaded Stats band.
- Content inside the bleeding wrapper needs `position: relative; z-index: 1` on
  its own element (a positioned `z-index: 0` aurora otherwise paints over the
  text of a non-positioned sibling). `HomeHero .content` already does this;
  `HomeStatement` keeps a one-purpose `.inner` inside the `PageSection` for it.

1. **Hero** (`HomeHero`) — `AuroraBackdrop variant="hero"` behind it.
   `SITE.name` set as the oversized display wordmark (h1), `SITE.nickname` and
   `SITE.role` as the supporting line, `SITE.availability` as a small live marker
   (new shape — not the old mono-uppercase pill), `HOME_LEAD` as the paragraph, and
   the two CTAs: primary = filled purple pill ("View my work" → `/portfolio`),
   secondary = plain underlined text link with a trailing arrow ("Get in touch" →
   `/contact`, minimum 44px touch target). `PullQuote id="q4" size="lead"` sits
   with the CTAs as the hero's closing declarative line.
2. **Stats** (`HomeStats`, new file) — `CAREER_STATS` as a row of `GlassPanel`
   cards, numerals in the mono face, `tabular-nums`. Unheaded on purpose: there is
   no existing heading string for it and none is invented (R4). Keeps the `<dl>` /
   `<dd>` / `<dt>` semantics the current markup already has.
3. **Capabilities** (`HomeCapabilities`, rebuilt) — same `SectionHeading` props and
   the same `CAPABILITIES_*` copy, rendered in the new pattern: large numbered rows
   inside a single `GlassPanel glow`, separated by spacing rather than by hairlines,
   with a purple edge-light on hover/focus-within. The old 2×2 hairline grid is gone.
4. **Statement band** (`HomeStatement`, new file) — full-bleed deeper band with
   `AuroraBackdrop variant="band"`, carrying `PullQuote id="q2" size="band"`
   bilingually (Thai primary, English translation beneath). *"Full-bleed" is
   literal and now reachable (composition rule above): the band spans the
   viewport edge to edge, keeps `background-color: var(--site-surface)` as its
   deeper ground, and therefore carries **no border and no border-radius** — a
   bleeding band has no edge to draw. The inset rounded panel Fern shipped as a
   stop-gap is superseded, not adopted.*

Quotes on Home: **q4 and q2 only.** q1 and q3 are deliberately reserved for the
later routes — R5 forbids all four on one page, and the acceptance criteria require
at least one and not all four.

### Shell (applies to all six routes — R1 names header and footer)

- `SiteHeader`: thin and transparent over the hero, gaining a subtle ground and a
  hairline only after scroll if that costs no `"use client"` beyond the one it
  already has; wordmark set in the new display face; nav links minimal with a
  purple dot/underline active marker instead of the current treatment;
  `ColorSchemeToggle` removed from the header (see the dark-only decision);
  `Burger` + `Drawer` behaviour and all `aria-*` unchanged.
- `SiteFooter`: restyled onto the dark ground. Structure, links and copy unchanged.

**Decided 2026-08-30 at TASK-003 review (FQ5) — how the bar comes to sit *over* the hero.**
The header keeps `position: sticky` and `SiteShell.module.css` is **not** touched. Making
the shell overlay its content (`position: fixed`, or a negative `margin-top` on `.main`)
would pull the first section of all five out-of-scope routes up under the bar and make each
of them need a compensating pad — a Home-only look paid for with a site-wide regression.
Instead **Home rises under the bar**: `HomeHero` takes
`margin-top: calc(-1 * var(--site-header-height))` and `padding-top:
var(--site-header-height)`. Only Home files change; the sticky bar, being later in the
stacking order with `z-index: var(--site-z-header)`, paints above it.

This needs one new token, `--site-header-height` (below), and it carries one **binding
constraint**: at rest the bar is fully transparent, so its text sits on whatever is behind
it. The at-rest nav link is `--mantine-color-dimmed` `#a9a3ba`, which measures **3.82:1**
over `--site-aurora-2`, **2.23:1** over `--site-aurora-1` and **1.29:1** over
`--site-aurora-3` — all below the 4.5:1 this SPEC requires. The composited backdrop must
therefore stay at or under relative luminance **0.046**, the ceiling at which `#a9a3ba`
still clears 4.5:1.

> **Amended 2026-08-30 (TASK-004 §FQ6) — the ceiling is now a property of the hero
> aurora, not a rule about where its cores sit.**
>
> The original wording allowed the overlay "only while the hero aurora's bright cores sit
> below the header band". Once the hero actually reaches the viewport top (composition rule
> above), that dodge stops working: its peak is layer 1's own core, which lands at 10% of
> the hero height — inside the 72px band on any viewport shorter than ~720px, and only just
> below it on taller ones. Fern measured **L 0.04667** (800px tall) and **L 0.04834**
> (700px); Sober reproduced both to three decimals independently. Relocating the core does
> not remove the problem, it moves it: pushed far enough down to clear the band, the same
> peak lands in the hero's own text column and takes `role` / `lead` (both `dimmed`) to
> ~4.4:1.
>
> **So the peak comes down instead of moving.** `AuroraBackdrop.module.css` `.hero` layer
> alphas go `55% / 62% / 24%` → **`48% / 52% / 22%`**. Computed peak of the composited hero
> aurora, anywhere in the layer, at every viewport from 360×600 to 1920×1000:
> **L 0.03873** → `#a9a3ba` clears at **4.87:1**. `.band` is not touched (its quote already
> clears at 6.25:1 and no transparent bar sits over it).
>
> **The constraint restated, and it is now one line:** *no point of the composited hero
> aurora may exceed relative luminance 0.046.* That single rule subsumes the header band and
> every `dimmed` text run in the hero, and it is checkable with one scan instead of one per
> text run. TASK-004 carries it as an acceptance criterion.
>
> *This reverses SA-OWN-2's rejection (b) — "lower the aurora alphas" — for the `hero`
> variant only, and the reversal is stated rather than quietly taken.* That rejection held
> because a new token fixed the quote defect for free, so paying the look bought nothing.
> Here nothing is free: the alternatives are a boxed 1056px aurora with visible seams
> (fails R9's bleed), a hero that never fills the viewport, or restyling the shell's nav
> links site-wide (a Home problem paid for on five out-of-scope routes, and it costs the
> inactive/active colour step the header deliberately has). Against those, ~13% off three
> alphas is the cheapest thing in the room — and the same change makes the hero aurora
> **larger**, not smaller: it goes from a 1056px-wide box to the full viewport, so the net
> purple on screen increases.
>
> *Honesty about the measurement.* Fern's sampler and Sober's check are both **computed**
> composites — the gradients' own geometry, stops and premultiplied alpha applied to the
> real values read from the page. Neither is a pixel readback, and they can share a
> modelling error, so their agreement is corroboration and not proof. The ~16% headroom
> under the ceiling is deliberate for that reason. If a real readback ever contradicts them,
> the readback wins.

If the wanted look needs a bright core in that band, it is a stop-and-ask, and the fallback
is deleting the two pull-up lines above — which returns `/` to the non-overlapping bar
TASK-003 shipped.

### Edge cases

- **Reduced motion.** The one entrance animation on the hero keeps its
  `prefers-reduced-motion: reduce` opt-out. `AuroraBackdrop` is static, so it needs
  no opt-out — and must not gain one by acquiring an animation.
- **Long Thai lines.** Thai does not break on spaces. `PullQuote` must not set
  `white-space: nowrap`, must cap its measure (`max-width` in `ch`), and must be
  checked at 360px width for overflow.
- **Straight quote marks.** Quotes 2 and 3 contain `"` characters that are part of
  the owner's string. `PullQuote` must not add typographic quote marks of its own
  around a quote, or the nesting reads as an error.
- **No-JS / first paint.** `ColorSchemeScript` stays in `<head>` with
  `mantineHtmlProps` on `<html>` (repo gotcha) — now with `forceColorScheme="dark"`,
  so there is no flash of a light ground.
- **Server components.** No new `"use client"` boundary is introduced. Every new
  component listed here is static.

## Non-functional

- **Build (R7):** `npm run build` completes with no errors and no new warnings;
  `npm run dev` serves `/` with an empty browser console. **No dependency
  add/remove/upgrade in this REQ** — `package.json` is not edited.
- **Contrast:** every text/background pair on `/` clears WCAG AA **1.4.3** (4.5:1
  body, 3:1 for text ≥24px bold). `--site-ink-faint` and `iris` shades 5–9 are
  decorative on the dark ground and must not carry body text. **The background of a
  pair is the composited backdrop, not the page ground** — text over an
  `AuroraBackdrop` is measured against what actually paints behind it (this is what
  SA-OWN-2 got wrong). Two backdrop-luminance ceilings follow from that and are
  binding, both sampled from the render in TASK-004:
  **≤ L 0.046** anywhere in the composited **hero** aurora — which covers both the
  at-rest header band and every `#a9a3ba` run inside the hero (widened 2026-08-30,
  TASK-004 §FQ6; it used to name the header band only) — and
  **≤ L 0.1027** under any `PullQuote` (`#d3cfdd` translation line).
  WCAG **1.4.11 non-text** contrast is *not* adopted under this REQ — see SA-OWN-1.
- **Accessibility unchanged or better:** skip link, `aria-labelledby` on sections,
  `aria-current` on the active nav link, 44px minimum control size, visible
  `:focus-visible` ring on every interactive element including the new text-link
  CTA. `AuroraBackdrop` is `aria-hidden="true"` and never receives focus.
- **Performance:** gradients only — no new images, no webfont beyond the one swap,
  no large `filter: blur()` layer. *Clarified 2026-08-30 at TASK-003 review (FQ4): the
  prohibition is on blurring a **full-bleed** layer such as `AuroraBackdrop`, which
  repaints the viewport every frame. A `backdrop-filter` on the header bar is permitted
  and is the intended way to keep it legible once content scrolls under it — bounded to:
  the header only, only under `[data-scrolled]`, blur ≤ 12px, and an `@supports not
  (backdrop-filter: …)` fallback to the opaque ground.*
- **Regression (R8):** all six routes still build and render; every nav link still
  reaches its route; the contact form still submits as it does today.
- No tests exist in this repo and none are added under this REQ — verification is
  the build plus the explicit manual checklist in TASK-005.

## Tasks

Cut 2026-08-30. All five are owned by Fern (FE) and are strictly sequential except
that TASK-002 and TASK-003 may run in either order once TASK-001 lands.

- `tasks/TASK-001-token-layer-fonts-dark-only.md` — token layer + fonts + dark-only
  mount: `theme/theme.ts`, `app/globals.css`, `app/layout.tsx`,
  `providers/UIProvider.tsx` (depends on: —)
- `tasks/TASK-002-shared-primitives-and-quotes.md` — `ui/GlassPanel`,
  `ui/AuroraBackdrop`, `ui/PullQuote`, `types/app/content`,
  `constant/content/quotes.ts` (depends on: TASK-001)
- `tasks/TASK-003-shell-rebuild.md` — `SiteHeader`, `SiteFooter`, **and
  `ui/SectionHeading/SectionHeading.module.css`** (depends on: TASK-001)
- `tasks/TASK-004-home-rebuild.md` — `HomeContent`, `HomeHero`, `HomeStats`,
  `HomeCapabilities`, `HomeStatement` + their CSS modules (depends on: TASK-002,
  TASK-003)
- `tasks/TASK-005-acceptance-sweep.md` — build, dev-console, contrast,
  retired-pattern check, all six routes reachable, quote strings diffed
  character-for-character against REQ-001 R5 (depends on: TASK-004)

**Allocation of the two token corrections (SA call, 2026-08-30).** SA-OWN-1 and
SA-OWN-2 change values inside files that TASK-001 and TASK-002 already delivered
(`theme/theme.ts`, `ui/PullQuote/PullQuote.module.css`). Those two tasks are **not
reopened** — they built what the SPEC said at the time and their reviews stand. The
corrections are carried as **TASK-004 §0**, which is why TASK-004's file scope and its
`git status` DoD item name those two files. That keeps one correction in one task
rather than re-litigating two closed reviews.

**Allocation made at cutting time (SA call, no scope change):** the retired
uppercase-mono eyebrow is rendered by the shared `SectionHeading`, which the planned
split named nowhere. Its **module CSS** is therefore restyled in TASK-003, next to
the other shared-shell work. Its **props are unchanged** and the `eyebrow` prop is
not removed — **fourteen** call sites pass it (thirteen on the five out-of-scope routes:
About 6, Services 2, Contact 3, Portfolio 1, Blog 1, plus `HomeCapabilities` on Home) and
every one must keep rendering its label (R8). *Corrected 2026-08-30 at TASK-003 review
(FQ3) — this line said "nine", which was wrong; the count was verified against the
prerendered HTML of all six routes.* Retiring the *pattern* is not removing the *prop*.

## Questions

### To Porter — decision notices, neither blocks the build

- **SQ1 — Home ships dark-only; the light/dark toggle leaves the header.**
  Rationale under "Decision: Home ships dark-only". This is an SA design-system
  call, not a scope change, and it is a two-line revert — but it removes a control
  the owner can see on the live site today, so he should hear it from you rather
  than discover it at review. If he wants light mode kept, that is a designed
  second scheme and a change to this SPEC, not a toggle we can just re-enable.
  > answer: **CLOSED 2026-08-30 — the owner said `เอาออก` (take it out).** Relayed by
  > Porter, who folded it into REQ-001 **R10** + **Q13**, so dark-only is now the
  > owner's stated requirement rather than an SA call he never saw. Nothing in this
  > SPEC or in TASK-003 changes — TASK-003 already removes the toggle and keeps the
  > component file exported. Scope limit recorded in Q13: his answer covers Home
  > only and says nothing about the other five routes.
- **SQ2 — the UI library is not changing; Mantine 8.3.18 stays, and no dependency
  version moves at all.** REQ-001 Constraints (Q9) put the choice on the team and
  say the owner is told what was chosen when Home is handed over. Rationale under
  "Decision: the UI library does not change". Reason it matters to him: it is the
  option with zero R7 risk, and the visual change does not depend on it.
  > answer: **Told, not asked — closed 2026-08-30.** Porter relayed it to the owner as
  > FYI; REQ-001 Constraints (Q9) already put the choice on the team, so no agreement
  > was sought and none is recorded as given. Mantine 8.3.18 stays.
- **SQ3 — REQ-001 Q12 (quote re-wording) costs nothing to leave open.** Under this
  SPEC all four strings live in one content file and no component holds a string,
  so whatever he decides is a one-line edit in `constant/content/quotes.ts`. No
  need to chase him for Home's sake.
  > answer: **Moot — closed 2026-08-30.** The owner closed REQ-001 Q12 with
  > `แค่วรรคตอนพอ`: punctuation-only was the right scope, **no quote is re-worded**,
  > and R5's Thai is FINAL. Nobody re-diffs R5, and no confirmation of the Thai is
  > outstanding at the Home review — only his check of Porter's English translations.

### From Fern

(Fern asks here; Sober answers as `> answer: ...`)
