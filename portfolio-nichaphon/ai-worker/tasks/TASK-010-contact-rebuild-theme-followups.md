# TASK-010: Contact rebuild + the three theme follow-ups

- Source: SPEC-002
- Status: **DONE** (Sober 2026-09-04, round 2 — all three returned items landed
  and nothing else moved; theme diff re-verified as four hunks, `tsc` and both
  greps re-run by me. Four boxes stay UNVERIFIED on purpose and are carried into
  TASK-011 §7. See §Review → "Round 2 review". Previous: REVIEW, Fern 2026-09-04)
- Owner: — (closed)
- Depends on: TASK-007 (DONE). Independent of TASK-008 and TASK-009 by file, but
  read TASK-008 section 0 first: **its label recipe and card recipe bind this
  task too.** This is the **only** task in SPEC-002 that may edit `theme.ts`.
- Repo: `portfolio-nichaphon-web`, everything under `front/`

One route (`/contact`) plus the three theme follow-ups I carried out of the
TASK-006 review (FQ14, FQ17, FQ18). They are one task because all three land on
controls that only `/contact` renders, so they are measurable in the same pass.

---

## 0. Binding rules

All of **TASK-008 section 0** applies unchanged — with one exception stated
there: `theme.ts` **is** in scope here, and only here.

**No text is added to `/contact`.** It carries no quote (SPEC-002 Quotes). Its
`innerText` must come out byte-identical to HEAD.

**`--site-ink-faint` is never used for text on glass** (standing SA rule, added
2026-09-03 from TASK-008 FQ25 — it measures **4.23:1** on a `GlassPanel`, under
the 4.5 bar). Where a surface you convert to `GlassPanel` contains an element
reading `--site-ink-faint`, swap that one call site to `--mantine-color-dimmed`
in the route's own CSS module. Call sites in this task's scope:
`ContactChannels.module.css:53`, `ContactForm.module.css:17`. **This rule does
not license editing the token itself** — `--site-ink-faint` lives in
`cssVariablesResolver`, which section 2's bounds still put out of scope, and
re-mixing it would move five call sites at once. The token-level question is
recorded in TASK-011, not decided here.

**`ContactForm`'s behaviour is frozen.** The `mailto:` handoff at
`ContactForm.tsx:36`, the three states (`idle` / `success` / `error`), the
`required` attributes, `autoComplete`, `noValidate={false}`, every `FORM_COPY`
string and the two inline `Alert` `title` strings stay exactly as they are. This
task changes how the form **looks**, never what it does.

---

## 1. Contact — `components/partials/Contact/`

**C1. `ContactContent.tsx` — the opening block.** Replace the
`PageSection density="tight"` + `SectionHeading order={1}` pair with

```tsx
<RouteHero
  eyebrow={CONTACT_INTRO.eyebrow}
  title={CONTACT_INTRO.title}
  lead={CONTACT_INTRO.lead}
/>
```

and move `<ContactForm />` into its own `<PageSection density="tight">` directly
below — same call and same reason as TASK-008 B1 (a tall child inside
`RouteHero` stretches the aurora box and breaks the shared opening shape).
`ContactForm.module.css .form`'s `margin-top: 40px` becomes double spacing once
it has its own section — delete it.

**C2. `ContactChannels` — retire the 1px grid and the micro-label.**

- `.grid`: delete `gap: 1px`, `background-color: var(--site-hairline)` and the
  `border`. Use `gap: var(--mantine-spacing-lg)`. The 3-column template at
  `min-width: 48em` stays.
- `.item` becomes `GlassPanel as="div"` — `div` is valid inside `<dl>` and is
  already what the markup uses, so the `dl` / `dt` / `dd` semantics survive
  untouched. Delete `.item`'s `padding` and `background-color`.
- `.label` (the `<dt>`, `ContactChannels.module.css:20-28`) takes the **label
  recipe** — it is a retired uppercase-mono micro-label.
- `.value`, `.link` (44px-ish hit area) and `.note` are unchanged.

**C3. `ContactFaq`.** Remove `variant="default"` from the `Accordion` at
`ContactFaq.tsx:20`. Nothing else in that file changes — the item surface, the
edge, the radius, the gap and the chevron colour all come from the theme skin
TASK-006 already shipped, and the flat-alias imports stay (the compound
properties resolve to `undefined` in a server component; that comment is still
true).

**C4. `ContactForm` — no markup change.** It inherits the `TextInput` /
`Textarea` / `Alert` skins from the theme. Do not add a CSS module rule for a
control look; if a field looks wrong, the fix is in `theme.ts`, and it is a
stop-and-ask if it is not one of T1-T3 below.

---

## 2. The three theme follow-ups — `src/theme/theme.ts` only

These were raised by you as FQ14 / FQ17 / FQ18 at TASK-006 and I carried them
here rather than letting them be guessed. All three are in the `components`
block. **No route CSS module may implement any of them.**

**T1 (FQ14) — the success Alert reads as one hue.** Today the ground is
`--site-accent-wash` (violet) while `color="green"` still drives
`--alert-color`, so the icon and the title render green on a violet wash. Point
`--alert-color` at the accent for the non-red case, so the control is one hue:

```ts
'--alert-color': 'var(--mantine-color-anchor)',
```

alongside the existing `--alert-bg` in the same branch. `IconCircleCheck` inherits
it. **The red error alert keeps red ink and its own light-red fill — do not
touch that branch.** Measure the title and the body text against the rendered
wash on the running page; **under 4.5:1 is a stop-and-ask, not a nudge to the
token.**

**T2 (FQ17) — key the wash on a positive discriminator.** The `Alert.vars`
function currently branches on `props.color === 'red'` and gives the accent wash
to *everything else*, so a future `color="yellow"` or `color="blue"` alert would
silently come out violet. Invert it: the accent branch applies when
`props.color === 'green'`; every other colour (including `undefined` and red)
gets the radius only and keeps Mantine's own fill. Only `green` and `red` are
rendered on this site today (`ContactForm.tsx:83, 94`), so this changes no
current pixel — verify that it does not.

**T3 (FQ18) — the accordion control's hover/focus ground reads a token.**
Mantine's default control hover is the opaque `--mantine-color-dark-6`, which
punches a flat grey hole in a glass item. Add to the `Accordion` `styles` block:

