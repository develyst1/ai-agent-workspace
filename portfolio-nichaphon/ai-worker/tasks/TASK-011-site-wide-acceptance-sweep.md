# TASK-011: Site-wide acceptance sweep

- Source: SPEC-002
- Status: **DONE** (reviewed by Sober 2026-09-04 — see §Review)
- Owner: Fern (FE)
- Depends on: TASK-008, TASK-009, TASK-010 **and TASK-012** — **all four are now
  `DONE` (2026-09-04), so this TASK is unblocked and is the last piece of
  SPEC-002.** TASK-012 was put in front of it on purpose: this sweep reads the
  state that repair creates, so sweeping first would have banked a known-fail.
  Baseline is still `HEAD=46aef59` with 20 modified files in the tree.
- Repo: `portfolio-nichaphon-web`, everything under `front/`

**This task changes no design and adds no feature.** It is the evidence pass that
lets me set REQ-002 `SPEC_DONE` and lets Porter run acceptance without guessing.
Same shape as TASK-005 did for REQ-001.

**If a check fails, do not fix it here.** Record it, and say which task it
belongs to. A fix invented inside a sweep is a change nobody specified.
The one exception is a typo-scale slip in a file *this* sweep's own checks prove
wrong (a missing `aria-label`, a stray debug attribute) — and even then, say so.

---

## 1. Build and console

- [x] `npx tsc --noEmit` exits 0. Paste it.
- [x] `npm run build` exits 0 with **no warning line**, and reports the same page
      count as HEAD. Paste the route table. Delete `.next` afterwards.
- [x] `npm run dev`, then **all six routes** (`/`, `/about`, `/services`,
      `/portfolio`, `/blog`, `/contact`) at **1280x800** and **360x740**: console
      empty of errors *and* warnings. One line per route per viewport.
- [x] No horizontal scroll at 360px on any of the six.
- [x] Every header nav link and every footer nav link reaches its route (click
      them; a 404 or a client-side error is a finding).
- [x] `git diff package.json package-lock.json` is **empty** — no dependency was
      added by any of the three tasks.

## 2. The retired patterns are gone, site-wide

Run from `front/` and paste both the command and the result. Expect exit 1 / no
output for each.

- [x] `grep -rn "gap: 1px" src/`
- [ ] `grep -rn "text-transform: uppercase" src/components/partials src/components/ui`
- [x] `grep -rn "radius-xs" src/components`
- [ ] `grep -rn 'variant="default"' src/components`
- [x] `grep -rn "site-hairline" src/components/partials` — this one is **expected
      to return hits** and is not a failure; list them and say what each one is,
      so the survivors are a decision on the record and not an oversight.

## 3. Content — R4, the hardest criterion

- [ ] `document.body.innerText` for each of the six routes, captured against the
      current tree and against pristine HEAD, diffed:
      - `/`, `/portfolio`, `/blog`, `/contact` — **zero differences**.
      - `/about` — differs **only** by q3's two lines.
      - `/services` — differs **only** by q1's two lines.
      Paste each diff. Any other difference is a finding, however small.
- [x] **Quote count and placement:** `/` has 2 (q4 hero, q2 band), `/about` 1
      (q3), `/services` 1 (q1), `/portfolio` `/blog` `/contact` 0. Count the
      rendered `<blockquote>` elements per route, do not infer from the source.
- [x] **Quote strings are character-exact** against
      `constant/content/quotes.ts` — every rendered Thai and English line, with
      its `lang` attribute. Compare the **leaf** paragraph nodes; ancestor
      containers concatenate the Thai and English leaves and will show a false
      mismatch (recorded in TEST-001, do not re-report it).
- [x] q3's Thai and q1's Thai wrap without overflow at 360px.

## 4. Semantics and accessibility

- [x] Heading outline per route, listed level by level, **no skipped level on any
      of the six**. Specifically: `/about` is `h1 h2 h3` (TASK-008 A1) and
      `/portfolio` is `h1 h2` (TASK-009 P2).
- [x] Every `aria-labelledby` on a `PageSection` still resolves to an existing
      `id`. List the pairs.
- [ ] The skip link reaches `#main` on all six routes, and the focus ring from
      `globals.css` is visible on links, buttons, inputs, the accordion control,
      the blog filter buttons and the portfolio card trigger.
- [x] `grep -rn "use client" src/components src/app` output is **byte-identical
      to HEAD's**. Name the files. (Corrected by Sober 2026-09-03, FQ27: the real
      repo returns 11 lines, not four — identity to HEAD is the check, never a
      count.)
- [x] Tab order on each route is source order; no positive `tabindex` anywhere.

## 5. Contrast and the luminance ceiling

- [ ] One consolidated **contrast table** for the whole site: every text /
      background pair introduced or changed by TASK-008, 009 and 010, with the
      measured ratio and its bar (4.5:1 body, 3:1 large). Nothing under its bar.
      Duplicates across the three tasks are fine — this table is the one Porter
      will be shown.
- [x] **The 0.046 ceiling, one last time.** For every aurora block on the site
      (Home hero, Home band, and the five `RouteHero` blocks) at
      **1217 / 1280 / 360**: peak relative luminance as rendered, and the same
      with D1 removed at runtime. **Expected: D1 contributes 0 everywhere and no
      peak exceeds 0.046.** Paste the table. A breach is a stop-and-ask to me —
      **retune nothing.**

## 6. The step-up devices, honestly reported

- [x] **Opening-block heights**, all five routes, both viewports, in one table.
      This is the answer SQ8 is waiting on. Report the numbers; draw no
      conclusion from them — the judgement is the owner's.
- [x] `tone="node"` is rendered by at least one real consumer on each of About,
      Services and Portfolio (it had none at TASK-007, so it was computed-only
      then). Name them.
- [x] `MachineGround` renders once per document, not once per section.

## 7. UNVERIFIED — carry these forward, do not tick them

List these explicitly in the notes, each with its reason, so nobody later reads
silence as a pass:

- [ ] **The `Modal` skin and every modal-dependent look** — `ProjectModal`,
      `ImageLightbox` (About certificates + testimonials): no `Modal` opens on
      `develop` (SPEC-002 SQ7, with Porter).
- [ ] **`Drawer` / mobile navigation** — same defect, same SQ7.
- [ ] **`prefers-reduced-motion: reduce` rendering** — the rule is verifiable in
      the CSSOM; the OS flag was not emulable (TASK-004, TASK-007 FQ23).
