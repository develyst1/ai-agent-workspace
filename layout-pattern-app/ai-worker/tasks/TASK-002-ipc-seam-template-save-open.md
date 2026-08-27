# TASK-002: IPC seam — shared contract, preload API, save/open handlers
- Source: SPEC-001
- Status: DONE (accepted 2026-08-22 by Sober at `097c045` — see §Review “Round 2”)
- Owner: Jason (BE)
- Depends on: TASK-001

## What to do

Implement the seam exactly as written in **SPEC-001 §4** (types, channel names,
result shapes) and the file format in **SPEC-001 §3**. The contract is Sober's; copy
it, do not redesign it. If something is missing, ask in §Questions — do not add a
channel or a field on your own.

- `shared/contract.ts` — the types verbatim from SPEC-001 §4, plus
  `parseTemplateFile(raw: string): ParseResult`, a **pure** function (no `fs`, no
  Electron import) that:
  - `JSON.parse`s the text and rejects anything that is not an object;
  - accepts `formatVersion === 1` or absent, rejects any other value;
  - requires `name: string`, `canvasWidth`/`canvasHeight` as positive integers,
    `slots` an array whose every item has `id`, `name` strings, numeric `x`, `y`,
    `width`, `height`, integer `zIndex`, and `color` matching `/^#[0-9a-f]{6}$/i`;
  - rejects duplicate slot `name` values inside one file, compared **trimmed and
    case-insensitively** (`name.trim().toLowerCase()`), so `slot 1` and `Slot 1` count
    as the same name — SPEC-001 §9 A-6, updated 2026-08-22 after the human vetoed the
    case-sensitive reading. REQ-001 A8 must survive a hand-edited file too;
  - on success returns the parsed `TemplateFile`, on failure `{ ok: false, reason }`
    with a short **English** reason (developer-facing, never rendered).
- `electron/ipc/template.ts` — `ipcMain.handle('template:save', …)` and
  `ipcMain.handle('template:open', …)` per SPEC-001 §4: native dialogs built from the
  caller-supplied `dialogTitle` / `fileTypeLabel` / `defaultFileName`, `.json`
  extension forced on save, UTF-8 + 2-space JSON on write, raw text returned on open,
  `INVALID_PAYLOAD` guard on empty/blank `template.name`, every failure returned as
  the `error` variant. Registered from `electron/main.ts`.
- `electron/preload.ts` — `contextBridge.exposeInMainWorld('api', …)` exposing exactly
  `saveTemplate` and `openTemplate`; plus the `Window` interface augmentation so the
  renderer is typed.

**No Thai strings**: every user-facing string arrives as a parameter from the renderer.
Main-side `detail` / `reason` values stay English.

**One housekeeping line carried over from TASK-001 §Review N1** (instructed here so it
is not a drive-by edit): in `README.md` → Prerequisites, the clause *"and its
postinstall step fails on older Node"* is wrong for Electron 43 — it has no
`postinstall` script; the Node floor comes from its `engines` field alone. Reword that
one clause, change nothing else in the README, and mention it in §Implementation Notes.

## Definition of Done
- [x] `npm run typecheck` passes; no `any` in `shared/contract.ts`.
- [x] Manual check, recorded in §Implementation Notes with the actual output: from the
      renderer devtools console, `await window.api.saveTemplate({formatVersion:1,name:'t',canvasWidth:1080,canvasHeight:1920,slots:[]},{dialogTitle:'save',fileTypeLabel:'json',defaultFileName:'t.json'})`
      → picking a folder writes a readable 2-space-indented JSON file and returns
      `{status:'saved', filePath}`; pressing Cancel returns `{status:'canceled'}`.
- [x] Same for `window.api.openTemplate({dialogTitle:'open',fileTypeLabel:'json'})`:
      the file written above comes back as `{status:'opened', content}` and
      `parseTemplateFile(content).ok === true`; Cancel returns `{status:'canceled'}`.
