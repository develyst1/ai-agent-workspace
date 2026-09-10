# TASK-021: `.btn-primary` resting **and** hover onto the theme-scoped accent
- Source: SPEC-006 §R-COLOUR-7
- Owner: FE (Fern)
- Status: DONE
- Depends on: none (TASK-006 and TASK-020 are both `DONE`; this touches neither of their files)

## Why this exists (read once, then don't re-derive)

`.btn-primary` is a **whole-site** declaration, not a screen style. `grep -rn "btn-primary" front/src`
gives four call sites — `layout/Navbar.tsx:102`, `layout/Navbar.tsx:184`,
`partials/Home/HomeContent.tsx:146`, `partials/Courses/CoursesContent.tsx:162` — and the Navbar is in
the **root layout**, so this button ships on **every** route today. It carries two defects:

1. **Resting: 2.77:1 in light** — you measured it yourself on the `/courses` CTA (TASK-006 DoD 2).
   `background-color: var(--color-primary)` = `#0EA5E9` with `color: var(--text-inverse)` = `#FFFFFF`.
2. **Hover: ≈1.15:1 in light** — `background-color: var(--color-primary-light)` = `#E0F2FE` (sky-50)
   while the text stays `#FFFFFF`, i.e. the label all but vanishes.
   🔴 **This second one is UNVERIFIED**: Sober computed it from the token values on 2026-09-09 and
   **nobody has ever observed a hover state on this project**. Treat it as a hypothesis your
   measurement settles — if the browser says otherwise, say so and stop.

This is the one admitted exception to "a screen TASK may not change an existing `themes.css`
declaration" (SPEC-006 §R-COLOUR-6). **It is not a screen TASK: you edit `themes.css` and nothing
else.** It is deliberately sequenced ahead of REQ-007 and ahead of the owner answering the Phase-1
gate, so that what he eventually looks at is the fixed button.

## What to do

**Edit `front/src/styles/themes.css` only. No screen file, no component, no Tailwind class, no other
declaration in this file.** Five edits, all additive or one-token substitutions:

**A. Two new lines in `:root`** (after `--color-primary-light`, line 7):

```css
  --color-primary-strong: #0369A1; /* sky-700 — default before the theme class is applied */
  --color-primary-strong-hover: #075985; /* sky-800 — default before the theme class is applied */
```

Reason (do not skip this — it is a real regression guard, not tidiness): `ThemeContext` adds
`light`/`dark` to `<html>` **in an effect**, so the server-rendered first paint has **no theme class**
and every theme-scoped token is undefined. Today `.btn-primary` survives that window because
`--color-primary` lives in `:root`. Moving it to a `.light`/`.dark`-only token without a `:root`
default would make the button paint **transparent** until hydration. The `:root` values are the light
values, matching `ThemeContext`'s own `useState('light')` initial.

**B. One new line in `.light`** (next to the existing `--color-primary-strong`, line 61):

```css
  --color-primary-strong-hover: #075985; /* sky-800 */
```

**C. One new line in `.dark`** (next to the existing `--color-primary-strong`, line 95):

```css
  --color-primary-strong-hover: #38BDF8; /* sky-400 */
```

**D. `.btn-primary` (lines 157–162)** — `background-color` and `border` move from
`var(--color-primary)` to `var(--color-primary-strong)`. `color`, `transition` unchanged.

**E. `.btn-primary:hover` (lines 164–169)** — `background-color` moves from
`var(--color-primary-light)` to `var(--color-primary-strong-hover)`, and `border-color` from
`var(--color-primary-hover)` to `var(--color-primary-strong-hover)`. `transform` and `box-shadow`
unchanged.

