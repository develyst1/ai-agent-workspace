# TASK-007: Use Template shell — enable the mode, pick a template, preview it
- Source: SPEC-002
- Status: DONE (Sober, 2026-08-23 — accepted as it stands in `6879acf`; verdict in §Review)
- Owner: **Fern (FE)**
- Depends on: TASK-005 (contract v2). Independent of TASK-006 — either order works.

Covers REQ-002 Requirements 1, 2, 3, 9, 10 and criteria B2, B9, B10, B12. **No photos in
this task** — the preview shows empty slots only; photos are TASK-008.

## What to do

### 1. `src/lib/template.ts` (new) — one copy of the load repairs

Move `normalizeZIndex` out of `designerStore.ts` into this file and export it; add
`normalizeTemplate(t: TemplateFile): TemplateFile` that returns the template with
`name` trimmed, every slot `name` trimmed, and `slots` run through `normalizeZIndex`
(so back-most first, contiguous `0…n-1`) — i.e. exactly what `designerStore.replaceAll`
does today. Rewrite `replaceAll` to use it, and import `normalizeZIndex` from here.

**This is a move, not a redesign.** SPEC-001 §3 explains why both repairs exist; if you
find yourself changing what they do, stop and ask.

### 2. `src/store/useTemplateStore.ts` (new)

Zustand store, in-memory, independent of `designerStore` (SPEC-002 B-5):

- `template: TemplateFile | null`
- `photos: Record<string, PlacedPhoto>` keyed by slot id — declare the type now
  (`{ objectUrl: string; image: HTMLImageElement; fileName: string }`) but nothing fills
  it in this task.
- `loadTemplate(t: TemplateFile): void` — `normalizeTemplate`, replace wholesale, and
  **revoke every existing photo's object URL and clear `photos`** (the ids belong to a
  different file now). Write the revoke loop now even though `photos` is always empty
  here; TASK-008 must not have to remember it.

### 3. Shell: `src/components/AppShell.tsx` + `src/App.tsx`

- The Use Template entry loses `disabled`, `aria-disabled`, the badge `<span>` and its
  `cursor-not-allowed` styling, and gains `onClick={() => setMode('useTemplate')}` plus
  the same `aria-current` / active-vs-inactive class pair the designer entry has.
- `App.tsx` renders the existing designer tree when `mode === 'designer'` and
  `<UseTemplateView />` when `mode === 'useTemplate'`. Both stores survive the switch.
- `src/i18n/th.ts`: **delete** `mode.useTemplate.badge` and add the `useTemplate.*`,
  `dialog.open.*`-adjacent and `error.*` keys of SPEC-002 §7 that this task uses:
  `useTemplate.pickTemplate`, `useTemplate.noTemplate`, `useTemplate.currentTemplate`,
  `useTemplate.slotEmpty`, `useTemplate.slotRequired`. (The photo and PNG keys arrive
  with TASK-008/009.) All values are **APPROVED** (REQ-002 Q13, 2026-08-23) — copy them
  exactly from SPEC-002 §7; still build the logic against keys, never text.

### 4. `src/components/UseTemplateView.tsx` (new)

Layout mirrors `App.tsx`'s designer tree so the app looks like one app: a toolbar row on
top, the canvas in `<main>`, an `<aside className="w-72 …">` on the right.

Toolbar: `useTemplate.pickTemplate` button; `useTemplate.currentTemplate` + the loaded
name once there is one; the single `role="alert"` message line at the end of the row
(SPEC-002 §6 "Messages"). Before a template is chosen the canvas pane shows
`useTemplate.noTemplate`.

**Pick** — call the **existing** `window.api.openTemplate` with `th['dialog.open.title']`
and `th['dialog.fileTypeLabel']`, then follow SPEC-002 §6 "Pick a template" exactly:
`canceled` → no-op; `error` → log `detail`, show `error.loadFailed`; `opened` →
`parseTemplateFile` → `!ok` → log `reason`, show `error.fileUnreadable`, **keep the
current state**; `ok` → `loadTemplate`.

### 5. `src/components/UseTemplateCanvas.tsx` (new)

The read-only stage of SPEC-002 §6 "The preview": scale-to-fit capped at 1, white
background `Rect`, slots drawn back-most first, each an **unfilled** `Rect` with
`stroke={slot.color}`, `strokeWidth` 1, `strokeScaleEnabled={false}`, plus the name
`Text` (`listening={false}`, inset `6/scale`, `wrap="none"`, `ellipsis`). **No
`draggable`, no `Transformer`, no `onMouseDown` selection, no mutation of any kind.**
The `ResizeObserver` pattern of `DesignerCanvas` is the one to copy.

### 6. `src/components/UseTemplateSlotPanel.tsx` (new)

