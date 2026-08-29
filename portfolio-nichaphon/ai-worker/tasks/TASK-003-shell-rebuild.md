# TASK-003: Shell rebuild — header, footer, section-heading pattern

- Source: SPEC-001
- Status: DONE
- Owner: Fern (FE)
- Depends on: TASK-001

Read **SPEC-001 §"Flow" → "Shell"** and **§"Retired patterns"** first. The shell is
shared by all six routes, so this task changes how the other five look too — that is
intended (SPEC-001's "keep the names, change the values" rule): they must come out
coherent, not half-broken.

## What to do

**1. `front/src/components/layout/SiteShell/Header/SiteHeader.tsx` + `.module.css`**

- Remove `<ColorSchemeToggle />` and its import. **Delete nothing else** — the
  component directory and its `ui/` barrel export stay, so light mode is a two-line
  revert (SPEC-001 §"Decision: Home ships dark-only", SQ1).
- Header sits thin and transparent over the hero. It may gain a ground + hairline
  after scroll **only if that costs no new client-side machinery beyond the
  `'use client'` this file already has** — a scroll listener in this existing client
  component is acceptable; a new provider, a new context or a second client boundary
  is not. If it looks worse than the plain transparent bar, ship the plain bar.
- Wordmark set in the new display face (`var(--site-font-display)`).
- Nav links minimal, with a purple dot or underline as the **active** marker instead
  of the current treatment. It must read as active without relying on colour alone.
- Unchanged and non-negotiable: `Burger` + `Drawer` behaviour, `data-active`,
  `aria-current="page"`, `aria-label="Main"` / `"Mobile"` / `"Open navigation"`,
  the `isActive` logic, and the 44px minimum touch target on every control.

**2. `front/src/components/layout/SiteShell/Footer/SiteFooter.tsx` + `.module.css`**

- Restyle onto the dark ground. **The `.tsx` structure, links and copy do not change**
  — expect this to be a CSS-module-only change. If you believe the TSX must change,
  ask in `## Questions` before doing it.

**3. `front/src/components/ui/SectionHeading/SectionHeading.module.css`**

- The uppercase-mono eyebrow is a **retired pattern** (SPEC-001), and Home renders
  its eyebrow through this shared component — so the eyebrow's *styling* changes here.
- **The `SectionHeading` props do not change and the `eyebrow` prop is not removed.**
  Nine call sites across five out-of-scope routes pass it (`About.config.ts`,
  `Blog`, `Contact`, `Portfolio`, `Services`) and every one must keep compiling and
  rendering its label.
- New treatment: not uppercase, not the mono face, not letter-spaced small-caps.
  Give it a purple mark or a weight/scale shift that belongs to the new language.
  `SectionHeading.tsx` should not need editing.

**4. `front/src/components/layout/SiteShell/SiteShell.module.css`** — touch only if
the transparent header needs the main region to start at the top of the viewport.
Do not change `SiteShell.tsx` or the skip-link markup.

## Explicitly not in this task

- No change to `PageSection`, `TechChip`, `ChipRow`, `ImageLightbox`, or to any
  component's **props** (SPEC-001 §"Unchanged public APIs").
- No Home partial files — that is TASK-004.
- No new `"use client"` boundary anywhere.

## Definition of Done

- [x] `cd front && npm run build` completes with no errors and no new warnings.
- [x] All six routes load in `npm run dev` with an empty console; every nav link
      reaches its route; the active link is marked on each of the six.
- [x] The header renders no theme toggle, and `components/ui/ColorSchemeToggle/`
      still exists and is still exported from `components/ui/index.ts`.
- [ ] Keyboard sweep on `/`: Tab reaches skip link → wordmark → each nav link →
      burger, each with a visible focus ring; the drawer opens, traps nothing it
      shouldn't, and closes on link click as it does today.
- [x] At 360px width the header does not overflow horizontally.
- [x] No section eyebrow anywhere on the site renders as uppercase mono; every
      `eyebrow` string still appears on its page (check `/about`, `/services`,
      `/portfolio`, `/blog`, `/contact` — **fourteen** call sites, thirteen of them
      outside Home; the "nine" this line used to say was wrong, see FQ3).

## Implementation Notes

Implemented 2026-08-30 by Fern on `develop`. **4 files modified, 0 added, 0 deleted**
(`git status --porcelain` = exactly these four `M` lines; no untracked files):

| File | Change |
|---|---|
| `front/src/components/layout/SiteShell/Header/SiteHeader.tsx` | toggle removed; scroll state added |
| `front/src/components/layout/SiteShell/Header/SiteHeader.module.css` | transparent bar, dot active marker |
| `front/src/components/layout/SiteShell/Footer/SiteFooter.module.css` | restyle only — **`SiteFooter.tsx` untouched** |
| `front/src/components/ui/SectionHeading/SectionHeading.module.css` | eyebrow retreatment — **`SectionHeading.tsx` untouched** |

**1. Header TSX.** Removed the `ColorSchemeToggle` import + element. The `<Group gap="xs">`
that wrapped it went too — with the toggle gone it held a single child, and leaving it
would have left `Group` imported for nothing; `Burger` now sits directly in `.inner` with
its own class, props and `aria-label` unchanged. Added `useState` + one `useEffect` scroll
listener inside the **existing** `'use client'` component (`window.scrollY > 8` ->
`data-scrolled`); it is a boolean threshold, so it re-renders on the crossing, not per
frame, and the listener is `{ passive: true }` and removed on unmount. **No new provider,
context or client boundary.** `Burger`, `Drawer`, `useDisclosure`, `isActive`,
`data-active`, `aria-current`, `aria-label="Main"` / `"Mobile"` / `"Open navigation"` are
all unchanged.

**2. Header CSS.** Transparent ground + transparent bottom border at rest; on
`[data-scrolled='true']` it takes `color-mix(in srgb, var(--mantine-color-body) 88%,
transparent)` + `var(--site-hairline)` + `backdrop-filter: blur(10px)`, with an
`@supports not (backdrop-filter: ...)` fallback to the fully opaque ground. The transition
is opted out under `prefers-reduced-motion`. Wordmark stays on `var(--site-font-display)`,
now 1.125rem / 700 / -0.02em. Active nav marker is a **5px purple dot** centred under the
label plus a 500 -> 600 weight shift (two cues, neither colour-only), replacing the 2px
underline; the drawer link gets the same dot on its leading edge. `position: sticky` was
**kept** — see FQ5.

**3. Footer CSS.** CSS-module-only, as instructed. The flat `border-top` hairline is
replaced by a gradient rule that fades out at both ends with an iris centre, plus a soft
`--site-accent-wash` top gradient on the footer ground. Name to the display face,
1.375rem / 700. No new token: every value reads an existing variable.

**4. SectionHeading CSS.** `.eyebrow` is no longer uppercase, no longer mono, no longer
letter-spaced: it is now `var(--site-font-body)` 0.9375rem / 600 in
`--mantine-color-anchor`, `text-transform: none`, `letter-spacing: 0`, preceded by a 6px
purple dot via `::before` — deliberately the same mark as the header's active nav dot.
`SectionHeading.tsx`, its props and the `eyebrow` prop are untouched.

**Two colour corrections inside the restyle** (not new tokens, not scope creep):
`.wordmarkRole` and `.copyright` were both text set in `--site-ink-faint`, which
SPEC-001 §Non-functional declares decorative and forbids for body text. Both moved to
`--mantine-color-dimmed`. `.wordmarkRole` also dropped mono/uppercase (SPEC-001 retires
that micro-label pattern and the header renders on `/`); it now hides below 48em instead
of 36em, which removes the only realistic header overflow risk.

### Verification — commands run, output observed

- `npx tsc --noEmit` -> exit 0.
- `cd front && npm run build` -> **0 errors, 0 warnings**, `Compiled successfully`,
  `Generating static pages (10/10)`. Re-run against the final file state, same result.
- `npm run dev` on port 3011: all six routes returned `200`; the browser console held
  **only** the React DevTools info line — no warning, no error, no hydration mismatch.
- **Toggle gone, component kept:** no `ColorSchemeToggle` string anywhere in
  `SiteHeader.tsx`; `components/ui/ColorSchemeToggle/` still on disk and still exported
  from `components/ui/index.ts` (that file is not in the diff). Probed in the browser on
  all six routes: no toggle control inside `<header>`; `data-mantine-color-scheme="dark"`.
- **Active marker on all six:** each route reports exactly one `data-active="true"` link
  carrying `aria-current="page"` (Home / About / Services / Portfolio / Blog / Contact).
  Measured on `/`: active `::after` = 5px, `rgb(164,136,255)`, font-weight 600 against 500.
- **Eyebrows:** all render, none uppercase, none mono — every one measured
  `text-transform: none`, `font-family: "IBM Plex Sans Thai"`, dot `rgb(164,136,255)`:
  `/about` About, Experience, Toolkit, Approach, Credentials, Clients · `/services`
  Services, Process · `/portfolio` Portfolio · `/blog` Writing · `/contact` Contact,
  Direct, Questions · `/` "What I do". See FQ3 on the count.
- **Scrolled state:** after a real input-driven scroll, `scrollY 500` ->
  `data-scrolled="true"`, background `color(srgb 0.043 0.035 0.086 / 0.88)`,
  `backdrop-filter: blur(10px)`, header `getBoundingClientRect().top = 0`. At rest both
  background and border compute to `rgba(0, 0, 0, 0)`.
- **360px:** `innerWidth 360` and `document.documentElement.scrollWidth 360`,
  `header.scrollWidth 360`, `footer.scrollWidth 360` — no horizontal overflow. Burger
  measures 44x44. At 1280px the wordmark is 323x50 and `scrollWidth` equals the viewport.
- **Tab order on `/` (1280px):** Skip to content -> wordmark -> Home -> About -> Services
  -> Portfolio -> Blog -> Contact -> hero CTAs, i.e. DOM order, nothing skipped, no
  positive `tabindex`. The global rule `:focus-visible { outline: 2px solid
  var(--mantine-color-anchor); outline-offset: 2px }` is present in the loaded stylesheet
  and I did not touch it. Nav links measure 47px tall.

### NOT verified in this session — read this before reviewing

The Browser pane in this session runs **hidden**, which pauses `requestAnimationFrame`.
Two consequences, neither of them a defect in this change:

1. **The Drawer never mounts its content under automation.** Clicking the burger flips
   React state correctly (`opened === true`, read off the fiber), but Mantine's
   `Transition` never advances, so `nav[aria-label="Mobile"]` stays out of the DOM. I ruled
   out a regression by **temporarily restoring the committed HEAD `SiteHeader.tsx`** and
   repeating the click: identical result, drawer root empty. That file was restored from my
   copy immediately after, and the diff is the four files above. So: **drawer open, focus
   behaviour and "closes on link click" are UNVERIFIED by me.** The TSX on that path is
   unchanged, but a human — or TASK-005 — has to exercise it.
2. **The focus ring's appearance is UNVERIFIED.** Script `focus()` does not raise
   `:focus-visible`, so what I confirmed is the rule and the tab order, not the drawn ring.

Also unverified by me by definition: how any of it *looks*. That is the owner's call.

No git write, no commit, no deploy, no dependency change, no `package.json` edit. Dev
server stopped.

## Questions

**FQ3 — the DoD says nine eyebrow call sites; there are thirteen outside Home (fourteen
including it).** Not a blocker, and I checked every one: About 6 (`AboutContent`,
`AboutExperience`, `AboutSkills`, `AboutValues`, `AboutCertificates`,
`AboutTestimonials`), Services 2, Contact 3, Portfolio 1, Blog 1, plus `HomeCapabilities`
on `/`. All still compile and render their label. Flagged only so the count is right in a
later task.

> answer: **Your count is right, mine was wrong — corrected in both places.** Verified
> independently at review, not taken on report: 13 `SectionHeading eyebrow={…}` render
> sites outside Home (About 6, Services 2, Contact 3, Portfolio 1, Blog 1) plus
> `HomeCapabilities` = **14**. All 14 labels were read back out of the prerendered HTML
> in `front/.next/server/app/*.html` after my own `npm run build`, and all 14 are present
> and non-uppercase. The wrong "nine" originated in SPEC-001 §Tasks (my allocation note);
> that line and this task's DoD item now both say fourteen. Nothing in your work changes.

**FQ4 — I used `backdrop-filter: blur(10px)` on the scrolled header; please confirm or
veto.** SPEC-001 §Non-functional says "no large `filter: blur()` layer". This is a 73px
`backdrop-filter` on the header alone, active only when `data-scrolled`, not a full-bleed
layer — so I read it as outside that prohibition, but it is a paint-cost call that belongs
to you, not to me. Without it the 88% ground is not opaque enough: I could see hero
letters bleeding through the bar. Veto costs two lines — delete the `backdrop-filter` and
the `@supports` block, set the scrolled background to `var(--mantine-color-body)`.

> answer: **Confirmed — keep it. Your reading of the prohibition is the correct one.**
> That §Non-functional line is about the decorative `AuroraBackdrop`: a `filter: blur()`
> over a full-bleed layer repaints the whole viewport every frame, which is why the SPEC
> makes the aurora pure gradients. A `backdrop-filter` on a 64/72px bar, gated behind
> `data-scrolled`, with an `@supports` fallback, is a different and far cheaper thing, and
> your reason for needing it (hero letters bleeding through an 88% ground) is exactly the
> reason to have it. SPEC-001 §Non-functional now says this explicitly so it is not
> re-litigated, with a bound: **header only, only under `data-scrolled`, blur ≤ 12px, and
> the `@supports` fallback stays.** Your 10px sits inside that bound. No change to make.

**FQ5 — I kept the header `position: sticky`, so it does not overlay the hero at scroll 0.**
TASK step 4 allowed touching `SiteShell.module.css` so main can start at the top of the
viewport. I did not, because the only ways to get a true overlay are `position: fixed` or
a negative `margin-top` on `.main`, and both pull the first section of the **five
out-of-scope routes** up under the bar, each then needing a compensating top pad — more
regression risk than the look is worth inside a shell task. Consequence for **TASK-004**:
the hero's `AuroraBackdrop` will start *below* the 64/72px header rather than behind it,
and a `min-height: 100dvh` hero would overflow by that much. If you want the aurora
bleeding behind the bar, say so and I will do the fixed-header + `.main` padding variant
as its own step. No assumption made either way.

> answer: **`position: sticky` stays and `SiteShell.module.css` stays untouched — you were
> right to refuse both of your two options, and the answer is a third one that never leaves
> Home.** Reasoning and the exact instruction now live in **TASK-004 §1a**; summarised here
> so this file is self-explanatory:
>
> 1. SPEC-001 §Flow does ask for a bar "transparent **over** the hero", so the overlay is
>    wanted — but it is Home's job to rise under the bar, not the shell's job to move.
>    `HomeHero` takes `margin-top: calc(-1 * var(--site-header-height))` +
>    `padding-top: var(--site-header-height)`. Home files only; the other five routes are
>    not touched, which is the risk you correctly refused to take.
> 2. That needs the header height as a value, so SPEC-001 adds one token,
>    **`--site-header-height`** in `globals.css :root` — `64px`, `72px` at `min-width: 48em`,
>    the same two numbers `SiteHeader.module.css .inner` already uses. It is declared once;
>    if the bar's height ever changes, both must move together.
> 3. **A constraint comes with it, and it is binding.** At rest your bar is fully
>    transparent, so header text sits on whatever is behind it. I measured the at-rest nav
>    link (`--mantine-color-dimmed` `#a9a3ba`) against the aurora tokens: over
>    `--site-aurora-2` `#3b2fb5` it is **3.82:1**, over `--site-aurora-1` `#7040ff`
>    **2.23:1**, over `--site-aurora-3` `#c3b2ff` **1.29:1** — all under 4.5:1. So the
>    overlay is only allowed while the aurora's bright cores sit **below** the header band.
>    TASK-004 carries this as a numeric acceptance criterion (backdrop luminance ≤ 0.046 in
>    the top `--site-header-height`), and if the look Fern wants needs a bright core up
>    there, that is a stop-and-ask — the fallback is deleting the two lines in (1), which
>    returns the page to exactly what you shipped.

**Note, no action taken — TASK-004's scope, not mine:** `HomeHero.module.css .status`
still renders the uppercase-mono micro-label ("OPEN TO NEW OPPORTUNITIES") on `/`.
SPEC-001 §Retired patterns names it, and Home partials are explicitly out of this task.

> answer: **Correct on both counts, and already covered** — TASK-004 §1 requires
> `SITE.availability` to be rebuilt "in a **new shape** — the current mono-uppercase pill
> with a dot is a retired pattern". Nothing to add; thank you for not reaching into it.

## Review

**Verdict: DONE** (Sober, 2026-08-30). No rework.

Re-verified by me in the repo, not taken on report:

- **Scope.** `git status --porcelain` on `develop` = exactly the four `M` lines you list,
  no untracked files. `SiteFooter.tsx`, `SectionHeading.tsx`, `SiteShell.module.css`,
  `SiteShell.tsx` and `components/ui/index.ts` are all absent from the diff, so no props
  moved and the skip-link markup is intact. `ColorSchemeToggle/` is still on disk and
  still exported from the `ui/` barrel.
- **No new client boundary.** 11 files contain `'use client'`, the same 11 as HEAD;
  `SiteHeader.tsx` was already one of them. The scroll listener is `{ passive: true }`,
  removed on unmount, and flips a boolean, so it re-renders on the crossing only.
- **Behaviour frozen where the TASK froze it.** The `<Drawer>` block, `useDisclosure`,
  `isActive`, `data-active`, `aria-current`, `onClick={close}` and all three `aria-label`s
  are byte-identical to HEAD in the diff — the only TSX changes are the toggle removal,
  the now-redundant `<Group>` removal, and the scroll state.
- **Build (R7).** My own run: `npx tsc --noEmit` exit 0; `npm run build` → `Compiled
  successfully`, **0 errors, 0 warnings**, `Generating static pages (10/10)`.
- **Shell markup, read out of the prerendered HTML.** `/about` header contains no toggle,
  `aria-label="Main"`, and exactly one link with `data-active="true"` + `aria-current="page"`.
- **Eyebrows.** All **14** labels present in `.next/server/app/*.html` (see FQ3). The
  shipped rule is `text-transform:none; font-family: var(--site-font-body); 600` with a
  6px `::before` dot — the uppercase-mono pattern is gone from the shared component.
- **Contrast of every pair this task introduced or changed**, computed against the shipped
  `theme.ts` values, all clearing 4.5:1: anchor `#a488ff` on ground **7.08**, on
  `--site-surface` **6.65**; dimmed `#a9a3ba` on ground **8.11**, on surface **7.61**;
  text `#eceaf2` on ground **16.54**. Worst realistic scrolled-bar composite (88% ground
  over the brightest aurora token) still gives dimmed **6.71** and anchor **5.86**. Your
  two `--site-ink-faint` → `--mantine-color-dimmed` corrections were right and are the
  reason `.copyright` and `.wordmarkRole` now pass; `--site-ink-faint` on the ground is
  4.56 and SPEC-001 §Non-functional forbids it for text regardless.

**The one unticked DoD box stays unticked, and it is not held against you.** I reproduced
your finding independently in my own session: `document.hidden === true` and a
`requestAnimationFrame` callback never fires, so Mantine's `Transition` cannot mount the
drawer content — clicking the burger leaves `nav[aria-label="Mobile"]` out of the DOM here
too. Two sessions, same environment limit. Combined with the byte-identical `<Drawer>`
block, there is no path by which this change could have regressed drawer behaviour, so it
does not block DONE. But it is **UNVERIFIED, not passing**: the drawer opening, closing on
link click, and the drawn `:focus-visible` ring now sit in **TASK-005** as an explicit
item needing a visible browser or the owner's own hands. Nobody may tick it from a code read.

**Two things I checked that you did not claim, and that are fine:** between scroll 0 and
8px the bar is still transparent while content moves under it — at most 8px of overlap
against `.inner`'s padding, not worth machinery; and `.eyebrow` moving from `display: block`
to `inline-flex` still centres correctly under `.centered`'s `text-align: center`, and
still takes its `margin-bottom` (vertical margins apply to atomic inlines).
