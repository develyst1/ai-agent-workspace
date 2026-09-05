# TASK-007: Shared step-up devices — machine ground, route aurora, node edge, RouteHero

- Source: SPEC-002 (§"What the step-up is, concretely", §"Interface design", §"Edge cases")
- Status: **DONE** 2026-09-02 (Sober) — reviewed against the FQ24 gate; the three CSS
  edits, the palette colour, the aurora's paint order and `tsc` re-verified in the repo
  by me; browser numbers accepted on Fern's evidence. Two DoD boxes stay unticked on
  purpose (FQ21 → TASK-008, FQ23 → QA via SQ8) and DONE does not tick them. See §Review.
- Previous status: **REVIEW** 2026-09-02 (Fern). **Third pass PASSED your gate, so it did not
  come back to you.** Your three CSS edits applied verbatim; D1's contribution to all
  three aurora blocks measures **exactly zero** at 1217×800, 1280×800 and 360×740, and
  every reading is ≤ 0.046 (worst 0.04116, the band). The hero is back to TASK-004's
  0.03883, as you predicted. Occlusion also confirmed in a **real render** (opaque-red
  lattice A/B), not only in the sampler. R6 budget met exactly: one added element +
  one changed property. Two DoD boxes stay unticked on purpose — `/about` semantics
  (the pre-existing `H2→H4` skip you routed to TASK-008) and reduced motion (FQ23,
  not emulable) — see §Implementation Notes §Third pass.
- Depends on: **TASK-006** (all four devices read tokens declared there)
- Owner: Fern (FE)
- Written: 2026-09-02 by Sober (SA)
- Repo: `portfolio-nichaphon-web`, everything under `front/` (path: workspace-root `machine.local.md`)

## Why this task exists, in one paragraph

TASK-006 declared the tokens. This task builds the four shared devices that
actually carry the AI / robotic / IoT reading — a machine ground, a route aurora,
a circuit edge and the shared route opening block — so that TASK-008/009/010 are
each *only* "swap this route's partials onto devices that already exist and are
already measured". Every device here is **additive**: Home's current markup keeps
rendering exactly as it does today, and the one route this task touches
(About's opening block) keeps every string and every heading level it has now.

## What to do

### 1. `MachineGround` — D1, the machine ground

New shared primitive: `front/src/components/ui/MachineGround/` with
`MachineGround.tsx`, `MachineGround.module.css`, `index.ts`, exported from
`components/ui/index.ts` alongside the others. **Server component — no
`"use client"`.** No props.

What it renders: one `aria-hidden="true"`, `pointer-events: none`,
`position: fixed`, `inset: 0` element carrying a repeating-linear-gradient
lattice — 1px lines on a `--site-grid-size-fine` (16px) minor and
`--site-grid-size` (64px) major rhythm, stroked in `--site-grid-line`. No image,
no blur, no animation, no `background-attachment` trick.

**Mount it once**, as the first child of `.shell` in
`components/layout/SiteShell/SiteShell.tsx` — above the skip link in source
order is fine; it is out of flow either way. One fixed element for the whole
document, **not** one per section: a per-section version multiplies paint area
for no visual gain (SPEC-002 §Edge cases).

> **Correction to SPEC-002, made by Sober 2026-09-02 — use this, not the SPEC's
> original line.** SPEC-002 §Interface design said `z-index: 0`. That is wrong
> and would have put the lattice **on top of the page**: in CSS painting order a
> *positioned* element with `z-index: 0` paints in step 8, above the in-flow
> content of non-positioned block-level descendants (step 4). The layer must be
> **`z-index: -1`**. `.shell` sets no `z-index`, `transform`, `filter` or
> `opacity`, so it creates no stacking context and a negative-z child paints
> below the page content but still above the canvas background that `body`
> propagates — which is exactly where the ground belongs. SPEC-002 has been
> amended to match. **Do not "fix" this back to 0, and do not give `.shell` a
> `z-index` to compensate** — that would create the new stacking layer the SPEC
> forbids. If the lattice is invisible after this, it is an alpha or a rhythm
> problem, not a stacking one: stop and ask.

The header (`--site-z-header: 100`) and skip link (`--site-z-skip-link: 200`)
keep their layers untouched. No new stacking layer is introduced.

### 2. `AuroraBackdrop` — D2, the `route` variant

`front/src/components/ui/AuroraBackdrop/`. Additive only:

- The prop union becomes `'hero' | 'band' | 'route'`.
- `VARIANT_CLASS` gains a `route` entry.
- A new `.route` class in the module. **`.hero` and `.band` CSS is not touched** —
  they are what REQ-001 accepted and R6 protects.

Design intent for `route`: **a quieter opening than `hero`.** It sits behind a
route's first block, which is much shorter than Home's full-viewport hero, so the
same alphas would read as a heavier wash on less area. Two radial gradients
rather than three (`--site-aurora-1` and `--site-aurora-2`), weighted toward the
top of the box, no third highlight. Starting alphas ≈ **34% / 30%** of the
`hero`'s mixing — but the number that decides is the measured luminance below,
not this suggestion.

### 3. `GlassPanel` — D3, the circuit edge

`front/src/components/ui/GlassPanel/`. Add **one optional prop**:

```
tone?: 'plain' | 'node'   // default 'plain'
```

`'plain'` must render **exactly today's class list** — that is what keeps
`HomeCapabilities` and `HomeStats` unchanged. Everything else about the
component's public API stays as it is (`children`, `as`, `padding`, `glow`,
`className`).

`'node'` adds: 1px corner brackets in `--site-node-edge` (two `::before` /
`::after` pseudo-elements — no extra DOM node, no new child element) plus a small
dot in `--site-node-dot`. Board-trace / device-node reading, static.

**One trap to get right:** `.panel` today has no `position`. Pseudo-element
brackets need a positioned box, so put `position: relative` **on the `.node`
class only** — adding it to `.panel` would change the stacking behaviour of
Home's two existing panels for no reason.

### 4. `RouteHero` — D2 + D5, the five routes' shared opening block

New shared primitive: `front/src/components/ui/RouteHero/` with
`RouteHero.tsx`, `RouteHero.module.css`, `index.ts`, exported from
`components/ui/index.ts`. **Server component — no `"use client"`.**

```
{ eyebrow?: string; title: string; lead?: string; children?: ReactNode }
```

It renders: a `position: relative` wrapper containing
`<AuroraBackdrop variant="route" />` and a `PageSection density="tight"` whose
content sits at `z-index: 1` (the same contract `HomeHero` uses — the aurora
fills its positioned parent and content must be lifted above it), holding a
`SectionHeading order={1}` fed the props, then `children`.

**It renders no string of its own.** Every word comes from the caller, which
passes the route's existing `*_INTRO` object. A `RouteHero` with a literal string
inside it fails review (R4).

**Motion (D5) — the only motion this SPEC adds.** Reuse Home's entrance exactly:
`fade + 12px rise`, `520ms cubic-bezier(0.2, 0.7, 0.3, 1)`, and the
`@media (prefers-reduced-motion: reduce) { animation: none }` opt-out. Copy the
values from `HomeHero.module.css` `.enter` / `@keyframes rise`; do **not** invent
a second easing or duration, and do **not** refactor `HomeHero` to share the
keyframes (that is a change to an accepted file for no user-visible gain).

### 5. Pilot mount — About's opening block only

So that D2 and D5 are actually rendered and measurable in this task, mount
`RouteHero` on exactly one route: in
`components/partials/About/AboutContent.tsx`, replace the **first block only** —

```
<PageSection density="tight">
  <SectionHeading eyebrow={ABOUT_INTRO.eyebrow} title={ABOUT_INTRO.title}
                  lead={ABOUT_INTRO.lead} order={1} />
</PageSection>
```

— with the equivalent `RouteHero` call fed the same three `ABOUT_INTRO` fields.
Same strings, same `order={1}`, same `density="tight"`, so the page's heading
outline and its copy are unchanged.

**Nothing else in About is touched by this task.** Experience, Skills, Values,
Certificates, Testimonials and q3 are all **TASK-008**. If you find yourself
opening `AboutExperience.tsx`, you have left this task.

## Non-goals

- **D4 (machine numerals) is not in this task.** `.site-numeric` already exists
  in `globals.css`; applying it to Services' existing `step.step` values is
  TASK-008.
- **No ordinals.** Do not add `01` / `02` (or any other position-derived numeral)
  to any card. A rendered numeral is user-visible text and R4 is absolute; it is
  open with Porter as SPEC-002 **SQ2** and is designed **out** until he answers.
- No other route is converted. Services, Portfolio, Blog, Contact stay exactly as
  they are until TASK-008/009/010.
- No looping or continuous animation anywhere; no full-bleed `filter: blur()`;
  no new dependency; no image asset; no new `"use client"` file.
