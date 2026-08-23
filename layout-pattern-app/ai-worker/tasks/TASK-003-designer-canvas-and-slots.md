# TASK-003: Layout Designer canvas + slot model
- Source: SPEC-001
- Status: DONE (Sober, 2026-08-22 — accepted at `77673af`, local branch `task-003-designer-canvas`, not pushed; verdict in §Review)
- Owner: Fern (FE)
- Depends on: TASK-001

## What to do

Build the Layout Designer inside `src/` per **SPEC-001 §5** (behaviour) and §2 (file
layout). Renderer only — never touch `electron/`, and treat `shared/contract.ts` as
read-only.

- `src/store/designerStore.ts` (Zustand): `canvasWidth`, `canvasHeight`,
  `templateName`, `slots: SlotData[]`, `selectedSlotId`; actions `addSlot`,
  `updateSlot`, `renameSlot`, `deleteSlot`, `bringForward`, `sendBackward`,
  `setCanvasSize`, `setTemplateName`, `selectSlot`, `replaceAll(template)`,
  `toTemplateFile()`. `zIndex` is re-normalised to `0…n-1` after every mutation;
  `toTemplateFile()` rounds x/y/width/height to integers.
- `src/components/DesignerCanvas.tsx`: react-konva `Stage` sized to the canvas
  dimensions (scaled to fit the viewport — the model keeps true pixel values), one
  `Rect` + `Text` per slot ordered by `zIndex`, draggable, a `Transformer` on the
  selected slot with **rotation disabled**, free ratio, min 20x20, scale baked back
  into width/height on `transformEnd`. Clicking empty stage clears selection.
- `src/components/SlotListPanel.tsx`: slots listed top-most first, showing the slot
  name, with bring-forward / send-backward / delete per row and click-to-select.
- `src/components/SlotPropertiesPanel.tsx`: name text input and `<input type="color">`
  for the selected slot.
- `src/components/Toolbar.tsx`: canvas width/height number inputs (default 1080x1920,
  1…10000) and the add-slot button.
- New slot defaults exactly as SPEC-001 §5 "Add slot" (size, cascade position, first
  free `slot N` name, next colour of an 8-colour rotation).
- **Rename rule — implement SPEC-001 §5 "Rename" exactly.** Commit on Enter/blur (not
  per keystroke); comparison against the other slots is **trimmed and case-INSENSITIVE**
  (`name.trim().toLowerCase()`) — SPEC-001 §9 A-6, corrected 2026-08-22 after the human
  vetoed case-sensitivity; the stored name keeps the casing the user typed. A
  duplicate is refused, the input reverts, and `error.duplicateSlotName` is shown
  inline under the name input (`role="alert"`, cleared on next edit or on selecting
  another slot).
- **Blank-name rule — changed 2026-08-22, this is not the provisional you may have
  read before.** A blank / whitespace-only name (`name.trim() === ''`) is refused **and
  warned**: old name kept, input reverts, and `error.blankSlotName` shown in exactly
  the same place and with exactly the same clearing rule as the duplicate message. The
  blank check runs **before** the duplicate check, so an empty field never reports a
  collision. The human asked for this warning himself (REQ-001 Requirement 16 / A15);
  the wordless refusal SPEC-001 §9 Q-SA-3 carried is gone.
- **Default slot name.** First free `slot N` = the lowest number not already in use,
  compared case-insensitively, so `Slot 3` present ⇒ no new `slot 3`. Confirmed by the
  human, criterion A17 — not an assumption you may simplify away.
- `src/i18n/th.ts` holds all **27** keys with the Thai values from **SPEC-001 §7**,
  copied verbatim. All visible text reads from it — no literal string in a component.

## The string table — 26 approved, 1 still draft — read before starting
Check the `state` column of every SPEC-001 §7 row you copy:

- **26 rows are `APPROVED`** — the human approved them verbatim on 2026-08-22
  (*"อนุมัติหมด"*). That is final wording, checked at acceptance (A16).
- **1 row is `DRAFT`**: `error.blankSlotName`. It was created after his approval and
  Porter is taking it to him now. **Build against it anyway** — its *behaviour* is
  settled (Requirement 16 / A15); only the string may still change.

Copy all 27 values verbatim; do not re-word them, do not invent keys, do not add a
string the table does not have. A later correction from the human must be a one-file
change in `src/i18n/th.ts` — so never bake a Thai string into logic, a test, or a
component, and never branch on a message's text.

