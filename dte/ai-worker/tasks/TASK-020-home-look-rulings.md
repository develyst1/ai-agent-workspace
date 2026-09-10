# TASK-020: `/` (home) — the three look rulings that close Phase 1

- Source: **SPEC-006 §Rulings** (R-SPACE-2a/3a/4a, **R-COLOUR-6**) — authored 2026-09-09 by Sober
  in answer to TASK-005 §Questions Q2/Q3/Q4
- Owner: **FE (Fern)**
- Status: **DONE** — reviewed 2026-09-09 (Sober); implemented + verified 2026-09-09 (Fern); written 2026-09-09 (Sober)
- Depends on: **TASK-005 (`DONE`)**

🔴 **Why this exists, plainly: TASK-005 was correct and is `DONE`. These three are defects in the
text I wrote** — SPEC-006's rules and TASK-005 §3's own instructions. You measured all three, handed
them back rather than deciding, and that is exactly right. This TASK is my decision, implemented.

🔴 **This is the last unit before the owner looks at Phase 1** (`SYSTEM-FACTS.md` A43, "ให้ดูก่อน").
Three edits, two files, no new dependency, no new Thai string.

## What to do

### 1. The categories band gets a real background (TASK-005 §Q2)

`front/src/components/partials/Home/HomeContent.tsx:63`, the categories `<section>`:

- `bg-theme-secondary/50` → **`bg-theme-secondary`** (drop the `/50`).
- **Also delete `backdrop-blur-sm`** on the same element. It is dead once the background is opaque —
  a `backdrop-filter` paints nothing behind an opaque surface.
- Everything else on that line (`py-16 lg:py-20`, `relative`) is unchanged.

Reason, so you can check me: `bg-theme-secondary` is a hand-written rule at
`front/src/styles/themes.css:102`, not a Tailwind colour utility, so Tailwind emits no
`.bg-theme-secondary\/50` at all — the band has rendered transparent since before this team existed.
`grep -rn "bg-theme-secondary/" front/src` returns this one line and nothing else in the tree.

### 2. A theme-scoped accent token (TASK-005 §Q3/Q4)

`front/src/styles/themes.css` — **add one declaration inside each existing theme block**, next to
the other colour tokens. **Change no existing declaration and add no other property.**

```css
/* inside .light (the block that starts at line 31) */
--color-primary-strong: #0369A1; /* sky-700 — accent that clears 4.5:1 on --bg-primary */

/* inside .dark (the block that starts at line 64) */
--color-primary-strong: #0EA5E9; /* sky-500 — accent that clears 4.5:1 on --bg-primary */
```

Both values are steps on the sky ramp already named in that file, so no new colour enters the
system (SPEC-006 R-COLOUR-6). Nothing outside `HomeContent.tsx` references this property, so no
other screen can move — DoD 4 proves it.

### 3. Use it, in `HomeContent.tsx` only

- **The two accent spans** (`:44` and `:89`): `text-[var(--color-primary)]` →
  **`text-[var(--color-primary-strong)]`**. Nothing else on those spans changes; the Thai text is
  not touched.
- **The hero badge** (`:30`): `bg-[var(--color-primary)] text-white` →
  **`bg-[var(--color-primary-strong)] text-[var(--text-inverse)]`**. This is the pairing
  `.btn-primary` already uses (`themes.css:156-157`). The rest of the badge — `mb-6 inline-flex
  items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg animate-fade-in-down
  transition-all duration-300` — is unchanged, and the `animate-pulse` on `Sparkles` stays.
- **Nothing else on the page changes.** `btn-primary` / `btn-outline` on the CTA keep
  `--color-primary`; the hero gradient span is untouched; `--color-primary` itself is untouched.

**Expected ratios** (mine, computed from the hex values; yours in the browser is what counts):

| pair | before | after |
|---|---|---|
| accent span on page bg — light | 2.65 | **5.68** |
| accent span on page bg — dark | 6.31 | **6.31** (unchanged) |
| badge text on badge surface — light | 2.77 | **5.93** |
| badge text on badge surface — dark | 2.77 | **6.31** |

If your measurement disagrees with any of those four, **the measurement wins** and it comes back to
me as a §Question — do not adjust a value to hit my number.

## Explicitly NOT in this task

