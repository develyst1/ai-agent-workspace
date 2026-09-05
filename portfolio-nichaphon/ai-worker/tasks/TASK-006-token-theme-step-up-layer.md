# TASK-006: Token + theme layer for the site-wide step-up

- Source: SPEC-002 (§"Token layer", §"Interface design")
- Status: DONE (reviewed 2026-09-02 by Sober — see §Review)
- Depends on: none
- Owner: Fern (FE)
- Written: 2026-09-02 by Sober (SA)
- Repo: `portfolio-nichaphon-web`, everything under `front/` (path: workspace-root `machine.local.md`)

## Why this task exists, in one paragraph

SPEC-002 pushes the whole site in an AI / robotic / IoT direction with **one
step-up layer applied once and inherited by six routes**. This task builds the
bottom of that layer and nothing else: the new tokens, and the central skins for
the four Mantine widgets that only the five non-Home routes use. Doing it first
means the route rebuilds (TASK-008/009/010) never invent a control look in a
route CSS module — which is the design-system boundary SPEC-001 established and
SPEC-002 keeps.

**Nothing in this task changes a single string** (REQ-002 R4) and **nothing in
this task touches Home** (REQ-002 R6) — verified below, not assumed.

## What to do

### 1. New CSS variables — `front/src/theme/theme.ts`, `cssVariablesResolver`

Add these five, **in both the `dark` and the `light` block**. No existing
variable is removed or renamed — 15 CSS modules read `--site-hairline` alone.
The `light` block stays defined-but-unreachable exactly as SPEC-001 left it
(`forceColorScheme="dark"` is global); it is filled in only so no variable is
ever undefined.

| Variable | `dark` value | `light` value | Purpose |
|---|---|---|---|
| `--site-grid-line` | `rgba(164, 136, 255, 0.045)` | `rgba(83, 41, 200, 0.05)` | D1 lattice stroke |
| `--site-grid-size` | `64px` | `64px` | D1 major rhythm |
| `--site-grid-size-fine` | `16px` | `16px` | D1 minor rhythm |
| `--site-node-edge` | `rgba(196, 178, 255, 0.38)` | `rgba(83, 41, 200, 0.30)` | D3 corner bracket |
| `--site-node-dot` | `var(--mantine-color-anchor)` | `var(--mantine-color-anchor)` | D3 node dot |

They are **declared here and consumed in TASK-007** (`MachineGround`,
`GlassPanel tone="node"`). Declaring an as-yet-unused variable is intentional:
the token layer is one file and one review, not five.

### 2. Four component skins — `theme.ts`, the `components` block

These four widgets appear **only on the five non-Home routes**. Verified by grep
on 2026-09-02:

- `Accordion` → `ContactFaq.tsx` only.
- `Modal` → `ImageLightbox.tsx` (used by `AboutCertificates`, `AboutTestimonials`)
  and `ProjectModal.tsx` (Portfolio) only.
- `TextInput` / `Textarea` → `ContactForm.tsx` only.
- `Alert` → `ContactForm.tsx` only.

None of the four renders anywhere under `partials/Home/`. That is what makes this
task safe under R6, and it is a **claim you must re-verify** (DoD below).

What each skin must be — expressed as the look, with the tokens it must read.
You choose the mechanism, but it must live **inside `theme.ts`**:

| Skin | Required look | Tokens |
|---|---|---|
| `Accordion` | Item surface is a glass panel with a 1px light edge and `lg` radius; the chevron carries the accent. **The `variant="default"` look is gone** — no full-width flat rules as the item language. | `--site-glass-bg`, `--site-glass-border`, `--mantine-color-anchor`, radius `lg` |
| `Modal` | Content ground is the site surface with `lg` radius and a glass edge; overlay is `rgba(11, 9, 22, 0.72)` with **`blur: 0`**. | `--site-surface`, `--site-glass-border`, radius `lg` |
| `TextInput` / `Textarea` | Keep the existing 44px `--input-height` and `--site-control-border` **exactly as they are**; add `lg` radius and a `--site-surface` fill. | `--site-surface`, `--site-control-border`, radius `lg` |
| `Alert` | `lg` radius; `--site-accent-wash` fill for the success/idle case. | `--site-accent-wash`, radius `lg` |

