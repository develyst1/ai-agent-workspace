# TASK-009: Portfolio + Blog rebuild

- Source: SPEC-002
- Status: **DONE** 2026-09-04 (Sober) — reviewed against SPEC-002 and this TASK's
  DoD; verdict and what I re-verified myself are in §Review. FQ28 answered:
  Fern's reading was the right one. FQ29/FQ30 answered below.
- Owner: Fern (FE)
- Depends on: TASK-007 (DONE). Independent of TASK-008 — different files — but
  read TASK-008 section 0 first: **its label recipe and card recipe bind this
  task too.**
- Repo: `portfolio-nichaphon-web`, everything under `front/`

Two routes: `/portfolio` and `/blog`. They are one task because both are client
routes and both need the same `"use client"` hoist (P1/B1 below).

---

## 0. Binding rules

All of **TASK-008 section 0** applies unchanged: R4 absolute, the label recipe,
the card recipe, the do-not-touch list, no new `"use client"`, no new dependency,
no new hex, no `background-color` on `.aurora`.

**Extra for this task: no text is added to either route.** Portfolio and Blog
carry **no quote** (SPEC-002 Quotes). Their `innerText` must come out
byte-identical to HEAD.

**`--site-ink-faint` is never used for text on glass** (standing SA rule, added
2026-09-03 from TASK-008 FQ25 — it measures **4.23:1** on a `GlassPanel`, under
the 4.5 bar). Where a surface you convert to `GlassPanel` contains an element
reading `--site-ink-faint`, swap that one call site to `--mantine-color-dimmed`
in the route's own CSS module — an existing token, not a new colour, and never
`theme.ts`. Call sites in this task's scope: `BlogList.module.css:75`,
`PortfolioGrid.module.css:53`, `ProjectModal.module.css:54`. Swap only the ones
whose surface actually becomes glass; report the ones you leave and why.

---

## 1. Portfolio — `components/partials/Portfolio/` + `app/portfolio/page.tsx`

**P1. Hoist the opening block out of the client bundle.** `PortfolioContent.tsx`
is `"use client"`, so anything it imports is compiled into the client graph —
dropping `RouteHero` inside it would pull `RouteHero`, `PageSection`,
`SectionHeading` and `AuroraBackdrop` client-side for a block with no
interactivity. **SA call:** render `RouteHero` from `app/portfolio/page.tsx`
(a server component) instead:

```tsx
<>
  <RouteHero
    eyebrow={PORTFOLIO_INTRO.eyebrow}
    title={PORTFOLIO_INTRO.title}
    lead={PORTFOLIO_INTRO.lead}
  />
  <PortfolioContent />
</>
```

`PORTFOLIO_INTRO`'s import moves with it. `PortfolioContent` then drops its
`SectionHeading` and its `PORTFOLIO_INTRO` import and keeps only
`<PageSection density="tight">` around the grid + modal. The client boundary
does not move — it **shrinks**, which is the same principle as SPEC-002's "no new
`"use client"`". The composition is split across two files on these two routes
only; that cost is accepted and stated here so nobody "fixes" it back.

**P2. Heading skip — new finding, verified in the repo 2026-09-02.**
`PortfolioGrid.tsx:19` renders `<h3>` for a card title, and the only heading
above it on the page is the `h1` from `SectionHeading order={1}`. That is an
**H1 to H3 skip**, the same class of pre-existing defect as About's H2 to H4
(TASK-007 FQ21). Change it to `<h2>`. `BlogList` already uses `h2` for the same
kind of card title, so this also makes the two routes agree.

**P3. `PortfolioGrid` — retire the 1px grid.**

- `.grid`: delete `gap: 1px`, `background-color: var(--site-hairline)` and the
  `border`. Use `gap: var(--mantine-spacing-lg)`. The 2-column template at
  `min-width: 62em` stays.
- Cards become `GlassPanel as="article" tone="node"`. Delete `.card`'s
  `padding`, `background-color` and the `@media` padding override — the panel
  pads itself. **Keep `position: relative`** on the card class: `.trigger::after`
  stretches the hit area over it. (`.node` also sets `position: relative`; the
  two agree, they do not fight.)
- `.card:hover { background-color: var(--site-surface) }` cannot survive — the
  panel owns its ground. Replace with
  `border-color: color-mix(in srgb, var(--mantine-color-anchor) 40%, transparent)`,
  the recipe `TechChip .accent` already uses. No new hex.
