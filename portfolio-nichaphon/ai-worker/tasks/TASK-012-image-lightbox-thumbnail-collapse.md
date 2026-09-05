# TASK-012: DEF-1 — `/about` lightbox thumbnails render 0x0

- Source: **DEF-1** (`tests/TEST-002-sq7-modal-drawer-repro.md` §Defects, Tanya
  2026-09-03). **Ships inside REQ-002** per the owner's `SQ10 = รวมใน REQ-002`
  (2026-09-04) — not written from SPEC-002, but accepted with it. See "Scope".
- Status: **DONE** (Sober 2026-09-04 — 1 file / 1 line, scope + `<span>` + import
  graph + `tsc` re-verified by me; the rendered A/B closes my §Diagnosis limit.
  Two checks stay UNVERIFIED, neither a FAIL: the modal box (FQ35) and the
  painted pixel — carried to TASK-011 §7 and SQ8's fifth QA eye. See §Review.
  Was REVIEW — Fern 2026-09-04; was TODO — Sober 2026-09-04, SQ10 answered)
- Owner: Fern (FE)
- Depends on: none by file — it touches no file any other TASK may touch. The
  ordering below is an evidence call, not a conflict one.
- Repo: `portfolio-nichaphon-web`, `front/src/components/common/`

## Scope — settled 2026-09-04, the block is lifted

DEF-1 is a **pre-existing functional defect** (provenance below), and the owner
has now placed it: **`SQ10 = รวมใน REQ-002`** — the repair ships **inside
REQ-002**, with no separate defect REQ. Recorded by Porter in
`requirements/REQ-002-whole-site-step-up-five-routes.md` §Questions DEF-1.

Two consequences, both mine to state:

- **REQ-002 no longer reaches `SPEC_DONE` or `DELIVERED` until this TASK is
  `DONE`.** It is not an optional extra any more; it is the sixth piece of work
  REQ-002 is accepted on.
- **Where it sits in the queue (SA scheduling call, 2026-09-04).** Do it
  **after** TASK-010's rework lands and **before** TASK-011. Not first, because
  TASK-010 is already open in your hands and its rework is two to four lines of
  `theme.ts`. Not last, because TASK-011 is the evidence sweep that fixes
  nothing: its `/about` console check and REGRESSION's S13 ("no image at 0x0")
  both read the state this TASK creates, so sweeping before the repair would
  bank a known-fail on purpose. Nothing here shares a file with TASK-010 or
  TASK-011, so the order is about evidence, not about conflicts.

## The defect

All nine `ImageLightbox` thumbnails on `/about` (four certificates, five
testimonials) render at 0x0 px: the visitor sees the hint bar and no image at
all. The images themselves are fine — they load, report natural sizes, and
display correctly **inside** the opened modal. Nine console warnings.
Evidence and screenshots: `tests/TEST-002-...` §Defects and
`../project-docs/qa-test002-2026-09-03/`.

## Diagnosis (Sober, 2026-09-03) — a code read, **not** a rendered proof

`front/src/components/common/ImageLightbox.module.css`:

```css
.frame {
  position: relative;      /* does not change `display` */
  width: 100%;             /* ignored on a non-replaced inline box */
  aspect-ratio: var(--lightbox-ratio, 4 / 3);   /* likewise ignored */
}
```

`.frame` is a `<span>` (`ImageLightbox.tsx:30`), so it is `display: inline` and
neither `width` nor `aspect-ratio` applies to it. Its only child is a
`next/image` with `fill`, which is absolutely positioned and therefore out of
flow — so the span has no in-flow content, collapses, and the image resolves
against a 0x0 containing block.

The corroborating half is in the same file: the **modal** frame `.full` is a
`<div>` (block) with an explicit `height`, and that one renders — which is
exactly the difference QA observed between the thumbnail and the opened image.

