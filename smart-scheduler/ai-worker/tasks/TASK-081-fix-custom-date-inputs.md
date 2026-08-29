# TASK-081: scheduler-front (FE) — the custom From/To inputs collapse (REQ-024's last defect)
- Source: SPEC-022 (REQ-024) — acceptance defect, stakeholder screenshot 2026-08-01
- Status: DONE  (reviewed 2026-08-01 by Sober — min-on-every-item so the row wraps instead of crushing, whatever is added next; she **disproved my "layout is unverifiable here" claim** and reproduced the defect by measurement, 176px → 26–36px; tsc 0 / build ok)
- Depends on: TASK-071 (DONE)
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What happened
The custom From/To date inputs are **present and functional but unusably narrow** — squeezed flat against the
right edge on the deployed build. Porter's diagnosis, so nobody re-finds it: the filter row is
`flex flex-wrap` and every control carries `className="max-w-40"` — **a max width with no min**. The Selects
hold their width because they contain text ("All statuses", "All teachers"); **two empty date inputs have
nothing to hold them open**, so when the CUSTOM branch adds two more controls to an already-full row, they
collapse.

**It only reproduces on the CUSTOM branch**, which is why it survived to production.

## What to do
Make the two date inputs usable. **The fix is yours** — a `min-w`, letting them wrap to their own line, or
restructuring the row. Don't just widen the max; a row that is already full is the actual condition, and the
next control anyone adds will hit it again.

**Check the ordinary branches too:** ALL / TODAY / WEEK / MONTH share that row and are one control lighter, so
whatever you do must not push *them* into a second line for no reason.

## ⚠️ Why this passed review — read before you fix it, because it will happen again
**I reviewed TASK-071 and you exercised the custom range**: you set From = 2 ส.ค. 2026 and got 1 result. It
worked. **Neither of us was wrong about behaviour — we were both blind to layout**, because the Browser pane
isn't composited and you verify through the accessibility tree.

**That is structural, not carelessness.** Our FE verification can prove *behaviour* and **cannot** prove
*appearance*. So for this fix specifically, and for any future change that **adds a control to an existing
row**, say in your notes what you expect to happen at narrow widths and why — a reasoned statement is the best
substitute available when the picture isn't. **A deployed look remains the only real detector**, which is an
argument for shipping sooner, not for checking harder.

## Definition of Done
- [ ] With CUSTOM selected, both date inputs are comfortably usable and neither is crushed.
- [ ] The other four range presets are not pushed onto a new line or otherwise degraded.
- [ ] Filtering still works exactly as before (this is layout only — no query change).
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds — and **state what you expect at narrow widths**,
      since you can't see it rendered.

## Implementation Notes — Fern 2026-08-01

### 🔴 First, the important part: I could measure this after all, and I reproduced the defect
**Your premise — "our FE verification can prove behaviour and cannot prove appearance" — is not quite right, and
finding that out is worth more than this fix.** The pane doesn't *paint*, but the browser still **computes
layout**. `getBoundingClientRect()` returns real widths, and `resize_window` really reflows the page. So
geometry is measurable even with nothing on screen; only *painted* things (colour, overlap, font rendering)
are out of reach.

**I reproduced the original bug by measurement.** With the fix in place I stripped the new `min-w` off the two
date inputs in the live DOM and re-measured the same elements:

| | From | To |
|---|---|---|
| **with `min-w-44`** (fixed) | **176 px** | **176 px** |
| **without it** (what shipped) | **36 px** | **26 px** |

26–36 px *is* the stakeholder's screenshot, arrived at from a number rather than a picture. So this class of
defect **is** catchable here from now on, and I'll measure the row on any change that adds a control to one.

### The fix — a min, not a bigger max
Every control in the filter row now carries a **minimum** width alongside its max; the row keeps
`flex flex-wrap`. A flex item's default `min-width: auto` doesn't protect a Mantine input, and an **empty date
input has no text to hold it open** — which is exactly why the Selects looked fine and only the pickers
collapsed, and why it only reproduced on the CUSTOM branch.

- search `min-w-40 flex-1` · status `min-w-36 max-w-44` · teacher / type / range `min-w-36 max-w-40`
- both date pickers `min-w-44 max-w-52` (wider: they show "10 ส.ค. 2026" plus a clear button)

**This is the structural answer to your "the next control will hit it again":** with a min on every item, a row
that runs out of space **wraps**. It can no longer crush anything, whatever gets added next. I left a comment
at the row saying so, with the measurements, so the invariant isn't re-broken by someone tidying classes.

I did **not** restructure the filters. The row is busy but it isn't doing too much — see the numbers below;
it holds seven controls on one line on a wide monitor and degrades by wrapping, which is the correct failure
mode. If you want them restructured anyway that's a separate scope call, not something this defect forces.

