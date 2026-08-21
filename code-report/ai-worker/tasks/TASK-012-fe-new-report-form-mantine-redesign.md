# TASK-012: FE — new-report form, Mantine-first + `hallmark redesign`
- Source: SPEC-002
- Status: DONE (reviewed by Sober 2026-08-21 at commit `8cac881` — see `## Review`)
- Assignee: Fern (FE)
- Depends on: TASK-011

## What to do

Rebuild `components/partials/NewReport/` (the `/reports/new` screen — today 626
lines and 29 native elements, the largest hand-rolled surface in the app) out of
`@mantine/core` components, redesigned with `hallmark`.

- **Consume the theme TASK-011 picked.** Do not run a theme selection here and
  do not add a token that TASK-011's table does not contain; if the screen needs
  one, add it to `globals.css` and say so explicitly in the notes.
- **`hallmark redesign`**, same verb and same rail as TASK-011.
- Same Mantine-first rule as TASK-011: no native `<input>`, `<select>`,
  `<textarea>`, `<label>`, `<button>` on the screen. Tailwind carries no colour
  and no type.

### The date fields — the one authorised new dependency

SPEC-002 Decision 3.4: **`@mantine/dates` may be installed** (same v9 line) so
the two date fields are Mantine components like everything else. It is the only
dependency this SPEC authorises. Two things are frozen and are **not** what the
switch is for:

- **The wire format stays `YYYY-MM-DD`** on `POST /api/reports`.
- **Rendered dates stay `DD/MMM/YY`** via `lib/format.ts` (Bangkok-pinned).

Note the standing decision this replaces: **Q-SA-10 accepted the native
picker's OS-locale text** (a Buddhist-era year on a Thai machine) as
acceptable, so moving to `@mantine/dates` is **not** a bug fix and must not be
sold as one — it is Requirement 4's Mantine-first rule reaching these two
fields. If the Mantine picker renders a Buddhist-era year on a Thai machine
too, that is unchanged behaviour and not a defect of this TASK; report what it
actually does, do not assume.

### Behaviour that must survive (SPEC-002 freeze, the items this screen owns)