- **No other file.** Only `front/src/components/partials/Home/HomeContent.tsx` and
  `front/src/styles/themes.css`. Not `globals.css`, not `layout.tsx`, not `theme-tokens.ts`, not any
  route, and **none of the five shared components** (`ui/CategoryCard`, `ui/FeatureCard`,
  `ui/StatCounter`, `ui/AnimatedBackground`, `common/SearchAI`) — SPEC-006 §"The shared-component
  rule" is unchanged.
- **No existing `themes.css` declaration is edited or reordered.** Two added lines, nothing else.
- No new Thai string and no reworded one. No new dependency. No antd component. No hex literal in
  `HomeContent.tsx`.
- No `sed -i`, no line-ending conversion (`SYSTEM-FACTS.md` A40).
- The four spacing values from your §Q1 (`py-2.5`, `py-4`, `gap-2`, `gap-4`) **stay as they are** —
  answered out of scope; do not touch them.

## Definition of Done

Paste the actual command and its actual output for each.

1. `npm run build` succeeds, no new warning; paste the `/` row — it must still be `○ (Static)`.
2. `grep -n "color-primary\|backdrop-blur\|bg-theme-secondary\|text-white" front/src/components/partials/Home/HomeContent.tsx`
   → `--color-primary-strong` on the badge and the two spans; **no** `backdrop-blur`; **no**
   `text-white`; `bg-theme-secondary` with no `/50`; `--color-primary` surviving only where
   `btn-primary`/`btn-outline` put it (i.e. nowhere in this file). Paste the hits.
3. `git diff --stat HEAD -- front/src/styles/themes.css` → **2 insertions, 0 deletions.** Paste it.
4. `grep -rn "color-primary-strong" front/src` → hits in **exactly two files**,
   `styles/themes.css` and `partials/Home/HomeContent.tsx`, and nowhere else. This is the proof that
   no other screen can have moved.
5. **Measured contrast, light and dark**, for the four pairs in the table above, by the same probe
   method you used on TASK-005 (state the method and its limits again). Paste the numbers.
6. Measured: the categories band's computed `background-color` is **not** `rgba(0,0,0,0)` in either
   theme — paste both values.
7. `/` at 375 px and at 1440 px — no horizontal scroll; the band's new background does not change
   any geometry. Paste `scrollWidth`/`clientWidth` at both.
8. `node <harness>/check-no-emoji.mjs src` → still **115**, unchanged (this TASK adds and removes no
   emoji). Do not re-baseline the harness.
9. `git status --porcelain` (read-only, **commit nothing**) — the only paths this TASK adds to the
   pre-existing set are the two named above. Name anything else plainly rather than explaining it
   away, exactly as you did on TASK-005.
10. State each touched file's line endings as found and confirm they are unchanged.

## Implementation Notes

**Fern, 2026-09-09 — status `TODO` -> `IN_PROGRESS` -> `REVIEW`.** All three edits applied exactly as
written; **two files, nothing else**. Every number below is real output from this session.

**Files changed (2, both in `front/`):**

1. `front/src/components/partials/Home/HomeContent.tsx` — 3 edits, 4 lines:
   - `:30` badge `bg-[var(--color-primary)] text-white` -> `bg-[var(--color-primary-strong)] text-[var(--text-inverse)]`
   - `:44` and `:89` accent spans `text-[var(--color-primary)]` -> `text-[var(--color-primary-strong)]`
   - `:63` band `bg-theme-secondary/50 backdrop-blur-sm relative` -> `bg-theme-secondary relative`
   No Thai string touched; `py-16 lg:py-20`, `relative`, the badge's remaining classes and the
   `animate-pulse` on `Sparkles` are byte-identical.
2. `front/src/styles/themes.css` — **2 inserted lines, 0 edited, 0 deleted**: `--color-primary-strong`
   as the last declaration of `.light` (`:61`) and of `.dark` (`:95`), values and comments verbatim
   from the TASK. No existing declaration reordered.

Applied with a Node exact-string replace that asserts the occurrence count of every pattern (it
throws rather than writing if a count is off). **No `sed -i`** (`SYSTEM-FACTS.md` A40).

### DoD 1 — `npm run build`

```
$ cd front && npm run build
> next build --turbopack
  Next.js 16.2.9 (Turbopack)
(node:6484) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///H:/dte/dte/front/tailwind.config.ts?id=1788938371391 is not specified and it doesn't parse as CommonJS.
  Compiled successfully in 2.7s
  Finished TypeScript in 3.8s ...
  Generating static pages using 11 workers (10/10) in 462ms

Route (app)
| O /
| O /_not-found
| O /about
| f /classroom/[id]
| O /courses
| O /login
| O /register
| O /teach
| O /verify-email

O  (Static)   prerendered as static content
f  (Dynamic)  server-rendered on demand
```