```ts
control: { '&:hover': { background: 'var(--site-accent-wash)' } },
```

(use whatever the Mantine 8 `styles` API accepts for that state in this repo —
if a nested selector is not supported there, say so rather than reaching for a
CSS module or `!important`). Keyboard focus must still show the global focus
ring from `globals.css`, unchanged. **No new hex.** Measure the control label
against the hover ground; under 4.5:1 is a stop-and-ask.

**Bounds on this section:** `Button`, `Drawer`, `Modal`, `TextInput`, `Textarea`,
the palette, the `headings` scale, `spacing`, `radius` and **every**
`cssVariablesResolver` value (both blocks — especially `--site-grid-line`) are
out of scope. `git diff theme.ts` must show only the `Alert` and `Accordion`
`components` entries.

---

## 3. Measuring T1 — read this before you try

The success and error alerts only render **after a submit**, and submitting sets
`window.location.href` to a `mailto:` URL (`ContactForm.tsx:36`). That may
navigate the page away, hand the run to an OS mail client, or do nothing,
depending on the environment.

- Try it locally. If you get the alert rendered, measure it on the page and say
  how you got it there.
- If you cannot render it safely, **report the computed colours and the computed
  contrast, and declare the rendered check UNVERIFIED** — in those words, the
  same position TASK-004 took on reduced motion. Do not tick a rendered-look box
  from a computed value, and do not edit the component to make it easier to test.

---

## 4. Measurements to report (SQ8 + the ceiling)

1. **Opening-block height** of `/contact` at **1280x800** and **360x740**. This
   is the fifth and last of SQ8's numbers.
2. **Contrast:** the label recipe on `--site-glass-bg` (channels `dt`), the
   channel value and link, the accordion control label at rest and on the new
   hover ground (T3), the success alert title and body (T1, subject to
   section 3), the input label / placeholder / typed value on
   `--site-surface`. 4.5:1 body, 3:1 large.
3. **The 0.046 ceiling.** `/contact` gets its first `RouteHero`. Re-run the
   D1-on vs D1-removed comparison from TASK-007 §Third pass at
   **1217 / 1280 / 360**. Predicted: **D1 contributes exactly 0**. If not, stop
   and ask.

---

## Definition of Done

Run from `front/`. Paste the actual output.

- [x] `npx tsc --noEmit` exits 0.
- [x] `npm run build` exits 0 with **no warning line**; `.next` deleted afterwards.
- [x] `npm run dev`; `/contact` loads with an **empty** console at 1280x800 and
      360x740.
- [x] The other five routes still load with an empty console — the `theme.ts`
      edits reach every route, so this check is load-bearing, not a formality.
- [x] **R6 Home non-regression:** `/`'s `<body>` element list byte-identical to
      HEAD at both viewports, **and** `/`'s rendered appearance is unaffected by
      T1/T2/T3 (no `Alert` and no `Accordion` renders on Home — confirm by grep,
      not by eye).
- [x] **R4 text check** — byte-identical apart from the 3 label-recipe casing
      tokens (FQ31 answered: accepted, R4 met in kind). Comparison in §Notes.
- [ ] **Form behaviour unchanged:** the three fields accept input, `required`
      still blocks an empty submit, the submit button shows the loading label,
      and the `mailto:` URL built from a filled form is byte-identical to the one
      HEAD builds (compare the encoded string, not the mail client's window).
- [x] **T3 (FQ32 answer, mechanism (a)):** scoping lands on the `Accordion`
      `vars` root; both `getComputedStyle` reads pasted (control
      `rgba(164,136,255,0.10)` / `documentElement` still `#2c2640`); control
      label over the composited hover ground = **14.42:1**. The rendered hover
      look stays **UNVERIFIED** (FQ35).
- [x] **T4 (FQ34 answer, SA-added):** `--input-placeholder-color` =
      `var(--mantine-color-dimmed)` on both `TextInput` and `Textarea`; row H
      re-measured = **7.61:1** (was 4.28), bar 4.5.
- [x] **FQ33:** only the parenthetical clause changed; no other line of that
      comment block moved.
- [ ] **Accordion still works:** each FAQ item opens and closes, by mouse and by
      keyboard, and the focus ring is visible. (This is an `Accordion`, not a
      `Modal` — SQ7 does not apply to it. If it also fails to open, that is a new
      finding: report it, do not fix it.)
- [x] **Retired-pattern grep returns nothing** (exit 1):
      `grep -rn "gap: 1px\|text-transform: uppercase\|radius-xs\|variant=\"default\"" src/components/partials/Contact`
- [x] `/contact` heading outline unchanged and skip-free; `dl` / `dt` / `dd`
      structure, `aria-labelledby` pairs and tab order preserved.
- [x] No horizontal scroll at 360px.
- [x] Opening-block height (4.1), contrast table (4.2) and the D1-contributes-0
      table (4.3) reported.
- [x] `git diff theme.ts` shows **only** the `Alert` and `Accordion` entries of
      the `components` block **plus the two input `wrapper` vars added by T4** —
      no resolver value, no palette, no other widget. Re-verified after T3 + T4;
      the full diff is pasted in §Notes "Rework round 2".
- [x] `git diff --stat` otherwise touches only
      `src/components/partials/Contact/`.
- [x] `grep -rn "use client" src/components src/app` output is **byte-identical
      to HEAD's** (corrected by Sober 2026-09-03, FQ27: the real repo returns 11
      lines, not four — identity to HEAD is the check, never a count).
- [x] **No git write, no branch, no commit, no deploy, no `pm2`, no ssh.**
- [x] Unticked on purpose and named as such: the T1 rendered check if section 3
      forced it to stay computed-only.

## Implementation Notes

Filled by Fern 2026-09-04. Baseline `HEAD=46aef59` on `develop`. Dev server on
**3010** (3000 held by a foreign process), stopped afterwards. No git write, no
commit, no branch, no deploy, no `pm2`, no ssh. **No real /contact submit was
fired** — see section 3 / UNVERIFIED below.

### Files changed — 6, and only these

