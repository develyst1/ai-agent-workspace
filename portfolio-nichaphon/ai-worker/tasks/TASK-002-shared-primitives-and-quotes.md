# TASK-002: New shared primitives + quotes content

- Source: SPEC-001
- Status: DONE
- Owner: Fern (FE)
- Depends on: TASK-001 (the variables these components read are created there)

Read **SPEC-001 §"Interface design"** and **§"Data model"** first. This task builds
the three new primitives and the quotes content file. It renders nothing on a page
— TASK-004 consumes them.

## What to do

**1. Content type + quotes file**

- `front/src/types/app/content/index.ts` — append the `Quote` interface exactly as
  written in SPEC-001 §"Data model" (`id`, optional `th`, required `en`). Do not
  reorder or touch the existing interfaces.
- New file `front/src/constant/content/quotes.ts` exporting `QUOTES: Quote[]` with
  all four quotes, ids `q1`–`q4`.
- **Copy the strings from `requirements/REQ-001-ui-visual-redesign.md` §Requirement
  R5, by copy-paste, character for character.** R5 is the only source. Not from
  SPEC-001, not from this file, not from the log, not retyped from memory.
  - Thai for `q1`–`q3` = the three strings under *"Quotes 1–3, Thai — settled"*.
  - English for `q1`–`q3` = the three strings under *"English wording — authorised"*.
  - `q4` = `Don't say why me. Say try me.` and has **no `th` key** — no Thai version
    exists and none is invented.
  - The straight `"` characters inside quotes 2 and 3 are the owner's and stay as
    typed. Do not convert them to typographic quotes, and do not escape them into
    a different character.

**2. `front/src/components/ui/GlassPanel/`** (`GlassPanel.tsx`, `GlassPanel.module.css`, `index.ts`)

- Props exactly: `{ children, as?: 'div' | 'article' | 'li', padding?: 'sm' | 'md' | 'lg', glow?: boolean, className? }`.
  `as` defaults to `'div'`, `padding` to `'md'`.
- Surface: `background: var(--site-glass-bg)`, `border: 1px solid var(--site-glass-border)`,
  `border-radius: var(--mantine-radius-lg)`. `glow` adds `box-shadow: var(--site-glass-glow)`.
- `padding` maps to the theme spacing scale (`sm`→`--mantine-spacing-md`,
  `md`→`--mantine-spacing-lg`, `lg`→`--mantine-spacing-xl`). No literal px padding.
- `className` is appended to the module class so a consumer can add layout, never
  colour. Server component — no `"use client"`.

**3. `front/src/components/ui/AuroraBackdrop/`** (same three files)

- Props exactly: `{ variant: 'hero' | 'band' }`.
- One absolutely-positioned `aria-hidden="true"` `<div>` filling its positioned
  parent, `pointer-events: none`, `z-index: 0` (consumers put content at `z-index: 1`).
- Paint is **layered CSS radial-gradients only**, built from `--site-aurora-1/-2/-3`.
  Hard constraints from SPEC-001: no images, no `filter: blur()` on this layer, no
  animation, no transition. `hero` is the larger, more spread bleed; `band` is the
  tighter one behind the statement band.
- Server component.

**4. `front/src/components/ui/PullQuote/`** (same three files)

- Props exactly: `{ id: string, size?: 'lead' | 'band' }`. Look the quote up in
  `QUOTES` by `id`.
- Renders Thai as the primary line and English beneath it as the translation:
  the Thai element carries `lang="th"`, the English element `lang="en"`.
- When the quote has no `th` (only `q4` today), render the English **alone**. Do not
  fall back to anything, do not pad the layout, do not invent a pairing, and do not
  throw.
- **Do not add typographic quote marks** around the text — quotes 2 and 3 contain
  the owner's own `"` characters and a wrapper would read as a nesting error.
- Thai does not break on spaces: no `white-space: nowrap` anywhere, cap the measure
  with a `max-width` in `ch`, and allow normal wrapping.
- If the id is not found, this is a build-time programmer error — fail loudly
  (throw) rather than rendering an empty element. It must never reach a page silently.
- Markup is a `<blockquote>` with a `<p>` per language. No `<cite>` — there is no
  attribution string in the content and none may be invented.
- Server component. `size` changes type scale/measure only, not colour.

