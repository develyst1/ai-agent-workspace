# TASK-005: Acceptance sweep before handover

- Source: SPEC-001
- Status: DONE
- Owner: Fern (FE)
- Depends on: TASK-004 (DONE 2026-08-30 — this task is ungated)

No new feature work. This is the evidence run that lets Sober review and Porter hand
Home to the owner. **Write the actual result of every check into `## Implementation
Notes` — a bare tick with no observation is not a pass.** If a check fails, say so
and stop; a failed check is worth more than a fixed-in-silence one.

Repo is not committed or pushed by you — the human owns all git writes. Hand off as
edited files on `develop`.

## Checks

**Build and console**

1. `cd front && npm run build` — paste the tail of the output. Zero errors, and name
   any warning that was not there before TASK-001.
2. `cd front && npm run dev` — load all six routes, report the browser console for
   each. Empty is the bar.

**Regression (REQ-001 R8)**

3. Every nav link, header and footer, reaches its route; no 404. The mobile drawer
   opens and navigates.
4. `/contact` — the form still submits exactly as it did before this REQ.
5. The five out-of-scope routes render coherently on the new palette (they may look
   old; they may not look broken — no invisible text, no white-on-white panel, no
   missing border). Name anything that looks broken rather than merely old.

**Identity (REQ-001 R1/R2)**

6. Retired-pattern check on `/`, by name from SPEC-001 §"Retired patterns" — report
   each as present/absent: 1px hairline card grids · uppercase-mono eyebrow ·
   serif display headings (Fraunces must not be in the built CSS at all) · the rust
   accent in any form · 4px/8px card radii · `Button variant="default"` as the
   secondary action.
7. Grep the whole of `front/src` for the old hexes (`#d77551`, `#c25f3c`, `#a34d2f`,
   `#191614`, `#fbf9f7`, `sand`, `rust`, `darkSand`, `Fraunces`) → report every hit.
   Expect zero outside comments.

**Content (REQ-001 R4/R5/R9)**

8. Diff the quote strings rendered on `/` against `requirements/REQ-001-ui-visual-redesign.md`
   §R5 **character for character** — both Thai and English. State which R5 block you
   compared against. Confirm exactly two quotes (`q4`, `q2`) appear, not four.
9. Confirm no `150+`, no `12Years`, no filler paragraph and no other brand's name
   appears anywhere on `/` (R9).
10. List every visible string on `/` with the constant it comes from. Anything you
    cannot trace is a defect — report it, do not fix it by inventing.

**Accessibility and contrast (SPEC-001 §Non-functional)**

11. Contrast: measure every text/background pair on `/` and report ratios — body
    text, dimmed text, stat labels, quote text, both CTAs, nav links. Bar is 4.5:1
    for body, 3:1 for text ≥24px bold. Report the measured number, not "looks fine".
12. Confirm no body text uses `--site-ink-faint` or `iris` shades 5–9.
13. Keyboard sweep of `/`: every interactive element reachable, visible focus ring on
    each, including the new text-link CTA. Skip link works.
14. `AuroraBackdrop` layers are `aria-hidden="true"` and take no focus.
15. 360px width: no horizontal scroll, no clipped Thai.
16. OS reduced-motion on: no entrance animation, no aurora motion.
17. OS theme set to **light**: `/` still renders dark, no light flash on first paint.
18. **Mobile drawer — carried over from TASK-003, which could not run it.** At 375px:
    the burger opens the drawer; `nav[aria-label="Mobile"]` mounts with all six links;
    the active link carries `data-active="true"` + `aria-current="page"` and its purple
    dot; clicking a link navigates **and** closes the drawer; Escape closes it; focus is
    not left stranded. **This needs a browser window that is actually visible.** Two agent
    sessions failed it environmentally (`document.hidden === true` pauses
    `requestAnimationFrame`, so Mantine’s `Transition` never mounts the drawer content) —
    that is not a defect and not a pass. If it cannot be run here either, say so and route
    it to the owner via Sober; **do not tick it from a code read.**
19. **The drawn focus ring — same carry-over.** Tab (do not `focus()` from script) to the
    wordmark, a nav link, the burger and the hero CTAs, and confirm a ring is *visible* on
    each. Script focus does not raise `:focus-visible`, so this too needs a real browser.
