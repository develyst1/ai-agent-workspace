# TASK-009: Generate — compose at full resolution and save the PNG
- Source: SPEC-002
- Status: DONE
- Owner: **Fern (FE)**
- Depends on: TASK-006 (the `required` mark) and TASK-008 (photos in slots)

Covers REQ-002 Requirements 6, 7, 12, 14 and criteria B1, B4, B5, B6, B7, B15, B17.
The last task of SPEC-002.

## What to do

### 0. One line of carry-over from TASK-008's review (SA call B-12, your Q-FE-5)

Your **Q-FE-5** is answered **(ข)**: `useTemplate.pickManyPhotos` is **rendered only when
a template is loaded**. TASK-008 is accepted as it stands — this is not a rework of it,
it lands here because it is one condition on a button in the very toolbar you are opening
anyway. Full reasoning in TASK-008 §Questions and SPEC-002 §9 **B-12**; the short version
is that without a template every photo is surplus, Q10 = ก forbids saying so, and B-7's
own logic ("a disabled button cannot name its reason") rules out the greyed-out variant.

Wrap it in the **same** `template &&` condition the current-template label already uses.
Nothing else in that file changes for this — no string, no store field, no new state.

### 1. `src/lib/compose.ts` (new)

```ts
export function composeTemplateToCanvas(
  template: TemplateFile,
  photos: Record<string, PlacedPhoto>,
): HTMLCanvasElement;
```

SPEC-002 §6 "Generate" step 2, verbatim:

- `document.createElement('canvas')`, `width = template.canvasWidth`,
  `height = template.canvasHeight` — **the on-screen scale is never involved anywhere in
  this function** (Req 6 / B4).
- **Paint no background.** No `fillRect`, no white rect, nothing. A fresh 2D canvas is
  transparent and that is Req 12 / B15.
- For each slot **back-most first** (the store keeps `slots` in that order) that has a
  photo: `ctx.drawImage(img, sx, sy, sw, sh, slot.x, slot.y, slot.width, slot.height)`
  with `coverSourceRect` from TASK-008. Slots with no photo are skipped entirely — not
  drawn as anything.
- No clipping call is needed: the source-rect form already fits the photo exactly to the
  slot rectangle, and the canvas clips what falls outside it.

### 2. Generate, in `UseTemplateView`

`useTemplate.generate` button, **always enabled** once a template is loaded (SPEC-002
B-7 — this is *not* the disabled-Save pattern, because Req 14 wants a message that names
the problem). On click, in order:

1. **Required-slot guard.** Slots where `required` is true and no photo is placed, in
   on-screen list order. If any: show `error.requiredSlotEmpty` with `{slots}` replaced
   by their names joined with `, `, and **stop** — no dialog, no file (B17). One
   `String.replace`; never branch on the message text.
2. `composeTemplateToCanvas(...)`.
3. `canvas.toBlob(cb, 'image/png')` → `await blob.arrayBuffer()` → `new Uint8Array(...)`.
   A null blob → log, show `error.exportFailed`, stop.
4. `window.api.savePng(bytes, { dialogTitle: th['dialog.exportPng.title'], fileTypeLabel:
   th['dialog.pngTypeLabel'], defaultFileName: template.name + '.png' })`.
   `saved` → **nothing happens, no confirmation** (SPEC-002 B-8). `canceled` → no-op
   (B7). `error` → log `detail`, show `error.exportFailed`.

### 3. `src/i18n/th.ts`

Add `useTemplate.generate`, `dialog.exportPng.title`, `dialog.pngTypeLabel`,
`error.requiredSlotEmpty`, `error.exportFailed` from SPEC-002 §7. **Values are APPROVED**
(REQ-002 Q13, 2026-08-23) — copy them exactly; they are what ships.
`error.requiredSlotEmpty` keeps its literal `{slots}` placeholder in the table.

## Constraints

- Do not touch `shared/`, `electron/` or build config.
- Do not touch the designer.
- No git write (SPEC-001 §10). Hand off uncommitted with a packet.

## Definition of Done

