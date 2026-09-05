# TASK-008: About + Services rebuild

- Source: SPEC-002
- Status: **DONE** (Sober 2026-09-04 — reviewed against the real tree: the one CSS
  line is the whole close-out diff, all of A1-A5 / B1-B5 landed and nothing else
  did, scope now provable by git. Section 4 / SQ7 stays UNVERIFIED on purpose and
  DEF-1 is untouched. See §Review)
- Owner: Fern (FE)
- Depends on: TASK-007 (DONE — `MachineGround`, `AuroraBackdrop variant="route"`,
  `GlassPanel tone`, `RouteHero` all exist and are reviewed)
- Repo: `portfolio-nichaphon-web`, everything under `front/`

Two routes: `/about` and `/services`. They are one task because they share the
same three moves (RouteHero opening, GlassPanel surfaces, retired patterns
deleted) and because the label recipe below has to land once, not twice.

---

## 0. Binding rules — read these before opening a file

**R4 is absolute.** No string is added, altered, removed, translated, reordered
into a different visible position, or moved out of JSX into a config file. The
only text this task adds to the site is **q3 on `/about` and q1 on `/services`**,
read from `constant/content/quotes.ts` by `PullQuote` — never retyped.

**Label recipe (SA-owned, binds TASK-008/009/010).** The retired uppercase-mono
micro-label is replaced everywhere by exactly this, and nothing else is invented:

```css
font-family: var(--site-font-body);
font-size: 0.8125rem;
font-weight: 600;
letter-spacing: 0;
text-transform: none;
color: var(--mantine-color-dimmed);
```

No purple dot — the dot belongs to `SectionHeading`'s eyebrow alone and would
read as a second eyebrow if it appeared on a field label.

**Card recipe.** A `gap: 1px` hairline grid or a flat 1px-bordered box becomes
`GlassPanel`, and the container gets a **real gap** (`var(--mantine-spacing-lg)`
= 24px) instead of the 1px one. The panel owns its own background, border and
radius — the route CSS module must not restate any of them.

**Do not touch:** `.hero` / `.band` backgrounds, `--site-grid-line`, the `h1`
scale, any `AuroraBackdrop` alpha, `theme.ts` (TASK-010 owns the theme
follow-ups), any file under `partials/Home/`, `SiteShell`, `SiteHeader`,
`SiteFooter`. No new `"use client"`, no new dependency, no new hex literal, no
`!important`, no `background-color` on `.aurora`.

**Never work around SQ7 from a route file** (see section 4).

---

## 1. About — `components/partials/About/`

**A1. Heading skip (carried from TASK-007 FQ21).** `AboutValues.tsx:19` —
`<Title order={4}>` becomes `<Title order={3}>`. The rendered size *will* grow
(theme `h4` is `1.0625rem`, `h3` is `clamp(1.25rem, 2.2vw, 1.5rem)`) — that is
intended: the level was wrong, not the scale, and no font-size override is added
to hide it. Afterwards `/about`'s outline must be `h1` then `h2` then `h3`, no skip.

**A2. `AboutExperience`.** Entries become `GlassPanel as="article" tone="node"`;
featured entries `GlassPanel as="article" tone="node" glow`.

- Delete `.list { border-top }` and `.entry { border-bottom }`; `.list` becomes a
  stack with `gap: var(--mantine-spacing-lg)`.
- Delete `.featured` entirely (`border-left` + `padding-left`). **SA call:**
  featured is now carried by `glow` plus the `.marker` badge that already
  exists — a 2px accent border on a 20px-radius panel is cut by the radius and
  fights the panel's own 1px edge.
- `.entry`'s two-column grid at `min-width: 62em` stays; its `padding-block`
  goes (the panel pads itself).
- `.period` keeps mono + `tabular-nums` — that is D4, not a retired label.
- `.marker` keeps its current treatment: it is an accent badge with an icon, not
  a field micro-label.
- The inline string `Fastest delivery` at `AboutExperience.tsx:32` **stays
  exactly where it is.** It is copy inline in JSX and I know it; moving it to
  `About.config.ts` is a copy move and R4 is not mine to relax. Recorded, not
  done — do not tidy it.

**A3. `AboutSkills`.** Groups become `GlassPanel as="div"`; delete
`.group { padding-top; border-top }`; `.groups` gap becomes 24px both axes.
`.label` (`AboutSkills.module.css:18-26`) takes the **label recipe** — it is a
retired uppercase-mono micro-label.

**A4. `AboutCertificates` and `AboutTestimonials` — deliberately unchanged.**
**SA call:** neither carries a retired pattern (no `gap: 1px`, no uppercase-mono
label, no 4px control radius) and neither has a card surface to convert — they
are bare image thumbnails with meta beneath. Wrapping images in glass panels is
invention, not R1. Leave both `.tsx` files and both CSS modules alone.

**A5. q3 (SPEC-002 Quotes, SQ3).** In `AboutContent.tsx`, between the Values
section and the Certificates section, add exactly:

```tsx
<PageSection density="tight">
  <PullQuote id="q3" size="lead" />
</PageSection>
```

Self-contained on purpose, so SQ3's fallback (the owner does not want
unconfirmed English live) is a delete of this block and nothing else. Check the
Thai line's wrap at 360px.

---

## 2. Services — `components/partials/Services/`

**B1. `ServicesContent.tsx` — the opening block.** Replace the
`PageSection density="tight"` + `SectionHeading order={1}` pair with

```tsx
<RouteHero
  eyebrow={SERVICES_INTRO.eyebrow}
  title={SERVICES_INTRO.title}
  lead={SERVICES_INTRO.lead}
/>
```

and move `<ServicesTable />` into its **own** `<PageSection density="tight">`
directly below. **SA call — `ServicesTable` does not go inside `RouteHero`'s
`children`:** the `route` aurora is weighted to the top of its box, so a tall
table inside would stretch that box and make Services' opening block a different
shape from every other route's. One shared opening is D2's entire point.
Consequence: `ServicesTable.module.css .scroller`'s `margin-top: 48px` becomes
double spacing — delete it.

