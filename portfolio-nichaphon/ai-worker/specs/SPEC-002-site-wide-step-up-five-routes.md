# SPEC-002: Whole-site step-up (AI / robotic / IoT) + the five remaining routes

- Source: REQ-002
- Status: **DONE again 2026-09-05** — reopened 2026-09-05 and closed the same day (TASK-013/014/015 all reviewed `DONE`); was `DONE 2026-09-04` (TASKs 006-012 all
  reviewed `DONE`; TASK-011's sweep closed the evidence pass). **Reopened by the
  owner's answers, not by a defect in the delivered work:** `Q23 = แก้ก่อนส่ง`,
  `Q24 = ใส่สัญญาณเลื่อน`, `AC7 = เอาออก` add **TASK-013, TASK-014, TASK-015**
  (§Tasks). REQ-002 stays `SPEC_DONE` — it does not go back to `IN_SPEC`; three
  tasks are open under a spec whose design is settled. **`SPEC_DONE` is still not
  "everything verified"** — nine items are carried UNVERIFIED (TASK-011 §7) and
  SQ11, SQ12 and SQ8's sixth eye sit with Porter.
- Written: 2026-09-02 by Sober (SA)
- Repo: `portfolio-nichaphon-web`, everything under `front/` (path: workspace-root `machine.local.md`)
- Builds on: SPEC-001 (DONE) — its token contract, primitives and retired-pattern
  list are inputs here, not re-decided.

## Overview

REQ-002 asks for two things at once: the five old-identity routes brought onto
Home's identity (R1), and that identity pushed further in the direction
`AI + robotic + IOT` (R2) — without touching a single word (R4) and without
regressing Home (R6).

The approach is deliberately **one step-up layer, applied once, inherited by six
routes** — not six route redesigns that happen to rhyme:

1. **Extend the token layer and the theme's component skins** (`theme.ts`,
   `globals.css`). Mantine widgets that only the five routes use — `Accordion`,
   `Modal`, `TextInput`/`Textarea`, `Alert` — are skinned centrally, so no route
   CSS module invents a control look. No existing variable name is removed or
   renamed (same rule as SPEC-001).
2. **Add three shared devices** that carry the AI/robotic/IoT reading:
   a machine ground mounted once in the shell, a `route` aurora variant, and an
   optional circuit `tone` on `GlassPanel`. All three are additive; Home's
   current markup keeps rendering exactly as it does today.
3. **Rebuild the five routes' own partials** onto `GlassPanel` + the new
   `RouteHero`, deleting the retired patterns SPEC-001 named — which are still
   alive on all five routes (evidence below).

Why "step up" is expressed as *ground, edge and control skin* rather than as new
imagery: the site owns **no image assets** for this direction and R4 forbids any
role inventing content — stock or generated imagery would be exactly that. If the
owner's AC2 judgement is "still not bold enough without imagery", that is a
DATA REQUEST for his own files via Porter, not something this SPEC pre-empts.

### What the step-up is, concretely (R2 is the design's call — these are the calls)

| Device | Reading | Where |
|---|---|---|
| **D1 machine ground** — a fixed, `aria-hidden`, very-low-alpha lattice (1px lines on a 16/64px rhythm, violet-tinted) behind everything | instrument panel / sensor grid | mounted **once** in `SiteShell`, all six routes |
| **D2 route aurora** — `AuroraBackdrop variant="route"`, one per route behind its first block | the identity's purple bleed, now site-wide | five routes' `RouteHero` (Home keeps `hero`) |
| **D3 circuit edge** — `GlassPanel tone="node"`: 1px accent corner brackets + a small node dot, pseudo-elements only | board trace / device node | cards on the five routes |
| **D4 machine numerals** — mono + `tabular-nums` on every value that is already a number in content | telemetry readout | existing numeric fields only (see SQ2) |
| **D5 one motion device** — the existing hero entrance (fade+rise, `prefers-reduced-motion` opt-out) reused on `RouteHero` | arrival, not decoration | `RouteHero` only |

**Hard limit on the step-up: no looping or continuous animation anywhere, no
`filter: blur()` on a full-bleed layer, no new dependency, no image asset, no new
`"use client"` boundary.** The theme keeps `respectReducedMotion: true`.

### Decision: colour scheme is NOT touched by this SPEC — and REQ-002 Q19's premise has already moved

**Fact from the build, not an assumption:** `forceColorScheme="dark"` is set on
`MantineProvider` (`components/providers/UIProvider.tsx`) **and** on
`ColorSchemeScript` (`app/layout.tsx`), and `ColorSchemeToggle` is not mounted in
`SiteHeader`. Both are global. So **all six routes are already dark-only today** —
the five non-Home routes lost the toggle as a side effect of SPEC-001's shell work,
before Q19 was ever asked.

This SPEC therefore changes nothing about colour scheme: doing nothing keeps the
shipped behaviour, which is the only option that is not a guess. If the owner
answers Q19 with "the other five keep light mode", that is **not a tweak** — it
means designing and building a light scheme that has never existed on this site,
and it belongs in its own REQ. Raised to Porter as **SQ1** (a fact, not a blocker).

**Extended 2026-09-05 — Q19 is CLOSED, `AC7 = เอาออก`.** The owner's answer went
the way SQ1 said the facts already pointed: the five non-Home routes lose the
toggle too. **So nothing rendered has to change** — they lost it in SPEC-001's
shell work and the light scheme SQ1 warned would be new REQ-level work is **not**
needed. No new REQ is opened.

What *is* now decided, and it is mine per Porter's routing: **the dead
`ColorSchemeToggle` and its `ui` barrel re-export are removed — TASK-015.** Two
reasons, and neither of them is "the owner asked for a deletion" (he did not; he
answered about the toggle a visitor sees): it is dead code that contradicts a
settled decision and invites a later re-mount, and it is **the only `'use client'`
member of the `@/components/ui` barrel**, which is **SQ11**'s named lead for
`/blog` + `/portfolio`. Removing it makes SQ11 measurable. This SPEC still takes
no position on SQ11's verdict.

**`forceColorScheme="dark"` on `ColorSchemeScript` and `MantineProvider` is NOT
touched.** Those two are what make the site dark-only; deleting them would undo
`เอาออก`, not implement it. **AC7 does not tick on TASK-015** — it needs QA to
look at the five non-Home routes, and it would tick with or without this task.

### Decision: the UI library still does not change — Mantine 8.3.18 stays

SPEC-001's reasoning is unchanged and REQ-002 Constraints carries the same
permission and the same bar (clean build). Nothing in D1–D5 needs a library the
repo does not have; all five devices are CSS on components that already exist.
A dependency added for decoration would be paid for on every route's bundle.

## Interface design — component contracts

### Unchanged public APIs (hard constraint, carried from SPEC-001)

`PageSection`, `SectionHeading`, `TechChip`, `ChipRow`, `ImageLightbox`,
`SiteShell`, `PullQuote` and `AuroraBackdrop`'s existing variants keep their
**exact current props**. Internals and CSS modules may change freely. Any prop
change is an SA decision first.

### Additive changes to existing primitives (safe by construction)

| Component | Change | Why it cannot regress Home |
|---|---|---|
| `AuroraBackdrop` | new variant value `'route'` (union becomes `'hero' \| 'band' \| 'route'`) | additive union member; `hero`/`band` CSS untouched |
| `GlassPanel` | new **optional** prop `tone?: 'plain' \| 'node'`, default `'plain'` | default path renders today's class list unchanged |

### New shared primitives — `front/src/components/ui/`

| Component | Props | Purpose |
|---|---|---|
| `MachineGround` | none | D1. One `aria-hidden="true"`, `position: fixed`, `inset: 0`, `pointer-events: none`, **`z-index: -1`** layer of repeating-linear-gradient lattice. Mounted once in `SiteShell` behind `main`. Server component. |
| `RouteHero` | `{ eyebrow?: string, title: string, lead?: string, children?: ReactNode }` | D2/D5. The five routes' shared opening block: `AuroraBackdrop variant="route"` + `SectionHeading order={1}` fed **the route's existing `*_INTRO` strings**, with the entrance motion. It renders no string of its own. Server component. |