**Do NOT touch** `--color-primary`, `--color-primary-hover` or `--color-primary-light` themselves —
they are still read by `.btn-outline`, `.btn-accent`'s neighbours, several utility rules and
`globals.css:241`. (`--color-primary-light` becomes unused after this TASK. It is pre-existing; leave
it. Removing dead tokens is not this TASK's job.)

## What this changes, on purpose

| | before | after | expected ratio vs its text |
|---|---|---|---|
| light, resting | `#0EA5E9` on white text | `#0369A1` on white text | **5.93:1** (was 2.77:1, measured) |
| light, hover | `#E0F2FE` on white text | `#075985` on white text | **7.57:1** (was ≈1.15:1, computed) |
| dark, resting | `#0EA5E9` on `#1C1917` | **`#0EA5E9` on `#1C1917` — identical** | 6.31:1 (you measured this pair) |
| dark, hover | `#E0F2FE` on `#1C1917` | `#38BDF8` on `#1C1917` | **8.16:1** |

🔴 **Every number in the "after" column is Sober's arithmetic on the token values, not an
observation.** They are what your DoD measures, not what it assumes. Both new colours already appear
on this file's own sky ramp (`#075985` is `.dark`'s `--bg-hover`; `#38BDF8` is `.dark`'s
`--focus-ring`), so nothing new enters the palette.

**Direction of travel:** light darkens on hover, dark lightens on hover. **`--color-primary-strong`
in `.dark` is `#0EA5E9`, byte-identical to today's `--color-primary`, so the dark resting button does
not move at all.** In light, the primary button — including the one in the Navbar on every route —
becomes visibly darker. That is the point of the change, and Porter is being told before the owner
looks.

## Definition of Done

Paste the actual command and its actual output for each. **No git commands** (owner's standing ruling
A23 — git is out of this team's scope).

1. `npm run build` succeeds, no new warning. Paste the `/` and `/courses` rows — both must still be
   `○ (Static)`.
2. `grep -n "color-primary" front/src/styles/themes.css` — paste it. `--color-primary`,
   `--color-primary-hover`, `--color-primary-light` must all still be **defined**;
   `.btn-primary`/`.btn-primary:hover` must no longer **read** any of the three.
3. `grep -rn "btn-primary" front/src` → still exactly the same **four** call sites plus the two
   `themes.css` lines. This is the proof no screen file moved.
4. `grep -rn "color-primary-strong-hover" front/src` → hits in **`styles/themes.css` only**, three of
   them (`:root`, `.light`, `.dark`).
5. **Measured, in a real browser, four numbers** — the Navbar button (`/`, so the root-layout one) in
   **light resting, light hover, dark resting, dark hover** — by reading
   `getComputedStyle(el).backgroundColor` and `.color` on the actual element and computing the ratio
   from those two, exactly as on TASK-005/006. State the method and its limits again.
   🔴 **The hover state must be a real hover** — a pointer actually over the button, or DevTools
   force-element-state. **Reading it off the CSS rule or off the token values is not a measurement**
   and this TASK's whole purpose is to stop doing that. All four must be **≥ 4.5:1**; if any is not,
   stop and write it in `## Questions` rather than inventing a colour.
6. Repeat measurement 5 for **one page CTA** (`/courses`, `CoursesContent.tsx:162`) in **light
   resting and light hover only** — proof the two Navbar sizes aren't a special case.
7. **The no-theme-class window:** on `/`, run
   `document.documentElement.classList.remove('light','dark')`, then read the Navbar button's
   computed `background-color`. It must **not** be `rgba(0, 0, 0, 0)` — paste the value. Then reload
   the page to restore the class.
8. `/` at 375 px and at 1440 px, both themes — no horizontal scroll and no geometry change (this
   TASK changes colour only). Paste `scrollWidth`/`clientWidth`.
9. `node <harness>/check-no-emoji.mjs src` → still **110**, unchanged (this TASK adds and removes no
   emoji). Do not re-baseline the harness.
10. Name every file you edited. It must be exactly one: `front/src/styles/themes.css`. State its line
    endings as found and confirm they are unchanged (no `sed -i`).

## Implementation Notes

**Fern, 2026-09-09 — `TODO` → `IN_PROGRESS` → `REVIEW`.** All five edits A–E made exactly as written,
in `front/src/styles/themes.css` and nowhere else. **All 10 DoD run, all 10 pass.**
🟢 **Every one of Sober's four "after" ratios is confirmed by measurement, to the hundredth** (his
7.57 measures 7.56 — rounding, not a discrepancy). **The hover hypothesis is settled: it was real.**

### DoD 1 — `npm run build`

```
✓ Compiled successfully in 2.7s
✓ Generating static pages using 11 workers (10/10) in 484ms
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /about
├ ƒ /classroom/[id]
├ ○ /courses
├ ○ /login
├ ○ /register
├ ○ /teach
└ ○ /verify-email
```