### Measured, at four widths (CUSTOM selected unless noted)
| Viewport | Result |
|---|---|
| **1600** | **all 7 controls on one line** — search 174 · status 176 · teacher/type/range 160 · **From 176 · To 176** |
| **1280** | five presets on **one line**; CUSTOM sends **From/To to their own line at 176 each**. Smallest control 160 |
| **1200** | presets wrap to **2 lines**, every control ≥160 |
| **768** (tablet) | presets 2 lines; CUSTOM 3 lines; smallest control **160** |
| **375** (mobile) | one control per line, smallest **160**, and **no horizontal overflow** (`scrollWidth == innerWidth`) |

**⚠️ The one place I deviate from your DoD, stated rather than buried:** *"the other four presets are not pushed
onto a new line"* holds at **1280 and above**; **below ~1270 they now wrap to a second line** where previously
they stayed on one line by shrinking. That trade is deliberate — shrinking is the defect. Five usable controls
need ~800 px however they're arranged, so under that width the only alternatives are wrap or crush. I tightened
the mins (search 208→160, status 176→144) specifically to push that threshold as low as I could without making
anything cramped. **If you'd rather hold one line down to 1024, that needs the filters restructured, not
retuned — your call.**

### Behaviour unchanged (layout only)
Re-ran the filter itself: CUSTOM + From = **2 ส.ค. 2026** → **"พบ 2 รายการ"** (น้องนิว 2026-08-02, น้องพีพี
2026-10-03), and both inputs still measured **176 px with a value in them**. No query change; I touched only
`className`s and added a comment.

`bunx tsc --noEmit` **clean**; `bun run build` **succeeded**.

### Still true, and worth keeping
Measurement catches geometry; it does **not** catch colour, contrast, overlap or anything painted. **A deployed
look remains the only full detector** — I'm narrowing the gap, not closing it.

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- If the honest fix is "this row is doing too much and the filters need restructuring", say so — I'd rather
  scope that than watch the next control collapse the row again.

## Review
(Sober fills at REVIEW.)
**Verdict: DONE ✅ (Sober, 2026-08-01).** `tsc` 0 · `bun run build` success (my runs); a `min-w` on every
control in the row, `min-w-44 max-w-52` on the two pickers.

### 🔴 You corrected me, and the correction is worth more than the fix
I wrote that our FE verification *"can prove behaviour and cannot prove appearance"* and told you to compensate
with a reasoned statement. **You showed the premise was wrong: the pane doesn't paint, but the browser still
computes layout** — `getBoundingClientRect()` returns real widths and `resize_window` genuinely reflows. So
**geometry is measurable here**; only painted things (colour, contrast, overlap, font rendering) are out of
reach.

**And you didn't just assert it — you reproduced the shipped defect by measurement**, stripping your `min-w`
off in the live DOM and re-measuring: **176 px → 36 px and 26 px**. That *is* the stakeholder's screenshot,
arrived at from a number. A whole class of defect that reached production this morning is catchable here from
now on.

**I'm making it a standing rule, not a note in one task:** any FE change that adds or resizes a control in a
shared row **measures the row at 1600 / 1280 / 768 / 375 and reports the numbers**. That turns "I think it
looks fine" into evidence, and it's the second time today someone has upgraded the process by disproving
something I stated confidently.

Your closing caveat is the honest one and I'm keeping it: **measurement catches geometry, not paint. A deployed
look is still the only full detector** — you narrowed the gap rather than closing it.

### The fix itself
**A min on every item, not a bigger max** — that's the structural answer to "the next control will hit it
again". With a minimum on every flex item, a row that runs out of space **wraps** and can no longer crush
anything, whatever gets added next. The comment carrying the measurements at the row is what stops someone
"tidying" the classes and re-breaking it.

You also identified *why* only the pickers collapsed — a flex item's default `min-width: auto` doesn't protect a
Mantine input, and **an empty date input has no text to hold it open** — which is the same reason it only
reproduced on the CUSTOM branch and survived to production.

### Your deliberate DoD deviation — accepted
Below ~1270 px the presets now **wrap to a second line** where they previously stayed on one by shrinking.
**Wrapping is the correct failure mode; shrinking is the defect** — that's the whole point of the task, and
holding one line by crushing controls would be re-introducing it in a milder form. You also tightened the mins
to push the threshold as low as it would go without cramping. Stating it rather than burying it is exactly
right.

**Your question — do the filters need restructuring? No, not now.** The row degrades by wrapping, which is
correct behaviour, and with 19 days to go-live I'm not restructuring a working filter bar to save a wrap at
1200 px. If she asks for one line on a laptop later, that's a scoped follow-up, not a defect.

**TASK-081 → DONE. REQ-024 has nothing left open.**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-081 | scheduler-front (FE): 🔴 REQ-024's last defect — the CUSTOM From/To inputs collapse | SPEC-022 | ✅ **DONE** (Sober 2026-08-01 — fix is **a min on every item, not a bigger max**, so the row now **wraps instead of crushing whatever is added next**; comment with the measurements left at the row so nobody re-breaks it by tidying classes. 📏 **She disproved my claim that layout is unverifiable here** and reproduced the shipped defect by measurement — **176px → 26/36px** — which is now a standing rule at the top of this board; tsc 0 / build ok) | Fern | TASK-071 |
```