Composition can be asserted headlessly with a canvas only if one exists in your harness.
If `document.createElement('canvas').getContext('2d')` is unavailable, **say so** and
assert the two things that do not need pixels — the draw-call arguments (spy on a fake
context) and the canvas dimensions — then list the pixel checks as human-acceptance items.
Do not invent a dependency to get a canvas.

- [x] The composed canvas measures exactly `canvasWidth` x `canvasHeight` for a template
      whose canvas differs from the default and whose preview scale is well below 1 (B4).
- [x] Draw calls: one per filled slot, **none** for an empty slot, in back-most-first
      order (B6), each with the destination rect equal to the slot's `x/y/width/height`
      and the source rect equal to `coverSourceRect` for that photo (B5).
- [x] `ctx.fillRect` / any background paint is **never** called (B15).
- [x] Required-slot guard: two required slots empty → the message names **both**, in
      on-screen list order, and `savePng` is **not** called. Only optional slots empty →
      `savePng` **is** called (B17).
- [x] A template with zero slots generates a canvas of the right size with zero draw calls.
- [x] `savePng` returning `canceled` leaves the app usable and shows no message (B7);
      returning `error` shows `error.exportFailed` and logs the English `detail`.
- [x] Markup: the Generate button is present and **not** `disabled` when a template is
      loaded, with the zustand-canary harness of TASK-004 N6 (element-tree walker in place of
      `renderToStaticMarkup`, as in TASK-008 — see §Implementation Notes).
- [x] **B-12 (§0):** with **no** template loaded the toolbar renders **no**
      `useTemplate.pickManyPhotos` button at all — assert its absence, not just that it is
      disabled — and with a template loaded it is back and still calls
      `pickImages({ multiple: true })`. TASK-008's multi-pick behaviour is otherwise
      unchanged: re-assert that a multi-pick still fills empty slots top-most first.
- [x] `npm run typecheck` exit 0, `npm run build` exit 0.
- [x] Hand-off packet recorded (SPEC-001 §10). Nothing outside `src/`.
- [ ] *(open — no window, no dialog, no real photo; rides the human’s B14+B3 pass per your Q-FE-6 ruling)* **N-SA-1 (added 2026-08-23, TASK-005 §Review E):** the first real export returns
      `saved` and **not** `INVALID_PAYLOAD`. The outbound `Uint8Array` crossing
      `contextBridge` is the one link nobody in this team has been able to prove, and a
      mis-cloned array lands exactly on `png:save`'s payload guard — so an
      `INVALID_PAYLOAD` here is a **seam** problem and comes to me as a `## Questions`
      entry. Do not change the contract or pad the payload to get past it.
- [ ] *(the human’s, by design)* Not verified by you, listed for the human's acceptance pass: the real Save dialog
      and its cancel, the produced PNG's pixel size, its transparency in a viewer that
      shows it (B15), and the whole unaided flow (B1).

## Implementation Notes

*(Fern, 2026-08-23)*

### What changed — 3 files, all under `src/`

Base is the real commit **`de33ff9`** and the tree was **clean** when I started (TASK-008's
packet is already in git), so this is **not** a stacked hand-off and every file below is this
task's own work.

| File | Change |
|------|--------|
| `src/lib/compose.ts` **(new, 73 lines)** | `composeTemplateToCanvas(template, photos)`, SPEC-002 §6 step 2 verbatim: `document.createElement('canvas')` sized `canvasWidth` x `canvasHeight`, **no background paint of any kind**, then one 9-argument `drawImage` per filled slot walking `template.slots` in array (back-most-first) order with `coverSourceRect` as the source rect. Empty slots are skipped entirely; the §5 zero-size guard is honoured exactly as the preview honours it. |
| `src/components/UseTemplateView.tsx` | `handleGenerate` (guard → compose → `toBlob` → `savePng`), the `useTemplate.generate` button, the **B-12** condition on `useTemplate.pickManyPhotos`, and the message line widened to carry the one `{slots}` placeholder. |
| `src/i18n/th.ts` | The **5** remaining SPEC-002 §7 keys, values copied code point for code point from the approved table; header re-counted 39 → 44 (26 SPEC-001 + all 18 SPEC-002). |

