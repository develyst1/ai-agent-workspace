# TASK-005: Contract v2 + `image:pick` / `png:save` handlers + preload
- Source: SPEC-002
- Status: DONE
- Owner: **Jason (BE)**
- Depends on: none (starts from `e6faa0f`, verified clean — SPEC-002 §0)

## What to do

Three files, all on your side of the seam. **SPEC-002 §3 and §4 are the contract —
implement them literally; do not add a field, a channel or a result variant.**

### 1. `shared/contract.ts`

- `TEMPLATE_FORMAT_VERSION` → `2`; add `SUPPORTED_FORMAT_VERSIONS = [1, 2] as const`.
- `SlotData` gains **`required: boolean`** (non-optional — see below).
- Add `PickImagesOptions`, `PickedImage`, `PickImagesResult`, `SavePngOptions`,
  `SavePngResult` exactly as §4 writes them.
- `parseTemplateFile` changes in **two** places and nowhere else:
  - the `formatVersion` guard now accepts `undefined`, `1` or `2` and rejects anything
    else (`unsupported formatVersion: …`);
  - per slot: `required` **absent → `true`** in the parsed output (this is REQ-002
    Req 15c / B19, and it is why the field is non-optional downstream);
    **present and a boolean → used as-is; present and anything else → reject** with a
    reason in the existing style, e.g.
    `slots[i].required is present but not a boolean`.
  - Where in the per-slot order? Put the type check next to the other type checks (after
    `color`), and note that it can never be the *first* thing to fail on a v1 file
    because a v1 file simply has no such key.
- Everything else in the file — the §3 reject list, `nameKey`, the blank-before-duplicate
  order, `HEX_COLOR`, the returned shape — **stays byte-for-byte as it is**.

### 2. `electron/ipc/image.ts` (new)

`registerImageIpc()` exporting the two handlers of §4, written in the same style as
`electron/ipc/template.ts` (parent window from `event.sender`, all errors caught and
returned, no user-facing string, `detail` English only, nothing logged about user data).

- `image:pick` — dialog filter `['jpg', 'jpeg', 'png']`, `properties: ['openFile']` plus
  `'multiSelections'` when `opts.multiple`; cancel / empty → `canceled`; read each file
  with `fs.readFile` (no encoding), `mimeType` from the **extension only**, `fileName` =
  `path.basename`; preserve `filePaths` order; any throw → `READ_FAILED` with **nothing**
  returned (all-or-nothing, SPEC-002 B-4).
- `png:save` — `defaultPath = opts.defaultFileName`, filter `['png']`; cancel →
  `canceled`, nothing written; force the `.png` extension the way `forceJsonExtension`
  forces `.json`; **before writing**, guard that `bytes` is a `Uint8Array`, `length > 0`,
  and starts with `89 50 4E 47 0D 0A 1A 0A` → else `INVALID_PAYLOAD`, nothing written;
  any throw → `WRITE_FAILED`.

Register it wherever `registerTemplateIpc()` is registered in `electron/main.ts`.

### 3. `electron/preload.ts`

Add `pickImages` and `savePng` to the `api` object, forwarding to
`ipcRenderer.invoke('image:pick', …)` / `('png:save', …)`. Keep importing **types only**
from the shared contract. Do not touch the two existing methods.

## Constraints

- **Renderer files are Fern's — do not touch `src/`.** `designerStore.addSlot` will start
  writing `required` in TASK-006; until then the renderer will not typecheck against the
  new non-optional field, and **that is expected**: run `npm run typecheck` and report
  the `src/` errors it produces rather than fixing them. If that is intolerable for your
  workflow, say so in `## Questions` — do not "just add the field" in `src/`.
- No git write of any kind (SPEC-001 §10). Hand off uncommitted with a packet.
- `package.json` must not gain `"type": "module"`.

## Definition of Done

- [x] `shared/contract.ts` matches SPEC-002 §3 / §4; no channel, field or variant beyond it.
- [x] `parseTemplateFile`: a REQ-001-era file (no `formatVersion`, no `required`) parses,
      and **every** slot comes back `required: true`. Show the assertion.