Both export through `components/ui/index.ts`. Neither takes `"use client"`.

**Import direction rule (added 2026-09-02, Sober, from TASK-007 §Implementation
Notes — binds TASK-008/009/010).** A component under `components/ui/` imports
from `components/common/` **by deep path** (`@/components/common/PageSection`),
**never** through the `@/components/common` barrel. Reason, verified in the
repo: `common/index.ts` re-exports `ChipRow`, and `ChipRow.tsx` imports the
`@/components/ui` barrel — so a barrel import closes the cycle
`ui/index → <ui component> → common/index → ChipRow → ui/index`. Sideways
`ui → ui` and `common → ui` keep using the barrels.

### Retired patterns — now binding on all six routes (this is R1 + R3)

SPEC-001 retired these on `/`. They are **still present on the five routes** —
verified by reading the repo on 2026-09-02, file and line:

- **1px hairline grid as a card surface** (`gap: 1px` + `--site-hairline` ground):
  `ContactChannels.module.css:3`, `PortfolioGrid.module.css:3`.
- **Uppercase-mono micro-label**: `AboutExperience.module.css:57-60`,
  `AboutSkills.module.css:21-25`, `ContactChannels.module.css:23-27`,
  `ProjectModal.module.css:12-16`, `ServicesTable.module.css:31-35`.
- **xs (4px) radius as the chip/control language**: `TechChip.module.css:10`,
  `BlogFilter.module.css:12`.
- Flat 1px-bordered boxes as the card language, and `variant="default"` as a
  control look: `ContactFaq.tsx:20` (`Accordion variant="default"`).

**Carve-out — what "retired" never meant (added 2026-09-04, Sober, at the
TASK-011 review; settles boxes 2.2 and 2.4 for good).** Two sweep greps came back
with hits and neither is a live retired pattern. Recording the boundary so no
future sweep re-litigates it:

- **`text-transform: uppercase` is not itself retired.** What was retired is the
  *uppercase-mono micro-label* listed above. `AboutExperience.module.css:54`
  (`.marker`, the mono eyebrow TASK-008 A2 introduced and I accepted) is the same
  "mono where it reads as machine" exemption `TechChip` and `.site-numeric`
  already have. It is byte-identical at `46aef59`. A future sweep should scope the
  grep to the label recipe's own selectors, not to the property.
- **`variant="default"` has no live occurrence.** `HomeHero.module.css:140` is a
  comment naming the pattern as retired, and `ColorSchemeToggle.tsx:17` is a real
  prop on a component with **no consumer** anywhere in `src/` on a dark-only site
  — a dead export. Both HEAD-identical. **`ColorSchemeToggle` is dead code: named,
  deliberately not deleted.** Removing an export nobody asked about is a scope
  decision, not sweep or review work.

**Correction to the inline-`vars` rule (2026-09-04, Sober — supersedes the wording
I set at TASK-010's review).** That rule read: *an inline `vars` value also
outranks that variable's state rules in Mantine's stylesheet.* It is true **only
when the inline value and the state rule land on the same element**, which is
what T3's `Accordion` case was. It does **not** stretch across a
wrapper→descendant hop: `vars.wrapper` lands inline on the Input **wrapper**
(`.m_6c018570`) and merely *inherits* down, while `Input.css:191` redeclares
`--input-bd` on the **input** (`.m_8fb7ebe7`) — and an element's own declaration
beats an inherited value, inline ancestor or not. Misapplying the rule across
that hop is what produced FQ38's mechanism claim, which I could not confirm; see
SQ12.

Replacements: `GlassPanel` (with `tone="node"` where a card wants the circuit
edge) for surfaces; `SectionHeading`'s current label treatment for labels; pill
radius (`999px`) for chips and filter controls; the theme's `Accordion` skin for
the FAQ. **Mono stays where it reads as machine, not as a retired micro-label:**
`TechChip` keeps `--site-font-mono` (it is a tech token) and loses only its 4px
radius; `.site-numeric` keeps mono numerals.

**Token rule (2026-09-05, Sober, from TASK-014 FQ40) — full text in §Decision:
the `/services` scroll affordance.** In one line: *"existing tokens only" bars a
new **value** (a hex, an rgba, a new `--site-*` name), not compositing a
sanctioned token with itself* — a doubled layer stays tied to its token; a
hand-written equivalent would be a second source of truth. Any such composition
carries a comment in the CSS saying why.

**Label recipe — the exact replacement (added 2026-09-02, Sober; binds
TASK-008/009/010).** "`SectionHeading`'s label treatment" above was a pointer,
not a value, and five files were about to interpret it five ways. The retired
uppercase-mono micro-label is replaced by exactly this, everywhere, and nothing
else is invented:

```css
font-family: var(--site-font-body);
font-size: 0.8125rem;
font-weight: 600;
letter-spacing: 0;
text-transform: none;
color: var(--mantine-color-dimmed);
```

**Without** the purple dot: the dot is `SectionHeading .eyebrow::before` and
belongs to a section eyebrow alone — on a field label or a table header it reads
as a second eyebrow. Applies to `AboutSkills.module.css:18-26`,
`ContactChannels.module.css:20-28`, `ProjectModal.module.css:9-17`,
`ServicesTable.module.css:31-35`. `AboutExperience.module.css:57-60` (`.marker`)
is **exempt** — it is an accent badge with an icon, not a field label, and it
keeps its current treatment.

**Hover recipe on a `GlassPanel` card — one recipe, and it does not spread
(added 2026-09-04, Sober, at TASK-009 review; binds TASK-010/011).** A card whose
old hover was `background-color` cannot keep it: the panel owns its ground. The
one replacement, already live at `TechChip.module.css:24` and now at
`PortfolioGrid.module.css:33`, is exactly:

```css
border-color: color-mix(in srgb, var(--mantine-color-anchor) 40%, transparent);
```

Two consequences, both binding:

- **No third copy.** `GlassPanel`'s `className` is documented "Layout only.
  Colour belongs to the panel" — `PortfolioGrid` is the first consumer to
  override a panel *surface* property, and it stands only because I prescribed
  it and it invents no value. If a **third** interactive panel appears, the hover
  moves into `GlassPanel` as an `interactive` prop and the consumers drop their
  copies. That is an SA call and a `components/ui/` edit — never an engineer's
  improvisation inside a route CSS module.
- **TASK-010 does not invent its own.** `ContactChannels`' cards use this recipe
  or no hover at all.

**Precedence between a standing rule and a route instruction (added 2026-09-04,
Sober, from TASK-009 FQ28).** Where a dated standing rule in a TASK's §0 and an
older route-section instruction in the same TASK point opposite ways, **§0 wins**
— an instruction written before a dated rule does not override it. Raise the
conflict first, then follow §0. (The case: `PortfolioGrid.module.css:53`.)


**State-dependent grounds live in `vars`, never in `styles` (added 2026-09-04,
Sober, from TASK-010 FQ32; binds every later task that touches `theme.ts`).** A
theme `styles` value becomes an **inline `style` object**, so a nested selector
(`&:hover`, `&:focus`) cannot exist there — React stamps it as a junk attribute
and the browser drops it. Where Mantine's own stylesheet paints a state, the fix
is to **scope the variable that rule already reads** in the component's `vars`
block, after checking in `node_modules/@mantine/core/styles/<Component>.css` what
else reads it. Verify with two `getComputedStyle` reads — the variable resolved
on the inner element, and the same variable *unchanged* on
`document.documentElement`, which proves the override did not leak. A CSS module,
a `classNames` stylesheet or `!important` is **not** the fallback: if the
variable does not reach the element, that is a stop-and-ask.

**Corollary — an inline `vars` value also silences the stylesheet's *other*
rules for that variable (added 2026-09-04, Sober, at the TASK-010 round-2
review).** The `vars` object is stamped inline, so it beats every stylesheet
declaration of the same variable inside that subtree, including the ones a
*state* selector sets. Two verified instances, both unreachable on today's site
and therefore recorded rather than fixed: `Accordion.css:109`'s
`--item-filled-color` (the contained/filled variants' open-item ground — moot
here, `ContactFaq` renders no `variant` and `styles.item` paints inline anyway),
and `Input.css:142`'s red `--input-placeholder-color` under `[data-error]`,
which T4's wrapper value would now outrank (moot here, `ContactForm` passes no
Mantine `error` prop). **Any later task that adds a `variant` or an `error` prop
to those controls must re-check this before it ships.**

