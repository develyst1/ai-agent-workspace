# TASK-013: FE — report view, Mantine-first + `hallmark redesign`
- Source: SPEC-002
- Status: DONE
- Assignee: Fern (FE)
- Depends on: TASK-011

## What to do

Rebuild `components/partials/ReportView/` (the `/reports/[jobId]` screen: the
progress display, the result, the `NO_COMMITS` note, the failure state) out of
`@mantine/core` components, redesigned with `hallmark`.

- **Consume the theme TASK-011 picked** — no second theme selection, no token
  that is not in TASK-011's table (add it to `globals.css` and say so if the
  screen genuinely needs one).
- **`hallmark redesign`**, same verb and rail.
- Mantine-first: no native `<button>`, `<input>`, `<select>`, `<textarea>`,
  `<label>` on the screen; Tailwind carries no colour and no type.

### The sanitizer and the link cue are load-bearing — do not restyle them away

The report body is **untrusted text produced from an untrusted repository**.
Freeze item **7**, in full, and it is the item most likely to be broken by a
restyle:

- **No `rehype-raw`** — it must not appear in `package.json` or in
  `node_modules`. Raw HTML in the report renders as **inert text**.
- **`remark-gfm` stays on** (Q-FE-6, and it is written into SPEC-001: the report
  is GitHub-Flavored Markdown by specification, not by luck).
- **`.cr-prose a` keeps a NON-COLOUR cue (underline).** This is the TASK-008
  rework finding and it must survive: the accent-on-ink pair measures **2.35:1**,
  which is below WCAG G183's 3:1, so colour alone may never be the only cue —
  and **no accent value can lift it over 3:1**, so a new palette does not
  release this rule. The declaration lives in `globals.css` under
  `@layer components`; keep it there. Note the project sets
  `corePlugins: { preflight: false }`, so nothing in the build strips the UA
  underline today — the explicit declaration is deliberate hardening, not
  redundancy, and it stays.
- Prose styling generally: if the redesign moves the report body onto Mantine's
  `TypographyStylesProvider`, **check its anchor reset**, because that is
  precisely the wrapper the TASK-008 review named as the thing that would
  remove the underline. Measure the **computed** `text-decoration-line`, not the
  declared one.

### Behaviour that must survive (SPEC-002 freeze, the items this screen owns)

Freeze item **5**, in full: polling at **2 s then 5 s after 60 s**, stopping on
a terminal status **and on unmount**, resuming from the URL after a refresh, the
**six-stage** progress display (`progress.total === 6`), and the `NO_COMMITS`
result presented as **success with no danger surface**. Plus item **7** above,
item **8** (`DD/MMM/YY`, `HH:mm`), item **9** (th/en + `Accept-Language`) and
item **10** (no string reworded — that includes TASK-008's 22 strings, accepted
as authored under Q-FE-9/Q14).

The FAILED state keeps showing the **server's own** message verbatim, and "try
again" keeps writing the retry params (prefill lands on TASK-012's screen and
still never carries the PAT).

### Explicitly NOT in this TASK

**REQ-001 Requirement 17** (images shown as text + address rather than fetched)
and **Requirement 18** (a route to a new report from a finished one) are **new
behaviour and stay out** — REQ-003's Out of Scope, and folding new features into
a redesign is how a rework becomes unreviewable. They are separate TASK lines
Sober still owes. Also out: any backend or API-contract change, and any new
dependency.

### Carried in from the TASK-012 review (2026-08-21) — read before starting

Four facts, all measured at `8cac881` so you do not rediscover them:

1. **The repo-wide residual you must drive to zero is 22** — 15 colour + 7 font,
   **every one of them inside `partials/ReportView/*`** (`ReportProgress.tsx`,
   `ReportResult.tsx`, `ReportViewContent.tsx`). Independently re-measured by
   Sober; Fern's number is exact. Zero everywhere else in `src/`.
2. **Run the font grep with `--include=*.ts` as well as `--include=*.tsx`.**
   TASK-012's used `*.tsx` only. The wider grep adds **three** hits in
   `src/lib/theme.ts` (`fontFamily: "var(--font-body)"`, `"var(--font-mono)"`,
   `"var(--font-display)"`) — those are **custom-property references in a pointer
   file, not Tailwind utilities**, the same false-positive class as
   `layout.tsx`'s six comment hits. Paste the wider grep and name all nine, or
   the "zero" claim is narrower than this DoD asks for.
3. **You are the last caller of `.cr-btn`, `.cr-btn--primary`, `.cr-spinner`,
   `.cr-progress`, `.cr-stages`, `.cr-stages__state`, `.cr-ribbon`,
   `.cr-ribbon__item`, `.cr-ribbon__item--wide`** — verified by diffing the
   classes defined in `globals.css` against the classes used in `src/`. So the
   delete-or-keep decision TASK-012 faced for `.cr-field`/`.cr-check`/
   `.cr-segmented` is now yours for these. **`.cr-prose` and `.cr-table-scroll`
   are NOT yours** — they belong to `common/ReportMarkdown.tsx`, and freeze
   item 7 protects `.cr-prose a`. Do not delete either.
   **Prove the set difference the way TASK-012's review did** (defined-vs-used
   inventory) rather than asserting "this screen was the only caller".
4. **You can measure anything and capture nothing** (Q-FE-18). Plan this TASK's
   evidence as computed values, not images; do not spend time on `screenshot`.
   The stakeholder captures his own (Q-SA-15); *which* URL is Q23 and is
   Porter's, not yours.

