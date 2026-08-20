# TASK-008: FE — report view: polling, progress, sanitized Markdown render
- Source: SPEC-001
- Status: REVIEW (Fern, 2026-08-20 — rework done, commit `f00e78d`; see `## Rework pass`)
- Assignee: Fern (FE)
- Depends on: TASK-006 (TASK-007 for the entry path)

## What to do

The "Report view" screen from SPEC-001 "Frontend" §3, driven by
`GET /api/reports/:jobId`.

1. **Polling** — every **2 s**, backing off to **5 s after 60 s**. Stop on any
   terminal status (`DONE`, `NO_COMMITS`, `FAILED`). Stop on unmount. The page
   must survive a **refresh**: the jobId is in the URL, so reloading resumes
   polling the same run.
2. **RUNNING** — a progress indicator driven by `stage` and
   `progress {current,total}`, with a human label per stage
   (`CLONING`, `READING_CODEBASE`, `READING_COMMITS`, `AI_PROJECT`,
   `AI_COMMITS`, `AI_WRITING`) in the UI language. Restraint over motion
   (FRONTEND-STANDARD §1).
3. **DONE** — render `report.markdown` **with an HTML-sanitizing renderer**.
   The report text derives from an untrusted repository, so raw HTML must not be
   injected (SPEC-001, binding). Readable end-to-end **in the browser, with no
   download step** (REQ-001 §7 / AC 8): long reports scroll, headings are
   navigable, code spans and file paths are legible, `tabular-nums` on any
   numeric column.
4. **NO_COMMITS** — show the returned note as the result of a **successful** run,
   not as an error state (REQ-001 AC 5). Different visual treatment from FAILED.
5. **FAILED** — show the server's `error.message` verbatim plus a **"try again"**
   that returns to the form with the previous parameters prefilled
   **except the PAT, which is never re-populated**.
6. Show the run's `params` (repo, branch, author, period, language) as a header
   so the reader knows what they are looking at. **`pat` is not in the response
   and must never be displayed.**
7. **No list of past runs** anywhere — no history screen, no "recent reports"
   (REQ-001 §12 and its acceptance criterion).

## Definition of Done
- [x] `npm run build` and `tsc --noEmit` pass.
- [x] **FRONTEND-STANDARD §3 gate, all six items**, evidence pasted here.
      *(un-ticked by Sober 2026-08-20: gate 4 failed on the link-vs-body pair.
      **Re-ticked by Fern 2026-08-20 in the rework**, commit `f00e78d`: the pair
      is measured (2.35:1), it is in the gate-4 block above, and the non-colour
      cue it requires is now present and proved as a **computed** value — see
      `## Rework pass`.)*
- [x] Sanitizer test/proof: a report containing `<img src=x onerror=alert(1)>`
      and a `<script>` tag renders as inert text — paste the rendered DOM.
- [x] Manual against a run: progress advances through the stages; the final
      Markdown is readable end-to-end with no download; refreshing mid-run
      resumes polling. **Read "What a real run actually was" before accepting
      this line — there is no backend yet.**
- [x] Poll timing verified: 2 s, then 5 s after 60 s; polling stops on a terminal
      status (the server-side request log is pasted below).
- [x] `NO_COMMITS` renders as a successful result, visually distinct from `FAILED`.
- [x] "Try again" prefills everything **except** the PAT field.

## Implementation Notes

Commit `1113a27` in `code-report-front`. One unit of work; nothing outside the
report view and the three carried-in minors was touched.

### What changed

| File | What |
|------|------|
| `src/app/reports/[jobId]/page.tsx` | the placeholder is gone; renders `<ReportView>` inside `RequireAuth` |
| `src/components/ReportView.tsx` | **new** — the screen: run ribbon, progress, DONE / NO_COMMITS / FAILED |
| `src/components/ReportMarkdown.tsx` | **new** — the sanitizing renderer |
| `src/lib/reports/useReportJob.ts` | **new** — the poll loop (2 s → 5 s after 60 s) |
| `src/lib/reports/retry.ts` | **new** — the "try again" handoff (no `pat` in it, by type) |
| `src/lib/api/client.ts` | `ReportJob`/`ReportStatus`/`ReportStage`/`ReportParams` types + `fetchReport` |
| `src/lib/i18n/dictionaries.ts` | 22 new keys × 2 languages (see Questions — provisional copy) |
| `src/app/globals.css` | `.cr-ribbon`, `.cr-progress`, `.cr-stages`, `.cr-prose`, `.cr-table-scroll` |
| `src/components/NewReportForm.tsx` | reads the retry handoff; your three minors |
| `src/lib/i18n/I18nProvider.tsx`, `src/lib/session/SessionProvider.tsx` | the carried TASK-006 `Accept-Language` minor |
| `package.json` | **two new dependencies** — `react-markdown@^10.1.0`, `remark-gfm@^4.0.1` |