- [ ] **Perceptibility of the lattice and of the circuit edge** — measurable, not
      assertable by you or by me. QA's eye, via Porter (SQ8).
- [ ] Anything the T1 alert measurement could not render (TASK-010 section 3).
- [ ] **`/contact`'s form behaviour** — the three fields accepting input,
      `required` blocking an empty submit, the submit button's **loading label**,
      and the `mailto:` string being byte-identical to HEAD's. Unverified at
      TASK-010 (no real submit was fired, on purpose). **Do not fire a real
      submit to tick it either** — if your harness still cannot render it,
      record it as carried and say why.
- [ ] **The accordion's rendered open/close and its new hover ground** —
      `/contact` FAQ, by mouse and by keyboard, with the focus ring visible.
      T3 is verified *as a cascade* (two `getComputedStyle` reads, 14.42:1) but
      **nobody has seen it paint**: TASK-010 FQ35 found this harness runs no
      animation frame and will not scroll. Whether a 10% wash is a strong enough
      hover affordance is an eye question, not a number — it is with QA under
      SQ8, not with you. Report, do not fix.
- [ ] **`--site-ink-faint` on the page ground under 4 stacked lattice lines
      measures 3.64:1** (TASK-008 3.2/FQ25, a pre-existing D1 finding — it failed
      before TASK-008 touched anything). The 2026-09-03 standing rule only bars
      the token from glass; on the page ground it is untouched and still under
      the bar at the worst pixel. Re-measure it site-wide and report the call
      sites. **Do not fix it here** — the fix is a token re-mix in
      `cssVariablesResolver`, which no current TASK is allowed to make; it is an
      SA decision that needs its own task.
- [ ] **DEF-1's repair, at the level nobody has reached yet — the *painted*
      thumbnail** (TASK-012, `DONE` 2026-09-04). The box is fixed and proved:
      `display: block` on `.frame`, nine non-zero rects at both viewports at the
      intended ratios, rendered A/B against HEAD. What is still unseen is the
      **image inside that box** — the harness will not scroll, so the nine lazy
      images never intersect and never load; Fern decoded all nine assets
      through the optimizer instead. Try once more here; if your harness still
      will not scroll, record it as carried and say why. **Do not re-fix
      anything** — the repair is reviewed and closed. The authoritative
      before/after is **REGRESSION S13** ("no image at 0x0"), which is QA's to
      re-run, not yours.

## Definition of Done

- [x] Every box in sections 1-7 is either ticked with pasted evidence, or left
      unticked with a one-line reason. **A box ticked without its evidence is a
      REWORK on its own.**
- [x] Findings, if any, are listed with the task each belongs to — not fixed here.
- [x] `git status` shows no file changed by this task (it is a read-and-measure
      pass), or, if the one exception above was used, exactly the files it names.
- [x] `.next` deleted, dev server stopped.
- [x] **No git write, no branch, no commit, no deploy, no `pm2`, no ssh, and
      production (`portfolio.develyst.online`) is never opened.**

## Implementation Notes

Fern, 2026-09-04. **Nothing in the repo was changed by this sweep** — closing
`git status` is the same 20 modified files + the human's `front/.next.zip`.
25 of 39 boxes ticked; 5 left unticked as findings; section 7's 9 carried.

### Harness setup (read this before judging any "unverified")

Ports **3010 and 3011 were already held** by two orphan `node` processes I did
not start and could not prove were mine, so I left them alone. One of them is a
dev server pointed at the real repo: it started returning 500 the moment I
deleted `front/.next`, and it will recreate that folder on its own. **I did not
kill it** — flagging it instead (FQ36).

So the A/B ran on two hermetic copies instead of on the repo:

- `head` = `git archive HEAD` (`46aef59`), pristine → port **3021**
- `cur` = same archive + the 20 modified files copied over → port **3020**

`cur` was proved content-identical to the real worktree: 143 tracked files under
`front/` compared, **0 real mismatches** (EOL-normalised; `git archive` emits LF,
the worktree is CRLF). Both sides are LF, so the comparison is like-for-like.
Two false starts are worth recording so nobody repeats them: a `node_modules`
junction **across drives** (C: → H:) breaks webpack module resolution outright
(`Can't resolve './H:/…/next/dist/client/app-next-dev.js'`), and the symptom it
surfaces as is a misleading `ENOENT … fallback-build-manifest.json` + HTTP 500.
Same-volume junction on H: works. Both copies and both servers are now gone.

### 1. Build and console

```
$ npx tsc --noEmit          → TSC_EXIT=0
$ npm run build             → BUILD_EXIT=0, no warning line, 10/10 static pages
Route (app)                Size  First Load JS
┌ ○ /                    2.97 kB   283 kB
├ ○ /_not-found            996 B   103 kB
├ ○ /about               2.89 kB   280 kB
├ ○ /blog                5.61 kB   283 kB
├ ○ /contact             4.33 kB   281 kB
├ ○ /portfolio           7.05 kB   284 kB
└ ○ /services            2.73 kB   283 kB
+ First Load JS shared by all      102 kB
```

Page count vs HEAD is **measured, not argued** — I built the pristine HEAD tree
too (exit 0, same 10/10, same 7 routes). Its table is in FQ37 below, because the
sizes are not the same and that is a finding.

`.next` deleted after the build **and** after dev. `git diff` on
`front/package.json` and `front/bun.lock` is **empty** (there is no
`package-lock.json` in this repo — it uses `bun.lock`; both were checked).

Console, **12 route/viewport combinations on `cur` plus 6 on `head`**: the only
console output on the entire sweep is the React DevTools `[info]` notice, one per
page load. **Zero errors, zero warnings** on `/`, `/about`, `/services`,
`/portfolio`, `/blog`, `/contact` at 1280x800 and at 360x740.

No horizontal scroll at 360 on any of the six — `documentElement.scrollWidth ==
clientWidth == 360` on all six. One near-miss worth naming and **not** a failure:
on `/services` the pricing `<table>` really is 908px wide at a 360px viewport, but
it is contained by `ServicesTable_scroller` with `overflow-x: auto` (w=320,
scrollWidth=887). The page itself never scrolls sideways.

Nav links, clicked (not inferred), at 1280: all 6 header links and all 5 footer
route links land on the right route with the right `h1` and `<title>`, **0 errors,
0 unhandled rejections**. The footer `mailto:` was deliberately not clicked.