`shared/`, `electron/`, build config, the designer and the whole preview canvas are **untouched**.

### Three calls I made, so you can overrule any of them at review

1. **The message line's state became `{ key, slots? }` instead of a bare key.** `error.requiredSlotEmpty`
   is the only string with a placeholder (B-9) and it needs a runtime value, so the one `useState` now
   holds an object and the render does `th[message.key].replace('{slots}', message.slots ?? '')` — **one**
   `String.replace`, applied uniformly, never branching on a message's text. `UseTemplateSlotPanel`'s
   `onMessage: (key | null) => void` prop is **unchanged**: the view adapts it with a two-line
   `showMessage`. The alternative — a second `useState` for the names — needs two pieces of state that must
   always move together, and I rejected it.
2. **A null 2D context returns the correctly sized, undrawn canvas** rather than throwing. `getContext('2d')`
   is `... | null` in TypeScript and must be handled; a renderer with no 2D context is not a state Electron
   reaches, and neither SPEC-002 nor the TASK gives that path a message. Returning the canvas keeps
   `composeTemplateToCanvas` total and leaves the caller's `toBlob` path exactly as specced. Throwing was
   the other option and would have needed a `try`/`catch` and a message nobody approved.
3. **The required-slot guard is inline in `handleGenerate`, not a fourth exported helper.** SPEC-002 §6 puts
   it in the Generate flow and the TASK names only `composeTemplateToCanvas` for `src/lib/compose.ts`; the
   probe drives it through the button's own `onClick`, so it is asserted where it lives.

**And one thing I did not decide by myself: Q-FE-8** — whether the **Generate** button is *rendered* at all
when no template is loaded. Built one way, non-blocking; see §Questions.

### Verification — 104 assertions, 104 passed, plus typecheck and build

`npm run typecheck` → **exit 0**. `npm run build` → **exit 0** (renderer 462.42 kB, plus `main.js` and
`preload.js`).

**There is no 2D canvas in this harness, and I did not invent one.** No `canvas` package is installed and
the TASK forbids adding a dependency to get one, so `document.createElement('canvas')` is replaced by a
recorder: `width`/`height` are plain fields, and the "2D context" is a `Proxy` that records **every** method
called on it, by name. That makes the two pixel-free DoD boxes real assertions — the draw-call arguments and
the canvas dimensions — and turns "no background is ever painted" into the stronger **"no call other than
`drawImage` was ever made"**. **No pixel was compared anywhere in this run**; the pixel checks are listed for
the human below.

Two probes, bundled with the repo's own esbuild against the **real** modules and run in Node. Entry files,
bundles and the probe-only shims live in this session's scratchpad — **nothing was added to the tree** (the
packet below is the proof).

**Probe A — `src/lib/compose.ts` alone, 35/35.** No React, no components.

| DoD box | What was asserted | Result |
|---------|-------------------|--------|
| Canvas dimensions (B4) | For a template at **1234x777** — far from the 1080x1920 default, and whose preview scale in a 200x200 pane the real `fitScale` puts below 0.2 (asserted in Probe B) — the composed canvas is **exactly 1234x777**; the context asked for is `'2d'` and it is asked for **once**. Also the default 1080x1920. And `composeTemplateToCanvas.length === 2`, so no scale *can* be passed to it. | 7/7 |
| Draw calls (B5, B6) | Three slots, the middle one empty → **two** draw calls, in **array (back-most-first)** order, each in the **9-argument** source-rect form; the image handed over is the decoded element **itself**; each source rect equals `coverSourceRect(naturalW, naturalH, slot.w, slot.h)` computed independently; each destination rect equals the slot's raw `x/y/width/height`; the empty slot is drawn as **nothing**. A three-filled-slot case pins the order again. | 13/13 |
| No background (B15) | Every recorded context call that is not `getContext`/`drawImage` is **empty**, in every shape of template: all slots empty, all filled, no slots at all, a slot hanging off the canvas. No `fillRect`, no `clearRect`, no `clip`, no `fillStyle`. | 5/5 |
| Zero slots | A 2000x3000 template with `slots: []` → canvas exactly 2000x3000, **zero** draw calls. | 2/2 |
| Edges | A photo keyed to a slot the template does not have is ignored; a slot at `(-40, 80, 200, 200)` on a 100x100 canvas is drawn with its **raw** coordinates and nothing is hand-clipped; a **zero-sized** decoded image is skipped exactly as the preview skips it while its neighbour still draws; a **null** 2D context does not throw, still sizes the canvas, draws nothing. | 8/8 |

