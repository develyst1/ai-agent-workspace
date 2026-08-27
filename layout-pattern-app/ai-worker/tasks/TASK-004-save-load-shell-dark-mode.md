# TASK-004: Save / load wiring, template name, mode shell, dark mode
- Source: SPEC-001
- Status: DONE (2026-08-23, Sober — accepted at base `1d07fc8` + packet, round 2. Verdict,
  my own 141 assertions and note N6 in §Review "Round 2". Round 1's REWORK verdict is
  preserved above it. Six on-screen DoD boxes remain the human's acceptance check, §Review C.)
- Owner: Fern (FE)
- Depends on: TASK-002, TASK-003
- **Start from commit `097c045`** (answering TASK-002 Q-BE-8 — the start point is mine to
  name, not Jason's). That is the first state carrying TASK-003's canvas *and* TASK-002's
  five R1 validator rules. Do **not** start from `task-002-ipc-seam` (pinned at the
  round-1 commit, without the rules) and do not go by the branch name
  `task-002-ipc-seam-r1` — its tip has since moved to `1d07fc8`, a commit of the human's
  that adds two workflow shell scripts and touches no application file.

## What to do

Wire the designer to the IPC seam and finish the app shell, per **SPEC-001 §5**
(Save / Load / Modes / Dark mode) and §4 (the seam — call it, never extend it).

- Template name input in the toolbar bound to `templateName`.
- **Save control**: `disabled` whenever `templateName.trim() === ''`, with a visibly
  muted style, so it cannot be triggered at all and the native dialog never opens
  (REQ-001 Requirement 14 / A10). No warning text anywhere — the human explicitly
  chose the disabled control over a message, so adding a hint string is out of scope.
  When enabled it calls `window.api.saveTemplate(store.toTemplateFile(), {...})` with
  the §7 dialog strings and `defaultFileName = <templateName.trim()>.json`.
  **Corrected 2026-08-22 at review (R1, answering Q-FE-5)** — this line originally read
  `<templateName>.json` raw, and Fern implemented it verbatim, correctly. The save path
  must drop the padding: see §Review R1 and SPEC-001 §5 "Save".
- **Load control**: calls `window.api.openTemplate({...})`; `canceled` → no-op;
  `opened` → `parseTemplateFile(content)`; `ok` → `replaceAll(template)` (canvas size,
  template name, slots, selection cleared); `!ok` → show `error.fileUnreadable` and
  leave the current design untouched. `error` results map to `error.saveFailed` /
  `error.loadFailed`; log the English `detail`/`reason` to the console only.
  **`replaceAll` must run the parsed slots through `normalizeZIndex` before they enter
  the store.** `parseTemplateFile` deliberately accepts a file whose `zIndex` values are
  duplicated or non-contiguous — repairing that is the renderer's job, not the
  validator's (SPEC-001 §9 A-11 / §3 "What a loaded file must satisfy", answering
  TASK-002 Q-BE-6). Your existing `normalizeZIndex` already does exactly this; no new
  logic, just do not skip it on the load path.
  **`replaceAll` must also trim the names it stores** — `templateName: template.name.trim()`
  and each slot's `name: slot.name.trim()`. Same family as the line above and same reason:
  `parseTemplateFile` deliberately accepts a hand-edited file whose names are *padded*
  (`"  Slot 1  "`) because padding is repairable, and the repair is the renderer's job
  (SPEC-001 §3, §9 A-11; found at TASK-002's round-2 review, §Review N5 there). Without it
  a loaded slot sits in the store in a state §5's rename path can never produce. Trim only —
  blank names are already rejected by the validator, so a trim can never empty a name here.
- `src/store/uiStore.ts`: active mode + theme. Dark mode toggles the `dark` class on
  `<html>`, in-memory only.
- `src/components/AppShell.tsx`: top bar with the two mode entries — Layout Designer
  (active) and Use Template (visibly disabled + `mode.useTemplate.badge`, clicking
  does nothing, nothing crashes — A6) — plus the dark-mode toggle.
- **Window title.** Set `document.title = th['app.windowTitle']` from the renderer (a
  `useEffect` in `AppShell` is enough). This is the one §7 key no task used — my omission,
  found at TASK-003’s review (TASK-003 §Review N1) — and the window would otherwise ship
  titled `layout-pattern-app` in English. It must be the **renderer**, not `main.ts` and
  not `index.html`: SPEC-001 §1 keeps every user-facing string out of the main process.
- Every visible string from `src/i18n/th.ts` (SPEC-001 §7). No literal strings.

## The string table — read before starting
**All 27 keys of SPEC-001 §7 are APPROVED** verbatim by the human on 2026-08-22 — 26 via
REQ-001 Q9 (*"อนุมัติหมด"*) and the 27th, `error.blankSlotName`, via Q18. They are final
wording, checked at acceptance (A16); no key is `DRAFT` any more. Use every value verbatim from `src/i18n/th.ts` (created in TASK-003); do
not re-word, do not add a key the table does not have, and never bake a Thai string into
logic or a component. A later correction from the human must be a one-file change in
`src/i18n/th.ts`.

## Definition of Done

> Ticked by Sober at the 2026-08-22 review, from **his own** 201 assertions — not read
> off §Implementation Notes. A box is ticked only where the evidence is code or rendered
> markup; the six that need the app on screen stay unticked and are listed in §Review C
> as an acceptance check for the human. Boxes 12/13 are the review's own outcome.

- [x] With the template name empty the Save control is visibly disabled and clicking
      it does nothing — no dialog, no file, no message. Typing a name enables it;
      clearing it disables it again.
- [ ] Full round trip: 5 slots with different names, colours and stacking → save to a
      folder chosen in the dialog → close the app → reopen → load that file → the
      layout is identical (positions, sizes, names, colours, stacking order). Record
      the saved JSON in §Implementation Notes.
- [x] The saved JSON contains `name`, `canvasWidth`, `canvasHeight` and `slots[]` with
      `id`, `name`, `x`, `y`, `width`, `height`, `zIndex`, `color` (REQ-001 A2).
- [ ] Cancelling either dialog changes nothing.
- [ ] Choosing a non-template `.json` file shows `error.fileUnreadable` and leaves the
      current design untouched.
- [x] A hand-edited template file whose `zIndex` values are duplicated or non-contiguous
      (e.g. `0, 0, 5`) **loads successfully** and the slots come out with contiguous
      `0…n-1` in the same visual stacking order — `normalizeZIndex` on the load path.
      Record the file you used and the resulting order.
- [x] A hand-edited file with a **padded** template name and a padded slot name
      (e.g. `"  My Template  "` / `"  Slot 1  "`) loads, and both come into the store
      **trimmed** — the name input shows `My Template`, the slot list shows `Slot 1`.
      Record the file you used.
- [ ] Dark mode toggles and the whole UI stays readable in both themes (A4).
- [x] The Use Template entry is visible, marked unavailable, and clicking it does not
      crash (A6).
- [x] Every string the user sees is Thai except the default slot names (A7/A9).
- [ ] The window title reads the Thai `app.windowTitle`, not `layout-pattern-app`.
- [x] `npm run typecheck` passes. Nothing under `electron/` or `shared/` modified.
- [x] **Handed off uncommitted, per the hand-off packet of SPEC-001 §10.** — *Rewritten
      2026-08-22 now that REQ-001 Q23 is answered: **every git write is the human's** —
      no `git add`, no commit, no branch, no push, by any role. Read-only `git status` /
      `diff` / `log` / `rev-parse` stay allowed.* Leave the change in the working tree and
      record in §Implementation Notes: the base SHA, the `git status --porcelain` lines,
      and a SHA-256 fingerprint of each changed/untracked file. Fern did exactly this
      before the mechanism was written down; §Review B records the fingerprint of the
      round-1 tree.
- [x] **R1 (§Review) is implemented and the fingerprint re-recorded.** — ticked 2026-08-23
      by Sober; packet re-hashed by me, only the two R1 files moved (§Review "Round 2").

## Implementation Notes

Done 2026-08-22 by Fern. **Renderer only** — `git diff --name-only 097c045 -- electron shared`
is empty; nothing under `electron/`, `shared/`, `package.json` or any build config was touched,
and the IPC seam is called exactly as §4 declares it, never extended.

### Where I started from (read this before diffing)
The working tree was on `develop` at `1d07fc8`, not at `097c045`. I did **not** check `097c045`
out: `git diff --stat 097c045 1d07fc8 -- src shared electron index.html package.json
vite.config.ts tsconfig.json tailwind.config.js` prints **nothing** — `1d07fc8` adds only
`merge-workflow.sh` and `release-workflow.sh` — so the code I started from *is* `097c045`, byte
for byte, while the two workflow scripts stay in the human's tree. Checking the older SHA out
would have removed them from his working tree, and with REQ-001 Q23 open I would not touch
branches to do it. If you want the literal checkout instead, say so and I will redo it there.

### Files
| File | Change |
|------|--------|
| `src/store/uiStore.ts` | **new** — `mode` (`designer`/`useTemplate`) + `theme` (`light`/`dark`), in-memory only, plus `setMode`/`toggleTheme`. No persistence (none is requested). |
| `src/components/AppShell.tsx` | **new** — mode bar (Designer active; Use Template `disabled`+`aria-disabled` carrying `mode.useTemplate.badge`), dark-mode checkbox, and two effects: `document.title = th['app.windowTitle']` once, and `classList.toggle('dark')` on `<html>` whenever `theme` changes. The class touch lives here so the store stays a plain state container and exactly one place writes the DOM. |
| `src/components/Toolbar.tsx` | template-name input, Save, Load, and one `role="alert"` line for I/O errors. Save/Load call `window.api` and nothing else; the English `detail`/`reason` is `console.error`-ed, never rendered. |
| `src/App.tsx` | wraps the designer in `<AppShell>`; the designer body itself is unchanged. |
| `src/store/designerStore.ts` | `replaceAll` now stores `template.name.trim()` and `slot.name.trim()` (the N5 repair) on top of the `normalizeZIndex` it already ran. |

`window.api` needed no new type declaration: `electron/preload.ts` already carries
`declare global { interface Window { api: typeof api } }` and `tsconfig.json` compiles `src`,
`electron` and `shared` as one program.

### Verification — 50 assertions, 50 passed, plus typecheck and build
`npm run typecheck` → exit 0. `npm run build` → exit 0 (renderer 452.30 kB, plus `main.js` and
`preload.js`; no warning beyond the standing Vite CJS-API deprecation notice).

Two probes, bundled with the repo's own esbuild against the real modules and run in Node.
Scratch files outside the repo — nothing was added to the tree.

**Probe 1 — store / load path, 24/24.** Round trip: 5 slots, two renamed, one recoloured and
moved, one brought forward → `toTemplateFile()` → JSON → wipe the store to a fresh state (this
stands in for quit-and-relaunch) → `parseTemplateFile` → `replaceAll`. Canvas size, template
name, every slot field and the stacking order come back identical; geometry is integer-rounded;
selection is cleared. The saved JSON is recorded below.
- `zIndex 0, 0, 5` (hand-edited) → **accepted** by the validator, and comes out `0, 1, 2` in the
  same visual order `back, middle, front`.
- `"  My Template  "` / `"  Slot 1  "` → **accepted**, and land in the store as `"My Template"` /
  `"Slot 1"`; an unpadded sibling is untouched; a whitespace-only name is still rejected by the
  validator, so the trim can never empty a name.
- `{"hello":"world"}` → rejected, and `toTemplateFile()` is identical before and after.
- `canSave` predicate: `""`, `"   "`, `"\t\n"` → false; `"a"`, `"  a  "` → true.

**Probe 2 — rendered markup, 26/26** (`react-dom/server`; zustand v5 feeds SSR its *initial*
snapshot, so the harness repointed that at `getState` — done in the bundle, product code untouched).
- Save button: blank name → `disabled` + `opacity-60 … text-slate-400`; `"   "` → still
  `disabled`; a real name → neither; clearing it → `disabled` again. No `role="alert"` is
  rendered anywhere in the blank-name state (the human chose the disabled control, not a message).
- All six toolbar labels are `th` values. With tags stripped, the only Latin text in the toolbar
  is the two `px` that are part of the approved `ความกว้าง (px)` / `ความสูง (px)`; nothing outside
  the approved table. The shell's visible text has no Latin at all.
- Shell: both mode entries present; Use Template `disabled` + `aria-disabled` and carrying
  `ยังไม่พร้อมใช้งาน`; dark toggle labelled `โหมดมืด`, unchecked at `light`, checked at `dark`.

### What I could NOT verify — needs the app on screen
No DOM implementation is available here and I will not install one, so, plainly:
1. **The real save/load round trip through the native dialogs** (choose a folder, close the app,
   reopen, load) is **unverified**. What I verified is the same journey with the dialogs removed:
   serialise → JSON → fresh store → parse → `replaceAll`. The `window.api` call shapes are
   compile-checked against §4, nothing more.
2. **Cancelling either dialog** is unverified on screen; in code both paths return before any
   state is touched (`canceled` → bare `return`; save ignores every non-`error` status).
3. **`document.title`, the `dark` class on `<html>`, and dark-mode readability** are effects and
   pixels — asserted in code, not seen. Note the title flashes `layout-pattern-app` from
   `index.html` until React mounts; the SPEC puts that string in the renderer, so this is the cost
   of the rule, not something I can fix from `src/`.
4. **A6 "clicking does nothing"**: the button is `disabled`, so there is no handler to fire — but
   I have not clicked it in a running window.

### The saved JSON from the round trip (DoD box 2)
```json
{
  "formatVersion": 1,
  "name": "My Template",
  "canvasWidth": 1080,
  "canvasHeight": 1920,
  "slots": [
    { "id": "74fbec07-970f-4be1-8085-d57cfa00bddc", "name": "slot 2", "x": 12, "y": 22, "width": 334, "height": 444, "zIndex": 0, "color": "#123456" },
    { "id": "0c5bdfd5-c98a-41bb-bdea-a22b8420e240", "name": "Header", "x": 40, "y": 40, "width": 300, "height": 300, "zIndex": 1, "color": "#4f8ef7" },
    { "id": "8d4a3313-7b7f-4334-86c4-105b7f8372c0", "name": "slot 3", "x": 104, "y": 104, "width": 300, "height": 300, "zIndex": 2, "color": "#4fbf6f" },
    { "id": "f170e71b-299e-4c0b-b44c-9e428996f5ba", "name": "Footer", "x": 136, "y": 136, "width": 300, "height": 300, "zIndex": 3, "color": "#b14ff7" },
    { "id": "553c504d-379e-4ca9-9345-fb37b64e01af", "name": "slot 5", "x": 168, "y": 168, "width": 300, "height": 300, "zIndex": 4, "color": "#f7c94f" }
  ]
}
```

The two hand-edited files used for the zIndex box and the padding box:
```json
{"formatVersion":1,"name":"Z Test","canvasWidth":800,"canvasHeight":600,"slots":[
  {"id":"a","name":"back","x":0,"y":0,"width":100,"height":100,"zIndex":0,"color":"#111111"},
  {"id":"b","name":"middle","x":10,"y":10,"width":100,"height":100,"zIndex":0,"color":"#222222"},
  {"id":"c","name":"front","x":20,"y":20,"width":100,"height":100,"zIndex":5,"color":"#333333"}]}
```
```json
{"formatVersion":1,"name":"  My Template  ","canvasWidth":800,"canvasHeight":600,"slots":[
  {"id":"a","name":"  Slot 1  ","x":0,"y":0,"width":100,"height":100,"zIndex":0,"color":"#111111"},
  {"id":"b","name":"Slot 2","x":5,"y":5,"width":100,"height":100,"zIndex":1,"color":"#222222"}]}
```

### DoD boxes
Every box above the last is met **as far as this environment can show it** — see "What I could
NOT verify" for the four that need a human at the window. I left the boxes unticked for you to
tick at review. The last box (**Committed locally**) is untouched on purpose: it says so itself,
pending REQ-001 Q23. There is no commit, no `git add`, no new branch. The change sits in the
working tree of `develop`: `M src/App.tsx`, `M src/components/Toolbar.tsx`,
`M src/store/designerStore.ts`, `?? src/components/AppShell.tsx`, `?? src/store/uiStore.ts`.

### Round 2 — R1 (2026-08-23, Fern)

**R1 implemented exactly as §Review words it: 2 lines, both in files I had already changed.**
Nothing else moved — `setTemplateName` is untouched (option (d) stays ruled out), the input,
`canSave`, `replaceAll`, the seam, `electron/` and `shared/` are all untouched.

| File | Change |
|------|--------|
| `src/store/designerStore.ts` | `toTemplateFile()` returns `name: templateName.trim()` (was `templateName`), + a 2-line comment saying why the trim lives at this boundary. |
| `src/components/Toolbar.tsx` | `defaultFileName: ` `` `${templateName.trim()}.json` `` (was `${templateName}.json`). |

**Verification — 43 assertions, 43 passed, plus typecheck and build.**
`npm run typecheck` → exit 0. `npm run build` → exit 0 (renderer, `main.js`, `preload.js`; no new
warning). One probe, bundled with the repo's own esbuild against the real modules and run in Node;
scratch file outside the repo, nothing added to the tree.

The assertion §Review asked for, and its converse:
- **save → load → save is byte-identical** with a padded typed name — checked for
  `"  My Template  "`, `"\tPadded\n"`, `" a "` and the unpadded `"My Template"`. Also
  save→load→save→load→save, so the fixed point is reached on the *first* save, not eventually.
- The saved `name` is the trimmed value in every case; the app's own output re-parses.
- **The store still holds exactly what the user typed** (`"  My Template  "` stays padded in
  `templateName`), and typing `M`,`My`,`My `,`My T`,… keeps every intermediate value verbatim —
  a trailing space is still typeable, which is the failure mode (d) would have caused.
- `canSave`: `''`, `'   '`, `'\t\n'` → false; `'a'`, `'  a  '` → true. Unchanged.
- Round-1 behaviour R1 must not disturb, re-checked: `zIndex 0,0,5` accepted and repaired to
  `0,1,2` in the same visual order; the padded hand-edited file accepted and stored trimmed with
  its unpadded sibling untouched and selection cleared, and it too now reaches a fixed point after
  one round; whitespace-only template and slot names still rejected by the validator (so a trim
  can never empty a name); `{"hello":"world"}` rejected with the design byte-identical afterwards;
  all 8 A2 fields present and canvas size carried.

**Still not verified on screen, unchanged from round 1:** the real dialog round trip, dialog
cancel, `document.title`, the `dark` class and dark-mode readability, and the A6 click. R1 does not
touch any of them — it changes only the value handed to `saveTemplate`, not when or whether the
dialog opens. The six items stay as §Review C's acceptance check for the human.

**Hand-off packet (SPEC-001 §10) — re-recorded after R1:**

```
base 1d07fc8 ·  M src/App.tsx  M src/components/Toolbar.tsx  M src/store/designerStore.ts
                ?? src/components/AppShell.tsx  ?? src/store/uiStore.ts
sha256(16):  App.tsx 8cffd7e9304e142e · Toolbar.tsx 937a4eb441193ef0
             designerStore.ts 456cd58c15190d62 · AppShell.tsx 9ad09ef786f132dd
             uiStore.ts 0041466b55dfd7d2
```

Diffed against round 1's packet, **exactly the two R1 files moved** — `Toolbar.tsx`
`b811e6ed7ae53f98 → 937a4eb441193ef0`, `designerStore.ts` `26f8cbac47853dbb → 456cd58c15190d62`;
`App.tsx`, `AppShell.tsx` and `uiStore.ts` are byte-identical to what you reviewed. Base is still
`1d07fc8`, the change set is still the same five files, and
`git diff --name-only 1d07fc8 -- electron shared package.json vite.config.ts tsconfig.json
tsconfig.node.json tailwind.config.js index.html postcss.config.js` is empty. No git write of any
kind: no `git add`, no commit, no branch — the change sits in `develop`'s working tree.

I left the two round-2 DoD boxes unticked, same as round 1 — ticking is yours at review.

## Questions

**Q-FE-5 — does the *save* path trim the template name too? (non-blocking; I used the TASK's
literal wording)**
The load path now trims (N5), but the save path does not, and nothing trims `templateName` in the
store — `setTemplateName` keeps exactly what is typed. So if the user types `"  My Template  "`:
the saved file's `name` is padded, and `defaultFileName` is `"  My Template  .json"`, which
Windows silently rewrites. Reloading that same file then trims it, so the app quietly changes his
name for him one save later. I implemented the TASK line verbatim (`defaultFileName =
<templateName>.json`, raw) rather than guess the trim. Which do you want: (a) leave it as is,
(b) trim `defaultFileName` only, (c) trim in `toTemplateFile()` as well, or (d) trim in
`setTemplateName` so the store never holds a padded name? Only (d) also fixes what the input shows.

> answer (Sober, 2026-08-22): **none of (a)–(d) as you worded them — (b)+(c), and it is
> R1.** You were right to implement my line verbatim instead of guessing; the gap was mine.
>
> **(d) is wrong on technical grounds, so I am ruling it out explicitly** — `setTemplateName`
> fires on every keystroke, and a trim there makes a trailing space unkeepable: typing
> `My` `<space>` `Template` would store `My` then `MyTemplate`. The user could not type a
> two-word name at all. Do not do (d), and do not "fix" it with a commit-on-blur input
> either: the template-name field is a plain bound input in §5 and stays one.
>
> **(a) is wrong on correctness grounds**, which is the part your question found and I had
> missed: as shipped, save→load→save is **not idempotent**. Save writes `"  My Template  "`;
> load trims it to `"My Template"` (the N5 repair, which is right); saving again writes a
> *different* file for the same design. The app rewrites the user's name behind his back
> exactly once, which is the worst of both. That is a defect against SPEC-001 §5, not a
> preference — hence REWORK rather than a note.
>
> **So: trim at the boundary where the value leaves the app, both places.**
> `toTemplateFile()` returns `name: templateName.trim()`, and `defaultFileName` is
> `` `${templateName.trim()}.json` ``. The input keeps exactly what the user typed while
> he types; `canSave` is unchanged (it already trims); main's `INVALID_PAYLOAD` guard is
> unchanged. This is not new scope — it is the same rule the human already approved for
> *slot* names ("stored trimmed … only the casing is preserved verbatim, never the
> padding", §5 "Rename" / TASK-003 Q-FE-2) applied to the one name that escaped it.
> SPEC-001 §5 "Save" now states it. Porter has it as an FYI with a one-line veto.

**Q-FE-6 — placement and clearing of the three I/O messages (non-blocking; confirm or redirect)**
§5 fixes placement for the two rename warnings but says only "Thai message from §7" for
`error.saveFailed` / `error.loadFailed` / `error.fileUnreadable`. I followed the pattern you
already approved: one inline `role="alert"` line on its own row at the end of the toolbar,
cleared when the next save or load starts and when the template-name field is edited, transient
UI state only, never stored or saved. It is *not* cleared by canvas-size edits or by anything in
the canvas — say so if it should be.

> answer (Sober, 2026-08-22): **confirmed as shipped, change nothing.** One inline
> `role="alert"` line at the end of the toolbar, cleared when the next save or load starts
> and when the template-name field is edited, transient only — that is the same pattern
> §5 already fixes for the two rename warnings, and it is now written into SPEC-001 §5
> "Save" / "Load" so it stops being an unwritten precedent.
> On the one thing you flagged: **it is right that canvas-size edits and canvas actions do
> not clear it.** The message reports the outcome of the last file operation; resizing the
> canvas neither retries nor invalidates it, and a message that vanishes when the user
> touches something unrelated reads as a glitch. It clears on the next I/O attempt, which
> is the only event that can actually change the answer.

**Q-FE-7 — `src/components/UseTemplatePlaceholder.tsx` (SPEC §2) — I did not create it**
SPEC-001 §2 lists it in the repo layout, but §5 and this TASK make the Use Template entry
`disabled`, so `mode` can never become `useTemplate` and the component would be unreachable dead
code in REQ-001. I left it out and kept the `useTemplate` member in the `AppMode` union so the
shell stays honest about the second mode. Confirm, or tell me what it should render if you want
it to exist.

## Review

**Verdict: REWORK — 2026-08-22, Sober. Exactly one item, R1. Everything else is
accepted as shipped and does not need re-doing.**

The implementation is right, the scope is right and the evidence is honest — including
the four things you refused to claim. R1 exists because of a hole your own **Q-FE-5**
found in **my** TASK line, not because of a mistake in your code: I wrote
`defaultFileName = <templateName>.json` raw and you implemented it verbatim, which is
what you should have done.

### R1 — the save path must trim the template name (2 lines, `src/`, both in files you already changed)

Full reasoning is the answer to Q-FE-5 above. The change:

1. `src/store/designerStore.ts` → `toTemplateFile()` returns `name: templateName.trim()`.
2. `src/components/Toolbar.tsx` → `defaultFileName: ` `` `${templateName.trim()}.json` ``.

Nothing else moves: **do not** trim in `setTemplateName` (it would make a space
untypeable — see the answer), do not touch the input, `canSave`, `replaceAll`, the seam,
`electron/` or `shared/`. Add to §Implementation Notes one assertion that
save → load → save is byte-identical when the typed name is padded, and re-record the
§10 fingerprint for the two changed files.

### A — what I verified myself (201 assertions, 201 passed)

Re-run from the source, not read off your notes. `npm run typecheck` exit 0;
`npm run build` exit 0; `git diff --name-only 097c045 -- electron shared package.json
vite.config.ts tsconfig.json tsconfig.node.json tailwind.config.js index.html` empty and
no untracked file outside `src/` — the renderer-only claim holds.

| probe | what it pinned down | result |
|-------|--------------------|--------|
| String table | SPEC-001 §7's 27 rows parsed out of the SPEC and diffed key-by-key and value-by-value against `src/i18n/th.ts`: 27 keys both ways, zero value drift, no extra key. Then every file under `src/`, `shared/`, `electron/` and `index.html` scanned for Thai codepoints — present in `th.ts`, absent in all 15 others. | 100/100 |
| Store + load path | Round trip of 5 slots (two renamed, one recoloured and moved to fractional geometry, one brought forward) → `toTemplateFile()` → JSON → store wiped → `parseTemplateFile` → `replaceAll`, byte-identical back; all 8 A2 fields present and typed; geometry integer-rounded (12.4→12, 22.6→23); selection cleared. `zIndex 0,0,5` accepted by the validator and repaired to `0,1,2` in the same visual order (A-11). Padded name/slot-name accepted and stored trimmed, unpadded sibling untouched, whitespace-only name still rejected. Five bad files rejected with non-empty English reasons and the design byte-identical after each. | 62/62 |
| Rendered markup | Save button across `''`, `'   '`, `'\t\n'`, `'My Template'`, `'  x  '` and back to `''`: `disabled` exactly on the blank ones, muted styling only there, and **no `role="alert"` anywhere in the blank state** — the human chose the disabled control, not a message (A10). Six toolbar labels are `th` values; the only Latin word left after stripping tags is the `px` inside the two approved labels. Shell in both themes: both mode entries present, Use Template `disabled` + `aria-disabled` + badge, dark toggle labelled from `th` and checked iff `theme === 'dark'`, zero Latin visible text. | 39/39 |

Three judgement calls of yours I want on the record as **right**, not merely tolerated:
the `dark` class written in exactly one place (`AppShell`) with the store left a plain
state container; the English `detail`/`reason` logged and never rendered; and keeping
`useTemplate` in the `AppMode` union while refusing to build a component for it.

### B — the hand-off, and REQ-001 Q23

Q23 came back while you were working: **every git write is the human's** — no `git add`,
no commit, no branch, no push, by any role. You guessed nothing and left the tree alone,
which is exactly right, and your reasoning for not checking `097c045` out (it would have
dropped the human's two workflow scripts, and `git diff --stat` proves the app code is
identical) is accepted — no literal checkout is wanted.

Because there is no SHA to cite, I have written the replacement mechanism into
**SPEC-001 §10 "Hand-off without a commit"**; it binds every review from here. The
round-1 tree I reviewed, recorded per that section:

```
base 1d07fc8 ·  M src/App.tsx  M src/components/Toolbar.tsx  M src/store/designerStore.ts
                ?? src/components/AppShell.tsx  ?? src/store/uiStore.ts
sha256(16):  App.tsx 8cffd7e9304e142e · Toolbar.tsx b811e6ed7ae53f98
             designerStore.ts 26f8cbac47853dbb · AppShell.tsx 9ad09ef786f132dd
             uiStore.ts 0041466b55dfd7d2
```

### C — what nobody here can verify: acceptance check for the human (via Porter)

Not defects, and not yours to chase — no window exists in any of our sessions. Six DoD
boxes stay unticked until the human runs the app:

1. the real save round trip through the native dialogs — choose a folder, close the app,
   reopen, load the file, layout identical;
2. cancelling the save dialog and the open dialog changes nothing;
3. picking a non-template `.json` shows the Thai "unreadable file" line and leaves the
   design untouched;
4. dark mode toggles and the whole UI stays readable in both themes (A4);
5. the window title reads the Thai `app.windowTitle` (note: it flashes the English
   `layout-pattern-app` from `index.html` until React mounts — a consequence of §1
   keeping every string in the renderer, and worth one line to the human);
6. the Use Template entry is visibly unavailable and clicking it does nothing (A6).

---

### Round 2 — verdict: DONE (2026-08-23, Sober)

**Accepted at base `1d07fc8` + packet.** R1 is implemented exactly as written and nothing
else moved. Re-verified by me from the source, not read off §Implementation Notes:
**141 assertions, 141 passed**, `npm run typecheck` exit 0, `npm run build` exit 0.

**Packet re-hashed by me before reviewing** (SPEC-001 §10) — identical to the round-2
packet Fern recorded, and exactly the two R1 files moved since round 1:

```
base 1d07fc8 ·  M src/App.tsx  M src/components/Toolbar.tsx  M src/store/designerStore.ts
                ?? src/components/AppShell.tsx  ?? src/store/uiStore.ts
sha256(16):  App.tsx 8cffd7e9304e142e (=r1) · Toolbar.tsx 937a4eb441193ef0 (r1 b811e6ed7ae53f98)
             designerStore.ts 456cd58c15190d62 (r1 26f8cbac47853dbb)
             AppShell.tsx 9ad09ef786f132dd (=r1) · uiStore.ts 0041466b55dfd7d2 (=r1)
```

`git diff --name-only 1d07fc8` is the three tracked `src/` files and nothing else;
the only untracked files are the two `src/` ones. Renderer-only holds.

| probe | what it pinned down | result |
|-------|--------------------|--------|
| R1 + regression | Six typed names incl. `"  My Template  "`, `"\tPadded\n"`, `" a "`, a Thai one: the store keeps the typed value **verbatim**, the saved `name` is trimmed, the app's own output re-parses, and **save→load→save is byte-identical on the first save** (third round still identical, so it is a fixed point, not a convergence). `defaultFileName` unpadded in all six. `canSave` unchanged over six inputs. Typing `M`,`My`,`My `,`My T`,`My Te` keeps every intermediate verbatim — (d) stays ruled out. Round-1 behaviour re-checked: `zIndex 0,0,5` → `0,1,2` same visual order, selection cleared; padded file loads trimmed with the unpadded sibling untouched and reaches its fixed point in one round; whitespace-only template/slot names and two junk files rejected with non-empty reasons and the design byte-identical after; all 8 A2 fields present. | 82/82 |
| Toolbar markup | Save button over `''`, `'   '`, `'\t\n'`, `'My Template'`, `'  x  '`, back to `''`: `disabled` **and** the muted class exactly on the blank ones, no `role="alert"` in any blank state (A10 — the human chose the disabled control, not a message), six labels are `th` values, no stray Latin visible text. Harness canary included. | 30/30 |
| Shell markup, both themes | Both mode entries present; Use Template `disabled` + `aria-disabled` + badge and no click handler in markup (A6); designer entry enabled and `aria-current="page"`; dark toggle checked **iff** `theme === 'dark'`; dark palette classes present; children rendered; no stray Latin. Harness canary included. | 29/29 |

**N6 — a hole in my own round-1 evidence, found this round (no code defect).**
Round 1's "Rendered markup 39/39" row is **not** evidence for what it claimed. This project
is on **zustand 5.0.15**, whose `useStore` feeds `renderToStaticMarkup` from
`api.getInitialState()`, not `getState()` (`node_modules/zustand/react.js:11`). Under SSR a
zustand-connected component therefore renders the store's **initial** state and `setState` is
invisible — so every "I set the name to X and the button was disabled/enabled" assertion of
round 1 was really re-measuring the empty initial store. The conclusions happened to be right,
but they were unproven. Fix, used in both markup probes above: mutate the object returned by
`getInitialState()` in place, and start each probe with a **canary** assertion that the
rendered output actually moves when the harness sets state. Any future review that renders a
zustand component must do the same; a probe with no canary is not evidence.

**DoD boxes 12/13 are now both ticked**; the six on-screen boxes stay unticked and stay
§Review C's acceptance check for the human — R1 touches none of them, and no window exists in
any of our sessions. Nothing here is a defect and nothing is owed by Fern.

**Judgement calls of yours confirmed again as right:** the trim placed at the boundary
(`toTemplateFile`) rather than at the input, and the 2-line scope with a comment saying why.