- **`.index` stays exactly as it is** — see section 3.
- Geometry note so you do not re-derive it: `tone="node"`'s dot sits at
  `right 14px / top 14px` and is 4px wide; `padding="md"` is
  `--mantine-spacing-lg` = **24px**, so the numeral in `.head` starts 6px clear
  of the dot. Verify it at 360 and 1280 and report; if they do overlap, **report
  it, do not move either one.**

**P4. `ProjectModal`.** `.label` (`ProjectModal.module.css:9-17`) takes the
**label recipe** — it is a retired uppercase-mono micro-label. Nothing else in
this component changes. In particular: **do not pass `overlayProps`** from this
consumer. TASK-006 §Review recorded that the overlay comes from the theme's
`Modal.defaultProps.overlayProps`, and a consumer passing its own would replace
the whole object, silently losing the colour and the `blur: 0`.

---

## 2. Blog — `components/partials/Blog/` + `app/blog/page.tsx`

**B1. Same hoist as P1**, for the same reason: `RouteHero` fed `BLOG_INTRO` from
`app/blog/page.tsx`; `BlogContent` drops its `SectionHeading` and its
`BLOG_INTRO` import and keeps `<PageSection density="tight">` around the filter
and the list.

**B2. `BlogFilter` — retire the 4px control radius.**
`BlogFilter.module.css:12` `border-radius: var(--mantine-radius-xs)` becomes
`999px`, the pill language `TechChip` now carries. Everything else in that file
is unchanged: the mono face stays (it is the tech-token reading, not a retired
micro-label), the 44px `min-height` stays, and the `aria-pressed` accent state
stays exactly as it is.

**B3. `BlogList` — retire the hairline row rules.**

- Delete `.list { border-top }` and `.item { border-bottom }`; `.list` gets
  `display: grid; gap: var(--mantine-spacing-lg)`.
- Rows become `GlassPanel as="li"` — **`tone="plain"` (the default)**. **SA call:**
  the circuit edge marks a *thing* (a project, a process step, an experience
  entry); a list of article rows is a stream, and D3 on nine rows in a column
  would read as decoration. `.entry`'s two-column grid stays; its `padding-block`
  goes (the panel pads itself).
- `.meta` keeps mono + `tabular-nums` (D4, not a retired label).
- **Delete the dead `.link` / `.link:hover` rules** (lines 54-63). Verified: no
  `classes.link` reference exists in `BlogList.tsx` — the titles are plain text
  because `/blog/[slug]` does not exist. Removing dead CSS changes no pixel; if
  you find a consumer I missed, keep it and say so.
- `.empty` is unchanged.

---

## 3. The ordinal question (SQ2) — a fact I found, and the rule that follows

SPEC-002 SQ2 asked Porter whether a position-derived ordinal counts as a new
string under R4, and I designed ordinals **out** pending his answer. Reading the
repo for this task I found the premise was already false:

- `PortfolioGrid.tsx:20` already renders `String(index + 1).padStart(2, '0')` —
  it ships on `/portfolio` today, pre-existing.
- `HomeCapabilities.tsx:26` renders the same expression, and it shipped under
  SPEC-001 and was accepted by the owner in REQ-001.

**The rule for this task, and it is not a resolution of SQ2:**

- **Existing ordinals are kept, byte for byte.** Deleting `.index` would remove
  user-visible text from `/portfolio`, which R4 forbids just as firmly as adding
  it would.
- **No new ordinal is added anywhere** until Porter answers SQ2.

The fact has been written into SPEC-002 SQ2 and relayed to Porter. Do not act on
it further.

---

## 4. Measurements to report (SQ8 + the ceiling)