**B2. `ServicesTable` stays a `<table>` — SA correction to SPEC-002 Flow item 2.**
The SPEC said "`ServicesTable` as `GlassPanel` rows". I am overruling my own
line, and not on taste: converting the table to cards deletes the three
`<th scope="col">` strings `Service`, `What it covers`, `Stack` (user-visible
text, so R4) and destroys the `role="region"` / `aria-label` tabular structure
that SPEC-002 Non-functional says a restyle may not break. The correction is
written into the SPEC. What changes instead:

- `.scroller`: `border: 1px solid var(--site-glass-border)`,
  `background: var(--site-glass-bg)`, `border-radius: var(--mantine-radius-lg)`.
  Keep `overflow-x: auto` and the `tabIndex` / `role` / `aria-label` as they are.
- `.table th, .table td` row rule: `--site-hairline` becomes `--site-glass-border`.
- `.table thead th` (`ServicesTable.module.css:31-35`): takes the **label
  recipe**. Its `position: sticky` and `background-color: var(--site-surface)`
  stay — a sticky header needs an opaque ground.
- `min-width: 780px` and the horizontal scroll are unchanged.

**B3. `ServicesProcess`.** Steps become `GlassPanel as="li" tone="node"`; delete
`.step { padding-top; border-top }`. `.number` gains the shared `site-numeric`
class alongside its module class, matching `HomeCapabilities` — the mono and
`tabular-nums` it already has are **not** changed, so D4 on Services is a
one-class alignment, not a restyle. `step.step` is content
(`constant/content/services.ts`) and is not touched.

**B4. `ServicesCta`.** `.cta` becomes `GlassPanel glow padding="lg"`; delete its
`border`, `background-color` and `padding` from the module (the grid, the column
template and the gaps stay). **SA call:** the `--site-accent-wash` ground is
replaced by `glow`, the same device `HomeCapabilities` uses to mark its one
important panel — and `--site-accent-wash` is about to become the Alert/Accordion
ground in TASK-010, so two accent grounds on one page would flatten the signal.
The filled `Button`, its `href` and its label are untouched.

**B5. q1 (SPEC-002 Quotes, SQ3).** In `ServicesContent.tsx`, immediately above
the CTA's `PageSection`, add exactly:

```tsx
<PageSection density="tight">
  <PullQuote id="q1" size="lead" />
</PageSection>
```

Same reversibility rule as A5.

---

## 3. Measurements to report (SQ8 + the ceiling)

Report as tables in Implementation Notes. Measure, do not estimate.

1. **Opening-block height** of `/about` and `/services` at **1280x800** and
   **360x740** (the `.hero` wrapper's `getBoundingClientRect().height`).
   Porter is holding SQ8 open for exactly these numbers — five routes, one
   answer from the owner. Report them; do not act on them.
2. **Contrast** for every text/background pair you introduce or change: the label
   recipe on `--site-glass-bg` and on `--site-surface` (sticky thead), `.entry`
   body text on `--site-glass-bg`, `PullQuote` on the page ground. 4.5:1 body,
   3:1 large. **Under the bar is a stop-and-ask, not a tweak.**
3. **The 0.046 ceiling still holds.** `/services` gets its first `RouteHero`, so
   re-run the D1-on vs D1-removed comparison from TASK-007 §Third pass at
   **1217 / 1280 / 360** on the `/services` opening block. `RouteHero .hero`
   already carries the opaque `--mantine-color-body` ground, so the predicted
   result is **D1 contributes exactly 0**. If it does not, stop and ask — do not
   retune any alpha.

---

## 4. SQ7 gate — what you may NOT tick

`ImageLightbox` (About certificates + testimonials) is a Mantine `Modal`, and
**no Modal opens on `develop`** (SPEC-002 SQ7, still with Porter). Therefore:

- Do not tick, claim or measure anything about the lightbox's **open** state.
- Report the trigger's rest / hover / focus state only.
- Do not add a workaround, a fallback `<a>`, or a second render path from a route
  file. If the answer comes back "fix it", it reaches you as its own TASK.

---

## Definition of Done

Run from `front/`. Paste the actual output, not a summary of it.

- [x] `npx tsc --noEmit` exits 0.
- [x] `npm run build` exits 0 with **no warning line**; `.next` deleted afterwards.
- [x] `npm run dev`; `/about` and `/services` load with an **empty** console
      (errors *and* warnings) at 1280x800 and 360x740.
- [x] The other four routes (`/`, `/portfolio`, `/blog`, `/contact`) still load
      with an empty console — nothing in this task may reach them.
- [x] **R6 Home non-regression:** `/`'s `<body>` element list is byte-identical to
      HEAD at both viewports (the A/B method from TASK-007 §Third pass).
- [x] **R4 text check, falsifiable** (re-worded by Sober 2026-09-03, FQ26):
      (i) **no source string changed** — `diff -r src/constant` against the HEAD
      snapshot is clean and every `.tsx` carrying visible copy is byte-identical;
      (ii) `document.body.innerText` differs from HEAD's only by q3's two lines
      (`/about`) / q1's two lines (`/services`), both byte-identical to
      `constant/content/quotes.ts`, **plus letter-case-only differences on the
      elements the section-0 label recipe took `text-transform: uppercase` off**
      — enumerate them (8 skill labels on `/about`, 3 table headers on
      `/services`). Any non-case difference fails the box. Paste the diff.
- [x] **Retired-pattern grep returns no line other than `.marker`** (re-worded by
      Sober 2026-09-03, FQ26): the only permitted hit is
      `AboutExperience.module.css` `.marker { text-transform: uppercase }`, which
      A2 keeps by name. Any other hit fails the box.
      `grep -rn "gap: 1px\|text-transform: uppercase\|radius-xs" src/components/partials/About src/components/partials/Services`
- [x] `/about` heading outline is `h1` then `h2` then `h3`, no skip (A1).
      `/services` outline unchanged and skip-free.
- [x] All existing `aria-*`, `role`, `lang`, `id` / `aria-labelledby` pairs,
      `scope` attributes and tab order on both routes are preserved.
- [x] No horizontal scroll at 360px on either route.
- [x] Opening-block heights reported (3.1). Contrast table reported (3.2), every
      pair at or above its bar. D1-contributes-0 table reported (3.3).
- [x] `git diff --stat` touches **only** files under
      `src/components/partials/About/` and `src/components/partials/Services/`.
      `theme.ts`, `globals.css`, `package.json` and `components/ui/` are absent.
- [x] `grep -rn "use client" src/components src/app` output is **byte-identical
      to HEAD's** (corrected by Sober 2026-09-03, FQ27: the real repo returns 11
      lines, not four — identity to HEAD is the check, never a count).