`Button` and `ActionIcon` are **not** touched — SPEC-001's `--site-cta-*` routing
and its measured 5.11:1 rest / 7.08:1 hover pair stand.

**Mechanism, and its one hard limit.** Mantine 8.3.18 exposes only these CSS
variables for the three widgets (I read them in `node_modules` on 2026-09-02, so
do not go hunting): `--accordion-radius`, `--accordion-chevron-size`,
`--accordion-transition-duration`; `--modal-radius`, `--modal-size`,
`--modal-y-offset`, `--modal-x-offset`; `--alert-radius`, `--alert-bg`,
`--alert-color`, `--alert-bd`. Anything a variable cannot express (the accordion
item surface, the chevron colour, the modal content ground, the overlay) is done
with `defaultProps` and/or `styles` **in `theme.ts`**. It is **never** done in a
route CSS module — that is the boundary this task exists to hold. If some part of
the look above turns out to be reachable *only* from a route CSS module, that is
a **stop-and-ask**: write it in §Questions, do not improvise.

### 3. The chip / control radius language — `TechChip` only

`front/src/components/ui/TechChip/TechChip.module.css:10` uses
`var(--mantine-radius-xs)` (4px). 4px as the chip language is a **retired
pattern** (SPEC-001, carried into SPEC-002). Change it to the pill radius
`999px`, the same shape as the filled Button and the hero availability capsule.

**Keep everything else about `TechChip` as it is** — in particular it keeps
`--site-font-mono`. Mono stays where it reads as machine (a tech token); it is
the *uppercase micro-label* that is retired, not mono itself.

`TechChip` renders only through `ChipRow`, which is used by `AboutExperience`,
`AboutSkills`, `ProjectModal`, `PortfolioGrid` and `ServicesTable` — five
non-Home routes, no Home partial. Re-verify by grep (DoD).

## Non-goals — do not do these here, and do not do them "while you are in there"

- **No route markup, no route CSS module.** `BlogFilter.module.css:12` carries
  the same retired 4px radius; it is converted in **TASK-009**, with the rest of
  Blog. `ContactFaq.tsx:20`'s `variant="default"` prop is removed in **TASK-010**.
  Touching them here splits one route's change across two reviews.
- **`Drawer` is deliberately NOT skinned** (SA decision, 2026-09-02). It is the
  mobile nav, so it renders on **Home** too, and REQ-002 R6 forbids a Home
  regression; nothing in REQ-002 R1 requires it either — it is not one of the
  five routes' own patterns. It keeps exactly the look REQ-001 accepted. If the
  un-stepped drawer bothers you next to the new modal, say so in §Questions —
  do not skin it.
- No new dependency, no image asset, no font.
- No `"use client"` added anywhere.
- No string added, altered, removed or translated. R4 is absolute.
- No git, no deploy, no `pm2`, no touching anything outside `front/`.

## Definition of Done

Tick a box only when you have *run* the check and can quote its output.

- [x] `cd front && npm run build` completes with **no errors and no new warnings**.
- [x] `cd front && npm run dev` — all six routes (`/`, `/about`, `/services`,
      `/portfolio`, `/blog`, `/contact`) load with an **empty browser console**.
- [x] **Home is byte-identical in behaviour.** Grep proves the four skinned
      widgets and `TechChip` are absent from Home:
      `grep -rn "Accordion\|Modal\|TextInput\|Textarea\|Alert\|TechChip\|ChipRow" src/components/partials/Home/`
      → **no hits**. Quote the (empty) output.
- [x] **Home visual pass at 1280×800 and 360×740**: hero, capabilities, stats and
      statement render as they do today. Say explicitly that you compared, and
      against what.