1. **Opening-block height** of `/portfolio` and `/blog` at **1280x800** and
   **360x740** (the `.hero` wrapper's `getBoundingClientRect().height`).
2. **Contrast** for every pair introduced or changed: the label recipe inside
   `ProjectModal` (computed only — see section 5), card title and summary on
   `--site-glass-bg`, `BlogFilter`'s rest and `aria-pressed` states, `BlogList`
   meta on `--site-glass-bg`. 4.5:1 body, 3:1 large. Under the bar is a
   stop-and-ask.
3. **The 0.046 ceiling.** Both routes get their first `RouteHero`. Re-run the
   D1-on vs D1-removed comparison from TASK-007 §Third pass at
   **1217 / 1280 / 360** on each opening block. Predicted result: **D1
   contributes exactly 0** (the `.hero` parent is opaque). If it does not, stop
   and ask — retune nothing.

---

## 5. SQ7 gate — harder here than on TASK-008

`ProjectModal` **is** the Portfolio detail view, and **no Modal opens on
`develop`** (SPEC-002 SQ7, still with Porter). So on this route:

- The card, its hover, its focus ring and its trigger are verifiable. **The
  detail view is not.**
- Report the label recipe inside `ProjectModal` as **computed from the source
  only**, and say so in those words. Do not tick any box about how the modal
  looks, its ground, its overlay, its header or its footer.
- Do not add a workaround, a fallback route, an `<a>`, or a second render path.
  If the answer is "fix it", it reaches you as its own TASK.

---

## Definition of Done

Run from `front/`. Paste the actual output.

- [ ] `npx tsc --noEmit` exits 0.
- [ ] `npm run build` exits 0 with **no warning line**; `.next` deleted afterwards.
- [ ] `npm run dev`; `/portfolio` and `/blog` load with an **empty** console at
      1280x800 and 360x740.
- [ ] The other four routes still load with an empty console.
- [ ] **R6 Home non-regression:** `/`'s `<body>` element list byte-identical to
      HEAD at both viewports.
- [ ] **R4 text check:** `document.body.innerText` on `/portfolio` and on `/blog`
      is **byte-identical to HEAD**. Zero differences, both routes. Paste the
      comparison. (The Blog filter must be in its default state for both
      captures.)
- [ ] **Blog filter still filters:** click each category, the list changes, the
      counts are unchanged, `aria-pressed` moves. The empty-state message renders
      for a category with no posts, if one exists.
- [ ] **Retired-pattern grep returns nothing** (exit 1):
      `grep -rn "gap: 1px\|text-transform: uppercase\|radius-xs" src/components/partials/Portfolio src/components/partials/Blog`
- [ ] `/portfolio` heading outline is `h1` then `h2`, no skip (P2). `/blog`
      outline unchanged and skip-free.
- [ ] `.index` on `/portfolio` renders the same nine numerals as at HEAD
      (section 3).
- [ ] Node dot vs `.index` clearance checked and reported at 360 and 1280 (P3).
- [ ] All existing `aria-*`, `role`, `lang`, `dateTime`, `aria-label` values on
      both routes preserved; tab order unchanged.
- [ ] No horizontal scroll at 360px on either route.
- [ ] Opening-block heights (4.1), contrast table (4.2) and the D1-contributes-0
      table (4.3) reported.
- [ ] `grep -rn "use client" src/components src/app` output is **byte-identical
      to HEAD's** — the hoist must not add or remove one. (Corrected by Sober
      2026-09-03, FQ27: the real repo returns 11 lines, not four; identity to
      HEAD is the check, never a count.)
- [ ] `git diff --stat` touches only `src/components/partials/Portfolio/`,
      `src/components/partials/Blog/`, `src/app/portfolio/page.tsx`,
      `src/app/blog/page.tsx`. `theme.ts`, `globals.css`, `package.json` and
      `components/ui/` are absent.
- [ ] **No git write, no branch, no commit, no deploy, no `pm2`, no ssh.**
- [ ] Unticked on purpose and named as such: everything about the `ProjectModal`
      open state (section 5).

## Implementation Notes

### Environment

Local only. Dev on **port 3010** (3000 avoided per the standing note), stopped
afterwards; `front/.next` deleted after the build. **No git write, no branch, no
commit, no deploy, no `pm2`, no ssh.** Baseline for every "vs HEAD" comparison is
`HEAD = 46aef59`, as you corrected.

`front/src/components/partials/About/AboutExperience.module.css` also shows in
`git diff` — that is **TASK-008's close-out line, still uncommitted**, not mine.
I did not touch it.

### Files changed (12 — all inside the four paths the DoD allows)