- [x] **No git write, no branch, no commit, no deploy, no `pm2`, no ssh.**
- [x] Unticked on purpose and named as such: anything about the lightbox's open
      state (section 4).

## Implementation Notes

Filled by Fern 2026-09-02. Branch `develop`, **no git write**, no deploy, no
`pm2`, no ssh, nothing outside `front/src/components/partials/{About,Services}`.
Dev server on **port 3010** (3000 is held by a foreign process), stopped after
the run; `front/.next` deleted after the build, so the repo is left with no
build output.

~~**Two DoD boxes are deliberately left unticked and both are stop-and-asks — see
FQ25 and FQ26. That is why this TASK is BLOCKED, not REVIEW.**~~ **Superseded by
the close-out pass below — all three boxes are now ticked.** A third box (the
`use client` one) is ticked against the real repo, not the number the box names
— see FQ27.

---

### Close-out pass — Fern, 2026-09-04 (Sober's list of 2026-09-03)

Dev server on **port 3010** again (3000 still held by a foreign process), stopped
after the run; `front/.next` deleted before the dev run and again after it, so the
repo is left with no build output. No git write, no branch, no commit, no deploy,
no `pm2`, no ssh.

**1. The one CSS line (FQ25 answer (a)) — landed, and it is the only edit.**

```
$ git diff --stat
 front/src/components/partials/About/AboutExperience.module.css | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

$ git diff -- front/src/components/partials/About/AboutExperience.module.css
@@ -32,7 +32,7 @@
 .organisation {
   margin: 6px 0 0;
-  color: var(--site-ink-faint);
+  color: var(--mantine-color-dimmed);
   font-size: 0.875rem;
 }
```

`grep -rn "site-ink-faint" src/components/partials/About src/components/partials/Services`
now returns **nothing** — that was the only `--site-ink-faint` call site in this
task's scope. `theme.ts`, `globals.css`, `package.json` and `components/ui/` are
untouched, as the DoD requires.

**Re-measured, per the instruction** — see the updated `.organisation` row in 3.2:
**7.52 flat / 5.84 at the 4-lattice worst pixel**, both clear of 4.5. No surprise,
exactly as predicted; `.organisation` computes to `rgb(169, 163, 186)`, byte-equal
to `.body` and `.period` on the same `GlassPanel`.

**2. Re-run on the changed tree (commands and their real output).**

```
$ npx tsc --noEmit
TSC_EXIT=0                       (no output)

$ rm -rf .next && npm run build
 * Compiled successfully in 14.2s
 * Generating static pages (10/10)
Route (app)  /  2.97 kB | /about 2.89 kB | /services 2.73 kB   (all Static)
[postbuild] copied .next/static + public/ into .next/standalone
BUILD_EXIT=0                     (no warning line anywhere in the output)
$ rm -rf .next                -> .next deleted

$ grep -rn "gap: 1px|text-transform: uppercase|radius-xs"     src/components/partials/About src/components/partials/Services
src/components/partials/About/AboutExperience.module.css:54:  text-transform: uppercase;
-> exactly one hit, and it is `.marker` — the single line the re-worded box permits.

$ grep -rn "use client" src/components src/app | wc -l
11                               (unchanged; a CSS module cannot carry the directive,
                                  and the changed file contains zero occurrences)
```

**Six-route console pass, re-run at 1280x800 and again at 360x740**, fresh tab,
`/about` -> `/services` -> `/` -> `/portfolio` -> `/blog` -> `/contact`:
**zero `error` and zero `warning` lines at either viewport** (`onlyErrors` returns
"No console logs."). The only output on any route is React's `info` "Download the
React DevTools" line plus dev-only `[Fast Refresh] rebuilding` `log` lines.

Re-verified live on the changed tree: `/about` heading outline
`h1,h2,h3,h3,h3,h2,h3x8,h2,h3x3,h2,h3x4,h2` — **no skip**; `/services`
`h1,h2,h3,h3,h3,h3,h2` — **no skip**. No horizontal scroll at 360px:
`/about` `scrollWidth` 360 = `clientWidth` 360, `/services` 360 = 360.

**3. The evidence I did NOT re-run, and why (say it plainly).** The R4 innerText
diff, the R6 Home A/B element capture, the 3.1 heights and the 3.3 D1 table stand
as pasted from the 2026-09-02 pass. The close-out delta is **one `color`
declaration in `AboutExperience.module.css`** — it adds, removes and moves no
string (so `innerText` cannot move), and `AboutExperience` is imported only by
`AboutContent` (`/about`), never by `HomeContent` (`src/app/page.tsx` imports
`HomeContent` alone), so it cannot reach `/`. I verified that import graph rather
than assuming it. If Sober wants the R6 A/B physically repeated on this tree, say
so and it is one more pass.

**4. Not mine, noticed and left alone.** `git status` shows an untracked
`front/.next.zip` at the repo root of `front/`. It was there before this session
started, it is a build artefact and not a source file, and nothing in this TASK
names it — I did not create, move or delete it. Flagging it only so it is not
mistaken for my footprint.

**5. Still UNVERIFIED on purpose (section 4).** I did not open, measure or
work around `ImageLightbox`. DEF-1's collapsed thumbnails were visible again on
`/about` during this pass; per Sober's item 4 that is expected, recorded, and
TASK-012's — I left `ImageLightbox.module.css` untouched.

### Files — 12 modified, 0 added, 0 deleted

All under the two partial folders, nothing else:

| file | changed lines |
|---|---|
| `About/AboutValues.tsx` | 2 (A1) |
| `About/AboutExperience.tsx` | 11 |
| `About/AboutExperience.module.css` | 22 |
| `About/AboutSkills.tsx` | 6 |
| `About/AboutSkills.module.css` | 17 |
| `About/AboutContent.tsx` | 5 (A5) |
| `Services/ServicesContent.tsx` | 16 (B1 + B5) |
| `Services/ServicesTable.module.css` | 22 |
| `Services/ServicesProcess.tsx` | 8 |
| `Services/ServicesProcess.module.css` | 4 |
| `Services/ServicesCta.tsx` | 5 |
| `Services/ServicesCta.module.css` | 8 |

