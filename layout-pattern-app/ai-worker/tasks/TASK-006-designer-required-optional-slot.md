# TASK-006: Designer — per-slot required/optional, saved and loaded
- Source: SPEC-002
- Status: DONE
- Owner: **Fern (FE)**
- Depends on: TASK-005 (the `required` field must exist in `shared/contract.ts` first)

This is REQ-002 Requirement 15 and nothing else. It is deliberately the **smallest**
change to the Layout Designer that REQ-002 needs — every other designer behaviour stays
exactly as REQ-001 delivered it.

## What to do

### `src/store/designerStore.ts`

- `addSlot` sets **`required: true`** on the new slot (Req 15d — a slot the user never
  touches the control on behaves like an old template's slot).
- Add an action `setSlotRequired(id: string, required: boolean): void`. Do **not** widen
  `SlotPatch` to carry it: `SlotPatch` is the geometry/colour patch used by drag and
  transform, and a boolean flag has no business travelling on that path.
- `toTemplateFile` passes `required` through unchanged (it already spreads the slot; make
  sure the explicit field list, if any, includes it).
- `replaceAll` needs no new repair — `parseTemplateFile` has already filled in `true`
  for a v1 file (TASK-005).

### `src/components/SlotPropertiesPanel.tsx`

One checkbox, below the colour input, inside the existing `selectedSlot &&` block:
`checked={selectedSlot.required}`, `onChange` → `setSlotRequired(selectedSlot.id, …)`,
label `th['props.required']`. Same `text-xs text-slate-600 dark:text-slate-300` label
styling as its neighbours. **Checked = required.**

### `src/i18n/th.ts`

Add **only** `props.required` from SPEC-002 §7. Leave every other key alone in this task
(the rest arrive with TASK-007/008/009, and `mode.useTemplate.badge` is deleted in
TASK-007). Its value is **APPROVED** (Q-SA-3 answered 2026-08-23 — REQ-002 §Questions
Q13, *"อนุมัติหมด"*): copy it character for character from SPEC-002 §7, it is what ships.
Still build the *logic* against the key, never against the text.

## Constraints

- Nothing else in the designer moves: no change to rename, colour, z-order, delete, add,
  canvas size, save/load wiring, or the slot list.
- Do not touch `shared/`, `electron/`, or build config.
- No git write (SPEC-001 §10). Hand off uncommitted with a packet.

## Definition of Done

- [x] A newly added slot is `required: true` (assert on the store, not on the DOM).
- [x] `setSlotRequired` flips exactly one slot and leaves every other slot and every other
      field of that slot untouched.
- [x] Round-trip: a design with a mix of `required: true` / `false` →
      `toTemplateFile()` → `JSON.stringify` → `parseTemplateFile` → `replaceAll` brings
      **the same marks back**, and a second save is byte-identical to the first.
- [x] **Old file, the acceptance case (B19):** a template JSON with no `formatVersion` and
      no `required` on any slot loads with **every slot `required: true`**, no error, and
      the design otherwise byte-identical to what REQ-001 produced.
- [x] `SlotPropertiesPanel` markup: with a required slot selected the checkbox is
      `checked`; with an optional one it is not; toggling it calls the store once. Use the
      `renderToStaticMarkup` harness **with the zustand canary of TASK-004 §Review N6** —
      `getInitialState()` is what gets rendered unless the canary proves otherwise.
- [x] `npm run typecheck` exit 0 and `npm run build` exit 0 (the `src/` errors TASK-005
      left behind are expected to disappear here — say so explicitly).
- [x] Hand-off packet recorded (SPEC-001 §10). Nothing outside `src/`.
- [ ] **Still open — verified by nobody in the team, for the human's acceptance pass:** that
      the checkbox is readable and operable **in dark mode** on a real screen. Read it with
      the Q-FE-1 ruling in §Review F before judging it.

## Implementation Notes

*(Fern, 2026-08-23)*

### What changed — 3 files, +27 / -1 lines, nothing outside `src/`

| File | Change |
|------|--------|
| `src/store/designerStore.ts` | `addSlot` now sets `required: true` (Req 15d). New action `setSlotRequired(id, required)` — a plain `map`, no `normalizeZIndex` (a boolean cannot change stacking), placed next to `renameSlot` because it is the other "one field, one slot" action. `SlotPatch` is **not** widened, as the TASK asks; a comment in the code says why. `toTemplateFile` needed **no edit** — it already spreads `...slot`, so `required` travels through, and the probe proves it rather than assuming it. `replaceAll` untouched. |
| `src/components/SlotPropertiesPanel.tsx` | One `useDesignerStore` selector for `setSlotRequired`, and one checkbox `<label>` below the colour input, inside the existing `selectedSlot &&` block. `checked={selectedSlot.required}`, `onChange` → `setSlotRequired(selectedSlot.id, event.target.checked)`. |
| `src/i18n/th.ts` | `+'props.required': 'ต้องใส่รูป'` after `props.color`. No other key added, none removed — `mode.useTemplate.badge` is still there and is TASK-007's to delete. |

Nothing else in the designer moved: rename, colour, z-order, delete, add, canvas size, save/load
wiring, the slot list, `shared/`, `electron/` and build config are all untouched (see the diff —
three hunks in the store, two in the panel, two in `th.ts`).

### Three small calls I made, so you can overrule any of them at review

1. **The checkbox label is a row, not a column.** Its neighbours are `flex flex-col gap-1 …`
   because a label sits *above* an input; a checkbox reads as box-then-text, so it is
   `flex items-center gap-2` with the **same** `text-xs text-slate-600 dark:text-slate-300`
   the TASK names. If you want it visually identical to its neighbours instead, that is a
   one-word change.
2. **The checkbox input carries only `h-4 w-4 cursor-pointer`.** I first mirrored the colour
   input's `rounded border border-slate-300 dark:border-slate-600` and then removed it: this
   repo has no `@tailwindcss/forms`, so on a native checkbox those classes paint nothing.
   Shipping inert classes would have made the dark-mode DoD line look covered when it is not.
   See Q-FE-1.
3. **`src/i18n/th.ts`'s header comment said "All 27 keys … from SPEC-001 §7".** My one added
   key made that false, so the two comment lines now say 28 = 27 from SPEC-001 §7 + one from
   SPEC-002 §7. No key, value or behaviour moved with it. If you would rather the header not
   be touched inside this TASK, say so and I will revert those two lines.

### Verification — 190 assertions, 190 passed, plus typecheck and build

`npm run typecheck` → **exit 0**, and `npm run build` → **exit 0** (renderer 452.93 kB, plus
`main.js` and `preload.js`; only the standing Vite CJS-API deprecation notice). **This is the
DoD's "say so explicitly": the one `src/` error TASK-005 left behind — `designerStore.addSlot`
missing `required` — is gone, and it is gone because `addSlot` now supplies the field, not
because anything was silenced.** No `@ts-expect-error`, no `any`, no cast was added anywhere.

Two probes, bundled with the repo's own esbuild against the **real** modules (`designerStore`,
`shared/contract`, `SlotPropertiesPanel`, `th`) and run in Node. Entry files, bundles and the
jsx shim live outside the repo, in this session's scratchpad — **nothing was added to the tree**
(the packet below is the proof).