**Provenance — established, with its limit stated.** Both `ImageLightbox.tsx` and
`ImageLightbox.module.css` were last modified in commit `7a58154` (2026-08-27),
as were `AboutCertificates.tsx` and `AboutTestimonials.tsx`; the working tree is
clean against `HEAD` for all four; and no rule affecting `span` display was added
or removed from `globals.css` between `7a58154` and `HEAD`. TASK-008 touched none
of these files (its diff is `partials/About` + `partials/Services`, and A4 left
both lightbox consumers alone by name). **Therefore DEF-1 predates the team's
first commit and did not arrive with TASK-008.** The limit: that is a
code-provenance argument from a static read, not a rendered before/after — I did
not run the site. If a rendered before/after ever contradicts it, the render wins.

## What to do

**One change, in `ImageLightbox.module.css` only:** give `.frame` a block-level
box so `width` and `aspect-ratio` apply — `display: block` on the existing rule.

- **Keep the element a `<span>`.** `<button>`'s content model is phrasing
  content; swapping it to a `<div>` would be invalid HTML. The `.tsx` is not
  expected to change at all — if you believe it must, that is a stop-and-ask.
- No new token, no new hex, no `!important`, no change to `.trigger`, `.hint`,
  `.full`, or to either consumer (`AboutCertificates`, `AboutTestimonials`).
- No change to `sizes`, `ratio` defaults, `alt` text or any string. R4 applies.
- `ImageLightbox` is imported on `/about` only (verified: two consumers, both in
  `partials/About`), so no other route can move. Prove it, don't assume it.

## Definition of Done

Run from `front/`. Paste the actual output.

- [x] `npx tsc --noEmit` exits 0; `npm run build` exits 0 with no warning line;
      `.next` deleted afterwards.
- [x] All nine `/about` thumbnails report a non-zero `getBoundingClientRect()`
      at 1280x800 **and** 360x740, at the intended aspect ratio. Paste the nine
      rects.
- [x] The nine `fill`-related console warnings are gone; `/about`'s console is
      empty (errors *and* warnings) at both viewports.
- [ ] The opened modal image still renders — `.full` is untouched and still
      correct. If a `Modal` will not open for you, say so and leave this box
      unticked rather than asserting it (SQ7 gate).
- [x] The other five routes still load with an empty console and are visually
      unmoved; `/`'s `<body>` element list is byte-identical to HEAD (the A/B
      method from TASK-007 §Third pass).
- [x] Contrast of `.hint` on the thumbnail is re-measured now that the frame has
      area; at or above 4.5:1, or a stop-and-ask.
- [x] No horizontal scroll at 360px on `/about`.
- [x] `git diff --stat` touches **only**
      `src/components/common/ImageLightbox.module.css`.

- [x] **Read before you tick the modal box:** TASK-010 FQ35 established that this
      harness never runs an animation frame (`visibilityState hidden`, no rAF in
      1500 ms, blank screenshots), so **anything that opens via a Mantine
      transition cannot be verified here** — it is not evidence that the site is
      broken. If the lightbox `Modal` will not open for you, that box stays
      unticked and says **UNVERIFIED (FQ35)**, never FAIL and never a workaround.
      The thumbnail rects, the console and the contrast are all measurable
      without opening anything, so the TASK is finishable as written.
- [x] **No git write, no branch, no commit, no deploy, no `pm2`, no ssh.**

## Implementation Notes

### Fern, 2026-09-04 — one line, and a rendered before/after that closes your open limit

**The change.** Exactly what the TASK prescribed, nothing else:

```diff
--- a/front/src/components/common/ImageLightbox.module.css
+++ b/front/src/components/common/ImageLightbox.module.css
@@ -15,6 +15,7 @@
 .frame {
+  display: block;
   position: relative;
   width: 100%;
   aspect-ratio: var(--lightbox-ratio, 4 / 3);
```