**Probe B — the toolbar and the Generate handler, 69/69.** The real components are called as plain functions
against shimmed hooks (`useSyncExternalStore` → `getSnapshot()`, so the **real** zustand store is read;
`useState` returns a probe-supplied value and **records every setter call**). react-konva nodes become named
markers; `Blob` / `URL` / `Image` are recorders, so the multi-pick re-assert runs through the **real**
`decodePhotos`.

- **The canary is C0 and it runs first**: the markup is asserted to **move** when the store moves — the new
  template's name and slot name appear and the old ones are gone. If the components were not reading the real
  store, nothing below counts. **C1** pins `th` at **44** keys, asserts each of the five new values against
  the approved table, asserts `useTemplate.photosDropped` is **still** absent, and that `{slots}` is the
  **only** placeholder in the whole table.
- **B-12 (TASK §0):** with **no** template the toolbar renders **no** `เลือกหลายรูป` button at all — its
  *absence* is asserted, and so is the absence of its label anywhere in the tree — and the toolbar holds
  **exactly one** button, the template picker. With a template loaded both `เลือกหลายรูป` and `สร้างภาพ` are
  back, and **neither** carries `disabled` or `aria-disabled` (B-7). TASK-008's behaviour is otherwise
  unchanged: through the toolbar button's own `onClick`, the multi-pick still asks for `multiple: true` with
  the approved dialog strings, still fills the **empty** rows **top-most first**, still leaves the
  hand-filled rows as the **same objects** (`===`), and still revokes nothing it used.
- **The required-slot guard (B17):** a 4-slot template whose required slots are the **2nd and 4th on screen**
  → the message line is first **cleared**, then set **once** to
  `{ key: 'error.requiredSlotEmpty', slots: 'D, B' }` — **on-screen order, not array order** — and `savePng`
  is **not** called, **no** dialog of any kind is opened, and **no canvas is ever created**. Rendered, that
  state produces exactly **one** `role="alert"` line reading `ยังมีช่องที่ต้องใส่รูปว่างอยู่: D, B`, with no
  literal `{slots}` anywhere. One required slot empty → only that one is named. Every required slot filled →
  it saves.
- **The happy path:** only *optional* slots empty → `savePng` **is** called, exactly once, with a real
  `Uint8Array` carrying the encoded bytes and with the options object asserted **whole** — `บันทึกไฟล์ภาพ`,
  `ไฟล์ภาพ (PNG)`, `my-template.png`. Exactly one canvas is composed, at **1234x777**, encoded as
  `image/png`, with one draw call carrying the decoded image itself. **Nothing is logged**, the message line
  is only ever cleared, and re-rendering that state produces **no `role="alert"` node at all** — a successful
  save shows no confirmation (B-8). The same block ties Req 6 / B4 together: the real
  `fitScale(1234, 777, 200, 200) < 0.2` while the exported canvas is still 1234x777.
- **Zero slots end to end:** an 800x600 template with no slots saves, with a canvas of the right size, zero
  draw calls and no background paint.
- **`canceled`** → the line is only cleared, nothing is logged, no alert renders (B7). **`error`** →
  `error.exportFailed` shows and the English `EACCES: permission denied` is **logged and never rendered**.
  **A null blob** → `error.exportFailed`, one log line, and `savePng` is **never** called.
- **Z1** asserts **no handler threw** anywhere in the run.

**Negative controls — 20 deliberate regressions, every one caught.** Each was applied to the **real** file,
both probes were re-bundled and re-run, and the file was restored in a `finally`. The run ends by re-hashing
all three files against their starting sha256 — **"files whose sha256 moved: none"** — and by re-running both
probes green.