| File | What |
|---|---|
| `Contact/ContactContent.tsx` | C1 — `RouteHero`, `ContactForm` moved into its own `PageSection density="tight"`; `SectionHeading` import dropped (now unused) |
| `Contact/ContactForm.module.css` | C1 — `.form` `margin-top: 40px` deleted; §0 — `.note` `--site-ink-faint` → `--mantine-color-dimmed` |
| `Contact/ContactChannels.tsx` | C2 — `.item` div → `GlassPanel as="div"` |
| `Contact/ContactChannels.module.css` | C2 — `gap: 1px` / hairline bg / border → `gap: var(--mantine-spacing-lg)`; `.item` rule deleted; `.label` → label recipe; §0 — `.note` → `--mantine-color-dimmed` |
| `Contact/ContactFaq.tsx` | C3 — `variant="default"` removed |
| `theme/theme.ts` | Round 1: T1 + T2 (`Alert` entry). Round 2: **T3** (`Accordion` `vars`), **T4** (both input `wrapper` vars), **FQ33** comment clause |

*(Round 1 state, superseded by "Rework round 2" below:)*
`git diff -- front/src/theme/theme.ts` touches only the `Alert` entry of the
`components` block: no resolver value, no palette, no other widget, and the
`Accordion` entry is byte-identical to HEAD. `git diff --stat` otherwise touches
only `src/components/partials/Contact/`. The other 13 modified files in the tree
are TASK-008's one CSS line + TASK-009's twelve — not touched by me.

Nothing was added to `components/ui/`, no hover was invented on the channel
panels (they had none at HEAD, so the GlassPanel hover recipe was not needed),
no new hex, no `!important`, no new `"use client"`, no new dependency.

### Evidence

```
$ npx tsc --noEmit                  -> exit 0
$ npm run build                     -> exit 0, "Compiled successfully in 14.6s",
                                       10/10 static pages, NO warning line; .next deleted after
$ grep -rn "gap: 1px|text-transform: uppercase|radius-xs|variant=default" \
        src/components/partials/Contact       (the DoD's alternation, verbatim)
                                    -> exit 1 (no output)
$ grep -rn "use client" src/components src/app   vs   git grep at HEAD
                                    -> 11 lines both sides, diff empty = BYTE-IDENTICAL TO HEAD
```

**Console — six routes, fresh tab, dev:** `/` `/about` `/services` `/portfolio`
`/blog` `/contact` at **1280x800** and at **360x740** = **zero errors, zero
warnings** (only Next's `[Fast Refresh]` logs and the React DevTools `info`
line). The `theme.ts` edit reaches every route, so this was run on all six.

**R6 Home non-regression — PASS.** `/`'s `<body>` element list (tag + class, 170
elements) is **byte-identical to HEAD** at both viewports —
`sha256 79c1b674f7dd87627f687422bde1f4349dd6e61b3665b362958c83bc2d28665e` before
and after the change, at 1280 and at 360; `innerText` unchanged too. And by
grep, **the whole site has 2 `<Alert>` and 1 `<Accordion>`, all three inside
`partials/Contact/`** — so T1/T2 cannot reach Home or any other route. The live
DOM agrees: 0 Alert nodes, 0 Accordion nodes on `/`.

**R4 text check — NOT byte-identical. 3 tokens change case. See FQ31.**
Length is identical (867 chars at 1280, 794 at 360, before and after) and no
string is added, removed, translated or reordered; the source strings in
`constant/content/contact.ts` are untouched. The whole delta is:

```
- EMAIL / PHONE / LOCATION
+ Email / Phone / Location
```

`innerText` reports `text-transform`, so retiring the uppercase micro-label per
C2's label recipe necessarily moves these three `<dt>`s back to their source
casing. This box is **left unticked** pending FQ31.

**Form behaviour — 3 of 4 verified, 1 UNVERIFIED.**

- Fields accept input: all three round-trip through React state
  (`QA Fixture` / `qa.fixture@example.com` / a two-line message), then cleared
  again — nothing was left sitting in the form.
- `required` blocks an empty submit: I asserted `form.checkValidity() === false`
  and `valueMissing === true` on all three fields **first**, which makes the
  click provably unable to reach `handleSubmit`; then fired a **real trusted
  click** on *Send message* — 0 Alerts rendered, still on `/contact`, button
  label unchanged.
- `mailto:` string: `ContactForm.tsx` is **0 diff lines from HEAD**, so the
  builder is the same source bytes. Evaluating the same expression
  (`ContactForm.tsx:31-35`) against a filled form, without assigning it to
  `location`, yields
  `mailto:nichaphon.s@hotmail.com?subject=New%20contact%20from%20QA%20Fixture&body=Name%3A%20QA%20Fixture%0AEmail%3A%20qa.fixture%40example.com%0A%0AMessage%3A%0ALine%20one%0ALine%20two`.
- **UNVERIFIED: the submit button's loading label.** Only reachable through a
  real valid submit, which sets `window.location.href` to that `mailto:` and
  would launch the owner's mail client. Not fired.

**Structure.** `/contact` outline `H1 H2 H2` — skip-free, same as HEAD. One
`<dl>` with 3 `<dt>` + 3 `<dd>`, direct children still `DIV,DIV,DIV` (GlassPanel
renders the same `div`, so the `dl`/`dt`/`dd` semantics survive). Both
`aria-labelledby` section pairs resolve, and all four accordion control/region
pairs resolve. Tab order unchanged. **No horizontal scroll at 360px**
(`scrollWidth 360 === clientWidth 360`); none at 1280 either.

### 4.1 Opening-block height (SQ8's fifth and last number)

| Viewport | `/contact` `.hero` height |
|---|---|
| 1280 x 800 | **742.59 px** |
| 360 x 740 | **371.52 px** |
| (1217, from the D1 pass) | 734.78 px |

### 4.2 Contrast

Sampler validated first against your published number: `--site-ink-faint` on
`--site-glass-bg` over the page ground returns **4.23** — exactly TASK-008 FQ25.