`AboutCertificates` / `AboutTestimonials` (A4) and `ServicesTable.tsx` (B2) are
**byte-identical** to before — I opened them and changed nothing.

**On `git diff --stat`:** the repo-wide diff still carries TASK-006's and
TASK-007's uncommitted handoff (git writes are the human's), so it cannot
isolate my work. My delta is measured instead against a byte-for-byte snapshot
of `front/src` taken before I edited anything: `diff -rq` over the whole `src`
tree names **exactly the 12 files above and nothing else**. `theme.ts`,
`globals.css`, `package.json` and `components/ui/` do not appear.

### What was built

- **A1** `AboutValues.tsx` `order={4}` becomes `order={3}`; no font-size
  override added. `/about`'s outline is now `H1, H2, H3x3, H2, H3x8, H2, H3x3,
  H2, H3x4, H2` — **no `h4` anywhere on the page**, no skip.
- **A2** entries are `GlassPanel as="article" tone="node"`, featured ones also
  `glow`. `.list` is a 24px stack; the `border-top`, `.entry`'s `border-bottom`
  and `padding-block`, and the whole `.featured` rule are gone. The 62em
  two-column grid stays. `.period`, `.marker` and the inline `Fastest delivery`
  string are untouched.
- **A3** groups are `GlassPanel as="div"`. After deleting `.group`'s
  `padding-top` / `border-top` the rule held nothing, so the empty rule and its
  `className` went with it. `.groups` gap is `var(--mantine-spacing-lg)` both
  axes. `.label` carries the section 0 recipe.
- **A5 / B5** the two quote blocks are exactly the four lines the TASK dictates,
  each alone in its own `PageSection density="tight"` — deleting the block is
  the entire rollback.
- **B1** `RouteHero`, then `ServicesTable` in its own tight `PageSection`;
  `.scroller`'s `margin-top: 48px` deleted (reads back `0px`).
- **B2** `.scroller` is the glass surface (`rgba(196,178,255,0.18)` border,
  `rgba(120,96,200,0.1)` fill, 20px radius); the row rule is now
  `--site-glass-border`; `thead th` takes the recipe **and keeps**
  `position: sticky` + `background-color: var(--site-surface)`.
  `ServicesTable.tsx` untouched — `role="region"`, `aria-label="Services table"`,
  `tabIndex={0}`, 3x `scope="col"` and 6x `scope="row"` all read back present.
- **B3** steps are `GlassPanel as="li" tone="node"`; `.step` deleted; `.number`
  is now `${classes.number} site-numeric` with its mono / tabular values
  unchanged.
- **B4** `.cta` is `GlassPanel glow padding="lg"`; border, `background-color`
  and `padding` removed from the module. Button, `href` and label untouched.

Panel census off the running pages: `/about` 11 panels (3 `node`, 1 `glow` = the
featured entry, 8 skill groups); `/services` 5 panels (4 `node` steps + the
`glow` CTA).

### Verification — commands and output

```
$ npx tsc --noEmit
tsc exit=0                       (no output)

$ npm run build
 * Compiled successfully in 14.4s
 * Generating static pages (10/10)
Route (app)   /  2.97 kB  |  /about  2.89 kB  |  /services  2.73 kB   (all Static)
[postbuild] copied .next/static + public/ into .next/standalone
BUILD_EXIT=0                     (no warning line anywhere in the output)
$ rm -rf .next                -> .next deleted

$ grep -rn "gap: 1px\|text-transform: uppercase\|radius-xs" \
    src/components/partials/About src/components/partials/Services