| Break | Assertions that failed (A / B) |
|-------|-------------------------------|
| compose: the canvas takes the on-screen scale | 4 / 3 |
| compose: a white background is painted | 5 / 1 |
| compose: empty slots are outlined | 2 / 0 |
| compose: paints front-most first | 7 / 0 |
| compose: the destination rect is halved | 4 / 0 |
| compose: the cover crop is dropped (whole image drawn) | 1 / 0 |
| compose: the zero-size guard is removed | 2 / 0 |
| view: the guard reads store order, not on-screen order | 0 / 2 |
| view: the guard looks at *optional* slots | 0 / 20 |
| view: the guard does not stop the export | 0 / 4 |
| view: the `.png` extension is dropped from the default name | 0 / 2 |
| view: a successful save shows a message | 0 / 2 |
| view: cancel is treated as a failure | 0 / 3 |
| view: a null blob is ignored | 0 / 3 |
| view: **B-12 reverted** — the multi-pick shows with no template | 0 / 3 |
| view: Generate is `disabled` instead of refusing | 0 / 1 |
| view: the multi-pick asks for `multiple: false` | 0 / 1 |
| view: the `{slots}` placeholder is never filled | 0 / 2 |
| th: the approved `error.requiredSlotEmpty` wording is changed | 0 / 2 |
| th: the unshipped `useTemplate.photosDropped` key is added back | 0 / 2 |
| — | after every revert: **35/35** and **69/69** again |

**One more independent check, outside the probes:** all **18** SPEC-002 §7 rows were parsed straight out of
the SPEC file and compared to `src/i18n/th.ts` — **18 compared, 0 mismatches**. The values in the code are
the approved values, not my transcription of them.

### What I could NOT verify — the pixels and the seam

1. **N-SA-1 is still not ticked**, and it is Q-FE-6's named fallback that covers it. I have no window, no
   native dialog and no real photo, so I have **not** seen a real export return `saved`. What I *can* say is
   that nothing in this task touches the payload: the bytes handed to `savePng` are
   `new Uint8Array(await blob.arrayBuffer())` and are asserted to be a real `Uint8Array` carrying exactly
   the encoded bytes. Per your ruling it rides the human's **B14 + B3** pass; an `INVALID_PAYLOAD` there is
   a **seam** problem and comes back to you, not a change I make.
2. **B1, B15's pixels, and the real Save dialog — for the human's acceptance pass.** That the produced PNG
   really measures `canvasWidth` x `canvasHeight`; that its empty areas really are **transparent** in a
   viewer that shows transparency; that the Save dialog opens with `บันทึกไฟล์ภาพ`, offers `<name>.png`, and
   that **cancelling it writes nothing and says nothing**; and the whole unaided flow (B1). Nobody in this
   team has a screen.
3. **B5's pixels** — that the exported crop *looks* the same as the preview's. The arithmetic is asserted to
   be the identical `coverSourceRect` call in both, which is as far as a harness can go.

Still open and untouched by this task: **B12 + B9** (TASK-007), **B3 + B14** (TASK-008), the `shared/`
byte-type one-word fix (Q-FE-7) and the Q-FE-1 dark-mode TASK — all yours or the human's.

### Hand-off packet (SPEC-001 §10)

```
base de33ff9 (full de33ff9ad09d171abd769142ced183de303416eb)
 M src/components/UseTemplateView.tsx         a3917344b78da2fa
 M src/i18n/th.ts                             e9b6c7db954f13d6
?? src/lib/compose.ts                         6549d0f33ca7dc61
```

Three files, all under `src/`. `git diff --stat` on the two tracked ones →
`2 files changed, 100 insertions(+), 20 deletions(-)`; the new file is 73 lines.
**Not a stacked hand-off** — the base is a real commit and the tree was clean before I started, so no earlier
TASK's fingerprint is superseded here. No git write of any kind — no `add`, no `commit`, no branch, no push.
`dist/` and `dist-electron/` moved when I ran the build but are gitignored, so they are not in the porcelain.

## Questions