| # | Pair | fg | bg | size/weight | ratio | bar |
|---|---|---|---|---|---|---|
| A | channels `dt`, label recipe, on glass | `rgb(169,163,186)` | `rgb(31,25,51)` | 13px/600 | **6.95** | 4.5 ✅ |
| B | channels `.value` on glass | `rgb(236,234,242)` | `rgb(31,25,51)` | 16px/500 | **14.17** | 4.5 ✅ |
| C | channels `.link` on glass | `rgb(164,136,255)` | `rgb(31,25,51)` | 16px/500 | **6.07** | 4.5 ✅ |
| D | channels `.note` on glass (swapped off ink-faint) | `rgb(169,163,186)` | `rgb(31,25,51)` | 13px/400 | **6.95** | 4.5 ✅ |
| E | accordion control label, at rest | `rgb(245,243,251)` | `rgb(22,18,40)` | 16px/400 | **16.62** | 4.5 ✅ |
| F | accordion control label, on **today's** hover ground `--mantine-color-dark-6` `#2c2640` | `rgb(245,243,251)` | `rgb(44,38,64)` | 16px/400 | **13.09** | 4.5 ✅ |
| G | input label on `--site-surface` | `rgb(236,234,242)` | `rgb(11,9,22)` | 14px/500 | **16.54** | 4.5 ✅ |
| H | input **placeholder** on `--site-surface` | `rgb(125,117,150)` | `rgb(21,17,34)` | 14px/400 | **4.28** | 4.5 ❌ **FQ34** |
| I | input typed value on `--site-surface` | `rgb(236,234,242)` | `rgb(21,17,34)` | 14px/400 | **15.52** | 4.5 ✅ |
| J | form `.note` (swapped off ink-faint) | `rgb(169,163,186)` | `rgb(11,9,22)` | 13px/400 | **8.11** | 4.5 ✅ |
| K | **T1** success alert title + icon, `--alert-color` on `--site-accent-wash` | `rgb(164,136,255)` | `rgb(26,22,45)` | 14px/700 | **6.31** | 4.5 ✅ **computed only** |
| L | **T1** success alert body, `--mantine-color-white` on `--site-accent-wash` | `rgb(245,243,251)` | `rgb(26,22,45)` | 14px/400 | **15.97** | 4.5 ✅ **computed only** |

Row F is the ground T3 was meant to replace; it passes contrast, so nothing here
is a stop-and-ask — T3 is a *look* fix, and it is not implemented (FQ32).

Rows K/L are **computed, not rendered** — section 3, see UNVERIFIED below. The
colour bindings are read straight out of `@mantine/core/styles/Alert.css`, not
assumed: root is `background-color: var(--alert-bg)` + `color: var(--alert-color)`;
the title inherits root `color`; `.m_87f54839` (the icon box) is
`color: var(--alert-color)`, so `IconCircleCheck` does follow T1; the body in the
dark scheme is `color: var(--mantine-color-white)`. Only `green` and `red` Alerts
exist on this site, both in `ContactForm.tsx` — verified by grep.

### 4.3 The 0.046 ceiling — D1 contributes exactly 0

Method reproduced from TASK-007 §Third pass; my sampler returns **0.02326** for
the route aurora peak against your published `/about` **0.02324 / 0.02321** —
same method, rounding aside.

| Viewport | worst L, D1 on | worst L, D1 removed | **D1 contributes** | ceiling |
|---|---|---|---|---|
| 1217 | 0.02326 | 0.02326 | **0** | 0.046 ✅ |
| 1280 | 0.02326 | 0.02326 | **0** | 0.046 ✅ |
| 360 | 0.02326 | 0.02326 | **0** | 0.046 ✅ |

The reason is the one you gave at TASK-009 and it holds here: walking up from
`/contact`'s opening block, the **first** layer reached is already fully opaque —
`.hero` itself, `rgb(11, 9, 22)`, alpha 1 (`RouteHero.module.css:13`). D1 paints
at `z-index: -1` behind it, so it is fully occluded and the six readings are
forced, not lucky. Removing `MachineGround` from the DOM changes nothing at any
of the three widths. Worst pixel is aurora-1's peak
(`srgb 0.4392 0.2510 1.0000 / 0.34`); aurora-2's peak reads 0.01165.

### Not ticked, on purpose

1. **R4 byte-identical `innerText`** — 3 tokens change case. **FQ31.**
2. **T3** — not implemented; Mantine 8.3.18's `styles` API rejects the nested
   selector. **FQ32.**
3. **T1's rendered check** — computed only. In section 3's words: *the rendered
   check is UNVERIFIED*. Reason: section 3, plus **FQ35** below.
4. **The submit button's loading label** — same reason.
5. **"Accordion still works"** — **UNVERIFIED, not failed. FQ35.** A real
   trusted click does flip `aria-expanded` to `true`, but the panel stays at
   `height: 0; display: none` because this environment never runs a single
   animation frame. That is the harness, not the site.

---

## Rework round 2 — Fern 2026-09-04

Exactly the three items §Review sent back, and nothing else. Baseline still
`HEAD=46aef59` on `develop`. Dev on **3010** (3000 still held), stopped
afterwards; `.next` deleted after the build **and** again after dev. No git
write, no commit, no branch, no deploy, no `pm2`, no ssh. **No real /contact
submit was fired in this round either.**

### The diff — one file, three hunks

`git diff -- front/src/theme/theme.ts` is now the `Alert` entry (round 1) plus:

```diff
@@ TextInput.vars.wrapper @@
+          '--input-placeholder-color': 'var(--mantine-color-dimmed)',
@@ Textarea.vars.wrapper @@
+          '--input-placeholder-color': 'var(--mantine-color-dimmed)',
@@ comment above Accordion (FQ33 — the parenthetical clause only) @@
-     * with `styles` here (inline, so they also beat the `variant="default"`
-     * rules ContactFaq still passes until TASK-010 removes that prop).
+     * with `styles` here (inline, so they win on their own account; `default`
+     * is Mantine's own default variant, so dropping the prop changed no rule —
+     * it removed a retired pattern, which is why the grep is the check).
@@ Accordion.vars (T3 — the object was expanded, not restructured) @@
-      vars: () => ({ root: { '--accordion-radius': 'var(--mantine-radius-lg)' } }),
+      vars: () => ({
+        root: {
+          '--accordion-radius': 'var(--mantine-radius-lg)',
+          // Mantine hard-codes `--mantine-color-dark-6` in its own control
+          // hover/active rule. `styles` is inline-only, so scoping the variable
+          // here is the only way to give that state a token ground — T3 / FQ32.
+          '--mantine-color-dark-6': 'var(--site-accent-wash)',
+        },
+      }),
```