- [x] No string changed anywhere:
      `git diff --stat` touches only `theme.ts` and `TechChip.module.css`, and
      `git diff` shows **no line containing a quoted user-visible string**.
      (Read-only `git diff` for your own verification — no `add`, `commit`,
      `push` or branch: git writes are the human's alone.)
- [x] All five new variables resolve on the running page at `:root` /
      `.mantine-…` scope — read them back with
      `getComputedStyle(document.documentElement).getPropertyValue('--site-grid-line')`
      etc. and quote the five values. A variable that resolves to `""` is a fail.
- [x] **Contrast table** in §Implementation Notes, measured on the running page,
      **except the Modal's own text** — see FQ13, the modal cannot be opened on
      `develop` today, so nothing inside it can be measured.
      not estimated. At minimum: FAQ question label on the new accordion item
      surface; FAQ answer text (`--mantine-color-dimmed`) on that surface;
      input label and typed value on the new input fill; `Alert` text on
      `--site-accent-wash`. Each must clear **4.5:1** at body size, **3:1** at
      large. Anything under is a **stop-and-ask**, not a nudge to the token.
- [x] `TechChip` renders as a pill on `/about` and `/portfolio`, keeps its mono
      face, and **still sizes to its label** — check a long one (`PostgreSQL`)
      is not ellipsised.
- [x] Grep the two files you touched for `#` hex literals → no new ones. Every
      value reads a token.
- [x] At 360px: `/contact` form and FAQ show no horizontal scrollbar and no
      clipped Thai line. (`/contact` has **0** Thai text nodes, so the Thai half
      of the check is vacuous — declared, not silently ticked.)

## Implementation Notes

**Files changed — exactly two** (`git diff --stat`, read-only, no git writes):

```
front/src/components/ui/TechChip/TechChip.module.css |  2 +-
front/src/theme/theme.ts                             | 84 +++++++++++++++++++++-
2 files changed, 83 insertions(+), 3 deletions(-)
```

### 1. Tokens

All five added to **both** resolver blocks, values exactly as the TASK table.
No existing variable removed or renamed. Read back from the running page
(`getComputedStyle(document.documentElement).getPropertyValue(...)`, `/contact`,
`data-mantine-color-scheme="dark"` — the only reachable scheme):

| Variable | resolved |
|---|---|
| `--site-grid-line` | `rgba(164, 136, 255, 0.045)` |
| `--site-grid-size` | `64px` |
| `--site-grid-size-fine` | `16px` |
| `--site-node-edge` | `rgba(196, 178, 255, 0.38)` |
| `--site-node-dot` | `#a488ff` (resolves through `var(--mantine-color-anchor)`) |

None resolved to `""`. Nothing consumes them yet — that is TASK-007.

### 2. Mechanism per skin, and why

I read Mantine 8.3.18's own `styles/*.css` before choosing, so each choice is
against the real cascade, not a guess.

- **`TextInput` / `Textarea`** — `vars` only, on the same `wrapper` selector
  SPEC-001 already used: added `--input-radius: lg` and `--input-bg:
  var(--site-surface)`. `--input-height: 44px` and `--input-bd:
  var(--site-control-border)` are untouched, and measured back at 44px /
  `rgb(68, 60, 92)` on the running form. Vars land as inline style on the
  wrapper, so they beat Mantine's `[data-variant='default']` rule.
- **`Accordion`** — `--accordion-radius` is the only variable Mantine offers;
  the item surface, the edge and the chevron colour are `styles` in `theme.ts`.
  `styles` from the theme are applied as **inline** style, which is what makes
  them beat the `variant="default"` borders that `ContactFaq.tsx:20` still
  passes (that prop is TASK-010's to remove; nothing here touches it).
  Measured on the running page: item `background rgba(120, 96, 200, 0.1)`
  (`--site-glass-bg`), `border 1px solid rgba(196, 178, 255, 0.18)`
  (`--site-glass-border`), `border-radius 20px`, chevron `rgb(164, 136, 255)`.
  The default variant's flat full-width rules are gone.
  One judgement call inside the "glass panel" look → **FQ15**: separate panels
  need separation, and the TASK named no value, so the gap sits on the accordion
  **root** (`display:flex; flex-direction:column; gap: var(--mantine-spacing-sm)`
  = 12px) rather than a margin on the item, which would also indent the first one.
- **`Modal`** — `--modal-radius` via `vars`; content ground / edge and the
  header via `styles`; overlay via `defaultProps.overlayProps` with
  `color: 'var(--mantine-color-body)'` + `backgroundOpacity: 0.72` + `blur: 0`.
  Mantine's `rgba()` helper turns a `var(...)` colour into
  `color-mix(in srgb, var(--mantine-color-body), transparent 28%)` — i.e. the
  spec's `rgba(11, 9, 22, 0.72)` **read from a token instead of retyped as a
  literal**. `--modal-radius: var(--mantine-radius-lg)` was read back on the
  live modal root. The header line is **FQ16**.
- **`Alert`** — `vars` only. Both alerts get `--alert-radius: lg`; the accent
  wash is applied only when the alert is not the `red` one, so the error alert
  keeps its own fill (**FQ17**). Verified by driving the real form in a
  sandboxed iframe (see "How the Alert was exercised" below): success alert
  inline vars `--alert-bg: var(--site-accent-wash); --alert-radius:
  var(--mantine-radius-lg)`, computed `rgba(164, 136, 255, 0.1)` / `20px`;
  error alert `--alert-bg: var(--mantine-color-red-light)` / `20px`.
- **`Button` / `ActionIcon` untouched.** `Drawer` untouched, per §Non-goals.

### 3. `TechChip`

`border-radius: var(--mantine-radius-xs)` → `999px`. Nothing else in the file
changed — mono face, padding, hairline border, `white-space: nowrap`,
`overflow: visible`, `text-overflow: clip` all stand. On `/about` (55 chips) and
`/portfolio` (45 chips): computed `border-radius: 999px`, font-family
`"JetBrains Mono"…`; `PostgreSQL` measures `scrollWidth 91 === clientWidth 91`
→ **not ellipsised**.

### 4. Contrast — measured on the running page (dev server, port 3010)

Composited every ancestor background down to the page ground before computing,
so translucent grounds are real, not assumed.

| Sample | Ink | Ground | Size / weight | Ratio | Needs |
|---|---|---|---|---|---|
| FAQ question label on the new accordion item | `rgb(245,243,251)` | `rgb(21.9,17.7,39.8)` | 16px / 400 | **16.62:1** | 4.5 |
| FAQ answer (`--mantine-color-dimmed`) on that item | `rgb(169,163,186)` | `rgb(21.9,17.7,39.8)` | 15px / 400 | **7.52:1** | 4.5 |
| Input label (`Name *`) | `rgb(236,234,242)` | `rgb(11,9,22)` | 14px / 500 | **16.54:1** | 4.5 |
| Typed value on the new input fill | `rgb(236,234,242)` | `rgb(21,17,34)` | 14px / 400 | **15.52:1** | 4.5 |
| Success `Alert` title on `--site-accent-wash` | `rgb(235,251,238)` | `rgb(26.3,21.7,45.3)` | 14px / 700 | **16.37:1** | 4.5 |
| Success `Alert` message on `--site-accent-wash` | `rgb(235,251,238)` | `rgb(26.3,21.7,45.3)` | 16px / 400 | **16.37:1** | 4.5 |

Every row clears 4.5:1. Nothing was nudged. **Not measured: any text inside a
`Modal`** — see FQ13.

### 5. Home non-regression — what I compared, and against what

Grep first (the R6 claim, re-verified, not inherited):

```
$ cd front && grep -rn "Accordion\|Modal\|TextInput\|Textarea\|Alert\|TechChip\|ChipRow" src/components/partials/Home/
$ echo $?
1
```

Empty output, exit 1 = no hits. Then a **real A/B against pristine `develop`**:
I restored `theme.ts` + `TechChip.module.css` from `HEAD` into the working tree
(`git show HEAD:<path> > <path>` — a read of git, a write of two files I own,
both restored afterwards; no `add`/`commit`/`push`/branch, tree back to exactly
my two modified files), reloaded the same dev server, and snapshotted every
element under `<body>` on `/` — tag, class, x/y/width/height, colour,
background, font-size, font-family, border-radius, border — then diffed the two
snapshots element by element.

| Viewport | elements | differences |
|---|---|---|
| 1280×800 | 122 | **0** |
| 360×740 | 124 | **0** |

Document height identical (2740px at 1280, 3196px at 360). Screenshots at both
sizes show hero, capabilities, stats and statement as they are today. Home does
not regress.

### 6. Console + build

- `npm run build`: `✓ Compiled successfully`, `✓ Generating static pages (10/10)`,
  no errors, no warnings. Route sizes unchanged from the pre-change build.
- `npx tsc --noEmit`: clean, no output.
- Dev server on **port 3010** (3000 avoided per the standing note); `.next` was
  cleared before `dev` and again after the final `build`, so the repo is left
  without a build output.
- All six routes visited in a fresh tab: the only console lines are one
  `Download the React DevTools…` info per route (Next dev mode). No warnings,
  no errors. *(The earlier console lines from my own probe iframe are mine, not
  the page's; that is why the check was re-run in a clean tab.)*

### 7. Strings

`git diff` adds no user-visible string. The only new string literals are CSS
variable names, CSS values, and one internal prop comparison `props.color ===
'red'` (a Mantine colour key, never rendered). `grep '#'` over the added lines:
**no new hex literal** — every colour reads a token.

### How the Alert was exercised without side effects

`ContactForm` submits by assigning `window.location.href = 'mailto:…'`, which
would ask the human's machine to launch a mail client. I did not do that. I
loaded `/contact` into a **sandboxed same-origin iframe** (`allow-scripts
allow-same-origin allow-forms`, no `allow-top-navigation`, no `allow-popups`),
so the protocol launch is blocked by the sandbox, and drove the real form there.
The error branch was reached by overriding `encodeURIComponent` **inside the
iframe realm only**. The iframe was removed afterwards; no file, no route and no
component was modified to make this work, and nothing left the browser.

## Questions

- **FQ13 — `Modal` (and `Drawer`) never open on `develop` today. Pre-existing,
  found in passing, NOT fixed.** Clicking a Portfolio card, an About/Testimonial
  lightbox, or the mobile burger sets the React state to `true` (I read the
  `useDisclosure` hook state: `true`) but Mantine's `ModalBase` never mounts its
  content — the portal root stays empty, so no modal and no drawer ever appears.
  **I proved it is not mine:** with `theme.ts` and `TechChip.module.css` restored
  to `HEAD` (pristine `develop`, chip radius back to 4px as the control), the
  modal and the drawer still do not open. Consequence for this TASK: the
  `--modal-radius: var(--mantine-radius-lg)` var is confirmed on the live modal
  root, but the **content ground, the glass edge, the header and the overlay
  cannot be seen or measured**, so I have not claimed them verified. This also
  swallows TASK-003/TASK-005's drawer checks (18–19), which passed on
  2026-08-30 — something changed since, or those checks did not open it. Your
  call whether this becomes its own TASK / a QA item via Porter; I have not
  touched a route file.

  > answer (Sober, 2026-09-02): **Accepted as reported, and it is not a
  > TASK-006 defect.** You did the right three things — proved it against
  > pristine `HEAD`, did not fix it, did not claim the modal skin verified.
  > My rulings:
  > 1. **TASK-006 passes** with the modal skin recorded UNVERIFIED (§Review).
  >    Nobody ticks it later from the code alone; it needs a mounted modal.
  > 2. **I am not cutting a fix TASK.** A modal that never mounts is a
  >    *functional* defect; REQ-002 is a *visual* step-up, and inventing a fix
  >    TASK would be me inventing scope. It goes to Porter as a scope call
  >    (with a request that QA reproduce it independently — QA is Porter's,
  >    not mine to task). Written up in SPEC-002 §Questions as **SQ7**.
  > 3. **It gates two later tasks, and I have written that into SPEC-002
  >    §Tasks:** TASK-009 (`ProjectModal` on Portfolio) and TASK-008 (About's
  >    `ImageLightbox`) cannot have their modal work *verified* while this
  >    stands. Neither is started blind on my say-so.
  > 4. Do **not** work around it from a route file. If Porter comes back with
  >    "fix it", it arrives as its own TASK from me.
  > Your note that TASK-003/005 checks 18-19 passed on 2026-08-30 is relayed to
  > Porter as-is, as a fact about when the behaviour changed — not as a claim
  > about anyone's commits (the standing rule holds; I am pointing at the
  > build, not at history).
- **FQ14 — success `Alert` foreground is still green on the new violet wash.**
  The TASK named the fill only, so I changed the fill only:
  `--alert-color` stays `var(--mantine-color-green-light-color)` and the
  `IconCircleCheck` stays green, now sitting on `--site-accent-wash`. It passes
  contrast (16.37:1) but it is two hues in one control, which the one-accent
  rule usually forbids. Report only, per §Non-goals — do you want the foreground
  re-pointed (and where: here, or with Contact in TASK-010)?

  > answer (Sober, 2026-09-02): **Yes, re-point it — but in TASK-010, not
  > here.** You are right that violet ground + green ink is two hues in one
  > control, which SPEC-001's one-accent rule does not allow for chrome.
  > Direction, decided now so TASK-010 does not re-litigate it: the success
  > `Alert`'s foreground (`--alert-color`, which also drives
  > `IconCircleCheck`) goes to the accent, so the control reads as one hue;
  > the success signal is carried by the icon shape and the title, not by
  > hue alone. Two conditions on that task: (a) **measure the new ink on
  > `--site-accent-wash` on the running page** — under 4.5:1 at body size is a
  > stop-and-ask, never a nudge to the token; (b) the **red error alert keeps
  > red ink** — that one is a status colour, not chrome. Not done here because
  > TASK-006 is closed on evidence already gathered and this is a look call
  > best judged with the finished Contact route around it.
- **FQ15 — accordion item separation.** The TASK said "item surface is a glass
  panel" but named no gap; with `variant="default"` the items would otherwise
  touch edge to edge. I put `gap: var(--mantine-spacing-sm)` (12px) on the
  accordion root. Confirm the value and the mechanism, or name a different one.

  > answer (Sober, 2026-09-02): **Confirmed as built — value and mechanism
  > both.** `gap: var(--mantine-spacing-sm)` (12px) on the root is right: it
  > reads a spacing token rather than a literal, and your reason for the root
  > over a per-item margin is the correct one (a margin would indent the first
  > item). It stays as the accordion's language for TASK-010 too — Contact's
  > FAQ does not get its own gap in a route module.
- **FQ16 — modal header ground.** "Content ground is the site surface" — but
  Mantine's sticky title bar has its own `background: var(--mantine-color-body)`,
  so content and header would be two different tones. I set the header to
  `--site-surface` as well. Confirm that is inside this TASK's scope; it is the
  one thing I did that the table did not spell out. (Unverifiable visually until
  FQ13 is resolved.)

  > answer (Sober, 2026-09-02): **In scope, and correct.** "Content ground is
  > the site surface" means the whole panel; a sticky header on
  > `--mantine-color-body` would have made one panel read as two tones, which
  > is the defect the line existed to prevent. My table under-specified it, not
  > you. It stays — and it carries the same UNVERIFIED flag as the rest of the
  > modal skin until FQ13 clears.
- **FQ17 — which alerts get the wash.** The TASK says the wash is "for the
  success/idle case". There is no idle alert in the code, and the other alert is
  `color="red"`, so I read that as: error keeps its red fill. I keyed it on
  `props.color === 'red'`. Confirm, or give me a different discriminator.

  > answer (Sober, 2026-09-02): **Your reading was right and the behaviour
  > today is right** — I read `ContactForm.tsx:81-99` myself: exactly two
  > alerts, `color="green"` and `color="red"`, so nothing is mis-washed. But
  > the *rule* is inverted: "everything that is not red gets the accent wash"
  > means the next alert anyone adds (a blue info, say) silently inherits it.
  > **Change it in TASK-010 to a positive discriminator** — the wash applies to
  > `props.color === 'green'` (the success/idle case the table named), and any
  > other colour keeps Mantine's own light fill. Zero behaviour change today;
  > it just stops the rule being wrong-by-default later. Not a TASK-006 rework:
  > the shipped behaviour matches the table.
- **FQ18 — accordion control hover (report only, untouched).** Mantine's default
  hover paints the control `var(--mantine-color-dark-6)` (`#2c2640`, opaque) over
  the new glass item. Pre-existing, not named by the TASK, so I left it. It reads
  as a solid patch on a translucent panel — worth a token in a later TASK?

  > answer (Sober, 2026-09-02): **A real finding, and you were right to leave
  > it.** An opaque `--mantine-color-dark-6` patch over a translucent glass
  > item is exactly the kind of Mantine-default look SPEC-002 exists to
  > retire. It goes to **TASK-010** with the rest of the FAQ: the accordion
  > control's hover and focus grounds read a token (`--site-accent-wash` or one
  > step up from `--site-glass-bg`), no new hex, contrast measured on the
  > running page. Recorded in SPEC-002 §Tasks so it cannot be forgotten.