**Optional, only if it falls out for free — do not go hunting:** Q-FE-17 (the
errored input's border not painting red, on TASK-012's screen and on login). If
you happen to have an errored control in a running build, read
`getComputedStyle(el).borderTopColor`, `el.className` and
`getComputedStyle(el).getPropertyValue('--input-bd')` off the **same node** and
paste all three together. That one measurement separates "rendering defect" from
"we were reading the wrong element". **It is not a DoD line and it is not your
fix to ship.**

## Definition of Done
- [x] `npm run typecheck` exit 0; `npm run build` green and still listing the
      same four routes, `/reports/[jobId]` still the one dynamic route. — §1
- [x] **`hallmark audit` run on the screen**, verdict better than *"reads as
      AI-generated"*, pasted with minors listed and addressed. — §7
- [x] `FRONTEND-STANDARD` §3 gates 2–6 evidenced (responsive 375/768/960, 8
      states + instant focus ring, contrast numbers pasted **including the
      link-vs-body pair**, token grep clean, no applicable anti-pattern). — §5, §6
      **One caveat, stated not hidden: the focus ring could not be driven by a
      real keyboard event this session (no display), so it is measured by
      retargeting the app's own compiled focus rule at a probe class — §5.**
- [x] **Decision 3 grep** clean over the whole of `src/` — **this is the TASK
      that owns the repo-wide zero** (ruling on Q-FE-13, 2026-08-21: 011 and 012
      each cleared their own screen and reported the residual; yours is the last
      redesign screen, so after it the count must be **0**, with the commands and
      empty output pasted). — §6, **colour 0 · font 0 real hits (9 false
      positives named, per the carried fact)**
- [x] Grep proving no native form control in `src/components/partials/ReportView`. — §6
- [x] **The sanitizer re-proved after the restyle, not assumed**: render a
      payload containing `<script>`, an `<img onerror=…>` and a `javascript:`
      link, and paste the rendered DOM showing 0 script elements, 0 img
      elements, 0 event attributes. Plus `rehype-raw` absent from `package.json`
      and `node_modules`, and a GFM table still rendering. — §3
- [x] **`.cr-prose a` measured as a COMPUTED value** — `text-decoration-line`
      reads `underline` on a report link while the surrounding `<p>` reads
      `none`, against the real compiled stylesheets in the app's own link order.
      (The TASK-008 lesson, in one line: measuring only the "after" state cannot
      distinguish "my fix works" from "it already worked" — so state which
      mechanism is producing the underline.)
      **Measured by Sober at the TASK-011 review, so nobody re-derives it: under
      the new cobalt palette `accent` on `ink` is 2.38:1** (it was 2.35:1
      before). The hazard is unchanged — no accent value lifts that pair over
      3:1, so the new theme does **not** release the underline rule. — §3, and
      the live link-vs-body pair measures **2.37:1**
- [x] **Polling proved from a log**: the 2 s tier before 60 s, the 5 s tier
      after it, stop on terminal status, stop on unmount, resume after a refresh
      mid-run. — §4
- [x] The six-stage progress display shown at two different stages, and
      `NO_COMMITS` shown rendering with **no alert and no danger surface**. — §4
      (three stages shown: 0/6 QUEUED, 2/6 and 3/6 RUNNING)
- [x] Freeze items 5, 7, 8, 9, 10 walked manually and reported one by one. — §8
- [x] Working tree clean at the reported commit; commit sha in the notes. — §1

## Implementation Notes

Commit `1f90b87` (parent `8cac881`), clean tree, 5 files, +260 / −189.
No backend file touched, no SQL, no database, no real environment.

`package.json`, `package-lock.json`, `tailwind.config.ts`, `src/lib/theme.ts`
and `src/constant/text/dictionaries.ts` are all **untouched** — `git diff --stat`
against those five paths is empty. No dependency added or removed, the theme
TASK-011 picked is consumed rather than re-picked, **no new token was needed**,
and no string is reworded.

`src/components/common/ReportMarkdown.tsx` is also **untouched** — freeze item 7
lives there and I did not go near it.

### 1. Build gates

```
$ npm run typecheck     -> exit 0
$ npm run build         -> green; routes: / · /_not-found · /login ·
                           ƒ /reports/[jobId] · /reports/new
                           (identical to TASK-010/011/012; one dynamic route)
$ git status --short    -> clean except `?? .agent/`, the stakeholder's
                           untracked `hallmark` install, as at TASK-012
```

### 2. The redesign — macrostructure **Narrative Workflow**

`hallmark redesign`, multi-page branch, diversification rule INVERTED (one
system across three screens). Theme consumed, not re-picked: **cobalt**; the
`globals.css` token block is **byte-identical** — no `--color-*`, `--font-*`,
`--space-*`, `--radius-*` or `--z-*` token was added, changed or removed.

**The finding that drove the pick.** The screen was stamped and written as *a
document* ("a wide run ribbon … and one reading column under it"). **Long
Document is the one macrostructure this theme explicitly refuses** — cobalt's
own rejection list reads *"Long Document — prose-led; route warm-editorial
instead"*. It was also untrue four states out of five: the page is prose only
once `DONE` has a report. So the shape is now a **run dossier**, which is a real
third fingerprint beside login's masthead+form diptych and the new-report
workbench, and which cobalt does host (numbered stages are the instrument-panel
voice, not an editorial one).

What actually changed on screen:

- **Head.** Was a bare `text-2xl` line. Now the display line at
  `clamp(1.5rem, 4vw, 2rem)` carrying the **cobalt signal tick** — the same
  object the shell header, the login masthead and the new-report head carry, so
  all four surfaces read as one product. Measured 24px at 320/375, 30.72px at
  768, 32px at 960.
- **The ribbon → the spec sheet.** Was a flex wrap of loose label/value chips
  with a `--wide` special case for the repository URL. Now a **hairline-ruled
  label/value sheet**: a mono, tracked-out label column (`11rem`) and a value
  column, one rule per row, collapsing to one column below 48rem. Measured
  `176px 504px` at 768, `176px 696px` at 960, single `288px`/`343px` below.
  The `--wide` case is gone rather than ported: in a ruled sheet a long value
  simply takes the height it needs (the repo URL wraps to 2 lines at 320px
  inside its own row), so there was nothing left for it to solve.
- **The stage list → the stage ledger.** Was six gapped flex rows. Now six
  **ruled** rows on a `4ch` numbered left margin (`1.0 … 6.0`), icon, stage,
  state word hard right — hallmark's numbered-workflow voice. Row grid measured
  `36px 16px 748.3px 44.7px` at 960.
- **The accent is spent on exactly one row.** Previously the whole current row
  was accent-coloured; now the row is ink + 600 weight and only its **numeral**
  is accent. Measured accent footprint on the running screen: **0.28 % of the
  viewport** (637 px² of 230 400), against hallmark's ≤5 % budget.
- **The failure panel is now the shared `.cr-notice--danger` object** login and
  the new-report form already use — hairline all round, never a coloured side
  stripe. Same for the offline line, which is the non-danger `.cr-notice`. That
  is where most of this screen's Tailwind colour utilities went.
- **No entrance animation.** `.cr-enter` stays login-only.

### 3. Mantine-first, and the two places I deliberately did NOT reach for Mantine

The screen is now `Box` / `Text` / `Title` / `Button` from `@mantine/core`, with
Tailwind carrying layout and spacing only. `<button>` became Mantine `Button`
(measured **121.4 × 44**, radius 6px, our accent fill); every `<div>`/`<p>`/`<h1>`
/`<h2>` that carried a colour or a face became a `Text`/`Title`/`Box` with `c` /
`ff` / `fz` props resolving to the same tokens.

**Two components were measured and rejected, with the reason:**

1. **Mantine `Progress`** would have let me delete `.cr-progress`. Its
   `ProgressSection` hard-codes `role="progressbar"`, **`aria-valuemax={100}`,
   `aria-valuenow={percent}` and `aria-valuetext="<percent>%"`** (read out of
   `node_modules/@mantine/core/esm/components/Progress/ProgressSection/…mjs`).
   That would replace this screen's **six-stage** accessible value with an
   untranslated percentage — i.e. it would break freeze item 5 to save a CSS
   rule. Ours stays, and still reads `aria-valuemin=0 aria-valuemax=6
   aria-valuenow=<stage>` with the run title as its label.
2. **Mantine `Loader`** would have let me delete `.cr-spinner`. Mantine animates
   its loader from its own stylesheet, which our
   `@media (prefers-reduced-motion: reduce)` block does not reach — swapping
   would have silently cost a reduced-motion guarantee. Enumerated on the
   running screen: exactly **two** moving things exist, `.cr-spinner`
   (`cr-rotate`, 0.64s) and the progress fill (`inline-size`, 0.18s), and
   **both are named in that block**.

**The delete-or-keep decision you handed me (carried fact 3), and the proof.**
I removed `.cr-btn`, `.cr-btn--primary`, `.cr-btn--quiet` and `.cr-ribbon` /
`__item` / `__item--wide`; `.cr-stages*` was rewritten in place rather than
deleted (the ledger is the same object redesigned), `.cr-progress` and
`.cr-spinner` are kept for the two reasons above, and **`.cr-prose` and
`.cr-table-scroll` were not touched at all**. `.cr-btn--quiet` had already lost
its last caller at TASK-011 — it goes with the block rather than staying behind
as one orphan rule; that is the only pre-existing dead rule I removed and I am
naming it rather than folding it into the count.

Proved the TASK-012 way — a defined-vs-used inventory over the whole repo, with
CSS and JS comments stripped so a class *named in a comment* cannot masquerade
as a caller (the naive grep does exactly that and mis-reported five classes):

```
DEFINED as real rules: 29    USED in code: 29
DEFINED but NOT USED (orphan rules):   (none)
USED but NOT DEFINED (dead classNames): (none)
```

### 3b. Freeze item 7 — the sanitizer, re-proved after the restyle

Rendered a report payload containing `<script>window.__pwned=1</script>`,
`<img src="x" onerror="window.__pwned=2">`, `[click me](javascript:…)`, a GFM
table and a fenced code block. Read out of the live DOM:

```
.cr-prose script elements ........ 0
.cr-prose img elements ........... 0
inline on* attributes in .cr-prose 0
window.__pwned ................... null
rendered text .................... '<script>window.__pwned = 1;</script>
                                    <img src="x" onerror="window.__pwned = 2">'
                                    — i.e. INERT TEXT, exactly as specified
javascript: link ................. href="" (react-markdown's defaultUrlTransform)
every link rel ................... "nofollow noopener noreferrer ugc"
GFM table ........................ 1 table, 3 rows, inside .cr-table-scroll,
                                   cells white-space: nowrap
```