`styles`, `Modal`, `Button`, `Drawer`, the palette and **both**
`cssVariablesResolver` blocks are byte-identical to HEAD. `git status` is the
**same 19 modified files** as at REVIEW (12 TASK-009 + 1 TASK-008 + my 6) — the
rework added no twentieth file. `front/.next.zip` is still the human's untracked
file, untouched.

### T3 — the cascade, measured (FQ32's two reads)

```
getComputedStyle($('[data-accordion-control]')).getPropertyValue('--mantine-color-dark-6')
  -> "rgba(164, 136, 255, 0.10)"        == --site-accent-wash   ✅ reached the control
getComputedStyle(document.documentElement).getPropertyValue('--mantine-color-dark-6')
  -> "#2c2640"                          unchanged               ✅ leaked nowhere else
control.getAttribute('style')  -> null   (no junk attribute this time — contrast with FQ32's probe)
```

The rule that consumes it is present and matches this control's own class
(`.m_6939a5e9`), read out of the live stylesheet, not assumed:

```
@media (hover: hover) { :where([data-mantine-color-scheme="dark"]) .m_6939a5e9:where(:not(:disabled, [data-disabled])):hover
                        { background-color: var(--mantine-color-dark-6); } }
```

**The rendered hover look stays UNVERIFIED** (FQ35 — this harness runs no
animation frame, and it also refuses to scroll: `window.scrollTo` leaves
`scrollY === 0`, so a real pointer hover cannot be driven onto the control).
Nothing was changed to work around that.

### Contrast — the two rows the rework touches

Sampler re-validated first against two of your published numbers, both exact:
row F `13.09` and TASK-008 FQ25's `4.23`.

| # | Pair | fg | bg | size/weight | ratio | bar |
|---|---|---|---|---|---|---|
| F2 | **T3** accordion control label on the **new** composited hover ground (10% wash over `--site-glass-bg` over the page ground) | `rgb(245,243,251)` | `rgb(36.1,29.5,61.3)` | 16px/400 | **14.42** | 4.5 ✅ |
| H | **T4** input **placeholder** on `--site-surface` — *replaces the 4.28 ❌ row* | `rgb(169,163,186)` | `rgb(21,17,34)` | 14px/400 | **7.61** | 4.5 ✅ |

Row H reads identically on the `Textarea` (`rgb(169,163,186)`, **7.61**) and at
360 as at 1280. The typed value is untouched at **15.52** (row I), so an empty
field still reads as empty — 7.61 vs 15.52 is a visible gap, not a merge. Your
prediction was ~7.7; the measurement is 7.61. Rows A-E and G-L are unchanged
(the round-1 table stands); F stays on record as the ground T3 replaced.

### Re-run evidence

```
$ npx tsc --noEmit                  -> exit 0
$ npm run build                     -> exit 0, "Compiled successfully in 20.5s",
                                       10/10 static pages, NO warning line; .next deleted after
$ grep -rn "gap: 1px|text-transform: uppercase|radius-xs|variant=default" \
        src/components/partials/Contact              -> exit 1 (no output)
$ grep -rn "use client" src/components src/app   vs   the same grep on `git archive HEAD`
                                    -> 11 lines both sides, diff empty = BYTE-IDENTICAL TO HEAD
```

**Console — six routes at 1280x800 and again at 360x740: zero errors, zero
warnings.** Re-run in full because `theme.ts` reaches every route; the only
output is Next's `[Fast Refresh]` logs and the React DevTools `info` line. No
horizontal scroll at 360 (`scrollWidth 360 === clientWidth 360`).

**Blast radius, checked by grep not assumed:** the whole site renders
`Accordion` in exactly one file and `TextInput`/`Textarea` in exactly one file,
both under `partials/Contact/` (`ContactFaq.tsx`, `ContactForm.tsx`). So T3 and
T4 cannot change a pixel on any other route — R6's own "confirm by grep" test.

### Still UNVERIFIED after the rework, in those words

Unchanged from round 1, and none of them was worked around: **T1's rendered
alert**, **the submit button's loading label**, and **the accordion's rendered
open/close and hover look**. The DoD's "Form behaviour" and "Accordion still
works" boxes therefore stay unticked on purpose.

## Questions

(Fern asks; Sober answers as `> answer: ...`)

**FQ31 — §0's "byte-identical `innerText`" and C2's label recipe cannot both
hold on `/contact`. I applied C2 and left the box unticked.**
`innerText` reports `text-transform`, so retiring the uppercase micro-label moves
the three channel `<dt>`s back to their source casing: `EMAIL/PHONE/LOCATION` →
`Email/Phone/Location`. Character count is unchanged (867 / 794 at 1280 / 360,
before and after), no string is added, removed, reordered or translated, and
`constant/content/contact.ts` is untouched — the source has always read
`'Email'`, `'Phone'`, `'Location'`. This is the same consequence you already
ruled SA-owned and intended at **TASK-008 FQ26** (11 labels on `/about` +
`/services`), so I followed the precedent rather than weakening C2 — but §0
states the requirement flatly and only you can relax it. **Please confirm the
3-token casing delta is accepted and R4 is met in kind.**

> answer: **Confirmed — accepted, and R4 is met in kind. Tick the box** with
> "byte-identical apart from the 3 label-recipe casing tokens" written beside it.
> The FQ26 precedent binds and you read it correctly: R4 protects **source
> strings**, not the casing `text-transform` paints. Nothing in
> `constant/content/contact.ts` moved, the character count is unchanged, and the
> three `<dt>`s now render their own source casing — which is the honest state.
> Weakening C2 to keep an `innerText` byte-match would have kept a retired
> pattern alive to satisfy a check about copy; that is the wrong trade.
> This is now a **standing SPEC-002 rule** (§Retired patterns, dated 2026-09-04)
> so TASK-011 does not re-raise it: *a casing delta produced by the SA-owned
> label recipe satisfies R4; any other `innerText` delta does not.*
> Routing, mine not yours: Porter carries the running total to the owner —
> **14 labels site-wide** (8 `/about`, 3 `/services`, 3 `/contact`).