## Definition of Done

> Ticked at review 2026-08-22 by Sober. Every box is backed by evidence I re-ran
> myself (§Review A) — nothing is ticked on the implementer’s word alone. The boxes
> that carry an **on-screen** clause are ticked on code + logic evidence only; their
> visual half is carried to human acceptance (§Review C).

- [x] Add 5 slots: each gets a distinct default name `slot 1`…`slot 5` and a distinct
      colour; each is draggable and resizable; each shows its name on the rectangle.
- [x] Bring-forward / send-backward visibly change which rectangle overlaps which,
      and `zIndex` stays contiguous `0…n-1` (check the store).
- [x] Deleting from the side list removes the slot and re-normalises `zIndex`.
- [x] Colour picker changes the rectangle colour live; the value in the store is
      `#rrggbb`.
- [x] Canvas size inputs change the stage; existing slots keep their coordinates.
- [x] Renaming `slot 2` to `slot 1` is refused: the field reverts to `slot 2`, `slot 1`
      is untouched, and the Thai `error.duplicateSlotName` appears under the input and
      disappears on the next edit. Renaming to `Slot 1` (different case only) is
      **also refused**, same behaviour — uniqueness is case-insensitive.
- [x] Clearing a slot name to blank (or to spaces only) and committing leaves the old
      name **and** shows the Thai `error.blankSlotName` under the input — same place and
      same disappear-on-next-edit behaviour as the duplicate message, and never the
      duplicate message instead.
- [x] With a slot renamed to `Slot 3`, adding a new slot does not produce `slot 3` (A17).
- [x] Every visible string comes from `src/i18n/th.ts`; grep the components for Thai
      characters and show zero hits.
- [x] `npm run typecheck` passes; `npm run dev` shows no console errors.
- [x] Nothing under `electron/` or `shared/` was modified.
- [x] Committed locally; **no `git push`**.

## Implementation Notes

**Commit `77673af`** on local branch `task-003-designer-canvas`, **not pushed**.
Branched from `4cdec64` (TASK-002) — see Q-FE-5 below.

### Files added / changed (all under `src/`)

| File | What it holds |
|------|---------------|
| `src/i18n/th.ts` | all 27 §7 keys; **generated from the SPEC-001 §7 table by script**, so the Thai values are verbatim by construction, not retyped |
| `src/store/designerStore.ts` | the whole slot model: state, the 11 actions, `zIndex` normalisation, name rules, `toTemplateFile()` |
| `src/components/DesignerCanvas.tsx` | `Stage`/`Layer`/`Transformer`, fit-to-container scaling, empty-stage click clears selection |
| `src/components/SlotRect.tsx` | one slot: draggable `Rect` + its name `Text` |
| `src/components/SlotListPanel.tsx` | slot list, top-most first, bring/send/delete per row, click-to-select |
| `src/components/SlotPropertiesPanel.tsx` | name input (commit on Enter/blur) + colour input + the inline `role="alert"` message |
| `src/components/Toolbar.tsx` | canvas width/height inputs (1…10000) + add-slot button |
| `src/App.tsx` | replaced the placeholder with the designer layout |

Nothing under `electron/` or `shared/` was modified; `shared/contract.ts` is imported
read-only for `SlotData`, `TemplateFile` and `TEMPLATE_FORMAT_VERSION`.
`git diff --stat 4cdec64 -- electron shared package.json package-lock.json vite.config.ts
tsconfig.json tsconfig.node.json index.html tailwind.config.js README.md` → **empty**.

### Design decisions inside the TASK's scope

- **`slots` is kept sorted back-most first** and `zIndex` re-normalised on every
  mutation, so array order *is* paint order. This removes the whole class of
  "sorted in one place, not in another" bugs: the canvas maps the array directly and
  the list panel is its `reverse()`.
- **Rename returns a reason code, not a message.** `renameSlot` returns
  `{ ok: true } | { ok: false; reason: 'blank' | 'duplicate' }`; the panel maps the
  code to a §7 key. Nothing in logic, store or evidence branches on Thai text, so a
  wording change stays a one-line edit in `src/i18n/th.ts` as the TASK requires.
- **Blank is checked before duplicate** inside the store, not in the component, so the
  ordering cannot be lost by a future UI change.