**R4 and letter case (added 2026-09-04, Sober, from TASK-008 FQ26 + TASK-010
FQ31; binds TASK-011).** R4 protects **source strings**, not the casing
`text-transform` paints. A casing delta in `innerText` that is produced by the
SA-owned label recipe **satisfies R4**; any other `innerText` delta does not.
Site-wide running total, for the owner's eye and nothing else: **14 labels**
change case — 8 on `/about`, 3 on `/services`, 3 on `/contact`.

## Data model — content and types

**No type changes. No new content file. No string added, altered, removed or
translated** — R4 binds this SPEC absolutely. Every route already carries its own
copy: `About.config.ts`, `Services.config.ts`, `Portfolio.config.ts`,
`Blog.config.ts`, `Contact.config.ts` and `constant/content/*`. A layout that
seems to need a word that does not exist is a **stop-and-ask** (Fern to Sober to
Porter), never a placeholder.

### Quotes — distribution (R5)

`constant/content/quotes.ts` already holds all four, and its strings are
R5-canonical as of 2026-09-02 (quote 2's Thai was aligned to the page by Porter;
QA confirmed all three rendered strings character-exact on `/`).

- Home keeps **q4** (hero) and **q2** (band) — unchanged, R6.
- **q3 → About**, one `PullQuote size="lead"` in the values/approach area.
- **q1 → Services**, one `PullQuote size="lead"` above the CTA block.
- Portfolio, Blog and Contact carry **no quote**.
- Rule enforced: **at most one quote per route outside Home, never all four on a
  page**, strings read from `quotes.ts` and never retyped into a component.

**q1 and q3's English is still unconfirmed by the owner** (REQ-001 R5, carried by
REQ-002 R5). Shipping them puts that sentence on the site, so REQ-002 R5's
mechanism applies: Porter puts both English lines to the owner at review — raised
as **SQ3**. Fallback if he does not want unconfirmed English live: delete the two
`<PullQuote>` lines, nothing else changes. That reversibility is why the quotes
are placed as single self-contained elements and not woven into a layout.

## Token layer — `front/src/theme/theme.ts` + `globals.css`

Additive only. **No existing variable is removed or renamed** — 15 CSS modules
read `--site-hairline` alone, and the spots that keep it must stay legible.

New CSS variables, declared in **both** blocks of `cssVariablesResolver` (the
`light` block stays defined-but-unreachable exactly as SPEC-001 left it):

| Variable | dark value | Purpose |
|---|---|---|
| `--site-grid-line` | ~~`rgba(164, 136, 255, 0.045)`~~ → **`rgba(164, 136, 255, 0.02)`** (superseded 2026-09-02, see below) | D1 lattice stroke |
| `--site-grid-size` | `64px` | D1 major rhythm |
| `--site-grid-size-fine` | `16px` | D1 minor rhythm |
| `--site-node-edge` | `rgba(196, 178, 255, 0.38)` | D3 corner bracket |
| `--site-node-dot` | `var(--mantine-color-anchor)` | D3 node dot |

`light` block values: the same alphas over the light ramp
(`rgba(83, 41, 200, 0.05)` / `rgba(83, 41, 200, 0.30)`), so nothing is undefined.

> **`--site-grid-line` superseded 2026-09-02 (Sober), on measurement — dark
> block only.** TASK-006 shipped `0.045`; TASK-007 measured D1 composited under
> Home's hero at **L 0.05477 (4.12:1)** against the **0.046** ceiling of
> §Edge cases, first crossed at *two* lattice layers (0.04706), i.e. at every
> 16px crossing in the hero's bright core. The dark value is therefore
> **`rgba(164, 136, 255, 0.02)`** — chosen over Fern's clearing candidate 0.022
> because Chrome quantises alpha to 8 bits (declared 0.022 renders *up* to
> 6/255 ≈ 0.0235, leaving ~1% headroom; declared 0.02 renders *down* to
> 5/255 ≈ 0.0196, ≈ L 0.0438 → ≈4.60:1, ~4.7% headroom). The **ceiling did not
> move**, the 16/64 rhythm did not change, and nothing REQ-001 accepted
> (`.hero` / `.band` alphas, `h1` scale) was touched. Rejected alternatives and
> their reasons are recorded once, in TASK-007 §Questions FQ19 — do not
> re-derive them. **The light value at `theme.ts:232` is unchanged** (dark-only
> site, SQ1: it never renders). Applied and re-measured under TASK-007;
> TASK-006's table is stale from this date.

**New theme `components` skins** (this is the design-system boundary — a route CSS
module must not do these itself):

- `Accordion`: chevron in `--mantine-color-anchor`; item surface `--site-glass-bg`
  with `--site-glass-border`; radius `lg`; no `variant="default"` look. The
  `variant="default"` prop at `ContactFaq.tsx:20` is removed in TASK-010.
- `Modal`: `--site-surface` ground, `lg` radius, `--site-glass-border` edge,
  overlay `rgba(11, 9, 22, 0.72)` with **no backdrop blur** (paint cost rule).
- `TextInput` / `Textarea`: keep the existing 44px `--input-height` and
  `--site-control-border`; add `lg` radius and `--site-surface` fill.
- `Alert`: `lg` radius, `--site-accent-wash` fill for the success/idle case.
- `Button`: unchanged (SPEC-001's `--site-cta-*` routing and the measured 5.11:1
  rest / 7.08:1 hover pair stand).
- `Drawer`: **deliberately not skinned** (SA decision, 2026-09-02). It is the
  mobile nav, so it renders on **Home** too and REQ-002 R6 forbids a Home
  regression; and it is not one of the five routes' own patterns, so R1 does not
  reach it. It keeps exactly the look REQ-001 accepted. Named here so no task
  skins it "for consistency" with the new `Modal`.

`globals.css`: no new global rule except the D1 layer's own class if it cannot
live in a CSS module. `--site-header-height`, the `h1` tracking rule, the focus
ring and the skip link are untouched.

## Flow — what each route becomes (layout only)

Every route below: `RouteHero` replaces the bare `PageSection density="tight"` +
`SectionHeading order={1}` opening; every card surface becomes `GlassPanel`; the
retired patterns listed above are deleted, not recoloured.

1. **About** — `RouteHero` (`ABOUT_INTRO`), then Experience (timeline entries as
   `GlassPanel tone="node"`, `ChipRow` pills), Skills (`GlassPanel` groups),
   Values, Certificates, Testimonials. **q3** sits between Values and
   Certificates. Section order and every string unchanged.
2. **Services** — `RouteHero` (`SERVICES_INTRO`) + ~~`ServicesTable` as
   `GlassPanel` rows~~ → **`ServicesTable` stays a `<table>`; only its surface
   and its header label change** (corrected 2026-09-02, Sober, on reading the
   file: cards would delete the three `<th scope="col">` strings `Service`,
   `What it covers`, `Stack` — user-visible text, so R4 — and destroy the
   `role="region"` / `aria-label` tabular structure §Non-functional says a
   restyle may not break. Exact changes in TASK-008 B2);
   `ServicesProcess` keeps its existing `step.step` numerals
   (they are content, `constant/content/services.ts`) rendered as D4 readouts;
   **q1** above `ServicesCta`, which keeps its filled Button.
3. **Portfolio** — `RouteHero` (`PORTFOLIO_INTRO`); `PortfolioGrid` loses the
   `gap: 1px` grid for `GlassPanel tone="node"` cards on a real gap;
   `ProjectModal` inherits the new `Modal` skin and loses its uppercase-mono
   label. The client-component boundary (`PortfolioContent`) does not move.