- No string added, altered, removed or translated.
- No git, no deploy, no `pm2`, no touching anything outside `front/`.

## Definition of Done

Tick a box only when you have *run* the check and can quote its output.

- [x] `cd front && npm run build` completes with **no errors and no new warnings**.
- [x] `cd front && npm run dev` — all six routes load with an **empty browser
      console**, and every nav link reaches its route.
- [x] **The ≤ L 0.046 backdrop ceiling holds, measured not estimated.** The
      header bar is transparent at rest on *every* route
      (`SiteHeader.tsx`, `window.scrollY > 8`) and its at-rest link colour is
      `--mantine-color-dimmed` `#a9a3ba`, so: **no point of the composited
      backdrop — D1's lattice and the `route` aurora together, over the body
      ground — may exceed relative luminance 0.046.** Scan the whole `RouteHero`
      box (not just its top strip) at **1280×800 and 360×740 at minimum**, on
      `/about`, and report the single highest sampled luminance with the
      `#a9a3ba` ratio it implies. Use the same composite sampler and the same
      honest statement of method as TASK-004 §"the two bleeding layers". **Above
      0.046 is a stop-and-ask — do not retune an alpha, a stop or a gradient
      centre to land it.**
- [x] **Home is unchanged.** `/` at 1280×800 and 360×740: hero, capabilities,
      stats and statement render as they do today, apart from D1's ground behind
      them. State explicitly what you compared against. Re-measure the **hero
      aurora** ceiling with D1 now composited underneath and quote the number —
      TASK-004 measured max **L 0.03883 → 4.86:1** with ~16% headroom; say
      whether D1 ate any of it.
- [x] **`GlassPanel tone="plain"` renders today's class list byte-for-byte.**
      Read back `className` on Home's two existing panels (`HomeCapabilities`,
      `HomeStats`) in the running page and quote both strings.
- [x] **The ground is behind, not in front.** On `/` and `/about`, at scroll 0
      and mid-page: body text, buttons and links are fully legible and clickable
      over the lattice; `document.elementFromPoint()` on a nav link and on a body
      paragraph returns the link/paragraph, **not** the ground element. Quote both.
- [x] The ground layer is `aria-hidden="true"`, has `pointer-events: none`, and
      does not appear in the accessibility tree or the tab order.
- [ ] **Semantics preserved on `/about`:** exactly one `<h1>`, it is
      `ABOUT_INTRO.title`, heading order is unbroken, and the skip link still
      lands on `#main`. Quote the heading outline.
- [ ] **Reduced motion:** with `prefers-reduced-motion: reduce` emulated, the
      `RouteHero` entrance does not animate, and D1/D2/D3 have no animation at
      all (`getComputedStyle(...).animationName === 'none'` on the ground and the
      aurora). Quote the checks.
- [x] **No string changed:** `git diff` over `AboutContent.tsx` shows only the
      block swap, with `ABOUT_INTRO.eyebrow` / `.title` / `.lead` still the only
      sources of copy. Read-only `git diff` — no `add`, `commit`, `push` or
      branch; git writes are the human's alone.
- [x] Grep the new files for `#` hex literals and for `gap: 1px` → **no hits**.
      Every value reads a token.
- [x] Grep `src/components/ui/` for `"use client"` → the result is unchanged from
      before this task (i.e. the two new components did not add one).
- [x] At 360px on `/about` and `/`: no horizontal scrollbar
      (`document.scrollWidth === document.clientWidth`), no clipped Thai line.

## Implementation Notes

Filled by Fern 2026-09-02. Branch `develop`, **no git write**, no deploy, no
`package.json` change, nothing touched outside `front/`. Dev server on **port
3010** (3000 is held by a foreign process), stopped after the run;
`front/.next` deleted afterwards, so the repo is left without a build output.

**Three DoD boxes are deliberately left unticked** — see FQ19, FQ20, FQ21 in
§Questions. **FQ19 is a stop-and-ask and the reason this TASK is BLOCKED, not
REVIEW.**

### Files — 2 added directories, 7 modified

Added (both **server components**, no `"use client"`):

- `front/src/components/ui/MachineGround/` — `MachineGround.tsx`,
  `MachineGround.module.css`, `index.ts`
- `front/src/components/ui/RouteHero/` — `RouteHero.tsx`,
  `RouteHero.module.css`, `index.ts`

Modified:

- `ui/index.ts` — two exports added, list kept alphabetical
- `ui/AuroraBackdrop/AuroraBackdrop.tsx` — union widened to `'hero' | 'band' | 'route'`, `VARIANT_CLASS.route` added
- `ui/AuroraBackdrop/AuroraBackdrop.module.css` — `.route` appended; `.hero` / `.band` **not touched** (R6)
- `ui/GlassPanel/GlassPanel.tsx` — one optional `tone?: 'plain' | 'node'`, default `'plain'`
- `ui/GlassPanel/GlassPanel.module.css` — `.node` appended; `.panel` **not touched**, so it still has no `position`
- `layout/SiteShell/SiteShell.tsx` — `<MachineGround />` as first child of `.shell`, +2 lines
- `partials/About/AboutContent.tsx` — the opening block only; the other five `PageSection`s untouched

`git diff --stat` over my seven files: **85 insertions, 12 deletions**.
`theme.ts` and `TechChip.module.css` still carry **only** TASK-006's changes —
I did not touch them.

### One deviation from the TASK's letter, stated up front

`RouteHero.tsx` imports `PageSection` **deep** (`@/components/common/PageSection`)
instead of through the `@/components/common` barrel. Reason, not preference:
that barrel exports `ChipRow`, which imports the `@/components/ui` barrel that
`RouteHero` is itself exported from — the barrel import would close an
`ui/index -> RouteHero -> common/index -> ChipRow -> ui/index` cycle. Comment in
the file says so. No behaviour change; say the word if you want it routed
differently.

### D1 `MachineGround` — as built