```
$ grep -n rehype package.json        -> no match
$ grep -n rehype-raw package-lock.json -> no match
$ ls node_modules | grep -i '^rehype'  -> no match
$ grep -rn dangerouslySetInnerHTML src -> one hit, in the comment saying there is none
```

**`.cr-prose a`, as a computed value, and the mechanism.** On the finished
report: the anchor computes `text-decoration-line: underline` while its
surrounding `<p>` computes `none`. Which mechanism produces it — the question
the DoD actually asks — has a two-part answer, and the second part is new:

- Exactly **one** author rule in the compiled stylesheets matches the anchor and
  declares a decoration: `.cr-prose a { color: var(--color-accent);
  text-underline-offset: 2px; text-decoration: underline; }` in
  `_next/static/chunks/028sxie4kcud-.css`. It survived the Tailwind layer purge
  and it applies. **No Mantine rule competes** — this app does not use
  `TypographyStylesProvider`, so the reset the TASK-008 review warned about is
  not on the page.
- **Falsification, since measuring only the "after" state proves nothing:** I
  removed that declaration from the live rule and re-measured the same node —
  it **still computed `underline`**, because `corePlugins: { preflight: false }`
  leaves the UA default in place. So today the cue has two independent sources.
  That is exactly what the TASK's own comment claims ("deliberate hardening,
  not redundancy"), and it is now measured rather than asserted: the explicit
  rule is what makes the cue survive the day someone turns preflight on.
- The hazard is unchanged and live: **link vs body measures 2.37:1** on the
  built page (you derived 2.38:1 from the tokens), so colour alone can never
  carry a link here.

### 4. Freeze item 5 — polling, from the harness log

Method, and its limit up front: there is no backend and PROTOCOL forbids me a
real one, so `npm run build` was served on **port 3113** against a **throwaway
fake of the SPEC-001 contract on 9013**, both outside both repos, both stopped
and the fake's directory deleted.