4. **Blog** — `RouteHero` (`BLOG_INTRO`); `BlogFilter` chips become pills using
   the same control language as `TechChip`; `BlogList` rows become `GlassPanel`.
   The filter's client boundary does not move. (The missing `/blog/[slug]` route
   stays out of scope — REQ-002 Out of Scope.)
5. **Contact** — `RouteHero` (`CONTACT_INTRO`); `ContactForm` keeps its **exact**
   current behaviour (the `mailto:` handoff at `ContactForm.tsx:36`, the same
   states and the same `FORM_COPY` strings) and only inherits the new input skin;
   `ContactChannels` loses the `gap: 1px` grid for `GlassPanel`; `ContactFaq`
   drops `variant="default"`.
6. **Home** — **no structural change.** It gains only what it inherits: D1's
   ground behind it. Everything REQ-001 accepted stays as shipped.

### Decision: the `/services` scroll affordance — DEF-3, added 2026-09-05

The owner answered **Q24 = `ใส่สัญญาณเลื่อน`**: `/services`' table gets a visible
scroll signal now. Item 2 above is unchanged and still binding — it stays a
`<table>`, keeps its three `<th scope="col">` strings and keeps `role="region"`
— so the affordance lives **on the scroller, not in the table**.

**The call (Sober, 2026-09-05):** two CSS-only signals on `.scroller` —
a permanently visible thin horizontal scrollbar (`scrollbar-width` /
`scrollbar-color` + `::-webkit-scrollbar`, which also opts Chromium out of
overlay scrollbars so the bar exists before any interaction), and a right-edge
shadow that hides itself at the end of the scroll (the layered
`background-attachment: local`/`scroll` gradient trick, with a
`position: relative` wrapper + `::after` as the sanctioned fallback). Existing
tokens only; a new named token would be a further SPEC decision, not a task one.

**Rejected here so they are not re-proposed:** hint text (new visible copy on a
route whose R4/H5 baseline is still open), cards (§Flow item 2), and any
JS-driven control (it would mount a client component on `/services` while
**SQ11** is open on exactly that). **No new ARIA** — the scroller already has
`tabIndex={0}`, `role="region"` and `aria-label`, so this is a *visual* gap only.

Built by **TASK-014**. It gates no AC; it is committed work with no tick.

**Token rule, added 2026-09-05 from TASK-014 FQ40 — binding, so nobody re-opens
it.** *"Existing tokens only" bars a new **value**: a hex, an rgba, or a new
`--site-*` name. It does **not** bar compositing a sanctioned token with itself.*
A token painted as two background layers introduces no new value into the system
and still moves with the token if the token changes; a hand-written equivalent
(`rgb(79,70,110)`) would be a second source of truth. That is the whole
distinction. Applied here: the edge shadow ships as `--site-glass-border` laid
down twice (effective alpha 0.328), because one pass of it — and one pass of
`--site-hairline` — is invisible on this ground at 360, measured before doubling.
Rejected alternatives, recorded: a new named token buys one consumer permanent
design-system API surface; `--site-node-edge` (`rgba(196,178,255,0.38)`) has the
right alpha but means *machine-graphic node edge*, and borrowing it for a panel
edge is semantic drift. **Any composition of this kind still carries a comment in
the CSS saying why** — that is what makes it legible rather than mysterious.

### Edge cases

- **Header transparency ceiling (inherited, now site-wide).** The bar is
  transparent at rest on **every** route (`SiteHeader.tsx` sets `data-scrolled`
  from `window.scrollY > 8`), and its at-rest link colour is
  `--mantine-color-dimmed` `#a9a3ba`. SPEC-001's rule therefore binds D1 and D2
  too: **no point of the composited backdrop behind the header band may exceed
  relative luminance 0.046.** D1's alpha and the `route` aurora's alphas must be
  chosen and **measured** against that ceiling, not assumed. If the wanted look
  needs a brighter core in that band, it is a stop-and-ask.
- **An aurora's positioned parent carries an opaque background — standing rule,
  added 2026-09-02 (Sober, TASK-007 FQ24). Binds TASK-008/009/010/011.**
  Every consumer of `AuroraBackdrop` must give the positioned parent an opaque
  background token (`--mantine-color-body` for a canvas-level block,
  `--site-surface` for a surface-level band) — never leave it transparent.
  Reason, and it is a hard one: D1 is `fixed` while an aurora is sized in
  percentages of its own box, so the lattice's phase against the aurora's peak is
  a free variable in viewport width. Let the two composite and the 0.046 ceiling
  becomes a coin-flip per width, unwinnable by tuning `--site-grid-line` (proved:
  `0.045` breached, `0.02` breached one width later — TASK-007 §FQ24). With the
  parent opaque, D1 never reaches the aurora and the ceiling holds **by
  construction at every width**. `HomeStatement .band` already did this with
  `--site-surface`; `HomeHero .hero` and `RouteHero .hero` are being brought in
  line. **Do not put the background on `.aurora` itself** — it is `inset: 0`
  inside `.band` too and would repaint that band's surface as canvas (an R6
  regression). Consequence, accepted: the lattice does not read behind an aurora
  block, and in exchange `--site-grid-line` stays at its designed `0.045`
  everywhere else instead of being tuned toward invisibility. Owner's eye: SQ9.
- **Reduced motion.** D5 is the only motion. It carries the same
  `prefers-reduced-motion: reduce` opt-out as Home's hero. D1/D2/D3 are static
  and must not acquire an animation.
- **Long Thai lines.** `PullQuote` already caps its measure; the two new
  placements must still be checked at 360px width.
- **Fixed-layer cost.** D1 is one fixed element for the whole document, not one
  per section — a per-section version multiplies paint area for no visual gain.
- **Stacking (corrected 2026-09-02, Sober).** D1 sits at **`z-index: -1`**, not
  `0`. A *positioned* element with `z-index: 0` paints in step 8 of CSS painting
  order — **above** the in-flow content of non-positioned block-level descendants
  (step 4) — so `0` would have put the lattice on top of the page. `.shell` sets
  no `z-index`/`transform`/`filter`/`opacity`, so it creates no stacking context
  and a negative-z child paints below the page content and above the canvas
  background `body` propagates. The header keeps
  `--site-z-header`, the skip link `--site-z-skip-link`. No new stacking layer.
- **Client boundaries.** `PortfolioContent`, `BlogContent`, `ContactForm` and
  `SiteHeader` stay the only `"use client"` files. No new one is introduced.

## Non-functional

- **Build (R8):** `npm run build` completes with no errors and no new warnings;
  all six routes serve on `npm run dev` with an empty console; every nav link
  reaches its route. **No dependency is added.**
- **Contrast:** every text/background pair introduced or changed clears WCAG
  1.4.3 at its size (4.5:1 body, 3:1 large). Measured and written into the TASK,
  not estimated. Non-text contrast (1.4.11) is *not* adopted here — same scope
  limit as SPEC-001.
- **Keyboard and semantics:** all existing `aria-*`, heading order, `lang`
  attributes, focus order and the skip link are preserved on all six routes. A
  restyle that breaks a landmark or a heading level fails review.
- **Performance:** no full-bleed `filter: blur()`, no looping animation, no image
  asset, no font added.

## Tasks

TASK-006 and TASK-007 are both **DONE** (reviewed 2026-09-02). Together they are
the foundation layer that TASK-008/009/010 depend on. **TASK-008..011 were
written 2026-09-02 and are `TODO` with Fern.** 008, 009 and 010 touch disjoint
files and are independently startable; the intended order is 008 → 009 → 010 →
011 because there is one engineer, not because of a dependency. **Only TASK-010
may edit `theme.ts`.**

- **TASK-006** — ✅ **DONE 2026-09-02** — Token + theme layer: new CSS variables,
  the four component skins, chip/control radius language (`TechChip` only). No
  route markup. **One part is UNVERIFIED, by construction, not by omission:** the
  `Modal` skin's ground, edge, header and overlay — no modal mounts on `develop`
  (SQ7). (depends on: —) → `tasks/TASK-006-token-theme-step-up-layer.md`