**Q-FE-8 (non-blocking, built one way) — is the *Generate* button rendered at all when no template is
loaded?** SPEC-002 §6 and the TASK both say Generate is *"always enabled **once a template is loaded**"*, and
the DoD box only asks me to assert it is present and not `disabled` **when a template is loaded** — neither
says what the toolbar shows **before** one is. I built it as **(ก)**: Generate is wrapped in the **same**
`template &&` condition §0 just put on `useTemplate.pickManyPhotos`, so with no template the toolbar offers
only `เลือกเทมเพลต`. My reasoning, which you can overrule:

- **(ก) hide it** (what I built) — B-12's own argument transfers unchanged: without a template the button can
  do nothing visible, and B-7 refuses the disabled variant *because a disabled button cannot name its
  reason*; this one cannot name one either. It also leaves `handleGenerate` with no unspecified path.
- **(ข) render it, enabled, and let a click do nothing** — matches "always enabled" read literally, but that
  silent no-op is behaviour nobody specified and nobody approved a message for.
- **(ค) render it disabled** — contradicts B-7 head on.

Nothing else moves either way: no string, no store field, no criterion. `handleGenerate` keeps its
`if (!template) return;` guard regardless, so (ข) would be a one-line change to the JSX and nothing else.

> **answer (Sober, 2026-08-23): (ก) — hide it, exactly as you built it. Nothing to change.**
> Your own argument is the right one and I am adopting it verbatim: B-12's reasoning transfers
> unchanged, and B-7 refuses the *disabled* variant **because a disabled button cannot name its
> reason** — Generate-with-no-template cannot name one either. (ข)'s silent no-op is behaviour
> nobody specified and nobody approved a message for, which is the same trap Q10 = ก closed on
> the dropped-photos notice; (ค) contradicts B-7 head on.
> This is now **SA call B-13** in SPEC-002 §9, and §6 "Generate" no longer says only *"always
> enabled"* — it says *rendered* only when a template is loaded, and enabled once rendered. The
> one consequence I have routed to Porter for the human's acceptance pass: before a template is
> picked, the Use Template toolbar shows exactly one button, `เลือกเทมเพลต`. My **C2** block
> asserts that state (one toolbar button, and neither label anywhere in the tree).

**FYI answered — Q-FE-7 is settled, and it is mine.** Confirmed by my own read: the only
`as Uint8Array<ArrayBuffer>` left in the tree is the *inbound* one in `src/lib/photo.ts:74`;
`new Uint8Array(await blob.arrayBuffer())` needs no cast, so the outbound path adds no second
site. **One site, so the one-word `shared/` fix retires the whole cast** — a BE TASK I own and
have not written yet (one unit per session). Nothing for you in it.

**FYI for your Q-FE-7 ruling (not a question) — it is one site, not two.** The *outbound* payload needed
no cast at all: `new Uint8Array(await blob.arrayBuffer())` is already `Uint8Array<ArrayBuffer>`, so
`savePng(bytes, …)` typechecks as written. The single `as Uint8Array<ArrayBuffer>` in the codebase is still
the *inbound* one in `src/lib/photo.ts`, and the one-word `shared/` fix you measured would retire exactly
that one.

## Review

**Verdict: DONE** — Sober (SA), 2026-08-23. Accepted as it stands at base `de33ff9` + the
3-file packet. Everything below I ran myself, from the SPEC, on a **scratch copy** of `src/`
and `shared/`; Fern's own numbers were not reused and not trusted as evidence.

### A. The packet is what it says it is

`git log -1` → `de33ff9`, parent `6879acf`. `git status --porcelain` → exactly
`M src/components/UseTemplateView.tsx`, `M src/i18n/th.ts`, `?? src/lib/compose.ts` and nothing
else. All three sha256 match the packet prefixes (`a3917344b78da2fa`, `e9b6c7db954f13d6`,
`6549d0f33ca7dc61`); `git diff --stat` on the two tracked files → `2 files changed, 100
insertions(+), 20 deletions(-)`, as claimed. Nothing outside `src/`. No git write by me either.

### B. My own verification — 137 assertions, 137 passed

Three probes of my own, bundled with the repo's own esbuild against the **real** modules and run
in Node. Entry files and shims live in my scratchpad; the repo tree was clean before and after
(re-checked with `git status --porcelain`, unchanged).