**Probe A — store / round trip, 165/165.**

| DoD box | What was asserted | Result |
|---------|-------------------|--------|
| 1 | Three `addSlot()` calls: every new slot has `required === true` (strict, own key, `typeof` boolean) and exactly the contract's nine keys. | 8/8 |
| 2 | `setSlotRequired` on the middle of three slots: the target flips; **every other slot and every other field of that slot is byte-identical** (all 8 non-`required` fields × 3 slots, key set, array order, count), canvas / template name / **selection** untouched, setting the same value twice is idempotent, flipping back works, and an unknown id is a no-op. | 32/32 |
| 3 | 4 slots, two marked optional, one moved+recoloured, one renamed, one brought forward → `toTemplateFile()` (`formatVersion` **2**, every slot a boolean `required`, genuinely mixed) → `JSON.stringify` → **store wiped to a fresh state** (stands in for quit-and-relaunch) → `parseTemplateFile` → `replaceAll`: **the same marks come back per slot name**, the second save is **byte-identical** to the first, and a third round is too (the fixed point is reached on the first save). | 13/13 |
| 4 (**B19**) | The exact v1 JSON recorded in TASK-004 §Implementation Notes, in **both** shapes — `"formatVersion": 1` and **no `formatVersion` key at all** — loads with **no error** and **every one of its 5 slots `required: true`**; template name, canvas and all 8 other fields of all 5 slots match the file exactly, in order, with no extra key. And: strip `required` back out of the re-save and it is **byte-identical to the REQ-001 file** — "otherwise unchanged", measured rather than asserted. | 108/108 |
| — | Contract guards re-run from the renderer's side: `"required": "yes"` is still rejected, an explicit `false` survives the parser, and its siblings still default to `true`. | 4/4 |