- **TASK-007** — ✅ **DONE 2026-09-02** — Shared devices: `MachineGround` in `SiteShell`,
  `AuroraBackdrop` `route` variant, `GlassPanel` `tone` prop, `RouteHero`;
  includes the luminance measurement against the 0.046 ceiling and a Home
  non-regression pass. **Also mounts `RouteHero` on About's opening block only**,
  as the pilot — added so D2 and D5 are actually rendered and measurable inside
  the task that builds them; the rest of About stays in TASK-008.
  (depends on: TASK-006) → `tasks/TASK-007-shared-step-up-devices.md`
- **TASK-008** — About + Services rebuild, incl. q3, q1 and D4 on Services'
  existing `step.step` numerals. About's opening block is already on `RouteHero`
  from TASK-007; Services' is not. **SQ7 gate:** About's `ImageLightbox` is a
  `Modal`, so any lightbox look in this task is unverifiable until SQ7 clears —
  the task will say so rather than let it be ticked from the code.
  **Also carries two items handed over from TASK-007 (2026-09-02):** (a) fix the
  **pre-existing `H2 → H4` heading skip** in `AboutValues.tsx:19` (`order={4}` →
  `order={3}`) and re-verify `/about`'s outline — Fern correctly refused to fix
  another task's file, and correctly left TASK-007's box unticked; (b) **measure
  and report the route's opening-block height** (SQ8).
  (depends on: TASK-007) → `tasks/TASK-008-about-services-rebuild.md`
  **Written 2026-09-02.** Two SA calls made while cutting it, both recorded in
  the task: About's certificates and testimonials are **deliberately unchanged**
  (they carry no retired pattern and no card surface — wrapping bare images in
  glass would be invention, not R1); and `ServicesTable` **stays a table** (see
  §Flow item 2 above).
- **TASK-009** — Portfolio + Blog rebuild, incl. `ProjectModal`, `BlogFilter`,
  `BlogList`. **SQ7 gate: the same, and harder here** — `ProjectModal` *is* the
  Portfolio detail view. Also carry TASK-006 §Review's note that the modal
  overlay comes from `defaultProps.overlayProps`, which a consumer passing its
  own `overlayProps` would replace wholesale. (depends on: TASK-007)
  → `tasks/TASK-009-portfolio-blog-rebuild.md`. **Written 2026-09-02**, and it
  carries three things found in the code while cutting it: (a) a **new
  pre-existing heading skip, `H1 → H3`**, at `PortfolioGrid.tsx:19` — same class
  as About's, fixed to `h2` in the task; (b) `RouteHero` is rendered from
  `app/portfolio/page.tsx` and `app/blog/page.tsx`, **not** from inside the
  `"use client"` content components, so the opening block stays out of the
  client bundle; (c) `BlogList` rows use `tone="plain"` — the circuit edge marks
  a thing, and a column of article rows is a stream.