### 2. Retired patterns

```
$ grep -rn "gap: 1px" src/                                              → exit 1, no output
$ grep -rn "radius-xs" src/components                                   → exit 1, no output
$ grep -rn "text-transform: uppercase" src/components/partials src/components/ui
  src/components/partials/About/AboutExperience.module.css:54           → 1 hit
$ grep -rn 'variant="default"' src/components
  src/components/partials/Home/HomeHero.module.css:140                  → 2 hits
  src/components/ui/ColorSchemeToggle/ColorSchemeToggle.tsx:17
$ grep -rn "site-hairline" src/components/partials
  src/components/partials/Blog/BlogFilter.module.css:11                 → 2 hits (expected)
  src/components/partials/Portfolio/Modal/ProjectModal.module.css:50
```

Two boxes left unticked because the grep as written did **not** come back clean:

- **uppercase**: the single hit is `.marker`, `AboutExperience`'s mono eyebrow —
  the device TASK-008 A2 introduced and you already accepted at review. It is
  **byte-identical at HEAD** (`git show HEAD:…` also line 54), so this sweep did
  not create it. Not fixed; your call whether the grep or the device should move.
- **`variant="default"`**: neither hit is a live retired pattern. `HomeHero.module.css:140`
  is a **comment naming the pattern as retired**; `ColorSchemeToggle.tsx:17` is a
  real Mantine prop, but the component has **no consumer** — grepping the whole
  of `src/` finds only its own definition and two barrel re-exports, so it is a
  dead export on a dark-only site. Both are HEAD-identical. Report, not fix.

The two `site-hairline` survivors, as asked, each with what it is:
`BlogFilter.module.css:11` — the filter row's 1px container border (HEAD-identical,
same line). `ProjectModal.module.css:50` — the modal footer's top rule; it moved
from line 49 to 50, content unchanged, and it is **inside the modal that never
opens** (SQ7), so nobody has seen it either way.

### 3. Content — R4

Method: `document.body.innerText` captured on both servers, hashed (FNV-1a) with
its length; identical hash + identical length = zero differences. Where the hash
differed I pulled both full texts and diffed them by hand.

| route | cur @1280 | head @1280 | cur @360 | head @360 | verdict |
|---|---|---|---|---|---|
| `/` | `fdc92019` / 1628 | `fdc92019` / 1628 | `f884f3f2` / 1555 | `f884f3f2` / 1555 | **zero differences** |
| `/about` | `ac9d083e` / 4055 | `ac9d083e` / 4055 | `c9440bff` / 3982 | `c9440bff` / 3982 | **zero differences** |
| `/services` | `498a023c` / 2669 | `498a023c` / 2669 | `e5fc6d09` / 2596 | `e5fc6d09` / 2596 | **zero differences** |
| `/portfolio` | `ada6ae89` / 2655 | `ada6ae89` / 2655 | `fc8e97c8` / 2582 | `fc8e97c8` / 2582 | **zero differences** |
| `/blog` | `394e2954` / 1954 | `394e2954` / 1954 | `6a98f99b` / 1881 | `6a98f99b` / 1881 | **zero differences** |
| `/contact` | `ad750641` / 867 | `c38c2e21` / 867 | `24434688` / 794 | `e164a528` / 794 | **3 lines differ** |

Box 3.1 is **unticked**, for two separate reasons, and neither is a silent pass:

1. **The criterion as written cannot be met, because the baseline moved.** It
   expects `/about` to differ by q3's two lines and `/services` by q1's. The
   human committed TASK-008 as `46aef59`, so q3 and q1 are **already in HEAD** —
   both routes now come back byte-identical, which is the stronger result but not
   the one the box describes. Flagging rather than reinterpreting your wording.
2. **`/contact` is not zero-difference.** The whole diff, at both viewports, is
   three `<dt>` labels changing case — `EMAIL → Email`, `PHONE → Phone`,
   `LOCATION → Location`. Identical character count (867 = 867, 794 = 794), no
   source string touched. This is exactly **FQ31**, which you accepted on
   2026-09-04; I am recording it as the difference it is rather than ticking past it.

Quotes (rendered `<blockquote>` counted, never inferred from source): `/` 2,
`/about` 1, `/services` 1, `/portfolio` 0, `/blog` 0, `/contact` 0 — as specified.
Character-exactness was compared by script against `constant/content/quotes.ts`
on the **leaf** paragraphs, per your TEST-001 warning: **8 leaves, 8 EXACT
MATCHES, 0 mismatches**, every `lang` attribute correct (q4 en 29ch; q2 th 42 /
en 46; q3 th 90 / en 130; q1 th 48 / en 79). q3's Thai and q1's Thai wrap without
overflow at 360 (`scrollWidth == clientWidth == 320` on every quote paragraph).

### 4. Semantics and accessibility

Heading outline, current tree, no skipped level on any of the six:

| route | outline | note |
|---|---|---|
| `/` | `H1 H2 H3 H3 H3 H3` | unchanged from HEAD |
| `/about` | `H1 H2 H3x3 H2 H3x8 H2 H3x3 H2 H3x4 H2` | unchanged from HEAD; A1 holds |
| `/services` | `H1 H2 H3 H3 H3 H3 H2` | unchanged from HEAD |
| `/portfolio` | `H1 H2x9` | **HEAD is `H1 H3x9`** — P2's skip fix, proved by A/B |
| `/blog` | `H1 H2x6` | unchanged from HEAD |
| `/contact` | `H1 H2 H2` | unchanged from HEAD |

`aria-labelledby` pairs, all resolving to a real `id`: `/` capabilities-heading ·
`/about` experience-, skills-, values-, certificates-, testimonials-heading ·
`/services` process-heading · `/contact` channels-heading, faq-heading + the four
Mantine-generated accordion control ids. `/portfolio` and `/blog` carry **none** —
not a regression (HEAD has none either), just worth being on the record.

`grep -rn "use client" src/components src/app` → **11 lines, byte-identical to
HEAD**: ImageLightbox, SiteHeader, BlogContent, BlogFilter, ContactForm,
ProjectModal, PortfolioContent, PortfolioGrid, UIProvider, ColorSchemeToggle
(all `:1:'use client';`) + `app/layout.tsx:17`, which is the comment line FQ27
already explained.

Tab order is source order on all six and **no positive `tabindex` anywhere** —
the only `tabindex` values in the whole site are `0` on `/services` (the table
scroller, so a keyboard user can scroll it) and `-1` on `/contact`.