- [x] `parseTemplateFile`: `formatVersion` `1` and `2` accepted; `0`, `3`, `"2"`, `null`
      rejected. Show the assertions.
- [x] `parseTemplateFile`: `required: false` round-trips as `false`; `required: "yes"`,
      `required: 1`, `required: null` are rejected with a non-empty English reason.
- [x] Every SPEC-001 §3 rejection still rejects (blank template name, blank slot name,
      duplicate id, duplicate name case-insensitively, non-positive width/height, bad
      colour, non-integer zIndex, junk JSON) — re-run them, do not assume.
- [x] `png:save` payload guard: empty array, a non-PNG byte string, and a valid PNG
      header each hit the right branch, and **no file is written** in the two bad cases.
- [x] `electron/ipc/image.ts` contains no Thai and no user-facing English string.
- [x] `npm run typecheck` — report the exit code and the full error list; `src/` errors
      caused by the new non-optional `required` are expected and must be **listed**, not
      fixed. `npm run build` likewise.
- [x] Hand-off packet recorded (SPEC-001 §10): base SHA, `git status --porcelain`,
      sha256(16) of every file in it. Nothing outside `electron/` and `shared/`.

## Implementation Notes

Done by Jason (BE), 2026-08-23, in the working tree at
`H:\layout-pattern-app\layout-pattern-app`, base `e6faa0f`, **uncommitted** —
no `git add`, no `git commit`, no branch, no push (SPEC-001 §10). Read-only git only.

**Files changed** — `shared/contract.ts`, `electron/preload.ts`, `electron/main.ts`
(two lines: the import and `registerImageIpc()` next to `registerTemplateIpc()`).
**File added** — `electron/ipc/image.ts`.
`git status --porcelain -- src/` is **empty**: nothing of Fern's was touched, and no
`src/` file was "fixed" to make the new non-optional field compile.
`package.json` is unchanged and still has no `"type"` key.

### What the contract change actually is

`git diff -U1 -- shared/contract.ts` is **five hunks and nothing else**: the version
constant + `SUPPORTED_FORMAT_VERSIONS`, `SlotData.required`, the five new §4 types, the
`formatVersion` guard, and the two per-slot lines (`required` destructured + type-checked
after `color`, and filled in as `true` when absent on the `parsedSlots.push`). `nameKey`,
`HEX_COLOR`, the reject list, the blank-before-duplicate order and the returned shape are
untouched. The guard is written as
`!(SUPPORTED_FORMAT_VERSIONS as readonly unknown[]).includes(formatVersion)` so the
accepted set is the exported constant itself, not a second copy of `[1, 2]`.

`electron/ipc/image.ts` follows `ipc/template.ts` line for line: same `errorDetail`,
same `parentWindow(event.sender)` with the owner-less fallback, same "the payload guard
runs *before* `showSaveDialog`" placement as `isSaveablePayload`, same `forceJsonExtension`
shape for `forcePngExtension`. Type-only import from the contract, so nothing of it is
bundled into main at runtime beyond the two channel strings.

**Three things worth the reviewer's eye, none of them a deviation:**

- **N1 — `parseTemplateFile` normalises `formatVersion` to `2` on the way out**, because
  the returned shape (`formatVersion: TEMPLATE_FORMAT_VERSION`) was left byte-for-byte as
  the TASK instructs and that constant is now `2`. Consequence: open a v1 file, save it,
  and it is written as v2 with every `required: true` — which is exactly what SPEC-002 §3
  says the file now is. Asserted (`parsed formatVersion normalised to 2`).
- **N2 — `fs.readFile` with no encoding returns a `Buffer`**, which *is* a `Uint8Array`,
  so it satisfies `PickedImage.bytes` with no copy and typechecks under `strict`. It
  arrives in the renderer as a plain `Uint8Array` after the structured clone. Asserted
  both ways (`bytes is a Uint8Array` → `Buffer` in main; bytes byte-identical to the file).
- **N3 — `mimeTypeFromExtension` is a two-way branch**: `.png` → `image/png`, everything
  else → `image/jpeg`. `PickedImage.mimeType` has exactly two members and §4 names exactly
  two mappings, so there is no third value to return; see **Q-BE-1** for the one input
  §4 does not name.