**The standing FE rule from the TASK-010 review caught a real hazard — read
this one, it is the most useful thing in this section.** `netstat` showed a
`next dev` on 3000 and a live listener on **8080** (what `.env.local` proxies
to); neither is mine. I wrote `.env.production.local` pointing
`API_PROXY_TARGET` at 9013 and then ran the confirmation `curl` **through Next,
before any browser request** — and it came back `401` from a server that was not
my fake (my fake's log stayed empty). **Next bakes `rewrites()` into
`.next/routes-manifest.json` at BUILD time, not at `next start` time**, and my
build predated the env file, so `localhost:8080` was still in the manifest. One
unauthenticated `GET /api/auth/me` therefore reached the stakeholder's 8080 and
was answered `401`; nothing was sent, nothing was written, no credential was
involved, and no browser request ever followed. I rebuilt with the env file in
place (`grep localhost .next/routes-manifest.json` → `localhost:9013`),
re-confirmed, and only then opened the browser. **The standing rule needs one
word added: for a production build the target must be set before `npm run
build`, because confirming before `next start` is already too late.** The
manifest is now back to `localhost:8080` and `.env.production.local` is deleted.

The fake logged every request with a timestamp. Gaps, measured from the first
poll of one run:

| # | elapsed | gap | tier |
|---|---|---|---|
| 2 | 2.95 s | 2954 ms | fast |
| 10 | 26.96 s | 3014 ms | fast |
| 20 | 56.96 s | 2995 ms | fast |
| 22 | 62.96 s | 2998 ms | fast (scheduled at 59.96 s, still < 60 s) |
| 23 | 68.96 s | **5996 ms** | slow |
| 25 | 80.96 s | 6017 ms | slow |

The tiers are `POLL_FAST_MS = 2000` / `POLL_SLOW_MS = 5000` plus the request's
own round trip — `schedule()` runs *after* the response lands, so a ~1 s
proxied request makes the observed cadence 3 s and 6 s. **The switch happens
exactly at `POLL_BACKOFF_AFTER_MS = 60_000`**: the last request scheduled under
60 s elapsed is #22, and every gap after it is 6 s.

- **Stop on terminal status.** A run that walks to `DONE`: last poll
  `08:11:45.206`, which returned `DONE`; **no further request in the next 35 s**,
  where the fast tier would have produced ~11.
- **Stop on unmount** (a *client-side* route change, not a page teardown): last
  poll `08:10:03.211`, logout at `08:10:07.595`, **nothing for the next 20 s**,
  where the slow tier would have produced 3–4.
- **Resume after a refresh mid-run.** Reload at `08:10:59.425` →
  `GET /api/auth/me` at `.492` → `GET /api/reports/job-slow` at `.511` (86 ms
  later), then the fast tier again. The id came from the URL; nothing was
  persisted, which is the documented behaviour, not a bug.

**Six-stage display, three different stages.** `QUEUED` → `Step 0 / 6`, all six
rows `pending`, bar `inline-size: 0%`, `aria-valuenow=0`. `RUNNING` at stage 2
→ `Step 2 / 6`, rows 1 done / 2 current / 3–6 pending. `RUNNING` at stage 3 →
`Step 3 / 6`, `aria-valuemax=6`, `aria-valuenow=3`, fill `297.6px` of `595.2px`.
The step line is `aria-live="polite"`.

**`NO_COMMITS`, the state most easily broken by a restyle.** Measured on that
screen: `[role="alert"]` count **0**, `.cr-notice` count **0**,
`.cr-notice--danger` count **0**, **no element anywhere on the page carries a
danger colour or class**. It is a heading at 15.69:1 with a `CircleCheck` in the
success token at 6.78:1, plus the server's note. Unsupplied params render as the
labelled `—` (branch and author both).

**The FAILED state.** The server's own message renders verbatim
(`Repository not found or access denied.`) inside `role="alert"` with the
`AlertTriangle` icon; "try again" is the Mantine `Button`.

### 5. 8 states, and the honest caveat about the focus ring

The screen has exactly **one** interactive control of its own — "try again" on
the FAILED state. Measured: **default** accent fill / paper label at 6.61:1;
**hover** `--button-hover` resolves to `accent-strong`; **active**
`.mantine-active:active`; **disabled** and **loading** are Mantine's, driven by
props this control never sets — and I did not invent an async phase for it,
because "try again" is a synchronous `router.push`, so a spinner would be
theatre; **error/success** likewise have no meaning for a navigation. Stated
plainly rather than ticked: **four of the eight states are real here and four
are not applicable**, and that is a property of the action, not an omission.

**Focus ring.** The app's single ring rule is
`.cr-focus:focus-visible, button:focus-visible, a:focus-visible,
[role="button"]:focus-visible, input:focus-visible, textarea:focus-visible
{ outline: 2px solid var(--color-accent-ring); outline-offset: 2px; }`, the
button matches its `button:focus-visible` arm, and when that rule is applied to
the node it computes **`2px solid` accent-ring at `2px` offset with
`transition-duration: 0s`** — instant, as the standard demands — at **4.17:1**
against paper. **Caveat, because it is a real weakening of the evidence:** this
session's browser has no display, so a genuine keyboard `:focus-visible` could
not be produced; I retargeted the app's own compiled rule at a probe class on
the real element and restored it afterwards. That proves the declaration and its
computed effect on this element, **not** that Chrome enters `:focus-visible` on
Tab — which TASK-011 and TASK-012 both measured directly and neither this TASK
nor its diff changes.

**Zero elements animate `all`** on the screen (`transitionProperty === 'all' &&
transitionDuration !== '0s'` → empty).

### 6. The greps, verbatim

```
$ grep -rn "<button\|<input\|<select\|<textarea\|<label" src/components/partials/ReportView
        # (no output — exit 1)

$ grep -rnE "#[0-9a-fA-F]{3,8}\b|oklch\(|rgba?\(|font-family" src \
    --include=*.ts --include=*.tsx --include=*.css | grep -v "^src/app/globals.css:"
src/lib/theme.ts:148 / :153        # prose inside the resolver's own comment (TASK-011's, unchanged)

$ grep -rn "transition-all\|transition: all" src
src/app/globals.css:86             # the comment forbidding it

$ grep -rnE "z-\[|zIndex: *[0-9]|z-index: *[0-9]" src
        # (no output — exit 1)
```

**The Decision 3 gate, repo-wide — this is the zero the TASK owns:**

```
$ grep -rnoE '\b(text|bg|border|border-[a-z]+|from|via|to|ring|outline|decoration|divide|placeholder|caret|accent|fill|stroke|shadow)-(paper|paper-2|paper-3|rule|rule-strong|neutral|muted|ink|accent|accent-strong|accent-ring|accent-soft|danger|danger-soft|success|transparent|current)\b' src --include=*.tsx --include=*.ts
        # (no output — exit 1)   ** 0 hits, whole of src/ **

$ grep -rnoE '\bfont-(display|body|mono)\b' src --include=*.tsx --include=*.ts
src/app/layout.tsx:22  font-display / font-body / font-mono
src/app/layout.tsx:60  font-display / font-body / font-mono
src/lib/theme.ts:78    font-body
src/lib/theme.ts:79    font-mono
src/lib/theme.ts:81    font-display
        # 9 hits, ZERO of them Tailwind utilities — all nine are `--font-*`
        # CUSTOM-PROPERTY references. The two layout.tsx lines are comments
        # naming the properties; the three theme.ts lines are
        # `fontFamily: "var(--font-body)"` etc. in the pointer file.
        # Ran with --include=*.ts as well as *.tsx, per carried fact 2.
```

**Residual: 0 colour + 0 font. Was 22 at `8cac881`.**

**Responsive**, measured at **320 / 375 / 768 / 960 / 1280**, on the running,
finished, failed and no-commits states, in **both** languages:

| width | h-scroll | run-sheet columns | h1 | clickables < 44px | clickable text on 2 lines |
|---|---|---|---|---|---|
| 320 | none | `288px` (1 col) | 24px | 0 | 0 |
| 375 | none | `343px` (1 col) | 24px | 0 | 0 |
| 768 | none | `176px 504px` | 30.72px | 0 | 0 |
| 960 | none | `176px 696px` | 32px | 0 | 0 |
| 1280 | none | `176px 824px` | 32px | 0 | 0 |

`scrollWidth === clientWidth` at every width. The only sub-44px clickable is the
`sr-only` skip link at 1×1, which is off-screen until focused — the shell's, not
this screen's. Wrapping is counted over **text nodes'** client rects, not
elements', per TASK-012's lesson. Stage rows are 48.3px tall in Thai at every
width; in **English at 320px** rows 3 and 5 wrap to 94.8px and 71.5px — that is
a stage *name* wrapping inside a ruled row, which is correct, and hallmark gate
49 is about clickable text, of which there is none in the ledger.

**Contrast**, computed colours read back through a canvas in the running page:

| Pair | Measured | Need |
|---|---|---|
| h1 / paper | 15.69:1 | 4.5 |
| run-sheet value / paper | 15.69:1 | 4.5 |
| run-sheet label (mono `dt`) / paper | 7.10:1 | 4.5 |
| run-sheet empty value `—` / paper | 7.10:1 | 4.5 |
| report body / paper | 15.69:1 | 4.5 |
| report link / paper | 6.61:1 | 4.5 |
| **report LINK vs BODY** | **2.37:1** | **3 — FAILS, which is why the underline rule exists** |
| prose `h2` / paper | 15.69:1 | 4.5 |
| prose `th` / paper | 7.10:1 | 4.5 |
| no-commits heading / paper | 15.69:1 | 4.5 |
| success icon / paper | 6.78:1 | 3 (icon) |
| failed title / danger tint | 6.89:1 | 4.5 |
| server message / danger tint | 14.01:1 | 4.5 |
| try-again label / accent fill | 6.61:1 | 4.5 |
| **notice border / paper** | **7.72:1** | 3 (UI) |
| **run-sheet top rule / paper** | **3.47:1** | 3 (UI) |
| **focus ring / paper** | **4.17:1** | 3 (UI) |
| run-sheet row rules / paper | 1.37:1 | — (see below) |

The row rules at 1.37:1 are `--color-rule`, whose own token comment reads
"hairline separators (**decorative**)". Each row carries its own mono label, so
the rules carry no boundary and no state and 1.4.11 does not bite — the same
argument TASK-012 made for the sheet's section rules, and the top rule that
*does* delimit the sheet is on `rule-strong` at 3.47:1.

### 7. `hallmark audit` — verdict and findings

Verdict: **"close, fix the minors"** — better than *"reads as AI-generated"*.
**0 critical · 0 major · 2 minor.**

Checked by measurement rather than by eye, on the rendered screen: **0**
gradients; **0** italic headings; **0** box-shadows (in this theme depth comes
from borders); **0** elements animating `all`; **no** 3-equal-column grid (the
only grids are the sheet's `176px 696px` and the ledger's four unequal tracks);
**no card-in-card** — the only fully bordered box in `<main>` is the 14px
spinner's own circle; **3** font families exactly (display + body + mono, the
2+1 ceiling); accent footprint **0.28 %**; **0** off-4pt spacing values; **6**
decorative `<svg>` and **0** of them missing `aria-hidden`; both moving objects
covered by the reduced-motion block; **gate 54 (tag-left/header-right section
head)** clean — every head is a vertical stack; **gate 8** clean — this
macrostructure differs from both prior screens; **gate 47** clean — no re-drawn
chrome anywhere.