**FQ32 — T3 is NOT implemented: Mantine 8.3.18's `styles` API does not accept a
nested selector, and I said so instead of reaching for a CSS module or
`!important` (your own instruction in T3).**
I added `control: { '&:hover': { background: 'var(--site-accent-wash)' } }`
exactly as written and measured it on the running page:

```
control.getAttribute('style')  ->  "&:hover:[object Object]"
control.style.cssText          ->  ""                  (the browser rejected it)
computed background at rest    ->  rgba(0, 0, 0, 0)    (unchanged)
```

So it does nothing *and* it stamps a junk `style` attribute onto every accordion
control. I removed the probe; `theme.ts`'s `Accordion` entry is byte-identical to
HEAD. Mantine's actual rule is
`@media (hover:hover) :where([data-mantine-color-scheme='dark']) .m_6939a5e9:hover { background-color: var(--mantine-color-dark-6) }`
(`@mantine/core/styles/Accordion.css`). It passes contrast (row F, 13.09:1), so
this is a look fix, not an accessibility one. **Your call — I have not chosen:**

- (a) `vars` on the Accordion root scoping `--mantine-color-dark-6:
  var(--site-accent-wash)`. The hover rule reads that variable and it cascades to
  the control. Inside an accordion the only other reader is `--item-filled-color`,
  which the `default` variant never paints, so the blast radius is the control
  hover alone. No new hex, no CSS module, no `!important`.
- (b) `classNames` + a stylesheet — excluded by T3 as written.
- (c) Leave the grey hover and close T3 as won't-do.


> answer: **(a). Implement T3 with `vars`, not `styles`.** You were right to stop
> — a theme `styles` value becomes an inline `style` object, so no nested selector
> can ever live there, and reaching for a module or `!important` would have broken
> the design-system boundary to work around an API limit. I verified the mechanism
> in the repo rather than taking your option on trust:
> `@mantine/core/styles/Accordion.css` carries exactly one hover rule —
> `:where([data-mantine-color-scheme='dark']) .m_6939a5e9:where(:not(:disabled,[data-disabled])):hover { background-color: var(--mantine-color-dark-6) }`
> — plus the same value on `:active` under `@media (hover: none)`. Scoping that
> variable on the Accordion root reaches **both** states, invents no value, and
> adds no hex, no module, no `!important`. Add one property to the `vars` object
> that is already there; do not restructure it:
>
> ```ts
> Accordion: {
>   vars: () => ({
>     root: {
>       '--accordion-radius': 'var(--mantine-radius-lg)',
>       // Mantine hard-codes `--mantine-color-dark-6` in its own control
>       // hover/active rule. `styles` is inline-only, so scoping the variable
>       // here is the only way to give that state a token ground — T3 / FQ32.
>       '--mantine-color-dark-6': 'var(--site-accent-wash)',
>     },
>   }),
> ```
>
> **Blast radius, checked not assumed.** Inside an Accordion the only other reader
> of `--mantine-color-dark-6` is `--item-filled-color`, declared on the root in
> `Accordion.css`'s dark block and painted only by the `contained` / `filled` /
> `separated` item classes. The `default` variant's item is `.m_fe19b709` —
> `border-bottom` only — so it never reads it; and our `styles.item` sets
> `background` inline, which would win even if a variant changed later. Nothing
> outside the accordion root can see the override.
>
> **What I want measured — all of it works in your harness:**
> 1. `getComputedStyle(document.querySelector('[data-accordion-control]'))`
>    `.getPropertyValue('--mantine-color-dark-6')` → `rgba(164, 136, 255, 0.10)`,
>    **and** the same read on `document.documentElement` still `#2c2640`. That
>    pair proves the cascade reached the control and leaked nowhere else.
> 2. Contrast of the control label over the composited hover ground (the 10% wash
>    over `--site-glass-bg` over the page ground). Row F already reads 13.09:1
>    against the *opaque* grey, so this is expected to clear easily — under 4.5:1
>    is a stop-and-ask, still.
> 3. The rendered hover **look** stays **UNVERIFIED** in this harness (FQ35) — say
>    so in those words; never tick a rendered box from a computed value.
> 4. If the variable does not reach the control, **stop and report**. Do not
>    substitute a CSS module, a `classNames` stylesheet, or `!important`.

**FQ33 (FYI, no action taken beyond C3) — `variant="default"` is a no-op in
Mantine 8.3.18.** `default` *is* the Accordion's own default
(`Accordion.mjs` `defaultProps: { variant: "default" }`), so `control--default` /
`item--default` still render and the theme's inline `styles` are still what beats
them. The comment at `theme.ts:147-149` ("inline, so they also beat the
`variant="default"` rules ContactFaq still passes until TASK-010 removes that
prop") is therefore stale. I removed the prop anyway — it is the retired-pattern
grep's target and the grep now exits 1 — but I did **not** edit your comment.


> answer: Confirmed stale, and thank you for not editing it unasked — that was the
> right instinct. **Correct it in this rework pass**, because T3 reopens the
> `Accordion` entry that comment sits on. Change **only** the parenthetical clause
> "(inline, so they also beat the `variant="default"` rules ContactFaq still
> passes until TASK-010 removes that prop)" to say what is now true: `styles` is
> inline and inline wins on its own account; `default` is Mantine's own default
> variant, so removing the prop changed no rule — it removed a **retired
> pattern**, which is why the grep is the check. No other comment, and no other
> line of that block, moves.

**FQ34 — the input placeholder measures 4.28:1, under the 4.5 bar, and I cannot
fix it inside this task's bounds.** `rgb(125,117,150)` on `--site-surface`
`rgb(21,17,34)` at 14px/400. The colour is Mantine's
`--mantine-color-placeholder` → `dark-3`, which our `obsidian` palette override
(TASK-001) resolves to `#7d7596` — numerically the same hex as
`--site-ink-faint`, but a **different variable**, so §0's swap rule does not
reach it. Every route to it is out of scope: `--input-bg: var(--site-surface)` is
TASK-006's, §2 Bounds rules out the palette and every `cssVariablesResolver`
value, and C4 forbids a route CSS module rule for a control look. **Reported, not
fixed** — it belongs next to the `--site-ink-faint` token question you already
recorded in TASK-011.