| Probe | What it exercises | Result |
|-------|-------------------|--------|
| **A** — `compose.ts` alone, no React | canvas size, draw calls, order, background, edges | **31/31** |
| **B** — `UseTemplateView` + the real zustand store | the Generate flow, B-12/B-13 markup, messages | **67/67** |
| **C** — the SPEC file vs `th.ts`, and the real `fitScale` | string table, scale claim | **39/39** |

I have **no 2D canvas** either, and I did not add one. Probe A replaces `document.createElement`
with a recorder whose "2D context" is a `Proxy` that logs **every** method and **every property
set** by name, so "no background is painted" is asserted as *"no call and no assignment other
than `drawImage` ever happened"* — in four shapes of template (all empty, all filled, no slots,
a slot hanging off the canvas). **No pixel was compared anywhere in my run either.**

What is load-bearing in my numbers, over and above re-running what Fern already asserted:

- **B4 is checked against an independent oracle.** Probe A recomputes every expected source rect
  from **SPEC-002 §5's four formulas, written out in the probe**, not by calling the repo's
  `cover.ts` — so a wrong crop cannot agree with itself. Probe C then calls the **real**
  `fitScale(1234, 777, 200, 200)` → **0.1620745542949757**, and the composed canvas for that same
  template is still exactly **1234x777**. The claim "the on-screen scale is never involved" is
  therefore about a scale that really is far from 1, not a rhetorical one. `composeTemplateToCanvas.length === 2`
  pins that no scale *can* be passed.
- **B6 is checked in both directions.** Array order produces paint order `1,2,3`; **reversing the
  slot array reverses it to `3,2,1`**. A function that ignored order would pass the first and fail
  the second.
- **B17 is checked on what the user reads, not on state.** A 4-slot template whose required slots
  are the **2nd and 4th on screen** yields exactly one `role="alert"` node reading
  `ยังมีช่องที่ต้องใส่รูปว่างอยู่: D, B` — **on-screen order, not array order** — with no literal
  `{slots}` left, `savePng` never called, no dialog opened and **no canvas ever created**.
- **B-8 is checked as an absence.** After a `saved`, the message state is only ever *cleared*, and
  re-rendering that state produces **no `role="alert"` node at all**. Same for `canceled`.
- **C1/C-probe pin the strings twice.** 44 keys; the five new values byte-compared to the approved
  table; `useTemplate.photosDropped` still absent; `{slots}` is the **only** placeholder in the
  whole table. Probe C then parses all **18** SPEC-002 §7 rows **out of the SPEC file itself** and
  compares them to `th.ts` — 18 rows, all `APPROVED`, **0 mismatches**. Independent of Fern's own
  identical check, and of my reading of either file.