`/` is still **`O (Static)`**, unchanged. The one warning is the **pre-existing, accepted**
`MODULE_TYPELESS_PACKAGE_JSON` about `tailwind.config.ts` (TASK-001 §Q4; also present in TASK-005's
build, TASK-005 §DoD1). **No new warning.**

### DoD 2 — grep of `HomeContent.tsx`

```
$ grep -n "color-primary\\|backdrop-blur\\|bg-theme-secondary\\|text-white" front/src/components/partials/Home/HomeContent.tsx
30:            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-strong)] text-[var(--text-inverse)] px-5 py-2.5 text-sm font-semibold shadow-lg animate-fade-in-down transition-all duration-300">
44:              [thai] <span className="font-semibold text-[var(--color-primary-strong)]">[thai]</span>[thai]
63:      <section className="py-16 lg:py-20 bg-theme-secondary relative">
89:              [thai] <span className="font-semibold text-[var(--color-primary-strong)]">[thai]</span>[thai]
```

(Thai elided here only to keep this block readable; the file's Thai is untouched — see the byte
check below.) 4 hits, all `--color-primary-strong`. **No `backdrop-blur`. No `text-white`.**
`bg-theme-secondary` with **no `/50`**. Bare `--color-primary` survives **nowhere** in this file.

### DoD 3 — `themes.css` diff stat

```
$ git diff --stat HEAD -- front/src/styles/themes.css
 front/src/styles/themes.css | 2 ++
 1 file changed, 2 insertions(+)
```

**2 insertions, 0 deletions.** Read-only; nothing staged, nothing committed.

### DoD 4 — the containment proof

```
$ grep -rn "color-primary-strong" front/src
front/src/components/partials/Home/HomeContent.tsx:30
front/src/components/partials/Home/HomeContent.tsx:44
front/src/components/partials/Home/HomeContent.tsx:89
front/src/styles/themes.css:61:  --color-primary-strong: #0369A1; /* sky-700 — accent that clears 4.5:1 on --bg-primary */
front/src/styles/themes.css:95:  --color-primary-strong: #0EA5E9; /* sky-500 — accent that clears 4.5:1 on --bg-primary */
```

**Exactly two files.** No other screen can have moved.

### DoD 5 — measured contrast, both themes

**Method (the same as TASK-005 §7, and the same limitation, restated).** `npx next dev --turbopack
-p 3071`, **localhost only** — `NEXT_PUBLIC_API_URL` untouched, production never contacted. The only
browser available to me is the **hidden preview pane**, where `getComputedStyle` on the
*server-rendered* tree goes stale, so I measure with **freshly inserted probe elements carrying the
page's exact class strings**, per theme, against the real stylesheet in the real browser. Theme is
switched the way the app switches it (`.light` / `.dark` on `<html>`). Ratios are WCAG 2.x, computed
from the measured `rgb()` values.

| pair | Sober's target | **measured** |
|---|---|---|
| accent span on page bg — light | 5.68 | **5.68** — `rgb(3,105,161)` on `rgb(250,250,249)` |
| accent span on page bg — dark | 6.31 | **6.31** — `rgb(14,165,233)` on `rgb(28,25,23)` |
| badge text on badge surface — light | 5.93 | **5.93** — `rgb(255,255,255)` on `rgb(3,105,161)` |
| badge text on badge surface — dark | 6.31 | **6.31** — `rgb(28,25,23)` on `rgb(14,165,233)` |

**All four match your targets to 2 dp — nothing to hand back.** All four clear 4.5:1. Note the badge
now resolves `--text-inverse` per theme (white in light, stone-900 in dark), which is what killed the
old flat 2.77.

### DoD 6 — the band actually has a background now

Probe carrying the band's exact new class string `py-16 lg:py-20 bg-theme-secondary relative`:

| theme | before (TASK-005, with `/50`) | **after** |
|---|---|---|
| light | `rgba(0, 0, 0, 0)` | **`rgb(245, 245, 244)`** — `--bg-secondary`, stone-100 |
| dark | `rgba(0, 0, 0, 0)` | **`rgb(41, 37, 36)`** — `--bg-secondary`, stone-800 |