20. **The two look-questions carried out of TASK-004 §FQ8 (added by Sober 2026-08-30).
    Report only — you fix neither, and neither is a failure.** Both are consequences of
    the §8 inversion that were correctly measured and correctly not "fixed"; they need
    the owner's eye, and this sweep is how they reach him.
    (a) **The hero grows past the fold at short viewports.** `min-height: 100dvh` is a
    floor and the copy is taller than it at 1280×600 (790px vs 600) and 360×740 (769.56
    vs 740), so the primary CTA sits below the fold there.
    **CORRECTED 2026-08-30 by Sober (FQ9), from the run recorded below: that last clause
    holds at 1280×600 ONLY. At 360×740 both CTAs and the hero quote are fully above the
    fold (CTA 619.56–663.56 against a 740 fold) and the 29.56px overhang is the hero's
    bottom padding, not content. The owner is asked about 1280×600 only.**
    Capture `/` at **1280×600**
    and **360×740** at scroll 0 and say what is visible above the fold at each — CTA in
    or out. If a screenshot is impossible, say so and quote the rects instead.
    (b) **A 1px band of page ground above the aurora, at scroll 0 only.** `header` is
    73px (72px `min-height` + `border-bottom: 1px solid transparent`,
    `SiteHeader.module.css` line 6) while `--site-header-height` is 72px, so the hero's
    pull-up is 1px short by construction. Say whether that line is **visible** at 1280
    and at 360, at scroll 0. Do **not** change the token, `HomeHero.module.css` or any
    shell file to hide it — the remedy is a SPEC decision and is recorded in SPEC-001
    §Token layer.

## Definition of Done

- [~] All 20 checks run, each with its observed result written down. **19 run and
      passed; check 16 is NOT-RUN** — the OS reduced-motion flag is not emulable in
      this environment, so rule coverage was verified from the live CSSOM instead and
      the behavioural look is routed out (FQ12). Not ticked from a code read.
- [x] Checks 18 and 19 are either **run in a visible browser** or reported as
      NOT-RUN with the reason — never ticked from a code read. **Both RAN and passed**;
      the method limits (scripted activation, no pointer click at mobile) are stated.
- [x] Any failure is reported in `## Implementation Notes` and the task is set
      `BLOCKED` rather than `REVIEW`. **No check failed.** Three items are reported for
      Sober's decision, none of them a failure: FQ9 (check 20(a)'s premise is wrong at
      360×740), FQ10 (`/contact` asterisk 4.37:1), FQ11 (display `h1` now on all five
      out-of-scope routes). Status set `REVIEW`, not `BLOCKED`.
- [x] Nothing was changed during this task except fixes explicitly needed to pass a
      check — and each such fix is listed with the check number that forced it.
      **No source file was changed at all** — `git status` is identical to how TASK-004
      left it. The one thing removed was `front/.next/` (git-ignored build output),
      forced by check 2.

## Implementation Notes

Run by Fern 2026-08-30. **Nothing in `front/` was changed by this task** — `git status` is
byte-identical to how TASK-004 left it (12 modified + 4 untracked). The only thing removed
was `front/.next/`, a git-ignored build artefact (see check 2). Repo `H:\...\nichaphon`,
branch `develop`. Port 3000 was held by an unrelated process, so `next dev` served
**localhost:3001** throughout.

### 1. `npm run build` — PASS

`npx tsc --noEmit` → exit 0, no output. Then `npm run build`:

```
 ✓ Compiled successfully in 5.1s
 ✓ Generating static pages (10/10)
Route (app)                     Size  First Load JS
┌ ○ /                        3.47 kB         283 kB
├ ○ /_not-found                996 B         103 kB
├ ○ /about                   3.43 kB         280 kB
├ ○ /blog                    3.81 kB         159 kB
├ ○ /contact                 4.82 kB         281 kB
├ ○ /portfolio               6.83 kB         162 kB
└ ○ /services                3.27 kB         283 kB
+ First Load JS shared by all 102 kB
[postbuild] copied .next/static + public/ into .next/standalone
```

Zero errors. **Zero warnings** — nothing new since TASK-001.

### 2. `npm run dev`, six routes, console — PASS, after one artefact fix

Final state, measured in a **fresh tab** so nothing carried over: `/`, `/about`, `/services`,
`/portfolio`, `/blog`, `/contact` each produced **exactly one console line** —
`[info] Download the React DevTools…`, Next's own dev notice. No errors, no warnings. Server
log for the same run: every route `200`, `/favicon.ico` `200`, `/no-such-page` `404`.

**Two things the first dev run showed. Both traced, neither a site defect — recorded because
a bare tick would have buried them:**

- `GET /favicon.ico 500`, `TypeError: __webpack_modules__[moduleId] is not a function` at
  `.next/server/app/favicon.ico/route.js`, plus four console `404`s. Cause: check 1 ran first,
  so `next dev` started on top of the **`next build` output** in `.next/`. `rm -rf front/.next`
  + restart → gone; everything above is from that clean run. Local artefact collision only.
- The first server log also showed `GET /products 404` and `POST /auth/login 404`. **This site
  never makes those requests**: `grep -rn "auth/login\|/products\|fetch(\|axios" front/src`
  returns **zero** hits — the site issues no network calls at all. Foreign traffic from another
  page open in the same browser; it did not recur after that tab was closed.

### 3. Navigation (R8) — PASS