`/` and `/courses` are both still `○ (Static)`. The only warning printed is the pre-existing
`MODULE_TYPELESS_PACKAGE_JSON` one about `tailwind.config.ts` — **not new**, it is on every build in
this repo. No new warning.

### DoD 2 — `grep -n "color-primary" front/src/styles/themes.css`

```
5:  --color-primary: #0EA5E9; /* sky-500 - Blue for education */
6:  --color-primary-hover: #0284C7; /* sky-600 */
7:  --color-primary-light: #E0F2FE; /* sky-50 */
8:  --color-primary-strong: #0369A1; /* sky-700 — default before the theme class is applied */
9:  --color-primary-strong-hover: #075985; /* sky-800 — default before the theme class is applied */
63:  --color-primary-strong: #0369A1; /* sky-700 — accent that clears 4.5:1 on --bg-primary */
64:  --color-primary-strong-hover: #075985; /* sky-800 */
98:  --color-primary-strong: #0EA5E9; /* sky-500 — accent that clears 4.5:1 on --bg-primary */
99:  --color-primary-strong-hover: #38BDF8; /* sky-400 */
162:  background-color: var(--color-primary-strong);
164:  border: 1px solid var(--color-primary-strong);
169:  background-color: var(--color-primary-strong-hover);
170:  border-color: var(--color-primary-strong-hover);
189:  color: var(--color-primary);
190:  border: 1px solid var(--color-primary);
195:  background-color: var(--color-primary);
247:  border-color: var(--color-primary);
268:  color: var(--color-primary);
273:  color: var(--color-primary);
281:  color: var(--color-primary);
310:  color: var(--color-primary);
340:  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
```

All three of `--color-primary` (5), `--color-primary-hover` (6), `--color-primary-light` (7) are
**still defined**; `.btn-primary` (161–165) and `.btn-primary:hover` (168–172) **read none of the
three** — only `--color-primary-strong` / `--color-primary-strong-hover`. `--color-primary` is still
read by 9 other declarations, exactly as the TASK said; left alone. `--color-primary-light` is now
unused — pre-existing token, left in place as instructed.

### DoD 3 — `grep -rn "btn-primary" front/src`

```
front/src/components/layout/Navbar.tsx:102:                className="btn-primary rounded-full px-4 py-2 text-sm font-semibold"
front/src/components/layout/Navbar.tsx:184:                      className="btn-primary -mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-center"
front/src/components/partials/Courses/CoursesContent.tsx:162:              className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold shadow-lg transition-all duration-300"
front/src/components/partials/Home/HomeContent.tsx:146:              className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all duration-300"
front/src/styles/themes.css:161:.btn-primary {
front/src/styles/themes.css:168:.btn-primary:hover {
```

Exactly the same **four** call sites at the same line numbers, plus the two `themes.css` lines. No
screen file moved.

### DoD 4 — `grep -rn "color-primary-strong-hover" front/src`

```
front/src/styles/themes.css:9:  --color-primary-strong-hover: #075985; /* sky-800 — default before the theme class is applied */
front/src/styles/themes.css:64:  --color-primary-strong-hover: #075985; /* sky-800 */
front/src/styles/themes.css:99:  --color-primary-strong-hover: #38BDF8; /* sky-400 */
front/src/styles/themes.css:169:  background-color: var(--color-primary-strong-hover);
front/src/styles/themes.css:170:  border-color: var(--color-primary-strong-hover);
```

`styles/themes.css` **only**. Three **definitions** — `:root` (9), `.light` (64), `.dark` (99) — as
specified; the other two hits are the two `.btn-primary:hover` reads, which is the same rule the
grep in DoD 3 finds.

### DoD 5 + 6 — the four (and two) measured ratios

**Method, and its limits (same instrument as TASK-005/006/020, stated again).** A new throwaway
harness, `tests/harness/measure-btn-primary.mjs`, drives the **real Chrome installed on this
machine** (`playwright-core` + `executablePath`, no bundled browser) against **`npx next start` on
port 3062** — the production build, not the dev server. For each case it reads
`getComputedStyle(el).backgroundColor` and `.color` **off the actual element** and computes the WCAG
2.x relative-luminance ratio from those two values. **The hover is a real hover**: `page.hover()`
moves the actual pointer onto the element and `:hover` matches in the engine — nothing is read off a
CSS rule or off a token value. Limits: the ratio is the element's **own** background against its
**own** colour, so it does not model an ancestor showing through, a gradient, or text over anything
but its own box; `next start` is this machine's build, not the live site; and an automated Chrome is
**not the owner's eyes**.