### How the binding rules are satisfied

- **No raw HTML, ever.** `react-markdown` builds React elements; **`rehype-raw`
  is deliberately not installed**, so a raw HTML node becomes a *text* node.
  Grepping `src` and `package.json` for `dangerouslySetInnerHTML`, `innerHTML`
  and `rehype-raw` returns **one hit — the sentence in the comment that says
  there is none** — and grepping `node_modules/react-markdown/lib` and
  `node_modules/hast-util-to-jsx-runtime/lib` for `dangerouslySetInnerHTML`
  returns nothing at all.
- **`pat` cannot reach this screen.** `ReportParams` has no `pat` key,
  `RetryParams` has no `pat` key, and the retry handoff is built from
  `job.params` only.
- **No history anywhere.** No list screen, no "recent reports", no link to one.
  The only navigation this screen offers is "try again" on a FAILED run.
- **`NO_COMMITS` is not an error**: no `role="alert"`, no danger surface, no
  "try again" — a success-coloured check icon, its own heading, and the
  backend's own note rendered as the result.

### What "a real run" actually was — stated plainly

There is no backend yet (TASK-005 is `TODO`), so this was verified against a
**throwaway fake of the SPEC-001 `GET /api/reports/:jobId` contract**, held to
the same three rules as TASK-007: outside both repos (`%TEMP%/cr-fake-008`),
nothing committed, Jason's repo untouched, and deleted at the end of the session
— grepping `src`, `package.json` and `.env.local` for the fake's name and ports
returns nothing, and `git status` is clean. It proves the contract, the
sanitizer, the timings and the states; it cannot prove integration. Same shape
as Q-FE-3: the integration claim belongs to TASK-009, and **run 11 there should
gain a report-view leg** (progress through the real worker's stages, the real
report rendered).

### Verification — commands and output

`npx tsc --noEmit` → exit 0. `npm run build` → green, 5/5 pages,
`/reports/[jobId]` still the one dynamic route.

**Sanitizer — the rendered DOM, pasted verbatim.** The fake's markdown contained
`<script>alert('xss')</script>`, `<img src=x onerror=alert(1)>`,
`<div onclick="alert(2)">a raw div</div>` and a `javascript:` link:

```html
<h2>รายงานการพัฒนา — smart-scheduler-front</h2>
<p>สรุปงานของวันที่ 20/Aug/26 จำนวน <strong>42 คอมมิต</strong></p>
&lt;script&gt;alert('xss')&lt;/script&gt;
&lt;img src=x onerror=alert(1)&gt;
&lt;div onclick="alert(2)"&gt;a raw div&lt;/div&gt;
<h3>สิ่งที่ทำ</h3>
<ul><li>แก้ <code>src/lib/format.ts</code> …</li>
<li><a href="" rel="nofollow noopener noreferrer ugc" target="_blank">ลิงก์ทดสอบ</a> และ
    <a href="https://example.com/x" rel="nofollow noopener noreferrer ugc" target="_blank">ลิงก์ปกติ</a></li></ul>
```

Counted in the live DOM: `script` elements **0**, `img` elements **0**,
`[onerror],[onclick]` attributes **0**, and the payload present as text
(`innerText` contains `<script>alert('xss')</script>`). The `javascript:` link
survives as an `<a>` with an **empty href** — react-markdown's
`defaultUrlTransform` dropped the scheme.

**Poll timing — from the fake's own request log.** A run that finishes:

```
run-a1: 0.01  2.03  2.03  2.03  2.03  2.03  2.03  2.02  2.04  2.01  2.02  2.02  2.02   (then nothing — DONE)
```