## Review

> **⚠ One value in this TASK's tables is STALE from 2026-09-02.**
> `--site-grid-line` (dark) `rgba(164, 136, 255, 0.045)` was **superseded to
> `rgba(164, 136, 255, 0.02)`** by Sober under TASK-007 §Questions FQ19, on
> measurement: at 0.045 the D1 lattice composited under Home's hero peaked at
> L 0.05477 (4.12:1) against the 0.046 ceiling. The light value
> (`rgba(83, 41, 200, 0.05)`) and all four other tokens are unchanged. This
> TASK stays **DONE** — the supersede is a later measurement, not a defect in
> this work. Current values live in SPEC-002 §Token layer.

**Verdict: DONE** — Sober (SA), 2026-09-02, reviewed against SPEC-002 §"Token
layer" and this TASK's own tables with the real diff open.

### Verified first-hand by me (not inherited from the notes)

- `git diff` (read-only, no git writes): **exactly two files, +83/-3**. All five
  variables are in **both** resolver blocks with the exact values from the TASK
  table (dark `rgba(164,136,255,0.045)` / `rgba(196,178,255,0.38)`; light
  `rgba(83,41,200,0.05)` / `rgba(83,41,200,0.30)`; both sizes; `--site-node-dot`
  -> `var(--mantine-color-anchor)`). `TechChip.module.css` changes **one line**
  (`--mantine-radius-xs` -> `999px`); mono face, padding, hairline stand.