src/components/partials/About/AboutExperience.module.css:54:  text-transform: uppercase;
grep exit=0                      -> BOX NOT TICKED, see FQ26
```

**Console.** A fresh tab, six routes visited in order at **1280x800** and again
at **360x740**; `read_console_messages` filtered on
`warn|Warning|error|Error|preload` returns **"No console logs."** at both
viewports. The only console output on any route is React's `info` "Download the
React DevTools" line. `/`, `/portfolio`, `/blog` and `/contact` are clean —
nothing in this task reached them.

**R4 text check — `document.body.innerText`, diffed line by line against the
pre-TASK-008 tree captured at the same viewport.** (My first baseline was taken
at the browser pane's default width and was discarded — the responsive nav made
it non-comparable. The tree was swapped back to baseline byte-for-byte,
re-captured at 1280 and 360, then swapped back to mine and re-verified `diff -r`
clean.)

`/about` — **identical diff at 1280x800 and at 360x740**:

```
+ จุดอ่อนและจุดแข็งของผมคือ "ไม่สนใจอย่างอื่นเลย นอกจากการแก้ไขปัญหาที่สำคัญที่สุดขององค์กร"
+ My weakness and my strength are the same thing: "I care about nothing but solving the most important problem of the organisation."
- LANGUAGES         + Languages
- FRONTEND          + Frontend
- BACKEND           + Backend
- AI AND ROBOTICS   + AI and Robotics
- MOBILE            + Mobile
- DATABASES         + Databases
- TOOLS AND DEVOPS  + Tools and DevOps
- WAYS OF WORKING   + Ways of working
```

`/services` — **identical diff at both viewports**:

```
+ นักพนันที่เก่งมากๆ ไม่ได้เล่นแค่ตาที่ตัวเองไพ่ดี
+ A truly great gambler doesn't only play the hands where his own cards are good.
- SERVICE  WHAT IT COVERS  STACK
+ Service  What it covers  Stack
```

The four added lines are **byte-identical to `constant/content/quotes.ts`** q3
(lines 26-27) and q1 (lines 16-17), checked character by character.
**Every other line is unchanged.** The `-` / `+` pairs are **case only**: the
strings are `Languages`, `Frontend`, ... in `constant/content/about.ts` and
`Service` / `What it covers` / `Stack` in `ServicesTable.tsx`, and `innerText`
reports `text-transform`. `diff -r src/constant` against the snapshot is
**clean — not one content file was touched** — and `ServicesTable.tsx` is
byte-identical. This is the section 0 label recipe (`text-transform: none`)
doing exactly what it says; see **FQ26**.
(`textContent` is no use as a second proof here: in dev it contains Next's
inline RSC payload scripts, which differ on every build.)

**R6 Home non-regression — a real A/B**, same element-capture method as TASK-007
(tag + class + leaf text + rect + `color` / `background-color` / `font-size` /
`font-weight` / `z-index` / `position` / `border-top-color` / `border-radius`),
captured on the pre-TASK-008 tree and again on mine:

| viewport | before | after | only-before | only-after |
|---|---|---|---|---|
| 1280x800 | 119 el | 119 el | **none** | **none** |
| 360x740 | 119 el | 119 el | **none** | **none** |

**Zero difference at both widths.**

**No horizontal scroll at 360px:** `/about` `scrollWidth` 360 = `clientWidth`
360; `/services` 360 = 360. The Thai q3 line wraps inside 320px (81px tall,
18px type) with no element overflow.

**A11y / structure preserved.** `/about`: all five
`section[aria-labelledby] -> h2[id]` pairs present (experience, skills, values,
certificates, testimonials), 24 tabbable stops, and my change adds no
interactive element — the two added nodes are `<p lang="th">` / `<p lang="en">`
inside a `blockquote`. `/services`: `div[tabindex=0, role=region,
aria-label="Services table"]`, 3x `th[scope=col]`, 6x `th[scope=row]`,
`section[aria-labelledby=process-heading]`, 17 tabbable stops with the table
region still sitting between the header nav and the CTA link.

`grep -rn "use client" src/components src/app` is **line-for-line identical** to
the snapshot (`diff` clean) — see FQ27 for the count.

### 3.1 Opening-block heights (SQ8 — reported, not acted on)

`.hero` wrapper `getBoundingClientRect().height`, live:

| route | 1280x800 | 360x740 |
|---|---|---|
| `/about` | **1243.03 px** | **532.88 px** |
| `/services` | **742.59 px** | **371.52 px** |

(`/services` at 1217px wide: 734.78 px.) `/about` is the tall one because
`ABOUT_INTRO.title` wraps to more `h1` lines than `SERVICES_INTRO.title` — the
`h1` scale itself is untouched.

### 3.2 Contrast — every pair I introduced or changed

Composited from the live computed values (page ground -> lattice -> section
surface -> glass -> text). "flat" is the case almost everywhere; "4-lattice" is
the worst pixel, a 64px MachineGround crossing where four grid lines stack.

| pair | px / weight | bar | flat | 4-lattice |
|---|---|---|---|---|
| label recipe on glass over a `surface` section (A3) | 13 / 600 | 4.5 | **6.95** | 6.95 |
| label recipe on `--site-surface`, sticky thead (B2) | 13 / 600 | 4.5 | **7.61** | 7.61 (opaque) |
| entry body text on glass (A2) | 16 / 400 | 4.5 | 7.52 | **5.84** |
| entry `.period` on glass | 13 / 400 | 4.5 | 7.52 | 5.84 |
| entry `.marker` accent on glass | 11 / 400 | 4.5 | 6.57 | 5.11 |
| entry `h3` role on glass | 20 / 700 | 3 | 15.34 | 15.34 |
| TechChip inside a panel | 12 / 400 | 4.5 | 7.52 | 5.84 |
| table body cell on the glass scroller (B2) | 15 / 400 | 4.5 | 7.52 | 5.84 |
| table `th[scope=row]` on the scroller | 16 / 600 | 4.5 | 11.93 | 11.93 |
| process `.number` accent on glass (B3) | 13 / 400 | 4.5 | 7.61 | 6.07 |
| process step `h3` on glass | 17 / 600 | 4.5 | 14.17 | 14.17 |
| process step body on glass | 15 / 400 | 4.5 | 8.60 | 6.95 |
| CTA `h2` on glass (B4) | 32 / 700 | 3 | 11.93 | 11.93 |
| CTA body on glass (B4) | 16 / 400 | 4.5 | 7.52 | 5.84 |
| q3 / q1 Thai on the page ground | 18 / 500 | 4.5 | 16.54 | 13.20 |
| q3 / q1 English translation | 15 / 400 | 4.5 | 12.90 | 10.29 |
| **`.organisation` on glass (A2)** — re-measured 2026-09-04 after FQ25(a) | **14 / 400** | **4.5** | **7.52 PASS** | **5.84 PASS** |

**Every pair is now at or above its bar.** That row read `4.23 / 3.29 FAIL` on
`--site-ink-faint` `#7d7596`; FQ25 answer (a) swapped this one call site to
`--mantine-color-dimmed`, and the live re-measurement on 2026-09-04 returns
**7.52 flat / 5.84 at the 4-lattice worst pixel** — exactly what Sober predicted
from the "entry body text on glass" row, because `.organisation` now computes to
the identical `rgb(169, 163, 186)` on the identical surface. Composite chain read
back live: `body rgb(11, 9, 22)` -> (worst pixel: 4x `rgba(164, 136, 255, 0.045)`)
-> `GlassPanel rgba(120, 96, 200, 0.1)` -> text `#a9a3ba`; the flat glass
composites to `rgb(21.9, 17.7, 39.8)`. Hierarchy is as Sober called it —
`.organisation`, `.period` and `.body` now share one colour and `.role` (the `h3`,
full ink) still carries the step down. **No new colour was added.**

### 3.3 The 0.046 ceiling on `/services` — D1 contributes exactly 0

Same computed-composite sampler as TASK-007 (live rects, live computed
`background-image`, premultiplied alpha, 1px steps over the whole aurora box).
`RouteHero .hero` reads back `background-color: rgb(11, 9, 22)` — **alpha 1** —
`position: relative` with `z-index: auto` (so it opens no stacking context),
while `MachineGround` is `fixed` at `z-index: -1`. The opaque hero ground
therefore paints over D1, and D1 cannot reach any pixel inside the box.

| viewport | aurora box | D1 removed | D1 on (4 lattice layers) | delta | worst point |
|---|---|---|---|---|---|
| 1280x800 | 1265 x 743 | 0.02323 | **0.02323** | **0.00000** | 228,30 `rgb(45,28,101)` |
| 1217x800 | 1202 x 735 | 0.02322 | **0.02322** | **0.00000** | 216,29 `rgb(45,28,101)` |
| 360x740 | 360 x 372 | 0.02322 | **0.02322** | **0.00000** | 65,15 `rgb(45,28,101)` |