The mixed-marks file of box 3 (ids are per-run UUIDs):

```json
{
  "formatVersion": 2,
  "name": "Mixed Marks",
  "canvasWidth": 1080,
  "canvasHeight": 1920,
  "slots": [
    { "id": "2ef8a122-…", "name": "slot 2", "x": 12, "y": 23, "width": 334, "height": 445, "zIndex": 0, "color": "#123456", "required": true },
    { "id": "6109a7a2-…", "name": "slot 1", "x": 40, "y": 40, "width": 300, "height": 300, "zIndex": 1, "color": "#4f8ef7", "required": false },
    { "id": "f1ca90f7-…", "name": "slot 3", "x": 104, "y": 104, "width": 300, "height": 300, "zIndex": 2, "color": "#4fbf6f", "required": false },
    { "id": "6450441b-…", "name": "Footer", "x": 136, "y": 136, "width": 300, "height": 300, "zIndex": 3, "color": "#b14ff7", "required": true }
  ]
}
```

**Probe B — rendered markup, 25/25** (`react-dom/server` + the **TASK-004 §Review N6 canary**).

- **The canary is assertion C0 and it runs first.** zustand 5.0.15 feeds SSR from
  `api.getInitialState()`, so the harness mutates that object **in place** and C0 asserts the
  markup actually *moves* (`selectedSlotId: null` → no `type="checkbox"` in the output;
  `selectedSlotId: 'a'` → exactly one). Had the store not been reached, C0 fails and nothing
  below it counts as evidence.
- Required slot selected → **exactly one** checkbox and it carries `checked=""`. Optional slot
  selected → exactly one checkbox and **no** `checked` anywhere in the panel. The two markups
  differ.
- The label renders `th['props.required']`, and that value is compared to SPEC-002 §7's
  **code point by code point** (`ต้องใส่รูป`) — not by eyeballing the glyphs.
- The checkbox is inside a `<label>` carrying `text-xs`, `text-slate-600`,
  `dark:text-slate-300`, and it sits **after** the colour input in document order.
- The panel's other three strings and both existing inputs still render, and the panel's
  visible text (tags stripped) contains **no Latin at all**.
- **"Toggling it calls the store once":** `react/jsx-runtime` was aliased in the *bundle only*
  to a shim that records each element's props while delegating to the real runtime, so the
  checkbox's own `onChange` could be invoked from Node with no DOM. `onChange({target:{checked:false}})`
  → **exactly one** call, `setSlotRequired('a', false)`, and the store lands with slot `a`
  optional and slot `b` untouched; `{checked:true}` → exactly one call with `true`.
  Product code is untouched by this: the shim exists only in the scratch bundle.

### What I could NOT verify — the last DoD box, for the human's acceptance pass

**That the checkbox is readable and operable in dark mode on a real screen is unverified.** No
window and no DOM exist in my session. Everything above is code and markup, not pixels. Please
carry it to the human's pass together with **Q-FE-1**, which is the reason I am not willing to
call this one "probably fine".

### Hand-off packet (SPEC-001 §10)

```
base fc9ba21 (full fc9ba21789e5072a9a258887771822399ae4e5e6)
 M src/components/SlotPropertiesPanel.tsx
 M src/i18n/th.ts
 M src/store/designerStore.ts
sha256(16):  SlotPropertiesPanel.tsx 4a63afb31ec1d4db
             th.ts                   57a9e1f1e51b032d
             designerStore.ts        5ef242aca0c52f9c
```

Three files, all under `src/`. `git diff --stat` → `3 files changed, 27 insertions(+), 1 deletion(-)`.
No git write of any kind — no `add`, no `commit`, no branch, no push. `dist/` and `dist-electron/`
moved when I ran the build but are gitignored, so they are not in the porcelain.

**FYI on the base, read-only `git` only, and it is yours to rule on, not mine:** my base is
**`fc9ba21`**, not `e6faa0f` — the tree was **clean** when I started, and
`git show --stat fc9ba21` lists exactly TASK-005's four files (`electron/ipc/image.ts`,
`electron/main.ts`, `electron/preload.ts`, `shared/contract.ts`), authored `dev`,
2026-08-23 03:06 +0700, with `e6faa0f` as its parent. I am reporting the observation and
drawing no conclusion about REQ-002 **Q15** — whether that settles it is yours and Porter's.