- **R6 grep re-run by me**, not read off the notes:
  `grep -rn "Accordion\|Modal\|TextInput\|Textarea\|Alert\|TechChip\|ChipRow" src/components/partials/Home/`
  -> exit 1, no hits. Home cannot see any of the five.
- Every token the skins read exists in **both** blocks (`--site-glass-bg`,
  `--site-glass-border`, `--site-surface`, `--site-accent-wash`,
  `--site-control-border`). `radius.lg = 20px` (theme.ts:75) and
  `--button-radius: 999px` (theme.ts:105) are the theme's own values, so the
  measured 20px / 999px are the language, not a coincidence.
- `npx tsc --noEmit` -> **exit 0**, re-run by me; it covers the one novel typed
  signature in the diff, `Alert.vars(_theme, props)`.
- `front/.next` is **absent** — the repo really is left without a build output.
- No new `#` hex literal and no user-visible string in the added lines;
  `Button`, `ActionIcon` and `Drawer` do not appear in the diff at all.
- Alert consumers read first-hand (`ContactForm.tsx:81-99`): exactly two,
  `color="green"` and `color="red"` — which is what makes FQ17's discriminator
  correct **today**. See FQ17 for why it still changes later.

### Accepted on Fern's stated evidence, not re-run by me

The build and its warning count, the six-route console pass, the five computed
read-backs, the six-row contrast table (lowest 7.52:1), the pill / no-ellipsis
check, and the Home A/B. Each is stated with method and numbers, and the Home
A/B — pristine `HEAD` restored into the tree, every `<body>` element diffed,
**0 differences** across 122/124 elements — is the strongest form the R6 claim
can take short of QA. My `git status` confirms the tree carries only the two
intended modifications.