> answer: **Real finding, correctly reported, and it is mine to fix — not carried.
> I am extending §2's bounds by exactly one property: this is T4 below.** Your
> reasoning about the bounds was right, which is why it comes back as a bounds
> change from me instead of a discretionary edit from you. Two reasons it cannot
> be carried to TASK-011: SPEC-002 §Non-functional binds every text/background
> pair this SPEC **changed**, and TASK-006 changed this one's ground when it set
> `--input-bg: var(--site-surface)`; and `theme.ts` is TASK-010's alone, so no
> later task can touch it.
>
> **T4 (new, SA-added 2026-09-04).** Add
> `'--input-placeholder-color': 'var(--mantine-color-dimmed)'` to the `wrapper`
> vars of **both** `TextInput` **and** `Textarea`, and change nothing else in
> those two entries. `--input-placeholder-color` is Mantine's own per-input
> variable (`@mantine/core/styles/Input.css:27`), so no palette entry and no
> `cssVariablesResolver` value moves — the objection that blocked you does not
> apply to it. `--mantine-color-dimmed` is `#a9a3ba` in this repo's dark resolver:
> the same secondary ink rows A / D / J already measure, so no value is invented.
> My prediction, to be replaced by your measurement: **~7.7:1** on
> `--site-surface`; the typed value stays `#eceaf2` at 15.52, so an empty field
> still reads as empty. Re-measure row H and paste it; under 4.5:1 is a
> stop-and-ask. `--site-ink-faint`'s **token-level** question is untouched by this
> and stays recorded in TASK-011 — T4 moves one input variable, not the token.

**FQ35 — ENVIRONMENT, and I think it matters to SQ7. This harness never runs an
animation frame, so nothing that opens via a Mantine transition can be verified
here.** Measured on the running page:

```
document.visibilityState -> "hidden"   (whether or not the tab is fronted)
requestAnimationFrame    -> no frame within 1500 ms
screenshot               -> a blank frame of the page ground
```

Consequence for the DoD's "Accordion still works" box: a **real trusted click**
on a FAQ control *does* flip `aria-expanded` to `"true"`, and the answer text is
present in the DOM (`panel.innerHTML.length === 314`) — but the panel stays
`height: 0px; overflow: hidden; display: none` with `opacity: 1`. Mantine's
`Collapse` reached the "opening" state and its rAF-driven step never ran. So the
accordion is **UNVERIFIED, not failed** — I am not reporting a defect against it,
and I changed nothing to work around it.

Two things follow that are yours to route, not mine:

1. This is a concrete candidate mechanism for **SQ7**'s original "Modal/Drawer
   never open" claim, and it would explain why Tanya — driving a real, visible
   Playwright browser — returned CANNOT_REPRODUCE. If that holds, the SQ7 gate is
   guarding against a harness artifact.
2. It explains the "blank frames" that stopped TASK-009 from screenshotting the
   rebuilt Portfolio/Blog cards. The same block applies here, so **nobody has
   laid eyes on the rebuilt Contact panels either** — the SQ8 QA eye-check ask
   now covers three routes, not two.


> answer: **Recorded, and both consequences are routed by me — neither is yours to
> carry.** This was the most useful thing in the report.
> (1) **The SQ7 gate does not move today.** Your no-animation-frame finding is now
> written into SPEC-002 §Questions SQ7 as a *candidate mechanism* for the original
> "never opens" claim, and Porter has it for Tanya — TEST-003 runs a real visible
> browser, so she can confirm it or kill it, and hers is the verdict that counts,
> not a mechanism I happen to find convincing. Until that lands **the gate stands
> unchanged**: nothing in this rework may work around a `Modal` or a `Drawer`, and
> no route file gets a workaround.
> (2) **The third QA eye now covers three routes** — `/portfolio`, `/blog` and
> `/contact`. That is in SQ8, with Porter.
> For your own boxes: "Accordion still works" stays **UNVERIFIED, not failed**, in
> those words; the same for T1's rendered alert and the submit loading label. You
> were right not to fire a real submit — **do not fire one in the rework either.**

## Review

**Verdict: REWORK (Sober 2026-09-04) — and a narrow one.** Everything you shipped
is accepted; nothing in C1-C4, T1 or T2 comes back. The task returns for **T3
alone, with its mechanism now decided (FQ32 → option (a))**, plus **T4**, one
property I am adding to §2's bounds off the back of your FQ34, and FQ33's stale
comment clause. Two to four lines of `theme.ts`, then re-measure.

**Why REWORK and not DONE-with-a-carry.** T3 is one of the three follow-ups
SPEC-002 names for this task, and TASK-010 is the **only** task in SPEC-002
allowed to edit `theme.ts`. If I closed it today, no task would own the fix and
the "accordion hover punches a grey hole in the glass" defect would ship with
nobody carrying it. The blocker was real and you were right to stop at it — it is
answered now, so the task can finish.

### Re-verified by me in the real tree, not read off your notes

- **Scope.** `git status` = 19 modified files = TASK-009's 12 + TASK-008's 1 CSS
  line + your 6. No twentieth file, no new untracked source; `front/.next.zip` is
  still the human's.
- **`git diff theme.ts` is the `Alert` entry alone** — the `Accordion` entry,
  both `cssVariablesResolver` blocks, the palette and every other widget are
  byte-identical to HEAD. **T2** reads `props.color === 'green'` (positive
  discriminator, red and `undefined` fall through to radius-only) and **T1** adds
  `--alert-color: var(--mantine-color-anchor)` on that branch only. Exactly §2.
- **C1** `RouteHero` + `ContactForm` in its own `PageSection density="tight"`,
  `.form`'s `margin-top: 40px` gone. **C2** `gap: 1px`, the hairline ground and
  the border all gone → `var(--mantine-spacing-lg)`; `.item` rule deleted;
  `GlassPanel as="div"` inside the `<dl>`; `.label` is the label recipe
  **character for character**. **C3** `variant="default"` gone. **C4** no route
  CSS rule for a control look. Both `--site-ink-faint` swaps done, and only those
  two — 0 hex literals and 0 `!important` under `partials/Contact`.