### Verification

All of it re-run on the current tree; nothing below is quoted from an earlier round.

**1. `npm run typecheck` → exit 2, and the *entire* error list is one line:**

```
src/store/designerStore.ts(128,13): error TS2741: Property 'required' is missing in type
'{ id: `${string}-…`; name: string; x: number; y: number; width: number; height: number;
zIndex: number; color: "#4f8ef7" | … | "#7f8c9a"; }' but required in type 'SlotData'.
```

That is `designerStore.addSlot`, exactly the one the TASK predicted, and it is
**left unfixed** — it is TASK-006's line. `tsc -p tsconfig.json` emits **1** line total.

**2. `npm run build` → exit 2**, failing at the same `typecheck` step (the script is
`typecheck && vite build`), same single error. Run past it, `npx vite build` → **exit 0**:
renderer 230 modules; `dist-electron/main.js` **3 modules** (main + ipc/template +
ipc/image, 3.77 kB); `dist-electron/preload.js` 0.35 kB.

**3. The BE side alone typechecks clean.** With the repo's own compiler options
(`strict`, `noUnusedLocals`, `noUnusedParameters`) over `electron/` + `shared/` only:
`tsc --noEmit` → **exit 0, zero errors**. So the single error above is a renderer-side
consequence and not a defect in what this TASK delivers.

**4. Emitted preload surface** — read out of the built `dist-electron/preload.js`, four
methods and four channels, the two REQ-001 ones unchanged:

```js
exposeInMainWorld("api", { saveTemplate, openTemplate, pickImages, savePng })
// channels found in dist-electron/main.js: image:pick, png:save, template:open, template:save
```

**5. `parseTemplateFile` — 68 assertions, 68 passed, 0 failed** (`shared/contract.ts`
compiled by the repo's own esbuild and driven from node; harness in the session
scratchpad, nothing written into the repo). Headlines:

```
ok | TEMPLATE_FORMAT_VERSION === 2                          | 2
ok | SUPPORTED_FORMAT_VERSIONS === [1,2]                     | [1,2]
ok | v1 file (no formatVersion, no required), 3 slots        | parses
ok | EVERY slot comes back required:true                     | [true,true,true]
ok | parsed formatVersion normalised to 2                    | 2
ok | formatVersion absent / 1 / 2                            | accepted
ok | formatVersion 0 / 3 / "2" / null / 1.5 / true           | unsupported formatVersion: 0 | 3 | "2" | null | 1.5 | true
ok | required:false round-trips as false                     | false
ok | mixed (absent / false / true)                           | [true,false,true]
ok | required:"yes" | 1 | 0 | null | {} | []                 | slots[0].required is present but not a boolean
ok | reason names the right index                            | slots[1].required is present but not a boolean
ok | required check sits AFTER colour                        | slots[0].color is not a #rrggbb hex colour
ok | parsed slot keys                                        | id,name,x,y,width,height,zIndex,color,required
ok | parsed template keys                                    | formatVersion,name,canvasWidth,canvasHeight,slots
```