- [x] Sending a payload whose `name` is `''` returns `INVALID_PAYLOAD` and writes no file.
- [x] `parseTemplateFile` rejects: non-JSON text, `formatVersion: 2`, a missing
      `slots` array, a bad colour value, and two slots whose names differ only by case
      (e.g. `slot 1` / `Slot 1` — they must be rejected as duplicates) (list the
      reasons you got).
- [x] No renderer file under `src/` was touched (that is Fern's).
- [x] Committed locally; **no `git push`**.

**Rework round 1 — added 2026-08-22 by Jason per §Review R2.** Only the
`parseTemplateFile` box above grows; the rest stand (R1 touches no main-process code).

- [x] `parseTemplateFile` also rejects, with the reason each returned: a blank/whitespace
      template `name`, a blank/whitespace slot `name` (reported as blank, **not** as a
      duplicate, even when two blanks are present), two slots sharing an `id`, a slot
      `width` not `> 0`, and a slot `height` not `> 0`.
- [x] A file whose `zIndex` values are duplicated (`0,0,0`) or non-contiguous
      (`7,-3,99`) is still **accepted** — specified behaviour (SPEC-001 §3, §9 A-11);
      the renderer re-indexes it in TASK-004.

## Implementation Notes

Done by Jason (BE), 2026-08-22, branch `task-002-ipc-seam` off the accepted
TASK-001 commit `bae3f6c`. Commit `4cdec64`, **local only — not pushed**. Repo:
`H:\layout-pattern-app\layout-pattern-app`.

**Files added** — `shared/contract.ts`, `electron/ipc/template.ts`.
**Files changed** — `electron/preload.ts` (was a comment-only stub),
`electron/main.ts` (two lines: the import and `registerTemplateIpc()` inside
`app.whenReady()`, before the first window), `README.md` (the one clause below).
Nothing under `src/` was touched — `git status --short -- src/` is empty.

**The contract is copied, not redesigned.** `shared/contract.ts` holds SPEC-001 §4
verbatim plus `parseTemplateFile`; it imports nothing at all, so it is pure on both
sides. Its only non-exported additions are local helpers (`isRecord`, `isNumber`,
`isPositiveInteger`, `nameKey`, the `HEX_COLOR` regex) — no extra export, no extra
channel, no extra field. **No `any` anywhere in the file** (input is walked as
`unknown` through type guards; the built-in narrowing is what produces `SlotData`).
Main imports the contract **type-only**, so nothing of it is bundled into the
sandboxed preload at runtime, and main never calls `parseTemplateFile` — validation
exists exactly once, on the renderer side, as §4 requires.

**Case-insensitive duplicate names (§9 A-6)** are implemented as
`name.trim().toLowerCase()` in one place (`nameKey`), used by the `Set` that walks
the slot array.

### Verification

`npm run typecheck` → exit 0. `npm run build` → exit 0 (renderer 31 modules;
`dist-electron/main.js` 2 modules = main + ipc/template; `dist-electron/preload.js`
0.23 kB). Built preload is CJS and its whole surface is
`exposeInMainWorld("api", {saveTemplate, openTemplate})` — checked in the emitted file.

**Live checks were run against the built app**, not a mock: `npx electron . --remote-debugging-port=9222`
(production path — `dist/index.html`, real preload, `sandbox: true`), driving
`window.api` in the renderer over CDP `Runtime.evaluate` — the same thing as typing
into the devtools console — and dismissing the real native dialogs from the keyboard.
Actual output:

```
typeof window.api       : object
Object.keys(window.api) : ["saveTemplate","openTemplate"]

[1] saveTemplate, name:"" -> {"status":"error","code":"INVALID_PAYLOAD",
      "detail":"template.name must be a non-empty string and template.slots must be an array"}
[2] saveTemplate, accepted -> {"status":"saved","filePath":"…\scratchpad\t-saved.json"}
[3] saveTemplate, Escape   -> {"status":"canceled"}
[4] openTemplate, accepted -> {"status":"opened","filePath":"…\scratchpad\t-saved.json", content:}
      {
        "formatVersion": 1,
        "name": "t",
        "canvasWidth": 1080,
        "canvasHeight": 1920,
        "slots": []
      }
      parseTemplateFile(content).ok: true
[5] openTemplate, Escape   -> {"status":"canceled"}
```

[1] wrote no file and showed no dialog (the guard runs before `showSaveDialog`).
Extra check beyond the DoD: saving with the extension deleted from the file-name
field returned `filePath` ending in `.json`, and `od -c` on the result shows no BOM,
LF endings and 2-space indent. Files were written into the session scratchpad, never
into the repo; the Electron process was stopped afterwards (0 left running).

`parseTemplateFile`, run on the real source compiled with the repo's own esbuild —
every DoD rejection plus five more, with the reason each returned:

```
ok:true  | valid file                        | slots=1
ok:true  | formatVersion absent              | slots=0
ok:true  | upper-case colour #4F8EF7         | slots=1
ok:false | non-JSON text                     | not valid JSON: Unexpected token 'h', …
ok:false | formatVersion: 2                  | unsupported formatVersion: 2
ok:false | missing slots array               | slots is missing or not an array
ok:false | bad colour "blue"                 | slots[0].color is not a #rrggbb hex colour
ok:false | "slot 1" + "Slot 1"               | duplicate slot name (compared trimmed, case-insensitively): "Slot 1"
ok:false | "slot 1" + "  SLOT 1  "           | duplicate slot name (compared trimmed, case-insensitively): "  SLOT 1  "
ok:false | root is an array                  | root value is not a JSON object
ok:false | canvasWidth 0                     | canvasWidth is not a positive integer
ok:false | zIndex 1.5                        | slots[0].zIndex is not an integer
ok:false | slot name is a number             | slots[0].name is not a string
```

### README

One clause only, as instructed (TASK-001 §Review N1): *"the Electron installer
declares `engines.node >= 22.12.0` and its postinstall step fails on older Node"* →
*"the Electron package declares `engines.node >= 22.12.0`, and on older Node its
tooling fails when the binary is fetched"*. Nothing else in the README changed.

### For review

- **One byte I had to choose** — see Q-BE-7: the written file ends with a trailing
  newline. Everything else about the format is SPEC-001 §3 to the letter.
- Save dialog is parented to the calling `BrowserWindow` (`BrowserWindow.fromWebContents`)
  so it is window-modal; if the sender has no window it falls back to the parentless
  form. That is an implementation detail of "show a save dialog", not a contract change.
- Channel names are `const`s local to `preload.ts` and `ipc/template.ts` rather than
  shared exports, because §4 lists exactly what `shared/contract.ts` exports and I did
  not want to widen it. Say the word if you would rather they live in the contract.

### Rework round 1 — R1 + R2 (Jason, 2026-08-22)

Commit `097c045`, **local only — not pushed**. Branch `task-002-ipc-seam-r1`, cut from
`77673af` (the accepted TASK-003 tip) rather than from `4cdec64`, so the chain stays
linear and Fern inherits the new rules when he branches for TASK-004 — see **Q-BE-8**;
`task-002-ipc-seam` is left at `4cdec64` as the commit you reviewed.

**One file changed, +27 lines, nothing removed**: `shared/contract.ts`.
`git diff --stat 77673af` → `shared/contract.ts | 27 +++`. Nothing under `src/`,
nothing in `electron/`, no channel, no type, no result shape, no main-side behaviour —
so the live `window.api` transcript above still stands unchanged, as you said it would.

**R1, the five rules**, all inside `parseTemplateFile`:

| # | Rule | `reason` returned |
|---|------|-------------------|
| 1 | template `name` blank after trim | `name is blank or whitespace-only` |
| 2 | slot `name` blank after trim | `slots[i].name is blank or whitespace-only` |
| 3 | duplicate slot `id`, exact compare | `duplicate slot id: "<id>"` |
| 4 | slot `width` not `> 0` | `slots[i].width is not greater than 0` |
| 5 | slot `height` not `> 0` | `slots[i].height is not greater than 0` |

Rule 2 sits **before** the duplicate-name check (verified by a vector with two blank
names — it reports blank, not collision). Rule 3 uses a second `Set` keyed on the raw
`id` — no `nameKey`, no trimming, no case folding, as ruled. Rules 4/5 are separate
`<= 0` guards after the existing `isNumber` guards, so the original "is not a number"
reasons are unchanged; `0.5 x 0.5` is accepted (§5's 20x20 floor is deliberately not
enforced here). `zIndex` untouched.

**Verification.** `npm run typecheck` → exit 0. `npm run build` → exit 0.
`grep -nE "\bany\b|console\." shared/contract.ts electron/ipc/template.ts electron/preload.ts electron/main.ts`
→ no match. `git diff --stat 77673af -- src/` → empty.

`parseTemplateFile` re-run on the real source compiled with the repo's own esbuild —
**22 vectors, 22 pass, 0 fail**. The five new rejections (9 vectors, incl. both signs of
width/height and both blank forms), the blank-before-duplicate ordering, the two
zIndex acceptances of R2, all five original DoD rejections re-checked for regression,
and five acceptances:

```
PASS | ok:false | template name blank ("   ")        | name is blank or whitespace-only
PASS | ok:false | template name empty ("")           | name is blank or whitespace-only
PASS | ok:false | slot name blank ("  ")             | slots[0].name is blank or whitespace-only
PASS | ok:false | slot name empty ("")               | slots[0].name is blank or whitespace-only
PASS | ok:false | two slots share an id              | duplicate slot id: "b1f0a0d2-0000-4000-8000-000000000001"
PASS | ok:false | slot width 0                       | slots[0].width is not greater than 0
PASS | ok:false | slot width -300                    | slots[0].width is not greater than 0
PASS | ok:false | slot height 0                      | slots[0].height is not greater than 0
PASS | ok:false | slot height -10                    | slots[0].height is not greater than 0
PASS | ok:false | two blank names -> blank, not dup  | slots[0].name is blank or whitespace-only
PASS | ok:true  | zIndex duplicated (0,0,0)          | slots=3
PASS | ok:true  | zIndex non-contiguous (7,-3,99)    | slots=3
PASS | ok:false | non-JSON text                      | not valid JSON: Unexpected token 'h', …
PASS | ok:false | formatVersion: 2                   | unsupported formatVersion: 2
PASS | ok:false | missing slots array                | slots is missing or not an array
PASS | ok:false | bad colour "blue"                  | slots[0].color is not a #rrggbb hex colour
PASS | ok:false | "slot 1" + "Slot 1"                | duplicate slot name (compared trimmed, case-insensitively): "Slot 1"
PASS | ok:true  | valid file                         | slots=1
PASS | ok:true  | formatVersion absent               | slots=0
PASS | ok:true  | upper-case colour #4F8EF7          | slots=1
PASS | ok:true  | two distinct names + ids           | slots=2
PASS | ok:true  | width/height 0.5 (positive)        | slots=1

22/22 assertions pass, 0 fail
```

The harness and the compiled copy live in the session scratchpad, never in the repo.
Nothing irreversible was run: no install, no `git push`, no file written outside the
repo and the scratchpad.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

**Q-BE-8 → Sober — non-blocking, no code in it; a branch decision that is yours, not
mine.** TASK-001's rework landed as a second commit on that task's own branch, which
worked because it was still the tip. This time it is not: the chain is
`bae3f6c → 4cdec64 (TASK-002) → 77673af (TASK-003, accepted)`, and `task-002-ipc-seam`
sits two commits behind. Putting R1 there would have left the tip Fern branches from
**without** the five new rules — exactly what your review says must not happen before
TASK-004's load path. So I cut `task-002-ipc-seam-r1` from `77673af` and committed
`097c045` there; `task-002-ipc-seam` still points at the `4cdec64` you reviewed.

Two things this does **not** decide, and I did not decide them myself:

1. whether the rework commit should instead have gone on `task-002-ipc-seam` and been
   merged forward by you — one `git cherry-pick` either way, no code change;
2. **which branch Fern is told to start TASK-004 from.** The board's TASK-004 row does
   not name one, and naming it for him would be engineer-to-engineer coordination, so
   it is yours to write into the TASK. Today the only branch carrying both TASK-003 and
   this rework is `task-002-ipc-seam-r1`.

Nothing in the repo is irreversible: no push, no merge, no branch deleted or moved.

> answer (Sober, 2026-08-22): **your branch call was right — keep it exactly as it is.**
>
> 1. **Where R1 landed.** Cutting `task-002-ipc-seam-r1` from `77673af` was the correct
>    reading of my own review: the rules had to be on the tip Fern branches from, and
>    leaving `task-002-ipc-seam` pinned at `4cdec64` keeps the commit I reviewed in round 1
>    readable as evidence. Nothing to cherry-pick, nothing to move. This is the pattern I
>    want from here on when a task's branch is no longer the tip.
> 2. **TASK-004's start point is mine, and I have written it into TASK-004 §What to do:**
>    the tree of **`097c045`** — the first state that carries TASK-003's canvas *and* R1's
>    five rules. Fern reads it there; you do not tell him, I do. Correct instinct.
> 3. **One thing neither of us controls, flagged so it is not a surprise:** the branch
>    `task-002-ipc-seam-r1` no longer points at `097c045`. Its tip is now `1d07fc8`
>    ("Add merge and release workflow scripts", author `dev <develyst1@hotmail.com>`,
>    2026-08-22 23:11), which adds `merge-workflow.sh` and `release-workflow.sh` and is
>    pushed to `origin`. That is the human's own commit, not a team commit, and it touches
>    no application file — `git diff 097c045 1d07fc8 -- shared/ electron/ src/` is empty —
>    so the tree Fern needs is unchanged. I anchor the review at the SHA `097c045`, not at
>    a branch name, for exactly this reason. No action for you.
> 4. **Whether Fern may commit at all is now an open question, not yours or mine to
>    settle** — the human's standing rule routed in at 23:14 (REQ-001 §Constraints / Q23)
>    says he does the commits from now on. TASK-004's last DoD box still says "Committed
>    locally"; I have marked that one box as pending Q23 rather than rewrite it on a guess.
>    Routed to Porter in today's log.

**Q-BE-6 → Sober — non-blocking, nothing waits on it; shipped on the literal reading.**
Three checks that SPEC-001 §3 arguably implies but TASK-002's validator list does not
mention. I implemented the list as written — i.e. all three are **accepted** today —
rather than inventing stricter validation:

1. a slot whose `name` is `""` or whitespace-only in a hand-edited file is accepted
   (§5 forbids blank names in the *rename UI*; §3 does not say the file rejects one).
   Note two blank names in one file *are* rejected, as duplicates of each other;
2. two slots with the same `id` are accepted (§3 says `id` is "unique inside a file");
3. `zIndex` values are not required to be contiguous `0…n-1` (§3 says they are, but a
   hand-edited file may not be, and re-normalising is the renderer's job, not the
   validator's).

If any of these should reject, it is a one-line change each in `parseTemplateFile`
plus a DoD line — but each also decides what Fern's load path must survive, so it is
your call, not mine.

> answer (Sober, 2026-08-22): right question, and you were right to ship the list as
> written rather than invent strictness. My ruling, now SPEC-001 §9 **A-11** with the
> full list in §3 "What a loaded file must satisfy":
>
> **The line is:** `parseTemplateFile` rejects a file that breaks an invariant the app's
> own UI can never produce, and accepts anything the renderer can safely repair.
>
> 1. **Blank slot name → REJECT.** §5 refuses exactly that rename (A15). Accepting it on
>    load hands Fern a slot in a state the UI declares impossible, and he would have to
>    invent what to do with it. Check it **before** the duplicate check, same order as §5,
>    so a blank name never reports as a collision.
> 2. **Duplicate slot `id` → REJECT.** §3 already states `id` is unique inside a file, and
>    the store keys selection, patch and delete by `id` — a duplicate silently acts on the
>    wrong slot. Exact string comparison (ids are UUIDs; no trimming, no case folding).
> 3. **Non-contiguous / duplicated `zIndex` → ACCEPT, no validator change.** Your reading
>    is the one I want: re-normalising is the renderer's job. Fern's store already has
>    `normalizeZIndex` (`src/store/designerStore.ts` — sorts ascending, reassigns `0…n-1`,
>    stable sort so equal values keep array order), and I have added the load-path line to
>    TASK-004's DoD. §3's "contiguous" now says explicitly that it describes what we
>    *write*, not a precondition of what we *read*.
>
> Two more I found while reviewing, same family, same round (they were not in your
> question and not in the TASK's list, so they are my gap, not yours):
>
> 4. **Blank / whitespace-only *template* `name` → REJECT.** Your own main-side guard
>    refuses to *write* one (`INVALID_PAYLOAD`) and A10 disables Save — so accepting one
>    on load produces a template that can never be saved again. A dead end, not a quirk.
> 5. **Slot `width` or `height` not `> 0` → REJECT.** Zero is invisible and unselectable;
>    negative draws mirrored in Konva. To be explicit: **do not** enforce §5's 20x20 floor
>    here — that is a Transformer interaction limit, not a file invariant.
>
> All five are inside `parseTemplateFile` and change no channel, no type and no result
> shape, so the seam itself is untouched.

**Q-BE-7 answer.**

> answer (Sober, 2026-08-22): **approved — keep the trailing newline.** It is the right
> default, it round-trips through `parseTemplateFile` unchanged, and it makes the file
> behave in a text editor and in `git diff`. It is no longer an unwritten byte: SPEC-001
> §3 now states it, so nobody has to re-derive it. Nothing to change in your code.

**Note on the channel-name `const`s (your §For review bullet).**

> answer (Sober, 2026-08-22): leave them where they are. Both literals live in files you
> own, the renderer only ever sees `window.api`, and §4 lists exactly what
> `shared/contract.ts` exports. If a third caller ever appears, promoting them to the
> contract is a SPEC change I make then — not something to churn now. The window-modal
> parent on the dialogs is likewise an implementation detail of "show a dialog"; keep it.

**Q-BE-7 → Sober — non-blocking, one byte.** SPEC-001 §3 pins UTF-8, 2-space indent
and the `.json` extension, but says nothing about a trailing newline. I write one
(`JSON.stringify(t, null, 2) + "\n"`), the POSIX convention, and it round-trips
through `parseTemplateFile` unchanged. Vetoing it is one character in
`electron/ipc/template.ts`.

## Review

Reviewed by Sober (SA), 2026-08-22, against commit `4cdec64` (branch `task-002-ipc-seam`).

**Verdict: REWORK — one round, five validator rules and two DoD lines.**

Read this before anything else: **the code you delivered is correct.** I found no defect
in it against TASK-002 and SPEC-001 §4 as they were written, and the seam itself —
channels, types, result shapes, preload surface — is accepted as-is and is **not** what
this round changes. The rework exists because my answer to your own **Q-BE-6** tightens
`parseTemplateFile`, and it has to land before Fern writes the load path in TASK-004,
which depends on this task. Same shape as TASK-001 R1: accepted work, one small
instructed change, straight back to REVIEW.

### What I verified myself, not on trust

- **Contract vs SPEC-001 §4** — `shared/contract.ts` exports exactly the nine §4 names
  (`TEMPLATE_FORMAT_VERSION`, `SlotData`, `TemplateFile`, `SaveDialogOptions`,
  `OpenDialogOptions`, `SaveTemplateResult`, `OpenTemplateResult`, `ParseResult`,
  `parseTemplateFile`) and nothing else; the helpers are non-exported. No extra channel,
  field or variant anywhere in the three files.
- **`git grep -nE "\bany\b|console\." 4cdec64 -- shared/contract.ts electron/ipc/template.ts electron/preload.ts electron/main.ts`**
  → no match. No `any`, and §4's "never `console.log` user data" holds by construction.
- **`git diff --stat bae3f6c 4cdec64`** → 5 files, none under `src/`. Fern's tree is clean.
- **`npm run typecheck`** → exit 0. Run at `77673af`, which carries your three files
  byte-identical, so it covers them.
- **`parseTemplateFile` re-run independently** — I compiled `4cdec64`'s
  `shared/contract.ts` with the repo's own esbuild into a scratch dir and drove **26
  vectors of my own**, not your list. All five DoD rejections reproduce with the reasons
  you recorded, both case-folding vectors reject, and a `__proto__` key in the root does
  not pollute `Object.prototype` (the parsed slots are rebuilt field by field — good).
  The five acceptances of R1 below are exactly what that run surfaced.
- **The `Window` augmentation in `preload.ts` actually reaches the renderer** —
  `tsconfig.json` includes `src`, `electron` and `shared` in one program, so Fern's
  `window.api` is typed in TASK-004. I checked this specifically: a preload-only
  augmentation would have broken that task silently, at his end, not yours.

### R1 — five rules to add to `parseTemplateFile`

Rationale for each is in §Questions under the Q-BE-6 answer; the ruling is SPEC-001 §9
**A-11** and the list is SPEC-001 §3 "What a loaded file must satisfy". Reject when:

1. the template `name` is blank or whitespace-only after trim;
2. a slot `name` is blank or whitespace-only after trim — checked **before** the existing
   duplicate-name check, so a blank never reports as a collision;
3. two slots share an `id` (exact string comparison — no trim, no case folding);
4. a slot `width` is not `> 0`;
5. a slot `height` is not `> 0`.

`reason` stays English and developer-facing, in the style you already use. **Nothing else
changes**: no channel, no type, no result shape, no main-side behaviour, and `zIndex` is
deliberately left alone (Q-BE-6.3 — the renderer normalises).

### R2 — two DoD lines

Add one line covering the five new rejections (list the reason each returned, as you did
for the first five), and one line asserting that a file whose `zIndex` values are
duplicated or non-contiguous is still **accepted** — that acceptance is now specified
behaviour, so it should be pinned by a check rather than left as a side effect.

The existing DoD boxes are all satisfied and do not need re-running, except the
`parseTemplateFile` box, which grows the new cases. Re-run `npm run typecheck`; the live
`window.api` transcript stands — R1 touches no main-process code.

### Notes, not rework

- **N1 — trailing newline (Q-BE-7): approved and now written into SPEC-001 §3.** No code
  change; it just stops being an unwritten byte.
- **N2 — channel-name `const`s stay local.** Answered in §Questions. Not a defect; if a
  third caller appears, promoting them to the contract is a SPEC change I make then.
- **N3 — window-modal parent on both dialogs: keep it.** Agreed that it is an
  implementation detail of "show a dialog", not a contract change.
- **N4 — for the record, not for you:** `isSaveablePayload` is a type predicate that
  promises `TemplateFile` from two checks. That is what §4 asks for (defence in depth
  behind a disabled button) and full validation deliberately lives once, on the renderer
  side — so it is correct here. I record it only so a future reader does not "fix" it.

---

## Round 2 — reviewed by Sober (SA), 2026-08-22, against commit `097c045`

**Verdict: DONE. Accepted, no further rework.** R1's five rules and R2's two DoD lines
are in, correct, and correctly ordered; the seam is unchanged, so round 1's acceptance
of channels, types, result shapes and the preload surface carries forward intact.
TASK-002 is closed.

### What I verified myself, not off your evidence

Anchored at the **SHA `097c045`**, not at the branch name (see §Questions Q-BE-8.3 —
the branch tip has since moved to a commit of the human's).

- **Diff is one file, additions only.** `git diff --stat 77673af 097c045` →
  `shared/contract.ts | 27 +++`, and `git diff 77673af 097c045 -- . ':(exclude)shared/contract.ts'`
  is **empty**: no channel, no type, no result shape, no main-process line, nothing under
  `src/`. That is why the round-1 live `window.api` transcript still stands and I did not
  ask you to re-run it.
- **Export surface unchanged** — still exactly the nine §4 names, helpers still
  non-exported (`seenIds` is a local `const`, not a tenth export).
- **`npm run typecheck` → exit 0. `npm run build` → exit 0.** Both run by me on the
  working tree, which is byte-identical to `097c045` for `shared/`, `electron/` and `src/`.
- **Built preload surface re-read from the emitted file**:
  `contextBridge.exposeInMainWorld("api", {saveTemplate, openTemplate})` — two methods,
  nothing else, `sandbox` path intact.
- **`git grep -nE "\bany\b|console\." 097c045 -- shared/contract.ts electron/ipc/template.ts electron/preload.ts electron/main.ts`**
  → no match.
- **`parseTemplateFile` re-run independently on 45 vectors of my own** (not your 22): I
  compiled `097c045`'s `shared/contract.ts` with the repo's own esbuild into the session
  scratchpad and drove it. **45/45 pass, 0 fail.** Repo left clean (`git status --short`
  empty; nothing written into it).

What those 45 establish beyond your list, all confirming the specified behaviour:

| Probe | Result |
|-------|--------|
| Template name `"\t\n "` and U+3000 (ideographic space) | rejected as blank — `trim()` covers non-ASCII whitespace |
| Blank slot name at index 1 after a valid slot | reports `slots[1].name is blank`, correct index |
| Blank name *and* a real duplicate in one file | reports blank, not the collision — the R1 ordering holds |
| Slot ids differing only by case (`AB` / `ab`) or padding (`ab` / `" ab "`) | **accepted** — exact compare, as ruled; no `nameKey` leakage |
| Two empty-string ids | rejected as duplicate ids |
| `width: -0` | rejected (`-0 <= 0` is true) |
| `width: 19`, `width: 1e-9`, `0.5 x 0.5` | accepted — §5's 20x20 floor correctly **not** enforced |
| `width: "300"` / `null` | still the original "is not a number" reason — no regression |
| `zIndex` `0,0,0` and `7,-3,99` | accepted, values passed through untouched for `normalizeZIndex` |
| `formatVersion` `null` and `"1"` (string) | rejected — the guard is not loose |
| `__proto__` in the root; extra fields on root and on a slot | no prototype pollution, extra fields dropped — slots rebuilt field by field |

`isNumber` rejects `NaN`/`Infinity` before the new `<= 0` guards, so the guards cannot be
reached with a non-finite value — the ordering is safe as written, not by luck.

### Notes, not rework

- **N5 — a gap of mine, and it belongs to TASK-004, not to you.** A hand-edited file may
  carry a *padded* name (`"  Slot 1  "`, `"  My Template  "`). It is accepted today and
  stored untrimmed. That is the **right** call for the validator — §5 stores rename input
  trimmed, so padding is repairable, and A-11 says the renderer repairs what it can — but
  nothing repairs it yet: `replaceAll` in `src/store/designerStore.ts` trims neither the
  template name nor the slot names on the load path. I have added the trim line and a DoD
  box to **TASK-004**, next to the `normalizeZIndex` line, and stated it in SPEC-001 §3.
  **No change to `parseTemplateFile`, no change for you.**
- **N6 — round 1's N1–N4 all stand** (trailing newline, local channel `const`s,
  window-modal dialog parent, `isSaveablePayload`). Nothing in R1 disturbed them.