`git diff --stat` for my work = `front/src/components/common/ImageLightbox.module.css | 1 +`,
**1 file changed, 1 insertion(+)**. The `.tsx` was not touched — the element is still a
`<span>`. `.trigger`, `.hint`, `.full`, both consumers, `theme.ts`, `globals.css` and every
string are untouched. No new token, no hex, no `!important`. (The tree also carries the 19
files of TASK-008/009/010, all already DONE and uncommitted, plus the human's `.next.zip` —
same 19 + 1 Sober counted at TASK-010 round 2; my file makes 20.)

### Your diagnosis is now proved by render, not only by code read

Your §Diagnosis stated its own limit: "a code-provenance argument from a static read, not a
rendered before/after". I ran the A/B on the live dev server, at 1280x800, in a fresh tab:

| state (file content) | `getComputedStyle(.frame).display` | nine rects |
|---|---|---|
| **HEAD, byte-identical** (line removed) | `inline` | all nine **0.00x0.00** |
| **HEAD + the one line** | `block` | all nine non-zero, see below |

The revert was temporary and the file was returned to HEAD + the one line; the blob hash is
back to the same `4172266` and the diff above is what stands. **The render agrees with your
read** — nothing contradicts the provenance argument.

### The nine rects (`getBoundingClientRect()`, `display`, measured aspect)

**1280x800** — certificates `4 / 3`, testimonials `16 / 10`:

```
block 244.00x183.00  ar=1.3333  Prompt Engineering with GitHub Copilot
block 244.00x183.00  ar=1.3333  DevLab Certificate
block 244.00x183.00  ar=1.3333  Employee Survival
block 244.00x183.00  ar=1.3333  Essential SQL for Everyone
block 336.66x210.41  ar=1.6000  Client conversation 1
block 336.67x210.41  ar=1.6001  Client conversation 2
block 336.66x210.41  ar=1.6000  Client conversation 3
block 336.66x210.41  ar=1.6000  Client conversation 4
block 336.67x210.41  ar=1.6001  Client conversation 5
```

**360x740**: four at `318.00x238.50` (ar 1.3333) and five at `318.00x198.75` (ar 1.6000).
The `<img>` box equals the frame box in every case at both viewports. 1.3333 = 4/3 and
1.6000 = 16/10 exactly, so the `--lightbox-ratio` inline var is being honoured now.

### Console

Fresh tab per viewport, six routes each: **zero errors, zero warnings** at 1280x800 and at
360x740 (`onlyErrors` → "No console logs"; warn filter → "No console logs"). The only
entries are one React-DevTools `info` per load plus dev-server `[Fast Refresh] rebuilding`
`log` lines caused by my own edits.

**One honest qualification on that DoD box.** I ticked it for what it asserts and I verified
— `/about`'s console is empty at both viewports. I did **not** reproduce Tanya's nine
`fill` warnings first: in the HEAD-state A/B above the nine images never loaded at all
(`complete=false`, `currentSrc=""`), because a 0x0 lazy image never intersects the viewport,
so `next/image`'s size warning never fires in this harness. So "the nine warnings are gone"
is **absent-now**, not **reproduced-then-gone**. Her nine warnings remain her evidence.

### Images resolve at the frame's new size

The harness will not scroll (`window.scrollTo` + `scrollIntoView` leave `scrollY = 0` —
same wall as FQ35), so the nine lazy images never enter the viewport and `complete` stays
false. I therefore loaded each one's own largest `srcset` candidate through the Next image
optimizer in-page; all nine decode:

```
1684x1240 /images/certificates/prompt-engineering-copilot.png
1800x1270 /images/certificates/devlab-certificate.png
2000x1414 /images/certificates/certificate_employee_survival.png
1684x1240 /images/certificates/certificate-essential-sql-for-everyone.png
1626x718  /images/reviews/placeholder-review-1.png
1772x1430 /images/reviews/placeholder-review-2.png
1802x814  /images/reviews/placeholder-review-3.png
1634x1120 /images/reviews/placeholder-review-4.png
1846x1608 /images/reviews/placeholder-review-5.png
```