**The predicted result is confirmed at all three widths**, peak 0.0232 against
the 0.046 ceiling (50% headroom). Nothing was retuned. For reference only: if
that opaque ground were ever removed, the same box reads 0.04208 — still under,
but that is not the shipped state. As in TASK-007: this is a computed composite,
not a pixel readback; **if a real readback ever contradicts it, the readback
wins.**

### Section 4 — SQ7, unticked on purpose

`ImageLightbox` is a Mantine `Modal` and no Modal opens on `develop`. I did not
open it, did not measure it, added no fallback, and did not touch
`AboutCertificates` / `AboutTestimonials` at all. The four "View certificate"
and five "Read full conversation" triggers are present and tabbable — rest state
only. **Everything about the lightbox's open state is UNVERIFIED.**

## Questions

**FQ25 — STOP-AND-ASK (3.2). `.organisation` falls under 4.5:1 because A2 put
the entries on glass.** `--site-ink-faint` `#7d7596` at 14px:

| background | ratio |
|---|---|
| page ground, no panel (before this TASK) | **4.56** pass |
| page ground + 4 lattice layers (before this TASK, worst pixel) | 3.64 fail |
| **glass panel over page ground (after A2, the ordinary case)** | **4.23 fail** |
| glass panel + 4 lattice layers (after A2, worst pixel) | 3.29 fail |

A2 moved the ordinary case from 4.56 to **4.23**: the glass fill lightens the
ground under a mid-grey that had almost no margin left. Note the 4-lattice
column was already failing before I touched anything (D1, from TASK-007) — a
separate pre-existing finding, not mine to close. Three ways out, all yours,
none of them tried:
(a) `.organisation` reads `--mantine-color-dimmed` instead of `--site-ink-faint`
on this one element (7.52 flat / 5.84 worst) — a one-line route-CSS change, but
a colour decision the TASK does not name;
(b) `--site-ink-faint` is re-mixed in `theme.ts` — **TASK-010 owns theme.ts**,
so it would have to move there;
(c) accept it and record it.
Tell me which. I have changed nothing.

> answer (Sober, 2026-09-03): **(a). Make exactly this one edit and nothing else:**
> `AboutExperience.module.css:35` — `color: var(--site-ink-faint)` becomes
> `color: var(--mantine-color-dimmed)`. That is a token swap between two tokens
> that already exist, not a new colour, so it does not cross the design-system
> boundary and does not need `theme.ts`. Your own 3.2 table already measures this
> exact pair on this exact surface: **7.52 flat / 5.84 at the 4-lattice worst
> pixel** (the "entry body text on glass" row is `--mantine-color-dimmed` at
> 16/400 on the same panel) — both clear 4.5, so re-measure it but expect no
> surprise. Re-report the row in 3.2 with the new values.
>
> Why not (b): `theme.ts` is TASK-010's, and re-mixing the token would silently
> move five other call sites on routes that are not built yet — a change I will
> not make blind. Why not (c): 4.23 is a fail on the ordinary case, and A2 caused
> it; I do not ship a regression I authored and call it accepted.
>
> Hierarchy check I made so you do not have to: `.organisation` moving to `dimmed`
> puts it on the same colour as `.period` and `.body`. That is fine — `.role` (the
> `h3`, full ink) still carries the step down to the sub-line, and size/family
> keep the three apart. Do not add a new colour to restore a third step.
>
> **Standing SA rule this creates (binds TASK-009, TASK-010, TASK-011).**
> `--site-ink-faint` is not used for text sitting on a `GlassPanel` surface, at
> any size or weight; on glass the faintest permitted text token is
> `--mantine-color-dimmed`. Where a route converts a surface to `GlassPanel` and
> an element inside it reads `--site-ink-faint`, swap that call site to
> `--mantine-color-dimmed` in that route's own CSS module — do not touch
> `theme.ts`. Known call sites this will reach: `BlogList.module.css:75`,
> `PortfolioGrid.module.css:53`, `ProjectModal.module.css:54` (TASK-009),
> `ContactChannels.module.css:53`, `ContactForm.module.css:17` (TASK-010).
> Swap only the ones whose surface actually becomes glass; report the rest.
>
> Not closed by this answer, and not yours: the 4-lattice worst pixel was already
> 3.64 for this element **before** TASK-008 (your own table). That is a D1/token
> finding on the page ground, it predates you, and I am carrying it to TASK-010
> as a named item rather than pretending (a) closed it.

**FQ26 — the retired-pattern grep and A2 contradict each other.** The DoD says
the grep must return nothing; A2 says "`.marker` keeps its current treatment",
and `.marker` is `text-transform: uppercase`. I followed A2 — it is the specific
instruction and it gives a reason — so the grep returns exactly one line,
`AboutExperience.module.css:54`, and I left the box unticked. Confirm A2 wins
and the grep should read "no retired pattern **other than `.marker`**", or tell
me to strip the caps from `.marker`; either is one edit.

Same root, second half: the label recipe's `text-transform: none` is why
`innerText` case-changes 8 skill labels and 3 table headers (R4 above). No
string in `src/constant` or in any `.tsx` changed — `diff -r src/constant` is
clean. I read that as intended by your own recipe, but it does mean the R4 box
as literally worded ("differs **only** by q3's two lines") cannot be ticked
unless you agree a CSS-casing change is not a text change. **Please tick it or
re-word it — I have not decided it for you.**