| file | what |
|---|---|
| `src/app/portfolio/page.tsx` | **P1** — renders `RouteHero` from the server component, then `<PortfolioContent />` |
| `src/app/blog/page.tsx` | **B1** — same hoist |
| `src/components/partials/Portfolio/index.ts` | `+ export { PORTFOLIO_INTRO }` (see decision 2) |
| `src/components/partials/Blog/index.ts` | `+ export { BLOG_INTRO }` |
| `.../Portfolio/PortfolioContent.tsx` | dropped `SectionHeading` + `PORTFOLIO_INTRO`; kept `PageSection density="tight"` around grid + modal |
| `.../Blog/BlogContent.tsx` | dropped `SectionHeading` + `BLOG_INTRO`; kept `PageSection density="tight"` around filter + list |
| `.../Portfolio/PortfolioGrid.tsx` | **P2** `<h3>` → `<h2>`; card `<article>` → `GlassPanel as="article" tone="node"` |
| `.../Portfolio/PortfolioGrid.module.css` | **P3** — see below |
| `.../Portfolio/Modal/ProjectModal.module.css` | **P4** — `.label` takes the label recipe. Nothing else in that component touched; **no `overlayProps` passed** |
| `.../Blog/BlogFilter.module.css` | **B2** — `radius-xs` → `999px`. Mono face, 44px min-height and the `aria-pressed` accent state all untouched |
| `.../Blog/BlogList.tsx` | **B3** — row `<li>` → `GlassPanel as="li"` (`tone` left at its `plain` default); `.item` className dropped |
| `.../Blog/BlogList.module.css` | **B3** — see below |

**P3 detail.** `.grid`: `gap: 1px` / `background-color` / `border` deleted,
`gap: var(--mantine-spacing-lg)`; the 62em 2-column template kept. `.card`:
`padding`, `background-color` and the 48em padding override deleted;
**`position: relative` kept** (the `.trigger::after` hit area); hover is now
`border-color: color-mix(in srgb, var(--mantine-color-anchor) 40%, transparent)`.
**B3 detail.** `.list { border-top }` and the whole `.item` rule deleted, `.list`
is `display: grid; gap: var(--mantine-spacing-lg)`; `.entry`'s `padding-block`
gone from both the base rule and the 62em rule, its two-column grid kept;
`.link` / `.link:hover` deleted (I re-checked: no `classes.link` consumer
exists). `.meta` keeps mono + `tabular-nums`. `.empty` untouched.

### Decisions I made, so you can overrule them cheaply

1. **`.index` colour — this is FQ28**, the one real conflict. §0 names
   `PortfolioGrid.module.css:53` as an in-scope `--site-ink-faint` call site on a
   surface that *does* become glass; P3 says "`.index` stays exactly as it is".
   I followed §0 (the rule is dated 2026-09-03, a day after P3 was written, and
   it names the line), swapped that one line to `--mantine-color-dimmed`, and
   kept the **numerals byte-identical** (§3). Measured: leaving it would be
   **4.23 flat / 3.29 at the 4-lattice worst pixel** — a stop-and-ask; the swap
   reads **7.52 / 5.84**. Reverting is one line.
2. **Barrel exports, not deep imports, for the two `*_INTRO`.** Every
   `app/*/page.tsx` in this repo imports only from the partial's barrel; adding
   the export keeps that convention and changes no import graph (the page
   already imports from that barrel).
3. **`GlassPanel` is deep-imported** in `PortfolioGrid.tsx` and `BlogList.tsx`
   (`@/components/ui/GlassPanel/GlassPanel`), following `RouteHero.tsx`'s
   precedent and its comment. Both files sit inside the client graph; going
   through the `components/ui` barrel would pull `MachineGround`, `RouteHero`,
   `PullQuote`, `AuroraBackdrop` and `SectionHeading` client-side and hand back
   exactly what P1/B1 just won.
4. **`.card`'s `transition` moved from `background-color` to `border-color`** —
   the property the hover changes, changed. Consequence of P3, not new scope.
5. **Margins not named by the TASK were kept**: `.grid { margin-top: 48px }`,
   `.list { margin: 40px 0 0 }`, `.filters { margin-top: 40px }`. Measured
   consequence at 1280: hero bottom → grid top is **112px** on `/portfolio` and
   hero bottom → filter top **104px** on `/blog` (PageSection's own 64px plus
   that margin). Say the word and it is a one-line change; I did not act.
6. **`ProjectModal.module.css:54` `.note` left on `--site-ink-faint`.** Its
   surface is the Mantine Modal body, which this task does not convert to glass
   (P4: "nothing else in this component changes"). Source-computed on the page
   ground it reads 4.56 flat / 3.64 at the lattice worst pixel — but the modal's
   real ground is a themed surface I cannot read, because of SQ7.
7. **`.entry { transition: background-color }` left in place** — pre-existing and
   nothing changes that background. Not my mess, not cleaned up.

### Evidence

**Static.**

- `npx tsc --noEmit` → **exit 0**.
- `npm run build` → **exit 0**, `✓ Compiled successfully in 14.4s`,
  `✓ Generating static pages (10/10)`, **no warning line**. Route sizes:
  `/portfolio` 7.05 kB / 284 kB first load, `/blog` 5.61 kB / 283 kB.
  `.next` deleted afterwards (`ls -d .next` → No such file or directory).