Skip link: present on all six, `href="#main"`, `#main` exists on all six, and on
`:focus-visible` it moves from `left: -9999px` to `left: 8px; top: 8px` — the
reveal works.

**Box 4.3 is unticked**, and this is the sweep's one genuinely new accessibility
finding — see FQ38. The focus ring is fine on 6 of 7 required targets but
**absent on the form fields**.

### 5. Contrast

Method: for every element carrying a text node, composite the whole background
stack (translucent layers included) down to the first opaque ancestor; where the
element sits inside an aurora block, composite against the **aurora's peak pixel**
instead of the flat base, i.e. the worst case rather than the average. Bars: 4.5:1
body, 3:1 large (>=24px, or >=18.66px at weight >=700). Measured at 1217.

| route | text elements checked | unique pairs | under bar |
|---|---|---|---|
| `/` | 51 | 28 | **0** |
| `/about` | 141 | 35 | **0** |
| `/services` | 99 | 27 | **0** |
| `/portfolio` | 102 | 19 | **0** |
| `/blog` | 71 | 23 | **0** |
| `/contact` | 44 | 26 | **1** |

Tightest passing pairs, so the margin is on the record rather than implied:
`HomeHero_role` and `HomeHero_lead`, `rgb(169,163,186)` over the hero aurora's
peak `rgb(59,35,133)` = **4.89:1** against a 4.5 bar. Every other body pair is
5.25:1 or better; the `SectionHeading_eyebrow` over the route aurora peak is
5.25:1; the CTA `rgb(11,9,22)` on `rgb(139,102,255)` is 5.11:1.

The single failure is on `/contact` and it is **pre-existing**, not ours — the
three `required` asterisks, Mantine's `--mantine-color-error` `#e03131` on the
page ground = **4.37:1** against a 4.5 bar. Measured on **both** trees: 4.37:1 at
HEAD `46aef59` and 4.37:1 now, same colour, same 3 elements. Same class as FQ25:
the fix is a token, so it is an SA decision and not this sweep's. Box 5.1 stays
unticked because the box says "nothing under its bar" and one thing is.

Sampler validation, as the standing practice requires: it independently
reproduces your published TASK-007 figure — Home band peak **0.04099** against
your 0.04116 — and the FQ25 row exactly: `--site-ink-faint` **4.23:1 on glass**,
**3.64:1** on the page ground under 4 stacked lattice lines, 4.56:1 on the bare
ground.

### 5b. The 0.046 ceiling — 7 aurora blocks x 3 widths

D1 removal was **executed, not reasoned**: `MachineGround` was hidden at runtime
and every block re-measured. The peak is a real per-pixel composite — each radial
gradient's alpha is evaluated at 161x101 sample points across the box and the
layers composited in paint order — not a max-of-stops upper bound, which would
have read a misleading 0.0825 on Home's hero from three gradients that cannot all
peak at the same pixel.

| block | base | 1217 | 1280 | 360 | D1 delta | ceiling 0.046 |
|---|---|---|---|---|---|---|
| Home hero | `rgb(11,9,22)` opaque (`HomeHero_hero`) | 0.03856 | 0.03856 | 0.03856 | **0** | PASS |
| Home band | `rgb(21,17,34)` opaque (`HomeStatement_band`) | 0.04099 | 0.04099 | 0.04099 | **0** | PASS |
| `/about` RouteHero | `rgb(11,9,22)` opaque (`RouteHero_hero`) | 0.02317 | 0.02317 | 0.02317 | **0** | PASS |
| `/services` RouteHero | same | 0.02317 | 0.02317 | 0.02317 | **0** | PASS |
| `/portfolio` RouteHero | same | 0.02317 | 0.02317 | 0.02317 | **0** | PASS |
| `/blog` RouteHero | same | 0.02317 | 0.02317 | 0.02317 | **0** | PASS |
| `/contact` RouteHero | same | 0.02317 | 0.02317 | 0.02317 | **0** | PASS |

Worst peak on the site is **0.04099**, 11% under the ceiling. D1 contributes
**exactly 0** in all 21 measurements, and now for a reason that was checked rather
than assumed: every block's `baseOpaque` is `true`, so the fixed lattice at
`z-index: -1` is occluded before it can composite. Width-invariance is expected
(the gradients are percentage-geometry and no width media query touches `.aurora`,
`.hero`, `.band` or `.route`) and the three columns confirm it. **Nothing retuned.**

### 6. Step-up devices

Opening-block heights, measured (`getBoundingClientRect().height`), for SQ8.
**Numbers only — no judgement, that is the owner's.**

| route | 1280 | 1217 | 360 |
|---|---|---|---|
| `/` (HomeHero) | 800.00 | 800.00 | 769.56 |
| `/about` | 1241.28 | 1225.68 | 531.13 |
| `/services` | 740.84 | 733.04 | **369.77** |
| `/portfolio` | 991.06 | 979.31 | 413.92 |
| `/blog` | 865.95 | 856.24 | 413.92 |
| `/contact` | 740.84 | 733.04 | 369.77 |

`/services` at 360 (**369.77**) is the fifth height SQ8 was still missing. My
1280 figures run 1-2px under the ones already on the board (`/about` 1241.28 vs
1243, `/portfolio` 991.06 vs 992.81, `/blog` 865.95 vs 867.70, `/contact` 740.84
vs 742.59) — consistent, and small enough to be font-metric settling; the older
numbers are not wrong, they were taken on a differently warmed page.

`tone="node"` now has a real consumer on each of the three routes, counted in the
DOM as elements carrying `GlassPanel_node`: **About** — `AboutExperience`,
3 `<article>` · **Services** — `ServicesProcess`, 4 `<li>` · **Portfolio** —
`PortfolioGrid`, 9 `<article>`. `/blog` renders 0 by design (B3 chose
`tone="plain"`), `/` and `/contact` 0.

`MachineGround` renders **exactly once per document** on all six routes (`mg: 1`
everywhere), never once per section.

### 7. Carried UNVERIFIED — all 9, each with its reason

1. **`Modal` skin / `ProjectModal` / `ImageLightbox`** — still unopened, SQ7,
   with Porter. Not chased.
2. **`Drawer` / mobile nav** — same defect, same SQ7. Consequence for this sweep:
   the nav click-through in section 1 could only be done at 1280, where the links
   are in the header; at 360 they are behind the burger.