> answer (Sober, 2026-09-03), both halves — **you were right to stop, and you
> were right not to edit either way.**
>
> **Half 1 — A2 wins, the grep was the sloppy line.** `.marker` keeps
> `text-transform: uppercase`. A2 names it specifically and gives the reason (an
> accent badge with an icon, not a field micro-label); the grep is a blanket net
> I wrote to catch the *retired label pattern*, and it cannot tell the two apart.
> The DoD box is now re-worded above to permit exactly one hit —
> `AboutExperience.module.css` `.marker` — and nothing else. **Tick it against
> the new wording; strip no caps.** No other file in scope has a `.marker`, so
> TASK-009/010's copies of the grep need no change.
>
> **Half 2 — a CSS-casing change is not a text change under R4. Tick it.**
> R4 protects the owner's *strings*: added, altered, removed, translated,
> reordered, moved out of JSX. Your evidence shows none of that happened —
> `diff -r src/constant` clean and `ServicesTable.tsx` byte-identical is the
> falsifiable half, and it passes. What changed is how CSS renders those
> unchanged strings, and it changed because the section-0 label recipe I wrote
> says `text-transform: none`. That is my instruction doing what it says, inside
> REQ-002's declared scope (whole-site visual step-up), so it is mine to own and
> not a thing you decided.
>
> The box is re-worded above to separate the two claims: source-string identity
> (hard, falsifiable) and rendered `innerText` (q3/q1 plus *case-only* deltas on
> the de-uppercased elements, enumerated). Keep your enumeration — 8 skill labels
> on `/about`, 3 table headers on `/services` — it is the evidence for the box.
>
> One thing I am not deciding for the owner: 11 visible labels change case on the
> live site. That is a visual change he may want to see before it ships, so I am
> telling Porter it happened and why. It does **not** block you and it does not
> come back to you — if the owner dislikes it, the recipe changes at spec level,
> not in a route file.

**FQ27 — a DoD number that does not match the repo (not a blocker).** The box
says `grep -rn "use client" src/components src/app` should return "the same four
files as at HEAD". The real repo returns **11 lines / 10 files** (plus one
comment line in `app/layout.tsx`), both before and after my change — I verified
by diffing the grep output against the pre-TASK-008 snapshot and it is
**identical**. I ticked the box on "identical to before", which is what the
check is actually for. Worth correcting in TASK-009 / 010 / 011, which copy the
same wording.

> answer (Sober, 2026-09-03): **confirmed — you read the check correctly, the
> number was mine and it was wrong.** I verified in the repo: `grep -rn` returns
> **11 lines** on the current tree. The box now reads "byte-identical to HEAD's"
> in TASK-008, **and I corrected the same wording in TASK-009, TASK-010 and
> TASK-011** so it does not bounce three more times. Your tick stands.

**FQ28 — informational, no action asked.** `/about`'s opening block is 1243px at
1280x800 (3.1) — the number Porter is holding SQ8 open for, unchanged from
TASK-007's measurement. `/services` is 743px.

> answer (Sober, 2026-09-03): received and relayed; SQ8 is Porter's, nothing owed
> by you. Do not change the `h1` scale or the hero padding to shrink it.

---

### Sober's close-out list for TASK-008 (2026-09-03) — do exactly this, then REVIEW

1. `AboutExperience.module.css:35` — `--site-ink-faint` → `--mantine-color-dimmed`
   (FQ25). **One line. Nothing else changes.** Re-measure that 3.2 row and
   re-report it; re-run tsc, the build, and the six-route console pass, since the
   tree changed.
2. Re-tick the three re-worded DoD boxes (retired-pattern grep, R4 text check,
   `use client` grep) against their **new** wording, keeping the evidence you
   already pasted.
3. **The SQ7 gate stands unchanged for this TASK.** QA ran an independent repro
   on 2026-09-03 (`tests/TEST-002-...`) and all three Modal/Drawer triggers open,
   paint and close on local `next dev` — that contradicts FQ13's premise, and it
   is a fact for me, not an instruction for you. It does **not** re-open section 4:
   the lightbox's open state stays UNVERIFIED and those boxes stay unticked on
   purpose. Do not go and verify the modal look now; whether the gate lifts is a
   call I make after TEST-003, and it will never arrive as extra work bolted onto
   this TASK.
4. **DEF-1 is not yours and must not be fixed here.** QA found all nine
   `ImageLightbox` thumbnails on `/about` rendering 0x0. The cause is in
   `src/components/common/ImageLightbox.module.css`, which is outside this TASK's
   allowed diff, and I have placed it in **TASK-012**. If you notice the blank
   thumbnails while re-verifying `/about`, that is expected and already recorded —
   leave it, and keep `git diff --stat` limited to
   `partials/About` + `partials/Services` as the DoD says.

> **done (Fern, 2026-09-04) — all four items, nothing else.**
> 1. `AboutExperience.module.css:35` swapped, one line, `git diff --stat` shows that
>    file and no other. Row re-measured: **7.52 flat / 5.84 worst**, both pass.
>    tsc 0, build 0 with no warning line, six-route console pass re-run at both
>    viewports — all in §Implementation Notes "Close-out pass".
> 2. The three re-worded boxes are ticked against their **new** wording, with the
>    earlier evidence kept. Every DoD box is now ticked.
> 3. SQ7 gate obeyed — I did not open, measure or work around the lightbox, and I
>    did not go looking at the modal after reading QA's result. Section 4 stays
>    UNVERIFIED and is named as such.
> 4. DEF-1 left alone. `ImageLightbox.module.css` untouched; the diff never leaves
>    `partials/About`.
>
> Two things for you, neither a question I need answered to be reviewed:
> (i) I did **not** physically re-run the R4 innerText diff or the R6 Home A/B on
> this tree — the delta is one `color` declaration and I verified by import graph
> that `AboutExperience` reaches only `/about`. Say the word and I repeat them.
> (ii) An untracked `front/.next.zip` sits in the repo; it predates this session
> and is not my footprint.

## Review

### Verdict (Sober, 2026-09-04): **DONE.**

Every instruction in sections 0-4 landed, and nothing else did. I re-read the real
tree rather than trusting the notes; below is what I verified myself and what I am
accepting on Fern's paste, stated separately so the difference is not blurred.

**Verified by me, independently (static read of `front/src` + git, 2026-09-04):**

- **The close-out edit is exactly one line and only one line.** `git status --short`
  in the repo shows a single modified file, `AboutExperience.module.css`; `git diff
  --stat` = `1 file changed, 1 insertion(+), 1 deletion(-)`. `.organisation` reads
  `color: var(--mantine-color-dimmed)`. FQ25 (a) is executed as answered.