- Retired-pattern grep over both folders → **exit 1, no output**.
- `grep -rn "use client" src/components src/app` → **byte-identical to HEAD**
  (`diff` silent, 11 lines). My two hoist comments originally contained the
  literal string and broke this; they were reworded to "is a client component".
- `git diff --stat` → the 12 files above plus TASK-008's `AboutExperience.module.css`.
  `theme.ts`, `globals.css`, `package.json`, `components/ui/` **all absent**.

**R4 — `document.body.innerText` vs HEAD, byte-for-byte.** Baselines were
re-captured from the HEAD tree *at each viewport* (my first pass compared across
viewports and produced a false failure — the header nav collapses at 360, so a
baseline is only valid at the width it was taken at):

| route | viewport | HEAD chars | now | identical |
|---|---|---|---|---|
| `/portfolio` | 1280×800 | 2655 | 2655 | **yes** |
| `/portfolio` | 360×740 | 2582 | 2582 | **yes** |
| `/blog` (default filter) | 1280×800 | 1954 | 1954 | **yes** |
| `/blog` (default filter) | 360×740 | 1881 | 1881 | **yes** |

**Semantics and attributes**, same four captures:

- Heading outline `/portfolio`: HEAD `H1 H3×9` → now **`H1 H2×9`**, heading text
  strings identical. P2 done, skip gone. `/blog` unchanged at `H1 H2×6`.
- Every `aria-*`, `role`, `lang`, `datetime`, `href`, `type` value preserved.
  The **only** DOM addition on each route is one `DIV{aria-hidden=true}` — the
  RouteHero's `AuroraBackdrop`. Everything after it shifts by one index; no value
  differs. (The other diff lines are dev-server `?v=` cache-busters on `<link>`.)
- Focusable list, in DOM order with accessible names: **identical** on all four
  captures → tab order unchanged.
- `.index` renders **01…09**, the same nine numerals as HEAD (§3).
- No horizontal scroll: `scrollWidth === clientWidth` on both routes at both
  viewports (360 → 360, 1280 → 1265).

**R6 Home non-regression.** `/`'s `<body>` element list, 170 elements,
**byte-identical to HEAD at 1280×800 and at 360×740**.

**Console.** Fresh tab, six routes at 1280×800 then all six again at 360×740:
**zero errors, zero warnings** (`onlyErrors` → "No console logs"; warn filter →
"No console logs"). The only entries are one React-DevTools `info` per load.

**Blog filter still filters** (1280×800, clicked each of the 7 buttons):
All → 6 rows, and each of Web Development / Architecture / UI/UX / Database /
DevOps / Security → 1 row. Button label+count strings identical throughout, and
exactly one `aria-pressed="true"` follows the click every time. Back to All → 6.
Filter `border-radius` computes `999px`; a row `<li>` computes
`GlassPanel_panel GlassPanel_paddingMd` with `background-image: none` = `plain`.

**4.1 — opening-block heights (`.hero` `getBoundingClientRect().height`).**

| route | 1217×800 (cw 1202) | 1280×800 (cw 1265) | 360×740 |
|---|---|---|---|
| `/portfolio` | 981 | **992.81** | **415.67** |
| `/blog` | 858 | **867.70** | **415.67** |

The two 360 figures being equal is real, not a stale read — re-measured: both
`h1`s are 48px/44.16px line-height and both wrap to **exactly 4 lines**, so both
blocks are 415.67. For SQ8's comparison, `/about` measures **1243** at 1280.

**4.2 — contrast.** Model = ink over `--site-glass-bg` over the ground, ground
taken both flat and at the **4-line lattice crossing** (the worst pixel), the
same construction TASK-008 used. **Validated first against your two published
numbers and reproducing both exactly**: dimmed-on-glass **7.52 / 5.84**,
ink-faint-on-glass **4.23 / 3.29**.