One `aria-hidden="true"` fixed element, `inset: 0`, `pointer-events: none`,
**`z-index: -1`** (your correction, not the SPEC's original `0`). Four
`repeating-linear-gradient`s: a 64px major pair and a 16px fine pair, all in
`--site-grid-line`. Because 64 is a multiple of 16 the major lines land on top
of a fine one, so the beat comes from **compositing**, not from a second token —
no new token, no hex literal, no image, no blur, no animation, no
`background-attachment`.

Read back from the running page (`/about`, dark, dev):

| property | value |
|---|---|
| parent | `SiteShell_shell__16A7F`, and it is `firstElementChild` |
| `position` / `z-index` | `fixed` / `-1` |
| `pointer-events` / `animation-name` | `none` / `none` |
| `aria-hidden` / `tabindex` | `"true"` / absent |
| resolved line colour | `rgba(164, 136, 255, 0.043)` (Chrome quantises the token's `0.045` to 8-bit alpha) |
| `--site-grid-size` / `-fine` | `64px` / `16px` |

`getComputedStyle(document.documentElement).backgroundColor` is
`rgba(0, 0, 0, 0)` and `backgroundImage` is `none`, so `body`'s
`rgb(11, 9, 22)` still propagates to the canvas and the negative-z layer paints
**above the canvas, below the page**. That is why `z-index: -1` works here and
why `.shell` must keep having no stacking context.

### D2 `AuroraBackdrop variant="route"` — final alphas

Two radials, no third highlight, weighted to the top of the box:

```
radial-gradient(68% 78% at 18%  4%, color-mix(in srgb, var(--site-aurora-1) 34%, transparent) 0%, transparent 70%),
radial-gradient(60% 72% at 82%  0%, color-mix(in srgb, var(--site-aurora-2) 30%, transparent) 0%, transparent 72%)
```

**34 / 30**, exactly the starting suggestion — nothing was retuned, because the
measurement cleared on the first run.

### D3 `GlassPanel tone="node"` — as built, and how far it is verified

`position: relative` is on `.node` **only**. Two pseudo-elements carry 1px
corner brackets (top-left `::before`, bottom-right `::after`, 14px arms, 10px
inset) in `--site-node-edge`; the node dot is a `radial-gradient` **background
on `.node` itself**, not a third pseudo-element, so the device still adds **no
DOM node and no child element**.

No consumer mounts `tone="node"` in this TASK (Home stays `plain`; About's
other blocks are TASK-008), so I verified it by **temporarily adding the
generated class to one Home panel in the browser only** — no source change, the
probe was removed afterwards. Computed read-back:

| | value |
|---|---|
| `.node` `position` | `relative` |
| `::before` | `content:""`, `absolute`, 14×14, `top/left: 10px`, `border-top`/`border-left: 1px solid rgba(196, 178, 255, 0.38)` |
| `::after` | `content:""`, `absolute`, 14×14, `right/bottom: 10px`, `border-right`/`border-bottom: 1px solid rgba(196, 178, 255, 0.38)` |
| dot | `radial-gradient(circle, rgb(164,136,255) 0px, rgb(164,136,255) 1.5px, transparent 2px)`, `no-repeat`, `calc(100% - 14px) 14px`, `4px 4px` |
| panel fill still glass | `background-color: rgba(120, 96, 200, 0.1)` — unchanged |
| tokens resolved | `--site-node-edge` `rgba(196,178,255,0.38)`, `--site-node-dot` -> `#a488ff` |

**Honest limit:** that is the computed geometry and colour, not a human looking
at it. At the pane's screenshot scale a 1px bracket is not legible, so *how the
node tone looks* is **UNVERIFIED** until TASK-008/009 mounts it — see FQ22.

### D5 motion — copied, not reinvented

`RouteHero.module.css` `.enter` reads back from the live CSSOM as:

```
.RouteHero_enter__cwP2L { animation: 520ms cubic-bezier(0.2, 0.7, 0.3, 1) 0s 1 normal both running RouteHero_rise__dahUn; }
@keyframes RouteHero_rise__dahUn { 0% {opacity: 0; transform: translateY(12px);} 100% {opacity: 1; transform: none;} }
@media (prefers-reduced-motion: reduce) >> .RouteHero_enter__cwP2L { animation: ... none; }
```

Same 520ms, same easing, same 12px rise, same opt-out as `HomeHero`.
`HomeHero.module.css` was **not** refactored.

### The luminance measurement

*Method, stated honestly — the same computed-composite sampler as TASK-004, one
layer deeper.* This is a **computed** composite, not a pixel readback. The
sampler reads each aurora layer's live `getBoundingClientRect()` and its live
computed `background-image` (so alphas and stops come off the running page,
never off the source file), applies each gradient's own ellipse geometry with
premultiplied alpha interpolation, and composites in paint order over
**body ground -> lattice -> aurora**. The lattice is modelled from the ground's
own live computed values at **true per-pixel coverage**: a viewport point takes
a line layer when `coord % period < 1`, so a 16px crossing stacks 2 layers and a
64px crossing stacks 4. Every scan below is at **1px steps over the whole box**.
No API in this session returns live pixels. **If a real readback ever
contradicts this, the readback wins.**

Sampler validation: with the lattice switched off, Home's hero peaks at
**L 0.03883 at (202,81), `rgb(59,35,134)`** at 1280×800 and **L 0.03873** at
360×740 — TASK-004's published numbers, to five and four decimals. The tool is
measuring the same thing it measured then.

**`/about` — the `RouteHero` box, whole box, ceiling 0.046:**

| viewport | box rect | lattice off | **lattice on (true)** | worst point | composite | ratio vs `#a9a3ba` |
|---|---|---|---|---|---|---|
| 1280×800 (`clientWidth` 1265) | 0,73 → 1265,1316 | 0.02324 | **0.03961** | 256,128 (4 layers) | `rgb(60, 41, 123)` | **4.82:1** |
| 360×740 | 0,65 → 360,598 | 0.02321 | **0.03655** | 64,128 (4 layers) | `rgb(58, 40, 116)` | **4.99:1** |

**Cleared at both viewports**, 13.9% and 20.5% headroom under 0.046. Layer-by-layer
peak at 1280×800: 0 layers 0.02324 · 1 layer 0.02725 · 2 layers 0.03160 ·
3 layers 0.03612 · 4 layers 0.03961. Nothing was retuned to get there.

Home's **band** aurora also clears with D1 underneath: **L 0.04409 → 4.59:1**
(1280×800, worst at 960,384, `rgb(64,42,132)`).

**Home's `hero` aurora does NOT clear — this is FQ19.**

| 1280×800, hero box 0,1 → 1265,801 | peak L | ratio |
|---|---|---|
| lattice off (TASK-004's state) | 0.03883 | 4.86:1 |
| 1 lattice layer (a fine line) | 0.04303 | 4.64:1 |
| **2 layers (a 16px crossing)** | **0.04706** | **4.45:1** |
| 3 layers | 0.05111 | 4.27:1 |
| **4 layers (a 64px crossing)** | **0.05477** | **4.12:1** |

360×740 agrees: **0.05347** at (64,64), 4.17:1. So D1 did not merely eat the
~16% headroom — **it crosses the ceiling, first at two overlapping lattice
lines**, which is every 16px crossing inside the hero's bright core. See FQ19;
I have not retuned anything.

### Home non-regression — a real A/B, not an assertion

Baseline = **the tree with my seven TASK-007 files reverted to `HEAD`**
(so `theme.ts` + `TechChip.module.css` stay at their TASK-006 state — the
baseline is "Home as TASK-006 left it", which is the right question). Files were
copied out and back byte-for-byte; **`git show` and `git diff` only, no `git`
write of any kind**, and I re-verified all seven files are byte-identical to my
versions afterwards.

Method: every element under `<body>` (excluding `<script>/<style>/<meta>/<title>`
and the Next dev portal) captured as tag + class list + text + rect + `color` /
`background-color` / `font-size` / `font-weight` / `z-index` / `position` /
`border-top-color` / `border-radius`, then set-diffed.

| viewport | before | after | only-before | only-after |
|---|---|---|---|---|
| 1280×800 | 115 el | 116 el | **none** | `DIV MachineGround_ground · 0,0,1265,800 · z-index -1 · fixed` |
| 360×740 | 115 el | 116 el | **none** | `DIV MachineGround_ground · 0,0,360,740 · z-index -1 · fixed` |

**Exactly one added element at both widths — D1's ground — and not one other
element moved, recoloured or resized.** Home's markup and geometry are
untouched; what is *not* clean is the composited luminance above (FQ19).

### `GlassPanel tone="plain"` — byte-for-byte

Five `GlassPanel`s render on `/`. Quoted from the running page, and the strings
are **identical before and after my change** (compared programmatically against
the baseline capture, `panelsIdentical: true`):

```
GlassPanel_panel__3VHVk GlassPanel_paddingMd__I4Jjl HomeStats_card__TNSQw          (HomeStats, ×4)
GlassPanel_panel__3VHVk GlassPanel_paddingLg__Pr_zA GlassPanel_glow__xXqki HomeCapabilities_panel__ZtN39
```

No `GlassPanel_node` class anywhere on `/`. The module-hash suffixes did not
move either, so this is literally byte-for-byte, not merely "same set".

### The ground is behind, not in front

`document.elementFromPoint()` at the centre of each target:

| page | scroll | target | point | returns |
|---|---|---|---|---|
| `/about` | 0 | header nav link "Home" | 723,36 | `A SiteHeader_link__MOeU_` |
| `/about` | 906 | `SectionHeading_lead` paragraph | 165,329 | `P SectionHeading_lead___l4hb` |
| `/about` | 2500 | `AboutExperience` body paragraph | 487,156 | `P AboutExperience_body__JaZOt` |
| `/` | 0 | `HomeHero_lead` paragraph | 165,599 | `P HomeHero_lead__8r6u0` |
| `/` | 1400 | `HomeCapabilities` h3 | 334,180 | `H3 HomeCapabilities_title__rP1FE` |
| `/` | 1400 | header nav link | 723,36 | `A SiteHeader_link__MOeU_` |

`isGround: false` on all six. The ground never wins a hit test — `pointer-events:
none` plus `z-index: -1`.

### Build, typecheck, console

- `npx tsc --noEmit` -> **exit 0**.
- `npm run build` -> **exit 0**, `✓ Compiled successfully in 22.1s`,
  `✓ Generating static pages (10/10)`, `[postbuild] copied .next/static + public/`.
  Route table unchanged in shape; `/about` 2.92 kB / 279 kB First Load.
  **No error and no warning line in the whole build output.** Run twice (before
  and after the A/B), same result. `.next` deleted afterwards.
- Six routes loaded fresh on dev (`/`, `/about`, `/services`, `/portfolio`,
  `/blog`, `/contact` — each confirmed by its own `<title>`), then
  `read_console_messages({onlyErrors: true})` -> **"No console logs."**
  The only non-error console output all session was Next dev noise: the React
  DevTools notice, Fast-Refresh lines from my own A/B file swaps, a dev CSS
  preload notice, and the **pre-existing** Next warning about
  `scroll-behavior: smooth` on `<html>` (that rule is `globals.css` at `HEAD`,
  untouched by me).

### Semantics and layout

- `/about` has **exactly one `<h1>`** and it is `ABOUT_INTRO.title`:
  "Three years of shipping the thing nobody there had shipped before".
- Skip link: `href="#main"`, `#main` exists and is the `<MAIN>` element.
- Heading outline on `/about`: `H1` intro · `H2` Where the work happened
  (`H3`×3) · `H2` Technical skills (`H3`×8) · `H2` How I work (**`H4`×3**) ·
  `H2` Certifications and training (`H3`×4) · `H2` Client conversations.
  The `H2 -> H4` skip is **pre-existing** (`AboutValues.tsx:19`, `order={4}`,
  not in my diff) — see FQ21.
- 360px: `document.scrollWidth === document.clientWidth` (360 === 360) on both
  `/about` and `/`; no horizontal scrollbar, no clipped Thai line.

### Greps

- `#` hex literal in `MachineGround/*`, `RouteHero/*`, `AuroraBackdrop.module.css`,
  `GlassPanel.module.css` -> **exit 1, no hits**.
- `gap: 1px` under `ui/` and `layout/` -> **exit 1, no hits**.
- `use client` under `src/components/ui/`: **one file now, one file at `HEAD`** —
  `ColorSchemeToggle.tsx` in both. The two new components added none.
- `git diff` over `AboutContent.tsx`: the block swap and the one import line,
  nothing else. `ABOUT_INTRO.eyebrow` / `.title` / `.lead` remain the only
  sources of copy; **no string was added, altered, removed or translated**
  anywhere in this task.

### Second pass — 2026-09-02, after FQ19's answer

One line changed since the first pass: `front/src/theme/theme.ts:262`,
`'--site-grid-line': 'rgba(164, 136, 255, 0.045)'` → `'rgba(164, 136, 255, 0.02)'`.
**`theme.ts:232` (the light companion) was not touched**, `MachineGround.module.css`
was not touched (16/64 rhythm and all four gradients intact), and no other file in
the repo changed. Dev on **port 3010** again (3000 still held), stopped afterwards;
`front/.next` deleted, so the repo is left with no build output. No git write.

**1. The rendered alpha, read back from the running page.** `getComputedStyle` on
the ground returns `rgba(164, 136, 255, 0.02)` — *and that string is the 8-bit
value, not the declared one*. Chrome serialises a quantised alpha with the fewest
decimals that round-trip, so I probed it rather than assume:

| declared | computed serialisation | 8-bit |
|---|---|---|
| `0.02` **and** `0.021` | `0.02` | 5/255 = **0.019608** |
| `0.022` **and** `0.0235` | `0.024` | 6/255 = 0.023529 |
| `0.045` **and** `0.043` | `0.043` | 11/255 = 0.043137 |

So your quantisation argument is confirmed on the running engine: declared `0.020`
renders **down** to 5/255, declared `0.022` would have rendered **up** to 6/255.
Every number below uses 5/255.

**2. Sampler — same one, validated again before it was trusted.** Same method as
the first pass (computed composite over body ground → lattice → aurora, 1px steps
over the whole box, all alphas/stops/rects read off the *running* page). Rebuilt
from scratch this session and re-validated: with the lattice off it reproduces
TASK-004's published peaks **exactly** — `/` hero **L 0.03883 at (202,81),
`rgb(59, 35, 134)`** at 1280×800 and **L 0.03873** at 360×740; `/about`'s box
reproduces the first pass's **0.02324 / 0.02321**. Still a computed composite, not
a pixel readback: **if a real readback ever contradicts it, the readback wins.**

**One model change, and it is why the answer is not simply "pass".** The first
pass counted lattice layers at the phase the page happens to have **at scroll 0**.
D1 is `position: fixed`, so the document slides underneath it: the *vertical*
phase between an aurora and the lattice is a free variable — scroll 17px and a
64px line lands on a row that had none. The horizontal phase is fixed (no
horizontal scroll) **for a given viewport width**, but it moves with the width,
because the aurora's centres are percentages of a full-width box. So I report
three readings: **aligned** (the first pass's model), **scroll-aware** (y free, x
fixed — reachable by scrolling at that width), and **free** (both free —
reachable by also resizing).

**3. The numbers. Ceiling 0.046; `#a9a3ba` needs 4.5:1.**

| box | viewport | aligned peak | **scroll-aware** | free |
|---|---|---|---|---|
| `/` hero | 1280×800 | 0.04374 (4.61:1) | **0.04575 → 4.509:1** | 0.04670 |
| `/` hero | 360×740 | 0.04348 (4.62:1) | **0.04462 → 4.563:1** | 0.04661 |
| `/` band | 1280×800 | 0.03623 | 0.04019 → 4.787:1 | 0.04294 |
| `/` band | 360×740 | 0.03499 | 0.03890 → 4.856:1 | — |
| `/about` RouteHero | 1280×800 | 0.02940 | 0.02942 → 5.436:1 | 0.03095 |
| `/about` RouteHero | 360×740 | 0.02824 | 0.03081 → 5.343:1 | 0.03092 |

Layer-by-layer on `/` hero, 1280×800 (0/1/2/3/4 lattice layers, whole box):
**0.03883 · 0.04077 · 0.04274 · 0.04471 · 0.04670**. At 360×740:
**0.03873 · 0.04068 · 0.04264 · 0.04462 · 0.04661**. The worst point at both is
the aurora's own peak — (202,81) and (58,78).

**Against the gate you set:** at the two named viewports it **passes** — 0.04575
and 0.04462. As instructed, I say so explicitly: **1280×800 lands inside your flag
strip (0.0450, 0.046]** at 0.04575. `/about` and the band clear everywhere, as
before.

**4. Why this is BLOCKED and not REVIEW — see FQ24.** Your gate is "≤ 0.046 **at
every viewport**". I found a viewport where it is not, and measured it in the
browser rather than argued it: **1217×800** (client width 1202) puts the hero
aurora's peak column exactly on x=192, a 64px gridline, so the scroll-aware worst
*is* the free worst: **L 0.04671 → 4.464:1**. I changed nothing.

**5. Home A/B — re-run, and re-scoped to the variable that actually moved.** The
first pass's file-level revert A/B (my 7 files → `HEAD`) is unchanged evidence and
still stands. This pass I could not repeat it: swapping repo source files was
blocked by this session's tooling. So I ran the A/B that isolates *this* pass's
one variable, entirely in the browser, with no source change:

- **A = α 0.02 (as built) vs B = α 0.045 forced back on** by an `!important`
  override injected into the pane. Every element under `<body>` captured as tag +
  class + text + rect + `color` / `background-color` / `font-size` /
  `font-weight` / `z-index` / `position` / `border-top-color` / `border-radius`,
  then set-diffed. **1280×800: 119 vs 119 elements, zero differences. 360×740:
  119 vs 119, zero differences.** The token alpha moves nothing.
- **A vs C = the ground element removed from the DOM** (i.e. Home as TASK-006 left
  it): **119 vs 118, and the single difference is D1's ground**
  (`DIV MachineGround_ground · 0,0,1265,800 · fixed · z-index -1`, and
  `0,0,360,740` at mobile). Nothing else moved, recoloured or resized.

**Build, typecheck.** `npx tsc --noEmit` → **exit 0**. `npm run build` → **exit
0**, `✓ Compiled successfully in 24.2s`, `✓ Generating static pages (10/10)`,
`[postbuild] copied .next/static + public/`; `/about` 2.92 kB / 279 kB, route
table unchanged in shape. **No error and no warning line in the whole output.**
`.next` deleted afterwards.

**The perceptibility observation you asked for — and I cannot give you a clean
one.** Of four pane captures of the dark ground below the fold, one rendered and
in it the 16/64 lattice was faintly but genuinely visible; the other three came
back as an unrendered flat frame (no text either, though the DOM had text at that
scroll), so the capture, not the page, was the problem. I will not turn one
questionable frame into a claim. What is arithmetic rather than eyesight: over the
bare ground `rgb(11, 9, 22)`, a single line renders **`rgb(14, 11, 27)`**, a 16px
crossing **`rgb(17, 14, 31)`**, a 64px crossing **`rgb(23, 19, 40)`**. Whether
that reads as a machine ground is the QA eye check you have already routed to
Porter.

### Third pass — 2026-09-02, after FQ24's answer. **PASS, by your own gate.**

**Your three edits, applied exactly, and nothing else.**

| file | change |
|---|---|
| `front/src/theme/theme.ts:262` | `--site-grid-line` dark `rgba(164,136,255,0.02)` → **`0.045`** (your `0.02` withdrawn). Line 232 (light) untouched, as always. |
| `front/src/components/partials/Home/HomeHero.module.css` `.hero` | `+ background-color: var(--mantine-color-body);` + your one-line comment |
| `front/src/components/ui/RouteHero/RouteHero.module.css` `.hero` | `+ background-color: var(--mantine-color-body);` + your one-line comment |

Not on `.aurora` — your trap noted and avoided. `MachineGround.module.css`,
`AuroraBackdrop.module.css`, `HomeStatement.module.css` and every `.tsx`
untouched this pass. No string added, altered or translated. No git write, no
deploy, `front/.next` deleted afterwards, dev on **port 3010** (3000 still
held), stopped.

**Read back off the running page, not off the source:** the ground computes to
`rgba(164, 136, 255, 0.043)` = **11/255**, and both `.hero` boxes compute to
`rgb(11, 9, 22)` — the exact bare ground of every earlier sampler validation.

**1. One model change in the sampler, stated up front because it is the thing
under test.** The sampler now *discovers* the painted base instead of assuming
it: from the aurora element it walks its ancestors and takes the first one with
a non-transparent `background-color` as the ground; only if there is none does
it fall back to canvas + lattice. That is the CSS painting rule your answer
rests on, so the "D1 removed" comparison below is **equal by construction, not
by luck** — which is why I did not stop at it and ran the rendered test in §4.

**2. Validated against five published numbers before it was trusted** (all five
reproduced exactly, none retuned):

| what | expected (published) | this pass |
|---|---|---|
| `/` hero, aurora only, 1280×800 | 0.03883 at (202,81), `rgb(59,35,134)`, 4.86:1 | **0.03883** at (202,80+1), `rgb(59, 35, 134)`, 4.860:1 |
| `/` hero, aurora only, 360×740 | 0.03873 | **0.03873** |
| `/` hero, α 0.045, true lattice phase, 1280×800 | 0.05477 → 4.12:1 (first pass) | **0.05477** → 4.121:1 |
| `/` hero, α 0.045, true phase, 360×740 | 0.05347 (first pass) | **0.05346** |
| `/about`, α 0.045, true phase, 1280×800 / 360×740 | 0.03961 / 0.03655 (first pass) | **0.03961 / 0.03655** |

Still a **computed composite, not a pixel readback** — if a real readback ever
contradicts it, the readback wins.

**3. The gate you set — worst composited L as rendered vs with D1's element
removed from the DOM at runtime, three blocks × three widths, 1217 first.**
Ceiling **0.046**; `#a9a3ba` needs 4.5:1.

| block | viewport (client w) | **as rendered** | **D1 removed** | Δ | ratio | headroom |
|---|---|---|---|---|---|---|
| `/` hero | **1217×800 (1202)** | **0.03884** (192,80) | **0.03884** | **0** | 4.860:1 | 15.6% |
| `/` hero | 1280×800 (1265) | **0.03883** (202,80) | **0.03883** | **0** | 4.860:1 | 15.6% |
| `/` hero | 360×740 | **0.03873** (58,77) | **0.03873** | **0** | 4.866:1 | 15.8% |
| `/` band | 1217×800 | **0.04114** (938,137) | **0.04114** | **0** | 4.737:1 | 10.6% |
| `/` band | 1280×800 | **0.04116** (987,137) | **0.04116** | **0** | 4.736:1 | 10.5% |
| `/` band | 360×740 | **0.04111** (281,109) | **0.04111** | **0** | 4.738:1 | 10.6% |
| `/about` RouteHero | 1217×800 | **0.02324** (216,49) | **0.02324** | **0** | 5.895:1 | 49.5% |
| `/about` RouteHero | 1280×800 | **0.02324** (228,50) | **0.02324** | **0** | 5.895:1 | 49.5% |
| `/about` RouteHero | 360×740 | **0.02321** (65,21) | **0.02321** | **0** | 5.898:1 | 49.6% |

**Every reading ≤ 0.046, every pair equal to the last decimal, at all three
widths.** Your prediction is met: the hero falls back to TASK-004's value
(0.03883/0.03884/0.03873 — the 1e-5 wobble is the aurora's own peak landing on
a different integer column at a different width, not a lattice term). 1217×800
— the width that broke — is now the boring one. **D1's contribution to all three
aurora blocks is exactly zero.** The ground element was restored after every
removal and re-checked present.

**What the fix removed, measured at the same widths** (parent transparent,
lattice at its real phase — i.e. what these boxes *would* read without the two
background lines): `/` hero **0.05379** at 1217, **0.05477** at 1280, **0.05346**
at 360; `/about` **0.03975 / 0.03961 / 0.03655**. So the breach was real and it
is gone by removal of the term, not by shrinking it.

**4. The rendered falsification test — the one part of this that is not a model.**
I forced `--site-grid-line` to **opaque red** at runtime and photographed the
hero, then removed *only* the new `.hero` background (the pre-fix state) and
photographed the same frame:

- **As built:** not one red line anywhere inside the hero box. The 1px row
  *above* the box (`.hero` starts at y=1) does show red — the positive control
  that proves the red lattice is painting.
- **`.hero` background forced transparent:** the red lattice **floods the whole
  hero**, 16/64 rhythm and all.

Same page, same second, one property apart. The occlusion is real in the
compositor, not only in my arithmetic.

**5. The band control — reported as measured, and I can now say why the two
earlier figures disagreed.** The band's rendered worst is **0.04116 / 0.04114 /
0.04111** and it does not move when D1 is removed, at any width. Your FQ19
figure (0.04409) and FQ24 figure (0.04019) were both taken with the sampler
compositing the band aurora over **canvas + lattice** instead of over the band's
own opaque `--site-surface` — the base was wrong, and the two differed from each
other because they were taken at different grid alphas (0.045 vs 0.02) and
different phase models. Re-running this pass's sampler on that old base
reproduces the old magnitude (**0.04348** at 1280×800, true phase, α 0.045).
**The band's real value never moved and never breached** — it was already opaque
since TASK-004; the two earlier numbers were sampler-base artefacts, not the
page. Your model of the painting order is not wrong; my earlier base was.

**6. R6 — Home vs the TASK-006 state, in-browser element A/B.** A = as built;
B = D1's element removed **and** `.hero`'s background overridden back to
transparent (TASK-006's Home). Every element under `<body>` captured as tag +
class + text + rect + `color` / `background-color` / `font-size` /
`font-weight` / `z-index` / `position` / `border-top-color` / `border-radius`,
then set-diffed:

| viewport | A | B | differences |
|---|---|---|---|
| 1280×800 | 114 el | 113 el | **exactly 2** — D1's ground added (`fixed`, `z-index -1`, `0,0,1265,800`); `.hero` `background-color` `rgba(0,0,0,0)` → `rgb(11,9,22)`, rect and all other properties byte-identical |
| 360×740 | 114 el | 113 el | **exactly 2** — the same two (`0,0,360,740`) |

That is your predicted R6 budget, no more and no less. (Element totals differ
from earlier passes only because this snapshot also skips the Next route
announcer; the A/B is internally consistent.)

**7. Build, typecheck, console.** `npx tsc --noEmit` → **exit 0**.
`npm run build` → **exit 0**, `✓ Compiled successfully in 18.1s`,
`✓ Generating static pages (10/10)`, `[postbuild] copied .next/static +
public/`; route table unchanged in shape (`/` 2.97 kB / 283 kB, `/about`
2.92 kB / 279 kB). **No error and no warning line in the whole output.** All six
routes visited on dev, `onlyErrors` → **"No console logs."** No horizontal
scroll at 360 on `/` or `/about`.

**8. What this pass does NOT tick.** The strip flag is retired as instructed and
no reading is judged against it. Still UNVERIFIED-by-eye and nobody should tick
them from this file: `tone="node"` (FQ22, still no consumer), reduced-motion
render (FQ23), the Modal skin (TASK-006 §Review / SQ7), and **whether the
lattice reads as a machine ground anywhere it is still visible** — my
below-the-fold captures came back as unrendered flat frames again (same artefact
as the second pass), so I make no perceptibility claim. Your SQ9 consequence is
confirmed as built, though: behind Home's hero and behind a route's opening
block there is now **no lattice at all**, by design.

## Questions

(Fern asks here; Sober answers as `> answer: ...`)

### FQ19 — BLOCKING. D1 pushes Home's hero over the 0.046 ceiling. Stop-and-ask.

Measured, not estimated (method and full table in §Implementation Notes). With
D1 composited **underneath** the hero aurora, the peak composited backdrop
inside Home's hero box is:

| | 1280×800 | 360×740 |
|---|---|---|
| before D1 (TASK-004's state) | L 0.03883 → 4.86:1 | L 0.03873 → 4.87:1 |
| **with D1** | **L 0.05477 → 4.12:1** | **L 0.05347 → 4.17:1** |

The ceiling is 0.046, and `#a9a3ba` needs 4.5:1. It is first crossed at **two**
overlapping lattice lines (**L 0.04706 → 4.45:1**), i.e. at every 16px crossing
inside the hero's bright core, and worst at a 64px crossing where four line
layers stack. **`/about`'s `RouteHero` box clears comfortably (0.03961 / 0.03655)
and Home's `band` clears (0.04409) — the hero is the only breach.**

I have changed nothing to make this go away, per your instruction. The levers I
can see are all yours, not mine, so I am naming them rather than picking one:

1. **Lower `--site-grid-line`.** A sweep on the real hero geometry: alpha
   **0.022 → peak 0.04466 (4.56:1), clears**; 0.03 → 0.04803, breaches;
   the current 0.045 (rendered 0.043) → 0.05609 in the same sweep. So roughly
   **half the current alpha** is where the hero clears. That is a TASK-006
   token you set, so I will not move it.
2. **Draw fewer layers per crossing.** Even a minimal one-line-per-axis lattice
   still stacks 2 layers where a vertical meets a horizontal — that alone is
   0.04706. So dropping the major/minor beat does **not** fix it; only alpha does.
3. **Mask or omit D1 behind the hero** (e.g. the ground stops where the hero
   aurora starts). Cheap, but it changes what "one fixed ground for the whole
   document" means and is a SPEC-level call.
4. **Accept the breach** on the argument that the exceedance is a 1×1px lattice
   crossing rather than an area, and that WCAG's background is the area behind
   the glyph. Defensible, but it is a deliberate relaxation of a ceiling you
   wrote, so it needs to be recorded as one, not assumed.
5. **Move the hero aurora's alphas** — I flag this only to rule it out: those
   are REQ-001-accepted values under R6 and I will not touch them.

Nothing else in this TASK depends on the answer; the four devices are built and
every other check passed. Tell me which lever and I will apply it in one pass.

> **answer (Sober, 2026-09-02) — lever 1, and I am setting the value:
> `--site-grid-line` dark goes `rgba(164, 136, 255, 0.045)` → `rgba(164, 136, 255, 0.02)`.
> The ceiling does not move. Nothing else in D1 changes.**
>
> *The measurement stands and the breach is real.* I checked the rule before
> deciding, because your table measures the **whole hero box** and the ceiling
> was originally written about the **header band** only — if it were still band-
> scoped, most of your breaching points sit below the band and there would be no
> breach to fix. It is not band-scoped any more: SPEC-001 was **amended
> 2026-08-30 (TASK-004 §FQ6)** to *"no point of the composited hero aurora may
> exceed relative luminance 0.046"*, and REQ-001 §Non-functional carries that
> widened form as an accepted criterion. Your whole-box scan is the correct
> scan. Recorded here so nobody re-derives this.
>
> **What to change — one line, `front/src/theme/theme.ts:262`** (the dark
> resolver block): `'--site-grid-line': 'rgba(164, 136, 255, 0.02)'`.
> **Do NOT touch `theme.ts:232`**, the light companion `rgba(83, 41, 200, 0.05)`
> — the site is dark-only today (SPEC-002 §Questions SQ1), so that value never
> renders and changing it would be an unmeasured edit. **Do not touch
> `MachineGround.module.css`**: keep the 16/64 rhythm and all four gradients.
> Yes, this edits a token published by TASK-006 (DONE) — that edit is
> **authorised inside this TASK**; I have recorded the supersede in SPEC-002's
> token table and in TASK-006 §Review so the old value cannot be re-read as
> current.
>
> **Why 0.02 and not your 0.022.** Your sweep gives 0.022 → 0.04466 and
> 0.030 → 0.04803, a local slope of ≈0.42 peak-L per unit alpha; 0.020 therefore
> lands at ≈**0.0438 → ≈4.60:1**, ~4.7% under the ceiling instead of 0.022's
> ~2.9%. Quantisation decides it: Chrome rounds alpha to 8 bits, so declared
> **0.022 renders as 6/255 = 0.0235** (*up*, ≈0.0454 peak, ~1% headroom) while
> declared **0.020 renders as 5/255 = 0.0196** (*down*, conservative). A margin
> of one part in a thousand is inside the noise of a computed-composite sampler
> that you yourself said a real pixel readback would overrule. I want the margin
> outside that noise.
>
> **Why not the other levers, so they are not re-proposed:**
> - **Lever 2 (fewer layers) — you already disproved it.** 2 layers = 0.04706 >
>   0.046 at the current alpha, so the rhythm is not the cause and dropping the
>   major beat would cost the device its machine reading for nothing. Agreed and
>   closed: keep 16/64.
> - **Lever 3 (mask/omit D1 behind the hero) — rejected on mechanics, not
>   taste.** D1 is `position: fixed`, i.e. bound to the **viewport**, not the
>   document. Any "the ground stops where the hero is" rule is therefore
>   viewport-relative and slides off the hero the moment the page scrolls. Making
>   it content-relative means the hero paints its own opaque blocker beneath the
>   aurora — which buys a visible lattice/no-lattice seam at the fold and couples
>   a global device to one route's geometry, for the same effect one token
>   achieves.
> - **Lever 4 (accept the breach) — rejected, and not mine to grant anyway.**
>   The ceiling was *already* relaxed-then-tightened once on exactly this
>   argument: the original wording let the bright core sit outside the band, and
>   TASK-004 §FQ6 closed that dodge because the peak simply moved into the hero's
>   own dimmed text. Re-opening it is an accessibility scope decision for the
>   owner via Porter, not an SA call, and I am not asking for it — the token
>   fixes it at no cost to anything REQ-001 accepted.
> - **Lever 5 (hero aurora alphas) — correctly ruled out by you.** R6,
>   REQ-001-accepted. Do not touch `.hero` or `.band`.
>
> **What I need back in one pass (do not retune anything else):**
> 1. The **rendered** alpha read back from the running page (expect
>    `rgba(164, 136, 255, 0.0196)`, not the declared string).
> 2. Home's hero re-measured with the same sampler: the layer-by-layer peak
>    (0/1/2/3/4 layers) at **1280×800 and 360×740**, plus the worst point.
> 3. `/about`'s `RouteHero` box and Home's `band` re-measured at both viewports
>    (both cleared before and must still clear).
> 4. **Pass/fail gate:** ≤ 0.046 at every viewport = pass, proceed to REVIEW.
>    **> 0.046 = stop and ask again** — do not retune on your own. If it lands
>    in the narrow strip **(0.0450, 0.046]** it still passes, but say so
>    explicitly in §Implementation Notes so I can decide at REVIEW whether to go
>    lower; do not pre-empt that by changing the value.
> 5. Re-run the Home A/B. The expectation is unchanged: **exactly one added
>    element** (D1's ground) and no other difference. A token alpha change must
>    not move an element.
>
> **One honest limit, and it is not yours to close.** Neither of us can assert
> from computed values that a 1px line at α 0.0196 is still *perceptible*. So:
> add a plain one-line observation to §Implementation Notes of whether you can
> see the lattice in the browser at 100% zoom on the dark ground **below the
> fold** (where no aurora composites) — an observation, not a change. Whether it
> reads as intended is an eye check that belongs to QA via Porter, and I am
> routing it there; it does **not** gate this TASK. Same posture as `tone="node"`
> (FQ22) and TASK-006's Modal skin: measured, not seen.

### FQ20 — non-blocking. `RouteHero` on About is 1243px tall, not "short".

The SPEC designed the `route` aurora as "a quieter opening" because a route's
first block is "much shorter than Home's full-viewport hero". On `/about` at
1280×800 the block measures **1243px** — taller than the 800px hero — because
About's `<h1>` renders at the display scale, **136px**, and the title wraps to
five lines. That is pre-existing (the same `SectionHeading order={1}` rendered
there before this task; my swap changed no heading level and no string), and the
luminance still clears, so I did **not** treat it as a defect. But the device's
premise does not hold on this route, and TASK-008/009/010 will inherit it on the
other four. Is the geometry as intended, or do you want the aurora's box or
About's h1 scale revisited? (h1 scale is REQ-001-accepted; I will not touch it
on my own.)

> **answer (Sober, 2026-09-02) — change nothing in this TASK. The device is not
> wrong; its premise was.** The aurora box tracks the block it opens, so at
> 1243px it is doing exactly what it was told; the height comes from an accepted
> token (display-scale `h1`) meeting a five-line title, and it still clears the
> ceiling. Neither the aurora box nor About's `h1` scale moves here.
>
> What I am *not* doing is calling a 1243px opening block "as intended" — I have
> not seen it, and REQ-002's look is Porter's and the owner's to accept. So:
> **SPEC-002 §Questions now carries this as SQ8** (a non-blocking notice to
> Porter), and **TASK-008/009/010 will each measure and report their route's
> opening-block height** rather than inherit the assumption silently. If the
> owner wants a shorter opening, that is a token/SPEC change I make once, on
> evidence from five routes — not a per-route improvisation now.

### FQ21 — non-blocking. Pre-existing heading skip on `/about`.

The DoD asks me to confirm "heading order is unbroken" on `/about`. It is not:
`H2` "How I work" is followed by three `H4`s (`AboutValues.tsx:19`,
`order={4}`), skipping `H3`. This is **pre-existing on `develop`**, is not in my
diff, and `AboutValues.tsx` is explicitly TASK-008's file — so I left the box
unticked rather than tick a claim that is false, and I did **not** fix it, since
that would be leaving this task. Do you want it in TASK-008?

> **answer (Sober, 2026-09-02) — yes, TASK-008, and you were right on both
> counts.** Not ticking a false box and not fixing a file outside your TASK are
> both the behaviour I want; do not "just fix" it now either. `AboutValues.tsx`
> is TASK-008's file, so the `H2 → H4` skip is fixed there as `order={3}`, with
> the heading outline of `/about` re-verified in that task's DoD. Recorded in
> SPEC-002 §Tasks under TASK-008 so it survives me. **This TASK's "heading order
> unbroken on /about" box stays unticked**, with your reason as the record —
> it is not a condition of TASK-007's DONE.

### FQ22 — non-blocking. `tone="node"` has no consumer yet.

Nothing in this TASK mounts `tone="node"`, so what I can honestly claim is the
computed geometry, colours and tokens (quoted in §Implementation Notes, read
back after applying the class **in the browser only**, no source change) —
**not** that it looks right. Confirm it stays UNVERIFIED-by-eye until
TASK-008/009 mounts it, the same way TASK-006's Modal skin does.

> **answer (Sober, 2026-09-02) — confirmed. `tone="node"` is UNVERIFIED-by-eye
> and will not be ticked from the code.** Same standing as TASK-006's Modal
> skin: geometry, colours and tokens are accepted on your computed read-back;
> *how it looks* is claimed by nobody until TASK-008/009 mounts a real consumer
> and it is seen. The browser-only probe (class added in the pane, no source
> change, removed after) is the right way to have got the numbers — do that
> again when you need computed values for something with no consumer.

### FQ23 — no answer needed, recorded so nobody re-derives it

Reduced motion: I could not emulate the OS flag in this session
(`matchMedia('(prefers-reduced-motion: reduce)').matches === false` throughout),
so that DoD box is unticked — the same position TASK-004 took. What I *did*
verify from the live CSSOM: the `@media (prefers-reduced-motion: reduce)` rule
exists and targets `.RouteHero_enter` with `animation: none`, and D1 and D2 have
`animationName === 'none'` unconditionally, flag or no flag. The rule is right;
the rendering under the flag is unverified.

> **answer (Sober, 2026-09-02) — accepted as recorded, box stays unticked.**
> Same position as TASK-004; it does not gate DONE. What you verified from the
> CSSOM (the `reduce` rule exists and targets `.enter` with `animation: none`;
> D1/D2 carry `animationName: none` unconditionally) is the part that is
> checkable without the flag, and it is the part that matters for D1/D2. The
> *rendering* under the flag is an eye/environment check — I am routing it to
> QA via Porter together with the FQ19 perceptibility observation, not asking
> you to emulate an OS setting you cannot set.

### FQ24 — BLOCKING. `0.02` clears the two named viewports but not *every* viewport. Stop-and-ask, per your own rule.

Your value is applied and it is a large improvement: the hero's worst case went
from **L 0.05477 → 4.12:1** to **L 0.04671 → 4.464:1**. But your gate is "≤ 0.046
at every viewport", and 0.04671 is a viewport I measured, not one I imagined.

**What makes it happen, in one sentence:** D1 is `position: fixed`, so the lattice
is anchored to the *viewport* while the hero aurora is sized in *percentages of a
full-width box* — change the width and the aurora's brightest column slides across
a grid whose columns never move, and at some widths the two coincide.

**Measured, in the browser, at three widths (scroll-aware worst case):**

| viewport | client width | hero peak column | worst L | ratio |
|---|---|---|---|---|
| 1280×800 | 1265 | 202 (no gridline; nearest is 192) | 0.04575 | 4.509:1 |
| 360×740 | 360 | 58 (nearest 64) | 0.04462 | 4.563:1 |
| **1217×800** | **1202** | **192 — exactly a 64px line** | **0.04671** | **4.464:1** |

So the pass at 1280 and 360 is width-luck, not headroom: at those widths the
aurora's peak simply misses the 64px column by 10 and 6 pixels. `/about` and Home's
`band` are unaffected — they clear at every reading (worst 0.03081 and 0.04019).

**A sweep so you can set the value in one step, not two.** I rebuilt the sampler
as a standalone script and validated it against the browser run — it reproduces
0.03884 / 0.04078 / 0.04274 / 0.04472 / **0.04671** at (192,81) exactly. Worst
case = 4 lattice layers on the aurora peak, at the 1202px-wide hero:

| declared | renders as | worst L | ratio | vs ceiling |
|---|---|---|---|---|
| 0.018 – 0.021 | 5/255 = 0.01961 | 0.04671 | 4.464:1 | **1.5% OVER** |
| 0.014 – 0.017 | 4/255 = 0.01569 | 0.04510 | 4.540:1 | 2.0% under — **inside your (0.0450, 0.046] strip** |
| 0.010 – 0.013 | 3/255 = 0.01176 | 0.04351 | 4.617:1 | 5.4% under — clear of the strip |

Quantisation means there are only three candidate renderings between here and
invisible, so this is the whole decision space for lever 1.

**I have retuned nothing and I am not choosing.** The levers are still yours, and
two of them read differently now than they did at FQ19:

1. **Lower the alpha again** — `0.012` is the only value that clears your strip as
   well as the ceiling. It is 3/255; at that alpha a line over the bare ground is
   `rgb(13, 10, 25)` against `rgb(11, 9, 22)`, and neither of us can say from
   computed values whether that is still a visible device. If you take this, the
   perceptibility eye check stops being a nice-to-have and becomes the thing that
   decides whether D1 is worth having at all.
2. **Accept 4/255 inside the strip** (0.04510) — clears the ceiling everywhere,
   with 2.0% margin, on a sampler whose own noise you and I both said a real pixel
   readback would overrule. Your call, not mine, because you wrote the strip.
3. **Scope the ceiling to what a reader actually reads.** At FQ19 you rejected
   "accept the breach" as an accessibility relaxation that is Porter's and the
   owner's to grant, not yours — that reasoning has not changed, and I am not
   asking for it. Recording it only so nobody re-proposes it as new.
4. **Make D1 not fixed** (e.g. a document-scrolled ground) would remove the
   y-freedom but not the width-freedom, and it changes the device's whole premise.
   Naming it to rule it out unless you say otherwise.

Everything else in this TASK is finished and re-verified at 0.02 (build, tsc,
A/B, `/about`, band, semantics, greps). Give me a value and I will apply it and
re-measure at all three widths in one pass.

> **answer (Sober, 2026-09-02) — you are not getting a value. Alpha is the wrong
> lever, and I am changing it.**
>
> **Why not another alpha.** Your sweep is honest and I accept every number in it,
> but it decides the wrong question. The breach is not a *brightness* problem, it
> is a *phase* problem: you proved D1 is `fixed` while the aurora is sized in
> percentages, so the peak column's offset from the 64px grid is a free variable
> in viewport width. A value chosen against three sampled widths is a value chosen
> against three samples of an unbounded variable — 0.045 failed, 0.02 failed one
> width later, and 0.016 or 0.012 would come back to me the same way the moment
> someone measures a width neither of us listed. I set 0.02 on two viewports and
> it was wrong; that is my error, not yours, and repeating it with a smaller
> number would be the same error a third time. **The fix is to remove the
> variable, not to shrink its coefficient.**
>
> **The mechanism, read first-hand in the repo (not inferred from your numbers).**
> D1 paints at `z-index: -1`, i.e. *below* the page — it can only reach the
> composited hero because the aurora's positioned parent is transparent and lets
> it through. And that is true of exactly two of the three aurora parents:
>
> | aurora consumer | positioned parent | parent background today |
> |---|---|---|
> | `HomeHero.tsx:25` `variant="hero"` | `HomeHero.module.css .hero` | **none** — D1 shows through |
> | `RouteHero.tsx:31` `variant="route"` | `RouteHero.module.css .hero` | **none** — D1 shows through |
> | `HomeStatement.tsx:15` `variant="band"` | `HomeStatement.module.css .band` | `var(--site-surface)` = `#151122`, **opaque** |
>
> The band already does the right thing and has since TASK-004. The two blocks
> that breach are the two that forgot to. This is not a new invention — it is the
> pattern already in the codebase, applied consistently.
>
> **Decision — three edits, all in CSS, no measurement input from me:**
>
> 1. `front/src/theme/theme.ts:262` — `--site-grid-line` dark back to
>    **`rgba(164, 136, 255, 0.045)`**, the designed value. My `0.02` is withdrawn
>    entirely; line 232 (light) stays untouched as always.
> 2. `front/src/components/partials/Home/HomeHero.module.css` `.hero` — add
>    `background-color: var(--mantine-color-body);`
> 3. `front/src/components/ui/RouteHero/RouteHero.module.css` `.hero` — add
>    `background-color: var(--mantine-color-body);`
>
> `--mantine-color-body` in the dark block is `obsidian[9]` = `#0b0916` =
> `rgb(11, 9, 22)` — **the exact bare ground you sampled**. So each of those two
> blocks is repainted with the colour that was already behind it before D1
> existed. Put a one-line comment on each: *"opaque so the fixed machine ground
> (D1) never composites with the aurora — SPEC-002 §Edge cases / TASK-007 FQ24."*
>
> **Do NOT put the background on `.aurora` itself.** It would look like the
> tidier one-line fix and it is a trap: `AuroraBackdrop` is `inset: 0` inside
> `.band` too, so an opaque colour there would repaint the band's
> `--site-surface` ground as canvas — a real, visible Home regression under R6.
> The ground belongs to the parent, in the parent's own colour.
>
> **What I am predicting, so the third pass can falsify me instead of asking me.**
> With no lattice term left in either block, the composited worst L must fall back
> to its aurora-only value — for Home's hero, the number your own sampler
> validated against TASK-004: **0.03883 at (202, 81)** — *at every width, because
> width no longer enters the arithmetic.* If you measure that, the ceiling is
> satisfied by construction and there is nothing left to tune.
>
> **The bounded rule for the third pass — apply it yourself, do not come back for
> a value.**
>
> - **The `(0.0450, 0.046]` strip flag is retired for this TASK.** It was my
>   caution band and it is now noise; a reading inside it is recorded in
>   §Implementation Notes and nothing more. Do not stop on it.
> - **Measure D1's contribution directly rather than judging a number**: for each
>   of the three aurora blocks, take the worst composited L (a) as rendered and
>   (b) with D1's element removed at runtime. **PASS = the two are equal within
>   your sampler's validated noise, for all three blocks, and every reading is
>   ≤ 0.046.** Widths: **1217×800 (the one that broke), 1280×800, 360×740** —
>   1217 first, since it is the width that must now be boring.
> - On PASS: set the TASK to **REVIEW**. Do not ask me anything.
> - **The band is your control**, not a subject: it is already opaque, so its
>   worst L must be *identical* at `0.02` and at `0.045`. If it moves, my model of
>   the painting order is wrong and I want to know that more than I want the pass.
>   (Your FQ19 and FQ24 band figures — 0.04409 and 0.04019 — differ, which under
>   an opaque `.band` they should not. I am not guessing at why; report it as
>   measured, whatever it turns out to be.)
> - **On FAIL, do not retune anything.** If D1 still contributes after the parents
>   are opaque, write the *mechanism* in one FQ and set BLOCKED. That one does not
>   come back to you for another alpha — it goes to Porter as a scope call (drop
>   D1 on aurora routes, or the owner relaxes a ceiling only the owner may relax).
>
> **R6 for this pass, stated in advance so it is not argued afterwards.** Expect
> **one** computed-style difference on Home versus pristine HEAD — `.hero`'s
> `background-color` — and **zero** rendered difference in the hero region, since
> the colour equals what `body` was already propagating there. Plus D1's one added
> element, as before. Anything beyond that is a regression.
>
> **Your four levers, closed.** (1) lower alpha again — rejected, see above; it
> tunes a coefficient of an unbounded variable. (2) accept 4/255 in the strip —
> moot, the strip is gone and so is the breach. (3) scope the ceiling — still not
> mine to grant, still not asked for, and now not needed. (4) un-`fixed` D1 —
> rejected: it changes the device's premise and does not remove width-freedom, as
> you correctly said.
>
> **The look consequence, recorded not hidden — this is my call and I own it.**
> The lattice no longer reads behind Home's first viewport or behind a route's
> opening block; there, the aurora *is* the ground. On the rest of every page it
> now shows at its **designed 0.045**, not the near-invisible 3–5/255 that alpha
> tuning was driving it toward — so this trade buys visibility everywhere else. I
> have routed it to Porter as **SQ9** for the owner's eye. It does **not** gate
> this TASK; build it, measure it, and let the owner look at it afterwards.

### SA-note — the deep `PageSection` import is approved, and here is the rule

Your one stated deviation (`RouteHero.tsx` importing
`@/components/common/PageSection` deep instead of via the `@/components/common`
barrel) is **correct and I verified the cycle myself, not on your word**:
`common/index.ts` re-exports `ChipRow`, and `common/ChipRow.tsx:2` imports
`{ TechChip } from '@/components/ui'` — so a barrel import from a `ui/`
component that `ui/index.ts` itself exports does close
`ui/index → RouteHero → common/index → ChipRow → ui/index`. Keep the deep
import and keep the comment that explains it.

**Standing rule from this, so it is decided once:** a component under
`components/ui/` imports from `components/common/` **by deep path, never
through the `common` barrel**. Sideways `ui → ui` and `common → ui` keep using
the barrels. This is a structure call, mine, and it binds TASK-008/009/010 too;
it is recorded in SPEC-002 §Interface design.

## Review

**Verdict: DONE** — Sober (SA), 2026-09-02, on the third pass.

**The gate I set at FQ24 is met exactly as written**, and it is met by
falsification rather than by assertion: D1's contribution to all three aurora
blocks is **0** at 1217/1280/360 (as rendered vs D1 removed at runtime), worst
reading **0.04116 ≤ 0.046** (the band, ratio 4.736:1), Home's hero back at
TASK-004's **0.03883**. My prediction was testable and it survived the test. I
do not re-run the browser numbers — per the gate, on PASS they are Fern's to
produce and mine to accept.

**Re-verified by me in the repo, first-hand, not inherited from the notes:**

- The **three edits are exactly the three I set, and nothing else.**
  `theme.ts:262` is back at `rgba(164, 136, 255, 0.045)` (my `0.02` withdrawn);
  `theme.ts:232` (light) untouched; `HomeHero.module.css .hero` and
  `RouteHero.module.css .hero` each carry `background-color:
  var(--mantine-color-body)` with the comment I asked for.
- **The trap was avoided:** `grep background-color` in
  `AuroraBackdrop.module.css` → **no hit**, and `HomeStatement.module.css` is
  not in `git status` at all. The band's own ground is untouched.
- **The colour is the right one, checked against the palette, not assumed:**
  dark `--mantine-color-body` = `obsidian[9]` = `#0b0916` = `rgb(11, 9, 22)`
  (`theme.ts:44`, `:239`) — the exact bare ground every sampler validation used.
- **The aurora is not occluded by its own new parent background** — I checked
  the mechanism because an opaque parent is exactly where this could have gone
  wrong: `.aurora` is `position: absolute; z-index: 0`, i.e. a positioned
  descendant with non-negative z-index, so it paints **above** the parent's
  background box; only D1 (`fixed`, `z-index: -1`, outside the parent) is cut
  off. Fern's opaque-red render agrees with that reading — red floods the hero
  when, and only when, the new `.hero` background is removed.
- `npx tsc --noEmit` → **exit 0**, run by me. `git status` = the same 10
  modified files + 2 new dirs; `HomeStatement.module.css`, `Drawer` and
  `package.json` absent. Hex-literal grep over the new/changed CSS → exit 1.
  `"use client"` under `ui/` = **one file now, one at HEAD**
  (`ColorSchemeToggle.tsx`) — the two new server components added none.
- Build, console, the 360px no-h-scroll check, the element A/B and the
  luminance tables are **accepted on Fern's evidence, not re-run by me.**

**The band discrepancy is resolved the right way round.** 0.04409 and 0.04019
were **my** sampler's base being wrong (band aurora composited over
canvas + lattice instead of over the band's own opaque `--site-surface`), not
the page moving; re-running the old base reproduces the old magnitude
(0.04348). The band never breached and never moved — it was opaque from
TASK-004. My model of the painting order stands; the earlier numbers were
artefacts of measuring it wrongly, and they are corrected here so nobody quotes
them again.

**Two DoD boxes stay unticked, and DONE does not tick them** (both were
answered before this pass and neither gates this TASK): `/about` heading order
(FQ21 — the pre-existing `H2 → H4` skip in `AboutValues.tsx:19`, fixed in
**TASK-008**), and reduced-motion rendering (FQ23 — routed to QA via Porter
under SQ8). Also still **UNVERIFIED-by-eye and not to be ticked from this
file**: `tone="node"` (FQ22, no consumer until TASK-008/009), the Modal skin
(TASK-006 §Review / SQ7), and lattice perceptibility (no capture succeeded — no
claim is made by anyone).

**What I own from this TASK.** FQ19's alpha lever was my mistake — one free
variable (viewport width, because D1 is `fixed`) tuned against sampled points.
It is recorded as mine in the FQ24 answer and the structural fix
(opaque parent, no lattice term left) is now a standing rule in SPEC-002
§Edge cases binding TASK-008..011. The look consequence is with Porter as SQ9.

**Not closed by this verdict:** REQ-002 stays `IN_SPEC` — TASK-008..011 are
planned in SPEC-002 but not yet written. That is the next SA unit.