- **`npx tsc --noEmit` exit 0, run by me.** Retired-pattern grep **exit 1, run by
  me**. `grep -rn "use client" src/components src/app` = 11 lines, **diffed by me
  against HEAD: byte-identical.**
- **Two claims I checked rather than accepted.** `RouteHero` renders
  `SectionHeading order={1}`, so `/contact` keeps a real `<h1>` — the `H1 H2 H2`
  outline is structural, not just reported. And deleting `.item`'s 24px padding
  does not leave the channels unpadded: `GlassPanel`'s default is
  `padding="md"` → `var(--mantine-spacing-lg)`.

### Taken as your live evidence, not re-run by me — said plainly

`npm run build`, the six-route console at both viewports, R6's 170-element hash,
the R4 `innerText` comparison, 4.1's heights, 4.2's twelve contrast rows and
4.3's D1 table. One of them I can vouch for by construction, as at TASK-009:
`RouteHero.module.css:13` makes `.hero` opaque above D1, so the six
D1-contributes-0 readings are **forced, not lucky**. If a later readback ever
disagrees with any of these, the readback wins over both of us.

### What comes back — and nothing else

1. **T3** by mechanism (a) — code and checks in the FQ32 answer.
2. **T4** — `--input-placeholder-color` on both input entries, per the FQ34 answer.
3. **FQ33's one stale clause** in the comment above the `Accordion` entry.

Then: re-run `tsc`, `build` and the **six-route** console (`theme.ts` reaches
every route, so that check is load-bearing again), re-measure row H and the
accordion hover row, and re-tick the `git diff theme.ts` box in its new wording.
Everything else in the DoD stays ticked as it is — do not redo it.

### Accepted as met; do not redo, do not re-raise

- **R4 (FQ31)** — tick it with the casing note. The rule is now in SPEC-002.
- The **three UNVERIFIED items** stay UNVERIFIED in those words: T1's rendered
  alert, the submit loading label, and the accordion open/close (FQ35). No real
  `/contact` submit in the rework either.
- **FQ33/FQ34/FQ35 findings** are all accepted as reported. FQ35 is routed to
  SQ7 and SQ8 by me; the SQ7 gate does not move today.

### Round 2 review — verdict: **DONE** (Sober 2026-09-04)

The three items came back and **nothing else moved**. Re-verified by me in the
real tree, not read off your notes:

- **`git status` = 19 modified files, unchanged from REVIEW** (TASK-009's 12 +
  TASK-008's 1 CSS line + your 6). No twentieth file; `front/.next.zip` is still
  the human's untracked file.
- **`git diff -- front/src/theme/theme.ts` is exactly four hunks** and nothing
  else: the two `--input-placeholder-color` lines on the `TextInput` and
  `Textarea` `wrapper`s (T4), FQ33's parenthetical clause, the `Accordion`
  `vars` root gaining `'--mantine-color-dark-6': 'var(--site-accent-wash)'` (T3),
  and round 1's `Alert` entry. `styles`, `Modal`, `Button`, `Drawer`, the
  palette and **both** `cssVariablesResolver` blocks are byte-identical to HEAD.
- **`npx tsc --noEmit` exit 0, run by me.** Retired-pattern grep **exit 1, run
  by me**. `grep -rn "use client" src/components src/app` diffed by me against
  the same grep on `46aef59`: **the same 11 lines, same files, same line
  numbers** (only ripgrep-vs-git-grep ordering differs) = identical to HEAD.
- **T3's blast radius checked at the source, not accepted.**
  `node_modules/@mantine/core/styles/Accordion.css` reads
  `--mantine-color-dark-6` in exactly three places: the control `:hover`
  (line 47) and `:active` (line 57) rules — the ones T3 targets — and
  `--item-filled-color` (line 109). The third is unreachable here twice over:
  `ContactFaq` renders no `variant`, and the theme's `styles.item` already
  paints the item ground inline, which beats any stylesheet rule. So T3 changes
  the hover/active ground and nothing else.
- **FQ33's claim verified rather than believed:** Mantine's `Accordion.mjs`
  `defaultProps` is `variant: "default"`, so dropping `variant="default"`
  really did change no rule.
- **Both measurements recomputed by me from the token values, not the report.**
  `--mantine-color-dimmed` (dark) is `#a9a3ba` = `rgb(169,163,186)` and
  `--site-surface` (dark) is `#151122` — WCAG ratio **7.60**, against your 7.61
  (rounding). `--site-accent-wash` (dark) is `rgba(164, 136, 255, 0.10)`,
  exactly your computed read. Row F2's pair computes **14.55** on the ground you
  reported vs your 14.42 — a composite-rounding delta, three times over the bar
  either way. Both rows pass.

**Taken as your live evidence, not re-run by me** — and said plainly, as at
TASK-008 and TASK-009: `npm run build`, the six-route console at both viewports,
the no-h-scroll check, and the two live `getComputedStyle` reads. A four-line
CSS-custom-property diff on a tree that type-checks cannot plausibly break the
build; if a later readback ever disagrees, the readback wins over both of us.

**The two unticked DoD boxes are accepted as UNVERIFIED, not as failures** —
"Form behaviour unchanged" and "Accordion still works", plus T1's rendered alert
and the submit loading label. You did not work around any of them and no real
`/contact` submit was fired, which is what I asked for. They are **carried into
TASK-011 §7** by me in this hop, so nothing closes on silence. One of them needs
a real browser rather than your harness (FQ35), so I am also asking Porter to
put the accordion and the form in front of QA's eye under SQ8.

**One latent consequence, recorded not fixed** (unreachable today, so no
rework): an inline `vars` value beats the stylesheet rule that sets the same
variable for a state. If a Mantine `error` prop is ever added to these inputs,
`Input.css:142`'s red placeholder will not win over T4's
`--input-placeholder-color`; `ContactForm` passes no `error` prop today (its
`'error'` status drives the `Alert`, not the field). Same shape as the
`--item-filled-color` note above. The rule now carries this in SPEC-002.

**Not moved today:** the SQ7 gate (still its own hop, after TEST-003) and
DEF-1 (TASK-012's). **@Fern: TASK-012 is yours next, then TASK-011.**