## Questions

**Q-FE-1 — non-blocking, but it decides how the human should judge the last DoD box.**
A native `<input type="checkbox">` does **not** follow this app's dark mode. Dark mode here is
Tailwind's `darkMode: 'class'` (a `dark` class on `<html>`, TASK-004), but nothing in
`src/index.css` or `tailwind.config.js` sets **`color-scheme`**, and `@tailwindcss/forms` is not
installed — so the browser paints the box using the OS colour scheme, independent of the app's
toggle. On a light-scheme OS the checkbox stays a light box on the dark panel.

I did **not** fix it: the fix is one `color-scheme` declaration in `src/index.css` (or a
`dark:[color-scheme:dark]`), which is app-wide styling, and TASK-006 says *"nothing else in the
designer moves"*. Three ways forward, all cheap — **which do you want?**
(ก) leave it, and the human judges the checkbox as-is on his machine;
(ข) I add the one `color-scheme` line here as a scoped exception you name in the review;
(ค) it becomes its own small TASK, since it will affect every native control the app ever shows
(the colour input already has the same property today, and TASK-008/009 add none).

I have **no** other questions: SPEC-002 §3, §7 and REQ-002 Req 15 answered everything this TASK
needed, and I did not have to guess at anything user-facing.

> **answer (Sober, 2026-08-23): (ค) — its own small TASK, and TASK-006 is accepted as it
> stands.** You were right not to fix it here, and right not to ship inert classes to make
> the box *look* covered. Three reasons for (ค) over (ข):
> 1. **It is not TASK-006's defect.** `color-scheme` is missing app-wide, and the colour
>    input has had exactly the same property since REQ-001 — which the human accepted on
>    2026-08-23 with all 17 criteria ticked. Your checkbox only made an existing gap
>    visible; folding the fix in here would bury an app-wide change inside a task whose
>    whole point is "nothing else in the designer moves".
> 2. **(ข) would cost a REWORK for a line that belongs in another file.** The change is in
>    `src/index.css` / `tailwind.config.js`, not in the three files this TASK names, and it
>    changes how *every* native control the app ever shows is painted — that is a decision
>    with its own blast radius, so it gets its own DoD, not a footnote in mine.
> 3. **(ก) is the one reading I reject.** REQ-002 Req 9 / B9 wants dark mode to work, and
>    "a light box on a dark panel" is not it. Leaving it unowned would push it to the
>    human as a surprise at acceptance.
> **What happens next, so nothing dangles:** I write that TASK (`color-scheme` for native
> controls, both modes, one line + its regression check) in my next unit of work, and
> Porter carries an FYI to the human so he judges the checkbox on 2026-08-23 knowing the
> box is *supposed* to be OS-coloured for now. Nothing in TASK-006 changes either way.
> Do **not** start it yourself — TASK-008 stays your next piece of work.

## Review

*(Sober, 2026-08-23)* — **verdict: DONE.** Req 15 is implemented exactly as specced, in
three files and nothing else, and every DoD box but the dark-mode one is now measured
rather than asserted. The one box left open is on-screen only and goes to the human's
acceptance pass with the Q-FE-1 ruling attached (F below).

### A. What I ran myself — 202 assertions, 202 passed

Verified by me, **not** read off the Implementation Notes. Three probes, bundled with the
repo's own esbuild against the **real** modules (`designerStore`, `SlotPropertiesPanel`,
`th`, `shared/contract`) and run in Node 22. Entries, bundles, the jsx shim and a mutated
**copy** of `src/` + `shared/` live in this session's scratchpad — **nothing was written
into the repo** (see D).

**Probe A — store and round trip, 160/160.**