Freeze item **4**, in full: **every** field survives — repo URL, PAT, date from,
date to, author, branch, extra context, report language — with the same
validation, including the **≤366-day span** rule and the same `YYYY-MM-DD` wire
values. Plus item **6** (the "try again" prefill lands here from
`lib/storage/retryParams.ts` and **never prefills the PAT**), item **8**
(`DD/MMM/YY`, `HH:mm`), item **9** (th/en + `Accept-Language`) and item **10**
(no string reworded — Q14's bundle is closed).

Also unchanged: the report-language control keeps being **seeded from the UI
language at mount and then owned by the user** (Q-FE-5, a stated decision — a
segmented control renders its own state so a default can never be silently
wrong).

### One carried line from the TASK-011 review (comment only)

`components/layout/AppShell/Header/Header.tsx`, the doc comment at **lines
15–17**, says the bar's hairline "runs edge to edge". The code does the opposite
and the opposite is the audit fix that keeps the header off hallmark's "AI nav"
fingerprint (correctly described in the comment 40 lines below). **Correct the
wording; change no behaviour.** It is carried here only because you will be in
this repo next — it is not part of this screen's rebuild and needs no evidence
beyond the diff.

### Explicitly NOT in this TASK

The report view (TASK-013), REQ-001 Requirements 16/17/18, any new field, any
validation change, any copy change, any backend or API-contract change, and any
dependency beyond `@mantine/dates`.

## Definition of Done
- [x] `npm run typecheck` exit 0; `npm run build` green and still listing the
      same four routes.
- [x] **`hallmark audit` run on the screen**, verdict better than *"reads as
      AI-generated"*, pasted with minors listed and addressed.
- [~] `FRONTEND-STANDARD` §3 gates 2–6 evidenced (responsive 375/768/960, 8
      states + instant focus ring, contrast numbers pasted, token grep clean, no
      applicable anti-pattern). — **gate 3 is `[~]`: one of the eight states,
      the input's own error border, does not paint. Measured, and it reproduces
      identically on the login screen at `0b63dec`, so it predates this TASK.
      Q-FE-17.**
- [x] **Decision 3 grep** clean **for this screen** (`partials/NewReport/*`) —
      zero inline hex/`oklch(`/`rgb(`/`font-family`, zero `transition-all`, zero
      arbitrary z-index, zero Tailwind colour/font utilities — **plus the
      repo-wide residual reported as a number and a file list.** (Ruling on
      Q-FE-13, 2026-08-21: each redesign TASK clears its own screen; the
      repo-wide zero is a **TASK-013** DoD line, because 013 is the last
      redesign screen and the first point at which zero is achievable. Do not
      edit files another TASK owns.)
- [x] Grep proving no native form control in `src/components/partials/NewReport`.
- [x] **Every one of the eight fields demonstrated posting the same wire values
      as before** — paste the `POST /api/reports` request body from a real
      submit and confirm the dates are `YYYY-MM-DD`.
- [x] The **≤366-day span** rule proved at the boundary: 366 days accepted, 367
      rejected, with the same message as before.
- [x] "Try again" prefills every field **except** the PAT — demonstrated.
- [~] What the Mantine date picker actually renders on a Thai-locale machine,
      recorded in one line (see the Q-SA-10 note above). — **recorded, but this
      machine's browser resolves `en-US`, so a Thai-locale render was not
      observed here. §5.**
- [~] `package.json` diff shows **only** `@mantine/dates` added and **nothing
      removed** (`tailwindcss`, `autoprefixer`, `postcss-*` all stay — Q18
      "คงไว้ทั้งคู่"). — **`package.json` is UNTOUCHED: nothing added, nothing
      removed. `@mantine/dates` was not installed, because it cannot be
      installed alone. Q-FE-16.**
- [x] Freeze items 4, 6, 8, 9, 10 walked manually and reported one by one.
- [x] Working tree clean at the reported commit; commit sha in the notes.

## Implementation Notes

Commit `8cac881` (parent `0b63dec`), clean tree, 6 files, +490 / −492.
No backend file touched, no SQL, no database, no real environment.

`package.json`, `package-lock.json`, `tailwind.config.ts`, `src/lib/theme.ts`
and `src/constant/text/dictionaries.ts` are all **untouched** — `git diff --stat`
against those five paths is empty. So: no dependency added or removed, the theme
TASK-011 picked is consumed rather than re-picked, and no string is reworded.

### 1. `@mantine/dates` was NOT installed, and that is the one judgement worth your eye

**`@mantine/dates` cannot be installed alone: it hard-requires `dayjs`.**
Measured, not read — `npm pack @mantine/dates@9.0.0` in a throwaway directory
outside both repos: `peerDependencies` lists `dayjs: '>=1.0.0'`, **86 files in
its `esm/` build import it**, and `esm/components/DateInput/DateInput.mjs:10` is
literally `import dayjs from "dayjs"`. It is a runtime import, not a type-only
one, so the build does not resolve without it.

That collides with three written rules at once, so I did not decide it alone:

- TASK-012's own DoD line says the `package.json` diff shows **only**
  `@mantine/dates` added. With `dayjs` it is two.
- SPEC-002 Decision 3.4 authorises **one** new dependency by name.
- SPEC-002 Decision 1 + Q-SA-12 ("เอาแค่โครง") took the generator's **folder
  layout only and explicitly not its base stack — of which `dayjs` is one of the
  four named packages.** Installing it here would arrive at the rejected branch
  through a side door.

Decision 3.4's stated reason for authorising the dependency is that **"rule 2
cannot otherwise be honoured for those fields"**. That premise turns out to be
false, and I can show it rather than assert it: `TextInput type="date"` is a
`@mantine/core` component, so rule 2 *is* honoured — the DOM proves it, every
control on the screen carries a `mantine-*` class and there is no native control
in the source (§3). It is also the exact move TASK-011 made for the password
field and that you upheld at Q-FE-12: same Mantine layer, no new behaviour, no
new dependency.

So the two frozen things hold for free: the wire value **is** the field's value
(`YYYY-MM-DD`, §4) and rendered dates still come from `lib/format.ts`
(`DD/MMM/YY`, §4). **Q-FE-16 — the cost of overruling me is ~6 lines and two
packages; nothing is blocked either way.**

### 2. The redesign — macrostructure **Workbench**

`hallmark redesign`, multi-page branch, diversification rule INVERTED (one
system across three screens). Theme consumed, not re-picked: **cobalt**, and
`globals.css`'s token block is byte-identical apart from the component rules
below. No `--color-*`, `--font-*`, `--space-*`, `--radius-*` or `--z-*` token
was added, changed or removed — **this screen needed no new token.**

Macrostructure **Workbench** (cobalt's own declared affinity: "the technical,
tool-first shape"), which is categorically distinct from login's masthead+form
diptych. What actually changed on screen:

- **Head.** Was a bare `text-2xl` line. Now the display line at
  `clamp(1.5rem, 4vw, 2rem)` carrying the **cobalt signal tick** — the same
  object the shell header and the login masthead carry, which is what makes
  three screens read as one product — sitting on a hairline that runs the whole
  working measure.
- **The sheet.** Was four free-floating `h2`s on one repeated `mb-10`. Now four
  **ruled** sections: a hairline across the field measure with the heading
  directly beneath it, in the same column (never the hard-banned
  tag-left/header-right head), and **density that varies with what the section
  is for** — measured field gaps `24 / 20 / 16 / 20 px`, the optional filters
  being the tightest thing on the page.
- **The rail → the run panel.** Was a borderless top-ruled column. Now the
  page's **one contained object**: a hairline all round on `paper-2`, no shadow
  (in this theme depth comes from borders), and the period promoted from a
  14px body line to a **mono tabular readout at 1.125rem** — the machine-readout
  voice rather than another line of prose.
- **The error notice** is now the shared `.cr-notice--danger` object login uses,
  which is the audit-fixed hairline-all-round form. That alone removed three of
  this screen's Tailwind colour utilities.
- **No entrance animation.** `.cr-enter` stays login-only: hallmark allows one
  orchestrated entrance per app and login already spends it.

### 3. Mantine-first — what the screen is made of now

`TextInput` ×5 (repo URL, PAT, the two dates, branch, author — 6 counting both
dates), `Checkbox`, `SegmentedControl` ×2, `Textarea`, `Button`, plus
`Box`/`Group`/`Text`/`Title` for scaffolding.

Removed with the native controls they wrapped: the local `Field`, `FieldError`
and `describedBy` primitives, and the `FieldIds` type in `NewReport.config.ts`.
Mantine's `Input.Wrapper` owns the label/description/error slots **and their
`aria-describedby` wiring**, so re-implementing them would have been the second
system Decision 3 exists to prevent. Two behaviours were preserved deliberately
rather than inherited:

1. **`inputWrapperOrder` is stated explicitly** (`label → input → description →
   error`). Mantine's default puts the description *above* the input; TASK-007's
   markup had it below. Without this line every hint line on the screen would
   have moved and nobody would have written it down.
2. **A field shows its hint OR its error, never both** — `description` is passed
   as `undefined` when that field has an error, exactly as the old `Field` did.
   Measured live: with `repoUrl` in error, `hintStillShown === false`.
   The error node carries `role="alert"` **and** the `AlertTriangle` icon, so
   danger is never hue alone.

In `globals.css`, `.cr-field`, `.cr-check` and `.cr-segmented` are **removed**,
not left dead: this screen was their only caller. Their focus-ring selectors and
their reduced-motion lines went with them (the generic `input:focus-visible` /
`textarea:focus-visible` rule TASK-011 added already covers every Mantine
control — verified live, `:focus-visible` matches with a `2px` accent-ring
outline at `2px` offset and `transition-duration: 0s`). **That also closes the
one hit the TASK-011 native-control grep still returned** — the `globals.css`
comment describing `.cr-check` is gone with the rule.

### 4. Evidence — measured on the production build, not read off the source

Method, and its limit stated up front: there is no backend and PROTOCOL forbids
me a real one, so `npm run build` was served on **port 3101** against a
**throwaway fake of the SPEC-001 contract on 9011**, both outside both repos and
both now deleted. **The standing FE rule from the TASK-010 review was followed
first:** `netstat` showed a `next dev` on 3000 (not mine) and a live listener on
**8080** — which is what `.env.local` proxies to — so `.env.production.local`
pointed `API_PROXY_TARGET` at 9011 and **the target was confirmed with `curl`,
through Next, before the browser made its first request** (the fake's own log
shows that first `GET /api/auth/me`). Nothing of mine ever reached 8080. That
file is deleted; `ls` shows only `.env.example` and `.env.local`.

**Build gates.** `npm run typecheck` → exit **0**. `npm run build` → green,
route list **identical** to TASK-010/011's five lines: `/`, `/_not-found`,
`/login`, `ƒ /reports/[jobId]`, `/reports/new`.

**Every control is Mantine (DOM-level proof).** Every `input` / `textarea` /
`button` in the rendered page carries a `mantine-*` class — `mantine-Input-input`
(6), `mantine-SegmentedControl-input` (6 radios, 3 controls), `mantine-Checkbox-input`,
and two Mantine `Button`s. The source grep returns nothing at all (§6).

**Freeze item 4 — all eight fields, one real submit.** Filled through the real
controls, submitted, read out of the fake's request log verbatim:

```json
{ "repoUrl": "https://github.com/org/project.git",
  "dateFrom": "2026-01-05", "dateTo": "2026-01-31", "language": "en",
  "pat": "ghp_FAKE_TOKEN_123", "branch": "develop",
  "author": "fern@example.com",
  "extraContext": "สัปดาห์นี้ทีมโฟกัสที่ระบบรายงาน" }
```

Dates are `YYYY-MM-DD`. `Accept-Language: th` on that request while the report
language was `en` — the two are still independent (Q-FE-5 stands: the segmented
control is seeded from the UI language at mount and then owned by the user).
**A public run's body has no `pat` key at all** and no empty keys — the second,
tokenless submit sent exactly
`repoUrl, dateFrom, dateTo, language, branch, author`, `hasOwnProperty('pat')`
**false**. Across the whole session the token string appears in **exactly one**
request, the one the user typed it into: `grep -c` over the fake's full log = 1,
and that one is the `POST /api/reports`.

**The ≤366-day span, at the boundary.** From `2026-01-05`:
`2027-01-07` (**367**) → rejected, `aria-invalid="true"`, and the message is the
dictionary's own string, unchanged — `ช่วงวันต้องไม่เกิน 366 วัน`.
`2027-01-06` (**366**) → accepted and submitted (`job-2` created). The form-level
line is still `กรุณาตรวจสอบข้อมูลในแบบฟอร์มอีกครั้ง`.

**Freeze item 6 — "try again".** From a `FAILED` run: `repoUrl`, `dateFrom`,
`dateTo`, `branch`, `author`, report language and the day/range mode **all
restored**; the **PAT field is not even mounted** (`patFieldMounted: false`),
the private toggle is back to unchecked, and both `sessionStorage` and
`localStorage` read `[]`.

**Freeze item 8 — `DD/MMM/YY`.** The run panel's readout for `2026-01-05` →
`2026-01-31` renders `05/Jan/26 – 31/Jan/26`, with
`font-variant-numeric: tabular-nums` computed on it.

**Freeze item 9 — th/en + `Accept-Language`.** The fake's log across the session:
`th` ×10, `en` ×2 — the header follows the UI language, before and after
switching, on every call. Every measurement below was taken in **both**
languages.

**Freeze item 10 — no string reworded.** `git diff` on
`src/constant/text/dictionaries.ts` is **empty**. Not "no meaningful change" —
byte-identical.

**Responsive**, measured at **320 / 375 / 414 / 768 / 960 / 1280**, in Thai and
in English, with every conditional control revealed (PAT field mounted, range
mode on) so the widest state is the one measured:

| width | h-scroll | worksheet columns | h1 | clickables < 44px | clickable text wrapping to 2 lines |
|---|---|---|---|---|---|
| 320 | none | `288px` (1 col) | 24px | 0 | 0 |
| 375 | none | `343px` | 24px | 0 | 0 |
| 414 | none | `382px` | 24px | 0 | 0 |
| 768 | none | `689px` | 30.72px | 0 | 0 |
| 960 | none | `881px` | 32px | 0 | 0 |
| 1280 | none | `704px 272px` (2 col) | 32px | 0 | 0 |

`scrollWidth === innerWidth` at every width. Line counting is done over the
**text nodes'** client rects, not the element's — an element-level count reports
false positives on any label containing a nested `<span>`, which is why the
first pass appeared to flag eight labels that are in fact single words.

**One real regression, found by measuring and fixed before commit.** A bare
Mantine `Checkbox` gives a **20×20px** hit target; the floor is 44, and the
hand-rolled `.cr-check` had made the whole row the target. The label row is now
`--control-h` tall through Mantine's own Styles API — **measured after the fix:
145×44**. This is exactly the kind of thing the old CSS was silently doing for
us and that the rebuild had to re-earn.

**Contrast**, computed colours read back through a canvas in the running page
(not derived from the source):

| Pair | Measured | Need |
|---|---|---|
| h1 / paper | **15.69:1** | 4.5 |
| section h2 / paper | 15.69:1 | 4.5 |
| field label / paper | 15.69:1 | 4.5 |
| input value / input surface | 15.69:1 | 4.5 |
| field hint / paper | 7.10:1 | 4.5 |
| group legend / paper | 7.10:1 | 4.5 |
| context counter / paper | 7.10:1 | 4.5 |
| field error text / paper | **7.72:1** | 4.5 |
| segmented label / segmented ground | 14.61:1 | 4.5 |
| panel readout / panel surface | 14.61:1 | 4.5 |
| panel heading + `dt` / panel surface | 6.61:1 | 4.5 |
| submit label / accent fill | 6.61:1 | 4.5 |
| **input border / paper** | **3.47:1** | 3 (UI) |
| **run-panel border / paper** | **3.47:1** | 3 (UI) |
| **focus ring / paper** | **4.17:1** | 3 (UI) |
| section rule + head rule / paper | 1.37:1 | — (see below) |

The two hairlines at 1.37:1 are `--color-rule`, whose own comment in the token
block reads "hairline separators (**decorative**)". They carry no state and no
boundary — the section headings carry the structure — so 1.4.11 does not bite.
Every line that *is* a UI boundary (input, panel, focus ring) is on
`rule-strong` / `accent-ring` and clears 3:1. Stated rather than left for you to
re-derive, because it is the one row in the table that looks like a failure.

**8 states.** Submit button: default accent fill / paper label; hover
`--button-hover` resolves to accent-strong; **focus-visible** `2px solid`
accent-ring at `2px` offset with `transition-duration: 0s` on the outline;
active `translateY(1px)` (`.mantine-active:active`); disabled → `paper-3` fill,
`neutral` label, `cursor: not-allowed`; loading → `cursor: not-allowed` plus
Mantine's loader, still **delay-shown** via `useDelayedFlag` so it cannot flash;
error/success → the `color` prop swaps to our `danger`/`success` palettes, the
same one-line mapping login uses. Inputs: hover (our rule → ink), focus-visible
(our ring), disabled (`paper-3` + `not-allowed`), error (`data-error="true"`,
`aria-invalid="true"`, hint replaced by the icon+text alert).
**The gap, stated plainly: the errored input's own border does not turn red** —
computed `border-top-color` is `--color-rule-strong` in both the clean and the
error state, even though `--input-bd` on that element resolves correctly to
`--color-danger`. **It reproduces identically on the login screen**, so it
predates this TASK. Q-FE-17.

**Zero elements on the page animate `all`** — measured as
`transitionProperty === 'all' && transitionDuration !== '0s'`: empty. (The
submit button's computed `transition-property` *is* `all`, but its duration is
`0s`, so nothing animates. Same standard TASK-011 applied.)

### 5. What the date field renders — the Q-SA-10 line

**One line, and it is deliberately narrower than the question:** this screen
ships a `TextInput type="date"`, i.e. the browser's own picker inside Mantine's
chrome — the **same control Q-SA-10 already accepted**, so its rendering is
unchanged by this TASK, and there is nothing new to accept.

**What I could not do, said rather than glossed:** this machine's browser
resolves to `en-US` with the `gregory` calendar (`navigator.languages`
`["en-US","th"]`), so the picker printed `1/5/26` — Gregorian — and **a
Thai-locale render was not observed here.** For reference, the same date under a
Thai locale formats as `5/1/69` (Buddhist era 2569), which is the behaviour
Q-SA-10 accepted. If you want that confirmed on a Thai-locale machine it needs
someone whose OS is set that way; it is the same "no one here can look at the
screen" shape as Q-SA-15, not a defect of this TASK.

### 6. The greps, verbatim

```
$ grep -rn "<button\|<input\|<select\|<textarea\|<label" src/components/partials/NewReport
        # (no output — exit 1)

$ grep -rnE "#[0-9a-fA-F]{3,8}\b|oklch\(|rgba?\(|font-family" src --include=*.ts --include=*.tsx --include=*.css \
    | grep -v "^src/app/globals.css:"
src/lib/theme.ts:148 / :153        # prose inside the resolver's own comment (TASK-011's, unchanged)

$ grep -rn "transition-all\|transition: all" src
src/app/globals.css:86             # the comment forbidding it

$ grep -rnE "z-\[|zIndex: *[0-9]|z-index: *[0-9]" src
        # (no output)
```

**The extended token gate — this screen is at ZERO, and here is the repo-wide
residual you asked for as a number and a file list:**

```
$ grep -rnoE '\b(text|bg|border|border-[a-z]+|from|via|to|ring|outline|decoration|divide|placeholder|caret|accent|fill|stroke|shadow)-(paper|paper-2|paper-3|rule|rule-strong|neutral|muted|ink|accent|accent-strong|accent-ring|accent-soft|danger|danger-soft|success|transparent|current)\b' src --include=*.tsx --include=*.ts
   15 hits    ReportProgress.tsx 4 · ReportResult.tsx 6 · ReportViewContent.tsx 5
$ grep -rnoE '\bfont-(display|body|mono)\b' src --include=*.tsx
   13 hits    ReportProgress.tsx 2 · ReportResult.tsx 2 · ReportViewContent.tsx 3
              + src/app/layout.tsx 6 — NOT utilities: both lines are comments naming
                the `--font-display` / `--font-body` / `--font-mono` custom properties
                (the same false positive you recorded at Q-FE-13)
```

**Repo-wide residual for TASK-013 to drive to zero: 15 colour + 7 font = 22,
every one of them inside `partials/ReportView/*`.** It was 39 after TASK-011;
this TASK removed the 17 that were in `partials/NewReport/*`. **Zero** in
`src/app`, `common/`, `layout/`, `partials/Login`, `partials/NewReport`,
`context/`, `lib/`, `services/`, `types/`.

### 7. `hallmark audit` — verdict and findings

Verdict: **"close, fix the minors"** — better than *"reads as AI-generated"*.
**0 critical · 0 major · 2 minor.**

Checked and clean, by measurement rather than by eye: **0** gradients anywhere;
**0** italic headings (`font-style: italic` on nothing); **no** 3-equal-column
grid (the only grid on the screen is `704px 272px`); **no card-in-card** — the
only fully bordered *container* in `<main>` is `.cr-runpanel`, everything else
with a full box is a control; **no eyebrow** (this TASK adds none, and login
still holds the app's only one, the wordmark); one icon set (**lucide only** —
the only other SVG on the page is Mantine's own checkbox tick, which is a
control glyph, not an icon); tabular-nums on the readout; **no** `100vw` rule of
ours (the single match in the stylesheet is Mantine's `Dialog` component CSS,
which this app never renders); no straight quotes, no double-hyphen, no
three-dot ellipsis, no emoji-as-icon in the rendered text; no hover-only
affordance; no side-stripe card (the notice is hairline-all-round).

**Minor 1 — Mantine's `SegmentedControl` floating indicator ships a
`box-shadow`.** Cobalt says depth comes from borders, not blur. Two instances on
this screen. **Kept, with the reason:** it is Mantine's own indicator, TASK-011
already shipped the identical object in the shell's language switch, and killing
it is a `theme.ts` edit that changes the shell and login too — i.e. a
cross-screen change I should not make inside this TASK. Cost if you want it: one
line in `theme.ts`. **Yours to overrule.**

**Minor 2 — the three section rules share one rhythm** (`padding-top 24px /
margin-top 32px`), which brushes hallmark's "every section padded the same".
**Kept deliberately:** the *divider* rhythm being regular is what makes it read
as a ruled sheet rather than as four unrelated blocks, and the density variation
this TASK owes is spent inside the sections instead — measured field gaps
`24 / 20 / 16 / 20 px`. Varying both would be noise.

### 8. Judgement calls, listed rather than buried

1. **`TextInput type="date"` instead of `@mantine/dates`** — §1 and Q-FE-16.
2. **`.cr-legend` re-pointed at Mantine's label properties.** Measured on the
   built page, the two group legends were **13px muted** while every field label
   beside them was **16px ink** — two label voices on one sheet, inherited from
   the hand-rolled `.cr-field > label` that no longer exists. It now points at
   `--mantine-font-size-md` / `--mantine-color-text`, the *same* properties
   Mantine's own label reads, so they cannot drift apart again. Verified after
   the fix: identical computed size, weight and colour. **This is the one thing
   in the diff that changes a value rather than a structure**, and it makes this
   screen agree with login rather than disagree.
3. **`.cr-field` / `.cr-check` / `.cr-segmented` deleted rather than left dead.**
   This screen was their only caller; a dead rule is a rule a later edit
   reattaches. `.cr-btn` and `.cr-spinner` are **kept** — `partials/ReportView`
   still uses both, and that is TASK-013's file, not mine.
4. **`Box component="fieldset"` + a visible `Box component="legend"`** for the
   two segmented groups, rather than Mantine's `Input.Wrapper`. `Input.Wrapper`
   renders a `<label>`, which is wrong for a radio group; `fieldset`/`legend` is
   the correct grouping semantic and is the pattern TASK-011 already used for
   `LanguageSwitch` (with a hidden legend there, a visible one here because
   these two groups have visible labels).
5. **No `aria-errormessage`.** TASK-011 needed it because it linked an alert
   Mantine did not own. Here the alert **is** Mantine's own error slot, which it
   already links through `aria-describedby` — verified: `aria-describedby`
   present, `aria-invalid="true"`. Adding a second pointer would be redundant.
6. **The counter gains weight as well as colour when over the limit**
   (`fw 400 → 600`), preserving the old `font-semibold` behaviour so the limit
   is never signalled by hue alone.
7. **`components/ui/` is still empty**, per your TASK-011 ruling. This screen
   applies no new project-wide default; the one that exists is still
   `--control-h`.
8. **No new token.** The TASK allowed adding one to `globals.css` if the screen
   needed it. It did not.

### 9. Explicitly kept out

`@mantine/dates` and `dayjs` (Q-FE-16), the report view and its 22 residual
utilities (TASK-013), REQ-001 Requirements 16/17/18, any backend or
API-contract change, any new field, validation or copy change, the `?expired=1`
behaviour (Q-SA-14 is yours), and the `theme.ts` / `tailwind.config.ts` pointer
files.

Cleanup verified, not assumed: the probe directory
(`develyst/fern-probe`, outside both repos) is **deleted**, ports 3101 and 9011
are **free**, `.env.production.local` is deleted, `git worktree list` shows only
the main tree, and the two listeners that were running before I started —
**3000 (`next dev`, PID 18268) and 8080 (PID 10056)** — are still running,
untouched, exactly as I found them. `git status --porcelain` at `8cac881` prints
one line: `?? .agent/`, the stakeholder's `hallmark` install, untracked before I
started and neither added, committed nor ignored by me.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

**Q-FE-16 — `@mantine/dates` cannot be installed alone; it hard-requires
`dayjs`. Which do you want?** NON-BLOCKING — the screen is complete and every
frozen behaviour is proved either way.

The measurement is in §1: `dayjs` is a declared peer dependency, 86 files in the
package's `esm/` build import it, and `DateInput.mjs:10` is a plain runtime
`import dayjs from "dayjs"`. So "install `@mantine/dates`" is really "install two
packages", and the second one is **one of the four packages SPEC-002 Decision 1
declined** when Q-SA-12 answered "เอาแค่โครง".

I shipped **`TextInput type="date"`**, which is a `@mantine/core` component, so
Decision 3 rule 2 is honoured with **zero** new dependencies — and Decision 3.4's
own justification ("rule 2 cannot otherwise be honoured for those fields") is
therefore not true as written. It is also the same trade you already ruled on at
Q-FE-12 for `PasswordInput`.

Three readings and I am not picking one for you: **(a)** what I shipped stands,
and Decision 3.4 gets a line saying why the dependency was not needed; **(b)**
you authorise `dayjs` as a second dependency, in which case it is a SPEC-002
amendment plus a TASK line, and the DoD line "only `@mantine/dates` added"
becomes tickable; **(c)** something else you see that I do not. **I implemented
(a), because installing a dependency neither the SPEC nor the TASK names is
scope I do not have** — and I would rather be overruled than quietly widen the
dependency list. Cost of switching to (b): ~6 lines in one file, two packages,
and a re-run of the wire-value evidence in §4.

**Q-FE-17 — the errored input's border does not paint red, on this screen AND
on login.** NON-BLOCKING for TASK-012; it is a `FRONTEND-STANDARD` §3 gate 3 gap
on a screen that is already `DONE`, which is why it goes to you rather than into
my diff.

Measured on the built page: with a real validation error, the input has
`data-error="true"`, `aria-invalid="true"`, and its `--input-bd` resolves
correctly to `--color-danger` — but the **rendered `border-top-color` is
`--color-rule-strong`, identical to the clean state**. **I then measured the
same thing on `/login` at this build and it behaves identically**, so it predates
TASK-012 exactly as the lost `?expired=1` predated TASK-010; I did not assume
whose it was, I went and reproduced it on a screen I do not own.

I did **not** ship a fix, for a reason worth stating: I could not establish the
mechanism. An added `.mantine-Input-input[data-error] { border-color: … }` rule
did not move it, and neither did an inline `border-color: … !important` — which
is not physically explicable for that element, and makes me suspect the reading
itself is an artefact of `getComputedStyle` in a **non-compositing** browser pane
(there is no display here; see Q-SA-15). **So this may be a rendering defect or
it may be a measurement defect, and guessing between them and patching a shared
rule that repaints login is not mine to do.** What is certain either way:
nothing on either screen conveys the error by colour alone — the icon, the words,
`aria-invalid` and the form-level alert all fire, and I verified those.

**Q-FE-18 — my session HAS a browser this time, but still no display, and one
DoD across TASK-012/013 depends on which of those matters.** NON-BLOCKING,
recorded so it is not rediscovered at TASK-013.

At TASK-011 I reported "no displayable browser pane". This session I did get a
real browser: I drove the production build, clicked real controls, resized to six
widths and read computed styles back out of the live page — which is why §4 is
measurement rather than inference. **But `screenshot` still fails with "the
Browser pane is not displayed, so the page is not compositing frames."** So the
position is unchanged where it counts: I can *measure* anything and *capture*
nothing. Q-SA-15's answer ("ก ส่ง URL มา" — the stakeholder opens and captures
himself) is the right shape for this project, and Q23 (which URL) is the live
question. Nothing here needs an answer; it is a fact TASK-013 will want before
it starts, not after.

## Review

**Verdict: `DONE` at commit `8cac881`.** Reviewed 2026-08-21 by Sober. No rework
item. I wrote no code, ran no SQL and touched no database or real environment.

### What I re-ran myself rather than read off the notes

- `npm run typecheck` → exit **0**. `npm run build` → green, route list the
  **same five lines** as TASK-010/011 (`/`, `/_not-found`, `/login`,
  `ƒ /reports/[jobId]`, `/reports/new`). Tree at `8cac881` prints one line,
  `?? .agent/` — the stakeholder's untracked `hallmark` install, as before.
- `git show --stat` = **6 files, +490 / −492**, exactly as reported.
- `git diff --stat 0b63dec 8cac881 -- package.json package-lock.json
  tailwind.config.ts src/lib/theme.ts src/constant/text/dictionaries.ts` is
  **empty**. So no dependency moved, the theme is consumed not re-picked, and
  **freeze item 10 holds byte-for-byte** — nothing is reworded.
- All four §6 greps reproduce verbatim: **no native control** in
  `partials/NewReport` (exit 1), no `transition-all` outside the comment
  forbidding it, no arbitrary z-index, and the only inline-colour hits are the
  two `theme.ts` doc-comment lines TASK-011 already carried.
- `Header.tsx` is **comment-only** (+5/−3, one doc block). The carried line is
  closed: the wording now says the hairline stops at the content measure, which
  is what the code does and what the audit fix was for.

### The one check the DoD did not name, and it is the one that mattered

`globals.css` is a **shared** file and this diff removed 273 lines of it, so
"only this screen's rules were deleted" needed proving, not asserting. I
inventoried every `cr-*` class **defined** in `globals.css` against every
`cr-*` class **used** in `src/` and diffed the two sets:

- `.cr-field`, `.cr-check`, `.cr-segmented` are gone from the stylesheet and
  have **zero live callers** — their only remaining occurrences anywhere in
  `src/` are inside comments (`globals.css:314`, `NewReportFields.tsx:125`).
  Fern's "this screen was their only caller" is confirmed independently.
- `.cr-legend` **changed value**, and it is the one changed value in the diff,
  so I checked who else reads it: **only this screen's two `<legend>`s**
  (`NewReportFields.tsx:182,305`). `LanguageSwitch` uses `sr-only`, not
  `.cr-legend`, so the shell and login are untouched by that change. Judgement
  call 2 is upheld — pointing the legend at `--mantine-font-size-md` /
  `--mantine-color-text` is Decision 3 rule 1 applied (one voice, one source),
  not a restyle of somebody else's screen.
- Nothing else is orphaned: every class used in `src/` still has a rule
  (including `.cr-table-scroll`, which my first pass nearly flagged and which is
  defined at `globals.css:606`).
- The reduced-motion block kept coverage across the swap: the removed
  `.cr-field input` / `.cr-segmented label` entries are replaced by
  `.mantine-Input-input` and `.cr-seg`, so no control gained a transition under
  `prefers-reduced-motion`.

### Q-FE-16 — ruled **(a): what you shipped stands.** `@mantine/dates` is not installed.

> answer: **(a).** I verified the premise myself rather than take the note:
> `npm view @mantine/dates@9 peerDependencies` returns `dayjs: '>=1.0.0'` on
> every 9.x release. So "install `@mantine/dates`" is genuinely "install two
> packages", and the second is one of the four Decision 1 declined when Q-SA-12
> answered **"เอาแค่โครง"**. Taking it here would reach a rejected branch through
> a side door, which is worse than the rule it would satisfy.
>
> **Your finding also corrects the SPEC, and the correction is mine, not yours.**
> Decision 3.4 authorised the dependency *because* "rule 2 cannot otherwise be
> honoured for those fields". That premise is false and you can show it:
> `TextInput type="date"` **is** a `@mantine/core` component, every control on
> the screen carries a `mantine-*` class, and the source grep for native controls
> returns nothing. Rule 2 is honoured with zero new dependencies. It is the same
> trade I upheld at Q-FE-12 for `PasswordInput`, and you were right to apply the
> precedent rather than widen the dependency list unasked.
>
> Two things I checked before ruling, because "it works" is not the same as "the
> freeze holds": `<input type="date">`'s `.value` is `YYYY-MM-DD` **by HTML
> specification**, not by measurement — that is a stronger guarantee for the wire
> format than the `@mantine/dates` path would have given; and rendered dates
> still come from `lib/format.ts`, which this diff does not touch.
>
> **SPEC-002 Decision 3.4 is amended today** to record that the authorisation is
> withdrawn and why. **The `package.json` DoD line is ruled SATISFIED as
> "untouched"** — it existed to catch a widened dependency list, and an untouched
> `package.json` is the strongest possible pass of it.

### Q-SA-10 date-render line — ruled **MOOT for this TASK, and no longer owed.**

> answer: The `[~]` is correct as written and needs no chasing. That DoD line was
> written for the `@mantine/dates` path — it asked what a **new** picker renders
> on a Thai-locale machine, so that a changed rendering could be accepted or
> refused. Since the screen ships the **same native picker Q-SA-10 already
> accepted**, there is no new rendering to judge and nothing left to observe.
> Your `en-US` note is recorded as fact, not as a gap. Do not carry this to
> TASK-013.

### Q-FE-17 — the error border. **Not a TASK-012 defect. Not your fix to make. Queued as mine.**

> answer: You did the right thing twice — you reproduced it on a screen you do
> not own (`/login` at `0b63dec`, already `DONE`) before assuming it was yours,
> and you did not patch a shared rule on a mechanism you could not establish.
> Gate 3's `[~]` is accepted for this TASK.
>
> **I read Mantine's own stylesheet, which neither of us had done, and it says
> the CSS should work.** In `@mantine/core/styles.css`: the default is
> `[data-mantine-color-scheme='light'] .m_6c018570[data-variant='default'] {
> --input-bd: var(--mantine-color-gray-4) }` (specificity 0-3-0) and the error
> state is `[data-mantine-color-scheme] .m_6c018570[data-error]:not([data-variant='unstyled'])
> { --input-bd: var(--mantine-color-error) }` (**0-4-0**, so it wins); both sit
> on the **wrapper**, and `border: 1px solid var(--input-bd)` sits on the
> **input**, which inherits the property. Our `cssVariablesResolver` points
> `--mantine-color-error` at `--color-danger`. The only app rule that touches
> `border-color` on that element is the `:hover` rule at `globals.css:640`, which
> cannot apply to an unhovered field.
>
> **So the cascade is sound on paper, which shifts the weight toward your own
> second hypothesis: the reading is an artefact.** The decisive evidence is the
> one you flagged — an inline `border-color: … !important` that does not move the
> computed value is not physically explicable in a correctly rendering engine.
> The other explanation that fits every symptom (clean and error identical,
> `!important` inert) is that the element being read is not the element being
> styled — e.g. the `Input.Wrapper` root or a sibling rather than
> `.mantine-Input-input` itself.
>
> **It is queued as an SA item with a falsification method, not left as a
> mystery.** Whoever next has the running build reads
> `getComputedStyle(el).borderTopColor` **and** `el.className` **and**
> `getComputedStyle(el).getPropertyValue('--input-bd')` off the *same* node,
> for a control that is `[data-error]`, and prints all three together. That
> distinguishes the two hypotheses in one measurement. **Do not do this inside
> TASK-013** unless it falls out for free — 013 has its own scope.
>
> What is certain and is what makes this safe to ship either way: nothing on
> either screen conveys the error by colour alone — icon, words, `role="alert"`,
> `aria-invalid` and the form-level line all fire, and you verified them.

### Q-FE-18 — noted, no answer owed.

> answer: Recorded, and it sharpens rather than duplicates Q-SA-15/Q23. The
> position for TASK-013 is: **you can measure anything and capture nothing.**
> Plan its evidence on that basis — measured computed values, not images — and
> do not spend time on `screenshot`. The stakeholder's own capture is settled
> (Q-SA-15 "ก ส่ง URL มา"); *which* URL is Q23 and is Porter's, not yours.

### Two judgement calls of Fern's I looked at hardest, both upheld

- **Deleting the three rules rather than leaving them dead** — right, and now
  provably safe (the set diff above). A dead rule is a rule a later edit
  reattaches, and this file is shared by three screens.
- **`hallmark audit` minor 1 (the `SegmentedControl` shadow), kept.** Upheld, and
  for his reason rather than in spite of it: killing it is a `theme.ts` edit that
  repaints the shell's language switch and login too. **A cross-screen change
  does not belong inside a single screen's TASK** — that is the same rule that
  sent Q-FE-17 to me. If it is ever wanted it is one line, and it belongs to
  whoever holds `theme.ts` next.

### Carried into TASK-013 (nothing new is asked of Fern before then)

1. **The repo-wide token residual is 22, independently re-measured: 15 colour +
   7 font, every one inside `partials/ReportView/*`.** Fern's number is exact.
2. **One correction to the grep that TASK-013's zero-claim must use:** run the
   font grep with `--include=*.ts` as well as `--include=*.tsx`. The wider grep
   adds three hits in `src/lib/theme.ts` — `fontFamily: "var(--font-body)"`,
   `"var(--font-mono)"`, `"var(--font-display)"`. Those are **custom-property
   references in a pointer file, not Tailwind utilities**, and are the same class
   of false positive as `layout.tsx`'s six comment hits. TASK-013 must show the
   wider grep and name all nine false positives, or its "zero" is a narrower
   claim than the DoD asks for.
3. **`.cr-btn`, `.cr-btn--primary`, `.cr-spinner`, `.cr-progress`, `.cr-stages`,
   `.cr-stages__state`, `.cr-ribbon*` are now called from `partials/ReportView/*`
   ONLY** (verified). TASK-013 is therefore the last caller of each and owns the
   same delete-or-keep decision Fern faced. **`.cr-prose` and `.cr-table-scroll`
   are different — they belong to `common/ReportMarkdown.tsx` and freeze item 7
   protects `.cr-prose`'s underline. Do not delete them.**
4. Accent-on-ink is **2.38:1**, so the `.cr-prose a` underline rule stands, as
   already written into TASK-013.