- **The label is a sibling of the rect, not a group child.** That keeps the
  `Transformer` attached to a plain `Rect`, so `scaleX/scaleY` bake straight back into
  `width`/`height` on `transformEnd` with `scale` reset to 1, and the name never
  stretches mid-gesture.
- **Stage is scaled to fit; the model keeps true canvas pixels.** Konva reports child
  coordinates in the unscaled system, so drag/transform values need no conversion.
  Outline width and label font size are divided by the scale so they stay
  screen-constant at 1080x1920.

### Evidence

**1. `npm run typecheck`** — exit 0, no output:

```
> tsc --noEmit -p tsconfig.json && tsc --noEmit -p tsconfig.node.json
```

**2. `npm run build`** — exit 0; renderer 228 modules, `dist-electron/main.js` and
`preload.js` both rebuilt clean.

**3. `npm run dev`** — vite ready in 385 ms on `http://localhost:5173`, Electron
launched, `react-konva` and `zustand` optimised; **zero** lines matching
`error|failed|cannot|unresolved` in the full dev output. All nine renderer modules
were then requested from the dev server and every one transformed **HTTP 200**
(`main.tsx`, `App.tsx`, the five components, `designerStore.ts`, `th.ts`), and the
`@shared` alias resolved to `/shared/contract.ts`. Dev server and Electron stopped
afterwards.

**4. Store behaviour — 39 assertions, all passing.** The store was bundled with the
repo's own esbuild and driven in Node (no files added to the repo — the harness lives
in the session scratchpad, and there is no test runner here per §9 A-9). Full run:

```
DoD 1 - five slots: distinct default names + distinct colours
  PASS  names are slot 1..slot 5
  PASS  colours are 5 distinct #rrggbb
  PASS  cascade positions 40,72,104,136,168
  PASS  new slot is selected on creation
  PASS  zIndex contiguous 0..4
DoD 2 - bring forward / send backward keep zIndex contiguous
  PASS  slot 2 moved up one step
  PASS  zIndex still 0..4
  PASS  send backward is the exact inverse
  PASS  back-most send backward is a no-op
  PASS  top-most bring forward is a no-op
DoD 3 - delete re-normalises zIndex
  PASS  slot 2 gone
  PASS  zIndex re-normalised to 0..3
  PASS  selection cleared (SPEC-001 5 Delete)
default name fills the lowest free number
  PASS  the freed slot 2 is reused, not slot 6
DoD 6 - rename refusals (blank checked BEFORE duplicate)
  PASS  exact duplicate refused
  PASS  case-only duplicate refused (A-6 case-INSENSITIVE)
  PASS  whitespace-padded duplicate refused
  PASS  store untouched by all three refusals
  PASS  blank refused as blank, never as duplicate
  PASS  whitespace-only refused as blank
  PASS  blank wins even when the field would also collide
  PASS  renaming a slot to its own name is allowed
  PASS  renaming to its own name in new casing is allowed
  PASS  user casing is stored verbatim
  PASS  surrounding whitespace is trimmed off the stored name
DoD 7 - A17: a renamed Slot N blocks that number
  PASS  state is slot 1 / Slot 6 / slot 5 / slot 2
  PASS  next name is slot 3 (3 is free again)
  PASS  with Slot 4 present the generator skips 4 and yields slot 3
DoD 5 - canvas size guard, slots keep their coordinates (A-3)
  PASS  size applied
  PASS  slot coordinates untouched by the resize
  PASS  clamped to 1..10000
  PASS  non-integers rounded
DoD 4 - colour patch keeps #rrggbb
  PASS  colour stored lower-case #rrggbb
toTemplateFile - integers + normalised zIndex
  PASS  formatVersion 1 + name carried
  PASS  every geometry value is an integer
  PASS  rounded 10.7/20.2/33.9/44.4 -> 11/20/34/44
  PASS  zIndex contiguous 0..n-1 in the emitted file
replaceAll - never merges, re-normalises a hand-edited zIndex
  PASS  whole state replaced
  PASS  gappy zIndex 7/90 re-normalised to 0/1 in paint order

ALL 39 ASSERTIONS PASSED
```

**5. Thai-string containment.** `src/` searched for the Thai Unicode block: **27 hits
in exactly one file, `src/i18n/th.ts`** (one per key) and **zero** in every component
and in the store.

### DoD status — per box, with what backs it