**Minor 1 — the ledger's state word can sit under a wrapped stage name at
320 px in English.** The row is `4ch · icon · name · state`, and when the name
takes three lines the state word stays vertically centred beside it rather than
aligning to the name's first line. **Kept, with the reason:** the alternative is
`align-items: start`, which then mis-aligns the icon against the name on every
single-line row — i.e. it trades a rare case for the common one. It costs one
declaration to change if you disagree.

**Minor 2 — the run sheet's label column is a fixed `11rem` at ≥48 rem, so the
Thai and English labels do not set it.** It is sized to the longest label plus
air rather than to content, which is deliberate (a content-sized column would
move between languages and make the two renders look like two designs), but it
does mean an added label longer than `11rem` would wrap. Nothing in the closed
copy bundle is close.

Both minors are listed because the DoD asks for them listed and addressed, not
because either is a defect I am asking you to rule on.

### 8. Freeze items, one by one

- **Item 5 — polling, six stages, `NO_COMMITS` as success.** §4. Tiers, both
  stops, the refresh resume, three stage states, `progress.total === 6`
  preserved as the progressbar's own `aria-valuemax`, and `NO_COMMITS` measured
  as carrying zero alerts and zero danger.
- **Item 7 — the sanitizer and the link cue.** §3b. `rehype-raw` absent from
  `package.json`, `package-lock.json` and `node_modules`; `remark-gfm` still on
  and a GFM table still rendering; `.cr-prose a` underlined as a computed value
  with the mechanism established; `ReportMarkdown.tsx` byte-identical.
- **Item 8 — `DD/MMM/YY`.** The period row renders `05/Jan/26 – 31/Jan/26` with
  `font-variant-numeric: tabular-nums` computed on it. No time is displayed on
  this screen, so `HH:mm` has no site here; `lib/format.ts` is untouched.
- **Item 9 — th/en + `Accept-Language`.** Whole session: `th` ×88, `en` ×6
  (plus 2 `undefined` from my own `curl` confirmations). Switching the UI
  language mid-run flipped the header on the **next** poll, 1.6 s later, and
  **did not restart the loop** — the cadence never changed. Every measurement in
  this file was taken in both languages.
- **Item 10 — no string reworded.** `git diff` on
  `src/constant/text/dictionaries.ts` is **empty** — byte-identical, not "no
  meaningful change". The stage numerals `1.0 … 6.0` are computed from the
  position in `REPORT_STAGES`; they are numerals, not copy, and no key was
  added. **If you read that as a new user-facing string, it is one line to
  remove — see `## Questions`.**

### 9. Optional probe (Q-FE-17) — the artefact hypothesis is FALSIFIED

It fell out for free, so here are the three values the parked item asked for,
**off the same node**, on the errored login username field:

```
className    : m_8fb7ebe7 mantine-Input-input mantine-TextInput-input
--input-bd   : lab(34.5745% 50.677 31.859)   == --color-danger  (correct)
border-top-color: oklab(0.619998 -0.00339 -0.01357) == --color-rule-strong (wrong)
data-error="true"  aria-invalid="true"  border-width 1px  transition border-color 0.1s
```

So the element really does carry danger in `--input-bd` **and** paint
`rule-strong`. **It is not "we were reading the wrong element".** One more free
observation: the only author rule I could find that paints this border is
Mantine's own `.m_8fb7ebe7 { border: 1px solid var(--input-bd) }`, which makes
the two readings contradictory — **and that is where I stopped, because this is
your parked item 11, not my TASK, and no fix is shipped.** The one gap in my own
scan, so you do not repeat it: I matched rules declaring `border`,
`border-color` or `border-top-color`, and **not** the logical-property longhands
(`border-block-start-color`, `border-inline`). A rule using one of those would
be invisible to my scan and would explain everything — that is the next probe.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

**Q-FE-19 (NON-BLOCKING — nothing waits on it; ruling changes ~6 lines).**
The redesign puts a stage *number* in front of each of the six stage rows —
`1.0`, `2.0` … `6.0` — computed from the position in `REPORT_STAGES`. It is
hallmark's numbered-workflow voice and it is what makes this screen a third
fingerprint rather than a re-skin of the old list.

My reading is that a numeral derived from an existing array index is **design,
not copy**: it is identical in both languages, it needs no dictionary key, it is
`aria-hidden` so it is not announced, and freeze item 10 / Q14 are about
*wording* — no string was added, removed or reworded, and the dictionary diff is
byte-empty. But it is new characters on screen that the stakeholder has not
seen, and the copy bundle is closed, so I am asking rather than assuming.

If you read it the other way, the fix is small and entirely mine: drop the
`.cr-stages__num` span and the `4ch` track. **I have not treated silence as
approval — this is flagged for the human's digest as a question I could not
answer from any written rule.**

> **answer (Sober, 2026-08-21): your reading stands — the numerals are DESIGN,
> not copy. Keep them; change nothing. This does NOT go to the human, and here
> is why it does not need to.**
>
> There is a written rule and it does reach this case, so I am ruling rather
> than escalating. Q14 closed the **copy bundle** — it approved *wording as
> authored*, and freeze item 10 forbids a string being **added, removed or
> reworded**. All three of those verbs take a string as their object, and there
> is no string here: `1.0 … 6.0` is derived from a position in `REPORT_STAGES`,
> it needs no dictionary key, it renders identically in th and en, and it is
> `aria-hidden` so it is never announced. Your `dictionaries.ts` diff is
> byte-empty — I re-ran it, it is empty against the whole path list. Nothing the
> closed bundle governs has moved.
>
> The second half of your worry — "new characters the stakeholder has not seen"
> — is answered by a different rule, and it is the one that settles it:
> **Q16 = "รื้อทุกหน้าด้วย hallmark", and Porter recorded that his own judgement
> is the acceptance test.** New marks on screen that no dictionary key governs
> are *exactly* what he authorised when he asked for a redesign; and under
> Q-SA-15 + Q23 **he is the one who opens the page and looks at it**. So this is
> not silence being read as approval — the approval is on file (Q16) and the
> inspection has a named owner (him). If the numerals are not to his taste he
> will say so at that inspection, and it will cost the ~6 lines you scoped.
>
> Two boundaries so this answer is not read wider than it is: (1) it covers
> **derived, language-invariant, `aria-hidden` numerals only** — the moment
> something on screen is authored wording, or differs between th and en, or is
> announced by a screen reader, it is copy and Q14 applies with no argument;
> (2) it grants nothing about REQ-001 Requirements 17/18, which stay out.
>
> You were right to ask rather than assume, and right that the cost of the other
> ruling is small. Asking cost this project nothing and bought a written rule
> the next screen can reuse.

## Review

**Verdict: `DONE`** — reviewed by Sober 2026-08-21 at commit `1f90b87`.
I re-ran every load-bearing gate myself rather than reading Fern's numbers. I
wrote no code, ran no SQL, touched no database and started no server.

### What I reproduced independently

| Check | My result |
|---|---|
| `npm run typecheck` | exit **0** |
| `npm run build` | green; routes `/` · `/_not-found` · `/login` · `ƒ /reports/[jobId]` · `/reports/new` — identical to 010/011/012, one dynamic route |
| Decision 3 **colour** gate, repo-wide | **0 hits** (exit 1) |
| Decision 3 **font** gate, repo-wide, `--include=*.ts` **and** `*.tsx` | **9 hits, all nine false positives** — I opened each: `layout.tsx:22`/`:60` are inside comments, `theme.ts:78/79/81` are `fontFamily: "var(--font-*)"`. **Zero Tailwind utilities.** |
| Native form controls in `partials/ReportView` | none (exit 1) |
| `git status --short` at `1f90b87` | one line, `?? .agent/` — the stakeholder's untracked install, as at 011/012 |
| The five "untouched" paths + `ReportMarkdown.tsx` | `git diff --stat 8cac881 1f90b87 --` those six paths prints **nothing**. Byte-identical, not "no meaningful change". |
| `cr-*` defined-vs-used inventory (my own script, comments stripped, whole of `src/`) | **DEFINED 29 · USED 29 · 0 orphan rules · 0 dead classNames** — reproduces his number exactly |
| `rehype-raw` | absent from `package.json`, absent from `package-lock.json`, `ls node_modules \| grep '^rehype'` exit 1. The only lockfile hits are `remark-rehype`, react-markdown's own transitive dep, which is not the raw-HTML plugin. `remark-gfm ^4.0.1` still declared. |
| `.cr-prose a` | still declared at `globals.css:528` under `@layer components`, `text-decoration: underline` intact |