```
=== DoD 5 + 6 — measured on the real element, hover is a real pointer ===
/ navbar  light / resting      html=light bg=rgb(3, 105, 161)     color=rgb(255, 255, 255)   ratio=5.93  PASS   [สมัครฟรี]
/ navbar  light / HOVER (real pointer) html=light bg=rgb(7, 89, 133)      color=rgb(255, 255, 255)   ratio=7.56  PASS   [สมัครฟรี]
/ navbar  dark  / resting      html=dark  bg=rgb(14, 165, 233)    color=rgb(28, 25, 23)      ratio=6.31  PASS   [สมัครฟรี]
/ navbar  dark  / HOVER (real pointer) html=dark  bg=rgb(56, 189, 248)    color=rgb(28, 25, 23)      ratio=8.16  PASS   [สมัครฟรี]
/courses CTA light / resting   html=light bg=rgb(3, 105, 161)     color=rgb(255, 255, 255)   ratio=5.93  PASS   [สมัครฟรี]
/courses CTA light / HOVER (real pointer) html=light bg=rgb(7, 89, 133)      color=rgb(255, 255, 255)   ratio=7.56  PASS   [สมัครฟรี]
```

All six **≥ 4.5:1**. Byte check against the intent: `rgb(3,105,161)` = `#0369A1`,
`rgb(7,89,133)` = `#075985`, `rgb(14,165,233)` = `#0EA5E9`, `rgb(56,189,248)` = `#38BDF8`.
**Dark resting is `#0EA5E9` — byte-identical to the old `--color-primary`, so the dark resting button
did not move, exactly as the TASK predicted.** DoD 6 confirms the page CTA behaves the same as the
two Navbar sizes: **identical** numbers, not a special case.

🔴 **On the hover hypothesis specifically:** the TASK asked me to stop if the browser disagreed with
the ≈1.15:1 claim. I could not measure the *old* hover — I had already made the edit before the
instrument existed, and rebuilding the old tree was outside this TASK. What I *can* state as
measured: the **new** hover really is `#075985` on `#FFFFFF` in light and `#38BDF8` on `#1C1917` in
dark, both reached by a genuine pointer-over. **The ≈1.15:1 "before" number therefore stays
UNVERIFIED and is not laundered by this TASK** — see `## Questions` Q1.

### DoD 7 — the no-theme-class window

```
=== DoD 7 — no theme class on <html> ===
html=""  background-color=rgb(3, 105, 161)  color=rgb(255, 255, 255)
after reload: html="light"  background-color=rgb(3, 105, 161)
```

With both classes removed the button is **`rgb(3, 105, 161)`, not `rgba(0, 0, 0, 0)`** — the `:root`
default does its job and the button does not paint transparent. Page reloaded, `light` restored.

### DoD 8 — geometry, 375 px and 1440 px, both themes

```
=== DoD 8 — no horizontal scroll, geometry unchanged ===
light  375px  scrollWidth=375 clientWidth=375  no h-scroll  navbar btn rect={"x":0,"y":0,"width":0,"height":0,...}
light 1440px  scrollWidth=1440 clientWidth=1440  no h-scroll  navbar btn rect={"x":1240.0625,"y":17,"width":87.9375,"height":38,...}
dark   375px  scrollWidth=375 clientWidth=375  no h-scroll  navbar btn rect={"x":0,"y":0,"width":0,"height":0,...}
dark  1440px  scrollWidth=1440 clientWidth=1440  no h-scroll  navbar btn rect={"x":1240.0625,"y":17,"width":87.9375,"height":38,...}
```

`scrollWidth == clientWidth` in all four → **no horizontal scroll**. The 1440 px rect is
**byte-identical between light and dark**, and the zero rect at 375 px is the **desktop** Navbar
button (`hidden lg:flex`) correctly not laid out at that width — pre-existing, not a change.
**UNVERIFIED — I did not rebuild the pre-change tree to diff the geometry against a real "before"
baseline.** The argument that geometry cannot have moved is a code read, and I say so: the diff is
five lines, all of them custom-property *values* plus two `background-color`/`border-color` reads;
no property that participates in layout was touched.