The `<aside>` list: heading `panel.slotsHeading`, `panel.empty` when the template has no
slots, otherwise one row per slot **top-most first** (`[...slots].reverse()`, same as
`SlotListPanel`) showing the colour swatch, the name, and the `useTemplate.slotEmpty` /
`useTemplate.slotRequired` markers. **No buttons yet** — TASK-008 adds them.

## Constraints

- Do not touch `shared/`, `electron/` or build config.
- Do not change any designer behaviour. The `normalizeZIndex` move is the only designer
  file you touch, and it must be behaviour-preserving.
- No git write (SPEC-001 §10). Hand off uncommitted with a packet.

## Definition of Done

- [x] **Designer regression after the `normalizeZIndex` move**, asserted on the store:
      add/delete/bringForward/sendBackward/rename still behave as TASK-003/004 accepted;
      `replaceAll` still trims the template name and every slot name and still
      re-normalises duplicated / non-contiguous `zIndex` into the same visual order;
      save→load→save is still byte-identical on the first save.
- [x] `loadTemplate` replaces wholesale and never merges; calling it twice leaves only the
      second template's slots.
- [x] Parse failure path: a junk file and a structurally-invalid template both leave the
      previously loaded template **untouched** and set the `error.fileUnreadable` state.
- [x] Shell markup, both themes, `renderToStaticMarkup` **with the zustand canary of
      TASK-004 §Review N6**: the Use Template entry is **not** `disabled`, carries no
      badge, and gets `aria-current="page"` when it is the active mode; the designer entry
      still works the same way; no stray Latin visible text.
- [x] Preview markup with a 3-slot template: three unfilled rects in back-most-first
      order, three name labels, and the panel rows in the **reverse** (top-most-first)
      order — assert the two orders are opposites of each other, not just that both exist.
- [x] Canvas scale never exceeds 1 (assert on the computed scale for a canvas smaller
      than the pane).
- [x] `npm run typecheck` exit 0, `npm run build` exit 0.
- [x] Hand-off packet recorded (SPEC-001 §10). Nothing outside `src/`.
- [ ] **Still open — nobody in the team can tick this: it needs a screen.** The real Open
      dialog round trip and its cancel (B12), and dark-mode readability of the new mode (B9).
      Sober accepted the TASK with this box open and routed both to the human's acceptance
      pass via Porter (§Review D) — they are **not** a rework item for Fern.

## Implementation Notes

*(Fern, 2026-08-23)*

### What changed — 10 files touched in the tree, 7 of them mine, all under `src/`

Three of the ten (`SlotPropertiesPanel.tsx`, and part of `th.ts` and `designerStore.ts`) are
**TASK-006's**, still uncommitted and still in REVIEW — see the packet and **Q-FE-2** below.
TASK-007's own seven:

| File | Change |
|------|--------|
| `src/lib/template.ts` **(new, 40 lines)** | `normalizeZIndex` **moved verbatim** out of `designerStore.ts`, plus `normalizeTemplate(t)` = trim `name`, `normalizeZIndex(slots)`, trim every slot `name`. Nothing else; the SPEC-001 §3 / §9 A-11 reasoning moved with it as the doc comment. |
| `src/store/designerStore.ts` | Imports both from `@/lib/template`; local `normalizeZIndex` deleted; `replaceAll` is now `const normalized = normalizeTemplate(template); set({...})`. **Behaviour-preserving** — see "the oracle" below. No other action, constant or comment moved. |
| `src/store/useTemplateStore.ts` **(new, 47 lines)** | `template: TemplateFile \| null`, `photos: Record<string, PlacedPhoto>` (type declared, nothing fills it here), `loadTemplate` = revoke every existing photo URL → `normalizeTemplate` → replace wholesale. The revoke loop is written now, per the TASK, so TASK-008 cannot forget it. Independent of `designerStore` (B-5) — it imports nothing from it. |
| `src/components/AppShell.tsx` | The Use Template entry loses `disabled`, `aria-disabled`, the badge `<span>` and `cursor-not-allowed`, and gains `onClick={() => setMode('useTemplate')}` plus the **same** `aria-current` / active-vs-inactive class pair the designer entry has (copied from it, not re-invented). The component's doc comment says what it used to be. |
| `src/App.tsx` | Reads `mode` from `uiStore` and renders the existing designer tree for `designer` (moved into a fragment, unchanged line for line) and `<UseTemplateView />` for `useTemplate`. |
| `src/i18n/th.ts` | `mode.useTemplate.badge` **deleted** (SPEC-002 §7 "Deleted"); the five `useTemplate.*` keys this task uses added after `props.required`, values copied code point by code point from SPEC-002 §7. Header comment re-counted: 28 → 32. |
| `src/components/UseTemplateView.tsx` **(new, 97)** `UseTemplateCanvas.tsx` **(new, 110)** `UseTemplateSlotPanel.tsx` **(new, 54)** | The mode: toolbar (pick button, current-template label, the single `role="alert"` line at the end of the row), read-only Konva stage, `w-72` `<aside>` list. Layout, class pairs and the `ResizeObserver` pattern are copied from `App.tsx` / `DesignerCanvas` / `SlotListPanel` so the two modes look like one app. |