Header exposes 7 anchors (wordmark + 6 links), footer 6 (mailto + 5 links), skip link `#main`.
Every route href fetched from the page: `/` `/about` `/services` `/portfolio` `/blog`
`/contact` → **200**; `/no-such-page` → **404**, so the not-found route works. No 404 on any
real link. Clicking header "Portfolio" client-navigates and the active mark moves
(`data-active="true"` + `aria-current="page"`). Drawer navigation: check 18.

### 4. `/contact` form — PASS, with one path deliberately not fired

`git diff HEAD -- front/src/components/partials/Contact front/src/app/contact` is **empty** —
byte-identical to the committed version, so nothing in this REQ touched it. Live:
`INPUT[name] required`, `INPUT[email] type=email required`, `TEXTAREA[message] required`,
`BUTTON[submit]` labelled "Send message". `form.checkValidity()` on the empty form → **false**,
so HTML validation still blocks an empty submit.

**Not fired: a valid submit.** `handleSubmit` sets `window.location.href = mailto:…`, which
would open the owner's mail client on his machine. I stopped short of launching a desktop app.
The code path is unchanged, so this is a "not executed", not a doubt.

### 5. Five out-of-scope routes on the new palette — render coherently; two observations

Per-element contrast scan on each route (every element with a direct text node, foreground vs
the composited ancestor background). `AuroraBackdrop` / `GlassPanel` / `PullQuote` are used
**only** on Home — verified by grep — so a plain ancestor composite is exact there.

| route | text elements | below AA |
|---|---|---|
| `/about` | 139 | 0 (worst 4.56:1) |
| `/services` | 97 | 0 (worst 5.11:1) |
| `/portfolio` | 102 | 0 (worst 4.56:1) |
| `/blog` | 71 | 0 (worst 4.56:1) |
| `/contact` | 44 | **3** (below) |

Nothing invisible, no white-on-white panel, no missing border. **Two observations, neither
fixed** — both outside REQ-001's Home-only scope, so they are Sober's call:

- **(a) `/contact`, the required-field asterisk.** Mantine's `*` renders `rgb(224, 49, 49)` on
  the page ground = **4.37:1**, just under 4.5. It is Mantine's default red, which `theme.ts`
  re-points in neither ramp. Three instances. The fields also carry `required`, so it is not
  the only affordance — but it is the one sub-AA string on the five routes.
- **(b) All five routes now render `h1` at the Home display scale.** `theme.ts` sets
  `h1: clamp(3rem, 11vw, 8.5rem)`, so `/about`'s headline is ~136px and fills more than a
  viewport at 1280×800 before any body copy. That is not "still looks old" — it is a **change**
  the token layer pushed into routes this REQ said it would not touch. Legible, on-palette,
  not broken; but the owner will see it.

### 6. Retired-pattern check on `/` (R1) — all six ABSENT

Measured on the live DOM at 1280×800, not read off the source:

| retired pattern | result |
|---|---|
| 1px hairline card grid | **absent** — 0 grid elements with any 1px gap |
| uppercase-mono eyebrow | **absent** — 0 elements on `/` with `text-transform: uppercase` |
| serif display headings (Fraunces) | **absent** — 0 serif computed families; the only faces on `/` are `IBM Plex Sans Thai`, `Space Grotesk`, `JetBrains Mono`. `grep -rl -i fraunces .next/static/css/` → **0 files** |
| the rust accent, in any form | **absent** — see check 7 |
| 4px/8px card radii + flat 1px borders | **absent** — 0 bordered elements with a 4px or 8px radius |
| `Button variant="default"` as secondary | **absent** — the only Mantine Button on `/` is `variant=filled`, `border-radius: 999px`; the secondary action is `a.HomeHero_textLink` |

### 7. Grep for the old identity — ZERO everywhere

`front/src`, case-insensitive, fixed-string: `#d77551` 0 · `#c25f3c` 0 · `#a34d2f` 0 ·
`#191614` 0 · `#fbf9f7` 0 · `sand` 0 · `rust` 0 · `darkSand` 0 · `Fraunces` 0. Not even in a
comment. The five hexes are also absent from the built CSS in `.next/static/css/`.

### 8. Quotes vs REQ-001 §R5 — character for character, PASS

Compared against **R5's settled blocks**, not the raw as-given lines: quote 4 from the
"Rendering, settled 2026-08-30 (Q7, Q8)" line; quote 2 Thai from the "Canonical Thai" list
under Q10; quote 2 English from the "Canonical English" list under Q11. Extracted from the
prerendered `/` HTML and dumped to code points on both sides:

- `Don't say why me. Say try me.` — identical, `0044 006f 006e 0027 0074 …`; straight `'`
  (U+0027) on both sides, no U+2019 anywhere.
- `ผมไม่ได้ทำงาน "ให้" ใคร ผมทำงาน "ร่วม" กับใคร` — identical, `… 0e19 0020 0022 0e43 0e2b 0e49 0022 0020 …`.
  It matches the **spaced** canonical line and correctly does **not** match the raw
  `ผมไม่ได้ทำงาน"ให้"ใคร` as first given — R5's canonical block wins, as R5 says.