3. **`prefers-reduced-motion: reduce` as rendered** — the flag is still not
   emulable here (`matchMedia('(prefers-reduced-motion: reduce)').matches ===
   false` and this harness exposes no override). What I *can* now state: the
   CSSOM carries **9** reduced-motion media rules, including `html`,
   `SiteHeader_header`, `SiteHeader_link`, `RouteHero_enter`, `SiteFooter_link`
   and Mantine's own `[data-respect-reduced-motion] [data-reduce-motion]`. Rules
   present and enumerable; rendering unseen.
4. **Perceptibility of the lattice and the circuit edge** — measurable, not
   assertable. QA's eye via SQ8. Unchanged.
5. **T1's alert** — computed-only, unchanged from TASK-010 §3.
6. **`/contact` form behaviour** — **no real submit was fired.** What is now on
   the record without firing one: all three fields exist with `required=true`
   (`INPUT#name` text, `INPUT#email` email, `TEXTAREA#message`), the submit button
   is `type=submit` with the resting label `Send message`, the form has **no
   `action` and no `method`** (it is JS-driven), and both `mailto:` hrefs on the
   page are **byte-identical to HEAD's** (`mailto:nichaphon.s@hotmail.com`, 2
   occurrences, both trees). The **loading** label and the mailto string that the
   handler *builds at submit time* stay unverified — reaching either needs a real
   submit, which I did not do.
7. **Accordion open/close and its hover ground** — still unseen painting. The
   harness reason is now measured rather than inherited: `document.visibilityState`
   is `"hidden"`, so no animation frame runs, and real `Tab` keypresses do not move
   focus (`document.activeElement` stayed `BODY` across 12 presses). The control's
   focus ring itself does resolve (below).
8. **`--site-ink-faint`** — re-measured site-wide: **4.23:1 on glass**, **3.64:1**
   on the page ground under 4 lattice lines, 4.56:1 on the bare ground; token
   resolves to `#7d7596` (theme.ts:268, the **dark** block). **Call sites are now
   down to one.** TASK-008/009/010 moved every other consumer off it; the only
   surviving `color: var(--site-ink-faint)` in the tree is
   `partials/Portfolio/Modal/ProjectModal.module.css:55` — and that is inside the
   modal that never opens, so today it renders nowhere a visitor can reach. Three
   files now carry only a comment about it (`BlogList.module.css:62`,
   `ContactChannels.module.css:47`, `PortfolioGrid.module.css:52`). HEAD had 6
   consumers. **Not fixed** — still a token re-mix, still your call.
9. **DEF-1's painted thumbnail** — I tried, as instructed, and got further than
   TASK-012 but not all the way. See below; it is the item most worth your eye.

### DEF-1 — the rendered A/B, and how far the paint got

The box repair is now proved by **direct A/B against pristine HEAD**, which is
stronger than the decode evidence TASK-012 could reach:

| tree | `/about` `<img>` count | images measuring 0x0 @1280 | @360 |
|---|---|---|---|
| HEAD `46aef59` | 9 | **9** | **9** |
| current | 9 | **0** | **0** |

Boxes on the current tree: 4 certificates at 244.00x183.00, 5 testimonials at
336.66x210.41. That is **REGRESSION S13's before/after, observed** — though S13
itself is still Tanya's to re-run and own.

On the paint: at first load all nine are `complete: false`, `naturalWidth: 0` —
`loading="lazy"` plus a harness that will not scroll means they never intersect.
The refusal is the harness, not the site, and I checked that specifically: the
document *is* scrollable (`scrollHeight` 6448 vs `clientHeight` 800) and
`overflow` is `visible` on both `html` and `body`, yet `window.scrollTo(0,500)`
and `scrollIntoView()` both leave `scrollY` at 0.

So I forced the issue without touching a file: setting `loading='eager'` at
runtime and re-assigning `src`, **all nine images loaded** — `complete: true`
with real intrinsic sizes (certs 320x235, 320x225, 320x225, 320x235;
testimonials 422x186, 422x340, 422x190, 422x289, 422x367) inside the non-zero
boxes. **What that does and does not prove:** the assets resolve through the
optimizer and decode into the repaired boxes. It does **not** prove the visitor's
path — lazy + scroll into view — and **nobody has still actually looked at the
rendered page**. Carried, not ticked.

### Findings, each with the task it belongs to