- **`--site-ink-faint` is gone from this TASK's scope.** `grep -rn "site-ink-faint"
  src/components/partials/About src/components/partials/Services` → no hits (exit 1).
- **Retired-pattern grep** returns exactly one line —
  `AboutExperience.module.css:54 text-transform: uppercase` — and it is `.marker`,
  the single hit the re-worded box permits. Nothing else.
- **A1** `AboutValues.tsx` is `<Title order={3}>`; no `h4` and no font-size override.
- **A2** entries are `GlassPanel as="article" tone="node" glow={Boolean(entry.featured)}`;
  `.list` is a 24px (`--mantine-spacing-lg`) stack; `border-top` / `border-bottom` /
  `padding-block` / the whole `.featured` rule are gone; the 62em two-column grid,
  `.period`'s mono + `tabular-nums`, `.marker`, and the inline `Fastest delivery`
  string at its original position are all intact.
- **A3** groups are `GlassPanel as="div"`; `.label` carries the section-0 recipe
  verbatim (six declarations, no extras); `.groups` gap is `--mantine-spacing-lg`.
- **A4 confirmed by git, not by eye:** `AboutCertificates*` and `AboutTestimonials*`
  do not appear in the commit that carries this work (`46aef59`) nor in the working
  tree — genuinely byte-identical, as claimed.
- **A5 / B5** each quote block is exactly the dictated four lines, alone in its own
  `PageSection density="tight"` — q3 between Values and Certificates, q1 immediately
  above the CTA section. Deleting the block is the whole rollback, as SQ3 requires.
- **B1** `RouteHero` then `<ServicesTable/>` in its own tight `PageSection`;
  `.scroller` has no `margin-top` left.
- **B2 held, and my SPEC correction held with it.** `ServicesTable.tsx` is absent
  from the commit and unmodified — `role="region"`, `aria-label="Services table"`,
  `tabIndex={0}`, 3x `scope="col"`, `scope="row"` all still in source. `.scroller`
  is the glass surface, the row rule is `--site-glass-border`, and `thead th` takes
  the recipe **while keeping** `position: sticky` + `background-color:
  var(--site-surface)`.
- **B3** steps are `GlassPanel as="li" tone="node"`, `.step` is gone, `.number` is
  `` `${classes.number} site-numeric` `` with its mono/tabular values untouched;
  `site-numeric` exists at `globals.css:91` and is the same class `HomeCapabilities`
  and `HomeStats` use — a real alignment, not a new device.
- **B4** `.cta` is `GlassPanel glow padding="lg"`; border, `background-color` and
  padding are out of the module; the grid/columns/gaps and the Button, its `href`
  and its label are unchanged.
- **Design-system boundary intact:** zero hex literals, zero `!important`, zero
  `use client` anywhere in `partials/About` + `partials/Services`. No new token was
  invented — `--site-glass-bg` / `--site-glass-border` already exist in `theme.ts`.
- **Scope of the whole TASK, now provable by git.** The human committed the tree as
  `46aef59` on 2026-09-02 23:43, so the "the diff cannot isolate my work" caveat in
  the notes has been overtaken by events: that commit touches **exactly the 12
  About/Services files Fern lists and no thirteenth**. `theme.ts`, `globals.css`,
  `AuroraBackdrop`, `GlassPanel`, `MachineGround`, `RouteHero`, `TechChip` and
  `SiteShell` also ride in that commit — those are **TASK-006's and TASK-007's**
  already-reviewed work being committed at the same time, not TASK-008 spill.
  `package.json` is not in it at all.
- **Import graph, checked not assumed:** `AboutExperience` is imported only by
  `AboutContent`, which is imported only by `src/app/about/page.tsx`. The changed
  CSS module has no other consumer.

**Accepted on Fern's evidence, not re-run by me** (runtime facts I cannot produce
from a static read, named so silence is not read as my own verification): `tsc` 0,
`npm run build` 0 with no warning line, the six-route console pass at both
viewports, the live heading outlines, the 360px no-horizontal-scroll readings, the
3.1 heights, the 3.2 contrast composites and the 3.3 D1 table.

**On the one number that mattered — the 3.2 `.organisation` row.** I did not
re-measure it. What I can assert from source is the mechanism: `.organisation` now
resolves to the identical token, on the identical panel, at the same 400 weight as
`.body`, whose row in the same table was already measured at 7.52 / 5.84. Fern's
re-measurement returns exactly those two numbers and reads back
`rgb(169, 163, 186)` for both. Internally consistent and consistent with my
prediction — but it is **his live measurement, not mine**; if a later readback ever
disagrees, the readback wins and this row re-opens.

**The two FYIs, decided so they do not linger:**

- **(i) R4 innerText and R6 Home A/B not physically repeated — accepted, no re-run
  ordered.** The close-out delta is one `color` declaration: it adds, removes and
  moves no string, so `innerText` cannot shift; and the import graph above (which I
  verified myself) shows the module cannot reach `/`. Repeating them would produce a
  known-null result. The 2026-09-02 captures stand as the evidence for both boxes.
- **(ii) `front/.next.zip`** — untracked, predates the session, not Fern's footprint
  and not in his diff. Not a review finding against him; relayed to Porter as a repo
  hygiene item for the human, since only the human touches the repo's git state.

**Still open on purpose, and correctly so:** section 4 / SQ7 — the lightbox's open
state is UNVERIFIED, unticked, unmeasured and un-worked-around. Fern read QA's
cannot-reproduce and did **not** go and verify the modal look, which is exactly what
the gate asked. Whether the gate lifts remains my call after TEST-003, and it is not
bolted onto this TASK. **DEF-1 is untouched** — `ImageLightbox.module.css` is not in
the diff — and stays TASK-012's, blocked on SQ10.

**Carried forward, not closed by this TASK** (already placed, repeated here so the
trail is one hop): the `--site-ink-faint` 4-lattice 3.64 fail on the *page ground*
predates TASK-008 → named item on TASK-010; the standing SA rule from FQ25
(`--site-ink-faint` never carries text on a `GlassPanel`; swap per route CSS module,
never `theme.ts`) binds TASK-009/010/011; the 11 case-only label changes are with
Porter as an FYI for the owner and do not come back to Fern.

**No REWORK items. Nothing owed by Fern on TASK-008.** Next for him is **TASK-009**
(TODO) — one correction to carry: snapshot baselines are now `HEAD = 46aef59`, since
the tree that was uncommitted during TASK-008 has been committed by the human.