Neither is `rgba(0,0,0,0)`. I did not stop at a synthetic probe: I also **cloned the real
`<section>` node** (same class string, same parent, inserted as its own sibling) and read that —
**`rgb(245,245,244)` / `rgb(41,37,36)`**. The real element, in its real cascade position, resolves
the colour.

🔴 **UNVERIFIED, stated plainly:** reading the *original* server-rendered `<section>` directly still
returns `rgba(0,0,0,0)` in both themes, before and after a forced reflow. Every freshly created node
with the identical class in the identical position returns the colour, so this is the
**hidden-pane stale style-recalc artifact TASK-005 §7 already documented**, not the page — but I did
not see it painted. **What would settle it: the owner (or any visible browser) seeing the categories
band sit on a surface distinct from the hero.**

### DoD 7 — 375 px and 1440 px, no horizontal scroll

```
375 x 812 : scrollWidth 375   clientWidth 375   -> no h-scroll ; band rect 375 x 636
1440 x 900: scrollWidth 1432  clientWidth 1432  -> no h-scroll ; band rect 1432 x 472
```

(1432 = 1440 minus the scrollbar; identical to TASK-005's numbers.) Geometry is unchanged by
construction too: `background-color` never affects layout, and `backdrop-blur-sm` sets
`backdrop-filter`, which is paint-only — while `bg-theme-secondary/50` emitted no CSS at all, so
nothing was lost when it went.

### DoD 8 — emoji harness

```
$ cd front && node <harness>/check-no-emoji.mjs src
115 occurrence(s) in 50 file(s) scanned.
```

**115, unchanged.** Harness not re-baselined.

### DoD 9 — `git status --porcelain` (read-only, nothing committed)

```
 M front/src/app/page.tsx
 M front/src/components/partials/Login/LoginContent.tsx
 M front/src/components/ui/Button/BaseButton.tsx
 M front/src/components/ui/Checkbox/BaseCheckbox.tsx
 M front/src/components/ui/Input/BaseInput.tsx
 M front/src/styles/themes.css
?? front/src/components/partials/Home/
```

Named plainly: **the only path this TASK adds to the pre-existing set is
`front/src/styles/themes.css`.** `HomeContent.tsx` produces **no new line** because it sits inside
`front/src/components/partials/Home/`, which git already lists as a single untracked directory
(created by TASK-005). The other five entries are pre-existing (TASK-004 / TASK-005). **Nothing else
appears.** No `git add`, no `commit`, no `push` — none was run.

**One transient entry, named rather than explained away:** while the dev server was running,
`git status` also listed ` M front/next-env.d.ts` — Next.js rewrites that generated file's single
import line between the `build` form (`./.next/types/routes.d.ts`, what `HEAD` has) and the `dev`
form (`./.next/dev/types/routes.d.ts`). It is tool output, not an edit of mine; the file says
`// NOTE: This file should not be edited`. Re-running `npm run build` after stopping the dev server
returned it to the `HEAD` form, and the listing above is the **final** state.

### DoD 10 — line endings

Counted as bytes with Node (`latin1`), before the edit and after:

| file | before | after |
|---|---|---|
| `HomeContent.tsx` | 162 CRLF, 0 bare LF | **162 CRLF, 0 bare LF** |
| `themes.css` | 360 CRLF, 0 bare LF | **362 CRLF, 0 bare LF** (+2 = my two inserted lines) |

**Pure CRLF in both files, unchanged.** No `sed -i` anywhere (A40).

### Boundaries kept

No `back/`, no SQL, no database, no production (dev server on **localhost:3071**, stopped after
measuring), no deploy / ssh / pm2, no git write, no new dependency, no antd component, no new or
reworded Thai string, no hex literal in `HomeContent.tsx`, and the four §Q1 spacing values
(`py-2.5`, `py-4`, `gap-2`, `gap-4`) untouched. No file outside the two named was written.

## Questions

**Fern 2026-09-09: none.** All three edits were fully specified, all four of your target ratios
reproduced to 2 dp, and no look call was left open. The one thing I could not settle is written as
an `UNVERIFIED` in §DoD 6 — it needs eyes, not a ruling.

(Ask here; Sober answers as `> answer: ...`. A look no SPEC-006 rule covers is a question, never
your own call — and a target of mine that disagrees with a live measurement loses to the
measurement, which you hand back to me.)

## Review

**Sober, 2026-09-09 — verdict: `DONE`. No rework.** I re-ran the checkable DoD against the real
repo rather than reading the paste. Every one reproduced.

**Re-run by me (7 of 10):**

- **DoD 1** — `npm run build` exit 0, `/` still `○ (Static)`, same 9 routes; the only warning is the
  pre-existing `MODULE_TYPELESS_PACKAGE_JSON` (TASK-001 §Q4). No new warning.
- **DoD 2** — the grep returns exactly your 4 hits, all `--color-primary-strong`; **no**
  `backdrop-blur`, **no** `text-white`, `bg-theme-secondary` with no `/50`, bare `--color-primary`
  nowhere in the file.
- **DoD 3** — `git diff --stat HEAD -- front/src/styles/themes.css` → `1 file changed, 2 insertions(+)`.
- **DoD 4** — `grep -rn "color-primary-strong" front/src` → the same 5 lines in exactly 2 files.
- **DoD 5** — I recomputed all four ratios from the token hexes independently (WCAG 2.x relative
  luminance): **5.68 / 6.31 / 5.93 / 6.31**. Identical to your measurements to 2 dp. The pairings are
  right, too: `:44` sits in the hero `<section>` (`:26`) and `:89` in the `<section>` at `:82` —
  neither carries a background class, so `--bg-primary` is the correct backdrop token; the badge's
  own surface is `--color-primary-strong` with `--text-inverse` on top, per theme.
- **DoD 8** — `check-no-emoji.mjs src` → **115 occurrence(s) in 50 file(s)**, unchanged.
- **DoD 9** — `git status --porcelain` matches yours line for line, including the single untracked
  `front/src/components/partials/Home/`. Nothing committed by me either.

**One check of my own you were not asked for, because DoD 6 is the weak one.** Your band and token
evidence came from a dev server; I went to the **production CSS bundle** the build just emitted
(`front/.next/static/chunks/2r89lqrzmsm_l.css`):

```
.bg-theme-secondary{background-color:var(--bg-secondary)}
.light{ … --bg-primary:#fafaf9 … --color-primary-strong:#0369a1 … }
.dark { … --bg-primary:#1c1917; --bg-secondary:#292524; --text-inverse:#1c1917 … --color-primary-strong:#0ea5e9 … }
grep -c 'bg-theme-secondary\\/50'  → 0
```

So in the shipped stylesheet the band rule exists and resolves to `--bg-secondary` (`#F5F5F4` light /
`#292524` dark — exactly the `rgb(245,245,244)` / `rgb(41,37,36)` you measured), both new tokens are
present and correctly theme-scoped, and no `/50` variant is emitted anywhere. That closes the
*mechanism* half of your DoD 6 more firmly than a dev-server probe could.

**Your UNVERIFIED stands and is carried, not laundered.** Nobody has *seen* the band painted. The
CSS proves the rule; only eyes prove the pixel. It goes to Porter as part of the Phase-1 preview,
which is where it belongs — the owner's A43 look is the settling test.

**One residual I am adding myself, so it is on the record and not discovered later.**
`AnimatedBackground` is `fixed inset-0 -z-10` and paints blurred sky/cyan/blue orbs at ~20% alpha
(`mix-blend-multiply` in light) behind the whole page. The four ratios above are therefore
**token-pair** ratios; where an orb sits under an accent span the effective backdrop is slightly
darker than `#FAFAF9`, so the real light-theme figure can drift a little below 5.68. With 5.68
against a 4.5 threshold there is headroom and I am **not** ordering a change — but it is a genuine
limit of the method, it applies to every screen this pass touches, and Phase 2 should measure
against the composited backdrop rather than the token wherever a rule sits close to 4.5.

**A consequence of edit 1 worth naming for the preview:** the band is now opaque, so within its rect
it *hides* the animated orbs it previously let through. That is the surface distinction we asked for
— it is also the most visible single change on the page, and it is the thing to look at first.

**Boundaries:** I read and built only; no product code written by me, no `back/`, no database, no
production, no git write. Build artifacts under `front/.next/` are the local build's own output.

**Phase 1 (SPEC-006) is now complete: TASK-005 `DONE`, TASK-020 `DONE`. The A43 "ให้ดูก่อน"
owner-preview gate I told Porter to hold is OPEN.**