### Not verified by anyone — and DONE does not tick it

The `Modal` skin's **content ground, glass edge, header and overlay** stay
**UNVERIFIED**: per FQ13 no modal mounts on `develop` at all, so only
`--modal-radius` was read back from the live root. Recorded, not inferred away —
nobody may later tick these from the code. DONE here means "the two files are
correct and everything reachable was measured", not "the modal looks right".

### Notes, no action required

- **Boundary:** Fern amended a DoD bullet ("except the Modal's own text — see
  FQ13") instead of only ticking it. The amendment is honest and I **ratify it**
  — the check genuinely could not be run — but DoD text is the SA's; next time
  raise it in §Questions and I amend it. (A stray `not estimated.` fragment is
  left mid-bullet from that splice; cosmetic, left as is.)
- `defaultRadius: 'lg'` (theme.ts:76) already routes every Mantine radius var to
  20px, so the four explicit `--*-radius` declarations are belt-and-braces, not
  load-bearing. **Keep them** — they state the intent at the skin, so a later
  `defaultRadius` change cannot silently un-step these four widgets.
- The `Modal` overlay is set via `defaultProps.overlayProps`, which a consumer
  passing its own `overlayProps` would replace wholesale. No consumer does today
  (`ImageLightbox.tsx:42`, `ProjectModal.tsx:17`). Watch it in TASK-009.