`shared/`, `electron/`, build config, `DesignerCanvas`, `SlotRect`, `SlotListPanel`, `Toolbar`
and `uiStore` are **untouched**.

### Three calls I made, so you can overrule any of them at review

1. **`fitScale(canvasW, canvasH, viewportW, viewportH)` is exported from
   `UseTemplateCanvas.tsx`.** The designer computes the same expression inline, but this
   TASK's DoD says *"assert on the computed scale"*, and a scale that only exists inside a
   render closure cannot be asserted without a DOM. It is the designer's expression, moved
   two lines up and given a name — one word to inline it again if you would rather. See
   **Q-FE-4**.
2. **The rect and its label are interleaved per slot** (a `<Fragment key={slot.id}>` holding
   `Rect` then `Text`), not two passes. That is what `SlotRect` does, so paint order in the
   preview is identical to the designer's. Two passes would have put every label above every
   rectangle — invisible today (the rects are unfilled) but wrong the moment TASK-008 draws
   an `Image`.
3. **A row can carry both markers** — `ยังไม่มีรูป` *and* `ต้องใส่รูป`. SPEC-002 §7 describes
   them as two independent properties ("has no photo" / "is required"), so in TASK-007, where
   no photo can be placed yet, **every** row shows `useTemplate.slotEmpty` and the required
   ones also show `useTemplate.slotRequired`. See **Q-FE-3** — it is one line to make them
   exclusive if you meant one-or-the-other.

### Verification — 179 assertions, 179 passed, plus typecheck and build

`npm run typecheck` → **exit 0**. `npm run build` → **exit 0** (renderer 457.34 kB, plus
`main.js` and `preload.js`; only the standing Vite CJS-API deprecation notice).

Two probes, bundled with the repo's own esbuild against the **real** modules and run in Node.
Entry files, bundles and the three probe-only shims live in this session's scratchpad —
**nothing was added to the tree** (the packet below is the proof).

**Probe A — store + lib, 61/61.** No React; `URL.revokeObjectURL` is replaced by a recorder.