I have **not** ticked the boxes in the DoD section above: that section is yours, and
PROTOCOL limits me to `## Implementation Notes` and `## Questions`. The mapping is here
instead.

| DoD box | Status | Backed by |
|---------|--------|-----------|
| 5 slots: distinct names + colours | **verified** | evidence 4, first block |
| …each draggable / resizable, name on the rectangle | **code complete, on-screen behaviour NOT verified by me** | see "What I could not verify" |
| bring/send change overlap, `zIndex` contiguous | **logic verified** (evidence 4); the *visible* overlap change is unverified | |
| delete removes + re-normalises | **verified** | evidence 4 |
| colour picker → `#rrggbb` in the store | **logic verified**; live repaint unverified | evidence 4 |
| canvas inputs resize stage, slots keep coordinates | **logic verified** (evidence 4, A-3); the stage resize itself unverified | |
| duplicate rename refused, reverts, Thai message, case-insensitive | **logic verified** (evidence 4, 3 duplicate cases); the inline message *rendering* unverified | |
| blank rename refused + `error.blankSlotName`, never the duplicate one | **logic verified** (evidence 4, 3 blank cases incl. the blank-beats-duplicate case) | |
| `Slot 3` present ⇒ no new `slot 3` (A17) | **verified** | evidence 4 |
| every visible string from `th.ts`, zero Thai in components | **verified** | evidence 5 |
| `npm run typecheck` passes; `npm run dev` no console errors | **typecheck verified**; dev-server output clean, see the caveat below | evidence 1, 3 |
| nothing under `electron/` or `shared/` modified | **verified** | empty `git diff --stat` above |
| committed locally, no `git push` | **verified** | `77673af`, branch never pushed |

### What I could not verify — please read before accepting

Everything above is either a passing command or a passing assertion. Two things are
**not**:

1. **On-screen behaviour.** I cannot see the Electron window. Dragging a slot, pulling
   a transformer handle, watching a rectangle repaint on a colour change, and seeing
   the stage rescale are all **unverified by me** — the code is written to the SPEC and
   typechecks, but no one has looked at it. The scaled-stage arithmetic and the
   transformer's 20x20 minimum (`MIN_SLOT_SIZE * scale` in the bound box) are the two
   places I would look first if something is off.
2. **Renderer console errors.** "`npm run dev` shows no console errors" — I verified the
   *dev server* side (clean output, all nine modules transform 200). I could not open
   DevTools, so a runtime error thrown inside the window would not have reached me.

Both need a human at the app window, which per PROTOCOL is the acceptance path anyway.
Flagging it rather than claiming the boxes.

## Questions

All five are **non-blocking** — each was shipped on a defensible reading of the SPEC and
is listed so you can confirm or correct it at review, not because anything is waiting.

**Q-FE-1 — the 8-colour rotation's actual colours are not specified anywhere.**
SPEC-001 §5 says a new slot's colour is "the next entry of a 8-colour rotation" and §9
A-1 fixes the *format* (opaque lower-case `#rrggbb`), but no palette is given in the
REQ, the SPEC or the TASK. I did not want to block on it, so I picked eight distinct
mid-tone values with §3's own example first, in `SLOT_COLORS` in
`src/store/designerStore.ts`: `#4f8ef7`, `#f76f4f`, `#4fbf6f`, `#b14ff7`, `#f7c94f`,
`#4fd4d4`, `#f74f97`, `#7f8c9a`. **Is that your call to make, or the human's?** These are
the first colours he will see, so it may be worth one line in a Porter round. Either way
it is a one-array change in one file.

> answer (Sober, 2026-08-22): **my call, not the human’s, and your eight values are
> accepted as shipped.** REQ-001 Q12 handed slot colour to me outright
> (*"ปล่อย Sober ตัดสินเอง"*) — that is what §9 A-1 is; the palette *values* are the same
> class of decision and the picker lets the user override any slot instantly. The eight
> are now written into SPEC-001 §9 **A-12**, so the palette is specified rather than
> merely chosen, and `SLOT_COLORS` is where a change lands. I am not spending a Porter
> round on it, but Porter is taking the acceptance check to the human anyway and will
> carry these as an FYI — a veto costs one array.

**Q-FE-2 — does the stored slot name keep surrounding whitespace?** §5 says "the store
trims the value and compares it", then separately "the name is **stored with the casing
the user typed**; only the comparison folds case" — which settles *case* but is silent on
*whitespace*. I read the first clause literally and **store the trimmed value**, so
`"  slot 9  "` is stored as `"slot 9"`; casing is untouched. The alternative (store
untrimmed, compare trimmed) would put leading spaces into the saved JSON and into the
slot label. Confirm the trim-and-store reading, please.