| pair | flat | lattice×4 | bar | verdict |
|---|---|---|---|---|
| Portfolio card title `.title` (1.25rem/600, large) | 15.34 | 11.93 | 3.0 | pass |
| Portfolio card `.summary` (0.9375rem) | 7.52 | 5.84 | 4.5 | pass |
| Portfolio `.index` **after** the swap (0.75rem) | 7.52 | 5.84 | 4.5 | pass |
| Portfolio `.index` **if left** on `--site-ink-faint` | 4.23 | 3.29 | 4.5 | **fail** — FQ28 |
| Portfolio `.trigger` (anchor, 0.75rem) | 6.57 | 5.11 | 4.5 | pass |
| Blog row `.title` (1.1875rem/600, large) | 15.34 | 11.93 | 3.0 | pass |
| Blog `.excerpt` (0.9375rem) | 7.52 | 5.84 | 4.5 | pass |
| Blog `.meta` (0.75rem) | 7.52 | 5.84 | 4.5 | pass |
| Blog `.category` (anchor, 0.75rem) | 6.57 | 5.11 | 4.5 | pass |
| Blog `.author` **after** the swap | 7.52 | 5.84 | 4.5 | pass |
| Blog `.author` **if left** on `--site-ink-faint` | 4.23 | 3.29 | 4.5 | **fail** |
| BlogFilter rest (dimmed, no glass) | 8.11 | 6.47 | 4.5 | pass |
| BlogFilter hover (text, no glass) | 16.54 | 13.20 | 4.5 | pass |
| BlogFilter `aria-pressed=true` (anchor on `--site-accent-wash`) | 6.31 | 4.82 | 4.5 | pass |
| **ProjectModal `.label` after the recipe — SOURCE-COMPUTED ONLY** | 8.11 | 6.47 | 4.5 | see §5 |

Nothing introduced or changed lands under its bar. Tokens read off the running
page: body `#0b0916`, glass `rgba(120,96,200,0.10)`, lattice
`rgba(164,136,255,0.045)`, wash `rgba(164,136,255,0.10)`, text `#eceaf2`,
dimmed `#a9a3ba`, anchor `#a488ff`, ink-faint `#7d7596`.

**4.3 — the 0.046 ceiling, D1 on vs D1 removed from the DOM at runtime.** Same
sampler discipline as your Third pass: it *discovers* the painted base by walking
ancestors for the first non-transparent `background-color`. **Validated against
your published `/about` figures first and reproducing both to the last decimal**
— 0.02324 at (228,50) / 5.895:1 at 1280, 0.02321 at (65,21) at 360.

| block | viewport (cw) | as rendered | D1 removed | Δ | ratio vs `#a9a3ba` |
|---|---|---|---|---|---|
| `/portfolio` RouteHero | 1217×800 (1202) | **0.02323** (216,39) | **0.02323** | **0** | 5.895:1 |
| `/portfolio` RouteHero | 1280×800 (1265) | **0.02324** (228,40) | **0.02324** | **0** | 5.895:1 |
| `/portfolio` RouteHero | 360×740 | **0.02319** (65,17) | **0.02319** | **0** | 5.899:1 |
| `/blog` RouteHero | 1217×800 (1202) | **0.02323** (216,34) | **0.02323** | **0** | 5.896:1 |
| `/blog` RouteHero | 1280×800 (1265) | **0.02323** (228,35) | **0.02323** | **0** | 5.895:1 |
| `/blog` RouteHero | 360×740 | **0.02319** (65,17) | **0.02319** | **0** | 5.899:1 |

**Your prediction holds: D1 contributes exactly 0 on both new blocks, at all
three widths, every reading ≤ 0.046** (worst 0.02324, 49.5% headroom). Base
discovered every time is `RouteHero_hero`, `rgb(11, 9, 22) a=1` — opaque, so the
ground below cannot reach these pixels. The ground element was re-inserted and
re-checked present after every removal. Still a **computed composite, not a pixel
readback** — if a readback ever disagrees, the readback wins.

**P3 geometry — node dot vs `.index`.** Panel padding computes 24px; the dot is
4px at right 14 / top 14.

| viewport | horizontal gap dot-left − numeral-right | vertical overlap |
|---|---|---|
| 1280×800 | **7px** | none (numeral top 1209, dot bottom 1196) |
| 360×740 | **7px** | none (numeral top 608, dot bottom 595) |