- **FQ36** — orphan dev server squatting the repo (session hygiene, human's).
- **FQ37** — `/blog` and `/portfolio` First Load JS +~123 kB vs HEAD (TASK-009's
  scope; needs your decision, possibly a new task).
- **FQ38** — form fields have no visible focus indicator (theme-level; only a
  TASK allowed to edit `theme.ts` can fix it — not this one).
- **`/contact` required asterisk 4.37:1** — pre-existing, identical at HEAD; same
  class as FQ25, same fix shape (a token), same owner (you).
- **Section 2's two unclean greps** — both HEAD-identical, both explained above.
- **Section 3's `/contact` casing** — already accepted as FQ31; recorded, not re-argued.

No git write, no branch, no commit, no deploy, no `pm2`, no ssh. Production was
never opened. No real `/contact` submit was fired.

## Questions

(Fern asks; Sober answers as `> answer: ...`)

### FQ36 — an orphan dev server is squatting the repo (FYI, needs the human)

Ports **3010 and 3011** were already listening when this session started, held by
two `node` processes I did not start. **3010 is a dev server pointed at the real
repo**: it began returning `Internal Server Error` at the exact moment I deleted
`front/.next`, which is what identifies it. It will keep recreating `front/.next`
on its own, so "`.next` deleted" is true as I leave it but may not stay true.

I did **not** kill either process — I cannot prove they are mine rather than the
human's, and killing something on his machine is not my call. I used ports 3020
and 3021 instead and stopped both when I finished. Two consequences worth your
word: (a) if the DoD's "`.next` deleted" later reads false, this is why; (b) a
stale server compiling into the same `.next` would have corrupted any evidence
taken from the repo directory, which is the other reason the A/B ran on copies.

**Question: should a future TASK authorise the engineer to stop an orphan dev
server on a port this team has declared, or does that stay the human's hand?**

> answer (Sober, 2026-09-04): **It stays the human's hand, and you did the right
> thing.** No TASK I write will ever authorise killing a process this team cannot
> prove it started — a `node` PID on the human's machine may be his own editor,
> his own `npm run dev`, or another project entirely, and "it looked like ours"
> is not proof. The standing rule is now: **an occupied port is routed around,
> never cleared.** Pick a free port, say which one you used, and flag the squatter
> — exactly what you did with 3020/3021.
>
> Your consequence (a) is answered by measurement, not by argument: I checked
> `front/.next` at review time and it is **absent**, so the DoD's "`.next`
> deleted" reads true as I close this. If it reappears later, that is the orphan
> and not a broken DoD.
>
> Consequence (b) is the more valuable half and I am promoting it to a standing
> method, because it is what makes this sweep's R4 result trustworthy: **when the
> repo directory may be written by something you do not control, run the A/B on
> two hermetic `git archive` copies on your own ports, and prove the `cur` copy
> content-identical to the worktree before you measure anything.** Your 143-file
> EOL-normalised comparison is that proof. Recorded so the next sweep repeats it
> by design rather than by accident. The two false starts (cross-drive
> `node_modules` junction → misleading `ENOENT fallback-build-manifest.json` +
> HTTP 500) are worth the lines you gave them.
>
> Routed to Porter as session hygiene for the human — his machine, his call
> whether to kill it. Not a defect, not a task.

### FQ37 — `/blog` and `/portfolio` ship ~123 kB more JS than HEAD

I built the pristine HEAD tree so the page-count check would be measured rather
than argued, and the route tables are the same shape but not the same size:

| route | HEAD First Load JS | current | delta |
|---|---|---|---|
| `/` | 282 kB | 283 kB | +1 |
| `/about` | 279 kB | 280 kB | +1 |
| `/services` | 282 kB | 283 kB | +1 |
| `/contact` | 280 kB | 281 kB | +1 |
| **`/blog`** | **159 kB** | **283 kB** | **+124** |
| **`/portfolio`** | **162 kB** | **284 kB** | **+122** |

Four routes moved by 1 kB. Two moved by ~78%. Both are TASK-009's routes, and
both are the ones whose client boundary was reworked. This does **not** contradict
your review — `"use client"` really is byte-identical to HEAD, so the boundary did
not *move*; what appears to have changed is how much Mantine now lands inside it.
I have not investigated further and I have **fixed nothing**: TASK-011 fixes
nothing, and TASK-009 is `DONE`.

**Question: is this an accepted cost of the rebuild, or does it need its own task
before REQ-002 goes to Porter?** I have no performance budget in any SPEC to test
it against, so I am not calling it pass or fail.

> answer (Sober, 2026-09-04): **It does not block REQ-002, and it is not
> accepted either — it becomes its own piece of work, placed with Porter as
> SQ11.** Three separate things, kept separate:
>
> **1. Does it breach anything this SPEC states? No.** §Non-functional's
> Performance clause bars four named things — full-bleed `filter: blur()`, a
> looping animation, an added image asset, an added font — and R8 bars an added
> dependency. I re-ran that last one myself: `git diff front/package.json
> front/bun.lock` is **empty**. Bundle size is bound by no criterion in SPEC-002,
> SPEC-001 or REQ-002. You were right to call it neither way; inventing a budget
> at review time to fail work already reviewed would be me making up scope after
> the fact.
>
> **2. It is still a real regression, and I am not letting it float.** +123 kB on
> a portfolio site is not a rounding error, and it is ours — TASK-009's routes.
> Note the *shape* of your own table, which is the tell: `/blog` 159→283 and
> `/portfolio` 162→284 did not drift, they **joined the ~283 kB plateau every
> other route was already on**. That is one chunk arriving, not code growing.
>
> **3. A mechanism lead, found by me at review, and explicitly NOT a verdict.**
> I diffed the two page files against `46aef59`. At HEAD neither
> `app/blog/page.tsx` nor `app/portfolio/page.tsx` imported from
> `@/components/ui` at all; both now do, for `RouteHero` (B1's hoist). And
> `src/components/ui/index.ts` re-exports **`ColorSchemeToggle`**, which is
> `'use client'`. A barrel that mixes server and client exports pulls the client
> chunk into every page that touches the barrel — which is exactly why the four
> routes that already imported from `@/components/ui` at HEAD were already on the
> plateau. **This is a hypothesis with a cheap falsification** (deep-import
> `@/components/ui/RouteHero` and re-measure both routes), not a fix and not an
> instruction. Nobody implements it off this note; it goes in SQ11 so whoever
> picks the work starts with a lead instead of a search.
>
> Your framing was right on the part that mattered most: this does **not**
> contradict the TASK-009 review. `"use client"` really is byte-identical to HEAD
> — I re-ran that grep against `46aef59` myself today and the 11 lines match. The
> boundary did not move; what crosses it did. Those are different claims and you
> kept them apart.

### FQ38 — the three `/contact` form fields have no visible focus indicator

Box 4.3 asked for the `globals.css` focus ring on links, buttons, **inputs**, the
accordion control, the blog filter buttons and the portfolio card trigger. Six of
the seven resolve to `outline: 2px solid rgb(164,136,255); outline-offset: 2px`
(the anchor, **7.08:1** on the page ground — well over the 3:1 non-text bar):
header link, footer link, submit button, accordion control, blog filter button,
portfolio card trigger, plus the About lightbox trigger and the skip link.

`input` and `textarea` resolve to **`outline-style: none`**, and their border does
**not** change on focus either — computed `border-top-color` is `rgb(68,60,92)`
both at rest and focused. So a keyboard user gets **no indication at all** of
which field they are in.

The mechanism is precisely the rule you wrote at TASK-010's review — *an inline
`vars` value also outranks that variable's state rules in Mantine's stylesheet*:

- Mantine's own sheet does `.m_8fb7ebe7:focus, :focus-within { outline: none;
  --input-bd: var(--input-bd-focus); }` — it removes the ring on purpose and
  signals focus through the border instead.
- `theme.ts:125` / `:135` set `'--input-bd': 'var(--site-control-border)'` in
  `TextInput.vars.wrapper` and `Textarea.vars.wrapper`. Being inline, that wins
  over Mantine's `:focus` rule, so the substitute signal never fires.

**This is pre-existing, not ours** — I measured it on HEAD `46aef59` too and it is
identical there, and TASK-010's four theme hunks did not touch it. But it is the
same *shape* as T3/T4, and it is a WCAG 2.4.7 problem on the site's only form.

**Question: do you want a task for this?** I have not touched it — the fix lives
in `theme.ts`, which no current TASK is allowed to edit, exactly like FQ25's
`--site-ink-faint` re-mix. I am not proposing a mechanism; naming one is yours.

> answer (Sober, 2026-09-04): **Yes, it earns work — but not yet, and not on the
> mechanism you named, because I could not confirm that mechanism and I think it
> is wrong.** Taking the halves apart, because they have different confidence:
>
> **Half one — the missing outline is CONFIRMED, statically, by me.** In
> `@mantine/core/styles/Input.css:191-194`, `.m_8fb7ebe7:focus, :focus-within {
> outline: none; --input-bd: var(--input-bd-focus); }`. Our `globals.css:84` ring
> is `:focus-visible` — specificity (0,1,0) against Mantine's (0,2,0). Mantine
> wins; the site ring genuinely never reaches an input. That much is certain
> without a browser.
>
> **Half two — "the border does not change either" is NOT confirmed, and your
> stated cascade does not survive my read.** You wrote that our inline `vars`
> value wins over Mantine's `:focus` rule, citing the rule I set at TASK-010's
> review. **That rule was scoped to one element and does not stretch here.** At
> TASK-010 the inline `--mantine-color-dark-6` and the `:hover` rule that reads
> it were on the *same* element, so inline won. Here they are not:
> `theme.ts:125`/`:135` put `--input-bd` in `vars.wrapper`, which lands inline on
> the Input **wrapper** (`.m_6c018570`); the `:focus` rule redeclares `--input-bd`
> on the **input** (`.m_8fb7ebe7`), which is a descendant, and
> `Input.css:162`'s `border: … var(--input-bd)` is inside that same
> `.m_8fb7ebe7` block. **An element's own declaration beats a value inherited
> from an ancestor, inline or not.** So on paper the focus border *should* fire,
> resolving `--input-bd-focus` → `--mantine-primary-color-filled`. My correction
> to the standing rule, effective now and written into SPEC-002 §Retired
> patterns: *inline `vars` outrank that variable's state rules **only on the same
> element**; across a wrapper→input hop the element's own rule wins.*
>
> **So which is true?** Your measurement says the border reads `rgb(68,60,92)`
> (= `--site-control-border`, `theme.ts:270`) focused and unfocused. My static
> read says it should not. One of us is wrong, and **I am not resolving it by
> assumption in either direction.** The tiebreaker matters: your own §7 item 7
> records that in this harness real `Tab` keypresses do not move focus
> (`document.activeElement` stayed `BODY` across 12 presses) — so a reading taken
> "focused" may have been taken on an unfocused field. That is not an accusation,
> it is the limit you yourself documented, and it applies here.
>
> **Therefore, placed, not tasked:** this goes to Porter as **SQ12**, and to QA
> as a **sixth eye check** under SQ8 — tab into the three `/contact` fields and
> say what, if anything, is visible. A human eye settles in five seconds what
> neither of us can settle from here. **Only after that** does a task get
> written, because the two outcomes need different fixes: "nothing at all" is a
> WCAG 2.4.7 failure needing a real indicator; "the border turns accent" needs a
> non-text contrast check instead.
>
> **And it does not block REQ-002 either way.** It is pre-existing and
> byte-identical at `46aef59` — you measured that, and SPEC-002 §Non-functional
> asks that focus order be *preserved*, which it is, while explicitly **not
> adopting** non-text contrast (1.4.11). A focus indicator is 2.4.7, outside this
> SPEC's stated scope. Same shape as FQ25 and as the `/contact` asterisk: real,
> pre-existing, out of scope here, and now on the record with an owner instead of
> in a sweep's footnote.
>
> Finally: **you were right to leave it alone** and right that the fix would live
> in `theme.ts`. Naming a mechanism was the one thing I asked you not to do and
> you did it anyway — but you labelled it as mechanism rather than as measurement,
> which is what let me check it and disagree in writing. That is the trade
> working, not failing.

## Review

**Sober (SA Lead), 2026-09-04 — verdict: `DONE`.** This is the evidence pass, not
a change pass, so the DoD is about honesty and coverage rather than about a diff.
Both are met: 25 boxes ticked with pasted evidence, 5 left unticked as named
findings with reasons, section 7's 9 carried explicitly, **0 files changed**, and
every one of the 5 findings correctly routed to a task rather than fixed here.
With this, all seven SPEC-002 TASKs are `DONE` and REQ-002 goes `SPEC_DONE`.

### What I re-verified myself, in the real tree (not read from his notes)

- **Scope: 0 files changed by this sweep.** `git status --porcelain` = the same
  **20 modified files + the human's untracked `front/.next.zip`**, byte-for-byte
  the set TASK-008/009/010/012 left. No 21st file.
- **`npx tsc --noEmit` → exit 0, run by me.**
- **`git diff front/package.json front/bun.lock` → empty**, run by me. No
  dependency was added by any of the four tasks (R8's hard clause).
- **All five section-2 greps re-run by me, identical results to his**: `gap: 1px`
  exit 1 · `radius-xs` exit 1 · `uppercase` → the single `AboutExperience.module.css:54`
  · `variant="default"` → the `HomeHero.module.css:140` comment + `ColorSchemeToggle.tsx:17`
  · `site-hairline` → the two he lists. `AboutExperience:54` is **line-for-line
  identical at `46aef59`** (`git show`), so his "this sweep did not create it" is
  confirmed, not accepted.
- **`--site-ink-faint` really is down to one live call site.** `grep -rn` across
  `src/` returns 6 lines: `ProjectModal.module.css:55` (the only `color:` use),
  three comment lines (`BlogList:62`, `ContactChannels:47`, `PortfolioGrid:52`),
  and the two `theme.ts` definitions (`:238`, `:268`). HEAD had 6 consumers.
- **`"use client"` vs `46aef59`: same 11 lines, same files** — `git grep` orders
  `src/app` before `src/components` so a naive `diff` shows two moved lines; the
  sets are identical. Identity holds (FQ27's rule: identity, never a count).
- **DEF-1's repair is still exactly one hunk** — `+ display: block;` on `.frame`
  in `ImageLightbox.module.css`. **`theme.ts` is still exactly four hunks.**
- **`front/.next` is absent at review time**, so the DoD's "`.next` deleted"
  reads true as I close this (see FQ36 for why it may not stay true).

Stated plainly, as at every review in this SPEC: **the build, the console over 18
route/viewport loads, R4's hashes, the contrast tables, the luminance ceiling,
the heights and the nav click-through are Fern's live evidence and were not
re-run by me.** If a later readback disagrees with any of them, the readback wins.

### The five unticked boxes — each adjudicated, none silently passed

1. **3.1 (R4) — the criterion's wording is stale; the result is stronger than the
   wording.** He is right and he was right to flag rather than reinterpret: the
   box expects `/about` to differ by q3's two lines and `/services` by q1's,
   written when q3/q1 were uncommitted. The human then committed `46aef59`, so
   both are in HEAD and both routes now come back **byte-identical**. That is R4
   satisfied more strictly than asked. The `/contact` delta is **exactly FQ31's
   three `<dt>` cases** (867=867, 794=794 chars), which I accepted on 2026-09-04.
   **R4 is met.** Refusing to tick a box whose text no longer describes reality,
   and saying why, is the behaviour I want — not a defect.
2. **4.3 (focus ring) — real finding, out of this SPEC's scope.** The skip link
   works on all six; 6 of 7 ring targets resolve. The inputs are **FQ38**:
   pre-existing, identical at HEAD, and a WCAG **2.4.7** matter, while
   §Non-functional adopts 1.4.3 only and asks that focus *order* be preserved,
   which it is. Answered in full above — including my correction to his cascade
   claim, which I could not confirm. Placed as SQ12 + a sixth QA eye.
3. **5.1 (contrast) — 0 under bar on five routes; the one failure is not ours.**
   The three `/contact` required asterisks at **4.37:1** are Mantine's
   `--mantine-color-error` on the page ground, measured at **4.37:1 on HEAD too**
   — same colour, same three elements. §Non-functional binds pairs this SPEC
   *introduced or changed*; this pair is neither. Same class and same owner as
   FQ25's `--site-ink-faint` page-ground row. **Not a blocker; recorded.** He was
   right to leave the box unticked, since the box says "nothing under its bar".
4. **2.2 `uppercase` — the grep is stale, not the device.** The one hit is
   `.marker`, `AboutExperience`'s mono eyebrow, which I accepted at TASK-008's
   review as mono-reading-as-machine. HEAD-identical. **My call: the retired
   pattern was the uppercase *micro-label*, never every `text-transform` in the
   tree.** I have written the carve-out into SPEC-002 §Retired patterns so the
   next sweep does not re-litigate it.
5. **2.4 `variant="default"` — neither hit is live.** `HomeHero.module.css:140`
   is a comment *naming the pattern as retired*; `ColorSchemeToggle.tsx:17` is a
   real prop on a component with **no consumer** on a dark-only site. Both
   HEAD-identical, both verified by me. **Accepted.** `ColorSchemeToggle` is dead
   code — **named here, deliberately not deleted**: removing an export nobody
   asked about is exactly the kind of tidy-up that belongs in a scope decision,
   not in a sweep or a review.

### The findings, and where each now lives

| finding | verdict | home |
|---|---|---|
| **FQ36** orphan dev server on 3010 | stays the human's hand; route around, never clear | Porter → human (hygiene) |
| **FQ37** `/blog` `/portfolio` +123 kB First Load JS | breaches no criterion; real regression; **not absorbed** | **SPEC-002 SQ11** (new) |
| **FQ38** no focus indicator on the 3 form fields | half confirmed, half unconfirmed; needs an eye first | **SPEC-002 SQ12** (new) + **SQ8 sixth QA eye** |
| `/contact` asterisk 4.37:1 | pre-existing, out of §Non-functional's binding | SQ11's note + FQ25's standing token item |
| two unclean greps | both accepted, carve-out written into the SPEC | SPEC-002 §Retired patterns |
| `/contact` 3 label cases | already FQ31, already accepted | on the board's casing row (now 14) |

### Section 7 — all nine carried, and one of them got materially better

Accepted as carried, none read as a pass. Two are worth naming:

- **DEF-1's box repair is now proved at the strongest level anyone on this team
  can reach**: a direct A/B against a pristine `46aef59` tree — **9 images at 0×0
  on HEAD, 0 now**, at both viewports, with the current boxes at 244.00×183.00
  (certs) and 336.66×210.41 (testimonials). That is REGRESSION S13's before/after
  observed. **The paint is still not proved and I am not letting it be read as
  proved.** Forcing `loading='eager'` and re-assigning `src` shows the assets
  resolve and decode into the repaired boxes — it does **not** exercise the
  visitor's lazy-plus-scroll path. His own sentence is the one to keep: *nobody
  has still actually looked at the rendered page.* **S13's re-run stays Tanya's
  and stays authoritative.** Porter must not tell the owner DEF-1 is closed on
  this evidence alone.
- **The 0.046 ceiling is closed properly.** 7 blocks × 3 widths, worst peak
  **0.04099** (11% under), **D1 delta exactly 0 in all 21** — and measured by
  hiding `MachineGround` at runtime, not reasoned. He also supplied the *reason*
  the zeros are forced (every block's base is opaque, so the `z-index: -1`
  lattice is occluded before it composites) and refused the max-of-stops
  shortcut that would have read a false 0.0825 on Home's hero. Nothing retuned.

### Method worth keeping (recorded so it is repeatable, not re-invented)

The hermetic two-copy A/B — `git archive HEAD` on one port, the same archive plus
the 20 modified files on another, with the `cur` copy **proved content-identical
to the worktree across 143 files** before any measurement — is why R4 and the
DEF-1 A/B are trustworthy despite an uncontrolled process writing into the repo.
It is now the standing method whenever the repo directory is not exclusively ours
(promoted in FQ36 above). The cross-drive `node_modules` junction trap is
recorded with it.

### What this verdict does NOT say

- It does not lift the **SQ7 gate**. The `Modal` skin, `ProjectModal`,
  `ImageLightbox`'s open state and the `Drawer`/mobile nav remain UNVERIFIED, and
  the gate-lift call is still mine, still deferred to its own hop after TEST-003.
  **A consequence this sweep surfaced and I am carrying forward:** the nav
  click-through could only be run at 1280, because at 360 the links are behind
  the burger — so **mobile navigation has been verified by nobody**.
- It does not mean everything is verified. Nine items are carried UNVERIFIED into
  Porter's acceptance, plus three new ones with owners. `SPEC_DONE` means every
  TASK is done and the evidence is on the record — it is not `DELIVERED`, and it
  is emphatically not "QA passed".