- `I don't work "for" anyone. I work "with" them.` — identical.

**Exactly two `<blockquote>` elements on `/`** — `q4` (hero) and `q2` (band). `q1` and `q3`
exist in `constant/content/quotes.ts` and render nowhere.

### 9. Reference-screenshot content (R9) — PASS

No `150+`, no `12Years`, no filler paragraph, no brand name from the reference anywhere on `/`
(full string list in check 10). The four stats on `/` are the owner's own: `3+`, `40%`, `4`, `2x`.

### 10. Every visible string on `/`, traced — PASS, nothing untraceable

51 strings, in document order:

| # | string | source |
|---|---|---|
| 1 | Skip to content | `SiteShell.tsx` (shell literal) |
| 2–3 | Nichaphon Sayvav / Senior / AI Software Engineer | `SITE.name`, `SITE.role` |
| 4–9 | Home, About, Services, Portfolio, Blog, Contact | `NAV_LINKS` |
| 10 | Open to new opportunities | `SITE.availability` |
| 11 | Nichaphon Sayvav | `SITE.name` |
| 12 | Dong | `SITE.nickname` |
| 13 | Senior / AI Software Engineer | `SITE.role` |
| 14 | Generative AI and RAG chatbots… | `HOME_LEAD` (`Home.config.ts`) |
| 15 | View my work | `HERO_CTA_PRIMARY` |
| 16 | Get in touch | `HERO_CTA_SECONDARY` |
| 17 | Don't say why me. Say try me. | `QUOTES` `q4.en` |
| 18–25 | 3+ / Years experience / 40% / Average cost reduction / 4 / Months to AI launch / 2x / Performance awards | `CAREER_STATS` (`content/about.ts`) |
| 26 | What I do | `CAPABILITIES_EYEBROW` |
| 27 | Expertise across the full stack | `CAPABILITIES_TITLE` |
| 28 | Deep technical work paired with AI… | `CAPABILITIES_LEAD` |
| 29–40 | 01–04 + four capability titles and descriptions | index computed in `HomeCapabilities.tsx`; text is `CAPABILITIES` (`content/about.ts`) |
| 41 | ผมไม่ได้ทำงาน "ให้" ใคร ผมทำงาน "ร่วม" กับใคร | `QUOTES` `q2.th` |
| 42 | I don't work "for" anyone. I work "with" them. | `QUOTES` `q2.en` |
| 43–44 | Nichaphon Sayvav / Senior / AI Software Engineer · Bangkok, Thailand | `SITE.name`, `SITE.role`, `SITE.location` |
| 45 | nichaphon.s@hotmail.com | `SITE.email` |
| 46–50 | About, Services, Portfolio, Blog, Contact | `FOOTER_LINKS` |
| 51 | © 2025 Nichaphon Sayvav | `SITE.copyrightYear`, `SITE.name` |

### 11. Contrast on `/` — PASS, every pair clears its bar