| DoD box | What was asserted | Result |
|---------|-------------------|--------|
| 1 (**the move**) | **An oracle**: the exact pre-TASK-007 body of `replaceAll` and of `normalizeZIndex` is frozen inside the probe, and the real store's output is compared against it field by field over 4 templates (padded name, padded slot names, duplicated `zIndex`, negative `zIndex`, a v1 file, zero slots, already-clean input). Plus: `normalizeTemplate` leaves `formatVersion`/canvas alone and mutates none of its arguments. | 17/17 |
| 1 (**designer regression**) | `addSlot` ×3 (names, cascade x, colour rotation, contiguous `zIndex`, selection, the contract's 9 keys); `bringForward`/`sendBackward` one step and their no-ops at both ends; `renameSlot` blank / duplicate-case-insensitive / ok / trimmed / refusals leave the store alone; `deleteSlot` removes one, re-normalises `zIndex`, clears the selection; `replaceAll` still trims the template name and every slot name and still re-normalises duplicated and non-contiguous `zIndex` into the same visual order. | 27/27 |
| 1 (**round trip**) | save → load → save is **byte-identical on the first save**, a third round too, the required marks survive, the saved name is trimmed. | 5/5 |
| 2 | `loadTemplate` normalises exactly like `normalizeTemplate`; loading B after A leaves **only B's** slot ids; no `a*` id survives; the canvas comes from B; loading the same file twice is idempotent; **the revoke loop fires** — two seeded photos, both object URLs revoked, `photos` back to `{}`, and nothing is revoked when there is nothing to revoke. **B-5**: `loadTemplate` leaves `designerStore` byte-identical and `replaceAll` leaves `useTemplateStore` byte-identical. | 8/8 |
| 3 (inputs) | The junk and the structurally-invalid file are rejected by `parseTemplateFile`; a good one is accepted and always comes back `formatVersion: 2`. | 4/4 |

**Probe B — rendered markup + the pick handler, 118/118** (`react-dom/server`, the **TASK-004
§Review N6 canary**, and three bundle-only shims: `react` — so the value the `ResizeObserver`
would have measured can be injected, since effects never run in a server render;
`react/jsx-runtime` — records each element's props so a button's own `onClick` can be called
from Node; `react-konva` — every node becomes a `<div data-konva="Rect" data-props="…">`,
because Konva needs a real canvas and its `Stage` renders nothing server-side).

- **The canary is C0 and it runs first.** zustand 5.0.15 feeds SSR from `getInitialState()`, so
  the probe mutates those objects **in place** and C0 asserts the markup actually *moves* when
  `mode` moves, and that each mode really renders its own tree. If the store were not reached,
  C0 fails and nothing below it counts.
- **The shell (DoD 4), all four combinations of `light`/`dark` × `designer`/`useTemplate`:**
  no `disabled`, no `aria-disabled`, no `cursor-not-allowed` anywhere in the mode bar; the
  badge text `ยังไม่พร้อมใช้งาน` is nowhere in the page and `mode.useTemplate.badge` is no longer
  a key of `th` (which now holds exactly 32); the Use Template entry carries **no `<span>`** at
  all; `aria-current="page"` sits on the active entry and on **neither** of the inactive ones;
  active/inactive class pairs match the designer's; no Latin in the mode bar's visible text;
  and the dark-mode toggle still reflects the theme, so both halves of the store are live.
- **Nothing loaded (Req 2/3):** `useTemplate.noTemplate` shown, **no stage**, panel shows the
  reused `panel.empty` under the reused `panel.slotsHeading`, no current-template label, no
  alert, no Latin.
- **The preview with a 3-slot template (DoD 5):** exactly one `Stage` and one `Layer`; the
  first `Rect` is the white `1080x1920` background; the next three are the slots **back-most
  first** (`#111111`, `#222222`, `#333333`), each with **no `fill` key at all**,
  `strokeWidth: 1`, `strokeScaleEnabled: false`, `listening: false`; three labels in the same
  order, each `wrap="none"`, `ellipsis`, `listening={false}` and inset exactly `6/scale`;
  **no `draggable` anywhere and no `Transformer`**. The panel's three rows come out
  `หน้า, กลาง, หลัง` and the labels `หลัง, กลาง, หน้า` — asserted as **exact reverses of each
  other**, and separately asserted to be *different* from each other, so "both orders exist"
  cannot pass for "the orders are opposite". Row swatches match their slots' colours, the
  required marker is on the two required rows and **not** on the optional one, every row is
  marked `ยังไม่มีรูป`, and the panel has **no `<button>`** yet. A zero-slot template still
  draws its stage and shows `panel.empty`.
- **The scale cap (DoD 6):** `fitScale` asserted directly — `1080x1920` in a `500x500` pane →
  `500/1920`; `100x100` in `500x500` → **1, not 5**; an exact fit → 1; an unmeasured pane and
  a zero-size template → 0 ("do not draw"); and the cap holds over a sweep of pane sizes from
  1 to 100000. Then the same thing through the markup: a `100x100` template in a `5000x5000`
  pane renders `Stage width=100 height=100 scaleX=1`.
- **The pick path (DoD 3),** by calling the pick button's **own** `onClick` with
  `window.api.openTemplate` stubbed, five times, with the store holding a template first:
  `canceled` → the message line is only cleared, never set, the template is byte-identical,
  nothing logged; `error` → `error.loadFailed` and the English `detail` is **logged, not
  rendered**; a **junk file** and a **structurally-invalid template** → both `error.fileUnreadable`,
  both leave the loaded template **byte-identical**, both log the English `reason`; a good file
  → replaces the template, no message, nothing logged. Also asserted: the view has **exactly
  one** `useState(null)`, so the setter being watched is unambiguous. Finally the alert itself,
  with that state forced on: it is a `role="alert"` line, it renders `error.fileUnreadable`
  verbatim, it sits **at the end of the toolbar row** (before `<main>`), and it uses the
  designer's `text-red-600 dark:text-red-400` pair.
- **B-5 across a mode switch:** designer → useTemplate → designer leaves both stores
  byte-identical.

**Negative controls — the probes were proved to bite before being trusted.** Six deliberate
one-line regressions were introduced, run, and reverted:

| Break | What failed |
|-------|-------------|
| slot panel stops reversing | P14, P15, P16, P17, P18 |
| `Math.min(…, 1)` cap removed from `fitScale` | F2, F6, F7 (`got 5`, `got [5000,5000,50]`) |
| the Use Template entry made `disabled` again | S1 ×4 |
| `normalizeTemplate` stops trimming slot names | A1.0, B26, C3 |
| `normalizeZIndex` stops re-numbering | A1.0, A2.0, A1.2 + 4 more |
| — | after each revert: 61/61 and 118/118 again |

### What I could NOT verify — the last DoD box, for the human's acceptance pass

No window and no DOM exist in my session; everything above is code and markup, not pixels.

1. **The real Open dialog round trip and its cancel (B12)** — that `window.api.openTemplate`
   opens the same native dialog Load Template opens, with the same Thai title and file-type
   label, and that pressing Cancel leaves the view exactly as it was. I stubbed the channel;
   I never opened a dialog.
2. **Dark-mode readability of the new mode (B9)** — the class pairs are the designer's, and
   the markup carries them, but nobody has looked at the screen.

Also still open from TASK-006 and **not** re-asked here: **Q-FE-1** (a native checkbox ignores
the app's `dark` class). It is unrelated to anything TASK-007 touches — no native form control
ships in this task.

### Hand-off packet (SPEC-001 §10)

```
base fc9ba21 (full fc9ba21789e5072a9a258887771822399ae4e5e6)
 M src/App.tsx                              b484430e2a04be88
 M src/components/AppShell.tsx              27e9147b6628bd75
 M src/components/SlotPropertiesPanel.tsx   4a63afb31ec1d4db   <- TASK-006, unchanged by me
 M src/i18n/th.ts                           f7b40de0d331e929   <- TASK-006 + TASK-007
 M src/store/designerStore.ts               a75d2c3e693a55d4   <- TASK-006 + TASK-007
?? src/components/UseTemplateCanvas.tsx     84c225c09e024e1b
?? src/components/UseTemplateSlotPanel.tsx  8d8bbd43dcac8113
?? src/components/UseTemplateView.tsx       ee5cb67bd932065a
?? src/lib/template.ts                      6c9160d8d99154c5   (porcelain prints the folder: `?? src/lib/`)
?? src/store/useTemplateStore.ts            f817b3694893a87e
```

Ten files, all under `src/`. `git diff --stat` on the five tracked ones →
`5 files changed, 88 insertions(+), 56 deletions(-)`; the five new files are 348 lines.
No git write of any kind — no `add`, no `commit`, no branch, no push. `dist/` and
`dist-electron/` moved when I ran the build but are gitignored, so they are not in the porcelain.

**Two of these fingerprints supersede TASK-006's, which is still in REVIEW.** TASK-006 handed
off `th.ts` at `57a9e1f1e51b032d` and `designerStore.ts` at `5ef242aca0c52f9c`; the tree now
holds both changes stacked, because the human has not committed TASK-006 and TASK-007 was told
to touch the same two files. So that you can still review TASK-006 from its own packet:

- **`th.ts` — proved, not asserted.** Applying the exact inverse of TASK-007's three `th.ts`
  hunks to the current file reproduces **`57a9e1f1e51b032d`**, byte for byte. TASK-006's one
  added key and its comment are intact and untouched inside the current file.
- **`designerStore.ts` — read the diff.** `git diff src/store/designerStore.ts` shows six
  disjoint hunks: three are TASK-006's (`setSlotRequired` in the interface, `required: true`
  in `addSlot`, the `setSlotRequired` action with its `SlotPatch` comment) and three are
  TASK-007's (the import, the deleted local `normalizeZIndex`, the new `replaceAll` body).
  They do not overlap and I changed none of TASK-006's lines.

This is a real gap in the no-commit hand-off, not a one-off — **Q-FE-2**.

## Questions

**Q-FE-2 — non-blocking for this TASK, but it will recur on TASK-008 and TASK-009.**
Stacked uncommitted work. SPEC-001 §10 assumes one packet on a committed base, but TASK-006 is
still in REVIEW and uncommitted, and TASK-007 was scoped to touch two of the same three files.
My packet is therefore *cumulative*, and two of TASK-006's accepted-pending fingerprints no
longer match the tree. I did not resolve this by myself — the evidence above is the workaround,
not a decision. Which do you want as the standing rule?
(ก) leave it: each packet lists everything in the porcelain and marks which files belong to an
    earlier unreviewed TASK, with an inverse-hash or a diff as proof it is intact (what I did);
(ข) an engineer waits for the previous TASK to be accepted before starting the next one that
    shares a file — which would have meant not starting TASK-007 today;
(ค) something else you specify, e.g. the review cites a per-TASK diff instead of a whole-file
    hash while the base is uncommitted.
I have no preference; I only need to know which, before TASK-008.

> answer (Sober, 2026-08-23): **(ก), with the (ค) clarification bolted on. This is now the
> standing rule** — SPEC-001 §10 carries the one-line version, this is the reasoning.
>
> (ข) is refused: it would idle the pipeline for a constraint that buys nothing. The human
> commits on his own schedule and by design nobody may ask him to commit at a particular
> time (SPEC-001 §10 last bullet), so "wait for the previous TASK to be accepted" makes an
> engineer's ability to start depend on something outside the team's control. It would have
> cost today's TASK-007 for no gain: your cumulative packet let me review TASK-006 from its
> own fingerprints yesterday without any ambiguity.
>
> The rule, in full:
> 1. A packet always lists **everything in the porcelain**, whole-file `sha256`(16) as
>    today. That stays the tamper check on the tree as handed off, and it is what I re-hash.
> 2. Any file in it that also carries an **earlier, still-unreviewed** TASK's change is
>    marked with that TASK's id, and the packet carries a **proof the earlier change is
>    intact**: either the inverse-hash reproduction you did for `th.ts`, or the
>    disjoint-hunk reading you did for `designerStore.ts`. Either is acceptable; you do not
>    need both.
> 3. **What I cite in a review changes** while the base is uncommitted: the accepted unit is
>    the **per-TASK hunk set**, not the whole-file hash. So "accepted at base `<sha>` +
>    packet" keeps meaning "these hunks, on that base" — a later TASK legitimately
>    superseding a whole-file hash is not a review finding and never invalidates an earlier
>    acceptance.
> This changes nothing you did; it makes it the rule. Nothing for TASK-008 to redo.

**Q-FE-3 — non-blocking, one line.** TASK-007 §6 lists the row markers as
"`useTemplate.slotEmpty` / `useTemplate.slotRequired`". I read SPEC-002 §7 as **two independent
marks** ("a row whose slot has no photo" / "a row whose slot is required"), so a required and
empty row currently shows **both** — and since no photo can be placed in TASK-007, every row
shows `ยังไม่มีรูป`. If the slash meant *one or the other*, say which wins and it is a one-line
change. No new string either way.

> answer (Sober, 2026-08-23): **your reading is the right one — both marks stand, no change.**
> The slash in TASK-007 §6 was a list separator, not an "or"; SPEC-002 §7 defines the two as
> independent properties and that is what ships. They are not redundant: after TASK-008 a
> required row *with* a photo keeps `ต้องใส่รูป` and loses `ยังไม่มีรูป`, an optional empty row
> shows only `ยังไม่มีรูป`, and the pair "required + empty" is exactly the state TASK-009's
> `error.requiredSlotEmpty` refuses on — readable per row. Every row showing `ยังไม่มีรูป` in
> TASK-007 is a true statement about a mode that cannot hold a photo yet, not a bug.
> **FYI only, routed to Porter (§Review F):** on a required *and* empty row the human sees two
> same-styled chips side by side. Intended; I will not restyle it on a guess. If he dislikes
> it, it comes back through Porter as a REQ line, never as a spontaneous style edit.

**Q-FE-4 — non-blocking, cosmetic.** Is `export function fitScale(...)` in
`UseTemplateCanvas.tsx` acceptable, or would you rather it were inline like the designer's
(and the DoD's scale box then rests on the markup assertion alone), or moved to
`src/lib/`? I picked "exported from the component that uses it" as the smallest change that
makes the cap directly measurable.

> answer (Sober, 2026-08-23): **keep it exactly where it is — accepted, no rework.** A rule
> that only exists inside a render closure is a rule nobody can test, and the DoD asked for
> the scale itself; naming it is the smallest change that makes the cap first-class. I
> checked it is genuinely the designer's expression and not a re-derivation (`Math.min(vw/cw,
> vh/ch, 1)`, with `0` for "not measured / nothing to draw"), so the two modes cannot drift in
> behaviour, only in spelling. **Do not refactor `DesignerCanvas` to use it** — that file is
> accepted work and there is no behavioural reason to touch it. **Standing rule for TASK-009:
> if a third caller needs the fit scale, that is when `fitScale` moves to `src/lib/` and the
> designer is switched over — one move, once, with a regression check, not a drip.** Until
> then two spellings of one expression is the cheaper state.

I have **no other questions**: SPEC-002 §6 and §7 covered every user-facing string and every
branch this TASK needed, and I did not have to invent any text or guess at any behaviour.

> (Sober answers as `> answer: ...`.)

## Review

*(Sober, 2026-08-23)* — **Verdict: DONE.** Accepted as it stands in `6879acf`. No rework.
Every branch this TASK owns behaves as SPEC-002 §6 specifies, the `normalizeZIndex` move is
behaviour-preserving against a frozen oracle of the pre-move code, and nothing outside `src/`
moved. One follow-up came out of the review, and it is **not** Fern's to redo now — note
N-SA-3 below, folded into TASK-008 as one line.

### A. What I verified myself, and how

Everything below is **my own run against the real files**, not a reading of §Implementation
Notes. Two probes bundled with the repo's own esbuild and run in Node; entry files, bundles
and three probe-only shims live in my scratchpad — **nothing was added to the repo tree**:
`git status --porcelain` is empty before the review, after both probes, and after my own
`npm run build`.

**253 assertions, 253 passed.**

| Probe | Scope | Result |
|-------|-------|--------|
| **A** — store + lib, no React | the oracle, the designer regression, the round trip, `useTemplateStore`, B-5, the parse rejections | **94 / 94** |
| **B** — `react-dom/server` markup + the pick handler | the canary, the shell ×4, the empty state, the preview, the scale cap, the five pick branches, the alert, B-5 across a mode switch | **159 / 159** |

Toolchain, run by me: `npm run typecheck` → **exit 0** (both projects), `npm run build` →
**exit 0** (renderer 457.34 kB + `main.js` + `preload.js`; only the standing Vite CJS-API
deprecation notice). Tree still clean afterwards — `dist/` and `dist-electron/` are ignored.

**The oracle is the load-bearing part of this review.** The DoD's first box asks for a
behaviour-preserving move, and "the tests still pass" is not an answer to that. I froze the
**pre-TASK-007 bodies of `replaceAll` and `normalizeZIndex`, copied out of `fc9ba21`**, into
probe A and compared the real store's output against them field by field over six inputs
(padded template name, padded slot names, duplicated `zIndex`, negative `zIndex`, a v1-shaped
file, zero slots, already-clean input) — plus `normalizeTemplate` mutating none of its
arguments and leaving `formatVersion` / canvas untouched. All six agree with the oracle
exactly. The move is a move.

**The canary is C0 and it runs first.** zustand 5.0.15 feeds a server render from
`getInitialState()`, which I confirmed independently before trusting anything in probe B:
`setState` alone does **not** move the markup, mutating the initial-state object does. C0
asserts the markup actually moves when `mode` moves and that each mode renders its own tree
and only its own; if it fails the probe exits and reports nothing else. Fern's account of
this is accurate.

### B. The Definition of Done, box by box

| Box | How I checked it | Verdict |
|-----|------------------|---------|
| 1 designer regression after the move | the oracle above, plus `addSlot` ×3 (names, contiguous `zIndex`, colour rotation, selection, the contract's 9 keys, `required:true`), `bringForward`/`sendBackward` one step and their no-ops at both ends, `renameSlot` blank / case-insensitive duplicate / ok / trimmed, `deleteSlot` re-normalising and clearing the selection, `replaceAll` still trimming and re-normalising a messy file into the same visual order, and save→load→save byte-identical on the **first** save (and a third round) | ✅ |
| 2 `loadTemplate` replaces wholesale | loading B after A leaves only B's ids, no `a*` survives, canvas comes from B, idempotent on a re-load, **and the revoke loop fires** — two seeded photos, both URLs revoked, `photos` back to `{}`, nothing revoked when there is nothing to revoke | ✅ |
| 3 parse-failure path | junk text and a structurally-invalid template, both driven through the **button's own `onClick`**: both set `error.fileUnreadable`, both leave the loaded template **byte-identical**, both log the English `reason` | ✅ |
| 4 shell markup, both themes, with the N6 canary | all four `light`/`dark` × `designer`/`useTemplate`: no `disabled`, no `aria-disabled`, no `cursor-not-allowed` anywhere in the `<nav>`; the badge text is nowhere in the page; `mode.useTemplate.badge` is no longer a key of `th` (which holds exactly **32**); the Use Template entry carries **no `<span>`**; exactly **one** `aria-current="page"`, on the active entry; class pairs identical to the designer's; no Latin in the mode bar's visible text; the theme toggle still tracks `theme` | ✅ |
| 5 preview vs panel order | one `Stage`, one `Layer`, 4 `Rect`s: the white `1080x1920` background then the three slots **back-most first**; panel rows **top-most first**; asserted as **exact reverses of each other** and separately asserted to differ, so "both orders exist" cannot pass for "the orders are opposite"; swatch colours, geometry, the required marker on the two required rows only, `ยังไม่มีรูป` on all three, and **no `<button>`** in the `<aside>` | ✅ |
| 6 scale never exceeds 1 | `fitScale` directly — `1080x1920` in `500x500` → `500/1920`; `100x100` in `500x500` → **1, not 5**; exact fit → 1; unmeasured pane, zero-size template and a negative viewport → `0`; a sweep of pane sizes 1…100000 across four canvas shapes never exceeds 1 — then the same cap through the markup (`Stage width=100 height=100 scaleX=1` in a 5000×5000 pane) | ✅ |
| 7 typecheck 0, build 0 | run by me, above | ✅ |
| 8 packet, nothing outside `src/` | `git diff --stat fc9ba21 6879acf` → **10 files, all under `src/`**, `436(+) / 56(-)`; porcelain empty; the ten packet hashes were re-checked on 2026-08-23 (TASK-006 §Review D) | ✅ |
| 9 dialog round trip + dark mode on screen | **not tickable by anyone in this team** — see D | ⏳ human |

Beyond the boxes, also asserted: the pick call passes `dialog.open.title` + `dialog.fileTypeLabel`
on **every** branch (the same strings Load Template uses, B12); `canceled` clears the message
and never sets one and touches nothing; the English `detail` / `reason` is **logged, never
rendered**; a good file is normalised on the way in (name and slot names trimmed); the alert
is a `role="alert"` line **before `<main>`**, carrying `text-red-600 dark:text-red-400` and no
Latin; the empty state shows `useTemplate.noTemplate` with **no stage at all** and reuses
`panel.slotsHeading` / `panel.empty`; a zero-slot template still draws its stage; and B-5
holds across `designer → useTemplate → designer` with both stores byte-identical.

### C. The probes were proved to bite before I trusted them

Fourteen deliberate one-line regressions, each introduced on a **scratch copy** of `src/` +
`shared/` (never the repo), run, and reverted. The repo tree was never modified — a scratch
`node_modules` junction is what let the copy build.

| # | Break | What failed |
|---|-------|-------------|
| N1 | `normalizeTemplate` stops trimming slot names | 6 assertions, incl. the oracle comparison |
| N2 | `normalizeZIndex` stops renumbering | 10 |
| N3 | `normalizeTemplate` stops trimming the template name | 5 |
| N4 | `loadTemplate` stops revoking | `C.loadB.revoked` |
| N5 | `loadTemplate` merges instead of replacing `photos` | 2 |
| N6 | `replaceAll` reads the raw name instead of the normalised one | 3 |
| N7 | the slot panel stops reversing | 4, incl. `rowsAreReverseOfPaint` |
| N8 | the `, 1)` cap dropped from `fitScale` | 3 (`got 5`, `got [5000,5000,50]`) |
| N9 | the slot `Rect` gains a `fill` | 3 |
| N10 | the Use Template entry made `disabled` again | 4 |
| N11 | the `!parsed.ok` branch stops returning | probe aborts at the junk-file case |
| N12 | the alert moved after `<main>` | 2 |
| N13 | the badge `<span>` restored | 8 |
| — | after every revert | 94/94 and 159/159 again |

One harness lesson worth recording, because it nearly cost me a false pass: on the first pass
my runner reran a **stale bundle** when esbuild failed, so a broken patch looked like "all
green". Any future review that patches a scratch copy must fail loudly on a build error
before running. Mine does now.

### D. What I could NOT verify, and why it is not a rework item

No window and no DOM exists in my session either. Two things are therefore code-and-markup
verified but never seen on a screen, and **no role in this team can close them**:

1. **The real Open-dialog round trip and its cancel (B12)** — that `window.api.openTemplate`
   opens the same native dialog Load Template opens, with the same Thai title and file-type
   label, and that Cancel leaves the view exactly as it was. I stubbed the channel five ways
   and asserted the options object on every branch; nobody opened a dialog.
2. **Dark-mode readability of the new mode (B9)** — the class pairs are the designer's and the
   markup carries them in both themes, but nobody has looked at the pixels.

Both go to the human's acceptance pass through Porter, with the rest of REQ-002, and they are
the reason DoD box 9 stays open on an accepted TASK.

### E. Notes

- **N-SA-3 — one stale comment, now false, and it is TASK-007 that made it false.**
  `src/store/uiStore.ts:9` still reads that `useTemplate` "is visibly disabled (A6), so
  `setMode` is never called with it today". As of this TASK it is called. `uiStore.ts` was not
  in TASK-007's file list and Fern was right not to widen her diff into it on her own — but a
  comment that carries SPEC reasoning and is now wrong is a real defect in a codebase where
  those comments are the reasoning. **Not worth a rework hop for one line**: folded into
  TASK-008 §What to do 0 + a DoD line, since Fern is the next FE unit and owns that file's
  area. `AppShell.tsx`'s own comment was correctly updated in this TASK — this is the one that
  was missed.
- **N-SA-4 — the two calls I did not overrule**, both recorded so nobody re-opens them:
  interleaving `Rect` + `Text` per slot in a `<Fragment>` (right, and load-bearing the moment
  TASK-008 draws an `Image` — a two-pass version would paint every label above every photo),
  and reusing `panel.slotsHeading` / `panel.empty` in the new panel (right; SPEC-002 §7 lists
  both as reused unchanged, no new key).
- **N-SA-5 — `fitScale` and `DesignerCanvas` now spell the same expression twice.** Accepted
  deliberately (Q-FE-4); the trigger to unify is a **third** caller in TASK-009, not sooner.

### F. For Porter — three FYIs for the human's acceptance pass, none blocking

1. **Two chips on one row.** A slot that is both required and empty shows `ต้องใส่รูป` and
   `ยังไม่มีรูป` side by side, in the same style. That is the specified behaviour (Q-FE-3),
   not a slip — but he will see it, so he should not have to guess.
2. **In TASK-007 every row is marked `ยังไม่มีรูป`**, because no photo can be placed until
   TASK-008. Expected, and it stops looking odd one TASK from now.
3. **Carried over, unchanged:** the designer's new required checkbox is still OS-coloured in
   dark mode until the Q-FE-1 TASK lands (TASK-006 §Review F).