| DoD box | What I asserted | n |
|---------|-----------------|---|
| 1 | Three `addSlot()` calls: `required === true` strictly, `typeof` boolean, own key present, and the slot carries **exactly the contract's nine keys** — so the field is set, not inherited or stringly-typed. | 13 |
| 2 | `setSlotRequired` on the middle of three slots: the target flips; its **other eight fields** and **both other slots** are byte-identical; array order, length and key set unchanged; canvas size, template name (still untrimmed in the store) and **selection** untouched; same value twice is idempotent; flipping back restores the slot **exactly**; an unknown id is a no-op. | 25 |
| 3 | Four slots, two marked optional, one moved to fractional geometry and recoloured, one renamed, one brought forward → `toTemplateFile()` (`formatVersion` **2**, every slot a boolean `required`, genuinely mixed) → `JSON.stringify` → **store wiped** (stands in for quit-and-relaunch) → `parseTemplateFile` → `replaceAll`: the same marks come back **per slot name**, the second save is **byte-identical** to the first, and so is a third — the fixed point is reached on the first save. | 9 |
| 4 (**B19**) | A REQ-001-era file — five slots, no `required` anywhere — in **both** shapes (`formatVersion: 1` and **no `formatVersion` key**) loads with no error and **every slot `required: true`**; template name, canvas and all eight other fields of all five slots match the file exactly, in order, with no extra key; and the re-save **minus the new field, with `formatVersion` put back to 1, is byte-identical to the original file**. That is "otherwise byte-identical to what REQ-001 produced", measured. | 108 |
| — | Contract guards from the renderer's side: a non-boolean `required` is rejected, an explicit `false` survives the parser, its sibling still defaults to `true`. | 3 |
| — | One recorded, not celebrated: a cast past `SlotPatch` **does** reach the field. `SlotPatch` keeping the flag off the drag/transform path is a **type-level** guard, which is what the TASK asked for — nobody should read it as a runtime defence. | 2 |

**Probe B — rendered markup, 33/33** (`react-dom/server`, TASK-004 §Review N6 canary).

- **C0 is the canary and it runs first.** zustand 5.0.15 feeds SSR from
  `getInitialState()`, so the harness mutates that object in place and asserts the markup
  **moves** with it: nothing selected → zero `type="checkbox"`; slot selected → exactly
  one. The probe **exits** if C0 fails, so nothing below can be evidence of the wrong store.
- Required slot → exactly one checkbox carrying `checked=""`. Optional slot → exactly one
  checkbox and the substring `checked` appears **nowhere** in the panel. The two markups differ.
- The label is inside a `<label>` that carries `text-xs`, `text-slate-600` **and**
  `dark:text-slate-300`, and the checkbox sits **after** the colour input in document order.
- Panel regression: `props.heading` / `props.name` / `props.color` still render, exactly
  three `<input>`s (text, color, checkbox), and the visible text with tags stripped
  contains **no Latin at all**.
- **"Toggling it calls the store once"**: `react/jsx-runtime` is aliased **in the scratch
  bundle only** to a shim that records each element's props and delegates to the real
  runtime, so the checkbox's own `onChange` is invoked from Node with no DOM. Both
  directions: `{checked:false}` → **exactly one** call, `('a', false)`, slot `a` lands
  optional in the live store and slot `b` is byte-identical to the scene; `{checked:true}`
  → exactly one call, `('b', true)`. Product code is untouched by the shim.

**Probe C — the shipped string, 9/9.** `props.required` is read out of `src/i18n/th.ts`
and the value out of the **SPEC-002 §7 table row**, both from disk, and compared **code
point by code point**: `e15 e49 e2d e07 e43 e2a e48 e23 e39 e1b` on both sides. The row is
marked APPROVED, the value carries no `{…}` placeholder, `th.ts` holds 32 keys and
`props.required` appears exactly once.

### B. The probes bite — six deliberate regressions, on a copy

A probe that cannot fail is not evidence. I copied `src/` + `shared/` to the scratchpad,
broke one thing at a time in the **copy**, and re-ran:

| mutation | what failed |
|----------|-------------|
| `addSlot` sets `required: false` | A1 ×3 + A2.14 |
| `setSlotRequired` drops the id test (maps every slot) | A2.5, A2.6, A2.15, A3.3 |
| `toTemplateFile` lists fields explicitly instead of spreading | A3.2, A3.3, A3.7, A4.9 |
| `checked` hard-wired to `true` | C2b, C3, C9h |
| `dark:text-slate-300` dropped from the label | C5d |
| `onChange` calls the store twice | C9c, C9d, C9i, C9j |

Every mutation was reverted and the copy re-hashed back to the tree's own sha256.

### C. typecheck, build, and the error TASK-005 left

`npm run typecheck` → **exit 0** (both projects). `npx vite build` → **exit 0** (renderer,
`main.js`, `preload.js`). **The DoD's "say so explicitly": the single `src/` error TASK-005
knowingly left behind — `designerStore.addSlot` missing `required` — is gone, and it is
gone because the field is supplied.** I checked that rather than trusting it: the whole
diff of both code files contains no `@ts-expect-error`, no `@ts-ignore`, no `any` and no
cast. Nothing was silenced.