Every SPEC-001 §3 rejection was **re-run, not assumed** — 26 of them, each with the
reason it returned, all unchanged in wording: junk JSON, root not an object, name
missing / not a string / blank, `canvasWidth` 0 / 1080.5, `canvasHeight` -1, slots
missing / not an array, slot not an object, id / name / x / y / width / height wrong
type, `zIndex` 0.5 and `"0"`, colour `"blue"` and `#fff`, blank slot name, width 0 and
-5, height 0, duplicate id, duplicate name `slot 1` vs `  SLOT 1  `. Two order
invariants re-checked: the blank slot name is still reported **before** the
duplicate-name check, and the duplicate-name reason still starts
`duplicate slot name (compared trimmed, case-insensitively):`. Still accepted, unchanged:
empty slots array, upper-case colour, negative x/y/zIndex, float width, and a slot name
with padding kept **verbatim** (the parser still does not trim — that repair is the
renderer's, SPEC-002 §6).

**6. `electron/ipc/image.ts` handlers — 49 assertions, 49 passed, 0 failed.** The real
source, compiled by the repo's own esbuild, with the `electron` module replaced by a stub
that records every call: **no Electron process was started and no native dialog was ever
opened**, and every file written went into the session scratchpad, never the repo.

```
ok | exactly two channels registered                    | ["image:pick","png:save"]
ok | single-pick properties                             | ["openFile"]
ok | multiple:true properties                           | ["openFile","multiSelections"]
ok | filters                                            | [{name:<fileTypeLabel>,extensions:["jpg","jpeg","png"]}]
ok | canceled dialog / empty filePaths                  | {"status":"canceled"}
ok | 3 files -> picked, filePaths order preserved       | c.jpeg,a.png,b.JPG
ok | mimeType from the extension only                   | image/jpeg,image/png,image/jpeg  (.JPG counted as jpeg)
ok | fileName = basename, filePath = full path, bytes byte-identical to the file
ok | PickedImage keys                                   | ["filePath","fileName","mimeType","bytes"]
ok | B-4 all-or-nothing: 1 of 3 unreadable              | {"status":"error","code":"READ_FAILED"}, images === undefined
ok | a throwing dialog                                  | READ_FAILED, never a rejected promise
```

`png:save`, nine bad payloads — empty `Uint8Array`, JPEG magic, a plain string, a plain
`number[]` holding the right bytes, an `ArrayBuffer`, `null`, `undefined`, seven bytes of
the signature, and the signature with one byte wrong — **all nine → `INVALID_PAYLOAD`**,
and afterwards: **`showSaveDialog` was called 0 times and the work directory still held
exactly the 3 files it started with.** Then cancel → `canceled` and still nothing
written; `filePath: ''` → `canceled`; a valid PNG → `saved` with the file on disk
byte-identical to the payload, `defaultPath` = `opts.defaultFileName`, filter
`[{name:<fileTypeLabel>,extensions:["png"]}]`. Extension forcing matches `.json`'s rule:
`…/stripped` → `…/stripped.png` (and `…/stripped` does **not** exist), `UPPER.PNG` is
left alone, `a.b.jpg` → `a.b.jpg.png`. `WRITE_FAILED` on an unwritable path and on a
throwing dialog — neither handler ever rejects across the bridge.

**7. No user-facing string, no Thai — 7 assertions, 7 passed.** Zero Thai characters in
`image.ts`, `preload.ts`, `main.ts`, `contract.ts`. With comments stripped, every string
literal in `image.ts` is a module id, an indexed-access type key, a channel, a file
extension, a MIME type, a dialog flag, a result status or a machine code — **exactly one**
free-text literal exists in the whole file:

```
'bytes must be a non-empty Uint8Array starting with the PNG signature'
```

and it appears only as the `detail:` of `INVALID_PAYLOAD` — English, developer-facing,
never rendered (SPEC-002 §4).

### Hand-off packet (SPEC-001 §10)

- **Base** — `git rev-parse --short HEAD` → **`e6faa0f`**. No git write of any kind.
- **Change set** — `git status --porcelain`, verbatim:

```
 M electron/main.ts
 M electron/preload.ts
 M shared/contract.ts
?? electron/ipc/image.ts
```

  Nothing outside `electron/` and `shared/`. (`dist/` and `dist-electron/` are rebuilt
  by the build but are in `.gitignore`, so they are not in the set.)

- **Fingerprint** — sha256, first 16 hex:

```
e583d45667f5573b  electron/main.ts
18098f7457f77fe5  electron/preload.ts
db5a1813a4e09bc8  shared/contract.ts
776bc9fc56439ab2  electron/ipc/image.ts
```

## Questions

*(Jason asks as `Q-BE-n`; Sober answers as `> answer: ...`.)*

**Q-BE-1 — non-blocking, a one-line ruling. What `mimeType` should a picked file get
when its extension is neither `.png` nor `.jpg`/`.jpeg`?**

SPEC-002 §4 names exactly two mappings and `PickedImage.mimeType` has exactly two
members, so there is no third value I could return without extending the contract. The
input is still reachable: on Windows and macOS the user can type a full filename into an
Open dialog and get a file whose extension is outside the `['jpg','jpeg','png']` filter.

I implemented the **literal** two-way branch — `.png` → `image/png`, **everything else**
→ `image/jpeg` — because it adds no field, no code and no result variant, and because
§4 already defines what happens next: a file that lies about its extension "fails to
decode in the renderer and shows `error.photoUnreadable`", which is precisely where an
`.gif` labelled `image/jpeg` lands. I did **not** invent a `READ_FAILED` for it, as that
would be behaviour §4 does not describe.

If you want it the other way (refuse a non-jpg/jpeg/png extension in main), that is a
one-line change in `mimeTypeFromExtension` plus a line in §4 — say so and I will do it in
rework. **Nothing is blocked on this**: no other DoD item depends on the answer.

> **answer (Sober, 2026-08-23): keep exactly what you wrote — the literal two-way branch
> stays, no rework.** Your reasoning is right and I am making it a rule rather than a
> tolerated accident: **main never decides whether a file is a usable image.** SPEC-002 §4
> already says main does not sniff or decode, and an *extension* cannot decide it either —
> a GIF renamed `photo.png` would pass any extension test you could write. So the extension
> maps to a MIME type and nothing more, and `image/jpeg` stays the default arm.
>
> Ruling on the substance rather than only the label, because your question exposed a real
> hole in **my** §4 and not in your code — written up as **N-SA-2 / SA call B-10** in
> §Review below, and now carried by SPEC-002 §6 and TASK-008. Short version: `mimeType`
> is a *hint to the renderer's `Blob`*, not a gate, so Req 11 ("JPG/PNG only") has to be
> enforced where the bytes are, by their first bytes. That is Fern's line, not yours.
> **Nothing in TASK-005 changes.**

**Not a question, just so it is on the record and not mistaken for silence:** the TASK's
"if that is intolerable for your workflow, say so" escape hatch was **not** needed. The
single `src/` typecheck error is tolerable — I verified `electron/` + `shared/` separately
at zero errors (Verification 3), so the seam is provably clean without touching Fern's file.

## Review

**Verdict: DONE** — Sober (SA), 2026-08-23, accepted at base `e6faa0f` + the packet below.
No rework. Every number here is **my own**, re-measured on the tree as it stands; nothing
is taken from §Implementation Notes.

### A. The packet is what it says it is

`git rev-parse --short HEAD` → `e6faa0f`. `git status --porcelain` is exactly the four
lines Jason recorded — `M electron/main.ts`, `M electron/preload.ts`, `M shared/contract.ts`,
`?? electron/ipc/image.ts` — and **nothing under `src/`**, so Fern's side is untouched and
no file was "fixed" to make the new non-optional field compile. I recomputed all four
sha256(16) and they match his line for line (`e583d45667f5573b`, `18098f7457f77fe5`,
`db5a1813a4e09bc8`, `776bc9fc56439ab2`). `package.json` is unmodified and still has no
`"type"` key. Read-only git only; no git write by me.

### B. Compilation

- `tsc --noEmit -p tsconfig.json` → **exit 2, one line**, and it is the predicted
  `src/store/designerStore.ts(128,13) TS2741: Property 'required' is missing … but required
  in type 'SlotData'`. Left unfixed, correctly — that line is TASK-006's.
- `tsc --noEmit -p tsconfig.node.json` → **exit 0**. Worth stating because `npm run
  typecheck` chains the two with `&&`, so the first failure hides the second config; I ran
  it separately rather than assume it.
- `electron/` + `shared/` alone, under the repo's own options (`strict`, `noUnusedLocals`,
  `noUnusedParameters`, same `@types`) → **exit 0**. So the one error is a renderer-side
  consequence, not a defect in what this TASK delivers.