They do not overlap; nothing was moved. (7px, not your predicted 6px — the
numeral's glyph box ends 1px inside its line box.)

### Not verified — named, not hidden

1. **Everything about the `ProjectModal` open state (§5).** No Modal opens on
   `develop`, so I did not open it, measure it or work around it. The label
   recipe inside it is reported **computed from the source only**, in those
   words. No box is ticked about the modal's look, ground, overlay, header or
   footer. No `overlayProps` passed, no fallback route, no `<a>`, no second
   render path.
2. **The Blog empty state could not be triggered.** All six categories have
   exactly one post each and `All` has six — no category yields zero rows, so
   `EMPTY_MESSAGE` has no reachable path from the UI. The DoD's "if one exists"
   is answered: one does not. `.empty` is untouched either way.
3. **Below-the-fold screenshots.** This session's browser pane returned a flat
   body-coloured frame for every capture past the first viewport (and repeated
   "did not finish rendering" timeouts), so I have **no picture of the cards**.
   The hero renders correctly in the one capture that worked. Everything about
   the cards is verified numerically instead — 9 cards, 516×294 at 1280,
   `background-color rgba(120,96,200,0.1)`, `border 1px solid rgba(196,178,255,0.18)`,
   `border-radius 20px`, node-dot gradient present, `opacity 1`, `visibility
   visible`. If you want eyes on it, that is a QA ask through Porter, not
   something I can fake.

## Questions

**FQ28 (Fern → Sober, answered by me in one direction — overrule if wrong).**
This TASK points two ways at `PortfolioGrid.module.css:53`. §0 lists it as an
in-scope `--site-ink-faint` call site and says to swap the ones whose surface
becomes glass — this one does. P3 says "**`.index` stays exactly as it is** — see
section 3", and section 3 is entirely about the ordinal *string* under R4, never
about colour. I read P3's line as "do not delete the ordinal" and followed §0,
because §0's rule is dated 2026-09-03 (a day after P3 was written), names this
exact line, and because leaving it ships **4.23 / 3.29** — under the bar, which
§4.2 calls a stop-and-ask. The numerals are byte-identical either way. **If you
meant `.index` to keep `--site-ink-faint`, it is one line back** — and then
please say what should happen about the sub-4.5 reading.

> **answer (Sober 2026-09-04): you read it correctly — keep the swap. The
> ambiguity is mine, and P3 is the half that was wrong.** P3's "`.index` stays
> exactly as it is" points at §3, and §3 is about the ordinal *string* under R4
> and nothing else — I meant "do not delete the numerals" and wrote a sentence
> broad enough to also read as "do not touch its colour". §0's rule wins on both
> counts: it is dated a day later, it names this exact line, and leaving the line
> ships 4.23 / 3.29 — under the 4.5 bar, which §4.2 makes a stop-and-ask. The
> numerals are byte-identical either way (01…09, verified by me in the diff), so
> R4 is untouched. **Standing correction for TASK-010/011: where §0's ink-faint
> rule and a route-section instruction disagree, §0 wins — an instruction that
> predates a dated standing rule does not override it. Raise it the way you did,
> then follow §0.**

**FQ29 (FYI, no action taken).** The opening block now sits **112px** above the
grid on `/portfolio` and **104px** above the filter on `/blog` (PageSection's own
64px plus a 48px / 40px `margin-top` that predates this task and that the TASK
does not name). On `/services` the equivalent margin does not exist, so the three
route openings are not flush with each other. I left all three margins alone.

> **answer (Sober 2026-09-04): leaving them alone was right — do not change them
> in TASK-010 either.** Those margins predate REQ-002, no TASK names them, and
> equalising three routes by eye is a look decision, not an SA tweak. The fact
> does deserve an owner's eye, so I folded it into **SQ8** (already with Porter,
> already about how a route *opens*) instead of opening a new question:
> `/portfolio` 112px, `/blog` 104px, `/services` 0px between the opening block
> and the first content row. If the owner wants them flush it comes back as one
> line of scope, never as a fix improvised inside TASK-010.

**FQ30 (FYI).** `ProjectModal.module.css:54` `.note` still reads
`--site-ink-faint` — reported per §0's "report the ones you leave and why". Its
surface is the Modal body, which this task does not turn into glass, and SQ7
means I cannot read that surface. It is a candidate for whichever TASK finally
gets to open the modal.

> **answer (Sober 2026-09-04): correct call, and it is now a named carry-forward,
> not a loose end.** §0 scoped the swap to call sites *whose surface actually
> becomes glass*; `.note`'s does not (P4 changed only `.label`), so swapping it
> would have been unscoped work on a surface neither of us can measure while SQ7
> stands. Your 4.56 / 3.64 source-computation is against the *page* ground, which
> is not the ground it will sit on — so it decides nothing, and I record it as
> neither a pass nor a fail. **`ProjectModal.module.css:54` is carried into
> TASK-011's UNVERIFIED list and belongs to whichever TASK first opens the modal.**

## Review

**Verdict: DONE** — Sober (SA), 2026-09-04. Reviewed against SPEC-002 and this
TASK's DoD by reading the real tree, not these notes.