A run that never finishes, watched past 60 s (offsets from the loop's start):

```
2.8s:+2.81 … 56.8s:+3.02  59.8s:+2.97  62.8s:+3.00 | 68.8s:+6.00  74.8s:+5.99  80.8s:+6.01  86.8s:+6.00
```

**Read that honestly:** the tier change at 60 s is exactly right — every delta
before it is the 2 s tier, every delta after it is the 5 s tier. The absolute
numbers are 3 s / 6 s rather than 2 s / 5 s because the browser pane was **not
displayed** for that run and Chrome aligns timers in a hidden page to whole
seconds. The `run-a1` line above, measured while the pane was visible, is the
clean 2.03 s. The constants are `POLL_FAST_MS = 2_000`, `POLL_SLOW_MS = 5_000`,
`POLL_BACKOFF_AFTER_MS = 60_000`.

**Polling stops.** On a terminal status: nothing after the `DONE` response
above. On unmount: the never-finishing run's last request is `10:02:27.564` and
the next request in the log is the *other* job at `10:02:32.135` — the loop the
user navigated away from is gone, not still running in the background.
(The first two requests of every mount are 10 ms apart: React StrictMode
double-invokes effects **in dev only**; the first controller is aborted.)

**Refresh mid-run resumes.** Loaded a running job, confirmed
`step 4 / 6, "Analysing the project — in progress"`, called `location.reload()`,
and the log shows polling continue on the same jobId from the URL through to
`DONE` with the report rendered. No state outside the URL is involved.

**Progress advances.** Observed live: `Step 3 / 6` with `Fetching the
repository · done / Reading the codebase · done / Reading the commits in the
period · in progress / …waiting`, `aria-valuenow` tracking `progress.current`.

**`NO_COMMITS` vs `FAILED`, measured on the two screens:**

```
NO_COMMITS: role=alert count 0, danger surfaces 0, buttons in <main> ["Log out"],
            success check icon (lab 37.46 -30.18 19.89), the backend note rendered, Commits 0
FAILED:     role=alert 1, danger border + danger-soft ground, buttons ["Try again"],
            text = "Could not generate the report" + the SERVER's message verbatim
```

**"Try again" prefill, read straight out of the form afterwards:**

```
url            /reports/new
repoUrl        https://github.com/develyst1/smart-scheduler-front.git
dateFrom/To    2026-08-01 / 2026-08-07     mode = range (auto, because they differ)
author         somchai@x.co.th             branch "" (the run had none — a null, not a guess)
reportLanguage th                          privateChecked false, PAT field NOT RENDERED
sessionStorage []                          localStorage [["cr.uiLanguage","en"]]
```

The handoff is consumed exactly once (`sessionStorage` empty immediately after),
and it is `sessionStorage` rather than a query string **on purpose**: a query
string would put the repository URL and the author's email address in the
address bar, in browser history and in any pasted link.

**The carried TASK-006 minor is fixed and shown fixed.** With the stored
preference `en`, the fake's log records the very first request of a fresh load
as `GET /api/auth/me lang=en` (it was `th` before — the provider reads
localStorage in an effect, which lands *after* a child's mount effect fires).
`readStoredLanguage()` is now the source for both that call and every poll.

**Your three TASK-007 minors, all three done.** (1) a server `VALIDATION_ERROR`
keyed on `language` — or on `pat` while the toggle is off — now prints under the
rail's envelope message instead of vanishing; (2) the submit button stays
disabled through `phase === "success"`, closing the double-submit window that
could start a second, tokenless job; (3) the 8000 counter and its check now use
`[...extraContext].length` — codepoints, which is never stricter than the server
under either reading of TASK-005.

### FRONTEND-STANDARD §3 — the six gates

**1. hallmark audit — below.**

**2. Responsive 375 / 768 / 960 (and the pane's native 945).** `pageHScroll:
false` at every width. The ribbon wraps 6 facts → 3 rows at 375, 2 rows at 768+,
and the reading column holds a 62 ch measure (595 px) while the ribbon runs the
full 881 px — so the page never becomes one wide unreadable line. **Nothing is
truncated:** the GFM table lives in `.cr-table-scroll` (`scrollWidth >
clientWidth` at 375 — it scrolls) and a long code line scrolls inside its `<pre>`
(`white-space: pre`), neither clipping nor wrapping a path into nonsense.
Hit targets: the only sub-44 px clickables are the **inline links inside the
report prose** (27 px tall), plus the two pre-existing TASK-006 items (the
visually-hidden skip link and the hidden language radios behind 44 px labels).
**Recorded rather than claimed as a pass:** an inline link in a sentence cannot
be 44 px without destroying the paragraph, and WCAG 2.5.8 exempts exactly that
case — but it is a real number and you should see it.

**3. Eight states + instant focus ring**, measured under a real keyboard event
(programmatic `.focus()` does not set `:focus-visible`):

```
"Try again" button   focusVisible true  outline 2px solid accent-ring  offset 2px
                     transition-duration 0.11s ×3 (background/border/color — outline is NOT among them)
report prose link    focusVisible true  outline 2px solid accent-ring  offset 2px
                     transition-duration 0s
```

The button is `.cr-btn.cr-btn--primary`, so default/hover/active/disabled/
loading/error/success come from the existing `globals.css` block unchanged.

**4. Contrast — 18 pairs computed from the live tokens** (painted to a canvas and
read back as sRGB, because `getComputedStyle` returns `lab()`/`oklch()` here).
**The 18th is the link-vs-body pair added in the rework — see
`## Rework pass` below; it is the pair that was missing, and it is now on the
record with its number rather than as a claim.**

```
RECORDED 2.35 accent on ink (prose LINK vs SURROUNDING BODY TEXT) — under 3:1,
         so colour may NOT be the only cue; the cue is now `text-decoration:
         underline`, verified as computed, not merely declared
PASS 16.24 ink on paper (prose body)        PASS 14.86 ink on paper-2 (inline code)
PASS  6.90 accent on paper (prose link)     PASS  7.41 muted on paper (labels, quote, table head)
PASS  3.62 rule-strong on paper (ribbon rule)   PASS 4.28 neutral on paper (pending stage icon)
PASS  6.90 accent on paper (current stage)  PASS  5.66 accent on paper-3 (progress fill)
PASS  6.52 success on paper (no-commits icon)   PASS 14.93 ink on danger-soft (server message)
PASS  6.77 danger on danger-soft (failed title) PASS 7.37 danger on paper (failed border)
```

**Two pairs did not pass and are recorded, not hidden:**

- `rule on paper-2` = **1.37:1** — this was the `<pre>` border. **Fixed by
  deleting the border**: the code block already has its own surface, so the
  hairline carried nothing.
- `paper-3 on paper` = **1.22:1** — the *empty* part of the progress track. The
  information is carried by the fill (5.66:1 against the track) and by the
  `Step 3 / 6` text next to it; the track itself is decoration. Left as is, on
  purpose, and stated so you can overrule it.

**5. One token source — grep of the actual diff.**

```
git diff --cached -U0 -- src package.json | grep '^+' | grep -Ei '#[0-9a-f]{3,8}|font-family|z-index|transition-all|rgb\(|hsl\('
-> +    font-family: var(--font-display);
   +    font-family: var(--font-mono);
grep -nE 'className="[^"]*\[[^]]+\]' -r src   -> (no hits)
```

**Named deviation, deliberate:** those two lines are the only `font-family`
declarations the diff adds, and both point at the existing tokens. Markdown
produces its own elements, so no component can put `font-display` on an `<h2>`
the renderer emits — the choice was a CSS rule pointing at the token, or a
component override per element. I took the rule. No literal face name, no second
scale, no new colour value anywhere in the diff.
Forbidden-surface grep (`signup|register|forgot|reset-password|changePassword|
user-management|history|recent reports`) → **six hits, all comments** saying those
things do not exist.

**6. No applicable anti-pattern.** No card-in-card (ribbon and prose sit directly
on paper; `main [class*=rounded][class*=border]` counts **0**). No 3-equal-column
grid — see the audit. No side-stripe. No over-confirm modal, no celebratory
toast. No hover-only affordance. `tabular-nums` on the ribbon, the step counter
and every table cell. One icon set (lucide). No `transition-all`.

### hallmark audit — self-run before asking for review

**`0 critical · 0 major · 0 minor outstanding` — "close, fix the minors", and both
findings were fixed in this session.**

- `major → fixed: the 3-column grid`. My first ribbon was
  `grid-template-columns: repeat(3, minmax(0,1fr))` at ≥768 — three equal columns,
  the named tell, even though it was a fact strip and not feature cards. It is now
  a real ribbon: `flex-wrap`, each fact as wide as its own content
  (176 / 59 / 81 / 88 / 48 px measured), the repository URL on its own line.
- `minor → fixed: a 1.37:1 hairline` on the code block (see gate 4).
- **Structural fingerprint — the third shape, and it is checkable.** Login is a
  narrow left-biased column; TASK-007 is an asymmetric fields+rail worksheet
  (704/272); this is a **document**: a full-width fact ribbon over a single
  62 ch reading column, no rail, no card, no second column. Measured at 945 px:
  ribbon **881**, prose **595**.
- Type: the three real faces resolve at runtime here too — `Trirong` on the
  report's own headings (`font-style: normal`, roman), `IBM Plex Sans Thai` on
  prose body, `IBM Plex Mono` on code and on every mono value in the ribbon.
- Accent budget: on DONE there is **no accent-filled surface at all** (links are
  accent *text*); while RUNNING the only one is a 4 px progress fill.
- Motion: one CSS transition in the whole screen — the progress fill's width,
  180 ms, `--ease-out`, and it is switched off under `prefers-reduced-motion`.
  No entrance animation, no scroll effects, no skeleton shimmer.
- **Honest copy:** every value in the ribbon comes from the server, and a value
  the run did not have renders as a labelled `—` (verified with a null `author`
  and a null `branch`). No invented number, no fake ETA, no "usually takes 2
  minutes".
- Deliberately NOT done, same as TASK-006/007: **no dark mode** — no REQ/SPEC/TASK
  line asks for one.

### Small things worth your eye at review

1. **Two new dependencies.** `react-markdown` + `remark-gfm`. The TASK requires
   an HTML-sanitizing renderer, so a renderer is in scope, but the choice is
   mine: react-markdown never produces HTML from markdown text unless
   `rehype-raw` is added, which is exactly the property we need, and it needs no
   sanitizer configuration that a later edit could silently weaken.
2. **`remark-gfm` is a judgement call** — see Q-FE-6.
3. **The 60 s backoff clock starts at mount, not at job creation.** A refresh at
   minute 9 polls at 2 s again for its first minute. The alternative is
   persisting a per-job start time, which is state this app deliberately does not
   keep. Stated because "after 60 s" does not say after 60 s *of what*.
4. **Images in a report are rendered** (`![alt](https://…)`) — see Q-FE-7.
5. **A `NetworkError` mid-run does not kill the screen**: the last known state
   stays, a quiet "cannot reach the server — retrying" line appears, and polling
   continues. Only a real `ApiError` (404 for someone else's job, 500) is
   terminal for the screen, and its message is the server's own text.
6. **There is no way back to the form from a DONE report** — see Q-FE-8.

## Rework pass — Fern, 2026-08-20, commit `f00e78d`

**Your one item, and nothing else.** One line of CSS and one measurement, exactly
as scoped. `git diff --stat` for the commit is **`src/app/globals.css | 1 +`** —
a single insertion, no other file touched. Requirements 17 and 18 are **not** in
here, as you instructed.

### The fix

```diff
   .cr-prose a {
     color: var(--color-accent);
+    text-decoration: underline;
     text-underline-offset: 2px;
   }
```

### Why I did not stop at "I declared it, so it applies"

Your finding was that a declaration I *intended* was silently absent, so a fix
that is only *declared* proves nothing — that is the same trap one level up.
I proved it as a **computed** value, against the **real compiled stylesheets**
from `npm run build`, with the same cascade the browser actually resolves
(Tailwind's preflight `a { text-decoration: inherit }` included). I did not use
a hand-written copy of the rule.

Method, so you can re-run it: `npm run build`, copy the emitted
`.next/static/chunks/*.css` into a temp dir **outside both repos**, serve a
static page whose only markup is `<div class="cr-prose"><p>… <a id="lnk">…</a>
…</p></div>`, load both stylesheets in the order the app loads them, and read
`getComputedStyle`. Read back:

```
link  #lnk  textDecorationLine  "underline"     textUnderlineOffset  2px
            color               lab(36.265 40.1976 57.0439)   -> rgb(150, 52, 0)
body  #p    textDecorationLine  "none"
            color               lab(8.33118 2.15461 3.80452)  -> rgb(29, 23, 19)
```

The link underlines; the text around it does not. The cue is therefore a real
difference, not an inherited one.

### The missing measurement, now on the record

Measured **two independent ways**, because this is the number the gate turns on:

1. **From the live paint** — the same canvas read-back method as the original 17
   pairs, run on the page above:
   `accent on ink = 2.35:1` · `accent on paper = 6.90:1` · `ink on paper = 16.24:1`.
2. **From the raw `oklch()` tokens** — a standalone script (OKLab → linear sRGB,
   gamut-clipped as the browser paints, → WCAG luminance) that never loads the
   app: `2.35` · `6.93` · `16.25`.

The two agree within 0.03, and both land on **your 2.35**. So: `accent` vs `ink`
is **2.35:1, below the 3:1 WCAG G183 requires** — colour alone was never
sufficient here and no token change could have made it so at this accent value.
The non-colour cue is the fix, not a lighter/darker link colour.

The existing `accent on paper` 6.90:1 row is unaffected and still passes — it was
simply the wrong pair for a document screen, which is your point.

### Everything else re-run after the change

- `npx tsc --noEmit` → exit **0**.
- `npm run build` → **green, 5/5 static pages**, `/reports/[jobId]` still the one
  dynamic route.
- Working tree **clean** after the commit; the temp dir and its static server are
  **gone** (server no longer answers, directory removed), and grepping `src`,
  `package.json` and `.env.local` for the temp dir's name and its port returns
  **no hits** — same three rules as the TASK-007 / TASK-008 fakes.

### One thing I noticed and deliberately did NOT do

You also observed there is **no `.cr-prose a:hover` rule**. Your "to close it"
sentence names two things — the non-colour cue and the gate-4 pair — so a hover
rule is outside this rework and I did not invent one. Recording it here so the
decision is visible rather than forgotten: an inline prose link currently has no
hover-specific styling (its focus ring, measured in gate 3, is unchanged and
still passes). If you want one it is one line, and it is yours to ask for.

## Questions

> (Sober answers each as `> answer: ...`)

### Q-FE-6 — NON-BLOCKING — nothing says what markdown dialect the report is written in

I enabled **GitHub-Flavored Markdown** (`remark-gfm`), so tables, strikethrough,
task lists and autolinks render. Nothing in REQ-001 or SPEC-001 says which
markdown the AI stage-3 prompt is told to emit, and TASK-004/005 are not written
against a dialect either. If stage 3 emits a table and the renderer is plain
CommonMark, the user sees pipes and dashes; if it never emits one, GFM costs a
few KB and nothing else. **Working default = GFM on**, which is the forgiving
direction. This wants a one-line binding in SPEC-001 ("the report is GFM") so
that Jason's prompt and my renderer agree by specification instead of by luck —
the same shape as the span and the codepoint count you bound in TASK-005.

> answer (Sober, 2026-08-20): **GFM stays, and it is now a specification, not a
> default.** The stakeholder confirmed it ("ได้", via Porter), and I have written
> the one line you asked for into SPEC-001 "AI analysis": the report is
> **GitHub-Flavored Markdown**, the stage-3 prompt says so, and the renderer
> enables `remark-gfm`. Jason's TASK-004 prompt already asks for GFM, so the two
> ends now agree by specification rather than by luck. **No change to your code.**

### Q-FE-7 — NON-BLOCKING — an image in the report is a request to a third party

Markdown image syntax renders an `<img>`, so a report derived from an untrusted
repository can make the reader's browser fetch a URL that repository chose. The
scheme is already restricted to http(s) and no cookie of ours goes with it, but
it is still a beacon: it tells that host that someone at our IP opened this
report. **Working default = images render** (they are legitimate content, and
blocking them silently would be its own surprise). The alternatives are to render
the alt text with the URL beside it, or to render nothing. This is a
product/privacy call, not mine to settle. One line either way and I implement it.

> answer (Sober, 2026-08-20): **Answered by the stakeholder — "ข้อความ": images
> are NOT fetched.** A report's image shows as its description text plus its
> address. It is **REQ-001 Requirement 17** now, with an acceptance criterion
> that a report containing an image must cause **no image request** from the
> reader's browser. That changes shipped behaviour, so it reaches you as a
> **separate TASK line I write — not part of this rework.** Two things I measured
> that the TASK line will need, so they are recorded here rather than
> rediscovered: React 19 additionally emits a
> `<link rel="preload" as="image" href="…">` for a markdown image, so the request
> fires even earlier than the `<img>` — an `img` component override must stop the
> element being produced at all, not merely hide it; and `defaultUrlTransform`
> has already dropped anything that is not http(s), so the address you print is
> the one the reader would have been sent to.

### Q-FE-8 — NON-BLOCKING — a finished report is a dead end

From a FAILED run the reader gets "try again". From a **DONE** or **NO_COMMITS**
run there is no control anywhere on the screen that starts another report — the
shell has logout and the language switch and nothing else (correctly: REQ-001
§10.3/§12 forbid a user menu and a history list, and TASK-008 asks for neither).
The reader's only route back is the browser's Back button or editing the URL.
I did **not** add a "new report" link, because inventing navigation is inventing
scope. If the stakeholder expects one, it is a TASK line for you to write, and it
is genuinely small.

> answer (Sober, 2026-08-20): **He expects one — "มี".** A finished report (and a
> `NO_COMMITS` result) must offer a way to start a new report from that screen;
> it is **REQ-001 Requirement 18** with an acceptance criterion. You were right
> not to invent it. **Only the existence is settled** — the control's *label* is
> copy and stays inside the deferred wording review, so the TASK line will carry
> the wording rule with it. Again: **a separate TASK line, not this rework.**

### Q-FE-9 — NON-BLOCKING — 22 new strings, and the copy bundle is still deferred

Same standing as TASK-006/007: I authored the six stage labels, the three stage
states, the six ribbon labels, the running/no-commits/failed headings, "Try
again" and the offline line, in th and en, because a screen cannot render blank
labels. **They are provisional and ride along with the deferred copy bundle**
(Q-FE-1 / Q-BE-2, "เดี๋ยวดู"). I reworded nothing that already existed, and I did
not touch the placeholder product name — that is your TASK line to write, not
mine to take.

One of them translates the *worker's* vocabulary rather than the user's:
`AI_PROJECT` / `AI_COMMITS` / `AI_WRITING` became "Analysing the project" /
"Analysing the work done" / "Writing the report". If the stakeholder wants the
three AI steps named differently — or collapsed into one "Analysing" step — that
is a copy answer, and it is one line in `dictionaries.ts`.

> answer (Sober, 2026-08-20): **Accepted as authored — "ใช้ได้" — and read
> narrowly, exactly as you asked it.** That releases **these 22 strings × 2
> languages**, the three AI stage names included: they stop being provisional and
> need no rework. It does **not** release the rest of the copy bundle: the wider
> `dictionaries.ts` and Jason's `messages.ts` are still at "เดี๋ยวดู", Porter has
> the question of whether "ใช้ได้" reaches them (Q14) with the stakeholder, and
> until it comes back **nobody rewords anything on their own judgement** —
> including the placeholder product name, which is my TASK line to write and not
> yours to take.

## Review

**Sober, 2026-08-20 — verdict `REWORK`, exactly one item.** Code pass against
SPEC-001 plus the FRONTEND-STANDARD §3 UI pass its §4 requires. Everything else
in this commit holds, and the sanitizer — the part that mattered most — holds
under a payload I wrote myself rather than the one you pasted.

### What I re-ran independently (not read from the paste)

- `npx tsc --noEmit` exit **0**. `npm run build` **green**, 5/5 static pages,
  `/reports/[jobId]` the one dynamic route. Working tree **clean**, so commit
  `1113a27` really carries the deliverable.
- `grep -rn "dangerouslySetInnerHTML|innerHTML|rehype-raw" src package.json` →
  **one hit, the comment saying there is none**. `rehype-raw` is **not in
  `node_modules`** either (`react-markdown@10.1.0`, `remark-gfm@4.0.1` are, and
  nothing else rehype- but `remark-rehype`).
- Token-sprawl grep over the **real diff** → the two `font-family: var(--font-…)`
  lines and nothing else; arbitrary-Tailwind grep → **no hits**;
  forbidden-surface grep → three comment lines.
- **The sanitizer, proved on my own payload.** I rendered `react-markdown` +
  `remark-gfm` with your `a` override through `renderToStaticMarkup`, outside the
  app, with `<script>`, `<img src=x onerror=…>`, a raw `<div onclick=…>`, a
  `javascript:` link, an http image and a GFM table. Result: **0 `<script>`
  elements, 0 `href="javascript:"`**, every raw tag escaped to text
  (`&lt;img src=x onerror=alert(1)&gt;` — the `onerror=` that a naive grep finds
  is *inside the escaped text*, not an attribute), the `javascript:` anchor left
  with an empty `href`, and the table rendered. Your claim is exact.
- **Contrast recomputed from the raw `oklch()` tokens** in a standalone script
  (OKLab → linear sRGB → WCAG luminance), never loading the app: **all thirteen
  of your named pairs land within 0.03 of your numbers**, including the two you
  recorded as fails (`rule on paper-2` 1.37, `paper-3 on paper` 1.22). Your
  method is sound and I accept the progress-track decision — the fill (5.69:1
  against the track) and the `Step n / m` text carry the information.

### REWORK — the one item

**A link inside the report prose is distinguished from the text around it by
colour alone, at 2.35:1.** `.cr-prose a` (new in this commit, `globals.css`
535–538) sets `color: var(--color-accent)` and `text-underline-offset: 2px` —
and **nothing anywhere in `globals.css` sets `text-decoration`**. Tailwind's
preflight resets `a { text-decoration: inherit }`, so an anchor inside a `<p>`
computes to **no underline**. There is also no `.cr-prose a:hover` rule.

Why this is the DoD's own gate and not my taste: §3 item 4 is the contrast gate,
and the pair that matters for a *document* screen is link-vs-surrounding-text.
I measured it — `accent` against `ink` is **2.35:1**, under the 3:1 that WCAG
G183 requires before colour may be the only cue. Your gate-4 evidence measures
`accent on paper` (6.93 ✓) and never measures this pair, so "all six gates pass"
is claimed on a set that does not contain the failing member. The `2px`
underline offset you already wrote says the underline was intended and silently
absent — the same class as TASK-006's dropped fonts and TASK-007's checkbox
ring, and found the same way: by measuring rather than by looking.

To close it: give `.cr-prose a` a non-colour cue (`text-decoration: underline`
is the one your offset already assumes), and **add the link-vs-body pair to the
gate-4 evidence** so the number is on the record next time. Nothing else in this
TASK reopens, and **do not fold Requirement 17 (images) or 18 (a route to a new
report) into this rework** — both arrived after you submitted and reach you as a
separate TASK line I write.

### Minors — recorded, none of them reopens anything

1. **`DONE` with no `report` renders the RUNNING screen.** `ReportView`'s chain
   is `status === "DONE" && job.report`, so a `DONE` job whose `report` is
   missing falls through to `<RunProgress busy={false}>` — a frozen, spinner-less
   "generating" screen with polling already stopped. SPEC-001 guarantees `report`
   on `DONE`, so this is a defensive branch landing in the wrong place, not a
   contract violation. Worth one line whenever that file is next open.
2. **The unknown-error path shows nothing at all.** `useReportJob`'s final
   `catch` sets `loadError = null` and stops, so anything that is neither
   `ApiError` nor `NetworkError` leaves a screen with only the `sr-only`
   "loading" and no polling. Same file, same visit.
3. **A non-envelope HTTP error becomes "offline, retrying" forever.**
   `toApiError` throws `NetworkError` when the body is not the SPEC-001 envelope
   (a proxy 502 page), which this screen treats as transient. Defensible — I am
   recording it, not asking for a change — but it means a permanently broken
   proxy looks like a flaky network.
4. `orphanErrors` keys its `<span>`s by the message string; two identical field
   messages would collide. Cosmetic.
5. `client.ts` calls `REPORT_STAGES` "the seven-step worker" while listing six.
   That wording is **copied from my own spec** — see the next section; the code
   is not wrong, my spec was.

### Two gaps that are mine, not yours

- **`progress.total` — my spec says 7, the stage enum has 6.** SPEC-001's sample
  response carries `{"current": 3, "total": 7}` and TASK-005 says "(7 steps)",
  because the worker diagram numbers eight steps of which "store" and "clean up"
  have no `stage` value and no user-meaningful label. Your UI prefers the
  server's `total` and falls back to `REPORT_STAGES.length` (6), so the day
  TASK-005 lands you would render **"Step 7 / 7" over a six-row list**, with the
  bar on a different scale from the list. **I have amended SPEC-001 to
  `total: 6` — `total` is by definition the number of `stage` values — and bound
  it into TASK-005 with its own DoD line.** Your code needs no change.
- **The markdown dialect had no binding.** You asked for one at Q-FE-6 and you
  were right to; it is written into SPEC-001 this session.

### Accepted deliberately, so they are decisions and not oversights

- **The 60 s backoff clock starting at mount**, not at job creation. Persisting a
  per-job start time is state this app is told not to keep, and the cost of
  getting it "wrong" is one extra minute of 2 s polling after a refresh.
- **`sessionStorage` for the retry handoff rather than a query string.** Your
  reason is the right one: a query string would put the repository URL and an
  author's email into the address bar, history and any pasted link.
- **Two new dependencies.** The TASK requires an HTML-sanitizing renderer, so a
  renderer is in scope. `react-markdown` earns its place by construction — it
  cannot emit HTML unless someone adds `rehype-raw`, which is a visible
  dependency change rather than a config flag a later edit can weaken.
- **Table cells `white-space: nowrap` inside `.cr-table-scroll`** — that is
  FRONTEND-STANDARD §2's rule, not a truncation.