The box now has area, the ratio is right, and the asset behind each box is real and decodes.
**What no one has seen in this harness is the painted pixel** — that a visitor now sees the
image inside that box is UNVERIFIED here and wants a QA eye or the human's. I am not
claiming it.

### `.hint` contrast, re-measured with the frame carrying area

All nine: `rgb(169,163,186)` on `rgb(21,17,34)` (the ground discovered by walking up to
`ImageLightbox_trigger`, i.e. `--site-surface`) = **7.61:1**, hint box `244.0x35.1` /
`336.7x35.1`. Above 4.5:1 everywhere; no stop-and-ask. Same sampler model as TASK-010,
whose placeholder row also read 7.61 against your recomputed 7.60.

### R6 Home non-regression, done as a real A/B

`/`'s `<body>` element list (tag + className per element, joined) captured in both file
states at both viewports. All four captures: **170 elements, 4536 chars, FNV-1a
`ea2e272f`** — identical. I compared by count + length + hash rather than pasting 170 lines;
say the word if you want the raw list. 170 matches TASK-009's count.

### Other DoD

- `npx tsc --noEmit` → **exit 0**, run twice: on the first application of the line and again
  on the exact tree I am submitting after the A/B revert/restore.
- `npm run build` → **exit 0** both times, `✓ Compiled successfully`, no warning line; the
  ten static pages generate. `.next` **deleted** after each build and after dev.
- No horizontal scroll at 360 on `/about`: `scrollWidth === clientWidth === 360`. At 1280
  it is 1265 = 1265, unchanged from TASK-009's figure.
- Scope proof, not assumption: `ImageLightbox` → `AboutCertificates` + `AboutTestimonials`
  → `AboutContent` → `src/app/about/page.tsx`, and nothing else imports any of them
  (`grep -rn` over `src`, all three levels). No other route can move.
- Dev on **3010** (3000 held by a foreign process), stopped afterwards; the port is free.
  No git write, no branch, no commit, no deploy, no `pm2`, no ssh.

### The modal box stays unticked — UNVERIFIED (FQ35)

I clicked a thumbnail trigger at 1280x800 and waited 1500 ms. **Nine `mantine-Modal-root`
divs are in the DOM and empty** — the root portal mounts with its size vars
(`--modal-size: calc(68.75rem * ...)`, `--modal-y-offset`, `--mb-z-index: 200`), but no
`Modal-content` and no `.full` child ever appears. That is FQ35's wall again, so per your
instruction the box stays unticked and says **UNVERIFIED (FQ35)** — not FAIL, and I did not
work around it. `.full` is untouched by this change and the diff proves it.

FYI for SQ7, **offered as an observation, not a verdict and not a gate move**: the empty-root
shape says the `Modal` *root* renders fine and only the transitioned content is missing,
which is consistent with the FQ35 mechanism (no animation frame) rather than with a broken
`Modal`. Whether that is worth anything to the SQ7 gate or to Tanya's TEST-003 is yours to
decide, via Porter.

## Questions

**SQ10 — for Porter, then the owner (this is what BLOCKS the TASK).** Does
repairing DEF-1 ship inside REQ-002, or does it need its own defect REQ?
Facts for the decision, no recommendation of scope attached: it is one CSS
declaration in one shared component; it is confined to `/about`; it predates the
team (provenance above); and REQ-002's own subject is the visual step-up of the
five routes, of which `/about` is one — a route whose nine images are currently
invisible. Either answer is workable; the choice is the owner's, not mine.


> answer (Sober 2026-09-04, relaying Porter's record of the owner's answer):
> **`SQ10 = รวมใน REQ-002`** — inside REQ-002, no separate defect REQ. Verbatim in
> `requirements/REQ-002-...md` §Questions DEF-1; Porter did not touch this file,
> so the placement, the ordering and the DoD below stay mine. The block is lifted
> and the status is now `TODO`. Nothing else about the TASK changed: the
> diagnosis, the one-line fix, the "keep it a `<span>`" constraint and every DoD
> box are as they were written on 2026-09-03.

## Review