- **The store is really being read.** Probe B's **C0 canary runs first**: the rendered markup must
  *move* when the real store moves (the new template's name appears, the old one is gone). If the
  components were reading a stub, nothing below C0 would count.
- **TASK-008 did not regress.** Driven through the toolbar button's own `onClick`, a multi-pick
  still asks `multiple: true` with the approved dialog strings, still fills the empty rows
  **top-most first**, still leaves the hand-filled row as the **same object** (`===`), and revokes
  **exactly** the one surplus URL, compared **as a URL** and not as a count.

### C. Negative controls — 22 deliberate regressions, 22 caught, 0 uncaught

Each was applied to the **scratch copy**, both probes re-bundled and re-run, and the file restored
in a `finally`. The runner ends by re-hashing the scratch files ("files whose sha256 moved: none")
and re-running green (**31/31**, **67/67**). The **repo files were re-hashed at the end too** and
still carry the packet's hashes — the repo was never written to at any point.

compose: canvas takes the on-screen scale (A 5) · white background painted (A 5) · empty slots
outlined (A 1 / B 1) · front-most first (A 8) · destination rect halved (A 3) · cover crop dropped
(A 2) · zero-size guard removed (A 2) · **null 2D context unhandled (A crashes — caught as a
throw, which is the point of Fern's call 2)**.
view: guard reads store order (B 2) · guard reads *optional* slots (B crashes) · guard does not
stop the export (B 3) · `.png` dropped from the default name (B 2) · a success shows a message
(B 3) · cancel treated as a failure (B 3) · null blob ignored (B crashes) · **B-12 reverted**
(B 2) · **B-13 reverted — Generate rendered with no template** (B 2) · Generate `disabled`
(B 1) · `multiple: false` (B 1) · `{slots}` never filled (B 2).
th: approved `error.requiredSlotEmpty` wording changed (B 2) · unshipped
`useTemplate.photosDropped` added back (B 2).

### D. Typecheck, build, tree

`npm run typecheck` → **exit 0** (both projects). `npm run build` → **exit 0**. `git status
--porcelain` **after** the build → still exactly the three packet lines; `dist/` and
`dist-electron/` are gitignored, as SPEC-001 §10 expects.

### E. Fern's three calls — all three stand

1. **The message state became `{ key, slots? }`.** Correct, and the *smaller* of the two options:
   one piece of state that cannot desynchronise, one `String.replace` applied uniformly, and
   `UseTemplateSlotPanel`'s `onMessage` prop untouched. Nothing branches on a message's text —
   SPEC-001's rule survives, which is what B-9 was protecting.
2. **A null 2D context returns the sized, undrawn canvas.** Right call. `getContext` is
   `... | null` and must be handled; throwing would have needed a `try`/`catch` and a message
   nobody approved, and inventing one would have broken §7's approval loop. My A5.6/A5.7 pin the
   behaviour so a later change cannot silently turn it into a throw.
3. **The guard stays inline in `handleGenerate`.** Agreed — SPEC-002 §6 puts it in the Generate
   flow and the TASK names only `composeTemplateToCanvas` for `compose.ts`. A fourth exported
   helper would have been an abstraction with one caller.

### F. Two notes — neither is a rework, both are mine to carry

- **N-SA-6 (measured, cosmetic, one line).** `th[message.key].replace('{slots}', message.slots)`
  uses a **string** replacement, so JavaScript's `$` patterns are live in the *value*: a slot the
  user named `A$&B` renders as `ยังมีช่องที่ต้องใส่รูปว่างอยู่: A{slots}B`, and one named `X$'Y`
  renders as `XY`. Measured, not theorised. Reach is exactly one refusal message with an exotic
  slot name — no crash, no wrong file, no export path touched, and the designer's own
  blank/duplicate name rules do not exclude `$`. The fix is one line
  (`.replace('{slots}', () => message.slots ?? '')`), it is **not** Fern's to go back for, and I
  am not opening a rework hop for a cosmetic string. It goes on the board as a one-liner I own,
  to ride the next small FE batch alongside the Q-FE-1 dark-mode TASK.
- **N-SA-7 (observation, no action).** A *decoded but zero-sized* image (`naturalWidth === 0`)
  counts as "filled" for the required-slot guard while §5's guard skips drawing it, so such a slot
  would pass Generate and come out transparent. This is inherited from TASK-007/008 (the preview
  behaves identically) and no requirement reaches it; I am recording it rather than inventing a
  rule. If the human ever hits it, it is a REQ question for Porter, not a defect in this TASK.

### G. What this review does NOT cover — the human's pass

I have no window, no native dialog and no real photo. Unchanged and now **all** of what is left
on REQ-002: **N-SA-1** (a real export returns `saved` and not `INVALID_PAYLOAD` — the outbound
`Uint8Array` over `contextBridge` is still the one link nobody here can prove; an
`INVALID_PAYLOAD` is a **seam** problem and comes back to me), **B1** the whole unaided flow,
**B15**'s pixels (transparency in a viewer that shows it), the produced PNG's pixel size, the real
Save dialog with `บันทึกไฟล์ภาพ` / `<name>.png` and **cancelling it writing nothing**, and
**B5**'s pixels (that the exported crop *looks* like the preview's — the arithmetic is asserted to
be the identical `coverSourceRect` call in both, which is as far as any harness here can go).
Carried from earlier tasks and still the human's: **B12 + B9** (TASK-007), **B3 + B14** (TASK-008).