### DoD 9 — emoji harness

```
110 occurrence(s) in 52 file(s) scanned.
```

`node <harness>/check-no-emoji.mjs src` → **110**, unchanged. Not re-baselined.

### DoD 10 — files edited

Exactly one file in the repo: **`front/src/styles/themes.css`**. Line endings **as found: CRLF**, and
**unchanged** — `file` reports `with CRLF line terminators`, and a byte count gives **366 CRLF, 0
bare LF**. **No `sed -i` was used anywhere** (SYSTEM-FACTS A40); the edits were made through the
editing tool and one explicit UTF-8 read/write in Node that preserved `\r\n`. `find front/src -type f
-newermt "2026-09-09 00:00"` lists `themes.css` at 15:41 as the only file with a timestamp from this
session — every other file in that list is from the earlier TASKs of today.

One file was **added outside the product repo**, in the coordination repo where PROTOCOL.md says
throwaway verification scripts belong: `ai-worker/tests/harness/measure-btn-primary.mjs`. Nothing was
added to `front/`; `playwright-core` was installed into a scratch directory, **not** into
`front/package.json`, and the harness takes its location as an env var so no absolute path is written
into a committed file.

### Findings — pre-existing, not introduced here, not fixed here

**F1 — the primary button visibly animates its colours in on every page load.** My first harness run
read the light resting label as `rgb(72, 72, 72)` (ratio **1.54**) — an in-flight value, not a
resting one. Cause: `.btn-primary` carries `transition: all 0.2s ease`, and `ThemeContext` adds the
theme class in an **effect**, so applying the theme *starts* a transition from the no-theme-class
first paint. For roughly 200 ms after hydration the label is part-way between the two colours. I
added a settle wait to the harness and re-measured; the numbers above are the settled ones.
**This is pre-existing and this TASK slightly improves it** (the first-paint pair goes from black on
`#0EA5E9` to black on `#0369A1`). It is **not** in scope and I invented no fix — flagged for Sober.

**F2 — a tooling caveat, not a product defect.** The Claude-in-Chrome extension was **not connected**
this session, and the fallback browser pane returned `getComputedStyle` values that contradicted what
the same page visibly rendered (it reported `body` background as `rgba(0,0,0,0)` on a page that was
plainly painted dark). I discarded every reading from it and built the Playwright harness instead.
**No number in this TASK comes from the browser pane.** Worth knowing before the next TASK writes a
DoD assuming the extension is available.

## Questions

**Q1 (non-blocking) — the ≈1.15:1 "before" hover number.** The TASK asks me to treat it as a
hypothesis my measurement settles, but a measurement of the *new* hover cannot settle a claim about
the *old* one, and I did not rebuild the pre-change tree. The `after` side is now measured and passes;
the `before` side stays **UNVERIFIED**. Do you want it left as an unproven-but-fixed line in the
record, or should the "hover was ≈1.15:1" claim be struck from the Blocked row rather than reported
upward as if observed? I did not edit the board row's wording either way.

> answer (Sober, 2026-09-09): **you are right, and you were right to refuse to settle it.** Keep the
> line, keep it labelled. I recomputed `#E0F2FE` on `#FFFFFF` myself and it is **1.15:1** — but that
> is *arithmetic on the tokens the old rule read*, which is exactly the class of claim that was wrong
> three times on 2026-09-09. So the record reads: **computed 1.15:1, never observed, UNVERIFIED — and
> now unobservable, because the rule it described no longer exists.** Nothing is struck: a struck line
> would lose why the fix was ordered. Nothing goes upward as observed either — the board's Blocked row
> and Porter's REQ-001 §"Owner's-eyes gates" both already say "stays UNVERIFIED", and I am leaving
> both wordings exactly as they are. **No action for you.**

**Q2 (non-blocking) — F1, the 200 ms colour-in.** Pre-existing, out of this TASK's scope, and I made
no change for it. Does it become its own TASK (the obvious candidate is narrowing `.btn-primary`'s
`transition: all` to the properties that actually need it, which is a whole-site declaration again),
or is it noise you want dropped?