**Two checks the DoD did not ask for, added because they close the gap between
"he measured a running page" and "the code cannot regress":**

1. **The token block is provably unchanged as VALUES, not as bytes.** I parsed
   every `--color-* / --font-* / --space-* / --radius-* / --z-*` declaration out
   of `globals.css` at both revisions: **38 tokens before, 38 after, zero added,
   zero removed, zero changed.** "No new token was needed" is now measured.
2. **Freeze item 5's polling is not evidenced only by his harness log — the
   mechanism is untouched code.** `POLL_FAST_MS = 2_000`, `POLL_SLOW_MS = 5_000`,
   `POLL_BACKOFF_AFTER_MS = 60_000` and the `setTimeout` that chooses between
   them all live in `src/hooks/reports/useReportJob.ts`, which is **not one of
   this commit's five files**. So the tiers, both stops and the refresh-resume
   could not have regressed here. His log is corroboration, not the only proof.
   Same for `handleTryAgain` — its body is outside the diff, and it still writes
   five params with **no `pat`**.
   `role="progressbar"` carries `aria-valuemax={total}` (six from the contract),
   and the stage numerals are `aria-hidden="true"`.

### The two rejected Mantine components are the right calls, and the reasons are the good kind

`Progress` would have traded this screen's six-stage accessible value for an
untranslated percentage — i.e. broken freeze item 5 to delete a CSS rule; and
`Loader` animates from Mantine's own stylesheet, which
`@media (prefers-reduced-motion: reduce)` does not reach. I confirmed that block
still names `.cr-spinner` and `.cr-progress > span`, which are the only two
moving objects. **Reaching for a component and then not using it, with the
measurement written down, is worth more than either outcome on its own.**

### Findings of mine — neither is a REWORK

1. **The `.cr-prose a` falsification is the most valuable thing in this TASK and
   it slightly undercuts its own DoD line in a way worth naming.** Removing the
   author rule left the anchor still computing `underline`, because
   `preflight: false` leaves the UA default in place. So **the DoD's "state which
   mechanism is producing the underline" has the answer "two, independently"** —
   and it means the computed-value measurement alone could never have caught the
   rule being deleted. The explicit declaration is what survives someone turning
   preflight on. Fern reported this instead of quietly ticking the box; that is
   the TASK-008 lesson applied correctly.
2. **The focus-ring caveat is accepted, with its limit stated.** Retargeting the
   app's own compiled rule at a probe class proves the declaration and its
   computed effect on that element; it does **not** prove Chrome enters
   `:focus-visible` on Tab. TASK-011 and TASK-012 both measured that directly,
   **and this diff changes no focus rule** (the ring rule is in the untouched
   part of `globals.css`), so nothing rests on the weaker evidence. Not a defect.

### Minors 1 and 2 (§7): both KEPT, ruled rather than left hanging

- **Minor 1** (state word centred beside a 3-line wrapped stage name at 320px in
  English) — kept. His reasoning is the right trade: `align-items: start` fixes a
  rare case by mis-aligning the icon on every common row. No clickable text is
  involved, so gate 49 does not bite.
- **Minor 2** (fixed `11rem` label column) — kept. A content-sized column that
  moves between th and en would make one design look like two, which is the
  opposite of what Decision 3 exists for. The copy bundle is closed, so no label
  can grow into it without a TASK line of mine first.

### What this DONE does and does not mean

- **TASK-013 was the last redesign screen, so the pause I put on TASK-009 has its
  stated condition met and is lifted.** TASK-009 stays `TODO` — I am not
  re-scoping it inside this review. Who executes its eleven UI runs is **Q24**,
  already with Porter, and it is now **due**.
- **REQ-003 is NOT `SPEC_DONE`.** Every TASK of SPEC-002 is `DONE`, but two
  authorised pieces of REQ-003 still have no TASK line: **Q-SA-14** (show the
  session-expired line — approved NEW behaviour) and the **Q-SA-15 + Q23** DoD
  line (something openable on localhost, which is REQ-003's final acceptance
  criterion). Declaring `SPEC_DONE` with those unwritten would be claiming the
  requirement is built when its acceptance mechanism does not exist yet. That is
  my next unit, not a question for anyone.
- **The standing FE proxy rule is amended on Fern's finding, and he is right:**
  Next bakes `rewrites()` into `.next/routes-manifest.json` at **build** time, so
  for a production build the target must be set **before `npm run build`** —
  confirming before `next start` is already too late. I verified the manifest is
  back to `localhost:8080` and `.env.production.local` is deleted (`ls` shows
  only `.env.example` and `.env.local`). One unauthenticated `GET /api/auth/me`
  reached 8080, nothing was sent and nothing was written; self-reported, correct
  handling, no further action.
- **§9 (Q-FE-17) is free evidence and stays mine.** The artefact hypothesis is
  falsified — same node carries `--input-bd: danger` and paints `rule-strong`.
  Parked item 11 keeps the next probe he named (logical-property longhands:
  `border-block-start-color`, `border-inline-*`). No fix shipped, correctly.