Method, stated plainly: **computed composites, not pixel readbacks.** For each text element I
took its computed colour, composited page ground → the hero/band aurora (the three
radial-gradients reproduced from `AuroraBackdrop.module.css` with their own alphas and
geometry, evaluated at the element's own rect) → every ancestor background, then sampled an
8×8 grid across the element and kept the **worst** ratio. 1280×800, scroll 0.

| element | fg on worst bg | ratio | bar |
|---|---|---|---|
| header wordmark (18px/700, over aurora) | `rgb(236,234,242)` on `rgb(57,34,127)` | **10.33** | 3 |
| header wordmark role (12px, over aurora) | `rgb(169,163,186)` on `rgb(53,32,118)` | **5.34** | 4.5 |
| nav "Home" active (15px/600) | `rgb(236,234,242)` on `rgb(30,21,74)` | **13.90** | 4.5 |
| nav links, worst of five (Blog) | `rgb(169,163,186)` on `rgb(36,29,104)` | **5.97** | 4.5 |
| availability capsule | `rgb(236,234,242)` on `rgb(62,41,128)` | **9.57** | 4.5 |
| h1 wordmark (136px/700) | `rgb(236,234,242)` on `rgb(42,38,62)` | **12.22** | 3 |
| nickname / role line | 16.54 / **8.11** | | 4.5 |
| hero lead (18px) | `rgb(169,163,186)` on `rgb(19,17,33)` | **7.66** | 4.5 |
| **primary CTA label on its fill** | `rgb(11,9,22)` on `rgb(139,102,255)` | **5.11** | 4.5 |
| **secondary CTA (text link)** | `rgb(236,234,242)` on `rgb(11,9,22)` | **16.54** | 4.5 |
| hero quote (24px/500) | | **16.54** | 3 |
| stat values (40px) / **stat labels (14px)** | 15.34 / **7.52** | | 3 / 4.5 |
| section eyebrow "What I do" | `rgb(164,136,255)` on `rgb(11,9,22)` | **7.08** | 4.5 |
| capability index 01–04 (28px) | `rgb(164,136,255)` on `rgb(22,18,40)` | **6.57** | 3 |
| capability body copy (16px) | **7.52** | | 4.5 |
| **band quote Thai (40px)** | `rgb(236,234,242)` on `rgb(41,33,112)` | **11.37** | 3 |
| **band quote English (22px)** | `rgb(211,207,221)` on `rgb(36,29,92)` | **9.78** | 4.5 |
| footer name / meta / email / links / © | 16.54 / 8.11 / 7.08 / 8.11 / 8.11 | | 3 / 4.5 |
| skip link (focused) | `rgb(164,136,255)` on `rgb(11,9,22)` | **7.08** | 4.5 |

**Worst pair anywhere on `/`: 5.11:1** (the filled CTA's own label); the worst *dimmed* text is
5.34:1 (the header role line over the brightest part of the aurora). Nothing is near either bar.

### 12. Forbidden text colours on `/` — PASS

Five distinct text colours on the whole page: `rgb(236,234,242)` (61 elements),
`rgb(169,163,186)` (24), `rgb(164,136,255)` = iris 3 (7), `rgb(211,207,221)` = obsidian 1 (1),
`rgb(11,9,22)` (1, the CTA label on its fill). **Zero** elements use `--site-ink-faint`
(`rgb(125,117,150)`) and **zero** use iris 5–9 (`#7a4fff #7040ff #5e32e0 #5329c8 #451faf`).

### 13. Keyboard sweep of `/` — PASS

Real `Tab` key presses, never `focus()`, at 1280×800. Order in full: skip link → wordmark →
Home → About → Services → Portfolio → Blog → Contact → **View my work** → **Get in touch**
(the new text-link CTA) → footer email → footer About → Services → Portfolio → Blog → Contact.

Every one reported `:focus-visible === true` and a computed ring of
`2px solid rgb(164, 136, 255)` at `outline-offset: 2px`. Nothing skipped, nothing trapped.

**Skip link works.** One Tab from a fresh load makes it visible at (8, 8), 146×52. Activating
it sets `location.hash = "#main"` and the **next Tab lands on "View my work", inside `<main>`**
— the whole header is skipped. Activation was a real pointer click; a synthetic `Return` does
not raise a link's default action through this automation layer, so Enter-activation
specifically is unverified.

### 14. `AuroraBackdrop` — PASS

Both instances (hero, band): `aria-hidden="true"`, no `tabindex`, not focusable,
`pointer-events: none`, zero children. Neither appeared anywhere in the check-13 tab order.

### 15. 360px width — PASS

At 360×740: `document.documentElement.scrollWidth === clientWidth === 360`,
`body.scrollWidth === 360`, and the furthest right edge of **any** element on the page is
exactly 360 — no horizontal scroll, nothing bleeding. Thai is not clipped: the band
blockquote's Thai line has `scrollWidth === clientWidth === 288`, i.e. it wraps rather than
overflows, and its box sits at right = 308 inside the 360 viewport.

### 16. OS reduced-motion — **NOT RUN** (environmental); rule coverage verified instead

I could not flip the OS `prefers-reduced-motion` flag: neither the browser pane nor the Chrome
bridge exposes that emulation here (`list_connected_browsers` → `[]`, so no real Chrome was
attached either). **Not ticked from a code read.** What I did do, from the live CSSOM rather
than the source, is enumerate everything that moves on `/` and everything the reduced-motion
blocks cover.

Moves on `/`: **one** animation — `HomeHero_rise 0.52s` on `.HomeHero_content.enter` — and six
transitions: `.SiteHeader_header` (bg/border 0.2s), `.SiteHeader_link` (color 0.14s),
`.HomeHero_textLink` (text-decoration-color 0.2s), `.SiteFooter_link` (color 0.14s), and two
Mantine Burger internals (`.m_d4fb9cad`, `.m_80f1301b`).

Under `@media (prefers-reduced-motion: reduce)` the live sheets carry:
`html { scroll-behavior: auto }` · `.HomeHero_enter { animation: none }` ·
`.HomeHero_textLink`, `.SiteHeader_header`, `.SiteHeader_link`, `.SiteFooter_link`,
`.HomeCapabilities_row::before` all `{ transition: none }` · plus Mantine's own
`[data-respect-reduced-motion] [data-reduce-motion] { transition: none; animation: none }` —
and `data-respect-reduced-motion` **is** present on the document, with 1 marked target, which
is what covers the Burger. **Every mover on `/` is covered by a rule.** The aurora carries no
animation and no transition at all, so it has nothing to opt out of.

That is coverage, not behaviour. **A human toggling the OS switch is still owed one look.**

### 17. OS theme set to light — PASS

With `prefers-color-scheme: light` emulated and `/` reloaded: `prefersLight === true`,
`prefersDark === false`, and the page still renders **dark** —
`data-mantine-color-scheme="dark"`, `body` background `rgb(11, 9, 22)`, text
`rgb(236, 234, 242)`, `color-scheme: dark`.

**No light flash on first paint**, from the raw bytes of the SSR response
(`curl http://localhost:3001/`): `<html>` ships with `data-mantine-color-scheme="light"`
(Mantine's static `mantineHtmlProps` default) and `<head>` contains a **synchronous, inline,
parser-blocking** `<script data-mantine-script="true">document.documentElement.setAttribute(
"data-mantine-color-scheme", 'dark');</script>` at byte ≈950 — while `<body>` does not start
until byte 1071. The attribute is already `dark` before one byte of body content is parsed, so
no frame can be painted with the light values.

### 18. Mobile drawer at 375px — **RUN**, PASS

The environmental blocker from TASK-003 is gone: after fronting the tab and taking one
screenshot the pane reports `document.hidden === false` and a real viewport, so
`requestAnimationFrame` runs and Mantine's `Transition` mounts. Everything below is from a
painting browser, and the drawer is visible in the captures.

- Burger present at 375 (`display: flex`, 44×44 at (311,10), `aria-label="Open navigation"`).
- Opening it mounts `nav[aria-label="Mobile"]` with **6** links: `Home /`, `About /about`,
  `Services /services`, `Portfolio /portfolio`, `Blog /blog`, `Contact /contact`.
- Active link on `/` is **Home**, carrying `data-active="true"` **and** `aria-current="page"`,
  and its purple dot is visible in the screenshot.
- **Clicking a link navigates and closes the drawer**: "About" → drawer unmounts
  (`[role="dialog"]` count 0) and the route becomes `/about`, title `About — Nichaphon Sayvav`.
  The route change lands a beat after the close, so the first read still showed `/`; the second
  confirmed `/about`.
- **Escape closes it**: `[role="dialog"]` 0, `nav[aria-label="Mobile"]` gone, `body` overflow
  back to `visible`.
- **Focus is never stranded**: on open it moves into the drawer's close button; on Escape it
  returns to the burger, ring visible.

Method note, so this is not over-claimed: the pane's **pointer click** timed out repeatedly at
mobile viewports ("Browser pane is currently hidden"), and a synthetic `Return` does not
activate a `<button>` through this layer. So the open/link activations were dispatched as
`element.click()`. Everything the check actually asks about — that the drawer *mounts*,
*renders*, *navigates*, *closes* and *hands focus back* — was observed in a live, painting
browser and is in the screenshots, not inferred from the source.

### 19. The drawn focus ring — **RUN**, PASS

Reached by real `Tab` presses only. Wordmark, all six nav links, the burger at 375px, and both
hero CTAs each reported `:focus-visible === true` with a computed
`2px solid rgb(164, 136, 255)` ring, and the burger's ring is **visible as a purple rectangle
in the 375px screenshot**. The skip link's ring is likewise drawn when tabbed to.

### 20. The two look-questions carried out of TASK-004 §FQ8 — reported, neither fixed

`HomeHero.module.css`, `SiteHeader.module.css`, `globals.css` and every shell file are
untouched. Both items are for the owner's eye.

**(a) The hero past the fold at short viewports — the premise is only half true.**

| viewport | hero height | fold | primary CTA rect | secondary CTA top | hero quote |
|---|---|---|---|---|---|
| 1280×600 | 790 | 600 | top **683**, bottom 727 | 683 | top 687 |
| 360×740 | 769.56 | 740 | top **619.56**, bottom 663.56 | 619.56 | top 695.56, bottom 722.56 |

- **At 1280×600 the CTAs are below the fold — confirmed.** Screenshot at scroll 0 shows the
  header bar, the "Open to new opportunities" capsule, the full "Nichaphon Sayvav" wordmark,
  the "Dong · Senior / AI Software Engineer" line, and the lead paragraph **cut mid-sentence**
  at "…an average of 40". Neither CTA and neither quote is visible.
- **At 360×740 they are NOT below the fold.** The screenshot at scroll 0 shows the burger, the
  capsule, the two-line wordmark, the role line, the **whole** lead paragraph, **both CTAs
  ("View my work" and "Get in touch") complete**, and the hero quote "Don't say why me. Say try
  me." The 769.56 vs 740 overhang is the hero's bottom padding, not its content. The check's
  wording ("the primary CTA sits below the fold there") holds at **1280×600 only** — corrected
  here rather than ticking a box that does not match what the browser shows. See FQ9.

**(b) The 1px band of page ground above the aurora — present by construction, quantified.**

Geometry confirmed at scroll 0. **1280:** `header` height **73** (72px `min-height` + the 1px
transparent `border-bottom`), `--site-header-height` **72px**, `.hero` and its aurora start at
document **y = 1**. **360:** `header` height **65** (64 + 1), token **64px**, aurora top **y = 1**.
The same 1px shortfall at both breakpoints, exactly as SPEC-001 §Token layer item 3 records.

What is in that row, computed as in check 11 — viewport row y=0 is page ground `rgb(11,9,22)`
(L 0.0032); the aurora's first row:

| x @1280 | 0 | 160 | 320 | 480 | 640 | 800 | 960 | 1120 | 1264 |
|---|---|---|---|---|---|---|---|---|---|
| rgb | 41,25,90 | 48,29,107 | 45,28,101 | 36,22,79 | 30,21,72 | 26,20,69 | 30,24,86 | 32,25,90 | 27,21,74 |
| step vs ground | 1.30:1 | 1.42:1 | 1.37:1 | 1.22:1 | 1.18:1 | 1.15:1 | 1.24:1 | 1.27:1 | 1.18:1 |

At 360 the same row runs `rgb(41,25,90)` → `rgb(48,29,108)` (brightest at x≈60) →
`rgb(27,21,74)`, steps **1.17–1.43:1**.

**Whether it is visible: I will not certify that from these captures.** In 8-bit terms the step
is large — up to **+37 R / +20 G / +86 B** at the page's brightest column — which on a decent
display reads as a thin dark rule along the very top edge, and something darker is discernible
at the top of the 1280 capture. But it is one device pixel, the 1280 screenshots come back
scaled (800×506) and re-encoded, and a 1px feature is exactly what that scaling destroys. So:
**measurable, and large in value terms, at both 1280 and 360; not something a screenshot can
settle either way.** This is the check that needs the owner's eye, and the numbers above are
what he should be shown alongside it.

---

**Summary.** 18 of 20 checks run and passed. Check 16 is NOT-RUN (the OS reduced-motion flag is
not emulable here), with rule coverage verified from the live CSSOM instead. Check 4's
valid-submit path was deliberately not fired so as not to launch the owner's mail client.
Checks 18 and 19, both carried over as unrunnable, **ran this time in a painting browser and
passed**. Three things are for Sober, not for me: the `/contact` asterisk at 4.37:1, the
display-scale `h1` now applied to all five out-of-scope routes, and the correction to check
20(a)'s premise at 360×740.

## Questions

1. **FQ9 — check 20(a)'s premise is wrong at 360×740.** Both CTAs and the hero quote are fully
   above the fold there (CTA 619.56–663.56 against a 740 fold); only the hero's bottom padding
   overhangs. The below-the-fold CTA is real at **1280×600** only. Correct the check text before
   this reaches the owner, so he is not asked to look for something that is not there on a phone?
2. **FQ10 — `/contact`'s required-field asterisk is 4.37:1**, three instances, Mantine's default
   `rgb(224,49,49)`, which `theme.ts` re-points in neither ramp. Out of REQ-001's Home-only
   scope, so I did not touch it. New TASK, note to Porter, or explicitly accepted?
3. **FQ11 — the token layer pushed the Home display `h1` onto all five out-of-scope routes**
   (`clamp(3rem, 11vw, 8.5rem)`), so `/about`'s headline is ~136px and fills more than a
   viewport before any body copy. R8 expected those routes to look *old*; this is a visible
   *change* to them. Tell the owner it is intentional groundwork, or scope an h1 that stays
   per-route until the other five are rebuilt?
4. **FQ12 — check 16 needs a human.** I cannot flip the OS reduced-motion switch here and did
   not tick it from a code read. Every mover on `/` is covered by a rule (evidence above).
   Route it to the owner the way checks 18/19 were routed, or leave it open?

   > **answers — Sober (SA), 2026-08-30. All four: you were right not to fix any of them.**
   >
   > **FQ9 — corrected, in check 20(a) above.** Your browser beats my prose: I wrote the
   > premise from TASK-004's rects and generalised one viewport's result to both. The check
   > text now says 1280×600 only, so the owner is not sent looking for something a phone
   > does not show. **Nothing to redo** — this is the correction landing where the owner
   > will read it. The 1280×600 case still goes to him, as item **C** in §Review below.
   >
   > **FQ10 — not fixed under REQ-001, and not silently accepted either: it goes to the
   > owner as a scope question (item F).** SPEC-001 §Non-functional binds contrast on `/`;
   > REQ-001's acceptance for the other five is only that they "still render". So this
   > breaks no bar we agreed. But it is a **regression this REQ caused** — Mantine's default
   > `red` was legible on the old light ground and is 4.37:1 on the new one — and I will not
   > let a regression pass as "out of scope" without the owner hearing it. The fix is a
   > token re-point (`theme.ts` `red` ramp), which is mine to make but repaints error text
   > on all five out-of-scope routes; that is exactly the blast radius REQ-001 said it would
   > not take. **No TASK now.** Recorded in SPEC-001 §Follow-ups for the routes REQ.
   >
   > **FQ11 — same route, and thank you for calling it a change rather than "still old".**
   > It is a foreseen consequence of the layering, not a defect: SPEC-001 §Overview layer 1
   > deliberately made the token layer global, and §Token layer set `h1: clamp(3rem, 11vw,
   > 8.5rem)` knowing every route reads it. R8 promised those routes would still *render*,
   > not that they would look untouched. Whether a ~136px `/about` headline is acceptable
   > groundwork or wants containment until those routes are rebuilt is the **owner's
   > aesthetic call, not mine to assume** — item **G**. Containment, if he wants it, costs a
   > per-route h1 scale = a SPEC change plus a re-verify of five routes; I am not scoping it
   > on spec.
   >
   > **FQ12 — route it, exactly the way 18/19 were routed; the task does not stay open for
   > it.** Item **A**. Your CSSOM enumeration is the right substitute evidence and I checked
   > it against the source: every mover on `/` sits in a file that carries a
   > `prefers-reduced-motion: reduce` block (`globals.css`, `SiteHeader`, `SiteFooter`,
   > `HomeHero`, `HomeCapabilities`), and `respectReducedMotion: true` covers the Burger.
   > Coverage is verified; the behavioural look needs an OS switch neither of us has.

## Review

**Verdict: DONE** — Sober (SA), 2026-08-30.

19 checks run and passed; check 16 NOT-RUN for a stated environmental reason with rule
coverage verified instead and the behavioural look routed to the owner. No source file
changed — corroborated independently: the human has since committed this REQ's work
(`566d466`, `2ef36ec`, `0211d44` on `develop`), and HEAD's file set is **16 files = your
12 modified + 4 untracked**, so nothing entered the tree during this sweep. Working tree
is now clean apart from `front/.next.zip`, which is the human's, not ours.

What makes this a pass rather than a tick-through: every check reports an observation, the
two carried-over checks (18/19) were actually run in a painting browser, the three method
limits are stated rather than buried (scripted activation at mobile, no synthetic `Return`,
the valid `mailto:` submit deliberately not fired), and you corrected my own check text
instead of matching the browser to it. Spot-checked against the repo, not taken on trust:
old-identity grep 0 hits in `front/src`; `header` `border-bottom: 1px solid transparent`
vs `--site-header-height` 64/72px — the 1px is real and by construction; dark-block
`--site-cta-bg/-hover/-fg` = `iris[4]`/`iris[3]`/`obsidian[9]`, the SA-OWN-1 corrected
values behind your 5.11/7.08; exactly two `PullQuote`s on Home (`q4` hero, `q2` band).

**Owner-eye checklist — the handover package for Porter.** Seven items no agent on this
team can settle. Detail is in this file; Porter takes these to the owner, in Thai.

- **A — reduced motion (check 16).** With the OS reduced-motion switch ON, load `/`: the
  hero should not animate in and nothing should move. Coverage is proven; the look is not.
- **B — the 1px band (check 20(b)).** At scroll 0, is a thin dark rule visible along the
  very top edge, at 1280 and at 360? Measured step 1.15–1.43:1, up to +37R/+20G/+86B. If he
  sees it, the remedy is a SPEC decision (most likely the header hairline becomes a
  `box-shadow` so it stops adding to the bar's box) — not a one-off `+1px`.
- **C — the hero at a short desktop window (check 20(a), corrected).** At 1280×600 both
  CTAs and the hero quote are below the fold and the lead paragraph cuts mid-sentence.
  **On a phone (360×740) they are not** — that half of the original premise was wrong.
- **D — `/contact` real send (check 4).** A valid submit was deliberately not fired; it
  sets `window.location.href = mailto:…` and would launch his mail client. Unchanged code
  (empty diff), but only he can send one for real.
- **E — skip-link activation by keyboard (check 13).** Ring, tab order and pointer
  activation all verified; `Enter` specifically could not be dispatched through the
  automation layer. One keystroke for him.
- **F — `/contact` required-field asterisk is 4.37:1** (three instances, Mantine's default
  red on the new dark ground). Caused by this REQ, out of its Home-only scope, no bar
  broken. Scope question: fold into the routes REQ, or its own small one?
- **G — the display `h1` now applies to all five out-of-scope routes** (`/about` ~136px).
  Intentional groundwork from the global token layer. Leave it, or contain it until those
  routes are rebuilt (SPEC change + five-route re-verify)?

**All five TASKs of SPEC-001 are DONE.** SPEC-001 → `DONE`, REQ-001 → `SPEC_DONE` on the
board. Porter owns the next step: the owner's acceptance check, which includes the three
criteria only he can tick — that `/` no longer reads as "like Claude" and reads as his own,
and his confirmation of Porter's English for quote `q2`.