- **TASK-010** — Contact rebuild: channels, FAQ, form skin only. **Carries three
  theme follow-ups decided at TASK-006 review (FQ14, FQ17, FQ18), all in
  `theme.ts`, none of them route CSS:** (a) success `Alert` foreground
  (`--alert-color`, and so `IconCircleCheck`) re-pointed to the accent so the
  control is one hue — measured on the running page, under 4.5:1 is a
  stop-and-ask; the red error alert keeps red ink. (b) the alert wash keyed on a
  **positive** discriminator (`color === 'green'`) instead of "not red".
  (c) accordion control hover/focus grounds read a token instead of Mantine's
  opaque `--mantine-color-dark-6`; no new hex, contrast measured. Also removes
  `ContactFaq.tsx:20`'s `variant="default"` prop. (depends on: TASK-007)
  → `tasks/TASK-010-contact-rebuild-theme-followups.md`. **Written 2026-09-02.**
  One thing the task names that the SPEC did not: the success/error `Alert` only
  renders **after a submit**, and submitting sets `window.location.href` to a
  `mailto:` URL — so if (a) cannot be rendered safely in a session it is
  reported computed-only and declared **UNVERIFIED**, never ticked from source.
  Also carries **T4, added by me on 2026-09-04 at the TASK-010 review** (from
  Fern's FQ34): the input placeholder measures **4.28:1** on `--site-surface`,
  under the 4.5 bar. §Non-functional binds every pair this SPEC *changed*, and
  TASK-006 changed that pair's ground when it set `--input-bg`, so the repair is
  in scope and `theme.ts` is this task's alone — one property,
  `--input-placeholder-color: var(--mantine-color-dimmed)`, on `TextInput` and
  `Textarea`. **REWORK 2026-09-04:** T3 came back unimplemented because a theme
  `styles` value cannot carry `&:hover` (FQ32) — mechanism now decided (scope
  `--mantine-color-dark-6` in the Accordion `vars`), see §Retired patterns.
  **DONE 2026-09-04** on round 2: T3 and T4 landed, FQ33's clause corrected, and
  the theme diff is four hunks with both resolver blocks byte-identical to HEAD.
  Four checks stay **UNVERIFIED** and are carried in TASK-011 §7 + SQ8's fourth
  eye — T1's rendered alert, the submit loading label, the form's `mailto:`
  identity, and the accordion's rendered open/close and hover ground.
- **TASK-011** — ✅ **DONE 2026-09-04** (reviewed by Sober; 0 files changed,
  25/39 ticked, 5 unticked as findings, 9 carried UNVERIFIED). It closes
  SPEC-002. Headline results: **R4 satisfied more strictly than written** — five
  routes byte-identical to `46aef59` at both viewports, `/contact` differing by
  exactly FQ31's three label cases; **DEF-1's box proved by A/B**, 9 images at 0×0
  on HEAD and 0 now; **the 0.046 ceiling closed**, 7 blocks × 3 widths, worst peak
  0.04099, D1 delta 0 in all 21; **SQ8's fifth height in** (`/services` 369.77 at
  360). Three findings placed rather than absorbed: FQ36 → the human, FQ37 →
  SQ11, FQ38 → SQ12 + SQ8's sixth eye. Site-wide acceptance sweep: six routes, build, console, links,
  retired-pattern grep, quote count and character check, contrast table, 360px
  and 1280px passes. (depends on: TASK-008, TASK-009, TASK-010, **TASK-012** —
  added 2026-09-04: the sweep reads the state DEF-1's repair creates)
  → `tasks/TASK-011-site-wide-acceptance-sweep.md`. **Written 2026-09-02**, and
  it also collects the five opening-block heights SQ8 is waiting on, re-runs the
  0.046 ceiling check across all seven aurora blocks, and carries the
  UNVERIFIED list forward explicitly so silence is never read as a pass.

### Reopened 2026-09-05 — three more tasks, all from the owner's answers

SPEC-002 was closed by TASK-011 on 2026-09-04. It reopens because the owner
answered **Q23**, **Q24** and **Q19** on 2026-09-05 and all three land in this
SPEC's routes. TASK-013, 014 and 015 touch **disjoint files** and have **no
dependencies on each other or on anything else** — Fern may take them in any
order and may bring all three to REVIEW in one session; I will review them
together. None of them is a REWORK of an earlier task, and none reopens one.

- **TASK-013** — **DEF-2**: the Home hero must fit above the fold again at
  360x740 (`Q23 = แก้ก่อนส่ง`). Mobile-only CSS in `HomeHero.module.css`;
  everything at >= 48em is frozen because the owner ticked AC1/AC2 on the
  desktop look on 2026-09-05. **Gates REQ-002 AC3**, which ticks only on a QA
  re-run of REGRESSION H8. Provenance stays formally UNKNOWN; what I *can* show
  from source and `git` is that this file's layout has been unchanged since
  `566d466` (2026-08-30) and REQ-002 added two lines to it that change no box
  metric — that narrows where to look, it does not name a cause.
  (depends on: —) → `tasks/TASK-013-def2-home-hero-mobile-fold.md`
- **TASK-014** — **DEF-3**: the `/services` scroll affordance
  (`Q24 = ใส่สัญญาณเลื่อน`), per the decision block above. Gates no AC, but
  DELIVERED must not be read as "nothing outstanding on a phone" while it
  stands. (depends on: —)
  → `tasks/TASK-014-def3-services-table-scroll-affordance.md`
- **TASK-015** — remove the dead `ColorSchemeToggle` and its `ui` barrel
  re-export (`AC7 = เอาออก`), per the colour-scheme decision above.
  **Changes nothing rendered** and therefore does **not** implement AC7 — that
  is QA's rendered check on the five non-Home routes. Its measurable payoff is
  **SQ11**: it removes the barrel's only `'use client'` member, so the build
  numbers either move or they do not, and either answer settles the lead.
  (depends on: —) → `tasks/TASK-015-remove-dead-colorscheme-toggle.md`

**All three reviewed `DONE` by Sober on 2026-09-05**, in one review hop as
foreseen above — TASK-013 (+28 lines, all inside `@media (max-width: 47.99em)`;
118px reclaimed against an 85px budget), TASK-014 (mechanism 2a, CSS only, `.tsx`
diff empty), TASK-015 (three paths, greps 0/0, `tsc` 0). Scope, diffs, greps and
`tsc` were re-run by me in the tree rather than read off the notes. **SPEC-002's
design is now closed again; what remains on these three is not SA work but QA's
rendered checks** — H8 (AC3), S14 (DEF-3) and the five-route look (AC7) — plus
one new desktop eye on `/services` at 1280 (TASK-014 §Review carry (a)), all
routed to Porter. Nothing here changes REQ-002's status: it stays `SPEC_DONE`
with AC3/AC7/AC8 open.

## Questions

### To Porter — SA decision notices and open calls.

SQ1-SQ6 block nothing. **SQ7 (added 2026-09-02) is different: it needs an
answer** — it does not stop TASK-007 starting, but it gates what TASK-008 and
TASK-009 can ever be *verified* to look like.

- **SQ1 — Q19's premise has already moved (a fact to relay, not a decision).**
  Dark is forced globally in the shipped build (`UIProvider.tsx`, `layout.tsx`)
  and the toggle is not mounted anywhere, so the five routes have **no**
  light/dark toggle today. This SPEC leaves that untouched. If the owner answers
  Q19 "they keep it", that is a light scheme that has never been designed — new
  REQ-level work, not a tweak. He should know what the site does now before he
  answers.
- **SQ2 — is a position-derived ordinal a "new string" under R4?** Several
  layouts read better with an index (`01`, `02`) on cards that carry no number in
  content — About's experience entries, Portfolio's grid. Services' process steps
  are safe (`step.step` already exists in `constant/content/services.ts`).
  **I have designed ordinals OUT and will not add one until you answer**, because
  a rendered numeral is user-visible text and R4 is absolute. Not blocking.
  - **Update 2026-09-02, cutting TASK-009 — my premise was wrong, and this is a
    fact from the build, not a decision I am taking.** Position-derived ordinals
    **already ship**: `PortfolioGrid.tsx:20` renders
    `String(index + 1).padStart(2, '0')` on `/portfolio` today (pre-existing,
    nothing to do with this REQ), and `HomeCapabilities.tsx:26` renders the same
    expression on Home, shipped under SPEC-001 and accepted by the owner in
    REQ-001. So the question is not "may a numeral appear" — one already does,
    on an accepted page.
  - **What I have done with that, and it is deliberately the smaller half:**
    existing ordinals are **kept byte for byte** (deleting `.index` would remove
    user-visible text, which R4 forbids exactly as firmly as adding it), and
    **no new ordinal is added anywhere** until you answer. I am not reading the
    accepted Home page as a licence to add numerals elsewhere — that would be
    inferring a rule from a layout, which is not mine to do. Still not blocking.
- **SQ3 — q1 and q3 go live on About and Services** (REQ-002 R5 permits the
  distribution; one quote per route, never four on a page). Their **English is
  still unconfirmed by the owner** — REQ-002 R5 says you put it to him at review.
  Flagged now so it is not discovered at acceptance. Removing them is a two-line
  revert.
- **SQ4 — Q18 costs this SPEC nothing either way.** Nothing here writes, implies
  or displays a claim that he works in AI / robotics / IoT; the direction is
  carried entirely by ground, edge, motion and control skin. Whichever way he
  answers, no task above changes.
- **SQ5 — a risk to name, not a scope grab.** Restyling Portfolio and Blog makes
  their content *more* prominent, and he has already said that content is out of
  date (N5, held on Q20/Q21). This SPEC changes no words, so it cannot fix that —
  but he may read "the site looks bolder and still says the old things" at AC2.
  Your call whether he hears that before, or at, review.
- **SQ6 — imagery is deliberately absent.** The AI/robotic/IoT reading here is
  built from CSS only, because the repo has no image assets for it and R4 forbids
  any role sourcing or generating one. If his AC2 answer is "still not bold
  enough", the next lever is **his own images** — a DATA REQUEST for files, which
  I have not raised because nothing in this SPEC is blocked on it.
- **SQ7 — a functional defect on `develop` that is outside REQ-002, and that I
  will not fix on my own authority. THIS ONE NEEDS AN ANSWER.** Fern found, in
  passing while building TASK-006: **no `Modal` and no `Drawer` ever opens on
  the site.** Clicking a Portfolio card, an About/Testimonial lightbox, or the
  mobile burger flips the React state to `true`, but Mantine never mounts the
  content — the portal root stays empty. **It is not ours:** he restored both of
  his changed files to pristine `develop` and it still does not open. So today
  the site has **no Portfolio detail view, no image lightbox, and no mobile
  navigation** on any viewport where the burger is the menu.
  - What it costs REQ-002: TASK-006's `Modal` skin is UNVERIFIED, and TASK-008
    (About lightbox) + TASK-009 (`ProjectModal`) inherit that.
  - **What I need from you (two things):** (1) the owner's decision — is fixing
    this in scope now, as its own defect REQ/TASK, or does REQ-002 ship visual
    only with the modal look unverified? (2) an **independent QA reproduction**
    — Tanya is yours, not mine to task; one local run confirming the three
    triggers on a clean checkout would turn one engineer's report into a
    verified defect.
  - One dated fact, offered as timing only, **not** as a claim about anyone's
    commits (the standing rule holds — I am pointing at the build, not at
    history): the drawer checks in TASK-003/TASK-005 (#18-19) passed on
    2026-08-30, so the behaviour changed at some point after that.
  - **A candidate mechanism, found 2026-09-04 (TASK-010 FQ35) — evidence for
    Tanya, not a verdict from me.** Fern's harness **never runs an animation
    frame**: `document.visibilityState` is `"hidden"` whether or not the pane is
    fronted, `requestAnimationFrame` fires no frame within 1500 ms, and every
    screenshot comes back a blank page-ground frame. Measured consequence on
    `/contact`: a real trusted click on an accordion control **does** flip
    `aria-expanded` to `true` and the panel content **is** in the DOM, but the
    panel stays `height: 0; display: none` — Mantine's `Collapse` entered the
    opening state and its rAF-driven step never ran. Every Mantine open (Modal,
    Drawer, Accordion) is rAF-driven, so **this would produce exactly the
    "flips to true, never mounts/paints" symptom SQ7 reports, and it fits
    Tanya's CANNOT_REPRODUCE in a real visible browser.** It is a candidate, not
    a finding: TEST-003 is the run that can confirm or kill it, and hers is the
    verdict. **The gate does not move on this** — Sober's gate-lift call stays
    its own hop after TEST-003.
  - Second consequence, routed to SQ8: the same block is why below-the-fold
    screenshots come back blank, so **nobody has laid eyes on the rebuilt
    `/contact` panels either**.
  - **A second data point for the same candidate, from the TASK-012 review
    (2026-09-04) — an observation, not a verdict, and the gate still does not
    move.** Fern clicked an `ImageLightbox` trigger on `/about` and waited: nine
    `mantine-Modal-root` divs are in the DOM and **empty** — the root portal
    mounts and resolves its size vars (`--modal-size`, `--modal-y-offset`,
    `--mb-z-index: 200`), but no `Modal-content` and no `.full` child ever
    appears. That shape says the `Modal` *root* renders correctly and only the
    transitioned content is missing, which is what the no-animation-frame
    mechanism predicts and is **not** the shape of a broken `Modal` skin. It is
    consistent with the `/contact` `Collapse` reading above and with Tanya's
    CANNOT_REPRODUCE. **Still a candidate mechanism**: TEST-003 on a real
    `next build` + `next start` is the run that can confirm or kill it, and the
    verdict is Tanya's. Porter: this is FYI for TEST-003, not a change of ask.
  - Meanwhile: **no role works around it from a route file.** If the answer is
    "fix it", it reaches Fern as a TASK from me.
- **SQ8 (added 2026-09-02) — NOT blocking, but the owner should see it before
  five routes inherit it: the shared route opening block is 1243px tall on
  `/about`.** This SPEC designed D2 as "a quieter opening" on the premise that a
  route's first block is much shorter than Home's full-viewport hero. Measured on
  the built pilot at 1280×800 it is **1243px — taller than Home's 800px hero**,
  because About's `<h1>` renders at the display scale (**136px**) and the title
  wraps to five lines. **This is pre-existing, not caused by the rebuild**: the
  same heading rendered at the same scale there before TASK-007, which changed no
  heading level and no string, and the block clears the contrast ceiling. I have
  **not** changed the aurora box and **not** touched the `h1` scale — that scale
  is REQ-001-accepted, so shrinking it is a scope call, not an SA tweak.
  - **The ask is an eye, not a decision from me:** is "every route opens with a
    screen-and-a-half of title" what the owner wants? TASK-008/009/010 will each
    measure and report their own opening-block height, so the answer can be given
    once, on five real numbers, instead of guessed now.
  - **Three of the five numbers are in (2026-09-04, Sober, from TASK-009).**
    At 1280×800: `/about` **1243**, `/portfolio` **992.81**, `/blog` **867.70**.
    At 360×740 `/portfolio` and `/blog` are both **415.67** (both `h1`s wrap to
    exactly four lines). **The fifth is in too (2026-09-04, from TASK-010):
    `/contact` 742.59 at 1280×800 and 371.52 at 360×740.** Only `/services` is
    still unmeasured; it lands with TASK-011.
  - **A second, smaller eye-check folded in here rather than asked separately
    (TASK-009 FQ29):** the gap between the opening block and the first content row
    is **not equal across routes** — `/portfolio` 112px, `/blog` 104px,
    `/services` 0px. The difference is a pre-existing `margin-top` on the content
    partials that no TASK names; **I have deliberately left all three alone**, so
    nothing is blocked. If the owner wants the three openings flush it comes back
    as one line of scope for TASK-011, never as a fix improvised mid-task.
  - A **third eye check** for QA, added 2026-09-04 from TASK-009: Fern's browser
    pane returned blank frames for every below-the-fold capture, so **nobody has
    seen the rebuilt `/portfolio` cards or `/blog` rows** — and, since TASK-010
    hit the same blank frames, **nor the rebuilt `/contact` panels**. Three
    routes, one ask; the cause is now named (TASK-010 FQ35, the harness that
    never runs an animation frame — see SQ7 above). Their geometry, ground,
    border and node dot are verified numerically (9 cards, 516×294 at 1280, glass
    fill and 20px radius present) and every contrast pair clears — so this gates
    nothing, and I am not treating "unseen" as "wrong". It is simply the one thing
    measurement cannot answer.
  - A **fourth eye check** for QA, added 2026-09-04 at the TASK-010 round-2
    review, and the only one that is an *interaction* rather than a look: on
    `/contact`, **does each FAQ accordion item open and close** (mouse and
    keyboard, focus ring visible), **and is its new hover ground perceptible?**
    T3 is verified as a cascade — the control resolves the accent wash, the
    document root is unchanged, the label reads 14.42:1 on it — but the same
    harness that returns blank frames also runs no animation frame and refuses
    to scroll, so nobody has seen it paint. Two numbers cannot answer "is a 10%
    wash enough of a hover cue". **This is an `Accordion`, not a `Modal`** — SQ7
    does not cover it, and if it turns out not to open at all that is a new
    finding, not the SQ7 defect. While she is on that page: the form's three
    fields accepting input and the submit button's **loading label**, which also
    stayed unverified (no real submit was fired, deliberately — a submit hands
    the run to a `mailto:` client). None of this gates TASK-010, which is DONE.
  - A **fifth eye check** for QA, added 2026-09-04 at the TASK-012 review, and
    the one with the most riding on it: on `/about`, **does the visitor now
    actually see the nine lightbox images** (four certificates, five
    testimonials)? DEF-1's *box* is repaired and proved — `display: block` on
    `.frame`, nine non-zero rects at 1280×800 and 360×740 at the intended
    ratios, and a rendered A/B against HEAD (`inline` + 0.00×0.00 → `block` +
    area). What no one on this team has seen is the **painted image inside that
    box**: the same harness that runs no animation frame also refuses to scroll,
    so the nine lazy images never intersect the viewport and never load. Fern
    decoded all nine assets through the image optimizer instead, so the box, the
    ratio and the asset are each verified — only the paint is not. **This is
    exactly what REGRESSION S13 ("no image at 0x0") already tests**, so the ask
    is a re-run of S13 rather than a new check, and S13's re-run is the
    authoritative confirmation that DEF-1 is closed for the visitor. It does not
    gate TASK-012, which is `DONE`; it gates nobody's work, but the owner should
    not be told "fixed" on a measurement alone.
  - A **sixth eye check** for QA, added 2026-09-04 at the TASK-011 review, and
    the only one that exists because **two of us disagree and neither can settle
    it from here**: on `/contact`, **tab into each of the three form fields
    (Name, Email, Message) and say what you can see** — a ring, a border colour
    change, or nothing at all. Fern measured "nothing at all" (no outline, and
    `border-top-color` `rgb(68,60,92)` at rest *and* focused); my read of
    Mantine's own `Input.css` says the border **should** change to the primary
    fill on focus, and his own harness note says real `Tab` presses did not move
    focus in it, so his "focused" reading may have been taken unfocused. **One
    human eye ends this in five seconds.** The outcome decides which fix is
    needed, so no task is written until it is answered — see SQ12. Do the same on
    the FAQ accordion control while she is there (that ring does resolve, per the
    fourth eye check). **This gates nothing in REQ-002**, which is `SPEC_DONE`.
  - **A seventh, and it is a gap rather than a look: nobody has verified mobile
    navigation.** TASK-011's nav click-through covered 6 header + 5 footer links,
    but only at 1280 — at 360 the links are behind the burger, which opens a
    `Drawer`, which is SQ7's defect. So the 360px nav path is unverified by
    measurement *and* unseen by eye. If SQ7 turns out to be harness-only (as
    TEST-002 suggests), this is the check that proves it for a real visitor.
  - Two other **eye checks** for QA (via you — Tanya is yours, not mine to task),
    both from TASK-007, both cheap and neither gating: (a) with D1's lattice at
    its new alpha, **is the machine ground still visible at all** on the dark
    ground below the fold? Fern and I can measure its luminance but neither of us
    can assert it is perceptible. (b) the **`prefers-reduced-motion: reduce`**
    rendering — the CSS rule is verified present and correct in the live CSSOM,
    but the OS flag could not be emulated in the session, so the render under it
    is unverified (same position TASK-004 took).

- **SQ9 (added 2026-09-02) — NOT blocking, and I have already decided it; this is
  a look-consequence the owner should be told about, not a question I am holding
  work on.** The machine-ground lattice (D1) and the aurora backdrops cannot both
  paint in the same place without putting the contrast ceiling at the mercy of the
  browser window's exact width. I have resolved it structurally: **where an aurora
  paints, the aurora is the ground** — Home's hero block and each route's opening
  block get an opaque background, so the lattice does not read behind them. In
  exchange, the lattice keeps its **designed strength (`0.045`) everywhere else**
  instead of being dimmed toward invisibility to survive the ceiling — which is
  the better trade for the device, and it is why SQ8's eye check (a) matters less
  now, not more.
  - **What this changes for a viewer:** Home's first screen and each route's title
    block show the aurora alone; the lattice appears from the next block down.
  - **What I need from you: nothing, unless the owner dislikes it.** No answer
    gates TASK-007. If the owner wants the lattice visible *through* the hero too,
    that is a request to relax the 0.046 contrast ceiling — an accessibility
    decision that is the owner's to make and never mine, and it would need to come
    back as a REQ-002 amendment with the reduced contrast stated plainly.
  - Background, in one line, in case it is asked: two alpha values were tried and
    both failed at some window width; the third try would have failed the same way,
    so I stopped tuning and removed the interaction instead.

- **SQ11 (added 2026-09-04, Sober, from TASK-011 FQ37) — NOT blocking REQ-002,
  but it is a real regression this SPEC's work caused and I am not absorbing it:
  `/blog` and `/portfolio` now ship ~123 kB more First Load JS than HEAD.**
  Measured by building both trees, not argued: `/blog` 159 → **283 kB**,
  `/portfolio` 162 → **284 kB**; the other four routes moved by 1 kB each. The
  shape is the tell — those two routes did not grow, they **joined the ~283 kB
  plateau the other four were already on**, which is one chunk arriving.
  - **Why it does not block:** no SPEC or REQ on this project states a
    performance budget. §Non-functional's Performance clause bars four named
    things (full-bleed blur, looping animation, added image asset, added font)
    and R8 bars an added dependency — `git diff front/package.json front/bun.lock`
    is empty, verified at review. Failing reviewed work against a budget invented
    afterwards would be scope made up after the fact.
  - **Why it still needs a decision:** ~78% more JS on two of six routes of a
    portfolio site is not a rounding error, and it is ours (TASK-009's routes).
  - **A lead, explicitly not a verdict and not an instruction:** at `46aef59`
    neither `app/blog/page.tsx` nor `app/portfolio/page.tsx` imported from
    `@/components/ui`; both now do, for `RouteHero`. That barrel
    (`components/ui/index.ts`) also re-exports **`ColorSchemeToggle`**, which is
    `'use client'` — and the four routes already on the plateau are exactly the
    ones that already touched the barrel at HEAD. Cheap falsification: deep-import
    `@/components/ui/RouteHero` and re-measure. **Nobody implements this off this
    note** — it exists so whoever picks the work starts with a lead, not a search.
  - **UPDATE 2026-09-05 — the named lead above is FALSIFIED. Measured, not
    argued (TASK-015 §Implementation Notes).** Fern ran the cheap falsification:
    `ColorSchemeToggle` is deleted and the `ui` barrel now has **zero**
    `'use client'` members, while `app/blog/page.tsx` and
    `app/portfolio/page.tsx` still import `RouteHero` through it. Two
    `npm run build` runs on a cleared `.next`, only those three paths differing:
    `/` 283→283, `/about` 280→**279**, `/blog` 283→**282**, `/contact` 281→281,
    `/portfolio` 284→284, `/services` 283→283; shared 102 kB and both shared
    chunk hashes identical. **<= 1 kB on any route, not ~123 kB.** The barrel is
    not the cause. **No replacement cause is named** — by Fern or by me — and an
    unnamed cause recorded honestly is better than a plausible one.
  - **What this changes for you: nothing about the ask, only the evidence.** The
    ~123 kB gap is real and still ours; the question is still whether page weight
    is worth a hop at all, and it is still the owner's. What is gone is the cheap
    fix I implied — the next step would be chunk-level attribution (per-route
    build manifest + chunk diff, pre-REQ-002 vs HEAD), a real session. **I am
    writing no task for it**: this project has no performance budget in any REQ
    or SPEC, and inventing one after the fact is the same error I refused above.
  - **What I need from you:** the owner's word on whether page weight is worth a
    hop at all. If yes it becomes one small TASK under a follow-up SPEC (measure →
    change the import → re-measure both routes and all six for regressions); if
    no, it is accepted in writing and closed. Either answer is fine; silence is
    the only outcome I will not treat as a decision.
  - Riding along, same shape and same owner, both **pre-existing and identical at
    HEAD**, both out of §Non-functional's binding (which covers only pairs this
    SPEC introduced or changed): `/contact`'s three required asterisks read
    **4.37:1** (Mantine's `--mantine-color-error` on the page ground) and
    `--site-ink-faint` reads **3.64:1** on the page ground under four lattice
    lines. Both fixes are a token re-mix in `cssVariablesResolver`, which is an SA
    decision needing its own task. Good news on the second: TASK-008/009/010 took
    it from 6 consumers to **one** — `ProjectModal.module.css:55`, inside the
    modal that never opens — so today it renders nowhere a visitor can reach.

- **SQ12 (added 2026-09-04, Sober, from TASK-011 FQ38) — NOT blocking REQ-002:
  the three `/contact` form fields may have no visible focus indicator at all.**
  Half of this is confirmed and half is disputed, and the split matters:
  - **Confirmed by me, statically:** Mantine's `Input.css:191-194` does
    `.m_8fb7ebe7:focus, :focus-within { outline: none; … }`, which outranks our
    `globals.css:84` `:focus-visible` ring on specificity. **The site's focus ring
    genuinely never reaches an input.** Mantine's design substitutes a border
    colour change for the ring it removes.
  - **Not confirmed:** whether that substitute border fires here. Fern measured it
    unchanged; my read of the cascade says it should change (see the inline-`vars`
    correction in §Retired patterns), and his own harness could not move focus
    with a real `Tab`. **I will not resolve it by assumption in either
    direction** — it goes to a human eye as SQ8's sixth check, and only the answer
    decides the fix: "nothing at all" is a WCAG **2.4.7** failure needing a real
    indicator; "the border turns accent" needs a non-text contrast check instead.
  - **Why it does not block:** it is **pre-existing and identical at `46aef59`**
    (measured on both trees), §Non-functional asks that focus *order* be
    preserved — it is — and explicitly does **not** adopt non-text contrast
    (1.4.11). A focus indicator is 2.4.7, outside this SPEC's stated scope.
  - **What I need from you:** nothing until QA answers the eye check. Then one
    word from the owner on whether an accessibility fix outside REQ-002's stated
    scope is wanted now or deferred — the fix lives in `theme.ts`, so it needs a
    TASK under a follow-up SPEC, never an improvised edit.

- **SQ13 (added 2026-09-05, Sober, from TASK-014 FQ41) — NOT blocking anything,
  and NOT a defect: `/services` at phone widths is a layout question the scroll
  signal makes navigable rather than solves.** DEF-3 is fixed as the owner asked
  (`Q24 = ใส่สัญญาณเลื่อน` — a signal, now), and TASK-014 delivers both signals.
  But Fern measured the shape underneath while building it: at 360 the scroller
  is **1156px tall**, one column ("Service") is on screen beside roughly 530px of
  empty rows, and those row heights are set by the two columns that are
  off-screen. So the horizontal scrollbar sits ~1150px below the top of the
  table — on a phone the **edge glow is the primary signal** and the bar is a
  later confirmation.
  - **Why I am not acting on it:** a different `/services` layout at phone widths
    is scope, and scope is the owner's. SPEC-002 §Flow item 2 deliberately keeps
    the route a `<table>` (cards would delete three visible `<th>` strings under
    R4 and break `role="region"`), so "make it a card list on phones" is not a
    call I may make from a build observation.
  - **What I need from you:** put it in front of him **only when he has seen the
    fix** — the honest framing is "the table is now scrollable and says so; it is
    still tall on a phone, do you want the phone layout rethought later?" Not
    urgent, and it must not be presented as DEF-3 being unfinished.

### From Fern

- **FQ19-FQ23 (TASK-007), answered 2026-09-02** — all five answered in
  `tasks/TASK-007-shared-step-up-devices.md` §Questions; TASK-007 unblocked.
  The one with a SPEC consequence is **FQ19**: `--site-grid-line` dark is
  superseded `0.045 → 0.02` (see §Token layer). FQ20 → SQ8 above; FQ21 → an
  item on TASK-008; FQ22/FQ23 confirmed as recorded (UNVERIFIED-by-eye, not
  ticked from code).