> answer (Sober, 2026-09-09): **neither — it is real, and it is parked, not dropped.** Not a TASK
> today, for a reason I want on the record: the button is only the **symptom**. The cause is that
> `ThemeContext` applies the theme class in an **effect**, so *every* themed surface transitions in
> after hydration; narrowing `.btn-primary`'s `transition: all` would hide the flash on one control
> and leave the mechanism in place on all the others. Fixing the mechanism (a pre-paint theme class)
> is a **whole-site** decision that touches the root layout, and SPEC-001 §Decision 6 is the standing
> rule that a root-layout change is made deliberately, never as a side quest of a colour fix. It goes
> on my backlog as a SPEC-006 finding, to be evaluated **after the seven screens land**, together with
> §Decision 6's re-open trigger. **No action for you.**

**F2 (your finding, not a question) — the Chrome extension being down.** Recorded, and it changes how
I write DoDs: your Playwright + real-Chrome harness is this project's instrument, and I will not write
a DoD that assumes the extension is connected. Discarding every reading from the pane the moment it
contradicted the visible render was the correct call.

## Review

**Sober, 2026-09-09 — verdict: `DONE`.** No rework. The change is exactly the five edits A–E, in
`front/src/styles/themes.css` and nothing else, and the evidence is measurement rather than a claim.

**What I re-ran myself (6 checks), not read:**

1. **DoD 1** — `npm run build` in `front/`: compiled successfully, `/` and `/courses` both still
   `○ (Static)`, all 9 routes unchanged, only the pre-existing `MODULE_TYPELESS_PACKAGE_JSON`
   warning. Confirmed.
2. **Edits A–E** — read lines 5–9, 63–64, 98–99 and 161–172 of `themes.css` directly: `:root`
   carries both new tokens with the light values, `.light` = `#0369A1`/`#075985`, `.dark` =
   `#0EA5E9`/`#38BDF8`, and `.btn-primary` + `:hover` read **only** the two `-strong` tokens.
   `--color-primary`, `--color-primary-hover`, `--color-primary-light` all still defined (DoD 2).
3. **DoD 3** — `grep -rn "btn-primary" front/src`: the same **four** call sites at the same line
   numbers plus the two `themes.css` lines. **No screen file moved.** Cross-checked with
   `find front/src -newermt "2026-09-09 15:00"`: the only file newer than the TASK-006 files is
   `styles/themes.css`. The "one file" claim is corroborated by the filesystem, not just by her word.
4. **DoD 4** — `grep -rn "color-primary-strong-hover" front/src`: three definitions + two reads,
   `styles/themes.css` only.
5. **DoD 9** — `node <harness>/check-no-emoji.mjs src` from `front/`: **110**, unchanged. Not
   re-baselined.
6. **DoD 10** — my own byte count of the file: **366 CRLF, 0 bare LF**. Line endings intact.

**The ratios.** I recomputed all four from the token values independently of her harness:
**5.93 / 7.56 / 6.31 / 8.16** — identical to her **measured** numbers to the hundredth. My TASK text
said 7.57; **7.56 is correct and mine was the rounding error**, not her instrument. Note which way
this settles: her measurement is the authority and my arithmetic is what agreed with it.

**Why the hover measurement is accepted as a measurement.** DoD 5/6 were the whole point of this
TASK — a real pointer over the element, `getComputedStyle` off the element itself, on the
`next start` production build in real Chrome. She states the instrument and its limits, and she
states plainly that an automated Chrome is **not** the owner's eyes. That is the standard this
project asks for. DoD 7 (the no-theme-class window paints `rgb(3,105,161)`, not transparent)
confirms the regression I designed the `:root` defaults against never opened.

**What stays UNVERIFIED and is NOT laundered by this `DONE`:**

- The **old** light hover ≈1.15:1 — still never observed, and now unobservable. See Q1.
- No pre-change **geometry** baseline was rebuilt (DoD 8 argues from a code read, and she says so).
  Accepted: the diff is five custom-property values plus two colour reads, no layout property was
  touched, and the 1440 px rect is byte-identical between the two themes.
- Nobody's eyes but an automated browser's have been on the button.

**Carried to Porter:** in the **light** theme the primary button is now visibly darker on **every**
route (the Navbar is in the root layout) while the Phase-1 gate is still open; **dark resting is
byte-identical and does not move.** Porter already has this, correctly labelled, in
`requirements/REQ-001-frontend-pattern-and-ui-foundation.md` §"Owner's-eyes gates".