**What I re-verified myself, in the working tree:**

- **Scope.** `git status` + `git diff --stat` = exactly the 12 files listed above,
  plus `About/AboutExperience.module.css` — which is TASK-008's still-uncommitted
  close-out line, as you said, and not a thirteenth file of yours. `theme.ts`,
  `globals.css`, `package.json` and `components/ui/` are **absent**. Everything
  sits inside the four paths the DoD allows.
- **`npx tsc --noEmit` → exit 0. I ran this one myself**, on the changed tree.
- **`"use client"` identity.** `git grep` at HEAD vs the working tree: `diff`
  silent, **11 lines, byte-identical**. The hoist neither added nor removed a
  boundary — P1/B1's whole point, confirmed rather than asserted.
- **Retired-pattern grep** over both folders → exit 1, no output. Also 0 hex
  literals and 0 `!important` anywhere in scope.
- **P2 done:** `PortfolioGrid.tsx` renders `<h2>`, the string untouched — the
  `H1 → H3` skip is gone.
- **§3 obeyed:** `String(index + 1).padStart(2, '0')` is unchanged in the diff.
  The ordinal is kept byte for byte, and no new ordinal appears anywhere.
- **P4 exact:** `.label` carries the label recipe **value for value** against
  SPEC-002 §Label recipe (body face / 0.8125rem / 600 / `letter-spacing: 0` /
  `text-transform: none` / `--mantine-color-dimmed`). No `overlayProps` passed —
  TASK-006 §Review's trap avoided.
- **The hover recipe is not a new value.** `.card:hover`'s `color-mix(in srgb,
  var(--mantine-color-anchor) 40%, transparent)` is character-identical to
  `TechChip.module.css:24`. One recipe, two call sites.
- **D1-contributes-0 is true by construction, not only by measurement.**
  `RouteHero.module.css:13` sets `background-color: var(--mantine-color-body)` on
  `.hero` — opaque, so the fixed lattice cannot reach those pixels. The six 0.0
  readings are what that structure has to produce.

**What is Fern's live evidence and was NOT re-run by me**, said plainly so a later
readback is never contradicting a claim of mine: `npm run build`, the six-route
console sweep, the R4 `innerText` captures, the R6 Home element list, the contrast
table, the opening-block heights and the node-dot clearance. The contrast rows are
mechanism-consistent (`--mantine-color-dimmed` on `--site-glass-bg` = 7.52 / 5.84,
the same pair TASK-008 verified), and the sampler reproduced my published `/about`
figures to the last decimal **before** it was used here — the right order of
operations. **If a later readback disagrees, the readback wins.**

**Two method points worth keeping.** (a) Re-capturing the R4 baseline *at each
viewport* after the first pass produced a false failure — the header nav collapses
at 360, so a baseline is only valid at the width it was taken at. That is the
house method for R4 from now on. (b) 7px, not my predicted 6px, on the node-dot
clearance: the real number and its cause were reported instead of matching my guess.

**Design-system note I own, and why it is a note and not a REWORK.**
`GlassPanel`'s `className` prop is documented "Layout only. Colour belongs to the
panel, not to its consumer", and `.card:hover` sets `border-color` — the first
consumer in this repo to override a panel *surface* property (every other one sets
ink only). I prescribed it in P3, it reuses an existing in-repo recipe, and the
clean alternative (an `interactive` prop on `GlassPanel`) touches
`components/ui/`, which this TASK's DoD forbids. So it stands. **It does not get
copied a second time:** a standing rule now sits in SPEC-002 §Retired patterns so
TASK-010 does not re-invent it, and the second interactive panel is what moves the
hover into `GlassPanel` itself.

**Correctly left alone.** The whole `ProjectModal` open state stays UNVERIFIED
(SQ7 gate obeyed — no workaround, no fallback route, no `<a>`, no second render
path); the Blog empty state is unreachable and the DoD's "if one exists" is
answered with "one does not"; `.entry`'s stale `transition` is pre-existing and
not yours to clean. The missing below-the-fold screenshots are named rather than
hidden, and the numeric card geometry is a fair substitute — **eyes on the cards
is a QA ask through Porter, exactly as you said, and I am carrying it there.**

**Not ticked, and staying that way:** everything in §Not verified, carried forward
into TASK-011's UNVERIFIED list unchanged, plus `ProjectModal.module.css:54` (FQ30).

**All three FQs answered above. Nothing bounced back.** Next for Fern is
**TASK-010** — the only TASK permitted to edit `theme.ts`.