### D. Base, packet, and the one thing I could not re-verify

The tree moved under this review and it is worth being exact about it. `develop` is now
`6879acf` (parent `fc9ba21`, author `dev`, 2026-08-23 11:17 +0700), `git status
--porcelain` **empty** before and after everything I ran, and `git diff --name-status
fc9ba21 6879acf` is **exactly the ten files of TASK-007's cumulative packet**, all ten
sha256(16) matching it byte for byte, nothing outside `src/`. So the human's commit holds
precisely the material handed off — no extra file, no drive-by edit.

Inside that, TASK-006's own three:

- `SlotPropertiesPanel.tsx` → `4a63afb31ec1d4db`, **identical to this TASK's packet**;
  TASK-007 never touched it.
- `th.ts` and `designerStore.ts` moved on (`f7b40de0d331e929`, `a75d2c3e693a55d4`) because
  TASK-007 edits the same two files. I separated the work by diff instead: in
  `designerStore.ts` TASK-006 is **three hunks** (the interface line, `addSlot`'s
  `required: true` + comment, the `setSlotRequired` action) and every other hunk is
  TASK-007's `normalizeZIndex` move; in `th.ts` TASK-006 is the **single** line
  `'props.required'`. Nothing else in the designer moved — rename, colour, z-order,
  delete, add, canvas size, save/load wiring and the slot list are untouched, and
  `shared/`, `electron/` and build config never appear in the diff.
- **What I therefore could NOT re-verify, stated rather than glossed:** the TASK-006-only
  intermediate state (its two shared files at `57a9e1f1e51b032d` / `5ef242aca0c52f9c`)
  exists nowhere any more — it was never a commit, and the working tree has moved past it.
  I verified TASK-006 **as it stands inside the cumulative state**, which is the state that
  will ship. The behavioural consequence is one place only: DoD boxes 3 and 4 run through
  `replaceAll`, which TASK-007 rewrote to call `normalizeTemplate`. My probes measure that
  rewritten path and it round-trips correctly — but a green box 3/4 here is evidence about
  the **cumulative** tree, not about TASK-006 in isolation. This is exactly what **Q-FE-2**
  (TASK-007) is about; the answer belongs in that review, not this one.
- **Observation for Porter, drawing no conclusion (REQ-002 Q17).** Q17 asks the human for
  the id of his second 2026-08-23 commit. Read-only `git` says it is `6879acf` with the
  properties above. That is my observation, exactly as Fern's was for Q15 — whether it
  closes Q17 is Porter's ruling with the human, not mine.

### E. The three calls Fern flagged — all three stand, none overruled

1. **Row layout (`flex items-center gap-2`) for the checkbox label.** Correct. The TASK
   fixes the *text* styling (`text-xs text-slate-600 dark:text-slate-300`, all three
   asserted present in C5) and a checkbox reads box-then-text; copying the column layout of
   a label-above-input would have been the wrong kind of consistency.
2. **Only `h-4 w-4 cursor-pointer` on the input.** Right call, and for the right reason:
   with no `@tailwindcss/forms` in this repo those border/rounded classes paint nothing on
   a native checkbox, and shipping them would have made the dark-mode box **look** covered
   while changing no pixel. Declining to fake coverage is the behaviour I want from this team.
3. **Re-counting the `th.ts` header comment.** Keep it. A header reading "All 27 keys …
   from SPEC-001 §7" would have been false the moment a SPEC-002 key landed, and this file
   is the one place the team is allowed to trust about Thai text. TASK-007 has since
   re-counted it again to 32 = 26 + 6; I counted the keys myself and 32 is correct.

### F. Not verified by anyone — the last box, and the Q-FE-1 ruling

**Dark mode on a real screen is unverified**, by Fern and by me: no window and no DOM
exists in either session, and everything above is code and markup, not pixels. It goes to
the human's acceptance pass **with the Q-FE-1 answer attached** — a native
`<input type="checkbox">` does not follow this app's `dark` class, because nothing sets
`color-scheme` and `@tailwindcss/forms` is not installed. I ruled Q-FE-1 **(ค)**: this is
an app-wide gap that predates TASK-006 (the colour input has it too, and shipped in
REQ-001), so it gets **its own small TASK**, which I write next, and TASK-006 is accepted
as it stands. Full reasoning in §Questions. The human should judge the checkbox knowing
the box is **supposed** to be OS-coloured until that TASK lands — Porter carries that FYI.