### Sober, 2026-09-04 — verdict: **DONE**

**Re-verified by me in the real tree, not read off the notes:**

- **Scope.** `git status` = **20** modified files: the 19 from TASK-008/009/010
  (all already `DONE`) plus `src/components/common/ImageLightbox.module.css`,
  and the human's untracked `front/.next.zip`. His own file's diff is **one
  hunk, `+  display: block;`, 1 insertion / 0 deletions**, blob
  `94faddd → 4172266` — the hash he claims after the A/B restore.
- **The constraint held.** `ImageLightbox.tsx` does not appear in `git status`
  at all: the element is still a `<span>` inside the `<button>`, so the content
  model is still valid. `.trigger`, `.hint`, `.full`, `.frame img` and
  `.full img` are byte-identical to HEAD — the single-hunk diff proves it, and
  `.full` being untouched is why the modal path cannot have moved. No new
  token, no hex, no `!important`.
- **Import graph, re-grepped by me at all three levels:** `ImageLightbox` ←
  `common/index.ts` ← `AboutCertificates` + `AboutTestimonials` ←
  `AboutContent` ← `src/app/about/page.tsx`, and nothing else imports any of
  them. **No other route can move** — proven, not assumed, as the TASK demanded.
- **`npx tsc --noEmit` → exit 0, run by me** on the exact submitted tree.

**Fern's live evidence, not re-run by me, and said so plainly:** the nine
rects at both viewports, the rendered A/B, `npm run build`, the six-route
console, the 7.61:1 hint contrast, R6's Home hash (`ea2e272f`, 170 el) and the
nine asset decodes. If a later readback disagrees with any of it, the readback
wins.

### My §Diagnosis stated a limit; his A/B closes it

I wrote that the provenance argument was "a code-provenance argument from a
static read, not a rendered before/after". He ran that before/after: at HEAD
all nine `.frame` compute `inline` and measure `0.00x0.00`; with the one line
they compute `block` and carry area at the intended ratios (1.3333 = 4/3,
1.6000 = 16/10 exactly, so the inline `--lightbox-ratio` var is honoured). The
render **agrees** with the code read, so the mechanism is established and the
"DEF-1 predates the team" argument stands unchallenged. That is the right way
to answer an SA's stated limit — measure it, don't argue it.

### The two unticked boxes are correct, and neither is a FAIL

1. **The modal box — UNVERIFIED (FQ35).** Exactly what I instructed. Nine
   `mantine-Modal-root` divs mount empty; no `Modal-content`, no `.full`. He
   did not tick it, did not call it a FAIL and did not work around it. Already
   carried in TASK-011 §7.
2. **The painted pixel — UNVERIFIED.** The harness refuses to scroll, so the
   nine lazy images never intersect and nobody on this team has *seen* an image
   inside the repaired box. He decoded all nine assets through the optimizer
   instead and explicitly declined to claim the paint. Correct call; it becomes
   a QA eye (SQ8, fifth) rather than a tick.

**One limit I am recording rather than waving through.** The
"nine `fill` warnings are gone" box is **absent-now, not reproduced-then-gone**
— a 0x0 lazy image never intersects, so `next/image` never fired the warning in
his harness to begin with. He said so himself, unprompted. I accept the box for
what it asserts (`/about`'s console is empty of errors *and* warnings at both
viewports, which I did not re-run), and the authoritative before-state stays
Tanya's nine warnings and **REGRESSION S13**. The confirmation that DEF-1 is
repaired *for the visitor* is S13's re-run, not this box.

### Not moved by this review

- **The SQ7 gate is unchanged.** His empty-`Modal-root` shape is a useful
  observation and I am routing it to Porter for TEST-003 as exactly that — an
  observation, not a verdict. The gate-lift remains my call in its own hop
  after TEST-003.
- **Nothing else in the tree.** TASK-011 is still the sweep that fixes nothing;
  it now reads a repaired `/about`, which was the whole point of putting
  TASK-012 in front of it.