- `npx vite build` → **exit 0**: renderer 452 kB, `dist-electron/main.js` 3 modules /
  3.77 kB, `dist-electron/preload.js` 0.35 kB.
- **Emitted preload surface**, read out of the built file, not out of the source: exactly
  four methods (`saveTemplate`, `openTemplate`, `pickImages`, `savePng`) and exactly four
  channels in `main.js` (`template:save`, `template:open`, `image:pick`, `png:save`). No
  fifth channel leaked in.

### C. Behaviour — my own harness, **120 assertions, 120 passed, 0 failed**

Built from the real sources compiled by the repo's own esbuild, run from node. For the
handlers, `electron` is replaced by a recording stub: **no Electron process was started,
no native dialog was ever opened**, and every byte written went into the session
scratchpad — the repo's own tree is byte-identical afterwards (`git status` unchanged).

**N6 discipline honoured** (the hole I found in my own TASK-004 round-1 evidence): the
handler harness opens with a **canary** — a deliberately false assertion — and asserts
that the counter recorded the failure, so a harness that silently cannot fail is ruled out
before any real assertion runs.

**`parseTemplateFile` — 65/65.** `TEMPLATE_FORMAT_VERSION === 2`,
`SUPPORTED_FORMAT_VERSIONS === [1,2]`. A REQ-001-era file (no `formatVersion`, no
`required`, 3 slots) parses and **every** slot comes back `required: true`; key order is
`id,name,x,y,width,height,zIndex,color,required` and the template's is
`formatVersion,name,canvasWidth,canvasHeight,slots`. `formatVersion` absent/1/2 accepted;
`0`, `3`, `1.5`, `-1`, `"2"`, `null`, `true`, `[2]` all rejected with
`unsupported formatVersion: …`. `required` `false`/`true` round-trip; mixed
absent/false/true → `[true,false,true]`; `"yes"`, `1`, `0`, `null`, `{}`, `[]` each rejected
with `slots[i].required is present but not a boolean` and the reason names the right index.
Ordering: `color` is still reported before `required`, and the type check still runs before
the blank-name and duplicate rules. **All 28 SPEC-001 §3 rejections re-run, not assumed**
— junk JSON, root array/null, template name missing/non-string/blank, `canvasWidth` 0 and
1080.5, `canvasHeight` -1, slots missing/not-an-array, slot not an object, id/name/x/y/
width/height wrong type, `zIndex` 0.5 and `"0"`, colour `blue` and `#fff`, blank slot name,
width 0 and -5, height 0, duplicate id, duplicate name case-insensitively — every reason
non-empty and unchanged in wording, the blank name still reported **before** the duplicate
check, and the duplicate-name reason still prefixed `duplicate slot name (compared trimmed,
case-insensitively):`. Still accepted, unchanged: empty slots array, upper-case colour,
negative x/y/zIndex, float width, and a slot name kept **verbatim** with its padding (the
parser still does not trim — that repair stays the renderer's, SPEC-002 §6).

**`image:pick` / `png:save` — 55/55** (54 + the canary). Two channels registered and no
more. Single pick → `properties: ["openFile"]`; `multiple: true` → `["openFile",
"multiSelections"]`; filter is `[{name: <fileTypeLabel>, extensions: ["jpg","jpeg","png"]}]`
and the title is passed straight through. Parent-window path and the owner-less 1-arg
fallback both exercised. Cancel and an empty `filePaths` both → `canceled`. Three real
files → `picked` with `filePaths` order preserved (`c.jpeg,a.png,b.JPG`), `mimeType` from
the extension only (`.JPG` counted as jpeg), `fileName` = basename, `filePath` the full
path, `bytes` byte-identical to the file and an actual `Uint8Array`, keys exactly
`filePath,fileName,mimeType,bytes`. **B-4 all-or-nothing**: one unreadable file among three
→ `READ_FAILED` with a non-empty English `detail` and `images === undefined`; a throwing
dialog → `READ_FAILED` and **never** a rejected promise. `png:save`: all nine bad payloads
(empty `Uint8Array`, JPEG magic, a string, a `number[]` holding the right bytes, an
`ArrayBuffer`, `null`, `undefined`, seven bytes of the signature, the signature with one
byte wrong) → `INVALID_PAYLOAD`, and afterwards **`showSaveDialog` had been called 0 times
and the work directory held exactly the files it started with** — the guard genuinely runs
before the dialog, so a refused payload never even prompts. Cancel → `canceled`, nothing
written; `filePath: ''` → `canceled`. Happy path → `saved`, file byte-identical to the
payload, `defaultPath` = `opts.defaultFileName`, filter `[{name: <fileTypeLabel>,
extensions: ["png"]}]`. Extension forcing matches `.json`'s rule exactly: `…/stripped` →
`…/stripped.png` **and the extension-less path was never created**, `UPPER.PNG` left alone,
`a.b.jpg` → `a.b.jpg.png`. `WRITE_FAILED` on an unwritable directory and on a throwing
dialog; neither handler ever rejects across the bridge.

**No user-facing string — 4 Thai scans + 3 literal assertions.** Zero Thai characters in
`image.ts`, `preload.ts`, `main.ts`, `contract.ts`. With comments stripped, every string
literal in `image.ts` is a module id, an indexed-access type key, a channel, an extension,
a MIME type, a dialog flag, a result status or a machine code — **exactly one** free-text
literal exists, `'bytes must be a non-empty Uint8Array starting with the PNG signature'`,
and it occurs exactly once, as the `detail:` of `INVALID_PAYLOAD`. English,
developer-facing, never rendered. Correct per SPEC-002 §4.

### D. The three notes Jason flagged — all accepted

- **N1 (a v1 file re-saves as v2)** is not a side effect to tolerate, it is SPEC-002 §3
  working: the parser's job is to hand every consumer a v2-shaped template, and the app
  then owns one shape. Asserted (`v1 normalised formatVersion 2`). The human's own
  templates keep loading; they simply become v2 the next time he saves one. **No task.**
- **N2 (`fs.readFile` → `Buffer`, which *is* a `Uint8Array`)** — right, and the zero-copy
  is the point. See N-SA-1 for the one half of this that nobody in the team can prove.
- **N3 (two-way `mimeTypeFromExtension`)** — correct as written; the ruling is in
  §Questions Q-BE-1 and its consequence is N-SA-2 below.

### E. N-SA-1 — the one thing this review could NOT verify, and who must

`PickedImage.bytes` crosses **two** boundaries the harness cannot simulate: main → preload
over `ipcRenderer.invoke`, then preload → renderer through `contextBridge`. The same is
true in reverse for `savePng(bytes, …)`, where a mis-cloned array would land on
`isPngPayload` and come back `INVALID_PAYLOAD` — i.e. **export would fail 100% of the time
and look like a payload bug**. Nothing in this TASK is wrong; it is simply not provable
without a running Electron window, and no role here has one. Recorded so it is a named
check rather than an assumption:

- **TASK-008** must confirm, first thing on the photo path, that `bytes` arrives in the
  renderer as a real `Uint8Array` (`instanceof`, and `length` equal to the file's size).
- **TASK-009** must confirm the outbound direction reaches `png:save` intact — i.e. the
  first real export returns `saved` and not `INVALID_PAYLOAD`.

If either fails, it is a **seam** problem: it comes to me as a `## Questions` entry, and
neither engineer changes the contract to work around it.

### F. N-SA-2 / SA call B-10 — a hole in my §4 that Q-BE-1 uncovered (not a defect here)

SPEC-002 §4 says a file that lies about its extension "fails to decode in the renderer".
**That sentence is wrong**, and Jason's question is what made me check it: browsers pick an
image decoder by sniffing the bytes, not by the `Blob`'s declared type, so a real GIF or
WebP reached through the Open dialog (the filter is a filter, not a lock — a user can type
a filename) would decode happily and be composed into the exported PNG. That contradicts
**REQ-002 Req 11 (JPG/PNG only)**, and an extension test in main cannot fix it either,
since a GIF renamed `photo.png` defeats it.

**Ruling (SA call B-10):** Req 11 is enforced **once, on the bytes, in the renderer**,
immediately before decoding — the first bytes must be the JPEG marker `FF D8 FF` or the PNG
signature `89 50 4E 47 0D 0A 1A 0A`; anything else takes the existing decode-failure path
(`error.photoUnreadable`, already drafted in §7, wording already right: *"ไฟล์รูปนี้ใช้งาน
ไม่ได้"*). **No new channel, no new result variant, no new Thai string, and no change to
this TASK.** Req 11 is about what the file *is*, not what it is called, so a genuine JPEG
named `.gif` is accepted — that is the deliberate half of the call. Carried into
**SPEC-002 §6 "Decoding"** and **TASK-008** (its own DoD line); §4's misleading sentence now
points here.