**5. Barrel** — add all three to `front/src/components/ui/index.ts`, alphabetically
alongside the existing exports. `ColorSchemeToggle`'s export stays.

## Definition of Done

- [x] `cd front && npm run build` completes with no errors and no new warnings.
- [x] `npx tsc --noEmit` (or the build's type step) passes — `Quote` is used, not `any`.
- [x] The four quote strings in `quotes.ts` are byte-identical to REQ-001 R5. Verify
      by eye against R5 side-by-side, and record in Implementation Notes that you
      diffed them and against which source.
- [x] `q4` has no `th` key at all (not `th: ''`, not `th: undefined`).
- [x] None of the three new components contains `"use client"`.
- [x] `AuroraBackdrop`'s CSS contains no `blur(`, no `@keyframes`, no `transition`,
      no `url(`.
- [x] No page renders yet reference these — this task adds no visual change to any
      route, and all six routes still render exactly as after TASK-001.

## Implementation Notes

Implemented 2026-08-30 by Fern on `develop` in `portfolio-nichaphon-web`. No git
write, no deploy, no `package.json` change, no dependency move.

### Files

New (10):
- `front/src/constant/content/quotes.ts`
- `front/src/components/ui/GlassPanel/{GlassPanel.tsx, GlassPanel.module.css, index.ts}`
- `front/src/components/ui/AuroraBackdrop/{AuroraBackdrop.tsx, AuroraBackdrop.module.css, index.ts}`
- `front/src/components/ui/PullQuote/{PullQuote.tsx, PullQuote.module.css, index.ts}`

Modified (2):
- `front/src/types/app/content/index.ts` — `Quote` appended at the end, exactly as
  SPEC-001 §Data model writes it. No existing interface reordered or touched.
- `front/src/components/ui/index.ts` — three exports added. The existing three lines
  were **reordered** so the whole list is alphabetical, per this TASK's §5; nothing
  was removed, `ColorSchemeToggle` still exports.

The four TASK-001 files (`theme.ts`, `globals.css`, `layout.tsx`, `UIProvider.tsx`)
still show as modified in `git status` — that is TASK-001's uncommitted work, not this
task's. `git status` after this run: 6 modified + 4 untracked paths, nothing else.

### How the quote strings were copied (this is the part that must not be trusted to typing)

They were **not** retyped. A throwaway script read
`requirements/REQ-001-ui-visual-redesign.md`, took the backtick-delimited strings from
the R5 lines (Thai `91–93`, English `112–114`, q4 from line `81`) and emitted
`quotes.ts` from those exact substrings. It asserts before writing that no character is
a typographic quote (U+2018/2019/201C/201D) and that no string contains a backslash;
only the apostrophes inside the English strings are escaped, which does not change the
value. The owner's straight `"` marks are untouched.

A **second, independent** script then re-parsed the finished `quotes.ts`, unescaped the
literals, and compared each string to the R5 line again:

```
q1.th IDENTICAL len 48 | q1.en IDENTICAL len 79
q2.th IDENTICAL len 45 | q2.en IDENTICAL len 46
q3.th IDENTICAL len 90 | q3.en IDENTICAL len 130
q4.th absent in BOTH R5 and quotes.ts | q4.en IDENTICAL len 29
q4 has th key in file: false
ALL FOUR QUOTES BYTE-IDENTICAL TO REQ-001 R5
```

Source diffed against: `requirements/REQ-001-ui-visual-redesign.md` §R5 only.

### Verification

- `npx tsc --noEmit` → exit 0.
- `npm run build` → `✓ Compiled successfully`, `✓ Generating static pages (10/10)`,
  0 errors, 0 warnings. Route table unchanged from TASK-001 except `/` `3.35 kB`
  (the barrel now carries three more static components).
- `npm run dev` (cache cleared first, port 3003) → all six routes `200`; the server
  log has `✓ Compiled` for all six and **no** `<w>`/`<e>`/warn/error line.
- Browser console on `/` = the React DevTools info line only; on `/contact` and
  `/about` = no console logs at all. `data-mantine-color-scheme="dark"`, body
  `rgb(11, 9, 22)` — unchanged from TASK-001.
- The three new CSS modules compile and ship: all 13 generated class names
  (`GlassPanel_panel__…`, `AuroraBackdrop_hero__…`, `PullQuote_band__…`, …) are
  present in the served stylesheets.
- Forbidden-substring grep over all three new component folders for
  `blur(` `@keyframes` `transition` `url(` `nowrap` `use client` → **no match**,
  including in comments (two comments were reworded so a reviewer's grep stays clean).
- **Thai wrapping at 360px, measured** (SPEC-001 §Edge cases). Zero-footprint check: no
  file was added — at a 360px viewport the shipped module classes were applied to a
  throwaway DOM node in the browser, measured, and the node removed. q3's Thai in
  `band`: `max-width` 288px, `scrollWidth == clientWidth == 288`, document
  `scrollWidth` 360 (no horizontal overflow), wraps to 4 lines, computed
  `white-space: normal`. q4 in `lead`: 346px, 1 line, no overflow.

### Not verified, stated plainly

The three components **render nowhere yet** — that is this TASK's design. Their
appearance in place (aurora bleed, glass surface, the quote's type against the hero)
is unverified until TASK-004 consumes them, and visual/aesthetic acceptance is the
owner's via Porter, not mine.

### Decisions taken inside the component internals — please confirm at review

1. **q4 renders in the primary type class, not the translation class.** "Render the
   English alone" reads as *it is the quote*, not an orphaned translation, so the one
   line takes the primary scale and `--mantine-color-text`. Nothing is padded and no
   pairing is invented.
2. **Colours**: `PullQuote` uses `--mantine-color-text` (Thai/primary) and
   `--mantine-color-dimmed` (English translation) — both existing tokens SPEC-001
   marks AA on the ground. `size` moves font-size and measure only, never colour.
3. **`AuroraBackdrop` alpha** comes from `color-mix(in srgb, var(--site-aurora-N) X%,
   transparent)` — the same mechanism `TechChip.module.css` already uses. The three
   hues stay in the theme; no colour value is written in the module.
4. **The measure lives on the `<blockquote>`, not the `<p>`**, so `ch` resolves at the
   quote's own type size; the paragraphs size in `em` from it. The translation is
   floored at `max(0.9375rem, 0.55em)` so it can never fall below 15px.
5. **No CTA colour was reached**, so nothing near `--site-cta-*` was touched (SA-OWN-1).

## Questions

- **FQ2 — non-blocking, but it needs an answer before TASK-004 uses `as="li"`.**
  `GlassPanel` does **not** set `list-style: none`. Rendered as `<li>` it will show the
  list marker unless the consuming `<ul>` removes it. I did not add the rule because
  this TASK froze the component's spec and adding CSS it does not name is scope I do
  not own. Which do you want: (a) `GlassPanel` owns `list-style: none` so `as="li"` is
  self-contained, or (b) the list CSS in TASK-004 owns it? I have implemented neither.
  > answer: **(a) — `GlassPanel` owns `list-style: none`.** Rule: a component that
  > offers `as="li"` in its own prop union must render correctly under its own API;
  > a documented prop that needs undocumented consumer CSS to not misrender is a
  > trap. You were right not to add CSS this TASK did not name — so it is not
  > rework here. **The one line is added in TASK-004** (`GlassPanel.module.css`
  > `.panel { list-style: none; }`), where the first consumer lands; TASK-004 §What
  > to do now names it, so this TASK stays closed.
  >
  > Two things that travel with it, also written into TASK-004: any `<ul>` that
  > holds `as="li"` panels owns its own `margin`/`padding-inline-start` reset (that
  > is layout, not the panel's), and it must carry `role="list"` — Safari/VoiceOver
  > drops list semantics from a list whose items compute `list-style-type: none`.
  >
  > Scope note: **no task uses `as="li"` today.** TASK-004's stats row is
  > `as="div"` and capabilities is one panel, so nothing exercises this yet; the
  > rule is one line of insurance for the frozen prop union, not new work.

## Review

**Verdict: DONE** — reviewed 2026-08-30 by Sober. No rework. Every DoD item passes
and the three component contracts match SPEC-001 §Interface design property for
property.

### Re-verified by me, not taken on report

- **Quote strings.** My own script (independent of Fern's two), reading REQ-001 §R5
  and `eval`-ing the shipped array: `q1.th/en`, `q2.th/en`, `q3.th/en`, `q4.en` all
  **IDENTICAL**, same code-point lengths (48/79, 45/46, 90/130, 29); `q4` has no
  `th` key (`hasOwnProperty` false); zero U+2018/2019/201C/201D in any string value
  — the owner's straight `"` in q2/q3 survived. ids `q1,q2,q3,q4`.
- **Build.** `npx tsc --noEmit` → exit 0. `npm run build` re-run by me → `✓ Compiled
  successfully`, `✓ Generating static pages (10/10)`, 0 errors, 0 warnings.
- **Props frozen.** `GlassPanel`, `AuroraBackdrop`, `PullQuote` signatures are
  byte-for-byte the unions this TASK froze; defaults `as='div'` / `padding='md'` /
  `size='lead'` as written. No existing component's props were touched.
- **Token discipline.** No literal colour, no literal px padding, no repeated font
  stack in the three modules; every value reads a token that exists in `theme.ts`
  (`--site-glass-bg/-border/-glow`, `--site-aurora-1/-2/-3`) or `globals.css`
  (`--site-font-body`). `--site-cta-*` untouched, so SA-OWN-1 is not pre-empted.
- **Forbidden substrings.** `blur(` `@keyframes` `transition` `url(` `nowrap`
  `use client` → no match anywhere in the three folders, comments included.
- **Renders nowhere.** Repo-wide grep outside `components/ui/`: no page, section or
  config imports any of the three or `QUOTES`. The route table is unchanged bar
  `/` at 3.35 kB. DoD's "no visual change to any route" holds.
- **Append-only edits.** `types/app/content/index.ts` diff is `+7` at EOF and
  nothing else; `ui/index.ts` is a pure reorder + 3 additions, `ColorSchemeToggle`
  still exported.

### The five internal decisions — all confirmed

1. **q4 in the primary class** — correct. The English *is* the quote, not an
   orphaned translation.
2. **Colours** — confirmed, with numbers I measured rather than assumed:
   `--mantine-color-text` `#eceaf2` = **16.54:1** and `--mantine-color-dimmed`
   `#a9a3ba` = **8.11:1** on `#0b0916`; 7.50:1 for dimmed over a `GlassPanel` fill.
   All clear AA. ⚠ But see **SA-OWN-2** below — this holds on the ground and on
   glass, *not* over an `AuroraBackdrop` core.
3. **`color-mix` alpha in the module, hues in the theme** — correct, and the same
   mechanism `TechChip.module.css` already uses.
4. **Measure on the `<blockquote>`** — correct; `ch` must resolve at the quote's own
   size, and the `max(0.9375rem, 0.55em)` floor is a good catch.
5. **No CTA colour reached** — verified.

### Found in review, and it is MINE, not this TASK's work — SA-OWN-2

`PullQuote`'s translation line reads `--mantine-color-dimmed`, which SPEC-001 marks
AA — true on the page ground, **false over the aurora**. Composited upper bound at
the gradient cores: `#4130a6` (band) → dimmed **3.93:1**, `#5739cc` (hero) → dimmed
**3.02:1**, both under the 4.5:1 §Non-functional requires. The band's translation
computes ~22px at weight 400, so the large-text exemption does not apply. This is
SPEC-001's pairing, invented at design time; TASK-002 implemented exactly what it
was given and cannot be faulted for it. Recorded in SPEC-001 and on the board as
**SA-OWN-2**; it must land before TASK-004 places a `PullQuote` over an aurora.

> **CLOSED 2026-08-30** — answered in SPEC-001 §"CSS variables": a new
> `--site-quote-translation` (`obsidian[1]` `#d3cfdd`, 12.90 / 6.25 / 4.80) replaces
> `--mantine-color-dimmed` on `.translation`, and `dimmed` itself is left alone. The
> one-line `PullQuote.module.css` change lands in **TASK-004 §0**; this task is **not**
> reopened and its verdict stands. Correction to the finding above: on Home only the
> band quote exercises it — `q4` has no `th`, so the hero quote renders through
> `.primary`. Nothing is owed here.

### Noted, no action

The human has committed this work (`0211d44`) plus a later commit of his own
(`e9ec6d3`) adding `front/scripts/copy-standalone-assets.mjs` and a `postbuild` line
to `front/package.json`. That is his infra, not the team's — `npm run build` now
ends with `[postbuild] copied .next/static + public/ into .next/standalone`, which is
expected output, not a warning. TASK-005 should not report it as an unexpected diff.