> answer (Sober, 2026-08-22): **trim-and-store confirmed — your reading is the one I
> meant.** Untrimmed storage would put leading spaces into the saved JSON, into the
> canvas label, and into a name that `parseTemplateFile` then has to judge blank-or-not;
> trimming once at the boundary removes all three. The SPEC was silent, which was my
> gap: §5 "Rename" now says it outright. Casing is untouched, exactly as A-6 requires.

**Q-FE-3 — deleting a slot clears the selection unconditionally.** §5 "Delete" says
"remaining `zIndex` values re-normalise; **selection clears**", with no condition, so
that is what I implemented — deleting a *non-selected* slot from the list also clears the
selection. The other reading is that only deleting the *selected* slot clears it, which
is the gentler UX. I followed the SPEC's literal wording; say which you meant.

> answer (Sober, 2026-08-22): **keep it as shipped.** You implemented my literal wording
> and the literal wording is what I intended to be binding; §5 "Delete" now states it
> unambiguously ("whether or not the deleted slot was the selected one") so nobody
> re-litigates it from the same silence. I agree the gentler reading is nicer UX, but it
> is a taste change with a visible effect and no requirement behind it — not worth a
> rework round inside REQ-001. If the human notices it at acceptance it is one condition
> in `deleteSlot`.

**Q-FE-4 — the stage never magnifies.** "Scaled to fit the viewport" is unambiguous when
the canvas is larger than the viewport (the 1080x1920 default always is). For a canvas
*smaller* than the viewport I capped the scale at 1 rather than blowing a 100x100 canvas
up to fill the pane. Unspecified either way; easy to change.

> answer (Sober, 2026-08-22): **cap at 1 confirmed.** Blowing a 100x100 canvas up to fill
> the pane would show the user a preview whose pixels are not the pixels he is designing
> in, which is the opposite of the true-pixel model this task is built on. §5 "Canvas
> size" now carries the clause.

**Q-FE-5 — I branched off TASK-002, which is still in REVIEW.** TASK-003's `Depends on`
is TASK-001 only, but the store must import `SlotData`, `TemplateFile` and
`TEMPLATE_FORMAT_VERSION`, and those live in `shared/contract.ts`, which arrives with
TASK-002 — the TASK itself says to treat that file as read-only, so it presupposes it
exists. I therefore branched `task-003-designer-canvas` from `4cdec64` rather than from
`bae3f6c`. **Flagging the consequence, not asking for a change:** if TASK-002 goes to
REWORK and `shared/contract.ts` changes shape, this branch needs a rebase and my
typecheck evidence would need re-running. If those three type names are stable, nothing
here moves.

> answer (Sober, 2026-08-22): **branching from `4cdec64` was right, and the consequence
> you flagged does not fire.** The TASK does presuppose `shared/contract.ts`; the missing
> `Depends on: TASK-002` was my omission. I checked the rework I sent Jason against your
> imports: R1 changes only the *body* of `parseTemplateFile` (five extra rejection rules)
> and R2 only TASK-002’s DoD — `SlotData`, `TemplateFile` and `TEMPLATE_FORMAT_VERSION`
> do not move. **No rebase, and your typecheck evidence stands.** TASK-004 is where the
> two branches finally meet, and it already depends on both.

## Review

**Verdict: ACCEPTED — TASK-003 is DONE at `77673af`.** No rework. Every logic box of the
DoD is verified by evidence I generated myself, not by reading Fern's; the two gaps he
declared honestly are real, are nobody-in-this-team's to close, and are carried to human
acceptance (C below). Reviewed by Sober, 2026-08-22.

### A. What I re-ran myself (independent of the §Implementation Notes evidence)

I did not accept the 39-assertion transcript as evidence of itself. I bundled the store
with the repo's own esbuild into a scratchpad harness of **my own** 44 assertions —
written from SPEC-001 §5/§3 and this DoD, not from Fern's list — and ran them: **44
passed, 0 failed.** They cover the cascade origin/step and 300x300 default, the `slot N`
generator including the A17 case-insensitive skip, all three duplicate refusals (exact,
case-only, whitespace-padded) and both blank refusals, blank-beats-duplicate ordering,
rename-to-own-name in new casing, `zIndex` contiguity through add/bring/send/delete
including both no-op ends, A-3 (slots keep coordinates on resize), the 1…10000 clamp and
rounding, `toTemplateFile` integer rounding, and `replaceAll` re-normalising a gappy
`zIndex` (7/90 → 0/1) and clearing selection. Three further checks, also mine:

- **The 27 Thai values are verbatim.** Machine-diffed `src/i18n/th.ts` against the
  SPEC-001 §7 table row by row: 27 rows, 27 keys, zero differences, zero extras, zero
  missing. The generated-from-the-table claim holds.
- **Thai containment.** Unicode-block scan of every file under `src/`: hits in
  `src/i18n/th.ts` only, zero in the store and all five components.
- **Scope and gate.** `git diff --name-only 4cdec64 77673af -- . ':!src'` is **empty** —
  nothing outside `src/` was touched, `electron/` and `shared/` included. `npm run
  typecheck` exits 0 on both projects.

Code read in full (store + five components + `App.tsx`). Three things I specifically
went looking for and found correct: the `Transformer` `boundBoxFunc` compares against
`MIN_SLOT_SIZE * scale`, which is right because Konva hands `boundBoxFunc` **absolute**
boxes while the model stays unscaled — this was Fern's own first-suspect and the
arithmetic holds; the label is a `listening={false}` sibling, so the Transformer stays
attached to a bare `Rect` and `scaleX/Y` bake cleanly into `width`/`height`; and the
white page `Rect` is `listening={false}`, so a click on blank canvas reaches the Stage
and clears the selection as §5 requires.

### B. Design calls I am confirming (all five §Questions answered in place)

Answers are written as `> answer:` sub-bullets under §Questions. Two of them close a
genuine hole in **my** SPEC rather than in his code, and are now written into SPEC-001 so
they stop being a reading: §5 "Rename" states that the stored name is the **trimmed**
value (Q-FE-2), §5 "Delete" states that selection clears **whether or not** the deleted
slot was the selected one (Q-FE-3), §5 "Canvas size" states the fit-scale **never
magnifies** (Q-FE-4), and the eight-colour palette is fixed as **§9 A-12** (Q-FE-1). No
code changes from any of it — every one confirms what shipped.

### C. Carried to human acceptance — not a defect, and not closable here

Fern declared two things unverified and was right to. Neither is fixable by any role on
this project: no one here can see the Electron window. They are the human's acceptance
path (PROTOCOL: no QA role, the human is the acceptance tester via Porter), so the task
is accepted with them named rather than parked in REVIEW forever:

1. **On-screen behaviour** — dragging a slot, pulling a transformer handle, the live
   repaint on a colour change, the stage rescaling when the canvas inputs change, and
   the two inline Thai rename warnings actually appearing under the name input.
2. **Renderer console** — the dev-server output is clean and all nine modules transform
   200, but DevTools was never opened, so a runtime error thrown inside the window
   would not have surfaced.

Routed to Porter as an acceptance check, together with one FYI: A-12's eight default
colours are the first thing the human sees and are a one-array change if he dislikes
them.

### D. Notes — recorded, deliberately not actioned in this task

- **N1 — `app.windowTitle` has no owner.** It is the one §7 key no task uses: TASK-003
  does not need it and TASK-004 did not name it, so the window would ship titled
  `layout-pattern-app` in English. Since §1 forbids user-facing strings in the main
  process, it belongs to the renderer. Added to **TASK-004** as one line + one DoD box.
  Not Fern's miss — mine.
- **N2 — a loaded canvas size is not re-clamped to A-2's 1…10000.** `parseTemplateFile`
  requires a positive integer but no upper bound, and `replaceAll` stores what it is
  given, so a hand-edited `canvasWidth: 999999` loads (verified: it does). It cannot
  crash — the stage just scales to fit and the next edit re-clamps — and the app can
  never write such a file. **No change for REQ-001**; if it ever matters it is one line
  in `parseTemplateFile`, not a renderer change.
- **N3 — the canvas size inputs cannot be cleared while typing.** `Number('') === 0`
  clamps to 1, so emptying the field snaps it to `1`; select-all-and-retype works
  normally. Not in any DoD and not specified. **No change for REQ-001**; if the human
  trips on it at acceptance it is local draft state in `Toolbar.tsx`.
